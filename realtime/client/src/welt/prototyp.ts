/*
 * Gebäude-Prototyp: eine isolierte Testszene, in der drei Bauweisen nebeneinanderstehen –
 * das bisherige frontale Haus, das neue räumliche Haus (Schrägsicht mit Seitenwand, in Ebenen zerlegt) und dasselbe Haus in klassischer Isometrie.
 * Gleiche Kamera, gleicher Maßstab und gleiche Figur wie in der offenen Welt (48 px je Rechenfeld, Held 84 px).
 * Gebaut und zusammengestellt von werkzeug/welt/prototyp.mjs; ändert nichts am Spiel.
 */
import Phaser from "phaser";
import { HELDEN } from "../../../shared/config";
import { WeltRaster } from "../../../shared/welt/raster";

const $ = (s: string) => document.querySelector(s) as HTMLElement | null;
const F = 48, C = 32, HELD_PX = 84, RADIUS = 0.3, HANDY = window.matchMedia("(pointer: coarse)").matches;

interface HausDaten { groesse: number[]; ecke: number[]; teile: Record<string, string>; tiefe: Record<string, number>; modell: { W: number; D: number; ue: number; tuer: { x: number; b: number; h: number } };
  iso: { bild: string; groesse: number[]; fuss: number[]; ecken: number[][] } }

/* Lage der drei Häuser (Rechenfelder) */
const ALT = { x: 7, y: 17.5 };                 // Fußpunkt des bisherigen Hauses (Mitte der Vorderwand)
const NEU = { x: 13, y: 18 };                  // vordere linke Ecke des neuen Hauses am Boden
const ISO = { x: 26, y: 15.5 };                // Mitte des isometrischen Hauses im Grundriss
const BAEUME = [["wald_baum1", 3, 6.2], ["wald_baum3", 11, 5.6], ["wald_baum2", 21, 6.4], ["wald_baum1", 30, 6.0], ["wald_baum5", 19.6, 9.4], ["wald_baum6", 2, 26.5], ["wald_baum3", 30.5, 27]] as const;
const BAUM_ANKER: Record<string, number[]> = { wald_baum1: [0.5549, 0.9335], wald_baum2: [0.4475, 0.9428], wald_baum3: [0.438, 0.9596], wald_baum5: [0.5949, 0.9907], wald_baum6: [0.5536, 0.9875] };

export class Prototyp extends Phaser.Scene {
  H!: HausDaten; raster = new WeltRaster(); ort = { x: 15.5, y: 22.5 }; rx = 0; ry = 0; pfad: { x: number; y: number }[] = []; tasten: Record<string, boolean> = {}; laeuft = false;
  figur!: Phaser.GameObjects.Sprite; silhouette!: Phaser.GameObjects.Sprite; ring!: Phaser.GameObjects.Ellipse; held = "schildwaechter";
  teil: Record<string, Phaser.GameObjects.Image> = {}; alt!: Phaser.GameObjects.Image; iso!: Phaser.GameObjects.Image; baeume: Phaser.GameObjects.Image[] = [];
  pruef!: Phaser.GameObjects.Container; pruefAn = false; dachZwang: "auto" | "aus" = "auto"; stick: { id: number; x: number; y: number; t: number; weit: number } | null = null;
  geh: string[][] = [];
  constructor() { super("prototyp"); }

  preload() {
    const D = HELDEN[this.held]; this.load.image("figur", "img/echtzeit/torvald.webp"); this.load.spritesheet("lauf", "img/echtzeit/torvald-lauf.webp", { frameWidth: 176, frameHeight: 176 });
    this.load.image("boden", "proto/boden.webp"); this.load.image("alt", "img/welt/gebaeude/dorf_haus_holz_01.webp"); this.load.json("haus", "proto/haus/haus3d.json");
    for (const b of new Set(BAEUME.map((x) => x[0]))) this.load.image(b, `img/welt/${b.replace("wald_", "")}.webp`);
    this.load.once("filecomplete-json-haus", () => { const h = this.cache.json.get("haus") as HausDaten; for (const [k, v] of Object.entries(h.teile)) this.load.image("teil-" + k, "proto/haus/" + v); this.load.image("iso", "proto/haus/" + h.iso.bild); });
  }

