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
 *   "abholbereit"      alle Schritte und die Abgabe erledigt, der Lohn wartet auf „Okay“ im Abschlussfenster (#77) – zählt wie abgeschlossen
 *   "fertig"           abgeschlossen und Lohn gebucht (nur über rpg_held_quest_abschluss)
 * Ältere Formate übersetzt die Quest selbst (QuestDef.alt) – beim Laden, gespeicherte Stände bleiben gültig.
 */
import { ausbauDa } from "./stadtstufen";

export interface Zeile { wer: string; text: string }
export interface Antwort { id: string; text: string }
export interface Dialog { npc: string; name: string; zeilen: Zeile[]; antworten: Antwort[] }
/** Eine Zeile im Gespräch: Text der Figur, oder { wer, text } für andere Sprecher („Du“, eine zweite Wache) */
export type Text = string | Zeile;

/** Höchster Quest-Lohn je Kampfskill und Beruf (Migration 051, rpg_held_quest_abschluss_v2) und Questpunkte je Quest – mehr ist im Prüfer ein Fehler */
export const LOHN_JE_SKILL = 50000, PUNKTE_JE_QUEST = 10;
/** So nah muss man stehen, um zu reden (Felder) */
export const REDE_WEIT = 3.5;
/** Eine Figur der Quest (Weltfelder) */
export interface QuestFigur { id: string; name: string; modell: string; x: number; y: number; blick: [number, number];
  /** Gesprächsweite (Felder), sonst REDE_WEIT */ weit?: number; /** geht umher (Modell des Wanderers in der Welt, z. B. der Bürgermeister im Rathaus) */ wandert?: string;
  /** tritt beiseite, wenn (z. B. die Wachen, sobald der Weg frei ist): um dx/dy versetzt, mit neuer Blickrichtung */ beiseite?: { wenn: Bed; dx: number; dy: number; blick: [number, number] };
  /** läuft dem Spieler in dieser Region entgegen und spricht ihn an, solange die Bedingung gilt (z. B. Jori beim ersten Besuch) */ kommt?: { region: string; wenn: Bed };
  /** Stadtstufen (shared/stadtstufen.ts, #102): da ab dieser Stufe / nicht mehr ab dieser Stufe (Schalter über Kontext.schalter) */ ausbau?: string; ausbau_bis?: string;
  /** nur da (sichtbar, ansprechbar), wenn das gilt – sonst steht dort niemand (Ysolde erst nach dem Feuer, #49) */ sichtbar?: Bed;
  /** folgt dem Spieler, solange das gilt (Befreite bis zur Treppe, später das Rabenküken – shared/folgen.ts). Nur im eigenen Browser;
   *  ansprechbar bleibt sie, wo sie gerade ist. Das Ziel ist ein gewöhnlicher Schritt (betreten bei …); danach steht sie an ihrer Stelle bzw. beiseite. */
  folgt?: { wenn: Bed; abstand?: number };
  /** Maßstab des Modells (#134; Standard 1): Modelle in echter Größe wie das Schaf (0,8 m) stimmen schon, größer/kleiner nur hiermit */ mass?: number }
/** Schmuck in der Welt, den eine Quest zeigt (#134: Trophäe an der Wand): ein 3D-Modell (z. B. aus der Bibliothek), sichtbar nur, wenn sichtbar gilt – ohne Antippen */
export interface QuestDeko { id: string; /** Modell (Pfad ab Spielwurzel, z. B. img/objekte3d/sueden/trophaee_hecht.glb) */ glb: string; /** Weltfelder; h: Höhe über dem Boden (m, an der Wand) */ x: number; y: number; h?: number;
  /** Drehung um die Hochachse (Grad) und Maßstab */ dreh?: number; mass?: number; sichtbar: Bed }
/** Baumstamm-Sperre (gesperrte Felder x0, y0, x1, y1; Stämme: Mitte x, y, Länge, Drehung) – offen nach QuestDef.freigaben[id] */
export interface Schranke { id: string; feld: [number, number, number, number]; staemme: [number, number, number, number][] }

/** Ein Questobjekt in der Welt (Zaun, Rutenbündel …): Antippen → untersuchen / aufheben; erledigt einen Schritt */
export interface QuestObjekt { id: string; name: string; x: number; y: number; /** wie der Browser es zeichnet: „zaun“, „ruten“ oder „stelle“ (nur der Leuchtring – an vorhandener Kulisse wie Obelisk, Gruft, Mühle) */ modell: string;
  /** Wort im Antippen-Menü (sonst nach tat) */ tatText?: string; tat: "untersuchen" | "aufheben" | "benutzen";
  /** nur, wenn das gilt (z. B. Gegenstände dabei) – sonst dieser Text */ braucht?: { wenn: Bed; text: string };
  /** beim Erledigen aus dem Rucksack nehmen / in den Rucksack geben */ nehmen?: { g: string; n?: number }[]; geben?: { g: string; n?: number }[];
  /** Text beim Erledigen ({n:gruppe} = Fortschritt) */ text: string; /** schon erledigt */ schon: string; /** wenn der Schritt gerade nicht möglich ist (die erste passende gilt, vor „schon“) */ sonst: Sperre[];
  /** wie nah man sein muss (Felder), sonst 3,2 */ weit?: number; /** im heilen Zustand zeigen, wenn eine davon gilt (z. B. Zaun geflickt) */ heil?: Bed[];
  /** Gesang mit Zeitfenster (#49): erledigt den Schritt nur in den ersten dauer Sekunden von je alle Sekunden der Weltuhr (Server-Zeit);
   *  sonst Text still ({sek} = Sekunden bis zum nächsten Mal). Der Browser zeigt das Fenster mit hoerbarJetzt / hoerbarIn. */ hoerbar?: { alle: number; dauer: number; still: string } }

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
  /** Figur wird Gegner (E3, Tjark): an ihrer Stelle erscheint dieser Gegner (config.ts) und greift den Spieler an; er kehrt nach dem Kampf nicht wieder.
   *  Die Figur tritt im Browser so lange beiseite (ANGRIFF_FIGUR_MS). Sein Tod meldet „erlegen“ wie jeder Gegner */ angriff?: string;
}
/** So lange (ms) ist die Figur fort, nachdem sie zum Gegner wurde (Folge.angriff) */
export const ANGRIFF_FIGUR_MS = 120000;
export interface Geben { g: string; /** Text in „(Du bekommst: …)“ */ name: string; /** nur, wenn der Spieler ihn (oder Gleichwertiges) nicht besitzt */ fehlt?: boolean; /** Regex: gleichwertige Gegenstände zählen als vorhanden */ gleich?: string; /** nur, wenn verloren (nirgends mehr) */ verloren?: boolean }

