/*
 * Mythara – die Lichtung im Kreuzwald in der Simulation (ohne Server): vier Dolch-Banditen der Stufe 3, die umherstreifen,
 * erst auf 5 Rechenfelder angreifen und ihrem Lager nicht endlos folgen; Helden kommen dort hinein, wo sie in der Welt stehen.
 * Aufruf (nach „node build.mjs“): node test/lichtung.test.mjs
 */
import { Sim, KARTEN, FEIN, setzeKarte, setzeStaerke, STAERKE, MONSTER, LICHTUNG_FELD, ORTSTUFE, darfKaempfen, STRECKEN } from "./sim.gebaut.mjs";
let ok = true; const check = (b, t) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) ok = false; };
const lauf = (s, sek) => { for (let i = 0; i < sek * 20; i++) s.schritt(); };
const K = KARTEN.lichtung; check(Boolean(K) && STRECKEN.has("lichtung") && darfKaempfen(new Set(), "kreuzwald", "lichtung"), "Die Lichtung ist eine gemeinsame Kampfzone im Kreuzwald, immer frei");
check(ORTSTUFE.kreuzwald === 3, "Der Kreuzwald ist ein Gebiet der Stufe 3");
setzeKarte(K, FEIN); setzeStaerke(ORTSTUFE.kreuzwald, 1);
check(Math.abs(STAERKE.lp - 0.9) < 1e-9, `Stufe 3: Banditen haben ${Math.round(MONSTER.bandit_dolch.lp * STAERKE.lp)} Leben (Grundwert ${MONSTER.bandit_dolch.lp} × 0,9)`);
const s = Sim.welt(11), gegner = () => s.wesen.filter((w) => !w.held);
check(gegner().length === 4 && gegner().every((w) => w.typ === "bandit_dolch"), "Vier Dolch-Banditen auf der Lichtung");
const vorher = gegner().map((w) => ({ x: w.x, y: w.y })); lauf(s, 25);
const weit = gegner().map((w, i) => Math.hypot(w.x - vorher[i].x, w.y - vorher[i].y)), maxHeim = Math.max(...gegner().map((w) => Math.hypot(w.x - w.heim.x, w.y - w.heim.y)));
check(weit.filter((d) => d > 0.8).length >= 3, "Ohne Spieler streifen sie umher (bewegt: " + weit.map((d) => d.toFixed(1)).join(", ") + " Felder)");
check(maxHeim <= K.wandern + 1.6, `…bleiben aber bei ihrem Lager (höchstens ${maxHeim.toFixed(1)} Felder weg, Streifradius ${K.wandern})`);
/* ein Held kommt an der Stelle hinein, an der er in der Welt steht (Weltfelder minus Ausschnitt) */
const wx = 6528, wy = 6587, id = s.beitreten("schildwaechter", 0, { x: wx - LICHTUNG_FELD.x0, y: wy - LICHTUNG_FELD.y0 }), h = s.nach(id);
check(Math.hypot(h.x - (wx - LICHTUNG_FELD.x0), h.y - (wy - LICHTUNG_FELD.y0)) < 1.5, `Held steht dort, wo er die Lichtung betreten hat (${h.x.toFixed(1)}, ${h.y.toFixed(1)})`);
/* Aggro 5: ein Bandit, 6 Felder entfernt, bleibt ruhig; auf 4 Felder greift er an */
const b = gegner()[0]; for (const g of gegner()) { g.pfad = []; g.streifT = 99; } lauf(s, 0.1);
const stell = (d) => { h.x = b.x - d; h.y = b.y; h.rx = 0; h.ry = 0; h.pfad = []; b.zielId = 0; b.wach = false; };
let n = 0; for (const g of gegner()) if (g !== b) { g.x = g.heim.x = 2 + n * 2; g.y = g.heim.y = 2; g.pfad = []; n++; } /* die anderen weit weg */
stell(6.2); lauf(s, 0.3); check(b.zielId === 0, "6 Felder entfernt: der Bandit bemerkt den Helden nicht");
stell(4.5); lauf(s, 0.3); check(b.zielId === id, "4,5 Felder entfernt: er greift an (Aggro-Reichweite 5)");
lauf(s, 8); check(h.lp < h.max, `Er sticht zu (Torvald ${h.lp}/${h.max})`);
console.log(ok ? "Lichtung: alles in Ordnung" : "Lichtung: FEHLER"); process.exit(ok ? 0 : 1);
