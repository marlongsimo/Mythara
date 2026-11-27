/*
 * Riftmere – Fähre (Phase 7, Issue #49; Konzept doku/konzepte/phase-7.md, doku/quests/d-bausteine.md Nr. 3).
 * Überfahrt zwischen zwei Anlegern, in beide Richtungen, nur wenn der Schalter für den Spieler an ist (z. B. „faehre_frei“ nach D1).
 * Wie der Wegstein-Teleport: der Browser fragt { t: "faehre", id }, der Server prüft (nah am Anleger, Schalter, nicht im Kampf) und setzt die Stelle;
 * der Browser zeigt eine kurze Überfahrt (dauer Sekunden) und springt dann ans andere Ufer. Ohne Schalter: der Text nein (der Fährmann sagt, warum nicht).
 * Die Anleger trägt die Rolle Integration ein (Stellen aus der Welt). Das Ostufer selbst sperrt die Region-Freigabe der Quest (QuestDef.freigaben).
 */
export interface Anleger { /** Stelle zum Antippen (Weltfelder) */ x: number; y: number; /** Region, in der der Anleger liegt */ region: string; /** Name des Ufers („Westanleger“) */ name: string;
  /** wo man nach der Überfahrt steht (Weltfelder, sonst x/y) */ ankunft?: [number, number] }
export interface Faehre { id: string; a: Anleger; b: Anleger; /** an, wenn dieser Schalter für den Spieler an ist (QuestDef.schalter) */ schalter: string;
  /** Text ohne Schalter */ nein: string; /** Sekunden der Überfahrt (Standard FAEHRE_DAUER) */ dauer?: number }

export const FAEHREN: Faehre[] = [];
/* Beispiel (für die Integration):
   { id: "graufurt", schalter: "faehre_frei", nein: "Der Fährmann schüttelt den Kopf: „Die Kette ist gerissen. Ohne neue Glieder fährt hier nichts.“",
     a: { name: "Westanleger", region: "graufurt", x: …, y: …, ankunft: [… , …] }, b: { name: "Ostanleger", region: "ostufer", x: …, y: …, ankunft: [… , …] } } */

/** So nah muss man am Anleger stehen (Felder), so lange dauert die Überfahrt (s) */
export const FAEHRE_NAH = 3, FAEHRE_DAUER = 3;
/** Der Anleger an dieser Stelle (Weltfelder): Fähre, Ufer und das andere Ufer */
export function faehreBei(x: number, y: number, weit = FAEHRE_NAH, liste: Faehre[] = FAEHREN): { f: Faehre; von: Anleger; nach: Anleger } | null {
  for (const f of liste) for (const [von, nach] of [[f.a, f.b], [f.b, f.a]] as const) if (Math.hypot(von.x - x, von.y - y) <= weit) return { f, von, nach }; return null; }
/** Wo man am anderen Ufer ankommt */
export const ankunft = (A: Anleger): { x: number; y: number } => (A.ankunft ? { x: A.ankunft[0], y: A.ankunft[1] } : { x: A.x, y: A.y });
