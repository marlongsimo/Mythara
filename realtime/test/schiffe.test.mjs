/*
 * Riftmere – Schiffslinien (Ausgabe 2; shared/schiffe.ts, server/src/schiffe.ts): Häfen, Seewege übers Wasser, Fahrpreis 20–60 Splitter,
 * nur besuchte Häfen als Ziel, Prüfungen des Servers (Nähe, Kampf, Splitter, Sperre), Fahrt sanft vom Liegeplatz zum Liegeplatz.
 * Aufruf (im Ordner realtime): node test/schiffe.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readFileSync, existsSync } from "node:fs";
const datei = join(tmpdir(), `riftmere-schiffe-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/schiffe"; export { schiffAnfrage } from "./server/src/schiffe";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { HAEFEN, hafen, seeweg, weglaenge, fahrpreis, fahrtDauer, fahrziele, schiffBei, hafenBei, hafenMerker, schiffAnfrage, FAHRT } = await import(datei);
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

console.log("\nSeewege");
let land = []; for (const a of ids) for (const b of ids) { if (a === b) continue; const p = seeweg(a, b); if (!p) { land.push(`${a}–${b}: keiner`); continue; }
  for (let i = 1; i < p.length; i++) { const [ax, ay] = p[i - 1], [bx, by] = p[i], n = Math.ceil(Math.hypot(bx - ax, by - ay)); for (let k = 0; k <= n; k++) { const x = ax + (bx - ax) * k / n, y = ay + (by - ay) * k / n; if (feld(x, y) !== "~") { land.push(`${a}–${b} bei ${x.toFixed(0)}|${y.toFixed(0)}`); break; } } } }
check(!land.length, `zwischen allen Häfen ein Weg, der ganz übers Wasser führt${land.length ? " – " + land.slice(0, 4).join("; ") : ""}`);
check(ids.every((a) => ids.every((b) => a === b || JSON.stringify(seeweg(a, b)) === JSON.stringify([...seeweg(b, a)].reverse()))), "hin und zurück derselbe Weg");
{ const p = seeweg("kielmund", "moewenbucht"), K = hafen("kielmund"), M = hafen("moewenbucht");
  check(Math.hypot(p[0][0] - K.schiff.x, p[0][1] - K.schiff.y) < 6 && Math.hypot(p.at(-1)[0] - M.schiff.x, p.at(-1)[1] - M.schiff.y) < 6, "der Weg beginnt und endet an den Liegeplätzen"); }

console.log("\nFahrpreis und Dauer");
const P = []; for (const a of ids) for (const b of ids) if (a < b) P.push([a, b, fahrpreis(a, b), fahrtDauer(a, b), weglaenge(seeweg(a, b))]);
check(P.every(([, , p]) => p >= 20 && p <= 60 && p % 5 === 0), `20–60 Splitter (${P.map(([a, b, p]) => `${a}–${b} ${p}`).join(", ")})`);
check(fahrpreis("kielmund", "moewenbucht") === 20 && fahrpreis("kielmund", "grauwacht") === 60, "Nachbarhafen 20, der weiteste Weg 60");
check(P.every(([a, b, p, , L]) => P.every(([, , q, , M]) => !(L < M) || p <= q)), "längerer Weg, nie billiger");
check(P.every(([, , , d]) => d >= FAHRT.grund && d <= FAHRT.max), `Fahrt ${FAHRT.grund}–${FAHRT.max} s (${P.map(([, , , d]) => d.toFixed(0)).join(", ")})`);

console.log("\nDie Fahrt");
{ const p = seeweg("netzbucht", "grauwacht"), d = fahrtDauer("netzbucht", "grauwacht"), s = [0, 0.05, 0.3, 0.5, 0.95, 1].map((u) => schiffBei(p, d, u * d));
  check(Math.hypot(s[0].x - p[0][0], s[0].y - p[0][1]) < 0.01 && Math.hypot(s[5].x - p.at(-1)[0], s[5].y - p.at(-1)[1]) < 0.01, "vom ersten zum letzten Wegpunkt");
  const L = weglaenge(p), weg = (u) => { const q = schiffBei(p, d, u * d); let best = Infinity, acc = 0, at = 0; for (let i = 1; i < p.length; i++) { const [ax, ay] = p[i - 1], [bx, by] = p[i], l = Math.hypot(bx - ax, by - ay), t = Math.max(0, Math.min(1, ((q.x - ax) * (bx - ax) + (q.y - ay) * (by - ay)) / (l * l))), e = Math.hypot(ax + (bx - ax) * t - q.x, ay + (by - ay) * t - q.y); if (e < best) { best = e; at = acc + l * t; } acc += l; } return at / L; };
  const v1 = (weg(0.02) - weg(0.01)), vm = (weg(0.51) - weg(0.5)); check(v1 < vm * 0.5 && weg(0.5) > 0.45 && weg(0.5) < 0.55, "sanft ablegen, auf halber Zeit halber Weg"); }

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
  check(r.ok && r.preis === 60 && kasse.n === 40 && r.x === G.ankunft[0] && r.y === G.ankunft[1] && r.region === G.region && r.weg.length > 2, "Überfahrt nach Grauwacht: 60 Splitter, Stelle und Region am Ziel, Seeweg mit"); }
{ const r = schiffAnfrage(bei, { tat: "fahren", nach: "grauwacht" }, P0); check(!r.ok && /fehlen dir 20/.test(r.text) && kasse.n === 40, "zu wenig Splitter: keine Fahrt"); }
check(hafenBei(K.x, K.y)?.id === "kielmund" && hafenBei(K.x + 10, K.y) === null, "hafenBei: nur nah am Kapitän");
check(fahrziele("kielmund", () => true).length === 3, "alle Häfen bekannt: drei Ziele");
console.log(f ? `\nSchiffe: ${f} FEHLER` : "\nSchiffe: alles in Ordnung");
process.exit(f ? 1 : 0);
