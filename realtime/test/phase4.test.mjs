/*
 * Riftmere – Phase-4-Bausteine (Issue #48), ohne Server und ohne Browser:
 * Fliehen, Boss-Baukasten (Ansage, Phasen, Helfer, Heilort, Bosszähler-Ereignis), Instanzen (eigene Kopie, Sicht, Wellen, Abbau), Türen je Held,
 * Figur in mehreren Quests (Othmar: Quest 1, B3, B4) und Abschluss mit Wahl (B4).
 * Mit Testgegnern und Testdaten – die echten Inhalte (Rotmantel, Unterschlupf) trägt die Integration in shared/bosse.ts ein.
 * Aufruf (im Ordner realtime): node test/phase4.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-phase4-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/sim"; export * from "./shared/config"; export * from "./shared/karte"; export * from "./shared/karten"; export * from "./shared/kampfwerte"; export { startAusruestung } from "./shared/gegenstaende"; export { BOSSE, INSTANZEN, TUEREN } from "./shared/bosse"; export * from "./shared/boss"; export * as QB from "./shared/questbau"; export { QUEST1 } from "./shared/quest01"; export { QUEST_B3 } from "./shared/quest_b3"; export { QUEST_B4 } from "./shared/quest_b4"; export * from "./shared/folgen";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const M = await import(datei);
const { Folger, folgePunkt, Sim, MONSTER, KARTEN, FEIN, setzeKarte, kampfwerte, NULL_XP, xpFuer, startAusruestung, BOSSE, QB, QUEST1, QUEST_B3, QUEST_B4, fels } = M;
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
const lauf = (s, sek, bis) => { const ev = []; for (let i = 0; i < sek * 20; i++) { s.schritt(); ev.push(...s.zustand().ev); if (bis && bis(ev)) break; } return ev; };

setzeKarte(KARTEN.welt_nordwald, FEIN);
const X = { ...NULL_XP, geschick: xpFuer(20), staerke: xpFuer(20), defense: xpFuer(20), lp: xpFuer(30) - xpFuer(10) };
/** Eine leere Welt (alle Lager weg) mit einem Helden an (x, y) */
function welt(seed, x, y) { const s = Sim.welt(seed, undefined, true); s.wesen = s.wesen.filter((w) => w.held); const id = s.beitreten("schildwaechter", 0, { x, y }, kampfwerte(X, startAusruestung("schwert"), 1));
  const h = s.nach(id); h.max = h.lp = 1e6; s.eingabe({ t: "auto", an: false }, id); return { s, h }; }
/** Ein freies Stück Boden: (x … x+12) × (y-3 … y+3) ohne Fels */
function freiBei() { for (let y = 20; y < 120; y++) for (let x = 20; x < 120; x++) { let ok = true; for (let i = -1; i <= 13 && ok; i++) for (let j = -3; j <= 3 && ok; j++) if (fels(x + i, y + j)) ok = false; if (ok) return { x: x + 0.5, y: y + 0.5 }; } throw new Error("kein freier Platz"); }
/** Einen Gegner setzen (wie ein Lager) */
function gegner(s, art, x, y) { const id = s.wesen.length; s.wesen.push(...[]); const w = s["neu"](false, art, 1, { x, y }, true, 7); w.lp = w.max = MONSTER[art].lp; w.streifT = 1e9; return w; }
const P = freiBei();
MONSTER.test_spaeher = { ...MONSTER.bandit_dolch, name: "Test-Späher", lp: 40, fliehen: 0.25 };
MONSTER.test_kumpan = { ...MONSTER.bandit_dolch, name: "Test-Kumpan", lp: 40 };
MONSTER.test_boss = { ...MONSTER.bandit_dolch, name: "Testboss", lp: 100, boss: true, wiederkehr: 999 };
MONSTER.test_helfer = { ...MONSTER.bandit_dolch, name: "Testhelfer", lp: 30 };

