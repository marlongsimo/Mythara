/*
 * Mythara Echtzeit – der Spielserver. Er rechnet die Partie (20 Schritte je Sekunde) und schickt Zustände.
 * Der Client schickt nur Eingaben. Jede Verbindung bekommt ihre eigene Partie: den Riss (PvE) oder einen Kampagnenkampf.
 *
 * Kampagnenkämpfe (?kampf=<karte>&ort=<ort>): Der Spieler muss angemeldet sein. Die erste Nachricht ist {t:"anmeldung", token}; der Server prüft das Token
 * bei Supabase, liest die Stufen der Helden und rechnet den Kampf. Erfahrung und Seelensplitter zählt allein der Server; beim Verlassen des Kampfes
 * (Nachricht {t:"verlassen"} oder Trennung) schreibt er sie über rpg_echtzeit_gutschrift (Migration 035) gut und schickt {t:"gutschrift", ep, seelen} zurück.
 *
 * Geheime Schlüssel gehören ausschließlich in die Umgebung dieses Servers (SUPABASE_SERVICE_KEY), nie in den Browser.
 */
import { createServer } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { TICK, ZUSTAND_JE, PROTOKOLL, HELDEN, K, setzeStaerke, STAERKE, HELDENSTUFE, HELDENEP, stufeAusEp } from "../../shared/config";
import { Sim, Eingabe } from "../../shared/sim";
import { setzeKarte, karteNehmen, GRUNDKARTE } from "../../shared/karte";
import { KARTEN, FEIN, darfKaempfen, ORTSTUFE } from "../../shared/karten";

const PORT = Number(process.env.PORT) || 8787, MAX = Number(process.env.MAX_SPIELER) || 40, RUHE_MS = 5 * 60 * 1000;
/* Von welchen Seiten aus verbunden werden darf (Komma-getrennt). Leer = alle, nur für Tests gedacht. */
const HERKUNFT = (process.env.ERLAUBTE_HERKUNFT || "https://mythara-dungeon.de,http://localhost:8765").split(",").map((s) => s.trim()).filter(Boolean);
const SB_URL = (process.env.SUPABASE_URL || "").replace(/\/$/, ""), SB_KEY = process.env.SUPABASE_SERVICE_KEY || "";
/* Stufe der Aufgabe je Ort – wie im Client (kampagne.ts) */

interface Platz { ws: WebSocket; sim: Sim | null; zuletzt: number; fenster: number; zahl: number; kampf?: { karte: string; ort: string; team: string[]; nutzer: string; ep: number; fertig: boolean; gesiegt: boolean };
  /* Koop: beim Anführer die Mitspieler, beim Mitspieler der Platz des Anführers und die Kennung seines Helden */ mit?: Set<Platz>; haupt?: Platz; heldId?: number; raum?: string }
const plaetze = new Set<Platz>();
/* ---------- Koop-Gruppen: nur im Arbeitsspeicher, über einen Code aus sechs Buchstaben. Der Anführer spielt die Kampagne, bis zu zwei Mitspieler kommen in seine Kämpfe. ---------- */
interface Warter { ws: WebSocket; nutzer: string; name: string; held: string }
interface Raum { code: string; fuehrer: string; fuehrerName: string; warten: Set<Warter>; kampf: Platz | null; zuletzt: number }
const raeume = new Map<string, Raum>();
const CODE = /^[A-Z]{6}$/;
function gruppeMelden(R: Raum) { const m = JSON.stringify({ t: "gruppe", code: R.code, fuehrer: R.fuehrerName, mitglieder: [...R.warten].map((w) => ({ name: w.name, held: w.held, fuehrer: w.nutzer === R.fuehrer })), kampf: R.kampf && R.kampf.kampf ? { ort: R.kampf.kampf.ort, karte: R.kampf.kampf.karte } : null });
  for (const w of R.warten) if (w.ws.readyState === WebSocket.OPEN) w.ws.send(m); }
/** Der Sim des Anführers sagt: hier geht es los – die wartenden Mitspieler kommen nach */
function losMelden(R: Raum, ort: string, karte: string) { for (const w of R.warten) if (w.nutzer !== R.fuehrer && w.ws.readyState === WebSocket.OPEN) w.ws.send(JSON.stringify({ t: "los", ort, kampf: karte })); gruppeMelden(R); }
setInterval(() => { const jetzt = Date.now(); for (const [c, R] of raeume) if (!R.warten.size && !R.kampf && jetzt - R.zuletzt > 30 * 60 * 1000) raeume.delete(c); }, 60000);

