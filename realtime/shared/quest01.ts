/*
 * Mythara – Quest 01 „Die gesperrte Straße“ (Einführungsquest in Waldmark). Eine Quelle für Server (Ablauf, Dialoge) und Browser (Figuren, Sperren, Questlog).
 * Grundlage: Designdossier „Mythara_Quest01_Die_gesperrte_Strasse“ (22.11.2026) mit den Festlegungen aus dem Gespräch:
 *   Ort Weidenhain (Name im Spiel), Informationen auf dem Osthof (die Obstwiesen liegen hinter der Sperre), Belohnung 150 XP je Kampfskill + 100 LP + 200 Defense,
 *   Schriftstück = Hinweispergament (35 % je Bandit, nur solange die Quest läuft), keine Questtasche, sichtbare Sperren an drei Stellen.
 * Alles ist je Spieler: Der Server führt den Stand (Migration 045, rpg_held.quests) und schickt Dialoge nur an den, der spricht.
 */
export const Q1 = "die_gesperrte_strasse";
/** Die Stände in ihrer Reihenfolge ("" = nie angeboten) */
export const STAENDE = ["angeboten", "angenommen", "auftrag", "osthof", "wachen", "beweis", "bestaetigt", "frei", "fertig"] as const;
export type Stand = (typeof STAENDE)[number] | "";
export const rang = (s: Stand): number => (s ? STAENDE.indexOf(s) : -1);
/** Die Quest läuft (angenommen bis Durchreise frei): nur dann kann ein Bandit das Schriftstück fallen lassen */
export const laeuft = (s: Stand): boolean => rang(s) >= rang("angenommen") && rang(s) <= rang("frei");
/** Die Sperre ist für diesen Spieler offen */
export const sperreOffen = (s: Stand): boolean => s === "frei" || s === "fertig";
/** Regionen hinter der Sperre */
export const HINTER_DER_SPERRE = new Set(["weidenhain", "rabenmoor", "obstwiesen"]);
export const SCHRIFTSTUECK = "hinweispergament";
export const BELOHNUNG = { geschick: 150, staerke: 150, fernkampf: 150, magie: 150, lp: 100, defense: 200 };

export const QUESTLOG: Record<Exclude<Stand, "">, string> = {
  angeboten: "Ein Kind in Waldmark bittet dich um Hilfe. Sprich Jori noch einmal an, wenn du es dir überlegt hast.",
  angenommen: "Der Bürgermeister von Waldmark braucht Hilfe. Finde heraus, warum der Handel nach Weidenhain zum Erliegen gekommen ist. Er ist im Rathaus am Marktplatz.",
  auftrag: "Sprich mit Fenna auf dem Osthof (östlich von Waldmark, an der Steinstraße). Vielleicht hat dort jemand etwas über die Überfälle erfahren.",
  osthof: "Die Berichte vom Osthof deuten auf Überfälle im Kreuzwald. Befrage die Wachen an der Straßensperre im Süden des Kreuzwalds.",
  wachen: "Die Wachen bestätigen die Überfälle. Suche das Banditenlager auf der Lichtung im Kreuzwald, besiege die Banditen und sichere das Schriftstück, das einer von ihnen bei sich trägt.",
  beweis: "Bringe das Schriftstück zum Bürgermeister von Waldmark.",
  bestaetigt: "Der Bürgermeister hat den Hinweis bestätigt. Kehre zur Straßensperre zurück.",
  frei: "Der Weg ist offen. Sprich mit dem Bürgermeister von Weidenhain auf dem Dorfplatz.",
  fertig: "Die Sperre ist für dich aufgehoben. Weidenhain und Rabenmoor sind erreichbar. Das Schriftstück deutet auf einen Unterschlupf unter einem Haus hin – die Spur führt weiter nach Rabenmoor.",
};

