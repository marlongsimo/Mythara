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
 * Aufruf: node tools/wettlauf-sim.js [N=60] [--teil=A,B,C,D,E,F] [--variante=A|B|C|D]
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
/** o.einstieg: Die erste Etappe ist ein fester Einstiegsraum, der sicher gelingt (+1 Stufe, drei Runden, kein Schaden – vereinfacht).
 *  o.heilung: Nach einem verlorenen Raum sind alle wieder voll geheilt (statt halber Trefferpunkte). */
function weg(plan, seed, gruppe, o = {}) {
  const stufen = Object.fromEntries(gruppe.map((f) => [f, 1])); let zust = null, runden = 0, siege = 0, kaempfe = 0;
  [...plan].forEach((art, i) => {
    if (art === "R") { zust = null; return; } // Rast: alles voll
    if (o.einstieg && i === 0) { for (const f of gruppe) stufen[f] = 2; runden += 3; kaempfe++; siege++; zust = null; return; }
    const st = raum(seed * 13 + i, gruppe, stufen, (art === "S" ? SCHWER : LEICHT)[(seed + i) % 3], zust ? R.neuerKampf(zust) : null);
    kaempfe++; runden += st.runde; const sieg = st.ende === "sieg"; if (sieg) siege++;
    zust = R.nachKampf(st);
    if (!sieg && o.heilung) { zust = null; return; }
    for (const f of gruppe) { const z = zust[f], alt = stufen[f];
      if (z.tot || !sieg) { z.tot = false; z.tp = Math.ceil(F.tpVon(f, alt) / 2); if (!sieg) continue; if (st.figuren.find((x) => x.fid === f).tp <= 0) continue; } // gefallen: halbe TP, keine Stufe
      stufen[f] = Math.min(10, alt + (art === "S" ? 2 : 1)); z.tp += F.tpVon(f, stufen[f]) - F.tpVon(f, alt); z.stufe = stufen[f]; }
  });
  const tp = zust ? gruppe.reduce((a, f) => a + zust[f].tp / F.tpVon(f, stufen[f]), 0) / gruppe.length : 1;
  return { stufe: gruppe.reduce((a, f) => a + stufen[f], 0) / gruppe.length, runden, siege, kaempfe, tp, stufen, leben: zust ? Object.fromEntries(gruppe.map((f) => [f, zust[f].tp / F.tpVon(f, stufen[f])])) : null };
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

/* ---------- Teil D: Streuung der Wege und der schwere Raum je Stufe ---------- */
if (TEILE.includes("D")) {
  console.log(`\nTeil D – Streuung der Endstufe (${N} Gruppen je Plan)`);
  for (const [name, plan] of Object.entries(PLAENE)) { const l = []; for (let i = 0; i < N; i++) l.push(weg(plan, 500 + i, zieh(3)).stufe); l.sort((a, b) => a - b);
    const q = (p) => l[Math.floor(p * (l.length - 1))].toFixed(1), anteil = (fn) => pct(l.filter(fn).length, l.length);
    console.log(`  ${name.padEnd(28)} Median ${q(0.5)} · untere 10 % bis ${q(0.1)} · obere 10 % ab ${q(0.9)} · Endstufe 1–2: ${anteil((x) => x <= 2)} · Endstufe 7+: ${anteil((x) => x >= 7)}`); }
  console.log(`\n  Ein einzelner Raum mit vollen Trefferpunkten, je nach Stufe der Gruppe (${N} Gruppen je Zeile)`);
  for (const stufe of [1, 2, 3, 4, 5]) { const erg = {};
    for (const [art, liste] of [["leicht", LEICHT], ["schwer", SCHWER]]) { let si = 0, rd = 0; for (let i = 0; i < N; i++) { const g = zieh(3), st = raum(9000 + i, g, Object.fromEntries(g.map((f) => [f, stufe])), liste[i % 3], null); if (st.ende === "sieg") si++; rd += st.runde; } erg[art] = `${pct(si, N)} (Ø ${(rd / N).toFixed(1)} Runden)`; }
    console.log(`  Stufe ${stufe}: leichter Raum gewonnen ${erg.leicht} · schwerer Raum gewonnen ${erg.schwer}`); }
}

/* ---------- Teil E: Finale mit den Stufen und dem Leben, die der Weg tatsächlich ergeben hat ---------- */
function duellMit(e1, g1, e2, g2, seed, karte) {
  let jetzt = 1000000; const t1 = g1.map((held) => ({ held, stufe: e1.stufen[held] })), t2 = g2.map((held) => ({ held, stufe: e2.stufen[held] }));
  const m = { staerke: 1, seed, modus: "duell", karte, begegnung: "kobolde", kampfstufe: Math.max(...t1.concat(t2).map((x) => x.stufe)), host_name: "A", guest_name: "B", bot: true, host_team: t1, guest_team: t2 };
  const st = K.start(m, 0, 0, jetzt).st; let merk = { lauf: 0 }, wer = null;
  // Leben vom Weg mitnehmen; vor dem Finale kommt die Hälfte des Fehlenden zurück (Konzept)
  for (const f of st.figuren) { const tm = R.teamVon(st, f), e = tm === 1 ? e1 : tm === 2 ? e2 : null; if (!e || !e.leben || e.leben[f.fid] == null || f.tpMax == null) continue; const a = Math.min(1, e.leben[f.fid]); f.tp = Math.max(1, Math.round(f.tpMax * (a + (1 - a) / 2))); }
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
if (TEILE.includes("E")) {
  console.log(`\nTeil E – Finale Plan gegen Plan, mit Stufen und Leben vom Weg (${N} Partien je Zeile; ohne Siegelpunkte, ohne Beute)`);
  const PAARE = [["LLSS", "LLLL"], ["LLSS", "LSRS"], ["LLSS", "SSSS"], ["LLSS", "LSS"], ["LLLL", "LSS"], ["LSRS", "LSS"], ["LLLL", "LSRS"]], NAME = Object.fromEntries(Object.entries(PLAENE).map(([n, p]) => [p, n]));
  let hoeher = 0, hoeherN = 0;
  for (const [pa, pb] of PAARE) { let s = 0, n = 0, da = 0, db = 0;
    for (let i = 0; i < N; i++) { const ga = zieh(3), gb = zieh(3), ea = weg(pa, 20000 + i, ga), eb = weg(pb, 40000 + i, gb), seite = i % 2, r = seite ? duellMit(eb, gb, ea, ga, 60000 + i, KARTEN[i % 7]) : duellMit(ea, ga, eb, gb, 60000 + i, KARTEN[i % 7]);
      if (r.fehler) continue; n++; da += ea.stufe; db += eb.stufe; const aGewinnt = r.sieger === (seite ? 2 : 1) ? 1 : r.sieger ? 0 : 0.5; s += aGewinnt;
      if (Math.abs(ea.stufe - eb.stufe) >= 0.5) { hoeherN++; hoeher += ea.stufe > eb.stufe ? aGewinnt : 1 - aGewinnt; } }
    console.log(`  „${NAME[pa]}“ (Ø Stufe ${(da / n).toFixed(1)}) gegen „${NAME[pb]}“ (Ø Stufe ${(db / n).toFixed(1)}): der erste gewinnt ${pct(s, n)}`); }
  console.log(`  Über alle Paarungen: Die Gruppe mit der höheren Stufe gewinnt ${pct(hoeher, hoeherN)} (${hoeherN} Partien mit Unterschied) – die schwächere also ${pct(hoeherN - hoeher, hoeherN)}`);
}

/* ---------- Teil F: vier Regelvarianten gegeneinander (gleiche Gruppen, gleiche Pläne, gleicher Zufall) ---------- */
if (TEILE.includes("F")) {
  const VAR = { A: { name: "A – bisher", o: {} }, B: { name: "B – sicherer Einstieg", o: { einstieg: true } }, C: { name: "C – Einstieg und volle Heilung nach Niederlage", o: { einstieg: true, heilung: true } }, D: { name: "D – wie C, vor dem Finale höchstens eine Stufe Abstand", o: { einstieg: true, heilung: true }, ausgleich: true } };
  const welche = ((process.argv.find((a) => a.startsWith("--variante=")) || "--variante=A,B,C,D").split("=")[1]).split(","), PL = Object.values(PLAENE);
  const schnitt = (e, g) => g.reduce((a, f) => a + e.stufen[f], 0) / g.length;
  for (const v of welche) { const V = VAR[v]; zs = 4711; let n = 0, schwachSieg = 0, mitUnter = 0, diff = 0, ab2 = 0, ab2nach = 0, frueh = 0, runden = 0;
    for (let i = 0; i < N; i++) { const ga = zieh(3), gb = zieh(3), pa = PL[Math.floor(zf() * PL.length)], pb = PL[Math.floor(zf() * PL.length)];
      const ea = weg(pa, 20000 + i, ga, V.o), eb = weg(pb, 40000 + i, gb, V.o), sa = schnitt(ea, ga), sb = schnitt(eb, gb), d = Math.abs(sa - sb);
      if (ea.stufe <= 2) frueh++; if (eb.stufe <= 2) frueh++;
      if (V.ausgleich && d > 1) { const [es, gs, ziel] = sa < sb ? [ea, ga, sb - 1] : [eb, gb, sa - 1]; let schutz = 0; while (schnitt(es, gs) < ziel - 1e-9 && schutz++ < 40) { const f = gs.slice().sort((x, y) => es.stufen[x] - es.stufen[y])[0]; es.stufen[f]++; } }
      const dn = Math.abs(schnitt(ea, ga) - schnitt(eb, gb)), seite = i % 2, r = seite ? duellMit(eb, gb, ea, ga, 60000 + i, KARTEN[i % 7]) : duellMit(ea, ga, eb, gb, 60000 + i, KARTEN[i % 7]);
      if (r.fehler) continue; n++; diff += d; if (d >= 2) ab2++; if (dn >= 2) ab2nach++; runden += (ea.runden + eb.runden) / 2 + r.runden;
      if (d >= 0.5) { mitUnter++; const aGewinnt = r.sieger === (seite ? 2 : 1) ? 1 : r.sieger ? 0 : 0.5; schwachSieg += sa < sb ? aGewinnt : 1 - aGewinnt; } }
    console.log(`\n${V.name} (${n} Partien, Pläne zufällig)\n  Die schwächere Gruppe gewinnt ${pct(schwachSieg, mitUnter)} (${mitUnter} Partien mit Unterschied)\n  Stufenabstand nach dem Weg Ø ${(diff / n).toFixed(2)} · mindestens zwei Stufen Abstand: ${pct(ab2, n)}${V.ausgleich ? ` (nach dem Angleichen ${pct(ab2nach, n)})` : ""}\n  Gruppen, die höchstens Stufe 2 erreichen: ${pct(frueh, 2 * n)} · Runden je Partie Ø ${(runden / n).toFixed(1)}`); }
}
