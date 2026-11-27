/*
 * Riftmere – Inhalte Phase 7 (#40): Graufurt, Ostufer und der Turm mit dem grünen Licht. Ohne Server-Prozess und ohne Supabase:
 * Gegner (Schlickkrebs, Splitterreiher, Turmwächter mit Rundumschlag, Grünlicht heilt Turmwächter), Lager, Beute, Gegenstände und Rezepte für D1–D3,
 * Wels im Fährhafen, Fähre Westanleger ↔ Ostanleger, Wappentür vor dem Turm, Wegstein-Ziel am Ostufer.
 * Aufruf (im Ordner realtime, nach python3 werkzeug/weltzonen.py): node test/inhalt-phase7.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-inhalt7-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/sim"; export * from "./shared/config"; export * from "./shared/karte"; export * from "./shared/karten"; export * from "./shared/kampfwerte"; export { startAusruestung, GEGENSTAENDE, VERBRAUCH } from "./shared/gegenstaende"; export { TUEREN, INSTANZEN } from "./shared/bosse"; export { tuerenZu } from "./shared/boss"; export { FISCHE, FANGGRUENDE } from "./shared/fischen"; export { rezept } from "./shared/handwerk"; export { WEGSTEIN_ZIELE } from "./shared/wegstein"; export { FAEHREN } from "./shared/faehre"; export { faehreAnfrage } from "./server/src/faehre"; export { ENTWUERFE } from "./shared/quest_entwuerfe";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const M = await import(datei);
const { Sim, MONSTER, KARTEN, FEIN, setzeKarte, kampfwerte, NULL_XP, xpFuer, startAusruestung, GEGENSTAENDE, VERBRAUCH, TUEREN, INSTANZEN, tuerenZu, FISCHE, FANGGRUENDE, rezept, WEGSTEIN_ZIELE, FAEHREN, faehreAnfrage, ENTWUERFE } = M;
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
const lauf = (s, sek) => { const ev = []; for (let i = 0; i < sek * 20; i++) { s.schritt(); ev.push(...s.zustand().ev); } return ev; };
const NEU = ["schlickkrebs", "splitterreiher", "turmwaechter", "gruenlicht"];

console.log("\nGegner, Gegenstände, Rezepte");
check(NEU.every((t) => MONSTER[t] && MONSTER[t].v2 && MONSTER[t].drops) && MONSTER.turmwaechter.spezial && MONSTER.gruenlicht.heiler, "vier Gegner mit Werten und Beute; Turmwächter mit Rundumschlag, Grünlicht heilt");
check(NEU.flatMap((t) => MONSTER[t].drops.flatMap((R) => R.wurf.map((w) => w.g))).every((g) => g.startsWith("@") || GEGENSTAENDE[g]), "alle Beute-Gegenstände gibt es");
const D = ["kettenglied", "kettenschloss", "splitterkern_gruen", "krebsschere", "wachtstein", "fisch_wels_roh", "fisch_wels_gebraten", "fisch_wels_verbrannt", "welspastete"];
check(D.every((g) => GEGENSTAENDE[g]) && VERBRAUCH.welspastete && VERBRAUCH.fisch_wels_gebraten, "Gegenstände für D1–D3, Wels und Pastete heilen");
const K = rezept("kettenglied"), W = rezept("welspastete");
check(K && K.station === "amboss" && K.level === 45 && K.quest === "graufurt_die_faehrkette" && W && W.station === "herd" && W.level === 45, "Rezepte: Kettenglied (Amboss, Schmieden 45, Quest D1), Welspastete (Herd, Kochen 45)");
check(FISCHE.wels && FISCHE.wels.level === 45 && FANGGRUENDE.some((g) => g.art === "wels" && g.region === "graufurt"), "Graufurter Wels (Fischen 45) im Fährhafen");
{ const d = ENTWUERFE.filter((e) => /graufurt|ostufer/.test(e.q.id)), fehlt = [];
  for (const e of d) for (const S of e.q.schritte) { const E = S.ereignis; if (E.art === "herstellen" && !rezept(E.rezept)) fehlt.push(E.rezept); if (E.art === "erlegen" && !MONSTER[E.typ]) fehlt.push(E.typ); }
  for (const e of d) for (const O of e.q.objekte || []) for (const G of [...(O.geben || []), ...(O.nehmen || [])]) if (!GEGENSTAENDE[G.g]) fehlt.push(G.g);
  check(d.length === 3 && !fehlt.length, `D1–D3: alle Rezepte, Gegner und Gegenstände sind da (${fehlt.join(", ") || "nichts fehlt"})`); }

console.log("\nLager");
setzeKarte(KARTEN.welt, FEIN);
{ const s = Sim.welt(1, undefined, true), n = (t) => s.wesen.filter((w) => w.typ === t).length;
  check(n("schlickkrebs") === 4 && n("splitterreiher") === 5 && n("turmwaechter") === 6 && n("gruenlicht") === 1, `Ostufer: 4 Krebse, 5 Reiher · Turm: 6 Turmwächter, 1 Grünlicht (${NEU.map(n).join("/")})`); }

console.log("\nGrünlicht heilt Turmwächter");
{ const s = Sim.welt(2, undefined, true), U = KARTEN.welt.ursprung, P = { x: 6800.5 - U[0], y: 6520.5 - U[1] }; /* Weltfelder am Ostufer (der Ursprung der Kampfwelt hängt von den Gebieten ab, #122) */ s.wesen = s.wesen.filter((w) => w.held); const id = s.beitreten("schildwaechter", 0, { x: P.x, y: P.y }, kampfwerte({ ...NULL_XP, defense: xpFuer(60), lp: xpFuer(70) }, startAusruestung("schwert"), 1)), h = s.nach(id); h.max = h.lp = 1e6; s["karte"].MEHRKAMPF = [[0, 0, 1e5, 1e5]];
  const g = s["neu"](false, "gruenlicht", 1, { x: P.x + 3, y: P.y }, true, 7), t = s["neu"](false, "turmwaechter", 1, { x: P.x + 1, y: P.y }, true, 7);
  for (const w of [g, t]) { w.lp = w.max = MONSTER[w.typ].lp; w.zielId = h.id; w.wach = true; w.streifT = 1e9; } t.lp = Math.floor(t.max * 0.4); const vor = t.lp; const ev = lauf(s, 7);
  check(ev.some((e) => e.a === "text" && e.id === g.id && e.t === "heilt") && t.lp > vor, `der Turmwächter wird geheilt (${vor} → ${Math.round(t.lp)})`); }