console.log("\nFliehen");
{ const { s, h } = welt(3, P.x, P.y), a = gegner(s, "test_spaeher", P.x + 1, P.y), k = gegner(s, "test_kumpan", P.x + 9, P.y); s["karte"].MEHRKAMPF = [[0, 0, 1e5, 1e5]]; /* Lager im Mehrkampf: der Kumpan darf mitkämpfen */
  a.zielId = h.id; a.wach = true; lauf(s, 2); a.lp = Math.floor(a.max * 0.2); const ev = lauf(s, 0.2);
  check(a.flucht === k.id && a.geflohen && ev.some((e) => e.a === "text" && e.id === a.id && /flieht/.test(e.t)), "unter 25 % LP: der Späher flieht zum nächsten Kumpan („flieht!“)");
  const x0 = a.x; lauf(s, 8, () => !a.flucht);
  check(!a.flucht && Math.abs(a.x - k.x) <= 1.6 && a.x > x0 + 4, `er läuft zum Kumpan (${(a.x - x0).toFixed(1)} Felder) und bleibt dort`);
  check(k.zielId === h.id && k.wach, "der Kumpan greift jetzt mit an");
  check(a.zielId === h.id && !a.tot, "der Späher kämpft beim Kumpan weiter (gleiches Ziel)");
  a.lp = Math.floor(a.max * 0.1); lauf(s, 1); check(!a.flucht, "nur einmal je Leben"); }
{ const { s, h } = welt(4, P.x, P.y), a = gegner(s, "test_spaeher", P.x + 1, P.y); a.zielId = h.id; a.wach = true; lauf(s, 1); a.lp = 5; lauf(s, 1);
  check(!a.flucht && a.zielId === h.id, "ohne Kumpan in der Nähe: er kämpft weiter"); }

console.log("\nBoss-Baukasten");
BOSSE.test_boss = { typ: "test_boss", phasen: [
  { ab: 1, ansagen: [{ name: "Rundumschlag", alle: 2, felder: "rundum", schaden: [7, 7] }] },
  { ab: 0.5, text: "Testboss ruft!", ruf: { art: "test_helfer", n: 2 }, ansagen: [{ name: "Rundumschlag", alle: 99, felder: "rundum", schaden: [7, 7] }], heilorte: [{ x: P.x + 1, y: P.y, r: 2, menge: 0.3, unter: 0.5, text: "trinkt" }] } ] };
{ const { s, h } = welt(5, P.x, P.y), b = gegner(s, "test_boss", P.x + 1, P.y); b.zielId = h.id; b.wach = true;
  let ev = lauf(s, 30, (e) => e.some((x) => x.a === "ansage")); const A = ev.find((e) => e.a === "ansage");
  const hf = [Math.floor(h.x) + 0.5, Math.floor(h.y) + 0.5];
  check(A && A.name === "Rundumschlag" && A.felder.length === 8 && A.felder.some(([x, y]) => x === hf[0] && y === hf[1]), `nach 2 Grundangriffen: Ansage „Rundumschlag“, 8 Felder rund um den Boss (das Feld des Helden dabei)`);
  check(A && Math.abs(A.t - 1) < 1e-9, "die Felder leuchten 2 Ticks (1 s) vorher");
  const lp0 = h.lp; ev = lauf(s, 1.2, () => !b.ansage); check(!b.ansage && h.lp === lp0 - 7 && !ev.some((e) => e.a === "ansage"), `wer stehen bleibt, wird getroffen (${lp0 - h.lp} Schaden)`);
  ev = lauf(s, 30, (e) => e.some((x) => x.a === "ansage")); h.x += 3; h.pfad = []; const lp1 = h.lp; lauf(s, 1.2, () => !b.ansage);
  check(h.lp === lp1, "wer aus den Feldern geht, wird nicht getroffen");
  h.x -= 3; b.lp = Math.floor(b.max * 0.45); ev = lauf(s, 0.2); const helfer = s.wesen.filter((w) => w.helfer === b.id);
  check(ev.some((e) => e.a === "bossphase" && e.nr === 1 && e.text === "Testboss ruft!"), "bei 50 %: neue Phase mit Ansage im Chat");
  check(helfer.length === 2 && helfer.every((w) => w.zielId === h.id && w.wach && !w.tot), "der Boss ruft 2 Helfer, die sofort angreifen");
  const t = ev.find((e) => e.a === "trinken") || lauf(s, 1).find((e) => e.a === "trinken"), vor = b.lp; lauf(s, 2);
  check(t && b.lp >= vor + Math.round(0.3 * b.max) - 1, `am Heilort trinkt er einmal (${vor} → ${b.lp} LP)`);
  b.lp = Math.floor(b.max * 0.4); ev = lauf(s, 3); check(!ev.some((e) => e.a === "trinken"), "nur einmal je Leben");
  for (const w of helfer) { w.lp = 1; } s.eingabe({ t: "ziel", id: helfer[0].id }, h.id); lauf(s, 20, () => helfer[0].tot);
  lauf(s, 0.1); check(helfer[0].tot && !s.wesen.includes(helfer[0]), "gefallene Helfer verschwinden und kehren nicht wieder");
  b.lp = 1; s.eingabe({ t: "ziel", id: b.id }, h.id); ev = lauf(s, 30, (e) => e.some((x) => x.a === "boss"));
  const B = ev.find((e) => e.a === "boss"); check(B && B.typ === "test_boss" && B.ids.includes(h.id) && B.sek > 5, `Boss besiegt: Ereignis für den Bosszähler (Held dabei, Kampf ${B ? B.sek : "?"} s)`); }
{ const { s, h } = welt(6, P.x, P.y), b = gegner(s, "test_boss", P.x + 1, P.y); b.zielId = h.id; b.wach = true; lauf(s, 1); b.lp = Math.floor(b.max * 0.4); lauf(s, 0.3);
  const helfer = s.wesen.filter((w) => w.helfer === b.id); s.verlassen(h.id); lauf(s, 2); b.lp = b.max; lauf(s, 0.5);
  check(helfer.length === 2 && helfer.every((w) => w.tot) && (!b.boss || (b.boss.phase === 0 && b.boss.seit === undefined)), "Boss abgeschüttelt und wieder heil: Helfer gehen, die Phasen beginnen von vorn"); }

