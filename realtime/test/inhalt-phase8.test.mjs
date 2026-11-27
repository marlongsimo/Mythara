/*
 * Riftmere – Inhalte Phase 8 (#58): die Fahlen Weiten und Grauwacht. Ohne Server-Prozess:
 * Gegner (Heidewolf, Rudelführer, Wiedergänger, Deserteure, Tjark, Grabwächter, der Graue Hauptmann) mit Werten und Beute, Wiedergänger friedlich beim Glockenschlag,
 * der Graue Hauptmann in seiner Gruft (Instanz, ruft Wiedergänger, Grabessturm mit Deckung), Klöppel und die Klinge des Grauen Hauptmanns (keine Wachtrüstung).
 * Aufruf (im Ordner realtime): node test/inhalt-phase8.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-inhalt8-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/sim"; export * from "./shared/config"; export * from "./shared/karte"; export * from "./shared/karten"; export * from "./shared/kampfwerte"; export { startAusruestung, GEGENSTAENDE } from "./shared/gegenstaende"; export { BOSSE, INSTANZEN } from "./shared/bosse"; export { GLOCKE, WIND } from "./shared/weltereignisse";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { Sim, MONSTER, KARTEN, FEIN, setzeKarte, kampfwerte, NULL_XP, xpFuer, startAusruestung, GEGENSTAENDE, BOSSE, INSTANZEN, GLOCKE, WIND } = await import(datei);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
const lauf = (s, sek) => { const ev = []; for (let i = 0; i < sek * 20; i++) { s.schritt(); ev.push(...s.zustand().ev); } return ev; };
const NEU = ["heidewolf", "rudelfuehrer", "wiedergaenger", "deserteur_schwert", "deserteur_armbrust", "tjark", "grabwaechter", "grauer_hauptmann"];

console.log("\nGegner und Gegenstände");
check(NEU.every((t) => MONSTER[t] && MONSTER[t].v2 && MONSTER[t].drops), "acht Gegner mit Werten (v3) und Beute");
check(NEU.flatMap((t) => MONSTER[t].drops.flatMap((R) => R.wurf.map((w) => w.g))).every((g) => g.startsWith("@") || GEGENSTAENDE[g]), "alle Beute-Gegenstände gibt es");
check(NEU.every((t) => MONSTER[t].drops.every((R) => R.wurf.reduce((a, w) => a + w.chance, 0) <= 100.0001)), "je Wurf höchstens 100 %");
check(MONSTER.wiedergaenger.friedlichBei === GLOCKE.friedlich && MONSTER.deserteur_schwert.fliehen && MONSTER.grabwaechter.spezial, "Wiedergänger hören die Glocke · Deserteure fliehen · Grabwächter mit Rundumschlag");
check(GEGENSTAENDE.kloeppel && GEGENSTAENDE.klinge_hauptmann && GEGENSTAENDE.klinge_hauptmann.seltenheit === "selten" && GEGENSTAENDE.klinge_hauptmann.waffe, "Klöppel (E2) und die Klinge des Grauen Hauptmanns (Selten-Langschwert, E4)");
check(!Object.values(GEGENSTAENDE).some((G) => (G.ebenen || []).some((e) => /\.wacht$/.test(e))), "keine Wachtrüstung (Teile *.wacht vorerst nicht)");
check(GLOCKE.regionen.includes("fl_201_169") && WIND.regionen.includes("fl_201_169"), "Glocke und Wind gelten in den Fahlen Weiten (Festland-Kacheln)");

console.log("\nDer Graue Hauptmann in seiner Gruft");
const T = INSTANZEN.find((d) => d.id === "hauptmann_gruft");
check(T && BOSSE.grauer_hauptmann && BOSSE.grauer_hauptmann.phasen.length === 3 && T.gegner.some((g) => g.art === "grauer_hauptmann"), "Instanz mit dem Hauptmann, drei Phasen");
setzeKarte(KARTEN.welt_nordwald, FEIN);
{ const s = Sim.welt(5, undefined, true); s.wesen = s.wesen.filter((w) => w.held); s["karte"].MEHRKAMPF = [[0, 0, 1e5, 1e5]];
  const id = s.beitreten("schildwaechter", 0, { x: 60.5, y: 60.5 }, kampfwerte({ ...NULL_XP, defense: xpFuer(60), lp: xpFuer(70) }, startAusruestung("schwert"), 1)), h = s.nach(id); h.max = h.lp = 1e6; s.eingabe({ t: "auto", an: false }, id);
  const b = s["neu"](false, "grauer_hauptmann", 1, { x: 61.5, y: 60.5 }, true, 7); b.lp = b.max = MONSTER.grauer_hauptmann.lp; b.zielId = h.id; b.wach = true; b.streifT = 1e9;
  lauf(s, 1); b.lp = Math.floor(b.max * 0.55); lauf(s, 0.3); check(s.wesen.filter((w) => w.helfer === b.id && w.typ === "wiedergaenger").length === 2, "unter 60 %: er ruft zwei Wiedergänger");
  h.schalterAn = [GLOCKE.friedlich]; lauf(s, 1); check(s.wesen.filter((w) => w.helfer === b.id).every((w) => w.zielId !== h.id), "läutet die Glocke, lassen die Wiedergänger ab");
  h.schalterAn = []; b.lp = Math.floor(b.max * 0.25); const ev = lauf(s, 6); check(ev.some((e) => e.a === "ansage" && e.name === "Grabessturm"), "unter 30 %: Grabessturm über die Gruft (Deckung hinter den Grabsteinen)"); }

console.log(f ? `\nInhalte Phase 8: ${f} FEHLER` : "\nInhalte Phase 8: alles in Ordnung");
process.exit(f ? 1 : 0);
