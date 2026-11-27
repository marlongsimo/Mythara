/*
 * Mythara – die Läden am Marktplatz der Waldmark (23.11.2026). Eine Quelle für Server (Kauf prüfen) und Browser (Händler, Ladenfenster).
 * Drei Händler stehen hinter ihren Marktständen (Weltdaten waldmark.mjs: stand_1 rot, stand_2 blau, stand_3 grün; Fuß des Stands = Mitte seiner Südkante,
 * die Theke liegt 0–0,7 Felder nördlich davon). Der Händler steht südlich hinter der Theke und schaut nach Norden auf den Marktplatz, der Kunde davor. Bezahlt wird mit Splittern. Preise und Werte sind vorläufig (Balancing folgt).
 */
import { GEGENSTAENDE, Seltenheit, handelbar, type Daten } from "./gegenstaende";
import TROEDLER_STANDORTE from "../welt/troedler_standorte.json";

export type LadenId = "waffen" | "ruestung" | "traenke" | "handwerker" | "baeckerei" | "kornspeicher" | "obstwiesen" | "imme" | `troedler_${string}`;
export interface Ware { g: string; preis: number }
export interface Laden { id: LadenId; name: string; spruch: string; haendler: string; modell: string; /** Stelle des Händlers (Weltfelder) und Blickrichtung */ x: number; y: number; blick: [number, number]; /** wo der Kunde steht (vor der Theke, auf der Marktseite) */ vor: [number, number];
  gruss: string; tschuess: string; waren: Ware[]; /** Trödler (#88): kauft alles Handelbare zu TROEDLER_ANTEIL des Grundwerts (sonst kauft ein Händler nur, was er führt, zu ANKAUF_ANTEIL) */ troedler?: boolean; /** nur offen, wenn diese Quest so weit ist (sonst: zu) – Server und Browser prüfen gleich */ wenn?: { quest: string; phase: "fertig" }; /** Text, solange zu */ zu?: string; /** die Figur steht schon in der Welt (spiel.json, leute3d.ts) – keine eigene Händlerfigur */ figurInWelt?: boolean; /** der Laden gehört zu dieser Questfigur (shared/quest*.ts): sie zeichnet die Quest, angetippt gibt es dazu „Laden ansehen“ */ questFigur?: string }
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
export const LADEN_LISTE = Object.values(LAEDEN);
/** Ist der Laden für diesen Spieler offen? stand: Stand einer Quest */
export const ladenOffen = (L: Laden, stand: (id: string) => string): boolean => !L.wenn || stand(L.wenn.quest) === L.wenn.phase;
/** Symbol je Laden (Minikarte und Karte) */
export const LADEN_ZEICHEN: Record<string, string> = { waffen: "⚔️", ruestung: "🛡️", traenke: "🧪", handwerker: "🔨", baeckerei: "🍞", kornspeicher: "🌾", obstwiesen: "🍎", imme: "🍯" };
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
