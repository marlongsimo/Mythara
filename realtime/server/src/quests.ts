/*
 * Mythara Echtzeit – Quests auf dem Server (Migration 045: rpg_held.quests). Der Server führt den Stand je Spieler, prüft jede Antwort,
 * schickt Dialoge nur an den, der spricht, und schreibt die Belohnung genau einmal gut (rpg_held_quest_abschluss).
 * Quest 01 „Die gesperrte Straße“: Dialogbuch und Abläufe in shared/quest01.ts.
 * Ohne Migration 045 (Spalte fehlt): Stand nur im Arbeitsspeicher, Speichern scheitert mit Meldung im Log – das Spiel läuft weiter.
 */
import { Q1, Stand, STAENDE, Dialog, Zeile, NpcId, dialog, antwort, npc, laeuft, rang, SCHRIFTSTUECK, BELOHNUNG, REDE_WEIT } from "../../shared/quest01";
import { BEDINGUNGEN, AUFGENOMMEN, hat, abgeben, aufnehmen, besitzt, besitztIrgendwo } from "./inventar";
import { Q3 } from "../../shared/quest03";
import { Q2 } from "../../shared/quest02";
import { QUESTS } from "../../shared/quests";
import { staendeLaden, qStand, alleStaende, motorVerbinden, figurDa, motorReden, motorImGespraech, motorAntworten, motorEnde, motorSperre, motorEreignis, motorVergessen, motorObjekt } from "./questmotor";
import type { SkillXp } from "../../shared/kampfwerte";
import { SAMMEL_QUEST } from "./sammeln";
import { HANDWERK_QUEST } from "./handwerk";

type Sb = (pfad: string, init?: RequestInit) => Promise<unknown>;
/** Hörer: Stand von Quest 01 und die Stände aller Quests des Baukastens (id → Stand) */
type Hoerer = (s: Stand, b: Record<string, string>) => void;
const staende = new Map<string, Stand>(), hoerer = new Map<string, Set<Hoerer>>(), sbJe = new Map<string, Sb>();
const pruefen = (v: unknown): Stand => (typeof v === "string" && (STAENDE as readonly string[]).includes(v) ? (v as Stand) : "");

/** Den Queststand laden (einmal je Anmeldung; danach aus dem Speicher) */
export async function questsLaden(sb: Sb, nutzer: string): Promise<Stand> {
  sbJe.set(nutzer, sb); if (staende.has(nutzer)) return staende.get(nutzer)!;
  const r = (await sb(`/rest/v1/rpg_held?user_id=eq.${nutzer}&select=quests`).catch((e) => { console.error("Quests laden (Migration 045 eingespielt?):", (e as Error).message); return null; })) as { quests?: Record<string, { s?: string }> }[] | null;
  const s = pruefen(r && r[0] && r[0].quests && r[0].quests[Q1] ? r[0].quests[Q1].s : ""); staende.set(nutzer, s);
  staendeLaden(nutzer, r && r[0] ? r[0].quests : null, sb); /* Quests des Baukastens (questmotor.ts) */ return s; }
export const q1 = (nutzer: string): Stand => staende.get(nutzer) || "";
/** Stand von Quest 02 „Der stille Rain“ und Quest 03 „Der Säbel des Waldgottes“ (Baukasten) */
export const q2 = (nutzer: string): string => qStand(nutzer, Q2);
export const q3 = (nutzer: string): string => qStand(nutzer, Q3);
/** Stände aller Quests des Baukastens */
export const questsB = (nutzer: string): Record<string, string> => alleStaende(nutzer);
export function questHoeren(nutzer: string, f: Hoerer): () => void { let m = hoerer.get(nutzer); if (!m) hoerer.set(nutzer, (m = new Set())); m.add(f); return () => { m!.delete(f); }; }
function melden(nutzer: string) { const s = q1(nutzer), b = alleStaende(nutzer); for (const f of hoerer.get(nutzer) || []) try { f(s, b); } catch (x) { console.error("Quest-Hörer:", (x as Error).message); } }
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
export interface Antwort1 { dialog?: Dialog; zeilen?: Zeile[]; ende?: boolean; belohnung?: Partial<typeof BELOHNUNG>; fehler?: string; /** Splitter als Lohn */ splitter?: number }
const offen = new Map<string, NpcId>(); /* je Spieler: mit wem er gerade spricht */