  /** Gehraster: ein Chunk 32 × 32; Häuser versperren ihre Felder */
  rasterBauen() {
    const g = this.geh = Array.from({ length: C }, () => Array.from({ length: C }, () => "."));
    const sperre = (i: number, j: number) => { if (i >= 0 && j >= 0 && i < C && j < C) g[j][i] = "#"; };
    /* bisher: Rechteck aus der Bibliothek (5 × 2 Felder hinter der Vorderwand) */
    for (let j = Math.floor(ALT.y - 2); j < ALT.y; j++) for (let i = Math.floor(ALT.x - 2.5); i < ALT.x + 2.5; i++) sperre(i, j);
    /* neu: nur die Wände – innen kann man laufen; in der Vorderwand bleibt die Tür offen */
    const { W, D, tuer } = this.H.modell, x0 = NEU.x, y0 = NEU.y - D, tx = Math.floor(NEU.x + tuer.x);
    for (let i = x0; i < x0 + W; i++) { sperre(i, y0); if (i !== tx) sperre(i, NEU.y - 1); }
    for (let j = y0; j < NEU.y; j++) { sperre(x0, j); sperre(x0 + W - 1, j); }
    /* iso: der gedrehte Grundriss als Vieleck, so wie er im Weltraster (Draufsicht) liegt */
    const e = this.H.iso.ecken.map(([u, v]) => [ISO.x + u, ISO.y - v]);
    const drin = (x: number, y: number) => { let d = false; for (let a = 0, b = e.length - 1; a < e.length; b = a++) if ((e[a][1] > y) !== (e[b][1] > y) && x < (e[b][0] - e[a][0]) * (y - e[a][1]) / (e[b][1] - e[a][1]) + e[a][0]) d = !d; return d; };
    for (let j = 0; j < C; j++) for (let i = 0; i < C; i++) if (drin(i + 0.5, j + 0.5)) sperre(i, j);
    for (const [, x, y] of BAEUME) sperre(Math.floor(x), Math.floor(y));
    this.raster = new WeltRaster(); this.raster.dazu({ cx: 0, cy: 0, geh: g.map((z) => z.join("")) });
  }

  create() {
    this.H = this.cache.json.get("haus") as HausDaten; const H = this.H, M = H.modell;
    this.cameras.main.setBackgroundColor("#0b0e09").setBounds(0, 0, C * F, C * F);
    this.add.image(0, 0, "boden").setOrigin(0, 0).setDepth(-1e6);
    this.rasterBauen();
    /* bisheriges Haus */
    this.alt = this.add.image(ALT.x * F, ALT.y * F, "alt").setOrigin(0.5, 0.8846).setDepth(ALT.y * F);
    /* neues Haus: alle Ebenen im selben Rahmen, die vordere linke Ecke auf NEU */
    const lx = NEU.x * F - H.ecke[0], ly = NEU.y * F - H.ecke[1];
    for (const k of Object.keys(H.teile)) this.teil[k] = this.add.image(lx, ly, "teil-" + k).setOrigin(0, 0).setDepth((NEU.y + H.tiefe[k]) * F);
    this.teil.tuer_offen.setVisible(false);
    /* isometrisches Haus: ein Bild, sortiert nach seiner vordersten Ecke */
    const sw = H.iso.ecken[0], isoFuss = { x: ISO.x + sw[0], y: ISO.y - sw[1] };
    this.iso = this.add.image(isoFuss.x * F, isoFuss.y * F, "iso").setOrigin(H.iso.fuss[0] / H.iso.groesse[0], H.iso.fuss[1] / H.iso.groesse[1]).setDepth(isoFuss.y * F);
    for (const [b, x, y] of BAEUME) this.baeume.push(this.add.image(x * F, y * F, b).setOrigin(BAUM_ANKER[b][0], BAUM_ANKER[b][1]).setDepth(y * F));
    /* Schilder */
    const schild = (x: number, y: number, t: string) => this.add.text(x * F, y * F, t, { fontFamily: "Cinzel, Georgia, serif", fontSize: "17px", color: "#fff1c8", backgroundColor: "rgba(20,14,8,.78)", padding: { x: 8, y: 4 } }).setOrigin(0.5, 0).setDepth(1e7);
    schild(ALT.x, 22.4, "Bisher: frontal"); schild(NEU.x + M.W / 2, 22.4, "Neu: räumlich"); schild(ISO.x, 22.4, "Klassisch isometrisch");
    /* Held */
    this.ring = this.add.ellipse(0, 0, 46, 23).setStrokeStyle(3, 0xffffff, 0.95);
    const D = HELDEN[this.held], fu = D.fuss || [0.5, 0.94]; this.figur = this.add.sprite(0, 0, "figur").setOrigin(fu[0], fu[1]); this.figur.setScale(HELD_PX * (D.gross || 1) / this.figur.height);
    this.anims.create({ key: "lauf", frames: this.anims.generateFrameNumbers("lauf", {}), frameRate: 11, repeat: -1 });
    /* Silhouette: zeigt den Helden in Gold, wenn ein Gebäude ihn verdeckt (statt das Gebäude durchsichtig zu machen) */
    this.silhouette = this.add.sprite(0, 0, "figur").setTintFill(0xf3d895).setAlpha(0.5).setDepth(1e7 - 1).setVisible(false);
    this.pruefAnzeige();
    this.steuerung();
    this.groesse(); this.scale.on("resize", () => this.groesse()); this.cameras.main.centerOn(this.ort.x * F, this.ort.y * F - 100);
    (window as unknown as Record<string, unknown>).EZP = { szene: this, ort: () => this.ort, stelle: (x: number, y: number) => { this.ort.x = x; this.ort.y = y; this.pfad = []; }, gehe: (x: number, y: number) => this.gehe(x, y), raster: this.raster };
  }

