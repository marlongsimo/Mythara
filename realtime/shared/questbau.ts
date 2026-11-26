/*
 * Riftmere – Quest-Baukasten (Fahrplan Phase 1, 26.11.2026).
 *
 * Eine Quest ist eine Datei mit Daten (shared/quests/*.ts): Figuren, Schritte, Dialoge, Sperren, Belohnung. Dieser Motor rechnet daraus –
 * auf dem Server und im Browser gleich –, was eine Figur sagt, was eine Antwort bewirkt, was im Questlog steht, wohin der Pfeil zeigt und
 * ob ein Schritt erledigt ist. Neue Quests brauchen keinen eigenen Code mehr, nur eine neue Datei.
 *
 * Stand (Migration 045, rpg_held.quests[id].s – höchstens 24 Zeichen aus a–z, 0–9, _):
 *   ""            noch nicht angenommen
 *   "auftrag_N"   angenommen; N = Bitmaske der erledigten Schritte (Bit i = schritte[i])
 *   "fertig"      abgeschlossen (nur über rpg_held_quest_abschluss)
 * Quest 03 hatte schon dieses Format – ihre gespeicherten Stände gelten unverändert weiter.
 */

export interface Zeile { wer: string; text: string }
export interface Antwort { id: string; text: string }
export interface Dialog { npc: string; name: string; zeilen: Zeile[]; antworten: Antwort[] }

/** Eine Figur der Quest (Weltfelder) */
export interface QuestFigur { id: string; name: string; modell: string; x: number; y: number; blick: [number, number]; /** Gesprächsweite (Felder), sonst REDE_WEIT */ weit?: number }

/** Was einen Schritt erledigt */
export type Ereignis =
  | { art: "sammeln"; ziel: string }          /* ein Sammelziel abgebaut (Holz, Bergbau – shared/holz.ts, bergbau.ts) */
  | { art: "herstellen"; rezept: string }     /* ein Rezept hergestellt (shared/handwerk.ts) */
  | { art: "erlegen"; typ: string }           /* ein Gegner besiegt */
  | { art: "antwort" };                       /* nur über eine Dialogantwort (erledige) */

export interface Schritt {
  id: string;
  /** kurz, für Questlog-Verlauf und Chat („… – erledigt“) */ text: string;
  /** der Satz im Questlog, solange dieser Schritt der nächste ist */ log: string;
  ereignis: Ereignis;
  /** erst, wenn diese Schritte erledigt sind (sonst sofort möglich) */ nach?: string[];
  /** wohin der Pfeil zeigt: Weltfeld oder benannte Stelle (orte beim Aufruf, z. B. "esse") */ wo?: [number, number] | string;
}

/** Bedingung (alle Teile müssen gelten) */
export interface Bed {
  phase?: Phase[];
  /** diese Schritte sind erledigt */ erledigt?: string[];
  /** diese Schritte sind offen */ offen?: string[];
  /** alle Schritte erledigt */ alle?: boolean;
  /** der Spieler trägt diesen Gegenstand bei sich (Rucksack oder angelegt) */ hat?: string;
  /** … oder hat ihn nirgends mehr (auch nicht in der Bank) */ verloren?: string;
}
export type Phase = "neu" | "laeuft" | "fertig";

/** Was eine Antwort bewirkt */
export interface Folge {
  zeilen: string[];
  /** Quest annehmen */ start?: boolean;
  /** Schritte als erledigt setzen */ erledige?: string[];
  /** alle Schritte wieder offen (z. B. nach Verlust) */ vonVorn?: boolean;
  /** Quest abschließen (Belohnung, genau einmal) */ abschluss?: boolean;
  /** danach weiter im Gespräch (Begrüßung neu) */ weiter?: boolean;
  /** Gegenstände geben */ geben?: Geben[];
  /** wenn geben nichts zu geben hatte: diese Zeilen statt zeilen */ nichtsZuGeben?: string[];
}
export interface Geben { g: string; /** Text in „(Du bekommst: …)“ */ name: string; /** nur, wenn der Spieler ihn (oder Gleichwertiges) nicht besitzt */ fehlt?: boolean; /** Regex: gleichwertige Gegenstände zählen als vorhanden */ gleich?: string; /** nur, wenn verloren (nirgends mehr) */ verloren?: boolean }

export interface Option { id: string; text: string; /** sichtbar nur, wenn */ wenn?: Bed; /** die erste passende Variante gilt */ folge: { wenn?: Bed; f: Folge }[] }
/** Was die Figur zur Begrüßung sagt (die erste passende gilt) und welche Antworten es gibt */
export interface Rede { wenn?: Bed; zeilen: string[]; antworten: string[] }

/** Sperre an einem Sammelziel oder Rezept: Text, warum es (noch) nicht geht – null = erlaubt */
export interface Sperre { wenn: Bed; text: string }

