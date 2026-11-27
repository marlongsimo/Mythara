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
 *   Phase 6 (#49):
 *   - Schweben (schweben: Sekunden ab Eintritt in die Phase): der Boss erhebt sich – Nahkampf erreicht ihn nicht („unerreichbar“), er selbst schlägt
 *     nicht zu und läuft nicht, seine Ansagen (nach sek) laufen weiter. Fern und Magie treffen wie immer.
 *   - Deckung (Ansage.deckung): Felder im Windschatten – vom Boss aus hinter Fels, Säule oder Wand – bleiben frei; sie leuchten gar nicht erst.
 *     Mit felder „raum“ trifft eine Ansage den ganzen Raum der Instanz (ohne Instanz: das Quadrat weite um den Boss) – „Schwarzer Flügelschlag“.
 *   - Mehrfachhieb (hiebe): so viele Treffer je Grundangriff in dieser Phase (Doppelhieb: 2).
 *
 * Stilwechsel (MonsterDef.stile, config.ts): ein Gegner wechselt im Kampf nach Zeit Waffe und Angriffsart (Federmutter) – reihum, je Stil sek Sekunden.
 * Verkleidung (MonsterDef.friedlichMit): wer einen dieser Gegenstände angelegt hat, wird von diesem Gegner nicht von selbst angegriffen.
 *
 * Instanz: ein Raum (Rechteck in Weltfeldern), der für jeden Spieler eine eigene Kopie ist, solange sein Schalter an ist
 * (QuestDef.schalter, z. B. „rotmantel_instanz“, solange B4 läuft). Mit eintritt kostet jeder Versuch einen Gegenstand (Federsiegel, #49): er wird beim
 * Betreten verbraucht; wer den Raum verlässt oder darin fällt, beendet den Versuch (die Kopie verschwindet sofort). Die Tür davor (Tuer.instanz)
 * ist dann nur offen, wenn der Spieler einen solchen Gegenstand dabeihat – oder im Raum bzw. in der Tür steht (hinaus geht es immer). Wer darin steht, sieht und trifft nur die Gegner seiner Kopie –
 * und andere Spieler nicht. Gegner einer Kopie kehren nicht wieder; die Kopie verschwindet 60 s, nachdem der Spieler sie verlassen hat.
 * Wellen: die Gegner einer Welle kommen, wenn die vorige gefallen ist; jede gefallene Welle meldet dem Questmotor
 * { art: "erlegen", typ: welle } (z. B. B4 „unterschlupf_welle“, der Schritt zählt 2).
 *
 * Tür: gesperrte Felder (Rechteck in Weltfeldern, Ecken eingeschlossen), je Spieler offen, wenn sein Schalter an ist (Schlüssel dabei,
 * Schritt erledigt, Quest fertig – das regelt die Quest über QuestDef.schalter). Server (Simulation) und Browser (Gehraster) sperren gleich.
 */
import type { Schadensart } from "./config";

/** Welche Felder eine Ansage trifft */
export type AnsageFelder = "rundum" | "ziel" | "raum" | [number, number][];
export interface Ansage {
  name: string;
  /** nach so vielen Grundangriffen des Bosses … */ alle?: number;
  /** … oder alle so viele Sekunden im Kampf */ sek?: number;
  felder: AnsageFelder; /** Felder um den Boss bzw. das Ziel (Standard 1) */ weite?: number;
  /** so viele Kampf-Ticks (0,5 s) leuchten die Felder vorher (Standard 2) */ vorlauf?: number;
  /** Schaden je Getroffenem (von–bis, kein Trefferwurf: wer stehen bleibt, wird getroffen) */ schaden: [number, number];
  art?: Schadensart;
  /** Deckung: Felder, die vom Boss aus hinter Fels oder Säule liegen, bleiben frei (Windschatten) */ deckung?: boolean;
}
export interface Ruf { /** Gegnerart (MONSTER) */ art: string; n: number; /** Abstand zum Boss in Feldern (Standard 2) */ weite?: number; text?: string }
export interface Heilort { /** Weltfelder */ x: number; y: number; r: number; /** Anteil des vollen Lebens */ menge: number; /** nur unter diesem Anteil des Lebens */ unter: number;
  /** so oft je Leben (Standard 1) */ mal?: number; /** von selbst hingehen */ hingehen?: boolean; /** so lange steht er dabei (Sekunden, Standard 1,5) */ dauer?: number; text?: string;
  /** nicht, wenn dieser Schalter für sein Ziel an ist (C3: Becken mit Heddas Moorwasser getrübt) */ ausser?: string }
export interface BossPhase { /** gilt ab diesem Anteil des Lebens abwärts (erste Phase: 1) */ ab: number; text?: string; ansagen?: Ansage[]; ruf?: Ruf; heilorte?: Heilort[];
  /** Schweben: so viele Sekunden ab Eintritt in die Phase für Nahkampf unerreichbar (schlägt selbst nicht zu) */ schweben?: number; /** Text beim Landen */ landen?: string;
  /** Treffer je Grundangriff (Doppelhieb: 2) */ hiebe?: number;
  /** Eingraben (#102, Sandmutter): so viele Sekunden ab Eintritt in die Phase für alles unangreifbar, dann taucht er wieder auf (Ansagen nach sek laufen weiter) */ eingraben?: number }
export interface BossDef { /** Gegnerart in MONSTER */ typ: string; phasen: BossPhase[] }

export interface InstanzGegner { /** Gegnerart (MONSTER) */ art: string; /** Weltfelder */ x: number; y: number }
export interface InstanzDef { id: string; name: string;
  /** der Raum in Weltfeldern: x0, y0, x1, y1 (Ecken eingeschlossen) */ feld: [number, number, number, number];
  /** Schalter je Spieler (QuestDef.schalter): an = eigene Kopie */ schalter: string;
  /** stehen von Anfang an in der Kopie (z. B. der Boss) */ gegner?: InstanzGegner[];
  /** kommen nacheinander, die nächste, wenn die vorige gefallen ist */ wellen?: InstanzGegner[][];
  /** Ereignis je gefallener Welle: { art: "erlegen", typ: welle } */ welle?: string;
  /** Sekunden zwischen zwei Wellen (Standard 3) */ pause?: number;
  /** Text beim Betreten der Kopie (Chat) */ text?: string;
  /** Eintritt: dieser Gegenstand wird je Versuch verbraucht (Federsiegel); ohne ihn entsteht keine Kopie */ eintritt?: string; /** Text, wenn er fehlt */ ohne?: string;
  /** #116: Schalter nach der Quest – dann der Boss in der stärkeren Fassung, wählbar öffentlich (offene Welt, kein Eintritt) oder eigene Instanz (allein) */ danach?: string;
  /** #116: Stärke der Boss-Gegner in der Quest-Kopie (Anteil von Leben und Schaden, Standard QUEST_STAERKE) */ questStaerke?: { leben: number; schaden: number };
  /** #116, später: so viele Spieler dürfen in eine Kopie (vorerst immer 1) */ gruppe?: number }
/** #116: In der Quest kämpft man den Boss allein und gegen eine schwächere Fassung */
export const QUEST_STAERKE = { leben: 0.7, schaden: 0.85 };
/** #116: Fassung einer Kopie – quest (allein, schwächer) oder stark (nach der Quest, eigene Instanz, normale Werte) */
export type BossFassung = "quest" | "stark" | "leer";
/** #116: Wahl am Eingang nach der Quest (Standard öffentlich) */
export type BossWahl = "oeffentlich" | "instanz";
export const BOSS_WAHL_STANDARD: BossWahl = "oeffentlich";
/** #116: Öffentlich bekommt jeder einen eigenen Wurf, der mindestens diesen Anteil des Lebens als Schaden gemacht hat */
export const BOSS_BEUTE_ANTEIL = 0.1;
/** Welche Kopie gilt für einen Spieler in dieser Instanz? null: keine (gemeinsame Welt – öffentlich gewählt).
 *  #116 (Klarstellung des Nutzers): vor der Quest gibt es keinen Boss – wer weder Quest-Schalter noch danach hat, steht in einer leeren Kopie des Raums
 *  (nur bei Instanzen mit danach; sonst wie bisher die gemeinsame Welt) */
export function instanzFassung(d: InstanzDef, an: (schalter: string) => boolean, wahl: BossWahl = BOSS_WAHL_STANDARD): BossFassung | null {
  if (d.danach && an(d.danach)) return wahl === "instanz" ? "stark" : null; if (an(d.schalter)) return "quest"; return d.danach ? "leer" : null; }

export interface Tuer { id: string; /** gesperrte Felder in Weltfeldern: x0, y0, x1, y1 (Ecken eingeschlossen) */ feld: [number, number, number, number];
  /** offen, wenn dieser Schalter für den Spieler an ist */ schalter: string; /** Text, wenn man davor steht */ zu: string;
  /** Tür vor einer Instanz mit Eintritt (InstanzDef.id): zusätzlich nur offen mit dem Gegenstand dabei – oder wenn man im Raum bzw. in der Tür steht */ instanz?: string;
  /** Eingang der Welt (Interaktion mit Teleport, z. B. „turm_wappentuer“), der nur bei offener Tür geht – sonst der Text zu (Browser) */ eingang?: string }

/** So lange bleibt eine Kopie ohne ihren Spieler bestehen (Sekunden) */
export const INSTANZ_LEER = 60;
/** Ansage: Standard-Vorlauf in Kampf-Ticks */
export const ANSAGE_VORLAUF = 2;

export const imFeld = (f: [number, number, number, number], x: number, y: number): boolean => { const i = Math.floor(x), j = Math.floor(y); return i >= f[0] && i <= f[2] && j >= f[1] && j <= f[3]; };
/** Die Phase (Index) eines Bosses bei diesem Anteil seines Lebens */
export function phaseBei(B: BossDef, anteil: number): number { let n = 0; B.phasen.forEach((p, i) => { if (anteil <= p.ab + 1e-9) n = i; }); return n; }
/** Die Felder einer Ansage (Mitten der Felder): um das Feld des Bosses (bx, by) bzw. des Ziels (zx, zy) */
export function ansageFelder(A: Ansage, bx: number, by: number, zx: number, zy: number, raum?: [number, number, number, number]): [number, number][] {
  const w = Math.max(0, Math.floor(A.weite ?? 1)), bi = Math.floor(bx), bj = Math.floor(by), aus: [number, number][] = [];
  if (A.felder === "rundum") { for (let dx = -w; dx <= w; dx++) for (let dy = -w; dy <= w; dy++) if (dx || dy) aus.push([bi + dx + 0.5, bj + dy + 0.5]); }
  else if (A.felder === "raum") { const R = raum || [bi - w, bj - w, bi + w, bj + w]; for (let i = R[0]; i <= R[2]; i++) for (let j = R[1]; j <= R[3]; j++) if (i !== bi || j !== bj) aus.push([i + 0.5, j + 0.5]); }
  else if (A.felder === "ziel") { const zi = Math.floor(zx), zj = Math.floor(zy); for (let dx = -w; dx <= w; dx++) for (let dy = -w; dy <= w; dy++) aus.push([zi + dx + 0.5, zj + dy + 0.5]); }
  else for (const [dx, dy] of A.felder) aus.push([bi + dx + 0.5, bj + dy + 0.5]);
  return aus; }
/** In welcher Instanz steht ein Spieler an dieser Stelle (Weltfelder)? an: ist ein Schalter für ihn an */
export function instanzBei(liste: InstanzDef[], x: number, y: number, an: (schalter: string) => boolean, wahl?: (id: string) => BossWahl): InstanzDef | null {
  return liste.find((d) => imFeld(d.feld, x, y) && instanzFassung(d, an, wahl ? wahl(d.id) : undefined) !== null) || null; }
/** Für Türen vor einer Instanz mit Eintritt: hat der Spieler den Gegenstand dabei, wo steht er (Weltfelder) */
export interface TuerLage { hat: (g: string) => boolean; x: number; y: number; /** #116: Wahl am Eingang je Instanz (Standard öffentlich) */ wahl?: (id: string) => BossWahl }
/** Ist die Tür für einen Spieler offen? */
export function tuerOffen(t: Tuer, an: (schalter: string) => boolean, L?: TuerLage, instanzen: InstanzDef[] = []): boolean { if (!an(t.schalter)) return false;
  const I = t.instanz ? instanzen.find((d) => d.id === t.instanz) : undefined; if (!I || !I.eintritt) return true;
  if (I.danach && an(I.danach) && (L && L.wahl ? L.wahl(I.id) : BOSS_WAHL_STANDARD) === "oeffentlich") return true; /* #116: öffentlich ohne Eintritt */ if (!L) return false;
  return L.hat(I.eintritt) || imFeld(I.feld, L.x, L.y) || imFeld(t.feld, L.x, L.y); }
/** Die Türen, die für einen Spieler zu sind */
export const tuerenZu = (liste: Tuer[], an: (schalter: string) => boolean, L?: TuerLage, instanzen: InstanzDef[] = []): Tuer[] => liste.filter((t) => !tuerOffen(t, an, L, instanzen));
