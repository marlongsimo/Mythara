/*
 * Mythara – die Läden am Marktplatz der Waldmark (23.11.2026). Eine Quelle für Server (Kauf prüfen) und Browser (Händler, Ladenfenster).
 * Drei Händler stehen hinter ihren Marktständen (Weltdaten waldmark.mjs: stand_1 rot, stand_2 blau, stand_3 grün; Fuß des Stands = Mitte seiner Südkante,
 * die Theke liegt 0–0,7 Felder nördlich davon). Der Händler steht südlich hinter der Theke und schaut nach Norden auf den Marktplatz, der Kunde davor. Bezahlt wird mit Splittern. Preise und Werte sind vorläufig (Balancing folgt).
 */
import { GEGENSTAENDE, Seltenheit, handelbar, type Daten } from "./gegenstaende";
import { H_QUESTS } from "./hochlande";
import TROEDLER_STANDORTE from "../welt/troedler_standorte.json";

export type LadenId = "waffen" | "ruestung" | "traenke" | "handwerker" | "baeckerei" | "kornspeicher" | "obstwiesen" | "imme" | `troedler_${string}` | `haferstedt_${string}` | `netzbucht_${string}` | `sandquell_${string}` | `graufurt_${string}` | `steinhag_${string}` | `hochland_${string}`;
export interface Ware { g: string; preis: number }
export interface Laden { id: LadenId; name: string; spruch: string; haendler: string; modell: string; /** Stelle des Händlers (Weltfelder) und Blickrichtung */ x: number; y: number; blick: [number, number]; /** wo der Kunde steht (vor der Theke, auf der Marktseite) */ vor: [number, number];
  gruss: string; tschuess: string; waren: Ware[]; /** Trödler (#88): kauft alles Handelbare zu TROEDLER_ANTEIL des Grundwerts (sonst kauft ein Händler nur, was er führt, zu ANKAUF_ANTEIL) */ troedler?: boolean; /** nur offen, wenn diese Quest so weit ist (sonst: zu) – Server und Browser prüfen gleich */ wenn?: { quest: string; phase: "fertig" }; /** Text, solange zu */ zu?: string; /** die Figur steht schon in der Welt (spiel.json, leute3d.ts) – keine eigene Händlerfigur */ figurInWelt?: boolean; /** der Laden gehört zu dieser Questfigur (shared/quest*.ts): sie zeichnet die Quest, angetippt gibt es dazu „Laden ansehen“ */ questFigur?: string;
  /** #141: ein Bewohner ohne Laden – nur reden (keine Waren, kein Kartensymbol) */ nurReden?: boolean; /** #141: weitere Gesprächszeilen; angesprochen sagt die Figur zufällig eine davon oder den Gruß */ zeilen?: string[] }
/** Währung */
export const WAEHRUNG = "splitter";
/** Vorläufige Preise nach Seltenheit (Splitter) */
const PREIS: Partial<Record<Seltenheit, number>> = { anfaenger: 10, gewoehnlich: 350, selten: 800 };
const BIS_SELTEN: Seltenheit[] = ["anfaenger", "gewoehnlich", "selten"];
const nachSeltenheit = (a: string, b: string) => BIS_SELTEN.indexOf(GEGENSTAENDE[a].seltenheit) - BIS_SELTEN.indexOf(GEGENSTAENDE[b].seltenheit);
const ware = (g: string): Ware => ({ g, preis: PREIS[GEGENSTAENDE[g].seltenheit] || 999 });
/** Waffen: Schwert, Dolch, Zweihandschwert, Kurzbogen, Armbrust, Zauberstab – jede Seltenheit bis einschließlich „Selten“ */
const WAFFEN_ARTEN = ["Einhandschwert", "Dolch", "Zweihandschwert", "Kurzbogen", "Armbrust", "Stab"];
const istKurzbogen = (id: string) => GEGENSTAENDE[id].art === "Kurzbogen" || /kurzbogen/.test(id);
const waffen = Object.keys(GEGENSTAENDE).filter((id) => { const G = GEGENSTAENDE[id]; return !G.untauschbar /* Questbelohnungen (Waldsäbel) gibt es nicht zu kaufen */ && G.platz === "waffe" && BIS_SELTEN.includes(G.seltenheit) && (WAFFEN_ARTEN.includes(G.art) || istKurzbogen(id)) && !(G.art === "Bogen" && !istKurzbogen(id)); })
  .sort((a, b) => WAFFEN_ARTEN.indexOf(istKurzbogen(a) ? "Kurzbogen" : GEGENSTAENDE[a].art) - WAFFEN_ARTEN.indexOf(istKurzbogen(b) ? "Kurzbogen" : GEGENSTAENDE[b].art) || nachSeltenheit(a, b));
