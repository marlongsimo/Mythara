/*
 * Gegenstände des eigenen Helden (Ausrüstung und Rucksack) – mit ihren Kampfwerten nach den Regeln v2 (shared/kampfwerte.ts).
 * Plätze im Ausrüstungsfenster: Waffe links, Brust (Rüstung) in der Mitte – zu Beginn leer, der Grundkörper trägt Hemd und Hose fest –, Nebenhand (Schild) rechts.
 * Waffe: Kampfart, Takt in Ticks (1 Tick = 0,5 s), Reichweite und die Werte ihrer Art – Nahkampf: Geschick- und Stärke-Bonus; Fernkampf: Fernkampfstärke;
 * Magie: Magische Genauigkeit und Schadensbereich. Schild und Rüstung: Verteidigungsboni je Angriffsart.
 * Startausrüstung bewusst schwach, aber klar verschieden: Upgrades sollen sich deutlich bemerkbar machen, die Heldenwerte zählen von Anfang an.
 */
import { Startwaffe } from "./aussehen";
import { NAMEN_AUS_DATENBLAETTERN } from "./gegenstand_namen";

export type Seltenheit = "anfaenger" | "gewoehnlich" | "selten" | "episch" | "legendaer" | "mythisch";
/** Seltenheitsstufen: Name und Farbe (Rahmen im Ausrüstungsfenster) */
export const SELTENHEITEN: Record<Seltenheit, { name: string; farbe: string }> = {
  anfaenger: { name: "Training", farbe: "#8e8a82" }, gewoehnlich: { name: "Einfach", farbe: "#b9b4a8" }, selten: { name: "Selten", farbe: "#5fcf6a" }, episch: { name: "Episch", farbe: "#6f8cff" },
  legendaer: { name: "Legendär", farbe: "#ff9a2e" }, mythisch: { name: "Mythisch", farbe: "#ff4fd8" },
};
export type Platz = "kopf" | "waffe" | "brust" | "beine" | "nebenhand";
export type Art = "nah" | "fern" | "magie";
export type AnfSkill = "geschick" | "staerke" | "fernkampf" | "magie" | "defense";
export const ANF_NAME: Record<AnfSkill, string> = { geschick: "Geschick", staerke: "Stärke", fernkampf: "Fernkampf", magie: "Magie", defense: "Defense" };
export const PLAETZE: { id: Platz; name: string }[] = [{ id: "kopf", name: "Kopf" }, { id: "waffe", name: "Waffe" }, { id: "brust", name: "Brust" }, { id: "beine", name: "Beine" }, { id: "nebenhand", name: "Nebenhand" }];
export interface WaffenWerte { art: Art; /** Takt in Ticks (Normal-Stil) */ ticks: number; reich: number; flug?: number; geschick?: number; staerke?: number; /** Fernkampf: Angriffsbonus (Trefferwert, ÷ 3) und Stärkebonus (Max Hit) – seit v3 getrennt */ fernAngriff?: number; fernStaerke?: number; genau?: number; /** Magie: Stärkebonus (Max Hit) */ magieStaerke?: number }
/** platz fehlt: nicht anlegbar (Währung, Questgegenstand). stapel: so viele passen in ein Rucksackfach (mit Zähler). modell3d: 3D-Modell am Boden. symbol: Bild im Rucksack ohne Figurenebene */
export interface Gegenstand { id: string; name: string; platz?: Platz; art: string; seltenheit: Seltenheit; ebenen?: string[]; waffe?: WaffenWerte; abwehr?: Record<Art, number>; /** Boni von Rüstung/Schmuck auf Trefferwert und Max Hit (v3: die Ausrüstung zählt gesamt) */ bonus?: { geschick?: number; staerke?: number; fernAngriff?: number; fernStaerke?: number; magieStaerke?: number }; text: string;
  stapel?: number; modell3d?: string; symbol?: "kristall" | "pergament" | "trank" | "trankrot"; /** zum Anlegen nötiges Skill-Level (Balancing 23.11.2026) */ anforderung?: { skill: AnfSkill; level: number }; /** belegt Waffe und Nebenhand (kein Schild) */ zweihand?: boolean; /** Verbrauch: Trank (VERBRAUCH[trank]) – im Rucksack trinken */ trank?: string }

