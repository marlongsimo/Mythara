/*
 * Riftmere – Läden nach Stadtstufe (#171, Grauwacht): ein Laden mit schalter (Laden.schalter) ist nur offen, wenn dieser Quest-Schalter für den Spieler an ist
 * (grauwacht_abtei nach E1, grauwacht_burg nach E3 – shared/stadtstufen.ts). Server (Kaufen, Verkaufen) und Browser prüfen mit ladenOffen gleich.
 * Aufruf (im Ordner realtime): node test/laden-stufen.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-ladenstufen-${process.pid}.mjs`);
await build({ stdin: { contents: 'export { LAEDEN, ladenOffen } from "./shared/laeden"; export { schalterAn } from "./shared/quests"; export { STAEDTE as STADTSTUFEN } from "./shared/stadtstufen"; export { ladenVerkauf } from "./server/src/verkauf";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { LAEDEN, ladenOffen, schalterAn, STADTSTUFEN, ladenVerkauf } = await import(datei);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
const G = STADTSTUFEN.find((s) => s.id === "grauwacht"), ABTEI = G.stufen.find((s) => s.id === "abtei").schalter, BURG = G.stufen.find((s) => s.id === "burg").schalter;
const probe = { ...LAEDEN.waffen, id: "probe_burg", schalter: BURG, zu: "Der Stand ist leer. Erst wenn die Burg wieder besetzt ist." };
console.log("\nLaden nur ab Stadtstufe");
check(ABTEI === "grauwacht_abtei" && BURG === "grauwacht_burg", "Grauwacht: Stufen Abtei (grauwacht_abtei) und Burg (grauwacht_burg)");
check(!ladenOffen(probe, () => "") && !ladenOffen(probe, () => "", () => false) && ladenOffen(probe, () => "", (x) => x === BURG), "zu ohne Schalter, offen mit grauwacht_burg");
check(!ladenOffen(probe, () => "", (x) => x === ABTEI), "die Abtei allein öffnet einen Burg-Laden nicht");
{ 
  const an = (stand) => (x) => schalterAn(stand, x); check(ladenOffen(probe, () => "", an(() => "fertig")) && !ladenOffen(probe, () => "", an(() => "")), "mit den echten Quest-Daten: alle Quests fertig → offen, keine begonnen → zu"); }
check(ladenOffen(LAEDEN.waffen, () => "") && ladenOffen(LAEDEN.waffen, () => "", () => false), "Läden ohne schalter bleiben wie bisher offen");
LAEDEN.probe_burg = probe;
{ const r = ladenVerkauf(async () => null, "niemand", "probe_burg", 0, 1, probe.x, probe.y, () => "", () => false); check(r.fehler === probe.zu, `Server: Verkaufen am geschlossenen Stand – „${r.fehler}“`); }
delete LAEDEN.probe_burg;
console.log(f ? `\nLäden nach Stadtstufe: ${f} FEHLER` : "\nLäden nach Stadtstufe: alles in Ordnung");
process.exit(f ? 1 : 0);
