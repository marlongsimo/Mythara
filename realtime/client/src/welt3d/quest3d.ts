/*
 * Mythara – Quest 01 „Die gesperrte Straße“ in der 3D-Welt (shared/quest01.ts): die Figuren (Jori, Fenna, Raban, Tilda, Othmar; Hagan ist der umhergehende
 * Bürgermeister im Rathaus) mit Namen und Questmarker, Jori läuft beim ersten Besuch auf den Spieler zu, Baumstämme an den drei Sperren,
 * die persönliche Sperre im Gehraster (für jeden Spieler nach seinem eigenen Stand) und das Antippen zum Reden.
 * Alles, was man sieht, richtet sich nach dem eigenen Stand – andere Spieler sehen ihre eigene Welt.
 */
import * as THREE from "three";
import { bildnisseVon } from "../dialog"; /* Gesprächsfenster */
import { kopfbild } from "./kopfbild";
import { eigenesBildnis, aktiverHeld } from "../held";
import { NPCS, QuestNpc, SPERREN, Stand, sperreOffen, rang, NpcId } from "../../../shared/quest01";
import { questStand, questGeladen, rede } from "../welt";
import { Npc3D } from "./npc3d";
import { schildAn } from "./mitspieler";
import type { Welt3D } from "./motor";

/** Was die Welt der Quest zur Verfügung stellt */
export interface QuestUmgebung { motor: Welt3D; ort: { x: number; y: number }; hier: string; gesperrt: boolean; sperrenNeu(): void }
interface Figur { n: QuestNpc; npc: Npc3D | null; x: number; y: number; nm: HTMLElement; mk: HTMLElement }
/** Bei welchem Stand wartet welche Figur auf den Spieler (Questmarker „!“) */
const WARTET: Partial<Record<Exclude<Stand, "">, NpcId[]>> = { angeboten: ["jori"], angenommen: ["hagan"], auftrag: ["fenna"], osthof: ["raban", "tilda"], beweis: ["hagan"], bestaetigt: ["raban", "tilda"], frei: ["othmar"] };

