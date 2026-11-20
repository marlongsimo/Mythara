/*
 * Die Kampfkarten der Kampagnen (aus dem Würfelspiel übernommen: 12 × 9 Felder, gemalte Bilder).
 * Zeilen als Text: „.“ frei, „~“ Wasser (versperrt den Weg, nicht die Sicht), Buchstaben sind Hindernisse (M Mauer, K Kiste/Sack, T Baum/Schilf).
 */
import type { Lager } from "./karte";
export interface KampfKarte { name: string; bild: string; zeilen: string[]; start: number[][]; lager: Lager[] }
const L = (art: string, x: number, y: number, gruppe: number): Lager => ({ art, x: x + 0.5, y: y + 0.5, gruppe });

/* Reihenfolge der Kampagnen (wie auf der Weltkarte) und ihrer Kämpfe. Danach richtet sich, was freigeschaltet ist – auf dem Server und im Spiel gleich. */
export const ORTREIHE = ["weidenhain", "rabenmoor", "graufurt", "grauwacht", "hochwacht", "krone"];
export const KAMPFFOLGE: Record<string, string[]> = { weidenhain: ["speicher", "muehle", "wehr"] };
const geschafft = (siege: Set<string>, ort: string) => { const f = KAMPFFOLGE[ort]; return Boolean(f && f.length && siege.has(ort + "/" + f[f.length - 1])); };
/** Wie viele Kampagnen der Reihe nach geschafft sind (Siege als „ort/kampf“) */
export function geschaffteKampagnen(siege: Set<string>): number { let n = 0; while (n < ORTREIHE.length && geschafft(siege, ORTREIHE[n])) n++; return n; }
/** Darf dieser Kampf begonnen werden? Erster Kampf eines Ortes: die vorige Kampagne ist geschafft. Sonst: der Kampf davor ist gewonnen. Gewonnene Kämpfe darf man wiederholen. */
export function darfKaempfen(siege: Set<string>, ort: string, kampf: string): boolean {
  const f = KAMPFFOLGE[ort], i = f ? f.indexOf(kampf) : -1, o = ORTREIHE.indexOf(ort); if (i < 0 || o < 0) return false;
  if (i > 0) return siege.has(ort + "/" + f[i - 1]); return o === 0 || geschafft(siege, ORTREIHE[o - 1]);
}
/** Rechenfelder je gemaltem Feld (siehe setzeKarte) */
export const FEIN = 2;
export const KARTEN: Record<string, KampfKarte> = {
  /* Der Kornspeicher: links das Tor, rechts das Loch zum Graben, dazwischen Säcke und Fässer */
  speicher: { name: "Der Kornspeicher", bild: "img/weidenhain/speicher.webp",
    zeilen: ["MMMMMMMMMMMM", "MMKK.....KMM", "M..KK..KK.MM", "M..KK..KK.MM", "............", "M..KK..KK.MM", "M.........MM", "MMKK.....KMM", "MMMMMMMMMMMM"],
    start: [[1, 4], [1, 3], [1, 5]],
    lager: [L("schlammkroete", 6, 4, 1), L("schlammkroete", 6, 6, 1), L("schlammkroete", 9, 3, 2), L("schlammkroete", 10, 4, 2)] },
  /* Am Mühlgraben: der Graben teilt die Wiese, in der Mitte ein Steg, oben rechts das Mühlhaus */
  muehle: { name: "Am Mühlgraben", bild: "img/weidenhain/muehle.webp",
    zeilen: ["TTT...~~.MMM", "TTTKK.~~KMMM", "TT....~~..MM", "..K...~~..K.", "............", "..K...~~....", "TT....~~.KKT", "TT....~~..TT", "TTT...~~..TT"],
    start: [[0, 4], [1, 3], [1, 5]],
    lager: [L("schlammkroete", 4, 2, 1), L("schlammkroete", 5, 4, 1), L("irrlicht", 8, 4, 2), L("schlammkroete", 9, 5, 2), L("irrlicht", 9, 7, 3), L("schlammkroete", 11, 5, 3)] },
  /* Das alte Wehr: ein Streifen Ufer zwischen Mühlteich oben und dem Abfluss unten */
  wehr: { name: "Das alte Wehr", bild: "img/weidenhain/wehr.webp",
    zeilen: ["TT~~~~~~~~~T", "TTT~~~~~~MMT", ".TT......MM.", "............", ".T..........", "TTT.......K.", "............", "MMMMMMMMMMMM", "T~~~~~~~~~~~"],
    start: [[0, 3], [1, 3], [0, 4]],
    lager: [L("alte_unke", 9, 4, 1), L("irrlicht", 8, 2, 1), L("irrlicht", 10, 6, 1), L("schlammkroete", 7, 5, 1)] },
};
