/*
 * Gegenstände des eigenen Helden (Ausrüstung und Rucksack).
 * Plätze wie im Ausrüstungsfenster: Amulett oben, Waffe links, Brust in der Mitte (beide zu Beginn leer – der Grundkörper trägt Hemd und Hose fest), Nebenhand (Schild) rechts.
 * Die Werte der Waffen kommen aus den Ausrüstungssätzen (shared/config.ts HELDEN, Hauptwaffe des Satzes) und dem Schild (K.BLOCK) –
 * es sind dieselben Zahlen, mit denen der Kampf heute rechnet.
 */
import { HELDEN, K } from "./config";
import { Startwaffe } from "./aussehen";

export type Platz = "kopf" | "amulett" | "waffe" | "brust" | "beine" | "nebenhand";
export const PLAETZE: { id: Platz; name: string }[] = [{ id: "kopf", name: "Kopf" }, { id: "amulett", name: "Amulett" }, { id: "waffe", name: "Waffe" }, { id: "brust", name: "Brust" }, { id: "beine", name: "Beine" }, { id: "nebenhand", name: "Nebenhand" }];
export type Seltenheit = "gewoehnlich" | "selten" | "episch" | "legendaer" | "mythisch";
/** Seltenheitsstufen: Name und Farbe (Rahmen im Ausrüstungsfenster) */
export const SELTENHEITEN: Record<Seltenheit, { name: string; farbe: string }> = {
  gewoehnlich: { name: "Gewöhnlich", farbe: "#b9b4a8" }, selten: { name: "Selten", farbe: "#5fcf6a" }, episch: { name: "Episch", farbe: "#6f8cff" },
  legendaer: { name: "Legendär", farbe: "#ff9a2e" }, mythisch: { name: "Mythisch", farbe: "#ff4fd8" },
};
export interface Gegenstand { id: string; name: string; platz: Platz; art: string; seltenheit: Seltenheit; ebenen?: string[]; werte: [string, string][]; text: string }

const waffe = (satz: string) => { const m = HELDEN[satz].modi[0], art = { nah: "Nahkampf", fern: "Fernkampf", magie: "Magie", heil: "Heilung" }[m.art] || m.art;
  return [["Schaden", `${m.schaden[0]}–${m.schaden[1]}`], ["Schadensart", art], ["Angriffe je Sekunde", (1 / m.takt).toFixed(2).replace(".", ",")], ["Reichweite", `${String(m.reich).replace(".", ",")} Felder`]] as [string, string][]; };
const prozent = (v: number) => `${Math.round(v * 100)} %`;

