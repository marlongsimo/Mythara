/*
 * Mythara Echtzeit – der Client: zeigt die Welt isometrisch, nimmt Klicks und Tasten entgegen, schickt sie als Eingaben
 * und stellt dar, was die Simulation zurückmeldet. Er entscheidet nichts über Treffer oder Schaden.
 */
import Phaser from "phaser";
import { HELDEN, MONSTER, K, TICK, ZUSTAND_JE } from "../../shared/config";
import { KB, KH, fels, SIEGEL } from "../../shared/karte";
import type { Zustand, Ereignis } from "../../shared/sim";
import { verbinde, Netz } from "./netz";

const P = new URLSearchParams(location.search), $ = (s: string) => document.querySelector(s) as HTMLElement;
/* Adresse des Spielservers. Leer = der Browser rechnet selbst. Wird nach dem Einrichten des Servers hier eingetragen; ?server=… überschreibt zum Testen. */
const SERVER = P.get("server") ?? "";
const HELD = HELDEN[P.get("held") || ""] ? (P.get("held") as string) : "schildwaechter";
const KW = 64, KHOCH = 32, WAND = 30; // Kachelbreite und -höhe am Bildschirm, Höhe einer Felswand
const iso = (x: number, y: number) => ({ x: (x - y) * KW / 2, y: (x + y) * KHOCH / 2 });
const welt = (sx: number, sy: number) => ({ x: sy / KHOCH + sx / KW, y: sy / KHOCH - sx / KW });
const HANDY = window.matchMedia("(pointer: coarse)").matches || P.get("handy") === "1";

interface Bild { c: Phaser.GameObjects.Container; balken: Phaser.GameObjects.Graphics; name: Phaser.GameObjects.Text; ring: Phaser.GameObjects.Ellipse; kopf: Phaser.GameObjects.Image; von: { x: number; y: number }; nach: { x: number; y: number }; t0: number; lp: number; max: number; held: boolean; team: number; typ: string; tot: boolean }

