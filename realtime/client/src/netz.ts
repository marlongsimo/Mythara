/*
 * Verbindung zur Simulation. Zwei Wege mit derselben Schnittstelle:
 *  - Server: Eingaben gehen per WebSocket hinaus, Zustände kommen zurück (so soll es am Ende immer sein).
 *  - Lokal: Ist kein Server eingerichtet oder nicht erreichbar, rechnet der Browser dieselbe Simulation selbst.
 *    Das ist zum Ausprobieren gedacht; geschützt gegen Schummeln ist nur der Weg über den Server.
 */
import { TICK, ZUSTAND_JE } from "../../shared/config";
import { Sim, Eingabe, Zustand } from "../../shared/sim";

export interface Netz { art: "server" | "lokal"; sende(e: Eingabe): void; ende(): void }

function lokal(held: string, beiZustand: (z: Zustand) => void): Netz {
  const sim = new Sim(held, (Date.now() & 0x7fffffff) || 1); let n = 0;
  const takt = setInterval(() => { sim.schritt(); if (++n % ZUSTAND_JE === 0) beiZustand(sim.zustand()); }, 1000 / TICK);
  return { art: "lokal", sende: (e) => sim.eingabe(e), ende: () => clearInterval(takt) };
}

/** Verbinden. url leer: sofort lokal. Sonst Server versuchen; klappt das nicht in 5 Sekunden, lokal weiter. */
export function verbinde(url: string, held: string, beiZustand: (z: Zustand) => void, beiArt: (art: Netz["art"], grund: string) => void): Promise<Netz> {
  return new Promise((fertig) => {
    if (!url) { beiArt("lokal", "kein Server eingerichtet"); fertig(lokal(held, beiZustand)); return; }
    let erledigt = false, ws: WebSocket;
    const ersatz = (grund: string) => { if (erledigt) return; erledigt = true; try { ws.close(); } catch { /* schon zu */ } beiArt("lokal", grund); fertig(lokal(held, beiZustand)); };
    try { ws = new WebSocket(url + (url.includes("?") ? "&" : "?") + "held=" + encodeURIComponent(held)); } catch { ersatz("Serveradresse ungültig"); return; }
    const uhr = setTimeout(() => ersatz("Server antwortet nicht"), 5000);
    ws.onmessage = (ev) => { let m: { t: string; z?: Zustand }; try { m = JSON.parse(String(ev.data)); } catch { return; }
      if (m.t === "hallo" && !erledigt) { erledigt = true; clearTimeout(uhr); beiArt("server", ""); fertig({ art: "server", sende: (e) => { if (ws.readyState === 1) ws.send(JSON.stringify(e)); }, ende: () => ws.close() }); }
      else if (m.t === "z" && m.z) beiZustand(m.z); };
    ws.onerror = () => { clearTimeout(uhr); ersatz("Server nicht erreichbar"); };
    ws.onclose = () => { clearTimeout(uhr); if (!erledigt) ersatz("Server nicht erreichbar"); else beiArt("server", "Verbindung getrennt – bitte neu laden"); };
  });
}