export interface Option { id: string; text: string; /** sichtbar nur, wenn */ wenn?: Bed; /** die erste passende Variante gilt */ folge: { wenn?: Bed; f: Folge }[] }
/** Was die Figur zur Begrüßung sagt (die erste passende gilt) und welche Antworten es gibt */
export interface Rede { wenn?: Bed; zeilen: Text[]; antworten: string[]; /** schon das Ansprechen bietet die Quest an (Stand „angeboten“) */ anbieten?: boolean }

/** Sperre an einem Sammelziel, Rezept oder Questobjekt: Text, warum es (noch) nicht geht */
export interface Sperre { wenn: Bed; text: string }
/** Voraussetzung (Questlog: grün / rot) */
export interface Voraussetzung { text: string; wenn: Bed }
/** Lohn beim Abschluss – alles in einer Buchung, genau einmal (Kampf-XP über rpg_held_quest_abschluss, danach Splitter und Gegenstände) */
export interface Belohnung { xp?: Partial<Record<"geschick" | "staerke" | "fernkampf" | "magie" | "lp" | "defense", number>>; /** Berufe-XP (shared/berufe.ts) */ berufe?: Record<string, number>; splitter?: number; gegenstaende?: { g: string; n?: number }[]; /** Ladungen (inventar.ladungen, shared/splitterbinden.ts) */ ladungen?: Record<string, number> }

