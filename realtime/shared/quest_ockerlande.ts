/*
 * Riftmere – Block I (Phase 12, die Ockerlande), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-12.md, Kurzfassung der Rolle Quests – vom Nutzer freigegeben (27.11.; statt eines Eimers ein Krug, Boss die Ockermutter).
 * Stellen aus Welts Bau (#172, 9187427c: welt/ockerlande_orte.json, welt/festland/plan_ockerlande.json): Rotlehm am Ockerstrom (Karawanenhof 6800 | 7315, Lehmfeste 6890 | 7315),
 * Brunnenkreis (7070 | 7186), Dornhag hinter der Dornenhecke (7291 | 7405), Tafelrast am Roten Tisch (7491 | 7519) mit Steinbruch, Höhle im Roten Tisch (Unterwelt ockerhoehle, ab 11936 | 9600).
 *  I1 „Die Karawanenstraße“ (nach F1): Ruben Weit in Sandquell vermisst eine Karawane · QUER Selma Dornfeld in Glutbrunn · Brunnenwächter am Brunnenkreis · zwei Rastfeuer · drei Ockerhyänen am Wagen · Karawanenmeisterin in Rotlehm.
 *  I2 „Wasser für Dornhag“ (nach I1): Hirtin Malika · QUER Ayla Dünenruh, Quellwächterin in Sandquell · drei Lehmklumpen aus dem Brunnen (Bergbau) · Krug füllen, Tränke · vier Ziegen vom Akazienhain zurück.
 *  I3 „Der Tafelberg“ (nach I1): Steinbrecherin Rahel · Lore aufs Gleis (Handwerk) · zwei Sterneisen im Steinbruch · Inschrift in der Höhle · QUER Hasim Tal (F3) liest sie: „die Mutter unter der Kanzel“.
 *  I4 „Die Ockermutter“ (Boss, nach I2 und I3): Entwurf, bis es die Ockermutter (Systeme/Figuren) und ihren Bau als Instanz (Welt) gibt.
 * Namen (Vorschlag Quests): Karawanenmeisterin Nadira Sandweg, Brunnenwächter Tarik, Hirtin Malika Dorn, Steinbrecherin Rahel Keil, Hauptfrau Imara Lehm.
 * Keine neuen Gegenstände (Krug, Wasserkrug, Sterneisenerz gibt es). Das Wegstein-Ziel Rotlehm (Systeme) nennen die Texte erst, wenn es das gibt.
 */
import type { QuestDef, Bed, QuestFigur, Voraussetzung, Option, Rede } from "./questbau";

type Feld = [number, number];
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const tschuess = (zeile: string): Option => ({ id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: [zeile] } }] });

export const I1 = "ockerlande_die_karawanenstrasse", I2 = "ockerlande_wasser_fuer_dornhag", I3 = "ockerlande_der_tafelberg", I4 = "ockerlande_die_ockermutter";
const F1 = "glutsande_ende_des_grases", F3 = "glutsande_versandeter_tempel";
const nach = (id: string, text: string): Voraussetzung => ({ text: `„${text}“ abgeschlossen`, wenn: { quest: { id, phase: ["fertig"] } } });

/* ───── Stellen ───── */
export const OCKER = {
  rastfeuer: [[7067.5, 7094.5], [6963.5, 7259.5]] as Feld[],
  wagen: [6966.5, 7232.5] as Feld, hyaenen: [6972, 7226] as Feld,
  brunnen: [7294.5, 7400.5] as Feld, lehm: [[7293.5, 7399.5], [7295.5, 7399.5], [7294.5, 7401.5]] as Feld[], traenke: [7310.5, 7403.5] as Feld, gatter: [7312.5, 7404.5] as Feld,
  ziegen: [[7344.5, 7456.5], [7356.5, 7462.5], [7349.5, 7468.5], [7360.5, 7452.5]] as Feld[],                     /* Akazienhain südöstlich von Dornhag */
  im_gehege: [[7318.5, 7398.5], [7321.5, 7402.5], [7318.5, 7406.5], [7322.5, 7410.5]] as Feld[],
  lore: [7513.5, 7563.5] as Feld, steinbruch: [7516.5, 7516.5] as Feld, hoehle_eingang: [7552, 7587.7] as Feld, inschrift: [11952.5, 9609.5] as Feld,
};

/* ───── Figuren ───── */
const RUBEN: QuestFigur = { id: "ruben", name: "Ruben Weit", modell: "npc.karawane", x: 7370, y: 6759.6, blick: [0, -1] };          /* troedler_sandquell (Karawanenlager) */
const AYLA: QuestFigur = { id: "ayla", name: "Ayla Dünenruh", modell: "npc.glutbrunn_frau", x: 7386, y: 6745, blick: [0, 1] };       /* sandquell_quelle */
const SELMA: QuestFigur = { id: "selma", name: "Selma Dornfeld", modell: "npcfrau3d", x: 7142, y: 6970, blick: [0, 1] };            /* F1 */
const HASIM: QuestFigur = { id: "hasim", name: "Hasim Tal", modell: "npcmann3d", x: 7114.5, y: 6698, blick: [0, -1] };            /* F3 */
const NADIRA: QuestFigur = { id: "nadira", name: "Karawanenmeisterin Nadira Sandweg", modell: "npc.karawane", x: 6796, y: 7309, blick: [0, 1] };
const TARIK: QuestFigur = { id: "tarik", name: "Brunnenwächter Tarik", modell: "npc.glutbrunn_mann", x: 7072, y: 7185.5, blick: [0, 1] };
const MALIKA: QuestFigur = { id: "malika", name: "Hirtin Malika Dorn", modell: "npc.glutbrunn_frau", x: 7288, y: 7408.5, blick: [0, 1] };
const RAHEL: QuestFigur = { id: "rahel", name: "Steinbrecherin Rahel Keil", modell: "npc.bergfrau", x: 7490, y: 7520.5, blick: [0, 1] };
const IMARA: QuestFigur = { id: "imara", name: "Hauptfrau Imara Lehm", modell: "stadtwache3d", x: 6888.5, y: 7306.5, blick: [0, 1] };

