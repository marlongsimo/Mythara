/*
 * Riftmere – Phase 10 „Salz und Segel“: gemeinsame Stellen der Quests G1–G4 und „Der Kräuterhof“ (shared/quest_g*.ts), in Weltfeldern.
 * Echt sind die Stellen in den älteren Regionen (Othmar in Weidenhain, Mira in der Waldmark, Hedda und Bertold im Rabenmoor, Merit in Graufurt, Bindestein an der Linde).
 * Die Smaragdküste aus der Welt (#82); was die Welt nicht als Stelle nennt (Spuren, Wagen, Beete, Kessel im Wärterhaus), ist als Vorschlag markiert.
 */
export type Feld = [number, number];
/* ── ältere Regionen ── */
export const OTHMAR: Feld = [6451.5, 6688.5];
export const MIRA: Feld = [6456, 6441];
export const HEDDA: Feld = [6289.4, 6677.4];
export const BERTOLD: Feld = [6320, 6697];
export const MERIT: Feld = [6677.5, 6484.5];
export const LINDE: Feld = [6453.2, 6679.4];          /* Bindestein an der Linde (B1) */
/* ── Smaragdküste (#82, Zweig claude/mythara-world-pipeline-z4ynx5, 773b1f09; NPC-Plätze welt/kueste_orte.json) ── */
/** Südstraße von Weidenhain (6444 | 6738) nach Kielmund: Spuren und Wagen als Vorschlag entlang der Straße */
export const SUEDSTRASSE = { spur_1: [6446.5, 6820.5] as Feld, spur_2: [6441.5, 6930.5] as Feld, wagen: [6436.5, 7040.5] as Feld, raeuber: [6432, 6950] as Feld /* Lager der Wegelagerer (Süden #120: wegelager_nord) */ };
/** Kielmund: Kaufherr vor dem Küstenhaus (Tür 6414 | 7296,8), Fischplatz am Kai (Stehplatz), Werkstatt */
export const KIELMUND = { kaufherr: [6414.5, 7299] as Feld, kai: [6384.5, 7310.5] as Feld, werkstatt: [6452, 7327.4] as Feld };
/** Leuchtturm auf der Klippe (6176 | 7035,2), Wärterin am NPC-Platz leuchtturmwaerter, Kessel im Wärterhaus (Vorschlag) */
export const LEUCHTTURM = { waerterin: [6188, 7037] as Feld, linse: [6176, 7034] as Feld, feuer: [6177.5, 7035.2] as Feld, kessel: [6190, 7039.5] as Feld };
/** Schiffswrack am Strand (Lesestelle wrack), Eingang der Klippenhöhlen */
export const WRACK = { kiste: [6283, 7264.6] as Feld, raeuber: [6280, 7262] as Feld, hoehle: [6180, 7091.2] as Feld };
/** Klippenhöhlen (Ursprung 11424 | 9600, 2×2) und die Kajüte des Wrackkapitäns (wrack_kajuete, Ursprung 11488 | 9600, Instanz) mit der Logbuchseite */
export const HOEHLE = { kapitaen: [11504, 9614] as Feld, logbuch: [11504, 9612.4] as Feld };
/** Möwenbucht: Fischerin (fischerin_moewenbucht), Fischplatz am Steg (Stehplatz), Räucherhütte (Station raeucherhuette) */
export const MOEWENBUCHT = { fischerin: [6217, 7163] as Feld, steg: [6190.5, 7158.5] as Feld, raeucherhuette: [6214.5, 7166.6] as Feld };
/** Kräuterhof: Bäuerin (kraeuterbaeuerin), Beete (Vorschlag links und rechts vom Haus), Kessel kraeuterhof_kessel (Vorschlag) */
export const KRAEUTERHOF = { baeuerin: [6419, 7065] as Feld, beet_1: [6412.5, 7068.5] as Feld, beet_2: [6424.5, 7068.5] as Feld, kessel: [6421, 7062] as Feld };
