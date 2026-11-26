/*
 * Riftmere – Quest 01 „Die gesperrte Straße“ (Einführung in Waldmark), als Daten für den Quest-Baukasten (shared/questbau.ts, Fahrplan Phase 1c, 26.11.2026).
 * Grundlage: Designdossier „Mythara_Quest01_Die_gesperrte_Strasse“ (22.11.2026): Ort Weidenhain, Informationen auf dem Osthof,
 *   Belohnung 150 XP je Kampfskill + 100 LP + 200 Defense, Schriftstück = Hinweispergament (35 % je Bandit, nur solange das Schriftstück
 *   gesichert werden soll), sichtbare Sperren an drei Stellen, für jeden Spieler nach seinem eigenen Stand.
 *
 * Schritte (Bit i = schritte[i]): hagan · fenna · wachen · beweis (Pergament aufheben) · vorzeigen · durch. Abschluss bei Othmar in Weidenhain.
 * Ältere Stände (bis 26.11.2026: angeboten, angenommen, auftrag, osthof, wachen, beweis, bestaetigt, frei) übersetzt alt() beim Laden.
 */
import type { QuestDef, Bed, Text, Rede, Option } from "./questbau";

export const Q1 = "die_gesperrte_strasse";
export const SCHRIFTSTUECK = "hinweispergament";
const BELOHNUNG = { geschick: 150, staerke: 150, fernkampf: 150, magie: 150, lp: 100, defense: 200 };

/** Stände vor dem Baukasten → Bitmaske (hagan 1, fenna 2, wachen 4, beweis 8, vorzeigen 16, durch 32) */
const ALT: Record<string, string> = { angenommen: "auftrag_0", auftrag: "auftrag_1", osthof: "auftrag_3", wachen: "auftrag_7", beweis: "auftrag_15", bestaetigt: "auftrag_31", frei: "auftrag_63" };

const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const ICH = "Du", z = (wer: string, ...t: string[]): Text[] => t.map((text) => ({ wer, text }));
const ENDE = "tschuess";
const tschuess = (text: string): Option => ({ id: ENDE, text: "Auf Wiedersehen.", folge: [{ f: { zeilen: [text] } }] });

