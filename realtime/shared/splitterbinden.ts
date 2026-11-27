/*
 * Riftmere – Splitterbinden (Phase 3a, 26.11.2026; Konzept doku/quests/4-berufe.pdf auf claude/relaxed-sagan-erl6lf).
 * Seelenlichter einfangen (Sammel-Kern wie Flachs, ohne Werkzeug: XP + Seelenlicht) und Ladungen binden (Wegstein am Bindestein).
 * Die Ladungen liegen nicht am Gegenstand, sondern als Zahl im Inventar (inventar.ladungen.wegstein) – Gegenstände mit eigenen Daten kommen erst in Phase 5.
 */
import type { SammelArt } from "./sammeln";
import STANDORTE_JSON from "./seelenlicht_standorte.json";

export const BERUF_BINDEN = "splitterbinden";
/** Höchstens so viele Ladungen im Wegstein */
export const LADUNG_MAX = 100;
/** Splitterkern (#18, beute.md): einmal am Bindestein in den Wegstein gesetzt (Merker im Inventar), fasst er so viele Ladungen */
export const LADUNG_MAX_KERN = 200, KERN_MERKER = "splitterkern_wegstein";
/** Gegenstand, dessen Ladungen ein Rezept „ladung:<g>“ füllt */
export const LADBAR = ["wegstein"] as const;
export type Ladbar = (typeof LADBAR)[number];
/** Resonanz (Moment-Bonus beim Laden): wie die Glut im Handwerk – 12 % je Stück, 1,5 s Fenster; dann doppelt so viele Ladungen für denselben Preis und +50 % XP */
export const RESONANZ_MAL = 2;

/* ───── Geladene Waffen (Phase 5b, Kanon): Waffen ab Selten am Bindestein laden – die Ladungen liegen am Exemplar (Fach.d.ladungen, shared/gegenstaende.ts) ───── */
/** Höchstens so viele Ladungen je Waffe */
export const WAFFE_LADUNG_MAX = 1000;
/** Splitterbinden-Level und XP je Ladung nach Seltenheit der Waffe */
export const WAFFE_LADEN: Record<string, { level: number; xp: number }> = { selten: { level: 20, xp: 3 }, episch: { level: 35, xp: 5 }, legendaer: { level: 45, xp: 8 }, mythisch: { level: 65, xp: 12 } };
/** So viel stärker schlägt eine geladene Waffe: Angriffs- und Schadensboni der Waffe × 1,1 */
export const WAFFE_LADUNG_PLUS = 0.1;
/** Rezept-Ziel „die angelegte Waffe“ (ladung:@waffe, entladen:@waffe) */
export const AN_WAFFE = "@waffe";

export type LichtArt = "matt" | "wiese";
export interface LichtDef extends SammelArt { art: LichtArt; /** Farbe des Leuchtens (3D) */ farbe: number; /** Schwebehöhe (Felder) */ hoehe: number }
/** Seelenlichter in Phase 3: Stufe 1 um die Linde, Stufe 10 in den Riedwiesen und an der Quelle der Obstwiesen (weitere Stufen folgen mit ihren Gebieten) */
export const LICHTER: Record<LichtArt, LichtDef> = {
  matt: { art: "matt", name: "Mattes Licht", level: 1, xp: 8, lo: 160, hi: 250, fall: 0.5, nachwachsen: 12, ertrag: "seelenlicht", farbe: 0xbfd6ff, hoehe: 1.3 },
  wiese: { art: "wiese", name: "Wiesenlicht", level: 10, xp: 15, lo: 120, hi: 240, fall: 0.5, nachwachsen: 18, ertrag: "seelenlicht", farbe: 0xb8ffcf, hoehe: 1.4 },
};
export interface Seelenlicht { id: string; art: LichtArt; x: number; y: number; region: string }
export const SEELENLICHTER: Seelenlicht[] = (STANDORTE_JSON as { lichter: Seelenlicht[] }).lichter;
export const seelenlicht = (id: string): Seelenlicht | undefined => SEELENLICHTER.find((l) => l.id === id);
/** alle 3 Ticks ein Griff, so nah muss man stehen */
export const FANG_TAKT_MS = 1500, FANG_WEIT = 1.8;
