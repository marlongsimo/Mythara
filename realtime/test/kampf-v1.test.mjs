/*
 * Mythara – Kampfregeln v1 (shared/kampfwerte.ts + shared/sim.ts) ohne Server:
 * Werte der Starthelden, Block-/Schadenswurf, Skill-XP (2 je tatsächlich abgezogenem LP, kein Überkill), Erholung (5 s, dann 4 %/s),
 * und der Kampf Held Level 1 gegen Bandit Level 1 (40 LP, Angriff 5, Verteidigung 5/3/2, 3–6 Schaden alle 2 s).
 * Aufruf (nach „node build.mjs“): node test/kampf-v1.test.mjs
 */
import { Sim, KARTEN, FEIN, setzeKarte, STAERKE, kampfwerte, xpFuer, levelAus, heldenlevel, startAusruestung } from "./sim.gebaut.mjs";
let ok = true; const check = (b, t) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) ok = false; };
const NULL = { staerke: 0, geschick: 0, magie: 0 };
/* 1. Regeln */
const ks = kampfwerte(NULL, startAusruestung("schwert")), kb = kampfwerte(NULL, startAusruestung("bogen")), kst = kampfwerte(NULL, startAusruestung("stab"));
check(ks.angriff.nah === 6 && ks.abwehr.nah === 6 && ks.abwehr.fern === 4 && ks.abwehr.magie === 3 && ks.max === 60 && ks.waffe.schaden.join() === "4,8", `Schwert + Schild: Angriff 6, Verteidigung 6/4/3, 60 LP, 4–8 (${JSON.stringify([ks.angriff, ks.abwehr])})`);
check(kb.angriff.fern === 6 && kb.abwehr.nah === 1 && kb.waffe.schaden.join() === "3,7" && kb.waffe.reich === 9, "Bogen: Angriff 6, Verteidigung 1, 3–7, Reichweite 9");
check(kst.angriff.magie === 6 && kst.waffe.art === "magie" && kst.waffe.schaden.join() === "4,8", "Stab: Magie-Angriff 6, 4–8");
check(xpFuer(1) === 0 && xpFuer(2) === 359 && xpFuer(10) === 15748 && levelAus(358) === 1 && levelAus(359) === 2 && levelAus(1e9) === 100, `XP-Kurve: L2 = ${xpFuer(2)}, L10 = ${xpFuer(10)}, L100 = ${xpFuer(100)}`);
const k10 = kampfwerte({ staerke: xpFuer(10), geschick: 0, magie: 0 }, startAusruestung("schwert"));
check(heldenlevel({ staerke: xpFuer(10), geschick: 0, magie: 0 }) === 4 && k10.angriff.nah === 15 && k10.waffe.schaden.join() === "5,9" && k10.abwehr.nah === 7.5 && k10.max === 66,
  `Stärke 10: Heldenlevel 4, Angriff 15, Schaden 5–9, Verteidigung 7,5, 66 LP`);
