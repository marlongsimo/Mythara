/*
 * Mythara – Prüfung der gemeinsamen Kampfwelt in der Simulation (ohne Server): mehrere Spieler, EP nach Schadensanteil,
 * Heil-EP (30 % der geheilten Lebenspunkte), Gegner kehren nach 60 Sekunden zurück, Splitter für den, der sie aufhebt, eigene Stufen.
 * Aufruf (nach „node build.mjs“): node test/weltkampf.test.mjs
 */
import { Sim, KARTEN, FEIN, setzeKarte, setzeStaerke, K, EP_BIS, MONSTER, STAERKE } from "./sim.gebaut.mjs";
let ok = true; const check = (b, t) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) ok = false; };
const lauf = (s, sek) => { for (let i = 0; i < sek * 20; i++) s.schritt(); };
setzeKarte(KARTEN.waldweg, FEIN); setzeStaerke(1, 1);
const s = Sim.welt(5); const sammle = () => s.zustand().ev;
check(s.wesen.filter((w) => w.held).length === 0 && s.wesen.filter((w) => !w.held).length === 6, "Leere Welt: sechs Gegner, noch kein Held");
const a = s.beitreten("schildwaechter", 300), b = s.beitreten("schildwaechter", 0), c = s.beitreten("lichtbringer", 0); const A = s.nach(a), B = s.nach(b), C = s.nach(c);
check(A.stufe > B.stufe && A.max > B.max, `Zwei Torvalds mit eigener Stufe (St. ${A.stufe} mit ${A.max} LP, St. ${B.stufe} mit ${B.max} LP)`);
/* Anteilige EP: A macht 75 %, B 25 % des Schadens */
const m = s.wesen.find((w) => !w.held && w.typ === "schlammkroete"); m.lp = m.max; sammle();
s["abziehen"](m, m.max * 0.75, A, "nah"); s["abziehen"](m, m.max * 0.5, B, "nah"); const ev = sammle().filter((e) => e.a === "ep");
const e = Math.max(1, Math.round(MONSTER.schlammkroete.lp * STAERKE.ep / 10)), eA = (ev.find((x) => x.id === a) || {}).n, eB = (ev.find((x) => x.id === b) || {}).n;
check(m.tot && ev.length === 2 && Math.abs(eA - e * 0.75) <= 1 && Math.abs(eB - e * 0.25) <= 1, `Kröte (${e} EP) nach Schaden geteilt: A ${eA} EP (75 %), B ${eB} EP (25 %) – B traf mit dem Rest nur noch ${Math.round(m.max * 0.25)} LP`);
check(!ev.some((x) => x.id === c) && (C.ep || 0) === 0, "Wer nicht getroffen hat, bekommt nichts");
check(A.ep === 300 + eA && B.ep === eB && s.zustand().ich !== undefined && s.ichVon(a).ep === 300 + eA, "Die EP landen beim jeweiligen Helden (auch im Zustand für den Spieler)");
/* Heil-EP für Elara */
B.lp = 10; sammle(); s["heilen"](B, 100, C); const h = sammle(); const hEp = h.filter((x) => x.a === "ep" && x.id === c).reduce((n, x) => n + x.n, 0);
check(hEp === 30, `Elara heilt 100 LP → ${hEp} EP (30 %)`);
B.lp = B.max - 5; sammle(); s["heilen"](B, 100, C); check(sammle().filter((x) => x.a === "ep").reduce((n, x) => n + x.n, 0) === 1 && C.heilRest > 0.4, "Nur tatsächlich geheilte LP zählen (5 LP → 1,5 EP, Rest wird aufbewahrt)");
/* Rückkehr nach 60 Sekunden */
lauf(s, 59); check(m.tot, "Nach 59 Sekunden ist die Kröte noch fort"); lauf(s, 1.2); check(!m.tot && m.lp === m.max && Math.hypot(m.x - m.heim.x, m.y - m.heim.y) < 0.01, "Nach 60 Sekunden steht sie wieder voll an ihrem Lager");
check(s.phase === "lauf", "Die Welt endet nie (kein Sieg)");
/* Splitter */ s.beute.push({ id: 999, x: A.x, y: A.y, n: 4 }); lauf(s, 0.1); check(s.splitterVon(a) === 4 && s.splitterVon(b) === 0, "Splitter gehören dem, der sie aufhebt");
/* Verlassen */ m.zielId = b; s.verlassen(b); check(!s.nach(b) && m.zielId === 0, "Verlässt B die Welt, verschwindet sein Held, Gegner vergessen ihn");
/* Stufenaufstieg einzeln */ const vor = A.stufe; s["erfahrungFuer"](A, EP_BIS[vor + 1] - A.ep + 1); check(A.stufe === vor + 1 && C.stufe === 1, "Stufenaufstieg nur für den Helden, der die EP bekam");
console.log(ok ? "\nGemeinsame Kampfwelt: alles in Ordnung" : "\nGemeinsame Kampfwelt: FEHLER"); process.exit(ok ? 0 : 1);
