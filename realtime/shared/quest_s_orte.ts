/*
 * Riftmere – Stellen für die kurzen Quests im Süden (Block S, doku/konzepte/sueden.md, Issue #124).
 * VORLÄUFIG: Die Orte baut die Welt erst (#120). Bis dahin Platzhalter entlang der Südstraße zwischen Weidenhain (y ≈ 6690) und Kielmund (y ≈ 7300),
 * die Südstraße liegt bei x ≈ 6440 (siehe quest_g_orte.ts). Kommen die Kennungen aus #120, werden nur diese Zahlen getauscht.
 * Figuren, die schon in anderen Quests stehen, kommen mit genau deren Name, Stelle und Modell (Regel „Figur in mehreren Quests“).
 */
import type { QuestFigur } from "./questbau";
type Feld = [number, number];

/** Heckenhof – Gehöft gleich südlich von Weidenhain: Felder, Pferch (S1, S6) */
export const HECKENHOF = { baeuerin: [6452.5, 6760.5] as Feld, feld: [6460.5, 6766.5] as Feld, scheuche: [6462.5, 6770.5] as Feld,
  schaefer: [6440.5, 6772.5] as Feld, pferch: [6436.5, 6778.5] as Feld,
  schafe: [[6420.5, 6790.5], [6470.5, 6795.5], [6455.5, 6806.5], [6430.5, 6801.5], [6480.5, 6781.5]] as Feld[] };
/** Summweide – Imkerei auf der Blumenwiese (S2) */
export const SUMMWEIDE = { imkerin: [6500.5, 6825.5] as Feld, summen: [[6510.5, 6830.5], [6520.5, 6840.5], [6530.5, 6836.5]] as Feld[], stock: [6536.5, 6848.5] as Feld, wiese: [6505.5, 6832.5] as Feld };
/** Schilfsee mit Reusenkate (S3) */
export const SCHILFSEE = { fischerin: [6395.5, 6880.5] as Feld, steg: [6390.5, 6884.5] as Feld, wand: [6397.5, 6878.5] as Feld };
/** Erlengrund – Sägemühle, Wald, Waldsenke (S4, S8) */
export const ERLENGRUND = { saegemueller: [6490.5, 6950.5] as Feld, rad: [6494.5, 6954.5] as Feld, wald: [6500.5, 6965.5] as Feld,
  spuren: [[6510.5, 6975.5], [6520.5, 6985.5], [6530.5, 6990.5]] as Feld[], senke: [6540.5, 7000.5] as Feld, wand: [6488.5, 6948.5] as Feld };
/** Wegkapelle am Kreuzstein (S7) */
export const KREUZSTEIN = { pilgerin: [6444.5, 6990.5] as Feld, stein: [6446.5, 6993.5] as Feld, lichter: [6452.5, 6998.5] as Feld };
/** Lehmfurt – Schmiede, Steinbruch, Furt über den Kiel (S5) */
export const LEHMFURT = { schmied: [6440.5, 7120.5] as Feld, bruch: [6452.5, 7114.5] as Feld,
  steine: [[6430.5, 7130.5], [6432.5, 7131.5], [6434.5, 7132.5], [6436.5, 7133.5], [6438.5, 7134.5]] as Feld[] };

/* ───────── Figuren des Südens (Modelle vorläufig, bis #121) ───────── */
export const RIKE: QuestFigur = { id: "rike", name: "Rike Heck", modell: "npcfrau3d", x: HECKENHOF.baeuerin[0], y: HECKENHOF.baeuerin[1], blick: [0, 1] };
export const TAMME: QuestFigur = { id: "tamme", name: "Tamme", modell: "npc.alter_bauer", x: HECKENHOF.schaefer[0], y: HECKENHOF.schaefer[1], blick: [0, 1] };
export const IMME: QuestFigur = { id: "imme", name: "Imme Sommer", modell: "npcfrau3d", x: SUMMWEIDE.imkerin[0], y: SUMMWEIDE.imkerin[1], blick: [0, 1] };
export const EBBA: QuestFigur = { id: "ebba", name: "Ebba Ried", modell: "npcfrau3d", x: SCHILFSEE.fischerin[0], y: SCHILFSEE.fischerin[1], blick: [-1, 0] };
export const BODO: QuestFigur = { id: "bodo", name: "Bodo Span", modell: "npcmann3d", x: ERLENGRUND.saegemueller[0], y: ERLENGRUND.saegemueller[1], blick: [0, 1] };
export const ODILA: QuestFigur = { id: "odila", name: "Odila", modell: "npcfrau3d", x: KREUZSTEIN.pilgerin[0], y: KREUZSTEIN.pilgerin[1], blick: [0, 1] };
export const KUNO: QuestFigur = { id: "kuno", name: "Kuno Lehm", modell: "npc.schmied", x: LEHMFURT.schmied[0], y: LEHMFURT.schmied[1], blick: [0, 1] };

/* ───────── Figuren aus älteren Quests – genau so wie dort ───────── */
export const LAMBERT: QuestFigur = { id: "lambert", name: "Lambert Schilf", modell: "npc.lambert", x: 6462.5, y: 6687.5, blick: [1, 0] }; /* quest_schilf.ts */
export const TEBBE: QuestFigur = { id: "tebbe", name: "Tebbe", modell: "npc.tebbe", x: 6458.6, y: 6692.6, blick: [0, 1] }; /* quest_b2.ts */
export const MIRA_F: QuestFigur = { id: "mira", name: "Mira Kräuterlieb", modell: "npc.kraeuterfrau", x: 6456, y: 6441, blick: [0, -1] }; /* quest_mira.ts */
export const AGNES: QuestFigur = { id: "agnes", name: "Agnes", modell: "npc.agnes", x: 6450.5, y: 6681.6, blick: [1, -1] }; /* quest_b1.ts */
export const HARTWIG: QuestFigur = { id: "foerster", name: "Förster Hartwig", modell: "npc.foerster", x: 6362.5, y: 6452.5, blick: [0, 1] }; /* quest03.ts */
export const OTHMAR_F: QuestFigur = { id: "othmar", name: "Othmar Rehn", modell: "npc.alter_bauer", x: 6451.5, y: 6688.5, blick: [0, -1] }; /* quest_b1.ts, G1 */
export const KRANICH: QuestFigur = { id: "kranich", name: "Jasper Kranich", modell: "npcmann3d", x: 6414.5, y: 7299, blick: [0, 1] }; /* quest_g1.ts */
