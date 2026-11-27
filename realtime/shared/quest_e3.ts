/*
 * Riftmere – Quest E3 „Fahnenflucht“ (Phase 8), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-8.md. Burgvogt Wigand Fels, der einzige Wachtmann in der Burg von Grauwacht. Die Deserteure am Grenzposten sind Wachtleute,
 * die nach dem Zerfall fortliefen. Das Lager auskundschaften, Anführer Tjark Sölde stellen – und wählen: überreden oder besiegen.
 * Lohn: Stärke 1.000, Geschick 600 XP, 400 Splitter, 2 Questpunkte. Schalter grauwacht_burg (Stadtstufe „burg“: Burg besetzt, Bank, Waffenladen, Werkstatt).
 *
 * QUER: Tjark ist ein Vetter von Raban, der Wache an der Straßensperre (Quest 1) – wer das weiß, kommt leichter an ihn heran (Gespräch).
 * Die Wahl: Der Schritt „tjark“ ist erledigt, wenn Tjark fällt (erlegen) ODER wenn man ihn überredet (Antwort erledigt ihn, er gibt „Tjarks Eid“).
 * Auf „Ergib dich“ wird Tjark zum Gegner (Folge.angriff, a34079ee); sein Tod erledigt den Schritt. grauwacht_burg gilt für beide Wege.
 *
 * Stellen aus der Welt (#50, shared/quest_e_orte.ts). Im Spiel (shared/quests.ts) seit 27.11. (a34079ee). Liste: doku/quests/e-bausteine.md.
 */
import type { QuestDef, Bed } from "./questbau";
import { E2 } from "./quest_e2";
import { BURG, GRENZPOSTEN } from "./quest_e_orte";

export const E3 = "grauwacht_fahnenflucht";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const HILFE = ["Der Grenzposten liegt westlich, am Rand der Heide. Sieh dir das Lager an, bevor du hineingehst. Zähl sie.",
  "Tjark Sölde führt sie. Er war mein Feldwebel. Ein guter, bis er es nicht mehr war.", "Rede mit ihm. Oder nicht. Aber bring mir eine Antwort."];

