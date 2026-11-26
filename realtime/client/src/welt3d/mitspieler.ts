/*
 * Mythara – Mitspieler in der 3D-Welt: dieselben Daten wie in der 2D-Welt (welt.ts, Fremder: Stelle in Bildpunkten der Region,
 * Blick, Laufen, Stufe, Leben, Aussehen), dieselben Bilder (FigurLeinwand), Namen, Lebensbalken und Sprechblasen als HTML über der Szene.
 * Schnittstelle wie welt.ts Mitspieler: liste, weg, blase, schritt – dazu unter(px, py) fürs Antippen.
 */
import { heldenFigur3D, FigurArt } from "./held3d";
import type { Welt3D } from "./motor";
import type { Fremder } from "../welt";
import { heldPruefen, aussehenSchluessel } from "../../../shared/aussehen";
import { FELD_PX } from "../../../shared/welt/typen";

const HOEHE = 2.0, MODUL: Record<string, string> = { schildwaechter: "held.krieger" };
interface Figur { f: FigurArt; nm: HTMLElement; lb: HTMLElement; d: Fremder; x: number; y: number; /** Weltfelder (weich nachgeführt) */ wx?: number; wy?: number; held: string; a: string }

/** Ein HTML-Schild, das einem Punkt der 3D-Welt folgt */
export function schildAn(el: HTMLElement, m: Welt3D, x: number, y: number, z: number): boolean {
  if (el.classList.contains("ez-name3d") && !el.classList.contains("boden")) { if (!el.hidden) el.hidden = true; return false; } /* Namensschilder über Figuren gibt es nicht mehr (25.11.2026): Name und Level stehen im Menü beim Gedrückthalten – spart jedes Bild Rechenzeit */
  if (el.parentElement !== m.schilder) m.schilder.appendChild(el); const p = m.aufEbene(x, y, z); el.hidden = !p; if (p) el.style.transform = `translate(${Math.round(p.x)}px, ${Math.round(p.y)}px) translate(-50%, -100%)`; return Boolean(p); }
/** Sprechblase über einem Punkt der 3D-Welt (wo: Weltfelder und Höhe; null = weg) */
export function blase3d(m: Welt3D, wo: () => { x: number; y: number; z: number } | null, text: string): void {
  const t = text.length > 60 ? text.slice(0, 58) + "…" : text, el = document.createElement("div"); el.className = "ez-blase3d"; el.textContent = t; document.body.appendChild(el);
  let an = true; const folge = () => { if (!an) return; const p = wo(); if (!p) { weg(); return; } schildAn(el, m, p.x, p.y, p.z); requestAnimationFrame(folge); };
  const weg = () => { an = false; el.remove(); }; folge(); setTimeout(weg, Math.min(9000, 3500 + t.length * 60)); }

