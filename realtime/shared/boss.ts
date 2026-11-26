/*
 * Riftmere – Boss-Baukasten, Instanzen und Türen (Fahrplan Phase 4, Issue #48). Nur Strukturen und Regeln – die Inhalte
 * (welche Bosse, welche Räume, welche Türen) stehen als Daten in shared/bosse.ts und trägt die Rolle Integration ein.
 *
 * Boss: ein Gegner aus MONSTER (config.ts), dazu eine BossDef mit Phasen nach Lebenspunkten. Jede Phase kann haben:
 *   - Angriffe mit Ansage: Felder leuchten vorlauf Kampf-Ticks (Standard 2 = 1 s) vorher auf, dann trifft es jeden, der noch darauf steht.
 *     Auslöser: alle n Grundangriffe (alle) oder alle n Sekunden (sek). Felder: „rundum“ (die Felder um den Boss, weite 1 = 8 Felder),
 *     „ziel“ (das Feld des Ziels und weite Felder drumherum) oder eine Liste [dx, dy] relativ zum Feld des Bosses.
 *   - Helfer rufen (beim Eintritt in die Phase, einmal je Leben): n Gegner der Art art neben dem Boss; sie kehren nicht wieder.
 *   - Heilorte: steht der Boss im Umkreis r und hat weniger als unter seines Lebens, heilt er menge (Anteil des Lebens), höchstens mal-mal
 *     (Standard 1) je Leben. Mit hingehen läuft er von selbst dorthin. dauer: so lange steht er (Trinken, Splitterbecken).
 *   Phase 6 (Schweben, Deckung) kommt als weitere Felder dazu.
 *
 * Instanz: ein Raum (Rechteck in Weltfeldern), der für jeden Spieler eine eigene Kopie ist, solange sein Schalter an ist
 * (QuestDef.schalter, z. B. „rotmantel_instanz“, solange B4 läuft). Wer darin steht, sieht und trifft nur die Gegner seiner Kopie –
 * und andere Spieler nicht. Gegner einer Kopie kehren nicht wieder; die Kopie verschwindet 60 s, nachdem der Spieler sie verlassen hat.
 * Wellen: die Gegner einer Welle kommen, wenn die vorige gefallen ist; jede gefallene Welle meldet dem Questmotor
 * { art: "erlegen", typ: welle } (z. B. B4 „unterschlupf_welle“, der Schritt zählt 2).
 *
 * Tür: gesperrte Felder (Rechteck in Weltfeldern, Ecken eingeschlossen), je Spieler offen, wenn sein Schalter an ist (Schlüssel dabei,
 * Schritt erledigt, Quest fertig – das regelt die Quest über QuestDef.schalter). Server (Simulation) und Browser (Gehraster) sperren gleich.
 */
import type { Schadensart } from "./config";

/** Welche Felder eine Ansage trifft */
export type AnsageFelder = "rundum" | "ziel" | [number, number][];
export interface Ansage {
  name: string;
  /** nach so vielen Grundangriffen des Bosses … */ alle?: number;
  /** … oder alle so viele Sekunden im Kampf */ sek?: number;
  felder: AnsageFelder; /** Felder um den Boss bzw. das Ziel (Standard 1) */ weite?: number;
  /** so viele Kampf-Ticks (0,5 s) leuchten die Felder vorher (Standard 2) */ vorlauf?: number;
  /** Schaden je Getroffenem (von–bis, kein Trefferwurf: wer stehen bleibt, wird getroffen) */ schaden: [number, number];
  art?: Schadensart;
}
export interface Ruf { /** Gegnerart (MONSTER) */ art: string; n: number; /** Abstand zum Boss in Feldern (Standard 2) */ weite?: number; text?: string }
export interface Heilort { /** Weltfelder */ x: number; y: number; r: number; /** Anteil des vollen Lebens */ menge: number; /** nur unter diesem Anteil des Lebens */ unter: number;
  /** so oft je Leben (Standard 1) */ mal?: number; /** von selbst hingehen */ hingehen?: boolean; /** so lange steht er dabei (Sekunden, Standard 1,5) */ dauer?: number; text?: string }
