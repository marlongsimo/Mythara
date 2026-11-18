const R = require("../js/regeln.js"), D = require("../daten/grauwacht.js"), botF = require("../server/arena-bot.js");
const K = require("../js/riss-kern.js")(R, D.KARTEN, botF), H = R.FD.REIHE;
let zs = 5; const zf = () => { zs = (zs * 1103515245 + 12345) & 0x7fffffff; return zs / 0x7fffffff; };
const zieh = () => H.map((h) => [zf(), h]).sort((a, b) => a[0] - b[0]).slice(0, 3).map((x) => x[1]);
const N = +process.argv[2] || 40, heil = process.argv[3] || "gerechnet"; let rd = 0, weg = 0, fr = 0, frS = 0, grund = {}, tiefe = {}, aus = 0, rueck = 0, zur = 0, fehler = 0, t0 = Date.now();
for (let i = 0; i < N; i++) { const A = K.botWeg(zieh(), 100 + i, "A"), B = K.botWeg(zieh(), 9000 + i, "B");
  tiefe[A.raeume] = (tiefe[A.raeume] || 0) + 1; tiefe[B.raeume] = (tiefe[B.raeume] || 0) + 1;
  let st; try { st = K.finaleAuto(777 + i, A, B, { heilung: heil }); } catch (e) { fehler++; console.log("FEHLER", e.stack.split("\n").slice(0, 4).join(" | ")); continue; }
  const X = st.riss; if (!X.aus) { fehler++; continue; }
  rd += X.aus.runden; weg += (A.runden + B.runden) / 2; grund[X.aus.grund] = (grund[X.aus.grund] || 0) + 1; aus += X.M.aus; rueck += X.M.rueck; zur += X.M.zurueck;
  if (X.frueh) { fr++; if (X.aus.sieger === X.frueh) frS++; } }
const n = N - fehler;
console.log(`${n} Partien (${heil}), ${fehler} Fehler, ${((Date.now() - t0) / n / 1000).toFixed(1)} s je Partie\nWeg Ø ${(weg / n).toFixed(1)} Runden · Finale Ø ${(rd / n).toFixed(1)} Runden · Ende ${JSON.stringify(grund)}\nTiefe ${JSON.stringify(tiefe)} · frühere Gruppe gewinnt ${frS}/${fr}\nAuslöschungen Ø ${(aus / n).toFixed(2)} · Rückkehrer Ø ${(rueck / n).toFixed(2)} · zurückerobert Ø ${(zur / n).toFixed(2)}`);
