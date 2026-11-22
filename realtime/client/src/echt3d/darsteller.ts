/*
 * Mythara – Figuren in Echtzeit-3D (three.js). Eigene Datei (echtzeit/figur3d.js), wird nur geladen, wenn 3D-Figuren eingeschaltet sind.
 *
 * Ein Darsteller zeichnet eine Figur der Fabrik (GLB aus fabrik/export3d.py: Skelett, Körper, Haare, Bärte, Waffen, alle Bewegungen)
 * aus der Spielkamera (orthografisch, 35° geneigt wie die Sprite-Kamera) in eine 2D-Leinwand. Das Spiel (Phaser) zeigt diese Leinwand
 * wie ein Sprite an – Karte, Tiefenreihenfolge, Oberfläche und Spiellogik bleiben unverändert.
 * Alle Darsteller teilen sich einen WebGL-Zeichner; jede Figur hat nur ihre eigene 2D-Leinwand.
 */
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";

const NEIGUNG = (35 * Math.PI) / 180;
/** Ausschnitt um den Fußpunkt in Kameraeinheiten (m): seitlich, nach oben (erhobener Stab), nach unten (liegend) */
export const AUSSCHNITT = { seite: 1.0, oben: 2.05, unten: 0.6 };
const STEHHOEHE = 1.8 * Math.cos(NEIGUNG) + 0.05;   // sichtbare Höhe einer stehenden Figur in Kameraeinheiten

interface Vorlage { szene: THREE.Object3D; clips: Map<string, THREE.AnimationClip> }
const vorlagen = new Map<string, Promise<Vorlage>>();
function vorlageLaden(url: string): Promise<Vorlage> {
  let p = vorlagen.get(url);
  if (!p) { p = new GLTFLoader().loadAsync(url).then((g) => ({ szene: g.scene, clips: new Map(g.animations.map((c) => [c.name, c])) })); vorlagen.set(url, p); }
  return p;
}
/* gemeinsamer Zeichner und Bühne */
let zeichner: THREE.WebGLRenderer | null = null; let buehne: THREE.Scene | null = null; let kamera: THREE.OrthographicCamera | null = null;
function gemeinsam() {
  if (!zeichner) {
    zeichner = new THREE.WebGLRenderer({ alpha: true, antialias: true, premultipliedAlpha: false, preserveDrawingBuffer: true });
    zeichner.setClearColor(0x000000, 0); zeichner.outputColorSpace = THREE.SRGBColorSpace;
    buehne = new THREE.Scene();
    buehne.add(new THREE.HemisphereLight(0xfff1dc, 0x3a2e22, 1.6));
    const sonne = new THREE.DirectionalLight(0xffe2b8, 2.2); sonne.position.set(-4, 8, 6); buehne.add(sonne);
    const rand = new THREE.DirectionalLight(0xa8c4ff, 0.9); rand.position.set(5, 4, -6); buehne.add(rand);
    kamera = new THREE.OrthographicCamera(-AUSSCHNITT.seite, AUSSCHNITT.seite, AUSSCHNITT.oben, -AUSSCHNITT.unten, 0.1, 50);
    const blick = new THREE.Vector3(0, -Math.sin(NEIGUNG), -Math.cos(NEIGUNG)); kamera.position.copy(blick).multiplyScalar(-20); kamera.lookAt(0, 0, 0);
  }
  return { zeichner: zeichner!, buehne: buehne!, kamera: kamera! };
}
const linear = (c: number) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };

