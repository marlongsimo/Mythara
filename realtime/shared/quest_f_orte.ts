/*
 * Riftmere – Phase 9 „Glut und Strom“: gemeinsame Stellen der Quests F1–F4 und der Quer-Quest „Die Karte des Boten“ (shared/quest_f*.ts, quest_karte.ts), in Weltfeldern.
 * Aus der Welt (#74, Zweig claude/mythara-world-pipeline-z4ynx5, ac2b466f; NPC-Plätze in welt/glutsande_orte.json). Die Glutsande liegen auf dem Festland;
 * der Tempel (tempel, Ursprung 11264 | 9600), die Kammer der Sandmutter (tempel_kammer, 11360 | 9600, Instanz) und das Archiv (rathaus_archiv, 11392 | 9600) sind eigene Gebiete.
 */
export type Feld = [number, number];
/* ── ältere Regionen ── */
export const KORD: Feld = [6717.8, 6515.6];          /* Fährmann am Fährhaus Graufurt (D1) */
export const MERIT: Feld = [6677.5, 6484.5];         /* vor dem Bergfried Graufurt */
export const HAGAN: Feld = [6438.5, 6423.5];         /* Bürgermeister im Rathaus der Waldmark (Quest 1) */
export const ARCHIV: Feld = [11405.6, 9619];         /* Kartenstück 1 im Archiv hinter dem Ratssaal (rathaus_archiv 13,6 | 19) */
export const HEDDA: Feld = [6289.4, 6677.4];         /* vor Heddas Hütte, Rabenmoor */
export const YSOLDE: Feld = [10994, 9617.2];         /* Turmdach am Ostufer (D2) */
export const SARKOPHAG: Feld = [11216, 9616.4];      /* hauptmann_gruft (E4) */
/* ── Glutsande ── */
export const GRASENDE: Feld = [6915.5, 6743.4];      /* Wegmarke ende_des_grases hinter dem Pass im Südosten des Ostufers */
export const KANAL: Feld = [7114, 6852];             /* Karawanenräuber am ausgetrockneten Kanal (Lager 7112 | 6850 mit Bogen, 7132 | 6884; das alte lager_west ist seit #155 ausgedünnt) */
export const GLUTBRUNN = { selma: [7142, 6970] as Feld, herd: [7119, 6954.4] as Feld };   /* Karawanenrast; Werkstatt mit glutbrunn_herd */
export const STROM = { nalia: [7114, 6985.4] as Feld, fischplatz: [7112.5, 6986.3] as Feld };
export const SALZPFANNE = { ruwen: [7331.5, 6625.5] as Feld, pfanne: [7315, 6644] as Feld, skorpione: [7330, 6646] as Feld };
/** Versandeter Tempel: Tor oben im Tafelberg, Hasim davor; unten Vorhalle, vier Spiegelplatten, Inschriftensaal; die Kammer der Sandmutter mit Kartenstück 5 */
export const TEMPEL = { tor: [7112, 6694.4] as Feld, hasim: [7114.5, 6698] as Feld, raum: [11312, 9654] as Feld,
  spiegel: [[11277, 9620.4], [11291, 9620.4], [11277, 9634.4], [11291, 9634.4]] as Feld[], inschrift: [11338, 9619.4] as Feld,
  kammer: [11376, 9616] as Feld, kartenstueck: [11376, 9605.4] as Feld };
