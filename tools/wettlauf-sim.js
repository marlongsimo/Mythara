/*
 * Wettlauf zum Siegel – erste Durchrechnung (Konzept: doku/konzepte/wettlauf-zum-siegel.md). Ändert nichts am Spiel.
 *
 * Teil A – der Weg: Dreiergruppen ab Stufe 1 spielen vier Etappen gegen Monster, Schaden wird mitgenommen.
 *          Verglichen werden Wegepläne (nur leicht, nur schwer, gemischt mit Rast, Schleichweg mit einer Etappe weniger).
 * Teil B – das Finale: Duell drei gegen drei mit Stufenvorsprung. Wie oft gewinnt die höhere Gruppe?
 * Teil C – Helden über die Stufen: Siegquote je Held im Duell auf Stufe 1, 3, 5 und 7.
 *
 * Vereinfachungen: Das Finale ist ein gewöhnliches Arena-Duell (ohne Siegelpunkte, alle mit vollen Trefferpunkten, ohne Beute),
 * Störungen und Beute sind nicht nachgebildet. Gesteuert wird alles von den eingebauten Rechner-Gegnern.
 * Aufruf: node tools/wettlauf-sim.js [N=60] [--teil=A,B,C]
 */
"use strict";
const R = require("../js/regeln.js"), D = require("../daten/grauwacht.js"), kern = require("../server/arena-kern.js"), botF = require("../server/arena-bot.js"), F = R.FD;
const K = kern(R, D.KARTEN, botF), BOT = botF(R);
const N = +process.argv.find((a) => /^\d+$/.test(a)) || 60, TEILE = ((process.argv.find((a) => a.startsWith("--teil=")) || "--teil=A,B,C").split("=")[1]).split(",");
const HELDEN = F.REIHE.slice(), KARTEN = ["garten", "turm", "gruft", "pilze", "schacht", "halle", "siegel"];
let zs = 4711; const zf = () => { zs = (zs * 1103515245 + 12345) & 0x7fffffff; return zs / 0x7fffffff; };
const zieh = (n, ohne = []) => HELDEN.filter((h) => !ohne.includes(h)).map((h) => [zf(), h]).sort((a, b) => a[0] - b[0]).slice(0, n).map((x) => x[1]);
const pct = (a, b) => (b ? Math.round(100 * a / b) + " %" : "–");

/* ---------- Teil A: der Weg ---------- */
const LEICHT = ["garten", "kobolde", "kaefer_kobolde"], SCHWER = ["gruft", "pilze", "netz"];
const PLAENE = { "nur leicht": "LLLL", "nur schwer": "SSSS", "gemischt mit Rast": "LSRS", "erst leicht, dann schwer": "LLSS", "Schleichweg (drei Etappen)": "LSS" };
function raum(seed, gruppe, stufen, beg, vorher) {
  const st = R.neuesSpiel(seed, { figuren: gruppe, stufenListe: gruppe.map((f) => stufen[f]), stufe: Math.round(gruppe.reduce((a, f) => a + stufen[f], 0) / gruppe.length), begegnung: beg, vorher, schwierigkeit: "normal" }); let z = 0;
  while (!st.ende && z++ < 900) { if (R.aktiv(st).seite === "gegner") R.gegnerZug(st); else R.autoZug(st); }
  return st;
}
function weg(plan, seed, gruppe) {
  const stufen = Object.fromEntries(gruppe.map((f) => [f, 1])); let zust = null, runden = 0, siege = 0, kaempfe = 0;
  [...plan].forEach((art, i) => {
    if (art === "R") { zust = null; return; } // Rast: alles voll
    const st = raum(seed * 13 + i, gruppe, stufen, (art === "S" ? SCHWER : LEICHT)[(seed + i) % 3], zust ? R.neuerKampf(zust) : null);
    kaempfe++; runden += st.runde; const sieg = st.ende === "sieg"; if (sieg) siege++;
    zust = R.nachKampf(st);
    for (const f of gruppe) { const z = zust[f], alt = stufen[f];
      if (z.tot || !sieg) { z.tot = false; z.tp = Math.ceil(F.tpVon(f, alt) / 2); if (!sieg) continue; if (st.figuren.find((x) => x.fid === f).tp <= 0) continue; } // gefallen: halbe TP, keine Stufe
      stufen[f] = Math.min(10, alt + (art === "S" ? 2 : 1)); z.tp += F.tpVon(f, stufen[f]) - F.tpVon(f, alt); z.stufe = stufen[f]; }
  });
  const tp = zust ? gruppe.reduce((a, f) => a + zust[f].tp / F.tpVon(f, stufen[f]), 0) / gruppe.length : 1;
  return { stufe: gruppe.reduce((a, f) => a + stufen[f], 0) / gruppe.length, runden, siege, kaempfe, tp };
}
if (TEILE.includes("A")) {
  console.log(`\nTeil A – der Weg (${N} Gruppen je Plan, Start auf Stufe 1)`);
  for (const [name, plan] of Object.entries(PLAENE)) { let s = 0, r = 0, si = 0, ka = 0, tp = 0, min = 99, max = 0;
    for (let i = 0; i < N; i++) { const e = weg(plan, 500 + i, zieh(3)); s += e.stufe; r += e.runden; si += e.siege; ka += e.kaempfe; tp += e.tp; min = Math.min(min, e.stufe); max = Math.max(max, e.stufe); }
    console.log(`  ${name.padEnd(28)} Endstufe Ø ${(s / N).toFixed(1)} (${min.toFixed(1)}–${max.toFixed(1)}) · Räume gewonnen ${pct(si, ka)} · Runden gesamt Ø ${(r / N).toFixed(1)} · Leben am Ende Ø ${pct(tp, N)}`); }
}

