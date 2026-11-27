/*
 * Riftmere Echtzeit – Kräuter sammeln mit der Sichel (Kräuterkunde, Phase 5c #133; shared/kraeuter.ts). Gemeinsamer Sammel-Kern (sammeln.ts):
 *   · Fundstelle antippen (Sichel im Rucksack), alle 3 Ticks ein Schnitt; Erfolg → ein Kraut und XP, mit 25 % dazu 5–15 Splitter.
 *   · Tau: manchmal (12 %) glitzern die Blätter; wer binnen 1,5 s antippt, bekommt zwei Kräuter und 50 % mehr XP.
 *   · Danach ist die Stelle mit der Chance „fall“ abgeerntet (für alle), bis das Kraut nachwächst.
 * Jedes Kraut meldet der Quest { art: "sammeln", ziel: <Kraut> } (z. B. „wegerich“ für „Miras Rezeptbuch“).
 */
import { KRAEUTER, KRAUTSTELLEN, krautstelle, SICHELN, BERUF_KRAEUTER, KRAUT_TAKT_MS, KRAUT_WEIT, TAU_CHANCE, TAU_MS } from "../../shared/kraeuter";
import { sammelBeruf } from "./sammeln";

const K = sammelBeruf({
  beruf: BERUF_KRAEUTER, t: "kraut", liste: "kraeuter", arten: KRAEUTER, ziel: krautstelle, werkzeuge: SICHELN, env: "KRAUT",
  taktMs: KRAUT_TAKT_MS, weit: KRAUT_WEIT, momentChance: TAU_CHANCE, momentMs: TAU_MS, tatErtrag: "ernte", tatMoment: "tau", grundLeer: "leer",
  texte: { gast: "Kräuter sammeln geht mit Konto (Menü → Anmelden).", unbekannt: "Hier wächst nichts.", nah: "Geh näher an die Pflanze.", ohneWerkzeug: "Du brauchst eine Sichel im Rucksack.",
    werkzeugLevel: (l) => `Mit dieser Sichel sammelst du erst ab Kräuterkunde ${l}.`, weg: (a) => `Hier ist schon aller ${a.name} geschnitten. Er wächst bald nach.`,
    level: (a) => `Für ${a.name} brauchst du Kräuterkunde ${a.level}.` },
});
export const krautEinrichten = K.einrichten, krautStart = K.start, krautStop = K.stop, krautTau = K.moment, krautTakt = K.takt, krautWeg = K.weg, abgeschnittene = K.erschoepfte, krautZuruecksetzen = K.zuruecksetzen;
export { KRAUTSTELLEN };
