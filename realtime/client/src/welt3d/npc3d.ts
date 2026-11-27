/*
 * Mythara – Dorfbewohner der 3D-Welt als echte 3D-Modelle der Figuren-Fabrik (img/figuren-echt3d/, Bewegungen ruhe und gehen).
 *
 * Stehende Figuren: Wer in den Weltdaten steht (Chunk figuren[]) und hier ein Modell hat, steht als 3D-Modell da (die Wachen → stadtwache3d);
 *   alle anderen Figuren der Weltdaten werden nicht gezeigt (keine 2D-Figuren in der Welt).
 * Wandernde Figuren (WANDERER): gehören zu einem Haus, laufen darin zwischen zufälligen Stellen umher, bleiben immer wieder eine Weile stehen,
 *   treten ab und zu vor die Tür und gehen dann wieder hinein. Wege über die Wegsuche der Welt (Wände, Möbel).
 * Immer 3D (auch mit ?held3d=0): in der Welt gibt es keine 2D-Figuren mehr.
 */
import { RUHE_TEMPO } from "./held3d";
import { reiseStelle, type Reise } from "../../../shared/reisende";
import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { vorlage } from "./held3d";
import { GEHEN_TEMPO } from "../../../shared/feld";

/** Figur der Weltdaten → 3D-Modell */
export const NPC3D: Record<string, string> = { wache: "stadtwache3d" };

type Feld = { x: number; z: number };
/** Wer wo umherläuft: drinnen = Felder im Haus (x0..x1, z0..x1 einschließlich), draussen = Felder vor der Tür */
export const WANDERER: { chunk: string; datei: string; drinnen: [number, number, number, number]; draussen: [number, number, number, number] | null }[] = [
  /* Nia in ihrem Salon an der Nordostecke des Marktplatzes der Waldmark (waldmark_salon_01, Tür nach Süden bei 6458/6428) */
  { chunk: "201_200", datei: "npc.nia", drinnen: [6457, 6425, 6460, 6427], draussen: [6456, 6429, 6461, 6430] },
  /* der Bürgermeister im Erdgeschoss des Rathauses an der Westseite des Marktplatzes (waldmark_rathaus_01, Tür nach Süden bei 6438–6439/6427); bleibt drinnen */
  { chunk: "201_200", datei: "npc.buergermeister_waldmark", drinnen: [6435, 6421, 6442, 6426], draussen: null },
  /* vier Leute schlendern über den gepflasterten Marktplatz der Waldmark (um den Brunnen) */
  ...(["npc.marktfrau", "npc.alter_bauer", "npc.junger_knecht", "npc.fischer"] as const) /* die Kräuterfrau steht jetzt am Tränkestand (shared/laeden.ts) */.map((datei, i) => ({ chunk: i < 2 ? "201_200" : "201_201", datei, drinnen: [6442, 6428, 6455, 6437] as [number, number, number, number], draussen: null })),
];

const HOEHE = 2.0, TEMPO = GEHEN_TEMPO; /* Felder je Sekunde: Bewohner gehen wie Helden 1 Feld je Tick („Felder und Schräge“) */
/** ein zufälliges freies Feld im Rechteck (Möbel, Brunnen und Wände sind gesperrt) */
const zufallFeld = (r: [number, number, number, number], frei?: (x: number, z: number) => boolean): Feld => { let f: Feld = { x: 0, z: 0 };
  for (let i = 0; i < 30; i++) { f = { x: r[0] + Math.floor(Math.random() * (r[2] - r[0] + 1)) + 0.5, z: r[1] + Math.floor(Math.random() * (r[3] - r[1] + 1)) + 0.5 }; if (!frei || frei(Math.floor(f.x), Math.floor(f.z))) break; } return f; };

