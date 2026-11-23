/*
 * Mythara – Sprint („Sprintkonzept v1.0“): +30 % Tempo, solange Ausdauer da ist. Ausdauer 0–100 %, verarbeitet im Kampf-Tick (0,5 s).
 *   Sprintdauer und Erholung hängen vom Geschick-Level ab (Stützstellen aus dem Konzept, dazwischen gerade verbunden); das Tempo nie.
 *   Erholung beim Gehen und Stehen, erst 3 Ticks (1,5 s) nach dem Sprintende; neu sprinten erst ab 20 %.
 *   Festgelegt (im Konzept noch offen): bei Geschick 1 füllt sich die leere Leiste in 30 Sekunden (60 Ticks) – mit höherem Geschick entsprechend schneller.
 */
export const SPRINT_TEMPO = 1.3, SPRINT_TICK = 0.5, SPRINT_MIN = 20, SPRINT_ERHOLUNG_NACH = 3, SPRINT_VOLL_SEK = 30;
const DAUER: [number, number][] = [[1, 5], [10, 8], [25, 12], [50, 17], [75, 22], [99, 27]];
const ERHOLUNG: [number, number][] = [[1, 1], [10, 1.25], [25, 1.6], [50, 2.1], [75, 2.6], [99, 3]];
const stufe = (t: [number, number][], L: number): number => { const l = Math.max(1, Math.min(99, L)); for (let i = 1; i < t.length; i++) if (l <= t[i][0]) { const [a, x] = t[i - 1], [b, y] = t[i]; return x + (y - x) * (l - a) / (b - a); } return t[t.length - 1][1]; };
/** Sprintdauer von voll bis leer in Sekunden */
export const sprintDauer = (geschick: number): number => stufe(DAUER, geschick);
/** Erholungsfaktor gegenüber Geschick 1 */
export const erholungFaktor = (geschick: number): number => stufe(ERHOLUNG, geschick);
/** Verbrauch je Tick (Prozentpunkte) */
export const verbrauchJeTick = (geschick: number): number => 100 / (sprintDauer(geschick) / SPRINT_TICK);
/** Erholung je Tick (Prozentpunkte) */
export const erholungJeTick = (geschick: number): number => (100 / (SPRINT_VOLL_SEK / SPRINT_TICK)) * erholungFaktor(geschick);

/** Der Zustand eines Sprinters; schritt() rechnet in ganzen Ticks weiter */
export class Ausdauer {
  wert = 100; an = false; private rest = 0; private ruhe = SPRINT_ERHOLUNG_NACH;
  /** Sprint an/aus; an nur ab 20 %. Zurück: ob er jetzt läuft */
  umschalten(): boolean { if (this.an) { this.an = false; this.ruhe = 0; } else if (this.wert >= SPRINT_MIN) this.an = true; return this.an; }
  /** dt Sekunden; laeuft: der Held bewegt sich (nur dann wird verbraucht) */
  schritt(dt: number, laeuft: boolean, geschick: number): void {
    this.rest += dt; while (this.rest >= SPRINT_TICK) { this.rest -= SPRINT_TICK;
      if (this.an && laeuft) { this.wert = this.wert - verbrauchJeTick(geschick) <= 1e-6 ? 0 : this.wert - verbrauchJeTick(geschick); /* Rundung: die letzte Spur ist leer */ this.ruhe = 0; if (this.wert <= 0) { this.an = false; } }
      else if (this.ruhe < SPRINT_ERHOLUNG_NACH) this.ruhe++;
      else this.wert = Math.min(100, this.wert + erholungJeTick(geschick)); } }
  /** Tempo-Faktor jetzt */
  get faktor(): number { return this.an && this.wert > 0 ? SPRINT_TEMPO : 1; }
}
