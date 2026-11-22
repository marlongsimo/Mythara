/*
 * Mythara – die bisherigen Figurenbilder in der 3D-Welt (die Figuren selbst bleiben, wie sie sind).
 *
 * Eine FigurLeinwand setzt eine modulare Figur der Fabrik (img/figuren-fabrik/<figur>/: Ebenen-Atlanten, Bewegungen, 8 Richtungen,
 * Tiefe der Waffen – dieselben Daten und Regeln wie client/src/modulfigur.ts) Bild für Bild in eine 2D-Leinwand und zeigt sie
 * als Aufsteller (Figurbild) am Fußpunkt in der 3D-Welt. Der eigene Held: nur die gewählten Ebenen, Haut, Haar und Bart gefärbt,
 * sichtbar nur die angelegten Waffen. Welche der 8 gemalten Richtungen gezeigt wird, hängt von der Kamera ab (sie lässt sich drehen).
 */
import * as THREE from "three";
import { Figurbild } from "./figurbild";
import { Held, ebenenVon, farbeVon, farbMatrix, figurVon, STARTWAFFEN } from "../../../shared/aussehen";

interface Anim { bilder: number; rate: number; schleife: boolean; halten?: number }
interface Meta { id: string; angriff?: string; bezug?: { haut: number; haar: number; bart: number }; feld: number; fuss: [number, number]; sichtbar_px: number; animationen: Record<string, Anim>; tiefe: Record<string, Record<string, number[][]>>; ebenen: string[]; waffen: string[] }
interface Rahmen { x: number; y: number; w: number; h: number; sx: number; sy: number }
interface Atlas { bild: CanvasImageSource; rahmen: Record<string, Rahmen> }

const BASIS = "../img/figuren-fabrik/";
const ALLE_WAFFEN = [...new Set(Object.values(STARTWAFFEN).flatMap((w) => w.waffen))];
const metas = new Map<string, Promise<Meta>>(), atlanten = new Map<string, Promise<Atlas | null>>();
const meta = (figur: string): Promise<Meta> => { let p = metas.get(figur); if (!p) { p = fetch(BASIS + figur + "/" + figur + ".json").then((r) => { if (!r.ok) throw new Error("Figur " + figur + " fehlt"); return r.json(); }); metas.set(figur, p); } return p; };
function bildLaden(url: string): Promise<HTMLImageElement> { return new Promise((ok, fehler) => { const i = new Image(); i.decoding = "async"; i.onload = () => ok(i); i.onerror = () => fehler(new Error(url)); i.src = url; }); }
/** Ein Atlas einer Ebene, auf Wunsch mit Farbmatrix (4 × 5, wie Phaser ColorMatrix) einmal umgefärbt */
function atlas(figur: string, ebene: string, matrix?: number[]): Promise<Atlas | null> {
  const k = figur + "/" + ebene + (matrix ? "|" + matrix.map((v) => v.toFixed(4)).join(",") : ""); let p = atlanten.get(k);
  if (!p) { p = Promise.all([fetch(BASIS + figur + "/" + ebene + ".json").then((r) => (r.ok ? r.json() : null)), bildLaden(BASIS + figur + "/" + ebene + ".webp")]).then(([j, img]) => {
      if (!j) return null; const rahmen: Record<string, Rahmen> = {};
      for (const [n, f] of Object.entries(j.frames as Record<string, { frame: { x: number; y: number; w: number; h: number }; spriteSourceSize: { x: number; y: number } }>)) rahmen[n] = { x: f.frame.x, y: f.frame.y, w: f.frame.w, h: f.frame.h, sx: f.spriteSourceSize.x, sy: f.spriteSourceSize.y };
      if (!matrix) return { bild: img, rahmen };
      const c = document.createElement("canvas"); c.width = img.width; c.height = img.height; const g = c.getContext("2d")!; g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, c.width, c.height), a = d.data, m = matrix;
      for (let i = 0; i < a.length; i += 4) { const r = a[i], gg = a[i + 1], b = a[i + 2], al = a[i + 3]; if (!al) continue;
        a[i] = Math.min(255, m[0] * r + m[1] * gg + m[2] * b + m[3] * al + m[4] * 255); a[i + 1] = Math.min(255, m[5] * r + m[6] * gg + m[7] * b + m[8] * al + m[9] * 255); a[i + 2] = Math.min(255, m[10] * r + m[11] * gg + m[12] * b + m[13] * al + m[14] * 255); }
      g.putImageData(d, 0, 0); return { bild: c, rahmen }; }).catch(() => null); atlanten.set(k, p); }
  return p;
}
const FLECK = new THREE.CircleGeometry(0.42, 16), FLECK_MAT = new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.32, depthWrite: false });

