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
/* ausgelagerte Teile (Rüstungen, Helme): eigene Dateien <figur>.teile/<id>.glb aus fabrik/export3d.py auslagern=…, erst beim Anlegen geladen */
const AUSGELAGERT = /^(ruestung|kopf\.helm)\./;
const teilVorlagen = new Map<string, Promise<THREE.Object3D>>();
function teilVorlage(url: string): Promise<THREE.Object3D> {
  let p = teilVorlagen.get(url); if (!p) { p = new GLTFLoader().loadAsync(url).then((g) => g.scene); teilVorlagen.set(url, p); } return p;
}
const name3 = (id: string) => id.replace(/[.[\]:/]/g, "");
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
  private teile = new Map<string, THREE.Object3D>(); private fertig: (() => void) | null = null; private ppm: number; private effekt: TeleportEffekt | null = null;
  private soll = new Set<string>(); private ladend = new Set<string>();
  /** Leinwand in Bildpunkten und wie viele Bildpunkte eine Kameraeinheit hat */
  readonly breite: number; readonly hoehe: number; readonly fussY: number;
  private constructor(private v: Vorlage, figurHoehePx: number, readonly aufloesung: number, private url = "") {
    this.wurzel = SkeletonUtils.clone(v.szene); this.wurzel.visible = false;
    this.wurzel.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.frustumCulled = false; const n = o.name;
      if (/^(waffe|schild|kopf|ruestung|kleidung)/.test(n) && !(o.parent && /^(waffe|schild|kopf|ruestung|kleidung)/.test(o.parent.name)) && !this.teile.has(n)) this.teile.set(n, o); });   // three.js entfernt die Punkte aus den Namen
    this.mixer = new THREE.AnimationMixer(this.wurzel);
    this.mixer.addEventListener("finished", () => { const f = this.fertig; this.fertig = null; if (f) f(); });
    const ppm = (figurHoehePx / STEHHOEHE) * aufloesung; this.ppm = ppm;
    this.breite = Math.ceil(2 * AUSSCHNITT.seite * ppm); this.hoehe = Math.ceil((AUSSCHNITT.oben + AUSSCHNITT.unten) * ppm); this.fussY = AUSSCHNITT.oben / (AUSSCHNITT.oben + AUSSCHNITT.unten);
    gemeinsam().buehne.add(this.wurzel);
  }
  static async erstellen(url: string, figurHoehePx: number, aufloesung = 2): Promise<Darsteller> { return new Darsteller(await vorlageLaden(url), figurHoehePx, aufloesung, url); }
  /** Welche wählbaren Teile sichtbar sind (IDs mit Punkten, z. B. kopf.haar.militaer, waffe.schwert.ritter).
   *  Rüstungen und Helme, die nicht in der Grundfigur stecken, werden beim ersten Mal nachgeladen und erscheinen, sobald sie da sind. */
  zeige(ids: string[]): void { this.soll = new Set(ids.map(name3)); for (const [n, o] of this.teile) o.visible = this.soll.has(n);
    for (const id of ids) { const n = name3(id); if (AUSGELAGERT.test(id) && !this.teile.has(n) && !this.ladend.has(n)) { this.ladend.add(n); void this.teilLaden(id, n); } } }
  /** Wird gerade noch ein Teil nachgeladen? (Standbilder warten darauf) */
  async geladen(): Promise<void> { while (this.ladend.size) await new Promise((r) => setTimeout(r, 30)); }
  /** Ein ausgelagertes Teil laden und an das Skelett dieser Figur hängen (Knochen nach Namen; dieselbe Grundhaltung, weil aus demselben Rig gebaut) */
  private async teilLaden(id: string, n: string): Promise<void> {
    try {
      const quelle = await teilVorlage(this.url.replace(/\.glb$/, ".teile/") + id + ".glb"), knochen = new Map<string, THREE.Bone>();
      this.wurzel.traverse((o) => { if ((o as THREE.Bone).isBone) knochen.set(o.name, o as THREE.Bone); });
      const koerper = (() => { let k: THREE.Object3D | null = null; this.wurzel.traverse((o) => { if (!k && (o as THREE.SkinnedMesh).isSkinnedMesh && /^koerper/.test(o.name)) k = o; }); return k as THREE.Object3D | null; })();
      quelle.traverse((o) => { const sm = o as THREE.SkinnedMesh; if (!sm.isSkinnedMesh || this.teile.has(n)) return;
        const bones = sm.skeleton.bones.map((b) => knochen.get(b.name)); if (bones.some((b) => !b)) { console.warn("Teil passt nicht aufs Skelett:", id); return; }
        const neu = new THREE.SkinnedMesh(sm.geometry, sm.material); neu.name = n; neu.frustumCulled = false;
        (koerper && koerper.parent ? koerper.parent : this.wurzel).add(neu); neu.bind(new THREE.Skeleton(bones as THREE.Bone[], sm.skeleton.boneInverses.map((m) => m.clone())), sm.bindMatrix.clone());
        neu.visible = this.soll.has(n); this.teile.set(n, neu); });
    } catch (e) { console.warn("Teil fehlt:", id, e); } finally { this.ladend.delete(n); }
  }
  /** Teile färben (Haare, Bart): Zielfarbe relativ zur Farbe, in der sie gebaut sind */
  faerben(praefix: string, ziel: [number, number, number], gebaut: [number, number, number]): void {
    const p = praefix.replace(/[.[\]:/]/g, ""), f = [0, 1, 2].map((i) => linear(ziel[i]) / Math.max(1e-4, linear(gebaut[i])));
    for (const [n, o] of this.teile) if (n.startsWith(p)) o.traverse((m) => { const mm = m as THREE.Mesh; if (!mm.isMesh) return;
      const mat = (mm.material as THREE.MeshStandardMaterial).clone(); mat.color.setRGB(f[0], f[1], f[2]); mm.material = mat; });
  }
  /** Körpertextur tauschen (Hautfarbe): eigene Textur je Hautfarbe, von fabrik/hautfarben.py */
  async haut(url: string): Promise<void> {
    const t = await new THREE.TextureLoader().loadAsync(url); t.flipY = false; t.colorSpace = THREE.SRGBColorSpace;
    this.wurzel.traverse((o) => { const m = o as THREE.Mesh; if (!m.isMesh || !/^koerper/.test(o.name)) return;
      const mat = (m.material as THREE.MeshStandardMaterial).clone(); mat.map = t; mat.needsUpdate = true; m.material = mat; });
  }
  hat(name: string): boolean { return this.v.clips.has(name); }
  /** die Figur (für Standbilder) */
  get wurzelObjekt(): THREE.Object3D { return this.wurzel; }
  /** Animation auf ihr erstes Bild setzen */
  stand(): void { this.mixer.setTime(0); }
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
    const { zeichner: z, buehne: b, kamera: k } = gemeinsam(); this.mixer.update(dt); const fx = this.effekt; if (fx) fx.weiter(dt);
    if (z.domElement.width !== this.breite || z.domElement.height !== this.hoehe) z.setSize(this.breite, this.hoehe, false);
    for (const c of b.children) if (c.type === "Group" || c.type === "Object3D") c.visible = c === this.wurzel || (!!fx && c === fx.gruppe);
    this.wurzel.visible = !fx || !fx.vergangen; z.render(b, k); this.wurzel.visible = false; if (fx) fx.gruppe.visible = false;
    ziel.clearRect(0, 0, this.breite, this.hoehe); ziel.drawImage(z.domElement, 0, 0);
  }
  /** Teleport (Abreise): Lichtsäule, Bodenring, aufsteigende Funken; die Figur glüht auf, wird schmal und lang und vergeht im Licht.
   *  Die Bewegung dazu (teleport_weg) spielt der Aufrufer. Danach bleibt die Figur unsichtbar. dauer in Sekunden */
  teleport(dauer = 1.8): void { if (this.effekt) return; this.effekt = new TeleportEffekt(this.wurzel, dauer, this.ppm); gemeinsam().buehne.add(this.effekt.gruppe); }
  entfernen(): void { gemeinsam().buehne.remove(this.wurzel); if (this.effekt) { gemeinsam().buehne.remove(this.effekt.gruppe); this.effekt.weg(); } this.mixer.stopAllAction(); }
}

