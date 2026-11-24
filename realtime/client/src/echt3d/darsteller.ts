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
const AUSGELAGERT = /^(ruestung|kopf\.helm|waffe|schild)\./;   /* was nicht in der Grundfigur steckt, wird aus <figur>.teile/ nachgeladen */
const teilVorlagen = new Map<string, Promise<THREE.Object3D>>();
function teilVorlage(url: string): Promise<THREE.Object3D> {
  let p = teilVorlagen.get(url); if (!p) { p = new GLTFLoader().loadAsync(url).then((g) => g.scene); teilVorlagen.set(url, p); } return p;
}
const name3 = (id: string) => id.replace(/[.[\]:/]/g, "");
/** Leuchtende Stufen (legendär, mythisch): das Glühen der Kanten pulsiert langsam */
const PULS = new Set<THREE.MeshStandardMaterial>();
function pulsieren() { const t = performance.now() / 1000; for (const m of PULS) { const b = (m.userData.glut ??= m.emissiveIntensity) as number; m.emissiveIntensity = b * (0.65 + 0.35 * Math.sin(t * 2.4)); } }
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
  private soll = new Set<string>(); private ladend = new Set<string>(); private aus = { ...AUSSCHNITT }; private glutFx: StabGlut | null = null;
  /** Leinwand in Bildpunkten und wie viele Bildpunkte eine Kameraeinheit hat */
  readonly breite: number; readonly hoehe: number; readonly fussY: number;
  private constructor(private v: Vorlage, figurHoehePx: number, readonly aufloesung: number, private url = "") {
    this.wurzel = SkeletonUtils.clone(v.szene); this.wurzel.visible = false;
    this.wurzel.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.frustumCulled = false; const n = o.name;
      if (/^(waffe|schild|kopf|ruestung|kleidung)/.test(n) && !(o.parent && /^(waffe|schild|kopf|ruestung|kleidung)/.test(o.parent.name)) && !this.teile.has(n)) this.teile.set(n, o); });   // three.js entfernt die Punkte aus den Namen
    this.mixer = new THREE.AnimationMixer(this.wurzel);
    this.mixer.addEventListener("finished", () => { const f = this.fertig; this.fertig = null; if (f) f(); });
    const ppm = (figurHoehePx / STEHHOEHE) * aufloesung; this.ppm = ppm;
    /* große Figuren (Bosse über 2 m, weite Flügel): Ausschnitt nach ihrer Größe, sonst der übliche */
    this.wurzel.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(this.wurzel), gr = box.getSize(new THREE.Vector3());
    const seite = Math.max(AUSSCHNITT.seite, Math.max(Math.abs(box.min.x), Math.abs(box.max.x), Math.abs(box.min.z), Math.abs(box.max.z)) + 0.15);
    const oben = Math.max(AUSSCHNITT.oben, gr.y * Math.cos(NEIGUNG) + seite * Math.sin(NEIGUNG) + 0.1); this.aus = { seite, oben, unten: AUSSCHNITT.unten };
    this.breite = Math.ceil(2 * seite * ppm); this.hoehe = Math.ceil((oben + AUSSCHNITT.unten) * ppm); this.fussY = oben / (oben + AUSSCHNITT.unten);
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
      quelle.traverse((o) => { const m = o as THREE.Mesh;                                        /* starre Teile (Waffen, Schilde): Kind eines Knochens – an denselben Knochen dieser Figur hängen */
        if (!m.isMesh || (m as THREE.SkinnedMesh).isSkinnedMesh || this.teile.has(n)) return; let p = m.parent; while (p && !(p as THREE.Bone).isBone) p = p.parent;
        const ziel = p && knochen.get(p.name); if (!ziel) return; const g = new THREE.Group(); g.name = n; p!.updateWorldMatrix(true, true);
        const rel = new THREE.Matrix4().copy(p!.matrixWorld).invert().multiply(m.matrixWorld); rel.decompose(g.position, g.quaternion, g.scale);
        const kopie = new THREE.Mesh(m.geometry, m.material); kopie.frustumCulled = false; g.add(kopie); ziel.add(g); g.visible = this.soll.has(n); this.teile.set(n, g); });
      quelle.traverse((o) => { const sm = o as THREE.SkinnedMesh; if (!sm.isSkinnedMesh || this.teile.has(n)) return;
        const bones = sm.skeleton.bones.map((b) => knochen.get(b.name)); if (bones.some((b) => !b)) { console.warn("Teil passt nicht aufs Skelett:", id); return; }
        const neu = new THREE.SkinnedMesh(sm.geometry, sm.material); neu.name = n; neu.frustumCulled = false;
        (koerper && koerper.parent ? koerper.parent : this.wurzel).add(neu); neu.bind(new THREE.Skeleton(bones as THREE.Bone[], sm.skeleton.boneInverses.map((m) => m.clone())), sm.bindMatrix.clone());
        neu.visible = this.soll.has(n); this.teile.set(n, neu);
        if (/\.(legendaer|mythisch)$/.test(id)) for (const m of (Array.isArray(neu.material) ? neu.material : [neu.material])) if ((m as THREE.MeshStandardMaterial).emissiveMap) PULS.add(m as THREE.MeshStandardMaterial); });
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
  /** die nächste spiele()-Anweisung beginnt die Bewegung neu, auch wenn es dieselbe ist (Testseite) */
  neustart(): void { this.name = ""; }
  /** Blickrichtung am Boden (Bogenmaß): 0 = zur Kamera (Süden), π/2 = nach rechts */
  blick(winkel: number): void { this.wurzel.rotation.y = winkel; }
  /** Weiterrechnen und in die Leinwand zeichnen */
  zeichne(dt: number, ziel: CanvasRenderingContext2D): void {
    const { zeichner: z, buehne: b, kamera: k } = gemeinsam(); this.mixer.update(dt); const fx = this.effekt; if (fx) fx.weiter(dt); if (PULS.size) pulsieren();
    if (this.glutFx) { const p = this.waffenOrt(true); if (!this.glutFx.weiter(dt, p)) this.glutFx = null; }
    if (z.domElement.width !== this.breite || z.domElement.height !== this.hoehe) z.setSize(this.breite, this.hoehe, false);
    if (k.right !== this.aus.seite || k.top !== this.aus.oben) { k.left = -this.aus.seite; k.right = this.aus.seite; k.top = this.aus.oben; k.bottom = -this.aus.unten; k.updateProjectionMatrix(); }
    for (const c of b.children) if (c.type === "Group" || c.type === "Object3D") c.visible = c === this.wurzel || (!!fx && c === fx.gruppe);
    this.wurzel.visible = !fx || !fx.vergangen; z.render(b, k); this.wurzel.visible = false; if (fx) fx.gruppe.visible = false;
    ziel.clearRect(0, 0, this.breite, this.hoehe); ziel.drawImage(z.domElement, 0, 0);
  }
  /** Teleport (Abreise): Lichtsäule, Bodenring, aufsteigende Funken; die Figur glüht auf, wird schmal und lang und vergeht im Licht.
   *  Die Bewegung dazu (teleport_weg) spielt der Aufrufer. Danach bleibt die Figur unsichtbar. dauer in Sekunden */
  /** Wo die angelegte Waffe gerade ist, in Bildpunkten der Leinwand: spitze = oberstes Ende (Stab), sonst die Mitte (Bogen, Armbrust) */
  waffenPunkt(spitze: boolean): { x: number; y: number } | null {
    const p = this.waffenOrt(spitze); if (!p) return null; const { kamera: k } = gemeinsam();
    k.left = -this.aus.seite; k.right = this.aus.seite; k.top = this.aus.oben; k.bottom = -this.aus.unten; k.updateProjectionMatrix(); k.updateMatrixWorld();
    p.project(k); return { x: (p.x + 1) / 2 * this.breite, y: (1 - p.y) / 2 * this.hoehe };
  }
  private waffenOrt(spitze: boolean): THREE.Vector3 | null {
    this.wurzel.updateMatrixWorld(true); const box = new THREE.Box3();
    for (const [n, o] of this.teile) if (o.visible && /^waffe/.test(n)) box.expandByObject(o);
    if (box.isEmpty()) return null; const c = box.getCenter(new THREE.Vector3()); if (spitze) c.y = box.max.y - 0.02; return c;
  }
  /** Der Stab leuchtet auf: an der Spitze wächst ein Licht bis zum Abschuss (nach bisAbschuss ms) und verglimmt danach */
  glut(bisAbschuss: number, farbe = 0x8cc4ff): void { if (this.glutFx) this.glutFx.weg(); this.glutFx = new StabGlut(this.wurzel, bisAbschuss / 1000, farbe); }
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
/** Licht an der Stabspitze: zwei weiche, additive Lichtflecken (Kern weiß, Hof in der Zauberfarbe) als Kinder der Figur */
let glutBild: THREE.Texture | null = null;
function weichesLicht(): THREE.Texture { if (glutBild) return glutBild; const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d")!, g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.25, "rgba(255,255,255,0.75)"); g.addColorStop(0.6, "rgba(255,255,255,0.18)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  glutBild = new THREE.CanvasTexture(c); glutBild.colorSpace = THREE.SRGBColorSpace; return glutBild; }
class StabGlut {
  private t = 0; private kern: THREE.Sprite; private hof: THREE.Sprite; private funken: THREE.Sprite[] = [];
  constructor(private figur: THREE.Object3D, private abschuss: number, farbe: number) {
    const mat = (f: number, a: number) => new THREE.SpriteMaterial({ map: weichesLicht(), color: f, transparent: true, opacity: a, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false });
    this.hof = new THREE.Sprite(mat(farbe, 0)); this.kern = new THREE.Sprite(mat(0xffffff, 0)); this.hof.renderOrder = 998; this.kern.renderOrder = 999;
    for (let i = 0; i < 5; i++) { const f = new THREE.Sprite(mat(farbe, 0)); f.renderOrder = 999; f.scale.setScalar(0.05); this.funken.push(f); figur.add(f); }
    figur.add(this.hof); figur.add(this.kern);
  }
  /** false = fertig (entfernt) */
  weiter(dt: number, spitze: THREE.Vector3 | null): boolean {
    this.t += dt; const a = this.abschuss, t = this.t, nach = t - a; if (nach > 0.45 || !spitze) { this.weg(); return false; }
    const ort = this.figur.worldToLocal(spitze.clone()); this.kern.position.copy(ort); this.hof.position.copy(ort);
    const auf = Math.min(1, t / Math.max(0.05, a)), zit = 1 + 0.12 * Math.sin(t * 40);   // aufladen: wächst und flackert
    const blitz = nach > 0 ? Math.max(0, 1 - nach / 0.45) : 0, groesse = nach > 0 ? 0.42 * (1 + nach * 2) * blitz + 0.05 : (0.08 + 0.26 * auf * auf) * zit;
    this.hof.scale.setScalar(groesse * 2.2); this.kern.scale.setScalar(groesse * 0.9);
    (this.hof.material as THREE.SpriteMaterial).opacity = nach > 0 ? blitz : 0.35 + 0.55 * auf; (this.kern.material as THREE.SpriteMaterial).opacity = nach > 0 ? blitz : 0.5 + 0.5 * auf;
    this.funken.forEach((f, i) => { const w = t * 7 + i * 1.257, r = 0.16 * (1 - auf * 0.7) + 0.03; f.position.set(ort.x + Math.cos(w) * r, ort.y + Math.sin(w * 1.3) * r * 0.6, ort.z + Math.sin(w) * r);   // Funken kreisen und werden eingesogen
      (f.material as THREE.SpriteMaterial).opacity = nach > 0 ? 0 : 0.9 * auf; });
    return true;
  }
  weg(): void { for (const o of [this.kern, this.hof, ...this.funken]) { o.removeFromParent(); (o.material as THREE.Material).dispose(); } }
}
class TeleportEffekt {
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
/* ---------- Geschosse in 3D: Pfeil, Bolzen, Zauber- und Feuerkugel ----------
 * Jedes Geschoss ist ein kleines Modell (entlang +x gebaut) und wird wie eine Figur in sein eigenes kleines Bild gerendert –
 * mit derselben Kamera und demselben Licht, also im selben Blickwinkel wie die Figuren. Die Szene (welt/geschosse.ts) bewegt das Bild. */
export type GeschossArt3D = "pfeil" | "bolzen" | "zauber" | "feuer";
export class GeschossBild {
  readonly breite: number; readonly hoehe: number; private gruppe = new THREE.Group(); private dreh = new THREE.Group(); private t = 0; private halb: number; private kugeln: THREE.Object3D[] = [];
  constructor(readonly art: GeschossArt3D, figurHoehePx: number, readonly aufloesung: number) {
    const ppm = (figurHoehePx / STEHHOEHE) * aufloesung, zauber = art === "zauber" || art === "feuer"; this.halb = art === "pfeil" ? 0.42 : art === "bolzen" ? 0.26 : 0.3;
    this.breite = this.hoehe = Math.ceil(2 * this.halb * ppm); this.gruppe.add(this.dreh); this.gruppe.visible = false;
    const std = (farbe: number, metall = 0, rau = 0.7) => new THREE.MeshStandardMaterial({ color: farbe, metalness: metall, roughness: rau });
    const stab = (r: number, l: number, m: THREE.Material, x: number) => { const g = new THREE.CylinderGeometry(r, r, l, 8); g.rotateZ(-Math.PI / 2); const o = new THREE.Mesh(g, m); o.position.x = x; return o; };
    const spitze = (r: number, l: number, m: THREE.Material, x: number) => { const g = new THREE.ConeGeometry(r, l, 10); g.rotateZ(-Math.PI / 2); const o = new THREE.Mesh(g, m); o.position.x = x; return o; };
    const feder = (l: number, h: number, m: THREE.Material, x: number, w: number) => { const g = new THREE.BufferGeometry(), v = new Float32Array([-l / 2, 0, 0, l / 2, 0, 0, -l / 2, h, 0]);   // dreieckige Fahne, nach hinten breiter
      g.setAttribute("position", new THREE.BufferAttribute(v, 3)); g.computeVertexNormals(); const o = new THREE.Mesh(g, m); o.position.x = x; o.rotation.x = w; return o; };
    const d = this.dreh;
    if (art === "pfeil") { const holz = std(0x8a5a2b), eisen = std(0xd4dbe3, 0.85, 0.3), rot = new THREE.MeshStandardMaterial({ color: 0xb8372b, roughness: 0.8, side: THREE.DoubleSide }), weiss = new THREE.MeshStandardMaterial({ color: 0xeee6d2, roughness: 0.8, side: THREE.DoubleSide });
      d.add(stab(0.009, 0.62, holz, -0.02), spitze(0.024, 0.09, eisen, 0.33), stab(0.012, 0.03, std(0x3a2a1a), -0.34));
      for (let i = 0; i < 3; i++) d.add(feder(0.13, 0.04, i ? weiss : rot, -0.25, (i * 2 * Math.PI) / 3)); }
    else if (art === "bolzen") { const holz = std(0x4a3322), eisen = std(0x9aa3ad, 0.9, 0.35), leder = new THREE.MeshStandardMaterial({ color: 0x2a2420, roughness: 0.9, side: THREE.DoubleSide });
      d.add(stab(0.014, 0.3, holz, -0.02), spitze(0.032, 0.08, eisen, 0.17), stab(0.02, 0.02, eisen, 0.12));
      for (let i = 0; i < 2; i++) d.add(feder(0.08, 0.035, leder, -0.13, i * Math.PI)); }
    else { const [a, b] = art === "feuer" ? [0xff6a1a, 0xffd27a] : [0x6aa8ff, 0xcfe6ff], add = (f: number, o: number) => new THREE.MeshBasicMaterial({ color: f, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false });
      d.add(new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff })));   // weißer Kern
      d.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.075, 1), add(b, 0.55)));                                           // facettierte Hülle, dreht sich
      const hof = new THREE.Sprite(new THREE.SpriteMaterial({ map: weichesLicht(), color: a, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })); hof.scale.setScalar(0.42); this.gruppe.add(hof);
      for (let i = 0; i < 3; i++) { const k = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), add(b, 1)); this.kugeln.push(k); this.gruppe.add(k); }   // kreisende Funken
      if (zauber) this.dreh.scale.setScalar(art === "feuer" ? 1.25 : 1); }
    gemeinsam().buehne.add(this.gruppe);
  }
  /** Flugrichtung am Bildschirm (x nach rechts, y nach unten): das Modell zeigt in diese Richtung am Boden */
  richte(sx: number, sy: number): void { if (Math.hypot(sx, sy) < 1e-4 || this.kugeln.length) return;
    const r = new THREE.Vector3(sx, 0, sy / Math.sin(NEIGUNG)).normalize(); this.gruppe.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), r); }
  zeichne(dt: number, ziel: CanvasRenderingContext2D): void {
    const { zeichner: z, buehne: b, kamera: k } = gemeinsam(); this.t += dt; const t = this.t;
    if (this.kugeln.length) { this.dreh.rotation.set(t * 3.1, t * 4.3, 0); const s = 1 + 0.12 * Math.sin(t * 30); this.dreh.scale.setScalar((this.art === "feuer" ? 1.25 : 1) * s);
      this.kugeln.forEach((o, i) => { const w = t * 9 + (i * 2 * Math.PI) / 3; o.position.set(Math.cos(w) * 0.12, Math.sin(w * 1.4) * 0.05, Math.sin(w) * 0.12); }); }
    else this.dreh.rotation.x = t * 14;                                                               // Pfeil und Bolzen drehen sich um die eigene Achse
    if (z.domElement.width !== this.breite || z.domElement.height !== this.hoehe) z.setSize(this.breite, this.hoehe, false);
    const h = this.halb; if (k.right !== h || k.top !== h || k.bottom !== -h) { k.left = -h; k.right = h; k.top = h; k.bottom = -h; k.updateProjectionMatrix(); }
    for (const c of b.children) if (c.type === "Group" || c.type === "Object3D") c.visible = c === this.gruppe;
    z.render(b, k); this.gruppe.visible = false; ziel.clearRect(0, 0, this.breite, this.hoehe); ziel.drawImage(z.domElement, 0, 0);
  }
  entfernen(): void { this.gruppe.removeFromParent(); this.gruppe.traverse((o) => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); const mt = (m as THREE.Mesh).material as THREE.Material | undefined; if (mt) mt.dispose(); }); }
}