/** Rüstung: alles für Kopf, Brust, Beine und Nebenhand (Schilde) bis einschließlich „Selten“ */
const PLATZ_REIHE = ["kopf", "brust", "beine", "nebenhand"];
const ruestung = Object.keys(GEGENSTAENDE).filter((id) => { const G = GEGENSTAENDE[id]; return !G.untauschbar && G.platz && G.platz !== "waffe" && BIS_SELTEN.includes(G.seltenheit); })
  .sort((a, b) => PLATZ_REIHE.indexOf(GEGENSTAENDE[a].platz!) - PLATZ_REIHE.indexOf(GEGENSTAENDE[b].platz!) || nachSeltenheit(a, b));

export const LAEDEN: Record<LadenId, Laden> = {
  waffen: { id: "waffen", name: "Zur Scharfen Kante", spruch: "Spitz, schwer oder beides – wir haben's.", haendler: "Brann Hackebeil", modell: "npc.schmied", x: 6439.2, y: 6439.2, blick: [0, -1], vor: [6439.5, 6436.5],
    gruss: "Na, Abenteurer? Ein Held ohne ordentliche Waffe ist nur ein Wanderer mit Hoffnung.", tschuess: "Dann pass gut auf deine Finger auf. Und auf die der anderen.", waren: [...waffen.map(ware)] /* Holzfällerei: die ersten beiden Beile, die übrigen über das Handwerk */ },
  ruestung: { id: "ruestung", name: "Blech & Bänder", spruch: "Wir halten was aus. Du hoffentlich auch.", haendler: "Gerold Dickfell", modell: "npc.marktschreier", x: 6443.6, y: 6442.2, blick: [0, -1], vor: [6443.5, 6439.5],
    gruss: "Willkommen! Ein Loch im Wams ist schnell geflickt – ein Loch im Helden nicht.", tschuess: "Wie du meinst. Die Banditen freuen sich über jeden ohne Rüstung.", waren: ruestung.map(ware) },
  /* Der Handwerker lehnt vor der Schmiede (Figur aus den Weltdaten, waldmark.mjs „handwerker“): Werkzeug fürs Holzfällen, den Bergbau und den Amboss */
  handwerker: { id: "handwerker", name: "Werkzeug des Handwerkers", spruch: "Gutes Werkzeug ist die halbe Arbeit.", haendler: "Der Handwerker", modell: "npc.schmied", x: 6471.6, y: 6431.3, blick: [0, 1], vor: [6471.6, 6432.9], figurInWelt: true,
    gruss: "Gutes Werkzeug ist die halbe Arbeit. Was brauchst du?", tschuess: "Dann eben ein andermal. Pass auf deine Daumen auf.",
    waren: [ware("holzbeil_training"), ware("holzbeil_einfach"), ware("spitzhacke_training"), ware("spitzhacke_einfach"), ware("hammer"), ware("angelrute"), { g: "krug", preis: 5 }, { g: "sichel", preis: 10 }] /* die besseren über das Handwerk; Angelrute und Krug fürs Fischen und Kochen (Phase 3b) */ },
  /* Die Bäckerei der Waldmark (Phase 2): Grete Korn verkauft Brot – erst, wenn die Mühle wieder mahlt (Quest A3 „Die Mühle steht still“) */
  baeckerei: { id: "baeckerei", name: "Gretes Backstube", spruch: "Frisch aus dem Ofen – solange das Mehl reicht.", haendler: "Grete Korn", modell: "npcfrau3d", x: 6454, y: 6450.1, blick: [0, 1], vor: [6454, 6451.5], figurInWelt: true,
    gruss: "Brot? Heute wieder, dank dir. Nimm, solange es warm ist.", tschuess: "Komm wieder, wenn der Magen knurrt.", waren: [{ g: "brot", preis: 8 }, { g: "mehl", preis: 3 }] /* Mehl für Brot und Eintopf (Phase 3b) */,
    wenn: { quest: "osthof_die_muehle_steht_still", phase: "fertig" }, zu: "Die Bäckerei hat geschlossen. Ohne Mehl backt Grete Korn nicht – die Mühle im Osthof steht still." },
  /* Phase 3c: Hanne Kalk verkauft Mehl aus dem Kornspeicher in Weidenhain – erst, wenn das Wehr wieder hält (B2, Schalter hanne_mehl); sie ist Questfigur (quest_b2.ts) */
  kornspeicher: { id: "kornspeicher", name: "Kornspeicher", spruch: "Mehl aus Weidenhain.", haendler: "Hanne Kalk", modell: "npcfrau3d", x: 6433.4, y: 6679.4, blick: [0, 1], vor: [6433.4, 6680.6], questFigur: "hanne",
    gruss: "Mehl? Endlich wieder. Nimm, so viel du tragen kannst.", tschuess: "Grüß Tebbe von mir.", waren: [{ g: "mehl", preis: 3 }],
    wenn: { quest: "weidenhain_wasser_auf_die_muehle", phase: "fertig" }, zu: "Der Kornspeicher ist leer. Ohne die Mühle gibt es kein Mehl." },
  /* Süden (#126, S2): Imme Sommer in Summweide verkauft Heiltränke, sobald ihr Bienenstock wieder steht (die Kräuter folgen mit der Kräuterkunde, #29) */
  imme: { id: "imme", name: "Immes Honigstand", spruch: "Was die Wiese gibt.", haendler: "Imme Sommer", modell: "npc.imkerin", x: 6419, y: 6907, blick: [0, 1], vor: [6419, 6908.5], questFigur: "imme",
    gruss: "Der Stock steht, die Bienen summen. Was darf es sein?", tschuess: "Pass auf die Schwärme am Rand auf.", waren: [{ g: "kleiner_heiltrank", preis: 35 }, { g: "heiltrank", preis: 150 }] /* Preise wie bei Mira */,
    wenn: { quest: "summweide_der_verschwundene_stock", phase: "fertig" }, zu: "Imme hat keine Zeit für Handel. Ihr Bienenstock ist verschwunden." },
  /* Phase 4: Gisbert Ast verkauft Äpfel in den Obstwiesen – erst nach B3 „Fallobst“; er ist Questfigur (quest_b3.ts) */
  obstwiesen: { id: "obstwiesen", name: "Gisberts Äpfel", spruch: "Äpfel aus den Obstwiesen.", haendler: "Gisbert Ast", modell: "npc.gisbert", x: 6562.5, y: 6691.5, blick: [1, 0], vor: [6563.7, 6691.5], questFigur: "gisbert",
    gruss: "Ein Apfel am Tag, sagt man. Ich sag: zwei. Zum ehrlichen Preis.", tschuess: "Grüß die Kisten vom Großvater, wenn du sie siehst.", waren: [{ g: "apfel", preis: 2 }],
    wenn: { quest: "obstwiesen_fallobst", phase: "fertig" }, zu: "Gisbert hat nichts zu verkaufen. Seine Kisten sind leer." },
  traenke: { id: "traenke", name: "Schluck auf!", spruch: "Tränke für jedes Wehwehchen.", haendler: "Mira Kräuterlieb", modell: "npc.kraeuterfrau", x: 6456, y: 6441, blick: [0, -1], vor: [6456.5, 6438.5],
    gruss: "Ach, du siehst blass aus, Kindchen. Ein Schlückchen gefällig?", tschuess: "Komm wieder, bevor's wehtut. Hinterher ist's teurer.", waren: [{ g: "kleiner_heiltrank", preis: 35 }, { g: "heiltrank", preis: 150 }, { g: "leeres_flaeschchen", preis: 2 }] /* Fläschchen zum Brauen (#133) */ },
};
/* Trödler (#88): je Standplatz der Welt (realtime/welt/troedler_standorte.json) ein Händler, der alles Handelbare zu 50 % des Grundwerts ankauft und nichts verkauft.
   Entscheidung des Nutzers: kein Trödler im Kreuzwald und im Osthof, der erste steht im Rabenmoor. Figuren npc.troedler (Karren) / npc.troedlerin (Bauchladen) folgen mit dem Figuren-Zweig. */
