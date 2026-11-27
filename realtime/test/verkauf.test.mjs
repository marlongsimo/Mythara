/*
 * Riftmere – an Händler verkaufen (#87) und Trödler (#88), ohne Server-Prozess und ohne Supabase:
 * nur Waren, die der Händler führt, zu 80 % seines Preises; der Trödler kauft alles Handelbare zu 50 % des Grundwerts (Ladenpreis, sonst wert);
 * nicht: Questgegenstände, gebundener Questlohn, geladene Waffen „(s)“, Splitter; nur nah am Händler und wenn er offen hat; atomar (Ware raus, Splitter rein).
 * Aufruf (im Ordner realtime): node test/verkauf.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-verkauf-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * as V from "./server/src/verkauf"; export * as I from "./server/src/inventar"; export * from "./shared/laeden"; export { GEGENSTAENDE } from "./shared/gegenstaende";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { V, I, LAEDEN, ankaufPreis, grundwert, GEGENSTAENDE } = await import(datei);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
let ROW = []; const sb = async (pfad) => (pfad.includes("rpg_held?") ? ROW : null);
const held = async (n, rucksack) => { ROW = [{ waffe: "schwert", inventar: { angelegt: {}, rucksack, v: 2 } }]; await I.inventarLaden(sb, n); };
const T = LAEDEN.traenke, offen = () => "fertig", rs = (n) => I.inventarVon(n).rucksack;
const preisT = T.waren.find((w) => w.g === "heiltrank").preis;

console.log("\nAn Händler verkaufen (#87)");
await held("anna", [{ g: "heiltrank", n: 5 }, "ritterschwert", { g: "heiltrank", n: 2, d: { gebunden: true } }, { g: "holz_waldgott", n: 1 }, { g: "splitter", n: 10 }]);
check(ankaufPreis(T, "heiltrank") === Math.floor(preisT * 0.8), `Mira kauft Heiltränke zu 80 % (${ankaufPreis(T, "heiltrank")} von ${preisT} Splittern)`);
let r = V.ladenVerkauf(sb, "anna", "traenke", 0, 2, T.x, T.y, offen);
check(!r.fehler && r.n === 2 && r.splitter === 2 * Math.floor(preisT * 0.8) && I.anzahlVon("anna", "heiltrank") === 5 && I.anzahlVon("anna", "splitter") === 10 + r.splitter, `2 Heiltränke verkauft: +${r.splitter} Splitter, 3 bleiben im Fach`);
check(/kauft das nicht/.test(V.ladenVerkauf(sb, "anna", "traenke", 1, 1, T.x, T.y, offen).fehler || ""), "was er nicht führt (Schwert), kauft Mira nicht");
check(/kauft das nicht/.test(V.ladenVerkauf(sb, "anna", "traenke", 2, 1, T.x, T.y, offen).fehler || "") && I.anzahlVon("anna", "heiltrank") === 5, "gebundener Questlohn: nicht verkaufbar");
check(/Geh näher/.test(V.ladenVerkauf(sb, "anna", "traenke", 0, 1, T.x + 10, T.y, offen).fehler || ""), "nur nah am Händler");
check(/Händler gibt es nicht/.test(V.ladenVerkauf(sb, "anna", "quatsch", 0, 1, T.x, T.y, offen).fehler || ""), "unbekannter Händler");
const B = LAEDEN.baeckerei; check(V.ladenVerkauf(sb, "anna", "baeckerei", 0, 1, B.x, B.y, () => "").fehler === B.zu, "geschlossener Laden kauft nichts");
r = V.ladenVerkauf(sb, "anna", "traenke", 0, 99, T.x, T.y, offen); check(!r.fehler && r.n === 3 && !rs("anna").some((x) => x.g === "heiltrank" && !x.d), "mehr als im Fach: der ganze Stapel, das Fach ist leer");
check(/gibt es im Rucksack nicht/.test(V.ladenVerkauf(sb, "anna", "traenke", 99, 1, T.x, T.y, offen).fehler || ""), "falsches Fach");

console.log("\nTrödler (#88)");
LAEDEN.troedel = { ...T, id: "troedel", haendler: "Test-Trödler", troedler: true, waren: [] }; const TR = LAEDEN.troedel;
GEGENSTAENDE.test_krempel = { id: "test_krempel", name: "Krempel", art: "Rohstoff", seltenheit: "gewoehnlich", wert: 7 };
check(ankaufPreis(TR, "ritterschwert") === Math.floor(grundwert("ritterschwert") * 0.5), `Schwert: 50 % des Ladenpreises (${ankaufPreis(TR, "ritterschwert")} von ${grundwert("ritterschwert")})`);
check(ankaufPreis(TR, "test_krempel") === 3, "ohne Ladenpreis: 50 % von wert (7 → 3)");
check(ankaufPreis(TR, "holz_waldgott") === null && ankaufPreis(TR, "splitter") === null && ankaufPreis(TR, "eidschwert", { ladungen: 5 }) === null, "nicht: Questgegenstand, Splitter, geladene Waffe (s)");
const ohneWert = Object.keys(GEGENSTAENDE).find((g) => grundwert(g) === null && !GEGENSTAENDE[g].untauschbar && g !== "splitter"); if (ohneWert) check(ankaufPreis(TR, ohneWert) === null, `ohne Ladenpreis und ohne wert kauft auch der Trödler nicht (${ohneWert})`);
const vor = I.anzahlVon("anna", "splitter"); r = V.ladenVerkauf(sb, "anna", "troedel", rs("anna").findIndex((x) => (x.g || x) === "ritterschwert"), 1, TR.x, TR.y, offen);
check(!r.fehler && I.anzahlVon("anna", "splitter") === vor + ankaufPreis(TR, "ritterschwert") && !rs("anna").includes("ritterschwert"), "der Trödler kauft das Schwert");

console.log("\nAtomar");
await held("voll", [...Array.from({ length: 22 }, () => "ritterschwert"), { g: "heiltrank", n: 3 }]);
r = V.ladenVerkauf(sb, "voll", "traenke", 22, 1, T.x, T.y, offen); check(!r.fehler && I.anzahlVon("voll", "heiltrank") === 2 && I.anzahlVon("voll", "splitter") === r.splitter, "ein freies Fach reicht für die Splitter");
await held("ganzvoll", [...Array.from({ length: 23 }, () => "ritterschwert"), { g: "heiltrank", n: 3 }]); I.aufnehmen(sb, "ganzvoll", "kleiner_heiltrank", 1);
const vorher = JSON.stringify(rs("ganzvoll")); r = V.ladenVerkauf(sb, "ganzvoll", "traenke", 23, 1, T.x, T.y, offen);
check(/voll/.test(r.fehler || "") && JSON.stringify(rs("ganzvoll")) === vorher, "Rucksack voll, ein Trank bleibt im Fach: kein Platz für die Splitter – nichts verkauft, alles wie vorher");
r = V.ladenVerkauf(sb, "ganzvoll", "traenke", 23, 3, T.x, T.y, offen); check(!r.fehler && I.anzahlVon("ganzvoll", "splitter") === r.splitter, "den ganzen Stapel verkauft: sein Fach wird frei, dort liegen jetzt die Splitter");

console.log(f ? `\nVerkaufen: ${f} FEHLER` : "\nVerkaufen: alles in Ordnung");
process.exit(f ? 1 : 0);
