/*
 * Riftmere – Ziele des Wegsteins (Phase 3a, 26.11.2026). Server und Browser lesen dieselbe Liste:
 * der Browser zeigt beim „Reiben“ die freigeschalteten Ziele, der Server prüft das Ziel, zieht eine Ladung ab und setzt die Position.
 * Neue Ziele kommen nur als Eintrag dazu (Rabenmoor nach C1, Graufurt …).
 */
import type { Bed } from "./questbau";

export interface WegZiel { id: string; name: string; /** Ankunft (Weltfelder) */ x: number; y: number; region: string; /** freigeschaltet, wenn diese Bedingung für die Quest gilt */ quest: string; wenn: Bed; /** Hinweis, solange gesperrt */ sperre: string }
export const B1_ID = "weidenhain_der_wegstein";
export const WEGSTEIN_ZIELE: WegZiel[] = [
  { id: "weidenhain_linde", name: "Weidenhain – die Linde", x: 6452.5, y: 6684.5, region: "weidenhain", quest: B1_ID, wenn: { phase: ["fertig"] }, sperre: "Agnes an der Linde in Weidenhain weiß, wie man einen Wegstein macht." },
  { id: "osthof_muehle", name: "Osthof – die Windmühle", x: 6562.5, y: 6429.5, region: "osthof", quest: "osthof_die_muehle_steht_still", wenn: { phase: ["fertig"] }, sperre: "Die Mühle im Osthof steht still – Till Mahler braucht Hilfe." },
];
export const wegZiel = (id: string): WegZiel | undefined => WEGSTEIN_ZIELE.find((z) => z.id === id);
/** eigene Abklingzeit des Wegsteins (unabhängig vom Heim-Teleport) */
export const WEGSTEIN_PAUSE_MS = 2 * 60 * 1000;
/** Heim-Teleport (Taste T): Startpunkt der Waldmark (wie welt.json regionen.waldmark.start[0], test/wegstein-ui prüft das) */
export const HEIM = { x: 6448, y: 6437.5, region: "waldmark" };
