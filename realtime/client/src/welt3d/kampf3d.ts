/*
 * Mythara – Kampf in der 3D-Welt. Spiellogik, Server-Anbindung, Steuerung, HUD und Kampfregeln wie in der 2D-Welt (welt/kampf.ts WeltKampf);
 * nur die Darstellung ist 3D: Gegner und andere Helden als Aufsteller mit ihren bisherigen Bildern (FigurLeinwand, Todesbewegung),
 * Namen, Lebensbalken und Schadenszahlen als HTML über der Szene, das gewählte Ziel mit einem roten Ring am Boden.
 */
import * as THREE from "three";
import { WeltKampf, WeltSzene, Figur } from "../welt/kampf";
import { FigurLeinwand } from "./figurleinwand";
import { heldenFigur3D, gegnerFigur3D, FigurArt } from "./held3d";
import { schildAn } from "./mitspieler";
import { lebenAnzeigen } from "./oberflaeche";
import type { Spielwelt3D } from "./spielwelt";
import { MONSTER } from "../../../shared/config";
import { heldPruefen, aussehenSchluessel } from "../../../shared/aussehen";
import type { KARTEN } from "../../../shared/karten";

const HOEHE = 2.0, MODUL: Record<string, string> = { schildwaechter: "held.krieger", bandit_dolch: "gegner.bandit.v003" };
interface Bild { fl: FigurArt; nm: HTMLElement; lb: HTMLElement; h: number }