export const GEGENSTAENDE: Record<string, Gegenstand> = {
  ritterschwert: { id: "ritterschwert", name: "Anfängerschwert", platz: "waffe", art: "Einhandschwert", seltenheit: "gewoehnlich", ebenen: ["waffe.schwert.ritter"], werte: waffe("schildwaechter"),
    text: "Eine schlichte, gut ausgewogene Klinge der Waldmark-Schmiede. Treffer verlangsamen den Gegner kurz." },
  rundschild: { id: "rundschild", name: "Anfängerschild", platz: "nebenhand", art: "Schild", seltenheit: "gewoehnlich", ebenen: ["schild.rund"],
    werte: [["Abwehr Nahkampf (von vorn)", prozent(K.BLOCK.nah)], ["Abwehr Fernkampf (von vorn)", prozent(K.BLOCK.fern)], ["Abwehr Magie (von vorn)", prozent(K.BLOCK.magie)], ["Schutzwinkel", `±${K.BLOCK.winkel}°`]],
    text: "Holz mit Eisenbeschlag. Fängt Angriffe von vorn ab – im Schildmodus (Taste Q wechselt die Haltung)." },
  jagdbogen: { id: "jagdbogen", name: "Anfängerbogen", platz: "waffe", art: "Bogen", seltenheit: "gewoehnlich", ebenen: ["waffe.bogen.jagd"], werte: waffe("kopfgeldjaeger"),
    text: "Ein Eibenbogen, wie ihn die Jäger des Kreuzwalds führen. Hoher Einzelschaden aus sicherer Entfernung." },
  hirtenstab: { id: "hirtenstab", name: "Anfängerstab", platz: "waffe", art: "Stab", seltenheit: "gewoehnlich", ebenen: ["waffe.stab.hirte"], werte: waffe("elementarist"),
    text: "Ein knorriger Stab mit gekrümmtem Kopf. In den richtigen Händen bündelt er die Kräfte der Splitter." },
  lederpanzer: { id: "lederpanzer", name: "Anfänger-Lederpanzer", platz: "brust", art: "Leichte Rüstung", seltenheit: "gewoehnlich", ebenen: ["ruestung.brust.lederpanzer"],
    werte: [["Abwehr Nahkampf", "+3"], ["Abwehr Fernkampf", "+3"], ["Abwehr Magie", "+3"]],
    text: "Gehärtetes Leder mit Messingschnallen und dem Eichenbaum der Waldmark. Schützt, ohne die Bewegung zu hemmen." },
  magiepanzer: { id: "magiepanzer", name: "Anfänger-Robe", platz: "brust", art: "Leichte Rüstung", seltenheit: "gewoehnlich", ebenen: ["ruestung.brust.magiepanzer"],
    werte: [["Abwehr Nahkampf", "+2"], ["Abwehr Fernkampf", "+2"], ["Abwehr Magie", "+4"]],
    text: "Nachtblaues Leder mit goldenen Sternzeichen und einem Splitterstein am Kragen. Lenkt Zauber besser ab als Klingen." },
  eisenwacht: { id: "eisenwacht", name: "Eisenwacht-Brustpanzer", platz: "brust", art: "Schwere Rüstung", seltenheit: "selten", ebenen: ["ruestung.brust.eisenwacht"],
    werte: [["Abwehr", "Werte folgen"]],
    text: "Geschwärzte Eisenplatten über Leder, mit Schulterstücken und Plattenschößen. Gehört zu den Eisenbeinschienen." },
  eisenbeinschienen: { id: "eisenbeinschienen", name: "Eisenbeinschienen", platz: "beine", art: "Schwere Rüstung", seltenheit: "selten", ebenen: ["ruestung.beine.eisenschienen"],
    werte: [["Abwehr", "Werte folgen"]],
    text: "Eisenplatten über Oberschenkel, Knie und Schienbein, auf schwerem Leder genietet. Gehört zum Eisenwacht-Brustpanzer." },
  eisenwachthelm: { id: "eisenwachthelm", name: "Eisenwacht-Helm", platz: "kopf", art: "Schwere Rüstung", seltenheit: "selten", ebenen: ["kopf.helm.eisenwacht"],
    werte: [["Abwehr", "Werte folgen"]],
    text: "Geschlossener Helm mit Nackenschirm und Halsschutz, die Kanten in Bronze gefasst. Gehört zum Eisenwacht-Set." },
  jaegerwams: { id: "jaegerwams", name: "Jägerwams", platz: "brust", art: "Leichte Rüstung", seltenheit: "gewoehnlich", ebenen: ["ruestung.brust.jaeger"],
    werte: [["Abwehr", "Werte folgen"]], text: "Dunkles, vielfach geschnürtes Leder mit grünem Halstuch – leise im Unterholz. Gehört zum Jäger-Set." },
  jaegerhose: { id: "jaegerhose", name: "Jägerhose", platz: "beine", art: "Leichte Rüstung", seltenheit: "gewoehnlich", ebenen: ["ruestung.beine.jaeger"],
    werte: [["Abwehr", "Werte folgen"]], text: "Lederhose mit Knieschützern und Taschen am Gürtel. Gehört zum Jäger-Set." },
  jaegerkapuze: { id: "jaegerkapuze", name: "Jägerkapuze", platz: "kopf", art: "Leichte Rüstung", seltenheit: "gewoehnlich", ebenen: ["kopf.helm.jaegerkapuze"],
    werte: [["Abwehr", "Werte folgen"]], text: "Moosgrüne Kapuze mit Blattschnalle; wirft einen Schatten über das Gesicht. Gehört zum Jäger-Set." },
  magierrobe: { id: "magierrobe", name: "Magierrobe", platz: "brust", art: "Stoffrüstung", seltenheit: "gewoehnlich", ebenen: ["ruestung.brust.magier"],
    werte: [["Abwehr", "Werte folgen"]], text: "Nachtblaue Robe mit Goldborte und einem Splitterstein an der Brust. Gehört zum Magier-Set." },
  magierrock: { id: "magierrock", name: "Magierrock", platz: "beine", art: "Stoffrüstung", seltenheit: "gewoehnlich", ebenen: ["ruestung.beine.magierrock"],
    werte: [["Abwehr", "Werte folgen"]], text: "Langer, geschichteter Rock mit Quasten am Gürtel. Gehört zum Magier-Set." },
  magierkapuze: { id: "magierkapuze", name: "Magierkapuze", platz: "kopf", art: "Stoffrüstung", seltenheit: "gewoehnlich", ebenen: ["kopf.helm.magierkapuze"],
    werte: [["Abwehr", "Werte folgen"]], text: "Spitze Kapuze mit leuchtendem Stirnstein. Gehört zum Magier-Set." },
  eidschwert: { id: "eidschwert", name: "Eidschwert", platz: "waffe", art: "Einhandschwert", seltenheit: "selten", ebenen: ["waffe.eidschwert"],
    werte: [["Schaden", "Werte folgen"]], text: "Eine schlanke Klinge mit vergoldetem Korb, auf die Eide der Waldmark geschworen werden." },
  eiddolch: { id: "eiddolch", name: "Eiddolch", platz: "waffe", art: "Dolch", seltenheit: "selten", ebenen: ["waffe.eiddolch"],
    werte: [["Schaden", "Werte folgen"]], text: "Breit und kurz, mit lederumwickeltem Griff – das kleine Gegenstück zum Eidschwert." },
  eidzweihaender: { id: "eidzweihaender", name: "Eid-Zweihänder", platz: "waffe", art: "Zweihandschwert", seltenheit: "selten", ebenen: ["waffe.eidzweihaender"],
    werte: [["Schaden", "Werte folgen"]], text: "Ein langes Schwert für zwei Hände, die Parierstange wie gebogene Äste." },
  sternenschild: { id: "sternenschild", name: "Sternenschild", platz: "nebenhand", art: "Schild", seltenheit: "selten", ebenen: ["schild.sternen"],
    werte: [["Abwehr", "Werte folgen"]], text: "Ein Drachenschild aus dunklem Stahl mit goldenem Stern auf nachtblauem Grund." },
  sternbrecher: { id: "sternbrecher", name: "Sternbrecher", platz: "waffe", art: "Streitkolben", seltenheit: "selten", ebenen: ["waffe.sternbrecher"],
    werte: [["Schaden", "Werte folgen"]], text: "Ein Streitkolben mit sternförmigem Kopf aus dunklem Stahl, der Schaft grün lackiert und bronzebeschlagen." },
  sterndorn: { id: "sterndorn", name: "Sterndorn", platz: "waffe", art: "Speer", seltenheit: "selten", ebenen: ["waffe.sterndorn"],
    werte: [["Schaden", "Werte folgen"]], text: "Ein langer Speer mit schlanker Spitze und grünem Wimpel – für zwei Hände und große Reichweite." },
};
/* Das Eisenwacht-Set in allen Stufen (gleiche Form, anderes Material: fabrik/seltenheit.py, fabrik/stufen_bauen.sh). „selten“ sind die Grundteile oben;
   die übrigen Stufen tragen die Ebene <teil>.<stufe> (eigene Datei <figur>.teile/<teil>.<stufe>.glb, erst beim Anlegen geladen). */
