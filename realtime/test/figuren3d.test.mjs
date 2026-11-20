/*
 * Mythara – Prüfung der Phaser-Schnittstelle für modulare 3D-Figuren (ohne Browser): Richtungen, Animationstakt, Ausrüstungsregeln, Sichtbarkeit.
 * Aufruf: node test/figuren3d.test.mjs   (liest die exportierte Figur aus img/figuren3d/krieger_test, falls vorhanden)
 */
import { build } from "esbuild"; import { readFileSync, existsSync } from "node:fs";
const out = (await build({ stdin: { contents: 'export * from "./client/src/figuren3d/CharacterConfiguration"; export { DirectionResolver } from "./client/src/figuren3d/DirectionResolver"; export { AnimationRegistry } from "./client/src/figuren3d/AnimationRegistry"; export { CharacterAnimator } from "./client/src/figuren3d/CharacterAnimator";', resolveDir: ".", loader: "ts" }, bundle: true, format: "esm", platform: "node", write: false })).outputFiles[0].text;
const M = await import("data:text/javascript;base64," + Buffer.from(out).toString("base64"));
let ok = true; const check = (b, t) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) ok = false; };
const R = [["O", 0], ["SO", 45], ["S", 90], ["SW", 135], ["W", 180], ["NW", 225], ["N", 270], ["NO", 315]].map(([id, grad]) => ({ id, grad }));
{ const d = new M.DirectionResolver(R, "flach", 0); const f = (w) => { d.zuruecksetzen(); return d.aufloesen(w); };
  check(f(0) === "O" && f(Math.PI / 2) === "S" && f(Math.PI) === "W" && f(-Math.PI / 2) === "N" && f(Math.PI / 4) === "SO" && f(-Math.PI / 4) === "NO" && f(3 * Math.PI / 4) === "SW" && f(-3 * Math.PI / 4) === "NW", "Spielkonvention: 0 = Osten, π/2 = Süden (y nach unten), alle 8 Richtungen eindeutig");
  const h = new M.DirectionResolver(R, "flach", 8); h.aufloesen(0); check(h.aufloesen(23 * Math.PI / 180) === "O" && h.aufloesen(29 * Math.PI / 180) === "O" && h.aufloesen(32 * Math.PI / 180) === "SO", "Hysterese: kein Flackern an der Grenze (bis 30,5° bleibt Ost, ab dann Südost)");
  const i = new M.DirectionResolver(R, "iso", 0); check(i.aufloesen(0) === "SO" && i.aufloesen(Math.PI / 2) === "SW", "Isometrischer Riss: Weltwinkel wird auf den Bildschirm umgerechnet"); }
