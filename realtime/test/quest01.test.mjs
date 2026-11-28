/*
 * Riftmere – Quest 1 und alle Questfiguren ohne Server (seit dem Quest-Baukasten, #10). Dialoge und Erreichbarkeit prüft questbau.test.mjs für alle Quests,
 * den Ablauf mit Server quest01-welt. Hier: das Schriftstück (Hinweispergament) fällt nur mit dem Auftrag, es zu sichern (Beute-Bedingung von Quest 1),
 * und jede Questfigur jeder Quest steht auf einem begehbaren Feld (Gehraster aus shared/weltzonen.ts). Aufruf: node test/quest01.test.mjs (nach node build.mjs)
 */
import fs from "node:fs";
import { QB, QUEST1, QUESTS } from "./sim.gebaut.mjs";
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
const K = { hat: () => false, verloren: () => false };

/* Schriftstück: Beute-Bedingung „einsteigerquest“ gilt nur, solange der Schritt „wachen“ erledigt und „beweis“ offen ist */
{ const B = QUEST1.beute && QUEST1.beute.einsteigerquest; check(Boolean(B), "Quest 1 hat die Beute-Bedingung „einsteigerquest“ (Hinweispergament)");
  const staende = new Set([""]); let s = ""; const ann = QUEST1.dialoge[QUEST1.geber].optionen.find((o) => o.folge.some((v) => v.f.start)); s = QB.nachFolge(QUEST1, s, ann.folge.find((v) => v.f.start).f); staende.add(s);
  for (const S of QUEST1.schritte) { s = QB.stand({ ...QB.lage(QUEST1, s), bits: QB.lage(QUEST1, s).bits | (1 << QUEST1.schritte.indexOf(S)) }); staende.add(s); }
  const an = [...staende].filter((x) => QB.gilt(QUEST1, x, B, K)), wachen = [...staende].filter((x) => QB.erledigt(QUEST1, x, "wachen") && !QB.erledigt(QUEST1, x, "beweis") && QB.laeuft(QUEST1, x));
  check(!QB.gilt(QUEST1, "", B, K) && !QB.gilt(QUEST1, "fertig", B, K), "Ohne Quest und nach dem Abschluss: kein Schriftstück");
  check(an.length > 0 && an.every((x) => wachen.includes(x)), `Schriftstück nur, solange „wachen“ erledigt und „beweis“ offen ist (${an.join(", ")})`); }

/* Questfiguren auf begehbaren Feldern (Gehraster der Kampfwelt; Figuren außerhalb eines Gebiets werden ausgelassen) */
{ const src = fs.readFileSync(new URL("../shared/weltzonen.ts", import.meta.url), "utf8"), a0 = src.indexOf("= [") + 2, a1 = src.indexOf("\n];", a0) + 2;
  const Z = JSON.parse(src.slice(a0, a1).replace(/,\s*\]$/, "]")); for (const z of Z) if (z.lauf) z.zeilen = z.lauf.map((l) => l.replace(/(\d+)([^\d])/g, (_m, n, c) => c.repeat(Number(n)))); /* #122: Lauflängen */ const frei = (x, y) => { for (const z of Z) { const lx = Math.floor(x) - z.x0, ly = Math.floor(y) - z.y0; if (ly >= 0 && ly < z.zeilen.length && lx >= 0 && lx < z.zeilen[ly].length) return z.zeilen[ly][lx] === "."; } return null; };
  const schlecht = [], gezaehlt = []; for (const q of QUESTS) for (const n of q.figuren) { const r = frei(n.x, n.y); if (r === null) continue; gezaehlt.push(n.id); if (!r) schlecht.push(`${q.id}/${n.id} (${n.x}, ${n.y})`); }
  check(!schlecht.length && gezaehlt.length > 10, `Alle ${gezaehlt.length} Questfiguren stehen auf begehbaren Feldern${schlecht.length ? " – gesperrt: " + schlecht.join(", ") : ""}`); }
console.log(f ? `${f} Prüfung(en) fehlgeschlagen` : "Quest 1 und Questfiguren: alles in Ordnung"); process.exit(f ? 1 : 0);
