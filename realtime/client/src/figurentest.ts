/*
 * Isolierte Testszene für modulare 3D-Figuren (echtzeit/figurentest.html). Nicht Teil des Spiels: kein Server, kein Konto, kein Spielstand.
 * Die echte Simulation des Spiels läuft lokal im Browser (Kornspeicher mit Kröten); der Held hat Torvalds Werte, wird aber als
 * modularer Krieger dargestellt. Die Darstellung liest nur den Zustand der Simulation – wie später mit dem Server.
 * Steuerung: WASD laufen · Klick auf Gegner: Ziel · Leertaste: Schild (Block) · Q/E/R: Fähigkeit (Cast) · X: Ausweichen (nur Darstellung)
 */
import Phaser from "phaser";
import { Sim } from "../../shared/sim";
import { MONSTER, TICK, setzeStaerke } from "../../shared/config";
import { setzeKarte } from "../../shared/karte";
import { KARTEN, FEIN } from "../../shared/karten";
import { CharacterAssetLoader, ModularCharacter, fuerSlot } from "./figuren3d";
import type { Slot } from "./figuren3d";

const P = new URLSearchParams(location.search), FIGUR = P.get("figur") || "krieger_test", KARTE = P.get("karte") || "speicher", ZELLE = 96 / FEIN, METER_JE_FELD = 1.0;
const tief = (y: number) => 10 + y * 20; /* wie im Spiel: nach dem Fußpunkt */
setzeKarte(KARTEN[KARTE], FEIN); setzeStaerke(1, 1);
const $ = (s: string) => document.querySelector(s) as HTMLElement;