/* 2. Simulation: Kreuzwald als Weltzone mit eigenen Gegnerwerten (Sim.welt(…, eigeneWerte)) */
const K = KARTEN.kreuzwald; setzeKarte(K, FEIN);
const neutral = () => { STAERKE.lp = 2.2; STAERKE.schaden = 1.7; }; /* absichtlich verstellt: Weltzonen mit eigenen Werten dürfen das nicht spüren */
const lauf = (s, sek, f) => { for (let i = 0; i < sek * 20; i++) { s.schritt(); const ev = s.zustand().ev; if (f) f(ev); } };
function duell(seed, waffe = "schwert") {
  neutral(); const s = Sim.welt(seed, undefined, true); const ban = s.wesen.filter((w) => !w.held && /bandit/.test(w.typ)); for (const g of s.wesen.filter((w) => !w.held)) { g.streifT = 1e9; g.pfad = []; g.x = g.heim.x = 5 + Math.random(); g.y = g.heim.y = 150; }
  const b = ban[0], E = { x: 112, y: 6 }; b.x = b.heim.x = E.x; b.y = b.heim.y = E.y; b.wach = false;
  const h = s.nach(s.beitreten("schildwaechter", 0, { x: E.x - 1.2, y: E.y }, kampfwerte(NULL, startAusruestung(waffe))));
  return { s, b, h };
}
{ const { s, b, h } = duell(7); check(b.max === 40 && b.lp === 40, `Bandit Level 1: 40 LP (${b.max})`); check(h.max === 60 && h.stufe === 1, "Held Level 1: 60 LP"); }
/* Viele Duelle: Trefferquote, Schaden, XP, Kampfdauer */
let treffH = 0, blockH = 0, treffB = 0, blockB = 0, schadenOk = true, banditOk = true, xpOk = true, siege = 0, dauer = 0, uebrig = 0, n = 0;
for (let seed = 1; seed <= 40; seed++) {
  const { s, b, h } = duell(seed); s.eingabe({ t: "ziel", id: b.id }, h.id); let t = 0, abgezogen = 0;
  for (; t < 90 * 20 && !b.tot && !h.tot; t++) { s.schritt(); for (const e of s.zustand().ev) {
    if (e.a === "schaden" && e.id === b.id) { treffH++; abgezogen += e.n; if (!(Number.isInteger(e.n) && e.n >= 1 && e.n <= 8)) schadenOk = false; }
    if ((e.a === "block" || e.a === "null") && e.id === b.id) blockH++;
    if (e.a === "schaden" && e.id === h.id) { treffB++; if (!(Number.isInteger(e.n) && e.n >= 3 && e.n <= 6)) banditOk = false; }
    if ((e.a === "block" || e.a === "null") && e.id === h.id) blockB++; } }
  const x = s.xpAbholen(h.id) || NULL; if (!(x.staerke === 2 * Math.min(40, abgezogen) && x.staerke <= 80 && !x.geschick && !x.magie)) { xpOk = false; console.log("    XP", JSON.stringify(x), "abgezogen", abgezogen); }
  if (b.tot) { siege++; dauer += t / 20; uebrig += h.lp / h.max; } n++;
}
const qH = treffH / Math.max(1, treffH + blockH), qB = treffB / Math.max(1, treffB + blockB);
console.log(`    Held trifft ${(qH * 100).toFixed(0)} % · Bandit trifft ${(qB * 100).toFixed(0)} % · Siege ${siege}/${n} · Dauer Ø ${(dauer / Math.max(1, siege)).toFixed(1)} s · LP übrig Ø ${(uebrig / Math.max(1, siege) * 100).toFixed(0)} %`);
check(treffH > 0 && blockH > 0 && treffB > 0 && blockB > 0, "Beide Seiten treffen und werden geblockt (Angriffswurf gegen Blockwurf)");
check(qH > 0.4 && qH < 0.75, `Held Angriff 6 gegen Verteidigung 5: Treffer erwartet: 1 − 5/12 ≈ 58 % (${(qH * 100).toFixed(0)} %)`);
check(qB > 0.25 && qB < 0.6, `Bandit Angriff 5 gegen Verteidigung 6: Treffer erwartet: 5/12 ≈ 42 % (${(qB * 100).toFixed(0)} %)`);
check(schadenOk, "Heldenschaden ganzzahlig 4–8 (letzter Schlag gekappt auf die Rest-LP)"); check(banditOk, "Banditenschaden ganzzahlig 3–6");
check(xpOk, "Stärke-XP = 2 × tatsächlich abgezogene LP, höchstens 80 je Bandit (kein Überkill), keine anderen Skills");
check(siege >= 36, `Der Held Level 1 gewinnt fast immer gegen einen Banditen Level 1 (${siege}/${n})`);
/* 3. Erholung */
{ const { s, b, h } = duell(99); s.eingabe({ t: "ziel", id: b.id }, h.id); lauf(s, 90); h.lp = 30; h.ruhe = 0; s.eingabe({ t: "ziel", id: 0 }, h.id);
  const vor = h.lp; lauf(s, 4.5); check(Math.abs(h.lp - vor) < 0.01, `Vor 5 s Ruhe keine Erholung (${vor} → ${h.lp.toFixed(1)})`);
  lauf(s, 1.5); check(h.lp > vor + 1 && h.lp < vor + 4, `Danach 4 % je Sekunde (2,4 LP/s): ${h.lp.toFixed(1)}`);
  lauf(s, 15); check(h.lp === h.max, "bis voll"); }
{ const { s, b, h } = duell(5); h.lp = 30; h.ruhe = 0; s.eingabe({ t: "ziel", id: b.id }, h.id); let maxLp = 0, gestiegen = false, letzt = h.lp;
  for (let i = 0; i < 6 * 20 && !b.tot; i++) { s.schritt(); s.zustand(); if (h.lp > letzt + 1e-6) gestiegen = true; letzt = h.lp; }
  check(!gestiegen, "Im Kampf keine Erholung"); }
/* 4. Ausrüstung im Kampf ändern: Bogen anlegen → Fernkampf, Geschick-XP */
{ const { s, b, h } = duell(11); s.kampfwerteSetzen(h.id, kampfwerte(NULL, startAusruestung("bogen"))); h.x = b.x - 6; s.eingabe({ t: "ziel", id: b.id }, h.id);
  lauf(s, 60); const x = s.xpAbholen(h.id) || NULL; check(x.geschick > 0 && !x.staerke, `Mit dem Bogen: Geschicklichkeits-XP (${JSON.stringify(x)})`); }
console.log(ok ? "Kampfregeln v1: alles in Ordnung" : "Kampfregeln v1: FEHLER"); process.exit(ok ? 0 : 1);
