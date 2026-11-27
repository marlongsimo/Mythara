/*
 * Riftmere – Schiffslinien (Ausgabe 2; Leitstelle 27.11., Welt #185, Figuren: Schiff kueste_segelschiff, Kapitän npc.kapitaen).
 * An jedem Hafen steht ein Kapitän; er fährt zu jedem Hafen, den der Spieler schon besucht hat (Merker hafen_<id>, gesetzt beim ersten Gespräch dort).
 * Fahrpreis 20–60 Splitter nach der Länge des Seewegs. Die Überfahrt läuft ohne Ladebildschirm: der Held steht an Deck, das Schiff segelt den Seeweg
 * (shared/seewege.json, gebaut von werkzeug/seewege.py aus dem Gehraster) – der Browser lädt die Welt unterwegs nach.
 * Der Server prüft (nah am Kapitän, Ziel bekannt, nicht im Kampf, Splitter), nimmt den Preis und setzt die Stelle am Ziel (wie Wegstein und Fähre).
 */
import HAEFEN_DATEN from "./haefen.json";
import SEEWEGE from "./seewege.json";

export interface Hafen { id: string; name: string; kapitaen: { name: string; x: number; y: number; blick: [number, number] }; schiff: { x: number; y: number; dreh: number };
  /** aus seewege.json: Region am Kapitän und wo man nach der Fahrt steht */ region: string; ankunft: [number, number] }
const ZUSATZ = SEEWEGE.haefen as unknown as Record<string, { region: string; ankunft: [number, number] | null }>;
export const HAEFEN: Hafen[] = (HAEFEN_DATEN.haefen as Omit<Hafen, "region" | "ankunft">[]).map((h) => {
  const z = ZUSATZ[h.id]; return { ...h, region: (z && z.region) || "", ankunft: (z && z.ankunft) || [h.kapitaen.x, h.kapitaen.y + 1] }; });
export const hafen = (id: string): Hafen | undefined => HAEFEN.find((h) => h.id === id);

/** So nah muss man am Kapitän stehen (Felder) */
export const KAPITAEN_NAH = 3;
/** Merker im Inventar: diesen Hafen kennt der Spieler */
export const hafenMerker = (id: string): string => "hafen_" + id;
/** Preis: 20 Splitter bis 250 Felder Seeweg, 60 ab 2600, dazwischen gleichmäßig (auf 5 gerundet) */
export const FAHRPREIS = { min: 20, max: 60, kurz: 250, lang: 2600 };
/** Dauer der Überfahrt (s): 20 s Grundzeit + 1 s je 60 Felder, höchstens 60 s (lange Wege segeln schneller) */
export const FAHRT = { grund: 20, jeFelder: 60, max: 60 };

/** Der Seeweg von a nach b (Wegpunkte, Weltfelder, vom Liegeplatz a zum Liegeplatz b) oder null */
export function seeweg(a: string, b: string): [number, number][] | null {
  const W = SEEWEGE.wege as unknown as Record<string, [number, number][]>; const v = W[`${a}|${b}`]; if (v) return v.map((p) => [p[0], p[1]]);
  const r = W[`${b}|${a}`]; return r ? r.map((p) => [p[0], p[1]] as [number, number]).reverse() : null; }
export const weglaenge = (p: [number, number][]): number => p.reduce((s, q, i) => (i ? s + Math.hypot(q[0] - p[i - 1][0], q[1] - p[i - 1][1]) : 0), 0);
export function fahrpreis(a: string, b: string): number | null { const p = seeweg(a, b); if (!p) return null; const L = weglaenge(p), F = FAHRPREIS;
  const t = Math.max(0, Math.min(1, (L - F.kurz) / (F.lang - F.kurz))); return Math.round((F.min + (F.max - F.min) * t) / 5) * 5; }
export function fahrtDauer(a: string, b: string): number { const p = seeweg(a, b); if (!p) return 0; return Math.min(FAHRT.max, FAHRT.grund + weglaenge(p) / FAHRT.jeFelder); }
/** Der Kapitän an dieser Stelle (Weltfelder) */
export function hafenBei(x: number, y: number, weit = KAPITAEN_NAH): Hafen | null { let best: Hafen | null = null, bd = weit;
  for (const h of HAEFEN) { const d = Math.hypot(h.kapitaen.x - x, h.kapitaen.y - y); if (d <= bd) { bd = d; best = h; } } return best; }
/** Ziele ab diesem Hafen für einen Spieler (nur besuchte Häfen) mit Preis und Dauer */
export function fahrziele(von: string, kennt: (id: string) => boolean): { id: string; name: string; preis: number; dauer: number }[] {
  return HAEFEN.filter((h) => h.id !== von && kennt(h.id)).map((h) => ({ id: h.id, name: h.name, preis: fahrpreis(von, h.id)!, dauer: Math.round(fahrtDauer(von, h.id)) }))
    .filter((z) => z.preis !== null && z.dauer > 0); }
/** Wo das Schiff nach t Sekunden der Fahrt ist (sanft an- und ablegen): Stelle und Fahrtrichtung */
export function schiffBei(p: [number, number][], dauer: number, t: number): { x: number; y: number; dx: number; dy: number } {
  const L = weglaenge(p), u = Math.max(0, Math.min(1, t / dauer)), a = 0.1, /* Trapez: 10 % anfahren, 10 % abbremsen */
    f = u < a ? (u * u) / (2 * a * (1 - a)) : u > 1 - a ? 1 - ((1 - u) * (1 - u)) / (2 * a * (1 - a)) : (u - a / 2) / (1 - a), s = L * f;
  let rest = Math.max(0, Math.min(L, s));
  for (let i = 1; i < p.length; i++) { const [ax, ay] = p[i - 1], [bx, by] = p[i], l = Math.hypot(bx - ax, by - ay);
    if (rest <= l || i === p.length - 1) { const k = l ? Math.min(1, rest / l) : 0; return { x: ax + (bx - ax) * k, y: ay + (by - ay) * k, dx: (bx - ax) / (l || 1), dy: (by - ay) / (l || 1) }; } rest -= l; }
  return { x: p[0][0], y: p[0][1], dx: 0, dy: -1 }; }
