/*
 * Geschosse im Bild: Pfeile, Armbrustbolzen und Zauberkugeln, die vom Schützen zum Ziel fliegen.
 *
 * Der Server rechnet die Geschosse (shared/sim.ts → geschosse, im Zustand als g: [id, x, y, art]); hier wird nur gezeichnet.
 * Ein Geschoss verlässt die Waffe erst, wenn die Schussbewegung so weit ist (los), startet an der Waffe (Bogenmitte, Stabspitze)
 * und holt die Stelle des Servers ein. Ist es dort verschwunden (Treffer), fliegt es die letzte Strecke zu Ende, schlägt ein
 * und gibt erst dann die zurückgehaltenen Trefferzahlen frei. Pfeile fliegen in einem flachen Bogen, Bolzen gerade,
 * Zauberkugeln leuchten und ziehen einen Schweif.
 */
import Phaser from "phaser";

export type GeschossArt = "pfeil" | "bolzen" | "zauber" | "feuer";
type Punkt = { x: number; y: number };

const TEMPO: Record<GeschossArt, number> = { pfeil: 760, bolzen: 900, zauber: 520, feuer: 480 };   // Bildpunkte je Sekunde, mindestens
const FARBE: Record<"zauber" | "feuer", [number, number]> = { zauber: [0x7fb4ff, 0xc8e4ff], feuer: [0xff7a22, 0xffd27a] };

