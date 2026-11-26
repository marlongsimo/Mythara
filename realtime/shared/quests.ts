/*
 * Riftmere – alle Quests des Baukastens (shared/questbau.ts). Eine Liste für Server (questmotor.ts), Browser und Tests.
 * Neue Quest: Datei shared/questNN.ts mit den Daten anlegen und hier eintragen – sonst nichts.
 */
import { schalter as schalterVon, moeglich, type QuestDef } from "./questbau";
import { QUEST1 } from "./quest01";
import { QUEST2 } from "./quest02";
import { QUEST3 } from "./quest03";

export const QUESTS: QuestDef[] = [QUEST1, QUEST2, QUEST3];
export const questDef = (id: string): QuestDef | undefined => QUESTS.find((q) => q.id === id);

/** Ist ein Schalter je Spieler an (irgendeine Quest schaltet ihn ein)? stand: Stand einer Quest für diesen Spieler */
export function schalterAn(stand: (id: string) => string, id: string): boolean {
  return QUESTS.some((q) => schalterVon(q, stand(q.id), id) === true); }
/** Darf der Spieler an den Zielscheiben üben? Schalter „zielscheibe_frei“ oder ein Questschritt, der Treffer verlangt (Server und Browser gleich) */
export function zielscheibeFrei(stand: (id: string) => string): boolean {
  return schalterAn(stand, "zielscheibe_frei") || QUESTS.some((q) => q.schritte.some((x) => x.ereignis.art === "treffen" && moeglich(q, stand(q.id), x.id))); }