export const QUEST_E3: QuestDef = {
  id: E3, titel: "Fahnenflucht", ort: "Grauwacht · Grenzposten", start: "Sprich mit Burgvogt Wigand Fels in der Burg von Grauwacht.",
  logNeu: "In der Burg von Grauwacht hält ein einzelner Wachtmann die Stellung: Burgvogt Wigand Fels. Er sieht nach Westen, zum alten Grenzposten.",
  logAngeboten: "Burgvogt Wigand Fels in Grauwacht wartet, ob du zum Grenzposten gehst.",
  logAbgabe: "Tjark Sölde hat seine Antwort gegeben. Bring sie Burgvogt Wigand Fels.",
  logFertig: "Die Burg von Grauwacht ist wieder besetzt. Am Markt öffnen eine Bank und ein Waffenladen.",
  geber: "wigand",
  figuren: [
    { id: "wigand", name: "Wigand Fels", modell: "stadtwache3d", x: BURG.wigand[0], y: BURG.wigand[1], blick: [0, 1], ausbau: "abtei" },
    { id: "tjark", name: "Tjark Sölde", modell: "npcmann3d", x: GRENZPOSTEN.tjark[0], y: GRENZPOSTEN.tjark[1], blick: [1, 0] },
  ],
  voraussetzungen: [
    { text: "„Die Glocke“ abgeschlossen", wenn: { quest: { id: E2, phase: ["fertig"] } } },
    { text: "Heldenlevel 42", wenn: { heldenlevel: 42 } },
  ],
  schritte: [
    { id: "lager", text: "Das Lager am Grenzposten auskundschaften", ereignis: { art: "objekt", id: "e3_lager" }, wo: GRENZPOSTEN.lager,
      log: "Kundschafte das Lager der Deserteure am alten Grenzposten aus, westlich der Heide." },
    { id: "tjark", text: "Tjark Sölde stellen", ereignis: { art: "erlegen", typ: "tjark" }, nach: ["lager"], bei: "tjark", wo: GRENZPOSTEN.tjark,
      log: "Stell Tjark Sölde, den Anführer der Deserteure. Überrede ihn, zurückzukehren – oder besieg ihn." },
  ],
  objekte: [
    { id: "e3_lager", name: "Lager am Grenzposten", x: GRENZPOSTEN.lager[0], y: GRENZPOSTEN.lager[1], modell: "stelle", tat: "untersuchen", tatText: "Das Lager beobachten", weit: 4,
      text: "Zwölf Zelte, ordentlich in Reihen, wie es die Wacht lehrt. Die Wappenröcke sind umgedreht getragen, das Futter nach außen. Ein Wachtposten am Tor – sie halten Wache, obwohl sie davongelaufen sind.",
      schon: "Zwölf Zelte, umgedrehte Wappenröcke.", sonst: [{ wenn: NEU, text: "Rauch über dem alten Grenzposten." }, { wenn: FERTIG, text: "Das Lager ist leer." }] },
  ],
  /* Wigand: Burgvogt, schwerfällig, pflichtbewusst bis zur Sturheit, kennt jeden Deserteur beim Namen. Tjark: Feldwebel, müde, zynisch, aber nicht ohne Ehre. */
  dialoge: {
    wigand: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Die Glocke läutet. Die Abtei lebt. Und meine Burg ist leer.",
          "Am Grenzposten im Westen hausen Deserteure. Wachtleute. Meine Wachtleute. Sie sind fortgelaufen, als die Glocke sprang und keiner mehr Befehle gab."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Burgvogt Wigand Fels. Einziger Wachtmann von Grauwacht. Was willst du?"], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Die Burg hat wieder Wachen. Nicht genug. Aber Wachen."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true, hat: "tjarks_eid" }, zeilen: ["Du kommst allein zurück. Aber du lächelst. Was hast du da?"], antworten: ["eid_zeigen"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Tjark ist gefallen? …Dann hat er es so gewollt.", "Ich hätte ihn gern noch einmal gesehen."], antworten: ["bericht"] },
        { wenn: { ...LAEUFT, erledigt: ["lager"] }, zeilen: ["Zwölf Zelte, in Reihen? Dann sind sie noch Soldaten. Sie wissen es nur nicht mehr."], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Der Grenzposten, im Westen. Sieh hin, bevor du handelst."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich rede mit den Deserteuren. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Reden. Oder kämpfen. Ich hab beides versucht, allein. Beides ging schief.",
          "Ihr Anführer heißt Tjark Sölde. Mein Feldwebel. Bring mir eine Antwort – so oder so."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Die Burg wartet. Sie kann das gut."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "eid_zeigen", text: "Tjarks Eid übergeben.", wenn: { hat: "tjarks_eid" }, folge: [{ f: { abschluss: true, nehmen: [{ g: "tjarks_eid" }],
          zeilen: ["Wigand liest. Seine Hand zittert, ganz wenig.", "Er kommt zurück. Sie kommen alle zurück. Zwölf Wachtleute.", "Ich lass die Tore ölen. Und die Bank aufschließen. Grauwacht hat wieder eine Besatzung."] } }] },
        { id: "bericht", text: "Bericht erstatten.", folge: [{ f: { abschluss: true, zeilen: ["Wigand nickt lange. Dann nimmt er den Helm ab.",
          "Ohne Tjark laufen die anderen nach Hause, in alle Richtungen. Ein paar kommen vielleicht her. Wir nehmen, wen wir kriegen.", "Die Bank schließt auf. Der Waffenladen auch. Grauwacht lebt – leiser als ich wollte."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Für die Wacht."] } }] },
      ],
    },
    tjark: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["lager"], offen: ["tjark"] }, zeilen: ["Wigand schickt dich? Natürlich. Der alte Bock schickt immer andere.",
          "Sag, was du sagen willst. Und dann geh, oder zieh."], antworten: ["raban", "glocke", "kampf"] },
        { wenn: { erledigt: ["tjark"] }, zeilen: ["Ich hab's versprochen. Ich halt's. Sag Wigand, wir kommen."], antworten: ["tschuess"] },
        { zeilen: ["Halt. Hier ist das Lager der Freien. Wer hier rein will, braucht einen Grund."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "raban", text: "Kennst du Raban? Die Wache an der Straßensperre vor Weidenhain.", folge: [{ f: { weiter: true, zeilen: ["Tjark sieht dich lange an.",
          "Raban. Mein Vetter. Er hat damals gesagt: „Bleib, die Wacht kommt zurück.“ Ich bin gegangen. Er ist geblieben. Steht er immer noch an der Sperre?", "…Natürlich steht er noch da. Der Dummkopf."] } }] },
        { id: "glocke", text: "Die Glocke läutet wieder. Die Wacht ruft.", folge: [{ f: { erledige: ["tjark"], geben: [{ g: "tjarks_eid", name: "Tjarks Eid" }],
          zeilen: ["Tjark schweigt. Hinter ihm sind die Gespräche am Feuer verstummt.", "Wir haben sie gehört. Gestern. Zur vollen Stunde. Bolko hat geheult wie ein Kind.",
            "…Gut. Hier. Mein Eid, aufgeschrieben, mit meinem Namen. Bring ihn Wigand. Wenn er uns noch will."] } }] },
        { id: "kampf", text: "Ihr seid Fahnenflüchtige. Ergib dich.", folge: [{ f: { angriff: "tjark", zeilen: ["Ergeben? Wem? Einer Glocke?", "Zieh."] } }] },
        { id: "tschuess", text: "Gehen.", folge: [{ f: { zeilen: ["Geh mit Gott. Oder ohne."] } }] },
      ],
    },
  },
  schalter: { grauwacht_burg: FERTIG },
  glueckwunsch: "Die Burg ist besetzt, die Wacht steht. Für die Wacht – und für dich.",
  belohnungText: "Belohnung: Stärke 1.000, Geschick 600 XP, 400 Splitter · danach: die Burg von Grauwacht ist besetzt, Bank und Waffenladen",
  belohnung: { xp: { staerke: 1000, geschick: 600 }, splitter: 400 },
  punkte: 2,
};
