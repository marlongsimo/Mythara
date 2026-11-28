/*
 * Riftmere – Gefahr eines Gegners für DIESEN Helden (Entscheidung des Nutzers, KANON 9360e367b, doku/konzepte/gegnerstufen.md Variante A):
 * neben der errechneten Stufe eine Farbe. Geschätzt aus dem Kampf selbst – mit denselben Regeln wie shared/sim.ts:
 *   Trefferchance (trefferChance: Angriffswurf gegen Verteidigungswurf) × mittlerer Schaden (1 … Max Hit) je Sekunde, für beide Seiten,
 *   daraus die erwartete Zeit bis zum Sieg und bis zum eigenen Tod (ohne Essen, ohne Ausweichen).
 * Verhältnis = Zeit bis zum Sieg / Zeit bis zum Tod: klein = leicht. Großangriffe der Bosse (Mechanik) zählen nicht – sie kann man meiden.
 * Rein rechnerisch, Server und Browser gleich; die Anzeige baut Oberfläche (#98).
 */
import { MONSTER } from "./config";
import { gegnerWerte, trefferChance, type Kampfwerte, type Art } from "./kampfwerte";

export type Gefahr = "gruen" | "gelb" | "orange" | "rot";
/** Grenzen des Verhältnisses (Zeit bis zum Sieg / Zeit bis zum eigenen Tod) – Vorschlag, Freigabe beim Nutzer */
export const GEFAHR_GRENZEN: { stufe: Gefahr; bis: number; text: string }[] = [
  { stufe: "gruen", bis: 0.2, text: "leicht" }, { stufe: "gelb", bis: 0.5, text: "machbar" }, { stufe: "orange", bis: 1, text: "gefährlich" }, { stufe: "rot", bis: Infinity, text: "tödlich" }];

export interface KampfSchaetzung { /** s bis zum Sieg / bis zum eigenen Tod (Infinity: trifft nie) */ sieg: number; tod: number; verhaeltnis: number;
  /** je Seite: Trefferchance, mittlerer Schaden je Treffer, Schaden je Sekunde */ held: { chance: number; schaden: number; dps: number }; gegner: { chance: number; schaden: number; dps: number } }

/** Schätzung für Held (Kampfwerte) gegen eine Gegnerart; lp: sein Höchstleben (Quest-Fassung), abwehrMal / schadenMal: Quest-Fassung eines Bosses */
export function kampfSchaetzung(kw: Kampfwerte, art: string, o: { lp?: number; abwehrMal?: number; schadenMal?: number } = {}): KampfSchaetzung | null {
  const M = MONSTER[art]; if (!M || !M.v2) return null;
  const hArt = kw.waffe.art as Art, gArt = (M.angriff && (M.angriff.art === "fern" || M.angriff.art === "magie") ? M.angriff.art : "nah") as Art;
  const G = gegnerWerte(M.v2, gArt), lp = o.lp ?? M.lp;
  const hc = trefferChance(kw.angriff[hArt], (G.abwehr[hArt] ?? 0) * (o.abwehrMal ?? 1)), wid = (M.widerstand && M.widerstand[hArt as keyof typeof M.widerstand]) ?? 1;
  const hs = ((kw.waffe.schaden[0] + kw.waffe.schaden[1]) / 2 + (kw.waffe.plus || 0)) * wid, hdps = (hc * hs) / Math.max(0.1, kw.waffe.takt);
  const gc = trefferChance(G.treffer, kw.abwehr[gArt]), gs = ((1 + G.maxHit) / 2) * (o.schadenMal ?? 1), gdps = (gc * gs) / Math.max(0.1, M.v2.ticks * 0.5);
  const sieg = hdps > 0 ? lp / hdps : Infinity, tod = gdps > 0 ? kw.max / gdps : Infinity;
  return { sieg, tod, verhaeltnis: tod === Infinity ? 0 : sieg / tod, held: { chance: hc, schaden: hs, dps: hdps }, gegner: { chance: gc, schaden: gs, dps: gdps } }; }

/** Die Farbe für diesen Helden gegen diese Gegnerart (Gegner ohne Werte: null – dann nur die Stufe zeigen) */
export function gefahr(kw: Kampfwerte, art: string, o: { lp?: number; abwehrMal?: number; schadenMal?: number } = {}): Gefahr | null {
  const S = kampfSchaetzung(kw, art, o); if (!S) return null; return GEFAHR_GRENZEN.find((g) => S.verhaeltnis < g.bis)!.stufe; }