/* ---------- Teleport-Effekt ---------- */
const FARBE_LICHT = new THREE.Color(0x7fd4ff), FARBE_KERN = new THREE.Color(0xe8f8ff);
function leinwandTextur(b: number, h: number, mal: (x: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const c = document.createElement("canvas"); c.width = b; c.height = h; mal(c.getContext("2d")!); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
let saeulenBild: THREE.CanvasTexture | null = null, funkenBild: THREE.CanvasTexture | null = null, ringBild: THREE.CanvasTexture | null = null;
const glatt = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export class TeleportEffekt {
  readonly gruppe = new THREE.Group(); vergangen = false; private t = 0;
  private saeule: THREE.Mesh; private kern: THREE.Mesh; private ring: THREE.Mesh; private funken: THREE.Points; private fp: Float32Array; private fv: { w: number; r: number; s: number; d: number }[] = [];
  private mats: { m: THREE.MeshStandardMaterial; alt: THREE.Material | THREE.Material[]; mesh: THREE.Mesh }[] = [];
  constructor(private figur: THREE.Object3D, private dauer: number, ppm: number) {
    /* Säule: nach oben ausblendendes Licht, additiv; dunkle Stellen sind durchsichtig (sonst zeichnen sie auf der durchsichtigen Leinwand dunkel) */
    saeulenBild ||= leinwandTextur(4, 128, (x) => { const g = x.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, "rgba(74,168,224,0)"); g.addColorStop(0.55, "rgba(74,168,224,0.75)"); g.addColorStop(0.92, "rgba(223,244,255,1)"); g.addColorStop(1, "#ffffff"); x.fillStyle = g; x.fillRect(0, 0, 4, 128); });
    funkenBild ||= leinwandTextur(32, 32, (x) => { const g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, "#fff"); g.addColorStop(0.35, "#bfe9ff"); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.fillRect(0, 0, 32, 32); });
    ringBild ||= leinwandTextur(128, 128, (x) => { const g = x.createRadialGradient(64, 64, 20, 64, 64, 64); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(0.6, "#3c9be0"); g.addColorStop(0.8, "#e6f7ff"); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.fillRect(0, 0, 128, 128); });
    const licht = (map: THREE.Texture) => new THREE.MeshBasicMaterial({ map, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, opacity: 0 });
    const zyl = (r: number, h: number) => { const g = new THREE.CylinderGeometry(r, r, h, 28, 1, true); g.translate(0, h / 2, 0); return g; };
    this.saeule = new THREE.Mesh(zyl(0.46, 2.1), licht(saeulenBild)); this.kern = new THREE.Mesh(zyl(0.16, 2.1), licht(saeulenBild));
    (this.kern.material as THREE.MeshBasicMaterial).color = FARBE_KERN.clone(); (this.saeule.material as THREE.MeshBasicMaterial).color = FARBE_LICHT.clone();
    this.ring = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), licht(ringBild)); this.ring.rotation.x = -Math.PI / 2; this.ring.position.y = 0.02;
    /* Funken: steigen spiralförmig auf */
    const N = 80; this.fp = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) this.fv.push({ w: Math.random() * Math.PI * 2, r: 0.15 + Math.random() * 0.38, s: 0.7 + Math.random() * 1.3, d: Math.random() * 0.55 });
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(this.fp, 3));
    this.funken = new THREE.Points(g, new THREE.PointsMaterial({ map: funkenBild, size: Math.max(3, 0.075 * ppm), sizeAttenuation: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, color: FARBE_LICHT.clone(), opacity: 0 }));
    this.saeule.renderOrder = this.kern.renderOrder = this.funken.renderOrder = 10; this.ring.renderOrder = 9;
    this.gruppe.add(this.ring, this.saeule, this.kern, this.funken); this.gruppe.visible = false;
    /* Figur: eigene Materialkopien (die Vorlage teilen sich alle Darsteller), damit sie aufglühen und verblassen kann */
    figur.traverse((o) => { const m = o as THREE.Mesh; if (!m.isMesh || !o.visible) return; const alt = m.material, neu = (Array.isArray(alt) ? alt[0] : alt).clone() as THREE.MeshStandardMaterial;
      neu.transparent = true; if (neu.emissive) neu.emissive = new THREE.Color(0, 0, 0); m.material = neu; this.mats.push({ m: neu, alt, mesh: m }); });
  }
  weiter(dt: number) {
    this.t += dt; const p = Math.min(1, this.t / this.dauer), sm = this.saeule.material as THREE.MeshBasicMaterial, km = this.kern.material as THREE.MeshBasicMaterial;
    /* Säule: blendet ein, flackert leicht, wird am Ende hell und fällt zu einem Strahl zusammen */
    const an = glatt(0.0, 0.35, p), aus = 1 - glatt(0.88, 1.0, p), flacker = 0.88 + 0.12 * Math.sin(this.t * 31) * Math.sin(this.t * 13);
    sm.opacity = 0.85 * an * aus * flacker; km.opacity = (0.5 + 0.6 * glatt(0.55, 0.85, p)) * an * aus;
    const enger = 1 - 0.85 * glatt(0.82, 1.0, p); this.saeule.scale.set(enger * (0.9 + 0.1 * Math.sin(this.t * 9)), 0.4 + 0.6 * an, enger * (0.9 + 0.1 * Math.sin(this.t * 9))); this.kern.scale.set(enger, 0.3 + 0.7 * an, enger);
    this.saeule.rotation.y += dt * 1.5;
    /* Bodenring: breitet sich aus und verblasst */
    const rm = this.ring.material as THREE.MeshBasicMaterial, rp = (this.t * 0.9) % 1; this.ring.scale.setScalar(0.5 + rp * 1.1); rm.opacity = (1 - rp) * an * aus;
    /* Funken */
    (this.funken.material as THREE.PointsMaterial).opacity = an * aus;
    for (let i = 0; i < this.fv.length; i++) { const f = this.fv[i], h = ((this.t * f.s + f.d) % 1.0) * 2.1, w = f.w + this.t * (2.2 + f.s), r = f.r * (1 - 0.5 * h / 2.1) * enger;
      this.fp[i * 3] = Math.cos(w) * r; this.fp[i * 3 + 1] = h; this.fp[i * 3 + 2] = Math.sin(w) * r; }
    (this.funken.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    /* Figur: glüht auf, wird schmal und lang, verblasst */
    const gluehen = glatt(0.35, 0.75, p), blass = glatt(0.62, 0.92, p);
    for (const { m } of this.mats) { if (m.emissive) { m.emissive.copy(FARBE_LICHT).multiplyScalar(1.6 * gluehen); } m.opacity = 1 - blass; m.depthWrite = blass < 0.5; }
    const zieh = glatt(0.6, 0.95, p); this.figur.scale.set(1 - 0.75 * zieh, 1 + 0.25 * zieh, 1 - 0.75 * zieh);
    if (p >= 0.95) this.vergangen = true;
  }
  /** aufräumen (Darsteller entfernt) */
  weg() { for (const { alt, mesh } of this.mats) mesh.material = alt; this.figur.scale.set(1, 1, 1); this.gruppe.traverse((o) => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); }); }
}
/** Standbild einer Figur in eine Leinwand (Heldeneditor, Profilbild): Ruhe, erstes Bild, aus einer der acht Richtungen.
 *  ausschnitt "ganz": die ganze Figur von leicht oben; "kopf": Kopf und Schultern fast auf Augenhöhe */
