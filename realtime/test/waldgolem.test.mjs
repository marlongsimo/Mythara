/*
 * Mythara – Waldgolem (Nordwald, verfallene Feste): Werte nach Variante H, fünf Golems in der Zone, Aggro nur gegen Helden unter Level 15,
 * und Duelle gegen einen Helden auf Heldenlevel 15 mit Einfach-Ausrüstung (ohne Tränke). Ohne Server.
 * Aufruf: node test/waldgolem.test.mjs   (nach node build.mjs)
 */
import { Sim, MONSTER, KARTEN, FEIN, setzeKarte, kampfwerte, gegnerWerte, NULL_XP, xpFuer, heldenlevel, startAusruestung } from "./sim.gebaut.mjs";
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
const G = MONSTER.waldgolem, g = gegnerWerte(G.v2, "nah");
check(G && G.lp === 30 && G.stufe === 15 && g.maxHit === 5 && g.treffer === (6 + 9) * 64 && G.v2.ticks === 6 && G.aggroBisLevel === 15, `Waldgolem: 30 LP, Level 15, Max Hit ${g.maxHit} (Stärke 36), Angriffswurf ${g.treffer}, 6 Ticks`);
check(g.abwehr.fern > g.abwehr.nah && g.abwehr.magie < g.abwehr.nah, `Holz: schwer für Pfeile, leicht für Magie (Abwehr ${g.abwehr.nah}/${g.abwehr.fern}/${g.abwehr.magie})`);
const K = KARTEN.welt_nordwald; setzeKarte(K, FEIN);
const X15 = { ...NULL_XP, geschick: xpFuer(13), staerke: xpFuer(14), defense: xpFuer(12), fernkampf: xpFuer(15), magie: xpFuer(15), lp: xpFuer(14) - xpFuer(10) };
check(heldenlevel(X15) === 15 && heldenlevel(NULL_XP) === 3, "Testhelden: Heldenlevel 15 und 3");
{ const s = Sim.welt(5, undefined, true), golems = s.wesen.filter((w) => !w.held && w.typ === "waldgolem"); check(golems.length === 5, `In der Feste stehen ${golems.length} Waldgolems`); }
/* Aggro: ein Held unter Level 15 wird angegriffen, einer mit Level 15 nicht */
for (const [x, lv, soll] of [[NULL_XP, 3, true], [X15, 15, false]]) {
  const s = Sim.welt(7, undefined, true), w = s.wesen.find((e) => !e.held && e.typ === "waldgolem"); for (const o of s.wesen.filter((e) => !e.held && e !== w)) { o.x = o.heim.x = 2; o.y = o.heim.y = 2; o.streifT = 1e9; }
  w.streifT = 1e9; const h = s.nach(s.beitreten("schildwaechter", 0, { x: w.x + 2.5, y: w.y }, kampfwerte(x, startAusruestung("schwert"), 1)));
  s.eingabe({ t: "auto", an: false }, h.id); for (let i = 0; i < 8 * 20; i++) s.schritt();
  check((w.zielId === h.id) === soll, `Held Level ${lv} steht 2,5 Felder neben einem Golem: ${soll ? "wird angegriffen" : "bleibt in Ruhe"} (Ziel ${w.zielId === h.id ? "Held" : "keins"})`); }
/* Duelle: Heldenlevel 15 mit Einfach-Ausrüstung */
const AUS = { schwert: { waffe: "eidschwert_gewoehnlich", nebenhand: "sternenschild_gewoehnlich", kopf: "eisenwachthelm_gewoehnlich", brust: "eisenwacht_gewoehnlich", beine: "eisenbeinschienen_gewoehnlich" },
  bogen: { waffe: "mondkurzbogen_gewoehnlich", kopf: "jaegerkapuze", brust: "jaegerwams", beine: "jaegerhose" }, stab: { waffe: "sternenszepter_gewoehnlich", kopf: "magierkapuze", brust: "magierrobe", beine: "magierrock" } };
const q = {};
for (const [waffe, stil] of [["schwert", 2], ["bogen", 0], ["stab", 0]]) { let siege = 0; const N = 60;
  for (let seed = 1; seed <= N; seed++) { const s = Sim.welt(seed * 11, undefined, true), w = s.wesen.find((e) => !e.held && e.typ === "waldgolem"); for (const o of s.wesen.filter((e) => !e.held && e !== w)) { o.x = o.heim.x = 2; o.y = o.heim.y = 2; o.streifT = 1e9; } w.streifT = 1e9;
    const h = s.nach(s.beitreten("schildwaechter", 0, { x: w.x + (waffe === "schwert" ? 1.2 : 4), y: w.y }, kampfwerte(X15, AUS[waffe], stil))); s.eingabe({ t: "ziel", id: w.id }, h.id);
    for (let t = 0; t < 200 * 20 && !w.tot && !h.tot; t++) s.schritt(); if (w.tot) siege++; }
  q[waffe] = siege / N; }
check(q.schwert >= 0.75 && q.bogen >= 0.7 && q.stab >= 0.75 && Math.min(q.schwert, q.bogen, q.stab) < 1, `Heldenlevel 15 gewinnt meist, aber nicht immer: Schwert ${(q.schwert * 100).toFixed(0)} %, Bogen ${(q.bogen * 100).toFixed(0)} %, Stab ${(q.stab * 100).toFixed(0)} %`);
console.log(f ? `${f} Prüfung(en) fehlgeschlagen` : "Waldgolem: alles in Ordnung"); process.exit(f ? 1 : 0);