/* ---------- Figuren (Weltfelder; Waldmark beginnt bei 6400/6400, der Kreuzwald bei 6336/6464) ---------- */
export type NpcId = "jori" | "hagan" | "fenna" | "raban" | "tilda" | "othmar";
export interface QuestNpc { id: NpcId; name: string; modell: string; x: number; y: number; /** Blickrichtung (Felder) */ blick: [number, number]; /** wandert schon (Bürgermeister im Rathaus) */ wandert?: string }
export const NPCS: QuestNpc[] = [
  { id: "jori", name: "Jori", modell: "npc.maedchen", x: 6452.5, y: 6444.5, blick: [0, -1] },
  { id: "hagan", name: "Hagan Voss", modell: "npc.buergermeister_waldmark", x: 6438.5, y: 6423.5, blick: [0, 1], wandert: "npc.buergermeister_waldmark" },
  { id: "fenna", name: "Fenna Ried", modell: "npc.marktfrau", x: 6534.5, y: 6438.5, blick: [0, 1] },
  { id: "raban", name: "Wachtmann Raban", modell: "stadtwache3d", x: 6442.5, y: 6645.5, blick: [0, -1] },
  { id: "tilda", name: "Wachtfrau Tilda", modell: "stadtwache3d", x: 6450.5, y: 6645.5, blick: [0, -1] },
  { id: "othmar", name: "Othmar Rehn", modell: "npc.alter_bauer", x: 6451.5, y: 6688.5, blick: [0, -1] },
];
export const npc = (id: string): QuestNpc | undefined => NPCS.find((n) => n.id === id);
/** So nah muss man stehen, um zu reden (Felder) */
export const REDE_WEIT = 3.5;

/* ---------- Sperren: Baumstämme (gesperrte Felder x0, y0, x1, y1) – für jeden Spieler, bis die Wachen ihn durchlassen ---------- */
export interface Sperre { id: string; feld: [number, number, number, number]; /** Baumstämme: Mitte x, y, Länge, Drehung (rad) */ staemme: [number, number, number, number][] }
export const SPERREN: Sperre[] = [
  /* Hauptstraße vor Weidenhain (Raban und Tilda stehen davor) */
  { id: "strasse", feld: [6436, 6647, 6458, 6650], staemme: [[6443, 6648.3, 6.5, 0.12], [6450.5, 6648.6, 6.5, -0.1], [6446.5, 6649.3, 5, 0.05]] },
  /* Kreuzung im Kreuzwald: der Weg nach Süden hinter der Abzweigung zur Lichtung */
  { id: "kreuzung", feld: [6430, 6600, 6452, 6602], staemme: [[6439, 6600.6, 6, 0.08], [6446, 6601, 6, -0.12]] },
  /* Pfad von der Westmark nach Rabenmoor */
  { id: "westmark", feld: [6314, 6650, 6338, 6653], staemme: [[6321, 6651.2, 6.5, 0.1], [6328, 6651.5, 6.5, -0.08], [6334, 6651.2, 5, 0.15]] },
];
/** Wohin der Server zurückschickt, wer ohne Freigabe hinter die Sperre gelangt (vor der Straßensperre) */
export const VOR_DER_SPERRE: [number, number] = [6446.5, 6641.5];

/* ---------- Dialogbuch ---------- */
export interface Zeile { wer: string; text: string }
export interface Antwort { id: string; text: string }
export interface Dialog { npc: NpcId; name: string; zeilen: Zeile[]; antworten: Antwort[] }
/** Was eine Antwort bewirkt (der Server führt es aus) */
export interface Folge { stand?: Stand; /** Schriftstück abgeben */ abgeben?: boolean; /** Abschluss mit Belohnung */ abschluss?: boolean; /** danach weiterreden (neuer Dialog) */ weiter?: boolean; zeilen?: Zeile[] }
const ICH = "Du";
const z = (wer: string, ...t: string[]): Zeile[] => t.map((text) => ({ wer, text }));
const ENDE: Antwort = { id: "tschuess", text: "Auf Wiedersehen." };

