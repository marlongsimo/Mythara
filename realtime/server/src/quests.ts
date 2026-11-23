/*
 * Mythara Echtzeit – Quests auf dem Server (Migration 045: rpg_held.quests). Der Server führt den Stand je Spieler, prüft jede Antwort,
 * schickt Dialoge nur an den, der spricht, und schreibt die Belohnung genau einmal gut (rpg_held_quest_abschluss).
 * Quest 01 „Die gesperrte Straße“: Dialogbuch und Abläufe in shared/quest01.ts.
 * Ohne Migration 045 (Spalte fehlt): Stand nur im Arbeitsspeicher, Speichern scheitert mit Meldung im Log – das Spiel läuft weiter.
 */
import { Q1, Stand, STAENDE, Dialog, Zeile, NpcId, dialog, antwort, npc, laeuft, rang, SCHRIFTSTUECK, BELOHNUNG, REDE_WEIT } from "../../shared/quest01";
import { BEDINGUNGEN, AUFGENOMMEN, hat, abgeben, aufnehmen } from "./inventar";
import { Q2, Stand2, gueltig, npc2, dialog2, antwort2, Dialog2, BRUCHSTELLEN, RUTEN, DING_WEIT, MOOSRAIN, MOOSRAIN_WEIT, dingBenutzen, mooshockerUntersucht, mooshockerBesiegt, lage, BELOHNUNG2 } from "../../shared/quest02";

type Sb = (pfad: string, init?: RequestInit) => Promise<unknown>;
const staende = new Map<string, Stand>(), staende2 = new Map<string, Stand2>(), hoerer = new Map<string, Set<(s: Stand, s2: Stand2) => void>>(), sbJe = new Map<string, Sb>();
const pruefen = (v: unknown): Stand => (typeof v === "string" && (STAENDE as readonly string[]).includes(v) ? (v as Stand) : "");

/** Den Queststand laden (einmal je Anmeldung; danach aus dem Speicher) */
export async function questsLaden(sb: Sb, nutzer: string): Promise<Stand> {
  sbJe.set(nutzer, sb); if (staende.has(nutzer)) return staende.get(nutzer)!;
  const r = (await sb(`/rest/v1/rpg_held?user_id=eq.${nutzer}&select=quests`).catch((e) => { console.error("Quests laden (Migration 045 eingespielt?):", (e as Error).message); return null; })) as { quests?: Record<string, { s?: string }> }[] | null;
  const s = pruefen(r && r[0] && r[0].quests && r[0].quests[Q1] ? r[0].quests[Q1].s : ""); staende.set(nutzer, s);
  staende2.set(nutzer, gueltig(r && r[0] && r[0].quests && r[0].quests[Q2] ? r[0].quests[Q2].s : "")); return s; }
export const q1 = (nutzer: string): Stand => staende.get(nutzer) || "";
/** Stand von Quest 02 „Der stille Rain“ */
export const q2 = (nutzer: string): Stand2 => staende2.get(nutzer) || "";
export function questHoeren(nutzer: string, f: (s: Stand, s2: Stand2) => void): () => void { let m = hoerer.get(nutzer); if (!m) hoerer.set(nutzer, (m = new Set())); m.add(f); return () => { m!.delete(f); }; }
function melden(nutzer: string) { const s = q1(nutzer), s2 = q2(nutzer); for (const f of hoerer.get(nutzer) || []) try { f(s, s2); } catch (x) { console.error("Quest-Hörer:", (x as Error).message); } }
async function setzen(sb: Sb, nutzer: string, s: Stand): Promise<void> {
  if (q1(nutzer) === "fertig" || !s || s === "fertig") return; staende.set(nutzer, s); melden(nutzer);
  await sb("/rest/v1/rpc/rpg_held_quest_setzen", { method: "POST", body: JSON.stringify({ p_user: nutzer, p_quest: Q1, p_stand: s }) }).catch((e) => console.error("Queststand speichern (Migration 045 eingespielt?):", (e as Error).message));
  if (s === "wachen" && hat(nutzer, SCHRIFTSTUECK)) await setzen(sb, nutzer, "beweis"); /* das Schriftstück schon dabei (früher gefunden) */ }

/* Schriftstück: 35 % je Bandit, nur mit dem Auftrag „Schriftstück sichern“ (Stand wachen) (config.ts bandit_dolch, Roll 3 „nur: einsteigerquest“) */
BEDINGUNGEN.set("einsteigerquest", (nutzer) => q1(nutzer) === "wachen"); /* das Pergament fällt erst, wenn der Auftrag lautet: das Schriftstück der Banditen sichern */
/* Aufgehoben, während die Wachen den Beweis verlangen: weiter zum Bürgermeister */
AUFGENOMMEN.push((nutzer, g) => { const sb = sbJe.get(nutzer); if (g === SCHRIFTSTUECK && sb && q1(nutzer) === "wachen") void setzen(sb, nutzer, "beweis"); });

