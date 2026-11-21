/*
 * Modulare Figuren aus der Mythara-Fabrik im Spiel: acht echte Blickrichtungen, Körper und Ausrüstung als übereinanderliegende Ebenen.
 *
 * Eine ModulFigur verhält sich für den übrigen Spielcode wie das bisherige Figurenbild (Sprite): Sie versteht play("lauf-…"), play("hieb-…"),
 * play("schild-…"), stop(), setTexture("figur-…") / setTexture("schildstand-…"), setFlipX und meldet "animationcomplete".
 * Daraus werden die Bewegungen der Fabrik: ruhe, laufen, angriff, block, schild_laufen. setOrigin und setScale von außen werden übergangen –
 * die Figur kennt ihren Fußpunkt und ihre Größe selbst. Mit richte(sx, sy) bekommt sie die Blickrichtung am Bildschirm (acht Richtungen);
 * solange niemand richte aufruft, gilt wie bisher links/rechts über setFlipX.
 * Die Bilder lädt sie beim ersten Gebrauch selbst nach (kein Eingriff in preload nötig); bis dahin ist sie unsichtbar.
 *
 * Welche Helden modular sind, steht in MODUL. Alle anderen Figuren bleiben, wie sie sind.
 */
import Phaser from "phaser";

interface Anim { bilder: number; rate: number; schleife: boolean; halten?: number }
interface Meta { id: string; feld: number; fuss: [number, number]; sichtbar_px: number; animationen: Record<string, Anim>; tiefe: Record<string, Record<string, number[][]>>; ebenen: string[]; waffen: string[] }
/** Held → Figur der Fabrik (Ordner unter img/figuren-fabrik/) */
export const MODUL: Record<string, string> = { schildwaechter: "held.krieger" };
const BASIS = "../img/figuren-fabrik/";
const laden = new WeakMap<Phaser.Scene, Map<string, Promise<Meta>>>();

/** Bilder und Angaben einer Figur in eine Szene laden (einmal je Szene und Figur) */
function figurLaden(scene: Phaser.Scene, figur: string): Promise<Meta> {
  let m = laden.get(scene); if (!m) { m = new Map(); laden.set(scene, m); } const da = m.get(figur); if (da) return da;
  const p = new Promise<Meta>((fertig, fehler) => {
    const metaKey = "modul:" + figur, lade = (dann: () => void) => { if (scene.load.isLoading()) { scene.load.once("complete", () => lade(dann)); return; } dann(); };
    const atlanten = (M: Meta) => { const fehlt = [...M.ebenen, ...M.waffen.flatMap((w) => [w + ".hinten", w + ".vorn"])].filter((e) => !scene.textures.exists(metaKey + ":" + e));
      if (!fehlt.length) { fertig(M); return; } lade(() => { for (const e of fehlt) scene.load.atlas(metaKey + ":" + e, BASIS + figur + "/" + e + ".webp", BASIS + figur + "/" + e + ".json"); scene.load.once("complete", () => fertig(M)); scene.load.start(); }); };
    if (scene.cache.json.exists(metaKey)) { atlanten(scene.cache.json.get(metaKey)); return; }
    lade(() => { scene.load.json(metaKey, BASIS + figur + "/" + figur + ".json"); scene.load.once("complete", () => { const M = scene.cache.json.get(metaKey) as Meta | undefined; if (M) atlanten(M); else fehler(new Error("Figur " + figur + " fehlt")); }); scene.load.start(); });
  });
  m.set(figur, p); return p;
}

