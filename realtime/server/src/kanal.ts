/*
 * Riftmere – Zonen Stufe 3 (25.11.2026): eine Verbindung je Gerät.
 *
 * Die Kampfwelt läuft als Kanal über die Welt-Verbindung (Anwesenheit, Chat, Inventar), statt über eine zweite WebSocket-Verbindung.
 * Rahmen auf der Welt-Verbindung:
 *   „K“  + Text  → Nachricht des Kampfkanals (in beide Richtungen, unverändert)
 *   „K!“ + JSON  → Steuerung: { t: "auf", q: "<Suchteil wie bei der Kampfverbindung>" } öffnet den Kanal (Browser → Server),
 *                  { t: "zu", code, grund } schließt ihn (in beide Richtungen)
 * Ein Kanal verhält sich für die Kampflogik (index.ts) wie ein WebSocket: readyState, send, close, on/once("message" | "close" | "error"),
 * ping, bufferedAmount. Bricht die Welt-Verbindung ab, schließt auch der Kanal. Je Welt-Verbindung ist höchstens ein Kanal offen.
 */
import { EventEmitter } from "events";
import type { WebSocket } from "ws";

const OFFEN = 1, ZU = 3;

export class Kanal extends EventEmitter {
  readyState = OFFEN;
  constructor(private traeger: WebSocket) { super(); }
  get bufferedAmount(): number { return this.traeger.bufferedAmount; }
  send(d: string | Buffer): void { if (this.readyState !== OFFEN || this.traeger.readyState !== OFFEN) return; this.traeger.send("K" + String(d)); }
  ping(): void { /* die Welt-Verbindung hält sich selbst am Leben */ }
  /** Der Server schließt den Kanal (Grund geht an den Browser) */
  close(code = 1000, grund = ""): void { if (this.readyState === ZU) return; this.readyState = ZU;
    try { if (this.traeger.readyState === OFFEN) this.traeger.send("K!" + JSON.stringify({ t: "zu", code, grund })); } catch { /* zu */ }
    this.emit("close", code, Buffer.from(grund)); }
  terminate(): void { this.close(1006, ""); }
  /** Der Browser hat ihn geschlossen oder die Welt-Verbindung ist weg */
  weg(code: number, grund: string): void { if (this.readyState === ZU) return; this.readyState = ZU; this.emit("close", code, Buffer.from(grund)); }
}

/** Kanal-Rahmen einer Welt-Verbindung behandeln. true = es war ein Kanal-Rahmen (die Welt beachtet ihn nicht weiter). */
export function kanalRahmen(traeger: WebSocket, text: string, stand: { k: Kanal | null }, auf: (k: Kanal, q: string) => void): boolean {
  if (text.charCodeAt(0) !== 75 /* K */) return false;
  if (text.charCodeAt(1) === 33 /* ! */) { let m: { t?: string; q?: unknown; code?: unknown; grund?: unknown }; try { m = JSON.parse(text.slice(2)); } catch { return true; }
    if (m.t === "auf" && typeof m.q === "string" && m.q.length < 400) { if (stand.k) stand.k.weg(1000, "neu"); const k = new Kanal(traeger); stand.k = k; k.once("close", () => { if (stand.k === k) stand.k = null; }); auf(k, m.q); }
    else if (m.t === "zu" && stand.k) { const k = stand.k; stand.k = null; k.weg(Number(m.code) || 1000, String(m.grund || "").slice(0, 120)); }
    return true; }
  if (stand.k) stand.k.emit("message", Buffer.from(text.slice(1)));
  return true;
}
