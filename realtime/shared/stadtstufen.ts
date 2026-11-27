/*
 * Riftmere – Stadtstufen (Phase 8, Issue #102; Welt #50): eine Stadt wächst je Spieler in Stufen (Grauwacht: verlassen → abtei → burg).
 * Objekte der Welt tragen „ausbau“ (zeigt sich ab dieser Stufe) bzw. „ausbau_bis“ (verschwindet mit dieser Stufe), Questfiguren dieselben Felder.
 * Die Stufe eines Spielers ist die höchste, deren Schalter für ihn an ist (QuestDef.schalter; die erste Stufe gilt immer).
 * Was gezeigt wird, entscheidet der Browser je Spieler (3D-Dinge, Gehraster, Figuren); der Server lässt Figuren mit falscher Stufe nicht ansprechen.
 * Kollision: Objekte mit Stufe stehen nicht im gebackenen Gehraster, sondern als eigene Sperrfelder je Chunk (ChunkDaten.ausbau) – sie sperren nur, solange sie da sind.
 */
export interface Stadt { id: string; name: string; /** in Reihenfolge; schalter fehlt bei der ersten */ stufen: { id: string; schalter?: string }[] }
/** Schalternamen sind ein Vorschlag – die Quests (E-Reihe) setzen sie über QuestDef.schalter */
export const STAEDTE: Stadt[] = [
  { id: "grauwacht", name: "Grauwacht", stufen: [{ id: "verlassen" }, { id: "abtei", schalter: "grauwacht_abtei" }, { id: "burg", schalter: "grauwacht_burg" }] },
];
const JE_STUFE = new Map<string, { stadt: Stadt; i: number }>(); for (const s of STAEDTE) s.stufen.forEach((x, i) => JE_STUFE.set(x.id, { stadt: s, i }));
/** Die Stufe (Index) einer Stadt für einen Spieler */
export function stufeVon(stadt: Stadt, an: (schalter: string) => boolean): number { let n = 0; stadt.stufen.forEach((x, i) => { if (!x.schalter || an(x.schalter)) n = Math.max(n, i); }); return n; }
/** Ist etwas mit ausbau (ab) / ausbau_bis (bis) für diesen Spieler da? Unbekannte Stufen: immer da (ein Tippfehler versteckt nichts) */
export function ausbauDa(ab: string | undefined, bis: string | undefined, an: (schalter: string) => boolean): boolean {
  if (ab) { const A = JE_STUFE.get(ab); if (A && stufeVon(A.stadt, an) < A.i) return false; }
  if (bis) { const B = JE_STUFE.get(bis); if (B && stufeVon(B.stadt, an) >= B.i) return false; }
  return true; }
/** Kurzform für gebackene Daten: „ab|bis“ (leer, wenn nichts) */
export const ausbauMarke = (ab?: string, bis?: string): string => (ab || bis ? `${ab || ""}|${bis || ""}` : "");
export const markeDa = (m: string | undefined, an: (schalter: string) => boolean): boolean => { if (!m) return true; const [a, b] = m.split("|"); return ausbauDa(a || undefined, b || undefined, an); };
/** Schlüssel der Stufen aller Städte (ändert er sich, baut der Browser neu) */
export const stufenSchluessel = (an: (schalter: string) => boolean): string => STAEDTE.map((s) => stufeVon(s, an)).join(",");