console.log("\nInstanzen");
const RAUM = { id: "testraum", name: "Testraum", feld: [Math.floor(P.x) - 2, Math.floor(P.y) - 3, Math.floor(P.x) + 12, Math.floor(P.y) + 3], schalter: "test", gegner: [{ art: "test_boss", x: P.x + 6, y: P.y }],
  wellen: [[{ art: "test_helfer", x: P.x + 4, y: P.y - 1 }, { art: "test_helfer", x: P.x + 4, y: P.y + 1 }], [{ art: "test_helfer", x: P.x + 5, y: P.y }]], welle: "testwelle", pause: 1 };
{ const { s, h } = welt(7, P.x, P.y), idB = s.beitreten("schildwaechter", 0, { x: P.x, y: P.y + 2 }), hb = s.nach(idB); hb.max = hb.lp = 1e6;
  s.instanzSetzen(h.id, "testraum:a", RAUM); const kopie = s.wesen.filter((w) => !w.held && w.instanz === "testraum:a");
  check(kopie.length === 1 && kopie[0].typ === "test_boss" && s.instanzDa("testraum:a"), "Betreten: die eigene Kopie entsteht mit ihrem Boss");
  let ev = lauf(s, 0.2); const sa = s.sichtFuer(s.zustand(), h.id), sb = s.sichtFuer(s.zustand(), idB), ids = (z) => z.w.map((e) => e[0]);
  check(ids(sa).includes(kopie[0].id) && !ids(sa).includes(idB), "in der Kopie: man sieht ihren Boss, aber keine anderen Spieler");
  check(!ids(sb).includes(kopie[0].id) && !ids(sb).includes(h.id) && ids(sb).includes(idB), "draußen: weder die Kopie noch wer darin steht");
  s.eingabe({ t: "ziel", id: kopie[0].id }, idB); check(hb.zielId !== kopie[0].id, "wer draußen ist, kann Gegner der Kopie nicht angreifen");
  ev = lauf(s, 2); const w1 = s.wesen.filter((w) => w.instanz === "testraum:a" && w.welle === 0);
  check(w1.length === 2 && w1.every((w) => w.zielId === h.id), "Welle 1 kommt (2 Gegner) und greift den Spieler der Kopie an");
  for (const w of w1) w.lp = 0, w.tot = true; ev = lauf(s, 0.2); const e1 = ev.find((e) => e.a === "welle");
  check(e1 && e1.instanz === "testraum:a" && e1.nr === 1 && !e1.fertig, "Welle 1 gefallen: Ereignis „welle“ (für den Questmotor: erlegen testwelle)");
  ev = lauf(s, 1.5); const w2 = s.wesen.filter((w) => w.instanz === "testraum:a" && w.welle === 1); for (const w of w2) w.lp = 0, w.tot = true; ev = lauf(s, 0.2);
  check(w2.length === 1 && ev.some((e) => e.a === "welle" && e.nr === 2 && e.fertig), "nach der Pause Welle 2; gefallen: alle Wellen fertig");
  s.instanzSetzen(h.id, undefined); check(!h.instanz && s.instanzDa("testraum:a"), "Verlassen: zurück in der gemeinsamen Welt, die Kopie bleibt noch");
  s.instanzSetzen(h.id, "testraum:a", RAUM); check(s.wesen.filter((w) => !w.held && w.instanz === "testraum:a").length === 4, "Wiederkommen in der Minute: dieselbe Kopie (nichts neu)");
  s.instanzSetzen(h.id, undefined); lauf(s, 61); check(!s.instanzDa("testraum:a") && !s.wesen.some((w) => w.instanz === "testraum:a"), "60 s leer: die Kopie wird abgebaut");
  s.instanzSetzen(idB, "testraum:b", RAUM); check(s.wesen.filter((w) => !w.held && w.instanz === "testraum:b").length === 1, "ein zweiter Spieler bekommt seine eigene Kopie"); }

