/*
 * Mythara Echtzeit – die gemeinsame Welt im Client: andere Spieler sehen (Name, Stufe, Leben), Chat, aktiver Held.
 * Verbindung zum Spielserver mit ?welt=1&ort=<ort> (nur mit Spielerkonto). Name, Held und Stufe bestimmt der Server.
 * Den Helden wechselt man nur in der Waldmark – der Server lehnt den Wechsel anderswo ab.
 */
import Phaser from "phaser";
import { HELDEN, HELDENREIHE } from "../../shared/config";
import { kontoName, kontoToken } from "./konto";
import { gruppe, serverAdresse } from "./gruppe";

export interface Fremder { i: number; n: string; h: string; s: number; x: number; y: number; b: number; l: number; lp?: number; max?: number }
export interface Ich { id: number; name: string; held: string; stufe: number; ort: string; festerHeld?: boolean }
type Kanal = "oeffentlich" | "gruppe" | "system";
interface Hand { spieler?(l: Fremder[]): void; fort?(id: number): void; ich?(i: Ich): void }
let ws: WebSocket | null = null, ich: Ich | null = null, hand: Hand = {}, ort = "", versuch = 0, gesendet = { x: NaN, y: NaN, t: 0, l: -1 };
const nachrichten: { kanal: Kanal; von?: string; text: string; zeit: number }[] = [];
export const weltIch = (): Ich | null => ich;

/** Die Welt betreten (je Seite einmal). Ohne Konto oder ohne Server: nur der Chat zeigt einen Hinweis. */
export function weltBetreten(o: string, h: Hand): void { const schon = ws && ort === o; ort = o; hand = h; chatAnzeigen(); if (schon) return;
  if (!kontoName()) { chatSystem("Mit einem Konto siehst du andere Spieler und kannst schreiben."); return; }
  if (!serverAdresse()) { chatSystem("Ohne Spielserver bist du allein unterwegs."); return; } void verbinden(); }
async function verbinden() {
  const token = await kontoToken(); if (!token) return; const g = gruppe();
  const s = new WebSocket(serverAdresse() + "?welt=1&ort=" + encodeURIComponent(ort)); ws = s;
  s.onopen = () => { versuch = 0; s.send(JSON.stringify({ t: "anmeldung", token, held: lokalerHeld(), raum: g ? g.code : "" })); gesendet = { x: NaN, y: NaN, t: 0, l: -1 }; };
  s.onmessage = (ev) => { let m: { t: string; [k: string]: unknown }; try { m = JSON.parse(String(ev.data)); } catch { return; }
    if (m.t === "ich") { ich = m as unknown as Ich; heldMerken(ich.held); if (hand.ich) hand.ich(ich); }
    else if (m.t === "spieler" && hand.spieler) hand.spieler(m.liste as Fremder[]);
    else if (m.t === "fort" && hand.fort) hand.fort(Number(m.id));
    else if (m.t === "chat") chatDazu({ kanal: (m.kanal as Kanal) || "oeffentlich", von: m.von as string | undefined, text: String(m.text || ""), zeit: Number(m.zeit) || Date.now() }); };
  s.onclose = (ev) => { if (ws !== s) return; ws = null; if (ev.code === 4409) { chatSystem("Du bist an einem anderen Gerät unterwegs."); return; } if (ev.code === 4401) return;
    const warte = Math.min(30000, 2000 * 2 ** versuch++); setTimeout(() => { if (!ws) void verbinden(); }, warte); };
}
const senden = (m: object) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(m)); };
/** Eigene Position melden (gedrosselt: bei Bewegung höchstens 6-mal je Sekunde, sonst alle 2 Sekunden) */
export function weltPos(x: number, y: number, blick: number, laeuft: boolean): void { const j = performance.now(), g = gesendet, l = laeuft ? 1 : 0;
  if ((Math.hypot(x - g.x, y - g.y) > 2 || l !== g.l) && j - g.t > 160 || j - g.t > 2000) { gesendet = { x, y, t: j, l }; senden({ t: "pos", x, y, b: blick, l }); } }
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
    return `<p class="k-${m.kanal}"><time>[${z}]</time> ${m.von ? `<b>${esc(m.von)}:</b> ` : ""}${esc(m.text)}</p>`; }).join("") || `<p class="leer">Noch keine Nachrichten.</p>`;
  liste.scrollTop = liste.scrollHeight; }
