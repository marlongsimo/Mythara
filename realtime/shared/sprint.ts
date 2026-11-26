/*
 * Mythara – Sprint: 2 Felder je Tick statt 1 („Felder und Schräge“, shared/feld.ts), solange Ausdauer da ist („Sprintkonzept v1.0“), Verbrauch und Erholung nach der Formel der Laufenergie aus OSRS,
 * bei uns mit dem Geschick-Level an Stelle von Agility (ohne Gewicht):
 *   Ausdauer intern 0–10 000 (= 0–100 %), verarbeitet je Game-Tick (0,5 s).
 *   Verbrauch je Tick beim Sprinten:      67 × (1 − Geschick ÷ 300)          (OSRS: (67 + 67 × Gewicht ÷ 64) × (1 − Agility ÷ 300), Gewicht 0)
 *   Erholung je Tick beim Gehen/Stehen:   Geschick ÷ 6 + 8
 *   → Geschick 1: rund 75 s Sprint, leer bis voll gut 10 Minuten; Geschick 99: rund 112 s Sprint, voll in knapp 3½ Minuten.
 * Aus dem Sprintkonzept bleiben: Erholung erst 3 Ticks (1,5 s) nach dem Sprintende, neu sprinten erst ab 20 %.
 * Dieselbe Rechnung läuft im Browser (offene Welt) und auf dem Server (Kampfgebiete, shared/sim.ts).
 */
export const SPRINT_TEMPO = 2, SPRINT_TICK = 0.5, SPRINT_MIN = 20, SPRINT_ERHOLUNG_NACH = 3, AUSDAUER_MAX = 10000;
const lv = (g: number) => Math.max(1, Math.min(99, Math.floor(g || 1)));
/** Verbrauch je Tick (Einheiten von 10 000) */
export const verbrauchJeTick = (geschick: number): number => 67 * (1 - lv(geschick) / 300);
/** Erholung je Tick (Einheiten von 10 000) */
export const erholungJeTick = (geschick: number): number => lv(geschick) / 6 + 8;
/** Sprintdauer von voll bis leer in Sekunden; Erholung von leer bis voll in Sekunden */
export const sprintDauer = (geschick: number): number => Math.ceil(AUSDAUER_MAX / verbrauchJeTick(geschick)) * SPRINT_TICK;
export const erholDauer = (geschick: number): number => Math.ceil(AUSDAUER_MAX / erholungJeTick(geschick)) * SPRINT_TICK;

/** Der Zustand eines Sprinters; schritt() rechnet in ganzen Ticks weiter. wert in Prozent (0–100) */
export class Ausdauer {
  einheiten = AUSDAUER_MAX; an = false; /** Faktor auf die Erholung (Wirkungen, z. B. Bauerneintopf 1.25) */ erholMal = 1; private rest = 0; private ruhe = SPRINT_ERHOLUNG_NACH;
  get wert(): number { return this.einheiten / 100; }
  set wert(p: number) { this.einheiten = Math.max(0, Math.min(AUSDAUER_MAX, Math.round(p * 100))); }
  /** Sprint an/aus; an nur ab 20 %. Zurück: ob er jetzt läuft */
  umschalten(): boolean { if (this.an) { this.an = false; this.ruhe = 0; } else if (this.wert >= SPRINT_MIN) this.an = true; return this.an; }
  setzen(an: boolean): boolean { if (an !== this.an) this.umschalten(); return this.an; }
  /** dt Sekunden; laeuft: der Held bewegt sich (nur dann wird verbraucht) */
  schritt(dt: number, laeuft: boolean, geschick: number): void {
    this.rest += dt; while (this.rest >= SPRINT_TICK) { this.rest -= SPRINT_TICK;
      if (this.an && laeuft) { this.einheiten = Math.max(0, this.einheiten - verbrauchJeTick(geschick)); this.ruhe = 0; if (this.einheiten <= 0) this.an = false; }
      else if (this.ruhe < SPRINT_ERHOLUNG_NACH) this.ruhe++;
      else this.einheiten = Math.min(AUSDAUER_MAX, this.einheiten + erholungJeTick(geschick) * this.erholMal); } }
  /** Tempo-Faktor jetzt */
  get faktor(): number { return this.an && this.einheiten > 0 ? SPRINT_TEMPO : 1; }
}
