/*
 * Mythara Echtzeit – die gemeinsame Welt (MMO-Schicht): Wer ist wo, mit welchem Helden, auf welcher Stufe; Chat; Heldenwechsel.
 * Verbindung: ?welt=1&ort=<ort>, erste Nachricht {t:"anmeldung", token, held?, raum?}. Ohne Token: als Gast (sichtbar, aber ohne Chat und ohne gespeicherten Helden).
 * Chat: öffentlich (am Ort, mit Sprechblase), Gruppe, Flüstern an einen Spieler (überall). Jede Nachricht trägt die Kennung des Absenders (i).
 * Name, aktiver Held und Stufe bestimmt der Server (Supabase: rpg_profiles, rpg_echtzeit_aktiver_held aus Migration 038, rpg_echtzeit_werte).
 * Den Helden wechseln darf man nur in der Waldmark (der Basis). Alles andere liegt nur im Arbeitsspeicher (Positionen, Chat).
 * Der Kampf selbst bleibt in index.ts; diese Schicht zeigt nur, wer unterwegs ist.
 * Gemerkte Stelle: Spielerkonten melden mit „pos“ auch Weltfelder (wx, wy); beim Gehen (und alle zwei Minuten) speichert der Server sie
 * (rpg_echtzeit_position, Migration 039) und schickt sie beim nächsten Anmelden mit „ich“ (pos) zurück – auch auf einem anderen Gerät.
 */
import { WebSocket } from "ws";
import { HELDEN, stufeAusEp } from "../../shared/config";
import { heldenlevel, skillXpPruefen } from "../../shared/kampfwerte";
import { ORTREIHE } from "../../shared/karten";
import { WELTREGIONEN } from "../../shared/weltzonen";
import { Held, heldPruefen, satzVon } from "../../shared/aussehen";
import { questsLaden, questHoeren, reden, antworten, gespraechEnde, q1 } from "./quests";
import { HINTER_DER_SPERRE, sperreOffen, VOR_DER_SPERRE } from "../../shared/quest01";
import { inventarLaden, inventarHoeren, inventarSichern, anlegen, ablegen, herausnehmen, bodenDazu, bodenAufheben, bodenSicht, bodenAufraeumen, FALLEN } from "./inventar";
/** Das Aussehen der Spieler je Konto (für die Kampfgebiete: dort zeigt der Server es den anderen Helden) */
export const aussehenJe = new Map<string, Held>();

export interface WeltHilfen { nutzerAus(token: string): Promise<string | null>; sb(pfad: string, init?: RequestInit): Promise<unknown>; epLesen(nutzer: string): Promise<Record<string, number>>; gruppeHat(code: string, nutzer: string): boolean }
interface Spieler { id: number; ws: WebSocket; nutzer: string; gast: boolean; name: string; held: string; /** gewähltes Aussehen und Startwaffe (Heldeneditor) */ a?: Held; stufe: number; ort: string; x: number; y: number; b: number; l: number; lp: number; max: number; raum: string;
  chat: number[]; geaendert: boolean; zuletzt: number; wx?: number; wy?: number; gemerkt?: string; /** Inventar: abmelden vom Hörer; zuletzt geschickter Boden */ invAus?: () => void; boden?: string; /** Quests: abmelden vom Hörer */ questAus?: () => void }
/** Orte der gemeinsamen Welt: die Basis, die Dörfer der Kampagnen und die Strecken */
/* Alle Regionen der Welt kommen automatisch aus werkzeug/weltzonen.py (WELTREGIONEN) – neue Gebiete muss niemand von Hand eintragen */
export const WELTORTE = new Set([...WELTREGIONEN, ...ORTREIHE]);
/** Die Stelle eines Spielerkontos speichern (Weltfelder; x/y null = Start der Region) */
export function stelleMerken(H: Pick<WeltHilfen, "sb">, nutzer: string, region: string, x: number | null, y: number | null): Promise<unknown> {
  return H.sb("/rest/v1/rpc/rpg_echtzeit_position_setzen", { method: "POST", body: JSON.stringify({ p_user: nutzer, p_region: region, p_x: x, p_y: y }) }).catch((e) => console.error("Stelle merken:", (e as Error).message)); }
