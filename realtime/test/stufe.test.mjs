/*
 * Mythara Echtzeit – Prüfung: Erfahrung und Stufenaufstieg mitten im Kampf.
 * Aufruf (nach „node build.mjs“): node test/stufe.test.mjs
 */
import { Sim, KARTEN, FEIN, setzeKarte, setzeStaerke, HELDEN, HELDENEP, HELDENSTUFE, STUFENBONUS, EP_BIS, stufeAusEp } from "./sim.gebaut.mjs";
let ok = true; const check = (b, t) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) ok = false; };

/* Held 5 EP vor Stufe 2, Begleiter weit davon entfernt */
setzeKarte(KARTEN.muehle, FEIN); setzeStaerke(1, 2);
for (const k of Object.keys(HELDENEP)) delete HELDENEP[k]; for (const k of Object.keys(HELDENSTUFE)) delete HELDENSTUFE[k];
HELDENEP.schildwaechter = EP_BIS[2] - 5; HELDENEP.lichtbringer = 0; for (const [k, v] of Object.entries(HELDENEP)) HELDENSTUFE[k] = stufeAusEp(v);
const s = new Sim("schildwaechter", 3, ["lichtbringer"]), h = s.ich, b = s.wesen.find((w) => w.held && w !== h);
const max1 = h.max; h.lp = 40; s.zustand();
check(s.zustand().ich.stufe === 1 && s.zustand().ich.ep === EP_BIS[2] - 5, "Vorher: Stufe 1, Erfahrung aus dem Spielstand im Zustand");

/* einen Gegner sofort besiegen */
const m = s.wesen.find((w) => !w.held && !w.tot); m.lp = 1;
const schaden = "abziehen"; /* die Schadensfunktion der Simulation */
s[schaden](m, 50, h, "nah"); const z = s.zustand(), ev = z.ev;
const epEv = ev.find((e) => e.a === "ep"), st = ev.filter((e) => e.a === "stufe");
check(Boolean(epEv) && epEv.n >= 5, `EP-Ereignis: +${epEv && epEv.n} EP`);
check(st.length === 1 && st[0].id === h.id && st[0].s === 2, "Nur der Held steigt auf (Stufe-Ereignis mit seiner Kennung)");
check(z.ich.stufe === 2 && z.ich.ep === EP_BIS[2] - 5 + epEv.n, `Danach: Stufe ${z.ich.stufe}, ${z.ich.ep} EP`);
const max2 = Math.round(HELDEN.schildwaechter.lp * (1 + STUFENBONUS(2).lp));
check(h.max === max2 && max2 > max1 && h.lp === max2, `Mehr Leben sofort: ${max1} → ${max2}, voll geheilt`);
check(HELDENSTUFE.schildwaechter === 2, "Stufenboni (Angriff, Abwehr, Schaden) gelten ab sofort");
check(b.max === Math.round(HELDEN.lichtbringer.lp) && !st.some((e) => e.id === b.id), "Begleiter bekommt dieselbe Erfahrung, steigt aber noch nicht auf");

/* ohne Erfahrung (Riss) gibt es keine Stufen */
setzeStaerke(1, 1); const STAERKE0 = (await import("./sim.gebaut.mjs")).STAERKE; STAERKE0.ep = 0;
const r = new Sim("schildwaechter", 4, []); const m2 = r.wesen.find((w) => !w.held && !w.tot); m2.lp = 1; r[schaden](m2, 50, r.ich, "nah");
check(!r.zustand().ev.some((e) => e.a === "ep" || e.a === "stufe"), "Ohne Erfahrungswert: keine EP, kein Aufstieg");

console.log(ok ? "\nStufen im Kampf: alles in Ordnung" : "\nStufen im Kampf: FEHLER"); process.exit(ok ? 0 : 1);
