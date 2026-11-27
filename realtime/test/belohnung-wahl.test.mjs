/*
 * Riftmere – Belohnung zur Auswahl (#146), ohne Server-Prozess und ohne Supabase (nachgebildeter Zugriff, wie abholen.test.mjs):
 * QuestDef.belohnung.wahl erscheint in lohnListe als eigene Zeile; „Okay“ ohne oder mit falscher Wahl bucht nichts, mit gültiger Wahl genau einmal
 * und nur den gewählten Gegenstand; Regel des Nutzers: jede Wahl gibt es auch anders (Beute, Laden, Herstellen) – geprüft für alle Quests und Entwürfe.
 * Aufruf (im Ordner realtime): node test/belohnung-wahl.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-wahl-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * as QM from "./server/src/questmotor"; export * as I from "./server/src/inventar"; export * as QB from "./shared/questbau"; export { QUEST2 } from "./shared/quest02"; export { QUESTS } from "./shared/quests"; export { ENTWUERFE } from "./shared/quest_entwuerfe"; export * as BW from "./shared/belohnungswahl";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { QM, I, QB, QUEST2, QUESTS, ENTWUERFE, BW } = await import(datei);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
const ABSCHLUSS = []; let ROW = [];
const sb = async (pfad, init) => { const b = init && init.body ? JSON.parse(init.body) : {}; if (pfad.includes("quest_abschluss_v2")) { ABSCHLUSS.push(b); return true; }
  if (pfad.includes("quest_setzen")) return true; if (pfad.includes("rpg_held?")) return ROW; return null; };
const Q = QUEST2, ALLE = QB.stand({ phase: "laeuft", bits: (1 << Q.schritte.length) - 1, z: Q.schritte.filter((x) => x.anzahl).map((x) => x.anzahl), angeboten: true }), ODO = Q.figuren.find((x) => x.id === "odo");
Q.belohnung = { ...(Q.belohnung || {}), wahl: [{ g: "heiltrank", n: 2 }, { g: "holzbeil_einfach" }] }; /* für den Test: zwei Gegenstände zur Auswahl, beide gibt es im Laden */
async function held(n) { ROW = [{ waffe: "schwert", inventar: { angelegt: {}, rucksack: [], v: 2 } }]; await I.inventarLaden(sb, n); QM.staendeLaden(n, { [Q.id]: { s: ALLE } }, sb); }
const abschliessen = async (n) => { QM.motorReden(sb, n, "odo", ODO.x, ODO.y); return QM.motorAntworten(sb, n, "odo", "lohn", { x: ODO.x, y: ODO.y }); };

console.log("\nDaten");
{ const Z = QB.lohnListe(Q).find((z) => z.art === "wahl"); check(Z && Z.optionen.length === 2 && Z.optionen[0].g === "heiltrank" && Z.optionen[0].n === 2 && Z.optionen[1].n === 1, "lohnListe: die Auswahl als eigene Zeile (art „wahl“, mit Anzahl)"); }

console.log("\nAbholen mit Wahl");
await held("anna"); await abschliessen("anna");
{ const r = await QM.motorAbholen(sb, "anna", Q.id); check(r.fehler && r.wahlFehlt && !ABSCHLUSS.length && QM.qStand("anna", Q.id) === "abholbereit", "ohne Wahl: nichts gebucht, der Lohn wartet weiter"); }
{ const r = await QM.motorAbholen(sb, "anna", Q.id, undefined, "rabenschwinge"); check(r.fehler && !ABSCHLUSS.length && I.anzahlVon("anna", "rabenschwinge") === 0, "eine Wahl, die nicht angeboten ist: nichts gebucht"); }
{ const r = await QM.motorAbholen(sb, "anna", Q.id, undefined, "heiltrank");
  check(r.abgeholt === Q.id && r.gewaehlt === "heiltrank" && ABSCHLUSS.length === 1 && I.anzahlVon("anna", "heiltrank") === 2 && I.anzahlVon("anna", "holzbeil_einfach") === 0 && QM.qStand("anna", Q.id) === "fertig", "gültige Wahl: eine Buchung, nur der gewählte Gegenstand (2 Heiltränke)");
  const r2 = await QM.motorAbholen(sb, "anna", Q.id, undefined, "holzbeil_einfach"); check(r2.schon && ABSCHLUSS.length === 1 && I.anzahlVon("anna", "holzbeil_einfach") === 0, "danach nichts doppelt, auch nicht mit anderer Wahl"); }

console.log("\nRegel: jede Wahl gibt es auch anders");
check(BW.andererWeg("heiltrank") && BW.andererWeg("barren_kupfer") && BW.andererWeg("rabenfedern") && !BW.andererWeg("rabenkapuze") && !BW.andererWeg("kloeppel"), "Laden, Herstellen und Beute zählen; Questlohn und Quest-Rezepte nicht");
check(BW.wahlPruefen({ id: "x", belohnung: { wahl: [{ g: "rabenkapuze" }, { g: "heiltrank" }] } }).length === 1 && BW.wahlPruefen({ id: "x", belohnung: { wahl: [{ g: "heiltrank" }] } }).length === 1, "Prüfer meldet: nur aus der Quest · nur eine Wahl");
{ const fehler = [...QUESTS, ...ENTWUERFE.map((e) => e.q)].filter((q) => q !== Q).flatMap(BW.wahlPruefen); check(!fehler.length, `alle Quests und Entwürfe halten die Regel ein (${fehler.join("; ") || "keine Verstöße"})`); }

console.log(f ? `\nBelohnung zur Auswahl: ${f} FEHLER` : "\nBelohnung zur Auswahl: alles in Ordnung");
process.exit(f ? 1 : 0);