for (const t of (TROEDLER_STANDORTE as { standorte: { id: string; x: number; y: number; ort: string; variante: string }[] }).standorte) {
  const frau = t.variante === "bauchladen";
  LAEDEN[t.id as LadenId] = { id: t.id as LadenId, name: frau ? "Bauchladen" : "Trödelkarren", spruch: "Ich nehm alles – fast alles.", haendler: frau ? "Die Trödlerin" : "Der Trödler",
    modell: frau ? "npcfrau3d" : "npcmann3d", x: t.x, y: t.y, blick: [0, 1], vor: [t.x, t.y + 1.2], troedler: true, waren: [],
    gruss: frau ? "Na, was schleppst du da mit dir rum? Zeig her, ich mach dir einen Preis." : "Alles hat seinen Preis. Die Hälfte davon zahl ich dir.",
    tschuess: frau ? "Komm wieder, wenn der Rucksack drückt." : "Gute Wege. Und bring mir, was du nicht brauchst." }; }
/* D3 „Wels im Trüben“: Alma Furtner vor der Taverne „Zur Furt“ verkauft Welspastete, sobald D3 fertig ist (Schalter alma_pastete); sie ist Questfigur (quest_d3.ts) */
LAEDEN.graufurt_alma = { id: "graufurt_alma", name: "Zur Furt", spruch: "Welspastete nach Graufurter Art.", haendler: "Alma Furtner", modell: "npc.alma", x: 6700.5, y: 6542.5, blick: [0, 1], vor: [6700.5, 6543.8], questFigur: "alma",
  gruss: "Pastete? Frisch aus dem Ofen, mit Wels aus dem Fährhafen.", tschuess: "Komm wieder, wenn der Magen knurrt.", waren: [{ g: "welspastete", preis: 45 }, { g: "brot", preis: 8 }],
  wenn: { quest: "graufurt_wels_im_trueben", phase: "fertig" }, zu: "Alma hat nichts zu verkaufen. Ohne Wels keine Pastete." };
