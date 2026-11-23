/*
 * Mythara – Quest 02 „Der stille Rain“ (Osthof). Eine Quelle für Server (Ablauf, Dialoge, Prüfungen) und Browser (Figuren, Questobjekte, Questlog).
 * Grundlage: Questdesign „Der stille Rain“ (23.11.2026). Festlegungen aus dem Gespräch: neue Namen statt Tilda Bruch und Mira (beide schon vergeben) –
 *   Brida Wegner (Wegwartin in Waldmark) und Wenzel (Hofjunge in Osthof); Odo Kern bleibt. Mooshocker: 40 LP, passiv, Trainingsgegner (config.ts).
 * Alles ist je Spieler: Der Server führt den Stand (Migration 045, rpg_held.quests – derselbe Speicher wie Quest 01, eigene Quest-ID).
 * Zähler stecken im Stand (Migration 045 erlaubt [a-z0-9_]{1,24}):
 *   ""                nie angenommen (Brida bietet den Auftrag an)
 *   "angenommen"      zu Odo Kern nach Osthof
 *   "spuren_Z_R"      Z = Bitmaske der untersuchten Bruchstellen (0–7), R = Bitmaske der gesammelten Rutenbündel (0–15)
 *   "abgabe"          alles beisammen: zurück zu Odo (die Ruten werden bei ihm abgegeben)
 *   "beobachten"      einen Mooshocker untersuchen
 *   "kampf_N"         N Mooshocker besiegt (0–2)
 *   "bereit"          drei besiegt: Abschluss bei Odo
 *   "fertig"          abgeschlossen (nur über rpg_held_quest_abschluss)
 */
import type { Zeile, Antwort } from "./quest01";

export const Q2 = "osthof_der_stille_rain";
export type Stand2 = string;
export type Phase = "" | "angenommen" | "spuren" | "abgabe" | "beobachten" | "kampf" | "bereit" | "fertig";
const PHASEN: Phase[] = ["", "angenommen", "spuren", "abgabe", "beobachten", "kampf", "bereit", "fertig"];
export interface Lage { phase: Phase; zaun: number; ruten: number; kills: number }
/** Stand lesen (Unbekanntes = nie angenommen) */
export function lage(s: Stand2): Lage {
  const m = /^spuren_([0-7])_([0-9]|1[0-5])$/.exec(s || ""); if (m) return { phase: "spuren", zaun: Number(m[1]), ruten: Number(m[2]), kills: 0 };
  const k = /^kampf_([0-2])$/.exec(s || ""); if (k) return { phase: "kampf", zaun: 7, ruten: 15, kills: Number(k[1]) };
  const p = (PHASEN as string[]).includes(s) ? (s as Phase) : ""; const nach = PHASEN.indexOf(p) > PHASEN.indexOf("spuren");
  return { phase: p, zaun: nach ? 7 : 0, ruten: nach ? 15 : 0, kills: p === "bereit" || p === "fertig" ? 3 : 0 }; }
/** Stand schreiben */
export function stand(l: Lage): Stand2 {
  if (l.phase === "spuren") return l.zaun === 7 && l.ruten === 15 ? "abgabe" : `spuren_${l.zaun}_${l.ruten}`;
  if (l.phase === "kampf") return l.kills >= 3 ? "bereit" : `kampf_${l.kills}`; return l.phase; }
export const gueltig = (s: unknown): Stand2 => (typeof s === "string" && (s === "" || stand(lage(s)) === s) ? s : "");
export const rang2 = (s: Stand2): number => PHASEN.indexOf(lage(s).phase);
/** Die Quest läuft (angenommen, noch nicht abgeschlossen) */
export const laeuft2 = (s: Stand2): boolean => { const p = lage(s).phase; return p !== "" && p !== "fertig"; };
export const bits = (n: number): number => { let c = 0; for (; n; n &= n - 1) c++; return c; };
export const BELOHNUNG2 = { splitter: 20 };
export const ZIEL_KILLS = 3;

