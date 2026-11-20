/*
 * Mythara Echtzeit – Balancing messen (Kampfsystem 0.1). Alles vom Rechner gespielt, nichts davon ersetzt echtes Spielen.
 * Aufruf (nach „npm run build“): node test/messen.mjs [Wiederholungen]
 * Teil 1: Trefferchancen und Schaden je Sekunde aus der Wertetabelle gerechnet.
 * Teil 2: jeder Held allein gegen einen und gegen zwei Knochenwächter.
 * Teil 3: der ganze Riss – allein und mit Begleitern.
 */
import { Sim, HELDEN, MONSTER, K, trefferchance, HELDENREIHE, frei } from "./sim.gebaut.mjs";
const N = +process.argv[2] || 40, f1 = (x) => x.toFixed(1).replace(".", ","), pz = (x) => Math.round(100 * x) + " %";
const S = MONSTER.knochenwaechter;

console.log("Teil 1 – aus der Tabelle gerechnet, gegen einen Knochenwächter (150 Leben)\n");
console.log("Held      Waffe               trifft   Schaden   je Sekunde   Zeit bis zum Sieg   | wird getroffen   erleidet je Sekunde");
for (const k of HELDENREIHE) { const D = HELDEN[k];
  for (const m of D.modi) { if (m.art === "heil") { console.log(`${D.name.padEnd(9)} ${m.name.padEnd(19)} heilt ${m.schaden[0]}–${m.schaden[1]}, also ${f1((m.schaden[0] + m.schaden[1]) / 2 / m.takt)} je Sekunde`); continue; }
    const p = trefferchance(D.angriff[m.art], S.abwehr[m.art]), mittel = (m.schaden[0] + m.schaden[1]) / 2 * (m.untot ? 1 + m.untot : 1) * (m.wucht ? 1 + K.WUCHT : 1), dps = p * mittel / m.takt;
    const ps = trefferchance(S.angriffswert.nah, D.abwehr.nah), ein = ps * (S.angriff.schaden[0] + S.angriff.schaden[1]) / 2 / S.angriff.takt;
    console.log(`${D.name.padEnd(9)} ${m.name.padEnd(19)} ${pz(p).padStart(5)}   ${(m.schaden[0] + "–" + m.schaden[1]).padEnd(7)}   ${f1(dps).padStart(6)}       ${f1(S.lp / dps).padStart(5)} s            | ${pz(ps).padStart(5)}            ${f1(ein)}`); } }
{ const T = HELDEN.schildwaechter, d = T.abwehr.nah / (1 - K.BLOCK.nah), ps = trefferchance(S.angriffswert.nah, d); console.log(`\nTorvald im Schildmodus von vorn: wird zu ${pz(ps)} getroffen, erleidet ${f1(ps * 15 / S.angriff.takt)} je Sekunde.`); }

/** Der Rechner spielt den Helden des Spielers: nächstes Monster wählen, in Reichweite gehen, Fähigkeiten nutzen */
function spiele(sim, maxSek, opt = {}) {
  const h = sim.ich, D = HELDEN[h.typ]; let n = 0, tode = 0, lebte = true, schadenErlitten = 0, lpVor = h.lp;
  if (h.typ === "lichtbringer" && !opt.heilen) sim.eingabe({ t: "modus" }); // allein kämpft Elara mit dem Streitkolben
  while (sim.phase === "lauf" && n++ < maxSek * 20) {
    if (!h.tot && n % 4 === 0) { const A = D.modi[h.modus], m = sim.wesen.filter((w) => !w.held && !w.tot && (!opt.nur || opt.nur.includes(w.id))).sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y))[0];
      if (!m) break; const d = Math.hypot(m.x - h.x, m.y - h.y), soll = A.art === "nah" ? A.reich - 0.2 : A.reich - 1.5;
      if (A.art === "heil") { if (d > 5 || !frei(h, m)) { if (!h.pfad.length || n % 20 === 0) sim.eingabe({ t: "lauf", x: m.x, y: m.y }); } else if (h.pfad.length) sim.eingabe({ t: "halt" }); } // Heilerin im Trupp: geht mit nach vorn, bleibt aber auf Abstand
      else if (d > soll + m.r || !frei(h, m)) { if (!h.pfad.length || n % 20 === 0) sim.eingabe({ t: "lauf", x: m.x, y: m.y }); } else { if (h.pfad.length) sim.eingabe({ t: "halt" }); if (h.zielId !== m.id) sim.eingabe({ t: "ziel", id: m.id }); }
      if (d < 7 && frei(h, m)) for (const t of opt.ohneR ? ["q", "e"] : ["q", "e", "r"]) { if (h.typ === "lichtbringer" && t === "q" && h.lp > h.max * 0.6) continue; if (h.typ === "lichtbringer" && t === "r" && h.lp > h.max * 0.4) continue; if (h.typ === "assassine" && t === "r" && m.lp > m.max * 0.5) continue; sim.eingabe({ t: "faehig", taste: t, x: m.x, y: m.y }); }
      if (h.typ === "schildwaechter" && opt.schild != null && h.modus !== opt.schild) sim.eingabe({ t: "modus" }); }
    sim.schritt(); if (h.lp < lpVor) schadenErlitten += lpVor - h.lp; lpVor = h.lp; if (h.tot && lebte) tode++; lebte = !h.tot; if (sim.wesen.some((w) => !Number.isFinite(w.x) || !Number.isFinite(w.lp))) throw new Error("ungültiger Zustand");
    if (opt.bis && opt.bis(sim)) break; }
  return { sek: sim.zeit, tode, schadenErlitten, sieg: sim.phase === "sieg" };
}
const mittel = (l, f) => l.reduce((a, x) => a + f(x), 0) / l.length;

