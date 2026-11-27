/*
 * Die Karte des ersten Risses: ein Raster aus Feldern, Räume und Gänge aus dem Fels geschnitten.
 * Dazu Wegsuche (A*) und Sichtlinien. Reine Rechnung, läuft auf dem Server und im Browser gleich.
 */
export interface Punkt { x: number; y: number }
export interface Lager { art: string; x: number; y: number; gruppe: number; blinzeln?: boolean /* huscht einmal davon, wenn es fast besiegt ist */;
  /** gemeinsame Kampfwelt (alle Regionen in einer Simulation): Aggro, Leine, Streifen und Stufe des Gebiets, aus dem das Lager stammt – sonst gelten die Werte der Karte */ aggro?: number; leine?: number; wandern?: number; stufe?: number;
  /** aus den Gegnerplätzen der Welt (#130, welt/gegnerplaetze.json) – nicht aus einem gebauten Lager */ gp?: number;
  /** #143 Streifgebiet (welt/streifgebiete.json): Rechteck x0, y0, x1, y1 in denselben Einheiten wie x/y – das Tier wandert für sich darin */ streif?: number[] }

export let KB = 33, KH = 20;
/* Räume und Gänge als Rechtecke [x, y, breite, höhe]; alles andere ist Fels */
const OFFEN: number[][] = [
  [1, 1, 7, 6],     // Eingang
  [8, 3, 3, 2],
  [11, 1, 8, 7],    // Koboldhöhle
  [14, 8, 2, 3],
  [10, 11, 10, 7],  // Käfernest
  [20, 13, 3, 2],
  [23, 10, 9, 8],   // Gruft
  [26, 7, 2, 3],
  [21, 1, 11, 6],   // Siegelkammer
];
const SAEULEN: number[][] = [[14, 4], [15, 4], [14, 14], [27, 14], [27, 15], [24, 3]];
export let FELS = new Uint8Array(KB * KH).fill(1);
/** Wasser: versperrt den Weg, aber nicht die Sicht und keine Geschosse */
export let WASSER = new Uint8Array(KB * KH);
for (const [x, y, w, h] of OFFEN) for (let i = x; i < x + w; i++) for (let j = y; j < y + h; j++) FELS[j * KB + i] = 0;
for (const [x, y] of SAEULEN) FELS[y * KB + x] = 1;

export let START: Punkt[] = [{ x: 3.5, y: 4.5 }, { x: 4.5, y: 5.5 }, { x: 2.5, y: 5.5 }];
/* Zwölf Knochenwächter in fünf Gruppen zu zwei bis drei. Wer einen aus einer Gruppe weckt, weckt die ganze Gruppe. */
export let LAGER: Lager[] = [
  { art: "knochenwaechter", x: 15.5, y: 2.5, gruppe: 1 }, { art: "knochenwaechter", x: 17.5, y: 4.5, gruppe: 1 },
  { art: "knochenwaechter", x: 12.5, y: 14.5, gruppe: 2 }, { art: "knochenwaechter", x: 13.5, y: 16.5, gruppe: 2 }, { art: "knochenwaechter", x: 17.5, y: 15.5, gruppe: 2 },
  { art: "knochenwaechter", x: 29.5, y: 12.5, gruppe: 3 }, { art: "knochenwaechter", x: 29.5, y: 15.5, gruppe: 3 }, { art: "knochenwaechter", x: 26.5, y: 16.5, gruppe: 3 },
  { art: "knochenwaechter", x: 22.5, y: 1.5, gruppe: 4 }, { art: "knochenwaechter", x: 22.5, y: 3.5, gruppe: 4 },
  { art: "knochenwaechter", x: 30.5, y: 1.5, gruppe: 5 }, { art: "knochenwaechter", x: 31.5, y: 5.5, gruppe: 5 }, { art: "knochenfuerst", x: 27.5, y: 4.5, gruppe: 6 },
];
export const SIEGEL: Punkt = { x: 30.5, y: 3.5 };

/* Jede Simulation hat ihre eigene Karte. Die Wegsuche und die Prüfungen unten lesen die Variablen oben; eine Simulation setzt deshalb vor jedem Schritt ihre Karte ein (karteNehmen).
   Das ist sicher, weil Node alles nacheinander rechnet: So kann der Server Riss und Kampagnenkämpfe gleichzeitig führen. */