/* ---------- Figuren (Weltfelder; Waldmark 6400/6400, Osthof 6496/6400) ---------- */
export type NpcId2 = "brida" | "odo" | "wenzel";
export interface QuestNpc2 { id: NpcId2; name: string; modell: string; x: number; y: number; blick: [number, number] }
export const NPCS2: QuestNpc2[] = [
  /* Wegposten am Südausgang der Waldmark (der Weg führt durch den Kreuzwald nach Osthof) */
  { id: "brida", name: "Brida Wegner", modell: "npcfrau3d", x: 6452.5, y: 6462.5, blick: [-1, 0] },
  /* Hofrain: am Westende der Zaunreihe vor dem großen Feld im Südosten des Osthofs */
  { id: "odo", name: "Odo Kern", modell: "npc.alter_bauer", x: 6546.5, y: 6441.5, blick: [0, -1] },
  { id: "wenzel", name: "Wenzel", modell: "npc.junge", x: 6544.5, y: 6443.5, blick: [1, 0] },
];
export const npc2 = (id: string): QuestNpc2 | undefined => NPCS2.find((n) => n.id === id);

/* ---------- Questobjekte (Osthof): drei Bruchstellen auf dem Weg vom Hofrain zum Moosrain, vier Rutenbündel am Feldweg ---------- */
export interface Ding { id: string; nr: number; x: number; y: number; name: string; text: string }
export const BRUCHSTELLEN: Ding[] = [
  { id: "zaun1", nr: 0, x: 6556.5, y: 6428.5, name: "Bruchstelle am Weg", text: "Der Pfahl ist nicht sauber gebrochen. Er wurde samt Wurzel aus dem Boden gedrückt. Am Holz klebt feuchtes Moos – etwas Schweres hat sich dagegengelehnt." },
  { id: "zaun2", nr: 1, x: 6562.5, y: 6416.5, name: "Bruchstelle bei den Steinen", text: "Zwischen zwei Steinen liegt ein breiter, runder Abdruck. Die Kante ist glatt gerieben – die Kreatur bewegt sich bodennah und nimmt immer wieder dieselbe Strecke." },
  { id: "zaun3", nr: 2, x: 6560.5, y: 6409.5, name: "Bruchstelle am Feldrand", text: "Im Gras liegt ein zusammengedrücktes Moospolster, daneben kurze Schleifspuren. Hier hat etwas geruht und seinen Panzer an der rauen Fläche gerieben." },
];
export const RUTEN: Ding[] = [
  { id: "rute1", nr: 0, x: 6543.5, y: 6437.5, name: "Weidenruten", text: "Ein Bündel biegsamer Weidenruten." },
  { id: "rute2", nr: 1, x: 6551.5, y: 6435.5, name: "Weidenruten", text: "Ein Bündel biegsamer Weidenruten." },
  { id: "rute3", nr: 2, x: 6559.5, y: 6431.5, name: "Weidenruten", text: "Ein Bündel biegsamer Weidenruten." },
  { id: "rute4", nr: 3, x: 6566.5, y: 6426.5, name: "Weidenruten", text: "Ein Bündel biegsamer Weidenruten." },
];
export const DING_WEIT = 2.2;
/** Der Moosrain (Mitte, Weltfelder) und wie nah man zum Untersuchen der Mooshocker sein muss */
export const MOOSRAIN: [number, number] = [6578, 6411];
export const MOOSRAIN_WEIT = 22;
export const SPUREN_TEXT = "Die Spuren führen zum Moosrain. Die Tiere sind nicht auf Beute aus – sie suchen feuchte, geschützte Stellen.";

