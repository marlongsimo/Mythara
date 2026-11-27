/*
 * Riftmere – Speer mit Reichweite 2 (Leitstelle): alle Stufen des Speers (sterndorn) schlagen im Nahkampf aus 2 Feldern zu – nicht über den Fernkampf.
 * Kampfwelt im Feldmodus (Sim.welt): mit dem Speer bleibt der Held 2 Felder entfernt stehen und trifft; mit dem Schwert muss er heran;
 * über eine Mauer hinweg trifft der Speer nicht. Ohne Server-Prozess. Aufruf (im Ordner realtime): node test/speer.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-speer-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/sim"; export * from "./shared/karte"; export * from "./shared/kampfwerte"; export { GEGENSTAENDE } from "./shared/gegenstaende";', resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { Sim, setzeKarte, kampfwerte, NULL_XP, xpFuer, GEGENSTAENDE, NAH_LANG } = await import(datei);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
const SPEERE = Object.keys(GEGENSTAENDE).filter((g) => /^sterndorn/.test(g));
console.log("\nWerte");
check(SPEERE.length === 5 && SPEERE.every((g) => GEGENSTAENDE[g].waffe.art === "nah" && GEGENSTAENDE[g].waffe.reich === 2), `alle ${SPEERE.length} Speere: Nahkampf mit Reichweite 2 (${SPEERE.join(", ")})`);
check(Object.values(GEGENSTAENDE).filter((G) => G.waffe && G.waffe.art === "nah" && !/^sterndorn/.test(G.id)).every((G) => G.waffe.reich < NAH_LANG), "alle anderen Nahkampfwaffen bleiben bei Reichweite 1");
check(kampfwerte({ ...NULL_XP }, { waffe: "sterndorn" }, 1).waffe.reich === 2 && kampfwerte({ ...NULL_XP }, { waffe: "sterndorn" }, 1).waffe.art === "nah", "in den Kampfwerten: art nah, Reichweite 2");

/* eine kleine Karte, Feldmodus wie die Kampfwelt: links frei, rechts eine durchgehende Mauer zwischen Held und Ziel */
const zeilen = Array.from({ length: 20 }, (_, j) => Array.from({ length: 30 }, (_, i) => (i === 20 ? "T" : ".")).join(""));
setzeKarte({ zeilen, start: [[1, 1]], lager: [] }, 1);
const lauf = (s, sek) => { const ev = []; for (let i = 0; i < sek * 20; i++) { s.schritt(); ev.push(...s.zustand().ev); } return ev; };
function kampf(waffe, hx, zx) {
  const s = Sim.welt(3, undefined, true); s.wesen = s.wesen.filter((w) => w.held); s["karte"].MEHRKAMPF = [[0, 0, 1e5, 1e5]];
  const id = s.beitreten("schildwaechter", 0, { x: hx, y: 10.5 }, kampfwerte({ ...NULL_XP, geschick: xpFuer(60), staerke: xpFuer(60) }, { waffe }, 1)), h = s.nach(id); h.max = h.lp = 1e6;
  const z = s["neu"](false, "heidewolf", 1, { x: zx, y: 10.5 }, true, 7); z.lp = z.max = 1e6; z.streifT = 1e9; z.tempo = 0; Object.assign(z, { wach: false, zielId: 0 });
  const vor = { x: h.x }; s.eingabe({ t: "ziel", id: z.id }, id); z.x = zx; z.y = 10.5; z.pfad = [];
  let treff = 0, weit = 0, minAbst = 99; for (let i = 0; i < 20 * 6; i++) { z.x = zx; z.y = 10.5; z.pfad = []; z.zielId = 0; s.schritt(); const d = Math.max(Math.abs(h.x - zx), Math.abs(h.y - 10.5));
    for (const e of s.zustand().ev) if (e.a === "schaden" && e.id === z.id) { treff++; if (d >= 2) weit++; } minAbst = Math.min(minAbst, d); }
  return { treff, weit, minAbst, bewegt: Math.abs(h.x - vor.x) > 0.5 || Math.abs(h.y - 10.5) > 0.5 };
}
console.log("\nIm Kampf (Feldmodus)");
{ const r = kampf("sterndorn", 10.5, 12.5); check(r.weit > 0 && r.weit === r.treff && !r.bewegt, `Speer aus 2 Feldern: trifft (${r.treff}×), ohne heranzugehen`); }
{ const r = kampf("eidschwert", 10.5, 12.5); check(r.bewegt && r.minAbst <= 1.01 && r.weit === 0, `Schwert: muss erst heran, kein Treffer aus 2 Feldern (kleinster Abstand ${r.minAbst})`); }
{ const r = kampf("sterndorn", 19.5, 21.5); check(r.weit === 0, `über die Mauer hinweg trifft der Speer nicht (${r.weit} Treffer aus 2 Feldern, ${r.treff} insgesamt)`); }
{ const r = kampf("sterndorn", 10.5, 13.5); check(r.bewegt && r.minAbst <= 2.01, `aus 3 Feldern geht der Held mit dem Speer bis auf 2 heran (kleinster Abstand ${r.minAbst})`); }
console.log(f ? `\nSpeer: ${f} FEHLER` : "\nSpeer: alles in Ordnung");
process.exit(f ? 1 : 0);