/** Das Chatfenster (unten in der Mitte); auf dem Handy einklappbar */
export function chatAnzeigen(): void {
  if (document.getElementById("ez-chat")) return; const c = document.createElement("div"); c.id = "ez-chat"; c.className = "ez-chat";
  c.innerHTML = `<div class="reiter">${Object.entries(NAMEN).map(([k, v]) => `<button type="button" data-k="${k}" class="${k === reiter ? "an" : ""}">${v}</button>`).join("")}<button type="button" class="klapp" aria-label="Chat ein- oder ausklappen">▾</button></div>
    <div class="liste" aria-live="polite"></div><form class="eingabe"><select aria-label="Kanal"><option value="oeffentlich">Öffentlich</option><option value="gruppe">Gruppe</option></select><input type="text" maxlength="160" placeholder="Nachricht eingeben …" autocomplete="off"><button type="submit" aria-label="Senden">➤</button></form>`;
  document.body.appendChild(c); for (const ev of ["keydown", "keyup", "pointerdown"]) c.addEventListener(ev, (e) => e.stopPropagation()); /* Tippen steuert nicht den Helden */
  c.querySelectorAll<HTMLButtonElement>(".reiter button[data-k]").forEach((b) => b.onclick = () => { reiter = b.dataset.k as string; c.querySelectorAll(".reiter button").forEach((x) => x.classList.toggle("an", x === b)); zeichnen(); });
  (c.querySelector(".klapp") as HTMLElement).onclick = () => c.classList.toggle("zu");
  if (window.matchMedia("(max-width: 700px)").matches) c.classList.add("zu");
  const f = c.querySelector("form") as HTMLFormElement, inp = c.querySelector("input") as HTMLInputElement, sel = c.querySelector("select") as HTMLSelectElement;
  f.onsubmit = (e) => { e.preventDefault(); const t = inp.value.trim(); if (!t) return; if (!ws || ws.readyState !== 1) { chatSystem("Nicht verbunden – Nachricht nicht gesendet."); return; } senden({ t: "chat", kanal: sel.value, text: t }); inp.value = ""; };
  window.addEventListener("keydown", (e) => { if (e.key === "Enter" && document.activeElement !== inp && !(e.target instanceof HTMLInputElement)) { c.classList.remove("zu"); inp.focus(); } });
  zeichnen(); }

