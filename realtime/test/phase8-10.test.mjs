/*
 * Riftmere – Systeme aus Phase 8 bis 10 (Issue #102), ohne Server-Prozess und ohne Browser:
 * Stadtstufen (Schaltergruppen, Gehraster je Spieler, Figuren), Glocke (friedliche Wiedergänger), Wind (Böe, Fernkampf schwächer), Gift, Flackern,
 * Sand-Auftauchen (Ansage-Feld) und Eingraben des Bosses, Spiegel-Rätsel (feste Reihenfolge), Reisekarte (ein freier Sprung je Tag), Räucherhütte (Wartezeit).
 * Mit Testgegnern und Testdaten – die Inhalte trägt die Integration ein.
 * Aufruf (im Ordner realtime): node test/phase8-10.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-phase8-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/sim"; export * from "./shared/config"; export * from "./shared/karte"; export * from "./shared/karten"; export * from "./shared/kampfwerte"; export { startAusruestung, GEGENSTAENDE } from "./shared/gegenstaende"; export { BOSSE } from "./shared/bosse"; export * as ST from "./shared/stadtstufen"; export * as WE from "./shared/weltereignisse"; export * as BAU from "./shared/welt/bau"; export * as QB from "./shared/questbau"; export * as I from "./server/src/inventar"; export * as HW from "./server/src/handwerk"; export * as WS from "./shared/wegstein"; export { REZEPTE, WERKSTAETTEN } from "./shared/handwerk";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const M = await import(datei);
const { Sim, MONSTER, KARTEN, FEIN, setzeKarte, kampfwerte, NULL_XP, xpFuer, startAusruestung, GEGENSTAENDE, BOSSE, fels, ST, WE, BAU, QB, I, HW, WS, REZEPTE, WERKSTAETTEN } = M;
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
const lauf = (s, sek, bis) => { const ev = []; for (let i = 0; i < sek * 20; i++) { s.schritt(); ev.push(...s.zustand().ev); if (bis && bis(ev)) break; } return ev; };
setzeKarte(KARTEN.welt_nordwald, FEIN);
const X = { ...NULL_XP, geschick: xpFuer(20), staerke: xpFuer(20), defense: xpFuer(20), fernkampf: xpFuer(20), lp: xpFuer(30) - xpFuer(10) };
function welt(seed, x, y) { const s = Sim.welt(seed, undefined, true); s.wesen = s.wesen.filter((w) => w.held); const id = s.beitreten("schildwaechter", 0, { x, y }, kampfwerte(X, startAusruestung("schwert"), 1));
  const h = s.nach(id); h.max = h.lp = 1e6; s.eingabe({ t: "auto", an: false }, id); s["karte"].MEHRKAMPF = [[0, 0, 1e5, 1e5]]; return { s, h }; }
function freiBei() { for (let y = 20; y < 120; y++) for (let x = 20; x < 120; x++) { let ok = true; for (let i = -1; i <= 13 && ok; i++) for (let j = -3; j <= 3 && ok; j++) if (fels(x + i, y + j)) ok = false; if (ok) return { x: x + 0.5, y: y + 0.5 }; } throw new Error("kein freier Platz"); }
function gegner(s, art, x, y) { const w = s["neu"](false, art, 1, { x, y }, true, 7); w.lp = w.max = MONSTER[art].lp; w.streifT = 1e9; return w; }
const P = freiBei();

console.log("\nStadtstufen");
{ const G = ST.STAEDTE.find((s) => s.id === "grauwacht"), an = (L) => (x) => L.includes(x);
  check(ST.stufeVon(G, an([])) === 0 && ST.stufeVon(G, an(["grauwacht_abtei"])) === 1 && ST.stufeVon(G, an(["grauwacht_abtei", "grauwacht_burg"])) === 2, "Stufe = höchste, deren Schalter an ist (die erste gilt immer)");
  check(!ST.ausbauDa("abtei", undefined, an([])) && ST.ausbauDa("abtei", undefined, an(["grauwacht_abtei"])) && ST.ausbauDa(undefined, "burg", an(["grauwacht_abtei"])) && !ST.ausbauDa(undefined, "burg", an(["grauwacht_burg"])), "ausbau: ab der Stufe da · ausbau_bis: mit der Stufe weg");
  check(ST.markeDa("|burg", an([])) && !ST.markeDa("abtei|", an([])) && ST.markeDa("", an([])) && ST.ausbauDa("tippfehler", undefined, an([])), "Marke „ab|bis“ für gebackene Daten; unbekannte Stufen verstecken nichts");
  const d = { region: { id: "testort", name: "Test", ursprung: [2, 3], chunks: [1, 1], biom: "wald" }, gelaende: Array.from({ length: 32 }, () => ".".repeat(32)),
    objekte: [{ id: "truemmer", objekt: "kiste", x: 5.5, y: 5.5, ausbau_bis: "burg" }, { id: "stand", objekt: "kiste", x: 9.5, y: 5.5, ausbau: "abtei" }, { id: "fest", objekt: "kiste", x: 13.5, y: 5.5 }],
    spiel: { kollision: { sperren: [], freigeben: [] }, figuren: [], interaktionen: [], start: [], spawnzonen: [], ausgaenge: [] } };
  const gel = { arten: [{ id: "gras", name: "Gras", zeichen: ".", begehbar: true, wasser: false }] }, obj = { objekte: [{ id: "kiste", name: "Kiste", kategorie: "kleinteil", kollision: { art: "rechteck", x: -0.5, y: -0.5, b: 1, h: 1 } }] };
  const B = BAU.chunksBauen(d, gel, obj), c = B.chunks[0];
  check(c.geh[5][5] === "." && c.geh[5][9] === "." && c.geh[5][13] === "#", "Gehraster: Objekte mit Stufe sperren nicht fest, gewöhnliche schon");
  const A = c.ausbau || []; check(A.length === 2 && A.some((x) => x.m === "|burg" && x.f.some(([i, j]) => i === 64 + 5 && j === 96 + 5)) && A.some((x) => x.m === "abtei|"), "je Chunk: Sperrfelder mit Marke in Weltkoordinaten (sperren nur, solange sie da sind)");
  const Q = { id: "t", figuren: [], schritte: [] }, F = { id: "wache", ausbau: "burg" };
  check(!QB.figurDa(Q, F, "", { hat: () => false, verloren: () => false, schalter: an(["grauwacht_abtei"]) }) && QB.figurDa(Q, F, "", { hat: () => false, verloren: () => false, schalter: an(["grauwacht_burg"]) }), "Questfiguren mit Stufe: nur ab der Stufe da (Kontext.schalter)"); }

console.log("\nGlocke");
MONSTER.test_wiedergaenger = { ...MONSTER.bandit_dolch, name: "Test-Wiedergänger", lp: 60, aggressiv: true, aggroReich: 6, friedlichBei: WE.GLOCKE.friedlich };
{ check(WE.glockeLaeutet(Date.UTC(2026, 10, 27, 14, 0, 30)) && !WE.glockeLaeutet(Date.UTC(2026, 10, 27, 14, 1, 0)) && WE.glockeStunde(Date.UTC(2026, 10, 27, 14, 59)) !== WE.glockeStunde(Date.UTC(2026, 10, 27, 15, 0)), "zu jeder vollen Stunde eine Minute lang");
  const { s, h } = welt(21, P.x, P.y), w = gegner(s, "test_wiedergaenger", P.x + 2, P.y); h.schalterAn = [WE.GLOCKE.friedlich]; lauf(s, 2);
  check(!w.zielId, "während die Glocke läutet: der Wiedergänger greift nicht an");
  h.schalterAn = []; lauf(s, 2); check(w.zielId === h.id, "danach greift er wieder an");
  h.schalterAn = [WE.GLOCKE.friedlich]; lauf(s, 0.5); check(!w.zielId && !w.wach, "beginnt sie mitten im Kampf: er lässt ab"); }

console.log("\nWind");
{ const { s, h } = welt(22, P.x, P.y), z = gegner(s, "bandit_dolch", P.x + 4, P.y); z.lp = z.max = 1e9; h.kw = { ...h.kw, angriff: { ...h.kw.angriff, fern: 1e6 } };
  s.windBei = () => true; const summe = () => { let n = 0; for (let i = 0; i < 400; i++) n += s.treffen(h, z, { grund: 10, min: 10, art: "fern" }); return n; };
  const vorher = summe(); const ev = (s.boee(1, 10, 0.2), s.zustand().ev); check(ev.some((e) => e.a === "boee" && e.id === h.id && e.t === 1), "Böe mit Ansage (1 s vorher) an die Helden im Wind-Gebiet");
  check(!s.imWind(h), "während der Ansage weht noch nichts"); lauf(s, 1.1); check(s.imWind(h), "dann weht der Wind");
  const dabei = summe(); check(dabei < vorher * 0.88 && dabei > vorher * 0.7, `Fernkampf schwächer (${Math.round(100 * dabei / vorher)} % des Schadens)`);
  lauf(s, 10); check(!s.imWind(h), "nach 10 s ist es vorbei"); }

console.log("\nGift und Flackern");
MONSTER.test_skorpion = { ...MONSTER.bandit_dolch, name: "Test-Skorpion", lp: 500, gift: { chance: 1, jeSek: 4, dauer: 5 } };
MONSTER.test_geist = { ...MONSTER.bandit_dolch, name: "Test-Glutgeist", lp: 500, flackern: { alle: 2, dauer: 1 } };
{ const { s, h } = welt(23, P.x, P.y), k = gegner(s, "test_skorpion", P.x + 1, P.y); h.kw = { ...h.kw, abwehr: { nah: 0, fern: 0, magie: 0 } }; /* für den Test: jeder Stich trifft */ k.zielId = h.id; k.wach = true; lauf(s, 6, () => h.dauer.length > 0);
  check(h.dauer.some((d) => d.art === "gift" && d.jeSek === 4), "nach einem Treffer: Gift (Schaden über Zeit)");
  const lp = h.lp; k.zielId = 0; k.tot = true; lauf(s, 2); check(h.lp < lp, `das Gift zieht weiter Leben ab (${Math.round(lp - h.lp)})`); }
{ const { s, h } = welt(24, P.x, P.y), g = gegner(s, "test_geist", P.x + 1, P.y); g.zielId = h.id; g.wach = true; const ev = lauf(s, 2.2, (e) => e.some((x) => x.a === "flackern"));
  check(ev.some((e) => e.a === "flackern" && e.id === g.id) && s.unangreifbar(g), "alle 2 s flackert er");
  let n = 0; for (let i = 0; i < 30; i++) n += s.treffen(h, g, { grund: 50, min: 50, art: "nah" }); check(n === 0, "solange er flackert: unangreifbar");
  lauf(s, 1.1); check(!s.unangreifbar(g), "nach 1 s wieder angreifbar"); }

