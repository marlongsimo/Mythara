/*
 * Mythara Echtzeit – der Spielserver. Er rechnet die Partie (20 Schritte je Sekunde) und schickt Zustände (etwa 10 je Sekunde).
 * Der Client schickt nur Eingaben. Jede Verbindung bekommt in dieser Fassung ihren eigenen Riss (PvE, ein Spieler).
 * Keine Datenbank im Spielschritt: Alles liegt im Arbeitsspeicher. Geheime Schlüssel gehören ausschließlich in die Umgebung dieses Servers.
 */
import { createServer } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { TICK, ZUSTAND_JE, PROTOKOLL, HELDEN, K } from "../../shared/config";
import { Sim, Eingabe } from "../../shared/sim";

const PORT = Number(process.env.PORT) || 8787, MAX = Number(process.env.MAX_SPIELER) || 40, RUHE_MS = 5 * 60 * 1000;
/* Von welchen Seiten aus verbunden werden darf (Komma-getrennt). Leer = alle, nur für Tests gedacht. */
const HERKUNFT = (process.env.ERLAUBTE_HERKUNFT || "https://mythara-dungeon.de,http://localhost:8765").split(",").map((s) => s.trim()).filter(Boolean);

interface Platz { ws: WebSocket; sim: Sim; zuletzt: number; fenster: number; zahl: number }
const plaetze = new Set<Platz>();

const http = createServer((req, res) => { // Lebenszeichen für den Anbieter
  res.writeHead(200, { "content-type": "application/json", "access-control-allow-origin": "*" });
  res.end(JSON.stringify({ ok: true, dienst: "mythara-echtzeit", protokoll: PROTOKOLL, spieler: plaetze.size }));
});
const wss = new WebSocketServer({ server: http, maxPayload: 512, verifyClient: (info: { origin: string }) => !HERKUNFT.length || HERKUNFT.includes(info.origin) });

wss.on("connection", (ws, req) => {
  if (plaetze.size >= MAX) { ws.close(1013, "voll"); return; }
  const url = new URL(req.url || "/", "http://x"), held = url.searchParams.get("held") || "schildwaechter";
  const p: Platz = { ws, sim: new Sim(HELDEN[held] ? held : "schildwaechter", (Date.now() ^ (Math.random() * 1e9)) >>> 0), zuletzt: Date.now(), fenster: Date.now(), zahl: 0 };
  plaetze.add(p); ws.send(JSON.stringify({ t: "hallo", protokoll: PROTOKOLL, tick: TICK }));
  ws.on("message", (roh) => {
    const jetzt = Date.now(); if (jetzt - p.fenster > 1000) { p.fenster = jetzt; p.zahl = 0; } if (++p.zahl > K.EINGABEN_JE_SEK) return; // zu viele Eingaben: verwerfen
    let e: Eingabe; try { e = JSON.parse(String(roh)); } catch { return; } p.zuletzt = jetzt; p.sim.eingabe(e);
  });
  const weg = () => { plaetze.delete(p); }; ws.on("close", weg); ws.on("error", weg);
});

let n = 0;
setInterval(() => {
  n++; const jetzt = Date.now();
  for (const p of plaetze) {
    if (jetzt - p.zuletzt > RUHE_MS) { p.ws.close(1000, "ruhe"); plaetze.delete(p); continue; } // wer lange nichts tut, gibt den Platz frei
    p.sim.schritt();
    if (n % ZUSTAND_JE === 0 && p.ws.readyState === WebSocket.OPEN && p.ws.bufferedAmount < 65536) p.ws.send(JSON.stringify({ t: "z", z: p.sim.zustand() }));
  }
}, 1000 / TICK);

http.listen(PORT, () => console.log(`Mythara Echtzeit läuft auf Port ${PORT} (${TICK} Schritte je Sekunde)`));