const spieler = new Set<Spieler>(); let naechste = 1;
/* ---------- Freunde (Migration 047: rpg_freunde_von – nur der Server) ----------
   „freunde“: Liste mit online / im Kampf / zuletzt online · „zufreund“: Teleport zu einem Freund (nur wenn er online ist, nicht im Kampf steht
   und sein Gebiet für einen selbst schon freigeschaltet ist) · „freundanfrage“: dem anderen Bescheid geben (die Anfrage selbst stellt der Browser
   mit rpg_request_friend / rpg_answer_friend, Migration 003). Fremde Stellen gibt der Server nur an Freunde heraus. */
let kampfPruefer: (nutzer: string) => boolean = () => false;
/** index.ts meldet, wie man erkennt, ob ein Konto gerade kämpft (Einzelkampf gebunden oder ein Gegner hat es im Ziel) */
export function imKampfPruefer(f: (nutzer: string) => boolean): void { kampfPruefer = f; }
type Freund = { user_id: string; handle: string; zuletzt: string | null };
const freundeJe = new Map<string, { t: number; liste: Freund[] }>();
async function freundeVon(H: Pick<WeltHilfen, "sb">, nutzer: string, frisch = false): Promise<Freund[]> {
  const c = freundeJe.get(nutzer); if (c && !frisch && Date.now() - c.t < 30_000) return c.liste;
  const r = await H.sb("/rest/v1/rpc/rpg_freunde_von", { method: "POST", body: JSON.stringify({ p_user: nutzer }) }).catch((e) => { console.error("Freunde laden (Migration 047 eingespielt?):", (e as Error).message); return null; });
  const liste = Array.isArray(r) ? (r as Freund[]).filter((f) => f && typeof f.user_id === "string" && typeof f.handle === "string") : c ? c.liste : [];
  freundeJe.set(nutzer, { t: Date.now(), liste }); return liste; }
