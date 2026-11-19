/*
 * Rissgänger, Kartenform „Pfade“: Räume messen und Wege durchrechnen – alles vom Rechner gespielt.
 * Aufruf: node tools/riss-pfade.js [Gruppen] [Sekunden je Runde]
 * Teil 1: je Raumart Leben, Erfahrung, Runden, Siegquote (Gruppe auf der Stufe, mit der man dort etwa ankommt).
 * Teil 2: ganze Wege in acht Minuten – zufällig, und gezielt auf Bosse.
 */
const R = require("../js/regeln.js"), D = require("../daten/grauwacht.js"), botF = require("../server/arena-bot.js");
const K = require("../js/riss-kern.js")(R, D.KARTEN, botF), H = R.FD.REIHE;
let zs = 77; const zf = () => { zs = (zs * 1103515245 + 12345) & 0x7fffffff; return zs / 0x7fffffff; };
const zieh = () => H.map((h) => [zf(), h]).sort((a, b) => a[0] - b[0]).slice(0, 3).map((x) => x[1]);
const N = +process.argv[2] || 60, SEK = +process.argv[3] || 25, ZEIT = K.KARTE.ZEIT_NETZ;
const alle = K.NETZ.innen.concat(K.NETZ.aussen);
const spiel = (W, ort, seed, runden) => { const st = R.neuesSpiel(seed, K.kOpts(W, ort)); K.raumDinge(W, st); let z = 0; while (!st.ende && z++ < 900 && st.runde <= runden) { if (R.aktiv(st).seite === "gegner") R.gegnerZug(st); else R.autoZug(st); } return st; };

console.log(`Teil 1: Räume einzeln (${N} Gruppen je Raum; Gruppe frisch auf der genannten Stufe)`);
for (const id of alle) for (const stufe of id.startsWith("n_") ? [2] : [3, 5]) {
  let lp = 0, xp = 0, rd = 0, sieg = 0, gef = 0, fehler = 0;
  for (let i = 0; i < N; i++) { const W = K.neuK(zieh(), "x", alle); for (const f of W.gruppe) W.stufen[f] = stufe; const ort = alle.indexOf(id);
    try { const st = spiel(W, ort, i * 17 + 3, 99), m = st.figuren.filter((f) => f.seite === "gegner"); lp += m.reduce((a, f) => a + f.tpMax, 0); const e = K.kEnde(W, ort, st, zf, !st.ende); xp += e.xp; rd += e.runden; sieg += e.sieg ? 1 : 0; gef += e.gefallen.length; } catch (e) { fehler++; if (fehler === 1) console.log("  FEHLER", id, e.message); } }
  console.log(`  ${id.padEnd(12)} Stufe ${stufe}: Leben ${(lp / N).toFixed(0).padStart(3)} · Erfahrung ${(xp / N).toFixed(0).padStart(3)} · Runden ${(rd / N).toFixed(1)} · Sieg ${Math.round(100 * sieg / N)} % · gefallen ${(gef / N).toFixed(1)}${fehler ? " · FEHLER " + fehler : ""}`);
}

/** Ein Weg in der Zeit. wahl(W, kandidaten) sucht den nächsten Raum aus. */
function weg(seed, wahl) {
  const karte = K.netzLosen(zf), W = K.neuK(zieh(), "x", karte); let rest = ZEIT, raeume = 0, boss = 0; const dran = [];
  { const st = spiel(W, "M", seed, 99); K.kEnde(W, "M", st, zf, false); rest -= st.runde * SEK; }
  while (rest >= SEK) { const kand = K.kWege(W).filter((o) => dran.indexOf(o) < 0); if (!kand.length) break; const ort = wahl(W, kand); dran.push(ort);
    const st = spiel(W, ort, seed * 13 + ort + 1, Math.floor(rest / SEK)), e = K.kEnde(W, ort, st, zf, !st.ende); rest -= Math.min(rest, st.runde * SEK); raeume++; if (e.bossBesiegt) boss++;
    for (const t of e.tot) { const d = K.kDrop(W, t.boss, zf); if (!d.ding) K.kNimm(W, d); } if (e.abgebrochen) break; }
  return { stufe: K.kStufe(W.xp).stufe, xp: W.xp, raeume, boss, splitter: W.splitter, leben: K.lebenSchnitt(W) };
}
const zufall = (W, kand) => kand[Math.floor(zf() * kand.length)];
const klasse = (W, o) => K.kDef(W, o).klasse;
const bossJagd = (W, kand) => kand.find((o) => klasse(W, o) === "boss") || kand.find((o) => o < 4) || kand.find((o) => klasse(W, o) === "schwer") || kand[0]; // erst Bosse, sonst der Weg dorthin
const splitterJagd = (W, kand) => kand.find((o) => klasse(W, o) === "splitter") || kand.find((o) => klasse(W, o) === "leicht") || kand.find((o) => klasse(W, o) === "schwer") || kand[0];
console.log(`\nTeil 2: ganze Wege in ${ZEIT / 60} Minuten, ${SEK} Sekunden je Kampfrunde (${N * 3} Wege je Zeile)`);
for (const [name, w] of [["zufällig", zufall], ["auf Bosse", bossJagd], ["auf Splitter", splitterJagd]]) {
  const l = []; for (let i = 0; i < N * 3; i++) l.push(weg(1000 + i, w));
  const m = (f) => (l.reduce((a, x) => a + f(x), 0) / l.length), st = {}; for (const x of l) st[x.stufe] = (st[x.stufe] || 0) + 1;
  console.log(`  ${name.padEnd(13)} Stufe Ø ${m((x) => x.stufe).toFixed(1)} (höchste ${Math.max(...l.map((x) => x.stufe))}, Stufe 10: ${st[10] || 0} von ${l.length}) · Erfahrung Ø ${m((x) => x.xp).toFixed(0)} · Räume Ø ${m((x) => x.raeume).toFixed(1)} · Bosse Ø ${m((x) => x.boss).toFixed(1)} · Splitter Ø ${m((x) => x.splitter).toFixed(0)} · Leben am Ende Ø ${Math.round(100 * m((x) => x.leben))} %`);
  console.log("                Verteilung der Stufen: " + Object.keys(st).sort((a, b) => a - b).map((k) => `${k}: ${st[k]}`).join(" · "));
}
