/*
 * Mythara Echtzeit – die Stadt als ein gemaltes Bild (Waldmark). Der Held läuft direkt auf dem Bild:
 * Eine unsichtbare Fläche legt fest, wo man gehen kann, Ausschnitte desselben Bildes verdecken ihn, wenn er hinter etwas steht.
 * Alle Punkte sind in Bildpunkten der Vorlage (1671 x 941) angegeben; gezeigt wird sie F-fach vergrößert.
 * Die alte, aus Einzelteilen gebaute Stadt gibt es noch unter ?stadt=alt (dorf.ts).
 */
import Phaser from "phaser";
import { HELDEN } from "../../shared/config";

const F = 1.5, BW = 1671, BH = 941, TEMPO = 125; // Vergrößerung, Bildgröße, Lauftempo in Bildpunkten der Vorlage je Sekunde
const $ = (s: string) => document.querySelector(s) as HTMLElement, P = new URLSearchParams(location.search);
const HANDY = window.matchMedia("(pointer: coarse)").matches || P.get("handy") === "1";
type Pkt = [number, number];
/* Wo man gehen kann: Platz, Weg zum Tor, Steg zur Brücke */
const FLAECHE: Pkt[] = [[520, 445], [640, 405], [700, 345], [790, 318], [1000, 350], [1090, 338], [1170, 318], [1250, 300], [1390, 286], [1470, 300], [1440, 332], [1330, 350], [1175, 372], [1040, 368], [1025, 450], [1055, 520], [1075, 620], [1160, 652], [1150, 702], [1050, 692], [980, 702], [900, 750], [760, 762], [650, 772], [600, 802], [520, 862], [470, 850], [560, 780], [520, 742], [400, 722], [350, 652], [380, 602], [540, 562], [560, 482]];
/* Was im Weg steht */
const HINDERNIS: Pkt[][] = [
  [[690, 500], [740, 455], [850, 440], [960, 455], [1005, 500], [975, 560], [900, 600], [850, 610], [780, 592], [715, 555]], // Brunnen (Sockel)
  [[400, 585], [530, 575], [535, 640], [405, 650]],                                                                    // Tisch am Markt
  [[525, 670], [565, 670], [565, 700], [525, 700]],                                                                    // kleine Tanne
];
/* Was den Helden verdeckt, wenn er dahinter steht: Umriss im Bild und die Höhe (y), ab der er davor steht */
const VORN: { umriss: Pkt[]; fuss: number }[] = [
  { fuss: 545, umriss: [[690, 475], [700, 440], [730, 452], [770, 432], [790, 380], [850, 368], [900, 388], [920, 400], [925, 378], [960, 380], [965, 420], [1000, 440], [1008, 482], [980, 522], [962, 562], [900, 602], [850, 612], [780, 592], [730, 552], [690, 532]] }, // Brunnen
  { fuss: 698, umriss: [[508, 692], [498, 640], [520, 590], [545, 553], [575, 590], [592, 640], [582, 692]] },         // kleine Tanne am Markt
  { fuss: 802, umriss: [[772, 792], [768, 740], [790, 708], [810, 692], [832, 712], [852, 745], [848, 792]] },         // Tannen am unteren Rand
  { fuss: 782, umriss: [[922, 772], [922, 720], [944, 690], [962, 670], [982, 690], [1002, 720], [1002, 772]] },
  { fuss: 732, umriss: [[1012, 722], [1010, 670], [1030, 640], [1052, 616], [1074, 640], [1092, 675], [1090, 722]] },
];
/* Orte: Punkt, an dem man steht, und was dort passiert */
const ORTE: { name: string; x: number; y: number; r: number; tat: "riss" | "bald"; text: string }[] = [
  { name: "Der Riss", x: 1140, y: 678, r: 75, tat: "riss", text: "In den Riss" },
  { name: "Taverne", x: 600, y: 440, r: 60, tat: "bald", text: "Taverne – kommt noch" },
  { name: "Heldenhalle", x: 1085, y: 362, r: 60, tat: "bald", text: "Heldenhalle – die Heldensammlung kommt noch" },
  { name: "Stadttor", x: 1430, y: 308, r: 55, tat: "bald", text: "Stadttor – von hier geht es bald in die Kampagne" },
  { name: "Händler", x: 385, y: 625, r: 55, tat: "bald", text: "Händler – kommt noch" },
  { name: "Schmiede", x: 1080, y: 560, r: 55, tat: "bald", text: "Schmiede – kommt noch" },
  { name: "Brücke", x: 505, y: 845, r: 45, tat: "bald", text: "Über die Brücke geht es bald in den Wald" },
];
const drin = (p: Pkt[], x: number, y: number) => { let d = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) if ((p[i][1] > y) !== (p[j][1] > y) && x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) d = !d; return d; };
const frei = (x: number, y: number) => drin(FLAECHE, x, y) && !HINDERNIS.some((h) => drin(h, x, y));
type Wahl = (los: (held: string, mit: string[]) => void, zurueck: () => void) => void;