/** Schleuse der Karte in Rechenfeldern (siehe karten.ts), oder keine */
export interface SchleuseStand { x: number; y: number; quellen: Punkt[]; art: string; takt: number; erst: number; max: number; gesamt: number }
export let SCHLEUSE: SchleuseStand | null = null;
/** Herausforderung eines Kampfes (für den dritten Stern): Schleuse bis Sekunde wert zu · kein Held vom Spezialangriff getroffen · mindestens wert Schützlinge heil */
export interface Probe { text: string; art: "schleuse" | "ausweichen" | "schuetzlinge"; wert?: number }
export let PROBE: Probe | null = null;
/** Schützlinge: Dinge, die die Gegner angreifen und die man beschützt (Kornsäcke, später Kahn und Kinder) */
export let SCHUETZ: Lager[] = [];
/** Ab welchem Abstand Monster angreifen und wie weit sie ihrem Lager folgen (Rechenfelder); null = Grundwerte aus config (AGGRO, LEINE) */
export let AGGRO: number | null = null, LEINE: number | null = null;
/** Gegner ohne Ziel streifen um ihr Lager (Radius in Rechenfeldern); 0 = sie stehen still */
export let WANDERN = 0;
/** Mehrkampf-Gebiete [x0, y0, x1, y1] in Rechenfeldern: dort dürfen viele gegen viele kämpfen. Sonst gilt in der offenen Welt Einzelkampf (einer gegen einen). */
export let MEHRKAMPF: number[][] = [];
export interface KartenStand { KB: number; KH: number; FELS: typeof FELS; WASSER: typeof WASSER; START: Punkt[]; LAGER: Lager[]; SCHLEUSE: SchleuseStand | null; PROBE: Probe | null; SCHUETZ: Lager[]; AGGRO: number | null; LEINE: number | null; WANDERN: number; MEHRKAMPF: number[][] }
export const karteJetzt = (): KartenStand => ({ KB, KH, FELS, WASSER, START, LAGER, SCHLEUSE, PROBE, SCHUETZ, AGGRO, LEINE, WANDERN, MEHRKAMPF });
export function karteNehmen(k: KartenStand): void { KB = k.KB; KH = k.KH; FELS = k.FELS; WASSER = k.WASSER; START = k.START; LAGER = k.LAGER; SCHLEUSE = k.SCHLEUSE; PROBE = k.PROBE; SCHUETZ = k.SCHUETZ; AGGRO = k.AGGRO ?? null; LEINE = k.LEINE ?? null; WANDERN = k.WANDERN || 0; MEHRKAMPF = k.MEHRKAMPF || []; }
/** Die Karte des Risses, wie sie beim Start gilt */
export const GRUNDKARTE: KartenStand = karteJetzt();

export const fels = (i: number, j: number): boolean => i < 0 || j < 0 || i >= KB || j >= KH || FELS[j * KB + i] === 1 || WASSER[j * KB + i] === 1;
/** Versperrt die Sicht? Nur Fels, Wasser nicht. */
const dicht = (x: number, y: number): boolean => { const i = Math.floor(x), j = Math.floor(y); return i < 0 || j < 0 || i >= KB || j >= KH || FELS[j * KB + i] === 1; };

/** Eine andere Karte einsetzen (Kampagnen). Zeilen als Text: „.“ frei, „~“ Wasser, alles andere Hindernis.
 *  Die Karte gilt für alle Simulationen dieses Programms – auf dem Server läuft deshalb bisher nur der Riss mit der Grundkarte. */
