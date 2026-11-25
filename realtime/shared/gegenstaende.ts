/*
 * Gegenstände des eigenen Helden (Ausrüstung und Rucksack) – mit ihren Kampfwerten nach den Regeln v2 (shared/kampfwerte.ts).
 * Plätze im Ausrüstungsfenster: Waffe links, Brust (Rüstung) in der Mitte – zu Beginn leer, der Grundkörper trägt Hemd und Hose fest –, Nebenhand (Schild) rechts.
 * Waffe: Kampfart, Takt in Ticks (1 Tick = 0,5 s), Reichweite und die Werte ihrer Art – Nahkampf: Geschick- und Stärke-Bonus; Fernkampf: Fernkampfstärke;
 * Magie: Magische Genauigkeit und Schadensbereich. Schild und Rüstung: Verteidigungsboni je Angriffsart.
 * Startausrüstung bewusst schwach, aber klar verschieden: Upgrades sollen sich deutlich bemerkbar machen, die Heldenwerte zählen von Anfang an.
 */
import { Startwaffe } from "./aussehen";
import { NAMEN_AUS_DATENBLAETTERN } from "./gegenstand_namen";
import { BILDER_AUS_FABRIK } from "./gegenstand_bilder";

export type Seltenheit = "anfaenger" | "gewoehnlich" | "set" | "selten" | "episch" | "legendaer" | "mythisch";
/** Seltenheitsstufen: Name und Farbe (Rahmen im Ausrüstungsfenster) */
export const SELTENHEITEN: Record<Seltenheit, { name: string; farbe: string }> = {
  anfaenger: { name: "Training", farbe: "#8e8a82" }, gewoehnlich: { name: "Einfach", farbe: "#b9b4a8" }, set: { name: "Set", farbe: "#b08ad8" }, selten: { name: "Selten", farbe: "#5fcf6a" }, episch: { name: "Episch", farbe: "#6f8cff" },
  legendaer: { name: "Legendär", farbe: "#ff9a2e" }, mythisch: { name: "Mythisch", farbe: "#ff4fd8" },
};
export type Platz = "kopf" | "waffe" | "brust" | "beine" | "nebenhand";
export type Art = "nah" | "fern" | "magie";
export type AnfSkill = "geschick" | "staerke" | "fernkampf" | "magie" | "defense";
export const ANF_NAME: Record<AnfSkill, string> = { geschick: "Geschick", staerke: "Stärke", fernkampf: "Fernkampf", magie: "Magie", defense: "Defense" };
export const PLAETZE: { id: Platz; name: string }[] = [{ id: "kopf", name: "Kopf" }, { id: "waffe", name: "Waffe" }, { id: "brust", name: "Brust" }, { id: "beine", name: "Beine" }, { id: "nebenhand", name: "Nebenhand" }];
export interface WaffenWerte { art: Art; /** Mehr Schaden gegen eine Gegnerfamilie (MONSTER.familie), z. B. { wald: 0.15 } = +15 % Max Hit */ gegen?: Record<string, number>; /** Takt in Ticks (Normal-Stil) */ ticks: number; reich: number; flug?: number; geschick?: number; staerke?: number; /** Fernkampf: Angriffsbonus (Trefferwurf) und Stärkebonus (Max Hit, die Pfeile/Bolzen stecken in der Waffe); Magie: genau = magischer Angriffsbonus */ fernAngriff?: number; fernStaerke?: number; genau?: number; /** Magie: Stärkebonus (Max Hit) */ magieStaerke?: number }
/** platz fehlt: nicht anlegbar (Währung, Questgegenstand). stapel: so viele passen in ein Rucksackfach (mit Zähler). modell3d: 3D-Modell am Boden. symbol: Bild im Rucksack ohne Figurenebene */
export interface Gegenstand { id: string; name: string; platz?: Platz; art: string; seltenheit: Seltenheit; ebenen?: string[]; waffe?: WaffenWerte; abwehr?: Record<Art, number>; /** Boni von Rüstung/Schmuck auf Trefferwert und Max Hit (v3: die Ausrüstung zählt gesamt) */ bonus?: { geschick?: number; staerke?: number; fernAngriff?: number; fernStaerke?: number; genau?: number; magieStaerke?: number }; text: string;
  /** nicht tauschbar (Questgegenstände) */ untauschbar?: boolean; stapel?: number; modell3d?: string; symbol?: "kristall" | "pergament" | "trank" | "trankrot"; /** Bild im Rucksack (freigestelltes Bild statt Figurenebene) */ bild?: string; /** zum Anlegen nötiges Skill-Level (Balancing 23.11.2026) */ anforderung?: { skill: AnfSkill; level: number }; /** belegt Waffe und Nebenhand (kein Schild) */ zweihand?: boolean; /** Verbrauch: Trank (VERBRAUCH[trank]) – im Rucksack trinken */ trank?: string }

