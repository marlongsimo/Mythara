/*
 * Riftmere – Quest-Abschluss mit Abholen (#77), ohne Server-Prozess und ohne Supabase (nachgebildeter Zugriff):
 * nach dem letzten Schritt ist die Quest „abholbereit“ (zählt als abgeschlossen), „Okay“ (abholen) bucht genau einmal über rpg_held_quest_abschluss_v2,
 * doppeltes Okay bucht nichts doppelt, nach dem Einloggen wartet der Lohn weiter, voller Rucksack → der Rest liegt gebunden am Boden (nur für den Besitzer),
 * ein Fehler beim Buchen lässt den Lohn abholbar, schon in der Datenbank gebucht → nichts doppelt.
 * Aufruf (im Ordner realtime): node test/abholen.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-abholen-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * as QM from "./server/src/questmotor"; export * as I from "./server/src/inventar"; export * as QB from "./shared/questbau"; export { QUEST2 } from "./shared/quest02"; export { QUESTS } from "./shared/quests";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { QM, I, QB, QUEST2 } = await import(datei);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
/* nachgebildetes Supabase: Abschlüsse zählen, Antwort einstellbar */
const ABSCHLUSS = [], GESETZT = []; let antwort = true, ROW = [];
const sb = async (pfad, init) => { const b = init && init.body ? JSON.parse(init.body) : {};
  if (pfad.includes("quest_abschluss_v2")) { if (antwort === "fehler") throw new Error("Supabase 500 kaputt"); ABSCHLUSS.push(b); return antwort; }
  if (pfad.includes("quest_setzen")) { GESETZT.push(b); return true; } if (pfad.includes("rpg_held?")) return ROW; return null; };
const Q = QUEST2, ALLE = QB.stand({ phase: "laeuft", bits: (1 << Q.schritte.length) - 1, z: Q.schritte.filter((x) => x.anzahl).map((x) => x.anzahl), angeboten: true }), ODO = Q.figuren.find((x) => x.id === "odo");
Q.belohnung = { ...(Q.belohnung || {}), gegenstaende: [{ g: "heiltrank", n: 3 }] }; /* für den Test auch ein Gegenstand im Lohn */
async function held(n, rucksack = []) { ROW = [{ waffe: "schwert", inventar: { angelegt: {}, rucksack, v: 2 } }]; await I.inventarLaden(sb, n); QM.staendeLaden(n, { [Q.id]: { s: ALLE } }, sb); }
const abschliessen = async (n) => { const r = QM.motorReden(sb, n, "odo", ODO.x, ODO.y); if (r.fehler) return r; return QM.motorAntworten(sb, n, "odo", "lohn", { x: ODO.x, y: ODO.y }); };

