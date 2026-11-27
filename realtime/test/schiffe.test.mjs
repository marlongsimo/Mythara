/*
 * Riftmere – Schiffslinien (Ausgabe 2; shared/schiffe.ts, server/src/schiffe.ts): Häfen, Fahrpreis 20–60 Splitter nach Entfernung,
 * nur besuchte Häfen als Ziel, Prüfungen des Servers (Nähe, Kampf, Splitter, Sperre). Überfahrt wie ein Teleport (Nutzer 27.11.): Ankunft am Zielsteg.
 * Aufruf (im Ordner realtime): node test/schiffe.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readFileSync, existsSync } from "node:fs";
const datei = join(tmpdir(), `riftmere-schiffe-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/schiffe"; export { schiffAnfrage } from "./server/src/schiffe";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { HAEFEN, hafen, entfernung, fahrpreis, fahrziele, hafenBei, hafenMerker, schiffAnfrage } = await import(datei);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
const WELT = new URL("../../echtzeit/welt/", import.meta.url).pathname, C = 32, cache = new Map();
const feld = (x, y) => { const cx = Math.floor(x / C), cy = Math.floor(y / C), k = cx + "_" + cy; if (!cache.has(k)) { const p = WELT + k + ".json"; cache.set(k, existsSync(p) ? JSON.parse(readFileSync(p, "utf8")).geh : null); }
  const g = cache.get(k); return g ? (g[Math.floor(y) - cy * C] || "")[Math.floor(x) - cx * C] || "#" : "#"; };
const ids = HAEFEN.map((h) => h.id);

console.log("\nHäfen");
check(ids.join() === "kielmund,moewenbucht,netzbucht,grauwacht", `vier Häfen (${ids.join(", ")}) – Graufurt bleibt die Fähre`);
check(HAEFEN.every((h) => h.region && h.ankunft && feld(h.ankunft[0], h.ankunft[1]) === "."), "jeder mit Region und Ankunft auf freiem Boden");
check(HAEFEN.every((h) => Math.hypot(h.ankunft[0] - h.kapitaen.x, h.ankunft[1] - h.kapitaen.y) < 5), "die Ankunft liegt beim Kapitän");
check(HAEFEN.every((h) => feld(h.schiff.x, h.schiff.y) === "~"), "jedes Schiff liegt im Wasser");

console.log("\nFahrpreis");
const P = []; for (const a of ids) for (const b of ids) if (a < b) P.push([a, b, fahrpreis(a, b), entfernung(a, b)]);
check(P.every(([, , p]) => p >= 20 && p <= 60 && p % 5 === 0), `20–60 Splitter (${P.map(([a, b, p]) => `${a}–${b} ${p}`).join(", ")})`);
check(fahrpreis("kielmund", "moewenbucht") === 20 && fahrpreis("kielmund", "grauwacht") === 60, "Nachbarhafen 20, der weiteste Weg 60");
check(P.every(([, , p, L]) => P.every(([, , q, M]) => !(L < M) || p <= q)), "weiter weg, nie billiger");
check(ids.every((a) => ids.every((b) => a === b || fahrpreis(a, b) === fahrpreis(b, a))) && fahrpreis("kielmund", "kielmund") === null, "hin und zurück gleich teuer, nicht zum eigenen Hafen");

console.log("\nZiele und Server");
const merker = new Set(), kasse = { n: 100 }, P0 = { kennt: (n, m) => merker.has(m), merken: (n, m) => merker.add(m), imKampf: () => false, bezahlen: (n, k) => (kasse.n < k ? `Dafür fehlen dir ${k - kasse.n} Splitter.` : ((kasse.n -= k), null)), gesperrt: () => false };
const K = hafen("kielmund").kapitaen, bei = { nutzer: "u", gast: false, wx: K.x + 1, wy: K.y };
check(!schiffAnfrage({ ...bei, wx: K.x + 8 }, { tat: "ziele" }, P0).ok, "fern vom Kapitän: nichts");
check(!schiffAnfrage({ ...bei, gast: true }, { tat: "ziele" }, P0).ok, "Gäste: nur mit Konto");
{ const r = schiffAnfrage(bei, { tat: "ziele" }, P0); check(r.ok && r.neu && r.ziele.length === 0 && merker.has(hafenMerker("kielmund")), "erstes Gespräch: Kielmund gilt als besucht, noch keine Ziele"); }
{ const r = schiffAnfrage(bei, { tat: "fahren", nach: "grauwacht" }, P0); check(!r.ok && /kennst du noch nicht/.test(r.text) && kasse.n === 100, "unbekannter Hafen: keine Fahrt, nichts bezahlt"); }
merker.add(hafenMerker("grauwacht")); merker.add(hafenMerker("moewenbucht"));
{ const r = schiffAnfrage(bei, { tat: "ziele" }, P0); check(r.ok && !r.neu && r.ziele.map((z) => z.id).join() === "moewenbucht,grauwacht" && r.ziele[0].preis === 20, "besuchte Häfen als Ziel, mit Preis"); }
check(!schiffAnfrage(bei, { tat: "fahren", nach: "grauwacht" }, { ...P0, imKampf: () => true }).ok && kasse.n === 100, "im Kampf: kein Ablegen");
check(!schiffAnfrage(bei, { tat: "fahren", nach: "grauwacht" }, { ...P0, gesperrt: () => true }).ok && kasse.n === 100, "gesperrte Region (Quest): nicht dorthin");
check(!schiffAnfrage(bei, { tat: "fahren", nach: "kielmund" }, P0).ok, "nicht zum eigenen Hafen");
{ const r = schiffAnfrage(bei, { tat: "fahren", nach: "grauwacht" }, P0), G = hafen("grauwacht");
  check(r.ok && r.preis === 60 && kasse.n === 40 && r.x === G.ankunft[0] && r.y === G.ankunft[1] && r.region === G.region, "Überfahrt nach Grauwacht: 60 Splitter, Stelle und Region am Zielsteg"); }
{ const r = schiffAnfrage(bei, { tat: "fahren", nach: "grauwacht" }, P0); check(!r.ok && /fehlen dir 20/.test(r.text) && kasse.n === 40, "zu wenig Splitter: keine Fahrt"); }
check(hafenBei(K.x, K.y)?.id === "kielmund" && hafenBei(K.x + 10, K.y) === null, "hafenBei: nur nah am Kapitän");
check(fahrziele("kielmund", () => true).length === 3, "alle Häfen bekannt: drei Ziele");
console.log(f ? `\nSchiffe: ${f} FEHLER` : "\nSchiffe: alles in Ordnung");
process.exit(f ? 1 : 0);
