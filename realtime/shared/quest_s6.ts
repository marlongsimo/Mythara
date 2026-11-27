/*
 * Riftmere – Quest S6 „Schafe zählen“ (Süden, Block S), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/sueden.md. Schäfer Tamme auf dem Heckenhof: Fünf Schafe sind durch den Zaun.
 * Jedes Schaf ansprechen („Locken“) – es folgt dir (QuestFigur.folgt, shared/folgen.ts) –, am Pferch das Gatter schließen; danach stehen die fünf im Pferch (beiseite).
 * Lohn: Geschick 300 XP, 2 Kuhfleisch, 50 Splitter, 1 Questpunkt. Schafe: Modell schaf3d (#121).
 */
import type { QuestDef, Bed, QuestFigur, Option, Rede } from "./questbau";
import { HECKENHOF, TAMME } from "./quest_s_orte";

export const S6 = "heckenhof_schafe_zaehlen";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const SCHAFE = ["schaf_1", "schaf_2", "schaf_3", "schaf_4", "schaf_5"];
const NAMEN = ["Berta", "Wolke", "die Graue", "Klecks", "die Alte"];
/** im Pferch (Zaun 6499–6509 × 6816–6825), wenn das Gatter zu ist */
const IM_PFERCH: [number, number][] = [[6501.5, 6818.5], [6504.5, 6820.5], [6507.5, 6822.5], [6502.5, 6823.2], [6506.5, 6818.2]];
const LOCKEN = [`${NAMEN[0]} hebt den Kopf, kaut – und trottet dir nach.`, `${NAMEN[1]} blökt beleidigt. Dann kommt sie doch.`, `${NAMEN[2]} sieht dich lange an. Dann folgt sie dir, mit Abstand.`,
  `${NAMEN[3]} hüpft. Schafe hüpfen nicht. ${NAMEN[3]} schon.`, `${NAMEN[4]} braucht eine Weile zum Aufstehen. Aber sie kommt.`];
const SCHAF_FIG: QuestFigur[] = SCHAFE.map((id, i) => { const [x, y] = HECKENHOF.schafe[i];
  return { id, name: `Schaf (${NAMEN[i]})`, modell: "schaf3d", x, y, blick: [0, 1], folgt: { wenn: { erledigt: [id], offen: ["gatter"] }, abstand: 1.5 + i * 0.6 },
    beiseite: { wenn: { erledigt: ["gatter"] }, dx: IM_PFERCH[i][0] - x, dy: IM_PFERCH[i][1] - y, blick: [0, 1] } }; });
const HILFE = ["Fünf sind's. Berta, Wolke, die Graue, Klecks und die Alte. Eins … zwei … fünf.",
  "Geh zu jeder hin und lock sie. Die laufen dir nach, wenn du langsam gehst.", "Dann alle in den Pferch und das Gatter zu. Und dann zählen wir."];

