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
import { kampfMerken } from "../kampfzeit";
import { AUSDAUER, ausdauerVomServer } from "../sprintzustand";
import { NULL_XP as NULL_XP_K } from "../../../shared/kampfwerte";
import Phaser from "phaser";
import { chatSystem, geraetAngaben, aufWeltWarten } from "../welt";
import { HELDEN, MONSTER, setzeStaerke, HELDENSTUFE, HELDENEP, stufeAusEp, EP_BIS, STUFE_MAX } from "../../../shared/config";
import { KARTEN, FEIN, WELTZONEN, ORTSTUFE } from "../../../shared/karten";
import { eigenesBildnis, aktiverHeld } from "../held";
import { inventar } from "../inventar";
import { skillsSchreiben, skillAnzeige, meineKampfwerte, stufenVon, stilJetzt, autoLesen, xpDrops } from "../skills";
import { GEGENSTAENDE } from "../../../shared/gegenstaende";
import { Held, heldPruefen, aussehenSchluessel } from "../../../shared/aussehen";
import { setzeKarte } from "../../../shared/karte";
import { verbinde, Netz, SPIELSERVER } from "../netz";
import type { Zustand, Taste, Ereignis } from "../../../shared/sim";
import { BIT } from "../../../shared/sim";
import { heldenFigur, richten, figurVorladen } from "../modulfigur";
import { kontoToken } from "../konto";
import { epAlle } from "../halle";
import { SYMBOL, symbolBild } from "../symbole";
import { FELD_PX, HELD_PX } from "../../../shared/welt/typen";
import { Geschoss, GeschossArt } from "./geschosse";

const $ = (s: string) => document.querySelector(s) as HTMLElement;
const P = new URLSearchParams(location.search);
/** Gebiet der offenen Welt (Gebietsname für Server und Stufe): der Kreuzwald */
const GEBIET: Record<string, string> = { kreuzwald: "kreuzwald", unterschlupf: "unterschlupf", welt: "welt" };
/** Die Szene der offenen Welt, soweit der Kampf sie braucht */
export interface WeltSzene extends Phaser.Scene { ort: { x: number; y: number }; held: string; figur: Phaser.GameObjects.Sprite; gesperrt: boolean; halt(): void }
export interface Figur { blick?: number; /** kämpft gerade (bis performance.now) */ kampfBis?: number; typ: string; held: boolean; team: number; sp: Phaser.GameObjects.Sprite; nm: Phaser.GameObjects.Text; lb: Phaser.GameObjects.Graphics; x: number; y: number; zx: number; zy: number; laeuft: boolean; tot: boolean; lp: number; max: number; bits: number; schild: boolean; a?: string }

/** Die Kampfsteuerung mit den Bildern und Namen des Helden füllen – auch außerhalb eines Kampfgebiets (dort gedimmt) */
/** Kampfregeln v1 (eigener Held): überall nur „Angreifen“ mit dem Symbol der angelegten Waffe – keine alten Fähigkeitstasten, kein Waffenwechsel */
let v1Hoerer = false;
export function v1Tasten(): void { if (!aktiverHeld()) return; document.body.classList.add("kampf-v1");
  const W = inventar().angelegt.waffe ? GEGENSTAENDE[inventar().angelegt.waffe!] : null, art = W && W.waffe ? W.waffe.art : "nah", an = document.querySelector('[data-taste="a"]') as HTMLElement | null;
  if (an) { const img = an.querySelector("img") as HTMLImageElement | null, src = symbolBild(art === "fern" ? "symbole/armbrust" : art === "magie" ? "symbole/stab" : "symbole/schwert"), k = an.querySelector("small") as HTMLElement | null;
    if (img && img.dataset.src !== src) { img.dataset.src = src; img.src = src; } if (k) k.textContent = "Angreifen"; an.title = "Angreifen (1)"; }
  if (!v1Hoerer) { v1Hoerer = true; window.addEventListener("ez-inventar", () => v1Tasten()); } }
export function tastenFuellen(held: string, modus = 0): void { const D = HELDEN[held]; if (!D) return; const sym = SYMBOL[held] || {}; if (aktiverHeld()) { v1Tasten(); return; }
  for (const t of ["q", "e", "r"] as const) { const el = document.querySelector(`[data-taste="${t}"]`) as HTMLElement | null; if (!el) continue; const def = D[t]; (el.querySelector("small") as HTMLElement).textContent = def.name; el.title = `${def.name}: ${def.text}`; (el.querySelector("img") as HTMLImageElement).src = symbolBild(sym[t] || "sterne"); }
  const an = document.querySelector('[data-taste="a"] img') as HTMLImageElement | null; if (an) an.src = symbolBild((sym.modi || [])[modus] || "hieb");
  const mo = document.getElementById("ez-modus"); if (mo && !mo.innerHTML) mo.innerHTML = `<img alt="" src="${symbolBild((sym.modi || [])[modus] || "hieb")}"><b>⇄</b>`; }
/** Kampf ohne Spielserver (Server schläft oder ist nicht erreichbar): deutlich sagen, dass es dann keine Beute gibt und die XP nicht gespeichert werden */
function ohneServerMelden(grund: string): void {
  const text = "Keine Verbindung zum Spielserver – dieser Kampf läuft nur im Browser: keine Beute, und die XP werden nicht gespeichert. Lade die Seite neu, um es noch einmal zu versuchen." + (grund ? ` (${grund})` : "");
  chatSystem(text); console.warn("Kampf ohne Server:", grund);
  const el = document.getElementById("ez-dorf-hilfe"); if (el) { el.textContent = text; el.style.display = ""; }
}
export class WeltKampf {
  geschosse = new Map<number, { g: Geschoss; x: number; y: number; von: number }>(); schussBeginn = new Map<number, number>();
  netz: Netz | null = null; karteZeit = 0; schildWar = false; z: Zustand | null = null; ichId = 0; bereit = false; vorbei = false; totGemeldet = false; art = "";
  figuren = new Map<number, Figur>(); namen = new Map<number, { name: string; stufe: number; a?: Held }>();
  private gesendet = { x: 0, y: 0, t: 0 }; private hoerer: ((ev: Event) => void)[] = []; private ringZiel!: Phaser.GameObjects.Ellipse; private ichLb!: Phaser.GameObjects.Graphics;
  readonly zone: { karte: string; x0: number; y0: number; b: number; h: number }; readonly stufe: number;

