/*
 * Riftmere – Quest-Baukasten (Fahrplan Phase 1, 26.11.2026).
 *
 * Eine Quest ist eine Datei mit Daten (shared/quest0N.ts, alle eingetragen in shared/quests.ts): Figuren, Schritte, Dialoge, Questobjekte,
 * Sperren, bedingte Beute, Voraussetzungen, Belohnung. Dieser Motor rechnet daraus – auf dem Server und im Browser gleich –, was eine Figur
 * sagt, was eine Antwort bewirkt, was im Questlog steht, wohin der Pfeil zeigt und ob ein Schritt erledigt ist.
 *
 * Stand (Migration 045, rpg_held.quests[id].s – höchstens 24 Zeichen aus a–z, 0–9, _):
 *   ""                 noch nicht angenommen
 *   "angeboten"        angeboten und (vorerst) abgelehnt – zählt wie „noch nicht angenommen“
 *   "auftrag_N[_Z…]"   angenommen; N = Bitmaske der erledigten Schritte (Bit i = schritte[i]); Z = Zähler der Schritte mit „anzahl“, in ihrer Reihenfolge
 *   "fertig"           abgeschlossen (nur über rpg_held_quest_abschluss)
 * Ältere Formate übersetzt die Quest selbst (QuestDef.alt) – beim Laden, gespeicherte Stände bleiben gültig.
 */

export interface Zeile { wer: string; text: string }
export interface Antwort { id: string; text: string }
export interface Dialog { npc: string; name: string; zeilen: Zeile[]; antworten: Antwort[] }
/** Eine Zeile im Gespräch: Text der Figur, oder { wer, text } für andere Sprecher („Du“, eine zweite Wache) */
export type Text = string | Zeile;

/** So nah muss man stehen, um zu reden (Felder) */
export const REDE_WEIT = 3.5;
/** Eine Figur der Quest (Weltfelder) */
export interface QuestFigur { id: string; name: string; modell: string; x: number; y: number; blick: [number, number];
  /** Gesprächsweite (Felder), sonst REDE_WEIT */ weit?: number; /** geht umher (Modell des Wanderers in der Welt, z. B. der Bürgermeister im Rathaus) */ wandert?: string;
  /** tritt beiseite, wenn (z. B. die Wachen, sobald der Weg frei ist): um dx/dy versetzt, mit neuer Blickrichtung */ beiseite?: { wenn: Bed; dx: number; dy: number; blick: [number, number] };
  /** läuft dem Spieler in dieser Region entgegen und spricht ihn an, solange die Bedingung gilt (z. B. Jori beim ersten Besuch) */ kommt?: { region: string; wenn: Bed } }
/** Baumstamm-Sperre (gesperrte Felder x0, y0, x1, y1; Stämme: Mitte x, y, Länge, Drehung) – offen nach QuestDef.freigaben[id] */
export interface Schranke { id: string; feld: [number, number, number, number]; staemme: [number, number, number, number][] }

/** Ein Questobjekt in der Welt (Zaun, Rutenbündel …): Antippen → untersuchen / aufheben; erledigt einen Schritt */
export interface QuestObjekt { id: string; name: string; x: number; y: number; /** wie der Browser es zeichnet: „zaun“, „ruten“ oder „stelle“ (nur der Leuchtring – an vorhandener Kulisse wie Obelisk, Gruft, Mühle) */ modell: string;
  /** Wort im Antippen-Menü (sonst nach tat) */ tatText?: string; tat: "untersuchen" | "aufheben" | "benutzen";
  /** nur, wenn das gilt (z. B. Gegenstände dabei) – sonst dieser Text */ braucht?: { wenn: Bed; text: string };
  /** beim Erledigen aus dem Rucksack nehmen / in den Rucksack geben */ nehmen?: { g: string; n?: number }[]; geben?: { g: string; n?: number }[];
  /** Text beim Erledigen ({n:gruppe} = Fortschritt) */ text: string; /** schon erledigt */ schon: string; /** wenn der Schritt gerade nicht möglich ist (die erste passende gilt, vor „schon“) */ sonst: Sperre[];
  /** wie nah man sein muss (Felder), sonst 3,2 */ weit?: number; /** im heilen Zustand zeigen, wenn eine davon gilt (z. B. Zaun geflickt) */ heil?: Bed[] }

