/*
 * Der eigene Held als Echtzeit-3D-Figur im Spiel (Versuch, abschaltbar): ?figur3d=1 schaltet ein, ?figur3d=0 aus (merkt sich das Gerät).
 *
 * Figur3D verhält sich für den übrigen Spielcode genau wie ModulFigur (modulfigur.ts): play("lauf-…"/"hieb-…"/"schild-…"), stop(),
 * setTexture("figur-…"/"schildstand-…"), setFlipX, richte(sx, sy), sterben(), "animationcomplete". Gezeichnet wird mit three.js
 * (echt3d/darsteller.ts, eigene Datei figur3d.js, erst bei Bedarf geladen) in eine Leinwand, die Phaser wie ein Sprite zeigt.
 * Karte, Tiefenreihenfolge, Oberfläche, Spiellogik, Server und Mitspieler bleiben unverändert.
 */
import Phaser from "phaser";
import { Held, STARTWAFFEN, HAARFARBEN } from "../../../shared/aussehen";

interface DarstellerT {
  breite: number; hoehe: number; fussY: number; aufloesung: number;
  zeige(ids: string[]): void; haut(url: string): Promise<void>; faerben(p: string, ziel: [number, number, number], gebaut: [number, number, number]): void;
  hat(n: string): boolean; dauer(n: string): number; spiele(n: string, einmal?: boolean, fertig?: () => void): void; blick(w: number): void;
  zeichne(dt: number, ziel: CanvasRenderingContext2D): void; entfernen(): void; teleport(dauer?: number): void;
}
type Echt3D = { Darsteller: { erstellen(url: string, hoehePx: number, aufloesung?: number): Promise<DarstellerT> }; standbild(ziel: HTMLCanvasElement, o: unknown): Promise<void> };

const P = new URLSearchParams(location.search);
/** Sind 3D-Figuren eingeschaltet? (Adresse oder Gerät) */
export function figur3dAn(): boolean {
  try { if (P.get("figur3d") === "1") localStorage.setItem("ez_figur3d", "1"); if (P.get("figur3d") === "0") localStorage.removeItem("ez_figur3d"); return localStorage.getItem("ez_figur3d") === "1"; }
  catch { return P.get("figur3d") === "1"; }
}
let skript: Promise<Echt3D> | null = null;
function echt3dLaden(): Promise<Echt3D> {
  if (!skript) skript = new Promise((ok, fehler) => { const w = window as unknown as { MytharaEcht3D?: Echt3D }; if (w.MytharaEcht3D) { ok(w.MytharaEcht3D); return; }
    const s = document.createElement("script"); s.src = "figur3d.js?v=" + (document.documentElement.dataset.v || ""); s.onload = () => (w.MytharaEcht3D ? ok(w.MytharaEcht3D) : fehler(new Error("figur3d.js ohne Inhalt"))); s.onerror = () => fehler(new Error("figur3d.js fehlt")); document.head.appendChild(s); });
  return skript;
}
const MODELLE = "../img/figuren-echt3d/";
/** Grundfiguren für Echtzeit-3D (fabrik/assets/basemann3d, basefrau3d) */
const MODELL: Record<string, string> = { mann: "basemann3d", frau: "basefrau3d" };
/** Farbe, in der Haare und Bärte gebaut sind (fabrik/frisuren.py, fabrik/bart.py) */
const GEBAUT: Record<string, [number, number, number]> = { mann: [59, 38, 24], frau: [110, 69, 41] };
let zaehler = 0;
/** Dauer des Teleport-Effekts (Sekunden) */
const TELEPORT_S = 1.8;
/** Teleport-Abreise der eigenen Figur, falls sie eine 3D-Figur ist. Zurück: wie lange es dauert (ms); 0 = keine 3D-Figur, sofort weiter */
export function teleportAbreise(f: unknown): number { return f instanceof Figur3D ? f.teleport() : 0; }

