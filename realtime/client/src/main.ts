/*
 * Mythara Echtzeit – der Client: zeigt die Welt isometrisch, nimmt Klicks und Tasten entgegen, schickt sie als Eingaben
 * und stellt dar, was die Simulation zurückmeldet. Er entscheidet nichts über Treffer oder Schaden.
 */
import Phaser from "phaser";
import { HELDEN, HELDENREIHE, MONSTER, TICK, ZUSTAND_JE, setzeStaerke, HELDENSTUFE, HELDENEP, stufeAusEp, EP_BIS, STUFE_MAX } from "../../shared/config";
import { epAlle, epDazu } from "./halle";
import type { HeldDef } from "../../shared/config";
import { KB, KH, fels, SIEGEL, setzeKarte } from "../../shared/karte";
import { KARTEN, FEIN } from "../../shared/karten";
import { probeGeschafft, hudProfil, hudTitel, hudKarte } from "./hud";
import { kampfZusatz } from "./gruppe";
const MITGLIED = new URLSearchParams(location.search).get("mitglied") === "1"; /* Koop: Ich bin im Kampf eines anderen Spielers */
import { inKampagne, kampfJetzt, kampagneBeginnen, kampfGewonnen, plaudern, ORTSTUFE } from "./kampagne";
import type { Zustand, Ereignis, Taste } from "../../shared/sim";
import { BIT } from "../../shared/sim";
import { verbinde, Netz, SPIELSERVER } from "./netz";
import { Dorf } from "./dorf";
import { Stadt } from "./stadt";
import { zoomFaktor, zoomKnopf } from "./zoom";
import { kontoStart, kontoSeite, kontoName, kontoToken } from "./konto";
import { Ort, ortName } from "./ort";
import { Welt, weltName, WELT } from "./welt/welt";
import DEKOR from "./dekor.json"; // Maße und Fackelplätze, erzeugt von werkzeug/dekor.py

const P = new URLSearchParams(location.search), $ = (s: string) => document.querySelector(s) as HTMLElement;
/* Adresse des Spielservers. Leer = der Browser rechnet selbst. Wird nach dem Einrichten des Servers hier eingetragen; ?server=… überschreibt zum Testen. */
const P0 = new URLSearchParams(location.search);
/* Kampf einer Kampagne: gemalte Karte in Draufsicht statt des schrägen Dungeons. Die Karte wird eingesetzt, bevor irgendetwas rechnet. */
const FLACH = Boolean(kampfJetzt), ZELLE = 96 / FEIN; if (kampfJetzt) { setzeKarte(KARTEN[kampfJetzt.karte], FEIN); setzeStaerke(ORTSTUFE[P0.get("ort") || ""] || 1, 1 + kampfJetzt.mit.length); for (const [k, v] of Object.entries(epAlle())) { HELDENEP[k] = Number(v) || 0; HELDENSTUFE[k] = stufeAusEp(HELDENEP[k]); } }
/** Strecke zwischen zwei Orten (Waldweg): Bäume mit Verdeckung, Ausgänge statt Sieg */
const KK = kampfJetzt ? KARTEN[kampfJetzt.karte] : null, WEG = Boolean(KK && KK.weg);
const SERVER = FLACH ? "" : P.get("server") ?? SPIELSERVER; /* Kampagnen rechnet vorerst der Browser */ // // ?server= (leer) erzwingt das Rechnen im Browser
const WAHL = { held: HELDEN[P.get("held") || ""] ? (P.get("held") as string) : "schildwaechter", mit: (P.get("mit") || "").split(",").filter((x) => HELDEN[x]).slice(0, 2) };
const KW = DEKOR.KW, KHOCH = DEKOR.KHOCH, WAND = DEKOR.WAND; // Kachelbreite und -höhe am Bildschirm, Höhe einer Felswand
const iso = FLACH ? (x: number, y: number) => ({ x: x * ZELLE, y: y * ZELLE }) : (x: number, y: number) => ({ x: (x - y) * KW / 2, y: (x + y) * KHOCH / 2 });
const welt = FLACH ? (sx: number, sy: number) => ({ x: sx / ZELLE, y: sy / ZELLE }) : (sx: number, sy: number) => ({ x: sy / KHOCH + sx / KW, y: sy / KHOCH - sx / KW });
/** Zeichentiefe einer Stelle: was weiter vorn steht, verdeckt, was dahinter steht */
const tief = (x: number, y: number) => 10 + (FLACH ? y * 20 : (x + y) * 10);
const HANDY = window.matchMedia("(pointer: coarse)").matches || P.get("handy") === "1";

/** Ladebildschirm, solange der Spielserver aufwacht (kostenloser Dienst: bis zu einer Minute). grund leer = ausblenden. */
let ladeBeginn = 0;
/** Den Startbildschirm ausblenden (sobald das erste Bild des Spiels steht) */
export function startWeg(sofort = false) { const el = document.getElementById("ez-start"); if (!el || el.hidden) return; if (sofort) { el.hidden = true; return; } el.classList.add("weg"); setTimeout(() => { el.hidden = true; }, 500); }
setTimeout(() => startWeg(), 25000); /* zur Sicherheit: nie länger als 25 Sekunden */
function ladeschirm(grund: string) { const el = $("#ez-laden"); if (!el) return; if (grund) startWeg(true); /* der Ladebildschirm sieht gleich aus und übernimmt nahtlos */ if (!grund) { el.classList.add("weg"); setTimeout(() => { el.hidden = true; el.classList.remove("weg"); }, 400); ladeBeginn = 0; return; }
  if (!ladeBeginn) ladeBeginn = Date.now(); el.hidden = false; const s = Math.round((Date.now() - ladeBeginn) / 1000), anteil = Math.min(0.97, 1 - Math.exp(-s / 22)); /* gefühlter Fortschritt: am Anfang schnell, dann langsamer */
  (el.querySelector(".balken i") as HTMLElement).style.width = Math.round(anteil * 100) + "%"; (el.querySelector(".zeit") as HTMLElement).textContent = s < 2 ? "Verbinde mit dem Spielserver …" : `Der Spielserver erwacht … ${s} s`;
  (el.querySelector(".tipp") as HTMLElement).textContent = TIPPS[Math.floor(s / 8) % TIPPS.length]; }
const TIPPS = ["Nach einer Pause schläft der Server. Beim ersten Kampf dauert es deshalb bis zu einer Minute – danach geht es sofort.", "Gegner holen sichtbar aus. Wer dann aus der Reichweite geht, wird nicht getroffen.",
  "Leuchtet der Boden grün, lädt die alte Unke ihren Giftschwall. Raus aus dem Kreis!", "Seelensplitter hebst du auf, indem du darüberläufst. Erst „Kampf verlassen“ beendet den Kampf.", "Erfahrung bekommt jeder Held deines Teams – in der Heldenhalle siehst du die Stufen.", "Mit der Leertaste oder ⇄ wechselst du die Waffe."];
/** Bilder für die Aktionstasten (img/fx): je Held die Fähigkeiten Q, E, R und die beiden Waffen */
const SYMBOL: Record<string, { q?: string; e?: string; r?: string; modi?: string[] }> = {
  schildwaechter: { q: "welle", e: "schild", r: "aura", modi: ["symbole/schwert", "symbole/schild"] }, elementarist: { q: "eis", e: "blitz", r: "feuer", modi: ["symbole/elementarstab", "symbole/stab"] },
  lichtbringer: { q: "heil", e: "sterne", r: "licht", modi: ["symbole/heilstab", "symbole/streitkolben"] }, assassine: { q: "schatten", e: "gift", r: "blut", modi: ["dolch", "symbole/armbrust"] },
  kopfgeldjaeger: { q: "mal", e: "netz", r: "blut", modi: ["symbole/armbrust", "dolch"] } };
const symbolBild = (n: string) => n.includes("/") ? `../img/${n}.webp` : `../img/fx/${n}.webp`; /* „symbole/…“: eigene Bilder, sonst die Effektbilder */
/* Der Knopf „?“ oben rechts zeigt die Steuerung; beim ersten Kampf einer Sitzung ist sie ein paar Sekunden offen */
{ const f = document.getElementById("ez-frage"); if (f) { f.addEventListener("pointerdown", (e) => e.stopPropagation()); f.addEventListener("click", (e) => { e.stopPropagation(); document.body.classList.toggle("hilfe-an"); });
  let neu = true; try { neu = !sessionStorage.getItem("ez__hilfe"); sessionStorage.setItem("ez__hilfe", "1"); } catch { /* privat */ } if (neu) { document.body.classList.add("hilfe-an"); setTimeout(() => document.body.classList.remove("hilfe-an"), 9000); } } }
/** Die Bildangaben einer Figur, ob Held oder Monster */
const FIG = (typ: string, held: boolean | number) => (held ? HELDEN[typ] : MONSTER[typ]) as Partial<HeldDef> & { links?: boolean };
const ALLE: Record<string, Partial<HeldDef>> = { ...HELDEN, ...(MONSTER as unknown as Record<string, Partial<HeldDef>>) };

interface Bild { angelegt: number; oben: number; modus: number; hoch: number; ganz: boolean; laeuft: boolean; still: number; schlag: boolean; c: Phaser.GameObjects.Container; balken: Phaser.GameObjects.Graphics; name: Phaser.GameObjects.Text; ring: Phaser.GameObjects.Ellipse; kopf: Phaser.GameObjects.Image; von: { x: number; y: number }; nach: { x: number; y: number }; t0: number; lp: number; max: number; held: boolean; team: number; typ: string; tot: boolean }

