/*
 * Riftmere – Bosse, Instanzen und Türen als Daten (Regeln und Felder: shared/boss.ts). Diese Liste pflegt die Rolle Integration.
 * Server (Simulation) und Browser lesen sie gleich.
 *
 * Beispiel (Hauptmann Rotmantel laut doku/konzepte/phase-4.md, sobald MONSTER.rotmantel existiert):
 *   BOSSE.rotmantel = { typ: "rotmantel", phasen: [
 *     { ab: 1, ansagen: [{ name: "Rundumschlag", alle: 5, felder: "rundum", schaden: [8, 14] }] },
 *     { ab: 0.5, text: "Rotmantel ruft nach seinen Leuten!", ruf: { art: "bandit_schlaeger", n: 2 },
 *       ansagen: [{ name: "Rundumschlag", alle: 3, felder: "rundum", schaden: [8, 14] }],
 *       heilorte: [{ x: 10450.5, y: 9610.5, r: 2, menge: 0.3, unter: 0.5, text: "trinkt einen Heiltrank" }] } ] };
 *   INSTANZEN: { id: "rotmantel_kammer", name: "Die Kammer des Anführers", feld: [10432, 9600, 10463, 9631], schalter: "rotmantel_instanz",
 *     gegner: [{ art: "rotmantel", x: 10448.5, y: 9612.5 }] }
 *   TUEREN: { id: "beutelager", feld: [10270, 9644, 10275, 9644], schalter: "beutelager_offen", zu: "Die Tür ist verschlossen. Jemand in der Wachstube hat den Schlüssel." }
 */
import type { BossDef, InstanzDef, Tuer } from "./boss";

export const BOSSE: Record<string, BossDef> = {};
export const INSTANZEN: InstanzDef[] = [];
export const TUEREN: Tuer[] = [];

/* Phase 7 (#40, D2): die Wappentür des Turms am Ostufer – offen mit dem Schalter wappentuer_offen (D2 setzt ihn ab dem Schritt „tuer“) */
TUEREN.push({ id: "turm_wappentuer", feld: [6840, 6519, 6840, 6519], schalter: "wappentuer_offen", eingang: "turm_wappentuer",
  zu: "Die Tür trägt ein Wappen – ein Turm über drei Wellen. Sie ist verschlossen. Vielleicht weiß jemand in Graufurt, wer hier hineindarf." });

/* ───────── Phase 8 (#58, E4): der Graue Hauptmann in seiner Gruft (Region hauptmann_gruft, Weltfelder 11200…11231 × 9600…9631) ─────────
   Ruft Wiedergänger, später Ansage über die Gruft mit Deckung hinter den Grabsteinen. Instanz je Spieler, solange „hauptmann_gruft“ an ist (E4). */
BOSSE.grauer_hauptmann = { typ: "grauer_hauptmann", phasen: [
  { ab: 1, ansagen: [{ name: "Rundumschlag", alle: 4, felder: "rundum", schaden: [8, 14] }] },
  { ab: 0.6, text: "Der Graue Hauptmann ruft seine Wacht!", ruf: { art: "wiedergaenger", n: 2, text: "Steht auf, Wacht!" }, ansagen: [{ name: "Rundumschlag", alle: 3, felder: "rundum", schaden: [8, 14] }] },
  { ab: 0.3, text: "Ein eisiger Sturm fegt durch die Gruft!", ansagen: [{ name: "Grabessturm", sek: 4, felder: "raum", deckung: true, vorlauf: 2, schaden: [12, 20] }] } ] };
INSTANZEN.push({ id: "hauptmann_gruft", name: "Die Gruft des Grauen Hauptmanns", feld: [11200, 9600, 11231, 9631], schalter: "hauptmann_gruft",
  gegner: [{ art: "grauer_hauptmann", x: 11216.5, y: 9619.5 }], text: "Hinter dir schließt sich die Gruft. Am Sarkophag regt sich etwas Graues." });

/* ───────── Phase 6 (#18): Der Oberste Rabenpriester im Thronsaal (doku/konzepte/phase-6.md „Bosskampf“) ─────────
   Thronsaal = Region rabengrund_thronsaal (Weltfelder 10752…10783 × 9600…9631): Becken (10768, 9615), vier Säulen (±6 Felder), Altar im Norden.
   Instanz je Versuch mit Federsiegel; offen, solange der Schalter „rabenpriester_thronsaal“ an ist (C3 im Schritt Thronsaal, danach Bossing). */
const BECKEN = { x: 10768, y: 9615, r: 4.2, menge: 0.12, unter: 0.55, mal: 2, hingehen: true, dauer: 2, text: "trinkt aus dem Splitterbecken", ausser: "becken_getruebt" };
BOSSE.oberster_rabenpriester = { typ: "oberster_rabenpriester", phasen: [
  { ab: 1, hiebe: 2, heilorte: [BECKEN] },                                                                               /* zwei Schwerter: Doppelhieb */
  { ab: 0.6, text: "Der Oberste erhebt sich über das Becken!", schweben: 15, landen: "landet zwischen den Säulen", ruf: { art: "rabenpriester_akoluth", n: 2, text: "ruft seine Akoluthen!" },
    ansagen: [{ name: "Sturzraben", sek: 3, felder: "ziel", weite: 1, vorlauf: 2, schaden: [8, 14] }], heilorte: [BECKEN] },
  { ab: 0.3, text: "Schwarze Flügel breiten sich über den Saal!", hiebe: 2,
    ansagen: [{ name: "Schwarzer Flügelschlag", sek: 3, felder: "raum", deckung: true, vorlauf: 2, schaden: [15, 25] }], heilorte: [BECKEN] } ] };
INSTANZEN.push({ id: "thronsaal", name: "Der Thronsaal", feld: [10752, 9600, 10783, 9631], schalter: "rabenpriester_thronsaal",
  gegner: [{ art: "oberster_rabenpriester", x: 10768.5, y: 9607.5 }], eintritt: "federsiegel",
  ohne: "Der Altar am Tor bleibt kalt – ohne Federsiegel öffnet sich der Thronsaal nicht.", text: "Das Federsiegel zerfällt zu Asche. Der Thronsaal gehört dir – für diesen Versuch." });
