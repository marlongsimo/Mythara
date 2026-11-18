const R = require("../js/regeln.js"), D = require("../daten/grauwacht.js"), botF = require("../server/arena-bot.js");
const K = require("../js/riss-kern.js")(R, D.KARTEN, botF), H = R.FD.REIHE;
let zs = 99; const zf = () => { zs = (zs * 1103515245 + 12345) & 0x7fffffff; return zs / 0x7fffffff; };
const zieh = () => H.map((h) => [zf(), h]).sort((a, b) => a[0] - b[0]).slice(0, 3).map((x) => x[1]);
const N = +process.argv[2] || 150;
const stat = K.RAEUME.map(() => ({ n: 0, sieg: 0, rd: 0, gef: 0, tp: 0, geg: 0 }));
for (let i = 0; i < N; i++) { const W = K.neu(zieh());
  for (let r = 0; r < 5; r++) { const st = K.raumAuto(W, r, i * 31 + r + 5), geg = st.figuren.filter((f) => f.seite === "gegner").length, e = K.raumEnde(W, r, st); const s = stat[r]; s.n++; s.sieg += e.sieg; s.rd += e.runden; s.gef += e.gefallen.length; s.tp += K.lebenSchnitt(W); s.geg += geg; } }
stat.forEach((s, r) => console.log(`Raum ${r + 1}: Sieg ${(100 * s.sieg / s.n).toFixed(0)} % · Runden Ø ${(s.rd / s.n).toFixed(1)} · Gegner Ø ${(s.geg / s.n).toFixed(1)} · gefallen Ø ${(s.gef / s.n).toFixed(2)} · Leben danach Ø ${(100 * s.tp / s.n).toFixed(0)} %`));
console.log("Runden Weg gesamt Ø", (stat.reduce((a, s) => a + s.rd, 0) / N).toFixed(1));