/* ───── #141: Haferstedt, Netzbucht und Sandquell (Welt #140, 6a116f04, welt/beleben_orte.json) – Bewohner, Läden nur mit vorhandenen Waren, kurze Zeilen.
   Stellen der Händler nach dem Vorschlag der Welt; Modelle vorerst aus dem Bestand (Figuren ordnet sie in #141 zu). ───── */
type Neu = Omit<Laden, "id" | "waren" | "blick" | "vor"> & { waren?: Ware[]; blick?: [number, number]; vor?: [number, number] };
const ort = (id: LadenId, L: Neu) => { const b = L.blick || [0, 1]; LAEDEN[id] = { ...L, id, waren: L.waren || [], blick: b, vor: L.vor || [L.x + b[0] * 1.3, L.y + b[1] * 1.3] }; };
const W = (g: string, preis: number): Ware => ({ g, preis });
/* Haferstedt, Marktflecken im Westen */
ort("haferstedt_taverne", { name: "Zum Haferkranz", spruch: "Eintopf, Brot und ein Platz am Feuer.", haendler: "Wilma Garbe", modell: "npc.marktfrau", x: 6211, y: 6972.5,
  gruss: "Komm rein, setz dich! Der Eintopf ist heiß, das Brot von heute früh.", tschuess: "Schlaf gut – oder kämpf gut, je nachdem.",
  zeilen: ["Am Markttag ist hier kein Stuhl frei. Heute hast du Glück.", "Den Herd darfst du benutzen, wenn du selbst kochen willst. Nur nicht anbrennen lassen."],
  waren: [W("brot", 8), W("bauerneintopf", 20), W("fischsuppe", 15), W("hasenbraten", 10), W("krug", 5)] });
ort("haferstedt_baecker", { name: "Laibs Backstube", spruch: "Brot aus Haferstedter Korn.", haendler: "Jost Laib", modell: "npc.bauer", x: 6235, y: 6979.4,
  gruss: "Frisch aus dem Ofen. Riech mal!", tschuess: "Bis morgen – dann ist es wieder warm.", zeilen: ["Das Mehl kommt von Mattes oben an der Mühle. Besseres findest du nirgends."],
  waren: [W("brot", 8), W("mehl", 3)] });
ort("haferstedt_schmiede", { name: "Esse am Markt", spruch: "Werkzeug, das hält.", haendler: "Frauke Esser", modell: "npc.schmiedin", x: 6203, y: 6996.5,
  gruss: "Ein Beil, eine Hacke, ein Hammer? Oder willst du selbst an die Esse? Nur zu.", tschuess: "Halt die Schneide sauber.", zeilen: ["Esse und Amboss stehen jedem offen, der einen Hammer mitbringt."],
  waren: [W("holzbeil_training", 10), W("holzbeil_einfach", 350), W("spitzhacke_training", 10), W("spitzhacke_einfach", 350), W("hammer", 10), W("sichel", 10)] /* wie der Handwerker der Waldmark */ });
ort("haferstedt_muehle", { name: "Windmühle Haferstedt", spruch: "Mehl, frisch gemahlen.", haendler: "Mattes Mahler", modell: "npc.alter_bauer", x: 6245, y: 6951.5,
  gruss: "Solange der Wind weht, mahlt sie. Und hier weht er immer.", tschuess: "Grüß Jost von mir.", waren: [W("mehl", 3)] });
ort("haferstedt_allerlei", { name: "Allerlei vom Markt", spruch: "Von allem etwas.", haendler: "Ludger Krämer", modell: "npc.kaufmann", x: 6207, y: 6987.4, blick: [0, -1], vor: [6207, 6984.6],
  gruss: "Äpfel, Krüge, Angeln, Würmer – was suchst du?", tschuess: "Komm am Markttag wieder, dann hab ich mehr.", waren: [W("apfel", 2), W("krug", 5), W("angelrute", 10), W("wurm", 2), W("leeres_flaeschchen", 2)] });
ort("haferstedt_kraeuter", { name: "Kräuter und Tränke", spruch: "Für Wunden und Wehwehchen.", haendler: "Ilse Wermut", modell: "npc.kauffrau", x: 6223, y: 6987.4, blick: [0, -1], vor: [6223, 6984.6],
  gruss: "Siehst müde aus. Ein Schlückchen?", tschuess: "Pass auf dich auf.", waren: [W("kleiner_heiltrank", 35), W("heiltrank", 150), W("leeres_flaeschchen", 2)] });
