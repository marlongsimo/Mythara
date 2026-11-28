/*
 * Riftmere – Quests im Entwurf: fertig geschrieben, aber noch nicht im Spiel, weil Bausteine aus anderen Issues fehlen (Rezepte, Gegenstände, Stationen).
 * Der Prüfer (test/questbau.test.mjs) prüft sie wie alle Quests und meldet fehlende Bausteine als „wartet auf …“ statt als Fehler.
 * Server und Browser lesen diese Liste NICHT. Ist alles da: Quest hier austragen und in shared/quests.ts eintragen.
 */
import type { QuestDef } from "./questbau";
import { QUEST_I4 } from "./quest_ockerlande";
import { QUEST_ANKERHOLM } from "./quest_ankerholm";
import { QUEST_PECHTANN_WILDSCHWEINE, QUEST_PECHTANN_HARZEIMER } from "./quest_pechtann";

/** Entwurf → worauf er wartet (Issue) */
export const ENTWUERFE: { q: QuestDef; wartet: string }[] = [
  { q: QUEST_PECHTANN_WILDSCHWEINE, wartet: "Welt: Pechtann im Westwald (c3103542, Streifgebiet Wildschweine im Westwald) auf ausgabe/naechste (#189)" },
  { q: QUEST_PECHTANN_HARZEIMER, wartet: "Welt: Pechtann im Westwald (c3103542, Harzlichtung, Verfallene Pechhütte) auf ausgabe/naechste (#189)" },
  { q: QUEST_ANKERHOLM, wartet: "#190 Einsteiger-Insel: Welt (Insel Ankerholm, Steg der Waldmark), Figuren (Telse, Arvid, Merle, Hauke, Puppen, Plünderer, Ole), Systeme (Start auf der Insel, Übungspuppen puppe_nah/puppe_fern/puppe_magie, Überfahrt nach „ablegen“), Integration (Baum kiefer, stamm_kiefer, Rezept schiffsbeschlaege, Gegner pluenderer und schwarzer_ole)" },
  { q: QUEST_I4, wartet: "Block I: Gegner ockermutter (Systeme/Figuren), ihr Bau unter der Ockerkanzel als Instanz (Welt)" },
];
