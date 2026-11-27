/*
 * Riftmere – kleine Stadt-Quests der Hauptstadt Kielmund (#174), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/kielmund-quests.md (Konzept-Chat, vom Nutzer abgesegnet 27.11.). Stellen aus Welts Bau (welt/kielmund_orte.json, 7a15f662;
 * welt/regionen/fl_186_225: Werft 6379 | 7321, Kai 6385 | 7310, Haus der Küstenhäuser 6414 | 7297, Tempel 6474 | 7276, Mole 6373–6351 | 7337).
 * Alle vier nach G1 „Die Südstraße“ (man ist in Kielmund angekommen). Namen (Vorschlag Quests): Hafenmeisterin Ilka Brandt, Werftmeister Okko Spant, Ratsherr Edzard Wellmann;
 * die Priesterin heißt schon Schwester Maren (laeden.ts).
 *  1. „Lichter im Nebel“ (Schmuggler): Kisten ohne Siegel am Kai · QUER Wiebke Strand am Leuchtfeuer · drei falsche Lichtzeichen an der Küste · zwei Strandräuber am Wrack · Liste der Hehler · Ende bei Jasper Kranich.
 *  2. „Kiel auf Stapel“ (Werft): Segeltuch an der Werkbank (Handwerk), Eisenbarren für die Beschläge an der Esse (Schmieden) · QUER Hofwächter Jost am Holzfällerhof in Erlengrund schickt Eichenstämme · Stapellauf.
 *  3. „Suppe für die Altstadt“ (Tempel): Mühlbarsche vom Fischmarkt · Heringe am Kai fangen · QUER Bente Möller in der Möwenbucht (Garn für ihre Netze, sie schickt Heringe) ·
 *     Fischsuppe am Kessel, Räucherheringe in der Räucherhütte · Speisung vor dem Tempel.
 *  4. „Der Brief des Ratsherrn“ (Botengang): eine versiegelte Nachricht durch alle vier Viertel, jeder gibt etwas mit.
 * Keine neuen Gegenstände (Segeltuch = stoff_hanf, Eisenbarren, Eichenstamm, Fischsuppe, Räucherhering gibt es; die Rezepte für Planken und Tau sind an C1/B2 gebunden).
 * Das Leuchtfeuer bleibt bei G2 (keine Wiederholung).
 */
import type { QuestDef, Bed, QuestFigur, Voraussetzung, Option, Rede } from "./questbau";
import { KIELMUND, LEUCHTTURM, MOEWENBUCHT, WRACK } from "./quest_g_orte";

type Feld = [number, number];
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const NACH_G1: Voraussetzung = { text: "„Die Südstraße“ abgeschlossen", wenn: { quest: { id: "kueste_die_suedstrasse", phase: ["fertig"] } } };

/* ───── Stellen ───── */
const KAI_KISTEN: Feld = [6392.5, 7316.5];
const LICHTER: Feld[] = [[6350.5, 7320.5], [6322.5, 7292.5], [6296.5, 7272.5]];     /* Küste westlich der Mole bis zum Wrack */
const HEHLERLISTE: Feld = [6286.5, 7266.5];
const WERFT: Feld = [6379, 7321.2];
const TEMPEL_PLATZ: Feld = [6474.5, 7281.5];
const KESSEL: Feld = [6472, 7365.4], RAEUCHER: Feld = [6400.5, 7320.6], KAI_FANG: Feld = [6383.5, 7311.5];

/* ───── Figuren (bekannte aus Block G gleich; Bewohner aus laeden.ts mit Name, Modell, Platz) ───── */
const KRANICH: QuestFigur = { id: "kranich", name: "Jasper Kranich", modell: "npcmann3d", x: KIELMUND.kaufherr[0], y: KIELMUND.kaufherr[1], blick: [0, 1] };
const WIEBKE: QuestFigur = { id: "wiebke", name: "Wiebke Strand", modell: "npcfrau3d", x: LEUCHTTURM.waerterin[0], y: LEUCHTTURM.waerterin[1], blick: [0, 1] };
const BENTE: QuestFigur = { id: "bente", name: "Bente Möller", modell: "npcfrau3d", x: MOEWENBUCHT.fischerin[0], y: MOEWENBUCHT.fischerin[1], blick: [0, 1] };
const ILKA: QuestFigur = { id: "ilka", name: "Hafenmeisterin Ilka Brandt", modell: "npc.hafen_frau", x: 6388.5, y: 7314.5, blick: [0, 1] };
const OKKO: QuestFigur = { id: "okko", name: "Werftmeister Okko Spant", modell: "npc.hafen_mann", x: 6381.5, y: 7323.5, blick: [-1, 0] };
const EDZARD: QuestFigur = { id: "edzard", name: "Ratsherr Edzard Wellmann", modell: "npc.kaufmann", x: 6417.5, y: 7299.5, blick: [0, 1] };
const MAREN: QuestFigur = { id: "maren", name: "Schwester Maren", modell: "npc.nonne", x: 6475.5, y: 7278, blick: [0, 1] };                 /* kielmund_priesterin */
const WIEBKE_HERING: QuestFigur = { id: "wiebke_hering", name: "Wiebke Hering", modell: "npc.hafen_frau", x: 6404, y: 7309.2, blick: [0, -1], weit: 4 }; /* kielmund_fischmarkt */
const SAMIRA: QuestFigur = { id: "samira", name: "Samira Pfeffer", modell: "npc.kauffrau", x: 6440, y: 7307.2, blick: [0, -1], weit: 4 };         /* kielmund_gewuerze */
const HANNE: QuestFigur = { id: "hanne_kombuese", name: "Hanne Kombüse", modell: "npc.baecker", x: 6454, y: 7372.2, blick: [0, 1] };          /* kielmund_baecker */
const JOST: QuestFigur = { id: "hofwaechter_jost", name: "Hofwächter Jost", modell: "stadtwache3d", x: 6397.5, y: 7007.4, blick: [0, 1] };    /* zunft_wache_holzfaellerhof */

