/*
 * Riftmere – Midgame-Bosse nach den Boss-Regeln (#178, doku/konzepte/midgame-bosse.md): je Boss Schläger oder Taktiker, eine klare Stil-Schwäche
 * (Magie 3, Fernkampf 2, Nahkampf 2), Rundumschlag plus 1–2 Kernmechaniken. Dazu die neuen Bausteine an Tjark: Unterbrechen (Sammelruf) und Ansturm in Linie.
 * Aufruf (im Ordner realtime, nach python3 werkzeug/weltzonen.py): node test/midgame-bosse.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-midgame-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/sim"; export * from "./shared/config"; export * from "./shared/karte"; export * from "./shared/karten"; export * from "./shared/kampfwerte"; export { BOSSE } from "./shared/bosse"; export { SCHWAECHE } from "./shared/boss";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { Sim, KARTEN, FEIN, setzeKarte, kampfwerte, NULL_XP, xpFuer, MONSTER, BOSSE, begehbar } = await import(datei);
setzeKarte(KARTEN.welt, FEIN);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
const SOLL = { rotmantel: ["schlaeger", "magie"], federmutter: ["taktiker", "fern"], wrackkapitaen: ["schlaeger", "magie"], tjark: ["schlaeger", "nah"],
  grauer_hauptmann: ["schlaeger", "magie"], oberster_rabenpriester: ["taktiker", "nah"], sandmutter: ["schlaeger", "fern"] };
const schwach = (typ) => { const A = MONSTER[typ].v2.abwehr; return ["nah", "fern", "magie"].sort((a, b) => A[a] - A[b])[0]; };
console.log("\nSteckbriefe");
for (const [typ, [art, st]] of Object.entries(SOLL)) { const B = BOSSE[typ], A = (B ? B.phasen : []).flatMap((p) => p.ansagen || []), mech = new Set();
  for (const p of B ? B.phasen : []) { if (p.ruf) mech.add("Diener"); if (p.schweben) mech.add("Stilwechsel"); if ((p.heilorte || []).length) mech.add("Gelände"); }
  for (const a of A) { if (a.deckung) mech.add("Deckung"); else if (a.unterbrechen) mech.add("Unterbrechen"); else if (a.felder === "ziel" || a.felder === "linie") mech.add(a.name === "Treibsand" ? "Gelände" : "Ausweichen"); }
  if (MONSTER.moorrabe.heiler && typ === "federmutter") mech.add("Diener");
  const n = mech.size; check(B && B.art === art && schwach(typ) === st && n >= 1 && n <= 2 && !(B.phasen.some((p) => p.hiebe && p.hiebe > 1)),
    `${MONSTER[typ].name}: ${art === "schlaeger" ? "Schläger" : "Taktiker"}, schwach gegen ${st === "nah" ? "Nahkampf" : st === "fern" ? "Fernkampf" : "Magie"} – ${[...mech].join(", ")}`); }
{ const z = { magie: 0, fern: 0, nah: 0 }; for (const typ of Object.keys(SOLL)) z[schwach(typ)]++; check(z.magie === 3 && z.fern === 2 && z.nah === 2, `Verteilung der Schwächen: Magie ${z.magie}, Fernkampf ${z.fern}, Nahkampf ${z.nah}`); }
check(!BOSSE.rotmantel.phasen.some((p) => (p.heilorte || []).length), "Rotmantel: kein Heiltrank am Thron mehr");

console.log("\nTjark: Sammelruf unterbrechen, Ansturm in Linie (Probe in der Kampfwelt)");
const L = (n) => { const X = { ...NULL_XP }; for (const k of Object.keys(NULL_XP)) X[k] = xpFuer(n); return X; };
function probe() { const s = Sim.welt(7, undefined, true), U = KARTEN.welt.ursprung; s.ursprung = [U[0], U[1]]; s.wesen = s.wesen.filter((w) => w.held);
  let p = null; for (let r = 0; r < 40 && !p; r++) for (let dx = -r; dx <= r && !p; dx++) { const x = 6560 + dx - U[0], y = 5820 - U[1]; if ([0, 1, 2, 3, 4, 5, 6, 7, 8].every((k) => begehbar(x + k, y))) p = { x: x + 0.5, y: y + 0.5 }; }
  const id = s.beitreten("schildwaechter", 0, { x: p.x + 1, y: p.y }, kampfwerte(L(60), { waffe: "eidschwert_legendaer" }, 1)), h = s.nach(id); h.max = h.lp = 1e6;
  const t = s.angreifer("tjark", { x: p.x, y: p.y }, id), b = s.wesen.find((w) => w.typ === "tjark"); return { s, h, b, id }; }
const lauf = (s, sek, bis) => { const ev = []; for (let i = 0; i < sek * 20; i++) { s.schritt(); ev.push(...s.zustand().ev); if (bis && bis(ev)) break; } return ev; };
{ const { s, h, b } = probe(); b.lp = Math.floor(b.max * 0.5); s.eingabe({ t: "auto", an: false }, h.id); h.zielId = 0;
  const ev = lauf(s, 20, (e) => e.some((x) => x.a === "ansage" && x.name === "Sammelruf")); const A = ev.find((x) => x.a === "ansage" && x.name === "Sammelruf");
  check(Boolean(A) && A.t >= 3, `Sammelruf wird angezeigt geladen (${A ? A.t : "–"} s)`);
  s.abziehen(b, 9, h); const ev2 = lauf(s, 0.2); check(!b.ansage && ev2.concat(s.zustand().ev).length >= 0 && b.boss.schwachBis > s.zeit, "mit genug Schaden unterbrochen: kein Ruf, Schwächefenster");
  const hilf = s.wesen.filter((w) => w.helfer === b.id && !w.tot).length; check(hilf === 0, "kein Deserteur kommt"); }
{ const { s, h, b } = probe(); b.lp = Math.floor(b.max * 0.5); s.eingabe({ t: "auto", an: false }, h.id); h.zielId = 0; /* der Held schlägt nicht zu */
  lauf(s, 20, (e) => e.some((x) => x.a === "ansage" && x.name === "Sammelruf")); lauf(s, 5, () => !b.ansage);
  check(s.wesen.some((w) => w.helfer === b.id && w.typ === "deserteur_schwert"), "nicht unterbrochen: ein Deserteur eilt herbei"); }
{ const { s, h, b } = probe(); const x0 = b.x, y0 = b.y; const ev = lauf(s, 15, (e) => e.some((x) => x.a === "ansage" && x.name === "Ansturm")); const A = ev.find((x) => x.a === "ansage" && x.name === "Ansturm");
  check(A && A.felder.length >= 10, `Ansturm: angezeigte Linie (${A ? A.felder.length : 0} Felder)`); }
{ /* Baustein Ansage.ansturm (für spätere Bosse): danach steht der Boss am Ende der Linie */ const { s, h, b } = probe(); const x0 = b.x, y0 = b.y;
  BOSSE.tjark.phasen[0].ansagen[0].ansturm = true; lauf(s, 15, (e) => e.some((x) => x.a === "ansage" && x.name === "Ansturm")); lauf(s, 2, () => !b.ansage); lauf(s, 0.1); BOSSE.tjark.phasen[0].ansagen[0].ansturm = undefined;
  check(Math.hypot(b.x - x0, b.y - y0) >= 2, `Baustein Ansturm: danach steht der Boss am Ende der Linie (${Math.hypot(b.x - x0, b.y - y0).toFixed(1)} Felder weiter)`); }
console.log(f ? `\nMidgame-Bosse: ${f} FEHLER` : "\nMidgame-Bosse: alles in Ordnung");
process.exit(f ? 1 : 0);
