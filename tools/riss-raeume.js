/*
 * Rissgänger: die Räume messen (Runden, Siege, Gefallene), vom Rechner gespielt.
 * Aufruf: node tools/riss-raeume.js [Gruppen] [fest]     – „fest“ misst den festen Weg der ersten Fassung
 */
const R = require("../js/regeln.js"), D = require("../daten/grauwacht.js"), botF = require("../server/arena-bot.js");
const K = require("../js/riss-kern.js")(R, D.KARTEN, botF), H = R.FD.REIHE;
let zs = 99; const zf = () => { zs = (zs * 1103515245 + 12345) & 0x7fffffff; return zs / 0x7fffffff; };
const zieh = () => H.map((h) => [zf(), h]).sort((a, b) => a[0] - b[0]).slice(0, 3).map((x) => x[1]);
const N = +process.argv[2] || 300, fest = process.argv[3] === "fest", stat = {}; let weg = 0, stufe = 0;
for (let i = 0; i < N; i++) { const W = K.neu(zieh(), "x", fest ? null : K.folgeLosen(zf));
  for (let r = 0; r < 5; r++) { const st = K.raumAuto(W, r, i * 31 + r + 5), e = K.raumEnde(W, r, st), k = e.art + (r + 1), s = stat[k] = stat[k] || { n: 0, sieg: 0, rd: 0, gef: 0, tp: 0 };
    s.n++; s.sieg += e.sieg; s.rd += e.runden; s.gef += e.gefallen.length; s.tp += K.lebenSchnitt(W); weg += e.runden; }
  stufe += K.stufeSchnitt(W); }
console.log(`${N} Gruppen, ${fest ? "fester Weg" : "geloster Weg (E = Einstieg, S = schwer, B = Beute; Zahl = Platz im Weg)"}`);
for (const k of Object.keys(stat).sort()) { const s = stat[k]; console.log(`  ${k}: n ${s.n} · Sieg ${(100 * s.sieg / s.n).toFixed(0)} % · Runden Ø ${(s.rd / s.n).toFixed(1)} · gefallen Ø ${(s.gef / s.n).toFixed(2)} · Leben danach Ø ${(100 * s.tp / s.n).toFixed(0)} %`); }
console.log(`  alle fünf Räume: Ø ${(weg / N).toFixed(1)} Runden · Stufe am Ende Ø ${(stufe / N).toFixed(2)}`);
