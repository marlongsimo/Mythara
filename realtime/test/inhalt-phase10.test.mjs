/*
 * Riftmere – Inhalte Phase 10 (#92): Smaragdküste, Kielmund und die Klippenhöhlen. Ohne Server-Prozess:
 * Gegner (Strand- und Riesenkrabbe, Seevogel, Strandräuber, Mangrovenlurch, der Wrackkapitän) mit Werten und Beute, der Wrackkapitän in seiner Kajüte
 * (Instanz, ruft Strandräuber, Geisterflut mit Deckung), Hering/Klippenbarsch/Seeaal, Räucherhering (Räucherhütte mit Wartezeit, Wirkung Ausdauer),
 * Barsch in Salzkruste, Aalsuppe, Wrackkiste; keine Kutsche.
 * Aufruf (im Ordner realtime): node test/inhalt-phase10.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-inhalt10-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/sim"; export * from "./shared/config"; export * from "./shared/karte"; export * from "./shared/karten"; export * from "./shared/kampfwerte"; export { startAusruestung, GEGENSTAENDE, VERBRAUCH } from "./shared/gegenstaende"; export { BOSSE, INSTANZEN } from "./shared/bosse"; export { FISCHE, FANGGRUENDE } from "./shared/fischen"; export { rezept, WERKSTAETTEN } from "./shared/handwerk"; export { WIRKUNGEN } from "./shared/wirkungen";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { Sim, MONSTER, KARTEN, FEIN, setzeKarte, kampfwerte, NULL_XP, xpFuer, startAusruestung, GEGENSTAENDE, VERBRAUCH, BOSSE, INSTANZEN, FISCHE, FANGGRUENDE, rezept, WERKSTAETTEN, WIRKUNGEN } = await import(datei);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
const lauf = (s, sek) => { const ev = []; for (let i = 0; i < sek * 20; i++) { s.schritt(); ev.push(...s.zustand().ev); } return ev; };
const NEU = ["strandkrabbe", "riesenkrabbe", "seevogel", "strandraeuber_saebel", "strandraeuber_armbrust", "mangrovenlurch", "wrackkapitaen"];

console.log("\nGegner, Gegenstände, Rezepte");
check(NEU.every((t) => MONSTER[t] && MONSTER[t].v2 && MONSTER[t].drops), "sieben Gegner mit Werten (v3) und Beute");
check(NEU.every((t) => MONSTER[t].stufe >= 20 && MONSTER[t].stufe <= 40), "Stufen 20–40 (Lücke zwischen Grenzland und den schweren Regionen)");
check(NEU.flatMap((t) => MONSTER[t].drops.flatMap((R) => R.wurf.map((w) => w.g))).every((g) => g.startsWith("@") || GEGENSTAENDE[g]), "alle Beute-Gegenstände gibt es");
check(NEU.every((t) => MONSTER[t].drops.every((R) => R.wurf.reduce((a, w) => a + w.chance, 0) <= 100.0001)), "je Wurf höchstens 100 %");
check([["hering", 20], ["klippenbarsch", 35], ["seeaal", 45]].every(([a, l]) => FISCHE[a]?.level === l && FANGGRUENDE.some((g) => g.art === a) && rezept(`fisch_${a}_gebraten`) && VERBRAUCH[`fisch_${a}_gebraten`] && GEGENSTAENDE[`fisch_${a}_roh`]), "Hering 20, Klippenbarsch 35, Seeaal 45: Fanggründe, braten, essen");
const R = rezept("raeucherhering"), S = rezept("barsch_salzkruste"), A = rezept("aalsuppe");
check(R?.station === "raeucherhuette" && R.warten > 0 && VERBRAUCH.raeucherhering?.wirkung === "raeucherhering" && WIRKUNGEN.raeucherhering?.werte.ausdauer > 0, "Räucherhering: Räucherhütte mit Wartezeit, Wirkung Ausdauer");
check(WERKSTAETTEN.some((w) => w.station === "raeucherhuette" && w.schalter === "raeucherhuette_frei"), "Räucherhütte in der Möwenbucht (nach G4: raeucherhuette_frei)");
check(S?.zutaten.some((z) => z.g.includes("salz")) && A?.station === "kessel" && GEGENSTAENDE.wrackkiste?.untauschbar, "Barsch in Salzkruste (Salz aus Phase 9), Aalsuppe im Kessel, Wrackkiste mit Rabensiegel");
check(!GEGENSTAENDE.kutsche && !Object.keys(GEGENSTAENDE).some((k) => /kutsche/.test(k)), "keine Kutsche (gestrichen)");

console.log("\nDer Wrackkapitän in seiner Kajüte");
const T = INSTANZEN.find((d) => d.id === "wrack_kajuete");
check(T && T.gegner.some((g) => g.art === "wrackkapitaen") && BOSSE.wrackkapitaen?.phasen.length === 3, "Instanz mit dem Wrackkapitän, drei Phasen");
setzeKarte(KARTEN.welt_nordwald, FEIN);
{ const s = Sim.welt(10, undefined, true); s.wesen = s.wesen.filter((w) => w.held); s["karte"].MEHRKAMPF = [[0, 0, 1e5, 1e5]];
  const id = s.beitreten("schildwaechter", 0, { x: 60.5, y: 60.5 }, kampfwerte({ ...NULL_XP, defense: xpFuer(50), lp: xpFuer(60) }, startAusruestung("schwert"), 1)), h = s.nach(id); h.max = h.lp = 1e6; s.eingabe({ t: "auto", an: false }, id);
  const b = s["neu"](false, "wrackkapitaen", 1, { x: 61.5, y: 60.5 }, true, 7); b.lp = b.max = MONSTER.wrackkapitaen.lp; b.zielId = h.id; b.wach = true; b.streifT = 1e9;
  lauf(s, 1); b.lp = Math.floor(b.max * 0.55); lauf(s, 0.3); check(s.wesen.filter((w) => w.helfer === b.id && w.typ === "strandraeuber_saebel").length === 2, "unter 60 %: er ruft zwei Strandräuber");
  b.lp = Math.floor(b.max * 0.25); const ev = lauf(s, 6); check(ev.some((e) => e.a === "ansage" && e.name === "Geisterflut"), "unter 30 %: Geisterflut durch die Kajüte (Deckung)"); }

console.log(f ? `\nInhalte Phase 10: ${f} FEHLER` : "\nInhalte Phase 10: alles in Ordnung");
process.exit(f ? 1 : 0);