console.log("\nSand-Auftauchen und Eingraben");
MONSTER.test_kriecher = { ...MONSTER.bandit_dolch, name: "Test-Sandkriecher", lp: 80, eingegraben: { weit: 3, schaden: [9, 9] } };
{ const { s, h } = welt(25, P.x, P.y), k = gegner(s, "test_kriecher", P.x + 6, P.y), ids = () => s.zustand().w.map((e) => e[0]);
  lauf(s, 1); check(k.vergraben && !ids().includes(k.id) && s.unangreifbar(k), "eingegraben: unsichtbar und unangreifbar");
  h.x = P.x + 4; h.pfad = []; const ev = lauf(s, 0.5, (e) => e.some((x) => x.a === "ansage")), A = ev.find((e) => e.a === "ansage");
  check(A && A.id === k.id && A.felder.length === 1 && A.felder[0][0] === Math.floor(h.x) + 0.5, "ein Held kommt nah: sein Feld leuchtet (Ansage)");
  const lp = h.lp; const ev2 = lauf(s, 1.2, (e) => e.some((x) => x.a === "auftauchen"));
  check(ev2.some((e) => e.a === "auftauchen" && e.id === k.id) && !k.vergraben && h.lp === lp - 9 && ids().includes(k.id), "er taucht auf und trifft, wer stehen blieb – jetzt sichtbar");
  check(k.zielId === h.id, "und kämpft dann wie gewohnt"); }