class Spiel extends Phaser.Scene {
  netz!: Netz; z: Zustand | null = null; bilder = new Map<number, Bild>(); schuesse = new Map<number, Phaser.GameObjects.Arc>(); ichId = 0; zielMarke!: Phaser.GameObjects.Ellipse; klickMarke!: Phaser.GameObjects.Ellipse;
  zeiger = { x: 0, y: 0 }; letzterLauf = 0; gehalten = false;
  constructor() { super("spiel"); }
  preload() { const alle: Record<string, string> = {}; for (const k in HELDEN) alle[k] = HELDEN[k].bild; for (const k in MONSTER) alle[k] = MONSTER[k].bild; for (const k in alle) this.load.image(k, "../" + alle[k]); }
  create() {
    this.cameras.main.setBackgroundColor("#07060b"); this.boden(); this.waende();
    const s = iso(SIEGEL.x, SIEGEL.y); this.add.ellipse(s.x, s.y, 80, 40, 0xb79bff, 0.25).setStrokeStyle(2, 0xd9cdf5, 0.8).setDepth(1); this.add.text(s.x, s.y - 6, "SIEGEL", { fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#e6dcff" }).setOrigin(0.5).setDepth(1);
    this.klickMarke = this.add.ellipse(0, 0, 34, 17).setStrokeStyle(2, 0x8dffb0, 0.9).setDepth(2).setVisible(false);
    this.zielMarke = this.add.ellipse(0, 0, 54, 27).setStrokeStyle(3, 0xff6a6a, 0.95).setDepth(2).setVisible(false);
    this.groesse(); this.scale.on("resize", () => this.groesse());
    this.input.mouse?.disableContextMenu();
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => { this.gehalten = true; this.klick(p, true); });
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => { const w = this.zuWelt(p); this.zeiger = w; if (this.gehalten && this.time.now - this.letzterLauf > 160) this.klick(p, false); });
    this.input.on("pointerup", () => { this.gehalten = false; });
    this.input.keyboard?.on("keydown", (ev: KeyboardEvent) => { const k = ev.key.toLowerCase(); if (k === "q" || k === "e") this.faehig(k); else if (k === "s") this.netz.sende({ t: "halt" }); });
    for (const b of Array.from(document.querySelectorAll<HTMLElement>("[data-taste]"))) b.addEventListener("pointerdown", (ev) => { ev.preventDefault(); ev.stopPropagation(); this.faehig(b.dataset.taste as "q" | "e"); });
    $("#ez-neu").addEventListener("click", () => this.netz.sende({ t: "neu" }));
    verbinde(SERVER, HELD, (z) => this.zustand(z), (art, grund) => { $("#ez-art").textContent = art === "server" ? "Server" + (grund ? " – " + grund : "") : "ohne Server (dein Browser rechnet)" + (SERVER && grund ? " – " + grund : ""); $("#ez-art").className = "ez-kasten " + art; }).then((n) => { this.netz = n; (window as unknown as Record<string, unknown>).EZ = { szene: this, netz: n, zustand: () => this.z }; });
  }
  groesse() { const k = this.cameras.main, h = this.scale.height; k.setZoom(Phaser.Math.Clamp(h / (HANDY ? 420 : 620), 0.7, 2.2)); }
  /** Boden als ein Bild: Rauten in zwei Tönen */
  boden() { const g = this.add.graphics().setDepth(0);
    for (let j = 0; j < KH; j++) for (let i = 0; i < KB; i++) { if (fels(i, j)) continue; const p = iso(i + 0.5, j + 0.5); g.fillStyle((i + j) % 2 ? 0x2b2636 : 0x302a3d, 1); g.beginPath(); g.moveTo(p.x, p.y - KHOCH / 2); g.lineTo(p.x + KW / 2, p.y); g.lineTo(p.x, p.y + KHOCH / 2); g.lineTo(p.x - KW / 2, p.y); g.closePath(); g.fillPath(); } }
  /** Felswände: nur wo Fels an Boden grenzt, je Feld ein Block, nach Tiefe sortiert */
  waende() { for (let j = -1; j <= KH; j++) for (let i = -1; i <= KB; i++) { if (!fels(i, j)) continue; let rand = false; for (let a = -1; a <= 1 && !rand; a++) for (let b = -1; b <= 1; b++) if (!fels(i + a, j + b)) { rand = true; break; } if (!rand) continue;
      const p = iso(i + 0.5, j + 0.5), g = this.add.graphics().setDepth(10 + (i + j + 1) * 10 + 4), o = p.y - WAND;
      g.fillStyle(0x4a4260, 1); g.beginPath(); g.moveTo(p.x, o - KHOCH / 2); g.lineTo(p.x + KW / 2, o); g.lineTo(p.x, o + KHOCH / 2); g.lineTo(p.x - KW / 2, o); g.closePath(); g.fillPath();
      g.fillStyle(0x2a2438, 1); g.beginPath(); g.moveTo(p.x - KW / 2, o); g.lineTo(p.x, o + KHOCH / 2); g.lineTo(p.x, p.y + KHOCH / 2); g.lineTo(p.x - KW / 2, p.y); g.closePath(); g.fillPath();
      g.fillStyle(0x1d1928, 1); g.beginPath(); g.moveTo(p.x + KW / 2, o); g.lineTo(p.x, o + KHOCH / 2); g.lineTo(p.x, p.y + KHOCH / 2); g.lineTo(p.x + KW / 2, p.y); g.closePath(); g.fillPath();
      if (!fels(i - 1, j) || !fels(i, j - 1) || !fels(i + 1, j) || !fels(i, j + 1)) g.setAlpha(fels(i, j + 1) && fels(i + 1, j) ? 1 : 0.82); } }
  zuWelt(p: Phaser.Input.Pointer) { const w = this.cameras.main.getWorldPoint(p.x, p.y); return welt(w.x, w.y); }
  /** Klick oder Tippen: auf einen Gegner = angreifen, sonst dorthin laufen */
  klick(p: Phaser.Input.Pointer, neu: boolean) {
    if (!this.netz || !this.z) return; const w = this.zuWelt(p); this.zeiger = w; this.letzterLauf = this.time.now;
    if (neu) { let best: [number, number] | null = null; for (const e of this.z.w) { if (e[3] === 0 || e[10]) continue; const d = Math.hypot(e[4] - w.x, e[5] - w.y - 0.25); if (d < (HANDY ? 1.25 : 0.95) && (!best || d < best[0])) best = [d, e[0]]; }
      if (best) { this.netz.sende({ t: "ziel", id: best[1] }); return; } }
    this.netz.sende({ t: "lauf", x: w.x, y: w.y }); if (neu) { const s = iso(w.x, w.y); this.klickMarke.setPosition(s.x, s.y).setVisible(true).setScale(1).setAlpha(1); this.tweens.add({ targets: this.klickMarke, scale: 0.3, alpha: 0, duration: 450 }); }
  }
  /** Fähigkeit in Richtung des Mauszeigers; am Handy auf das aktuelle Ziel, sonst in Blickrichtung */
  faehig(taste: "q" | "e") { if (!this.netz || !this.z) return; let ziel = this.zeiger; const ich = this.z.w.find((e) => e[0] === this.ichId);
    if (HANDY && ich) { const zi = this.z.w.find((e) => e[0] === this.z!.ich.zielId) || this.z.w.filter((e) => e[3] !== 0 && !e[10]).sort((a, b) => Math.hypot(a[4] - ich[4], a[5] - ich[5]) - Math.hypot(b[4] - ich[4], b[5] - ich[5]))[0];
      ziel = zi && Math.hypot(zi[4] - ich[4], zi[5] - ich[5]) < 8 ? { x: zi[4], y: zi[5] } : { x: ich[4] + Math.cos(ich[6]) * 3, y: ich[5] + Math.sin(ich[6]) * 3 }; }
    this.netz.sende({ t: "faehig", taste, x: ziel.x, y: ziel.y }); }

