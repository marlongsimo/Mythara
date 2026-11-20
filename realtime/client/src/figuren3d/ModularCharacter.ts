/*
 * Eine modular ausgerüstete Figur in Phaser: ein Container mit je einem Sprite pro sichtbarer Ebene (Körperregionen, dann Gegenstände).
 * Alle Ebenen zeigen dasselbe Frame. Gegenstände werden je Frame nach ihrer Tiefe sortiert (weiter hinten zuerst) – so liegt z. B. der Umhang
 * von Süden gesehen hinter, von Norden gesehen vor der Figur. Verdeckung durch den Körper ist schon in die Bilder gerendert.
 * Ursprung jedes Sprites ist der Fußpunkt; die Tiefe in der Szene setzt der Aufrufer wie bei allen Figuren anhand des Fußpunkts.
 */
import Phaser from "phaser";
import type { Ausruestung, Slot } from "./CharacterConfiguration";
import { ausruestungPruefen, frameName, sichtbareEbenen, texturSchluessel } from "./CharacterConfiguration";
import type { CharacterAssetLoader, GeladeneFigur } from "./CharacterAssetLoader";
import { AnimationRegistry } from "./AnimationRegistry";
import { CharacterAnimator } from "./CharacterAnimator";
import type { Bewegungsstand } from "./CharacterAnimator";
import { DirectionResolver } from "./DirectionResolver";
import type { Ansicht } from "./DirectionResolver";
export class ModularCharacter {
  readonly container: Phaser.GameObjects.Container; readonly animator: CharacterAnimator; readonly registry: AnimationRegistry;
  ausruestung: Ausruestung = {}; private sprites = new Map<string, Phaser.GameObjects.Sprite>(); private koerper: string[] = []; private items: string[] = []; warnungen: string[] = [];
  private constructor(private scene: Phaser.Scene, private loader: CharacterAssetLoader, private g: GeladeneFigur, ansicht: Ansicht, hoehePx: number) {
    this.registry = new AnimationRegistry(g.figur); this.animator = new CharacterAnimator(this.registry, new DirectionResolver(g.figur.richtungen, ansicht));
    this.container = scene.add.container(0, 0); this.container.setScale(hoehePx / g.figur.spiel.renderHoehePx);
  }
  /** Figur anlegen und mit einer Ausrüstung (Standard, wenn keine angegeben) laden */
  static async erstellen(scene: Phaser.Scene, loader: CharacterAssetLoader, figurId: string, a?: Ausruestung, opt: { ansicht?: Ansicht; hoehePx?: number } = {}): Promise<ModularCharacter> {
    const g = await loader.figur(figurId); const c = new ModularCharacter(scene, loader, g, opt.ansicht || "flach", opt.hoehePx || g.figur.spiel.figurHoehePx);
    await c.ausruesten(a || g.figur.standardAusruestung); return c;
  }
  get figur() { return this.g.figur; } get katalog() { return this.g.katalog; }
  /** Ganze Ausrüstung setzen (z. B. so, wie der Server sie meldet). Ungültige Kombinationen werden abgelehnt. Zurück: Probleme (leer = übernommen). */
  async ausruesten(a: Ausruestung): Promise<string[]> {
    const p = ausruestungPruefen(this.g.figur, this.g.katalog, a); if (p.length) return p;
    const fehler = await this.loader.ebenenLaden(this.g, a); this.ausruestung = { ...a }; const { koerper, items } = sichtbareEbenen(this.g.figur, this.g.katalog, a);
    this.koerper = koerper.filter((e) => this.scene.textures.exists(texturSchluessel(this.g.figur.id, e))); this.items = items.filter((e) => this.scene.textures.exists(texturSchluessel(this.g.figur.id, e)));
    for (const [e, s] of this.sprites) if (!this.koerper.includes(e) && !this.items.includes(e)) { s.destroy(); this.sprites.delete(e); }
    const F = this.g.figur.fussNorm;
    for (const e of [...this.koerper, ...this.items]) if (!this.sprites.has(e)) { const s = this.scene.add.sprite(0, 0, texturSchluessel(this.g.figur.id, e), frameName("idle", "S", 0)).setOrigin(F.x, F.y); this.container.add(s); this.sprites.set(e, s); }
    this.warnungen = fehler.map((f) => "Ebene nicht geladen: " + f); this.zeichnen(); return this.warnungen;
  }
  /** Einen Slot wechseln oder leeren (null). Ein Zweihänder räumt die Nebenhand, ein Schild legt einen Zweihänder ab. */
  async anlegen(slot: Slot, id: string | null): Promise<string[]> {
    const neu: Ausruestung = { ...this.ausruestung, [slot]: id }, byId = new Map(this.g.katalog.gegenstaende.map((x) => [x.id, x]));
    if (id) { const g = byId.get(id); for (const s of (g ? g.occupies : []) as Slot[]) if (s !== slot) neu[s] = null; for (const [s, andere] of Object.entries(neu)) { const o = andere ? byId.get(andere) : undefined; if (o && s !== slot && (o.occupies || []).includes(slot)) neu[s as Slot] = null; } }
    return this.ausruesten(neu);
  }
  /** Jeden Frame: Animation fortschreiben und alle Ebenen auf dasselbe Frame setzen */
  aktualisieren(dt: number, s: Bewegungsstand): void { this.animator.schritt(dt, s); this.zeichnen(); }
  private zeichnen(): void {
    const A = this.animator, n = frameName(A.anim, A.richtung, A.frame);
    for (const s of this.sprites.values()) if (s.frame.name !== n && s.texture.has(n)) s.setFrame(n);
    const tiefe = (e: string) => { const m = this.g.meta.get(e), t = m && m.tiefe[A.anim] && m.tiefe[A.anim][A.richtung] ? m.tiefe[A.anim][A.richtung][A.frame] : null; return t == null ? 0 : t; };
    const reihe = [...this.koerper, ...[...this.items].sort((a, b) => tiefe(b) - tiefe(a))];
    reihe.forEach((e, i) => { const s = this.sprites.get(e); if (s) this.container.moveTo(s, i); });
  }
  /** Fußpunkt der Figur in der Welt und Zeichentiefe (wie bei allen Figuren: nach dem Fußpunkt) */
  setzen(x: number, y: number, tiefe: number): void { this.container.setPosition(x, y).setDepth(tiefe); }
  zerstoeren(): void { this.container.destroy(); this.sprites.clear(); }
}