/* ══════════════ I1 „Die Karawanenstraße“ ══════════════ */
const RAST = ["rast_1", "rast_2"];
export const QUEST_I1: QuestDef = {
  id: I1, titel: "Die Karawanenstraße", ort: "Sandquell · Glutbrunn · Brunnenkreis · Ockerlande · Rotlehm", start: "Sprich mit Ruben Weit im Karawanenlager von Sandquell.",
  logNeu: "Im Karawanenlager von Sandquell wartet ein Karawanenmeister auf eine Karawane, die längst zurück sein müsste.",
  logAngeboten: "Ruben Weit vermisst seine Karawane nach Rotlehm.",
  logAbgabe: "Du hast den zerbrochenen Wagen gefunden. Bring die Nachricht nach Rotlehm, zu Karawanenmeisterin Nadira Sandweg.",
  logFertig: "Die Karawanenstraße in die Ockerlande ist wieder sicher – fürs Erste. In Rotlehm kennt man jetzt deinen Namen.",
  geber: "ruben", abgabe: "nadira",
  figuren: [RUBEN, SELMA, TARIK, NADIRA],
  voraussetzungen: [nach(F1, "Ende des Grases"), { text: "Heldenlevel 45", wenn: { heldenlevel: 45 } }],
  schritte: [
    { id: "selma", text: "Selma Dornfeld in Glutbrunn nach der Route fragen", ereignis: { art: "antwort" }, bei: "selma",
      log: "Ruben sagt, Selma Dornfeld in Glutbrunn habe die Karawane als Letzte gesehen. Frag sie nach der Route." },
    { id: "tarik", text: "Den Brunnenwächter am Brunnenkreis fragen", ereignis: { art: "antwort" }, nach: ["selma"], bei: "tarik",
      log: "Die Karawane wollte am Brunnenkreis Wasser fassen. Frag den Brunnenwächter, ob sie dort war." },
    ...RAST.map((id, i) => ({ id, text: "Die Rastfeuer an der Karawanenstraße untersuchen", ereignis: { art: "objekt" as const, id: "i1_" + id }, nach: ["tarik"], gruppe: "rast", wo: OCKER.rastfeuer[i],
      log: "Folg der Karawanenstraße nach Süden und untersuch die Rastfeuer der Karawane ({n:rast})." })),
    { id: "hyaenen", text: "Drei Ockerhyänen am Wagen vertreiben", ereignis: { art: "erlegen", typ: "ockerhyaene" }, anzahl: 3, nach: RAST, wo: OCKER.hyaenen,
      log: "Hinter dem letzten Rastfeuer liegt ein zerbrochener Wagen – und Ockerhyänen streifen darum herum. Vertreib drei ({n:hyaenen})." },
    { id: "wagen", text: "Den zerbrochenen Wagen untersuchen", ereignis: { art: "objekt", id: "i1_wagen" }, nach: ["hyaenen"], wo: OCKER.wagen,
      log: "Sieh dir den Wagen an. Was ist mit der Karawane geschehen?" },
  ],
  objekte: [
    ...RAST.map((id, i) => ({ id: "i1_" + id, name: "Rastfeuer", x: OCKER.rastfeuer[i][0], y: OCKER.rastfeuer[i][1], modell: "stelle", tat: "untersuchen" as const, tatText: "Das Rastfeuer untersuchen", weit: 2.5,
      text: ["Die Asche ist kalt, aber nicht alt. Kamelspuren, ein verlorener Glockenriemen mit Rubens Zeichen. Sie waren hier.",
        "Hier ist hastig aufgebrochen worden: ein umgestürzter Topf, Dattelkerne im Sand. Und Pfotenabdrücke, so groß wie eine Hand."][i] + " ({n:rast})",
      schon: "Dieses Rastfeuer hast du gesehen.", sonst: [{ wenn: NEU, text: "Ein alter Rastplatz. Asche und Dattelkerne." }, { wenn: FERTIG, text: "Ein alter Rastplatz." }] })),
    { id: "i1_wagen", name: "Zerbrochener Wagen", x: OCKER.wagen[0], y: OCKER.wagen[1], modell: "stelle", tat: "untersuchen", tatText: "Den Wagen untersuchen", weit: 3,
      text: "Ein Rad gebrochen, die Plane zerrissen. Die Ladung ist fort, aber keine Spur von Blut. Im Sand: Kamelspuren nach Süden, nach Rotlehm. Sie sind weitergezogen – ohne den Wagen.",
      schon: "Den Wagen hast du untersucht.", sonst: [{ wenn: NEU, text: "Ein zerbrochener Wagen im Lehm." }, { wenn: FERTIG, text: "Der Wagen ist ausgeschlachtet." }, { wenn: { offen: ["hyaenen"] }, text: "Die Hyänen lassen dich nicht an den Wagen heran." }] },
  ],
  /* Ruben: Karawanenmeister, rechnet in Kamelen, sorgt sich um seine Leute. Selma: wie in F1, nüchtern. Tarik: Brunnenwächter, wortkarg. Nadira: Karawanenmeisterin in Rotlehm, stolz, herzlich. */
  dialoge: {
    ruben: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Zwölf Kamele, sechs Treiber, Salz und Glas für Rotlehm. Vor drei Wochen los. Sie sollten längst zurück sein.",
          "Ich kann das Lager nicht verlassen. Aber du kannst die Straße hinunter."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Alles, was sich auf ein Tier packen lässt, nehme ich. Zum halben Preis – die Reise ist lang."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Sie sind angekommen! Ohne Wagen, aber angekommen. Nadira hat mir einen Boten geschickt. Danke."], antworten: ["tschuess"] },
        { zeilen: ["Erst Selma in Glutbrunn, dann der Brunnenkreis, dann die Straße nach Süden. Rotlehm liegt am Strom."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich suche die Karawane. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Gut. Frag zuerst Selma Dornfeld in Glutbrunn – sie hat sie zuletzt gesehen.",
          "Dann geht's über den Brunnenkreis nach Süden, die Karawanenstraße entlang bis nach Rotlehm. Dort wartet Nadira Sandweg auf meine Leute."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Die Dünen warten. Meine Leute hoffentlich auch."] } }] },
        tschuess("Möge der Wind dir den Rücken kühlen."),
      ],
    },
    selma: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["selma"] }, zeilen: ["Rubens Karawane? Die war hier, vor drei Wochen. Hat Wasser gefasst und ist weiter."], antworten: ["route_fragen", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["selma"] }, zeilen: ["Brunnenkreis, dann die Straße hinab. Pass auf die Hyänen auf."], antworten: ["tschuess"] },
        { zeilen: ["Glutbrunn hält. Mehr kann man von einem Brunnen nicht verlangen."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "route_fragen", text: "Welchen Weg wollten sie nehmen?", folge: [{ f: { erledige: ["selma"], zeilen: ["Den alten. Über den Brunnenkreis und dann die Karawanenstraße nach Süden, in die Ockerlande.",
          "Der Treiber hat gesagt, unterwegs seien Hyänen. Viele. Die rote Erde da unten ist kein Ort für einen zerbrochenen Wagen."] } }] },
        tschuess("Geh mit Wasser."),
      ],
    },
    tarik: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["selma"], offen: ["tarik"] }, zeilen: ["Wasser kostet nichts. Fragen schon."], antworten: ["karawane_fragen", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["tarik"] }, zeilen: ["Die Straße nach Süden. An den Rastfeuern sieht man, wer vorbeikam."], antworten: ["tschuess"] },
        { zeilen: ["Brunnenkreis. Ein Wasserloch und ein Kreis aus Zelten. Wer hier trinkt, zieht weiter."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "karawane_fragen", text: "Rubens Karawane aus Sandquell – war sie hier?", folge: [{ f: { erledige: ["tarik"], zeilen: ["Tarik nickt. „Zwölf Kamele. Sie haben getrunken und sind nach Süden. Schnell. Zu schnell.“",
          "„Nachts hörten wir die Hyänen. Die Straße hinunter. Geh den Rastfeuern nach.“"] } }] },
        tschuess("Trink, bevor du gehst."),
      ],
    },
    nadira: {
      reden: [
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Du kommst von der Straße? Mit Staub bis an die Knie. Was hast du gesehen?"], antworten: ["bericht"] },
        { wenn: LAEUFT, zeilen: ["Eine Karawane aus Sandquell? …Wenn du sie findest, sag es mir zuerst."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Rubens Leute sind hier. Die Kamele trinken am Strom, die Treiber schlafen. Rotlehm schuldet dir einen Becher."], antworten: ["tschuess"] },
        { zeilen: ["Der Karawanenhof von Rotlehm. Wer hier ankommt, hat die Ockerlande überlebt."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "bericht", text: "Der Wagen liegt zerbrochen an der Straße, aber die Kamelspuren führen hierher.", folge: [{ f: { abschluss: true,
          zeilen: ["Nadira lacht laut auf. „Dann sind es Rubens Leute! Sie kamen vor drei Tagen, halb verdurstet, ohne Wagen. Sie dachten, er würde sie für tot halten.“",
          "„Ich schicke einen Boten nach Sandquell. Und dir, Wanderer, gehört das Gastrecht im Karawanenhof.“"] } }] },
        tschuess("Wasser und Schatten."),
      ],
    },
  },
  glueckwunsch: "Zwölf Kamele, sechs Treiber – alle da. Rotlehm grüßt dich, Wanderer.",
  belohnungText: "Belohnung: Stärke 1.500, Geschick 1.500 XP, 400 Splitter",
  belohnung: { xp: { staerke: 1500, geschick: 1500 }, splitter: 400 },
  punkte: 1,
};

/* ══════════════ I2 „Wasser für Dornhag“ ══════════════ */
const LEHM = ["lehm_1", "lehm_2", "lehm_3"];
const ZIEGEN = ["ziege_1", "ziege_2", "ziege_3", "ziege_4"];
const ZNAMEN = ["Rotohr", "die Fleckige", "Bock", "die Kleine"];
const ZIEGE_FIG: QuestFigur[] = ZIEGEN.map((id, i) => { const [x, y] = OCKER.ziegen[i];
  return { id: "dornhag_" + id, name: `Ziege (${ZNAMEN[i]})`, modell: "ziege3d", x, y, blick: [0, 1], folgt: { wenn: { erledigt: [id], offen: ["gatter"] }, abstand: 1.5 + i * 0.6 },
    beiseite: { wenn: { erledigt: ["gatter"] }, dx: OCKER.im_gehege[i][0] - x, dy: OCKER.im_gehege[i][1] - y, blick: [0, 1] } }; });
export const QUEST_I2: QuestDef = {
  id: I2, titel: "Wasser für Dornhag", ort: "Dornhag · Sandquell · Akazienhain", start: "Sprich mit Hirtin Malika Dorn in Dornhag.",
  logNeu: "In Dornhag steht ein Brunnen voller Lehm, und die Hirtin zählt Ziegen, die nicht da sind.",
  logAngeboten: "Hirtin Malika Dorn braucht Wasser – und ihre Ziegen zurück.",
  logAbgabe: "Der Brunnen gibt Wasser, die Tränke ist voll, die Ziegen sind zurück. Sag Malika Bescheid.",
  logFertig: "Dornhag hat wieder Wasser. Hinter der Dornenhecke trinken die Herden – und die Hyänen müssen draußen bleiben.",
  geber: "malika",
  figuren: [MALIKA, AYLA, ...ZIEGE_FIG],
  voraussetzungen: [nach(I1, "Die Karawanenstraße"), { text: "Bergbau 30", wenn: { skill: { k: "bergbau", min: 30 } } }],
  schritte: [
    { id: "ayla", text: "Ayla Dünenruh in Sandquell um Rat fragen", ereignis: { art: "antwort" }, bei: "ayla",
      log: "Malika sagt, niemand verstehe sich so auf Quellen wie Ayla Dünenruh, die Quellwächterin von Sandquell. Frag sie, wie man einen versandeten Brunnen öffnet." },
    ...LEHM.map((id, i) => ({ id, text: "Den Lehm aus dem Brunnen hacken", ereignis: { art: "objekt" as const, id: "i2_" + id }, nach: ["ayla"], gruppe: "lehm", wo: OCKER.lehm[i],
      log: "Ayla sagt: von unten nach oben, nie von der Seite. Hack drei Lehmklumpen aus dem Brunnen von Dornhag ({n:lehm})." })),
    { id: "traenke", text: "Die Tränke mit Wasser füllen", ereignis: { art: "objekt", id: "i2_traenke" }, nach: LEHM, wo: OCKER.traenke,
      log: "Der Brunnen gibt wieder Wasser. Füll einen Krug und gieß ihn in die Tränke am Gehege." },
    ...ZIEGEN.map((id, i) => ({ id, text: "Die Ziegen vom Akazienhain zurücklocken", ereignis: { art: "antwort" as const }, nach: ["traenke"], bei: "dornhag_" + id, gruppe: "ziegen", wo: OCKER.ziegen[i],
      log: "Die Ziegen sind zum Akazienhain südöstlich von Dornhag gezogen, auf der Suche nach Wasser. Lock sie zurück ({n:ziegen})." })),
    { id: "gatter", text: "Das Gatter an der Dornenhecke schließen", ereignis: { art: "objekt", id: "i2_gatter" }, nach: ZIEGEN, wo: OCKER.gatter,
      log: "Alle vier laufen hinter dir. Bring sie durch das Gatter in der Dornenhecke und schließ es." },
  ],
  objekte: [
    ...LEHM.map((id, i) => ({ id: "i2_" + id, name: "Lehm im Brunnen", x: OCKER.lehm[i][0], y: OCKER.lehm[i][1], modell: "stelle", tat: "benutzen" as const, tatText: "Den Lehm heraushacken", weit: 2.5,
      braucht: { wenn: { skill: { k: "bergbau", min: 30 } }, text: "Der Lehm ist hart wie Stein. Dafür braucht es eine Hacke und Übung (Bergbau 30)." },
      text: ["Ein Brocken, so schwer wie ein Lamm. Darunter feuchter Sand.", "Der zweite Klumpen bricht in Stücken. Es riecht nach Wasser.", "Der letzte Klumpen löst sich – und dunkles Wasser steigt im Schacht."][i] + " ({n:lehm})",
      schon: "Hier ist der Lehm schon heraus.", sonst: [{ wenn: NEU, text: "Ein Brunnen voller Lehm." }, { wenn: FERTIG, text: "Der Brunnen gibt Wasser." }, { wenn: { offen: ["ayla"] }, text: "Wo anfangen? Von oben bricht nur der Rand ein." }] })),
    { id: "i2_traenke", name: "Tränke am Gehege", x: OCKER.traenke[0], y: OCKER.traenke[1], modell: "stelle", tat: "benutzen", tatText: "Wasser in die Tränke gießen", weit: 2.5,
      braucht: { wenn: { hat: "krug" }, text: "Womit willst du das Wasser tragen? Ein leerer Krug täte es." },
      nehmen: [{ g: "krug" }],
      text: "Du schöpfst am Brunnen, trägst, gießt. Wieder und wieder. Dann steht die Tränke voll, und der Krug ist so zerschunden, dass du ihn neben der Tränke stehen lässt.",
      schon: "Die Tränke ist voll.", sonst: [{ wenn: NEU, text: "Eine leere Tränke." }, { wenn: FERTIG, text: "Die Tränke ist voll." }, { wenn: { offen: LEHM }, text: "Erst muss der Brunnen wieder Wasser geben." }] },
    { id: "i2_gatter", name: "Gatter in der Dornenhecke", x: OCKER.gatter[0], y: OCKER.gatter[1], modell: "stelle", tat: "benutzen", tatText: "Das Gatter schließen", weit: 3,
      braucht: { wenn: { erledigt: ZIEGEN }, text: "Noch nicht alle da." },
      text: "Vier Ziegen drängen durch das Gatter zur Tränke. Du ziehst die Dornenranken davor zu.", schon: "Das Gatter ist zu.",
      sonst: [{ wenn: NEU, text: "Ein Gatter aus Dornen." }, { wenn: FERTIG, text: "Das Gatter ist zu." }, { wenn: { offen: ["gatter"] }, text: "Noch nicht alle da." }] },
  ],
  /* Malika: Hirtin, rau, fürsorglich, flucht auf die Hyänen. Ayla: Quellwächterin, ernst, ehrt das Wasser. */
  dialoge: {
    ...Object.fromEntries(ZIEGEN.map((id, i) => ["dornhag_" + id, {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["traenke"], offen: [id] }, zeilen: ["Mähäh."], antworten: ["locken"] } as Rede,
        { wenn: { ...LAEUFT, offen: ["gatter"], erledigt: [id] }, zeilen: [`${ZNAMEN[i]} trottet dir nach, die Nase im Wind. Sie riecht das Wasser.`], antworten: ["tschuess"] } as Rede,
        { zeilen: ["Mähäh."], antworten: ["tschuess"] } as Rede,
      ],
      optionen: [
        { id: "locken", text: "Locken. (Mit Wasser spritzen)", folge: [{ f: { erledige: [id], zeilen: [`${ZNAMEN[i]} riecht das Wasser an deinen Händen und kommt mit. ({n:ziegen})`] } }] } as Option,
        { id: "tschuess", text: "Weitergehen.", folge: [{ f: { zeilen: ["Mähäh."] } }] } as Option,
      ],
    }])),
    malika: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Der Brunnen ist versandet. Lehm, so hart wie Stein. Seit Wochen holen wir Wasser vom Loch draußen – und draußen sind die Hyänen.",
          "Meine Ziegen sind abgehauen, zum Akazienhain. Da gibt's Tau. Und Hyänen."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Hinter den Dornenhecken sind die Herden sicher. Meistens."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Wasser! Jeden Morgen frisches Wasser. Die Ziegen werden fett und frech."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Rotohr ist zurück? Alle vier? Und Wasser in der Tränke?"], antworten: ["fertig"] },
        { zeilen: ["Erst Ayla in Sandquell fragen. Dann der Lehm. Dann die Tränke. Dann die Ziegen."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich helfe dir. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Gut. Aber hack nicht einfach drauflos – wer falsch hackt, schüttet den Schacht zu.",
          "Frag Ayla Dünenruh in Sandquell. Die Quellwächterin. Sie weiß, wie man Wasser bittet, zurückzukommen.", "Und nimm einen Krug mit. Die Tränke füllt sich nicht von allein."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Dann holen wir weiter Wasser draußen. Und zählen die Hyänen."] } }] },
        { id: "fertig", text: "Der Brunnen gibt Wasser, und die Ziegen sind zurück.", folge: [{ f: { abschluss: true, zeilen: ["Malika schöpft eine Handvoll aus der Tränke und trinkt. Dann lacht sie.",
          "Süß. Das Wasser ist süß. Dornhag dankt dir – und die Ziegen auch, auf ihre Art."] } }] },
        tschuess("Halt dich von den Hyänen fern."),
      ],
    },
    ayla: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["ayla"] }, zeilen: ["Ein Brunnen in den Ockerlanden? Versandet?", "Erzähl."], antworten: ["rat_fragen", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["ayla"] }, zeilen: ["Von unten nach oben. Nie von der Seite. Und dank dem Wasser, wenn es kommt."], antworten: ["tschuess"] },
        { zeilen: ["Die Quelle gehört niemandem. Darum wache ich über sie."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "rat_fragen", text: "Wie öffnet man einen versandeten Brunnen?", folge: [{ f: { erledige: ["ayla"],
          zeilen: ["Ayla schweigt eine Weile. „Lehm sinkt, Sand fließt. Wer von der Seite gräbt, lässt den Rand nachrutschen.“",
          "„Hack von unten nach oben, einen Klumpen nach dem anderen. Drei, vielleicht vier. Dann kommt das Wasser von selbst.“", "„Und wenn es kommt – trink nicht zuerst. Gib es den Tieren.“"] } }] },
        tschuess("Geh mit Wasser."),
      ],
    },
  },
  glueckwunsch: "Süßes Wasser in Dornhag. Die Herden trinken, und die Hyänen bleiben draußen.",
  belohnungText: "Belohnung: Bergbau 1.200, Handwerk 600 XP, 300 Splitter",
  belohnung: { berufe: { bergbau: 1200, handwerk: 600 }, splitter: 300 },
  punkte: 1,
};

