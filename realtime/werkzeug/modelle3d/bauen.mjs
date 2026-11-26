/*
 * Baut die Handwerks-Modelle (handwerk3d.ts) im Browser (Chromium über Playwright, wegen Leinwand-Texturen und WebGL) und schreibt
 *   img/objekte3d/handwerk/<id>.glb        das Modell für `modell3d`
 *   werkzeug/modelle3d/vorschau/<id>.png   Vorschau zum Ansehen (dazu <id>-2d.png: grobe Ansicht von schräg oben, kein fertiges Ersatzbild)
 * Aufruf (im Ordner realtime): node werkzeug/modelle3d/bauen.mjs
 */
import { build } from "esbuild";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const HIER = dirname(fileURLToPath(import.meta.url)), REALTIME = join(HIER, "..", ".."), WURZEL = join(REALTIME, "..");
const require = createRequire(import.meta.url); let chromium; try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }
const js = (await build({ entryPoints: [join(HIER, "handwerk3d.ts")], bundle: true, write: false, format: "iife", platform: "browser", logLevel: "silent" })).outputFiles[0].text;
const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] }), p = await b.newPage();
p.on("pageerror", (e) => console.error("Seite:", e.message));
await p.setContent("<!doctype html><body></body>"); await p.addScriptTag({ content: js });
const ergebnis = await p.evaluate(async () => {
  const H = globalThis.HANDWERK, alle = H.alle(), aus = {};
  for (const [id, g] of Object.entries(alle)) {
    const buf = new Uint8Array(await H.glb(g)); let s = ""; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    aus[id] = { glb: btoa(s), vorschau: H.vorschau(g, 900, 700, true), bild: H.vorschau(g, 384, 384, false, true) }; }
  return aus; });
await b.close();
mkdirSync(join(WURZEL, "img", "objekte3d", "handwerk"), { recursive: true }); mkdirSync(join(HIER, "vorschau"), { recursive: true });
for (const [id, e] of Object.entries(ergebnis)) {
  writeFileSync(join(WURZEL, "img", "objekte3d", "handwerk", id + ".glb"), Buffer.from(e.glb, "base64"));
  writeFileSync(join(HIER, "vorschau", id + ".png"), Buffer.from(e.vorschau.split(",")[1], "base64"));
  writeFileSync(join(HIER, "vorschau", id + "-2d.png"), Buffer.from(e.bild.split(",")[1], "base64"));
  console.log(`  ${id}.glb: ${Math.round(Buffer.from(e.glb, "base64").length / 1024)} KB`); }
