/*
 * Mythara Echtzeit – die Stadt als ein gemaltes Bild (Waldmark). Der Held läuft direkt auf dem Bild:
 * Eine unsichtbare Fläche legt fest, wo man gehen kann, Ausschnitte desselben Bildes verdecken ihn, wenn er hinter etwas steht.
 * Alle Punkte sind in Bildpunkten der Vorlage (1671 x 941) angegeben; gezeigt wird sie F-fach vergrößert.
 * Die alte, aus Einzelteilen gebaute Stadt gibt es noch unter ?stadt=alt (dorf.ts).
 */
import { weltkarte } from "./weltkarte";
import { zoomFaktor, zoomKnopf } from "./zoom";
import Phaser from "phaser";
import { HELDEN } from "../../shared/config";

const F = 1.5, BW = 1671, BH = 941, TEMPO = 125, GROSS = 112; // GROSS: Körperhöhe des Helden am Bildschirm, passend zu Türen und Tischen im Bild // Vergrößerung, Bildgröße, Lauftempo in Bildpunkten der Vorlage je Sekunde
const $ = (s: string) => document.querySelector(s) as HTMLElement, P = new URLSearchParams(location.search);
const HANDY = window.matchMedia("(pointer: coarse)").matches || P.get("handy") === "1";
type Pkt = [number, number];
/* Wo man gehen kann: Platz, Weg zum Tor, Steg zur Brücke */
const FLAECHE: Pkt[] = [[520, 445], [640, 405], [700, 345], [790, 318], [1000, 345], [1090, 328], [1170, 304], [1250, 288], [1390, 270], [1478, 288], [1455, 342], [1330, 364], [1215, 356], [1150, 388], [1040, 388], [1025, 450], [1055, 520], [1075, 620], [1160, 652], [1150, 702], [1050, 692], [980, 702], [900, 750], [760, 762], [650, 772], [600, 802], [520, 862], [470, 850], [560, 780], [520, 742], [400, 722], [350, 652], [380, 602], [540, 562], [560, 482]];
/* Was im Weg steht */
const HINDERNIS: Pkt[][] = [
  [[690, 500], [740, 455], [850, 440], [960, 455], [1005, 500], [975, 560], [900, 600], [850, 610], [780, 592], [715, 555]], // Brunnen (Sockel)
  [[400, 585], [530, 575], [535, 640], [405, 650]],                                                                    // Tisch am Markt
  [[525, 670], [565, 670], [565, 700], [525, 700]],                                                                    // kleine Tanne
];
/* Was den Helden verdeckt, wenn er dahinter steht: Umriss im Bild und die Höhe (y), ab der er davor steht */
const VORN: { umriss: Pkt[]; fuss: number; gruen?: boolean }[] = [ // gruen: nur die grünen Zweige verdecken, nicht das Pflaster daneben
  { fuss: 545, umriss: [[690, 475], [700, 440], [730, 452], [766, 432], [768, 375], [786, 338], [822, 326], [834, 300], [858, 286], [882, 298], [886, 338], [908, 372], [922, 400], [925, 378], [960, 380], [965, 420], [1000, 440], [1008, 482], [980, 522], [962, 562], [900, 602], [850, 612], [780, 592], [730, 552], [690, 532]] }, // Brunnen
  { gruen: true, fuss: 698, umriss: [[508, 692], [498, 640], [520, 590], [545, 553], [575, 590], [592, 640], [582, 692]] },         // kleine Tanne am Markt
  { gruen: true, fuss: 802, umriss: [[772, 792], [768, 740], [790, 708], [810, 692], [832, 712], [852, 745], [848, 792]] },         // Tannen am unteren Rand
  { gruen: true, fuss: 782, umriss: [[922, 772], [922, 720], [944, 690], [962, 670], [982, 690], [1002, 720], [1002, 772]] },
  { gruen: true, fuss: 732, umriss: [[1012, 722], [1010, 670], [1030, 640], [1052, 616], [1074, 640], [1092, 675], [1090, 722]] },
];
/* Orte: Punkt, an dem man steht, und was dort passiert */
const ORTE: { name: string; x: number; y: number; r: number; tat: "riss" | "bald" | "welt"; text: string }[] = [
  { name: "Der Riss", x: 1140, y: 678, r: 75, tat: "riss", text: "In den Riss" },
  { name: "Taverne", x: 600, y: 440, r: 60, tat: "bald", text: "Taverne – kommt noch" },
  { name: "Heldenhalle", x: 1085, y: 362, r: 60, tat: "bald", text: "Heldenhalle – die Heldensammlung kommt noch" },
  { name: "Stadttor", x: 1430, y: 308, r: 55, tat: "welt", text: "Zur Weltkarte" },
  { name: "Markt", x: 545, y: 585, r: 80, tat: "bald", text: "Markt – kommt noch" },
];
/* Was sich im Bild bewegt (Bildpunkte der Vorlage): Feuer [x, y, Größe], Rauch [x, y], Wasserfälle [x, y oben, Breite, Fallhöhe], Glitzern [x, y, Breite, Höhe], Mitte des Risses */
const FEUER: number[][] = [[708, 437, 1], [940, 378, 1], [982, 436, 1], [760, 290, 0.8], [1258, 126, 1], [1508, 176, 1], [1322, 268, 0.9], [1490, 298, 0.9], [1215, 548, 1.3]];
const RAUCH: number[][] = [[553, 68]];
const WASSER: number[][] = [[135, 432, 34, 60], [447, 752, 44, 40], [305, 668, 40, 26], [795, 478, 14, 30], [862, 466, 14, 32], [880, 548, 16, 34], [940, 536, 14, 30], [826, 546, 12, 26]];
const GLITZER: number[][] = [[120, 540, 90, 60], [600, 890, 240, 40], [852, 512, 190, 50], [470, 810, 60, 40]];
const RISS: number[] = [1385, 725];
/* Dorfbewohner, die über den Platz schlendern: Bildblatt, Wegpunkte (im Kreis), Tempo */
const LEUTE: { bild: string; weg: Pkt[]; tempo: number; mass: number }[] = [{ bild: "wanderer", mass: 0.935, tempo: 42, /* mass: Anteil des Bildfelds, der der Körperhöhe eines Helden entspricht – so sind alle gleich groß */ weg: [[640, 470], [690, 640], [900, 690], [1030, 620], [1020, 420], [900, 400], [720, 400]] },
  { bild: "kraemer", mass: 0.94, tempo: 30, weg: [[580, 560], [650, 530], [610, 610], [585, 655], [640, 690], [585, 655], [610, 610]] }, // der Krämer bleibt in der Nähe des Markts
  { bild: "schmied", mass: 0.925, tempo: 28, weg: [[1040, 525], [1062, 600], [1100, 662], [1010, 645], [1005, 550]] }, // der Schmied geht vor seiner Schmiede auf und ab
  { bild: "kraeuterfrau", mass: 0.975, tempo: 36, weg: [[610, 520], [650, 620], [850, 660], [1000, 600], [1010, 405], [1160, 350], [1300, 322], [1410, 312], [1300, 322], [1160, 350], [1010, 405], [1000, 600], [850, 660], [650, 620]] }]; // die Kräuterfrau geht bis zum Stadttor und denselben Weg zurück