/** Der Dialog, den ein Spieler mit diesem Stand bei dieser Figur bekommt (hat: trägt das Schriftstück im Rucksack) */
export function dialog(id: NpcId, s: Stand, hat: boolean): Dialog | null {
  const N = npc(id); if (!N) return null; const d = (zeilen: Zeile[], antworten: Antwort[]): Dialog => ({ npc: id, name: N.name, zeilen, antworten });
  if (id === "jori") {
    if (s === "" || s === "angeboten") return d([...z("Jori", "Du! Bitte, warte! Der Bürgermeister braucht deine Hilfe!"), ...z(ICH, "Was ist denn los?"),
      ...z("Jori", "Die Straße ist gesperrt. Schon wieder. Die Wagen kommen nicht durch, und im Dorf reden alle nur noch darüber. Der Bürgermeister sucht jemanden, der sich die Sache ansehen kann.")],
      [{ id: "warum", text: "Warum geht niemand aus dem Dorf selbst?" }, { id: "annehmen", text: "Ich helfe. (Quest annehmen)" }, { id: "verwerfen", text: "Jetzt nicht. (Verwerfen)" }]);
    if (rang(s) < rang("fertig")) return d(z("Jori", "Das Rathaus ist dort vorne, an der Westseite vom Marktplatz. Der Bürgermeister wartet!"), [ENDE]);
    return d(z("Jori", "Die Wagen fahren wieder! Mama sagt, es gibt bald wieder richtiges Mehl."), [ENDE]);
  }
  if (id === "hagan") {
    if (s === "angenommen") return d([...z("Hagan Voss", "Du bist die Hilfe, von der Jori gesprochen hat? Gut. Dann will ich dich nicht mit langen Reden aufhalten.",
      "Der Weg nach Weidenhain ist gesperrt. Die Wachen haben Baumstämme quergelegt und lassen niemanden passieren. Seit die Banditen in den Wäldern Reisende und Wagen überfallen, kann niemand mehr sicher sagen, wer Händler ist und wer zu ihnen gehört.",
      "Der Handel steht still. Salz, Werkzeug und Mehl kommen nicht an. Auf dem Osthof bleiben Kisten liegen, die sonst weiter nach Weidenhain gebracht würden. Ich brauche mehr als Gerüchte."),
      ...z("Hagan Voss", "Geh zuerst zum Osthof. Hör dir an, was die Leute gesehen haben. Dann sprich mit den Wachen. Vielleicht ergibt sich aus beiden Berichten ein Weg, die Sache aufzuklären.")],
      [{ id: "osthof", text: "Ich sehe mich auf dem Osthof um." }, { id: "banditen", text: "Was weißt du über die Banditen?" }, { id: "sperre", text: "Warum hebst du die Sperre nicht selbst auf?" }]);
    if (s === "wachen" && hat) return d(z("Hagan Voss", "Du bringst etwas mit? Zeig her."), [{ id: "zeigen", text: "Das Schriftstück vorzeigen." }]);
    if (s === "beweis") return hat ? d(z("Hagan Voss", "Du bist zurück. Hast du etwas gefunden, das ich den Wachen vorlegen kann?"), [{ id: "zeigen", text: "Das Schriftstück vorzeigen." }])
      : d(z("Hagan Voss", "Ohne das Schriftstück kann ich nichts bestätigen. Hast du es noch?"), [ENDE]);
    if (s === "auftrag") return d(z("Hagan Voss", "Der Osthof liegt östlich von hier an der Steinstraße. Frag nach Fenna."), [ENDE]);
    if (s === "osthof" || s === "wachen") return d(z("Hagan Voss", "Bring mir keine Vermutung, sondern etwas, das ich den Wachen vorlegen kann. Dann kann ich für dich einstehen."), [ENDE]);
    if (s === "bestaetigt" || s === "frei") return d(z("Hagan Voss", "Die Bestätigung ist unterwegs. Geh zurück zur Straße – die Wachen werden dich erkennen."), [ENDE]);
    if (s === "fertig") return d(z("Hagan Voss", "Der Handel kommt wieder in Gang. Waldmark steht in deiner Schuld."), [ENDE]);
    return d(z("Hagan Voss", "Ich habe viel zu tun. Wenn du helfen willst, sprich mit der kleinen Jori draußen auf dem Platz."), [ENDE]);
  }
  if (id === "fenna") {
    if (s === "auftrag") return d([...z("Fenna Ried", "Wenn du wegen der Lieferung kommst: Es gibt nichts, das ich dir mitgeben könnte. Die Kisten stehen hier, und der Wagen fährt nicht."),
      ...z(ICH, "Der Bürgermeister schickt mich. Ich soll herausfinden, was auf dem Weg passiert."),
      ...z("Fenna Ried", "Dann schickt er endlich jemanden, der zuhört. Vor drei Nächten kam ein Karren zurück, ohne die Säcke, die er geladen hatte. Der Fahrer hatte Glück. Sie haben ihn laufen lassen, aber er wollte nicht noch einmal durch den Wald.",
        "Er meinte, sie seien nicht auf der Straße geblieben. Eine Spur führte in den Kreuzwald, hinüber zur Lichtung. Ich habe dort seitdem niemanden mehr gesehen – und ich habe auch nicht vor, selbst nachzusehen.")],
      [{ id: "weiter", text: "Ich gebe den Bericht weiter." }, { id: "taeter", text: "Hat er die Täter gesehen?" }, { id: "karren", text: "Kann ich den Karren untersuchen?" }]);
    if (rang(s) > rang("auftrag")) return d(z("Fenna Ried", "Wenn du zu den Wachen gehst, sag ihnen, dass nicht nur Reisende betroffen sind. Die Kisten hier verderben."), [ENDE]);
    return d(z("Fenna Ried", "Ich habe zu tun. Die Kisten sortieren sich nicht von selbst."), [ENDE]);
  }
  if (id === "raban" || id === "tilda") {
    if (s === "osthof") return d([...z("Raban", "Halt. Der Weg ist gesperrt. Kein Durchlass ohne Anweisung."),
      ...z(ICH, "Ich komme aus Waldmark. Auf dem Osthof wurde ein Wagen ausgeraubt. Die Spur führt in den Kreuzwald."),
      ...z("Raban", "Das ist nicht der erste Bericht. Ein Karren verschwindet, ein anderer kommt leer zurück. Jeder erzählt etwas anderes. Keiner kann uns sagen, wen er gesehen hat."),
      ...z("Tilda", "Einer der Fuhrleute sprach von Bewegung auf der Lichtung östlich des Weges. Wir fanden dort Spuren, aber sie waren alt und vom Regen verwischt. Wenn du wirklich helfen willst, sieh dir die Lichtung an. Aber geh nicht davon aus, dass dort nur ein einzelner Mann sitzt."),
      ...z("Raban", "Bring einen Beleg, der die Bande mit den Überfällen verbindet. Dann kann der Bürgermeister von Waldmark bei uns vorsprechen.")],
      [{ id: "lager", text: "Ich suche das Lager auf der Lichtung auf." }, { id: "eskorte", text: "Ihr könntet wenigstens einen Wagen eskortieren." }, { id: "warum", text: "Warum lasst ihr niemanden durch?" }]);
    if (s === "bestaetigt") return d([...z("Raban", "Du bist zurück. Der Bote aus Waldmark hat uns die Bestätigung gebracht. Der Bürgermeister steht für deinen Bericht ein."),
      ...z(ICH, "Dann ist die Sperre aufgehoben?"), ...z("Raban", "Für dich ist der Weg frei. Wir bleiben noch im Dienst, aber wir halten dich nicht länger zurück."),
      ...z("Tilda", "Wenn du nach Weidenhain gehst, sprich mit dem Bürgermeister. Er soll selbst hören, was auf dem Papier stand.")],
      [{ id: "durch", text: "Nach Weidenhain weitergehen." }, { id: "festnehmen", text: "Könnt ihr die Banditen nicht sofort festnehmen?" }]);
    if (sperreOffen(s)) return d(z(id === "raban" ? "Raban" : "Tilda", "Der Weg ist frei. Gute Reise."), [ENDE]);
    if (s === "wachen" || s === "beweis") return d(z(id === "raban" ? "Raban" : "Tilda", "Ohne Bestätigung aus Waldmark lassen wir niemanden durch. Bring dem Bürgermeister einen Beleg."), [ENDE]);
    return d(z(id === "raban" ? "Raban" : "Tilda", "Halt. Der Weg ist gesperrt. Kein Durchlass ohne Anweisung."), [ENDE]);
  }
  if (id === "othmar") {
    if (s === "frei") return d([...z("Othmar Rehn", "Du bist also derjenige, der den Bericht aus dem Kreuzwald gebracht hat. Ich habe die Nachricht aus Waldmark erhalten. Die Sperre war notwendig, aber sie hat auch die Falschen getroffen."),
      ...z(ICH, "Die Banditen haben Wagen überfallen. Das Schriftstück sagt, dass sie die Ladung zu einem Versteck unter einem Haus bringen. Die Lichtung war nur ein Lager."),
      ...z("Othmar Rehn", "Dann endet die Sache nicht hier. Ich werde die Sperre für den normalen Verkehr aufheben lassen. Der Weg nach Weidenhain steht dir offen – und du kannst nun auch weiter nach Rabenmoor reisen.",
        "Das Schriftstück ist ein Anfang, kein Ende. Unter einem Haus, bei alten Fässern … Wenn du wieder bereit bist, werden wir diesem Hinweis nachgehen. Nimm diese Anerkennung an. Du hast Waldmark und Weidenhain einen wichtigen Dienst erwiesen.")],
      [{ id: "helfen", text: "Ich helfe, wenn ihr dem Versteck nachgeht." }, { id: "sehen", text: "Ich werde sehen, was sich ergibt." }]);
    if (s === "fertig") return d(z("Othmar Rehn", "Die Händler sind dir dankbar. Und das Versteck unter dem Haus lässt mir keine Ruhe."), [ENDE]);
    return d(z("Othmar Rehn", "Weidenhain hat gerade andere Sorgen als Fremde."), [ENDE]);
  }
  return null;
}

