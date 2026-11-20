/*
 * Mythara Echtzeit – der Client: zeigt die Welt isometrisch, nimmt Klicks und Tasten entgegen, schickt sie als Eingaben
 * und stellt dar, was die Simulation zurückmeldet. Er entscheidet nichts über Treffer oder Schaden.
 */
import Phaser from "phaser";
import { HELDEN, HELDENREIHE, MONSTER, TICK, ZUSTAND_JE } from "../../shared/config";
import { KB, KH, fels, SIEGEL } from "../../shared/karte";
import type { Zustand, Ereignis, Taste } from "../../shared/sim";
import { BIT } from "../../shared/sim";
import { verbinde, Netz } from "./netz";
import DEKOR from "./dekor.json"; // Maße und Fackelplätze, erzeugt von werkzeug/dekor.py

const P = new URLSearchParams(location.search), $ = (s: string) => document.querySelector(s) as HTMLElement;
/* Adresse des Spielservers. Leer = der Browser rechnet selbst. Wird nach dem Einrichten des Servers hier eingetragen; ?server=… überschreibt zum Testen. */
const SERVER = P.get("server") ?? "wss://mythara-echtzeit.onrender.com"; // ?server= (leer) erzwingt das Rechnen im Browser
const WAHL = { held: HELDEN[P.get("held") || ""] ? (P.get("held") as string) : "schildwaechter", mit: (P.get("mit") || "").split(",").filter((x) => HELDEN[x]).slice(0, 2) };
const KW = DEKOR.KW, KHOCH = DEKOR.KHOCH, WAND = DEKOR.WAND; // Kachelbreite und -höhe am Bildschirm, Höhe einer Felswand
const iso = (x: number, y: number) => ({ x: (x - y) * KW / 2, y: (x + y) * KHOCH / 2 });
const welt = (sx: number, sy: number) => ({ x: sy / KHOCH + sx / KW, y: sy / KHOCH - sx / KW });
const HANDY = window.matchMedia("(pointer: coarse)").matches || P.get("handy") === "1";

interface Bild { modus: number; hoch: number; ganz: boolean; laeuft: boolean; still: number; schlag: boolean; c: Phaser.GameObjects.Container; balken: Phaser.GameObjects.Graphics; name: Phaser.GameObjects.Text; ring: Phaser.GameObjects.Ellipse; kopf: Phaser.GameObjects.Image; von: { x: number; y: number }; nach: { x: number; y: number }; t0: number; lp: number; max: number; held: boolean; team: number; typ: string; tot: boolean }

