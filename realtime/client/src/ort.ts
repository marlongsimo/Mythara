/*
 * Ein begehbarer Ort der Kampagne. Der Boden ist ein gerechnetes Bild (werkzeug/gelaende.py), dazu ein Raster, wo man laufen kann.
 * Bisher nur der Boden von Weidenhain: Gebäude, Leute und Eingänge kommen dazu.
 * Aufruf zum Ausprobieren: ?ort=weidenhain
 */
import Phaser from "phaser";
import { HELDEN } from "../../shared/config";
import { team } from "./weltkarte";
import { plaudern, Zeile, Frage } from "./kampagne";
import WEIDENHAIN from "./weidenhain.json";
import BAUKASTEN from "./baukasten.json";

const $ = (s: string) => document.querySelector(s) as HTMLElement, P = new URLSearchParams(location.search);
const HANDY = window.matchMedia("(pointer: coarse)").matches || P.get("handy") === "1";
/* bild: ein gemaltes Ortsbild (werkzeug/ortbild.py), mass: so stark wird es vergrößert, vorn: was den Helden verdeckt. Ohne bild: gerechneter Boden aus dem Baukasten (werkzeug/gelaende.py). */
interface OrtDaten { name: string; bild?: string; mass?: number; gross?: number; breit: number; hoch: number; zelle: number; zeilen: string[]; zaeune: unknown[]; leute?: (string | number)[][]; gruppen?: number[][]; vorn?: unknown[]; stellen: Record<string, number[]> }
const ORTE: Record<string, OrtDaten> = { weidenhain: { ...WEIDENHAIN, name: "Weidenhain" }, baukasten: { ...BAUKASTEN, name: "Baukasten-Probe" } };
export const ortName = ORTE[P.get("ort") || ""] ? (P.get("ort") as string) : "";
/* Das Zaunstück: im Bild 918 × 688, linker Pfosten unten bei (130, 655), rechter Pfosten 664 weiter rechts und 203 höher. Gespiegelt läuft es nach rechts hinunter. */
const ZAUN = { breit: 170, fx: 130 / 918, fy: 655 / 688, dx: 664 * 170 / 918, dy: 203 * 170 / 918 };
/* Leute zum Ansprechen. feld: Feldgröße im Bildblatt, koerper: Anteil des Feldes, den die Figur hoch ist, fuss: wo die Füße im Feld stehen. */
const LEUTE: Record<string, { name: string; feld: number; koerper: number; fuss: number; knopf: string; zeilen: Zeile[]; fragen: Frage[]; schluss: string }> = {
  hanne: { name: "Hanne Kalk", feld: 240, koerper: 0.845, fuss: 0.967, knopf: "Mit Hanne sprechen", schluss: "Ich sehe mir den Speicher an",
    zeilen: [{ wer: "Hanne Kalk, Bürgermeisterin", text: "Du da. Du siehst aus, als könntest du kämpfen. Kannst du?" }, { wer: "Hanne Kalk", text: "Im Kornspeicher sitzen Kröten. So groß wie Hunde. Sie fressen uns das Korn weg, mitten im Erntefest." }],
    fragen: [
      { knopf: "Woher kommen die Kröten?", zeilen: [{ wer: "Hanne Kalk", text: "Aus dem Mühlgraben. Seit drei Tagen. Wenn das Korn weg ist, wird der Winter lang." }, { wer: "Hanne Kalk", text: "Früher haben sie das nie getan. Früher hatten sie Angst vor uns." }] },
      { knopf: "Was springt für mich dabei heraus?", zeilen: [{ wer: "Hanne Kalk", text: "Ein Krug Bier, ein Bett und der Dank von Weidenhain. Mehr haben wir nicht. Aber das bekommst du ganz." }] },
    ] },
};
/* Die Runde Dorfleute (werkzeug/blatt.py, Feld 300): wo die fünf Köpfe im Feld sitzen, und was sie so reden – belangloses Festgeplauder. */
const KOEPFE = [[0.16, 0.23], [0.47, 0.15], [0.8, 0.17], [0.35, 0.43], [0.67, 0.41]];
const GEREDE = ["Das Bier ist dieses Jahr dünner.", "Hast du Almas Kuchen probiert?", "Morgen soll es regnen.", "Mein Rücken, sag ich dir …", "Die Fiedel ist verstimmt.", "Früher war mehr Erntefest.", "Noch ein Krug?", "Das sagst du jedes Jahr.", "Ich hab's doch gleich gesagt.", "Und dann ist das Rad gebrochen!",
  "Pst, nicht so laut.", "Na, wenn du meinst.", "Der Winter kommt früh, wetten?", "Mein Vetter aus Graufurt sagt …", "Ha! Das glaubst du doch selbst nicht.", "Hm.", "Die Rüben waren nie so groß.", "Wer tanzt nachher?", "So ein Unsinn.", "Wem gehört eigentlich der Karren?", "Drei Kupfer für ein Brot!", "Erzähl das bloß nicht weiter."];