export class Geschoss {
  private obj: Phaser.GameObjects.Container; private ort: Punkt | null = null; private gestartet = false; private weg = 0; private ziel: Punkt; private schweifUhr = 0; private alt: Punkt | null = null;
  /** am Server verschwunden: die letzte Stelle ist das Ende */
  ende = false; gehalten: (() => void)[] = []; fertig = false;
  constructor(private s: Phaser.Scene, readonly art: GeschossArt, private los: number, private start: () => Punkt, ziel: Punkt) {
    this.ziel = ziel; this.obj = s.add.container(0, 0).setVisible(false).setDepth(1e7 - 1); this.zeichnen();
  }
  private zeichnen() { const s = this.s, o = this.obj;
    if (this.art === "pfeil") { const g = s.add.graphics();
      g.lineStyle(2.2, 0x6b4423, 1).lineBetween(-17, 0, 9, 0);                                  // Schaft
      g.fillStyle(0xd9dee6, 1).fillTriangle(9, -3.2, 9, 3.2, 17, 0).lineStyle(1, 0x5a6068, 1).strokeTriangle(9, -3.2, 9, 3.2, 17, 0);   // Spitze
      g.fillStyle(0xe8e2d0, 1).fillTriangle(-17, 0, -11, 0, -19, -4).fillStyle(0xb8372b, 1).fillTriangle(-17, 0, -11, 0, -19, 4);   // Federn
      o.add(g); }
    else if (this.art === "bolzen") { const g = s.add.graphics();
      g.lineStyle(3.4, 0x3b2a1c, 1).lineBetween(-11, 0, 6, 0); g.fillStyle(0x9aa3ad, 1).fillTriangle(5, -4, 5, 4, 13, 0).lineStyle(1, 0x3a3f46, 1).strokeTriangle(5, -4, 5, 4, 13, 0);
      g.fillStyle(0x2c2c2c, 1).fillRect(-12, -3.5, 4, 7); o.add(g); }
    else { const [a, b] = FARBE[this.art], gr = this.art === "feuer" ? 1.25 : 1;
      o.add(s.add.circle(0, 0, 13 * gr, a, 0.28).setBlendMode(Phaser.BlendModes.ADD)); o.add(s.add.circle(0, 0, 8 * gr, b, 0.6).setBlendMode(Phaser.BlendModes.ADD)); o.add(s.add.circle(0, 0, 4 * gr, 0xffffff, 1).setBlendMode(Phaser.BlendModes.ADD)); }
  }
  /** neue Stelle des Servers (Szenenkoordinaten) */
  nach(p: Punkt) { this.ziel = p; }
  /** jedes Bild; true = noch unterwegs */
  schritt(dtMs: number, jetzt: number): boolean { if (this.fertig) return false; const dt = dtMs / 1000;
    if (!this.gestartet) { if (jetzt < this.los) return true; this.gestartet = true; this.ort = { ...this.start() }; this.obj.setVisible(true); }
    const o = this.ort!, dx = this.ziel.x - o.x, dy = this.ziel.y - o.y, rest = Math.hypot(dx, dy);
    const v = Math.max(TEMPO[this.art], this.ende ? rest * 9 : rest * 3) * dt;                    // holt die Serverstelle ein; nach dem Treffer: noch höchstens ~0,1 s
    if (this.ende && rest <= Math.max(v, 4)) { o.x = this.ziel.x; o.y = this.ziel.y; this.einschlag(); return false; }
    if (rest > 0.01) { const k = Math.min(1, v / rest); o.x += dx * k; o.y += dy * k; this.weg += Math.min(v, rest); }
    let hoch = 0; if (this.art === "pfeil") { const p = this.weg / (this.weg + rest + 1e-3); hoch = Math.sin(Math.PI * p) * Math.min(34, (this.weg + rest) * 0.1); }   // flacher Bogen
    const x = o.x, y = o.y - hoch; if (this.alt && (Math.abs(x - this.alt.x) + Math.abs(y - this.alt.y)) > 0.3) this.obj.setRotation(Math.atan2(y - this.alt.y, x - this.alt.x));
    this.alt = { x, y }; this.obj.setPosition(x, y);
    if (this.art === "zauber" || this.art === "feuer") { const t = jetzt / 1000; this.obj.setScale(1 + 0.12 * Math.sin(t * 30)); this.schweifUhr += dtMs;
      while (this.schweifUhr > 22) { this.schweifUhr -= 22; const [a] = FARBE[this.art], f = this.s.add.circle(x + (Math.random() - 0.5) * 5, y + (Math.random() - 0.5) * 5, 5 + Math.random() * 2, a, 0.55).setBlendMode(Phaser.BlendModes.ADD).setDepth(1e7 - 2);
        this.s.tweens.add({ targets: f, alpha: 0, scale: 0.2, duration: 320, onComplete: () => f.destroy() }); } }
    return true; }
  private einschlag() { const s = this.s, o = this.ort!; this.fertig = true; this.obj.destroy(); for (const f of this.gehalten) f(); this.gehalten = [];
    if (this.art === "zauber" || this.art === "feuer") { const [a, b] = FARBE[this.art];
      const blitz = s.add.circle(o.x, o.y, 10, b, 0.9).setBlendMode(Phaser.BlendModes.ADD).setDepth(1e7 - 1); s.tweens.add({ targets: blitz, scale: 2.6, alpha: 0, duration: 260, onComplete: () => blitz.destroy() });
      const ring = s.add.circle(o.x, o.y, 8).setStrokeStyle(3, a, 0.9).setDepth(1e7 - 1); s.tweens.add({ targets: ring, scale: 3.4, alpha: 0, duration: 380, onComplete: () => ring.destroy() });
      for (let i = 0; i < 7; i++) { const w = Math.random() * Math.PI * 2, f = s.add.circle(o.x, o.y, 2.5, b, 1).setBlendMode(Phaser.BlendModes.ADD).setDepth(1e7 - 1);
        s.tweens.add({ targets: f, x: o.x + Math.cos(w) * 30, y: o.y + Math.sin(w) * 22, alpha: 0, duration: 340, onComplete: () => f.destroy() }); } }
    else for (let i = 0; i < 4; i++) { const w = Math.random() * Math.PI * 2, f = s.add.rectangle(o.x, o.y, 3, 3, 0xd8c8a8, 1).setDepth(1e7 - 1);   // Splitter und Staub
      s.tweens.add({ targets: f, x: o.x + Math.cos(w) * 16, y: o.y + Math.sin(w) * 10 - 6, alpha: 0, duration: 260, onComplete: () => f.destroy() }); } }
  /** sofort entfernen (Gebiet verlassen) */
  entfernen(): void { if (!this.fertig) { this.fertig = true; this.obj.destroy(); for (const f of this.gehalten) f(); } }
}