/* ══════════════ I3 „Der Tafelberg“ ══════════════ */
export const QUEST_I3: QuestDef = {
  id: I3, titel: "Der Tafelberg", ort: "Tafelrast · Roter Tisch · Glutsande", start: "Sprich mit Steinbrecherin Rahel Keil in Tafelrast.",
  logNeu: "In Tafelrast stehen die Steinbrecher um eine umgekippte Lore und schauen zum Roten Tisch hinauf.",
  logAngeboten: "Steinbrecherin Rahel Keil hat am Roten Tisch etwas gefunden.",
  logAbgabe: "Hasim hat die Inschrift gelesen. Bring Rahel Keil in Tafelrast, was sie sagt.",
  logFertig: "Der Steinbruch am Roten Tisch arbeitet wieder, und die Höhle ist kein Geheimnis mehr. Nur die Warnung an der Wand bleibt: die Mutter unter der Kanzel.",
  geber: "rahel",
  figuren: [RAHEL, HASIM],
  voraussetzungen: [nach(I1, "Die Karawanenstraße"), { text: "Bergbau 40", wenn: { skill: { k: "bergbau", min: 40 } } }, { text: "Handwerk 25", wenn: { skill: { k: "handwerk", min: 25 } } },
    nach(F3, "Der versandete Tempel")],
  schritte: [
    { id: "lore", text: "Die Lore wieder aufs Gleis setzen", ereignis: { art: "objekt", id: "i3_lore" }, wo: OCKER.lore,
      log: "Am Fuß des Roten Tisches liegt eine Lore neben dem Gleis. Setz sie wieder auf (Handwerk 25)." },
    { id: "erz", text: "Zwei Sterneisen im Steinbruch abbauen", ereignis: { art: "sammeln", ziel: "sterneisen" }, anzahl: 2, nach: ["lore"], wo: OCKER.steinbruch,
      log: "Rahel will wissen, ob der Steinbruch noch gutes Erz gibt. Bau im Steinbruch am Roten Tisch zwei Sterneisen ab ({n:erz})." },
    { id: "inschrift", text: "Die Inschrift in der Höhle im Roten Tisch abschreiben", ereignis: { art: "objekt", id: "i3_inschrift" }, nach: ["erz"], wo: OCKER.inschrift,
      log: "Beim Sprengen hat sich in der Südflanke des Roten Tisches eine Höhle geöffnet. Drinnen glänzt Ureisen – und an der Wand steht eine Inschrift. Schreib sie ab." },
    { id: "hasim", text: "Hasim Tal die Inschrift lesen lassen", ereignis: { art: "antwort" }, nach: ["inschrift"], bei: "hasim",
      log: "Die Zeichen sind dieselben wie im versandeten Tempel der Glutsande. Hasim Tal kann sie lesen." },
  ],
  objekte: [
    { id: "i3_lore", name: "Umgekippte Lore", x: OCKER.lore[0], y: OCKER.lore[1], modell: "stelle", tat: "benutzen", tatText: "Die Lore aufrichten", weit: 3,
      braucht: { wenn: { skill: { k: "handwerk", min: 25 } }, text: "Die Achse ist verbogen. Ohne Geschick und das richtige Werkzeug kippt sie gleich wieder (Handwerk 25)." },
      text: "Du klopfst die Achse gerade, keilst das Rad und stemmst die Lore zurück aufs Gleis. Sie rollt. Quietschend, aber sie rollt.", schon: "Die Lore steht auf dem Gleis.",
      sonst: [{ wenn: NEU, text: "Eine Lore, umgekippt neben dem Gleis." }, { wenn: FERTIG, text: "Die Lore steht auf dem Gleis." }] },
    { id: "i3_inschrift", name: "Inschrift an der Höhlenwand", x: OCKER.inschrift[0], y: OCKER.inschrift[1], modell: "stelle", tat: "untersuchen", tatText: "Die Inschrift abschreiben", weit: 2.5,
      text: "Zeichen, tief in den roten Fels geschnitten, zwischen den schwarzen Adern des Ureisens. Dieselben Haken und Wellen wie im Tempel der Glutsande. Du schreibst sie Zeile für Zeile ab.",
      schon: "Die Inschrift hast du abgeschrieben.", sonst: [{ wenn: NEU, text: "Kratzer im Fels." }, { wenn: FERTIG, text: "Die Inschrift. Jetzt weißt du, was sie sagt." }, { wenn: { offen: ["erz"] }, text: "Kratzer im Fels. Rahel sollte erst wissen, ob der Bruch noch taugt." }] },
  ],
  /* Rahel: Steinbrecherin, kräftig, nüchtern, abergläubisch nur, wenn's ums Gestein geht. Hasim: wie in F3, Gelehrter, spricht leise. */
  dialoge: {
    rahel: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Wir haben am Roten Tisch gesprengt. Die Lore ist umgekippt, und die Flanke ist aufgerissen. Dahinter: eine Höhle.",
          "Meine Leute gehen nicht rein. Sie sagen, da glänzt es schwarz. Und an der Wand steht etwas."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Wer zum Roten Tisch hinauf will, rastet hier – und wer vom Tisch kommt, braucht hier ein Bier."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Ureisen. Im Roten Tisch. Und eine Warnung, die keiner versteht. Wir graben trotzdem – aber nicht unter der Kanzel."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Und? Was sagt der Gelehrte?"], antworten: ["fertig"] },
        { zeilen: ["Erst die Lore. Dann zwei Brocken Sterneisen aus dem Bruch. Dann – wenn du dich traust – die Höhle."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich sehe mir die Höhle an. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Gut. Aber erst die Lore, sonst kommt kein Stein mehr den Hang hinunter.",
          "Dann bau mir zwei Sterneisen ab – ich will wissen, ob der Bruch noch taugt. Und dann die Höhle, an der Südflanke. Schreib ab, was an der Wand steht."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Die Höhle läuft nicht weg. Hoffe ich."] } }] },
        { id: "fertig", text: "Hasim sagt: „Unter der Kanzel schläft die Mutter. Weckt sie nicht.“", folge: [{ f: { abschluss: true,
          zeilen: ["Rahel wird blass unter dem roten Staub. „Die Kanzel. Die Ockerkanzel. Da verschwinden seit Wochen Ziegen aus Dornhag.“",
          "„Gut. Wir graben am Tisch, nicht an der Kanzel. Und du – du hast uns Ureisen gebracht. Das vergisst Tafelrast nicht.“"] } }] },
        tschuess("Glück im Bruch."),
      ],
    },
    hasim: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["inschrift"], offen: ["hasim"] }, zeilen: ["Du bringst mir Zeichen? Aus den Ockerlanden? …Zeig."], antworten: ["lesen_lassen", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["hasim"] }, zeilen: ["Die Mutter unter der Kanzel. Ich wünschte, ich hätte es falsch gelesen."], antworten: ["tschuess"] },
        { zeilen: ["Der Sand hat den Tempel genommen. Er gibt ihn nur zögernd zurück."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "lesen_lassen", text: "Eine Inschrift aus einer Höhle im Roten Tisch.", folge: [{ f: { erledige: ["hasim"],
          zeilen: ["Hasim liest, die Lippen bewegen sich. Dann liest er noch einmal.", "„Hier liegt das schwarze Eisen, das der Berg nicht hergibt. Wer es nimmt, nehme wenig.“",
          "„Und darunter: Unter der Kanzel schläft die Mutter. Weckt sie nicht. Ihre Kinder sind viele.“", "Die Kanzel … das muss die Ockerkanzel sein. Der Tafelberg westlich davon. Sei vorsichtig, Wanderer."] } }] },
        tschuess("Geh mit dem Wind."),
      ],
    },
  },
  glueckwunsch: "Ureisen im Roten Tisch und eine Warnung aus alter Zeit. Tafelrast dankt dir – und hört auf Hasim.",
  belohnungText: "Belohnung: Bergbau 1.500, Handwerk 600 XP, 400 Splitter",
  belohnung: { berufe: { bergbau: 1500, handwerk: 600 }, splitter: 400 },
  punkte: 1,
};

