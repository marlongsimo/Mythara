/*
 * Riftmere – die ganze Welt ist Kampfwelt (#122): auch die Festland-Kacheln (Fahle Weiten, Glutsande, Smaragdküste) gehören zur einen Kampfwelt.
 * Prüft: die Festland-Gebiete sind in WELTKAMPF (Raster in Lauflängen), ihre Lager stehen, ein Gegner dort greift einen Helden an und fällt.
 * Aufruf (im Ordner realtime, nach python3 werkzeug/weltzonen.py): node test/festland-kampf.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-festland-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/sim"; export * from "./shared/config"; export * from "./shared/karte"; export * from "./shared/karten"; export * from "./shared/kampfwerte"; export { startAusruestung } from "./shared/gegenstaende"; export { WELTKAMPF, WELTREGIONEN, laufAus } from "./shared/weltzonen";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { Sim, KARTEN, FEIN, setzeKarte, kampfwerte, NULL_XP, xpFuer, startAusruestung, WELTKAMPF, WELTREGIONEN, laufAus, weltRegionBei } = await import(datei);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
const FL = WELTKAMPF.filter((z) => z.region.startsWith("fl_"));
check(FL.length >= 20 && FL.every((z) => WELTREGIONEN.includes(z.region)), `${FL.length} Festland-Gebiete gehören zur Kampfwelt und zur gemeinsamen Welt`);
check(laufAus("3.2T.") === "...TT." && FL.every((z) => z.zeilen.length === z.h && z.zeilen[0].length === z.b), "Raster in Lauflängen, ausgeschrieben so groß wie das Gebiet");
check(weltRegionBei(6230, 7150) === "fl_186_211" && weltRegionBei(6480, 6420) !== "fl_186_211", "die Region an einer Stelle: Küste bleibt Küste, die Waldmark Waldmark");
const t0 = Date.now(); setzeKarte(KARTEN.welt, FEIN); const s = Sim.welt(22, undefined, true), U = KARTEN.welt.ursprung, ms = Date.now() - t0;
const n = (typ) => s.wesen.filter((w) => w.typ === typ && !w.tot && !w.gp).length; /* die gebauten Lager (ohne Gegnerplätze #130) */
check(n("strandkrabbe") >= 3 && n("heidewolf") >= 5 && n("sandkriecher") >= 1 && n("mangrovenlurch") === 3, `Lager auf dem Festland stehen (Strandkrabben ${n("strandkrabbe")}, Heidewölfe ${n("heidewolf")}, Sandkriecher ${n("sandkriecher")}, Lurche ${n("mangrovenlurch")})`);
check(ms < 15000, `die ganze Kampfwelt ist in ${ms} ms aufgebaut`);
{ /* eine Krabbe ohne Nachbarn (Gegnerplätze haben 1–3 Tiere; bei mehreren trifft oft ein anderes zuerst – das hing von der Reihenfolge der Plätze ab) */
  const k = s.wesen.find((w) => w.typ === "strandkrabbe" && !s.wesen.some((o) => o !== w && !o.tot && Math.hypot(o.x - w.x, o.y - w.y) < 8)), wx = U[0] + k.x, wy = U[1] + k.y;
  const id = s.beitreten("schildwaechter", 0, { x: k.x + 1, y: k.y }, kampfwerte({ ...NULL_XP, geschick: xpFuer(60), staerke: xpFuer(60), defense: xpFuer(60), lp: xpFuer(60) }, startAusruestung("schwert"), 1)), h = s.nach(id); h.max = h.lp = 1e5;
  const ev = []; for (let i = 0; i < 20 * 120 && !k.tot; i++) { s.schritt(); ev.push(...s.zustand().ev); }
  check(ev.some((e) => e.a === "hieb" && e.id === k.id) && h.lp < 1e5, `die Strandkrabbe bei ${Math.round(wx)}, ${Math.round(wy)} (${weltRegionBei(wx, wy)}) greift an`);
  check(k.tot && ev.some((e) => e.a === "beute" || e.a === "erlegt"), "und fällt (Beute, Sieg)"); }
console.log(f ? `\nFestland als Kampfwelt: ${f} FEHLER` : "\nFestland als Kampfwelt: alles in Ordnung");
process.exit(f ? 1 : 0);
