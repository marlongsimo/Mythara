/*
 * Mythara – gemeinsame Regeln der Sammelberufe (Holzfällerei: shared/holz.ts, Bergbau: shared/bergbau.ts; Server: server/src/sammeln.ts).
 * Erfolgschance je Versuch wie in OSRS: lo bei Level 1, hi bei Level 99 (je /256), +8 je Werkzeugstufe, höchstens 95 %.
 * Level und Werkzeug machen schneller, nicht ertragreicher. Pro Stück mit 25 % zusätzlich 5–15 Splitter.
 */
export interface SammelArt { name: string; level: number; xp: number; /** Erfolgschance: lo bei Level 1, hi bei 99 (je /256), +8 je Werkzeugstufe */ lo: number; hi: number;
  /** Wahrscheinlichkeit, dass das Ziel nach einem Stück leer ist (Baum fällt, Ader erschöpft) */ fall: number; /** Sekunden bis nachgewachsen */ nachwachsen: number;
  /** Gegenstand, der in den Rucksack kommt */ ertrag: string; /** nur mit dieser Quest (ein Stück, dann ist es erledigt; das Ziel bleibt für andere stehen) */ quest?: string }
/** Werkzeug: Stufe 0 (Training) bis 5 (Mythisch), benutzbar ab diesem Level des Berufs */
export interface SammelWerkzeug { g: string; stufe: number; level: number }
export const SPLITTER_CHANCE = 0.25, SPLITTER_MIN = 5, SPLITTER_MAX = 15;
/** Chance je Versuch (höchstens 95 %) */
export function hiebChance(level: number, a: { lo: number; hi: number }, stufe: number): number {
  const L = Math.max(1, Math.min(99, level));
  return Math.min(0.95, ((a.lo + 8 * stufe) * (99 - L) + (a.hi + 8 * stufe) * (L - 1)) / 98 / 256);
}
