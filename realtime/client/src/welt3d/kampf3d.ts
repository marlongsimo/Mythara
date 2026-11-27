/*
 * Mythara – Kampf in der 3D-Welt. Spiellogik, Server-Anbindung, Steuerung, HUD und Kampfregeln wie in der 2D-Welt (welt/kampf.ts WeltKampf);
 * nur die Darstellung ist 3D: Gegner und andere Helden als Aufsteller mit ihren bisherigen Bildern (FigurLeinwand, Todesbewegung),
 * Namen, Lebensbalken und Schadenszahlen als HTML über der Szene, das gewählte Ziel mit einem roten Ring am Boden.
 */
import { zielscheibeFrei } from "../../../shared/quests";
import { questStandB } from "../welt";
import * as THREE from "three";
import { WeltKampf, WeltSzene, Figur } from "../welt/kampf";
import { FigurLeinwand } from "./figurleinwand";
import { heldenFigur3D, gegnerFigur3D, FigurArt } from "./held3d";
import { schildAn, blase3d } from "./mitspieler";
import { lebenAnzeigen } from "./oberflaeche";
import type { Spielwelt3D } from "./spielwelt";
import { leicheMelden } from "./leichen";
import { MONSTER } from "../../../shared/config";
import { heldPruefen, aussehenSchluessel } from "../../../shared/aussehen";
import type { KARTEN } from "../../../shared/karten";
import { Geschosse3D, GeschossArt } from "./geschosse3d";

const HOEHE = 2.0, MODUL: Record<string, string> = { schildwaechter: "held.krieger", bandit_dolch: "gegner.bandit.v003" };
interface Bild { fl: FigurArt; nm: HTMLElement; lb: HTMLElement; h: number }

