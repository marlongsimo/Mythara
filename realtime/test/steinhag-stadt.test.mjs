/*
 * Riftmere – Hauptstadt Steinhag (#167, Welt 72658709): zweite Bank im Zunftviertel, Stollen der Bergmannszunft (Abstieg ab Bergbau 60, Bankkiste, Schmelzofen),
 * Zunftschmiede (vier Essen, zwei Ambosse ab Schmieden 60), Brennofen, Läden an der Hauptgasse und im Zunftviertel (erst nach H1), Wachen.
 * Ohne Server-Prozess: der Server-Teil des Handwerks (server/src/handwerk.ts) prüft die Stufe an der Zunft-Esse.
 * Die Prüfungen gegen Welts Daten (Interaktionen, Gehraster der Stadt) laufen, sobald die Stadt eingemischt ist – vorher nur ein Hinweis.
 * Aufruf (im Ordner realtime, nach python3 werkzeug/weltzonen.py): node test/steinhag-stadt.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readFileSync, existsSync } from "node:fs";
const datei = join(tmpdir(), `riftmere-steinhag-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/zunft"; export { TUEREN } from "./shared/bosse"; export { tuerOffen } from "./shared/boss"; export * from "./shared/bank"; export { WERKSTAETTEN, REZEPTE, HANDWERK_WEIT, versperrt, werkstattErreichbar } from "./shared/handwerk"; export { LAEDEN, STEINHAG_LAEDEN, ladenOffen } from "./shared/laeden"; export { GEGENSTAENDE } from "./shared/gegenstaende"; export { H_QUESTS } from "./shared/hochlande"; export * as I from "./server/src/inventar"; export * as HW from "./server/src/handwerk";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const M = await import(datei);
const { ZUNFT_STUFE, zunft, TUEREN, tuerOffen, BANKSCHALTER, BANKIERS, BANKKISTEN, nahAnBank, nahAnBankkiste, WERKSTAETTEN, REZEPTE, HANDWERK_WEIT, versperrt, werkstattErreichbar,
  LAEDEN, STEINHAG_LAEDEN, ladenOffen, GEGENSTAENDE, H_QUESTS, I, HW } = M;
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
const WURZEL = new URL("..", import.meta.url).pathname, REG = join(WURZEL, "welt", "regionen");
const STADT = existsSync(join(REG, "steinhag_zunftstollen", "spiel.json")); /* Welt 72658709 eingemischt? */
const stellen = (r) => { const p = join(REG, r, "spiel.json"); if (!existsSync(p)) return []; const d = JSON.parse(readFileSync(p, "utf8")), R = JSON.parse(readFileSync(join(REG, r, "region.json"), "utf8"));
  return (Array.isArray(d) ? d : d.interaktionen || []).map((e) => ({ ...e, wx: R.ursprung[0] * 32 + e.x, wy: R.ursprung[1] * 32 + e.y })); };
/** Ein freies Feld, von dem aus man diese Stelle erreicht (höchstens r Felder entfernt) */
const freiBei = (x, y, r) => { for (let i = Math.floor(x - r); i <= Math.floor(x + r); i++) for (let j = Math.floor(y - r); j <= Math.floor(y + r); j++) if (!versperrt(i, j) && Math.hypot(i + 0.5 - x, j + 0.5 - y) <= r) return true; return false; };
const welt = (ok, t) => (STADT ? check(ok, t) : console.log(`  · ${t} – prüft, sobald Welts Stadt eingemischt ist (72658709)`));

console.log("\nZwei Banken in Steinhag");
{ const S = BANKSCHALTER.filter((s) => s.x > 6936 && s.x < 7074 && s.y > 5826 && s.y < 5950), Z = S.find((s) => s.id === "steinhag_zunftbank_bankschalter"), B = Z && BANKIERS.find((b) => b.schalter === Z.id);
  check(S.length === 2 && Z && B && nahAnBank(Z.ort, Z.x, Z.y), `zwei Schalter in der Mauer, die Zunftbank mit ${B ? B.name : "–"} (${Z ? Z.bank : "–"})`);
  welt(Z && !versperrt(Math.floor(Z.x), Math.floor(Z.y)) && B && !versperrt(Math.floor(B.x), Math.floor(B.y)), "Schalter vor der Tür und Bankmitarbeiterin drinnen auf freiem Boden"); }

