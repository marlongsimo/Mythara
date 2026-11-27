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
import { handelNachricht, handelTakt, handelWeg, handelEinrichten } from "./handel";
import { ladenVerkauf } from "./verkauf";
import { arbeitPruefen, type Arbeit } from "../../shared/arbeit";
import { Kanal, kanalRahmen } from "./kanal";
import { WebSocket } from "ws";
import { HELDEN, stufeAusEp } from "../../shared/config";
import { heldenlevel, skillXpPruefen, levelAus } from "../../shared/kampfwerte";
import { ORTREIHE } from "../../shared/karten";
import { WELTREGIONEN } from "../../shared/weltzonen";
import { Held, heldPruefen, satzVon } from "../../shared/aussehen";
import { questsLaden, questHoeren, reden, antworten, abholen, gespraechEnde, dingTat, untersucht, betreten, regionGesperrt, punkte, questStand, schalter } from "./quests";
import { wegZiel, WEGSTEIN_PAUSE_MS, HEIM } from "../../shared/wegstein";
import { wegzielFrei } from "../../shared/quests";
import { faehreAnfrage } from "./faehre";
import { bossWahlSetzen } from "./bosse";
import { anzahlVon as invAnzahl, ladungen as invLadungen, ladungAbziehen, reisekarteFrei, reisekarteNutzen , petAktiv, petAktivSetzen } from "./inventar";
import { aufnehmen, trankWirkungWeg, inventarLaden, inventarHoeren, inventarSichern, inventarVon, anlegen, ablegen, herausnehmen, tauschen, bodenDazu, bodenAufheben, bodenSicht, bodenAufraeumen, FALLEN, kaufen, trankNehmen, wirkungSetzen, bankEinzahlen, bankReiter, bankAbheben, bankAlles, bankTauschen, bankPlatzhalterSetzen, bankPlatzhalterEntfernen } from "./inventar";
import { nahAnBank, nahAnBankkiste, KISTE_TATEN, BANK_MAX } from "../../shared/bank";
import { holzEinrichten, holzStart, holzStop, holzKern, holzTakt, holzWeg, gefaellte } from "./holz";
import { bergEinrichten, bergStart, bergStop, bergRiss, bergTakt, bergWeg, leereAdern } from "./bergbau";
import { pflanzenEinrichten, pflueckStart, pflueckStop, pflueckTakt, pflueckWeg, abgeerntete } from "./pflanzen";
import { lichterEinrichten, lichtStart, lichtStop, lichtTakt, lichtWeg, verloschene } from "./lichter";
import { krautEinrichten, krautStart, krautStop, krautTau, krautTakt, krautWeg, abgeschnittene } from "./kraeuter";
import { fischEinrichten, fischStart, fischStop, fischTakt, fischWeg, fischMoment, leereFangstellen, wurmEinrichten, wurmStart, wurmStop, wurmTakt, wurmWeg, leereWurmstellen } from "./fischen";
import { handwerkEinrichten, handwerkStart, handwerkStop, handwerkGlut, handwerkTakt, handwerkWeg } from "./handwerk";
import { GEGENSTAENDE, VERBRAUCH, Verbrauch, fachG, anforderungFehlt } from "../../shared/gegenstaende";
import { LAEDEN, LadenId, KAUF_WEIT, WAEHRUNG, ladenOffen } from "../../shared/laeden";
import { HEILSTELLEN } from "../../shared/heilstellen";
import { filtern } from "./wortfilter";
import * as Sitz from "./sitz";
/** Das Aussehen der Spieler je Konto (für die Kampfgebiete: dort zeigt der Server es den anderen Helden) */
export const aussehenJe = new Map<string, Held>();

export interface WeltHilfen { nutzerAus(token: string): Promise<string | null>; sb(pfad: string, init?: RequestInit): Promise<unknown>; epLesen(nutzer: string): Promise<Record<string, number>>; gruppeHat(code: string, nutzer: string): boolean; /** Zonen Stufe 3: Kampfkanal über diese Verbindung öffnen (kanal.ts) */ kanalAuf?(k: Kanal, q: string): void }
interface Spieler { /** arbeitet gerade (#67, shared/arbeit.ts) */ w?: Arbeit; id: number; ws: WebSocket; nutzer: string; gast: boolean; name: string; held: string; /** gewähltes Aussehen und Startwaffe (Heldeneditor) */ a?: Held; stufe: number; ort: string; x: number; y: number; b: number; l: number; lp: number; max: number; raum: string;
  chat: number[]; /** Seitenkennung des Geräts (ein Konto spielt nur auf einem Gerät) */ geraet?: string; /** wen er zuletzt in Sichtweite hatte (Ids) */ sichtKey?: string; /** Namen, die dieser Spieler blockiert hat (seine Nachrichten sieht er nicht) */ blockiert?: Set<string>; geaendert: boolean; zuletzt: number; wx?: number; wy?: number; gemerkt?: string; /** Inventar: abmelden vom Hörer; zuletzt geschickter Boden */ invAus?: () => void; boden?: string; /** Quests: abmelden vom Hörer */ questAus?: () => void }
/** Orte der gemeinsamen Welt: die Basis, die Dörfer der Kampagnen und die Strecken */
/* Alle Regionen der Welt kommen automatisch aus werkzeug/weltzonen.py (WELTREGIONEN) – neue Gebiete muss niemand von Hand eintragen */
export const WELTORTE = new Set([...WELTREGIONEN, ...ORTREIHE]);
/** Die Stelle eines Spielerkontos speichern (Weltfelder; x/y null = Start der Region) */
export function stelleMerken(H: Pick<WeltHilfen, "sb">, nutzer: string, region: string, x: number | null, y: number | null): Promise<unknown> {
  return H.sb("/rest/v1/rpc/rpg_echtzeit_position_setzen", { method: "POST", body: JSON.stringify({ p_user: nutzer, p_region: region, p_x: x, p_y: y }) }).catch((e) => console.error("Stelle merken:", (e as Error).message)); }
/** Holz, Bergbau, Pflücken, Handwerk: es läuft immer nur eins */
const alleStop = (s: Spieler) => { holzStop(s); bergStop(s); pflueckStop(s); lichtStop(s); fischStop(s); wurmStop(s); krautStop(s); handwerkStop(s); };
const spieler = new Set<Spieler>(); let naechste = 1, holzBereit = false;
/** Heim-Teleport: je Konto höchstens alle 5 Minuten (der Server merkt sich die Zeit – Browser-Speicher löschen oder ein anderes Gerät helfen nicht) */
/** Wie viele gerade in der Welt sind (Weltenwahl auf der Willkommensseite) */
export const weltOnline = (): number => spieler.size;
/** Eine Systemzeile an einen Spieler (z. B. aus der Kampfwelt) */
export function systemAn(nutzer: string, text: string): void { for (const s of spieler) if (s.nutzer === nutzer) senden(s, { t: "chat", kanal: "system", text, zeit: Date.now() }); }
export const TELEPORT_PAUSE_MS = Number(process.env.TELEPORT_PAUSE_MS || 5 * 60 * 1000); const teleportZuletzt = new Map<string, number>();
/* Wegstein (shared/wegstein.ts, Phase 3a): eigene Abklingzeit; das Ziel merkt sich der Server 2 min lang (bis die neue Kampfverbindung steht) – die Kampfwelt (index.ts zoneBetreten) setzt den Helden dorthin,
   nicht an die Stelle, die der Browser meldet */
