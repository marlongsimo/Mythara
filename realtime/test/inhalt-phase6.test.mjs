/*
 * Riftmere – Inhalte Phase 6 (#17, #18, #26): der Rabenorden auf Aschenwerth und im Rabengrund, Federsiegel, Splitterkern, der Oberste Rabenpriester.
 * Ohne Server-Prozess und ohne Supabase: Lager in der Kampfwelt, Beute über viele Würfe (beute.md), Federsiegel herstellen und Splitterkern einsetzen
 * am Bindestein, Bosskampf im echten Thronsaal (Instanz mit Federsiegel, Doppelhieb, Schweben, Sturzraben, Flügelschlag mit Säulen-Deckung, Becken).
 * Aufruf (im Ordner realtime, nach python3 werkzeug/weltzonen.py): node test/inhalt-phase6.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-inhalt6-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/sim"; export * from "./shared/config"; export * from "./shared/karte"; export * from "./shared/karten"; export * from "./shared/kampfwerte"; export { startAusruestung, GEGENSTAENDE, beuteAufloesen } from "./shared/gegenstaende"; export { BOSSE, INSTANZEN } from "./shared/bosse"; export { weltJeSpieler } from "./server/src/bosse"; export * as I from "./server/src/inventar"; export * as HW from "./server/src/handwerk"; export { rezept, WERKSTAETTEN, werkstattErreichbar, versperrt } from "./shared/handwerk";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const M = await import(datei);
const { Sim, MONSTER, KARTEN, FEIN, setzeKarte, kampfwerte, NULL_XP, xpFuer, startAusruestung, GEGENSTAENDE, beuteAufloesen, BOSSE, INSTANZEN, weltJeSpieler, I, HW, rezept, fels } = M;
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
const lauf = (s, sek, bis) => { const ev = []; for (let i = 0; i < sek * 20; i++) { s.schritt(); ev.push(...s.zustand().ev); if (bis && bis(ev)) break; } return ev; };
const NEU = ["moorrabe", "rabenpriester_novize", "rabenpriester_akoluth", "rabenpriester_akoluth_speer", "federmutter", "oberster_rabenpriester"];

console.log("\nGegner und Gegenstände");
check(NEU.every((t) => MONSTER[t] && MONSTER[t].v2 && MONSTER[t].drops), "sechs neue Gegner mit Werten (v3) und Beute");
const fehlt = NEU.flatMap((t) => MONSTER[t].drops.flatMap((R) => R.wurf.map((w) => w.g))).filter((g) => !g.startsWith("@") && !GEGENSTAENDE[g]);
check(!fehlt.length, `alle Beute-Gegenstände gibt es (${fehlt.join(", ") || "ok"})`);
check(NEU.every((t) => MONSTER[t].drops.every((R) => R.wurf.reduce((a, w) => a + w.chance, 0) <= 100.0001)), "je Wurf zusammen höchstens 100 %");
check(["rabenfedern", "federsiegel", "splitterkern", "rabenschwinge", "rabenkueken"].every((g) => GEGENSTAENDE[g]), "neue Gegenstände: Rabenfedern, Federsiegel, Splitterkern, Rabenschwinge, Rabenküken");
check(MONSTER.rabenpriester_novize.friedlichMit.includes("rabenkapuze") && MONSTER.federmutter.stile.length === 3, "Novize friedlich mit Rabenkapuze · Federmutter mit drei Stilen");
{ let ok = true; for (let i = 0; i < 200; i++) { const b = beuteAufloesen("@selten:Bogen"), e = beuteAufloesen("@episch"); if (!b || GEGENSTAENDE[b].seltenheit !== "selten" || !/bogen/i.test(GEGENSTAENDE[b].art) || !e || GEGENSTAENDE[e].seltenheit !== "episch" || /holzbeil|spitzhacke/.test(e)) ok = false; }
  check(ok, "„@selten:Bogen“, „@episch“: zufällige Ausrüstung dieser Stufe (ohne Werkzeuge)"); }

console.log("\nLager in der Kampfwelt");
setzeKarte(KARTEN.welt, FEIN);
{ const s = Sim.welt(1, undefined, true), n = (t) => s.wesen.filter((w) => w.typ === t).length;
  check(n("rabenpriester_novize") === 3 && n("moorrabe") === 9 && n("federmutter") === 1 && n("rabenpriester_akoluth") + n("rabenpriester_akoluth_speer") === 6 && n("kerkermeister") === 1, `Aschenwerth und Rabengrund: 3 Novizen, 9 Moorraben, 6 Akoluthen, der Kerkermeister, die Federmutter`);
  check(n("oberster_rabenpriester") === 1, "der Oberste steht öffentlich im Thronsaal (nach der Quest, #116; in der Quest kämpft man in einer Kopie)"); }

console.log("\nBeute über viele Würfe");
function beute(typ, n) { const s = Sim.welt(7, 99999, true); s.wesen = s.wesen.filter((w) => w.held); const id = s.beitreten("schildwaechter", 0, { x: 100, y: 100 }), h = s.nach(id); const zaehl = {}; let kills = 0;
  for (let i = 0; i < n; i++) { const m = s["neu"](false, typ, 1, { x: 101, y: 100 }, true, 7); m.lp = m.max = MONSTER[typ].lp; s["anteile"].set(m.id, new Map([[id, 1]])); s["abziehen"](m, 1e9, h);
    for (const e of s.zustand().ev) if (e.a === "beute") { kills++; for (const [g0, k, nur] of e.g) { const g = nur ? nur : g0, x = zaehl[g] || (zaehl[g] = { mal: 0, n: 0 }); x.mal++; x.n += k; } } s.wesen = s.wesen.filter((w) => w.held); s["wiederkehr"] = []; }
  return { zaehl, n }; }
const nahe = (ist, soll, rel = 0.35) => Math.abs(ist - soll) <= Math.max(3, soll * rel);
{ const { zaehl: Z, n } = beute("oberster_rabenpriester", 4000);
  check(Z.splitter.mal === n && Z.rabenfedern.mal === n && Math.abs(Z.splitter.n / n - 450) < 15 && Math.abs(Z.rabenfedern.n / n - 17.5) < 1.5, `Oberster: Splitter immer (Schnitt ${Math.round(Z.splitter.n / n)}, Ziel 450), Rabenfedern immer`);
  check(nahe(Z.splitterkern ? Z.splitterkern.mal : 0, n / 64) && nahe((Z["@selten"] || { mal: 0 }).mal, n / 16) && nahe((Z["@episch"] || { mal: 0 }).mal, n / 64), `Splitterkern ≈ 1/64 (${(Z.splitterkern || { mal: 0 }).mal} von ${n}), Selten ≈ 1/16, Episch ≈ 1/64`);
  check(nahe((Z.federsiegel || { mal: 0 }).mal, n * 0.1) && nahe((Z.barren_sterneisen || { mal: 0 }).mal, n * 0.18), "Ressourcen: Sterneisen 18 %, Federsiegel 10 %"); }
{ const { zaehl: Z, n } = beute("rabenpriester_akoluth", 6000); check(nahe((Z.federsiegel || { mal: 0 }).mal, n / 12) && nahe((Z.rabenfedern || { mal: 0 }).mal, n * 0.6), `Akoluth: Federsiegel ≈ 1/12 (${(Z.federsiegel || { mal: 0 }).mal} von ${n}), Rabenfedern 60 %`);
  check(Z.c2_federsiegel && Z.c2_federsiegel.mal === n, "in C2 garantiert: eigener Wurf mit „nur: c2_federsiegel“ (der Server gibt ihn nur im Questschritt)"); }
{ const { zaehl: Z, n } = beute("moorrabe", 3000); check(nahe(Z.splitter.mal, n * 0.5) && nahe(Z.rabenfedern.mal, n * 0.4), "Moorrabe: Splitter 50 %, Rabenfeder 40 %"); }

console.log("\nBindestein: Federsiegel und Splitterkern");
{ let ROW = []; const sb = async (p) => (p.includes("rpg_held?") ? ROW : null), NACHR = []; HW.handwerkEinrichten({ sb, senden: (_s, m) => NACHR.push(m) }); HW.HANDWERK_QUEST.schalter = () => true;
  ROW = [{ waffe: "schwert", inventar: { angelegt: {}, rucksack: [{ g: "rabenfedern", n: 60 }, { g: "splitter", n: 120 }, "wegstein", "splitterkern"], v: 2, berufe: { splitterbinden: xpFuer(40) }, ladungen: { wegstein: 100 } } }]; await I.inventarLaden(sb, "rita");
  const S = { nutzer: "rita", gast: false, wx: 6453.2, wy: 6679.4 }, R = rezept("federsiegel");
  check(R && R.zutaten.some((z) => z.g.includes("rabenfedern") && z.n === 25) && R.zutaten.some((z) => z.g.includes("splitter") && z.n === 50), "Rezept: 25 Rabenfedern + 50 Splitter → Federsiegel");
  check(HW.handwerkStart(S, "federsiegel", 2) === null, "am Bindestein: Federsiegel herstellen beginnt"); for (let i = 0; i < 40; i++) HW.handwerkTakt(Date.now() + i * 1000);
  check(I.anzahlVon("rita", "federsiegel") === 2 && I.anzahlVon("rita", "rabenfedern") === 10 && I.anzahlVon("rita", "splitter") === 20, `zwei Federsiegel hergestellt (übrig: ${I.anzahlVon("rita", "rabenfedern")} Federn, ${I.anzahlVon("rita", "splitter")} Splitter)`);
  check(I.ladungMax("rita", "wegstein") === 100 && HW.handwerkStart(S, "splitterkern_einsetzen", 1) === null, "Splitterkern einsetzen beginnt"); for (let i = 0; i < 20; i++) HW.handwerkTakt(Date.now() + 60000 + i * 1000);
  check(I.ladungMax("rita", "wegstein") === 200 && I.anzahlVon("rita", "splitterkern") === 0 && I.ladungenDazu(sb, "rita", "wegstein", 50) === 50, "danach fasst der Wegstein 200 Ladungen");
  check(/schon einen Splitterkern/.test(HW.handwerkStart(S, "splitterkern_einsetzen", 1) || ""), "nur einmal je Held"); }

console.log("\nDer Oberste Rabenpriester im Thronsaal");
const X = { ...NULL_XP, geschick: xpFuer(60), staerke: xpFuer(60), defense: xpFuer(60), fernkampf: xpFuer(60), lp: xpFuer(70) - xpFuer(10) };
const T = INSTANZEN.find((d) => d.id === "thronsaal");
check(T && T.eintritt === "federsiegel" && BOSSE.oberster_rabenpriester.phasen.length === 3, "Instanz Thronsaal mit Federsiegel, Boss mit drei Phasen");
{ const s = Sim.welt(3, undefined, true), U = KARTEN.welt.ursprung; s.ursprung = [U[0], U[1]]; s.wesen = s.wesen.filter((w) => w.held);
  const sx = 10768.5 - U[0], sy = 9626.5 - U[1], id = s.beitreten("schildwaechter", 0, { x: sx, y: sy }, kampfwerte(X, startAusruestung("schwert"), 1)), h = s.nach(id); h.max = h.lp = 1e6; s.eingabe({ t: "auto", an: false }, id);
  let siegel = 1; const beutel = { hat: () => siegel > 0, abgeben: () => (siegel > 0 ? (siegel--, true) : false) };
  const t = weltJeSpieler(s, id, "anna", 10768.5, 9626.5, (x) => x === "rabenpriester_thronsaal", beutel), b = s.wesen.find((w) => w.typ === "oberster_rabenpriester");
  check(siegel === 0 && b && b.instanz === "thronsaal:anna" && /Federsiegel/.test(t), "Betreten mit Federsiegel: eigene Kopie mit dem Obersten");
  b.zielId = h.id; b.wach = true; const ev1 = lauf(s, 10); const n = b.boss ? b.boss.angriffe : 0;
  check(n > 0 && ev1.filter((e) => e.a === "hieb" && e.id === b.id).length === 2 * n, `Phase 1: Doppelhieb (${n} Angriffe)`);
  h.schalterAn = ["becken_getruebt"]; /* Becken getrübt: er sagt an, statt zu trinken */ b.lp = Math.floor(b.max * 0.55); let ev = lauf(s, 0.3);
  check(s.schwebt(b) && s.wesen.filter((w) => w.helfer === b.id).length === 2, "Phase 2: er erhebt sich und ruft zwei Akoluthen");
  ev = lauf(s, 5, (e) => e.some((x) => x.a === "ansage")); check(ev.some((e) => e.a === "ansage" && e.name === "Sturzraben"), "Sturzraben: angesagte Felder");
  for (const w of s.wesen) if (w.helfer === b.id) { w.tot = true; w.weg = true; }
  b.lp = Math.floor(b.max * 0.25); lauf(s, 16); ev = lauf(s, 6, (e) => e.some((x) => x.a === "ansage" && x.name === "Schwarzer Flügelschlag")); const A = ev.find((e) => e.a === "ansage" && e.name === "Schwarzer Flügelschlag");
  const bi = Math.floor(b.x), bj = Math.floor(b.y), zelle = (x, y) => A && A.felder.some(([a, c]) => Math.floor(a) === x && Math.floor(c) === y);
  let schatten = 0; if (A) for (let j = 0; j < 32; j++) for (let i = 0; i < 32; i++) { const x = 10752 - U[0] + i, y = 9600 - U[1] + j; if (!fels(x, y) && !zelle(x, y)) schatten++; }
  check(A && A.felder.length > 200 && schatten > 0, `Phase 3: Schwarzer Flügelschlag über den ganzen Saal (${A ? A.felder.length : 0} Felder), ${schatten} Felder im Windschatten`);
  h.schalterAn = []; b.lp = Math.floor(b.max * 0.2); b.boss.heil = {}; const lp0 = b.lp; ev = lauf(s, 20, (e) => e.some((x) => x.a === "trinken" && x.id === b.id));
  check(ev.some((e) => e.a === "trinken" && e.id === b.id), "er geht zum Becken und trinkt"); lauf(s, 3); check(b.lp > lp0, `und heilt sich (${lp0} → ${b.lp})`);
  b.lp = Math.floor(b.max * 0.2); b.boss.heil = {}; h.schalterAn = ["becken_getruebt"]; ev = lauf(s, 15);
  check(!ev.some((e) => e.a === "trinken" && e.id === b.id), "Becken getrübt (C3: Heddas Moorwasser): keine Heilung");
  ev = []; s["anteile"].set(b.id, new Map([[id, 1]])); s["abziehen"](b, 1e9, h); ev = s.zustand().ev;
  check(ev.some((e) => e.a === "boss" && e.typ === "oberster_rabenpriester") && ev.some((e) => e.a === "beute"), "besiegt: Bosszähler-Ereignis und Beute");
  weltJeSpieler(s, id, "anna", 10768.5, 9640, () => true, beutel); check(!s.instanzDa("thronsaal:anna"), "hinaus: der Versuch ist vorbei");
  const t2 = weltJeSpieler(s, id, "anna", 10768.5, 9626.5, (x) => x === "rabenpriester_thronsaal", beutel); check(/ohne Federsiegel/.test(t2 || "") && !s.instanzDa("thronsaal:anna"), "noch einmal ohne Siegel: der Thronsaal bleibt zu"); }