/** Was eine Antwort bewirkt; null = unbekannte Antwort (wird ignoriert) */
export function antwort(id: NpcId, s: Stand, hat: boolean, a: string): Folge | null {
  if (a === "tschuess") return {};
  if (id === "jori" && (s === "" || s === "angeboten")) {
    if (a === "warum") return { weiter: true, zeilen: z("Jori", "Die Wachen lassen niemanden durch. Und die, die hinausgehen, sollen nicht allein in den Wald. Bitte, geh zum Rathaus. Er wird dir erklären, was passiert ist.") };
    if (a === "annehmen") return { stand: "angenommen", zeilen: z("Jori", "Wirklich? Danke! Das Rathaus ist dort vorne, an der Westseite vom Marktplatz. Der Bürgermeister wartet drinnen.") };
    if (a === "verwerfen") return { stand: "angeboten", zeilen: z("Jori", "Schon gut. Ich kann dich nicht zwingen. Aber wenn du es dir anders überlegst, sprich mich noch einmal an.") };
  }
  if (id === "hagan") {
    if (s === "angenommen") {
      if (a === "osthof") return { stand: "auftrag", zeilen: z("Hagan Voss", "Bring mir keine Vermutung, sondern etwas, das ich den Wachen vorlegen kann. Dann kann ich für dich einstehen.") };
      if (a === "banditen") return { weiter: true, zeilen: z("Hagan Voss", "Überfälle wurden gemeldet, das ist sicher. Aber wie viele es sind und wer sie anführt, weiß niemand.") };
      if (a === "sperre") return { weiter: true, zeilen: z("Hagan Voss", "Die Sperre haben die Wachen an der Grenze eingerichtet, nicht ich. Ich brauche eine belegbare Grundlage, damit sie sie aufheben.") };
    }
    if (a === "zeigen" && hat && (s === "wachen" || s === "beweis")) return { stand: "bestaetigt", abgeben: true, zeilen: [
      ...z("Hagan Voss", "Das ist keine bloße Wegelagerei mehr. Hier steht, dass die Ladung unter ein Haus gebracht werden soll. Und sie schreiben ausdrücklich, keine Namen aufzuschreiben.",
        "Dieses Papier reicht, um den Wachen zu zeigen, dass die Überfälle zusammenhängen. Ich setze meinen Namen darunter und lasse die Bestätigung auf direktem Weg zu den Wachen bringen. Geh zurück zur Straße – sie werden dich erkennen.")] };
  }
  if (id === "fenna" && s === "auftrag") {
    if (a === "weiter") return { stand: "osthof", zeilen: z("Fenna Ried", "Wenn du zu den Wachen gehst, sag ihnen, dass nicht nur Reisende betroffen sind. Die Kisten hier verderben. Und wenn die nächste Lieferung ausbleibt, kann ich die Leute nicht mehr bezahlen.") };
    if (a === "taeter") return { weiter: true, zeilen: z("Fenna Ried", "Nur Gestalten zwischen den Bäumen. Keine Wappen, keine Farben, an denen man sie festmachen könnte. Er hat Stimmen gehört und Hufe auf dem Weg. Mehr konnte er nicht sagen.") };
    if (a === "karren") return { weiter: true, zeilen: [...z(ICH, "Am Karren hängt ein durchtrenntes Zurrband."), ...z("Fenna Ried", "Das Band ist sauber durchtrennt. Das sieht nicht nach einem Radbruch aus. Jemand wollte die Ladung schnell lösen.")] };
  }
  if (id === "raban" || id === "tilda") {
    if (s === "osthof") {
      if (a === "lager") return { stand: "wachen", zeilen: z("Raban", "Pass auf dich auf. Und komm mit etwas zurück, das wir in der Hand halten können.") };
      if (a === "eskorte") return { weiter: true, zeilen: z("Raban", "Mit welchen Leuten? Wir sind zu zweit an dieser Sperre. Wenn wir einen Wagen begleiten, steht die Straße offen.") };
      if (a === "warum") return { weiter: true, zeilen: z("Raban", "Weil die Banditen nicht nur Wagen nehmen. Sie könnten sich unter Reisende mischen. Lassen wir einen durch, der sie hinter die Sperre führt, stehen die Leute in Weidenhain ungeschützt da.") };
    }
    if (s === "bestaetigt") {
      if (a === "durch") return { stand: "frei", zeilen: z("Raban", "Dann los. Wir rollen den Stamm für dich zur Seite.") };
      if (a === "festnehmen") return { weiter: true, zeilen: z("Raban", "Der Hinweis auf ein Versteck genügt noch nicht, um alle Zugänge zu finden. Erst muss jemand wissen, welches Haus gemeint ist.") };
    }
  }
  if (id === "othmar" && s === "frei" && (a === "helfen" || a === "sehen")) return { abschluss: true, zeilen: z("Othmar Rehn", a === "helfen" ? "Darauf komme ich zurück. Ruh dich aus – Rabenmoor wartet." : "Wie du meinst. Die Tür steht dir offen, wenn du bereit bist.") };
  return null;
}
