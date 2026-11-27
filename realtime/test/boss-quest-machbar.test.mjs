/*
 * Riftmere – Bosse in der Quest-Fassung sind machbar (#156, #116: allein, schwächer, gut machbar).
 * Ein Held der empfohlenen Stufe (alle Skills auf dem Heldenlevel der Quest) mit passender Ausrüstung (Eidschwert, Schild, Eisenwacht: episch ab 35, legendär ab 45)
 * betritt die Quest-Kopie, greift Heiler zuerst an (Grumholds Felsbrocken-Wächter), sonst den nächsten Gegner, bleibt stehen (weicht keiner Ansage aus) und isst bei halbem Leben (30 % des Lebens, alle 3 s, höchstens 15 Mahlzeiten).
 * Je Boss drei Läufe mit verschiedenem Zufall: jeder muss gewinnen, ohne zu sterben, in höchstens 4 Minuten; im Schnitt höchstens 11 Mahlzeiten
 * (Maßstab: die Federmutter, die in C2 gut machbar ist).
 * Im Thronsaal ist das Becken getrübt (Schalter becken_getruebt, wie in C3). Dazu D2 (#150): auf dem Turmdach greift erst der Turmwächter an, danach muss das Grünlicht
 * anzugreifen sein (Mehrkampf) und fallen. Aufruf (im Ordner realtime): node test/boss-quest-machbar.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-bossquest-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/sim"; export * from "./shared/config"; export * from "./shared/karte"; export * from "./shared/karten"; export * from "./shared/kampfwerte"; export { INSTANZEN } from "./shared/bosse"; export { QUEST_STAERKE } from "./shared/boss"; export { weltJeSpieler } from "./server/src/bosse";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { Sim, KARTEN, FEIN, setzeKarte, begehbar, kampfwerte, NULL_XP, xpFuer, INSTANZEN, MONSTER, QUEST_STAERKE, weltJeSpieler } = await import(datei);
setzeKarte(KARTEN.welt, FEIN);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
/* Instanz, empfohlenes Heldenlevel der Quest, Boss */
const FAELLE = [["federmutter_kammer", 40, "federmutter", "C2"], ["thronsaal", 40, "oberster_rabenpriester", "C3"], ["hauptmann_gruft", 48, "grauer_hauptmann", "E4"],
  ["tempel_kammer", 55, "sandmutter", "F3"], ["wrack_kajuete", 35, "wrackkapitaen", "G3"],
  ["trollhalle", 60, "grumhold", "H4 (#160, mit Nahkampf – gegen den er stark ist)"], ["horst_sturmschwinge", 60, "sturmschwinge", "H4 (#160, mit Nahkampf – sie fliegt)"],
  ["eishoehle_frostwitwe", 60, "frostwitwe", "H4 (#160)"]];
