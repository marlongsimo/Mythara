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
import { TICK } from "../../../shared/kampfwerte";
import { TeleportEffekt } from "../echt3d/darsteller";
import { Aufladung, SPLITTER_VIOLETT } from "../echt3d/aufladung";
/** Dauer des Teleport-Effekts (Sekunden, wie echt3d/figur.ts) */
const TELEPORT_S = 1.8;
import * as THREE from "three";
import { angriffFuer } from "../../../shared/gegenstaende";
import { gltfLader } from "./gltf";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { FigurLeinwand } from "./figurleinwand";
import { Held, HAARFARBEN, HAUTFARBEN, STARTWAFFEN, STANDARD } from "../../../shared/aussehen";
import { FIGUR_MOBIL } from "../figurstufe";

const MODELLE = "../img/figuren-echt3d/", P = new URLSearchParams(location.search);
/* ausgelagerte Teile (Rüstungen, Helme): eigene Dateien <figur>.teile/<id>.glb (Figuren-Fabrik, wie echt3d/darsteller.ts) – erst beim Anlegen geladen */
/** Beil und Spitzhacke in der Hand größer (sie wirkten sehr klein, 26.11.2026) */
/** Werkzeug-Modell (img/objekte3d/skilling/utensilien/<art>[.<stufe>].glb) → gleichnamiges Waffenteil der Figur (base…3d.teile/waffe.<art>[.<stufe>].glb, Figuren-Fabrik) */
const werkzeugTeil = (url: string): string => { const m = /((?:holzbeil|spitzhacke|angelrute)(?:\.\w+)?)\.glb$/.exec(url); return m ? "waffe." + m[1] : ""; };
/** Ruhe-Bewegung (Stehen) halb so schnell: dauert doppelt so lang (26.11.2026) */
export const RUHE_TEMPO = 0.5;
/** Welches Werkzeug der eigene Held angelegt hat (Modell-Adresse oder "") – gesetzt von spielwelt.ts */
const AUSGELAGERT = /^(ruestung|kopf\.helm|waffe|schild)\./, teilVorlagen = new Map<string, Promise<THREE.Object3D>>();
const teilVorlage = (url: string): Promise<THREE.Object3D> => { let p = teilVorlagen.get(url); if (!p) { p = glbStufe(url).then((g) => g.scene); teilVorlagen.set(url, p); } return p; };
/** #112: bei Grafik „flüssig“ (Handy) die einfache Fassung <name>.mobil.glb (gleiches Skelett, rund 5.000 statt 35.000 Dreiecke); fehlt sie, die volle */
function glbStufe(url: string): Promise<{ scene: THREE.Object3D; animations: THREE.AnimationClip[] }> {
  if (!FIGUR_MOBIL || !/\.glb$/.test(url)) return gltfLader().loadAsync(url);
  return gltfLader().loadAsync(url.replace(/\.glb$/, ".mobil.glb")).catch(() => gltfLader().loadAsync(url)); }
/** Farbe, in der Haare und Bärte gebaut sind (fabrik/frisuren.py, fabrik/bart.py) und Bezugshelligkeit der Haut (img/figuren-fabrik/held.*: bezug.haut) */
const GEBAUT: Record<string, [number, number, number]> = { mann: [59, 38, 24], frau: [110, 69, 41] }, HAUT_BEZUG: Record<string, number> = { mann: 203, frau: 210.3 };
const teil = (id: string) => id.replace(/[.[\]:/]/g, ""); /* three.js entfernt diese Zeichen aus Knotennamen */
const linear = (c: number) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };

/** Sind 3D-Helden eingeschaltet? Standard ja; ?held3d=0 schaltet auf diesem Gerät die Bilder ein (gemerkt) */
export function held3dAn(): boolean { try { if (P.get("held3d") === "0") localStorage.setItem("ez_held3d", "0"); if (P.get("held3d") === "1") localStorage.removeItem("ez_held3d"); return localStorage.getItem("ez_held3d") !== "0"; } catch { return P.get("held3d") !== "0"; } }

