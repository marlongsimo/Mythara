/*
 * Die offene Welt: eine Szene, die ihre Umgebung Stück für Stück nachlädt (World Pipeline, Phase 5).
 * Der Boden kommt als ein Bild je Chunk (werkzeug/welt/boden.py), dazu je Chunk Gehraster und Objekte (werkzeug/welt/bauen.mjs).
 * Geladen wird, was im Bild ist; der Ring dahinter wird vorgeholt; was weit weg ist, wird wieder freigegeben.
 *
 * Aufruf zum Ausprobieren: ?welt=<region>   (mit &test=1: Raster, Chunk-Grenzen und Messwerte einblenden)
 * Ausbaustufe 1: ein Held läuft allein durch die Welt, Bewegung rechnet der Browser. Gegner, Mitspieler und Server kommen mit der Integration (Phase 10).
 */
import { teleportAbreise } from "../echt3d/figur";
import { symboleOrdnen } from "../symbolordnung";
import Phaser from "phaser";
import { HELDEN } from "../../../shared/config";
import { FELD_PX, CHUNK_FELDER, CHUNK_PX, HELD_PX, chunkName, inZone } from "../../../shared/welt/typen";
import type { ChunkDaten, Region, Ausgang, Spawnzone, Platzierung, Interaktion, Figur, ObjektDef } from "../../../shared/welt/typen";
import { WeltRaster } from "../../../shared/welt/raster";
import { zoomFaktor, zoomKnopf } from "../zoom";
import { baumBild, figur3dAn, BaumBildT } from "../echt3d/figur";

const $ = (s: string) => document.querySelector(s) as HTMLElement, P = new URLSearchParams(location.search);
/** Region, in der man die Welt betritt (leer = die Welt ist nicht gewählt) */
export const weltName = P.get("welt") || "";
/** Einstellungen, die eine Seite vor dem Start ändern kann: im Spiel gelten die Grundwerte, eine eigenständige Seite (welt/seite.ts) setzt eigene.
 *  bild: Pfad vor den Bildern des Repositorys (img/…) · daten: Ordner der gebauten Welt · hud: die Oberfläche · ausgang: ein Ausgang selbst behandeln (true = erledigt) */
/** Adresse einer Datei der Welt (Chunks, Karten) bzw. eines Weltbilds (Gebäude, Bäume) – mit der Kennung des Weltbaus */
export const weltDatei = (name: string): string => WELT.daten + name + (WELT.stand ? "?v=" + WELT.stand : "");
export const weltBild = (pfad: string): string => WELT.bild + pfad + (WELT.stand ? "?v=" + WELT.stand : "");
export const WELT = { start: weltName, bild: "../", daten: "welt/", /** Kennung des Weltbaus (welt.json „stand“): hängt an jeder Datei der Welt, damit Browser nach einem Umbau nicht alte Bilder zeigen */ stand: "",
  hud: { profil: (_held: string): void => {}, titel: (_name: string, _unter: string): void => {}, karte: (): void => {} },
  ausgang: null as ((a: Ausgang) => boolean) | null,
  /** Region, in der man nach der Rückkehr aus einer Kampagne (?von=tor) steht – an ihrem ersten Startpunkt */
  tor: "",
  /** Menüknöpfe einrichten (im Spiel: Helden, Weltkarte, Riss, Menü) */
  menue: null as ((s: Welt) => void) | null,
  /** Was eine Interaktion mit daten.tat auslöst (im Spiel: halle, welt, riss, bald) */
  tat: null as ((art: string, s: Welt) => void) | null,
  /** wird gerufen, bevor der Held versetzt wird (etwa den Kampf der offenen Welt beenden, damit der Server ihn nicht zurückholt) */ springen: null as ((s: Welt) => void) | null,
  /** Beschriftung des Knopfs zu einer tat (etwa „Das Südtor ist noch geschlossen“) */
  knopf: null as ((art: string, knopf: string) => string) | null,
  /** Regionen, die noch nicht freigegeben sind: werden nicht geladen */
  gesperrteRegionen: [] as string[],
  /** Gesperrte Bereiche [x0, y0, x1, y1] in Rechenfeldern der Welt (etwa ein geschlossenes Tor) */
  sperren: [] as number[][],
  /** Figur des Helden anlegen (im Spiel: modulare Figuren) und ihre Blickrichtung setzen */
  figur: null as ((s: Phaser.Scene, x: number, y: number, held: string, hoehe: number) => Phaser.GameObjects.Sprite) | null,
  richten: null as ((sp: unknown, sx: number, sy: number) => void) | null,
  /** Zusätzlich laden (im Spiel: Bilder für Mitspieler) */
  laden: null as ((s: Phaser.Scene) => void) | null,
  /** Nach dem Aufbau, bei jedem Regionswechsel, in jedem Bild, beim Antippen (true = erledigt) */
  betreten: null as ((s: Welt) => void) | null,
  regionWechsel: null as ((s: Welt, r: { region: Region; start: number[][] }) => void) | null,
  schritt: null as ((s: Welt, d: number) => void) | null,
  /** Bewegt jemand anderes den Helden (Kampfgebiet: der Spielserver)? Bekommt die gewünschte Richtung; true = nicht selbst bewegen */
  fremd: null as ((s: Welt, rx: number, ry: number) => boolean) | null,
  antippen: null as ((s: Welt, p: Phaser.Input.Pointer) => boolean) | null };
const HANDY = window.matchMedia("(pointer: coarse)").matches || P.get("handy") === "1", TEST = P.get("test") === "1";
/** 3D-Ansicht (Probe, seit 22.11.2026): ?3d=1 – die 2D-Welt bleibt die Spiellogik, gezeichnet wird in 3D (client/src/welt3d/spiel.ts) */
const DREI = P.get("3d") === "1";
const F = FELD_PX, C = CHUNK_FELDER;
/* Wie weit über den Bildrand hinaus (in Chunks) gezeigt, vorgeholt und behalten wird */
const ZEIGEN = 0.3, VORHOLEN = 1.0, BEHALTEN = 1.5;
/** Halbe Breite des Helden für die Kollision (Rechenfelder), wie in der Simulation */
const RADIUS = 0.3;

/** Nur Optik: ein Objekt mit Farbvarianten (vielfalt) zeigt je Standort fest eine davon – derselbe Standort sieht immer gleich aus */
function vielfalt(p: Platzierung, o: Anzeige, alle: Record<string, Anzeige>): Platzierung {
  const v = o.vielfalt; if (!v || v.length < 2 || p.zustand) return p;
  let h = Math.imul(Math.round(p.x * 16) | 0, 0x27d4eb2d) ^ Math.imul(Math.round(p.y * 16) | 0, 0x165667b1); h = Math.imul(h ^ (h >>> 15), 0x85ebca6b); h ^= h >>> 13;
  const id = v[(h >>> 0) % v.length]; return alle[id] ? { ...p, objekt: id } : p;
}
type Anzeige = Pick<ObjektDef, "bild" | "groesse" | "anker" | "massstab" | "tiefe" | "durchscheinend" | "animation" | "zustaende" | "ebenen" | "raum" | "tueren" | "vielfalt" | "modell3d">;
/** Ein räumliches Gebäude im Bild: seine Ebenen nach Rolle, Innenräume und Türpunkte in Weltkoordinaten (Rechenfelder) */
interface Bau { teile: { bild: Phaser.GameObjects.Image; rolle: string; tuer?: number; koerper?: number }[]; raum: { x0: number; x1: number; y0: number; y1: number; koerper: number }[]; tueren: { x: number; y: number }[] }
interface RegionKopf { region: Region; start: number[][]; spawnzonen: Spawnzone[]; ausgaenge: Ausgang[]; benutzt: string[] }
interface WeltIndex { feldPx: number; chunkFelder: number; regionen: Record<string, RegionKopf>; objekte: Record<string, Anzeige> }
/** Ein Chunk auf dem Weg ins Bild: holt (Daten unterwegs) → bereit (Daten und Bild im Speicher) → aktiv (im Bild) */
interface Stueck { name: string; cx: number; cy: number; stand: "holt" | "bereit" | "aktiv" | "fehler"; daten?: ChunkDaten; bild?: HTMLImageElement; boden?: Phaser.GameObjects.Image;
  dinge: Phaser.GameObjects.GameObject[]; scheinend: Phaser.GameObjects.Image[]; bauten: Bau[]; seit: number; baeume?: Baum3D[] }
