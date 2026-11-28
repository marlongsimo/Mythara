/*
 * Mythara – Felder und Schritte („Felder und Schräge“, Empfehlung Mythara): Die Welt ist ein Feldraster, jede Figur steht auf genau einem Feld
 * (Feld = Math.floor der Koordinate, Mitte = Feld + 0,5). Bewegung von Feldmitte zu Feldmitte in 8 Richtungen, ein schräger Schritt zählt wie ein
 * gerader (keine Ecken schneiden). Gehen 1 Feld je Game-Tick (0,5 s = 2 Felder/s), Sprint 2 Felder je Tick (4 Felder/s).
 * Abstand in Feldern = Chebyshev (max(|dx|, |dy|)). Nahkampf nur von einem angrenzenden Feld N, O, S oder W (kein schräger Schlag),
 * Fern- und Magieangriffe: Feldabstand ≤ Reichweite und freie Sicht. Angriffstempo und Hellebarde (Reichweite 2) bleiben hier außen vor.
 */
export interface FPunkt { x: number; y: number }
export const FELD_TICK = 0.5, GEHEN_FELDER = 1, SPRINT_FELDER = 2;
/** Felder je Sekunde beim Gehen und Sprinten */
export const GEHEN_TEMPO = GEHEN_FELDER / FELD_TICK, SPRINT_TEMPO_FELDER = SPRINT_FELDER / FELD_TICK;
export const feld = (v: number): number => Math.floor(v);
export const mitte = (p: FPunkt): FPunkt => ({ x: Math.floor(p.x) + 0.5, y: Math.floor(p.y) + 0.5 });
export const inMitte = (p: FPunkt, e = 1e-3): boolean => Math.abs(p.x - (Math.floor(p.x) + 0.5)) < e && Math.abs(p.y - (Math.floor(p.y) + 0.5)) < e;
/** Abstand in Feldern (Chebyshev über die Felder) */
export const feldAbstand = (a: FPunkt, b: FPunkt): number => Math.max(Math.abs(feld(a.x) - feld(b.x)), Math.abs(feld(a.y) - feld(b.y)));
/** Weg-Länge in Schritten zwischen zwei Stellen (Chebyshev, stetig): so viel kostet eine Bewegung, schräg wie gerade */
export const schrittLaenge = (a: FPunkt, b: FPunkt): number => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
/** Nahkampf: b steht auf einem Feld direkt N, O, S oder W von a */
export const nahkampfFeld = (a: FPunkt, b: FPunkt): boolean => Math.abs(feld(a.x) - feld(b.x)) + Math.abs(feld(a.y) - feld(b.y)) === 1;
/** Die vier Nahkampf-Felder um ein Ziel (Mitten) */
export const kreuzFelder = (p: FPunkt): FPunkt[] => { const i = feld(p.x), j = feld(p.y); return [[0, -1], [1, 0], [0, 1], [-1, 0]].map(([dx, dy]) => ({ x: i + dx + 0.5, y: j + dy + 0.5 })); };
/** Ein Schritt in Richtung (rx, ry) als Feldversatz (-1/0/1 je Achse); null bei keiner Richtung */
export function richtungsSchritt(rx: number, ry: number): [number, number] | null {
  const l = Math.hypot(rx, ry); if (l < 0.05) return null; const a = Math.atan2(ry, rx), o = Math.round(a / (Math.PI / 4));
  return [Math.round(Math.cos(o * Math.PI / 4)), Math.round(Math.sin(o * Math.PI / 4))];
}
/** Darf man von Feld (i, j) um (dx, dy) gehen? Schräg nur, wenn beide geraden Nachbarn frei sind (keine Ecken schneiden) */
export function schrittFrei(frei: (i: number, j: number) => boolean, i: number, j: number, dx: number, dy: number): boolean {
  if (!frei(i + dx, j + dy)) return false; return !(dx && dy) || (frei(i + dx, j) && frei(i, j + dy));
}
