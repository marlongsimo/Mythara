/*
 * Riftmere – Schiffslinien im Browser (Ausgabe 2; Regeln: shared/schiffe.ts, Server: server/src/schiffe.ts).
 * Je Hafen ein Kapitän (npc.kapitaen) und ein Segelschiff am Liegeplatz (kueste_segelschiff, sonst ein einfacher Rumpf).
 * Ansprechen: der Kapitän nennt die bekannten Häfen mit Preis; die Wahl schickt { t: "schiff", tat: "fahren" } – bei ok kurze Blende und Ankunft am Zielsteg
 * (wie ein Teleport, Entscheidung des Nutzers 27.11.: keine Fahrt an Deck). Das Schiff ist Kulisse am Liegeplatz.
 */
import * as THREE from "three";
import { HAEFEN, type Hafen } from "../../../shared/schiffe";
import { lokalesGespraech } from "../dialog";
import { schiffFragen, chatSystem } from "../welt";
import { Npc3D } from "./npc3d";
import { schildAn } from "./mitspieler";
import { gltfLader } from "./gltf";
import { type Welt3D, figurWeit } from "./motor";

const SCHIFF_GLB = "img/objekte3d/kueste/segelschiff.glb";
interface Umgebung { motor: Welt3D; ort: { x: number; y: number }; springen(x: number, y: number): void }
interface Figur { h: Hafen; npc: Npc3D; nm: HTMLElement; schiff: THREE.Object3D }
const vorname = (h: Hafen) => h.kapitaen.name.replace(/^(Fähr)?[Kk]apitän(in)?\s+/, "").split(" ")[0];

/** Bug-Richtung (Kompass, Grad: 0 = Norden = -y der Welt, 90 = Osten) als Drehung um y – das Modell (glTF) schaut mit dem Bug nach +z */
const kurs = (grad: number) => { const r = grad * Math.PI / 180; return Math.atan2(Math.sin(r), -Math.cos(r)); };
/** Ein Segelschiff (Modell von Figuren; bis es geladen ist oder fehlt: Rumpf, Mast, Segel) – Wasserlinie bei y = 0 */
function segelschiff(): THREE.Group { const g = new THREE.Group(), holz = new THREE.MeshStandardMaterial({ color: 0x6b4a2b, roughness: 0.85 });
  const rumpf = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.6, 11), holz); rumpf.position.y = 0.4; const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 10, 8), holz); mast.position.y = 6;
  const segel = new THREE.Mesh(new THREE.PlaneGeometry(4, 4.5), new THREE.MeshStandardMaterial({ color: 0xe8dfc8, side: THREE.DoubleSide })); segel.position.set(0, 6.5, 0.2);
  const ersatz = new THREE.Group(); ersatz.add(rumpf, mast, segel); ersatz.traverse((o) => { o.castShadow = true; }); g.add(ersatz);
  gltfLader().loadAsync("../" + SCHIFF_GLB).then((m) => { const s = m.scene.clone(true); s.traverse((o) => { const x = o as THREE.Mesh; if (x.isMesh) { x.castShadow = true; x.receiveShadow = true; } });
    g.add(s); ersatz.visible = false; }).catch(() => { /* Modell noch nicht da: Ersatz bleibt */ });
  return g; }

