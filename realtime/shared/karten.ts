/*
 * Die Kampfkarten der Kampagnen (aus dem Würfelspiel übernommen: 12 × 9 Felder, gemalte Bilder).
 * Zeilen als Text: „.“ frei, „~“ Wasser (versperrt den Weg, nicht die Sicht), Buchstaben sind Hindernisse (M Mauer, K Kiste/Sack, T Baum/Schilf).
 */
import type { Lager } from "./karte";
export interface KampfKarte { name: string; bild: string; zeilen: string[]; start: number[][]; lager: Lager[] }
const L = (art: string, x: number, y: number, gruppe: number): Lager => ({ art, x: x + 0.5, y: y + 0.5, gruppe });

export const KARTEN: Record<string, KampfKarte> = {
  /* Der Kornspeicher: links das Tor, rechts das Loch zum Graben, dazwischen Säcke und Fässer */
  speicher: { name: "Der Kornspeicher", bild: "img/weidenhain/speicher.webp",
    zeilen: ["MMMMMMMMMMMM", "MMKK.....KMM", "M..KK..KK.MM", "M..KK..KK.MM", "............", "M..KK..KK.MM", "M.........MM", "MMKK.....KMM", "MMMMMMMMMMMM"],
    start: [[1, 4], [1, 3], [1, 5]],
    lager: [L("schlammkroete", 6, 4, 1), L("schlammkroete", 6, 2, 1), L("schlammkroete", 6, 6, 1), L("schlammkroete", 9, 3, 2), L("schlammkroete", 9, 5, 2), L("schlammkroete", 10, 4, 2)] },
  /* Am Mühlgraben: der Graben teilt die Wiese, in der Mitte ein Steg, oben rechts das Mühlhaus */
  muehle: { name: "Am Mühlgraben", bild: "img/weidenhain/muehle.webp",
    zeilen: ["TTT...~~.MMM", "TTTKK.~~KMMM", "TT....~~..MM", "..K...~~..K.", "............", "..K...~~....", "TT....~~.KKT", "TT....~~..TT", "TTT...~~..TT"],
    start: [[0, 4], [1, 3], [1, 5]],
    lager: [L("schlammkroete", 4, 2, 1), L("schlammkroete", 4, 6, 1), L("schlammkroete", 5, 4, 1), L("irrlicht", 8, 4, 2), L("schlammkroete", 9, 3, 2), L("schlammkroete", 9, 5, 2), L("schlammkroete", 11, 5, 2), L("schlammkroete", 9, 7, 2)] },
  /* Das alte Wehr: ein Streifen Ufer zwischen Mühlteich oben und dem Abfluss unten */
  wehr: { name: "Das alte Wehr", bild: "img/weidenhain/wehr.webp",
    zeilen: ["TT~~~~~~~~~T", "TTT~~~~~~MMT", ".TT......MM.", "............", ".T..........", "TTT.......K.", "............", "MMMMMMMMMMMM", "T~~~~~~~~~~~"],
    start: [[0, 3], [1, 3], [0, 4]],
    lager: [L("alte_unke", 9, 4, 1), L("irrlicht", 8, 2, 1), L("irrlicht", 10, 6, 1), L("irrlicht", 6, 3, 1), L("schlammkroete", 7, 5, 1), L("schlammkroete", 8, 6, 1)] },
};
