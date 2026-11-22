// Baut den Client (nach ../echtzeit, wird von GitHub Pages ausgeliefert) und den Server (nach server/dist).
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const v = Date.now().toString(36), aus = new URL("../echtzeit/", import.meta.url).pathname;
mkdirSync(aus, { recursive: true });
await build({ entryPoints: ["client/src/main.ts"], bundle: true, minify: true, format: "iife", target: "es2020", outfile: aus + "spiel.js", legalComments: "none", define: { "process.env.NODE_ENV": '"production"' } });
writeFileSync(aus + "index.html", readFileSync("client/index.html", "utf8").replace("__V__", v));
writeFileSync(aus + "anmelden.html", readFileSync("client/anmelden.html", "utf8"));
/* Modulare 3D-Figuren (getrennt vom Spiel): isolierte Testszene und die Vorschau der Figuren-Pipeline */
await build({ entryPoints: ["client/src/figurentest.ts"], bundle: true, minify: true, format: "iife", target: "es2020", outfile: aus + "figurentest.js", legalComments: "none", define: { "process.env.NODE_ENV": '"production"' } });
writeFileSync(aus + "figurentest.html", readFileSync("client/figurentest.html", "utf8").replace("__V__", v));
/* 3D-Prototyp der Welt (eigene Seite, nicht Teil des Spiels) */
await build({ entryPoints: ["client/src/welt3d/main.ts"], bundle: true, minify: true, format: "iife", target: "es2020", outfile: aus + "welt3d.js", legalComments: "none" });
writeFileSync(aus + "welt3d.html", readFileSync("client/welt3d.html", "utf8").replace("__V__", v));
writeFileSync(aus + "figurenvorschau.html", readFileSync("character-pipeline/preview/index.html", "utf8"));
await build({ entryPoints: ["server/src/index.ts"], bundle: true, platform: "node", format: "cjs", target: "node20", outfile: "server/dist/server.js", external: ["bufferutil", "utf-8-validate"] });
await build({ stdin: { contents: 'export * from "./shared/sim"; export * from "./shared/config"; export * from "./shared/karte"; export * from "./shared/karten";', resolveDir: ".", loader: "ts" }, bundle: true, platform: "node", format: "esm", target: "node20", outfile: "test/sim.gebaut.mjs" });
console.log("gebaut: echtzeit/ (Client), server/dist/server.js (Server)");
