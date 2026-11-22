/*
 * Gegenstände des eigenen Helden (Ausrüstung und Rucksack).
 * Plätze wie im Ausrüstungsfenster: Amulett oben, Waffe links, Brust in der Mitte (beide zu Beginn leer – der Grundkörper trägt Hemd und Hose fest), Nebenhand (Schild) rechts.
 * Die Werte der Waffen kommen aus den Ausrüstungssätzen (shared/config.ts HELDEN, Hauptwaffe des Satzes) und dem Schild (K.BLOCK) –
 * es sind dieselben Zahlen, mit denen der Kampf heute rechnet.
 */
import { HELDEN, K } from "./config";
import { Startwaffe } from "./aussehen";

export type Platz = "amulett" | "waffe" | "brust" | "nebenhand";
export const PLAETZE: { id: Platz; name: string }[] = [{ id: "amulett", name: "Amulett" }, { id: "waffe", name: "Waffe" }, { id: "brust", name: "Brust" }, { id: "nebenhand", name: "Nebenhand" }];
export interface Gegenstand { id: string; name: string; platz: Platz; art: string; seltenheit: "gewoehnlich" | "selten"; ebenen?: string[]; werte: [string, string][]; text: string }

const waffe = (satz: string) => { const m = HELDEN[satz].modi[0], art = { nah: "Nahkampf", fern: "Fernkampf", magie: "Magie", heil: "Heilung" }[m.art] || m.art;
  return [["Schaden", `${m.schaden[0]}–${m.schaden[1]}`], ["Schadensart", art], ["Angriffe je Sekunde", (1 / m.takt).toFixed(2).replace(".", ",")], ["Reichweite", `${String(m.reich).replace(".", ",")} Felder`]] as [string, string][]; };
const prozent = (v: number) => `${Math.round(v * 100)} %`;

export const GEGENSTAENDE: Record<string, Gegenstand> = {
  ritterschwert: { id: "ritterschwert", name: "Ritterschwert", platz: "waffe", art: "Einhandschwert", seltenheit: "gewoehnlich", ebenen: ["waffe.schwert.ritter"], werte: waffe("schildwaechter"),
    text: "Eine schlichte, gut ausgewogene Klinge der Waldmark-Schmiede. Treffer verlangsamen den Gegner kurz." },
  rundschild: { id: "rundschild", name: "Rundschild", platz: "nebenhand", art: "Schild", seltenheit: "gewoehnlich", ebenen: ["schild.rund"],
    werte: [["Abwehr Nahkampf (von vorn)", prozent(K.BLOCK.nah)], ["Abwehr Fernkampf (von vorn)", prozent(K.BLOCK.fern)], ["Abwehr Magie (von vorn)", prozent(K.BLOCK.magie)], ["Schutzwinkel", `±${K.BLOCK.winkel}°`]],
    text: "Holz mit Eisenbeschlag. Fängt Angriffe von vorn ab – im Schildmodus (Taste Q wechselt die Haltung)." },
  jagdbogen: { id: "jagdbogen", name: "Jagdbogen", platz: "waffe", art: "Bogen", seltenheit: "gewoehnlich", ebenen: ["waffe.bogen.jagd"], werte: waffe("kopfgeldjaeger"),
    text: "Ein Eibenbogen, wie ihn die Jäger des Kreuzwalds führen. Hoher Einzelschaden aus sicherer Entfernung." },
  hirtenstab: { id: "hirtenstab", name: "Hirtenstab", platz: "waffe", art: "Stab", seltenheit: "gewoehnlich", ebenen: ["waffe.stab.hirte"], werte: waffe("elementarist"),
    text: "Ein knorriger Stab mit gekrümmtem Kopf. In den richtigen Händen bündelt er die Kräfte der Splitter." },
  lederpanzer: { id: "lederpanzer", name: "Einfacher Lederpanzer", platz: "brust", art: "Leichte Rüstung", seltenheit: "gewoehnlich", ebenen: ["ruestung.brust.lederpanzer"],
    werte: [["Abwehr Nahkampf", "+3"], ["Abwehr Fernkampf", "+3"], ["Abwehr Magie", "+3"]],
    text: "Gehärtetes Leder mit Messingschnallen und dem Eichenbaum der Waldmark. Schützt, ohne die Bewegung zu hemmen." },
};
/** Die Gegenstände, mit denen ein neuer Held beginnt (nach der Startwaffe) */
export function startAusruestung(w: Startwaffe): Partial<Record<Platz, string>> {
  return w === "schwert" ? { waffe: "ritterschwert", nebenhand: "rundschild" } : w === "bogen" ? { waffe: "jagdbogen" } : { waffe: "hirtenstab" };
}
export const RUCKSACK_PLAETZE = 24;
