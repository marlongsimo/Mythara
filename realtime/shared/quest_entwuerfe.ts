/*
 * Riftmere – Quests im Entwurf: fertig geschrieben, aber noch nicht im Spiel, weil Bausteine aus anderen Issues fehlen (Rezepte, Gegenstände, Stationen).
 * Der Prüfer (test/questbau.test.mjs) prüft sie wie alle Quests und meldet fehlende Bausteine als „wartet auf …“ statt als Fehler.
 * Server und Browser lesen diese Liste NICHT. Ist alles da: Quest hier austragen und in shared/quests.ts eintragen.
 */
import type { QuestDef } from "./questbau";
import { QUEST_D1 } from "./quest_d1";
import { QUEST_D2 } from "./quest_d2";
import { QUEST_D3 } from "./quest_d3";
import { QUEST_C1 } from "./quest_c1";
import { QUEST_C2 } from "./quest_c2";
import { QUEST_C3 } from "./quest_c3";
import { QUEST_E1 } from "./quest_e1";
import { QUEST_E2 } from "./quest_e2";
import { QUEST_E3 } from "./quest_e3";
import { QUEST_E4 } from "./quest_e4";
import { QUEST_SCHAFE, QUEST_GRAEBER } from "./quest_e_neben";
import { QUEST_F1 } from "./quest_f1";
import { QUEST_F2 } from "./quest_f2";
import { QUEST_F3 } from "./quest_f3";
import { QUEST_F4 } from "./quest_f4";
import { QUEST_KARTE } from "./quest_karte";
import { QUEST_G1 } from "./quest_g1";
import { QUEST_G2 } from "./quest_g2";
import { QUEST_G3 } from "./quest_g3";
import { QUEST_G4 } from "./quest_g4";
import { QUEST_KRAEUTERHOF } from "./quest_kraeuterhof";

/** Entwurf → worauf er wartet (Issue) */
export const ENTWUERFE: { q: QuestDef; wartet: string }[] = [
  { q: QUEST_D1, wartet: "Phase 7: Graufurt (#36), Figuren (#37), Fähre und Kettenglied (Spiel)" },
  { q: QUEST_D2, wartet: "Phase 7: Ostufer und Turm (#36), Ysolde und Turmgegner (#37), Wegstein-Ziel (Spiel)" },
  { q: QUEST_D3, wartet: "Phase 7: Taverne „Zur Furt“ (#36), Alma (#37), Fischen und Kochen 45 (Spiel)" },
  { q: QUEST_C1, wartet: "Phase 6: Novizen, Rezept brueckenplanke, Gegenstände" },
  { q: QUEST_C2, wartet: "C1 „Schwarze Federn“ (Voraussetzung); sonst alles da (Federmutter, moorwachs)" },
  { q: QUEST_C3, wartet: "Phase 6: Boss und Instanz, Folgen, Kerkermeister, Lohn nach Wahl" },
  { q: QUEST_E1, wartet: "Phase 8: Nordsaum-Weg, Heidrast, Abtei (Welt), Mette und Gunhild (Figuren), Rudelführer" },
  { q: QUEST_E2, wartet: "Phase 8: Abtei und Glockenturm, Rezepte glockenbronze/glocke/kloeppel, Glocke als Weltereignis" },
  { q: QUEST_E3, wartet: "Phase 8: Grenzposten, Deserteure, Figur wird Gegner (Tjark), Wahl im Stand" },
  { q: QUEST_E4, wartet: "Phase 8: Grab des Hauptmanns als Instanz, Grabwächter, Grauer Hauptmann, Selten-Langschwert als Lohn" },
  { q: QUEST_SCHAFE, wartet: "Phase 8: Heidrast, Heidewolf, Rezept hammeleintopf" },
  { q: QUEST_GRAEBER, wartet: "Phase 8: Hügelgräber, Grablicht (Seelenlicht 35)" },
  { q: QUEST_F1, wartet: "Phase 9: Glutsande, Glutbrunn, Karawanenräuber, Selma" },
  { q: QUEST_F2, wartet: "Phase 9: Salzpfanne, Glutskorpion, Rezept pfannenblech, Salz" },
  { q: QUEST_F3, wartet: "Phase 9: Tempel mit Kammer als Instanz, Glutgeist, Sandmutter, Spiegel-Rätsel" },
  { q: QUEST_F4, wartet: "Phase 9: Strom, Nalia, Glutwels, Rezept glutwels_salzkruste" },
  { q: QUEST_KARTE, wartet: "Phase 9: Reisekarte (täglicher Sprung), Kartenstücke, Steinhaut (5c)" },
  { q: QUEST_G1, wartet: "Phase 10: Südstraße, Kielmund, Strandräuber, Kutsche" },
  { q: QUEST_G2, wartet: "Phase 10: Leuchtturm, Hering, Rezepte lampenoel und splitterglut" },
  { q: QUEST_G3, wartet: "Phase 10: Wrack, Klippenhöhlen mit Instanz, Wrackkapitän" },
  { q: QUEST_G4, wartet: "Phase 10: Möwenbucht, Räucherhütte, Rezepte fischernetz und raeucherhering" },
  { q: QUEST_KRAEUTERHOF, wartet: "Sammelstellen der Beete nach der Quest (Schalter kraeuterhof_beete, Systeme)" },
];