export function setzeKarte(k0: { zeilen: string[]; start: number[][]; lager: Lager[]; schleuse?: { x: number; y: number; quellen: number[][]; art: string; takt: number; erst: number; max: number; gesamt: number }; probe?: Probe; schuetz?: Lager[]; aggro?: number; leine?: number; wandern?: number; mehrkampf?: number[][]; feinZeilen?: boolean }, mal = 1): void {
  /* mal: so viele Rechenfelder je gemaltem Feld. Die gemalten Karten sind klein (12 × 9); mit mal 2 passen Reichweiten und Lauftempo zum Bild. */
  /* feinZeilen: das Raster ist schon in Rechenfeldern angegeben (große Karten wie der Waldweg), nur Positionen werden umgerechnet */
  const zm = k0.feinZeilen ? 1 : mal;
  const k = { zeilen: k0.zeilen.flatMap((z) => { const breit = [...z].map((c) => c.repeat(zm)).join(""); return Array.from({ length: zm }, () => breit); }), start: k0.start, lager: k0.lager.map((l) => ({ ...l, x: l.x * mal, y: l.y * mal, ...(l.streif ? { streif: l.streif.map((v) => v * mal) } : {}) })) };
  KH = k.zeilen.length; KB = k.zeilen[0].length; FELS = new Uint8Array(KB * KH); WASSER = new Uint8Array(KB * KH);
  k.zeilen.forEach((z, j) => [...z].forEach((c, i) => { if (c === "~") WASSER[j * KB + i] = 1; else if (c !== ".") FELS[j * KB + i] = 1; }));
  START = k.start.map(([x, y]) => ({ x: (x + 0.5) * mal, y: (y + 0.5) * mal })); LAGER = k.lager;
  AGGRO = k0.aggro ?? null; LEINE = k0.leine ?? null; WANDERN = k0.wandern || 0; MEHRKAMPF = k0.mehrkampf || []; PROBE = k0.probe || null; SCHUETZ = (k0.schuetz || []).map((l) => ({ ...l, x: l.x * mal, y: l.y * mal }));
  const s = k0.schleuse; SCHLEUSE = s ? { ...s, x: s.x * mal, y: s.y * mal, quellen: s.quellen.map(([x, y]) => ({ x: x * mal, y: y * mal })) } : null;
}
export const begehbar = (x: number, y: number): boolean => !fels(Math.floor(x), Math.floor(y));
export const abstand = (a: Punkt, b: Punkt): number => Math.hypot(a.x - b.x, a.y - b.y);

/** Freie Linie von a nach b? rand: halbe Breite dessen, was hindurch soll (0 = Sichtlinie). */
export function frei(a: Punkt, b: Punkt, rand = 0): boolean {
  const d = abstand(a, b), n = Math.max(1, Math.ceil(d / 0.2)), nx = d > 0 ? -(b.y - a.y) / d : 0, ny = d > 0 ? (b.x - a.x) / d : 0;
  for (let k = 0; k <= n; k++) { const x = a.x + (b.x - a.x) * k / n, y = a.y + (b.y - a.y) * k / n;
    if (rand > 0 ? !begehbar(x, y) : dicht(x, y)) return false; // Sichtlinie (rand 0) geht über Wasser hinweg
    if (rand > 0 && (!begehbar(x + nx * rand, y + ny * rand) || !begehbar(x - nx * rand, y - ny * rand))) return false; }
  return true;
}

/** Einen Kreis aus dem Fels schieben (nach einer Bewegung) */
export function schieben(e: { x: number; y: number; r: number }): void {
  const i0 = Math.floor(e.x), j0 = Math.floor(e.y);
  for (let i = i0 - 1; i <= i0 + 1; i++) for (let j = j0 - 1; j <= j0 + 1; j++) { if (!fels(i, j)) continue;
    const nx = Math.max(i, Math.min(i + 1, e.x)), ny = Math.max(j, Math.min(j + 1, e.y)), dx = e.x - nx, dy = e.y - ny, d = Math.hypot(dx, dy);
    if (d >= e.r) continue;
    if (d > 1e-4) { e.x = nx + dx / d * e.r; e.y = ny + dy / d * e.r; }
    else { e.x = i0 + 0.5; e.y = j0 + 0.5; } } // mitten im Fels: zurück in die Mitte des letzten freien Feldes
}