console.log("\nFähre, Wappentür, Wegstein");
{ const F = FAEHREN.find((x) => x.id === "graufurt"), P = { schalter: (_n, sch) => sch === "faehre_frei", imKampf: () => false, gesperrt: () => false };
  const r = faehreAnfrage({ nutzer: "a", gast: false, wx: 6717.6, wy: 6514 }, "graufurt", P); const r0 = faehreAnfrage({ nutzer: "a", gast: false, wx: 6717.6, wy: 6514 }, "graufurt", { ...P, schalter: () => false });
  check(F && r.ok && r.nach.name === "Ostanleger" && Math.abs(r.x - 6736.5) < 1 && !r0.ok && /Kord/.test(r0.text), "Fähre: nach D1 hinüber zum Ostanleger, vorher sagt Kord, warum nicht");
  const T = TUEREN.find((t) => t.id === "turm_wappentuer");
  check(T && T.eingang === "turm_wappentuer" && tuerenZu(TUEREN, () => false).some((t) => t.id === T.id) && !tuerenZu(TUEREN, (s) => s === "wappentuer_offen").some((t) => t.id === T.id), "Wappentür: zu, bis der Schalter wappentuer_offen an ist (sperrt den Eingang zum Turm)");
  check(WEGSTEIN_ZIELE.some((z) => z.id === "ostufer_turm" && z.quest === "ostufer_das_gruene_licht"), "Wegstein-Ziel „Ostufer – der Turm“ nach D2"); }

console.log(f ? `\nInhalte Phase 7: ${f} FEHLER` : "\nInhalte Phase 7: alles in Ordnung");
process.exit(f ? 1 : 0);
