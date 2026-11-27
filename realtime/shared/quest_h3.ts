/*
 * Riftmere – Quest H3 „Tiefer als erlaubt“ (Phase 11, Hochlande), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-11.md (Block H, #161). Steiger Wendel am Erzberg: Drei Bergleute haben tiefer gegraben, als die Vögte erlaubten.
 * Dann gab der Stollen nach. Unten im Bergwerk (Unterwelt hochlande_bergwerk) drei morsche Stempel durch neue Grubenstempel ersetzen (Handwerk 45, Werkbank),
 * das Geröll vor dem tiefen Stollen wegräumen (Bergbau 50), die drei Verschütteten mit Heiltränken versorgen; an der Bruchstelle eine Erzprobe, die leuchtet.
 * QUER: Mutter Hedda im Rabenmoor erkennt Splitterlicht in der Probe – das, was unten geweckt wurde (Haken für H4 und später die Rissgrube).
 * Lohn: Bergbau 3.000, Handwerk 2.000 XP, 600 Splitter, 2 Questpunkte; Schalter urkammer_offen (Zugang zur Urkammer mit dem Ureisen, Welt/Systeme #118)
 * und tiefer_stollen_frei (der Weg hinter dem Geröll bleibt offen – dort liegt die Trollhalle aus H4).
 * Neu (#118): Gegenstände grubenstempel, erzprobe_leuchtend; Rezept grubenstempel (Werkbank, Handwerk 45, 1 Kernbaumstamm, quest: H3).
 */
import type { QuestDef, Bed, QuestFigur, Option, Rede } from "./questbau";
import { WENDEL, HEDDA, BERGWERK } from "./quest_h_orte";
import { H1 } from "./quest_h1";

export const H3 = "hochlande_tiefer_als_erlaubt";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const STEMPEL = ["stempel_1", "stempel_2", "stempel_3"];
const LEUTE = ["jost", "marthe", "pit"];
const LEUTE_FIG: QuestFigur[] = [
  { id: "jost", name: "Hauer Jost", modell: "npc.bergmann2", x: BERGWERK.verschuettet[0][0], y: BERGWERK.verschuettet[0][1], blick: [0, -1], sichtbar: { phase: ["laeuft"], offen: ["jost"] } },
  { id: "marthe", name: "Hauerin Marthe", modell: "npc.bergfrau", x: BERGWERK.verschuettet[1][0], y: BERGWERK.verschuettet[1][1], blick: [-1, 0], sichtbar: { phase: ["laeuft"], offen: ["marthe"] } },
  { id: "pit", name: "Lehrhauer Pit", modell: "npc.bergmann", x: BERGWERK.verschuettet[2][0], y: BERGWERK.verschuettet[2][1], blick: [0, -1], sichtbar: { phase: ["laeuft"], offen: ["pit"] } },
];
const VERSORGT: Record<string, string[]> = {
  jost: ["Jost trinkt in einem Zug. Er hustet Staub. „Wir … wir sind zu tief. Ich hab's gewusst. Ich hab's gesagt.“"],
  marthe: ["Marthe schiebt die Flasche erst weg, dann trinkt sie doch. „Danke. Mein Bein ist nicht gebrochen. Glaub ich.“", "„Da unten ist eine Halle. Zu groß für den Berg. Und es atmet darin.“"],
  pit: ["Pit ist noch jung. Er zittert, als er trinkt. „Ich hab Licht gesehen. Grünes. In der Wand.“"],
};
const HILFE = ["Drei Stempel im Stollen sind morsch. Mach neue an der Werkbank – Kernbaum, sonst bricht's wieder. Handwerk 45 brauchst du dafür.",
  "Dann das Geröll vor dem tiefen Stollen. Mit der Hacke, und mit Verstand. Bergbau 50.", "Und nimm Heiltränke mit. Drei. Sie sind seit zwei Tagen da unten."];

