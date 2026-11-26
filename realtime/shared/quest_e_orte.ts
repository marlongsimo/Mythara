/*
 * Riftmere – Phase 8 „Der Weg nach Grauwacht“: gemeinsame Stellen der Quests E1–E4 und der Nebenquests (shared/quest_e*.ts).
 * VORLÄUFIG: Die Fahlen Weiten, Heidrast, Grauwacht und die Hügelgräber gibt es in der Welt noch nicht. Die Stellen hier sind Platzhalter
 * nördlich des Nordsaums (Ursprung 6400 | 6336); nur der Dornenwall am Uferweg-Nord (nordsaum 307,5 | 46) ist echt. Nach dem Welt-Issue zu Phase 8 ersetzen.
 */
export type Feld = [number, number];
/** Dornenwall am Uferweg im Nordsaum: drei Ranken, nebeneinander */
export const DORNEN: Feld[] = [[6705.5, 6378.5], [6707.5, 6378.5], [6709.5, 6378.5]];
export const MERIT: Feld = [6677.5, 6484.5];
export const HEIDRAST = { mette: [6700.5, 6250.5] as Feld, pferch: [6706.5, 6252.5] as Feld, herd: [6698.5, 6248.5] as Feld };
export const HEIDE: Feld = [6720.5, 6230.5], RUDEL: Feld = [6730.5, 6215.5];
export const ABTEI = { gunhild: [6690.5, 6150.5] as Feld, ofen: [6686.5, 6148.5] as Feld, turm: [6694.5, 6144.5] as Feld, seil: [6694.5, 6146.5] as Feld };
export const BURG = { wigand: [6720.5, 6130.5] as Feld };
export const GRENZPOSTEN = { lager: [6600.5, 6260.5] as Feld, tjark: [6602.5, 6262.5] as Feld };
export const GRAEBER = { feld: [6760.5, 6220.5] as Feld, kammern: [[6756.5, 6216.5], [6762.5, 6224.5], [6768.5, 6216.5]] as Feld[] };
/** Grab des Grauen Hauptmanns: eigenes Gebiet im Untergrund (als Instanz kopierbar) – Platzhalter */
export const GRAB = { eingang: [11216.5, 9626.5] as Feld, siegel: [11216.5, 9612.5] as Feld, kampf: [11216.5, 9616.5] as Feld };
export const SPLITTEREISEN: Feld = [6690.4, 6444.6], KERNBAUM: Feld = [6650.5, 6180.5];