const onlineKonto = (nutzer: string): Spieler | undefined => [...spieler].find((o) => !o.gast && o.nutzer === nutzer);
const gebietName = (ort: string) => ort.charAt(0).toUpperCase() + ort.slice(1);
const MAX_WELT = Number(process.env.MAX_WELT || 500); /* so viele gleichzeitig in der Welt */
const zahl = (v: unknown, max = 20000) => typeof v === "number" && Number.isFinite(v) && Math.abs(v) <= max;
/** Chattext säubern: keine Steuerzeichen, keine spitzen Klammern, höchstens 160 Zeichen */
export const saeubern = (t: unknown): string => String(t ?? "").replace(/[\u0000-\u001f\u007f-\u009f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 160);
const senden = (s: Spieler, m: object) => { if (s.ws.readyState === WebSocket.OPEN && s.ws.bufferedAmount < 262144) s.ws.send(JSON.stringify(m)); };
const amOrt = (ort: string) => [...spieler].filter((s) => s.ort === ort);
function system(ort: string, text: string, ausser?: Spieler) { for (const s of amOrt(ort)) if (s !== ausser) senden(s, { t: "chat", kanal: "system", text, zeit: Date.now() }); }

export function weltVerbindung(ws: WebSocket, url: URL, H: WeltHilfen): void {
  const ort = url.searchParams.get("ort") || ""; if (!WELTORTE.has(ort)) { ws.close(4400, "ort unbekannt"); return; } if (spieler.size >= MAX_WELT) { ws.close(1013, "voll"); return; }
  let s: Spieler | null = null; const frist = setTimeout(() => { if (!s) ws.close(4401, "keine anmeldung"); }, 10000); let fenster = Date.now(), n = 0;
  ws.on("message", async (roh) => {
    const jetzt = Date.now(); if (jetzt - fenster > 1000) { fenster = jetzt; n = 0; } if (++n > 30) return; /* Schutz vor Überflutung */
    let e: { anName?: string; n?: string; angenommen?: boolean; t?: string; token?: string; held?: string; aussehen?: unknown; raum?: string; x?: number; y?: number; wx?: number; wy?: number; b?: number; l?: number; lp?: number; max?: number; kanal?: string; text?: string; an?: number; tat?: string; i?: number; platz?: string; id?: number; ids?: number[]; npc?: string; a?: string };
    try { e = JSON.parse(String(roh)); } catch { return; }
    if (!s) { if (e.t !== "anmeldung") return;
      if (!e.token) { /* Gast: sichtbar mit selbst gewähltem Helden, ohne Stufe, ohne Chat und ohne Speichern */
        const a = heldPruefen(e.aussehen), held = a ? satzVon(a) : HELDEN[String(e.held)] ? String(e.held) : "schildwaechter"; /* Gäste: Aussehen vom Gerät, geprüft */
        s = { id: naechste++, ws, nutzer: "", gast: true, a: a || undefined, name: "Gast " + (1000 + Math.floor(Math.random() * 9000)), held, stufe: 0, ort, x: 0, y: 0, b: 0, l: 0, lp: 0, max: 0, raum: "", chat: [], geaendert: true, zuletzt: jetzt };
        clearTimeout(frist); spieler.add(s); senden(s, { t: "ich", id: s.id, name: s.name, held: s.held, stufe: 0, ort, gast: true }); console.log("Welt: Gast in", ort, "·", spieler.size, "unterwegs"); return; }
      const nutzer = await H.nutzerAus(String(e.token || "")).catch(() => null); if (!nutzer) { ws.close(4401, "anmeldung ungueltig"); return; }
      const [profil, aktiv, ep, stelle] = await Promise.all([
        H.sb(`/rest/v1/rpg_profiles?user_id=eq.${nutzer}&select=handle`).catch(() => []) as Promise<{ handle: string }[]>,
        H.sb(`/rest/v1/rpg_echtzeit_aktiver_held?user_id=eq.${nutzer}&select=held`).catch(() => null) as Promise<{ held: string }[] | null>, H.epLesen(nutzer).catch(() => ({})), H.sb(`/rest/v1/rpg_echtzeit_position?user_id=eq.${nutzer}&select=region,x,y`).catch(() => []) as Promise<{ region: string; x: number | null; y: number | null }[]>]);
      /* der eigene Held (Migration 040): Aussehen und Startwaffe; die Startwaffe bestimmt den Ausrüstungssatz. Fehlt er im Konto (Migration noch nicht da), gilt das Aussehen vom Gerät */
      let hl = 0; /* Kampfregeln v2 (Migration 042): Heldenlevel aus den vier Skills */
      const eigen = heldPruefen(await H.sb(`/rest/v1/rpg_held?user_id=eq.${nutzer}&select=*`).then((r) => { const z = (r as { geschlecht: string; frisur: string; bart: string; haarfarbe: string; hautfarbe: string; waffe: string; skill_geschick?: number; skill_staerke?: number; skill_fernkampf?: number; skill_magie?: number; skill_lp?: number; skill_defense?: number }[])[0];
        if (z) hl = heldenlevel(skillXpPruefen({ geschick: z.skill_geschick, staerke: z.skill_staerke, fernkampf: z.skill_fernkampf, magie: z.skill_magie, lp: z.skill_lp, defense: z.skill_defense }));
        return z ? { aussehen: { g: z.geschlecht, frisur: z.frisur, bart: z.bart, haar: z.haarfarbe, haut: z.hautfarbe }, waffe: z.waffe } : null; }).catch(() => null)) || heldPruefen(e.aussehen);
      let held = eigen ? satzVon(eigen) : aktiv && aktiv[0] && HELDEN[aktiv[0].held] ? aktiv[0].held : "";
      if (eigen && aktiv && (!aktiv[0] || aktiv[0].held !== held)) await H.sb("/rest/v1/rpc/rpg_echtzeit_held_setzen", { method: "POST", body: JSON.stringify({ p_user: nutzer, p_held: held }) }).catch((x) => console.error("Held setzen:", (x as Error).message));
      if (eigen) aussehenJe.set(nutzer, eigen);
      if (!held) { held = HELDEN[String(e.held)] ? String(e.held) : "schildwaechter"; /* noch nie gewählt: der Wunsch des Spielers gilt als erste Wahl */
        if (aktiv) await H.sb("/rest/v1/rpc/rpg_echtzeit_held_setzen", { method: "POST", body: JSON.stringify({ p_user: nutzer, p_held: held }) }).catch((x) => console.error("Held setzen:", (x as Error).message)); }
      for (const o of [...spieler]) if (o.nutzer === nutzer) { spieler.delete(o); try { o.ws.close(4409, "anderswo angemeldet"); } catch { /* zu */ } } /* jede Person nur einmal in der Welt */
      const raum = typeof e.raum === "string" && /^[A-Z]{6}$/.test(e.raum) && H.gruppeHat(e.raum, nutzer) ? e.raum : "";
      s = { id: naechste++, ws, nutzer, gast: false, a: eigen || undefined, name: (profil[0] && profil[0].handle) || "Wanderer", held, stufe: eigen && hl ? hl : stufeAusEp(Number((ep as Record<string, number>)[held]) || 0), ort, x: 0, y: 0, b: 0, l: 0, lp: 0, max: 0, raum, chat: [], geaendert: true, zuletzt: jetzt };
      clearTimeout(frist); spieler.add(s); senden(s, { t: "ich", id: s.id, name: s.name, held: s.held, stufe: s.stufe, ort, festerHeld: aktiv !== null, ...(Array.isArray(stelle) && stelle[0] ? { pos: stelle[0] } : {}) });
      system(ort, `${s.name} ist da.`, s); console.log("Welt:", s.name, "in", ort, "·", spieler.size, "unterwegs");
      { const ich = s; void inventarLaden(H.sb, nutzer).then((iv) => { if (!iv || !spieler.has(ich)) return; senden(ich, { t: "inventar", inv: iv.inv }); ich.invAus = inventarHoeren(nutzer, (inv) => senden(ich, { t: "inventar", inv })); }); } /* das Inventar gehört dem Server (Migration 043) */
      { const ich = s; void questsLaden(H.sb, nutzer).then((q) => { if (!spieler.has(ich)) return; senden(ich, { t: "quests", q1: q }); ich.questAus = questHoeren(nutzer, (n) => senden(ich, { t: "quests", q1: n }));
        if (HINTER_DER_SPERRE.has(ich.ort) && !sperreOffen(q)) senden(ich, { t: "zurueck", x: VOR_DER_SPERRE[0], y: VOR_DER_SPERRE[1], text: "Die Wachen lassen dich nicht durch – der Weg nach Weidenhain ist gesperrt." }); }); } /* Quests (Migration 045); hinter der Sperre nur mit Freigabe */
      return; }
    s.zuletzt = jetzt;
    if (e.t === "pos") { if (!zahl(e.x) || !zahl(e.y)) return; s.x = Math.round(e.x as number); s.y = Math.round(e.y as number); if (zahl(e.wx, 1e5) && zahl(e.wy, 1e5) && (e.wx as number) >= 0 && (e.wy as number) >= 0) { s.wx = Math.round((e.wx as number) * 100) / 100; s.wy = Math.round((e.wy as number) * 100) / 100; } s.b = zahl(e.b, 10) ? Math.round((e.b as number) * 100) / 100 : 0; s.l = e.l ? 1 : 0; s.geaendert = true; }
    else if (e.t === "inv") { /* Inventar: anlegen, ablegen, fallen lassen – der Server prüft alles selbst */
      if (s.gast) { senden(s, { t: "chat", kanal: "system", text: "Ein Inventar gibt es mit Konto.", zeit: jetzt }); return; }
      let fehler: string | null = null;
      if (e.tat === "anlegen" && Number.isInteger(e.i)) fehler = anlegen(H.sb, s.nutzer, e.i as number);
      else if (e.tat === "ablegen" && typeof e.platz === "string") fehler = ablegen(H.sb, s.nutzer, e.platz);
      else if (e.tat === "fallen" && Number.isInteger(e.i)) { if (s.wx === undefined || s.wy === undefined) fehler = "Erst ein paar Schritte gehen.";
        else { const f = herausnehmen(H.sb, s.nutzer, e.i as number); if (!f) fehler = "Diesen Gegenstand gibt es im Rucksack nicht."; else bodenDazu(s.ort, s.wx, s.wy, f.g, f.n, s.nutzer, FALLEN); } }
      if (fehler) senden(s, { t: "chat", kanal: "system", text: fehler, zeit: jetzt }); }
    else if (e.t === "aufheben") { if (s.gast) { senden(s, { t: "chat", kanal: "system", text: "Zum Aufheben brauchst du ein Konto.", zeit: jetzt }); return; }
      { const x = e.x as number, y = e.y as number; if (zahl(x, 1e6) && zahl(y, 1e6) && s.wx !== undefined && s.wy !== undefined && Math.hypot(x - s.wx, y - s.wy) < 3) { s.wx = x; s.wy = y; } } /* die Stelle beim Aufheben (die letzte „pos“ kann einen Schritt alt sein) */
      const ids = Array.isArray(e.ids) ? e.ids.filter((i) => Number.isInteger(i)).slice(0, 50) : Number.isInteger(e.id) ? [e.id as number] : []; if (!ids.length) return; /* „Alles aufheben“: mehrere auf einmal */
      let fehler: string | null = null; for (const id of ids) { const f = bodenAufheben(H.sb, s.nutzer, s.ort, id, s.wx, s.wy); if (f) fehler = f; if (f && /voll/.test(f)) break; }
      if (fehler) senden(s, { t: "chat", kanal: "system", text: fehler, zeit: jetzt }); s.boden = ""; }
    else if (e.t === "rede" || e.t === "antwort") { /* Quests: Gespräche nur mit dem, der spricht */
      if (s.gast) { senden(s, { t: "chat", kanal: "system", text: "Aufträge gibt es mit Konto (Menü → Anmelden).", zeit: jetzt }); return; }
      const npc = String(e.npc || "").slice(0, 16), aw = e.t === "rede" ? reden(s.nutzer, npc, s.wx, s.wy) : await antworten(H.sb, s.nutzer, npc, String(e.a || ""));
      if (aw.fehler) { senden(s, { t: "chat", kanal: "system", text: aw.fehler, zeit: jetzt }); senden(s, { t: "dialog", npc, ende: true }); return; }
      senden(s, { t: "dialog", npc, ...aw }); }
    else if (e.t === "dialogzu") gespraechEnde(s.nutzer);
    else if (e.t === "leben") { if (!zahl(e.lp, 1e6) || !zahl(e.max, 1e6)) return; s.lp = Math.max(0, Math.round(e.lp as number)); s.max = Math.max(0, Math.round(e.max as number)); s.geaendert = true; }
    else if (e.t === "freunde") { if (s.gast) { senden(s, { t: "freunde", liste: [] }); return; }
      const liste = await freundeVon(H, s.nutzer, true); if (!s) return;
      senden(s, { t: "freunde", liste: liste.map((f) => { const o = onlineKonto(f.user_id); return { n: f.handle, online: Boolean(o), ort: o ? o.ort : undefined, kampf: o ? kampfPruefer(f.user_id) : false, zuletzt: o ? null : f.zuletzt }; }) }); }
    else if (e.t === "zufreund") { const n = String(e.n || "").slice(0, 40), nein = (text: string) => { if (s) senden(s, { t: "zufreund", ok: false, n, text }); };
      if (s.gast) { nein("Freunde gibt es mit Konto."); return; }
      const f = (await freundeVon(H, s.nutzer)).find((x) => x.handle === n); if (!s) return; if (!f) { nein(`${n} ist nicht in deiner Freundesliste.`); return; }
      const z = onlineKonto(f.user_id); if (!z) { nein(`${n} ist gerade nicht online.`); return; }
      if (!WELTREGIONEN.includes(z.ort) || z.wx === undefined || z.wy === undefined) { nein(`${n} ist gerade an einem Ort, an den kein Teleport führt.`); return; }
      if (HINTER_DER_SPERRE.has(z.ort) && !sperreOffen(q1(s.nutzer))) { nein(`${gebietName(z.ort)} ist für dich noch nicht freigeschaltet – der Weg ist noch gesperrt.`); return; }
      if (kampfPruefer(f.user_id)) { nein(`${n} ist gerade im Kampf – versuch es gleich noch einmal.`); return; }
      senden(s, { t: "zufreund", ok: true, n, ort: z.ort, x: z.wx, y: z.wy }); }
    else if (e.t === "freundanfrage") { if (s.gast) return; const n = String(e.n || "").slice(0, 40), z = [...spieler].find((o) => !o.gast && o.name === n); freundeJe.delete(s.nutzer);
      if (z) { freundeJe.delete(z.nutzer); senden(z, { t: "freundanfrage", von: s.name, angenommen: Boolean(e.angenommen) }); } }
    else if (e.t === "chat") { const text = saeubern(e.text); if (!text) return; if (s.gast) { senden(s, { t: "chat", kanal: "system", text: "Zum Schreiben brauchst du ein Konto (Menü → Anmelden).", zeit: jetzt }); return; } s.chat = s.chat.filter((t) => jetzt - t < 10000); if (s.chat.length >= 5) { senden(s, { t: "chat", kanal: "system", text: "Langsamer – höchstens 5 Nachrichten in 10 Sekunden.", zeit: jetzt }); return; } s.chat.push(jetzt);
      if (e.kanal === "fluestern") { const z = [...spieler].find((o) => (e.anName !== undefined ? o.name === String(e.anName) && !o.gast : o.id === e.an)); /* an einen Spieler (Kennung) oder einen Freund (Name) */ if (!z || z.gast) { senden(s, { t: "chat", kanal: "system", text: z ? "Gäste können keine Nachrichten empfangen." : "Dieser Spieler ist nicht mehr da.", zeit: jetzt }); return; }
        const m = { t: "chat", kanal: "fluestern", i: s.id, von: s.name, an: z.name, anId: z.id, text, zeit: jetzt }; senden(s, m); if (z !== s) senden(z, m); return; }
      const m = { t: "chat", kanal: e.kanal === "gruppe" ? "gruppe" : "oeffentlich", i: s.id, von: s.name, text, zeit: jetzt };
      if (m.kanal === "gruppe") { if (!s.raum) { senden(s, { t: "chat", kanal: "system", text: "Du bist in keiner Gruppe.", zeit: jetzt }); return; } for (const o of spieler) if (o.raum === s.raum) senden(o, m); }
      else for (const o of amOrt(s.ort)) senden(o, m); }
    else if (e.t === "held") { const h = String(e.held || ""); if (!HELDEN[h]) return; if (s.gast) { s.held = h; s.geaendert = true; senden(s, { t: "ich", id: s.id, name: s.name, held: h, stufe: 0, ort: s.ort, gast: true }); return; }
      if (s.ort !== "waldmark") { senden(s, { t: "chat", kanal: "system", text: "Den Helden wechselst du nur in der Waldmark.", zeit: jetzt }); senden(s, { t: "ich", id: s.id, name: s.name, held: s.held, stufe: s.stufe, ort: s.ort }); return; }
      try { await H.sb("/rest/v1/rpc/rpg_echtzeit_held_setzen", { method: "POST", body: JSON.stringify({ p_user: s.nutzer, p_held: h }) }); } catch (x) { console.error("Held setzen:", (x as Error).message); }
      const ep = await H.epLesen(s.nutzer).catch(() => ({} as Record<string, number>)); s.held = h; s.stufe = stufeAusEp(Number(ep[h]) || 0); s.geaendert = true; senden(s, { t: "ich", id: s.id, name: s.name, held: s.held, stufe: s.stufe, ort: s.ort }); }
  });
  const weg = () => { clearTimeout(frist); if (s && s.invAus) { s.invAus(); s.invAus = undefined; } if (s && s.questAus) { s.questAus(); s.questAus = undefined; } if (s && !s.gast) inventarSichern(H.sb, s.nutzer); if (s && !s.gast && s.wx !== undefined && s.wy !== undefined) void stelleMerken(H, s.nutzer, s.ort, s.wx, s.wy); /* fürs nächste Anmelden */ if (s && spieler.delete(s)) { system(s.ort, `${s.name} ist weitergezogen.`); for (const o of amOrt(s.ort)) senden(o, { t: "fort", id: s.id }); } };
  ws.on("close", weg); ws.on("error", weg);
  const lebt = setInterval(() => { if (ws.readyState !== WebSocket.OPEN) { clearInterval(lebt); return; } try { ws.ping(); } catch { /* zu */ } }, 25000);
  const merken = setInterval(() => { if (ws.readyState !== WebSocket.OPEN) { clearInterval(merken); return; } if (!s || s.gast || s.wx === undefined || s.wy === undefined) return; const k = `${s.ort}:${s.wx}:${s.wy}`; if (k === s.gemerkt) return; s.gemerkt = k; void stelleMerken(H, s.nutzer, s.ort, s.wx, s.wy); }, 120000); /* falls der Server abstürzt */
}

/** 5-mal je Sekunde: jedem Spieler die anderen an seinem Ort melden (nur wenn sich etwas geändert hat, sonst alle 2 Sekunden) */
let runde = 0;
setInterval(() => { runde++; const jetzt = Date.now(), orte = new Map<string, Spieler[]>();
  for (const s of spieler) { if (jetzt - s.zuletzt > 10 * 60 * 1000) { try { s.ws.close(1000, "ruhe"); } catch { /* zu */ } continue; } (orte.get(s.ort) || orte.set(s.ort, []).get(s.ort)!).push(s); }
  for (const liste of orte.values()) { const neu = liste.some((s) => s.geaendert); if (!neu && runde % 10) continue;
    const daten = liste.map((s) => ({ i: s.id, n: s.name, h: s.held, ...(s.a ? { a: s.a } : {}), s: s.stufe, x: s.x, y: s.y, b: s.b, l: s.l, ...(s.max ? { lp: s.lp, max: s.max } : {}) }));
    for (const s of liste) { s.geaendert = false; senden(s, { t: "spieler", liste: daten.filter((d) => d.i !== s.id), online: spieler.size }); } }
  if (runde % 5 === 0) { bodenAufraeumen(jetzt); /* einmal je Sekunde: jedem, was er am Boden sieht (nur wenn es sich geändert hat) */
    for (const s of spieler) { const b = JSON.stringify(bodenSicht(s.ort, s.gast ? "" : s.nutzer, jetzt)); if (b === s.boden) continue; s.boden = b; senden(s, { t: "boden", liste: JSON.parse(b) }); } }
}, 200);
export const weltZahl = () => spieler.size;
