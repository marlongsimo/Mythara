/*
 * Riftmere – die Einsteiger-Insel „Ankerholm“ (#190, Ausgabe 2, doku/konzepte/einsteiger-insel.md): Quest „Gestrandet auf Ankerholm“, Daten für den Quest-Baukasten (shared/questbau.ts).
 * Die Auswanderer-Seeschwalbe läuft im Splittersturm vor Ankerholm auf Grund. Man flickt sie (Mast, Beschläge, Proviant), lernt bei Hauke Morn kämpfen,
 * vertreibt die Plünderer des „Schwarzen Ole“, wählt seinen Weg und legt mit Telse ab (Abschluss auf der Insel). Nach einem Bildwechsel steht man in der Waldmark,
 * ohne Begrüßung – Quest 1 spricht einen an wie heute (KANON d484b2d46, #191).
 * Acht Abschnitte (der achte ist der Abschluss bei Telse; im Questlog je ein Satz, Gruppen), etwa 12 Minuten. Jeder Abschnitt erklärt die Bedienung in einem Satz (HILFE, für die Oberfläche).
 * ENTWURF (shared/quest_entwuerfe.ts), bis die Insel steht: Welt (Insel, Steg der Waldmark), Figuren, Systeme (Start auf der Insel, Übungspuppen, Überfahrt nach dem Abschluss),
 * Integration (Kiefer und Kiefernstamm, Schiffsbeschläge, Plünderer und Schwarzer Ole). Die Stellen unten sind PLATZHALTER, bis Welt die Insel baut.
 */
import type { QuestDef, Bed, QuestFigur, Geben } from "./questbau";

type Feld = [number, number];
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const L = (offen: string[], erledigt: string[] = []): Bed => ({ ...LAEUFT, offen, erledigt });

/* ───── Stellen: PLATZHALTER (Insel etwa 120 × 90 Felder, linke obere Ecke AX | AY) – Welt ersetzt sie durch die gebauten ───── */
const AX = 100, AY = 100, A = (dx: number, dy: number): Feld => [AX + dx, AY + dy];
export const ANKERHOLM = {
  wrack: A(60, 84), feuer: A(66, 80), kochplatz: A(72, 80), steg: A(80, 86),   /* Südstrand */
  hain: A(58, 46),                                                              /* Kiefernhain in der Mitte */
  adern: A(100, 48), schmiede: A(106, 44),                                      /* Felsen im Osten: Kupferadern, Behelfsschmiede (Ofen, Amboss) */
  leuchtfeuer: A(60, 10), puppen: A(66, 14),                                    /* Nordspitze: Leuchtfeuer der Wacht, Übungsplatz */
  bucht: A(22, 14),                                                             /* Bucht der Plünderer */
};
const O = ANKERHOLM;

/* ───── Figuren ───── */
const TELSE: QuestFigur = { id: "telse", name: "Kapitänin Telse Brack", modell: "npc.hafen_frau", x: O.feuer[0] - 1.5, y: O.feuer[1], blick: [1, 0] };
const ARVID: QuestFigur = { id: "arvid", name: "Arvid Thorn", modell: "npc.schmied", x: O.schmiede[0], y: O.schmiede[1] + 1.5, blick: [0, 1] };
const MERLE: QuestFigur = { id: "merle", name: "Merle Haff", modell: "npc.moewen_fischerin", x: O.kochplatz[0], y: O.kochplatz[1] - 1.5, blick: [0, 1] };
const HAUKE: QuestFigur = { id: "hauke", name: "Hauke Morn", modell: "npc.passwaechter", x: O.leuchtfeuer[0] + 2, y: O.leuchtfeuer[1] + 2, blick: [0, 1] };