export interface QuestDef {
  id: string; titel: string; ort: string;
  /** Questlog: „So startest du“ */ start: string;
  /** Questlog vor dem Annehmen, nach dem Abschluss, wenn alle Schritte erledigt sind; optional nach dem Ablehnen */ logNeu: string; logFertig: string; logAbgabe: string; logAngeboten?: string;
  /** Wer die Quest gibt und wer sie abnimmt (sonst der Geber) */ geber: string; abgabe?: string;
  figuren: QuestFigur[];
  schritte: Schritt[];
  /** Dialoge je Figur */ dialoge: Record<string, { reden: Rede[]; optionen: Option[] }>;
  /** Questobjekte in der Welt */ objekte?: QuestObjekt[]; /** Schmuck, der nach dem Stand erscheint (#134) */ deko?: QuestDeko[];
  /** Sammelziele und Rezepte, die nur mit der Quest gehen (die erste passende Sperre gilt) */
  sperren?: { sammeln?: Record<string, Sperre[]>; herstellen?: Record<string, Sperre[]> };
  /** bedingte Beute: Name der Bedingung in den Drop-Tabellen (config.ts „nur“) → wann sie gilt */ beute?: Record<string, Bed>;
  voraussetzungen?: Voraussetzung[];
  /** Questpunkte für den Abschluss */ punkte?: number;
  /** Text für das Questlog */ belohnungText: string;
  /** ein Satz für das Abschlussfenster, in der Stimme des Abgebers (#95; höchstens etwa 140 Zeichen) */ glueckwunsch?: string;
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
  /** Rätsel-Reihenfolge je Spieler (#49): der Zähler-Schritt schritt (anzahl = teile.length) zählt Questobjekte (Ids in teile) nur in einer
   *  Reihenfolge, die beim Annehmen zufällig festgelegt und im Stand gespeichert wird. Falsches Objekt: von vorn (Text falsch).
   *  {reihe} in Texten = die namen (sonst die Objektnamen) in dieser Reihenfolge – z. B. Heddas Silben.
   *  fest: die Reihenfolge ist für alle die angegebene (Spiegel-Rätsel, #102: Platten in der richtigen Reihenfolge lenken das Licht). */
  reihenfolge?: { schritt: string; teile: string[]; namen?: string[]; falsch: string; fest?: boolean };
  /** Drehteile in der Welt (Mühlenflügel) im Umkreis r einer Stelle drehen sich nur, wenn der Schalter an ist – je Spieler */
  drehen?: { schalter: string; x: number; y: number; r: number }[];
}

/* ───────── Stand ───────── */
export interface Lage { phase: Phase; bits: number; z: number[]; angeboten: boolean; /** abgeschlossen, Lohn noch nicht abgeholt (#77) */ abholen?: boolean; /** Rätsel-Reihenfolge: Nummer der Anordnung (QuestDef.reihenfolge) */ r?: number }
/** Stand nach dem letzten Schritt: abgeschlossen, der Lohn wartet (#77) */
export const ABHOLBEREIT = "abholbereit";
const zaehlSchritte = (q: QuestDef) => q.schritte.filter((x) => x.anzahl);
const alleBits = (q: QuestDef) => (1 << q.schritte.length) - 1;
const MUSTER = /^auftrag_(\d{1,10})((?:_\d{1,4})*)(?:_r(\d{1,4}))?$/;
const fakultaet = (n: number): number => (n <= 1 ? 1 : n * fakultaet(n - 1));
export function lage(q: QuestDef, s: string): Lage { const n = zaehlSchritte(q).length, leer = Array(n).fill(0);
  if (s === "fertig" || s === ABHOLBEREIT) return { phase: "fertig", bits: alleBits(q), z: zaehlSchritte(q).map((x) => x.anzahl!), angeboten: true, ...(s === ABHOLBEREIT ? { abholen: true } : {}) };
  if (s === "angeboten") return { phase: "neu", bits: 0, z: leer, angeboten: true };
  const m = MUSTER.exec(s || ""); if (m) { const b = Number(m[1]), zs = m[2] ? m[2].slice(1).split("_").map(Number) : [];
    const r = m[3] !== undefined && q.reihenfolge && Number(m[3]) < fakultaet(q.reihenfolge.teile.length) ? { r: Number(m[3]) } : {};
    if (b <= alleBits(q) && zs.length <= n) return { phase: "laeuft", bits: b, z: leer.map((_, i) => Math.min(zs[i] || 0, zaehlSchritte(q)[i].anzahl!)), angeboten: true, ...r }; }
  return { phase: "neu", bits: 0, z: leer, angeboten: false }; }
