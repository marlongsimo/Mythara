/*
 * Gegenstände des eigenen Helden (Ausrüstung und Rucksack) – mit ihren Kampfwerten nach den Regeln v2 (shared/kampfwerte.ts).
 * Plätze im Ausrüstungsfenster: Waffe links, Brust (Rüstung) in der Mitte – zu Beginn leer, der Grundkörper trägt Hemd und Hose fest –, Nebenhand (Schild) rechts.
 * Waffe: Kampfart, Takt in Ticks (1 Tick = 0,5 s), Reichweite und die Werte ihrer Art – Nahkampf: Geschick- und Stärke-Bonus; Fernkampf: Fernkampfstärke;
 * Magie: Magische Genauigkeit und Schadensbereich. Schild und Rüstung: Verteidigungsboni je Angriffsart.
 * Startausrüstung bewusst schwach, aber klar verschieden: Upgrades sollen sich deutlich bemerkbar machen, die Heldenwerte zählen von Anfang an.
 */
import { Startwaffe } from "./aussehen";

export type Platz = "waffe" | "brust" | "nebenhand";
export type Art = "nah" | "fern" | "magie";
export const PLAETZE: { id: Platz; name: string }[] = [{ id: "waffe", name: "Waffe" }, { id: "brust", name: "Brust" }, { id: "nebenhand", name: "Nebenhand" }];
export interface WaffenWerte { art: Art; /** Takt in Ticks (Normal-Stil) */ ticks: number; reich: number; flug?: number; geschick?: number; staerke?: number; fernStaerke?: number; genau?: number; schaden?: [number, number] }
/** platz fehlt: nicht anlegbar (Währung, Questgegenstand). stapel: so viele passen in ein Rucksackfach (mit Zähler). modell3d: 3D-Modell am Boden. symbol: Bild im Rucksack ohne Figurenebene */
export interface Gegenstand { id: string; name: string; platz?: Platz; art: string; seltenheit: "gewoehnlich" | "selten"; ebenen?: string[]; waffe?: WaffenWerte; abwehr?: Record<Art, number>; text: string;
  stapel?: number; modell3d?: string; symbol?: "kristall" | "pergament" }

const KAMPFART: Record<Art, string> = { nah: "Nahkampf", fern: "Fernkampf", magie: "Magie" };
const zahl = (v: number) => String(v).replace(".", ",");
/** Die Werte eines Gegenstands als Zeilen fürs Untersuchen-Fenster */
export function werteVon(G: Gegenstand): [string, string][] {
  if (G.waffe) { const W = G.waffe, z: [string, string][] = [["Kampfart", KAMPFART[W.art]]];
    if (W.art === "nah") z.push(["Geschick", `+${W.geschick || 0}`], ["Stärke", `+${W.staerke || 0}`]);
    else if (W.art === "fern") z.push(["Fernkampfstärke", String(W.fernStaerke || 0)], ["Schaden", `1–${W.fernStaerke || 0}`]);
    else z.push(["Magische Genauigkeit", `+${W.genau || 0}`], ["Schaden", `${(W.schaden || [1, 1])[0]}–${(W.schaden || [1, 1])[1]} + Magie ÷ 3`]);
    z.push(["Angriffstempo", `${W.ticks} Ticks (${zahl(W.ticks * 0.5)} s)`], ["Reichweite", W.art === "nah" ? "Nahkampf" : `${zahl(W.reich)} Felder`]); return z; }
  if (G.abwehr) return [["Verteidigung Nahkampf", `+${G.abwehr.nah}`], ["Verteidigung Fernkampf", `+${G.abwehr.fern}`], ["Verteidigung Magie", `+${G.abwehr.magie}`]];
  return [];
}

