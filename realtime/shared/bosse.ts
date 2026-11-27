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

/* Phase 4 (#16, #60): Hauptmann Rotmantel laut doku/konzepte/phase-4.md – Rundumschlag alle 5 Angriffe, bei 50 % ruft er zwei Schläger,
   danach Rundumschlag alle 3 Angriffe und einmal je Leben ein Heiltrank am Thron (ohne hingehen: man kann ihn vom Thron weglocken). */
const THRON: [number, number] = [10448, 9607.5];
export const BOSSE: Record<string, BossDef> = {
  rotmantel: { typ: "rotmantel", phasen: [
    { ab: 1, ansagen: [{ name: "Rundumschlag", alle: 5, felder: "rundum", schaden: [8, 14] }] },
    { ab: 0.5, text: "Rotmantel ruft nach seinen Leuten!", ruf: { art: "bandit_schlaeger", n: 2, text: "Zwei Schläger stürmen aus dem Gang!" },
      ansagen: [{ name: "Rundumschlag", alle: 3, felder: "rundum", schaden: [8, 14] }],
      heilorte: [{ x: THRON[0], y: THRON[1], r: 2, menge: 0.3, unter: 0.5, text: "Rotmantel greift hinter den Thron und trinkt einen Heiltrank." }] } ] },
};
/* Die Versammlungshalle des Unterschlupfs (Raum halle in werkzeug/welt/unterschlupf.mjs) und die Kammer des Anführers (eigenes Gebiet rotmantel_kammer) */
const H: [number, number] = [10302.5, 9632.5];
export const INSTANZEN: InstanzDef[] = [
  { id: "unterschlupf_halle", name: "Die Versammlungshalle", feld: [10290, 9616, 10315, 9647], schalter: "unterschlupf_halle",
    wellen: [[{ art: "bandit_schlaeger", x: H[0] - 3, y: H[1] - 2 }, { art: "bandit_armbrust", x: H[0] + 3, y: H[1] - 3 }, { art: "bandit_spaeher", x: H[0], y: H[1] + 3 }],
      [{ art: "bandit_schlaeger", x: H[0] - 4, y: H[1] + 2 }, { art: "bandit_schlaeger", x: H[0] + 4, y: H[1] + 2 }, { art: "bandit_armbrust", x: H[0], y: H[1] - 4 }]],
    welle: "unterschlupf_welle", pause: 4, text: "Die Banditen der Halle haben dich bemerkt – sie kommen zu mehreren!" },
  { id: "rotmantel_kammer", name: "Die Kammer des Anführers", feld: [10432, 9600, 10463, 9631], schalter: "rotmantel_instanz",
    gegner: [{ art: "rotmantel", x: 10448.5, y: 9614.5 }], text: "Hauptmann Rotmantel erhebt sich von seinem Thron. „Gesas kleiner Hund. Komm her.“" },
];
/* Die Tür im Gang zum Beutelager (TUER_LAGER in werkzeug/welt/unterschlupf.mjs: Gebietsfelder 30–36 | 44–45) */
export const TUEREN: Tuer[] = [
  { id: "beutelager", feld: [10270, 9644, 10276, 9645], schalter: "beutelager_offen", zu: "Die Tür ist verschlossen. Jemand in der Wachstube hat den Schlüsselbund." },
];

/** Sprünge (Interaktionen mit ziel: Leiter, Loch, Kammertür) nur mit Schalter (Phase 4): sonst steht der Text da, statt dass man hinabsteigt.
 *  B3: das Loch in der Hütte erst, wenn die Kisten gefunden sind; B4: die Kammer des Anführers erst nach der Halle (vorher hält Rotmantels Wache den Gang). */
export const SPRUENGE: Record<string, { schalter: string; zu: string }> = {
  loch_abstieg: { schalter: "leiter_unterschlupf", zu: "Unter den Fässern ist ein Loch im Boden. Was dort unten ist, geht dich noch nichts an – Gisbert wartet auf seine Kisten." },
  kammer_tuer: { schalter: "rotmantel_kammer_offen", zu: "Hinter dem roten Banner liegt die Kammer des Anführers. Erst die Versammlungshalle – sonst hast du die ganze Bande im Rücken." },
};

/* Phase 7 (#40, D2): die Wappentür des Turms am Ostufer – offen mit dem Schalter wappentuer_offen (D2 setzt ihn ab dem Schritt „tuer“) */
TUEREN.push({ id: "turm_wappentuer", feld: [6840, 6519, 6840, 6519], schalter: "wappentuer_offen", eingang: "turm_wappentuer",
  zu: "Die Tür trägt ein Wappen – ein Turm über drei Wellen. Sie ist verschlossen. Vielleicht weiß jemand in Graufurt, wer hier hineindarf." });

/* ───────── Phase 10 (#92, G3): der Wrackkapitän in seiner Kajüte (Region wrack_kajuete, Weltfelder 11488…11519 × 9600…9631) ─────────
   Geist eines Kapitäns: Säbelwirbel rundum, ruft unter 60 % zwei Strandräuber, unter 30 % schwappt Geisterwasser durch die Kajüte (Deckung hinter Kisten). Instanz je Spieler (Schalter aus G3). */
