/*
 * Stellt die Seite „Gebäude-Prototyp“ zusammen (Testszene mit drei Bauweisen nebeneinander). Ändert nichts am Spiel.
 * Aufruf (im Ordner realtime): node werkzeug/welt/prototyp.mjs <zielordner>
 * Braucht: python3 werkzeug/welt/haus3d.py <ziel>/proto/haus  und den gebackenen Boden der Region „prototyp“ als <ziel>/proto/boden.webp
 *          (python3 werkzeug/welt/boden.py prototyp, dann echtzeit/welt/300_300.webp dorthin verschieben)
 */
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { REALTIME, WURZEL } from "./laden.mjs";
const ziel = process.argv[2]; if (!ziel || ziel.startsWith(WURZEL)) { console.log("Aufruf: node werkzeug/welt/prototyp.mjs <zielordner außerhalb des Repositorys>"); process.exit(1); }
for (const p of ["proto/haus/haus3d.json", "proto/boden.webp"]) if (!existsSync(join(ziel, p))) { console.log("fehlt: " + p); process.exit(1); }
await build({ entryPoints: [join(REALTIME, "client/src/welt/prototyp.ts")], bundle: true, minify: true, format: "iife", target: "es2020", outfile: join(ziel, "prototyp.js"), legalComments: "none", define: { "process.env.NODE_ENV": '"production"' }, logLevel: "warning" });
const kopie = (b) => { mkdirSync(dirname(join(ziel, b)), { recursive: true }); copyFileSync(join(WURZEL, b), join(ziel, b)); };
for (const b of ["img/echtzeit/torvald.webp", "img/echtzeit/torvald-lauf.webp", "img/welt/gebaeude/dorf_haus_holz_01.webp", ...[1, 2, 3, 5, 6].map((n) => `img/welt/baum${n}.webp`)]) kopie(b);
writeFileSync(join(ziel, "index.html"), readFileSync(join(REALTIME, "client/prototyp-seite.html"), "utf8"));
console.log("Prototyp-Seite in " + ziel);