export interface QuestDef {
  id: string; titel: string; ort: string;
  /** Questlog: „So startest du“ */ start: string;
  /** Questlog vor dem Annehmen und nach dem Abschluss */ logNeu: string; logFertig: string;
  /** Questlog, wenn alle Schritte erledigt sind (zur Abgabe) */ logAbgabe: string;
  /** Wer die Quest gibt und abnimmt */ geber: string;
  figuren: QuestFigur[];
  schritte: Schritt[];
  /** Dialoge je Figur */ dialoge: Record<string, { reden: Rede[]; optionen: Option[] }>;
  /** Sammelziele und Rezepte, die nur mit der Quest gehen (die erste passende Sperre gilt) */
  sperren?: { sammeln?: Record<string, Sperre[]>; herstellen?: Record<string, Sperre[]> };
  /** Text für das Questlog */ belohnungText: string;
  /** XP je Skill (Kampf) – gebucht mit rpg_held_quest_abschluss */ belohnung?: Partial<Record<"geschick" | "staerke" | "fernkampf" | "magie" | "lp" | "defense", number>>;
}

/* ───────── Stand ───────── */
export interface Lage { phase: Phase; bits: number }
const MUSTER = /^auftrag_(\d{1,10})$/;
export function lage(q: QuestDef, s: string): Lage { if (s === "fertig") return { phase: "fertig", bits: (1 << q.schritte.length) - 1 };
  const m = MUSTER.exec(s || ""); if (m) { const b = Number(m[1]); if (b < 1 << q.schritte.length) return { phase: "laeuft", bits: b }; } return { phase: "neu", bits: 0 }; }
export const stand = (l: Lage): string => (l.phase === "laeuft" ? `auftrag_${l.bits}` : l.phase === "fertig" ? "fertig" : "");
/** Gespeicherten Stand prüfen (Unbekanntes wird zu "") */
export const gueltig = (q: QuestDef, s: unknown): string => (typeof s === "string" ? stand(lage(q, s)) : "");
export const laeuft = (q: QuestDef, s: string): boolean => lage(q, s).phase === "laeuft";
const bit = (q: QuestDef, id: string): number => { const i = q.schritte.findIndex((x) => x.id === id); return i < 0 ? 0 : 1 << i; };
export const erledigt = (q: QuestDef, s: string, id: string): boolean => (lage(q, s).bits & bit(q, id)) !== 0;
const alleBits = (q: QuestDef) => (1 << q.schritte.length) - 1;
/** Ist ein Schritt jetzt möglich (angenommen, offen, Vorgänger erledigt)? */
export function moeglich(q: QuestDef, s: string, id: string): boolean { const l = lage(q, s), S = q.schritte.find((x) => x.id === id); if (!S || l.phase !== "laeuft" || l.bits & bit(q, id)) return false;
  return (S.nach || []).every((n) => (l.bits & bit(q, n)) !== 0); }

/** Was der Motor über den Spieler wissen muss (der Server weiß es, der Browser rechnet nur Questlog und Pfeil) */
export interface Kontext { hat(g: string): boolean; verloren(g: string): boolean }
const OHNE: Kontext = { hat: () => false, verloren: () => false };
export function gilt(q: QuestDef, s: string, b: Bed | undefined, k: Kontext = OHNE): boolean { if (!b) return true; const l = lage(q, s);
  if (b.phase && !b.phase.includes(l.phase)) return false;
  if (b.erledigt && !b.erledigt.every((id) => l.bits & bit(q, id))) return false;
  if (b.offen && !b.offen.every((id) => !(l.bits & bit(q, id)))) return false;
  if (b.alle !== undefined && b.alle !== (l.bits === alleBits(q))) return false;
  if (b.hat && !k.hat(b.hat)) return false;
  if (b.verloren && !k.verloren(b.verloren)) return false;
  return true; }

/* ───────── Dialog ───────── */
const figur = (q: QuestDef, id: string) => q.figuren.find((f) => f.id === id);
/** Begrüßung und Antworten einer Figur */
export function dialog(q: QuestDef, npc: string, s: string, k: Kontext): Dialog | null { const F = figur(q, npc), D = q.dialoge[npc]; if (!F || !D) return null;
  const r = D.reden.find((x) => gilt(q, s, x.wenn, k)); if (!r) return null;
  const antworten = r.antworten.map((id) => D.optionen.find((o) => o.id === id)).filter((o): o is Option => Boolean(o) && gilt(q, s, o!.wenn, k)).map((o) => ({ id: o.id, text: o.text }));
  return { npc, name: F.name, zeilen: r.zeilen.map((text) => ({ wer: F.name, text })), antworten }; }
