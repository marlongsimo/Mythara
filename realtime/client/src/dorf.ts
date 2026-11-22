/*
 * Mythara Echtzeit – das Dorf: ein begehbarer Platz mit Gebäuden. Von hier geht es durch das Tor in den Riss.
 * Im Dorf wird nicht gekämpft, deshalb rechnet es der Browser allein (kein Server nötig). Sobald man hier andere Spieler sehen soll, wandert es auf den Server.
 * Die Gebäude sind vorerst Platzhalter; Grundriss und Boden kommen aus werkzeug/dorf.py.
 */
import Phaser from "phaser";
import { HELDEN } from "../../shared/config";
import { heldenFigur, richten } from "./modulfigur";
import DORF from "./dorf.json";

const KW = 64, KHOCH = 32, R = 0.36, TEMPO = 4.2;
const iso = (x: number, y: number) => ({ x: (x - y) * KW / 2, y: (x + y) * KHOCH / 2 });
const $ = (s: string) => document.querySelector(s) as HTMLElement;
const HANDY = window.matchMedia("(pointer: coarse)").matches || new URLSearchParams(location.search).get("handy") === "1";
interface Bau { id: string; name: string; r: number[]; h: number; wand: string; dach: string; tuer: number[]; tat: string; text: string; bild?: string; flach?: boolean; breite?: number; anker?: number[]; tex?: string }
type Wahl = (los: (held: string, mit: string[]) => void, zurueck: () => void) => void;

