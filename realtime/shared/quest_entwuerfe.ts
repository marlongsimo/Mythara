/*
 * Riftmere – Quests im Entwurf: fertig geschrieben, aber noch nicht im Spiel, weil Bausteine aus anderen Issues fehlen (Rezepte, Gegenstände, Stationen).
 * Der Prüfer (test/questbau.test.mjs) prüft sie wie alle Quests und meldet fehlende Bausteine als „wartet auf …“ statt als Fehler.
 * Server und Browser lesen diese Liste NICHT. Ist alles da: Quest hier austragen und in shared/quests.ts eintragen.
 */
import type { QuestDef } from "./questbau";

/** Entwurf → worauf er wartet (Issue) */
export const ENTWUERFE: { q: QuestDef; wartet: string }[] = [
];