ort("troedler_haferstedt", { name: "Trödelstand", spruch: "Ich nehm alles – fast alles.", haendler: "Der Trödler", modell: "npc.troedler", x: 6215, y: 6987.4, blick: [0, -1], vor: [6215, 6984.6], troedler: true,
  gruss: "Alles hat seinen Preis. Die Hälfte davon zahl ich dir.", tschuess: "Gute Wege. Und bring mir, was du nicht brauchst." });
ort("haferstedt_vogt", { name: "Marktvogt", spruch: "", haendler: "Reinhold Scheffel", modell: "npc.marktschreier", x: 6217, y: 6981.5, nurReden: true,
  gruss: "Willkommen in Haferstedt. Wer hier verkauft, zahlt Standgeld. Wer kauft, zahlt nur den Preis.", tschuess: "Gute Geschäfte.",
  zeilen: ["Zwischen Rabenmoor und der Küste gibt es keinen größeren Markt. Korn, Wolle, Fisch – alles kommt hierher.", "Die Fischer aus Netzbucht bringen jeden Markttag ihren Fang. Riecht man schon von Weitem.",
    "Die Kapelle oben am Hang ist älter als das Dorf. Sagt jedenfalls der Pfarrer."] });
/* Netzbucht, Fischerweiler an der Westküste */
ort("netzbucht_fischer", { name: "Treibs Räucherfisch", spruch: "Frisch, gebraten oder geräuchert.", haendler: "Hauke Treib", modell: "npc.fischer", x: 6134, y: 6933.5, blick: [1, 0],
  gruss: "Hering aus der Bucht, Aal von den Klippen. Was darf's sein?", tschuess: "Wind von achtern!", zeilen: ["Die Räucherhütte und das Feuer darfst du benutzen. Holz bringst du selbst mit."],
  waren: [W("fisch_hering_roh", 4), W("fisch_hering_gebraten", 8), W("raeucherhering", 14), W("fisch_seeaal_gebraten", 10), W("aalsuppe", 30)] });
ort("netzbucht_netze", { name: "Netze und Leinen", spruch: "Was der Fischer braucht.", haendler: "Gesa Knoten", modell: "npc.hafen_frau", x: 6148, y: 6930.5, blick: [-1, 0],
  gruss: "Jedes Loch im Netz ist ein Fisch, der davonschwimmt. Brauchst du eine Angel?", tschuess: "Und lass dir nichts durch die Maschen gehen.",
  zeilen: ["Drei Katen, eine Räucherhütte und die Bucht. Mehr braucht Netzbucht nicht."], waren: [W("angelrute", 10), W("wurm", 2), W("krug", 5)] });
/* Sandquell, Oasenort in den Glutsanden */
ort("sandquell_herberge", { name: "Herberge Zur kühlen Quelle", spruch: "Schatten, Wasser, ein Bett.", haendler: "Omid Karr", modell: "npc.glutbrunn_mann", x: 7372, y: 6727.4,
  gruss: "Komm aus der Sonne! Wasser gibt es umsonst, das Essen nicht.", tschuess: "Trink, bevor du gehst. Die Dünen verzeihen nichts.",
  zeilen: ["Die Karawanen bleiben zwei Nächte, dann ziehen sie weiter – zur Salzpfanne oder zum Nordstrand."],
  waren: [W("brot", 8), W("krug_wasser", 2), W("fisch_glutwels_gebraten", 40), W("wildbretbraten", 20)] });
ort("sandquell_markt", { name: "Wüstenmarkt", spruch: "Was die Karawanen bringen.", haendler: "Tarek Salzer", modell: "npc.kaufmann", x: 7378, y: 6753.4,
  gruss: "Tränke gegen die Hitze, Fläschchen, Äpfel aus dem Westen. Teuer? Sie sind weit gereist.", tschuess: "Möge der Wind dir den Rücken kühlen.",
  waren: [W("kleiner_heiltrank", 40), W("heiltrank", 170), W("leeres_flaeschchen", 3), W("apfel", 3), W("krug", 6)] });
ort("troedler_sandquell", { name: "Karawanenlager", spruch: "Wir kaufen, was sich tragen lässt.", haendler: "Karawanenmeister Ruben Weit", modell: "npc.karawane", x: 7370, y: 6759.6, troedler: true,
  gruss: "Alles, was sich auf ein Tier packen lässt, nehme ich. Zum halben Preis – die Reise ist lang.", tschuess: "Wir ziehen morgen weiter. Vielleicht.",
  zeilen: ["Glutbrunn, die Salzpfanne, der Nordstrand – ohne Sandquell kommt keine Karawane durch."] });