const TEMPO = 190, GROSS = (ORTE[ortName] && ORTE[ortName].gross) || 112, Q = 0.62; // Bildpunkte je Sekunde, Größe des Helden, nach oben und unten läuft man langsamer (der Boden liegt schräg)

export class Ort extends Phaser.Scene {
  d = ORTE[ortName]; held = "schildwaechter"; ort = { x: 0, y: 0 }; rx = 0; ry = 0; figur!: Phaser.GameObjects.Sprite; ring!: Phaser.GameObjects.Ellipse; laeuft = false; tasten: Record<string, boolean> = {};
  stick: { id: number; x: number; y: number; t: number; weit: number } | null = null; pfad: number[][] = []; marke!: Phaser.GameObjects.Ellipse;
  constructor() { super("ort"); }
  zu = new Set<number>(); /* Felder, die ein Zaun versperrt */
  feld(x: number, y: number) { return Math.floor(x / this.d.zelle) + 4096 * Math.floor(y / this.d.zelle); }
  frei(x: number, y: number) { const D = this.d, z = D.zeilen[Math.floor(y / D.zelle)]; return Boolean(z) && z[Math.floor(x / D.zelle)] === "." && !this.zu.has(this.feld(x, y)); }
  /** Zäune aufstellen: Stück für Stück vom Anfang aus; jedes Stück verdeckt, was dahinter steht, und versperrt den Weg. */
  zaeune() { const k = ZAUN.breit / 918;
    for (const [x0, y0, folge] of this.d.zaeune as [number, number, string][]) { let x = x0, y = y0;
      for (const c of folge) { const hoch = c === "h", x1 = x + ZAUN.dx, y1 = y + (hoch ? -ZAUN.dy : ZAUN.dy);
        if (hoch) this.add.image(x, y, "zaun").setOrigin(ZAUN.fx, ZAUN.fy).setScale(k).setDepth((y + y1) / 2); else this.add.image(x1, y1, "zaun").setOrigin(1 - ZAUN.fx, ZAUN.fy).setScale(k).setFlipX(true).setDepth((y + y1) / 2);
        for (let t = 0; t <= 1.001; t += 0.04) { const px = x + (x1 - x) * t, py = y + (y1 - y) * t; this.zu.add(this.feld(px, py)); this.zu.add(this.feld(px, py - 12)); }
        x = x1; y = y1; } } }
  init() { const t = team(); let h = t ? t.held : ""; try { h = h || localStorage.getItem("ez_held") || ""; } catch { /* privat */ } this.held = HELDEN[h] ? h : "schildwaechter"; const s = this.d.stellen.start; this.ort = { x: s[0], y: s[1] }; }
  preload() { this.load.image("ortboden", `../img/echtzeit/${this.d.bild || ortName + "-boden"}.webp`); this.load.image("zaun", "../img/echtzeit/zaun.webp"); for (const l of this.d.leute || []) { const L = LEUTE[String(l[0])]; if (L) this.load.spritesheet("leute-" + l[0], `../img/echtzeit/${l[0]}.webp`, { frameWidth: L.feld, frameHeight: L.feld }); }
    if (this.d.gruppen && this.d.gruppen.length) this.load.spritesheet("dorfgruppe", "../img/echtzeit/dorfgruppe.webp", { frameWidth: 300, frameHeight: 300 }); const D = HELDEN[this.held]; if (D.figur) this.load.image("figur-" + this.held, "../" + D.figur); if (D.lauf) this.load.spritesheet("lauf-" + this.held, "../" + D.lauf, { frameWidth: 176, frameHeight: 176 }); this.load.image(this.held, "../" + D.bild); }
  create() {
    const D0 = this.d; document.body.classList.add("dorf"); $("#ez-dorf-titel").textContent = D0.name; $("#ez-dorf-hilfe").textContent = HANDY ? "Finger ziehen: laufen · tippen: dorthin gehen" : "WASD oder Pfeiltasten: laufen · Klick: dorthin gehen";
    const F = D0.mass || 1; this.add.image(0, 0, "ortboden").setOrigin(0, 0).setDisplaySize(D0.breit, D0.hoch).setDepth(-10); this.vorn(F); this.feuer(); this.cameras.main.setBounds(0, 0, D0.breit, D0.hoch).setBackgroundColor("#0a0d08");
    this.zaeune(); this.gruppen(); this.leute();
    $("#ez-dorf-knopf").onclick = () => this.sprechen(); window.addEventListener("keydown", (ev) => { if ((ev.key === "e" || ev.key === "E") && !ev.repeat) this.sprechen(); });
    this.marke = this.add.ellipse(0, 0, 34, 17).setStrokeStyle(2, 0xffe9a8, 0.9).setDepth(-1).setVisible(false);
    const D = HELDEN[this.held]; this.ring = this.add.ellipse(0, 0, 58, 29).setStrokeStyle(3, 0xffffff, 0.95);
    if (D.figur) { const fu = D.fuss || [0.5, 0.94]; this.figur = this.add.sprite(0, 0, "figur-" + this.held).setOrigin(fu[0], fu[1]); this.figur.setScale(GROSS * (D.gross || 1) / this.figur.height); if (D.lauf && !this.anims.exists("lauf-" + this.held)) this.anims.create({ key: "lauf-" + this.held, frames: this.anims.generateFrameNumbers("lauf-" + this.held, {}), frameRate: 11, repeat: -1 }); }
    else { this.figur = this.add.sprite(0, 0, this.held).setOrigin(0.5, 1); this.figur.setScale(60 / this.figur.height); }
    const taste = (ev: KeyboardEvent, an: boolean) => { const k = ev.key.toLowerCase(); if (this.gesperrt && an) return; if (!["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) return; ev.preventDefault(); this.tasten[k] = an; const t = this.tasten; this.rx = (t.d || t.arrowright ? 1 : 0) - (t.a || t.arrowleft ? 1 : 0); this.ry = (t.s || t.arrowdown ? 1 : 0) - (t.w || t.arrowup ? 1 : 0); };
    window.addEventListener("keydown", (ev) => { if (!ev.repeat) taste(ev, true); }); window.addEventListener("keyup", (ev) => taste(ev, false)); window.addEventListener("blur", () => { this.tasten = {}; this.rx = 0; this.ry = 0; });
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => { if (this.stick) return; this.stick = { id: p.id, x: p.x, y: p.y, t: performance.now(), weit: 0 }; if (p.wasTouch) { const el = $("#ez-stick"); el.hidden = false; el.style.left = p.x + "px"; el.style.top = p.y + "px"; ($("#ez-stick i") as HTMLElement).style.transform = "translate(-50%, -50%)"; } });
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => { const st = this.stick; if (!st || p.id !== st.id || !p.isDown) return; const dx = p.x - st.x, dy = p.y - st.y, l = Math.hypot(dx, dy), m = 46; st.weit = Math.max(st.weit, l); if (!p.wasTouch) return; /* mit der Maus wird nur geklickt */
      ($("#ez-stick i") as HTMLElement).style.transform = `translate(calc(-50% + ${dx / Math.max(l, 1) * Math.min(l, m)}px), calc(-50% + ${dy / Math.max(l, 1) * Math.min(l, m)}px))`; if (l < 8) { this.rx = 0; this.ry = 0; } else { const k = Math.min(1, l / m); this.rx = dx / l * k; this.ry = dy / l * k; } });
    this.input.on("pointerup", (p: Phaser.Input.Pointer) => { const st = this.stick; if (!st || p.id !== st.id) return; if (st.weit < 12 && performance.now() - st.t < 450) { const w = this.cameras.main.getWorldPoint(p.x, p.y); this.gehe(w.x, w.y); } this.stick = null; $("#ez-stick").hidden = true; if (p.wasTouch) { this.rx = 0; this.ry = 0; } });
    this.groesse(); this.scale.on("resize", () => this.groesse()); this.cameras.main.centerOn(this.ort.x, this.ort.y);
    (window as unknown as Record<string, unknown>).EZO = { szene: this, ort: () => this.ort, frei: (x: number, y: number) => this.frei(x, y) };
  }
  groesse() { const k = this.cameras.main, w = this.scale.width, h = this.scale.height, D = this.d; k.setZoom(Math.max(w / D.breit, h / D.hoch, Phaser.Math.Clamp(HANDY ? Math.min(h / 520, w / 720) : Math.min(h / 760, w / 1000), 0.45, 2.2))); }
  nah = ""; gesperrt = false; personen: { id: string; x: number; y: number }[] = [];
  /** Leute zum Ansprechen aufstellen: Sie stehen und regen sich leicht; über ihnen steht ihr Name. */
  leute() { for (const l of this.d.leute || []) { const id = String(l[0]), x = Number(l[1]), y = Number(l[2]), L = LEUTE[id]; if (!L) continue;
      if (!this.anims.exists("leute-" + id)) this.anims.create({ key: "leute-" + id, frames: this.anims.generateFrameNumbers("leute-" + id, {}), frameRate: 2.5, repeat: -1, yoyo: true });
      const m = GROSS / (L.koerper * L.feld); this.add.sprite(x, y + 3, "leute-" + id).setOrigin(0.5, L.fuss).setScale(m).setDepth(y).play("leute-" + id);
      this.add.text(x, y - GROSS - 12, L.name, { fontFamily: "Cinzel, Georgia, serif", fontSize: "14px", color: "#ffe9a8", stroke: "#000", strokeThickness: 4 }).setOrigin(0.5, 1).setResolution(2).setDepth(99980);
      this.personen.push({ id, x, y }); } }
  /** Wer in der Nähe steht, lässt sich ansprechen (Knopf, Taste E). Solange geredet wird, steht der Held. */
  sprechen() { const L = LEUTE[this.nah]; if (!L || this.gesperrt) return; this.gesperrt = true; this.rx = 0; this.ry = 0; this.tasten = {}; this.pfad = []; this.marke.setVisible(false); $("#ez-dorf-knopf").hidden = true;
    void plaudern(L.name, L.zeilen, L.fragen, L.schluss).then(() => { this.gesperrt = false; this.nah = ""; }); }
  /** Dorfleute, die beisammenstehen: Sie gestikulieren, und alle paar Sekunden sagt einer von ihnen etwas Belangloses in einer Sprechblase. */
  gruppen() { const M = GROSS / 123 * 1.0; /* im Feld ist eine Person etwa 123 Bildpunkte hoch */
    for (const [x, y] of this.d.gruppen || []) { if (!this.anims.exists("dorfgruppe")) this.anims.create({ key: "dorfgruppe", frames: this.anims.generateFrameNumbers("dorfgruppe", {}), frameRate: 2.2, repeat: -1, yoyo: true });
      const g = this.add.sprite(x, y, "dorfgruppe").setOrigin(0.5, 0.965).setScale(M).setDepth(y - 30); g.play("dorfgruppe"); let zuletzt = -1, satz = -1;
      const reden = () => { if (!this.scene.isActive()) return; let wer = Math.floor(Math.random() * KOEPFE.length); if (wer === zuletzt) wer = (wer + 1) % KOEPFE.length; zuletzt = wer; let n = Math.floor(Math.random() * GEREDE.length); if (n === satz) n = (n + 1) % GEREDE.length; satz = n;
        const kx = x + (KOEPFE[wer][0] - 0.5) * 300 * M, ky = y + (KOEPFE[wer][1] - 0.965) * 300 * M - 10;
        const t = this.add.text(0, 0, GEREDE[n], { fontFamily: "Inter, sans-serif", fontSize: "15px", color: "#2a1c06", align: "center", wordWrap: { width: 190 } }).setOrigin(0.5, 1).setResolution(2), b = t.getBounds(), bw = b.width + 20, bh = b.height + 12;
        const blase = this.add.graphics(); blase.fillStyle(0xfff6dc, 0.96).lineStyle(2, 0x5b3d0c, 0.9); blase.fillRoundedRect(-bw / 2, -bh - 10, bw, bh, 9).strokeRoundedRect(-bw / 2, -bh - 10, bw, bh, 9); blase.fillTriangle(-7, -11, 7, -11, 0, 0); t.setPosition(0, -16);
        const c = this.add.container(kx, ky, [blase, t]).setDepth(99990).setAlpha(0); this.tweens.add({ targets: c, alpha: 1, y: ky - 4, duration: 220 }); this.tweens.add({ targets: c, alpha: 0, duration: 350, delay: 2600 + GEREDE[n].length * 35, onComplete: () => c.destroy() });
        this.time.delayedCall(4200 + Math.random() * 4500, reden); };
      this.time.delayedCall(1200 + Math.random() * 1500, reden); } }
  /** Was vor dem Helden steht: Jedes Vieleck wird aus dem Bild ausgeschnitten und liegt auf der Höhe seiner Fußlinie – wer dahinter läuft, wird verdeckt. */
  vorn(F: number) { const quelle = this.textures.get("ortboden").getSourceImage() as HTMLImageElement, k = quelle.width / (this.d.breit / F); /* k: Bildpunkte des Bildes je Maßeinheit der Angaben */
    (this.d.vorn as [number[][], number][] || []).forEach(([p, fuss], n) => { const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]), x0 = Math.min(...xs), y0 = Math.min(...ys), w = Math.max(...xs) - x0, h = Math.max(...ys) - y0, t = this.textures.createCanvas("vorn" + n, Math.ceil(w * k), Math.ceil(h * k)); if (!t) return;
      const c = t.getContext(); c.beginPath(); p.forEach((q, i) => (i ? c.lineTo((q[0] - x0) * k, (q[1] - y0) * k) : c.moveTo((q[0] - x0) * k, (q[1] - y0) * k))); c.closePath(); c.clip(); c.drawImage(quelle, -x0 * k, -y0 * k); t.refresh();
      this.add.image(x0 * F, y0 * F, "vorn" + n).setOrigin(0, 0).setScale(F / k).setDepth(fuss * F); }); }
  /** Das Festfeuer lebt: ein flackernder Schein und aufsteigende Funken */
  feuer() { const s = this.d.stellen.feuer; if (!s) return; const t = this.textures.createCanvas("glut", 128, 128); if (!t) return; const c = t.getContext(), g = c.createRadialGradient(64, 64, 2, 64, 64, 64); g.addColorStop(0, "rgba(255,200,120,1)"); g.addColorStop(0.4, "rgba(255,140,60,.4)"); g.addColorStop(1, "rgba(255,110,40,0)"); c.fillStyle = g; c.fillRect(0, 0, 128, 128); t.refresh();
    const schein = this.add.image(s[0], s[1] - 40, "glut").setBlendMode(Phaser.BlendModes.ADD).setScale(5.5, 3.6).setAlpha(0.3).setDepth(99999); /* über allem: der Schein fällt auch auf Figuren und Bänke */ this.time.addEvent({ delay: 90, loop: true, callback: () => { schein.setAlpha(0.22 + Math.random() * 0.16).setScale(5.3 + Math.random() * 0.5, 3.5 + Math.random() * 0.3); } });
    this.time.addEvent({ delay: 130, loop: true, callback: () => { const f = this.add.image(s[0] + (Math.random() - 0.5) * 50, s[1] - 60 - Math.random() * 40, "glut").setBlendMode(Phaser.BlendModes.ADD).setScale(0.05 + Math.random() * 0.05).setDepth(s[1] + 1); this.tweens.add({ targets: f, y: f.y - 110 - Math.random() * 90, x: f.x + (Math.random() - 0.5) * 60, alpha: 0, duration: 1300 + Math.random() * 900, onComplete: () => f.destroy() }); } }); }
  /** Weg zu einer Stelle suchen (Breitensuche über das Raster); ist sie nicht begehbar, endet der Weg am nächsten begehbaren Feld. */
  gehe(x: number, y: number) {
    const D = this.d, Z = D.zelle, B = D.zeilen[0].length, H = D.zeilen.length, zelle = (px: number, py: number) => Math.max(0, Math.min(B - 1, Math.floor(px / Z))) + B * Math.max(0, Math.min(H - 1, Math.floor(py / Z)));
    const mitte = (i: number) => [(i % B + 0.5) * Z, (Math.floor(i / B) + 0.5) * Z], gut = (i: number) => D.zeilen[Math.floor(i / B)][i % B] === "." && !this.zu.has(i % B + 4096 * Math.floor(i / B));
    const start = zelle(this.ort.x, this.ort.y), von = new Int32Array(B * H).fill(-1), reihe = [start]; von[start] = start; let best = start, bestA = 1e9;
    for (let n = 0; n < reihe.length; n++) { const i = reihe[n], [mx, my] = mitte(i), a = Math.hypot(mx - x, (my - y) / Q); if (a < bestA) { bestA = a; best = i; } if (a < Z * 0.75) break;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const cx = i % B + dx, cy = Math.floor(i / B) + dy; if (cx < 0 || cy < 0 || cx >= B || cy >= H) continue; const j = cx + B * cy; if (von[j] >= 0 || !gut(j)) continue; if (dx && dy && (!gut(cx + B * Math.floor(i / B)) || !gut(i % B + B * cy))) continue; von[j] = i; reihe.push(j); } }
    const weg: number[][] = []; for (let i = best; i !== start; i = von[i]) weg.unshift(mitte(i)); if (weg.length && this.frei(x, y) && bestA < Z) weg.push([x, y]);
    /* glätten: Zwischenpunkte weglassen, solange die gerade Strecke frei ist */
    const frei2 = (a: number[], b: number[]) => { const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 8); for (let k = 1; k < n; k++) if (!this.frei(a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n)) return false; return true; };
    const glatt: number[][] = []; let hier = [this.ort.x, this.ort.y], k = 0; while (k < weg.length) { let m = k; for (let n = weg.length - 1; n > k; n--) if (frei2(hier, weg[n])) { m = n; break; } glatt.push(weg[m]); hier = weg[m]; k = m + 1; }
    this.pfad = glatt; const z = glatt[glatt.length - 1]; if (z) this.marke.setPosition(z[0], z[1]).setVisible(true); else this.marke.setVisible(false);
  }
  update(_t: number, dt: number) {
    const d = Math.min(0.05, dt / 1000), o = this.ort; let rx = this.gesperrt ? 0 : this.rx, ry = this.gesperrt ? 0 : this.ry;
    if (!this.gesperrt) { let nah = ""; for (const q of this.personen) if (Math.hypot(o.x - q.x, (o.y - q.y) / Q) < 120) nah = q.id; if (nah !== this.nah) { this.nah = nah; const kn = $("#ez-dorf-knopf"); kn.classList.remove("bald"); kn.hidden = !nah; if (nah) kn.textContent = LEUTE[nah].knopf + (HANDY ? "" : "  [E]"); } }
    if (Math.hypot(rx, ry) > 0.05) { this.pfad = []; this.marke.setVisible(false); }
    else if (this.pfad.length) { const z = this.pfad[0], dx = z[0] - o.x, dy = z[1] - o.y; if (Math.hypot(dx, dy) < 5) { this.pfad.shift(); if (!this.pfad.length) this.marke.setVisible(false); } else { const qy = dy / Q, q = Math.hypot(dx, qy); rx = dx / q; ry = qy / q; } }
    const l = Math.hypot(rx, ry), faehrt = l > 0.05;
    if (faehrt) { const k = Math.min(1, l) / l, sx = rx * k * TEMPO * d, sy = ry * k * TEMPO * Q * d;
      if (this.frei(o.x + sx, o.y + sy)) { o.x += sx; o.y += sy; } else if (this.frei(o.x + sx, o.y)) o.x += sx; else if (this.frei(o.x, o.y + sy)) o.y += sy; /* an Kanten entlanggleiten */
      if (Math.abs(rx) > 0.35) this.figur.setFlipX(rx < 0); }
    const D = HELDEN[this.held]; if (faehrt !== this.laeuft && D.figur && D.lauf) { this.laeuft = faehrt; if (faehrt) { const L = D.laufMass || [0.5, 0.946, 0.91]; this.figur.play("lauf-" + this.held); this.figur.setOrigin(L[0], L[1]).setScale(GROSS / (L[2] * 176)); } else { const fu = D.fuss || [0.5, 0.94]; this.figur.stop(); this.figur.setTexture("figur-" + this.held); this.figur.setOrigin(fu[0], fu[1]).setScale(GROSS * (D.gross || 1) / this.figur.height); } }
    this.figur.setPosition(o.x, o.y + 3).setDepth(o.y); this.ring.setPosition(o.x, o.y).setDepth(o.y - 0.01);
    const k = this.cameras.main; k.scrollX += (o.x - k.width / 2 - k.scrollX) * 0.12; k.scrollY += (o.y - 40 - k.height / 2 - k.scrollY) * 0.12;
  }
}