export class Mitspieler3D {
  figuren = new Map<number, Figur>();
  /** versatz: Ursprung der Region in Bildpunkten (die Stellen der Mitspieler sind relativ dazu); karte: Größe der Region in Bildpunkten (Punkte auf der Minikarte) */
  constructor(private m: Welt3D, private o: { versatz: { x: number; y: number }; karte?: { breit: number; hoch: number } }) {}
  private feld(f: { x: number; y: number; wx?: number; wy?: number }) { return f.wx !== undefined && f.wy !== undefined ? { x: f.wx, z: f.wy } : { x: (f.x + this.o.versatz.x) / FELD_PX, z: (f.y + this.o.versatz.y) / FELD_PX }; } /* Weltfelder vom Server (auch aus der Nachbarregion), sonst relativ zur eigenen Region */
  /** Welcher Mitspieler steht unter diesem Bildschirmpunkt? */
  unterPunkt(px: number, py: number): Fremder | null { let best: Fremder | null = null, bd = 1e9;
    for (const f of this.figuren.values()) { const w = this.feld(f), h = this.m.hoehe(w.x, w.z), a = this.m.bildschirm(w.x, h, w.z), b = this.m.bildschirm(w.x, h + HOEHE, w.z); if (!a || !b) continue;
      const breit = Math.max(18, Math.abs(a.y - b.y) * 0.35), dx = Math.abs(px - a.x), innen = py <= a.y + 6 && py >= b.y - 6 && dx <= breit; if (innen && dx < bd) { bd = dx; best = f.d; } } return best; }
  blase(id: number, text: string): void { const f = this.figuren.get(id); if (!f) return; blase3d(this.m, () => { if (this.figuren.get(id) !== f) return null; const w = this.feld(f); return { x: w.x, y: this.m.hoehe(w.x, w.z) + HOEHE + 0.9, z: w.z }; }, text); }
  liste(l: Fremder[]): void { const da = new Set<number>();
    for (const d of l) { da.add(d.i); let f = this.figuren.get(d.i); const a = d.a ? heldPruefen(d.a) : null, k = a ? aussehenSchluessel(a) : "";
      if (!f || f.held !== d.h || f.a !== k) { if (f) this.weg(d.i); f = this.neu(d); } f.d = d; }
    for (const id of [...this.figuren.keys()]) if (!da.has(id)) this.weg(id); }
  weg(id: number): void { const f = this.figuren.get(id); if (!f) return; f.f.entfernen(this.m.szene); f.nm.remove(); f.lb.remove(); this.figuren.delete(id); const u = document.querySelector(`#ez-karte u[data-sp="${id}"]`); if (u) u.remove(); }
  private neu(d: Fremder): Figur { const a = d.a ? heldPruefen(d.a) : null;
    const nm = document.createElement("div"), lb = document.createElement("div"); nm.className = "ez-name3d fremd"; lb.className = "ez-balken3d"; lb.innerHTML = "<i></i>"; lb.hidden = true; document.body.append(nm, lb);
    const f: Figur = { f: heldenFigur3D(this.m.szene, MODUL[d.h] || "held.krieger", HOEHE, a), nm, lb, d, x: d.x, y: d.y, wx: d.wx, wy: d.wy, held: d.h, a: a ? aussehenSchluessel(a) : "" }; this.figuren.set(d.i, f); return f; }
  /** Jedes Bild: weich zur gemeldeten Stelle, Name mit Stufe, Lebensbalken wenn verletzt, Punkt auf der Minikarte */
  schritt(dt: number): void { for (const f of this.figuren.values()) { const d = f.d, k = Math.min(1, dt * 10); f.x += (d.x - f.x) * k; f.y += (d.y - f.y) * k;
    if (d.wx !== undefined && d.wy !== undefined) { f.wx = f.wx === undefined || Math.hypot(d.wx - f.wx, (d.wy) - (f.wy ?? d.wy)) > 6 ? d.wx : f.wx + (d.wx - f.wx) * k; f.wy = f.wy === undefined || Math.abs(d.wy - f.wy) > 6 ? d.wy : f.wy + (d.wy - f.wy) * k; } /* Sprünge (Teleport) nicht nachziehen */
    const w = this.feld(f), h = this.m.hoehe(w.x, w.z); f.f.stelle(w.x, h, w.z); f.f.blick(Math.cos(d.b), Math.sin(d.b)); f.f.setze(d.l ? "laufen" : "ruhe"); f.f.schritt(dt * 1000, this.m.gieren);
    const text = d.s ? `${d.n} · Lv ${d.s}` : d.n; if (f.nm.textContent !== text) f.nm.textContent = text; schildAn(f.nm, this.m, w.x, h + HOEHE + 0.35, w.z);
    if (d.max && d.lp !== undefined) { const a = Math.max(0, Math.min(1, d.lp / d.max)), i = f.lb.firstChild as HTMLElement; i.style.width = Math.round(a * 100) + "%"; i.className = a > 0.5 ? "" : a > 0.25 ? "mittel" : "wenig"; schildAn(f.lb, this.m, w.x, h + HOEHE + 0.12, w.z); } else f.lb.hidden = true;
    if (this.o.karte) { let u = document.querySelector(`#ez-karte u[data-sp="${d.i}"]`) as HTMLElement | null; const kk = document.getElementById("ez-karte"); if (!u && kk) { u = document.createElement("u"); u.className = "freund"; u.dataset.sp = String(d.i); kk.appendChild(u); }
      if (u) { u.title = d.n; u.style.left = (100 * f.x / this.o.karte.breit) + "%"; u.style.top = (100 * f.y / this.o.karte.hoch) + "%"; } } } }
}