/** Das nächste begehbare Feld zu einem Punkt (falls jemand in den Fels klickt) */
export function naechstFrei(p: Punkt): Punkt {
  if (begehbar(p.x, p.y)) return { x: p.x, y: p.y };
  let best: Punkt | null = null, bd = Infinity;
  if (KB * KH > GROSS) { /* große Karte (gemeinsame Kampfwelt): erst in der Nähe suchen, nicht über alle Felder */
    const ci = Math.floor(p.x), cj = Math.floor(p.y), R = 48;
    for (let i = Math.max(0, ci - R); i <= Math.min(KB - 1, ci + R); i++) for (let j = Math.max(0, cj - R); j <= Math.min(KH - 1, cj + R); j++) { if (fels(i, j)) continue; const d = Math.hypot(i + 0.5 - p.x, j + 0.5 - p.y); if (d < bd) { bd = d; best = { x: i + 0.5, y: j + 0.5 }; } }
    if (best) return best; }
  for (let i = 0; i < KB; i++) for (let j = 0; j < KH; j++) { if (fels(i, j)) continue; const d = Math.hypot(i + 0.5 - p.x, j + 0.5 - p.y); if (d < bd) { bd = d; best = { x: i + 0.5, y: j + 0.5 }; } }
  return best || { x: START[0].x, y: START[0].y };
}

/** Ab so vielen Feldern gilt eine Karte als groß (die gemeinsame Kampfwelt): Wegsuche und Suche nach freien Feldern nur in einem Fenster */
const GROSS = 400000;
/** Wegsuche auf großen Karten: A* nur im Rechteck um Start und Ziel (mit Rand), mit Vorrangliste – sonst würde jede Suche Millionen Felder anlegen.
 *  Findet sich im Fenster kein Weg, wird es einmal vergrößert. Ergebnis wie bei weg(). */
function wegFenster(start: Punkt, ziel: Punkt, rand: number, felder: boolean): Punkt[] {
  const si = Math.floor(start.x), sj = Math.floor(start.y), zi = Math.floor(ziel.x), zj = Math.floor(ziel.y);
  for (const M of [24, 72]) {
    const x0 = Math.max(0, Math.min(si, zi) - M), y0 = Math.max(0, Math.min(sj, zj) - M), x1 = Math.min(KB - 1, Math.max(si, zi) + M), y1 = Math.min(KH - 1, Math.max(sj, zj) + M), B = x1 - x0 + 1, N = B * (y1 - y0 + 1);
    const idx = (i: number, j: number) => (j - y0) * B + (i - x0), zu0 = (i: number, j: number) => i < x0 || j < y0 || i > x1 || j > y1 || fels(i, j);
    const g = new Float32Array(N).fill(Infinity), her = new Int32Array(N).fill(-1), zu = new Uint8Array(N);
    const h = (i: number, j: number) => { const dx = Math.abs(i - zi), dy = Math.abs(j - zj); return Math.max(dx, dy) + (felder ? 0.001 : 0.414) * Math.min(dx, dy); };
    /* Vorrangliste (binärer Haufen) nach f, mit dem f-Wert beim Einfügen (Doppelte werden über „zu“ übersprungen) */
    const hn: number[] = [], hf: number[] = [];
    const rein = (n: number, v: number) => { let k = hn.length; hn.push(n); hf.push(v); while (k > 0) { const e = (k - 1) >> 1; if (hf[e] <= v) break; hn[k] = hn[e]; hf[k] = hf[e]; k = e; } hn[k] = n; hf[k] = v; };
    const nimm = (): number => { const top = hn[0], ln = hn.pop()!, lf = hf.pop()!; const n = hn.length; if (n) { let k = 0; for (;;) { const l = 2 * k + 1, r = l + 1; let m = -1, fm = lf; if (l < n && hf[l] < fm) { m = l; fm = hf[l]; } if (r < n && hf[r] < fm) m = r; if (m < 0) break; hn[k] = hn[m]; hf[k] = hf[m]; k = m; } hn[k] = ln; hf[k] = lf; } return top; };
    const s0 = idx(si, sj), z0 = idx(zi, zj); g[s0] = 0; rein(s0, h(si, sj));
    while (hn.length) { const c = nimm(); if (zu[c]) continue; zu[c] = 1; const ci = (c % B) + x0, cj = Math.floor(c / B) + y0; if (ci === zi && cj === zj) break;
      for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) { if (!di && !dj) continue; const i = ci + di, j = cj + dj; if (zu0(i, j)) continue;
        if (di && dj && (zu0(ci + di, cj) || zu0(ci, cj + dj))) continue;
        const n = idx(i, j), kosten = g[c] + (di && dj ? (felder ? 1.001 : 1.414) : 1); if (kosten < g[n]) { g[n] = kosten; her[n] = c; rein(n, kosten + h(i, j)); } } }
    if (her[z0] < 0 && z0 !== s0) continue;
    const roh: Punkt[] = [ziel]; for (let c = her[z0]; c >= 0 && c !== s0; c = her[c]) roh.push({ x: (c % B) + x0 + 0.5, y: Math.floor(c / B) + y0 + 0.5 }); roh.reverse();
    if (felder) return roh;
    const aus: Punkt[] = []; let hier = start, k = 0;
    while (k < roh.length) { let m = k; for (let n = roh.length - 1; n > k; n--) if (frei(hier, roh[n], rand)) { m = n; break; } aus.push(roh[m]); hier = roh[m]; k = m + 1; }
    return aus; }
  return [];
}