export const stand = (l: Lage): string => (l.phase === "laeuft" ? `auftrag_${l.bits}` + (l.z.some((x) => x) ? l.z.map((x) => "_" + x).join("") : "") + (l.r !== undefined ? `_r${l.r}` : "") : l.phase === "fertig" ? (l.abholen ? ABHOLBEREIT : "fertig") : l.angeboten ? "angeboten" : "");
/** Wartet der Lohn dieser Quest aufs Abholen (#77)? */
export const abholbereit = (s: string): boolean => s === ABHOLBEREIT;
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
export interface Kontext { hat(g: string): boolean; verloren(g: string): boolean; anzahl?(g: string): number; quest?(id: string): Phase; skill?(k: string): number; heldenlevel?(): number;
  /** Weltuhr in Sekunden (Server: Date.now() / 1000) – für hoerbar; fehlt sie, ist nie etwas hörbar */ zeit?(): number;
  /** Schalter des Spielers (QuestDef.schalter) – für Stadtstufen; fehlt er, gilt die erste Stufe */ schalter?(id: string): boolean }
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

/* ───────── Abschlussfenster (#77): was es als Lohn gibt ───────── */
export type LohnZeile = { art: "xp"; k: string; n: number } | { art: "beruf"; k: string; n: number } | { art: "splitter"; n: number } | { art: "gegenstand"; g: string; n: number } | { art: "ladungen"; g: string; n: number } | { art: "punkte"; n: number };
/** Die Belohnung einer Quest als Liste fürs Fenster (Reihenfolge: XP, Berufe, Splitter, Gegenstände, Ladungen, Questpunkte) */
export function lohnListe(q: QuestDef): LohnZeile[] { const B = q.belohnung || {}, aus: LohnZeile[] = [];
  for (const [k, n] of Object.entries(B.xp || {})) if (n) aus.push({ art: "xp", k, n }); for (const [k, n] of Object.entries(B.berufe || {})) if (n) aus.push({ art: "beruf", k, n });
  if (B.splitter) aus.push({ art: "splitter", n: B.splitter }); for (const G of B.gegenstaende || []) aus.push({ art: "gegenstand", g: G.g, n: G.n || 1 });
  for (const [g, n] of Object.entries(B.ladungen || {})) if (n) aus.push({ art: "ladungen", g, n }); if (q.punkte) aus.push({ art: "punkte", n: Math.min(10, q.punkte) }); return aus; }

/* ───────── Texte ───────── */
/** Fortschritt eines Zählers oder einer Gruppe: „2/3“ */
export function fortschritt(q: QuestDef, s: string, id: string): string { const S = q.schritte.find((x) => x.id === id);
  if (S && S.anzahl) return `${zaehler(q, s, id)}/${S.anzahl}`;
  const g = q.schritte.filter((x) => x.gruppe === id), l = lage(q, s); return `${g.filter((x) => l.bits & bit(q, x.id)).length}/${g.length}`; }
/** Platzhalter {n:id} einsetzen */
export const einsetzen = (q: QuestDef, s: string, t: string): string => t.replace(/\{n:([a-z0-9_]+)\}/g, (_, id) => fortschritt(q, s, id)).replace(/\{reihe\}/g, () => reiheNamen(q, s).join(" – "));

/* ───────── Rätsel-Reihenfolge und Gesang (#49) ───────── */
/** Die Anordnung Nummer r von n Teilen (0 … n!-1) */
export function anordnung(n: number, r: number): number[] { const rest = Array.from({ length: n }, (_, i) => i), aus: number[] = []; let k = Math.max(0, Math.floor(r)) % fakultaet(n);
  for (let i = n; i > 0; i--) { const f = fakultaet(i - 1), j = Math.floor(k / f); k %= f; aus.push(rest.splice(j, 1)[0]); } return aus; }
