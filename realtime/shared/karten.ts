/*
 * Die Kampfkarten der Kampagnen (aus dem Würfelspiel übernommen: 12 × 9 Felder, gemalte Bilder).
 * Zeilen als Text: „.“ frei, „~“ Wasser (versperrt den Weg, nicht die Sicht), Buchstaben sind Hindernisse (M Mauer, K Kiste/Sack, T Baum/Schilf).
 */
import type { Lager } from "./karte";
/** Eine Schleuse: Solange sie offen ist, kriechen alle `takt` Sekunden Gegner aus dem Wasser (an den Quellen, höchstens `max` zugleich).
 *  Schließen: drei Sekunden ungestört am Hebel stehen. Erst wenn sie zu ist, kann der Kampf gewonnen werden. */
export interface Schleuse { x: number; y: number; quellen: number[][]; art: string; takt: number; erst: number; max: number; gesamt: number /* danach ist der Graben leer */ }
export interface KampfKarte { name: string; bild: string; zeilen: string[]; start: number[][]; lager: Lager[]; schleuse?: Schleuse }
const L = (art: string, x: number, y: number, gruppe: number): Lager => ({ art, x: x + 0.5, y: y + 0.5, gruppe });

/* Reihenfolge der Kampagnen (wie auf der Weltkarte) und ihrer Kämpfe. Danach richtet sich, was freigeschaltet ist – auf dem Server und im Spiel gleich. */
export const ORTREIHE = ["weidenhain", "rabenmoor", "graufurt", "grauwacht", "hochwacht", "krone"];
export const KAMPFFOLGE: Record<string, string[]> = { weidenhain: ["speicher", "muehle", "wehr"] };
/* Nebenkämpfe: freiwillig, frei, sobald der Ort selbst offen ist; sie zählen nicht für das Ende der Kampagne */
export const NEBENKAEMPFE: Record<string, string[]> = { weidenhain: ["nest"] };
const geschafft = (siege: Set<string>, ort: string) => { const f = KAMPFFOLGE[ort]; return Boolean(f && f.length && siege.has(ort + "/" + f[f.length - 1])); };
/** Wie viele Kampagnen der Reihe nach geschafft sind (Siege als „ort/kampf“) */
export function geschaffteKampagnen(siege: Set<string>): number { let n = 0; while (n < ORTREIHE.length && geschafft(siege, ORTREIHE[n])) n++; return n; }
/** Darf dieser Kampf begonnen werden? Erster Kampf eines Ortes: die vorige Kampagne ist geschafft. Sonst: der Kampf davor ist gewonnen. Gewonnene Kämpfe darf man wiederholen. */
export function darfKaempfen(siege: Set<string>, ort: string, kampf: string): boolean {
  const f = KAMPFFOLGE[ort], o = ORTREIHE.indexOf(ort); if (o >= 0 && (NEBENKAEMPFE[ort] || []).includes(kampf)) return o === 0 || geschafft(siege, ORTREIHE[o - 1]);
  const i = f ? f.indexOf(kampf) : -1; if (i < 0 || o < 0) return false;
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
    lager: [L("schlammkroete", 4, 2, 1), L("schlammkroete", 5, 4, 1), L("irrlicht", 8, 4, 2), L("schlammkroete", 9, 5, 2), L("irrlicht", 9, 7, 3), L("schlammkroete", 11, 5, 3)],
    /* der Hebel am Ufer vor dem Mühlhaus; die Kröten kriechen an beiden Ufern aus dem Graben */
    schleuse: { x: 8.5, y: 3.2, quellen: [[5.5, 7.5], [8.5, 7.5], [5.5, 1.5], [8.5, 6.5]], art: "schlammkroete", takt: 10, erst: 7, max: 3, gesamt: 8 } },
  /* Hinter der Scheune (Nebenkampf): ein Tümpel unter dem alten Baum voller Krötenlaich. 16 × 9 Felder, der Tümpel ist flach und begehbar. */
  nest: { name: "Hinter der Scheune", bild: "img/weidenhain/nest.webp",
    zeilen: ["MMMMMMMMMMTTTTTT", "MMMMMMMMMMTTTTTT", "MMMMMMMMMMTTTTTT", "MMMMMMT.....TTTT", ".KKKKKK......KTT", ".KK...K......K.T", "....KK.....KKKTT", "T.....K...TTTTTT", "TTTT......TTTTTT"],
    start: [[1, 6], [2, 7], [0, 5]],
    lager: [{ art: "laich", x: 9.6, y: 4.55, gruppe: 9 }, { art: "laich", x: 10.4, y: 3.4, gruppe: 9 }, { art: "laich", x: 11.6, y: 3.9, gruppe: 9 },
      L("schlammkroete", 8, 5, 1), L("kroetchen", 7, 4, 1), L("kroetchen", 11, 5, 2), L("kroetchen", 12, 4, 2)] },
  /* Das alte Wehr: ein Streifen Ufer zwischen Mühlteich oben und dem Abfluss unten */
  wehr: { name: "Das alte Wehr", bild: "img/weidenhain/wehr.webp",
    zeilen: ["TT~~~~~~~~~T", "TTT~~~~~~MMT", ".TT......MM.", "............", ".T..........", "TTT.......K.", "............", "MMMMMMMMMMMM", "T~~~~~~~~~~~"],
    start: [[0, 3], [1, 3], [0, 4]],
    lager: [L("alte_unke", 9, 4, 1), L("irrlicht", 8, 2, 1), L("irrlicht", 10, 6, 1), L("schlammkroete", 7, 5, 1)] },
};
