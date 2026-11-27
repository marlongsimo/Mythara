/*
 * Riftmere – Zunft-Rohstoffe (#176, doku/konzepte/zunft-rohstoffe.md): Kräuter 70/80/90 (Kräutergarten), fünf Tränke (Kräuterkunde 70–90),
 * Fische 70/80/90 (Fischerzunft) und ihre Gerichte mit Heilung fest + % des Höchstlebens; dazu die Boss-Ergänzung zu #175
 * (Grundangriff höchstens ~8–15 % des Höchstlebens, nicht ausgewichener Großangriff 30–60 %). Aufruf (im Ordner realtime): node test/zunft-rohstoffe.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-zunftroh-${process.pid}.mjs`);
await build({ stdin: { contents: 'export { KRAEUTER } from "./shared/kraeuter"; export { FISCHE } from "./shared/fischen"; export { REZEPTE, rezept, rezeptBeruf } from "./shared/handwerk"; export { GEGENSTAENDE, VERBRAUCH, trankHeilung } from "./shared/gegenstaende"; export { WIRKUNGEN, wirkungDazu, magieSchadenPlus, skillPlus } from "./shared/wirkungen"; export { kampfwerte, NULL_XP, xpFuer, gegnerWerte } from "./shared/kampfwerte"; export { MONSTER } from "./shared/config"; export { BOSSE, HUETER } from "./shared/bosse";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { KRAEUTER, FISCHE, rezept, rezeptBeruf, GEGENSTAENDE: G, VERBRAUCH: V, trankHeilung, WIRKUNGEN, wirkungDazu, magieSchadenPlus, skillPlus, kampfwerte, NULL_XP, xpFuer, gegnerWerte, MONSTER, BOSSE, HUETER } = await import(datei);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };

console.log("\nKräuter (nur im Kräutergarten der Heilkundigen)");
check([["mondsalbei", 70], ["glutwurz", 80], ["splitterlilie", 90]].every(([k, L]) => KRAEUTER[k] && KRAEUTER[k].level === L && G[k] && KRAEUTER[k].ertrag === k), "Mondsalbei 70, Glutwurz 80, Splitterlilie 90 – mit Gegenstand");

console.log("\nTränke (Kessel, Kräuterkunde)");
const T = [["mondsalbei_elixier", 70], ["staerketrank_stark", 75], ["glutwurz_feuertrank", 80], ["splittersicht", 85], ["splitterlilien_trank", 90]];
check(T.every(([id, L]) => { const r = rezept("brauen_" + id); return r && r.level === L && r.station === "kessel" && rezeptBeruf(r) === "kraeuterkunde" && G[id] && V[id] && V[id].flaeschchen && r.zutaten.every((z) => z.g.every((g) => G[g])); }),
  "fünf Rezepte am Kessel, Stufe 70/75/80/85/90, Zutaten gibt es, das Fläschchen kommt zurück");
check(trankHeilung(V.mondsalbei_elixier, 99) === 25 && trankHeilung(V.splitterlilien_trank, 99) === 30 && V.splitterlilien_trank.nebenAuf, "Mondsalbei-Elixier heilt 25 · Splitterlilien-Trank heilt 30 und hebt alle Nebenwirkungen auf");
{ const w = (id) => WIRKUNGEN[id]; check(w("staerketrank_stark").werte.staerke === 7 && w("glutwurz_feuertrank").werte.fernkampf === 7 && w("splittersicht").werte.magieSchaden === 5 && T.slice(1, 4).every(([id]) => w(id).ms === 5 * 60_000 && w(id).art === "trank"),
  "Stärke +7, Fernkampf +7, Magieschaden +5 % – je 5 Minuten, im Trank-Platz"); }
{ const X = { ...NULL_XP }; for (const k of Object.keys(NULL_XP)) X[k] = xpFuer(90); const aus = { waffe: "sternenszepter_mythisch" }, W = wirkungDazu([], "splittersicht");
  const ohne = kampfwerte(X, aus, 1).waffe.schaden[1], mit = kampfwerte(X, aus, 1, skillPlus(W), { magieSchaden: magieSchadenPlus(W) }).waffe.schaden[1];
  check(mit === Math.round(ohne * 1.05) && mit > ohne, `Splittersicht hebt den Max Hit der Magie um 5 % (${ohne} → ${mit})`); }

console.log("\nFische und Gerichte (nur am Steg der Fischerzunft) – Heilung fest + % des Höchstlebens");
const F = [["silberbarsch", 70, "fisch_silberbarsch_gebraten", 18, 0.03, 21], ["sturmhecht", 80, "sturmhecht_kraeuterkruste", 20, 0.04, 24], ["tiefseeaal", 90, "tiefseeaal_suppe", 22, 0.05, 27]];
check(F.every(([fi, L]) => FISCHE[fi] && FISCHE[fi].level === L && G[FISCHE[fi].ertrag]), "Silberbarsch 70, Sturmhecht 80, Tiefseeaal 90");
check(F.every(([fi, , g, fest, anteil, bei99]) => { const r = rezept(g); return r && r.zutaten[0].g.includes(`fisch_${fi}_roh`) && V[g] && V[g].heilt.fest === fest && V[g].heilt.anteil === anteil && trankHeilung(V[g], 99) === bei99; }),
  "Gebratener Silberbarsch 18 + 3 % · Sturmhecht in Kräuterkruste 20 + 4 % · Tiefseeaal-Suppe 22 + 5 % (bei 99 Leben 21 / 24 / 27)");
check(rezept("sturmhecht_kraeuterkruste").station === "herd" && rezept("tiefseeaal_suppe").station === "kessel", "Kräuterkruste am Herd, Suppe im Kessel");

console.log("\nBoss-Regeln, Ergänzung (#175): Schaden im Verhältnis zum Höchstleben (99)");
for (const H of HUETER) { const M = MONSTER[H.typ], m = gegnerWerte(M.v2, M.angriff.art).maxHit, A = BOSSE[H.typ].phasen.flatMap((p) => p.ansagen || []);
  check(m >= 8 && m <= 15 && A.every((a) => a.schaden[0] >= 30 && a.schaden[1] <= 60), `${M.name}: Grundangriff höchstens ${m} (${m} %), Großangriffe ${[...new Set(A.map((a) => `${a.name} ${a.schaden.join("–")}`))].join(", ")}`); }

console.log(f ? `\nZunft-Rohstoffe: ${f} FEHLER` : "\nZunft-Rohstoffe: alles in Ordnung");
process.exit(f ? 1 : 0);