/* ---------- Bäume in 3D (offene Welt) ----------
 * Jeder Baum ist ein eigenes 3D-Objekt im Licht der Figuren: eigene Drehung, eigene Kronenfarbe, eigener Wind, blaue Stellen pulsieren (alles im Shader, Modell und Textur
 * teilen sich alle Bäume einer Sorte). Gezeichnet wird in ein eigenes kleines Bild je Baum; die Welt (welt/welt.ts) zeigt es an seinem Standort
 * und zeichnet nur sichtbare Bäume, gedrosselt. */
export interface BaumWerte { dreh: number; phase: number; farbton: number; saett: number; hell: number; wind: number }
const BAUM_U = { uZeit: { value: 0 }, uPhase: { value: 0 }, uWind: { value: 0.12 }, uHoehe: { value: 7 }, uFarbton: { value: 0 }, uSaett: { value: 1 }, uHell: { value: 1 } };
const HSV_GLSL = `
vec3 baum_rgb2hsv(vec3 c){ vec4 K=vec4(0.,-1./3.,2./3.,-1.); vec4 p=mix(vec4(c.bg,K.wz),vec4(c.gb,K.xy),step(c.b,c.g)); vec4 q=mix(vec4(p.xyw,c.r),vec4(c.r,p.yzx),step(p.x,c.r));
  float d=q.x-min(q.w,q.y); float e=1.0e-10; return vec3(abs(q.z+(q.w-q.y)/(6.*d+e)),d/(q.x+e),q.x); }
vec3 baum_hsv2rgb(vec3 c){ vec4 K=vec4(1.,2./3.,1./3.,3.); vec3 p=abs(fract(c.xxx+K.xyz)*6.-K.www); return c.z*mix(K.xxx,clamp(p-K.xxx,0.,1.),c.y); }`;
const baumVorlagen = new Map<string, Promise<{ szene: THREE.Object3D; hoehe: number; radius: number }>>();
function baumVorlage(url: string) {
  let p = baumVorlagen.get(url);
  if (!p) { p = new GLTFLoader().loadAsync(url).then((g) => {
      const szene = g.scene, box = new THREE.Box3().setFromObject(szene); let radius = 0;
      szene.traverse((o) => { const m = o as THREE.Mesh; if (!m.isMesh) return; m.frustumCulled = false; const pos = m.geometry.getAttribute("position");
        for (let i = 0; i < pos.count; i++) radius = Math.max(radius, Math.hypot(pos.getX(i), pos.getZ(i)));
        const mat = m.material as THREE.MeshStandardMaterial;
        mat.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, BAUM_U);
          sh.vertexShader = "uniform float uZeit, uPhase, uWind, uHoehe;\n" + sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
            { float hb = clamp(transformed.y / uHoehe, 0.0, 1.0), b = hb * hb * uWind;            // Wind: oben mehr, unten fest
              transformed.x += sin(uZeit * 1.6 + uPhase + transformed.y * 0.35) * b; transformed.z += cos(uZeit * 1.1 + uPhase * 1.3) * b * 0.6; }`);
          sh.fragmentShader = "uniform float uFarbton, uSaett, uHell, uZeit, uPhase;\n" + sh.fragmentShader.replace("#include <common>", "#include <common>\n" + HSV_GLSL).replace("#include <map_fragment>", `#include <map_fragment>
            vec3 baumBlau = vec3(0.);                                                              // blau leuchtende Stellen (Adern, Kristalle): pulsieren
            { vec3 hsv = baum_rgb2hsv(diffuseColor.rgb); float b = clamp((hsv.y - 0.45) / 0.2, 0., 1.) * clamp((hsv.z - 0.3) / 0.25, 0., 1.) * clamp(1. - abs(hsv.x * 360. - 210.) / 28., 0., 1.);
              baumBlau = diffuseColor.rgb * b * (0.35 + 1.25 * (0.5 + 0.5 * sin(uZeit * 2.2 + uPhase))); }
            { vec3 hsv = baum_rgb2hsv(diffuseColor.rgb); float maske = clamp((hsv.y - 0.25) / 0.2, 0., 1.) * sqrt(clamp(1. - abs(hsv.x * 360. - 95.) / 60., 0., 1.));   // nur Blätter (grün), nicht der Stamm
              hsv.x = fract(hsv.x + uFarbton / 360. * maske); hsv.y = clamp(hsv.y * (1. + (uSaett - 1.) * maske), 0., 1.); hsv.z = clamp(hsv.z * (1. + (uHell - 1.) * maske), 0., 1.); diffuseColor.rgb = baum_hsv2rgb(hsv); }`).replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\n totalEmissiveRadiance += baumBlau;"); };
        mat.customProgramCacheKey = () => "baum"; });
      return { szene, hoehe: box.max.y, radius }; });
    baumVorlagen.set(url, p); }
  return p;
}
export class BaumBild {
  readonly breite: number; readonly hoehe: number; readonly fussY: number; private gruppe = new THREE.Group(); private aus: { seite: number; oben: number; unten: number }; private h: number; private schatten: THREE.Mesh | null = null;
  private constructor(v: { szene: THREE.Object3D; hoehe: number; radius: number }, figurHoehePx: number, readonly aufloesung: number, private w: BaumWerte) {
    const ppm = (figurHoehePx / STEHHOEHE) * aufloesung, r = v.radius + 0.3; this.h = v.hoehe;
    const inhalt = v.szene.clone(true); inhalt.rotation.y = w.dreh; this.gruppe.add(inhalt);
    const schatten = new THREE.Mesh(new THREE.CircleGeometry(1, 28), new THREE.MeshBasicMaterial({ color: 0x1c2636, map: weichesLicht(), transparent: true, opacity: 0.42, depthWrite: false }));   // weicher Bodenschatten
    this.schatten = schatten; schatten.rotation.x = -Math.PI / 2; schatten.scale.set(v.radius * 0.62, v.radius * 0.5, 1); schatten.position.set(0.5, 0.02, -0.5); schatten.renderOrder = -1; this.gruppe.add(schatten);
    this.aus = { seite: r, oben: v.hoehe * Math.cos(NEIGUNG) + r * Math.sin(NEIGUNG) + 0.2, unten: r * Math.sin(NEIGUNG) + 0.2 };
    this.breite = Math.ceil(2 * this.aus.seite * ppm); this.hoehe = Math.ceil((this.aus.oben + this.aus.unten) * ppm); this.fussY = this.aus.oben / (this.aus.oben + this.aus.unten);
    this.gruppe.visible = false; gemeinsam().buehne.add(this.gruppe);
  }
  static async erstellen(url: string, figurHoehePx: number, aufloesung: number, w: BaumWerte): Promise<BaumBild> { return new BaumBild(await baumVorlage(url), figurHoehePx, aufloesung, w); }
  /** zeit in Sekunden (für den Wind) */
  zeichne(zeit: number, ziel: CanvasRenderingContext2D): void {
    const { zeichner: z, buehne: b, kamera: k } = gemeinsam(), w = this.w, a = this.aus;
    BAUM_U.uZeit.value = zeit; BAUM_U.uPhase.value = w.phase; BAUM_U.uWind.value = w.wind; BAUM_U.uHoehe.value = this.h; BAUM_U.uFarbton.value = w.farbton; BAUM_U.uSaett.value = w.saett; BAUM_U.uHell.value = w.hell;
    if (z.domElement.width !== this.breite || z.domElement.height !== this.hoehe) z.setSize(this.breite, this.hoehe, false);
    if (k.right !== a.seite || k.top !== a.oben || k.bottom !== -a.unten) { k.left = -a.seite; k.right = a.seite; k.top = a.oben; k.bottom = -a.unten; k.updateProjectionMatrix(); }
    for (const c of b.children) if (c.type === "Group" || c.type === "Object3D") c.visible = c === this.gruppe;
    z.render(b, k); this.gruppe.visible = false; ziel.clearRect(0, 0, this.breite, this.hoehe); ziel.drawImage(z.domElement, 0, 0);
  }
  entfernen(): void { this.gruppe.removeFromParent(); const sc = this.schatten; if (sc) { sc.geometry.dispose(); (sc.material as THREE.Material).dispose(); } }   // Modell und Textur gehören der Vorlage (geteilt), nur der Schatten ist eigen
}

(window as unknown as Record<string, unknown>).MytharaEcht3D = { Darsteller, standbild, GeschossBild, BaumBild };
