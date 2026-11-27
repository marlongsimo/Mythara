/*
 * Riftmere – Phase 8 „Der Weg nach Grauwacht“: gemeinsame Stellen der Quests E1–E4 und der Nebenquests (shared/quest_e*.ts), in Weltfeldern.
 * Aus der Welt (#50, Zweig claude/mythara-world-pipeline-z4ynx5, 8f1b1c70; NPC-Plätze in welt/grauwacht_ausbau.json).
 * Die Fahlen Weiten liegen auf dem Festland; die Grabkammern sind eigene Gebiete im Untergrund (grabkammer_1/2, hauptmann_grab, hauptmann_gruft).
 */
export type Feld = [number, number];
/** Dornenwall am alten Weg im Nordsaum (Lesestelle dornenwall 6702,5 | 6368,2; Sperre x 6693–6713, y 6364,8–6366,6, Schalter dornenwall_offen): drei Ranken, Stehplatz südlich */
export const DORNEN: Feld[] = [[6697.5, 6368.5], [6703.5, 6368.5], [6709.5, 6368.5]];
export const MERIT: Feld = [6677.5, 6484.5];
/** Heidrast: Mette Heider (mette_heider) */
export const HEIDRAST = { mette: [6598.5, 5875] as Feld };
/** Heidewolf-Rudel (Vorschlag der Welt): offene Heide */
export const HEIDE: Feld = [6560, 5820], RUDEL: Feld = [6650, 5840];
/** Abtei: Gunhild (aebtissin_gunhild), Küche mit Herd und Kessel (abtei_kueche), Glocke im Turm (Lesestelle glocke), Glockenseil daneben */
export const ABTEI = { gunhild: [6669, 5765] as Feld, kueche: [6678, 5785.6] as Feld, glocke: [6680, 5762.4] as Feld, seil: [6682.5, 5763.5] as Feld };
/** Burg: Wigand Fels (wigand_fels, ab Stufe „abtei“) vor dem Bergfried */
export const BURG = { wigand: [6708, 5706] as Feld };
/** Grenzposten: Lager der Deserteure (Mitte 6640 | 6112, r 10), Lesestelle grenzposten */
export const GRENZPOSTEN = { lager: [6638, 6115.2] as Feld, tjark: [6640.5, 6113.5] as Feld /* 6640 · 6112 war im Gehraster gesperrt (Palisade) */ };
/** Hügelgräber (Lesestelle huegelgraeber), Eingang zum Grab des Hauptmanns, die drei Kammern für „Ruhelose Gräber“ (Särge in grabkammer_1/2, Vorraum im hauptmann_grab) */
export const GRAEBER = { feld: [6470, 5768] as Feld, hauptmann_eingang: [6466, 5787.8] as Feld,
  kammern: [[11088, 9610.4], [11120, 9610.4], [11168, 9655.5]] as Feld[] };
/** Grab des Grauen Hauptmanns (hauptmann_grab, Ursprung 11136 | 9600, 2×2): Nischen der Grabwächter, Siegel; Bossraum hauptmann_gruft (Ursprung 11200 | 9600, Instanz) */
export const GRAB = { waechter: [11168, 9630] as Feld, siegel: [11168, 9610.4] as Feld, kampf: [11216, 9614] as Feld };
export const KERNBAUM: Feld = [6236, 5766];