/** Wie in OSRS: der Level eines Gegners in der Farbe des Abstands zum eigenen Level – höher: gelb → orange → rot (ab +10), gleich: gelb, niedriger: gelbgrün → grün (ab −10) */
export function levelFarbe(d: number): string { const k = Math.max(-10, Math.min(10, d)); if (k === 0) return "#ffff00";
  if (k > 0) return `rgb(255,${Math.round(255 - 255 * k / 10)},0)`; return `rgb(${Math.round(255 + 255 * k / 10)},255,0)`; }
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
  /* Geschosse (Pfeile, Bolzen, Zauber- und Feuerkugeln) als kleine 3D-Modelle (geschosse3d.ts) */
  private geschosseMap?: Geschosse3D;
  private get flug(): Geschosse3D { return this.geschosseMap || (this.geschosseMap = new Geschosse3D(this.w.motor.szene, (x, z) => this.w.motor.hoehe(x, z))); }
  schritt(dt: number) { super.schritt(dt); const z = this.z; if (!z) return; const x0 = this.zone.x0, y0 = this.zone.y0;
    const naechste = (x: number, y: number, ohne: number, max: number) => { let best: (typeof z.w)[number] | null = null, bd = max; for (const e of z.w) { if (e[0] === ohne) continue; const d = Math.hypot(x0 + e[4] - x, y0 + e[5] - y); if (d < bd) { bd = d; best = e; } } return best; };
    this.flug.abgleich((z.g || []).map((g) => [g[0], x0 + g[1], y0 + g[2], String(g[3])] as [number, number, number, string]), (x, y, a) => {
      /* Schütze = die nächste Figur am Startpunkt; die Art schickt der Server (Pfeil oder Bolzen nach der Waffe, Zauber, Feuer) */
      const s = naechste(x, y, -1, 3), art: GeschossArt = a === "feuer" ? "feuer" : a === "blitz" ? "zauber" : a === "pfeil" ? "pfeil" : "bolzen";
      return { art, x: s ? x0 + s[4] : x, y: s ? y0 + s[5] : y, von: s ? s[0] : -1 }; },
      (x, y, von) => { const e = naechste(x, y, von, 2.5); return e ? { x: x0 + e[4], y: y0 + e[5] } : null; });
    this.flug.schritt(dt); }
  protected bildEnde() { lebenAnzeigen(null); if (this.geschosseMap) this.geschosseMap.alleWeg(); for (const [, b] of this.bilder) { b.fl.entfernen(this.w.motor.szene); b.nm.remove(); b.lb.remove(); } this.bilder.clear();
    if (this.ring) { this.w.motor.szene.remove(this.ring); this.ring = undefined; } if (this.ichBalken) { this.ichBalken.remove(); this.ichBalken = undefined; } }
  protected neu(id: number, held: boolean, typ: string, team: number, x: number, y: number): Figur {
    const nA = held ? this.namen.get(id) : undefined, eigen = nA && nA.a ? heldPruefen(nA.a) : null, h = held ? HOEHE : HOEHE * (((MONSTER[typ] as { hoehe?: number } | undefined)?.hoehe) || 88) / 96;
    const fl: FigurArt = held ? heldenFigur3D(this.w.motor.szene, MODUL[typ] || "held.krieger", h, eigen) : gegnerFigur3D(this.w.motor.szene, typ, MODUL[typ] || "gegner.bandit.v003", h);
    const nm = document.createElement("div"), lb = document.createElement("div"); nm.className = "ez-name3d " + (team === 0 ? "fremd" : "feind"); lb.className = "ez-balken3d" + (team === 0 ? "" : " feind"); lb.innerHTML = "<i></i>"; document.body.append(nm, lb);
    const leer = { destroy() {}, setVisible() { return leer; } } as unknown, f = { typ, held, team, sp: leer, nm: leer, lb: leer, x, y, zx: x, zy: y, laeuft: false, tot: false, lp: 1, max: 1, bits: 0, schild: false, a: eigen ? aussehenSchluessel(eigen) : "" } as unknown as Figur;
    this.figuren.set(id, f); this.bilder.set(f, { fl, nm, lb, h }); return f; }
  /** Zielscheiben (Phase 2): nur sichtbar für Spieler, die dort üben dürfen (Schalter oder Questschritt) */
  private zielscheibeVerborgen(f: Figur): boolean { return Boolean(MONSTER[f.typ] && (MONSTER[f.typ] as { zielscheibe?: boolean }).zielscheibe) && !zielscheibeFrei((id) => questStandB(id)); }
  protected figurSichtbar(f: Figur, an: boolean) { if (an && this.zielscheibeVerborgen(f)) an = false; const b = this.bilder.get(f); if (!b) return; b.fl.sichtbar(an); if (!an) { b.nm.hidden = true; b.lb.hidden = true; } }
  protected figurEntfernen(f: Figur) { const b = this.bilder.get(f); if (!b) return; this.bilder.delete(f); b.nm.remove(); b.lb.remove();
    const dauer = f.held ? 0 : b.fl.sterben(); /* ein besiegter Gegner fällt (Todesbewegung), bleibt kurz liegen, dann ist er weg */
    const LIEGEN = 600; /* so lange bleibt er nach dem Fallen liegen; die Beute erscheint erst danach (leichen.ts) */
    leicheMelden(this.zone.x0 + f.x, this.zone.y0 + f.y, (dauer || 0) + LIEGEN);
    if (!dauer) { b.fl.entfernen(this.w.motor.szene); return; }
    const t0 = performance.now(), weiter = () => { if (performance.now() - t0 > dauer + LIEGEN) { b.fl.entfernen(this.w.motor.szene); return; } b.fl.schritt(16, this.w.motor.gieren); requestAnimationFrame(weiter); }; requestAnimationFrame(weiter); }
  /** Wer steht am Bildschirmpunkt (px, py)? Die ganze Figur zählt (Füße bis Kopf), nicht nur der Boden darunter – der vorderste gewinnt */
  amSchirm(px: number, py: number): { id: number; held: boolean; team: number; name: string; stufe: number; a?: unknown; typ: string } | null {
    const m = this.w.motor; let best: { id: number; f: Figur; t: number } | null = null;
    for (const [id, f] of this.figuren) { if (id === this.ichId || f.tot || this.zielscheibeVerborgen(f)) continue; const b = this.bilder.get(f); if (!b) continue;
      const x = this.zone.x0 + f.x, z = this.zone.y0 + f.y, y = m.hoehe(x, z), fu = m.bildschirm(x, y, z), ko = m.bildschirm(x, y + b.h, z); if (!fu || !ko) continue;
      const breit = Math.max(20, Math.abs(fu.y - ko.y) * 0.4), dx = Math.abs(px - fu.x); if (dx > breit || py > fu.y + 10 || py < ko.y - 10) continue;
      if (!best || fu.y > best.t) best = { id, f, t: fu.y }; } /* weiter vorn (tiefer im Bild) zuerst */
    if (!best) return null; const f = best.f, n = f.held ? this.namen.get(best.id) : undefined, M = MONSTER[f.typ] as { name?: string; stufe?: number } | undefined;
    return { id: best.id, held: f.held, team: f.team, name: f.held ? (n ? n.name : "Wanderer") : M && M.name ? M.name : f.typ, stufe: f.held ? (n ? n.stufe : 1) : (M && M.stufe) || 1, a: n && n.a, typ: f.typ }; }
  /** Antippen am Bildschirm: einen Gegner unter dem Finger angreifen */
  antippenSchirm(px: number, py: number): boolean { const t = this.amSchirm(px, py); if (!t || t.team === 0 || !this.netz) return false; this.netz.sende({ t: "ziel", id: t.id }); return true; }
  /** Wo eine Figur in der Welt steht (Weltfelder) und wie hoch sie ist */
  /** Sprechblase über einem anderen Helden der Kampfwelt (nach Name – die Welt-Id des Chats ist nicht die Id im Kampf). Zurück: gefunden (#68) */
  blaseHeld(name: string, text: string): boolean { let id = 0; for (const [i, n] of this.namen) if (i !== this.ichId && n.name === name && this.figuren.get(i)?.held) { id = i; break; } if (!id) return false;
    const f = this.figuren.get(id); blase3d(this.w.motor, () => { if (this.figuren.get(id) !== f) return null; const p = this.stelle(id); return p ? { x: p.x, y: this.w.motor.hoehe(p.x, p.z) + p.h + 0.9, z: p.z } : null; }, text); return true; }
  private stelle(id: number): { x: number; z: number; h: number } | null {
    if (id === this.ichId) return { x: this.w.ort.x, z: this.w.ort.y, h: HOEHE }; const f = this.figuren.get(id), b = f && this.bilder.get(f); return f && b ? { x: this.zone.x0 + f.x, z: this.zone.y0 + f.y, h: b.h } : null; }
  protected zahl(id: number, t: string, farbe: string) { { const f = id === this.ichId ? undefined : this.figuren.get(id); if (f) f.kampfBis = Math.max(f.kampfBis || 0, performance.now() + 3000); } /* getroffen = im Kampf */ const p = this.stelle(id); if (!p) return; const m = this.w.motor, el = document.createElement("div"); el.className = "ez-zahl3d"; el.textContent = t; el.style.color = farbe; document.body.appendChild(el);
    const y0 = m.hoehe(p.x, p.z) + p.h, t0 = performance.now(), lauf = () => { const a = (performance.now() - t0) / 900; if (a >= 1) { el.remove(); return; } el.style.opacity = String(1 - a * a); schildAn(el, m, p.x, y0 + a * 0.9, p.z); requestAnimationFrame(lauf); }; lauf(); }
  protected hieb(id: number) { const bis = performance.now() + 3000; /* wer zuschlägt, kämpft: 3 s lang zum Gegner schauen */
    if (id === this.ichId) { this.ichKampfBis = bis; this.w.figur.angriff(); return; } const f = this.figuren.get(id), b = f && this.bilder.get(f); if (f) f.kampfBis = bis; if (b) b.fl.angriff(); }
  protected eigeneHaltung(schild: boolean, _laeuft: boolean) { this.w.schildHoch = schild; }
  /** Der eigene Held: steht er, schaut er zu seinem Gegner (Blick vom Server) */
  protected eigenerBlick(winkel: number): void { if (!this.w.laeuft && this.ichKampfBis > performance.now() && Number.isFinite(winkel)) (this.w.figur as { blick(x: number, z: number): void }).blick(Math.cos(winkel), Math.sin(winkel)); }
  /** Hitsplat wie in OSRS: roter Fleck mit dem Schaden, blauer Fleck mit 0 (verfehlt oder geblockt); bleibt kurz an der Figur stehen */
  protected splat(id: number, n: number): void { const p = this.stelle(id); if (!p) return; const m = this.w.motor, el = document.createElement("div"), jetzt = performance.now();
    el.className = "ez-splat " + (n > 0 ? "rot" : "blau"); el.innerHTML = `<b>${n > 0 ? n : 0}</b>`; document.body.appendChild(el);
    const alt = (this.splats.get(id) || []).filter((t) => jetzt - t < 1000), versatz = alt.length % 3; alt.push(jetzt); this.splats.set(id, alt);   /* mehrere zugleich: leicht versetzt wie in OSRS */
    const dx = [0, -0.35, 0.35][versatz], dy = [0, 0.3, 0.3][versatz], y0 = m.hoehe(p.x, p.z) + p.h * 0.62 + dy;
    const lauf = () => { const a = (performance.now() - jetzt) / 1100; if (a >= 1) { el.remove(); return; } el.style.opacity = a > 0.75 ? String(1 - (a - 0.75) / 0.25) : "1"; schildAn(el, m, p.x + dx, y0, p.z); requestAnimationFrame(lauf); }; lauf(); }
  private splats = new Map<number, number[]>(); private ichKampfBis = 0;
  protected figurZeichnen(f: Figur, vx: number, vy: number, lauf: boolean, _wechsel: boolean, name: string, dt: number) { const b = this.bilder.get(f); if (!b) return;
    if (this.zielscheibeVerborgen(f)) { this.figurSichtbar(f, false); return; } const m = this.w.motor, x = this.zone.x0 + f.x, z = this.zone.y0 + f.y, y = m.hoehe(x, z);
    b.fl.sichtbar(true); b.fl.stelle(x, y, z); if (lauf) b.fl.blick(vx, vy); else if (f.blick !== undefined && (f.kampfBis || 0) > performance.now()) b.fl.blick(Math.cos(f.blick), Math.sin(f.blick)); /* steht er: zum Gegner, mit dem er kämpft (Blick vom Server) */ b.fl.setze(f.schild ? (lauf ? "schild_laufen" : "block") : lauf ? "laufen" : "ruhe"); b.fl.schritt(dt * 1000, m.gieren);
    { const mein = this.namen.get(this.ichId), g = !f.held && mein ? /^(.*) · Lv (\d+)$/.exec(name) : null, schl = name + "|" + (g && mein ? mein.stufe : "");
      if (b.nm.dataset.s !== schl) { b.nm.dataset.s = schl; if (g && mein) { b.nm.textContent = g[1] + " · "; const l = document.createElement("b"); l.className = "lvfarbe"; l.textContent = "Lv " + g[2]; l.style.color = levelFarbe(Number(g[2]) - mein.stufe); b.nm.appendChild(l); } else b.nm.textContent = name; } }
    schildAn(b.nm, m, x, y + b.h + 0.42, z);
    const a = Math.max(0, Math.min(1, f.lp / f.max)), i = b.lb.firstChild as HTMLElement; i.style.width = Math.round(a * 100) + "%"; if (f.team === 0) i.className = a > 0.5 ? "" : a > 0.25 ? "mittel" : "wenig"; if ((f.kampfBis || 0) + (f.team !== 0 ? 1000 : 4000) < performance.now()) { if (!b.lb.hidden) b.lb.hidden = true; } /* Gegner: Lebensbalken nur im Kampf und noch 2 Ticks danach (25.11.2026); andere Spieler ebenso, mit ein paar Sekunden Nachlauf (#66) – der eigene Balken steht im HUD */ else schildAn(b.lb, m, x, y + b.h + 0.18, z); }
  protected zielUndLeben(leben: number | null, zf: Figur | null) { const m = this.w.motor;
    if (this.ichBalken) this.ichBalken.hidden = true; /* kein Lebensbalken über dem eigenen Helden (das Leben steht am Bogen der Minikarte) */
    if (this.ring) { if (zf) { const x = this.zone.x0 + zf.x, z = this.zone.y0 + zf.y; this.ring.position.set(x, m.hoehe(x, z) + 0.07, z); this.ring.visible = true; } else this.ring.visible = false; } }
}