const KAMPFART: Record<Art, string> = { nah: "Nahkampf", fern: "Fernkampf", magie: "Magie" };
const zahl = (v: number) => String(v).replace(".", ",");
/** Die Werte eines Gegenstands als Zeilen fürs Untersuchen-Fenster */
export function werteVon(G: Gegenstand): [string, string][] {
  if (G.waffe) { const W = G.waffe, z: [string, string][] = [["Kampfart", KAMPFART[W.art]]];
    if (W.art === "nah") z.push(["Geschick", `+${W.geschick || 0}`], ["Stärke", `+${W.staerke || 0}`]);
    else if (W.art === "fern") z.push(["Fernkampf-Angriff", `+${W.fernAngriff || 0}`], ["Fernkampf-Stärke", `+${W.fernStaerke || 0}`]);
    else z.push(["Magische Genauigkeit", `+${W.genau || 0}`], ["Magie-Stärke", `+${W.magieStaerke || 0}`]);
    z.push(["Angriffstempo", `${W.ticks} Ticks (${zahl(W.ticks * 0.5)} s)`], ["Reichweite", W.art === "nah" ? (W.reich <= 1 ? "1 Feld (Nahkampf)" : "Nahkampf") : `${zahl(W.reich)} Felder`]);
    if (G.abwehr) z.push(["Eigene Abwehr", `Nah ${G.abwehr.nah} · Fern ${G.abwehr.fern} · Magie ${G.abwehr.magie}`]); if (G.zweihand) z.push(["Hände", "zweihändig (kein Schild)"]);
    if (G.anforderung) z.push(["Benötigt", `${ANF_NAME[G.anforderung.skill]} ${G.anforderung.level}`]); return z; }
  if (G.trank && VERBRAUCH[G.trank]) return VERBRAUCH[G.trank].werte;
  if (G.abwehr) return [["Verteidigung Nahkampf", `+${G.abwehr.nah}`], ["Verteidigung Fernkampf", `+${G.abwehr.fern}`], ["Verteidigung Magie", `+${G.abwehr.magie}`], ...(G.anforderung ? [["Benötigt", `${ANF_NAME[G.anforderung.skill]} ${G.anforderung.level}`] as [string, string]] : [])];
  return G.platz === "waffe" ? [["Kampfwerte", "Werte folgen (bis dahin wie Fäuste)"]] : G.platz ? [["Verteidigung", "Werte folgen"]] : [];
}