class Spiel extends Phaser.Scene {
  netz!: Netz; z: Zustand | null = null; bilder = new Map<number, Bild>(); schuesse = new Map<number, Phaser.GameObjects.Arc>(); ichId = 0; zielMarke!: Phaser.GameObjects.Ellipse;
  zeiger = { x: 0, y: 0 }; tasten: Record<string, boolean> = {}; stick: { id: number; x: number; y: number } | null = null; gesendet = { x: 0, y: 0, t: 0 };
  beute = new Map<number, Phaser.GameObjects.Sprite>();
  gewonnen = false; tebbeRuf: Phaser.GameObjects.Text | null = null; tebbeOffen = false; tebbeNah = false; tebbeReden: (() => void) | null = null; /* nach dem Sieg: hinlaufen, dann ansprechen */
  deko: Phaser.GameObjects.Image[] = []; ausgang: string | null = null; verlaesst = false;
  constructor() { super("spiel"); }
  /** Bäume der Strecke: Fuß auf dem Boden, nach Tiefe sortiert wie die Figuren; leicht unterschiedlich getönt */
  dekoSetzen() { if (!KK || !KK.deko || !KK.dekoBilder) return; const Z = ZELLE * FEIN;
    for (const d of KK.deko) { const B = KK.dekoBilder[d.b]; if (!B) continue; const t = 0.86 + ((d.x * 7.3 + d.y * 3.1) % 1) * 0.14, f = (v: number) => Math.round(255 * Math.min(1, v));
      const im = this.add.image(d.x * Z, d.y * Z, "deko-" + d.b).setOrigin(B.fuss[0], B.fuss[1]).setScale(d.s).setDepth(tief(d.x * FEIN, d.y * FEIN) + 5).setTint(Phaser.Display.Color.GetColor(f(t), f(t * 1.02), f(t * 0.95)));
      this.deko.push(im); } }
  /** Ausgänge der Strecke: Steht der Held darin, bietet ein Knopf die Weiterreise an */
  ausgaengePruefen(x: number, y: number) { if (!KK || !KK.ausgaenge || this.verlaesst) return; const gx = x / FEIN, gy = y / FEIN, a = KK.ausgaenge.find((q) => gx >= q.x0 && gx <= q.x1 && gy >= q.y0 && gy <= q.y1) || null, nach = a ? a.nach : null;
    if (nach === this.ausgang) return; this.ausgang = nach; const kn = $("#ez-dorf-knopf"); if (!a) { kn.hidden = true; kn.onclick = null; return; }
    kn.textContent = a.text + " ▸"; kn.hidden = false; kn.onclick = () => this.streckeVerlassen(a.nach); }
  /** Die Strecke verlassen: erst gutschreiben lassen (EP, Seelensplitter von der Lichtung), dann weiter */
  streckeVerlassen(nach: string) { if (this.verlaesst) return; this.verlaesst = true; const kn = $("#ez-dorf-knopf"), s = P0.has("server") ? "&server=" + encodeURIComponent(P0.get("server") || "") : "";
    let neu = false; try { neu = Object.keys(JSON.parse(localStorage.getItem("ez_ort_" + nach) || "{}") || {}).length === 0; } catch { /* privat */ }
    const ziel = nach === "waldmark" ? "./" + (s ? "?" + s.slice(1) : "") : "?ort=" + nach + (neu ? "&neu=1" : "&eingang=1") + s;
    let fertig = false; const weiter = (w?: { ep?: Record<string, number>; seelen?: number }) => { if (fertig) return; fertig = true; window.removeEventListener("ez-server", hoer as EventListener);
      if (w && w.ep) { try { localStorage.setItem("ez_ep", JSON.stringify(w.ep)); localStorage.setItem("ez_seelen", String(w.seelen || 0)); } catch { /* privat */ } } location.href = ziel; };
    const hoer = (ev: CustomEvent<{ t: string; ep?: Record<string, number>; seelen?: number }>) => { if (ev.detail.t === "gutschrift") weiter(ev.detail); };
    this.richtung(0, 0); if (this.netz) this.netz.sende({ t: "halt" });
    if (this.netz && this.netz.art === "server" && this.serverKampf) { kn.textContent = "Wird gutgeschrieben …"; kn.onclick = null; window.addEventListener("ez-server", hoer as EventListener); this.netz.sende({ t: "verlassen" } as unknown as Parameters<Netz["sende"]>[0]); setTimeout(() => weiter(), 6000); return; }
    if (!kontoName() && this.z && this.z.splitter) { try { localStorage.setItem("ez_seelen", String((Number(localStorage.getItem("ez_seelen")) || 0) + this.z.splitter)); } catch { /* privat */ } } weiter(); }
  preload() { this.load.spritesheet("seelensplitter", "../img/echtzeit/seelensplitter.webp", { frameWidth: 192, frameHeight: 128 }); if (kampfJetzt && kampfJetzt.karte === "muehle") this.load.spritesheet("tebbe", "../img/echtzeit/tebbe.webp", { frameWidth: 240, frameHeight: 240 }); if (kampfJetzt) this.load.image("kampfkarte", "../" + KARTEN[kampfJetzt.karte].bild); if (KK && KK.dekoBilder) for (const n in KK.dekoBilder) this.load.image("deko-" + n, `../img/welt/${n}.webp`); this.load.image("boden", "../img/echtzeit/boden.webp"); this.load.spritesheet("wand", "../img/echtzeit/wand.webp", { frameWidth: KW, frameHeight: KHOCH + WAND }); this.load.spritesheet("fackel", "../img/echtzeit/fackel.webp", { frameWidth: 26, frameHeight: 78 }); this.load.spritesheet("rune", "../img/echtzeit/rune.webp", { frameWidth: 160, frameHeight: 160 });
    const alle: Record<string, string> = {}; for (const k in HELDEN) alle[k] = HELDEN[k].bild; for (const k in MONSTER) alle[k] = MONSTER[k].bild; for (const k in alle) this.load.image(k, "../" + alle[k]); for (const k in MONSTER) { const sz = MONSTER[k].spezial; if (sz && sz.bild) this.load.spritesheet("spezial-" + k, "../" + sz.bild, { frameWidth: 176, frameHeight: 176 }); } for (const k in ALLE) { if (ALLE[k].figur) this.load.image("figur-" + k, "../" + ALLE[k].figur); if (ALLE[k].schildStand) this.load.image("schildstand-" + k, "../" + ALLE[k].schildStand); for (const art of ["lauf", "hieb", "hieb2", "schild", "ruhe"] as const) { const pfad = ALLE[k][art]; if (pfad) this.load.spritesheet(art + "-" + k, "../" + pfad, { frameWidth: 176, frameHeight: 176 }); } } }
  create() {
    this.cameras.main.setBackgroundColor("#07060b"); if (FLACH) { this.add.image(0, 0, "kampfkarte").setOrigin(0, 0).setDisplaySize(KB * ZELLE, KH * ZELLE).setDepth(0); this.cameras.main.setBounds(0, 0, KB * ZELLE, KH * ZELLE); this.dekoSetzen();
      if (kampfJetzt && kampfJetzt.karte === "muehle") { /* Tebbe kauert am anderen Ufer vor der Mühle; ist der Kampf vorbei, will er reden */ const x = 9.5 * 96, y = 2.75 * 96; this.anims.create({ key: "tebbe", frames: this.anims.generateFrameNumbers("tebbe", {}), frameRate: 2.5, repeat: -1, yoyo: true });
        this.add.sprite(x, y, "tebbe").setOrigin(0.5, 0.957).setScale(42 / (0.805 * 240)).setDepth(tief(x / ZELLE, y / ZELLE) + 5).play("tebbe");
        this.tebbeRuf = this.add.text(x, y - 50, "!", { fontFamily: "Cinzel, Georgia, serif", fontSize: "40px", fontStyle: "bold", color: "#ffd23a", stroke: "#3a2400", strokeThickness: 7 }).setOrigin(0.5, 1).setDepth(99999).setVisible(false); this.tweens.add({ targets: this.tebbeRuf, y: y - 58, duration: 650, yoyo: true, repeat: -1 }); } } else { this.boden(); this.waende(); }
    for (const k in ALLE) { if (ALLE[k].lauf) this.anims.create({ key: "lauf-" + k, frames: this.anims.generateFrameNumbers("lauf-" + k, {}), frameRate: 11, repeat: -1 });
      if (ALLE[k].schild) this.anims.create({ key: "schild-" + k, frames: this.anims.generateFrameNumbers("schild-" + k, {}), frameRate: 10, repeat: -1 });
      if (ALLE[k].ruhe) this.anims.create({ key: "ruhe-" + k, frames: this.anims.generateFrameNumbers("ruhe-" + k, {}), frameRate: 6, repeat: -1 });
      { const sz = MONSTER[k] && MONSTER[k].spezial; if (sz && sz.bild) { this.anims.create({ key: "laden-" + k, frames: this.anims.generateFrameNumbers("spezial-" + k, { start: 0, end: 2 }), frameRate: 3, repeat: 0 }); this.anims.create({ key: "speien-" + k, frames: this.anims.generateFrameNumbers("spezial-" + k, { start: 3, end: 5 }), frameRate: 6, repeat: 0 }); } }
      for (const art of ["hieb", "hieb2"] as const) if (ALLE[k][art]) this.anims.create({ key: art + "-" + k, frames: this.anims.generateFrameNumbers(art + "-" + k, {}), frameRate: 20, repeat: 0 }); }
    this.licht(); if (!FLACH) this.fackeln();
    if (!FLACH) { const q = iso(SIEGEL.x, SIEGEL.y); this.anims.create({ key: "rune", frames: this.anims.generateFrameNumbers("rune", { start: 0, end: 8 }), frameRate: 9, repeat: -1 }); // die Siegelrune aus dem Würfelspiel, flach auf dem Boden
      const r = this.add.sprite(q.x, q.y, "rune").setDepth(2).setScale(0.62, 0.31).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.9); r.play("rune"); this.tweens.add({ targets: r, alpha: 0.55, duration: 1400, yoyo: true, repeat: -1, ease: "Sine.easeInOut" }); }
    this.zielMarke = this.add.ellipse(0, 0, 54, 27).setStrokeStyle(3, 0xff6a6a, 0.95).setDepth(2).setVisible(false);
    this.groesse(); zoomKnopf(() => this.groesse()); this.scale.on("resize", () => this.groesse());
    this.input.mouse?.disableContextMenu();
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => this.druck(p));
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => { if (this.stick && p.id === this.stick.id) this.knueppel(p); else if (!p.wasTouch) this.zeiger = this.zuWelt(p); });
    this.input.on("pointerup", (p: Phaser.Input.Pointer) => { if (this.stick && p.id === this.stick.id) { this.stick = null; $("#ez-stick").hidden = true; this.richtung(0, 0); } });
    const taste = (ev: KeyboardEvent, an: boolean) => { const k = ev.key.toLowerCase(); if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) { ev.preventDefault(); this.tasten[k] = an; const t = this.tasten; this.richtung((t.d || t.arrowright ? 1 : 0) - (t.a || t.arrowleft ? 1 : 0), (t.s || t.arrowdown ? 1 : 0) - (t.w || t.arrowup ? 1 : 0)); } else if (an && (k === "q" || k === "e" || k === "r")) this.faehig(k); else if (an && (k === " " || k === "f" || k === "tab")) { ev.preventDefault(); if (this.netz) this.netz.sende({ t: "modus" }); } };
    window.addEventListener("keydown", (ev) => { if (!ev.repeat) taste(ev, true); }); window.addEventListener("keyup", (ev) => taste(ev, false));
    window.addEventListener("blur", () => { this.tasten = {}; this.richtung(0, 0); });
    for (const b of Array.from(document.querySelectorAll<HTMLElement>("[data-taste]"))) b.addEventListener("pointerdown", (ev) => { ev.preventDefault(); ev.stopPropagation(); this.faehig(b.dataset.taste as Taste); });
    $("#ez-modus").addEventListener("pointerdown", (ev) => { ev.preventDefault(); ev.stopPropagation(); if (this.netz) this.netz.sende({ t: "modus" }); });
    $("#ez-neu").addEventListener("click", () => this.netz.sende({ t: "neu" }));
    const d = this.scene.settings.data as { held?: string; mit?: string[] }; if (kampfJetzt) { document.body.classList.add("kampagne"); const zi = $("#ez-ziel"); zi.textContent = kampfJetzt.ziel; zi.hidden = false; this.starte(kampfJetzt.held, kampfJetzt.mit); } else if (d && d.held) this.starte(d.held, d.mit || []); else wahlZeigen((held, mit) => this.starte(held, mit));
  }
  /** Nach der Heldenwahl: verbinden und loslegen */
  /** Kampagnenkampf über den Server? Nur mit Konto (der Server schreibt EP und Seelensplitter gut). ?server= erzwingt eine Adresse oder das Rechnen im Browser. */
  serverKampf = false;
  async starte(held: string, mit: string[]) {
    let url = SERVER, erste: unknown = undefined;
    if (FLACH && kampfJetzt) { const basis = P.has("server") ? P.get("server") || "" : SPIELSERVER, token = basis ? await kontoToken() : "";
      if (basis && token) { url = basis + "?kampf=" + encodeURIComponent(kampfJetzt.karte) + "&ort=" + encodeURIComponent(P0.get("ort") || "") + kampfZusatz(); erste = { t: "anmeldung", token }; this.serverKampf = true; } else url = ""; }
    const SERVER0 = url;
    /* Zwischenbuchungen des Servers: Die Werte aus der Datenbank gleich merken (falls der Tab danach abstürzt) */
    window.addEventListener("ez-server", (ev) => { const m = (ev as CustomEvent).detail as { t: string; ep?: Record<string, number>; seelen?: number }; if (m.t === "gebucht" && m.ep) { try { localStorage.setItem("ez_ep", JSON.stringify(m.ep)); localStorage.setItem("ez_seelen", String(m.seelen || 0)); } catch { /* privat */ } } });
    window.addEventListener("ez-server", (ev) => { const m = (ev as CustomEvent).detail as { t: string; text?: string }; if (m.t !== "koopstart") return; /* gemeinsamer Start in der Gruppe */
      const el = document.getElementById("ez-koopstart"); if (el) { el.hidden = !m.text; el.textContent = m.text || ""; } });
    if (MITGLIED) { /* Koop-Mitspieler: Gutschrift kommt vom Server, auch wenn der Anführer den Kampf beendet */
      window.addEventListener("ez-server", (ev) => { const m = (ev as CustomEvent).detail as { t: string; ep?: Record<string, number>; seelen?: number };
        if (m.t === "gutschrift" && m.ep) { try { localStorage.setItem("ez_ep", JSON.stringify(m.ep)); localStorage.setItem("ez_seelen", String(m.seelen || 0)); } catch { /* privat */ } }
        if (m.t === "koopende") { const a = $("#ez-art"); a.className = "ez-kasten lokal warnung"; a.textContent = "Der Anführer hat den Kampf verlassen – zurück in die Waldmark."; setTimeout(() => location.replace("./?ort=" + encodeURIComponent(P0.get("ort") || "") + "&mitreise=1" + (P0.has("server") ? "&server=" + encodeURIComponent(P0.get("server") || "") : "")), 2500); } }); }
    verbinde(url, held, mit, (z) => this.zustand(z), (art, grund) => { ladeschirm(art === "warte" ? grund : ""); $("#ez-art").textContent = art === "warte" ? grund : art === "server" ? "Server" + (grund ? " – " + grund : "") : "ohne Server (dein Browser rechnet)" + (SERVER0 && grund ? " – " + grund : ""); if (MITGLIED && art === "lokal") { const a = $("#ez-art"); a.className = "ez-kasten lokal warnung"; a.textContent = "Der gemeinsame Kampf ist nicht mehr da" + (grund ? " (" + grund + ")" : "") + " – zurück in die Waldmark."; setTimeout(() => location.replace("./"), 3000); return; }
      if (FLACH && art === "lokal" && kontoName()) { const a = $("#ez-art"); a.className = "ez-kasten lokal warnung"; a.textContent = "Ohne Server: EP und Seelensplitter aus diesem Kampf werden nicht gutgeschrieben." + (grund ? " Grund: " + grund + "." : ""); console.warn("Splitterlande:", a.textContent); return; } if (FLACH && art === "warte") $("#ez-art").style.display = "block"; else if (FLACH) $("#ez-art").style.display = ""; $("#ez-art").className = "ez-kasten " + art; }, erste).then((n) => { this.netz = n; (window as unknown as Record<string, unknown>).EZ = { szene: this, netz: n, zustand: () => this.z };
      $("#ez-hilfe").textContent = HANDY ? "Finger aufs Feld: laufen · Gegner antippen: Ziel – angegriffen wird in Reichweite · ⇄ Waffe wechseln · Q, E, R: Fähigkeiten" : "WASD: laufen · Klick auf einen Gegner: Ziel – angegriffen wird in Reichweite · Leertaste: Waffe wechseln · Q, E, R: Fähigkeiten in Mausrichtung"; });
  }
  groesse() { const k = this.cameras.main, h = this.scale.height; if (FLACH) { const w = this.scale.width; k.setZoom(Math.max(Math.min(w / (KB * ZELLE), h / (KH * ZELLE)), Phaser.Math.Clamp(h / (HANDY ? 470 : 760), 0.5, 2) * zoomFaktor())); return; } k.setZoom(Phaser.Math.Clamp(h / (HANDY ? 420 : 620), 0.7, 2.2) * zoomFaktor()); }
  /** Der Boden: ein gemaltes Bild aus den Raumkarten des Würfelspiels, mit Schatten und Fackellicht (werkzeug/dekor.py) */
  boden() { this.add.image(-DEKOR.OX, 0, "boden").setOrigin(0, 0).setDepth(0); }
  /** Mauern: je Feld ein gemauerter Block, nach Tiefe sortiert. Hinter einem Raum hoch, davor niedrig – so verdecken sie die Figuren nicht. */
  waende() { const WL = DEKOR.wandlicht as Record<string, number[]>;
    for (let j = -1; j <= KH; j++) for (let i = -1; i <= KB; i++) { if (!fels(i, j)) continue; let rand = false; for (let a = -1; a <= 1 && !rand; a++) for (let b = -1; b <= 1; b++) if (!fels(i + a, j + b)) { rand = true; break; } if (!rand) continue;
      const hoch = !fels(i, j + 1) || !fels(i + 1, j) || !fels(i + 1, j + 1), p = iso(i + 0.5, j + 0.5), art = Math.abs(i * 3 + j * 5) % DEKOR.SPIELARTEN + (hoch ? 0 : DEKOR.SPIELARTEN);
      const w = this.add.image(p.x, p.y, "wand", art).setOrigin(0.5, (KHOCH / 2 + WAND) / (KHOCH + WAND)).setDepth(10 + (i + j + 1) * 10 + 4), l = WL[i + "," + j] || [0.4, 0];
      const h = Math.min(1, 0.25 + l[0] * 0.75), f = (v: number) => Math.max(0, Math.min(255, Math.round(255 * v))); w.setTint(Phaser.Display.Color.GetColor(f(h * (1 + 0.12 * l[1])), f(h), f(h * (1 - 0.28 * l[1])))); } }
  /** Ein weicher Lichtfleck als Textur (für Fackelschein und Glut) */
  licht() { if (this.textures.exists("schein")) return; const t = this.textures.createCanvas("schein", 128, 128); if (!t) return; const c = t.getContext(), g = c.createRadialGradient(64, 64, 2, 64, 64, 64); g.addColorStop(0, "rgba(255,190,110,1)"); g.addColorStop(0.35, "rgba(255,140,60,.45)"); g.addColorStop(1, "rgba(255,110,40,0)"); c.fillStyle = g; c.fillRect(0, 0, 128, 128); t.refresh(); }
  /** Fackeln an den Wänden, mit flackerndem Schein auf Wand und Boden */
  fackeln() { this.anims.create({ key: "fackel", frames: this.anims.generateFrameNumbers("fackel", { start: 0, end: 8 }), frameRate: 11, repeat: -1 });
    for (const f of DEKOR.fackeln) { const p = iso(f.x, f.y), tief = 10 + (f.x + f.y) * 10 - 0.5, y = p.y - WAND * 0.42;
      const s = this.add.sprite(p.x, y, "fackel").setOrigin(0.5, 0.8).setScale(0.72).setDepth(tief + 0.2); s.play({ key: "fackel", startFrame: Math.floor(Math.random() * 9) });
      const an = this.add.image(p.x, y - 30, "schein").setBlendMode(Phaser.BlendModes.ADD).setScale(0.75).setAlpha(0.55).setDepth(tief + 0.1); // Schein an der Wand
      const unten = iso(f.x + (f.seite === "r" ? 0.7 : 0), f.y + (f.seite === "l" ? 0.7 : 0)), fleck = this.add.image(unten.x, unten.y, "schein").setBlendMode(Phaser.BlendModes.ADD).setScale(1.9, 0.95).setAlpha(0.22).setDepth(1); // Schein am Boden
      this.tweens.add({ targets: [an, fleck], alpha: "-=0.1", scaleX: "*=0.93", duration: 90 + Math.random() * 160, yoyo: true, repeat: -1, repeatDelay: Math.random() * 220, ease: "Sine.easeInOut" }); } }
  zuWelt(p: Phaser.Input.Pointer) { const w = this.cameras.main.getWorldPoint(p.x, p.y); return welt(w.x, w.y); }
  /** Laufrichtung senden. sx, sy: Richtung am Bildschirm (rechts, unten positiv); die Welt liegt um 45 Grad gedreht darunter. */
  richtung(sx: number, sy: number) {
    if (!this.netz) return; let x = FLACH ? sx : sx + sy, y = FLACH ? sy : sy - sx; const l = Math.hypot(x, y), staerke = Math.min(1, Math.hypot(sx, sy)); if (l > 0.01) { x = x / l * staerke; y = y / l * staerke; } else { x = 0; y = 0; }
    const jetzt = this.time.now, g = this.gesendet, steht = x === 0 && y === 0; if (!steht && jetzt - g.t < 60 && Math.hypot(x - g.x, y - g.y) < 0.6) return; // nicht öfter als nötig
    if (steht && g.x === 0 && g.y === 0) return; this.gesendet = { x, y, t: jetzt }; this.netz.sende({ t: "richtung", x, y });
  }
  /** Klick oder Tipp: auf einen Gegner = als Ziel wählen (angegriffen wird in Reichweite). Am Handy sonst: Steuerknüppel unter dem Finger. */
  druck(p: Phaser.Input.Pointer) {
    if (!this.netz || !this.z) return; const w = this.zuWelt(p); if (!p.wasTouch) this.zeiger = w;
    const ichE = this.z.w.find((e) => e[0] === this.ichId), heilt = Boolean(ichE && HELDEN[ichE[2]].modi[ichE[12]].art === "heil");
    let best: [number, number] | null = null; for (const e of this.z.w) { if ((e[3] === 0) !== heilt || e[10]) continue; const d = Math.hypot(e[4] - w.x, e[5] - w.y - 0.25); if (d < (p.wasTouch ? 1.3 : 0.95) && (!best || d < best[0])) best = [d, e[0]]; }
    if (best) { this.netz.sende({ t: "ziel", id: best[1] }); const ich = this.z.w.find((e) => e[0] === this.ichId), g = this.z.w.find((e) => e[0] === best![1]);
      if (ich && g && Math.hypot(ich[4] - g[4], ich[5] - g[5]) > HELDEN[ich[2]].modi[ich[12]].reich + 0.9) this.hinweis(g[4], g[5], "zu weit weg"); return; }
    if (p.wasTouch && !this.stick) { this.stick = { id: p.id, x: p.x, y: p.y }; const el = $("#ez-stick"); el.hidden = false; el.style.left = p.x + "px"; el.style.top = p.y + "px"; ($("#ez-stick i") as HTMLElement).style.transform = "translate(-50%, -50%)"; }
  }
  knueppel(p: Phaser.Input.Pointer) { const st = this.stick!, dx = p.x - st.x, dy = p.y - st.y, l = Math.hypot(dx, dy), m = 46; ($("#ez-stick i") as HTMLElement).style.transform = `translate(calc(-50% + ${dx / Math.max(l, 1) * Math.min(l, m)}px), calc(-50% + ${dy / Math.max(l, 1) * Math.min(l, m)}px))`;
    if (l < 8) this.richtung(0, 0); else { const k = Math.min(1, l / m); this.richtung(dx / l * k, dy / l * k); } }
  hinweis(x: number, y: number, t: string) { const q = iso(x, y), o = this.add.text(q.x, q.y - 70, t, { fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#ffd98a", stroke: "#000", strokeThickness: 3 }).setOrigin(0.5).setDepth(99999); this.tweens.add({ targets: o, y: q.y - 95, alpha: 0, duration: 900, onComplete: () => o.destroy() }); }
  /** Fähigkeit in Richtung des Mauszeigers; am Handy auf das aktuelle Ziel, sonst in Blickrichtung */
  faehig(taste: Taste) { if (!this.netz || !this.z) return; let ziel = this.zeiger; const ich = this.z.w.find((e) => e[0] === this.ichId);
    if (HANDY && ich) { const zi = this.z.w.find((e) => e[0] === this.z!.ich.zielId) || this.z.w.filter((e) => e[3] !== 0 && !e[10]).sort((a, b) => Math.hypot(a[4] - ich[4], a[5] - ich[5]) - Math.hypot(b[4] - ich[4], b[5] - ich[5]))[0];
      ziel = zi && Math.hypot(zi[4] - ich[4], zi[5] - ich[5]) < 8 ? { x: zi[4], y: zi[5] } : { x: ich[4] + Math.cos(ich[6]) * 3, y: ich[5] + Math.sin(ich[6]) * 3 }; }
    this.netz.sende({ t: "faehig", taste, x: ziel.x, y: ziel.y }); }

  figur(e: Zustand["w"][number]): Bild {
    const [id, held, typ, team] = e, r = held ? 20 : Math.round((MONSTER[typ]?.r || 0.35) * 56), c = this.add.container(0, 0);
    const schatten = this.add.ellipse(0, 0, r * 2.1, r * 1.05, 0x000000, 0.45), ring = this.add.ellipse(0, 0, r * 2.3, r * 1.15).setStrokeStyle(3, id === this.ichId ? 0xffffff : team === 0 ? 0x6aa5ff : 0xff6a6a, 0.95);
    const ganz = Boolean(FIG(typ, held).figur), hoch = ganz ? FIG(typ, held).hoehe || 84 : 2 * r + 8; let kopf: Phaser.GameObjects.Image, rand: Phaser.GameObjects.Arc;
    if (ganz) { const F = FIG(typ, held).fuss || [0.5, 0.94]; kopf = this.add.sprite(0, 3, "figur-" + typ).setOrigin(F[0], F[1]); kopf.setScale(hoch * (FIG(typ, held).gross || 1) / kopf.height); rand = this.add.circle(0, 0, 1).setVisible(false); } // ganze Figur: die Füße stehen mitten im Ring am Boden
    else if (!held && MONSTER[typ]?.unsichtbar) { /* schon auf die Karte gemalt (Laich): nur Ring, Name und Lebensbalken */ kopf = this.add.image(0, 0, typ).setVisible(false); rand = this.add.circle(0, 0, 1).setVisible(false); }
    else { kopf = this.add.image(0, -r - 8, typ); const mass = Math.min(kopf.width, kopf.height) || 1; kopf.setCrop((kopf.width - mass) / 2, 0, mass, mass).setDisplaySize(r * 2 * kopf.width / mass, r * 2 * kopf.height / mass).setOrigin(0.5, mass / 2 / kopf.height);
      const maske = this.make.graphics({}); maske.fillStyle(0xffffff).fillCircle(0, 0, r); kopf.setMask(maske.createGeometryMask()); (kopf as unknown as { m: Phaser.GameObjects.Graphics }).m = maske;
      rand = this.add.circle(0, -r - 8, r).setStrokeStyle(3, team === 0 ? (id === this.ichId ? 0xffffff : 0x6aa5ff) : MONSTER[typ]?.boss ? 0xffcf6a : 0xff6a6a, 1); }
    const balken = this.add.graphics(), oben = hoch * (ganz ? FIG(typ, held).gross || 1 : 1), name = this.add.text(0, -oben - 18, "", { fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#ffffff", stroke: "#000", strokeThickness: 3 }).setOrigin(0.5);
    c.add([schatten, ring, kopf, rand, balken, name]); const b: Bild = { angelegt: 0, oben, modus: 0, hoch, ganz, laeuft: false, still: 0, schlag: false, c, balken, name, ring, kopf, von: { x: e[4], y: e[5] }, nach: { x: e[4], y: e[5] }, t0: this.time.now, lp: -1, max: 0, held: Boolean(held), team, typ, tot: false };
    this.bilder.set(id, b); if (ganz && FIG(typ, held).ruhe) this.haltung(b); return b;
  }
  zustand(z: Zustand) {
    this.z = z; this.ichId = z.ich.id; const da = new Set<number>(), jetzt = this.time.now;
    for (const e of z.w) { da.add(e[0]); let b = this.bilder.get(e[0]); if (!b) b = this.figur(e);
      const hier = this.ort(b, jetzt); b.von = Math.hypot(hier.x - e[4], hier.y - e[5]) > 3 ? { x: e[4], y: e[5] } : hier; b.nach = { x: e[4], y: e[5] }; b.t0 = jetzt; // große Sprünge (Blinzeln, Wiederkehr) nicht nachziehen
      if (b.ganz && FIG(b.typ, b.held).lauf) { // Laufbilder, solange sich die Figur bewegt; steht sie kurz, wieder das Standbild
        const bewegt = Math.hypot(b.nach.x - b.von.x, b.nach.y - b.von.y) > 0.03 && !e[10]; if (bewegt) b.still = 0; else b.still++; const soll = bewegt || (b.laeuft && b.still < 3), sp = b.kopf as Phaser.GameObjects.Sprite;
        if (soll !== b.laeuft || b.modus !== e[12]) { b.laeuft = soll; b.modus = e[12]; if (!b.schlag) this.haltung(b); } void sp; }
      b.tot = Boolean(e[10]); b.c.setVisible(!b.tot); if (b.ganz) { const sx = FLACH ? Math.cos(e[6]) : Math.cos(e[6]) - Math.sin(e[6]); if (Math.abs(sx) > 0.25) b.kopf.setFlipX((sx < 0) !== Boolean(FIG(b.typ, b.held).links)); } // die Figur schaut in Laufrichtung (links/rechts am Bildschirm)
      if (b.lp !== e[7] || b.max !== e[8]) { b.lp = e[7]; b.max = e[8]; const r = b.held ? 20 : Math.round((MONSTER[b.typ]?.r || 0.35) * 56), w = r * 2.4, y = -b.oben - 8; b.balken.clear(); b.balken.fillStyle(0x000000, 0.7).fillRect(-w / 2, y, w, 6); b.balken.fillStyle(b.team === 0 ? 0x5fd08a : 0xff6a6a, 1).fillRect(-w / 2, y, w * Math.max(0, e[7] / e[8]), 6); }
      const bits = e[9], text = (b.held ? HELDEN[b.typ].name : MONSTER[b.typ].name) + (bits & BIT.betaeubt ? " ✦" : "") + (bits & BIT.langsam ? " ❄" : "") + (bits & BIT.dauer ? " ☠" : "") + (bits & BIT.mal ? " ◎" : "") + (e[11] > 0 ? " ⛨" + e[11] : ""); if (b.name.text !== text) b.name.setText(text);
      const stark = bits & (BIT.bollwerk | BIT.schild); b.ring.setStrokeStyle(stark ? 5 : 3, bits & BIT.bollwerk ? 0xffe08a : bits & BIT.schild ? 0xbfd6ff : bits & BIT.mal ? 0xffb347 : e[0] === this.ichId ? 0xffffff : b.team === 0 ? 0x6aa5ff : 0xff6a6a, 0.95); }
    for (const [id, b] of this.bilder) if (!da.has(id) && b.typ === "laich") this.laichWeg(b.c.x, b.c.y);
    for (const [id, b] of this.bilder) if (!da.has(id)) { const m = (b.kopf as unknown as { m?: Phaser.GameObjects.Graphics }).m; if (m) m.destroy(); b.c.destroy(); this.bilder.delete(id); }
    { /* Seelensplitter am Boden: leuchten und drehen sich, bis ein Held sie aufhebt */ if (!this.anims.exists("seelensplitter")) this.anims.create({ key: "seelensplitter", frames: this.anims.generateFrameNumbers("seelensplitter", {}), frameRate: 9, repeat: -1 });
      const da = new Set<number>(); for (const q of z.b || []) { da.add(q[0]); if (!this.beute.has(q[0])) { const o = iso(q[1], q[2]), sp = this.add.sprite(o.x, o.y - 14, "seelensplitter").setBlendMode(Phaser.BlendModes.ADD).setScale(q[3] > 9 ? 0.62 : 0.42).setDepth(tief(q[1], q[2]) + 4); sp.play({ key: "seelensplitter", startFrame: Math.floor(Math.random() * 9) }); sp.setAlpha(0); this.tweens.add({ targets: sp, alpha: 1, y: o.y - 22, duration: 350 }); this.beute.set(q[0], sp); } }
      for (const [id, sp] of this.beute) if (!da.has(id)) { this.beute.delete(id); this.tweens.add({ targets: sp, alpha: 0, scale: 0.1, y: sp.y - 40, duration: 260, onComplete: () => sp.destroy() }); } }
    const sda = new Set<number>(); for (const g of z.g) { sda.add(g[0]); let s = this.schuesse.get(g[0]); const p = iso(g[1], g[2]); if (!s) { s = this.add.circle(p.x, p.y - 24, g[3] === "feuer" ? 10 : g[3] === "erlegen" ? 7 : g[3] === "blitz" ? 5 : 3.5, g[3] === "feuer" ? 0xff8a2a : g[3] === "blitz" ? 0x9ad0ff : 0xe8dcc0); this.schuesse.set(g[0], s); } this.tweens.add({ targets: s, x: p.x, y: p.y - 24, duration: 1000 * ZUSTAND_JE / TICK }); s.setDepth(10 + (g[1] + g[2]) * 10 + 8); }
    for (const [id, s] of this.schuesse) if (!sda.has(id)) { s.destroy(); this.schuesse.delete(id); }
    for (const ev of z.ev) this.ereignis(ev);
    this.schleuse(z);
    this.anzeige(z);
  }
  /** Zerschlagener Laich: Schlamm deckt die gemalten Eier zu, ein paar Spritzer fliegen */
  laichWeg(x: number, y: number) {
    const fleck = this.add.ellipse(x, y, 150, 78, 0x2b2a17, 0.92).setDepth(1).setScale(0.2); this.tweens.add({ targets: fleck, scale: 1, duration: 260, ease: "Quad.easeOut" });
    const rand = this.add.ellipse(x, y, 150, 78).setStrokeStyle(3, 0x4a4626, 0.8).setDepth(1).setAlpha(0); this.tweens.add({ targets: rand, alpha: 1, delay: 200, duration: 200 });
    for (let i = 0; i < 10; i++) { const a = Math.random() * Math.PI * 2, s = this.add.circle(x, y - 10, 3 + Math.random() * 4, i % 2 ? 0x8fbf5a : 0x5a5a32).setDepth(99990); this.tweens.add({ targets: s, x: x + Math.cos(a) * (50 + Math.random() * 40), y: y - 10 + Math.sin(a) * 30 - 20, alpha: 0, duration: 500 + Math.random() * 300, onComplete: () => s.destroy() }); }
  }
  /* ---------- Die Schleuse im Mühlgraben: Hebel am Ufer, Ring zeigt das Schließen, oben steht das Ziel ---------- */
  hebel: { c: Phaser.GameObjects.Container; griff: Phaser.GameObjects.Rectangle; ring: Phaser.GameObjects.Graphics; schein: Phaser.GameObjects.Ellipse; offen: boolean } | null = null;
  schleuse(z: Zustand) {
    const sl = z.sl; if (!sl) return; const [x, y, offen, fort] = sl;
    if (!this.hebel) { const p = iso(x, y), c = this.add.container(p.x, p.y).setDepth(tief(x, y));
      const schein = this.add.ellipse(0, 0, 92, 46, 0x8fd8ff, 0.18).setStrokeStyle(2, 0x8fd8ff, 0.7); this.tweens.add({ targets: schein, alpha: { from: 1, to: 0.35 }, scale: { from: 0.95, to: 1.08 }, duration: 900, yoyo: true, repeat: -1 });
      const sockel = this.add.ellipse(0, 2, 34, 16, 0x3a3a3a).setStrokeStyle(2, 0x1a1a1a), pfosten = this.add.rectangle(0, -20, 9, 40, 0x6b4a2a).setStrokeStyle(2, 0x2a1a0c);
      const griff = this.add.rectangle(0, -36, 6, 36, 0x9a7a4a).setStrokeStyle(2, 0x2a1a0c).setOrigin(0.5, 1).setAngle(-40), knauf = this.add.circle(0, -38, 5, 0xc9a85a).setStrokeStyle(2, 0x2a1a0c);
      const ring = this.add.graphics(), schild = this.add.text(30, -6, "Schleuse", { fontFamily: "Cinzel, Georgia, serif", fontSize: "15px", color: "#ffe9a8", stroke: "#000", strokeThickness: 4 }).setOrigin(0, 0.5).setResolution(2);
      c.add([schein, ring, sockel, pfosten, griff, knauf, schild]); this.hebel = { c, griff, ring, schein, offen: true }; }
    const H = this.hebel; H.ring.clear(); if (offen && fort > 0) { H.ring.lineStyle(6, 0x000000, 0.55).beginPath().arc(0, -10, 40, 0, Math.PI * 2).strokePath(); H.ring.lineStyle(5, 0xffd75e, 1).beginPath().arc(0, -10, 40, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fort).strokePath(); }
    if (H.offen && !offen) { H.offen = false; this.tweens.add({ targets: H.griff, angle: 40, duration: 450, ease: "Back.easeOut" }); H.schein.setVisible(false); }
    const zi = $("#ez-ziel"); if (!this.gewonnen && kampfJetzt) { const soll = offen ? (fort > 0 ? `Schleuse schließen … ${Math.ceil((1 - fort) * 3)} s` : "Schließe die Schleuse am Mühlhaus – drei Sekunden am Hebel stehen") : kampfJetzt.ziel; if (zi.textContent !== soll) zi.textContent = soll; }
  }
  /** Das passende Bild für eine ganze Figur: Laufbilder oder Standbild (der Schwerthieb läuft für sich und kehrt danach hierher zurück) */
  haltung(b: Bild) { const sp = b.kopf as Phaser.GameObjects.Sprite, D = FIG(b.typ, b.held), L = D.laufMass || [0.5, 0.946, 0.91]; sp.setAngle(0).setX(0);
    if (b.modus === 1 && D.schild) { // zweite Waffe: Schild erhoben
      if (b.laeuft) { sp.setOrigin(0.5, 0.946).setScale(b.hoch / (0.855 * 176)); sp.play("schild-" + b.typ); }
      else { sp.stop(); if (D.schildStand) { const F = D.schildFuss || [0.5, 0.95, 1]; sp.setTexture("schildstand-" + b.typ); sp.setOrigin(F[0], F[1]).setScale(b.hoch * F[2] / sp.height); } else { sp.setOrigin(0.5, 0.946).setScale(b.hoch / (0.855 * 176)); sp.setTexture("schild-" + b.typ, 0); } } }
    else if (b.laeuft && D.lauf) { sp.play("lauf-" + b.typ); sp.setOrigin(L[0], L[1]).setScale(b.hoch / (L[2] * 176)); } else if (D.ruhe) { const M = D.ruheMass || [0.5, 0.945, 0.91]; sp.play("ruhe-" + b.typ); sp.setOrigin(M[0], M[1]).setScale(b.hoch / (M[2] * 176)); } else { sp.stop(); sp.setTexture("figur-" + b.typ); const F = D.fuss || [0.5, 0.94]; sp.setOrigin(F[0], F[1]).setScale(b.hoch * (D.gross || 1) / sp.height); } }
  ort(b: Bild, jetzt: number) { const k = Math.min(1, (jetzt - b.t0) / (1000 * ZUSTAND_JE / TICK)); return { x: b.von.x + (b.nach.x - b.von.x) * k, y: b.von.y + (b.nach.y - b.von.y) * k }; }
  ereignis(ev: Ereignis) {
    const zahl = (x: number, y: number, t: string, farbe: string, gross = false) => { const p = iso(x, y), o = this.add.text(p.x, p.y - 60, t, { fontFamily: "Inter, sans-serif", fontSize: gross ? "18px" : "15px", fontStyle: "bold", color: farbe, stroke: "#000", strokeThickness: 3 }).setOrigin(0.5).setDepth(99999); this.tweens.add({ targets: o, y: p.y - 100, alpha: 0, duration: gross ? 1400 : 800, onComplete: () => o.destroy() }); };
    const b = "id" in ev ? this.bilder.get(ev.id) : undefined;
    if (ev.a === "schaden" && b) zahl(b.nach.x, b.nach.y, String(ev.n), ev.art === "gift" ? "#9be36a" : ev.art === "blut" ? "#e0605a" : ev.art === "brand" ? "#ffa64d" : ev.art === "licht" ? "#fff2a8" : b.team === 0 ? "#ff8a8a" : "#ffffff");
    else if (ev.a === "null" && b) zahl(b.nach.x, b.nach.y, "0", "#8fa3c8"); // Trefferwurf verloren: die blaue Null
    else if (ev.a === "block" && b) zahl(b.nach.x, b.nach.y, "Block", "#bfd6ff");
    else if (ev.a === "heil" && b) zahl(b.nach.x, b.nach.y, "+" + ev.n, "#8dffb0");
    else if (ev.a === "text" && b) zahl(b.nach.x, b.nach.y, ev.t, "#ffd98a", true);
    else if (ev.a === "aushol" && b) { const o = this.add.ellipse(b.c.x, b.c.y, 70, 35, 0xff3030, 0.18).setStrokeStyle(2, 0xff5050, 0.9).setDepth(3); this.tweens.add({ targets: o, fillAlpha: 0.55, scale: 1.25, duration: ev.t * 1000, onComplete: () => o.destroy() }); if (b.ganz) this.ereignis({ a: "anlegen", id: ev.id, t: ev.t }); else if (!this.tweens.isTweening(b.kopf)) this.tweens.add({ targets: b.kopf, y: b.kopf.y - 7, duration: ev.t * 500, yoyo: true }); } // der Gegner holt aus: jetzt weglaufen
    else if ((ev.a === "hieb" || ev.a === "anlegen") && b) { const D = FIG(b.typ, b.held), art = D && b.modus === 1 && D.hieb2 ? "hieb2" : "hieb";
      if (ev.a === "hieb" && this.time.now - b.angelegt < 900) return; // Fernkampf: die Bewegung läuft schon seit dem Anlegen
      if (ev.a === "anlegen") b.angelegt = this.time.now;
      if (b.ganz && D && D[art]) { const sp = b.kopf as Phaser.GameObjects.Sprite, M = (art === "hieb2" ? D.hieb2Mass : D.hiebMass) || [0.5, 0.955, 0.91], n = this.anims.get(art + "-" + b.typ).frames.length; b.schlag = true; sp.setAngle(0).setX(0).setOrigin(M[0], M[1]).setScale(b.hoch / (M[2] * 176));
        sp.play({ key: art + "-" + b.typ, frameRate: ev.a === "anlegen" ? Math.round(n * 0.55) / ev.t : 20 }); sp.off("animationcomplete"); sp.once("animationcomplete", () => { b.schlag = false; this.haltung(b); }); } // beim Anlegen so schnell, dass nach gut der Hälfte der Bilder der Schuss fällt
      else if (b.ganz) { if (!this.tweens.isTweening(b.kopf)) this.tweens.add({ targets: b.kopf, x: b.kopf.flipX ? -9 : 9, angle: b.kopf.flipX ? -7 : 7, duration: 80, yoyo: true }); } else if (!this.tweens.isTweening(b.kopf)) this.tweens.add({ targets: b.kopf, scale: b.kopf.scale * 1.18, duration: 70, yoyo: true }); }
    else if (ev.a === "ep" && kampfJetzt) { if (kontoName() && !this.serverKampf) { zahl(ev.x, ev.y - 0.5, "+" + ev.n + " EP (nicht gutgeschrieben)", "#9a9a9a"); return; } const team = [kampfJetzt.held, ...kampfJetzt.mit]; for (const h of team) epDazu(h, ev.n); /* für die Anzeige; mit Konto ersetzt der Server die Werte beim Verlassen */ zahl(ev.x, ev.y - 0.5, "+" + ev.n + " EP", "#c8f59a");
      const xp = document.getElementById("ez-xpleiste"); if (xp) { xp.classList.remove("plus"); void xp.offsetWidth; xp.classList.add("plus"); } }
    else if (ev.a === "stufe") { /* Stufenaufstieg mitten im Kampf: Lichtsäule, Ring und Schrift über dem Helden */ const b = this.bilder.get(ev.id); if (!b) return; const x = b.c.x, y = b.c.y, ich = ev.id === this.ichId;
      const saeule = this.add.rectangle(x, y - 60, 70, 170, 0xffe9a8, 0.35).setDepth(99990).setBlendMode(Phaser.BlendModes.ADD); this.tweens.add({ targets: saeule, scaleX: 0.2, alpha: 0, duration: 1100, onComplete: () => saeule.destroy() });
      const ring = this.add.ellipse(x, y, 60, 26).setStrokeStyle(4, 0xffd75e, 1).setDepth(99990); this.tweens.add({ targets: ring, scaleX: 3, scaleY: 3, alpha: 0, duration: 900, onComplete: () => ring.destroy() });
      const o = this.add.text(x, y - 120, (ich ? "" : HELDEN[b.typ].name + " · ") + "Stufe " + ev.s + "!", { fontFamily: "Cinzel, Georgia, serif", fontSize: ich ? "28px" : "20px", fontStyle: "bold", color: "#ffe9a8", stroke: "#3a2400", strokeThickness: 6 }).setOrigin(0.5).setDepth(99999);
      this.tweens.add({ targets: o, y: o.y - 50, alpha: 0, delay: 1100, duration: 1300, onComplete: () => o.destroy() }); if (ich) { this.cameras.main.flash(260, 255, 230, 160); } }
    else if (ev.a === "auftauchen") { /* eine Kröte kriecht aus dem Graben: Wasser spritzt */ const p = iso(ev.x, ev.y); for (let i = 0; i < 2; i++) { const o = this.add.ellipse(p.x, p.y, 40, 18).setStrokeStyle(3, 0x9fd8ff, 0.9).setDepth(3); this.tweens.add({ targets: o, scale: 2.6, alpha: 0, delay: i * 180, duration: 700, onComplete: () => o.destroy() }); }
      const jb = this.bilder.get(ev.id); zahl(ev.x, ev.y - 0.4, jb && jb.typ === "kroetchen" ? "geschlüpft!" : "aus dem Graben!", "#9fd8ff"); }
    else if (ev.a === "aufstehen") { const p = iso(ev.x, ev.y), o = this.add.ellipse(p.x, p.y, 90, 44, 0x1a2a1a, 0.7).setDepth(2); this.tweens.add({ targets: o, alpha: 0, scale: 1.4, delay: 1800, duration: 700, onComplete: () => o.destroy() }); zahl(ev.x, ev.y - 0.6, "steht wieder auf …", "#b7d6a0"); }
    else if (ev.a === "blinzeln") { /* Irrlicht huscht davon: Lichtblitz am neuen Ort */ const p = iso(ev.x, ev.y), o = this.add.circle(p.x, p.y - 30, 34, 0x9fd8ff, 0.6).setBlendMode(Phaser.BlendModes.ADD).setDepth(99990); this.tweens.add({ targets: o, scale: 2, alpha: 0, duration: 450, onComplete: () => o.destroy() }); zahl(ev.x, ev.y - 0.6, "huscht davon!", "#9fd8ff"); }
    else if (ev.a === "schleuse") { const p = iso(ev.x, ev.y), o = this.add.text(p.x, p.y - 110, "Die Schleuse ist zu!", { fontFamily: "Cinzel, Georgia, serif", fontSize: "26px", fontStyle: "bold", color: "#ffe9a8", stroke: "#3a2400", strokeThickness: 6 }).setOrigin(0.5).setDepth(99999);
      this.tweens.add({ targets: o, y: o.y - 40, alpha: 0, delay: 1400, duration: 1200, onComplete: () => o.destroy() }); this.cameras.main.flash(220, 160, 210, 255); }
    else if (ev.a === "splitter") zahl(ev.x, ev.y, "◈ +" + ev.n, FLACH ? "#8fd8ff" : "#ff9aa8");
    else if (ev.a === "laden") { /* Spezialangriff: Die Fläche am Boden füllt sich, während der Gegner lädt */ const p = iso(ev.x, ev.y), rx = ev.r * (FLACH ? ZELLE : KW * 0.705), ry = ev.r * (FLACH ? ZELLE : KHOCH * 0.705);
      const rand = this.add.ellipse(p.x, p.y, rx * 2, ry * 2, 0xb8ff3a, 0.12).setStrokeStyle(3, 0xd8ff5a, 0.95).setDepth(3), kern = this.add.ellipse(p.x, p.y, rx * 2, ry * 2, 0x9be020, 0.45).setDepth(3).setScale(0.05);
      this.tweens.add({ targets: kern, scale: 1, duration: ev.t * 1000, onComplete: () => { kern.destroy(); rand.destroy(); } }); this.tweens.add({ targets: rand, alpha: 0.5, duration: 350, yoyo: true, repeat: Math.floor(ev.t * 1000 / 700) });
      const b2 = this.bilder.get(ev.id), sz = b2 && MONSTER[b2.typ].spezial; if (b2 && sz && sz.bild) { const sp = b2.kopf as Phaser.GameObjects.Sprite, M = sz.mass || [0.5, 0.9, 0.8]; b2.schlag = true; sp.off("animationcomplete"); sp.setOrigin(M[0], M[1]).setScale(b2.hoch / (M[2] * 176)); sp.play("laden-" + b2.typ); } }
    else if (ev.a === "speien") { const p = iso(ev.x, ev.y), o = this.add.ellipse(p.x, p.y, ev.r * 2 * (FLACH ? ZELLE : KW * 0.705), ev.r * 2 * (FLACH ? ZELLE : KHOCH * 0.705), 0xd8ff5a, 0.8).setDepth(3); this.tweens.add({ targets: o, alpha: 0, scale: 1.15, duration: 600, onComplete: () => o.destroy() }); this.cameras.main.shake(180, 0.006);
      const b2 = this.bilder.get(ev.id), sz = b2 && MONSTER[b2.typ].spezial; if (b2 && sz && sz.bild) { const sp = b2.kopf as Phaser.GameObjects.Sprite; sp.play("speien-" + b2.typ); sp.once("animationcomplete", () => { b2.schlag = false; this.haltung(b2); }); } }
    else if (ev.a === "knall") { const p = iso(ev.x, ev.y), f = ev.farbe === "eis" ? 0x8fd8ff : ev.farbe === "blitz" ? 0xd9c8ff : ev.farbe === "licht" ? 0xfff2a8 : 0xff8a2a, o = this.add.ellipse(p.x, p.y, ev.r * (FLACH ? 2 * ZELLE : KW * 1.41), ev.r * (FLACH ? 2 * ZELLE : KHOCH * 1.41), f, 0.5).setDepth(3); this.tweens.add({ targets: o, alpha: 0, scale: 1.12, duration: 420, onComplete: () => o.destroy() }); if (ev.farbe === "feuer" || ev.farbe === "blitz") this.cameras.main.shake(110, 0.004); }
  }
  /** Die Begleiter unter dem eigenen Helden: Bild, Stufe, Leben und Erfahrung */
  gefolgeIds = "";
  gefolge(z: Zustand, ichId: number) {
    const el = $("#ez-gefolge"), mit = z.w.filter((e) => e[1] && e[0] !== ichId && e[3] === 0), ids = mit.map((e) => e[0] + ":" + e[2]).join(",");
    if (ids !== this.gefolgeIds) { this.gefolgeIds = ids; el.innerHTML = mit.map((e) => `<div class="mit" data-id="${e[0]}"><span class="bild"><img src="../${HELDEN[e[2]].bild}" alt=""><em hidden></em></span><div class="werte"><b>${HELDEN[e[2]].name}</b><span class="leiste"><b class="herz">♥</b><i class="ez-balken"><u></u><small></small></i></span><span class="leiste ep" hidden><b class="stern">✦</b><i class="ez-balken xp"><u></u><small></small></i></span></div></div>`).join(""); }
    for (const e of mit) { const d = el.querySelector(`[data-id="${e[0]}"]`) as HTMLElement | null; if (!d) continue; const tot = Boolean(e[10]); d.classList.toggle("tot", tot);
      const [lp, ep] = Array.from(d.querySelectorAll(".leiste")) as HTMLElement[]; (lp.querySelector("u") as HTMLElement).style.width = Math.round(100 * e[7] / e[8]) + "%"; (lp.querySelector("small") as HTMLElement).textContent = tot ? "gefallen" : `${e[7]} / ${e[8]}`;
      const s = z.st && z.st[e[2]], em = d.querySelector("em") as HTMLElement; ep.hidden = !(FLACH && s); em.hidden = !s; if (s) { const [st, x] = s, von = EP_BIS[st], bis = st < STUFE_MAX ? EP_BIS[st + 1] : von; em.textContent = "St. " + st;
        (ep.querySelector("u") as HTMLElement).style.width = (st < STUFE_MAX ? Math.min(100, Math.round(100 * (x - von) / (bis - von))) : 100) + "%"; (ep.querySelector("small") as HTMLElement).textContent = st < STUFE_MAX ? `${x - von} / ${bis - von} EP` : "höchste Stufe"; } }
  }
  anzeige(z: Zustand) {
    const ich = z.w.find((e) => e[0] === z.ich.id); if (!ich) return; const D = HELDEN[ich[2]], W = D.modi[z.ich.modus];
    $("#ez-name").textContent = `${D.name} · ${W.name}`; ($("#ez-lp") as HTMLElement).style.width = Math.round(100 * ich[7] / ich[8]) + "%"; $("#ez-lpzahl").textContent = ich[10] ? `gefallen – zurück in ${Math.ceil(z.ich.wieder)} s` : `${ich[7]} / ${ich[8]}` + (ich[11] > 0 ? ` · Schutz ${ich[11]}` : "");
    { const pb = document.getElementById("ez-probe"), K = kampfJetzt && KARTEN[kampfJetzt.karte]; if (pb && FLACH && K && K.probe) { pb.hidden = false; const st = z.pr || 0; pb.className = "ez-kasten" + (st === 1 ? " ja" : st === 2 ? " nein" : ""); const t = (st === 1 ? "★ Geschafft: " : st === 2 ? "✗ Verfehlt: " : "Herausforderung: ") + K.probe.text; if (pb.textContent !== t) pb.textContent = t; } }
    if (FLACH && z.ich.stufe) { const s = z.ich.stufe, e = z.ich.ep || 0, von = EP_BIS[s], bis = s < STUFE_MAX ? EP_BIS[s + 1] : von; const xp = $("#ez-xpleiste"); xp.hidden = false; ($("#ez-xp") as HTMLElement).style.width = (s < STUFE_MAX ? Math.min(100, Math.round(100 * (e - von) / (bis - von))) : 100) + "%";
      $("#ez-xpzahl").textContent = s < STUFE_MAX ? `${e - von} / ${bis - von} EP` : "höchste Stufe"; }
    const m = Math.floor(z.zeit / 60), sek = Math.floor(z.zeit % 60); $("#ez-stand").textContent = FLACH ? (window.innerWidth < 701 ? `◈ ${z.splitter} · Gegner ${z.besiegt} / ${z.monster}` : `◈ ${z.splitter} Seelensplitter · Gegner ${z.besiegt} / ${z.monster}`) : `◈ ${z.splitter} · Gegner ${z.besiegt} / ${z.monster} · ${m}:${String(sek).padStart(2, "0")}`;
    { const bild = $("#ez-ich-bild") as HTMLImageElement, src = "../" + D.bild; if (bild.dataset.src !== src) { bild.dataset.src = src; bild.src = src; } const st = $("#ez-ich-stufe"); st.hidden = !z.ich.stufe; if (z.ich.stufe) st.textContent = "St. " + z.ich.stufe; }
    this.gefolge(z, ich[0]);
    const sym = SYMBOL[ich[2]] || {};
    for (const [taste, cd, def] of [["q", z.ich.cdQ, D.q], ["e", z.ich.cdE, D.e], ["r", z.ich.cdR, D.r]] as const) { const el = $(`[data-taste="${taste}"]`); el.classList.toggle("zu", cd > 0); el.style.setProperty("--cd", cd > 0 ? String(Math.min(1, cd / def.zeit)) : "0"); (el.querySelector("u") as HTMLElement).textContent = cd > 0 ? String(Math.ceil(cd)) : "";
      const k = el.querySelector("small") as HTMLElement; if (k.textContent !== def.name) { k.textContent = def.name; el.title = `${taste.toUpperCase()} · ${def.name}: ${def.text}`; (el.querySelector("img") as HTMLImageElement).src = symbolBild(sym[taste] || "sterne"); } }
    const mo = $("#ez-modus"), mt = `<img alt="" src="${symbolBild((sym.modi || [])[z.ich.modus] || "hieb")}"><b>⇄</b><small>${W.name}</small>`; if (mo.dataset.h !== mt) { mo.dataset.h = mt; mo.innerHTML = mt; mo.title = `${W.name}: ${W.text} · Wechseln zu ${D.modi[z.ich.modus ? 0 : 1].name} (Leertaste)`; mo.classList.toggle("zwei", z.ich.modus === 1); }
    const ende = $("#ez-ende"); if (FLACH) { if (z.phase === "sieg" && !this.gewonnen && !WEG) { this.gewonnen = true; $("#ez-ziel").hidden = true; if (z.pr === 1 && kampfJetzt && P0.get("ort")) probeGeschafft(P0.get("ort") as string, kampfJetzt.karte);
      /* Der Kampf endet nicht von selbst: Man kann weiter herumlaufen und Seelensplitter aufheben, bis man ihn über den Knopf verlässt. */
      const kn = $("#ez-dorf-knopf"), raus = () => { kn.textContent = "Kampf verlassen"; kn.hidden = false; kn.onclick = () => { kn.hidden = true; const n = this.z ? this.z.splitter : 0;
        if (this.netz.art === "server" && this.serverKampf) { /* der Server schreibt gut und schickt die neuen Werte */ kn.textContent = "Wird gutgeschrieben …"; kn.hidden = false; kn.onclick = null; let fertig = false;
          const weiter = (w?: { ep?: Record<string, number>; seelen?: number }) => { if (fertig) return; fertig = true; window.removeEventListener("ez-server", hoer as EventListener); if (w && w.ep) { try { localStorage.setItem("ez_ep", JSON.stringify(w.ep)); localStorage.setItem("ez_seelen", String(w.seelen || 0)); } catch { /* privat */ } } kn.hidden = true; kampfGewonnen(z.zeit, wahlZeigen); };
          const hoer = (ev: CustomEvent<{ t: string; ep?: Record<string, number>; seelen?: number }>) => { if (ev.detail.t === "gutschrift") weiter(ev.detail); }; window.addEventListener("ez-server", hoer as EventListener);
          this.netz.sende({ t: "verlassen" } as unknown as Parameters<Netz["sende"]>[0]); setTimeout(() => weiter(), 6000); return; }
        if (!kontoName()) { try { localStorage.setItem("ez_seelen", String((Number(localStorage.getItem("ez_seelen")) || 0) + n)); } catch { /* privat */ } } /* als Gast zählt der Browser */ kampfGewonnen(z.zeit, wahlZeigen); }; };
      if (this.tebbeRuf) { this.tebbeRuf.setVisible(true); this.tebbeOffen = true; kn.hidden = true; $("#ez-ziel").textContent = "Geh zu Tebbe an der Mühle"; $("#ez-ziel").hidden = false;
        this.tebbeReden = () => { if (!this.tebbeOffen || !this.tebbeNah) return; this.tebbeOffen = false; kn.hidden = true; this.tebbeRuf!.setVisible(false); $("#ez-ziel").hidden = true; this.richtung(0, 0); this.netz.sende({ t: "halt" });
          void plaudern("Tebbe", [{ text: "Der Junge kauert an der Mühlenwand, die Katze an sich gedrückt. Eine Zunge hat ihn am Bein erwischt." }, { wer: "Tebbe", text: "Am Wehr sitzt eine. So groß wie ein Kalb. Und über ihr sind Lichter. Sie schaut die ganze Zeit nach oben." }], [], "Komm, ich bringe dich zu Lene").then(raus); };
        kn.onclick = () => this.tebbeReden && this.tebbeReden(); window.addEventListener("keydown", (ev) => { if ((ev.key === "e" || ev.key === "E") && this.tebbeReden) this.tebbeReden(); }); }
      else raus(); } } else if (z.phase === "sieg") { if (ende.hidden) { ende.hidden = false; $("#ez-ende-text").textContent = `Der Knochenfürst und seine Wächter sind besiegt. Zeit ${m}:${String(sek).padStart(2, "0")} · ${z.splitter} Erbsplitter`; } } else ende.hidden = true;
  }
  update() {
    const jetzt = this.time.now;
    if (this.tebbeOffen && this.z) { /* steht der Held bei Tebbe, erscheint der Knopf zum Ansprechen */ const ich = this.z.w.find((e) => e[0] === this.ichId), nah = Boolean(ich && Math.hypot(ich[4] - 9.5 * 96 / ZELLE, ich[5] - 2.75 * 96 / ZELLE) < 2.6);
      if (nah !== this.tebbeNah) { this.tebbeNah = nah; const kn = $("#ez-dorf-knopf"); kn.textContent = "Mit Tebbe sprechen" + (HANDY ? "" : "  [E]"); kn.hidden = !nah; } }
    for (const [id, b] of this.bilder) { const o = this.ort(b, jetzt), p = iso(o.x, o.y); b.c.setPosition(p.x, p.y).setDepth(tief(o.x, o.y) + 5); const m = (b.kopf as unknown as { m?: Phaser.GameObjects.Graphics }).m; if (m) m.setPosition(p.x, p.y + b.kopf.y);
      if (id === this.ichId) { const k = this.cameras.main; k.scrollX += (p.x - k.width / 2 - k.scrollX) * 0.15; k.scrollY += (p.y - 30 - k.height / 2 - k.scrollY) * 0.15;
        if (WEG) { this.ausgaengePruefen(o.x, o.y); const t = tief(o.x, o.y) + 5; for (const d of this.deko) { const hinter = d.depth > t && Math.abs(d.x - p.x) < d.displayWidth * 0.42 && p.y < d.y && p.y > d.y - d.displayHeight * 0.95; /* Held hinter der Krone: Baum durchsichtig */
          const soll = hinter ? 0.42 : 1; if (Math.abs(d.alpha - soll) > 0.01) d.setAlpha(d.alpha + (soll - d.alpha) * 0.2); } } } }
    const zb = this.z && this.z.ich.zielId ? this.bilder.get(this.z.ich.zielId) : undefined; if (zb && !zb.tot) { this.zielMarke.setVisible(true).setPosition(zb.c.x, zb.c.y); } else this.zielMarke.setVisible(false);
  }
}

/* ---------- Heldenwahl vor dem Start ---------- */
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
function wahlZeigen(los: (held: string, mit: string[]) => void, zurueck?: () => void, wort?: { los: string; zurueck: string }) {
  const el = $("#ez-wahl"); if (P.get("los") === "1" && !zurueck) { el.hidden = true; los(WAHL.held, WAHL.mit); return; }
  const zeichne = () => { const D = HELDEN[WAHL.held], w = (x: { nah: number; fern: number; magie: number }) => `Nahkampf ${x.nah} · Fernkampf ${x.fern} · Magie ${x.magie}`;
    el.innerHTML = `<div class="ez-blatt"><p class="ez-klein">Mythara · Splitterlande · Beta</p><h1>Wähle deinen Helden</h1>
      <div class="ez-helden">${HELDENREIHE.map((k) => `<button type="button" class="ez-held${k === WAHL.held ? " an" : ""}" data-held="${k}"><img src="../${HELDEN[k].bild}" alt=""><b>${esc(HELDEN[k].name)}</b><small>${esc(HELDEN[k].klasse)}</small></button>`).join("")}</div>
      <div class="ez-karte"><h2>${esc(D.name)} – ${esc(D.titel)}</h2><p class="ez-rolle">${esc(D.rolle)} · ${D.lp} Leben · Tempo ${String(D.tempo).replace(".", ",")}</p>
        <p><b>Angriff:</b> ${w(D.angriff)}<br><b>Verteidigung:</b> ${w(D.abwehr)}</p>
        <ul>${D.modi.map((m, i) => `<li><b>${i ? "Zweite" : "Erste"} Waffe – ${esc(m.name)}</b> ${m.schild ? "" : ` (${m.art === "heil" ? "Heilung" : "Schaden"} ${m.schaden[0]}–${m.schaden[1]}, alle ${String(m.takt).replace(".", ",")} s, Reichweite ${String(m.reich).replace(".", ",")})`}: ${esc(m.text)}</li>`).join("")}
          ${(["q", "e", "r"] as const).map((t) => `<li><b>${t.toUpperCase()} – ${esc(D[t].name)}</b> (alle ${D[t].zeit} s): ${esc(D[t].text)}</li>`).join("")}<li>${esc(D.passiv)}</li></ul></div>
      <h3>Begleiter (spielt der Rechner, höchstens zwei)</h3>
      <div class="ez-mit">${HELDENREIHE.filter((k) => k !== WAHL.held).map((k) => `<button type="button" class="${WAHL.mit.includes(k) ? "an" : ""}" data-mit="${k}">${esc(HELDEN[k].name)} <small>${esc(HELDEN[k].klasse)}</small></button>`).join("")}</div>
      <div class="ez-knoepfe"><button type="button" id="ez-los">${wort ? wort.los : "In den Riss"}</button>${zurueck ? `<button type="button" id="ez-zurueck">${wort ? wort.zurueck : "Zurück ins Dorf"}</button>` : ""}<a href="../">← zur Startseite</a></div>
      <p class="ez-klein unten">Zwölf Knochenwächter in fünf Gruppen, in der Siegelkammer der Knochenfürst. Treffer: Angriffswurf gegen Verteidigungswurf, dann Schadenswurf. Alle Werte sind Startwerte.</p></div>`; };
  zeichne(); el.hidden = false;
  el.onclick = (ev) => { const t = ev.target as HTMLElement, h = t.closest<HTMLElement>("[data-held]"), m = t.closest<HTMLElement>("[data-mit]");
    if (h) { WAHL.held = h.dataset.held as string; WAHL.mit = WAHL.mit.filter((x) => x !== WAHL.held); zeichne(); }
    else if (m) { const k = m.dataset.mit as string; if (WAHL.mit.includes(k)) WAHL.mit = WAHL.mit.filter((x) => x !== k); else if (WAHL.mit.length < 2) WAHL.mit.push(k); zeichne(); }
    else if (t.id === "ez-los") { el.hidden = true; los(WAHL.held, WAHL.mit.slice()); }
    else if (t.id === "ez-zurueck" && zurueck) { el.hidden = true; zurueck(); } };
}

(window as unknown as Record<string, unknown>).EZ_WAHL = wahlZeigen;
WELT.hud = { profil: hudProfil, titel: hudTitel, karte: hudKarte }; /* die offene Welt nutzt die Oberfläche der Orte */
const OHNE_DORF = P.get("dorf") === "0" || P.get("los") === "1" || FLACH; // ?dorf=0: gleich zur Heldenwahl, ?los=1: gleich in den Riss
/* Erst das Konto: Liegt dort ein anderer Stand als auf dem Gerät, wird er übernommen und die Seite lädt einmal neu. Höchstens vier Sekunden warten. */
void Promise.race([kontoStart(), new Promise<boolean>((ok) => setTimeout(() => ok(false), 4000))]).then(async (neu) => { if (neu) return; if (!P.has("server") && !P.has("los")) await kontoSeite(); /* erst anmelden, Konto anlegen oder als Gast weiter (Testaufrufe überspringen das) */
if (inKampagne && !FLACH) { startWeg(); kampagneBeginnen(wahlZeigen); } /* Heldenwahl und Gespräche; ein Spielfeld gibt es erst im Kampf */
else { const spiel = new Phaser.Game({ type: Phaser.AUTO, parent: "ez-feld", backgroundColor: "#07060b", scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight }, scene: weltName ? [Welt] : ortName && !FLACH ? [Ort] : OHNE_DORF ? [Spiel] : [P.get("stadt") === "alt" ? Dorf : Stadt, Spiel], input: { activePointers: 3 }, render: { antialias: true } });
  /* Der Startbildschirm geht, sobald eine Szene fertig geladen ist und ihr erstes Bild gezeichnet hat */
  let bilder = 0; const pruefen = () => { if (spiel.scene.getScenes(true).length && ++bilder >= 2) { spiel.events.off("postrender", pruefen); startWeg(); } }; spiel.events.on("postrender", pruefen); }
});
