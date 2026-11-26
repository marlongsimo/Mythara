/*
 * Riftmere – Phase 9 „Glut und Strom“: gemeinsame Stellen der Quests F1–F4 und der Quer-Quest „Die Karte des Boten“ (shared/quest_f*.ts, quest_karte.ts), in Weltfeldern.
 * VORLÄUFIG für die Glutsande: Die Region gibt es in der Welt noch nicht – Platzhalter östlich des Ostufers (Ostufer: Ursprung 6784 | 6400, 128 breit).
 * Echt sind die Stellen in den älteren Regionen (Waldmark, Rabenmoor, Graufurt, Grünem Turm, Grab des Hauptmanns). Nach dem Welt-Issue zu Phase 9 nur hier umstellen.
 */
export type Feld = [number, number];
/* ── ältere Regionen (echt) ── */
export const KORD: Feld = [6717.8, 6515.6];          /* Fährmann am Fährhaus Graufurt (D1) */
export const MERIT: Feld = [6677.5, 6484.5];         /* vor dem Bergfried Graufurt */
export const HAGAN: Feld = [6438.5, 6423.5];         /* Bürgermeister im Rathaus der Waldmark (Quest 1) */
export const HEDDA: Feld = [6289.4, 6677.4];         /* vor Heddas Hütte, Rabenmoor */
export const YSOLDE: Feld = [10994, 9617.2];         /* Turmdach am Ostufer (D2) */
export const SARKOPHAG: Feld = [11216, 9616.4];      /* hauptmann_gruft (E4) */
/* ── Glutsande (Platzhalter) ── */
export const GRASENDE: Feld = [6930.5, 6560.5];      /* Wegmarke „Ende des Grases“ am Übergang vom Ostufer */
export const KANAL: Feld = [6990.5, 6600.5];         /* Lager der Karawanenräuber am ausgetrockneten Kanal */
export const GLUTBRUNN = { selma: [7060.5, 6650.5] as Feld, hasim: [7066.5, 6646.5] as Feld, herd: [7056.5, 6656.5] as Feld };
export const STROM = { nalia: [7070.5, 6668.5] as Feld, fischplatz: [7074.5, 6670.5] as Feld };
export const SALZPFANNE = { ruwen: [7010.5, 6720.5] as Feld, pfanne: [7014.5, 6722.5] as Feld, skorpione: [7018.5, 6730.5] as Feld };
/** Versandeter Tempel in den Tafelbergen: Eingang oben, drei Räume und die Kammer im Untergrund (Platzhalter) */
export const TEMPEL = { eingang: [7120.5, 6700.5] as Feld, raum: [11280.5, 9616.5] as Feld, spiegel: [[11276.5, 9610.5], [11284.5, 9610.5], [11280.5, 9604.5]] as Feld[],
  kammer: [11344.5, 9616.5] as Feld, inschrift: [11344.5, 9606.5] as Feld };
