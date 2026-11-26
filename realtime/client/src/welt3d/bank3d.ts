/*
 * Mythara – die Bankmitarbeiter (shared/bank.ts): je einer hinter den beiden Schaltern der Bank der Waldmark und einer im Schalterhäuschen von Weidenhain.
 * Wie in OSRS: kurz antippen = hingehen und reden („Ich möchte auf mein Bankkonto zugreifen“ öffnet die Bank), lange drücken / Rechtsklick dazu „Bank“ = gleich öffnen.
 * Den Schalter selbst antippen öffnet die Bank direkt (spielwelt.ts, Interaktionen „bankschalter…“).
 */
import { BANKIERS, Bankier, BANKSCHALTER, BANK_GRUSS, BANK_ANTWORTEN, BANK_ORT, BANK_TSCHUESS } from "../../../shared/bank";
import { lokalesGespraech } from "../dialog";
import { bankZeigen } from "../bank";
import { Npc3D } from "./npc3d";
import { schildAn } from "./mitspieler";
import type { Welt3D } from "./motor";

interface Umgebung { motor: Welt3D; ort: { x: number; y: number } }
interface Figur { b: Bankier; npc: Npc3D; nm: HTMLElement }
const vorname = (b: Bankier) => b.name.split(" ")[0];
const bankName = (b: Bankier) => (b.ort === "weidenhain" ? "Bankschalter Weidenhain" : "Bank der Waldmark");
/** Gespräch mit dem Bankmitarbeiter (wie OSRS): Gruß, dann „Konto“, „Was ist das hier?“ oder „Nichts, danke“ */
export function bankierReden(b: Bankier): void {
  const antworten = BANK_ANTWORTEN.map((a) => ({ ...a }));
  lokalesGespraech(b.name, [{ wer: b.name, text: BANK_GRUSS }], antworten, (id) => {
    if (id === "konto") { bankZeigen(bankName(b)); return "zu"; }
    if (id === "ort") return BANK_ORT.map((text) => ({ wer: b.name, text }));
    return [{ wer: b.name, text: BANK_TSCHUESS }]; });
}
/** Wo der Kunde vor dem Bankmitarbeiter steht: an seinem Schalter */
const vorDem = (b: Bankier): [number, number] => { const s = BANKSCHALTER.find((x) => x.id === b.schalter); return s ? [s.x, s.y] : [b.x, b.y + 1.5]; };

export class BankWelt {
  private alle: Figur[] = [];
  constructor(private u: Umgebung) {
    for (const b of BANKIERS) { const npc = new Npc3D(b.modell); npc.blick(b.blick[0], b.blick[1]); this.u.motor.szene.add(npc.gruppe);
      const nm = document.createElement("div"); nm.className = "ez-name3d quest haendler"; nm.innerHTML = `${b.name}<small>${b.titel}</small>`; document.body.appendChild(nm); this.alle.push({ b, npc, nm }); } }
  /** Liegt an diesem Bodenpunkt ein Bankmitarbeiter? Dann „Mit … sprechen“ und im Menü dazu „Bank“ */
  stelle(x: number, y: number): { x: number; y: number; text: string; tat: () => void; da: () => boolean; mehr: { text: string; sym: string; tat: () => void }[] } | null {
    if (BANKSCHALTER.some((k) => Math.hypot(k.x - x, k.y - y) < 1.5 && Math.hypot(k.x - x, k.y - y) < Math.min(...this.alle.map((f) => Math.hypot(f.b.x - x, f.b.y - y))))) return null; /* an der Theke gilt der Schalter („Bank“), nicht der Mitarbeiter dahinter */
    let best: Figur | null = null, bd = 1.3; for (const f of this.alle) { const d = Math.hypot(f.b.x - x, f.b.y - y); if (d < bd) { bd = d; best = f; } } if (!best) return null; const b = best.b, [vx, vy] = vorDem(b);
    return { x: vx, y: vy, text: `Mit ${vorname(b)} sprechen`, tat: () => bankierReden(b), da: () => Math.hypot(vx - this.u.ort.x, vy - this.u.ort.y) <= 1.6,
      mehr: [{ text: "Bank", sym: "🏦", tat: () => bankZeigen(bankName(b)) }] }; }
  schritt(dt: number): void { const M = this.u.motor, o = this.u.ort;
    for (const f of this.alle) { const sichtbar = Math.hypot(f.b.x - o.x, f.b.y - o.y) < 40; f.npc.gruppe.visible = sichtbar;
      if (sichtbar) { f.npc.gruppe.position.set(f.b.x, M.hoehe(f.b.x, f.b.y), f.b.y); f.npc.schritt(dt); }
      f.nm.hidden = !sichtbar || !schildAn(f.nm, M, f.b.x, M.hoehe(f.b.x, f.b.y) + 2.35, f.b.y); } }
  /** Bank-Symbol auf der Minikarte (einmal je Bank, nicht je Mitarbeiter) */
  karteMarken(c: HTMLCanvasElement, felder: number, o: { x: number; y: number }, g: number): void { const x = c.getContext("2d"); if (!x) return; const n = c.width, k = n / felder, rand = n / 2 / 1.5, gr = Math.max(13, n * 0.075);
    const orte = [{ x: 6478, y: 6428 }, { x: 6436.5, y: 6675.5 }];
    x.save(); x.textAlign = "center"; x.textBaseline = "middle"; x.font = `${gr * 0.62}px sans-serif`;
    for (const p of orte) { const dx = p.x - o.x, dy = p.y - o.y, px = (dx * Math.cos(g) + dy * -Math.sin(g)) * k, py = -(dx * -Math.sin(g) + dy * -Math.cos(g)) * k; if (Math.hypot(px, py) > rand - gr / 2) continue;
      const sx = n / 2 + px, sy = n / 2 + py; x.beginPath(); x.arc(sx, sy, gr / 2, 0, Math.PI * 2); x.fillStyle = "#2a1f12"; x.fill(); x.lineWidth = Math.max(1.5, gr * 0.09); x.strokeStyle = "#e9c46a"; x.stroke();
      x.fillStyle = "#fff"; x.fillText("🏦", sx, sy + gr * 0.03); }
    x.restore(); }
  /** Wo steht der Bankmitarbeiter mit diesem Namen (Gespräch abbrechen, wenn man sich entfernt) */
  ortVon(name: string): { x: number; y: number } | null { const f = this.alle.find((x) => x.b.name === name); return f ? { x: f.b.x, y: f.b.y } : null; }
  /** Wo die Bankmitarbeiter stehen (Antippen am Bildschirm: die ganze Figur zählt) */
  punkte(): { x: number; y: number }[] { return this.alle.map((f) => ({ x: f.b.x, y: f.b.y })); }
  /** für Tests */
  get liste(): { id: string; name: string; x: number; y: number }[] { return this.alle.map((f) => ({ id: f.b.id, name: f.b.name, x: f.b.x, y: f.b.y })); }
}
