/*
 * Rissgänger: ganze Partien Rechner gegen Rechner (Weg, Abbiegen, Finale).
 * Aufruf: node tools/riss-partien.js [Partien] [gerechnet|keine] [fest]
 */
const R = require("../js/regeln.js"), D = require("../daten/grauwacht.js"), botF = require("../server/arena-bot.js");
const K = require("../js/riss-kern.js")(R, D.KARTEN, botF), H = R.FD.REIHE;
let zs = 5; const zf = () => { zs = (zs * 1103515245 + 12345) & 0x7fffffff; return zs / 0x7fffffff; };
const zieh = () => H.map((h) => [zf(), h]).sort((a, b) => a[0] - b[0]).slice(0, 3).map((x) => x[1]);
const N = +process.argv[2] || 40, heil = process.argv[3] === "keine" ? "keine" : "gerechnet", fest = process.argv[4] === "fest";
let rd = 0, weg = 0, grund = {}, tiefe = {}, aus = 0, rueck = 0, zur = 0, fehler = 0, t0 = Date.now(); const vorS = {}, proTiefe = {};
for (let i = 0; i < N; i++) { const folge = fest ? null : K.folgeLosen(zf), A = K.botWeg(zieh(), 100 + i, "A", folge), B = K.botWeg(zieh(), 9000 + i, "B", folge);
  tiefe[A.raeume] = (tiefe[A.raeume] || 0) + 1; tiefe[B.raeume] = (tiefe[B.raeume] || 0) + 1;
  let st; try { st = K.finaleAuto(777 + i, A, B, { heilung: heil }); } catch (e) { fehler++; console.log("FEHLER", e.stack.split("\n").slice(0, 4).join(" | ")); continue; }
  const X = st.riss; if (!X.aus) { fehler++; continue; }
  rd += X.aus.runden; weg += (A.runden + B.runden) / 2; grund[X.aus.grund] = (grund[X.aus.grund] || 0) + 1; aus += X.M.aus; rueck += X.M.rueck; zur += X.M.zurueck;
  for (const [W, t] of [[A, 1], [B, 2]]) { const s = proTiefe[W.raeume] = proTiefe[W.raeume] || { n: 0, sieg: 0 }; s.n++; if (X.aus.sieger === t) s.sieg++; }
  if (X.frueh) { const v = vorS[X.vor] = vorS[X.vor] || { n: 0, sieg: 0 }; v.n++; if (X.aus.sieger === X.frueh) v.sieg++; } }
const n = N - fehler;
console.log(`${n} Partien (Heilung: ${heil}, Weg: ${fest ? "fest" : "gelost"}), ${fehler} Fehler, ${((Date.now() - t0) / n / 1000).toFixed(1)} s je Partie`);
console.log(`Weg Ø ${(weg / n).toFixed(1)} Runden je Seite · Finale Ø ${(rd / n).toFixed(1)} Runden · Ende ${JSON.stringify(grund)}`);
console.log(`Abgebogen nach Raum ${JSON.stringify(tiefe)} · Auslöschungen Ø ${(aus / n).toFixed(2)} · Rückkehrer Ø ${(rueck / n).toFixed(2)} · zurückerobert Ø ${(zur / n).toFixed(2)}`);
console.log("Die frühere Gruppe gewinnt – " + Object.keys(vorS).sort().map((v) => `${v} ${v === "1" ? "Raum" : "Räume"} Vorsprung: ${vorS[v].sieg} von ${vorS[v].n}`).join(" · "));
console.log("Siege nach eigener Raumzahl – " + Object.keys(proTiefe).sort().map((k) => `${k} Räume: ${proTiefe[k].sieg} von ${proTiefe[k].n}`).join(" · "));