const SET_STUFEN: { s: Seltenheit; m: string; p: string; text: string }[] = [
  { s: "gewoehnlich", m: "Rostiger", p: "Rostige", text: "Stumpfes Eisen mit Rost in den Fugen, die Beschläge längst nicht mehr aus Messing." },
  { s: "episch", m: "Geschwärzter", p: "Geschwärzte", text: "Nachtschwarzer Stahl mit blauem Schimmer, die Kanten in Gold gefasst – sie glimmen schwach im Dunkeln." },
  { s: "legendaer", m: "Glutgoldener", p: "Glutgoldene", text: "Dunkler Stahl, schwer vergoldet; die Kanten glühen, als käme die Rüstung gerade aus der Esse." },
  { s: "mythisch", m: "Sternenschimmernder", p: "Sternenschimmernde", text: "Obsidian, der wie Öl auf Wasser schillert. Durch die Platten ziehen sich leuchtende Adern – niemand weiß, wer sie geschmiedet hat." },
];
for (const st of SET_STUFEN) for (const [basis, nomen, mehrzahl] of [["eisenwacht", "Eisenwacht-Brustpanzer", false], ["eisenbeinschienen", "Eisenbeinschienen", true], ["eisenwachthelm", "Eisenwacht-Helm", false]] as const) {
  const B = GEGENSTAENDE[basis], id = `${basis}_${st.s}`;
  GEGENSTAENDE[id] = { ...B, id, name: `${mehrzahl ? st.p : st.m} ${nomen}`, seltenheit: st.s, ebenen: (B.ebenen || []).map((e) => `${e}.${st.s}`), text: st.text };
}
/* Das Jäger-Set (Grundstufe gewöhnlich): höhere Stufen über die Lederfarbe (fabrik/seltenheit.py art=leder) */
const JAEGER_STUFEN: { s: Seltenheit; w: string; text: string }[] = [
  { s: "selten", w: "Waldgrün", text: "Waldgrün gegerbtes Leder – im Unterholz kaum zu sehen." },
  { s: "episch", w: "Nachtblau", text: "Nachtblaues Leder mit Silberschnallen, die im Mondlicht schwach glimmen." },
  { s: "legendaer", w: "Blutrot", text: "Ochsenblutrotes Leder, goldbeschlagen; die Schnallen glühen wie Kohlen." },
  { s: "mythisch", w: "Schattenschimmernd", text: "Leder, das zwischen Violett und Nachtblau schillert. Seine Nähte leuchten, als wäre Sternenlicht hineingewebt." },
];
for (const st of JAEGER_STUFEN) for (const [basis, nomen, endung] of [["jaegerwams", "Jägerwams", "es"], ["jaegerhose", "Jägerhose", "e"], ["jaegerkapuze", "Jägerkapuze", "e"]] as const) {
  const B = GEGENSTAENDE[basis], id = `${basis}_${st.s}`;
  GEGENSTAENDE[id] = { ...B, id, name: `${st.w}${endung} ${nomen}`, seltenheit: st.s, ebenen: (B.ebenen || []).map((e) => `${e}.${st.s}`), text: st.text };
}
/* Das Magier-Set (Grundstufe gewöhnlich): höhere Stufen über die Stofffarbe (fabrik/seltenheit.py art=stoff) */
const MAGIER_STUFEN: { s: Seltenheit; w: string; text: string }[] = [
  { s: "selten", w: "Smaragdgrün", text: "Smaragdgrüner Stoff, golden bestickt." },
  { s: "episch", w: "Purpurn", text: "Tiefer Purpur mit Silberborten, die im Dunkeln schwach glimmen." },
  { s: "legendaer", w: "Karmesinrot", text: "Karmesinroter Samt, schwer vergoldet; die Borten glühen wie Glut." },
  { s: "mythisch", w: "Sternenschimmernd", text: "Stoff, der wie der Nachthimmel schillert. Seine Nähte leuchten, als hielten sie Sternenlicht fest." },
];
for (const st of MAGIER_STUFEN) for (const [basis, nomen, endung] of [["magierrobe", "Magierrobe", "e"], ["magierrock", "Magierrock", "er"], ["magierkapuze", "Magierkapuze", "e"]] as const) {
  const B = GEGENSTAENDE[basis], id = `${basis}_${st.s}`, w = st.w === "Purpurn" ? (endung === "er" ? "Purpurner" : "Purpurne") : st.w + endung;
  GEGENSTAENDE[id] = { ...B, id, name: `${w} ${nomen}`, seltenheit: st.s, ebenen: (B.ebenen || []).map((e) => `${e}.${st.s}`), text: st.text };
}
/* Eid-Waffen und Sternenschild (Grundstufe selten): übrige Stufen wie beim Eisenwacht-Set */
const WAFFEN_STUFEN: { s: Seltenheit; w: string; text: string }[] = [
  { s: "gewoehnlich", w: "Rostig", text: "Fleckig vom Rost, die Vergoldung längst abgegriffen – aber noch scharf genug." },
  { s: "episch", w: "Geschwärzt", text: "Nachtschwarzer Stahl mit Goldbeschlägen, die im Dunkeln schwach blau glimmen." },
  { s: "legendaer", w: "Glutgolden", text: "Schwer vergoldet; Kanten und Beschläge glühen wie frisch aus der Esse." },
  { s: "mythisch", w: "Sternenschimmernd", text: "Schillernder Obsidian mit leuchtenden Adern – als hätte jemand einen Stern hineingeschmiedet." },
];
for (const st of WAFFEN_STUFEN) for (const [basis, nomen, endung] of [["eidschwert", "Eidschwert", "es"], ["eiddolch", "Eiddolch", "er"], ["eidzweihaender", "Eid-Zweihänder", "er"], ["sternenschild", "Sternenschild", "er"], ["sternbrecher", "Sternbrecher", "er"], ["sterndorn", "Sterndorn", "er"]] as const) {
  const B = GEGENSTAENDE[basis], id = `${basis}_${st.s}`;
  GEGENSTAENDE[id] = { ...B, id, name: `${st.w}${endung} ${nomen}`, seltenheit: st.s, ebenen: (B.ebenen || []).map((e) => `${e}.${st.s}`), text: st.text };
}
/* Anfängerwaffen (Grundstufe gewöhnlich) in den höheren Stufen: Schwert und Schild über das Metall, Bogen und Stab über die Holzfarbe */
const ANFAENGER_STUFEN: { s: Seltenheit; w: string; text: string }[] = [
  { s: "selten", w: "Veredelt", text: "Blank poliert und frisch gefasst – deutlich mehr als ein Anfängerstück." },
  { s: "episch", w: "Geschwärzt", text: "Nachtschwarz behandelt, die Beschläge schimmern im Dunkeln blau." },
  { s: "legendaer", w: "Glutgolden", text: "Schwer vergoldet; Kanten und Beschläge glühen wie frisch aus der Esse." },
  { s: "mythisch", w: "Sternenschimmernd", text: "Schillernd wie Öl auf Wasser, von leuchtenden Adern durchzogen." },
];
for (const st of ANFAENGER_STUFEN) for (const [basis, nomen, endung] of [["ritterschwert", "Schwert", "es"], ["rundschild", "Schild", "er"], ["jagdbogen", "Bogen", "er"], ["hirtenstab", "Stab", "er"]] as const) {
  const B = GEGENSTAENDE[basis], id = `${basis}_${st.s}`;
  GEGENSTAENDE[id] = { ...B, id, name: `${st.w}${endung} ${nomen}`, seltenheit: st.s, ebenen: (B.ebenen || []).map((e) => `${e}.${st.s}`), text: st.text };
}
/** Angriffsbewegung der 3D-Figur je Waffenart (nur Darstellung – der Kampf rechnet weiter mit dem Ausrüstungssatz der Startwaffe) */
export const ANGRIFF_JE_ART: Record<string, string> = { Einhandschwert: "stich", Streitkolben: "stich", Speer: "stich2h", Dolch: "stich", Zweihandschwert: "hieb2h", Bogen: "bogen", Stab: "zauber_stab", Armbrust: "armbrust1h" };
/** Angriffsbewegung zu den angelegten Figurenebenen (die Waffe in der Hand) – oder null, wenn keine bekannte Waffe angelegt ist */
export function angriffFuer(ebenen: string[]): string | null {
  for (const g of Object.values(GEGENSTAENDE)) if (g.platz === "waffe" && g.ebenen && g.ebenen.some((e) => ebenen.includes(e)) && ANGRIFF_JE_ART[g.art]) return ANGRIFF_JE_ART[g.art];
  return null;
}
/** Die Gegenstände, mit denen ein neuer Held beginnt (nach der Startwaffe) */
export function startAusruestung(w: Startwaffe): Partial<Record<Platz, string>> {
  return w === "schwert" ? { waffe: "ritterschwert", nebenhand: "rundschild" } : w === "bogen" ? { waffe: "jagdbogen" } : { waffe: "hirtenstab" };
}
export const RUCKSACK_PLAETZE = 24;

