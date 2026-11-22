/*
 * Mythara – Inventar, Drop-Tabellen und Gegenstände am Boden ohne Server-Verbindung:
 * Beute-Besitzer (meister Schaden, bei Gleichstand letzter Schlag), Sichtbarkeit und Zeiten am Boden (Beute 30 s privat + 5 min, fallen gelassen 1 min privat + 10 min),
 * Aufheben (nur Sichtbares, nur nah, voller Rucksack), Inventar-Aktionen und Speichern (server/src/inventar.ts).
 * Aufruf: node test/inventar.test.mjs   (nach node build.mjs)
 */
import { build } from "esbuild"; import { fileURLToPath } from "node:url"; import path from "node:path"; import fs from "node:fs";
import { Sim, KARTEN, FEIN, setzeKarte, MONSTER, kampfwerte, startAusruestung, NULL_XP } from "./sim.gebaut.mjs";
const HIER = path.dirname(fileURLToPath(import.meta.url)), AUS = path.join(HIER, "inventar.gebaut.mjs");
await build({ entryPoints: [path.join(HIER, "..", "server", "src", "inventar.ts")], bundle: true, platform: "node", format: "esm", outfile: AUS, logLevel: "error" });
const I = await import(AUS + "?" + Date.now()); fs.unlinkSync(AUS);
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };

/* 1. Drop-Tabelle in der Simulation: Besitzer = meister Schaden, bei Gleichstand der letzte Schlag */
setzeKarte(KARTEN.kreuzwald, FEIN); const B = MONSTER.bandit_dolch, alt = B.drops;
check(!alt || alt.length === 0, "Der Bandit hat noch keine Drop-Tabelle (kommt vom Spielleiter)");
B.drops = [{ g: "ritterschwert", chance: 100 }, { g: "rundschild", chance: 100, anzahl: [2, 2] }, { g: "hirtenstab", chance: 0 }];
function kampf(schlaege, seed = 4) { /* schlaege: [heldIndex, schaden] nacheinander; der letzte tötet */
  const s = Sim.welt(seed, undefined, true), b = s.wesen.find((w) => !w.held && /bandit/.test(w.typ)); for (const g of s.wesen.filter((w) => !w.held)) { g.streifT = 1e9; g.x = g.heim.x = 5; g.y = g.heim.y = 150; }
  b.x = b.heim.x = 112; b.y = b.heim.y = 6; const h = [0, 1].map((i) => s.nach(s.beitreten("schildwaechter", 0, { x: 110 + i, y: 6 + i }, kampfwerte({ ...NULL_XP }, startAusruestung("schwert")))));
  let ev = []; b.lp = schlaege.reduce((n, [, m]) => n + m, 0); for (const [i, m] of schlaege) { s.abziehen(b, m, h[i]); ev = ev.concat(s.zustand().ev); }
  return { beute: ev.find((e) => e.a === "beute"), h, b }; }
{ const { beute, h } = kampf([[0, 10], [1, 4], [1, 3]]); check(beute && beute.besitzer === h[0].id, `Meister Schaden (10 gegen 7): die Beute gehört dem ersten Helden, nicht dem mit dem letzten Schlag`);
  check(beute && JSON.stringify(beute.g) === JSON.stringify([["ritterschwert", 1], ["rundschild", 2]]), `Jeder Eintrag würfelt einzeln (100 %, Anzahl 2, 0 % fällt nie): ${beute && JSON.stringify(beute.g)}`); }
{ const { beute, h } = kampf([[0, 6], [1, 6]]); check(beute && beute.besitzer === h[1].id, "Gleich viel Schaden (6 gegen 6): die Beute gehört dem mit dem letzten Schlag"); }
{ const { beute, h } = kampf([[1, 6], [0, 6]]); check(beute && beute.besitzer === h[0].id, "… auch andersherum"); }
B.drops = [{ g: "ritterschwert", chance: 50 }]; { let n = 0; for (let i = 0; i < 400; i++) { const { beute } = kampf([[0, 5]], 100 + i); if (beute) n++; } check(n > 160 && n < 240, `Chance 50 %: ${n} von 400 Banditen ließen etwas fallen`); }
B.drops = alt;

/* 2. Inventar mit nachgebildeter Datenbank */
const DB = { "u-anna": { waffe: "schwert", inventar: null }, "u-ben": { waffe: "bogen", inventar: { angelegt: { waffe: "jagdbogen", brust: "unbekannt" }, rucksack: ["hirtenstab", "gibtsnicht"] } } }, gespeichert = [];
const sb = async (pfad, init) => { if (pfad.startsWith("/rest/v1/rpg_held?")) { const u = /user_id=eq\.([^&]+)/.exec(pfad)[1]; return DB[u] ? [DB[u]] : []; }
  if (pfad === "/rest/v1/rpc/rpg_held_inventar_setzen") { const a = JSON.parse(init.body); gespeichert.push(a); DB[a.p_user].inventar = a.p_inventar; return true; } throw new Error("unbekannt " + pfad); };