/* ---------- Duell über den Arena-Kern ---------- */
function duell(t1, t2, seed, karte) {
  let jetzt = 1000000;
  const m = { staerke: 1, seed, modus: "duell", karte, begegnung: "kobolde", kampfstufe: Math.max(...t1.concat(t2).map((x) => x.stufe)), host_name: "A", guest_name: "B", bot: true, host_team: t1, guest_team: t2 };
  const st = K.start(m, 0, 0, jetzt).st; let merk = { lauf: 0 }, wer = null;
  for (let i = 0; i < 5000; i++) {
    if (st.ende) return { sieger: st.arena.sieger || 0, runden: st.runde };
    const a = R.aktiv(st), tm = R.teamVon(st, a); if (!tm) return { fehler: 1 };
    if (tm === 2) { jetzt = Math.max(jetzt, st.arena.bot.bis) + 50; if (!K.zeit(st, jetzt).schritte.length) return { fehler: 1 }; continue; }
    const k = a.id + ":" + st.runde; if (wer !== k) { wer = k; merk = { lauf: 0 }; }
    jetzt += 1500; const w = BOT.entscheide(st, merk); if (w.typ === "bewegen") merk.lauf++;
    let r = K.zug(st, 1, w, jetzt); if (r.fehler) r = K.zug(st, 1, { typ: "ende" }, jetzt); if (r.fehler) return { fehler: 1 };
  }
  return { fehler: 1 };
}
const team = (helden, stufe) => helden.map((held) => ({ held, stufe }));

if (TEILE.includes("B")) {
  console.log(`\nTeil B – Finale mit Stufenvorsprung (${N} Duelle je Zeile, Seiten abwechselnd)`);
  for (const basis of [3, 5]) for (const vor of [0, 1, 2, 3]) { let s = 0, n = 0, rd = 0, f = 0;
    for (let i = 0; i < N; i++) { const a = zieh(3), b = zieh(3), hoch = team(a, basis + vor), tief = team(b, basis), seite = i % 2, r = seite ? duell(tief, hoch, 3000 + i, KARTEN[i % 7]) : duell(hoch, tief, 3000 + i, KARTEN[i % 7]);
      if (r.fehler) { f++; continue; } n++; rd += r.runden; if (r.sieger === (seite ? 2 : 1)) s++; else if (!r.sieger) s += 0.5; }
    console.log(`  Stufe ${basis + vor} gegen Stufe ${basis} (Vorsprung ${vor}): die höhere Gruppe gewinnt ${pct(s, n)} · Runden Ø ${(rd / Math.max(1, n)).toFixed(1)}${f ? ` · ${f} Abbrüche` : ""}`); }
}

if (TEILE.includes("C")) {
  console.log(`\nTeil C – Helden über die Stufen (${N} Duelle je Held und Stufe: der Held mit zwei zufälligen Gefährten gegen drei zufällige)`);
  const zeile = {};
  for (const stufe of [1, 3, 5, 7]) for (const h of HELDEN) { let s = 0, n = 0;
    for (let i = 0; i < N; i++) { const a = [h, ...zieh(2, [h])], b = zieh(3, [h]), seite = i % 2, r = seite ? duell(team(b, stufe), team(a, stufe), 7000 + i, KARTEN[i % 7]) : duell(team(a, stufe), team(b, stufe), 7000 + i, KARTEN[i % 7]);
      if (r.fehler) continue; n++; if (r.sieger === (seite ? 2 : 1)) s++; else if (!r.sieger) s += 0.5; }
    (zeile[h] = zeile[h] || []).push(n ? Math.round(100 * s / n) : null); }
  console.log("  " + "Held".padEnd(20) + "St. 1   St. 3   St. 5   St. 7   Spanne");
  for (const h of HELDEN) { const z = zeile[h], w = z.filter((x) => x != null); console.log("  " + F.FIGUREN[h].name.padEnd(20) + z.map((x) => (x == null ? "–" : x + " %").padEnd(8)).join("") + (Math.max(...w) - Math.min(...w)) + " Punkte"); }
}
