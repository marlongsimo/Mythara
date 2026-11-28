/*
 * Riftmere – Skilling-Pets (#170, shared/pets.ts): Chance je Stufe der Ressource (Arbeitswert 1 : (60.000 − 800 × Stufe)) und das Folgen hinter dem Spieler.
 * Aufruf (im Ordner realtime): node test/pets.test.mjs   (Ende zu Ende: test/pets-welt.test.mjs)
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { existsSync } from "node:fs";
const WURZEL = new URL("..", import.meta.url).pathname, datei = join(tmpdir(), `riftmere-pets-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/pets"; export { beruf } from "./shared/berufe"; export { GEGENSTAENDE } from "./shared/gegenstaende";', resolveDir: WURZEL, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const M = await import(datei), { PETS, petFuerBeruf, petNenner, petChance, petAnsage, petFolgen, PET_FOLGE, beruf } = M;
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
console.log("\nPets");
check(petFuerBeruf("holzfaellerei").id === "nagbert" && petFuerBeruf("bergbau").id === "steinbert" && Object.values(PETS).every((p) => beruf(p.beruf)), "Nagbert (Holzfällerei), Steinbert (Bergbau)");
{ const { GEGENSTAENDE: G, petGegenstand, petAusGegenstand } = M; check(Object.values(PETS).every((p) => { const g = G[petGegenstand(p.id)]; return g && g.art === "Begleiter" && g.untauschbar && g.bild === p.bild && !g.symbol && petAusGegenstand(petGegenstand(p.id)) === p.id; }),
  "jedes Pet ist ein Gegenstand (KANON fd1014fd0): pet_nagbert, pet_steinbert – gebunden, festes Bild"); }
check(PETS.nagbert.datei === "pet.nagbert" && PETS.steinbert.datei === "pet.steinbert", `Modelle pet.nagbert / pet.steinbert (Figuren, #170)${Object.values(PETS).every((p) => existsSync(join(WURZEL, "..", "img", "figuren-echt3d", p.datei + ".glb"))) ? "" : " – Dateien kommen mit Figuren (41e453333)"}`);
console.log("\nChance je Stufe");
check(petNenner(1) === 59200 && petNenner(40) === 28000 && petNenner(65) === 8000, "Stufe 1 = 1 : 59.200 · Stufe 40 = 1 : 28.000 · Stufe 65 = 1 : 8.000");
check(petChance(65) > petChance(40) && petChance(40) > petChance(1) && petNenner(99) === 1000, "steigt mit der Stufe, nie häufiger als 1 : 1.000");
{ let z = 7, n = 0; const zf = () => (z = (z * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 400000; i++) if (zf() < petChance(65)) n++;
  check(n >= 30 && n <= 72, `fester Zufall: 400.000 Erze der Stufe 65 → ${n} Funde (erwartet etwa 50)`); }
check(petAnsage("Anna", PETS.nagbert) === "Anna hat beim Holzfällen einen kleinen Begleiter gefunden: Nagbert!", "Ansage im Chat");
console.log("\nFolgen");
{ let p = { x: 0, y: 0 }, tat = new Set(); const ziel = { x: 10, y: 0 }; for (let i = 0; i < 100; i++) { const s = petFolgen(p, ziel, 0.05); p = { x: s.x, y: s.y }; tat.add(s.tat); }
  check(Math.abs(Math.hypot(ziel.x - p.x, ziel.y - p.y) - PET_FOLGE.abstand) < 0.05 && tat.has("laufen") && tat.has("ruhe"), `läuft hinterher und bleibt ${PET_FOLGE.abstand} Felder hinter dem Spieler stehen`);
  const s = petFolgen({ x: 0, y: 0 }, { x: 50, y: 0 }, 0.05); check(Math.hypot(50 - s.x, s.y) < 2, "zu weit weg (Teleport): springt zum Spieler"); }
console.log(f ? `\nPets: ${f} FEHLER` : "\nPets: alles in Ordnung");
process.exit(f ? 1 : 0);
