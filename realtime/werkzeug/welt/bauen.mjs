/*
 * World Pipeline – baut Regionen für das Spiel.
 * Aufruf (im Ordner realtime): node werkzeug/welt/bauen.mjs [region …] [--mit-boden]
 *
 * Schritte je Region: auf Felder ausrichten (ausrichten.mjs) → Formprüfung → Gehraster und Chunk-Dateien → Übersichtskarte (karte.py, aus den Geländefarben).
 * Bodenbilder (werkzeug/welt/boden.py) werden seit 26.11.2026 (#13) nicht mehr gebacken – nur noch mit --mit-boden (die 2D-Ersatzwelt nutzt die alten noch).
 * Ergebnis in ../echtzeit/welt/:  welt.json (Regionen, verwendete Objekte) · <cx>_<cy>.json (Chunk) · <cx>_<cy>.webp (Boden)
 * Ohne Angabe werden alle Regionen gebaut. Bricht ab, wenn die Formprüfung Fehler meldet.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { gemeinsam, bibliothek, region, regionNamen, formPruefen, WURZEL, REALTIME } from "./laden.mjs";
import { ausrichten } from "./ausrichten.mjs";

const args = process.argv.slice(2), ohneBoden = !args.includes("--mit-boden") /* seit 26.11.2026 (#13): keine Bodenbilder mehr backen, Karten aus den Geländefarben; --mit-boden backt sie wie früher */, gewaehlt = args.filter((a) => !a.startsWith("--"));
/* Ohne Angabe: alle Regionen außer Entwürfen */
const namen = gewaehlt.length ? gewaehlt : regionNamen().filter((n) => !region(n).region.entwurf), ziel = join(WURZEL, "echtzeit", "welt");
/* zuerst alles auf Felder ausrichten (Grundregel: Bild und Kollision decken sich feldgenau) */
await ausrichten(namen);
const fehler = Object.entries(await formPruefen(namen)).filter(([, f]) => f.length);
if (fehler.length) { for (const [n, f] of fehler) { console.log("✗ " + n); for (const z of f.slice(0, 20)) console.log("    " + z); } console.log("\nNicht gebaut: erst die Fehler beheben."); process.exit(1); }

const G = await gemeinsam(), bib = bibliothek(); mkdirSync(ziel, { recursive: true });
const SYMBOLE = JSON.parse(readFileSync(join(REALTIME, "welt", "bibliothek", "kartensymbole.json"), "utf8"));
const mitte = (l) => ({ x: +(l.baeume.reduce((t, b) => t + b.x, 0) / l.baeume.length).toFixed(1), y: +(l.baeume.reduce((t, b) => t + b.y, 0) / l.baeume.length).toFixed(1) });
const SAMMELORTE = [...JSON.parse(readFileSync(join(REALTIME, "shared", "holz_standorte.json"), "utf8")).lichtungen.map((l) => ({ s: "holzfaellerei", region: l.baeume[0].region, ...mitte(l) })),
  ...JSON.parse(readFileSync(join(REALTIME, "shared", "bergbau_standorte.json"), "utf8")).senken.map((k) => ({ s: "mine", region: k.adern[0].region, x: k.x, y: k.y }))];
