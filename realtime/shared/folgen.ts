/*
 * Riftmere – Folgen (Issue #54): jemand läuft einem Ziel mit etwas Abstand hinterher. Ohne Browser, ohne Netz: nur Stellen und Zeit.
 * Heute: der eigene Held folgt einem anderen Spieler (Browser, welt3d/spielwelt.ts – der Server prüft die Bewegung wie immer).
 * Später dieselbe Regel für Befreite in C3 und das Rabenküken (#49): dann folgt eine Figur dem Spieler.
 *
 * Ein Folger fragt alle TAKT Sekunden nach der Stelle des Ziels und sagt, was zu tun ist:
 *   { tun: "gehen", x, y }  ein neues Laufziel ABSTAND Felder vor dem Ziel (auf der Linie vom Folger zum Ziel)
 *   { tun: "warten" }       nah genug – stehen bleiben
 *   { tun: "ende", grund }  das Ziel ist weg (anderes Gebiet, offline), zu weit, teleportiert oder ohne Weg – das Folgen endet
 */
export interface Stelle { x: number; y: number }
export type FolgeTat = { tun: "gehen"; x: number; y: number } | { tun: "warten" } | { tun: "ende"; grund: "weg" | "weit" | "sprung" | "kein_weg" };
/** Abstand zum Ziel (Felder), Takt der neuen Laufziele (s), weiter weg endet es (Felder), so weit auf einmal = Teleport (Felder) */
export const FOLGE_ABSTAND = 1.5, FOLGE_TAKT = 0.4, FOLGE_WEIT = 40, FOLGE_SPRUNG = 12;

/** Wohin der Folger gehen soll, um abstand Felder hinter dem Ziel zu stehen (null: er ist nah genug) */
export function folgePunkt(ich: Stelle, ziel: Stelle, abstand = FOLGE_ABSTAND): Stelle | null {
  const dx = ich.x - ziel.x, dy = ich.y - ziel.y, d = Math.hypot(dx, dy); if (d <= abstand + 0.6) return null;
  return { x: ziel.x + dx / d * abstand, y: ziel.y + dy / d * abstand }; }

export class Folger {
  private t = 0; private zuletzt: Stelle | null = null;
  constructor(public readonly ziel: string, private o: { abstand?: number; takt?: number; weit?: number; sprung?: number } = {}) {}
  /** dt: Sekunden seit dem letzten Aufruf; ich: eigene Stelle; ziel: Stelle des Ziels (null = nicht mehr da). weg: hat das letzte „gehen“ einen Weg gefunden? */
  schritt(dt: number, ich: Stelle, ziel: Stelle | null, weg = true): FolgeTat {
    if (!ziel) return { tun: "ende", grund: "weg" };
    if (!weg) return { tun: "ende", grund: "kein_weg" };
    const vorher = this.zuletzt; this.zuletzt = { x: ziel.x, y: ziel.y };
    if (vorher && Math.hypot(ziel.x - vorher.x, ziel.y - vorher.y) > (this.o.sprung ?? FOLGE_SPRUNG)) return { tun: "ende", grund: "sprung" };
    if (Math.hypot(ziel.x - ich.x, ziel.y - ich.y) > (this.o.weit ?? FOLGE_WEIT)) return { tun: "ende", grund: "weit" };
    this.t -= dt; if (this.t > 0) return { tun: "warten" }; this.t = this.o.takt ?? FOLGE_TAKT;
    const p = folgePunkt(ich, ziel, this.o.abstand ?? FOLGE_ABSTAND); return p ? { tun: "gehen", x: p.x, y: p.y } : { tun: "warten" }; }
}
/** Text für das Ende des Folgens */
export const folgeEndeText = (name: string, grund: "weg" | "weit" | "sprung" | "kein_weg" | "selbst"): string =>
  grund === "kein_weg" ? `Kein Weg zu ${name}.` : grund === "weit" ? `${name} ist zu weit weg.` : grund === "sprung" ? `${name} ist fortgereist.` : grund === "weg" ? `${name} ist nicht mehr hier.` : `Du folgst ${name} nicht mehr.`;
