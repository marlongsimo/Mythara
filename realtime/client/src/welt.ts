/*
 * Mythara Echtzeit – die gemeinsame Welt im Client: andere Spieler sehen (Name, Stufe, Leben), Chat, aktiver Held.
 * Verbindung zum Spielserver mit ?welt=1&ort=<ort> (nur mit Spielerkonto). Name, Held und Stufe bestimmt der Server.
 * Den Helden wechselt man nur in der Waldmark – der Server lehnt den Wechsel anderswo ab.
 */
import Phaser from "phaser";
import { HELDEN, HELDENREIHE } from "../../shared/config";
import { heldenFigur, richten } from "./modulfigur";
import { aktiverHeld } from "./held";
import { Held, heldPruefen, aussehenSchluessel } from "../../shared/aussehen";
import { kontoName, kontoToken } from "./konto";
import { gruppe, serverAdresse } from "./gruppe";

export interface Fremder { i: number; n: string; h: string; /** gewähltes Aussehen (Heldeneditor) */ a?: Held; s: number; x: number; y: number; b: number; l: number; lp?: number; max?: number }
export interface Ich { id: number; name: string; held: string; stufe: number; ort: string; festerHeld?: boolean; gast?: boolean; /** zuletzt gemerkte Stelle in der Welt (Weltfelder; null = Start der Region) */ pos?: { region: string; x: number | null; y: number | null } }
type Kanal = "oeffentlich" | "gruppe" | "system" | "fluestern";
export interface Hand { spieler?(l: Fremder[]): void; fort?(id: number): void; ich?(i: Ich): void; blase?(id: number, text: string): void }
let ws: WebSocket | null = null, ich: Ich | null = null, hand: Hand = {}, ort = "", versuch = 0, gesendet = { x: NaN, y: NaN, t: 0, l: -1 };
const nachrichten: { kanal: Kanal; von?: string; an?: string; i?: number; text: string; zeit: number }[] = [];
let fremde: Fremder[] = [], online = 0;
/** Wer gerade am selben Ort ist (ohne mich) und wie viele insgesamt in der Welt sind */
export const weltSpieler = (): Fremder[] => fremde.slice();
export const weltOnline = (): number => online;
export const weltIch = (): Ich | null => ich;

/** Die Welt betreten (je Seite einmal). Ohne Konto oder ohne Server: nur der Chat zeigt einen Hinweis. */
export function weltBetreten(o: string, h: Hand): void { const schon = ws && ort === o; ort = o; hand = h; chatAnzeigen(); if (schon) return;
  if (!serverAdresse()) { chatSystem("Ohne Spielserver bist du allein unterwegs."); return; }
  if (!kontoName()) chatSystem("Als Gast siehst du die anderen Spieler. Zum Schreiben brauchst du ein Konto."); void verbinden(); }
