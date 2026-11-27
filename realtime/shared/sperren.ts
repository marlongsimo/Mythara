/*
 * Riftmere – Welt-Sperren (#185/#186, doku/konzepte/welt-erlebnis.md): der Bergsturz am Hals des Drachenarms und der Schneesturm vor der Frostkrone.
 * Die Sperrstücke der Welt tragen ausbau_bis = drachenarm_frei bzw. frostkrone_frei (Stadtstufen, shared/stadtstufen.ts): sie verschwinden je Spieler, sobald eine Quest
 * den Schalter setzt. Die Stellen hier aus welt/sperren.json (Welt 6d0ebf7a) – für den Hinweis beim Anlaufen und das Wetter (Schneesturm, client/src/welt3d/wetter3d.ts).
 */
export interface WeltSperre { id: string; name: string; /** Schalter, der die Sperre aufhebt (gleichnamige Stadtstufe) */ schalter: string; /** Felder der Sperre (Weltfelder) */ punkte: [number, number][]; /** Linie statt einzelner Felder (Sturm) */ linie?: boolean; /** so breit (Felder) wirkt der Sturm */ breite?: number; /** Hinweis im Chat beim Anlaufen */ text: string }
export const WELT_SPERREN: WeltSperre[] = [
  { id: "drachenarm", name: "Bergsturz am Drachenarm", schalter: "drachenarm_frei", punkte: [[8018, 6013], [8017, 6014], [8016, 6015], [8015, 6016], [8000, 6027], [7999, 6028], [7998, 6029], [7997, 6030], [7996, 6031], [7995, 6032]], text: "Felsen versperren den Hals des Drachenarms." },
  { id: "frostkrone", name: "Schneesturm vor der Frostkrone", schalter: "frostkrone_frei", linie: true, breite: 12, punkte: [[7104, 5333], [7089, 5348], [7074, 5363], [7059, 5378], [7044, 5393], [7029, 5408], [7014, 5423], [6999, 5438], [6984, 5453], [6969, 5468], [6954, 5483], [6939, 5498], [6924, 5513], [6909, 5528], [6894, 5543], [6879, 5558], [6864, 5573], [6849, 5588], [6834, 5603], [6819, 5618], [6804, 5633], [6789, 5648], [6763, 5646]], text: "Der Schneesturm treibt dich zurück." },
];
/** Abstand eines Punkts (Weltfelder) zur Sperre: zum nächsten Feld bzw. zur Linie */
export function sperrAbstand(S: WeltSperre, x: number, y: number): number { let best = Infinity; const P = S.punkte;
  if (!S.linie) { for (const [a, b] of P) best = Math.min(best, Math.hypot(a + 0.5 - x, b + 0.5 - y)); return best; }
  for (let i = 0; i + 1 < P.length; i++) { const [ax, ay] = P[i], [bx, by] = P[i + 1], dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l));
    best = Math.min(best, Math.hypot(ax + dx * t - x, ay + dy * t - y)); } return best; }
/** Stärke des Schneesturms an dieser Stelle (0 … 1): voll innerhalb der halben Breite, dann bis zum Doppelten auslaufend */
export function sturmStaerke(S: WeltSperre, x: number, y: number): number { if (!S.breite) return 0; const d = sperrAbstand(S, x, y), h = S.breite / 2;
  return d <= h ? 1 : d >= S.breite * 2 ? 0 : 1 - (d - h) / (S.breite * 2 - h); }
