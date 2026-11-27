/*
 * Riftmere – Phase 11, die Hochlande beleben (doku/konzepte/phase-11.md, Figuren #148): Bewohner und Läden in Steinhag, am Bergwerk, an der Passwacht,
 * auf der Hohen Alm und in der Einsiedelei (Plätze der Welt, welt/hochlande_orte.json), nur vorhandene Waren, ein Trödler, die Bank von Steinhag,
 * Stationen dort, wo die Welt sie gebaut hat, Bergleute auf dem Weg Steinhag–Erzberg (nach der Uhr), das Wegstein-Ziel Steinhag vorbereitet (gesperrt bis H1).
 * Ohne Server-Prozess. Aufruf (im Ordner realtime, nach python3 werkzeug/weltzonen.py): node test/hochlande-leben.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readFileSync, existsSync } from "node:fs";
const WURZEL = new URL("..", import.meta.url).pathname, datei = join(tmpdir(), `riftmere-hochlande-${process.pid}.mjs`);
await build({ stdin: { contents: 'export { LAEDEN, LADEN_ZEICHEN, ladenOffen, STEINHAG_LAEDEN } from "./shared/laeden"; export { H_QUESTS } from "./shared/hochlande"; export { GEGENSTAENDE } from "./shared/gegenstaende"; export { WERKSTAETTEN, versperrt, werkstattErreichbar } from "./shared/handwerk"; export { BANKIERS, nahAnBank } from "./shared/bank"; export { REISENDE, ERZWEG, reiseStelle } from "./shared/reisende"; export { WEGSTEIN_ZIELE, STEINHAG_QUEST } from "./shared/wegstein"; export { QUESTS } from "./shared/quests";',
  resolveDir: WURZEL, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { LAEDEN, LADEN_ZEICHEN, ladenOffen, STEINHAG_LAEDEN, H_QUESTS, GEGENSTAENDE, WERKSTAETTEN, versperrt, werkstattErreichbar, BANKIERS, nahAnBank, REISENDE, ERZWEG, reiseStelle, WEGSTEIN_ZIELE, STEINHAG_QUEST, QUESTS } = await import(datei);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
const frei = (x, y) => !versperrt(Math.floor(x), Math.floor(y)), modell = (m) => existsSync(join(WURZEL, "..", "img", "figuren-echt3d", m + ".glb"));
const ORTE = JSON.parse(readFileSync(join(WURZEL, "welt", "hochlande_orte.json"), "utf8")), NPC = ORTE.npc;

console.log("\nBewohner und Läden");
const L = Object.values(LAEDEN).filter((l) => /^(steinhag_|hochland_)|^troedler_steinhag$/.test(l.id));
check(L.length === 15, `15 Bewohner in den Hochlanden (${L.length})`);
check(L.every((l) => NPC.some((n) => Math.hypot(n.x - l.x, n.y - l.y) <= 3)), "jeder steht an einem Platz der Welt (höchstens 3 Felder daneben)");
{ const schlecht = L.filter((l) => !frei(l.x, l.y) || !frei(l.vor[0], l.vor[1])).map((l) => l.id); check(!schlecht.length, `auf freiem Boden, der Platz davor erreichbar (${schlecht.join(", ") || "alle"})`); }
check(L.every((l) => l.waren.every((w) => GEGENSTAENDE[w.g] && !GEGENSTAENDE[w.g].untauschbar && w.preis > 0)), "Läden nur mit vorhandenen Waren");
check(["steinhag_taverne", "steinhag_schmiede", "steinhag_allerlei", "steinhag_kraeuter"].every((id) => LAEDEN[id].waren.length && LADEN_ZEICHEN[id]) && LAEDEN.troedler_steinhag.troedler, "Wirt, Schmied, zwei Marktstände mit Kartensymbol, ein Trödler");
check(L.filter((l) => l.nurReden).every((l) => (l.zeilen || []).length >= 1 && l.gruss && l.tschuess), "die übrigen reden nur – jeder mit Gruß, Abschied und eigenen Zeilen");
check(L.every((l) => modell(l.modell)), `Modelle aus dem Bestand und von Figuren (${[...new Set(L.map((l) => l.modell))].join(", ")})`);
{ const B = BANKIERS.find((b) => b.id === "steinhag_bank"); check(B && B.bank === "Bank von Steinhag" && nahAnBank("waldmark", 6969, 5881.5) && modell(B.modell), "die Bank von Steinhag"); }

console.log("\nStationen");
{ const S = WERKSTAETTEN.filter((w) => /_(steinhag|alm|passwacht|bergwerk|einsiedelei)$/.test(w.id)), naechstes = (W) => { for (let r = 1; r <= 3; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const x = Math.floor(W.x) + dx, y = Math.floor(W.y) + dy; if (frei(x, y)) return [x + 0.5, y + 0.5]; } return null; };
  check(S.length === 15 && S.every((w) => !w.schalter), `fünfzehn Stationen, ohne Schalter (${S.map((w) => w.id).join(", ")})`);
  const weg = S.filter((w) => { const p = naechstes(w); return !p || !werkstattErreichbar(p[0], p[1], w); }).map((w) => w.id); check(!weg.length, `jede ist zu Fuß erreichbar (${weg.join(", ") || "alle"})`); }

console.log("\nBergleute auf dem Erzweg");
{ const R = REISENDE.filter((r) => /erzweg$/.test(r.id)); check(R.length === 2 && R.every((r) => r.punkte === ERZWEG && modell(r.datei)), "zwei Bergleute pendeln Steinhag–Bergwerk");
  check(ERZWEG.every(([x, y]) => frei(x, y)) && Math.hypot(ERZWEG[0][0] - ORTE.orte.steinhag[0], ERZWEG[0][1] - ORTE.orte.steinhag[1]) < 15 && Math.hypot(ERZWEG.at(-1)[0] - ORTE.orte.bergwerk[0], ERZWEG.at(-1)[1] - ORTE.orte.bergwerk[1]) < 10, "der Weg liegt auf freiem Boden, von Steinhag bis vor den Stollen");
  let aus = 0; for (let t = 0; t < 4000; t += 7) for (const r of R) { const p = reiseStelle(r, t); if (!frei(p.x, p.y)) aus++; } check(aus === 0, `über eine ganze Runde auf begehbarem Boden (${aus} Stellen daneben)`); }

console.log("\nWegstein-Ziel Steinhag");
{ const Z = WEGSTEIN_ZIELE.find((z) => z.id === "steinhag"); check(Z && frei(Z.x, Z.y) && Z.quest === STEINHAG_QUEST, "vorbereitet, Ankunft auf freiem Boden am Markt");
  const H1 = QUESTS.find((q) => q.id === STEINHAG_QUEST); check(STEINHAG_QUEST === H_QUESTS.h1, `das Ziel öffnet sich mit H1 (${STEINHAG_QUEST})${H1 ? " – die Quest ist im Spiel" : " – die Quest kommt mit Block H"}`); }

console.log("\nLäden in Steinhag erst nach H1 (Entscheidung des Nutzers, 27.11.), die Bank immer");
{ const vor = (id) => "laeuft", nach = (id) => (id === H_QUESTS.h1 ? "fertig" : "");
  check(STEINHAG_LAEDEN.length === 5 && STEINHAG_LAEDEN.every((id) => LAEDEN[id] && LAEDEN[id].wenn && LAEDEN[id].wenn.quest === H_QUESTS.h1 && !ladenOffen(LAEDEN[id], vor) && ladenOffen(LAEDEN[id], nach) && LAEDEN[id].zu),
    `Taverne, Schmiede, Bergmarkt, Kräuter und Trödler: zu bis ${H_QUESTS.h1} fertig ist, dann offen`);
  check(Object.values(LAEDEN).filter((l) => /^hochland_/.test(l.id)).every((l) => !l.wenn), "die übrigen Hochländer (Steiger, Passwacht, Alm …) reden immer");
  const B = BANKIERS.find((b) => b.id === "steinhag_bank"); check(B && !B.wenn && !B.quest, "die Bank von Steinhag ist immer offen"); }

console.log(f ? `\nHochlande: ${f} FEHLER` : "\nHochlande: alles in Ordnung");
process.exit(f ? 1 : 0);
