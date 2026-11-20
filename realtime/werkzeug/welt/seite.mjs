/*
 * World Pipeline – stellt eine eigenständige Seite zum Herumlaufen zusammen: Seite, Programm, Weltdaten und genau die Bilder, die sie braucht.
 * Aufruf (im Ordner realtime): node werkzeug/welt/seite.mjs <zielordner> <startregion> [weitere Regionen …]
 * Vorher die Regionen bauen (node werkzeug/welt/bauen.mjs …). Der Zielordner wird geleert und neu gefüllt; er liegt außerhalb des Repositorys.
 * Ergebnis: <ziel>/index.html (ohne eigenes html/head, für die Veröffentlichung als Artifact), welt-seite.js, welt/…, img/…
 */
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { REALTIME, WURZEL } from "./laden.mjs";

const [ziel, ...regionen] = process.argv.slice(2);
if (!ziel || !regionen.length) { console.log("Aufruf: node werkzeug/welt/seite.mjs <zielordner> <startregion> [weitere Regionen …]"); process.exit(1); }
if (ziel.startsWith(WURZEL)) { console.log("Der Zielordner soll außerhalb des Repositorys liegen."); process.exit(1); }
rmSync(ziel, { recursive: true, force: true }); mkdirSync(join(ziel, "welt"), { recursive: true });
const kopie = (von, nach) => { mkdirSync(dirname(nach), { recursive: true }); copyFileSync(von, nach); };

/* Programm */
await build({ entryPoints: [join(REALTIME, "client/src/welt/seite.ts")], bundle: true, minify: true, format: "iife", target: "es2020", outfile: join(ziel, "welt-seite.js"), legalComments: "none", define: { "process.env.NODE_ENV": '"production"' }, logLevel: "warning" });

/* Weltdaten: nur die gewählten Regionen, ihre Chunks, Minikarten und Objekte */
const quelle = join(WURZEL, "echtzeit", "welt"), W = JSON.parse(readFileSync(join(quelle, "welt.json"), "utf8")), aus = { ...W, regionen: {}, objekte: {} };
const bilder = new Set();
for (const n of regionen) { const r = W.regionen[n]; if (!r) { console.log(`Region „${n}“ ist nicht gebaut (node werkzeug/welt/bauen.mjs ${n}).`); process.exit(1); } aus.regionen[n] = r;
  for (const id of r.benutzt) { const o = W.objekte[id]; aus.objekte[id] = o; bilder.add(o.bild); for (const z of Object.values(o.zustaende || {})) bilder.add(z.bild); }
  kopie(join(quelle, `karte-${n}.webp`), join(ziel, "welt", `karte-${n}.webp`));
  const [ux, uy] = r.region.ursprung, [b, h] = r.region.chunks;
  for (let cy = uy; cy < uy + h; cy++) for (let cx = ux; cx < ux + b; cx++) { for (const e of ["json", "webp"]) kopie(join(quelle, `${cx}_${cy}.${e}`), join(ziel, "welt", `${cx}_${cy}.${e}`));
    for (const f of JSON.parse(readFileSync(join(quelle, `${cx}_${cy}.json`), "utf8")).figuren) bilder.add(`img/echtzeit/${f.figur}.webp`); } }
writeFileSync(join(ziel, "welt", "welt.json"), JSON.stringify(aus));

/* Helden: Stand-, Lauf- und Porträtbild */
const cfg = readFileSync(join(REALTIME, "shared/config.ts"), "utf8"), reihe = JSON.parse(cfg.match(/HELDENREIHE = (\[[^\]]*\])/)[1].replace(/'/g, '"'));
for (const k of reihe) { const z = cfg.split("\n").find((l) => l.trimStart().startsWith(k + ": {")); for (const f of ["figur", "lauf", "bild"]) { const m = z && z.match(new RegExp(`\\b${f}: "([^"]+)"`)); if (m) bilder.add(m[1]); } }
let fehlt = 0; for (const b of bilder) { const p = join(WURZEL, b); if (!existsSync(p)) { console.log("fehlt: " + b); fehlt++; continue; } kopie(p, join(ziel, b)); }

/* Seite */
writeFileSync(join(ziel, "index.html"), readFileSync(join(REALTIME, "client/welt-seite.html"), "utf8").replace(/data-start="[^"]*"/, `data-start="${regionen[0]}"`));
console.log(`Seite in ${ziel}: ${regionen.length} Regionen, ${Object.keys(aus.objekte).length} Objekte, ${bilder.size} Bilder${fehlt ? `, ${fehlt} fehlen` : ""}`);
if (fehlt) process.exit(1);