BOSSE.wrackkapitaen = { typ: "wrackkapitaen", phasen: [
  { ab: 1, ansagen: [{ name: "Säbelwirbel", alle: 4, felder: "rundum", schaden: [6, 11] }] },
  { ab: 0.6, text: "Der Wrackkapitän ruft seine Mannschaft!", ruf: { art: "strandraeuber_saebel", n: 2, text: "Alle Mann an Deck!" }, ansagen: [{ name: "Säbelwirbel", alle: 3, felder: "rundum", schaden: [6, 11] }] },
  { ab: 0.3, text: "Geisterwasser flutet die Kajüte!", ansagen: [{ name: "Geisterflut", sek: 4, felder: "raum", deckung: true, vorlauf: 2, schaden: [9, 15] }] } ] };
INSTANZEN.push({ id: "wrack_kajuete", name: "Die Kajüte des Kapitäns", feld: [11488, 9600, 11519, 9631], schalter: "wrackkapitaen_kajuete", danach: "wrackkapitaen_danach",
  gegner: [{ art: "wrackkapitaen", x: 11504.5, y: 9614.5 }], text: "Die Tür der Kajüte fällt ins Schloss. Am Kartentisch sitzt jemand, durch den man hindurchsieht." });

/* ───────── Phase 9 (#86, F3): die Sandmutter in ihrer Kammer unter dem Tempel (Region tempel_kammer, Weltfelder 11360…11391 × 9600…9631) ─────────
   Gräbt sich ein (unangreifbar), ruft Sandkriecher, Treibsand auf angesagten Feldern. Instanz je Spieler, solange „sandmutter_kammer“ an ist (F3). */
BOSSE.sandmutter = { typ: "sandmutter", phasen: [
  { ab: 1, ansagen: [{ name: "Sandschlag", alle: 4, felder: "rundum", schaden: [9, 15] }] },
  { ab: 0.6, text: "Die Sandmutter gräbt sich ein!", eingraben: 5, ruf: { art: "sandkriecher", n: 2, text: "Der Sand bebt überall!" },
    ansagen: [{ name: "Treibsand", sek: 3, felder: "ziel", weite: 1, vorlauf: 2, schaden: [10, 16] }] },
  { ab: 0.3, text: "Die Sandmutter brüllt!", eingraben: 4, ansagen: [{ name: "Treibsand", sek: 2.5, felder: "ziel", weite: 2, vorlauf: 2, schaden: [12, 18] }, { name: "Sandschlag", alle: 3, felder: "rundum", schaden: [9, 15] }] } ] };
INSTANZEN.push({ id: "tempel_kammer", name: "Die Kammer der Sandmutter", feld: [11360, 9600, 11391, 9631], schalter: "sandmutter_kammer", danach: "sandmutter_danach",
  gegner: [{ art: "sandmutter", x: 11376.5, y: 9612.5 }], text: "Das Tor mit dem Auge schließt sich. Der Boden der Kammer atmet." });

/* ───────── Phase 8 (#58, E4): der Graue Hauptmann in seiner Gruft (Region hauptmann_gruft, Weltfelder 11200…11231 × 9600…9631) ─────────
   Ruft Wiedergänger, später Ansage über die Gruft mit Deckung hinter den Grabsteinen. Instanz je Spieler, solange „hauptmann_gruft“ an ist (E4). */
BOSSE.grauer_hauptmann = { typ: "grauer_hauptmann", phasen: [
  { ab: 1, ansagen: [{ name: "Rundumschlag", alle: 4, felder: "rundum", schaden: [8, 14] }] },
  { ab: 0.6, text: "Der Graue Hauptmann ruft seine Wacht!", ruf: { art: "wiedergaenger", n: 2, text: "Steht auf, Wacht!" }, ansagen: [{ name: "Rundumschlag", alle: 3, felder: "rundum", schaden: [8, 14] }] },
  { ab: 0.3, text: "Ein eisiger Sturm fegt durch die Gruft!", ansagen: [{ name: "Grabessturm", sek: 4, felder: "raum", deckung: true, vorlauf: 2, schaden: [12, 20] }] } ] };
INSTANZEN.push({ id: "hauptmann_gruft", name: "Die Gruft des Grauen Hauptmanns", feld: [11200, 9600, 11231, 9631], schalter: "hauptmann_gruft", danach: "hauptmann_danach",
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
INSTANZEN.push({ id: "thronsaal", name: "Der Thronsaal", feld: [10752, 9600, 10783, 9631], schalter: "rabenpriester_thronsaal", danach: "rabenpriester_danach",
  gegner: [{ art: "oberster_rabenpriester", x: 10768.5, y: 9607.5 }], eintritt: "federsiegel",
  ohne: "Der Altar am Tor bleibt kalt – ohne Federsiegel öffnet sich der Thronsaal nicht.", text: "Das Federsiegel zerfällt zu Asche. Der Thronsaal gehört dir – für diesen Versuch." });
