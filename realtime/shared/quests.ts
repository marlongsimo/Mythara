/*
 * Riftmere – alle Quests des Baukastens (shared/questbau.ts). Eine Liste für Server (questmotor.ts), Browser und Tests.
 * Neue Quest: Datei shared/questNN.ts mit den Daten anlegen und hier eintragen – sonst nichts.
 */
import { schalter as schalterVon, moeglich, gilt, type QuestDef } from "./questbau";
import { WEGSTEIN_ZIELE, type WegZiel } from "./wegstein";
import { QUEST1 } from "./quest01";
import { QUEST2 } from "./quest02";
import { QUEST3 } from "./quest03";
import { QUEST_A1 } from "./quest_a1";
import { QUEST_A2 } from "./quest_a2";
import { QUEST_A3 } from "./quest_a3";
import { QUEST_B1 } from "./quest_b1";
import { QUEST_SCHILF } from "./quest_schilf";
import { QUEST_TAVERNE } from "./quest_taverne";
import { QUEST_B2 } from "./quest_b2";
import { QUEST_B3 } from "./quest_b3";
import { QUEST_B4 } from "./quest_b4";
import { QUEST_S5 } from "./quest_s5";
import { QUEST_S9 } from "./quest_s9";
import { QUEST_S2 } from "./quest_s2";
import { QUEST_MIRA } from "./quest_mira";
import { QUEST_KRAEUTERHOF } from "./quest_kraeuterhof";
import { QUEST_C1 } from "./quest_c1";
import { QUEST_C2 } from "./quest_c2";
import { QUEST_C3 } from "./quest_c3";
import { QUEST_D1 } from "./quest_d1";
import { QUEST_D2 } from "./quest_d2";
import { QUEST_D3 } from "./quest_d3";
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
import { QUEST_H1 } from "./quest_h1";
import { QUEST_H2 } from "./quest_h2";
import { QUEST_H3 } from "./quest_h3";
import { QUEST_H4 } from "./quest_h4";
import { QUEST_STEINHAG_DIEB, QUEST_STEINHAG_BURGWACHE, QUEST_STEINHAG_EINTOPF } from "./quest_steinhag";
import { QUEST_KIELMUND_LICHTER, QUEST_KIELMUND_KIEL, QUEST_KIELMUND_SUPPE, QUEST_KIELMUND_BRIEF } from "./quest_kielmund";
import { QUEST_I1, QUEST_I2, QUEST_I3 } from "./quest_ockerlande";
import { QUEST_EIBENBOGEN, QUEST_LINDENSTAB } from "./quest_waffen";
import { QUEST_H_EINSIEDLER } from "./quest_h_einsiedler";
import { QUEST_S1 } from "./quest_s1";
import { QUEST_S3 } from "./quest_s3";
import { QUEST_S4 } from "./quest_s4";
import { QUEST_S6 } from "./quest_s6";
import { QUEST_S7 } from "./quest_s7";
import { QUEST_S8 } from "./quest_s8";
import { QUEST_PECHTANN_WILDSCHWEINE, QUEST_PECHTANN_HARZEIMER } from "./quest_pechtann";

export const QUESTS: QuestDef[] = [QUEST1, QUEST2, QUEST3, QUEST_A1, QUEST_A2, QUEST_A3, QUEST_B1, QUEST_SCHILF, QUEST_TAVERNE, QUEST_B2, QUEST_B3, QUEST_B4, QUEST_MIRA, QUEST_KRAEUTERHOF, QUEST_C1, QUEST_C2, QUEST_C3, QUEST_D1, QUEST_D2, QUEST_D3, QUEST_E1, QUEST_E2, QUEST_E3, QUEST_E4, QUEST_SCHAFE, QUEST_GRAEBER, QUEST_F1, QUEST_F2, QUEST_F3, QUEST_F4, QUEST_KARTE, QUEST_G1, QUEST_G2, QUEST_G3, QUEST_G4, QUEST_S1, QUEST_S2, QUEST_S3, QUEST_S4, QUEST_S5, QUEST_S6, QUEST_S7, QUEST_S8, QUEST_S9, QUEST_H1, QUEST_H2, QUEST_H3, QUEST_H4, QUEST_H_EINSIEDLER, QUEST_STEINHAG_DIEB, QUEST_STEINHAG_BURGWACHE, QUEST_STEINHAG_EINTOPF, QUEST_KIELMUND_LICHTER, QUEST_KIELMUND_KIEL, QUEST_KIELMUND_SUPPE, QUEST_KIELMUND_BRIEF, QUEST_I1, QUEST_I2, QUEST_I3, QUEST_EIBENBOGEN, QUEST_LINDENSTAB, QUEST_PECHTANN_WILDSCHWEINE, QUEST_PECHTANN_HARZEIMER];
export const questDef = (id: string): QuestDef | undefined => QUESTS.find((q) => q.id === id);

/** Ist ein Schalter je Spieler an (irgendeine Quest schaltet ihn ein)? stand: Stand einer Quest für diesen Spieler */
export function schalterAn(stand: (id: string) => string, id: string): boolean {
  return QUESTS.some((q) => schalterVon(q, stand(q.id), id) === true); }
/** Darf der Spieler an den Zielscheiben üben? Schalter „zielscheibe_frei“ oder ein Questschritt, der Treffer verlangt (Server und Browser gleich) */
export function zielscheibeFrei(stand: (id: string) => string): boolean {
  return schalterAn(stand, "zielscheibe_frei") || QUESTS.some((q) => q.schritte.some((x) => x.ereignis.art === "treffen" && moeglich(q, stand(q.id), x.id))); }
/** Ist dieses Wegstein-Ziel für den Spieler freigeschaltet? (Server und Browser gleich) */
export function wegzielFrei(stand: (id: string) => string, z: WegZiel): boolean { const q = questDef(z.quest); return Boolean(q && gilt(q, stand(q.id), z.wenn)); }
/** Alle freigeschalteten Ziele */
export const wegzieleFrei = (stand: (id: string) => string): WegZiel[] => WEGSTEIN_ZIELE.filter((z) => wegzielFrei(stand, z));
