/*
 * Riftmere – Phase-6-Bausteine der Simulation (Issue #49), ohne Server-Prozess und ohne Browser:
 * Verkleidung (friedlichMit), Stilwechsel (stile), Boss-Baukasten: Schweben, Mehrfachhieb, Deckung (Windschatten), Ansage über den ganzen Raum,
 * Instanz mit Eintritt je Versuch (Federsiegel) samt Tür davor.
 * Mit Testgegnern und Testdaten – die echten Inhalte (Novizen, Federmutter, Oberster Rabenpriester, Thronsaal) trägt die Integration ein.
 * Aufruf (im Ordner realtime): node test/phase6.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-phase6-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/sim"; export * from "./shared/config"; export * from "./shared/karte"; export * from "./shared/karten"; export * from "./shared/kampfwerte"; export { startAusruestung } from "./shared/gegenstaende"; export { BOSSE, INSTANZEN, TUEREN } from "./shared/bosse"; export * from "./shared/boss"; export { weltJeSpieler } from "./server/src/bosse";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const M = await import(datei);
const { Sim, MONSTER, KARTEN, FEIN, setzeKarte, kampfwerte, NULL_XP, xpFuer, startAusruestung, BOSSE, INSTANZEN, TUEREN, fels, frei, tuerenZu, weltJeSpieler } = M;
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
const lauf = (s, sek, bis) => { const ev = []; for (let i = 0; i < sek * 20; i++) { s.schritt(); ev.push(...s.zustand().ev); if (bis && bis(ev)) break; } return ev; };

setzeKarte(KARTEN.welt_nordwald, FEIN);
const X = { ...NULL_XP, geschick: xpFuer(20), staerke: xpFuer(20), defense: xpFuer(20), lp: xpFuer(30) - xpFuer(10) };
function welt(seed, x, y) { const s = Sim.welt(seed, undefined, true); s.wesen = s.wesen.filter((w) => w.held); const id = s.beitreten("schildwaechter", 0, { x, y }, kampfwerte(X, startAusruestung("schwert"), 1));
  const h = s.nach(id); h.max = h.lp = 1e6; s.eingabe({ t: "auto", an: false }, id); s["karte"].MEHRKAMPF = [[0, 0, 1e5, 1e5]]; return { s, h }; }
function freiBei() { for (let y = 20; y < 120; y++) for (let x = 20; x < 120; x++) { let ok = true; for (let i = -1; i <= 13 && ok; i++) for (let j = -3; j <= 3 && ok; j++) if (fels(x + i, y + j)) ok = false; if (ok) return { x: x + 0.5, y: y + 0.5 }; } throw new Error("kein freier Platz"); }
function gegner(s, art, x, y) { const w = s["neu"](false, art, 1, { x, y }, true, 7); w.lp = w.max = MONSTER[art].lp; w.streifT = 1e9; return w; }
const P = freiBei();

console.log("\nVerkleidung");
MONSTER.test_novize = { ...MONSTER.bandit_dolch, name: "Test-Novize", lp: 40, aggressiv: true, aggroReich: 6, friedlichMit: ["test_kapuze"] };
{ const { s, h } = welt(11, P.x, P.y), n = gegner(s, "test_novize", P.x + 3, P.y); h.angelegt = ["test_kapuze"]; lauf(s, 3);
  check(!n.zielId && !n.wach, "mit der Kapuze angelegt: der Novize greift nicht von selbst an");
  h.angelegt = []; lauf(s, 2); check(n.zielId === h.id, "ohne Kapuze: er greift an"); }
{ const { s, h } = welt(12, P.x, P.y), n = gegner(s, "test_novize", P.x + 1, P.y); h.angelegt = ["test_kapuze"]; s.eingabe({ t: "ziel", id: n.id }, h.id); lauf(s, 3);
  check(n.zielId === h.id, "verkleidet, aber selbst angegriffen: er wehrt sich"); }

console.log("\nStilwechsel");
const NAH = { name: "Krallen", art: "nah", schaden: [3, 3], takt: 1, reich: 1.2, aushol: 0 }, FERN = { name: "Federn", art: "fern", schaden: [2, 2], takt: 1, reich: 6, aushol: 0 };
MONSTER.test_federmutter = { ...MONSTER.bandit_dolch, name: "Test-Federmutter", lp: 500, angriff: NAH, stile: [{ sek: 3, angriff: NAH }, { sek: 3, angriff: FERN, name: "Federregen", text: "schüttelt die Federn!", v2: { fernkampf: 30 } }] };
{ const { s, h } = welt(13, P.x, P.y), b = gegner(s, "test_federmutter", P.x + 1, P.y); b.zielId = h.id; b.wach = true;
  let ev = lauf(s, 1); check(s.waffe(b).art === "nah", "zuerst: Nahkampf (Stil 1)");
  ev = lauf(s, 3, (e) => e.some((x) => x.a === "stil")); const E = ev.find((e) => e.a === "stil");
  check(E && E.nr === 1 && E.text === "schüttelt die Federn!" && s.waffe(b).art === "fern" && s.waffe(b).reich === 6, "nach 3 s: Wechsel auf Federn (Fernkampf, Reichweite 6) mit Ansage");
  const v = s.v2Von(b); check(!MONSTER.test_federmutter.v2 || (v.fernkampf === 30 && v.ticks === MONSTER.test_federmutter.v2.ticks), "die v3-Werte des Stils ersetzen nur ihre Felder");
  ev = lauf(s, 3.2, (e) => e.some((x) => x.a === "stil")); check(s.waffe(b).art === "nah" && ev.some((e) => e.a === "stil" && e.nr === 0), "nach weiteren 3 s: wieder Nahkampf (reihum)");
  b.zielId = 0; b.wach = false; b.lp = b.max; h.x += 40; lauf(s, 0.5); check(b.stil === undefined, "abgeschüttelt und heil: von vorn"); }

console.log("\nSchweben und Mehrfachhieb");
MONSTER.test_priester = { ...MONSTER.bandit_dolch, name: "Test-Priester", lp: 1000, boss: true, wiederkehr: 999 };
BOSSE.test_priester = { typ: "test_priester", phasen: [{ ab: 1, hiebe: 2 }, { ab: 0.6, text: "erhebt sich!", schweben: 3, landen: "landet schwer" }] };
{ const { s, h } = welt(14, P.x, P.y), b = gegner(s, "test_priester", P.x + 1, P.y); b.zielId = h.id; b.wach = true;
  const ev = lauf(s, 8); const hiebe = ev.filter((e) => e.a === "hieb" && e.id === b.id).length;
  check(b.boss && b.boss.angriffe > 0 && hiebe === 2 * b.boss.angriffe, `Doppelhieb: ${hiebe} Treffer bei ${b.boss && b.boss.angriffe} Angriffen`); }
{ const { s, h } = welt(15, P.x, P.y), b = gegner(s, "test_priester", P.x + 1, P.y); b.zielId = h.id; b.wach = true; lauf(s, 1); b.lp = Math.floor(b.max * 0.5);
  let ev = lauf(s, 0.2); check(ev.some((e) => e.a === "schweben" && e.id === b.id && e.t === 3) && s.schwebt(b), "unter 60 %: er erhebt sich (Ereignis „schweben“, 3 s)");
  h.kw = { ...h.kw, angriff: { ...h.kw.angriff, fern: h.kw.angriff.nah } }; /* für den Test: der Held kann auch schießen */
  const lp0 = b.lp; let nah = 0, fern = 0; for (let i = 0; i < 60; i++) { nah += s.treffen(h, b, { grund: 50, min: 50, art: "nah" }); fern += s.treffen(h, b, { grund: 50, min: 50, art: "fern" }); }
  check(nah === 0 && fern > 0, `schwebend: Nahkampf trifft nie (${nah}), Fernkampf schon (${Math.round(fern)})`);
  b.lp = lp0; const hp0 = h.lp, hb0 = b.boss.angriffe; ev = lauf(s, 2);
  check(h.lp === hp0 && b.boss.angriffe === hb0, "schwebend: er schlägt nicht zu und läuft nicht");
  ev = lauf(s, 1.5, (e) => e.some((x) => x.a === "landen")); check(ev.some((e) => e.a === "landen" && e.text === "landet schwer") && !s.schwebt(b), "nach 3 s: er landet");
  let n2 = 0; for (let i = 0; i < 60; i++) n2 += s.treffen(h, b, { grund: 5, min: 5, art: "nah" }); check(n2 > 0, "gelandet: Nahkampf trifft wieder"); }