ort("sandquell_quelle", { name: "Quellwächterin", spruch: "", haendler: "Ayla Dünenruh", modell: "npc.glutbrunn_frau", x: 7386, y: 6745, nurReden: true,
  gruss: "Die Quelle gehört niemandem. Darum wache ich über sie.", tschuess: "Geh mit Wasser.",
  zeilen: ["Seit hundert Jahren ist sie nicht versiegt. Wer Sand hineinwirft, bekommt es mit mir zu tun.", "Nachts hört man die Dünen singen. Das ist nur der Wind. Meistens."] });
/* ───── Phase 11 (doku/konzepte/phase-11.md): die Hochlande – Steinhag, Erzberg, Passwacht, Hohe Alm, Einsiedelei. Plätze der Welt (welt/hochlande_orte.json),
   Modelle nach der Zuordnung von Figuren (#148). Läden nur mit vorhandenen Waren; die Läden in Steinhag öffnen erst nach H1 (Entscheidung des Nutzers, 27.11.: unten), die Bank immer. ───── */
/* Steinhag, Bergstadt am See */
ort("steinhag_taverne", { name: "Zum Grubenlicht", spruch: "Warm, laut und voller Bergleute.", haendler: "Ruprecht Talg", modell: "npc.alter_bauer", x: 7010, y: 5879.8,
  gruss: "Setz dich zu den Kumpeln! Eintopf, Braten, Bier – such dir was aus.", tschuess: "Glück auf!",
  zeilen: ["Seit die Trolle auf den Wegen sind, kommen keine Erzwagen mehr durch. Das Bier geht trotzdem weg.", "Herd und Kessel stehen jedem offen, der selbst kochen kann."],
  waren: [W("brot", 8), W("bauerneintopf", 20), W("wildbretbraten", 20), W("fischsuppe", 15), W("krug", 5)] });
ort("steinhag_schmiede", { name: "Hammer und Stollen", spruch: "Werkzeug für Berg und Wald.", haendler: "Konrad Hauer", modell: "npc.schmied", x: 7006, y: 5917.6,
  gruss: "Eine Hacke, die durch Sterneisen geht? Die schmiedest du selbst. Für den Anfang hab ich das hier.", tschuess: "Glück auf – und pass auf die Trolle auf.",
  zeilen: ["Esse und Amboss stehen dir offen. Hammer nicht vergessen."], waren: [W("holzbeil_training", 10), W("holzbeil_einfach", 350), W("spitzhacke_training", 10), W("spitzhacke_einfach", 350), W("hammer", 10), W("sichel", 10)] });
ort("steinhag_allerlei", { name: "Bergmarkt", spruch: "Was man in den Bergen braucht.", haendler: "Jakob Kiesel", modell: "npc.haendler_sued", x: 6982, y: 5897.4, blick: [0, -1], vor: [6982, 5894.6],
  gruss: "Krüge, Angeln, Würmer, Äpfel aus dem Tal – alles den Pass herauf getragen.", tschuess: "Komm wieder, wenn die Wagen fahren.", waren: [W("apfel", 3), W("krug", 6), W("angelrute", 10), W("wurm", 2), W("sichel", 10), W("leeres_flaeschchen", 2)] });
ort("steinhag_kraeuter", { name: "Bergkräuter und Tränke", spruch: "Gegen Kälte und Wunden.", haendler: "Edda Moos", modell: "npc.kauffrau", x: 6998, y: 5897.4, blick: [0, -1], vor: [6998, 5894.6],
  gruss: "Oben am Pass wird's kalt. Ein Trank wärmt – von innen.", tschuess: "Bleib warm.", waren: [W("kleiner_heiltrank", 35), W("heiltrank", 150), W("leeres_flaeschchen", 2)] });
ort("troedler_steinhag", { name: "Trödelstand", spruch: "Ich nehm alles – fast alles.", haendler: "Die Trödlerin", modell: "npc.troedlerin", x: 6974, y: 5894, blick: [1, 0], troedler: true,
  gruss: "Was die Bergleute nicht brauchen, kauf ich. Und was du nicht brauchst, auch.", tschuess: "Komm wieder, wenn der Rucksack drückt." });
ort("steinhag_vogt", { questFigur: "bergvoegtin", name: "Bergvögtin", spruch: "", haendler: "Hilde Erzgrund", modell: "npc.kauffrau", x: 6991, y: 5880, nurReden: true,
  gruss: "Willkommen in Steinhag. Wir haben Erz, Holz und Fisch – und seit Wochen zu viele Trolle.", tschuess: "Glück auf.",
  zeilen: ["Die Passwacht hält kaum noch. Wenn du nach Norden willst, sprich mit den Wächtern am Hochpass.", "Das Bergwerk am Erzberg ist das älteste der Splitterlande. Was unten liegt, weiß keiner so genau."] });
