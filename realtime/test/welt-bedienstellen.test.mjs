/*
 * Mythara – Bedienstellen (Welt #57), ohne Browser: jede Station, die das Spiel heute kennt (shared/handwerk.ts, shared/kochstellen.json) und jeder Kessel
 * bzw. Ofen in Kräuterhaus und Bäckerei der Waldmark: steht sie in einem Gebäude, gibt es einen Innenraum, eine Tür und einen Stehplatz drinnen,
 * der von der Tür aus erreichbar ist und in Greifweite (2,6) der Station liegt.
 * Aufruf (im Ordner realtime): node test/welt-bedienstellen.test.mjs   (vorher: node werkzeug/welt/bedienstellen.mjs)
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "../werkzeug/welt/laden.mjs";
let ok = true; const check = (b, t, e = []) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) { ok = false; for (const z of e.slice(0, 12)) console.log("      " + z); } };
const B = JSON.parse(readFileSync(join(WELT, "bedienstellen.json"), "utf8")).stationen;
console.log("\nBedienstellen");
const pflicht = ["esse", "amboss", "herd_taverne", "kessel_taverne", "kraeuterhaus_kessel", "baeckerei_ofen", "werkbank_osthof", "bindestein", "ort_schuppen_werkbank"];
const fehlt = pflicht.filter((id) => !B.some((s) => s.id === id)); check(!fehlt.length, `${pflicht.length} Stationen erfasst`, fehlt);
const spiel = B.filter((s) => s.quelle.startsWith("shared/") || pflicht.includes(s.id));
const innen = spiel.filter((s) => s.innen), schlecht = innen.filter((s) => !s.stehplatz || !s.tuer || !s.innenraum || Math.hypot(s.stehplatz[0] - s.x, s.stehplatz[1] - s.y) > 2.6);
check(innen.length >= 6, `${innen.length} Stationen in Gebäuden: ${innen.map((s) => s.id).join(", ")}`);
check(!schlecht.length, "alle mit Innenraum, Tür und erreichbarem Stehplatz in Greifweite", schlecht.map((s) => s.id));
const ids = B.map((s) => s.id); check(new Set(ids).size === ids.length, "Kennungen eindeutig");
console.log(ok ? "\nBedienstellen: alles in Ordnung" : "\nBedienstellen: FEHLER"); process.exit(ok ? 0 : 1);