export const WEGSTEIN_PAUSE = Number(process.env.WEGSTEIN_PAUSE_MS || WEGSTEIN_PAUSE_MS); const wegsteinZuletzt = new Map<string, number>();
const wegsteinZiele = new Map<string, { x: number; y: number; region: string; bis: number }>();
/** Ziel eines Teleports (Wegstein, Freund, Heim) setzen: die Kampfwelt setzt den Helden dorthin, die Stelle ist gemerkt */
function teleportZiel(H: Pick<WeltHilfen, "sb">, nutzer: string, x: number, y: number, region: string): void { wegsteinZiele.set(nutzer, { x, y, region, bis: Date.now() + 120_000 }); void stelleMerken(H, nutzer, region, x, y); }
/** Teleport-Ziel dieses Kontos abholen (einmal, höchstens 2 min alt) */
export function wegsteinZielNehmen(nutzer: string): { x: number; y: number; region: string } | null { const z = wegsteinZiele.get(nutzer); wegsteinZiele.delete(nutzer); return z && z.bis > Date.now() ? z : null; }
setInterval(() => { holzTakt(); bergTakt(); pflueckTakt(); lichtTakt(); fischTakt(); wurmTakt(); krautTakt(); handwerkTakt(); }, 100); /* Holzfällerei und Bergbau: Schläge im Takt, nachwachsende Bäume und Adern */
/* ---------- Freunde (Migration 047: rpg_freunde_von – nur der Server) ----------
   „freunde“: Liste mit online / im Kampf / zuletzt online · „zufreund“: Teleport zu einem Freund (nur wenn er online ist, nicht im Kampf steht
   und sein Gebiet für einen selbst schon freigeschaltet ist) · „freundanfrage“: dem anderen Bescheid geben (die Anfrage selbst stellt der Browser
   mit rpg_request_friend / rpg_answer_friend, Migration 003). Fremde Stellen gibt der Server nur an Freunde heraus. */
