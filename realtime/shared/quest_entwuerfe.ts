/*
 * Riftmere – Quests im Entwurf: fertig geschrieben, aber noch nicht im Spiel, weil Bausteine aus anderen Issues fehlen (Rezepte, Gegenstände, Stationen).
 * Der Prüfer (test/questbau.test.mjs) prüft sie wie alle Quests und meldet fehlende Bausteine als „wartet auf …“ statt als Fehler.
 * Server und Browser lesen diese Liste NICHT. Ist alles da: Quest hier austragen und in shared/quests.ts eintragen.
 */
import type { QuestDef } from "./questbau";
import { QUEST_F1 } from "./quest_f1";
import { QUEST_F2 } from "./quest_f2";
import { QUEST_F3 } from "./quest_f3";
import { QUEST_F4 } from "./quest_f4";
import { QUEST_KARTE } from "./quest_karte";
import { QUEST_G1 } from "./quest_g1";
import { QUEST_G2 } from "./quest_g2";
import { QUEST_G3 } from "./quest_g3";
import { QUEST_G4 } from "./quest_g4";

/** Entwurf → worauf er wartet (Issue) */
export const ENTWUERFE: { q: QuestDef; wartet: string }[] = [
  { q: QUEST_F1, wartet: "Phase 9: Glutsande, Glutbrunn, Karawanenräuber, Selma" },
  { q: QUEST_F2, wartet: "Phase 9: Salzpfanne, Glutskorpion, Rezept pfannenblech, Salz" },
  { q: QUEST_F3, wartet: "Phase 9: Tempel mit Kammer als Instanz, Glutgeist, Sandmutter, Spiegel-Rätsel" },
  { q: QUEST_F4, wartet: "Phase 9: Strom, Nalia, Glutwels, Rezept glutwels_salzkruste" },
  { q: QUEST_KARTE, wartet: "Phase 9: Reisekarte (täglicher Sprung), Kartenstücke, Steinhaut (5c)" },
  { q: QUEST_G1, wartet: "Phase 10: Südstraße, Kielmund, Strandräuber, Kutsche" },
  { q: QUEST_G2, wartet: "Phase 10: Leuchtturm, Hering, Rezepte lampenoel und splitterglut" },
  { q: QUEST_G3, wartet: "Phase 10: Wrack, Klippenhöhlen mit Instanz, Wrackkapitän" },
  { q: QUEST_G4, wartet: "Phase 10: Möwenbucht, Räucherhütte, Rezepte fischernetz und raeucherhering" },
];
