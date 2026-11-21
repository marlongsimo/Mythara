/*
 * Kampf in der offenen Welt – ohne eigene Kampfszene.
 *
 * Betritt der Held ein Kampfgebiet (shared/karten.ts → WELTZONEN, z. B. den Kreuzwald), verbindet sich dieser Baustein mit der gemeinsamen
 * Simulation des Gebiets auf dem Spielserver (dieselbe wie bei den Kampfzonen: gemeinsame Gegner, Rückkehr nach 60 s, EP nach Schadensanteil,
 * Gutschrift auf dem Server). Die Welt läuft unverändert weiter: Boden, Bäume, Häuser, Wegfindung. Nur das Bewegen übernimmt der Server –
 * die Welt schickt die Laufrichtung, der Server meldet, wo der Held steht. Gegner und andere Helden des Gebiets erscheinen als Figuren
 * an derselben Stelle, mit Namen, Stufe und Leben; Treffer zeigen Zahlen. Unten rechts: Angriff und Fähigkeiten 1–4.
 * Ohne Konto oder ohne Server rechnet der Browser dieselbe Simulation selbst (allein, ohne Gutschrift).
 * Koordinaten: Simulation in Rechenfeldern ab der linken oberen Ecke des Gebiets; Welt in Weltfeldern (Rechenfeld + Ursprung), Bild = Feld × FELD_PX.
 */
import Phaser from "phaser";
import { HELDEN, MONSTER, setzeStaerke, HELDENSTUFE, HELDENEP, stufeAusEp, EP_BIS, STUFE_MAX } from "../../../shared/config";
import { KARTEN, FEIN, WELTZONEN, ORTSTUFE } from "../../../shared/karten";
import { setzeKarte } from "../../../shared/karte";
import { verbinde, Netz, SPIELSERVER } from "../netz";
import type { Zustand, Taste, Ereignis } from "../../../shared/sim";
import { BIT } from "../../../shared/sim";
import { heldenFigur, richten } from "../modulfigur";
import { kontoToken } from "../konto";
import { epAlle } from "../halle";
import { SYMBOL, symbolBild } from "../symbole";
import { FELD_PX, HELD_PX } from "../../../shared/welt/typen";

const $ = (s: string) => document.querySelector(s) as HTMLElement;
const P = new URLSearchParams(location.search);
/** Gebiet der offenen Welt (Gebietsname für Server und Stufe): der Kreuzwald */
const GEBIET: Record<string, string> = { kreuzwald: "kreuzwald" };
/** Die Szene der offenen Welt, soweit der Kampf sie braucht */
export interface WeltSzene extends Phaser.Scene { ort: { x: number; y: number }; held: string; figur: Phaser.GameObjects.Sprite; gesperrt: boolean; halt(): void }
interface Figur { typ: string; held: boolean; team: number; sp: Phaser.GameObjects.Sprite; nm: Phaser.GameObjects.Text; lb: Phaser.GameObjects.Graphics; x: number; y: number; zx: number; zy: number; laeuft: boolean; tot: boolean; lp: number; max: number; bits: number; schild: boolean }

/** Die Kampfsteuerung mit den Bildern und Namen des Helden füllen – auch außerhalb eines Kampfgebiets (dort gedimmt) */
export function tastenFuellen(held: string, modus = 0): void { const D = HELDEN[held]; if (!D) return; const sym = SYMBOL[held] || {};
  for (const t of ["q", "e", "r"] as const) { const el = document.querySelector(`[data-taste="${t}"]`) as HTMLElement | null; if (!el) continue; const def = D[t]; (el.querySelector("small") as HTMLElement).textContent = def.name; el.title = `${def.name}: ${def.text}`; (el.querySelector("img") as HTMLImageElement).src = symbolBild(sym[t] || "sterne"); }
  const an = document.querySelector('[data-taste="a"] img') as HTMLImageElement | null; if (an) an.src = symbolBild((sym.modi || [])[modus] || "hieb");
  const mo = document.getElementById("ez-modus"); if (mo && !mo.innerHTML) mo.innerHTML = `<img alt="" src="${symbolBild((sym.modi || [])[modus] || "hieb")}"><b>⇄</b>`; }