class Testszene extends Phaser.Scene {
  sim!: Sim; mc!: ModularCharacter; rest = 0; tempo = 0; uhr = 0; tasten: Record<string, boolean> = {};
  gegner = new Map<number, Phaser.GameObjects.Image>(); fps: number[] = [];
  constructor() { super("figurentest"); }
  preload() { this.load.image("karte", "../" + KARTEN[KARTE].bild); for (const k in MONSTER) { const f = MONSTER[k].figur; if (f) this.load.image("m-" + k, "../" + f); } }
  async create() {
    const K = KARTEN[KARTE], B = K.zeilen[0].length * 96, H = K.zeilen.length * 96; this.add.image(0, 0, "karte").setOrigin(0, 0).setDisplaySize(B, H).setDepth(0);
    this.cameras.main.setBounds(0, 0, B, H).setZoom(Math.max(1, Math.min(this.scale.width / B, this.scale.height / H) * 1.6));
    this.sim = new Sim("schildwaechter", 7, []);
    const loader = new CharacterAssetLoader(this, "../img/figuren3d/");
    this.mc = await ModularCharacter.erstellen(this, loader, FIGUR); this.panel(); (window as unknown as Record<string, unknown>).FT = this;
    const taste = (ev: KeyboardEvent, an: boolean) => { const k = ev.key.toLowerCase(); if ("wasd".includes(k) && k.length === 1) { this.tasten[k] = an; const t = this.tasten; this.sim.eingabe({ t: "richtung", x: (t.d ? 1 : 0) - (t.a ? 1 : 0), y: (t.s ? 1 : 0) - (t.w ? 1 : 0) }); }
      else if (an && k === " ") { ev.preventDefault(); this.sim.eingabe({ t: "modus" }); } else if (an && "qer".includes(k) && k.length === 1) { const ich = this.sim.ich; this.sim.eingabe({ t: "faehig", taste: k as "q", x: ich.x + Math.cos(ich.blick), y: ich.y + Math.sin(ich.blick) }); this.mc.animator.ausloesen("cast"); }
      else if (an && k === "x") this.mc.animator.ausloesen("dodge"); };
    window.addEventListener("keydown", (e) => { if (!e.repeat) taste(e, true); }); window.addEventListener("keyup", (e) => taste(e, false));
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => { const w = this.cameras.main.getWorldPoint(p.x, p.y), x = w.x / ZELLE, y = w.y / ZELLE; let best = 0, bd = 2.5;
      for (const m of this.sim.wesen) if (!m.held && !m.tot && m.team !== 0) { const d = Math.hypot(m.x - x, m.y - y); if (d < bd) { bd = d; best = m.id; } } this.sim.eingabe({ t: "ziel", id: best }); });
  }
  update(_t: number, dms: number) {
    if (!this.mc) return; const jetzt = performance.now(), dt = Math.min(0.1, this.uhr ? (jetzt - this.uhr) / 1000 : dms / 1000); this.uhr = jetzt; /* echte Uhr: Phasers Frame-Zeit ist geglättet */ this.fps.push(1 / Math.max(dt, 1e-3)); if (this.fps.length > 60) this.fps.shift();
    this.rest += dt; let ev: { a: string; id?: number }[] = [];
    const ich = this.sim.ich;
    while (this.rest >= 1 / TICK) { this.rest -= 1 / TICK; const x0 = ich.x, y0 = ich.y; this.sim.schritt(); ev = ev.concat(this.sim.zustand().ev as { a: string; id?: number }[]);
      /* Tempo aus der Bewegung je Simulationsschritt (später: aus zwei aufeinanderfolgenden Serverzuständen) */ const v = Math.hypot(ich.x - x0, ich.y - y0) * TICK * METER_JE_FELD; this.tempo = v > this.tempo ? v : this.tempo * 0.5 + v * 0.5; }
    for (const e of ev) { if (e.id !== ich.id) continue; if (e.a === "hieb") this.mc.animator.ausloesen("attack"); else if (e.a === "schaden" || e.a === "block") this.mc.animator.ausloesen("hit"); }
    this.mc.aktualisieren(dt, { blick: ich.blick, tempo: this.tempo, tot: ich.tot, block: ich.modus === 1 });
    this.mc.setzen(ich.x * ZELLE, ich.y * ZELLE, tief(ich.y) + 5);
    const k = this.cameras.main; k.scrollX += (ich.x * ZELLE - k.width / 2 - k.scrollX) * 0.12; k.scrollY += (ich.y * ZELLE - k.height / 2 - k.scrollY) * 0.12;
    for (const m of this.sim.wesen) { if (m.held) continue; let b = this.gegner.get(m.id); const D = MONSTER[m.typ];
      if (!b) { b = this.add.image(0, 0, D && D.figur ? "m-" + m.typ : "__WHITE").setOrigin(...(D && D.fuss ? D.fuss : [0.5, 0.95])); b.setScale((D && D.hoehe ? D.hoehe : 60) / b.height); this.gegner.set(m.id, b); }
      b.setPosition(m.x * ZELLE, m.y * ZELLE).setDepth(tief(m.y) + 5).setVisible(!m.tot).setFlipX(Math.cos(m.blick) < 0); }
    const A = this.mc.animator; $("#stand").textContent = `${A.anim} · ${A.richtung} · Frame ${A.frame + 1} · Tempo ${this.tempo.toFixed(1)} m/s · LP ${Math.round(ich.lp)}/${ich.max} · ${Math.round(this.fps.reduce((a, b) => a + b, 0) / this.fps.length)} fps · ${this.mc.container.length} Ebenen`;
  }
  /** Ausrüstung wechseln (nur lokal – der Server ist hier nicht beteiligt) */
  panel() {
    const el = $("#slots"), mc = this.mc; el.innerHTML = "";
    for (const slot of Object.keys(mc.figur.slots) as Slot[]) { const ws = fuerSlot(mc.katalog, slot); if (!ws.length) continue;
      const s = document.createElement("select"); s.innerHTML = `<option value="">— ${slot} leer —</option>` + ws.map((g) => `<option value="${g.id}">${g.name.replace(" (TEST ASSET)", "")}</option>`).join(""); s.value = mc.ausruestung[slot] || "";
      s.onchange = async () => { const p = await mc.anlegen(slot, s.value || null); $("#meldung").textContent = p.length ? "✗ " + p.join("; ") : "✓ " + slot + " gewechselt"; this.panel(); }; el.appendChild(s); }
  }
}
new Phaser.Game({ type: Phaser.AUTO, parent: "feld", backgroundColor: "#0b0a10", scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight }, scene: [Testszene] });