const tschuess = (zeile: string): Option => ({ id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: [zeile] } }] });

/* ══════════════ 1. „Lichter im Nebel“ ══════════════ */
export const KIELMUND_LICHTER = "kielmund_lichter_im_nebel";
const LI = ["licht_1", "licht_2", "licht_3"];
const LICHT_TEXT = [
  "Am Ende der Mole: ein Stück Kerze in einer Laterne, mit Ruß geschwärzt. Wer hier ein Licht schwenkt, sieht man vom Meer aus weit.",
  "Zwischen den Klippen: ein zweiter Lichtplatz. Hier hat jemand gewartet – Fußspuren, Pfeifenasche, ein leerer Krug.",
  "Am Strand vor dem Wrack: das dritte Zeichen. Schleifspuren führen zu den Felsen, als hätte man Kisten gezogen.",
];
export const QUEST_KIELMUND_LICHTER: QuestDef = {
  id: KIELMUND_LICHTER, titel: "Lichter im Nebel", ort: "Kielmund · Kai · Leuchtturm · Wrack", start: "Sprich mit Hafenmeisterin Ilka Brandt am Kai von Kielmund.",
  logNeu: "Am Kai von Kielmund zählt eine Hafenmeisterin Kisten – und zählt sie noch einmal.",
  logAngeboten: "Hafenmeisterin Ilka Brandt hat Kisten ohne Siegel am Kai gefunden.",
  logAbgabe: "Die Liste der Hehler ist gefunden. Bring sie Jasper Kranich im Haus der Küstenhäuser.",
  logFertig: "Die Schmuggler am Wrack sind vertrieben, und Kranich weiß, wer im Kaufmannsviertel die Ware abnahm. Im Nebel brennen jetzt nur noch die richtigen Lichter.",
  geber: "ilka", abgabe: "kranich",
  figuren: [ILKA, WIEBKE, KRANICH],
  voraussetzungen: [NACH_G1],
  schritte: [
    { id: "kisten", text: "Die Kisten ohne Siegel untersuchen", ereignis: { art: "objekt", id: "kl_kisten" }, wo: KAI_KISTEN,
      log: "Am Kai stehen Kisten ohne das Siegel des Küstenhauses. Sieh sie dir an." },
    { id: "wiebke", text: "Wiebke Strand am Leuchtfeuer fragen", ereignis: { art: "antwort" }, bei: "wiebke",
      log: "Wer nachts auf das Meer schaut, ist Wiebke Strand am Leuchtfeuer bei den Klippen. Frag sie, ob ihr etwas aufgefallen ist." },
    ...LI.map((id, i) => ({ id, text: "Die falschen Lichtzeichen an der Küste finden", ereignis: { art: "objekt" as const, id: "kl_" + id }, nach: ["wiebke"], gruppe: "lichter", wo: LICHTER[i],
      log: "Wiebke hat nachts falsche Lichtzeichen gesehen: an der Mole, zwischen den Klippen und am Strand vor dem Wrack ({n:lichter})." })),
    { id: "raeuber", text: "Zwei Strandräuber am Wrack vertreiben", ereignis: { art: "erlegen", typ: "strandraeuber_saebel" }, anzahl: 2, nach: LI, wo: WRACK.raeuber,
      log: "Die Schleifspuren enden am Wrack. Dort lagern Strandräuber. Vertreib zwei von ihnen ({n:raeuber})." },
    { id: "liste", text: "Die Liste der Hehler finden", ereignis: { art: "objekt", id: "kl_liste" }, nach: ["raeuber"], wo: HEHLERLISTE,
      log: "Irgendwo im Lager der Strandräuber muss stehen, wer die Ware in Kielmund abnimmt." },
  ],
  objekte: [
    { id: "kl_kisten", name: "Kisten ohne Siegel", x: KAI_KISTEN[0], y: KAI_KISTEN[1], modell: "stelle", tat: "untersuchen", tatText: "Die Kisten untersuchen", weit: 2.5,
      text: "Salz, Gewürze, zwei Ballen feiner Stoff. Keine Marke, kein Siegel. Am Holz klebt Sand – Strandsand, nicht Kaisand.", schon: "Die Kisten hast du gesehen.",
      sonst: [{ wenn: NEU, text: "Kisten am Kai. Die Hafenmeisterin lässt keinen ran." }, { wenn: FERTIG, text: "Die Kisten sind fort – beschlagnahmt." }] },
    ...LI.map((id, i) => ({ id: "kl_" + id, name: "Lichtplatz", x: LICHTER[i][0], y: LICHTER[i][1], modell: "stelle", tat: "untersuchen" as const, tatText: "Den Platz untersuchen", weit: 2.5,
      text: LICHT_TEXT[i] + " ({n:lichter})", schon: "Hier warst du schon.",
      sonst: [{ wenn: NEU, text: "Steine, Sand, Möwendreck." }, { wenn: FERTIG, text: "Hier brennt kein Licht mehr." }, { wenn: { offen: ["wiebke"] }, text: "Steine, Sand, Möwendreck. Wonach suchst du eigentlich?" }] })),
    { id: "kl_liste", name: "Kiste der Strandräuber", x: HEHLERLISTE[0], y: HEHLERLISTE[1], modell: "stelle", tat: "untersuchen", tatText: "Die Kiste durchsuchen", weit: 2.5,
      text: "Unter Tauen und leeren Flaschen: ein gefaltetes Blatt. Namen, Mengen, Preise – und ganz oben ein Kontor im Kaufmannsviertel von Kielmund.", schon: "Die Liste hast du gelesen.",
      sonst: [{ wenn: NEU, text: "Eine Kiste voller Tauwerk." }, { wenn: FERTIG, text: "Leer." }, { wenn: { offen: ["raeuber"] }, text: "Die Strandräuber lassen dich nicht an ihre Kiste." }] },
  ],
  /* Ilka: Hafenmeisterin, scharf, genau, hasst Unordnung. Wiebke: wie in G2 – still, beobachtet das Meer. Kranich: Kaufherr, kühl, politisch. */
  dialoge: {
    ilka: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Zwölf Kisten. Zwölf. Und keine einzige mit dem Siegel des Küstenhauses.", "Jemand bringt Ware an Land, ohne Zoll. Am helllichten Tag stehen sie dann auf meinem Kai."],
          antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Jedes Schiff ein Eintrag, jede Kiste ein Siegel. So hält man einen Hafen sauber."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Seit Kranich das Kontor geschlossen hat, sind alle Kisten gesiegelt. Fast schon langweilig. Fast."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["liste"] }, zeilen: ["Eine Liste? Bring sie Kranich ins Haus der Küstenhäuser. Wenn ein Kaufmann dahintersteckt, muss der Rat das entscheiden, nicht ich."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["kisten"] }, zeilen: ["Strandsand, sagst du? Dann kommen sie nicht über den Kai, sondern über den Strand. Frag Wiebke am Leuchtfeuer – sie sieht nachts mehr als wir alle."], antworten: ["tschuess"] },
        { zeilen: ["Die Kisten da drüben. Sieh sie dir an, aber fass nichts an."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich finde heraus, wer schmuggelt. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Gut. Sieh dir die Kisten an. Und dann such, woher sie kommen.", "Wenn du jemanden findest: Der Rat sitzt im Haus der Küstenhäuser. Jasper Kranich wird es wissen wollen."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Dann zähl ich eben weiter."] } }] },
        tschuess("Halt deine Kisten gesiegelt."),
      ],
    },
    wiebke: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["wiebke"] }, zeilen: ["Du kommst aus Kielmund? Um diese Zeit?", "Setz dich. Das Feuer brennt, das Meer ist ruhig. Fast."], antworten: ["lichter_fragen", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["wiebke"] }, zeilen: ["Drei Lichter. An der Mole, in den Klippen, am Wrack. Immer in dieser Reihenfolge."], antworten: ["tschuess"] },
        { zeilen: ["Das Feuer brennt. Solange es brennt, ist alles gut."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "lichter_fragen", text: "Hast du nachts etwas Ungewöhnliches gesehen? Lichter auf dem Wasser?", folge: [{ f: { erledige: ["wiebke"],
          zeilen: ["Wiebke nickt langsam. „Lichter. Nicht meins. Drei, die sich antworten.“", "Eins am Ende der neuen Mole. Eins zwischen den Klippen. Eins unten am Wrack.",
          "Wer sie sieht, denkt, es sei mein Feuer – und steuert falsch. Oder richtig, wenn er weiß, wohin. Das gefällt mir nicht."] } }] },
        tschuess("Geh vorsichtig über die Klippen."),
      ],
    },
    kranich: {
      reden: [
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Du bringst mir etwas vom Hafen. Ilka hat dich angekündigt.", "Zeig her."], antworten: ["liste_geben"] },
        { wenn: LAEUFT, zeilen: ["Schmuggler? Ilka sieht überall Schmuggler. …Meistens hat sie recht."], antworten: ["tschuess"] },
        { zeilen: ["Kielmund handelt mit allem, was schwimmt. Aber es handelt ehrlich."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "liste_geben", text: "Die Liste der Hehler, aus dem Lager der Strandräuber am Wrack.", folge: [{ f: { abschluss: true,
          zeilen: ["Kranich liest. Bei einem Namen bleibt sein Finger stehen.", "Harmsen. Mein Nachbar im Kaufmannsviertel. Wir haben zusammen im Rat gesessen.",
          "…Das Kontor wird geschlossen. Heute noch. Und Ilka bekommt, was ihr zusteht – und du auch."] } }] },
        tschuess("Der Rat dankt."),
      ],
    },
  },
  glueckwunsch: "Ein Kontor weniger, ein ehrlicher Hafen mehr. Der Rat von Kielmund dankt dir.",
  belohnungText: "Belohnung: Stärke 1.200, Defense 1.200 XP, 300 Splitter",
  belohnung: { xp: { staerke: 1200, defense: 1200 }, splitter: 300 },
  punkte: 1,
};