/** Ein Baum mit 3D-Modell: das Bild am Standort zeigt, solange er sichtbar ist, das live gezeichnete 3D-Bild (sonst das flache Ersatzbild) */
interface Baum3D { bild: Phaser.GameObjects.Image; m: NonNullable<ObjektDef["modell3d"]>; s: number; dreh: number; phase: number; alt: { key: string; ox: number; oy: number; sk: number; flip: boolean };
  b?: BaumBildT; tex?: Phaser.Textures.CanvasTexture; laedt?: boolean; weg?: boolean; zuletzt: number }
const BAUM_TAKT = HANDY ? 160 : 80;   /* Wind: so oft wird ein sichtbarer Baum neu gezeichnet (ms) */
let baumZaehler = 0;

export class Welt extends Phaser.Scene {
  index!: WeltIndex; raster = new WeltRaster(); stuecke = new Map<string, Stueck>(); gueltig = new Set<string>();
  held = "schildwaechter"; ort = { x: 0, y: 0 }; rx = 0; ry = 0; laeuft = false; faehrt = false; drei: { drehen(rx: number, ry: number): [number, number] } | null = null; pfad: { x: number; y: number }[] = []; tasten: Record<string, boolean> = {};
  figur!: Phaser.GameObjects.Sprite; silhouette!: Phaser.GameObjects.Sprite; bildFigur = true; ring!: Phaser.GameObjects.Ellipse; marke!: Phaser.GameObjects.Ellipse;
  stick: { id: number; x: number; y: number; t: number; weit: number } | null = null;
  nah: { text: string; tat: () => void } | null = null; hier = ""; gesperrt = false; /** stand eine gemerkte Stelle auf dem Gerät? (dann gilt die des Servers nicht) */ gemerkteStelle = false;
  /** Zähler für die Testanzeige */
  mess = { geholt: 0, gezeigt: 0, entladen: 0, laengsteMs: 0 };
  constructor() { super("welt"); }

  init() { let h = ""; try { h = localStorage.getItem("ez_held") || ""; } catch { /* privat */ } this.held = HELDEN[h] ? h : "schildwaechter"; }

