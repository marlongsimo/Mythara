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
