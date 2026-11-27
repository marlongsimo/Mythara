/*
 * Riftmere – Quests im Entwurf: fertig geschrieben, aber noch nicht im Spiel, weil Bausteine aus anderen Issues fehlen (Rezepte, Gegenstände, Stationen).
 * Der Prüfer (test/questbau.test.mjs) prüft sie wie alle Quests und meldet fehlende Bausteine als „wartet auf …“ statt als Fehler.
 * Server und Browser lesen diese Liste NICHT. Ist alles da: Quest hier austragen und in shared/quests.ts eintragen.
 */
import type { QuestDef } from "./questbau";
import { QUEST_B4 } from "./quest_b4";
import { QUEST_D1 } from "./quest_d1";
import { QUEST_D2 } from "./quest_d2";
import { QUEST_D3 } from "./quest_d3";

/** Entwurf → worauf er wartet (Issue) */
export const ENTWUERFE: { q: QuestDef; wartet: string }[] = [
  { q: QUEST_B4, wartet: "#16 Boss-Baukasten, Instanz, Tür und Schlüssel, Figur in mehreren Quests (Othmar)" },
  { q: QUEST_D1, wartet: "Phase 7: Graufurt (#36), Figuren (#37), Fähre und Kettenglied (Spiel)" },
  { q: QUEST_D2, wartet: "Phase 7: Ostufer und Turm (#36), Ysolde und Turmgegner (#37), Wegstein-Ziel (Spiel)" },
  { q: QUEST_D3, wartet: "Phase 7: Taverne „Zur Furt“ (#36), Alma (#37), Fischen und Kochen 45 (Spiel)" },
];
