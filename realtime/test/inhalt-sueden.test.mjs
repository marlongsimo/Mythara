/*
 * Riftmere – Den Süden beleben (#126/#127): Gegner mit Werten und Beute (nur Fleisch neu), Fleisch und Gerichte (Heil-Staffel wie die Fische),
 * der alte Hecht als seltener Fang (S3), Eisenbänder auch für S4, Werkstätten (Sägemühle, Lehmfurt), Herd und Feuer, Heilstelle am Kreuzstein,
 * Trittsteine durch die Furt (Tür mit Schalter), Immes Laden, Reisende auf der Südstraße, Lager in der Kampfwelt.
 * Aufruf (im Ordner realtime, nach python3 werkzeug/weltzonen.py): node test/inhalt-sueden.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-sueden-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/sim"; export * from "./shared/config"; export * from "./shared/karte"; export * from "./shared/karten"; export * from "./shared/kampfwerte"; export { startAusruestung, GEGENSTAENDE, VERBRAUCH } from "./shared/gegenstaende"; export { WIRKUNGEN } from "./shared/wirkungen"; export { rezept, WERKSTAETTEN } from "./shared/handwerk"; export { HEILSTELLEN } from "./shared/heilstellen"; export { TUEREN } from "./shared/bosse"; export { tuerenZu } from "./shared/boss"; export { LAEDEN } from "./shared/laeden"; export { REISENDE, reiseStelle } from "./shared/reisende"; export { SELTENE_FAENGE, FANGGRUENDE, FANGSTELLEN } from "./shared/fischen"; export { seltenerFang } from "./server/src/fischen"; export { wuerfelSetzen } from "./server/src/sammeln"; export { BEDINGUNGEN } from "./server/src/inventar";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const M = await import(datei);
const { Sim, MONSTER, KARTEN, FEIN, setzeKarte, kampfwerte, NULL_XP, xpFuer, startAusruestung, GEGENSTAENDE, VERBRAUCH, WIRKUNGEN, rezept, WERKSTAETTEN, HEILSTELLEN, TUEREN, tuerenZu, LAEDEN, REISENDE, reiseStelle, SELTENE_FAENGE, FANGGRUENDE, FANGSTELLEN, seltenerFang, wuerfelSetzen, BEDINGUNGEN } = M;
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
const NEU = ["feldhase", "kraehenschwarm", "wildbienen_schwarm", "schilfkroete", "fuchs", "wildschwein", "wegelagerer_knueppel", "wegelagerer_schleuder", "steinschlucker", "graupelz"];

console.log("\nGegner und Beute");
check(NEU.every((t) => MONSTER[t] && MONSTER[t].v2 && MONSTER[t].drops), "zehn Gegner des Südens mit Werten (v3) und Beute");
check(NEU.every((t) => MONSTER[t].stufe >= 2 && MONSTER[t].stufe <= 30), "Stufen 2–30");
check([...NEU, "schaf", "ente"].flatMap((t) => MONSTER[t].drops.flatMap((R) => R.wurf.map((w) => w.g))).every((g) => g.startsWith("@") || GEGENSTAENDE[g]), "alle Beute-Gegenstände gibt es");
check(NEU.every((t) => MONSTER[t].drops.every((R) => R.wurf.reduce((a, w) => a + w.chance, 0) <= 100.0001)), "je Wurf höchstens 100 %");
check(MONSTER.graupelz.wiederkehr === 900 && !MONSTER.graupelz.boss && MONSTER.steinschlucker.familie === "stein" && MONSTER.wegelagerer_knueppel.fliehen && MONSTER.schaf.aggressiv === false, "Graupelz alle 15 min (kein Boss) · Steinschlucker Familie Stein · Wegelagerer fliehen · Schafe friedlich");
check(MONSTER.feldhase.drops.some((R) => R.wurf.some((w) => w.g === "hasenfleisch" && w.chance === 100)) && MONSTER.wildschwein.drops.some((R) => R.wurf.some((w) => w.g === "wildschweinfleisch")) && MONSTER.heidewolf.drops.some((R) => R.wurf.some((w) => w.g === "wolfsfleisch")), "Fleisch: Hase, Wildschwein, Wolf (auch der Heidewolf)");

console.log("\nFleisch und Gerichte");
const G = [["hasenbraten", "feuer", 5, 3], ["rinderbraten", "herd", 12, 5], ["wildschweinbraten", "feuer", 22, 7], ["wolfsgulasch", "kessel", 32, 9]];
check(G.every(([g, st, l, h]) => { const r = rezept(g); return r && r.station === st && r.level === l && VERBRAUCH[g] && VERBRAUCH[g].heilt.fest === h; }), "Hasenbraten 5/3 · Rinderbraten 12/5 · Wildschweinbraten 22/7 · Wolfsgulasch 32/9 (Kochen/Heilung)");
check(WIRKUNGEN.wildschweinbraten.werte.staerke === 1 && WIRKUNGEN.wolfsgulasch.werte.defense === 2 && VERBRAUCH.wildschweinbraten.wirkung === "wildschweinbraten", "Wirkungen: Stärke +1 und Defense +2 für 5 Minuten");
check(VERBRAUCH.fisch_moorhecht_gebraten.heilt.fest === 7 && VERBRAUCH.fisch_klippenbarsch_gebraten.heilt.fest === 9, "gleiche Heil-Staffel wie die Fische (Moorhecht 20 → 7, Klippenbarsch 35 → 9)");
check((rezept("eisenbaender").auchQuest || []).includes("erlengrund_klemmende_saege"), "Eisenbänder auch während S4 „Klemmende Säge“");

console.log("\nDer alte Hecht (S3)");
{ const R = SELTENE_FAENGE.find((x) => x.id === "alter_hecht"), st = FANGSTELLEN.find((s) => s.grund === R.grund);
  check(R && R.chance === 0.01 && GEGENSTAENDE.alter_hecht.untauschbar && FANGGRUENDE.some((g) => g.id === R.grund && g.art === "muehlbarsch"), "1 % je Fisch am Steg des Schilfsees, untauschbarer Questgegenstand");
  wuerfelSetzen(() => 0.001); check(!seltenerFang("ebba_test", st.id), "ohne laufende Quest (Bedingung) kein alter Hecht");
  BEDINGUNGEN.set(R.nur, (n) => n === "ebba_test"); check(seltenerFang("ebba_test", st.id)?.g === "alter_hecht", "mit der Bedingung aus S3 und Glück: der alte Hecht");
  wuerfelSetzen(() => 0.5); check(!seltenerFang("ebba_test", st.id), "ohne Glück (Würfel über 1 %) nicht");
  let n = 0; let z = 1; wuerfelSetzen(() => ((z = (z * 16807) % 2147483647) / 2147483647)); for (let i = 0; i < 20000; i++) if (seltenerFang("ebba_test", st.id)) n++;
  check(n > 120 && n < 290, `rund 1 % von 20 000 Fischen (${n})`); wuerfelSetzen(Math.random); }

console.log("\nWerkstätten, Heilstelle, Furt, Laden");
check(WERKSTAETTEN.some((w) => w.id === "werkbank_saegemuehle" && w.schalter === "saegemuehle_frei") && WERKSTAETTEN.some((w) => w.station === "esse" && w.id === "esse_lehmfurt") && WERKSTAETTEN.some((w) => w.station === "amboss" && w.id === "amboss_lehmfurt"), "Werkbank der Sägemühle (nach S4), Esse und Amboss in Lehmfurt");
check(WERKSTAETTEN.some((w) => w.id === "herd_heckenhof" && w.station === "herd") && WERKSTAETTEN.some((w) => w.id === "feuer_halber_weg" && w.station === "feuer"), "Herd am Heckenhof, Lagerfeuer am Halben Weg");
check(HEILSTELLEN.some((h) => h.id === "kreuzstein" && h.schalter === "kreuzstein_heil"), "Heilstelle am Kreuzstein nach S7");
{ const T = TUEREN.find((t) => t.id === "lehmfurt_furt"); check(T && tuerenZu([T], () => false).length === 1 && !tuerenZu([T], (s) => s === "lehmfurt_trittsteine").length, "die Furt: gesperrt, bis die Trittsteine liegen (lehmfurt_trittsteine aus S5)"); }
check(LAEDEN.imme && LAEDEN.imme.wenn.quest === "summweide_der_verschwundene_stock" && LAEDEN.imme.waren.every((w) => GEGENSTAENDE[w.g]), "Immes Laden öffnet nach S2");

console.log("\nReisende auf der Südstraße");
{ const R = REISENDE.find((r) => r.id === "haendler_sued"), a = reiseStelle(R, 0), b = reiseStelle(R, 120), c = REISENDE.map((r) => reiseStelle(r, 5000));
  check(REISENDE.length === 3 && REISENDE.every((r) => r.datei.startsWith("npc.")), "ein Händler und zwei Wanderer");
  check(c.every((p) => p.y >= 6760 && p.y <= 7290 && Math.abs(p.x - 6460) < 20), "immer auf der Straße zwischen Weidenhain und Kielmund");
  check(Math.hypot(a.x - b.x, a.y - b.y) > 0 || a.steht, "sie bewegen sich mit der Uhr (oder halten)");
  let halt = 0; for (let t = 0; t < 4000; t += 5) { const p = reiseStelle(R, t); if (p.steht && Math.abs(p.y - 7003) < 1) halt++; } check(halt * 5 >= 200, `der Händler steht lange am Halben Weg (${halt * 5} s je Runde)`); }

console.log("\nLager in der Kampfwelt");
setzeKarte(KARTEN.welt, FEIN);
{ const s = Sim.welt(26, undefined, true), n = (t) => s.wesen.filter((w) => w.typ === t).length;
  check(n("feldhase") >= 2 && n("kraehenschwarm") >= 2 && n("wildschwein") >= 2 && n("steinschlucker") >= 3 && n("graupelz") === 1 && n("wegelagerer_schleuder") >= 3 && n("schaf") >= 3,
    `Hasen ${n("feldhase")}, Krähen ${n("kraehenschwarm")}, Wildschweine ${n("wildschwein")}, Steinschlucker ${n("steinschlucker")}, Graupelz ${n("graupelz")}, Schleuderer ${n("wegelagerer_schleuder")}, Schafe ${n("schaf")}`);
  const w = s.wesen.find((x) => x.typ === "wildschwein"), id = s.beitreten("schildwaechter", 0, { x: w.x + 1, y: w.y }, kampfwerte({ ...NULL_XP, geschick: xpFuer(60), staerke: xpFuer(60), defense: xpFuer(60), lp: xpFuer(60) }, startAusruestung("schwert"), 1)), h = s.nach(id); h.max = h.lp = 1e5;
  const ev = []; for (let i = 0; i < 20 * 180 && !w.tot; i++) { s.schritt(); ev.push(...s.zustand().ev); }
  check(w.tot && ev.some((e) => e.a === "hieb" && e.id === w.id), `ein Wildschwein greift an und fällt (Leben ${w.lp}/${w.max}, Held ${Math.round(Math.hypot(h.x - w.x, h.y - w.y))} Felder weg, Hiebe ${ev.filter((e) => e.a === "hieb" && e.id === w.id).length}, des Helden ${ev.filter((e) => e.a === "hieb" && e.id === h.id).length})`); }

console.log(f ? `\nSüden: ${f} FEHLER` : "\nSüden: alles in Ordnung");
process.exit(f ? 1 : 0);
