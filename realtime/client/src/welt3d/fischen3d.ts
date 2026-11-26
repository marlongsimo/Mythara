/*
 * Riftmere – Fischen und Würmer graben in der 3D-Welt (shared/fischen.ts; Server: server/src/fischen.ts; Ablauf: sammeln3d.ts). Phase 3b.
 *   · Fangstellen: Wellenkreise auf dem Wasser. Nur ein Teil der Stellen eines Fanggrunds ist da – die Fische wandern, die Kreise ziehen mit.
 *   · Antippen: ans Ufer gehen und angeln (Angelrute und Würmer im Rucksack; Moorhecht mit der Reuse). Schäumt das Wasser (Strömung lesen), schnell antippen.
 *   · Wurmacker: frische Erdhäufchen auf dem Acker im Osthof, ohne Werkzeug graben.
 */
import { FISCHE, FischArt, FANGSTELLEN, WURMSTELLEN, WURMACKER_ART, BERUF_FISCHEN } from "../../../shared/fischen";
import { GEGENSTAENDE } from "../../../shared/gegenstaende";
import { fischBitten, wurmBitten } from "../welt";
import { SammelWelt } from "./sammeln3d";
import type { Welt3D } from "./motor";

type U = { motor: Welt3D; ort: { x: number; y: number }; figur: unknown };
const GERAET = (g: string) => (GEGENSTAENDE[g] && GEGENSTAENDE[g].modell3d) || "";
export class FischWelt extends SammelWelt {
  constructor(u: U) {
    super(u, {
      beruf: BERUF_FISCHEN, berufName: "Fischen", ereignis: "ez-fisch", liste: "ez-fanggruende", ziele: FANGSTELLEN, bitten: (tat, id) => fischBitten(tat as "start" | "stop" | "stroemung", id),
      def: (a) => { const F = FISCHE[a as FischArt]; return { name: F.name, level: F.level, xp: F.xp, ertrag: F.ertrag, modell: "", leer: "", mass: 1, weiblich: false }; },
      tatErtrag: "fang", tatMoment: "stroemung", grundLeer: "weiter", werkzeugUrl: GERAET, werkzeugStandard: "", clip: "", angelnMit: "angelrute" /* Rute als Waffenteil und Bewegungen angeln/angeln_warten/angeln_einholen (Figuren, #39) */,
      massArt: "laenge", durchsicht: false, spanFarbe: 0xbfe3ff, prozedural: "wellen", leerUnsichtbar: true,
      texte: { tun: (D) => `${D.name} angeln`, start: (D) => `Du wirfst die Schnur aus und wartest auf einen ${D.name} …`, moment: "Das Wasser schäumt – Strömung lesen!", momentKnopf: "Strömung lesen!", leerKnopf: "",
        leer: () => "Die Fische sind weitergezogen. Such die nächsten Wellenkreise.", leerAnsehen: () => "Hier ist nur Wasser.", einStueck: "einen Fisch", je: "je Fisch" },
    });
  }
}
export class WurmWelt extends SammelWelt {
  constructor(u: U) {
    super(u, {
      beruf: BERUF_FISCHEN, berufName: "Fischen", ereignis: "ez-wurm", liste: "ez-wurmacker", ziele: WURMSTELLEN, bitten: (tat, id) => wurmBitten(tat as "start" | "stop", id),
      def: () => ({ name: "Wurmacker", level: 1, xp: 0, ertrag: WURMACKER_ART.ertrag, modell: "", leer: "", mass: 0.6, weiblich: false }),
      tatErtrag: "grab", tatMoment: "moment", grundLeer: "weiter", werkzeugUrl: () => "", werkzeugStandard: "", clip: "",
      massArt: "laenge", durchsicht: false, spanFarbe: 0x5a3d24, prozedural: "erde", leerUnsichtbar: true,
      texte: { tun: () => "Nach Würmern graben", start: () => "Du gräbst mit den Händen in der Erde …", moment: "", momentKnopf: "", leerKnopf: "", einStueck: "einen Wurm", je: "",
        leer: () => "Hier ist alles umgegraben. Ein Stück weiter liegt frische Erde.", leerAnsehen: () => "Umgegrabene Erde." },
    });
  }
}
