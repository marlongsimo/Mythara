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
 * Aufruf: node tools/wettlauf-sim.js [N=60] [--teil=A,B,C,D,E,F,G,H,K,R,S,T] [--beute=ding|dingPassend|segen] [--paare=2-3,2-5,…] [--punkte=0,1,2] [--test=A,B,C,D,E,F,G,E2,G2] [--bloecke=1,2,…] [--variante=A|B|C|D]
 */
"use strict";
const R = require("../js/regeln.js"), D = require("../daten/grauwacht.js"), kern = require("../server/arena-kern.js"), botF = require("../server/arena-bot.js"), F = R.FD;
const K = kern(R, D.KARTEN, botF), BOT = botF(R);
const N = +process.argv.find((a) => /^\d+$/.test(a)) || 60, TEILE = ((process.argv.find((a) => a.startsWith("--teil=")) || "--teil=A,B,C").split("=")[1]).split(",");
const HELDEN = F.REIHE.slice(), KARTEN = ["garten", "turm", "gruft", "pilze", "schacht", "halle", "siegel"];
let zs = 4711; const zf = () => { zs = (zs * 1103515245 + 12345) & 0x7fffffff; return zs / 0x7fffffff; };
const zieh = (n, ohne = []) => HELDEN.filter((h) => !ohne.includes(h)).map((h) => [zf(), h]).sort((a, b) => a[0] - b[0]).slice(0, n).map((x) => x[1]);
const pct = (a, b) => (b ? Math.round(100 * a / b) + " %" : "–");

/* Beute: nur Gegenstände und Segen, die auch im Duell wirken. Segen gelten in der Arena für die Seite am Zug; deshalb nur solche, die beim eigenen Zug zählen, plus Wachtfeuer (von Hand angerechnet). */
const DING_POOL = ["amulett", "eulenmantel", "gluecksbringer", "stiefel", "wetzstein", "ring", "schleifstein", "feder", "eisenspitzen", "stab"], SEGEN_POOL = ["klingen", "fuesse", "wachtfeuer"];
const NAH = new Set(["krieger", "schurke"]), ZAUBER = new Set(["zauberer", "kleriker"]);
const passt = (id, fid) => { const k = F.FIGUREN[fid].klasse; return id === "ring" || id === "schleifstein" ? NAH.has(k) : id === "feder" || id === "eisenspitzen" ? k === "waldlaeufer" : id === "stab" ? ZAUBER.has(k) : true; };

/* ---------- Teil A: der Weg ---------- */
const LEICHT = ["garten", "kobolde", "kaefer_kobolde"], SCHWER = ["gruft", "pilze", "netz"];
const PLAENE = { "nur leicht": "LLLL", "nur schwer": "SSSS", "gemischt mit Rast": "LSRS", "erst leicht, dann schwer": "LLSS", "Schleichweg (drei Etappen)": "LSS" };
function raum(seed, gruppe, stufen, beg, vorher, x = {}) {
  const st = R.neuesSpiel(seed, { figuren: gruppe, stufenListe: gruppe.map((f) => stufen[f]), stufe: Math.round(gruppe.reduce((a, f) => a + stufen[f], 0) / gruppe.length), begegnung: beg, vorher, schwierigkeit: "normal", segen: x.segen || [], bedrohung: x.bedrohung || 0 }); let z = 0;
  for (const f of st.figuren) for (const id of (x.dinge || {})[f.fid] || []) { f.rucksack = f.rucksack || []; if (!f.rucksack.some((d) => d.id === id)) f.rucksack.push({ id, n: 1 }); }
  while (!st.ende && z++ < 900) { if (R.aktiv(st).seite === "gegner") R.gegnerZug(st); else R.autoZug(st); }
  return st;
}
/** o.einstieg: Die erste Etappe ist ein fester Einstiegsraum, der sicher gelingt (+1 Stufe, drei Runden, kein Schaden – vereinfacht).
 *  o.heilung: Nach einem verlorenen Raum sind alle wieder voll geheilt (statt halber Trefferpunkte). */
