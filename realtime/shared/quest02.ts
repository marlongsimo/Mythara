/*
 * Riftmere – Quest 02 „Der stille Rain“ (Osthof), als Daten für den Quest-Baukasten (shared/questbau.ts, Fahrplan Phase 1b, 26.11.2026).
 * Grundlage: Questdesign „Der stille Rain“ (23.11.2026). Brida Wegner (Wegwartin in Waldmark), Odo Kern und Wenzel (Hofjunge) in Osthof.
 * Mooshocker: 40 LP, passiv, Trainingsgegner (config.ts).
 *
 * Schritte (Bit i = schritte[i]): odo · zaun1–3 · rute1–4 · abgabe · beobachten · kampf (Zähler 0–3).
 * Ältere Stände (bis 26.11.2026: "angenommen", "spuren_Z_R", "abgabe", "beobachten", "kampf_N", "bereit") übersetzt alt() beim Laden.
 */
import type { QuestDef, QuestObjekt, Sperre, Bed } from "./questbau";

export const Q2 = "osthof_der_stille_rain";
/** Der Moosrain (Mitte, Weltfelder) und wie nah man zum Untersuchen der Mooshocker sein muss */
export const MOOSRAIN: [number, number] = [6578, 6411];
export const MOOSRAIN_WEIT = 22;

const ZAUN = ["zaun1", "zaun2", "zaun3"], RUTEN = ["rute1", "rute2", "rute3", "rute4"], SPUREN = [...ZAUN, ...RUTEN];
const SPUREN_LOG = "Untersuche die drei beschädigten Stellen am Hofrain ({n:zaun}) und sammle vier Bündel Weidenruten am Feldweg ({n:ruten}).";
/* die dritte Bruchstelle verrät, wohin die Spuren führen */
const SPUREN_TEXT = " Die Spuren führen zum Moosrain. Die Tiere sind nicht auf Beute aus – sie suchen feuchte, geschützte Stellen.";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] };
const zaunSonst: Sperre[] = [{ wenn: FERTIG, text: "Die Stelle ist mit Weidenruten notdürftig geflickt." }, { wenn: { erledigt: ["abgabe"] }, text: "Die Stelle ist mit Weidenruten notdürftig geflickt." },
  { wenn: NEU, text: "Ein beschädigter Zaunpfahl. Odo Kern am Hofrain weiß vielleicht mehr darüber." }, { wenn: { offen: ["odo"] }, text: "Ein beschädigter Zaunpfahl. Odo Kern am Hofrain weiß vielleicht mehr darüber." }];
const rutenSonst: Sperre[] = [{ wenn: FERTIG, text: "Hier liegen keine brauchbaren Ruten mehr." }, { wenn: { erledigt: ["abgabe"] }, text: "Hier liegen keine brauchbaren Ruten mehr." },
  { wenn: NEU, text: "Ein paar Weidenruten am Wegrand." }, { wenn: { offen: ["odo"] }, text: "Ein paar Weidenruten am Wegrand." }];
const HEIL: Bed[] = [FERTIG, { erledigt: ["abgabe"] }];
const zaun = (id: string, name: string, x: number, y: number, text: string): QuestObjekt => ({ id, name, x, y, modell: "zaun", tat: "untersuchen", weit: 3.2, heil: HEIL,
  text: `${text} ({n:zaun})`, schon: "Diese Stelle hast du dir schon angesehen.", sonst: zaunSonst });
const rute = (id: string, x: number, y: number): QuestObjekt => ({ id, name: "Weidenruten", x, y, modell: "ruten", tat: "aufheben", weit: 3.2,
  text: "Du bindest das Bündel Weidenruten zusammen ({n:ruten}).", schon: "Diese Ruten hast du schon.", sonst: rutenSonst });

/** Stände aus der Zeit vor dem Baukasten (Bits: odo 0, zaun 1–3, ruten 4–7, abgabe 8, beobachten 9, kampf 10) */
function alt(s: string): string | null {
  if (s === "angenommen") return "auftrag_0";
  const m = /^spuren_([0-7])_([0-9]|1[0-5])$/.exec(s); if (m) return `auftrag_${1 | (Number(m[1]) << 1) | (Number(m[2]) << 4)}`;
  if (s === "abgabe") return "auftrag_255"; if (s === "beobachten") return "auftrag_511";
  const k = /^kampf_([0-2])$/.exec(s); if (k) return `auftrag_1023` + (Number(k[1]) ? `_${k[1]}` : "");
  if (s === "bereit") return "auftrag_2047_3"; return null; }