/* ---------- Supabase (nur mit dem geheimen Schlüssel aus der Umgebung) ---------- */
async function sb(pfad: string, init: RequestInit = {}): Promise<unknown> {
  const r = await fetch(SB_URL + pfad, { ...init, headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, "content-type": "application/json", ...(init.headers || {}) } /* der Geheimschlüssel in beiden Köpfen: nur so arbeitet die Datenbank mit Server-Rechten (sonst als „anon“) */, signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error("Supabase " + r.status + " " + (await r.text()).slice(0, 200)); return r.status === 204 ? null : r.json();
}
/** Wer ist angemeldet? Prüft das Token des Spielers bei Supabase. Gäste (anonyme Anmeldung) zählen nicht. */
async function nutzerAus(token: string): Promise<string | null> {
  if (!/^[A-Za-z0-9._-]{20,4000}$/.test(token)) return null;
  const r = await fetch(SB_URL + "/auth/v1/user", { headers: { apikey: SB_KEY, Authorization: "Bearer " + token }, signal: AbortSignal.timeout(8000) });
  if (!r.ok) return null; const u = (await r.json()) as { id?: string; is_anonymous?: boolean }; return u.id && !u.is_anonymous ? u.id : null;
}
async function epLesen(nutzer: string): Promise<Record<string, number>> {
  const z = (await sb(`/rest/v1/rpg_echtzeit_werte?user_id=eq.${nutzer}&select=ep`)) as { ep: Record<string, number> }[]; return (z[0] && z[0].ep) || {};
}
async function siegeLesen(nutzer: string): Promise<Set<string>> {
  const z = (await sb(`/rest/v1/rpg_echtzeit_siege?user_id=eq.${nutzer}&select=ort,kampf`)) as { ort: string; kampf: string }[]; return new Set(z.map((q) => q.ort + "/" + q.kampf));
}
/** Sieg eintragen, sobald alle Gegner besiegt sind (einmal je Kampf) */
async function siegEintragen(p: Platz): Promise<void> { const k = p.kampf; if (!k || k.gesiegt) return; k.gesiegt = true;
  try { await sb("/rest/v1/rpc/rpg_echtzeit_sieg", { method: "POST", body: JSON.stringify({ p_user: k.nutzer, p_ort: k.ort, p_kampf: k.karte }) }); if (p.ws.readyState === WebSocket.OPEN) p.ws.send(JSON.stringify({ t: "sieg", ort: k.ort, kampf: k.karte })); }
  catch (e) { console.error("Sieg nicht eingetragen:", (e as Error).message); k.gesiegt = false; /* beim nächsten Schritt noch einmal */ } }
async function gutschreiben(p: Platz): Promise<void> {
  const sim = p.sim || (p.haupt && p.haupt.sim), k = p.kampf; if (!k || k.fertig || !sim) return; k.fertig = true; const seelen = sim.splitter;
  if (!k.ep && !seelen) { if (p.ws.readyState === WebSocket.OPEN) p.ws.send(JSON.stringify({ t: "gutschrift", leer: true })); return; }
  const ep: Record<string, number> = {}; for (const h of k.team) ep[h] = k.ep;
  try { const r = await sb("/rest/v1/rpc/rpg_echtzeit_gutschrift", { method: "POST", body: JSON.stringify({ p_user: k.nutzer, p_ep: ep, p_seelen: seelen, p_kampf: k.ort + "/" + k.karte }) });
    if (p.ws.readyState === WebSocket.OPEN) p.ws.send(JSON.stringify({ t: "gutschrift", ...(r as object) }));
  } catch (e) { console.error("Gutschrift fehlgeschlagen:", (e as Error).message); if (p.ws.readyState === WebSocket.OPEN) p.ws.send(JSON.stringify({ t: "gutschrift", fehler: true })); }
}

const http = createServer((req, res) => { // Lebenszeichen für den Anbieter
  res.writeHead(200, { "content-type": "application/json", "access-control-allow-origin": "*" });
  res.end(JSON.stringify({ ok: true, dienst: "mythara-echtzeit", protokoll: PROTOKOLL, spieler: plaetze.size, kampagnen: Boolean(SB_URL && SB_KEY) }));
});
const wss = new WebSocketServer({ server: http, maxPayload: 65536, verifyClient: (info: { origin: string }) => { const ok = !HERKUNFT.length || HERKUNFT.includes(info.origin); if (!ok) console.log("Verbindung abgelehnt: Herkunft", info.origin); return ok; } });
/* Ein Fehler in einer einzelnen Partie darf nicht den ganzen Server beenden: melden und weiterlaufen */
process.on("uncaughtException", (e) => console.error("Unerwarteter Fehler:", e && (e as Error).stack || e));
process.on("unhandledRejection", (e) => console.error("Unerwarteter Fehler (Zusage):", e && (e as Error).stack || e));

wss.on("connection", (ws, req) => {
  if (plaetze.size >= MAX) { ws.close(1013, "voll"); return; }
  const url = new URL(req.url || "/", "http://x"), held0 = url.searchParams.get("held") || "schildwaechter", held = HELDEN[held0] ? held0 : "schildwaechter", mit = (url.searchParams.get("mit") || "").split(",").filter((x) => HELDEN[x] && x !== held).slice(0, 2);
  const karte = url.searchParams.get("kampf") || "", ort = url.searchParams.get("ort") || "", raum = (url.searchParams.get("raum") || "").toUpperCase(), mitglied = url.searchParams.get("mitglied") === "1";
  if (url.searchParams.get("warte") === "1") { warten(ws, raum, url.searchParams.get("fuehrer") === "1"); return; } /* Wartebereich einer Koop-Gruppe */
  const p: Platz = { ws, sim: null, zuletzt: Date.now(), fenster: Date.now(), zahl: 0 }; plaetze.add(p);
  console.log("Verbindung:", karte ? `Kampf ${ort}/${karte}` : "Riss", "· Held", held, "· Begleiter", mit.length);
  const los = () => ws.send(JSON.stringify({ t: "hallo", protokoll: PROTOKOLL, tick: TICK }));
  if (!karte) { karteNehmen(GRUNDKARTE); Object.assign(STAERKE, { lp: 1, schaden: 1, beute: null, ep: 0 }); for (const k of Object.keys(HELDENSTUFE)) delete HELDENSTUFE[k]; for (const k of Object.keys(HELDENEP)) delete HELDENEP[k]; p.sim = new Sim(held, (Date.now() ^ (Math.random() * 1e9)) >>> 0, mit); los(); }
  else if (!KARTEN[karte] || !ORTSTUFE[ort] || !SB_URL || !SB_KEY) { console.log("Kampf abgelehnt: unbekannt oder Supabase nicht eingerichtet"); ws.close(4400, "kampf unbekannt"); plaetze.delete(p); return; }
  const frist = karte ? setTimeout(() => { if (!p.sim) { console.log("Kampf abgelehnt: keine Anmeldung binnen 10 s"); ws.close(4401, "keine anmeldung"); } }, 10000) : null;
  ws.on("message", async (roh) => {
    const jetzt = Date.now(); if (jetzt - p.fenster > 1000) { p.fenster = jetzt; p.zahl = 0; } if (++p.zahl > K.EINGABEN_JE_SEK) return; // zu viele Eingaben: verwerfen
    let e: Eingabe & { token?: string }; try { e = JSON.parse(String(roh)); } catch { return; } p.zuletzt = jetzt;
    if (karte && !p.sim && !p.haupt) { /* Kampagnenkampf: zuerst die Anmeldung */ if ((e as { t: string }).t !== "anmeldung" || p.kampf) return; p.kampf = { karte, ort, team: [held, ...mit], nutzer: "", ep: 0, fertig: false, gesiegt: false };
      try { const nutzer = await nutzerAus(String(e.token || "")); if (!nutzer) { console.log("Kampf abgelehnt: Anmeldung von Supabase nicht bestätigt"); ws.close(4401, "anmeldung ungueltig"); return; } p.kampf.nutzer = nutzer; const [ep, siege] = await Promise.all([epLesen(nutzer), siegeLesen(nutzer)]);
        if (mitglied) { /* Koop-Mitspieler: in den laufenden Kampf des Anführers; der Fortschritt zählt auch für ihn */
          const R = raeume.get(raum), H = R && R.kampf; if (!R || !H || !H.sim || !H.kampf || H.kampf.karte !== karte || H.kampf.ort !== ort || H.kampf.fertig) { console.log("Koop abgelehnt: kein laufender Kampf in", raum); ws.close(4404, "kein gemeinsamer kampf"); return; }
          if ((H.mit || new Set()).size >= 2) { ws.close(4409, "gruppe voll"); return; }
          const id = H.sim.uebernehmen(held); if (!id) { ws.close(4409, "kein platz"); return; } const typ = (H.sim.nach(id) as { typ: string }).typ; H.sim.setzeErfahrung(typ, Number(ep[typ]) || 0);
          p.haupt = H; p.heldId = id; p.kampf.team = [typ]; (H.mit = H.mit || new Set()).add(p); if (frist) clearTimeout(frist); console.log("Koop: Mitspieler kommt dazu", ort + "/" + karte, typ); if (ws.readyState === WebSocket.OPEN) los(); return; }
        if (!darfKaempfen(siege, ort, karte)) { console.log("Kampf abgelehnt: noch nicht freigeschaltet", ort, karte, [...siege].join(",")); ws.close(4403, "noch nicht freigeschaltet"); return; } /* Reihenfolge: erst der Kampf davor, erst die Kampagne davor */
        const R = raum && CODE.test(raum) ? raeume.get(raum) : undefined, gruppe = R && R.fuehrer === nutzer ? R : undefined, menschen = gruppe ? Math.min(3, [...gruppe.warten].filter((w) => w.nutzer !== nutzer).length + 1) : 1;
        setzeKarte(KARTEN[karte], FEIN); setzeStaerke(ORTSTUFE[ort], Math.max(1 + mit.length, menschen)); /* die Gegner richten sich nach der ganzen Gruppe */ for (const k of Object.keys(HELDENSTUFE)) delete HELDENSTUFE[k]; for (const k of Object.keys(HELDENEP)) delete HELDENEP[k]; for (const [h, v] of Object.entries(ep)) { HELDENEP[h] = Number(v) || 0; HELDENSTUFE[h] = stufeAusEp(HELDENEP[h]); }
        p.sim = new Sim(held, (Date.now() ^ (Math.random() * 1e9)) >>> 0, mit); if (frist) clearTimeout(frist); console.log("Kampf beginnt:", ort + "/" + karte, gruppe ? "(Koop " + gruppe.code + ")" : ""); if (ws.readyState === WebSocket.OPEN) los();
        if (gruppe) { gruppe.kampf = p; p.raum = gruppe.code; gruppe.zuletzt = Date.now(); losMelden(gruppe, ort, karte); }
      } catch (err) { console.error("Anmeldung fehlgeschlagen [Schlüssel in Render: " + SCHLUESSELART + "]:", (err as Error).message); ws.close(4503, "anmeldung nicht moeglich"); }
      return; }
    if ((e as { t: string }).t === "verlassen") { void gutschreiben(p); return; }
    try { if (p.sim) p.sim.eingabe(e); else if (p.haupt && p.haupt.sim && p.heldId) p.haupt.sim.eingabe(e, p.heldId); } catch (err) { console.error("Eingabe:", (err as Error).message); }
  });
  const weg = () => { if (!plaetze.has(p)) return; plaetze.delete(p); if (frist) clearTimeout(frist); void gutschreiben(p); /* wer die Seite schließt, bekommt trotzdem, was er erkämpft hat */
    if (p.haupt) { p.haupt.mit?.delete(p); if (p.haupt.sim && p.heldId) p.haupt.sim.freigeben(p.heldId); } /* sein Held kämpft als Begleiter weiter */
    if (p.mit) for (const m of p.mit) { void gutschreiben(m).finally(() => { if (m.ws.readyState === WebSocket.OPEN) { m.ws.send(JSON.stringify({ t: "koopende" })); m.ws.close(4410, "anfuehrer weg"); } }); }
    if (p.raum) { const R = raeume.get(p.raum); if (R && R.kampf === p) { R.kampf = null; R.zuletzt = Date.now(); gruppeMelden(R); } } }; ws.on("close", weg); ws.on("error", weg);
});

/** Wartebereich: erste Nachricht {t:"anmeldung", token, name, held}. Der Anführer gründet die Gruppe (fuehrer=1), andere treten mit dem Code bei. */
function warten(ws: WebSocket, code: string, fuehrer: boolean) {
  if (!CODE.test(code) || !SB_URL || !SB_KEY) { ws.close(4400, "code ungueltig"); return; } let w: Warter | null = null, R: Raum | undefined;
  const frist = setTimeout(() => { if (!w) ws.close(4401, "keine anmeldung"); }, 10000);
  ws.on("message", async (roh) => { if (w) return; let e: { t?: string; token?: string; name?: string; held?: string }; try { e = JSON.parse(String(roh)); } catch { return; } if (e.t !== "anmeldung") return;
    const nutzer = await nutzerAus(String(e.token || "")).catch(() => null); if (!nutzer) { ws.close(4401, "anmeldung ungueltig"); return; } clearTimeout(frist);
    const name = String(e.name || "Held").replace(/[<>&"]/g, "").slice(0, 24) || "Held", held = HELDEN[String(e.held)] ? String(e.held) : "schildwaechter";
    R = raeume.get(code); if (fuehrer) { if (R && R.fuehrer !== nutzer) { ws.close(4409, "code vergeben"); return; } if (!R) { R = { code, fuehrer: nutzer, fuehrerName: name, warten: new Set(), kampf: null, zuletzt: Date.now() }; raeume.set(code, R); } }
    else if (!R) { ws.close(4404, "gruppe unbekannt"); return; }
    for (const o of [...R.warten]) if (o.nutzer === nutzer) { R.warten.delete(o); try { o.ws.close(1000, "neu verbunden"); } catch { /* schon zu */ } } /* dieselbe Person nur einmal */
    if (new Set([...R.warten].map((o) => o.nutzer).concat(nutzer)).size > 3) { ws.close(4409, "gruppe voll"); return; }
    w = { ws, nutzer, name, held }; R.warten.add(w); R.zuletzt = Date.now(); console.log("Koop: Gruppe", code, fuehrer ? "gegründet" : "beigetreten", "·", R.warten.size, "da"); gruppeMelden(R);
    if (!fuehrer && R.kampf && R.kampf.kampf && !R.kampf.kampf.fertig) ws.send(JSON.stringify({ t: "los", ort: R.kampf.kampf.ort, kampf: R.kampf.kampf.karte })); /* Kampf läuft schon: gleich dazu */ });
  const weg = () => { clearTimeout(frist); if (R && w) { R.warten.delete(w); R.zuletzt = Date.now(); gruppeMelden(R); } }; ws.on("close", weg); ws.on("error", weg);
  const lebt = setInterval(() => { if (ws.readyState !== WebSocket.OPEN) { clearInterval(lebt); return; } try { ws.ping(); } catch { /* zu */ } }, 25000);
}

let n = 0;
setInterval(() => {
  n++; const jetzt = Date.now();
  for (const p of plaetze) {
    if (jetzt - p.zuletzt > RUHE_MS) { p.ws.close(1000, "ruhe"); continue; } // wer lange nichts tut, gibt den Platz frei
    if (!p.sim) continue; try { p.sim.schritt(); } catch (err) { console.error("Schritt:", (err as Error).stack); p.ws.close(1011, "fehler"); plaetze.delete(p); continue; }
    if (n % ZUSTAND_JE === 0 && p.ws.readyState === WebSocket.OPEN && p.ws.bufferedAmount < 65536) { const z = p.sim.zustand();
      if (p.kampf && !p.kampf.fertig) for (const ev of z.ev) if (ev.a === "ep") p.kampf.ep += ev.n; /* Erfahrung zählt der Server selbst mit */
      if (p.kampf && !p.kampf.gesiegt && z.phase === "sieg") void siegEintragen(p);
      p.ws.send(JSON.stringify({ t: "z", z }));
      if (p.mit) for (const m of p.mit) { if (m.kampf && !m.kampf.fertig) for (const ev of z.ev) if (ev.a === "ep") m.kampf.ep += ev.n; if (m.kampf && !m.kampf.gesiegt && z.phase === "sieg") void siegEintragen(m);
        if (m.ws.readyState === WebSocket.OPEN && m.ws.bufferedAmount < 65536) m.ws.send(JSON.stringify({ t: "z", z: { ...z, ich: p.sim.ichVon(m.heldId || 0) } })); m.zuletzt = jetzt; } }
  }
}, 1000 / TICK);

const SCHLUESSELART = SB_KEY.startsWith("sb_secret_") ? "Geheimschlüssel (sb_secret_…)" : SB_KEY.startsWith("eyJ") ? "service_role-Schlüssel (JWT)" : SB_KEY.startsWith("sb_publishable_") ? "FALSCH: das ist der öffentliche Schlüssel (sb_publishable_…) – gebraucht wird der geheime (sb_secret_…)" : SB_KEY ? "unbekannte Form" : "fehlt";
http.listen(PORT, () => { console.log("SUPABASE_SERVICE_KEY:", SCHLUESSELART); console.log(`Mythara Echtzeit läuft auf Port ${PORT} (${TICK} Schritte je Sekunde, Kampagnen ${SB_URL && SB_KEY ? "an" : "aus – SUPABASE_URL/SUPABASE_SERVICE_KEY fehlen"})`); });
