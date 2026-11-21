/*
 * Mythara Echtzeit – Prüfung: Gehraster der offenen Welt (Chunks, Kollision, Wegsuche).
 * Die Wegsuche muss sich wie die bestehende in shared/karte.ts verhalten – das wird am Waldweg verglichen.
 * Aufruf (im Ordner realtime): node test/welt-raster.test.mjs
 */
import { gemeinsam, bibliothek, region } from "../werkzeug/welt/laden.mjs";
import { readFileSync } from "node:fs";
let ok = true; const check = (b, t) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) ok = false; };
const G = await gemeinsam(), bib = bibliothek();
const laenge = (start, w) => { let s = 0, p = start; for (const q of w) { s += Math.hypot(q.x - p.x, q.y - p.y); p = q; } return s; };

/* ---------- Beispielregion ---------- */
const bau = G.chunksBauen(region("beispiel"), bib.gelaende, bib.objekte), R = new G.WeltRaster(); for (const c of bau.chunks) R.dazu(c);
check(R.anzahl === 4 && R.hat(1, 1) && !R.hat(2, 0), "vier Chunks eingesetzt");
check(R.begehbar(30.5, 32.5) && !R.begehbar(46.5, 18.5) && R.fels(46, 18) && !R.dicht(46.5, 18.5), "Platz ist frei; der Teich versperrt den Weg, aber nicht die Sicht");
check(R.fels(-1, 10) && R.fels(64, 10) && R.fels(10, 64) && !R.begehbar(70, 70), "außerhalb der geladenen Chunks ist alles gesperrt");
{ const start = { x: 2.5, y: 32.5 }, ziel = { x: 61.5, y: 30.5 }, w = R.weg(start, ziel);
  check(w.length > 0 && Math.hypot(w[w.length - 1].x - ziel.x, w[w.length - 1].y - ziel.y) < 0.01, `Weg quer durch die Region über die Chunkgrenze (${w.length} Wegpunkte, ${laenge(start, w).toFixed(1)} Felder)`);
  let frei = true, p = start; for (const q of w) { if (!R.frei(p, q, 0.3)) frei = false; p = q; } check(frei, "jedes Teilstück des Wegs ist frei"); }
{ const w = R.weg({ x: 46.5, y: 10.5 }, { x: 46.5, y: 26.5 }), l = laenge({ x: 46.5, y: 10.5 }, w);
  check(w.length > 1 && l > 17 && l < 30, `um den Teich herum statt hindurch (${l.toFixed(1)} Felder statt 16 Luftlinie)`); }
{ const p = R.naechstFrei({ x: 46.5, y: 18.5 }); check(p && R.begehbar(p.x, p.y) && Math.hypot(p.x - 46.5, p.y - 18.5) < 7, "ein Klick in den Teich führt ans nächste Ufer");
  check(R.naechstFrei({ x: 500, y: 500 }) === null, "weit außerhalb der Welt gibt es kein freies Feld (kein Absturz, kein endloses Suchen)");
  check(R.weg({ x: 2.5, y: 32.5 }, { x: 500, y: 500 }).length === 0, "… und keinen Weg dorthin"); }
{ let ufer = 0; while (R.begehbar(46.2, ufer + 0.5)) ufer++; /* erste Wasserzeile unter dem Nordufer */
  const e = { x: 46.2, y: ufer - 0.05, r: 0.3 }; R.schieben(e); check(R.begehbar(e.x, e.y) && Math.abs(e.y - (ufer - 0.3)) < 1e-6, "wer ans Wasser läuft, bleibt mit seinem Rand am Ufer stehen");
  const f = { x: 0.1, y: 32.5, r: 0.3 }; R.schieben(f); check(Math.abs(f.x - 0.3) < 1e-6, "am Rand der Welt geht es nicht weiter"); }
{ R.weg_damit(1, 0); check(!R.hat(1, 0) && R.fels(40, 10) && R.begehbar(30.5, 32.5), "ein entladener Chunk ist gesperrt, der Rest bleibt"); R.dazu(bau.chunks.find((c) => c.cx === 1 && c.cy === 0)); }
{ const S = new G.WeltRaster(); S.dazu({ cx: -1, cy: -2, geh: Array.from({ length: 32 }, () => ".".repeat(32)) });
  check(S.begehbar(-0.5, -33.5) && S.begehbar(-31.5, -63.5) && !S.begehbar(0.5, -40) && S.weg({ x: -30, y: -60 }, { x: -2, y: -34 }).length === 1, "Chunks mit negativer Lage funktionieren"); }

