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
/** Gegenstand, dessen Ladungen ein Rezept „ladung:<g>“ füllt */
export const LADBAR = ["wegstein"] as const;
export type Ladbar = (typeof LADBAR)[number];
/** Resonanz (Moment-Bonus beim Laden): wie die Glut im Handwerk – 12 % je Stück, 1,5 s Fenster; dann doppelt so viele Ladungen für denselben Preis und +50 % XP */
export const RESONANZ_MAL = 2;

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
