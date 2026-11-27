/*
 * Riftmere – Stellen und Figuren der Quests im Block H (Phase 11, die Hochlande), doku/konzepte/phase-11.md.
 * Orte aus der Welt (welt/hochlande_orte.json, #147), Bewohner aus shared/laeden.ts (#148). Eine Figur, die schon ein Bewohner ist,
 * steht in der Quest mit demselben Namen, Modell und Platz; der Bewohner bekommt dafür „questFigur“ (Inhalt der Integration, #118).
 * Gegnerplätze aus shared/weltzonen.ts (Lager, Weltfelder). Hüter-Instanzen: shared/bosse.ts (Trollhalle im Bergwerk; Horst und Eishöhle baut die Welt, #162).
 * Das Bergwerk am Erzberg ist eine Unterwelt-Region (hochlande_bergwerk, Weltfelder ab 11584 | 9600).
 */
import type { QuestFigur } from "./questbau";

export type Feld = [number, number];

/* ───── bekannte Figuren aus anderen Blöcken (gleich in jeder Quest) ───── */
export const WIGAND: QuestFigur = { id: "wigand", name: "Wigand Fels", modell: "stadtwache3d", x: 6708, y: 5706, blick: [0, 1], ausbau: "abtei" }; /* Burg Grauwacht (E3) */
export const MERIT: QuestFigur = { id: "merit", name: "Merit Stahl", modell: "npc.merit", x: 6677.5, y: 6484.5, blick: [0, 1] };     /* vor dem Bergfried Graufurt */
export const METTE: QuestFigur = { id: "mette", name: "Mette Heider", modell: "npcfrau3d", x: 6598.5, y: 5875, blick: [0, 1] };     /* Heidrast */
export const HEDDA: QuestFigur = { id: "hedda", name: "Mutter Hedda", modell: "npc.hedda", x: 6289.4, y: 6677.4, blick: [1, 0] };   /* Rabenmoor */
export const MIRA: QuestFigur = { id: "mira", name: "Mira Kräuterlieb", modell: "npc.kraeuterfrau", x: 6456, y: 6441, blick: [0, -1] }; /* Waldmark */

/* ───── Bewohner der Hochlande (shared/laeden.ts) ───── */
export const ODO: QuestFigur = { id: "furtwache", name: "Wache Odo", modell: "stadtwache3d", x: 6725, y: 5763, blick: [1, 0] };              /* hochland_furtwache */
export const HILDE: QuestFigur = { id: "bergvoegtin", name: "Hilde Erzgrund", modell: "npc.kauffrau", x: 6991, y: 5880, blick: [0, 1] };     /* steinhag_vogt: Bergvögtin */
export const WENDEL: QuestFigur = { id: "wendel", name: "Steiger Wendel", modell: "npc.bergmann", x: 7124, y: 5811, blick: [1, 0] };  /* hochland_steiger */
export const GESCHE: QuestFigur = { id: "gesche", name: "Bergfrau Gesche", modell: "npc.bergfrau", x: 7116, y: 5821.5, blick: [0, 1] }; /* hochland_bergfrau */
export const ANSGAR: QuestFigur = { id: "ansgar", name: "Wächter Ansgar", modell: "npc.passwaechter", x: 6955, y: 5607.6, blick: [0, 1] }; /* hochland_passwaechter */
export const BRUN: QuestFigur = { id: "brun", name: "Wächterin Brun", modell: "npcfrau3d", x: 6964, y: 5608.5, blick: [0, 1] };      /* hochland_passwaechterin */
export const AFRA: QuestFigur = { id: "afra", name: "Sennerin Afra", modell: "npc.sennerin", x: 7199.5, y: 6001.5, blick: [0, 1] };   /* hochland_sennerin */
export const EINSIEDLER: QuestFigur = { id: "einsiedler", name: "Der Einsiedler", modell: "npc.hirte2", x: 7341, y: 5665.4, blick: [0, 1] }; /* hochland_einsiedler */

/* ───── Stellen ───── */
export const STEINHAG: Feld = [6990, 5892];
/** Bergtrolle am Hochpass: Lager 6952 | 5626 (drei, westlich der Mauer unterhalb der Passwacht) und 6970 | 5590 */
export const PASS_TROLLE: Feld = [6946, 5624];
/** Hohe Alm: entlaufene Ziegen auf den Wiesen rings um die Käserei, das Gatter am Pferch (bei den Schafen) */
export const ALM = {
  ziegen: [[7158.5, 5984.5], [7228.5, 5990.5], [7216.5, 6040.5], [7153.5, 6028.5]] as Feld[], /* die vierte östlich des neuen Zauns (Welt) */
  /** im Pferch, wenn das Gatter zu ist */ pferch_ziegen: [[7184.5, 6019.5], [7189.5, 6021.5], [7196.5, 6019.5], [7201.5, 6021.5]] as Feld[],
  gatter: [7193.5, 6020.5] as Feld,
  /** Käsekessel der Sennerin (Station kessel_alm, shared/handwerk.ts) */ kessel: [7198, 6002] as Feld,
  /** Käsekeller unter der Käserei (Region kaesekeller, Abstieg kaesekeller an der Almhütte), Regal mit dem Questobjekt kaeseregal */ keller: [11815.5, 9620] as Feld, regal: [11824, 9611.4] as Feld,
};
/** Bergwerk am Erzberg (Unterwelt hochlande_bergwerk): morsche Stempel im Stollen, Geröll vor dem tiefen Stollen, dahinter drei verschüttete Bergleute */
export const BERGWERK = {
  eingang: [7128, 5808] as Feld, start: [11607.5, 9628] as Feld,
  stempel: [[11599.5, 9624.5], [11617.5, 9640.5], [11631.5, 9645.5]] as Feld[],
  ader: [11636.5, 9650.5] as Feld,
  geroell: [11631.5, 9657.5] as Feld,
  verschuettet: [[11630.5, 9660.5], [11632.5, 9661.5], [11630.5, 9662.5]] as Feld[],
};
/** Grauhorn und Hochpass: Federn auf dem Weg zum Horst der Sturmschwinge, Eisrunen am Hochpass, Steinmänner am Grauhorn (Nebenquest) */
export const GRAUHORN = {
  /** am Steinmann-Pfad vom Hochpass zum Gipfel (Welt, fl_216_169) */ federn: [[6985.5, 5585.5], [7003.5, 5570.5], [7018.5, 5558.5]] as Feld[],
  /** Aufstieg zum Horst (Eingang horst_aufstieg → Instanz horst_grauhorn, Welt #162) */ horst: [7028.5, 5549.5] as Feld,
  steinmaenner: [[7010.5, 5585.5], [7030.5, 5560.5], [6960.5, 5545.5]] as Feld[],
};
export const HOCHPASS = {
  /** Eisrunen am Höhlenmund (Welt: Lesestelle eisrunen) */ runen: [6953.5, 5635.5] as Feld,
  /** Eingang der Eishöhle (eishoehle_eingang → Instanz eishoehle_hochpass, Welt #162) */ hoehle: [6950.5, 5633.5] as Feld,
};
/** Trollhalle im Bergwerk (Instanz trollhalle, shared/bosse.ts: Feld 11595–11618 × 9602–9624, Grumhold bei 11607,5 | 9611,5) */
export const TROLLHALLE: Feld = [11607.5, 9614.5];