const KAMPFART: Record<Art, string> = { nah: "Nahkampf", fern: "Fernkampf", magie: "Magie" };
const zahl = (v: number) => String(v).replace(".", ",");
const vz = (v: number | undefined) => ((v || 0) < 0 ? "−" + -(v || 0) : "+" + (v || 0));
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
  if (G.abwehr) return [["Verteidigung Nahkampf", vz(G.abwehr.nah)], ["Verteidigung Fernkampf", vz(G.abwehr.fern)], ["Verteidigung Magie", vz(G.abwehr.magie)], ...(G.bonus && G.bonus.fernAngriff ? [["Fernkampf-Angriff", vz(G.bonus.fernAngriff)] as [string, string]] : []), ...(G.bonus && G.bonus.genau ? [["Magische Genauigkeit", vz(G.bonus.genau)] as [string, string]] : []), ...(G.anforderung ? [["Benötigt", `${ANF_NAME[G.anforderung.skill]} ${G.anforderung.level}`] as [string, string]] : [])];
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
  waldsaebel: { id: "waldsaebel", name: "Gesegneter Waldsäbel", platz: "waffe", art: "Einhandschwert", seltenheit: "selten", ebenen: ["waffe.waldsaebel"],
    waffe: { art: "nah", ticks: 3, reich: 1.5, geschick: 5, staerke: 5 }, /* vorläufig wie das Startschwert – Werte folgen */ text: "Eine geschwungene Klinge, um deren Griff sich lebendige Dornenranken winden – vom Segen des Waldes durchdrungen." },
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
  /* Holzfällerei (shared/holz.ts, 24.11.2026): Stämme stapeln nicht (wie OSRS); Holzbeile fällen (Holzfällerei-Level, Beilstufe) und taugen als schwache Einhandwaffe (≈ ⅔ der Klinge derselben Stufe) */
  stamm_eiche: { id: "stamm_eiche", name: "Eichenstamm", art: "Rohstoff", seltenheit: "anfaenger", bild: "img/objekte3d/skilling/erzeugnisse/stamm_eiche.webp", text: "Ein frischer Eichenstamm mit hellem Kern. Gutes Holz für Bögen und Stäbe der ersten Stufe – und Brennstoff für die Esse." },
  stamm_tanne: { id: "stamm_tanne", name: "Tannenstamm", art: "Rohstoff", seltenheit: "gewoehnlich", bild: "img/objekte3d/skilling/erzeugnisse/stamm_tanne.webp", text: "Ein harziger Tannenstamm, gerade gewachsen. Daraus werden einfache Bögen, Stäbe und Schilde." },
  stamm_eibe: { id: "stamm_eibe", name: "Eibenstamm", art: "Rohstoff", seltenheit: "selten", bild: "img/objekte3d/skilling/erzeugnisse/stamm_eibe.webp", text: "Zähes, rötliches Eibenholz – das klassische Holz für gute Bögen." },
  stamm_moorweide: { id: "stamm_moorweide", name: "Moorweidenstamm", art: "Rohstoff", seltenheit: "episch", bild: "img/objekte3d/skilling/erzeugnisse/stamm_moorweide.webp", text: "Ein knorriger Stamm aus dem Rabenmoor, feucht und biegsam. Seine Adern glimmen noch schwach." },
  stamm_kernbaum: { id: "stamm_kernbaum", name: "Kernbaumstamm", art: "Rohstoff", seltenheit: "legendaer", bild: "img/objekte3d/skilling/erzeugnisse/stamm_kernbaum.webp", text: "Uraltes Holz aus den Ruinen des Nordwalds. Im Kern schimmert ein goldenes Licht." },
  stamm_weltenbaum: { id: "stamm_weltenbaum", name: "Weltenbaumstamm", art: "Rohstoff", seltenheit: "mythisch", bild: "img/objekte3d/skilling/erzeugnisse/stamm_weltenbaum.webp", text: "Holz eines jungen Weltenbaums, gewachsen an den Rissen. Es fühlt sich warm an und summt leise." },
  hammer: { id: "hammer", name: "Hammer", art: "Werkzeug", seltenheit: "anfaenger", bild: "img/objekte3d/skilling/utensilien/symbole/hammer.webp", modell3d: "img/objekte3d/skilling/utensilien/hammer.glb", text: "Ein schwerer Schmiedehammer. Ohne ihn im Rucksack geht am Amboss nichts." },
  holzbeil_training: { id: "holzbeil_training", name: "Trainings-Holzbeil", platz: "waffe", art: "Holzbeil", seltenheit: "anfaenger", bild: "img/objekte3d/skilling/utensilien/symbole/holzbeil.training.webp",
    waffe: { art: "nah", ticks: 4, reich: 1, geschick: 5, staerke: 4 }, text: "Ein rostiges Beil mit ausgeblichenem Stiel. Fällt Eichen – und taugt im Notfall zur Verteidigung." },
  holzbeil_einfach: { id: "holzbeil_einfach", name: "Einfaches Holzbeil", platz: "waffe", art: "Holzbeil", seltenheit: "gewoehnlich", bild: "img/objekte3d/skilling/utensilien/symbole/holzbeil.einfach.webp", anforderung: { skill: "geschick", level: 10 },
    waffe: { art: "nah", ticks: 4, reich: 1, geschick: 12, staerke: 11 }, text: "Ein solides Beil aus Eisen. Fällt Bäume bis zur Tanne zügiger." },
  holzbeil_selten: { id: "holzbeil_selten", name: "Seltenes Holzbeil", platz: "waffe", art: "Holzbeil", seltenheit: "selten", bild: "img/objekte3d/skilling/utensilien/symbole/holzbeil.selten.webp", anforderung: { skill: "geschick", level: 20 },
    waffe: { art: "nah", ticks: 4, reich: 1, geschick: 15, staerke: 15 }, text: "Ein scharfes Beil mit gehärteter Klinge und Nussbaumstiel." },
  holzbeil_episch: { id: "holzbeil_episch", name: "Episches Holzbeil", platz: "waffe", art: "Holzbeil", seltenheit: "episch", bild: "img/objekte3d/skilling/utensilien/symbole/holzbeil.episch.webp", anforderung: { skill: "geschick", level: 35 },
    waffe: { art: "nah", ticks: 4, reich: 1, geschick: 19, staerke: 19 }, text: "Blau glimmende Metallkanten – es beißt sich tief ins Holz." },
  holzbeil_legendaer: { id: "holzbeil_legendaer", name: "Legendäres Holzbeil", platz: "waffe", art: "Holzbeil", seltenheit: "legendaer", bild: "img/objekte3d/skilling/utensilien/symbole/holzbeil.legendaer.webp", anforderung: { skill: "geschick", level: 45 },
    waffe: { art: "nah", ticks: 4, reich: 1, geschick: 25, staerke: 26 }, text: "Orange glühende Schneide, Stiel aus rotbraunem Holz. Ein Meisterwerkzeug." },
  holzbeil_mythisch: { id: "holzbeil_mythisch", name: "Mythisches Holzbeil", platz: "waffe", art: "Holzbeil", seltenheit: "mythisch", bild: "img/objekte3d/skilling/utensilien/symbole/holzbeil.mythisch.webp", anforderung: { skill: "geschick", level: 65 },
    waffe: { art: "nah", ticks: 4, reich: 1, geschick: 46, staerke: 47 }, text: "Türkis bis magenta leuchtende Kanten, Ebenholzstiel. Selbst Weltenbaumholz gibt ihm nach." },
  /* Handwerk (shared/handwerk.ts, 25.11.2026): Barren (Esse), Flachs und Hanf (Felder im Osthof), Bogensehne und Garn (Werkbank), Kuhhaut (Kühe im Osthof), Leder und Stoff je Stufe (Werkbank). Nur Garn stapelt */
  barren_kupfer: { id: "barren_kupfer", name: "Kupferbarren", art: "Rohstoff", seltenheit: "anfaenger", bild: "img/objekte3d/skilling/erzeugnisse/barren_kupfer.webp", text: "Ein rötlich schimmernder Barren. Weich genug für Übungsklingen und erste Werkzeuge." },
  barren_eisen: { id: "barren_eisen", name: "Eisenbarren", art: "Rohstoff", seltenheit: "gewoehnlich", bild: "img/objekte3d/skilling/erzeugnisse/barren_eisen.webp", text: "Ein grauer, schwerer Barren. Der Grundstoff des einfachen Schmiedens." },
  barren_schwarzeisen: { id: "barren_schwarzeisen", name: "Schwarzeisenbarren", art: "Rohstoff", seltenheit: "selten", bild: "img/objekte3d/skilling/erzeugnisse/barren_schwarzeisen.webp", text: "Ein fast schwarzer Barren mit stumpfem Glanz. Hart und zäh." },
  barren_sterneisen: { id: "barren_sterneisen", name: "Sterneisenbarren", art: "Rohstoff", seltenheit: "episch", bild: "img/objekte3d/skilling/erzeugnisse/barren_sterneisen.webp", text: "Ein Barren mit hellen Sprenkeln, als wären Sterne eingeschmolzen." },
  barren_splittereisen: { id: "barren_splittereisen", name: "Splittereisenbarren", art: "Rohstoff", seltenheit: "legendaer", bild: "img/objekte3d/skilling/erzeugnisse/barren_splittereisen.webp", text: "Blau geäderter Barren. Die Splitteradern glimmen noch." },
  barren_ureisen: { id: "barren_ureisen", name: "Ureisenbarren", art: "Rohstoff", seltenheit: "mythisch", bild: "img/objekte3d/skilling/erzeugnisse/barren_ureisen.webp", text: "Ein dunkler, warmer Barren aus Ureisen. Er fühlt sich lebendig an." },
  flachs: { id: "flachs", name: "Flachs", art: "Rohstoff", seltenheit: "anfaenger", bild: "img/objekte3d/skilling/erzeugnisse/flachs.webp", modell3d: "img/objekte3d/skilling/sammeln/flachs.glb", text: "Ein Bündel Flachs mit blauen Blüten. An der Werkbank wird daraus eine Bogensehne." },
  hanf: { id: "hanf", name: "Hanf", art: "Rohstoff", seltenheit: "anfaenger", bild: "img/objekte3d/skilling/erzeugnisse/hanf.webp", modell3d: "img/objekte3d/skilling/sammeln/hanf.glb", text: "Zäher Hanf mit gezackten Blättern. An der Werkbank wird daraus Garn." },
  bogensehne: { id: "bogensehne", name: "Bogensehne", art: "Rohstoff", seltenheit: "anfaenger", bild: "img/objekte3d/skilling/erzeugnisse/bogensehne.webp", modell3d: "img/objekte3d/skilling/handwerk/zwischen/bogensehne.glb", text: "Eine gedrehte Sehne aus Flachs. Für Kurz-, Langbögen und Armbrüste." },
  garn: { id: "garn", name: "Garn", art: "Rohstoff", seltenheit: "anfaenger", stapel: 1000, bild: "img/objekte3d/skilling/erzeugnisse/garn.webp", modell3d: "img/objekte3d/skilling/handwerk/zwischen/garn.glb", text: "Eine Spule Hanfgarn. Daraus wird Stoff gewebt – und Rüstung genäht." },
  kuhhaut: { id: "kuhhaut", name: "Kuhhaut", art: "Rohstoff", seltenheit: "anfaenger", bild: "img/objekte3d/skilling/erzeugnisse/kuhhaut.webp", modell3d: "img/objekte3d/kuhhaut.glb", text: "Ein Fell mit kastanienbraunen Flecken, noch ungegerbt. An der Werkbank wird daraus Leder." },
  leder_rau: { id: "leder_rau", name: "Raues Leder", art: "Rohstoff", seltenheit: "anfaenger", bild: "img/objekte3d/skilling/erzeugnisse/leder_rau.webp", modell3d: "img/objekte3d/skilling/handwerk/zwischen/leder_rau.glb", text: "Steifes, grob gegerbtes Leder. Für erste Kapuzen und Wämser." },
  leder_weich: { id: "leder_weich", name: "Weiches Leder", art: "Rohstoff", seltenheit: "gewoehnlich", bild: "img/objekte3d/skilling/erzeugnisse/leder_weich.webp", modell3d: "img/objekte3d/skilling/handwerk/zwischen/leder_weich.glb", text: "Geschmeidig gegerbtes Leder in Sattelbraun." },
  leder_gehaertet: { id: "leder_gehaertet", name: "Gehärtetes Leder", art: "Rohstoff", seltenheit: "selten", bild: "img/objekte3d/skilling/erzeugnisse/leder_gehaertet.webp", modell3d: "img/objekte3d/skilling/handwerk/zwischen/leder_gehaertet.glb", text: "In Wachs gehärtetes, waldgrünes Leder. Hält Hiebe ab." },
  leder_moor: { id: "leder_moor", name: "Moorleder", art: "Rohstoff", seltenheit: "episch", bild: "img/objekte3d/skilling/erzeugnisse/leder_moor.webp", modell3d: "img/objekte3d/skilling/handwerk/zwischen/leder_moor.glb", text: "Nachtblaues Leder, im Moorwasser gegerbt. Die Nähte glimmen blau." },
  leder_splitter: { id: "leder_splitter", name: "Splitterleder", art: "Rohstoff", seltenheit: "legendaer", bild: "img/objekte3d/skilling/erzeugnisse/leder_splitter.webp", modell3d: "img/objekte3d/skilling/handwerk/zwischen/leder_splitter.glb", text: "Ochsenblutrotes Leder mit golden glühenden Nähten." },
  leder_ur: { id: "leder_ur", name: "Urleder", art: "Rohstoff", seltenheit: "mythisch", bild: "img/objekte3d/skilling/erzeugnisse/leder_ur.webp", modell3d: "img/objekte3d/skilling/handwerk/zwischen/leder_ur.glb", text: "Schillernd violettes Leder. Türkis und Magenta wandern über die Nähte." },
  stoff_hanf: { id: "stoff_hanf", name: "Hanftuch", art: "Rohstoff", seltenheit: "anfaenger", bild: "img/objekte3d/skilling/erzeugnisse/stoff_hanf.webp", modell3d: "img/objekte3d/skilling/handwerk/zwischen/stoff_hanf.glb", text: "Ungefärbtes, festes Tuch aus Hanfgarn." },
  stoff_grob: { id: "stoff_grob", name: "Grobtuch", art: "Rohstoff", seltenheit: "gewoehnlich", bild: "img/objekte3d/skilling/erzeugnisse/stoff_grob.webp", modell3d: "img/objekte3d/skilling/handwerk/zwischen/stoff_grob.glb", text: "Graubraunes, dicht gewebtes Tuch." },
  stoff_fein: { id: "stoff_fein", name: "Feintuch", art: "Rohstoff", seltenheit: "selten", bild: "img/objekte3d/skilling/erzeugnisse/stoff_fein.webp", modell3d: "img/objekte3d/skilling/handwerk/zwischen/stoff_fein.glb", text: "Smaragdgrünes, feines Tuch – leicht und weich." },
  stoff_mond: { id: "stoff_mond", name: "Mondtuch", art: "Rohstoff", seltenheit: "episch", bild: "img/objekte3d/skilling/erzeugnisse/stoff_mond.webp", modell3d: "img/objekte3d/skilling/handwerk/zwischen/stoff_mond.glb", text: "Purpurnes Tuch mit blau schimmerndem Saum." },
  stoff_splitter: { id: "stoff_splitter", name: "Splittertuch", art: "Rohstoff", seltenheit: "legendaer", bild: "img/objekte3d/skilling/erzeugnisse/stoff_splitter.webp", modell3d: "img/objekte3d/skilling/handwerk/zwischen/stoff_splitter.glb", text: "Karmesinrotes Tuch mit golden glühendem Saum." },
  stoff_welten: { id: "stoff_welten", name: "Weltentuch", art: "Rohstoff", seltenheit: "mythisch", bild: "img/objekte3d/skilling/erzeugnisse/stoff_welten.webp", modell3d: "img/objekte3d/skilling/handwerk/zwischen/stoff_welten.glb", text: "Nachtviolettes Tuch, in dessen Saum Türkis und Magenta pulsieren." },
  /* Bergbau (shared/bergbau.ts, 24.11.2026): Erze stapeln nicht (wie die Stämme); Spitzhacken bauen ab (Bergbau-Level, Hackenstufe) und taugen als schwache Waffe wie die Holzbeile */
  erz_kupfer: { id: "erz_kupfer", name: "Kupfererz", art: "Rohstoff", seltenheit: "anfaenger", bild: "img/objekte3d/skilling/erzeugnisse/erz_kupfer.webp", text: "Grünlich angelaufenes Kupfererz aus dem Steinbruch. Mit Holz in der Esse wird ein Kupferbarren daraus." },
  erz_eisen: { id: "erz_eisen", name: "Eisenerz", art: "Rohstoff", seltenheit: "gewoehnlich", bild: "img/objekte3d/skilling/erzeugnisse/erz_eisen.webp", text: "Schweres, rostrotes Eisenerz. Der Grundstoff für einfache Waffen und Rüstungen." },
  erz_schwarzeisen: { id: "erz_schwarzeisen", name: "Schwarzeisenerz", art: "Rohstoff", seltenheit: "selten", bild: "img/objekte3d/skilling/erzeugnisse/erz_schwarzeisen.webp", text: "Dunkles, fast schwarzes Erz vom Flussufer. Härter als Eisen und schwer zu schmelzen." },
  erz_sterneisen: { id: "erz_sterneisen", name: "Sterneisenerz", art: "Rohstoff", seltenheit: "episch", bild: "img/objekte3d/skilling/erzeugnisse/erz_sterneisen.webp", text: "Erz mit hellen, funkelnden Einschlüssen – als wäre ein Stück Nachthimmel darin gefangen." },
  erz_splittereisen: { id: "erz_splittereisen", name: "Splittereisenerz", art: "Rohstoff", seltenheit: "legendaer", bild: "img/objekte3d/skilling/erzeugnisse/erz_splittereisen.webp", text: "Erz von den Rissen, durchzogen von blau glimmenden Splitteradern. Es summt leise in der Hand." },
  erz_ureisen: { id: "erz_ureisen", name: "Ureisenerz", art: "Rohstoff", seltenheit: "mythisch", bild: "img/objekte3d/skilling/erzeugnisse/erz_ureisen.webp", text: "Uraltes Erz aus der Tiefe. Es ist schwerer, als es aussieht, und fühlt sich warm an." },
  spitzhacke_training: { id: "spitzhacke_training", name: "Trainings-Spitzhacke", platz: "waffe", art: "Spitzhacke", seltenheit: "anfaenger", bild: "img/objekte3d/skilling/utensilien/symbole/spitzhacke.training.webp",
    waffe: { art: "nah", ticks: 4, reich: 1, geschick: 5, staerke: 4 }, text: "Eine stumpfe Hacke mit wackligem Stiel. Bricht Kupfererz – und taugt im Notfall zur Verteidigung." },
  spitzhacke_einfach: { id: "spitzhacke_einfach", name: "Einfache Spitzhacke", platz: "waffe", art: "Spitzhacke", seltenheit: "gewoehnlich", bild: "img/objekte3d/skilling/utensilien/symbole/spitzhacke.einfach.webp", anforderung: { skill: "geschick", level: 10 },
    waffe: { art: "nah", ticks: 4, reich: 1, geschick: 12, staerke: 11 }, text: "Eine solide Hacke aus Eisen. Kommt bis zum Eisenerz zügiger voran." },
  spitzhacke_selten: { id: "spitzhacke_selten", name: "Seltene Spitzhacke", platz: "waffe", art: "Spitzhacke", seltenheit: "selten", bild: "img/objekte3d/skilling/utensilien/symbole/spitzhacke.selten.webp", anforderung: { skill: "geschick", level: 20 },
    waffe: { art: "nah", ticks: 4, reich: 1, geschick: 15, staerke: 15 }, text: "Gehärtete Spitze, Stiel aus Eisenholz. Beißt sich durch Schwarzeisen." },
  spitzhacke_episch: { id: "spitzhacke_episch", name: "Epische Spitzhacke", platz: "waffe", art: "Spitzhacke", seltenheit: "episch", bild: "img/objekte3d/skilling/utensilien/symbole/spitzhacke.episch.webp", anforderung: { skill: "geschick", level: 35 },
    waffe: { art: "nah", ticks: 4, reich: 1, geschick: 19, staerke: 19 }, text: "Blau glimmende Kanten – das Gestein gibt nach, bevor sie es trifft." },
  spitzhacke_legendaer: { id: "spitzhacke_legendaer", name: "Legendäre Spitzhacke", platz: "waffe", art: "Spitzhacke", seltenheit: "legendaer", bild: "img/objekte3d/skilling/utensilien/symbole/spitzhacke.legendaer.webp", anforderung: { skill: "geschick", level: 45 },
    waffe: { art: "nah", ticks: 4, reich: 1, geschick: 25, staerke: 26 }, text: "Orange glühende Spitze. Ein Meisterwerkzeug für die Splitterfelsen." },
  spitzhacke_mythisch: { id: "spitzhacke_mythisch", name: "Mythische Spitzhacke", platz: "waffe", art: "Spitzhacke", seltenheit: "mythisch", bild: "img/objekte3d/skilling/utensilien/symbole/spitzhacke.mythisch.webp", anforderung: { skill: "geschick", level: 65 },
    waffe: { art: "nah", ticks: 4, reich: 1, geschick: 46, staerke: 47 }, text: "Türkis bis magenta leuchtende Kanten. Selbst Ureisen bricht unter ihr." },
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
export const RUESTUNGSGRUPPE: Record<string, "nahkampf" | "fernkampf" | "magie" | "rabenset"> = {};
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
/* ---------- Rabenset: Belohnung der Raben-Trilogie (je Abschnitt ein Teil). Defensiv ausgewogen, schwächer als „selten“ (zwischen einfach und selten),
   dafür ein Set-Bonus, wenn alle drei Teile angelegt sind. Abwehr nach OSRS-Maßstab (v4, zwischen Hartleder und beschlagenem Leder, ohne Angriffsabzug), Defense 15 – vorläufig.
   Der Set-Bonus (Heilung) steht als Daten und Anzeige bereit, die Kampfsimulation rechnet ihn noch nicht. ---------- */