export interface StandbildOpt { url: string; zeige: string[]; haut?: string; haar?: { praefix: string; ziel: [number, number, number]; gebaut: [number, number, number] }[]; richtung: number; ausschnitt: "ganz" | "kopf" }
const standbildVorlagen = new Map<string, Promise<Darsteller>>();
let sbZeichner: THREE.WebGLRenderer | null = null; let sbBuehne: THREE.Scene | null = null;
export async function standbild(ziel: HTMLCanvasElement, o: StandbildOpt): Promise<void> {
  const schl = o.url; let p = standbildVorlagen.get(schl); if (!p) { p = Darsteller.erstellen(o.url, 100, 1); standbildVorlagen.set(schl, p); }
  const d = await p; d.zeige(o.zeige); await d.geladen(); for (const h of o.haar || []) d.faerben(h.praefix, h.ziel, h.gebaut); if (o.haut) await d.haut(o.haut);
  if (!sbZeichner) { sbZeichner = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true }); sbZeichner.setClearColor(0x000000, 0); sbZeichner.outputColorSpace = THREE.SRGBColorSpace;
    sbBuehne = new THREE.Scene(); sbBuehne.add(new THREE.HemisphereLight(0xfff1dc, 0x3a2e22, 1.7)); const s1 = new THREE.DirectionalLight(0xffe2b8, 2.4); s1.position.set(-3, 6, 7); sbBuehne.add(s1); const s2 = new THREE.DirectionalLight(0xa8c4ff, 0.9); s2.position.set(5, 4, -6); sbBuehne.add(s2); }
  const w = d.wurzelObjekt; const alt = w.parent; sbBuehne!.add(w); w.visible = true; d.spiele("ruhe"); d.stand();
  w.rotation.y = -((o.richtung - 2) * Math.PI) / 4;                                                  // Richtung 2 = Süden (zur Kamera), im Uhrzeigersinn wie im Spiel
  const kopf = o.ausschnitt === "kopf", W = ziel.width, H = ziel.height, hoch = kopf ? 0.62 : 2.05, mitte = kopf ? 1.55 : 0.93;
  const cam = new THREE.OrthographicCamera(-hoch / 2 * W / H, hoch / 2 * W / H, hoch / 2, -hoch / 2, 0.1, 50); const neig = kopf ? 0.08 : 0.25;
  cam.position.set(0, mitte + Math.sin(neig) * 10, Math.cos(neig) * 10); cam.lookAt(0, mitte, 0);
  sbZeichner.setSize(W, H, false); sbZeichner.render(sbBuehne!, cam); const x = ziel.getContext("2d")!; x.clearRect(0, 0, W, H); x.drawImage(sbZeichner.domElement, 0, 0, W, H);
  w.visible = false; if (alt) alt.add(w);
}
(window as unknown as Record<string, unknown>).MytharaEcht3D = { Darsteller, standbild };