export class Figur3D extends Phaser.GameObjects.Container {
  private d: DarstellerT | null = null; private bild: Phaser.GameObjects.Image | null = null; private tex: Phaser.Textures.CanvasTexture | null = null;
  private zustand = "ruhe"; private einmal = false; private gestorben = false; private winkel = 0; private achtRichtungen = false;
  private schritt = (_t: number, dt: number) => this.weiter(dt);
  constructor(scene: Phaser.Scene, x: number, y: number, private hoehePx: number, private held: Held & { ich?: boolean }, private waffenQuelle: (() => string[]) | null) {
    super(scene, x, y); scene.add.existing(this); this.setSize(hoehePx * 0.6, hoehePx);
    scene.events.on("update", this.schritt); this.once("destroy", () => { scene.events.off("update", this.schritt); if (this.d) this.d.entfernen(); if (this.tex) this.tex.destroy(); });
    echt3dLaden().then((E) => E.Darsteller.erstellen(MODELLE + MODELL[held.aussehen.g] + ".glb", hoehePx, Math.min(2, window.devicePixelRatio || 1) * 1.25)).then((d) => this.aufbauen(d)).catch((e) => console.warn("Figur3D:", e));
  }
  private aufbauen(d: DarstellerT) {
    if (!this.scene) { d.entfernen(); return; } this.d = d; const key = "figur3d:" + zaehler++;
    this.tex = this.scene.textures.createCanvas(key, d.breite, d.hoehe) as Phaser.Textures.CanvasTexture;
    this.bild = this.scene.add.image(0, 0, key).setOrigin(0.5, d.fussY).setScale(1 / d.aufloesung); this.add(this.bild);
    const A = this.held.aussehen; void d.haut(MODELLE + "haut/" + MODELL[A.g] + "." + A.haut + ".webp").catch((e) => console.warn("Figur3D Haut:", e)); d.faerben("kopf.haar", HAARFARBEN[A.haar].rgb, GEBAUT[A.g]); d.faerben("kopf.bart", HAARFARBEN[A.haar].rgb, GEBAUT[A.g]);
    this.ausruestung(); this.anwenden(); this.weiter(0);
  }
  private waffen(): string[] { return this.held.ich && this.waffenQuelle ? this.waffenQuelle() : STARTWAFFEN[this.held.waffe].waffen; }
  private ausruestung() { if (!this.d) return; const A = this.held.aussehen, t = [...this.waffen()];
    if (A.frisur !== "glatze" && !t.some((e) => e.startsWith("kopf.helm."))) t.push("kopf.haar." + A.frisur);   /* unter dem Helm keine Frisur (sie stäche durch) */ if (A.g === "mann" && A.bart !== "ohne") t.push("kopf.bart." + A.bart); this.d.zeige(t); }
  /** Ausrüstung geändert (Inventar): sofort übernehmen */
  neuZeichnen(): void { this.ausruestung(); }
  /** Blickrichtung am Bildschirm (x nach rechts, y nach unten) – stufenlos, nicht nur acht Richtungen */
  richte(sx: number, sy: number): this { if (Math.hypot(sx, sy) < 1e-3) return this; this.achtRichtungen = true; this.winkel = Math.atan2(sx, sy); return this; }
  /** Blickwinkel am Bildschirm wie bei ModulFigur (0 = rechts, im Uhrzeigersinn) für die Weitergabe an Mitspieler */
  get blick(): number { return Math.atan2(Math.cos(this.winkel), Math.sin(this.winkel)); }
  /* ---------- wie ein Sprite ---------- */
  get flipX(): boolean { return Math.sin(this.winkel) < -0.2; }
  setFlipX(links: boolean): this { if (!this.achtRichtungen) this.winkel = links ? -Math.PI / 2 : Math.PI / 2; return this; }
  setOrigin(): this { return this; }
  setScale(): this { return this; }
  play(a: string | { key: string }): this { if (this.gestorben) return this; const key = typeof a === "string" ? a : a.key;
    if (key.startsWith("hieb")) { this.einmal = true; this.anwenden(STARTWAFFEN[this.held.waffe].angriff); }
    else this.setze(key.startsWith("schild") ? "schild_laufen" : key.startsWith("lauf") ? "laufen" : "ruhe"); return this; }
  stop(): this { return this; }
  setTexture(key: string): this { if (this.gestorben) return this; this.einmal = false; this.setze(key.startsWith("schildstand") || key.startsWith("schild-") ? "block" : "ruhe"); return this; }
  setFrame(): this { return this; }
  setInteractive(...a: unknown[]): this { if (a.length) return super.setInteractive(...(a as [])); return super.setInteractive(new Phaser.Geom.Rectangle(-this.width / 2, -this.height, this.width, this.height), Phaser.Geom.Rectangle.Contains); }
  /** Besiegt: Todesbewegung einmal, dann liegen bleiben. Zurück: Dauer in ms */
  sterben(): number { if (!this.d || !this.d.hat("tod")) return 0; this.gestorben = true; this.einmal = false; this.zustand = "tod"; this.d.spiele("tod", true); return this.d.dauer("tod"); }
  /** Teleport (Abreise): Bewegung teleport_weg mit Lichtsäule; die Figur vergeht im Licht und bleibt weg. Zurück: Dauer in ms (0 = keine 3D-Figur bereit) */
  teleport(): number { const d = this.d; if (!d || this.gestorben) return 0; this.gestorben = true; this.einmal = false; this.zustand = "teleport";
    if (d.hat("teleport_weg")) d.spiele("teleport_weg", true); d.teleport(TELEPORT_S); return TELEPORT_S * 1000; }
  /** Trinken oder Essen: Hand zum Mund (Bewegung „trinken“, ohne Gegenstand). Die Waffe in der Hand ist währenddessen ausgeblendet, der Schild bleibt.
   *  fertig: am Ende. Zurück: Dauer in ms (0 = keine 3D-Figur bereit oder Bewegung fehlt) */
  trinken(fertig?: () => void): number { const d = this.d; if (!d || this.gestorben || !d.hat("trinken")) return 0;
    const A = this.held.aussehen, t = this.waffen().filter((w) => !w.startsWith("waffe.")); if (A.frisur !== "glatze" && !t.some((e) => e.startsWith("kopf.helm."))) t.push("kopf.haar." + A.frisur); if (A.g === "mann" && A.bart !== "ohne") t.push("kopf.bart." + A.bart);
    d.zeige(t); this.einmal = true; d.spiele("trinken", true, () => { this.einmal = false; this.ausruestung(); this.anwenden(); if (fertig) fertig(); }); return d.dauer("trinken"); }
  /* ---------- Ablauf ---------- */
  private setze(z: string) { if (this.gestorben || z === this.zustand) return; this.zustand = z; if (!this.einmal) this.anwenden(); }
  /** Zustand des Spiels → Bewegung der Figur */
  private anwenden(einmalig?: string) { const d = this.d; if (!d) return;
    if (einmalig) { d.spiele(einmalig, true, () => { this.einmal = false; this.anwenden(); this.emit("animationcomplete"); }); return; }
    const z = this.zustand; if (z === "block") d.spiele("block", true); else d.spiele(z === "laufen" ? "laufen" : z === "schild_laufen" ? "gehen" : z === "tod" ? "tod" : "ruhe", z === "tod"); }
  private weiter(dtMs: number) { const d = this.d; if (!d || !this.tex || !this.visible) return; d.blick(this.winkel); d.zeichne(dtMs / 1000, this.tex.getContext()); this.tex.refresh(); }
}

/** Standbild des eigenen Helden in 3D (Heldeneditor, Profilbild) – wie heldZeichnen, aber aus der 3D-Figur */
export async function heldStandbild3D(ziel: HTMLCanvasElement, held: Held, richtung: number, ausschnitt: "ganz" | "kopf", mitWaffe: boolean): Promise<void> {
  const E = await echt3dLaden(), A = held.aussehen, zeige: string[] = mitWaffe ? [...STARTWAFFEN[held.waffe].waffen] : [];
  if (A.frisur !== "glatze") zeige.push("kopf.haar." + A.frisur); if (A.g === "mann" && A.bart !== "ohne") zeige.push("kopf.bart." + A.bart);
  const f = HAARFARBEN[A.haar].rgb;
  await E.standbild(ziel, { url: MODELLE + MODELL[A.g] + ".glb", zeige, haut: MODELLE + "haut/" + MODELL[A.g] + "." + A.haut + ".webp",
    haar: [{ praefix: "kopf.haar", ziel: f, gebaut: GEBAUT[A.g] }, { praefix: "kopf.bart", ziel: f, gebaut: GEBAUT[A.g] }], richtung, ausschnitt });
}