let verbindet = false;
async function verbinden() { if (verbindet || ws) return; verbindet = true; /* nie zwei Verbindungen zugleich: während auf das Token gewartet wird, gibt es noch keine – ein zweiter Aufruf öffnete sonst eine zweite (der Server wirft dann eine hinaus) */
  let token = ""; try { token = kontoName() ? await kontoToken() : ""; } finally { verbindet = false; } if (kontoName() && !token) return; if (ws) return; const g = gruppe(); /* ohne Konto: als Gast */
  const s = new WebSocket(serverAdresse() + "?welt=1&ort=" + encodeURIComponent(ort)); ws = s;
  s.onopen = () => { versuch = 0; s.send(JSON.stringify({ t: "anmeldung", token, held: lokalerHeld(), aussehen: aktiverHeld() || undefined, raum: g ? g.code : "" })); gesendet = { x: NaN, y: NaN, t: 0, l: -1 }; };
  s.onmessage = (ev) => { let m: { t: string; [k: string]: unknown }; try { m = JSON.parse(String(ev.data)); } catch { return; }
    if (m.t === "ich") { ich = m as unknown as Ich; heldMerken(ich.held); if (hand.ich) hand.ich(ich); }
    else if (m.t === "spieler") { fremde = m.liste as Fremder[]; online = Number(m.online) || fremde.length + 1; if (hand.spieler) hand.spieler(fremde); window.dispatchEvent(new CustomEvent("ez-welt-spieler")); }
    else if (m.t === "fort") { fremde = fremde.filter((f) => f.i !== Number(m.id)); if (hand.fort) hand.fort(Number(m.id)); }
    else if (m.t === "chat") { const n = { kanal: (m.kanal as Kanal) || "oeffentlich", von: m.von as string | undefined, an: m.an as string | undefined, i: typeof m.i === "number" ? m.i : undefined, text: String(m.text || ""), zeit: Number(m.zeit) || Date.now() };
      chatDazu(n); if (n.kanal === "oeffentlich" && n.i !== undefined && hand.blase) hand.blase(n.i, n.text); } };
  s.onclose = (ev) => { if (ws !== s) return; ws = null; if (ev.code === 4409) { chatSystem("Du bist an einem anderen Gerät unterwegs."); return; } if (ev.code === 4401 && ev.reason === "keine anmeldung") { /* die Seite war zu beschäftigt (Laden der 3D-Welt) und hat sich nicht rechtzeitig angemeldet: gleich neu */ setTimeout(() => { if (!ws) void verbinden(); }, 1500); return; } if (ev.code === 4401 || ev.code === 4400) return;   /* 4400: diesen Ort kennt der Server (noch) nicht – nicht endlos neu verbinden */
    const warte = Math.min(30000, 2000 * 2 ** versuch++); setTimeout(() => { if (!ws) void verbinden(); }, warte); };
}
const senden = (m: object) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(m)); };
/** Eigene Position melden (gedrosselt: bei Bewegung höchstens 6-mal je Sekunde, sonst alle 2 Sekunden) */
export function weltPos(x: number, y: number, blick: number, laeuft: boolean, wx?: number, wy?: number): void { const j = performance.now(), g = gesendet, l = laeuft ? 1 : 0; /* wx, wy: Weltfelder – der Server merkt sich die Stelle fürs nächste Anmelden */
  if ((Math.hypot(x - g.x, y - g.y) > 2 || l !== g.l) && j - g.t > 160 || j - g.t > 2000) { gesendet = { x, y, t: j, l }; senden({ t: "pos", x, y, b: blick, l, ...(wx !== undefined && wy !== undefined ? { wx: Math.round(wx * 100) / 100, wy: Math.round(wy * 100) / 100 } : {}) }); } }
export function weltLeben(lp: number, max: number): void { senden({ t: "leben", lp, max }); }
/** Helden wechseln – nur in der Waldmark (der Server prüft das) */
export function weltHeld(held: string): void { heldMerken(held); senden({ t: "held", held }); }

/* ---------- Der aktive Held: einer je Spieler, auch ohne Konto lokal gemerkt ---------- */
export function lokalerHeld(): string { try { const h = localStorage.getItem("ez_held") || ""; if (HELDEN[h]) return h; const t = JSON.parse(localStorage.getItem("ez_team") || "null"); if (t && HELDEN[t.held]) return t.held; } catch { /* privat */ } return HELDENREIHE[0]; }
function heldMerken(h: string) { if (!HELDEN[h]) return; try { localStorage.setItem("ez_held", h); localStorage.setItem("ez_team", JSON.stringify({ held: h, mit: [] })); } catch { /* privat */ } }

/* ---------- Chat ---------- */
const NAMEN: Record<string, string> = { alle: "Alle", oeffentlich: "Öffentlich", gruppe: "Gruppe", system: "System" };
let reiter = "alle";
export function chatSystem(text: string): void { chatDazu({ kanal: "system", text, zeit: Date.now() }); }
function chatDazu(m: (typeof nachrichten)[number]) { nachrichten.push(m); if (nachrichten.length > 120) nachrichten.shift(); zeichnen(); }
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
function zeichnen() { const liste = document.querySelector("#ez-chat .liste"); if (!liste) return;
  const zeige = nachrichten.filter((m) => reiter === "alle" || m.kanal === reiter);
  liste.innerHTML = zeige.slice(-60).map((m) => { const d = new Date(m.zeit), z = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    return `<p class="k-${m.kanal}"><time>[${z}]</time> ${m.kanal === "fluestern" ? `<b>${esc(m.von || "")} → ${esc(m.an || "")}:</b> ` : m.von ? `<b>${esc(m.von)}:</b> ` : ""}${esc(m.text)}</p>`; }).join("") || `<p class="leer">Noch keine Nachrichten.</p>`;
  liste.scrollTop = liste.scrollHeight; }
