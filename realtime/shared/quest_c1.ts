/*
 * Riftmere – Quest C1 „Schwarze Federn“ (Phase 6, Raben-Trilogie Teil 1), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/quests/3-raben-trilogie.pdf (Seite 4), doku/konzepte/phase-6.md (Brücke statt Kahn, Insel Aschenwerth).
 * Bertold Krähe liest den Brief mit dem Rabensiegel aus B4, Joost will nicht hinüber („da drüben singen sie“), die alte Brücke nach Aschenwerth ist morsch:
 * 4 Moorweiden, 4 Brückenplanken an Harms Werkbank (oder Harm verkauft sie), Meilerpech von Köhler Ulf gegen 5 Tannenstämme, Brücke flicken,
 * 3 Novizen am Steinkreis, Ebbo gefesselt am Menhir, die Novizenkapuze am Ufer, zurück zu Bertold.
 * QUER: Welche Moorweiden taugen, weiß Gisbert Ast aus den Obstwiesen (B3) – er hat das Holz für die alte Brücke geliefert. Wer das rote Banner aus B4 trägt, dem zeigt Bertold das Rabenzeichen darunter.
 * Lohn: Rabenkapuze, Magie 600, Defense 600, LP 300 XP, 1 Questpunkt. Schalter bruecke_aschenwerth (die Brücke trägt), Wegstein-Ziel „Rabenmoor“.
 *
 * ENTWURF (shared/quest_entwuerfe.ts): wartet auf Phase 6 (Gegner rabenpriester_novize, Rezept brueckenplanke, Gegenstände) und darauf, dass eine Figur
 * in mehreren Quests sprechen kann (Ulf aus A2, Bertold auch in C3). Stellen aus der Welt (#23): rabenmoor (Ursprung 6272 | 6656), aschenwerth (6144 | 6592).
 * Liste: doku/quests/c-bausteine.md.
 */
import type { QuestDef, Bed } from "./questbau";
import { B4 } from "./quest_b4";

export const C1 = "rabenmoor_schwarze_federn";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
/** Rabenmoor: Bertold 48 | 41, Joost 56 | 70,4, Harm 40,5 | 45,6, Brücke 24,6 | 44,3 · Aschenwerth: Steinkreis 98 | 142,4, Westende der Brücke 112,5 | 109,8 */
const BERTOLD: [number, number] = [6320, 6697], JOOST: [number, number] = [6328, 6726.4], HARM: [number, number] = [6312.5, 6701.6], BRUECKE: [number, number] = [6296.6, 6700.3];
const GISBERT: [number, number] = [6562.5, 6691.5], WEIDEN: [number, number] = [6305.5, 6712.5], KREIS: [number, number] = [6242, 6734.4], EBBO: [number, number] = [6245.5, 6738.5], UFER: [number, number] = [6254.5, 6703.5];
const HILFE = ["Die Brücke nach Aschenwerth ist morsch. Welche Moorweiden taugen, weiß Gisbert Ast in den Obstwiesen. Vier neue Planken aus Moorweide – Harm hat eine Werkbank, oder er schneidet sie dir für Splitter.",
  "Für die Fugen Pech. Köhler Ulf im Nordwald brennt es dir, wenn du ihm fünf Tannenstämme bringst.",
  "Und drüben: Pass auf. Wer immer da singt, singt nicht für uns. Bring mir Ebbo, wenn du kannst. Und alles, was mir sagt, wer sie sind."];

