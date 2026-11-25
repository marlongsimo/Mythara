/*
 * Mythara – Bergbau in der 3D-Welt (shared/bergbau.ts, Server: server/src/bergbau.ts; Ablauf: sammeln3d.ts).
 * Erzadern liegen in Senken (Modelle der Figuren-Fabrik, img/objekte3d/skilling/bergbau/, voll und leer). Abgebaut ist eine Ader für alle grau, bis sie sich füllt.
 * Antippen: hingehen und abbauen. Der Held schlägt beidhändig mit der Spitzhacke aus dem Rucksack (Waffe und Schild sind so lange weg).
 * Riss: die Adern im Gestein glühen hell auf – die Ader schnell antippen.
 */
import { ERZADERN, ADERN, ErzArt, BERUF_BERG } from "../../../shared/bergbau";
import { bergBitten } from "../welt";
import { SammelWelt } from "./sammeln3d";
import type { Welt3D } from "./motor";

const HACKEN_MODELL: Record<string, string> = { spitzhacke_training: "training", spitzhacke_einfach: "gewoehnlich", spitzhacke_selten: "", spitzhacke_episch: "episch", spitzhacke_legendaer: "legendaer", spitzhacke_mythisch: "mythisch" };

export class BergWelt extends SammelWelt {
  constructor(u: { motor: Welt3D; ort: { x: number; y: number }; figur: unknown }) {
    super(u, {
      beruf: BERUF_BERG, berufName: "Bergbau", ereignis: "ez-berg", liste: "ez-adern", ziele: ERZADERN, bitten: (tat, id) => bergBitten(tat as "start" | "riss" | "stop", id),
      def: (a) => { const D = ADERN[a as ErzArt]; return { name: D.name, level: D.level, xp: D.xp, ertrag: D.ertrag, modell: D.modell, leer: D.leer, mass: D.groesse, farbe: D.farbe, weiblich: D.name !== "Splitterfelsen" && D.name !== "Urgestein" }; },
      tatErtrag: "erz", tatMoment: "riss", grundLeer: "leer",
      werkzeugUrl: (g) => `img/objekte3d/skilling/utensilien/spitzhacke${HACKEN_MODELL[g] ? "." + HACKEN_MODELL[g] : ""}.glb`, werkzeugStandard: "spitzhacke_training", clip: "hieb2h",
      massArt: "laenge", durchsicht: false, spanFarbe: 0x8f8a82,
      texte: { tun: (D) => `${D.name} abbauen`, start: (D, art) => `Du schlägst die Spitzhacke in ${art("akk")} ${D.name} …`, moment: "Riss! Tippe schnell die Ader an!", momentKnopf: "Riss!",
        leerKnopf: "Leere Ader ansehen", einStueck: "ein Erz", je: "je Erz",
        leer: (D, art) => `${art("nom").replace(/^./, (c) => c.toUpperCase())} ${D.name} ist erschöpft. Sie füllt sich bald wieder.`,
        leerAnsehen: (D) => `Die ${D.name} ist leer. Bald ist wieder Erz darin.` },
    });
  }
}
