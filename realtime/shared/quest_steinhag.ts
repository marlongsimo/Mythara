/*
 * Riftmere – kleine Stadt-Quests der Hauptstadt Steinhag (#167, doku/konzepte/hauptstaedte.md), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Entscheidung des Nutzers (27.11.): 3–5 kleine Stadt-Quests, quer zu bekannten Orten. Stellen aus Welts Plan (welt/plaene/steinhag_plan.json, a29fc0ee):
 * Markt (6990 | 5885), Läden an der Hauptgasse, Seeufer mit Stegen und Fischerhäusern, Burgplatz vor der Vogtsburg (7044 | 5868), Ringmauer mit drei Toren,
 * Zunftviertel mit dem Abstieg zum Stollen der Bergmannszunft (7076 | 5948), Taverne mit Herd (7010 | 5879).
 *  – „Der Dieb vom Bergmarkt“: Jakob Kiesel vermisst einen Beutel Sterneisen. Drei Spuren durch die Stadt, ein Junge am Steg. QUER: Merit Stahl in Graufurt.
 *  – „Die Burgwache“: Hauptfrau der Vogtsburg – nachts die vier Posten der Ringmauer abgehen, einen schlafenden Wächter wecken. QUER: Bericht an Wigand Fels in Grauwacht.
 *  – „Eintopf für die Kumpel“: Wirt Ruprecht Talg schickt heißen Eintopf zur Zunftwache am Stollen und zu Steiger Wendel am Erzberg (Kochen).
 * Alle nach H1 („Über den Pass“, die Stadt ist offen). Entwurf (shared/quest_entwuerfe.ts), bis die Stadt gebaut ist (#167: Welt, Figuren, Systeme).
 * Keine neuen Gegenstände: Sterneisen-Erz, Bauerneintopf (Rezept am Herd) gibt es schon.
 */
import type { QuestDef, Bed, QuestFigur, Voraussetzung } from "./questbau";
import { H_QUESTS } from "./hochlande";
import { MERIT, WIGAND, WENDEL } from "./quest_h_orte";

type Feld = [number, number];
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const NACH_H1: Voraussetzung = { text: "„Über den Pass“ abgeschlossen", wenn: { quest: { id: H_QUESTS.h1, phase: ["fertig"] } } };

/* ───── Stellen (Plan der Welt, a29fc0ee) ───── */
const SPUREN: Feld[] = [[6984, 5898.5], [6968, 5868], [6960, 5840]];          /* hinter dem Bergmarkt · Gasse zum See · Steg West */
const FENN_XY: Feld = [6951.5, 5834.5];                                      /* bei den Fischerhäusern am Seeufer */
const POSTEN: Feld[] = [[6937, 5826.5], [7086, 5842], [7086, 5954], [6920, 5954]]; /* Ecken der Ringmauer: Pass-Tor, Burg, Südost, Südwest */
const SCHLAEFER_XY: Feld = [7084, 5950];
const BURGPLATZ: Feld = [7044, 5868];
const ZUNFT_ABSTIEG: Feld = [7076, 5948];

/* ───── Figuren (Bewohner aus shared/laeden.ts behalten Namen, Modell und Platz) ───── */
const JAKOB: QuestFigur = { id: "jakob", name: "Jakob Kiesel", modell: "npc.haendler_sued", x: 6982, y: 5897.4, blick: [0, -1] };        /* steinhag_allerlei */
const FENN: QuestFigur = { id: "fenn", name: "Fenn", modell: "npc.junge", x: FENN_XY[0], y: FENN_XY[1], blick: [1, 0] };
const RAGNHILD: QuestFigur = { id: "ragnhild", name: "Hauptfrau Ragnhild", modell: "stadtwache3d", x: BURGPLATZ[0], y: BURGPLATZ[1] - 1.5, blick: [0, 1] };
const SCHLAEFER: QuestFigur = { id: "wachmann_kuno", name: "Wachmann Kuno", modell: "stadtwache3d", x: SCHLAEFER_XY[0], y: SCHLAEFER_XY[1], blick: [-1, 0] };
const RUPRECHT: QuestFigur = { id: "ruprecht", name: "Ruprecht Talg", modell: "npc.alter_bauer", x: 7010, y: 5879.8, blick: [0, 1] };     /* steinhag_taverne */
const ZUNFTWACHE: QuestFigur = { id: "zunftwache", name: "Zunftwächter Bodo", modell: "stadtwache3d", x: ZUNFT_ABSTIEG[0] - 2, y: ZUNFT_ABSTIEG[1], blick: [1, 0] };

