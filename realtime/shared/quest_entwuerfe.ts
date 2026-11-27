/*
 * Riftmere – Quests im Entwurf: fertig geschrieben, aber noch nicht im Spiel, weil Bausteine aus anderen Issues fehlen (Rezepte, Gegenstände, Stationen).
 * Der Prüfer (test/questbau.test.mjs) prüft sie wie alle Quests und meldet fehlende Bausteine als „wartet auf …“ statt als Fehler.
 * Server und Browser lesen diese Liste NICHT. Ist alles da: Quest hier austragen und in shared/quests.ts eintragen.
 */
import type { QuestDef } from "./questbau";
import { QUEST_STEINHAG_DIEB, QUEST_STEINHAG_BURGWACHE, QUEST_STEINHAG_EINTOPF } from "./quest_steinhag";

/** Entwurf → worauf er wartet (Issue) */
export const ENTWUERFE: { q: QuestDef; wartet: string }[] = [
  { q: QUEST_STEINHAG_DIEB, wartet: "#167: Steinhag als Hauptstadt (Welt baut nach dem Plan a29fc0ee: Seeufer, Stege, Fischerhäuser); Figur Fenn" },
  { q: QUEST_STEINHAG_BURGWACHE, wartet: "#167: Ringmauer mit Ecktürmen und Vogtsburg (Welt); Figuren Ragnhild, Kuno" },
  { q: QUEST_STEINHAG_EINTOPF, wartet: "#167: Zunftviertel mit Abstieg zum Stollen und Zunftwache (Welt, Systeme)" },
];