MONSTER.test_sandmutter = { ...MONSTER.bandit_dolch, name: "Test-Sandmutter", lp: 1000, boss: true, wiederkehr: 999 };
BOSSE.test_sandmutter = { typ: "test_sandmutter", phasen: [{ ab: 1 }, { ab: 0.5, eingraben: 2 }] };
{ const { s, h } = welt(26, P.x, P.y), b = gegner(s, "test_sandmutter", P.x + 1, P.y); b.zielId = h.id; b.wach = true; lauf(s, 1); b.lp = 400; const ev = lauf(s, 0.2);
  check(ev.some((e) => e.a === "eingraben" && e.id === b.id) && s.unangreifbar(b), "Boss-Phase „eingraben“: unangreifbar"); const e2 = lauf(s, 2.2);
  check(!s.unangreifbar(b) && e2.some((e) => e.a === "auftauchen" && e.id === b.id), "nach 2 s taucht sie wieder auf"); }

console.log("\nSpiegel-Rätsel (feste Reihenfolge)");
{ const Q = { id: "t_sp", schritte: [{ id: "platten", anzahl: 3, ereignis: { art: "objekt", id: "p1" } }], objekte: [{ id: "p1", name: "Platte 1" }, { id: "p2", name: "Platte 2" }, { id: "p3", name: "Platte 3" }],
    reihenfolge: { schritt: "platten", teile: ["p2", "p3", "p1"], falsch: "Das Licht erlischt.", fest: true }, figuren: [], dialoge: {} };
  const s = QB.nachFolge(Q, "", { zeilen: [], start: true }, () => 0.9); check(QB.lage(Q, s).r === undefined && QB.reihe(Q, s).join() === "p2,p3,p1", "fest: für alle die angegebene Reihenfolge (nichts im Stand)");
  const n1 = QB.ereignis(Q, QB.ereignis(Q, s, { art: "objekt", id: "p2" }), { art: "objekt", id: "p1" }); check(QB.zaehler(Q, n1, "platten") === 0, "falsche Platte: das Licht erlischt (von vorn)");
  let t = s; for (const id of ["p2", "p3", "p1"]) t = QB.ereignis(Q, t, { art: "objekt", id }); check(QB.erledigt(Q, t, "platten"), "richtige Reihenfolge: das Licht ist gelenkt"); }

