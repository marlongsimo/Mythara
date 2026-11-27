/*
 * Riftmere – Bosse nach #116: in der Quest allein und schwächer; danach stärker, öffentlich oder eigene Instanz (vorerst allein); Beute je Spieler.
 * Ohne Server-Prozess: Simulation der Kampfwelt mit dem Thronsaal (Federsiegel) und der Kajüte des Wrackkapitäns.
 * Aufruf (im Ordner realtime): node test/bosse-116.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-bosse116-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/sim"; export * from "./shared/config"; export * from "./shared/karte"; export * from "./shared/karten"; export * from "./shared/kampfwerte"; export { startAusruestung } from "./shared/gegenstaende"; export { INSTANZEN, TUEREN } from "./shared/bosse"; export { QUEST_STAERKE, tuerenZu } from "./shared/boss"; export { weltJeSpieler, bossWahlSetzen, bossWahl, wahlenVergessen, instanzAus } from "./server/src/bosse";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { Sim, MONSTER, KARTEN, kampfwerte, NULL_XP, xpFuer, startAusruestung, INSTANZEN, TUEREN, QUEST_STAERKE, tuerenZu, weltJeSpieler, bossWahlSetzen, bossWahl, wahlenVergessen, instanzAus } = await import(datei);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
const X = { ...NULL_XP, geschick: xpFuer(60), staerke: xpFuer(60), defense: xpFuer(60), lp: xpFuer(70) - xpFuer(10) };
const neueWelt = () => { const s = Sim.welt(16, undefined, true), U = KARTEN.welt.ursprung; s.ursprung = [U[0], U[1]]; s.wesen = s.wesen.filter((w) => w.held); return { s, U }; };
const held = (s, U, wx, wy) => { const id = s.beitreten("schildwaechter", 0, { x: wx - U[0], y: wy - U[1] }, kampfwerte(X, startAusruestung("schwert"), 1)), h = s.nach(id); h.max = h.lp = 1e6; s.eingabe({ t: "auto", an: false }, id); return { id, h }; };
const K = INSTANZEN.find((d) => d.id === "wrack_kajuete"), T = INSTANZEN.find((d) => d.id === "thronsaal");
check(["thronsaal", "hauptmann_gruft", "tempel_kammer", "wrack_kajuete"].every((id) => INSTANZEN.find((d) => d.id === id)?.danach), "die vier Boss-Instanzen aus Phase 6–10 kennen den Schalter „danach“");

console.log("\n0 · Vor der Quest: kein Boss (leerer Raum)");
{ const { s, U } = neueWelt(), { id } = held(s, U, 11504.5, 9620.5);
  const b0 = s["neu"](false, "wrackkapitaen", 1, { x: 11504.5 - U[0], y: 9614.5 - U[1] }, true, 7); /* der öffentliche Boss in der gemeinsamen Welt */
  const t = weltJeSpieler(s, id, "otto", 11504.5, 9620.5, () => false), key = s.nach(id).instanz;
  check(key === "wrack_kajuete:otto:leer" && !s.wesen.some((w) => !w.held && w.instanz === key) && !t, "ohne Quest: eine leere Kopie des Raums, kein Boss, kein Text");
  check(!s.wesen.some((w) => w.id === b0.id && (w.instanz || "") === key), "den öffentlichen Boss sieht er nicht (andere Kopie)"); }

console.log("\n1 · In der Quest: allein und schwächer");
{ const { s, U } = neueWelt(), { id, h } = held(s, U, 11504.5, 9620.5);
  const t = weltJeSpieler(s, id, "anna", 11504.5, 9620.5, (x) => x === K.schalter), b = s.wesen.find((w) => w.typ === "wrackkapitaen");
  check(b && b.instanz === "wrack_kajuete:anna" && b.max === Math.round(MONSTER.wrackkapitaen.lp * QUEST_STAERKE.leben) && b.schadenMal === QUEST_STAERKE.schaden && Boolean(t),
    `eigene Kopie, Boss mit ${Math.round(QUEST_STAERKE.leben * 100)} % Leben (${b && b.max}/${MONSTER.wrackkapitaen.lp}) und ${Math.round(QUEST_STAERKE.schaden * 100)} % Schaden`);
  const vor = h.lp; s["abziehen"](h, 100, b); check(vor - h.lp === Math.round(100 * QUEST_STAERKE.schaden), "der Schaden des Bosses ist gemindert (100 → 85)");
  check(!bossWahlSetzen("anna", "wrack_kajuete", "instanz", (x) => x === K.schalter), "vor dem Ende der Quest gibt es keine Wahl"); }

