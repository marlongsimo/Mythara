/*
 * Mythara – Holzfällerei in der 3D-Welt (shared/holz.ts, Server: server/src/holz.ts).
 * Die Holzfäller-Bäume stehen auf eigenen Lichtungen (Modelle der Figuren-Fabrik, img/objekte3d/skilling/holzfaellerei/): Wind in der Krone,
 * blaue Adern pulsieren (wie die Bäume der Figuren, echt3d/darsteller.ts). Gefällt steht für alle der Stumpf, bis der Baum nachwächst.
 * Antippen: hingehen und fällen. Der Held schlägt mit dem Beil aus dem Rucksack (Einhand-Hieb, die angelegte Waffe ist so lange weg).
 * Kernschlag: die Adern glühen hell auf – den Baum schnell antippen. Die Felder der Stämme sperrt das Gehraster (werkzeug/welt/lichtungen.mjs).
 */
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { HOLZBAEUME, BAEUME, Holzbaum, BERUF } from "../../../shared/holz";
import { GEGENSTAENDE } from "../../../shared/gegenstaende";
import { holzBitten, chatSystem } from "../welt";
import { berufDrop } from "../skills";
import { gegenstandUntersuchen } from "../rahmen";
import type { Welt3D } from "./motor";

interface Umgebung { motor: Welt3D; ort: { x: number; y: number }; figur: unknown }
interface Beilfigur { beilHieb(url: string): number; beilWeg(): void; blick(x: number, z: number): void }
interface Baumbild { b: Holzbaum; gruppe: THREE.Group; baum: THREE.Object3D | null; stumpf: THREE.Object3D | null; laedt: boolean; /** Materialien der Krone (Durchsicht) und deren Deckkraft */ mats?: THREE.Material[]; deck?: number; u: { uZeit: { value: number }; uPhase: { value: number }; uKern: { value: number }; uHoehe: { value: number }; uWind: { value: number } } }
const BEIL_MODELL: Record<string, string> = { holzbeil_training: "training", holzbeil_einfach: "gewoehnlich", holzbeil_selten: "", holzbeil_episch: "episch", holzbeil_legendaer: "legendaer", holzbeil_mythisch: "mythisch" };
const beilUrl = (g: string) => `img/objekte3d/skilling/utensilien/holzbeil${BEIL_MODELL[g] ? "." + BEIL_MODELL[g] : ""}.glb`;
const vorlagen = new Map<string, Promise<{ szene: THREE.Object3D; hoehe: number }>>();
function vorlage(url: string) { let p = vorlagen.get(url); if (!p) { p = new GLTFLoader().loadAsync("../" + url).then((g) => { const box = new THREE.Box3().setFromObject(g.scene); return { szene: g.scene, hoehe: Math.max(0.01, box.max.y - box.min.y) }; }); vorlagen.set(url, p); } return p; }
const WEIBLICH = new Set(["eiche", "tanne", "eibe", "moorweide"]);
/** Artikel: die/der (Nominativ), die/den (Akkusativ), eine/ein */
const art = (a: string, fall: "nom" | "akk" | "ein") => (WEIBLICH.has(a) ? (fall === "ein" ? "eine" : "die") : fall === "nom" ? "der" : fall === "akk" ? "den" : "ein");
const zufall = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return ((h >>> 0) % 10000) / 10000; };
/** Wind und pulsierende Adern im Shader (wie echt3d/darsteller.ts → BaumBild); uKern: Kernschlag – die Adern glühen hell */
function shaderAn(o: THREE.Object3D, u: Baumbild["u"], mats?: THREE.Material[]) {
  o.traverse((x) => { const m = x as THREE.Mesh; if (!m.isMesh) return; m.castShadow = true; m.receiveShadow = false; m.frustumCulled = false; const mat = (m.material as THREE.MeshStandardMaterial).clone(); m.material = mat; mats?.push(mat);
    mat.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, u);
      sh.vertexShader = "uniform float uZeit, uPhase, uWind, uHoehe;\n" + sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
        { float hb = clamp(transformed.y / uHoehe, 0.0, 1.0), b = hb * hb * uWind; transformed.x += sin(uZeit * 1.6 + uPhase + transformed.y * 0.35) * b; transformed.z += cos(uZeit * 1.1 + uPhase * 1.3) * b * 0.6; }`);
      sh.fragmentShader = "uniform float uZeit, uPhase, uKern;\nvec3 holzHsv(vec3 c){ vec4 K=vec4(0.,-1./3.,2./3.,-1.); vec4 p=mix(vec4(c.bg,K.wz),vec4(c.gb,K.xy),step(c.b,c.g)); vec4 q=mix(vec4(p.xyw,c.r),vec4(c.r,p.yzx),step(p.x,c.r)); float d=q.x-min(q.w,q.y); return vec3(abs(q.z+(q.w-q.y)/(6.*d+1e-10)),d/(q.x+1e-10),q.x); }\n"
        + sh.fragmentShader.replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
        { vec3 hsv = holzHsv(diffuseColor.rgb); float b = clamp((hsv.y - 0.45) / 0.2, 0., 1.) * clamp((hsv.z - 0.3) / 0.25, 0., 1.) * clamp(1. - abs(hsv.x * 360. - 210.) / 34., 0., 1.);
          totalEmissiveRadiance += diffuseColor.rgb * b * ((0.35 + 1.1 * (0.5 + 0.5 * sin(uZeit * 2.2 + uPhase))) + uKern * 3.5); }`); };
    mat.customProgramCacheKey = () => "holzbaum"; }); }