/* Wachen: Ort und ob sie nach links schauen. Im Bild ragt der Speer über den Helm; gemessen wird der Körper bis zum Helm. */
const WACHEN: number[][] = [[1352, 338, 0], [1178, 640, 1]], WACHE_KOERPER = 0.81, WACHE_FUSS = 0.975;
const drin = (p: Pkt[], x: number, y: number) => { let d = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) if ((p[i][1] > y) !== (p[j][1] > y) && x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) d = !d; return d; };
const frei = (x: number, y: number) => drin(FLAECHE, x, y) && !HINDERNIS.some((h) => drin(h, x, y));
/** Weg über die begehbare Fläche (Breitensuche auf einem Raster von 14 Pixeln). Ist das Ziel selbst nicht begehbar, endet der Weg am nächsten begehbaren Punkt. */
const RASTER = 14;
function wegZu(x0: number, y0: number, x1: number, y1: number): number[][] {
  const B = Math.ceil(BW / RASTER), H = Math.ceil(BH / RASTER), mitte = (i: number) => [(i % B + 0.5) * RASTER, (Math.floor(i / B) + 0.5) * RASTER];
  const zelle = (x: number, y: number) => Math.max(0, Math.min(B - 1, Math.floor(x / RASTER))) + B * Math.max(0, Math.min(H - 1, Math.floor(y / RASTER)));
  const start = zelle(x0, y0), von = new Int32Array(B * H).fill(-1), reihe = [start]; von[start] = start; let best = start, bestA = Math.hypot(x0 - x1, y0 - y1);
  for (let n = 0; n < reihe.length; n++) { const i = reihe[n], [mx, my] = mitte(i), a = Math.hypot(mx - x1, my - y1); if (a < bestA) { bestA = a; best = i; } if (a < RASTER * 0.75) break;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const cx = i % B + dx, cy = Math.floor(i / B) + dy; if (cx < 0 || cy < 0 || cx >= B || cy >= H) continue; const j = cx + B * cy; if (von[j] >= 0 || !frei((cx + 0.5) * RASTER, (cy + 0.5) * RASTER)) continue; if (dx && dy && (!frei((cx + 0.5) * RASTER, my) || !frei(mx, (cy + 0.5) * RASTER))) continue; /* nicht quer über Ecken */ von[j] = i; reihe.push(j); } }
  const weg: number[][] = []; for (let i = best; i !== start; i = von[i]) weg.unshift(mitte(i)); if (weg.length && frei(x1, y1) && bestA < RASTER) weg.push([x1, y1]); return weg; }
