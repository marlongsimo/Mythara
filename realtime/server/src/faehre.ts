/*
 * Riftmere – Fähre auf dem Server (Phase 7, Issue #49; Regeln und Daten: shared/faehre.ts). welt.ts ruft faehreAnfrage für { t: "faehre", id }
 * und setzt bei ok die Stelle wie beim Wegstein (teleportZiel) – der Browser zeigt die Überfahrt und springt.
 */
import { faehreBei, ankunft, FAEHRE_DAUER, FAEHREN, type Faehre, type Anleger } from "../../shared/faehre";

export interface FaehreWer { nutzer: string; gast: boolean; wx?: number; wy?: number }
export interface FaehrePruefer { schalter: (nutzer: string, id: string) => boolean; imKampf: (nutzer: string) => boolean; gesperrt: (nutzer: string, region: string) => boolean }
export type FaehreAntwort = { ok: false; text: string } | { ok: true; f: Faehre; von: Anleger; nach: Anleger; x: number; y: number; region: string; dauer: number };
/** Darf dieser Spieler jetzt übersetzen? id: die Fähre, die der Browser meint (optional) */
export function faehreAnfrage(s: FaehreWer, id: unknown, P: FaehrePruefer, liste: Faehre[] = FAEHREN): FaehreAntwort {
  if (s.wx === undefined || s.wy === undefined) return { ok: false, text: "Hier legt keine Fähre an." };
  const F = faehreBei(s.wx, s.wy, undefined, liste); if (!F || (id !== undefined && String(id) !== F.f.id)) return { ok: false, text: "Geh näher an den Anleger." };
  if (s.gast || !P.schalter(s.nutzer, F.f.schalter) || P.gesperrt(s.nutzer, F.nach.region)) return { ok: false, text: F.f.nein }; /* der Fährmann sagt, warum nicht */
  if (P.imKampf(s.nutzer)) return { ok: false, text: "Mitten im Kampf legt keine Fähre ab." };
  const z = ankunft(F.nach); return { ok: true, f: F.f, von: F.von, nach: F.nach, x: z.x, y: z.y, region: F.nach.region, dauer: F.f.dauer ?? FAEHRE_DAUER }; }
