/*
 * Riftmere – Quests im Entwurf: fertig geschrieben, aber noch nicht im Spiel, weil Bausteine aus anderen Issues fehlen (Rezepte, Gegenstände, Stationen).
 * Der Prüfer (test/questbau.test.mjs) prüft sie wie alle Quests und meldet fehlende Bausteine als „wartet auf …“ statt als Fehler.
 * Server und Browser lesen diese Liste NICHT. Ist alles da: Quest hier austragen und in shared/quests.ts eintragen.
 */
import type { QuestDef } from "./questbau";
import { QUEST_H2 } from "./quest_h2";
import { QUEST_H3 } from "./quest_h3";
import { QUEST_H4 } from "./quest_h4";

/** Entwurf → worauf er wartet (Issue) */
export const ENTWUERFE: { q: QuestDef; wartet: string }[] = [
  { q: QUEST_H2, wartet: "#118: questFigur der Hochland-Bewohner (laeden.ts), Afras Laden; Welt-Test" },
  { q: QUEST_H3, wartet: "#118: questFigur der Hochland-Bewohner (laeden.ts); Welt-Test" },
  { q: QUEST_H4, wartet: "#162: Instanzen horst_grauhorn und eishoehle_hochpass (Welt); Welt-Test" },
];
