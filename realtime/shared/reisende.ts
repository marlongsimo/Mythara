/*
 * Riftmere – Reisende (Süden #126, doku/konzepte/sueden.md „Leute unterwegs“): ein Händler und zwei Wanderer gehen die Südstraße auf und ab,
 * auf festen Wegpunkten (Weltfelder, aus dem Wegenetz der Welt), ohne Kampf, nur zur Stimmung. Die Stelle hängt nur von der Uhr ab
 * (alle sehen sie gleich, ohne Server): hin, an den Halten warten, zurück. Der Browser zeigt sie als 3D-Figuren (welt3d/npc3d.ts).
 */
export interface Reise { id: string; /** Modell (img/figuren-echt3d) */ datei: string; /** Wegpunkte (Weltfelder) */ punkte: [number, number][];
  /** an diesen Wegpunkten (Index) so viele Sekunden stehen bleiben */ halte: Record<number, number>; /** Felder je Sekunde */ tempo: number; /** Versatz in Sekunden (nicht alle zugleich) */ versatz: number; /** zieht diesen Karren hinter sich her (Modell, Pfad ab Spielwurzel) */ karren?: string }
/** Die Südstraße von Weidenhain bis Kielmund (Kreuzungen und Rastplatz aus wegenetz.mjs) */
export const SUEDSTRASSE: [number, number][] = [[6444.5, 6762], [6450.5, 6840], [6456.5, 6904], [6461.5, 6960], [6466, 7008], [6467.5, 7050], [6470, 7092], [6467, 7160], [6461.5, 7230], [6449.5, 7270], [6439.5, 7286]]; /* Straßenmitte (Welt-Abgleich #126); Halt am Halben Weg auf der Kreuzung, nicht auf dem Wegweiser */
const HALBER_WEG = 4;
export const REISENDE: Reise[] = [
  /* der Händler mit seinem Karren: steht lange am Rastplatz „Halber Weg“ (Trödler-Platz) */
  { id: "haendler_sued", datei: "npc.haendler_sued", punkte: SUEDSTRASSE, halte: { 0: 30, [HALBER_WEG]: 240, [SUEDSTRASSE.length - 1]: 30 }, tempo: 0.9, versatz: 0, karren: "img/objekte3d/troedler/karren.glb" /* der Karren des Trödlers (#88) */ },
  { id: "wanderer_sued", datei: "npc.wanderer", punkte: SUEDSTRASSE, halte: { 0: 20, [HALBER_WEG]: 40, [SUEDSTRASSE.length - 1]: 20 }, tempo: 1.2, versatz: 400 },
  { id: "wanderin_sued", datei: "npc.wanderin", punkte: SUEDSTRASSE, halte: { 0: 20, 6: 30, [SUEDSTRASSE.length - 1]: 20 }, tempo: 1.1, versatz: 900 },
];
/** Wo ist der Reisende zur Zeit t (Sekunden)? x, y und Blick (dx, dy); steht: wartet an einem Halt */
export function reiseStelle(R: Reise, t: number): { x: number; y: number; dx: number; dy: number; steht: boolean } {
  const P = R.punkte, n = P.length, stuecke: { a: number; b: number; dauer: number; halt: boolean }[] = [];
  const folge = [...P.keys(), ...[...P.keys()].reverse().slice(1, -1)]; /* hin und zurück, als Kreis */
  for (let i = 0; i < folge.length; i++) { const a = folge[i], b = folge[(i + 1) % folge.length]; const h = R.halte[a] || 0; if (h) stuecke.push({ a, b: a, dauer: h, halt: true });
    stuecke.push({ a, b, dauer: Math.hypot(P[b][0] - P[a][0], P[b][1] - P[a][1]) / R.tempo, halt: false }); }
  const runde = stuecke.reduce((s, x) => s + x.dauer, 0); let r = (((t + R.versatz) % runde) + runde) % runde;
  for (const S of stuecke) { if (r > S.dauer) { r -= S.dauer; continue; } const [ax, ay] = P[S.a], [bx, by] = P[S.b], f = S.dauer ? r / S.dauer : 0;
    return { x: ax + (bx - ax) * f, y: ay + (by - ay) * f, dx: bx - ax, dy: by - ay, steht: S.halt }; }
  return { x: P[0][0], y: P[0][1], dx: 0, dy: 1, steht: true }; void n; }
