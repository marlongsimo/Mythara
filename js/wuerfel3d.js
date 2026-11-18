/*
 * Mythara – der W20 als Spielstein: ein gezeichneter Zwanzigflächner, der über die Karte rollt, ein paarmal aufspringt
 * und auf der gewürfelten Zahl liegen bleibt. Ändert keine Regeln: Die Zahl steht vorher fest, der Würfel zeigt sie nur.
 *
 *   W3D.wurf({ zahl, ziel: {x, y}, von: {x, y}, design, groesse, schnell, zweite, zaehlt })  →  Promise (fertig, wenn er liegt)
 *     zahl    1–20, die Zahl, auf der er landet
 *     ziel    Bildschirmpunkt, an dem er liegen bleibt (Standard: Bildschirmmitte)
 *     von     Punkt, von dem er geworfen wird (Standard: unterer Rand)
 *     design  Name eines Würfel-Designs (siehe DESIGNS)
 *     zweite  zweite Zahl für Vorteil/Nachteil: dann rollen zwei Würfel; „zaehlt“ sagt, welcher gilt ("hoch" | "tief")
 *   W3D.weg()  räumt die Würfel ab
 *
 * Gezeichnet wird auf einer Leinwand über der Seite (keine Zusatzbibliothek).
 */
(function () {
  "use strict";
  const PHI = (1 + Math.sqrt(5)) / 2;
  const norm = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const kreuz = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const mal = (A, B) => { const C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) C[i][j] = A[i][0] * B[0][j] + A[i][1] * B[1][j] + A[i][2] * B[2][j]; return C; };
  const anw = (M, v) => [dot(M[0], v), dot(M[1], v), dot(M[2], v)];
  /** Drehung um eine Achse (Rodrigues) */
  function dreh(achse, w) {
    const [x, y, z] = norm(achse), c = Math.cos(w), s = Math.sin(w), t = 1 - c;
    return [[t * x * x + c, t * x * y - s * z, t * x * z + s * y], [t * x * y + s * z, t * y * y + c, t * y * z - s * x], [t * x * z - s * y, t * y * z + s * x, t * z * z + c]];
  }

  /* ---------- Der Körper: 12 Ecken, 20 Flächen; gegenüberliegende Zahlen ergeben 21 wie beim echten W20 ---------- */
  const ECKEN = [[-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0], [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI], [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1]].map(norm);
  const DREIECKE = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
  const K = 100; // Flächenkoordinaten in Hundertsteln, damit Schriftgrößen nicht unter 1 px fallen
  const FLAECHEN = DREIECKE.map((d) => {
    const p = d.map((i) => ECKEN[i]), c = [(p[0][0] + p[1][0] + p[2][0]) / 3, (p[0][1] + p[1][1] + p[2][1]) / 3, (p[0][2] + p[1][2] + p[2][2]) / 3];
    const n = norm(c), u = norm(sub(p[0], c)), r = kreuz(u, n);
    return { c, n, u, r, ecken: p.map((v) => { const w = sub(v, c); return [dot(w, r) * K, -dot(w, u) * K]; }), zahl: 0 };
  });
  { // Zahlen verteilen: Gegenüber = 21 − Zahl
    const frei = FLAECHEN.map((_, i) => i); let z = 1;
    while (frei.length) { const a = frei.shift(), b = frei.findIndex((i) => dot(FLAECHEN[i].n, FLAECHEN[a].n) < -0.99); FLAECHEN[a].zahl = z; FLAECHEN[frei.splice(b, 1)[0]].zahl = 21 - z; z += 1; }
    // gemischt, damit benachbarte Flächen nicht aufeinanderfolgende Zahlen tragen
    const tausch = { 1: 1, 2: 13, 3: 7, 4: 19, 5: 10, 6: 16, 7: 3, 8: 17, 9: 15, 10: 12 };
    FLAECHEN.forEach((f) => { const k = Math.min(f.zahl, 21 - f.zahl), neu = tausch[k]; f.zahl = f.zahl <= 10 ? neu : 21 - neu; });
  }
  const KANTE = Math.hypot(...sub(ECKEN[0], ECKEN[11])) * K;

  /* ---------- Designs: dunkle Seite, helle Seite, Kante, Zahl, Schein ---------- */
  const DESIGNS = {
    standard: { tief: "#17120b", hell: "#4a3b24", kante: "#d9b26a", zahl: "#f3ead6", schein: null },
    w_obsidian: { tief: "#050608", hell: "#2a2f3c", kante: "#8f9bb0", zahl: "#dfe6f2", schein: null },
    w_elfenbein: { tief: "#a89a78", hell: "#fbf4e0", kante: "#8a7448", zahl: "#2a2216", schein: null },
    w_smaragd: { tief: "#06231a", hell: "#1f7a52", kante: "#4fd08a", zahl: "#d6ffe6", schein: null },
    w_rubin: { tief: "#2a060c", hell: "#8f1c2a", kante: "#e0505a", zahl: "#ffe0dc", schein: null },
    w_glut: { tief: "#4a1006", hell: "#f08a20", kante: "#ffb040", zahl: "#fff2c8", schein: "rgba(255,120,30,.9)" },
    w_frost: { tief: "#16406e", hell: "#cfeeff", kante: "#e6f8ff", zahl: "#06223c", schein: "rgba(140,210,255,.9)" },
    w_arkan: { tief: "#1a0b3a", hell: "#9a5cf0", kante: "#d0a0ff", zahl: "#f4e6ff", schein: "rgba(170,90,255,.95)" },
    w_s0_bronze: { tief: "#7a4520", hell: "#f0b98a", kante: "#f0b98a", zahl: "#3a1f0c", schein: "rgba(201,133,82,.9)" },
    w_s0_silber: { tief: "#5c6672", hell: "#f4f8fc", kante: "#f4f8fc", zahl: "#20262e", schein: "rgba(195,204,214,.9)" },
    w_s0_gold: { tief: "#7a5410", hell: "#fff0b0", kante: "#fff0b0", zahl: "#2a1a04", schein: "rgba(230,181,60,.9)" },
    w_s0_platin: { tief: "#0f4a45", hell: "#d4fff9", kante: "#d4fff9", zahl: "#06302c", schein: "rgba(88,207,196,.9)" },
    w_s0_meister: { tief: "#3d1163", hell: "#f0d9ff", kante: "#f0d9ff", zahl: "#2a0a48", schein: "rgba(176,108,240,.95)" },
    w_gold: { tief: "#7a5010", hell: "#fff0b0", kante: "#fff0b0", zahl: "#2a1a04", schein: "rgba(255,210,100,.9)" },
  };
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const misch = (a, b, t) => { const A = hex(a), B = hex(b); return `rgb(${A.map((x, i) => Math.round(x + (B[i] - x) * t)).join(",")})`; };

  /* ---------- Leinwand ---------- */
  let cv = null, cx = null, laeuft = null, liegen = [], funken = [];
  function leinwand() {
    if (cv) return;
    cv = document.createElement("canvas"); cv.className = "w3d-leinwand"; cv.setAttribute("aria-hidden", "true");
    cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:900";
    document.body.appendChild(cv); cx = cv.getContext("2d"); passen(); addEventListener("resize", passen);
  }
  function passen() { const d = Math.min(2, devicePixelRatio || 1); cv.width = Math.round(innerWidth * d); cv.height = Math.round(innerHeight * d); cv._d = d; }

  const LICHT = norm([-0.45, 0.7, 0.75]);
  /** Einen Würfel zeichnen: Lage M, Mittelpunkt (x, y), Halbmesser s in px */
  function zeichne(w, M, x, y, s, deckung) {
    const D = w.D, d = cv._d;
    const sicht = FLAECHEN.map((f) => ({ f, n: anw(M, f.n) })).filter((o) => o.n[2] > 0.02).sort((a, b) => a.n[2] - b.n[2]);
    cx.globalAlpha = deckung;
    if (D.schein || w.glanz) { cx.save(); cx.setTransform(d, 0, 0, d, 0, 0); cx.shadowColor = w.glanz || D.schein; cx.shadowBlur = s * (w.glanz ? 0.9 : 0.45); cx.fillStyle = D.tief; cx.beginPath(); cx.arc(x, y, s * 0.82, 0, 7); cx.fill(); cx.restore(); cx.globalAlpha = deckung; }
    for (const o of sicht) {
      const f = o.f, c = anw(M, f.c), r = anw(M, f.r), u = anw(M, f.u), k = s / K;
      cx.setTransform(r[0] * k * d, -r[1] * k * d, -u[0] * k * d, u[1] * k * d, (x + c[0] * s) * d, (y - c[1] * s) * d);
      const hell = Math.max(0, dot(o.n, LICHT)), t = Math.min(1, 0.12 + hell * 0.95);
      cx.beginPath(); cx.moveTo(f.ecken[0][0], f.ecken[0][1]); cx.lineTo(f.ecken[1][0], f.ecken[1][1]); cx.lineTo(f.ecken[2][0], f.ecken[2][1]); cx.closePath();
      const g = cx.createLinearGradient(0, f.ecken[0][1], 0, f.ecken[1][1]); g.addColorStop(0, misch(D.tief, D.hell, Math.min(1, t + 0.12))); g.addColorStop(1, misch(D.tief, D.hell, Math.max(0, t - 0.1)));
      cx.fillStyle = g; cx.fill(); cx.lineJoin = "round"; cx.lineWidth = 2.6; cx.strokeStyle = D.kante; cx.globalAlpha = deckung * (0.35 + 0.5 * hell); cx.stroke(); cx.globalAlpha = deckung;
      if (o.n[2] > 0.18) {
        cx.fillStyle = D.zahl; cx.globalAlpha = deckung * Math.min(1, 0.25 + o.n[2] * 0.95); cx.font = `700 ${KANTE * 0.36}px Cinzel, Georgia, serif`; cx.textAlign = "center"; cx.textBaseline = "middle";
        cx.fillText(String(f.zahl), 0, KANTE * 0.045);
        if (f.zahl === 6 || f.zahl === 9) cx.fillRect(-KANTE * 0.09, KANTE * 0.2, KANTE * 0.18, KANTE * 0.022);
        cx.globalAlpha = deckung;
      }
    }
    cx.setTransform(d, 0, 0, d, 0, 0); cx.globalAlpha = 1;
  }
  function schatten(x, y, s, hoehe, deckung) {
    const d = cv._d; cx.setTransform(d, 0, 0, d, 0, 0); cx.globalAlpha = deckung * (0.5 - 0.3 * Math.min(1, hoehe));
    const g = cx.createRadialGradient(x, y, 0, x, y, s * (1.05 + hoehe * 0.6)); g.addColorStop(0, "rgba(0,0,0,.9)"); g.addColorStop(1, "rgba(0,0,0,0)");
    cx.fillStyle = g; cx.beginPath(); cx.ellipse(x, y + s * 0.62, s * (1.05 + hoehe * 0.6), s * (0.42 + hoehe * 0.2), 0, 0, 7); cx.fill(); cx.globalAlpha = 1;
  }

  /* ---------- Bewegung: Wurfbahn mit drei Aufsprüngen, Drehung läuft aus und endet genau auf der Zielfläche ---------- */
  const SPRUNG = [[0, 0.36, 1], [0.36, 0.62, 0.42], [0.62, 0.8, 0.17], [0.8, 0.92, 0.05]]; // [von, bis, Höhe]
  const hoch = (t) => { for (const [a, b, h] of SPRUNG) if (t >= a && t < b) { const p = (t - a) / (b - a); return h * 4 * p * (1 - p); } return 0; };
  const aus = (t) => 1 - Math.pow(1 - t, 3);
  function endlage(zahl) {
    const f = FLAECHEN.find((x) => x.zahl === zahl) || FLAECHEN[0];
    return mal(dreh([1, 0, 0], -0.2), [f.r, f.u, f.n]); // Zahl zum Betrachter, leicht nach hinten gekippt
  }
  function klang(name, laut) { try { if (window.W3D.ton) window.W3D.ton(name, laut); } catch (e) { /* ohne Ton */ } }

  function bild(jetzt) {
    const d = cv._d; cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, cv.width, cv.height);
    let bewegt = false;
    for (const w of liegen) {
      const t = Math.min(1, (jetzt - w.start) / w.dauer), e = aus(t), rest = 1 - e;
      const x = w.von.x + (w.ziel.x - w.von.x) * e, yb = w.von.y + (w.ziel.y - w.von.y) * e, h = hoch(t);
      const M = t >= 1 ? w.Mf : mal(w.Mf, mal(dreh(w.a1, w.w1 * rest * rest), dreh(w.a2, w.w2 * rest)));
      const nach = t >= 1 ? Math.min(1, (jetzt - w.start - w.dauer) / 260) : 0, puls = t >= 1 ? 1 + 0.12 * Math.sin(nach * Math.PI) * (1 - nach) : 1;
      const s = w.s * (1 + h * 0.45) * puls, y = yb - h * w.s * 3.1;
      for (const [a] of SPRUNG.slice(1)) if (w.letzt < a && t >= a) klang("auf", 1 - a);
      if (w.letzt < 1 && t >= 1) { klang("liegt", 1); if (w.fertig) { w.fertig(); w.fertig = null; } }
      w.letzt = t;
      const deck = w.blass && t >= 1 ? 1 - 0.6 * Math.min(1, (jetzt - w.start - w.dauer) / 400) : 1;
      schatten(x, yb, w.s, h, deck); zeichne(w, M, x, y, s, deck);
      if (t < 1 || nach < 1 || (w.blass && deck > 0.41)) bewegt = true;
    }
    cx.setTransform(d, 0, 0, d, 0, 0);
    funken = funken.filter((f) => jetzt - f.t0 < f.dauer);
    for (const f of funken) { const p = (jetzt - f.t0) / f.dauer; cx.globalAlpha = (1 - p) * 0.95; cx.fillStyle = f.farbe; cx.beginPath(); cx.arc(f.x + f.vx * p, f.y + f.vy * p + 60 * p * p, f.r * (1 - p * 0.6), 0, 7); cx.fill(); }
    cx.globalAlpha = 1;
    laeuft = bewegt || funken.length ? requestAnimationFrame(bild) : null;
  }
  function spruehen(x, y, farbe, zahl) {
    const t0 = performance.now();
    for (let i = 0; i < zahl; i++) { const w = Math.random() * Math.PI * 2, v = 60 + Math.random() * 170; funken.push({ t0, dauer: 500 + Math.random() * 500, x, y, vx: Math.cos(w) * v, vy: Math.sin(w) * v - 50, r: 2 + Math.random() * 3.5, farbe }); }
    if (!laeuft) laeuft = requestAnimationFrame(bild);
  }

  function einer(o, zahl, ziel, verzug) {
    return new Promise((fertig) => {
      const ruhig = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const w = { D: DESIGNS[o.design] || DESIGNS.standard, s: o.groesse || Math.max(40, Math.min(74, innerWidth * 0.09)), zahl, ziel, von: o.von || { x: ziel.x + (Math.random() - 0.5) * innerWidth * 0.5, y: innerHeight + 80 },
        start: performance.now() + (verzug || 0), dauer: ruhig ? 1 : o.schnell ? 850 : 1350, Mf: endlage(zahl), a1: [Math.random() - 0.5, Math.random() - 0.5, Math.random() * 0.4], a2: [Math.random() - 0.5, Math.random() + 0.3, Math.random() - 0.5],
        w1: (9 + Math.random() * 5) * (Math.random() < 0.5 ? -1 : 1), w2: 5 + Math.random() * 4, letzt: -1, glanz: null, blass: false, fertig: null };
      w.fertig = () => {
        if (o.schlicht) return fertig(w); // Rettungswurf: eine 20 oder 1 ist dort nichts Besonderes
        if (zahl === 20) { w.glanz = "rgba(255,214,110,1)"; spruehen(ziel.x, ziel.y, "#ffd97a", 46); klang("krit", 1); }
        else if (zahl === 1) { w.glanz = "rgba(210,40,40,.95)"; spruehen(ziel.x, ziel.y, "#b3262f", 14); klang("patzer", 1); }
        fertig(w);
      };
      liegen.push(w); if (!laeuft) laeuft = requestAnimationFrame(bild);
    });
  }

  /** Ein Wurf (oder zwei bei Vorteil/Nachteil). Zurück: Promise, erfüllt mit der Zahl, die zählt */
  async function wurf(o) {
    o = o || {}; leinwand(); weg();
    const ziel = o.ziel || { x: innerWidth / 2, y: innerHeight / 2 };
    if (o.zweite == null) { await einer(o, o.zahl, ziel, 0); return o.zahl; }
    const ab = (o.groesse || Math.max(40, Math.min(74, innerWidth * 0.09))) * 1.25;
    const [a, b] = await Promise.all([einer(o, o.zahl, { x: ziel.x - ab, y: ziel.y }, 0), einer(o, o.zweite, { x: ziel.x + ab, y: ziel.y + 6 }, 90)]);
    const gilt = o.zaehlt === "tief" ? Math.min(o.zahl, o.zweite) : Math.max(o.zahl, o.zweite);
    (a.zahl === gilt ? b : a).blass = true; if (a.zahl === b.zahl) b.blass = true, a.blass = false;
    if (!laeuft) laeuft = requestAnimationFrame(bild);
    return gilt;
  }
  function weg() { liegen = []; funken = []; if (cv && cx) { cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, cv.width, cv.height); } }

  window.W3D = { wurf, weg, DESIGNS, ton: null, _flaechen: FLAECHEN };
})();