console.log("\nTüren");
{ const { s, h } = welt(8, P.x, P.y); const fx = Math.floor(P.x) + 2, fy = Math.floor(P.y);
  s.sperrenSetzen(h.id, [{ feld: [fx, fy - 3, fx, fy + 3], zu: "Die Tür ist verschlossen." }]); s.eingabe({ t: "lauf", x: P.x + 5, y: P.y }, h.id); const ev = lauf(s, 4);
  check(Math.floor(h.x) === fx - 1, `Tür zu: der Held bleibt davor stehen (Feld ${Math.floor(h.x) - Math.floor(P.x)})`);
  check(ev.some((e) => e.a === "text" && e.id === h.id && e.t === "Die Tür ist verschlossen."), "mit dem Text der Tür");
  s.sperrenSetzen(h.id, []); s.eingabe({ t: "lauf", x: P.x + 5, y: P.y }, h.id); lauf(s, 4); check(Math.floor(h.x) === Math.floor(P.x) + 5, "Tür offen (Schalter an): er geht hindurch"); }
{ const { s, h } = welt(9, P.x, P.y), idB = s.beitreten("schildwaechter", 0, { x: P.x, y: P.y + 1 }), hb = s.nach(idB), fx = Math.floor(P.x) + 2;
  s.sperrenSetzen(h.id, [{ feld: [fx, Math.floor(P.y) - 3, fx, Math.floor(P.y) + 3], zu: "Zu." }]); s.eingabe({ t: "lauf", x: P.x + 5, y: P.y + 1 }, idB); lauf(s, 4);
  check(Math.floor(hb.x) === Math.floor(P.x) + 5, "dieselbe Tür ist für einen anderen Spieler (mit Schlüssel) offen"); }

