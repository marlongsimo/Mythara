/*
 * Riftmere – Kräuterkunde (Phase 5c, #133): Sammeln nur mit Sichel und Stufe, Tau, Brauen nur am Kessel nach dem Kräuterkunde-Level, schwach/stark nach Level,
 * Nebenwirkungen nur bei den starken ab 45, Fehlschlag „Trüber Sud“ sinkt mit dem Level, Trank ersetzt Trank und das Essen bleibt, Nebelschleier im Kampf,
 * Lindentau hebt Nebenwirkungen auf, das leere Fläschchen kommt zurück. Ohne Server-Prozess (server/src mit nachgebildeter Supabase).
 * Aufruf (im Ordner realtime): node test/kraeuterkunde.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
process.env.HANDWERK_BRENN = "0"; process.env.HANDWERK_GLUT = "0"; /* Brauen ohne Zufall (den Fehlschlag prüft brennChance) */
const datei = join(tmpdir(), `riftmere-kraeuter-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/sim"; export * from "./shared/config"; export * from "./shared/karte"; export * from "./shared/karten"; export * from "./shared/kampfwerte"; export { startAusruestung, GEGENSTAENDE, VERBRAUCH } from "./shared/gegenstaende"; export { WIRKUNGEN, wirkungDazu, bemerkenFaktor, skillPlus } from "./shared/wirkungen"; export { KRAEUTER, KRAUTSTELLEN, KESSEL, SUD_FEHLSCHLAG, krautSchalter } from "./shared/kraeuter"; export { rezept, REZEPTE, brennChance, WERKSTAETTEN, rezeptBeruf } from "./shared/handwerk"; export { BERUFE } from "./shared/berufe"; export { LAEDEN } from "./shared/laeden"; export * as I from "./server/src/inventar"; export * as HW from "./server/src/handwerk"; export * as KR from "./server/src/kraeuter"; export { wuerfelSetzen } from "./server/src/sammeln";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const M = await import(datei);
const { Sim, MONSTER, KARTEN, FEIN, setzeKarte, kampfwerte, NULL_XP, xpFuer, startAusruestung, GEGENSTAENDE, VERBRAUCH, WIRKUNGEN, wirkungDazu, bemerkenFaktor, skillPlus, KRAEUTER, KRAUTSTELLEN, KESSEL, SUD_FEHLSCHLAG, rezept, REZEPTE, brennChance, WERKSTAETTEN, rezeptBeruf, BERUFE, LAEDEN, I, HW, KR, wuerfelSetzen } = M;
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
let ROW = []; const sb = async (p) => (p.includes("rpg_held?") ? ROW : null), NACHR = [];
const laden = async (n, inv) => { ROW = [{ waffe: "schwert", inventar: { angelegt: {}, v: 2, ...inv } }]; await I.inventarLaden(sb, n); };

console.log("\nKräuter, Beruf, Gegenstände");
check(["wegerich", "ringelblume", "moorgloeckchen", "eisenhut", "nebelkraut", "lindenbluete"].map((k) => KRAEUTER[k].level).join("/") === "1/10/20/35/45/65", "Kräuter-Stufen 1/10/20/35/45/65");
check(KRAUTSTELLEN.length >= 30 && KRAUTSTELLEN.every((s) => KRAEUTER[s.art] && GEGENSTAENDE[s.art]), `${KRAUTSTELLEN.length} Fundstellen aus der Welt (#35), jedes Kraut als Gegenstand`);
check(BERUFE.some((b) => b.id === "kraeuterkunde") && GEGENSTAENDE.sichel && LAEDEN.handwerker.waren.some((w) => w.g === "sichel") && LAEDEN.traenke.waren.some((w) => w.g === "leeres_flaeschchen" && w.preis === 2) && rezept("sichel")?.station === "werkbank", "Beruf im Skill-Tab · Sichel beim Handwerker und an der Werkbank · Fläschchen bei Mira für 2 Splitter");

console.log("\nSammeln mit der Sichel");
KR.krautEinrichten({ sb, senden: (_s, m) => NACHR.push(m), alle: () => [] }); wuerfelSetzen(() => 0.3);
{ const W = KRAUTSTELLEN.find((s) => s.art === "wegerich"), E = KRAUTSTELLEN.find((s) => s.art === "eisenhut"), S = { nutzer: "kira", gast: false, wx: W.x, wy: W.y };
  await laden("kira", { rucksack: [] }); check(/Sichel/.test(KR.krautStart(S, W.id) || ""), "ohne Sichel: nein");
  await laden("kira2", { rucksack: ["sichel"] }); const S2 = { ...S, nutzer: "kira2" }; { const r = KR.krautStart(S2, W.id); check(r === null, `mit Sichel: Wegerich schneiden beginnt (${r})`); }
  for (let i = 1; i <= 8; i++) KR.krautTakt(Date.now() + i * 1600); KR.krautStop(S);
  check(I.anzahlVon("kira2", "wegerich") >= 1 && (I.inventarVon("kira2").berufe || {}).kraeuterkunde >= 10, `Wegerich im Rucksack (${I.anzahlVon("kira2", "wegerich")}), Kräuterkunde-XP (${(I.inventarVon("kira2").berufe || {}).kraeuterkunde})`);
  check(/Kräuterkunde 35/.test(KR.krautStart({ ...S2, wx: E.x, wy: E.y }, E.id) || ""), "Eisenhut erst ab Kräuterkunde 35");
  check(/näher/.test(KR.krautStart({ ...S2, wx: W.x + 9, wy: W.y }, W.id) || ""), "nur nah an der Pflanze"); wuerfelSetzen(Math.random); }

console.log("\nBrauen am Kessel");
const BR = REZEPTE.filter((r) => r.beruf === "kraeuterkunde");
check(BR.length === 17 /* zwölf + fünf Zunft-Tränke (#176) */ && BR.every((r) => r.station === "kessel" && r.zutaten.some((z) => z.g.includes("leeres_flaeschchen")) && r.verbrannt === "trueber_sud"), "zwölf feste Rezepte am Kessel (dazu fünf Zunft-Tränke, #176), jedes mit leerem Fläschchen, Fehlschlag Trüber Sud");
check(rezeptBeruf(rezept("brauen_heiltrank")) === "kraeuterkunde" && rezeptBeruf(rezept("fischsuppe")) === "kochen", "Brauen zählt zur Kräuterkunde, die Fischsuppe im selben Kessel zum Kochen");
check(KESSEL.every((k) => WERKSTAETTEN.some((w) => w.id === k.id && w.station === "kessel")), "Kessel im Kräuterhaus der Waldmark und bei Hedda");
const L = (id) => rezept("brauen_" + id).level;
check(L("atemtrank_schwach") < L("atemtrank_stark") && L("steinhaut_schwach") < L("steinhaut_stark") && L("moorfeuer_schwach") < L("moorfeuer_stark") && L("nebelschleier_schwach") < L("nebelschleier_stark") && L("lindentau_schwach") < L("lindentau_stark"), "je Trank erst die schwache, dann die starke Fassung");
{ const neben = (id) => Boolean(VERBRAUCH[id].kostet || (WIRKUNGEN[VERBRAUCH[id].wirkung] && Object.values(WIRKUNGEN[VERBRAUCH[id].wirkung].werte).some((v) => v < 0)));
  const mit = BR.map((r) => r.ergebnis).filter(neben); check(mit.length === 2 && mit.every((id) => /_stark$/.test(id) && L(id) >= 45), `Nebenwirkungen nur bei den starken ab Stufe 45 (${mit.join(", ")})`); }
{ const r = rezept("brauen_heiltrank"); check(Math.abs(brennChance(10, r) - 0.25) < 1e-9 && brennChance(20, r) > 0 && brennChance(20, r) < 0.25 && brennChance(30, r) === 0 && brennChance(40, r) === 0, `Fehlschlag sinkt: 25 % auf Rezeptstufe, ${Math.round(brennChance(20, r) * 100)} % bei +10, 0 % ab +20`); }
{ const K0 = KESSEL[0], S = { nutzer: "hilde", gast: false, wx: K0.x, wy: K0.y + 1 }; HW.handwerkEinrichten({ sb, senden: (_s, m) => NACHR.push(m) }); HW.HANDWERK_QUEST.schalter = () => true;
  await laden("hilde", { rucksack: [{ g: "leeres_flaeschchen", n: 5 }, "ringelblume", "wegerich", "wegerich"], berufe: { kraeuterkunde: xpFuer(9) } });
  check(/Kräuterkunde 10/.test(HW.handwerkStart(S, "brauen_heiltrank", 1) || ""), "Heiltrank erst ab Kräuterkunde 10 (Kochen zählt nicht)");
  check(HW.handwerkStart(S, "brauen_kleiner_heiltrank", 1) === null, "Kleiner Heiltrank am Kessel beginnt"); for (let i = 0; i < 12; i++) HW.handwerkTakt(Date.now() + i * 1000);
  check(I.anzahlVon("hilde", "kleiner_heiltrank") === 1 && I.anzahlVon("hilde", "leeres_flaeschchen") === 4 && (I.inventarVon("hilde").berufe.kraeuterkunde > xpFuer(9)), "gebraut: ein Trank, ein Fläschchen weniger, Kräuterkunde-XP");
  check(/näher|Kessel|nah/i.test(HW.handwerkStart({ ...S, wx: S.wx + 20 }, "brauen_kleiner_heiltrank", 1) || ""), "nur am Kessel"); }

console.log("\nTrank-Platz und Wirkungen");
{ let w = wirkungDazu([], "fischsuppe"); w = wirkungDazu(w, "steinhaut_schwach"); w = wirkungDazu(w, "moorfeuer_stark");
  check(w.length === 2 && w.some((x) => x.id === "fischsuppe") && w.some((x) => x.id === "moorfeuer_stark") && !w.some((x) => x.id === "steinhaut_schwach"), "ein Trank ersetzt den anderen, das Essen bleibt");
  check(skillPlus(w).staerke === 5 && skillPlus(w).defense === 2, "Stärke +5 (Moorfeuer) und Defense +2 (Fischsuppe) zugleich");
  check(VERBRAUCH.atemtrank_stark.ausdauer === 40 && VERBRAUCH.moorfeuer_stark.kostet === 5 && VERBRAUCH.lindentau_stark.nebenAuf && VERBRAUCH.lindentau_stark.heilt.fest === 20, "Atemtrank +40 % Ausdauer · Moorfeuer stark kostet 5 LP · Lindentau stark heilt 20 und hebt Nebenwirkungen auf");
  check(Object.keys(VERBRAUCH).filter((k) => VERBRAUCH[k].art === "Trank").every((k) => VERBRAUCH[k].flaeschchen), "jeder Trank gibt das leere Fläschchen zurück");
  await laden("nora", { rucksack: [], wirkungen: wirkungDazu(wirkungDazu([], "bauerneintopf"), "nebelschleier_stark") }); const w2 = I.trankWirkungWeg(sb, "nora");
  check(w2.length === 1 && w2[0].id === "bauerneintopf", "Lindentau: der Trank-Platz wird leer (Nebenwirkung weg), das Essen bleibt");
  check(bemerkenFaktor(wirkungDazu([], "nebelschleier_schwach")) === 0.75 && bemerkenFaktor(wirkungDazu([], "nebelschleier_stark")) === 0.5 && skillPlus(wirkungDazu([], "nebelschleier_stark")).fernkampf === -3, "Nebelschleier: ein Viertel später / halb so weit; stark: Fernkampf −3"); }

console.log("\nNebelschleier im Kampf");
setzeKarte(KARTEN.welt_nordwald, FEIN);
for (const [bem, soll, t] of [[undefined, true, "ohne Trank: der Heidewolf bemerkt den Helden auf 5 Felder"], [0.5, false, "mit Nebelschleier (stark): nicht mehr"]]) {
  const s = Sim.welt(31, undefined, true); s.wesen = s.wesen.filter((w) => w.held); s["karte"].MEHRKAMPF = [[0, 0, 1e5, 1e5]];
  const id = s.beitreten("schildwaechter", 0, { x: 60.5, y: 60.5 }, kampfwerte({ ...NULL_XP }, startAusruestung("schwert"), 1, {}, { bemerken: bem })), h = s.nach(id); h.max = h.lp = 1e5; s.eingabe({ t: "auto", an: false }, id);
  const w = s["neu"](false, "heidewolf", 1, { x: 65.5, y: 60.5 }, true, 7); w.lp = w.max = 45; for (let i = 0; i < 20; i++) s.schritt();
  check((w.zielId === id) === soll, t); }

console.log("\nKräuterhof: Beete erst mit dem Schalter kraeuterhof_beete");
{ const { krautSchalter } = M, HOF = KRAUTSTELLEN.filter((s) => s.id.startsWith("kraeuterhof_"));
  check(HOF.length === 8 && HOF.every((s) => krautSchalter(s.id)?.schalter === "kraeuterhof_beete") && KRAUTSTELLEN.filter((s) => !s.id.startsWith("kraeuterhof_")).every((s) => !krautSchalter(s.id)), `acht Stellen auf den Beeten hängen am Schalter, alle anderen nicht (${HOF.length})`);
  const R = HOF.find((s) => s.art === "ringelblume"), alt = HW.HANDWERK_QUEST.schalter; await laden("frieda", { rucksack: ["sichel"], berufe: { kraeuterkunde: 1e6 } }); const S = { nutzer: "frieda", gast: false, wx: R.x, wy: R.y };
  HW.HANDWERK_QUEST.schalter = () => false; check(/brach/.test(KR.krautStart(S, R.id) || ""), "vor der Quest: das Beet liegt brach");
  HW.HANDWERK_QUEST.schalter = (_n, sch) => sch === "kraeuterhof_beete"; { const r = KR.krautStart(S, R.id); check(r === null, `nach der Quest: Ringelblume schneiden beginnt (${r})`); } KR.krautStop(S); HW.HANDWERK_QUEST.schalter = alt; }

console.log(f ? `\nKräuterkunde: ${f} FEHLER` : "\nKräuterkunde: alles in Ordnung");
process.exit(f ? 1 : 0);
