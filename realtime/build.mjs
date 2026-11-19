// Baut den Client (nach ../echtzeit, wird von GitHub Pages ausgeliefert) und den Server (nach server/dist).
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const v = Date.now().toString(36), aus = new URL("../echtzeit/", import.meta.url).pathname;
mkdirSync(aus, { recursive: true });
await build({ entryPoints: ["client/src/main.ts"], bundle: true, minify: true, format: "iife", target: "es2020", outfile: aus + "spiel.js", legalComments: "none", define: { "process.env.NODE_ENV": '"production"' } });
writeFileSync(aus + "index.html", readFileSync("client/index.html", "utf8").replace("__V__", v));
await build({ entryPoints: ["server/src/index.ts"], bundle: true, platform: "node", format: "cjs", target: "node20", outfile: "server/dist/server.js", external: ["bufferutil", "utf-8-validate"] });
await build({ entryPoints: ["shared/sim.ts"], bundle: true, platform: "node", format: "esm", target: "node20", outfile: "test/sim.gebaut.mjs" });
console.log("gebaut: echtzeit/ (Client), server/dist/server.js (Server)");
