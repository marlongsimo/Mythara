/*
 * Mythara – Flachs und Hanf im Osthof (Handwerk, shared/handwerk.ts; Server: server/src/pflanzen.ts; Ablauf: sammeln3d.ts).
 * Pflanze antippen: hingehen und pflücken (ohne Werkzeug). Abgeerntet steht für alle der Stumpf, bis die Pflanze nachwächst.
 */
import { PFLANZEN_STANDORTE, PFLANZEN, PflanzenArt, BERUF_HAND } from "../../../shared/handwerk";
import { pflanzeBitten } from "../welt";
import { SammelWelt } from "./sammeln3d";
import type { Welt3D } from "./motor";

export class PflanzenWelt extends SammelWelt {
  constructor(u: { motor: Welt3D; ort: { x: number; y: number }; figur: unknown }) {
    super(u, {
      beruf: BERUF_HAND, berufName: "Handwerk", ereignis: "ez-pflanze", liste: "ez-pflanzen", ziele: PFLANZEN_STANDORTE, bitten: (tat, id) => pflanzeBitten(tat as "start" | "stop", id),
      def: (a) => { const D = PFLANZEN[a as PflanzenArt]; return { name: D.name, level: D.level, xp: D.xp, ertrag: D.ertrag, modell: D.modell, leer: D.leer, mass: D.hoehe, weiblich: false }; },
      tatErtrag: "ernte", tatMoment: "moment", grundLeer: "leer", werkzeugUrl: () => "", werkzeugStandard: "", clip: "",
      massArt: "hoehe", durchsicht: false, spanFarbe: 0x8fb05a,
      texte: { tun: (D) => `${D.name} pflücken`, start: (D) => `Du pflückst ${D.name} …`, moment: "", momentKnopf: "", leerKnopf: "Abgeerntet", einStueck: "ein Bündel", je: "je Bündel",
        leer: (D) => `Der ${D.name} ist abgeerntet. Er wächst bald nach.`, leerAnsehen: (D) => `Hier ist schon aller ${D.name} gepflückt. Er wächst bald nach.` },
    });
  }
}
