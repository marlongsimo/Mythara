/*
 * Riftmere – Seelenlichter einfangen (Splitterbinden, shared/splitterbinden.ts; Server: server/src/lichter.ts; Ablauf: sammeln3d.ts). Phase 3a.
 * Licht antippen: hingehen und einfangen (ohne Werkzeug). Verloschen ist es für alle weg, bis es wieder leuchtet.
 * Modell der Figuren-Fabrik (img/objekte3d/wahrzeichen/seelenlicht.glb), je Art getönt: Mattes Licht bläulich-weiß, Wiesenlicht grün.
 */
import { SEELENLICHTER, LICHTER, LichtArt, BERUF_BINDEN } from "../../../shared/splitterbinden";
import { lichtBitten } from "../welt";
import { SammelWelt } from "./sammeln3d";
import type { Welt3D } from "./motor";

const MODELL = "img/objekte3d/wahrzeichen/seelenlicht.glb";
export class LichterWelt extends SammelWelt {
  constructor(u: { motor: Welt3D; ort: { x: number; y: number }; figur: unknown }) {
    super(u, {
      beruf: BERUF_BINDEN, berufName: "Splitterbinden", ereignis: "ez-licht", liste: "ez-lichter", ziele: SEELENLICHTER, bitten: (tat, id) => lichtBitten(tat as "start" | "stop", id),
      def: (a) => { const D = LICHTER[a as LichtArt]; return { name: D.name, level: D.level, xp: D.xp, ertrag: D.ertrag, modell: MODELL, leer: "", mass: 0.7, schweben: D.hoehe, farbe: D.farbe, weiblich: false }; },
      tatErtrag: "fang", tatMoment: "moment", grundLeer: "leer", werkzeugUrl: () => "", werkzeugStandard: "", clip: "",
      massArt: "hoehe", durchsicht: false, spanFarbe: 0xc9b8ff,
      texte: { tun: (D) => `${D.name} einfangen`, start: (D) => `Du streckst die Hände nach dem ${D.name} aus …`, moment: "", momentKnopf: "", leerKnopf: "Verloschen", einStueck: "ein Seelenlicht", je: "je Seelenlicht",
        leer: (D) => `Das ${D.name} ist verloschen. Es leuchtet bald wieder.`, leerAnsehen: (D) => `Hier schwebte ein ${D.name}. Es leuchtet bald wieder.` },
    });
  }
}
