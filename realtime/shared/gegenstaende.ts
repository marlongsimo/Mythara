/*
 * Gegenstände des eigenen Helden (Ausrüstung und Rucksack) – mit ihren Kampfwerten nach den Regeln v1 (shared/kampfwerte.ts).
 * Plätze im Ausrüstungsfenster: Waffe links, Brust (Rüstung) in der Mitte – zu Beginn leer, der Grundkörper trägt Hemd und Hose fest –, Nebenhand (Schild) rechts.
 * Waffe: Angriffsskill, Angriffswert-Bonus, Min-/Max-Schaden, Angriffstakt, Reichweite. Schild und Rüstung: Verteidigungsboni je Angriffsart.
 */
import { Startwaffe } from "./aussehen";

export type Platz = "waffe" | "brust" | "nebenhand";
export type Art = "nah" | "fern" | "magie";
export const PLAETZE: { id: Platz; name: string }[] = [{ id: "waffe", name: "Waffe" }, { id: "brust", name: "Brust" }, { id: "nebenhand", name: "Nebenhand" }];
export interface WaffenWerte { art: Art; bonus: number; schaden: [number, number]; takt: number; reich: number; flug?: number }
export interface Gegenstand { id: string; name: string; platz: Platz; art: string; seltenheit: "gewoehnlich" | "selten"; ebenen?: string[]; waffe?: WaffenWerte; abwehr?: Record<Art, number>; text: string }

const SKILL: Record<Art, string> = { nah: "Stärke", fern: "Geschicklichkeit", magie: "Magie" };
const zahl = (v: number) => String(v).replace(".", ",");
/** Die Werte eines Gegenstands als Zeilen fürs Untersuchen-Fenster */
export function werteVon(G: Gegenstand): [string, string][] {
  if (G.waffe) { const W = G.waffe; return [["Angriffsskill", SKILL[W.art]], ["Angriffswert", `+${W.bonus} ${SKILL[W.art]}`], ["Schaden", `${W.schaden[0]}–${W.schaden[1]}`], ["Angriff alle", `${zahl(W.takt)} s`], ["Reichweite", `${zahl(W.reich)} Felder`]]; }
  if (G.abwehr) return [["Verteidigung Nahkampf", `+${G.abwehr.nah}`], ["Verteidigung Fernkampf", `+${G.abwehr.fern}`], ["Verteidigung Magie", `+${G.abwehr.magie}`]];
  return [];
}

export const GEGENSTAENDE: Record<string, Gegenstand> = {
  ritterschwert: { id: "ritterschwert", name: "Einfaches Schwert", platz: "waffe", art: "Einhandschwert", seltenheit: "gewoehnlich", ebenen: ["waffe.schwert.ritter"],
    waffe: { art: "nah", bonus: 4, schaden: [4, 8], takt: 1.0, reich: 1.6 }, text: "Eine schlichte, gut ausgewogene Klinge der Waldmark-Schmiede." },
  jagdbogen: { id: "jagdbogen", name: "Einfacher Bogen", platz: "waffe", art: "Bogen", seltenheit: "gewoehnlich", ebenen: ["waffe.bogen.jagd"],
    waffe: { art: "fern", bonus: 4, schaden: [3, 7], takt: 1.5, reich: 9, flug: 18 }, text: "Ein Eibenbogen, wie ihn die Jäger des Kreuzwalds führen." },
  hirtenstab: { id: "hirtenstab", name: "Einfacher Stab", platz: "waffe", art: "Stab", seltenheit: "gewoehnlich", ebenen: ["waffe.stab.hirte"],
    waffe: { art: "magie", bonus: 4, schaden: [4, 8], takt: 1.2, reich: 8, flug: 13 }, text: "Ein knorriger Stab mit gekrümmtem Kopf. In den richtigen Händen bündelt er die Kräfte der Splitter." },
  rundschild: { id: "rundschild", name: "Einfacher Schild", platz: "nebenhand", art: "Schild", seltenheit: "gewoehnlich", ebenen: ["schild.rund"],
    abwehr: { nah: 5, fern: 3, magie: 2 }, text: "Holz mit Eisenbeschlag. Erhöht die Verteidigung – aus allen Richtungen." },
};
/** Die Gegenstände, mit denen ein neuer Held beginnt (nach der Startwaffe) */
export function startAusruestung(w: Startwaffe): Partial<Record<Platz, string>> {
  return w === "schwert" ? { waffe: "ritterschwert", nebenhand: "rundschild" } : w === "bogen" ? { waffe: "jagdbogen" } : { waffe: "hirtenstab" };
}
export const RUCKSACK_PLAETZE = 24;
