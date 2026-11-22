/*
 * World Pipeline – liest Bibliotheken und Regionen aus realtime/welt/ und stellt die gemeinsame Rechnung (shared/welt) bereit.
 * Alle Werkzeuge der Pipeline (Prüfung, Bodenbäcker, Chunk-Bau, Editor-Dienst) holen ihre Daten hierüber.
 */
import { build } from "esbuild";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { join } from "node:path";

const HIER = fileURLToPath(new URL(".", import.meta.url));
export const REALTIME = join(HIER, "..", ".."), WURZEL = join(REALTIME, ".."), WELT = join(REALTIME, "welt");

/** shared/welt (und die Gegnerarten aus shared/config) für Node bündeln und laden */
export async function gemeinsam() {
  const aus = join(HIER, ".welt.gebaut.mjs");
  await build({ stdin: { contents: 'export * from "./shared/welt"; export { MONSTER } from "./shared/config"; export * as karte from "./shared/karte";', resolveDir: REALTIME, loader: "ts" }, bundle: true, format: "esm", platform: "node", outfile: aus, logLevel: "silent" });
  return import(pathToFileURL(aus).href + "?t=" + Date.now());
}

const json = (pfad) => { try { return JSON.parse(readFileSync(pfad, "utf8")); } catch (e) { throw new Error(`${pfad}: ${e.message}`); } };

export function bibliothek() {
  return { gelaende: json(join(WELT, "bibliothek", "gelaende.json")), objekte: json(join(WELT, "bibliothek", "objekte.json")) };
}
export const regionNamen = () => readdirSync(join(WELT, "regionen"), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
/** Eine Region so, wie sie im Repository liegt (RegionDaten) */
export function region(name) {
  const ordner = join(WELT, "regionen", name);
  if (!existsSync(ordner)) throw new Error(`Region „${name}“ gibt es nicht (${ordner})`);
  return {
    region: json(join(ordner, "region.json")),
    gelaende: readFileSync(join(ordner, "gelaende.txt"), "utf8").split(/\r?\n/).filter((z, i, a) => z.length > 0 || i < a.length - 1),
    objekte: json(join(ordner, "objekte.json")),
    spiel: json(join(ordner, "spiel.json")),
  };
}

/** Formprüfung von Bibliotheken und allen (oder den genannten) Regionen. Zurück: { name: Fehlerliste } */
export async function formPruefen(namen = regionNamen()) {
  const G = await gemeinsam(), bib = bibliothek(), aus = {};
  aus["bibliothek/gelaende"] = G.gelaendeFehler(bib.gelaende);
  aus["bibliothek/objekte"] = G.objekteFehler(bib.objekte);
  /* Bilder, auf die die Bibliotheken verweisen, müssen da sein */
  for (const a of bib.gelaende.arten || []) for (const p of [a.kachel, ...(a.varianten || []), a.rand && a.rand.bild]) if (p && !existsSync(join(WURZEL, p))) aus["bibliothek/gelaende"].push(`gelaende.${a.id}: Bild fehlt (${p})`);
  for (const o of bib.objekte.objekte || []) for (const p of [o.bild, ...Object.values(o.zustaende || {}).map((z) => z.bild)]) if (p && !existsSync(join(WURZEL, p))) aus["bibliothek/objekte"].push(`objekte.${o.id}: Bild fehlt (${p})`);
  const gegner = new Set(Object.keys(G.MONSTER)), geladen = [];
  for (const n of namen) {
    let d; try { d = region(n); } catch (e) { aus["regionen/" + n] = [e.message]; continue; }
    const f = G.regionFehler(d, bib.gelaende, bib.objekte, gegner);
    if (d.region && d.region.id !== n) f.push(`region.id „${d.region.id}“ passt nicht zum Ordnernamen „${n}“`);
    for (const r of geladen) if (!f.length && G.ueberlappen(r, d.region)) f.push(`überschneidet sich im Weltgitter mit Region „${r.id}“`);
    if (!f.length) geladen.push(d.region);
    aus["regionen/" + n] = f;
  }
  return aus;
}