/** Was einen Schritt erledigt */
export type Ereignis =
  | { art: "sammeln"; ziel: string }                         /* Sammelziel abgebaut (Holz, Bergbau) */
  | { art: "herstellen"; rezept: string }                    /* Rezept hergestellt (Handwerk) */
  | { art: "erlegen"; typ: string }                          /* Gegner besiegt (zählt mit „anzahl“) */
  | { art: "untersuchen"; ziel: string; bei?: [number, number, number] } /* Gegnerart oder Ding untersuchen, optional nur im Umkreis [x, y, r] */
  | { art: "objekt"; id: string }                            /* Questobjekt dieser Quest (objekte) */
  | { art: "aufheben"; g: string }                           /* Gegenstand vom Boden aufgehoben */
  | { art: "betreten"; region?: string; bei?: [number, number, number] } /* Region betreten oder Stelle erreicht */
  | { art: "benutzen"; g: string; ziel: string }             /* Gegenstand an einem Ding benutzen */
  | { art: "treffen"; ziel: string; waffe?: "nah" | "fern" | "magie" } /* ein Angriff trifft ein Ziel (Zielscheibe), optional nur mit dieser Kampfart – zählt mit „anzahl“ */
  | { art: "antwort" };                                      /* nur über eine Dialogantwort (erledige) */
/** Was dem Motor gemeldet wird (Stelle in Weltfeldern, wo es geschah) */
export type Meldung = Exclude<Ereignis, { art: "antwort" }> & { x?: number; y?: number };

export interface Schritt {
  id: string;
  /** kurz, für Questlog-Verlauf und Chat („… – erledigt“) */ text: string;
  /** der Satz im Questlog, solange dieser Schritt möglich ist ({n:id} = Fortschritt eines Zählers oder einer Gruppe) */ log: string;
  ereignis: Ereignis;
  /** so oft (Zähler) */ anzahl?: number;
  /** Schritte einer Gruppe erscheinen im Questlog als ein Satz (der log des ersten offenen) */ gruppe?: string;
  /** erst, wenn diese Schritte erledigt sind */ nach?: string[];
  /** wohin der Pfeil zeigt: Weltfeld, Figur-ID oder benannte Stelle (orte beim Aufruf, z. B. "esse") */ wo?: [number, number] | string;
  /** diese Figur(en) wartet auf den Spieler („!“ über ihr), solange der Schritt möglich ist */ bei?: string | string[];
}

/** Bedingung (alle Teile müssen gelten) */
export interface Bed {
  phase?: Phase[];
  /** angeboten (und abgelehnt)? */ angeboten?: boolean;
  /** diese Schritte sind erledigt */ erledigt?: string[];
  /** diese Schritte sind offen */ offen?: string[];
  /** alle Schritte erledigt */ alle?: boolean;
  /** Zähler eines Schritts mindestens */ zaehler?: { schritt: string; min: number };
  /** der Spieler trägt diesen Gegenstand bei sich (Rucksack oder angelegt) */ hat?: string;
  /** … oder hat ihn nirgends mehr (auch nicht in der Bank) */ verloren?: string;
  /** mindestens so viele davon bei sich */ anzahl?: { g: string; min: number };
  /** eine andere Quest ist in dieser Phase */ quest?: { id: string; phase: Phase[] };
  /** Skill-Level mindestens (Kampfskill oder Beruf) */ skill?: { k: string; min: number };
  /** Heldenlevel mindestens */ heldenlevel?: number;
  /** alle Voraussetzungen der Quest erfüllt */ voraussetzungen?: boolean;
}
export type Phase = "neu" | "laeuft" | "fertig";

/** Was eine Antwort bewirkt */
export interface Folge {
  zeilen: Text[];
  /** Quest annehmen */ start?: boolean;
  /** angeboten, aber (noch) abgelehnt */ anbieten?: boolean;
  /** Schritte als erledigt setzen */ erledige?: string[];
  /** alle Schritte wieder offen (z. B. nach Verlust) */ vonVorn?: boolean;
  /** Quest abschließen (Belohnung, genau einmal) */ abschluss?: boolean;
  /** danach weiter im Gespräch (Begrüßung neu) */ weiter?: boolean;
  /** Gegenstände geben (vor dem Abschluss: Werkzeug, Ersatz – für den Lohn gibt es belohnung) */ geben?: Geben[];
  /** Gegenstände nehmen (fehlt einer, geht die Antwort nicht) */ nehmen?: { g: string; n?: number }[];
  /** wenn geben nichts zu geben hatte: diese Zeilen statt zeilen */ nichtsZuGeben?: Text[];
}
export interface Geben { g: string; /** Text in „(Du bekommst: …)“ */ name: string; /** nur, wenn der Spieler ihn (oder Gleichwertiges) nicht besitzt */ fehlt?: boolean; /** Regex: gleichwertige Gegenstände zählen als vorhanden */ gleich?: string; /** nur, wenn verloren (nirgends mehr) */ verloren?: boolean }