/* ══════════════ 2. „Kiel auf Stapel“ ══════════════ */
export const KIELMUND_KIEL = "kielmund_kiel_auf_stapel";
export const QUEST_KIELMUND_KIEL: QuestDef = {
  id: KIELMUND_KIEL, titel: "Kiel auf Stapel", ort: "Kielmund · Werft · Erlengrund", start: "Sprich mit Werftmeister Okko Spant an der Werft von Kielmund.",
  logNeu: "An der Werft von Kielmund liegt ein halbes Boot – und der Werftmeister schaut es an, als würde es gleich wegschwimmen.",
  logAngeboten: "Werftmeister Okko Spant soll ein Fischerboot bauen, aber ihm fehlt fast alles.",
  logAbgabe: "Das Boot liegt im Wasser. Sag Okko Spant Bescheid.",
  logFertig: "Das neue Fischerboot liegt im Hafen von Kielmund. Im Fischerquartier streiten sie schon, wer zuerst damit hinausfährt.",
  geber: "okko",
  figuren: [OKKO, JOST],
  voraussetzungen: [NACH_G1, { text: "Handwerk 15", wenn: { skill: { k: "handwerk", min: 15 } } }, { text: "Schmieden 15", wenn: { skill: { k: "schmieden", min: 15 } } }],
  schritte: [
    { id: "segel", text: "Zwei Bahnen Segeltuch weben", ereignis: { art: "herstellen", rezept: "stoff_hanf" }, anzahl: 2, wo: "werkbank",
      log: "Okko braucht Segeltuch: Web an einer Werkbank zwei Bahnen Hanftuch aus Garn ({n:segel})." },
    { id: "eisen", text: "Zwei Eisenbarren für die Beschläge schmelzen", ereignis: { art: "herstellen", rezept: "barren_eisen" }, anzahl: 2, wo: "esse",
      log: "Für Nägel und Beschläge braucht Okko Eisen: Schmilz an einer Esse zwei Eisenbarren ({n:eisen})." },
    { id: "holz", text: "Eichenholz vom Holzfällerhof in Erlengrund holen", ereignis: { art: "antwort" }, bei: "hofwaechter_jost",
      log: "Gutes Eichenholz gibt es nur am Holzfällerhof in Erlengrund. Bring Okkos Brief zu Hofwächter Jost – er schickt eine Ladung." },
    { id: "stapellauf", text: "Das Boot vom Stapel lassen", ereignis: { art: "objekt", id: "kk_stapellauf" }, nach: ["segel", "eisen", "holz"], wo: WERFT,
      log: "Segeltuch, Eisen und Eichenholz sind da. Bring alles zur Werft – dann geht das Boot vom Stapel." },
  ],
  objekte: [
    { id: "kk_stapellauf", name: "Helling der Werft", x: WERFT[0], y: WERFT[1], modell: "stelle", tat: "benutzen", tatText: "Das Boot vom Stapel lassen", weit: 3,
      braucht: { wenn: { anzahl: { g: "stoff_hanf", min: 2 }, hat: "barren_eisen" }, text: "Dafür fehlt noch etwas: zwei Bahnen Segeltuch, zwei Eisenbarren und zwei Eichenstämme." },
      nehmen: [{ g: "stoff_hanf", n: 2 }, { g: "barren_eisen", n: 2 }, { g: "stamm_eiche", n: 2 }],
      text: "Okko schlägt die letzten Nägel ein, das Segel wird angeschlagen. Dann ziehen alle an den Keilen – und das Boot rutscht mit einem Klatschen ins Hafenbecken.", schon: "Das Boot schwimmt.",
      sonst: [{ wenn: NEU, text: "Ein halbes Boot auf der Helling. Ohne Segel, ohne Beschläge." }, { wenn: FERTIG, text: "Die Helling ist leer. Das Boot liegt im Hafen." }] },
  ],
  /* Okko: Werftmeister, alt, wortkarg, redet mit dem Holz. Jost: Hofwächter der Holzfäller-Zunft, gemütlich, stolz auf seine Eichen. */
  dialoge: {
    okko: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Ein Boot für das Fischerquartier, sagt der Rat. Bis zum Herbst, sagt der Rat.", "Kein Segel, kein Eisen, und Eiche gibt's an der ganzen Küste nicht. Sagt der Rat nicht."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Holz muss atmen. Wie ein Mensch. Nur länger."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Sie heißt „Möwe“. Die Fischer wollten „Okko“. Hab nein gesagt."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Sie schwimmt. Und sie ist dicht."], antworten: ["fertig"] },
        { wenn: { ...LAEUFT, erledigt: ["segel", "eisen", "holz"] }, zeilen: ["Alles da? Dann rüber zur Helling. Wir lassen sie zu Wasser."], antworten: ["tschuess"] },
        { zeilen: ["Segeltuch von der Werkbank, Eisen von der Esse, Eiche aus Erlengrund. Dann reden wir weiter."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich besorge, was fehlt. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Hm. Gut.", "Zwei Bahnen Segeltuch – Hanftuch, an der Werkbank gewebt. Zwei Eisenbarren für die Beschläge.",
          "Und Eiche. Die gute kommt vom Holzfällerhof in Erlengrund. Hier, mein Brief für Jost. Er weiß, was ich brauche.", "Aber heiz die Esse mit Tanne, nicht mit meiner Eiche. Hörst du?"] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Das Holz wartet. Ich auch."] } }] },
        { id: "fertig", text: "Das Boot ist im Wasser.", folge: [{ f: { abschluss: true, zeilen: ["Okko legt die Hand auf den Bug. Lange.", "Gutes Holz. Gutes Eisen. Gute Arbeit. Mehr sag ich nicht. Hier – für dich."] } }] },
        tschuess("Wind von achtern."),
      ],
    },
    hofwaechter_jost: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["holz"] }, zeilen: ["Der Hain gehört der Zunft. …Ein Brief? Von Okko Spant, aus Kielmund?"], antworten: ["brief_geben", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["holz"], offen: ["stapellauf"] }, zeilen: ["Grüß Okko. Und sag ihm, er soll die Eiche nicht anschreien. Sie hört ihn."], antworten: ["holz_neu", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["holz"] }, zeilen: ["Grüß Okko. Und sag ihm, er soll die Eiche nicht anschreien. Sie hört ihn."], antworten: ["tschuess"] },
        { zeilen: ["Der Hain gehört der Zunft. Holzfällerei ab Stufe 60 – dann zeig ich dir die Kernbäume."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "brief_geben", text: "Okko braucht Eiche für ein neues Fischerboot.", folge: [{ f: { erledige: ["holz"], geben: [{ g: "stamm_eiche", name: "Eichenstamm" }, { g: "stamm_eiche", name: "Eichenstamm" }],
          zeilen: ["Jost liest den Brief und lacht. „Der alte Okko. Schreibt wie er redet: drei Worte, zwei davon Eiche.“", "Er pfeift. Zwei Zunftleute rollen Stämme heran.",
          "Zwei Stämme, gerade gewachsen, ohne Ast. Die besten, die ich habe. Sag ihm, das nächste Boot will ich sehen."] } }] },
        { id: "holz_neu", text: "Die Eiche ist weg – ich habe sie in der Esse verfeuert.", folge: [
          { wenn: { anzahl: { g: "stamm_eiche", min: 2 } }, f: { weiter: true, zeilen: ["Weg? Du hast doch noch zwei Stämme bei dir. Ab nach Kielmund damit."] } },
          { f: { weiter: true, geben: [{ g: "stamm_eiche", name: "Eichenstamm" }, { g: "stamm_eiche", name: "Eichenstamm" }],
            zeilen: ["Jost reibt sich die Stirn. „In der Esse. Die beste Eiche der Zunft. In der Esse.“", "Er pfeift noch einmal. „Zwei. Die letzten. Und diesmal heizt du mit Tanne.“"] } }] },
        tschuess("Komm wieder, wenn du so weit bist."),
      ],
    },
  },
  schalter: { kielmund_neues_boot: FERTIG },
  glueckwunsch: "Sie schwimmt. Und sie ist dicht. Mehr kann ein Werftmeister nicht sagen.",
  belohnungText: "Belohnung: Handwerk 900, Schmieden 900 XP, 250 Splitter · danach: ein neues Fischerboot im Hafen",
  belohnung: { berufe: { handwerk: 900, schmieden: 900 }, splitter: 250 },
  punkte: 1,
};