console.log("\nDeckung und Ansage über den Raum");
/* eine Säule suchen: Boss B frei, Fels 2 Felder rechts, dahinter (3 rechts) frei; 3 Felder darunter frei */
function saeule() { for (let y = 10; y < 300; y++) for (let x = 10; x < 300; x++) { const ok = (dx, dy) => !fels(x + dx, y + dy);
  if (ok(0, 0) && ok(1, 0) && fels(x + 2, y) && ok(3, 0) && ok(0, 3) && ok(0, 1) && ok(0, 2) && ok(-1, 0) && ok(1, 1) && ok(1, -1)) return { x: x + 0.5, y: y + 0.5 }; } return null; }
const S = saeule();
if (!S) check(false, "keine Säule auf der Testkarte gefunden");
else { MONSTER.test_saal = { ...MONSTER.bandit_dolch, name: "Test-Saal", lp: 1000, boss: true, wiederkehr: 999, tempo: 0 }; /* steht: die Felder hängen an seiner Stelle */
  BOSSE.test_saal = { typ: "test_saal", phasen: [{ ab: 1, ansagen: [{ name: "Flügelschlag", sek: 1, felder: "rundum", weite: 3, deckung: true, schaden: [9, 9] }] }] };
  const { s, h } = welt(16, S.x + 3, S.y), b = gegner(s, "test_saal", S.x, S.y); b.zielId = h.id; b.wach = true; s.eingabe({ t: "lauf", x: h.x, y: h.y }, h.id);
  const ev = lauf(s, 3, (e) => e.some((x) => x.a === "ansage")); const A = ev.find((e) => e.a === "ansage"), hat = (dx, dy) => A && A.felder.some(([x, y]) => x === S.x + dx && y === S.y + dy);
  check(A && !hat(3, 0) && hat(0, 3) && !hat(2, 0), "Deckung: hinter der Säule leuchtet nichts, im freien Feld schon");
  const lp0 = h.lp; lauf(s, 1.2, () => !b.ansage); check(h.lp === lp0 && Math.floor(b.x) === Math.floor(S.x), "wer im Windschatten steht, bleibt heil");
  const R = { id: "test_thron", name: "Thron", feld: [Math.floor(S.x) - 4, Math.floor(S.y) - 4, Math.floor(S.x) + 4, Math.floor(S.y) + 4], schalter: "x" };
  BOSSE.test_saal.phasen[0].ansagen[0] = { name: "Flügelschlag", sek: 1, felder: "raum", schaden: [9, 9] };
  s.instanzSetzen(h.id, "test_thron:a", R); b.instanz = "test_thron:a"; b.zielId = h.id; const e2 = lauf(s, 3, (e) => e.some((x) => x.a === "ansage")).find((e) => e.a === "ansage");
  let soll = 0; for (let i = R.feld[0]; i <= R.feld[2]; i++) for (let j = R.feld[1]; j <= R.feld[3]; j++) if (!fels(i, j) && !(i === Math.floor(b.x) && j === Math.floor(b.y))) soll++;
  check(e2 && e2.felder.length === soll, `„raum“: der ganze Raum der Instanz leuchtet (${e2 && e2.felder.length} von ${soll} Feldern)`); }

