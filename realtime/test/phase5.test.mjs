/*
 * Riftmere – Phase 5a/5b/5d (Issue #43), ohne Browser und ohne Supabase (nachgebildeter Zugriff):
 * 5a Gegenstände mit eigenen Daten (Stapeln, Anlegen/Ablegen, Tauschen, Bank, Boden, alter Speicherstand, Questlohn gebunden, Handel-Regel),
 * 5b geladene Waffen (Laden nur am Bindestein mit passender Stufe und Seltenheit, Resonanz, Höchstzahl, Entladen verwirft, +10 % im Kampf,
 *    eine Ladung je Angriff – auch bei Fehlschlag, leer = normal, nicht ablegbar und nicht handelbar),
 * 5d Set-Bonus im Kampf (nur 3/3, nie über das Leben, nur bei Schaden, Häufigkeit ≈ 15 %).
 * Aufruf (im Ordner realtime): node test/phase5.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-phase5-${process.pid}.mjs`);
process.env.HANDWERK_GLUT = "0";
await build({ stdin: { contents: 'export * as I from "./server/src/inventar"; export * as HW from "./server/src/handwerk"; export * from "./shared/gegenstaende"; export * from "./shared/kampfwerte"; export * from "./shared/splitterbinden"; export { STATIONEN } from "./shared/handwerk"; export { Sim } from "./shared/sim"; export { MONSTER } from "./shared/config"; export * from "./shared/karte"; export { KARTEN, FEIN } from "./shared/karten";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const M = await import(datei);
const { I, HW, handelbar, ablegbar, anzeigeName, geladen, kampfwerte, xpFuer, NULL_XP, STATIONEN, WAFFE_LADUNG_MAX, Sim, MONSTER, setzeKarte, KARTEN, FEIN, fels } = M;
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
let gespeichert = null; const sb = async (pfad, init) => { if (/rpg_held_inventar_setzen/.test(pfad)) gespeichert = JSON.parse(init.body).p_inventar; return pfad.includes("rpg_held?") ? ROW : null; };
let ROW = [];
const laden = async (nutzer, inventar) => { ROW = [{ waffe: "schwert", inventar }]; const e = await I.inventarLaden(sb, nutzer); return e; };
const rs = (n) => I.inventarVon(n).rucksack;

console.log("\n5a · Gegenstände mit eigenen Daten");
{ const alt = { angelegt: { waffe: "ritterschwert" }, rucksack: ["eidschwert", { g: "splitter", n: 40 }, { g: "heiltrank", n: 2 }], v: 2 };
  await laden("alt", alt); const r = rs("alt");
  check(r[0] === "eidschwert" && r[1].g === "splitter" && r[1].n === 40 && !r[1].d && I.inventarVon("alt").angelegt.waffe === "ritterschwert", "alter Speicherstand (ohne Daten) lädt unverändert");
  await laden("neu", { angelegt: { waffe: "eidschwert" }, angelegtD: { waffe: { ladungen: 50 } }, rucksack: [{ g: "mondkurzbogen", n: 1, d: { ladungen: 7 } }, { g: "heiltrank", n: 3, d: { ladungen: 9, gebunden: true } }, { g: "apfel", n: 1, d: { quatsch: 1 } }], v: 2 });
  const n = I.inventarVon("neu"); check(n.angelegtD.waffe.ladungen === 50 && n.rucksack[0].d.ladungen === 7, "Daten am Exemplar bleiben erhalten (angelegt und Rucksack)");
  check(n.rucksack[1].d && n.rucksack[1].d.gebunden && !n.rucksack[1].d.ladungen, "Ladungen nur an Waffen ab Selten – am Trank fallen sie weg, gebunden bleibt");
  check(!n.rucksack[2] || typeof n.rucksack[2] === "string" || !n.rucksack[2].d, "unbekannte Felder in den Daten fallen weg"); }
{ await laden("st", { angelegt: {}, rucksack: [], v: 2 });
  I.aufnehmen(sb, "st", "heiltrank", 2); I.aufnehmen(sb, "st", "heiltrank", 3, true, { gebunden: true }); I.aufnehmen(sb, "st", "heiltrank", 1, true, { gebunden: true }); I.aufnehmen(sb, "st", "heiltrank", 1);
  const r = rs("st"); check(r.length === 2 && r[0].n === 3 && !r[0].d && r[1].n === 4 && r[1].d.gebunden, `Stapeln nur bei gleichen Daten (frei 3, gebunden 4 – ${r.length} Fächer)`);
  check(I.anzahlVon("st", "heiltrank") === 7, "Anzahl zählt alle Fächer");
  I.aufnehmen(sb, "st", "eidschwert", 1, true, { ladungen: 5 }); I.aufnehmen(sb, "st", "eidschwert", 1, true, { ladungen: 5 });
  check(rs("st").filter((x) => (x.g || x) === "eidschwert").length === 2, "geladene Waffen belegen je ein eigenes Fach");
  const i = rs("st").findIndex((x) => x.g === "eidschwert"); check(I.tauschen(sb, "st", i, 0) === null && rs("st")[0].d.ladungen === 5, "Tauschen behält die Daten");
  check(I.anlegen(sb, "st", 0) === null && I.inventarVon("st").angelegt.waffe === "eidschwert" && I.inventarVon("st").angelegtD.waffe.ladungen === 5, "Anlegen nimmt die Daten mit");
  check(I.ablegen(sb, "st", "waffe") === null && rs("st").some((x) => x.g === "eidschwert" && x.d.ladungen === 5) && !I.inventarVon("st").angelegtD, "Ablegen bringt sie zurück in den Rucksack");
  const k = rs("st").findIndex((x) => x.g === "eidschwert"); const h = I.herausnehmen(sb, "st", k);
  check(h && h.fehler && /geladene Waffe/.test(h.fehler) && rs("st")[k].g === "eidschwert", "eine geladene Waffe lässt sich nicht auf den Boden legen");
  check(!handelbar("eidschwert", { ladungen: 5 }) && !handelbar("heiltrank", { gebunden: true }) && handelbar("heiltrank") && !ablegbar("eidschwert", { ladungen: 1 }) && ablegbar("eidschwert"), "Handel-Regel: geladen und gebunden nicht handelbar, sonst ja");
  const NAME = M.GEGENSTAENDE.eidschwert.name; check(anzeigeName("eidschwert", { ladungen: 5 }) === NAME + " (s)" && anzeigeName("eidschwert") === NAME, `Anzeige: geladene Waffen heißen „${NAME} (s)“`);
  /* Bank: eigenes Fach für Daten, zurück mit Daten */
  check(I.bankEinzahlen(sb, "st", "eidschwert", 0) === null, "Bank: geladene Waffen einzahlen (erlaubt)");
  const B = I.inventarVon("st").bank; check(B.filter((b) => b[0] === "eidschwert").length === 1 && B.find((b) => b[0] === "eidschwert")[1] === 2 && B.find((b) => b[0] === "eidschwert")[2].ladungen === 5, "gleiche Daten: ein Bankfach (2 Stück, 5 Ladungen)");
  I.aufnehmen(sb, "st", "eidschwert", 1, true, { ladungen: 9 }); I.bankEinzahlen(sb, "st", "eidschwert", 0); const B2 = I.inventarVon("st").bank.filter((b) => b[0] === "eidschwert");
  check(B2.length === 2, "andere Daten: eigenes Bankfach");
  const fach = I.inventarVon("st").bank.findIndex((b) => b[0] === "eidschwert" && b[2].ladungen === 9); check(I.bankAbheben(sb, "st", "eidschwert", 1, fach) === null && rs("st").some((x) => x.g === "eidschwert" && x.d.ladungen === 9), "Abheben (mit Bankfach) bringt die Daten mit");
  check(gespeichert === null || typeof gespeichert === "object", "gespeichert wird das ganze Inventar samt Daten (JSON, Migration 043 – keine neue Migration nötig)"); }
{ const b = I.bodenDazu("waldmark", 6450, 6680, "heiltrank", 1, "boden_a", I.FALLEN, 1000, { gebunden: true });
  check(b && b.d.gebunden && I.bodenSicht("waldmark", "boden_b", 1000 + I.FALLEN.privat + 1).length === 0 && I.bodenSicht("waldmark", "boden_a", 1000 + I.FALLEN.privat + 1).some((x) => x.i === b.id), "Gebundenes am Boden sieht nur der Besitzer");
  await laden("boden_a", { angelegt: {}, rucksack: [], v: 2 }); check(I.bodenAufheben(sb, "boden_a", "waldmark", b.id, 6450, 6680, 1500) === null && rs("boden_a")[0].d.gebunden, "Aufheben behält die Daten"); }