export interface Umgebung { szene: THREE.Scene; hoehe(x: number, z: number): number; gehbar(x: number, z: number): boolean; weg(ax: number, az: number, bx: number, bz: number, felder?: boolean): Feld[] }

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
    const a = m.clipAction(c); a.reset(); a.setLoop(THREE.LoopRepeat, Infinity); a.time = Math.random() * c.duration; /* nicht alle im Gleichschritt */ a.timeScale = n === "ruhe" ? RUHE_TEMPO : 1; /* Ruhe doppelt so lang wie bei den Helden */
    if (this.aktion) a.crossFadeFrom(this.aktion, 0.2, false); a.play(); this.aktion = a; this.name = n; }
  /** Blick in Richtung (dx, dz) – das Modell schaut nach +z */
  blick(dx: number, dz: number) { if (Math.hypot(dx, dz) > 1e-3) this.zielDreh = Math.atan2(dx, dz); }
  schritt(dt: number) { let d = this.zielDreh - this.dreh; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; this.dreh += d * Math.min(1, dt * 8);
    if (this.wurzel) this.wurzel.rotation.y = this.dreh; if (this.mixer) this.mixer.update(dt); }
}

/** Reisende auf der Südstraße (#126, shared/reisende.ts): die Stelle kommt aus der Uhr, die Figur geht nur, solange sie nah ist (motor.ts) */
export class ReisenderFigur {
  readonly npc: Npc3D; x = 0; z = 0;
  constructor(private u: Umgebung, readonly r: Reise) { this.npc = new Npc3D(r.datei); this.schritt(0); }
  schritt(dt: number) { const p = reiseStelle(this.r, Date.now() / 1000); this.x = p.x; this.z = p.y;
    this.npc.gruppe.position.set(p.x, this.u.hoehe(p.x, p.y), p.y); if (!p.steht) this.npc.blick(p.dx, p.dy); this.npc.spiele(p.steht ? "ruhe" : "gehen"); this.npc.schritt(dt); }
}

/** Ein Bewohner, der in seinem Haus umhergeht, stehen bleibt und ab und zu vor die Tür tritt */
export class Wanderer {
  /** welches Modell (Quests finden den Bürgermeister daran) */ get datei(): string { return this.w.datei; }
  readonly npc: Npc3D; x: number; z: number; private pfad: Feld[] = []; private warten = 1 + Math.random() * 3; private draussen = false;
  constructor(private u: Umgebung, private w: (typeof WANDERER)[number]) {
    const s = zufallFeld(w.drinnen, (x, z) => u.gehbar(x, z)); this.x = s.x; this.z = s.z; this.npc = new Npc3D(w.datei); this.npc.blick(0, 1); this.setzen(); }
  private setzen() { this.npc.gruppe.position.set(this.x, this.u.hoehe(this.x, this.z), this.z); }
  private neuesZiel() {
    /* wer draußen war, geht wieder hinein; drinnen meist eine andere Stelle im Haus, etwa jedes vierte Mal vor die Tür */
    const raus = Boolean(this.w.draussen) && !this.draussen && Math.random() < 0.2, z = zufallFeld(raus && this.w.draussen ? this.w.draussen : this.w.drinnen, (x, zz) => this.u.gehbar(x, zz));
    const p = this.u.weg(this.x, this.z, z.x, z.z, true); if (!p.length) { this.warten = 1.5; return; } this.pfad = p; this.draussen = raus; }
  schritt(dt: number) {
    if (!this.pfad.length) { this.npc.spiele("ruhe"); this.warten -= dt; if (this.warten <= 0) this.neuesZiel(); this.npc.schritt(dt); return; }
    const z = this.pfad[0], dx = z.x - this.x, dz = z.z - this.z, d = Math.max(Math.abs(dx), Math.abs(dz)), s = TEMPO * dt; /* von Feldmitte zu Feldmitte, schräg zählt wie gerade */
    if (d <= s) { this.x = z.x; this.z = z.z; this.pfad.shift(); if (!this.pfad.length) this.warten = this.draussen ? 2 + Math.random() * 4 : 2.5 + Math.random() * 7; }
    else { this.x += dx / d * s; this.z += dz / d * s; }
    this.npc.blick(dx, dz); this.npc.spiele("gehen"); this.setzen(); this.npc.schritt(dt); }
}