/** Was eine Antwort bewirkt (null: gibt es hier nicht). Nur Antworten, die die aktuelle Begrüßung anbietet, zählen. */
export function antwort(q: QuestDef, npc: string, s: string, a: string, k: Kontext): Folge | null { const D = q.dialoge[npc]; if (!D) return null;
  const angeboten = dialog(q, npc, s, k); if (!angeboten || !angeboten.antworten.some((x) => x.id === a)) return null;
  const o = D.optionen.find((x) => x.id === a); const v = o && o.folge.find((x) => gilt(q, s, x.wenn, k)); return v ? v.f : null; }
/** Den Stand nach einer Folge (ohne Abschluss – der geht über die Datenbank) */
export function nachFolge(q: QuestDef, s: string, f: Folge): string { let l = lage(q, s);
  if (f.start && l.phase === "neu") l = { phase: "laeuft", bits: 0 };
  if (f.vonVorn && l.phase === "laeuft") l = { phase: "laeuft", bits: 0 };
  if (f.erledige && l.phase === "laeuft") for (const id of f.erledige) l = { ...l, bits: l.bits | bit(q, id) };
  return stand(l); }

/* ───────── Schritte durch Ereignisse ───────── */
const passt = (e: Ereignis, x: Ereignis) => e.art === x.art && (e.art === "sammeln" ? e.ziel === (x as typeof e).ziel : e.art === "herstellen" ? e.rezept === (x as typeof e).rezept : e.art === "erlegen" ? e.typ === (x as typeof e).typ : false);
/** Ein Ereignis ist geschehen: neuer Stand (oder derselbe) */
export function ereignis(q: QuestDef, s: string, e: Ereignis): string { let l = lage(q, s); if (l.phase !== "laeuft") return s;
  for (const S of q.schritte) if (passt(S.ereignis, e) && moeglich(q, stand(l), S.id)) l = { ...l, bits: l.bits | bit(q, S.id) }; return stand(l); }
/** Sperre eines Sammelziels oder Rezepts: Text oder null (erlaubt). Ohne Eintrag: nicht Teil dieser Quest (undefined). */
export function sperre(q: QuestDef, art: "sammeln" | "herstellen", id: string, s: string, k: Kontext = OHNE): string | null | undefined {
  const L = q.sperren && q.sperren[art] && q.sperren[art]![id]; if (!L) return undefined; const x = L.find((p) => gilt(q, s, p.wenn, k)); return x ? x.text : null; }

/* ───────── Questlog und Pfeil ───────── */
export function naechster(q: QuestDef, s: string): Schritt | null { const l = lage(q, s); if (l.phase !== "laeuft") return null; return q.schritte.find((x) => moeglich(q, s, x.id)) || null; }
/** Der Satz „Was jetzt?“ im Questlog */
export function questlog(q: QuestDef, s: string): string { const l = lage(q, s); if (l.phase === "neu") return q.logNeu; if (l.phase === "fertig") return q.logFertig;
  if (l.bits === alleBits(q)) return q.logAbgabe; const m = q.schritte.filter((x) => moeglich(q, s, x.id)); return m.length ? m.map((x) => x.log).join(" ") : q.logAbgabe; } /* alle gerade möglichen Schritte */
/** Erledigte Schritte (Text, in Reihenfolge) */
export const erledigteSchritte = (q: QuestDef, s: string): string[] => { const l = lage(q, s); return l.phase === "neu" ? [] : q.schritte.filter((x) => l.bits & bit(q, x.id)).map((x) => x.text); };
/** Schritte, die zwischen zwei Ständen erledigt wurden (für die Meldung im Chat) */
export const neuErledigt = (q: QuestDef, alt: string, neu: string): Schritt[] => { const a = lage(q, alt), n = lage(q, neu); if (n.phase !== "laeuft" || a.phase !== "laeuft") return []; return q.schritte.filter((x) => n.bits & bit(q, x.id) && !(a.bits & bit(q, x.id))); };
/** Wohin der Pfeil zeigt: Figur-ID, Weltfeld oder null */
export function ziel(q: QuestDef, s: string, orte: Record<string, [number, number]> = {}): string | [number, number] | null { const l = lage(q, s);
  if (l.phase === "neu") return q.geber; if (l.phase === "fertig") return null; const n = naechster(q, s); if (!n || !n.wo) return q.geber;
  return typeof n.wo === "string" ? orte[n.wo] || q.geber : n.wo; }
/** Zeichen über der Figur: „!“ (Quest zu haben), „?“ (Abgabe), sonst null */
export function zeichen(q: QuestDef, s: string, npc: string): "!" | "?" | null { if (npc !== q.geber) return null; const l = lage(q, s); return l.phase === "neu" ? "!" : l.phase === "laeuft" && l.bits === alleBits(q) ? "?" : null; }