export const QUEST_S6: QuestDef = {
  id: S6, titel: "Schafe zählen", ort: "Heckenhof · südlich von Weidenhain", start: "Sprich mit Schäfer Tamme am Pferch des Heckenhofs.",
  logNeu: "Am Pferch des Heckenhofs steht ein Schäfer und zählt. Und zählt noch einmal.",
  logAngeboten: "Schäfer Tamme auf dem Heckenhof vermisst fünf Schafe.",
  logAbgabe: "Alle fünf sind im Pferch. Sag Tamme Bescheid.",
  logFertig: "Tammes Schafe sind wieder im Pferch. Er zählt sie noch immer – jetzt mit einem Lächeln.",
  geber: "tamme",
  figuren: [TAMME, ...SCHAF_FIG],
  voraussetzungen: [{ text: "„Die gesperrte Straße“ abgeschlossen", wenn: { quest: { id: "die_gesperrte_strasse", phase: ["fertig"] } } }],
  schritte: [
    ...SCHAFE.map((id, i) => ({ id, text: "Die entlaufenen Schafe locken", ereignis: { art: "antwort" as const }, bei: id, gruppe: "schafe", wo: HECKENHOF.schafe[i],
      log: "Such die fünf Schafe auf den Weiden um den Heckenhof und lock sie zum Pferch ({n:schafe})." })),
    { id: "gatter", text: "Das Gatter schließen", ereignis: { art: "objekt", id: "s6_gatter" }, nach: SCHAFE, wo: HECKENHOF.pferch,
      log: "Alle fünf laufen hinter dir. Schließ das Gatter des Pferchs hinter ihnen." },
  ],
  objekte: [
    { id: "s6_gatter", name: "Gatter des Pferchs", x: HECKENHOF.pferch[0], y: HECKENHOF.pferch[1], modell: "stelle", tat: "benutzen", tatText: "Das Gatter schließen", weit: 3,
      braucht: { wenn: { erledigt: SCHAFE }, text: "Noch nicht alle da. Tamme zählt mit." },
      text: "Fünf Schafe drängen sich durch das Gatter. Du schiebst den Riegel vor.", schon: "Das Gatter ist zu.",
      sonst: [{ wenn: NEU, text: "Ein Gatter, das offen steht." }, { wenn: FERTIG, text: "Das Gatter ist zu." }, { wenn: { offen: ["gatter"] }, text: "Noch nicht alle da. Tamme zählt mit." }] },
  ],
  /* Tamme: langsam, zählt in jedem Satz, kennt jedes Schaf beim Namen. */
  dialoge: {
    ...Object.fromEntries(SCHAFE.map((id, i) => [id, {
      reden: [
        { wenn: { ...LAEUFT, offen: [id] }, zeilen: ["Määh."], antworten: ["locken"] } as Rede,
        { wenn: { ...LAEUFT, offen: ["gatter"] }, zeilen: [`${NAMEN[i]} läuft dir nach. Määh.`], antworten: ["tschuess"] } as Rede,
        { zeilen: ["Määh."], antworten: ["tschuess"] } as Rede,
      ],
      optionen: [
        { id: "locken", text: "Locken. (Schnalzen und langsam vorangehen)", folge: [{ f: { erledige: [id], zeilen: [LOCKEN[i] + " ({n:schafe})"] } }] } as Option,
        { id: "tschuess", text: "Weitergehen.", folge: [{ f: { zeilen: ["Määh."] } }] } as Option,
      ],
    }])),
    tamme: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Eins. Zwei. …Zwölf. Siebzehn sollten es sein.", "Fünf fehlen. Der Zaun hat ein Loch. Ich hab's geflickt. Die Schafe waren schneller."],
          antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Eins. Zwei. Drei. …Wo war ich?"], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Siebzehn. Jeden Morgen siebzehn.", "Klecks hüpft immer noch. Sie mag dich."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Vierzehn, fünfzehn, sechzehn … siebzehn!"], antworten: ["fertig"] },
        { wenn: { ...LAEUFT, erledigt: SCHAFE }, zeilen: ["Alle fünf hinter dir! Rein mit ihnen. Gatter zu."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["schaf_1"] }, zeilen: ["Berta hast du! Berta ist die Leiterin. Wo Berta geht, gehen die anderen bald."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Fünf. Auf den Weiden. Irgendwo."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich hole deine Schafe. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Gut. Gut. Langsam gehen, dann folgen sie.", "Und nicht rennen. Wer rennt, verliert Schafe."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Eins. Zwei. …Hm."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "fertig", text: "Alle fünf sind im Pferch.", folge: [{ f: { abschluss: true, zeilen: ["Tamme zählt. Laut, mit dem Finger, einmal, zweimal.",
          "Siebzehn. Danke. Hier – von Rikes Kuh. Sag ihr nicht, dass ich's dir gegeben hab."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Eins. Zwei. …Ja. Geh nur."] } }] },
      ],
    },
  },
  belohnungText: "Belohnung: Geschick 300 XP, 2 Kuhfleisch, 50 Splitter",
  belohnung: { xp: { geschick: 300 }, splitter: 50, gegenstaende: [{ g: "kuhfleisch", n: 2 }] },
  punkte: 1,
};