export class Darsteller {
  private wurzel: THREE.Object3D; private mixer: THREE.AnimationMixer; private aktion: THREE.AnimationAction | null = null; private name = "";
  private teile = new Map<string, THREE.Object3D>(); private fertig: (() => void) | null = null;
  /** Leinwand in Bildpunkten und wie viele Bildpunkte eine Kameraeinheit hat */
  readonly breite: number; readonly hoehe: number; readonly fussY: number;
  private constructor(private v: Vorlage, figurHoehePx: number, readonly aufloesung: number) {
    this.wurzel = SkeletonUtils.clone(v.szene); this.wurzel.visible = false;
    this.wurzel.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.frustumCulled = false; const n = o.name;
      if (/^(waffe|schild|kopf)/.test(n) && !(o.parent && /^(waffe|schild|kopf)/.test(o.parent.name)) && !this.teile.has(n)) this.teile.set(n, o); });   // three.js entfernt die Punkte aus den Namen
    this.mixer = new THREE.AnimationMixer(this.wurzel);
    this.mixer.addEventListener("finished", () => { const f = this.fertig; this.fertig = null; if (f) f(); });
    const ppm = (figurHoehePx / STEHHOEHE) * aufloesung;
    this.breite = Math.ceil(2 * AUSSCHNITT.seite * ppm); this.hoehe = Math.ceil((AUSSCHNITT.oben + AUSSCHNITT.unten) * ppm); this.fussY = AUSSCHNITT.oben / (AUSSCHNITT.oben + AUSSCHNITT.unten);
    gemeinsam().buehne.add(this.wurzel);
  }
  static async erstellen(url: string, figurHoehePx: number, aufloesung = 2): Promise<Darsteller> { return new Darsteller(await vorlageLaden(url), figurHoehePx, aufloesung); }
  /** Welche wählbaren Teile sichtbar sind (IDs mit Punkten, z. B. kopf.haar.militaer, waffe.schwert.ritter) */
  zeige(ids: string[]): void { const soll = new Set(ids.map((i) => i.replace(/[.[\]:/]/g, ""))); for (const [n, o] of this.teile) o.visible = soll.has(n); }
  /** Teile färben (Haare, Bart): Zielfarbe relativ zur Farbe, in der sie gebaut sind */
  faerben(praefix: string, ziel: [number, number, number], gebaut: [number, number, number]): void {
    const p = praefix.replace(/[.[\]:/]/g, ""), f = [0, 1, 2].map((i) => linear(ziel[i]) / Math.max(1e-4, linear(gebaut[i])));
    for (const [n, o] of this.teile) if (n.startsWith(p)) o.traverse((m) => { const mm = m as THREE.Mesh; if (!mm.isMesh) return;
      const mat = (mm.material as THREE.MeshStandardMaterial).clone(); mat.color.setRGB(f[0], f[1], f[2]); mm.material = mat; });
  }
  hat(name: string): boolean { return this.v.clips.has(name); }
  /** Dauer einer Bewegung in Millisekunden */
  dauer(name: string): number { const c = this.v.clips.get(name); return c ? c.duration * 1000 : 0; }
  /** Bewegung abspielen. einmal: nicht wiederholen; fertig wird am Ende gerufen. halten: auf dem letzten Bild stehen bleiben */
  spiele(name: string, einmal = false, fertig?: () => void): void {
    const c = this.v.clips.get(name); if (!c) return; if (this.name === name && !einmal) return;
    const neu = this.mixer.clipAction(c); neu.reset(); neu.setLoop(einmal ? THREE.LoopOnce : THREE.LoopRepeat, Infinity); neu.clampWhenFinished = einmal;
    if (this.aktion && this.aktion !== neu) neu.crossFadeFrom(this.aktion, 0.1, false); neu.play(); this.aktion = neu; this.name = name; this.fertig = fertig || null;
  }
  /** Blickrichtung am Boden (Bogenmaß): 0 = zur Kamera (Süden), π/2 = nach rechts */
  blick(winkel: number): void { this.wurzel.rotation.y = winkel; }
  /** Weiterrechnen und in die Leinwand zeichnen */
  zeichne(dt: number, ziel: CanvasRenderingContext2D): void {
    const { zeichner: z, buehne: b, kamera: k } = gemeinsam(); this.mixer.update(dt);
    if (z.domElement.width !== this.breite || z.domElement.height !== this.hoehe) z.setSize(this.breite, this.hoehe, false);
    for (const c of b.children) if (c.type === "Group" || c.type === "Object3D") c.visible = c === this.wurzel;
    this.wurzel.visible = true; z.render(b, k); this.wurzel.visible = false;
    ziel.clearRect(0, 0, this.breite, this.hoehe); ziel.drawImage(z.domElement, 0, 0);
  }
  entfernen(): void { gemeinsam().buehne.remove(this.wurzel); this.mixer.stopAllAction(); }
}
(window as unknown as Record<string, unknown>).MytharaEcht3D = { Darsteller };
