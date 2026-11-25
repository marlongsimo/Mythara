/* Alle 3D-Modelle (img/…/*.glb) lassen sich im Browser mit dem Meshopt-Entpacker laden (werkzeug/modelle_komprimieren.mjs, client/src/welt3d/gltf.ts):
   jedes Modell öffnen, mindestens ein Mesh, Animationen zählen. Aufruf: node test/modelle-laden.test.mjs */
import { createRequire } from "node:module"; import { readFileSync, readdirSync, statSync } from "node:fs"; import { join, relative } from "node:path";
const require = createRequire(import.meta.url), { chromium } = require("playwright"), W = join(process.cwd(), ".."), T = join(process.cwd(), "node_modules", "three");
const alle = (d) => readdirSync(d).flatMap((n) => { const f = join(d, n); return statSync(f).isDirectory() ? alle(f) : n.endsWith(".glb") ? [relative(W, f)] : []; });
const liste = alle(join(W, "img"));
const br = await chromium.launch(), p = await br.newPage();
await p.route("http://x/**", (r) => { const u = decodeURIComponent(new URL(r.request().url()).pathname); const f = u.startsWith("/three/") ? join(T, u.slice(7)) : u === "/" ? null : join(W, u);
  if (!f) return r.fulfill({ contentType: "text/html", body: `<script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script>` });
  r.fulfill({ body: readFileSync(f), contentType: f.endsWith(".js") ? "text/javascript" : "model/gltf-binary" }); });
await p.goto("http://x/");
const erg = await p.evaluate(async (liste) => { const THREE = await import("three"), { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js"), { MeshoptDecoder } = await import("three/addons/libs/meshopt_decoder.module.js");
  const L = new GLTFLoader(); L.setMeshoptDecoder(MeshoptDecoder); const fehler = []; let clips = 0;
  for (const f of liste) { try { const g = await L.loadAsync("/" + f); let n = 0; g.scene.traverse((o) => { if (o.isMesh) n++; }); clips += g.animations.length; if (/\/werk_[^/]+\.glb$/.test(f) ? g.animations.length < 5 : !n) fehler.push(f + (n ? "" : ": kein Mesh") + (/\/werk_/.test(f) ? " (Werk-Bewegungen: fünf erwartet, " + g.animations.length + ")" : "")); /* werk_*.glb: nur Skelett und Bewegungen */ } catch (e) { fehler.push(f + ": " + e.message); } }
  return { fehler, clips }; }, liste);
await br.close();
console.log(`${liste.length} Modelle geladen, ${erg.clips} Animationen`); for (const f of erg.fehler) console.log("✗ " + f);
console.log(erg.fehler.length ? erg.fehler.length + " Fehler" : "Modelle laden: alles in Ordnung"); process.exit(erg.fehler.length ? 1 : 0);