console.log("\nStollen der Bergmannszunft (ab Bergbau 60)");
const T = TUEREN.find((t) => t.id === "zunft_bergmannszunft"), an = () => false, L = (n) => ({ hat: () => false, x: 0, y: 0, beruf: (id) => (id === "bergbau" ? n : 99) });
check(T && T.beruf.id === "bergbau" && T.beruf.level === ZUNFT_STUFE && T.eingang === "steinhag_zunftstollen_eingang", "der Abstieg ist eine Zunft-Tür (Bergbau 60)");
check(T && !tuerOffen(T, an, L(59)) && tuerOffen(T, an, L(60)), "Bergbau 59: zu · 60: offen");
{ const E = stellen("fl_216_183").find((e) => e.id === T.eingang); welt(E && E.art === "eingang" && T.feld[0] === Math.floor(E.wx) && T.feld[1] === Math.floor(E.wy), `das Türfeld liegt auf dem Abstieg der Welt${E ? ` (${E.wx}|${E.wy})` : ""}`); }
{ const K = BANKKISTEN.find((k) => k.id === "zunftstollen_bankkiste"), E = stellen("steinhag_zunftstollen").find((e) => e.id === "zunftstollen_bankkiste");
  check(K && nahAnBankkiste(K.ort, K.x, K.y + 1) && !nahAnBank(K.ort, K.x, K.y), `Bankkiste in der Zunfthalle: ${K ? K.name : "fehlt"}`);
  welt(E && K && Math.hypot(E.wx - K.x, E.wy - K.y) < 0.01 && freiBei(K.x, K.y, 2.5), "… an der Stelle der Welt, erreichbar"); }
{ const S = WERKSTAETTEN.find((w) => w.id === "schmelzofen_zunft"); check(S && S.station === "esse" && S.name === "Schmelzofen", "Schmelzofen in der Zunfthalle (schmilzt wie die Esse)");
  welt(S && freiBei(S.x, S.y, HANDWERK_WEIT - 0.2), "… erreichbar"); }

console.log("\nZunftschmiede (ab Schmieden 60) und Brennofen");
const ZS = WERKSTAETTEN.filter((w) => /^(esse|amboss)_zunft_/.test(w.id));
check(ZS.filter((w) => w.station === "esse").length === 4 && ZS.filter((w) => w.station === "amboss").length === 2 && ZS.every((w) => w.beruf && w.beruf.id === "schmieden" && w.beruf.level === 60 && /Schmieden 60/.test(w.gesperrt)),
  "vier Essen und zwei Ambosse, alle erst ab Schmieden 60 (die Wache sagt, was fehlt)");
{ const B = WERKSTAETTEN.find((w) => w.id === "brennofen_zunft"); check(B && B.station === "esse" && B.name === "Brennofen" && !B.beruf, "Brennofen im Zunftviertel (wie die Esse, für alle)"); }
welt([...ZS, WERKSTAETTEN.find((w) => w.id === "brennofen_zunft")].every((w) => freiBei(w.x, w.y, HANDWERK_WEIT - 0.2)), "alle Stationen sind von freiem Boden aus erreichbar");
{ let ROW = []; const sb = async (p) => (p.includes("rpg_held?") ? ROW : null), laden = async (n, inv) => { ROW = [{ waffe: "schwert", inventar: { angelegt: {}, rucksack: [], v: 2, ...inv } }]; await I.inventarLaden(sb, n); };
  HW.handwerkEinrichten({ sb, senden: () => {} }); HW.HANDWERK_QUEST.schalter = () => true;
  const E = ZS.find((w) => w.station === "esse"), r = REZEPTE.find((x) => x.station === "esse" && !x.quest && x.level <= 1), S = (n) => ({ nutzer: n, gast: false, wx: E.x, wy: E.y + 1.2 });

  await laden("lehrling", { berufe: { schmieden: 0 } }); const a = HW.handwerkStart(S("lehrling"), r.id, 1);
  await laden("meister", { berufe: { schmieden: 1e7, handwerk: 1e7 } }); /* Schmieden übernimmt beim ersten Laden den Stand des Handwerks (shared/berufe.ts) */ const b = HW.handwerkStart(S("meister"), r.id, 1);
  check(/Schmieden 60/.test(a || "") && !/Schmieden 60|näher/.test(b || "nichts"), `Server: an der Zunft-Esse wird der Lehrling abgewiesen („${(a || "").slice(0, 40)}…“), der Meister nicht (${b || "beginnt"})`); }