/* ══════════════ 3. „Suppe für die Altstadt“ ══════════════ */
export const KIELMUND_SUPPE = "kielmund_suppe_fuer_die_altstadt";
export const QUEST_KIELMUND_SUPPE: QuestDef = {
  id: KIELMUND_SUPPE, titel: "Suppe für die Altstadt", ort: "Kielmund · Tempel · Fischmarkt · Möwenbucht", start: "Sprich mit Schwester Maren am Tempel der Altstadt.",
  logNeu: "Vor dem Tempel der Altstadt stehen leere Bänke und ein großer, leerer Kessel.",
  logAngeboten: "Schwester Maren will am Festtag die Armen speisen, aber es fehlt der Fisch.",
  logAbgabe: "Die Speisung ist bereitet. Sag Schwester Maren Bescheid.",
  logFertig: "Am Festtag war jede Bank vor dem Tempel besetzt. Schwester Maren hat für dich eine Kerze angezündet – eine für die, die heimkehren.",
  geber: "maren",
  figuren: [MAREN, WIEBKE_HERING, BENTE],
  voraussetzungen: [NACH_G1, { text: "Fischen 20", wenn: { skill: { k: "fischen", min: 20 } } }, { text: "Kochen 25", wenn: { skill: { k: "kochen", min: 25 } } }],
  schritte: [
    { id: "fischmarkt", text: "Auf dem Fischmarkt um übrige Fische bitten", ereignis: { art: "antwort" }, bei: "wiebke_hering",
      log: "Frag Wiebke Hering am Fischmarkt, ob sie übrige Fische für die Speisung hat." },
    { id: "heringe", text: "Drei Heringe am Kai fangen", ereignis: { art: "sammeln", ziel: "hering" }, anzahl: 3, wo: KAI_FANG,
      log: "Fang selbst drei Heringe am Kai von Kielmund ({n:heringe})." },
    { id: "bente", text: "Bente Möller in der Möwenbucht Garn bringen", ereignis: { art: "antwort" }, bei: "bente",
      log: "Bente Möller in der Möwenbucht flickt ihre Netze nie zu Ende. Bring ihr vier Garn – dann schickt sie einen Korb Heringe." },
    { id: "suppe", text: "Zwei Fischsuppen am Kessel kochen", ereignis: { art: "herstellen", rezept: "fischsuppe" }, anzahl: 2, nach: ["fischmarkt"], wo: KESSEL,
      log: "Koch aus den Mühlbarschen vom Fischmarkt am Kessel im Fischerquartier zwei Fischsuppen ({n:suppe})." },
    { id: "raeuchern", text: "Fünf Räucherheringe in der Räucherhütte räuchern", ereignis: { art: "herstellen", rezept: "raeucherhering" }, anzahl: 5, nach: ["heringe", "bente"], wo: RAEUCHER,
      log: "Räucher die Heringe in der Räucherhütte am Hafen – fünf Stück ({n:raeuchern})." },
    { id: "speisung", text: "Die Speisung vor dem Tempel bereiten", ereignis: { art: "objekt", id: "ks_speisung" }, nach: ["suppe", "raeuchern"], wo: TEMPEL_PLATZ,
      log: "Stell die Suppe und die Räucherheringe auf die Tische vor dem Tempel." },
  ],
  objekte: [
    { id: "ks_speisung", name: "Tische vor dem Tempel", x: TEMPEL_PLATZ[0], y: TEMPEL_PLATZ[1], modell: "stelle", tat: "benutzen", tatText: "Die Speisung bereiten", weit: 3,
      braucht: { wenn: { anzahl: { g: "fischsuppe", min: 2 } }, text: "Dafür brauchst du zwei Fischsuppen und fünf Räucherheringe." },
      nehmen: [{ g: "fischsuppe", n: 2 }, { g: "raeucherhering", n: 5 }],
      text: "Du stellst die Töpfe auf die Tische. Es dauert keine Minute, bis die ersten kommen – Kinder zuerst, dann die Alten, dann ein Matrose, der so tut, als wäre er nur zufällig da.",
      schon: "Die Tische sind gedeckt.", sonst: [{ wenn: NEU, text: "Leere Tische vor dem Tempel." }, { wenn: FERTIG, text: "Die Tische sind abgeräumt. Es riecht noch nach Rauch und Suppe." }] },
  ],
  /* Maren: Priesterin, warm, ruhig, zählt die, die nicht heimkamen. Wiebke Hering: Fischfrau, laut, großzügig. Bente: wie in G4 – trocken, praktisch. */
  dialoge: {
    maren: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Am Festtag speisen wir die, die vom Meer nichts mehr bekommen. Witwen, Kinder, alte Matrosen.", "Dieses Jahr war die See geizig. Ich habe Brot, aber keinen Fisch."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Der Tempel ist für alle offen, die vom Meer heimkehren – und für die, die warten."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Sie fragen nach dir, weißt du. Die Kinder. Ob du nächstes Jahr wiederkommst."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Ich habe es gesehen. Jede Bank besetzt."], antworten: ["fertig"] },
        { zeilen: ["Zwei Suppen und ein paar Räucherheringe. Das reicht für alle, wenn wir teilen."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich besorge den Fisch. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Danke. Frag Wiebke Hering am Fischmarkt – sie hat meist etwas übrig.",
          "Fang selbst ein paar Heringe am Kai. Und Bente Möller in der Möwenbucht hat immer einen Korb für uns, wenn man ihr hilft.", "Die Suppe am Kessel im Fischerquartier, die Heringe in der Räucherhütte. Dann auf die Tische vor dem Tempel."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Das Fest ist erst in ein paar Tagen. Wir warten."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: ["Mühlbarsche von Wiebke Hering am Fischmarkt, drei Heringe vom Kai, ein Korb von Bente in der Möwenbucht.",
          "Zwei Fischsuppen am Kessel, fünf Räucherheringe in der Räucherhütte. Dann auf die Tische vor dem Tempel."] } }] },
        { id: "fertig", text: "Die Speisung ist bereitet.", folge: [{ f: { abschluss: true, zeilen: ["Schwester Maren nimmt deine Hände. Sie sind kalt vom Kai und riechen nach Rauch.",
          "Heute hat niemand in der Altstadt gehungert. Das ist mehr, als die See uns oft lässt. Danke."] } }] },
        tschuess("Mögen die Wellen dich tragen."),
      ],
    },
    wiebke_hering: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["fischmarkt"] }, zeilen: ["Frisch vom Kai! …Ach, für Schwester Maren? Für die Speisung?"], antworten: ["fische_bitten", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["fischmarkt"] }, zeilen: ["Mühlbarsche, vom Schilfsee. Die Händler aus dem Süden bringen sie, und keiner kauft sie. Für Suppe sind sie gut."], antworten: ["tschuess"] },
        { zeilen: ["Am Fischmarkt wird geschrien, nicht geflüstert! Was darf's sein?"], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "fische_bitten", text: "Hast du übrige Fische für die Speisung am Tempel?", folge: [{ f: { erledige: ["fischmarkt"],
          geben: [{ g: "fisch_muehlbarsch_roh", name: "Mühlbarsch" }, { g: "fisch_muehlbarsch_roh", name: "Mühlbarsch" }],
          zeilen: ["Wiebke wischt sich die Hände an der Schürze ab. „Für Maren? Immer.“", "Zwei Mühlbarsche, vom Schilfsee. Nicht schön, aber für Suppe gibt's nichts Besseres. Und sag ihr, die nächsten gehen auch auf mich."] } }] },
        tschuess("Komm morgen wieder, dann ist's frischer."),
      ],
    },
    bente: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["bente"], anzahl: { g: "garn", min: 4 } }, zeilen: ["Du kommst aus Kielmund? Mit Garn in der Tasche? Das riech ich."], antworten: ["garn_geben", "tschuess"] },
        { wenn: { ...LAEUFT, offen: ["bente"] }, zeilen: ["Maren schickt dich? Dann bring mir vier Garn. Meine Netze haben mehr Loch als Netz."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["bente"] }, zeilen: ["Grüß Maren. Und sag ihr, die Heringe sind von gestern Nacht."], antworten: ["tschuess"] },
        { zeilen: ["Die Bucht gibt, was sie will. Nicht mehr."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "garn_geben", text: "Vier Garn für deine Netze – Schwester Maren braucht Fisch für die Speisung.", wenn: { anzahl: { g: "garn", min: 4 } }, folge: [{ f: { erledige: ["bente"], nehmen: [{ g: "garn", n: 4 }],
          geben: [{ g: "fisch_hering_roh", name: "Hering" }, { g: "fisch_hering_roh", name: "Hering" }],
          zeilen: ["Bente nimmt das Garn und prüft es zwischen den Fingern. „Taugt.“", "Sie holt einen Korb aus der Räucherhütte. Zwei Heringe, frisch. „Für Maren. Mehr hat die Bucht heute nicht.“"] } }] },
        tschuess("Wind von achtern."),
      ],
    },
  },
  glueckwunsch: "Heute hat in der Altstadt niemand gehungert. Mögen die Wellen dich immer heimtragen.",
  belohnungText: "Belohnung: Fischen 800, Kochen 800 XP, 200 Splitter",
  belohnung: { berufe: { fischen: 800, kochen: 800 }, splitter: 200 },
  punkte: 1,
};

