/*
 * Eigenständige Seite für die offene Welt: nur die Szene „Welt“, ohne Anmeldung, Server, Koop und Hauptspiel.
 * Zum Herumlaufen und Ansehen (Entwürfe der World Pipeline). Gebaut und zusammengestellt von werkzeug/welt/seite.mjs.
 *
 * Die Seite enthält ein Element #ez-welt-seite; seine data-Felder stellen ein, wo Bilder und Weltdaten liegen und in welcher Region man beginnt:
 *   data-bild (vor img/…, Grundwert "../") · data-daten (Grundwert "welt/") · data-start (Region)
 */
import Phaser from "phaser";
import { HELDEN, HELDENREIHE } from "../../../shared/config";
import { Welt, WELT } from "./welt";

const $ = (s: string) => document.querySelector(s) as HTMLElement | null;
const E = $("#ez-welt-seite"), d = E ? E.dataset : {};
WELT.bild = d.bild ?? "../"; WELT.daten = d.daten ?? "welt/"; WELT.start = d.start || WELT.start;
const lies = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };

WELT.hud = {
  titel: (name, unter) => { const t = $("#ez-titel"); if (!t) return; (t.querySelector("b") as HTMLElement).textContent = name; (t.querySelector("small") as HTMLElement).textContent = unter; t.hidden = false; },
  profil: (held) => { for (const k of Array.from(document.querySelectorAll<HTMLElement>("#ez-helden button"))) k.setAttribute("aria-pressed", String(k.dataset.held === held)); },
  karte: () => {},
};
/* Ausgänge in Orte und Kämpfe gibt es auf dieser Seite nicht: nur zeigen, wohin es ginge */
WELT.ausgang = (a) => { if (a.nach.art === "welt") return false; const h = $("#ez-dorf-hilfe"); if (h) h.textContent = `${a.text}: Dieser Weg führt aus dem Entwurf hinaus und ist hier noch geschlossen.`; return true; };

/* Heldenwahl: merken und neu beginnen (die Stelle in der Welt bleibt) */
{ const leiste = $("#ez-helden"); const jetzt = HELDEN[lies("ez_held") || ""] ? lies("ez_held") : "schildwaechter";
  if (leiste) for (const k of HELDENREIHE) { const D = HELDEN[k], b = document.createElement("button"); b.type = "button"; b.dataset.held = k; b.textContent = D.name; b.title = `${D.name}, ${D.titel}`; b.setAttribute("aria-pressed", String(k === jetzt));
    b.onclick = () => { if (k === lies("ez_held")) return; try { localStorage.setItem("ez_held", k); } catch { /* privat */ } location.reload(); }; leiste.appendChild(b); } }
/* Neu beginnen: zurück an den Start der Region */
{ const k = $("#ez-neustart"); if (k) k.onclick = () => { try { localStorage.removeItem("ez_welt_pos"); } catch { /* privat */ } location.reload(); }; }

const spiel = new Phaser.Game({ type: Phaser.AUTO, parent: "ez-feld", backgroundColor: "#0a0d08", scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight }, scene: [Welt], input: { activePointers: 3 }, render: { antialias: true } });
/* Der Ladehinweis geht, sobald das erste Bild der Welt gezeichnet ist */
{ let bilder = 0; const fertig = () => { if (spiel.scene.getScenes(true).length && ++bilder >= 2) { spiel.events.off("postrender", fertig); const l = $("#ez-laden"); if (l) l.hidden = true; } }; spiel.events.on("postrender", fertig); }