type Wahl = (los: (held: string, mit: string[]) => void, zurueck: () => void) => void;

export class Stadt extends Phaser.Scene {
  held = "schildwaechter"; ort = { x: 800, y: 700 }; rx = 0; ry = 0; figur!: Phaser.GameObjects.Sprite; ring!: Phaser.GameObjects.Ellipse; laeuft = false; tasten: Record<string, boolean> = {};
  leute: { s: Phaser.GameObjects.Sprite; d: (typeof LEUTE)[number]; x: number; y: number; n: number; pause: number }[] = []; nah: (typeof ORTE)[number] | null = null; gesperrt = false; stick: { id: number; x: number; y: number; t: number; weit: number } | null = null; pfad: number[][] = []; zielOrt: (typeof ORTE)[number] | null = null;
  constructor() { super("dorf"); }
  init(d: { held?: string }) { let h = d && d.held; try { h = h || localStorage.getItem("ez_held") || ""; } catch { /* privat */ } this.held = HELDEN[h || ""] ? (h as string) : "schildwaechter"; }
  preload() { this.load.image("waldmark", "../img/echtzeit/waldmark.webp"); this.load.spritesheet("npc-junge", "../img/echtzeit/junge.webp", { frameWidth: 176, frameHeight: 176 }); this.load.spritesheet("npc-wache", "../img/echtzeit/wache.webp", { frameWidth: 176, frameHeight: 176 }); this.load.spritesheet("npc-ausrufer", "../img/echtzeit/ausrufer.webp", { frameWidth: 176, frameHeight: 176 }); for (const l of LEUTE) this.load.spritesheet("npc-" + l.bild, "../img/echtzeit/" + l.bild + ".webp", { frameWidth: 176, frameHeight: 176 }); const D = HELDEN[this.held]; if (D.figur) this.load.image("figur-" + this.held, "../" + D.figur); if (D.lauf) this.load.spritesheet("lauf-" + this.held, "../" + D.lauf, { frameWidth: 176, frameHeight: 176 }); this.load.image(this.held, "../" + D.bild); }
  create() {
    document.body.classList.add("dorf", "stadt"); this.profil(); this.events.once("shutdown", () => { document.body.classList.remove("dorf", "stadt"); $("#ez-dorf-knopf").hidden = true; });
    this.cameras.main.setBackgroundColor("#0d140b"); const bild = this.add.image(0, 0, "waldmark").setOrigin(0, 0).setDepth(0), Q = bild.width / BW; bild.setScale(F / Q); // Q: so viel größer als die Vermessung ist die Bilddatei
    const quelle = this.textures.get("waldmark").getSourceImage() as HTMLImageElement;
    VORN.forEach((v, n) => { // Ausschnitt des Bildes in der Form des Umrisses: liegt über dem Helden, solange der dahinter steht
      const xs = v.umriss.map((p) => p[0]), ys = v.umriss.map((p) => p[1]), x0 = Math.min(...xs), y0 = Math.min(...ys), w = Math.max(...xs) - x0, h = Math.max(...ys) - y0, key = "vorn" + n;
      if (!this.textures.exists(key)) { const t = this.textures.createCanvas(key, Math.ceil(w * Q), Math.ceil(h * Q)); if (!t) return; const c = t.getContext(); c.beginPath(); v.umriss.forEach((p, i) => (i ? c.lineTo((p[0] - x0) * Q, (p[1] - y0) * Q) : c.moveTo((p[0] - x0) * Q, (p[1] - y0) * Q))); c.closePath(); c.clip(); c.drawImage(quelle, x0 * Q, y0 * Q, w * Q, h * Q, 0, 0, w * Q, h * Q);
        if (v.gruen) { const d = c.getImageData(0, 0, t.width, t.height), a = d.data; for (let i = 0; i < a.length; i += 4) { const r = a[i], g = a[i + 1], b = a[i + 2]; if (!(g > r * 0.97 && g > b) && Math.max(r, g, b) > 70) a[i + 3] = 0; } c.putImageData(d, 0, 0); } t.refresh(); }
      this.add.image(x0 * F, y0 * F, key).setOrigin(0, 0).setScale(F / Q).setDepth(v.fuss); });
    this.leben(); this.leute = [];
    { /* Junge mit Ball vor der Heldenhalle: kleiner als die Erwachsenen, kickt alle paar Sekunden */
      const X = 1040, Y = 392; if (!this.anims.exists("npc-junge")) this.anims.create({ key: "npc-junge", frames: this.anims.generateFrameNumbers("npc-junge", {}), frameRate: 7, repeat: 1 });
      const j = this.add.sprite(X * F, Y * F + 3, "npc-junge", 0).setOrigin(0.5, 0.93).setScale(GROSS * 0.62 / (0.851 * 176)).setDepth(Y);
      const kicken = () => { if (this.scene.isActive()) j.play("npc-junge"); }; j.on("animationcomplete", () => { j.setFrame(0); this.time.delayedCall(2500 + Math.random() * 4000, kicken); }); this.time.delayedCall(1500, kicken); }
    if (!this.anims.exists("npc-wache")) this.anims.create({ key: "npc-wache", frames: this.anims.generateFrameNumbers("npc-wache", {}), frameRate: 3, repeat: 0 });
    for (const [x, y, links] of WACHEN) { // Wachen stehen still und sehen sich ab und zu um
      const w = this.add.sprite(x * F, y * F + 3, "npc-wache", 0).setOrigin(0.5, WACHE_FUSS).setScale(GROSS * 1.06 / (WACHE_KOERPER * 176)).setFlipX(Boolean(links)).setDepth(y);
      const schauen = () => { if (this.scene.isActive()) w.play("npc-wache"); }; w.on("animationcomplete", () => { w.setFrame(0); this.time.delayedCall(4000 + Math.random() * 7000, schauen); }); this.time.delayedCall(1000 + Math.random() * 5000, schauen); }
    { // der Ausrufer steht vor dem Brunnen: Eine Weile still, dann hebt er die Hand und ruft
      const X = 940, Y = 628; if (!this.anims.exists("npc-ausrufer")) this.anims.create({ key: "npc-ausrufer", frames: this.anims.generateFrameNumbers("npc-ausrufer", {}), frameRate: 5, repeat: 0 });
      const s = this.add.sprite(X * F, Y * F + 3, "npc-ausrufer", 0).setOrigin(0.5, 0.975).setScale(GROSS / (0.985 * 176)).setFlipX(true).setDepth(Y); // 0.985: mit Hut und Feder ist er im Bild höher als ein Held
      const blase = this.add.text(X * F, Y * F - GROSS - 26, "Neuigkeiten!", { fontFamily: "Inter, sans-serif", fontSize: "15px", fontStyle: "bold", color: "#2a2014", backgroundColor: "#f4ead2", padding: { x: 9, y: 5 } }).setOrigin(0.5, 1).setDepth(9000).setAlpha(0);
      const zipfel = this.add.triangle(X * F, Y * F - GROSS - 20, 0, 0, 14, 0, 7, 9, 0xf4ead2).setDepth(9000).setAlpha(0);
      const rufen = () => { if (!this.scene.isActive()) return; s.play("npc-ausrufer"); this.tweens.add({ targets: [blase, zipfel], alpha: 1, duration: 200, delay: 350 }); this.tweens.add({ targets: [blase, zipfel], alpha: 0, duration: 300, delay: 1500 }); };
      s.on("animationcomplete", () => { s.setFrame(0); this.time.delayedCall(5000 + Math.random() * 5000, rufen); }); this.time.delayedCall(2500, rufen); }
    for (const l of LEUTE) { const k = "npc-" + l.bild; if (!this.anims.exists(k)) this.anims.create({ key: k, frames: this.anims.generateFrameNumbers(k, {}), frameRate: 8, repeat: -1 }); const s = this.add.sprite(0, 0, k).setOrigin(0.5, 0.945).setScale(GROSS / (l.mass * 176)); s.play(k); const start = Math.floor(Math.random() * l.weg.length); this.leute.push({ s, d: l, x: l.weg[start][0], y: l.weg[start][1], n: (start + 1) % l.weg.length, pause: 0 }); }
    if (P.get("zeig") === "1") { const g = this.add.graphics().setDepth(9999); const mal = (p: Pkt[], f: number) => { g.lineStyle(2, f, 1); g.strokePoints(p.map((q) => ({ x: q[0] * F, y: q[1] * F })), true); }; mal(FLAECHE, 0x00ff00); HINDERNIS.forEach((h) => mal(h, 0xff0000)); VORN.forEach((v) => mal(v.umriss, 0x00aaff)); for (const o of ORTE) g.strokeCircle(o.x * F, o.y * F, o.r * F); }
    const D = HELDEN[this.held]; this.ring = this.add.ellipse(0, 0, 58, 29).setStrokeStyle(3, 0xffffff, 0.95);
    if (D.figur) { const fu = D.fuss || [0.5, 0.94]; this.figur = this.add.sprite(0, 0, "figur-" + this.held).setOrigin(fu[0], fu[1]); this.figur.setScale(GROSS * (D.gross || 1) / this.figur.height); if (D.lauf && !this.anims.exists("lauf-" + this.held)) this.anims.create({ key: "lauf-" + this.held, frames: this.anims.generateFrameNumbers("lauf-" + this.held, {}), frameRate: 11, repeat: -1 }); }
    else { this.figur = this.add.sprite(0, 0, this.held).setOrigin(0.5, 1); this.figur.setScale(60 / this.figur.height); }
    const taste = (ev: KeyboardEvent, an: boolean) => { const k = ev.key.toLowerCase(); if (!this.scene.isActive() || this.gesperrt) return; if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) { ev.preventDefault(); this.tasten[k] = an; const t = this.tasten; this.rx = (t.d || t.arrowright ? 1 : 0) - (t.a || t.arrowleft ? 1 : 0); this.ry = (t.s || t.arrowdown ? 1 : 0) - (t.w || t.arrowup ? 1 : 0); } else if (an && (k === "e" || k === "enter")) this.betreten(); };
    const runter = (ev: KeyboardEvent) => { if (!ev.repeat) taste(ev, true); }, hoch = (ev: KeyboardEvent) => taste(ev, false); window.addEventListener("keydown", runter); window.addEventListener("keyup", hoch); this.events.once("shutdown", () => { window.removeEventListener("keydown", runter); window.removeEventListener("keyup", hoch); });
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => { if (this.gesperrt || this.stick) return; this.stick = { id: p.id, x: p.x, y: p.y, t: performance.now(), weit: 0 }; if (p.wasTouch) { const el = $("#ez-stick"); el.hidden = false; el.style.left = p.x + "px"; el.style.top = p.y + "px"; } });
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => { const st = this.stick; if (!st || p.id !== st.id) return; const dx = p.x - st.x, dy = p.y - st.y, l = Math.hypot(dx, dy), m = 46; st.weit = Math.max(st.weit, l); ($("#ez-stick i") as HTMLElement).style.transform = `translate(calc(-50% + ${dx / Math.max(l, 1) * Math.min(l, m)}px), calc(-50% + ${dy / Math.max(l, 1) * Math.min(l, m)}px))`; if (l < 8) { this.rx = 0; this.ry = 0; } else { const k = Math.min(1, l / m); this.rx = dx / l * k; this.ry = dy / l * k; } });
    this.input.on("pointerup", (p: Phaser.Input.Pointer) => { if (this.stick && p.id === this.stick.id) { const st = this.stick; if (st.weit < 12 && performance.now() - st.t < 450) { const w = this.cameras.main.getWorldPoint(p.x, p.y); this.tippen(w.x / F, w.y / F); } this.stick = null; $("#ez-stick").hidden = true; this.rx = 0; this.ry = 0; } });
    $("#ez-dorf-knopf").onclick = () => this.betreten(); $("#ez-dorf-titel").textContent = "Waldmark";
    $("#ez-dorf-hilfe").textContent = HANDY ? "Finger aufs Feld: laufen · an einem Ort den Knopf antippen" : "WASD: laufen · an einem Ort: E oder Enter";
    this.cameras.main.setBounds(0, 0, BW * F, BH * F); this.groesse(); zoomKnopf(() => this.groesse()); this.scale.on("resize", () => this.groesse()); this.cameras.main.centerOn(this.ort.x * F, this.ort.y * F);
    (window as unknown as Record<string, unknown>).EZD = { szene: this, ort: () => this.ort, nah: () => (this.nah ? this.nah.name : ""), frei };
  }
  /** Bewegung im Standbild: Feuer flackert, Rauch steigt, Wasser fällt und glitzert, der Riss pulsiert. Alles aus kleinen erzeugten Lichtpunkten, ohne weitere Bilder. */
  leben() {
    const punkt = (key: string, r: number, innen: string, aussen: string) => { if (this.textures.exists(key)) return; const t = this.textures.createCanvas(key, r * 2, r * 2); if (!t) return; const c = t.getContext(), g = c.createRadialGradient(r, r, 0, r, r, r); g.addColorStop(0, innen); g.addColorStop(1, aussen); c.fillStyle = g; c.fillRect(0, 0, r * 2, r * 2); t.refresh(); };
    punkt("fx-warm", 32, "rgba(255,200,120,1)", "rgba(255,120,40,0)"); punkt("fx-weiss", 16, "rgba(255,255,255,1)", "rgba(255,255,255,0)"); punkt("fx-rauch", 32, "rgba(190,190,190,.5)", "rgba(150,150,150,0)");
    const ADD = Phaser.BlendModes.ADD;
    for (const [x, y, g] of FEUER) { // Flammen: flackernder Schein und aufsteigende Funken
      const s = this.add.image(x * F, y * F, "fx-warm").setBlendMode(ADD).setScale(1.5 * g).setAlpha(0.5).setDepth(y + 40); this.tweens.add({ targets: s, alpha: 0.28, scale: 1.25 * g, duration: 90 + Math.random() * 140, yoyo: true, repeat: -1, repeatDelay: Math.random() * 160 });
      this.add.particles(x * F, y * F, "fx-warm", { x: { min: -5 * g, max: 5 * g }, speedY: { min: -46, max: -22 }, speedX: { min: -6, max: 6 }, lifespan: { min: 350, max: 700 }, scale: { start: 0.22 * g, end: 0 }, alpha: { start: 0.9, end: 0 }, frequency: 70, blendMode: ADD }).setDepth(y + 41); }
    for (const [x, y] of RAUCH) this.add.particles(x * F, y * F, "fx-rauch", { x: { min: -5, max: 5 }, speedY: { min: -30, max: -18 }, speedX: { min: 4, max: 16 }, lifespan: { min: 2600, max: 3800 }, scale: { start: 0.35, end: 1.5 }, alpha: { start: 0.55, end: 0 }, frequency: 260 }).setDepth(2);
    for (const [x, y, b, h] of WASSER) { // fallendes Wasser: helle Streifen, unten Gischt
      this.add.particles(x * F, y * F, "fx-weiss", { x: { min: -b * F / 2, max: b * F / 2 }, speedY: { min: h * F * 1.6, max: h * F * 2.3 }, lifespan: 520, scaleX: 0.14, scaleY: { start: 0.7, end: 0.4 }, alpha: { start: 0.55, end: 0 }, tint: 0xbfe6ff, frequency: 45, blendMode: ADD }).setDepth(1);
      this.add.particles(x * F, (y + h) * F, "fx-weiss", { x: { min: -b * F / 2 - 4, max: b * F / 2 + 4 }, speedY: { min: -26, max: -8 }, speedX: { min: -18, max: 18 }, lifespan: { min: 300, max: 600 }, scale: { start: 0.3, end: 0.05 }, alpha: { start: 0.5, end: 0 }, tint: 0xdff3ff, frequency: 60, blendMode: ADD }).setDepth(1); }
    for (const [x, y, b, h] of GLITZER) this.add.particles(x * F, y * F, "fx-weiss", { x: { min: -b * F / 2, max: b * F / 2 }, y: { min: -h * F / 2, max: h * F / 2 }, speed: 0, lifespan: { min: 500, max: 1100 }, scale: { start: 0, end: 0.22, ease: "Sine.easeInOut" }, alpha: { start: 0.8, end: 0 }, tint: 0xcfeaff, frequency: 110, blendMode: ADD }).setDepth(1); // Glitzern auf Bach und Brunnen
    { const [x, y] = RISS, glut = this.add.image(x * F, y * F, "fx-weiss").setBlendMode(ADD).setTint(0x6a8cff).setScale(15, 9).setAngle(-32).setAlpha(0.22).setDepth(1); this.tweens.add({ targets: glut, alpha: 0.08, duration: 1700, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      const blitz = this.add.image(x * F, y * F, "fx-weiss").setBlendMode(ADD).setTint(0xbcd0ff).setScale(17, 10).setAngle(-32).setAlpha(0).setDepth(1); const zucken = () => { this.tweens.add({ targets: blitz, alpha: { from: 0.32, to: 0 }, duration: 160, repeat: Math.random() < 0.4 ? 1 : 0, onComplete: () => this.time.delayedCall(900 + Math.random() * 3200, zucken) }); }; this.time.delayedCall(1200, zucken);
      this.add.particles(x * F, y * F, "fx-weiss", { x: { min: -150 * F, max: 150 * F }, y: { min: -110 * F, max: 110 * F }, speedY: { min: -30, max: -10 }, speedX: { min: -8, max: 8 }, lifespan: { min: 900, max: 1800 }, scale: { start: 0.2, end: 0 }, alpha: { start: 0.9, end: 0 }, tint: [0x8fb4ff, 0xc9a8ff, 0xffffff], frequency: 55, blendMode: ADD }).setDepth(1); } // Funken steigen aus dem Riss
  }
  /** Oben links: Bild des Helden und Anmeldename. Oben rechts: Minikarte mit den Orten und dem eigenen Standpunkt. */
  profil() { const D = HELDEN[this.held]; ($("#ez-profil-bild") as HTMLImageElement).src = "../" + D.bild; $("#ez-profil-name").textContent = "Test"; $("#ez-profil-held").textContent = `${D.name} · ${D.klasse}`;
    const k = $("#ez-karte"); for (const el of Array.from(k.querySelectorAll("u"))) el.remove(); for (const o of ORTE) { const u = document.createElement("u"); u.style.left = (100 * o.x / BW) + "%"; u.style.top = (100 * o.y / BH) + "%"; u.title = o.name; if (o.tat === "riss") u.className = "riss"; k.appendChild(u); } }
  groesse() { const k = this.cameras.main; const w = this.scale.width, h = this.scale.height; k.setZoom(Math.max(w / (BW * F), h / (BH * F), Phaser.Math.Clamp(HANDY ? Math.min(h / 520, w / 720) : Math.min(h / 760, w / 1000), 0.45, 2.2) * zoomFaktor())); /* auch im Hochformat bleibt genug Umgebung im Bild */ }
  /** Kurz getippt oder geklickt: Liegt ein Ort in der Nähe der Stelle, geht der Held dorthin und betritt ihn; sonst läuft er zur getippten Stelle. */
  tippen(x: number, y: number) { if (this.gesperrt) return; let ort: (typeof ORTE)[number] | null = null, best = 1e9;
    for (const q of ORTE) { const a = Math.hypot(x - q.x, y - (q.y - 45)); /* die Gebäude stehen über ihrem Eingang */ if (a < q.r + 120 && a < best) { best = a; ort = q; } }
    if (ort && ort === this.nah) { this.pfad = []; this.betreten(); return; }
    this.zielOrt = ort; this.pfad = wegZu(this.ort.x, this.ort.y, ort ? ort.x : x, ort ? ort.y : y); }
  betreten() { const o = this.nah; if (!o || this.gesperrt) return;
    if (o.tat === "riss") { this.gesperrt = true; this.rx = 0; this.ry = 0; this.tasten = {}; const wahl = (window as unknown as { EZ_WAHL: Wahl }).EZ_WAHL; wahl((held, mit) => { try { localStorage.setItem("ez_held", held); } catch { /* privat */ } this.scene.start("spiel", { held, mit }); }, () => { this.gesperrt = false; }); }
    else if (o.tat === "welt") { this.gesperrt = true; this.rx = 0; this.ry = 0; this.tasten = {}; weltkarte(() => { this.gesperrt = false; }); }
    else { const k = $("#ez-dorf-knopf"); k.textContent = o.text; k.classList.add("bald"); } }
  update(_t: number, dt: number) {
    const d = Math.min(0.05, dt / 1000), o = this.ort; let rx = this.rx, ry = this.ry;
    if (Math.hypot(rx, ry) > 0.05 || this.gesperrt) { this.pfad = []; this.zielOrt = null; } /* selbst steuern bricht den Weg ab */
    else if (this.pfad.length) { const z = this.pfad[0], dx = z[0] - o.x, dy = z[1] - o.y; if (Math.hypot(dx, dy) < 5) { this.pfad.shift(); if (!this.pfad.length && this.zielOrt && Math.hypot(o.x - this.zielOrt.x, o.y - this.zielOrt.y) < this.zielOrt.r) { this.nah = null; /* Knopf neu beschriften */ const zo = this.zielOrt; this.zielOrt = null; this.time.delayedCall(60, () => { if (this.nah === zo) this.betreten(); }); } } else { const qy = dy / 0.62, q = Math.hypot(dx, qy); rx = dx / q; ry = qy / q; } }
    const l = Math.hypot(rx, ry), faehrt = !this.gesperrt && l > 0.05;
    if (faehrt) { const k = Math.min(1, l) / l, sx = rx * k * TEMPO * d, sy = ry * k * TEMPO * 0.62 * d; // nach oben und unten langsamer: der Boden liegt schräg
      if (frei(o.x + sx, o.y + sy)) { o.x += sx; o.y += sy; } else if (frei(o.x + sx, o.y)) o.x += sx; else if (frei(o.x, o.y + sy)) o.y += sy; // an Kanten entlanggleiten
      if (Math.abs(rx) > 0.35) this.figur.setFlipX(rx < 0); }
    for (const m of this.leute) { // schlendern: zum nächsten Wegpunkt, dort kurz stehen bleiben
      if (m.pause > 0) { m.pause -= d; if (m.pause <= 0) m.s.anims.resume(); } else { const z = m.d.weg[m.n], dx = z[0] - m.x, dy = z[1] - m.y, w = Math.hypot(dx, dy), schritt = m.d.tempo * d; if (w <= schritt) { m.x = z[0]; m.y = z[1]; m.n = (m.n + 1) % m.d.weg.length; if (Math.random() < 0.6) { m.pause = 1.5 + Math.random() * 3; m.s.anims.pause(); m.s.setFrame(0); } } else { m.x += dx / w * schritt; m.y += dy / w * schritt * (Math.abs(dy) > Math.abs(dx) ? 0.8 : 1); if (Math.abs(dx) > 2) m.s.setFlipX(dx < 0); } }
      m.s.setPosition(m.x * F, m.y * F + 3).setDepth(m.y); }
    const D = HELDEN[this.held]; if (faehrt !== this.laeuft && D.figur && D.lauf) { this.laeuft = faehrt; if (faehrt) { const L = D.laufMass || [0.5, 0.946, 0.91]; this.figur.play("lauf-" + this.held); this.figur.setOrigin(L[0], L[1]).setScale(GROSS / (L[2] * 176)); } else { const fu = D.fuss || [0.5, 0.94]; this.figur.stop(); this.figur.setTexture("figur-" + this.held); this.figur.setOrigin(fu[0], fu[1]).setScale(GROSS * (D.gross || 1) / this.figur.height); } }
    const x = o.x * F, y = o.y * F; this.figur.setPosition(x, y + 3).setDepth(o.y); this.ring.setPosition(x, y).setDepth(o.y - 0.01);
    const k = this.cameras.main; k.scrollX += (x - k.width / 2 - k.scrollX) * 0.12; k.scrollY += (y - 50 - k.height / 2 - k.scrollY) * 0.12;
    { const pk = $("#ez-karte-punkt"); pk.style.left = (100 * o.x / BW) + "%"; pk.style.top = (100 * o.y / BH) + "%"; }
    let nah: typeof this.nah = null; for (const q of ORTE) if (Math.hypot(o.x - q.x, o.y - q.y) < q.r) nah = q;
    if (nah !== this.nah) { this.nah = nah; const kn = $("#ez-dorf-knopf"); kn.classList.remove("bald"); kn.hidden = !nah; if (nah) kn.textContent = nah.tat === "bald" ? nah.name : nah.text + (HANDY ? "" : "  [E]"); }
  }
}
