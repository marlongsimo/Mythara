/*
 * Mythara – alle 3D-Modelle des Spiels (alle .glb unter img/) mit Meshopt komprimieren (gltf-transform, etwa 55–77 % kleiner, gleiches Aussehen,
 * Animationen bleiben). Das Spiel lädt sie über client/src/welt3d/gltf.ts (mit Meshopt-Entpacker). Die Originale der Figuren-Fabrik (fabrik/) bleiben unberührt.
 * Schon komprimierte Modelle werden übersprungen – nach neuen Modellen aus der Fabrik einfach wieder aufrufen:
 *   node werkzeug/modelle_komprimieren.mjs            (im Ordner realtime)
 */
import { readFileSync, readdirSync, statSync, renameSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const lauf = promisify(execFile), IMG = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "img");
const alle = (d) => readdirSync(d).flatMap((n) => { const f = join(d, n); return statSync(f).isDirectory() ? alle(f) : n.endsWith(".glb") ? [f] : []; });
const komprimiert = (f) => { const b = readFileSync(f), n = b.readUInt32LE(12), j = JSON.parse(b.subarray(20, 20 + n).toString("utf8")); return (j.extensionsUsed || []).includes("EXT_meshopt_compression"); };
const offen = alle(IMG).filter((f) => !komprimiert(f)); let vorher = 0, nachher = 0, fertig = 0, fehler = 0;
console.log(`${offen.length} Modelle zu komprimieren`);
async function eins(f) { const tmp = f + ".meshopt.tmp.glb", alt = statSync(f).size;
  try { await lauf("npx", ["-y", "@gltf-transform/cli@4", "meshopt", f, tmp], { maxBuffer: 1 << 24 }); const neu = statSync(tmp).size;
    if (neu < alt) { renameSync(tmp, f); vorher += alt; nachher += neu; } else { renameSync(tmp, tmp + ".verworfen"); } fertig++; }
  catch (e) { fehler++; console.error("Fehler:", f, (e.stderr || e.message || "").toString().slice(-300)); } }
const reihe = [...offen]; await Promise.all(Array.from({ length: 4 }, async () => { while (reihe.length) await eins(reihe.shift()); }));
console.log(`fertig: ${fertig}, Fehler: ${fehler}, ${(vorher / 1e6).toFixed(1)} MB → ${(nachher / 1e6).toFixed(1)} MB`);
process.exit(fehler ? 1 : 0);
