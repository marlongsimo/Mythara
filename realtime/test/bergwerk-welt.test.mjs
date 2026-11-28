/*
 * Riftmere – das Erzberg-Bergwerk (#147, Welt c51186c7): Eingang am Erzberg und Ausgang im Füllort (eingang mit ziel wie bei den Klippenhöhlen),
 * Untergrund hochlande_bergwerk mit Füllort, Trollhalle und Urkammer. Geprüft in der Kampfwelt des Servers (Sim.welt, Gehraster aus weltzonen.py):
 * ein Held springt durch den Eingang hinein, läuft zur Trollhalle und zur Urkammer, und der Ausgang führt auf begehbaren Boden am Erzberg.
 * Ohne die Welt-Daten (Region noch nicht eingemischt) wird übersprungen. Aufruf (im Ordner realtime, nach python3 werkzeug/weltzonen.py): node test/bergwerk-welt.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readFileSync, existsSync } from "node:fs";
const WURZEL = new URL("..", import.meta.url).pathname, datei = join(tmpdir(), `riftmere-bergwerk-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/sim"; export * from "./shared/karte"; export * from "./shared/karten"; export * from "./shared/kampfwerte"; export { startAusruestung } from "./shared/gegenstaende"; export { WELTKAMPF } from "./shared/weltzonen";',
  resolveDir: WURZEL, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { Sim, KARTEN, FEIN, setzeKarte, kampfwerte, NULL_XP, startAusruestung, WELTKAMPF, begehbar } = await import(datei);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
const spiel = (r) => { const p = join(WURZEL, "welt", "regionen", r, "spiel.json"); return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null; };
const Z = WELTKAMPF.find((z) => z.region === "hochlande_bergwerk"), unten = spiel("hochlande_bergwerk");
if (!Z || !unten) { console.log("\nBergwerk: die Region hochlande_bergwerk ist noch nicht eingemischt (Welt c51186c7) – übersprungen"); process.exit(0); }
const IA = new Map(); for (const r of ["hochlande_bergwerk", "fl_216_169", "fl_216_183", "fl_231_169"]) for (const i of (spiel(r) || { interaktionen: [] }).interaktionen) IA.set(i.id, { ...i, r });
const ein = IA.get("bergwerk_eingang"), hin = IA.get("bergwerk_hinaus"), welt = (i) => { const R = WELTKAMPF.find((z) => z.region === i.r); return [R.x0 + i.x, R.y0 + i.y]; };
console.log("\nEingang und Ausgang");
check(ein && hin && ein.art === "eingang" && hin.art === "eingang" && ein.daten.ziel && hin.daten.ziel, "bergwerk_eingang und bergwerk_hinaus mit Ziel");
const inZone = (z, [x, y]) => x >= z.x0 && y >= z.y0 && x < z.x0 + z.b && y < z.y0 + z.h;
check(inZone(Z, ein.daten.ziel) && !inZone(Z, hin.daten.ziel), "der Eingang führt in den Untergrund, der Ausgang hinaus");
setzeKarte(KARTEN.welt, FEIN); const U = KARTEN.welt.ursprung, s = Sim.welt(4, undefined, true), frei = ([x, y]) => begehbar(x - U[0], y - U[1]);
check(frei(ein.daten.ziel) && frei(hin.daten.ziel), "beide Ziele sind im Gehraster der Kampfwelt begehbar");
check(Z.lager.every((l) => l.art === "grumhold") && Z.lager.length <= 1 && Z.stufe >= 1, `das Bergwerk ist Teil der Kampfwelt (${Z.b}×${Z.h} Felder), als Gegner höchstens Grumhold in der Halle (#160, öffentlich, friedlich bis H4)`);
console.log("\nZu Fuß durch das Bergwerk");
s.wesen = s.wesen.filter((w) => w.held); const id = s.beitreten("schildwaechter", 0, { x: ein.daten.ziel[0] - U[0], y: ein.daten.ziel[1] - U[1] }, kampfwerte({ ...NULL_XP }, startAusruestung("schwert"), 1)), h = s.nach(id);
const hin_ = (p) => { s.eingabe({ t: "lauf", x: p[0] - U[0], y: p[1] - U[1] }, id); for (let i = 0; i < 20 * 120 && Math.hypot(h.x - (p[0] - U[0]), h.y - (p[1] - U[1])) > 2.2; i++) s.schritt(); return Math.hypot(h.x - (p[0] - U[0]), h.y - (p[1] - U[1])) <= 2.2; };
for (const ort of ["bergwerk_trollhalle", "bergwerk_urkammer", "bergwerk_hinaus"]) { const I = IA.get(ort); check(I && hin_(welt(I)), `vom Eingang zu Fuß bis ${ort.replace("bergwerk_", "")}`); }
console.log(f ? `\nBergwerk: ${f} FEHLER` : "\nBergwerk: alles in Ordnung");
process.exit(f ? 1 : 0);
