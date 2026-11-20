// Gibt die Karte (Fels, Lager, Start, Siegel) als JSON aus – für das Werkzeug, das Boden und Wände malt.
import { build } from "esbuild";
import { pathToFileURL } from "node:url";
const aus = new URL("./.karte.gebaut.mjs", import.meta.url).pathname;
await build({ entryPoints: [new URL("../shared/karte.ts", import.meta.url).pathname], bundle: true, format: "esm", platform: "node", outfile: aus, logLevel: "silent" });
const K = await import(pathToFileURL(aus).href);
process.stdout.write(JSON.stringify({ KB: K.KB, KH: K.KH, FELS: Array.from(K.FELS), LAGER: K.LAGER, START: K.START, SIEGEL: K.SIEGEL }));