/* welt.json wächst mit: Regionen, die diesmal nicht gebaut werden, bleiben stehen */
const indexPfad = join(ziel, "welt.json"), index = existsSync(indexPfad) ? JSON.parse(readFileSync(indexPfad, "utf8")) : { regionen: {}, objekte: {} };
index.feldPx = G.FELD_PX; index.chunkFelder = G.CHUNK_FELDER; index.kartensymbole = SYMBOLE.symbole;
for (const n of namen) {
  const gebaut = G.chunksBauen(region(n), bib.gelaende, bib.objekte);
  for (const c of gebaut.chunks) writeFileSync(join(ziel, `${c.cx}_${c.cy}.json`), JSON.stringify(c));
  /* Kartensymbole (welt/bibliothek/kartensymbole.json): an die Stelle der genannten Interaktion oder Figur, in Weltfeldern */
  { const r = region(n), ox = r.region.ursprung[0] * G.CHUNK_FELDER, oy = r.region.ursprung[1] * G.CHUNK_FELDER, zuordnung = SYMBOLE.orte[n] || {};
    const symbole = Object.entries(zuordnung).map(([id, s]) => { const q = r.spiel.interaktionen.find((i) => i.id === id) || r.spiel.figuren.find((f) => f.id === id);
      if (!q) throw new Error(`Kartensymbol ${s}: ${n} hat keine Interaktion oder Figur „${id}“`); if (!SYMBOLE.symbole[s]) throw new Error(`Kartensymbol „${s}“ ist nicht beschrieben`);
      return { s, x: +(q.x + ox).toFixed(2), y: +(q.y + oy).toFixed(2) }; });
    for (const q of (SYMBOLE.punkte || {})[n] || []) { if (!SYMBOLE.symbole[q.s]) throw new Error(`Kartensymbol „${q.s}“ ist nicht beschrieben`); symbole.push({ s: q.s, x: q.x, y: q.y }); }
    /* Holzfäller-Lichtungen und Bergbau-Senken: ein Symbol in der Mitte */
    for (const l of SAMMELORTE) if (l.region === n) symbole.push({ s: l.s, x: l.x, y: l.y });
    index.regionen[n] = { ...gebaut.kopf, benutzt: gebaut.benutzt, ...(symbole.length ? { symbole } : {}) }; }
  const frei = gebaut.chunks.reduce((s, c) => s + c.geh.join("").split(".").length - 1, 0), felder = gebaut.chunks.length * G.CHUNK_FELDER ** 2;
  console.log(`✓ ${n}: ${gebaut.chunks.length} Chunks, ${gebaut.chunks.reduce((s, c) => s + c.objekte.length, 0)} Objekte, ${Math.round(100 * frei / felder)} % begehbar`);
  if (!ohneBoden) { const r = spawnSync("python3", ["werkzeug/welt/boden.py", n, "--vorschau"], { cwd: REALTIME, stdio: "inherit" }); if (r.status !== 0) process.exit(r.status || 1); }
}
/* Nur die Objekte ausliefern, die irgendeine Region benutzt – und nur, was die Darstellung braucht */
const benutzt = new Set(Object.values(index.regionen).flatMap((r) => r.benutzt)); index.objekte = {};
for (const o of bib.objekte.objekte) if (benutzt.has(o.id) && o.vielfalt) for (const v of o.vielfalt) benutzt.add(v);   /* Farbvarianten (vielfalt) mit ausliefern */
for (const o of bib.objekte.objekte) if (benutzt.has(o.id)) index.objekte[o.id] = { bild: o.bild, groesse: o.groesse, anker: o.anker, massstab: o.massstab, tiefe: o.tiefe,
  ...(o.durchscheinend ? { durchscheinend: true } : {}), ...(o.animation ? { animation: o.animation } : {}), ...(o.effekte ? { effekte: o.effekte } : {}), ...(o.zustaende ? { zustaende: o.zustaende } : {}), ...(o.interaktion ? { interaktion: o.interaktion } : {}), ...(o.vielfalt ? { vielfalt: o.vielfalt } : {}), ...(o.modell3d ? { modell3d: o.modell3d } : {}),
  ...(o.ebenen ? { ebenen: o.ebenen, raum: o.raum || [], tueren: o.tueren || [] } : {}) };
/* Symbole der Holzfäller-Lichtungen und Bergbau-Senken in ALLEN Regionen erneuern – auch in denen, die diesmal nicht gebaut wurden
   (sonst fehlten neue Standorte auf Karte und Minikarte, bis ihre Region neu gebaut wird; 26.11.2026) */
for (const [n, r] of Object.entries(index.regionen)) { const rest = (r.symbole || []).filter((q) => q.s !== "holzfaellerei" && q.s !== "mine"), neu = SAMMELORTE.filter((l) => l.region === n).map((l) => ({ s: l.s, x: l.x, y: l.y }));
  if (rest.length + neu.length) r.symbole = [...rest, ...neu]; else delete r.symbole; }
index.stand = Date.now().toString(36);   /* Kennung dieses Baus: das Spiel hängt sie an die Dateien der Welt (gegen veraltete Bilder im Browser) */
writeFileSync(indexPfad, JSON.stringify(index));
console.log(`geschrieben: echtzeit/welt/welt.json (${Object.keys(index.regionen).length} Regionen, ${Object.keys(index.objekte).length} Objekte)`);
/* Übersichtskarten (Minimap) mit Baumkronen neu zeichnen, damit der Wald als Wald erkennbar ist (werkzeug/welt/karte.py) */
{ const r = spawnSync("python3", ["werkzeug/welt/karte.py", ...namen, ...(ohneBoden ? [] : ["--gebacken"])], { cwd: REALTIME, stdio: "inherit" }); if (r.status !== 0) process.exit(r.status || 1); }