/* ══════════════ „Der Dieb vom Bergmarkt“ ══════════════ */
export const STEINHAG_DIEB = "steinhag_dieb_vom_bergmarkt";
const SP = ["spur_1", "spur_2", "spur_3"];
const SPUR_TEXT = [
  "Hinter dem Stand liegt eine Kiste umgekippt. Im Staub: kleine Schuhabdrücke, barfuß fast. Sie führen zur Gasse hinunter zum See.",
  "In der Gasse hängt ein Fetzen Stoff an einem Nagel. Grob gewebt, voller Fischschuppen.",
  "Am Steg: nasse Fußspuren, die zu den Fischerhäusern führen. Und ein Sterneisen-Brocken, der jemandem aus der Tasche gefallen ist.",
];
export const QUEST_STEINHAG_DIEB: QuestDef = {
  id: STEINHAG_DIEB, titel: "Der Dieb vom Bergmarkt", ort: "Steinhag · Bergmarkt · Seeufer · Graufurt", start: "Sprich mit Jakob Kiesel am Bergmarkt in Steinhag.",
  logNeu: "Am Bergmarkt in Steinhag schimpft ein Händler laut über Diebe.",
  logAngeboten: "Jakob Kiesel am Bergmarkt wurde bestohlen.",
  logAbgabe: "Merit Stahl will Fenn eine Lehre geben. Sag es Jakob Kiesel am Bergmarkt.",
  logFertig: "Jakob hat sein Sterneisen zurück, und Fenn geht im Frühjahr nach Graufurt – als Lehrling, nicht als Dieb.",
  geber: "jakob",
  figuren: [JAKOB, FENN, MERIT],
  voraussetzungen: [NACH_H1],
  schritte: [
    ...SP.map((id, i) => ({ id, text: "Den Spuren des Diebs folgen", ereignis: { art: "objekt" as const, id: "sd_" + id }, gruppe: "spuren", wo: SPUREN[i], ...(i ? { nach: [SP[i - 1]] } : {}),
      log: "Jemand hat Jakob einen Beutel Sterneisen gestohlen. Folg den Spuren vom Bergmarkt hinunter zum See ({n:spuren})." })),
    { id: "fenn", text: "Den Dieb stellen", ereignis: { art: "antwort" }, nach: ["spur_3"], bei: "fenn",
      log: "Die Spuren führen zu den Fischerhäusern am Seeufer. Dort hockt ein Junge am Steg." },
    { id: "merit", text: "Merit Stahl in Graufurt nach einer Lehre fragen", ereignis: { art: "antwort" }, nach: ["fenn"], bei: "merit",
      log: "Fenn wollte mit dem Sterneisen nach Graufurt – zu Merit Stahl, in die Lehre. Frag sie, ob sie ihn nimmt." },
  ],
  objekte: SP.map((id, i) => ({ id: "sd_" + id, name: ["Umgekippte Kiste", "Stofffetzen", "Nasse Spuren"][i], x: SPUREN[i][0], y: SPUREN[i][1], modell: "stelle", tat: "untersuchen" as const,
    tatText: "Genauer ansehen", weit: 2.5, text: SPUR_TEXT[i] + " ({n:spuren})", schon: "Hier warst du schon.",
    sonst: [{ wenn: NEU, text: "Nichts Besonderes." }, { wenn: FERTIG, text: "Nichts Besonderes mehr." }, { wenn: { offen: i ? [SP[i - 1]] : [] }, text: "Hier ist nichts – noch nicht." }] })),
  /* Jakob: Händler, laut, rechnet alles in Kupfer, im Herzen weich. Fenn: zwölf, frech, verzweifelt. Merit: knapp, sachlich, gerecht. */
  dialoge: {
    jakob: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Dieb! Ein Dieb am helllichten Tag! Ein ganzer Beutel Sterneisen, weg, während ich einem Bergmann eine Angel verkauft hab.",
          "Die Wache? Die steht auf der Burg und schaut auf den See. Du hast doch Augen im Kopf."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Krüge, Angeln, Würmer, Äpfel aus dem Tal – alles den Pass herauf getragen."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Fenn kommt jetzt jeden Morgen und fegt meinen Stand. Umsonst. Ich hab nicht gefragt.", "Der Junge wird mal was. Bei Merit sowieso."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Und? Hast du den Halunken?"], antworten: ["fertig"] },
        { wenn: { ...LAEUFT, erledigt: ["fenn"] }, zeilen: ["Ein Junge? Fenn, vom Fischer Arne? …Und er will nach Graufurt? Na, dann frag die Hauptfrau dort. Ich warte. Mit meinem Sterneisen."], antworten: ["tschuess"] },
        { zeilen: ["Hinter dem Stand ging's los. Schau dir den Boden an."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich finde den Dieb. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Gut! Fang hinter meinem Stand an. Und wenn du ihn hast – bring mir den Beutel. Den Dieb kannst du von mir aus in den See werfen."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Dann eben nicht. Ich schreib's mir auf. Wie alles."] } }] },
        { id: "fertig", text: "Es war Fenn, der Fischerjunge. Merit Stahl in Graufurt nimmt ihn im Frühjahr als Lehrling.", folge: [{ f: { abschluss: true,
          zeilen: ["Jakob nimmt den Beutel, zählt die Brocken, zählt sie noch einmal.", "Alles da. Bis auf einen, der im See liegt, schätz ich.",
          "Ein Lehrling bei Merit Stahl … Na. Bis zum Frühjahr fegt er meinen Stand. Dann sind wir quitt. Hier – für deine Mühe."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Komm wieder, wenn die Wagen fahren."] } }] },
      ],
    },
    fenn: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["spur_3"], offen: ["fenn"] }, zeilen: ["Was willst du? Ich hab nichts gemacht. Ich sitz hier nur."], antworten: ["stellen", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["fenn"], offen: ["merit"] }, zeilen: ["Fragst du sie? Wirklich? …Sag ihr, ich kann schon einen Hammer halten."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["merit"] }, zeilen: ["Sie nimmt mich? Im Frühjahr? …Ich geh zu Jakob. Sofort. Bevor ich's mir anders überleg."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Noch hundertzwölf Tage bis zum Frühjahr. Ich zähl mit."], antworten: ["tschuess"] },
        { zeilen: ["Platz da, ich angle."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "stellen", text: "Der Brocken Sterneisen am Steg. Und Fischschuppen an Jakobs Kiste. Gib den Beutel her.", folge: [{ f: { erledige: ["fenn"],
          zeilen: ["Fenn sieht dich lange an. Dann zieht er einen Beutel unter dem Steg hervor.", "Ich wollte nach Graufurt. Zur Hauptfrau, Merit Stahl. Sie hat eine Schmiede, sagen die Kutscher. Da lernt man was.",
          "Aber keiner nimmt einen Fischerjungen ohne Geld. Also hab ich gedacht … Sterneisen ist Geld.", "Er drückt dir den Beutel in die Hand. „Bringst du mich zur Wache? …Oder fragst du sie für mich? Die Hauptfrau in Graufurt?“"] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Hm."] } }] },
      ],
    },
    merit: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["fenn"], offen: ["merit"] }, zeilen: ["Du kommst aus Steinhag? Mit Sterneisen?", "Was gibt's?"], antworten: ["lehre_fragen", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["merit"] }, zeilen: ["Im Frühjahr. Und keinen Tag früher."], antworten: ["tschuess"] },
        { zeilen: ["Für die Wacht."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "lehre_fragen", text: "Ein Junge aus Steinhag will bei dir in die Lehre. Er hat gestohlen, um herzukommen.", folge: [{ f: { erledige: ["merit"],
          zeilen: ["Merit verschränkt die Arme. „Gestohlen.“", "…Ich hab mit vierzehn einem Hauptmann das Pferd gestohlen, um zur Wacht zu kommen. Er hat mich trotzdem genommen.",
          "Sag ihm: im Frühjahr. Er bringt das Sterneisen zurück und arbeitet es bei dem Händler ab. Wer stiehlt, arbeitet doppelt. Wer arbeitet, bleibt."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Für die Wacht."] } }] },
      ],
    },
  },
  glueckwunsch: "Ein Dieb weniger, ein Lehrling mehr. Das ist ein gutes Geschäft – und ich kenn mich mit Geschäften aus.",
  belohnungText: "Belohnung: Geschick 1.500 XP, 250 Splitter",
  belohnung: { xp: { geschick: 1500 }, splitter: 250 },
  punkte: 1,
};

/* ══════════════ „Die Burgwache“ ══════════════ */
export const STEINHAG_BURGWACHE = "steinhag_die_burgwache";
const PO = ["posten_1", "posten_2", "posten_3", "posten_4"];
const POSTEN_TEXT = [
  "Das Pass-Tor. Der Wind kommt von den Bergen, kalt und still. Nichts rührt sich.",
  "Der Eckturm unter der Burg. Unten glänzt der See. Ein Fischer rudert spät heim.",
  "Die Südostecke. Hier sollte Kuno stehen.",
  "Die Südwestecke. Von hier sieht man die Laternen am Furt-Tor. Alles ruhig.",
];
export const QUEST_STEINHAG_BURGWACHE: QuestDef = {
  id: STEINHAG_BURGWACHE, titel: "Die Burgwache", ort: "Steinhag · Ringmauer · Grauwacht", start: "Sprich mit Hauptfrau Ragnhild auf dem Burgplatz in Steinhag.",
  logNeu: "Auf dem Burgplatz von Steinhag sucht eine Hauptfrau Leute für die Nachtwache.",
  logAngeboten: "Hauptfrau Ragnhild braucht jemanden, der die Ringmauer abgeht.",
  logAbgabe: "Wigand Fels hat den Bericht. Geh zurück zu Hauptfrau Ragnhild auf dem Burgplatz.",
  logFertig: "Die Mauer von Steinhag ist bewacht – und Grauwacht weiß jetzt, dass es auf der anderen Seite der Furt Freunde hat.",
  geber: "ragnhild",
  figuren: [RAGNHILD, SCHLAEFER, WIGAND],
  voraussetzungen: [NACH_H1],
  schritte: [
    ...PO.map((id, i) => ({ id, text: "Die vier Posten der Ringmauer abgehen", ereignis: { art: "objekt" as const, id: "bw_" + id }, gruppe: "posten", wo: POSTEN[i],
      log: "Geh die Ringmauer ab und sieh an jedem der vier Ecktürme nach dem Rechten ({n:posten})." })),
    { id: "kuno", text: "Den schlafenden Wachmann wecken", ereignis: { art: "antwort" }, nach: ["posten_3"], bei: "wachmann_kuno",
      log: "An der Südostecke fehlt der Wachmann. Er kann nicht weit sein." },
    { id: "wigand", text: "Wigand Fels in Grauwacht den Wachbericht bringen", ereignis: { art: "antwort" }, nach: [...PO, "kuno"], bei: "wigand",
      log: "Ragnhild schickt den Wachbericht nach Grauwacht – zu Wigand Fels, über die Furt. Seit die Wagen fahren, schreiben sich die beiden Wachen wieder." },
  ],
  objekte: PO.map((id, i) => ({ id: "bw_" + id, name: "Wachposten", x: POSTEN[i][0], y: POSTEN[i][1], modell: "stelle", tat: "benutzen" as const, tatText: "Nach dem Rechten sehen", weit: 3,
    text: POSTEN_TEXT[i] + " ({n:posten})", schon: "Dieser Posten ist abgegangen.",
    sonst: [{ wenn: NEU, text: "Ein Wachposten auf der Mauer." }, { wenn: FERTIG, text: "Ein Wachposten auf der Mauer. Kuno ist wach. Meistens." }] })),
  /* Ragnhild: Hauptfrau der Vogtsburg, streng, trockener Humor, kennt Wigand aus alten Zeiten. Kuno: schläfrig, ehrlich, verlegen. */
  dialoge: {
    ragnhild: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Eine Mauer ist nur so gut wie der, der darauf steht. Und meine Leute stehen seit Wochen doppelt.",
          "Geh heute Nacht die vier Ecktürme ab. Und wenn einer schläft – weck ihn. Freundlich. Beim ersten Mal."], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Halt dich an die Gassen. Die Mauer ist für die Wache."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Wigand schreibt zurück. Zwei Seiten, die Hälfte über das Wetter. Er wird alt.", "Kuno steht jetzt freiwillig an der Südostecke. Er sagt, dort ist der Wind am lautesten."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Du warst in Grauwacht? Was sagt der alte Fels?"], antworten: ["fertig"] },
        { wenn: { ...LAEUFT, erledigt: [...PO, "kuno"] }, zeilen: ["Alle vier Posten, und Kuno ist wach. Gut.", "Jetzt der Bericht. Bring ihn nach Grauwacht, zu Wigand Fels. Über die Furt, die Straße hinunter."], antworten: ["tschuess"] },
        { zeilen: ["Pass-Tor, Burgturm, Südost, Südwest. In der Reihenfolge, die dir passt."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich gehe die Mauer ab. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Gut. Vier Ecktürme: am Pass-Tor, unter der Burg, Südost und Südwest.", "Und morgen früh bringst du den Bericht nach Grauwacht. Wigand Fels soll wissen, dass Steinhag wach ist."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Die Nacht kommt so oder so."] } }] },
        { id: "fertig", text: "Wigand Fels lässt grüßen. Grauwacht hält, und die Furt gehört beiden.", folge: [{ f: { abschluss: true,
          zeilen: ["Ragnhild lacht kurz, zum ersten Mal.", "Der alte Fels. Wir haben zusammen am Pass gestanden, bevor die Wacht zerfiel. …Gut, dass er noch steht.", "Du hast eine gute Nacht gemacht. Die Wache von Steinhag schuldet dir was."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Augen auf."] } }] },
      ],
    },
    wachmann_kuno: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["kuno"], erledigt: ["posten_3"] }, zeilen: ["Chrrr … chrrr …"], antworten: ["wecken", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["kuno"] }, zeilen: ["Ich steh. Ich steh ja schon. Sag Ragnhild nichts. Oder … nur das Nötigste."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Hellwach! Seit Tagen! Fast."], antworten: ["tschuess"] },
        { zeilen: ["Halt. Wer da? …Ach so. Weitergehen."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "wecken", text: "Ihn an der Schulter rütteln.", folge: [{ f: { erledige: ["kuno"], zeilen: ["Kuno fährt hoch, den Speer verkehrt herum. „Wer da! …Ach. Ich hab nicht geschlafen. Ich hab gehorcht. Mit geschlossenen Augen.“",
          "„Zwei Nächte Wache, eine Nacht Schlaf. So geht das seit dem Pass. Du sagst es doch nicht der Hauptfrau?“"] } }] },
        { id: "tschuess", text: "Weitergehen.", folge: [{ f: { zeilen: ["Augen auf. Meine auch."] } }] },
      ],
    },
    wigand: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: [...PO, "kuno"], offen: ["wigand"] }, zeilen: ["Aus Steinhag? Mit Staub vom Pass auf den Stiefeln. Was bringst du?"], antworten: ["bericht_steinhag", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["wigand"] }, zeilen: ["Grüß Ragnhild. Und sag ihr, sie schuldet mir noch ein Bier vom Pass."], antworten: ["tschuess"] },
        { zeilen: ["Für die Wacht."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "bericht_steinhag", text: "Den Wachbericht von Hauptfrau Ragnhild aus Steinhag.", folge: [{ f: { erledige: ["wigand"],
          zeilen: ["Wigand liest. Bei einer Stelle hebt er die Brauen.", "Ragnhild. Sie lebt und hält die Mauer von Steinhag. …Und ein Wachmann schläft. Das hätte sie früher auch nicht durchgehen lassen.",
          "Sag ihr: Grauwacht hält. Und die Furt gehört beiden Wachen. Wie früher."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Für die Wacht."] } }] },
      ],
    },
  },
  glueckwunsch: "Eine gute Nacht auf der Mauer. Die Wache von Steinhag vergisst so etwas nicht.",
  belohnungText: "Belohnung: Defense 1.500 XP, 250 Splitter",
  belohnung: { xp: { defense: 1500 }, splitter: 250 },
  punkte: 1,
};

/* ══════════════ „Eintopf für die Kumpel“ ══════════════ */
export const STEINHAG_EINTOPF = "steinhag_eintopf_fuer_die_kumpel";
export const QUEST_STEINHAG_EINTOPF: QuestDef = {
  id: STEINHAG_EINTOPF, titel: "Eintopf für die Kumpel", ort: "Steinhag · Zunftviertel · Erzberg", start: "Sprich mit Wirt Ruprecht Talg in der Taverne „Zum Grubenlicht“.",
  logNeu: "In der Taverne „Zum Grubenlicht“ dampft ein großer Topf, und der Wirt hat keine Zeit.",
  logAngeboten: "Wirt Ruprecht Talg braucht einen Boten für heißen Eintopf.",
  logAbgabe: "Beide Töpfe sind angekommen. Sag Ruprecht Talg in der Taverne Bescheid.",
  logFertig: "Die Kumpel am Stollen und am Erzberg haben warm gegessen. Ruprecht kocht jetzt jeden Tag einen Topf mehr.",
  geber: "ruprecht",
  figuren: [RUPRECHT, ZUNFTWACHE, WENDEL],
  voraussetzungen: [NACH_H1, { text: "Kochen 25", wenn: { skill: { k: "kochen", min: 25 } } }],
  schritte: [
    { id: "kochen", text: "Zwei Bauerneintöpfe am Herd der Taverne kochen", ereignis: { art: "herstellen", rezept: "bauerneintopf" }, anzahl: 2, wo: [7008, 5879],
      log: "Koch am Herd der Taverne zwei Bauerneintöpfe ({n:kochen}). Ruprecht hat keine Hand frei." },
    { id: "zunft", text: "Der Zunftwache am Stollen einen Eintopf bringen", ereignis: { art: "antwort" }, nach: ["kochen"], bei: "zunftwache", gruppe: "boten",
      log: "Bring einen Eintopf zur Zunftwache am Abstieg zum Stollen der Bergmannszunft im Zunftviertel." },
    { id: "wendel", text: "Steiger Wendel am Erzberg einen Eintopf bringen", ereignis: { art: "antwort" }, nach: ["kochen"], bei: "wendel", gruppe: "boten",
      log: "Bring einen Eintopf zu Steiger Wendel am Eingang des Bergwerks am Erzberg, östlich der Stadt." },
  ],
  /* Ruprecht: Wirt, laut, gutmütig, kocht für alle. Bodo: Zunftwächter, streng an der Tür, weich beim Essen. Wendel: Steiger, Glück auf. */
  dialoge: {
    ruprecht: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Setz dich zu den Kumpeln! …Nein, warte. Steh wieder auf.",
          "Die Zunftwache am Stollen und der Steiger am Erzberg kriegen jeden Tag einen Topf Eintopf. Heute hab ich keine Hand frei. Kannst du kochen?"], antworten: ["annehmen", "spaeter"] },
        { wenn: NEU, zeilen: ["Setz dich zu den Kumpeln! Eintopf, Braten, Bier – such dir was aus."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Bodo hat den Topf ausgeleckt, sagen sie. Und Wendel will das Rezept. Kriegt er nicht."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Zurück! Und? Haben sie gemeckert?"], antworten: ["fertig"] },
        { wenn: { ...LAEUFT, erledigt: ["kochen"] }, zeilen: ["Riecht gut! Jetzt los, bevor's kalt wird. Einer zur Zunftwache, einer zum Erzberg."], antworten: ["tschuess"] },
        { zeilen: ["Der Herd steht da. Zwei Töpfe Bauerneintopf. Nicht anbrennen lassen."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich koche und bringe sie hin. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Herrlich! Zwei Bauerneintöpfe am Herd da hinten.",
          "Einen für Bodo, die Zunftwache am Stollen im Zunftviertel. Einen für Steiger Wendel draußen am Erzberg. Heiß, wenn's geht."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Dann kriegen sie eben Brot. Und schimpfen."] } }] },
        { id: "fertig", text: "Beide haben gegessen. Und nicht gemeckert.", folge: [{ f: { abschluss: true, zeilen: ["Ruprecht klopft dir auf die Schulter, dass es staubt.",
          "Nicht gemeckert! Das ist bei Kumpeln das höchste Lob. Komm, iss selbst was. Geht aufs Haus."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Glück auf!"] } }] },
      ],
    },
    zunftwache: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["kochen"], offen: ["zunft"], anzahl: { g: "bauerneintopf", min: 1 } }, zeilen: ["Halt. Der Stollen der Zunft ist nur für Bergleute ab Stufe 60. …Was riecht hier so gut?"], antworten: ["eintopf_bodo", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["zunft"] }, zeilen: ["Sag Ruprecht, mehr Speck nächstes Mal."], antworten: ["tschuess"] },
        { zeilen: ["Halt. Der Stollen der Zunft ist nur für Bergleute ab Stufe 60."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "eintopf_bodo", text: "Eintopf von Ruprecht. Noch heiß.", wenn: { anzahl: { g: "bauerneintopf", min: 1 } }, folge: [{ f: { erledige: ["zunft"], nehmen: [{ g: "bauerneintopf" }],
          zeilen: ["Bodo stellt den Speer an die Wand und nimmt den Topf mit beiden Händen.", "Ruprecht. Der gute Mann. Ich steh hier seit dem Morgengrauen."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Glück auf."] } }] },
      ],
    },
    wendel: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["kochen"], offen: ["wendel"], anzahl: { g: "bauerneintopf", min: 1 } }, zeilen: ["Glück auf! Du riechst nach Taverne. Bringst du etwa …?"], antworten: ["eintopf_wendel", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["wendel"] }, zeilen: ["Sag Ruprecht, ich will das Rezept. Er gibt's mir eh nicht."], antworten: ["tschuess"] },
        { zeilen: ["Glück auf."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "eintopf_wendel", text: "Bauerneintopf von Ruprecht.", wenn: { anzahl: { g: "bauerneintopf", min: 1 } }, folge: [{ f: { erledige: ["wendel"], nehmen: [{ g: "bauerneintopf" }],
          zeilen: ["Wendel setzt sich auf eine Lore und löffelt. Eine Weile sagt er gar nichts.", "Das ist der erste warme Mittag seit dem Einsturz. Danke. Und Glück auf."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: ["Glück auf."] } }] },
      ],
    },
  },
  glueckwunsch: "Nicht gemeckert! Das ist das höchste Lob in Steinhag. Glück auf, Kumpel.",
  belohnungText: "Belohnung: Kochen 1.200 XP, 2 Bauerneintöpfe, 150 Splitter",
  belohnung: { berufe: { kochen: 1200 }, splitter: 150, gegenstaende: [{ g: "bauerneintopf", n: 2 }] },
  punkte: 1,
};