export class HolzWelt {
  private alle = new Map<string, Baumbild>(); private gefallen = new Set<string>(); private zeit = 0;
  /** gerade am Fällen (Baum-id), Beil (Modell), Kernschlag bis (performance.now) */
  faellt: string | null = null; private beil = ""; private kern: { id: string; bis: number } | null = null;
  constructor(private u: Umgebung) {
    for (const b of HOLZBAEUME) { const g = new THREE.Group(); g.visible = false; this.u.motor.szene.add(g);
      this.alle.set(b.id, { b, gruppe: g, baum: null, stumpf: null, laedt: false, u: { uZeit: { value: 0 }, uPhase: { value: zufall(b.id) * 6.28 }, uKern: { value: 0 }, uHoehe: { value: 6 }, uWind: { value: 0.1 } } }); }
    addEventListener("ez-baeume", (e) => { this.gefallen = new Set(((e as CustomEvent).detail as [string, number][]).map(([id]) => id)); for (const a of this.alle.values()) this.zustand(a); });
    addEventListener("ez-holz", (e) => this.nachricht((e as CustomEvent).detail)); }
  private get figur(): Beilfigur | null { const f = this.u.figur as Partial<Beilfigur> | null; return f && typeof f.beilHieb === "function" ? (f as Beilfigur) : null; }
  private zustand(a: Baumbild) { const weg = this.gefallen.has(a.b.id); if (a.baum) a.baum.visible = !weg; if (a.stumpf) a.stumpf.visible = weg; }
  private async laden(a: Baumbild) { a.laedt = true; const D = BAEUME[a.b.art];
    try { const [v, s] = await Promise.all([vorlage(D.modell), vorlage(D.stumpf)]); const f = D.hoehe / v.hoehe, dreh = zufall(a.b.id + "d") * Math.PI * 2;
      const baum = v.szene.clone(true), stumpf = s.szene.clone(true); for (const o of [baum, stumpf]) { o.scale.setScalar(f * (0.92 + 0.16 * zufall(a.b.id + "s"))); o.rotation.y = dreh; a.gruppe.add(o); }
      a.u.uHoehe.value = v.hoehe; a.mats = []; shaderAn(baum, a.u, a.mats); shaderAn(stumpf, a.u); a.baum = baum; a.stumpf = stumpf; this.zustand(a);
    } catch (e) { console.warn("Holzfäller-Baum fehlt:", a.b.art, e); } }
  private nachricht(m: { tat: string; id?: string; beil?: string; text?: string; g?: string; name?: string; n?: number; xp?: number; splitter?: number; kern?: boolean; aufstieg?: number; grund?: string; ms?: number }) {
    const a = m.id ? this.alle.get(m.id) : undefined, D = a ? BAEUME[a.b.art] : null, f = this.figur;
    if (m.tat === "start") { this.faellt = m.id || null; this.beil = beilUrl(m.beil || "holzbeil_training"); if (D) chatSystem(`Du schwingst das Beil gegen ${art(a!.b.art, "akk")} ${D.name} …`); }
    else if (m.tat === "hieb" && a && f) { f.blick(a.b.x - this.u.ort.x, a.b.y - this.u.ort.y); f.beilHieb(this.beil); this.spaene(a); }
    else if (m.tat === "stamm") { chatSystem(`Du bekommst ${(m.n || 1) > 1 ? m.n + " × " : ""}${m.name || "einen Stamm"}${m.kern ? " – Kernschlag!" : "."}${m.splitter ? ` Dazu ${m.splitter} Splitter.` : ""}`);
      berufDrop(BERUF, m.xp || 0); if (m.aufstieg) { chatSystem(`Glückwunsch! Holzfällerei ist jetzt Level ${m.aufstieg}.`); this.hinweis(`Holzfällerei Level ${m.aufstieg}!`, 2600); } }
    else if (m.tat === "kern" && a) { this.kern = { id: a.b.id, bis: performance.now() + (m.ms || 1500) }; this.hinweis("Kernschlag! Tippe schnell den Baum an!", m.ms || 1500); }
    else if (m.tat === "stop") { if (this.faellt === m.id) this.faellt = null; this.kern = null; if (f) f.beilWeg();
      if (m.grund === "voll") chatSystem("Dein Rucksack ist voll."); else if (m.grund === "gefallen" && D) chatSystem(`${art(a!.b.art, "nom").replace(/^./, (c) => c.toUpperCase())} ${D.name} fällt. Hier wächst bald ${WEIBLICH.has(a!.b.art) ? "eine neue" : "ein neuer"} nach.`); }
    else if (m.tat === "nein") { chatSystem(m.text || "Das geht hier nicht."); if (this.faellt === m.id) this.faellt = null; } }
  private hinweis(text: string, ms: number) { const el = document.getElementById("ez-dorf-hilfe"); if (!el) return; el.textContent = text; el.style.display = ""; setTimeout(() => { if (el.textContent === text) { el.textContent = ""; el.style.display = "none"; } }, ms); }
  /** Späne beim Hieb: ein paar helle Splitter fliegen vom Stamm */
  private spaene(a: Baumbild) { const M = this.u.motor, y0 = M.hoehe(a.b.x, a.b.y) + 1.0, mat = new THREE.MeshBasicMaterial({ color: 0xd9b27a }), teile: { m: THREE.Mesh; v: THREE.Vector3 }[] = [];
    for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.1), mat); m.position.set(a.b.x + (Math.random() - 0.5) * 0.3, y0 + Math.random() * 0.3, a.b.y + (Math.random() - 0.5) * 0.3); M.szene.add(m); teile.push({ m, v: new THREE.Vector3((Math.random() - 0.5) * 3, 2 + Math.random() * 2, (Math.random() - 0.5) * 3) }); }
    let t = 0; const los = () => { t += 0.03; for (const p of teile) { p.v.y -= 9.8 * 0.03; p.m.position.addScaledVector(p.v, 0.03); p.m.rotation.x += 0.4; } if (t < 0.6) setTimeout(los, 30); else { for (const p of teile) { M.szene.remove(p.m); p.m.geometry.dispose(); } mat.dispose(); } }; setTimeout(los, 260); }
  /** Liegt an diesem Bodenpunkt ein Holzfäller-Baum? Dann „Fällen“ (hingehen, fällen) bzw. beim Kernschlag „Kernschlag!“ */
  stelle(x: number, y: number): { x: number; y: number; text: string; tat: () => void; da: () => boolean; mehr: { text: string; sym: string; tat: () => void }[] } | null {
    let best: Baumbild | null = null, bd = 1.5; for (const a of this.alle.values()) { const d = Math.hypot(a.b.x - x, a.b.y - y); if (d < bd) { bd = d; best = a; } } if (!best) return null;
    const a = best, D = BAEUME[a.b.art], o = this.u.ort, dx = o.x - a.b.x, dy = o.y - a.b.y, l = Math.hypot(dx, dy) || 1, sx = a.b.x + (dx / l) * 1.4, sy = a.b.y + (dy / l) * 1.4;
    const kern = this.kern && this.kern.id === a.b.id && performance.now() < this.kern.bis, stumpf = this.gefallen.has(a.b.id);
    return { x: sx, y: sy, text: kern ? "Kernschlag!" : stumpf ? "Stumpf ansehen" : `${D.name} fällen`, da: () => Math.hypot(a.b.x - this.u.ort.x, a.b.y - this.u.ort.y) <= 2.0,
      tat: () => { if (kern) { this.kern = null; holzBitten("kern"); return; } if (stumpf) { chatSystem(`Hier stand ${art(a.b.art, "ein")} ${D.name}. ${WEIBLICH.has(a.b.art) ? "Sie" : "Er"} wächst bald nach.`); return; } if (this.faellt === a.b.id) return; holzBitten("start", a.b.id); },
      mehr: [{ text: "Untersuchen", sym: "🔍", tat: () => { chatSystem(`${D.name}: Holzfällerei ${D.level}, ${D.xp} XP je Stamm.`); gegenstandUntersuchen(D.stamm); } }] }; }
  /** Wo die Bäume stehen (Antippen am Bildschirm: der ganze Baum zählt) */
  punkte(): { x: number; y: number; h: number }[] { return [...this.alle.values()].filter((a) => Math.hypot(a.b.x - this.u.ort.x, a.b.y - this.u.ort.y) < 40).map((a) => ({ x: a.b.x, y: a.b.y, h: this.gefallen.has(a.b.id) ? 1 : BAEUME[a.b.art].hoehe * 0.8 })); }
  schritt(dt: number): void { this.zeit += dt; const M = this.u.motor, o = this.u.ort, jetzt = performance.now();
    if (this.kern && jetzt > this.kern.bis) this.kern = null;
    for (const a of this.alle.values()) { const nah = Math.hypot(a.b.x - o.x, a.b.y - o.y) < 55; a.gruppe.visible = nah; if (!nah) continue;
      if (!a.laedt) void this.laden(a); a.gruppe.position.set(a.b.x, M.hoehe(a.b.x, a.b.y), a.b.y); a.u.uZeit.value = this.zeit;
      a.u.uKern.value = this.kern && this.kern.id === a.b.id ? 0.6 + 0.4 * Math.sin(jetzt / 70) : 0;
      /* Held unter der Krone: der Baum wird halb durchsichtig, damit man sich und das Beil sieht */
      if (a.mats && a.mats.length) { const ziel = Math.hypot(a.b.x - o.x, a.b.y - o.y) < 3.4 ? 0.38 : 1; a.deck = (a.deck ?? 1) + (ziel - (a.deck ?? 1)) * Math.min(1, dt * 6);
        const durch = a.deck < 0.99; for (const m of a.mats) { if (m.transparent !== durch) { m.transparent = durch; m.needsUpdate = true; } m.opacity = durch ? a.deck : 1; } } } }
  /** für Tests */
  get liste(): { id: string; art: string; x: number; y: number; geladen: boolean; stumpf: boolean }[] { return [...this.alle.values()].map((a) => ({ id: a.b.id, art: a.b.art, x: a.b.x, y: a.b.y, geladen: Boolean(a.baum), stumpf: this.gefallen.has(a.b.id) })); }
}
export { GEGENSTAENDE };
