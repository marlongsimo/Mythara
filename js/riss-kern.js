/*
 * Mythara – Rissgänger (Prototyp): der Regelkern. Regelstand: doku/konzepte/rissgaenger.md
 *
 * Enthält alles, was ohne Bildschirm auskommt: die fünf Räume, den Weg (Stufen, Zustand, Beute), den Weg des Rechner-Gegners,
 * das Siegel-Finale (Siegelpunkte, wanderndes Siegel, Rückkehr, Zurückerobern, Auslöschen) und den Rechner-Gegner im Finale.
 * Benutzt nur die öffentliche Schnittstelle der Regeln (js/regeln.js) und verändert sie nicht.
 * Das Finale ist ein Arena-Duell (R.neueArena); die Siegel-Regeln liegen als Schicht darüber: Nach jedem Schritt wird nach() gerufen.
 *
 * Im Browser: window.ABRISSKERN(R, KARTEN, botFabrik) · unter Node: require("./riss-kern.js")(R, KARTEN, botFabrik)
 */
(function (root) {
  "use strict";
  /* Der feste Weg der ersten Fassung (nur noch über ?rissweg=fest): fünf kurze Räume, jeder gibt eine Stufe, Raum 4 und 5 dazu Beute.
     n = Gegnerzahl wie für so viele Helden, skala = Anteil ihrer Trefferpunkte */
  const RAEUME = [
    { name: "Der Einstieg", karte: "GARTEN", begegnung: "garten", n: 2, skala: 0.4, text: "Der Riss schließt sich hinter euch. Ein paar Rostkäfer, mehr nicht." },
    { name: "Die Koboldgänge", karte: "TURM", begegnung: "kobolde", n: 2, skala: 0.7, text: "Enge Gänge, schnelle Schatten." },
    { name: "Die Gruft", karte: "GRUFT", begegnung: "kaefer_kobolde", n: 3, skala: 0.8, text: "Hier unten liegt, was der Riss nicht mehr hergibt." },
    { name: "Die Pilzgrotte", karte: "PILZE", begegnung: "gruft", n: 2, skala: 0.8, text: "Ab hier gibt der Riss Beute her." },
    { name: "Die Tiefe", karte: "SCHACHT", begegnung: "pilze", n: 2, skala: 0.8, text: "Tiefer geht es nicht. Wer hier besteht, kommt stark am Siegel an." }];
  /* Der geloste Weg: Raum 1 ist immer der leichte Einstieg (E). Die Räume 2 bis 5 sind zwei schwere Räume (S: +1 Stufe, echte Gefahr)
     und zwei Beuteräume (B: kurzer Kampf, ein Gegenstand, keine Stufe) in geloster Reihenfolge – für beide Seiten dieselbe.
     Schwere Räume wachsen mit ihrem Platz im Weg (skalaJe je Platz nach dem zweiten). */
  const EINSTIEG = RAEUME[0];
  const SCHWER = [
    { name: "Die Gruft", karte: "GRUFT", begegnung: "gruft", n: 2, skala: 0.9, skalaJe: 0, text: "Knochenwächter. Hier wird es ernst: Wer am Ende steht, steigt auf." },
    { name: "Die Tiefe", karte: "SCHACHT", begegnung: "netz", n: 2, skala: 0.9, skalaJe: 0, text: "Netze in der Dunkelheit. Ein schwerer Raum: Wer am Ende steht, steigt auf." }];
  const BEUTE = [
    { name: "Die Schatzkammer", karte: "TURM", begegnung: "kobolde", n: 2, skala: 0.6, text: "Kobolde über einer offenen Truhe. Ein kurzer Kampf, dann gehört die Beute euch. Eine Stufe gibt es hier nicht." },
    { name: "Das Pilzlager", karte: "PILZE", begegnung: "kaefer_kobolde", n: 2, skala: 0.6, text: "Zwischen den Pilzen liegt, was andere verloren haben. Ein kurzer Kampf, dann Beute. Eine Stufe gibt es hier nicht." }];
  /* Beute: nur, was auch im Duell wirkt (wie in der Rechnung) */
  const DING_POOL = ["amulett", "eulenmantel", "gluecksbringer", "stiefel", "wetzstein", "ring", "schleifstein", "feder", "eisenspitzen", "stab"], SEGEN_POOL = ["klingen", "fuesse", "wachtfeuer"];
  const NAH = new Set(["krieger", "schurke"]), ZAUBER = new Set(["zauberer", "kleriker"]);
  const ZIEL = 5, RUNDEN = 12, MIN_RAEUME = 2, MAX_RAEUME = 5;

  function kern(R, KARTEN, botFabrik) {
    const F = R.FD, fabrik = botFabrik || root.ABARENABOT, BOT = fabrik ? fabrik(R) : null;
    const karteVon = (k) => (k !== "GARTEN" && KARTEN && KARTEN[k]) || R.KARTE_GARTEN;
    const passt = (id, fid) => { const k = F.FIGUREN[fid].klasse; return id === "ring" || id === "schleifstein" ? NAH.has(k) : id === "feder" || id === "eisenspitzen" ? k === "waldlaeufer" : id === "stab" ? ZAUBER.has(k) : true; };
    const an = () => { if (F.STUFEN10) F.STUFEN10.aktiv = true; };
    const plaetzeVon = (() => { const m = {}; return (fid, s) => { const k = fid + ":" + s; if (!m[k]) { an(); m[k] = (R.neuesSpiel(1, { figuren: [fid], stufenListe: [s] }).figuren[0].plaetze || []).slice(); } return m[k]; }; })();

    /* ---------- der Weg ---------- */
    /** Neue Gruppe: drei Helden, alle Stufe 1 */
    function neu(gruppe, name, folge) {
      return { folge: folge || null, name: name || "", gruppe: gruppe.slice(0, 3), stufen: Object.fromEntries(gruppe.map((f) => [f, 1])), zust: null, dinge: {}, segen: [], raeume: 0, runden: 0, abgebogen: false, verlauf: [] };
    }
    /** Reihenfolge losen: "E" und danach zwei schwere und zwei Beuteräume, gemischt. zf: Zufall 0..1 */
    const folgeLosen = (zf) => "E" + ["S", "S", "B", "B"].map((x) => [zf(), x]).sort((a, b) => a[0] - b[0]).map((x) => x[1]).join("");
    /** Raum i (0 bis 4) dieser Gruppe: { art: "E" | "S" | "B" | "F" (fester Weg), name, text, karte, begegnung, n, skala } */
    function raumVon(W, i) {
      if (!W.folge) return Object.assign({ art: "F" }, RAEUME[i]);
      const art = W.folge[i]; if (art === "E") return Object.assign({ art }, EINSTIEG);
      const k = [...W.folge.slice(0, i)].filter((x) => x === art).length, d = (art === "S" ? SCHWER : BEUTE)[k % 2];
      return Object.assign({ art }, d, { skala: d.skala + (d.skalaJe || 0) * Math.max(0, i - 1) });
    }
    /** Angaben für R.neuesSpiel / AB.kampfStarten: Raum i (0 bis 4) */
    function raumOpts(W, i) {
      an(); const r = raumVon(W, i), g = W.gruppe;
      return { figuren: g.slice(), stufenListe: g.map((f) => W.stufen[f]), stufe: Math.round(g.reduce((a, f) => a + W.stufen[f], 0) / g.length), karte: karteVon(r.karte), begegnung: r.begegnung,
        gegner: R.gegnerFuer(r.begegnung, r.n, null, r.skala, false, 0), vorher: W.zust ? R.neuerKampf(W.zust) : null, schwierigkeit: "normal", segen: W.segen.slice(), bedrohung: 0 };
    }
    /** Nach dem Start eines Raums: Gegenstände der Gruppe in die Rucksäcke */
    function raumDinge(W, st) {
      for (const f of st.figuren) for (const id of W.dinge[f.fid] || []) { f.rucksack = f.rucksack || []; if (!f.rucksack.some((d) => d.id === id)) f.rucksack.push({ id, n: 1 }); }
    }
    /** Raum abrechnen. Zurück: { sieg, runden, auf: [fid …], gefallen: [fid …] } */
    function raumEnde(W, i, st) {
      const sieg = st.ende === "sieg", art = raumVon(W, i).art, out = { raum: i + 1, art, sieg, runden: st.runde, auf: [], gefallen: [] };
      W.raeume = i + 1; W.runden += st.runde;
      const fertig = () => { out.stufen = Object.assign({}, W.stufen); out.leben = leben(W); W.verlauf.push(out); return out; };
      if (!sieg) { W.zust = null; return fertig(); } // Gruppe verloren: kein Lohn, alle stehen voll geheilt wieder auf
      const zust = R.nachKampf(st);
      for (const f of W.gruppe) { const z = zust[f], alt = W.stufen[f], fig = st.figuren.find((x) => x.fid === f);
        if (z.tot || !fig || fig.tp <= 0) { z.tot = false; z.tp = Math.ceil(F.tpVon(f, alt) / 2); out.gefallen.push(f); continue; } // gefallen: halbe Trefferpunkte, keine Stufe
        if (art === "B") continue; // Beuteraum: keine Stufe
        const neuS = Math.min(10, alt + 1), pa = plaetzeVon(f, alt), pn = plaetzeVon(f, neuS);
        W.stufen[f] = neuS; z.tp += F.tpVon(f, neuS) - F.tpVon(f, alt); z.stufe = neuS; out.auf.push(f);
        z.plaetze = pn.map((n, k) => Math.max(0, Math.min(n, ((z.plaetze || [])[k] || 0) + n - (pa[k] || 0)))); } // neue Zauberplätze der Stufe kommen dazu
      W.zust = zust; return fertig();
    }
    /** Beute nach Raum 4 (ein Gegenstand) und Raum 5 (Gegenstand oder Segen). zf: Zufall 0..1. Zurück: null oder { dinge: [3 Kennungen], segen: [Kennungen] } */
    function beuteAngebot(W, i, zf) {
      const art = raumVon(W, i).art, zweiter = art === "B" && [...W.folge.slice(0, i)].includes("B");
      if (art === "F" ? i < 3 : art !== "B") return null;
      const frei = DING_POOL.filter((id) => W.gruppe.some((f) => passt(id, f) && !(W.dinge[f] || []).includes(id) && (W.dinge[f] || []).length < 2));
      const dinge = frei.map((id) => [zf(), id]).sort((a, b) => a[0] - b[0]).slice(0, 3).map((x) => x[1]);
      return { dinge, segen: (art === "F" ? i >= 4 : zweiter) && !W.segen.length ? SEGEN_POOL.slice() : [] };
    }
    const kannTragen = (W, id, fid) => passt(id, fid) && !(W.dinge[fid] || []).includes(id) && (W.dinge[fid] || []).length < 2;
    function beuteNehmen(W, wahl) {
      if (!wahl) return;
      if (wahl.segen && SEGEN_POOL.includes(wahl.segen) && !W.segen.length) { W.segen.push(wahl.segen); return; }
      if (wahl.ding && W.gruppe.includes(wahl.held) && kannTragen(W, wahl.ding, wahl.held)) {
        (W.dinge[wahl.held] = W.dinge[wahl.held] || []).push(wahl.ding);
        if (W.zust && W.zust[wahl.held]) { const r = W.zust[wahl.held].rucksack = W.zust[wahl.held].rucksack || []; if (!r.some((d) => d.id === wahl.ding)) r.push({ id: wahl.ding, n: 1 }); } }
    }
    /** Anteil der Trefferpunkte je Held (1 = voll) */
    const leben = (W) => Object.fromEntries(W.gruppe.map((f) => [f, W.zust ? Math.min(1, W.zust[f].tp / F.tpVon(f, W.stufen[f])) : 1]));
    const lebenSchnitt = (W) => { const l = leben(W); return W.gruppe.reduce((a, f) => a + l[f], 0) / W.gruppe.length; };
    const stufeSchnitt = (W) => W.gruppe.reduce((a, f) => a + W.stufen[f], 0) / W.gruppe.length;

    /* ---------- der Weg des Rechner-Gegners ---------- */
    /** Ein Raum, vom Rechner gespielt (beide Seiten ziehen von selbst) */
    function raumAuto(W, i, seed) {
      const opts = raumOpts(W, i), wieder = { seed, opts: Object.assign({}, opts, { vorher: opts.vorher ? JSON.parse(JSON.stringify(opts.vorher)) : null }), dinge: JSON.parse(JSON.stringify(W.dinge)) }; // zum Nachspielen (Zuschauen)
      const st = R.neuesSpiel(seed, opts); raumDinge(W, st); st.wieder = wieder; let z = 0;
      while (!st.ende && z++ < 900) { if (R.aktiv(st).seite === "gegner") R.gegnerZug(st); else R.autoZug(st); }
      if (!st.ende) st.ende = "niederlage";
      return st;
    }
    /** Einen vom Rechner gespielten Raum noch einmal aufbauen (gleicher Zufall, gleicher Verlauf, wenn wieder autoZug und gegnerZug ziehen) */
    function raumWieder(w) { an(); const st = R.neuesSpiel(w.seed, Object.assign({}, w.opts, { vorher: w.opts.vorher ? JSON.parse(JSON.stringify(w.opts.vorher)) : null })); raumDinge({ dinge: w.dinge }, st); return st; }
    const raumSchritt = (st) => { if (st.ende) return; if (R.aktiv(st).seite === "gegner") R.gegnerZug(st); else R.autoZug(st); };
    /** Biegt der Rechner nach diesem Raum ab? Er kennt nur den eigenen Zustand. */
    function botBiegtAb(W, zf) {
      if (W.raeume < MIN_RAEUME) return false; if (W.raeume >= MAX_RAEUME) return true;
      let p = { 2: 0.2, 3: 0.45, 4: 0.6 }[W.raeume] || 0;
      if (lebenSchnitt(W) < 0.35) p += 0.25; // angeschlagen: lieber früh ans Siegel (dort gibt es Heilung, im nächsten Raum nicht)
      return zf() < p;
    }
    function botBeute(W, i, zf) {
      const a = beuteAngebot(W, i, zf); if (!a) return null;
      if (a.segen.length && zf() < 0.5) { const s = a.segen[Math.floor(zf() * a.segen.length)]; beuteNehmen(W, { segen: s }); return { segen: s }; }
      for (const id of a.dinge) { const l = W.gruppe.filter((f) => kannTragen(W, id, f)); if (l.length) { const held = l[Math.floor(zf() * l.length)]; beuteNehmen(W, { ding: id, held }); return { ding: id, held }; } }
      return null;
    }
    /** Der ganze Weg des Rechners: Räume, Beute, Abbiegen. Zurück: W (mit W.raeume und W.verlauf) */
    function botWeg(gruppe, seed, name, folge) {
      let zs = (seed >>> 0) || 7; const zf = () => { zs = (zs * 1103515245 + 12345) & 0x7fffffff; return zs / 0x7fffffff; };
      const W = neu(gruppe, name, folge);
      for (let i = 0; i < MAX_RAEUME; i++) {
        const st = raumAuto(W, i, seed * 13 + i + 1), e = raumEnde(W, i, st); e.wieder = st.wieder;
        if (e.sieg) e.beute = botBeute(W, i, zf);
        if (botBiegtAb(W, zf)) break;
      }
      W.abgebogen = true; return W;
    }

    /* ---------- das Finale ---------- */
    const held = (f) => f.art !== "wolf" && f.art !== "arenawolf" && Boolean(f.fid || f.fidA), hid = (f) => f.fid || f.fidA;
    const helden = (st, tm) => st.figuren.filter((f) => held(f) && R.teamVon(st, f) === tm), lebt = (f) => f.tp > 0 && !f.tot;
    const frei = (st, x, y) => x >= 0 && y >= 0 && x < st.karte.b && y < st.karte.h && !st.karte.block.has(x + "," + y);
    function naechstFrei(st, zx, zy, ohneFiguren) {
      let best = null;
      for (let x = 0; x < st.karte.b; x++) for (let y = 0; y < st.karte.h; y++) { if (!frei(st, x, y)) continue; if (ohneFiguren && st.figuren.some((g) => g.tp > 0 && g.x === x && g.y === y)) continue; const d = Math.hypot(x - zx, y - zy); if (!best || d < best.d) best = { x, y, d }; }
      return best;
    }
    /** Siegelpunkte der früheren Gruppe: 2 für den ersten Raum Vorsprung, 1 für jeden weiteren, höchstens 3 */
    const startPunkte = (vor) => (vor <= 0 ? 0 : Math.min(3, vor + 1));
    /**
     * Finale beginnen. W1, W2: die beiden Gruppen nach ihrem Weg (Team 1 unten, Team 2 oben).
     * o: { heilung: "gerechnet" (frühere Gruppe: Hälfte der fehlenden Trefferpunkte, spätere keine; gleichauf: beide) | "keine" (niemand), namen, staerke }
     */
    function finaleNeu(seed, W1, W2, o = {}) {
      an(); const W = { 1: W1, 2: W2 }, vor = W2.raeume - W1.raeume, frueh = vor > 0 ? 1 : vor < 0 ? 2 : 0, heilung = o.heilung === "keine" ? "keine" : "gerechnet";
      const st = R.neueArena(seed, { modus: "duell", runden: RUNDEN, karte: karteVon("SIEGEL"), begegnung: "kobolde", namen: o.namen || [W1.name || "Du", W2.name || "Gegner"],
        teams: [W1, W2].map((w) => w.gruppe.map((f) => ({ fid: f, stufe: w.stufen[f] }))) });
      // Zustand vom Weg mitnehmen: Trefferpunkte (mit oder ohne Heilung), Zauberplätze, Tränke, Verbrauchtes, Beute
      for (const tm of [1, 2]) { const w = W[tm], l = leben(w), z0 = w.zust ? R.neuerKampf(JSON.parse(JSON.stringify(w.zust))) : null, heilt = heilung === "gerechnet" && (frueh === tm || !frueh);
        for (const f of helden(st, tm)) { const id = hid(f), a = l[id] == null ? 1 : l[id], z = z0 && z0[id];
          if (z) { f.plaetze = z.plaetze.slice(); f.genutzt = Object.assign({}, z.genutzt); f.rucksack = JSON.parse(JSON.stringify(z.rucksack || [])); }
          for (const d of w.dinge[id] || []) { f.rucksack = f.rucksack || []; if (!f.rucksack.some((x) => x.id === d)) f.rucksack.push({ id: d, n: 1 }); }
          if (w.segen.includes("wachtfeuer")) f.tpMax += 3;
          f.tp = Math.max(1, Math.round(f.tpMax * (heilt ? a + (1 - a) / 2 : a))); } }
      const k = st.karte, mitte = naechstFrei(st, (k.b - 1) / 2, (k.h - 1) / 2), orte = [mitte, naechstFrei(st, mitte.x - 3, mitte.y), naechstFrei(st, mitte.x + 3, mitte.y)].map((p) => ({ x: p.x, y: p.y }));
      const eingang = {}; for (const tm of [1, 2]) for (const f of helden(st, tm)) eingang[f.id] = { x: f.x, y: f.y };
      const P = { 1: frueh === 1 ? startPunkte(vor) : 0, 2: frueh === 2 ? startPunkte(-vor) : 0 };
      st.riss = { P, folge: { 1: 0, 2: 0 }, gefallenIn: {}, gesperrt: {}, eingang, orte, ort: 0, runde: st.runde, ziel: ZIEL, max: RUNDEN, segen: { 1: W1.segen.filter((x) => x !== "wachtfeuer"), 2: W2.segen.filter((x) => x !== "wachtfeuer") },
        frueh, vor: Math.abs(vor), start: { 1: P[1], 2: P[2] }, heilung, aus: null, botStaerke: o.staerke != null ? o.staerke : 1, merk: { wer: null, lauf: 0, gelaufen: false, n: 0 },
        M: { wechsel: 0, halter: 0, zurueck: 0, rueck: 0, aus: 0, spruenge: 0, runden: [] } };
      if (frueh) { // wer zuerst ankommt, steht schon am Siegel: auf den gewählten Feldern (o.aufstellung, nur im erlaubten Bereich), sonst so nah wie möglich
        const wahl = (frueh === 1 && o.aufstellung) || {}, erlaubt = new Set(aufstellFelder(st).map((p) => p.x + "," + p.y)), h = helden(st, frueh);
        for (const f of h) { f.x = -9; f.y = -9; }
        for (const f of h) { const w = wahl[hid(f)]; if (w && erlaubt.has(w.x + "," + w.y) && !st.figuren.some((g) => g !== f && g.tp > 0 && g.x === w.x && g.y === w.y)) { f.x = w.x; f.y = w.y; } }
        for (const f of h) if (f.x < 0) { const p = naechstFrei(st, orte[0].x, orte[0].y, true); f.x = p.x; f.y = p.y; }
        for (const w of st.figuren) if ((w.art === "wolf" || w.art === "arenawolf") && w.besitzer && R.teamVon(st, w) === frueh) { const b = st.figuren.find((g) => g.id === w.besitzer), p = b && naechstFrei(st, b.x, b.y, true); if (p) { w.x = p.x; w.y = p.y; } } }
      st.log.push({ t: frueh ? `${st.arena.namen[frueh - 1]} steht schon am Siegel und beginnt mit ${P[frueh]} Siegelpunkten.` : "Beide Gruppen kommen gleichzeitig an. Niemand beginnt mit Siegelpunkten.", art: "gut", tm: 0 });
      punkteZeigen(st); vor_(st);
      return st;
    }
    /** Wo die frühere Gruppe ihre Helden aufstellen darf: freie Felder bis zwei Schritte um das erste Siegelfeld */
    function aufstellFelder(st) { const S = st.riss.orte[0], out = []; for (let x = S.x - 2; x <= S.x + 2; x++) for (let y = S.y - 2; y <= S.y + 2; y++) if (frei(st, x, y)) out.push({ x, y }); return out; }
    /** Der Siegelsaal für die Aufstellung vor dem Finale: Größe, gesperrte Felder, Siegelfelder, erlaubte Felder, Bild */
    function saal() {
      const k = karteVon("SIEGEL"), st = { karte: { b: k.b, h: k.h, block: new Set(k.hindernisse.map(([, x, y]) => x + "," + y)) }, figuren: [] };
      const mitte = naechstFrei(st, (k.b - 1) / 2, (k.h - 1) / 2); st.riss = { orte: [mitte, naechstFrei(st, mitte.x - 3, mitte.y), naechstFrei(st, mitte.x + 3, mitte.y)] };
      return { b: k.b, h: k.h, bild: k.bild || null, block: [...st.karte.block], orte: st.riss.orte.map((p) => ({ x: p.x, y: p.y })), felder: aufstellFelder(st) };
    }
    const siegel = (st) => st.riss.orte[st.riss.ort], naechstesSiegel = (st) => st.riss.orte[(st.riss.ort + 1) % st.riss.orte.length];
    const dist = (st, f) => { const S = siegel(st); return Math.max(Math.abs(f.x - S.x), Math.abs(f.y - S.y)); }, inZone = (st, f) => dist(st, f) <= 1;
    const steht = (st, tm) => helden(st, tm).filter((f) => lebt(f) && inZone(st, f)).length;
    const punkteZeigen = (st) => { st.arena.punkte[1] = st.riss.P[1]; st.arena.punkte[2] = st.riss.P[2]; };
    /** Vor jedem Schritt: Der Segen gilt für die Seite, die am Zug ist */
    function vor_(st) { const X = st.riss; if (!X || st.ende) return; const a = R.aktiv(st), tm = a ? R.teamVon(st, a) : 0; st.segen = tm ? X.segen[tm].slice() : []; }
    const sagen = (st, t, art) => st.log.push({ t, art: art || "gut", tm: 0 });
    function schluss(st, sieger, grund, text, runde) {
      const X = st.riss; X.aus = { sieger, grund, runden: Math.min(runde || st.runde, X.max), punkte: { 1: X.P[1], 2: X.P[2] } };
      R.arenaSicht(st, 0); punkteZeigen(st); st.arena.sieger = sieger; st.arena.grund = text; st.ende = "arena";
      st.log.push({ t: `${text} Siegelpunkte ${st.arena.namen[0]} ${X.P[1]} : ${X.P[2]} ${st.arena.namen[1]} – Sieg für ${st.arena.namen[sieger - 1]}.`, art: "ende", tm: 0 });
    }
    /** Das Ende, das die Arena-Regeln gesetzt haben, zurücknehmen (Auslöschen und Zeit entscheidet hier die Siegel-Schicht) */
    function weiterspielen(st) {
      while (st.log.length && st.log[st.log.length - 1].art === "ende") st.log.pop();
      st.ende = null; st.arena.sieger = null; st.arena.grund = null;
    }
    const sichtStellen = (st) => { if (st.ende) return; const a = R.aktiv(st); R.arenaSicht(st, a ? R.teamVon(st, a) : 0); };
    function aufstehen(st, f) {
      const X = st.riss, e = X.eingang[f.id], p = naechstFrei(st, e.x, e.y, true); if (p) { f.x = p.x; f.y = p.y; }
      f.tp = Math.ceil(f.tpMax / 2); f.tot = false; f.z = {}; delete f.todes; delete X.gefallenIn[f.id]; X.M.rueck++;
    }
    function rundenEnde(st) {
      const X = st.riss, P = X.P, alt = X.runde, a = steht(st, 1), b = steht(st, 2), h = a > b ? 1 : b > a ? 2 : 0, N = st.arena.namen;
      const zeile = { runde: alt, am: [a, b], holt: h, abzug: 0 };
      if (h) { const an2 = 3 - h; if (X.M.halter && X.M.halter !== h) X.M.wechsel++; X.M.halter = h;
        if (P[h] < P[an2]) { X.folge[h]++; if (X.folge[h] >= 2) { P[an2]--; X.folge[h] = 0; X.M.zurueck++; zeile.abzug = an2; sagen(st, `Zurückerobert: ${N[h - 1]} holt das Siegel zwei Runden in Folge. ${N[an2 - 1]} verliert einen Siegelpunkt.`, h === 1 ? "gut" : "schlecht"); } } else X.folge[h] = 0;
        X.folge[an2] = 0; P[h]++;
        sagen(st, `Runde ${alt}: ${N[h - 1]} hält das Siegel (${Math.max(a, b)} gegen ${Math.min(a, b)}) und bekommt einen Siegelpunkt. Stand ${P[1]} : ${P[2]}.`, h === 1 ? "gut" : "schlecht"); }
      else sagen(st, `Runde ${alt}: Niemand hält das Siegel (${a} gegen ${b}). Stand ${P[1]} : ${P[2]}.`, "");
      zeile.stand = [P[1], P[2]]; X.M.runden.push(zeile); punkteZeigen(st);
      if (h && P[h] >= X.ziel) return schluss(st, h, "siegel", `${N[h - 1]} hat ${X.ziel} Siegelpunkte.`, alt);
      if (alt >= X.max) { const l = (t) => helden(st, t).reduce((s, f) => s + Math.max(0, f.tp), 0);
        const s = P[1] !== P[2] ? (P[1] > P[2] ? 1 : 2) : a !== b ? (a > b ? 1 : 2) : l(1) >= l(2) ? 1 : 2;
        return schluss(st, s, "zeit", `Zwölf Runden sind um.`, alt); }
      X.runde = st.runde;
      if ((X.runde - 1) % 2 === 0 && X.runde > 1) { X.ort = (X.ort + 1) % X.orte.length; X.M.spruenge++; sagen(st, "Das Siegel springt auf ein anderes Feld.", ""); }
      for (const tm of [1, 2]) for (const f of helden(st, tm)) { if (lebt(f) || X.gefallenIn[f.id] == null || X.runde - X.gefallenIn[f.id] < 2) continue; aufstehen(st, f); sagen(st, `${f.name} kehrt am eigenen Eingang zurück.`, tm === 1 ? "gut" : "schlecht"); }
    }
    /** Nach jedem Schritt des Finales (bewegen, handeln, Zugende). zugEnde: die ursprüngliche Funktion der Regeln */
    function nach(st, zugEnde) {
      const X = st.riss; if (!X || X.aus) return;
      zugEnde = zugEnde || R.zugEnde;
      for (let n = 0; n < 12; n++) {
        for (const tm of [1, 2]) for (const f of helden(st, tm)) if (!lebt(f) && X.gefallenIn[f.id] == null) X.gefallenIn[f.id] = st.runde;
        if (st.ende) {
          const weg1 = !helden(st, 1).some(lebt), weg2 = !helden(st, 2).some(lebt); weiterspielen(st);
          if (weg1 || weg2) { // Auslöschen: ein Siegelpunkt für den Gegner, die Gruppe steht am eigenen Eingang wieder auf und handelt ab der nächsten Runde
            for (const t of [1, 2]) { if (!(t === 1 ? weg1 : weg2)) continue; const g = 3 - t; if (!(weg1 && weg2)) { X.P[g]++; X.M.aus++; sagen(st, `${st.arena.namen[t - 1]} ist ausgelöscht. ${st.arena.namen[g - 1]} bekommt einen Siegelpunkt. Stand ${X.P[1]} : ${X.P[2]}.`, g === 1 ? "gut" : "schlecht"); }
              for (const f of helden(st, t)) { aufstehen(st, f); X.gesperrt[f.id] = st.runde; } }
            punkteZeigen(st);
            for (const g of [1, 2]) if (X.P[g] >= X.ziel && X.P[g] > X.P[3 - g]) return schluss(st, g, "siegel", `${st.arena.namen[g - 1]} hat ${X.ziel} Siegelpunkte.`);
          }
        }
        if (st.runde !== X.runde) { rundenEnde(st); if (X.aus) return; }
        punkteZeigen(st); sichtStellen(st);
        const a = R.aktiv(st);
        if (a && X.gesperrt[a.id] === st.runde && !st.ende) { zugEnde(st); continue; } // gerade wieder aufgestanden: erst ab der nächsten Runde
        break;
      }
      vor_(st);
    }
    /** Der Rechner im Finale: ein Schritt für den Helden am Zug (wie in der Rechnung: erst das Siegel, dann der beste Zug) */
    function finaleBot(st) {
      const X = st.riss, f = R.aktiv(st), tm = f ? R.teamVon(st, f) : 0, merk = X.merk; if (!f || !tm || st.ende || !BOT) return { typ: "ende" };
      const k = f.id + ":" + st.runde; if (merk.wer !== k) { merk.wer = k; merk.lauf = 0; merk.gelaufen = false; merk.n = 0; }
      merk.staerke = X.botStaerke; if (++merk.n > 12) return { typ: "ende" };
      const S = siegel(st); let w = null;
      if (held(f) && lebt(f)) {
        const feinde = helden(st, 3 - tm).filter((g) => lebt(g) && dist(st, g) <= 1).sort((x, y) => dist(st, x) - dist(st, y) || x.tp - y.tp), wertend = feinde.length, eigene = steht(st, tm);
        const erreicht = (id) => (R.verfuegbar(st, id) ? R.ziele(st, id).filter((z) => feinde.some((g) => g.id === z.id)) : []);
        const vorrang = (l) => l.sort((x, y) => { const gx = feinde.find((g) => g.id === x.id), gy = feinde.find((g) => g.id === y.id); return dist(st, gx) - dist(st, gy) || x.tp - y.tp; })[0];
        const angriffe = R.aktionenVon(f, st).filter((a) => (a.typ || "aktion") === "aktion" && (a.schaden || a.art === "stoss"));
        if (st.zug.aktion && wertend && wertend >= eigene) for (const id of ["schildstoss", "donnerwelle"]) { const z = vorrang(erreicht(id)); if (z) { w = { typ: "aktion", aktion: id, ziel: z.id }; break; } }
        if (!w && !merk.gelaufen && st.zug.bewegung > 0 && !inZone(st, f)) { merk.gelaufen = true;
          const kannVonHier = feinde.length && angriffe.some((a) => erreicht(a.id).length);
          if (eigene <= wertend || !kannVonHier) { let best = null;
            for (const [kk, kosten] of R.erreichbar(st, f, st.zug.bewegung)) { const [x, y] = kk.split(",").map(Number); if (x === f.x && y === f.y) continue; if (st.figuren.some((g) => g !== f && g.tp > 0 && g.x === x && g.y === y)) continue;
              const d = Math.max(Math.abs(x - S.x), Math.abs(y - S.y)), wert = (d <= 1 ? 0 : d) * 100 + kosten; if (!best || wert < best.wert) best = { x, y, wert, d }; }
            if (best && best.d < dist(st, f)) w = { typ: "bewegen", x: best.x, y: best.y }; }
          merk.lauf = 3; }
        if (inZone(st, f)) merk.lauf = 3;
        if (!w) { w = BOT.entscheide(st, merk); if (w.typ === "bewegen") merk.lauf++;
          if (w.typ === "aktion" && feinde.length && !feinde.some((g) => g.id === w.ziel)) { const ziel = st.figuren.find((g) => g.id === w.ziel); if (ziel && held(ziel) && R.teamVon(st, ziel) !== tm) { const z = vorrang(erreicht(w.aktion)); if (z) w = { typ: "aktion", aktion: w.aktion, ziel: z.id }; } } }
      }
      if (!w) { w = BOT.entscheide(st, merk); if (w.typ === "bewegen") merk.lauf++; }
      return w;
    }
    /** Einen Wunsch ausführen (für Rechnungen ohne Bildschirm). Zurück: Fehlertext oder null */
    function finaleZug(st, w) {
      vor_(st); let r = null;
      if (w.typ === "bewegen") r = R.bewegen(st, w.x, w.y); else if (w.typ === "aktion") r = R.handeln(st, w.aktion, w.ziel || R.aktiv(st).id); else R.zugEnde(st);
      if (r && r.fehler) return r.fehler;
      nach(st); return null;
    }
    /** Ein ganzes Finale, von beiden Seiten vom Rechner gespielt (für die Abstimmung) */
    function finaleAuto(seed, W1, W2, o) {
      const st = finaleNeu(seed, W1, W2, o);
      for (let i = 0; i < 9000 && !st.riss.aus; i++) { const w = finaleBot(st); if (finaleZug(st, w)) finaleZug(st, { typ: "ende" }); }
      return st;
    }
    return { RAEUME, folgeLosen, raumVon, saal, aufstellFelder, DING_POOL, SEGEN_POOL, ZIEL, RUNDEN, MIN_RAEUME, MAX_RAEUME, passt, kannTragen, neu, raumOpts, raumDinge, raumEnde, beuteAngebot, beuteNehmen, leben, lebenSchnitt, stufeSchnitt, raumAuto, raumWieder, raumSchritt, botBiegtAb, botWeg,
      startPunkte, finaleNeu, vor: vor_, nach, finaleBot, finaleZug, finaleAuto, siegel, naechstesSiegel, inZone, steht, helden };
  }

  if (typeof module !== "undefined" && module.exports) module.exports = kern;
  else root.ABRISSKERN = kern;
})(typeof window !== "undefined" ? window : globalThis);
