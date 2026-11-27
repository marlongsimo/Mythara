/*
 * Riftmere – Baustein Zunfthäuser (#167, #168): Zugang erst ab Berufsstufe 60 (Tür mit beruf, die Wache sagt den Text) und Bankkiste (nur ablegen und abheben).
 * Die Orte liefert Welt; hier wird eine Probe-Zunft (Fischerzunft, noch ohne Ort) eingerichtet – Steinhag prüft test/steinhag-stadt.test.mjs. Aufruf (im Ordner realtime): node test/zunft.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readFileSync } from "node:fs";
const datei = join(tmpdir(), `riftmere-zunft-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/zunft"; export { TUEREN } from "./shared/bosse"; export { tuerOffen, tuerenZu } from "./shared/boss"; export { BANKKISTEN, istBankkiste, nahAnBankkiste, nahAnBank, KISTE_TATEN } from "./shared/bank"; export { beruf } from "./shared/berufe"; export { LAEDEN } from "./shared/laeden"; export { WERKSTAETTEN, versperrt } from "./shared/handwerk";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { ZUENFTE, ZUNFT_STUFE, zunftEinrichten, TUEREN, tuerOffen, tuerenZu, BANKKISTEN, istBankkiste, nahAnBankkiste, nahAnBank, KISTE_TATEN, beruf, LAEDEN, WERKSTAETTEN, versperrt } = await import(datei);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };

console.log("\nZünfte");
check(ZUNFT_STUFE === 60, "Zugang ab Stufe 60 (Entscheidung des Nutzers)");
check(ZUENFTE.length === 6 && ZUENFTE.every((z) => beruf(z.beruf)) && ["bergbau", "schmieden", "holzfaellerei", "kraeuterkunde", "kochen", "fischen"].every((b) => ZUENFTE.some((z) => z.beruf === b)),
  `sechs Zunfthäuser mit Beruf: ${ZUENFTE.map((z) => z.name).join(", ")}`);

console.log("\nZugang nach Berufsstufe (Fischerzunft)");
const T = TUEREN.find((t) => t.id === "zunft_fischerzunft");
const an = () => false, L = (n) => ({ hat: () => false, x: 0, y: 0, beruf: (id) => (id === "fischen" ? n : 99) });
check(TUEREN.includes(T) && T.beruf.id === "fischen" && T.beruf.level === 60 && !T.schalter, "die Tür der Zunft prüft Fischen 60 (kein Schalter nötig)");
check(!tuerOffen(T, an, L(59)) && tuerOffen(T, an, L(60)) && tuerOffen(T, an, L(80)), "Fischen 59: zu · 60 und mehr: offen");
check(!tuerOffen(T, an), "ohne Angabe der Stufe bleibt sie zu");
check(/Fischen 60/.test(T.zu) && /Wache/.test(T.zu), `die Wache sagt, was fehlt: ${T.zu}`);
check(tuerenZu([T], an, L(10)).length === 1 && tuerenZu([T], an, L(60)).length === 0, "tuerenZu (Server und Browser): zu bzw. offen nach der Stufe");

console.log("\nBankkiste");
check(istBankkiste("fischerzunft_bankkiste") && BANKKISTEN.find((k) => k.id === "fischerzunft_bankkiste").name.includes("Fischerzunft"), "die Kiste der Zunft ist eingetragen");
check(nahAnBankkiste("waldmark", 6399, 7360) && !nahAnBankkiste("waldmark", 6399, 7370) && !nahAnBank("waldmark", 6399, 7360), "nah an der Kiste – aber keine richtige Bank");
check(KISTE_TATEN.has("ein") && KISTE_TATEN.has("ab") && KISTE_TATEN.has("alles") && !KISTE_TATEN.has("tab") && !KISTE_TATEN.has("tauschen") && !KISTE_TATEN.has("platzhalter"),
  "an der Kiste nur ablegen (auch alles) und abheben – keine Reiter, kein Tauschen, keine Platzhalter");

console.log("\nAlle sechs Zunfthäuser (Welt c29d415b, #168)");
{ const ORTE = (() => { try { const p = (n) => JSON.parse(readFileSync(new URL(`../welt/${n}`, import.meta.url), "utf8")); const Z = p("zunft_orte.json").zuenfte.slice();
    Z.push(p("kueste_orte.json").fischerzunft); return Z; } catch { return null; } })();
  for (const Z of ZUENFTE) { const T = TUEREN.find((t) => t.id === "zunft_" + Z.id), K = BANKKISTEN.find((k) => k.name.includes(Z.name)), W = Object.values(LAEDEN).find((l) => l.nurReden && T && Math.hypot(l.x - (T.feld[0] + T.feld[2]) / 2, l.y - (T.feld[1] + T.feld[3]) / 2) <= 4.5);
    const S = WERKSTAETTEN.filter((w) => w.beruf && w.beruf.id === Z.beruf), O = ORTE && ORTE.find((o) => o.zunft === Z.id);
    check(T && T.beruf.id === Z.beruf && T.beruf.level === 60 && K && W && (Z.id === "bergmannszunft" || S.length >= 1),
      `${Z.name}: Tor ab ${(beruf(Z.beruf) || {}).name} 60, ${K ? K.name : "keine Bankkiste"}, Wache ${W ? W.haendler : "fehlt"}${S.length ? `, ${S.length} Station(en)` : ""}`);
    if (O) check(T.feld.join() === O.tor.join() && K.id === O.bankkiste.id && Math.hypot(K.x - O.bankkiste.x, K.y - O.bankkiste.y) < 0.01 && (O.stationen || []).every((s) => S.some((w) => w.id === s.id && Math.hypot(w.x - s.x, w.y - s.y) < 0.01)),
      "… Tor, Bankkiste und Stationen wie in Welts Daten");
    if (O) { const frei = (x, y, r) => { for (let i = Math.floor(x - r); i <= Math.floor(x + r); i++) for (let j = Math.floor(y - r); j <= Math.floor(y + r); j++) if (!versperrt(i, j) && Math.hypot(i + 0.5 - x, j + 0.5 - y) <= r) return true; return false; };
      check(frei(K.x, K.y, 2.5) && !versperrt(Math.floor(W.x), Math.floor(W.y)), "… Bankkiste erreichbar, Wache auf freiem Boden"); } } }
console.log(f ? `\nZunft: ${f} FEHLER` : "\nZunft: alles in Ordnung");
process.exit(f ? 1 : 0);
