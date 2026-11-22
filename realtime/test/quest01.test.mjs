/*
 * Mythara – Quest 01 ohne Server: Dialogbuch vollständig (jede Antwort jedes Dialogs führt irgendwohin), Reihenfolge, Schriftstück-Bedingung (35 % nur solange die Quest läuft),
 * Sperren liegen auf Wegen, Figuren stehen auf begehbaren Feldern. Aufruf: node test/quest01.test.mjs
 */
import { build } from "esbuild"; import { fileURLToPath } from "node:url"; import path from "node:path"; import fs from "node:fs";
const HIER = path.dirname(fileURLToPath(import.meta.url)), AUS = path.join(HIER, ".quest01.gebaut.mjs");
await build({ stdin: { contents: 'export * from "./server/src/quests"; export * from "./server/src/inventar"; export * from "./shared/quest01";', resolveDir: path.join(HIER, ".."), loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: AUS, logLevel: "error" });
const Q = await import(AUS); fs.unlinkSync(AUS);
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
/* Dialogbuch: für jede Figur und jeden Stand gibt es einen Dialog, jede angebotene Antwort ist bekannt */
{ let fehlt = [], dialoge = 0; for (const n of Q.NPCS) for (const s of ["", ...Q.STAENDE]) for (const hat of [false, true]) { const d = Q.dialog(n.id, s, hat); if (!d) { fehlt.push(`${n.id}/${s}`); continue; } dialoge++;
    for (const a of d.antworten) if (!Q.antwort(n.id, s, hat, a.id)) fehlt.push(`${n.id}/${s || "–"}/${a.id}`); }
  check(!fehlt.length, `Dialogbuch: ${dialoge} Dialoge, jede Antwort führt irgendwohin${fehlt.length ? " – fehlt: " + fehlt.join(", ") : ""}`); }
/* der Weg durch die Quest: jeder Schritt nur an seiner Stelle */
{ const weg = [["jori", "", false, "annehmen", "angenommen"], ["hagan", "angenommen", false, "osthof", "auftrag"], ["fenna", "auftrag", false, "weiter", "osthof"], ["raban", "osthof", false, "lager", "wachen"], ["hagan", "beweis", true, "zeigen", "bestaetigt"], ["tilda", "bestaetigt", false, "durch", "frei"]];
  check(weg.every(([n, s, h, a, neu]) => (Q.antwort(n, s, h, a) || {}).stand === neu), "Der Weg: Jori → Hagan → Fenna → Wachen → Hagan (Schriftstück) → Wachen");
  check(!Q.antwort("hagan", "auftrag", true, "zeigen") && !Q.antwort("hagan", "osthof", true, "zeigen") && (Q.antwort("hagan", "wachen", true, "zeigen") || {}).stand === "bestaetigt", "Das Schriftstück zählt erst, wenn man bei den Wachen war");
  check(!Q.antwort("fenna", "angenommen", false, "weiter") && !Q.antwort("raban", "auftrag", false, "lager") && !Q.antwort("othmar", "bestaetigt", false, "helfen"), "Schritte außer der Reihe gibt es nicht");
  check((Q.antwort("othmar", "frei", false, "helfen") || {}).abschluss && (Q.antwort("hagan", "wachen", true, "zeigen") || {}).abgeben, "Abschluss bei Othmar, Beweis wird bei Hagan abgegeben"); }
/* Bedingung des Schriftstücks: nur solange die Quest läuft */
{ const sb = async () => [{ quests: {} }], st = {}; for (const s of ["", ...Q.STAENDE]) st[s] = Q.laeuft(s);
  check(!st[""] && !st.angeboten && st.angenommen && st.wachen && st.frei && !st.fertig, "35 %-Wurf nur zwischen „angenommen“ und „frei“ (nicht vorher, nicht nach dem Abschluss)");
  await Q.questsLaden(sb, "u1"); check(Q.bedingungErfuellt("u1", "einsteigerquest") === false, "Spieler ohne Quest: kein Schriftstück"); }
/* Figuren auf begehbaren Feldern, Sperren über den Weg */
{ const gel = (r) => fs.readFileSync(path.join(HIER, "..", "welt", "regionen", r, "gelaende.txt"), "utf8").split("\n"), R = { waldmark: [6400, 6400], osthof: [6496, 6400], waldweg: [6336, 6464], weidenhain: [6400, 6656], westmark: [6272, 6464] };
  const feld = (x, y) => { for (const [r, [ox, oy]] of Object.entries(R)) { const g = gel(r), lx = Math.floor(x) - ox, ly = Math.floor(y) - oy; if (ly >= 0 && ly < g.length && lx >= 0 && lx < g[ly].length) return g[ly][lx]; } return "?"; };
  const geh = (c) => c !== "f" && c !== "?" && c !== "o";
  check(Q.NPCS.every((n) => geh(feld(n.x, n.y))), `Alle Figuren stehen auf begehbarem Boden (${Q.NPCS.map((n) => n.id + ":" + feld(n.x, n.y)).join(" ")})`);
  for (const sp of Q.SPERREN) { const [x0, y0, x1, y1] = sp.feld; let wegFelder = 0, offen = 0; for (let x = x0 - 6; x < x1 + 6; x++) { const c = feld(x, y0); if (c === "e" || c === "m") { wegFelder++; if (x < x0 || x >= x1) offen++; } }
    check(wegFelder > 0 && offen === 0, `Sperre „${sp.id}“ liegt quer über dem Weg (${wegFelder} Wegfelder, keines daneben frei)`); } }
console.log(f ? `${f} Prüfung(en) fehlgeschlagen` : "Quest 01 (Regeln): alles in Ordnung"); process.exit(f ? 1 : 0);