console.log("\nFigur in mehreren Quests (Othmar: Quest 1, B3, B4)");
{ const L = [QUEST1, QUEST_B3, QUEST_B4], k = (hat = [], def = 30) => ({ hat: (g) => hat.includes(g), verloren: () => false, anzahl: () => 1, quest: (id) => QB.lage(L.find((q) => q.id === id) || QUEST1, st[id] || "").phase, skill: () => def, heldenlevel: () => 30 });
  let st = {}; const wer = (kk) => (QB.figurQuest(L, (id) => st[id] || "", "othmar", kk) || {}).id;
  st = { [QUEST1.id]: "fertig" }; check(wer(k()) === QUEST1.id, "nur Quest 1 fertig, B3 nicht von Othmar zu haben: Quest 1 spricht");
  st = { [QUEST1.id]: "fertig", [QUEST_B3.id]: "auftrag_" + ((1 << QUEST_B3.schritte.length) - 1) }; check(wer(k(["karrenbrief"])) === QUEST_B3.id, "B3 läuft, alles erledigt, Karrenbrief dabei: B3 spricht (Abgabe)");
  check(QB.zeichenAlle(L, (id) => st[id] || "", "othmar") === "?", "dann steht „?“ über Othmar");
  st = { [QUEST1.id]: "fertig", [QUEST_B3.id]: "fertig" }; check(wer(k([], 20)) === QUEST_B4.id, "B3 fertig, Defense 20: B4 bietet sich an");
  check(wer(k([], 10)) === QUEST_B3.id, "ohne Defense 20: die zuletzt abgeschlossene (B3) spricht");
  st = { [QUEST1.id]: "fertig", [QUEST_B3.id]: "fertig", [QUEST_B4.id]: "auftrag_0" }; check(wer(k()) === QUEST_B4.id, "B4 läuft (Othmar nur mit Standard-Rede): B4 spricht");
  st = { [QUEST1.id]: "fertig", [QUEST_B3.id]: "fertig", [QUEST_B4.id]: "fertig" }; check(wer(k()) === QUEST_B4.id, "alles fertig: die letzte Quest der Liste spricht");
  /* Abschluss mit Wahl (B4): vier Antworten, jede schließt ab und gibt eine andere Waffe */
  const alle = "auftrag_" + ((1 << QUEST_B4.schritte.length) - 1), kk = k(["rabenbrief", "silberleuchter"]), d = QB.dialog(QUEST_B4, "othmar", alle, kk), wahl = ["wahl_schwert", "wahl_zweihaender", "wahl_bogen", "wahl_stab"];
  const folgen = wahl.map((a) => QB.antwort(QUEST_B4, "othmar", alle, a, kk));
  check(wahl.every((a) => d.antworten.some((x) => x.id === a)) && folgen.every((f) => f && f.abschluss && f.geben && f.geben.length === 1) && new Set(folgen.map((f) => f.geben[0].g)).size === 4, "Abschluss mit Wahl: vier Antworten, jede schließt ab und gibt eine andere Waffe"); }

console.log("\nFolgen (Regel, #54 – auch für Befreite und das Rabenküken)");
{ const F = new Folger("Ben"), ich = { x: 0, y: 0 };
  const t1 = F.schritt(0.5, ich, { x: 6, y: 0 }); check(t1.tun === "gehen" && Math.abs(t1.x - 4.5) < 1e-9 && t1.y === 0, "weit weg: ein Laufziel 1,5 Felder vor dem Ziel");
  check(F.schritt(0.1, ich, { x: 6, y: 0 }).tun === "warten", "dazwischen: im Takt (0,4 s) kein neues Ziel");
  check(folgePunkt({ x: 4.5, y: 0 }, { x: 6, y: 0 }) === null, "nah genug: stehen bleiben");
  check(F.schritt(0.5, ich, null).tun === "ende" && F.schritt(0.5, ich, null).grund === "weg", "Ziel nicht mehr da: Ende („weg“)");
  check(new Folger("B").schritt(0.5, ich, { x: 1, y: 1 }, false).grund === "kein_weg", "kein Weg: Ende („Kein Weg zu …“)");
  const G = new Folger("B"); G.schritt(0.5, ich, { x: 3, y: 0 }); check(G.schritt(0.05, ich, { x: 30, y: 0 }).grund === "sprung", "das Ziel springt weit (Teleport): Ende, kein Hinterherteleportieren");
  check(new Folger("B").schritt(0.5, ich, { x: 60, y: 0 }).grund === "weit", "zu weit weg: Ende"); }

console.log(f ? `\nPhase 4: ${f} FEHLER` : "\nPhase 4: alles in Ordnung");
process.exit(f ? 1 : 0);
