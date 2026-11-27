/*
 * Riftmere – vorbereitete Gegner (#130): zehn Gegner der Ockerlande, Hochlande, Frostkrone und des Drachenarms mit Werten und Beute nach beute.md,
 * in der Stufe der Welt; der Drakling ist ein Bodengegner; neu ist nur Wildbret (Fleisch). Lager über die Gegnerplätze der Welt (#138), der Drakling folgt.
 * Aufruf (im Ordner realtime): node test/gegner-vorbereitet.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-vorb-${process.pid}.mjs`);
await build({ stdin: { contents: 'export { MONSTER } from "./shared/config"; export { GEGENSTAENDE, VERBRAUCH } from "./shared/gegenstaende"; export { rezept } from "./shared/handwerk"; export { WELTKAMPF } from "./shared/weltzonen";', resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { MONSTER, GEGENSTAENDE, VERBRAUCH, rezept, WELTKAMPF } = await import(datei);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
const S = { steppenwolf: 46, ockerhyaene: 50, hochlandwidder: 52, hochlandbaer: 54, klippenadler: 56, bergtroll: 58, tundraelch: 62, frostwolf: 64, drakling: 66, eisgolem: 72 };
check(Object.entries(S).every(([t, s]) => MONSTER[t] && MONSTER[t].v2 && MONSTER[t].planStufe === s), "zehn Gegner mit Werten (v3) in der Stufe aus #130");
check(Object.keys(S).flatMap((t) => MONSTER[t].drops.flatMap((R) => R.wurf.map((w) => w.g))).every((g) => g.startsWith("@") || GEGENSTAENDE[g]), "alle Beute-Gegenstände gibt es");
check(Object.keys(S).every((t) => MONSTER[t].drops.every((R) => R.wurf.reduce((a, w) => a + w.chance, 0) <= 100.0001)), "je Wurf höchstens 100 %");
check(!/flieg|schweb/i.test(MONSTER.drakling.info) && MONSTER.drakling.angriff.art === "magie", "der Drakling ist ein Bodengegner (fliegt nicht)");
check(GEGENSTAENDE.wildbret && rezept("wildbretbraten")?.level === 50 && VERBRAUCH.wildbretbraten.heilt.fest === 12, "neu nur Wildbret (Fleisch) und der Wildbretbraten (Kochen 50, heilt 12)");
{ const n = (t) => WELTKAMPF.reduce((a, z) => a + z.lager.filter((l) => l.art === t).length, 0), da = Object.keys(S);
  check(!WELTKAMPF.some((z) => z.lager.some((l) => l.gp)) || da.every((t) => n(t) > 0), `#138: mit den Gegnerplätzen stehen alle zehn in der Welt (${da.map((t) => t + " " + n(t)).join(", ")})`); }
console.log(f ? `\nVorbereitete Gegner: ${f} FEHLER` : "\nVorbereitete Gegner: alles in Ordnung");
process.exit(f ? 1 : 0);