/* ---------- Andere Spieler in einer Szene ---------- */
/** Alle Heldenbilder laden (für Mitspieler) – im preload einer Szene aufrufen */
export function heldenLaden(scene: Phaser.Scene): void { for (const k of HELDENREIHE) { const D = HELDEN[k]; if (D.figur && !scene.textures.exists("figur-" + k)) scene.load.image("figur-" + k, "../" + D.figur); if (D.lauf && !scene.textures.exists("lauf-" + k)) scene.load.spritesheet("lauf-" + k, "../" + D.lauf, { frameWidth: 176, frameHeight: 176 }); } }
interface Figur { sp: Phaser.GameObjects.Sprite; nm: Phaser.GameObjects.Text; lb: Phaser.GameObjects.Graphics; d: Fremder; x: number; y: number; laeuft: boolean; held: string }
/** Mitspieler darstellen: f = Bildmaßstab der Szenenkoordinaten, gross = Körperhöhe am Bildschirm, tiefe = Zeichentiefe zu einer y-Koordinate */
export class Mitspieler {
  figuren = new Map<number, Figur>();
  constructor(private scene: Phaser.Scene, private o: { f: number; gross: number; tiefe: (y: number) => number; auslassen?: (name: string) => boolean }) {}
  liste(l: Fremder[]): void { const da = new Set<number>();
    for (const d of l) { if (this.o.auslassen && this.o.auslassen(d.n)) continue; da.add(d.i); let f = this.figuren.get(d.i);
      if (!f || f.held !== d.h) { if (f) this.weg(d.i); f = this.neu(d); } f.d = d; }
    for (const id of [...this.figuren.keys()]) if (!da.has(id)) this.weg(id); }
  weg(id: number): void { const f = this.figuren.get(id); if (!f) return; f.sp.destroy(); f.nm.destroy(); f.lb.destroy(); this.figuren.delete(id); }
  private neu(d: Fremder): Figur { const D = HELDEN[d.h] || HELDEN.schildwaechter, fu = D.fuss || [0.5, 0.94], s = this.scene;
    const sp = s.add.sprite(d.x * this.o.f, d.y * this.o.f, "figur-" + d.h).setOrigin(fu[0], fu[1]); sp.setScale(this.o.gross * (D.gross || 1) / sp.height);
    const nm = s.add.text(0, 0, "", { fontFamily: "Cinzel, Georgia, serif", fontSize: "14px", color: "#f3e3b5", stroke: "#000", strokeThickness: 4 }).setOrigin(0.5, 1).setResolution(2).setDepth(99980);
    if (D.lauf && !s.anims.exists("lauf-" + d.h)) s.anims.create({ key: "lauf-" + d.h, frames: s.anims.generateFrameNumbers("lauf-" + d.h, {}), frameRate: 11, repeat: -1 });
    const f: Figur = { sp, nm, lb: s.add.graphics().setDepth(99979), d, x: d.x, y: d.y, laeuft: false, held: d.h }; this.figuren.set(d.i, f); return f; }
  /** Jeden Frame: weich zur gemeldeten Stelle, Namensschild mit Stufe, Lebensbalken wenn verletzt oder im Kampf */
  schritt(dt: number): void { for (const f of this.figuren.values()) { const d = f.d, D = HELDEN[f.held] || HELDEN.schildwaechter, k = Math.min(1, dt * 10);
    f.x += (d.x - f.x) * k; f.y += (d.y - f.y) * k; const x = f.x * this.o.f, y = f.y * this.o.f, g = this.o.gross;
    f.sp.setPosition(x, y + 3).setDepth(this.o.tiefe(f.y)); if (Math.abs(Math.cos(d.b)) > 0.25) f.sp.setFlipX(Math.cos(d.b) < 0);
    const l = Boolean(d.l); if (l !== f.laeuft && D.lauf) { f.laeuft = l; if (l) { const L = D.laufMass || [0.5, 0.946, 0.91]; f.sp.play("lauf-" + f.held); f.sp.setOrigin(L[0], L[1]).setScale(g / (L[2] * 176)); } else { const fu = D.fuss || [0.5, 0.94]; f.sp.stop(); f.sp.setTexture("figur-" + f.held); f.sp.setOrigin(fu[0], fu[1]).setScale(g * (D.gross || 1) / f.sp.height); } }
    const text = `${d.n} · St. ${d.s}`; if (f.nm.text !== text) f.nm.setText(text); f.nm.setPosition(x, y - g - 12);
    f.lb.clear(); if (d.max && d.lp !== undefined) { const w = 54, a = Math.max(0, Math.min(1, d.lp / d.max)); f.lb.fillStyle(0x000000, 0.7).fillRect(x - w / 2 - 1, y - g - 10, w + 2, 7).fillStyle(a > 0.5 ? 0x5fc35a : a > 0.25 ? 0xe0b040 : 0xd04a3a, 1).fillRect(x - w / 2, y - g - 9, w * a, 5); } } }
}
/* Für Prüfungen im Browser */
(window as unknown as Record<string, unknown>).EZW = { ich: () => ich, chat: () => nachrichten.slice(), held: weltHeld };