/** Ein Gespräch beginnen (wx/wy: Stelle des Spielers in Weltfeldern) */
export function reden(nutzer: string, id: string, wx: number | undefined, wy: number | undefined): Antwort1 {
  if (figurDa(id)) { const sb = sbJe.get(nutzer); return sb ? (motorReden(sb, nutzer, id, wx, wy) as unknown as Antwort1) : { fehler: "Einen Moment …" }; } /* Quests des Baukastens (questmotor.ts) */
  const N = npc(id); if (!N) return { fehler: "Hier ist niemand." };
  if (wx === undefined || wy === undefined || Math.hypot(N.x - wx, N.y - wy) > (WEIT[N.id] ?? REDE_WEIT)) return { fehler: `Geh näher an ${N.name} heran.` };
  const d = dialog(N.id, q1(nutzer), hat(nutzer, SCHRIFTSTUECK)); if (!d) return { fehler: "Hier ist niemand." };
  offen.set(nutzer, N.id); if (N.id === "jori" && q1(nutzer) === "") { const sb = sbJe.get(nutzer); if (sb) void setzen(sb, nutzer, "angeboten"); }
  return { dialog: d }; }
/** Eine Antwort wählen: der Server prüft sie gegen den Stand und führt sie aus */
/** Gutgeschriebene Quest-XP sofort an den laufenden Helden der Kampfwelt geben (index.ts) – sonst stimmte das Level erst nach dem Neuanmelden (26.11.2026) */
let xpLive: (nutzer: string, xp: Partial<Record<"geschick" | "staerke" | "fernkampf" | "magie" | "lp" | "defense", number>>) => void = () => { /* noch nicht verbunden */ };
export function xpLiveSetzen(f: typeof xpLive): void { xpLive = f; }
export async function antworten(sb: Sb, nutzer: string, id: string, a: string): Promise<Antwort1> {
  if (motorImGespraech(nutzer, id)) return motorAntworten(sb, nutzer, id, a) as unknown as Promise<Antwort1>;
  const N = npc(id); if (!N || offen.get(nutzer) !== N.id) return { fehler: "Das Gespräch ist vorbei." };
  const s = q1(nutzer), mit = hat(nutzer, SCHRIFTSTUECK), f = antwort(N.id, s, mit, String(a || "").slice(0, 24)); if (!f) return { fehler: "Darauf weiß niemand eine Antwort." };
  let belohnung: typeof BELOHNUNG | undefined;
  if (f.abgeben) { if (!abgeben(sb, nutzer, SCHRIFTSTUECK)) return { fehler: "Du hast das Schriftstück nicht mehr." }; }
  if (f.abschluss) {
    if (s !== "frei") return { fehler: "Das ist schon erledigt." };
    const ok = (await sb("/rest/v1/rpc/rpg_held_quest_abschluss", { method: "POST", body: JSON.stringify({ p_user: nutzer, p_quest: Q1, p_geschick: BELOHNUNG.geschick, p_staerke: BELOHNUNG.staerke, p_fernkampf: BELOHNUNG.fernkampf, p_magie: BELOHNUNG.magie, p_lp: BELOHNUNG.lp, p_defense: BELOHNUNG.defense }) })
      .catch((e) => { console.error("Questabschluss (Migration 045 eingespielt?):", (e as Error).message); return null; })) as boolean | null;
    if (ok === null) return { fehler: "Der Abschluss konnte nicht gespeichert werden. Versuch es gleich noch einmal." };
    staende.set(nutzer, "fertig"); melden(nutzer); if (ok) { belohnung = BELOHNUNG; try { xpLive(nutzer, BELOHNUNG); } catch (e) { console.error("Quest-XP live:", (e as Error).message); } } /* false: schon früher abgeschlossen – keine zweite Belohnung */ }
  else if (f.stand && rang(f.stand) !== rang(s)) await setzen(sb, nutzer, f.stand);
  if (f.weiter) { const d = dialog(N.id, q1(nutzer), hat(nutzer, SCHRIFTSTUECK)); return { zeilen: f.zeilen, dialog: d || undefined }; }
  offen.delete(nutzer); return { zeilen: f.zeilen, ende: true, ...(belohnung ? { belohnung } : {}) }; }
