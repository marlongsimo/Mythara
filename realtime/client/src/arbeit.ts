/*
 * Riftmere – die eigene Arbeit für die anderen (Issue #67, shared/arbeit.ts): Holz, Bergbau, Angeln (sammeln3d.ts) und Handwerk (handwerk3d.ts)
 * melden hier, was der Held gerade tut; welt.ts schickt es mit der Stelle an den Server. Ein Schlag gilt ARBEIT_HALTEN_MS, Angeln bis zum Ende.
 */
import { type Arbeit, arbeitSchluessel, ARBEIT_HALTEN_MS, ANGELN_HALTEN_MS } from "../../shared/arbeit";
let jetzt: Arbeit | null = null, bis = 0;
/** Der Held arbeitet (ein Schlag, ein Werkstück, Angeln beginnt oder ein Fang); null = hört auf */
export function arbeitMelden(w: Arbeit | null): void { jetzt = w; bis = w ? performance.now() + (w.a === "angeln" ? ANGELN_HALTEN_MS : ARBEIT_HALTEN_MS) : 0; }
/** Was gerade gilt (oder nichts) */
export function arbeitJetzt(): Arbeit | null { if (jetzt && performance.now() > bis) jetzt = null; return jetzt; }
export const arbeitKey = (): string => arbeitSchluessel(arbeitJetzt() || undefined);
/* Die Arbeit der anderen (aus der Spielerliste der Welt, welt.ts „spieler“) – nach Namen, auch für Helden im Kampfgebiet */
const fremd = new Map<string, Arbeit>();
export function fremdeArbeit(l: { n: string; w?: Arbeit }[]): void { fremd.clear(); for (const d of l) if (d.w) fremd.set(d.n, d.w); }
export const arbeitVon = (name: string): Arbeit | undefined => fremd.get(name);
