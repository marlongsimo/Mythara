/*
 * World Pipeline – die Form des Ostufers (Phase 7, #42): ein gewachsener Kessel östlich des grauen Flusses, ringsum ein Felsgrat mit Geröll.
 * Gemeinsam genutzt von graufurt.mjs (Grat am Ostufer des Flusses) und ostufer.mjs (Grat, Inneres, Festland außen), damit der Grat über
 * die Regionsgrenze hinweg in einem Zug läuft. Alles in Weltfeldern.
 *   abstand(x, y): vorzeichenbehafteter Abstand zum Kesselrand (innen negativ)
 *   art(x, y):     "F" auf dem Grat, "g" im Geröllsaum, "innen", "aussen"
 * Der Grat ist überall mindestens 3,5 Felder breit, so dass niemand zu Fuß hinüberkommt (Test welt-graufurt).
 */
const X0 = 6656, Y0 = 6400, B = 256, H = 352;                 /* Gitter: Graufurt + Ostufer */
const MX = 6806, MY = 6578, AX = 80, AY = 150, P = 3;
const welle = (x, y) => Math.sin(x / 3.1 + y / 4.3) + 0.6 * Math.sin(y / 2.3 - x / 5.1);
const sanft = (x, y, s) => Math.sin(x / (7 * s) + y / (11 * s) + 1.3) * Math.sin(y / (9 * s) - x / (13 * s)) + 0.5 * Math.sin((x + 2 * y) / (5 * s));
const norm = (x, y) => { const dx = (x - MX) / AX, dy = (y - MY) / AY, w = Math.atan2(dy, dx);
  const r = Math.pow(Math.abs(dx) ** P + Math.abs(dy) ** P, 1 / P); return r / (1 + 0.07 * Math.sin(3 * w + 1) + 0.05 * Math.sin(7 * w + 2) + 0.025 * Math.sin(17 * w)); };
/* Maske und Abstandsfeld (Chamfer 3-4) */
const innen = new Uint8Array(B * H); for (let j = 0; j < H; j++) for (let i = 0; i < B; i++) innen[j * B + i] = norm(X0 + i + 0.5, Y0 + j + 0.5) < 1 ? 1 : 0;
const feld = (wert) => { const d = new Float32Array(B * H).fill(1e9); for (let k = 0; k < B * H; k++) if (innen[k] === wert) d[k] = 0;
  for (let j = 0; j < H; j++) for (let i = 0; i < B; i++) { const k = j * B + i; if (i > 0) d[k] = Math.min(d[k], d[k - 1] + 3); if (j > 0) { d[k] = Math.min(d[k], d[k - B] + 3); if (i > 0) d[k] = Math.min(d[k], d[k - B - 1] + 4); if (i < B - 1) d[k] = Math.min(d[k], d[k - B + 1] + 4); } }
  for (let j = H - 1; j >= 0; j--) for (let i = B - 1; i >= 0; i--) { const k = j * B + i; if (i < B - 1) d[k] = Math.min(d[k], d[k + 1] + 3); if (j < H - 1) { d[k] = Math.min(d[k], d[k + B] + 3); if (i < B - 1) d[k] = Math.min(d[k], d[k + B + 1] + 4); if (i > 0) d[k] = Math.min(d[k], d[k + B - 1] + 4); } }
  return d; };
const zuInnen = feld(1), zuAussen = feld(0);
export function abstand(x, y) { const i = Math.max(0, Math.min(B - 1, Math.floor(x - X0))), j = Math.max(0, Math.min(H - 1, Math.floor(y - Y0))), k = j * B + i;
  return innen[k] ? -(zuAussen[k] / 3) + 0.5 : zuInnen[k] / 3 - 0.5; }
/** Breite des Grats nach innen und außen (Vor- und Rücksprünge) */
const breiteInnen = (x, y) => 1.8 + 1.6 * (1 + sanft(x, y, 1)) * 0.5 + 0.6 * Math.abs(Math.sin(x / 2.7 + y / 3.3));
const breiteAussen = (x, y) => 1.7 + 2.4 * (1 + sanft(y, x, 1.4)) * 0.5 + 0.5 * Math.abs(Math.sin(y / 2.9 - x / 3.7));
/** Phase 9 (#74): der Pass im Südosten – hier läuft das Ostufer offen in die Glutsande aus (offene Welt; die Fähre bleibt die Abkürzung) */
export const PASS = [[6856, 6682], [6878, 6706], [6904, 6730], [6916, 6738]];
const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy || 1))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };
export const passWeg = (x, y) => strecke(x, y, PASS) < 1.1;   /* der Weg selbst, ohne Rauschen (bündig zum Festland, glutsande.mjs) */
export const amPass = (x, y, r = 2.4) => strecke(x, y, PASS) < r + 0.4 * Math.sin(x / 2.3 + y / 3.1);
export function art(x, y) { const d = abstand(x, y), bi = breiteInnen(x, y), ba = breiteAussen(x, y), w = welle(x, y);
  if (amPass(x, y) && d > -bi - 4 && d < ba + 4) return "pass";
  if (d > -bi && d < ba) return "F";
  if (d >= ba && d < ba + 2.2 + 1.6 * (1 + sanft(x, y, 0.6)) * 0.5 && w > -0.9) return "g";
  if (d <= -bi && d > -bi - 1.8 - 1.8 * (1 + sanft(y, x, 0.7)) * 0.5 && w > -0.7) return "g";
  return d < 0 ? "innen" : "aussen"; }
/** Höhe (in Feldern) des Grats und seines Saums, für hoehen.json (nur 3D) */
export function hoehe(x, y) { if (amPass(x, y, 5)) return 0.3 * Math.max(0, strecke(x, y, PASS) - 2.5); const d = abstand(x, y), bi = breiteInnen(x, y), ba = breiteAussen(x, y), mitte = (ba - bi) / 2, halb = (ba + bi) / 2 + 3;
  const t = Math.max(0, 1 - Math.abs(d - mitte) / halb); return 2.6 * t * t * (0.75 + 0.25 * sanft(x, y, 0.8)); }
/** Punkte entlang der Gratmitte, etwa alle `schritt` Felder (für Felsobjekte) */
export function gratPunkte(schritt = 6) { const aus = []; for (let j = 0; j < H; j += 1) for (let i = 0; i < B; i += 1) { const x = X0 + i + 0.5, y = Y0 + j + 0.5;
  if (Math.abs(abstand(x, y) - (breiteAussen(x, y) - breiteInnen(x, y)) / 2) < 0.5 && !amPass(x, y, 5) && !aus.some(([a, b]) => Math.hypot(a - x, b - y) < schritt)) aus.push([x, y]); } return aus; }
