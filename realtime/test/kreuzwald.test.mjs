/*
 * Mythara – der Kreuzwald als Kampfgebiet der offenen Welt, in der Simulation (ohne Server): die ganze Region als eine Karte,
 * vier Dolch-Banditen der Stufe 3 auf der Lichtung, die umherstreifen und erst auf 5 Rechenfelder angreifen; Helden kommen dort hinein,
 * wo sie in der Welt stehen. Aufruf (nach „node build.mjs“): node test/kreuzwald.test.mjs
 */
import { Sim, KARTEN, FEIN, setzeKarte, setzeStaerke, STAERKE, MONSTER, WELTZONEN, ORTSTUFE, darfKaempfen, STRECKEN } from "./sim.gebaut.mjs";
let ok = true; const check = (b, t) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) ok = false; };
const lauf = (s, sek) => { for (let i = 0; i < sek * 20; i++) s.schritt(); };
const K = KARTEN.kreuzwald, Z = { karte: "kreuzwald", x0: K.ursprung[0], y0: K.ursprung[1], b: K.zeilen[0].length, h: K.zeilen.length }; /* Zonen Stufe 2: die Region gehört zur einen Kampfwelt – hier wird das Gebiet Kreuzwald für sich geprüft */
check(WELTZONEN.waldweg && WELTZONEN.waldweg.karte === "welt" && WELTZONEN.waldweg === WELTZONEN.waldmark, "Die Region „waldweg“ (Kreuzwald) gehört zur einen Kampfwelt – wie die Waldmark");
check(Z.b === 256 && Z.h === 192 && Z.x0 === 6336 && Z.y0 === 6464, "Das Gebiet Kreuzwald: 256 × 192 Felder ab Weltfeld 6336|6464");
check(STRECKEN.has("kreuzwald") && darfKaempfen(new Set(), "kreuzwald", "kreuzwald") && ORTSTUFE.kreuzwald === 3, "Immer frei, Gegner der Stufe 3");
setzeKarte(K, FEIN); setzeStaerke(ORTSTUFE.kreuzwald, 1);
check(Math.abs(STAERKE.lp - 0.9) < 1e-9, `Stufe 3: Banditen haben ${Math.round(MONSTER.bandit_dolch.lp * STAERKE.lp)} Leben`);
const s = Sim.welt(11), gegner = () => s.wesen.filter((w) => !w.held);
check(gegner().length === 4 && gegner().every((w) => w.typ === "bandit_dolch"), "Vier Dolch-Banditen");
const lichtung = gegner().every((w) => { const wx = Z.x0 + w.x, wy = Z.y0 + w.y; return wx > 6530 && wx < 6575 && wy > 6565 && wy < 6600; }); check(lichtung, "…auf der Lichtung (Weltfelder " + gegner().map((w) => `${(Z.x0 + w.x).toFixed(0)}|${(Z.y0 + w.y).toFixed(0)}`).join(", ") + ")");
const weit = gegner().map(() => 0); for (let i = 0; i < 30 * 20; i++) { const vor = gegner().map((w) => ({ x: w.x, y: w.y })); s.schritt(); gegner().forEach((w, k) => { weit[k] += Math.hypot(w.x - vor[k].x, w.y - vor[k].y); }); }
check(weit.filter((d) => d > 2).length >= 3, "Ohne Spieler streifen sie umher (in 30 s gelaufen: " + weit.map((d) => d.toFixed(1)).join(", ") + " Felder)");
check(Math.max(...gegner().map((w) => Math.hypot(w.x - w.heim.x, w.y - w.heim.y))) <= K.wandern + 1.6, "…und bleiben bei ihrem Lager");
const wx = 6448, wy = 6467, id = s.beitreten("schildwaechter", 0, { x: wx - Z.x0, y: wy - Z.y0 }), h = s.nach(id);
check(Math.hypot(Z.x0 + h.x - wx, Z.y0 + h.y - wy) < 1.5, `Hinter dem Südtor: der Held steht, wo er in der Welt stand (${(Z.x0 + h.x).toFixed(1)}|${(Z.y0 + h.y).toFixed(1)})`);
lauf(s, 3); check(gegner().every((w) => w.zielId === 0), "Am Tor, weit weg von der Lichtung: niemand greift an");
const b = gegner()[0]; for (const g of gegner()) { g.pfad = []; g.streifT = 99; g.lp = g.max = 400; /* zäh: geprüft wird Aggro und Angriff, nicht das Balancing (seit v1 nur 40 LP) */ if (g !== b) { g.x = g.heim.x = b.x + 30; g.y = g.heim.y = b.y; } }
const stell = (d) => { h.x = b.x - d; h.y = b.y; h.rx = 0; h.ry = 0; h.pfad = []; b.zielId = 0; b.wach = false; };
stell(5.2); lauf(s, 0.3); check(b.zielId === 0, "5 Felder: der Bandit bemerkt den Helden nicht");
stell(3.5); lauf(s, 0.3); check(b.zielId === id, "3,5 Felder: er greift an (Aggro 4)");
let stiche = 0; for (let i = 0; i < 8 * 20; i++) { s.schritt(); for (const e of s.zustand().ev) if ((e.a === "schaden" || e.a === "null" || e.a === "block") && e.id === id) stiche++; }
check(stiche >= 2, `Er sticht zu (${stiche}× in 8 s, getroffen oder geblockt – Torvald ${Math.round(h.lp)}/${h.max})`);
/* Bewegung über „richtung“, wie die offene Welt sie schickt */
const x0 = h.x; s.eingabe({ t: "richtung", x: 1, y: 0 }, id); lauf(s, 1); s.eingabe({ t: "richtung", x: 0, y: 0 }, id); check(h.x - x0 > 2, `Die Welt schickt eine Richtung, die Simulation bewegt den Helden (${(h.x - x0).toFixed(1)} Felder in 1 s)`);
console.log(ok ? "Kreuzwald: alles in Ordnung" : "Kreuzwald: FEHLER"); process.exit(ok ? 0 : 1);