/** Wie weit man von der Figur entfernt sein darf: Jori läuft dem Spieler entgegen, der Bürgermeister geht im Rathaus umher */
const WEIT: Partial<Record<NpcId, number>> = { jori: 40, hagan: 9 };
export interface Antwort1 { dialog?: Dialog; zeilen?: Zeile[]; ende?: boolean; belohnung?: typeof BELOHNUNG; fehler?: string; /** Quest 02: Splitter als Lohn */ splitter?: number }
const offen = new Map<string, NpcId>(); /* je Spieler: mit wem er gerade spricht */

/** Ein Gespräch beginnen (wx/wy: Stelle des Spielers in Weltfeldern) */
export function reden(nutzer: string, id: string, wx: number | undefined, wy: number | undefined): Antwort1 {
  const N2 = npc2(id); if (N2) { /* Quest 02 „Der stille Rain“ */
    if (wx === undefined || wy === undefined || Math.hypot(N2.x - wx, N2.y - wy) > REDE_WEIT) return { fehler: `Geh näher an ${N2.name} heran.` };
    const d = dialog2(N2.id, q2(nutzer)); if (!d) return { fehler: "Hier ist niemand." }; offen.set(nutzer, N2.id as unknown as NpcId); return { dialog: d as unknown as Dialog }; }
  const N = npc(id); if (!N) return { fehler: "Hier ist niemand." };
  if (wx === undefined || wy === undefined || Math.hypot(N.x - wx, N.y - wy) > (WEIT[N.id] ?? REDE_WEIT)) return { fehler: `Geh näher an ${N.name} heran.` };
  const d = dialog(N.id, q1(nutzer), hat(nutzer, SCHRIFTSTUECK)); if (!d) return { fehler: "Hier ist niemand." };
  offen.set(nutzer, N.id); if (N.id === "jori" && q1(nutzer) === "") { const sb = sbJe.get(nutzer); if (sb) void setzen(sb, nutzer, "angeboten"); }
  return { dialog: d }; }
/** Eine Antwort wählen: der Server prüft sie gegen den Stand und führt sie aus */
export async function antworten(sb: Sb, nutzer: string, id: string, a: string): Promise<Antwort1> {
  if (npc2(id)) return antworten2(sb, nutzer, id, a);
  const N = npc(id); if (!N || offen.get(nutzer) !== N.id) return { fehler: "Das Gespräch ist vorbei." };
  const s = q1(nutzer), mit = hat(nutzer, SCHRIFTSTUECK), f = antwort(N.id, s, mit, String(a || "").slice(0, 24)); if (!f) return { fehler: "Darauf weiß niemand eine Antwort." };
  let belohnung: typeof BELOHNUNG | undefined;
  if (f.abgeben) { if (!abgeben(sb, nutzer, SCHRIFTSTUECK)) return { fehler: "Du hast das Schriftstück nicht mehr." }; }
  if (f.abschluss) {
    if (s !== "frei") return { fehler: "Das ist schon erledigt." };
    const ok = (await sb("/rest/v1/rpc/rpg_held_quest_abschluss", { method: "POST", body: JSON.stringify({ p_user: nutzer, p_quest: Q1, p_geschick: BELOHNUNG.geschick, p_staerke: BELOHNUNG.staerke, p_fernkampf: BELOHNUNG.fernkampf, p_magie: BELOHNUNG.magie, p_lp: BELOHNUNG.lp, p_defense: BELOHNUNG.defense }) })
      .catch((e) => { console.error("Questabschluss (Migration 045 eingespielt?):", (e as Error).message); return null; })) as boolean | null;
    if (ok === null) return { fehler: "Der Abschluss konnte nicht gespeichert werden. Versuch es gleich noch einmal." };
    staende.set(nutzer, "fertig"); melden(nutzer); if (ok) belohnung = BELOHNUNG; /* false: schon früher abgeschlossen – keine zweite Belohnung */ }
  else if (f.stand && rang(f.stand) !== rang(s)) await setzen(sb, nutzer, f.stand);
  if (f.weiter) { const d = dialog(N.id, q1(nutzer), hat(nutzer, SCHRIFTSTUECK)); return { zeilen: f.zeilen, dialog: d || undefined }; }
  offen.delete(nutzer); return { zeilen: f.zeilen, ende: true, ...(belohnung ? { belohnung } : {}) }; }