/* Die Wachen Raban und Tilda sprechen gemeinsam – dasselbe Gespräch, egal wen man anspricht */
function wache(selbst: string): { reden: Rede[]; optionen: Option[] } {
  return {
    reden: [
      { wenn: { ...LAEUFT, erledigt: ["fenna"], offen: ["wachen"] }, zeilen: [...z("Raban", "Halt. Der Weg ist gesperrt. Kein Durchlass ohne Anweisung."),
        ...z(ICH, "Ich komme aus Waldmark. Auf dem Osthof wurde ein Wagen ausgeraubt. Die Spur führt in den Kreuzwald."),
        ...z("Raban", "Das ist nicht der erste Bericht. Ein Karren verschwindet, ein anderer kommt leer zurück. Jeder erzählt etwas anderes. Keiner kann uns sagen, wen er gesehen hat."),
        ...z("Tilda", "Einer der Fuhrleute sprach von Bewegung auf der Lichtung östlich des Weges. Wir fanden dort Spuren, aber sie waren alt und vom Regen verwischt. Wenn du wirklich helfen willst, sieh dir die Lichtung an. Aber geh nicht davon aus, dass dort nur ein einzelner Mann sitzt."),
        ...z("Raban", "Bring einen Beleg, der die Bande mit den Überfällen verbindet. Dann kann der Bürgermeister von Waldmark bei uns vorsprechen.")],
        antworten: ["lager", "eskorte", "warum"] },
      { wenn: { ...LAEUFT, erledigt: ["vorzeigen"], offen: ["durch"] }, zeilen: [...z("Raban", "Du bist zurück. Der Bote aus Waldmark hat uns die Bestätigung gebracht. Der Bürgermeister steht für deinen Bericht ein."),
        ...z(ICH, "Dann ist die Sperre aufgehoben?"), ...z("Raban", "Für dich ist der Weg frei. Wir bleiben noch im Dienst, aber wir halten dich nicht länger zurück."),
        ...z("Tilda", "Wenn du nach Weidenhain gehst, sprich mit dem Bürgermeister. Er soll selbst hören, was auf dem Papier stand.")],
        antworten: ["durch", "festnehmen"] },
      { wenn: { erledigt: ["durch"] }, zeilen: z(selbst, "Der Weg ist frei. Gute Reise."), antworten: [ENDE] },
      { wenn: { ...LAEUFT, erledigt: ["wachen"] }, zeilen: z(selbst, "Ohne Bestätigung aus Waldmark lassen wir niemanden durch. Bring dem Bürgermeister einen Beleg."), antworten: [ENDE] },
      { zeilen: z(selbst, "Halt. Der Weg ist gesperrt. Kein Durchlass ohne Anweisung."), antworten: [ENDE] },
    ],
    optionen: [
      { id: "lager", text: "Ich suche das Lager auf der Lichtung auf.", folge: [{ f: { erledige: ["wachen"], zeilen: z("Raban", "Pass auf dich auf. Und komm mit etwas zurück, das wir in der Hand halten können.") } }] },
      { id: "eskorte", text: "Ihr könntet wenigstens einen Wagen eskortieren.", folge: [{ f: { weiter: true, zeilen: z("Raban", "Mit welchen Leuten? Wir sind zu zweit an dieser Sperre. Wenn wir einen Wagen begleiten, steht die Straße offen.") } }] },
      { id: "warum", text: "Warum lasst ihr niemanden durch?", folge: [{ f: { weiter: true, zeilen: z("Raban", "Weil die Banditen nicht nur Wagen nehmen. Sie könnten sich unter Reisende mischen. Lassen wir einen durch, der sie hinter die Sperre führt, stehen die Leute in Weidenhain ungeschützt da.") } }] },
      { id: "durch", text: "Nach Weidenhain weitergehen.", folge: [{ f: { erledige: ["durch"], zeilen: z("Raban", "Dann los. Wir rollen den Stamm für dich zur Seite.") } }] },
      { id: "festnehmen", text: "Könnt ihr die Banditen nicht sofort festnehmen?", folge: [{ f: { weiter: true, zeilen: z("Raban", "Der Hinweis auf ein Versteck genügt noch nicht, um alle Zugänge zu finden. Erst muss jemand wissen, welches Haus gemeint ist.") } }] },
      { id: ENDE, text: "Auf Wiedersehen.", folge: [{ f: { zeilen: z(selbst, "Gib auf dich acht.") } }] },
    ] };
}
const ZEIGEN_TEXT = z("Hagan Voss", "Das ist keine bloße Wegelagerei mehr. Hier steht, dass die Ladung unter ein Haus gebracht werden soll. Und sie schreiben ausdrücklich, keine Namen aufzuschreiben.",
  "Dieses Papier reicht, um den Wachen zu zeigen, dass die Überfälle zusammenhängen. Ich setze meinen Namen darunter und lasse die Bestätigung auf direktem Weg zu den Wachen bringen. Geh zurück zur Straße – sie werden dich erkennen.");
/** Die Sperren öffnen sich, sobald die Wachen den Spieler durchlassen (die Kreuzung schon, wenn er zu ihnen geschickt wird) */
const DURCH: Bed[] = [{ erledigt: ["durch"] }];

