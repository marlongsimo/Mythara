/*
 * Riftmere – Phase-6-Bausteine im Quest-Baukasten (Issue #49), ohne Server-Prozess und ohne Supabase (nachgebildeter Zugriff):
 * Rätsel-Reihenfolge je Spieler (beim Annehmen zufällig, im Stand gespeichert, falsch = von vorn), Gesang mit Zeitfenster (Weltuhr des Servers),
 * Figur nur sichtbar, wenn … (Ysolde), Befreite folgen (ansprechbar, wo sie gerade sind).
 * Mit einer Testquest – die echten Quests (C2, C3, D2) schreibt die Rolle Quests.
 * Aufruf (im Ordner realtime): node test/phase6-quest.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-phase6q-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * as QM from "./server/src/questmotor"; export * as I from "./server/src/inventar"; export * as QB from "./shared/questbau"; export { QUESTS } from "./shared/quests"; export * as FS from "./server/src/faehre"; export * as FA from "./shared/faehre";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { QM, I, QB, QUESTS, FS, FA } = await import(datei);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
const GESETZT = []; let ROW = [];
const sb = async (pfad, init) => { const b = init && init.body ? JSON.parse(init.body) : {}; if (pfad.includes("quest_setzen")) { GESETZT.push(b); return true; } if (pfad.includes("rpg_held?")) return ROW; return null; };

/* Testquest: Hedda gibt sie; drei Spiralsteine in Reihenfolge; ein Steinkreis singt alle 120 s für 20 s; Liske folgt nach dem Befreien bis zur Treppe; Ysolde erst danach */
const X0 = 7700, Y0 = 5600;
const stein = (id, name, dx) => ({ id, name, x: X0 + dx, y: Y0, modell: "stelle", tat: "benutzen", text: `${name} klingt.`, schon: "Still.", sonst: [] });
const Q = { id: "test_phase6", titel: "Test", ort: "test", start: "", logNeu: "neu", logFertig: "fertig", logAbgabe: "abgabe", geber: "hedda", belohnungText: "",
  figuren: [{ id: "hedda", name: "Mutter Hedda", modell: "npc.hedda", x: X0, y: Y0 - 2, blick: [0, 1] },
    { id: "liske", name: "Liske", modell: "npc.liske", x: X0 + 20, y: Y0, blick: [0, 1], folgt: { wenn: { erledigt: ["befreien"], offen: ["treppe"] } } },
    { id: "ysolde", name: "Ysolde", modell: "npc.ysolde", x: X0 - 5, y: Y0, blick: [0, 1], sichtbar: { erledigt: ["treppe"] } }],
  schritte: [
    { id: "lauschen", text: "gelauscht", log: "Lausche am Steinkreis.", ereignis: { art: "objekt", id: "kreis" } },
    { id: "steine", text: "Steine berührt", log: "Berühre die Spiralsteine: {reihe} ({n:steine}).", ereignis: { art: "objekt", id: "stein_a" }, anzahl: 3, nach: ["lauschen"] },
    { id: "befreien", text: "befreit", log: "Befreie Liske.", ereignis: { art: "antwort" }, nach: ["steine"] },
    { id: "treppe", text: "an der Treppe", log: "Bring Liske zur Treppe.", ereignis: { art: "betreten", bei: [X0 + 40, Y0, 3] }, nach: ["befreien"] }],
  objekte: [{ id: "kreis", name: "Steinkreis", x: X0 + 3, y: Y0, modell: "stelle", tat: "untersuchen", text: "Du hörst den Gesang.", schon: "Verklungen.", sonst: [], hoerbar: { alle: 120, dauer: 20, still: "Die Steine schweigen – in {sek} s singt der Orden wieder." } },
    stein("stein_a", "Erster Stein", 5), stein("stein_b", "Zweiter Stein", 6), stein("stein_c", "Dritter Stein", 7)],
  reihenfolge: { schritt: "steine", teile: ["stein_a", "stein_b", "stein_c"], namen: ["Ka", "Ro", "Wen"], falsch: "Die Steine verstummen – von vorn." },
  dialoge: { hedda: { reden: [{ zeilen: ["Hör zu: {reihe}."], antworten: ["ja"] }], optionen: [{ id: "ja", text: "Ja", folge: [{ wenn: { phase: ["neu"] }, f: { zeilen: ["Gut."], start: true } }, { f: { zeilen: ["Merk dir: {reihe}."] } }] }] },
    liske: { reden: [{ zeilen: ["Hilf mir!"], antworten: ["los"] }], optionen: [{ id: "los", text: "Komm mit", folge: [{ wenn: { erledigt: ["steine"] }, f: { zeilen: ["Ich folge dir."], erledige: ["befreien"] } }, { f: { zeilen: ["Noch nicht."] } }] }] },
    ysolde: { reden: [{ zeilen: ["Das Feuer …"], antworten: ["ok"] }], optionen: [{ id: "ok", text: "…", folge: [{ f: { zeilen: ["…"] } }] }] } } };