let kampfPruefer: (nutzer: string) => boolean = () => false;
/* #65: der Handel kennt die Spieler der Welt über ihren Namen (nur echte Konten), ihre Stelle und ob sie kämpfen */
handelEinrichten({ senden: (x, m) => senden(x as Spieler, m), istDa: (x) => spieler.has(x as Spieler), finde: (name) => { for (const o of spieler) if (!o.gast && o.name === name) return o; return null; }, imKampf: (nutzer) => kampfPruefer(nutzer) });
/** Heilen (Trank): der Kampfserver kennt die Lebenspunkte (im Kampfgebiet in der Simulation, sonst gemerkt). Zurück: Fehler oder Menge mit anwenden() */
export type Heilung = { fehler: string } | { n: number; lp: number; max: number; anwenden: () => void };
let heiler: (nutzer: string, v: Verbrauch) => Promise<Heilung> = async () => ({ fehler: "Gerade nicht möglich." });
export function heilenMit(f: typeof heiler): void { heiler = f; }
/** Trank ohne Heilung (#133): Ausdauer sofort dazu, LP-Kosten – index.ts setzt es am Helden der Kampfwelt um */
let trankExtra: (nutzer: string, ausdauer: number, kostet: number) => void = () => {};
export function trankExtraMit(f: typeof trankExtra): void { trankExtra = f; }
/** Essen: höchstens ein Bissen je 3 Ticks (1,5 s) */
/** Text des Heilers bei vollem Leben (index.ts heilenMit) */ export const VOLLES_LEBEN = "Du hast schon volles Leben.";
const BISSEN_MS = 1500, bissenZuletzt = new Map<string, number>();
/** Heilende Stellen: wann zuletzt gebetet (Stelle:Konto → Zeit) */
const gebetet = new Map<string, number>();
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
const MAX_WELT = Number(process.env.MAX_WELT || 150); /* so viele gleichzeitig in der Welt */
const zahl = (v: unknown, max = 20000) => typeof v === "number" && Number.isFinite(v) && Math.abs(v) <= max;
/** Chattext säubern: keine Steuerzeichen, keine spitzen Klammern, höchstens 160 Zeichen */
export const saeubern = (t: unknown): string => String(t ?? "").replace(/[\u0000-\u001f\u007f-\u009f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 160);
const senden = (s: Spieler, m: object) => { if (s.ws.readyState === WebSocket.OPEN && s.ws.bufferedAmount < 262144) s.ws.send(JSON.stringify(m)); };
/** Ein Konto spielt nur auf einem Gerät: siehe sitz.ts (Kontosperre) */
/** Abgelehnt, weil das Konto auf einem anderen Gerät ist: der Browser zeigt „Es ist aktuell schon ein Gerät in Riftmere“ (rest: Sekunden bis zur Freigabe nach einem Verbindungsabbruch) */
export function belegtAbweisen(ws: WebSocket, rest: number | null): void { try { ws.close(4410, "bereits angemeldet" + (rest !== null ? ";rest=" + Math.ceil(rest / 1000) : "")); } catch { /* zu */ } }
/** Heldenstufe eines Kontos hat sich im Kampf geändert (Skills): in der Welt übernehmen, damit Mitspieler und Spielerliste sie gleich sehen */
export function stufeSetzen(nutzer: string, stufe: number): void { for (const s of spieler) if (s.nutzer === nutzer && s.stufe !== stufe) { s.stufe = stufe; s.geaendert = true; senden(s, { t: "stufe", stufe }); } }
/** Hat der Empfänger o den Absender s blockiert? */
const sperrt = (o: Spieler, s: Spieler) => Boolean(o.blockiert && o.blockiert.has(s.name));
const amOrt = (ort: string) => [...spieler].filter((s) => s.ort === ort);
/** Wie weit (Weltfelder) man andere Spieler sieht und ihren Chat in der Nähe hört – über Regionsgrenzen hinweg (seit 26.11.2026) */
export const SICHT_WEIT = 40;
/** Sehen sich a und b? In der offenen Welt nach Abstand der Weltstellen, an Orten ohne Weltstelle (alte Karten) nach gleichem Ort */
const sehen = (a: Spieler, b: Spieler): boolean => a.wx !== undefined && a.wy !== undefined && b.wx !== undefined && b.wy !== undefined && WELTREGIONEN.includes(a.ort) && WELTREGIONEN.includes(b.ort)
  ? Math.max(Math.abs(a.wx - b.wx), Math.abs(a.wy - b.wy)) <= SICHT_WEIT : a.ort === b.ort;
const nahBei = (a: Spieler) => [...spieler].filter((o) => o === a || sehen(a, o));
function system(ort: string, text: string, ausser?: Spieler) { for (const s of amOrt(ort)) if (s !== ausser) senden(s, { t: "chat", kanal: "system", text, zeit: Date.now() }); }

export function weltVerbindung(ws: WebSocket, url: URL, H: WeltHilfen): void {
  if (!holzBereit) { holzBereit = true; holzEinrichten({ sb: H.sb, senden: (x, m) => senden(x as Spieler, m), alle: () => spieler }); bergEinrichten({ sb: H.sb, senden: (x, m) => senden(x as Spieler, m), alle: () => spieler });
    pflanzenEinrichten({ sb: H.sb, senden: (x, m) => senden(x as Spieler, m), alle: () => spieler }); lichterEinrichten({ sb: H.sb, senden: (x, m) => senden(x as Spieler, m), alle: () => spieler }); fischEinrichten({ sb: H.sb, senden: (x, m) => senden(x as Spieler, m), alle: () => spieler }); krautEinrichten({ sb: H.sb, senden: (x, m) => senden(x as Spieler, m), alle: () => spieler }); wurmEinrichten({ sb: H.sb, senden: (x, m) => senden(x as Spieler, m), alle: () => spieler }); handwerkEinrichten({ sb: H.sb, senden: (x, m) => senden(x as Spieler, m) }); } /* Holzfällerei (holz.ts): einmal einrichten */
  const ort = url.searchParams.get("ort") || ""; if (!WELTORTE.has(ort)) { ws.close(4400, "ort unbekannt"); return; } if (spieler.size >= MAX_WELT) { ws.close(1013, "voll"); return; }
  let s: Spieler | null = null; const frist = setTimeout(() => { if (!s) ws.close(4401, "keine anmeldung"); }, 10000); let fenster = Date.now(), n = 0;
  const kanal: { k: Kanal | null } = { k: null }; /* Zonen Stufe 3: die Kampfwelt als Kanal dieser Verbindung */
  ws.on("message", async (roh) => {
    { const t = String(roh); if (t === '{"t":"puls"}') { if (ws.readyState === WebSocket.OPEN) ws.send('{"t":"puls"}'); return; } /* Wachhund des Browsers: sofort antworten, zählt nicht als Aktivität */
      if (kanalRahmen(ws, t, kanal, (k, q) => { if (H.kanalAuf) H.kanalAuf(k, q); else k.close(4400, "kein kanal"); })) { if (s) s.zuletzt = Date.now(); return; } } /* vor dem Überflutungsschutz: Kampfeingaben haben ihren eigenen */
    const jetzt = Date.now(); if (jetzt - fenster > 1000) { fenster = jetzt; n = 0; } if (++n > 30) return; /* Schutz vor Überflutung */
    let e: { wahl?: unknown; alle?: unknown; platzhalter?: unknown; typ?: string; ziel?: string; rezept?: string; tab?: unknown; fach?: unknown; j?: unknown; laden?: string; g?: string; anName?: string; namen?: unknown; ort?: unknown; geraet?: string; wieder?: boolean; n?: string; menge?: unknown; was?: string; angenommen?: boolean; t?: string; token?: string; held?: string; aussehen?: unknown; raum?: string; x?: number; y?: number; wx?: number; wy?: number; b?: number; l?: number; lp?: number; max?: number; kanal?: string; text?: string; an?: number; tat?: string; i?: number; platz?: string; id?: number; ids?: number[]; npc?: string; a?: string };
    try { e = JSON.parse(String(roh)); } catch { return; }
    if (!s) { if (e.t !== "anmeldung") return;
      if (!e.token) { /* Gast: sichtbar mit selbst gewähltem Helden, ohne Stufe, ohne Chat und ohne Speichern */
        const a = heldPruefen(e.aussehen), held = a ? satzVon(a) : HELDEN[String(e.held)] ? String(e.held) : "schildwaechter"; /* Gäste: Aussehen vom Gerät, geprüft */
        s = { id: naechste++, ws, nutzer: "", gast: true, a: a || undefined, name: "Gast " + (1000 + Math.floor(Math.random() * 9000)), held, stufe: 0, ort, x: 0, y: 0, b: 0, l: 0, lp: 0, max: 0, raum: "", chat: [], geaendert: true, zuletzt: jetzt };
        clearTimeout(frist); spieler.add(s); senden(s, { t: "ich", id: s.id, name: s.name, held: s.held, stufe: 0, ort, gast: true }); console.log("Welt: Gast in", ort, "·", spieler.size, "unterwegs"); return; }
      const nutzer = await H.nutzerAus(String(e.token || "")).catch(() => null); if (!nutzer) { ws.close(4401, "anmeldung ungueltig"); return; }
      /* Ein Konto, ein Gerät: den Sitz sofort nehmen, noch vor den Abfragen – wer zuerst kommt, bleibt; das spätere Gerät wird abgewiesen */
      { const g = Sitz.geraetVon(e.geraet), b = Sitz.belegt(nutzer, g); if (b.belegt || !Sitz.nehmen(nutzer, g, ws)) { console.log("Welt: Anmeldung abgelehnt – Konto ist auf einem anderen Gerät"); belegtAbweisen(ws, b.belegt ? b.rest : null); return; }
        e.geraet = g; ws.once("close", (_c: number, grund: Buffer) => Sitz.los(ws, String(grund) === "abmelden")); }
      if (ws.readyState !== WebSocket.OPEN) return; /* während der Anmeldung schon wieder zu */
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
      if (ws.readyState !== WebSocket.OPEN) return; /* während der Abfragen geschlossen (Neuladen): nicht als Geist hineinsetzen */
      for (const o of [...spieler]) if (o.nutzer === nutzer) { spieler.delete(o); try { o.ws.close(4409, "anderswo angemeldet"); } catch { /* zu */ } } /* jede Person nur einmal in der Welt (hierher kommt nur dasselbe Gerät, etwa ein zweiter Tab – andere weist der Sitz ab) */
      const raum = typeof e.raum === "string" && /^[A-Z]{6}$/.test(e.raum) && H.gruppeHat(e.raum, nutzer) ? e.raum : "";
      s = { id: naechste++, ws, nutzer, gast: false, geraet: String(e.geraet || "").slice(0, 40) || undefined, a: eigen || undefined, name: (profil[0] && profil[0].handle) || "Wanderer", held, stufe: eigen && hl ? hl : stufeAusEp(Number((ep as Record<string, number>)[held]) || 0), ort, x: 0, y: 0, b: 0, l: 0, lp: 0, max: 0, raum, chat: [], geaendert: true, zuletzt: jetzt };
      clearTimeout(frist); spieler.add(s); Sitz.drin(ws); senden(s, { t: "ich", id: s.id, name: s.name, held: s.held, stufe: s.stufe, ort, festerHeld: aktiv !== null, ...(Array.isArray(stelle) && stelle[0] ? { pos: stelle[0] } : {}) });
      system(ort, `${s.name} ist da.`, s); console.log("Welt:", s.name, "in", ort, "·", spieler.size, "unterwegs");
      { const ich = s; void inventarLaden(H.sb, nutzer).then((iv) => { if (!iv || !spieler.has(ich)) return; senden(ich, { t: "inventar", inv: iv.inv }); ich.invAus = inventarHoeren(nutzer, (inv) => senden(ich, { t: "inventar", inv })); }); } /* das Inventar gehört dem Server (Migration 043) */
      senden(s, { t: "baeume", weg: gefaellte() }); /* Holzfällerei: welche Bäume gerade Stumpf sind */
      senden(s, { t: "adern", weg: leereAdern() }); /* Bergbau: welche Adern gerade leer sind */
      senden(s, { t: "pflanzen", weg: abgeerntete() }); senden(s, { t: "lichter", weg: verloschene() }); senden(s, { t: "fanggruende", weg: leereFangstellen() }); senden(s, { t: "kraeuter", weg: abgeschnittene() }); senden(s, { t: "wurmacker", weg: leereWurmstellen() }); /* Fischen: welche Stellen gerade ruhen */ /* Splitterbinden: verloschene Seelenlichter */ /* Handwerk: welche Flachs- und Hanfpflanzen abgeerntet sind */
      { const ich = s; void questsLaden(H.sb, nutzer).then((q) => { if (!spieler.has(ich)) return; senden(ich, { t: "quests", b: q, punkte: punkte(nutzer) }); ich.questAus = questHoeren(nutzer, (nb, p) => senden(ich, { t: "quests", b: nb, punkte: p }));
        const sp = regionGesperrt(nutzer, ich.ort); if (sp && sp.zurueck) senden(ich, { t: "zurueck", x: sp.zurueck.x, y: sp.zurueck.y, text: sp.zurueck.text }); }); } /* Quests (Migration 045); gesperrte Regionen nur mit Freigabe (QuestDef.freigaben) */
      return; }
    s.zuletzt = jetzt;
    if (e.t === "pos") { if (!zahl(e.x) || !zahl(e.y)) return; s.x = Math.round(e.x as number); s.y = Math.round(e.y as number); if (zahl(e.wx, 1e5) && zahl(e.wy, 1e5) && (e.wx as number) >= 0 && (e.wy as number) >= 0) { s.wx = Math.round((e.wx as number) * 100) / 100; s.wy = Math.round((e.wy as number) * 100) / 100; } s.b = zahl(e.b, 10) ? Math.round((e.b as number) * 100) / 100 : 0; s.l = e.l ? 1 : 0; s.w = s.l ? undefined : arbeitPruefen((e as { w?: unknown }).w); s.geaendert = true; /* #67: Arbeit (geprüft), wer läuft, arbeitet nicht */
      if (!s.gast && s.wx !== undefined && s.wy !== undefined) betreten(s.nutzer, s.ort, s.wx, s.wy); /* Quests: Stelle erreicht / Region betreten */ }
    else if (e.t === "inv") { /* Inventar: anlegen, ablegen, fallen lassen – der Server prüft alles selbst */
      if (s.gast) { senden(s, { t: "chat", kanal: "system", text: "Ein Inventar gibt es mit Konto.", zeit: jetzt }); return; }
      let fehler: string | null = null;
      if (e.tat === "anlegen" && Number.isInteger(e.i)) { /* Anforderung (Skill-Level) aus den gebuchten XP prüfen */
        const inv = inventarVon(s.nutzer), f = inv ? inv.rucksack[e.i as number] : undefined, G = f !== undefined ? GEGENSTAENDE[fachG(f)] : undefined;
        if (G && G.anforderung) { const r = ((await H.sb(`/rest/v1/rpg_held?user_id=eq.${s.nutzer}&select=*`).catch(() => [])) as Record<string, unknown>[])[0] || {};
          const xp = skillXpPruefen({ geschick: r.skill_geschick, staerke: r.skill_staerke, fernkampf: r.skill_fernkampf, magie: r.skill_magie, lp: r.skill_lp, defense: r.skill_defense });
          fehler = anforderungFehlt(G, (k) => levelAus(xp[k] || 0, k)); }
        if (!fehler) fehler = anlegen(H.sb, s.nutzer, e.i as number); }
      else if (e.tat === "ablegen" && typeof e.platz === "string") fehler = ablegen(H.sb, s.nutzer, e.platz);
      else if (e.tat === "tauschen") fehler = tauschen(H.sb, s.nutzer, Number(e.i), Number(e.j));
      else if (e.tat === "fallen" && Number.isInteger(e.i)) { if (s.wx === undefined || s.wy === undefined) fehler = "Erst ein paar Schritte gehen.";
        else { const f = herausnehmen(H.sb, s.nutzer, e.i as number); if (!f) fehler = "Diesen Gegenstand gibt es im Rucksack nicht."; else if ("fehler" in f) fehler = f.fehler; else bodenDazu(s.ort, s.wx, s.wy, f.g, f.n, s.nutzer, FALLEN, Date.now(), f.d); } }
      else if (e.tat === "trinken" && Number.isInteger(e.i)) { /* Trank: erst prüfen (volles Leben?), dann aus dem Rucksack nehmen und heilen */
        const inv = inventarVon(s.nutzer), f = inv ? inv.rucksack[e.i as number] : undefined, G = f !== undefined ? GEGENSTAENDE[fachG(f)] : undefined, V = G && G.trank ? VERBRAUCH[G.trank] : undefined;
        const essen = Boolean(V && V.art === "Essen"), bissen = bissenZuletzt.get(s.nutzer) || 0;
        if (!G || !V) fehler = "Das kann man nicht trinken.";
        else if (essen && jetzt - bissen < BISSEN_MS) fehler = "Du kaust noch."; /* Essen: kleine Abklingzeit je Bissen (3 Ticks) */
        else { const r0 = !V.heilt.fest && !V.heilt.anteil ? null : await heiler(s.nutzer, V); /* #133: Tränke ohne Heilung (Atemtrank, Moorfeuer …) gehen auch mit vollem Leben */
          /* Essen mit Wirkung (Fischsuppe …): auch mit vollem Leben – dann nur die Wirkung */
          const r = r0 && "fehler" in r0 && (V.wirkung || V.ausdauer || V.nebenAuf) && r0.fehler === VOLLES_LEBEN ? null : r0;
          if (r && "fehler" in r) fehler = r.fehler;
          else if (trankNehmen(H.sb, s.nutzer, e.i as number) !== G.trank) fehler = "Der Trank ist nicht mehr da.";
          else { if (essen) bissenZuletzt.set(s.nutzer, jetzt); if (r) r.anwenden();
            if (V.ausdauer || V.kostet) trankExtra(s.nutzer, V.ausdauer || 0, V.kostet || 0); /* #133 */
            const wirkungen = V.nebenAuf ? trankWirkungWeg(H.sb, s.nutzer) : V.wirkung ? wirkungSetzen(H.sb, s.nutzer, V.wirkung) : undefined;
            if (V.flaeschchen) aufnehmen(H.sb, s.nutzer, "leeres_flaeschchen", 1); /* das leere Fläschchen kommt zurück */
            senden(s, { t: "getrunken", g: G.id, n: r ? r.n : 0, ...(r ? { lp: r.lp, max: r.max } : {}), ...(wirkungen ? { wirkung: V.wirkung, wirkungen } : {}) }); } } }
      if (fehler) senden(s, { t: "chat", kanal: "system", text: fehler, zeit: jetzt }); }
    else if (e.t === "beten") { /* Heilende Stelle (shared/heilstellen.ts): nur mit Schalter, nah dran, Abklingzeit je Konto */
      if (s.gast) { senden(s, { t: "chat", kanal: "system", text: "Beten geht mit Konto (Menü → Anmelden).", zeit: jetzt }); return; }
      const ich = s, St = HEILSTELLEN.find((h) => ich.wx !== undefined && ich.wy !== undefined && Math.hypot(ich.wx - h.x, ich.wy - h.y) <= h.weit); let text = "";
      if (!St) text = "Hier kann man nicht beten.";
      else if (!schalter(s.nutzer, St.schalter)) text = St.zu;
      else { const k = St.id + ":" + s.nutzer, bis = (gebetet.get(k) || 0) + St.abkling - jetzt;
        if (bis > 0) text = `Du hast eben erst gebetet. Komm in ${Math.ceil(bis / 60000)} Minute${Math.ceil(bis / 60000) === 1 ? "" : "n"} wieder.`;
        else { const r = await heiler(s.nutzer, { id: St.id, name: St.name, art: "Gebet", seltenheit: "gewoehnlich", heilt: { fest: 10_000, anteil: 0 }, stapelbar: false, modell: "", werte: [], text: "" });
          if ("fehler" in r) text = St.voll; else { r.anwenden(); gebetet.set(k, jetzt); text = St.geheilt; senden(ich, { t: "getrunken", g: "", n: r.n, lp: r.lp, max: r.max, gebet: true }); } } }
      senden(ich, { t: "chat", kanal: "system", text, zeit: jetzt }); }
    else if (e.t === "kaufen") { /* Laden am Marktplatz: nur in der Waldmark, nah am Händler, nur was er führt, zum Preis aus shared/laeden.ts */
      if (s.gast) { senden(s, { t: "chat", kanal: "system", text: "Einkaufen geht mit Konto (Menü → Anmelden).", zeit: jetzt }); return; }
      const L = LAEDEN[String(e.laden) as LadenId], w = L && L.waren.find((x) => x.g === e.g), nutzerK = s.nutzer; let fehler: string | null = null;
      if (!L || !w) fehler = "Das gibt es hier nicht.";
      else if (!ladenOffen(L, (id) => questStand(nutzerK, id), (x) => schalter(nutzerK, x))) fehler = L.zu || "Hier ist zu.";
      else if (s.ort !== "waldmark" || s.wx === undefined || s.wy === undefined || Math.hypot(s.wx - L.x, s.wy - L.y) > KAUF_WEIT) fehler = `Geh näher an den Stand von ${L.haendler}.`;
      else fehler = kaufen(H.sb, s.nutzer, w.g, w.preis, WAEHRUNG);
      if (fehler) senden(s, { t: "chat", kanal: "system", text: fehler, zeit: jetzt });
      else senden(s, { t: "gekauft", laden: L.id, g: w!.g, preis: w!.preis }); }
    else if (e.t === "verkaufen") { /* #87/#88: an einen Händler verkaufen – nur was er führt (80 %) bzw. beim Trödler alles Handelbare (50 % des Grundwerts) */
      if (s.gast) { senden(s, { t: "chat", kanal: "system", text: "Verkaufen geht mit Konto (Menü → Anmelden).", zeit: jetzt }); return; } const nutzerK = s.nutzer;
      const r = ladenVerkauf(H.sb, s.nutzer, e.laden, e.i, (e as { n?: unknown }).n, s.wx, s.wy, (id) => questStand(nutzerK, id), (x) => schalter(nutzerK, x));
      if ("fehler" in r) senden(s, { t: "chat", kanal: "system", text: r.fehler, zeit: jetzt }); else { senden(s, { t: "verkauft", ...r }); senden(s, { t: "chat", kanal: "system", text: `Verkauft: ${r.n > 1 ? r.n + " × " : ""}${r.name} für ${r.splitter} Splitter.`, zeit: jetzt }); } }
    else if (e.t === "holz") { /* Holzfällerei (holz.ts): fällen, Kernschlag, aufhören */
      if (e.tat === "start" && typeof e.id === "string") { alleStop(s); const f = holzStart(s, e.id); if (f) senden(s, { t: "holz", tat: "nein", id: e.id, text: f }); }
      else if (e.tat === "kern") holzKern(s); else if (e.tat === "stop") holzStop(s); }
    else if (e.t === "berg") { /* Bergbau (bergbau.ts): abbauen, Riss, aufhören */
      if (e.tat === "start" && typeof e.id === "string") { alleStop(s); const f = bergStart(s, e.id); if (f) senden(s, { t: "berg", tat: "nein", id: e.id, text: f }); }
      else if (e.tat === "riss") bergRiss(s); else if (e.tat === "stop") bergStop(s); }
    else if (e.t === "kraut") { /* Kräuterkunde (kraeuter.ts, #133) */
      if (e.tat === "start" && typeof e.id === "string") { alleStop(s); const f = krautStart(s, e.id); if (f) senden(s, { t: "kraut", tat: "nein", id: e.id, text: f }); }
      else if (e.tat === "tau") krautTau(s);
      else if (e.tat === "stop") krautStop(s); }
    else if (e.t === "fisch") { /* Fischen (fischen.ts) */
      if (e.tat === "start" && typeof e.id === "string") { alleStop(s); const f = fischStart(s, e.id); if (f) senden(s, { t: "fisch", tat: "nein", id: e.id, text: f }); }
      else if (e.tat === "stroemung") fischMoment(s);
      else if (e.tat === "stop") fischStop(s); }
    else if (e.t === "wurm") { /* Würmer graben (fischen.ts) */
      if (e.tat === "start" && typeof e.id === "string") { alleStop(s); const f = wurmStart(s, e.id); if (f) senden(s, { t: "wurm", tat: "nein", id: e.id, text: f }); }
      else if (e.tat === "stop") wurmStop(s); }
    else if (e.t === "licht") { /* Splitterbinden: Seelenlichter einfangen (lichter.ts) */
      if (e.tat === "start" && typeof e.id === "string") { alleStop(s); const f = lichtStart(s, e.id); if (f) senden(s, { t: "licht", tat: "nein", id: e.id, text: f }); }
      else if (e.tat === "stop") lichtStop(s); }
    else if (e.t === "pflanze") { /* Handwerk: Flachs und Hanf pflücken (pflanzen.ts) */
      if (e.tat === "start" && typeof e.id === "string") { alleStop(s); const f = pflueckStart(s, e.id); if (f) senden(s, { t: "pflanze", tat: "nein", id: e.id, text: f }); }
      else if (e.tat === "stop") pflueckStop(s); }
    else if (e.t === "handwerk") { /* Handwerk an Esse, Amboss und Werkbank (handwerk.ts) */
      if (e.tat === "start" && typeof e.rezept === "string") { alleStop(s); const f = handwerkStart(s, e.rezept, Number(e.menge) || 1); if (f) senden(s, { t: "handwerk", tat: "nein", rezept: e.rezept, text: f }); }
      else if (e.tat === "glut") handwerkGlut(s); else if (e.tat === "stop") handwerkStop(s); }
    else if (e.t === "pet") { /* #170: Skilling-Pet rufen oder wegschicken (shared/pets.ts) */
      if (s.gast) return; const id = (e as { id?: unknown }).id, f = petAktivSetzen(H.sb, s.nutzer, e.tat === "rufen" && typeof id === "string" ? id : null);
      if (f) senden(s, { t: "chat", kanal: "system", text: f, zeit: jetzt }); else s.geaendert = true; }
    else if (e.t === "bank") { /* Bank (shared/bank.ts): nur mit Konto, nur nah an einem Schalter oder Bankmitarbeiter; Mengen prüft inventar.ts */
      if (s.gast) { senden(s, { t: "chat", kanal: "system", text: "Eine Bank gibt es mit Konto (Menü → Anmelden).", zeit: jetzt }); return; }
      let fehler: string | null = null; const g = typeof e.g === "string" ? e.g : "", n = Number.isInteger(e.menge) && (e.menge as number) >= 0 && (e.menge as number) <= BANK_MAX ? (e.menge as number) : -1; /* 0 = alle */
      const kiste = s.wx !== undefined && s.wy !== undefined && !nahAnBank(s.ort, s.wx, s.wy) && nahAnBankkiste(s.ort, s.wx, s.wy); /* #167: Bankkiste der Zunft */
      if (s.wx === undefined || s.wy === undefined || (!nahAnBank(s.ort, s.wx, s.wy) && !kiste)) fehler = "Geh näher an einen Bankschalter.";
      else if (kiste && !KISTE_TATEN.has(String(e.tat))) fehler = "An der Bankkiste kannst du nur ablegen und abheben.";
      else if (e.tat === "ein" && g && n >= 0) fehler = bankEinzahlen(H.sb, s.nutzer, g, n, Number(e.tab) || 0);
      else if (e.tat === "tab" && g) fehler = bankReiter(H.sb, s.nutzer, g, Number(e.tab));
      else if (e.tat === "ab" && g && n >= 0) fehler = bankAbheben(H.sb, s.nutzer, g, n, Number.isInteger(e.fach) ? Number(e.fach) : undefined); /* fach: welches Bankfach (gleicher Gegenstand mit Daten) */
      else if (e.tat === "alles" && (e.was === "rucksack" || e.was === "ausruestung")) fehler = bankAlles(H.sb, s.nutzer, e.was);
      else if (e.tat === "tauschen") fehler = bankTauschen(H.sb, s.nutzer, Number(e.a), Number(e.b)); /* #117: zwei Felder tauschen (Ziehen) */
      else if (e.tat === "platzhalter") fehler = bankPlatzhalterSetzen(H.sb, s.nutzer, e.platzhalter === true); /* #117: Schalter Platzhalter an/aus */
      else if (e.tat === "platzhalter_entfernen") fehler = bankPlatzhalterEntfernen(H.sb, s.nutzer, e.alle === true ? undefined : Number(e.fach)); /* #117: eins oder alle */
      else fehler = "Das versteht die Bank nicht.";
      if (fehler) senden(s, { t: "chat", kanal: "system", text: fehler, zeit: jetzt }); }
    else if (e.t === "aufheben") { if (s.gast) { senden(s, { t: "chat", kanal: "system", text: "Zum Aufheben brauchst du ein Konto.", zeit: jetzt }); return; }
      { const x = e.x as number, y = e.y as number; if (zahl(x, 1e6) && zahl(y, 1e6) && s.wx !== undefined && s.wy !== undefined && Math.hypot(x - s.wx, y - s.wy) < 3) { s.wx = x; s.wy = y; } } /* die Stelle beim Aufheben (die letzte „pos“ kann einen Schritt alt sein) */
      const ids = Array.isArray(e.ids) ? e.ids.filter((i) => Number.isInteger(i)).slice(0, 50) : Number.isInteger(e.id) ? [e.id as number] : []; if (!ids.length) return; /* „Alles aufheben“: mehrere auf einmal */
      let fehler: string | null = null; for (const id of ids) { const f = bodenAufheben(H.sb, s.nutzer, s.ort, id, s.wx, s.wy); if (f) fehler = f; if (f && /voll/.test(f)) break; }
      if (fehler) senden(s, { t: "chat", kanal: "system", text: fehler, zeit: jetzt }); s.boden = ""; }
    else if (e.t === "rede" || e.t === "antwort") { /* Quests: Gespräche nur mit dem, der spricht */
      if (s.gast) { senden(s, { t: "chat", kanal: "system", text: "Aufträge gibt es mit Konto (Menü → Anmelden).", zeit: jetzt }); return; }
      const npc = String(e.npc || "").slice(0, 16), aw = e.t === "rede" ? reden(s.nutzer, npc, s.wx, s.wy) : await antworten(H.sb, s.nutzer, npc, String(e.a || ""), { x: s.wx, y: s.wy });
      if (aw.fehler) { senden(s, { t: "chat", kanal: "system", text: aw.fehler, zeit: jetzt }); senden(s, { t: "dialog", npc, ende: true }); return; }
      senden(s, { t: "dialog", npc, ...aw }); }
    else if (e.t === "teleport") { /* fragt vor dem Teleport: erlaubt (und ab jetzt 5 Minuten Pause) oder die Restzeit */
      if (s.gast) { senden(s, { t: "teleport", ok: true, gast: true }); return; }
      const rest = (teleportZuletzt.get(s.nutzer) || 0) + TELEPORT_PAUSE_MS - jetzt; if (rest > 0) { senden(s, { t: "teleport", ok: false, rest }); return; }
      teleportZuletzt.set(s.nutzer, jetzt); alleStop(s); teleportZiel(H, s.nutzer, HEIM.x, HEIM.y, HEIM.region); /* der Server setzt die Position, nicht der Browser */ senden(s, { t: "teleport", ok: true }); }
    else if (e.t === "dialogzu") gespraechEnde(s.nutzer);
    else if (e.t === "handel") handelNachricht(H.sb, s, e as Record<string, unknown>); /* #65: Handel zwischen Spielern (handel.ts) */
    else if (e.t === "abholen") { /* #77: „Okay“ im Abschlussfenster – der Server bucht den Lohn genau einmal */
      if (s.gast) return; const r = await abholen(H.sb, s.nutzer, String((e as { id?: unknown }).id || "").slice(0, 40), { x: s.wx, y: s.wy }, String((e as { wahl?: unknown }).wahl || "").slice(0, 40)); /* #146: { t: "abholen", id, wahl: g } */
      if (r.fehler) senden(s, { t: "chat", kanal: "system", text: r.fehler, zeit: jetzt }); senden(s, { t: "abgeholt", ...r }); }
    else if (e.t === "qding" || e.t === "untersucht") { /* Questobjekt benutzen (Bruchstelle, Rutenbündel …), Gegner untersuchen – der Server prüft Ort und Entfernung */
      if (s.gast) { senden(s, { t: "chat", kanal: "system", text: "Aufträge gibt es mit Konto (Menü → Anmelden).", zeit: jetzt }); return; }
      { const x = e.x as number, y = e.y as number; if (zahl(x, 1e6) && zahl(y, 1e6) && s.wx !== undefined && s.wy !== undefined && Math.hypot(x - s.wx, y - s.wy) < 3) { s.wx = x; s.wy = y; } } /* die Stelle jetzt (die letzte „pos“ kann einen Schritt alt sein) */
      if (e.t === "qding") senden(s, { t: "qtext", text: await dingTat(H.sb, s.nutzer, s.ort, String(e.id || "").slice(0, 16), s.wx, s.wy) });
      else if (typeof e.typ === "string" && /^[a-z0-9_]{1,32}$/.test(e.typ)) await untersucht(H.sb, s.nutzer, e.typ, s.wx, s.wy); }
    else if (e.t === "leben") { if (!zahl(e.lp, 1e6) || !zahl(e.max, 1e6)) return; s.lp = Math.max(0, Math.round(e.lp as number)); s.max = Math.max(0, Math.round(e.max as number)); s.geaendert = true; }
    else if (e.t === "freunde") { if (s.gast) { senden(s, { t: "freunde", liste: [] }); return; }
      const liste = await freundeVon(H, s.nutzer, true); if (!s) return;
      senden(s, { t: "freunde", liste: liste.map((f) => { const o = onlineKonto(f.user_id); return { n: f.handle, online: Boolean(o), ort: o ? o.ort : undefined, kampf: o ? kampfPruefer(f.user_id) : false, zuletzt: o ? null : f.zuletzt }; }) }); }
    else if (e.t === "wegstein") { /* Phase 3a: Reiben → Ziel prüfen, Ladung abziehen, Stelle merken, Position vom Server (der Browser springt nur noch hin) */
      const ziel = String(e.ziel || "").slice(0, 40), nein = (text: string, rest = 0) => { if (s) senden(s, { t: "wegstein", ok: false, ziel, text, rest }); };
      if (s.gast) { nein("Der Wegstein geht mit Konto (Menü → Anmelden)."); return; }
      const karte = reisekarteFrei(s.nutzer); /* Reisekarte (#102): einmal am Tag ohne Ladung, auch ohne Wegstein */
      if (!karte && invAnzahl(s.nutzer, "wegstein") <= 0) { nein("Du hast keinen Wegstein im Rucksack."); return; }
      const z = wegZiel(ziel); if (!z) { nein("Diesen Ort kennt der Stein nicht."); return; }
      if (!wegzielFrei((id) => questStand(s!.nutzer, id), z)) { nein(z.sperre); return; }
      if (kampfPruefer(s.nutzer)) { nein("Mitten im Kampf schweigt der Stein."); return; }
      { const rest = (wegsteinZuletzt.get(s.nutzer) || 0) + WEGSTEIN_PAUSE - jetzt; if (rest > 0) { nein(`Der Stein ist noch warm – in ${Math.ceil(rest / 1000)} s ruft er wieder.`, rest); return; } }
      const frei = karte && reisekarteNutzen(H.sb, s.nutzer);
      if (!frei && !ladungAbziehen(H.sb, s.nutzer, "wegstein")) { nein("Der Wegstein ist leer. Lade ihn am Bindestein an der Linde in Weidenhain – 2 Splitter je Ladung."); return; }
      wegsteinZuletzt.set(s.nutzer, jetzt); alleStop(s); teleportZiel(H, s.nutzer, z.x, z.y, z.region); s.wx = z.x; s.wy = z.y;
      senden(s, { t: "wegstein", ok: true, ziel, name: z.name, x: z.x, y: z.y, region: z.region, ladungen: invLadungen(s.nutzer, "wegstein"), ...(frei ? { reisekarte: true } : {}) }); }
    else if (e.t === "bosswahl" && s) { /* #116: am Eingang nach der Quest – öffentlich oder eigene Instanz */ const nu = s.nutzer, t = bossWahlSetzen(nu, e.id, e.wahl, (sch) => schalter(nu, sch));
      senden(s, { t: "bosswahl", ok: Boolean(t), id: e.id, wahl: t ? e.wahl : undefined, text: t || "Das geht hier nicht." }); }
    else if (e.t === "faehre") { /* Phase 7 (#49): Überfahrt wie der Wegstein – der Server prüft und setzt die Stelle, der Browser zeigt die Überfahrt und springt */
      const r = faehreAnfrage(s, e.id, { schalter, imKampf: kampfPruefer, gesperrt: (n, reg) => Boolean(regionGesperrt(n, reg)) }); if (!r.ok) { senden(s, { t: "faehre", ok: false, text: r.text }); return; }
      alleStop(s); teleportZiel(H, s.nutzer, r.x, r.y, r.region); s.wx = r.x; s.wy = r.y;
      senden(s, { t: "faehre", ok: true, id: r.f.id, von: r.von.name, nach: r.nach.name, x: r.x, y: r.y, region: r.region, dauer: r.dauer }); }
    else if (e.t === "zufreund") { const n = String(e.n || "").slice(0, 40), nein = (text: string) => { if (s) senden(s, { t: "zufreund", ok: false, n, text }); };
      if (s.gast) { nein("Freunde gibt es mit Konto."); return; }
      const f = (await freundeVon(H, s.nutzer)).find((x) => x.handle === n); if (!s) return; if (!f) { nein(`${n} ist nicht in deiner Freundesliste.`); return; }
      const z = onlineKonto(f.user_id); if (!z) { nein(`${n} ist gerade nicht online.`); return; }
      if (!WELTREGIONEN.includes(z.ort) || z.wx === undefined || z.wy === undefined) { nein(`${n} ist gerade an einem Ort, an den kein Teleport führt.`); return; }
      if (regionGesperrt(s.nutzer, z.ort)) { nein(`${gebietName(z.ort)} ist für dich noch nicht freigeschaltet – der Weg ist noch gesperrt.`); return; }
      if (kampfPruefer(f.user_id)) { nein(`${n} ist gerade im Kampf – versuch es gleich noch einmal.`); return; }
      alleStop(s); teleportZiel(H, s.nutzer, z.wx, z.wy, z.ort); /* wie der Wegstein: die Kampfwelt setzt den Helden zum Freund, statt den alten samt alter Stelle zu übernehmen */
      senden(s, { t: "zufreund", ok: true, n, ort: z.ort, x: z.wx, y: z.wy }); }
    else if (e.t === "freundanfrage") { if (s.gast) return; const n = String(e.n || "").slice(0, 40), z = [...spieler].find((o) => !o.gast && o.name === n); freundeJe.delete(s.nutzer);
      if (z) { freundeJe.delete(z.nutzer); senden(z, { t: "freundanfrage", von: s.name, angenommen: Boolean(e.angenommen) }); } }
    else if (e.t === "ort") { /* Region gewechselt (laufen oder Teleport) bei bestehender Verbindung */ const neu = String((e as { ort?: unknown }).ort || ""); if (!WELTORTE.has(neu) || neu === s.ort) return;
      const alt = s.ort; for (const o of amOrt(alt)) if (o !== s) senden(o, { t: "fort", id: s.id }); s.ort = neu; s.boden = ""; s.geaendert = true; }
    else if (e.t === "blockiert") { /* die Blockierliste des Spielers (liegt auf seinem Gerät, kommt nach der Anmeldung und bei jeder Änderung) */
      const n = Array.isArray(e.namen) ? (e.namen as unknown[]).map((x) => String(x ?? "").slice(0, 40)).filter(Boolean).slice(0, 300) : []; s.blockiert = new Set(n); }
    else if (e.t === "chat") { const text = filtern(saeubern(e.text)).text; if (!text) return; if (s.gast) { senden(s, { t: "chat", kanal: "system", text: "Zum Schreiben brauchst du ein Konto (Menü → Anmelden).", zeit: jetzt }); return; } s.chat = s.chat.filter((t) => jetzt - t < 10000); if (s.chat.length >= 5) { senden(s, { t: "chat", kanal: "system", text: "Langsamer – höchstens 5 Nachrichten in 10 Sekunden.", zeit: jetzt }); return; } s.chat.push(jetzt);
      if (e.kanal === "fluestern") { const z = [...spieler].find((o) => (e.anName !== undefined ? o.name === String(e.anName) && !o.gast : o.id === e.an)); /* an einen Spieler (Kennung) oder einen Freund (Name) */ if (!z || z.gast) { senden(s, { t: "chat", kanal: "system", text: z ? "Gäste können keine Nachrichten empfangen." : "Dieser Spieler ist nicht mehr da.", zeit: jetzt }); return; }
        const m = { t: "chat", kanal: "fluestern", i: s.id, von: s.name, an: z.name, anId: z.id, text, zeit: jetzt }; if (z !== s && sperrt(z, s)) { senden(s, { t: "chat", kanal: "system", text: "Dieser Spieler nimmt gerade keine Nachrichten an.", zeit: jetzt }); return; } senden(s, m); if (z !== s) senden(z, m); return; }
      const m = { t: "chat", kanal: e.kanal === "gruppe" ? "gruppe" : "oeffentlich", i: s.id, von: s.name, text, zeit: jetzt };
      if (m.kanal === "gruppe") { if (!s.raum) { senden(s, { t: "chat", kanal: "system", text: "Du bist in keiner Gruppe.", zeit: jetzt }); return; } for (const o of spieler) if (o.raum === s.raum && !sperrt(o, s)) senden(o, m); }
      else for (const o of nahBei(s)) if (!sperrt(o, s)) senden(o, m); }
    else if (e.t === "held") { const h = String(e.held || ""); if (!HELDEN[h]) return; if (s.gast) { s.held = h; s.geaendert = true; senden(s, { t: "ich", id: s.id, name: s.name, held: h, stufe: 0, ort: s.ort, gast: true }); return; }
      if (s.ort !== "waldmark") { senden(s, { t: "chat", kanal: "system", text: "Den Helden wechselst du nur in der Waldmark.", zeit: jetzt }); senden(s, { t: "ich", id: s.id, name: s.name, held: s.held, stufe: s.stufe, ort: s.ort }); return; }
      try { await H.sb("/rest/v1/rpc/rpg_echtzeit_held_setzen", { method: "POST", body: JSON.stringify({ p_user: s.nutzer, p_held: h }) }); } catch (x) { console.error("Held setzen:", (x as Error).message); }
      const ep = await H.epLesen(s.nutzer).catch(() => ({} as Record<string, number>)); s.held = h; s.stufe = stufeAusEp(Number(ep[h]) || 0); s.geaendert = true; senden(s, { t: "ich", id: s.id, name: s.name, held: s.held, stufe: s.stufe, ort: s.ort }); }
  });
  const weg = () => { clearTimeout(frist); if (s) { holzWeg(s); bergWeg(s); pflueckWeg(s); lichtWeg(s); fischWeg(s); wurmWeg(s); krautWeg(s); handwerkWeg(s); handelWeg(s); } if (s && s.invAus) { s.invAus(); s.invAus = undefined; } if (s && s.questAus) { s.questAus(); s.questAus = undefined; } if (s && !s.gast) inventarSichern(H.sb, s.nutzer); if (s && !s.gast && s.wx !== undefined && s.wy !== undefined) void stelleMerken(H, s.nutzer, s.ort, s.wx, s.wy); /* fürs nächste Anmelden */ if (s && spieler.delete(s)) { system(s.ort, `${s.name} ist weitergezogen.`); for (const o of amOrt(s.ort)) senden(o, { t: "fort", id: s.id }); } };
  ws.on("close", (code: number, grund: Buffer) => { if (kanal.k) kanal.k.weg(code === 1000 ? 1006 : code, String(grund || "")); weg(); }); ws.on("error", () => { if (kanal.k) kanal.k.weg(1006, ""); weg(); });
  /* Herzschlag: alle 15 s ein Ping; bleiben zwei unbeantwortet, ist die Verbindung tot (iOS im Hintergrund) – weg damit, samt Kampfkanal und Gerätesperre */
  let pingsOffen = 0; ws.on("pong", () => { pingsOffen = 0; });
  const lebt = setInterval(() => { if (ws.readyState !== WebSocket.OPEN) { clearInterval(lebt); return; } if (pingsOffen >= 2) { clearInterval(lebt); console.log("Welt: Verbindung antwortet nicht mehr – getrennt"); try { ws.terminate(); } catch { /* zu */ } return; } pingsOffen++; try { ws.ping(); } catch { /* zu */ } }, 15000);
  const merken = setInterval(() => { if (ws.readyState !== WebSocket.OPEN) { clearInterval(merken); return; } if (!s || s.gast || s.wx === undefined || s.wy === undefined) return; const k = `${s.ort}:${s.wx}:${s.wy}`; if (k === s.gemerkt) return; s.gemerkt = k; void stelleMerken(H, s.nutzer, s.ort, s.wx, s.wy); }, 120000); /* falls der Server abstürzt */
}

/** 5-mal je Sekunde: jedem Spieler die anderen an seinem Ort melden (nur wenn sich etwas geändert hat, sonst alle 2 Sekunden) */
let runde = 0;
setInterval(() => { runde++; const jetzt = Date.now(), alle: Spieler[] = [];
  for (const s of spieler) { if (jetzt - s.zuletzt > 5.5 * 60 * 1000) { /* Inaktivität: der Browser meldet nach 5 Minuten selbst ab (abmeldung.ts), der Server nach 5½ – das gibt das Konto frei */ Sitz.abmelden(s.ws); try { s.ws.close(1000, "ruhe"); } catch { /* zu */ } continue; } alle.push(s); }
  /* jedem die Spieler in Sichtweite (offene Welt: nach Abstand, über Regionsgrenzen hinweg) – nur wenn sich dort etwas geändert hat, sonst alle 2 Sekunden */
  const daten = new Map(alle.map((s) => [s, { i: s.id, n: s.name, h: s.held, ...(s.a ? { a: s.a } : {}), s: s.stufe, x: s.x, y: s.y, ...(s.wx !== undefined && s.wy !== undefined ? { wx: s.wx, wy: s.wy } : {}), b: s.b, l: s.l, ...(s.w ? { w: s.w } : {}), ...(s.max ? { lp: s.lp, max: s.max } : {}), ...(() => { const p = s.gast ? undefined : petAktiv(s.nutzer); return p ? { p } : {}; })() /* #170: das Pet, das ihm folgt */ }]));
  const schicken: Spieler[] = [];
  for (const s of alle) { const nah = alle.filter((o) => o !== s && sehen(s, o)), key = nah.map((o) => o.id).join(",");
    if (!(s.geaendert || key !== s.sichtKey || nah.some((o) => o.geaendert) || runde % 10 === 0)) continue; s.sichtKey = key;
    senden(s, { t: "spieler", liste: nah.map((o) => daten.get(o)), online: spieler.size }); schicken.push(s); }
  for (const s of alle) s.geaendert = false;
  if (runde % 5 === 0) handelTakt(jetzt); /* #65: Abstand, Kampf, Anfragen verfallen */
  if (runde % 5 === 0) { bodenAufraeumen(jetzt); /* einmal je Sekunde: jedem, was er am Boden sieht (nur wenn es sich geändert hat) */
    for (const s of spieler) { const b = JSON.stringify(bodenSicht(s.ort, s.gast ? "" : s.nutzer, jetzt, s.wx !== undefined && s.wy !== undefined && WELTREGIONEN.includes(s.ort) ? { x: s.wx, y: s.wy } : undefined)); if (b === s.boden) continue; s.boden = b; senden(s, { t: "boden", liste: JSON.parse(b) }); } }
}, 200);
export const weltZahl = () => spieler.size;
