/*
 * Riftmere – Fischen (Phase 3b, 26.11.2026; Konzept doku/konzepte/phase-3.md Abschnitt 3b, Kanon: eine Angelrute ohne Stufen).
 * Gemeinsamer Sammel-Kern (shared/sammeln.ts, server/src/sammeln.ts) wie Holz und Erz:
 *   · Fanggründe (fanggruende.json): Stellen auf dem Wasser, je Grund nur wenige gleichzeitig – die Fische wandern, der Server wechselt die Stellen.
 *   · Bachling (1) und Mühlbarsch (10) mit Angelrute und Wurm (ein Wurm je Fang), Moorhecht (20) mit der Reuse, ohne Köder.
 *   · Die Fangchance hängt nur vom Fischen-Level ab (die Angelrute hat keine Stufen). 25 % Splitter-Fund wie bei Holz und Erz.
 *   · Moment „Strömung lesen“: wer im Fenster antippt, fängt zwei Fische (zwei Würmer) und bekommt 50 % mehr XP.
 *   · Würmer gräbt man ohne Werkzeug auf den Äckern des Osthofs (ebenfalls wandernde Stellen).
 * Jeder Fang meldet der Quest { art: "sammeln", ziel: <Fischart> } (z. B. „bachling“), jedes Graben { ziel: "wurmacker" }.
 */
import type { SammelArt, SammelWerkzeug } from "./sammeln";
import ORTE from "./fanggruende.json";

export const BERUF_FISCHEN = "fischen", BERUF_KOCHEN = "kochen";
export type FischArt = "bachling" | "muehlbarsch" | "moorhecht" | "wels" | "glutwels" | "hering" | "klippenbarsch" | "seeaal";
export interface FischDef extends SammelArt { art: FischArt; /** nur mit diesem Gerät */ werkzeug: string; /** verbraucht je Fisch (fehlt = ohne Köder) */ koeder?: string }
export const FISCHE: Record<FischArt, FischDef> = {
  bachling: { art: "bachling", name: "Bachling", level: 1, xp: 20, lo: 100, hi: 250, fall: 0.12, nachwachsen: 0, ertrag: "fisch_bachling_roh", werkzeug: "angelrute", koeder: "wurm" },
  muehlbarsch: { art: "muehlbarsch", name: "Mühlbarsch", level: 10, xp: 35, lo: 70, hi: 230, fall: 0.12, nachwachsen: 0, ertrag: "fisch_muehlbarsch_roh", werkzeug: "angelrute", koeder: "wurm" },
  moorhecht: { art: "moorhecht", name: "Moorhecht", level: 20, xp: 60, lo: 50, hi: 210, fall: 0.12, nachwachsen: 0, ertrag: "fisch_moorhecht_roh", werkzeug: "reuse" },
  /* Phase 7 (#40, D3): Graufurter Wels im Fährhafen, Fischen 45, mit Angelrute und Wurm */
  /* Phase 9 (#86): Glutwels im Strom bei Glutbrunn, Fischen 65, mit der Reuse */
  glutwels: { art: "glutwels", name: "Glutwels", level: 65, xp: 180, lo: 25, hi: 170, fall: 0.12, nachwachsen: 0, ertrag: "fisch_glutwels_roh", werkzeug: "reuse" },
  /* Phase 10 (#92): Smaragdküste – Hering (20) am Kai und in der Möwenbucht, Klippenbarsch (35) unter dem Leuchtturm, beide mit Angelrute und Wurm; Seeaal (45) am Wrack und in den Mangroven mit der Reuse */
  hering: { art: "hering", name: "Hering", level: 20, xp: 50, lo: 60, hi: 220, fall: 0.12, nachwachsen: 0, ertrag: "fisch_hering_roh", werkzeug: "angelrute", koeder: "wurm" },
  klippenbarsch: { art: "klippenbarsch", name: "Klippenbarsch", level: 35, xp: 85, lo: 45, hi: 200, fall: 0.12, nachwachsen: 0, ertrag: "fisch_klippenbarsch_roh", werkzeug: "angelrute", koeder: "wurm" },
  seeaal: { art: "seeaal", name: "Seeaal", level: 45, xp: 115, lo: 35, hi: 190, fall: 0.12, nachwachsen: 0, ertrag: "fisch_seeaal_roh", werkzeug: "reuse" },
  wels: { art: "wels", name: "Graufurter Wels", level: 45, xp: 110, lo: 35, hi: 190, fall: 0.12, nachwachsen: 0, ertrag: "fisch_wels_roh", werkzeug: "angelrute", koeder: "wurm" },
};
/** Die Geräte (ohne Stufen): Angelrute ab Level 1, Reuse ab Level 20 */
export const FISCH_GERAETE: SammelWerkzeug[] = [{ g: "angelrute", stufe: 0, level: 1 }, { g: "reuse", stufe: 0, level: 20 }];

export interface Fanggrund { id: string; name: string; art: FischArt; region: string; /** so viele Stellen gleichzeitig */ aktiv: number; felder: [number, number][]; /** nur mit diesem Quest-Schalter (Wehrkolk: wehr_heil aus B2) – je Spieler */ schalter?: string }
export const FANGGRUENDE: Fanggrund[] = (ORTE as unknown as { gruende: Fanggrund[] }).gruende;
/** Eine Stelle auf dem Wasser: „<grund>_<n>“ */
export interface Fangstelle { id: string; grund: string; art: FischArt; x: number; y: number }
export const FANGSTELLEN: Fangstelle[] = FANGGRUENDE.flatMap((g) => g.felder.map(([x, y], i) => ({ id: `${g.id}_${i + 1}`, grund: g.id, art: g.art, x, y })));
export const fangstelle = (id: string): Fangstelle | undefined => FANGSTELLEN.find((s) => s.id === id);
export const fanggrund = (id: string): Fanggrund | undefined => FANGGRUENDE.find((g) => g.id === id);
/** Schalter, ohne den an dieser Stelle keine Fische sind (oder "") */
export const fangSchalter = (stelle: string): string => { const S = fangstelle(stelle), G = S && fanggrund(S.grund); return (G && G.schalter) || ""; };

/** Würmer graben (ohne Werkzeug, ohne XP, ohne Splitter) */
export const WURMACKER_ART: SammelArt = { name: "Wurmacker", level: 1, xp: 0, lo: 170, hi: 250, fall: 0.25, nachwachsen: 0, ertrag: "wurm" };
const W = (ORTE as unknown as { wurmacker: { id: string; name: string; region: string; aktiv: number; felder: [number, number][] } }).wurmacker;
export const WURMACKER = { id: W.id, name: W.name, region: W.region, aktiv: W.aktiv };
export const WURMSTELLEN: { id: string; grund: string; art: "wurmacker"; x: number; y: number }[] = W.felder.map(([x, y], i) => ({ id: `${W.id}_${i + 1}`, grund: W.id, art: "wurmacker" as const, x, y }));
export const wurmstelle = (id: string) => WURMSTELLEN.find((s) => s.id === id);

/** alle 5 Ticks ein Versuch (Fischen), alle 3 Ticks (Graben); so nah muss man am Wasser stehen */
export const FANG_TAKT_MS = 2500, GRAB_TAKT_MS = 1500, ANGEL_WEIT = 2.2, GRAB_WEIT = 1.8;
/** Moment „Strömung lesen“ */
export const STROEMUNG_CHANCE = 0.08, STROEMUNG_MS = 1500;
/** So lange bleibt eine Stelle höchstens, bevor die Fische weiterziehen (Würmer: die Stelle wechselt ebenso) */
export const WANDER_MS = 90_000;