export interface Vorlage { szene: THREE.Object3D; clips: Map<string, THREE.AnimationClip> }
const vorlagen = new Map<string, Promise<Vorlage>>();
export function vorlage(g: string): Promise<Vorlage> { let p = vorlagen.get(g);
  if (!p) { p = glbStufe(MODELLE + g + ".glb").then((x) => ({ szene: x.scene, clips: new Map(x.animations.map((c) => [c.name, c])) })); vorlagen.set(g, p); p.catch(() => vorlagen.delete(g));
    /* Grundfiguren: die Werk-Bewegungen des Handwerks (fabrik/werk_bewegungen.py) liegen in einer eigenen kleinen Datei – danach nachladen, sie kommen in dieselbe Liste */
    if (WERK_BEWEGUNGEN.has(g)) for (const datei of ["werk_", "angeln_"]) /* Angeln (Phase 3b): angeln, angeln_warten, angeln_einholen – fabrik/angel_bewegungen.py */
      void p.then((v) => gltfLader().loadAsync(MODELLE + datei + g + ".glb").then((x) => { for (const c of x.animations) v.clips.set(c.name, c); })).catch(() => { /* ohne: Ersatzbewegungen */ }); }
  return p; }
const WERK_BEWEGUNGEN = new Set(["basemann3d", "basefrau3d"]);

/** Hautfarbe im Shader: Bildpunkte, die nach Haut aussehen (wie werkzeug/grundfigur.py), bekommen Helligkeit × Zielfarbe / Bezug */
function hautFaerben(m: THREE.MeshStandardMaterial, faktor: THREE.Vector3) {
  m.onBeforeCompile = (sh) => { sh.uniforms.hautFaktor = { value: faktor };
    sh.fragmentShader = "uniform vec3 hautFaktor;\n" + sh.fragmentShader.replace("#include <map_fragment>", `#include <map_fragment>
      { vec3 s = pow(max(diffuseColor.rgb, vec3(0.0)), vec3(1.0 / 2.2)); float mx = max(s.r, max(s.g, s.b)), mn = min(s.r, min(s.g, s.b)), sat = mx > 0.0 ? (mx - mn) / mx : 0.0;
        float haut = smoothstep(0.13, 0.17, s.r - s.g) * smoothstep(0.18, 0.22, s.r - s.b) * smoothstep(0.34, 0.38, sat);
        vec3 t = clamp(dot(s, vec3(0.299, 0.587, 0.114)) * hautFaktor, 0.0, 1.0); diffuseColor.rgb = mix(diffuseColor.rgb, pow(t, vec3(2.2)), haut); }`); };
  m.customProgramCacheKey = () => "haut"; m.needsUpdate = true; }