/** Die Teile (Objekt-Ids) in der Reihenfolge dieses Spielers (ohne festgelegte Reihenfolge: wie angegeben) */
export function reihe(q: QuestDef, s: string): string[] { const R = q.reihenfolge; if (!R) return []; const r = lage(q, s).r; return r === undefined ? [...R.teile] : anordnung(R.teile.length, r).map((i) => R.teile[i]); }
/** Die Namen der Teile in dieser Reihenfolge (für {reihe}) */
export function reiheNamen(q: QuestDef, s: string): string[] { const R = q.reihenfolge; if (!R) return []; return reihe(q, s).map((id) => { const i = R.teile.indexOf(id); return (R.namen && R.namen[i]) || ((q.objekte || []).find((o) => o.id === id) || { name: id }).name; }); }
/** Gesang: ist das Objekt zu dieser Weltzeit (Sekunden) hörbar? */
export const hoerbarJetzt = (O: QuestObjekt, sek: number): boolean => !O.hoerbar || ((sek % O.hoerbar.alle) + O.hoerbar.alle) % O.hoerbar.alle < O.hoerbar.dauer;
/** Gesang: Sekunden bis zum nächsten hörbaren Fenster (0: jetzt) */
export const hoerbarIn = (O: QuestObjekt, sek: number): number => (!O.hoerbar || hoerbarJetzt(O, sek) ? 0 : Math.ceil(O.hoerbar.alle - (((sek % O.hoerbar.alle) + O.hoerbar.alle) % O.hoerbar.alle)));
/** Ist die Figur für diesen Spieler da (QuestFigur.sichtbar)? */
export const figurDa = (q: QuestDef, F: QuestFigur, s: string, k: Kontext = OHNE): boolean => (!F.sichtbar || gilt(q, s, F.sichtbar, k)) && ausbauDa(F.ausbau, F.ausbau_bis, (x) => Boolean(k.schalter && k.schalter(x)));
/** Folgt die Figur diesem Spieler gerade (QuestFigur.folgt)? */
export const figurFolgt = (q: QuestDef, F: QuestFigur, s: string, k: Kontext = OHNE): boolean => Boolean(F.folgt && gilt(q, s, F.folgt.wenn, k));

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
/** Figur in mehreren Quests (Othmar Rehn: Quest 1, B3, B4): welche Quest spricht, wenn man sie anspricht? Server und Browser gleich.
 *  1. eine laufende Quest, deren Rede für diese Figur eine Bedingung hat (nicht nur die Standard-Rede am Ende),
 *  2. eine neue Quest, deren Voraussetzungen erfüllt sind und die die Figur anbietet (eine Antwort nimmt sie an),
 *  3. irgendeine laufende Quest, 4. die letzte abgeschlossene (in der Reihenfolge der Liste), 5. die erste. */
export function figurQuest(liste: QuestDef[], stand: (id: string) => string, npc: string, k: Kontext = OHNE): QuestDef | null {
  const mit = liste.filter((q) => q.dialoge[npc] && q.figuren.some((f) => f.id === npc)); if (mit.length <= 1) return mit[0] || null;
  const ph = (q: QuestDef) => lage(q, stand(q.id)).phase;
  for (const q of mit) if (ph(q) === "laeuft") { const r = rede(q, npc, stand(q.id), k); if (r && r.wenn) return q; }
  for (const q of mit) { const s = stand(q.id); if (ph(q) !== "neu" || !gilt(q, s, { voraussetzungen: true }, k)) continue; const d = dialog(q, npc, s, k), D = q.dialoge[npc];
    if (d && d.antworten.some((a) => (D.optionen.find((o) => o.id === a.id)?.folge || []).some((v) => v.f.start))) return q; }
  const lauf = mit.find((q) => ph(q) === "laeuft"); if (lauf) return lauf;
  const fertig = mit.filter((q) => ph(q) === "fertig"); return fertig.length ? fertig[fertig.length - 1] : mit[0]; }
/** Zeichen über einer Figur, die in mehreren Quests steht: „?“ vor „!“ (verfolgt: nur Quests, für die das gilt) */
export function zeichenAlle(liste: QuestDef[], stand: (id: string) => string, npc: string, zaehlt: (q: QuestDef) => boolean = () => true): "!" | "?" | null {
  let aus: "!" | "?" | null = null; for (const q of liste) { if (!q.figuren.some((f) => f.id === npc) || !zaehlt(q)) continue; const z = zeichen(q, stand(q.id), npc); if (z === "?") return "?"; if (z) aus = z; } return aus; }
/** Was eine Antwort bewirkt (null: gibt es hier nicht). Nur Antworten, die die aktuelle Begrüßung anbietet, zählen. */
export function antwort(q: QuestDef, npc: string, s: string, a: string, k: Kontext): Folge | null { const D = q.dialoge[npc]; if (!D) return null;
  const angeboten = dialog(q, npc, s, k); if (!angeboten || !angeboten.antworten.some((x) => x.id === a)) return null;
  const o = D.optionen.find((x) => x.id === a); const v = o && o.folge.find((x) => gilt(q, s, x.wenn, k)); return v ? v.f : null; }