QUESTS.push(Q);

console.log("\nRätsel-Reihenfolge je Spieler");
{ const s1 = QB.nachFolge(Q, "", { zeilen: [], start: true }, () => 0.99), s2 = QB.nachFolge(Q, "", { zeilen: [], start: true }, () => 0.2);
  check(/_r5$/.test(s1) && /_r1$/.test(s2) && QB.gueltig(Q, s1) === s1, `beim Annehmen zufällig festgelegt und im Stand gespeichert (${s1}, ${s2})`);
  check(QB.reihe(Q, s1).join() === "stein_c,stein_b,stein_a" && QB.reihe(Q, s2).join() === "stein_a,stein_c,stein_b", "je Stand eine eigene Reihenfolge");
  const alle = new Set(); for (let r = 0; r < 6; r++) alle.add(QB.anordnung(3, r).join()); check(alle.size === 6, "alle 6 Anordnungen kommen vor");
  check(QB.einsetzen(Q, s1, "{reihe}") === "Wen – Ro – Ka", "{reihe} im Text: die Silben in dieser Reihenfolge");
  const lang = QB.stand({ phase: "laeuft", bits: 15, z: [3], angeboten: true, r: 5 }); check(lang.length <= 24 && QB.lage(Q, lang).r === 5, `der Stand passt in die Datenbank (${lang})`); }

/* Server-Motor mit einem Spieler */
async function held(n) { ROW = [{ waffe: "schwert", inventar: { angelegt: {}, rucksack: [], v: 2 } }]; await I.inventarLaden(sb, n); QM.staendeLaden(n, {}, sb); }
const H = Q.figuren[0], O = (id) => Q.objekte.find((o) => o.id === id);
await held("anna"); { const r = QM.motorReden(sb, "anna", "hedda", H.x, H.y); check(r.dialog && r.dialog.zeilen[0].text.startsWith("Hör zu:"), "Hedda spricht"); }
await QM.motorAntworten(sb, "anna", "hedda", "ja", { x: H.x, y: H.y }); const s0 = QM.qStand("anna", Q.id);
check(QB.lage(Q, s0).phase === "laeuft" && QB.lage(Q, s0).r !== undefined && GESETZT.some((g) => g.p_stand === s0), `angenommen über den Motor: Reihenfolge im gespeicherten Stand (${s0})`);

console.log("\nGesang mit Zeitfenster");
const echt = Date.now; let uhr = 120_000 * 1000 + 30_000; Date.now = () => uhr; /* 30 s nach dem letzten Gesang */
{ let t = await QM.motorObjekt(sb, "anna", "kreis", O("kreis").x, O("kreis").y); check(/schweigen – in 90 s/.test(t) && !QB.erledigt(Q, QM.qStand("anna", Q.id), "lauschen"), `außerhalb des Gesangs: nichts („${t}“)`);
  uhr += 95_000; t = await QM.motorObjekt(sb, "anna", "kreis", O("kreis").x, O("kreis").y); check(t === "Du hörst den Gesang." && QB.erledigt(Q, QM.qStand("anna", Q.id), "lauschen"), "während des Gesangs (alle 2 min für 20 s): gelauscht");
  check(QB.hoerbarJetzt(O("kreis"), 0) && QB.hoerbarJetzt(O("kreis"), 19.9) && !QB.hoerbarJetzt(O("kreis"), 20) && QB.hoerbarIn(O("kreis"), 30) === 90, "das Fenster für den Browser: hoerbarJetzt / hoerbarIn"); }
Date.now = echt;

console.log("\nSteine in Reihenfolge");
{ const R = QB.reihe(Q, QM.qStand("anna", Q.id)), tippe = (id) => QM.motorObjekt(sb, "anna", id, O(id).x, O(id).y);
  await tippe(R[0]); check(QB.zaehler(Q, QM.qStand("anna", Q.id), "steine") === 1, "der erste richtige Stein zählt");
  const t = await tippe(R[2]); check(t === "Die Steine verstummen – von vorn." && QB.zaehler(Q, QM.qStand("anna", Q.id), "steine") === 0 && QB.lage(Q, QM.qStand("anna", Q.id)).r !== undefined, "falscher Stein: von vorn (die Reihenfolge bleibt)");
  for (const id of R) await tippe(id); check(QB.erledigt(Q, QM.qStand("anna", Q.id), "steine"), `richtige Reihenfolge (${R.join(" → ")}): erledigt`); }