/* #160: die Läden in Steinhag öffnen erst nach H1 „Über den Pass“ (Entscheidung des Nutzers, 27.11.) – die Bank (shared/bank.ts) und die Bergvögtin bleiben immer da */
export const STEINHAG_LAEDEN: LadenId[] = ["steinhag_taverne", "steinhag_schmiede", "steinhag_allerlei", "steinhag_kraeuter", "troedler_steinhag"];
for (const id of STEINHAG_LAEDEN) Object.assign(LAEDEN[id], { wenn: { quest: H_QUESTS.h1, phase: "fertig" as const },
  zu: "Die Läden sind zu. Seit die Trolle auf den Wegen sind, kommt keine Ware über den Pass – die Bergvögtin sucht jemanden, der hilft." });
/* Bergwerk am Erzberg, Passwacht am Hochpass, Hohe Alm, Einsiedelei am Spiegelsee, Brücke zur Furt */
ort("hochland_steiger", { questFigur: "wendel", name: "Steiger", spruch: "", haendler: "Steiger Wendel", modell: "npc.bergmann", x: 7124, y: 5811, blick: [1, 0], nurReden: true,
  gruss: "Glück auf! Unten liegt Sterneisen, Splittereisen – und ganz tief Ureisen. Wenn du Mut hast.", tschuess: "Glück auf.",
  zeilen: ["In der großen Halle haben wir Knochen gefunden. Zu groß für einen Menschen. Seitdem geht keiner mehr allein runter."] });
ort("hochland_bergmann", { name: "Bergmann", spruch: "", haendler: "Bergmann Lutz", modell: "npc.bergmann2", x: 7131, y: 5812, blick: [-1, 0], nurReden: true,
  gruss: "Die Lore? Die schiebt sich nicht von allein. Hilf mit oder geh aus dem Weg.", tschuess: "Glück auf.", zeilen: ["Das Licht am Helm geht aus, wenn's unten zieht. Dann heißt es: rauf, und zwar schnell."] });
ort("hochland_bergfrau", { name: "Bergfrau", spruch: "", haendler: "Bergfrau Gesche", modell: "npc.bergfrau", x: 7116, y: 5821.5, nurReden: true,
  gruss: "Zwanzig Jahre unter Tage. Die Berge reden, wenn man zuhört.", tschuess: "Glück auf.", zeilen: ["Kupfer und Eisen gibt's hier vorn am Eingang. Für das Gute musst du tiefer."] });
ort("hochland_passwaechterin", { questFigur: "brun", name: "Passwächterin", spruch: "", haendler: "Wächterin Brun", modell: "npcfrau3d", x: 6964, y: 5608.5, nurReden: true,
  gruss: "Halt. Hinter dem Pass beginnt die Kälte. Wer weitergeht, tut es auf eigene Gefahr.", tschuess: "Bleib auf dem Weg.",
  zeilen: ["Das Feuer brennt Tag und Nacht. Wärm dich, bevor du weitergehst."] });
ort("hochland_passwaechter", { questFigur: "ansgar", name: "Passwächter", spruch: "", haendler: "Wächter Ansgar", modell: "npc.passwaechter", x: 6955, y: 5607.6, nurReden: true,
  gruss: "Drei von uns, und der Pass ist breit. Die Trolle wissen das.", tschuess: "Mögen die Steine stillhalten.", zeilen: ["Die Schranke hält niemanden auf. Sie ist für die Ordnung."] });
ort("hochland_sennerin", { questFigur: "afra", name: "Sennerin", spruch: "", haendler: "Sennerin Afra", modell: "npc.sennerin", x: 7199.5, y: 6001.5,
  gruss: "Grüß dich! Frische Milch, Käse im Rad – aber erst, wenn die Ziegen wieder da sind.", tschuess: "Pfiat di.", zeilen: ["Der Kessel ist für den Käse. Wenn du was kochen willst – bitte, aber mach ihn sauber."],
  /* #118: Afras Laden öffnet nach H2 „Käse für die Passwacht“ */ waren: [W("ziegenmilch", 6), W("kaeselaib", 45)], wenn: { quest: H_QUESTS.h2, phase: "fertig" },
  zu: "Afra hat nichts zu verkaufen. Die Ziegen sind weg, und ohne Milch gibt es keinen Käse." });
ort("hochland_senn", { name: "Senn", spruch: "", haendler: "Senn Bartl", modell: "npc.hirte1", x: 7185, y: 6002.4, nurReden: true,
  gruss: "Hier oben ist die Luft so dünn, dass man die Gedanken hört.", tschuess: "Pfiat di.", zeilen: ["Die Murmeltiere pfeifen, wenn ein Adler kommt. Hör auf sie."] });
