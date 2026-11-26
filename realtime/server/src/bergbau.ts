/*
 * Mythara Echtzeit – Bergbau auf dem Server (shared/bergbau.ts). Ablauf wie die Holzfällerei im gemeinsamen Sammel-Kern (sammeln.ts):
 *   · „berg“/„start“: Nähe zur Ader, Bergbau-Level, beste benutzbare Spitzhacke, Ader nicht leer, Platz im Rucksack.
 *   · Alle 3 Ticks ein Schlag: Erfolg → Erz (stapelt nicht) + XP, mit 25 % dazu 5–15 Splitter; danach ist die Ader mit ihrer Chance erschöpft.
 *   · Riss: „berg“/„riss“ im Fenster → zwei Erze, 50 % mehr XP. Leere Adern an alle („adern“; beim Anmelden der Stand).
 */
import { ADERN, erzader, SPITZHACKEN, BERG_TAKT_MS, BERG_WEIT, RISS_CHANCE, RISS_FENSTER_MS, BERUF_BERG } from "../../shared/bergbau";
import { sammelBeruf } from "./sammeln";

const B = sammelBeruf({
  beruf: BERUF_BERG, t: "berg", liste: "adern", arten: ADERN, ziel: erzader, werkzeuge: SPITZHACKEN, env: "BERG",
  taktMs: BERG_TAKT_MS, weit: BERG_WEIT, momentChance: RISS_CHANCE, momentMs: RISS_FENSTER_MS, tatErtrag: "erz", tatMoment: "riss", grundLeer: "leer",
  texte: { gast: "Bergbau geht mit Konto (Menü → Anmelden).", unbekannt: "Diese Erzader gibt es nicht.", nah: "Geh näher an die Ader.", ohneWerkzeug: "Du brauchst eine Spitzhacke.",
    werkzeugLevel: (l) => `Für deine Spitzhacke brauchst du Bergbau ${l}.`, weg: (a) => `Die ${a.name} ist erschöpft. Sie füllt sich bald wieder.`,
    level: (a) => `Für die ${a.name} brauchst du Bergbau ${a.level}.` },
});
export const bergEinrichten = B.einrichten, bergStart = B.start, bergStop = B.stop, bergRiss = B.moment, bergTakt = B.takt, bergWeg = B.weg;
export const leereAdern = B.erschoepfte, bergLevel = B.level, bautAb = B.aktiv, bergZuruecksetzen = B.zuruecksetzen;
