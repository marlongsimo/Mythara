// shared/karte.ts
var KB = 33;
var KH = 20;
var OFFEN = [
  [1, 1, 7, 6],
  // Eingang
  [8, 3, 3, 2],
  [11, 1, 8, 7],
  // Koboldhöhle
  [14, 8, 2, 3],
  [10, 11, 10, 7],
  // Käfernest
  [20, 13, 3, 2],
  [23, 10, 9, 8],
  // Gruft
  [26, 7, 2, 3],
  [21, 1, 11, 6]
  // Siegelkammer
];
var SAEULEN = [[14, 4], [15, 4], [14, 14], [27, 14], [27, 15], [24, 3]];
var FELS = new Uint8Array(KB * KH).fill(1);
for (const [x, y, w, h] of OFFEN) for (let i = x; i < x + w; i++) for (let j = y; j < y + h; j++) FELS[j * KB + i] = 0;
for (const [x, y] of SAEULEN) FELS[y * KB + x] = 1;
var START = [{ x: 3.5, y: 4.5 }, { x: 4.5, y: 5.5 }, { x: 2.5, y: 5.5 }];
var LAGER = [
  { art: "schattenkobold", x: 13.5, y: 2.5 },
  { art: "schattenkobold", x: 16.5, y: 2.5 },
  { art: "schattenkobold", x: 16.5, y: 5.5 },
  { art: "rostkaefer", x: 12.5, y: 14.5 },
  { art: "rostkaefer", x: 16.5, y: 13.5 },
  { art: "rostkaefer", x: 17.5, y: 16.5 },
  { art: "knochenwaechter", x: 25.5, y: 13.5 },
  { art: "knochenwaechter", x: 29.5, y: 12.5 },
  { art: "knochenwaechter", x: 29.5, y: 16.5 },
  { art: "grabritter", x: 28.5, y: 3.5 },
  { art: "knochenwaechter", x: 25.5, y: 2.5 },
  { art: "knochenwaechter", x: 25.5, y: 5.5 }
];
var SIEGEL = { x: 30.5, y: 3.5 };
var fels = (i, j) => i < 0 || j < 0 || i >= KB || j >= KH || FELS[j * KB + i] === 1;
var begehbar = (x, y) => !fels(Math.floor(x), Math.floor(y));
var abstand = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function frei(a, b, rand = 0) {
  const d = abstand(a, b), n = Math.max(1, Math.ceil(d / 0.2)), nx = d > 0 ? -(b.y - a.y) / d : 0, ny = d > 0 ? (b.x - a.x) / d : 0;
  for (let k = 0; k <= n; k++) {
    const x = a.x + (b.x - a.x) * k / n, y = a.y + (b.y - a.y) * k / n;
    if (!begehbar(x, y)) return false;
    if (rand > 0 && (!begehbar(x + nx * rand, y + ny * rand) || !begehbar(x - nx * rand, y - ny * rand))) return false;
  }
  return true;
}
function schieben(e) {
  const i0 = Math.floor(e.x), j0 = Math.floor(e.y);
  for (let i = i0 - 1; i <= i0 + 1; i++) for (let j = j0 - 1; j <= j0 + 1; j++) {
    if (!fels(i, j)) continue;
    const nx = Math.max(i, Math.min(i + 1, e.x)), ny = Math.max(j, Math.min(j + 1, e.y)), dx = e.x - nx, dy = e.y - ny, d = Math.hypot(dx, dy);
    if (d >= e.r) continue;
    if (d > 1e-4) {
      e.x = nx + dx / d * e.r;
      e.y = ny + dy / d * e.r;
    } else {
      e.x = i0 + 0.5;
      e.y = j0 + 0.5;
    }
  }
}
function naechstFrei(p) {
  if (begehbar(p.x, p.y)) return { x: p.x, y: p.y };
  let best = null, bd = Infinity;
  for (let i = 0; i < KB; i++) for (let j = 0; j < KH; j++) {
    if (fels(i, j)) continue;
    const d = Math.hypot(i + 0.5 - p.x, j + 0.5 - p.y);
    if (d < bd) {
      bd = d;
      best = { x: i + 0.5, y: j + 0.5 };
    }
  }
  return best || { x: START[0].x, y: START[0].y };
}
function weg(von, nach, rand = 0.3) {
  const ziel = naechstFrei(nach), start = naechstFrei(von);
  if (frei(start, ziel, rand)) return [ziel];
  const si = Math.floor(start.x), sj = Math.floor(start.y), zi = Math.floor(ziel.x), zj = Math.floor(ziel.y), N = KB * KH;
  const g = new Float32Array(N).fill(Infinity), her = new Int32Array(N).fill(-1), zu = new Uint8Array(N), offen = [];
  const h = (i, j) => {
    const dx = Math.abs(i - zi), dy = Math.abs(j - zj);
    return Math.max(dx, dy) + 0.414 * Math.min(dx, dy);
  };
  const f = new Float32Array(N).fill(Infinity), s0 = sj * KB + si;
  g[s0] = 0;
  f[s0] = h(si, sj);
  offen.push(s0);
  while (offen.length) {
    let bi = 0;
    for (let k2 = 1; k2 < offen.length; k2++) if (f[offen[k2]] < f[offen[bi]]) bi = k2;
    const c = offen[bi];
    offen[bi] = offen[offen.length - 1];
    offen.pop();
    if (zu[c]) continue;
    zu[c] = 1;
    const ci = c % KB, cj = (c - ci) / KB;
    if (ci === zi && cj === zj) break;
    for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
      if (!di && !dj) continue;
      const i = ci + di, j = cj + dj;
      if (fels(i, j)) continue;
      if (di && dj && (fels(ci + di, cj) || fels(ci, cj + dj))) continue;
      const n = j * KB + i, kosten = g[c] + (di && dj ? 1.414 : 1);
      if (kosten < g[n]) {
        g[n] = kosten;
        her[n] = c;
        f[n] = kosten + h(i, j);
        offen.push(n);
      }
    }
  }
  const z0 = zj * KB + zi;
  if (her[z0] < 0 && z0 !== s0) return [];
  const roh = [ziel];
  for (let c = her[z0]; c >= 0 && c !== s0; c = her[c]) roh.push({ x: c % KB + 0.5, y: Math.floor(c / KB) + 0.5 });
  roh.reverse();
  const aus = [];
  let hier = start, k = 0;
  while (k < roh.length) {
    let m = k;
    for (let n = roh.length - 1; n > k; n--) if (frei(hier, roh[n], rand)) {
      m = n;
      break;
    }
    aus.push(roh[m]);
    hier = roh[m];
    k = m + 1;
  }
  return aus;
}
export {
  FELS,
  KB,
  KH,
  LAGER,
  SIEGEL,
  START,
  abstand,
  begehbar,
  fels,
  frei,
  naechstFrei,
  schieben,
  weg
};