console.log("\nBefreite folgen, Figur nur sichtbar wenn …");
{ const L = Q.figuren[1], Y = Q.figuren[2];
  check(QM.motorReden(sb, "anna", "ysolde", Y.x, Y.y).fehler === "Hier ist niemand." && !QB.figurDa(Q, Y, QM.qStand("anna", Q.id)), "Ysolde ist vorher nicht da (nicht ansprechbar)");
  check(/näher/.test(QM.motorReden(sb, "anna", "liske", X0, Y0).fehler || ""), "Liske noch im Käfig: nur aus der Nähe ansprechbar");
  QM.motorReden(sb, "anna", "liske", L.x, L.y); await QM.motorAntworten(sb, "anna", "liske", "los", { x: L.x, y: L.y }); const s = QM.qStand("anna", Q.id);
  check(QB.erledigt(Q, s, "befreien") && QB.figurFolgt(Q, L, s), "befreit: Liske folgt dem Spieler");
  check(!QM.motorReden(sb, "anna", "liske", X0 + 35, Y0).fehler, "wer folgt, ist beim Spieler – ansprechbar, auch weit von ihrem Käfig");
  QM.motorEnde("anna"); QM.motorEreignis(sb, "anna", { art: "betreten", x: X0 + 40, y: Y0 }); await new Promise((r) => setTimeout(r, 20)); const s2 = QM.qStand("anna", Q.id);
  check(QB.erledigt(Q, s2, "treppe") && !QB.figurFolgt(Q, L, s2), "an der Treppe: der Schritt ist erledigt, sie folgt nicht mehr");
  check(QB.figurDa(Q, Y, s2) && QM.motorReden(sb, "anna", "ysolde", Y.x, Y.y).dialog, "jetzt ist Ysolde da"); }

QUESTS.pop();

console.log("\nFähre (Phase 7)");
{ const F = { id: "test_faehre", schalter: "faehre_frei", nein: "Der Fährmann schüttelt den Kopf.", dauer: 3,
    a: { name: "Westanleger", region: "graufurt", x: 100, y: 200, ankunft: [101, 200] }, b: { name: "Ostanleger", region: "ostufer", x: 160, y: 200, ankunft: [159, 200] } };
  let frei = false, kampf = false, gesperrt = false; const P = { schalter: (n, id) => frei && id === "faehre_frei", imKampf: () => kampf, gesperrt: () => gesperrt }, L = [F];
  const fahr = (x, y, extra = {}) => FS.faehreAnfrage({ nutzer: "anna", gast: false, wx: x, wy: y, ...extra }, "test_faehre", P, L);
  check(fahr(100, 201).text === "Der Fährmann schüttelt den Kopf.", "ohne Schalter: der Fährmann sagt, warum nicht");
  frei = true; let r = fahr(100, 201); check(r.ok && r.region === "ostufer" && r.x === 159 && r.nach.name === "Ostanleger" && r.dauer === 3, "mit Schalter: hinüber zum Ostanleger (Stelle und Region vom Server, 3 s Überfahrt)");
  r = fahr(160, 199); check(r.ok && r.region === "graufurt" && r.x === 101, "und zurück: vom Ostanleger zum Westanleger");
  check(!fahr(120, 200).ok && /näher/.test(fahr(120, 200).text), "fern vom Anleger: keine Überfahrt");
  check(!fahr(100, 200, { gast: true }).ok, "als Gast: keine Überfahrt (kein Queststand)");
  kampf = true; check(/Kampf/.test(fahr(100, 200).text), "im Kampf: keine Überfahrt"); kampf = false;
  gesperrt = true; check(!fahr(100, 200).ok, "Region am anderen Ufer gesperrt: keine Überfahrt"); gesperrt = false;
  check(FA.faehreBei(100.5, 200.5, 1.5, L).nach.name === "Ostanleger" && !FA.faehreBei(130, 200, 3, L), "Anleger im Browser: Antippen nah am Anleger"); }

console.log(f ? `\nPhase 6 (Quests): ${f} FEHLER` : "\nPhase 6 (Quests): alles in Ordnung");
process.exit(f ? 1 : 0);