export const GEGENSTAENDE: Record<string, Gegenstand> = {
  ritterschwert: { id: "ritterschwert", name: "Einfaches Schwert", platz: "waffe", art: "Einhandschwert", seltenheit: "gewoehnlich", ebenen: ["waffe.schwert.ritter"],
    waffe: { art: "nah", ticks: 3, reich: 1.5, geschick: 5, staerke: 5 }, text: "Eine schlichte, gut ausgewogene Klinge der Waldmark-Schmiede. Ein solider Allrounder." },
  jagdbogen: { id: "jagdbogen", name: "Einfacher Kurzbogen", platz: "waffe", art: "Kurzbogen", seltenheit: "gewoehnlich", ebenen: ["waffe.bogen.jagd"],
    waffe: { art: "fern", ticks: 4, reich: 6, flug: 18, fernStaerke: 10 }, text: "Ein kurzer Eibenbogen, wie ihn die Jäger des Kreuzwalds führen." },
  hirtenstab: { id: "hirtenstab", name: "Einfacher Stab", platz: "waffe", art: "Stab", seltenheit: "gewoehnlich", ebenen: ["waffe.stab.hirte"],
    waffe: { art: "magie", ticks: 5, reich: 6, flug: 13, genau: 5, schaden: [1, 5] }, text: "Ein knorriger Stab mit gekrümmtem Kopf. In den richtigen Händen bündelt er die Kräfte der Splitter." },
  rundschild: { id: "rundschild", name: "Einfacher Schild", platz: "nebenhand", art: "Schild", seltenheit: "gewoehnlich", ebenen: ["schild.rund"],
    abwehr: { nah: 3, fern: 3, magie: 2 }, text: "Holz mit Eisenbeschlag. Eine kleine defensive Ergänzung – aus allen Richtungen." },
  lederpanzer: { id: "lederpanzer", name: "Einfacher Lederpanzer", platz: "brust", art: "Leichte Rüstung", seltenheit: "gewoehnlich", ebenen: ["ruestung.brust.lederpanzer"],
    abwehr: { nah: 3, fern: 3, magie: 3 }, text: "Gehärtetes Leder mit Messingschnallen und dem Eichenbaum der Waldmark. Schützt, ohne die Bewegung zu hemmen." },
  magiepanzer: { id: "magiepanzer", name: "Einfacher Magiepanzer", platz: "brust", art: "Leichte Rüstung", seltenheit: "gewoehnlich", ebenen: ["ruestung.brust.magiepanzer"],
    abwehr: { nah: 2, fern: 2, magie: 4 }, text: "Nachtblaues Leder mit goldenen Sternzeichen und einem Splitterstein am Kragen. Lenkt Zauber besser ab als Klingen." },
  splitter: { id: "splitter", name: "Splitter", art: "Währung", seltenheit: "gewoehnlich", stapel: 1_000_000, modell3d: "img/objekte3d/splitter.glb", symbol: "kristall",
    text: "Ein schimmernder Splitter der zerbrochenen Lande. In der Waldmark nimmt man ihn als Zahlungsmittel." },
  hinweispergament: { id: "hinweispergament", name: "Hinweispergament", art: "Questgegenstand", seltenheit: "gewoehnlich", symbol: "pergament",
    text: "Ein zerknittertes Pergament mit einer hastig gekritzelten Nachricht. Gehört zum Einsteiger-Quest." },
};
/** Die Gegenstände, mit denen ein neuer Held beginnt (nach der Startwaffe) */
export function startAusruestung(w: Startwaffe): Partial<Record<Platz, string>> {
  return w === "schwert" ? { waffe: "ritterschwert", nebenhand: "rundschild" } : w === "bogen" ? { waffe: "jagdbogen", brust: "lederpanzer" } : { waffe: "hirtenstab", brust: "magiepanzer" };
}
export const RUCKSACK_PLAETZE = 24;
/** Ein Rucksackfach: eine Gegenstands-id oder ein Stapel { g, n } (stapelbare Gegenstände) */
export type Fach = string | { g: string; n: number };
export const fachG = (f: Fach): string => (typeof f === "string" ? f : f.g);
export const fachN = (f: Fach): number => (typeof f === "string" ? 1 : f.n);