console.log("\n5b · Geladene Waffen");
const L = STATIONEN.bindestein, BEI = { nutzer: "lader", gast: false, wx: L.x, wy: L.y }, gesendet = [];
HW.handwerkEinrichten({ sb, senden: (_s, m) => gesendet.push(m) }); HW.HANDWERK_QUEST.schalter = () => true;
const arbeiten = (n = 40) => { for (let t = 1; t <= n; t++) HW.handwerkTakt(1e13 + t * 600); };
{ await laden("lader", { angelegt: { waffe: "eidschwert" }, rucksack: [{ g: "splitter", n: 100 }, { g: "seelenlicht", n: 3 }], v: 2, berufe: { splitterbinden: xpFuer(19) } });
  check(/Splitterbinden 20/.test(HW.handwerkStart(BEI, "waffe_laden_selten", 10) || ""), "Splitterbinden 19: eine seltene Waffe lässt sich noch nicht laden");
  I.berufXpDazu(sb, "lader", "splitterbinden", xpFuer(20) - xpFuer(19));
  check(/Geh näher/.test(HW.handwerkStart({ ...BEI, wx: L.x + 20 }, "waffe_laden_selten", 10) || ""), "nur am Bindestein");
  I.berufXpDazu(sb, "lader", "splitterbinden", xpFuer(40) - xpFuer(20)); check(/epische/.test(HW.handwerkStart(BEI, "waffe_laden_episch", 10) || ""), "das Rezept muss zur Seltenheit der Waffe passen (Splitterbinden 40, seltene Waffe)");
  const xp0 = I.berufXp("lader", "splitterbinden");
  check(HW.handwerkStart(BEI, "waffe_laden_selten", 10) === null, "Splitterbinden 20, seltene Waffe angelegt, am Bindestein: laden beginnt (10)"); arbeiten(15);
  check(I.waffeLadung("lader").n === 10 && I.anzahlVon("lader", "splitter") === 80 && I.berufXp("lader", "splitterbinden") - xp0 === 30, `10 Ladungen, 20 Splitter, 30 XP (3 je Ladung) – ${I.waffeLadung("lader").n} / ${100 - I.anzahlVon("lader", "splitter")} / ${I.berufXp("lader", "splitterbinden") - xp0}`);
  check(HW.handwerkStart(BEI, "waffe_laden_selten_licht", 3) === null, "mit Seelenlicht: 1 Splitter + 1 Seelenlicht je Ladung"); arbeiten(8);
  check(I.waffeLadung("lader").n === 13 && I.anzahlVon("lader", "seelenlicht") === 0 && I.anzahlVon("lader", "splitter") === 77, "3 Ladungen mehr, Seelenlichter verbraucht");
  const v1 = gesendet.filter((m) => m.tat === "fertig").pop(); check(v1 && v1.ladungen === 13 && v1.name === M.GEGENSTAENDE.eidschwert.name, "der Browser erfährt die Ladungen der Waffe");
  check(I.inventarVon("lader").angelegtD.waffe.ladungen === 13 && anzeigeName("eidschwert", I.inventarVon("lader").angelegtD.waffe).endsWith(" (s)"), "geladen heißt sie „… (s)“");
  /* Höchstzahl */
  I.waffeLadenDazu(sb, "lader", 5000); check(I.waffeLadung("lader").n === WAFFE_LADUNG_MAX, `höchstens ${WAFFE_LADUNG_MAX} Ladungen`);
  check(/Mehr als 1000/.test(HW.handwerkStart(BEI, "waffe_laden_selten", 1) || ""), "volle Waffe: nicht weiter laden");
  /* Kampf: +10 % */
  const X = { ...NULL_XP, geschick: xpFuer(40), staerke: xpFuer(40) }, A = { waffe: "eidschwert" }, n0 = kampfwerte(X, A, 1), g0 = kampfwerte(X, A, 1, {}, { geladen: true });
  check(g0.geladen && g0.angriff.nah > n0.angriff.nah && g0.waffe.schaden[1] >= n0.waffe.schaden[1], `geladen: Angriff ${n0.angriff.nah} → ${g0.angriff.nah}, Max Hit ${n0.waffe.schaden[1]} → ${g0.waffe.schaden[1]}`);
  check(!kampfwerte(X, {}, 1, {}, { geladen: true }).geladen, "ohne Waffe gibt es nichts zu laden");
  /* Verbrauch */
  const vor = I.waffeLadung("lader").n; I.waffeLadungVerbrauchen(sb, "lader"); check(I.waffeLadung("lader").n === vor - 1, "ein Angriff: eine Ladung weg");
  I.waffeEntladen(sb, "lader"); I.waffeLadenDazu(sb, "lader", 1); check(I.waffeLadungVerbrauchen(sb, "lader") === 0 && !I.inventarVon("lader").angelegtD && !geladen(undefined), "die letzte Ladung: die Waffe ist wieder normal");
  /* Entladen */
  I.waffeLadenDazu(sb, "lader", 20); const sp = I.anzahlVon("lader", "splitter");
  check(HW.handwerkStart(BEI, "waffe_entladen", 1) === null, "Entladen am Bindestein"); arbeiten(3);
  check(I.waffeLadung("lader").n === 0 && I.anzahlVon("lader", "splitter") === sp && !I.inventarVon("lader").angelegtD, "entladen: Ladungen weg, die Splitter verfallen (nichts zurück)");
  check(/nicht geladen/.test(HW.handwerkStart(BEI, "waffe_entladen", 1) || ""), "eine leere Waffe muss man nicht entladen"); }
{ /* Simulation: jeder Angriff ist ein „hieb“ (danach zieht der Server die Ladung ab) – auch Fehlschläge */
  setzeKarte(KARTEN.welt_nordwald, FEIN); const s = Sim.welt(3, undefined, true); s.wesen = s.wesen.filter((w) => w.held);
  let P = null; for (let y = 30; y < 120 && !P; y++) for (let x = 30; x < 120 && !P; x++) if (!fels(x, y) && !fels(x + 1, y)) P = { x: x + 0.5, y: y + 0.5 };
  const id = s.beitreten("schildwaechter", 0, P, kampfwerte({ ...NULL_XP, geschick: 0 }, { waffe: "eidschwert" }, 1, {}, { geladen: true })), h = s.nach(id);
  const m = s["neu"](false, "waldgolem", 1, { x: P.x + 1, y: P.y }, true, 0); m.lp = m.max = 1e6; m.betaeubt = 1e9; s.eingabe({ t: "ziel", id: m.id }, id);
  let hiebe = 0, treffer = 0, fehl = 0; for (let i = 0; i < 20 * 60; i++) { s.schritt(); for (const e of s.zustand().ev) { if (e.a === "hieb" && e.id === id) hiebe++; if (e.id === m.id && e.a === "schaden") treffer++; if (e.id === m.id && (e.a === "block" || e.a === "null")) fehl++; } }
  check(hiebe > 10 && fehl > 0 && hiebe === treffer + fehl, `jeder Angriff meldet „hieb“ – ${hiebe} Angriffe = ${treffer} Treffer + ${fehl} Fehlschläge (je eine Ladung)`); void h; }

