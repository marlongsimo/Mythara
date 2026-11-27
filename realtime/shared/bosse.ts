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