/** Die Zeilen einer Folge als Gespräch (Name der Figur, Platzhalter) */
export const folgeZeilen = (q: QuestDef, npc: string, s: string, t: Text[]): Zeile[] => { const F = figur(q, npc); return zeilen(q, s, F ? F.name : npc, t); };
/** Den Stand nach einer Folge (ohne Abschluss – der geht über die Datenbank) */
export function nachFolge(q: QuestDef, s: string, f: Folge, zufall: () => number = Math.random): string { let l = lage(q, s);
  if (f.anbieten && l.phase === "neu") l = { ...l, angeboten: true };
  if (f.start && l.phase === "neu") { l = { ...l, phase: "laeuft", bits: 0, angeboten: true }; if (q.reihenfolge && !q.reihenfolge.fest) l.r = Math.floor(zufall() * fakultaet(q.reihenfolge.teile.length)) % fakultaet(q.reihenfolge.teile.length); } /* Rätsel: Reihenfolge je Spieler */
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
  const R = q.reihenfolge;
  for (const S of q.schritte) { if (R && S.id === R.schritt && S.anzahl) { if (m.art !== "objekt" || !R.teile.includes(m.id) || !moeglich(q, stand(l), S.id)) continue; /* Rätsel: nur das nächste Teil zählt, ein falsches setzt zurück */
      const i = zs.indexOf(S), z = [...l.z], soll = reihe(q, stand(l))[z[i]]; z[i] = m.id === soll ? Math.min(S.anzahl, z[i] + 1) : 0; l = { ...l, z }; if (z[i] >= S.anzahl) l = { ...l, bits: l.bits | bit(q, S.id) }; continue; }
    if (!passt(S.ereignis, m) || !moeglich(q, stand(l), S.id)) continue;
    if (S.anzahl) { const i = zs.indexOf(S), z = [...l.z]; z[i] = Math.min(S.anzahl, z[i] + 1); l = { ...l, z }; if (z[i] >= S.anzahl) l = { ...l, bits: l.bits | bit(q, S.id) }; }
    else l = { ...l, bits: l.bits | bit(q, S.id) }; }
  return stand(l); }
/** Sperre eines Sammelziels oder Rezepts: Text oder null (erlaubt). Ohne Eintrag: nicht Teil dieser Quest (undefined). */
export function sperre(q: QuestDef, art: "sammeln" | "herstellen", id: string, s: string, k: Kontext = OHNE): string | null | undefined {
  const L = q.sperren && q.sperren[art] && q.sperren[art]![id]; if (!L) return undefined; const x = L.find((p) => gilt(q, s, p.wenn, k)); return x ? einsetzen(q, s, x.text) : null; }
/** Ein Questobjekt benutzen: Text und neuer Stand */
export function objekt(q: QuestDef, s: string, id: string, k: Kontext = OHNE): { text: string; stand: string; falsch?: boolean } | null { const O = (q.objekte || []).find((o) => o.id === id); if (!O) return null;
  const R = q.reihenfolge && q.reihenfolge.teile.includes(id) ? q.reihenfolge : undefined, S = R ? q.schritte.find((x) => x.id === R.schritt) : q.schritte.find((x) => x.ereignis.art === "objekt" && x.ereignis.id === id);
  if (S && moeglich(q, s, S.id)) { if (O.braucht && !gilt(q, s, O.braucht.wenn, k)) return { text: einsetzen(q, s, O.braucht.text), stand: s };
    if (O.hoerbar) { const t = k.zeit ? k.zeit() : NaN; if (!(t >= 0) || !hoerbarJetzt(O, t)) return { text: einsetzen(q, s, O.hoerbar.still).replace(/\{sek\}/g, String(t >= 0 ? hoerbarIn(O, t) : O.hoerbar.alle)), stand: s }; }
    const n = ereignis(q, s, { art: "objekt", id });
    if (R && zaehler(q, n, S.id) === 0) return { text: einsetzen(q, n, R.falsch), stand: n, falsch: true }; /* falsche Reihenfolge: von vorn, ohne nehmen/geben */
    return { text: einsetzen(q, n, O.text), stand: n }; }
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
