/*
 * Riftmere – Baustein Zunfthäuser (#167, #168): Zugang erst ab Berufsstufe 60 (Tür mit beruf, die Wache sagt den Text) und Bankkiste (nur ablegen und abheben).
 * Die Orte liefert Welt; hier wird eine Probe-Zunft eingerichtet. Aufruf (im Ordner realtime): node test/zunft.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-zunft-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/zunft"; export { TUEREN } from "./shared/bosse"; export { tuerOffen, tuerenZu } from "./shared/boss"; export { BANKKISTEN, istBankkiste, nahAnBankkiste, nahAnBank, KISTE_TATEN } from "./shared/bank"; export { beruf } from "./shared/berufe";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { ZUENFTE, ZUNFT_STUFE, zunftEinrichten, TUEREN, tuerOffen, tuerenZu, BANKKISTEN, istBankkiste, nahAnBankkiste, nahAnBank, KISTE_TATEN, beruf } = await import(datei);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };

console.log("\nZünfte");
check(ZUNFT_STUFE === 60, "Zugang ab Stufe 60 (Entscheidung des Nutzers)");
check(ZUENFTE.length === 6 && ZUENFTE.every((z) => beruf(z.beruf)) && ["bergbau", "schmieden", "holzfaellerei", "kraeuterkunde", "kochen", "fischen"].every((b) => ZUENFTE.some((z) => z.beruf === b)),
  `sechs Zunfthäuser mit Beruf: ${ZUENFTE.map((z) => z.name).join(", ")}`);

console.log("\nZugang nach Berufsstufe (Probe)");
const T = zunftEinrichten("bergmannszunft", { feld: [100, 100, 101, 100], eingang: "probe_abstieg" }, { id: "probe_bankkiste", x: 200.5, y: 200.5 });
const an = () => false, L = (n) => ({ hat: () => false, x: 0, y: 0, beruf: (id) => (id === "bergbau" ? n : 99) });
check(TUEREN.includes(T) && T.beruf.id === "bergbau" && T.beruf.level === 60 && T.eingang === "probe_abstieg" && !T.schalter, "die Tür der Zunft prüft Bergbau 60 (kein Schalter nötig)");
check(!tuerOffen(T, an, L(59)) && tuerOffen(T, an, L(60)) && tuerOffen(T, an, L(80)), "Bergbau 59: zu · 60 und mehr: offen");
check(!tuerOffen(T, an), "ohne Angabe der Stufe bleibt sie zu");
check(/Bergbau 60/.test(T.zu) && /Wache/.test(T.zu), `die Wache sagt, was fehlt: ${T.zu}`);
check(tuerenZu([T], an, L(10)).length === 1 && tuerenZu([T], an, L(60)).length === 0, "tuerenZu (Server und Browser): zu bzw. offen nach der Stufe");

console.log("\nBankkiste");
check(istBankkiste("probe_bankkiste") && BANKKISTEN.find((k) => k.id === "probe_bankkiste").name.includes("Bergmannszunft"), "die Kiste der Zunft ist eingetragen");
check(nahAnBankkiste("waldmark", 201, 201) && !nahAnBankkiste("waldmark", 210, 210) && !nahAnBank("waldmark", 201, 201), "nah an der Kiste – aber keine richtige Bank");
check(KISTE_TATEN.has("ein") && KISTE_TATEN.has("ab") && KISTE_TATEN.has("alles") && !KISTE_TATEN.has("tab") && !KISTE_TATEN.has("tauschen") && !KISTE_TATEN.has("platzhalter"),
  "an der Kiste nur ablegen (auch alles) und abheben – keine Reiter, kein Tauschen, keine Platzhalter");

console.log(f ? `\nZunft: ${f} FEHLER` : "\nZunft: alles in Ordnung");
process.exit(f ? 1 : 0);
