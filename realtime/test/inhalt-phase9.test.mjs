/*
 * Riftmere – Inhalte Phase 9 (#86): die Glutsande, Glutbrunn und der versandete Tempel. Ohne Server-Prozess:
 * Gegner (Sandkriecher, Glutskorpion, Karawanenräuber, Glutgeist, die Sandmutter) mit Werten und Beute, die Sandmutter in ihrer Kammer
 * (Instanz, gräbt sich ein, ruft Sandkriecher, Treibsand), Kartenstücke und Reisekarte (gebunden), Salz, Glutwels (Fischen 65) und die Salzkruste (Kochen 65).
 * Aufruf (im Ordner realtime): node test/inhalt-phase9.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-inhalt9-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/sim"; export * from "./shared/config"; export * from "./shared/karte"; export * from "./shared/karten"; export * from "./shared/kampfwerte"; export { startAusruestung, GEGENSTAENDE, VERBRAUCH } from "./shared/gegenstaende"; export { BOSSE, INSTANZEN } from "./shared/bosse"; export { FISCHE, FANGGRUENDE } from "./shared/fischen"; export { rezept, WERKSTAETTEN } from "./shared/handwerk";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { Sim, MONSTER, KARTEN, FEIN, setzeKarte, kampfwerte, NULL_XP, xpFuer, startAusruestung, GEGENSTAENDE, VERBRAUCH, BOSSE, INSTANZEN, FISCHE, FANGGRUENDE, rezept, WERKSTAETTEN } = await import(datei);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
const lauf = (s, sek) => { const ev = []; for (let i = 0; i < sek * 20; i++) { s.schritt(); ev.push(...s.zustand().ev); } return ev; };
const NEU = ["sandkriecher", "glutskorpion", "karawanenraeuber_saebel", "karawanenraeuber_bogen", "glutgeist", "sandmutter"];

console.log("\nGegner, Gegenstände, Rezepte");
check(NEU.every((t) => MONSTER[t] && MONSTER[t].v2 && MONSTER[t].drops), "sechs Gegner mit Werten (v3) und Beute");
check(NEU.flatMap((t) => MONSTER[t].drops.flatMap((R) => R.wurf.map((w) => w.g))).every((g) => g.startsWith("@") || GEGENSTAENDE[g]), "alle Beute-Gegenstände gibt es");
check(NEU.every((t) => MONSTER[t].drops.every((R) => R.wurf.reduce((a, w) => a + w.chance, 0) <= 100.0001)), "je Wurf höchstens 100 %");
check(MONSTER.sandkriecher.eingegraben && MONSTER.glutskorpion.gift && MONSTER.glutgeist.flackern && MONSTER.karawanenraeuber_saebel.fliehen, "Sandkriecher eingegraben · Glutskorpion giftig · Glutgeist flackert · Räuber fliehen");
check([1, 2, 3, 4, 5].every((i) => GEGENSTAENDE["kartenstueck_" + i]?.untauschbar) && GEGENSTAENDE.reisekarte?.untauschbar && GEGENSTAENDE.salz, "fünf Kartenstücke und die Reisekarte (gebunden), Salz");
const B = rezept("fisch_glutwels_gebraten"), K = rezept("glutwels_salzkruste");
check(FISCHE.glutwels?.level === 65 && FANGGRUENDE.some((g) => g.art === "glutwels") && B?.level === 65 && K?.station === "herd" && K.zutaten.some((z) => z.g.includes("salz")), "Glutwels (Fischen 65), braten und in der Salzkruste (Herd, Kochen 65, mit Salz)");
check(VERBRAUCH.glutwels_salzkruste?.heilt.fest === 18 && VERBRAUCH.fisch_glutwels_gebraten?.heilt.fest === 15, "Glutwels heilt 15, in der Salzkruste 18");

console.log("\nDie Sandmutter in ihrer Kammer");
const T = INSTANZEN.find((d) => d.id === "tempel_kammer");
check(T && T.schalter === "sandmutter_kammer" && T.gegner.some((g) => g.art === "sandmutter") && BOSSE.sandmutter?.phasen.length === 3, "Instanz mit der Sandmutter, drei Phasen");
setzeKarte(KARTEN.welt_nordwald, FEIN);
{ const s = Sim.welt(9, undefined, true); s.wesen = s.wesen.filter((w) => w.held); s["karte"].MEHRKAMPF = [[0, 0, 1e5, 1e5]];
  const id = s.beitreten("schildwaechter", 0, { x: 60.5, y: 60.5 }, kampfwerte({ ...NULL_XP, defense: xpFuer(60), lp: xpFuer(70) }, startAusruestung("schwert"), 1)), h = s.nach(id); h.max = h.lp = 1e6; s.eingabe({ t: "auto", an: false }, id);
  const b = s["neu"](false, "sandmutter", 1, { x: 61.5, y: 60.5 }, true, 7); b.lp = b.max = MONSTER.sandmutter.lp; b.zielId = h.id; b.wach = true; b.streifT = 1e9;
  lauf(s, 1); b.lp = Math.floor(b.max * 0.55); const ev = lauf(s, 0.5);
  check(ev.some((e) => e.a === "eingraben" && e.id === b.id), "unter 60 %: sie gräbt sich ein");
  check(s.wesen.filter((w) => w.helfer === b.id && w.typ === "sandkriecher").length === 2, "… und ruft zwei Sandkriecher");
  const ev2 = lauf(s, 8); check(ev2.some((e) => e.a === "ansage" && e.name === "Treibsand"), "Treibsand auf angesagten Feldern"); }

console.log("\nF-Quests (#118): Briefe, Pfannenblech, Glutbrunn");
check(["kords_brief", "pfannenblech", "tempelabschrift"].every((g) => GEGENSTAENDE[g] && GEGENSTAENDE[g].untauschbar && (GEGENSTAENDE[g].bild || GEGENSTAENDE[g].symbol)), "Kords Brief, Pfannenblech, Tempelabschrift");
{ const P = rezept("pfannenblech"); check(P && P.station === "amboss" && P.level === 50 && P.quest === "glutsande_salz_und_feuer", "Pfannenblech: Amboss, Schmieden 50, nur in F2"); }
check(["esse_glutbrunn", "amboss_glutbrunn", "herd_glutbrunn", "werkbank_glutbrunn"].every((id) => WERKSTAETTEN.some((w) => w.id === id && !w.schalter)) && Math.hypot(WERKSTAETTEN.find((w) => w.id === "herd_glutbrunn").x - 7119, WERKSTAETTEN.find((w) => w.id === "herd_glutbrunn").y - 6954.4) < 9,
  "Glutbrunn: Esse, Amboss, Herd (F4: Glutwels in Salzkruste) und Werkbank");

console.log("\nSalzpfanne (#155)");
{ setzeKarte(KARTEN.welt, FEIN); const U = KARTEN.welt.ursprung, s = Sim.welt(3, undefined, true), [sx, sy] = [7330, 6646];
  const n = s.wesen.filter((w) => w.typ === "glutskorpion" && Math.hypot(w.x + U[0] - sx, w.y + U[1] - sy) <= 8).length;
  check(n >= 5, `an der Salzpfanne (F2: ${sx}|${sy}) stehen ${n} Glutskorpione in der Kampfwelt`); }

console.log(f ? `\nInhalte Phase 9: ${f} FEHLER` : "\nInhalte Phase 9: alles in Ordnung");
process.exit(f ? 1 : 0);