console.log("\nC1 „Schwarze Federn“: Meilerpech, Novizenkapuze, Brückenplanken");
{ const { WERKSTAETTEN, versperrt } = M, P = rezept("brueckenplanke"), W = WERKSTAETTEN.find((w) => w.id === "werkbank_rabenmoor");
  check(["meilerpech", "novizenkapuze", "brueckenplanke"].every((g) => GEGENSTAENDE[g] && GEGENSTAENDE[g].art === "Questgegenstand" && GEGENSTAENDE[g].untauschbar && GEGENSTAENDE[g].bild), "drei Questgegenstände, untauschbar, mit Bild aus dem Bestand");
  check(P && P.station === "werkbank" && P.level === 25 && P.quest === "rabenmoor_schwarze_federn" && P.zutaten.length === 1 && P.zutaten[0].g[0] === "stamm_moorweide", "Rezept Brückenplanke: Werkbank, Handwerk 25, nur in C1, aus einem Moorweidenstamm");
  check(W && !versperrt(Math.floor(W.x), Math.floor(W.y)) && Math.hypot(W.x - 6312.5, W.y - 6701.6) < 4, "Harms Werkbank in Rabenmoor steht frei, neben Harm"); }

console.log("\nC3 „Der Oberste Rabenpriester“: Kerkerschlüssel und Moorwasser");
{ const K = MONSTER.kerkermeister;
  check(K && K.v2 && K.drops.some((R) => R.nur === "c3_kerkerschluessel" && R.wurf.some((w) => w.g === "kerkerschluessel" && w.chance === 100)), "der Kerkermeister trägt den Schlüssel (nur solange C3 ihn braucht)");
  check(["kerkerschluessel", "moorwasser", "moorwasser_geweiht"].every((g) => GEGENSTAENDE[g] && GEGENSTAENDE[g].art === "Questgegenstand" && GEGENSTAENDE[g].untauschbar && GEGENSTAENDE[g].bild), "Kerkerschlüssel, Moorwasser und geweihtes Moorwasser: Questgegenstände mit Bild"); }

console.log(f ? `\nInhalte Phase 6: ${f} FEHLER` : "\nInhalte Phase 6: alles in Ordnung");
process.exit(f ? 1 : 0);