  /** vorverbunden (an der Grenze): angemeldet, aber noch nicht im Gebiet – „betreten“ setzt den Helden ohne Wartezeit hinein */
  eingetreten = true; readonly vorverbunden: boolean; private betretenOffen: { x: number; y: number } | null = null;
  constructor(readonly s: WeltSzene, readonly region: string, wx: number, wy: number, private gefallen: () => void, wartend = false) {
    this.vorverbunden = wartend; this.eingetreten = !wartend;
    this.zone = WELTZONEN[region]; const gebiet = GEBIET[this.zone.karte] || this.zone.karte; this.stufe = ORTSTUFE[gebiet] || 1;
    const K = KARTEN[this.zone.karte], lx = wx - this.zone.x0, ly = wy - this.zone.y0;
    /* für das Rechnen im Browser (ohne Server): die Karte des Gebiets, hinein an der eigenen Stelle, Stärke des Gebiets */
    K.start = [[lx / FEIN - 0.5, ly / FEIN - 0.5]]; setzeKarte(K, FEIN); setzeStaerke(this.stufe, 1);
    for (const k of Object.keys(HELDENSTUFE)) delete HELDENSTUFE[k]; for (const k of Object.keys(HELDENEP)) delete HELDENEP[k];
    for (const [h, v] of Object.entries(epAlle())) { HELDENEP[h] = Number(v) || 0; HELDENSTUFE[h] = stufeAusEp(HELDENEP[h]); }
    this.bildAufbau(K); this.gebiet = gebiet;
    if (this.eingetreten) document.body.classList.add("weltkampf"); this.tastenAn(); void this.verbinden(lx, ly, gebiet);
    /* die Welt-Verbindung steht wieder (nach Funkloch oder App-Hintergrund): Kampfwelt sofort neu verbinden */
    const welt = () => { if (!this.vorbei && !this.netz && this.verlorenSeit) { if (this.wiederT) { clearTimeout(this.wiederT); this.wiederT = 0; } void this.wiederVerbinden(); } };
    window.addEventListener("ez-welt-verbunden", welt); this.weltHoerer = welt;
  }
  /* ---------- Neu verbinden nach Verlust (iOS trennt im Hintergrund; 26.11.2026) ---------- */
  private gebiet = ""; private verlorenSeit = 0; private wiederVersuch = 0; private wiederT: ReturnType<typeof setTimeout> | 0 = 0; private wiederLaeuft = false; private hoerDa = false; private weltHoerer: (() => void) | null = null;
  private v1Weg: (() => void)[] = [];
  /** Die Verbindung ist weg (nicht abgelehnt, nicht abgemeldet): Held steht, bis sie wieder da ist – kein Neuladen */
  private verbindungWeg(grund: string): void { if (this.vorbei) return; console.warn("Kampfwelt: Verbindung weg –", grund); this.netz = null; if (!this.verlorenSeit) this.verlorenSeit = Date.now(); this.wiederPlanen(); }
  private wiederPlanen(): void { if (this.vorbei || this.wiederT || this.netz) return; const warte = Math.min(10000, 1000 * 2 ** this.wiederVersuch++);
    this.wiederT = setTimeout(() => { this.wiederT = 0; void this.wiederVerbinden(); }, warte); }
  private async wiederVerbinden(): Promise<void> { if (this.vorbei || this.netz || this.wiederLaeuft) return; this.wiederLaeuft = true;
    try { const lx = this.s.ort.x - this.zone.x0, ly = this.s.ort.y - this.zone.y0; this.lauf = { x: NaN, y: NaN }; this.gesendet = { x: 0, y: 0, t: 0 };
      await this.verbinden(lx, ly, this.gebiet, true); } finally { this.wiederLaeuft = false; }
    if (this.netz) { this.verlorenSeit = 0; this.wiederVersuch = 0; const t = document.getElementById("ez-dorf-hilfe"); if (t && t.dataset.neu) { t.textContent = ""; t.style.display = "none"; delete t.dataset.neu; } return; }
    if (this.verlorenSeit && Date.now() - this.verlorenSeit > 60000) { const t = document.getElementById("ez-dorf-hilfe"); if (t && !t.dataset.neu) { t.dataset.neu = "1"; t.innerHTML = "Keine Verbindung zum Spielserver. <button type=\"button\" class=\"neuladen\">Neu laden</button>"; t.style.display = ""; const b = t.querySelector("button"); if (b) b.addEventListener("click", () => location.reload()); } }
    this.wiederPlanen(); }
  private async verbinden(lx: number, ly: number, gebiet: string, wieder = false) {
    const basis = P.has("server") ? P.get("server") || "" : SPIELSERVER, token = basis ? await kontoToken() : ""; if (this.vorbei) return;
    if (basis && token) { await aufWeltWarten(6000); if (this.vorbei) return; } /* Zonen Stufe 3: über die Welt-Verbindung, wenn sie gleich offen ist */
    const url = basis && token ? `${basis}?kampf=${encodeURIComponent(this.zone.karte)}&ort=${encodeURIComponent(gebiet)}` + (this.vorverbunden && !wieder ? "&warten=1" : `&lx=${lx.toFixed(2)}&ly=${ly.toFixed(2)}`) : "";
    if (wieder && !url) return; /* ohne Server (Gast): nichts neu zu verbinden */
    const hoer = (ev: Event) => { const m = (ev as CustomEvent).detail as { t: string; liste?: { id: number; name: string; stufe: number }[]; ep?: Record<string, number>; seelen?: number };
      if (m.t === "namen" && m.liste) { this.namen.clear(); for (const n of m.liste) this.namen.set(n.id, n);
        /* fremde Helden mit eigenem Aussehen: Figur neu anlegen, sobald das Aussehen bekannt ist */
        for (const [id, f] of this.figuren) { const n = this.namen.get(id), a = n && n.a ? heldPruefen(n.a) : null, k = a ? aussehenSchluessel(a) : "";
          if (f.held && (f.a || "") !== k) { const neu = this.neu(id, true, f.typ, f.team, f.x, f.y); f.sp.destroy(); f.nm.destroy(); f.lb.destroy(); Object.assign(neu, { tot: f.tot, lp: f.lp, max: f.max, zx: f.zx, zy: f.zy }); neu.sp.setVisible(!f.tot); } } }
      if ((m.t === "gebucht" || m.t === "gutschrift") && m.ep) try { localStorage.setItem("ez_ep", JSON.stringify(m.ep)); localStorage.setItem("ez_seelen", String(m.seelen || 0)); } catch { /* privat */ } };
    if (!this.hoerDa) { this.hoerDa = true; window.addEventListener("ez-server", hoer); this.hoerer.push(hoer); }
    const n = await verbinde(url, this.s.held, [], (z) => this.zustand(z), (art, grund) => { this.art = art; if (art === "lokal" && url) ohneServerMelden(grund); }, url ? { t: "anmeldung", token, ...geraetAngaben(), ...(aktiverHeld() ? { angelegt: inventar().angelegt } : {}) } : undefined, (grund) => this.verbindungWeg(grund));
    if (this.vorbei) { n.ende(); return; } if (wieder && n.art !== "server") { n.ende(); return; } /* neu verbinden: nicht auf das Rechnen im Browser ausweichen */ this.netz = n; this.v1Start(n); if (this.betretenOffen) { const b = this.betretenOffen; this.betretenOffen = null; this.eingetreten = false; this.betreten(b.x, b.y); }
  }
  /** Kampfregeln v1 (eigener Held): beim Rechnen im Browser Held und Gegner umstellen; Ausrüstungswechsel an Server oder Simulation weitergeben */
  v1 = false; private v1Stufen = "";
  private v1Start(n: Netz) { for (const w of this.v1Weg.splice(0)) w(); /* nach einem Neuverbinden: die Hörer der alten Verbindung ab */ if (n.art === "lokal" && n.sim) n.sim.eigeneWerteSetzen(); /* wie auf dem Server: Gegner der Weltzonen mit ihren eigenen Werten */ const kw = meineKampfwerte(); if (!kw) return; this.v1 = true; this.v1Stufen = stufenVon(kw.skills); document.body.classList.add("kampf-v1");
    const held = () => n.sim && n.sim.wesen.find((w) => w.held);
    if (n.art === "lokal" && n.sim) { const h = held(); if (h) n.sim.heldV1(h.id, kw); }
    const hoer = () => { if (this.vorbei) return; if (n.art === "server") n.sende({ t: "ausruestung", angelegt: inventar().angelegt } as unknown as Parameters<Netz["sende"]>[0]);
      else { const h = held(), k = h && h.kw ? meineKampfwerte(h.kw.skills) : null; if (h && k && n.sim) n.sim.kampfwerteSetzen(h.id, k); } };
    window.addEventListener("ez-inventar", hoer); this.hoerer.push(hoer); this.v1Weg.push(() => window.removeEventListener("ez-inventar", hoer));
    /* Angriffsstil (v2): dem Server melden, beim Rechnen im Browser die Werte neu setzen */
    const sprint = () => { if (!this.vorbei) n.sende({ t: "sprint", an: AUSDAUER.an, wert: AUSDAUER.wert } as unknown as Parameters<Netz["sende"]>[0]); }; /* Sprint: Stand beim Betreten, danach jedes Umschalten */
    window.addEventListener("ez-sprint", sprint); this.hoerer.push(sprint); this.v1Weg.push(() => window.removeEventListener("ez-sprint", sprint)); sprint();
    const stil = () => { if (this.vorbei) return; n.sende({ t: "auto", an: autoLesen() } as unknown as Parameters<Netz["sende"]>[0]); /* Autoangriff an/aus */
      if (n.art === "server") n.sende({ t: "stil", stil: stilJetzt() } as unknown as Parameters<Netz["sende"]>[0]); else hoer(); };
    if (this.stilHoerer) window.removeEventListener("ez-stil", this.stilHoerer); window.addEventListener("ez-stil", stil); this.stilHoerer = stil; if (n.art === "server") { stil(); n.sende({ t: "ausruestung", angelegt: inventar().angelegt } as unknown as Parameters<Netz["sende"]>[0]); } }
  private stilHoerer: (() => void) | null = null;
  /** Neue Skill-XP merken; beim Rechnen im Browser steigt mit einem neuen Skilllevel auch der Kampfwert */
  /** Sprint beim Betreten: der Server übernimmt Ausdauer und Schalter erst, wenn sein Held da ist – bis er unseren Stand zurückmeldet, schicken wir ihn erneut und
   *  übernehmen seine Werte nicht (sonst stünde der Sprint nach jedem Gebietswechsel wieder auf aus und die Leiste auf voll) */
  private ausdauerDa = false; private ausdauerGesendet = 0;
  private v1Xp(z: Zustand) { if (z.ich.ausdauer) { const [w, an] = z.ich.ausdauer;
      if (!this.ausdauerDa && (Math.abs(w - AUSDAUER.wert) > 2 || (an === 1) !== AUSDAUER.an)) { if (performance.now() - this.ausdauerGesendet > 400 && this.netz) { this.ausdauerGesendet = performance.now(); this.netz.sende({ t: "sprint", an: AUSDAUER.an, wert: AUSDAUER.wert } as unknown as Parameters<Netz["sende"]>[0]); } }
      else { this.ausdauerDa = true; ausdauerVomServer(z.ich.ausdauer); } } const x = z.ich.xp; if (!x) return; skillsSchreiben(x); xpDrops({ ...NULL_XP_K, ...x }); const st = stufenVon(x);
    if (st !== this.v1Stufen) { this.v1Stufen = st; const n = this.netz; if (n && n.art === "lokal" && n.sim) { const k = meineKampfwerte(x); if (k) n.sim.kampfwerteSetzen(z.ich.id, k); } } }
  /** Über die Grenze: jetzt hinein, an genau dieser Stelle (Weltfelder) – der Server ist schon angemeldet, es gibt keine Wartezeit */
  betreten(wx: number, wy: number, ziel?: { x: number; y: number } | null, richtung?: [number, number] | null) { if (this.eingetreten || this.vorbei) return; this.eingetreten = true; document.body.classList.add("weltkampf");
    const lx = wx - this.zone.x0, ly = wy - this.zone.y0; if (!this.netz) { this.betretenOffen = { x: wx, y: wy }; return; }
    if (this.netz.art === "lokal" && this.netz.sim) { const h = this.netz.sim.wesen.find((w) => w.held); if (h) { h.x = Math.max(0.5, Math.min(this.zone.b - 0.5, lx)); h.y = Math.max(0.5, Math.min(this.zone.h - 0.5, ly)); h.pfad = []; } }
    else { this.netz.sende({ t: "betreten", x: lx, y: ly } as unknown as Parameters<Netz["sende"]>[0]);
      /* gleich weiterlaufen lassen: sonst steht der Held auf dem Server an der Grenze, bis die erste Antwort da ist – und springt dann dorthin zurück */
      if (ziel) this.gehe(ziel.x, ziel.y); else if (richtung && Math.hypot(richtung[0], richtung[1]) > 0.05) this.steuern(richtung[0], richtung[1]); } }
  /** Gebiet verlassen: gutschreiben lassen (der Server bucht beim Trennen), Figuren weg */
  /** Teleport: dem Server sagen, dass der Held absichtlich abreist – er bleibt dann nicht als Kampfgeist stehen (eine Kampfwelt: sonst würde ihn die neue Verbindung an der alten Stelle übernehmen) */
  abreise(teleport: boolean) { if (this.netz && this.netz.art === "server") try { this.netz.sende({ t: "abreise", tp: teleport } as unknown as Parameters<Netz["sende"]>[0]); } catch { /* zu */ } } /* teleport: neu in der Waldmark; sonst (Tür, Untergrund) gilt die neue Stelle */
  ende() { if (this.vorbei) return; this.vorbei = true; if (this.wiederT) { clearTimeout(this.wiederT); this.wiederT = 0; } if (this.weltHoerer) { window.removeEventListener("ez-welt-verbunden", this.weltHoerer); this.weltHoerer = null; } if (this.netz) { try { this.netz.sende({ t: "halt" }); } catch { /* zu */ } this.netz.ende(); }
    this.bildEnde(); this.figuren.clear();
    for (const h of this.hoerer) { window.removeEventListener("ez-server", h); window.removeEventListener("ez-inventar", h); window.removeEventListener("ez-sprint", h); } if (this.stilHoerer) { window.removeEventListener("ez-stil", this.stilHoerer); this.stilHoerer = null; } document.body.classList.remove("weltkampf", "kampf-v1"); v1Tasten(); /* mit eigenem Held bleibt es bei „Angreifen“ */ document.querySelectorAll("#ez-karte u[data-k]").forEach((u) => u.remove()); }
  /** Gilt hier Mehrkampf (viele gegen viele)? Sonst Einzelkampf */
  /** Wie viele lebende Gegner in der Nähe des eigenen Helden sind (für das Kampf-Banner) */
  gegnerNah(felder = 8): number { const z = this.z; if (!z || !this.eingetreten) return 0; const ich = z.w.find((e) => e[0] === z.ich.id); if (!ich) return 0;
    return z.w.filter((e) => e[1] === 0 && !e[10] && e[3] !== ich[3] && Math.hypot(e[4] - ich[4], e[5] - ich[5]) <= felder).length; }
  mehrkampf(wx: number, wy: number): boolean { const K = KARTEN[this.zone.karte], x = wx - this.zone.x0, y = wy - this.zone.y0; return (K.mehrkampf || []).some(([x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1); }

  /* ---------- Zustand vom Server (oder aus dem Browser) ---------- */
  private zustand(z: Zustand) { if (this.vorbei || !this.eingetreten || this.betretenOffen) return; this.z = z; this.ichId = z.ich.id; const da = new Set<number>();
    const mich = z.w.find((e) => e[0] === z.ich.id); /* eine Kampfwelt (Zonen Stufe 2): Figuren nur in Sichtweite anlegen (40 Felder, weg erst ab 52) – sonst lädt der Browser die Modelle aller Gegner der Welt auf einmal */
    for (const e of z.w) { const [id, held, typ, team, x, y, , lp, max, , tot] = e; if (id !== this.ichId && mich) { const d = Math.max(Math.abs(x - mich[4]), Math.abs(y - mich[5])); if (d > (this.figuren.has(id) ? 52 : 40)) continue; }
      da.add(id); if (id === this.ichId) continue; let f = this.figuren.get(id);
      if (!f) f = this.neu(id, Boolean(held), typ, team, x, y); f.zx = x; f.zy = y; f.lp = lp; f.max = max; f.bits = e[9]; f.blick = e[6]; /* Blickrichtung vom Server: zum Gegner, mit dem gekämpft wird */
      if (Boolean(tot) !== f.tot) { f.tot = Boolean(tot); this.figurSichtbar(f, !f.tot); if (!f.tot) { f.x = x; f.y = y; } } }
    for (const ev of z.ev) this.ereignis(ev); /* erst die Ereignisse (Schadenszahl/Hitsplat), dann Verschwundenes entfernen – sonst fehlt bei einem Treffer, der sofort tötet, die Zahl */
    for (const id of [...this.figuren.keys()]) if (!da.has(id)) { const f = this.figuren.get(id)!; this.figuren.delete(id); this.figurEntfernen(f); }
    const ich = z.w.find((e) => e[0] === this.ichId); if (ich) { this.eigenerBlick(ich[6]);  if (!this.bereit) { this.bereit = true; const zx = this.zone.x0 + ich[4], zy = this.zone.y0 + ich[5]; if (Math.hypot(zx - this.s.ort.x, zy - this.s.ort.y) > 3) { this.s.ort.x = zx; this.s.ort.y = zy; } } /* nah dran: nicht springen – die Glättung (schritt) führt weich zur Stelle des Servers */
      if (ich[10] && !this.totGemeldet) { this.totGemeldet = true; this.s.halt(); this.s.gesperrt = true; const t = $("#ez-dorf-hilfe"); t.textContent = "Du bist gefallen – deine Gefährten tragen dich zurück in die Waldmark …"; t.style.display = ""; setTimeout(() => this.gefallen(), 1800); } }
    this.hud(z); }
  protected neu(id: number, held: boolean, typ: string, team: number, x: number, y: number): Figur { const s = this.s, D = held ? HELDEN[typ] : MONSTER[typ], nA = held ? this.namen.get(id) : undefined, eigen = nA && nA.a ? heldPruefen(nA.a) : null, hoch = held ? HELD_PX : HELD_PX * ((D && (D as { hoehe?: number }).hoehe) || 88) / 96;
    const fu = (D && (D as { fuss?: number[] }).fuss) || [0.5, 0.94], sp = heldenFigur(s, x * FELD_PX, y * FELD_PX, typ, hoch, undefined, eigen).setOrigin(fu[0], fu[1]); sp.setScale(hoch * ((D as { gross?: number }).gross || 1) / sp.height);
    const nm = s.add.text(0, 0, "", { fontFamily: "Cinzel, Georgia, serif", fontSize: "14px", color: team === 0 ? "#f3e3b5" : "#ffc9b0", stroke: "#000", strokeThickness: 4 }).setOrigin(0.5, 1).setResolution(2).setDepth(1e7);
    const f: Figur = { typ, held, team, sp, nm, lb: s.add.graphics().setDepth(1e7), x, y, zx: x, zy: y, laeuft: false, tot: false, lp: 1, max: 1, bits: 0, schild: false, a: eigen ? aussehenSchluessel(eigen) : "" }; this.figuren.set(id, f); return f; }
  private ereignis(ev: Ereignis) { const zahl = (id: number, t: string, farbe: string) => this.zahl(id, t, farbe);
    if ((ev.a === "schaden" || ev.a === "null" || ev.a === "block" || ev.a === "hieb") && ev.id === this.ichId) kampfMerken(); /* Weltenwechsel erst 10 s nach dem Kampf */
    if (ev.a === "schaden") { this.splat(ev.id, ev.n);
      const f = ev.id === this.ichId ? undefined : this.figuren.get(ev.id), sp = f && !f.held ? (f.sp as unknown as { treffer?: () => void }) : undefined; if (sp && typeof sp.treffer === "function") sp.treffer(); }   /* Gegner zucken beim Treffer */
    else if (ev.a === "heil") zahl(ev.id, "+" + ev.n, "#7dff9a");
    else if (ev.a === "null" || ev.a === "block") this.splat(ev.id, 0); /* verfehlt oder geblockt: blauer Hitsplat mit 0 */
    else if (ev.a === "ep" && (ev.id === undefined || ev.id === this.ichId)) zahl(this.ichId, `+${ev.n} EP`, "#8fd0ff");
    else if (ev.a === "stufe" && ev.id === this.ichId) zahl(this.ichId, `Stufe ${ev.s}!`, "#ffd75e");
    else if (ev.a === "text") zahl(ev.id, ev.t, "#ffd98a");
    else if (ev.a === "hieb" || ev.a === "anlegen") this.hieb(ev.id);
    else if (ev.a === "ansage") { this.ansageZeigen(ev.felder, ev.t); zahl(ev.id, ev.name + "!", "#ff7a5a"); } /* Boss-Baukasten: die Felder leuchten, bevor es zuschlägt */
    else if (ev.a === "bossphase" && ev.text) zahl(ev.id, ev.text, "#ffb27a");
    else if (ev.a === "trinken") zahl(ev.id, ev.text || "heilt sich", "#7dff9a");
    else if (ev.a === "schweben") zahl(ev.id, "erhebt sich!", "#b9a7ff"); else if (ev.a === "landen") zahl(ev.id, ev.text || "landet", "#b9a7ff"); /* Schweben (#49): Flugbild macht die Oberfläche */
    else if (ev.a === "stil" && (ev.text || ev.name)) zahl(ev.id, ev.text || ev.name!, "#ffb27a"); }
  /** Folgen (#54): Stelle (Weltfelder) eines anderen Helden in diesem Kampfgebiet, nach seinem Namen – null: nicht (mehr) hier */
  heldOrt(name: string): { x: number; y: number } | null { for (const [id, f] of this.figuren) { if (!f.held || f.tot || id === this.ichId) continue; const n = this.namen.get(id); if (n && n.name === name) return { x: this.zone.x0 + f.zx, y: this.zone.y0 + f.zy }; } return null; }
  /** Ansage: diese Felder (Rechenfelder, Mitte) leuchten t Sekunden rot – wer dann noch darauf steht, wird getroffen */
  protected ansageZeigen(felder: [number, number][], t: number): void { const s = this.s;
    for (const [x, y] of felder) { const r = s.add.rectangle((this.zone.x0 + x) * FELD_PX, (this.zone.y0 + y) * FELD_PX, FELD_PX - 2, FELD_PX - 2, 0xff3a2a, 0.45).setDepth(2);
      s.tweens.add({ targets: r, alpha: 0.85, duration: Math.max(100, t * 1000), onComplete: () => r.destroy() }); } }
  /* ---------- Darstellung (2D, Phaser) – die 3D-Welt überschreibt diese Haken (welt3d/kampf3d.ts) ---------- */
  protected bildAufbau(K: (typeof KARTEN)[string]) { const s = this.s; this.ringZiel = s.add.ellipse(0, 0, 54, 27).setStrokeStyle(3, 0xff6a6a, 0.95).setVisible(false); this.ichLb = s.add.graphics().setDepth(1e7);
    for (const l of K.lager || []) figurVorladen(s, l.art); /* Gegnerfiguren gleich laden, nicht erst beim ersten Anblick */ }
  protected bildEnde() { for (const f of this.figuren.values()) { f.sp.destroy(); f.nm.destroy(); f.lb.destroy(); } this.ringZiel.destroy(); this.ichLb.destroy(); }
  protected figurSichtbar(f: Figur, an: boolean) { f.sp.setVisible(an); f.nm.setVisible(an); if (!an) f.lb.clear(); }
  protected figurEntfernen(f: Figur) { f.nm.destroy(); f.lb.destroy();
    /* ein besiegter Gegner der Figuren-Fabrik fällt erst (Todesbewegung), bleibt kurz liegen und verblasst dann */
    const sp = f.sp as unknown as { sterben?: () => number }, dauer = !f.held && typeof sp.sterben === "function" ? sp.sterben() : 0;
    if (dauer) this.s.tweens.add({ targets: f.sp, alpha: 0, delay: dauer + 1400, duration: 700, onComplete: () => f.sp.destroy() }); else f.sp.destroy(); }
  protected zahl(id: number, t: string, farbe: string) { const s = this.s, f = this.figuren.get(id), p = id === this.ichId ? { x: s.figur.x, y: s.figur.y - HELD_PX } : f ? { x: f.sp.x, y: f.sp.y - HELD_PX } : null; if (!p) return;
    const o = s.add.text(p.x, p.y, t, { fontFamily: "Inter, sans-serif", fontSize: "17px", fontStyle: "bold", color: farbe, stroke: "#000", strokeThickness: 4 }).setOrigin(0.5).setDepth(1e7 + 1);
    s.tweens.add({ targets: o, y: p.y - 34, alpha: 0, duration: 900, onComplete: () => o.destroy() }); }
  /** Hitsplat wie in OSRS: Schaden > 0 rot, 0 (verfehlt, geblockt) blau. Die 2D-Welt zeigt weiter Zahlen */
  protected splat(id: number, n: number): void { this.zahl(id, n > 0 ? String(n) : "0", n > 0 ? (id === this.ichId ? "#ff6a5a" : "#ffe08a") : "#9cc8ff"); }
  /** Der eigene Held schaut in die Richtung des Servers – beim Kämpfen zu seinem Gegner (nur 3D) */ protected eigenerBlick(_winkel: number): void { /* 2D: nichts */ }
  protected hieb(id: number) { const sp = id === this.ichId ? this.s.figur : this.figuren.get(id)?.sp; if (sp && "richte" in sp) sp.play("hieb-x"); }

  /* ---------- jedes Bild ---------- */
  /** Bewegung: die Welt hat aus Tasten, Stick oder Wegfindung eine Richtung (rx, ry); sie geht an den Server, die Stelle kommt von dort */
  steuern(rx: number, ry: number) { if (!this.netz) return; const l = Math.hypot(rx, ry), k = l > 1 ? 1 / l : 1, x = l < 0.05 ? 0 : rx * k, y = l < 0.05 ? 0 : ry * k, j = performance.now(), g = this.gesendet;
 if (x !== 0 || y !== 0) this.lauf = { x: NaN, y: NaN }; /* selbst steuern beendet das Anlaufen */
    if ((x === g.x && y === g.y) || (j - g.t < 60 && Math.hypot(x - g.x, y - g.y) < 0.4 && (x !== 0 || y !== 0))) return; this.gesendet = { x, y, t: j }; this.netz.sende({ t: "richtung", x, y }); }
  /** Ein Ziel anlaufen (Antippen in der Welt): den Weg sucht der Server auf seinem eigenen Raster – derselbe, auf dem er bewegt */
  private lauf = { x: NaN, y: NaN };
  gehe(wx: number, wy: number) { if (!this.netz) return; if (Math.hypot(wx - this.lauf.x, wy - this.lauf.y) < 0.3) return; this.lauf = { x: wx, y: wy }; this.gesendet = { x: 0, y: 0, t: performance.now() };
    this.netz.sende({ t: "lauf", x: wx - this.zone.x0, y: wy - this.zone.y0 }); }
  schritt(dt: number) { if (!this.z) return; const s = this.s, k = Math.min(1, dt * 12), ich = this.z.w.find((e) => e[0] === this.ichId);
    { const j = performance.now(); for (const [id, G] of this.geschosse) if (!G.g.schritt(dt * 1000, j)) this.geschosse.delete(id); }
    /* der eigene Held mit erhobenem Schild (Torvald, Waffe „Schild“): Block im Stehen, Gang mit Schild – sonst wie die Welt es will */
    { const schild = Boolean(ich && !ich[10] && (ich[9] & BIT.schild)); this.eigeneHaltung(schild, (s as unknown as { laeuft: boolean }).laeuft); this.schildWar = schild; }
    if (ich && this.bereit && !ich[10]) { const zx = this.zone.x0 + ich[4], zy = this.zone.y0 + ich[5]; s.ort.x += (zx - s.ort.x) * k; s.ort.y += (zy - s.ort.y) * k; if (Math.hypot(zx - s.ort.x, zy - s.ort.y) > 3) { s.ort.x = zx; s.ort.y = zy; } }
    for (const f of this.figuren.values()) { if (f.tot) { this.figurSichtbar(f, false); continue; } const vx = f.zx - f.x, vy = f.zy - f.y, lauf = Math.hypot(vx, vy) > 0.03; f.x += vx * k; f.y += vy * k;
      const schild = Boolean(f.bits & BIT.schild), wechsel = lauf !== f.laeuft || schild !== f.schild; f.laeuft = lauf; f.schild = schild;
      const id = [...this.figuren.entries()].find(([, g]) => g === f)?.[0] || 0, n = f.held ? this.namen.get(id) : undefined;
      const t = f.held ? (n ? `${n.name} · Lv ${n.stufe}` : HELDEN[f.typ]?.name || "") : `${MONSTER[f.typ]?.name || f.typ} · Lv ${MONSTER[f.typ]?.stufe || this.stufe}`; /* Weltzonen: Gegner mit eigenem Level und eigenen Werten */
      this.figurZeichnen(f, vx, vy, lauf, wechsel, t, dt); }
    /* Minimap: Gegner rot, andere Helden blau – live, alle 200 ms */
    if (performance.now() - this.karteZeit > 200) { this.karteZeit = performance.now(); const k = document.getElementById("ez-karte");
      if (k) for (const [id, f] of this.figuren) { let u = k.querySelector(`u[data-k="${id}"]`) as HTMLElement | null; if (!u) { u = document.createElement("u"); u.dataset.k = String(id); k.appendChild(u); }
        u.className = (f.team === 0 ? "freund" : "feind") + (f.tot ? " tot" : ""); u.style.left = (100 * f.x / this.zone.b) + "%"; u.style.top = (100 * f.y / this.zone.h) + "%"; }
      if (k) for (const u of Array.from(k.querySelectorAll<HTMLElement>("u[data-k]"))) if (!this.figuren.has(Number(u.dataset.k))) u.remove(); }
    /* eigenes Leben über dem Kopf und das gewählte Ziel */
    const zf = this.figuren.get(this.z.ich.zielId); this.zielUndLeben(ich ? ich[7] / ich[8] : null, zf && !zf.tot ? zf : null); }
  protected eigeneHaltung(schild: boolean, laeuft: boolean) { const sp = this.s.figur as unknown as { play(k: string): void; setTexture(k: string): void };
    if ("richte" in sp) { if (schild) { if (laeuft) sp.play("schild-x"); else sp.setTexture("schildstand-x"); } else if (this.schildWar) { if (laeuft) sp.play("lauf-x"); else sp.setTexture("figur-x"); } } }
  protected figurZeichnen(f: Figur, vx: number, vy: number, lauf: boolean, wechsel: boolean, name: string, _dt: number) {
    const px = (this.zone.x0 + f.x) * FELD_PX, py = (this.zone.y0 + f.y) * FELD_PX; f.sp.setPosition(px, py + 2).setDepth(py);
    if (lauf) { richten(f.sp, vx, vy); if (Math.abs(vx) > 0.02) f.sp.setFlipX(vx < 0); }
    if (wechsel) this.haltung(f, lauf); if (f.nm.text !== name) f.nm.setText(name);
    const h = f.held ? HELD_PX : HELD_PX * ((MONSTER[f.typ] as { hoehe?: number })?.hoehe || 88) / 96; f.nm.setPosition(px, py - h - 12); this.balken(f.lb, px, py - h - 10, f.lp / f.max, f.team !== 0); }
  protected zielUndLeben(leben: number | null, zf: Figur | null) { const s = this.s; if (leben !== null) this.balken(this.ichLb, s.figur.x, s.figur.y - HELD_PX - 8, leben, false); else this.ichLb.clear();
    if (zf) this.ringZiel.setVisible(true).setPosition(zf.sp.x, zf.sp.y - 2).setDepth(zf.sp.depth - 0.01); else this.ringZiel.setVisible(false); }
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
  /** Welcher Gegner steht an dieser Weltstelle? (Aktionsmenü) */
  zielBei(wx: number, wy: number): { name: string } | null { if (!this.z) return null; let best: [number, (typeof this.z.w)[number]] | null = null;
    for (const e of this.z.w) { if (e[3] === 0 || e[10] || e[0] === this.ichId) continue; const d = Math.hypot(this.zone.x0 + e[4] - wx, this.zone.y0 + e[5] - 0.6 - wy); if (d < 1.2 && (!best || d < best[0])) best = [d, e]; }
    if (!best) return null; const M = MONSTER[best[1][2] as string] as { name?: string; stufe?: number } | undefined; return { name: `${M && M.name ? M.name : String(best[1][2])}${M && M.stufe ? " · Lv " + M.stufe : ""}` }; }
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
  private tastenAn() { const taste = (ev: KeyboardEvent) => { if (this.vorbei || !this.eingetreten || ev.repeat || ev.target instanceof HTMLInputElement) return; const k = ev.key.toLowerCase();
      if (k === "1") this.angriff(); else if (k === "2" || k === "q") this.faehig("q"); else if (k === "3") this.faehig("e"); else if (k === "4" || k === "r") this.faehig("r"); else if (k === " " || k === "f" || k === "tab") { ev.preventDefault(); if (this.netz) this.netz.sende({ t: "modus" }); } };
    window.addEventListener("keydown", taste); const druck = (ev: Event) => { const b = (ev.target as HTMLElement).closest("[data-taste], #ez-modus") as HTMLElement | null; if (!b || this.vorbei) return; ev.preventDefault(); ev.stopPropagation();
      if (b.id === "ez-modus") { if (this.netz) this.netz.sende({ t: "modus" }); } else if (b.dataset.taste === "a") this.angriff(); else this.faehig(b.dataset.taste as Taste); };
    const t = $("#ez-tasten"); t.addEventListener("pointerdown", druck, true);
    this.s.events.once("shutdown", () => { window.removeEventListener("keydown", taste); t.removeEventListener("pointerdown", druck, true); this.ende(); });
    const alt = this.ende.bind(this); this.ende = () => { window.removeEventListener("keydown", taste); t.removeEventListener("pointerdown", druck, true); alt(); }; }

  /* ---------- Anzeige: Leben, Erfahrung, Abklingzeiten ---------- */
  private hud(z: Zustand) { const ich = z.w.find((e) => e[0] === z.ich.id); if (!ich) return; this.lebenHud(ich[7], ich[8]); const D = HELDEN[ich[2]], W = D.modi[z.ich.modus], sym = SYMBOL[ich[2]] || {};
    if (z.ich.xp) { this.v1Xp(z); this.hudV1(z, ich[7], ich[8]); return; }
    $("#ez-name").textContent = `${D.name} · ${W.name}`; ($("#ez-lp") as HTMLElement).style.width = Math.round(100 * ich[7] / ich[8]) + "%"; $("#ez-lpzahl").textContent = `${ich[7]} / ${ich[8]}`;
    { const bild = $("#ez-ich-bild") as HTMLImageElement, src = eigenesBildnis() || "../" + D.bild; if (bild.dataset.src !== src) { bild.dataset.src = src; bild.src = src; } const st = $("#ez-ich-stufe"), s = z.ich.stufe || stufeAusEp(epAlle()[ich[2]] || 0); st.hidden = false; st.textContent = "St. " + s; }
    if (z.ich.stufe) { const s = z.ich.stufe, e = z.ich.ep || 0, von = EP_BIS[s], bis = s < STUFE_MAX ? EP_BIS[s + 1] : von; $("#ez-xpleiste").hidden = false; ($("#ez-xp") as HTMLElement).style.width = (s < STUFE_MAX ? Math.min(100, Math.round(100 * (e - von) / (bis - von))) : 100) + "%"; $("#ez-xpzahl").textContent = s < STUFE_MAX ? `${e - von} / ${bis - von} EP` : "höchste Stufe"; }
    for (const [taste, cd, def] of [["q", z.ich.cdQ, D.q], ["e", z.ich.cdE, D.e], ["r", z.ich.cdR, D.r]] as const) { const el = $(`[data-taste="${taste}"]`); if (!el) continue; el.classList.toggle("zu", cd > 0); el.style.setProperty("--cd", cd > 0 ? String(Math.min(1, cd / def.zeit)) : "0"); (el.querySelector("u") as HTMLElement).textContent = cd > 0 ? String(Math.ceil(cd)) : "";
      const k = el.querySelector("small") as HTMLElement; if (k.textContent !== def.name) { k.textContent = def.name; el.title = `${def.name}: ${def.text}`; (el.querySelector("img") as HTMLImageElement).src = symbolBild(sym[taste] || "sterne"); } }
    { const an = $('[data-taste="a"]'), img = an && (an.querySelector("img") as HTMLImageElement), src = symbolBild((sym.modi || [])[z.ich.modus] || "hieb"); if (img && img.dataset.src !== src) { img.dataset.src = src; img.src = src; } }
    document.body.classList.remove("kampf-v1"); const sk = document.getElementById("ez-skills"); if (sk) sk.hidden = true;
    const mo = $("#ez-modus"), mt = `<img alt="" src="${symbolBild((sym.modi || [])[z.ich.modus] || "hieb")}"><b>⇄</b>`; if (mo && mo.dataset.h !== mt) { mo.dataset.h = mt; mo.innerHTML = mt; mo.title = `Waffe wechseln: ${D.modi[z.ich.modus ? 0 : 1].name} (Leertaste)`; } }
  /** Eigene Lebenspunkte für eine Anzeige außerhalb der Kampf-Kopfzeile (3D-Welt: Bogen um die Minikarte) */
  protected lebenHud(_lp: number, _max: number): void { /* 2D: steht in der Kopfzeile */ }
  /** Kampfregeln v1: Heldenlevel am Bild, Lebenspunkte, drei Skill-Balken; nur „Angreifen“ (das Symbol der angelegten Waffe) */
  private hudV1(z: Zustand, lp: number, max: number) { document.body.classList.add("kampf-v1"); const angelegt = inventar().angelegt, W = angelegt.waffe ? GEGENSTAENDE[angelegt.waffe] : null;
    $("#ez-name").textContent = W ? W.name : "Fäuste"; ($("#ez-lp") as HTMLElement).style.width = Math.round(100 * lp / max) + "%"; $("#ez-lpzahl").textContent = `${Math.round(lp)} / ${max}`;
    const bild = $("#ez-ich-bild") as HTMLImageElement, src = eigenesBildnis() || "../img/favicon.svg"; if (bild.dataset.src !== src) { bild.dataset.src = src; bild.src = src; }
    const st = $("#ez-ich-stufe"); st.hidden = false; st.textContent = "Lv " + (z.ich.stufe || 1); st.title = "Heldenlevel"; $("#ez-xpleiste").hidden = true; skillAnzeige(z.ich.xp!);
    const an = $('[data-taste="a"]'), img = an && (an.querySelector("img") as HTMLImageElement), art = W && W.waffe ? W.waffe.art : "nah", src2 = symbolBild(art === "fern" ? "symbole/armbrust" : art === "magie" ? "symbole/stab" : "symbole/schwert");
    if (img && img.dataset.src !== src2) { img.dataset.src = src2; img.src = src2; } const k = an && (an.querySelector("small") as HTMLElement); if (k && k.textContent !== "Angreifen") { k.textContent = "Angreifen"; an.title = "Angreifen (1)"; } }
}