function weg(plan, seed, gruppe, o = {}) {
  const stufen = Object.fromEntries(gruppe.map((f) => [f, 1])); let zust = null, runden = 0, siege = 0, kaempfe = 0;
  /* Beute (o.beute) nur für gewonnene Räume ab dem vierten: "ding" = Gegenstand an einen zufälligen Helden, "dingPassend" = an einen Helden, der ihn nutzen kann,
     "segen" = ein Gruppensegen, "splitter" = ein Splitter (stört den nächsten Raum des Gegners, siehe o.stoerung = Raumnummern mit erhöhter Bedrohung) */
  const dinge = {}, segen = [], B = { splitter: 0, vergeben: 0, wirksam: 0, tief: [] }, zb = (n) => { let h = (seed * 2654435761 + n * 40503) >>> 0; h ^= h >>> 13; h = Math.imul(h, 1274126177) >>> 0; return (h >>> 8) / 16777216; };
  const beuteGeben = (i) => { if (!o.beute) return;
    if (o.beute === "segen") { const frei = SEGEN_POOL.filter((x) => !segen.includes(x)); if (frei.length) segen.push(frei[Math.floor(zb(i) * frei.length)]); B.vergeben++; B.wirksam++; return; }
    if (o.beute === "splitter") { B.splitter++; B.vergeben++; return; }
    let id = DING_POOL[Math.floor(zb(i) * DING_POOL.length)], f = gruppe[Math.floor(zb(i + 50) * gruppe.length)];
    if (o.beute === "dingPassend") { for (let n = 0; n < 12 && !gruppe.some((g) => passt(id, g)); n++) id = DING_POOL[Math.floor(zb(i + 100 + n) * DING_POOL.length)]; const l = gruppe.filter((g) => passt(id, g) && !(dinge[g] || []).includes(id)); if (l.length) f = l[Math.floor(zb(i + 70) * l.length)]; }
    (dinge[f] = dinge[f] || []).push(id); B.vergeben++; if (passt(id, f)) B.wirksam++; };
  [...plan].forEach((art, i) => {
    if (art === "R") { zust = null; return; } // Rast: alles voll
    if (o.einstieg && i === 0) { for (const f of gruppe) stufen[f] = 2; runden += 3; kaempfe++; siege++; zust = null; return; }
    const gestoert = (o.stoerung || []).includes(i);
    const st = raum(seed * 13 + i, gruppe, stufen, (art === "S" ? SCHWER : LEICHT)[(seed + i) % 3], zust ? R.neuerKampf(zust) : null, { dinge, segen, bedrohung: gestoert ? 2 : 0 });
    kaempfe++; runden += st.runde; const sieg = st.ende === "sieg"; if (sieg) siege++;
    if (i >= 3) B.tief.push({ sieg, runden: st.runde, gestoert, tp: st.figuren.filter((x) => x.seite === "spieler" && x.fid).reduce((a, x) => a + Math.max(0, x.tp) / x.tpMax, 0) / gruppe.length });
    if (sieg && i >= 3) beuteGeben(i);
    zust = R.nachKampf(st);
    if (!sieg && o.heilung) { zust = null; return; }
    for (const f of gruppe) { const z = zust[f], alt = stufen[f];
      if (z.tot || !sieg) { z.tot = false; z.tp = Math.ceil(F.tpVon(f, alt) / 2); if (!sieg) continue; if (st.figuren.find((x) => x.fid === f).tp <= 0) continue; } // gefallen: halbe TP, keine Stufe
      stufen[f] = Math.min(10, alt + (art === "S" ? 2 : 1)); z.tp += F.tpVon(f, stufen[f]) - F.tpVon(f, alt); z.stufe = stufen[f]; }
  });
  const tp = zust ? gruppe.reduce((a, f) => a + zust[f].tp / F.tpVon(f, stufen[f]), 0) / gruppe.length : 1;
  return { stufe: gruppe.reduce((a, f) => a + stufen[f], 0) / gruppe.length, runden, siege, kaempfe, tp, stufen, dinge, segen, B, leben: zust ? Object.fromEntries(gruppe.map((f) => [f, zust[f].tp / F.tpVon(f, stufen[f])])) : null };
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
  for (const f of st.figuren) { const tm = R.teamVon(st, f), e = tm === 1 ? e1 : tm === 2 ? e2 : null; const hid = f.fid || f.fidA; if (!e || !e.leben || e.leben[hid] == null || f.tpMax == null) continue; const a = Math.min(1, e.leben[hid]); f.tp = Math.max(1, Math.round(f.tpMax * (a + (1 - a) / 2))); }
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

/* ---------- Teil G: das Finale mit Siegel (nur in dieser Rechnung, nicht im Spiel) ----------
 * Siegel = das freie Feld, das der Kartenmitte am nächsten liegt. „Am Siegel“ steht, wer darauf oder direkt daneben steht (auch schräg).
 * Am Ende jeder Runde bekommt die Seite mit mehr stehenden Helden am Siegel einen Punkt, bei Gleichstand niemand.
 * Zurückerobern: Holt die zurückliegende Seite zwei Runden in Folge den Punkt, verliert die führende einen. Sieg: drei Punkte oder alle Gegner besiegt.
 * Nach acht Runden: mehr Punkte, dann mehr Helden am Siegel, dann mehr übrige Trefferpunkte.
 * Spielweise „siegel“: Wer nicht am Siegel steht, läuft zuerst so nah wie möglich heran und kämpft von dort; „duell“: der gewöhnliche Arena-Bot. */
function siegelFeld(st) { const k = st.karte, mx = (k.b - 1) / 2, my = (k.h - 1) / 2; let best = null;
  for (let x = 0; x < k.b; x++) for (let y = 0; y < k.h; y++) { if (k.block.has(x + "," + y)) continue; const d = Math.hypot(x - mx, y - my); if (!best || d < best.d) best = { x, y, d }; }
  return best; }
const amSiegel = (f, s) => Math.max(Math.abs(f.x - s.x), Math.abs(f.y - s.y)) <= 1;
function finale(e1, g1, e2, g2, seed, karte, o = {}) {
  let jetzt = 1000000; const t1 = g1.map((held) => ({ held, stufe: e1.stufen[held] })), t2 = g2.map((held) => ({ held, stufe: e2.stufen[held] }));
  const m = { staerke: 1, seed, modus: "duell", karte, begegnung: "kobolde", kampfstufe: Math.max(...t1.concat(t2).map((x) => x.stufe)), host_name: "A", guest_name: "B", bot: false, host_team: t1, guest_team: t2 };
  const st = K.start(m, 0, 0, jetzt).st, S = siegelFeld(st), spiel = { 1: (o.spiel || {})[1] || "siegel", 2: (o.spiel || {})[2] || "siegel" };
  for (const f of st.figuren) { const tm = R.teamVon(st, f), e = tm === 1 ? e1 : tm === 2 ? e2 : null; const hid = f.fid || f.fidA; if (!e || !e.leben || e.leben[hid] == null || f.tpMax == null) continue; const a = Math.min(1, e.leben[hid]); f.tp = Math.max(1, Math.round(f.tpMax * (a + (1 - a) / 2))); }
  const RG = Object.assign({ ab: 1, ziel: 3, max: 8, allein: false }, o.regel || {});
  const P = { 1: (o.vorsprung || {})[1] || 0, 2: (o.vorsprung || {})[2] || 0 }, folge = { 1: 0, 2: 0 }, M = { erste: null, zurueck: 0, wechsel: 0, halter: 0, verdraengt: 0, serie: 0, laengste: 0, hatte: { 1: false, 2: false } };
  const held = (f) => f.art !== "wolf" && (f.fid || f.fidA); // die Arena tauscht je nach Zug, wer „spieler“ und wer „gegner“ ist: gezählt wird nach Mannschaft
  const steht = (tm) => st.figuren.filter((f) => held(f) && f.tp > 0 && !f.tot && R.teamVon(st, f) === tm && amSiegel(f, S)).length;
  const leben = (tm) => st.figuren.filter((f) => held(f) && R.teamVon(st, f) === tm).reduce((a, f) => a + Math.max(0, f.tp), 0);
  const aus = (sieger, grund) => ({ sieger, grund, runden: Math.min(st.runde, RG.max), punkte: P, M });
  const gegnerAmSiegel = (tm) => st.figuren.filter((g) => held(g) && g.tp > 0 && !g.tot && R.teamVon(st, g) === 3 - tm && amSiegel(g, S));
  let runde = st.runde, merk = { lauf: 0 }, wer = null, gelaufen = null;
  for (let i = 0; i < 6000; i++) {
    if (st.runde !== runde) { // Rundenende werten
      const a = steht(1), b = steht(2), h0 = RG.allein ? (a > 0 && b === 0 ? 1 : b > 0 && a === 0 ? 2 : 0) : a > b ? 1 : b > a ? 2 : 0, h = runde >= RG.ab ? h0 : 0;
      if (h0) { M.hatte[h0] = true; if (M.halter === h0) M.serie++; else { if (M.halter) M.wechsel++; M.serie = 1; } M.halter = h0; M.laengste = Math.max(M.laengste, M.serie); } else M.serie = 0;
      if (h) { const an = 3 - h; if (M.erste == null) M.erste = runde;
        if (P[h] < P[an]) { folge[h]++; if (folge[h] >= 2) { P[an]--; folge[h] = 0; M.zurueck++; } } else folge[h] = 0;
        folge[an] = 0; P[h]++; if (P[h] >= RG.ziel) return aus(h, "siegel"); }
      if (runde >= RG.max) { const a2 = steht(1), b2 = steht(2); return aus(P[1] !== P[2] ? (P[1] > P[2] ? 1 : 2) : a2 !== b2 ? (a2 > b2 ? 1 : 2) : leben(1) === leben(2) ? 0 : leben(1) > leben(2) ? 1 : 2, "zeit"); }
      runde = st.runde; }
    if (st.ende) return aus(st.arena.sieger || 0, "besiegt");
    const f = R.aktiv(st), tm = R.teamVon(st, f); if (!tm) return { fehler: 1 };
    const k = f.id + ":" + st.runde; if (wer !== k) { wer = k; merk = { lauf: 0 }; gelaufen = false; }
    jetzt += 1500; let w = null;
    if (spiel[tm] === "siegel" && !gelaufen && f.fid && st.zug && st.zug.bewegung > 0 && !amSiegel(f, S)) { gelaufen = true;
      let best = null; for (const [kk, kosten] of R.erreichbar(st, f, st.zug.bewegung)) { const [x, y] = kk.split(",").map(Number); if (x === f.x && y === f.y) continue; if (st.figuren.some((g) => g !== f && g.tp > 0 && g.x === x && g.y === y)) continue;
        const d = Math.max(Math.abs(x - S.x), Math.abs(y - S.y)), wert = (d <= 1 ? 0 : d) * 100 + kosten; if (!best || wert < best.wert) best = { x, y, wert, d }; }
      if (best && best.d < Math.max(Math.abs(f.x - S.x), Math.abs(f.y - S.y))) { w = { typ: "bewegen", x: best.x, y: best.y }; merk.lauf = 3; } }
    if (spiel[tm] === "siegel" && amSiegel(f, S)) merk.lauf = 3; // wer am Siegel steht, bleibt dort
    /* Spielweise „kontrolle“: ans Siegel nur, wenn dort die eigene Überzahl fehlt oder man von hier keinen Gegner am Siegel erreicht;
       Gegner am Siegel werden bevorzugt angegriffen und, wo möglich, weggestoßen; wer die Kontrolle hält, bleibt stehen. */
    const vorher = spiel[tm] === "kontrolle" ? gegnerAmSiegel(tm).length : 0;
    if (spiel[tm] === "kontrolle" && f.fid) {
      const feinde = gegnerAmSiegel(tm), eigene = steht(tm), erreicht = (id) => (R.verfuegbar(st, id) ? R.ziele(st, id).filter((z) => feinde.some((g) => g.id === z.id)) : []);
      const angriffe = R.aktionenVon(f, st).filter((a) => (a.typ || "aktion") === "aktion" && (a.schaden || a.art === "stoss"));
      if (!w && st.zug.aktion) { // wegstoßen, wenn der Gegner am Siegel nicht in der Unterzahl ist
        if (feinde.length && feinde.length >= eigene) for (const id of ["schildstoss", "donnerwelle"]) { const z = erreicht(id).sort((x, y) => x.tp - y.tp)[0]; if (z) { w = { typ: "aktion", aktion: id, ziel: z.id }; break; } } }
      if (!w && !gelaufen && st.zug.bewegung > 0 && !amSiegel(f, S)) { gelaufen = true;
        const kannVonHier = feinde.length && angriffe.some((a) => erreicht(a.id).length);
        if (eigene <= feinde.length || !kannVonHier) {
          let best = null; for (const [kk, kosten] of R.erreichbar(st, f, st.zug.bewegung)) { const [x, y] = kk.split(",").map(Number); if (x === f.x && y === f.y) continue; if (st.figuren.some((g) => g !== f && g.tp > 0 && g.x === x && g.y === y)) continue;
            const d = Math.max(Math.abs(x - S.x), Math.abs(y - S.y)), wert = (d <= 1 ? 0 : d) * 100 + kosten; if (!best || wert < best.wert) best = { x, y, wert, d }; }
          if (best && best.d < Math.max(Math.abs(f.x - S.x), Math.abs(f.y - S.y))) { w = { typ: "bewegen", x: best.x, y: best.y }; } }
        merk.lauf = 3; }
      if (amSiegel(f, S)) merk.lauf = 3;
      if (!w) { w = BOT.entscheide(st, merk); if (w.typ === "bewegen") merk.lauf++;
        if (w.typ === "aktion" && feinde.length && !feinde.some((g) => g.id === w.ziel)) { const ziel = st.figuren.find((g) => g.id === w.ziel); if (ziel && held(ziel) && R.teamVon(st, ziel) !== tm) { const z = erreicht(w.aktion).sort((x, y) => x.tp - y.tp)[0]; if (z) w = { typ: "aktion", aktion: w.aktion, ziel: z.id }; } } } }
    if (!w) { w = BOT.entscheide(st, merk); if (w.typ === "bewegen") merk.lauf++; }
    let r = K.zug(st, tm, w, jetzt); if (!r.fehler && spiel[tm] === "kontrolle" && w.typ === "aktion") { const d = vorher - gegnerAmSiegel(tm).length; if (d > 0) M.verdraengt += d; } if (r.fehler) r = K.zug(st, tm, { typ: "ende" }, jetzt); if (r.fehler) return { fehler: 1 };
  }
  return { fehler: 1 };
}
if (TEILE.includes("G")) {
  const o = { einstieg: true, heilung: true }, PL = Object.values(PLAENE).filter((p) => p !== "LSS"), schnitt = (e, g) => g.reduce((a, f) => a + e.stufen[f], 0) / g.length;
  const angleichen = (ea, ga, eb, gb) => { const sa = schnitt(ea, ga), sb = schnitt(eb, gb); if (Math.abs(sa - sb) <= 1) return; const [es, gs, ziel] = sa < sb ? [ea, ga, sb - 1] : [eb, gb, sa - 1]; let n = 0; while (schnitt(es, gs) < ziel - 1e-9 && n++ < 40) es.stufen[gs.slice().sort((x, y) => es.stufen[x] - es.stufen[y])[0]]++; };
  const lauf = (name, fn) => { zs = 4711; let n = 0, schwach = 0, mitU = 0, rd = 0, erste = 0, ersteN = 0, zur = 0, mehrfach = 0, grund = { siegel: 0, besiegt: 0, zeit: 0 }, extra = 0, extraN = 0;
    for (let i = 0; i < N; i++) { const x = fn(i); if (!x || x.r.fehler) continue; const r = x.r; n++; rd += r.runden; grund[r.grund]++; if (r.M.erste != null) { erste += r.M.erste; ersteN++; } zur += r.M.zurueck; if (r.M.wechsel >= 2) mehrfach++;
      if (x.schwach) { mitU++; if (r.sieger === x.schwach) schwach++; else if (!r.sieger) schwach += 0.5; }
      if (x.seiteA) { extraN++; if (r.sieger === x.seiteA) extra++; else if (!r.sieger) extra += 0.5; } }
    console.log(`\n${name} (${n} Finals)\n  ${extraN ? `Die erstgenannte Seite gewinnt ${pct(extra, extraN)} · ` : ""}${mitU ? `die Gruppe mit weniger Stufen gewinnt ${pct(schwach, mitU)} (${mitU} mit Unterschied) · ` : ""}Dauer Ø ${(rd / n).toFixed(1)} Runden\n  Ende durch: drei Siegelpunkte ${pct(grund.siegel, n)} · Gegner besiegt ${pct(grund.besiegt, n)} · Zeit nach acht Runden ${pct(grund.zeit, n)}\n  Erste Siegelkontrolle in Runde Ø ${ersteN ? (erste / ersteN).toFixed(1) : "–"} · Rückeroberungen je Final Ø ${(zur / n).toFixed(2)} · das Siegel wechselt mindestens zweimal: ${pct(mehrfach, n)}`); };
  const partie = (i, pa, pb, opt) => { const ga = zieh(3), gb = zieh(3), ea = weg(pa, 20000 + i, ga, o), eb = weg(pb, 40000 + i, gb, o), sa0 = schnitt(ea, ga), sb0 = schnitt(eb, gb); angleichen(ea, ga, eb, gb);
    const seite = i % 2, op = opt(seite), r = seite ? finale(eb, gb, ea, ga, 60000 + i, KARTEN[i % 7], op) : finale(ea, ga, eb, gb, 60000 + i, KARTEN[i % 7], op);
    return { r, seiteA: seite ? 2 : 1, schwach: Math.abs(sa0 - sb0) >= 0.5 ? ((sa0 < sb0) === !seite ? 1 : 2) : 0 }; };
  const zufall = (i) => [PL[Math.floor(zf() * PL.length)], PL[Math.floor(zf() * PL.length)]];
  console.log(`\nTeil G – Finale mit Siegel, Regelstand D (sicherer Einstieg, volle Heilung, höchstens eine Stufe Abstand); ${N} Finals je Block`);
  lauf("1 · Beide spielen aufs Siegel", (i) => { const [pa, pb] = zufall(i); const x = partie(i, pa, pb, () => ({})); x.seiteA = 0; return x; });
  lauf("2 · Beide spielen ein gewöhnliches Duell (nur die Wertung zählt das Siegel)", (i) => { const [pa, pb] = zufall(i); const x = partie(i, pa, pb, () => ({ spiel: { 1: "duell", 2: "duell" } })); x.seiteA = 0; return x; });
  lauf("3 · Siegelspieler gegen Duellspieler (gleiche Wegepläne)", (i) => { const [pa] = zufall(i); const x = partie(i, pa, pa, (s) => ({ spiel: s ? { 1: "duell", 2: "siegel" } : { 1: "siegel", 2: "duell" } })); x.schwach = 0; return x; });
  lauf("4 · Schleichweg ohne Siegelpunkt gegen „erst leicht, dann schwer“", (i) => { const x = partie(i, "LSS", "LLSS", () => ({})); x.schwach = 0; return x; });
  lauf("5 · Schleichweg mit einem Siegelpunkt Vorsprung gegen „erst leicht, dann schwer“", (i) => { const x = partie(i, "LSS", "LLSS", (s) => ({ vorsprung: s ? { 2: 1 } : { 1: 1 } })); x.schwach = 0; return x; });
  lauf("6 · Schleichweg ohne Siegelpunkt gegen „nur leicht“", (i) => { const x = partie(i, "LSS", "LLLL", () => ({})); x.schwach = 0; return x; });
  lauf("7 · Schleichweg mit einem Siegelpunkt Vorsprung gegen „nur leicht“", (i) => { const x = partie(i, "LSS", "LLLL", (s) => ({ vorsprung: s ? { 2: 1 } : { 1: 1 } })); x.schwach = 0; return x; });
}

/* ---------- Teil H: Regeländerungen am Finale einzeln und kombiniert, mit alter und neuer Spielweise ---------- */
if (TEILE.includes("H")) {
  const o = { einstieg: true, heilung: true }, PL = Object.values(PLAENE).filter((p) => p !== "LSS"), schnitt = (e, g) => g.reduce((a, f) => a + e.stufen[f], 0) / g.length;
  const angleichen = (ea, ga, eb, gb) => { const sa = schnitt(ea, ga), sb = schnitt(eb, gb); if (Math.abs(sa - sb) <= 1) return; const [es, gs, ziel] = sa < sb ? [ea, ga, sb - 1] : [eb, gb, sa - 1]; let n = 0; while (schnitt(es, gs) < ziel - 1e-9 && n++ < 40) es.stufen[gs.slice().sort((x, y) => es.stufen[x] - es.stufen[y])[0]]++; };
  const REGELN = [["A bisher", {}], ["B ab Runde 2", { ab: 2 }], ["C fünf Punkte, zehn Runden", { ziel: 5, max: 10 }], ["D nur alleinige Kontrolle", { allein: true }], ["B+D", { ab: 2, allein: true }], ["C+D", { ziel: 5, max: 10, allein: true }], ["B+C+D", { ab: 2, ziel: 5, max: 10, allein: true }]];
  const BLOECKE = []; for (const ki of ["siegel", "kontrolle"]) for (const [name, regel] of REGELN) BLOECKE.push({ ki, name, regel });
  const nur = (process.argv.find((a) => a.startsWith("--bloecke=")) || "").split("=")[1], wahl = nur ? nur.split(",").map(Number) : BLOECKE.map((_, i) => i + 1);
  for (const nr of wahl) { const B = BLOECKE[nr - 1]; zs = 4711; let n = 0, schwach = 0, mitU = 0, rd = 0, wechsel = 0, verdr = 0, zur = 0, serie = 0, beide = 0, grund = { siegel: 0, besiegt: 0, zeit: 0 };
    for (let i = 0; i < N; i++) { const pa = PL[Math.floor(zf() * PL.length)], pb = PL[Math.floor(zf() * PL.length)], ga = zieh(3), gb = zieh(3), ea = weg(pa, 20000 + i, ga, o), eb = weg(pb, 40000 + i, gb, o), sa0 = schnitt(ea, ga), sb0 = schnitt(eb, gb); if (!process.argv.includes("--ohne-angleichen")) angleichen(ea, ga, eb, gb);
      const seite = i % 2, op = { regel: B.regel, spiel: { 1: B.ki, 2: B.ki } }, r = seite ? finale(eb, gb, ea, ga, 60000 + i, KARTEN[i % 7], op) : finale(ea, ga, eb, gb, 60000 + i, KARTEN[i % 7], op);
      if (r.fehler) continue; n++; rd += r.runden; grund[r.grund]++; wechsel += r.M.wechsel; verdr += r.M.verdraengt; zur += r.M.zurueck; serie += r.M.laengste; if (r.M.hatte[1] && r.M.hatte[2]) beide++;
      if (Math.abs(sa0 - sb0) >= 0.5) { mitU++; const sw = (sa0 < sb0) === !seite ? 1 : 2; if (r.sieger === sw) schwach++; else if (!r.sieger) schwach += 0.5; } }
    console.log(`${String(nr).padStart(2)} | ${B.ki === "siegel" ? "alt" : "neu"} | ${B.name.padEnd(28)} | schwächere ${pct(schwach, mitU).padStart(5)} | Runden ${(rd / n).toFixed(1).padStart(4)} | Wechsel ${(wechsel / n).toFixed(2)} | verdrängt ${(verdr / n).toFixed(2)} | zurückerobert ${(zur / n).toFixed(2)} | längste Kontrolle ${(serie / n).toFixed(1)} | beide kontrollieren ${pct(beide, n).padStart(5)} | Ende: Siegel ${pct(grund.siegel, n)}, besiegt ${pct(grund.besiegt, n)}, Zeit ${pct(grund.zeit, n)} | n=${n}`); }
}

/* ---------- Teil K: drei Finale-Ideen einzeln gegen eine Kontrollgruppe (Wege wie Variante C, ohne Angleichen) ----------
 * rueckkehr: Wer fällt, steht zwei Runden später mit halben Trefferpunkten am eigenen Eingang wieder auf (nur solange die Gruppe nicht ganz am Boden ist).
 * nurFeld:   Den Punkt bekommt die Seite, deren Held auf dem Siegelfeld selbst steht.
 * wandert:   Alle zwei Runden springt das Siegel auf das nächste von drei Feldern. */
function finale2(e1, g1, e2, g2, seed, karte, V = {}) {
  let jetzt = 1000000; const t1 = g1.map((held) => ({ held, stufe: e1.stufen[held] })), t2 = g2.map((held) => ({ held, stufe: e2.stufen[held] }));
  const m = { staerke: 1, seed, modus: "duell", karte, begegnung: "kobolde", kampfstufe: Math.max(...t1.concat(t2).map((x) => x.stufe)), host_name: "A", guest_name: "B", bot: false, host_team: t1, guest_team: t2 };
  const st = K.start(m, 0, 0, jetzt).st, ZIEL = V.ziel || 3, MAX = V.max || 10, held = (f) => f.art !== "wolf" && (f.fid || f.fidA), helden = (tm) => st.figuren.filter((f) => held(f) && R.teamVon(st, f) === tm);
  for (const f of st.figuren) { const tm = R.teamVon(st, f), e = tm === 1 ? e1 : tm === 2 ? e2 : null, hid = f.fid || f.fidA; if (!e || !e.leben || e.leben[hid] == null || f.tpMax == null) continue; const a = Math.min(1, e.leben[hid]); f.tp = Math.max(1, Math.round(f.tpMax * (a + (1 - a) / 2))); }
  /* Beute ins Finale tragen: Gegenstände in den Rucksack des Helden; Segen gelten nur, während die eigene Seite am Zug ist; Wachtfeuer als drei Trefferpunkte mehr */
  const beute = { 1: e1, 2: e2 }, segenVon = (tm) => ((beute[tm] && beute[tm].segen) || []).filter((x) => x !== "wachtfeuer");
  for (const f of st.figuren) { const tm = R.teamVon(st, f), e = beute[tm], hid = f.fid || f.fidA; if (!e || !hid || f.art === "wolf" || f.art === "arenawolf") continue;
    for (const id of (e.dinge || {})[hid] || []) { f.rucksack = f.rucksack || []; if (!f.rucksack.some((d) => d.id === id)) f.rucksack.push({ id, n: 1 }); }
    if ((e.segen || []).includes("wachtfeuer")) { f.tp += 3; f.tpMax += 3; } }
  const frei = (x, y) => x >= 0 && y >= 0 && x < st.karte.b && y < st.karte.h && !st.karte.block.has(x + "," + y), naechstFrei = (zx, zy, ohneFiguren) => { let best = null; for (let x = 0; x < st.karte.b; x++) for (let y = 0; y < st.karte.h; y++) { if (!frei(x, y)) continue; if (ohneFiguren && st.figuren.some((g) => g.tp > 0 && g.x === x && g.y === y)) continue; const d = Math.hypot(x - zx, y - zy); if (!best || d < best.d) best = { x, y, d }; } return best; };
  const mitte = siegelFeld(st), ORTE = V.wandert ? [mitte, naechstFrei(mitte.x - 3, mitte.y), naechstFrei(mitte.x + 3, mitte.y)] : [mitte]; let S = ORTE[0], ort = 0;
  const eingang = {}; for (const tm of [1, 2]) helden(tm).forEach((f) => { eingang[f.id] = { x: f.x, y: f.y }; });
  const dist = (f) => Math.max(Math.abs(f.x - S.x), Math.abs(f.y - S.y)), inZone = (f) => (V.nurFeld ? dist(f) === 0 : dist(f) <= 1), lebt = (f) => f.tp > 0 && !f.tot;
  const steht = (tm) => helden(tm).filter((f) => lebt(f) && inZone(f)).length, lebende = (tm) => helden(tm).filter(lebt).length, leben = (tm) => helden(tm).reduce((a, f) => a + Math.max(0, f.tp), 0);
  const P = { 1: (V.start || {})[1] || 0, 2: (V.start || {})[2] || 0 }, folge = { 1: 0, 2: 0 }, gefallenIn = {}, warZurueck = {};
  const M = { wechsel: 0, halter: 0, hatte: { 1: false, 2: false }, ueberzahl: 0, ueber: 0, rueck: 0, wiederGefallen: 0, ohne: { 1: 0, 2: 0 }, hinten: 0, zurueck: 0, erstVerlust: 0, spruenge: 0, sprungOhne: 0, vorSprung: null, aus: 0, ausVon: { 1: false, 2: false }, ausLetzter: false };
  const gesperrt = {};
  if (P[1] !== P[2]) M.hinten = P[1] < P[2] ? 1 : 2;
  if (V.vorn) for (const f of helden(V.vorn)) { const p = naechstFrei(S.x, S.y, true); if (p) { f.x = p.x; f.y = p.y; } } // wer zuerst ankommt, steht schon am Siegel
  const aus = (sieger, grund) => { const lag = sieger && (M.hinten === sieger); return { sieger, grund, runden: Math.min(st.runde, MAX), M, aufgeholt: Boolean(lag), punkte: Math.max(P[1], P[2]),
    rueckAmSiegel: Boolean(sieger && helden(sieger).some((f) => warZurueck[f.id] && lebt(f) && inZone(f))), erstVerlustSiegt: M.erstVerlust ? M.erstVerlust === sieger : null }; };
  let runde = st.runde, merk = { lauf: 0 }, wer = null, gelaufen = false;
  const merkeGefallene = () => { for (const tm of [1, 2]) for (const f of helden(tm)) { if (!lebt(f) && gefallenIn[f.id] == null) { gefallenIn[f.id] = st.runde; if (!M.erstVerlust) M.erstVerlust = tm; if (warZurueck[f.id]) M.wiederGefallen++; } } };
  for (let i = 0; i < 9000; i++) {
    if (st.runde !== runde) {
      const a = steht(1), b = steht(2), h = a > b ? 1 : b > a ? 2 : 0;
      if (M.vorSprung != null) { M.spruenge++; if (h === M.vorSprung.halter) M.sprungOhne++; M.vorSprung = null; }
      for (const tm of [1, 2]) if (h !== tm) M.ohne[tm]++;
      if (h) { const an = 3 - h; M.hatte[h] = true; if (M.halter && M.halter !== h) M.wechsel++; M.halter = h;
        if (P[h] < P[an]) { folge[h]++; if (folge[h] >= 2) { P[an]--; folge[h] = 0; M.zurueck++; } } else folge[h] = 0; folge[an] = 0; P[h]++; }
      if (P[1] !== P[2] && !M.hinten) M.hinten = P[1] < P[2] ? 1 : 2; // wer als Erster in Rückstand gerät
      const u = Math.sign(lebende(1) - lebende(2)); if (u && M.ueber && u !== M.ueber) M.ueberzahl++; if (u) M.ueber = u;
      if (h && P[h] >= ZIEL) return aus(h, "siegel");
      if (runde >= MAX) { const a2 = steht(1), b2 = steht(2); return aus(P[1] !== P[2] ? (P[1] > P[2] ? 1 : 2) : a2 !== b2 ? (a2 > b2 ? 1 : 2) : leben(1) === leben(2) ? 0 : leben(1) > leben(2) ? 1 : 2, "zeit"); }
      runde = st.runde;
      if (V.wandert && (runde - 1) % 2 === 0 && runde > 1) { ort = (ort + 1) % ORTE.length; S = ORTE[ort]; M.vorSprung = { halter: M.halter }; }
      if (V.rueckkehr && !st.ende) for (const tm of [1, 2]) for (const f of helden(tm)) { if (lebt(f) || gefallenIn[f.id] == null || runde - gefallenIn[f.id] < 2) continue;
        const p = naechstFrei(eingang[f.id].x, eingang[f.id].y, true); if (!p) continue; f.x = p.x; f.y = p.y; f.tp = Math.ceil(f.tpMax / 2); f.tot = false; f.z = {}; delete gefallenIn[f.id]; warZurueck[f.id] = true; M.rueck++; }
    }
    if (st.ende) { const weg1 = lebende(1) === 0, weg2 = lebende(2) === 0;
      if (!V.keinAus || (!weg1 && !weg2) || (weg1 && weg2)) return aus(st.arena.sieger || 0, "besiegt");
      /* Auslöschen beendet das Finale nicht: ein Siegelpunkt für den Gegner, die Gruppe steht am eigenen Eingang wieder auf und handelt ab der nächsten Runde */
      const t = weg1 ? 1 : 2, g = 3 - t; P[g]++; M.aus++; M.ausVon[t] = true; if (!M.hinten && P[1] !== P[2]) M.hinten = P[1] < P[2] ? 1 : 2;
      if (P[g] >= ZIEL) { M.ausLetzter = true; return aus(g, "siegel"); }
      for (const f of helden(t)) { const p = naechstFrei(eingang[f.id].x, eingang[f.id].y, true); if (p) { f.x = p.x; f.y = p.y; } f.tp = Math.ceil(f.tpMax / 2); f.tot = false; f.z = {}; delete gefallenIn[f.id]; warZurueck[f.id] = true; gesperrt[f.id] = st.runde; M.rueck++; }
      st.ende = null; st.arena.sieger = null; st.arena.grund = null; }
    const f = R.aktiv(st), tm = R.teamVon(st, f); if (!tm) return { fehler: 1 };
    const k = f.id + ":" + st.runde; if (wer !== k) { wer = k; merk = { lauf: 0 }; gelaufen = false; }
    jetzt += 1500; let w = null;
    if (gesperrt[f.id] === st.runde) w = { typ: "ende" };
    if (!w && held(f) && lebt(f)) {
      const feinde = helden(3 - tm).filter((g) => lebt(g) && dist(g) <= 1).sort((x, y) => dist(x) - dist(y) || x.tp - y.tp), wertend = helden(3 - tm).filter((g) => lebt(g) && inZone(g)).length, eigene = steht(tm);
      const erreicht = (id) => (R.verfuegbar(st, id) ? R.ziele(st, id).filter((z) => feinde.some((g) => g.id === z.id)) : []), vorrang = (l) => l.sort((x, y) => { const gx = feinde.find((g) => g.id === x.id), gy = feinde.find((g) => g.id === y.id); return dist(gx) - dist(gy) || x.tp - y.tp; })[0];
      const angriffe = R.aktionenVon(f, st).filter((a) => (a.typ || "aktion") === "aktion" && (a.schaden || a.art === "stoss"));
      if (st.zug.aktion && wertend && wertend >= eigene) for (const id of ["schildstoss", "donnerwelle"]) { const z = vorrang(erreicht(id)); if (z) { w = { typ: "aktion", aktion: id, ziel: z.id }; break; } }
      if (!w && !gelaufen && st.zug.bewegung > 0 && !inZone(f)) { gelaufen = true;
        const kannVonHier = feinde.length && angriffe.some((a) => erreicht(a.id).length);
        if (eigene <= wertend || !kannVonHier) { let best = null;
          for (const [kk, kosten] of R.erreichbar(st, f, st.zug.bewegung)) { const [x, y] = kk.split(",").map(Number); if (x === f.x && y === f.y) continue; if (st.figuren.some((g) => g !== f && g.tp > 0 && g.x === x && g.y === y)) continue;
            const d = Math.max(Math.abs(x - S.x), Math.abs(y - S.y)), wert = (V.nurFeld ? d : d <= 1 ? 0 : d) * 100 + kosten; if (!best || wert < best.wert) best = { x, y, wert, d }; }
          if (best && (V.nurFeld ? best.d < dist(f) : best.d < dist(f))) w = { typ: "bewegen", x: best.x, y: best.y }; }
        merk.lauf = 3; }
      if (inZone(f)) merk.lauf = 3;
      if (!w) { w = BOT.entscheide(st, merk); if (w.typ === "bewegen") merk.lauf++;
        if (w.typ === "aktion" && feinde.length && !feinde.some((g) => g.id === w.ziel)) { const ziel = st.figuren.find((g) => g.id === w.ziel); if (ziel && held(ziel) && R.teamVon(st, ziel) !== tm) { const z = vorrang(erreicht(w.aktion)); if (z) w = { typ: "aktion", aktion: w.aktion, ziel: z.id }; } } } }
    if (!w) { w = BOT.entscheide(st, merk); if (w.typ === "bewegen") merk.lauf++; }
    st.segen = segenVon(tm);
    let r = K.zug(st, tm, w, jetzt); if (r.fehler) r = K.zug(st, tm, { typ: "ende" }, jetzt); if (r.fehler) return { fehler: 1 };
    merkeGefallene();
  }
  return { fehler: 1 };
}
if (TEILE.includes("K")) {
  const o = { einstieg: true, heilung: true }, PL = Object.values(PLAENE).filter((p) => p !== "LSS"), schnitt = (e, g) => g.reduce((a, f) => a + e.stufen[f], 0) / g.length;
  const TESTS = { A: ["A Kontrollgruppe", {}], B: ["B Gefallene kehren zurück", { rueckkehr: true }], C: ["C nur das Siegelfeld zählt", { nurFeld: true }], D: ["D das Siegel wandert", { wandert: true }],
    E: ["E Rückkehr, fünf Punkte, zwölf Runden", { rueckkehr: true, ziel: 5, max: 12 }], F: ["F Rückkehr und wanderndes Siegel", { rueckkehr: true, wandert: true }], G: ["G Rückkehr, wanderndes Siegel, fünf Punkte, zwölf Runden", { rueckkehr: true, wandert: true, ziel: 5, max: 12 }],
    E2: ["E2 wie E, Auslöschen beendet das Finale nicht", { rueckkehr: true, ziel: 5, max: 12, keinAus: true }], G2: ["G2 wie G, Auslöschen beendet das Finale nicht", { rueckkehr: true, wandert: true, ziel: 5, max: 12, keinAus: true }] };
  const wahl = ((process.argv.find((a) => a.startsWith("--test=")) || "--test=A,B,C,D").split("=")[1]).split(",");
  for (const t of wahl) { const [name, V] = TESTS[t]; zs = 4711; let n = 0, schwach = 0, mitU = 0, rd = 0, wechsel = 0, mehrfach = 0, beide = 0, ueber = 0, rueck = 0, wieder = 0, ohne = 0, aufgeholt = 0, zur = 0, fehler = 0, mitRueck = 0, rueckSieg = 0, siege = 0, evS = 0, evN = 0, spr = 0, sprOhne = 0, voll = 0, pkt = 0, ausN = 0, ausFinals = 0, nachAus = 0, nachAusN = 0, ausLetzter = 0, grund = { siegel: 0, besiegt: 0, zeit: 0 };
    for (let i = 0; i < N; i++) { const pa = PL[Math.floor(zf() * PL.length)], pb = PL[Math.floor(zf() * PL.length)], ga = zieh(3), gb = zieh(3), ea = weg(pa, 20000 + i, ga, o), eb = weg(pb, 40000 + i, gb, o), sa0 = schnitt(ea, ga), sb0 = schnitt(eb, gb);
      const seite = i % 2, r = seite ? finale2(eb, gb, ea, ga, 60000 + i, KARTEN[i % 7], V) : finale2(ea, ga, eb, gb, 60000 + i, KARTEN[i % 7], V);
      if (r.fehler) { fehler++; continue; } n++; rd += r.runden; grund[r.grund]++; wechsel += r.M.wechsel; if (r.M.wechsel >= 2) mehrfach++; if (r.M.hatte[1] && r.M.hatte[2]) beide++; ueber += r.M.ueberzahl; rueck += r.M.rueck; wieder += r.M.wiederGefallen; ohne += (r.M.ohne[1] + r.M.ohne[2]) / 2; if (r.aufgeholt) aufgeholt++; zur += r.M.zurueck; if (r.M.rueck) mitRueck++; if (r.sieger) { siege++; if (r.rueckAmSiegel) rueckSieg++; } if (r.erstVerlustSiegt != null && r.sieger) { evN++; if (r.erstVerlustSiegt) evS++; } spr += r.M.spruenge; sprOhne += r.M.sprungOhne; pkt += r.punkte; if (r.grund === "siegel") voll++; ausN += r.M.aus; if (r.M.aus) ausFinals++; if (r.M.ausLetzter) ausLetzter++; for (const t of [1, 2]) if (r.M.ausVon[t]) { nachAusN++; if (r.sieger === t) nachAus++; }
      if (Math.abs(sa0 - sb0) >= 0.5) { mitU++; const sw = (sa0 < sb0) === !seite ? 1 : 2; if (r.sieger === sw) schwach++; else if (!r.sieger) schwach += 0.5; } }
    console.log(`\n${name} (${n} Finals${fehler ? `, ${fehler} Abbrüche` : ""})\n  Schwächere Gruppe gewinnt ${pct(schwach, mitU)} (${mitU} mit Unterschied) · Dauer Ø ${(rd / n).toFixed(1)} Runden\n  Ende: Siegelpunkte ${pct(grund.siegel, n)} · Gegner besiegt ${pct(grund.besiegt, n)} · Zeit ${pct(grund.zeit, n)}\n  Beide kontrollieren mindestens einmal: ${pct(beide, n)} · Siegelwechsel je Final Ø ${(wechsel / n).toFixed(2)} · mindestens zwei Wechsel: ${pct(mehrfach, n)}\n  Wechsel der zahlenmäßigen Überlegenheit je Final Ø ${(ueber / n).toFixed(2)} · Sieg nach erstem Punkterückstand: ${pct(aufgeholt, n)} · abgezogene Punkte (Zurückerobern) Ø ${(zur / n).toFixed(2)}\n  Runden ohne eigene Kontrolle je Gruppe Ø ${(ohne / n).toFixed(1)}${V.rueckkehr ? ` · Rückkehrer je Final Ø ${(rueck / n).toFixed(2)}, davon erneut gefallen Ø ${(wieder / n).toFixed(2)}` : ""}\n  Punkte des Führenden am Ende Ø ${(pkt / n).toFixed(1)} · Seite mit dem ersten Verlust gewinnt ${pct(evS, evN)}${V.rueckkehr ? ` · Finals mit Rückkehr ${pct(mitRueck, n)} · Siege, bei denen ein Rückkehrer des Siegers am Siegel stand: ${pct(rueckSieg, siege)}` : ""}${V.keinAus ? `\n  Gruppenauslöschungen je Final Ø ${(ausN / n).toFixed(2)} (= Siegelpunkte durch Auslöschen) · Finals mit Auslöschung ${pct(ausFinals, n)} · Sieg nach eigener Auslöschung ${pct(nachAus, nachAusN)} (${nachAusN} Fälle) · der entscheidende Punkt kam durch Auslöschen: ${pct(ausLetzter, n)}` : ""}${V.wandert ? ` · Siegelsprünge je Final Ø ${(spr / n).toFixed(1)}, davon ohne Wechsel der Kontrolle ${pct(sprOhne, spr)}` : ""}`); }
}

/* ---------- Teil R: der Riss – jede Seite nimmt zwei bis fünf Räume, wer früher abbiegt, steht zuerst am Siegel ----------
 * Räume in fester Folge: Einstieg (+1 Stufe, sicher), leicht (+1), leicht (+1), schwer (+2), schwer (+2). Beute ist nicht nachgebildet.
 * Die frühere Gruppe steht bei Finalbeginn am Siegel. Startpunkte: 0 = keine, 1 = einer je Etappe Vorsprung, 2 = einer je Etappe, höchstens zwei. Finale: G2. */
if (TEILE.includes("R")) {
  const BEUTE = (process.argv.find((x) => x.startsWith("--beute=")) || "").split("=")[1] || null, o = { einstieg: true, heilung: true, beute: BEUTE === "splitter" ? null : BEUTE }, FOLGE = (process.argv.find((x) => x.startsWith("--folge=")) || "--folge=LLLSS").split("=")[1], G2 = { rueckkehr: true, wandert: true, ziel: 5, max: 12, keinAus: true }, schnitt = (e, g) => g.reduce((a, f) => a + e.stufen[f], 0) / g.length;
  const alle = []; for (let a = 2; a <= 5; a++) for (let b = a; b <= 5; b++) alle.push([a, b]);
  const pw = (process.argv.find((x) => x.startsWith("--paare=")) || "").split("=")[1], paare = pw ? pw.split(",").map((x) => x.split("-").map(Number)) : alle;
  const punkteWahl = ((process.argv.find((x) => x.startsWith("--punkte=")) || "--punkte=0,1,2").split("=")[1]).split(",").map(Number);
  for (const [ka, kb] of paare) for (const pv of ka === kb ? [0] : punkteWahl) { zs = 4711; const vor = kb - ka, start = pv === 0 ? 0 : pv === 1 ? vor : Math.min(2, vor);
    let n = 0, frueh = 0, sa = 0, sb = 0, rd = 0, aufg = 0, pk = { siegel: 0, besiegt: 0, zeit: 0 }, ra = 0, rb = 0, wechsel = 0, la = 0, lb = 0, verg = 0, wirk = 0;
    const lebenS = (e, g) => (e.leben ? g.reduce((a, f) => a + Math.min(1, e.leben[f]), 0) / g.length : 1);
    for (let i = 0; i < N; i++) { const ga = zieh(3), gb = zieh(3), ea = weg(FOLGE.slice(0, ka), 20000 + i, ga, o), eb = weg(FOLGE.slice(0, kb), 40000 + i, gb, o), seite = i % 2, tA = seite ? 2 : 1;
      const V = Object.assign({}, G2, vor ? { start: { [tA]: start }, vorn: tA } : {}), r = seite ? finale2(eb, gb, ea, ga, 60000 + i, KARTEN[i % 7], V) : finale2(ea, ga, eb, gb, 60000 + i, KARTEN[i % 7], V);
      if (r.fehler) continue; n++; sa += schnitt(ea, ga); sb += schnitt(eb, gb); rd += r.runden; pk[r.grund]++; ra += ea.runden; rb += eb.runden; wechsel += r.M.wechsel; if (r.aufgeholt) aufg++;
      la += lebenS(ea, ga); lb += lebenS(eb, gb); verg += ea.B.vergeben + eb.B.vergeben; wirk += ea.B.wirksam + eb.B.wirksam;
      if (r.sieger === tA) frueh++; else if (!r.sieger) frueh += 0.5; }
    console.log(`R|${ka}|${kb}|${pv}|${start}|${n}|${(100 * frueh / n).toFixed(1)}|${(sa / n).toFixed(2)}|${(sb / n).toFixed(2)}|${(rd / n).toFixed(1)}|${(100 * aufg / n).toFixed(0)}|${(100 * pk.siegel / n).toFixed(0)}|${(100 * pk.zeit / n).toFixed(0)}|${(ra / n).toFixed(1)}|${(rb / n).toFixed(1)}|${(wechsel / n).toFixed(2)}|${(100 * la / n).toFixed(0)}|${(100 * lb / n).toFixed(0)}|${(verg / n).toFixed(2)}|${verg ? (100 * wirk / verg).toFixed(0) : "-"}`); }
}

/* ---------- Teil S: Streuung der Endstufe je Raumzahl (flache oder steile Kurve über --folge) ---------- */
if (TEILE.includes("S")) {
  const o = { einstieg: true, heilung: true }, FOLGE = (process.argv.find((x) => x.startsWith("--folge=")) || "--folge=LLLLL").split("=")[1];
  console.log(`\nTeil S – Endstufe je Raumzahl, Folge ${FOLGE} nach dem Einstieg (${N} Gruppen je Zeile)`);
  for (let k = 2; k <= 5; k++) { zs = 4711; const l = [], rd = []; for (let i = 0; i < N; i++) { const e = weg(FOLGE.slice(0, k), 20000 + i, zieh(3), o); l.push(e.stufe); rd.push(e.runden); } l.sort((a, b) => a - b);
    const q = (p) => l[Math.floor(p * (l.length - 1))].toFixed(1), voll = k + 1;
    console.log(`  ${k} Räume: Ø ${(l.reduce((a, b) => a + b, 0) / N).toFixed(2)} · Median ${q(0.5)} · untere 10 % bis ${q(0.1)} · obere 10 % ab ${q(0.9)} · volle Stufe ${voll} erreicht: ${pct(l.filter((x) => x >= voll - 0.01).length, N)} · mindestens eine Stufe verpasst: ${pct(l.filter((x) => x <= voll - 1).length, N)} · Runden Ø ${(rd.reduce((a, b) => a + b, 0) / N).toFixed(1)}`); }
}

/* ---------- Teil T: Splitter – eine Seite stört den fünften Raum der anderen (beide nehmen fünf Räume) ---------- */
if (TEILE.includes("T")) {
  const G2 = { rueckkehr: true, wandert: true, ziel: 5, max: 12, keinAus: true }, FOLGE = "LLLLL";
  for (const mit of [false, true]) { zs = 4711; let n = 0, sA = 0, raumSieg = 0, raumRd = 0, raumTp = 0, lb = 0, rd = 0, stB = 0, gest = 0;
    for (let i = 0; i < N; i++) { const ga = zieh(3), gb = zieh(3), ea = weg(FOLGE, 20000 + i, ga, { einstieg: true, heilung: true, beute: "splitter" }), hat = mit && ea.B.splitter > 0 && ea.B.tief[0] && ea.B.tief[0].sieg; // der Splitter aus Raum vier trifft Raum fünf
      const eb = weg(FOLGE, 40000 + i, gb, { einstieg: true, heilung: true, stoerung: hat ? [4] : [] }), seite = i % 2, r = seite ? finale2(eb, gb, ea, ga, 60000 + i, KARTEN[i % 7], G2) : finale2(ea, ga, eb, gb, 60000 + i, KARTEN[i % 7], G2);
      if (r.fehler) continue; n++; if (hat) gest++; const t5 = eb.B.tief[1]; if (t5) { if (t5.sieg) raumSieg++; raumRd += t5.runden; raumTp += t5.tp; }
      lb += eb.leben ? gb.reduce((a, f) => a + Math.min(1, eb.leben[f]), 0) / 3 : 1; stB += gb.reduce((a, f) => a + eb.stufen[f], 0) / 3; rd += r.runden; if (r.sieger === (seite ? 2 : 1)) sA++; else if (!r.sieger) sA += 0.5; }
    console.log(`T|${mit ? "mit Splitter" : "ohne"}|n=${n}|gestört ${pct(gest, n)}|Seite mit Splitter gewinnt ${(100 * sA / n).toFixed(1)} %|Gegner: Raum 5 gewonnen ${pct(raumSieg, n)}, Runden ${(raumRd / n).toFixed(1)}, Leben nach Raum 5 ${pct(raumTp, n)}, Endstufe ${(stB / n).toFixed(2)}, Leben vor dem Finale ${pct(lb, n)}|Finale ${(rd / n).toFixed(1)} Runden`); }
}