GEGENSTAENDE.rabenkapuze = { id: "rabenkapuze", name: "Rabenkapuze", platz: "kopf", art: "Leichte Rüstung", seltenheit: "set", ebenen: ["kopf.helm.rabe"], anforderung: { skill: "defense", level: 15 },
  abwehr: { nah: 7, fern: 7, magie: 5 }, text: "Schwarzes Leder unter einem Kragen aus Rabenfedern. Teil 1 des Rabensets – Belohnung aus dem ersten Abschnitt der Raben-Trilogie." };
GEGENSTAENDE.rabenpanzer = { id: "rabenpanzer", name: "Rabenpanzer", platz: "brust", art: "Leichte Rüstung", seltenheit: "set", ebenen: ["ruestung.brust.rabe"], anforderung: { skill: "defense", level: 15 },
  abwehr: { nah: 19, fern: 20, magie: 14 }, text: "Federbesetzte Schulterstücke, das Leder bronzen gesäumt. Teil 2 des Rabensets – Belohnung aus dem zweiten Abschnitt der Raben-Trilogie." };
GEGENSTAENDE.rabenbeinschuetzer = { id: "rabenbeinschuetzer", name: "Rabenbeinschützer", platz: "beine", art: "Leichte Rüstung", seltenheit: "set", ebenen: ["ruestung.beine.rabe"], anforderung: { skill: "defense", level: 15 },
  abwehr: { nah: 11, fern: 11, magie: 8 }, text: "Gehärtetes Leder mit Federsaum und einem Rabenwappen am Gürtel. Teil 3 des Rabensets – Belohnung aus dem dritten Abschnitt der Raben-Trilogie." };
