/*
 * Riftmere – Tiere zur Stimmung (Phase 11, shared/tiere.ts + shared/tierplaetze.json): Ziegen, Schafe und Murmeltiere wandern friedlich im Umkreis ihres Platzes,
 * die Stelle hängt nur von der Uhr ab (alle sehen dasselbe), sie gehen und halten Pause, bleiben auf begehbarem Boden, sind keine Gegner (kein Kampf).
 * Ohne Server-Prozess. Aufruf (im Ordner realtime, nach python3 werkzeug/weltzonen.py): node test/tiere.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { existsSync } from "node:fs";
const WURZEL = new URL("..", import.meta.url).pathname, datei = join(tmpdir(), `riftmere-tiere-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/tiere"; export { versperrt } from "./shared/handwerk"; export { MONSTER } from "./shared/config";', resolveDir: WURZEL, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { TIERPLAETZE, TIERARTEN, tierStelle, TIER_TAKT, versperrt, MONSTER } = await import(datei);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
const frei = (x, y) => !versperrt(Math.floor(x), Math.floor(y));

console.log("\nPlätze und Arten");
check(TIERPLAETZE.length >= 5 && ["ziege", "schaf", "murmeltier"].every((a) => TIERPLAETZE.some((p) => p.art === a)), `${TIERPLAETZE.length} Plätze mit Ziegen, Schafen und Murmeltieren (${TIERPLAETZE.reduce((n, p) => n + p.anzahl, 0)} Tiere)`);
check(Object.values(TIERARTEN).every((A) => existsSync(join(WURZEL, "..", "img", "figuren-echt3d", A.datei + ".glb"))), "Modelle von Figuren (ziege3d, murmeltier3d, schaf3d)");
check(!MONSTER.ziege && !MONSTER.murmeltier, "keine Gegner – man kann sie nicht angreifen");
check(TIERPLAETZE.every((p) => frei(p.x, p.y)), "jede Platzmitte liegt auf begehbarem Boden");

console.log("\nUmherwandern");
let raus = 0, block = 0, gehen = 0, pause = 0; const weg = new Map();
for (const p of TIERPLAETZE) for (let i = 0; i < p.anzahl; i++) { let vor = null, w = 0;
  for (let t = 1e9; t < 1e9 + 30 * TIER_TAKT; t += 0.5) { const s = tierStelle(p, i, t, frei); if (Math.hypot(s.x - p.x, s.y - p.y) > p.radius + 0.01) raus++; if (!frei(s.x, s.y)) block++; s.geht ? gehen++ : pause++; if (vor) w += Math.hypot(s.x - vor.x, s.y - vor.y); vor = s; }
  weg.set(p.id + i, w); }
check(raus === 0, "jedes Tier bleibt in seinem Umkreis");
check(block === 0, `immer auf begehbarem Boden (${block} Stellen daneben)`);
check([...weg.values()].every((w) => w > 10) && gehen > 0 && pause > gehen, `sie wandern (je ${Math.round(Math.min(...weg.values()))}–${Math.round(Math.max(...weg.values()))} Felder) und halten oft Pause (${Math.round(100 * pause / (gehen + pause))} % der Zeit)`);
{ const p = TIERPLAETZE[0], a = tierStelle(p, 0, 1e9 + 123.4, frei), b = tierStelle(p, 0, 1e9 + 123.4, frei), c = tierStelle(p, 1, 1e9 + 123.4, frei);
  check(a.x === b.x && a.y === b.y && (a.x !== c.x || a.y !== c.y), "nach der Uhr: zur selben Zeit dieselbe Stelle (für alle gleich), jedes Tier eigen"); }
console.log(f ? `\nTiere: ${f} FEHLER` : "\nTiere: alles in Ordnung");
process.exit(f ? 1 : 0);
