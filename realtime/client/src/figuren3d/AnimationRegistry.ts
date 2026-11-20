/*
 * Welche Animationen eine Figur hat und wie sie laufen (Frames, Takt, Schleife, Halten). Prüft, ob jede Ebene alle Frames besitzt.
 * Alle Ebenen einer Figur zeigen immer dasselbe Frame – die Uhr dafür hat der CharacterAnimator; Phaser-Animationen je Ebene werden nicht benutzt.
 */
import type { AnimationDef, FigurDaten } from "./CharacterConfiguration";
import { frameName } from "./CharacterConfiguration";
export class AnimationRegistry {
  readonly anims: Map<string, AnimationDef>;
  constructor(readonly figur: FigurDaten) { this.anims = new Map(Object.entries(figur.animationen)); }
  hat(anim: string): boolean { return this.anims.has(anim); }
  def(anim: string): AnimationDef { const a = this.anims.get(anim); if (!a) throw new Error("Unbekannte Animation " + anim); return a; }
  /** Frame-Index nach t Sekunden seit Start der Animation */
  frameBei(anim: string, t: number): { i: number; fertig: boolean } {
    const a = this.def(anim), n = Math.floor(t * a.fps);
    if (a.schleife) return { i: ((n % a.frames) + a.frames) % a.frames, fertig: false };
    return { i: Math.min(n, a.frames - 1), fertig: n >= a.frames };
  }
  /** Fehlende Frames einer Ebene (Phaser-Textur) – für die Qualitätskontrolle im Spiel */
  fehlend(hatFrame: (name: string) => boolean): string[] {
    const f: string[] = []; for (const [an, a] of this.anims) for (const r of this.figur.richtungen) for (let i = 0; i < a.frames; i++) { const n = frameName(an, r.id, i); if (!hatFrame(n)) f.push(n); } return f;
  }
}
