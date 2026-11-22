/*
 * Mythara – die offene Welt in 3D als Spielwelt (ersetzt die 2D-Weltszene welt/welt.ts; Stufe 1 seit 22.11.2026).
 *
 * Darstellung: der 3D-Motor (welt3d/motor.ts) – Gelände, Gebäude, Bäume, Licht, drehbare Kamera.
 * Spiellogik wie in der 2D-Welt und aus denselben Daten (echtzeit/welt/: welt.json mit Regionen, Ausgängen, Startpunkten;
 * je Chunk Gehraster und Interaktionen): Laufen mit Tastatur (zur Kamera hin gedacht), Stick oder Antippen mit Wegsuche,
 * Gespräche und Türen [E], Ausgänge, Abstieg in den Untergrund, gemerkte Stelle, Regionstitel und Minikarte.
 * Menüs, Tafeln und Minikarte schließt welt/anschluss.ts an (anschluss3D, dieselben Funktionen wie für die 2D-Welt).
 * Die Figuren bleiben die bisherigen Bilder (welt3d/figurleinwand.ts), als Aufsteller in der 3D-Welt.
 * Standard seit 22.11.2026 – ?welt3d=0 schaltet auf einem Gerät zurück in die 2D-Welt (gemerkt), ?welt3d=1 wieder in die 3D-Welt.
 */
import * as THREE from "three";
import { Welt3D } from "./motor";
import { FigurLeinwand } from "./figurleinwand";
import { WELT, weltDatei } from "../welt/welt";
import { anschluss3D, schildText, WeltKern } from "../welt/anschluss";
import { HELDEN } from "../../../shared/config";
import { WeltRaster } from "../../../shared/welt/raster";
import { CHUNK_FELDER, chunkName, inZone } from "../../../shared/welt/typen";
import type { ChunkDaten, Region, Ausgang, Spawnzone, Interaktion } from "../../../shared/welt/typen";
import { aktiverHeld } from "../held";
import { angelegteEbenen } from "../inventar";
import { serverZusatz } from "../gruppe";
import { Mitspieler3D, blase3d } from "./mitspieler";
import { WeltKampf3D } from "./kampf3d";

const $ = (s: string) => document.querySelector(s) as HTMLElement, P = new URLSearchParams(location.search);
const HANDY = matchMedia("(pointer: coarse)").matches, C = CHUNK_FELDER, RADIUS = 0.3, HOEHE = 2.0;
const MODUL: Record<string, string> = { schildwaechter: "held.krieger" };
interface RegionKopf { region: Region & { untertitel?: string }; start: number[][]; spawnzonen: Spawnzone[]; ausgaenge: Ausgang[] }
interface WeltIndex { chunkFelder: number; regionen: Record<string, RegionKopf>; stand?: string }

/** Ist die 3D-Welt eingeschaltet? Standard ja – ?welt3d=0 schaltet auf diesem Gerät die 2D-Welt ein (bleibt gemerkt), ?welt3d=1 wieder 3D.
 *  Ohne WebGL immer 2D. Automatisch gesteuerte Testbrowser (navigator.webdriver) bekommen ohne ?welt3d=1 die 2D-Welt – dafür sind die älteren Tests geschrieben. */