  preload() {
    const D = HELDEN[this.held]; const B = WELT.bild; if (D.figur) this.load.image("figur-" + this.held, B + D.figur); if (D.lauf) this.load.spritesheet("lauf-" + this.held, B + D.lauf, { frameWidth: 176, frameHeight: 176 }); this.load.image(this.held, B + D.bild);
    /* Erst das Verzeichnis der Welt, dann gleich die Chunks rund um den Start: So steht der Held beim ersten Bild schon auf festem Boden */
    this.load.json("welt", WELT.daten + "welt.json?t=" + Math.floor(Date.now() / 60000));   /* das Verzeichnis selbst höchstens eine Minute zwischenspeichern */
    if (WELT.laden) WELT.laden(this);
    this.load.once("filecomplete-json-welt", () => { const w = this.cache.json.get("welt") as WeltIndex; if (!w || !w.regionen) return; WELT.stand = (w as unknown as { stand?: string }).stand || ""; for (const g of WELT.gesperrteRegionen) delete w.regionen[g]; this.index = w; this.gueltigSetzen(); const s = this.startPunkt();
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const cx = Math.floor(s.x / C) + dx, cy = Math.floor(s.y / C) + dy, n = chunkName(cx, cy); if (!this.gueltig.has(n)) continue;
        this.load.json("chunk-" + n, weltDatei(n + ".json")); this.load.image("boden-" + n, weltDatei(n + ".webp")); }
      for (const [id, o] of Object.entries(w.objekte)) if ((w.regionen[this.startRegion()]?.benutzt || []).includes(id)) this.load.image("obj-" + id, weltBild(o.bild)); });
  }

  gueltigSetzen() { for (const r of Object.values(this.index.regionen)) for (let j = 0; j < r.region.chunks[1]; j++) for (let i = 0; i < r.region.chunks[0]; i++) this.gueltig.add(chunkName(r.region.ursprung[0] + i, r.region.ursprung[1] + j)); }
  startRegion(): string { return this.index.regionen[WELT.start] ? WELT.start : Object.keys(this.index.regionen)[0]; }
  /** Wo der Held steht, wenn die Szene beginnt: die gemerkte Stelle, sonst der Start der Region */
  private ersterStart: { x: number; y: number } | null = null;
  /** einmal ermittelt, gilt er für die ganze Szene (die Adresse mit wx/wy wird beim ersten Mal geleert) */
  startPunkt(): { x: number; y: number } { if (!this.ersterStart) this.ersterStart = this.startPunktFinden(); return this.ersterStart; }
  startPunktFinden(): { x: number; y: number } {
    if (P.get("von") === "tor" && this.index.regionen[WELT.tor]) { /* aus einer Kampagne zurück: vor dem Tor */ const t = this.index.regionen[WELT.tor];
      try { localStorage.removeItem("ez_welt_pos"); } catch { /* privat */ } P.delete("von"); history.replaceState(null, "", location.pathname + (P.toString() ? "?" + P.toString() : "")); this.vonTor = { x: t.start[0][0], y: t.start[0][1] }; }
    if (this.vonTor) { this.gemerkteStelle = true; return this.vonTor; } /* bewusst gewählte Startstellen: die gemerkte Stelle des Servers gilt dann nicht */
    const r = this.index.regionen[this.startRegion()], s = r.start[0], gilt = (x: number, y: number, region?: string) => this.gueltig.has(chunkName(Math.floor(x / C), Math.floor(y / C))) && !(region && WELT.gesperrteRegionen.includes(region));
    /* zurück aus einer Kampfzone der Welt (Lichtung): genau an der Stelle, an der man sie verlassen hat */
    { const wx = Number(P.get("wx")), wy = Number(P.get("wy")); if (P.has("wx")) { P.delete("wx"); P.delete("wy"); history.replaceState(null, "", location.pathname + (P.toString() ? "?" + P.toString() : "")); if (Number.isFinite(wx) && Number.isFinite(wy) && gilt(wx, wy)) { this.gemerkteStelle = true; return { x: wx, y: wy }; } } }
    /* gefallen oder Teleport: am Start der Waldmark */
    if (P.get("von") === "teleport" || P.get("von") === "tod") { try { localStorage.removeItem("ez_welt_pos"); } catch { /* privat */ } this.gemerkteStelle = true; return { x: s[0], y: s[1] }; }
    try { if (P.get("neu") === "1") localStorage.removeItem("ez_welt_pos"); const p = JSON.parse(localStorage.getItem("ez_welt_pos") || "null");
      if (Array.isArray(p) && gilt(p[0], p[1], p[2])) { this.gemerkteStelle = true; return { x: p[0], y: p[1] }; } } catch { /* privat */ } /* die gemerkte Stelle – in jeder Region der Welt, nicht nur in der Waldmark */
    return { x: s[0], y: s[1] };
  }
  regionBei(x: number, y: number): RegionKopf | null { const cx = Math.floor(x / C), cy = Math.floor(y / C);
    for (const r of Object.values(this.index.regionen)) { const [ux, uy] = r.region.ursprung, [b, h] = r.region.chunks; if (cx >= ux && cy >= uy && cx < ux + b && cy < uy + h) return r; } return null; }

  create() {
    if (!this.index) { $("#ez-dorf-hilfe").textContent = "Die Welt ist noch nicht gebaut (node werkzeug/welt/bauen.mjs)."; document.body.classList.add("dorf"); return; }
    document.body.classList.add("dorf", "stadt"); $("#ez-dorf-titel").style.display = "none"; $("#ez-dorf-hilfe").textContent = HANDY ? "Finger ziehen: laufen · tippen: dorthin gehen" : "WASD oder Pfeiltasten: laufen · Klick: dorthin gehen";
    this.cameras.main.setBackgroundColor("#0a0d08");
    /* Was preload schon geholt hat, gleich einsetzen */
    for (const n of this.gueltig) { const d = this.cache.json.get("chunk-" + n) as ChunkDaten | undefined; if (!d || !this.textures.exists("boden-" + n)) continue;
      const st: Stueck = { name: n, cx: d.cx, cy: d.cy, stand: "bereit", daten: d, dinge: [], scheinend: [], bauten: [], seit: 0 }; this.stuecke.set(n, st); this.rasterDazu(d); this.zeigen(st); }
    const s = this.startPunkt(), frei = this.raster.naechstFrei(s) || s; this.ort = { x: frei.x, y: frei.y };

    this.marke = this.add.ellipse(0, 0, 34, 17).setStrokeStyle(2, 0xffe9a8, 0.9).setVisible(false);
    const D = HELDEN[this.held]; this.ring = this.add.ellipse(0, 0, 46, 23).setStrokeStyle(3, 0xffffff, 0.95);
    if (D.figur) { const fu = D.fuss || [0.5, 0.94]; this.figur = (WELT.figur ? WELT.figur(this, 0, 0, this.held, HELD_PX) : this.add.sprite(0, 0, "figur-" + this.held)).setOrigin(fu[0], fu[1]); this.figur.setScale(HELD_PX * (D.gross || 1) / this.figur.height);
      if (D.lauf && !this.anims.exists("lauf-" + this.held)) this.anims.create({ key: "lauf-" + this.held, frames: this.anims.generateFrameNumbers("lauf-" + this.held, {}), frameRate: 11, repeat: -1 }); }
    else { this.figur = this.add.sprite(0, 0, this.held).setOrigin(0.5, 1); this.figur.setScale(48 / this.figur.height); }
    /* Silhouette: Verdeckt ein Gebäude den Helden, zeigt sie in Gold, wo er steht (Gebäude werden nicht durchsichtig) */
    this.bildFigur = this.figur instanceof Phaser.GameObjects.Sprite; /* modulare Figuren sind Behälter aus Ebenen: statt einer Silhouette werden sie halb durchsichtig nach vorn geholt */
    this.silhouette = this.add.sprite(0, 0, this.bildFigur ? this.figur.texture.key : "__WHITE").setTintFill(0xf3d895).setAlpha(0.5).setDepth(1e7 - 1).setVisible(false);

    const taste = (ev: KeyboardEvent, an: boolean) => { const k = ev.key.toLowerCase(); if (!(DREI ? ["w", "a", "s", "d"] : ["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"]).includes(k)) return;   /* in 3D drehen die Pfeiltasten die Kamera */ ev.preventDefault(); this.tasten[k] = an; const t = this.tasten;
      this.rx = (t.d || t.arrowright ? 1 : 0) - (t.a || t.arrowleft ? 1 : 0); this.ry = (t.s || t.arrowdown ? 1 : 0) - (t.w || t.arrowup ? 1 : 0); };
    window.addEventListener("keydown", (ev) => { if (!this.scene.isActive()) return; if (!ev.repeat && !this.gesperrt) taste(ev, true); if ((ev.key === "e" || ev.key === "E" || ev.key === "Enter") && !ev.repeat && this.nah && !this.gesperrt) this.nah.tat(); });
    window.addEventListener("keyup", (ev) => taste(ev, false)); window.addEventListener("blur", () => { this.tasten = {}; this.rx = 0; this.ry = 0; });
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => { if (this.stick || this.gesperrt) return; if (WELT.antippen && WELT.antippen(this, p)) return; this.stick = { id: p.id, x: p.x, y: p.y, t: performance.now(), weit: 0 };
      if (p.wasTouch) { const el = $("#ez-stick"); el.hidden = false; el.style.left = p.x + "px"; el.style.top = p.y + "px"; ($("#ez-stick i") as HTMLElement).style.transform = "translate(-50%, -50%)"; } });
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => { const st = this.stick; if (!st || p.id !== st.id || !p.isDown) return; const dx = p.x - st.x, dy = p.y - st.y, l = Math.hypot(dx, dy), m = 46; st.weit = Math.max(st.weit, l); if (!p.wasTouch) return;
      ($("#ez-stick i") as HTMLElement).style.transform = `translate(calc(-50% + ${dx / Math.max(l, 1) * Math.min(l, m)}px), calc(-50% + ${dy / Math.max(l, 1) * Math.min(l, m)}px))`;
      if (l < 8) { this.rx = 0; this.ry = 0; } else { const k = Math.min(1, l / m); this.rx = dx / l * k; this.ry = dy / l * k; } });
    this.input.on("pointerup", (p: Phaser.Input.Pointer) => { const st = this.stick; if (!st || p.id !== st.id) return;
      if (st.weit < 12 && performance.now() - st.t < 450) { const w = this.cameras.main.getWorldPoint(p.x, p.y); this.gehe(w.x / F, w.y / F); } this.stick = null; $("#ez-stick").hidden = true; if (p.wasTouch) { this.rx = 0; this.ry = 0; } });
    $("#ez-dorf-knopf").onclick = () => { if (this.nah && !this.gesperrt) this.nah.tat(); };

    this.groesse(); zoomKnopf(() => this.groesse()); this.scale.on("resize", () => this.groesse());
    this.profil(); this.cameras.main.centerOn(this.ort.x * F, this.ort.y * F);
    if (TEST) this.testAnzeige();
    /* Für Prüfungen im Browser: ergänzt den Zugang der gemeinsamen Welt (welt.ts), statt ihn zu ersetzen */
    const w = window as unknown as Record<string, Record<string, unknown> | undefined>; w.EZW = Object.assign(w.EZW || {}, { szene: this, ort: () => this.ort, raster: this.raster, stuecke: this.stuecke, mess: this.mess, gehe: (x: number, y: number) => this.gehe(x, y) });
    if (WELT.betreten) WELT.betreten(this);
    if (DREI) this.dreiStarten();
  }
  /** 3D-Ansicht nachladen: die 2D-Welt zeichnet nicht mehr (Kamera aus, Bildfläche verborgen), Eingaben kommen von der 3D-Ansicht */
  dreiStarten() { this.cameras.main.setVisible(false); this.game.canvas.style.visibility = "hidden"; this.game.canvas.style.pointerEvents = "none"; if (this.game.canvas.parentElement) this.game.canvas.parentElement.style.pointerEvents = "none";   /* Klicks gehen an die 3D-Fläche darunter */
    const s = document.createElement("script"); s.src = "welt3d-spiel.js?v=" + (WELT.stand || Date.now());
    s.onload = () => { const M = (window as unknown as { MytharaWelt3D?: { starten(a: unknown): { drehen(rx: number, ry: number): [number, number] } } }).MytharaWelt3D; if (!M) return;
      this.drei = M.starten({ ort: () => this.ort, laeuft: () => this.faehrt, held: () => { const D = HELDEN[this.held] as unknown as Record<string, unknown>; return { figur: D.figur, lauf: D.lauf, laufMass: D.laufMass, gross: D.gross, fuss: D.fuss }; },
        gehe: (x: number, y: number) => this.gehe(x, y), steuern: (rx: number, ry: number) => { this.rx = rx; this.ry = ry; this.stickDrei = rx !== 0 || ry !== 0; } }); };
    document.head.appendChild(s); }
  stickDrei = false;

  groesse() { const k = this.cameras.main, h = this.scale.height; k.setZoom(Phaser.Math.Clamp(h / (HANDY ? 470 : 760), 0.5, 2) * zoomFaktor()); }

  /** Titel und Minikarte der Region, in der man gerade steht */
  regionZeigen() { const r = this.regionBei(this.ort.x, this.ort.y), id = r ? r.region.id : ""; if (id === this.hier) return; this.hier = id; if (!r) return;
    if (WELT.regionWechsel) WELT.regionWechsel(this, r);
    { /* Die Kamera bleibt über dem zusammenhängenden Land: diese Region und alle, die (über Nachbarn) an sie grenzen */
      const alle = Object.values(this.index.regionen).map((k) => k.region), dabei = new Set([r.region]); let x0 = 0, y0 = 0, x1 = 0, y1 = 0, neu = true;
      const grenzt = (a: Region, b: Region) => a.ursprung[0] <= b.ursprung[0] + b.chunks[0] && b.ursprung[0] <= a.ursprung[0] + a.chunks[0] && a.ursprung[1] <= b.ursprung[1] + b.chunks[1] && b.ursprung[1] <= a.ursprung[1] + a.chunks[1];
      while (neu) { neu = false; for (const a of alle) if (!dabei.has(a) && [...dabei].some((b) => grenzt(a, b))) { dabei.add(a); neu = true; } }
      x0 = Math.min(...[...dabei].map((a) => a.ursprung[0])); y0 = Math.min(...[...dabei].map((a) => a.ursprung[1])); x1 = Math.max(...[...dabei].map((a) => a.ursprung[0] + a.chunks[0])); y1 = Math.max(...[...dabei].map((a) => a.ursprung[1] + a.chunks[1]));
      this.cameras.main.setBounds(x0 * CHUNK_PX, y0 * CHUNK_PX, (x1 - x0) * CHUNK_PX, (y1 - y0) * CHUNK_PX); }
    WELT.hud.titel(r.region.name, r.region.untertitel || "Splitterlande"); const k = $("#ez-karte"); k.style.backgroundImage = `url(${weltDatei("karte-" + id + ".webp")})`; k.style.aspectRatio = `${r.region.chunks[0]} / ${r.region.chunks[1]}`; (k.querySelector("span") as HTMLElement).textContent = r.region.name;
    /* Kartensymbole (Bank, Schmiede, Dungeon …) aus welt.json: an ihrer Stelle, gleich groß bei jedem Zoom */
    for (const e of Array.from(k.querySelectorAll(".ez-symbol"))) e.remove();
    const sy = (this.index.regionen[id] as unknown as { symbole?: { s: string; x: number; y: number }[] }).symbole || [], namen = (this.index as unknown as { kartensymbole?: Record<string, string> }).kartensymbole || {}, punkt = k.querySelector("#ez-karte-punkt");
    for (const q of sy) { const im = document.createElement("img"); im.className = "ez-symbol"; im.src = `${WELT.bild}img/karte/symbole/${q.s}.webp`; im.alt = namen[q.s] || q.s; im.title = namen[q.s] || q.s; im.draggable = false;
      Object.assign(im.style, { position: "absolute", width: "22px", height: "auto", left: (100 * (q.x / C - r.region.ursprung[0]) / r.region.chunks[0]) + "%", top: (100 * (q.y / C - r.region.ursprung[1]) / r.region.chunks[1]) + "%", transform: "translate(-50%, -58%)", pointerEvents: "none", filter: "drop-shadow(0 1px 2px rgba(0,0,0,.8))", zIndex: "1" });
      k.insertBefore(im, punkt); }
    this.symboleOrdnen();
    if (!this.ordnenDa) { this.ordnenDa = true; const neu = () => requestAnimationFrame(() => this.symboleOrdnen()); window.addEventListener("ez-kartenzoom", neu); window.addEventListener("resize", neu); } }
  ordnenDa = false;
  /** Kartensymbole der Minikarte, die sich bei diesem Zoom überdecken würden, auseinanderschieben (Lage aus left/top in %) */
  symboleOrdnen() { const k = document.getElementById("ez-karte"); if (!k || !k.offsetWidth) return; const w = k.offsetWidth, h = k.offsetHeight;
    symboleOrdnen([...k.querySelectorAll<HTMLElement>(".ez-symbol")].map((el) => ({ el, x: parseFloat(el.style.left) / 100 * w, y: parseFloat(el.style.top) / 100 * h })), 19); }

  /** Den Helden an eine andere Stelle der Welt versetzen (Weltfelder), mit kurzem Abblenden – etwa durch ein Loch in den Untergrund */
  springen(x: number, y: number) { if (this.gesperrt) return; if (WELT.springen) WELT.springen(this); this.halt(); this.gesperrt = true; this.pfad = [];
    this.cameras.main.fadeOut(260, 0, 0, 0); this.time.delayedCall(280, () => { this.ort.x = x; this.ort.y = y; this.cameras.main.fadeIn(320, 0, 0, 0); this.gesperrt = false; }); }
  /** Zu einer Stelle laufen (Rechenfelder): Wegsuche über das Gehraster */
  gehe(x: number, y: number) { if (this.gesperrt) return; const w = this.raster.weg(this.ort, { x, y }, RADIUS); this.pfad = w; this.naechst = Infinity; this.stillstand = 0; if (w.length) { const z = w[w.length - 1]; this.marke.setPosition(z.x * F, z.y * F).setDepth(z.y * F - 1).setVisible(true); } else this.marke.setVisible(false); }

  /* ───────────── Nachladen ───────────── */

  /** Einen Chunk holen: Gehraster und Objekte als Daten, das Bodenbild fertig entpackt – aber noch nicht als Textur */
  holen(st: Stueck) {
    st.stand = "holt"; const t0 = performance.now();
    const daten = fetch(weltDatei(st.name + ".json")).then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.json() as Promise<ChunkDaten>; });
    const bild = new Image(); bild.decoding = "async"; if (!DREI) bild.src = weltDatei(st.name + ".webp");   /* in 3D wird der gemalte Boden nicht gebraucht */
    Promise.all([daten, DREI ? Promise.resolve() : bild.decode()]).then(([d]) => { if (this.stuecke.get(st.name) !== st) return; /* inzwischen wieder verworfen */
      st.daten = d; st.bild = DREI ? undefined : bild; st.stand = "bereit"; this.rasterDazu(d); this.mess.geholt++; this.mess.laengsteMs = Math.max(this.mess.laengsteMs, performance.now() - t0); })
      .catch(() => { st.stand = "fehler"; st.seit = this.time.now; });
  }

  /** Ein Bild erst benutzen, wenn es geladen ist (Objektbilder werden über alle Chunks hinweg geteilt und bleiben im Speicher) */
  wartend = new Map<string, (() => void)[]>();
  mitBild(key: string, url: string, dann: () => void) {
    if (this.textures.exists(key)) { dann(); return; }
    const schlange = this.wartend.get(key); if (schlange) { schlange.push(dann); return; }
    this.wartend.set(key, [dann]); this.load.image(key, url);
    this.load.once("filecomplete-image-" + key, () => { const l = this.wartend.get(key) || []; this.wartend.delete(key); for (const f of l) f(); });
    if (!this.load.isLoading()) this.load.start();
  }

  /** Einen bereiten Chunk ins Bild setzen: Boden, Objekte, Figuren */
  zeigen(st: Stueck) {
    if (DREI) { st.stand = "aktiv"; this.mess.gezeigt++; return; }   /* 3D: die 2D-Welt rechnet nur (Raster, Interaktionen), sie zeichnet nichts */
    const d = st.daten as ChunkDaten, key = "boden-" + st.name; if (!this.textures.exists(key) && st.bild) this.textures.addImage(key, st.bild);
    /* einen Bildpunkt größer als der Chunk: So bleibt beim Zoomen kein Haarriss zwischen Nachbarn */
    st.boden = this.add.image(st.cx * CHUNK_PX, st.cy * CHUNK_PX, key).setOrigin(0, 0).setDisplaySize(CHUNK_PX + 1, CHUNK_PX + 1).setDepth(-1e6);
    st.stand = "aktiv"; this.mess.gezeigt++;
    for (const p0 of d.objekte) { const o0 = this.index.objekte[p0.objekt]; if (!o0) continue; const p = vielfalt(p0, o0, this.index.objekte), o = this.index.objekte[p.objekt] || o0; if (o.ebenen) { this.bau(st, p, o); continue; } const zustand = p.zustand && o.zustaende ? o.zustaende[p.zustand] : null, bild = zustand ? zustand.bild : o.bild;
      this.mitBild("obj-" + p.objekt + (zustand ? "-" + p.zustand : ""), weltBild(bild), () => { if (st.stand === "aktiv") this.objekt(st, p, o, "obj-" + p.objekt + (zustand ? "-" + p.zustand : "")); }); }
    for (const f of d.figuren) this.mitBild("leute-" + f.figur, `${WELT.bild}img/echtzeit/${f.figur}.webp`, () => { if (st.stand === "aktiv") this.person(st, f); });
    if (TEST) this.testChunk(st);
  }
  objekt(st: Stueck, p: Platzierung, o: Anzeige, key: string) {
    const bild = this.add.image(p.x * F, p.y * F, key).setOrigin(p.spiegeln ? 1 - o.anker[0] : o.anker[0], o.anker[1]).setScale(o.massstab * (p.s ?? 1)).setFlipX(Boolean(p.spiegeln));
    bild.setDepth(o.tiefe === "boden" ? -5e5 + p.y : o.tiefe === "oben" ? 1e7 + p.y : p.y * F);
    st.dinge.push(bild); if (o.durchscheinend) st.scheinend.push(bild);
    if (o.modell3d) { let h = Math.imul(Math.round(p.x * 16) | 0, 0x9e3779b1) ^ Math.imul(Math.round(p.y * 16) | 0, 0x85ebca77); h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
      const gross = 5 / 6 + ((h >>> 20) % 1000) / 1000 * (2 / 6); bild.setScale(bild.scaleX * gross);   /* Bäume (Grundhöhe 6 m): je Standort fest 5–7 m */
      if (figur3dAn()) (st.baeume ||= []).push({ bild, m: o.modell3d, s: (p.s ?? 1) * gross, dreh: (h % 3600) / 3600 * Math.PI * 2, phase: ((h >>> 12) % 1000) / 1000 * 6.28, zuletzt: 0,
        alt: { key, ox: bild.originX, oy: bild.originY, sk: bild.scaleX, flip: bild.flipX } }); }   /* jeder Baum: eigene Drehung und eigener Windtakt, fest je Standort */
  }
  /** 3D-Bäume: sichtbare bekommen ihr 3D-Bild (und werden für den Wind gedrosselt neu gezeichnet), Bäume außerhalb des Bildes gehen aufs flache Bild zurück */
  baeumeWeiter() {
    const v = this.cameras.main.worldView, rand = 260, jetzt = performance.now(), zeit = jetzt / 1000; let budget = HANDY ? 4 : 10;
    for (const st of this.stuecke.values()) { if (st.stand !== "aktiv" || !st.baeume) continue;
      for (const e of st.baeume) { const x = e.bild.x, y = e.bild.y, sicht = x > v.x - rand && x < v.right + rand && y > v.y - rand && y < v.bottom + rand * 2;
        if (sicht && !e.b && !e.laedt) { e.laedt = true;
          void baumBild(weltBild(e.m.url), HELD_PX, { dreh: e.dreh, phase: e.phase, farbton: e.m.farbton ?? 0, saett: e.m.saett ?? 1, hell: e.m.hell ?? 1, wind: e.m.wind ?? 0.12, grau: e.m.grau ? 1 : 0 }).then((b) => { e.laedt = false;
            if (!b) return; if (e.weg || !e.bild.scene) { b.entfernen(); return; }
            const key = "baum3d:" + baumZaehler++, tex = this.textures.createCanvas(key, b.breite, b.hoehe) as Phaser.Textures.CanvasTexture; e.b = b; e.tex = tex;
            b.zeichne(zeit, tex.getContext()); tex.refresh(); e.zuletzt = performance.now();
            e.bild.setTexture(key).setOrigin(0.5, b.fussY).setScale(e.s / b.aufloesung).setFlipX(false); }); }
        else if (!sicht && e.b) this.baumZurueck(e);
        else if (e.b && e.tex && jetzt - e.zuletzt > BAUM_TAKT && budget > 0) { budget--; e.zuletzt = jetzt; e.b.zeichne(zeit, e.tex.getContext()); e.tex.refresh(); } } } }
  baumZurueck(e: Baum3D) { if (e.bild.scene) e.bild.setTexture(e.alt.key).setOrigin(e.alt.ox, e.alt.oy).setScale(e.alt.sk).setFlipX(e.alt.flip); if (e.b) e.b.entfernen(); if (e.tex) e.tex.destroy(); e.b = undefined; e.tex = undefined; }
  /** Ein räumliches Gebäude: jede Ebene ein eigenes Bild im gemeinsamen Rahmen, mit eigener Tiefe (Schatten liegt am Boden) */
  bau(st: Stueck, p: Platzierung, o: Anzeige) {
    const b: Bau = { teile: [], raum: (o.raum || []).map((r) => ({ x0: p.x + r.x0, x1: p.x + r.x1, y0: p.y + r.y0, y1: p.y + r.y1, koerper: r.koerper })), tueren: (o.tueren || []).map((t) => ({ x: p.x + t.x, y: p.y + t.y })) };
    st.bauten.push(b);
    for (const e of o.ebenen || []) this.mitBild("eb-" + e.bild, weltBild(e.bild), () => { if (st.stand !== "aktiv" || !st.bauten.includes(b)) return;
      const v = e.versatz || [0, 0], bild = this.add.image(p.x * F - o.anker[0] * o.groesse[0] + v[0], p.y * F - o.anker[1] * o.groesse[1] + v[1], "eb-" + e.bild).setOrigin(0, 0)
        .setDepth(e.rolle === "schatten" ? -5e5 + p.y : (p.y + e.tiefe) * F);
      if (e.rolle === "tuer_offen" || e.rolle === "innen") bild.setVisible(false);
      b.teile.push({ bild, rolle: e.rolle, tuer: e.tuer, koerper: e.koerper }); st.dinge.push(bild); });
  }
  /** Verdeckt dieses Bild den Helden? Es muss vor ihm einsortiert sein und an Brust oder Kopf wirklich etwas zeigen (Deckkraft des Bildpunkts, nicht das Bildrechteck) */
  deckt(o: Phaser.GameObjects.Image, px: number, py: number): boolean {
    if (!o.visible || o.alpha < 0.5 || o.depth <= py) return false;
    const l = o.x - o.originX * o.displayWidth, t = o.y - o.originY * o.displayHeight;
    const m = this.maske(o.texture.key); if (!m) return false;
    return [22, 46, 70].some((h) => { const x = (px - l) / o.scaleX, y = (py - h - t) / o.scaleY; if (x < 0 || y < 0 || x >= o.width || y >= o.height) return false;
      return m.d[Math.floor(y / m.s) * m.b + Math.floor(x / m.s)] === 1; });
  }
  /** Deckungsmaske eines Bildes (je 4 × 4 Bildpunkte ein Wert), einmal berechnet und gemerkt – Bildpunkte einzeln zurückzulesen wäre in jedem Bild zu teuer */
  masken = new Map<string, { b: number; s: number; d: Uint8Array } | null>();
  maske(key: string) {
    if (this.masken.has(key)) return this.masken.get(key) || null;
    let m: { b: number; s: number; d: Uint8Array } | null = null;
    try { const q = this.textures.get(key).getSourceImage() as HTMLImageElement, S = 4, b = Math.ceil(q.width / S), h = Math.ceil(q.height / S), c = document.createElement("canvas"); c.width = b; c.height = h;
      const g = c.getContext("2d", { willReadFrequently: true }); if (g) { g.drawImage(q, 0, 0, b, h); const px = g.getImageData(0, 0, b, h).data, d = new Uint8Array(b * h); for (let i = 0; i < b * h; i++) d[i] = px[i * 4 + 3] > 60 ? 1 : 0; m = { b, s: S, d }; } } catch { m = null; }
    this.masken.set(key, m); return m;
  }
  /** Eine Dorffigur: Blatt aus quadratischen Einzelbildern (Kantenlänge = Bildhöhe), ruhige Bewegung wie in den Orten */
  person(st: Stueck, f: Figur) {
    const roh = "leute-" + f.figur, blatt = "blatt-" + f.figur, quelle = this.textures.get(roh).getSourceImage() as HTMLImageElement, feld = quelle.height;
    if (!this.textures.exists(blatt)) this.textures.addSpriteSheet(blatt, quelle, { frameWidth: feld, frameHeight: feld });
    if (!this.anims.exists(blatt)) this.anims.create({ key: blatt, frames: this.anims.generateFrameNumbers(blatt, {}), frameRate: 2.5, repeat: -1, yoyo: true });
    const sp = this.add.sprite(f.x * F, f.y * F, blatt).setOrigin(0.5, 0.95).setScale(HELD_PX * 1.12 / feld).setFlipX(Boolean(f.links)).setDepth(f.y * F); sp.play(blatt); st.dinge.push(sp);
  }
  /** Einen Chunk aus dem Bild nehmen; Daten und Bodenbild bleiben im Speicher, die Textur wird freigegeben */
  verbergen(st: Stueck) { for (const e of st.baeume || []) { e.weg = true; if (e.b) { e.b.entfernen(); if (e.tex) e.tex.destroy(); e.b = undefined; } } st.baeume = []; for (const g of st.dinge) g.destroy(); st.dinge = []; st.scheinend = []; st.bauten = []; if (st.boden) { st.boden.destroy(); st.boden = undefined; } const key = "boden-" + st.name;
    /* Das Bodenbild behalten, bevor die Textur geht: Chunks, die schon beim Start geladen wurden, hätten es sonst nicht mehr */
    if (this.textures.exists(key)) { if (!st.bild) st.bild = this.textures.get(key).getSourceImage() as HTMLImageElement; this.textures.remove(key); } st.stand = "bereit"; }
  entladen(st: Stueck) { if (st.stand === "aktiv") this.verbergen(st); this.raster.weg_damit(st.cx, st.cy); this.stuecke.delete(st.name); this.mess.entladen++;
    /* Was preload geholt hat, liegt zusätzlich im Zwischenspeicher von Phaser */ this.cache.json.remove("chunk-" + st.name); }

  /** Der Strom: was im Bild ist, zeigen; den Ring dahinter holen; was weit weg ist, freigeben. Höchstens ein Chunk je Bild wird neu gezeigt. */
  strom() {
    const k = this.cameras.main, bw = k.width / k.zoom / CHUNK_PX, bh = k.height / k.zoom / CHUNK_PX, mx = (k.scrollX + k.width / 2) / CHUNK_PX, my = (k.scrollY + k.height / 2) / CHUNK_PX;
    /* Abstand eines Chunks vom Bildrand in Chunks (0 = im Bild) */
    const fern = (cx: number, cy: number) => Math.max(Math.max(mx - bw / 2 - (cx + 1), cx - (mx + bw / 2)), Math.max(my - bh / 2 - (cy + 1), cy - (my + bh / 2)), 0);
    const x0 = Math.floor(mx - bw / 2 - VORHOLEN), x1 = Math.floor(mx + bw / 2 + VORHOLEN), y0 = Math.floor(my - bh / 2 - VORHOLEN), y1 = Math.floor(my + bh / 2 + VORHOLEN);
    let naechster: Stueck | null = null, nd = Infinity;
    for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) { const n = chunkName(cx, cy); if (!this.gueltig.has(n)) continue; const d = fern(cx, cy); if (d > VORHOLEN) continue;
      let st = this.stuecke.get(n); if (!st) { st = { name: n, cx, cy, stand: "holt", dinge: [], scheinend: [], bauten: [], seit: 0 }; this.stuecke.set(n, st); this.holen(st); }
      else if (st.stand === "fehler" && this.time.now - st.seit > 4000) this.holen(st);
      if (st.stand === "bereit" && d <= ZEIGEN) { const a = Math.hypot(cx + 0.5 - mx, cy + 0.5 - my); if (a < nd) { nd = a; naechster = st; } } }
    if (naechster) this.zeigen(naechster);
    for (const st of [...this.stuecke.values()]) { const d = fern(st.cx, st.cy); if (st.stand === "aktiv" && d > ZEIGEN + 0.25) this.verbergen(st); if (d > BEHALTEN) this.entladen(st); }
  }

  /* ───────────── Spielablauf ───────────── */

  /** Was man hier tun kann: Ausgänge der Region und Interaktionen in der Nähe */
  umsehen() {
    const o = this.ort, r = this.regionBei(o.x, o.y); let nah: { text: string; tat: () => void } | null = null;
    if (r) for (const a of r.ausgaenge) if (inZone(a.zone, o.x, o.y)) nah = { text: a.text, tat: () => this.reisen(a) };
    const cx = Math.floor(o.x / C), cy = Math.floor(o.y / C);
    for (let dy = -1; dy <= 1 && !nah; dy++) for (let dx = -1; dx <= 1 && !nah; dx++) { const st = this.stuecke.get(chunkName(cx + dx, cy + dy)); if (!st || !st.daten) continue;
      for (const a of st.daten.interaktionen) if (Math.hypot(a.x - o.x, a.y - o.y) <= a.radius) { nah = this.interaktion(a); break; } }
    if ((nah ? nah.text : "") !== (this.nah ? this.nah.text : "")) { const kn = $("#ez-dorf-knopf"); kn.classList.remove("bald"); kn.hidden = !nah; if (nah) kn.textContent = nah.text + (HANDY ? "" : "  [E]"); }
    this.nah = nah;
  }
  /** Was eine Interaktion hier schon kann. Türen, Truhen, Schalter und Questziele entscheidet später der Server (Phase 10). */
  interaktion(a: Interaktion): { text: string; tat: () => void } | null {
    const text = a.daten && typeof a.daten.text === "string" ? a.daten.text : "";
    const tat = a.daten && typeof a.daten.tat === "string" ? a.daten.tat : "", knopf = a.daten && typeof a.daten.knopf === "string" ? a.daten.knopf : "";
    const ziel = a.daten && Array.isArray(a.daten.ziel) && a.daten.ziel.length === 2 ? (a.daten.ziel as number[]) : null;   /* Abstieg in den Untergrund und zurück */
    if (ziel) return { text: knopf || "Hinabsteigen", tat: () => this.springen(ziel[0], ziel[1]) };
    if (tat && WELT.tat) { const f = WELT.tat; return { text: WELT.knopf ? WELT.knopf(tat, knopf || "Betreten") : knopf || "Betreten", tat: () => f(tat, this) }; }
    if (text) return { text: "Ansehen", tat: () => this.sagen(text) };
    return null;
  }
  sagen(text: string) { const el = $("#ez-dorf-hilfe"); el.textContent = text; el.style.display = ""; }
  reisen(a: Ausgang) {
    if (WELT.ausgang && WELT.ausgang(a)) return;
    try { localStorage.removeItem("ez_welt_pos"); } catch { /* privat */ }
    const z = a.nach; if (z.art === "welt") { const r = this.index.regionen[z.region]; if (!r) return; const [x, y] = [z.x + r.region.ursprung[0] * C, z.y + r.region.ursprung[1] * C]; if (WELT.springen) WELT.springen(this); this.ort = { x, y }; this.pfad = []; this.marke.setVisible(false); this.cameras.main.centerOn(x * F, y * F); return; }
    this.gesperrt = true; location.href = z.art === "kampf" ? `./?ort=${encodeURIComponent(z.ort)}&kampf=${encodeURIComponent(z.kampf)}` : z.ort === "waldmark" ? "./?von=tor" : `./?ort=${encodeURIComponent(z.ort)}&eingang=1`;
  }

  gemerkt = 0; naechst = Infinity; stillstand = 0; vonTor: { x: number; y: number } | null = null;
  /** Eine Szene des Spiels starten (Riss) und abblenden – gemeinsame Schnittstelle mit der 3D-Welt (anschluss.ts WeltKern) */
  szeneStarten(key: string, daten: object): void { this.scene.start(key, daten); }
  abblenden(ms: number, dann: () => void): void { this.cameras.main.fadeOut(ms, 0, 0, 0); this.time.delayedCall(ms + 20, dann); }
  teleportAbreise(): number { return teleportAbreise(this.figur); }
  /** Stehen bleiben (vor einer Tafel) */
  halt() { this.rx = 0; this.ry = 0; this.tasten = {}; this.pfad = []; this.marke.setVisible(false); }
  /** Oben links Held, oben Mitte Region, oben rechts Minikarte, unten rechts Menü */
  profil() { WELT.hud.profil(this.held); WELT.hud.karte(); const h = this.hier; this.hier = ""; this.regionZeigen(); if (!this.hier) this.hier = h; if (WELT.menue) WELT.menue(this); }
  update(_t: number, dt: number) {
    if (!this.index) return; this.baeumeWeiter();
    const d = Math.min(0.05, dt / 1000), o = this.ort, D = HELDEN[this.held]; let rx = this.gesperrt ? 0 : this.rx, ry = this.gesperrt ? 0 : this.ry;
    if (this.drei && !this.stickDrei && (rx || ry)) [rx, ry] = this.drei.drehen(rx, ry);   /* Tasten: „hoch“ ist in 3D vom Betrachter weg (der Stick rechnet selbst um) */
    if (Math.hypot(rx, ry) > 0.05) { this.pfad = []; this.marke.setVisible(false); }
    else if (this.pfad.length) { const z = this.pfad[0], dx = z.x - o.x, dy = z.y - o.y, l = Math.hypot(dx, dy);
      /* Kommt der Held dem Wegpunkt eine Weile nicht näher (eine Kante schiebt ihn zurück), gilt der Punkt als erreicht */
      if (l < this.naechst - 0.03) { this.naechst = l; this.stillstand = 0; } else this.stillstand += d;
      if (l < 0.12 || this.stillstand > 0.6) { this.pfad.shift(); this.naechst = Infinity; this.stillstand = 0; if (!this.pfad.length) this.marke.setVisible(false); } else { rx = dx / l; ry = dy / l; } }
    const l = Math.hypot(rx, ry), faehrt = l > 0.05; this.faehrt = faehrt || this.pfad.length > 0;
    const fremd = WELT.fremd ? WELT.fremd(this, faehrt ? rx : 0, faehrt ? ry : 0) : false; /* im Kampfgebiet bewegt der Server den Helden */
    if (faehrt) { if (!fremd) { const k = Math.min(1, l) / l, e = { x: o.x + rx * k * D.tempo * d, y: o.y + ry * k * D.tempo * d, r: RADIUS }; this.raster.schieben(e); o.x = e.x; o.y = e.y; } if (WELT.richten) WELT.richten(this.figur, rx, ry); if (Math.abs(rx) > 0.35) this.figur.setFlipX(rx < 0); }
    if (faehrt !== this.laeuft && D.figur && D.lauf) { this.laeuft = faehrt;
      if (faehrt) { const L = D.laufMass || [0.5, 0.946, 0.91]; this.figur.play("lauf-" + this.held); this.figur.setOrigin(L[0], L[1]).setScale(HELD_PX / (L[2] * 176)); }
      else { const fu = D.fuss || [0.5, 0.94]; this.figur.stop(); this.figur.setTexture("figur-" + this.held); this.figur.setOrigin(fu[0], fu[1]).setScale(HELD_PX * (D.gross || 1) / this.figur.height); } }
    const px = o.x * F, py = o.y * F; this.figur.setPosition(px, py + 2).setDepth(py); this.ring.setPosition(px, py).setDepth(py - 0.01);

    /* Bäume und anderes Hohe wird durchscheinend, wenn der Held dahinter steht – nur in den Chunks um ihn herum */
    if (!DREI) { const cx = Math.floor(o.x / C), cy = Math.floor(o.y / C); for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const st = this.stuecke.get(chunkName(cx + dx, cy + dy)); if (!st) continue;
        for (const b of st.scheinend) {
          /* hinter einem Baum oder Haus: Fußpunkt davor, der Körper (Mitte gut 40 Bildpunkte über dem Fuß) innerhalb der Bildfläche – gemessen an der echten Fläche, nicht am Fußpunkt */
          const l = b.x - b.originX * b.displayWidth, o = b.y - b.originY * b.displayHeight, w = b.displayWidth, h = b.displayHeight;
          const hinter = b.depth > py && px > l + w * 0.14 && px < l + w * 0.86 && py - 40 > o + h * 0.04 && py < b.y, soll = hinter ? 0.4 : 1;
          if (Math.abs(b.alpha - soll) > 0.01) b.setAlpha(b.alpha + (soll - b.alpha) * 0.2); } } }
    /* Räumliche Gebäude: drinnen verschwinden Dach und Vordach, die Südwand wird fast durchsichtig; nahe einer Tür steht sie offen.
       Verdeckt ein Gebäude den Helden, erscheint die Silhouette. */
    { let verdeckt = false; const cx = Math.floor(o.x / C), cy = Math.floor(o.y / C), blend = (g: Phaser.GameObjects.Image, soll: number) => { if (Math.abs(g.alpha - soll) > 0.01) g.setAlpha(g.alpha + (soll - g.alpha) * 0.22); else g.setAlpha(soll); };
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const st = this.stuecke.get(chunkName(cx + dx, cy + dy)); if (!st) continue;
        for (const b of st.bauten) {
          /* Nur der Baukörper, in dem der Held steht, öffnet sich (ein nicht begehbarer Anbau behält sein Dach) */
          const hier = new Set(b.raum.filter((r) => o.x > r.x0 && o.x < r.x1 && o.y > r.y0 && o.y < r.y1).map((r) => r.koerper)), drinnen = hier.size > 0;
          for (const t of b.teile) { const auf = t.koerper !== undefined && hier.has(t.koerper);
            if (t.rolle === "dach" || t.rolle === "vordach") blend(t.bild, auf ? 0 : 1);
            else if (t.rolle === "vorn" || t.rolle === "tuer_zu" || t.rolle === "tuer_offen") blend(t.bild, auf ? 0.28 : 1); }
          /* Innenräume nur zeichnen, solange ihr Dach nicht ganz deckt (spart viel Zeichenarbeit) */
          for (const t of b.teile) if (t.rolle === "innen") t.bild.setVisible(hier.has(t.koerper as number) || b.teile.some((d) => d.rolle === "dach" && d.koerper === t.koerper && d.bild.alpha < 0.98));
          for (const t of b.teile) {
            if (t.tuer !== undefined) { const tp = b.tueren[t.tuer], offen = Boolean(tp) && Math.hypot(o.x - tp.x, o.y - tp.y) < 1.7; t.bild.setVisible(t.rolle === "tuer_offen" ? offen : !offen); }
            if (!verdeckt && !drinnen && t.rolle !== "schatten" && t.rolle !== "innen" && this.deckt(t.bild, px, py)) verdeckt = true; } } }
      if (!this.bildFigur) { this.figur.setDepth(verdeckt ? 1e7 - 1 : py).setAlpha(verdeckt ? 0.55 : 1); verdeckt = false; }
      this.silhouette.setVisible(verdeckt);
      if (verdeckt) this.silhouette.setTexture(this.figur.texture.key, this.figur.frame.name).setOrigin(this.figur.originX, this.figur.originY).setScale(this.figur.scaleX, this.figur.scaleY).setFlipX(this.figur.flipX).setPosition(this.figur.x, this.figur.y); }

    const k = this.cameras.main; k.scrollX += (px - k.width / 2 - k.scrollX) * 0.15; k.scrollY += (py - 30 - k.height / 2 - k.scrollY) * 0.15;
    this.strom(); this.umsehen(); this.regionZeigen();
    { const r = this.regionBei(o.x, o.y), pk = $("#ez-karte-punkt"); if (r) { pk.style.left = (100 * (o.x / C - r.region.ursprung[0]) / r.region.chunks[0]) + "%"; pk.style.top = (100 * (o.y / C - r.region.ursprung[1]) / r.region.chunks[1]) + "%"; } }
    if (this.time.now - this.gemerkt > 2000) { this.gemerkt = this.time.now; try { localStorage.setItem("ez_welt_pos", JSON.stringify([Math.round(o.x * 100) / 100, Math.round(o.y * 100) / 100, this.hier])); } catch { /* privat */ } }
    if (WELT.schritt) WELT.schritt(this, d);
    if (TEST) this.testWerte();
  }
  /** Einen Chunk ins Gehraster; gesperrte Bereiche (etwa ein geschlossenes Tor) gleich wieder sperren */
  rasterDazu(d: ChunkDaten) { this.raster.dazu(d); for (const [x0, y0, x1, y1] of WELT.sperren) this.raster.sperren(x0, y0, x1, y1); }

  /* ───────────── Testumgebung (?test=1) ───────────── */

  tafel!: HTMLElement; tafelZeit = 0;
  testAnzeige() { const el = document.createElement("pre"); el.id = "ez-welt-test"; el.style.cssText = "position:fixed;left:8px;bottom:8px;z-index:50;margin:0;padding:6px 9px;font:12px/1.35 ui-monospace,monospace;color:#d8f0c0;background:rgba(0,0,0,.72);border-radius:6px;pointer-events:none;white-space:pre"; document.body.appendChild(el); this.tafel = el; }
  /** Gehraster, Chunk-Grenze, Objektfüße und Zonen eines Chunks einzeichnen */
  testChunk(st: Stueck) { const d = st.daten as ChunkDaten, g = this.add.graphics().setDepth(2e7), x0 = st.cx * CHUNK_PX, y0 = st.cy * CHUNK_PX;
    for (let j = 0; j < C; j++) for (let i = 0; i < C; i++) { const c = d.geh[j][i]; if (c === ".") continue; g.fillStyle(c === "~" ? 0x3aa0ff : 0xff3030, 0.28).fillRect(x0 + i * F, y0 + j * F, F, F); }
    g.lineStyle(1, 0xffffff, 0.08); for (let i = 1; i < C; i++) { g.lineBetween(x0 + i * F, y0, x0 + i * F, y0 + CHUNK_PX); g.lineBetween(x0, y0 + i * F, x0 + CHUNK_PX, y0 + i * F); }
    g.lineStyle(3, 0xffe060, 0.9).strokeRect(x0, y0, CHUNK_PX, CHUNK_PX);
    for (const p of d.objekte) g.fillStyle(0xffffff, 0.95).fillCircle(p.x * F, p.y * F, 3);
    for (const a of d.interaktionen) g.lineStyle(2, 0x60ffd0, 0.9).strokeCircle(a.x * F, a.y * F, a.radius * F);
    const r = this.index.regionen[d.region]; if (r) { for (const z of r.spawnzonen) { g.lineStyle(2, 0xff60c0, 0.9); if (z.zone.art === "kreis") g.strokeCircle(z.zone.x * F, z.zone.y * F, z.zone.r * F); else g.strokeRect(z.zone.x0 * F, z.zone.y0 * F, (z.zone.x1 - z.zone.x0) * F, (z.zone.y1 - z.zone.y0) * F); }
      for (const a of r.ausgaenge) g.lineStyle(2, 0x60a0ff, 0.9).strokeRect(a.zone.x0 * F, a.zone.y0 * F, (a.zone.x1 - a.zone.x0) * F, (a.zone.y1 - a.zone.y0) * F); }
    st.dinge.push(g, this.add.text(x0 + 8, y0 + 6, st.name, { fontFamily: "monospace", fontSize: "20px", color: "#ffe060" }).setDepth(2e7)); }
  testWerte() { if (this.time.now - this.tafelZeit < 250) return; this.tafelZeit = this.time.now; let aktiv = 0, bereit = 0, holt = 0, dinge = 0; for (const s of this.stuecke.values()) { if (s.stand === "aktiv") { aktiv++; dinge += s.dinge.length; } else if (s.stand === "bereit") bereit++; else holt++; }
    const o = this.ort, m = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
    this.tafel.textContent = `Bilder/s ${this.game.loop.actualFps.toFixed(0)}   Zoom ${this.cameras.main.zoom.toFixed(2)}\nFeld ${o.x.toFixed(1)} | ${o.y.toFixed(1)}   Chunk ${Math.floor(o.x / C)}_${Math.floor(o.y / C)}   Region ${this.hier || "–"}\nChunks: ${aktiv} im Bild · ${bereit} bereit · ${holt} unterwegs   Raster ${this.raster.anzahl}\nObjekte im Bild ${dinge}   Anzeigeliste ${this.children.length}   Texturen ${this.textures.getTextureKeys().length}\ngeholt ${this.mess.geholt} · gezeigt ${this.mess.gezeigt} · entladen ${this.mess.entladen} · längstes Holen ${this.mess.laengsteMs.toFixed(0)} ms${m ? `\nSpeicher (JS) ${(m.usedJSHeapSize / 1048576).toFixed(0)} MB` : ""}`; }
}