export function gespraechEnde(nutzer: string): void { offen.delete(nutzer); motorEnde(nutzer); }

/* ───────── Questobjekte, Untersuchen, Erlegen (Baukasten) ───────── */
/** Ein Questobjekt (Bruchstelle, Rutenbündel …) benutzen – nur nah dran. Zurück: Text für den Spieler */
export async function dingTat(sb: Sb, nutzer: string, ort: string, id: string, wx: number | undefined, wy: number | undefined): Promise<string> { void ort; return motorObjekt(sb, nutzer, id, wx, wy); }
/** Eine Gegnerart untersuchen (Bestiarium): zählt für Quests (z. B. Mooshocker am Moosrain) */
export async function untersucht(sb: Sb, nutzer: string, typ: string, wx: number | undefined, wy: number | undefined): Promise<void> { motorEreignis(sb, nutzer, { art: "untersuchen", ziel: typ, x: wx, y: wy }); }
/** Ein Gegner wurde besiegt (die Sim meldet den, der am meisten Schaden gemacht hat) */
export function erlegt(nutzer: string, typ: string): void { const sb = sbJe.get(nutzer); if (sb) motorEreignis(sb, nutzer, { art: "erlegen", typ }); }
/** Region betreten / Stelle erreicht (welt.ts) */
const BETRETEN = QUESTS.some((q) => q.schritte.some((x) => x.ereignis.art === "betreten"));
export function betreten(nutzer: string, region: string, wx: number, wy: number): void { if (!BETRETEN) return; const sb = sbJe.get(nutzer); if (sb) motorEreignis(sb, nutzer, { art: "betreten", region, x: wx, y: wy }); }
/** Kampf-XP des geladenen Helden (index.ts), für Voraussetzungen und Bedingungen */
let heldXp: (nutzer: string) => SkillXp | undefined = () => undefined;
export function heldXpSetzen(f: typeof heldXp): void { heldXp = f; }
/* ───────── Quests des Baukastens (questmotor.ts, shared/questbau.ts) ───────── */
motorVerbinden({ melden, xp: (nutzer, x) => xpLive(nutzer, x), heldXp: (nutzer) => heldXp(nutzer),
  phase: (nutzer, id) => (id === Q1 ? (q1(nutzer) === "fertig" ? "fertig" : laeuft(q1(nutzer)) ? "laeuft" : "neu") : undefined) });
/* Questziele beim Sammeln (Baum des Waldgottes, Waldstein …) und Questrezepte (Esse, Amboss): Sperren und Schritte aus den Quest-Daten */
SAMMEL_QUEST.pruefen = (nutzer, art, quest) => motorSperre(nutzer, "sammeln", art, quest);
SAMMEL_QUEST.ertrag = (nutzer, art) => { const sb = sbJe.get(nutzer); if (sb) motorEreignis(sb, nutzer, { art: "sammeln", ziel: art }); };
HANDWERK_QUEST.pruefen = (nutzer, r) => motorSperre(nutzer, "herstellen", r.id, r.quest);
HANDWERK_QUEST.fertig = (nutzer, r) => { const sb = sbJe.get(nutzer); if (sb) motorEreignis(sb, nutzer, { art: "herstellen", rezept: r.id }); };
/** Nur für Tests: Speicher leeren */
export function questsVergessen(): void { motorVergessen(); staende.clear(); hoerer.clear(); offen.clear(); }