/** So lange dauert ein Angriff bzw. Beilhieb: 2 Ticks (shared/kampfwerte.ts → TICK = 0,5 s) */
const HIEB_MS = 2 * TICK * 1000;
export class Held3D {
  /** wie FigurLeinwand: die Gruppe, die in der Welt steht (für Prüfungen: bild.gruppe.position) */
  readonly bild = { gruppe: new THREE.Group() }; private ersatz: FigurLeinwand; private wurzel: THREE.Object3D | null = null; private mixer: THREE.AnimationMixer | null = null;
  private clips = new Map<string, THREE.AnimationClip>(); private aktion: THREE.AnimationAction | null = null; private name = ""; private teile = new Map<string, THREE.Object3D>(); private mats: THREE.Material[] = [];
  private zustand = "ruhe"; private einmal = false; private gestorben = false; private blickW = Math.PI / 2; private dreh = Math.PI / 2; private weg = false; private an = true;
  fertig: (() => void) | null = null; private effekt: TeleportEffekt | null = null; private skala = 1;
  /** held: eigener Held oder Mitspieler (gefärbt, nur getragene Teile); gegner: ein Gegner-Modell (alle Teile, z. B. Dolch und Beuteschild) */
  constructor(private szene: THREE.Scene, private hoehe: number, private held: (Held & { ich?: boolean }) | null, private waffenQuelle?: (() => string[]) | null, private gegner?: { datei: string; angriff: string; ersatz: string; mass?: number; stile?: string[] }) {
    this.ersatz = new FigurLeinwand(szene, gegner ? gegner.ersatz : "", hoehe, held, waffenQuelle, true /* Bilder erst laden, wenn das 3D-Modell scheitert */); this.ersatz.aus = true; /* kein 2D-Bild, während das Modell lädt – nur wenn es nicht lädt */ szene.add(this.bild.gruppe);
    /* angelegte Teile (Waffe, Schild, Rüstung) gleich mitladen – nicht erst nach dem Grundmodell: dann stehen Held und Ausrüstung zusammen da */
    if (!gegner && held) { const ids = held.ich && waffenQuelle ? waffenQuelle() : STARTWAFFEN[held.waffe].waffen; for (const id of ids) if (AUSGELAGERT.test(id)) void teilVorlage(MODELLE + "base" + held.aussehen.g + "3d.teile/" + id + ".glb").catch(() => { /* fehlt: später beim Anlegen gemeldet */ }); }
    vorlage(gegner ? gegner.datei : "base" + held!.aussehen.g + "3d") /* Basismann/Basisfrau: die maßgeblichen Grundfiguren der Fabrik */.then((v) => this.aufbauen(v)).catch((e) => { console.warn("3D-Figur:", e); this.ersatz.aus = false; this.ersatz.jetztLaden(); this.ersatz.sichtbar(this.an); }); }
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
  /** das geladene 3D-Modell (mit den angelegten Teilen) – für das Bild der eigenen Figur in der Werte-Übersicht (welt3d/heldbild.ts) */
  get modell(): THREE.Object3D | null { return this.wurzel; }
  /** Modell und alle angelegten Ausrüstungsteile sind da (für den Ladebildschirm: erst dann aufdecken) */
  get vollstaendig(): boolean { return Boolean(this.wurzel) && this.ladend.size === 0; }
  /** angelegte Waffen, Frisur und Bart sichtbar, alles andere aus */
  private zeigen() { if (!this.held) return; const A = this.held.aussehen, ids = this.held.ich && this.waffenQuelle ? this.waffenQuelle() : STARTWAFFEN[this.held.waffe].waffen, helm = ids.some((e) => e.startsWith("kopf.helm."));
    const soll = new Set([...ids, ...(A.frisur !== "glatze" && !helm ? ["kopf.haar." + A.frisur] : []), ...(A.g === "mann" && A.bart !== "ohne" ? ["kopf.bart." + A.bart] : [])].map(teil)); /* unter dem Helm keine Frisur */
    this.soll = soll; const beil = Boolean(this.beil && this.beil.visible) || this.haendeFrei; for (const [n, o] of this.teile) o.visible = soll.has(n) && !(beil && this.verdeckt.test(n)); /* während eines Beilhiebs bleibt die Waffe weg */
    for (const id of ids) { const n = teil(id); if (AUSGELAGERT.test(id) && !this.teile.has(n) && !this.ladend.has(n)) { this.ladend.add(n); void this.teilLaden(id, n); } } }
  private soll = new Set<string>(); private ladend = new Set<string>();
  /** Ein ausgelagertes Teil laden und an das Skelett hängen (Knochen nach Namen, gleiche Grundhaltung: aus demselben Rig gebaut) */
  private async teilLaden(id: string, n: string): Promise<void> {
    try { const quelle = await teilVorlage(MODELLE + "base" + this.held!.aussehen.g + "3d.teile/" + id + ".glb"), w = this.wurzel; if (!w || this.weg) return;
      const knochen = new Map<string, THREE.Bone>(); w.traverse((o) => { if ((o as THREE.Bone).isBone) knochen.set(o.name, o as THREE.Bone); });
      let koerper: THREE.Object3D | null = null; w.traverse((o) => { if (!koerper && (o as THREE.SkinnedMesh).isSkinnedMesh && /^koerper/.test(o.name)) koerper = o; });
      quelle.traverse((o) => { const m = o as THREE.Mesh; /* starre Teile (Waffen, Schilde): Kind eines Knochens – an denselben Knochen dieser Figur hängen (wie echt3d/darsteller.ts) */
        if (!m.isMesh || (m as THREE.SkinnedMesh).isSkinnedMesh || this.teile.has(n)) return; let pk = m.parent; while (pk && !knochen.has(pk.name)) pk = pk.parent; /* Knochen über den Namen: komprimierte Teile (ohne Skin) laden ihre Knochen als einfache Knoten */
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
  /** eine einmalige Bewegung, wenn das Modell sie hat (Rotmantel: rundumschlag, ruf, trinken) */
  bewegungEinmal(name: string): void { if (this.gestorben || !this.mixer || !this.clips.has(name)) return; this.einmal = true; this.spiele(name, true, true); }
  /** Stilwechsel (Ereignis „stil“): die Angriffsbewegung des neuen Stils */
  private stilNr = 0; stil(nr: number): void { this.stilNr = nr; }
  angriff(): void { this.ersatz.angriff(); if (this.gestorben || !this.mixer) return; this.einmal = true; const a = this.gegner ? null : angriffFuer(this.held!.ich && this.waffenQuelle ? this.waffenQuelle() : STARTWAFFEN[this.held!.waffe].waffen); /* Bewegung zur angelegten Waffe */
    const n = this.gegner ? (this.gegner.stile && this.gegner.stile[this.stilNr]) || this.gegner.angriff : a && this.clips.has(a) ? a : STARTWAFFEN[this.held!.waffe].angriff, c = this.clips.get(n);
    this.spiele(n, true, true, c ? (c.duration * 1000) / HIEB_MS : 1); /* jeder Angriff dauert 2 Ticks, egal wie lang der Clip ist */ }
  /* ───────── Holzfällerei: Hieb mit dem Beil (das Beil liegt im Rucksack; während des Hiebs ist es in der rechten Hand, die angelegte Waffe ist so lange weg) ───────── */
  /** was während eines Werkzeugschlags verschwindet */ private verdeckt = /^waffe/; /** Werken ohne Werkzeug: Waffe und Schild sind weg */ private haendeFrei = false;
  private beil: THREE.Object3D | null = null; private beilUrl = ""; private beilZurueck: ReturnType<typeof setTimeout> | null = null;
  /** Werkzeug für einen Hieb (es liegt im Rucksack) in die rechte Hand: dasselbe Waffenteil, das die Figur trägt, wenn es angelegt ist – gleiche Lage und Größe */
  private async beilAnhaengen(url: string): Promise<THREE.Object3D | null> {
    const w = this.wurzel; if (!w) return null; if (this.beil && this.beilUrl === url) return this.beil;
    if (this.beil) { this.beil.removeFromParent(); this.beil = null; }
    let hand: THREE.Object3D | null = null; w.traverse((o) => { if (!hand && (o as THREE.Bone).isBone && /^hand\.?R$|right.?hand/i.test(o.name)) hand = o; }); const id = werkzeugTeil(url); if (!hand || !id) return null;
    const q = await teilVorlage(MODELLE + "base" + this.held!.aussehen.g + "3d.teile/" + id + ".glb"); if (this.weg || !this.wurzel) return null; q.updateWorldMatrix(true, true);
    const g = new THREE.Group(); g.name = "werkzeug.beil";
    q.traverse((o) => { const m = o as THREE.Mesh; if (!m.isMesh || g.children.length) return; let pk = m.parent; while (pk && !/^hand\.?R$/i.test(pk.name)) pk = pk.parent; if (!pk) return;
      new THREE.Matrix4().copy(pk.matrixWorld).invert().multiply(m.matrixWorld).decompose(g.position, g.quaternion, g.scale);
      const k = new THREE.Mesh(m.geometry, m.material); k.castShadow = true; k.frustumCulled = false; g.add(k); });
    if (!g.children.length) return null; g.visible = false; (hand as THREE.Object3D).add(g); this.beil = g; this.beilUrl = url; return g; }
  /** Ein Hieb mit dem Beil (url: 3D-Modell des Beils). Dauer in ms */
  beilHieb(url: string, clipWahl = ""): number {
    if (this.gestorben || !this.mixer || !this.wurzel) { this.ersatz.angriff(); return 0; }
    /* der Einhand-Hieb (0,33 s im Kampf) wird zum Holzfällen auf HIEB_MS gedehnt: ausholen, zuschlagen – das Beil ist den ganzen Schwung zu sehen */
    const clip = clipWahl && this.clips.has(clipWahl) ? clipWahl : this.clips.has("angriff") ? "angriff" : "stich", c = this.clips.get(clip);
    this.verdeckt = /2h$/.test(clip) ? /^(waffe|schild)/ : /^waffe/; /* beidhändig (Spitzhacke): auch der Schild ist weg */ const dauer = c ? HIEB_MS : 800;
    if (this.beilZurueck) clearTimeout(this.beilZurueck); this.beilZurueck = setTimeout(() => this.beilWeg(), dauer + 120);
    void this.beilAnhaengen(url).then((b) => { if (!b || this.gestorben || !this.beilZurueck /* Schwung schon vorbei (Beil lud zu lange) */) return; b.visible = true; for (const [n, o] of this.teile) if (this.verdeckt.test(n)) o.visible = false; });
    this.einmal = true; this.spiele(clip, true, true, c ? (c.duration * 1000) / HIEB_MS : 1);
    return dauer; }
  /** Werken (Handwerk): die erste Bewegung aus wahl, die das Modell hat (eigene Werk-Clips der Figuren-Fabrik, sonst Ersatz); mit url ein Werkzeug in der Hand. Dauer in ms */
  werken(wahl: string[], url = ""): number { const clip = wahl.find((c) => this.clips.has(c)) || "";
    if (url) return this.beilHieb(url, clip);
    if (this.gestorben || !this.mixer || !this.wurzel || !clip) return 0; const c = this.clips.get(clip)!;
    this.verdeckt = /^(waffe|schild)/; this.haendeFrei = true; for (const [n, o] of this.teile) if (this.verdeckt.test(n)) o.visible = false; /* Hände frei */
    if (this.beilZurueck) clearTimeout(this.beilZurueck); this.beilZurueck = setTimeout(() => this.beilWeg(), HIEB_MS + 120);
    this.einmal = true; this.spiele(clip, true, true, (c.duration * 1000) / HIEB_MS); return HIEB_MS; }
  /** Beil weg, angelegte Waffe wieder sichtbar */
  beilWeg(): void { const angelte = Boolean(this.angelClip); this.angelClip = null; if (angelte && !this.einmal) this.anwenden(); this.haendeFrei = false; if (this.beilZurueck) { clearTimeout(this.beilZurueck); this.beilZurueck = null; } if (this.beil) this.beil.visible = false; for (const [n, o] of this.teile) if (/^(waffe|schild)/.test(n)) o.visible = this.soll.has(n) && !(this.beil && this.beil.visible); }
  sterben(): number { if (!this.wurzel) return this.ersatz.sterben(); const c = this.clips.get("tod"); if (!c) return 0; this.gestorben = true; this.einmal = false; this.spiele("tod", true); return c.duration * 1000; }
  /** Trinken (Figuren-Fabrik „trinken“, Hand zum Mund) – nur wenn das Modell die Bewegung hat. Zurück: Dauer in ms */
  trinken(): number { if (!this.wurzel || this.gestorben || !this.mixer) return 0; const c = this.clips.get("trinken"); if (!c) return 0; this.einmal = true; this.spiele("trinken", true); return c.duration * 1000; }
  /** Teleport (Abreise, Figuren-Fabrik): Bewegung teleport_weg, Lichtsäule, die Figur vergeht im Licht und bleibt weg. Zurück: Dauer in ms (0 = kein Modell) */
  teleport(): number { if (!this.wurzel || this.gestorben || this.effekt) return 0; this.gestorben = true; this.einmal = false; if (this.clips.has("teleport_weg")) this.spiele("teleport_weg", true);
    const fx = new TeleportEffekt(this.wurzel, TELEPORT_S, 60); fx.gruppe.scale.setScalar(this.hoehe / 1.8); fx.gruppe.visible = true; this.bild.gruppe.add(fx.gruppe); this.effekt = fx;
    this.skala = this.wurzel.scale.x; return TELEPORT_S * 1000; }
  /** Ankunft nach einem Teleport ohne Neuladen der Seite (Freunde, Wegstein): Lichtsäule weg, Figur wieder da (#53). Ohne laufenden Teleport: nichts */
  ankunft(): void { const fx = this.effekt; if (!fx || !this.wurzel) return; fx.weg(); fx.gruppe.removeFromParent(); this.effekt = null;
    this.wurzel.scale.setScalar(this.skala); this.wurzel.visible = true; this.gestorben = false; this.einmal = false; this.anwenden(); }
  sichtbar(an: boolean): void { this.an = an; this.bild.gruppe.visible = an; if (!this.wurzel) this.ersatz.sichtbar(an); }
  /* Bewegungen der Figuren-Fabrik: „gehen“ fürs normale Bewegen, „laufen“ ist dort das Rennen (Sprint). Abgespielt so schnell, dass die Schritte zum Tempo passen
     (Fabrik: Gehen 1,6 m/s, Rennen 4,2 m/s bei 1,8 m; hier 2,0 m, also 1,78 / 4,67 Felder/s: Gehen 2 Felder/s → ×1,12, Sprint 4 Felder/s → ×0,86 – „Felder und Schräge“) */
  /* ───────── Angeln (Phase 3b): die Rute bleibt in der Hand, bis beilWeg; auswerfen → warten (Schleife) → einholen → warten ───────── */
  private angelClip: string | null = null;
  /** Rute (url des Modells) in die Hand und eine Phase des Angelns; Zurück: ob das Modell die Bewegung hat */
  angeln(url: string, phase: "auswerfen" | "warten" | "einholen"): boolean {
    if (this.gestorben || !this.mixer || !this.wurzel) return false; const clip = phase === "warten" ? "angeln_warten" : phase === "einholen" ? "angeln_einholen" : "angeln";
    if (!this.clips.has(clip)) return false;
    if (this.beilZurueck) { clearTimeout(this.beilZurueck); this.beilZurueck = null; } this.verdeckt = /^(waffe|schild)/;
    void this.beilAnhaengen(url).then((b) => { if (!b || this.gestorben || !this.angelClip) return; b.visible = true; for (const [n, o] of this.teile) if (this.verdeckt.test(n)) o.visible = false; });
    this.angelClip = "angeln_warten";
    if (phase === "warten") { this.einmal = false; this.spiele(clip, false); } else { this.einmal = true; this.spiele(clip, true, true); }
    return true; }
  private anwenden() { if (this.angelClip && (this.zustand === "ruhe" || this.zustand === "")) { this.spiele(this.angelClip, false); return; } const z = this.zustand; if (z === "block") this.spiele(this.clips.has("block") ? "block" : "treffer" /* Mooshocker: zuckt zusammen */, true, true);
    else if (z === "rennen") this.spiele("laufen", false, false, 0.86);
    else if (z === "laufen") { if (this.clips.has("gehen")) this.spiele("gehen", false, false, 1.12); else this.spiele("laufen", false, false, 0.45); }
    else if (z === "schild_laufen") this.spiele("gehen", false); else this.spiele("ruhe", false, false, RUHE_TEMPO); } /* Ruhe-Bewegung doppelt so lang (26.11.2026) */
  private spiele(name: string, einmal: boolean, halten = einmal, tempo = 1) { const c = this.clips.get(name), m = this.mixer; if (!c || !m) return; if (this.name === name && !einmal) { if (this.aktion) this.aktion.timeScale = tempo; return; }
    const neu = m.clipAction(c); neu.reset(); neu.setLoop(einmal ? THREE.LoopOnce : THREE.LoopRepeat, Infinity); neu.clampWhenFinished = halten; neu.timeScale = tempo;
    if (this.aktion && this.aktion !== neu) neu.crossFadeFrom(this.aktion, 0.12, false); neu.play(); this.aktion = neu; this.name = name; }
  /** weiterrechnen; der Blick dreht weich zur Laufrichtung (Modell schaut nach +z, also Süden) */
  /* ───────── Geladene Waffe „(s)“ (Phase 5b, #47): violettes Splitterleuchten an der sichtbaren Waffe, solange sie Ladungen hat ───────── */
  private aufladungFx: Aufladung | null = null; private aufladungTeil: THREE.Object3D | null = null;
  /** an: die sichtbare Waffe leuchtet; rest (0…1): unter 0,2 flackert es (gleich leer) */
  aufladen(an: boolean, rest = 1): void { const w = an ? [...this.teile].find(([n, o]) => /^waffe/.test(n) && o.visible) : undefined;
    if (!an || !w || !this.wurzel || (this.aufladungFx && this.aufladungTeil !== w[1])) { if (this.aufladungFx) { this.aufladungFx.entfernen(); this.aufladungFx = null; this.aufladungTeil = null; } if (!an || !w || !this.wurzel) return; }
    if (!this.aufladungFx) { this.aufladungFx = new Aufladung(w[1], this.wurzel, SPLITTER_VIOLETT, { zart: true }); this.aufladungTeil = w[1]; }
    this.aufladungFx.rest = rest; }
  schritt(dtMs: number, gieren: number): void {
    if (!this.wurzel) { this.ersatz.schritt(dtMs, gieren); return; } if (!this.an) return; const dt = dtMs / 1000;
    if (this.aufladungFx) this.aufladungFx.weiter(dt);
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
const GEGNER3D: Record<string, { datei: string; angriff: string; ersatz: string; mass?: number; /** Angriffsbewegung je Stil (Stilwechsel) */ stile?: string[] }> = { bandit_dolch: { datei: "bandit3d", angriff: "stich", ersatz: "gegner.bandit.v003" },
  /* Mooshocker: Modell in echter Größe (0,7 m hoch) im Maßstab der Helden (2,0 m statt 1,8 m); die Gegnerhöhe (Name, Lebensbalken) kommt aus MONSTER.hoehe */
  mooshocker: { datei: "mooshocker3d", angriff: "kopfstoss", ersatz: "gegner.bandit.v003", mass: 2.0 },
  waldgolem: { datei: "waldgolem3d", angriff: "faustschlag", ersatz: "gegner.bandit.v003" },
  /* Phase 4 (#24): Banditen-Varianten und Hauptmann Rotmantel – eigene Modelle der Figuren-Fabrik, mit echtzeit=1 exportiert (Tempo stimmt) */
  bandit_spaeher: { datei: "bandit3d_spaeher", angriff: "dolchwurf", ersatz: "gegner.bandit.v003" },
  bandit_schlaeger: { datei: "bandit3d_schlaeger", angriff: "angriff_axt", ersatz: "gegner.bandit.v003" },
  bandit_armbrust: { datei: "bandit3d_armbrust", angriff: "schiessen", ersatz: "gegner.bandit.v003" },
  rotmantel: { datei: "banditenboss3d", angriff: "hieb2h", ersatz: "gegner.bandit.v003" },
  kuh: { datei: "kuh3d", angriff: "angriff", ersatz: "gegner.bandit.v003", mass: 2.0 },
  zielscheibe: { datei: "zielscheibe3d", angriff: "angriff", ersatz: "gegner.bandit.v003", mass: 2.0 },
  /* Phase 6 (#26): der Rabenorden (Figuren #20). Federmutter: Angriffsbewegung je Stil (MonsterDef.stile: Stab, Bogen, Speer) */
  moorrabe: { datei: "moorrabe3d", angriff: "sturz", ersatz: "gegner.bandit.v003" },
  rabenpriester_novize: { datei: "rabenpriester_novize3d", angriff: "zauber_stab", ersatz: "gegner.bandit.v003" },
  rabenpriester_akoluth: { datei: "rabenpriester_akoluth3d", angriff: "bogen", ersatz: "gegner.bandit.v003" },
  rabenpriester_akoluth_speer: { datei: "rabenpriester_akoluth3d", angriff: "stich2h", ersatz: "gegner.bandit.v003" },
  federmutter: { datei: "rabenpriester_federmutter3d", angriff: "zauber_stab", stile: ["zauber_stab", "bogen", "stich2h"], ersatz: "gegner.bandit.v003" },
  oberster_rabenpriester: { datei: "oberster_rabenpriester3d", angriff: "doppelhieb", ersatz: "gegner.bandit.v003", mass: 2.6 },
  /* Phase 7 (#40): Graufurt, Ostufer, Turm (Figuren #37) */
  schlickkrebs: { datei: "schlickkrebs3d", angriff: "angriff", ersatz: "gegner.bandit.v003" },
  splitterreiher: { datei: "splitterreiher3d", angriff: "angriff", ersatz: "gegner.bandit.v003" },
  turmwaechter: { datei: "turmwaechter3d", angriff: "stich2h", ersatz: "gegner.bandit.v003" },
  gruenlicht: { datei: "gruenlicht3d", angriff: "angriff", ersatz: "gegner.bandit.v003" },
  /* Phase 8 (#58): Fahle Weiten und Grauwacht (Figuren #51, Modelle auf dem Figuren-Zweig) */
  heidewolf: { datei: "heidewolf3d", angriff: "angriff", ersatz: "gegner.bandit.v003" },
  rudelfuehrer: { datei: "rudelfuehrer3d", angriff: "angriff", ersatz: "gegner.bandit.v003" },
  wiedergaenger: { datei: "wiedergaenger3d", angriff: "stich2h", ersatz: "gegner.bandit.v003" },
  deserteur_schwert: { datei: "deserteur_schwert3d", angriff: "stich", ersatz: "gegner.bandit.v003" },
  deserteur_armbrust: { datei: "deserteur_armbrust3d", angriff: "schiessen", ersatz: "gegner.bandit.v003" },
  tjark: { datei: "tjark3d", angriff: "hieb2h", ersatz: "gegner.bandit.v003" },
  grabwaechter: { datei: "grabwaechter3d", angriff: "stich2h", ersatz: "gegner.bandit.v003" },
  grauer_hauptmann: { datei: "grauer_hauptmann3d", angriff: "stich2h", ersatz: "gegner.bandit.v003" },
  /* Phase 9 (#86): Glutsande und der versandete Tempel (Figuren #75; bis die Modelle da sind, der Ersatz) */
  sandkriecher: { datei: "sandkriecher3d", angriff: "angriff", ersatz: "gegner.bandit.v003" },
  glutskorpion: { datei: "glutskorpion3d", angriff: "angriff", ersatz: "gegner.bandit.v003" },
  karawanenraeuber_saebel: { datei: "karawanenraeuber_saebel3d", angriff: "stich", ersatz: "gegner.bandit.v003" },
  karawanenraeuber_bogen: { datei: "karawanenraeuber_bogen3d", angriff: "schiessen", ersatz: "gegner.bandit.v003" },
  glutgeist: { datei: "glutgeist3d", angriff: "angriff", ersatz: "gegner.bandit.v003" },
  sandmutter: { datei: "sandmutter3d", angriff: "angriff", ersatz: "gegner.bandit.v003", mass: 2.4 },
  /* Phase 10 (#92): Smaragdküste und Klippenhöhlen (Figuren #83, Modelle auf dem Figuren-Zweig) – Seevogel 1,4-mal so groß wie der Moorrabe, der Wrackkapitän durchscheinend */
  strandkrabbe: { datei: "strandkrabbe3d", angriff: "angriff", ersatz: "gegner.bandit.v003" },
  riesenkrabbe: { datei: "riesenkrabbe3d", angriff: "angriff", ersatz: "gegner.bandit.v003" },
  seevogel: { datei: "seevogel3d", angriff: "sturz", ersatz: "gegner.bandit.v003" },
  strandraeuber_saebel: { datei: "strandraeuber_saebel3d", angriff: "angriff", ersatz: "gegner.bandit.v003" },
  strandraeuber_armbrust: { datei: "strandraeuber_armbrust3d", angriff: "schiessen", ersatz: "gegner.bandit.v003" },
  mangrovenlurch: { datei: "mangrovenlurch3d", angriff: "angriff", ersatz: "gegner.bandit.v003" },
  wrackkapitaen: { datei: "wrackkapitaen3d", angriff: "angriff", ersatz: "gegner.bandit.v003" },
  /* Süden (#126/#127, Figuren #121): Gegner und Tiere vom Figuren-Zweig */
  feldhase: { datei: "feldhase3d", angriff: "angriff", ersatz: "gegner.bandit.v003" },
  kraehenschwarm: { datei: "kraehe3d", angriff: "sturz", ersatz: "gegner.bandit.v003" },
  wildbienen_schwarm: { datei: "wildbienen3d", angriff: "angriff", ersatz: "gegner.bandit.v003" },
  schilfkroete: { datei: "schilfkroete3d", angriff: "kopfstoss", ersatz: "gegner.bandit.v003" },
  fuchs: { datei: "fuchs3d", angriff: "angriff", ersatz: "gegner.bandit.v003" },
  wildschwein: { datei: "wildschwein3d", angriff: "angriff", ersatz: "gegner.bandit.v003" },
  wegelagerer_knueppel: { datei: "wegelagerer_knueppel3d", angriff: "angriff_axt", ersatz: "gegner.bandit.v003" },
  wegelagerer_schleuder: { datei: "wegelagerer_schleuder3d", angriff: "dolchwurf", ersatz: "gegner.bandit.v003" },
  steinschlucker: { datei: "steinschlucker3d", angriff: "faustschlag", ersatz: "gegner.bandit.v003" },
  graupelz: { datei: "graupelz3d", angriff: "angriff", ersatz: "gegner.bandit.v003" },
  schaf: { datei: "schaf3d", angriff: "treffer", ersatz: "gegner.bandit.v003" },
  ente: { datei: "ente3d", angriff: "laufen", ersatz: "gegner.bandit.v003" },
  /* #138: zehn Gegner aus den Modellen des Nutzers (Figuren 8c2ed9b25, Modelle in echter Größe → Heldenmaßstab 2,0); der Drakling folgt als Bodengegner */
  steppenwolf: { datei: "steppenwolf3d", angriff: "angriff", ersatz: "gegner.bandit.v003", mass: 2.0 },
  ockerhyaene: { datei: "ockerhyaene3d", angriff: "angriff", ersatz: "gegner.bandit.v003", mass: 2.0 },
  hochlandwidder: { datei: "hochlandwidder3d", angriff: "angriff", ersatz: "gegner.bandit.v003", mass: 2.0 },
  hochlandbaer: { datei: "hochlandbaer3d", angriff: "angriff", ersatz: "gegner.bandit.v003", mass: 2.0 },
  klippenadler: { datei: "klippenadler3d", angriff: "sturz", ersatz: "gegner.bandit.v003", mass: 2.0 },
  bergtroll: { datei: "bergtroll3d", angriff: "faustschlag", ersatz: "gegner.bandit.v003", mass: 2.0 },
  tundraelch: { datei: "tundraelch3d", angriff: "angriff", ersatz: "gegner.bandit.v003", mass: 2.0 },
  frostwolf: { datei: "frostwolf3d", angriff: "angriff", ersatz: "gegner.bandit.v003", mass: 2.0 },
  eisgolem: { datei: "eisgolem3d", angriff: "faustschlag", ersatz: "gegner.bandit.v003", mass: 2.0 } }; /* Zielscheibe (Phase 2): festes Modell in Metern, ohne Bewegungen (fabrik/waldland_dinge.py) */ /* Kuh in echter Größe (Modell in Metern), wie der Mooshocker */
export function gegnerFigur3D(szene: THREE.Scene, typ: string, ersatz: string, hoehe: number): FigurArt {
  const G = GEGNER3D[typ]; return G && held3dAn() ? new Held3D(szene, hoehe, null, null, G) : new FigurLeinwand(szene, ersatz, hoehe, null); }
