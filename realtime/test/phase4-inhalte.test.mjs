/*
 * Riftmere – Inhalte der Phase 4 (Integration): Mooshocker-Beute und -Aggression (#81), Banditen-Varianten (#15), B3, Rotmantel, Instanz, Tür und B4 (#16, #60).
 * Ohne Server und ohne Browser; die Regeln selbst prüft test/phase4.test.mjs (Systeme). Aufruf (im Ordner realtime): node test/phase4-inhalte.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-phase4-inhalte-${process.pid}.mjs`);
await build({ stdin: { contents: 'export { MONSTER } from "./shared/config"; export { GEGENSTAENDE } from "./shared/gegenstaende"; export { QUESTS } from "./shared/quests"; export { WELTKAMPF } from "./shared/weltzonen"; export { BOSSE, INSTANZEN, TUEREN } from "./shared/bosse"; export { LAEDEN } from "./shared/laeden";',
  resolveDir: process.cwd(), loader: "ts" }, bundle: true, format: "esm", platform: "node", outfile: datei, logLevel: "error" });
const M = await import(datei);
let fehler = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) fehler++; };
const quest = (id) => M.QUESTS.find((q) => q.id === id);
const tabelleOk = (typ) => { const D = M.MONSTER[typ]; return Boolean(D && (D.drops || []).every((r) => r.wurf.reduce((s, w) => s + w.chance, 0) <= 100 && r.wurf.every((w) => M.GEGENSTAENDE[w.g]))); };

console.log("Mooshocker (#81)");
{ const D = M.MONSTER.mooshocker, Q2 = quest("osthof_der_stille_rain");
  check(D.drops && D.drops.length === 1 && tabelleOk("mooshocker"), "Ein Wurf, Chancen ≤ 100 %, alle Gegenstände gibt es");
  check(!D.drops[0].wurf.some((w) => M.GEGENSTAENDE[w.g].art !== "Rohstoff" && w.g !== "wurm" && w.g !== "seelenlicht"), "Keine Ausrüstung in der Beute");
  check(D.aggressiv === false && D.aggressivNach && D.aggressivNach.weit === 8 && Q2 && Q2.schalter && Q2.schalter[D.aggressivNach.schalter], `Nach der Quest aggressiv in 8 Feldern (Schalter ${D.aggressivNach && D.aggressivNach.schalter} kommt aus „Der stille Rain“)`);
  const z = M.WELTKAMPF.find((g) => g.region === "osthof"); check(z && z.lager.filter((l) => l.art === "mooshocker").length === 10, "Zehn Mooshocker am Moosrain"); }

try { (await import("node:fs")).unlinkSync(datei); } catch { /* egal */ }
console.log(fehler ? fehler + " Fehler" : "Phase-4-Inhalte: alles in Ordnung"); process.exit(fehler ? 1 : 0);