  figur(e: Zustand["w"][number]): Bild {
    const [id, held, typ, team] = e, r = held ? 20 : Math.round((MONSTER[typ]?.r || 0.35) * 56), c = this.add.container(0, 0);
    const schatten = this.add.ellipse(0, 0, r * 2.1, r * 1.05, 0x000000, 0.45), ring = this.add.ellipse(0, 0, r * 2.3, r * 1.15).setStrokeStyle(3, id === this.ichId ? 0xffffff : team === 0 ? 0x6aa5ff : 0xff6a6a, 0.95);
    const kopf = this.add.image(0, -r - 8, typ), mass = Math.min(kopf.width, kopf.height) || 1; kopf.setCrop((kopf.width - mass) / 2, 0, mass, mass).setDisplaySize(r * 2 * kopf.width / mass, r * 2 * kopf.height / mass).setOrigin(0.5, mass / 2 / kopf.height);
    const maske = this.make.graphics({}); maske.fillStyle(0xffffff).fillCircle(0, 0, r); kopf.setMask(maske.createGeometryMask()); (kopf as unknown as { m: Phaser.GameObjects.Graphics }).m = maske;
    const rand = this.add.circle(0, -r - 8, r).setStrokeStyle(3, team === 0 ? (id === this.ichId ? 0xffffff : 0x6aa5ff) : MONSTER[typ]?.boss ? 0xffcf6a : 0xff6a6a, 1);
    const balken = this.add.graphics(), name = this.add.text(0, -2 * r - 26, "", { fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#ffffff", stroke: "#000", strokeThickness: 3 }).setOrigin(0.5);
    c.add([schatten, ring, kopf, rand, balken, name]); const b: Bild = { c, balken, name, ring, kopf, von: { x: e[4], y: e[5] }, nach: { x: e[4], y: e[5] }, t0: this.time.now, lp: -1, max: 0, held: Boolean(held), team, typ, tot: false };
    this.bilder.set(id, b); return b;
  }
  zustand(z: Zustand) {
    this.z = z; this.ichId = z.ich.id; const da = new Set<number>(), jetzt = this.time.now;
    for (const e of z.w) { da.add(e[0]); let b = this.bilder.get(e[0]); if (!b) b = this.figur(e);
      const hier = this.ort(b, jetzt); b.von = Math.hypot(hier.x - e[4], hier.y - e[5]) > 3 ? { x: e[4], y: e[5] } : hier; b.nach = { x: e[4], y: e[5] }; b.t0 = jetzt; // große Sprünge (Blinzeln, Wiederkehr) nicht nachziehen
      b.tot = Boolean(e[10]); b.c.setVisible(!b.tot);
      if (b.lp !== e[7] || b.max !== e[8]) { b.lp = e[7]; b.max = e[8]; const r = b.held ? 20 : Math.round((MONSTER[b.typ]?.r || 0.35) * 56), w = r * 2.4, y = -2 * r - 16; b.balken.clear(); b.balken.fillStyle(0x000000, 0.7).fillRect(-w / 2, y, w, 6); b.balken.fillStyle(b.team === 0 ? 0x5fd08a : 0xff6a6a, 1).fillRect(-w / 2, y, w * Math.max(0, e[7] / e[8]), 6); }
      const text = (b.held ? HELDEN[b.typ].name : MONSTER[b.typ].name) + (b.held ? " · " + e[9] : "") + (e[12] ? " ✦" : ""); if (b.name.text !== text) b.name.setText(text);
      b.ring.setStrokeStyle(e[11] ? 5 : 3, e[11] ? 0xffe08a : e[0] === this.ichId ? 0xffffff : b.team === 0 ? 0x6aa5ff : 0xff6a6a, 0.95); }
    for (const [id, b] of this.bilder) if (!da.has(id)) { const m = (b.kopf as unknown as { m?: Phaser.GameObjects.Graphics }).m; if (m) m.destroy(); b.c.destroy(); this.bilder.delete(id); }
    const sda = new Set<number>(); for (const g of z.g) { sda.add(g[0]); let s = this.schuesse.get(g[0]); const p = iso(g[1], g[2]); if (!s) { s = this.add.circle(p.x, p.y - 24, g[3] === "feuer" ? 9 : 5, g[3] === "feuer" ? 0xff8a2a : 0x9ad0ff); this.schuesse.set(g[0], s); } this.tweens.add({ targets: s, x: p.x, y: p.y - 24, duration: 1000 * ZUSTAND_JE / TICK }); s.setDepth(10 + (g[1] + g[2]) * 10 + 8); }
    for (const [id, s] of this.schuesse) if (!sda.has(id)) { s.destroy(); this.schuesse.delete(id); }
    for (const ev of z.ev) this.ereignis(ev);
    this.anzeige(z);
  }
  ort(b: Bild, jetzt: number) { const k = Math.min(1, (jetzt - b.t0) / (1000 * ZUSTAND_JE / TICK)); return { x: b.von.x + (b.nach.x - b.von.x) * k, y: b.von.y + (b.nach.y - b.von.y) * k }; }
  ereignis(ev: Ereignis) {
    const zahl = (x: number, y: number, t: string, farbe: string, gross = false) => { const p = iso(x, y), o = this.add.text(p.x, p.y - 60, t, { fontFamily: "Inter, sans-serif", fontSize: gross ? "18px" : "15px", fontStyle: "bold", color: farbe, stroke: "#000", strokeThickness: 3 }).setOrigin(0.5).setDepth(99999); this.tweens.add({ targets: o, y: p.y - 100, alpha: 0, duration: gross ? 1400 : 800, onComplete: () => o.destroy() }); };
    const b = "id" in ev ? this.bilder.get(ev.id) : undefined;
    if (ev.a === "schaden" && b) zahl(b.nach.x, b.nach.y, String(ev.n), b.team === 0 ? "#ff8a8a" : "#ffffff");
    else if (ev.a === "hieb" && b) this.tweens.add({ targets: b.kopf, scale: b.kopf.scale * 1.18, duration: 70, yoyo: true });
    else if (ev.a === "auf" && b) zahl(b.nach.x, b.nach.y, "▲ Stufe " + ev.stufe, "#8fc0ff", true);
    else if (ev.a === "splitter") zahl(ev.x, ev.y, "◈ +" + ev.n, "#ff9aa8");
    else if (ev.a === "knall") { const p = iso(ev.x, ev.y), o = this.add.ellipse(p.x, p.y, ev.r * KW, ev.r * KHOCH, 0xff8a2a, 0.6).setDepth(3); this.tweens.add({ targets: o, alpha: 0, scale: 1.15, duration: 380, onComplete: () => o.destroy() }); this.cameras.main.shake(120, 0.004); }
    else if (ev.a === "warn") { const p = iso(ev.x, ev.y), o = this.add.ellipse(p.x, p.y, ev.r * KW, ev.r * KHOCH, 0xff3030, 0.12).setStrokeStyle(3, 0xff5050, 0.95).setDepth(3); this.tweens.add({ targets: o, fillAlpha: 0.5, duration: ev.t * 1000, onComplete: () => o.destroy() }); }
  }
  anzeige(z: Zustand) {
    const ich = z.w.find((e) => e[0] === z.ich.id); if (!ich) return; const D = HELDEN[ich[2]], s = ich[9], vor = K.XP_STUFE[s - 1], bis = K.XP_STUFE[s];
    $("#ez-name").textContent = `${D.name} · Stufe ${s}`; ($("#ez-lp") as HTMLElement).style.width = Math.round(100 * ich[7] / ich[8]) + "%"; $("#ez-lpzahl").textContent = ich[10] ? `gefallen – zurück in ${Math.ceil(z.ich.wieder)} s` : `${ich[7]} / ${ich[8]}`;
    ($("#ez-xp") as HTMLElement).style.width = (bis ? Math.round(100 * (ich[13] - vor) / (bis - vor)) : 100) + "%";
    const m = Math.floor(z.zeit / 60), sek = Math.floor(z.zeit % 60); $("#ez-stand").textContent = `◈ ${z.splitter} · Monster ${z.besiegt} / ${z.monster + z.besiegt - (z.monster - z.w.filter((e) => !e[1]).length)} · ${m}:${String(sek).padStart(2, "0")}`;
    for (const [taste, cd, def] of [["q", z.ich.cdQ, D.q], ["e", z.ich.cdE, D.e]] as const) { const el = $(`[data-taste="${taste}"]`); el.classList.toggle("zu", cd > 0); (el.querySelector("i") as HTMLElement).style.height = (cd > 0 ? Math.round(100 * cd / def.zeit) : 0) + "%"; (el.querySelector("b") as HTMLElement).textContent = cd > 0 ? String(Math.ceil(cd)) : taste.toUpperCase(); (el.querySelector("small") as HTMLElement).textContent = def.name; }
    const ende = $("#ez-ende"); if (z.phase === "sieg") { if (ende.hidden) { ende.hidden = false; $("#ez-ende-text").textContent = `Der Siegelwächter ist gefallen. Zeit ${m}:${String(sek).padStart(2, "0")} · ${z.splitter} Erbsplitter · Stufe ${s}`; } } else ende.hidden = true;
  }
  update() {
    const jetzt = this.time.now;
    for (const [id, b] of this.bilder) { const o = this.ort(b, jetzt), p = iso(o.x, o.y); b.c.setPosition(p.x, p.y).setDepth(10 + (o.x + o.y) * 10 + 5); const m = (b.kopf as unknown as { m?: Phaser.GameObjects.Graphics }).m; if (m) m.setPosition(p.x, p.y + b.kopf.y);
      if (id === this.ichId) { const k = this.cameras.main; k.scrollX += (p.x - k.width / 2 - k.scrollX) * 0.15; k.scrollY += (p.y - 30 - k.height / 2 - k.scrollY) * 0.15; } }
    const zb = this.z && this.z.ich.zielId ? this.bilder.get(this.z.ich.zielId) : undefined; if (zb && !zb.tot) { this.zielMarke.setVisible(true).setPosition(zb.c.x, zb.c.y); } else this.zielMarke.setVisible(false);
  }
}

new Phaser.Game({ type: Phaser.AUTO, parent: "ez-feld", backgroundColor: "#07060b", scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight }, scene: [Spiel], input: { activePointers: 3 }, render: { antialias: true } });