export class FigurLeinwand {
  readonly bild: Figurbild; readonly fleck: THREE.Mesh; private leinwand = document.createElement("canvas"); private g = this.leinwand.getContext("2d")!; private tex: THREE.CanvasTexture;
  private M: Meta | null = null; private ebenen = new Map<string, Atlas>(); private reihe: string[] = []; private waffen: string[] = []; private angriffName = "angriff";
  private zustand = "ruhe"; private einmal: string | null = null; private nr = 0; private uhr = 0; private richtung = 2; private gestorben = false; private alt = ""; private blickW = 0;
  /** fertig: nach Ende einer einmaligen Bewegung (Angriff) */ fertig: (() => void) | null = null;
  /** figur: Ordner der Fabrik (etwa gegner.bandit.v003) oder der eigene Held (eigen); hoehe: sichtbare Körperhöhe in Feldern */
  constructor(szene: THREE.Scene, figur: string, private hoehe: number, private eigen?: (Held & { ich?: boolean }) | null, private waffenQuelle?: (() => string[]) | null) {
    this.tex = new THREE.CanvasTexture(this.leinwand); this.tex.colorSpace = THREE.SRGBColorSpace; this.tex.minFilter = THREE.LinearFilter; this.tex.generateMipmaps = false;
    this.bild = new Figurbild(this.tex); this.bild.silhouette(false); this.bild.gruppe.visible = false; szene.add(this.bild.gruppe);
    this.fleck = new THREE.Mesh(FLECK, FLECK_MAT); this.fleck.rotation.x = -Math.PI / 2; szene.add(this.fleck);
    void this.laden(eigen ? figurVon(eigen.aussehen) : figur).catch((e) => console.warn("Figur:", e));
  }
  private async laden(figur: string) {
    const M0 = await meta(figur), H = this.eigen;
    const ebenen = H ? ebenenVon(H.aussehen) : M0.ebenen.map((e) => ({ ebene: e, faerben: undefined as undefined | "haut" | "haar" | "bart" }));
    this.waffen = H ? (H.ich ? ALLE_WAFFEN : STARTWAFFEN[H.waffe].waffen) : M0.waffen; this.angriffName = H ? STARTWAFFEN[H.waffe].angriff : M0.angriff || "angriff";
    const auftraege: Promise<void>[] = [];
    for (const e of ebenen) { const m = H && e.faerben && M0.bezug ? farbMatrix(farbeVon(H.aussehen, e.faerben), M0.bezug[e.faerben]) : undefined; auftraege.push(atlas(figur, e.ebene, m).then((a) => { if (a) this.ebenen.set(e.ebene, a); })); }
    for (const w of this.waffen) for (const s of [".hinten", ".vorn"]) auftraege.push(atlas(figur, w + s).then((a) => { if (a) this.ebenen.set(w + s, a); }));
    await Promise.all(auftraege); this.reihe = ebenen.map((e) => e.ebene);
    this.leinwand.width = this.leinwand.height = M0.feld; this.M = M0; const gr = M0.feld * this.hoehe / M0.sichtbar_px;
    this.bild.setze(this.tex, [1, 1], [0, 0], [gr, gr], [M0.fuss[0], 1 - M0.fuss[1]]); this.bild.gruppe.visible = true; this.alt = ""; this.zeichnen();
  }
  get geladen(): boolean { return Boolean(this.M); }
  /** Stelle (Weltfelder) und Bodenhöhe */
  stelle(x: number, y: number, z: number): void { this.bild.gruppe.position.set(x, y + 0.08, z); this.fleck.position.set(x, y + 0.05, z); }
  /** Blickrichtung in der Welt (x Osten, z Süden); die Kamera bestimmt, welche gemalte Richtung zu sehen ist */
  blick(wx: number, wz: number): void { if (Math.hypot(wx, wz) > 1e-3) this.blickW = Math.atan2(wz, wx); }
  /** Blickwinkel in der Welt (0 = Osten, π/2 = Süden) – wie ModulFigur.blick in der 2D-Welt */
  get blickWinkel(): number { return this.blickW; }
  setze(z: "ruhe" | "laufen" | "block" | "schild_laufen"): void { if (this.gestorben || z === this.zustand) return; this.zustand = z; if (!this.einmal) { this.nr = 0; this.uhr = 0; } }
  angriff(): void { if (this.gestorben) return; this.einmal = this.angriffName; this.nr = 0; this.uhr = 0; }
  /** Besiegt: Todesbewegung einmal, liegen bleiben. Zurück: Dauer in ms (0 ohne Todesbewegung) */
  sterben(): number { const M = this.M; if (!M || !M.animationen.tod) return 0; this.gestorben = true; this.einmal = null; this.zustand = "tod"; this.nr = 0; this.uhr = 0; return 1000 * M.animationen.tod.bilder / M.animationen.tod.rate; }
  sichtbar(an: boolean): void { this.bild.gruppe.visible = an && Boolean(this.M); this.fleck.visible = an; }
  private get anim(): string { const M = this.M, a = this.einmal || this.zustand; return M && M.animationen[a] ? a : "ruhe"; }
  /** weiterrechnen; gieren: Drehung der Kamera (Bogenmaß, wie Welt3D.gieren) */
  schritt(dtMs: number, gieren: number): void {
    const M = this.M; if (!M) return; const A = M.animationen[this.anim]; this.uhr += dtMs; const d = 1000 / A.rate;
    while (this.uhr >= d) { this.uhr -= d; if (this.nr + 1 < A.bilder) this.nr++; else if (this.einmal) { this.einmal = null; this.nr = 0; this.uhr = 0; const f = this.fertig; if (f) f(); break; } else if (A.schleife) this.nr = 0; else this.nr = A.halten ?? A.bilder - 1; }
    /* Blick in der Welt → am Bildschirm: rechts = (cos g, −sin g), zur Kamera = (sin g, cos g) */
    const wx = Math.cos(this.blickW), wz = Math.sin(this.blickW), sx = wx * Math.cos(gieren) - wz * Math.sin(gieren), sy = wx * Math.sin(gieren) + wz * Math.cos(gieren);
    this.richtung = ((Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) % 8) + 8) % 8; this.zeichnen();
  }
  private zeichnen() {
    const M = this.M; if (!M) return; const a = this.anim, b = Math.min(this.nr, M.animationen[a].bilder - 1), r = this.richtung, name = `${a}/${r}/${b}`;
    const an = this.eigen && this.eigen.ich && this.waffenQuelle ? new Set(this.waffenQuelle()) : null, sichtbar = this.waffen.filter((w) => !an || an.has(w));
    const schluessel = name + "|" + sichtbar.join(","); if (schluessel === this.alt) return; this.alt = schluessel;
    const w = [...sichtbar].sort((p, q) => (M.tiefe[q]?.[a]?.[r]?.[b] ?? 0) - (M.tiefe[p]?.[a]?.[r]?.[b] ?? 0));   /* fernste zuerst */
    const g = this.g; g.clearRect(0, 0, M.feld, M.feld);
    for (const e of [...w.map((x) => x + ".hinten"), ...this.reihe, ...w.map((x) => x + ".vorn")]) { const A = this.ebenen.get(e), f = A && A.rahmen[name]; if (!A || !f) continue; g.drawImage(A.bild, f.x, f.y, f.w, f.h, f.sx, f.sy, f.w, f.h); }
    this.tex.needsUpdate = true;
  }
  entfernen(szene: THREE.Scene): void { szene.remove(this.bild.gruppe, this.fleck); this.tex.dispose(); }
}
