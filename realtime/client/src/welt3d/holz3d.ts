/*
 * Mythara – Holzfällerei in der 3D-Welt (shared/holz.ts, Server: server/src/holz.ts; Ablauf: sammeln3d.ts).
 * Die Holzfäller-Bäume stehen auf eigenen Lichtungen (Modelle der Figuren-Fabrik, img/objekte3d/skilling/holzfaellerei/): Wind in der Krone,
 * blaue Adern pulsieren. Gefällt steht für alle der Stumpf, bis der Baum nachwächst.
 * Antippen: hingehen und fällen. Der Held schlägt mit dem Beil aus dem Rucksack (Einhand-Hieb, die angelegte Waffe ist so lange weg).
 * Kernschlag: die Adern glühen hell auf – den Baum schnell antippen. Steht der Held unter der Krone, wird der Baum zu 80 % durchsichtig.
 */
import { HOLZBAEUME, BAEUME, BaumArt, BERUF } from "../../../shared/holz";
import { holzBitten } from "../welt";
import { SammelWelt } from "./sammeln3d";
import type { Welt3D } from "./motor";

const BEIL_MODELL: Record<string, string> = { holzbeil_training: "training", holzbeil_einfach: "gewoehnlich", holzbeil_selten: "", holzbeil_episch: "episch", holzbeil_legendaer: "legendaer", holzbeil_mythisch: "mythisch" };
/** Modell eines Holzbeils (auch für das angelegte Beil in der Hand, held3d.ts) */
export const beilUrl = (g: string) => `img/objekte3d/skilling/utensilien/holzbeil${BEIL_MODELL[g] ? "." + BEIL_MODELL[g] : ""}.glb`;
const WEIBLICH = new Set(["eiche", "tanne", "eibe", "moorweide"]);
const gross = (t: string) => t.replace(/^./, (c) => c.toUpperCase());

export class HolzWelt extends SammelWelt {
  constructor(u: { motor: Welt3D; ort: { x: number; y: number }; figur: unknown }) {
    super(u, {
      beruf: BERUF, berufName: "Holzfällerei", ereignis: "ez-holz", liste: "ez-baeume", ziele: HOLZBAEUME, bitten: (tat, id) => holzBitten(tat as "start" | "kern" | "stop", id),
      def: (a) => { const D = BAEUME[a as BaumArt]; return { name: D.name, level: D.level, xp: D.xp, ertrag: D.stamm, modell: D.modell, leer: D.stumpf, mass: D.hoehe, weiblich: WEIBLICH.has(a) }; },
      tatErtrag: "stamm", tatMoment: "kern", grundLeer: "gefallen",
      werkzeugUrl: beilUrl, werkzeugStandard: "holzbeil_training", clip: "",
      massArt: "hoehe", durchsicht: true, spanFarbe: 0xd9b27a,
      texte: { tun: (D) => `${D.name} fällen`, start: (D, art) => `Du schwingst das Beil gegen ${art("akk")} ${D.name} …`, moment: "Kernschlag! Tippe schnell den Baum an!", momentKnopf: "Kernschlag!",
        leerKnopf: "Stumpf ansehen", einStueck: "einen Stamm", je: "je Stamm",
        leer: (D, art) => `${gross(art("nom"))} ${D.name} fällt. Hier wächst bald ${D.weiblich ? "eine neue" : "ein neuer"} nach.`,
        leerAnsehen: (D, art) => `Hier stand ${art("ein")} ${D.name}. ${D.weiblich ? "Sie" : "Er"} wächst bald nach.` },
    });
  }
}
