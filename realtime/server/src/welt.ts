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
import { ORTREIHE } from "../../shared/karten";

export interface WeltHilfen { nutzerAus(token: string): Promise<string | null>; sb(pfad: string, init?: RequestInit): Promise<unknown>; epLesen(nutzer: string): Promise<Record<string, number>>; gruppeHat(code: string, nutzer: string): boolean }
interface Spieler { id: number; ws: WebSocket; nutzer: string; gast: boolean; name: string; held: string; stufe: number; ort: string; x: number; y: number; b: number; l: number; lp: number; max: number; raum: string;
  chat: number[]; geaendert: boolean; zuletzt: number; wx?: number; wy?: number; gemerkt?: string }
/** Orte der gemeinsamen Welt: die Basis, die Dörfer der Kampagnen und die Strecken */
export const WELTORTE = new Set(["waldmark", "waldweg", "nordwald", "westmark", "osthof", "obstwiesen", "osthang", "unterschlupf", "rathaus_oben", "nordsaum", ...ORTREIHE]);
/** Die Stelle eines Spielerkontos speichern (Weltfelder; x/y null = Start der Region) */
export function stelleMerken(H: Pick<WeltHilfen, "sb">, nutzer: string, region: string, x: number | null, y: number | null): Promise<unknown> {
  return H.sb("/rest/v1/rpc/rpg_echtzeit_position_setzen", { method: "POST", body: JSON.stringify({ p_user: nutzer, p_region: region, p_x: x, p_y: y }) }).catch((e) => console.error("Stelle merken:", (e as Error).message)); }