export function gespraechEnde(nutzer: string): void { offen.delete(nutzer); }

/* ───────── Quest 02 „Der stille Rain“ (shared/quest02.ts) ───────── */
async function setzen2(sb: Sb, nutzer: string, s: Stand2): Promise<void> {
  if (q2(nutzer) === "fertig" || !s || s === "fertig" || s === q2(nutzer)) return; staende2.set(nutzer, s); melden(nutzer);
  await sb("/rest/v1/rpc/rpg_held_quest_setzen", { method: "POST", body: JSON.stringify({ p_user: nutzer, p_quest: Q2, p_stand: s }) }).catch((e) => console.error("Queststand 2 speichern:", (e as Error).message)); }
async function antworten2(sb: Sb, nutzer: string, id: string, a: string): Promise<Antwort1> {
  const N = npc2(id)!; if (offen.get(nutzer) !== (N.id as unknown as NpcId)) return { fehler: "Das Gespräch ist vorbei." };
  const s = q2(nutzer), f = antwort2(N.id, s, String(a || "").slice(0, 24)); if (!f) return { fehler: "Darauf weiß niemand eine Antwort." };
  let splitter = 0;
  if (f.abschluss) {
    if (lage(s).phase !== "bereit") return { fehler: "Das ist schon erledigt." };
    const ok = (await sb("/rest/v1/rpc/rpg_held_quest_abschluss", { method: "POST", body: JSON.stringify({ p_user: nutzer, p_quest: Q2, p_geschick: 0, p_staerke: 0, p_fernkampf: 0, p_magie: 0, p_lp: 0, p_defense: 0 }) })
      .catch((e) => { console.error("Questabschluss 2:", (e as Error).message); return null; })) as boolean | null;
    if (ok === null) return { fehler: "Der Abschluss konnte nicht gespeichert werden. Versuch es gleich noch einmal." };
    staende2.set(nutzer, "fertig"); melden(nutzer);
    if (ok) { splitter = BELOHNUNG2.splitter; const n = aufnehmen(sb, nutzer, "splitter", splitter); if (n < splitter) console.error("Quest 2: Splitter passten nicht in den Rucksack:", nutzer, n); } }
  else if (f.stand) await setzen2(sb, nutzer, f.stand);
  if (f.weiter) { const d = dialog2(N.id, q2(nutzer)); return { zeilen: f.zeilen, dialog: (d || undefined) as unknown as Dialog }; }
  offen.delete(nutzer); return { zeilen: f.zeilen, ende: true, ...(splitter ? { splitter } : {}) }; }
/** Ein Questobjekt (Bruchstelle, Rutenbündel) benutzen – nur in Osthof und nah dran. Zurück: Text für den Spieler */
export async function dingTat(sb: Sb, nutzer: string, ort: string, id: string, wx: number | undefined, wy: number | undefined): Promise<string> {
  const d = [...BRUCHSTELLEN, ...RUTEN].find((x) => x.id === id); if (!d) return "Hier ist nichts.";
  if (wx === undefined || wy === undefined || Math.hypot(d.x - wx, d.y - wy) > DING_WEIT + 1) return "Geh näher heran."; /* Weltfelder sind eindeutig: die Objekte liegen nur in Osthof */ void ort;
  const r = dingBenutzen(q2(nutzer), id); if (r.stand) await setzen2(sb, nutzer, r.stand); return r.text; }
/** Einen Mooshocker untersuchen (Bestiarium): zählt für die Quest, wenn man am Moosrain steht */
export async function mooshockerSehen(sb: Sb, nutzer: string, ort: string, wx: number | undefined, wy: number | undefined): Promise<void> {
  void ort; if (wx === undefined || wy === undefined || Math.hypot(MOOSRAIN[0] - wx, MOOSRAIN[1] - wy) > MOOSRAIN_WEIT) return;
  const n = mooshockerUntersucht(q2(nutzer)); if (n) await setzen2(sb, nutzer, n); }
/** Ein Gegner wurde besiegt (die Sim meldet den, der am meisten Schaden gemacht hat) */
export function erlegt(nutzer: string, typ: string): void { if (typ !== "mooshocker") return; const sb = sbJe.get(nutzer); if (!sb) return;
  const n = mooshockerBesiegt(q2(nutzer)); if (n) void setzen2(sb, nutzer, n); }
/** Nur für Tests: Speicher leeren */
export function questsVergessen(): void { staende2.clear(); staende.clear(); hoerer.clear(); offen.clear(); }
