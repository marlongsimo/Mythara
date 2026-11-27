/*
 * Riftmere – Stellen für die kurzen Quests im Süden (Block S, doku/konzepte/sueden.md, Issue #124).
 * Stellen aus der Welt (#120, Commit 669537df auf claude/mythara-world-pipeline-z4ynx5): welt/sueden_orte.json und welt/festland/plan_sueden.json.
 * NPC-Plätze der Welt: baeuerin_heckenhof (Rike), schaefer_heckenhof (Tamme), imkerin_summweide (Imme), fischerin_schilfsee (Ebba), saegemueller (Bodo), schmied_lehmfurt (Kuno).
 * Vorschläge der Rolle Quests, weil die Welt sie nicht nennt: Odila an der Kapelle, die Stellen des Summens und des Bienenstocks, die Schafe, die Spuren zur Waldsenke, die Vogelscheuche.
 * Figuren, die schon in anderen Quests stehen, kommen mit genau deren Name, Stelle und Modell (Regel „Figur in mehreren Quests“).
 */
import type { QuestFigur } from "./questbau";
type Feld = [number, number];

/** Heckenhof (Welt: orte.heckenhof 6490 | 6812) – Bäuerin vor dem Haus, Hanf- und Flachsfeld südlich des Zauns, Pferch östlich (Zaun 6499–6509 × 6816–6825, Gatter im Westen) (S1, S6) */
export const HECKENHOF = { baeuerin: [6491, 6813] as Feld, feld: [6479, 6820] as Feld, scheuche: [6488.5, 6820.5] as Feld,
  schaefer: [6504, 6815] as Feld, pferch: [6497.5, 6820.5] as Feld,
  schafe: [[6520.5, 6830.5], [6468.5, 6838.5], [6514.5, 6802.5], [6462.5, 6808.5], [6528.5, 6814.5]] as Feld[] };
/** Summweide (orte.summweide 6418 | 6904) – Imkerin, Bienenstöcke 6408–6421 × 6911 (einer fehlt), Ringelblumen 6410–6422 × 6914,5 (S2) */
export const SUMMWEIDE = { imkerin: [6419, 6907] as Feld, summen: [[6425.5, 6917.5], [6431.5, 6921.5], [6437.5, 6925.5]] as Feld[], stock: [6441.5, 6927.5] as Feld, wiese: [6416.5, 6914.5] as Feld };
/** Schilfsee mit Reusenkate (orte.schilfsee 6450 | 7188) – Fischerin, Steg (begehbar 6440–6448 × 7186,7–7189,3), Reusenkate 6435 | 7184 (S3) */
export const SCHILFSEE = { fischerin: [6437, 7187] as Feld, steg: [6446.5, 7188] as Feld, wand: [6434.5, 7186.5] as Feld };
/** Erlengrund (orte.erlengrund 6392 | 7004) – Sägemüller, Wasserrad 6383,4 | 7005,5, Eichen 6376–6385 × 6990–7015, Waldsenke 6342 | 6968 (S4, S8) */
export const ERLENGRUND = { saegemueller: [6393, 7005] as Feld, rad: [6385, 7006] as Feld, wald: [6380.5, 6992.5] as Feld,
  spuren: [[6372.5, 6990.5], [6360.5, 6982.5], [6350.5, 6974.5]] as Feld[], senke: [6342, 6970.4] as Feld, wand: [6390, 7002.6] as Feld };
/** Wegkapelle am Kreuzstein (orte.kreuzstein 6476 | 7098) – Kapelle 6477 | 7097, Menhir 6473,5 | 7097,5, Wiesenlichter rundum (S7) */
export const KREUZSTEIN = { pilgerin: [6475.5, 7100.5] as Feld, stein: [6477, 7099.2] as Feld, lichter: [6476.4, 7097] as Feld };
/** Lehmfurt (orte.lehmfurt 6466 | 7244) – Schmied, Steinbruch 6500 | 7240, Furt über die Kiel (Sperre 6422–6430 × 7244,5–7248,5 bis lehmfurt_trittsteine): die Steine setzt man vom Ostufer aus (S5) */
export const LEHMFURT = { schmied: [6469, 7244] as Feld, bruch: [6500, 7240] as Feld,
  steine: [[6431, 7244.8], [6431, 7245.6], [6431, 7246.4], [6431, 7247.2], [6431, 7248]] as Feld[] };

/* ───────── Figuren des Südens (Modelle aus #127; Tamme und Odila noch mit vorhandenen Modellen) ───────── */
export const RIKE: QuestFigur = { id: "rike", name: "Rike Heck", modell: "npc.baeuerin", x: HECKENHOF.baeuerin[0], y: HECKENHOF.baeuerin[1], blick: [0, 1] };
export const TAMME: QuestFigur = { id: "tamme", name: "Tamme", modell: "npc.hirte1", x: HECKENHOF.schaefer[0], y: HECKENHOF.schaefer[1], blick: [0, 1] };
export const IMME: QuestFigur = { id: "imme", name: "Imme Sommer", modell: "npc.imkerin", x: SUMMWEIDE.imkerin[0], y: SUMMWEIDE.imkerin[1], blick: [0, 1] };
export const EBBA: QuestFigur = { id: "ebba", name: "Ebba Ried", modell: "npc.schilffischerin", x: SCHILFSEE.fischerin[0], y: SCHILFSEE.fischerin[1], blick: [-1, 0] };
export const BODO: QuestFigur = { id: "bodo", name: "Bodo Span", modell: "npc.saegemueller", x: ERLENGRUND.saegemueller[0], y: ERLENGRUND.saegemueller[1], blick: [0, 1] };
export const ODILA: QuestFigur = { id: "odila", name: "Odila", modell: "npcfrau3d", x: KREUZSTEIN.pilgerin[0], y: KREUZSTEIN.pilgerin[1], blick: [0, 1] };
export const KUNO: QuestFigur = { id: "kuno", name: "Kuno Lehm", modell: "npc.schmied_lehmfurt", x: LEHMFURT.schmied[0], y: LEHMFURT.schmied[1], blick: [0, 1] };

/* ───────── Figuren aus älteren Quests – genau so wie dort ───────── */
export const LAMBERT: QuestFigur = { id: "lambert", name: "Lambert Schilf", modell: "npc.lambert", x: 6462.5, y: 6687.5, blick: [1, 0] }; /* quest_schilf.ts */
export const TEBBE: QuestFigur = { id: "tebbe", name: "Tebbe", modell: "npc.tebbe", x: 6458.6, y: 6692.6, blick: [0, 1] }; /* quest_b2.ts */
export const MIRA_F: QuestFigur = { id: "mira", name: "Mira Kräuterlieb", modell: "npc.kraeuterfrau", x: 6456, y: 6441, blick: [0, -1] }; /* quest_mira.ts */
export const AGNES: QuestFigur = { id: "agnes", name: "Agnes", modell: "npc.agnes", x: 6450.5, y: 6681.6, blick: [1, -1] }; /* quest_b1.ts */
export const HARTWIG: QuestFigur = { id: "foerster", name: "Förster Hartwig", modell: "npc.foerster", x: 6362.5, y: 6452.5, blick: [0, 1] }; /* quest03.ts */
export const OTHMAR_F: QuestFigur = { id: "othmar", name: "Othmar Rehn", modell: "npc.alter_bauer", x: 6451.5, y: 6688.5, blick: [0, -1] }; /* quest_b1.ts, G1 */
export const KRANICH: QuestFigur = { id: "kranich", name: "Jasper Kranich", modell: "npcmann3d", x: 6414.5, y: 7299, blick: [0, 1] }; /* quest_g1.ts */
