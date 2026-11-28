/*
 * Riftmere – Hauptstadt Kielmund (#174, Welt 7a15f6624, welt/kielmund_orte.json): zwei Banken, zehn Läden (Kai, Kaufmannsviertel, Ladenhäuser), sechs Stationen,
 * Wachen, Wahrzeichen und Hafenleben (Hafenarbeiter und Stadtwache unterwegs). Die Fischerzunft am Privatsteg prüft test/zunft.test.mjs.
 * Prüfungen gegen das Gehraster der gebauten Stadt laufen, sobald sie eingemischt ist – vorher nur ein Hinweis.
 * Aufruf (im Ordner realtime, nach python3 werkzeug/weltzonen.py): node test/kielmund-stadt.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readFileSync, existsSync } from "node:fs";
const datei = join(tmpdir(), `riftmere-kielmund-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/bank"; export { WERKSTAETTEN, HANDWERK_WEIT, versperrt, werkstattErreichbar } from "./shared/handwerk"; export { LAEDEN, ladenOffen } from "./shared/laeden"; export { GEGENSTAENDE } from "./shared/gegenstaende"; export { REISENDE, reiseStelle } from "./shared/reisende"; export { TUEREN } from "./shared/bosse"; import "./shared/zunft";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { BANKSCHALTER, BANKIERS, nahAnBank, WERKSTAETTEN, HANDWERK_WEIT, versperrt, werkstattErreichbar, LAEDEN, ladenOffen, GEGENSTAENDE, REISENDE, reiseStelle, TUEREN } = await import(datei);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
const P = join(new URL("..", import.meta.url).pathname, "welt", "kielmund_orte.json"), O = existsSync(P) ? JSON.parse(readFileSync(P, "utf8")) : null;
const welt = (ok, t) => (O ? check(ok, t) : console.log(`  · ${t} – prüft, sobald Welts Stadt eingemischt ist (7a15f6624)`));
const frei = (x, y) => !versperrt(Math.floor(x), Math.floor(y));
const IN = (x, y) => x >= 6340 && x <= 6500 && y >= 7262 && y <= 7380;

console.log("\nZwei Banken");
{ const S = BANKSCHALTER.filter((s) => IN(s.x, s.y)), H = BANKIERS.find((b) => b.id === "kielmund_hafenbank");
  check(S.length === 2 && H && nahAnBank("waldmark", 6414, 7333.4) && BANKIERS.some((b) => b.bank === "Bank von Kielmund"), `Bank von Kielmund und Hafenbank (${H ? H.name : "–"})`);
  welt(O && O.banken.every((b) => S.some((s) => Math.hypot(s.x - b.schalter[0], s.y - b.schalter[1]) < 4) /* Welt nennt den Platz vor der Tür, der Schalter steht drinnen */) && S.every((s) => frei(s.x, s.y)) && frei(H.x, H.y), "an Welts Banken, Schalter und Bankier auf freiem Boden"); }

console.log("\nLäden");
const L = Object.values(LAEDEN).filter((l) => IN(l.x, l.y) && !l.nurReden);
check(L.length === 10 && L.every((l) => l.troedler || (l.waren.length && l.waren.every((w) => GEGENSTAENDE[w.g] && w.preis > 0))) && L.every((l) => ladenOffen(l, () => "")), `zehn Läden mit vorhandenen Waren, immer offen (${L.map((l) => l.name).join(", ")})`);
welt(O && O.laeden.every((p) => L.some((l) => Math.hypot(l.x - p.x, l.y - p.y) < 0.01)), "jeder Ladenplatz der Welt hat seinen Händler");
{ const schlecht = L.filter((l) => !frei(l.x, l.y) || !frei(l.vor[0], l.vor[1])).map((l) => l.id); welt(!schlecht.length, `Händler und der Platz davor auf freiem Boden (${schlecht.join(", ") || "alle"})`); }

console.log("\nStationen");
const S = ["esse_kielmund", "amboss_kielmund", "werkbank_kielmund", "herd_kielmund_taverne", "raeucherhuette_kielmund", "kessel_kielmund"].map((id) => WERKSTAETTEN.find((w) => w.id === id));
check(S.every(Boolean), "Esse, Amboss, Werkbank, Herd (Taverne), Räucherhütte (Hafen), Kessel (Fischerquartier)");
{ const weg = S.filter((W) => { for (let r = 1; r <= 3; r++) for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) { const x = Math.floor(W.x) + dx + 0.5, y = Math.floor(W.y) + dy + 0.5; if (frei(x, y) && Math.hypot(x - W.x, y - W.y) <= HANDWERK_WEIT && werkstattErreichbar(x, y, W)) return false; } return true; }).map((W) => W.id);
  welt(O && O.stationen.every((s) => S.some((W) => W.id === s.id && Math.hypot(W.x - s.x, W.y - s.y) < 0.01)) && !weg.length, `an Welts Plätzen, jede zu Fuß erreichbar (${weg.join(", ") || "alle"})`); }

console.log("\nWachen, Wahrzeichen und Hafenleben");
const N = Object.values(LAEDEN).filter((l) => IN(l.x, l.y) && l.nurReden);
check(["kielmund_torwache_nord", "kielmund_torwache_bruecke", "kielmund_leuchtturmwaerter", "kielmund_priesterin", "kielmund_marktrufer"].every((id) => LAEDEN[id] && LAEDEN[id].nurReden) && N.length >= 8,
  `${N.length} Bewohner zum Reden: Torwachen, Leuchtturmwärter, Priesterin, Marktrufer, Matrosen, Fischfrau`);
{ const schlecht = N.filter((l) => !frei(l.x, l.y)).map((l) => l.id); welt(!schlecht.length, `alle auf freiem Boden (${schlecht.join(", ") || "ja"})`); }
{ const R = REISENDE.filter((r) => /kielmund$/.test(r.id)); check(R.length === 3, "zwei Hafenarbeiter am Kai, eine Stadtwache auf Streife");
  let aus = 0; for (let t = 0; t < 3000; t += 5) for (const r of R) { const p = reiseStelle(r, t); if (!frei(p.x, p.y)) aus++; } welt(aus === 0, `über eine ganze Runde auf begehbarem Boden (${aus} Stellen daneben)`); }
check(TUEREN.some((t) => t.id === "zunft_fischerzunft" && t.beruf.level === 60), "die Fischerzunft am Privatsteg (Tor ab Fischen 60, test/zunft.test.mjs)");

console.log(f ? `\nKielmund: ${f} FEHLER` : "\nKielmund: alles in Ordnung");
process.exit(f ? 1 : 0);
