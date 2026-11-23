/*
 * Mythara – der eigene Held (und die Helden der Mitspieler) als echtes 3D-Modell in der 3D-Welt.
 *
 * Modelle der Figuren-Fabrik: img/figuren-echt3d/basemann3d.glb und basefrau3d.glb (die Grundfiguren) – Skelett, Körper, alle Frisuren und Bärte, Brustrüstungen,
 * alle Waffen als Teile, Bewegungen ruhe, gehen, laufen, stich, bogen, zauber_stab, block, tod (fabrik/export3d.py).
 * Sichtbar ist, was der Held trägt: Frisur und Bart aus dem Heldeneditor, beim eigenen Helden die angelegten Waffen.
 * Gefärbt wie die 2D-Figuren: Haar und Bart relativ zur Farbe, in der sie gebaut sind; die Haut im Shader über dieselbe Farberkennung,
 * mit der die 2D-Hautebene entstand (werkzeug/grundfigur.py), auf die Zielhautfarbe (Helligkeit × Zielfarbe / Bezugshelligkeit).
 * Bis das Modell geladen ist (5–8 MB), steht das bisherige Bild da (FigurLeinwand); schlägt das Laden fehl, bleibt es dabei.
 * Abschaltbar je Gerät: ?held3d=0 (wieder an: ?held3d=1).
 * Schnittstelle wie FigurLeinwand: stelle, blick, blickWinkel, setze, angriff, sterben, sichtbar, schritt, entfernen, geladen, bild.gruppe.
 */
import { TeleportEffekt } from "../echt3d/darsteller";
/** Dauer des Teleport-Effekts (Sekunden, wie echt3d/figur.ts) */
const TELEPORT_S = 1.8;
import * as THREE from "three";
import { angriffFuer } from "../../../shared/gegenstaende";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { FigurLeinwand } from "./figurleinwand";
import { Held, HAARFARBEN, HAUTFARBEN, STARTWAFFEN, STANDARD } from "../../../shared/aussehen";

const MODELLE = "../img/figuren-echt3d/", P = new URLSearchParams(location.search);
/* ausgelagerte Teile (Rüstungen, Helme): eigene Dateien <figur>.teile/<id>.glb (Figuren-Fabrik, wie echt3d/darsteller.ts) – erst beim Anlegen geladen */
const AUSGELAGERT = /^(ruestung|kopf\.helm|waffe|schild)\./, teilVorlagen = new Map<string, Promise<THREE.Object3D>>();
const teilVorlage = (url: string): Promise<THREE.Object3D> => { let p = teilVorlagen.get(url); if (!p) { p = new GLTFLoader().loadAsync(url).then((g) => g.scene); teilVorlagen.set(url, p); } return p; };
/** Farbe, in der Haare und Bärte gebaut sind (fabrik/frisuren.py, fabrik/bart.py) und Bezugshelligkeit der Haut (img/figuren-fabrik/held.*: bezug.haut) */
const GEBAUT: Record<string, [number, number, number]> = { mann: [59, 38, 24], frau: [110, 69, 41] }, HAUT_BEZUG: Record<string, number> = { mann: 203, frau: 210.3 };
const teil = (id: string) => id.replace(/[.[\]:/]/g, ""); /* three.js entfernt diese Zeichen aus Knotennamen */
const linear = (c: number) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };

/** Sind 3D-Helden eingeschaltet? Standard ja; ?held3d=0 schaltet auf diesem Gerät die Bilder ein (gemerkt) */
export function held3dAn(): boolean { try { if (P.get("held3d") === "0") localStorage.setItem("ez_held3d", "0"); if (P.get("held3d") === "1") localStorage.removeItem("ez_held3d"); return localStorage.getItem("ez_held3d") !== "0"; } catch { return P.get("held3d") !== "0"; } }

export interface Vorlage { szene: THREE.Object3D; clips: Map<string, THREE.AnimationClip> }
const vorlagen = new Map<string, Promise<Vorlage>>();
export function vorlage(g: string): Promise<Vorlage> { let p = vorlagen.get(g);
  if (!p) { p = new GLTFLoader().loadAsync(MODELLE + g + ".glb").then((x) => ({ szene: x.scene, clips: new Map(x.animations.map((c) => [c.name, c])) })); vorlagen.set(g, p); p.catch(() => vorlagen.delete(g)); }
  return p; }

