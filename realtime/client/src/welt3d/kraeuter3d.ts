/*
 * Riftmere – Kräuter sammeln in der 3D-Welt (Kräuterkunde, Phase 5c #133; shared/kraeuter.ts; Server: server/src/kraeuter.ts; Ablauf: sammeln3d.ts).
 * Fundstellen der Welt (#35): Kraut antippen, hingehen und mit der Sichel schneiden. Glitzert Tau auf den Blättern, schnell antippen: zwei Kräuter.
 * Geschnitten steht für alle das abgeerntete Kraut, bis es nachwächst.
 */
import { KRAUTSTELLEN, KRAEUTER, KrautArt, BERUF_KRAEUTER } from "../../../shared/kraeuter";
import { GEGENSTAENDE } from "../../../shared/gegenstaende";
import { krautBitten } from "../welt";
import { SammelWelt } from "./sammeln3d";
import type { Welt3D } from "./motor";

const SICHEL = (g: string) => (GEGENSTAENDE[g] && GEGENSTAENDE[g].modell3d) || "";
export class KraeuterWelt extends SammelWelt {
  constructor(u: { motor: Welt3D; ort: { x: number; y: number }; figur: unknown }) {
    super(u, {
      beruf: BERUF_KRAEUTER, berufName: "Kräuterkunde", ereignis: "ez-kraut", liste: "ez-kraeuter", ziele: KRAUTSTELLEN, bitten: (tat, id) => krautBitten(tat as "start" | "stop" | "tau", id),
      def: (a) => { const D = KRAEUTER[a as KrautArt]; return { name: D.name, level: D.level, xp: D.xp, ertrag: D.ertrag, modell: D.modell, leer: D.leer, mass: D.hoehe, weiblich: false }; },
      tatErtrag: "ernte", tatMoment: "tau", grundLeer: "leer", werkzeugUrl: SICHEL, werkzeugStandard: "sichel", clip: "",
      massArt: "hoehe", durchsicht: false, spanFarbe: 0x9cc46a,
      texte: { tun: (D) => `${D.name} schneiden`, start: (D) => `Du schneidest ${D.name} mit der Sichel …`, moment: "Tau glitzert auf den Blättern – schnell antippen!", momentKnopf: "Tau!", leerKnopf: "Geschnitten",
        einStueck: "ein Kraut", je: "je Kraut", leer: (D) => `Der ${D.name} ist geschnitten. Er wächst bald nach.`, leerAnsehen: (D) => `Hier ist schon aller ${D.name} geschnitten. Er wächst bald nach.` },
    });
  }
}