/* nachgebildetes Supabase für Inventar und Handwerk */
let ROW = []; const sb = async (pfad) => (pfad.includes("rpg_held?") ? ROW : null);
async function held(n, rucksack) { ROW = [{ waffe: "schwert", inventar: { angelegt: {}, rucksack, v: 2 } }]; await I.inventarLaden(sb, n); }

console.log("\nReisekarte");
GEGENSTAENDE.reisekarte = GEGENSTAENDE.reisekarte || { id: "reisekarte", name: "Reisekarte", art: "Questgegenstand", seltenheit: "selten", untauschbar: true, bild: "" };
{ await held("rita", ["reisekarte"]); const heute = WS.reiseTag(Date.UTC(2026, 10, 27, 12)), morgen = WS.reiseTag(Date.UTC(2026, 10, 28, 12));
  check(heute === "20261127" && WS.reiseTag(Date.UTC(2026, 10, 27, 23, 30)) === "20261128", "der Tag zählt nach deutscher Zeit");
  check(I.reisekarteFrei("rita", heute), "mit Reisekarte: heute ein freier Sprung");
  check(I.reisekarteNutzen(sb, "rita", heute) && !I.reisekarteFrei("rita", heute) && !I.reisekarteNutzen(sb, "rita", heute), "einmal genutzt: heute nicht noch einmal");
  check(I.reisekarteFrei("rita", morgen) && I.reisekarteNutzen(sb, "rita", morgen) && I.inventarVon("rita").merker.filter((m) => m.startsWith("reisekarte_")).length === 1, "am nächsten Tag wieder (nur ein Merker bleibt)");
  await held("ohne", []); check(!I.reisekarteFrei("ohne", heute), "ohne Reisekarte: nichts frei"); }

console.log("\nRäucherhütte (Wartezeit)");
{ const R = { id: "test_raeuchern", station: "raeucherhuette", ergebnis: "heiltrank", level: 1, zutaten: [{ g: ["mehl"], n: 2 }], xp: 30, ticks: 1, stufe: 1, gruppe: "Räuchern", warten: 600 };
  REZEPTE.push(R); WERKSTAETTEN.push({ id: "test_huette", station: "raeucherhuette", x: 100, y: 100, ort: "test" });
  const NACHR = []; HW.handwerkEinrichten({ sb, senden: (_s, m) => NACHR.push(m) }); const echt = Date.now; let uhr = echt(); Date.now = () => uhr;
  await held("kai", [{ g: "mehl", n: 7 }]); const S = { nutzer: "kai", gast: false, wx: 100.5, wy: 100.5 };
  const xp0 = I.berufXp("kai", "kochen"); let r = HW.handwerkStart(S, R.id, 5);
  check(r === null && I.anzahlVon("kai", "mehl") === 1 && I.wartenVon("kai").n === 3 && NACHR.some((m) => m.tat === "warten" && m.menge === 3), "hineinlegen: Zutaten für 3 Stück sofort genommen (mehr war nicht da), der Auftrag ist gespeichert");
  uhr += 300_000; r = HW.handwerkStart(S, R.id, 1); check(/noch 5 min/.test(r || "") && I.anzahlVon("kai", "heiltrank") === 0, `vor der Zeit: „${r}“`);
  check(I.inventarVon("kai").warten && I.invPruefen(JSON.parse(JSON.stringify(I.inventarVon("kai"))), "schwert").warten.n === 3, "der Auftrag übersteht Speichern und Laden (Inventar)");
  uhr += 301_000; r = HW.handwerkStart(S, R.id, 1);
  check(r === null && I.anzahlVon("kai", "heiltrank") === 3 && !I.wartenVon("kai") && I.berufXp("kai", "kochen") === xp0 + 90, "nach 10 min: abholen – 3 Stück, Kochen-XP je Stück");
  check(HW.handwerkStart({ ...S, wx: 200, wy: 200 }, R.id, 1) !== null, "nur an der Hütte");
  Date.now = echt; }

console.log(f ? `\nPhase 8–10: ${f} FEHLER` : "\nPhase 8–10: alles in Ordnung");
process.exit(f ? 1 : 0);