/** Das Chatfenster (unten in der Mitte); auf dem Handy einklappbar */
export function chatAnzeigen(): void {
  if (document.getElementById("ez-chat")) return; const c = document.createElement("div"); c.id = "ez-chat"; c.className = "ez-chat";
  c.innerHTML = `<div class="reiter">${Object.entries(NAMEN).map(([k, v]) => `<button type="button" data-k="${k}" class="${k === reiter ? "an" : ""}">${v}</button>`).join("")}<button type="button" class="klapp" aria-label="Chat ein- oder ausklappen">▾</button></div>
    <div class="liste" aria-live="polite"></div><form class="eingabe"><select aria-label="Kanal"><option value="oeffentlich">Öffentlich</option><option value="gruppe">Gruppe</option></select><input type="text" maxlength="160" placeholder="Nachricht eingeben …" autocomplete="off"><button type="submit" aria-label="Senden">➤</button></form>`;
  document.body.appendChild(c); for (const ev of ["keydown", "keyup", "pointerdown"]) c.addEventListener(ev, (e) => e.stopPropagation()); /* Tippen steuert nicht den Helden */
  c.querySelectorAll<HTMLButtonElement>(".reiter button[data-k]").forEach((b) => b.onclick = () => { reiter = b.dataset.k as string; c.querySelectorAll(".reiter button").forEach((x) => x.classList.toggle("an", x === b)); zeichnen(); });
  (c.querySelector(".klapp") as HTMLElement).onclick = () => c.classList.toggle("zu");
  if (window.matchMedia("(max-width: 700px), (max-height: 500px)").matches) c.classList.add("zu");
  const f = c.querySelector("form") as HTMLFormElement, inp = c.querySelector("input") as HTMLInputElement, sel = c.querySelector("select") as HTMLSelectElement;
  f.onsubmit = (e) => { e.preventDefault(); const t = inp.value.trim(); if (!t) return; if (!ws || ws.readyState !== 1) { chatSystem("Nicht verbunden – Nachricht nicht gesendet."); return; } if (ich && ich.gast) { chatSystem("Zum Schreiben brauchst du ein Konto (Menü → Anmelden)."); return; }
    if (sel.value === "fluestern" && fluesterZiel) senden({ t: "chat", kanal: "fluestern", an: fluesterZiel.id, text: t }); else senden({ t: "chat", kanal: sel.value === "gruppe" ? "gruppe" : "oeffentlich", text: t }); inp.value = ""; };
  window.addEventListener("keydown", (e) => { if (e.key === "Enter" && document.activeElement !== inp && !(e.target instanceof HTMLInputElement)) { c.classList.remove("zu"); inp.focus(); } });
  zeichnen(); }

/** Flüstern: die nächste Nachricht geht nur an diesen Spieler (Auswahl im Chat bleibt, bis man sie umstellt) */
let fluesterZiel: { id: number; name: string } | null = null;
export function fluestern(id: number, name: string): void { chatAnzeigen(); fluesterZiel = { id, name }; const c = document.getElementById("ez-chat"); if (!c) return; c.classList.remove("zu");
  const sel = c.querySelector("select") as HTMLSelectElement; let o = sel.querySelector('option[value="fluestern"]') as HTMLOptionElement | null; if (!o) { o = document.createElement("option"); o.value = "fluestern"; sel.appendChild(o); }
  o.textContent = "→ " + name; sel.value = "fluestern"; (c.querySelector("input") as HTMLInputElement).focus(); }

