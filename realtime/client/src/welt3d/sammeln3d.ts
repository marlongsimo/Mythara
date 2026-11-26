/*
 * Mythara – Sammelberufe in der 3D-Welt: Holzfäller-Bäume (holz3d.ts) und Erzadern (berg3d.ts). Gemeinsamer Ablauf, die Unterschiede stehen in der Einstellung.
 *   · Modelle der Figuren-Fabrik (voll / leer bzw. Stumpf), Wind und pulsierende blaue Adern im Shader (wie echt3d/darsteller.ts).
 *   · Antippen: hingehen und sammeln. Der Held schlägt mit dem Werkzeug aus dem Rucksack; die angelegte Waffe ist so lange weg.
 *   · Aktiver Moment (Kernschlag / Riss): die Adern glühen hell – das Ziel schnell antippen.
 *   · Leer (gefällt / erschöpft) ist ein Ziel für alle, bis es nachwächst. Die Felder der Ziele sperrt das Gehraster (werkzeug/welt/lichtungen.mjs).
 */
import * as THREE from "three";
import { gltfLader } from "./gltf";
import { GEGENSTAENDE } from "../../../shared/gegenstaende";
import { chatSystem } from "../welt";
import { berufDrop } from "../skills";
import { gegenstandUntersuchen } from "../rahmen";
import type { Welt3D } from "./motor";

export interface SammelZiel3D { id: string; art: string; x: number; y: number }
export interface SammelDef3D { name: string; level: number; xp: number; ertrag: string; modell: string; /** leer = kein Leer-Modell (verloschen: nichts zu sehen) */ leer: string; /** so hoch über dem Boden (Felder, Seelenlicht) */ schweben?: number; /** Größe im Spiel: Höhe (Baum) bzw. längste Seite (Ader) */ mass: number; /** Tönung (Waldstein) */ farbe?: number; weiblich: boolean }
export interface SammelEinstellung {
  beruf: string; berufName: string; /** Ereignisse aus welt.ts */ ereignis: string; liste: string;
  ziele: SammelZiel3D[]; def: (art: string) => SammelDef3D; bitten: (tat: string, id?: string) => void;
  /** Nachrichtennamen des Servers */ tatErtrag: string; tatMoment: string; grundLeer: string;
  werkzeugUrl: (g: string) => string; werkzeugStandard: string; /** Clip des Werkzeugschlags ("" = Einhand-Hieb) */ clip: string;
  /** Größe als Höhe (Bäume) oder längste Seite (Adern) */ massArt: "hoehe" | "laenge"; /** Krone durchsichtig, wenn der Held darunter steht */ durchsicht: boolean; spanFarbe: number;
  /** ohne Modell: selbst gebautes Bild – „wellen“ (Kreise auf dem Wasser, Fischen) oder „erde“ (frisches Erdhäufchen, Würmer) */ prozedural?: "wellen" | "erde"; /** leere (ruhende) Ziele gar nicht antippbar (Fischen: die Fische sind weg, das Wasser ist nur Wasser) */ leerUnsichtbar?: boolean; /** Angeln: Rute bleibt in der Hand (held3d.angeln), Auswerfen beim Start, Einholen beim Fang – nur mit diesem Werkzeug */ angelnMit?: string;
  texte: { tun: (d: SammelDef3D) => string; start: (d: SammelDef3D, art: (f: "nom" | "akk" | "ein") => string) => string; moment: string; momentKnopf: string; leerKnopf: string;
    leer: (d: SammelDef3D, art: (f: "nom" | "akk" | "ein") => string) => string; leerAnsehen: (d: SammelDef3D, art: (f: "nom" | "akk" | "ein") => string) => string; einStueck: string; je: string };
}
interface Umgebung { motor: Welt3D; ort: { x: number; y: number }; figur: unknown }
interface Werkzeugfigur { beilHieb(url: string, clip?: string): number; beilWeg(): void; blick(x: number, z: number): void; angeln?(url: string, phase: "auswerfen" | "warten" | "einholen"): boolean }
interface Bild { z: SammelZiel3D; gruppe: THREE.Group; voll: THREE.Object3D | null; leer: THREE.Object3D | null; laedt: boolean; mats?: THREE.Material[]; deck?: number; /** Wellenkreise (prozedural) */ ringe?: THREE.Mesh[];
  u: { uZeit: { value: number }; uPhase: { value: number }; uKern: { value: number }; uHoehe: { value: number }; uWind: { value: number }; /** Krone durchsichtig: Deckkraft oberhalb des Stamms (1 = fest) */ uDurch: { value: number } } }