export class SchiffWelt {
  private alle: Figur[] = []; private wartet: Figur | null = null;
  constructor(private u: Umgebung) {
    for (const h of HAEFEN) { const npc = new Npc3D("npc.kapitaen"); npc.blick(h.kapitaen.blick[0], h.kapitaen.blick[1]); u.motor.szene.add(npc.gruppe);
      const nm = document.createElement("div"); nm.className = "ez-name3d quest haendler"; nm.innerHTML = `${h.kapitaen.name}<small>Überfahrten</small>`; document.body.appendChild(nm);
      const schiff = segelschiff(); schiff.rotation.y = kurs(h.schiff.dreh); u.motor.szene.add(schiff); this.alle.push({ h, npc, nm, schiff }); }
    addEventListener("ez-schiff", (e) => this.antwort((e as CustomEvent).detail)); }
  private reden(f: Figur) { this.wartet = f; schiffFragen("ziele"); }
  private antwort(m: { ok?: boolean; text?: string; tat?: string; von?: string; ziele?: { id: string; name: string; preis: number }[]; neu?: boolean; nach?: string; name?: string; x?: number; y?: number }) {
    if (!m.ok) { chatSystem(m.text || "Das Schiff legt nicht ab."); return; }
    const f = this.alle.find((x) => x.h.id === m.von) || this.wartet; if (!f) return; const k = f.h.kapitaen.name;
    if (m.tat === "ziele") { const Z = m.ziele || [];
      const gruss = m.neu ? `Willkommen in ${f.h.name}! Merk dir den Hafen – von jedem anderen Kapitän kommst du jetzt hierher.` : `Wohin soll's gehen?`;
      const zeilen = [{ wer: k, text: gruss }, ...(Z.length ? [] : [{ wer: k, text: "Andere Häfen kennst du noch nicht. Reis erst einmal hin – Kielmund, Möwenbucht, Netzbucht und Grauwacht haben Kapitäne." }])];
      lokalesGespraech(k, zeilen, [...Z.map((z) => ({ id: z.id, text: `Nach ${z.name} (${z.preis} Splitter)` })), { id: "nichts", text: "Nichts, danke." }],
        (id) => { if (id === "nichts") return [{ wer: k, text: "Gute Winde!" }]; schiffFragen("fahren", id); return "zu"; });
      return; }
    if (m.tat === "fahren" && typeof m.x === "number" && typeof m.y === "number") { chatSystem(`Überfahrt mit ${k} – angelegt in ${m.name || "drüben"}.`); this.u.springen(m.x, m.y); } }
  /** Liegt an diesem Bodenpunkt ein Kapitän? */
  stelle(x: number, y: number): { x: number; y: number; text: string; tat: () => void; da: () => boolean; mehr: { text: string; sym: string; tat: () => void }[] } | null {
    let best: Figur | null = null, bd = 1.3; for (const f of this.alle) { const d = Math.hypot(f.h.kapitaen.x - x, f.h.kapitaen.y - y); if (d < bd) { bd = d; best = f; } } if (!best) return null; const f = best, K = f.h.kapitaen;
    return { x: K.x + K.blick[0] * 1.2, y: K.y + K.blick[1] * 1.2, text: `Mit ${vorname(f.h)} sprechen`, tat: () => this.reden(f), da: () => Math.hypot(K.x - this.u.ort.x, K.y - this.u.ort.y) <= 2.6,
      mehr: [{ text: "Überfahrt", sym: "⛵", tat: () => this.reden(f) }] }; }
  /** Liegeplatz eines Schiffs (Wasserhöhe) */
  private liegt(f: Figur) { const M = this.u.motor, s = f.h.schiff; f.schiff.position.set(s.x, M.wasserHoehe(s.x, s.y), s.y); f.schiff.rotation.y = kurs(s.dreh); }
  schritt(dt: number): void { const M = this.u.motor, o = this.u.ort;
    for (const f of this.alle) { const K = f.h.kapitaen, sichtbar = Math.hypot(K.x - o.x, K.y - o.y) < figurWeit(); f.npc.gruppe.visible = sichtbar;
      if (sichtbar) { f.npc.gruppe.position.set(K.x, M.hoehe(K.x, K.y), K.y); f.npc.schritt(dt); }
      f.nm.hidden = !sichtbar || !schildAn(f.nm, M, K.x, M.hoehe(K.x, K.y) + 2.35, K.y);
      f.schiff.visible = Math.hypot(f.h.schiff.x - o.x, f.h.schiff.y - o.y) < figurWeit() * 2; if (f.schiff.visible) this.liegt(f); } }
  /** Kapitäne auf der Karte antippen (die ganze Figur zählt) */
  punkte(): { x: number; y: number }[] { return this.alle.map((f) => ({ x: f.h.kapitaen.x, y: f.h.kapitaen.y })); }
  ortVon(name: string): { x: number; y: number } | null { const f = this.alle.find((x) => x.h.kapitaen.name === name); return f ? { x: f.h.kapitaen.x, y: f.h.kapitaen.y } : null; }
  get liste(): { id: string; name: string; x: number; y: number }[] { return this.alle.map((f) => ({ id: f.h.id, name: f.h.kapitaen.name, x: f.h.kapitaen.x, y: f.h.kapitaen.y })); }
}