export class WeltKampf3D extends WeltKampf {
  constructor(w: Spielwelt3D, region: string, wx: number, wy: number, gefallen: () => void, wartend = false) { super(w as unknown as WeltSzene, region, wx, wy, gefallen, wartend); }
  private get w(): Spielwelt3D { return this.s as unknown as Spielwelt3D; }
  /* bildAufbau läuft schon im Konstruktor der Grundklasse: Zustand darum ohne Feld-Startwerte, beim ersten Gebrauch angelegt */
  private bilderMap?: Map<Figur, Bild>; private ring?: THREE.Mesh; private ichBalken?: HTMLElement;
  private get bilder(): Map<Figur, Bild> { return this.bilderMap || (this.bilderMap = new Map()); }
  protected bildAufbau(_K: (typeof KARTEN)[string]) {
    this.ring = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.56, 28), new THREE.MeshBasicMaterial({ color: 0xff6a6a, transparent: true, opacity: 0.9, depthWrite: false })); this.ring.rotation.x = -Math.PI / 2; this.ring.visible = false; this.w.motor.szene.add(this.ring);
    this.ichBalken = document.createElement("div"); this.ichBalken.className = "ez-balken3d eigen"; this.ichBalken.innerHTML = "<i></i>"; this.ichBalken.hidden = true; document.body.appendChild(this.ichBalken);
  }
  protected lebenHud(lp: number, max: number) { lebenAnzeigen(lp, max); }
  protected bildEnde() { lebenAnzeigen(null); for (const [, b] of this.bilder) { b.fl.entfernen(this.w.motor.szene); b.nm.remove(); b.lb.remove(); } this.bilder.clear();
    if (this.ring) { this.w.motor.szene.remove(this.ring); this.ring = undefined; } if (this.ichBalken) { this.ichBalken.remove(); this.ichBalken = undefined; } }
  protected neu(id: number, held: boolean, typ: string, team: number, x: number, y: number): Figur {
    const nA = held ? this.namen.get(id) : undefined, eigen = nA && nA.a ? heldPruefen(nA.a) : null, h = held ? HOEHE : HOEHE * (((MONSTER[typ] as { hoehe?: number } | undefined)?.hoehe) || 88) / 96;
    const fl: FigurArt = held ? heldenFigur3D(this.w.motor.szene, MODUL[typ] || "held.krieger", h, eigen) : gegnerFigur3D(this.w.motor.szene, typ, MODUL[typ] || "gegner.bandit.v003", h);
    const nm = document.createElement("div"), lb = document.createElement("div"); nm.className = "ez-name3d " + (team === 0 ? "fremd" : "feind"); lb.className = "ez-balken3d" + (team === 0 ? "" : " feind"); lb.innerHTML = "<i></i>"; document.body.append(nm, lb);
    const leer = { destroy() {}, setVisible() { return leer; } } as unknown, f = { typ, held, team, sp: leer, nm: leer, lb: leer, x, y, zx: x, zy: y, laeuft: false, tot: false, lp: 1, max: 1, bits: 0, schild: false, a: eigen ? aussehenSchluessel(eigen) : "" } as unknown as Figur;
    this.figuren.set(id, f); this.bilder.set(f, { fl, nm, lb, h }); return f; }
  protected figurSichtbar(f: Figur, an: boolean) { const b = this.bilder.get(f); if (!b) return; b.fl.sichtbar(an); if (!an) { b.nm.hidden = true; b.lb.hidden = true; } }
  protected figurEntfernen(f: Figur) { const b = this.bilder.get(f); if (!b) return; this.bilder.delete(f); b.nm.remove(); b.lb.remove();
    const dauer = f.held ? 0 : b.fl.sterben(); /* ein besiegter Gegner fällt (Todesbewegung), bleibt kurz liegen, dann ist er weg */
    if (!dauer) { b.fl.entfernen(this.w.motor.szene); return; }
    const t0 = performance.now(), weiter = () => { if (performance.now() - t0 > dauer + 2000) { b.fl.entfernen(this.w.motor.szene); return; } b.fl.schritt(16, this.w.motor.gieren); requestAnimationFrame(weiter); }; requestAnimationFrame(weiter); }
  /** Wer steht am Bildschirmpunkt (px, py)? Die ganze Figur zählt (Füße bis Kopf), nicht nur der Boden darunter – der vorderste gewinnt */
  amSchirm(px: number, py: number): { id: number; held: boolean; team: number; name: string; stufe: number; a?: unknown } | null {
    const m = this.w.motor; let best: { id: number; f: Figur; t: number } | null = null;
    for (const [id, f] of this.figuren) { if (id === this.ichId || f.tot) continue; const b = this.bilder.get(f); if (!b) continue;
      const x = this.zone.x0 + f.x, z = this.zone.y0 + f.y, y = m.hoehe(x, z), fu = m.bildschirm(x, y, z), ko = m.bildschirm(x, y + b.h, z); if (!fu || !ko) continue;
      const breit = Math.max(20, Math.abs(fu.y - ko.y) * 0.4), dx = Math.abs(px - fu.x); if (dx > breit || py > fu.y + 10 || py < ko.y - 10) continue;
      if (!best || fu.y > best.t) best = { id, f, t: fu.y }; } /* weiter vorn (tiefer im Bild) zuerst */
    if (!best) return null; const f = best.f, n = f.held ? this.namen.get(best.id) : undefined, M = MONSTER[f.typ] as { name?: string; stufe?: number } | undefined;
    return { id: best.id, held: f.held, team: f.team, name: f.held ? (n ? n.name : "Wanderer") : M && M.name ? M.name : f.typ, stufe: f.held ? (n ? n.stufe : 1) : (M && M.stufe) || 1, a: n && n.a }; }
  /** Antippen am Bildschirm: einen Gegner unter dem Finger angreifen */
  antippenSchirm(px: number, py: number): boolean { const t = this.amSchirm(px, py); if (!t || t.team === 0 || !this.netz) return false; this.netz.sende({ t: "ziel", id: t.id }); return true; }
  /** Wo eine Figur in der Welt steht (Weltfelder) und wie hoch sie ist */
  private stelle(id: number): { x: number; z: number; h: number } | null {
    if (id === this.ichId) return { x: this.w.ort.x, z: this.w.ort.y, h: HOEHE }; const f = this.figuren.get(id), b = f && this.bilder.get(f); return f && b ? { x: this.zone.x0 + f.x, z: this.zone.y0 + f.y, h: b.h } : null; }
  protected zahl(id: number, t: string, farbe: string) { const p = this.stelle(id); if (!p) return; const m = this.w.motor, el = document.createElement("div"); el.className = "ez-zahl3d"; el.textContent = t; el.style.color = farbe; document.body.appendChild(el);
    const y0 = m.hoehe(p.x, p.z) + p.h, t0 = performance.now(), lauf = () => { const a = (performance.now() - t0) / 900; if (a >= 1) { el.remove(); return; } el.style.opacity = String(1 - a * a); schildAn(el, m, p.x, y0 + a * 0.9, p.z); requestAnimationFrame(lauf); }; lauf(); }
  protected hieb(id: number) { if (id === this.ichId) { this.w.figur.angriff(); return; } const f = this.figuren.get(id), b = f && this.bilder.get(f); if (b) b.fl.angriff(); }
  protected eigeneHaltung(schild: boolean, _laeuft: boolean) { this.w.schildHoch = schild; }
  protected figurZeichnen(f: Figur, vx: number, vy: number, lauf: boolean, _wechsel: boolean, name: string, dt: number) { const b = this.bilder.get(f); if (!b) return; const m = this.w.motor, x = this.zone.x0 + f.x, z = this.zone.y0 + f.y, y = m.hoehe(x, z);
    b.fl.sichtbar(true); b.fl.stelle(x, y, z); if (lauf) b.fl.blick(vx, vy); b.fl.setze(f.schild ? (lauf ? "schild_laufen" : "block") : lauf ? "laufen" : "ruhe"); b.fl.schritt(dt * 1000, m.gieren);
    if (b.nm.textContent !== name) b.nm.textContent = name; schildAn(b.nm, m, x, y + b.h + 0.42, z);
    const a = Math.max(0, Math.min(1, f.lp / f.max)), i = b.lb.firstChild as HTMLElement; i.style.width = Math.round(a * 100) + "%"; if (f.team === 0) i.className = a > 0.5 ? "" : a > 0.25 ? "mittel" : "wenig"; schildAn(b.lb, m, x, y + b.h + 0.18, z); }
  protected zielUndLeben(leben: number | null, zf: Figur | null) { const m = this.w.motor;
    if (this.ichBalken) this.ichBalken.hidden = true; /* kein Lebensbalken über dem eigenen Helden (das Leben steht am Bogen der Minikarte) */
    if (this.ring) { if (zf) { const x = this.zone.x0 + zf.x, z = this.zone.y0 + zf.y; this.ring.position.set(x, m.hoehe(x, z) + 0.07, z); this.ring.visible = true; } else this.ring.visible = false; } }
}