const vorlagen = new Map<string, Promise<{ szene: THREE.Object3D; hoehe: number; laenge: number }>>();
function vorlage(url: string) { let p = vorlagen.get(url); if (!p) { p = gltfLader().loadAsync("../" + url).then((g) => { const box = new THREE.Box3().setFromObject(g.scene), s = box.getSize(new THREE.Vector3());
  return { szene: g.scene, hoehe: Math.max(0.01, s.y), laenge: Math.max(0.01, s.x, s.y, s.z) }; }); vorlagen.set(url, p); } return p; }
/** Artikel: die/der (Nominativ), die/den (Akkusativ), eine/ein */
const artikel = (weiblich: boolean) => (f: "nom" | "akk" | "ein") => (weiblich ? (f === "ein" ? "eine" : "die") : f === "nom" ? "der" : f === "akk" ? "den" : "ein");
const zufall = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return ((h >>> 0) % 10000) / 10000; };
/** Wind und pulsierende Adern im Shader (wie echt3d/darsteller.ts → BaumBild); uKern: aktiver Moment – die Adern glühen hell */
function shaderAn(o: THREE.Object3D, u: Bild["u"], mats?: THREE.Material[]) {
  o.traverse((x) => { const m = x as THREE.Mesh; if (!m.isMesh) return; m.castShadow = true; m.receiveShadow = false; m.frustumCulled = false; const mat = (m.material as THREE.MeshStandardMaterial).clone(); m.material = mat; mats?.push(mat);
    m.geometry.computeBoundingBox(); const bb = m.geometry.boundingBox!, kroneH = { value: Math.max(1e-3, bb.max.y) }; /* Höhe im Modell selbst (das Modell wird skaliert) */
    mat.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, u, { uModellH: kroneH });
      sh.vertexShader = "uniform float uZeit, uPhase, uWind, uHoehe, uModellH;\nvarying float vHb;\n" + sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
        vHb = clamp(transformed.y / uModellH, 0.0, 1.0);
        { float hb = clamp(transformed.y / uHoehe, 0.0, 1.0), b = hb * hb * uWind; transformed.x += sin(uZeit * 1.6 + uPhase + transformed.y * 0.35) * b; transformed.z += cos(uZeit * 1.1 + uPhase * 1.3) * b * 0.6; }`);
      sh.fragmentShader = "uniform float uZeit, uPhase, uKern, uDurch;\nvarying float vHb;\nvec3 holzHsv(vec3 c){ vec4 K=vec4(0.,-1./3.,2./3.,-1.); vec4 p=mix(vec4(c.bg,K.wz),vec4(c.gb,K.xy),step(c.b,c.g)); vec4 q=mix(vec4(p.xyw,c.r),vec4(c.r,p.yzx),step(p.x,c.r)); float d=q.x-min(q.w,q.y); return vec3(abs(q.z+(q.w-q.y)/(6.*d+1e-10)),d/(q.x+1e-10),q.x); }\n"
        + sh.fragmentShader.replace("#include <color_fragment>", `#include <color_fragment>
        diffuseColor.a *= mix(1.0, uDurch, smoothstep(0.16, 0.24, vHb)); /* nur die Krone wird durchsichtig, der Stamm bleibt fest (26.11.2026) */`).replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
        { vec3 hsv = holzHsv(diffuseColor.rgb); float b = clamp((hsv.y - 0.45) / 0.2, 0., 1.) * clamp((hsv.z - 0.3) / 0.25, 0., 1.) * clamp(1. - abs(hsv.x * 360. - 210.) / 34., 0., 1.);
          totalEmissiveRadiance += diffuseColor.rgb * b * ((0.35 + 1.1 * (0.5 + 0.5 * sin(uZeit * 2.2 + uPhase))) + uKern * 3.5); }`); };
    mat.customProgramCacheKey = () => "sammelziel"; }); }