export interface Option { id: string; text: string; /** sichtbar nur, wenn */ wenn?: Bed; /** die erste passende Variante gilt */ folge: { wenn?: Bed; f: Folge }[] }
/** Was die Figur zur Begrüßung sagt (die erste passende gilt) und welche Antworten es gibt */
export interface Rede { wenn?: Bed; zeilen: Text[]; antworten: string[]; /** schon das Ansprechen bietet die Quest an (Stand „angeboten“) */ anbieten?: boolean }

/** Sperre an einem Sammelziel, Rezept oder Questobjekt: Text, warum es (noch) nicht geht */
export interface Sperre { wenn: Bed; text: string }
/** Voraussetzung (Questlog: grün / rot) */
export interface Voraussetzung { text: string; wenn: Bed }
/** Lohn beim Abschluss – alles in einer Buchung, genau einmal (Kampf-XP über rpg_held_quest_abschluss, danach Splitter und Gegenstände) */
export interface Belohnung { xp?: Partial<Record<"geschick" | "staerke" | "fernkampf" | "magie" | "lp" | "defense", number>>; /** Berufe-XP (shared/berufe.ts) */ berufe?: Record<string, number>; splitter?: number; gegenstaende?: { g: string; n?: number }[] }

export interface QuestDef {
  id: string; titel: string; ort: string;
  /** Questlog: „So startest du“ */ start: string;
  /** Questlog vor dem Annehmen, nach dem Abschluss, wenn alle Schritte erledigt sind; optional nach dem Ablehnen */ logNeu: string; logFertig: string; logAbgabe: string; logAngeboten?: string;
  /** Wer die Quest gibt und wer sie abnimmt (sonst der Geber) */ geber: string; abgabe?: string;
  figuren: QuestFigur[];
  schritte: Schritt[];
  /** Dialoge je Figur */ dialoge: Record<string, { reden: Rede[]; optionen: Option[] }>;
  /** Questobjekte in der Welt */ objekte?: QuestObjekt[];
  /** Sammelziele und Rezepte, die nur mit der Quest gehen (die erste passende Sperre gilt) */
  sperren?: { sammeln?: Record<string, Sperre[]>; herstellen?: Record<string, Sperre[]> };
  /** bedingte Beute: Name der Bedingung in den Drop-Tabellen (config.ts „nur“) → wann sie gilt */ beute?: Record<string, Bed>;
  voraussetzungen?: Voraussetzung[];
  /** Questpunkte für den Abschluss */ punkte?: number;
  /** Text für das Questlog */ belohnungText: string;
  belohnung?: Belohnung;
  /** Stände aus der Zeit vor dem Baukasten übersetzen (null = unbekannt) */ alt?: (s: string) => string | null;
  /** Einführung: Marker und Pfeil auch ohne Verfolgen, solange die Quest nicht angenommen ist */ einfuehrung?: boolean;
  /** Baumstamm-Sperren in der Welt (je Spieler) */ schranken?: Schranke[];
  /** Sperre (Schranke-ID) oder Region → offen, wenn eine der Bedingungen gilt. Gilt gleich auf dem Server (Zurückschicken, Teleport) und im Browser (Stämme, Gehraster). */
  freigaben?: Record<string, Bed[]>;
  /** wohin der Server zurückschickt, wer ohne Freigabe in einer gesperrten Region steht */ zurueck?: { x: number; y: number; text: string };
  /** Schalter je Spieler (Weltzustand: Mühle dreht, Kapelle offen, Bäckerei offen, Zielscheiben frei …) → an, wenn eine der Bedingungen gilt.
   *  Server und Browser werten sie gleich aus (schalterAn in shared/quests.ts). */
  schalter?: Record<string, Bed | Bed[]>;
}

