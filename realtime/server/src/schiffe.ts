/*
 * Riftmere – Schiffslinien auf dem Server (Ausgabe 2; Regeln und Daten: shared/schiffe.ts). welt.ts ruft für { t: "schiff" }:
 *  – tat "ziele": am Kapitän – der Hafen gilt ab jetzt als besucht (Merker hafen_<id>), Antwort: die bekannten Ziele mit Preis;
 *  – tat "fahren", nach: prüfen, Preis nehmen, Stelle am Ziel setzen (wie Wegstein und Fähre); der Browser blendet kurz ab und springt.
 */
import { hafenBei, fahrziele, hafen, hafenMerker, fahrpreis, type Hafen } from "../../shared/schiffe";

export interface SchiffWer { nutzer: string; gast: boolean; wx?: number; wy?: number }
export interface SchiffPruefer { kennt: (nutzer: string, merker: string) => boolean; merken: (nutzer: string, merker: string) => void; imKampf: (nutzer: string) => boolean;
  bezahlen: (nutzer: string, splitter: number) => string | null; gesperrt: (nutzer: string, region: string) => boolean }
export type SchiffAntwort = { ok: false; text: string }
  | { ok: true; tat: "ziele"; von: string; kapitaen: string; ziele: { id: string; name: string; preis: number }[]; neu: boolean }
  | { ok: true; tat: "fahren"; von: Hafen; nach: Hafen; preis: number; x: number; y: number; region: string };

export function schiffAnfrage(s: SchiffWer, e: { tat?: unknown; nach?: unknown }, P: SchiffPruefer): SchiffAntwort {
  if (s.gast) return { ok: false, text: "Schiffsreisen gibt es mit Konto." };
  const H = s.wx !== undefined && s.wy !== undefined ? hafenBei(s.wx, s.wy) : null; if (!H) return { ok: false, text: "Geh näher zum Kapitän." };
  const kennt = (id: string) => P.kennt(s.nutzer, hafenMerker(id));
  if (e.tat === "ziele") { const neu = !kennt(H.id); if (neu) P.merken(s.nutzer, hafenMerker(H.id));
    return { ok: true, tat: "ziele", von: H.id, kapitaen: H.kapitaen.name, ziele: fahrziele(H.id, kennt), neu }; }
  if (e.tat !== "fahren") return { ok: false, text: "Das geht hier nicht." };
  const N = hafen(String(e.nach || "")); if (!N || N.id === H.id) return { ok: false, text: "Dorthin fahre ich nicht." };
  if (!kennt(N.id)) return { ok: false, text: `${N.name}? Den Hafen kennst du noch nicht – erst einmal hinreisen, dann bringe ich dich.` };
  const preis = fahrpreis(H.id, N.id); if (preis === null) return { ok: false, text: "Dorthin fahre ich nicht." };
  if (P.gesperrt(s.nutzer, N.region)) return { ok: false, text: `Nach ${N.name} darf ich dich noch nicht bringen.` };
  if (P.imKampf(s.nutzer)) return { ok: false, text: "Mitten im Kampf legt kein Schiff ab." };
  if (!kennt(H.id)) P.merken(s.nutzer, hafenMerker(H.id));
  const f = P.bezahlen(s.nutzer, preis); if (f) return { ok: false, text: f };
  return { ok: true, tat: "fahren", von: H, nach: N, preis, x: N.ankunft[0], y: N.ankunft[1], region: N.region }; }