RUESTUNGSGRUPPE.rabenkapuze = RUESTUNGSGRUPPE.rabenpanzer = RUESTUNGSGRUPPE.rabenbeinschuetzer = "rabenset";
export interface SetBonus { id: string; name: string; teile: string[]; text: string; heilung: { chance: number; anteil: number } }
export const SETS: Record<string, SetBonus> = {
  rabenset: { id: "rabenset", name: "Rabenset", teile: ["rabenkapuze", "rabenpanzer", "rabenbeinschuetzer"], heilung: { chance: 0.15, anteil: 0.5 },
    text: "Alle drei Teile angelegt: Jeder Treffer, der Schaden macht, heilt mit 15 % Wahrscheinlichkeit um 50 % dieses Schadens (nicht über das maximale Leben)." },
};
/** Aktive Set-Boni bei diesen angelegten Gegenständen */
export const aktiveSets = (angelegt: (string | undefined)[]) => Object.values(SETS).filter((s) => s.teile.every((t) => angelegt.includes(t)));
/** Heilung durch den Set-Bonus für einen Treffer (zufall: 0..1, z. B. Math.random()); 0 bei Schaden 0 oder ohne Glück */
export const setHeilung = (s: SetBonus, schaden: number, zufall: number) => (schaden > 0 && zufall < s.heilung.chance ? Math.round(schaden * s.heilung.anteil) : 0);
/** Angriffsbewegung der 3D-Figur je Waffenart (nur Darstellung – der Kampf rechnet weiter mit dem Ausrüstungssatz der Startwaffe) */
export const ANGRIFF_JE_ART: Record<string, string> = { Einhandschwert: "stich", Streitkolben: "angriff", Speer: "stich2h", Dolch: "stich", Zweihandschwert: "hieb2h", Bogen: "bogen", Kurzbogen: "bogen", Stab: "zauber_stab", Armbrust: "armbrust1h" };
/** Angriffsbewegung zu den angelegten Figurenebenen (die Waffe in der Hand) – oder null, wenn keine bekannte Waffe angelegt ist */
export function angriffFuer(ebenen: string[]): string | null {
  for (const g of Object.values(GEGENSTAENDE)) if (g.platz === "waffe" && g.ebenen && g.ebenen.some((e) => ebenen.includes(e)) && ANGRIFF_JE_ART[g.art]) return ANGRIFF_JE_ART[g.art];
  return null;
}
/* Anzeigenamen kommen aus den Datenblättern der Figuren-Fabrik (Trainings-, Einfache, Seltene … Stücke) – eine Quelle, von build.mjs erzeugt. Die IDs bleiben (gespeicherte Inventare). */
for (const [id, n] of Object.entries(NAMEN_AUS_DATENBLAETTERN)) if (GEGENSTAENDE[id]) GEGENSTAENDE[id].name = n;
/* Rucksack-Bilder der Waffen und Rüstungen (werkzeug/ausruestung_bilder.py): ein festes Bild statt jedes Mal aus dem 3D-Modell gerendert; eigene Bilder bleiben */
for (const [id, b] of Object.entries(BILDER_AUS_FABRIK)) if (GEGENSTAENDE[id] && !GEGENSTAENDE[id].bild && !GEGENSTAENDE[id].symbol) GEGENSTAENDE[id].bild = b;
/* Quest 03 „Der Säbel des Waldgottes“ (shared/quest03.ts): Holz, Erz, Barren und der Waldsäbel – nicht tauschbar */
{ const Q = "img/objekte3d/skilling/erzeugnisse/";
  GEGENSTAENDE.holz_waldgott = { id: "holz_waldgott", name: "Holz des Waldgottes", art: "Questgegenstand", seltenheit: "selten", untauschbar: true, bild: Q + "holz_waldgott.webp", modell3d: "img/objekte3d/skilling/holzfaellerei/stamm_weltenbaum.glb",
    text: "Helles, warmes Holz vom Baum des Waldgottes. Kein Splitter hat diesen Baum je berührt." };
  GEGENSTAENDE.erz_waldstein = { id: "erz_waldstein", name: "Waldstein", art: "Questgegenstand", seltenheit: "selten", untauschbar: true, bild: Q + "erz_waldstein.webp",
    text: "Ein grünlich schimmernder Stein aus dem Nordwald. Er fühlt sich kühl an – wie Erde nach Regen." };
  GEGENSTAENDE.barren_waldstein = { id: "barren_waldstein", name: "Waldsteinbarren", art: "Questgegenstand", seltenheit: "selten", untauschbar: true, bild: Q + "barren_waldstein.webp",
    text: "Geschmolzener Waldstein. Das Metall nimmt keine Splitter an." };
  GEGENSTAENDE.waldsaebel = { ...GEGENSTAENDE.waldsaebel /* der vorhandene Gesegnete Waldsäbel: eigenes Modell (waffe.waldsaebel) und Bild */, untauschbar: true,
    anforderung: { skill: "geschick", level: 5 }, waffe: { art: "nah", ticks: 3, reich: 1, geschick: 21, staerke: 19, gegen: { wald: 0.15 } },
    text: "Eine geschwungene Klinge aus Waldstein, der Griff aus dem Holz des Waldgottes, umrankt von lebendigen Dornen. Er trifft, was die Splitter verändert haben, härter: +15 % Schaden gegen Wesen des Waldes (Waldgolems, Mooshocker). Nicht tauschbar." }; }