/** Questlog: was als Nächstes zu tun ist */
export function questlog2(s: Stand2): string {
  const l = lage(s);
  switch (l.phase) {
    case "": return "Brida Wegner wartet am Wegposten im Süden der Waldmark. Sie hat einen Auftrag für jemanden, der nach Osthof geht.";
    case "angenommen": return "Brida Wegner hat dich gebeten, Odo Kern am Hofrain in Osthof aufzusuchen. Dort ist die Einfriedung beschädigt.";
    case "spuren": return `Untersuche die drei beschädigten Stellen am Hofrain (${bits(l.zaun)}/3) und sammle vier Bündel Weidenruten am Feldweg (${bits(l.ruten)}/4).` + (l.zaun === 7 ? " " + SPUREN_TEXT : "");
    case "abgabe": return "Du hast alle Bruchstellen untersucht und genug Weidenruten gesammelt. Bring sie zu Odo Kern am Hofrain.";
    case "beobachten": return "Die Schleifspuren führen zum Moosrain nordöstlich der Windmühle. Untersuche einen Mooshocker, um herauszufinden, wie er sich verhält.";
    case "kampf": return `Die Mooshocker blockieren den Bereich am Zaun. Besiege drei von ihnen am Moosrain (${l.kills}/3), damit Odo den Rain wieder nutzen kann.`;
    case "bereit": return "Drei Mooshocker sind besiegt. Kehre zu Odo Kern am Hofrain zurück.";
    case "fertig": return "Der Zaun ist vorläufig gesichert und Odo ist zufrieden. Die Mooshocker bleiben am Moosrain – dort kannst du dich weiter mit ihnen messen.";
  }
}
/** Die Schritte für die Details (erledigt / aktuell) */
export const SCHRITTE2: { text: string; ab: Phase }[] = [
  { text: "Mit Brida Wegner in Waldmark sprechen", ab: "angenommen" }, { text: "Odo Kern am Hofrain in Osthof finden", ab: "spuren" },
  { text: "Bruchstellen untersuchen und Weidenruten sammeln", ab: "abgabe" }, { text: "Die Ruten bei Odo abgeben", ab: "beobachten" },
  { text: "Einen Mooshocker untersuchen", ab: "kampf" }, { text: "Drei Mooshocker besiegen", ab: "bereit" }, { text: "Zu Odo zurückkehren", ab: "fertig" }];

/** Wohin es als Nächstes geht (Pfeil, Marke): eine Figur oder eine Stelle */
export function ziel2(s: Stand2): NpcId2 | [number, number] | null {
  const l = lage(s);
  if (l.phase === "") return "brida"; if (l.phase === "angenommen" || l.phase === "abgabe" || l.phase === "bereit") return "odo";
  if (l.phase === "spuren") { const b = BRUCHSTELLEN.find((d) => !(l.zaun & (1 << d.nr))); if (b) return [b.x, b.y]; const r = RUTEN.find((d) => !(l.ruten & (1 << d.nr))); return r ? [r.x, r.y] : "odo"; }
  if (l.phase === "beobachten" || l.phase === "kampf") return MOOSRAIN; return null; }

/* ---------- Dialogbuch ---------- */
export interface Dialog2 { npc: NpcId2; name: string; zeilen: Zeile[]; antworten: Antwort[] }
export interface Folge2 { stand?: Stand2; abschluss?: boolean; weiter?: boolean; zeilen?: Zeile[] }
const ICH = "Du";
const z = (wer: string, ...t: string[]): Zeile[] => t.map((text) => ({ wer, text }));
const ENDE: Antwort = { id: "tschuess", text: "Auf Wiedersehen." };

