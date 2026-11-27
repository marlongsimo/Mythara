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
  /* Phase 7 (#40): D2-Lohn – vor dem Turm am Ostufer */
  /* Phase 10 (#118): G1-Lohn – am Wegstein von Kielmund (Welt: kielmund_wegstein, fl_186_225 468,5 | 171,5), Ankunft zwei Felder südlich */
  { id: "kielmund", name: "Kielmund – der Wegstein", x: 6420.5, y: 7373.5, region: "fl_186_225", quest: "kueste_die_suedstrasse", wenn: { phase: ["fertig"] }, sperre: "Kielmund liegt am Ende der Südstraße. Wer den Frachtbrief dorthin bringt, findet den Weg zurück." },
  { id: "ostufer_turm", name: "Ostufer – der Turm", x: 6834.5, y: 6524.5, region: "ostufer", quest: "ostufer_das_gruene_licht", wenn: { phase: ["fertig"] }, sperre: "Drüben am Ostufer steht ein Turm mit grünem Licht. Wer dort war, findet den Weg zurück." },
];
export const wegZiel = (id: string): WegZiel | undefined => WEGSTEIN_ZIELE.find((z) => z.id === id);
/** Reisekarte (Phase 9, #102): gebundener Gegenstand – einmal am Tag ein Wegstein-Sprung ohne Ladung (auch ohne Wegstein). Der Tag zählt nach deutscher Zeit. */
export const REISEKARTE = "reisekarte";
/** Der Tag (JJJJMMTT, Europe/Berlin) – an ihm hängt der freie Sprung der Reisekarte */
export function reiseTag(ms = Date.now()): string { try { return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(new Date(ms)).replace(/-/g, ""); } catch { return new Date(ms).toISOString().slice(0, 10).replace(/-/g, ""); } }
/** Merker im Inventar: an diesem Tag ist der freie Sprung verbraucht */
export const reiseMerker = (tag: string): string => "reisekarte_" + tag;
/** eigene Abklingzeit des Wegsteins (unabhängig vom Heim-Teleport) */
export const WEGSTEIN_PAUSE_MS = 2 * 60 * 1000;
/** Heim-Teleport (Taste T): Startpunkt der Waldmark (wie welt.json regionen.waldmark.start[0], test/wegstein-ui prüft das) */
export const HEIM = { x: 6448, y: 6437.5, region: "waldmark" };