export class QuestWelt {
  private figuren: Figur[] = []; private staemme: THREE.Group[] = []; private offen: boolean | null = null; private joriLaeuft = false; private joriFertig = false;
  constructor(private u: QuestUmgebung) {
    const holz = new THREE.MeshStandardMaterial({ color: 0x6b4a2b, roughness: 0.95 }), schnitt = new THREE.MeshStandardMaterial({ color: 0xc9a46a, roughness: 0.8 });
    for (const sp of SPERREN) for (const [x, y, l, w] of sp.staemme) { const g = new THREE.Group(), r = 0.32;
      const stamm = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.08, l, 12), [holz, schnitt, schnitt]); stamm.rotation.z = Math.PI / 2; stamm.position.y = r; g.add(stamm);
      g.position.set(x, this.u.motor.hoehe(x, y), y); g.rotation.y = w; g.traverse((o) => { o.castShadow = true; o.receiveShadow = true; }); g.userData.sperre = sp.id; this.u.motor.szene.add(g); this.staemme.push(g); }
    for (const n of NPCS) { const nm = document.createElement("div"); nm.className = "ez-name3d quest"; nm.textContent = n.name; document.body.appendChild(nm);
      const mk = document.createElement("div"); mk.className = "ez-questmarke"; mk.textContent = "!"; mk.hidden = true; document.body.appendChild(mk);
      let npc: Npc3D | null = null; if (!n.wandert) { npc = new Npc3D(n.modell); npc.blick(n.blick[0], n.blick[1]); this.u.motor.szene.add(npc.gruppe); }
      this.figuren.push({ n, npc, x: n.x, y: n.y, nm, mk }); }
    addEventListener("ez-quest", () => this.stand()); this.stand();
    /* Kopfbilder fürs Gespräch: die Figur aus ihrem 3D-Modell, der eigene Held aus seinem Bildnis (sonst die Grundfigur) */
    bildnisseVon(async (wer) => { if (wer === "Du") { const b = eigenesBildnis(); if (b) return b; const h = aktiverHeld(); return kopfbild(h ? "base" + h.aussehen.g + "3d" : "basemann3d"); }
      const n = NPCS.find((x) => x.name === wer || x.name.endsWith(" " + wer) || x.name.startsWith(wer + " ")); return n ? kopfbild(n.modell) : ""; }); }
  /** Stand geändert: Sperren, Wachen, Marker */
  private stand() { const s = questStand(), auf = sperreOffen(s);
    if (auf !== this.offen) { this.offen = auf; for (const g of this.staemme) g.visible = !auf; this.u.sperrenNeu();
      for (const f of this.figuren) if (f.n.id === "raban" || f.n.id === "tilda") { f.x = f.n.x + (auf ? (f.n.id === "raban" ? -3 : 3) : 0); if (f.npc) f.npc.blick(auf ? 0 : f.n.blick[0], auf ? 1 : f.n.blick[1]); } } }
  /** Die gesperrten Felder für diesen Spieler (leer, sobald die Wachen ihn durchlassen) */
  sperren(): number[][] { return sperreOffen(questStand()) ? [] : SPERREN.map((s) => [...s.feld]); }
  /** Wo steht die Figur gerade (Hagan: der umhergehende Bürgermeister) */
  private wo(f: Figur): { x: number; y: number } | null { if (!f.n.wandert) return { x: f.x, y: f.y };
    const w = this.u.motor.wandererMit(f.n.wandert); return w ? { x: w.x, y: w.z } : null; }
  /** Antippen: liegt dort eine Questfigur? Dann „Mit … sprechen“ (hingehen, dann reden) */
  stelle(x: number, y: number): { x: number; y: number; text: string; tat: () => void; da: () => boolean } | null {
    if (!questGeladen()) return null; let best: Figur | null = null, bd = 1.3;
    for (const f of this.figuren) { const p = this.wo(f); if (!p) continue; const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = f; } }
    if (!best) return null; const f = best, p = this.wo(f)!;
    return { x: p.x, y: p.y, text: `Mit ${f.n.name.replace(/^Wacht(mann|frau) /, "")} sprechen`, tat: () => rede(f.n.id), da: () => { const q = this.wo(f); return !!q && Math.hypot(q.x - this.u.ort.x, q.y - this.u.ort.y) <= 2.6; } }; }
  schritt(dt: number) { const s = questStand(), M = this.u.motor, warten = new Set(s ? WARTET[s] || [] : questGeladen() ? ["jori"] : []);
    /* Jori: beim ersten Besuch (noch nie angeboten) läuft sie auf den Spieler zu und spricht ihn an */
    const jori = this.figuren.find((f) => f.n.id === "jori")!;
    if (questGeladen() && s === "" && this.u.hier === "waldmark" && !this.joriFertig && !this.u.gesperrt) {
      const dx = this.u.ort.x - jori.x, dy = this.u.ort.y - jori.y, d = Math.hypot(dx, dy);
      if (d < 18 && d > 1.8) { const v = 3.2 * dt; jori.x += dx / d * Math.min(v, d - 1.8); jori.y += dy / d * Math.min(v, d - 1.8); this.joriLaeuft = true; if (jori.npc) { jori.npc.blick(dx, dy); jori.npc.spiele("gehen"); } }
      else if (d <= 1.8 && this.joriLaeuft) { this.joriFertig = true; if (jori.npc) { jori.npc.spiele("ruhe"); jori.npc.blick(dx, dy); } rede("jori"); } }
    else if (jori.npc && this.joriLaeuft && !this.joriFertig) { this.joriLaeuft = false; jori.npc.spiele("ruhe"); }
    for (const f of this.figuren) { const p = this.wo(f), sichtbar = !!p && Math.hypot(p.x - this.u.ort.x, p.y - this.u.ort.y) < 40;
      if (f.npc) { f.npc.gruppe.visible = sichtbar; if (sichtbar) { f.npc.gruppe.position.set(f.x, M.hoehe(f.x, f.y), f.y); f.npc.schritt(dt); } }
      const h = p ? M.hoehe(p.x, p.y) : 0; f.nm.hidden = !sichtbar || !schildAn(f.nm, M, p!.x, h + 2.35, p!.y);
      f.mk.hidden = !sichtbar || !warten.has(f.n.id) || !schildAn(f.mk, M, p!.x, h + 2.85, p!.y); f.mk.textContent = s === "beweis" || s === "bestaetigt" || s === "frei" ? "?" : "!"; } }
  /** Stand für Tests */
  get sperreZu(): boolean { return !sperreOffen(questStand()); }
  get joriDa(): { x: number; y: number } { const j = this.figuren.find((f) => f.n.id === "jori")!; return { x: j.x, y: j.y }; }
  /** nur für Tests: wie weit ist der Stand */
  rang(): number { return rang(questStand()); }
}