export const GEGENSTAENDE: Record<string, Gegenstand> = {
  ritterschwert: { id: "ritterschwert", name: "Trainingsschwert", platz: "waffe", art: "Einhandschwert", seltenheit: "anfaenger", ebenen: ["waffe.schwert.ritter"],
    waffe: { art: "nah", ticks: 3, reich: 1.5, geschick: 5, staerke: 5 }, text: "Eine schlichte, gut ausgewogene Klinge der Waldmark-Schmiede. Ein solider Allrounder." },
  jagdbogen: { id: "jagdbogen", name: "Trainingsbogen", platz: "waffe", art: "Kurzbogen", seltenheit: "anfaenger", ebenen: ["waffe.bogen.jagd"],
    waffe: { art: "fern", ticks: 4, reich: 6, flug: 18, fernAngriff: 10, fernStaerke: 10 }, text: "Ein kurzer Eibenbogen, wie ihn die Jäger des Kreuzwalds führen." },
  hirtenstab: { id: "hirtenstab", name: "Trainingsstab", platz: "waffe", art: "Stab", seltenheit: "anfaenger", ebenen: ["waffe.stab.hirte"],
    waffe: { art: "magie", ticks: 5, reich: 6, flug: 13, genau: 5, magieStaerke: 10 }, text: "Ein knorriger Stab mit gekrümmtem Kopf. In den richtigen Händen bündelt er die Kräfte der Splitter." },
  rundschild: { id: "rundschild", name: "Trainingsschild", platz: "nebenhand", art: "Schild", seltenheit: "anfaenger", ebenen: ["schild.rund"],
    abwehr: { nah: 3, fern: 3, magie: 2 }, text: "Holz mit Eisenbeschlag. Eine kleine defensive Ergänzung – aus allen Richtungen." },
  lederpanzer: { id: "lederpanzer", name: "Trainings-Lederpanzer", platz: "brust", art: "Leichte Rüstung", seltenheit: "anfaenger", ebenen: ["ruestung.brust.lederpanzer"],
    abwehr: { nah: 3, fern: 3, magie: 3 }, text: "Gehärtetes Leder mit Messingschnallen und dem Eichenbaum der Waldmark. Schützt, ohne die Bewegung zu hemmen." },
  magiepanzer: { id: "magiepanzer", name: "Trainingsrobe", platz: "brust", art: "Leichte Rüstung", seltenheit: "anfaenger", ebenen: ["ruestung.brust.magiepanzer"],
    abwehr: { nah: 2, fern: 2, magie: 4 }, text: "Nachtblaues Leder mit goldenen Sternzeichen und einem Splitterstein am Kragen. Lenkt Zauber besser ab als Klingen." },
  splitter: { id: "splitter", name: "Splitter", art: "Währung", seltenheit: "gewoehnlich", stapel: 1_000_000, modell3d: "img/objekte3d/splitter.glb", symbol: "kristall",
    text: "Ein schimmernder Splitter der zerbrochenen Lande. In der Waldmark nimmt man ihn als Zahlungsmittel." },
  /* Tränke (Figuren-Fabrik, Werte in VERBRAUCH): im Rucksack kurz antippen = trinken. Der kleine liegt je einzeln in einem Fach, der normale stapelt */
  kleiner_heiltrank: { id: "kleiner_heiltrank", name: "Kleiner Heiltrank", art: "Trank", seltenheit: "gewoehnlich", modell3d: "img/objekte3d/heiltrank-klein.glb", symbol: "trank", trank: "kleiner_heiltrank",
    text: "Ein Fläschchen grüner Kräutersud. Lindert Kratzer – für mehr reicht es nicht." },
  heiltrank: { id: "heiltrank", name: "Heiltrank", art: "Trank", seltenheit: "gewoehnlich", stapel: 1000, modell3d: "img/objekte3d/heiltrank.glb", symbol: "trankrot", trank: "heiltrank",
    text: "Ein rotes Elixier in bauchiger Flasche, mit dem Kreuz der Heiler auf dem Beschlag. Schließt Wunden, ersetzt aber keinen Rückzug." },
  hinweispergament: { id: "hinweispergament", name: "Hinweispergament", art: "Questgegenstand", seltenheit: "gewoehnlich", symbol: "pergament",
    text: "Ein zerknittertes Pergament mit einer hastig gekritzelten Nachricht. Gehört zum Einsteiger-Quest." },
  /* Seltenes Eisenwacht-Set (Figuren-Fabrik): anlegbar, Werte folgen */
  eisenwacht: { id: "eisenwacht", name: "Eisenwacht-Brustpanzer", platz: "brust", art: "Schwere Rüstung", seltenheit: "selten", ebenen: ["ruestung.brust.eisenwacht"],
    text: "Geschwärzte Eisenplatten über Leder, mit Schulterstücken und Plattenschößen. Gehört zu den Eisenbeinschienen." },
  eisenbeinschienen: { id: "eisenbeinschienen", name: "Eisenbeinschienen", platz: "beine", art: "Schwere Rüstung", seltenheit: "selten", ebenen: ["ruestung.beine.eisenschienen"],
    text: "Eisenplatten über Oberschenkel, Knie und Schienbein, auf schwerem Leder genietet. Gehört zum Eisenwacht-Brustpanzer." },
  eisenwachthelm: { id: "eisenwachthelm", name: "Eisenwacht-Helm", platz: "kopf", art: "Schwere Rüstung", seltenheit: "selten", ebenen: ["kopf.helm.eisenwacht"],
    text: "Geschlossener Helm mit Nackenschirm und Halsschutz, die Kanten in Bronze gefasst. Gehört zum Eisenwacht-Set." },
  jaegerwams: { id: "jaegerwams", name: "Jägerwams", platz: "brust", art: "Leichte Rüstung", seltenheit: "gewoehnlich", ebenen: ["ruestung.brust.jaeger"],
    text: "Dunkles, vielfach geschnürtes Leder mit grünem Halstuch – leise im Unterholz. Gehört zum Jäger-Set." },
  jaegerhose: { id: "jaegerhose", name: "Jägerhose", platz: "beine", art: "Leichte Rüstung", seltenheit: "gewoehnlich", ebenen: ["ruestung.beine.jaeger"],
    text: "Lederhose mit Knieschützern und Taschen am Gürtel. Gehört zum Jäger-Set." },
  jaegerkapuze: { id: "jaegerkapuze", name: "Jägerkapuze", platz: "kopf", art: "Leichte Rüstung", seltenheit: "gewoehnlich", ebenen: ["kopf.helm.jaegerkapuze"],
    text: "Moosgrüne Kapuze mit Blattschnalle; wirft einen Schatten über das Gesicht. Gehört zum Jäger-Set." },
  magierrobe: { id: "magierrobe", name: "Magierrobe", platz: "brust", art: "Stoffrüstung", seltenheit: "gewoehnlich", ebenen: ["ruestung.brust.magier"],
    text: "Nachtblaue Robe mit Goldborte und einem Splitterstein an der Brust. Gehört zum Magier-Set." },
  magierrock: { id: "magierrock", name: "Magierrock", platz: "beine", art: "Stoffrüstung", seltenheit: "gewoehnlich", ebenen: ["ruestung.beine.magierrock"],
    text: "Langer, geschichteter Rock mit Quasten am Gürtel. Gehört zum Magier-Set." },
  magierkapuze: { id: "magierkapuze", name: "Magierkapuze", platz: "kopf", art: "Stoffrüstung", seltenheit: "gewoehnlich", ebenen: ["kopf.helm.magierkapuze"],
    text: "Spitze Kapuze mit leuchtendem Stirnstein. Gehört zum Magier-Set." },
  eidschwert: { id: "eidschwert", name: "Seltenes Schwert", platz: "waffe", art: "Einhandschwert", seltenheit: "selten", ebenen: ["waffe.eidschwert"],
    waffe: { art: "nah", ticks: 3, reich: 1.5, geschick: 5, staerke: 5 }, /* vorläufig wie das Startschwert – Werte folgen */ text: "Eine schlanke Klinge mit vergoldetem Korb, auf die Eide der Waldmark geschworen werden." },
  eiddolch: { id: "eiddolch", name: "Seltener Dolch", platz: "waffe", art: "Dolch", seltenheit: "selten", ebenen: ["waffe.eiddolch"],
    waffe: { art: "nah", ticks: 2, reich: 1.5, geschick: 4, staerke: 3 }, /* vorläufig: Kurzwaffe, 2 Ticks – Werte folgen */ text: "Breit und kurz, mit lederumwickeltem Griff – das kleine Gegenstück zum Eidschwert." },
  eidzweihaender: { id: "eidzweihaender", name: "Seltener Zweihänder", platz: "waffe", art: "Zweihandschwert", seltenheit: "selten", ebenen: ["waffe.eidzweihaender"],
    waffe: { art: "nah", ticks: 4, reich: 1.5, geschick: 5, staerke: 8 }, /* vorläufig: Zweihänder, 4 Ticks – Werte folgen */ text: "Ein langes Schwert für zwei Hände, die Parierstange wie gebogene Äste." },
  sternenschild: { id: "sternenschild", name: "Seltener Schild", platz: "nebenhand", art: "Schild", seltenheit: "selten", ebenen: ["schild.sternen"],
    text: "Ein Drachenschild aus dunklem Stahl mit goldenem Stern auf nachtblauem Grund." },
  sternbrecher: { id: "sternbrecher", name: "Seltener Streitkolben", platz: "waffe", art: "Streitkolben", seltenheit: "selten", ebenen: ["waffe.sternbrecher"],
    waffe: { art: "nah", ticks: 3, reich: 1.5, geschick: 4, staerke: 6 }, /* vorläufig: Streitkolben, 3 Ticks – Werte folgen */
    text: "Ein Streitkolben mit sternförmigem Kopf aus dunklem Stahl, der Schaft grün lackiert und bronzebeschlagen." },
  sterndorn: { id: "sterndorn", name: "Seltener Speer", platz: "waffe", art: "Speer", seltenheit: "selten", ebenen: ["waffe.sterndorn"],
    waffe: { art: "nah", ticks: 4, reich: 1.5, geschick: 6, staerke: 6 }, /* vorläufig: Speer, 4 Ticks, Reichweite wie Nahkampf (Reichweite 2 folgt) – Werte folgen */
    text: "Ein langer Speer mit schlanker Spitze und grünem Wimpel – für zwei Hände und große Reichweite." },
  mondlangbogen: { id: "mondlangbogen", name: "Seltener Langbogen", platz: "waffe", art: "Bogen", seltenheit: "selten", ebenen: ["waffe.mondbogen.lang"],
    waffe: { art: "fern", ticks: 5, reich: 7, flug: 18, fernAngriff: 12, fernStaerke: 12 }, /* vorläufig: Langbogen – Werte folgen */
    text: "Ein hoher Bogen mit geschwungenen Wurfarmen, bronzebeschlagen und mit grünen Steinen besetzt." },
  mondkurzbogen: { id: "mondkurzbogen", name: "Seltener Kurzbogen", platz: "waffe", art: "Bogen", seltenheit: "selten", ebenen: ["waffe.mondbogen.kurz"],
    waffe: { art: "fern", ticks: 4, reich: 6, flug: 18, fernAngriff: 10, fernStaerke: 10 }, /* vorläufig wie der Startbogen – Werte folgen */
    text: "Die handliche Schwester des Mond-Langbogens – schneller gezogen, weniger Reichweite." },
  sternarmbrust: { id: "sternarmbrust", name: "Seltene Armbrust", platz: "waffe", art: "Armbrust", seltenheit: "selten", ebenen: ["waffe.sternarmbrust"],
    waffe: { art: "fern", ticks: 5, reich: 6, flug: 22, fernAngriff: 12, fernStaerke: 12 }, /* vorläufig: Armbrust – Werte folgen */
    text: "Eine schwere Armbrust mit sternförmigem Bügel und grün lackiertem Schaft." },
  sternenszepter: { id: "sternenszepter", name: "Seltener Zauberstab", platz: "waffe", art: "Stab", seltenheit: "selten", ebenen: ["waffe.sternenszepter"],
    waffe: { art: "magie", ticks: 5, reich: 6, flug: 13, genau: 5, magieStaerke: 10 }, /* vorläufig wie der Startstab – Werte folgen */
    text: "Ein schlanker Zauberstab, dessen bronzene Krone einen blau leuchtenden Kristall umfasst." },
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
/* Die Waffen jeder Klasse (benannt nach Stufe und Klasse: Einfaches, Seltenes, Episches, Legendäres, Mythisches Schwert): übrige Stufen wie beim Eisenwacht-Set. Die Anfängerwaffen haben keine Stufen. */
const WAFFEN_STUFEN: { s: Seltenheit; w: string; text: string }[] = [
  { s: "gewoehnlich", w: "Einfach", text: "Schlicht gearbeitet, ohne Zierrat – solide Ware vom Dorfschmied." },
  { s: "episch", w: "Episch", text: "Nachtschwarzer Stahl mit Goldbeschlägen, die im Dunkeln schwach blau glimmen." },
  { s: "legendaer", w: "Legendär", text: "Schwer vergoldet; Kanten und Beschläge glühen wie frisch aus der Esse." },
  { s: "mythisch", w: "Mythisch", text: "Schillernder Obsidian mit leuchtenden Adern – als hätte jemand einen Stern hineingeschmiedet." },
];
for (const st of WAFFEN_STUFEN) for (const [basis, nomen, endung] of [["eidschwert", "Schwert", "es"], ["eiddolch", "Dolch", "er"], ["eidzweihaender", "Zweihänder", "er"], ["sternenschild", "Schild", "er"], ["sternbrecher", "Streitkolben", "er"], ["sterndorn", "Speer", "er"], ["mondlangbogen", "Langbogen", "er"], ["mondkurzbogen", "Kurzbogen", "er"], ["sternarmbrust", "Armbrust", "e"], ["sternenszepter", "Zauberstab", "er"]] as const) {
  const B = GEGENSTAENDE[basis], id = `${basis}_${st.s}`;
  GEGENSTAENDE[id] = { ...B, id, name: `${st.w}${endung} ${nomen}`, seltenheit: st.s, ebenen: (B.ebenen || []).map((e) => `${e}.${st.s}`), text: st.text };
}
/* Rüstungen: Name nach Stufe und Teil, wie bei den Waffen (Einfacher Helm, Seltene Kapuze, Epische Robe …). Gruppe: Nahkampf, Fernkampf, Magie */
export const RUESTUNGSGRUPPE: Record<string, "nahkampf" | "fernkampf" | "magie"> = {};
{
  const TEIL: Record<string, [string, "m" | "n" | "f" | "pl", "nahkampf" | "fernkampf" | "magie"]> = {
    eisenwachthelm: ["Helm", "m", "nahkampf"], eisenwacht: ["Brustpanzer", "m", "nahkampf"], eisenbeinschienen: ["Beinschienen", "pl", "nahkampf"],
    jaegerkapuze: ["Kapuze", "f", "fernkampf"], jaegerwams: ["Wams", "n", "fernkampf"], jaegerhose: ["Hose", "f", "fernkampf"],
    magierkapuze: ["Magierkapuze", "f", "magie"], magierrobe: ["Robe", "f", "magie"], magierrock: ["Rock", "m", "magie"],
  };
  const STAMM: Partial<Record<Seltenheit, string>> = { gewoehnlich: "Einfach", selten: "Selten", episch: "Episch", legendaer: "Legendär", mythisch: "Mythisch" };
  const ENDUNG = { m: "er", n: "es", f: "e", pl: "e" };
  for (const g of Object.values(GEGENSTAENDE)) { const basis = g.id.split("_")[0], t = TEIL[basis]; if (!t || !STAMM[g.seltenheit]) continue; g.name = `${STAMM[g.seltenheit]}${ENDUNG[t[1]]} ${t[0]}`; RUESTUNGSGRUPPE[g.id] = t[2]; }
  RUESTUNGSGRUPPE.lederpanzer = "nahkampf"; RUESTUNGSGRUPPE.magiepanzer = "magie";
}
/** Angriffsbewegung der 3D-Figur je Waffenart (nur Darstellung – der Kampf rechnet weiter mit dem Ausrüstungssatz der Startwaffe) */
export const ANGRIFF_JE_ART: Record<string, string> = { Einhandschwert: "stich", Streitkolben: "angriff", Speer: "stich2h", Dolch: "stich", Zweihandschwert: "hieb2h", Bogen: "bogen", Kurzbogen: "bogen", Stab: "zauber_stab", Armbrust: "armbrust1h" };
/** Angriffsbewegung zu den angelegten Figurenebenen (die Waffe in der Hand) – oder null, wenn keine bekannte Waffe angelegt ist */
export function angriffFuer(ebenen: string[]): string | null {
  for (const g of Object.values(GEGENSTAENDE)) if (g.platz === "waffe" && g.ebenen && g.ebenen.some((e) => ebenen.includes(e)) && ANGRIFF_JE_ART[g.art]) return ANGRIFF_JE_ART[g.art];
  return null;
}
/* Anzeigenamen kommen aus den Datenblättern der Figuren-Fabrik (Trainings-, Einfache, Seltene … Stücke) – eine Quelle, von build.mjs erzeugt. Die IDs bleiben (gespeicherte Inventare). */
for (const [id, n] of Object.entries(NAMEN_AUS_DATENBLAETTERN)) if (GEGENSTAENDE[id]) GEGENSTAENDE[id].name = n;
/* ───────── Werte „Ausrüstungs-Balancing durchsimuliert“ (23.11.2026) für Einfach (Level 10) und Selten (Level 20), umgerechnet auf Kampfsystem v3 ─────────
   Übernommen: Anforderungen, Ticks, Reichweiten (Nahkampf 1 Feld), Geschick-Boni, Fernkampf-Angriff (= Fernkampfstärke des Dokuments), Genauigkeit, Rüstungs- und Schildabwehr.
   Neu gerechnet (das Dokument nutzte noch die Schadensformeln von v2): die Stärke-Boni für den Max Hit. Anker ist das v3-Ziel „+114 → Stärke 50: 16, 99: 30“ –
   Schwert Einfach +30, Selten +50; jede andere Waffe hat zum Schwert dasselbe Max-Hit-Verhältnis wie im Dokument, Selten = Einfach im Verhältnis des Schwerts.
   Magie (ohne die +8 der Formel) braucht dafür höhere Magie-Stärke. Zweihänder und Speer: zweihändig, mit kleiner eigener Abwehr. Episch bis Mythisch: noch vorläufig. */
type Bal = { a?: [AnfSkill, number]; w?: Partial<WaffenWerte>; ab?: [number, number, number]; zweihand?: boolean };
const BALANCING: Record<string, Bal> = {
  eidschwert_gewoehnlich: { a: ["geschick", 10], w: { ticks: 3, reich: 1, geschick: 9, staerke: 30 } }, eidschwert: { a: ["geschick", 20], w: { ticks: 3, reich: 1, geschick: 14, staerke: 50 } },
  eiddolch_gewoehnlich: { a: ["geschick", 10], w: { ticks: 2, reich: 1, geschick: 12, staerke: 13 } }, eiddolch: { a: ["geschick", 20], w: { ticks: 2, reich: 1, geschick: 18, staerke: 29 } },
  eidzweihaender_gewoehnlich: { a: ["staerke", 10], w: { ticks: 4, reich: 1, geschick: 6, staerke: 107 }, ab: [1, 0, 0], zweihand: true }, eidzweihaender: { a: ["staerke", 20], w: { ticks: 4, reich: 1, geschick: 9, staerke: 143 }, ab: [1, 0, 0], zweihand: true },
  sternbrecher_gewoehnlich: { a: ["staerke", 10], w: { ticks: 3, reich: 1, geschick: 5, staerke: 98 } }, sternbrecher: { a: ["staerke", 20], w: { ticks: 3, reich: 1, geschick: 8, staerke: 132 } },
  sterndorn_gewoehnlich: { a: ["geschick", 10], w: { ticks: 4, reich: 1, geschick: 10, staerke: 21 }, ab: [1, 1, 0], zweihand: true }, sterndorn: { a: ["geschick", 20], w: { ticks: 4, reich: 1, geschick: 15, staerke: 39 }, ab: [1, 1, 0], zweihand: true },
  mondkurzbogen_gewoehnlich: { a: ["fernkampf", 10], w: { ticks: 3, reich: 5, fernAngriff: 9, fernStaerke: 13 } }, mondkurzbogen: { a: ["fernkampf", 20], w: { ticks: 3, reich: 5, fernAngriff: 12, fernStaerke: 29 } },
  mondlangbogen_gewoehnlich: { a: ["fernkampf", 10], w: { ticks: 5, reich: 7, fernAngriff: 12, fernStaerke: 39 } }, mondlangbogen: { a: ["fernkampf", 20], w: { ticks: 5, reich: 7, fernAngriff: 16, fernStaerke: 61 } },
  sternarmbrust_gewoehnlich: { a: ["fernkampf", 10], w: { ticks: 6, reich: 6, fernAngriff: 15, fernStaerke: 64 } }, sternarmbrust: { a: ["fernkampf", 20], w: { ticks: 6, reich: 6, fernAngriff: 19, fernStaerke: 91 } },
  sternenszepter_gewoehnlich: { a: ["magie", 10], w: { ticks: 5, reich: 6, genau: 8, magieStaerke: 121 } }, sternenszepter: { a: ["magie", 20], w: { ticks: 5, reich: 6, genau: 12, magieStaerke: 160 } },
  sternenschild_gewoehnlich: { a: ["defense", 10], ab: [4, 3, 2] }, sternenschild: { a: ["defense", 20], ab: [5, 4, 3] },
  eisenwachthelm_gewoehnlich: { a: ["defense", 10], ab: [1, 1, 0] }, eisenwacht_gewoehnlich: { a: ["defense", 10], ab: [3, 2, 1] }, eisenbeinschienen_gewoehnlich: { a: ["defense", 10], ab: [2, 1, 1] },
  eisenwachthelm: { a: ["defense", 20], ab: [2, 1, 1] }, eisenwacht: { a: ["defense", 20], ab: [4, 3, 2] }, eisenbeinschienen: { a: ["defense", 20], ab: [3, 2, 0] },
  jaegerkapuze: { a: ["defense", 10], ab: [1, 1, 0] }, jaegerwams: { a: ["defense", 10], ab: [2, 3, 1] }, jaegerhose: { a: ["defense", 10], ab: [0, 2, 1] },
  jaegerkapuze_selten: { a: ["defense", 20], ab: [1, 2, 1] }, jaegerwams_selten: { a: ["defense", 20], ab: [2, 4, 2] }, jaegerhose_selten: { a: ["defense", 20], ab: [2, 3, 0] },
  magierkapuze: { a: ["defense", 10], ab: [0, 1, 1] }, magierrobe: { a: ["defense", 10], ab: [1, 2, 3] }, magierrock: { a: ["defense", 10], ab: [1, 0, 2] },
  magierkapuze_selten: { a: ["defense", 20], ab: [1, 1, 2] }, magierrobe_selten: { a: ["defense", 20], ab: [2, 2, 4] }, magierrock_selten: { a: ["defense", 20], ab: [0, 2, 3] },
};
for (const [id, b] of Object.entries(BALANCING)) { const G = GEGENSTAENDE[id]; if (!G) continue;
  if (b.a) G.anforderung = { skill: b.a[0], level: b.a[1] }; if (b.w && G.waffe) G.waffe = { ...G.waffe, ...b.w }; if (b.ab) G.abwehr = { nah: b.ab[0], fern: b.ab[1], magie: b.ab[2] }; if (b.zweihand) G.zweihand = true; }
/** Darf ein Held mit diesen Skill-Leveln den Gegenstand anlegen? Zurück: Fehlertext oder null */
export function anforderungFehlt(G: Gegenstand, level: (s: AnfSkill) => number): string | null {
  const a = G.anforderung; return a && level(a.skill) < a.level ? `Dafür brauchst du ${ANF_NAME[a.skill]} ${a.level} (du hast ${level(a.skill)}).` : null; }
/** Die Gegenstände, mit denen ein neuer Held beginnt (nach der Startwaffe) */
export function startAusruestung(w: Startwaffe): Partial<Record<Platz, string>> {
  return w === "schwert" ? { waffe: "ritterschwert", nebenhand: "rundschild" } : w === "bogen" ? { waffe: "jagdbogen", brust: "lederpanzer" } : { waffe: "hirtenstab", brust: "magiepanzer" };
}
export const RUCKSACK_PLAETZE = 24;
/** Ein Rucksackfach: eine Gegenstands-id oder ein Stapel { g, n } (stapelbare Gegenstände) */
export type Fach = string | { g: string; n: number };
export const fachG = (f: Fach): string => (typeof f === "string" ? f : f.g);
export const fachN = (f: Fach): number => (typeof f === "string" ? 1 : f.n);

/* ---------- Verbrauchsgegenstände (Tränke) ----------
 * Noch nicht im Rucksack und noch ohne Wirkung im Kampf: das Leben im Kampf rechnet der Spielserver (shared/sim.ts) – das Trinken braucht dort einen eigenen Befehl.
 * Hier stehen schon Werte, Text und Modell (img/objekte3d, fabrik/drehobjekt.py: schwebt und dreht sich, Animation „drehen“). */
/** Verbrauchsgegenstand. stapelbar: mehrere liegen in einem Rucksackfeld (false = jeder belegt ein eigenes Feld). Heilung nie über das maximale Leben hinaus */
export interface Verbrauch { id: string; name: string; art: string; seltenheit: Seltenheit; heilt: { fest: number; anteil: number }; stapelbar: boolean; modell: string; werte: [string, string][]; text: string }
export const VERBRAUCH: Record<string, Verbrauch> = {
  kleiner_heiltrank: { id: "kleiner_heiltrank", name: "Kleiner Heiltrank", art: "Trank", seltenheit: "gewoehnlich", heilt: { fest: 5, anteil: 0 }, stapelbar: false, modell: "img/objekte3d/heiltrank-klein.glb",
    werte: [["Heilung", "5 (nicht über das maximale Leben)"], ["Stapelbar", "nein"]],
    text: "Ein Fläschchen grüner Kräutersud. Lindert Kratzer – für mehr reicht es nicht." },
  heiltrank: { id: "heiltrank", name: "Heiltrank", art: "Trank", seltenheit: "gewoehnlich", heilt: { fest: 10, anteil: 0.05 }, stapelbar: true, modell: "img/objekte3d/heiltrank.glb",
    werte: [["Heilung", "10 + 5 % des maximalen Lebens (nicht darüber)"], ["Stapelbar", "ja"]],
    text: "Ein rotes Elixier in bauchiger Flasche, mit dem Kreuz der Heiler auf dem Beschlag. Schließt Wunden, ersetzt aber keinen Rückzug." },
};
/** Wie viel ein Trank heilt, bei diesem maximalen Leben (gerundet) */
export const trankHeilung = (v: Verbrauch, maxLp: number) => Math.round(v.heilt.fest + v.heilt.anteil * maxLp);
/** Wie viel ein Trank bei diesem Leben tatsächlich heilt: nie über das maximale Leben hinaus (kein Überheilen) */
export const trankHeilungBei = (v: Verbrauch, lp: number, maxLp: number) => Math.max(0, Math.min(trankHeilung(v, maxLp), maxLp - lp));