/** Hautfarbe im Shader: Bildpunkte, die nach Haut aussehen (wie werkzeug/grundfigur.py), bekommen Helligkeit × Zielfarbe / Bezug */
function hautFaerben(m: THREE.MeshStandardMaterial, faktor: THREE.Vector3) {
  m.onBeforeCompile = (sh) => { sh.uniforms.hautFaktor = { value: faktor };
    sh.fragmentShader = "uniform vec3 hautFaktor;\n" + sh.fragmentShader.replace("#include <map_fragment>", `#include <map_fragment>
      { vec3 s = pow(max(diffuseColor.rgb, vec3(0.0)), vec3(1.0 / 2.2)); float mx = max(s.r, max(s.g, s.b)), mn = min(s.r, min(s.g, s.b)), sat = mx > 0.0 ? (mx - mn) / mx : 0.0;
        float haut = smoothstep(0.13, 0.17, s.r - s.g) * smoothstep(0.18, 0.22, s.r - s.b) * smoothstep(0.34, 0.38, sat);
        vec3 t = clamp(dot(s, vec3(0.299, 0.587, 0.114)) * hautFaktor, 0.0, 1.0); diffuseColor.rgb = mix(diffuseColor.rgb, pow(t, vec3(2.2)), haut); }`); };
  m.customProgramCacheKey = () => "haut"; m.needsUpdate = true; }