export function dialog2(id: NpcId2, s: Stand2): Dialog2 | null {
  const N = npc2(id); if (!N) return null; const d = (zeilen: Zeile[], antworten: Antwort[]): Dialog2 => ({ npc: id, name: N.name, zeilen, antworten }), l = lage(s);
  if (id === "brida") {
    if (l.phase === "") return d([...z("Brida Wegner", "Du gehst nach Osten? Dann habe ich etwas für dich. Odo Kern aus Osthof hat um Hilfe gebeten. Kein Hilferuf, eher eine Bitte, die er nicht allein erledigt bekommt.",
      "Am Hofrain ist die Einfriedung an mehreren Stellen offen. Er schreibt von seltsamen Spuren und kleinen Tieren, die sich dort breitmachen. Nimm den Weg nach Osthof und melde dich bei ihm.")],
      [{ id: "gefahr", text: "Sind dort gefährliche Kreaturen?" }, { id: "annehmen", text: "Ich sehe nach. (Quest annehmen)" }, { id: "spaeter", text: "Jetzt nicht." }]);
    if (l.phase === "fertig") return d(z("Brida Wegner", "Odo hat mir geschrieben. Der Zaun steht wieder – und er sagt, du hättest dir die Dinge erst angesehen, bevor du draufgehauen hast. Gut so."), [ENDE]);
    return d(z("Brida Wegner", "Odo Kern wartet am Hofrain in Osthof. Nimm den Weg durch den Kreuzwald nach Osten – und sag ihm, dass Brida dich schickt."), [ENDE]);
  }
  if (id === "odo") {
    if (l.phase === "") return d(z("Odo Kern", "Der Zaun macht mir Sorgen, aber das ist meine Sache. Wenn du helfen willst – in Waldmark am Wegposten weiß Brida Bescheid."), [ENDE]);
    if (l.phase === "angenommen") return d([...z("Odo Kern", "Brida hat dich also geschickt. Gut. Sieh dich um: Der Rain war gestern noch geschlossen. Heute kann man an drei Stellen hindurchgehen.",
      "Keine Stiefelspuren, keine Hufe. Nur runde Schleifspuren im feuchten Boden und Moos, das an den Steinen abgerieben wurde. Die Mooshocker sind wieder da.")],
      [{ id: "mooshocker", text: "Mooshocker?" }, { id: "auftrag", text: "Was soll ich tun?" }]);
    if (l.phase === "spuren") return d(z("Odo Kern", `Sieh dir die drei Bruchstellen an (${bits(l.zaun)}/3) und bring mir vier Bündel Weidenruten vom Feldweg (${bits(l.ruten)}/4). Dann sichern wir den Zaun.`), [ENDE]);
    if (l.phase === "abgabe") return d(z("Odo Kern", "Du hast die Ruten? Und die Bruchstellen angesehen?"), [{ id: "abgeben", text: "Die Weidenruten übergeben." }]);
    if (l.phase === "beobachten") return d(z("Odo Kern", "Geh zum Moosrain, nordöstlich der Windmühle. Sieh dir einen der Mooshocker genau an, bevor du etwas tust."), [ENDE]);
    if (l.phase === "kampf") return d(z("Odo Kern", `Sie greifen dich nicht an, solange du sie in Ruhe lässt. Vertreib drei von ihnen aus dem Zaunbereich (${l.kills}/3).`), [ENDE]);
    if (l.phase === "bereit") return d([...z("Odo Kern", "Du hast sie aus dem Zaunbereich vertrieben. Gut. Die Ruten halten jetzt, und die Tiere werden sich wieder an den Steinrändern sammeln.")],
      [{ id: "wieder", text: "Kommen sie wieder?" }, { id: "lohn", text: "Dann ist meine Arbeit hier getan." }]);
    return d(z("Odo Kern", "Die Ruten halten. Und wenn du deine Waffen ausprobieren willst – die Mooshocker sind am Moosrain. Sie lassen dir Zeit, deinen eigenen Takt zu finden."), [ENDE]);
  }
  if (id === "wenzel") {
    const nach = l.phase === "bereit" || l.phase === "fertig" || (l.phase === "kampf" && l.kills > 0);
    return d(z("Wenzel", ...(nach ? ["Ich hab's gesehen! Du hast dich von dem Stein mit Gras darauf nicht überraschen lassen. Das erzähl ich Odo."] : []),
      "Wenn sie sich zusammenrollen, sehen sie aus wie ein Stein mit Gras darauf. Mein Bruder hat einmal einen aufgehoben. Der Stein hat ihn gebissen."), [ENDE]);
  }
  return null;
}

