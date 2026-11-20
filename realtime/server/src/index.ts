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
import { KARTEN, FEIN, darfKaempfen } from "../../shared/karten";

const PORT = Number(process.env.PORT) || 8787, MAX = Number(process.env.MAX_SPIELER) || 40, RUHE_MS = 5 * 60 * 1000;
/* Von welchen Seiten aus verbunden werden darf (Komma-getrennt). Leer = alle, nur für Tests gedacht. */
const HERKUNFT = (process.env.ERLAUBTE_HERKUNFT || "https://mythara-dungeon.de,http://localhost:8765").split(",").map((s) => s.trim()).filter(Boolean);
const SB_URL = (process.env.SUPABASE_URL || "").replace(/\/$/, ""), SB_KEY = process.env.SUPABASE_SERVICE_KEY || "";
/* Stufe der Aufgabe je Ort – wie im Client (kampagne.ts) */
const ORTSTUFE: Record<string, number> = { weidenhain: 1 };

interface Platz { ws: WebSocket; sim: Sim | null; zuletzt: number; fenster: number; zahl: number; kampf?: { karte: string; ort: string; team: string[]; nutzer: string; ep: number; fertig: boolean; gesiegt: boolean } }
const plaetze = new Set<Platz>();

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
  const k = p.kampf; if (!k || k.fertig || !p.sim) return; k.fertig = true; const seelen = p.sim.splitter;
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
  const karte = url.searchParams.get("kampf") || "", ort = url.searchParams.get("ort") || "";
  const p: Platz = { ws, sim: null, zuletzt: Date.now(), fenster: Date.now(), zahl: 0 }; plaetze.add(p);
  console.log("Verbindung:", karte ? `Kampf ${ort}/${karte}` : "Riss", "· Held", held, "· Begleiter", mit.length);
  const los = () => ws.send(JSON.stringify({ t: "hallo", protokoll: PROTOKOLL, tick: TICK }));
  if (!karte) { karteNehmen(GRUNDKARTE); Object.assign(STAERKE, { lp: 1, schaden: 1, beute: null, ep: 0 }); for (const k of Object.keys(HELDENSTUFE)) delete HELDENSTUFE[k]; for (const k of Object.keys(HELDENEP)) delete HELDENEP[k]; p.sim = new Sim(held, (Date.now() ^ (Math.random() * 1e9)) >>> 0, mit); los(); }
  else if (!KARTEN[karte] || !ORTSTUFE[ort] || !SB_URL || !SB_KEY) { console.log("Kampf abgelehnt: unbekannt oder Supabase nicht eingerichtet"); ws.close(4400, "kampf unbekannt"); plaetze.delete(p); return; }
  const frist = karte ? setTimeout(() => { if (!p.sim) { console.log("Kampf abgelehnt: keine Anmeldung binnen 10 s"); ws.close(4401, "keine anmeldung"); } }, 10000) : null;
  ws.on("message", async (roh) => {
    const jetzt = Date.now(); if (jetzt - p.fenster > 1000) { p.fenster = jetzt; p.zahl = 0; } if (++p.zahl > K.EINGABEN_JE_SEK) return; // zu viele Eingaben: verwerfen
    let e: Eingabe & { token?: string }; try { e = JSON.parse(String(roh)); } catch { return; } p.zuletzt = jetzt;
    if (karte && !p.sim) { /* Kampagnenkampf: zuerst die Anmeldung */ if ((e as { t: string }).t !== "anmeldung" || p.kampf) return; p.kampf = { karte, ort, team: [held, ...mit], nutzer: "", ep: 0, fertig: false, gesiegt: false };
      try { const nutzer = await nutzerAus(String(e.token || "")); if (!nutzer) { console.log("Kampf abgelehnt: Anmeldung von Supabase nicht bestätigt"); ws.close(4401, "anmeldung ungueltig"); return; } p.kampf.nutzer = nutzer; const [ep, siege] = await Promise.all([epLesen(nutzer), siegeLesen(nutzer)]);
        if (!darfKaempfen(siege, ort, karte)) { console.log("Kampf abgelehnt: noch nicht freigeschaltet", ort, karte, [...siege].join(",")); ws.close(4403, "noch nicht freigeschaltet"); return; } /* Reihenfolge: erst der Kampf davor, erst die Kampagne davor */
        setzeKarte(KARTEN[karte], FEIN); setzeStaerke(ORTSTUFE[ort], 1 + mit.length); for (const k of Object.keys(HELDENSTUFE)) delete HELDENSTUFE[k]; for (const k of Object.keys(HELDENEP)) delete HELDENEP[k]; for (const [h, v] of Object.entries(ep)) { HELDENEP[h] = Number(v) || 0; HELDENSTUFE[h] = stufeAusEp(HELDENEP[h]); }
        p.sim = new Sim(held, (Date.now() ^ (Math.random() * 1e9)) >>> 0, mit); if (frist) clearTimeout(frist); console.log("Kampf beginnt:", ort + "/" + karte); if (ws.readyState === WebSocket.OPEN) los();
      } catch (err) { console.error("Anmeldung fehlgeschlagen [Schlüssel in Render: " + SCHLUESSELART + "]:", (err as Error).message); ws.close(4503, "anmeldung nicht moeglich"); }
      return; }
    if ((e as { t: string }).t === "verlassen") { void gutschreiben(p); return; }
    try { if (p.sim) p.sim.eingabe(e); } catch (err) { console.error("Eingabe:", (err as Error).message); }
  });
  const weg = () => { plaetze.delete(p); if (frist) clearTimeout(frist); void gutschreiben(p); /* wer die Seite schließt, bekommt trotzdem, was er erkämpft hat */ }; ws.on("close", weg); ws.on("error", weg);
});

let n = 0;
setInterval(() => {
  n++; const jetzt = Date.now();
  for (const p of plaetze) {
    if (jetzt - p.zuletzt > RUHE_MS) { p.ws.close(1000, "ruhe"); continue; } // wer lange nichts tut, gibt den Platz frei
    if (!p.sim) continue; try { p.sim.schritt(); } catch (err) { console.error("Schritt:", (err as Error).stack); p.ws.close(1011, "fehler"); plaetze.delete(p); continue; }
    if (n % ZUSTAND_JE === 0 && p.ws.readyState === WebSocket.OPEN && p.ws.bufferedAmount < 65536) { const z = p.sim.zustand();
      if (p.kampf && !p.kampf.fertig) for (const ev of z.ev) if (ev.a === "ep") p.kampf.ep += ev.n; /* Erfahrung zählt der Server selbst mit */
      if (p.kampf && !p.kampf.gesiegt && z.phase === "sieg") void siegEintragen(p);
      p.ws.send(JSON.stringify({ t: "z", z })); }
  }
}, 1000 / TICK);

const SCHLUESSELART = SB_KEY.startsWith("sb_secret_") ? "Geheimschlüssel (sb_secret_…)" : SB_KEY.startsWith("eyJ") ? "service_role-Schlüssel (JWT)" : SB_KEY.startsWith("sb_publishable_") ? "FALSCH: das ist der öffentliche Schlüssel (sb_publishable_…) – gebraucht wird der geheime (sb_secret_…)" : SB_KEY ? "unbekannte Form" : "fehlt";
http.listen(PORT, () => { console.log("SUPABASE_SERVICE_KEY:", SCHLUESSELART); console.log(`Mythara Echtzeit läuft auf Port ${PORT} (${TICK} Schritte je Sekunde, Kampagnen ${SB_URL && SB_KEY ? "an" : "aus – SUPABASE_URL/SUPABASE_SERVICE_KEY fehlen"})`); });