export class Held3D {
  /** wie FigurLeinwand: die Gruppe, die in der Welt steht (für Prüfungen: bild.gruppe.position) */
  readonly bild = { gruppe: new THREE.Group() }; private ersatz: FigurLeinwand; private wurzel: THREE.Object3D | null = null; private mixer: THREE.AnimationMixer | null = null;
  private clips = new Map<string, THREE.AnimationClip>(); private aktion: THREE.AnimationAction | null = null; private name = ""; private teile = new Map<string, THREE.Object3D>(); private mats: THREE.Material[] = [];
  private zustand = "ruhe"; private einmal = false; private gestorben = false; private blickW = Math.PI / 2; private dreh = Math.PI / 2; private weg = false; private an = true;
  fertig: (() => void) | null = null; private effekt: TeleportEffekt | null = null; private skala = 1;
  /** held: eigener Held oder Mitspieler (gefärbt, nur getragene Teile); gegner: ein Gegner-Modell (alle Teile, z. B. Dolch und Beuteschild) */
  constructor(private szene: THREE.Scene, private hoehe: number, private held: (Held & { ich?: boolean }) | null, private waffenQuelle?: (() => string[]) | null, private gegner?: { datei: string; angriff: string; ersatz: string; mass?: number }) {
    this.ersatz = new FigurLeinwand(szene, gegner ? gegner.ersatz : "", hoehe, held, waffenQuelle); this.ersatz.aus = true; /* kein 2D-Bild, während das Modell lädt – nur wenn es nicht lädt */ szene.add(this.bild.gruppe);
    vorlage(gegner ? gegner.datei : "base" + held!.aussehen.g + "3d") /* Basismann/Basisfrau: die maßgeblichen Grundfiguren der Fabrik */.then((v) => this.aufbauen(v)).catch((e) => { console.warn("3D-Figur:", e); this.ersatz.aus = false; this.ersatz.sichtbar(this.an); }); }
  private aufbauen(v: Vorlage) {
    if (this.weg) return; const w = SkeletonUtils.clone(v.szene); this.clips = v.clips;
    w.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.frustumCulled = false; m.castShadow = true; m.receiveShadow = true; } });
    if (!this.held) { this.fertigBauen(w); return; } const A = this.held.aussehen;
    const hf = HAUTFARBEN[A.haut].rgb, faktor = new THREE.Vector3(hf[0] / HAUT_BEZUG[A.g], hf[1] / HAUT_BEZUG[A.g], hf[2] / HAUT_BEZUG[A.g]);
    const hz = HAARFARBEN[A.haar].rgb, gb = GEBAUT[A.g], haar = new THREE.Color(...([0, 1, 2].map((i) => linear(hz[i]) / Math.max(1e-4, linear(gb[i]))) as [number, number, number]));
    w.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.frustumCulled = false; m.castShadow = true; m.receiveShadow = true; }
      const n = o.name; if (/^(waffe|schild|kopf|ruestung)/.test(n) && !(o.parent && /^(waffe|schild|kopf|ruestung)/.test(o.parent.name)) && !this.teile.has(n)) this.teile.set(n, o); });
    w.traverse((o) => { const m = o as THREE.Mesh; if (!m.isMesh) return; const zuTeil = (() => { let q: THREE.Object3D | null = o; while (q) { if (/^kopf(haar|bart)/.test(q.name)) return "haar"; if (/^(waffe|schild|ruestung)/.test(q.name)) return "waffe"; q = q.parent; } return "koerper"; })();
      if (zuTeil === "waffe") return; const mat = (m.material as THREE.MeshStandardMaterial).clone(); this.mats.push(mat); m.material = mat;
      if (zuTeil === "haar") mat.color.copy(haar); else hautFaerben(mat, faktor); });
    this.fertigBauen(w); }
  private fertigBauen(w: THREE.Object3D) {
    const s = ((this.gegner && this.gegner.mass) || this.hoehe) / 1.8; w.scale.setScalar(s); this.wurzel = w; this.bild.gruppe.add(w); this.mixer = new THREE.AnimationMixer(w);
    this.mixer.addEventListener("finished", () => { if (this.einmal) { this.einmal = false; this.anwenden(); const f = this.fertig; if (f) f(); } });
    this.zeigen(); this.anwenden(); this.ersatz.sichtbar(false); this.ersatz.entfernen(this.szene); }
  get geladen(): boolean { return Boolean(this.wurzel) || this.ersatz.geladen; }
  /** angelegte Waffen, Frisur und Bart sichtbar, alles andere aus */
  private zeigen() { if (!this.held) return; const A = this.held.aussehen, ids = this.held.ich && this.waffenQuelle ? this.waffenQuelle() : STARTWAFFEN[this.held.waffe].waffen, helm = ids.some((e) => e.startsWith("kopf.helm."));
    const soll = new Set([...ids, ...(A.frisur !== "glatze" && !helm ? ["kopf.haar." + A.frisur] : []), ...(A.g === "mann" && A.bart !== "ohne" ? ["kopf.bart." + A.bart] : [])].map(teil)); /* unter dem Helm keine Frisur */
    this.soll = soll; for (const [n, o] of this.teile) o.visible = soll.has(n);
    for (const id of ids) { const n = teil(id); if (AUSGELAGERT.test(id) && !this.teile.has(n) && !this.ladend.has(n)) { this.ladend.add(n); void this.teilLaden(id, n); } } }
  private soll = new Set<string>(); private ladend = new Set<string>();
  /** Ein ausgelagertes Teil laden und an das Skelett hängen (Knochen nach Namen, gleiche Grundhaltung: aus demselben Rig gebaut) */
  private async teilLaden(id: string, n: string): Promise<void> {
    try { const quelle = await teilVorlage(MODELLE + "base" + this.held!.aussehen.g + "3d.teile/" + id + ".glb"), w = this.wurzel; if (!w || this.weg) return;
      const knochen = new Map<string, THREE.Bone>(); w.traverse((o) => { if ((o as THREE.Bone).isBone) knochen.set(o.name, o as THREE.Bone); });
      let koerper: THREE.Object3D | null = null; w.traverse((o) => { if (!koerper && (o as THREE.SkinnedMesh).isSkinnedMesh && /^koerper/.test(o.name)) koerper = o; });
      quelle.traverse((o) => { const m = o as THREE.Mesh; /* starre Teile (Waffen, Schilde): Kind eines Knochens – an denselben Knochen dieser Figur hängen (wie echt3d/darsteller.ts) */
        if (!m.isMesh || (m as THREE.SkinnedMesh).isSkinnedMesh || this.teile.has(n)) return; let pk = m.parent; while (pk && !(pk as THREE.Bone).isBone) pk = pk.parent;
        const ziel = pk && knochen.get(pk.name); if (!ziel) return; const g = new THREE.Group(); g.name = n; pk!.updateWorldMatrix(true, true);
        const rel = new THREE.Matrix4().copy(pk!.matrixWorld).invert().multiply(m.matrixWorld); rel.decompose(g.position, g.quaternion, g.scale);
        const kopie = new THREE.Mesh(m.geometry, m.material); kopie.frustumCulled = false; kopie.castShadow = true; g.add(kopie); ziel.add(g); g.visible = this.soll.has(n); this.teile.set(n, g); });
      quelle.traverse((o) => { const sm = o as THREE.SkinnedMesh; if (!sm.isSkinnedMesh || this.teile.has(n)) return;
        const bones = sm.skeleton.bones.map((b) => knochen.get(b.name)); if (bones.some((b) => !b)) { console.warn("Teil passt nicht aufs Skelett:", id); return; }
        const neu = new THREE.SkinnedMesh(sm.geometry, sm.material); neu.name = n; neu.frustumCulled = false; neu.castShadow = true; neu.receiveShadow = true;
        const k = koerper as THREE.Object3D | null; (k && k.parent ? k.parent : w).add(neu); neu.bind(new THREE.Skeleton(bones as THREE.Bone[], sm.skeleton.boneInverses.map((m) => m.clone())), sm.bindMatrix.clone());
        neu.visible = this.soll.has(n); this.teile.set(n, neu); });
    } catch (e) { console.warn("Teil fehlt:", id, e); } finally { this.ladend.delete(n); } }
  stelle(x: number, y: number, z: number): void { this.bild.gruppe.position.set(x, y, z); if (!this.wurzel) this.ersatz.stelle(x, y, z); }
  blick(wx: number, wz: number): void { if (Math.hypot(wx, wz) > 1e-3) this.blickW = Math.atan2(wz, wx); this.ersatz.blick(wx, wz); }
  get blickWinkel(): number { return this.blickW; }
  setze(z: "ruhe" | "laufen" | "rennen" | "block" | "schild_laufen"): void { this.ersatz.setze(z === "rennen" ? "laufen" : z); if (this.gestorben || z === this.zustand) return; this.zustand = z; if (!this.einmal) this.anwenden(); }
  angriff(): void { this.ersatz.angriff(); if (this.gestorben || !this.mixer) return; this.einmal = true; const a = this.gegner ? null : angriffFuer(this.held!.ich && this.waffenQuelle ? this.waffenQuelle() : STARTWAFFEN[this.held!.waffe].waffen); /* Bewegung zur angelegten Waffe */
    this.spiele(this.gegner ? this.gegner.angriff : a && this.clips.has(a) ? a : STARTWAFFEN[this.held!.waffe].angriff, true); }
  sterben(): number { if (!this.wurzel) return this.ersatz.sterben(); const c = this.clips.get("tod"); if (!c) return 0; this.gestorben = true; this.einmal = false; this.spiele("tod", true); return c.duration * 1000; }
  /** Trinken (Figuren-Fabrik „trinken“, Hand zum Mund) – nur wenn das Modell die Bewegung hat. Zurück: Dauer in ms */
  trinken(): number { if (!this.wurzel || this.gestorben || !this.mixer) return 0; const c = this.clips.get("trinken"); if (!c) return 0; this.einmal = true; this.spiele("trinken", true); return c.duration * 1000; }
  /** Teleport (Abreise, Figuren-Fabrik): Bewegung teleport_weg, Lichtsäule, die Figur vergeht im Licht und bleibt weg. Zurück: Dauer in ms (0 = kein Modell) */
  teleport(): number { if (!this.wurzel || this.gestorben || this.effekt) return 0; this.gestorben = true; this.einmal = false; if (this.clips.has("teleport_weg")) this.spiele("teleport_weg", true);
    const fx = new TeleportEffekt(this.wurzel, TELEPORT_S, 60); fx.gruppe.scale.setScalar(this.hoehe / 1.8); fx.gruppe.visible = true; this.bild.gruppe.add(fx.gruppe); this.effekt = fx;
    this.skala = this.wurzel.scale.x; return TELEPORT_S * 1000; }
  sichtbar(an: boolean): void { this.an = an; this.bild.gruppe.visible = an; if (!this.wurzel) this.ersatz.sichtbar(an); }
  /* Bewegungen der Figuren-Fabrik: „gehen“ fürs normale Bewegen, „laufen“ ist dort das Rennen (Sprint). Abgespielt so schnell, dass die Schritte zum Tempo passen
     (Fabrik: Gehen 1,6 m/s, Rennen 4,2 m/s bei 1,8 m; hier 2,0 m, also 1,78 / 4,67 Felder/s: Gehen 2 Felder/s → ×1,12, Sprint 4 Felder/s → ×0,86 – „Felder und Schräge“) */
  private anwenden() { const z = this.zustand; if (z === "block") this.spiele(this.clips.has("block") ? "block" : "treffer" /* Mooshocker: zuckt zusammen */, true, true);
    else if (z === "rennen") this.spiele("laufen", false, false, 0.86);
    else if (z === "laufen") { if (this.clips.has("gehen")) this.spiele("gehen", false, false, 1.12); else this.spiele("laufen", false, false, 0.45); }
    else this.spiele(z === "schild_laufen" ? "gehen" : "ruhe", false); }
  private spiele(name: string, einmal: boolean, halten = einmal, tempo = 1) { const c = this.clips.get(name), m = this.mixer; if (!c || !m) return; if (this.name === name && !einmal) { if (this.aktion) this.aktion.timeScale = tempo; return; }
    const neu = m.clipAction(c); neu.reset(); neu.setLoop(einmal ? THREE.LoopOnce : THREE.LoopRepeat, Infinity); neu.clampWhenFinished = halten; neu.timeScale = tempo;
    if (this.aktion && this.aktion !== neu) neu.crossFadeFrom(this.aktion, 0.12, false); neu.play(); this.aktion = neu; this.name = name; }
  /** weiterrechnen; der Blick dreht weich zur Laufrichtung (Modell schaut nach +z, also Süden) */
  schritt(dtMs: number, gieren: number): void {
    if (!this.wurzel) { this.ersatz.schritt(dtMs, gieren); return; } if (!this.an) return; const dt = dtMs / 1000;
    if (this.held && this.held.ich) this.zeigen(); /* angelegte Waffen können sich ändern (Ausrüstung) */
    const ziel = Math.atan2(Math.cos(this.blickW), Math.sin(this.blickW)); let d = ziel - this.dreh; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    this.dreh += d * Math.min(1, dt * 12); this.wurzel.rotation.y = this.dreh; if (this.mixer) this.mixer.update(dt);
    const fx = this.effekt; if (fx) { fx.weiter(dt); this.wurzel.scale.multiplyScalar(this.skala); /* der Effekt zieht die Figur schmal und lang (Maßstab 1) – hier auf die Weltgröße */ this.wurzel.visible = !fx.vergangen; } }
  entfernen(szene: THREE.Scene): void { this.weg = true; szene.remove(this.bild.gruppe); this.ersatz.entfernen(szene); if (this.mixer) this.mixer.stopAllAction(); for (const m of this.mats) m.dispose(); }
}
/** Figur eines Helden: mit eigenem Aussehen als 3D-Modell (wenn eingeschaltet), sonst das bisherige Bild */
export function heldenFigur3D(szene: THREE.Scene, figur: string, hoehe: number, eigen?: (Held & { ich?: boolean }) | null, quelle?: (() => string[]) | null): FigurLeinwand | Held3D {
  /* ohne eigenes Aussehen (Gast, ältere Mitspieler): der Basismann im Standardaussehen statt des alten Heldenbilds */
  return held3dAn() ? new Held3D(szene, hoehe, eigen || STANDARD, quelle) : new FigurLeinwand(szene, figur, hoehe, eigen, quelle); }
export type FigurArt = FigurLeinwand | Held3D;
/** Gegner mit 3D-Modell (img/figuren-echt3d/): bis geladen das bisherige Bild der Fabrik */
const GEGNER3D: Record<string, { datei: string; angriff: string; ersatz: string; mass?: number }> = { bandit_dolch: { datei: "bandit3d", angriff: "stich", ersatz: "gegner.bandit.v003" },
  /* Mooshocker: Modell in echter Größe (0,7 m hoch) im Maßstab der Helden (2,0 m statt 1,8 m); die Gegnerhöhe (Name, Lebensbalken) kommt aus MONSTER.hoehe */
  mooshocker: { datei: "mooshocker3d", angriff: "kopfstoss", ersatz: "gegner.bandit.v003", mass: 2.0 } };
export function gegnerFigur3D(szene: THREE.Scene, typ: string, ersatz: string, hoehe: number): FigurArt {
  const G = GEGNER3D[typ]; return G && held3dAn() ? new Held3D(szene, hoehe, null, null, G) : new FigurLeinwand(szene, ersatz, hoehe, null); }