  groesse() { const k = this.cameras.main, h = this.scale.height, w = this.scale.width; k.setZoom(Phaser.Math.Clamp(Math.min(h / (HANDY ? 520 : 760), w / 900), 0.5, 2)); }

  /** Prüfansicht: Kollisionsfelder, Grundrisse, Türpunkte, Tiefenlinien */
  pruefAnzeige() {
    const g = this.add.graphics(), M = this.H.modell;
    for (let j = 0; j < C; j++) for (let i = 0; i < C; i++) if (this.geh[j][i] === "#") g.fillStyle(0xff3030, 0.3).fillRect(i * F, j * F, F, F);
    g.lineStyle(1, 0xffffff, 0.12); for (let i = 0; i <= C; i++) { g.lineBetween(i * F, 0, i * F, C * F); g.lineBetween(0, i * F, C * F, i * F); }
    g.lineStyle(3, 0x60e0ff, 0.95).strokeRect(NEU.x * F, (NEU.y - M.D) * F, M.W * F, M.D * F);
    g.lineStyle(3, 0x60e0ff, 0.95).strokeRect((ALT.x - 2.5) * F, (ALT.y - 2) * F, 5 * F, 2 * F);
    const e = this.H.iso.ecken.map(([u, v]) => new Phaser.Math.Vector2((ISO.x + u) * F, (ISO.y - v) * F)); g.lineStyle(3, 0x60e0ff, 0.95).strokePoints(e, true);
    /* Tiefenlinien: Ab dieser Linie steht der Held vor dem Bauteil */
    const linie = (y: number, x0: number, x1: number, farbe: number) => { g.lineStyle(2, farbe, 0.95); for (let x = x0; x < x1; x += 16) g.lineBetween(x * 1, y, Math.min(x + 9, x1), y); };
    linie((NEU.y + M.ue) * F, (NEU.x - 0.5) * F, (NEU.x + M.W + 1.5) * F, 0xffd060); linie(NEU.y * F, (NEU.x - 0.5) * F, (NEU.x + M.W + 1.5) * F, 0xff9040); linie((NEU.y - M.D) * F, (NEU.x - 0.5) * F, (NEU.x + M.W + 1.5) * F, 0xb070ff);
    g.fillStyle(0x60ffb0, 1).fillCircle((NEU.x + M.tuer.x) * F, (NEU.y + 0.35) * F, 6);
    const t = this.add.text(NEU.x * F + M.W * F + 40, (NEU.y - M.D) * F - 40, "Tiefe: violett Rückwand/Seite · orange Vorderwand · gelb Dach", { fontFamily: "monospace", fontSize: "13px", color: "#fff", backgroundColor: "rgba(0,0,0,.7)", padding: { x: 4, y: 2 } });
    this.pruef = this.add.container(0, 0, [g, t]).setDepth(2e7).setVisible(false);
  }
  pruefen(an = !this.pruefAn) { this.pruefAn = an; this.pruef.setVisible(an); const k = $("#pp-pruef"); if (k) k.setAttribute("aria-pressed", String(an)); }

