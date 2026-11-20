/*
 * Blickrichtung aus dem Blickwinkel der Simulation. Konvention des Spiels: 0 = Osten, π/2 = Süden, die y-Achse zeigt nach unten.
 * Kampagnenkarten (Draufsicht): Welt- und Bildschirmwinkel sind gleich. Riss (isometrisch): der Weltwinkel wird erst auf den Bildschirm umgerechnet.
 * Mit Hysterese, damit die Figur an der Grenze zwischen zwei Richtungen nicht hin- und herflackert.
 */
export type Ansicht = "flach" | "iso";
export class DirectionResolver {
  private letzte = -1;
  constructor(private richtungen: { id: string; grad: number }[], private ansicht: Ansicht = "flach", private hystereseGrad = 8) {}
  /** Bildschirmwinkel (Grad, 0 = rechts, 90 = unten) zu einem Weltwinkel (Bogenmaß) */
  bildschirmGrad(welt: number): number { let x = Math.cos(welt), y = Math.sin(welt); if (this.ansicht === "iso") { const sx = x - y, sy = (x + y) / 2; x = sx; y = sy; } return ((Math.atan2(y, x) * 180 / Math.PI) % 360 + 360) % 360; }
  /** Richtung (id) zum Weltwinkel */
  aufloesen(welt: number): string {
    const g = this.bildschirmGrad(welt), ab = (r: { grad: number }) => { const d = Math.abs(((g - r.grad) % 360 + 540) % 360 - 180); return d; };
    let best = 0; for (let i = 1; i < this.richtungen.length; i++) if (ab(this.richtungen[i]) < ab(this.richtungen[best])) best = i;
    if (this.letzte >= 0 && best !== this.letzte && ab(this.richtungen[this.letzte]) < 180 / this.richtungen.length + this.hystereseGrad) best = this.letzte;
    this.letzte = best; return this.richtungen[best].id;
  }
  zuruecksetzen(): void { this.letzte = -1; }
}