const ENDE = "tschuess";
export const QUEST2: QuestDef = {
  id: Q2, titel: "Der stille Rain", ort: "Osthof",
  start: "Sprich mit Brida Wegner am Wegposten im Süden der Waldmark.",
  logNeu: "Brida Wegner wartet am Wegposten im Süden der Waldmark. Sie hat einen Auftrag für jemanden, der nach Osthof geht.",
  logFertig: "Der Zaun ist vorläufig gesichert und Odo ist zufrieden. Die Mooshocker bleiben am Moosrain – dort kannst du dich weiter mit ihnen messen.",
  logAbgabe: "Drei Mooshocker sind besiegt. Kehre zu Odo Kern am Hofrain zurück.",
  geber: "brida", abgabe: "odo",
  figuren: [
    /* Wegposten am Südausgang der Waldmark (der Weg führt durch den Kreuzwald nach Osthof) */
    { id: "brida", name: "Brida Wegner", modell: "npcfrau3d", x: 6452.5, y: 6462.5, blick: [-1, 0] },
    /* Hofrain: am Westende der Zaunreihe vor dem großen Feld im Südosten des Osthofs */
    { id: "odo", name: "Odo Kern", modell: "npc.alter_bauer", x: 6546.5, y: 6441.5, blick: [0, -1] },
    { id: "wenzel", name: "Wenzel", modell: "npc.junge", x: 6544.5, y: 6443.5, blick: [1, 0] },
  ],
  schritte: [
    { id: "odo", text: "Odo Kern am Hofrain in Osthof finden", ereignis: { art: "antwort" }, bei: "odo", wo: "odo",
      log: "Brida Wegner hat dich gebeten, Odo Kern am Hofrain in Osthof aufzusuchen. Dort ist die Einfriedung beschädigt." },
    ...ZAUN.map((id) => ({ id, text: "Die Bruchstellen untersuchen", ereignis: { art: "objekt" as const, id }, nach: ["odo"], gruppe: "zaun", log: SPUREN_LOG })),
    ...RUTEN.map((id) => ({ id, text: "Vier Bündel Weidenruten sammeln", ereignis: { art: "objekt" as const, id }, nach: ["odo"], gruppe: "ruten", log: SPUREN_LOG })),
    { id: "abgabe", text: "Die Ruten bei Odo abgeben", ereignis: { art: "antwort" }, nach: SPUREN, bei: "odo", wo: "odo",
      log: "Du hast alle Bruchstellen untersucht und genug Weidenruten gesammelt. Bring sie zu Odo Kern am Hofrain." },
    { id: "beobachten", text: "Einen Mooshocker untersuchen", ereignis: { art: "untersuchen", ziel: "mooshocker", bei: [MOOSRAIN[0], MOOSRAIN[1], MOOSRAIN_WEIT] }, nach: ["abgabe"], wo: MOOSRAIN,
      log: "Die Schleifspuren führen zum Moosrain nordöstlich der Windmühle. Untersuche einen Mooshocker, um herauszufinden, wie er sich verhält." },
    { id: "kampf", text: "Drei Mooshocker besiegen", ereignis: { art: "erlegen", typ: "mooshocker" }, anzahl: 3, nach: ["beobachten"], wo: MOOSRAIN,
      log: "Die Mooshocker blockieren den Bereich am Zaun. Besiege drei von ihnen am Moosrain ({n:kampf}), damit Odo den Rain wieder nutzen kann." },
  ],
  objekte: [
    /* drei Bruchstellen auf dem Weg vom Hofrain zum Moosrain, vier Rutenbündel am Feldweg */
    zaun("zaun1", "Bruchstelle am Weg", 6556.5, 6428.5, "Der Pfahl ist nicht sauber gebrochen. Er wurde samt Wurzel aus dem Boden gedrückt. Am Holz klebt feuchtes Moos – etwas Schweres hat sich dagegengelehnt."),
    zaun("zaun2", "Bruchstelle bei den Steinen", 6562.5, 6416.5, "Zwischen zwei Steinen liegt ein breiter, runder Abdruck. Die Kante ist glatt gerieben – die Kreatur bewegt sich bodennah und nimmt immer wieder dieselbe Strecke."),
    zaun("zaun3", "Bruchstelle am Feldrand", 6560.5, 6409.5, "Im Gras liegt ein zusammengedrücktes Moospolster, daneben kurze Schleifspuren. Hier hat etwas geruht und seinen Panzer an der rauen Fläche gerieben." + SPUREN_TEXT),
    rute("rute1", 6543.5, 6437.5), rute("rute2", 6551.5, 6435.5), rute("rute3", 6559.5, 6431.5), rute("rute4", 6566.5, 6426.5),
  ],
  dialoge: {
    brida: {
      reden: [
        { wenn: NEU, zeilen: ["Du gehst nach Osten? Dann habe ich etwas für dich. Odo Kern aus Osthof hat um Hilfe gebeten. Kein Hilferuf, eher eine Bitte, die er nicht allein erledigt bekommt.",
          "Am Hofrain ist die Einfriedung an mehreren Stellen offen. Er schreibt von seltsamen Spuren und kleinen Tieren, die sich dort breitmachen. Nimm den Weg nach Osthof und melde dich bei ihm."],
          antworten: ["gefahr", "annehmen", "spaeter"] },
        { wenn: FERTIG, zeilen: ["Odo hat mir geschrieben. Der Zaun steht wieder – und er sagt, du hättest dir die Dinge erst angesehen, bevor du draufgehauen hast. Gut so."], antworten: [ENDE] },
        { zeilen: ["Odo Kern wartet am Hofrain in Osthof. Nimm den Weg durch den Kreuzwald nach Osten – und sag ihm, dass Brida dich schickt."], antworten: [ENDE] },
      ],
      optionen: [
        { id: "gefahr", text: "Sind dort gefährliche Kreaturen?", folge: [{ f: { weiter: true, zeilen: ["Nicht nach allem, was ich gehört habe. Sie sollen zäh sein und sich kaum vertreiben lassen. Aber sie jagen niemanden. Odo wird dir zeigen, worauf du achten musst."] } }] },
        { id: "annehmen", text: "Ich sehe nach. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Sag ihm, dass Brida dich geschickt hat. Und sieh dir die Dinge erst an, bevor du draufhaust."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Wie du meinst. Ich stehe hier am Wegposten, falls du es dir anders überlegst."] } }] },
        { id: ENDE, text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Gute Wege."] } }] },
      ],
    },
    odo: {
      reden: [
        { wenn: NEU, zeilen: ["Der Zaun macht mir Sorgen, aber das ist meine Sache. Wenn du helfen willst – in Waldmark am Wegposten weiß Brida Bescheid."], antworten: [ENDE] },
        { wenn: FERTIG, zeilen: ["Die Ruten halten. Und wenn du deine Waffen ausprobieren willst – die Mooshocker sind am Moosrain. Sie lassen dir Zeit, deinen eigenen Takt zu finden."], antworten: [ENDE] },
        { wenn: { offen: ["odo"] }, zeilen: ["Brida hat dich also geschickt. Gut. Sieh dich um: Der Rain war gestern noch geschlossen. Heute kann man an drei Stellen hindurchgehen.",
          "Keine Stiefelspuren, keine Hufe. Nur runde Schleifspuren im feuchten Boden und Moos, das an den Steinen abgerieben wurde. Die Mooshocker sind wieder da."], antworten: ["mooshocker", "auftrag"] },
        { wenn: { alle: true }, zeilen: ["Du hast sie aus dem Zaunbereich vertrieben. Gut. Die Ruten halten jetzt, und die Tiere werden sich wieder an den Steinrändern sammeln."], antworten: ["wieder", "lohn"] },
        { wenn: { erledigt: SPUREN, offen: ["abgabe"] }, zeilen: ["Du hast die Ruten? Und die Bruchstellen angesehen?"], antworten: ["abgeben"] },
        { wenn: { offen: ["abgabe"] }, zeilen: ["Sieh dir die drei Bruchstellen an ({n:zaun}) und bring mir vier Bündel Weidenruten vom Feldweg ({n:ruten}). Dann sichern wir den Zaun."], antworten: [ENDE] },
        { wenn: { offen: ["beobachten"] }, zeilen: ["Geh zum Moosrain, nordöstlich der Windmühle. Sieh dir einen der Mooshocker genau an, bevor du etwas tust."], antworten: [ENDE] },
        { zeilen: ["Sie greifen dich nicht an, solange du sie in Ruhe lässt. Vertreib drei von ihnen aus dem Zaunbereich ({n:kampf})."], antworten: [ENDE] },
      ],
      optionen: [
        { id: "mooshocker", text: "Mooshocker?", folge: [{ f: { weiter: true, zeilen: ["So nennen wir sie. Kleine, gedrungene Tiere mit einem Rücken wie ein alter Stein. Sie sind langsam, aber wenn sie sich einmal festgesetzt haben, rücken sie nicht freiwillig ab."] } }] },
        { id: "auftrag", text: "Was soll ich tun?", folge: [{ f: { erledige: ["odo"], zeilen: ["Sieh dir die drei Bruchstellen an – eine am Weg, eine bei den Steinen, eine am Feldrand. Dann bring mir vier brauchbare Bündel Weidenruten vom Rand des Feldwegs. Damit können wir den Zaun vorläufig sichern."] } }] },
        { id: "abgeben", text: "Die Weidenruten übergeben.", folge: [{ f: { erledige: ["abgabe"], zeilen: ["Das reicht. Die Ruten halten die Pfähle nicht für immer, aber bis morgen. Jetzt fehlt nur noch, dass die Mooshocker den Rain wieder freigeben.",
          "Geh zum Moosrain, nordöstlich der Windmühle, und sieh dir einen von ihnen genau an. Sie greifen nicht von selbst an."] } }] },
        { id: "wieder", text: "Kommen sie wieder?", folge: [{ f: { weiter: true, zeilen: ["Sicher. Der Moosrain gehört nicht nur uns. Wenn es feucht wird, ziehen sie wieder her. Lass sie dort. Auf dem Feld brauchen wir sie nicht, aber ausrotten müssen wir sie auch nicht."] } }] },
        { id: "lohn", text: "Dann ist meine Arbeit hier getan.", folge: [{ f: { abschluss: true, zeilen: ["Du hast heute mehr gelernt als nur, wie man einen Zaun flickt. Wenn du deine Waffen ausprobieren willst, findest du sie dort draußen wieder. Sie sind zäh – aber sie lassen dir Zeit, deinen eigenen Takt zu finden.",
          "Nimm das hier. Nicht viel, aber ein fairer Lohn. Und wenn du wieder in Osthof bist, weißt du jetzt, wo du mich findest."] } }] },
        { id: ENDE, text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Bis bald."] } }] },
      ],
    },
    wenzel: {
      reden: [
        { wenn: { zaehler: { schritt: "kampf", min: 1 } }, zeilen: ["Ich hab's gesehen! Du hast dich von dem Stein mit Gras darauf nicht überraschen lassen. Das erzähl ich Odo.",
          "Wenn sie sich zusammenrollen, sehen sie aus wie ein Stein mit Gras darauf. Mein Bruder hat einmal einen aufgehoben. Der Stein hat ihn gebissen."], antworten: [ENDE] },
        { zeilen: ["Wenn sie sich zusammenrollen, sehen sie aus wie ein Stein mit Gras darauf. Mein Bruder hat einmal einen aufgehoben. Der Stein hat ihn gebissen."], antworten: [ENDE] },
      ],
      optionen: [{ id: ENDE, text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Pass auf die Steine auf!"] } }] }],
    },
  },
  belohnungText: "Belohnung: 20 Splitter",
  belohnung: { splitter: 20 },
  /* #81: wer den Rain befriedet hat, den greifen die Mooshocker danach an (MonsterDef.aggressivNach in shared/config.ts) */
  schalter: { moosrain_wach: FERTIG },
  punkte: 1,
  alt,
};