/* ───────── Stand ───────── */
export interface Lage { phase: Phase; bits: number; z: number[]; angeboten: boolean }
const zaehlSchritte = (q: QuestDef) => q.schritte.filter((x) => x.anzahl);
const alleBits = (q: QuestDef) => (1 << q.schritte.length) - 1;
const MUSTER = /^auftrag_(\d{1,10})((?:_\d{1,4})*)$/;
export function lage(q: QuestDef, s: string): Lage { const n = zaehlSchritte(q).length, leer = Array(n).fill(0);
  if (s === "fertig") return { phase: "fertig", bits: alleBits(q), z: zaehlSchritte(q).map((x) => x.anzahl!), angeboten: true };
  if (s === "angeboten") return { phase: "neu", bits: 0, z: leer, angeboten: true };
  const m = MUSTER.exec(s || ""); if (m) { const b = Number(m[1]), zs = m[2] ? m[2].slice(1).split("_").map(Number) : [];
    if (b <= alleBits(q) && zs.length <= n) return { phase: "laeuft", bits: b, z: leer.map((_, i) => Math.min(zs[i] || 0, zaehlSchritte(q)[i].anzahl!)), angeboten: true }; }
  return { phase: "neu", bits: 0, z: leer, angeboten: false }; }
export const stand = (l: Lage): string => (l.phase === "laeuft" ? `auftrag_${l.bits}` + (l.z.some((x) => x) ? l.z.map((x) => "_" + x).join("") : "") : l.phase === "fertig" ? "fertig" : l.angeboten ? "angeboten" : "");
/** Gespeicherten Stand prüfen (ältere Formate übersetzt die Quest; Unbekanntes wird zu "") */
export function gueltig(q: QuestDef, s: unknown): string { if (typeof s !== "string") return ""; const a = q.alt ? q.alt(s) : null; const t = a !== null ? a : s;
  const r = stand(lage(q, t)); return r === t ? r : ""; }
export const laeuft = (q: QuestDef, s: string): boolean => lage(q, s).phase === "laeuft";
const idx = (q: QuestDef, id: string) => q.schritte.findIndex((x) => x.id === id);
const bit = (q: QuestDef, id: string): number => { const i = idx(q, id); return i < 0 ? 0 : 1 << i; };
export const erledigt = (q: QuestDef, s: string, id: string): boolean => (lage(q, s).bits & bit(q, id)) !== 0;
/** Zählerstand eines Schritts */
export const zaehler = (q: QuestDef, s: string, id: string): number => { const i = zaehlSchritte(q).findIndex((x) => x.id === id); return i < 0 ? 0 : lage(q, s).z[i]; };
/** Ist ein Schritt jetzt möglich (angenommen, offen, Vorgänger erledigt)? */
export function moeglich(q: QuestDef, s: string, id: string): boolean { const l = lage(q, s), S = q.schritte.find((x) => x.id === id); if (!S || l.phase !== "laeuft" || l.bits & bit(q, id)) return false;
  return (S.nach || []).every((n) => (l.bits & bit(q, n)) !== 0); }

/** Was der Motor über den Spieler wissen muss (der Server weiß alles; der Browser kennt den Rest nicht – fehlt eine Angabe, gilt die Bedingung nicht) */
export interface Kontext { hat(g: string): boolean; verloren(g: string): boolean; anzahl?(g: string): number; quest?(id: string): Phase; skill?(k: string): number; heldenlevel?(): number }
const OHNE: Kontext = { hat: () => false, verloren: () => false };
export function gilt(q: QuestDef, s: string, b: Bed | undefined, k: Kontext = OHNE): boolean { if (!b) return true; const l = lage(q, s);
  if (b.phase && !b.phase.includes(l.phase)) return false;
  if (b.angeboten !== undefined && b.angeboten !== l.angeboten) return false;
  if (b.erledigt && !b.erledigt.every((id) => l.bits & bit(q, id))) return false;
  if (b.offen && !b.offen.every((id) => !(l.bits & bit(q, id)))) return false;
  if (b.alle !== undefined && b.alle !== (l.bits === alleBits(q))) return false;
  if (b.zaehler && zaehler(q, s, b.zaehler.schritt) < b.zaehler.min) return false;
  if (b.hat && !k.hat(b.hat)) return false;
  if (b.verloren && !k.verloren(b.verloren)) return false;
  if (b.anzahl && !(k.anzahl && k.anzahl(b.anzahl.g) >= b.anzahl.min)) return false;
  if (b.quest && !(k.quest && b.quest.phase.includes(k.quest(b.quest.id)))) return false;
  if (b.skill && !(k.skill && k.skill(b.skill.k) >= b.skill.min)) return false;
  if (b.heldenlevel !== undefined && !(k.heldenlevel && k.heldenlevel() >= b.heldenlevel)) return false;
  if (b.voraussetzungen && !(q.voraussetzungen || []).every((v) => gilt(q, s, v.wenn, k))) return false;
  return true; }

