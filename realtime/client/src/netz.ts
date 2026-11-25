/*
 * Verbindung zur Simulation. Zwei Wege mit derselben Schnittstelle:
 *  - Server: Eingaben gehen per WebSocket hinaus, Zustände kommen zurück (so soll es am Ende immer sein).
 *  - Lokal: Ist kein Server eingerichtet oder nicht erreichbar, rechnet der Browser dieselbe Simulation selbst.
 *    Das ist zum Ausprobieren gedacht; geschützt gegen Schummeln ist nur der Weg über den Server.
 */
import { TICK, ZUSTAND_JE } from "../../shared/config";
import { abmelden, kuerzlichAktiv, beimAbmelden, restAus } from "./abmeldung";
import { Sim, Eingabe, Zustand } from "../../shared/sim";

/** Adresse des Spielservers */
export const SPIELSERVER = "wss://mythara-echtzeit.onrender.com";
/** Den Server vorsorglich wecken (der kostenlose Dienst schläft nach einer Pause): ein einfacher Abruf seiner Startseite. Einmal je Seitenaufruf. */
let geweckt = false;
export function wecken(): void { if (geweckt) return; geweckt = true; try { void fetch(SPIELSERVER.replace(/^wss:/, "https:").replace(/^ws:/, "http:") + "/", { mode: "no-cors", cache: "no-store" }).catch(() => { /* egal */ }); } catch { /* egal */ } }
/** Zonen Stufe 3: Kampf als Kanal über die Welt-Verbindung (welt.ts setzt die Fabrik). null = keine offene Welt-Verbindung – dann wie bisher ein eigener WebSocket. */
let kanalFabrik: ((url: string) => WebSocket | null) | null = null;
export function kanalFabrikSetzen(f: (url: string) => WebSocket | null): void { kanalFabrik = f; }
export interface Netz { art: "server" | "lokal"; sende(e: Eingabe): void; ende(): void; sim?: Sim /* nur ohne Server: für Prüfungen */ }

function lokal(held: string, mit: string[], beiZustand: (z: Zustand) => void): Netz {
  const sim = new Sim(held, (Date.now() & 0x7fffffff) || 1, mit); let n = 0;
  let zuletzt = performance.now(), rest = 0; // nach der echten Zeit rechnen: Hängt der Browser kurz, werden die Schritte nachgeholt (höchstens fünf auf einmal)
  const takt = setInterval(() => { const jetzt = performance.now(); rest = Math.min(rest + jetzt - zuletzt, 5000 / TICK); zuletzt = jetzt; let neu = false; while (rest >= 1000 / TICK) { rest -= 1000 / TICK; sim.schritt(); if (++n % ZUSTAND_JE === 0) neu = true; } if (neu) beiZustand(sim.zustand()); }, 1000 / TICK / 2);
  return { art: "lokal", sende: (e) => sim.eingabe(e), ende: () => clearInterval(takt), sim };
}

/** Verbinden. url leer: sofort lokal. Sonst Server versuchen. Ein kostenloser Server schläft bei Leerlauf ein und braucht bis zu einer Minute zum Aufwachen:
 *  Deshalb wird bis zu 75 Sekunden gewartet (mit Anzeige), erst dann geht es lokal weiter. */