export class SammelWelt {
  private alle = new Map<string, Bild>(); private weg = new Set<string>(); private zeit = 0;
  /** gerade am Sammeln (Ziel-id), Werkzeug (Modell), aktiver Moment bis (performance.now) */
  aktiv: string | null = null; private werkzeug = ""; private angelUrl = ""; private moment: { id: string; bis: number } | null = null;
  constructor(private u: Umgebung, private E: SammelEinstellung) {
    for (const z of E.ziele) { const g = new THREE.Group(); g.visible = false; this.u.motor.szene.add(g);
      this.alle.set(z.id, { z, gruppe: g, voll: null, leer: null, laedt: false, u: { uZeit: { value: 0 }, uPhase: { value: zufall(z.id) * 6.28 }, uKern: { value: 0 }, uHoehe: { value: 6 }, uWind: { value: E.massArt === "hoehe" ? 0.1 : 0 }, uDurch: { value: 1 } } }); }
    addEventListener(E.liste, (e) => { this.weg = new Set(((e as CustomEvent).detail as [string, number][]).map(([id]) => id)); for (const a of this.alle.values()) this.zustand(a); });
    addEventListener(E.ereignis, (e) => this.nachricht((e as CustomEvent).detail)); }
  private get figur(): Werkzeugfigur | null { const f = this.u.figur as Partial<Werkzeugfigur> | null; return f && typeof f.beilHieb === "function" ? (f as Werkzeugfigur) : null; }
  private zustand(a: Bild) { const leer = this.weg.has(a.z.id); if (a.voll) a.voll.visible = !leer; if (a.leer) a.leer.visible = leer; }
  /** Selbst gebautes Bild: Wellenkreise (Fangstelle) oder Erdhäufchen (Wurmacker) – das Leere ist nichts */
  private bauen(a: Bild): void { const g = new THREE.Group(), leer = new THREE.Group();
    if (this.E.prozedural === "wellen") { a.ringe = [];
      for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.5, 40), new THREE.MeshBasicMaterial({ color: 0xeaf6ff, transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide }));
        m.rotation.x = -Math.PI / 2; m.position.y = 0.04 + i * 0.002; m.renderOrder = 3; g.add(m); a.ringe.push(m); }
      const glanz = new THREE.Mesh(new THREE.CircleGeometry(0.28, 24), new THREE.MeshBasicMaterial({ color: 0xbfe3ff, transparent: true, opacity: 0.35, depthWrite: false })); glanz.rotation.x = -Math.PI / 2; glanz.position.y = 0.03; g.add(glanz); }
    else { const erde = new THREE.MeshStandardMaterial({ color: 0x5a3d24, roughness: 1 });
      for (let i = 0; i < 5; i++) { const r = 0.16 + zufall(a.z.id + i) * 0.12, m = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 6), erde); m.scale.y = 0.45; m.position.set((zufall(a.z.id + "x" + i) - 0.5) * 0.6, 0.02, (zufall(a.z.id + "y" + i) - 0.5) * 0.6); m.castShadow = true; g.add(m); }
      const wurm = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.025, 6, 12, Math.PI * 1.3), new THREE.MeshStandardMaterial({ color: 0xc98585 })); wurm.position.set(0.1, 0.1, 0.05); wurm.rotation.x = -1.1; g.add(wurm); }
    a.gruppe.add(g, leer); a.voll = g; a.leer = leer; this.zustand(a); }
  private async laden(a: Bild) { a.laedt = true; if (this.E.prozedural) { this.bauen(a); return; } const D = this.E.def(a.z.art);
    try { const [v, s] = await Promise.all([vorlage(D.modell), D.leer ? vorlage(D.leer) : Promise.resolve(null)]), f = D.mass / (this.E.massArt === "hoehe" ? v.hoehe : v.laenge), dreh = zufall(a.z.id + "d") * Math.PI * 2;
      const voll = v.szene.clone(true), leer = s ? s.szene.clone(true) : new THREE.Group() /* ohne Leer-Modell (Seelenlicht): verloschen = nichts */;
      for (const o of [voll, leer]) { o.scale.setScalar(f * (0.92 + 0.16 * zufall(a.z.id + "s"))); o.rotation.y = dreh; if (D.schweben) o.position.y = D.schweben; a.gruppe.add(o); }
      a.u.uHoehe.value = v.hoehe; a.mats = []; shaderAn(voll, a.u, this.E.durchsicht ? a.mats : undefined); shaderAn(leer, a.u); if (D.farbe !== undefined) for (const o of [voll, leer]) o.traverse((x) => { const m = x as THREE.Mesh; if (m.isMesh) (m.material as THREE.MeshStandardMaterial).color.multiply(new THREE.Color(D.farbe)); }); a.voll = voll; a.leer = leer; this.zustand(a);
    } catch (e) { console.warn(`${this.E.berufName}: Modell fehlt`, a.z.art, e); } }
  private nachricht(m: { tat: string; id?: string; werkzeug?: string; text?: string; name?: string; n?: number; xp?: number; splitter?: number; aufstieg?: number; grund?: string; ms?: number; [k: string]: unknown }) {
    const E = this.E, a = m.id ? this.alle.get(m.id) : undefined, D = a ? E.def(a.z.art) : null, art = D ? artikel(D.weiblich) : artikel(true), f = this.figur;
    if (m.tat === "start") { this.aktiv = m.id || null; this.werkzeug = E.werkzeugStandard ? E.werkzeugUrl(m.werkzeug || E.werkzeugStandard) : ""; if (D) chatSystem(E.texte.start(D, art));
      this.angelUrl = E.angelnMit && m.werkzeug === E.angelnMit ? E.werkzeugUrl(E.angelnMit) : "";
      if (this.angelUrl && f && a) { f.blick(a.z.x - this.u.ort.x, a.z.y - this.u.ort.y); if (!f.angeln || !f.angeln(this.angelUrl, "auswerfen")) this.angelUrl = ""; } }
    else if (m.tat === "hieb" && this.angelUrl) { /* angeln: die Rute bleibt draußen, kein Schlag */ }
    else if (m.tat === "hieb" && a && f) { f.blick(a.z.x - this.u.ort.x, a.z.y - this.u.ort.y); if (this.werkzeug) f.beilHieb(this.werkzeug, E.clip); this.spaene(a); } /* ohne Werkzeug (Pflücken): nur hinschauen */
    else if (m.tat === E.tatErtrag) { const mom = Boolean(m[E.tatMoment]); if (this.angelUrl && f && f.angeln) f.angeln(this.angelUrl, "einholen");
      chatSystem(`Du bekommst ${(m.n || 1) > 1 ? m.n + " × " : ""}${m.name || E.texte.einStueck}${mom ? ` – ${E.texte.momentKnopf}` : "."}${m.splitter ? ` Dazu ${m.splitter} Splitter.` : ""}`);
      berufDrop(E.beruf, m.xp || 0); if (m.aufstieg) chatSystem(`Glückwunsch! ${E.berufName} ist jetzt Level ${m.aufstieg}.`); /* Banner oben: skills.ts stufenPruefen */ }
    else if (m.tat === E.tatMoment && a) { this.moment = { id: a.z.id, bis: performance.now() + (m.ms || 1500) }; this.hinweis(E.texte.moment, m.ms || 1500); }
    else if (m.tat === "stop") { if (this.aktiv === m.id) this.aktiv = null; this.moment = null; this.angelUrl = ""; if (f) f.beilWeg();
      if (m.grund === "voll") chatSystem("Dein Rucksack ist voll."); else if (m.grund === "koeder") chatSystem("Deine Würmer sind alle. Neue gräbst du auf dem Acker im Osthof."); else if (m.grund === E.grundLeer && D) chatSystem(E.texte.leer(D, art)); }
    else if (m.tat === "nein") { chatSystem(m.text || "Das geht hier nicht."); if (this.aktiv === m.id) this.aktiv = null; } }
  private hinweis(text: string, ms: number) { const el = document.getElementById("ez-dorf-hilfe"); if (!el) return; el.textContent = text; el.style.display = ""; setTimeout(() => { if (el.textContent === text) { el.textContent = ""; el.style.display = "none"; } }, ms); }
  /** Späne bzw. Steinsplitter beim Schlag */
  private spaene(a: Bild) { const M = this.u.motor, y0 = M.hoehe(a.z.x, a.z.y) + (this.E.massArt === "hoehe" ? 1.0 : 0.5), mat = new THREE.MeshBasicMaterial({ color: this.E.spanFarbe }), teile: { m: THREE.Mesh; v: THREE.Vector3 }[] = [];
    for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.08), mat); m.position.set(a.z.x + (Math.random() - 0.5) * 0.3, y0 + Math.random() * 0.3, a.z.y + (Math.random() - 0.5) * 0.3); M.szene.add(m); teile.push({ m, v: new THREE.Vector3((Math.random() - 0.5) * 3, 2 + Math.random() * 2, (Math.random() - 0.5) * 3) }); }
    let t = 0; const los = () => { t += 0.03; for (const p of teile) { p.v.y -= 9.8 * 0.03; p.m.position.addScaledVector(p.v, 0.03); p.m.rotation.x += 0.4; } if (t < 0.6) setTimeout(los, 30); else { for (const p of teile) { M.szene.remove(p.m); p.m.geometry.dispose(); } mat.dispose(); } }; setTimeout(los, 260); }
  /** Liegt an diesem Bodenpunkt ein Ziel? Dann „… fällen / abbauen“ (hingehen, sammeln) bzw. im aktiven Moment dessen Knopf */
  stelle(x: number, y: number): { x: number; y: number; text: string; tat: () => void; da: () => boolean; mehr: { text: string; sym: string; tat: () => void }[] } | null {
    let best: Bild | null = null, bd = 1.5; for (const a of this.alle.values()) { if (this.E.leerUnsichtbar && this.weg.has(a.z.id)) continue; const d = Math.hypot(a.z.x - x, a.z.y - y); if (d < bd) { bd = d; best = a; } } if (!best) return null;
    const E = this.E, a = best, D = E.def(a.z.art), art = artikel(D.weiblich), o = this.u.ort, dx = o.x - a.z.x, dy = o.y - a.z.y, l = Math.hypot(dx, dy) || 1; let sx = a.z.x + (dx / l) * 1.4, sy = a.z.y + (dy / l) * 1.4;
    if (E.prozedural === "wellen") { /* Fangstelle im Wasser: das nächste begehbare Ufer-Feld (bei schmalen Gräben läge der Punkt sonst noch im Wasser) */ let bu = 1e9;
      for (let ix = -2; ix <= 2; ix++) for (let iy = -2; iy <= 2; iy++) { const px = Math.floor(a.z.x) + ix + 0.5, py = Math.floor(a.z.y) + iy + 0.5; if (Math.hypot(px - a.z.x, py - a.z.y) > 2.05 || !this.u.motor.frei(px, py)) continue;
        const d = Math.hypot(px - o.x, py - o.y); if (d < bu) { bu = d; sx = px; sy = py; } } }
    const mom = this.moment && this.moment.id === a.z.id && performance.now() < this.moment.bis, leer = this.weg.has(a.z.id);
    return { x: sx, y: sy, text: mom ? E.texte.momentKnopf : leer ? E.texte.leerKnopf : E.texte.tun(D), da: () => Math.hypot(a.z.x - this.u.ort.x, a.z.y - this.u.ort.y) <= 2.0,
      tat: () => { if (mom) { this.moment = null; E.bitten(E.tatMoment); return; } if (leer) { chatSystem(E.texte.leerAnsehen(D, art)); return; } if (this.aktiv === a.z.id) return; E.bitten("start", a.z.id); },
      mehr: [{ text: "Untersuchen", sym: "🔍", tat: () => { chatSystem(D.xp ? `${D.name}: ${E.berufName} ${D.level}, ${D.xp} XP ${E.texte.je}.` : `${D.name}: kann man pflücken.`); gegenstandUntersuchen(D.ertrag); } }] }; }
  /** Wo die Ziele stehen (Antippen am Bildschirm: das ganze Ziel zählt) */
  punkte(): { x: number; y: number; h: number }[] { return [...this.alle.values()].filter((a) => Math.hypot(a.z.x - this.u.ort.x, a.z.y - this.u.ort.y) < 40 && !(this.E.leerUnsichtbar && this.weg.has(a.z.id)))
    .map((a) => { const D = this.E.def(a.z.art); return { x: a.z.x, y: a.z.y, h: this.E.massArt === "hoehe" ? (this.weg.has(a.z.id) ? 1 : D.mass * 0.8) : D.mass * 0.6 }; }); }
  /** Wasserspiegel wie motor.ts gelaende: knapp über dem höchsten Punkt ringsum (die Wellenkreise liegen auf dem Wasser, nicht auf dem Grund) */
  private spiegel(x: number, y: number): number { const M = this.u.motor; let m = -9; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) m = Math.max(m, M.hoehe(x + dx * 0.5, y + dy * 0.5)); return m + 0.08; }
  schritt(dt: number): void { this.zeit += dt; const M = this.u.motor, o = this.u.ort, jetzt = performance.now();
    if (this.moment && jetzt > this.moment.bis) this.moment = null;
    for (const a of this.alle.values()) { const nah = Math.hypot(a.z.x - o.x, a.z.y - o.y) < 55; a.gruppe.visible = nah; if (!nah) continue;
      if (!a.laedt) void this.laden(a); a.gruppe.position.set(a.z.x, a.ringe ? this.spiegel(a.z.x, a.z.y) : M.hoehe(a.z.x, a.z.y), a.z.y); a.u.uZeit.value = this.zeit;
      a.u.uKern.value = this.moment && this.moment.id === a.z.id ? 0.6 + 0.4 * Math.sin(jetzt / 70) : 0;
      if (a.ringe) { const mom = a.u.uKern.value > 0, tempo = mom ? 1.6 : 0.55; a.ringe.forEach((m, i) => { const ph = (this.zeit * tempo + i / 3 + a.u.uPhase.value) % 1; m.scale.setScalar(0.35 + ph * 1.5);
        const mat = m.material as THREE.MeshBasicMaterial; mat.opacity = (mom ? 0.95 : 0.6) * (1 - ph); mat.color.setHex(mom ? 0xfff2b0 : 0xeaf6ff); }); }
      /* Held unter der Krone: der Baum wird zu 80 % durchsichtig, damit man sich und das Beil sieht */
      if (a.mats && a.mats.length) { const ziel = Math.hypot(a.z.x - o.x, a.z.y - o.y) < 3.4 ? 0.2 : 1; a.deck = (a.deck ?? 1) + (ziel - (a.deck ?? 1)) * Math.min(1, dt * 6);
        const durch = a.deck < 0.99; a.u.uDurch.value = durch ? a.deck : 1; for (const m of a.mats) { if (m.transparent !== durch) { m.transparent = durch; m.needsUpdate = true; } } } } }
  /** für Tests */
  get liste(): { id: string; art: string; x: number; y: number; geladen: boolean; leer: boolean; stumpf: boolean }[] {
    return [...this.alle.values()].map((a) => ({ id: a.z.id, art: a.z.art, x: a.z.x, y: a.z.y, geladen: Boolean(a.voll), leer: this.weg.has(a.z.id), stumpf: this.weg.has(a.z.id) })); }
  /** für Tests (alter Name) */
  get faellt(): string | null { return this.aktiv; }
}
export { GEGENSTAENDE };