const FIG = existsSync("../img/figuren3d/krieger_test/figur.json") ? JSON.parse(readFileSync("../img/figuren3d/krieger_test/figur.json", "utf8")) : null;
const KAT = FIG ? JSON.parse(readFileSync("../img/figuren3d/krieger_test/ausruestung.json", "utf8")) : null;
if (FIG) {
  check(FIG.richtungen.length === 8 && ["idle", "walk", "run", "attack", "block", "dodge", "cast", "hit", "death", "idle_1h", "attack_1h", "block_1h"].every((a) => FIG.animationen[a]), "Exportierte Figur: 8 Richtungen, alle 12 Animationen (9 Grund + 3 Einhand)");
  check(FIG.testAsset && /TEST ASSET/.test(FIG.name) && KAT.gegenstaende.every((g) => g.testAsset && /TEST ASSET/.test(g.name)), "Testfigur und alle Testgegenstände sind als TEST ASSET gekennzeichnet");
  const reg = new M.AnimationRegistry(FIG), w = FIG.animationen.walk, d = FIG.animationen.death;
  check(reg.frameBei("walk", (w.frames + 2) / w.fps).i === 2 && !reg.frameBei("walk", 99).fertig, "Schleife läuft im Kreis");
  check(reg.frameBei("death", 99).i === d.frames - 1 && reg.frameBei("death", 99).fertig, "Tod bleibt auf dem letzten Bild stehen");
  check(M.ausruestungPruefen(FIG, KAT, FIG.standardAusruestung).length === 0, "Standardausrüstung ist gültig");
  check(M.ausruestungPruefen(FIG, KAT, { main_hand: "test_zweihaender", off_hand: "test_schild_rund" }).some((x) => /doppelt/.test(x)), "Zweihänder + Schild wird abgelehnt");
  check(M.ausruestungPruefen(FIG, KAT, { head: "test_brust_stahl" }).length === 1 && M.ausruestungPruefen(FIG, KAT, { head: "gibtsnicht" }).length === 1, "Falscher Slot und unbekannter Gegenstand werden abgelehnt");
  const v = M.sichtbareEbenen(FIG, KAT, { head: "test_helm_stahl", hair: "test_haare_kurz", chest: "test_brust_stahl" });
  check(!v.items.includes("item:test_haare_kurz") && v.items.includes("item:test_helm_stahl") && !v.koerper.includes("koerper:rumpf") && v.koerper.includes("koerper:kopf"), "Helm verdeckt die Haare, Brustpanzer verdeckt den Rumpf");
  check(M.haltung(FIG, KAT, { main_hand: "test_schwert_kurz", off_hand: "test_schild_rund" }).attack === "attack_1h" && Object.keys(M.haltung(FIG, KAT, { main_hand: "test_zweihaender" })).length === 0 && M.haltung(FIG, KAT, { off_hand: "test_schild_drachen" }).block === "block_1h",
    "Haltung folgt der Waffe: Einhand/Schild → attack_1h, block_1h; Zweihänder → Grundanimationen");
  const v0 = M.sichtbareEbenen(FIG, KAT, {}); check(v0.items.length === 0 && v0.koerper.length === FIG.koerperRegionen.length, "Ohne Ausrüstung: nur der Körper");
  const a = new M.CharacterAnimator(reg, new M.DirectionResolver(FIG.richtungen)); const st = (o) => ({ blick: Math.PI / 2, tempo: 0, tot: false, block: false, ...o });
  a.schritt(0.05, st()); const s1 = a.anim; a.schritt(0.05, st({ tempo: 1.5 })); const s2 = a.anim; a.schritt(0.05, st({ tempo: 4 })); const s3 = a.anim; a.schritt(0.05, st({ block: true })); const s4 = a.anim;
  check(s1 === "idle" && s2 === "walk" && s3 === "run" && s4 === "block" && a.richtung === "S", "Animator: steht → geht → läuft → blockt, Blick nach Süden");
  a.ausloesen("attack"); a.schritt(0.05, st()); const s5 = a.anim; for (let i = 0; i < 60; i++) a.schritt(0.05, st()); check(s5 === "attack" && a.anim === "idle", "Angriff spielt einmal und kehrt in den Grundzustand zurück");
  a.zuordnung = M.haltung(FIG, KAT, { main_hand: "test_axt_einhand" }); a.ausloesen("attack"); a.schritt(0.05, st()); const s6 = a.anim; a.schritt(0.05, st({ block: true })); for (let i = 0; i < 60; i++) a.schritt(0.05, st({ block: true })); const s7 = a.anim; a.zuordnung = {};
  check(s6 === "attack_1h" && s7 === "block_1h", "Animator mit Einhandwaffe: Angriff attack_1h, Block block_1h");
  a.schritt(0.05, st({ tot: true })); a.ausloesen("hit"); for (let i = 0; i < 60; i++) a.schritt(0.05, st({ tot: true })); check(a.anim === "death" && a.frame === d.frames - 1, "Tod hat Vorrang und hält das letzte Bild");
} else console.log("  (keine exportierte Figur – nur die Richtungsprüfungen)");
console.log(ok ? "\nModulare Figuren (Schnittstelle): alles in Ordnung" : "\nModulare Figuren (Schnittstelle): FEHLER"); process.exit(ok ? 0 : 1);
