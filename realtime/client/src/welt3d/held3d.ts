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
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { FigurLeinwand } from "./figurleinwand";
import { Held, HAARFARBEN, HAUTFARBEN, STARTWAFFEN } from "../../../shared/aussehen";

const MODELLE = "../img/figuren-echt3d/", P = new URLSearchParams(location.search);
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
  fertig: (() => void) | null = null;
  /** held: eigener Held oder Mitspieler (gefärbt, nur getragene Teile); gegner: ein Gegner-Modell (alle Teile, z. B. Dolch und Beuteschild) */
  constructor(private szene: THREE.Scene, private hoehe: number, private held: (Held & { ich?: boolean }) | null, private waffenQuelle?: (() => string[]) | null, private gegner?: { datei: string; angriff: string; ersatz: string }) {
    this.ersatz = new FigurLeinwand(szene, gegner ? gegner.ersatz : "", hoehe, held, waffenQuelle); szene.add(this.bild.gruppe);
    vorlage(gegner ? gegner.datei : "base" + held!.aussehen.g + "3d") /* Basismann/Basisfrau: die maßgeblichen Grundfiguren der Fabrik */.then((v) => this.aufbauen(v)).catch((e) => console.warn("3D-Figur:", e)); }
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
    const s = this.hoehe / 1.8; w.scale.setScalar(s); this.wurzel = w; this.bild.gruppe.add(w); this.mixer = new THREE.AnimationMixer(w);
    this.mixer.addEventListener("finished", () => { if (this.einmal) { this.einmal = false; this.anwenden(); const f = this.fertig; if (f) f(); } });
    this.zeigen(); this.anwenden(); this.ersatz.sichtbar(false); this.ersatz.entfernen(this.szene); }
  get geladen(): boolean { return Boolean(this.wurzel) || this.ersatz.geladen; }
  /** angelegte Waffen, Frisur und Bart sichtbar, alles andere aus */
  private zeigen() { if (!this.held) return; const A = this.held.aussehen, soll = new Set([...(this.held.ich && this.waffenQuelle ? this.waffenQuelle() : STARTWAFFEN[this.held.waffe].waffen), ...(A.frisur !== "glatze" ? ["kopf.haar." + A.frisur] : []), ...(A.g === "mann" && A.bart !== "ohne" ? ["kopf.bart." + A.bart] : [])].map(teil));
    for (const [n, o] of this.teile) o.visible = soll.has(n); }
  stelle(x: number, y: number, z: number): void { this.bild.gruppe.position.set(x, y, z); if (!this.wurzel) this.ersatz.stelle(x, y, z); }
  blick(wx: number, wz: number): void { if (Math.hypot(wx, wz) > 1e-3) this.blickW = Math.atan2(wz, wx); this.ersatz.blick(wx, wz); }
  get blickWinkel(): number { return this.blickW; }
  setze(z: "ruhe" | "laufen" | "block" | "schild_laufen"): void { this.ersatz.setze(z); if (this.gestorben || z === this.zustand) return; this.zustand = z; if (!this.einmal) this.anwenden(); }
  angriff(): void { this.ersatz.angriff(); if (this.gestorben || !this.mixer) return; this.einmal = true; this.spiele(this.gegner ? this.gegner.angriff : STARTWAFFEN[this.held!.waffe].angriff, true); }
  sterben(): number { if (!this.wurzel) return this.ersatz.sterben(); const c = this.clips.get("tod"); if (!c) return 0; this.gestorben = true; this.einmal = false; this.spiele("tod", true); return c.duration * 1000; }
  sichtbar(an: boolean): void { this.an = an; this.bild.gruppe.visible = an; if (!this.wurzel) this.ersatz.sichtbar(an); }
  private anwenden() { const z = this.zustand; if (z === "block") this.spiele("block", true, true); else this.spiele(z === "laufen" ? "laufen" : z === "schild_laufen" ? "gehen" : "ruhe", false); }
  private spiele(name: string, einmal: boolean, halten = einmal) { const c = this.clips.get(name), m = this.mixer; if (!c || !m) return; if (this.name === name && !einmal) return;
    const neu = m.clipAction(c); neu.reset(); neu.setLoop(einmal ? THREE.LoopOnce : THREE.LoopRepeat, Infinity); neu.clampWhenFinished = halten;
    if (this.aktion && this.aktion !== neu) neu.crossFadeFrom(this.aktion, 0.12, false); neu.play(); this.aktion = neu; this.name = name; }
  /** weiterrechnen; der Blick dreht weich zur Laufrichtung (Modell schaut nach +z, also Süden) */
  schritt(dtMs: number, gieren: number): void {
    if (!this.wurzel) { this.ersatz.schritt(dtMs, gieren); return; } if (!this.an) return; const dt = dtMs / 1000;
    if (this.held && this.held.ich) this.zeigen(); /* angelegte Waffen können sich ändern (Ausrüstung) */
    const ziel = Math.atan2(Math.cos(this.blickW), Math.sin(this.blickW)); let d = ziel - this.dreh; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    this.dreh += d * Math.min(1, dt * 12); this.wurzel.rotation.y = this.dreh; if (this.mixer) this.mixer.update(dt); }
  entfernen(szene: THREE.Scene): void { this.weg = true; szene.remove(this.bild.gruppe); this.ersatz.entfernen(szene); if (this.mixer) this.mixer.stopAllAction(); for (const m of this.mats) m.dispose(); }
}
/** Figur eines Helden: mit eigenem Aussehen als 3D-Modell (wenn eingeschaltet), sonst das bisherige Bild */
export function heldenFigur3D(szene: THREE.Scene, figur: string, hoehe: number, eigen?: (Held & { ich?: boolean }) | null, quelle?: (() => string[]) | null): FigurLeinwand | Held3D {
  return eigen && held3dAn() ? new Held3D(szene, hoehe, eigen, quelle) : new FigurLeinwand(szene, figur, hoehe, eigen, quelle); }
export type FigurArt = FigurLeinwand | Held3D;
/** Gegner mit 3D-Modell (img/figuren-echt3d/): bis geladen das bisherige Bild der Fabrik */
const GEGNER3D: Record<string, { datei: string; angriff: string; ersatz: string }> = { bandit_dolch: { datei: "bandit3d", angriff: "stich", ersatz: "gegner.bandit.v003" } };
export function gegnerFigur3D(szene: THREE.Scene, typ: string, ersatz: string, hoehe: number): FigurArt {
  const G = GEGNER3D[typ]; return G && held3dAn() ? new Held3D(szene, hoehe, null, null, G) : new FigurLeinwand(szene, ersatz, hoehe, null); }
