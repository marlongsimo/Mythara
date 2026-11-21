/*
 * Die Kampfkarten der Kampagnen (aus dem Würfelspiel übernommen: 12 × 9 Felder, gemalte Bilder).
 * Zeilen als Text: „.“ frei, „~“ Wasser (versperrt den Weg, nicht die Sicht), Buchstaben sind Hindernisse (M Mauer, K Kiste/Sack, T Baum/Schilf).
 */
import type { Lager, Probe } from "./karte";
import { WALDWEG_ZEILEN, WALDWEG_START, WALDWEG_LAGER, WALDWEG_DEKO, WALDWEG_BAEUME } from "./waldweg";
import { KREUZWALD, KREUZWALD_ZEILEN, KREUZWALD_START, KREUZWALD_LAGER, KREUZWALD_MEHRKAMPF, UNTERSCHLUPF, UNTERSCHLUPF_ZEILEN, UNTERSCHLUPF_START, UNTERSCHLUPF_LAGER, UNTERSCHLUPF_MEHRKAMPF } from "./weltzonen";
/** Kampfgebiete der offenen Welt: Region der Welt → Karte der gemeinsamen Simulation (werkzeug/weltzonen.py) */
export const WELTZONEN: Record<string, { karte: string; x0: number; y0: number; b: number; h: number }> = { [KREUZWALD.region]: { karte: "kreuzwald", x0: KREUZWALD.x0, y0: KREUZWALD.y0, b: KREUZWALD.b, h: KREUZWALD.h },
  [UNTERSCHLUPF.region]: { karte: "unterschlupf", x0: UNTERSCHLUPF.x0, y0: UNTERSCHLUPF.y0, b: UNTERSCHLUPF.b, h: UNTERSCHLUPF.h } };
/** Eine Schleuse: Solange sie offen ist, kriechen alle `takt` Sekunden Gegner aus dem Wasser (an den Quellen, höchstens `max` zugleich).
 *  Schließen: drei Sekunden ungestört am Hebel stehen. Erst wenn sie zu ist, kann der Kampf gewonnen werden. */
export interface Schleuse { x: number; y: number; quellen: number[][]; art: string; takt: number; erst: number; max: number; gesamt: number /* danach ist der Graben leer */ }
/** Ein Ausgang einer begehbaren Strecke: Wer mit dem Helden im Bereich steht (gemalte Felder), kann weiterreisen */
/* nach "welt": zurück in die offene Welt an genau die Stelle, an der man den Ausschnitt verlässt (sofort, ohne Knopf) */
export interface Ausgang { x0: number; x1: number; y0: number; y1: number; nach: "waldmark" | "weidenhain" | "welt"; text: string }
export interface KampfKarte { name: string; bild: string; zeilen: string[]; start: number[][]; lager: Lager[]; schleuse?: Schleuse; probe?: Probe; schuetz?: Lager[];
  /** Strecke statt Kampf: kein Sieg nötig, man verlässt sie über die Ausgänge */ weg?: boolean; ausgaenge?: Ausgang[];
  /** Raster schon in Rechenfeldern; Aggro- und Leinenweite der Monster (Rechenfelder) */ feinZeilen?: boolean; aggro?: number; leine?: number;
  /** Gegner streifen ohne Ziel um ihr Lager (Rechenfelder) */ wandern?: number;
  /** Mehrkampf-Gebiete [x0, y0, x1, y1] in Rechenfeldern; sonst gilt in der offenen Welt Einzelkampf */ mehrkampf?: number[][];
  /** Teil der offenen Welt: Weltfeld der linken oberen Ecke und Region (für den Rückweg und die gemerkte Stelle) */ ursprung?: [number, number]; weltRegion?: string;
  /** Bäume als einzelne Bilder mit Verdeckung (gemalte Felder, s = Maßstab, f = gespiegelt) */ deko?: { b: string; x: number; y: number; s: number; f?: boolean }[]; dekoBilder?: Record<string, { fuss: number[]; w: number; h: number }> }