/* ---------- Verbrauchsgegenstände (Tränke) ----------
 * Noch nicht im Rucksack und noch ohne Wirkung im Kampf: das Leben im Kampf rechnet der Spielserver (shared/sim.ts) – das Trinken braucht dort einen eigenen Befehl.
 * Hier stehen schon Werte, Text und Modell (img/objekte3d, fabrik/drehobjekt.py: schwebt und dreht sich, Animation „drehen“). */
export interface Verbrauch { id: string; name: string; art: string; seltenheit: "gewoehnlich" | "selten"; heilt: { fest: number; anteil: number }; modell: string; werte: [string, string][]; text: string }
export const VERBRAUCH: Record<string, Verbrauch> = {
  heiltrank: { id: "heiltrank", name: "Heiltrank", art: "Trank", seltenheit: "gewoehnlich", heilt: { fest: 10, anteil: 0.05 }, modell: "img/objekte3d/heiltrank.glb",
    werte: [["Heilung", "10 + 5 % des maximalen Lebens"]],
    text: "Ein rotes Elixier in bauchiger Flasche, mit dem Kreuz der Heiler auf dem Beschlag. Schließt Wunden, ersetzt aber keinen Rückzug." },
};
/** Wie viel ein Trank heilt, bei diesem maximalen Leben (gerundet) */
export const trankHeilung = (v: Verbrauch, maxLp: number) => Math.round(v.heilt.fest + v.heilt.anteil * maxLp);