/* erste: eine Nachricht, die gleich nach dem Öffnen geht (Anmeldung für Kampagnenkämpfe). Andere Nachrichten des Servers (z. B. „gutschrift“) kommen als Ereignis „ez-server“ an window. */
export function verbinde(url: string, held: string, mit: string[], beiZustand: (z: Zustand) => void, beiArt: (art: Netz["art"] | "warte", grund: string) => void, erste?: unknown): Promise<Netz> {
  return new Promise((fertig) => {
    if (!url) { beiArt("lokal", "kein Server eingerichtet"); fertig(lokal(held, mit, beiZustand)); return; }
    let erledigt = false, ws: WebSocket;
    let ersatz = (grund: string) => { if (erledigt) return; erledigt = true; try { ws.close(); } catch { /* schon zu */ } beiArt("lokal", grund); fertig(lokal(held, mit, beiZustand)); };
    const beginn = Date.now(), FRIST = 75000; let versuch = 0, spur = ""; /* spur: was beim letzten Versuch geschah – steht im Hinweis, falls es nicht klappt */
    const anzeige = setInterval(() => { if (!erledigt) beiArt("warte", `Server wird geweckt … ${Math.round((Date.now() - beginn) / 1000)} s`); }, 1000);
    const ersatz0 = ersatz; ersatz = (grund: string) => { clearInterval(anzeige); ersatz0(grund); };
    const versuche = () => {
      if (erledigt) return; if (Date.now() - beginn > FRIST) { ersatz("Server antwortet nicht" + (spur ? " [" + versuch + " Versuche, zuletzt: " + spur + "]" : "")); return; } versuch++;
      try { const voll = url + (url.includes("?") ? "&" : "?") + "held=" + encodeURIComponent(held) + "&mit=" + encodeURIComponent(mit.join(",")); ws = (kanalFabrik && kanalFabrik(voll)) || new WebSocket(voll); } catch { ersatz("Serveradresse ungültig"); return; }
      const dieser = ws; let offenGewesen = false, offen = false; const austragen = beimAbmelden(() => dieser.close(1000, "abmelden")); /* Abmelden gibt das Konto frei (sitz.ts) */ dieser.onopen = () => { offen = true; if (erste) dieser.send(JSON.stringify(erste)); };
      dieser.onmessage = (ev) => { let m: { t: string; z?: Zustand }; try { m = JSON.parse(String(ev.data)); } catch { return; }
        if (m.t === "hallo" && !erledigt) { erledigt = true; offenGewesen = true; clearInterval(anzeige); beiArt("server", ""); const puls = setInterval(() => { if (dieser.readyState !== 1) { clearInterval(puls); return; } if (kuerzlichAktiv()) dieser.send('{"t":"da"}'); }, 60000); /* Lebenszeichen gegen die Inaktivität (abmeldung.ts) */ fertig({ art: "server", sende: (e) => { if (dieser.readyState === 1) dieser.send(JSON.stringify(e)); }, ende: () => dieser.close() }); }
        else if (m.t === "z" && m.z) beiZustand(m.z); else window.dispatchEvent(new CustomEvent("ez-server", { detail: m })); };
      dieser.onclose = (ev) => { austragen(); if (ev.code === 4410) { abmelden("bereits", restAus(ev.reason)); return; } if (offenGewesen && ev.code === 4409) { abmelden("anderes"); return; } if (offenGewesen && ev.code === 1000 && ev.reason === "ruhe") { abmelden("ruhe"); return; } /* anderes Gerät / untätig: zur Willkommensseite */ spur = (offen ? "verbunden, dann getrennt" : "keine Verbindung") + ", Code " + ev.code + (ev.reason ? " " + ev.reason : ""); if (!offenGewesen && ev.code >= 4400 && ev.code < 4600) { ersatz(ev.code === 4403 ? "dieser Kampf ist noch nicht freigeschaltet" : ev.code === 4401 ? "Anmeldung vom Server nicht angenommen" : ev.code === 4503 ? "Konto gerade nicht erreichbar" : "Server kennt diesen Kampf nicht"); return; } /* abgelehnt: nicht weiter versuchen */ if (offenGewesen) beiArt("server", "Verbindung getrennt – bitte neu laden"); else if (!erledigt) setTimeout(versuche, Math.min(4000, 800 * versuch)); }; // noch nicht wach: gleich noch einmal
      dieser.onerror = () => { /* onclose folgt */ };
    };
    beiArt("warte", "verbinde mit dem Server …"); versuche();
  });
}
