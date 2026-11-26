/*
 * Riftmere – Quests im Entwurf: fertig geschrieben, aber noch nicht im Spiel, weil Bausteine aus anderen Issues fehlen (Rezepte, Gegenstände, Stationen).
 * Der Prüfer (test/questbau.test.mjs) prüft sie wie alle Quests und meldet fehlende Bausteine als „wartet auf …“ statt als Fehler.
 * Server und Browser lesen diese Liste NICHT. Ist alles da: Quest hier austragen und in shared/quests.ts eintragen.
 */
import type { QuestDef } from "./questbau";
import { QUEST_SCHILF } from "./quest_schilf";
import { QUEST_TAVERNE } from "./quest_taverne";
import { QUEST_B2 } from "./quest_b2";
import { QUEST_B3 } from "./quest_b3";
import { QUEST_B4 } from "./quest_b4";
import { QUEST_D1 } from "./quest_d1";
import { QUEST_D2 } from "./quest_d2";
import { QUEST_D3 } from "./quest_d3";
import { QUEST_MIRA } from "./quest_mira";
import { QUEST_C1 } from "./quest_c1";
import { QUEST_C2 } from "./quest_c2";
import { QUEST_C3 } from "./quest_c3";

/** Entwurf → worauf er wartet (Issue) */
export const ENTWUERFE: { q: QuestDef; wartet: string }[] = [
  { q: QUEST_SCHILF, wartet: "#4 Fischen und Kochen" },
  { q: QUEST_TAVERNE, wartet: "#4 Kochen, Herd und Kessel der Taverne" },
  { q: QUEST_B2, wartet: "#6 Quest-Rezepte, Schalter und Werkstatt Weidenhain" },
  { q: QUEST_B3, wartet: "#15 Banditen-Späher, Karrenbrief, Figur in mehreren Quests (Othmar)" },
  { q: QUEST_B4, wartet: "#16 Boss-Baukasten, Instanz, Tür und Schlüssel, Figur in mehreren Quests (Othmar)" },
  { q: QUEST_D1, wartet: "Phase 7: Graufurt (#36), Figuren (#37), Fähre und Kettenglied (Spiel)" },
  { q: QUEST_D2, wartet: "Phase 7: Ostufer und Turm (#36), Ysolde und Turmgegner (#37), Wegstein-Ziel (Spiel)" },
  { q: QUEST_D3, wartet: "Phase 7: Taverne „Zur Furt“ (#36), Alma (#37), Fischen und Kochen 45 (Spiel)" },
  { q: QUEST_MIRA, wartet: "Phase 5c: Kräuterkunde (Sichel, Kessel, Rezept kleiner_heiltrank), Mira als Händlerin und Questfigur" },
  { q: QUEST_C1, wartet: "Phase 6: Novizen, Rezept brueckenplanke, Gegenstände, Figuren in mehreren Quests (Ulf, Bertold)" },
  { q: QUEST_C2, wartet: "Phase 6: Gesang mit Zeitfenster, Verkleidung, Akoluthen und Federmutter, Zufalls-Reihenfolge" },
  { q: QUEST_C3, wartet: "Phase 6: Boss und Instanz, Folgen, Kerkermeister, Lohn nach Wahl" },
];
