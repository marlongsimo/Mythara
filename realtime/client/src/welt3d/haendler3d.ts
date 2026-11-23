/*
 * Mythara – die drei Händler am Marktplatz der Waldmark (shared/laeden.ts): je einer hinter seinem Marktstand, mit Namensschild.
 * Kurz antippen: hingehen und reden (Gespräch mit „Nein danke“ / „Laden ansehen“). Lange drücken / Rechtsklick: „Sprechen“, dann „Laden ansehen“.
 */
import { LADEN_LISTE, Laden, LADEN_ZEICHEN } from "../../../shared/laeden";
import { lokalesGespraech } from "../dialog";
import { ladenZeigen } from "../laden";
import { Npc3D } from "./npc3d";
import { schildAn } from "./mitspieler";
import type { Welt3D } from "./motor";

interface Umgebung { motor: Welt3D; ort: { x: number; y: number } }
interface Haendler { l: Laden; npc: Npc3D; nm: HTMLElement }
const vorname = (l: Laden) => l.haendler.split(" ")[0];
/** Gespräch mit dem Händler: Gruß, dann „Nein danke“ oder „Laden ansehen“ */
export function haendlerReden(l: Laden): void {
  lokalesGespraech(l.haendler, [{ wer: l.haendler, text: l.gruss }], [{ id: "nein", text: "Nein danke." }, { id: "laden", text: "Laden ansehen" }],
    (id) => { if (id === "laden") { ladenZeigen(l.id); return "zu"; } return [{ wer: l.haendler, text: l.tschuess }]; }); }

export class HaendlerWelt {
  private alle: Haendler[] = [];
  constructor(private u: Umgebung) {
    for (const l of LADEN_LISTE) { const npc = new Npc3D(l.modell); npc.blick(l.blick[0], l.blick[1]); this.u.motor.szene.add(npc.gruppe);
      const nm = document.createElement("div"); nm.className = "ez-name3d quest haendler"; nm.innerHTML = `${l.haendler}<small>${l.name}</small>`; document.body.appendChild(nm); this.alle.push({ l, npc, nm }); } }
  /** Liegt an diesem Bodenpunkt ein Händler? Dann „Mit … sprechen“ (hingehen, reden) und im Menü dazu „Laden ansehen“ */
  stelle(x: number, y: number): { x: number; y: number; text: string; tat: () => void; da: () => boolean; mehr: { text: string; sym: string; tat: () => void }[] } | null {
    let best: Haendler | null = null, bd = 1.3; for (const h of this.alle) { const d = Math.hypot(h.l.x - x, h.l.y - y); if (d < bd) { bd = d; best = h; } } if (!best) return null; const l = best.l;
    return { x: l.vor[0], y: l.vor[1] /* vor der Theke, auf der Marktseite */, text: `Mit ${vorname(l)} sprechen`, tat: () => haendlerReden(l), da: () => Math.hypot(l.x - this.u.ort.x, l.y - this.u.ort.y) <= 3.2,
      mehr: [{ text: "Laden ansehen", sym: "🛒", tat: () => ladenZeigen(l.id) }] }; }
  schritt(dt: number): void { const M = this.u.motor, o = this.u.ort;
    for (const h of this.alle) { const sichtbar = Math.hypot(h.l.x - o.x, h.l.y - o.y) < 40; h.npc.gruppe.visible = sichtbar;
      if (sichtbar) { h.npc.gruppe.position.set(h.l.x, M.hoehe(h.l.x, h.l.y), h.l.y); h.npc.schritt(dt); }
      h.nm.hidden = !sichtbar || !schildAn(h.nm, M, h.l.x, M.hoehe(h.l.x, h.l.y) + 2.35, h.l.y); } }
  /** Ladensymbole auf der Minikarte (ins Kartenbild gezeichnet wie das Quest-!: Held in der Mitte, felder = Breite, g = Drehung der Kamera) */
  karteMarken(c: HTMLCanvasElement, felder: number, o: { x: number; y: number }, g: number): void { const x = c.getContext("2d"); if (!x) return; const n = c.width, k = n / felder, rand = n / 2 / 1.5, gr = Math.max(13, n * 0.075);
    x.save(); x.textAlign = "center"; x.textBaseline = "middle"; x.font = `${gr * 0.62}px sans-serif`;
    for (const h of this.alle) { const dx = h.l.x - o.x, dy = h.l.y - o.y, px = (dx * Math.cos(g) + dy * -Math.sin(g)) * k, py = -(dx * -Math.sin(g) + dy * -Math.cos(g)) * k; if (Math.hypot(px, py) > rand - gr / 2) continue;
      const sx = n / 2 + px, sy = n / 2 + py; x.beginPath(); x.arc(sx, sy, gr / 2, 0, Math.PI * 2); x.fillStyle = "#2a1f12"; x.fill(); x.lineWidth = Math.max(1.5, gr * 0.09); x.strokeStyle = "#e9c46a"; x.stroke();
      x.fillStyle = "#fff"; x.fillText(LADEN_ZEICHEN[h.l.id], sx, sy + gr * 0.03); }
    x.restore(); }
  /** Wo steht der Händler mit diesem Namen (Gespräch abbrechen, wenn man sich entfernt) */
  ortVon(name: string): { x: number; y: number } | null { const h = this.alle.find((x) => x.l.haendler === name); return h ? { x: h.l.x, y: h.l.y } : null; }
  /** Wo die Händler stehen (Antippen am Bildschirm: die ganze Figur zählt) */
  punkte(): { x: number; y: number }[] { return this.alle.map((h) => ({ x: h.l.x, y: h.l.y })); }
  /** für Tests: wo die Händler stehen */
  get liste(): { id: string; x: number; y: number }[] { return this.alle.map((h) => ({ id: h.l.id, x: h.l.x, y: h.l.y })); }
}