const anna = await I.inventarLaden(sb, "u-anna"), ben = await I.inventarLaden(sb, "u-ben");
check(JSON.stringify(anna.inv) === JSON.stringify({ angelegt: { waffe: "ritterschwert", nebenhand: "rundschild" }, rucksack: [] }), "Ohne gespeichertes Inventar: aus der Startwaffe (Schwert und Schild)");
check(JSON.stringify(ben.inv) === JSON.stringify({ angelegt: { waffe: "jagdbogen" }, rucksack: ["hirtenstab"] }), "Gespeichertes Inventar wird geprüft: Unbekanntes fällt weg");
check(await I.inventarLaden(sb, "u-niemand") === null, "Ohne eigenen Helden: kein Inventar");
const gesehen = []; I.inventarHoeren("u-anna", (inv) => gesehen.push(inv));
check(I.ablegen(sb, "u-anna", "nebenhand") === null && JSON.stringify(I.inventarVon("u-anna")) === JSON.stringify({ angelegt: { waffe: "ritterschwert" }, rucksack: ["rundschild"] }), "Ablegen: der Schild wandert in den Rucksack");
check(I.anlegen(sb, "u-anna", 0) === null && I.inventarVon("u-anna").angelegt.nebenhand === "rundschild", "Anlegen aus dem Rucksack");
check(I.anlegen(sb, "u-anna", 5) !== null && I.ablegen(sb, "u-anna", "brust") !== null, "Unsinnige Bitten werden abgelehnt (leerer Platz, falsche Nummer)");
check(gesehen.length === 2, `Jede Änderung wird gemeldet (${gesehen.length})`);
await new Promise((r) => setTimeout(r, 1700)); check(gespeichert.some((g) => g.p_user === "u-anna") && DB["u-anna"].inventar && DB["u-anna"].inventar.angelegt.nebenhand === "rundschild", "Gespeichert kurz nach der letzten Änderung (rpg_held_inventar_setzen)");

/* 3. Boden: Sichtbarkeit und Zeiten */
const T = 1_000_000, W = "waldweg";
const loot = I.bodenDazu(W, 10, 10, "hirtenstab", 1, "u-anna", I.LOOT, T);
check(I.bodenSicht(W, "u-anna", T).length === 1 && I.bodenSicht(W, "u-ben", T).length === 0, "Beute: zuerst nur für den Besitzer sichtbar");
check(I.bodenSicht(W, "u-ben", T + 29_000).length === 0 && I.bodenSicht(W, "u-ben", T + 30_000).length === 1, "… nach 30 s für alle");
check(I.bodenSicht(W, "u-ben", T + 30_000 + 5 * 60_000 - 1).length === 1 && I.bodenSicht(W, "u-anna", T + 30_000 + 5 * 60_000).length === 0, "… dann noch 5 min, danach weg");
check(I.bodenSicht("waldmark", "u-anna", T).length === 0, "Nur in der eigenen Region");
const fall = I.bodenDazu(W, 50, 50, "ritterschwert", 1, "u-ben", I.FALLEN, T);
check(I.bodenSicht(W, "u-anna", T + 59_000).every((d) => d.i !== fall.id) && I.bodenSicht(W, "u-anna", T + 60_000).some((d) => d.i === fall.id), "Fallen gelassen: 1 min nur für einen selbst, dann für alle");
check(I.bodenSicht(W, "u-anna", T + 60_000 + 10 * 60_000 - 1).some((d) => d.i === fall.id) && !I.bodenSicht(W, "u-anna", T + 60_000 + 10 * 60_000).some((d) => d.i === fall.id), "… dann 10 min für alle, danach weg");
const gast = I.bodenDazu(W, 70, 70, "hirtenstab", 1, "", I.LOOT, T); check(I.bodenSicht(W, "u-ben", T).some((d) => d.i === gast.id), "Beute ohne Besitzer (Gast hat gesiegt): sofort für alle");
/* 4. Aufheben */
check(/nicht/.test(I.bodenAufheben(sb, "u-ben", W, loot.id, 10, 10, T)), "Ben kann Annas Beute in den ersten 30 s nicht aufheben");
check(/weit/.test(I.bodenAufheben(sb, "u-anna", W, loot.id, 14, 10, T)), "Zu weit weg (4 Felder): abgelehnt");
const vor = I.inventarVon("u-anna").rucksack.length;
check(I.bodenAufheben(sb, "u-anna", W, loot.id, 11, 10, T) === null && I.inventarVon("u-anna").rucksack.length === vor + 1 && !I.bodenSicht(W, "u-anna", T).some((d) => d.i === loot.id), "Anna hebt ihre Beute auf: im Rucksack, vom Boden verschwunden");
for (let i = 0; i < 30; i++) I.aufnehmen(sb, "u-anna", "hirtenstab", 1);
check(I.inventarVon("u-anna").rucksack.length === 24, "Der Rucksack fasst 24 Gegenstände");
check(/voll/.test(I.bodenAufheben(sb, "u-anna", W, gast.id, 70, 70, T)) && I.bodenSicht(W, "u-anna", T).some((d) => d.i === gast.id), "Voller Rucksack: nichts aufgehoben, es bleibt liegen");
const g = I.herausnehmen(sb, "u-anna", 0); check(g && I.inventarVon("u-anna").rucksack.length === 23, `Herausnehmen zum Fallenlassen (${g})`);
I.bodenAufraeumen(T + 20 * 60_000); check(I.bodenAlle().length === 0, "Abgelaufenes wird weggeräumt");
console.log(f ? `${f} Prüfung(en) fehlgeschlagen` : "Inventar und Beute: alles in Ordnung"); process.exit(f ? 1 : 0);