export const QUEST1: QuestDef = {
  id: Q1, titel: "Die gesperrte Straße", ort: "Einführung · Waldmark", einfuehrung: true,
  start: "Jori spricht dich auf dem Marktplatz der Waldmark an.",
  logNeu: "Sprich mit Jori in der Waldmark.",
  logAngeboten: "Ein Kind in Waldmark bittet dich um Hilfe. Sprich Jori noch einmal an, wenn du es dir überlegt hast.",
  logAbgabe: "Der Weg ist offen. Sprich mit dem Bürgermeister von Weidenhain auf dem Dorfplatz.",
  logFertig: "Die Sperre ist für dich aufgehoben. Weidenhain und Rabenmoor sind erreichbar. Das Schriftstück deutet auf einen Unterschlupf unter einem Haus hin – die Spur führt weiter nach Rabenmoor.",
  geber: "jori", abgabe: "othmar",
  figuren: [
    { id: "jori", name: "Jori", modell: "npc.maedchen", x: 6452.5, y: 6444.5, blick: [0, -1], weit: 40, kommt: { region: "waldmark", wenn: { phase: ["neu"], angeboten: false } } },
    { id: "hagan", name: "Hagan Voss", modell: "npc.buergermeister_waldmark", x: 6438.5, y: 6423.5, blick: [0, 1], wandert: "npc.buergermeister_waldmark", weit: 9 },
    { id: "fenna", name: "Fenna Ried", modell: "npc.marktfrau", x: 6534.5, y: 6438.5, blick: [0, 1] },
    /* vor der Straßensperre (Stämme ab 6648); mit Freigabe treten sie zur Seite */
    { id: "raban", name: "Wachtmann Raban", modell: "stadtwache3d", x: 6442.5, y: 6643.5, blick: [0, -1], beiseite: { wenn: { erledigt: ["durch"] }, dx: -3, dy: 0, blick: [0, 1] } },
    { id: "tilda", name: "Wachtfrau Tilda", modell: "stadtwache3d", x: 6450.5, y: 6643.5, blick: [0, -1], beiseite: { wenn: { erledigt: ["durch"] }, dx: 3, dy: 0, blick: [0, 1] } },
    { id: "othmar", name: "Othmar Rehn", modell: "npc.alter_bauer", x: 6451.5, y: 6688.5, blick: [0, -1] },
  ],
  schritte: [
    { id: "hagan", text: "Mit dem Bürgermeister von Waldmark sprechen", ereignis: { art: "antwort" }, bei: "hagan",
      log: "Der Bürgermeister von Waldmark braucht Hilfe. Finde heraus, warum der Handel nach Weidenhain zum Erliegen gekommen ist. Er ist im Rathaus am Marktplatz." },
    { id: "fenna", text: "Fenna auf dem Osthof befragen", ereignis: { art: "antwort" }, nach: ["hagan"], bei: "fenna",
      log: "Sprich mit Fenna auf dem Osthof (östlich von Waldmark, an der Steinstraße). Vielleicht hat dort jemand etwas über die Überfälle erfahren." },
    { id: "wachen", text: "Die Wachen an der Straßensperre befragen", ereignis: { art: "antwort" }, nach: ["fenna"], bei: ["raban", "tilda"],
      log: "Die Berichte vom Osthof deuten auf Überfälle im Kreuzwald. Befrage die Wachen an der Straßensperre im Süden des Kreuzwalds." },
    { id: "beweis", text: "Das Schriftstück der Banditen sichern", ereignis: { art: "aufheben", g: SCHRIFTSTUECK }, nach: ["wachen"], wo: [6546, 6586] /* Lichtung im Kreuzwald */,
      log: "Die Wachen bestätigen die Überfälle. Suche das Banditenlager auf der Lichtung im Kreuzwald, besiege die Banditen und sichere das Schriftstück, das einer von ihnen bei sich trägt." },
    { id: "vorzeigen", text: "Das Schriftstück dem Bürgermeister zeigen", ereignis: { art: "antwort" }, nach: ["beweis"], bei: "hagan",
      log: "Bringe das Schriftstück zum Bürgermeister von Waldmark." },
    { id: "durch", text: "Zur Straßensperre zurückkehren", ereignis: { art: "antwort" }, nach: ["vorzeigen"], bei: ["raban", "tilda"],
      log: "Der Bürgermeister hat den Hinweis bestätigt. Kehre zur Straßensperre zurück." },
  ],
  dialoge: {
    jori: {
      reden: [
        { wenn: NEU, anbieten: true, zeilen: [...z("Jori", "Du! Bitte, warte! Der Bürgermeister braucht deine Hilfe!"), ...z(ICH, "Was ist denn los?"),
          ...z("Jori", "Die Straße ist gesperrt. Schon wieder. Die Wagen kommen nicht durch, und im Dorf reden alle nur noch darüber. Der Bürgermeister sucht jemanden, der sich die Sache ansehen kann.")],
          antworten: ["warum", "annehmen", "verwerfen"] },
        { wenn: FERTIG, zeilen: ["Die Wagen fahren wieder! Mama sagt, es gibt bald wieder richtiges Mehl."], antworten: [ENDE] },
        { zeilen: ["Das Rathaus ist dort vorne, an der Westseite vom Marktplatz. Der Bürgermeister wartet!"], antworten: [ENDE] },
      ],
      optionen: [
        { id: "warum", text: "Warum geht niemand aus dem Dorf selbst?", folge: [{ f: { weiter: true, zeilen: ["Die Wachen lassen niemanden durch. Und die, die hinausgehen, sollen nicht allein in den Wald. Bitte, geh zum Rathaus. Er wird dir erklären, was passiert ist."] } }] },
        { id: "annehmen", text: "Ich helfe. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Wirklich? Danke! Das Rathaus ist dort vorne, an der Westseite vom Marktplatz. Der Bürgermeister wartet drinnen."] } }] },
        { id: "verwerfen", text: "Jetzt nicht. (Verwerfen)", folge: [{ f: { anbieten: true, zeilen: ["Schon gut. Ich kann dich nicht zwingen. Aber wenn du es dir anders überlegst, sprich mich noch einmal an."] } }] },
        tschuess("Tschüss!"),
      ],
    },
    hagan: {
      reden: [
        { wenn: NEU, zeilen: ["Ich habe viel zu tun. Wenn du helfen willst, sprich mit der kleinen Jori draußen auf dem Platz."], antworten: [ENDE] },
        { wenn: FERTIG, zeilen: ["Der Handel kommt wieder in Gang. Waldmark steht in deiner Schuld."], antworten: [ENDE] },
        { wenn: { offen: ["hagan"] }, zeilen: ["Du bist die Hilfe, von der Jori gesprochen hat? Gut. Dann will ich dich nicht mit langen Reden aufhalten.",
          "Der Weg nach Weidenhain ist gesperrt. Die Wachen haben Baumstämme quergelegt und lassen niemanden passieren. Seit die Banditen in den Wäldern Reisende und Wagen überfallen, kann niemand mehr sicher sagen, wer Händler ist und wer zu ihnen gehört.",
          "Der Handel steht still. Salz, Werkzeug und Mehl kommen nicht an. Auf dem Osthof bleiben Kisten liegen, die sonst weiter nach Weidenhain gebracht würden. Ich brauche mehr als Gerüchte.",
          "Geh zuerst zum Osthof. Hör dir an, was die Leute gesehen haben. Dann sprich mit den Wachen. Vielleicht ergibt sich aus beiden Berichten ein Weg, die Sache aufzuklären."],
          antworten: ["osthof", "banditen", "sperre"] },
        { wenn: { erledigt: ["beweis"], offen: ["vorzeigen"], hat: SCHRIFTSTUECK }, zeilen: ["Du bist zurück. Hast du etwas gefunden, das ich den Wachen vorlegen kann?"], antworten: ["zeigen"] },
        { wenn: { erledigt: ["wachen"], offen: ["vorzeigen"], hat: SCHRIFTSTUECK }, zeilen: ["Du bringst etwas mit? Zeig her."], antworten: ["zeigen"] },
        { wenn: { erledigt: ["beweis"], offen: ["vorzeigen"] }, zeilen: ["Ohne das Schriftstück kann ich nichts bestätigen. Hast du es noch?"], antworten: [ENDE] },
        { wenn: { offen: ["fenna"] }, zeilen: ["Der Osthof liegt östlich von hier an der Steinstraße. Frag nach Fenna."], antworten: [ENDE] },
        { wenn: { offen: ["beweis"] }, zeilen: ["Bring mir keine Vermutung, sondern etwas, das ich den Wachen vorlegen kann. Dann kann ich für dich einstehen."], antworten: [ENDE] },
        { zeilen: ["Die Bestätigung ist unterwegs. Geh zurück zur Straße – die Wachen werden dich erkennen."], antworten: [ENDE] },
      ],
      optionen: [
        { id: "osthof", text: "Ich sehe mich auf dem Osthof um.", folge: [{ f: { erledige: ["hagan"], zeilen: ["Bring mir keine Vermutung, sondern etwas, das ich den Wachen vorlegen kann. Dann kann ich für dich einstehen."] } }] },
        { id: "banditen", text: "Was weißt du über die Banditen?", folge: [{ f: { weiter: true, zeilen: ["Überfälle wurden gemeldet, das ist sicher. Aber wie viele es sind und wer sie anführt, weiß niemand."] } }] },
        { id: "sperre", text: "Warum hebst du die Sperre nicht selbst auf?", folge: [{ f: { weiter: true, zeilen: ["Die Sperre haben die Wachen an der Grenze eingerichtet, nicht ich. Ich brauche eine belegbare Grundlage, damit sie sie aufheben."] } }] },
        /* das Schriftstück wird abgegeben; wer es schon vor dem Auftrag der Wachen gefunden hatte, erledigt „beweis“ gleich mit */
        { id: "zeigen", text: "Das Schriftstück vorzeigen.", wenn: { hat: SCHRIFTSTUECK }, folge: [{ f: { nehmen: [{ g: SCHRIFTSTUECK }], erledige: ["beweis", "vorzeigen"], zeilen: ZEIGEN_TEXT } }] },
        tschuess("Bis bald."),
      ],
    },
    fenna: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["hagan"], offen: ["fenna"] }, zeilen: ["Wenn du wegen der Lieferung kommst: Es gibt nichts, das ich dir mitgeben könnte. Die Kisten stehen hier, und der Wagen fährt nicht.",
          ...z(ICH, "Der Bürgermeister schickt mich. Ich soll herausfinden, was auf dem Weg passiert."),
          "Dann schickt er endlich jemanden, der zuhört. Vor drei Nächten kam ein Karren zurück, ohne die Säcke, die er geladen hatte. Der Fahrer hatte Glück. Sie haben ihn laufen lassen, aber er wollte nicht noch einmal durch den Wald.",
          "Er meinte, sie seien nicht auf der Straße geblieben. Eine Spur führte in den Kreuzwald, hinüber zur Lichtung. Ich habe dort seitdem niemanden mehr gesehen – und ich habe auch nicht vor, selbst nachzusehen."],
          antworten: ["weiter", "taeter", "karren"] },
        { wenn: { erledigt: ["fenna"] }, zeilen: ["Wenn du zu den Wachen gehst, sag ihnen, dass nicht nur Reisende betroffen sind. Die Kisten hier verderben."], antworten: [ENDE] },
        { zeilen: ["Ich habe zu tun. Die Kisten sortieren sich nicht von selbst."], antworten: [ENDE] },
      ],
      optionen: [
        { id: "weiter", text: "Ich gebe den Bericht weiter.", folge: [{ f: { erledige: ["fenna"], zeilen: ["Wenn du zu den Wachen gehst, sag ihnen, dass nicht nur Reisende betroffen sind. Die Kisten hier verderben. Und wenn die nächste Lieferung ausbleibt, kann ich die Leute nicht mehr bezahlen."] } }] },
        { id: "taeter", text: "Hat er die Täter gesehen?", folge: [{ f: { weiter: true, zeilen: ["Nur Gestalten zwischen den Bäumen. Keine Wappen, keine Farben, an denen man sie festmachen könnte. Er hat Stimmen gehört und Hufe auf dem Weg. Mehr konnte er nicht sagen."] } }] },
        { id: "karren", text: "Kann ich den Karren untersuchen?", folge: [{ f: { weiter: true, zeilen: [...z(ICH, "Am Karren hängt ein durchtrenntes Zurrband."), "Das Band ist sauber durchtrennt. Das sieht nicht nach einem Radbruch aus. Jemand wollte die Ladung schnell lösen."] } }] },
        tschuess("Gute Wege."),
      ],
    },
    raban: wache("Raban"),
    tilda: wache("Tilda"),
    othmar: {
      reden: [
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Du bist also derjenige, der den Bericht aus dem Kreuzwald gebracht hat. Ich habe die Nachricht aus Waldmark erhalten. Die Sperre war notwendig, aber sie hat auch die Falschen getroffen.",
          ...z(ICH, "Die Banditen haben Wagen überfallen. Das Schriftstück sagt, dass sie die Ladung zu einem Versteck unter einem Haus bringen. Die Lichtung war nur ein Lager."),
          "Dann endet die Sache nicht hier. Ich werde die Sperre für den normalen Verkehr aufheben lassen. Der Weg nach Weidenhain steht dir offen – und du kannst nun auch weiter nach Rabenmoor reisen.",
          "Das Schriftstück ist ein Anfang, kein Ende. Unter einem Haus, bei alten Fässern … Wenn du wieder bereit bist, werden wir diesem Hinweis nachgehen. Nimm diese Anerkennung an. Du hast Waldmark und Weidenhain einen wichtigen Dienst erwiesen."],
          antworten: ["helfen", "sehen"] },
        { wenn: FERTIG, zeilen: ["Die Händler sind dir dankbar. Und das Versteck unter dem Haus lässt mir keine Ruhe."], antworten: [ENDE] },
        { zeilen: ["Weidenhain hat gerade andere Sorgen als Fremde."], antworten: [ENDE] },
      ],
      optionen: [
        { id: "helfen", text: "Ich helfe, wenn ihr dem Versteck nachgeht.", folge: [{ f: { abschluss: true, zeilen: ["Darauf komme ich zurück. Ruh dich aus – Rabenmoor wartet."] } }] },
        { id: "sehen", text: "Ich werde sehen, was sich ergibt.", folge: [{ f: { abschluss: true, zeilen: ["Wie du meinst. Die Tür steht dir offen, wenn du bereit bist."] } }] },
        tschuess("Gute Reise."),
      ],
    },
  },
  /* Schriftstück: 35 % je Bandit (config.ts bandit_dolch, Roll 3 „nur: einsteigerquest“) – nur, solange die Wachen den Beleg verlangen */
  beute: { einsteigerquest: { erledigt: ["wachen"], offen: ["beweis"] } },
  /* Baumstämme (für jeden Spieler, bis die Wachen ihn durchlassen) */
  schranken: [
    /* Hauptstraße vor Weidenhain (Raban und Tilda stehen davor) – gesperrt über die ganze Breite des Kreuzwalds */
    { id: "strasse", feld: [6336, 6647, 6592, 6650], staemme: [[6443, 6648.3, 6.5, 0.12], [6450.5, 6648.6, 6.5, -0.1], [6446.5, 6649.3, 5, 0.05]] },
    /* Kreuzung im Kreuzwald: der Weg nach Süden unterhalb der Lichtung */
    { id: "kreuzung", feld: [6336, 6614, 6592, 6616], staemme: [[6441, 6614.7, 6, 0.08], [6447.5, 6615.1, 6, -0.12]] },
    /* Pfad von der Westmark nach Rabenmoor */
    { id: "westmark", feld: [6272, 6650, 6336, 6653], staemme: [[6321, 6651.2, 6.5, 0.1], [6328, 6651.5, 6.5, -0.08], [6334, 6651.2, 5, 0.15]] },
    /* Osthang (unsichtbar): kein Umweg durch den Wald im Osten */
    { id: "osthang", feld: [6592, 6650, 6656, 6653], staemme: [] },
  ],
  freigaben: { strasse: DURCH, westmark: DURCH, osthang: DURCH, kreuzung: [{ erledigt: ["fenna"] }], weidenhain: DURCH, rabenmoor: DURCH, obstwiesen: DURCH },
  zurueck: { x: 6446.5, y: 6641.5, text: "Die Wachen lassen dich nicht durch – der Weg nach Weidenhain ist gesperrt." },
  belohnungText: "Belohnung: 150 Geschick-XP, 150 Stärke-XP, 150 Fernkampf-XP, 150 Magie-XP, 100 Lebenspunkte-XP, 200 Defense-XP",
  belohnung: { xp: BELOHNUNG },
  punkte: 1,
  alt: (s) => ALT[s] ?? null,
};