export const QUEST_H3: QuestDef = {
  id: H3, titel: "Tiefer als erlaubt", ort: "Erzberg-Bergwerk · Rabenmoor", start: "Sprich mit Steiger Wendel am Eingang des Bergwerks am Erzberg.",
  logNeu: "Am Eingang des Bergwerks läuft ein Steiger auf und ab und schaut immer wieder in den Stollen.",
  logAngeboten: "Steiger Wendel am Erzberg sucht jemanden, der in den tiefen Stollen steigt.",
  logAbgabe: "Die Verschütteten sind versorgt, und Hedda weiß, was in der Probe leuchtet. Geh zurück zu Steiger Wendel.",
  logFertig: "Der tiefe Stollen ist wieder sicher, die drei Bergleute sind oben. In der Halle darunter schläft etwas, das Splitterlicht trinkt.",
  geber: "wendel",
  figuren: [WENDEL, HEDDA, ...LEUTE_FIG],
  voraussetzungen: [
    { text: "„Über den Pass“ abgeschlossen", wenn: { quest: { id: H1, phase: ["fertig"] } } },
    { text: "Bergbau 50", wenn: { skill: { k: "bergbau", min: 50 } } },
    { text: "Handwerk 45", wenn: { skill: { k: "handwerk", min: 45 } } },
  ],
  schritte: [
    ...STEMPEL.map((id, i) => ({ id, text: "Morsche Stempel im Stollen ersetzen", ereignis: { art: "objekt" as const, id: "h3_" + id }, gruppe: "stempel", wo: BERGWERK.stempel[i],
      log: "Ersetz im Bergwerk drei morsche Stempel durch neue Grubenstempel ({n:stempel}). Grubenstempel machst du an der Werkbank aus Kernbaum (Handwerk 45)." })),
    { id: "geroell", text: "Das Geröll vor dem tiefen Stollen wegräumen", ereignis: { art: "objekt", id: "h3_geroell" }, nach: STEMPEL, wo: BERGWERK.geroell,
      log: "Die Decke hält. Räum jetzt das Geröll vor dem tiefen Stollen weg (Bergbau 50) – dahinter sind die Verschütteten." },
    ...LEUTE.map((id, i) => ({ id, text: "Die Verschütteten mit Heiltränken versorgen", ereignis: { art: "antwort" as const }, nach: ["geroell"], bei: id, gruppe: "leute", wo: BERGWERK.verschuettet[i],
      log: "Hinter dem Geröll liegen drei Bergleute. Gib jedem einen Heiltrank ({n:leute})." })),
    { id: "probe", text: "Eine Erzprobe an der Bruchstelle nehmen", ereignis: { art: "objekt", id: "h3_ader" }, nach: ["geroell"], wo: BERGWERK.ader,
      log: "An der Bruchstelle leuchtet das Gestein grün. Nimm eine Probe mit – Wendel will wissen, was das ist." },
    { id: "hedda", text: "Mutter Hedda die Probe zeigen", ereignis: { art: "antwort" }, nach: ["probe"], bei: "hedda",
      log: "Wendel kennt grünes Licht im Gestein nicht. Mutter Hedda im Rabenmoor kennt sich mit Splittern aus. Zeig ihr die Probe." },
  ],
  objekte: [
    ...STEMPEL.map((id, i) => ({ id: "h3_" + id, name: "Morscher Stempel", x: BERGWERK.stempel[i][0], y: BERGWERK.stempel[i][1], modell: "stelle", tat: "benutzen" as const, tatText: "Den Stempel ersetzen", weit: 2.5,
      braucht: { wenn: { hat: "grubenstempel" }, text: "Der Stempel knackt, wenn du ihn ansiehst. Ohne einen neuen Grubenstempel fasst du ihn besser nicht an." },
      nehmen: [{ g: "grubenstempel" }],
      text: "Du keilst den neuen Stempel unter die Kappe und schlägst den alten heraus. Staub rieselt. Dann ist es still ({n:stempel}).",
      schon: "Der neue Stempel trägt.", sonst: [{ wenn: NEU, text: "Ein Stempel, grau und weich wie Brot. Er trägt noch. Fragt sich, wie lange." }, { wenn: FERTIG, text: "Der neue Stempel trägt." }] })),
    { id: "h3_geroell", name: "Geröll vor dem tiefen Stollen", x: BERGWERK.geroell[0], y: BERGWERK.geroell[1], modell: "stelle", tat: "benutzen", tatText: "Das Geröll wegräumen", weit: 3,
      braucht: { wenn: { skill: { k: "bergbau", min: 50 } }, text: "Wer hier falsch hackt, holt den Rest der Decke herunter. Das braucht einen erfahrenen Bergmann (Bergbau 50)." },
      text: "Stein für Stein, Brocken für Brocken. Dann ein Loch, durch das ein Mensch passt. Von drinnen ruft jemand: „Licht! Da ist Licht!“",
      schon: "Der tiefe Stollen ist frei.", sonst: [{ wenn: NEU, text: "Geröll, bis an die Decke. Dahinter geht es tiefer." }, { wenn: FERTIG, text: "Der tiefe Stollen ist frei." },
        { wenn: { offen: STEMPEL }, text: "Erst die Stempel. Wenn hier die Decke nachgibt, bist du der Nächste, den man ausgräbt." }] },
    { id: "h3_ader", name: "Bruchstelle", x: BERGWERK.ader[0], y: BERGWERK.ader[1], modell: "stelle", tat: "untersuchen", tatText: "Eine Probe nehmen", weit: 2.5,
      geben: [{ g: "erzprobe_leuchtend" }],
      text: "Das Gestein ist warm. Du schlägst ein Stück heraus; es leuchtet in deiner Hand weiter, grün und still wie ein Glühwurm.",
      schon: "Die Probe hast du.", sonst: [{ wenn: NEU, text: "Grünes Licht im Gestein. Hier hat jemand zu tief gegraben." }, { wenn: FERTIG, text: "Das Leuchten ist schwächer geworden. Oder du hast dich daran gewöhnt." },
        { wenn: { offen: ["geroell"] }, text: "Dahinter liegt Geröll." }] },
  ],
  /* Wendel: Steiger, Verantwortung für seine Leute, wütend und besorgt zugleich, Glück auf. Die Verschütteten: erschöpft, jeder anders.
     Hedda: alt, scharf, „Kind“ – sie hat das Licht schon einmal gesehen. */
  dialoge: {
    ...Object.fromEntries(LEUTE.map((id) => [id, {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["geroell"], offen: [id], hat: "heiltrank" }, zeilen: ["Wasser … nein. Licht. Hast du was für mich?"], antworten: ["versorgen", "tschuess"] } as Rede,
        { wenn: { ...LAEUFT, erledigt: ["geroell"], offen: [id] }, zeilen: ["Hast du … einen Trank? Irgendwas?"], antworten: ["tschuess"] } as Rede,
        { zeilen: ["Glück auf."], antworten: ["tschuess"] } as Rede,
      ],
      optionen: [
        { id: "versorgen", text: "Einen Heiltrank geben.", wenn: { hat: "heiltrank" }, folge: [{ f: { erledige: [id], nehmen: [{ g: "heiltrank" }], zeilen: [...VERSORGT[id], "({n:leute})"] } }] } as Option,
        { id: "tschuess", text: "Halt durch.", folge: [{ f: { zeilen: ["Glück auf."] } }] } as Option,
      ],
    }])),
    wendel: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Glück auf. Nein – kein Glück. Drei meiner Leute sind unten, im tiefen Stollen. Seit zwei Tagen.",
          "Sie haben tiefer gegraben, als die Vögte erlaubten. Ich hab's ihnen verboten. Dann hat der Berg nachgegeben."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Glück auf! Unten liegt Sterneisen, Splittereisen – und ganz tief Ureisen. Wenn du Mut hast."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Jost, Marthe und Pit sitzen in der Taverne und erzählen jedem, wie sie gerettet wurden. Jeden Abend etwas größer.",
          "Die Urkammer steht dir offen. Aber die Halle darunter … in die geht keiner von uns mehr."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Sie sind oben! Alle drei! Und Hedda sagt was?"], antworten: ["fertig"] },
        { wenn: { ...LAEUFT, erledigt: ["probe"] }, zeilen: ["Grünes Licht im Gestein? Das hab ich in dreißig Jahren nicht gesehen.", "Mutter Hedda im Rabenmoor. Wenn einer weiß, was das ist, dann sie."], antworten: ["hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["geroell"] }, zeilen: ["Du bist durch? Dann gib ihnen die Tränke, schnell!"], antworten: ["hilfe", "tschuess"] },
        { zeilen: ["Erst die Stempel, dann das Geröll. In der Reihenfolge, oder du liegst neben ihnen."], antworten: ["hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich hole sie heraus. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Gut. Hör zu, denn ich sag's nur einmal.",
          "Drei Stempel im Stollen sind morsch. Ersetz sie, sonst kommt die Decke runter, wenn du am Geröll hackst. Grubenstempel machst du an der Werkbank, aus Kernbaum.",
          "Dann das Geröll vor dem tiefen Stollen. Und nimm drei Heiltränke mit. Glück auf. Diesmal mein ich's."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Dann such ich weiter. Zwei Tage. Zwei Tage sind lang im Berg."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "fertig", text: "Hedda sagt: Splitterlicht. Etwas da unten trinkt es.", folge: [{ f: { abschluss: true, zeilen: ["Wendel setzt sich auf eine Lore. Lange sagt er nichts.",
          "Splitterlicht. Im Erzberg. …Dann haben die Alten recht gehabt, mit ihren Geschichten von den Hütern.",
          "Du hast drei meiner Leute gerettet. Die Urkammer gehört dir – das beste Ureisen der Hochlande. Und sag der Vögtin, was du gesehen hast."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Glück auf."] } }] },
      ],
    },
    hedda: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["probe"], offen: ["hedda"], hat: "erzprobe_leuchtend" }, zeilen: ["Kind. Was trägst du da in der Tasche? Es leuchtet durch den Stoff."], antworten: ["probe_zeigen", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["hedda"] }, zeilen: ["Grabt nicht tiefer, sag ich. Aber sie graben immer tiefer."], antworten: ["tschuess"] },
        { zeilen: ["Kind. Setz dich nicht auf den Kessel."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "probe_zeigen", text: "Eine Erzprobe aus dem Erzberg. Sie leuchtet.", wenn: { hat: "erzprobe_leuchtend" }, folge: [{ f: { erledige: ["hedda"], nehmen: [{ g: "erzprobe_leuchtend" }],
          zeilen: ["Hedda dreht den Stein in der Hand. Sie hält ihn gegen das Licht, dann an ihr Ohr.", "Splitterlicht. Nicht im Stein gewachsen – hineingesickert. Von unten.",
          "Da unten schläft etwas, das Splitterlicht trinkt, Kind. Und jetzt ist es wach. Sag deinem Steiger: Grabt nicht tiefer.", "Den Stein behalte ich. So etwas lässt man nicht in einer Tasche herumliegen."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Geh, Kind."] } }] },
      ],
    },
  },
  sperren: { herstellen: {
    grubenstempel: [{ wenn: NEU, text: "Grubenstempel macht man nur für den Stollen. Frag den Steiger am Erzberg." }, { wenn: { ...LAEUFT, erledigt: STEMPEL }, text: "Die Stempel stehen alle." }],
  } },
  schalter: { urkammer_offen: FERTIG, tiefer_stollen_frei: [FERTIG, { erledigt: ["geroell"] }] },
  glueckwunsch: "Alle drei oben. Glück auf, Kumpel – so nennen wir hier nur die, mit denen wir in den Berg gehen.",
  belohnungText: "Belohnung: Bergbau 3.000, Handwerk 2.000 XP, 600 Splitter · danach: die Urkammer mit dem Ureisen steht dir offen",
  belohnung: { berufe: { bergbau: 3000, handwerk: 2000 }, splitter: 600 },
  punkte: 2,
};