/* ───────── Texte ───────── */
/** Fortschritt eines Zählers oder einer Gruppe: „2/3“ */
export function fortschritt(q: QuestDef, s: string, id: string): string { const S = q.schritte.find((x) => x.id === id);
  if (S && S.anzahl) return `${zaehler(q, s, id)}/${S.anzahl}`;
  const g = q.schritte.filter((x) => x.gruppe === id), l = lage(q, s); return `${g.filter((x) => l.bits & bit(q, x.id)).length}/${g.length}`; }
/** Platzhalter {n:id} einsetzen */
export const einsetzen = (q: QuestDef, s: string, t: string): string => t.replace(/\{n:([a-z0-9_]+)\}/g, (_, id) => fortschritt(q, s, id));

/* ───────── Dialog ───────── */
const figur = (q: QuestDef, id: string) => q.figuren.find((f) => f.id === id);
const zeilen = (q: QuestDef, s: string, name: string, t: Text[]): Zeile[] => t.map((x) => (typeof x === "string" ? { wer: name, text: einsetzen(q, s, x) } : { wer: x.wer, text: einsetzen(q, s, x.text) }));
/** Die passende Begrüßung einer Figur */
export const rede = (q: QuestDef, npc: string, s: string, k: Kontext): Rede | null => { const D = q.dialoge[npc]; return D ? D.reden.find((x) => gilt(q, s, x.wenn, k)) || null : null; };
/** Begrüßung und Antworten einer Figur */
export function dialog(q: QuestDef, npc: string, s: string, k: Kontext): Dialog | null { const F = figur(q, npc), D = q.dialoge[npc]; if (!F || !D) return null;
  const r = rede(q, npc, s, k); if (!r) return null;
  const antworten = r.antworten.map((id) => D.optionen.find((o) => o.id === id)).filter((o): o is Option => Boolean(o) && gilt(q, s, o!.wenn, k)).map((o) => ({ id: o.id, text: o.text }));
  return { npc, name: F.name, zeilen: zeilen(q, s, F.name, r.zeilen), antworten }; }
/** Was eine Antwort bewirkt (null: gibt es hier nicht). Nur Antworten, die die aktuelle Begrüßung anbietet, zählen. */
export function antwort(q: QuestDef, npc: string, s: string, a: string, k: Kontext): Folge | null { const D = q.dialoge[npc]; if (!D) return null;
  const angeboten = dialog(q, npc, s, k); if (!angeboten || !angeboten.antworten.some((x) => x.id === a)) return null;
  const o = D.optionen.find((x) => x.id === a); const v = o && o.folge.find((x) => gilt(q, s, x.wenn, k)); return v ? v.f : null; }
/** Die Zeilen einer Folge als Gespräch (Name der Figur, Platzhalter) */
export const folgeZeilen = (q: QuestDef, npc: string, s: string, t: Text[]): Zeile[] => { const F = figur(q, npc); return zeilen(q, s, F ? F.name : npc, t); };
/** Den Stand nach einer Folge (ohne Abschluss – der geht über die Datenbank) */
export function nachFolge(q: QuestDef, s: string, f: Folge): string { let l = lage(q, s);
  if (f.anbieten && l.phase === "neu") l = { ...l, angeboten: true };
  if (f.start && l.phase === "neu") l = { ...l, phase: "laeuft", bits: 0, angeboten: true };
  if (f.vonVorn && l.phase === "laeuft") l = { ...l, bits: 0, z: l.z.map(() => 0) };
  if (f.erledige && l.phase === "laeuft") for (const id of f.erledige) l = { ...l, bits: l.bits | bit(q, id) };
  return stand(l); }

