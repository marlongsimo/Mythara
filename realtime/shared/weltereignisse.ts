/*
 * Riftmere – Weltereignisse nach der Uhr (Phase 8, Issue #102; Konzept doku/konzepte/phase-8.md):
 * - Glocke von Grauwacht: zu jeder vollen Stunde läutet sie – für jeden Spieler, für den ihr Schalter an ist (nach E2). Eine Minute lang sind
 *   Gegner mit MonsterDef.friedlichBei = GLOCKE.friedlich (Wiedergänger) friedlich gegen ihn: Der Server setzt dafür den Schalter „glocke_laeutet“ am Helden.
 * - Wind in den Fahlen Weiten: alle WIND.alle Sekunden eine Böe – Ansage (vorlauf Sekunden), danach dauer Sekunden Fernkampf um minder schwächer
 *   (für Schützen, die im Wind-Gebiet stehen). Alle Server rechnen nach derselben Uhr: die Böe kommt für alle gleichzeitig.
 * Die Regionen trägt die Integration ein (Stand der Welt #50).
 */
export const GLOCKE = { schalter: "glocke_heil", friedlich: "glocke_laeutet", /** Sekunden nach der vollen Stunde */ dauer: 60, regionen: ["fl_201_169", "fl_201_183", "fl_186_169"] as string[], /* Fahle Weiten mit Grauwacht (Festland-Kacheln der Welt #50) */
  text: "Die Glocke von Grauwacht läutet – die Toten halten inne." };
export const WIND = { regionen: ["fl_201_169", "fl_201_183", "fl_186_169"] as string[], /** Sekunden zwischen zwei Böen */ alle: 240, vorlauf: 1, dauer: 10, minder: 0.2 };
/** Läutet die Glocke gerade (ms: Weltuhr)? In der ersten Minute jeder vollen Stunde (UTC – volle Stunden sind überall in Europa gleich) */
export const glockeLaeutet = (ms: number): boolean => ms % 3_600_000 < GLOCKE.dauer * 1000;
/** Nummer der Stunde (wechselt sie, läutet die Glocke von neuem) */
export const glockeStunde = (ms: number): number => Math.floor(ms / 3_600_000);
/** Nummer der Böe (wechselt sie, kommt eine neue) */
export const boeeNr = (ms: number): number => Math.floor(ms / (WIND.alle * 1000));
