/*
 * Riftmere – alle Quests des Baukastens (shared/questbau.ts). Eine Liste für Server (questmotor.ts), Browser und Tests.
 * Neue Quest: Datei shared/questNN.ts mit den Daten anlegen und hier eintragen – sonst nichts.
 */
import type { QuestDef } from "./questbau";
import { QUEST1 } from "./quest01";
import { QUEST2 } from "./quest02";
import { QUEST3 } from "./quest03";

export const QUESTS: QuestDef[] = [QUEST1, QUEST2, QUEST3];
export const questDef = (id: string): QuestDef | undefined => QUESTS.find((q) => q.id === id);