const LAEUFE = 3, ESSEN = 15, MAX_S = 240, SCHNITT_ESSEN = 11, schnitt = (E) => E.reduce((a, e) => a + e.essen, 0) / E.length;
for (const [inst, L, boss, quest] of FAELLE) {
  let D = INSTANZEN.find((d) => d.id === inst); const U0 = KARTEN.welt.ursprung, Q = D.questStaerke || QUEST_STAERKE;
  if (!begehbar(D.gegner[0].x - U0[0], D.gegner[0].y - U0[1])) { /* der Raum fehlt noch in der Kampfwelt (Welt nicht eingemischt): Probe in einer Kopie der Bergwerkshalle */
    D = { ...D, id: "probe_" + inst, feld: [11595, 9602, 11618, 9624], gegner: [{ ...D.gegner[0], x: 11607.5, y: 9611.5 }] }; INSTANZEN.unshift(D); }
  const t = L >= 65 ? "_mythisch" : L >= 45 ? "_legendaer" : "_episch";
  console.log(`\n${quest} · ${MONSTER[boss].name} (Stufe ${MONSTER[boss].stufe}) gegen Heldenlevel ${L}, Quest-Fassung ${Math.round(Q.leben * 100)} % Leben, ${Math.round(Q.schaden * 100)} % Schaden`);
  const X = { ...NULL_XP }; for (const k of Object.keys(NULL_XP)) X[k] = xpFuer(L);
  const aus = { waffe: "eidschwert" + t, nebenhand: "sternenschild" + t, brust: "eisenwacht" + t, kopf: "eisenwachthelm" + t, beine: "eisenbeinschienen" + t };
  const erg = [];
  for (let v = 0; v < LAEUFE; v++) {
    const s = Sim.welt(16 + v * 7919, undefined, true), U = KARTEN.welt.ursprung; s.ursprung = [U[0], U[1]]; s.wesen = s.wesen.filter((w) => w.held);
    const g = D.gegner[0], hx = g.x, hy = g.y + 5;
    const id = s.beitreten("schildwaechter", 0, { x: hx - U[0], y: hy - U[1] }, kampfwerte(X, aus, 1)), h = s.nach(id); h.schalterAn = ["becken_getruebt"];
    weltJeSpieler(s, id, "probe" + v, hx, hy, (x) => x === D.schalter, { hat: () => true, abgeben: () => true });
    const b = s.wesen.find((w) => w.typ === boss && w.instanz === h.instanz && w.instanz);
    if (!b) { erg.push({ sieg: false, grund: "kein Boss in der Kopie" }); continue; }
    let pause = 0, essen = ESSEN, tot = false, n;
    for (n = 0; n < 20 * 300 && b.lp > 0 && s.wesen.includes(b); n++) {
      if (n % 20 === 0) { const F = s.wesen.filter((w) => !w.held && w.instanz === h.instanz && w.lp > 0).sort((a, c) => (MONSTER[c.typ].heiler ? 1 : 0) - (MONSTER[a.typ].heiler ? 1 : 0) || Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(c.x - h.x, c.y - h.y)); if (F[0]) s.eingabe({ t: "ziel", id: F[0].id }, id); } /* Heiler zuerst (Felsbrocken-Wächter heilen Grumhold) */
      s.schritt();
      if (pause > 0) pause--; else if (h.lp > 0 && h.lp < h.max * 0.5 && essen > 0) { h.lp = Math.min(h.max, h.lp + Math.round(h.max * 0.3)); essen--; pause = 20 * 3; }
      if (h.lp <= 0 || h.tot) { tot = true; break; } }
    erg.push({ sieg: !tot && (b.lp <= 0 || !s.wesen.includes(b)), sek: n / 20, essen: ESSEN - essen, rest: Math.max(0, b.lp), max: b.max }); }
  const text = erg.map((e) => e.grund || (e.sieg ? `${e.sek.toFixed(0)} s/${e.essen}× Essen` : `verloren (Boss ${e.rest}/${e.max})`)).join(", ");
  check(erg.every((e) => e.sieg), `gewinnt ${erg.filter((e) => e.sieg).length} von ${LAEUFE} Läufen: ${text}`);
  check(erg.every((e) => e.sieg && e.sek <= MAX_S) && schnitt(erg) <= SCHNITT_ESSEN, `jeweils höchstens ${MAX_S / 60} Minuten, im Schnitt ${schnitt(erg).toFixed(1)} Mahlzeiten (höchstens ${SCHNITT_ESSEN})`);
}
console.log("\nD2 · Turmdach (#150): Turmwächter und Grünlicht gegen Heldenlevel 45");
{ const L = 45, X = { ...NULL_XP }; for (const k of Object.keys(NULL_XP)) X[k] = xpFuer(L);
  const aus = { waffe: "eidschwert_legendaer", nebenhand: "sternenschild_legendaer", brust: "eisenwacht_legendaer", kopf: "eisenwachthelm_legendaer", beine: "eisenbeinschienen_legendaer" };
  const erg = [];
  for (let v = 0; v < LAEUFE; v++) {
    const s = Sim.welt(16 + v * 7919, undefined, true), U = KARTEN.welt.ursprung, dach = (w) => Math.hypot(w.x + U[0] - 10990, w.y + U[1] - 9613) < 12;
    s.ursprung = [U[0], U[1]]; s.wesen = s.wesen.filter((w) => w.held || dach(w));
    const id = s.beitreten("schildwaechter", 0, { x: 10988.7 - U[0], y: 9618.3 - U[1] }, kampfwerte(X, aus, 1)), h = s.nach(id), W = s.wesen.find((w) => w.typ === "turmwaechter");
    s.eingabe({ t: "ziel", id: W.id }, id); for (let n = 0; n < 60; n++) s.schritt(); /* der Turmwächter stellt den Helden, er wehrt sich zuerst gegen ihn */
    let essen = ESSEN, pause = 0, n, gesperrt = false;
    for (n = 0; n < 20 * 300; n++) { const G = s.wesen.find((w) => w.typ === "gruenlicht" && !w.tot && w.lp > 0); if (!G) break;
      if (n % 20 === 0) s.eingabe({ t: "ziel", id: G.id }, id);
      s.schritt(); if ((s.zustand().ev || []).some((e) => e.a === "text" && /jemand anderem/.test(e.t || ""))) gesperrt = true;
      if (pause > 0) pause--; else if (h.lp > 0 && h.lp < h.max * 0.5 && essen > 0) { h.lp = Math.min(h.max, h.lp + Math.round(h.max * 0.3)); essen--; pause = 60; }
      if (h.lp <= 0 || h.tot) break; }
    erg.push({ sieg: h.lp > 0 && !h.tot && !s.wesen.some((w) => w.typ === "gruenlicht" && !w.tot && w.lp > 0), sek: n / 20, essen: ESSEN - essen, gesperrt, wach: Boolean(W && W.zielId === id) }); }
  check(erg.every((e) => !e.gesperrt), "das Grünlicht ist anzugreifen, obwohl der Turmwächter schon kämpft (Mehrkampf auf dem Dach, kein „Kämpft schon mit jemand anderem“)");
  check(erg.every((e) => e.sieg && e.sek <= MAX_S) && schnitt(erg) <= SCHNITT_ESSEN, `das Grünlicht fällt: ${erg.map((e) => e.sieg ? `${e.sek.toFixed(0)} s/${e.essen}× Essen` : "verloren").join(", ")}`); }

console.log("\nDie starke Fassung danach bleibt");
check(FAELLE.every(([inst]) => INSTANZEN.find((d) => d.id === inst).danach), "jede dieser Instanzen hat die starke Fassung (Schalter „danach“) mit vollen Werten (Quest-Stärke gilt nur in der Quest-Kopie)");
console.log(f ? `\nBosse in der Quest machbar (#156): ${f} FEHLER` : "\nBosse in der Quest machbar (#156): alles in Ordnung");
process.exit(f ? 1 : 0);
