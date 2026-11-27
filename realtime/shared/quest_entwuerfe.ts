/*
 * Riftmere – Quests im Entwurf: fertig geschrieben, aber noch nicht im Spiel, weil Bausteine aus anderen Issues fehlen (Rezepte, Gegenstände, Stationen).
 * Der Prüfer (test/questbau.test.mjs) prüft sie wie alle Quests und meldet fehlende Bausteine als „wartet auf …“ statt als Fehler.
 * Server und Browser lesen diese Liste NICHT. Ist alles da: Quest hier austragen und in shared/quests.ts eintragen.
 */
import type { QuestDef } from "./questbau";
import { QUEST_I3, QUEST_I4 } from "./quest_ockerlande";

/** Entwurf → worauf er wartet (Issue) */
export const ENTWUERFE: { q: QuestDef; wartet: string }[] = [
  { q: QUEST_I3, wartet: "Integration: Sammelstellen der Ockerlande (welt/sammelstellen.json, Steinbruch am Roten Tisch) nach shared/bergbau_standorte.json" },
  { q: QUEST_I4, wartet: "Block I: Gegner ockermutter (Systeme/Figuren), ihr Bau unter der Ockerkanzel als Instanz (Welt)" },
];