export class Stadt extends Phaser.Scene {
  held = "schildwaechter"; ort = { x: 800, y: 700 }; rx = 0; ry = 0; figur!: Phaser.GameObjects.Sprite; ring!: Phaser.GameObjects.Ellipse; laeuft = false; tasten: Record<string, boolean> = {};
  nah: (typeof ORTE)[number] | null = null; gesperrt = false; stick: { id: number; x: number; y: number } | null = null;
  constructor() { super("dorf"); }
  init(d: { held?: string }) { let h = d && d.held; try { h = h || localStorage.getItem("ez_held") || ""; } catch { /* privat */ } this.held = HELDEN[h || ""] ? (h as string) : "schildwaechter"; }
  preload() { this.load.image("waldmark", "../img/echtzeit/waldmark.webp"); const D = HELDEN[this.held]; if (D.figur) this.load.image("figur-" + this.held, "../" + D.figur); if (D.lauf) this.load.spritesheet("lauf-" + this.held, "../" + D.lauf, { frameWidth: 176, frameHeight: 176 }); this.load.image(this.held, "../" + D.bild); }
  create() {
    document.body.classList.add("dorf"); this.events.once("shutdown", () => { document.body.classList.remove("dorf"); $("#ez-dorf-knopf").hidden = true; });
    this.cameras.main.setBackgroundColor("#0d140b"); const bild = this.add.image(0, 0, "waldmark").setOrigin(0, 0).setDepth(0), Q = bild.width / BW; bild.setScale(F / Q); // Q: so viel größer als die Vermessung ist die Bilddatei
    const quelle = this.textures.get("waldmark").getSourceImage() as HTMLImageElement;
    VORN.forEach((v, n) => { // Ausschnitt des Bildes in der Form des Umrisses: liegt über dem Helden, solange der dahinter steht
      const xs = v.umriss.map((p) => p[0]), ys = v.umriss.map((p) => p[1]), x0 = Math.min(...xs), y0 = Math.min(...ys), w = Math.max(...xs) - x0, h = Math.max(...ys) - y0, key = "vorn" + n;
      if (!this.textures.exists(key)) { const t = this.textures.createCanvas(key, Math.ceil(w * Q), Math.ceil(h * Q)); if (!t) return; const c = t.getContext(); c.beginPath(); v.umriss.forEach((p, i) => (i ? c.lineTo((p[0] - x0) * Q, (p[1] - y0) * Q) : c.moveTo((p[0] - x0) * Q, (p[1] - y0) * Q))); c.closePath(); c.clip(); c.drawImage(quelle, x0 * Q, y0 * Q, w * Q, h * Q, 0, 0, w * Q, h * Q); t.refresh(); }
      this.add.image(x0 * F, y0 * F, key).setOrigin(0, 0).setScale(F / Q).setDepth(v.fuss); });
    if (P.get("zeig") === "1") { const g = this.add.graphics().setDepth(9999); const mal = (p: Pkt[], f: number) => { g.lineStyle(2, f, 1); g.strokePoints(p.map((q) => ({ x: q[0] * F, y: q[1] * F })), true); }; mal(FLAECHE, 0x00ff00); HINDERNIS.forEach((h) => mal(h, 0xff0000)); VORN.forEach((v) => mal(v.umriss, 0x00aaff)); for (const o of ORTE) g.strokeCircle(o.x * F, o.y * F, o.r * F); }
    const D = HELDEN[this.held]; this.ring = this.add.ellipse(0, 0, 46, 23).setStrokeStyle(3, 0xffffff, 0.95);
    if (D.figur) { const fu = D.fuss || [0.5, 0.94]; this.figur = this.add.sprite(0, 0, "figur-" + this.held).setOrigin(fu[0], fu[1]); this.figur.setScale(84 * (D.gross || 1) / this.figur.height); if (D.lauf && !this.anims.exists("lauf-" + this.held)) this.anims.create({ key: "lauf-" + this.held, frames: this.anims.generateFrameNumbers("lauf-" + this.held, {}), frameRate: 11, repeat: -1 }); }
    else { this.figur = this.add.sprite(0, 0, this.held).setOrigin(0.5, 1); this.figur.setScale(60 / this.figur.height); }
    const taste = (ev: KeyboardEvent, an: boolean) => { const k = ev.key.toLowerCase(); if (!this.scene.isActive() || this.gesperrt) return; if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) { ev.preventDefault(); this.tasten[k] = an; const t = this.tasten; this.rx = (t.d || t.arrowright ? 1 : 0) - (t.a || t.arrowleft ? 1 : 0); this.ry = (t.s || t.arrowdown ? 1 : 0) - (t.w || t.arrowup ? 1 : 0); } else if (an && (k === "e" || k === "enter")) this.betreten(); };
    const runter = (ev: KeyboardEvent) => { if (!ev.repeat) taste(ev, true); }, hoch = (ev: KeyboardEvent) => taste(ev, false); window.addEventListener("keydown", runter); window.addEventListener("keyup", hoch); this.events.once("shutdown", () => { window.removeEventListener("keydown", runter); window.removeEventListener("keyup", hoch); });
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => { if (this.gesperrt || this.stick) return; this.stick = { id: p.id, x: p.x, y: p.y }; if (p.wasTouch) { const el = $("#ez-stick"); el.hidden = false; el.style.left = p.x + "px"; el.style.top = p.y + "px"; } });
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => { const st = this.stick; if (!st || p.id !== st.id) return; const dx = p.x - st.x, dy = p.y - st.y, l = Math.hypot(dx, dy), m = 46; ($("#ez-stick i") as HTMLElement).style.transform = `translate(calc(-50% + ${dx / Math.max(l, 1) * Math.min(l, m)}px), calc(-50% + ${dy / Math.max(l, 1) * Math.min(l, m)}px))`; if (l < 8) { this.rx = 0; this.ry = 0; } else { const k = Math.min(1, l / m); this.rx = dx / l * k; this.ry = dy / l * k; } });
    this.input.on("pointerup", (p: Phaser.Input.Pointer) => { if (this.stick && p.id === this.stick.id) { this.stick = null; $("#ez-stick").hidden = true; this.rx = 0; this.ry = 0; } });
    $("#ez-dorf-knopf").onclick = () => this.betreten(); $("#ez-dorf-titel").textContent = "Waldmark";
    $("#ez-dorf-hilfe").textContent = HANDY ? "Finger aufs Feld: laufen · an einem Ort den Knopf antippen" : "WASD: laufen · an einem Ort: E oder Enter";
    this.cameras.main.setBounds(0, 0, BW * F, BH * F); this.groesse(); this.scale.on("resize", () => this.groesse()); this.cameras.main.centerOn(this.ort.x * F, this.ort.y * F);
    (window as unknown as Record<string, unknown>).EZD = { szene: this, ort: () => this.ort, nah: () => (this.nah ? this.nah.name : ""), frei };
  }
  groesse() { const k = this.cameras.main; k.setZoom(Math.max(this.scale.width / (BW * F), this.scale.height / (BH * F), Phaser.Math.Clamp(this.scale.height / (HANDY ? 520 : 760), 0.6, 2.2))); }
  betreten() { const o = this.nah; if (!o || this.gesperrt) return;
    if (o.tat === "riss") { this.gesperrt = true; this.rx = 0; this.ry = 0; this.tasten = {}; const wahl = (window as unknown as { EZ_WAHL: Wahl }).EZ_WAHL; wahl((held, mit) => { try { localStorage.setItem("ez_held", held); } catch { /* privat */ } this.scene.start("spiel", { held, mit }); }, () => { this.gesperrt = false; }); }
    else { const k = $("#ez-dorf-knopf"); k.textContent = o.text; k.classList.add("bald"); } }
  update(_t: number, dt: number) {
    const d = Math.min(0.05, dt / 1000), o = this.ort, l = Math.hypot(this.rx, this.ry), faehrt = !this.gesperrt && l > 0.05;
    if (faehrt) { const k = Math.min(1, l) / l, sx = this.rx * k * TEMPO * d, sy = this.ry * k * TEMPO * 0.62 * d; // nach oben und unten langsamer: der Boden liegt schräg
      if (frei(o.x + sx, o.y + sy)) { o.x += sx; o.y += sy; } else if (frei(o.x + sx, o.y)) o.x += sx; else if (frei(o.x, o.y + sy)) o.y += sy; // an Kanten entlanggleiten
      if (Math.abs(this.rx) > 0.2) this.figur.setFlipX(this.rx < 0); }
    const D = HELDEN[this.held]; if (faehrt !== this.laeuft && D.figur && D.lauf) { this.laeuft = faehrt; if (faehrt) { const L = D.laufMass || [0.5, 0.946, 0.91]; this.figur.play("lauf-" + this.held); this.figur.setOrigin(L[0], L[1]).setScale(84 / (L[2] * 176)); } else { const fu = D.fuss || [0.5, 0.94]; this.figur.stop(); this.figur.setTexture("figur-" + this.held); this.figur.setOrigin(fu[0], fu[1]).setScale(84 * (D.gross || 1) / this.figur.height); } }
    const x = o.x * F, y = o.y * F; this.figur.setPosition(x, y + 3).setDepth(o.y); this.ring.setPosition(x, y).setDepth(o.y - 0.01);
    const k = this.cameras.main; k.scrollX += (x - k.width / 2 - k.scrollX) * 0.12; k.scrollY += (y - 50 - k.height / 2 - k.scrollY) * 0.12;
    let nah: typeof this.nah = null; for (const q of ORTE) if (Math.hypot(o.x - q.x, o.y - q.y) < q.r) nah = q;
    if (nah !== this.nah) { this.nah = nah; const kn = $("#ez-dorf-knopf"); kn.classList.remove("bald"); kn.hidden = !nah; if (nah) kn.textContent = nah.tat === "bald" ? nah.name : nah.text + (HANDY ? "" : "  [E]"); }
  }
}
