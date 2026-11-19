/*
 * Rissgefecht – Echtzeit-Versuch (Konzeptentwurf 0.1): 3 gegen 3, jeder steuert einen Helden.
 * Diese Fassung: ein Spieler, die anderen fünf Helden steuert der Rechner. Kein Server, nichts wird gespeichert oder verschickt.
 * Zehn Runden in zwei Halbzeiten, Rundenziel Siegelkontrolle, Erfahrung und Erbsplitter innerhalb einer Halbzeit, Seitenwechsel mit vollem Neustart.
 * Schalter in der Adresse: auto=1 (auch der eigene Held wird vom Rechner gespielt), tempo=<n> (n Rechenschritte je Bild), seed=<n>, held=<kennung>.
 */
(() => {
  "use strict";
  const P = new URLSearchParams(location.search), AUTO = P.get("auto") === "1", TEMPO = Math.max(1, Math.min(60, +P.get("tempo") || 1));
  const $ = (s) => document.querySelector(s), esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const W = 1600, H = 1000, DT = 1 / 60, R_HELD = 22;
  const HANDY = P.get("handy") === "1" || (P.get("handy") !== "0" && window.matchMedia && window.matchMedia("(pointer: coarse)").matches), SICHT_H = 620; // am Handy folgt die Kamera dem Helden und zeigt so viel Welt in der Höhe
  if (HANDY) document.body.classList.add("handy");
  /* Alle Zahlen sind Startwerte für den Versuch, nichts davon ist abgestimmt. */
  const K = { RUNDE: 100, RUNDEN_JE: 5, KAUFZEIT: 25, HALTEN: 18, ZONE_R: 135, START_ES: 40, SIEG: 50, NIEDERLAGE: 35, SERIE: 5, SERIE_MAX: 15, WAECHTER_ES: 10,
    XP_STUFE: [0, 70, 170, 300, 470], XP_RUNDE: 20, XP_SIEG: 10, XP_KILL: 25, XP_HILFE: 10, XP_WAECHTER: 25, XP_WAECHTER_HILFE: 10, LP_JE_STUFE: 0.12, SCHADEN_JE_STUFE: 0.10, WIEDER: 0.5,
    PREIS: { heilung: 70, trank: 15, offensiv: 40, schutz: 40 }, TRANK: 70, SEGEN: 0.2 };
  const HELDEN = {
    schildwaechter: { name: "Torvald", rolle: "Nahkämpfer, hält viel aus", bild: "img/figuren/schildwaechter.jpg", lp: 260, tempo: 205, nah: true, reich: 72, schaden: 26, takt: 0.7,
      q: { name: "Schildstoß", zeit: 8, text: "Stürmt ein Stück vor: Schaden und kurze Betäubung." }, e: { name: "Bollwerk", zeit: 12, text: "3 Sekunden lang 60 % weniger Schaden." } },
    elementarist: { name: "Vaelin", rolle: "Fernkämpfer, viel Schaden, wenig Leben", bild: "img/figuren/elementarist.jpg", lp: 150, tempo: 220, reich: 520, schaden: 22, takt: 0.6, flug: 720,
      q: { name: "Feuerball", zeit: 7, text: "Explodiert beim Aufprall und trifft alle im Umkreis." }, e: { name: "Blinzeln", zeit: 10, text: "Springt ein Stück in Zielrichtung." } },
    wanderheiler: { name: "Brogar", rolle: "Heiler, hält die Gruppe am Leben", bild: "img/figuren/wanderheiler.jpg", lp: 190, tempo: 215, reich: 440, schaden: 15, takt: 0.65, flug: 640,
      q: { name: "Heilwelle", zeit: 9, text: "Heilt dich und alle Verbündeten in der Nähe." }, e: { name: "Bannkreis", zeit: 11, text: "Verlangsamt Gegner um dich herum und schadet ihnen." } },
    schattenlaeufer: { name: "Darian", rolle: "Meuchler, schnell und tödlich", bild: "img/figuren/schattenlaeufer.jpg", lp: 165, tempo: 245, nah: true, reich: 66, schaden: 30, takt: 0.55,
      q: { name: "Schattensprung", zeit: 7, text: "Springt vor und trifft den ersten Gegner hart." }, e: { name: "Schleier", zeit: 13, text: "3 Sekunden unsichtbar und schneller. Ein Angriff beendet es." } } };
  const KENN = Object.keys(HELDEN);
  /* Die Karte: punktsymmetrisch, damit beide Seiten gleich sind. Mauern als Rechtecke [x, y, breite, höhe]. */
  const HALB = [[420, 170, 40, 250], [420, 600, 40, 230], [560, 150, 300, 30], [650, 330, 60, 60], [650, 610, 60, 60], [250, 440, 30, 120], [560, 470, 30, 60]];
  const MAUERN = HALB.concat(HALB.map(([x, y, w, h]) => [W - x - w, H - y - h, w, h]));
  const ZONE = { x: W / 2, y: H / 2 }, START = [[{ x: 110, y: 420 }, { x: 90, y: 500 }, { x: 110, y: 580 }], [{ x: W - 110, y: 580 }, { x: W - 90, y: 500 }, { x: W - 110, y: 420 }]];
  const LAGER = [{ x: W / 2, y: 70 }, { x: W / 2, y: H - 70 }];

  /* ---------- Zufall mit Startwert (damit sich eine Partie nachstellen lässt) ---------- */
  let zs = (+P.get("seed") || Date.now()) >>> 0;
  const zf = () => { zs = (zs + 0x6d2b79f5) >>> 0; let t = zs; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  /* ---------- Geometrie ---------- */
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y), klemm = (v, a, b) => Math.max(a, Math.min(b, v));
  function schneidet(x1, y1, x2, y2, m, rand) { // Strecke gegen Rechteck (um rand vergrößert)
    const x = m[0] - rand, y = m[1] - rand, w = m[2] + 2 * rand, h = m[3] + 2 * rand, dx = x2 - x1, dy = y2 - y1; let t0 = 0, t1 = 1;
    for (const [p, q] of [[-dx, x1 - x], [dx, x + w - x1], [-dy, y1 - y], [dy, y + h - y1]]) { if (p === 0) { if (q < 0) return false; } else { const r = q / p; if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; } } }
    return true;
  }
  const sicht = (a, b, rand) => !MAUERN.some((m) => schneidet(a.x, a.y, b.x, b.y, m, rand || 0));
  const inMauer = (x, y, rand) => x < rand || y < rand || x > W - rand || y > H - rand || MAUERN.some((m) => x > m[0] - rand && x < m[0] + m[2] + rand && y > m[1] - rand && y < m[1] + m[3] + rand);
  function schieben(e) { // Kreis aus Mauern und vom Rand wegschieben
    e.x = klemm(e.x, e.r, W - e.r); e.y = klemm(e.y, e.r, H - e.r);
    for (const m of MAUERN) { const nx = klemm(e.x, m[0], m[0] + m[2]), ny = klemm(e.y, m[1], m[1] + m[3]); let dx = e.x - nx, dy = e.y - ny; const d = Math.hypot(dx, dy);
      if (d >= e.r) continue;
      if (d > 0.001) { e.x = nx + dx / d * e.r; e.y = ny + dy / d * e.r; }
      else { const l = e.x - m[0], r = m[0] + m[2] - e.x, o = e.y - m[1], u = m[1] + m[3] - e.y, k = Math.min(l, r, o, u); if (k === l) e.x = m[0] - e.r; else if (k === r) e.x = m[0] + m[2] + e.r; else if (k === o) e.y = m[1] - e.r; else e.y = m[1] + m[3] + e.r; } }
  }
  /* Wegsuche für die Rechner-Helden: Raster, Abstandsfeld je Ziel (kurz gemerkt) */
  const G = 40, GB = W / G, GH = H / G, ZU = new Uint8Array(GB * GH);
  for (let i = 0; i < GB; i++) for (let j = 0; j < GH; j++) ZU[j * GB + i] = inMauer(i * G + G / 2, j * G + G / 2, R_HELD + 2) ? 1 : 0;
  const felder = new Map();
  function feldZu(zx, zy) {
    let i0 = klemm(Math.floor(zx / G), 0, GB - 1), j0 = klemm(Math.floor(zy / G), 0, GH - 1);
    if (ZU[j0 * GB + i0]) { let best = null; for (let i = 0; i < GB; i++) for (let j = 0; j < GH; j++) if (!ZU[j * GB + i]) { const d = (i - i0) ** 2 + (j - j0) ** 2; if (!best || d < best[0]) best = [d, i, j]; } i0 = best[1]; j0 = best[2]; }
    const k = j0 * GB + i0; let f = felder.get(k); if (f) return f;
    f = new Int16Array(GB * GH).fill(-1); f[k] = 0; const q = [k];
    for (let n = 0; n < q.length; n++) { const c = q[n], ci = c % GB, cj = (c - ci) / GB;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const i = ci + di, j = cj + dj; if (i < 0 || j < 0 || i >= GB || j >= GH) continue; const z = j * GB + i; if (ZU[z] || f[z] >= 0) continue; f[z] = f[c] + 1; q.push(z); } }
    if (felder.size > 300) felder.clear(); felder.set(k, f); return f;
  }
  /** Nächster Wegpunkt von e zu (zx, zy) */
  function wegpunkt(e, zx, zy) {
    if (sicht(e, { x: zx, y: zy }, R_HELD + 2)) return { x: zx, y: zy };
    const f = feldZu(zx, zy), ci = klemm(Math.floor(e.x / G), 0, GB - 1), cj = klemm(Math.floor(e.y / G), 0, GH - 1); let best = null;
    for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) { const i = ci + di, j = cj + dj; if (i < 0 || j < 0 || i >= GB || j >= GH) continue; const z = j * GB + i; if (ZU[z] || f[z] < 0) continue;
      if (di && dj && (ZU[cj * GB + i] || ZU[j * GB + ci])) continue; // nicht um Ecken schneiden
      if (!best || f[z] < best[0]) best = [f[z], i, j]; }
    return best ? { x: best[1] * G + G / 2, y: best[2] * G + G / 2 } : { x: zx, y: zy };
  }

  /* ---------- Zustand ---------- */
  const S = { phase: "start", helden: [], monster: [], geschosse: [], bilder: [], felder: [], runde: 0, zeit: 0, stand: [0, 0], halten: [0, 0], es: [0, 0], serie: [0, 0], segen: [{}, {}], seiten: [0, 1],
    ich: null, wahl: P.get("held") && HELDEN[P.get("held")] ? P.get("held") : "elementarist", log: null, meldungen: [], kaufRest: 0, kaeufe: [[], []], entscheidung: false, schluss: null };
  const stufe = (xp) => { let s = 1; while (s < K.XP_STUFE.length && xp >= K.XP_STUFE[s]) s++; return s; };
  const maxLp = (h) => Math.round(HELDEN[h.typ].lp * (1 + K.LP_JE_STUFE * (h.stufe - 1)));
  const lebende = (t) => S.helden.filter((h) => h.team === t && !h.tot);
  const melde = (text, art) => { S.meldungen.push({ text, art: art || "", t: 4 }); if (S.meldungen.length > 5) S.meldungen.shift(); };

  function neueHelden() {
    const ich = S.wahl, rest = ["schildwaechter", "wanderheiler", "elementarist", "schattenlaeufer"].filter((k) => k !== ich), meine = [ich, rest[0], rest[1]];
    // Für den ersten Test spielt der Gegner dieselben drei Helden: So zeigt sich die Schleife aus Kampf, Erfahrung und Wirtschaft, nicht die (noch nicht abgestimmte) Stärke einzelner Helden. gegner=zufall lost stattdessen.
    const gegner = P.get("gegner") === "zufall" ? KENN.map((k) => [zf(), k]).sort((a, b) => a[0] - b[0]).slice(0, 3).map((x) => x[1]) : meine.slice();
    S.helden = [meine, gegner].flatMap((l, t) => l.map((typ, i) => ({ id: t * 3 + i, team: t, typ, name: HELDEN[typ].name, bot: AUTO || t === 1 || i > 0, r: R_HELD, x: 0, y: 0, xp: 0, stufe: 1, lp: HELDEN[typ].lp, max: HELDEN[typ].lp,
      cdA: 0, cdQ: 0, cdE: 0, ziel: 0, betaeubt: 0, langsam: 0, bollwerk: 0, schleier: 0, tot: false, trank: 0, kills: 0, schadenRunde: 0, denk: 0, wp: null, punkt: null, seitlich: zf() < 0.5 ? 1 : -1 })));
    S.ich = S.helden[0];
  }
  function halbzeitNeu() { // voller Neustart: Erfahrung, Stufen, Erbsplitter, Segen, Tränke, Leben
    for (const h of S.helden) { h.xp = 0; h.stufe = 1; h.max = maxLp(h); h.lp = h.max; h.trank = 0; h.tot = false; }
    S.es = [K.START_ES, K.START_ES]; S.serie = [0, 0]; S.segen = [{}, {}];
  }
  function rundeNeu() {
    S.runde++; S.zeit = K.RUNDE; S.halten = [0, 0]; S.geschosse = []; S.bilder = []; S.felder = []; S.phase = "runde";
    for (const h of S.helden) { const p = START[S.seiten[h.team]][h.id % 3]; h.x = p.x; h.y = p.y; h.max = maxLp(h); if (h.tot) { h.tot = false; h.lp = Math.round(h.max * K.WIEDER); } h.lp = Math.min(h.lp, h.max);
      h.cdA = 0; h.cdQ = 2; h.cdE = 2; h.betaeubt = 0; h.langsam = 0; h.bollwerk = 0; h.schleier = 0; h.schadenRunde = 0; h.punkt = null; h.wp = null; h.denk = 0; h.ziel = S.seiten[h.team] === 0 ? 0 : Math.PI; }
    S.monster = LAGER.map((p, i) => ({ id: "m" + i, x: p.x, y: p.y, heim: p, r: 30, lp: 190, max: 190, cd: 0, tot: false, monster: true, name: "Risswächter" }));
    melde(`Runde ${S.runde}${S.entscheidung ? " – Entscheidung" : ""}: Haltet das Siegel!`, "gross");
  }

  /* ---------- Kampf ---------- */
  function schaden(z, menge, von) {
    if (z.tot || S.phase !== "runde") return;
    let m = menge; if (von && !von.monster) { m *= 1 + K.SCHADEN_JE_STUFE * (von.stufe - 1); if (S.segen[von.team].offensiv) m *= 1 + K.SEGEN; von.schadenRunde += m; }
    if (!z.monster) { if (z.bollwerk > 0) m *= 0.4; if (S.segen[z.team].schutz) m *= 1 - K.SEGEN; }
    z.lp -= m; S.bilder.push({ art: "zahl", x: z.x, y: z.y - z.r, t: 0.7, text: String(Math.round(m)), farbe: z.monster ? "#ffd98a" : z.team === S.ich.team ? "#ff8a8a" : "#fff" });
    if (z.lp > 0) return; z.lp = 0; z.tot = true; S.bilder.push({ art: "kreis", x: z.x, y: z.y, r: 60, t: 0.5, farbe: "rgba(255,255,255,.5)" });
    if (z.monster) { if (von) { const t = von.team; xpGeben(von, K.XP_WAECHTER); for (const a of lebende(t)) if (a !== von) xpGeben(a, K.XP_WAECHTER_HILFE); S.es[t] += K.WAECHTER_ES; S.rundeLog.waechter[t]++; melde(`${von.name} besiegt einen Risswächter: +${K.WAECHTER_ES} Erbsplitter`, t === S.ich.team ? "gut" : "schlecht"); } return; }
    if (von && !von.monster) { von.kills++; xpGeben(von, K.XP_KILL); for (const a of lebende(von.team)) if (a !== von) xpGeben(a, K.XP_HILFE); melde(`${von.name} besiegt ${z.name}`, von.team === S.ich.team ? "gut" : "schlecht"); }
    else melde(`${z.name} fällt gegen einen Risswächter`, z.team === S.ich.team ? "schlecht" : "gut");
  }
  function heilen(z, menge) { if (z.tot) return; const v = z.lp; z.lp = Math.min(z.max, z.lp + menge); if (z.lp > v) S.bilder.push({ art: "zahl", x: z.x, y: z.y - z.r, t: 0.7, text: "+" + Math.round(z.lp - v), farbe: "#8dffb0" }); }
  function xpGeben(h, n) { h.xp += n; const s = stufe(h.xp); if (s > h.stufe) { const alt = h.max; h.stufe = s; h.max = maxLp(h); h.lp += h.max - alt; S.bilder.push({ art: "auf", x: h.x, y: h.y, t: 1.4, text: "▲ Stufe " + s }); if (h === S.ich) melde(`Du steigst auf: Stufe ${s}`, "gut"); } }
  const feinde = (h) => S.helden.filter((o) => o.team !== h.team && !o.tot);
  const sichtbar = (h, o) => !o.tot && !(o.schleier > 0) && dist(h, o) < 700 && sicht(h, o);
  function angriff(h) {
    const D = HELDEN[h.typ]; if (h.cdA > 0 || h.betaeubt > 0) return; h.cdA = D.takt; h.schleier = 0;
    if (D.nah) { const ziele = feinde(h).concat(S.monster.filter((m) => !m.tot)); let best = null;
      for (const o of ziele) { const d = dist(h, o) - o.r; if (d > D.reich) continue; const w = Math.abs(winkelDiff(Math.atan2(o.y - h.y, o.x - h.x), h.ziel)); if (w > 1.1) continue; if (!best || d < best[0]) best = [d, o]; }
      S.bilder.push({ art: "hieb", x: h.x, y: h.y, w: h.ziel, r: D.reich + 20, t: 0.18 }); if (best) schaden(best[1], D.schaden, h); }
    else S.geschosse.push({ x: h.x + Math.cos(h.ziel) * 26, y: h.y + Math.sin(h.ziel) * 26, vx: Math.cos(h.ziel) * D.flug, vy: Math.sin(h.ziel) * D.flug, team: h.team, von: h, schaden: D.schaden, r: 7, weit: D.reich, art: h.typ === "wanderheiler" ? "licht" : "blitz" });
  }
  const winkelDiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
  function sprung(h, weite, treffer) { // in Zielrichtung, stoppt vor Mauern; treffer(o): beim ersten Gegner auf dem Weg
    const dx = Math.cos(h.ziel), dy = Math.sin(h.ziel); let traf = null;
    for (let s = 0; s < weite; s += 8) { const nx = h.x + dx * 8, ny = h.y + dy * 8; if (inMauer(nx, ny, h.r)) break; h.x = nx; h.y = ny;
      if (treffer && !traf) { const o = feinde(h).concat(S.monster.filter((m) => !m.tot)).find((o) => dist(h, o) < h.r + o.r + 6); if (o) { traf = o; treffer(o); break; } } }
    S.bilder.push({ art: "kreis", x: h.x, y: h.y, r: 40, t: 0.3, farbe: "rgba(200,180,255,.6)" });
  }
  function faehigkeit(h, taste) {
    const D = HELDEN[h.typ]; if (h.betaeubt > 0 || h.tot) return; if (taste === "q" ? h.cdQ > 0 : h.cdE > 0) return;
    if (taste === "q") { h.cdQ = D.q.zeit; h.schleier = 0;
      if (h.typ === "schildwaechter") sprung(h, 170, (o) => { schaden(o, 30, h); if (!o.monster) o.betaeubt = 0.9; });
      else if (h.typ === "elementarist") S.geschosse.push({ x: h.x + Math.cos(h.ziel) * 26, y: h.y + Math.sin(h.ziel) * 26, vx: Math.cos(h.ziel) * 520, vy: Math.sin(h.ziel) * 520, team: h.team, von: h, schaden: 55, r: 12, weit: 560, art: "feuer", knall: 95 });
      else if (h.typ === "wanderheiler") { for (const a of lebende(h.team)) if (dist(h, a) < 210) heilen(a, 55 * (1 + K.SCHADEN_JE_STUFE * (h.stufe - 1))); S.bilder.push({ art: "kreis", x: h.x, y: h.y, r: 210, t: 0.5, farbe: "rgba(120,255,170,.45)" }); }
      else if (h.typ === "schattenlaeufer") sprung(h, 240, (o) => schaden(o, 42, h)); }
    else { h.cdE = D.e.zeit;
      if (h.typ === "schildwaechter") h.bollwerk = 3;
      else if (h.typ === "elementarist") sprung(h, 220);
      else if (h.typ === "wanderheiler") { S.felder.push({ x: h.x, y: h.y, r: 160, t: 2.5, team: h.team }); for (const o of feinde(h)) if (dist(h, o) < 160) schaden(o, 20, h); }
      else if (h.typ === "schattenlaeufer") h.schleier = 3; }
  }
  function trank(h) { if (h.trank > 0 && !h.tot && h.lp < h.max) { h.trank--; heilen(h, K.TRANK); } }

  /* ---------- Rechner-Helden ---------- */
  function denken(h) {
    const D = HELDEN[h.typ], gegner = feinde(h).filter((o) => sichtbar(h, o)); let z = null;
    for (const o of gegner) { const d = dist(h, o); if (!z || d < z[0]) z = [d, o]; }
    const lager = S.monster[S.seiten[h.team] === 0 ? 0 : 1], holtLager = h.id % 3 === 2 && !lager.tot && S.zeit > K.RUNDE - 35 && !z;
    let nah = z ? z[1] : null; if (!nah && holtLager && dist(h, lager) < 320) nah = lager;
    // Wohin?
    if (!h.punkt || dist(h, h.punkt) < 30 || zf() < 0.01) { const w = zf() * 6.283, r = zf() * (K.ZONE_R - 30); h.punkt = { x: ZONE.x + Math.cos(w) * r, y: ZONE.y + Math.sin(w) * r }; }
    let ziel = holtLager ? { x: lager.x, y: lager.y + (lager.y < H / 2 ? 70 : -70) } : h.punkt;
    const heiler = lebende(h.team).find((a) => a.typ === "wanderheiler" && a !== h);
    if (h.lp < h.max * 0.3 && heiler && dist(h, heiler) > 150) ziel = heiler;
    let bx = 0, by = 0;
    if (nah) { const d = dist(h, nah); h.ziel = Math.atan2(nah.y - h.y, nah.x - h.x) + (zf() - 0.5) * 0.12;
      if (D.nah) { if (d > D.reich * 0.8) ziel = nah; else ziel = null; }
      else if (d < D.reich * 0.45) { bx = -(nah.x - h.x) / d; by = -(nah.y - h.y) / d; ziel = null; } // zu nah: zurückweichen
      else if (d < D.reich * 0.9) { const inZone = dist(h, ZONE) < K.ZONE_R; if (inZone || gegner.length) { bx = -(nah.y - h.y) / d * h.seitlich; by = (nah.x - h.x) / d * h.seitlich; if (zf() < 0.02) h.seitlich *= -1; if (!inZone && lebende(h.team).length >= feinde(h).length) { bx = 0; by = 0; } else ziel = null; } }
      if (d - nah.r < D.reich && sicht(h, nah)) angriff(h);
      // Fähigkeiten
      if (h.typ === "schildwaechter") { if (d < 190 && !nah.monster) faehigkeit(h, "q"); if (h.lp < h.max * 0.6 && d < 300) faehigkeit(h, "e"); }
      else if (h.typ === "elementarist") { if (d < 520 && sicht(h, nah)) faehigkeit(h, "q"); if (d < 130 && !nah.monster) { h.ziel += Math.PI; faehigkeit(h, "e"); h.ziel -= Math.PI; } }
      else if (h.typ === "wanderheiler") { if (d < 150 && !nah.monster) faehigkeit(h, "e"); }
      else if (h.typ === "schattenlaeufer") { if (d < 250 && d > 90) faehigkeit(h, "q"); if (h.lp < h.max * 0.4) faehigkeit(h, "e"); } }
    if (h.typ === "wanderheiler" && lebende(h.team).some((a) => dist(h, a) < 200 && a.lp < a.max * 0.65)) faehigkeit(h, "q");
    if (h.lp < h.max * 0.4) trank(h);
    if (ziel) { h.denk -= DT; if (h.denk <= 0 || !h.wp) { h.wp = wegpunkt(h, ziel.x, ziel.y); h.denk = 0.25; } const d = dist(h, h.wp) || 1; bx = (h.wp.x - h.x) / d; by = (h.wp.y - h.y) / d; if (!nah) h.ziel = Math.atan2(by, bx); if (dist(h, ziel) < 12) { bx = 0; by = 0; } }
    return [bx, by];
  }

  /* ---------- ein Rechenschritt ---------- */
  const EIN = { x: 0, y: 0, feuer: false, q: false, e: false, f: false, zielX: W / 2, zielY: H / 2, zielFest: false, selbst: HANDY, winkel: 0 };
  /** Zielhilfe am Handy: der nächste sichtbare Gegner in Reichweite, sonst ein Risswächter in der Nähe */
  function autoZiel(h) {
    const D = HELDEN[h.typ], weit = D.nah ? D.reich + 190 : D.reich + 60; let best = null;
    for (const o of feinde(h)) { if (!sichtbar(h, o)) continue; const d = dist(h, o); if (d < weit && (!best || d < best[0])) best = [d, o]; }
    if (!best) for (const m of S.monster) { if (m.tot) continue; const d = dist(h, m); if (d < weit && sicht(h, m) && (!best || d < best[0])) best = [d, m]; }
    return best ? best[1] : null;
  }
  function schritt() {
    if (S.phase !== "runde") return;
    S.zeit -= DT;
    for (const h of S.helden) { if (h.tot) continue;
      for (const k of ["cdA", "cdQ", "cdE", "betaeubt", "langsam", "bollwerk", "schleier"]) if (h[k] > 0) h[k] = Math.max(0, h[k] - DT);
      let bx = 0, by = 0;
      if (h.bot) [bx, by] = h.betaeubt > 0 ? [0, 0] : denken(h);
      else { bx = EIN.x; by = EIN.y; const laeuft = Math.hypot(bx, by) > 0.05;
        if (EIN.zielFest) { h.ziel = EIN.winkel; S.autoZiel = null; }
        else if (EIN.selbst) { const z = autoZiel(h); S.autoZiel = z; if (z) h.ziel = Math.atan2(z.y - h.y, z.x - h.x); else if (laeuft) h.ziel = Math.atan2(by, bx); }
        else h.ziel = Math.atan2(EIN.zielY - h.y, EIN.zielX - h.x);
        if (EIN.feuer) { const z = S.autoZiel, D = HELDEN[h.typ]; if (EIN.selbst && !EIN.zielFest && D.nah && z && dist(h, z) - z.r > D.reich * 0.85 && !laeuft) { const d = dist(h, z); bx = (z.x - h.x) / d; by = (z.y - h.y) / d; } angriff(h); } // Nahkämpfer laufen beim Angriffsknopf von selbst an den Gegner heran
        if (EIN.q) { EIN.q = false; faehigkeit(h, "q"); }
        if (EIN.e) { EIN.e = false; const alt = h.ziel; if (EIN.selbst && !EIN.zielFest && h.typ === "elementarist" && laeuft) h.ziel = Math.atan2(by, bx); faehigkeit(h, "e"); h.ziel = alt; } // Blinzeln geht am Handy in Laufrichtung
        if (EIN.f) { EIN.f = false; trank(h); } }
      const l = Math.hypot(bx, by); if (l > 0.01 && !(h.betaeubt > 0)) { let v = HELDEN[h.typ].tempo * (h.langsam > 0 ? 0.5 : 1) * (h.schleier > 0 ? 1.3 : 1); h.x += bx / Math.max(1, l) * v * DT; h.y += by / Math.max(1, l) * v * DT; }
      for (const f of S.felder) if (f.team !== h.team && dist(h, f) < f.r) h.langsam = Math.max(h.langsam, 0.3);
      schieben(h); }
    // Helden schieben sich gegenseitig sanft weg
    for (let i = 0; i < S.helden.length; i++) for (let j = i + 1; j < S.helden.length; j++) { const a = S.helden[i], b = S.helden[j]; if (a.tot || b.tot) continue; const d = dist(a, b); if (d < a.r + b.r && d > 0.01) { const s = (a.r + b.r - d) / 2, dx = (b.x - a.x) / d, dy = (b.y - a.y) / d; a.x -= dx * s; a.y -= dy * s; b.x += dx * s; b.y += dy * s; } }
    // Risswächter
    for (const m of S.monster) { if (m.tot) continue; m.cd = Math.max(0, m.cd - DT); let z = null; for (const h of S.helden) { if (h.tot) continue; const d = dist(m, h); if (d < 170 && dist(h, m.heim) < 260 && (!z || d < z[0])) z = [d, h]; }
      if (z) { const h = z[1]; if (z[0] > m.r + h.r + 8) { m.x += (h.x - m.x) / z[0] * 120 * DT; m.y += (h.y - m.y) / z[0] * 120 * DT; } else if (m.cd <= 0) { m.cd = 1; schaden(h, 20, m); S.bilder.push({ art: "hieb", x: m.x, y: m.y, w: Math.atan2(h.y - m.y, h.x - m.x), r: 60, t: 0.18 }); } }
      else { const d = dist(m, m.heim); if (d > 4) { m.x += (m.heim.x - m.x) / d * 120 * DT; m.y += (m.heim.y - m.y) / d * 120 * DT; } else m.lp = Math.min(m.max, m.lp + 20 * DT); } schieben(m); }
    // Geschosse
    for (const g of S.geschosse) { const sx = g.vx * DT, sy = g.vy * DT; g.x += sx; g.y += sy; g.weit -= Math.hypot(sx, sy); let weg = g.weit <= 0 || inMauer(g.x, g.y, 2);
      if (!weg) { const o = S.helden.find((o) => o.team !== g.team && !o.tot && dist(g, o) < o.r + g.r) || S.monster.find((m) => !m.tot && dist(g, m) < m.r + g.r); if (o) { weg = true; if (!g.knall) schaden(o, g.schaden, g.von); } }
      if (weg) { g.aus = true; if (g.knall) { S.bilder.push({ art: "kreis", x: g.x, y: g.y, r: g.knall, t: 0.4, farbe: "rgba(255,140,40,.6)" }); for (const o of S.helden.filter((o) => o.team !== g.team && !o.tot).concat(S.monster.filter((m) => !m.tot))) if (dist(g, o) < g.knall + o.r) schaden(o, g.schaden, g.von); } } }
    S.geschosse = S.geschosse.filter((g) => !g.aus);
    for (const b of S.bilder) b.t -= DT; S.bilder = S.bilder.filter((b) => b.t > 0);
    for (const f of S.felder) f.t -= DT; S.felder = S.felder.filter((f) => f.t > 0);
    for (const m of S.meldungen) m.t -= DT; S.meldungen = S.meldungen.filter((m) => m.t > 0);
    // Siegel: Wer allein im Kreis steht, hält es
    const drin = [0, 1].map((t) => lebende(t).filter((h) => dist(h, ZONE) < K.ZONE_R).length);
    S.drin = drin; if (drin[0] > 0 && drin[1] === 0) S.halten[0] += DT; else if (drin[1] > 0 && drin[0] === 0) S.halten[1] += DT;
    // Rundenende
    const a = lebende(0).length, b = lebende(1).length;
    if (S.halten[0] >= K.HALTEN) return rundeEnde(0, "Siegel gehalten"); if (S.halten[1] >= K.HALTEN) return rundeEnde(1, "Siegel gehalten");
    if (!a && !b) return rundeEnde(S.halten[0] >= S.halten[1] ? 0 : 1, "beide Gruppen gefallen"); if (!b) return rundeEnde(0, "Gegner ausgeschaltet"); if (!a) return rundeEnde(1, "Gegner ausgeschaltet");
    if (S.zeit <= 0) { const lp = (t) => S.helden.filter((h) => h.team === t).reduce((s, h) => s + (h.tot ? 0 : h.lp / h.max), 0); const sieger = S.halten[0] !== S.halten[1] ? (S.halten[0] > S.halten[1] ? 0 : 1) : lp(0) !== lp(1) ? (lp(0) > lp(1) ? 0 : 1) : zf() < 0.5 ? 0 : 1; rundeEnde(sieger, "Zeit um – länger am Siegel"); }
  }

  /* ---------- Rundenende, Wirtschaft, Kaufphase ---------- */
  function rundeEnde(sieger, grund) {
    S.phase = "auswertung"; S.stand[sieger]++; const verlierer = 1 - sieger, vorEs = S.es.slice();
    const bonus = Math.min(K.SERIE_MAX, K.SERIE * S.serie[verlierer]); S.es[sieger] += K.SIEG; S.es[verlierer] += K.NIEDERLAGE + bonus; S.serie[verlierer]++; S.serie[sieger] = 0;
    for (const h of S.helden) xpGeben(h, K.XP_RUNDE + (h.team === sieger ? K.XP_SIEG : 0));
    S.segen = [{}, {}]; // Segen gelten nur für die Runde, für die sie gekauft wurden
    Object.assign(S.rundeLog, { runde: S.runde, sieger, grund, dauer: Math.round(K.RUNDE - S.zeit), seiten: S.seiten.slice(), halten: S.halten.map((x) => Math.round(x * 10) / 10), einkommen: [S.es[0] - vorEs[0], S.es[1] - vorEs[1]], serieBonus: bonus,
      helden: S.helden.map((h) => ({ team: h.team, typ: h.typ, stufe: h.stufe, xp: h.xp, lp: Math.round(100 * h.lp / h.max), tot: h.tot, schaden: Math.round(h.schadenRunde) })), esNach: S.es.slice() });
    S.log.runden.push(S.rundeLog); S.letzte = { sieger, grund, bonus };
    const halbzeit = S.runde === K.RUNDEN_JE, ende = S.runde >= 2 * K.RUNDEN_JE;
    if (S.entscheidung || (ende && S.stand[0] !== S.stand[1])) return matchEnde();
    if (ende) { S.entscheidung = true; halbzeitNeu(); S.wechsel = "Gleichstand – Entscheidungsrunde: alles zurück auf Anfang, gleiches Budget für beide."; }
    else if (halbzeit) { S.seiten = [1, 0]; halbzeitNeu(); S.wechsel = "Seitenwechsel: Erfahrung, Stufen, Erbsplitter und Käufe sind zurückgesetzt. Der Rundenstand bleibt."; }
    else S.wechsel = "";
    kaufphase();
  }
  const KAUF = [{ id: "heilung", name: "Vollständige Heilung", text: "Heilt alle drei Helden." }, { id: "trank", name: "Heiltrank", text: `Für einen Helden, heilt einmal ${K.TRANK} Leben (Taste F).` },
    { id: "offensiv", name: "Offensivsegen", text: `+${K.SEGEN * 100} % Schaden in der nächsten Runde.` }, { id: "schutz", name: "Schutzsegen", text: `−${K.SEGEN * 100} % erlittener Schaden in der nächsten Runde.` }];
  function kannKaufen(t, id, held) {
    if (S.es[t] < K.PREIS[id]) return false; const team = S.helden.filter((h) => h.team === t);
    if (id === "heilung") return team.some((h) => h.tot || h.lp < h.max); if (id === "trank") return Boolean(held) && held.trank < 1; return !S.segen[t][id];
  }
  function kaufen(t, id, held) {
    if (!kannKaufen(t, id, held)) return false; S.es[t] -= K.PREIS[id];
    if (id === "heilung") for (const h of S.helden) { if (h.team === t) { h.tot = false; h.lp = h.max; } } else if (id === "trank") held.trank++; else S.segen[t][id] = true;
    S.kaeufe[t].push(id); return true;
  }
  function botKauf(t) { // einfache Regel, für beide Seiten dieselbe
    const team = S.helden.filter((h) => h.team === t), schnitt = team.reduce((s, h) => s + (h.tot ? K.WIEDER : h.lp / h.max), 0) / 3;
    if (schnitt < 0.6) kaufen(t, "heilung");
    for (const h of team.slice().sort((a, b) => a.lp / a.max - b.lp / b.max)) if (S.es[t] >= K.PREIS.trank + (S.runde % K.RUNDEN_JE === 0 ? 0 : 20) && (h.tot || h.lp < h.max * 0.75)) kaufen(t, "trank", h);
    if (S.es[t] >= 90 || S.runde % K.RUNDEN_JE === K.RUNDEN_JE - 1) { kaufen(t, zf() < 0.5 ? "offensiv" : "schutz"); if (S.es[t] >= 90) kaufen(t, S.segen[t].offensiv ? "schutz" : "offensiv"); }
  }
  function kaufphase() {
    S.phase = "kauf"; S.kaufRest = K.KAUFZEIT; S.kaeufe = [[], []]; const vor = S.es.slice();
    botKauf(1); if (AUTO) botKauf(0);
    S.rundeLog = { waechter: [0, 0], esVor: vor, kaeufe: S.kaeufe };
    zeigeKauf(); if (AUTO) kaufFertig();
  }
  function kaufFertig() { if (S.phase !== "kauf") return; S.rundeLog.esNachKauf = S.es.slice(); $("#rg-fenster").hidden = true; rundeNeu(); }
  function matchEnde() {
    S.phase = "ende"; const sieg = S.stand[0] > S.stand[1]; S.log.stand = S.stand.slice(); S.log.sieger = sieg ? 0 : 1; S.log.dauer = Math.round((Date.now() - S.log.start) / 1000); S.schluss = S.log;
    zeigeEnde(sieg);
  }
  function matchStart() {
    S.stand = [0, 0]; S.runde = 0; S.seiten = [0, 1]; S.entscheidung = false; S.meldungen = []; S.schluss = null; neueHelden(); halbzeitNeu();
    S.log = { v: 1, modus: "rissgefecht-echtzeit", wann: new Date().toISOString(), start: Date.now(), auto: AUTO, held: S.wahl, teams: [0, 1].map((t) => S.helden.filter((h) => h.team === t).map((h) => h.typ)), zahlen: K, runden: [] };
    S.rundeLog = { waechter: [0, 0], esVor: S.es.slice(), kaeufe: [[], []], esNachKauf: S.es.slice() };
    $("#rg-fenster").hidden = true; rundeNeu();
  }

  /* ---------- Fenster: Start, Kaufphase, Ende ---------- */
  function fenster(html) { const f = $("#rg-fenster"); f.innerHTML = `<div class="rg-blatt">${html}</div>`; f.hidden = false; }
  function zeigeStart() {
    fenster(`<p class="rg-klein">Mythara · Versuch</p><h1>Rissgefecht</h1>
      <p>Drei gegen drei in Echtzeit. Du steuerst <b>einen</b> Helden, die anderen fünf spielt der Rechner. Zehn Runden, Seitenwechsel nach Runde 5. Der Gegner spielt in diesem Test dieselben drei Helden wie dein Team.</p>
      <div class="rg-helden">${KENN.map((k) => { const D = HELDEN[k]; return `<button type="button" class="rg-held${S.wahl === k ? " an" : ""}" data-held="${k}"><img src="${D.bild}" alt=""><b>${D.name}</b><small>${D.rolle}</small><small><i>Q</i> ${D.q.name} · <i>E</i> ${D.e.name}</small></button>`; }).join("")}</div>
      <ul class="rg-regeln"><li><b>Runde gewinnen:</b> ${K.HALTEN} Sekunden allein am Siegel in der Mitte stehen – oder alle Gegner ausschalten. Nach ${K.RUNDE} Sekunden gewinnt, wer länger am Siegel war.</li>
        <li><b>Wer fällt, setzt die Runde aus.</b> Leben bleibt zwischen den Runden, wie es ist; Gefallene kommen mit halbem Leben zurück.</li>
        <li><b>Erfahrung</b> gibt es für Runden, besiegte Gegner und die Risswächter oben und unten. Stufen machen stärker – bis zum Seitenwechsel.</li>
        <li><b>Erbsplitter</b> gehören dem Team: ${K.SIEG} für den Sieg, ${K.NIEDERLAGE} für die Niederlage (mehr bei einer Serie). Zwischen den Runden kaufst du Heilung, Tränke und Segen.</li>
        <li><b>Steuerung:</b> ${HANDY ? "Finger aufs Feld legen und ziehen: laufen. Den großen Knopf rechts halten: angreifen – dein Held zielt von selbst auf den nächsten Gegner, Nahkämpfer laufen dabei an ihn heran. Vom Knopf wegziehen: selbst zielen. Q und E sind die Fähigkeiten, F der Heiltrank." : "WASD laufen · Maus zielen · linke Maustaste angreifen · Q und E Fähigkeiten · F Heiltrank."}</li></ul>
      <div class="rg-knoepfe"><button type="button" class="rg-btn" id="rg-los">Partie starten</button></div>
      <p class="rg-klein">Versuch gegen den Rechner. Nichts wird gespeichert oder verschickt. Alle Zahlen sind Startwerte.</p>`);
    $("#rg-fenster").onclick = (ev) => { const b = ev.target.closest("[data-held]"); if (b) { S.wahl = b.dataset.held; zeigeStart(); } else if (ev.target.id === "rg-los") { if (HANDY) vollbild(); matchStart(); } };
  }
  function zeigeKauf() {
    const t = S.ich.team, L = S.letzte, gewonnen = L.sieger === t, team = S.helden.filter((h) => h.team === t);
    fenster(`<p class="rg-klein">Nach Runde ${S.runde} · Stand ${S.stand[t]} : ${S.stand[1 - t]}</p><h1 class="${gewonnen ? "gut" : "schlecht"}">${gewonnen ? "Runde gewonnen" : "Runde verloren"}</h1>
      <p>${esc(L.grund)}. Einkommen: <b>${gewonnen ? K.SIEG : K.NIEDERLAGE + L.bonus}</b> Erbsplitter${!gewonnen && L.bonus ? ` (davon ${L.bonus} für die Niederlagenserie)` : ""}.</p>
      ${S.wechsel ? `<p class="rg-wechsel">${esc(S.wechsel)}</p>` : ""}
      <div class="rg-team">${team.map((h) => `<div class="rg-zeile"><img src="${HELDEN[h.typ].bild}" alt=""><div><b>${h.name}${h === S.ich ? " (du)" : ""}</b> · Stufe ${h.stufe}<i class="rg-balken"><u style="width:${Math.round(100 * (h.tot ? K.WIEDER : h.lp / h.max))}%"></u></i><small>${h.tot ? "gefallen – kommt mit halbem Leben zurück" : Math.round(h.lp) + " / " + h.max + " Leben"}${h.trank ? " · Heiltrank" : ""}</small></div>
        <button type="button" class="rg-btn klein" data-kauf="trank" data-held="${h.id}" ${kannKaufen(t, "trank", h) ? "" : "disabled"}>Trank ${K.PREIS.trank}</button></div>`).join("")}</div>
      <p class="rg-es">◈ <b>${S.es[t]}</b> Erbsplitter im Teamvorrat</p>
      <div class="rg-kauf">${KAUF.filter((k) => k.id !== "trank").map((k) => `<button type="button" class="rg-ding${S.segen[t][k.id] ? " hat" : ""}" data-kauf="${k.id}" ${kannKaufen(t, k.id) ? "" : "disabled"}><b>${k.name}</b><small>${k.text}</small><em>${S.segen[t][k.id] ? "gekauft" : K.PREIS[k.id] + " ◈"}</em></button>`).join("")}</div>
      <div class="rg-knoepfe"><button type="button" class="rg-btn" id="rg-bereit">Bereit – nächste Runde <span id="rg-kaufzeit">${Math.ceil(S.kaufRest)}</span></button></div>`);
    $("#rg-fenster").onclick = (ev) => { const b = ev.target.closest("[data-kauf]"); if (b && !b.disabled) { kaufen(t, b.dataset.kauf, b.dataset.held != null ? S.helden[+b.dataset.held] : null); zeigeKauf(); } else if (ev.target.closest("#rg-bereit")) kaufFertig(); };
  }
  function zeigeEnde(sieg) {
    const t = S.ich.team;
    fenster(`<p class="rg-klein">Rissgefecht · Ergebnis</p><h1 class="${sieg ? "gut" : "schlecht"}">${sieg ? "Sieg" : "Niederlage"} ${S.stand[t]} : ${S.stand[1 - t]}</h1>
      <table class="rg-tab"><tr><th>Runde</th><th>Sieger</th><th>Grund</th><th>Dauer</th><th>Stufen (du / Gegner)</th><th>Erbsplitter</th></tr>${S.log.runden.map((r) => `<tr class="${r.sieger === t ? "gut" : "schlecht"}"><td>${r.runde}</td><td>${r.sieger === t ? "du" : "Gegner"}</td><td>${esc(r.grund)}</td><td>${r.dauer} s</td><td>${r.helden.filter((h) => h.team === t).map((h) => h.stufe).join(" ")} / ${r.helden.filter((h) => h.team !== t).map((h) => h.stufe).join(" ")}</td><td>${r.esNach[t]} / ${r.esNach[1 - t]}</td></tr>`).join("")}</table>
      <div class="rg-knoepfe"><button type="button" class="rg-btn" id="rg-kopie">Mitschrift kopieren</button><button type="button" class="rg-btn" id="rg-neu">Noch eine Partie</button></div><p class="rg-klein" id="rg-kopiert"></p>`);
    $("#rg-fenster").onclick = (ev) => { if (ev.target.id === "rg-neu") zeigeStart(); else if (ev.target.id === "rg-kopie") { const text = JSON.stringify(S.log); (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(() => { $("#rg-kopiert").textContent = "Mitschrift kopiert – füge sie in den Chat ein."; }, () => { $("#rg-kopiert").textContent = text; }); } };
  }

  /* ---------- Zeichnen ---------- */
  const cv = $("#rg-feld"), cx = cv.getContext("2d"), BILDER = {}; for (const k of KENN) { const b = new Image(); b.src = HELDEN[k].bild; BILDER[k] = b; }
  const KAM = { x: W / 2, y: H / 2, z: 1 }; // Mittelpunkt der Ansicht in der Welt und Bildpunkte je Welteinheit
  function groesse() {
    const d = Math.min(2, window.devicePixelRatio || 1);
    if (HANDY) { const b = window.innerWidth, h = window.innerHeight; cv.style.width = b + "px"; cv.style.height = h + "px"; cv.width = Math.floor(b * d); cv.height = Math.floor(h * d); KAM.z = Math.max(cv.height / SICHT_H, cv.width / W); }
    else { const b = window.innerWidth, h = window.innerHeight - $("#rg-kopf").offsetHeight - $("#rg-fuss").offsetHeight, mass = Math.min(b / W, h / H); cv.style.width = Math.floor(W * mass) + "px"; cv.style.height = Math.floor(H * mass) + "px"; cv.width = Math.floor(W * mass * d); cv.height = Math.floor(H * mass * d); KAM.z = cv.width / W; KAM.x = W / 2; KAM.y = H / 2; }
  }
  function kamera() {
    if (HANDY) { const h = S.ich && !S.ich.tot ? S.ich : (S.helden.find((o) => S.ich && o.team === S.ich.team && !o.tot) || ZONE), bw = cv.width / KAM.z / 2, bh = cv.height / KAM.z / 2;
      const zx = bw >= W / 2 ? W / 2 : klemm(h.x, bw, W - bw), zy = bh >= H / 2 ? H / 2 : klemm(h.y, bh, H - bh); KAM.x += (zx - KAM.x) * 0.2; KAM.y += (zy - KAM.y) * 0.2; }
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.fillStyle = "#0a0910"; cx.fillRect(0, 0, cv.width, cv.height);
    cx.setTransform(KAM.z, 0, 0, KAM.z, cv.width / 2 - KAM.x * KAM.z, cv.height / 2 - KAM.y * KAM.z);
  }
  function zeichnen() {
    const t = S.ich ? S.ich.team : 0, meine = S.helden.filter((h) => h.team === t && !h.tot);
    kamera(); cx.fillStyle = "#15131d"; cx.fillRect(0, 0, W, H); cx.strokeStyle = "#5b5170"; cx.lineWidth = 4; cx.strokeRect(0, 0, W, H);
    cx.strokeStyle = "rgba(255,255,255,.035)"; cx.lineWidth = 1; cx.beginPath(); for (let x = 0; x <= W; x += 80) { cx.moveTo(x, 0); cx.lineTo(x, H); } for (let y = 0; y <= H; y += 80) { cx.moveTo(0, y); cx.lineTo(W, y); } cx.stroke();
    // Startbereiche
    for (const s of [0, 1]) { const team = S.seiten.indexOf(s); cx.fillStyle = team === t ? "rgba(90,150,255,.10)" : "rgba(255,90,90,.10)"; cx.fillRect(s === 0 ? 0 : W - 200, 330, 200, 340); }
    // Siegel
    const halter = S.drin ? (S.drin[0] > 0 && S.drin[1] === 0 ? 0 : S.drin[1] > 0 && S.drin[0] === 0 ? 1 : S.drin[0] && S.drin[1] ? 2 : -1) : -1;
    cx.beginPath(); cx.arc(ZONE.x, ZONE.y, K.ZONE_R, 0, 6.283); cx.fillStyle = halter === 2 ? "rgba(255,210,90,.16)" : halter === t ? "rgba(90,150,255,.18)" : halter === 1 - t ? "rgba(255,90,90,.18)" : "rgba(190,160,255,.08)"; cx.fill();
    cx.lineWidth = 3; cx.strokeStyle = "rgba(210,190,255,.55)"; cx.setLineDash([10, 8]); cx.stroke(); cx.setLineDash([]);
    for (const k of [t, 1 - t]) { cx.beginPath(); cx.arc(ZONE.x, ZONE.y, K.ZONE_R + (k === t ? 8 : 16), -Math.PI / 2, -Math.PI / 2 + 6.283 * Math.min(1, S.halten[k] / K.HALTEN)); cx.lineWidth = 6; cx.strokeStyle = k === t ? "#6aa5ff" : "#ff6a6a"; cx.stroke(); }
    cx.fillStyle = "rgba(230,215,255,.5)"; cx.font = "600 22px Inter, sans-serif"; cx.textAlign = "center"; cx.fillText("SIEGEL", ZONE.x, ZONE.y + 8);
    // Felder, Mauern
    for (const f of S.felder) { cx.beginPath(); cx.arc(f.x, f.y, f.r, 0, 6.283); cx.fillStyle = "rgba(150,220,255,.14)"; cx.fill(); cx.strokeStyle = "rgba(150,220,255,.5)"; cx.lineWidth = 2; cx.stroke(); }
    for (const m of MAUERN) { cx.fillStyle = "#3a3348"; cx.fillRect(m[0], m[1], m[2], m[3]); cx.strokeStyle = "#5b5170"; cx.lineWidth = 2; cx.strokeRect(m[0] + 1, m[1] + 1, m[2] - 2, m[3] - 2); }
    // Risswächter
    for (const m of S.monster) { if (m.tot) continue; cx.beginPath(); cx.arc(m.x, m.y, m.r, 0, 6.283); cx.fillStyle = "#5a3d16"; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = "#ffcf6a"; cx.stroke(); cx.fillStyle = "#ffe2a0"; cx.font = "24px serif"; cx.fillText("☠", m.x, m.y + 8); balken(m, "#ffcf6a"); }
    // Helden (Gegner nur, wenn jemand aus dem eigenen Team sie sieht)
    for (const h of S.helden) { if (h.tot) continue; const eigen = h.team === t; if (!eigen && !AUTO && !(S.phase !== "runde") && !meine.some((a) => sichtbar(a, h))) continue;
      cx.save(); if (h.schleier > 0) cx.globalAlpha = eigen ? 0.45 : 0.0; if (cx.globalAlpha === 0) { cx.restore(); continue; }
      cx.beginPath(); cx.arc(h.x, h.y, h.r, 0, 6.283); cx.save(); cx.clip(); const b = BILDER[h.typ]; if (b.complete && b.naturalWidth) { const s = Math.min(b.naturalWidth, b.naturalHeight); cx.drawImage(b, (b.naturalWidth - s) / 2, 0, s, s, h.x - h.r, h.y - h.r, 2 * h.r, 2 * h.r); } else { cx.fillStyle = "#666"; cx.fill(); } cx.restore();
      cx.lineWidth = h === S.ich ? 5 : 3.5; cx.strokeStyle = eigen ? (h === S.ich ? "#ffffff" : "#6aa5ff") : "#ff6a6a"; cx.stroke();
      if (h.bollwerk > 0) { cx.beginPath(); cx.arc(h.x, h.y, h.r + 7, 0, 6.283); cx.strokeStyle = "#ffe08a"; cx.lineWidth = 3; cx.stroke(); }
      if (h.betaeubt > 0) { cx.fillStyle = "#ffe08a"; cx.font = "20px serif"; cx.fillText("✦", h.x, h.y - h.r - 20); }
      cx.beginPath(); cx.moveTo(h.x + Math.cos(h.ziel) * (h.r + 4), h.y + Math.sin(h.ziel) * (h.r + 4)); cx.lineTo(h.x + Math.cos(h.ziel) * (h.r + 16), h.y + Math.sin(h.ziel) * (h.r + 16)); cx.lineWidth = 4; cx.strokeStyle = eigen ? "#cfe0ff" : "#ffc9c9"; cx.stroke();
      balken(h, eigen ? "#5fd08a" : "#ff6a6a"); cx.fillStyle = "#fff"; cx.font = "600 13px Inter, sans-serif"; cx.fillText(h.name + " · " + h.stufe, h.x, h.y - h.r - 16); cx.restore(); }
    if (S.ich && !S.ich.tot && S.phase === "runde") { const h = S.ich, D = HELDEN[h.typ];
      if (D.nah) { cx.beginPath(); cx.arc(h.x, h.y, D.reich + h.r, h.ziel - 1.1, h.ziel + 1.1); cx.lineWidth = 3; cx.strokeStyle = h.cdA > 0 ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.38)"; cx.stroke(); } // so weit reicht der Hieb
      const z = S.autoZiel; if (EIN.selbst && z && !z.tot) { cx.beginPath(); cx.arc(z.x, z.y, z.r + 9, 0, 6.283); cx.lineWidth = 3; cx.setLineDash([6, 5]); cx.strokeStyle = "#ffe08a"; cx.stroke(); cx.setLineDash([]); } }
    for (const g of S.geschosse) { cx.beginPath(); cx.arc(g.x, g.y, g.r, 0, 6.283); cx.fillStyle = g.art === "feuer" ? "#ff8a2a" : g.art === "licht" ? "#fff2a8" : "#9ad0ff"; cx.fill(); }
    for (const b of S.bilder) { cx.save();
      if (b.art === "kreis") { cx.globalAlpha = Math.min(1, b.t * 3); cx.beginPath(); cx.arc(b.x, b.y, b.r, 0, 6.283); cx.fillStyle = b.farbe; cx.fill(); }
      else if (b.art === "hieb") { cx.globalAlpha = b.t / 0.18; cx.beginPath(); cx.arc(b.x, b.y, b.r, b.w - 0.9, b.w + 0.9); cx.lineWidth = 8; cx.strokeStyle = "#fff"; cx.stroke(); }
      else { cx.globalAlpha = Math.min(1, b.t * 2); cx.fillStyle = b.art === "auf" ? "#8fc0ff" : b.farbe; cx.font = b.art === "auf" ? "700 20px Inter, sans-serif" : "700 17px Inter, sans-serif"; cx.fillText(b.text, b.x, b.y - (b.art === "auf" ? 40 + (1.4 - b.t) * 20 : (0.7 - b.t) * 40)); }
      cx.restore(); }
  }
  function balken(e, farbe) { const b = e.r * 2.2, x = e.x - b / 2, y = e.y - e.r - 12; cx.fillStyle = "rgba(0,0,0,.6)"; cx.fillRect(x, y, b, 6); cx.fillStyle = farbe; cx.fillRect(x, y, b * Math.max(0, e.lp / e.max), 6); }
  let hudAlt = "";
  function hud() {
    if (!S.ich) return; const t = S.ich.team, h = S.ich, D = HELDEN[h.typ], naechste = K.XP_STUFE[h.stufe], vor = K.XP_STUFE[h.stufe - 1];
    const kopf = `<span class="rg-stand"><b class="blau">${S.stand[t]}</b> : <b class="rot">${S.stand[1 - t]}</b></span><span>Runde ${Math.min(S.runde, 2 * K.RUNDEN_JE + 1)}${S.entscheidung ? " (Entscheidung)" : " / " + 2 * K.RUNDEN_JE}</span><span class="rg-zeit${S.zeit < 15 ? " knapp" : ""}">${Math.max(0, Math.ceil(S.zeit))} s</span>
      <span class="rg-halten"><i class="blau" style="width:${Math.min(100, 100 * S.halten[t] / K.HALTEN)}%"></i></span><span class="rg-halten"><i class="rot" style="width:${Math.min(100, 100 * S.halten[1 - t] / K.HALTEN)}%"></i></span><span>◈ ${S.es[t]}</span>`;
    const cd = (z, max, name, taste) => `<span class="rg-cd${z > 0 ? " zu" : ""}" data-taste="${taste}"><i style="height:${z > 0 ? Math.round(100 * z / max) : 0}%"></i><b>${taste.toUpperCase()}</b><small>${name}${z > 0 ? " " + Math.ceil(z) : ""}</small></span>`;
    const fuss = `<span class="rg-ich"><b>${h.name}</b> Stufe ${h.stufe}<i class="rg-balken"><u style="width:${Math.round(100 * h.lp / h.max)}%"></u></i><small>${h.tot ? "gefallen – du schaust zu" : Math.round(h.lp) + " / " + h.max}</small><i class="rg-balken xp"><u style="width:${naechste ? Math.round(100 * (h.xp - vor) / (naechste - vor)) : 100}%"></u></i></span>
      ${cd(h.cdQ, D.q.zeit, D.q.name, "q")}${cd(h.cdE, D.e.zeit, D.e.name, "e")}<span class="rg-cd${h.trank ? "" : " zu"}" data-taste="f"><b>F</b><small>Trank ${h.trank}</small></span>
      <span class="rg-meld">${S.meldungen.slice(-3).map((m) => `<em class="${m.art}">${esc(m.text)}</em>`).join("")}</span>`;
    if (HANDY) { for (const [taste, z, max, name] of [["q", h.cdQ, D.q.zeit, D.q.name], ["e", h.cdE, D.e.zeit, D.e.name], ["f", h.trank ? 0 : 1, 1, "Trank " + h.trank]]) { const el = document.querySelector(`#rg-tasten [data-taste="${taste}"]`); if (!el) continue; const txt = `<i style="height:${z > 0 ? Math.round(100 * z / max) : 0}%"></i><b>${z > 0 && taste !== "f" ? Math.ceil(z) : taste.toUpperCase()}</b><small>${name}</small>`; if (el.dataset.h !== txt) { el.dataset.h = txt; el.innerHTML = txt; el.classList.toggle("zu", z > 0); } }
      if (ang) { const txt = HELDEN[h.typ].nah ? "Hieb" : "Schuss"; if (ang.dataset.h !== txt) { ang.dataset.h = txt; ang.querySelector("small").textContent = txt; } $("#rg-tasten").hidden = S.phase !== "runde" || h.tot; }
      const fussH = `<span class="rg-ich"><b>${h.name}</b> Stufe ${h.stufe}<i class="rg-balken"><u style="width:${Math.round(100 * h.lp / h.max)}%"></u></i><small>${h.tot ? "gefallen – du schaust zu" : Math.round(h.lp) + " / " + h.max}</small><i class="rg-balken xp"><u style="width:${naechste ? Math.round(100 * (h.xp - vor) / (naechste - vor)) : 100}%"></u></i></span><span class="rg-meld">${S.meldungen.slice(-2).map((m) => `<em class="${m.art}">${esc(m.text)}</em>`).join("")}</span>`;
      const neuH = kopf + "|" + fussH; if (neuH === hudAlt) return; hudAlt = neuH; $("#rg-kopf").innerHTML = kopf; $("#rg-fuss").innerHTML = fussH; return; }
    const neu = kopf + "|" + fuss; if (neu === hudAlt) return; hudAlt = neu; $("#rg-kopf").innerHTML = kopf; $("#rg-fuss").innerHTML = fuss;
  }

  /* ---------- Eingabe ---------- */
  const TASTEN = {};
  const achse = () => { EIN.x = (TASTEN.d || TASTEN.arrowright ? 1 : 0) - (TASTEN.a || TASTEN.arrowleft ? 1 : 0); EIN.y = (TASTEN.s || TASTEN.arrowdown ? 1 : 0) - (TASTEN.w || TASTEN.arrowup ? 1 : 0); };
  window.addEventListener("keydown", (ev) => { const k = ev.key.toLowerCase(); if (S.phase === "runde" && ["w", "a", "s", "d", "q", "e", "f", " ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) ev.preventDefault(); TASTEN[k] = true; achse(); if (k === "q") EIN.q = true; if (k === "e") EIN.e = true; if (k === "f") EIN.f = true; if (k === " ") EIN.feuer = true; });
  window.addEventListener("keyup", (ev) => { const k = ev.key.toLowerCase(); TASTEN[k] = false; achse(); if (k === " ") EIN.feuer = false; });
  const zuWelt = (ev) => { const r = cv.getBoundingClientRect(), d = cv.width / r.width; return { x: KAM.x + ((ev.clientX - r.left) - r.width / 2) * d / KAM.z, y: KAM.y + ((ev.clientY - r.top) - r.height / 2) * d / KAM.z }; };
  cv.addEventListener("mousemove", (ev) => { if (HANDY && !ev.buttons) return; const p = zuWelt(ev); EIN.zielX = p.x; EIN.zielY = p.y; EIN.zielFest = false; EIN.selbst = false; });
  cv.addEventListener("mousedown", (ev) => { if (ev.button === 0) EIN.feuer = true; }); window.addEventListener("mouseup", () => { EIN.feuer = false; });
  cv.addEventListener("contextmenu", (ev) => ev.preventDefault());
  // Berührung: Wo der Finger das Feld berührt, entsteht der Steuerknüppel. Rechts liegen die Knöpfe.
  let stick = null; const knauf = $("#rg-stick"), knopf = $("#rg-stick i");
  const stickAus = () => { stick = null; EIN.x = 0; EIN.y = 0; if (knauf) knauf.hidden = true; };
  cv.addEventListener("touchstart", (ev) => { ev.preventDefault(); if (stick) return; const t = ev.changedTouches[0]; stick = { id: t.identifier, x: t.clientX, y: t.clientY }; knauf.hidden = false; knauf.style.left = t.clientX + "px"; knauf.style.top = t.clientY + "px"; knopf.style.transform = "translate(-50%, -50%)"; }, { passive: false });
  cv.addEventListener("touchmove", (ev) => { ev.preventDefault(); if (!stick) return; for (const t of ev.changedTouches) { if (t.identifier !== stick.id) continue; const dx = t.clientX - stick.x, dy = t.clientY - stick.y, l = Math.hypot(dx, dy), m = 46, k = Math.min(1, l / m);
    if (l > 8) { EIN.x = dx / l * k; EIN.y = dy / l * k; } else { EIN.x = 0; EIN.y = 0; } knopf.style.transform = `translate(calc(-50% + ${dx / Math.max(l, 1) * Math.min(l, m)}px), calc(-50% + ${dy / Math.max(l, 1) * Math.min(l, m)}px))`; } }, { passive: false });
  for (const e of ["touchend", "touchcancel"]) cv.addEventListener(e, (ev) => { ev.preventDefault(); if (stick && [...ev.changedTouches].some((t) => t.identifier === stick.id)) stickAus(); }, { passive: false });
  // Angriffsknopf: halten = angreifen (zielt von selbst auf den nächsten Gegner), ziehen = selbst zielen
  const ang = $("#rg-angriff"); let angStart = null;
  if (ang) { ang.addEventListener("pointerdown", (ev) => { ev.preventDefault(); try { ang.setPointerCapture(ev.pointerId); } catch (e) { /* ohne */ } angStart = { x: ev.clientX, y: ev.clientY }; EIN.feuer = true; EIN.selbst = true; EIN.zielFest = false; ang.classList.add("an"); });
    ang.addEventListener("pointermove", (ev) => { if (!angStart) return; const dx = ev.clientX - angStart.x, dy = ev.clientY - angStart.y; if (Math.hypot(dx, dy) > 22) { EIN.zielFest = true; EIN.winkel = Math.atan2(dy, dx); } else EIN.zielFest = false; });
    for (const e of ["pointerup", "pointercancel"]) ang.addEventListener(e, () => { angStart = null; EIN.feuer = false; EIN.zielFest = false; ang.classList.remove("an"); }); }
  for (const b of document.querySelectorAll("#rg-tasten [data-taste]")) b.addEventListener("pointerdown", (ev) => { ev.preventDefault(); EIN.selbst = true; EIN[b.dataset.taste] = true; });
  $("#rg-fuss").addEventListener("pointerdown", (ev) => { const b = ev.target.closest("[data-taste]"); if (b) { EIN[b.dataset.taste] = true; ev.preventDefault(); } });
  /** Vollbild im Querformat (wo der Browser es erlaubt; auf dem iPhone geht nur „Zum Home-Bildschirm“) */
  function vollbild() { const el = document.documentElement, f = el.requestFullscreen || el.webkitRequestFullscreen; if (!f || document.fullscreenElement) return; try { Promise.resolve(f.call(el, { navigationUI: "hide" })).then(() => { if (screen.orientation && screen.orientation.lock) screen.orientation.lock("landscape").catch(() => {}); }).catch(() => {}); } catch (e) { /* ohne Vollbild */ } }
  if ($("#rg-voll")) $("#rg-voll").addEventListener("click", vollbild);
  window.addEventListener("orientationchange", () => setTimeout(groesse, 250)); document.addEventListener("fullscreenchange", () => setTimeout(groesse, 100));
  window.addEventListener("resize", groesse);

  /* ---------- Schleife ---------- */
  let zuletzt = 0, rest = 0;
  function takt(jetzt) {
    const d = Math.min(0.1, (jetzt - zuletzt) / 1000 || 0); zuletzt = jetzt;
    if (S.phase === "runde") { rest += d * TEMPO; let n = 0; while (rest >= DT && n++ < 400) { schritt(); rest -= DT; if (S.phase !== "runde") { rest = 0; break; } } }
    else if (S.phase === "kauf") { S.kaufRest -= d; const z = $("#rg-kaufzeit"); if (z) z.textContent = Math.max(0, Math.ceil(S.kaufRest)); if (S.kaufRest <= 0) kaufFertig(); }
    if (S.helden.length) { zeichnen(); hud(); } requestAnimationFrame(takt);
  }
  /** Für Tests: sek Sekunden Spielzeit sofort rechnen (ohne Bilder). Kaufphasen werden dabei beendet. */
  function vor(sek) { let n = Math.round(sek / DT); while (n-- > 0 && S.phase !== "ende") { if (S.phase === "kauf") kaufFertig(); if (S.phase === "runde") schritt(); } return S.phase; }
  window.RG = { S, K, HELDEN, EIN, KAM, HANDY, vor, start: matchStart, kaufen, kaufFertig, sicht, wegpunkt, MAUERN };
  groesse(); zeigeStart(); requestAnimationFrame(takt); if (AUTO) matchStart();
})();