/* ══════════════ I4 „Die Ockermutter“ (Boss, Entwurf) ══════════════ */
const SPUREN: Feld[] = [[7300.5, 7440.5], [7210.5, 7490.5], [7135.5, 7532.5]];     /* von Dornhag zur Ockerkanzel */
const BAU: Feld = [7120.5, 7546.5];                                                 /* am Aufgang der Ockerkanzel (Welt: Eingang des Baus) */
const SP = ["spur_1", "spur_2", "spur_3"];
export const QUEST_I4: QuestDef = {
  id: I4, titel: "Die Ockermutter", ort: "Dornhag · Ockerkanzel · Rotlehm", start: "Sprich mit Hauptfrau Imara Lehm an der Lehmfeste von Rotlehm.",
  logNeu: "An der Lehmfeste von Rotlehm hängt eine Liste: gerissene Ziegen, verschwundene Kamele. Daneben ein Name, mit Ocker geschrieben.",
  logAngeboten: "Hauptfrau Imara Lehm sucht jemanden, der sich der Ockermutter stellt.",
  logAbgabe: "Die Ockermutter ist besiegt. Geh zurück zu Hauptfrau Imara Lehm in Rotlehm.",
  logFertig: "Die Ockermutter ist besiegt – fürs Erste. Ihre Kinder streifen noch durch die Steppe, und eines Tages kehrt sie zurück, größer als zuvor.",
  geber: "imara",
  figuren: [IMARA, MALIKA],
  voraussetzungen: [nach(I2, "Wasser für Dornhag"), nach(I3, "Der Tafelberg"), { text: "Heldenlevel 55", wenn: { heldenlevel: 55 } }],
  schritte: [
    { id: "malika", text: "Malika in Dornhag nach den gerissenen Ziegen fragen", ereignis: { art: "antwort" }, bei: "malika",
      log: "Imara sagt, in Dornhag verschwinden die Ziegen. Frag Hirtin Malika, wo sie zuletzt gesehen wurden." },
    ...SP.map((id, i) => ({ id, text: "Den Spuren zur Ockerkanzel folgen", ereignis: { art: "objekt" as const, id: "i4_" + id }, nach: ["malika"], gruppe: "spuren", wo: SPUREN[i],
      log: "Von Dornhag führen Spuren nach Südwesten, zur Ockerkanzel. Folg ihnen ({n:spuren})." })),
    { id: "mutter", text: "Die Ockermutter in ihrem Bau besiegen", ereignis: { art: "erlegen", typ: "ockermutter" }, nach: SP, wo: BAU,
      log: "Unter der Ockerkanzel liegt der Bau der Ockermutter. Du gehst allein hinein. Weich ihrem Rundumschlag aus; wenn sie heult, ruft sie ihr Rudel. Nach ihrem Sprung ist sie kurz benommen – dann schlag zu." },
  ],
  objekte: SP.map((id, i) => ({ id: "i4_" + id, name: "Spuren", x: SPUREN[i][0], y: SPUREN[i][1], modell: "stelle", tat: "untersuchen" as const, tatText: "Die Spuren untersuchen", weit: 2.5,
    text: ["Ziegenhaare im Dornbusch. Und daneben ein Abdruck, groß wie ein Teller.", "Eine Schleifspur im Lehm. Etwas wurde hier gezogen, nach Südwesten.", "Knochen am Fuß der Kanzel. Viele. Und ein Loch im Fels, aus dem es warm herausatmet."][i] + " ({n:spuren})",
    schon: "Diese Spur kennst du.", sonst: [{ wenn: NEU, text: "Lehm und Dornen." }, { wenn: FERTIG, text: "Alte Spuren." }, { wenn: { offen: ["malika"] }, text: "Lehm und Dornen." }] })),
  dialoge: {
    imara: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Dornhag hat Wasser, Tafelrast hat Ureisen. Und die Kanzel hat die Ockermutter.", "Hasim hat es dir gesagt: Weckt sie nicht. Sie ist wach. Und hungrig."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Die Lehmfeste steht seit hundert Jahren. Die Mauern sind dick wie ein Mann lang ist."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Seit die Mutter fort ist, kommen die Karawanen ohne Wachen. Aber ihre Kinder … die werden größer."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Du lebst. Und sie?"], antworten: ["fertig"] },
        { zeilen: ["Erst Malika in Dornhag, dann den Spuren nach zur Kanzel. Und dann allein in den Bau."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich stelle mich der Ockermutter. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Gut. Frag Malika in Dornhag, wo die Ziegen verschwinden. Dann folg den Spuren zur Ockerkanzel.",
          "In den Bau gehst du allein – wir würden nur im Weg stehen. Wenn sie heult, kommen ihre Kinder. Wenn sie springt, steh nicht da, wo sie landet."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Sie wartet. Und frisst."] } }] },
        { id: "fertig", text: "Die Ockermutter ist besiegt.", folge: [{ f: { abschluss: true, zeilen: ["Imara schlägt mit der Faust auf die Mauer der Feste, einmal, laut.",
          "Rotlehm, Dornhag und Tafelrast schulden dir mehr, als in eine Truhe passt. Aber hör: Solche wie sie sterben nicht. Sie kommt wieder – größer."] } }] },
        tschuess("Wasser und Schatten."),
      ],
    },
    malika: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["malika"] }, zeilen: ["Die Hauptfrau schickt dich? Wegen der Ziegen?"], antworten: ["ziegen_fragen", "tschuess"] },
        { wenn: { erledigt: ["malika"] }, zeilen: ["Nach Südwesten. Zur Kanzel. Pass auf dich auf."], antworten: ["tschuess"] },
        { zeilen: ["Hinter den Dornenhecken sind die Herden sicher. Meistens."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "ziegen_fragen", text: "Wo verschwinden die Ziegen?", folge: [{ f: { erledige: ["malika"], zeilen: ["Draußen, vor der Hecke. Immer nachts. Morgens ist die Spur da – nach Südwesten, zur Ockerkanzel.",
          "Ich bin ihr einmal gefolgt. Bis zu den Knochen. Weiter nicht."] } }] },
        tschuess("Halt dich von den Hyänen fern."),
      ],
    },
  },
  /* Boss-Regel #116: vor der Quest leer, in der Quest allein und schwächer (Instanz), danach die starke Fassung */
  schalter: { ockermutter_bau: { phase: ["laeuft"], erledigt: SP, offen: ["mutter"] }, ockermutter_danach: FERTIG },
  glueckwunsch: "Die Ockermutter ist besiegt. Die Ockerlande atmen auf – und Rotlehm wird deinen Namen nicht vergessen.",
  belohnungText: "Belohnung: Stärke, Fernkampf, Magie, Defense je 3.000 XP, 1.500 Splitter · danach: die Ockermutter in ihrer starken Fassung",
  belohnung: { xp: { staerke: 3000, fernkampf: 3000, magie: 3000, defense: 3000 }, splitter: 1500 },
  punkte: 2,
};
