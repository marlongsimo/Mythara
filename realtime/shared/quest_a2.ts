/*
 * Riftmere – Quest A2 „Das Wappen mit dem Turm“ (Phase 2 „Waldland“, 26.11.2026), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/quests/1-erste-schritte.pdf. Bruder Anselm (Kapelle der Waldmark), Köhler Ulf (Köhlerlichtung im Nordwald).
 * Obelisk untersuchen, Kohle gegen drei Eichen, Wappen an der Gruft abreiben, drei Steintafel-Bruchstücke von Waldgolems (bedingte Beute 30 %),
 * Bruchstücke ordnen (kleines Dialog-Rätsel). Leiser Anfang der Geschichte um die schwarzen Federn – die Raben werden noch nicht genannt.
 * Lohn: 300 Stärke-, 300 Defense-, 200 LP-XP, 60 Splitter, 1 Questpunkt; danach heilt das Beten in der Kapelle (Schalter kapelle_offen).
 */
import type { QuestDef, Bed, Geben } from "./questbau";

export const A2 = "nordwald_das_wappen_mit_dem_turm";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const ICH = "Du";
const PERGAMENT: Geben[] = [{ g: "pergament", name: "ein leeres Pergament", fehlt: true }];
const FALSCH = (t: string) => ({ f: { weiter: true, zeilen: [t] } });