console.log("\n2 · Nach der Quest, öffentlich: stärker, zwei Spieler, jeder bekommt Beute");
wahlenVergessen();
{ const { s, U } = neueWelt(), A = held(s, U, 11503.5, 9616.5), B = held(s, U, 11505.5, 9616.5), an = (x) => x === K.schalter || x === K.danach;
  for (const [P, n] of [[A, "anna"], [B, "bert"]]) weltJeSpieler(s, P.id, n, 11504.5, 9616.5, an);
  check(bossWahl("anna", "wrack_kajuete") === "oeffentlich" && !A.h.instanz && !B.h.instanz, "Standard nach der Quest: öffentlich – beide stehen in der gemeinsamen Welt");
  const b = s["neu"](false, "wrackkapitaen", 1, { x: 11504.5 - U[0], y: 9614.5 - U[1] }, true, 7); b.lp = b.max = MONSTER.wrackkapitaen.lp;
  check(b.max === MONSTER.wrackkapitaen.lp && b.schadenMal === undefined, `der öffentliche Boss hat die normalen Werte (${b.max} Leben)`);
  s["anteile"].set(b.id, new Map([[A.id, 120], [B.id, 60]])); s["abziehen"](b, 1e9, A.h); const ev = s.zustand().ev, beute = ev.filter((e) => e.a === "beute");
  check(beute.length === 2 && new Set(beute.map((e) => e.besitzer)).size === 2 && ev.filter((e) => e.a === "erlegt").length === 2, "zwei Spieler mit genug Schaden: zwei eigene Würfe (und beide zählen den Sieg)");
  const c = s["neu"](false, "wrackkapitaen", 1, { x: 11504.5 - U[0], y: 9614.5 - U[1] }, true, 7); c.lp = c.max = MONSTER.wrackkapitaen.lp;
  s["anteile"].set(c.id, new Map([[A.id, 195], [B.id, 5]])); s["abziehen"](c, 1e9, A.h); const ev2 = s.zustand().ev.filter((e) => e.a === "beute");
  check(ev2.length === 1 && ev2[0].besitzer === A.id, "wer kaum Schaden gemacht hat (unter 10 %), bekommt keinen Wurf");
  check(MONSTER.wrackkapitaen.wiederkehr > 0 && MONSTER.wrackkapitaen.wiederkehr < 3600, `öffentlich kehrt er nach ${MONSTER.wrackkapitaen.wiederkehr} s wieder`); }

console.log("\n3 · Nach der Quest, eigene Instanz: allein, stärker, mit Eintritt");
wahlenVergessen();
{ const { s, U } = neueWelt(), { id } = held(s, U, 10768.5, 9626.5), an = (x) => x === T.schalter || x === T.danach;
  let siegel = 1; const beutel = { hat: () => siegel > 0, abgeben: () => (siegel > 0 ? (siegel--, true) : false) };
  weltJeSpieler(s, id, "anna", 10768.5, 9626.5, an, beutel); check(siegel === 1 && !s.nach(id).instanz, "öffentlich: kein Federsiegel nötig, keine Kopie");
  const tuer = TUEREN.find((t) => t.instanz === "thronsaal");
  if (tuer) check(!tuerenZu([tuer], an, { hat: () => false, x: 0, y: 0, wahl: () => "oeffentlich" }, INSTANZEN).length && tuerenZu([tuer], an, { hat: () => false, x: 0, y: 0, wahl: () => "instanz" }, INSTANZEN).length === 1, "die Tür zum Thronsaal: öffentlich offen, für die eigene Instanz nur mit Federsiegel");
  const t = bossWahlSetzen("anna", "thronsaal", "instanz", an); check(/eigene Instanz/.test(t || "") && bossWahl("anna", "thronsaal") === "instanz", "Wahl am Eingang: eigene Instanz");
  weltJeSpieler(s, id, "anna", 10768.5, 9627.5, an, beutel); const key = s.nach(id).instanz, b = s.wesen.find((w) => w.typ === "oberster_rabenpriester" && w.instanz === key);
  check(siegel === 0 && key === "thronsaal:anna:stark" && instanzAus(key).fassung === "stark" && b && b.max === MONSTER.oberster_rabenpriester.lp && b.schadenMal === undefined, `eigene Kopie in der starken Fassung (${b && b.max} Leben), Federsiegel verbraucht`);
  check(s.wesen.filter((w) => w.held && w.instanz === key).length === 1, "allein in der Kopie"); }

console.log(f ? `\nBosse (#116): ${f} FEHLER` : "\nBosse (#116): alles in Ordnung");
process.exit(f ? 1 : 0);