  steuerung() {
    const taste = (ev: KeyboardEvent, an: boolean) => { const k = ev.key.toLowerCase(); if (!["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) return; ev.preventDefault(); this.tasten[k] = an; const t = this.tasten;
      this.rx = (t.d || t.arrowright ? 1 : 0) - (t.a || t.arrowleft ? 1 : 0); this.ry = (t.s || t.arrowdown ? 1 : 0) - (t.w || t.arrowup ? 1 : 0); };
    window.addEventListener("keydown", (ev) => { if (!ev.repeat) taste(ev, true); if (ev.key === "k" || ev.key === "K") this.pruefen(); });
    window.addEventListener("keyup", (ev) => taste(ev, false)); window.addEventListener("blur", () => { this.tasten = {}; this.rx = 0; this.ry = 0; });
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => { if (!this.stick) this.stick = { id: p.id, x: p.x, y: p.y, t: performance.now(), weit: 0 }; });
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => { const st = this.stick; if (!st || p.id !== st.id || !p.isDown) return; const dx = p.x - st.x, dy = p.y - st.y, l = Math.hypot(dx, dy); st.weit = Math.max(st.weit, l); if (!p.wasTouch) return; if (l < 8) { this.rx = 0; this.ry = 0; } else { const k = Math.min(1, l / 46); this.rx = dx / l * k; this.ry = dy / l * k; } });
    this.input.on("pointerup", (p: Phaser.Input.Pointer) => { const st = this.stick; if (!st || p.id !== st.id) return; if (st.weit < 12 && performance.now() - st.t < 450) { const w = this.cameras.main.getWorldPoint(p.x, p.y); this.gehe(w.x / F, w.y / F); } this.stick = null; if (p.wasTouch) { this.rx = 0; this.ry = 0; } });
    const pk = $("#pp-pruef"); if (pk) pk.onclick = () => this.pruefen();
    const dk = $("#pp-dach"); if (dk) dk.onclick = () => { this.dachZwang = this.dachZwang === "auto" ? "aus" : "auto"; dk.setAttribute("aria-pressed", String(this.dachZwang === "aus")); };
  }
  gehe(x: number, y: number) { this.pfad = this.raster.weg(this.ort, { x, y }, RADIUS); }

  /** Weich auf eine Deckkraft zugehen */
  blende(o: Phaser.GameObjects.Image, soll: number) { if (Math.abs(o.alpha - soll) > 0.01) o.setAlpha(o.alpha + (soll - o.alpha) * 0.22); else o.setAlpha(soll); }
  /** Verdeckt dieses Bild den Helden? Es muss vor ihm einsortiert sein und an Brust oder Kopf des Helden wirklich etwas zeigen (Deckkraft des Bildpunkts). */
  hinter(o: Phaser.GameObjects.Image, px: number, py: number) {
    if (!o.visible || o.depth <= py) return false;
    const l = o.x - o.originX * o.displayWidth, t = o.y - o.originY * o.displayHeight;
    return [22, 46, 70].some((h) => { const x = (px - l) / o.scaleX, y = (py - h - t) / o.scaleY; if (x < 0 || y < 0 || x >= o.width || y >= o.height) return false;
      return (this.textures.getPixelAlpha(Math.floor(x), Math.floor(y), o.texture.key) ?? 0) > 60; });
  }