export class WeltKampf {
  netz: Netz | null = null; karteZeit = 0; schildWar = false; z: Zustand | null = null; ichId = 0; bereit = false; vorbei = false; totGemeldet = false; art = "";
  figuren = new Map<number, Figur>(); namen = new Map<number, { name: string; stufe: number }>();
  private gesendet = { x: 0, y: 0, t: 0 }; private hoerer: ((ev: Event) => void)[] = []; private ringZiel!: Phaser.GameObjects.Ellipse; private ichLb!: Phaser.GameObjects.Graphics;
  readonly zone: { karte: string; x0: number; y0: number; b: number; h: number }; readonly stufe: number;

  constructor(readonly s: WeltSzene, readonly region: string, wx: number, wy: number, private gefallen: () => void) {
    this.zone = WELTZONEN[region]; const gebiet = GEBIET[this.zone.karte] || this.zone.karte; this.stufe = ORTSTUFE[gebiet] || 1;
    const K = KARTEN[this.zone.karte], lx = wx - this.zone.x0, ly = wy - this.zone.y0;
    /* für das Rechnen im Browser (ohne Server): die Karte des Gebiets, hinein an der eigenen Stelle, Stärke des Gebiets */
    K.start = [[lx / FEIN - 0.5, ly / FEIN - 0.5]]; setzeKarte(K, FEIN); setzeStaerke(this.stufe, 1);
    for (const k of Object.keys(HELDENSTUFE)) delete HELDENSTUFE[k]; for (const k of Object.keys(HELDENEP)) delete HELDENEP[k];
    for (const [h, v] of Object.entries(epAlle())) { HELDENEP[h] = Number(v) || 0; HELDENSTUFE[h] = stufeAusEp(HELDENEP[h]); }
    this.ringZiel = s.add.ellipse(0, 0, 54, 27).setStrokeStyle(3, 0xff6a6a, 0.95).setVisible(false); this.ichLb = s.add.graphics().setDepth(1e7);
    document.body.classList.add("weltkampf"); this.tastenAn(); void this.verbinden(lx, ly, gebiet);
  }
  private async verbinden(lx: number, ly: number, gebiet: string) {
    const basis = P.has("server") ? P.get("server") || "" : SPIELSERVER, token = basis ? await kontoToken() : ""; if (this.vorbei) return;
    const url = basis && token ? `${basis}?kampf=${encodeURIComponent(this.zone.karte)}&ort=${encodeURIComponent(gebiet)}&lx=${lx.toFixed(2)}&ly=${ly.toFixed(2)}` : "";
    const hoer = (ev: Event) => { const m = (ev as CustomEvent).detail as { t: string; liste?: { id: number; name: string; stufe: number }[]; ep?: Record<string, number>; seelen?: number };
      if (m.t === "namen" && m.liste) { this.namen.clear(); for (const n of m.liste) this.namen.set(n.id, n); }
      if ((m.t === "gebucht" || m.t === "gutschrift") && m.ep) try { localStorage.setItem("ez_ep", JSON.stringify(m.ep)); localStorage.setItem("ez_seelen", String(m.seelen || 0)); } catch { /* privat */ } };
    window.addEventListener("ez-server", hoer); this.hoerer.push(hoer);
    const n = await verbinde(url, this.s.held, [], (z) => this.zustand(z), (art) => { this.art = art; }, url ? { t: "anmeldung", token } : undefined);
    if (this.vorbei) { n.ende(); return; } this.netz = n;
  }
  /** Gebiet verlassen: gutschreiben lassen (der Server bucht beim Trennen), Figuren weg */
  ende() { if (this.vorbei) return; this.vorbei = true; if (this.netz) { try { this.netz.sende({ t: "halt" }); } catch { /* zu */ } this.netz.ende(); }
    for (const f of this.figuren.values()) { f.sp.destroy(); f.nm.destroy(); f.lb.destroy(); } this.figuren.clear(); this.ringZiel.destroy(); this.ichLb.destroy();
    for (const h of this.hoerer) window.removeEventListener("ez-server", h); document.body.classList.remove("weltkampf"); document.querySelectorAll("#ez-karte u[data-k]").forEach((u) => u.remove()); }
  /** Gilt hier Mehrkampf (viele gegen viele)? Sonst Einzelkampf */
  mehrkampf(wx: number, wy: number): boolean { const K = KARTEN[this.zone.karte], x = wx - this.zone.x0, y = wy - this.zone.y0; return (K.mehrkampf || []).some(([x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1); }

  /* ---------- Zustand vom Server (oder aus dem Browser) ---------- */
  private zustand(z: Zustand) { if (this.vorbei) return; this.z = z; this.ichId = z.ich.id; const da = new Set<number>();
    for (const e of z.w) { const [id, held, typ, team, x, y, , lp, max, , tot] = e; da.add(id); if (id === this.ichId) continue; let f = this.figuren.get(id);
      if (!f) f = this.neu(id, Boolean(held), typ, team, x, y); f.zx = x; f.zy = y; f.lp = lp; f.max = max; f.bits = e[9];
      if (Boolean(tot) !== f.tot) { f.tot = Boolean(tot); f.sp.setVisible(!f.tot); f.nm.setVisible(!f.tot); if (!f.tot) { f.x = x; f.y = y; } } }
    for (const id of [...this.figuren.keys()]) if (!da.has(id)) { const f = this.figuren.get(id)!; f.sp.destroy(); f.nm.destroy(); f.lb.destroy(); this.figuren.delete(id); }
    for (const ev of z.ev) this.ereignis(ev);
    const ich = z.w.find((e) => e[0] === this.ichId); if (ich) { if (!this.bereit) { this.bereit = true; this.s.ort.x = this.zone.x0 + ich[4]; this.s.ort.y = this.zone.y0 + ich[5]; }
      if (ich[10] && !this.totGemeldet) { this.totGemeldet = true; this.s.halt(); this.s.gesperrt = true; const t = $("#ez-dorf-hilfe"); t.textContent = "Du bist gefallen – deine Gefährten tragen dich zurück in die Waldmark …"; t.style.display = ""; setTimeout(() => this.gefallen(), 1800); } }
    this.hud(z); }
  private neu(id: number, held: boolean, typ: string, team: number, x: number, y: number): Figur { const s = this.s, D = held ? HELDEN[typ] : MONSTER[typ], hoch = held ? HELD_PX : HELD_PX * ((D && (D as { hoehe?: number }).hoehe) || 88) / 96;
    const fu = (D && (D as { fuss?: number[] }).fuss) || [0.5, 0.94], sp = heldenFigur(s, x * FELD_PX, y * FELD_PX, typ, hoch).setOrigin(fu[0], fu[1]); sp.setScale(hoch * ((D as { gross?: number }).gross || 1) / sp.height);
    const nm = s.add.text(0, 0, "", { fontFamily: "Cinzel, Georgia, serif", fontSize: "14px", color: team === 0 ? "#f3e3b5" : "#ffc9b0", stroke: "#000", strokeThickness: 4 }).setOrigin(0.5, 1).setResolution(2).setDepth(1e7);
    const f: Figur = { typ, held, team, sp, nm, lb: s.add.graphics().setDepth(1e7), x, y, zx: x, zy: y, laeuft: false, tot: false, lp: 1, max: 1, bits: 0, schild: false }; this.figuren.set(id, f); return f; }
  private ereignis(ev: Ereignis) { const s = this.s, wo = (id: number) => { if (id === this.ichId) return { x: s.figur.x, y: s.figur.y - HELD_PX }; const f = this.figuren.get(id); return f ? { x: f.sp.x, y: f.sp.y - HELD_PX } : null; };
    const zahl = (id: number, t: string, farbe: string) => { const p = wo(id); if (!p) return; const o = s.add.text(p.x, p.y, t, { fontFamily: "Inter, sans-serif", fontSize: "17px", fontStyle: "bold", color: farbe, stroke: "#000", strokeThickness: 4 }).setOrigin(0.5).setDepth(1e7 + 1);
      s.tweens.add({ targets: o, y: p.y - 34, alpha: 0, duration: 900, onComplete: () => o.destroy() }); };
    if (ev.a === "schaden") zahl(ev.id, String(ev.n), ev.id === this.ichId ? "#ff6a5a" : "#ffe08a");
    else if (ev.a === "heil") zahl(ev.id, "+" + ev.n, "#7dff9a");
    else if (ev.a === "null") zahl(ev.id, "verfehlt", "#c8c8c8");
    else if (ev.a === "block") zahl(ev.id, "geblockt", "#9cc8ff");
    else if (ev.a === "ep" && (ev.id === undefined || ev.id === this.ichId)) zahl(this.ichId, `+${ev.n} EP`, "#8fd0ff");
    else if (ev.a === "stufe" && ev.id === this.ichId) zahl(this.ichId, `Stufe ${ev.s}!`, "#ffd75e");
    else if (ev.a === "text") zahl(ev.id, ev.t, "#ffd98a");
    else if (ev.a === "hieb") { const sp = ev.id === this.ichId ? s.figur : this.figuren.get(ev.id)?.sp; if (sp && "richte" in sp) sp.play("hieb-x"); } }

  /* ---------- jedes Bild ---------- */
  /** Bewegung: die Welt hat aus Tasten, Stick oder Wegfindung eine Richtung (rx, ry); sie geht an den Server, die Stelle kommt von dort */
  steuern(rx: number, ry: number) { if (!this.netz) return; const l = Math.hypot(rx, ry), k = l > 1 ? 1 / l : 1, x = l < 0.05 ? 0 : rx * k, y = l < 0.05 ? 0 : ry * k, j = performance.now(), g = this.gesendet;
    if ((x === g.x && y === g.y) || (j - g.t < 60 && Math.hypot(x - g.x, y - g.y) < 0.4 && (x !== 0 || y !== 0))) return; this.gesendet = { x, y, t: j }; this.netz.sende({ t: "richtung", x, y }); }
  schritt(dt: number) { if (!this.z) return; const s = this.s, k = Math.min(1, dt * 12), ich = this.z.w.find((e) => e[0] === this.ichId);
    /* der eigene Held mit erhobenem Schild (Torvald, Waffe „Schild“): Block im Stehen, Gang mit Schild – sonst wie die Welt es will */
    { const sp = s.figur as unknown as { play(k: string): void; setTexture(k: string): void }, laeuft = (s as unknown as { laeuft: boolean }).laeuft, schild = Boolean(ich && !ich[10] && (ich[9] & BIT.schild));
      if ("richte" in sp) { if (schild) { if (laeuft) sp.play("schild-x"); else sp.setTexture("schildstand-x"); } else if (this.schildWar) { if (laeuft) sp.play("lauf-x"); else sp.setTexture("figur-x"); } } this.schildWar = schild; }
    if (ich && this.bereit && !ich[10]) { const zx = this.zone.x0 + ich[4], zy = this.zone.y0 + ich[5]; s.ort.x += (zx - s.ort.x) * k; s.ort.y += (zy - s.ort.y) * k; if (Math.hypot(zx - s.ort.x, zy - s.ort.y) > 3) { s.ort.x = zx; s.ort.y = zy; } }
    for (const f of this.figuren.values()) { if (f.tot) { f.lb.clear(); continue; } const vx = f.zx - f.x, vy = f.zy - f.y, lauf = Math.hypot(vx, vy) > 0.03; f.x += vx * k; f.y += vy * k;
      const px = (this.zone.x0 + f.x) * FELD_PX, py = (this.zone.y0 + f.y) * FELD_PX; f.sp.setPosition(px, py + 2).setDepth(py);
      if (lauf) { richten(f.sp, vx, vy); if (Math.abs(vx) > 0.02) f.sp.setFlipX(vx < 0); }
      const schild = Boolean(f.bits & BIT.schild); if (lauf !== f.laeuft || schild !== f.schild) { f.laeuft = lauf; f.schild = schild; this.haltung(f, lauf); }
      const id = [...this.figuren.entries()].find(([, g]) => g === f)?.[0] || 0, n = f.held ? this.namen.get(id) : undefined;
      const t = f.held ? (n ? `${n.name} · St. ${n.stufe}` : HELDEN[f.typ]?.name || "") : `${MONSTER[f.typ]?.name || f.typ} · St. ${this.stufe}`; if (f.nm.text !== t) f.nm.setText(t);
      const h = f.held ? HELD_PX : HELD_PX * ((MONSTER[f.typ] as { hoehe?: number })?.hoehe || 88) / 96; f.nm.setPosition(px, py - h - 12); this.balken(f.lb, px, py - h - 10, f.lp / f.max, f.team !== 0); }
    /* Minimap: Gegner rot, andere Helden blau – live, alle 200 ms */
    if (performance.now() - this.karteZeit > 200) { this.karteZeit = performance.now(); const k = document.getElementById("ez-karte");
      if (k) for (const [id, f] of this.figuren) { let u = k.querySelector(`u[data-k="${id}"]`) as HTMLElement | null; if (!u) { u = document.createElement("u"); u.dataset.k = String(id); k.appendChild(u); }
        u.className = (f.team === 0 ? "freund" : "feind") + (f.tot ? " tot" : ""); u.style.left = (100 * f.x / this.zone.b) + "%"; u.style.top = (100 * f.y / this.zone.h) + "%"; }
      if (k) for (const u of Array.from(k.querySelectorAll<HTMLElement>("u[data-k]"))) if (!this.figuren.has(Number(u.dataset.k))) u.remove(); }
    /* eigenes Leben über dem Kopf und das gewählte Ziel */
    if (ich) this.balken(this.ichLb, s.figur.x, s.figur.y - HELD_PX - 8, ich[7] / ich[8], false); const zf = this.figuren.get(this.z.ich.zielId);
    if (zf && !zf.tot) this.ringZiel.setVisible(true).setPosition(zf.sp.x, zf.sp.y - 2).setDepth(zf.sp.depth - 0.01); else this.ringZiel.setVisible(false); }
  /** Laufen oder Stehen: modulare Figuren wissen selbst wie; Standbilder bekommen ihr Laufblatt (wie bei den Mitspielern) */
  private haltung(f: Figur, lauf: boolean) { const s = this.s, sp = f.sp;
    if ("richte" in sp) { if (f.schild) { if (lauf) sp.play("schild-x"); else sp.setTexture("schildstand-x"); } else if (lauf) sp.play("lauf-x"); else sp.setTexture("figur-x"); return; } /* Schild erhoben: Block im Stehen, Gang mit Schild */
    const D = (f.held ? HELDEN[f.typ] : MONSTER[f.typ]) as { lauf?: string; laufMass?: number[]; fuss?: number[]; gross?: number } | undefined, h = f.held ? HELD_PX : HELD_PX * ((MONSTER[f.typ] as { hoehe?: number })?.hoehe || 88) / 96;
    if (!D) return; const lk = "lauf-" + f.typ;
    if (lauf && D.lauf && s.textures.exists(lk)) { if (!s.anims.exists(lk)) s.anims.create({ key: lk, frames: s.anims.generateFrameNumbers(lk, {}), frameRate: 11, repeat: -1 }); const L = D.laufMass || [0.5, 0.946, 0.91]; sp.play(lk); sp.setOrigin(L[0], L[1]).setScale(h / (L[2] * 176)); }
    else if (s.textures.exists("figur-" + f.typ)) { const fu = D.fuss || [0.5, 0.94]; sp.stop(); sp.setTexture("figur-" + f.typ); sp.setOrigin(fu[0], fu[1]).setScale(h * (D.gross || 1) / sp.height); } }
  private balken(g: Phaser.GameObjects.Graphics, x: number, y: number, a: number, feind: boolean) { const w = 54; a = Math.max(0, Math.min(1, a)); g.clear().fillStyle(0x000000, 0.7).fillRect(x - w / 2 - 1, y, w + 2, 7).fillStyle(feind ? 0xd04a3a : a > 0.5 ? 0x5fc35a : a > 0.25 ? 0xe0b040 : 0xd04a3a, 1).fillRect(x - w / 2, y + 1, w * a, 5); }

  /* ---------- Eingaben ---------- */
  /** Antippen in der Welt: liegt dort ein Gegner (als Heiler: ein Verbündeter), wird er zum Ziel. true = erledigt */
  antippen(wx: number, wy: number): boolean { if (!this.netz || !this.z) return false; const ich = this.z.w.find((e) => e[0] === this.ichId), heilt = Boolean(ich && HELDEN[ich[2]].modi[ich[12]].art === "heil");
    let best: [number, number] | null = null; for (const e of this.z.w) { if ((e[3] === 0) !== heilt || e[10] || e[0] === this.ichId) continue; const d = Math.hypot(this.zone.x0 + e[4] - wx, this.zone.y0 + e[5] - 0.6 - wy); if (d < 1.2 && (!best || d < best[0])) best = [d, e[0]]; }
    if (!best) return false; this.netz.sende({ t: "ziel", id: best[1] }); return true; }
  /** 1: den nächsten Gegner angreifen (läuft hin, wenn er zu weit weg ist) */
  angriff() { if (!this.netz || !this.z) return; const ich = this.z.w.find((e) => e[0] === this.ichId); if (!ich) return; const W = HELDEN[ich[2]].modi[ich[12]], heilt = W.art === "heil", d = (e: typeof ich) => Math.hypot(e[4] - ich[4], e[5] - ich[5]);
    const z = heilt ? this.z.w.filter((e) => e[3] === 0 && !e[10] && e[0] !== ich[0] && e[7] < e[8] && d(e) < 12).sort((a, b) => a[7] / a[8] - b[7] / b[8])[0]
      : this.z.w.find((e) => e[0] === this.z!.ich.zielId && e[3] !== 0 && !e[10]) || this.z.w.filter((e) => e[3] !== 0 && !e[10] && d(e) < 15).sort((a, b) => d(a) - d(b))[0]; /* in der offenen Welt etwas weiter als in der Kampfszene */
    if (!z) return; if (d(z) > W.reich + 0.3) this.netz.sende({ t: "lauf", x: z[4], y: z[5] }); this.netz.sende({ t: "ziel", id: z[0] }); }
  /** 2–4: Fähigkeit auf das Ziel, sonst den nächsten Gegner, sonst in Blickrichtung */
  faehig(taste: Taste) { if (!this.netz || !this.z) return; const ich = this.z.w.find((e) => e[0] === this.ichId); if (!ich) return;
    const zi = this.z.w.find((e) => e[0] === this.z!.ich.zielId && !e[10]) || this.z.w.filter((e) => e[3] !== 0 && !e[10]).sort((a, b) => Math.hypot(a[4] - ich[4], a[5] - ich[5]) - Math.hypot(b[4] - ich[4], b[5] - ich[5]))[0];
    const p = zi && Math.hypot(zi[4] - ich[4], zi[5] - ich[5]) < 8 ? { x: zi[4], y: zi[5] } : { x: ich[4] + Math.cos(ich[6]) * 3, y: ich[5] + Math.sin(ich[6]) * 3 }; this.netz.sende({ t: "faehig", taste, x: p.x, y: p.y }); }
  private tastenAn() { const taste = (ev: KeyboardEvent) => { if (this.vorbei || ev.repeat || ev.target instanceof HTMLInputElement) return; const k = ev.key.toLowerCase();
      if (k === "1") this.angriff(); else if (k === "2" || k === "q") this.faehig("q"); else if (k === "3") this.faehig("e"); else if (k === "4" || k === "r") this.faehig("r"); else if (k === " " || k === "f" || k === "tab") { ev.preventDefault(); if (this.netz) this.netz.sende({ t: "modus" }); } };
    window.addEventListener("keydown", taste); const druck = (ev: Event) => { const b = (ev.target as HTMLElement).closest("[data-taste], #ez-modus") as HTMLElement | null; if (!b || this.vorbei) return; ev.preventDefault(); ev.stopPropagation();
      if (b.id === "ez-modus") { if (this.netz) this.netz.sende({ t: "modus" }); } else if (b.dataset.taste === "a") this.angriff(); else this.faehig(b.dataset.taste as Taste); };
    const t = $("#ez-tasten"); t.addEventListener("pointerdown", druck, true);
    this.s.events.once("shutdown", () => { window.removeEventListener("keydown", taste); t.removeEventListener("pointerdown", druck, true); this.ende(); });
    const alt = this.ende.bind(this); this.ende = () => { window.removeEventListener("keydown", taste); t.removeEventListener("pointerdown", druck, true); alt(); }; }

  /* ---------- Anzeige: Leben, Erfahrung, Abklingzeiten ---------- */
  private hud(z: Zustand) { const ich = z.w.find((e) => e[0] === z.ich.id); if (!ich) return; const D = HELDEN[ich[2]], W = D.modi[z.ich.modus], sym = SYMBOL[ich[2]] || {};
    $("#ez-name").textContent = `${D.name} · ${W.name}`; ($("#ez-lp") as HTMLElement).style.width = Math.round(100 * ich[7] / ich[8]) + "%"; $("#ez-lpzahl").textContent = `${ich[7]} / ${ich[8]}`;
    { const bild = $("#ez-ich-bild") as HTMLImageElement, src = "../" + D.bild; if (bild.dataset.src !== src) { bild.dataset.src = src; bild.src = src; } const st = $("#ez-ich-stufe"), s = z.ich.stufe || stufeAusEp(epAlle()[ich[2]] || 0); st.hidden = false; st.textContent = "St. " + s; }
    if (z.ich.stufe) { const s = z.ich.stufe, e = z.ich.ep || 0, von = EP_BIS[s], bis = s < STUFE_MAX ? EP_BIS[s + 1] : von; $("#ez-xpleiste").hidden = false; ($("#ez-xp") as HTMLElement).style.width = (s < STUFE_MAX ? Math.min(100, Math.round(100 * (e - von) / (bis - von))) : 100) + "%"; $("#ez-xpzahl").textContent = s < STUFE_MAX ? `${e - von} / ${bis - von} EP` : "höchste Stufe"; }
    for (const [taste, cd, def] of [["q", z.ich.cdQ, D.q], ["e", z.ich.cdE, D.e], ["r", z.ich.cdR, D.r]] as const) { const el = $(`[data-taste="${taste}"]`); if (!el) continue; el.classList.toggle("zu", cd > 0); el.style.setProperty("--cd", cd > 0 ? String(Math.min(1, cd / def.zeit)) : "0"); (el.querySelector("u") as HTMLElement).textContent = cd > 0 ? String(Math.ceil(cd)) : "";
      const k = el.querySelector("small") as HTMLElement; if (k.textContent !== def.name) { k.textContent = def.name; el.title = `${def.name}: ${def.text}`; (el.querySelector("img") as HTMLImageElement).src = symbolBild(sym[taste] || "sterne"); } }
    { const an = $('[data-taste="a"]'), img = an && (an.querySelector("img") as HTMLImageElement), src = symbolBild((sym.modi || [])[z.ich.modus] || "hieb"); if (img && img.dataset.src !== src) { img.dataset.src = src; img.src = src; } }
    const mo = $("#ez-modus"), mt = `<img alt="" src="${symbolBild((sym.modi || [])[z.ich.modus] || "hieb")}"><b>⇄</b>`; if (mo && mo.dataset.h !== mt) { mo.dataset.h = mt; mo.innerHTML = mt; mo.title = `Waffe wechseln: ${D.modi[z.ich.modus ? 0 : 1].name} (Leertaste)`; } }
}