/* ---------- Spielerkarte und Spielerliste ---------- */
const $t = (s: string) => document.querySelector(s) as HTMLElement;
function tafelZeigen(klasse: string, html: string, zu: () => void): HTMLElement { const f = $t("#ez-konto"); f.hidden = false;
  const schliessen = () => { removeEventListener("keydown", esc2, true); f.hidden = true; f.innerHTML = ""; f.onclick = null; zu(); };
  const esc2 = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); schliessen(); } }; addEventListener("keydown", esc2, true);
  f.innerHTML = `<div class="tafel ${klasse}"><i class="ecke a"></i><i class="ecke b"></i><i class="ecke c"></i><i class="ecke d"></i><button type="button" class="schliessen" data-t="zu" aria-label="Schließen">✕</button>${html}</div>`;
  f.onpointerdown = (e) => e.stopPropagation(); f.onkeydown = (e) => e.stopPropagation(); f.onkeyup = (e) => e.stopPropagation();
  f.onclick = (e) => { const t = (e.target as HTMLElement).closest("[data-t]") as HTMLElement | null; if (e.target === f || (t && t.dataset.t === "zu")) { schliessen(); return; } if (t && t.dataset.t === "fl") { const id = Number(t.dataset.id), n = t.dataset.n || ""; schliessen(); fluestern(id, n); } if (t && t.dataset.t === "karte") { schliessen(); const d = fremde.find((x) => x.i === Number(t.dataset.id)); if (d) spielerKarte(d, zu); } };
  return f; }
/** Ein anderer Spieler angeklickt: Name, Held, Stufe – und Flüstern */
export function spielerKarte(d: Fremder, zu: () => void): void { const D = HELDEN[d.h] || HELDEN.schildwaechter, gast = !d.s, darf = !gast && Boolean(ich && !ich.gast);
  tafelZeigen("spieler", `<div class="skopf"><img src="../${D.bild}" alt=""><div><h2>${esc(d.n)}</h2><small>${gast ? "Gast" : `Stufe ${d.s}`} · ${D.name}, ${D.klasse}</small></div></div><div class="zier"></div>
    ${d.max ? `<p class="klein">Leben ${d.lp} / ${d.max}</p>` : ""}<div class="reihe">${darf ? `<button type="button" class="haupt" data-t="fl" data-id="${d.i}" data-n="${esc(d.n)}">Flüstern</button>` : `<p class="klein">${gast ? "Gäste können keine Nachrichten empfangen." : "Zum Flüstern brauchst du ein Konto."}</p>`}</div>`, zu); }
/** Wer ist hier? Alle Spieler am Ort, mit Held und Stufe */
export function spielerListe(zu: () => void): void {
  const ichZeile = ich ? `<li class="ich"><img src="../${(HELDEN[ich.held] || HELDEN.schildwaechter).bild}" alt=""><b>${esc(ich.name)}</b><small>${ich.gast ? "Gast" : "Lv " + ich.stufe} · ${(HELDEN[ich.held] || HELDEN.schildwaechter).name} (du)</small></li>` : "";
  const zeilen = fremde.map((d) => `<li><button type="button" data-t="karte" data-id="${d.i}"><img src="../${(HELDEN[d.h] || HELDEN.schildwaechter).bild}" alt=""><b>${esc(d.n)}</b><small>${d.s ? "St. " + d.s : "Gast"} · ${(HELDEN[d.h] || HELDEN.schildwaechter).name}</small></button></li>`).join("");
  tafelZeigen("spielerliste", `<h2>Spieler hier</h2><div class="zier"></div><p class="klein">${ws ? `${fremde.length + (ich ? 1 : 0)} hier · ${Math.max(online, fremde.length + 1)} in den Splitterlanden unterwegs` : "Nicht mit dem Spielserver verbunden."}</p><ul class="sliste">${ichZeile}${zeilen || (ws ? `<li class="leer">Gerade niemand außer dir.</li>` : "")}</ul>`, zu); }

