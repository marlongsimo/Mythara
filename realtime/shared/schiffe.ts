/*
 * Riftmere – Schiffslinien (Ausgabe 2; Leitstelle 27.11., Welt #185, Figuren: Schiff kueste_segelschiff, Kapitän npc.kapitaen).
 * Entscheidung des Nutzers (KANON, 27.11.): keine Fahrt an Deck – die Überfahrt ist wie ein Teleport. Kapitän ansprechen, Ziel wählen, Splitter zahlen,
 * Ankunft am Zielsteg (kurze Blende). Das Schiff liegt nur als Kulisse am Steg.
 * Ziele sind nur Häfen, die der Spieler schon besucht hat (Merker hafen_<id>, gesetzt beim ersten Gespräch mit dem Kapitän dort).
 * Fahrpreis 20–60 Splitter nach der Entfernung der Häfen (Luftlinie). Der Server prüft (nah am Kapitän, Ziel bekannt, nicht im Kampf, Questsperre, Splitter),
 * nimmt den Preis und setzt die Stelle am Ziel (wie Wegstein und Fähre).
 */
import HAEFEN_DATEN from "./haefen.json";

export interface Hafen { id: string; name: string; kapitaen: { name: string; x: number; y: number; blick: [number, number] }; schiff: { x: number; y: number; dreh: number };
  /** Region am Kapitän */ region: string; /** wo man nach der Überfahrt steht (Weltfelder) */ ankunft: [number, number] }
export const HAEFEN: Hafen[] = HAEFEN_DATEN.haefen as unknown as Hafen[];
export const hafen = (id: string): Hafen | undefined => HAEFEN.find((h) => h.id === id);

/** So nah muss man am Kapitän stehen (Felder) */
export const KAPITAEN_NAH = 3;
/** Merker im Inventar: diesen Hafen kennt der Spieler */
export const hafenMerker = (id: string): string => "hafen_" + id;
/** Preis: 20 Splitter bis 250 Felder Entfernung, 60 ab 1600, dazwischen gleichmäßig (auf 5 gerundet) */
export const FAHRPREIS = { min: 20, max: 60, kurz: 250, lang: 1600 };

export function entfernung(a: string, b: string): number | null { const A = hafen(a), B = hafen(b); return A && B ? Math.hypot(A.kapitaen.x - B.kapitaen.x, A.kapitaen.y - B.kapitaen.y) : null; }
export function fahrpreis(a: string, b: string): number | null { const L = entfernung(a, b); if (L === null || a === b) return null; const F = FAHRPREIS;
  const t = Math.max(0, Math.min(1, (L - F.kurz) / (F.lang - F.kurz))); return Math.round((F.min + (F.max - F.min) * t) / 5) * 5; }
/** Der Kapitän an dieser Stelle (Weltfelder) */
export function hafenBei(x: number, y: number, weit = KAPITAEN_NAH): Hafen | null { let best: Hafen | null = null, bd = weit;
  for (const h of HAEFEN) { const d = Math.hypot(h.kapitaen.x - x, h.kapitaen.y - y); if (d <= bd) { bd = d; best = h; } } return best; }
/** Ziele ab diesem Hafen für einen Spieler (nur besuchte Häfen) mit Preis */
export function fahrziele(von: string, kennt: (id: string) => boolean): { id: string; name: string; preis: number }[] {
  return HAEFEN.filter((h) => h.id !== von && kennt(h.id)).map((h) => ({ id: h.id, name: h.name, preis: fahrpreis(von, h.id)! })); }