const L = (art: string, x: number, y: number, gruppe: number): Lager => ({ art, x: x + 0.5, y: y + 0.5, gruppe });

/* Reihenfolge der Kampagnen (wie auf der Weltkarte) und ihrer Kämpfe. Danach richtet sich, was freigeschaltet ist – auf dem Server und im Spiel gleich. */
export const ORTREIHE = ["weidenhain", "rabenmoor", "graufurt", "grauwacht", "hochwacht", "krone"];
export const KAMPFFOLGE: Record<string, string[]> = { weidenhain: ["speicher", "muehle", "wehr"], rabenmoor: ["bohlenweg", "ried", "totenpfad", "schrein"] };
/** Stufe der Aufgabe je Ort: bestimmt mit der Gruppengröße die Stärke der Gegner (Server und Spiel gleich). Rabenmoor ist für Helden auf Stufe 1 anspruchsvoll. */
export const ORTSTUFE: Record<string, number> = { weidenhain: 1, rabenmoor: 2, kreuzwald: 3, unterschlupf: 4 };
/** Gebiete der offenen Welt mit gemeinsamen Kampfzonen (keine Kampagne): immer frei */
export const WELTGEBIETE = new Set(["kreuzwald", "unterschlupf"]);
/* Nebenkämpfe: freiwillig, frei, sobald der Ort selbst offen ist; sie zählen nicht für das Ende der Kampagne */
export const NEBENKAEMPFE: Record<string, string[]> = { weidenhain: ["nest", "ufer"] };
/** Strecken zwischen den Orten: immer begehbar */
export const STRECKEN = new Set(["waldweg", "kreuzwald", "unterschlupf"]);
const geschafft = (siege: Set<string>, ort: string) => { const f = KAMPFFOLGE[ort]; return Boolean(f && f.length && siege.has(ort + "/" + f[f.length - 1])); };
/** Wie viele Kampagnen der Reihe nach geschafft sind (Siege als „ort/kampf“) */
export function geschaffteKampagnen(siege: Set<string>): number { let n = 0; while (n < ORTREIHE.length && geschafft(siege, ORTREIHE[n])) n++; return n; }
/** Darf dieser Kampf begonnen werden? Erster Kampf eines Ortes: die vorige Kampagne ist geschafft. Sonst: der Kampf davor ist gewonnen. Gewonnene Kämpfe darf man wiederholen. */
export function darfKaempfen(siege: Set<string>, ort: string, kampf: string): boolean {
  if (STRECKEN.has(kampf)) return ORTREIHE.includes(ort) || WELTGEBIETE.has(ort);
  const f = KAMPFFOLGE[ort], o = ORTREIHE.indexOf(ort); if (o >= 0 && (NEBENKAEMPFE[ort] || []).includes(kampf)) return o === 0 || geschafft(siege, ORTREIHE[o - 1]);
  const i = f ? f.indexOf(kampf) : -1; if (i < 0 || o < 0) return false;
  if (i > 0) return siege.has(ort + "/" + f[i - 1]); return o === 0 || geschafft(siege, ORTREIHE[o - 1]);
}
/** Rechenfelder je gemaltem Feld (siehe setzeKarte) */
export const FEIN = 2;
export const KARTEN: Record<string, KampfKarte> = {
  /* Der Waldweg von der Waldmark nach Weidenhain (werkzeug/waldweg.py): links die Waldmark, rechts Weidenhain. An der Kreuzung führt ein Pfad nach oben auf eine Lichtung,
     auf der zwei Krötengruppen hausen. Sie greifen an, sobald ein Held auf 7 Rechenfelder herankommt, und verfolgen ihn ein gutes Stück. */
  waldweg: { name: "Der Waldweg", bild: "img/welt/waldweg.webp", zeilen: WALDWEG_ZEILEN, feinZeilen: true, start: WALDWEG_START, aggro: 7, leine: 16, weg: true,
    lager: WALDWEG_LAGER.map((l) => ({ ...l })), deko: WALDWEG_DEKO, dekoBilder: WALDWEG_BAEUME,
    ausgaenge: [{ x0: 0, x1: 0.8, y0: 0, y1: 18, nach: "waldmark", text: "Zurück in die Waldmark" }, { x0: 39.2, x1: 40, y0: 0, y1: 18, nach: "weidenhain", text: "Weiter nach Weidenhain" }] },
  /* Der Kreuzwald als Kampfgebiet der offenen Welt (werkzeug/weltzonen.py): die ganze Region als gemeinsame Simulation. Auf der Lichtung
     streifen vier Dolch-Banditen der Stufe 3 umher und greifen an, sobald ein Held auf 5 Rechenfelder herankommt. Kein eigenes Bild:
     die offene Welt zeigt Gegner und Treffer an derselben Stelle. */
  kreuzwald: { name: "Der Kreuzwald", bild: "", zeilen: KREUZWALD_ZEILEN, feinZeilen: true, start: KREUZWALD_START, aggro: 5, leine: 14, wandern: 4, weg: true,
    ursprung: [KREUZWALD.x0, KREUZWALD.y0], weltRegion: KREUZWALD.region, lager: KREUZWALD_LAGER.map((l) => ({ ...l })), mehrkampf: KREUZWALD_MEHRKAMPF },
  /* Der Unterschlupf unter der Hütte in der Westmark: Hauptquartier der Banditen, neun Dolch-Banditen in sechs Räumen; die Halle ist Mehrkampf */
  unterschlupf: { name: "Der Unterschlupf", bild: "", zeilen: UNTERSCHLUPF_ZEILEN, feinZeilen: true, start: UNTERSCHLUPF_START, aggro: 5, leine: 10, wandern: 2, weg: true,
    ursprung: [UNTERSCHLUPF.x0, UNTERSCHLUPF.y0], weltRegion: UNTERSCHLUPF.region, lager: UNTERSCHLUPF_LAGER.map((l) => ({ ...l })), mehrkampf: UNTERSCHLUPF_MEHRKAMPF },
  /* Der Kornspeicher: links das Tor, rechts das Loch zum Graben, dazwischen Säcke und Fässer */
  speicher: { name: "Der Kornspeicher", bild: "img/weidenhain/speicher.webp",
    zeilen: ["MMMMMMMMMMMM", "MMKK.....KMM", "M..KK..KK.MM", "M..KK..KK.MM", "............", "M..KK..KK.MM", "M.........MM", "MMKK.....KMM", "MMMMMMMMMMMM"],
    start: [[1, 4], [1, 3], [1, 5]],
    lager: [L("schlammkroete", 6, 4, 1), L("schlammkroete", 6, 6, 1), L("schlammkroete", 9, 3, 2), L("schlammkroete", 10, 4, 2)],
    /* sechs Kornsäcke vor den Stapeln: Die Kröten fressen sich hinein */
    schuetz: [L("kornsack", 2, 2, 0), L("kornsack", 5, 3, 0), L("kornsack", 6, 3, 0), L("kornsack", 2, 5, 0), L("kornsack", 5, 5, 0), L("kornsack", 9, 5, 0)],
    probe: { text: "Mindestens 4 Kornsäcke retten", art: "schuetzlinge", wert: 4 } },
  /* Am Mühlgraben: der Graben teilt die Wiese, in der Mitte ein Steg, oben rechts das Mühlhaus */
  muehle: { name: "Am Mühlgraben", bild: "img/weidenhain/muehle.webp",
    zeilen: ["TTT...~~.MMM", "TTTKK.~~KMMM", "TT....~~..MM", "..K...~~..K.", "............", "..K...~~....", "TT....~~.KKT", "TT....~~..TT", "TTT...~~..TT"],
    start: [[0, 4], [1, 3], [1, 5]],
    lager: [L("schlammkroete", 4, 2, 1), L("schlammkroete", 5, 4, 1), L("irrlicht", 8, 4, 2), L("schlammkroete", 9, 5, 2), L("irrlicht", 9, 7, 3), L("schlammkroete", 11, 5, 3)],
    /* der Hebel am Ufer vor dem Mühlhaus; die Kröten kriechen an beiden Ufern aus dem Graben */
    schleuse: { x: 8.5, y: 3.2, quellen: [[5.5, 7.5], [8.5, 7.5], [5.5, 1.5], [8.5, 6.5]], art: "schlammkroete", takt: 10, erst: 7, max: 3, gesamt: 8 },
    probe: { text: "Die Schleuse in unter 60 s schließen", art: "schleuse", wert: 60 } },
  /* Hinter der Scheune (Nebenkampf): ein Tümpel unter dem alten Baum voller Krötenlaich. 16 × 9 Felder, der Tümpel ist flach und begehbar. */
  nest: { name: "Hinter der Scheune", bild: "img/weidenhain/nest.webp",
    zeilen: ["MMMMMMMMMMTTTTTT", "MMMMMMMMMMTTTTTT", "MMMMMMMMMMTTTTTT", "MMMMMMT.....TTTT", ".KKKKKK......KTT", ".KK...K......K.T", "....KK.....KKKTT", "T.....K...TTTTTT", "TTTT......TTTTTT"],
    start: [[1, 6], [2, 7], [0, 5]],
    lager: [{ art: "laich", x: 9.6, y: 4.55, gruppe: 9 }, { art: "laich", x: 10.4, y: 3.4, gruppe: 9 }, { art: "laich", x: 11.6, y: 3.9, gruppe: 9 },
      L("schlammkroete", 8, 5, 1), L("kroetchen", 7, 4, 1), L("kroetchen", 11, 5, 2), L("kroetchen", 12, 4, 2)] },
  /* Am Mühlteich (Nebenkampf): Mettes Kräuterufer, rechts das Wasser. Die Irrlichter huschen einmal davon, wenn sie fast besiegt sind. */
  ufer: { name: "Am Mühlteich", bild: "img/weidenhain/ufer.webp",
    zeilen: ["TTTTTTTTTT....TT", "TTTT.TT....TTTTT", "TTT.........TT~~", "T........T...~~~", ".......KTTK~~~~~", "...........T~~~~", ".KT..........~~T", "TT...........TTT", "TTTT...........T"],
    start: [[1, 4], [1, 5], [2, 3]],
    lager: [{ ...L("irrlicht", 9, 2, 1), blinzeln: true }, { ...L("irrlicht", 11, 3, 1), blinzeln: true }, { ...L("irrlicht", 8, 6, 2), blinzeln: true }, { ...L("irrlicht", 11, 6, 2), blinzeln: true }, L("schlammkroete", 10, 6, 2),
      { ...L("irrlicht", 12, 7, 3), blinzeln: true }, { ...L("irrlicht", 13, 0, 3), blinzeln: true }, L("schlammkroete", 11, 7, 3)] },
  /* ---------- Rabenmoor (gemalte Karten aus dem Würfelspiel, 12 × 9) ---------- */
  /* Der Bohlenweg: ein Steg, nur eine Feldreihe breit; links und rechts eine Insel. Hinter dir im Schilf warten Kröten – wer losläuft, ist eingekesselt. */
  bohlenweg: { name: "Der Bohlenweg", bild: "img/rabenmoor/bohlenweg.webp",
    zeilen: ["~~~~~~~~~~~~", "~..~~~~~~~~~", "T..~~~~~~~.T", "...~~~~~~~..", "............", "K..~~~~~~~.K", "K..~~~~~~~K.", ".~~~~~~~~~~~", "~~~~~~~~~~~~"],
    start: [[1, 3], [2, 3], [1, 5]],
    lager: [L("schlammkroete", 6, 4, 1), L("irrlicht", 5, 4, 1), L("schlammkroete", 10, 4, 2), L("irrlicht", 10, 3, 2), L("irrlicht", 10, 5, 2), L("schlammkroete", 10, 2, 2), L("schlammkroete", 11, 3, 2)] },
  /* Das Ried: Schlamminseln zwischen gewundenen Wasserläufen; Kröten in drei Gruppen, Irrlichter, die davonhuschen */
  ried: { name: "Das Ried", bild: "img/rabenmoor/ried.webp",
    zeilen: ["TTTTT~~..TTT", "TT..~~~...TT", "........K~~.", "...~T....~~.", "~~~...~~~...", "...~........", "...~~....K~T", "TT..~.~~~.TT", "TTT...~~.TTT"],
    start: [[1, 3], [1, 2], [2, 3]],
    lager: [L("schlammkroete", 6, 2, 1), L("schlammkroete", 7, 3, 1), { ...L("irrlicht", 8, 1, 1), blinzeln: true }, L("schlammkroete", 10, 4, 2), L("schlammkroete", 11, 5, 2), { ...L("irrlicht", 10, 5, 2), blinzeln: true },
      L("schlammkroete", 6, 6, 3), L("kroetchen", 7, 5, 3), L("kroetchen", 8, 6, 3)] },
  /* Der Totenpfad: ein Damm aus Wurzeln zwischen schwarzen Tümpeln. Die Ertrunkenen stehen einmal wieder auf. */
  totenpfad: { name: "Der Totenpfad", bild: "img/rabenmoor/totenpfad.webp",
    zeilen: ["~~~~~~~~~~~~", "~T~~~~TT~~T~", ".T..~T....M.", "...T~..K.~..", "............", "...~T..~~..T", "TK.....~~.KT", "T~~~~~~T.~~T", "~~~~~~~~~~~~"],
    start: [[1, 4], [0, 4], [1, 3]],
    lager: [L("moorleiche", 5, 4, 1), L("moorleiche", 6, 3, 1), L("irrlicht", 8, 2, 2), L("moorleiche", 9, 4, 2), L("moorleiche", 10, 3, 2), L("irrlicht", 11, 4, 2)] },
  /* Der versunkene Schrein: Alwine, die Stumme, zwischen sechs Spiralsteinen. Ihre Wehklage trifft alles in der Nähe; sie ruft Irrlichter. */
  schrein: { name: "Der versunkene Schrein", bild: "img/rabenmoor/schrein.webp",
    zeilen: ["~~~~~~~~~~~~", "~~~~.....T~~", "~~T.M...M.~~", "~~...MM....~", "~~M..KK..M.~", "~T........K~", "~~..M..M.T~~", "~~~T....T~~~", "~~~~~~~~~~~~"],
    start: [[5, 7], [6, 7], [4, 7]],
    lager: [L("alwine", 6, 2, 1), L("moorleiche", 3, 3, 1), L("moorleiche", 8, 3, 1), L("irrlicht", 5, 1, 1)] },
  /* Das alte Wehr: ein Streifen Ufer zwischen Mühlteich oben und dem Abfluss unten */
  wehr: { name: "Das alte Wehr", bild: "img/weidenhain/wehr.webp",
    zeilen: ["TT~~~~~~~~~T", "TTT~~~~~~MMT", ".TT......MM.", "............", ".T..........", "TTT.......K.", "............", "MMMMMMMMMMMM", "T~~~~~~~~~~~"],
    start: [[0, 3], [1, 3], [0, 4]],
    lager: [L("alte_unke", 9, 4, 1), L("irrlicht", 8, 2, 1), L("irrlicht", 10, 6, 1), L("schlammkroete", 7, 5, 1)],
    probe: { text: "Kein Held vom Giftschwall getroffen", art: "ausweichen" } },
};