/* ---------- Sprechblasen über den Köpfen ---------- */
/** Eine Sprechblase, die einem Punkt folgt (wo: Bildschirmkoordinaten der Szene, jeden Frame neu) und nach einigen Sekunden verschwindet */
export function sprechblase(scene: Phaser.Scene, wo: () => { x: number; y: number } | null, text: string): void {
  const t = text.length > 60 ? text.slice(0, 58) + "…" : text, b = scene.add.text(0, 0, t, { fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#2a2014", backgroundColor: "#f3e6c4", padding: { x: 8, y: 5 }, wordWrap: { width: 190 }, align: "center" }).setOrigin(0.5, 1).setResolution(2).setDepth(99990);
  const alt = (scene as unknown as { __blasen?: Phaser.GameObjects.Text[] }).__blasen || []; (scene as unknown as { __blasen: Phaser.GameObjects.Text[] }).__blasen = alt;
  const folge = () => { const p = wo(); if (!p) { weg(); return; } b.setPosition(p.x, p.y); }; const weg = () => { scene.events.off("update", folge); b.destroy(); const i = alt.indexOf(b); if (i >= 0) alt.splice(i, 1); };
  folge(); scene.events.on("update", folge); alt.push(b); scene.time.delayedCall(Math.min(9000, 3500 + t.length * 60), weg); }

/* ---------- Andere Spieler in einer Szene ---------- */
/** Alle Heldenbilder laden (für Mitspieler) – im preload einer Szene aufrufen */
export function heldenLaden(scene: Phaser.Scene): void { for (const k of HELDENREIHE) { const D = HELDEN[k]; if (D.figur && !scene.textures.exists("figur-" + k)) scene.load.image("figur-" + k, "../" + D.figur); if (D.lauf && !scene.textures.exists("lauf-" + k)) scene.load.spritesheet("lauf-" + k, "../" + D.lauf, { frameWidth: 176, frameHeight: 176 }); } }
interface Figur { sp: Phaser.GameObjects.Sprite; nm: Phaser.GameObjects.Text; lb: Phaser.GameObjects.Graphics; d: Fremder; x: number; y: number; laeuft: boolean; held: string; a: string }
/** Mitspieler darstellen: f = Bildmaßstab der Szenenkoordinaten, gross = Körperhöhe am Bildschirm, tiefe = Zeichentiefe zu einer y-Koordinate */
export class Mitspieler {
  figuren = new Map<number, Figur>();
  constructor(private scene: Phaser.Scene, private o: { f: number; gross: number; tiefe: (y: number) => number; auslassen?: (name: string) => boolean; karte?: { breit: number; hoch: number }; /** Verschiebung in Bildpunkten (offene Welt: Ursprung der Region) */ versatz?: { x: number; y: number } }) {}
  /** Welcher Mitspieler liegt unter dem Zeiger? (Liste der getroffenen Objekte, z. B. aus input.hitTestPointer) */
  unter(treffer: Phaser.GameObjects.GameObject[]): Fremder | null { for (const f of this.figuren.values()) if (treffer.includes(f.sp)) return f.d; return null; }
  /** Sprechblase über einem Mitspieler */
  blase(id: number, text: string): void { const f = this.figuren.get(id); if (!f) return; sprechblase(this.scene, () => (this.figuren.get(id) === f ? { x: f.sp.x, y: f.sp.y - this.o.gross - 30 } : null), text); }
  liste(l: Fremder[]): void { const da = new Set<number>();
    for (const d of l) { if (this.o.auslassen && this.o.auslassen(d.n)) continue; da.add(d.i); let f = this.figuren.get(d.i);
      if (!f || f.held !== d.h || f.a !== (d.a ? aussehenSchluessel(d.a) : "")) { if (f) this.weg(d.i); f = this.neu(d); } f.d = d; }
    for (const id of [...this.figuren.keys()]) if (!da.has(id)) this.weg(id); }
  weg(id: number): void { const f = this.figuren.get(id); if (!f) return; f.sp.destroy(); f.nm.destroy(); f.lb.destroy(); this.figuren.delete(id); const u = document.querySelector(`#ez-karte u[data-sp="${id}"]`); if (u) u.remove(); }
  private neu(d: Fremder): Figur { const D = HELDEN[d.h] || HELDEN.schildwaechter, fu = D.fuss || [0.5, 0.94], s = this.scene;
    const v = this.o.versatz || { x: 0, y: 0 }, eigen = d.a ? heldPruefen(d.a) : null, sp = heldenFigur(s, d.x * this.o.f + v.x, d.y * this.o.f + v.y, d.h, this.o.gross, undefined, eigen).setOrigin(fu[0], fu[1]); sp.setScale(this.o.gross * (D.gross || 1) / sp.height); sp.setInteractive({ useHandCursor: true });
    const nm = s.add.text(0, 0, "", { fontFamily: "Cinzel, Georgia, serif", fontSize: "14px", color: "#f3e3b5", stroke: "#000", strokeThickness: 4 }).setOrigin(0.5, 1).setResolution(2).setDepth(99980);
    if (D.lauf && !s.anims.exists("lauf-" + d.h)) s.anims.create({ key: "lauf-" + d.h, frames: s.anims.generateFrameNumbers("lauf-" + d.h, {}), frameRate: 11, repeat: -1 });
    const f: Figur = { sp, nm, lb: s.add.graphics().setDepth(99979), d, x: d.x, y: d.y, laeuft: false, held: d.h, a: eigen ? aussehenSchluessel(eigen) : "" }; this.figuren.set(d.i, f); return f; }
  /** Jeden Frame: weich zur gemeldeten Stelle, Namensschild mit Stufe, Lebensbalken wenn verletzt oder im Kampf */
  schritt(dt: number): void { for (const f of this.figuren.values()) { const d = f.d, D = HELDEN[f.held] || HELDEN.schildwaechter, k = Math.min(1, dt * 10);
    f.x += (d.x - f.x) * k; f.y += (d.y - f.y) * k; const v = this.o.versatz || { x: 0, y: 0 }, x = f.x * this.o.f + v.x, y = f.y * this.o.f + v.y, g = this.o.gross;
    f.sp.setPosition(x, y + 3).setDepth(this.o.tiefe(f.y)); richten(f.sp, Math.cos(d.b), Math.sin(d.b)); if (Math.abs(Math.cos(d.b)) > 0.25) f.sp.setFlipX(Math.cos(d.b) < 0);
    const l = Boolean(d.l); if (l !== f.laeuft && D.lauf) { f.laeuft = l; if (l) { const L = D.laufMass || [0.5, 0.946, 0.91]; f.sp.play("lauf-" + f.held); f.sp.setOrigin(L[0], L[1]).setScale(g / (L[2] * 176)); } else { const fu = D.fuss || [0.5, 0.94]; f.sp.stop(); f.sp.setTexture("figur-" + f.held); f.sp.setOrigin(fu[0], fu[1]).setScale(g * (D.gross || 1) / f.sp.height); } }
    const text = d.s ? `${d.n} · Lv ${d.s}` : d.n; if (f.nm.text !== text) f.nm.setText(text); f.nm.setPosition(x, y - g - 12);
    if (this.o.karte) { let u = document.querySelector(`#ez-karte u[data-sp="${d.i}"]`) as HTMLElement | null; const k = document.getElementById("ez-karte"); if (!u && k) { u = document.createElement("u"); u.className = "freund"; u.dataset.sp = String(d.i); k.appendChild(u); }
      if (u) { u.title = d.n; u.style.left = (100 * f.x / this.o.karte.breit) + "%"; u.style.top = (100 * f.y / this.o.karte.hoch) + "%"; } }
    f.lb.clear(); if (d.max && d.lp !== undefined) { const w = 54, a = Math.max(0, Math.min(1, d.lp / d.max)); f.lb.fillStyle(0x000000, 0.7).fillRect(x - w / 2 - 1, y - g - 10, w + 2, 7).fillStyle(a > 0.5 ? 0x5fc35a : a > 0.25 ? 0xe0b040 : 0xd04a3a, 1).fillRect(x - w / 2, y - g - 9, w * a, 5); } } }
}
/* Für Prüfungen im Browser */
(window as unknown as Record<string, unknown>).EZW = { ich: () => ich, chat: () => nachrichten.slice(), held: weltHeld, spieler: weltSpieler };
