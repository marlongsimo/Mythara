/*
 * Riftmere – die Stufe jedes Gegners aus seinen Werten (Entscheidung des Nutzers, KANON 0eeea8e8b, #175): angezeigt wird MONSTER[art].stufe bzw. stufeVon(art, max)
 * – für jeden Gegner mit Werten (v2) genau die Rechnung gegnerStufe (wie das Heldenlevel, Lebenspunkte wie das LP-Level); die Quest-Fassung eines Bosses zeigt ihre eigene.
 * Aufruf (im Ordner realtime): node test/gegner-stufe.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-gegnerstufe-${process.pid}.mjs`);
await build({ stdin: { contents: 'export { MONSTER, stufeVon } from "./shared/config"; export { gegnerStufe, heldenlevel, NULL_XP, xpFuer } from "./shared/kampfwerte"; export { INSTANZEN } from "./shared/bosse"; export { QUEST_STAERKE } from "./shared/boss";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { MONSTER, stufeVon, gegnerStufe, heldenlevel, NULL_XP, xpFuer, INSTANZEN, QUEST_STAERKE } = await import(datei);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };

console.log("\nJede angezeigte Stufe passt zur Rechnung");
const MIT = Object.keys(MONSTER).filter((a) => MONSTER[a].v2), falsch = MIT.filter((a) => MONSTER[a].stufe !== gegnerStufe(MONSTER[a].v2, MONSTER[a].lp) || stufeVon(a) !== MONSTER[a].stufe);
check(MIT.length >= 60 && !falsch.length, `${MIT.length} Gegner mit Werten: Stufe = Rechnung (${falsch.join(", ") || "alle"})`);
check(Object.keys(MONSTER).filter((a) => !MONSTER[a].v2).every((a) => stufeVon(a) === (MONSTER[a].stufe ?? 1)), "Gegner ohne Werte (Frühzeit) behalten ihre gesetzte Stufe");
{ const X = { ...NULL_XP }; for (const k of Object.keys(NULL_XP)) X[k] = xpFuer(99); const H = heldenlevel(X);
  check(gegnerStufe({ geschick: 99, staerke: 99, defense: 99, ticks: 4, abwehr: { nah: 0, fern: 0, magie: 0 } }, 99) === H, `gleiche Rechnung wie das Heldenlevel (alle Skills 99: ${H})`); }

console.log("\nQuest-Fassungen zeigen ihre eigene Stufe (aus dem geminderten Leben)");
for (const D of INSTANZEN.filter((d) => d.danach && d.gegner)) { const g = D.gegner[0], M = MONSTER[g.art]; if (!M || !M.v2) continue; const Q = D.questStaerke || QUEST_STAERKE, lp = Math.max(1, Math.round(M.lp * Q.leben)), q = stufeVon(g.art, lp);
  check(q < M.stufe && q === gegnerStufe(M.v2, lp), `${M.name}: stark ${M.stufe}, in der Quest ${q}`); }

console.log(f ? `\nGegnerstufe: ${f} FEHLER` : "\nGegnerstufe: alles in Ordnung");
process.exit(f ? 1 : 0);
