/*
 * Riftmere – Kartensymbole aus den Spieldaten (Issue #34): Fanggründe, Bindestein und Taverne stehen nicht in den Weltdaten (welt/bibliothek/kartensymbole.json),
 * sondern ergeben sich aus den Systemen. Minikarte und Weltkarte zeigen sie zusätzlich zu den Symbolen der Welt. Bilder: img/karte/symbole/<kennung>.webp (Figuren, #33).
 */
import { FANGGRUENDE } from "./fischen";
import { WERKSTAETTEN } from "./handwerk";

export interface KartenSymbol { s: string; x: number; y: number; region: string }
const mitte = (f: [number, number][]) => [f.reduce((s, p) => s + p[0], 0) / f.length, f.reduce((s, p) => s + p[1], 0) / f.length];
export const SPIEL_SYMBOLE: KartenSymbol[] = [
  ...FANGGRUENDE.map((g) => { const [x, y] = mitte(g.felder); return { s: "fanggrund", x, y, region: g.region }; }),
  ...WERKSTAETTEN.filter((W) => W.station === "bindestein").map((W) => ({ s: "bindestein", x: W.x, y: W.y, region: W.ort })),
  /* Taverne der Waldmark: an der Tür (Hilde Krug steht davor; Quest „Die Taverne öffnet“) */
  { s: "taverne", x: 6428, y: 6430.8, region: "waldmark" },
];
export const SPIEL_SYMBOL_NAMEN: Record<string, string> = { fanggrund: "Fanggrund", bindestein: "Bindestein", taverne: "Taverne" };