/** Was eine Antwort bewirkt; null = unbekannte Antwort */
export function antwort2(id: NpcId2, s: Stand2, a: string): Folge2 | null {
  if (a === "tschuess") return {}; const l = lage(s);
  if (id === "brida" && l.phase === "") {
    if (a === "gefahr") return { weiter: true, zeilen: z("Brida Wegner", "Nicht nach allem, was ich gehört habe. Sie sollen zäh sein und sich kaum vertreiben lassen. Aber sie jagen niemanden. Odo wird dir zeigen, worauf du achten musst.") };
    if (a === "annehmen") return { stand: "angenommen", zeilen: z("Brida Wegner", "Sag ihm, dass Brida dich geschickt hat. Und sieh dir die Dinge erst an, bevor du draufhaust.") };
    if (a === "spaeter") return { zeilen: z("Brida Wegner", "Wie du meinst. Ich stehe hier am Wegposten, falls du es dir anders überlegst.") };
  }
  if (id === "odo") {
    if (l.phase === "angenommen") {
      if (a === "mooshocker") return { weiter: true, zeilen: z("Odo Kern", "So nennen wir sie. Kleine, gedrungene Tiere mit einem Rücken wie ein alter Stein. Sie sind langsam, aber wenn sie sich einmal festgesetzt haben, rücken sie nicht freiwillig ab.") };
      if (a === "auftrag") return { stand: "spuren_0_0", zeilen: z("Odo Kern", "Sieh dir die drei Bruchstellen an – eine am Weg, eine bei den Steinen, eine am Feldrand. Dann bring mir vier brauchbare Bündel Weidenruten vom Rand des Feldwegs. Damit können wir den Zaun vorläufig sichern.") };
    }
    if (l.phase === "abgabe" && a === "abgeben") return { stand: "beobachten", zeilen: z("Odo Kern", "Das reicht. Die Ruten halten die Pfähle nicht für immer, aber bis morgen. Jetzt fehlt nur noch, dass die Mooshocker den Rain wieder freigeben.",
      "Geh zum Moosrain, nordöstlich der Windmühle, und sieh dir einen von ihnen genau an. Sie greifen nicht von selbst an.") };
    if (l.phase === "bereit") {
      if (a === "wieder") return { weiter: true, zeilen: z("Odo Kern", "Sicher. Der Moosrain gehört nicht nur uns. Wenn es feucht wird, ziehen sie wieder her. Lass sie dort. Auf dem Feld brauchen wir sie nicht, aber ausrotten müssen wir sie auch nicht.") };
      if (a === "lohn") return { abschluss: true, zeilen: z("Odo Kern", "Du hast heute mehr gelernt als nur, wie man einen Zaun flickt. Wenn du deine Waffen ausprobieren willst, findest du sie dort draußen wieder. Sie sind zäh – aber sie lassen dir Zeit, deinen eigenen Takt zu finden.",
        "Nimm das hier. Nicht viel, aber ein fairer Lohn. Und wenn du wieder in Osthof bist, weißt du jetzt, wo du mich findest.") };
    }
  }
  return null;
}

/** Ein Questobjekt benutzen: neuer Stand und Text (oder Fehler) – der Server prüft vorher die Entfernung */
export function dingBenutzen(s: Stand2, id: string): { stand?: Stand2; text: string } {
  const l = lage(s), b = BRUCHSTELLEN.find((d) => d.id === id), r = RUTEN.find((d) => d.id === id);
  if (!b && !r) return { text: "Hier ist nichts." };
  if (l.phase !== "spuren") return { text: b ? (rang2(s) > rang2("spuren_0_0") ? "Die Stelle ist mit Weidenruten notdürftig geflickt." : "Ein beschädigter Zaunpfahl. Odo Kern am Hofrain weiß vielleicht mehr darüber.") : rang2(s) > rang2("spuren_0_0") ? "Hier liegen keine brauchbaren Ruten mehr." : "Ein paar Weidenruten am Wegrand." };
  if (b) { if (l.zaun & (1 << b.nr)) return { text: "Diese Stelle hast du dir schon angesehen." };
    const n = { ...l, zaun: l.zaun | (1 << b.nr) }; return { stand: stand(n), text: b.text + (n.zaun === 7 ? " " + SPUREN_TEXT : ` (${bits(n.zaun)}/3)`) }; }
  if (l.ruten & (1 << r!.nr)) return { text: "Diese Ruten hast du schon." };
  const n = { ...l, ruten: l.ruten | (1 << r!.nr) }; return { stand: stand(n), text: `Du bindest das Bündel Weidenruten zusammen (${bits(n.ruten)}/4).` }; }
/** Einen Mooshocker untersuchen: Stand weiter, wenn die Quest darauf wartet */
export function mooshockerUntersucht(s: Stand2): Stand2 | null { return lage(s).phase === "beobachten" ? "kampf_0" : null; }
/** Ein Mooshocker besiegt: zählt nur in der Kampfphase */
export function mooshockerBesiegt(s: Stand2): Stand2 | null { const l = lage(s); return l.phase === "kampf" ? stand({ ...l, kills: l.kills + 1 }) : null; }