/* ───── Gegenstände ───── */
const G = (g: string, name: string): Geben => ({ g, name, fehlt: true });
/** n Würmer als Köder (der Motor gibt je Eintrag einen) */
const WUERMER = (n: number): Geben[] => Array.from({ length: n }, () => ({ g: "wurm", name: "ein Wurm" }));
const UEBUNG = [{ g: "ritterschwert" }, { g: "rundschild" }, { g: "jagdbogen" }, { g: "hirtenstab" }];   /* Haukes Leihwaffen, er nimmt sie vor der Wahl zurück */
const WEGE = {
  nah: { text: "der Weg des Schwerts", saetze: [G("ritterschwert", "Trainingsschwert"), G("rundschild", "Trainingsschild"), G("lederpanzer", "Trainings-Lederpanzer")] },
  fern: { text: "der Weg des Bogens", saetze: [G("jagdbogen", "Trainingsbogen"), G("lederpanzer", "Trainings-Lederpanzer")] },
  magie: { text: "der Weg des Stabs", saetze: [G("hirtenstab", "Trainingsstab"), G("magiepanzer", "Trainingsrobe")] },
};

export const ANKERHOLM_QUEST = "ankerholm_gestrandet";

/** Ein Satz Bedienung je Abschnitt (Gruppe): am Rechner / am Handy. Die Oberfläche zeigt ihn unter dem Zielpfeil (#190). */
export const ANKERHOLM_HILFE: Record<string, { pc: string; handy: string }> = {
  gestrandet: { pc: "Klick auf den Boden, um dorthin zu laufen. Ziehe mit der rechten Maustaste, um die Kamera zu drehen. Klick eine Figur an, um mit ihr zu sprechen.",
    handy: "Tippe auf den Boden, um dorthin zu laufen. Wische mit zwei Fingern, um die Kamera zu drehen. Tippe eine Figur an, um mit ihr zu sprechen." },
  mast: { pc: "Klick einen Baum an, um ihn mit dem Holzbeil zu fällen. Die Stämme landen in deinem Rucksack.", handy: "Tippe einen Baum an, um ihn mit dem Holzbeil zu fällen. Die Stämme landen in deinem Rucksack." },
  beschlaege: { pc: "Klick eine Erzader an, um sie abzubauen. Am Ofen schmilzt du Erz zu Barren, am Amboss schmiedest du daraus. Wähle dort im Fenster, was du herstellen willst.",
    handy: "Tippe eine Erzader an, um sie abzubauen. Am Ofen schmilzt du Erz zu Barren, am Amboss schmiedest du daraus. Wähle dort im Fenster, was du herstellen willst." },
  proviant: { pc: "Klick die Fischstelle am Steg an, um zu angeln. Am Feuer brätst du den Fang. Essen heilt: Klick dazu den Fisch im Rucksack an.",
    handy: "Tippe die Fischstelle am Steg an, um zu angeln. Am Feuer brätst du den Fang. Essen heilt: Tippe dazu den Fisch im Rucksack an." },
  lehre: { pc: "Leg eine Waffe an, indem du sie im Rucksack anklickst. Dann klick eine Übungspuppe an. Jede Puppe zeigt mit ihrer Farbe, welche Kampfart sie spürt.",
    handy: "Leg eine Waffe an, indem du sie im Rucksack antippst. Dann tippe eine Übungspuppe an. Jede Puppe zeigt mit ihrer Farbe, welche Kampfart sie spürt." },
  pluenderer: { pc: "Klick einen Gegner an, um ihn anzugreifen. Leuchtet der Boden rot, geh aus dem Kreis. Klick Beute am Boden an, um sie aufzuheben.",
    handy: "Tippe einen Gegner an, um ihn anzugreifen. Leuchtet der Boden rot, lauf aus dem Kreis. Tippe Beute am Boden an, um sie aufzuheben." },
  wahl: { pc: "Leg Haukes Übungswaffen ab (im Fenster der Ausrüstung anklicken), dann gib sie ihm zurück und wähle deinen Weg.",
    handy: "Leg Haukes Übungswaffen ab (im Fenster der Ausrüstung antippen), dann gib sie ihm zurück und wähle deinen Weg." },
  ablegen: { pc: "Sprich mit Telse, wenn du bereit bist. Sie bringt dich in die Waldmark; nach Ankerholm kommst du nicht zurück.", handy: "Sprich mit Telse, wenn du bereit bist. Sie bringt dich in die Waldmark; nach Ankerholm kommst du nicht zurück." },
};