ort("hochland_einsiedler", { questFigur: "einsiedler", name: "Einsiedler", spruch: "", haendler: "Der Einsiedler", modell: "npc.hirte2", x: 7341, y: 5665.4, nurReden: true,
  gruss: "Ah, ein Wanderer. Setz dich. Der See erzählt dir mehr als ich.", tschuess: "Geh mit den Steinen.",
  zeilen: ["Ich schreibe die Geschichte der Hochlande auf. Sie ist älter als die Splitter.", "Am Grauhorn stehen Steinmänner. Jeder erzählt von einem, der nicht zurückkam."] });
ort("hochland_furtwache", { questFigur: "furtwache", name: "Wache an der Furt", spruch: "", haendler: "Wache Odo", modell: "stadtwache3d", x: 6725, y: 5763, blick: [1, 0], nurReden: true,
  gruss: "Die Brücke trägt. Drüben beginnen die Hochlande – und die Trolle.", tschuess: "Pass auf dich auf.", zeilen: ["Früher kamen hier jeden Tag Erzwagen aus Steinhag. Seit Wochen keiner mehr."] });
export const LADEN_LISTE = Object.values(LAEDEN);
/** Ist der Laden für diesen Spieler offen? stand: Stand einer Quest */
export const ladenOffen = (L: Laden, stand: (id: string) => string): boolean => !L.wenn || stand(L.wenn.quest) === L.wenn.phase;
/** Symbol je Laden (Minikarte und Karte) */
export const LADEN_ZEICHEN: Record<string, string> = { waffen: "⚔️", ruestung: "🛡️", traenke: "🧪", handwerker: "🔨", baeckerei: "🍞", kornspeicher: "🌾", obstwiesen: "🍎", imme: "🍯",
  haferstedt_taverne: "🍲", haferstedt_baecker: "🍞", haferstedt_schmiede: "🔨", haferstedt_muehle: "🌾", haferstedt_allerlei: "🧺", haferstedt_kraeuter: "🧪", netzbucht_fischer: "🐟", netzbucht_netze: "🎣", sandquell_herberge: "🍲", sandquell_markt: "🧺", graufurt_alma: "🥧", steinhag_taverne: "🍲", steinhag_schmiede: "🔨", steinhag_allerlei: "🧺", steinhag_kraeuter: "🧪" };
for (const L of LADEN_LISTE) if (L.troedler) LADEN_ZEICHEN[L.id] = "🪙"; /* Trödler (#88) */
/* ───── An Händler verkaufen (#87) und Trödler (#88) ───── */
/** Ein Händler zahlt für seine eigenen Waren so viel von seinem Preis; der Trödler so viel vom Grundwert */
export const ANKAUF_ANTEIL = 0.8, TROEDLER_ANTEIL = 0.5;
/** Grundwert eines Gegenstands: der höchste Ladenpreis, sonst GegenstandDef.wert (sonst keiner – dann kauft auch der Trödler nicht) */
export function grundwert(g: string): number | null { let p = 0; for (const L of Object.values(LAEDEN)) for (const w of L.waren) if (w.g === g) p = Math.max(p, w.preis);
  if (p > 0) return p; const G = GEGENSTAENDE[g]; return G && G.wert && G.wert > 0 ? G.wert : G ? standardWert(G) : null; }
/** Trödler (#88): Grundwert nach Seltenheit für alles ohne Ladenpreis und ohne eigenen wert – Rohstoffe, Fische, Essen, Werkzeug, Ausrüstung (×4), Abfall 1.
 *  Questgegenstände, Zierde, Sammelstücke, Währung und Splitterbinden-Dinge haben keinen – die kauft niemand. */
const WERT_JE_STUFE: Record<string, number> = { anfaenger: 2, gewoehnlich: 5, selten: 25, episch: 120, legendaer: 500, mythisch: 2000, set: 300 };
const OHNE_WERT = new Set(["Questgegenstand", "Zierde", "Sammelstück", "Währung", "Splitterbinden"]);
function standardWert(G: { art: string; seltenheit: string; platz?: string }): number | null {
  if (OHNE_WERT.has(G.art)) return null; if (G.art === "Abfall") return 1; const w = WERT_JE_STUFE[G.seltenheit]; return w ? w * (G.platz ? 4 : 1) : null; }
/** Was dieser Händler für ein Stück zahlt (Splitter, mindestens 1) – null: kauft er nicht (nicht geführt, kein Grundwert, nicht handelbar: Quest, gebunden, geladen „(s)“, Splitter selbst) */
export function ankaufPreis(L: Laden, g: string, d?: Daten): number | null { if (g === WAEHRUNG || !handelbar(g, d)) return null;
  if (L.troedler) { const w = grundwert(g); return w === null ? null : Math.max(1, Math.floor(w * TROEDLER_ANTEIL)); }
  const w = L.waren.find((x) => x.g === g); return w ? Math.max(1, Math.floor(w.preis * ANKAUF_ANTEIL)) : null; }
/** So nah muss man stehen, um zu kaufen (Felder vom Händler) */
export const KAUF_WEIT = 4;