console.log("\nLäden und Wachen");
const NEU = ["steinhag_waffen", "steinhag_ruestung", "steinhag_backstube", "steinhag_seefisch", "steinhag_stoffe", "steinhag_zunftbedarf", "steinhag_grubenproviant"];
check(NEU.every((id) => LAEDEN[id] && STEINHAG_LAEDEN.includes(id) && LAEDEN[id].waren.length && LAEDEN[id].waren.every((w) => GEGENSTAENDE[w.g] && w.preis > 0)), `sieben neue Läden mit vorhandenen Waren (${STEINHAG_LAEDEN.length} in Steinhag)`);
check(STEINHAG_LAEDEN.every((id) => !ladenOffen(LAEDEN[id], () => "offen") && ladenOffen(LAEDEN[id], (q) => (q === H_QUESTS.h1 ? "fertig" : "offen"))), "alle Läden der Stadt öffnen erst nach H1");
{ const P = JSON.parse(readFileSync(join(WURZEL, "welt", "hochlande_orte.json"), "utf8")).hauptstadt, LP = P ? P.laeden : [];
  welt(LP.length === 7 && LP.every((p) => NEU.some((id) => Math.hypot(LAEDEN[id].x - p.x, LAEDEN[id].y - p.y) < 0.01)), "jeder Ladenplatz der Welt hat seinen Händler"); }
welt(NEU.every((id) => !versperrt(Math.floor(LAEDEN[id].vor[0]), Math.floor(LAEDEN[id].vor[1]))), "vor jedem Händler ist freier Boden");
const WACHEN = ["steinhag_torwache_west", "steinhag_torwache_ost", "steinhag_torwache_nordwest", "steinhag_burgvogt", "steinhag_burgwache_1", "steinhag_burgwache_2", "steinhag_zunftmeisterin", "steinhag_stollenwache"];
check(WACHEN.every((id) => LAEDEN[id] && LAEDEN[id].nurReden), "Torwachen an drei Toren, Burgvogt, zwei Burgwachen, Zunftmeisterin und Zunftwache");
{ const schlecht = WACHEN.filter((id) => versperrt(Math.floor(LAEDEN[id].x), Math.floor(LAEDEN[id].y))); welt(!schlecht.length, `alle stehen auf freiem Boden (${schlecht.join(", ") || "ja"})`); }
check(LAEDEN.steinhag_stollenwache.questFigur === "zunftwache", "die Zunftwache ist Questfigur „zunftwache“ (Quest „Eintopf für die Kumpel“)");

console.log("\nBankkisten der Welt (#169)");
for (const [id, r] of [["rabenmoor_bankkiste", "rabenmoor"], ["moewenbucht_bankkiste", "fl_186_211"], ["bergwerk_bankkiste", "fl_216_169"]]) {
  const K = BANKKISTEN.find((k) => k.id === id), E = stellen(r).find((e) => e.id === id);
  check(K && nahAnBankkiste(K.ort, K.x, K.y), `${K ? K.name : id}`);
  if (E || STADT) check(E && Math.hypot(E.wx - K.x, E.wy - K.y) < 0.01 && freiBei(K.x, K.y, 2.5), `… an der Stelle der Welt (${E ? `${E.wx}|${E.wy}` : "fehlt"}), erreichbar`); }

console.log(f ? `\nSteinhag: ${f} FEHLER` : "\nSteinhag: alles in Ordnung");
process.exit(f ? 1 : 0);
