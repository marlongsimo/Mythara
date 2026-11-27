/*
 * Riftmere – Weltsperren (#186, Welt #185): Bergsturz am Drachenarm und Schneesturm vor der Frostkrone als Stadtstufen
 * (Sperrstücke mit ausbau_bis drachenarm_frei / frostkrone_frei verschwinden je Spieler mit dem Schalter), Sturmstärke für das Wetter, Chat-Hinweise.
 * Dazu #179: das zweite Boot in Kielmund (ausbau kielmund_boot) erst mit kielmund_neues_boot.
 * Aufruf (im Ordner realtime): node test/sperren.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-sperren-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/sperren"; export * from "./shared/stadtstufen";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { WELT_SPERREN, sperrAbstand, sturmStaerke, STAEDTE, ausbauDa, markeDa, ausbauMarke, stufenSchluessel } = await import(datei);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
const an = (...s) => (x) => s.includes(x), keiner = () => false;
const D = WELT_SPERREN.find((s) => s.id === "drachenarm"), F = WELT_SPERREN.find((s) => s.id === "frostkrone");

console.log("\nStufen in STAEDTE");
for (const [stadt, erste, frei] of [["drachenarm", "verschuettet", "drachenarm_frei"], ["frostkrone", "sturm", "frostkrone_frei"], ["kielmund", "kielmund_alt", "kielmund_boot"]]) {
  const S = STAEDTE.find((s) => s.id === stadt); check(!!S && S.stufen[0].id === erste && !S.stufen[0].schalter && S.stufen[1].id === frei, `${stadt}: ${erste} → ${frei}`); }
check(new Set(STAEDTE.flatMap((s) => s.stufen.map((x) => x.id))).size === STAEDTE.flatMap((s) => s.stufen).length, "keine Stufe doppelt");

console.log("\nSperrstücke (ausbau_bis) verschwinden mit dem Schalter");
check(ausbauDa(undefined, "drachenarm_frei", keiner) && !ausbauDa(undefined, "drachenarm_frei", an("drachenarm_frei")), "Bergsturz: da, bis drachenarm_frei an ist");
check(markeDa(ausbauMarke(undefined, "frostkrone_frei"), keiner) && !markeDa(ausbauMarke(undefined, "frostkrone_frei"), an("frostkrone_frei")), "Sturmstücke: da, bis frostkrone_frei an ist (gebackene Marke)");
check(markeDa(ausbauMarke(undefined, "frostkrone_frei"), an("drachenarm_frei")), "die Schalter wirken nur auf ihre eigene Sperre");
check(!ausbauDa("kielmund_boot", undefined, keiner) && ausbauDa("kielmund_boot", undefined, an("kielmund_neues_boot")), "#179: das zweite Boot erst mit kielmund_neues_boot");
check(stufenSchluessel(keiner) !== stufenSchluessel(an("frostkrone_frei")) && stufenSchluessel(keiner) !== stufenSchluessel(an("drachenarm_frei")), "der Stufenschlüssel ändert sich (der Browser baut neu)");
check(stufenSchluessel(keiner).split(",").every((x) => x === "0"), "ohne Schalter überall die erste Stufe (kein Neubau beim Laden)");

console.log("\nSchneesturm (Wetter) und Hinweise");
check(D && F && D.schalter === "drachenarm_frei" && F.schalter === "frostkrone_frei" && F.linie && F.breite === 12, "zwei Sperren, der Sturm als Linie mit Breite 12");
const [a, b] = F.punkte.slice(5, 7), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
check(sperrAbstand(F, m[0], m[1]) < 0.01, "Abstand auf der Linie zwischen zwei Punkten: 0");
check(sturmStaerke(F, m[0], m[1]) === 1 && sturmStaerke(F, m[0] + 4, m[1] + 4) === 1, "auf und nahe der Linie volle Stärke");
{ const s = [6, 10, 16, 22, 30].map((d) => sturmStaerke(F, m[0] + d / Math.SQRT2, m[1] + d / Math.SQRT2));
  check(s.every((v, i) => i === 0 || v <= s[i - 1]) && s[s.length - 1] === 0 && s[2] > 0, `je weiter weg, desto schwächer, ab 2 × Breite still (${s.map((v) => v.toFixed(2)).join(" → ")})`); }
check(sturmStaerke(D, D.punkte[0][0], D.punkte[0][1]) === 0, "der Bergsturz hat kein Wetter");
{ const p = [D.punkte[3][0] + 7, D.punkte[3][1] - 2], soll = Math.min(...D.punkte.map(([x, y]) => Math.hypot(x + 0.5 - p[0], y + 0.5 - p[1])));
  check(Math.abs(sperrAbstand(D, p[0], p[1]) - soll) < 1e-9, "Abstand zum Bergsturz: nächster Fels (Feldmitte, keine Linie)"); }
check(D.text === "Felsen versperren den Hals des Drachenarms." && F.text === "Der Schneesturm treibt dich zurück.", "Chat-Hinweise wie gewünscht");
console.log(f ? `\nSperren: ${f} FEHLER` : "\nSperren: alles in Ordnung");
process.exit(f ? 1 : 0);