console.log("\nAbschluss und Abholen");
await held("anna"); const a = await abschliessen("anna");
check(a.abholen === Q.id && QM.qStand("anna", Q.id) === "abholbereit", `letzter Schritt: die Quest ist abgeschlossen, der Lohn wartet (${QM.qStand("anna", Q.id)})`);
check(ABSCHLUSS.length === 0 && !a.splitter && !a.belohnung && I.anzahlVon("anna", "splitter") === 0, "vor „Okay“ ist nichts gebucht und nichts im Rucksack");
check(GESETZT.some((g) => g.p_user === "anna" && g.p_stand === "abholbereit"), "der Stand „abholbereit“ ist gespeichert (übersteht einen Verbindungsabbruch)");
check(QB.lage(Q, QM.qStand("anna", Q.id)).phase === "fertig" && QM.abholbereitListe("anna").includes(Q.id), "abholbereit zählt als abgeschlossen (für andere Quests und Schalter)");
const r1 = await QM.motorAbholen(sb, "anna", Q.id);
check(r1.abgeholt === Q.id && !r1.schon && ABSCHLUSS.length === 1 && QM.qStand("anna", Q.id) === "fertig", "„Okay“: genau eine Buchung über rpg_held_quest_abschluss_v2, Stand fertig");
check(I.anzahlVon("anna", "splitter") === 20 && I.anzahlVon("anna", "heiltrank") === 3 && r1.splitter === 20 && r1.gegenstaende.length === 1, "Splitter und Gegenstände im Rucksack");
check(I.inventarVon("anna").rucksack.some((x) => x.g === "heiltrank" && x.d && x.d.gebunden) && !I.inventarVon("anna").rucksack.some((x) => x.g === "splitter" && x.d), "Gegenstände aus dem Lohn sind gebunden, Splitter nicht");
check(r1.punkte === Q.punkte && r1.gesamtPunkte === QM.questpunkte("anna"), `Questpunkte: +${r1.punkte}, gesamt ${r1.gesamtPunkte}`);
const r2 = await QM.motorAbholen(sb, "anna", Q.id); check(r2.schon && ABSCHLUSS.length === 1 && I.anzahlVon("anna", "splitter") === 20, "doppeltes „Okay“: nichts doppelt");
const zweimal = await Promise.all([held("ben").then(() => abschliessen("ben")).then(() => Promise.all([QM.motorAbholen(sb, "ben", Q.id), QM.motorAbholen(sb, "ben", Q.id)]))]);
check(ABSCHLUSS.filter((x) => x.p_user === "ben").length === 1 && I.anzahlVon("ben", "splitter") === 20, "zwei „Okay“ gleichzeitig: eine Buchung"); void zweimal;

console.log("\nNach dem Einloggen, Fehler, voller Rucksack");
await held("cora"); await abschliessen("cora"); QM.motorVergessen(); QM.staendeLaden("cora", { [Q.id]: { s: "abholbereit" } }, sb);
check(QM.qStand("cora", Q.id) === "abholbereit" && QM.abholbereitListe("cora").includes(Q.id), "neu eingeloggt: der Lohn wartet noch (das Fenster kommt wieder)");
antwort = "fehler"; const r3 = await QM.motorAbholen(sb, "cora", Q.id); antwort = true;
check(r3.fehler && QM.qStand("cora", Q.id) === "abholbereit", "Buchung schlägt fehl: Fehlertext, der Lohn bleibt abholbar");
check(!(await QM.motorAbholen(sb, "cora", Q.id)).fehler && QM.qStand("cora", Q.id) === "fertig", "nächster Versuch: gebucht");
await held("dora", Array.from({ length: 24 }, () => "ritterschwert")); await abschliessen("dora"); const r4 = await QM.motorAbholen(sb, "dora", Q.id);
const B = I.bodenAlle().filter((x) => x.besitzer === "dora");
check(r4.amBoden >= 1 && B.some((x) => x.g === "heiltrank" && x.d && x.d.gebunden), `voller Rucksack: ${r4.amBoden} Stück liegen gebunden am Boden`);
check(B.filter((x) => x.d && x.d.gebunden).every((x) => x.offenAb > Date.now() + 1e12) && B.every((x) => x.offenAb - Date.now() > 20 * 3600_000 && x.bis - Date.now() > 20 * 3600_000), "Gebundenes sieht nur der Besitzer, alles liegt einen Tag nur für ihn (auch die Splitter)");
check(I.bodenSicht("", "fremd", Date.now(), { x: ODO.x, y: ODO.y }).length === 0 && I.bodenSicht("", "dora", Date.now(), { x: ODO.x, y: ODO.y }).length >= 1, "ein anderer Spieler sieht sie nicht");
antwort = false; await held("emil"); await abschliessen("emil"); const r5 = await QM.motorAbholen(sb, "emil", Q.id);
check(r5.schon && QM.qStand("emil", Q.id) === "fertig" && I.anzahlVon("emil", "splitter") === 0, "in der Datenbank schon gebucht (false): fertig, nichts doppelt");

console.log(f ? `\nAbholen: ${f} FEHLER` : "\nAbholen: alles in Ordnung");
process.exit(f ? 1 : 0);