/* ══════════════ 4. „Der Brief des Ratsherrn“ ══════════════ */
export const KIELMUND_BRIEF = "kielmund_brief_des_ratsherrn";
const EMPF = ["ilka", "samira", "maren", "hanne_kombuese"];
const EMPF_VIERTEL = ["Hafen", "Kaufmannsviertel", "Altstadt", "Fischerquartier"];
const ANTWORT: Record<string, { text: string; zeilen: string[]; geben?: { g: string; name: string }[] }> = {
  ilka: { text: "Ein Brief vom Ratsherrn Wellmann. Versiegelt.", zeilen: ["Ilka bricht das Siegel, liest, schnaubt. „Neue Zollsätze. Zum dritten Mal dieses Jahr.“", "Sie kritzelt etwas auf die Rückseite. „Meine Antwort. Er wird sie nicht mögen.“"] },
  samira: { text: "Post vom Haus der Küstenhäuser.", zeilen: ["Samira liest und lächelt. „Der Rat will Pfeffer für das Fest. Viel Pfeffer.“", "Sie füllt ein kleines Säckchen. „Eine Probe für den Ratsherrn. Und eine für dich – Salz vom Glutsand.“"],
    geben: [{ g: "salz", name: "Salz" }] },
  maren: { text: "Ein Brief vom Ratsherrn Wellmann.", zeilen: ["Schwester Maren liest langsam. „Der Rat zahlt die Kerzen für das Fest. Endlich.“", "Sie segnet den Brief, bevor sie ihn zurückgibt. „Damit er heil ankommt. Ratsherren verlieren gern Briefe.“"] },
  hanne_kombuese: { text: "Post vom Rat, für die Kombüse.", zeilen: ["Hanne wischt sich das Mehl von den Händen und liest. „Brot für hundert Leute? Bis übermorgen?“", "Sie seufzt und drückt dir ein Brot in die Hand. „Eins für dich. Für den Weg. Die anderen neunundneunzig back ich heute Nacht.“"],
    geben: [{ g: "brot", name: "Brot" }] },
};
const EMPF_FIG: Record<string, QuestFigur> = { ilka: ILKA, samira: SAMIRA, maren: MAREN, hanne_kombuese: HANNE };
export const QUEST_KIELMUND_BRIEF: QuestDef = {
  id: KIELMUND_BRIEF, titel: "Der Brief des Ratsherrn", ort: "Kielmund · alle vier Viertel", start: "Sprich mit Ratsherr Edzard Wellmann am Haus der Küstenhäuser.",
  logNeu: "Vor dem Haus der Küstenhäuser steht ein Ratsherr mit einem Stapel versiegelter Briefe und sieht sich nach einem Boten um.",
  logAngeboten: "Ratsherr Edzard Wellmann braucht einen Boten für die vier Viertel von Kielmund.",
  logAbgabe: "Alle vier Briefe sind angekommen. Bring die Antworten zu Ratsherr Wellmann.",
  logFertig: "Du kennst jetzt jedes Viertel von Kielmund – und jedes Viertel kennt dich.",
  geber: "edzard",
  figuren: [EDZARD, ...EMPF.map((id) => EMPF_FIG[id])],
  voraussetzungen: [NACH_G1],
  schritte: EMPF.map((id, i) => ({ id: "brief_" + id, text: "Die Briefe in die vier Viertel bringen", ereignis: { art: "antwort" as const }, bei: id, gruppe: "briefe",
    log: `Bring die Briefe des Ratsherrn in alle vier Viertel: Hafenmeisterin Ilka am Kai (Hafen), Samira Pfeffer am Markt (Kaufmannsviertel), Schwester Maren am Tempel (Altstadt), Hanne in der Kombüse (Fischerquartier) ({n:briefe}). Diesmal: ${EMPF_VIERTEL[i]}.` })),
  /* Edzard: Ratsherr, umständlich, wohlmeinend, verliert gern den Faden. Die Empfänger: wie in den anderen Quests. */
  dialoge: {
    edzard: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Ah! Ein Fremder mit festen Stiefeln. Genau, was ich brauche.", "Vier Briefe, vier Viertel. Der Rat beschließt, und keiner erfährt es. Mein Bote hat sich das Bein gebrochen. Auf der Mole. Beim Angeln."],
          antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Der Rat tagt. Der Rat tagt immer."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Ilkas Antwort habe ich dreimal gelesen. Sie wird nicht freundlicher."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Zurück! Und mit Antworten! Zeig her."], antworten: ["fertig"] },
        { zeilen: ["Hafen, Kaufmannsviertel, Altstadt, Fischerquartier. In welcher Reihenfolge, ist mir gleich."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich bringe die Briefe. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Wunderbar! Einer für Hafenmeisterin Ilka am Kai, einer für Samira Pfeffer am Markt,",
          "einer für Schwester Maren am Tempel und einer für Hanne in der Kombüse unten im Fischerquartier. Und bring mir die Antworten. Wenn es welche gibt."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Dann warten die Beschlüsse eben. Wie immer."] } }] },
        { id: "fertig", text: "Alle vier Viertel haben ihre Briefe. Hier sind die Antworten.", folge: [{ f: { abschluss: true, zeilen: ["Edzard blättert die Antworten durch und seufzt bei der ersten.",
          "Ilka mag die Zollsätze nicht. Samira schickt Pfeffer. Maren dankt für die Kerzen. Und Hanne … backt. Gut. Gut!", "Du hast Kielmund in einem Tag durchquert. Das schafft nicht einmal der Rat. Hier – für deine Stiefel."] } }] },
        tschuess("Der Rat tagt."),
      ],
    },
    ...Object.fromEntries(EMPF.map((id) => [id, {
      reden: [
        { wenn: { ...LAEUFT, offen: ["brief_" + id] }, zeilen: ["Ja? Was gibt's?"], antworten: ["brief_" + id, "tschuess"] } as Rede,
        { wenn: { erledigt: ["brief_" + id] }, zeilen: ["Sag dem Ratsherrn, er hat meine Antwort."], antworten: ["tschuess"] } as Rede,
        { zeilen: ["Ja?"], antworten: ["tschuess"] } as Rede,
      ],
      optionen: [
        { id: "brief_" + id, text: ANTWORT[id].text, folge: [{ f: { erledige: ["brief_" + id], ...(ANTWORT[id].geben ? { geben: ANTWORT[id].geben } : {}), zeilen: [...ANTWORT[id].zeilen, "({n:briefe})"] } }] } as Option,
        tschuess("Auf Wiedersehen."),
      ],
    }])),
  },
  glueckwunsch: "Vier Viertel, ein Bote, kein verlorener Brief. Der Rat von Kielmund ist beeindruckt – und das kommt selten vor.",
  belohnungText: "Belohnung: Geschick 800 XP, 150 Splitter",
  belohnung: { xp: { geschick: 800 }, splitter: 150 },
  punkte: 1,
};