const spieler = new Set<Spieler>(); let naechste = 1;
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
    let e: { t?: string; token?: string; held?: string; raum?: string; x?: number; y?: number; wx?: number; wy?: number; b?: number; l?: number; lp?: number; max?: number; kanal?: string; text?: string; an?: number };
    try { e = JSON.parse(String(roh)); } catch { return; }
    if (!s) { if (e.t !== "anmeldung") return;
      if (!e.token) { /* Gast: sichtbar mit selbst gewähltem Helden, ohne Stufe, ohne Chat und ohne Speichern */
        const held = HELDEN[String(e.held)] ? String(e.held) : "schildwaechter";
        s = { id: naechste++, ws, nutzer: "", gast: true, name: "Gast " + (1000 + Math.floor(Math.random() * 9000)), held, stufe: 0, ort, x: 0, y: 0, b: 0, l: 0, lp: 0, max: 0, raum: "", chat: [], geaendert: true, zuletzt: jetzt };
        clearTimeout(frist); spieler.add(s); senden(s, { t: "ich", id: s.id, name: s.name, held: s.held, stufe: 0, ort, gast: true }); console.log("Welt: Gast in", ort, "·", spieler.size, "unterwegs"); return; }
      const nutzer = await H.nutzerAus(String(e.token || "")).catch(() => null); if (!nutzer) { ws.close(4401, "anmeldung ungueltig"); return; }
      const [profil, aktiv, ep, stelle] = await Promise.all([
        H.sb(`/rest/v1/rpg_profiles?user_id=eq.${nutzer}&select=handle`).catch(() => []) as Promise<{ handle: string }[]>,
        H.sb(`/rest/v1/rpg_echtzeit_aktiver_held?user_id=eq.${nutzer}&select=held`).catch(() => null) as Promise<{ held: string }[] | null>, H.epLesen(nutzer).catch(() => ({})), H.sb(`/rest/v1/rpg_echtzeit_position?user_id=eq.${nutzer}&select=region,x,y`).catch(() => []) as Promise<{ region: string; x: number | null; y: number | null }[]>]);
      let held = aktiv && aktiv[0] && HELDEN[aktiv[0].held] ? aktiv[0].held : "";
      if (!held) { held = HELDEN[String(e.held)] ? String(e.held) : "schildwaechter"; /* noch nie gewählt: der Wunsch des Spielers gilt als erste Wahl */
        if (aktiv) await H.sb("/rest/v1/rpc/rpg_echtzeit_held_setzen", { method: "POST", body: JSON.stringify({ p_user: nutzer, p_held: held }) }).catch((x) => console.error("Held setzen:", (x as Error).message)); }
      for (const o of [...spieler]) if (o.nutzer === nutzer) { spieler.delete(o); try { o.ws.close(4409, "anderswo angemeldet"); } catch { /* zu */ } } /* jede Person nur einmal in der Welt */
      const raum = typeof e.raum === "string" && /^[A-Z]{6}$/.test(e.raum) && H.gruppeHat(e.raum, nutzer) ? e.raum : "";
      s = { id: naechste++, ws, nutzer, gast: false, name: (profil[0] && profil[0].handle) || "Wanderer", held, stufe: stufeAusEp(Number((ep as Record<string, number>)[held]) || 0), ort, x: 0, y: 0, b: 0, l: 0, lp: 0, max: 0, raum, chat: [], geaendert: true, zuletzt: jetzt };
      clearTimeout(frist); spieler.add(s); senden(s, { t: "ich", id: s.id, name: s.name, held: s.held, stufe: s.stufe, ort, festerHeld: aktiv !== null, ...(Array.isArray(stelle) && stelle[0] ? { pos: stelle[0] } : {}) });
      system(ort, `${s.name} ist da.`, s); console.log("Welt:", s.name, "in", ort, "·", spieler.size, "unterwegs"); return; }
    s.zuletzt = jetzt;
    if (e.t === "pos") { if (!zahl(e.x) || !zahl(e.y)) return; s.x = Math.round(e.x as number); s.y = Math.round(e.y as number); if (zahl(e.wx, 1e5) && zahl(e.wy, 1e5) && (e.wx as number) >= 0 && (e.wy as number) >= 0) { s.wx = Math.round((e.wx as number) * 100) / 100; s.wy = Math.round((e.wy as number) * 100) / 100; } s.b = zahl(e.b, 10) ? Math.round((e.b as number) * 100) / 100 : 0; s.l = e.l ? 1 : 0; s.geaendert = true; }
    else if (e.t === "leben") { if (!zahl(e.lp, 1e6) || !zahl(e.max, 1e6)) return; s.lp = Math.max(0, Math.round(e.lp as number)); s.max = Math.max(0, Math.round(e.max as number)); s.geaendert = true; }
    else if (e.t === "chat") { const text = saeubern(e.text); if (!text) return; if (s.gast) { senden(s, { t: "chat", kanal: "system", text: "Zum Schreiben brauchst du ein Konto (Menü → Anmelden).", zeit: jetzt }); return; } s.chat = s.chat.filter((t) => jetzt - t < 10000); if (s.chat.length >= 5) { senden(s, { t: "chat", kanal: "system", text: "Langsamer – höchstens 5 Nachrichten in 10 Sekunden.", zeit: jetzt }); return; } s.chat.push(jetzt);
      if (e.kanal === "fluestern") { const z = [...spieler].find((o) => o.id === e.an); if (!z || z.gast) { senden(s, { t: "chat", kanal: "system", text: z ? "Gäste können keine Nachrichten empfangen." : "Dieser Spieler ist nicht mehr da.", zeit: jetzt }); return; }
        const m = { t: "chat", kanal: "fluestern", i: s.id, von: s.name, an: z.name, anId: z.id, text, zeit: jetzt }; senden(s, m); if (z !== s) senden(z, m); return; }
      const m = { t: "chat", kanal: e.kanal === "gruppe" ? "gruppe" : "oeffentlich", i: s.id, von: s.name, text, zeit: jetzt };
      if (m.kanal === "gruppe") { if (!s.raum) { senden(s, { t: "chat", kanal: "system", text: "Du bist in keiner Gruppe.", zeit: jetzt }); return; } for (const o of spieler) if (o.raum === s.raum) senden(o, m); }
      else for (const o of amOrt(s.ort)) senden(o, m); }
    else if (e.t === "held") { const h = String(e.held || ""); if (!HELDEN[h]) return; if (s.gast) { s.held = h; s.geaendert = true; senden(s, { t: "ich", id: s.id, name: s.name, held: h, stufe: 0, ort: s.ort, gast: true }); return; }
      if (s.ort !== "waldmark") { senden(s, { t: "chat", kanal: "system", text: "Den Helden wechselst du nur in der Waldmark.", zeit: jetzt }); senden(s, { t: "ich", id: s.id, name: s.name, held: s.held, stufe: s.stufe, ort: s.ort }); return; }
      try { await H.sb("/rest/v1/rpc/rpg_echtzeit_held_setzen", { method: "POST", body: JSON.stringify({ p_user: s.nutzer, p_held: h }) }); } catch (x) { console.error("Held setzen:", (x as Error).message); }
      const ep = await H.epLesen(s.nutzer).catch(() => ({} as Record<string, number>)); s.held = h; s.stufe = stufeAusEp(Number(ep[h]) || 0); s.geaendert = true; senden(s, { t: "ich", id: s.id, name: s.name, held: s.held, stufe: s.stufe, ort: s.ort }); }
  });
  const weg = () => { clearTimeout(frist); if (s && !s.gast && s.wx !== undefined && s.wy !== undefined) void stelleMerken(H, s.nutzer, s.ort, s.wx, s.wy); /* fürs nächste Anmelden */ if (s && spieler.delete(s)) { system(s.ort, `${s.name} ist weitergezogen.`); for (const o of amOrt(s.ort)) senden(o, { t: "fort", id: s.id }); } };
  ws.on("close", weg); ws.on("error", weg);
  const lebt = setInterval(() => { if (ws.readyState !== WebSocket.OPEN) { clearInterval(lebt); return; } try { ws.ping(); } catch { /* zu */ } }, 25000);
  const merken = setInterval(() => { if (ws.readyState !== WebSocket.OPEN) { clearInterval(merken); return; } if (!s || s.gast || s.wx === undefined || s.wy === undefined) return; const k = `${s.ort}:${s.wx}:${s.wy}`; if (k === s.gemerkt) return; s.gemerkt = k; void stelleMerken(H, s.nutzer, s.ort, s.wx, s.wy); }, 120000); /* falls der Server abstürzt */
}

/** 5-mal je Sekunde: jedem Spieler die anderen an seinem Ort melden (nur wenn sich etwas geändert hat, sonst alle 2 Sekunden) */
let runde = 0;
setInterval(() => { runde++; const jetzt = Date.now(), orte = new Map<string, Spieler[]>();
  for (const s of spieler) { if (jetzt - s.zuletzt > 10 * 60 * 1000) { try { s.ws.close(1000, "ruhe"); } catch { /* zu */ } continue; } (orte.get(s.ort) || orte.set(s.ort, []).get(s.ort)!).push(s); }
  for (const liste of orte.values()) { const neu = liste.some((s) => s.geaendert); if (!neu && runde % 10) continue;
    const daten = liste.map((s) => ({ i: s.id, n: s.name, h: s.held, s: s.stufe, x: s.x, y: s.y, b: s.b, l: s.l, ...(s.max ? { lp: s.lp, max: s.max } : {}) }));
    for (const s of liste) { s.geaendert = false; senden(s, { t: "spieler", liste: daten.filter((d) => d.i !== s.id), online: spieler.size }); } }
}, 200);
export const weltZahl = () => spieler.size;