export interface BossPhase { /** gilt ab diesem Anteil des Lebens abwärts (erste Phase: 1) */ ab: number; text?: string; ansagen?: Ansage[]; ruf?: Ruf; heilorte?: Heilort[] }
export interface BossDef { /** Gegnerart in MONSTER */ typ: string; phasen: BossPhase[] }

export interface InstanzGegner { /** Gegnerart (MONSTER) */ art: string; /** Weltfelder */ x: number; y: number }
export interface InstanzDef { id: string; name: string;
  /** der Raum in Weltfeldern: x0, y0, x1, y1 (Ecken eingeschlossen) */ feld: [number, number, number, number];
  /** Schalter je Spieler (QuestDef.schalter): an = eigene Kopie */ schalter: string;
  /** stehen von Anfang an in der Kopie (z. B. der Boss) */ gegner?: InstanzGegner[];
  /** kommen nacheinander, die nächste, wenn die vorige gefallen ist */ wellen?: InstanzGegner[][];
  /** Ereignis je gefallener Welle: { art: "erlegen", typ: welle } */ welle?: string;
  /** Sekunden zwischen zwei Wellen (Standard 3) */ pause?: number;
  /** Text beim Betreten der Kopie (Chat) */ text?: string }

export interface Tuer { id: string; /** gesperrte Felder in Weltfeldern: x0, y0, x1, y1 (Ecken eingeschlossen) */ feld: [number, number, number, number];
  /** offen, wenn dieser Schalter für den Spieler an ist */ schalter: string; /** Text, wenn man davor steht */ zu: string }

/** So lange bleibt eine Kopie ohne ihren Spieler bestehen (Sekunden) */
export const INSTANZ_LEER = 60;
/** Ansage: Standard-Vorlauf in Kampf-Ticks */
export const ANSAGE_VORLAUF = 2;

export const imFeld = (f: [number, number, number, number], x: number, y: number): boolean => { const i = Math.floor(x), j = Math.floor(y); return i >= f[0] && i <= f[2] && j >= f[1] && j <= f[3]; };
/** Die Phase (Index) eines Bosses bei diesem Anteil seines Lebens */
export function phaseBei(B: BossDef, anteil: number): number { let n = 0; B.phasen.forEach((p, i) => { if (anteil <= p.ab + 1e-9) n = i; }); return n; }
/** Die Felder einer Ansage (Mitten der Felder): um das Feld des Bosses (bx, by) bzw. des Ziels (zx, zy) */
export function ansageFelder(A: Ansage, bx: number, by: number, zx: number, zy: number): [number, number][] {
  const w = Math.max(0, Math.floor(A.weite ?? 1)), bi = Math.floor(bx), bj = Math.floor(by), aus: [number, number][] = [];
  if (A.felder === "rundum") { for (let dx = -w; dx <= w; dx++) for (let dy = -w; dy <= w; dy++) if (dx || dy) aus.push([bi + dx + 0.5, bj + dy + 0.5]); }
  else if (A.felder === "ziel") { const zi = Math.floor(zx), zj = Math.floor(zy); for (let dx = -w; dx <= w; dx++) for (let dy = -w; dy <= w; dy++) aus.push([zi + dx + 0.5, zj + dy + 0.5]); }
  else for (const [dx, dy] of A.felder) aus.push([bi + dx + 0.5, bj + dy + 0.5]);
  return aus; }
/** In welcher Instanz steht ein Spieler an dieser Stelle (Weltfelder)? an: ist ein Schalter für ihn an */
export function instanzBei(liste: InstanzDef[], x: number, y: number, an: (schalter: string) => boolean): InstanzDef | null {
  return liste.find((d) => imFeld(d.feld, x, y) && an(d.schalter)) || null; }
/** Die Türen, die für einen Spieler zu sind */
export const tuerenZu = (liste: Tuer[], an: (schalter: string) => boolean): Tuer[] => liste.filter((t) => !an(t.schalter));