/* Telse: rau, knapp, Seemannsflüche ohne Fluchworte, im Grunde fürsorglich. Arvid: ruhig, spricht über Werkstücke wie über Menschen.
 * Merle: fröhlich, redet beim Arbeiten, Küstenkind. Hauke: alt, langsam, einsam, freut sich über Gesellschaft, mehr als er zeigt. */
export const QUEST_ANKERHOLM: QuestDef = {
  id: ANKERHOLM_QUEST, titel: "Gestrandet auf Ankerholm", ort: "Ankerholm · Waldmark", start: "Sprich mit Kapitänin Telse Brack am Feuer der Mannschaft.",
  logNeu: "Du erwachst im nassen Sand. Hinter dir liegt die Seeschwalbe schief auf dem Riff, der Mast gebrochen.",
  logAngeboten: "Kapitänin Telse Brack sitzt am Feuer der Mannschaft.",
  logAbgabe: "Die Seeschwalbe ist geflickt. Bring Telse die Beschläge und leg mit ihr ab: Sie bringt dich in die Waldmark.",
  logFertig: "Ankerholm liegt hinter dir. Die Seeschwalbe hat dich in die Waldmark gebracht, um die Splitterlande zu erkunden.",
  geber: "telse",
  figuren: [TELSE, ARVID, MERLE, HAUKE],
  schritte: [
    /* 1. Gestrandet */
    { id: "telse", text: "Telse am Feuer der Mannschaft finden", ereignis: { art: "antwort" }, gruppe: "gestrandet", bei: "telse", wo: "telse",
      log: "Die Seeschwalbe ist auf Grund gelaufen. Lauf zum Feuer der Mannschaft am Strand und sprich mit Kapitänin Telse Brack." },
    /* 2. Ein neuer Mast */
    { id: "kiefern", text: "Drei Kiefernstämme fällen", ereignis: { art: "sammeln", ziel: "kiefer" }, anzahl: 3, nach: ["telse"], gruppe: "mast", wo: O.hain,
      log: "Telse braucht einen neuen Mast. Fäll im Kiefernhain drei Kiefern ({n:kiefern})." },
    { id: "mast", text: "Die Stämme zum Wrack bringen", ereignis: { art: "antwort" }, nach: ["kiefern"], gruppe: "mast", bei: "telse", wo: "telse",
      log: "Bring Telse die drei Kiefernstämme." },
    /* 3. Beschläge */
    { id: "erz", text: "Zwei Kupfererz abbauen", ereignis: { art: "sammeln", ziel: "kupfer" }, anzahl: 2, nach: ["mast"], gruppe: "beschlaege", bei: "arvid", wo: O.adern,
      log: "Für den Mast braucht es Beschläge. Hol dir bei Arvid Thorn in der Schmiede im Osten eine Spitzhacke und bau an den Kupferadern zwei Kupfererz ab ({n:erz})." },
    { id: "barren", text: "Einen Kupferbarren schmelzen", ereignis: { art: "herstellen", rezept: "barren_kupfer" }, nach: ["erz"], gruppe: "beschlaege", wo: O.schmiede,
      log: "Schmilz am Ofen einen Kupferbarren. Als Brennholz nimmst du Arvids Treibholz." },
    { id: "beschlaege", text: "Schiffsbeschläge schmieden", ereignis: { art: "herstellen", rezept: "schiffsbeschlaege" }, nach: ["barren"], gruppe: "beschlaege", wo: O.schmiede,
      log: "Schmiede am Amboss die Schiffsbeschläge." },
    /* 4. Proviant */
    { id: "fische", text: "Zwei Bachlinge fangen", ereignis: { art: "sammeln", ziel: "bachling" }, anzahl: 2, nach: ["beschlaege"], gruppe: "proviant", bei: "merle", wo: O.steg,
      log: "Die Mannschaft hat Hunger. Hol dir bei Merle Haff am Kochplatz eine Angel und fang am Steg zwei Bachlinge ({n:fische})." },
    { id: "braten", text: "Zwei Bachlinge braten", ereignis: { art: "herstellen", rezept: "fisch_bachling_gebraten" }, anzahl: 2, nach: ["fische"], gruppe: "proviant", wo: O.feuer,
      log: "Brat die Bachlinge am Feuer der Mannschaft ({n:braten})." },
    { id: "kosten", text: "Merle kosten lassen", ereignis: { art: "antwort" }, nach: ["braten"], gruppe: "proviant", bei: "merle", wo: "merle",
      log: "Lass Merle einen gebratenen Bachling kosten. Den anderen behältst du – Essen heilt." },
    /* 5. Haukes Lehre */
    { id: "puppe_nah", text: "Die rote Puppe mit dem Schwert treffen", ereignis: { art: "treffen", ziel: "puppe_nah", waffe: "nah" }, nach: ["kosten"], gruppe: "lehre", bei: "hauke", wo: O.puppen,
      log: "Am alten Leuchtfeuer im Norden lebt Hauke Morn. Hol dir bei ihm Übungswaffen, leg das Trainingsschwert an und triff die rote Puppe." },
    { id: "puppe_fern", text: "Die grüne Puppe mit dem Bogen treffen", ereignis: { art: "treffen", ziel: "puppe_fern", waffe: "fern" }, nach: ["puppe_nah"], gruppe: "lehre", wo: O.puppen,
      log: "Leg den Trainingsbogen an und triff die grüne Puppe." },
    { id: "puppe_magie", text: "Die blaue Puppe mit dem Stab treffen", ereignis: { art: "treffen", ziel: "puppe_magie", waffe: "magie" }, nach: ["puppe_fern"], gruppe: "lehre", wo: O.puppen,
      log: "Leg den Trainingsstab an und triff die blaue Puppe." },
    /* 6. Die Plünderer */
    { id: "pluenderer", text: "Drei Plünderer vertreiben", ereignis: { art: "erlegen", typ: "pluenderer" }, anzahl: 3, nach: ["puppe_magie"], gruppe: "pluenderer", wo: O.bucht,
      log: "Die Splitter des Sturms locken Plünderer an. Vertreib in der Bucht im Nordwesten drei von ihnen ({n:pluenderer})." },
    { id: "ole", text: "Den Schwarzen Ole besiegen", ereignis: { art: "erlegen", typ: "schwarzer_ole" }, nach: ["pluenderer"], gruppe: "pluenderer", wo: O.bucht,
      log: "Ihr Anführer, der Schwarze Ole, stellt sich dir. Wenn der Boden um ihn rot leuchtet, geh aus dem Kreis!" },
    /* 7. Die Wahl */
    { id: "wahl", text: "Bei Hauke den eigenen Weg wählen", ereignis: { art: "antwort" }, nach: ["ole"], gruppe: "wahl", bei: "hauke", wo: "hauke",
      log: "Leg Haukes Übungswaffen ab, gib sie ihm zurück und wähle deinen Weg: Schwert, Bogen oder Stab." },
  ],
  dialoge: {
    telse: {
      reden: [
        { wenn: NEU, zeilen: ["Telse zieht dich aus dem Wind ans Feuer. „Da bist du ja. Hab dich schon bei den Fischen gesehen.“",
          "Willkommen auf Ankerholm. Ein Stein mit einem Leuchtturm, mitten im Meer. Und wir sitzen drauf, mit einem Schiff ohne Mast."], antworten: ["annehmen"] },
        { wenn: L(["telse"]), zeilen: ["Gut, du stehst. Das ist mehr, als ich vom Mast sagen kann."], antworten: ["telse_auftrag"] },
        { wenn: L(["mast"], ["kiefern"]), zeilen: ["Riecht nach Harz. Du warst im Hain."], antworten: ["staemme", "tschuess"] },
        { wenn: L(["kiefern"]), zeilen: ["Drei Kiefern aus dem Hain, gerade gewachsen. Mehr brauch ich nicht. Erstmal."], antworten: ["beil_neu", "tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Der Mast steht, die Leute sind satt. Und du siehst aus, als wüsstest du jetzt, wohin.",
          "Gib mir die Beschläge, dann legen wir ab. Wir bringen dich zum Festland, in die Waldmark. Dort fangen alle an, die neu in die Splitterlande kommen. Von da an gehört die Welt dir: erkunde sie."], antworten: ["ablegen", "noch_nicht"] },
        { wenn: L(["wahl"], ["mast"]), zeilen: ["Arvid sagt, ohne Beschläge hält mir der Mast keine halbe Stunde. Hilf ihm. Und dann hilf, wem du sonst begegnest. So geht das auf See."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Na, Landratte? Ist das Festland so, wie du dachtest?"], antworten: ["tschuess"] },
        { zeilen: ["Was ist?"], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Was ist passiert?", folge: [{ f: { start: true, erledige: ["telse"], geben: [G("holzbeil_training", "Trainings-Holzbeil")],
          zeilen: ["Ein Splittersturm. Blaues Licht vom Himmel, wie Hagel. Hat den Mast in zwei Stücke gehauen, und das Riff hat den Rest gemacht.",
            "Keiner tot. Das ist was. Aber ohne Mast kommen wir hier nicht weg.", "Hier, ein Holzbeil. Im Hain stehen Kiefern. Fäll mir drei, gerade gewachsen, und bring sie her."] } }] },
        { id: "telse_auftrag", text: "Was soll ich tun?", folge: [{ f: { erledige: ["telse"], geben: [G("holzbeil_training", "Trainings-Holzbeil")],
          zeilen: ["Ein neuer Mast. Hier, ein Holzbeil. Im Hain stehen Kiefern. Fäll mir drei und bring sie her."] } }] },
        { id: "beil_neu", text: "Ich habe kein Holzbeil mehr.", folge: [{ f: { geben: [G("holzbeil_training", "Trainings-Holzbeil")], zeilen: ["Hier ist noch eins. Halt es fest, das hier ist kein Laden."],
          nichtsZuGeben: ["Du hast doch eins. Sieh in deinen Rucksack."] } }] },
        { id: "staemme", text: "Hier sind drei Kiefernstämme.", folge: [{ f: { erledige: ["mast"], nehmen: [{ g: "stamm_kiefer", n: 3 }],
          zeilen: ["Telse wiegt einen Stamm in der Hand. „Gut. Gerade und zäh.“", "Aber ein Mast ohne Beschläge ist ein Baum mit Ehrgeiz. Arvid hat in den Felsen im Osten eine Schmiede gebaut. Geh ihm zur Hand."] } }] },
        { id: "ablegen", text: "Hier sind die Beschläge. Ich bin bereit, legen wir ab.", folge: [{ f: { abschluss: true, nehmen: [{ g: "schiffsbeschlaege" }],
          zeilen: ["Telse schlägt die Beschläge selbst an den Mast. „Alle Mann an Bord! Wir segeln!“",
            "Die Seeschwalbe gleitet vom Riff. Ankerholm wird klein, dann ist es nur noch ein Licht hinter euch.",
            "„Wir legen an der Küste an. Von dort bringt dich ein Fuhrwerk in die Waldmark. Sieh dich um, hilf, wo du kannst – die Splitterlande warten auf dich.“"] } }] },
        { id: "noch_nicht", text: "Noch nicht.", folge: [{ f: { zeilen: ["Dann beeil dich. Der Wind wartet nicht ewig."] } }] },
        { id: "tschuess", text: "Bis später.", folge: [{ f: { zeilen: ["Mhm."] } }] },
      ],
    },
    arvid: {
      reden: [
        { wenn: L(["erz"], ["mast"]), zeilen: ["Arvid sieht nicht auf. Er feilt an einer Schiene, die schon glatt ist.", "Telse schickt dich? Dann brauchen wir Beschläge. Kupfer. Hier wächst es aus dem Fels."], antworten: ["arvid_auftrag", "tschuess"] },
        { wenn: L(["beschlaege"], ["mast"]), zeilen: ["Das Kupfer ist weich. Man muss es nicht zwingen. Nur überreden."], antworten: ["arvid_auftrag", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["beschlaege"] }, zeilen: ["Ordentliche Arbeit. Telse wird es nicht sagen. Aber sie wird es merken."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Der Mast hält. Ich hab nachgesehen. Zweimal."], antworten: ["tschuess"] },
        { zeilen: ["Arvid hämmert. Er hört dich nicht."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "arvid_auftrag", text: "Wie mache ich Beschläge?", folge: [{ f: { geben: [G("spitzhacke_training", "Trainings-Spitzhacke"), { ...G("stamm_eiche", "Treibholz (Eichenstamm)"), gleich: "^stamm_" }],
          nichtsZuGeben: ["Du hast alles, was du brauchst. Erz von den grünen Adern, ein Scheit in den Ofen, dann auf den Amboss."],
          zeilen: ["Erst das Erz. Zwei Brocken von den grünen Adern da drüben. Dann in den Ofen damit, mit einem Scheit Treibholz. Daraus wird ein Barren.",
            "Den Barren auf den Amboss. Dann hämmerst du ihn zu Beschlägen. Ich zeig's dir nicht, du siehst es ja."] } }] },
        { id: "tschuess", text: "Bis später.", folge: [{ f: { zeilen: ["Mhm."] } }] },
      ],
    },
    merle: {
      reden: [
        { wenn: L(["fische"], ["beschlaege"]), zeilen: ["Merle winkt mit einem Holzlöffel. „Du! Ja, du! Hast du Hunger? Ich auch. Alle haben Hunger. Und ich hab nichts im Topf.“"], antworten: ["merle_auftrag", "tschuess"] },
        { wenn: L(["kosten"], ["braten"]), zeilen: ["Das riecht ja! Gib her, gib her. Ich muss doch probieren, ob's taugt."], antworten: ["kosten", "tschuess"] },
        { wenn: L(["braten"], ["fische"]), zeilen: ["Fisch beißt am liebsten früh. Oder spät. Oder dann, wenn du nicht hinsiehst."], antworten: ["merle_auftrag", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["kosten"] }, zeilen: ["Hast du Hauke schon getroffen? Der alte Mann am Leuchtfeuer? Er hat mir gewinkt. Ich glaub, er ist einsam."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Iss was! Du bist ganz blass."], antworten: ["tschuess"] },
        { zeilen: ["Merle summt und rührt in einem leeren Topf."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "merle_auftrag", text: "Was brauchst du? (Angel und Würmer)", folge: [{ f: { geben: [G("angelrute", "Angelrute"), ...WUERMER(5)],
          zeilen: ["Fisch! Am Steg beißen Bachlinge. Hier, meine alte Angel, und Würmer. Zwei Fische, dann brätst du sie am Feuer.",
            "Und wenn einer schwarz wird: macht nichts, fang einen neuen. Das Meer ist voll."] } }] },
        { id: "kosten", text: "Hier, probier.", folge: [{ f: { erledige: ["kosten"], nehmen: [{ g: "fisch_bachling_gebraten" }],
          zeilen: ["Merle beißt ab, kaut, schließt die Augen.", "Gut! Salz fehlt. Aber gut! Den anderen behältst du. Wenn du verletzt bist, iss ihn. Essen heilt.",
            "Ach, und: Ich hab Licht am alten Leuchtfeuer gesehen. Oben im Norden. Da wohnt noch jemand."] } }] },
        { id: "tschuess", text: "Bis später.", folge: [{ f: { zeilen: ["Bis gleich!"] } }] },
      ],
    },
    hauke: {
      reden: [
        { wenn: L(["puppe_nah"], ["kosten"]), zeilen: ["Ein alter Mann in einem Mantel der Wacht stützt sich auf einen Stock. „Besuch. Nach sieben Wintern. Und dann gleich ein ganzes Schiff.“",
          "Hauke Morn, Wacht von Ankerholm. Das Feuer hier hab ich am Brennen gehalten, damit keiner auf die Riffe läuft. Ihr seid trotzdem draufgelaufen."], antworten: ["hauke_auftrag", "tschuess"] },
        { wenn: L(["puppe_magie"], ["puppe_nah"]), zeilen: ["Drei Puppen, drei Wege. Rot für das Schwert, grün für den Bogen, blau für den Stab. Jede spürt nur ihre Art."], antworten: ["hauke_auftrag", "tschuess"] },
        { wenn: L(["ole"], ["puppe_magie"]), zeilen: ["Hörst du das? Rufe in der Bucht. Die Plünderer. Der Sturm hat Splitter auf die Insel geworfen, und die wollen sie haben.",
          "Ihr Anführer heißt Ole. Der Schwarze Ole. Er schlägt um sich, wenn man ihm zu nahe kommt. Dann tritt zurück."], antworten: ["tschuess"] },
        { wenn: L(["wahl"], ["ole"]), zeilen: ["Der Schwarze Ole kommt nicht wieder. Das hab ich lange nicht gesehen.", "Du hast alle drei Wege versucht. Jetzt such dir einen aus. Gib mir meine Übungswaffen zurück, dann bekommst du deine eigenen."],
          antworten: ["weg_nah", "weg_fern", "weg_magie", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["wahl"] }, zeilen: ["Geh zur Seeschwalbe. Und grüß das Festland von mir. Vielleicht komm ich irgendwann nach."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Das Feuer brennt noch."], antworten: ["tschuess"] },
        { zeilen: ["Hauke schaut aufs Meer."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "hauke_auftrag", text: "Kannst du mir zeigen, wie man kämpft?", folge: [{ f: { nichtsZuGeben: ["Du hast alles. Rot, grün, blau. Schwert, Bogen, Stab."],
          geben: [G("ritterschwert", "Trainingsschwert"), G("rundschild", "Trainingsschild"), G("jagdbogen", "Trainingsbogen"), G("hirtenstab", "Trainingsstab")],
          zeilen: ["Kämpfen? Hm. Die Splitterlande sind kein Ort für Leute, die es nicht können.",
            "Hier. Schwert und Schild, ein Bogen, ein Stab. Alles geliehen. Drüben auf dem Platz stehen drei Puppen: Erst das Schwert an die rote, dann der Bogen an die grüne, dann der Stab an die blaue."] } }] },
        ...(["nah", "fern", "magie"] as const).map((w) => ({ id: "weg_" + w, text: `Ich wähle ${WEGE[w].text}. (${WEGE[w].saetze.map((x) => x.name).join(", ")})`,
          folge: [{ f: { erledige: ["wahl"], nehmen: UEBUNG, geben: WEGE[w].saetze.map((x) => ({ g: x.g, name: x.name })),
            zeilen: [`Hauke nimmt die Übungswaffen zurück und legt dir dafür ${w === "nah" ? "ein Schwert, einen Schild und einen Lederpanzer" : w === "fern" ? "einen Bogen und einen Lederpanzer" : "einen Stab und eine Robe"} hin.`,
              w === "nah" ? "Das Schwert also. Wer vorne steht, schützt die anderen. Vergiss das nicht." : w === "fern" ? "Der Bogen. Wer weit sieht, sieht die Gefahr zuerst. Halte Abstand, und halte Ruhe."
                : "Der Stab. Die Splitter singen für die, die zuhören. Hör gut zu.",
              "Die anderen Wege laufen dir nicht weg. Im Festland verkaufen sie solche Sachen für ein paar Splitter. Jetzt geh. Die Seeschwalbe wartet."] } }] })),
        { id: "tschuess", text: "Bis später.", folge: [{ f: { zeilen: ["Geh mit dem Wind."] } }] },
      ],
    },
  },
  glueckwunsch: "Gute Fahrt! Die Waldmark wartet – und mit ihr die ganzen Splitterlande.",
  belohnungText: "Belohnung: kleine XP in allen gelernten Berufen und Kampfarten, 50 Splitter",
  belohnung: { xp: { staerke: 100, defense: 100, fernkampf: 100, magie: 100 }, berufe: { holzfaellerei: 100, bergbau: 100, schmieden: 100, fischen: 100, kochen: 100 }, splitter: 50 },
  punkte: 1,
};
