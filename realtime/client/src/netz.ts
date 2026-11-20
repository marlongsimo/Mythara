/*
 * Verbindung zur Simulation. Zwei Wege mit derselben Schnittstelle:
 *  - Server: Eingaben gehen per WebSocket hinaus, Zustände kommen zurück (so soll es am Ende immer sein).
 *  - Lokal: Ist kein Server eingerichtet oder nicht erreichbar, rechnet der Browser dieselbe Simulation selbst.
 *    Das ist zum Ausprobieren gedacht; geschützt gegen Schummeln ist nur der Weg über den Server.
 */
import { TICK, ZUSTAND_JE } from "../../shared/config";
import { Sim, Eingabe, Zustand } from "../../shared/sim";

export interface Netz { art: "server" | "lokal"; sende(e: Eingabe): void; ende(): void }

function lokal(held: string, mit: string[], beiZustand: (z: Zustand) => void): Netz {
  const sim = new Sim(held, (Date.now() & 0x7fffffff) || 1, mit); let n = 0;
  let zuletzt = performance.now(), rest = 0; // nach der echten Zeit rechnen: Hängt der Browser kurz, werden die Schritte nachgeholt (höchstens fünf auf einmal)
  const takt = setInterval(() => { const jetzt = performance.now(); rest = Math.min(rest + jetzt - zuletzt, 5000 / TICK); zuletzt = jetzt; let neu = false; while (rest >= 1000 / TICK) { rest -= 1000 / TICK; sim.schritt(); if (++n % ZUSTAND_JE === 0) neu = true; } if (neu) beiZustand(sim.zustand()); }, 1000 / TICK / 2);
  return { art: "lokal", sende: (e) => sim.eingabe(e), ende: () => clearInterval(takt) };
}

/** Verbinden. url leer: sofort lokal. Sonst Server versuchen. Ein kostenloser Server schläft bei Leerlauf ein und braucht bis zu einer Minute zum Aufwachen:
 *  Deshalb wird bis zu 75 Sekunden gewartet (mit Anzeige), erst dann geht es lokal weiter. */
export function verbinde(url: string, held: string, mit: string[], beiZustand: (z: Zustand) => void, beiArt: (art: Netz["art"] | "warte", grund: string) => void): Promise<Netz> {
  return new Promise((fertig) => {
    if (!url) { beiArt("lokal", "kein Server eingerichtet"); fertig(lokal(held, mit, beiZustand)); return; }
    let erledigt = false, ws: WebSocket;
    let ersatz = (grund: string) => { if (erledigt) return; erledigt = true; try { ws.close(); } catch { /* schon zu */ } beiArt("lokal", grund); fertig(lokal(held, mit, beiZustand)); };
    const beginn = Date.now(), FRIST = 75000; let versuch = 0;
    const anzeige = setInterval(() => { if (!erledigt) beiArt("warte", `Server wird geweckt … ${Math.round((Date.now() - beginn) / 1000)} s`); }, 1000);
    const ersatz0 = ersatz; ersatz = (grund: string) => { clearInterval(anzeige); ersatz0(grund); };
    const versuche = () => {
      if (erledigt) return; if (Date.now() - beginn > FRIST) { ersatz("Server antwortet nicht"); return; } versuch++;
      try { ws = new WebSocket(url + (url.includes("?") ? "&" : "?") + "held=" + encodeURIComponent(held) + "&mit=" + encodeURIComponent(mit.join(","))); } catch { ersatz("Serveradresse ungültig"); return; }
      const dieser = ws; let offenGewesen = false;
      dieser.onmessage = (ev) => { let m: { t: string; z?: Zustand }; try { m = JSON.parse(String(ev.data)); } catch { return; }
        if (m.t === "hallo" && !erledigt) { erledigt = true; offenGewesen = true; clearInterval(anzeige); beiArt("server", ""); fertig({ art: "server", sende: (e) => { if (dieser.readyState === 1) dieser.send(JSON.stringify(e)); }, ende: () => dieser.close() }); }
        else if (m.t === "z" && m.z) beiZustand(m.z); };
      dieser.onclose = () => { if (offenGewesen) beiArt("server", "Verbindung getrennt – bitte neu laden"); else if (!erledigt) setTimeout(versuche, Math.min(4000, 800 * versuch)); }; // noch nicht wach: gleich noch einmal
      dieser.onerror = () => { /* onclose folgt */ };
    };
    beiArt("warte", "verbinde mit dem Server …"); versuche();
  });
}