export class Dorf extends Phaser.Scene {
  held = "schildwaechter"; ort = { x: DORF.start.x, y: DORF.start.y }; rx = 0; ry = 0; figur!: Phaser.GameObjects.Sprite; ring!: Phaser.GameObjects.Ellipse; laeuft = false; tasten: Record<string, boolean> = {};
  bauten: { b: Bau; g: Phaser.GameObjects.Container }[] = []; nah: Bau | null = null; gesperrt = false; stick: { id: number; x: number; y: number } | null = null;
  constructor() { super("dorf"); }
  init(d: { held?: string }) { let h = d && d.held; try { h = h || localStorage.getItem("ez_held") || ""; } catch { /* privat */ } this.held = HELDEN[h || ""] ? (h as string) : "schildwaechter"; }
  preload() { this.load.image("dorf-boden", "../img/echtzeit/dorf-boden.webp"); this.load.image("wiese-kachel", "../img/echtzeit/wiese-kachel.webp"); { const da = new Set<string>(); for (const b of DORF.bauten as Bau[]) { const k = b.tex || b.id; if (b.bild && !da.has(k)) { da.add(k); this.load.image("bau-" + k, "../" + b.bild); } } } this.load.spritesheet("rune", "../img/echtzeit/rune.webp", { frameWidth: 160, frameHeight: 160 }); this.load.spritesheet("fackel", "../img/echtzeit/fackel.webp", { frameWidth: 26, frameHeight: 78 });
    const D = HELDEN[this.held]; if (D.figur) this.load.image("figur-" + this.held, "../" + D.figur); if (D.lauf) this.load.spritesheet("lauf-" + this.held, "../" + D.lauf, { frameWidth: 176, frameHeight: 176 }); this.load.image(this.held, "../" + D.bild); }
  create() {
    document.body.classList.add("dorf"); this.events.once("shutdown", () => { document.body.classList.remove("dorf"); $("#ez-dorf-knopf").hidden = true; });
    this.cameras.main.setBackgroundColor(DORF.gruen); { const m = iso(DORF.DB / 2, DORF.DH / 2); this.add.tileSprite(m.x, m.y, 9000, 9000, "wiese-kachel").setScale(1, 0.5).setTint(0xd8d8d8).setDepth(-1); } // Wiese, so weit das Auge reicht
    this.add.image(-DORF.OX, -DORF.OY, "dorf-boden").setOrigin(0, 0).setDepth(0);
    if (!this.textures.exists("schein")) { const t = this.textures.createCanvas("schein", 128, 128); if (t) { const c = t.getContext(), g = c.createRadialGradient(64, 64, 2, 64, 64, 64); g.addColorStop(0, "rgba(255,190,110,1)"); g.addColorStop(0.35, "rgba(255,140,60,.45)"); g.addColorStop(1, "rgba(255,110,40,0)"); c.fillStyle = g; c.fillRect(0, 0, 128, 128); t.refresh(); } }
    if (!this.anims.exists("fackel")) this.anims.create({ key: "fackel", frames: this.anims.generateFrameNumbers("fackel", {}), frameRate: 11, repeat: -1 });
    if (!this.anims.exists("rune")) this.anims.create({ key: "rune", frames: this.anims.generateFrameNumbers("rune", {}), frameRate: 9, repeat: -1 });
    for (const l of DORF.laternen) { const p = iso(l[0], l[1]); this.add.rectangle(p.x, p.y - 22, 4, 44, 0x2a2430).setDepth(10 + (l[0] + l[1]) * 10); const f = this.add.sprite(p.x, p.y - 44, "fackel").setOrigin(0.5, 0.8).setScale(0.6).setDepth(10 + (l[0] + l[1]) * 10 + 0.1); f.play({ key: "fackel", startFrame: Math.floor(Math.random() * 9) });
      const s = this.add.image(p.x, p.y, "schein").setBlendMode(Phaser.BlendModes.ADD).setScale(1.8, 0.9).setAlpha(0.22).setDepth(1); this.tweens.add({ targets: s, alpha: 0.14, duration: 120 + Math.random() * 160, yoyo: true, repeat: -1 }); }
    if (DORF.brunnen.r > 0) { const B = DORF.brunnen, p = iso(B.x, B.y), g = this.add.graphics().setDepth(10 + (B.x + B.y) * 10); g.fillStyle(0x4a4658).fillEllipse(p.x, p.y, B.r * KW * 1.3, B.r * KHOCH * 1.3); g.fillStyle(0x2b3f5c).fillEllipse(p.x, p.y - 6, B.r * KW * 1.05, B.r * KHOCH * 1.05); g.lineStyle(3, 0x7b768c).strokeEllipse(p.x, p.y - 6, B.r * KW * 1.3, B.r * KHOCH * 1.3);
      const r = this.add.sprite(p.x, p.y - 34, "rune").setScale(0.42).setBlendMode(Phaser.BlendModes.ADD).setDepth(10 + (B.x + B.y) * 10 + 0.2); r.play("rune"); this.tweens.add({ targets: r, y: p.y - 40, alpha: 0.7, duration: 1500, yoyo: true, repeat: -1, ease: "Sine.easeInOut" }); }
    for (const b of DORF.bauten as Bau[]) { const g = this.bau(b); if (!b.flach) g.setDepth(100 + b.r[0] + b.r[2] + b.r[1] + b.r[3]); this.bauten.push({ b, g }); } // weiter vorn = später gezeichnet
    const D = HELDEN[this.held]; this.ring = this.add.ellipse(0, 0, 46, 23).setStrokeStyle(3, 0xffffff, 0.95);
    if (D.figur) { const F = D.fuss || [0.5, 0.94]; this.figur = heldenFigur(this, 0, 0, this.held, 84).setOrigin(F[0], F[1]); this.figur.setScale(84 * (D.gross || 1) / this.figur.height); if (D.lauf && !this.anims.exists("lauf-" + this.held)) this.anims.create({ key: "lauf-" + this.held, frames: this.anims.generateFrameNumbers("lauf-" + this.held, {}), frameRate: 11, repeat: -1 }); }
    else { this.figur = this.add.sprite(0, 0, this.held).setOrigin(0.5, 1); this.figur.setScale(60 / this.figur.height); }
    const taste = (ev: KeyboardEvent, an: boolean) => { const k = ev.key.toLowerCase(); if (!this.scene.isActive() || this.gesperrt) return; if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) { ev.preventDefault(); this.tasten[k] = an; const t = this.tasten; this.richtung((t.d || t.arrowright ? 1 : 0) - (t.a || t.arrowleft ? 1 : 0), (t.s || t.arrowdown ? 1 : 0) - (t.w || t.arrowup ? 1 : 0)); } else if (an && (k === "e" || k === "enter")) this.betreten(); };
    const runter = (ev: KeyboardEvent) => { if (!ev.repeat) taste(ev, true); }, hoch = (ev: KeyboardEvent) => taste(ev, false); window.addEventListener("keydown", runter); window.addEventListener("keyup", hoch); this.events.once("shutdown", () => { window.removeEventListener("keydown", runter); window.removeEventListener("keyup", hoch); });
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => { if (this.gesperrt || this.stick) return; this.stick = { id: p.id, x: p.x, y: p.y }; if (p.wasTouch) { const el = $("#ez-stick"); el.hidden = false; el.style.left = p.x + "px"; el.style.top = p.y + "px"; } });
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => { const st = this.stick; if (!st || p.id !== st.id) return; const dx = p.x - st.x, dy = p.y - st.y, l = Math.hypot(dx, dy), m = 46; ($("#ez-stick i") as HTMLElement).style.transform = `translate(calc(-50% + ${dx / Math.max(l, 1) * Math.min(l, m)}px), calc(-50% + ${dy / Math.max(l, 1) * Math.min(l, m)}px))`; if (l < 8) this.richtung(0, 0); else { const k = Math.min(1, l / m); this.richtung(dx / l * k, dy / l * k); } });
    this.input.on("pointerup", (p: Phaser.Input.Pointer) => { if (this.stick && p.id === this.stick.id) { this.stick = null; $("#ez-stick").hidden = true; this.richtung(0, 0); } });
    $("#ez-dorf-knopf").onclick = () => this.betreten();
    $("#ez-dorf-hilfe").textContent = HANDY ? "Finger aufs Feld: laufen · zu einem Gebäude gehen und den Knopf antippen" : "WASD: laufen · vor einem Gebäude: E oder Enter";
    this.groesse(); this.scale.on("resize", () => this.groesse()); const p = iso(this.ort.x, this.ort.y); this.cameras.main.centerOn(p.x, p.y - 40);
    (window as unknown as Record<string, unknown>).EZD = { szene: this, ort: () => this.ort, nah: () => (this.nah ? this.nah.id : ""), bauten: DORF.bauten };
  }
  groesse() { this.cameras.main.setZoom(Phaser.Math.Clamp(this.scale.height / (HANDY ? 520 : 780), 0.6, 2.2)); }
  /** Ein Gebäude als Kasten mit Dach und Schild (Platzhalter, bis es ein Bild gibt) */
  bau(b: Bau): Phaser.GameObjects.Container {
    if (b.bild && !b.flach) { // ein gemaltes Gebäude: steht mit der vorderen Ecke seines Sockels auf der vorderen Ecke des Grundrisses
      const v = iso(b.r[0] + b.r[2], b.r[1] + b.r[3]), a = b.anker || [0.5, 0.98], bild = this.add.image(v.x, v.y, "bau-" + (b.tex || b.id)).setOrigin(a[0], a[1]); bild.setScale((b.breite || 300) / bild.width); return this.add.container(0, 0, [bild]); }
    if (b.bild && b.flach) { // ein Bild, das flach am Boden liegt (der Riss): Schimmer und Schild darüber
      const m = iso(b.r[0] + b.r[2] / 2, b.r[1] + b.r[3] / 2), bild = this.add.image(m.x, m.y, "bau-" + (b.tex || b.id)); bild.setScale((b.breite || 300) / bild.width);
      const s = this.add.image(m.x, m.y, "schein").setBlendMode(Phaser.BlendModes.ADD).setTint(0x6aa0ff).setScale(3.2, 1.6).setAlpha(0.35); this.tweens.add({ targets: s, alpha: 0.15, duration: 1300, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      const schild = this.add.text(m.x, m.y - bild.displayHeight / 2 - 4, b.name, { fontFamily: "Cinzel, Georgia, serif", fontSize: "14px", color: "#cfe0ff", stroke: "#000", strokeThickness: 4 }).setOrigin(0.5);
      return this.add.container(0, 0, [bild, s, schild]).setDepth(3); }
    const [x, y, w, t] = b.r, g = this.add.graphics(), c = this.add.container(0, 0), A = iso(x, y), B = iso(x + w, y), C = iso(x + w, y + t), Dp = iso(x, y + t), h = b.h, farbe = (s: string) => Phaser.Display.Color.HexStringToColor(s), mal = (s: string, f: number) => { const k = farbe(s); return Phaser.Display.Color.GetColor(Math.min(255, k.red * f), Math.min(255, k.green * f), Math.min(255, k.blue * f)); };
    const flaeche = (pts: { x: number; y: number }[], col: number) => { g.fillStyle(col, 1); g.beginPath(); g.moveTo(pts[0].x, pts[0].y); for (const p of pts.slice(1)) g.lineTo(p.x, p.y); g.closePath(); g.fillPath(); };
    const hoch = (p: { x: number; y: number }, n = h) => ({ x: p.x, y: p.y - n });
    flaeche([Dp, C, hoch(C), hoch(Dp)], mal(b.wand, 1.0)); flaeche([C, B, hoch(B), hoch(C)], mal(b.wand, 0.62)); // linke und rechte Wand
    const M = { x: (A.x + C.x) / 2, y: (A.y + C.y) / 2 - h - Math.min(60, h * 0.5) }; // Dachspitze
    flaeche([hoch(Dp), hoch(C), M], mal(b.dach, 1.0)); flaeche([hoch(C), hoch(B), M], mal(b.dach, 0.68)); flaeche([hoch(A), hoch(B), M], mal(b.dach, 0.5)); flaeche([hoch(A), hoch(Dp), M], mal(b.dach, 0.8));
    g.lineStyle(2, 0x000000, 0.35); g.strokePoints([Dp, C, B, hoch(B), hoch(C), hoch(Dp)], true); g.lineBetween(C.x, C.y, C.x, C.y - h);
    // Tür an der Wand, die zur Tür zeigt, und ein Schild
    const links = b.tuer[1] > y + t - 0.01, m = links ? { x: (Dp.x + C.x) / 2, y: (Dp.y + C.y) / 2 } : { x: (C.x + B.x) / 2, y: (C.y + B.y) / 2 }; g.fillStyle(b.tat === "riss" ? 0x6a4cc0 : 0x1a1410, 1); g.fillRoundedRect(m.x - 13, m.y - 44, 26, 44, { tl: 12, tr: 12, bl: 0, br: 0 }); g.fillStyle(0xffc470, 0.9); g.fillCircle(m.x + 20, m.y - 50, 4);
    const schild = this.add.text(m.x, m.y - Math.min(h - 8, 78), b.name, { fontFamily: "Cinzel, Georgia, serif", fontSize: "13px", color: "#ffe9a8", stroke: "#000", strokeThickness: 4, backgroundColor: "rgba(20,16,12,.75)", padding: { x: 6, y: 2 } }).setOrigin(0.5);
    if (b.tat === "riss") { const s = this.add.image(m.x, m.y - 22, "schein").setBlendMode(Phaser.BlendModes.ADD).setTint(0x9a7bff).setScale(0.9).setAlpha(0.7); this.tweens.add({ targets: s, alpha: 0.35, scale: 1.1, duration: 1100, yoyo: true, repeat: -1 }); c.add([g, s, schild]); } else c.add([g, schild]);
    return c;
  }
  richtung(sx: number, sy: number) { let x = sx + sy, y = sy - sx; const l = Math.hypot(x, y), k = Math.min(1, Math.hypot(sx, sy)); if (l > 0.01) { x = x / l * k; y = y / l * k; } else { x = 0; y = 0; } this.rx = x; this.ry = y; }
  betreten() { const b = this.nah; if (!b || this.gesperrt) return;
    if (b.tat === "riss") { this.gesperrt = true; this.richtung(0, 0); this.tasten = {}; const wahl = (window as unknown as { EZ_WAHL: Wahl }).EZ_WAHL; wahl((held, mit) => { try { localStorage.setItem("ez_held", held); } catch { /* privat */ } this.scene.start("spiel", { held, mit }); }, () => { this.gesperrt = false; }); }
    else if (b.tat === "arena") location.href = "../spiel.html";
    else { const k = $("#ez-dorf-knopf"); k.textContent = b.text; k.classList.add("bald"); } }
  update(_t: number, dt: number) {
    const d = Math.min(0.05, dt / 1000), o = this.ort, faehrt = !this.gesperrt && (this.rx !== 0 || this.ry !== 0);
    if (faehrt) { o.x += this.rx * TEMPO * d; o.y += this.ry * TEMPO * d;
      o.x = Phaser.Math.Clamp(o.x, 0.6, DORF.DB - 0.6); o.y = Phaser.Math.Clamp(o.y, 0.6, DORF.DH - 0.6);
      for (const { b } of this.bauten) { const [x, y, w, t] = b.r, nx = Phaser.Math.Clamp(o.x, x, x + w), ny = Phaser.Math.Clamp(o.y, y, y + t), dx = o.x - nx, dy = o.y - ny, l = Math.hypot(dx, dy); if (l < R && l > 1e-4) { o.x = nx + dx / l * R; o.y = ny + dy / l * R; } else if (l <= 1e-4) { o.y = y + t + R; } }
      const B = DORF.brunnen, bd = Math.hypot(o.x - B.x, o.y - B.y); if (bd < B.r + R && bd > 1e-4) { o.x = B.x + (o.x - B.x) / bd * (B.r + R); o.y = B.y + (o.y - B.y) / bd * (B.r + R); }
      const sx = this.rx - this.ry; richten(this.figur, sx, (this.rx + this.ry) / 2); if (Math.abs(sx) > 0.2) this.figur.setFlipX(sx < 0); }
    const D = HELDEN[this.held]; if (faehrt !== this.laeuft && D.figur && D.lauf) { this.laeuft = faehrt; if (faehrt) { const L = D.laufMass || [0.5, 0.946, 0.91]; this.figur.play("lauf-" + this.held); this.figur.setOrigin(L[0], L[1]).setScale(84 / (L[2] * 176)); } else { const F = D.fuss || [0.5, 0.94]; this.figur.stop(); this.figur.setTexture("figur-" + this.held); this.figur.setOrigin(F[0], F[1]).setScale(84 * (D.gross || 1) / this.figur.height); } }
    // Tiefe: Der Held steht vor allem, wovor er steht, und hinter allem, wohinter er steht – gemessen an den Gebäuden und Bäumen in seiner Nähe
    let vorn = 100, hinten = 1e9; for (const { b } of this.bauten) { if (b.flach) continue; const [x, y, w, t] = b.r; if (o.x < x - 9 || o.x > x + w + 9 || o.y < y - 9 || o.y > y + t + 9) continue; const basis = 100 + x + w + y + t; if (o.x >= x + w || o.y >= y + t) vorn = Math.max(vorn, basis); else hinten = Math.min(hinten, basis); }
    const p = iso(o.x, o.y), tief = hinten > vorn ? (hinten === 1e9 ? vorn + 1 : (vorn + hinten) / 2) : vorn + 0.01; this.figur.setPosition(p.x, p.y + 3).setDepth(tief); this.ring.setPosition(p.x, p.y).setDepth(tief - 0.005);
    const k = this.cameras.main; k.scrollX += (p.x - k.width / 2 - k.scrollX) * 0.12; k.scrollY += (p.y - 40 - k.height / 2 - k.scrollY) * 0.12;
    let nah: Bau | null = null; for (const { b } of this.bauten) { const [x, y, w, t] = b.r; if (b.flach ? Math.hypot(o.x - Phaser.Math.Clamp(o.x, x, x + w), o.y - Phaser.Math.Clamp(o.y, y, y + t)) < 1.0 : Math.hypot(o.x - b.tuer[0], o.y - b.tuer[1]) < 1.3) nah = b; } // an den Riss kann man von jeder Seite herantreten
    if (nah !== this.nah) { this.nah = nah; const kn = $("#ez-dorf-knopf"); kn.classList.remove("bald"); kn.hidden = !nah; if (nah) kn.textContent = nah.tat === "bald" ? nah.name : nah.text + (HANDY ? "" : "  [E]"); }
  }
}
