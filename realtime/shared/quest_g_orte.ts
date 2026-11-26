/*
 * Riftmere – Phase 10 „Salz und Segel“: gemeinsame Stellen der Quests G1–G4 und „Der Kräuterhof“ (shared/quest_g*.ts), in Weltfeldern.
 * Echt sind die Stellen in den älteren Regionen (Othmar in Weidenhain, Mira in der Waldmark, Hedda und Bertold im Rabenmoor, Merit in Graufurt, Bindestein an der Linde).
 * VORLÄUFIG für die Smaragdküste: Die Region gibt es in der Welt noch nicht – Platzhalter südlich von Weidenhain (Ursprung 6400 | 6656, 128 × 96). Nach dem Welt-Issue zu Phase 10 nur hier umstellen.
 */
export type Feld = [number, number];
/* ── ältere Regionen ── */
export const OTHMAR: Feld = [6451.5, 6688.5];
export const MIRA: Feld = [6456, 6441];
export const HEDDA: Feld = [6289.4, 6677.4];
export const BERTOLD: Feld = [6320, 6697];
export const MERIT: Feld = [6677.5, 6484.5];
export const LINDE: Feld = [6453.2, 6679.4];          /* Bindestein an der Linde (B1) */
/* ── Smaragdküste (Platzhalter) ── */
export const SUEDSTRASSE = { spur_1: [6450.5, 6790.5] as Feld, spur_2: [6455.5, 6830.5] as Feld, wagen: [6460.5, 6868.5] as Feld, raeuber: [6466.5, 6872.5] as Feld };
export const KIELMUND = { kaufherr: [6480.5, 6950.5] as Feld, kai: [6490.5, 6962.5] as Feld, werkstatt: [6472.5, 6944.5] as Feld };
export const LEUCHTTURM = { waerterin: [6540.5, 6930.5] as Feld, linse: [6542.5, 6926.5] as Feld, feuer: [6542.5, 6924.5] as Feld, kessel: [6538.5, 6932.5] as Feld };
export const WRACK = { kiste: [6520.5, 6990.5] as Feld, raeuber: [6516.5, 6986.5] as Feld, hoehle: [6560.5, 6960.5] as Feld };
/** Klippenhöhlen: Untergrund mit Raum des Wrackkapitäns (Instanz) – Platzhalter */
export const HOEHLE = { kapitaen: [11440.5, 9616.5] as Feld };
export const MOEWENBUCHT = { fischerin: [6420.5, 6980.5] as Feld, steg: [6416.5, 6986.5] as Feld, raeucherhuette: [6426.5, 6978.5] as Feld };
export const KRAEUTERHOF = { baeuerin: [6400.5, 6900.5] as Feld, beet_1: [6396.5, 6904.5] as Feld, beet_2: [6404.5, 6904.5] as Feld, kessel: [6398.5, 6898.5] as Feld };