console.log("\n5d · Set-Bonus im Kampf");
{ const RABE = { kopf: "rabenkapuze", brust: "rabenpanzer", beine: "rabenbeinschuetzer" }, X = { ...NULL_XP, defense: xpFuer(20), lp: xpFuer(60) };
  check(kampfwerte(X, RABE).set && kampfwerte(X, RABE).set.chance === 0.15, "alle drei Teile: Set-Bonus aktiv (15 %, 50 %)");
  check(!kampfwerte(X, { kopf: "rabenkapuze", brust: "rabenpanzer" }).set, "zwei von drei: kein Bonus");
  setzeKarte(KARTEN.welt_nordwald, FEIN); const s = Sim.welt(9, undefined, true); s.wesen = s.wesen.filter((w) => w.held);
  let P = null; for (let y = 30; y < 120 && !P; y++) for (let x = 30; x < 120 && !P; x++) if (!fels(x, y) && !fels(x + 1, y)) P = { x: x + 0.5, y: y + 0.5 };
  const id = s.beitreten("schildwaechter", 0, P, kampfwerte(X, RABE)), h = s.nach(id); s.eingabe({ t: "auto", an: false }, id);
  const m = s["neu"](false, "waldgolem", 1, { x: P.x + 1, y: P.y }, true, 0); m.lp = m.max = 1e6; m.zielId = id; m.wach = true;
  let schaeden = 0, heil = 0, ueber = false; for (let i = 0; i < 20 * 20000 && schaeden < 600; i++) { if (h.lp < h.max * 0.3) h.lp = h.max - 1; s.schritt(); for (const e of s.zustand().ev) { if (e.id !== id) continue; if (e.a === "schaden") schaeden++; if (e.a === "heil") heil++; } if (h.lp > h.max) ueber = true; if (h.tot) break; }
  const q = heil / Math.max(1, schaeden);
  check(schaeden >= 600 && Math.abs(q - 0.15) < 0.045, `über ${schaeden} Treffer heilt der Bonus ${heil}-mal (${(q * 100).toFixed(1)} %, soll ≈ 15 %)`);
  check(!ueber, "nie über das maximale Leben"); }

console.log(f ? `\nPhase 5: ${f} FEHLER` : "\nPhase 5: alles in Ordnung");
process.exit(f ? 1 : 0);