/* ───────── Schritte durch Ereignisse ───────── */
function passt(e: Ereignis, m: Meldung): boolean { if (e.art !== m.art) return false;
  const nah = (b?: [number, number, number]) => !b || (m.x !== undefined && m.y !== undefined && Math.hypot(m.x - b[0], m.y - b[1]) <= b[2]);
  switch (e.art) {
    case "sammeln": return e.ziel === (m as typeof e).ziel;
    case "herstellen": return e.rezept === (m as typeof e).rezept;
    case "erlegen": return e.typ === (m as typeof e).typ;
    case "untersuchen": return e.ziel === (m as typeof e).ziel && nah(e.bei);
    case "objekt": return e.id === (m as typeof e).id;
    case "aufheben": return e.g === (m as typeof e).g;
    case "betreten": return (!e.region || e.region === (m as typeof e).region) && nah(e.bei);
    case "benutzen": return e.g === (m as typeof e).g && e.ziel === (m as typeof e).ziel;
    case "treffen": return e.ziel === (m as typeof e).ziel && (!e.waffe || e.waffe === (m as typeof e).waffe);
    default: return false; } }
/** Etwas ist geschehen: neuer Stand (oder derselbe). Schritte mit „anzahl“ zählen mit. */
export function ereignis(q: QuestDef, s: string, m: Meldung): string { let l = lage(q, s); if (l.phase !== "laeuft") return s; const zs = zaehlSchritte(q);
  for (const S of q.schritte) { if (!passt(S.ereignis, m) || !moeglich(q, stand(l), S.id)) continue;
    if (S.anzahl) { const i = zs.indexOf(S), z = [...l.z]; z[i] = Math.min(S.anzahl, z[i] + 1); l = { ...l, z }; if (z[i] >= S.anzahl) l = { ...l, bits: l.bits | bit(q, S.id) }; }
    else l = { ...l, bits: l.bits | bit(q, S.id) }; }
  return stand(l); }
/** Sperre eines Sammelziels oder Rezepts: Text oder null (erlaubt). Ohne Eintrag: nicht Teil dieser Quest (undefined). */
export function sperre(q: QuestDef, art: "sammeln" | "herstellen", id: string, s: string, k: Kontext = OHNE): string | null | undefined {
  const L = q.sperren && q.sperren[art] && q.sperren[art]![id]; if (!L) return undefined; const x = L.find((p) => gilt(q, s, p.wenn, k)); return x ? einsetzen(q, s, x.text) : null; }
/** Ein Questobjekt benutzen: Text und neuer Stand */
export function objekt(q: QuestDef, s: string, id: string, k: Kontext = OHNE): { text: string; stand: string } | null { const O = (q.objekte || []).find((o) => o.id === id); if (!O) return null;
  const S = q.schritte.find((x) => x.ereignis.art === "objekt" && x.ereignis.id === id);
  if (S && moeglich(q, s, S.id)) { if (O.braucht && !gilt(q, s, O.braucht.wenn, k)) return { text: einsetzen(q, s, O.braucht.text), stand: s };
    const n = ereignis(q, s, { art: "objekt", id }); return { text: einsetzen(q, n, O.text), stand: n }; }
  const x = O.sonst.find((p) => gilt(q, s, p.wenn, k)); if (x) return { text: einsetzen(q, s, x.text), stand: s };
  return { text: S && erledigt(q, s, S.id) ? einsetzen(q, s, O.schon) : O.name, stand: s }; }
/** Wie ein Questobjekt gerade aussieht: weg (aufgehoben), heil, ob es leuchtet (zu tun) */
export function objektLage(q: QuestDef, s: string, O: QuestObjekt, k: Kontext = OHNE): { weg: boolean; heil: boolean; leuchtet: boolean } {
  const S = q.schritte.find((x) => x.ereignis.art === "objekt" && x.ereignis.id === O.id), fertig = lage(q, s).phase === "fertig";
  return { weg: O.tat === "aufheben" && (fertig || Boolean(S && erledigt(q, s, S.id))), heil: (O.heil || []).some((b) => gilt(q, s, b, k)), leuchtet: Boolean(S && moeglich(q, s, S.id)) }; }