class Spiel extends Phaser.Scene {
  netz!: Netz; z: Zustand | null = null; bilder = new Map<number, Bild>(); schuesse = new Map<number, Phaser.GameObjects.Arc>(); ichId = 0; zielMarke!: Phaser.GameObjects.Ellipse;
  zeiger = { x: 0, y: 0 }; tasten: Record<string, boolean> = {}; stick: { id: number; x: number; y: number } | null = null; gesendet = { x: 0, y: 0, t: 0 };
  constructor() { super("spiel"); }
  preload() { this.load.image("boden", "../img/echtzeit/boden.webp"); this.load.spritesheet("wand", "../img/echtzeit/wand.webp", { frameWidth: KW, frameHeight: KHOCH + WAND }); this.load.spritesheet("fackel", "../img/echtzeit/fackel.webp", { frameWidth: 26, frameHeight: 78 }); this.load.spritesheet("rune", "../img/echtzeit/rune.webp", { frameWidth: 160, frameHeight: 160 });
    const alle: Record<string, string> = {}; for (const k in HELDEN) alle[k] = HELDEN[k].bild; for (const k in MONSTER) alle[k] = MONSTER[k].bild; for (const k in alle) this.load.image(k, "../" + alle[k]); for (const k in HELDEN) { if (HELDEN[k].figur) this.load.image("figur-" + k, "../" + HELDEN[k].figur); for (const art of ["lauf", "hieb", "schild"] as const) { const pfad = HELDEN[k][art]; if (pfad) this.load.spritesheet(art + "-" + k, "../" + pfad, { frameWidth: 176, frameHeight: 176 }); } } }
  create() {
    this.cameras.main.setBackgroundColor("#07060b"); this.boden(); this.waende();
    for (const k in HELDEN) { if (HELDEN[k].lauf) this.anims.create({ key: "lauf-" + k, frames: this.anims.generateFrameNumbers("lauf-" + k, { start: 0, end: 7 }), frameRate: 11, repeat: -1 });
      if (HELDEN[k].schild) this.anims.create({ key: "schild-" + k, frames: this.anims.generateFrameNumbers("schild-" + k, { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
      if (HELDEN[k].hieb) this.anims.create({ key: "hieb-" + k, frames: this.anims.generateFrameNumbers("hieb-" + k, { start: 0, end: 7 }), frameRate: 20, repeat: 0 }); }
    this.licht(); this.fackeln();
    { const q = iso(SIEGEL.x, SIEGEL.y); this.anims.create({ key: "rune", frames: this.anims.generateFrameNumbers("rune", { start: 0, end: 8 }), frameRate: 9, repeat: -1 }); // die Siegelrune aus dem Würfelspiel, flach auf dem Boden
      const r = this.add.sprite(q.x, q.y, "rune").setDepth(2).setScale(0.62, 0.31).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.9); r.play("rune"); this.tweens.add({ targets: r, alpha: 0.55, duration: 1400, yoyo: true, repeat: -1, ease: "Sine.easeInOut" }); }
    this.zielMarke = this.add.ellipse(0, 0, 54, 27).setStrokeStyle(3, 0xff6a6a, 0.95).setDepth(2).setVisible(false);
    this.groesse(); this.scale.on("resize", () => this.groesse());
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
    wahlZeigen((held, mit) => this.starte(held, mit));
  }
  /** Nach der Heldenwahl: verbinden und loslegen */
  starte(held: string, mit: string[]) {
    verbinde(SERVER, held, mit, (z) => this.zustand(z), (art, grund) => { $("#ez-art").textContent = art === "warte" ? grund : art === "server" ? "Server" + (grund ? " – " + grund : "") : "ohne Server (dein Browser rechnet)" + (SERVER && grund ? " – " + grund : ""); $("#ez-art").className = "ez-kasten " + art; }).then((n) => { this.netz = n; (window as unknown as Record<string, unknown>).EZ = { szene: this, netz: n, zustand: () => this.z };
      $("#ez-hilfe").textContent = HANDY ? "Finger aufs Feld: laufen · Gegner antippen: Ziel – angegriffen wird in Reichweite · ⇄ Waffe wechseln · Q, E, R: Fähigkeiten" : "WASD: laufen · Klick auf einen Gegner: Ziel – angegriffen wird in Reichweite · Leertaste: Waffe wechseln · Q, E, R: Fähigkeiten in Mausrichtung"; });
  }
  groesse() { const k = this.cameras.main, h = this.scale.height; k.setZoom(Phaser.Math.Clamp(h / (HANDY ? 420 : 620), 0.7, 2.2)); }
  /** Der Boden: ein gemaltes Bild aus den Raumkarten des Würfelspiels, mit Schatten und Fackellicht (werkzeug/dekor.py) */
  boden() { this.add.image(-DEKOR.OX, 0, "boden").setOrigin(0, 0).setDepth(0); }
  /** Mauern: je Feld ein gemauerter Block, nach Tiefe sortiert. Hinter einem Raum hoch, davor niedrig – so verdecken sie die Figuren nicht. */
  waende() { const WL = DEKOR.wandlicht as Record<string, number[]>;
    for (let j = -1; j <= KH; j++) for (let i = -1; i <= KB; i++) { if (!fels(i, j)) continue; let rand = false; for (let a = -1; a <= 1 && !rand; a++) for (let b = -1; b <= 1; b++) if (!fels(i + a, j + b)) { rand = true; break; } if (!rand) continue;
      const hoch = !fels(i, j + 1) || !fels(i + 1, j) || !fels(i + 1, j + 1), p = iso(i + 0.5, j + 0.5), art = Math.abs(i * 3 + j * 5) % DEKOR.SPIELARTEN + (hoch ? 0 : DEKOR.SPIELARTEN);
      const w = this.add.image(p.x, p.y, "wand", art).setOrigin(0.5, (KHOCH / 2 + WAND) / (KHOCH + WAND)).setDepth(10 + (i + j + 1) * 10 + 4), l = WL[i + "," + j] || [0.4, 0];
      const h = Math.min(1, 0.25 + l[0] * 0.75), f = (v: number) => Math.max(0, Math.min(255, Math.round(255 * v))); w.setTint(Phaser.Display.Color.GetColor(f(h * (1 + 0.12 * l[1])), f(h), f(h * (1 - 0.28 * l[1])))); } }
  /** Ein weicher Lichtfleck als Textur (für Fackelschein und Glut) */
  licht() { const t = this.textures.createCanvas("schein", 128, 128); if (!t) return; const c = t.getContext(), g = c.createRadialGradient(64, 64, 2, 64, 64, 64); g.addColorStop(0, "rgba(255,190,110,1)"); g.addColorStop(0.35, "rgba(255,140,60,.45)"); g.addColorStop(1, "rgba(255,110,40,0)"); c.fillStyle = g; c.fillRect(0, 0, 128, 128); t.refresh(); }
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
    if (!this.netz) return; let x = sx + sy, y = sy - sx; const l = Math.hypot(x, y), staerke = Math.min(1, Math.hypot(sx, sy)); if (l > 0.01) { x = x / l * staerke; y = y / l * staerke; } else { x = 0; y = 0; }
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
    const ganz = Boolean(held && HELDEN[typ].figur), hoch = ganz ? 84 : 2 * r + 8; let kopf: Phaser.GameObjects.Image, rand: Phaser.GameObjects.Arc;
    if (ganz) { kopf = this.add.sprite(0, 3, "figur-" + typ).setOrigin(0.5, 0.94); kopf.setScale(hoch / kopf.height); rand = this.add.circle(0, 0, 1).setVisible(false); } // ganze Figur: die Füße stehen mitten im Ring am Boden
    else { kopf = this.add.image(0, -r - 8, typ); const mass = Math.min(kopf.width, kopf.height) || 1; kopf.setCrop((kopf.width - mass) / 2, 0, mass, mass).setDisplaySize(r * 2 * kopf.width / mass, r * 2 * kopf.height / mass).setOrigin(0.5, mass / 2 / kopf.height);
      const maske = this.make.graphics({}); maske.fillStyle(0xffffff).fillCircle(0, 0, r); kopf.setMask(maske.createGeometryMask()); (kopf as unknown as { m: Phaser.GameObjects.Graphics }).m = maske;
      rand = this.add.circle(0, -r - 8, r).setStrokeStyle(3, team === 0 ? (id === this.ichId ? 0xffffff : 0x6aa5ff) : MONSTER[typ]?.boss ? 0xffcf6a : 0xff6a6a, 1); }
    const balken = this.add.graphics(), name = this.add.text(0, -hoch - 18, "", { fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#ffffff", stroke: "#000", strokeThickness: 3 }).setOrigin(0.5);
    c.add([schatten, ring, kopf, rand, balken, name]); const b: Bild = { modus: 0, hoch, ganz, laeuft: false, still: 0, schlag: false, c, balken, name, ring, kopf, von: { x: e[4], y: e[5] }, nach: { x: e[4], y: e[5] }, t0: this.time.now, lp: -1, max: 0, held: Boolean(held), team, typ, tot: false };
    this.bilder.set(id, b); return b;
  }
  zustand(z: Zustand) {
    this.z = z; this.ichId = z.ich.id; const da = new Set<number>(), jetzt = this.time.now;
    for (const e of z.w) { da.add(e[0]); let b = this.bilder.get(e[0]); if (!b) b = this.figur(e);
      const hier = this.ort(b, jetzt); b.von = Math.hypot(hier.x - e[4], hier.y - e[5]) > 3 ? { x: e[4], y: e[5] } : hier; b.nach = { x: e[4], y: e[5] }; b.t0 = jetzt; // große Sprünge (Blinzeln, Wiederkehr) nicht nachziehen
      if (b.ganz && HELDEN[b.typ].lauf) { // Laufbilder, solange sich die Figur bewegt; steht sie kurz, wieder das Standbild
        const bewegt = Math.hypot(b.nach.x - b.von.x, b.nach.y - b.von.y) > 0.03 && !e[10]; if (bewegt) b.still = 0; else b.still++; const soll = bewegt || (b.laeuft && b.still < 3), sp = b.kopf as Phaser.GameObjects.Sprite;
        if (soll !== b.laeuft || b.modus !== e[12]) { b.laeuft = soll; b.modus = e[12]; if (!b.schlag) this.haltung(b); } void sp; }
      b.tot = Boolean(e[10]); b.c.setVisible(!b.tot); if (b.ganz) { const sx = Math.cos(e[6]) - Math.sin(e[6]); if (Math.abs(sx) > 0.25) b.kopf.setFlipX(sx < 0); } // die Figur schaut in Laufrichtung (links/rechts am Bildschirm)
      if (b.lp !== e[7] || b.max !== e[8]) { b.lp = e[7]; b.max = e[8]; const r = b.held ? 20 : Math.round((MONSTER[b.typ]?.r || 0.35) * 56), w = r * 2.4, y = -b.hoch - 8; b.balken.clear(); b.balken.fillStyle(0x000000, 0.7).fillRect(-w / 2, y, w, 6); b.balken.fillStyle(b.team === 0 ? 0x5fd08a : 0xff6a6a, 1).fillRect(-w / 2, y, w * Math.max(0, e[7] / e[8]), 6); }
      const bits = e[9], text = (b.held ? HELDEN[b.typ].name : MONSTER[b.typ].name) + (bits & BIT.betaeubt ? " ✦" : "") + (bits & BIT.langsam ? " ❄" : "") + (bits & BIT.dauer ? " ☠" : "") + (bits & BIT.mal ? " ◎" : "") + (e[11] > 0 ? " ⛨" + e[11] : ""); if (b.name.text !== text) b.name.setText(text);
      const stark = bits & (BIT.bollwerk | BIT.schild); b.ring.setStrokeStyle(stark ? 5 : 3, bits & BIT.bollwerk ? 0xffe08a : bits & BIT.schild ? 0xbfd6ff : bits & BIT.mal ? 0xffb347 : e[0] === this.ichId ? 0xffffff : b.team === 0 ? 0x6aa5ff : 0xff6a6a, 0.95); }
    for (const [id, b] of this.bilder) if (!da.has(id)) { const m = (b.kopf as unknown as { m?: Phaser.GameObjects.Graphics }).m; if (m) m.destroy(); b.c.destroy(); this.bilder.delete(id); }
    const sda = new Set<number>(); for (const g of z.g) { sda.add(g[0]); let s = this.schuesse.get(g[0]); const p = iso(g[1], g[2]); if (!s) { s = this.add.circle(p.x, p.y - 24, g[3] === "feuer" ? 10 : g[3] === "erlegen" ? 7 : g[3] === "blitz" ? 5 : 3.5, g[3] === "feuer" ? 0xff8a2a : g[3] === "blitz" ? 0x9ad0ff : 0xe8dcc0); this.schuesse.set(g[0], s); } this.tweens.add({ targets: s, x: p.x, y: p.y - 24, duration: 1000 * ZUSTAND_JE / TICK }); s.setDepth(10 + (g[1] + g[2]) * 10 + 8); }
    for (const [id, s] of this.schuesse) if (!sda.has(id)) { s.destroy(); this.schuesse.delete(id); }
    for (const ev of z.ev) this.ereignis(ev);
    this.anzeige(z);
  }
  /** Das passende Bild für eine ganze Figur: Laufbilder oder Standbild (der Schwerthieb läuft für sich und kehrt danach hierher zurück) */
  haltung(b: Bild) { const sp = b.kopf as Phaser.GameObjects.Sprite, D = HELDEN[b.typ]; sp.setAngle(0).setX(0);
    if (b.modus === 1 && D.schild) { sp.setOrigin(0.5, 0.946).setScale(b.hoch / (0.91 * 176)); if (b.laeuft) sp.play("schild-" + b.typ); else { sp.stop(); sp.setTexture("schild-" + b.typ, 0); } } // zweite Waffe: Schild erhoben, im Stehen das erste Bild
    else if (b.laeuft) { sp.play("lauf-" + b.typ); sp.setOrigin(0.5, 0.946).setScale(b.hoch / (0.91 * 176)); } else { sp.stop(); sp.setTexture("figur-" + b.typ); sp.setOrigin(0.5, 0.94).setScale(b.hoch / sp.height); } }
  ort(b: Bild, jetzt: number) { const k = Math.min(1, (jetzt - b.t0) / (1000 * ZUSTAND_JE / TICK)); return { x: b.von.x + (b.nach.x - b.von.x) * k, y: b.von.y + (b.nach.y - b.von.y) * k }; }
  ereignis(ev: Ereignis) {
    const zahl = (x: number, y: number, t: string, farbe: string, gross = false) => { const p = iso(x, y), o = this.add.text(p.x, p.y - 60, t, { fontFamily: "Inter, sans-serif", fontSize: gross ? "18px" : "15px", fontStyle: "bold", color: farbe, stroke: "#000", strokeThickness: 3 }).setOrigin(0.5).setDepth(99999); this.tweens.add({ targets: o, y: p.y - 100, alpha: 0, duration: gross ? 1400 : 800, onComplete: () => o.destroy() }); };
    const b = "id" in ev ? this.bilder.get(ev.id) : undefined;
    if (ev.a === "schaden" && b) zahl(b.nach.x, b.nach.y, String(ev.n), ev.art === "gift" ? "#9be36a" : ev.art === "blut" ? "#e0605a" : ev.art === "brand" ? "#ffa64d" : ev.art === "licht" ? "#fff2a8" : b.team === 0 ? "#ff8a8a" : "#ffffff");
    else if (ev.a === "null" && b) zahl(b.nach.x, b.nach.y, "0", "#8fa3c8"); // Trefferwurf verloren: die blaue Null
    else if (ev.a === "block" && b) zahl(b.nach.x, b.nach.y, "Block", "#bfd6ff");
    else if (ev.a === "heil" && b) zahl(b.nach.x, b.nach.y, "+" + ev.n, "#8dffb0");
    else if (ev.a === "text" && b) zahl(b.nach.x, b.nach.y, ev.t, "#ffd98a", true);
    else if (ev.a === "aushol" && b) { const o = this.add.ellipse(b.c.x, b.c.y, 70, 35, 0xff3030, 0.18).setStrokeStyle(2, 0xff5050, 0.9).setDepth(3); this.tweens.add({ targets: o, fillAlpha: 0.55, scale: 1.25, duration: ev.t * 1000, onComplete: () => o.destroy() }); if (!this.tweens.isTweening(b.kopf)) this.tweens.add({ targets: b.kopf, y: b.kopf.y - 7, duration: ev.t * 500, yoyo: true }); } // der Gegner holt aus: jetzt weglaufen
    else if (ev.a === "hieb" && b) { if (b.ganz && HELDEN[b.typ].hieb) { const sp = b.kopf as Phaser.GameObjects.Sprite; b.schlag = true; sp.setAngle(0).setX(0).setOrigin(0.5, 0.955).setScale(b.hoch / (0.91 * 176)); sp.play("hieb-" + b.typ); sp.off("animationcomplete"); sp.once("animationcomplete", () => { b.schlag = false; this.haltung(b); }); }
      else if (b.ganz) { if (!this.tweens.isTweening(b.kopf)) this.tweens.add({ targets: b.kopf, x: b.kopf.flipX ? -9 : 9, angle: b.kopf.flipX ? -7 : 7, duration: 80, yoyo: true }); } else if (!this.tweens.isTweening(b.kopf)) this.tweens.add({ targets: b.kopf, scale: b.kopf.scale * 1.18, duration: 70, yoyo: true }); }
    else if (ev.a === "splitter") zahl(ev.x, ev.y, "◈ +" + ev.n, "#ff9aa8");
    else if (ev.a === "knall") { const p = iso(ev.x, ev.y), f = ev.farbe === "eis" ? 0x8fd8ff : ev.farbe === "blitz" ? 0xd9c8ff : ev.farbe === "licht" ? 0xfff2a8 : 0xff8a2a, o = this.add.ellipse(p.x, p.y, ev.r * KW * 1.41, ev.r * KHOCH * 1.41, f, 0.5).setDepth(3); this.tweens.add({ targets: o, alpha: 0, scale: 1.12, duration: 420, onComplete: () => o.destroy() }); if (ev.farbe === "feuer" || ev.farbe === "blitz") this.cameras.main.shake(110, 0.004); }
  }
  anzeige(z: Zustand) {
    const ich = z.w.find((e) => e[0] === z.ich.id); if (!ich) return; const D = HELDEN[ich[2]], W = D.modi[z.ich.modus];
    $("#ez-name").textContent = `${D.name} · ${W.name}`; ($("#ez-lp") as HTMLElement).style.width = Math.round(100 * ich[7] / ich[8]) + "%"; $("#ez-lpzahl").textContent = ich[10] ? `gefallen – zurück in ${Math.ceil(z.ich.wieder)} s` : `${ich[7]} / ${ich[8]}` + (ich[11] > 0 ? ` · Schutz ${ich[11]}` : "");
    const m = Math.floor(z.zeit / 60), sek = Math.floor(z.zeit % 60); $("#ez-stand").textContent = `◈ ${z.splitter} · Knochenwächter ${z.besiegt} / ${z.monster} · ${m}:${String(sek).padStart(2, "0")}`;
    for (const [taste, cd, def] of [["q", z.ich.cdQ, D.q], ["e", z.ich.cdE, D.e], ["r", z.ich.cdR, D.r]] as const) { const el = $(`[data-taste="${taste}"]`); el.classList.toggle("zu", cd > 0); (el.querySelector("i") as HTMLElement).style.height = (cd > 0 ? Math.round(100 * cd / def.zeit) : 0) + "%"; (el.querySelector("b") as HTMLElement).textContent = cd > 0 ? String(Math.ceil(cd)) : taste.toUpperCase(); const k = el.querySelector("small") as HTMLElement; if (k.textContent !== def.name) { k.textContent = def.name; el.title = def.text; } }
    const mo = $("#ez-modus"), mt = `<b>⇄</b><small>${W.name}</small>`; if (mo.dataset.h !== mt) { mo.dataset.h = mt; mo.innerHTML = mt; mo.title = `${W.name}: ${W.text} · Wechseln zu ${D.modi[z.ich.modus ? 0 : 1].name}`; mo.classList.toggle("zwei", z.ich.modus === 1); }
    const ende = $("#ez-ende"); if (z.phase === "sieg") { if (ende.hidden) { ende.hidden = false; $("#ez-ende-text").textContent = `Alle ${z.monster} Knochenwächter sind besiegt. Zeit ${m}:${String(sek).padStart(2, "0")} · ${z.splitter} Erbsplitter`; } } else ende.hidden = true;
  }
  update() {
    const jetzt = this.time.now;
    for (const [id, b] of this.bilder) { const o = this.ort(b, jetzt), p = iso(o.x, o.y); b.c.setPosition(p.x, p.y).setDepth(10 + (o.x + o.y) * 10 + 5); const m = (b.kopf as unknown as { m?: Phaser.GameObjects.Graphics }).m; if (m) m.setPosition(p.x, p.y + b.kopf.y);
      if (id === this.ichId) { const k = this.cameras.main; k.scrollX += (p.x - k.width / 2 - k.scrollX) * 0.15; k.scrollY += (p.y - 30 - k.height / 2 - k.scrollY) * 0.15; } }
    const zb = this.z && this.z.ich.zielId ? this.bilder.get(this.z.ich.zielId) : undefined; if (zb && !zb.tot) { this.zielMarke.setVisible(true).setPosition(zb.c.x, zb.c.y); } else this.zielMarke.setVisible(false);
  }
}

/* ---------- Heldenwahl vor dem Start ---------- */
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
function wahlZeigen(los: (held: string, mit: string[]) => void) {
  const el = $("#ez-wahl"); if (P.get("los") === "1") { el.hidden = true; los(WAHL.held, WAHL.mit); return; }
  const zeichne = () => { const D = HELDEN[WAHL.held], w = (x: { nah: number; fern: number; magie: number }) => `Nahkampf ${x.nah} · Fernkampf ${x.fern} · Magie ${x.magie}`;
    el.innerHTML = `<div class="ez-blatt"><p class="ez-klein">Mythara · Splitterlande · Beta</p><h1>Wähle deinen Helden</h1>
      <div class="ez-helden">${HELDENREIHE.map((k) => `<button type="button" class="ez-held${k === WAHL.held ? " an" : ""}" data-held="${k}"><img src="../${HELDEN[k].bild}" alt=""><b>${esc(HELDEN[k].name)}</b><small>${esc(HELDEN[k].klasse)}</small></button>`).join("")}</div>
      <div class="ez-karte"><h2>${esc(D.name)} – ${esc(D.titel)}</h2><p class="ez-rolle">${esc(D.rolle)} · ${D.lp} Leben · Tempo ${String(D.tempo).replace(".", ",")}</p>
        <p><b>Angriff:</b> ${w(D.angriff)}<br><b>Verteidigung:</b> ${w(D.abwehr)}</p>
        <ul>${D.modi.map((m, i) => `<li><b>${i ? "Zweite" : "Erste"} Waffe – ${esc(m.name)}</b> ${m.schild ? "" : ` (${m.art === "heil" ? "Heilung" : "Schaden"} ${m.schaden[0]}–${m.schaden[1]}, alle ${String(m.takt).replace(".", ",")} s, Reichweite ${String(m.reich).replace(".", ",")})`}: ${esc(m.text)}</li>`).join("")}
          ${(["q", "e", "r"] as const).map((t) => `<li><b>${t.toUpperCase()} – ${esc(D[t].name)}</b> (alle ${D[t].zeit} s): ${esc(D[t].text)}</li>`).join("")}<li>${esc(D.passiv)}</li></ul></div>
      <h3>Begleiter (spielt der Rechner, höchstens zwei)</h3>
      <div class="ez-mit">${HELDENREIHE.filter((k) => k !== WAHL.held).map((k) => `<button type="button" class="${WAHL.mit.includes(k) ? "an" : ""}" data-mit="${k}">${esc(HELDEN[k].name)} <small>${esc(HELDEN[k].klasse)}</small></button>`).join("")}</div>
      <div class="ez-knoepfe"><button type="button" id="ez-los">In den Riss</button><a href="../">← zur Startseite</a></div>
      <p class="ez-klein unten">Zwölf Knochenwächter in fünf Gruppen. Treffer: Angriffswurf gegen Verteidigungswurf, dann Schadenswurf. Alle Werte sind Startwerte.</p></div>`; };
  zeichne(); el.hidden = false;
  el.onclick = (ev) => { const t = ev.target as HTMLElement, h = t.closest<HTMLElement>("[data-held]"), m = t.closest<HTMLElement>("[data-mit]");
    if (h) { WAHL.held = h.dataset.held as string; WAHL.mit = WAHL.mit.filter((x) => x !== WAHL.held); zeichne(); }
    else if (m) { const k = m.dataset.mit as string; if (WAHL.mit.includes(k)) WAHL.mit = WAHL.mit.filter((x) => x !== k); else if (WAHL.mit.length < 2) WAHL.mit.push(k); zeichne(); }
    else if (t.id === "ez-los") { el.hidden = true; los(WAHL.held, WAHL.mit.slice()); } };
}

new Phaser.Game({ type: Phaser.AUTO, parent: "ez-feld", backgroundColor: "#07060b", scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight }, scene: [Spiel], input: { activePointers: 3 }, render: { antialias: true } });