export class ModulFigur extends Phaser.GameObjects.Container {
  private meta: Meta | null = null; private teile = new Map<string, Phaser.GameObjects.Sprite>(); private ziel: number;
  private zustand = "ruhe"; private einmal: string | null = null; private bild = 0; private uhr = 0; private richtung = 2; private achtRichtungen = false;
  private schritt = (_t: number, dt: number) => this.weiter(dt);
  /** hoehe: Körperhöhe am Bildschirm in Bildpunkten (wie bisher die Figurenhöhe der Szene) */
  constructor(scene: Phaser.Scene, x: number, y: number, readonly figur: string, hoehe: number) {
    super(scene, x, y); scene.add.existing(this); this.ziel = hoehe; this.setSize(hoehe * 0.6, hoehe);
    scene.events.on("update", this.schritt); this.once("destroy", () => scene.events.off("update", this.schritt));
    figurLaden(scene, figur).then((M) => this.aufbauen(M)).catch((e) => console.warn("Modulfigur:", e));
  }
  private aufbauen(M: Meta) {
    if (!this.scene) return; this.meta = M; const key = "modul:" + this.figur + ":", [fx, fy] = M.fuss;
    for (const e of [...M.waffen.map((w) => w + ".hinten"), ...M.ebenen, ...M.waffen.map((w) => w + ".vorn")]) { const s = this.scene.add.sprite(0, 0, key + e).setOrigin(fx, fy); this.add(s); this.teile.set(e, s); }
    super.setScale(this.ziel / M.sichtbar_px); this.setSize(M.feld * 0.4, M.sichtbar_px); this.zeigen();
  }
  /** Blickrichtung am Bildschirm (x nach rechts, y nach unten) – wählt eine von acht Richtungen */
  richte(sx: number, sy: number): this { if (Math.hypot(sx, sy) < 1e-3) return this; this.achtRichtungen = true; const r = ((Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) % 8) + 8) % 8; if (r !== this.richtung) { this.richtung = r; this.zeigen(); } return this; }
  /** Blickwinkel am Bildschirm (für die Weitergabe an Mitspieler) */
  get blick(): number { return this.richtung * Math.PI / 4; }
  /* ---------- wie ein Sprite ---------- */
  get flipX(): boolean { return this.richtung >= 3 && this.richtung <= 5; }
  setFlipX(links: boolean): this { if (!this.achtRichtungen) { const r = links ? 4 : 0; if (r !== this.richtung) { this.richtung = r; this.zeigen(); } } return this; }
  setOrigin(): this { return this; }
  setScale(): this { return this; }
  play(a: string | { key: string }): this { const key = typeof a === "string" ? a : a.key;
    if (key.startsWith("hieb")) { this.einmal = "angriff"; this.bild = 0; this.uhr = 0; this.zeigen(); }
    else this.setze(key.startsWith("schild") ? "schild_laufen" : key.startsWith("lauf") ? "laufen" : "ruhe"); return this; }
  stop(): this { return this; }
  setTexture(key: string): this { this.einmal = null; this.setze(key.startsWith("schildstand") || key.startsWith("schild-") ? "block" : "ruhe"); return this; }
  setFrame(): this { return this; }
  setInteractive(...a: unknown[]): this { if (a.length) return super.setInteractive(...(a as [])); return super.setInteractive(new Phaser.Geom.Rectangle(-this.width / 2, -this.height, this.width, this.height), Phaser.Geom.Rectangle.Contains); }
  /* ---------- Ablauf ---------- */
  private setze(z: string) { if (z === this.zustand) return; this.zustand = z; if (!this.einmal) { this.bild = 0; this.uhr = 0; this.zeigen(); } }
  private get anim(): string { const M = this.meta, a = this.einmal || this.zustand; return M && M.animationen[a] ? a : "ruhe"; }
  private weiter(dt: number) { const M = this.meta; if (!M || !this.visible) return; const A = M.animationen[this.anim]; this.uhr += dt; const d = 1000 / A.rate; let neu = false;
    while (this.uhr >= d) { this.uhr -= d; neu = true;
      if (this.bild + 1 < A.bilder) this.bild++;
      else if (this.einmal) { this.einmal = null; this.bild = 0; this.uhr = 0; this.emit("animationcomplete"); break; }   // der Hieb ist zu Ende: die Szene stellt die Haltung wieder her
      else if (A.schleife) this.bild = 0; else this.bild = A.halten ?? A.bilder - 1; }
    if (neu) this.zeigen(); }
  /** alle Ebenen auf dasselbe Bild stellen; Waffen nach ihrer Tiefe in diesem Bild ordnen */
  private zeigen() { const M = this.meta; if (!M) return; const a = this.anim, name = `${a}/${this.richtung}/${Math.min(this.bild, M.animationen[a].bilder - 1)}`;
    const w = [...M.waffen].sort((p, q) => (M.tiefe[q]?.[a]?.[this.richtung]?.[this.bild] ?? 0) - (M.tiefe[p]?.[a]?.[this.richtung]?.[this.bild] ?? 0));   // fernste zuerst
    const folge = [...w.map((x) => x + ".hinten"), ...M.ebenen, ...w.map((x) => x + ".vorn")]; let i = 0;
    for (const e of folge) { const s = this.teile.get(e); if (!s) continue; const da = s.texture.has(name); s.setVisible(da); if (da) s.setFrame(name); this.moveTo(s, i++); } }
}

/** Ist dieser Held eine modulare Figur? */
export const istModul = (held: string): boolean => Boolean(MODUL[held]);
/**
 * Das Figurenbild eines Helden anlegen: modular, wenn es ihn in der Fabrik gibt, sonst wie bisher das Standbild.
 * hoehe: Körperhöhe am Bildschirm. Der Rückgabewert lässt sich wie ein Sprite verwenden.
 */
export function heldenFigur(scene: Phaser.Scene, x: number, y: number, held: string, hoehe: number, bild = "figur-" + held): Phaser.GameObjects.Sprite {
  if (MODUL[held]) return new ModulFigur(scene, x, y, MODUL[held], hoehe) as unknown as Phaser.GameObjects.Sprite;
  return scene.add.sprite(x, y, bild);
}
/** Blickrichtung am Bildschirm setzen, falls die Figur acht Richtungen kann (sonst bleibt es bei links/rechts) */
export function richten(sp: unknown, sx: number, sy: number): void { if (sp instanceof ModulFigur) sp.richte(sx, sy); }
/** Blickwinkel am Bildschirm für die Weitergabe an Mitspieler: acht Richtungen bei modularen Figuren, sonst links (π) oder rechts (0) */
export function blickVon(sp: { flipX: boolean }): number { return sp instanceof ModulFigur ? sp.blick : sp.flipX ? Math.PI : 0; }