/* Zwischenteile des Handwerks (wie in OSRS): ungespannte Bögen und Armbrustschäfte – an der Werkbank geschnitzt, im Rucksack mit einer Bogensehne zur Waffe (Bilder: werkzeug/zwischenteile_bilder.py) */
const ZW_STUFEN = ["_gewoehnlich", "", "_episch", "_legendaer", "_mythisch"];
export const ZWISCHEN_BOEGEN = [...ZW_STUFEN.map((s) => "mondkurzbogen" + s), ...ZW_STUFEN.map((s) => "mondlangbogen" + s)], ZWISCHEN_ARMBRUESTE = ZW_STUFEN.map((s) => "sternarmbrust" + s);
/** Das Zwischenteil zu einer Fernkampfwaffe ("" = keins) */
export const zwischenteil = (g: string): string => (ZWISCHEN_BOEGEN.includes(g) ? "ungespannt_" + g : ZWISCHEN_ARMBRUESTE.includes(g) ? "schaft_" + g : "");
for (const g of [...ZWISCHEN_BOEGEN, ...ZWISCHEN_ARMBRUESTE]) { const W = GEGENSTAENDE[g]; if (!W) continue; const id = zwischenteil(g), bogen = id.startsWith("ungespannt_");
  GEGENSTAENDE[id] = { id, name: bogen ? `${W.name} (ungespannt)` : `${W.name} (Schaft)`, art: "Rohstoff", seltenheit: W.seltenheit, bild: `img/objekte3d/skilling/erzeugnisse/${id}.webp`,
    text: bogen ? `Geschnitzt, aber noch ohne Sehne. Benutze eine Bogensehne darauf, dann wird daraus: ${W.name}.` : `Schaft und Bogenarme sind fertig, die Sehne fehlt. Benutze eine Bogensehne darauf, dann wird daraus: ${W.name}.` }; }
