/*
 * Mythara – die Läden am Marktplatz der Waldmark (23.11.2026). Eine Quelle für Server (Kauf prüfen) und Browser (Händler, Ladenfenster).
 * Drei Händler stehen hinter ihren Marktständen (Weltdaten waldmark.mjs: stand_1 rot, stand_2 blau, stand_3 grün; Fuß des Stands = Mitte seiner Südkante,
 * die Theke liegt 0–0,7 Felder nördlich davon). Der Händler steht südlich hinter der Theke und schaut nach Norden auf den Marktplatz, der Kunde davor. Bezahlt wird mit Splittern. Preise und Werte sind vorläufig (Balancing folgt).
 */
import { GEGENSTAENDE, Seltenheit } from "./gegenstaende";

export type LadenId = "waffen" | "ruestung" | "traenke" | "handwerker";
export interface Ware { g: string; preis: number }
export interface Laden { id: LadenId; name: string; spruch: string; haendler: string; modell: string; /** Stelle des Händlers (Weltfelder) und Blickrichtung */ x: number; y: number; blick: [number, number]; /** wo der Kunde steht (vor der Theke, auf der Marktseite) */ vor: [number, number];
  gruss: string; tschuess: string; waren: Ware[]; /** die Figur steht schon in der Welt (spiel.json, leute3d.ts) – keine eigene Händlerfigur */ figurInWelt?: boolean }
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
    waren: [ware("holzbeil_training"), ware("holzbeil_einfach"), ware("spitzhacke_training"), ware("spitzhacke_einfach"), ware("hammer")] /* die besseren über das Handwerk */ },
  traenke: { id: "traenke", name: "Schluck auf!", spruch: "Tränke für jedes Wehwehchen.", haendler: "Mira Kräuterlieb", modell: "npc.kraeuterfrau", x: 6456, y: 6441, blick: [0, -1], vor: [6456.5, 6438.5],
    gruss: "Ach, du siehst blass aus, Kindchen. Ein Schlückchen gefällig?", tschuess: "Komm wieder, bevor's wehtut. Hinterher ist's teurer.", waren: [{ g: "kleiner_heiltrank", preis: 35 }, { g: "heiltrank", preis: 150 }] },
};
export const LADEN_LISTE = Object.values(LAEDEN);
/** Symbol je Laden (Minikarte und Karte) */
export const LADEN_ZEICHEN: Record<LadenId, string> = { waffen: "⚔️", ruestung: "🛡️", traenke: "🧪", handwerker: "🔨" };
/** So nah muss man stehen, um zu kaufen (Felder vom Händler) */
export const KAUF_WEIT = 4;