export function welt3dAn(): boolean {
  let wahl: string | null = null;
  try { if (P.get("welt3d") === "1") localStorage.setItem("ez_welt3d", "1"); if (P.get("welt3d") === "0") localStorage.setItem("ez_welt3d", "0"); wahl = localStorage.getItem("ez_welt3d"); } catch { wahl = P.get("welt3d"); }
  if (wahl === "0") return false; if (wahl !== "1" && navigator.webdriver) return false;
  try { const c = document.createElement("canvas"); return Boolean(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; }
}
export class Spielwelt3D implements WeltKern {
  motor = new Welt3D(); index!: WeltIndex; raster = new WeltRaster(); daten = new Map<string, ChunkDaten | "holt">(); gueltig = new Set<string>();
  held = "schildwaechter"; ort = { x: 0, y: 0 }; rx = 0; ry = 0; laeuft = false; pfad: { x: number; y: number }[] = []; tasten: Record<string, boolean> = {};
  hier = ""; gesperrt = false; gemerkteStelle = false; /** Schild erhoben (Kampf, Torvald) */ schildHoch = false; /** wie eine Phaser-Szene: Ende melden (der Kampf räumt sich dann auf) */ events = { once: (_n: string, _f: () => void): void => {} }; nah: { text: string; tat: () => void } | null = null;
  figur!: FigurLeinwand; marke!: THREE.Mesh; schild = document.createElement("div"); private blende = document.createElement("div");
  private stick: { id: number; x: number; y: number; t: number; weit: number } | null = null; private naechst = Infinity; private stillstand = 0; private gemerkt = 0; private vonTor: { x: number; y: number } | null = null;

  async start(behaelter: HTMLElement, fertig: () => void): Promise<void> {
    try { const h = localStorage.getItem("ez_held") || ""; if (HELDEN[h]) this.held = h; } catch { /* privat */ }
    const w = (await (await fetch(WELT.daten + "welt.json?t=" + Math.floor(Date.now() / 60000))).json()) as WeltIndex; WELT.stand = w.stand || "";
    for (const g of WELT.gesperrteRegionen) delete w.regionen[g]; this.index = w;
    for (const r of Object.values(w.regionen)) for (let j = 0; j < r.region.chunks[1]; j++) for (let i = 0; i < r.region.chunks[0]; i++) this.gueltig.add(chunkName(r.region.ursprung[0] + i, r.region.ursprung[1] + j));
    const s = this.startPunkt(); this.ort = { ...s }; await this.strom(true); const frei = this.raster.naechstFrei(s); if (frei) this.ort = { x: frei.x, y: frei.y };
    document.body.classList.add("dorf", "stadt", "welt3d"); $("#ez-dorf-titel").style.display = "none"; $("#ez-dorf-hilfe").textContent = HANDY ? "Finger ziehen: laufen · tippen: dorthin gehen · zwei Finger: Kamera" : "WASD: laufen · Klick: dorthin gehen · rechte Maustaste: Kamera drehen · Mausrad: Zoom";
    await this.motor.start(behaelter, this.ort.x, this.ort.y);
    const h = aktiverHeld(); this.figur = new FigurLeinwand(this.motor.szene, MODUL[this.held] || "held.krieger", HOEHE, h ? { ...h, ich: true } : null, angelegteEbenen);
    this.marke = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.42, 20), new THREE.MeshBasicMaterial({ color: 0xffe9a8, transparent: true, opacity: 0.85, depthWrite: false })); this.marke.rotation.x = -Math.PI / 2; this.marke.visible = false; this.motor.szene.add(this.marke);
    this.schild.className = "ez-name3d eigen"; document.body.appendChild(this.schild);
    this.blende.id = "ez-blende3d"; document.body.appendChild(this.blende);
    this.eingaben(); this.motor.beimBild = (dt) => this.bild(dt); this.motor.beimKlick = (x, z) => { if (!this.gesperrt) this.gehe(x, z); };
    /* erst die ersten Bilder zeichnen (dabei übersetzt der Browser die Shader – das hält die Seite kurz an), dann mit dem Server verbinden:
       sonst käme die Anmeldung zu spät und der Server schlösse die Verbindung */
    this.motor.r.compile(this.motor.szene, this.motor.kamera); await new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(() => ok(null))));
    this.profil(); anschluss3D.betreten(this);
    (window as unknown as Record<string, unknown>).EZW = Object.assign((window as unknown as { EZW?: object }).EZW || {}, { szene: this, welt3d: this, ort: () => this.ort, raster: this.raster, gehe: (x: number, y: number) => this.gehe(x, y) });
    fertig();
  }

  /* ───────────── Start und Regionen (wie welt/welt.ts) ───────────── */
  startRegion(): string { return this.index.regionen[WELT.start] ? WELT.start : Object.keys(this.index.regionen)[0]; }
  private adresseOhne(...k: string[]) { for (const n of k) P.delete(n); history.replaceState(null, "", location.pathname + (P.toString() ? "?" + P.toString() : "")); }
  startPunkt(): { x: number; y: number } {
    if (P.get("von") === "tor" && this.index.regionen[WELT.tor]) { const t = this.index.regionen[WELT.tor]; try { localStorage.removeItem("ez_welt_pos"); } catch { /* privat */ } this.adresseOhne("von"); this.vonTor = { x: t.start[0][0], y: t.start[0][1] }; }
    if (this.vonTor) { this.gemerkteStelle = true; return this.vonTor; }
    const r = this.index.regionen[this.startRegion()], s = r.start[0], gilt = (x: number, y: number, region?: string) => this.gueltig.has(chunkName(Math.floor(x / C), Math.floor(y / C))) && !(region && WELT.gesperrteRegionen.includes(region));
    { const wx = Number(P.get("wx")), wy = Number(P.get("wy")); if (P.has("wx")) { this.adresseOhne("wx", "wy"); if (Number.isFinite(wx) && Number.isFinite(wy) && gilt(wx, wy)) { this.gemerkteStelle = true; return { x: wx, y: wy }; } } }
    if (P.get("von") === "teleport" || P.get("von") === "tod") { try { localStorage.removeItem("ez_welt_pos"); } catch { /* privat */ } this.gemerkteStelle = true; return { x: s[0], y: s[1] }; }
    try { if (P.get("neu") === "1") localStorage.removeItem("ez_welt_pos"); const p = JSON.parse(localStorage.getItem("ez_welt_pos") || "null"); if (Array.isArray(p) && gilt(p[0], p[1], p[2])) { this.gemerkteStelle = true; return { x: p[0], y: p[1] }; } } catch { /* privat */ }
    return { x: s[0], y: s[1] };
  }
  regionBei(x: number, y: number): RegionKopf | null { const cx = Math.floor(x / C), cy = Math.floor(y / C);
    for (const r of Object.values(this.index.regionen)) { const [ux, uy] = r.region.ursprung, [b, h] = r.region.chunks; if (cx >= ux && cy >= uy && cx < ux + b && cy < uy + h) return r; } return null; }
  regionZeigen() { const r = this.regionBei(this.ort.x, this.ort.y), id = r ? r.region.id : ""; if (id === this.hier) return; this.hier = id; if (!r) return;
    anschluss3D.regionWechsel(this, r.region); WELT.hud.titel(r.region.name, r.region.untertitel || "Splitterlande");
    const k = $("#ez-karte"); k.style.backgroundImage = `url(${weltDatei("karte-" + id + ".webp")})`; k.style.aspectRatio = `${r.region.chunks[0]} / ${r.region.chunks[1]}`; (k.querySelector("span") as HTMLElement).textContent = r.region.name; }
  profil() { WELT.hud.profil(this.held); WELT.hud.karte(); const h = this.hier; this.hier = ""; this.regionZeigen(); if (!this.hier) this.hier = h; anschluss3D.menue(this); }

  /* ───────────── Gehraster: die Daten der Chunks um den Helden ───────────── */
  async strom(warten = false): Promise<void> {
    const cx = Math.floor(this.ort.x / C), cy = Math.floor(this.ort.y / C), auftraege: Promise<void>[] = [];
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const n = chunkName(cx + dx, cy + dy); if (!this.gueltig.has(n) || this.daten.has(n)) continue; this.daten.set(n, "holt");
      auftraege.push(fetch(weltDatei(n + ".json")).then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json() as Promise<ChunkDaten>; })
        .then((d) => { if (this.daten.get(n) !== "holt") return; this.daten.set(n, d); this.raster.dazu(d); for (const [x0, y0, x1, y1] of WELT.sperren) this.raster.sperren(x0, y0, x1, y1); })
        .catch(() => { this.daten.delete(n); })); }
    for (const [n, d] of this.daten) if (d !== "holt" && Math.max(Math.abs(d.cx - cx), Math.abs(d.cy - cy)) > 3) { this.daten.delete(n); this.raster.weg_damit(d.cx, d.cy); }
    if (warten) await Promise.all(auftraege);
  }

  /* ───────────── Eingaben ───────────── */
  /** Richtung am Bildschirm (x rechts, y unten) → in der Welt, je nach Drehung der Kamera */
  private welt(ix: number, iy: number): [number, number] { const g = this.motor.gieren; return [ix * Math.cos(g) + iy * Math.sin(g), -ix * Math.sin(g) + iy * Math.cos(g)]; }
  private eingaben() {
    const taste = (ev: KeyboardEvent, an: boolean) => { const k = ev.key.toLowerCase(); if (!["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) return;
      if ((ev.target as HTMLElement).closest && (ev.target as HTMLElement).closest("input, textarea, select")) return; ev.preventDefault(); this.tasten[k] = an; const t = this.tasten;
      this.rx = (t.d || t.arrowright ? 1 : 0) - (t.a || t.arrowleft ? 1 : 0); this.ry = (t.s || t.arrowdown ? 1 : 0) - (t.w || t.arrowup ? 1 : 0); };
    addEventListener("keydown", (ev) => { if (!ev.repeat && !this.gesperrt) taste(ev, true); if ((ev.key === "e" || ev.key === "E" || ev.key === "Enter") && !ev.repeat && this.nah && !this.gesperrt && !(ev.target as HTMLElement).closest?.("input, textarea")) this.nah.tat(); });
    addEventListener("keyup", (ev) => taste(ev, false)); addEventListener("blur", () => { this.tasten = {}; this.rx = 0; this.ry = 0; });
    const el = this.motor.r.domElement, finger = new Set<number>();
    el.addEventListener("pointerdown", (e) => { if (e.pointerType === "touch") finger.add(e.pointerId); if (finger.size > 1) { this.stickWeg(); return; }
      if (e.button !== 0 || this.stick || this.gesperrt) return; this.stick = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), weit: 0 };
      if (e.pointerType === "touch") { const s = $("#ez-stick"); s.hidden = false; s.style.left = e.clientX + "px"; s.style.top = e.clientY + "px"; ($("#ez-stick i") as HTMLElement).style.transform = "translate(-50%, -50%)"; } });
    el.addEventListener("pointermove", (e) => { const st = this.stick; if (!st || e.pointerId !== st.id) return; const dx = e.clientX - st.x, dy = e.clientY - st.y, l = Math.hypot(dx, dy), m = 46; st.weit = Math.max(st.weit, l); if (e.pointerType !== "touch") return;
      ($("#ez-stick i") as HTMLElement).style.transform = `translate(calc(-50% + ${dx / Math.max(l, 1) * Math.min(l, m)}px), calc(-50% + ${dy / Math.max(l, 1) * Math.min(l, m)}px))`;
      if (l < 8) { this.rx = 0; this.ry = 0; } else { const k = Math.min(1, l / m); this.rx = dx / l * k; this.ry = dy / l * k; } });
    const los = (e: PointerEvent) => { finger.delete(e.pointerId); const st = this.stick; if (!st || e.pointerId !== st.id) return;
      if (st.weit < 12 && performance.now() - st.t < 450) { const b = this.motor.boden(e.clientX, e.clientY); if (!(b && anschluss3D.kampfAntippen(b.x, b.z)) && !anschluss3D.antippen(this, e.clientX, e.clientY)) this.motor.klick(e.clientX, e.clientY); } const touch = e.pointerType === "touch"; this.stickWeg(); if (touch) { this.rx = 0; this.ry = 0; } };
    el.addEventListener("pointerup", los); el.addEventListener("pointercancel", los);
    $("#ez-dorf-knopf").onclick = () => { if (this.nah && !this.gesperrt) this.nah.tat(); };
  }
  private stickWeg() { if (this.stick) { this.stick = null; $("#ez-stick").hidden = true; this.rx = 0; this.ry = 0; } }

  /* ───────────── Spielablauf ───────────── */
  gehe(x: number, y: number) { if (this.gesperrt) return; const w = this.raster.weg(this.ort, { x, y }, RADIUS); this.pfad = w; this.naechst = Infinity; this.stillstand = 0;
    if (w.length) { const z = w[w.length - 1]; this.marke.position.set(z.x, this.motor.hoehe(z.x, z.y) + 0.06, z.y); this.marke.visible = true; } else this.marke.visible = false; }
  halt() { this.rx = 0; this.ry = 0; this.tasten = {}; this.pfad = []; if (this.marke) this.marke.visible = false; this.stickWeg(); }
  abblenden(ms: number, dann: () => void) { this.blende.style.transitionDuration = ms + "ms"; this.blende.classList.add("an"); setTimeout(dann, ms + 20); }
  private aufblenden(ms: number) { this.blende.style.transitionDuration = ms + "ms"; this.blende.classList.remove("an"); }
  /** Riss und andere Szenen des Spiels: die Seite startet sie (die 3D-Welt hat keine Phaser-Szenen) */
  /* ───────────── für die gemeinsame Anbindung (anschluss.ts WeltKern) ───────────── */
  private beginn = performance.now();
  kampfNeu(region: string, wx: number, wy: number, gefallen: () => void, wartend: boolean) { return new WeltKampf3D(this, region, wx, wy, gefallen, wartend); }
  mitspielerNeu(o: { versatz: { x: number; y: number }; karte: { breit: number; hoch: number } }) { return new Mitspieler3D(this.motor, o); }
  eigeneBlase(text: string) { blase3d(this.motor, () => ({ x: this.ort.x, y: this.motor.hoehe(this.ort.x, this.ort.y) + HOEHE + 0.9, z: this.ort.y }), text); }
  seit() { return performance.now() - this.beginn; }
  versetzen(x: number, y: number) { this.halt(); this.ort = { x, y }; this.motor.springen(x, y); void this.strom(); }
  blick() { return this.figur ? this.figur.blickWinkel : 0; }
  szeneStarten(key: string, daten: object) { if (key === "spiel") { const d = daten as { held?: string }; try { if (d.held) localStorage.setItem("ez_held", d.held); } catch { /* privat */ } location.href = "./?los=1" + serverZusatz(); } }
  springen(x: number, y: number) { if (this.gesperrt) return; anschluss3D.springen(); this.halt(); this.gesperrt = true;
    this.abblenden(260, () => { this.ort = { x, y }; this.motor.springen(x, y); void this.strom(true).then(() => { const f = this.raster.naechstFrei(this.ort); if (f) this.ort = { x: f.x, y: f.y }; this.aufblenden(320); this.gesperrt = false; }); }); }
  umsehen() {
    const o = this.ort, r = this.regionBei(o.x, o.y); let nah: { text: string; tat: () => void } | null = null;
    if (r) for (const a of r.ausgaenge) if (inZone(a.zone, o.x, o.y)) nah = { text: a.text, tat: () => this.reisen(a) };
    const cx = Math.floor(o.x / C), cy = Math.floor(o.y / C);
    for (let dy = -1; dy <= 1 && !nah; dy++) for (let dx = -1; dx <= 1 && !nah; dx++) { const d = this.daten.get(chunkName(cx + dx, cy + dy)); if (!d || d === "holt") continue;
      for (const a of d.interaktionen) if (Math.hypot(a.x - o.x, a.y - o.y) <= a.radius) { nah = this.interaktion(a); break; } }
    if ((nah ? nah.text : "") !== (this.nah ? this.nah.text : "")) { const kn = $("#ez-dorf-knopf"); kn.classList.remove("bald"); kn.hidden = !nah; if (nah) kn.textContent = nah.text + (HANDY ? "" : "  [E]"); }
    this.nah = nah;
  }
  interaktion(a: Interaktion): { text: string; tat: () => void } | null {
    const text = a.daten && typeof a.daten.text === "string" ? a.daten.text : "", tat = a.daten && typeof a.daten.tat === "string" ? a.daten.tat : "", knopf = a.daten && typeof a.daten.knopf === "string" ? a.daten.knopf : "";
    const ziel = a.daten && Array.isArray(a.daten.ziel) && a.daten.ziel.length === 2 ? (a.daten.ziel as number[]) : null;
    if (ziel) return { text: knopf || "Hinabsteigen", tat: () => this.springen(ziel[0], ziel[1]) };
    if (tat) return { text: anschluss3D.knopf(tat, knopf || "Betreten"), tat: () => anschluss3D.tat(tat, this) };
    if (text) return { text: "Ansehen", tat: () => { const el = $("#ez-dorf-hilfe"); el.textContent = text; el.style.display = ""; } };
    return null;
  }
  reisen(a: Ausgang) {
    if (WELT.ausgang && WELT.ausgang(a)) return;
    try { localStorage.removeItem("ez_welt_pos"); } catch { /* privat */ }
    const z = a.nach; if (z.art === "welt") { const r = this.index.regionen[z.region]; if (!r) return; const x = z.x + r.region.ursprung[0] * C, y = z.y + r.region.ursprung[1] * C; this.halt(); this.ort = { x, y }; this.motor.springen(x, y); void this.strom(); return; }
    this.gesperrt = true; location.href = z.art === "kampf" ? `./?ort=${encodeURIComponent(z.ort)}&kampf=${encodeURIComponent(z.kampf)}` : z.ort === "waldmark" ? "./?von=tor" : `./?ort=${encodeURIComponent(z.ort)}&eingang=1`;
  }

  private vorher = { x: 0, y: 0 }; /** im Kampfgebiet: läuft der Held (vom Server bewegt)? */ private laeuftFremd = false;
  private letzterStrom = 0; /** gerechnete Spielzeit in s (für Prüfungen) */ simZeit = 0;
  private bild(dt: number) { this.simZeit += dt;
    const o = this.ort, D = HELDEN[this.held]; let [rx, ry] = this.gesperrt ? [0, 0] : this.welt(this.rx, this.ry);
    if (Math.hypot(rx, ry) > 0.05) { this.pfad = []; this.marke.visible = false; }
    else if (this.pfad.length) { const z = this.pfad[0], dx = z.x - o.x, dy = z.y - o.y, l = Math.hypot(dx, dy);
      if (l < this.naechst - 0.03) { this.naechst = l; this.stillstand = 0; } else this.stillstand += dt;
      if (l < 0.12 || this.stillstand > 0.6) { this.pfad.shift(); this.naechst = Infinity; this.stillstand = 0; if (!this.pfad.length) this.marke.visible = false; } else { rx = dx / l; ry = dy / l; } }
    const l = Math.hypot(rx, ry), faehrt = l > 0.05, vorher = { x: o.x, y: o.y };
    const fremd = anschluss3D.fremd(this, faehrt ? rx : 0, faehrt ? ry : 0); /* im Kampfgebiet bewegt der Server den Helden (der Kampf setzt this.ort) */
    if (faehrt && !fremd) { const k = Math.min(1, l) / l, e = { x: o.x + rx * k * D.tempo * dt, y: o.y + ry * k * D.tempo * dt, r: RADIUS }; this.raster.schieben(e); o.x = e.x; o.y = e.y; }
    if (faehrt) this.figur.blick(rx, ry);
    this.laeuft = fremd ? this.laeuftFremd : faehrt; this.figur.setze(this.schildHoch ? (this.laeuft ? "schild_laufen" : "block") : this.laeuft ? "laufen" : "ruhe");
    this.vorher = vorher;
    const y = this.motor.hoehe(o.x, o.y); this.motor.held.x = o.x; this.motor.held.z = o.y; this.figur.stelle(o.x, y, o.y); this.figur.schritt(dt * 1000, this.motor.gieren); this.marke.rotation.z += dt;
    if (performance.now() - this.letzterStrom > 400) { this.letzterStrom = performance.now(); void this.strom(); }
    this.umsehen(); this.regionZeigen();
    { const r = this.regionBei(o.x, o.y), pk = $("#ez-karte-punkt"); if (r && pk) { pk.style.left = (100 * (o.x / C - r.region.ursprung[0]) / r.region.chunks[0]) + "%"; pk.style.top = (100 * (o.y / C - r.region.ursprung[1]) / r.region.chunks[1]) + "%"; } }
    if (performance.now() - this.gemerkt > 2000) { this.gemerkt = performance.now(); try { localStorage.setItem("ez_welt_pos", JSON.stringify([Math.round(o.x * 100) / 100, Math.round(o.y * 100) / 100, this.hier])); } catch { /* privat */ } }
    { const t = schildText(this.held); if (this.schild.textContent !== t) this.schild.textContent = t; const p = this.motor.bildschirm(o.x, y + HOEHE + 0.35, o.y);
      this.schild.hidden = !p; if (p) this.schild.style.transform = `translate(${Math.round(p.x)}px, ${Math.round(p.y)}px) translate(-50%, -100%)`; }
    anschluss3D.schritt(this, dt);
    { const dx = this.ort.x - this.vorher.x, dy = this.ort.y - this.vorher.y; this.laeuftFremd = Math.hypot(dx, dy) > 0.4 * dt; if (this.laeuftFremd && !this.pfad.length && Math.hypot(this.rx, this.ry) < 0.05) this.figur.blick(dx, dy); } /* vom Server bewegt: Blick in Laufrichtung */
  }
}