/* ───────── Questlog, Pfeil, Zeichen ───────── */
const moeglichListe = (q: QuestDef, s: string) => q.schritte.filter((x) => moeglich(q, s, x.id));
export function naechster(q: QuestDef, s: string): Schritt | null { return moeglichListe(q, s)[0] || null; }
/** Der Satz „Was jetzt?“ im Questlog: alle gerade möglichen Schritte (eine Gruppe als ein Satz) */
export function questlog(q: QuestDef, s: string): string { const l = lage(q, s);
  if (l.phase === "neu") return l.angeboten && q.logAngeboten ? q.logAngeboten : q.logNeu; if (l.phase === "fertig") return q.logFertig;
  if (l.bits === alleBits(q)) return einsetzen(q, s, q.logAbgabe); const gesehen = new Set<string>(), saetze: string[] = [];
  for (const x of moeglichListe(q, s)) { if (x.gruppe) { if (gesehen.has(x.gruppe)) continue; gesehen.add(x.gruppe); } const t = einsetzen(q, s, x.log); if (!saetze.includes(t)) saetze.push(t); }
  return saetze.length ? saetze.join(" ") : einsetzen(q, s, q.logAbgabe); }
/** Erledigte Schritte (Text, in Reihenfolge) */
export const erledigteSchritte = (q: QuestDef, s: string): string[] => { const l = lage(q, s); if (l.phase === "neu") return [];
  const fertig = (x: Schritt) => (l.bits & bit(q, x.id)) !== 0, aus: string[] = [];
  for (const x of q.schritte) if (fertig(x) && (!x.gruppe || q.schritte.filter((y) => y.gruppe === x.gruppe).every(fertig)) && !aus.includes(x.text)) aus.push(x.text); /* eine Gruppe zählt, wenn sie ganz erledigt ist */
  return aus; };
/** Schritte, die zwischen zwei Ständen erledigt wurden (für die Meldung im Chat) */
export const neuErledigt = (q: QuestDef, alt: string, neu: string): Schritt[] => { const a = lage(q, alt), n = lage(q, neu); if (n.phase !== "laeuft" || a.phase !== "laeuft") return []; return q.schritte.filter((x) => n.bits & bit(q, x.id) && !(a.bits & bit(q, x.id))); };
/** Wohin der Pfeil zeigt: Figur-ID, Weltfeld oder null */
export function ziel(q: QuestDef, s: string, orte: Record<string, [number, number]> = {}): string | [number, number] | null { const l = lage(q, s);
  if (l.phase === "neu") return q.geber; if (l.phase === "fertig") return null; if (l.bits === alleBits(q)) return q.abgabe || q.geber;
  const n = naechster(q, s); if (!n) return q.abgabe || q.geber;
  if (!n.wo) { const e = n.ereignis, O = e.art === "objekt" ? (q.objekte || []).find((o) => o.id === e.id) : undefined; return O ? [O.x, O.y] : beiListe(n)[0] || q.geber; }
  if (Array.isArray(n.wo)) return n.wo; return orte[n.wo] ? orte[n.wo] : n.wo; }
/** Zeichen über einer Figur: „!“ (Quest zu haben / ein Schritt wartet bei ihr), „?“ (Abgabe), sonst null */
const beiListe = (x: Schritt): string[] => (x.bei === undefined ? [] : Array.isArray(x.bei) ? x.bei : [x.bei]);
export function zeichen(q: QuestDef, s: string, npc: string): "!" | "?" | null { const l = lage(q, s);
  if (l.phase === "neu") return npc === q.geber ? "!" : null; if (l.phase === "fertig") return null;
  if (l.bits === alleBits(q)) return npc === (q.abgabe || q.geber) ? "?" : null;
  return moeglichListe(q, s).some((x) => beiListe(x).includes(npc)) ? "!" : null; }
/** Ist dieser Schalter für den Spieler an? undefined: die Quest kennt ihn nicht */
export function schalter(q: QuestDef, s: string, id: string, k: Kontext = OHNE): boolean | undefined { const B = q.schalter && q.schalter[id]; if (!B) return undefined;
  return (Array.isArray(B) ? B : [B]).some((b) => gilt(q, s, b, k)); }
/** Ist diese Sperre / Region für den Spieler offen? undefined: die Quest regelt sie nicht */
export function frei(q: QuestDef, s: string, id: string, k: Kontext = OHNE): boolean | undefined { const L = q.freigaben && q.freigaben[id]; return L ? L.some((b) => gilt(q, s, b, k)) : undefined; }
/** Voraussetzungen mit erfüllt / nicht erfüllt */
export const voraussetzungen = (q: QuestDef, s: string, k: Kontext = OHNE): { text: string; ok: boolean }[] => (q.voraussetzungen || []).map((v) => ({ text: v.text, ok: gilt(q, s, v.wenn, k) }));
