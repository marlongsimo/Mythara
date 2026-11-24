/*
 * World Pipeline – baut Regionen für das Spiel.
 * Aufruf (im Ordner realtime): node werkzeug/welt/bauen.mjs [region …] [--ohne-boden]
 *
 * Schritte je Region: Formprüfung → Gehraster und Chunk-Dateien → Bodenbilder (werkzeug/welt/boden.py).
 * Ergebnis in ../echtzeit/welt/:  welt.json (Regionen, verwendete Objekte) · <cx>_<cy>.json (Chunk) · <cx>_<cy>.webp (Boden)
 * Ohne Angabe werden alle Regionen gebaut. Bricht ab, wenn die Formprüfung Fehler meldet.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { gemeinsam, bibliothek, region, regionNamen, formPruefen, WURZEL, REALTIME } from "./laden.mjs";

const args = process.argv.slice(2), ohneBoden = args.includes("--ohne-boden"), gewaehlt = args.filter((a) => !a.startsWith("--"));
/* Ohne Angabe: alle Regionen außer Entwürfen */
const namen = gewaehlt.length ? gewaehlt : regionNamen().filter((n) => !region(n).region.entwurf), ziel = join(WURZEL, "echtzeit", "welt");
const fehler = Object.entries(await formPruefen(namen)).filter(([, f]) => f.length);
if (fehler.length) { for (const [n, f] of fehler) { console.log("✗ " + n); for (const z of f.slice(0, 20)) console.log("    " + z); } console.log("\nNicht gebaut: erst die Fehler beheben."); process.exit(1); }

const G = await gemeinsam(), bib = bibliothek(); mkdirSync(ziel, { recursive: true });
/* welt.json wächst mit: Regionen, die diesmal nicht gebaut werden, bleiben stehen */
const indexPfad = join(ziel, "welt.json"), index = existsSync(indexPfad) ? JSON.parse(readFileSync(indexPfad, "utf8")) : { regionen: {}, objekte: {} };
index.feldPx = G.FELD_PX; index.chunkFelder = G.CHUNK_FELDER;
for (const n of namen) {
  const gebaut = G.chunksBauen(region(n), bib.gelaende, bib.objekte);
  for (const c of gebaut.chunks) writeFileSync(join(ziel, `${c.cx}_${c.cy}.json`), JSON.stringify(c));
  index.regionen[n] = { ...gebaut.kopf, benutzt: gebaut.benutzt };
  const frei = gebaut.chunks.reduce((s, c) => s + c.geh.join("").split(".").length - 1, 0), felder = gebaut.chunks.length * G.CHUNK_FELDER ** 2;
  console.log(`✓ ${n}: ${gebaut.chunks.length} Chunks, ${gebaut.chunks.reduce((s, c) => s + c.objekte.length, 0)} Objekte, ${Math.round(100 * frei / felder)} % begehbar`);
  if (!ohneBoden) { const r = spawnSync("python3", ["werkzeug/welt/boden.py", n, "--vorschau"], { cwd: REALTIME, stdio: "inherit" }); if (r.status !== 0) process.exit(r.status || 1); }
}
/* Nur die Objekte ausliefern, die irgendeine Region benutzt – und nur, was die Darstellung braucht */
const benutzt = new Set(Object.values(index.regionen).flatMap((r) => r.benutzt)); index.objekte = {};
for (const o of bib.objekte.objekte) if (benutzt.has(o.id) && o.vielfalt) for (const v of o.vielfalt) benutzt.add(v);   /* Farbvarianten (vielfalt) mit ausliefern */
for (const o of bib.objekte.objekte) if (benutzt.has(o.id)) index.objekte[o.id] = { bild: o.bild, groesse: o.groesse, anker: o.anker, massstab: o.massstab, tiefe: o.tiefe,
  ...(o.durchscheinend ? { durchscheinend: true } : {}), ...(o.animation ? { animation: o.animation } : {}), ...(o.effekte ? { effekte: o.effekte } : {}), ...(o.zustaende ? { zustaende: o.zustaende } : {}), ...(o.interaktion ? { interaktion: o.interaktion } : {}), ...(o.vielfalt ? { vielfalt: o.vielfalt } : {}),
  ...(o.ebenen ? { ebenen: o.ebenen, raum: o.raum || [], tueren: o.tueren || [] } : {}) };
index.stand = Date.now().toString(36);   /* Kennung dieses Baus: das Spiel hängt sie an die Dateien der Welt (gegen veraltete Bilder im Browser) */
writeFileSync(indexPfad, JSON.stringify(index));
console.log(`geschrieben: echtzeit/welt/welt.json (${Object.keys(index.regionen).length} Regionen, ${Object.keys(index.objekte).length} Objekte)`);
/* Übersichtskarten (Minimap) mit Baumkronen neu zeichnen, damit der Wald als Wald erkennbar ist (werkzeug/welt/karte.py) */
if (!ohneBoden) { const r = spawnSync("python3", ["werkzeug/welt/karte.py", ...namen], { cwd: REALTIME, stdio: "inherit" }); if (r.status !== 0) process.exit(r.status || 1); }
