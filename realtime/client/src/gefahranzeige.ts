/*
 * Riftmere – Stufe und Gefahrenfarbe eines Gegners für den eigenen Helden (#98, Entscheidung des Nutzers):
 * die Stufe aus den Werten (shared/config stufeVon – in der Quest-Fassung mit ihrem geminderten Höchstleben),
 * die Farbe aus der Kampfschätzung (shared/gefahr): grün leicht · gelb machbar · orange gefährlich · rot tödlich.
 */
import { stufeVon } from "../../shared/config";
import { gefahr, GEFAHR_GRENZEN, type Gefahr } from "../../shared/gefahr";
import { meineKampfwerte } from "./skills";

export const GEFAHR_FARBE: Record<Gefahr, string> = { gruen: "#5fe35f", gelb: "#ffe14a", orange: "#ff9a2e", rot: "#ff4a3a" };
const OHNE = "#ffe7b0";
export interface GegnerLv { stufe: number; farbe: string; gefahr: Gefahr | null; /** „leicht“ … „tödlich“ */ text: string }
/** typ: Gegnerart; max: Höchstleben aus dem Schnappschuss (Quest-Fassung: gemindert) */
export function gegnerLv(typ: string, max?: number): GegnerLv {
  const stufe = stufeVon(typ, max && max > 1 ? max : undefined), kw = meineKampfwerte(), g = kw ? gefahr(kw, typ, max && max > 1 ? { lp: max } : {}) : null;
  return { stufe, gefahr: g, farbe: g ? GEFAHR_FARBE[g] : OHNE, text: g ? GEFAHR_GRENZEN.find((x) => x.stufe === g)!.text : "" }; }