/** Wegsuche A* über die Felder, acht Richtungen, nicht um Ecken schneiden. Zurück: Wegpunkte (ohne den Start), geglättet. */
export function weg(von: Punkt, nach: Punkt, rand = 0.3, felder = false): Punkt[] {
  /* felder: Feldbewegung (shared/feld.ts) – der Weg geht über die Feldmitten, ohne Glätten; ein schräger Schritt kostet wie ein gerader */
  const z0p = naechstFrei(nach), start = naechstFrei(von), ziel = felder ? { x: Math.floor(z0p.x) + 0.5, y: Math.floor(z0p.y) + 0.5 } : z0p;
  if (!felder && frei(start, ziel, rand)) return [ziel];
  if (KB * KH > GROSS) return wegFenster(start, ziel, rand, felder);
  const si = Math.floor(start.x), sj = Math.floor(start.y), zi = Math.floor(ziel.x), zj = Math.floor(ziel.y), N = KB * KH;
  const g = new Float32Array(N).fill(Infinity), her = new Int32Array(N).fill(-1), zu = new Uint8Array(N), offen: number[] = [];
  const h = (i: number, j: number) => { const dx = Math.abs(i - zi), dy = Math.abs(j - zj); return Math.max(dx, dy) + (felder ? 0.001 : 0.414) * Math.min(dx, dy); };
  const f = new Float32Array(N).fill(Infinity), s0 = sj * KB + si; g[s0] = 0; f[s0] = h(si, sj); offen.push(s0);
  while (offen.length) {
    let bi = 0; for (let k = 1; k < offen.length; k++) if (f[offen[k]] < f[offen[bi]]) bi = k;
    const c = offen[bi]; offen[bi] = offen[offen.length - 1]; offen.pop(); if (zu[c]) continue; zu[c] = 1;
    const ci = c % KB, cj = (c - ci) / KB; if (ci === zi && cj === zj) break;
    for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) { if (!di && !dj) continue; const i = ci + di, j = cj + dj; if (fels(i, j)) continue;
      if (di && dj && (fels(ci + di, cj) || fels(ci, cj + dj))) continue;
      const n = j * KB + i, kosten = g[c] + (di && dj ? (felder ? 1.001 : 1.414) : 1); if (kosten < g[n]) { g[n] = kosten; her[n] = c; f[n] = kosten + h(i, j); offen.push(n); } }
  }
  const z0 = zj * KB + zi; if (her[z0] < 0 && z0 !== s0) return [];
  const roh: Punkt[] = [ziel]; for (let c = her[z0]; c >= 0 && c !== s0; c = her[c]) roh.push({ x: (c % KB) + 0.5, y: Math.floor(c / KB) + 0.5 }); roh.reverse();
  if (felder) return roh;
  // glätten: von der aktuellen Stelle aus immer den fernsten Punkt nehmen, zu dem der Weg frei ist
  const aus: Punkt[] = []; let hier = start, k = 0;
  while (k < roh.length) { let m = k; for (let n = roh.length - 1; n > k; n--) if (frei(hier, roh[n], rand)) { m = n; break; } aus.push(roh[m]); hier = roh[m]; k = m + 1; }
  return aus;
}
