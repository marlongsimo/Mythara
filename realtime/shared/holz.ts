/*
 * Mythara – Holzfällerei (seit 24.11.2026, Konzept doku/berufe/Mythara-Holzfaellerei.pdf).
 * Nur die eigenen Holzfäller-Bäume (leuchtende Adern, Figuren-Fabrik: img/objekte3d/skilling/holzfaellerei/) sind fällbar; die Landschaftsbäume bleiben Schmuck.
 * Ablauf: Baum antippen → alle 4 Ticks (2 s) ein Hieb. Erfolg → ein Stamm (stapelt nicht) und XP; mit 25 % dazu 5–15 Splitter.
 * Nach jedem Stamm fällt der Baum mit seiner Fällchance (sinkt mit dem Baumlevel); dann steht für alle der Stumpf, bis er nachwächst.
 * Kernschlag: nach einem Hieb manchmal (12 %) glühen die Adern auf; wer binnen 1,5 s antippt, bekommt zwei Stämme und 50 % mehr XP.
 * Der Server rechnet alles (server/src/holz.ts). Die XP stehen im Inventar des Helden (Feld „berufe“), wie die Bank – keine neue Tabelle.
 */
import STANDORTE_JSON from "./holz_standorte.json";

export type BaumArt = "eiche" | "tanne" | "eibe" | "moorweide" | "kernbaum" | "weltenbaum";
export interface BaumDef { art: BaumArt; name: string; level: number; xp: number; /** Erfolgschance: lo bei Level 1, hi bei 99 (je /256), +8 je Beilstufe */ lo: number; hi: number;
  /** Wahrscheinlichkeit, dass der Baum nach einem Stamm fällt */ fall: number; /** Sekunden bis der Stumpf wieder ein Baum ist */ nachwachsen: number; stamm: string;
  modell: string; stumpf: string; /** Höhe im Spiel (Felder) */ hoehe: number }
const M = "img/objekte3d/skilling/holzfaellerei/";
export const BAEUME: Record<BaumArt, BaumDef> = {
  eiche: { art: "eiche", name: "Eiche", level: 1, xp: 25, lo: 64, hi: 200, fall: 0.35, nachwachsen: 20, stamm: "stamm_eiche", modell: M + "eiche.glb", stumpf: M + "eiche-stumpf.glb", hoehe: 5.5 },
  tanne: { art: "tanne", name: "Tanne", level: 10, xp: 40, lo: 32, hi: 150, fall: 0.22, nachwachsen: 30, stamm: "stamm_tanne", modell: M + "tanne.glb", stumpf: M + "tanne-stumpf.glb", hoehe: 6.2 },
  eibe: { art: "eibe", name: "Eibe", level: 20, xp: 70, lo: 16, hi: 110, fall: 0.15, nachwachsen: 60, stamm: "stamm_eibe", modell: M + "eibe.glb", stumpf: M + "eibe-stumpf.glb", hoehe: 5.8 },
  moorweide: { art: "moorweide", name: "Moorweide", level: 35, xp: 110, lo: 8, hi: 80, fall: 0.12, nachwachsen: 90, stamm: "stamm_moorweide", modell: M + "moorweide.glb", stumpf: M + "moorweide-stumpf.glb", hoehe: 6 },
  kernbaum: { art: "kernbaum", name: "Kernbaum", level: 45, xp: 175, lo: 4, hi: 60, fall: 0.10, nachwachsen: 150, stamm: "stamm_kernbaum", modell: M + "kernbaum.glb", stumpf: M + "kernbaum-stumpf.glb", hoehe: 6.8 },
  weltenbaum: { art: "weltenbaum", name: "Weltenbaum-Setzling", level: 65, xp: 260, lo: 2, hi: 42, fall: 0.08, nachwachsen: 300, stamm: "stamm_weltenbaum", modell: M + "weltenbaum_setzling.glb", stumpf: M + "weltenbaum_setzling-stumpf.glb", hoehe: 5 },
};
/** Ein Holzfäller-Baum in der Welt (Weltfelder; die Lichtungen und Feldwege trägt werkzeug/welt/lichtungen.mjs in die Gebiete ein) */
export interface Holzbaum { id: string; art: BaumArt; x: number; y: number; region: string }
export interface Lichtung { name: string; baeume: Holzbaum[] }
export const LICHTUNGEN: Lichtung[] = (STANDORTE_JSON as { lichtungen: Lichtung[] }).lichtungen;
export const HOLZBAEUME: Holzbaum[] = LICHTUNGEN.flatMap((l) => l.baeume);
export const holzbaum = (id: string): Holzbaum | undefined => HOLZBAEUME.find((b) => b.id === id);

/** Holzbeile: Stufe 0 (Training) bis 5 (Mythisch); fällen ab Holzfällerei-Level, anlegen als Waffe wie andere Waffen (Geschick) */
export interface Beil { g: string; stufe: number; level: number }
export const BEILE: Beil[] = [
  { g: "holzbeil_training", stufe: 0, level: 1 }, { g: "holzbeil_einfach", stufe: 1, level: 10 }, { g: "holzbeil_selten", stufe: 2, level: 20 },
  { g: "holzbeil_episch", stufe: 3, level: 35 }, { g: "holzbeil_legendaer", stufe: 4, level: 45 }, { g: "holzbeil_mythisch", stufe: 5, level: 65 }];
export const beilVon = (g: string | undefined): Beil | undefined => BEILE.find((b) => b.g === g);

export const HOLZ_TAKT_MS = 2000;           // 4 Ticks
export const HOLZ_WEIT = 2.2;               // so nah muss man am Stamm stehen (Felder)
export const KERN_CHANCE = 0.12, KERN_FENSTER_MS = 1500;
export const SPLITTER_CHANCE = 0.25, SPLITTER_MIN = 5, SPLITTER_MAX = 15;
export const BERUF = "holzfaellerei";
/** Chance je Hieb (höchstens 95 %): Level und Beil machen schneller, nicht ertragreicher */
export function hiebChance(level: number, b: BaumDef, beilStufe: number): number {
  const L = Math.max(1, Math.min(99, level));
  return Math.min(0.95, ((b.lo + 8 * beilStufe) * (99 - L) + (b.hi + 8 * beilStufe) * (L - 1)) / 98 / 256);
}