  update(_t: number, dt: number) {
    const d = Math.min(0.05, dt / 1000), o = this.ort, D = HELDEN[this.held]; let rx = this.rx, ry = this.ry;
    if (Math.hypot(rx, ry) > 0.05) this.pfad = []; else if (this.pfad.length) { const z = this.pfad[0], dx = z.x - o.x, dy = z.y - o.y, l = Math.hypot(dx, dy); if (l < 0.12) this.pfad.shift(); else { rx = dx / l; ry = dy / l; } }
    const l = Math.hypot(rx, ry), faehrt = l > 0.05;
    if (faehrt) { const k = Math.min(1, l) / l, e = { x: o.x + rx * k * D.tempo * d, y: o.y + ry * k * D.tempo * d, r: RADIUS }; this.raster.schieben(e); o.x = e.x; o.y = e.y; if (Math.abs(rx) > 0.35) this.figur.setFlipX(rx < 0); }
    if (faehrt !== this.laeuft) { this.laeuft = faehrt; if (faehrt) { const L = D.laufMass || [0.5, 0.946, 0.91]; this.figur.play("lauf"); this.figur.setOrigin(L[0], L[1]).setScale(HELD_PX / (L[2] * 176)); } else { const fu = D.fuss || [0.5, 0.94]; this.figur.stop(); this.figur.setTexture("figur"); this.figur.setOrigin(fu[0], fu[1]).setScale(HELD_PX * (D.gross || 1) / this.figur.height); } }
    const px = o.x * F, py = o.y * F; this.figur.setPosition(px, py + 2).setDepth(py); this.ring.setPosition(px, py).setDepth(py - 0.01);

    /* Neues Haus: drinnen Dach weg und Vorderwand fast durchsichtig; nahe der Tür steht sie offen */
    const M = this.H.modell, T = this.teil, drinnen = o.x > NEU.x && o.x < NEU.x + M.W && o.y > NEU.y - M.D && o.y < NEU.y;
    this.blende(T.dach, this.dachZwang === "aus" || drinnen ? 0 : 1);
    for (const k of ["vorn", "fenster", "tuer_zu", "tuer_offen"]) this.blende(T[k], drinnen ? 0.28 : 1);
    const offen = Math.hypot(o.x - (NEU.x + M.tuer.x), o.y - NEU.y) < 1.7; T.tuer_offen.setVisible(offen); T.tuer_zu.setVisible(!offen);
    /* Gebäude verdecken den Helden ganz; dann zeigt die Silhouette, wo er steht. Bäume werden wie in der Welt durchscheinend. */
    const gebaeude = [this.alt, this.iso, ...(drinnen ? [] : [T.dach, T.seite, T.vorn])], verdeckt = gebaeude.some((g) => g.alpha > 0.5 && this.hinter(g, px, py));
    this.silhouette.setVisible(verdeckt); if (verdeckt) this.silhouette.setTexture(this.figur.texture.key, this.figur.frame.name).setOrigin(this.figur.originX, this.figur.originY).setScale(this.figur.scaleX, this.figur.scaleY).setFlipX(this.figur.flipX).setPosition(this.figur.x, this.figur.y);
    for (const b of this.baeume) this.blende(b, this.hinter(b, px, py) ? 0.4 : 1);
    (window as unknown as Record<string, unknown>).EZP_ZUSTAND = { drinnen, verdeckt, dach: T.dach.alpha, vorn: T.vorn.alpha, tuer: offen ? "offen" : "zu", tiefe: { held: py, innen: T.innen.depth, seite: T.seite.depth, vorn: T.vorn.depth, dach: T.dach.depth, alt: this.alt.depth, iso: this.iso.depth } };
    const k = this.cameras.main; k.scrollX += (px - k.width / 2 - k.scrollX) * 0.15; k.scrollY += (py - 30 - k.height / 2 - k.scrollY) * 0.15;
    const a = $("#pp-ort"); if (a) a.textContent = `${o.x.toFixed(1)} | ${o.y.toFixed(1)}${drinnen ? " · im Haus" : ""}`;
  }
}

new Phaser.Game({ type: Phaser.AUTO, parent: "pp-feld", backgroundColor: "#0b0e09", scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight }, scene: [Prototyp], input: { activePointers: 3 }, render: { antialias: true } });