console.log("\nEintritt je Versuch (Federsiegel)");
MONSTER.test_thronboss = { ...MONSTER.bandit_dolch, name: "Test-Thronboss", lp: 300 };
const THRON = { id: "test_saal6", name: "Thronsaal", feld: [Math.floor(P.x) + 2, Math.floor(P.y) - 3, Math.floor(P.x) + 12, Math.floor(P.y) + 3], schalter: "test_c3", gegner: [{ art: "test_thronboss", x: P.x + 8, y: P.y }],
  eintritt: "federsiegel", ohne: "Der Altar verlangt ein Federsiegel.", text: "Der Thronsaal." };
const TUER = { id: "test_tuer6", feld: [Math.floor(P.x) + 1, Math.floor(P.y) - 3, Math.floor(P.x) + 1, Math.floor(P.y) + 3], schalter: "test_c3", zu: "Verschlossen.", instanz: "test_saal6" };
INSTANZEN.push(THRON); TUEREN.push(TUER);
{ const { s, h } = welt(17, P.x, P.y); let siegel = 0; const beutel = { hat: (g) => g === "federsiegel" && siegel > 0, abgeben: (g) => (g === "federsiegel" && siegel > 0 ? (siegel--, true) : false) }, an = () => true;
  const W = (dx) => weltJeSpieler(s, h.id, "anna", P.x + dx, P.y, an, beutel);
  W(0); check(tuerenZu(TUEREN, an, { hat: beutel.hat, x: P.x, y: P.y }, INSTANZEN).some((t) => t.id === "test_tuer6"), "ohne Siegel: die Tür davor ist zu");
  siegel = 2; check(!tuerenZu(TUEREN, an, { hat: beutel.hat, x: P.x, y: P.y }, INSTANZEN).some((t) => t.id === TUER.id), "mit Siegel dabei: die Tür ist offen"); /* nur diese Tür (die Zunft-Türen bleiben ohne Berufsstufe zu) */
  siegel = 0; let t = W(5); check(t === "Der Altar verlangt ein Federsiegel." && !h.instanz && !s.instanzDa("test_saal6:anna"), "ohne Siegel im Raum (z. B. hineinteleportiert): keine Kopie, Hinweis");
  check(W(5) === null, "der Hinweis kommt nur einmal");
  W(0); siegel = 2; t = W(5); check(siegel === 1 && h.instanz === "test_saal6:anna" && s.instanzDa("test_saal6:anna") && /verbraucht/.test(t) && /Thronsaal/.test(t), `Betreten: ein Siegel verbraucht, eigene Kopie („${t}“)`);
  W(6); W(7); check(siegel === 1, "im Raum bleiben kostet nichts weiter");
  check(!tuerenZu(TUEREN, an, { hat: () => false, x: P.x + 5, y: P.y }, INSTANZEN).some((t) => t.id === TUER.id) && !tuerenZu(TUEREN, an, { hat: () => false, x: TUER.feld[0] + 0.5, y: P.y }, INSTANZEN).some((t) => t.id === TUER.id), "im Raum oder in der Tür: hinaus geht es auch ohne Siegel");
  W(0); check(!h.instanz && !s.instanzDa("test_saal6:anna"), "hinausgehen beendet den Versuch: die Kopie ist sofort weg");
  W(5); check(siegel === 0 && s.instanzDa("test_saal6:anna"), "wieder hinein: der nächste Versuch kostet das nächste Siegel");
  h.lp = 0; h.tot = true; h.wieder = 99; lauf(s, 0.2); check(!s.instanzDa("test_saal6:anna"), "im Raum gefallen: der Versuch ist vorbei");
  h.tot = false; h.lp = h.max; t = W(5); check(!s.instanzDa("test_saal6:anna") && t === "Der Altar verlangt ein Federsiegel.", "ohne neues Siegel: keine neue Kopie"); }
INSTANZEN.pop(); TUEREN.pop();

console.log(f ? `\nPhase 6: ${f} FEHLER` : "\nPhase 6: alles in Ordnung");
process.exit(f ? 1 : 0);