/* ───────── Ausrüstung nach OSRS (Vorgabe 23.11.2026): Training ↔ Bronze/Leder/Zauberrobe, Einfach (Level 10) ↔ Black, Selten (Level 20) ↔ Mithril ─────────
   Treffer und Abwehr rechnen wie OSRS: Wurf = (Level + Stil + 8) × (Bonus + 64) – die Boni sind die OSRS-Werte direkt.
   Nahkampf: ein Angriffsbonus (der passende OSRS-Angriffsstil der Waffe). Fernkampf: Bogen und Munition in einem (Pfeil-/Bolzenstärke in fernStaerke).
   Magie: der Zauber steckt im Stab (magieStaerke). Rüstung: Abwehr nah = Mittel aus Stich/Hieb/Wucht; Metall senkt Fernkampf- und Magie-Angriff wie in OSRS.
   Anforderungen, Ticks und Reichweiten aus dem Balancing-Dokument. Episch (35) ↔ Adamant, Legendär (45) ↔ Rune, Mythisch (65) ↔ Dragon. */
type Bal = { a?: [AnfSkill, number]; w?: Partial<WaffenWerte>; ab?: [number, number, number]; /** Angriffsboni der Rüstung: [Fernkampf, Magie] */ mal?: [number, number]; zweihand?: boolean };
/* OSRS-Abzüge der Metallrüstung auf Fernkampf- und Magie-Angriff (Volle Helme, Plattenpanzer, Beinschienen, Kite-Schilde) */
const HELM: [number, number] = [-3, -6], PANZER: [number, number] = [-15, -30], BEINE: [number, number] = [-11, -21], KITE: [number, number] = [-2, -8];
const BALANCING: Record<string, Bal> = {
  /* Training (Level 1): Bronze-Säbel, Kurzbogen + Bronzepfeile, Luftstab, Bronze-Kiteschild, Lederwams, Zauberrobe */
  ritterschwert: { w: { geschick: 7, staerke: 6 } }, jagdbogen: { w: { fernAngriff: 8, fernStaerke: 7 } }, hirtenstab: { w: { genau: 10 } },
  rundschild: { ab: [6, 6, -1], mal: KITE }, lederpanzer: { ab: [9, 9, 4], mal: [2, -2] }, magiepanzer: { ab: [0, 0, 3], mal: [0, 3] },
  /* Nahkampf: Black (Level 10) / Mithril (Level 20) – Langschwert, Dolch, Zweihänder, Streitkolben, Speer */
  eidschwert_gewoehnlich: { a: ["geschick", 10], w: { ticks: 3, reich: 1, geschick: 18, staerke: 16 } }, eidschwert: { a: ["geschick", 20], w: { ticks: 3, reich: 1, geschick: 22, staerke: 22 } },
  eiddolch_gewoehnlich: { a: ["geschick", 10], w: { ticks: 2, reich: 1, geschick: 10, staerke: 6 } }, eiddolch: { a: ["geschick", 20], w: { ticks: 2, reich: 1, geschick: 11, staerke: 11 } },
  eidzweihaender_gewoehnlich: { a: ["staerke", 10], w: { ticks: 4, reich: 1, geschick: 27, staerke: 26 }, zweihand: true }, eidzweihaender: { a: ["staerke", 20], w: { ticks: 4, reich: 1, geschick: 38, staerke: 38 }, zweihand: true },
  sternbrecher_gewoehnlich: { a: ["staerke", 10], w: { ticks: 3, reich: 1, geschick: 13, staerke: 14 } }, sternbrecher: { a: ["staerke", 20], w: { ticks: 3, reich: 1, geschick: 16, staerke: 20 } },
  sterndorn_gewoehnlich: { a: ["geschick", 10], w: { ticks: 4, reich: 1, geschick: 11, staerke: 12 }, ab: [5, 5, 0], zweihand: true }, sterndorn: { a: ["geschick", 20], w: { ticks: 4, reich: 1, geschick: 15, staerke: 17 }, ab: [7, 7, 0], zweihand: true },
  /* Fernkampf: Oak/Willow-Kurzbogen mit Eisen-/Stahlpfeilen, Langbogen, Armbrust mit Bolzen (Black/Mithril) */
  mondkurzbogen_gewoehnlich: { a: ["fernkampf", 10], w: { ticks: 3, reich: 5, fernAngriff: 14, fernStaerke: 16 } }, mondkurzbogen: { a: ["fernkampf", 20], w: { ticks: 3, reich: 5, fernAngriff: 20, fernStaerke: 22 } },
  mondlangbogen_gewoehnlich: { a: ["fernkampf", 10], w: { ticks: 5, reich: 7, fernAngriff: 14, fernStaerke: 20 } }, mondlangbogen: { a: ["fernkampf", 20], w: { ticks: 5, reich: 7, fernAngriff: 20, fernStaerke: 27 } },
  sternarmbrust_gewoehnlich: { a: ["fernkampf", 10], w: { ticks: 6, reich: 6, fernAngriff: 42, fernStaerke: 46 } }, sternarmbrust: { a: ["fernkampf", 20], w: { ticks: 6, reich: 6, fernAngriff: 54, fernStaerke: 64 } },
  /* Magie: Elementarstab; der eingebaute Zauber in der Magie-Stärke – Einfach trifft auf Magie 10 bis 4 (wie Water Strike), Selten auf Magie 20 bis 8 (wie Fire Strike) */
  sternenszepter_gewoehnlich: { a: ["magie", 10], w: { ticks: 5, reich: 6, genau: 10, magieStaerke: 160 } }, sternenszepter: { a: ["magie", 20], w: { ticks: 5, reich: 6, genau: 12, magieStaerke: 176 } },
  /* Schilde und Metallrüstung: Black (Einfach) / Mithril (Selten) */
  sternenschild_gewoehnlich: { a: ["defense", 10], ab: [22, 22, -1], mal: KITE }, sternenschild: { a: ["defense", 20], ab: [25, 25, -1], mal: KITE },
  eisenwachthelm_gewoehnlich: { a: ["defense", 10], ab: [12, 12, -1], mal: HELM }, eisenwacht_gewoehnlich: { a: ["defense", 10], ab: [37, 40, -6], mal: PANZER }, eisenbeinschienen_gewoehnlich: { a: ["defense", 10], ab: [20, 20, -4], mal: BEINE },
  eisenwachthelm: { a: ["defense", 20], ab: [14, 14, -1], mal: HELM }, eisenwacht: { a: ["defense", 20], ab: [43, 44, -6], mal: PANZER }, eisenbeinschienen: { a: ["defense", 20], ab: [22, 22, -4], mal: BEINE },
  /* Jäger: Hartleder (Einfach) / Beschlagenes Leder (Selten) – Fernkampf-Angriff plus, Magie minus */
  jaegerkapuze: { a: ["defense", 10], ab: [6, 4, 4], mal: [2, -1] }, jaegerwams: { a: ["defense", 10], ab: [15, 15, 6], mal: [8, -4] }, jaegerhose: { a: ["defense", 10], ab: [4, 4, 2], mal: [4, -2] },
  jaegerkapuze_selten: { a: ["defense", 20], ab: [8, 8, 4], mal: [4, -1] }, jaegerwams_selten: { a: ["defense", 20], ab: [22, 25, 8], mal: [8, -4] }, jaegerhose_selten: { a: ["defense", 20], ab: [16, 16, 6], mal: [6, -5] },
  /* Magier: Zauberroben (Einfach) / leichte Mystik-Roben (Selten) – Magie-Angriff und Magie-Abwehr */
  magierkapuze: { a: ["defense", 10], ab: [0, 0, 2], mal: [0, 2] }, magierrobe: { a: ["defense", 10], ab: [0, 0, 3], mal: [0, 3] }, magierrock: { a: ["defense", 10], ab: [0, 0, 2], mal: [0, 2] },
  magierkapuze_selten: { a: ["defense", 20], ab: [2, 2, 4], mal: [0, 4] }, magierrobe_selten: { a: ["defense", 20], ab: [6, 6, 12], mal: [0, 12] }, magierrock_selten: { a: ["defense", 20], ab: [4, 4, 8], mal: [0, 8] },
  /* ───── Episch (Level 35) ↔ Adamant · Legendär (Level 45) ↔ Rune · Mythisch (Level 65) ↔ Dragon (Vorgabe 23.11.2026) ─────
     Nahkampf: Langschwert, Dolch, Zweihänder, Streitkolben, Speer. Fernkampf: Ahorn/Eibe/Magie-Bogen mit Adamant-/Runen-/Drachenpfeilen, Adamant-/Runen-/Drachen-Armbrust mit Bolzen.
     Magie: Genauigkeit wie Mystik-/Alter/Kodai-Stäbe; die Zauberstärke steigt nur leicht (die Magie-Formel skaliert schon mit dem Level). Rüstung: Adamant/Rune/Dragon, Grüner/Blauer/Schwarzer Drachenleder-Satz, Mystik/Unendlichkeit/Ahrim. */
  eidschwert_episch: { a: ["geschick", 35], w: { ticks: 3, reich: 1, geschick: 29, staerke: 28 } }, eidschwert_legendaer: { a: ["geschick", 45], w: { ticks: 3, reich: 1, geschick: 38, staerke: 39 } }, eidschwert_mythisch: { a: ["geschick", 65], w: { ticks: 3, reich: 1, geschick: 69, staerke: 71 } },
  eiddolch_episch: { a: ["geschick", 35], w: { ticks: 2, reich: 1, geschick: 15, staerke: 14 } }, eiddolch_legendaer: { a: ["geschick", 45], w: { ticks: 2, reich: 1, geschick: 25, staerke: 24 } }, eiddolch_mythisch: { a: ["geschick", 65], w: { ticks: 2, reich: 1, geschick: 40, staerke: 40 } },
  eidzweihaender_episch: { a: ["staerke", 35], w: { ticks: 4, reich: 1, geschick: 43, staerke: 44 }, zweihand: true }, eidzweihaender_legendaer: { a: ["staerke", 45], w: { ticks: 4, reich: 1, geschick: 69, staerke: 70 }, zweihand: true }, eidzweihaender_mythisch: { a: ["staerke", 65], w: { ticks: 4, reich: 1, geschick: 92, staerke: 93 }, zweihand: true },
  sternbrecher_episch: { a: ["staerke", 35], w: { ticks: 3, reich: 1, geschick: 25, staerke: 23 } }, sternbrecher_legendaer: { a: ["staerke", 45], w: { ticks: 3, reich: 1, geschick: 36, staerke: 39 } }, sternbrecher_mythisch: { a: ["staerke", 65], w: { ticks: 3, reich: 1, geschick: 60, staerke: 55 } },
  sterndorn_episch: { a: ["geschick", 35], w: { ticks: 4, reich: 1, geschick: 23, staerke: 24 }, ab: [9, 9, 0], zweihand: true }, sterndorn_legendaer: { a: ["geschick", 45], w: { ticks: 4, reich: 1, geschick: 36, staerke: 42 }, ab: [12, 12, 0], zweihand: true }, sterndorn_mythisch: { a: ["geschick", 65], w: { ticks: 4, reich: 1, geschick: 55, staerke: 60 }, ab: [15, 15, 0], zweihand: true },
  mondkurzbogen_episch: { a: ["fernkampf", 35], w: { ticks: 3, reich: 5, fernAngriff: 29, fernStaerke: 31 } }, mondkurzbogen_legendaer: { a: ["fernkampf", 45], w: { ticks: 3, reich: 5, fernAngriff: 47, fernStaerke: 49 } }, mondkurzbogen_mythisch: { a: ["fernkampf", 65], w: { ticks: 3, reich: 5, fernAngriff: 69, fernStaerke: 60 } },
  mondlangbogen_episch: { a: ["fernkampf", 35], w: { ticks: 5, reich: 7, fernAngriff: 31, fernStaerke: 38 } }, mondlangbogen_legendaer: { a: ["fernkampf", 45], w: { ticks: 5, reich: 7, fernAngriff: 49, fernStaerke: 60 } }, mondlangbogen_mythisch: { a: ["fernkampf", 65], w: { ticks: 5, reich: 7, fernAngriff: 69, fernStaerke: 73 } },
  sternarmbrust_episch: { a: ["fernkampf", 35], w: { ticks: 6, reich: 6, fernAngriff: 55, fernStaerke: 82 } }, sternarmbrust_legendaer: { a: ["fernkampf", 45], w: { ticks: 6, reich: 6, fernAngriff: 90, fernStaerke: 100 } }, sternarmbrust_mythisch: { a: ["fernkampf", 65], w: { ticks: 6, reich: 6, fernAngriff: 94, fernStaerke: 122 } },
  sternenszepter_episch: { a: ["magie", 35], w: { ticks: 5, reich: 6, genau: 15, magieStaerke: 184 } }, sternenszepter_legendaer: { a: ["magie", 45], w: { ticks: 5, reich: 6, genau: 20, magieStaerke: 192 } }, sternenszepter_mythisch: { a: ["magie", 65], w: { ticks: 5, reich: 6, genau: 25, magieStaerke: 208 } },
  sternenschild_episch: { a: ["defense", 35], ab: [32, 32, -1], mal: KITE }, sternenschild_legendaer: { a: ["defense", 45], ab: [46, 46, -1], mal: KITE }, sternenschild_mythisch: { a: ["defense", 65], ab: [59, 60, 0], mal: KITE },
  eisenwachthelm_episch: { a: ["defense", 35], ab: [19, 19, -1], mal: HELM }, eisenwacht_episch: { a: ["defense", 35], ab: [61, 63, -6], mal: PANZER }, eisenbeinschienen_episch: { a: ["defense", 35], ab: [31, 31, -4], mal: BEINE },
  eisenwachthelm_legendaer: { a: ["defense", 45], ab: [30, 30, -1], mal: HELM }, eisenwacht_legendaer: { a: ["defense", 45], ab: [78, 80, -6], mal: PANZER }, eisenbeinschienen_legendaer: { a: ["defense", 45], ab: [49, 49, -4], mal: BEINE },
  eisenwachthelm_mythisch: { a: ["defense", 65], ab: [45, 46, -1], mal: HELM }, eisenwacht_mythisch: { a: ["defense", 65], ab: [104, 106, -6], mal: PANZER }, eisenbeinschienen_mythisch: { a: ["defense", 65], ab: [66, 66, -4], mal: BEINE },
  jaegerkapuze_episch: { a: ["defense", 35], ab: [4, 4, 4], mal: [4, -1] }, jaegerwams_episch: { a: ["defense", 35], ab: [23, 20, 20], mal: [15, -15] }, jaegerhose_episch: { a: ["defense", 35], ab: [10, 8, 8], mal: [8, -10] },
  jaegerkapuze_legendaer: { a: ["defense", 45], ab: [7, 7, 6], mal: [6, -1] }, jaegerwams_legendaer: { a: ["defense", 45], ab: [40, 40, 40], mal: [20, -15] }, jaegerhose_legendaer: { a: ["defense", 45], ab: [16, 16, 14], mal: [11, -10] },
  jaegerkapuze_mythisch: { a: ["defense", 65], ab: [12, 12, 10], mal: [10, -1] }, jaegerwams_mythisch: { a: ["defense", 65], ab: [54, 55, 50], mal: [30, -15] }, jaegerhose_mythisch: { a: ["defense", 65], ab: [25, 27, 24], mal: [17, -10] },
  magierkapuze_episch: { a: ["defense", 35], ab: [0, 0, 4], mal: [0, 4] }, magierrobe_episch: { a: ["defense", 35], ab: [0, 0, 20], mal: [0, 20] }, magierrock_episch: { a: ["defense", 35], ab: [0, 0, 15], mal: [0, 15] },
  magierkapuze_legendaer: { a: ["defense", 45], ab: [6, 6, 6], mal: [0, 6] }, magierrobe_legendaer: { a: ["defense", 45], ab: [10, 10, 22], mal: [0, 22] }, magierrock_legendaer: { a: ["defense", 45], ab: [8, 8, 17], mal: [0, 17] },
  magierkapuze_mythisch: { a: ["defense", 65], ab: [15, 15, 6], mal: [0, 6] }, magierrobe_mythisch: { a: ["defense", 65], ab: [50, 50, 30], mal: [0, 30] }, magierrock_mythisch: { a: ["defense", 65], ab: [33, 33, 22], mal: [0, 22] },
};
for (const [id, b] of Object.entries(BALANCING)) { const G = GEGENSTAENDE[id]; if (!G) continue;
  if (b.a) G.anforderung = { skill: b.a[0], level: b.a[1] }; if (b.w && G.waffe) G.waffe = { ...G.waffe, ...b.w }; if (b.ab) G.abwehr = { nah: b.ab[0], fern: b.ab[1], magie: b.ab[2] }; if (b.zweihand) G.zweihand = true;
  if (b.mal) G.bonus = { ...G.bonus, ...(b.mal[0] ? { fernAngriff: b.mal[0] } : {}), ...(b.mal[1] ? { genau: b.mal[1] } : {}) }; }