/* ---------- Vergleich mit der bestehenden Wegsuche am Waldweg (80 × 36 Rechenfelder) ---------- */
{ const wald = readFileSync(new URL("../shared/waldweg.ts", import.meta.url), "utf8").match(/WALDWEG_ZEILEN: string\[\] = (\[[^\]]*\])/), zeilen = JSON.parse(wald[1]);
  const K = G.karte; K.setzeKarte({ zeilen, feinZeilen: true, start: [[0, 9]], lager: [] }, 2);
  const W = new G.WeltRaster(); /* dieselbe Karte als Chunks: 3 × 2, mit Fels aufgefüllt */
  for (let cy = 0; cy < 2; cy++) for (let cx = 0; cx < 3; cx++) W.dazu({ cx, cy, geh: Array.from({ length: 32 }, (_, j) => Array.from({ length: 32 }, (_, i) => { const z = zeilen[cy * 32 + j]; const c = z ? z[cx * 32 + i] : undefined; return c === "." ? "." : "#"; }).join("")) });
  let gleichFeld = true; for (let j = 0; j < 36; j++) for (let i = 0; i < 80; i++) if (K.fels(i, j) !== W.fels(i, j)) gleichFeld = false;
  check(gleichFeld, "Waldweg als Chunks: jedes Feld gleich wie in der bestehenden Karte");
  const frei = []; for (let j = 0; j < 36; j++) for (let i = 0; i < 80; i++) if (!K.fels(i, j)) frei.push({ x: i + 0.5, y: j + 0.5 });
  let s = 11; const wurf = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
  let paare = 0, gleich = 0, gefunden = 0, schlimmste = 0, zeitAlt = 0, zeitNeu = 0;
  for (let n = 0; n < 300; n++) { const a = frei[Math.floor(wurf() * frei.length)], b = frei[Math.floor(wurf() * frei.length)];
    let t = performance.now(); const alt = K.weg(a, b); zeitAlt += performance.now() - t; t = performance.now(); const neu = W.weg(a, b, 0.3, 40); zeitNeu += performance.now() - t;
    paare++; if (alt.length > 0) gefunden++; if ((alt.length > 0) !== (neu.length > 0)) continue;
    const la = laenge(a, alt), ln = laenge(a, neu); schlimmste = Math.max(schlimmste, Math.abs(la - ln)); if (Math.abs(la - ln) < 1) gleich++; }
  check(gleich === paare, `300 zufällige Strecken: gleich lang wie mit der bestehenden Wegsuche (${gleich} von ${paare}, größte Abweichung ${schlimmste.toFixed(2)} Felder, ${gefunden} mit Weg)`);
  console.log(`    Zeit für 300 Wegsuchen: bestehend ${zeitAlt.toFixed(0)} ms, Welt-Raster ${zeitNeu.toFixed(0)} ms`);
  { const a = { x: 3.3, y: 19.4, r: 0.3 }, b = { ...a }; for (const [dx, dy] of [[0.4, -0.5], [-0.2, 0.9], [0.7, 0.7], [0, -1.3]]) { a.x += dx; a.y += dy; b.x += dx; b.y += dy; K.schieben(a); W.schieben(b); }
    check(Math.abs(a.x - b.x) < 1e-9 && Math.abs(a.y - b.y) < 1e-9, "Schieben aus dem Fels: dasselbe Ergebnis wie bisher"); }
}

/* ---------- Große Welt: Suchgrenze ---------- */
{ const L = new G.WeltRaster(), offen = Array.from({ length: 32 }, () => ".".repeat(32)); for (let cy = 0; cy < 8; cy++) for (let cx = 0; cx < 8; cx++) L.dazu({ cx, cy, geh: offen });
  /* eine Mauer quer durch die Welt mit einem Tor ganz am Rand */
  for (let cx = 0; cx < 8; cx++) L.dazu({ cx, cy: 4, geh: offen.map((z, j) => (j === 0 ? (cx === 7 ? "#".repeat(31) + "." : "#".repeat(32)) : z)) });
  let t = performance.now(); const nah = L.weg({ x: 10.5, y: 10.5 }, { x: 40.5, y: 50.5 }); const tNah = performance.now() - t;
  L.suchGrenze = 200000; t = performance.now(); const weit = L.weg({ x: 100.5, y: 120.5 }, { x: 100.5, y: 135.5 }, 0.3, 200); const tWeit = performance.now() - t; L.suchGrenze = 6000;
  t = performance.now(); const keiner = L.weg({ x: 10.5, y: 120.5 }, { x: 10.5, y: 135.5 }); const tKein = performance.now() - t;
  check(nah.length === 1 && tNah < 20, `256 × 256 Felder: freie Strecke sofort (${tNah.toFixed(1)} ms)`);
  check(weit.length > 1 && laenge({ x: 100.5, y: 120.5 }, weit) > 290, `Umweg durch das Tor am Rand wird gefunden, wenn Suchfenster und Suchgrenze weit genug sind (${laenge({ x: 100.5, y: 120.5 }, weit).toFixed(0)} Felder, ${tWeit.toFixed(0)} ms)`);
  check(keiner.length === 0 && tKein < 60, `mit dem üblichen Suchfenster gilt die Mauer als unüberwindbar – die Suche gibt schnell auf (${tKein.toFixed(1)} ms)`); }

console.log(ok ? "\nWelt-Raster: alles in Ordnung" : "\nWelt-Raster: FEHLER"); process.exit(ok ? 0 : 1);
