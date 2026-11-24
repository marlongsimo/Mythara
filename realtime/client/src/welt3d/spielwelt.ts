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
import { chatSystem, fluestern, ichName, untersuchtMelden } from "../welt";
import { MONSTER } from "../../../shared/config";
import { aktionsMenue, menueZu, FARBE, Gruppe } from "../aktionsmenue";
import { freundHinzufuegen } from "../freunde";
import { gegenstandUntersuchen } from "../rahmen";
import { SPRINT_MIN } from "../../../shared/sprint";
import { GEHEN_TEMPO, schrittLaenge, inMitte, mitte, richtungsSchritt, schrittFrei } from "../../../shared/feld";
import { AUSDAUER } from "../sprintzustand";
import { levelAus } from "../../../shared/kampfwerte";
import { skillsLesen } from "../skills";
import { gelbAnzeigen } from "./oberflaeche";
import { QuestWelt } from "./quest3d";
import { dialogOffen, gespraechMit, schliessen as dialogSchliessen } from "../dialog";
/** So weit darf man sich während eines Gesprächs entfernen (Felder) */
const GESPRAECH_WEIT = 5;
import { HaendlerWelt } from "./haendler3d";
import { BankWelt } from "./bank3d";
import { HolzWelt } from "./holz3d";
import { BergWelt } from "./berg3d";
import { bankZeigen } from "../bank";
import { istBankschalter } from "../../../shared/bank";
import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { vorlage } from "./held3d";
import { Welt3D } from "./motor";
import { heldenFigur3D, FigurArt } from "./held3d";
import { WELT, weltDatei } from "../welt/welt";
import { anschluss3D, schildText, WeltKern } from "../welt/anschluss";
import { HELDEN } from "../../../shared/config";
import { WeltRaster } from "../../../shared/welt/raster";
import { CHUNK_FELDER, chunkName, inZone } from "../../../shared/welt/typen";
/** Eine Stelle, an der man etwas tun kann: wohin gehen, was der Knopf sagt, was passiert und ob man schon dort ist */
interface Stelle { /** eine Figur zum Reden (kurz antippen: nur hingehen, reden über lange drücken) */ npc?: boolean; x: number; y: number; text: string; tat: () => void; da: () => boolean; /** mehrere Knöpfe untereinander (z. B. je Gegenstand am Boden und „Alles aufheben“) */ knoepfe?: { text: string; tat: () => void }[]; /** weitere Aktionen im Aktionsmenü nach der ersten (Händler: „Laden ansehen“) */ mehr?: { text: string; sym: string; tat: () => void }[] }
import type { ChunkDaten, Region, Ausgang, Spawnzone, Interaktion } from "../../../shared/welt/typen";
import { aktiverHeld } from "../held";
import { angelegteEbenen } from "../inventar";
import { serverZusatz } from "../gruppe";
import { karteDrehen } from "../rahmen";
/** die Minikarte zeichnet einen größeren Ausschnitt als sichtbar (Rand zum Verschieben und Drehen bis zum nächsten Zeichnen) */
const KARTE_RAND = 1.5, HANDY_KARTE = matchMedia("(pointer: coarse)").matches;
import { Mitspieler3D, blase3d, schildAn } from "./mitspieler";
import { WeltKampf3D } from "./kampf3d";
import { bodenListe, aufheben, BodenDing } from "../welt";
import { GEGENSTAENDE, SELTENHEITEN } from "../../../shared/gegenstaende";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
/** 3D-Modelle für Gegenstände am Boden (einmal laden, dann klonen) */
const modelle = new Map<string, Promise<THREE.Object3D>>();
const modellLaden = (pfad: string): Promise<THREE.Object3D> => { let p = modelle.get(pfad); if (!p) { p = new GLTFLoader().loadAsync("../" + pfad).then((g) => g.scene); modelle.set(pfad, p); p.catch(() => modelle.delete(pfad)); } return p; };

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
  figur!: FigurArt; marke!: THREE.Mesh; schild = document.createElement("div"); private blende = document.createElement("div");
  private stick: { id: number; x: number; y: number; t: number; weit: number; menue?: boolean } | null = null; private zugX = 0; private zugY = 0; private naechst = Infinity; private stillstand = 0; private gemerkt = 0; private vonTor: { x: number; y: number } | null = null;

  async start(behaelter: HTMLElement, fertig: () => void): Promise<void> {
    try { const h = localStorage.getItem("ez_held") || ""; if (HELDEN[h]) this.held = h; } catch { /* privat */ }
    const w = (await (await fetch(WELT.daten + "welt.json?t=" + Math.floor(Date.now() / 60000))).json()) as WeltIndex; WELT.stand = w.stand || "";
    for (const g of WELT.gesperrteRegionen) delete w.regionen[g]; this.index = w;
    for (const r of Object.values(w.regionen)) for (let j = 0; j < r.region.chunks[1]; j++) for (let i = 0; i < r.region.chunks[0]; i++) this.gueltig.add(chunkName(r.region.ursprung[0] + i, r.region.ursprung[1] + j));
    const s = this.startPunkt(); this.ort = { ...s }; await this.strom(true); const frei = this.raster.naechstFrei(s); if (frei) this.ort = { x: frei.x, y: frei.y };
    document.body.classList.add("dorf", "stadt", "welt3d"); $("#ez-dorf-titel").style.display = "none"; $("#ez-dorf-hilfe").textContent = HANDY ? "Tippen: dorthin gehen · ziehen: Kamera drehen · zwei Finger: Zoom" : "Klick: dorthin gehen · ziehen: Kamera drehen · Mausrad: Zoom";
    await this.motor.start(behaelter, this.ort.x, this.ort.y);
    const h = aktiverHeld(); this.figur = heldenFigur3D(this.motor.szene, MODUL[this.held] || "held.krieger", HOEHE, h ? { ...h, ich: true } : null, angelegteEbenen); /* eigener Held: 3D-Modell */
    this.marke = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.42, 20), new THREE.MeshBasicMaterial({ color: 0xffe9a8, transparent: true, opacity: 0.85, depthWrite: false })); this.marke.rotation.x = -Math.PI / 2; this.marke.visible = false; this.motor.szene.add(this.marke);
    this.schild.className = "ez-name3d eigen"; this.motor.schilder.appendChild(this.schild);
    this.blende.id = "ez-blende3d"; document.body.appendChild(this.blende);
    { /* nach dem Drehen (hoch ↔ quer) die Seite auf null zurück und die 3D-Ansicht neu messen – iOS meldet die neue Größe verzögert */
      const neu = () => { scrollTo(0, 0); this.motor.groesse(); }, spaeter = () => { neu(); for (const t of [120, 350, 800]) setTimeout(neu, t); };
      addEventListener("orientationchange", spaeter); addEventListener("resize", spaeter); if (window.visualViewport) window.visualViewport.addEventListener("resize", spaeter); }
    this.eingaben(); this.motor.beimBild = (dt) => this.bild(dt); this.motor.beimKlick = (x, z) => { if (!this.gesperrt) this.gehe(x, z); };
    /* erst die ersten Bilder zeichnen (dabei übersetzt der Browser die Shader – das hält die Seite kurz an), dann mit dem Server verbinden:
       sonst käme die Anmeldung zu spät und der Server schlösse die Verbindung */
    this.motor.r.compile(this.motor.szene, this.motor.kamera); await new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(() => ok(null))));
    if (new URLSearchParams(location.search).get("vorwaermen") !== "0") setTimeout(() => void this.vorwaermen(), 2500); /* Gegner- und Wachenmodelle im Hintergrund laden und ihre Shader übersetzen: kein Haken beim ersten Gegner */
    this.quest = new QuestWelt(this); this.sperrenNeu(); /* Quest 01 (shared/quest01.ts) */
    this.haendler = new HaendlerWelt(this); /* Händler am Marktplatz (shared/laeden.ts) */
    this.bank = new BankWelt(this); /* Bankmitarbeiter hinter den Bankschaltern (shared/bank.ts) */
    this.holz = new HolzWelt(this); /* Holzfällerei: Bäume auf den Lichtungen (shared/holz.ts) */
    this.berg = new BergWelt(this); /* Bergbau: Erzadern in den Senken (shared/bergbau.ts) */
    addEventListener("ez-getrunken", () => { const f = this.figur as { trinken?: () => number }; if (f.trinken) f.trinken(); }); /* Trank: Hand zum Mund */
    addEventListener("keydown", (e) => { if (e.key === "Shift" && !e.repeat && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) this.sprint(); }); /* Umschalt: Sprint an/aus */
    addEventListener("ez-zurueck", (e) => { const m = (e as CustomEvent).detail as { x: number; y: number }; if (typeof m.x === "number" && typeof m.y === "number") this.springen(m.x, m.y); }); /* ohne Freigabe hinter der Sperre: zurück */
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

  /* ───────────── Sprint (Sprintkonzept v1): +30 % Tempo, Ausdauer in der gelben Leiste ───────────── */
  ausdauer = AUSDAUER; private imKampf = false; private geschickLv = 1; private geschickZeit = 0; private gelbZuletzt = -1;
  /** Sprint an/aus (Knopf an der Minikarte, Umschalttaste) */
  sprint() { if (!this.ausdauer.an && this.ausdauer.wert < SPRINT_MIN) { chatSystem(`Zu erschöpft – sprinten geht wieder ab ${SPRINT_MIN} % Ausdauer.`); return; } this.ausdauer.umschalten(); this.sprintKnopf(); window.dispatchEvent(new CustomEvent("ez-sprint")); }
  private knopfAn: boolean | null = null;
  private sprintKnopf() { document.querySelectorAll<HTMLElement>('[aria-label="Sprint"]').forEach((b) => { b.classList.toggle("an", this.ausdauer.an); b.setAttribute("aria-pressed", String(this.ausdauer.an)); }); }
  private sprintSchritt(dt: number, laeuft: boolean) { const jetzt = performance.now(); if (jetzt - this.geschickZeit > 2000) { this.geschickZeit = jetzt; this.geschickLv = levelAus(skillsLesen().geschick, "geschick"); }
    if (!this.imKampf) this.ausdauer.schritt(dt, laeuft, this.geschickLv); /* im Kampfgebiet rechnet der Server */ if (this.knopfAn !== this.ausdauer.an) { this.knopfAn = this.ausdauer.an; this.sprintKnopf(); } /* auch wenn der Server umschaltet oder der Knopf neu gebaut wurde */
    const w = Math.round(this.ausdauer.wert); if (w !== this.gelbZuletzt) { this.gelbZuletzt = w; gelbAnzeigen(w / 100); } }
  /** Shader vorwärmen: die Modelle einmal unsichtbar-klein unter den Boden stellen, übersetzen lassen (parallel, wenn der Browser es kann), wieder entfernen */
  private async vorwaermen(): Promise<void> {
    const M = this.motor, g = new THREE.Group(); g.position.set(this.ort.x, M.hoehe(this.ort.x, this.ort.y) - 30, this.ort.y); g.scale.setScalar(0.01);
    for (const d of ["bandit3d", "mooshocker3d", "waldgolem3d", "banditenboss3d", "stadtwache3d"]) { try { const v = await vorlage(d); const k = SkeletonUtils.clone(v.szene); k.traverse((o) => { o.frustumCulled = false; if ((o as THREE.Mesh).isMesh) o.castShadow = true; }); g.add(k); } catch { /* fehlt: dann eben beim ersten Auftritt */ } }
    if (!g.children.length) return; M.szene.add(g);
    try { const r = M.r as THREE.WebGLRenderer & { compileAsync?: (s: THREE.Object3D, k: THREE.Camera, z?: THREE.Scene) => Promise<unknown> }; if (r.compileAsync) await r.compileAsync(g, M.kamera, M.szene); else r.compile(g, M.kamera, M.szene); } catch { /* egal */ }
    await new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(() => ok(null)))); /* einmal mitzeichnen (auch in die Schattenkarte) */ M.szene.remove(g); }
  /* ───────────── Quest 01: Figuren, Baumstämme, persönliche Sperre ───────────── */
  quest: QuestWelt | null = null; haendler: HaendlerWelt | null = null; bank: BankWelt | null = null; holz: HolzWelt | null = null; berg: BergWelt | null = null;
  alleSperren(): number[][] { return [...WELT.sperren, ...(this.quest ? this.quest.sperren() : [])]; }
  /** Sperren haben sich geändert (die Wachen lassen den Spieler durch): Gehraster der geladenen Chunks neu aufbauen */
  sperrenNeu() { for (const d of this.daten.values()) if (d !== "holt") this.raster.dazu(d); for (const [x0, y0, x1, y1] of this.alleSperren()) this.raster.sperren(x0, y0, x1, y1); }
  /* ───────────── Gehraster: die Daten der Chunks um den Helden ───────────── */
  async strom(warten = false): Promise<void> {
    const cx = Math.floor(this.ort.x / C), cy = Math.floor(this.ort.y / C), auftraege: Promise<void>[] = [];
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const n = chunkName(cx + dx, cy + dy); if (!this.gueltig.has(n) || this.daten.has(n)) continue; this.daten.set(n, "holt");
      auftraege.push(fetch(weltDatei(n + ".json")).then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json() as Promise<ChunkDaten>; })
        .then((d) => { if (this.daten.get(n) !== "holt") return; this.daten.set(n, d); this.raster.dazu(d); for (const [x0, y0, x1, y1] of this.alleSperren()) this.raster.sperren(x0, y0, x1, y1); })
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
    void taste; /* kein Laufen mit WASD/Pfeiltasten mehr – nur Klicken/Tippen (wie OSRS) */
    addEventListener("keydown", (ev) => { if ((ev.key === "e" || ev.key === "E" || ev.key === "Enter") && !ev.repeat && this.nah && !this.gesperrt && !(ev.target as HTMLElement).closest?.("input, textarea")) this.nah.tat(); });
    addEventListener("blur", () => { this.tasten = {}; this.rx = 0; this.ry = 0; });
    const el = this.motor.r.domElement, finger = new Set<number>();
    /* Tippen/Klicken = dorthin gehen · mit einem Finger oder der Maus ziehen = Kamera drehen und neigen · zwei Finger = Zoom (das macht der Motor) */
    el.addEventListener("pointerdown", (e) => { if (e.pointerType === "touch") finger.add(e.pointerId); if (finger.size > 1) { this.stick = null; return; }
      if (e.button !== 0 || this.stick) return; menueZu(); this.stick = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp, weit: 0 }; /* Zeit des Ereignisses, nicht der Verarbeitung: ein Ruckler macht aus einem kurzen Tippen kein langes */
      { const st = this.stick; window.setTimeout(() => { if (this.stick === st && st.weit < 10 && !this.gesperrt) { st.menue = true; this.menueBei(st.x, st.y); } }, 450); } /* lange drücken = Aktionsmenü */ this.zugX = e.clientX; this.zugY = e.clientY; try { el.setPointerCapture(e.pointerId); } catch { /* egal */ } });
    el.addEventListener("pointermove", (e) => { const st = this.stick; if (!st || e.pointerId !== st.id || finger.size > 1) return; st.weit = Math.max(st.weit, Math.hypot(e.clientX - st.x, e.clientY - st.y));
      if (st.weit < 10) return; const m = this.motor, dx = e.clientX - this.zugX, dy = e.clientY - this.zugY; this.zugX = e.clientX; this.zugY = e.clientY;
      m.gieren -= dx * 0.006; m.neigen = Math.max(0.42, Math.min(1.35, m.neigen + dy * 0.004)); });
    const los = (e: PointerEvent) => { finger.delete(e.pointerId); const st = this.stick; if (!st || e.pointerId !== st.id) return; this.stick = null; if (st.menue) return;
      if (st.weit < 12 && e.timeStamp - st.t < 500 && !this.gesperrt) { const b = this.motor.boden(e.clientX, e.clientY);
        /* kurz tippen / Linksklick = die erste Aktion (wie OSRS): an einer Stelle mit Handlung (Figur, Treppe, Tür, Ausgang, Gegenstand) hingehen und handeln */
        const stelle = this.stelleAmSchirm(e.clientX, e.clientY, true) || (b ? this.anStelle(b.x, b.z) : null); if (stelle && stelle.npc) { this.wahlWeg(); this.gehe(stelle.x, stelle.y); return; } /* Quest-NPC: kurz = nur hingehen (reden: lange drücken) */ if (stelle) /* kurz: Figuren als ganze Gestalt, Türen/Treppen nur am Boden – sonst erst dorthin gehen */ { this.ausfuehren(stelle, stelle.knoepfe ? stelle.knoepfe[stelle.knoepfe.length - 1].tat : stelle.tat); return; } this.wahlWeg();
        if (anschluss3D.kampfAntippenSchirm(e.clientX, e.clientY) || (b && anschluss3D.kampfAntippen(b.x, b.z))) return; /* Gegner: ganze Figur, sonst der Boden darunter */
        if (anschluss3D.spielerBei(e.clientX, e.clientY)) { this.menueBei(e.clientX, e.clientY); return; } /* Mitspieler: gleich das Menü (Flüstern, Freund hinzufügen …) */
        this.motor.klick(e.clientX, e.clientY); } };
    /* PC: Rechtsklick = Aktionsmenü – aber nicht, wenn mit der rechten Maustaste die Kamera gedreht wurde */
    let rechts: { x: number; y: number; weit: number } | null = null;
    el.addEventListener("pointerdown", (e) => { if (e.button === 2) rechts = { x: e.clientX, y: e.clientY, weit: 0 }; });
    el.addEventListener("pointermove", (e) => { if (rechts) rechts.weit = Math.max(rechts.weit, Math.hypot(e.clientX - rechts.x, e.clientY - rechts.y)); });
    el.addEventListener("pointerup", (e) => { if (e.button === 2 && rechts) { if (rechts.weit > 8) menueZu(); rechts = null; } });
    el.addEventListener("contextmenu", (e) => { e.preventDefault(); if (!this.gesperrt && !(rechts && rechts.weit > 8)) this.menueBei(e.clientX, e.clientY); });
    el.addEventListener("pointerup", los); el.addEventListener("pointercancel", los);
    $("#ez-dorf-knopf").onclick = () => { if (this.nah && !this.gesperrt) this.nah.tat(); };
    /* Antippen auf der Minikarte: dorthin gehen (die Karte zeigt die Region, in der man steht; daneben die Nachbarregionen) */
    { let ab: { x: number; y: number } | null = null; const auf = (e: Event) => { const t = e.target as HTMLElement; return t.closest && !t.closest("button, .rknoepfe") ? t.closest("#ez-karte") || (t.closest(".rund") && (t.closest(".rund") as HTMLElement).querySelector("#ez-karte") ? t.closest(".rund") : null) : null; };
      document.addEventListener("pointerdown", (e) => { ab = auf(e) ? { x: e.clientX, y: e.clientY } : null; }, true);
      document.addEventListener("pointerup", (e) => { if (!ab || !auf(e) || Math.hypot(e.clientX - ab.x, e.clientY - ab.y) > 10 || this.gesperrt) { ab = null; return; } ab = null; const r = this.regionBei(this.ort.x, this.ort.y), k = $("#ez-karte"); if (!r || !k) return;
        const rund = k.parentElement as HTMLElement, b = rund.getBoundingClientRect(), f = k.offsetWidth / (r.region.chunks[0] * C); if (!b.width || !f) return; /* Bildpunkte je Feld */
        const dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2), g = -this.motor.gieren; /* die Karte ist um den Helden gedreht: zurückdrehen */
        this.geheWeit(this.ort.x + (dx * Math.cos(g) - dy * Math.sin(g)) / f, this.ort.y + (dx * Math.sin(g) + dy * Math.cos(g)) / f); }, true); }
  }
  private stickWeg() { if (this.stick) { this.stick = null; $("#ez-stick").hidden = true; this.rx = 0; this.ry = 0; } }

  /* ───────────── Spielablauf ───────────── */
  /** Ein fernes Ziel (Minikarte): ganz hin, wenn der Weg in der geladenen Umgebung liegt – sonst so weit wie möglich in seine Richtung */
  geheWeit(x: number, y: number) { const o = this.ort, d = Math.hypot(x - o.x, y - o.y); if (d < 0.5) return;
    for (const weit of [d, 48, 32, 20, 12]) { if (weit > d) continue; const zx = o.x + (x - o.x) * weit / d, zy = o.y + (y - o.y) * weit / d; const w = this.raster.weg(o, { x: zx, y: zy }, RADIUS, 24, true); if (w.length) { this.gehe(zx, zy); return; } } }
  gehe(x: number, y: number) { if (this.gesperrt) return; const w = this.raster.weg(this.ort, { x, y }, RADIUS, 24, true); this.pfad = w; this.naechst = Infinity; this.stillstand = 0;
    if (w.length) { const z = w[w.length - 1]; this.marke.position.set(z.x, this.motor.hoehe(z.x, z.y) + 0.06, z.y); this.marke.visible = true; } else this.marke.visible = false; }
  halt() { this.rx = 0; this.ry = 0; this.tasten = {}; this.pfad = []; if (this.marke) this.marke.visible = false; this.stickWeg(); }
  teleportAbreise(): number { const f = this.figur as { teleport?: () => number }; return f.teleport ? f.teleport() : 0; }
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
    /* kein Knopf mehr beim Hinlaufen (gehandelt wird über das Antippen der Stelle); [E] bleibt in der Nähe als Abkürzung */
    $("#ez-dorf-knopf").hidden = true; this.nah = nah;
    /* vorgemerkte Handlung: ausführen, sobald man dort ist; wer vorher stehen bleibt oder selbst steuert, lässt sie fallen */
    const v = this.vorhaben; if (v) { if (v.da()) { this.vorhaben = null; if (!this.gesperrt) v.tat(); } else if (!this.pfad.length && !this.schrittZiel) this.vorhaben = null; }
  }
  interaktion(a: Interaktion): { text: string; tat: () => void } | null {
    const text = a.daten && typeof a.daten.text === "string" ? a.daten.text : "", tat = a.daten && typeof a.daten.tat === "string" ? a.daten.tat : "", knopf = a.daten && typeof a.daten.knopf === "string" ? a.daten.knopf : "";
    const ziel = a.daten && Array.isArray(a.daten.ziel) && a.daten.ziel.length === 2 ? (a.daten.ziel as number[]) : null;
    if (istBankschalter(a.id)) return { text: "Bank", tat: () => bankZeigen(a.id === "bankschalter" ? "Bankschalter Weidenhain" : "Bank der Waldmark") }; /* Bankschalter (shared/bank.ts): gleich die Bank, wie in OSRS */
    if (ziel) return { text: /hinauf|hoch/i.test(knopf) ? "Hoch" : /hinab|hinunter|runter/i.test(knopf) ? "Runter" : knopf || "Hinabsteigen", tat: () => this.springen(ziel[0], ziel[1]) };
    if (tat) return { text: anschluss3D.knopf(tat, knopf || "Betreten"), tat: () => anschluss3D.tat(tat, this) };
    if (text) return { text: "Ansehen", tat: () => { const el = $("#ez-dorf-hilfe"); el.textContent = text; el.style.display = ""; } };
    return null;
  }
  /* ───────────── Handeln durch Antippen der Stelle ───────────── */
  private vorhaben: Stelle | null = null; private wahl: { el: HTMLElement; x: number; z: number } | null = null;
  /** Was ist an diesem Bodenpunkt zu tun? Die nächste Interaktion in ihrem Umkreis (mindestens gut ein Feld), sonst ein Ausgang, dessen Zone ihn enthält */
  anStelle(x: number, y: number): Stelle | null {
    { const q = this.quest && this.quest.stelle(x, y); if (q) return q; } /* Questfiguren: „Mit … sprechen“ */
    { const h = this.haendler && this.haendler.stelle(x, y); if (h) return h; } /* Händler am Marktplatz: „Mit … sprechen“, dazu „Laden ansehen“ */
    { const b = this.bank && this.bank.stelle(x, y); if (b) return b; } /* Bankmitarbeiter: „Mit … sprechen“, dazu „Bank“ */
    { const h = this.holz && this.holz.stelle(x, y); if (h) return h; }
    { const b = this.berg && this.berg.stelle(x, y); if (b) return b; } /* Erzadern: „… abbauen“, beim Riss „Riss!“ */ /* Holzfäller-Bäume: „… fällen“, beim Kernschlag „Kernschlag!“ */
    /* Gegenstände am Boden zuerst: antippen → hinlaufen aufs Feld → „Aufheben“ (der Server prüft Sichtbarkeit, das Feld und Platz im Rucksack) */
    { let b: BodenDing | null = null, bd = 1.2; for (const d of bodenListe()) { const w = Math.hypot(d.x - x, d.y - y); if (w <= bd) { bd = w; b = d; } }
      if (b) { const d0 = b, hier = bodenListe().filter((d) => Math.floor(d.x) === Math.floor(d0.x) && Math.floor(d.y) === Math.floor(d0.y)) /* alles auf demselben Feld */, name = (d: BodenDing) => `${GEGENSTAENDE[d.g] ? GEGENSTAENDE[d.g].name : d.g}${d.n > 1 ? " ×" + d.n : ""} aufheben`;
        const da = () => Math.floor(d0.x) === Math.floor(this.ort.x) && Math.floor(d0.y) === Math.floor(this.ort.y) && !this.schrittZiel; /* auf dem Feld des Gegenstands stehen */
        if (hier.length === 1) return { x: d0.x, y: d0.y, text: name(d0), tat: () => aufheben(d0.i, this.ort), da };
        /* mehrere an derselben Stelle: je Gegenstand ein Knopf, ganz unten „Alles aufheben“ */
        return { x: d0.x, y: d0.y, text: "", tat: () => {}, da, knoepfe: [...hier.map((d) => ({ text: name(d), tat: () => aufheben(d.i, this.ort) })), { text: "Alles aufheben", tat: () => aufheben(hier.map((d) => d.i), this.ort) }] }; } }
    const cx = Math.floor(x / C), cy = Math.floor(y / C); let best: Stelle | null = null, bd = Infinity;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const d = this.daten.get(chunkName(cx + dx, cy + dy)); if (!d || d === "holt") continue;
      for (const a of d.interaktionen) { const w = Math.hypot(a.x - x, a.y - y); if (w > Math.max(1.2, a.radius) || w >= bd) continue; const i = this.interaktion(a); if (!i) continue;
        bd = w; best = { x: a.x, y: a.y, text: i.text, tat: i.tat, da: () => Math.hypot(a.x - this.ort.x, a.y - this.ort.y) <= a.radius }; } }
    if (best) return best;
    const r = this.regionBei(x, y); if (r) for (const a of r.ausgaenge) if (inZone(a.zone, x, y)) return { x, y, text: a.text, tat: () => this.reisen(a), da: () => inZone(a.zone, this.ort.x, this.ort.y) };
    return null; }
  /** Was liegt am Bildschirmpunkt? Figuren (Quest, Händler) zählen als ganze Gestalt bis zum Kopf, Treppen, Türen und andere Stellen als
   *  Säule über ihrem Punkt (so trifft auch ein Tipp auf die obere Treppe oder den Türrahmen). Die vorderste gewinnt. */
  stelleAmSchirm(px: number, py: number, nurFiguren = false): Stelle | null {
    const M = this.motor, o = this.ort, kand: { x: number; y: number; h: number; r: number }[] = [];
    for (const p of [...(this.quest ? this.quest.punkte() : []), ...(this.haendler ? this.haendler.punkte() : []), ...(this.bank ? this.bank.punkte() : [])]) kand.push({ ...p, h: 2.2, r: 0.45 });
    if (this.holz) for (const p of this.holz.punkte()) kand.push({ x: p.x, y: p.y, h: p.h, r: 0.8 });
    if (this.berg) for (const p of this.berg.punkte()) kand.push({ x: p.x, y: p.y, h: p.h, r: 0.7 }); /* Erzadern */ /* Holzfäller-Bäume: der ganze Baum zählt */
    const cx = Math.floor(o.x / C), cy = Math.floor(o.y / C);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const d = this.daten.get(chunkName(cx + dx, cy + dy)); if (!d || d === "holt") continue;
      if (!nurFiguren) for (const a of d.interaktionen) if (Math.hypot(a.x - o.x, a.y - o.y) < 30 && this.interaktion(a)) kand.push({ x: a.x, y: a.y, h: 2.6, r: Math.max(0.6, Math.min(2, a.radius * 0.7)) }); }
    let best: { k: (typeof kand)[number]; t: number } | null = null;
    for (const k of kand) { const y = M.hoehe(k.x, k.y), fu = M.bildschirm(k.x, y, k.y), ko = M.bildschirm(k.x, y + k.h, k.y), rand = M.bildschirm(k.x + k.r, y, k.y); if (!fu || !ko || !rand) continue;
      const breit = Math.max(20, Math.abs(rand.x - fu.x), Math.abs(fu.y - ko.y) * 0.35); if (Math.abs(px - fu.x) > breit || py > fu.y + 12 || py < ko.y - 8) continue;
      if (!best || fu.y > best.t) best = { k, t: fu.y }; }
    return best ? this.anStelle(best.k.x, best.k.y) : null; }
  /** Läuft man aus der Reichweite eines Gesprächs, endet es (Quest-Figuren und Händler) */
  private gespraechWeite() { if (!dialogOffen()) return; const wer = gespraechMit(); if (!wer) return;
    const p = wer.startsWith("lokal:") ? ((this.haendler && this.haendler.ortVon(wer.slice(6))) || (this.bank && this.bank.ortVon(wer.slice(6))) || null) : this.quest ? this.quest.ortVon(wer) : null;
    if (p && Math.hypot(p.x - this.ort.x, p.y - this.ort.y) > GESPRAECH_WEIT) { dialogSchliessen(true); chatSystem("Du hast dich entfernt – das Gespräch ist beendet."); } }
  /** Hingehen und dort handeln (ist man schon dort, sofort) */
  ausfuehren(s: Stelle, tat: () => void) { this.wahlWeg(); menueZu(); if (this.gesperrt) return; if (s.da()) { tat(); return; } this.gehe(s.x, s.y); this.vorhaben = this.pfad.length ? { ...s, tat } : null; }
  /** Aktionsmenü (Pergament) für alles an diesem Bildschirmpunkt: Mitspieler, Gegner, Figuren, Gegenstände am Boden, Treppen/Türen/Ausgänge – und „Hierhin gehen“ */
  menueBei(px: number, py: number) { const b = this.motor.boden(px, py), gr: Gruppe[] = [], konto = Boolean(ichName());
    const d = anschluss3D.spielerBei(px, py);
    if (d) gr.push({ kopf: d.n + (d.s ? ` · Lv ${d.s}` : ""), farbe: FARBE.spieler, aktionen: [
      ...(konto && d.s ? [{ text: "Flüstern", sym: "✉️", tat: () => fluestern(d.i, d.n) }, { text: "Freund hinzufügen", sym: "➕", tat: () => { void freundHinzufuegen(d.n).then((t) => { if (t) chatSystem(t); }); } }] : []),
      { text: "Untersuchen", sym: "🔍", tat: () => anschluss3D.spielerKarteZeigen(this, d) }] });
    { const t = anschluss3D.kampfAmSchirm(px, py); if (t && t.team !== 0) { const M = t.typ && !t.held ? (MONSTER[t.typ] as { info?: string } | undefined) : undefined; /* Untersuchen (Bestiarium): Text zum Wesen; der Mooshocker zählt für Quest 02 */
        gr.push({ kopf: `${t.name} · Lv ${t.stufe}`, farbe: FARBE.gegner, aktionen: [{ text: "Angreifen", sym: "⚔️", tat: () => { anschluss3D.kampfAntippenSchirm(px, py); } },
          ...(M && M.info ? [{ text: "Untersuchen", sym: "🔍", tat: () => { chatSystem(`${t.name}: ${M.info}`); window.dispatchEvent(new CustomEvent("ez-qtext", { detail: `${t.name}: ${M.info}` })); untersuchtMelden(t.typ!, { x: this.ort.x, y: this.ort.y }); } }] : [])] }); } /* ganze Figur */
      else if (b) { const g = anschluss3D.kampfZielBei(b.x, b.z); if (g) gr.push({ kopf: g.name, farbe: FARBE.gegner, aktionen: [{ text: "Angreifen", sym: "⚔️", tat: () => { anschluss3D.kampfAntippen(b.x, b.z); } }] }); } }
    if (b) {
      const stBoden = this.stelleAmSchirm(px, py, true) || this.anStelle(b.x, b.z), st = stBoden || this.stelleAmSchirm(px, py), gehenZuerst = !stBoden && Boolean(st); /* ganze Figur; Treppe/Tür auch über ihrer Höhe – dann aber „Hierhin gehen“ zuerst */
      if (st) { const boden = this.bodenHier(b.x, b.z);
        if (boden) gr.push({ kopf: boden.hier.length > 1 ? `Am Boden · ${boden.hier.length} Gegenstände` : (GEGENSTAENDE[boden.d0.g] ? GEGENSTAENDE[boden.d0.g].name : boden.d0.g), farbe: FARBE.ding, liste: true, aktionen: [
          ...boden.hier.map((x) => { const G = GEGENSTAENDE[x.g]; return { text: G ? G.name : x.g, sym: "✋", anzahl: x.n, farbe: G && SELTENHEITEN[G.seltenheit] ? SELTENHEITEN[G.seltenheit].farbe : undefined, tat: () => this.ausfuehren(st, () => aufheben(x.i, this.ort)), lupe: () => gegenstandUntersuchen(x.g) }; }),
          ...(boden.hier.length > 1 ? [{ text: "Alles aufheben", sym: "✋", haupt: true, tat: () => this.ausfuehren(st, () => aufheben(boden.hier.map((x) => x.i), this.ort)) }] : [])] });
        else { const n = /^Mit (.+) sprechen$/.exec(st.text);
          gr.push(n ? { kopf: n[1], farbe: FARBE.figur, aktionen: [{ text: "Sprechen", sym: "💬", tat: () => this.ausfuehren(st, st.tat) }, ...(st.mehr || []).map((m) => ({ text: m.text, sym: m.sym, tat: () => this.ausfuehren(st, m.tat) }))] } : { kopf: st.text, farbe: FARBE.objekt, aktionen: [{ text: st.text, sym: "➜", tat: () => this.ausfuehren(st, st.tat) }] }); } }
      const gehen = { text: "Hierhin gehen", sym: "👣", tat: () => { this.wahlWeg(); this.gehe(b.x, b.z); } };
      if (gehenZuerst) gr.splice(Math.max(0, gr.findIndex((g) => g.farbe === FARBE.objekt || g.farbe === FARBE.figur)), 0, { kopf: "Hier", farbe: FARBE.objekt, aktionen: [gehen] }); else gr.push({ kopf: "", aktionen: [gehen] }); }
    aktionsMenue(px, py, gr); }
  /** Gegenstände am Boden beim Punkt: der nächste (bis gut ein Feld) und alles auf seinem Feld */
  bodenHier(x: number, y: number): { d0: BodenDing; hier: BodenDing[] } | null { let b: BodenDing | null = null, bd = 1.2; for (const d of bodenListe()) { const w = Math.hypot(d.x - x, d.y - y); if (w <= bd) { bd = w; b = d; } }
    if (!b) return null; const d0 = b; return { d0, hier: bodenListe().filter((d) => Math.floor(d.x) === Math.floor(d0.x) && Math.floor(d.y) === Math.floor(d0.y)) }; }
  /** Der kleine Knopf an der Stelle: antippen = hingehen und dort handeln (ist man schon dort, sofort) */
  wahlZeigen(s: Stelle) { this.wahlWeg(); const el = document.createElement("div"); el.className = "ez-wahl3d" + (s.knoepfe ? " mehr" : "");
    for (const ev of ["pointerdown", "pointerup"]) el.addEventListener(ev, (e) => e.stopPropagation());
    for (const k of s.knoepfe || [{ text: s.text, tat: s.tat }]) { const b = document.createElement("button"); b.type = "button"; b.textContent = k.text; el.appendChild(b);
      b.addEventListener("click", (e) => { e.stopPropagation(); this.wahlWeg(); if (this.gesperrt) return; if (s.da()) { k.tat(); return; } this.gehe(s.x, s.y); this.vorhaben = this.pfad.length ? { ...s, tat: k.tat } : null; }); }
    this.wahl = { el, x: s.x, z: s.y }; this.wahlFolgen(); }
  wahlWeg() { if (this.wahl) { this.wahl.el.remove(); this.wahl = null; } }
  /* ───────────── Gegenstände am Boden: ein kleiner Beutel mit Namen ───────────── */
  private bodenBild = new Map<number, { g: THREE.Group; nm: HTMLElement; d: BodenDing }>();
  private bodenZeichnen() { const da = new Set<number>();
    for (const d of bodenListe()) { da.add(d.i); let b = this.bodenBild.get(d.i);
      if (!b && GEGENSTAENDE[d.g] && GEGENSTAENDE[d.g].modell3d) { const g = new THREE.Group(); this.motor.szene.add(g); const nm = document.createElement("div"), G = GEGENSTAENDE[d.g]; nm.className = "ez-name3d boden"; nm.textContent = G.name + (d.n > 1 ? " ×" + d.n : "");
        modellLaden(G.modell3d!).then((m) => { const c = m.clone(true); const box = new THREE.Box3().setFromObject(c), gr = Math.max(0.001, box.max.y - box.min.y); c.scale.setScalar(0.55 / gr); c.traverse((o) => { o.castShadow = true; }); g.add(c); }).catch(() => { /* ohne Modell: nur der Name */ });
        b = { g, nm, d }; this.bodenBild.set(d.i, b); }
      if (!b) { const g = new THREE.Group(), stoff = new THREE.MeshStandardMaterial({ color: 0x8a6236, roughness: 0.9 }), schnur = new THREE.MeshStandardMaterial({ color: 0xd8b25a, roughness: 0.5, metalness: 0.4 });
        const sack = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 10), stoff); sack.scale.set(1, 0.85, 1); sack.position.y = 0.2; const hals = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.12, 0.14, 10), stoff); hals.position.y = 0.43;
        const band = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.022, 6, 14), schnur); band.rotation.x = Math.PI / 2; band.position.y = 0.42; g.add(sack, hals, band); g.traverse((o) => { o.castShadow = true; }); this.motor.szene.add(g);
        const nm = document.createElement("div"), G = GEGENSTAENDE[d.g]; nm.className = "ez-name3d boden"; nm.textContent = (G ? G.name : d.g) + (d.n > 1 ? " ×" + d.n : ""); b = { g, nm, d }; this.bodenBild.set(d.i, b); }
      b.d = d; const h = this.motor.hoehe(d.x, d.y); b.g.position.set(d.x, h, d.y); b.g.rotation.y = performance.now() / 1600 + d.i; schildAn(b.nm, this.motor, d.x, h + 0.75, d.y); }
    for (const [i, b] of this.bodenBild) if (!da.has(i)) { this.motor.szene.remove(b.g); b.g.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.geometry.dispose(); (m.material as THREE.Material).dispose(); } }); b.nm.remove(); this.bodenBild.delete(i); } }
  private wahlFolgen() { const w = this.wahl; if (w) schildAn(w.el, this.motor, w.x, this.motor.hoehe(w.x, w.z) + 1.3, w.z); }
  reisen(a: Ausgang) {
    if (WELT.ausgang && WELT.ausgang(a)) return;
    try { localStorage.removeItem("ez_welt_pos"); } catch { /* privat */ }
    const z = a.nach; if (z.art === "welt") { const r = this.index.regionen[z.region]; if (!r) return; const x = z.x + r.region.ursprung[0] * C, y = z.y + r.region.ursprung[1] * C; this.halt(); this.ort = { x, y }; this.motor.springen(x, y); void this.strom(); return; }
    this.gesperrt = true; location.href = z.art === "kampf" ? `./?ort=${encodeURIComponent(z.ort)}&kampf=${encodeURIComponent(z.kampf)}` : z.ort === "waldmark" ? "./?von=tor" : `./?ort=${encodeURIComponent(z.ort)}&eingang=1`;
  }

  private vorher = { x: 0, y: 0 }; /** im Kampfgebiet: läuft der Held (vom Server bewegt)? */ private laeuftFremd = false;
  /** Minikarte live aus der 3D-Welt: von oben, ohne Dächer, mit der Kamera gedreht. Neu gezeichnet alle 300 ms (Handy 450 ms) in einem größeren Ausschnitt;
   *  dazwischen wird das Bild in jedem Bild weich mit dem Helden verschoben und mit der Kamera gedreht – so läuft die Karte flüssig mit. */
  private karteLeinwand: HTMLCanvasElement | null = null; private karteZeit = 0; private karteStand: { x: number; y: number; g: number; massstab: number } | null = null;
  private minikarte() {
    const k = document.getElementById("ez-karte"), rund = k && k.parentElement, r = this.regionBei(this.ort.x, this.ort.y); if (!k || !rund || !rund.classList.contains("rund") || !r) return;
    if (!this.karteLeinwand || this.karteLeinwand.parentElement !== rund) { const c = document.createElement("canvas"); c.className = "karte3d"; rund.insertBefore(c, rund.firstChild); this.karteLeinwand = c; this.karteStand = null; }
    const R = rund.clientWidth, f = k.offsetWidth / (r.region.chunks[0] * C); if (!R || !f) return; const c = this.karteLeinwand, g = this.motor.gieren;
    /* Neu zeichnen nur, wenn nötig: nach Bewegung (> 1 Feld) oder Drehung, höchstens alle 500 ms (Handy 700 ms) – dazwischen gleitet das Bild mit; sonst spätestens alle 2 s (Mitspieler, Marken) */
    const alt = this.karteStand, seit = performance.now() - this.karteZeit, bewegt = !alt || Math.hypot(this.ort.x - alt.x, this.ort.y - alt.y) > 1 || Math.abs(g - alt.g) > 0.03 || alt.massstab !== f;
    if (!alt || (bewegt && seit > (HANDY_KARTE ? 700 : 500)) || seit > 2000) { this.karteZeit = performance.now();
      const n = Math.min(320, Math.round(R * KARTE_RAND * Math.min(1.5, devicePixelRatio || 1))); if (c.width !== n) { c.width = n; c.height = n; }
      const stand = { x: this.ort.x, y: this.ort.y, g, massstab: f }, felder = (R * KARTE_RAND) / f;
      this.motor.karteZeichnen(c, felder, () => { this.symboleMalen(c, felder, stand, g); if (this.quest) this.quest.karteMarke(c, felder, stand, g); this.karteStand = stand; }); }
    if (!this.karteStand) return;
    /* Verschiebung seit dem Zeichnen in Bildpunkten des gezeichneten Bilds (oben = Blickrichtung beim Zeichnen) und Drehung um den Unterschied der Kamera */
    const S = this.karteStand, dx = this.ort.x - S.x, dy = this.ort.y - S.y, rx = Math.cos(S.g), rz = -Math.sin(S.g), ux = -Math.sin(S.g), uz = -Math.cos(S.g);
    const px = (dx * rx + dy * rz) * S.massstab, py = -(dx * ux + dy * uz) * S.massstab;
    c.style.transform = `rotate(${(g - S.g).toFixed(4)}rad) translate(${(-px).toFixed(1)}px, ${(-py).toFixed(1)}px)`; }
  /** Kartensymbole aus welt.json (Bank, Schmiede, Händler, Holzfällerei, Mine …; welt/bibliothek/kartensymbole.json) ins Bild der Minikarte – Held in der Mitte, g = Drehung der Kamera */
  private symbolBilder = new Map<string, HTMLImageElement>();
  private symboleMalen(c: HTMLCanvasElement, felder: number, o: { x: number; y: number }, g: number): void {
    const x = c.getContext("2d"); if (!x || !this.index) return; const n = c.width, k = n / felder, rand = n / 2 / 1.5, gr = Math.max(16, n * 0.09);
    for (const r of Object.values(this.index.regionen) as { symbole?: { s: string; x: number; y: number }[] }[]) for (const q of r.symbole || []) {
      const dx = q.x - o.x, dy = q.y - o.y; if (Math.abs(dx) > felder || Math.abs(dy) > felder) continue;
      const px = (dx * Math.cos(g) + dy * -Math.sin(g)) * k, py = -(dx * -Math.sin(g) + dy * -Math.cos(g)) * k; if (Math.hypot(px, py) > rand - gr / 2) continue;
      let im = this.symbolBilder.get(q.s); if (!im) { im = new Image(); im.src = `${WELT.bild}img/karte/symbole/${q.s}.webp`; im.onload = () => { this.karteZeit = 0; }; this.symbolBilder.set(q.s, im); } /* geladen: beim nächsten Bild zeichnen */
      if (im.complete && im.naturalWidth) x.drawImage(im, n / 2 + px - gr / 2, n / 2 + py - gr / 2, gr, gr); } }
  /** für Tests: welche Symbole die Minikarte gerade zeigen würde */
  symboleNah(r = 40): { s: string; x: number; y: number }[] { if (!this.index) return []; const o = this.ort; return (Object.values(this.index.regionen) as { symbole?: { s: string; x: number; y: number }[] }[]).flatMap((g) => g.symbole || []).filter((q) => Math.hypot(q.x - o.x, q.y - o.y) < r); }
  private letzterStrom = 0; /** gerechnete Spielzeit in s (für Prüfungen) */ simZeit = 0;
  /** Feldbewegung („Felder und Schräge“, shared/feld.ts): der Held gleitet von Feldmitte zu Feldmitte, 1 Feld je Tick (2/s), im Sprint 2 (4/s);
   *  schräg zählt wie gerade, keine Ecken schneiden. schrittZiel: die Feldmitte, zu der er gerade geht (ein angefangener Schritt wird zu Ende gegangen) */
  schrittZiel: { x: number; y: number } | null = null; private schrittOrt: { x: number; y: number } | null = null;
  private feldSchritte(dt: number, richtung: [number, number] | null): boolean {
    const o = this.ort; if (this.schrittOrt !== o) { this.schrittZiel = null; this.schrittOrt = o; } /* versetzt (Teleport, Ausgang, Kampfgebiet): neu anfangen */
    const fels = (i: number, j: number) => this.raster.fels(i, j); let rest = GEHEN_TEMPO * this.ausdauer.faktor * dt, bewegt = false;
    for (let n = 0; n < 6 && rest > 1e-9; n++) {
      if (!this.schrittZiel) { const i = Math.floor(o.x), j = Math.floor(o.y);
        if (richtung) { const r = richtungsSchritt(richtung[0], richtung[1]); let z: { x: number; y: number } | null = null;
          if (r) for (const [dx, dy] of [r, [r[0], 0], [0, r[1]]] as [number, number][]) if ((dx || dy) && schrittFrei((a, b) => !fels(a, b), i, j, dx, dy)) { z = { x: i + dx + 0.5, y: j + dy + 0.5 }; break; }
          this.schrittZiel = z || (inMitte(o) ? null : mitte(o)); }
        else if (this.pfad.length) { const z = this.pfad.shift()!; if (fels(Math.floor(z.x), Math.floor(z.y))) { this.pfad = []; this.schrittZiel = inMitte(o) ? null : mitte(o); } else this.schrittZiel = z; if (!this.pfad.length) this.marke.visible = this.schrittZiel !== null; }
        else if (!inMitte(o) && !fels(i, j)) this.schrittZiel = mitte(o);
        if (!this.schrittZiel) break; }
      const z = this.schrittZiel, d = schrittLaenge(o, z); bewegt = true;
      if (d <= rest + 1e-9) { o.x = z.x; o.y = z.y; rest -= d; this.schrittZiel = null; if (!this.pfad.length && !richtung) this.marke.visible = false; }
      else { o.x += (z.x - o.x) / d * rest; o.y += (z.y - o.y) / d * rest; rest = 0; } }
    return bewegt; }
  private bild(dt: number) { this.simZeit += dt; if (this.quest) this.quest.schritt(dt); if (this.haendler) this.haendler.schritt(dt); if (this.bank) this.bank.schritt(dt); if (this.holz) this.holz.schritt(dt); if (this.berg) this.berg.schritt(dt); this.gespraechWeite();
    const o = this.ort; let [rx, ry] = this.gesperrt ? [0, 0] : this.welt(this.rx, this.ry); const direkt = Math.hypot(rx, ry) > 0.05, richtung: [number, number] | null = direkt ? [rx, ry] : null;
    if (direkt) { this.pfad = []; this.marke.visible = false; }
    else if (this.imKampf && this.pfad.length) { const z = this.pfad[0], dx = z.x - o.x, dy = z.y - o.y, l = Math.hypot(dx, dy);
      if (l < this.naechst - 0.03) { this.naechst = l; this.stillstand = 0; } else this.stillstand += dt;
      if (l < 0.12 || this.stillstand > 0.6) { this.pfad.shift(); this.naechst = Infinity; this.stillstand = 0; if (!this.pfad.length) this.marke.visible = false; } else { rx = dx / l; ry = dy / l; } }
    else if (!direkt) { const z = this.schrittZiel || this.pfad[0]; if (z) { const dx = z.x - o.x, dy = z.y - o.y, l = Math.hypot(dx, dy); if (l > 1e-6) { rx = dx / l; ry = dy / l; } } } /* Wunschrichtung (für den Rand eines Kampfgebiets) */
    const l = Math.hypot(rx, ry), will = l > 0.05, vorher = { x: o.x, y: o.y };
    const fremd = anschluss3D.fremd(this, will ? rx : 0, will ? ry : 0); /* im Kampfgebiet bewegt der Server den Helden (der Kampf setzt this.ort) */
    let faehrt = fremd ? will : false; if (!fremd) faehrt = this.feldSchritte(dt, richtung); else this.schrittZiel = null;
    if (faehrt && !fremd) { rx = o.x - vorher.x; ry = o.y - vorher.y; if (Math.hypot(rx, ry) < 1e-6) faehrt = false; }
    this.imKampf = fremd; this.sprintSchritt(dt, faehrt && !fremd); /* Sprint: Ausdauer im 0,5-s-Takt (shared/sprint.ts); im Kampfgebiet bewegt der Server, dort kein Sprint */
    if (faehrt && (!fremd || direkt)) this.figur.blick(rx, ry); /* im Kampfgebiet beim Klicklaufen: Blick in die Richtung, in die der Server ihn wirklich bewegt (unten) – nicht zum Wegpunkt, der hinter ihm liegen kann */
    this.laeuft = fremd ? this.laeuftFremd : faehrt; this.figur.setze(this.schildHoch ? (this.laeuft ? "schild_laufen" : "block") : this.laeuft ? (this.ausdauer.faktor > 1 ? "rennen" : "laufen") : "ruhe"); /* Sprint: Rennen */
    this.vorher = vorher;
    const y = this.motor.hoehe(o.x, o.y); this.motor.held.x = o.x; this.motor.held.z = o.y; this.figur.stelle(o.x, y, o.y); this.figur.schritt(dt * 1000, this.motor.gieren); this.marke.rotation.z += dt;
    if (performance.now() - this.letzterStrom > 400) { this.letzterStrom = performance.now(); void this.strom(); }
    this.umsehen(); this.wahlFolgen(); this.bodenZeichnen(); this.regionZeigen();
    { const r = this.regionBei(o.x, o.y), pk = $("#ez-karte-punkt"); if (r && pk) { pk.style.left = (100 * (o.x / C - r.region.ursprung[0]) / r.region.chunks[0]) + "%"; pk.style.top = (100 * (o.y / C - r.region.ursprung[1]) / r.region.chunks[1]) + "%"; } }
    if (performance.now() - this.gemerkt > 2000) { this.gemerkt = performance.now(); try { localStorage.setItem("ez_welt_pos", JSON.stringify([Math.round(o.x * 100) / 100, Math.round(o.y * 100) / 100, this.hier])); } catch { /* privat */ } }
    { const t = schildText(this.held); if (this.schild.textContent !== t) this.schild.textContent = t; schildAn(this.schild, this.motor, o.x, y + HOEHE + 0.35, o.y); }
    karteDrehen(this.motor.gieren); anschluss3D.schritt(this, dt); this.minikarte();
    { const dx = this.ort.x - this.vorher.x, dy = this.ort.y - this.vorher.y; this.laeuftFremd = Math.hypot(dx, dy) > 0.4 * dt; if (this.laeuftFremd && this.imKampf && Math.hypot(this.rx, this.ry) < 0.05) this.figur.blick(dx, dy); } /* vom Server bewegt: Blick in Laufrichtung */
  }
}