/* Bögen (Kurz-, Lang-, Jagdbogen …) brauchen beide Hände: kein Schild dazu – beim Anlegen geht die Nebenhand in den Rucksack (25.11.2026) */
for (const G of Object.values(GEGENSTAENDE)) if (G.platz === "waffe" && /bogen/i.test(G.art || "") && !/armbrust/i.test(G.art || "")) G.zweihand = true;
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
/* ---------- Rohstoffe (Beute, Sammeln) ----------
 * Noch nicht im Rucksack und noch ohne Beute-Tabelle: was ein Gegner fallen lässt, entscheidet der Spielserver (shared/sim.ts).
 * modell: liegt am Boden (img/objekte3d), ohne Animation. */
export interface Rohstoff { id: string; name: string; art: string; seltenheit: Seltenheit; stapelbar: boolean; modell: string; quelle: string; werte: [string, string][]; text: string }
export const ROHSTOFFE: Record<string, Rohstoff> = {
  kuhhaut: { id: "kuhhaut", name: "Kuhhaut", art: "Rohstoff", seltenheit: "gewoehnlich", stapelbar: true, modell: "img/objekte3d/kuhhaut.glb", quelle: "Beute der Kuh",
    werte: [["Verwendung", "Handwerk (Leder)"], ["Stapelbar", "ja"]],
    text: "Ein Fell mit kastanienbraunen Flecken, noch ungegerbt. Beim Gerber wird daraus Leder." },
};
/** Wie viel ein Trank heilt, bei diesem maximalen Leben (gerundet) */
export const trankHeilung = (v: Verbrauch, maxLp: number) => Math.round(v.heilt.fest + v.heilt.anteil * maxLp);
/** Wie viel ein Trank bei diesem Leben tatsächlich heilt: nie über das maximale Leben hinaus (kein Überheilen) */
export const trankHeilungBei = (v: Verbrauch, lp: number, maxLp: number) => Math.max(0, Math.min(trankHeilung(v, maxLp), maxLp - lp));
