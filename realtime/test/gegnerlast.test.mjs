/*
 * Riftmere – Last der großen Kampfwelt (#122/#130): Gegner fern aller Helden ruhen, jeder Spieler bekommt nur Wesen in seiner Nähe,
 * die Rempel-Prüfung ohne Server vergleicht nur Nachbarn. Mit den Gegnerplätzen der Welt (welt/gegnerplaetze.json) sind es rund 2.900 Gegner.
 * Aufruf (im Ordner realtime, nach python3 werkzeug/weltzonen.py): node test/gegnerlast.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-last-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/sim"; export * from "./shared/karte"; export * from "./shared/karten"; export * from "./shared/kampfwerte"; export { startAusruestung } from "./shared/gegenstaende";', resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { Sim, KARTEN, FEIN, setzeKarte, kampfwerte, NULL_XP, startAusruestung, AKTIV_WEIT, SICHT_WEIT } = await import(datei);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
setzeKarte(KARTEN.welt, FEIN); const s = Sim.welt(3, undefined, true), U = KARTEN.welt.ursprung, G = s.wesen.filter((w) => !w.held);
console.log(`  ${G.length} Gegner in der einen Kampfwelt${G.some((w) => w.gp) ? ` (davon ${G.filter((w) => w.gp).length} aus den Gegnerplätzen #130)` : ""}`);
for (const [wx, wy] of [[6230, 7150], [7100, 6900], [6560, 5900]]) s.beitreten("schildwaechter", 0, { x: wx - U[0], y: wy - U[1] }, kampfwerte({ ...NULL_XP }, startAusruestung("schwert"), 1));
const ids = s.wesen.filter((w) => w.held).map((w) => w.id), fern = G.find((w) => s.wesen.filter((o) => o.held).every((o) => Math.abs(o.x - w.x) > AKTIV_WEIT + 20 || Math.abs(o.y - w.y) > AKTIV_WEIT + 20));
const vor = fern && { x: fern.x, y: fern.y, cd: fern.streifT }; let t = performance.now(), bytes = 0;
for (let i = 0; i < 200; i++) { s.schritt(); const z = s.zustand(); for (const id of ids) bytes += JSON.stringify(s.sichtFuer(z, id)).length; }
const ms = performance.now() - t;
check(ms < 4000, `10 s Kampfwelt mit 3 Helden: ${Math.round(ms)} ms (je Schritt ${(ms / 200).toFixed(1)} ms von 50)`);
check(!fern || (fern.x === vor.x && fern.y === vor.y), "ein Gegner fern aller Helden ruht (bewegt sich nicht)");
{ const z = s.zustand(), a = s.sichtFuer(z, ids[0]), h = s.nach(ids[0]);
  check(a.w.filter((e) => e[1] !== 1).every((e) => Math.abs(e[4] - h.x) <= SICHT_WEIT && Math.abs(e[5] - h.y) <= SICHT_WEIT) && a.w.length < 200, `ein Spieler sieht nur die Nähe (${a.w.length} von ${z.w.length} Wesen, ${Math.round(bytes / 600)} Bytes je Nachricht)`); }
{ const l = new Sim("schildwaechter", 1, []); const t1 = performance.now(); for (let i = 0; i < 40; i++) l.schritt(); const m1 = performance.now() - t1;
  check(m1 < 2000, `ohne Server (der Browser rechnet selbst): 40 Schritte in ${Math.round(m1)} ms, Zustand ${JSON.stringify(l.zustand()).length} Bytes`); }
console.log(f ? `\nLast: ${f} FEHLER` : "\nLast: alles in Ordnung");
process.exit(f ? 1 : 0);