console.log(`\nTeil 2 – gespielt: jeder Held allein, mit Q und E, ohne R (${N} Kämpfe je Zeile)\n`);
console.log("Held      gegen 1 Knochenwächter: Dauer · erlitten      gegen 2: Dauer · erlitten · gefallen");
for (const k of HELDENREIHE) { const zeile = [];
  for (const zahl of [1, 2]) { const l = []; for (let i = 0; i < N; i++) { const s = new Sim(k, 500 + i * 7 + zahl), g = s.wesen.filter((w) => !w.held).slice(0, zahl), h = s.ich; h.x = 17.5; h.y = 6.5; g.forEach((m, j) => { m.x = 16.5 + j * 1.2; m.y = 1.8; m.heim = { x: m.x, y: m.y }; m.gruppe = 99; });
      for (const w of s.wesen) if (!w.held && !g.includes(w)) { w.tot = true; } s.monsterZahl = zahl; s.besiegt = 0;
      l.push(spiele(s, 120, { nur: g.map((m) => m.id), ohneR: true })); }
    zeile.push(`${f1(mittel(l, (x) => x.sek)).padStart(5)} s · ${String(Math.round(mittel(l, (x) => x.schadenErlitten))).padStart(3)} Leben` + (zahl === 2 ? ` · ${pz(mittel(l, (x) => (x.tode ? 1 : 0)))}` : "")); }
  console.log(`${HELDEN[k].name.padEnd(9)} ${zeile[0].padEnd(38)} ${zeile[1]}  (von ${HELDEN[k].lp} Leben)`); }

console.log(`\nTeil 3 – der ganze Riss mit zwölf Knochenwächtern (${Math.ceil(N / 2)} Durchläufe je Zeile)\n`);
const trupps = HELDENREIHE.map((k) => [k, []]).concat([["schildwaechter", ["lichtbringer"]], ["schildwaechter", ["elementarist"]], ["assassine", ["lichtbringer"]], ["kopfgeldjaeger", ["schildwaechter"]], ["schildwaechter", ["lichtbringer", "elementarist"]], ["lichtbringer", ["schildwaechter", "assassine"]]]);
for (const [k, mit] of trupps) { const l = []; for (let i = 0; i < Math.ceil(N / 2); i++) l.push(spiele(new Sim(k, 900 + i * 13, mit), 900, { heilen: mit.length > 0 && k === "lichtbringer" }));
  console.log(`${(HELDEN[k].name + (mit.length ? " + " + mit.map((m) => HELDEN[m].name).join(" + ") : " allein")).padEnd(34)} geschafft ${pz(mittel(l, (x) => (x.sieg ? 1 : 0))).padStart(5)} · Zeit ${f1(mittel(l, (x) => x.sek) / 60)} min · selbst gefallen Ø ${f1(mittel(l, (x) => x.tode))}×`); }