export const QUEST_A2: QuestDef = {
  id: A2, titel: "Das Wappen mit dem Turm", ort: "Waldmark · Nordwald", start: "Sprich mit Bruder Anselm vor der Kapelle der Waldmark.",
  logNeu: "Bruder Anselm hütet die Kapelle der Waldmark – und ein Buch, in dem jede Seite über die Feste im Nordwald fehlt.",
  logAngeboten: "Bruder Anselm wartet vor der Kapelle. Er sucht jemanden, der in den Nordwald geht.",
  logAbgabe: "Die Tafel liegt in der richtigen Reihenfolge. Bruder Anselm will dir noch etwas sagen.",
  logFertig: "Anselm hat die Seite neu geschrieben: Die Feste war ein Vorposten der Wacht, und ihr Zeichen ist der Turm über drei Wellen – das Zeichen von Grauwacht. Die Kapelle steht dir offen: Beten heilt dich alle zehn Minuten.",
  geber: "anselm",
  figuren: [
    { id: "anselm", name: "Bruder Anselm", modell: "npcmann3d", x: 6457.5, y: 6424.8, blick: [0, 1] },
    { id: "ulf", name: "Köhler Ulf", modell: "npc.schmied", x: 6360.5, y: 6428.5, blick: [1, 0] },
  ],
  schritte: [
    { id: "obelisk", text: "Den Obelisken am Friedhof untersuchen", ereignis: { art: "objekt", id: "a2_obelisk" },
      log: "Untersuche den Obelisken auf dem Friedhof im Nordwald." },
    { id: "kohle", text: "Von Köhler Ulf Kohle bekommen", ereignis: { art: "antwort" }, nach: ["obelisk"], bei: "ulf",
      log: "Bitte Köhler Ulf auf der Köhlerlichtung im Nordwald um Kohle. Umsonst gibt er sie nicht." },
    { id: "abrieb", text: "Das Wappen an der Gruft abreiben", ereignis: { art: "objekt", id: "a2_gruft" }, nach: ["kohle"],
      log: "Reibe an der Gruft auf dem Friedhof mit Kohle und Pergament das Wappen ab." },
    { id: "tafeln", text: "Drei Steintafel-Bruchstücke sammeln", ereignis: { art: "aufheben", g: "steintafel" }, anzahl: 3, nach: ["abrieb"], wo: [6328, 6366],
      log: "In der verfallenen Feste tragen die Waldgolems Stücke einer Steintafel in sich. Besiege sie, bis du drei Bruchstücke hast ({n:tafeln})." },
    { id: "ordnen", text: "Die Bruchstücke ordnen", ereignis: { art: "antwort" }, nach: ["tafeln"], bei: "anselm",
      log: "Bring die drei Bruchstücke zu Bruder Anselm und leg sie in die richtige Reihenfolge." },
  ],
  objekte: [
    { id: "a2_obelisk", name: "Obelisk", x: 6373.5, y: 6374.2, modell: "stelle", tat: "untersuchen", tatText: "Den Obelisken untersuchen", weit: 3.2,
      text: "Ein Obelisk für die Gefallenen der Feste. Hunderte Namen, kaum noch lesbar. Darunter eine Zeile, die jemand mit Gewalt ausgekratzt hat: Die Zahl der Gefallenen ist ausgekratzt. Über allem ein verwittertes Wappen – ein Turm.",
      schon: "Die ausgekratzte Zahl lässt dich nicht los.", sonst: [] },
    { id: "a2_gruft", name: "Gruft", x: 6373.5, y: 6361.5, modell: "stelle", tat: "benutzen", tatText: "Das Wappen abreiben", weit: 3.2,
      braucht: { wenn: { hat: "kohle" }, text: "Über der Tür der Gruft ist ein Wappen in den Stein gehauen. Mit Kohle und Pergament könntest du es abreiben." },
      nehmen: [{ g: "kohle" }, { g: "pergament" }], geben: [{ g: "wappenabrieb" }],
      text: "Du legst das Pergament auf den Stein und reibst mit der Kohle darüber. Langsam erscheint das Wappen: ein Turm über drei Wellen.",
      schon: "Den Abrieb hast du schon.", sonst: [] },
  ],
  dialoge: {
    anselm: {
      reden: [
        { wenn: NEU, zeilen: ["Ah – ein Wanderer, der nicht gleich weitergeht. Sieh her.", "Das Buch der Waldmark. Jede Seite über die Feste im Nordwald ist herausgerissen. Niemand weiß mehr, wer dort kämpfte.",
          "Wer seine Toten vergisst, verliert auch den Grund, warum sie gestorben sind. Bring mir die Seiten zurück – oder wenigstens das, was in Stein steht."],
          antworten: ["annehmen", "feste", "spaeter"] },
        { wenn: FERTIG, zeilen: ["Die Seite ist geschrieben. Und die Kapelle steht dir offen – bete, wenn dir die Kräfte schwinden."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Vorposten der Wacht … und die Federn fielen wie schwarzer Schnee.", "Der Turm über drei Wellen. Ich kenne dieses Zeichen. Es ist das Zeichen von Grauwacht."],
          antworten: ["abschluss"] },
        { wenn: { erledigt: ["tafeln"], offen: ["ordnen"], anzahl: { g: "steintafel", min: 3 } }, zeilen: ["Drei Bruchstücke! Leg sie hierher, auf das Pult. Die Kanten müssen passen.",
          "Auf dem einen steht „Vorposten der Wacht“, auf dem nächsten „hielten den Turm über den Wellen“, auf dem dritten nur ein abgebrochenes Ende. Wie legst du sie?"],
          antworten: ["legen_a", "legen_b", "legen_c"] },
        { wenn: { erledigt: ["tafeln"], offen: ["ordnen"] }, zeilen: ["Du hattest drei Bruchstücke – wo sind sie hin? Ohne sie kann ich nichts lesen."], antworten: ["tschuess"] },
        { wenn: { erledigt: ["abrieb"] }, zeilen: ["Ein Turm über drei Wellen … Das Wappen allein sagt mir noch nicht genug.",
          "In den Mauern der Feste stecken die Golems – und in ihnen, heißt es, Steine aus der alten Mauer. Mit Inschrift. Bring mir drei Bruchstücke ({n:tafeln})."], antworten: ["hilfe", "tschuess"] },
        { wenn: { erledigt: ["kohle"] }, zeilen: ["Kohle hast du? Dann zur Gruft, mit Kohle und Pergament. Reib das Wappen ab."], antworten: ["hilfe", "pergament", "tschuess"] },
        { wenn: { erledigt: ["obelisk"] }, zeilen: ["Ausgekratzt? Die Zahl der Gefallenen? Wer tut so etwas …", "Für einen Abrieb brauchst du Kohle. Ulf, der Köhler im Nordwald, hat welche – aber er gibt nichts umsonst."], antworten: ["hilfe", "pergament", "tschuess"] },
        { zeilen: ["Der Friedhof liegt im Nordwald, nordwestlich der Waldmark. Sieh dir den Obelisken an."], antworten: ["hilfe", "pergament", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich sehe mir die Feste an. (Quest annehmen)", folge: [{ f: { start: true, geben: PERGAMENT, zeilen: ["Gott sei es gedankt. Nimm dieses Pergament – für einen Abrieb, falls du ein Wappen findest.",
          "Fang beim Friedhof im Nordwald an. Auf dem Obelisken stehen die Namen der Gefallenen. Wenn irgendwo noch etwas steht, dann dort."],
          nichtsZuGeben: ["Gott sei es gedankt. Fang beim Friedhof im Nordwald an. Auf dem Obelisken stehen die Namen der Gefallenen."] } }] },
        { id: "feste", text: "Was ist mit der Feste?", folge: [{ f: { weiter: true, zeilen: ["Verfallen, seit Menschengedenken. Und die Golems in ihren Mauern sind nicht von selbst entstanden – so viel weiß ich.",
          "Auf dem Friedhof verwittert ein Wappen mit einem Turm. Mehr ist nicht geblieben."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Die Toten warten. Sie haben Zeit."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: ["Der Obelisk auf dem Friedhof im Nordwald. Kohle von Ulf, dem Köhler. Das Wappen an der Gruft abreiben.",
          "Dann drei Bruchstücke aus den Golems der Feste – und zu mir damit."] } }] },
        { id: "pergament", text: "Ich brauche neues Pergament.", folge: [{ f: { weiter: true, geben: PERGAMENT, zeilen: ["Hier. Geh sorgsam damit um – Pergament wächst nicht auf Bäumen. Nun ja. Doch. Aber langsam."], nichtsZuGeben: ["Du hast doch noch eines."] } }] },
        { id: "legen_a", text: "Das abgebrochene Ende nach oben, dann „Vorposten der Wacht“, dann den Turm.", folge: [FALSCH("Hm. Dann beginnt die Tafel mitten im Satz. Sieh dir die Bruchkanten noch einmal an.")] },
        { id: "legen_b", text: "„Vorposten der Wacht“ oben, den Turm über den Wellen in die Mitte, das abgebrochene Ende unten.", folge: [{ f: { erledige: ["ordnen"], nehmen: [{ g: "steintafel", n: 3 }],
          zeilen: ["Ja … die Kanten passen. Lies mit mir: „Vorposten der Wacht. Sie hielten den Turm über den Wellen, bis keiner mehr stand …", "… und die Federn fielen wie schwarzer Schnee.“"] } }] },
        { id: "legen_c", text: "Den Turm oben, das abgebrochene Ende in die Mitte, „Vorposten der Wacht“ unten.", folge: [FALSCH("Der Turm über den Wellen kann nicht über dem Anfang stehen. Versuch es noch einmal.")] },
        { id: "abschluss", text: "Was bedeutet das?", folge: [{ f: { abschluss: true, zeilen: ["Dass die Feste nicht einfach fiel. Jemand hat sie gehalten – Leute aus Grauwacht –, und jemand hat später dafür gesorgt, dass man sie vergisst.",
          "Ich schreibe die Seite neu. Und die Kapelle steht dir von nun an offen. Wenn du verwundet bist, bete – du wirst sehen, es hilft."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Geh in Frieden."] } }] },
      ],
    },
    ulf: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["obelisk"], offen: ["kohle"] }, zeilen: ["Kohle? Für einen Mönch? Hm.", "Kohle gibt's nicht umsonst. Wirf drei Eichenstämme in meinen Meiler, dann kriegst du ein Stück."],
          antworten: ["eichen", "sage", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["kohle"] }, zeilen: ["Hast deine Kohle. Was willst du noch? Ach – die Sage."], antworten: ["sage", "tschuess"] },
        { zeilen: ["Der Meiler muss gleichmäßig glühen. Stör mich nicht."], antworten: ["sage", "tschuess"] },
      ],
      optionen: [
        { id: "eichen", text: "Drei Eichenstämme in den Meiler werfen.", wenn: { anzahl: { g: "stamm_eiche", min: 3 } }, folge: [{ f: { erledige: ["kohle"], nehmen: [{ g: "stamm_eiche", n: 3 }], geben: [{ g: "kohle", name: "ein Stück Holzkohle" }],
          zeilen: ["Ordentliches Holz. Hier, Kohle – vom letzten Brand, schon kalt.", "Und weil du nicht gleich wegrennst: die Sage. Von den Schwarzen, die über das Moor kamen.",
            "Mein Großvater sagte, sie kamen in einer Nacht ohne Mond. Sie trugen kein Licht. Und als es hell wurde, stand die Feste leer."] } }] },
        { id: "sage", text: "Erzähl mir von der Feste.", folge: [{ f: { weiter: true, zeilen: ["Die Schwarzen, die über das Moor kamen – so nennen wir es hier. Keiner weiß, wer sie waren.",
          "Nur dass danach niemand mehr in der Feste lebte. Und dass die Golems kamen, später. Aus dem Stein selbst."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Mhm."] } }] },
      ],
    },
  },
  /* Steintafel-Bruchstücke: 30 % je Waldgolem (config.ts waldgolem, Roll 3 „nur: a2_steintafel“) – nur solange Anselm sie verlangt */
  beute: { a2_steintafel: { erledigt: ["abrieb"], offen: ["tafeln"] } },
  voraussetzungen: [{ text: "Heldenlevel 5 empfohlen (Waldgolems)", wenn: { heldenlevel: 5 } }],
  schalter: { kapelle_offen: FERTIG },
  belohnungText: "Belohnung: 300 Stärke-, 300 Defense- und 200 Lebenspunkte-XP, 60 Splitter · danach: Beten in der Kapelle heilt (alle 10 Minuten)",
  belohnung: { xp: { staerke: 300, defense: 300, lp: 200 }, splitter: 60 },
  punkte: 1,
};
