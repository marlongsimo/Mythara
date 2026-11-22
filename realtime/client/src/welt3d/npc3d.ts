/*
 * Mythara – Dorfbewohner der 3D-Welt als echte 3D-Modelle der Figuren-Fabrik (img/figuren-echt3d/, Bewegungen ruhe und gehen).
 *
 * Stehende Figuren: Wer in den Weltdaten steht (Chunk figuren[]) und hier ein Modell hat, steht als 3D-Modell da (z. B. die Wachen → stadtwache3d);
 *   alle anderen bleiben Bilder. Bis das Modell geladen ist – oder wenn es nicht lädt – steht das bisherige Bild da.
 * Wandernde Figuren (WANDERER): gehören zu einem Haus, laufen darin zwischen zufälligen Stellen umher, bleiben immer wieder eine Weile stehen,
 *   treten ab und zu vor die Tür und gehen dann wieder hinein. Wege über die Wegsuche der Welt (Wände, Möbel).
 * Abschaltbar wie die 3D-Helden: ?held3d=0.
 */
import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { vorlage, held3dAn } from "./held3d";

/** Figur der Weltdaten → 3D-Modell */
export const NPC3D: Record<string, string> = { wache: "stadtwache3d" };

type Feld = { x: number; z: number };
/** Wer wo umherläuft: drinnen = Felder im Haus (x0..x1, z0..x1 einschließlich), draussen = Felder vor der Tür */
export const WANDERER: { chunk: string; datei: string; drinnen: [number, number, number, number]; draussen: [number, number, number, number] }[] = [
  /* Nia in ihrem Salon an der Nordostecke des Marktplatzes der Waldmark (waldmark_salon_01, Tür nach Süden bei 6458/6428) */
  { chunk: "201_200", datei: "npc.nia", drinnen: [6457, 6425, 6460, 6427], draussen: [6456, 6429, 6461, 6430] },
];

const HOEHE = 2.0, TEMPO = 1.25;
const zufallFeld = (r: [number, number, number, number]): Feld => ({ x: r[0] + Math.floor(Math.random() * (r[2] - r[0] + 1)) + 0.5, z: r[1] + Math.floor(Math.random() * (r[3] - r[1] + 1)) + 0.5 });

export interface Umgebung { szene: THREE.Scene; hoehe(x: number, z: number): number; weg(ax: number, az: number, bx: number, bz: number): Feld[] }

/** Ein Dorfbewohner als 3D-Modell: gruppe steht in der Welt; ersatz (das Bild) wird ausgeblendet, sobald das Modell da ist */
export class Npc3D {
  readonly gruppe = new THREE.Group(); private mixer: THREE.AnimationMixer | null = null; private clips = new Map<string, THREE.AnimationClip>();
  private aktion: THREE.AnimationAction | null = null; private name = ""; private wurzel: THREE.Object3D | null = null; dreh = 0; private zielDreh = 0;
  constructor(datei: string, private ersatz?: THREE.Object3D, hoehe = HOEHE) {
    this.gruppe.userData.npc3d = this;
    vorlage(datei).then((v) => { const w = SkeletonUtils.clone(v.szene); w.scale.setScalar(hoehe / 1.8);
      w.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.frustumCulled = false; m.castShadow = true; m.receiveShadow = true; } });
      this.wurzel = w; this.clips = v.clips; this.mixer = new THREE.AnimationMixer(w); this.gruppe.add(w); w.rotation.y = this.dreh;
      if (this.ersatz) this.ersatz.visible = false; this.spiele(this.soll || "ruhe"); }).catch((e) => console.warn("3D-Dorfbewohner:", e)); }
  private soll = "";
  get geladen(): boolean { return Boolean(this.wurzel); }
  spiele(n: string) { this.soll = n; const c = this.clips.get(n), m = this.mixer; if (!c || !m || this.name === n) return;
    const a = m.clipAction(c); a.reset(); a.setLoop(THREE.LoopRepeat, Infinity); a.time = Math.random() * c.duration; /* nicht alle im Gleichschritt */
    if (this.aktion) a.crossFadeFrom(this.aktion, 0.2, false); a.play(); this.aktion = a; this.name = n; }
  /** Blick in Richtung (dx, dz) – das Modell schaut nach +z */
  blick(dx: number, dz: number) { if (Math.hypot(dx, dz) > 1e-3) this.zielDreh = Math.atan2(dx, dz); }
  schritt(dt: number) { let d = this.zielDreh - this.dreh; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; this.dreh += d * Math.min(1, dt * 8);
    if (this.wurzel) this.wurzel.rotation.y = this.dreh; if (this.mixer) this.mixer.update(dt); }
}

/** Ein Bewohner, der in seinem Haus umhergeht, stehen bleibt und ab und zu vor die Tür tritt */
export class Wanderer {
  readonly npc: Npc3D; x: number; z: number; private pfad: Feld[] = []; private warten = 1 + Math.random() * 3; private draussen = false;
  constructor(private u: Umgebung, private w: (typeof WANDERER)[number]) {
    const s = zufallFeld(w.drinnen); this.x = s.x; this.z = s.z; this.npc = new Npc3D(w.datei); this.npc.blick(0, 1); this.setzen(); }
  private setzen() { this.npc.gruppe.position.set(this.x, this.u.hoehe(this.x, this.z), this.z); }
  private neuesZiel() {
    /* wer draußen war, geht wieder hinein; drinnen meist eine andere Stelle im Haus, etwa jedes vierte Mal vor die Tür */
    const raus = !this.draussen && Math.random() < 0.2, z = zufallFeld(raus ? this.w.draussen : this.w.drinnen);
    const p = this.u.weg(this.x, this.z, z.x, z.z); if (!p.length) { this.warten = 1.5; return; } this.pfad = p; this.draussen = raus; }
  schritt(dt: number) {
    if (!this.pfad.length) { this.npc.spiele("ruhe"); this.warten -= dt; if (this.warten <= 0) this.neuesZiel(); this.npc.schritt(dt); return; }
    const z = this.pfad[0], dx = z.x - this.x, dz = z.z - this.z, d = Math.hypot(dx, dz), s = TEMPO * dt;
    if (d <= s) { this.x = z.x; this.z = z.z; this.pfad.shift(); if (!this.pfad.length) this.warten = this.draussen ? 2 + Math.random() * 4 : 2.5 + Math.random() * 7; }
    else { this.x += dx / d * s; this.z += dz / d * s; }
    this.npc.blick(dx, dz); this.npc.spiele("gehen"); this.setzen(); this.npc.schritt(dt); }
}

export const npc3dAn = (): boolean => held3dAn();