export const QUEST_C1: QuestDef = {
  id: C1, titel: "Schwarze Federn", ort: "Rabenmoor · Köhlerlichtung · Aschenwerth", start: "Sprich mit Bertold Krähe, dem Schulzen, vor dem Langhaus in Rabenmoor.",
  logNeu: "In Rabenmoor kreisen mehr Raben, als es Aas gibt, und nachts brennen Lichter auf Aschenwerth. Bertold Krähe, der Schulze, sieht müde aus.",
  logAngeboten: "Bertold Krähe in Rabenmoor wartet, ob du nach Aschenwerth gehst.",
  logAbgabe: "Bring die Novizenkapuze zu Bertold Krähe nach Rabenmoor.",
  logFertig: "Die Brücke nach Aschenwerth trägt wieder. Ebbo ist zurück, aber wirr. Auf der Insel singt ein Orden von Rabenpriestern – und Bertold hat dir ihre Kapuze gelassen.",
  geber: "bertold",
  figuren: [
    { id: "bertold", name: "Bertold Krähe", modell: "npc.bertold", x: BERTOLD[0], y: BERTOLD[1], blick: [0, 1] },
    { id: "joost", name: "Joost", modell: "npc.joost", x: JOOST[0], y: JOOST[1], blick: [0, -1] },
    { id: "gisbert", name: "Gisbert Ast", modell: "npc.gisbert", x: GISBERT[0], y: GISBERT[1], blick: [1, 0] },
    { id: "harm", name: "Harm", modell: "npc.harm", x: HARM[0], y: HARM[1], blick: [1, 0] },
    { id: "ulf", name: "Köhler Ulf", modell: "npc.schmied", x: 6360.5, y: 6428.5, blick: [1, 0] },
    { id: "ebbo", name: "Ebbo", modell: "npc.ebbo", x: EBBO[0], y: EBBO[1], blick: [-1, 0] },
  ],
  voraussetzungen: [
    { text: "„Das rote Banner“ abgeschlossen", wenn: { quest: { id: B4, phase: ["fertig"] } } },
    { text: "Holzfällerei 35", wenn: { skill: { k: "holzfaellerei", min: 35 } } },
    { text: "Handwerk 25", wenn: { skill: { k: "handwerk", min: 25 } } },
    { text: "Heldenlevel 30", wenn: { heldenlevel: 30 } },
  ],
  schritte: [
    { id: "joost", text: "Mit Joost am Steg reden", ereignis: { art: "antwort" }, bei: "joost",
      log: "Frag Joost, den Fischer, an seinem Steg, wie man nach Aschenwerth kommt." },
    { id: "gisbert", text: "Gisbert Ast nach dem Holz fragen", ereignis: { art: "antwort" }, nach: ["joost"], bei: "gisbert",
      log: "Joost sagt, Gisbert Ast in den Obstwiesen hat damals das Holz für die Brücke geliefert. Frag ihn, welche Moorweiden taugen." },
    { id: "weiden", text: "Vier Moorweiden fällen", ereignis: { art: "sammeln", ziel: "moorweide" }, anzahl: 4, nach: ["gisbert"], wo: WEIDEN,
      log: "Fäll in Rabenmoor vier Moorweiden für neue Brückenplanken ({n:weiden})." },
    { id: "planken", text: "Harm vier Brückenplanken bringen", ereignis: { art: "antwort" }, nach: ["joost"], bei: "harm",
      log: "Schneid an Harms Werkbank vier Brückenplanken aus Moorweide (Handwerk 25) – oder kauf sie ihm ab, 40 Splitter das Stück. Harm trägt sie zur Brücke." },
    { id: "pech", text: "Meilerpech von Köhler Ulf holen", ereignis: { art: "antwort" }, nach: ["joost"], bei: "ulf",
      log: "Bring Köhler Ulf auf der Köhlerlichtung im Nordwald fünf Tannenstämme. Er brennt dir Meilerpech für die Fugen." },
    { id: "bruecke", text: "Die Brücke nach Aschenwerth flicken", ereignis: { art: "objekt", id: "c1_bruecke" }, nach: ["planken", "pech"], wo: BRUECKE,
      log: "Flick die alte Brücke nach Aschenwerth: Harms Planken liegen bereit, das Pech hast du." },
    { id: "novizen", text: "Drei Novizen am Steinkreis besiegen", ereignis: { art: "erlegen", typ: "rabenpriester_novize" }, anzahl: 3, nach: ["bruecke"], wo: KREIS,
      log: "Am Steinkreis auf Aschenwerth halten Rabenpriester Wache. Besieg drei Novizen ({n:novizen}). Sie zaubern – Fernkampf trifft sie gut." },
    { id: "ebbo", text: "Ebbo losbinden", ereignis: { art: "antwort" }, nach: ["novizen"], bei: "ebbo",
      log: "Am äußersten Menhir liegt jemand gefesselt. Bind ihn los." },
    { id: "kapuze", text: "Die Kapuze am Ufer aufheben", ereignis: { art: "objekt", id: "c1_kapuze" }, nach: ["ebbo"], wo: UFER,
      log: "Am Ufer, wo Ebbo hingelaufen ist, liegt etwas Dunkles. Heb es auf." },
  ],
  objekte: [
    { id: "c1_bruecke", name: "Morsche Brücke", x: BRUECKE[0], y: BRUECKE[1], modell: "stelle", tat: "benutzen", tatText: "Die Brücke flicken", weit: 3,
      braucht: { wenn: { hat: "meilerpech" }, text: "Harms Planken liegen bereit. Ohne Pech für die Fugen hält hier nichts." }, nehmen: [{ g: "meilerpech" }],
      text: "Du reißt die faulen Bohlen heraus, Harm reicht dir die neuen an. Pech in die Fugen, Nägel, noch mehr Pech. Als du aufstehst, trägt die Brücke – bis hinüber nach Aschenwerth.",
      schon: "Die Brücke trägt. Das Pech riecht noch.",
      sonst: [{ wenn: NEU, text: "Die alte Brücke nach Aschenwerth. Manche Bohlen fehlen, andere sind schwarz und weich." }, { wenn: FERTIG, text: "Die Brücke trägt. Drüben singt es." },
        { wenn: { offen: ["bruecke"] }, text: "Die alte Brücke nach Aschenwerth. Erst Planken und Pech." }] },
    { id: "c1_kapuze", name: "Kapuze am Ufer", x: UFER[0], y: UFER[1], modell: "stelle", tat: "aufheben", tatText: "Die Kapuze aufheben", weit: 2.5, geben: [{ g: "novizenkapuze" }],
      text: "Eine Kapuze aus schwarzen Federn, sorgfältig vernäht. Innen ist ein Zeichen eingestickt: ein Rabe über einem Kreis aus Steinen.",
      schon: "Die Kapuze hast du.", sonst: [{ wenn: NEU, text: "Schilf und schwarzer Schlamm." }, { wenn: FERTIG, text: "Schilf und schwarzer Schlamm." }, { wenn: { offen: ["kapuze"] }, text: "Schilf und schwarzer Schlamm." }] },
  ],
  /* Bertold: Schulze, schwer, bedächtig, spricht wie einer, der seinem Dorf schon zu viele schlechte Nachrichten gebracht hat. Joost: Fischer, verängstigt, redet zu schnell.
     Harm: Schmied, grob und hilfsbereit. Ulf: Köhler (aus A2), wortkarg, riecht nach Rauch. Ebbo: Torfstecher, wirr, flüstert. */
  dialoge: {
    bertold: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true, hat: "rabenbrief" }, zeilen: ["Du kommst aus Weidenhain. Othmar hat dich angekündigt.", "Was hast du da? …Zeig her."], antworten: ["brief", "banner", "spaeter"] },
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Du kommst aus Weidenhain. Othmar hat mir geschrieben – von einem Brief mit einem Raben drauf.",
          "Die Insel nimmt sich, wen sie will. Das haben unsere Großmütter gesagt, und wir haben gelacht. Joost lacht nicht mehr."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Rabenmoor hat keine guten Tage im Moment. Komm wieder, wenn du stärker bist als die Leute hier."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Ebbo schläft bei Hedda. Er redet im Schlaf. Von Steinen, die singen.", "Behalte die Kapuze. Ich glaube, wir sind noch nicht fertig mit denen."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true, hat: "novizenkapuze" }, zeilen: ["Ebbo ist zurück. Joost hat ihn zu Hedda gebracht.", "Und du – was hast du da in der Hand?"], antworten: ["kapuze_zeigen"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Ebbo sagt, am Ufer lag etwas. Eine Kapuze. Hast du sie?"], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["bruecke"] }, zeilen: ["Die Brücke trägt? Dann geh. Und komm wieder."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["planken", "pech"] }, zeilen: ["Planken und Pech. Mehr braucht die Brücke nicht. Mehr Mut braucht's, sie zu betreten."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["joost"] }, zeilen: ["Joost will nicht hinüber? Kann ich verstehen.", "Dann die Brücke. Sie ist alt, aber nicht tot."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Red mit Joost an seinem Steg. Er war der Letzte, der drüben war."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "brief", text: "Den Brief mit dem Rabensiegel zeigen.", wenn: { hat: "rabenbrief" }, folge: [{ f: { weiter: true, zeilen: ["Bertold liest ihn zweimal. Dann legt er ihn ins Torffeuer.",
          "„Die Insel wartet.“ Es gibt nur eine Insel, die so etwas schreibt. Aschenwerth. Seit Wochen brennen dort nachts Lichter. Und der Torfstecher Ebbo ist nicht vom Stich zurückgekommen."] } }] },
        { id: "banner", text: "Das rote Banner aus Rotmantels Kammer zeigen.", wenn: { hat: "rotes_banner" }, folge: [{ f: { weiter: true, zeilen: ["Bertold streicht über den roten Stoff, dann dreht er das Banner um. Auf der Rückseite, schwarz auf schwarz eingenäht: ein Rabe über einem Kreis aus Steinen.",
          "Das Zeichen kenn ich. Meine Großmutter hat es in die Türbalken geschnitzt, gegen das Böse. Rotmantel hat unter diesem Zeichen gekämpft. Er wusste es vielleicht nicht einmal."] } }] },
        { id: "annehmen", text: "Ich gehe nach Aschenwerth. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Dann red erst mit Joost am Steg. Er hat Ebbo zuletzt gesehen.",
          "Und hör nicht auf das, was du nachts vom Wasser her hörst."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Die Insel wartet, steht da. Wir auch."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "kapuze_zeigen", text: "Die Kapuze zeigen.", wenn: { hat: "novizenkapuze" }, folge: [{ f: { abschluss: true, nehmen: [{ g: "novizenkapuze" }],
          zeilen: ["Bertold dreht die Kapuze um. Das Zeichen innen. Er wird still.", "Das ist ihr Zeichen. Ein Rabe über dem Steinkreis. Meine Großmutter hat es in den Türbalken geschnitzt, gegen das Böse.",
            "Harm hat sie dir ausgebessert und verstärkt. Behalte sie – vielleicht hilft sie dir, näher heranzukommen.", "Und frag Mutter Hedda. Ebbo redet bei ihr. Sie hört zu."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Geh mit trockenen Füßen."] } }] },
      ],
    },
    joost: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["joost"] }, zeilen: ["Rüber? Nein. Nein, nein.", "Da drüben singen sie. Jede Nacht. Ich hab's gehört, ich war zu nah dran."], antworten: ["bruecke_frage"] },
        { wenn: { ...LAEUFT, erledigt: ["ebbo"] }, zeilen: ["Ebbo! Er kam über die Brücke gerannt, als wär der Teufel hinter ihm. Ich hab ihn zu Hedda gebracht."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Die Fische beißen wieder. Seit du drüben warst, ist das Singen leiser. Oder ich hör weniger hin."], antworten: ["tschuess"] },
        { zeilen: ["Fisch? Hab ich. Fragen? Lieber nicht."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "bruecke_frage", text: "Gibt es einen anderen Weg?", folge: [{ f: { erledige: ["joost"], zeilen: ["Die alte Brücke. Westlich vom Dorf. Morsch wie ein Sargdeckel.",
          "Harm könnte neue Planken machen, aus Moorweide, die fault nicht. Welche Weiden taugen, weiß Gisbert Ast in den Obstwiesen – der hat damals das Holz geliefert.", "Und Pech für die Fugen – Köhler Ulf im Nordwald hat welches.", "Aber ich geh nicht mit. Ich hab Fische zu fangen."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Geh nicht ans Wasser, wenn's singt."] } }] },
      ],
    },
    gisbert: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["joost"], offen: ["gisbert"] }, zeilen: ["Die Brücke nach Aschenwerth? Hab ich mit meinem Vater gebaut. Das Holz kam aus Rabenmoor.", "Moorweide, ja. Aber nicht jede."], antworten: ["weiden_frage", "tschuess"] },
        { zeilen: ["Äpfel? Hab ich. Fragen? Auch."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "weiden_frage", text: "Welche Moorweiden taugen?", folge: [{ f: { erledige: ["gisbert"], zeilen: ["Die alten, knorrigen am Wasser. Die jungen am Weg sind weich wie Brot.", "Klopf dran. Klingt's hell, ist's gut. Klingt's dumpf, lass es stehen. Das hat mein Vater gesagt, und er hatte nie recht – außer da."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Ein Apfel am Tag."] } }] },
      ],
    },
    harm: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["joost"], offen: ["planken"] }, zeilen: ["Planken für die alte Brücke? Joost hat's mir schon erzählt.", "Moorweide, vier Stück. Schneid sie selbst an meiner Werkbank – oder ich mach's, für Splitter."],
          antworten: ["planken_geben", "planken_kaufen", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["planken"] }, zeilen: ["Die Planken liegen an der Brücke. Fehlt nur noch Pech, dann hält das."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Die Kapuze sitzt? Hab die Nähte doppelt gemacht."], antworten: ["tschuess"] },
        { zeilen: ["Werkbank, Amboss, ein Hammer. Mehr hab ich nicht. Mehr brauch ich nicht."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "planken_geben", text: "Vier Brückenplanken übergeben.", wenn: { anzahl: { g: "brueckenplanke", min: 4 } }, folge: [{ f: { erledige: ["planken"], nehmen: [{ g: "brueckenplanke", n: 4 }],
          zeilen: ["Harm klopft auf jede Planke. Nickt. „Ordentlich.“", "Ich trag sie dir rüber zur Brücke."] } }] },
        { id: "planken_kaufen", text: "Kauf sie dir: 160 Splitter.", wenn: { anzahl: { g: "splitter", min: 160 } }, folge: [{ f: { erledige: ["planken"], nehmen: [{ g: "splitter", n: 160 }],
          zeilen: ["Gut. Ehrliche Arbeit für ehrliches Geld.", "Bis du zurück bist, liegen sie an der Brücke."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Mhm."] } }] },
      ],
    },
    ulf: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["joost"], offen: ["pech"] }, zeilen: ["Pech? Für eine Brücke im Moor?", "Fünf Tannenstämme. Dann brenn ich's dir."], antworten: ["tannen", "tschuess"] },
        { zeilen: ["Der Meiler brennt. Komm nicht zu nah."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "tannen", text: "Fünf Tannenstämme geben.", wenn: { anzahl: { g: "stamm_tanne", min: 5 } }, folge: [{ f: { erledige: ["pech"], nehmen: [{ g: "stamm_tanne", n: 5 }], geben: [{ g: "meilerpech", name: "einen Topf Meilerpech" }],
          zeilen: ["Ulf wirft die Stämme in den Meiler, als wären sie Zweige.", "Hier. Noch warm. Nicht dran riechen."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Hm."] } }] },
      ],
    },
    ebbo: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["novizen"], offen: ["ebbo"] }, zeilen: ["Ebbo liegt gefesselt am Menhir. Seine Augen sind offen, aber er sieht dich nicht.",
          "„Sie füttern den Stein … sie füttern ihn mit dem, was wir sind.“"], antworten: ["losbinden"] },
        { wenn: { erledigt: ["ebbo"] }, zeilen: ["Ebbo ist fort. Nur die Fesseln liegen noch am Stein."], antworten: ["tschuess"] },
        { zeilen: ["Am äußersten Menhir liegt jemand. Er rührt sich nicht. Die Priester stehen zwischen dir und ihm."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "losbinden", text: "Ebbo losbinden.", folge: [{ f: { erledige: ["ebbo"], zeilen: ["Kaum sind die Fesseln ab, springt Ebbo auf und rennt – zum Ufer, zur Brücke, nach Hause.",
          "Im Schilf, wo er vorbeigelaufen ist, bleibt etwas Dunkles liegen."] } }] },
        { id: "tschuess", text: "Gehen.", folge: [{ f: { zeilen: ["…"] } }] },
      ],
    },
  },
  sperren: {
    herstellen: { brueckenplanke: [{ wenn: { phase: ["neu", "fertig"] }, text: "Brückenplanken schneidest du nur für die alte Brücke." }, { wenn: { erledigt: ["planken"] }, text: "Harm hat die Planken schon." }] },
  },
  schalter: { bruecke_aschenwerth: [FERTIG, { erledigt: ["bruecke"] }] },
  belohnungText: "Belohnung: die Rabenkapuze, Magie 600, Defense 600, LP 300 XP · danach: die Brücke nach Aschenwerth trägt, Wegstein-Ziel Rabenmoor",
  belohnung: { xp: { magie: 600, defense: 600, lp: 300 }, gegenstaende: [{ g: "rabenkapuze" }] },
  punkte: 1,
};
