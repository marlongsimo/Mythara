/*
 * Wählt Animation und Richtung aus dem Zustand, den die Simulation (Server) liefert – der Animator entscheidet nichts über Spielregeln.
 * Grundzustände: idle, walk, run, block, death. Einmalige Aktionen (attack, hit, dodge, cast) spielen einmal und kehren dann zurück.
 * Lauf-Animationen werden an die tatsächliche Geschwindigkeit angepasst (Schritte passen zum Tempo, kein Rutschen).
 */
import type { AnimationRegistry } from "./AnimationRegistry";
import type { DirectionResolver } from "./DirectionResolver";
export interface Bewegungsstand { blick: number; tempo: number /* Meter je Sekunde */; tot: boolean; block: boolean }
export class CharacterAnimator {
  anim = "idle"; richtung = "S"; frame = 0; private t = 0; private einmal: string | null = null; private skala = 1;
  /** laufAb: ab diesem Tempo (m/s) läuft die Figur statt zu gehen; stehBis: darunter steht sie */
  constructor(private reg: AnimationRegistry, private dir: DirectionResolver, private laufAb = 2.6, private stehBis = 0.15) {}
  /** Einmalige Aktion auslösen (Ereignis vom Server: Hieb, Treffer …). Tod hat Vorrang und wird nicht unterbrochen. */
  ausloesen(anim: string): void { if (!this.reg.hat(anim) || this.anim === "death") return; if (anim === "hit" && this.einmal === "attack") return; this.einmal = anim; this.wechsel(anim); }
  private wechsel(a: string) { if (a !== this.anim) { this.anim = a; this.t = 0; } }
  /** Jeden Frame: dt in Sekunden, s = aktueller Stand der Figur */
  schritt(dt: number, s: Bewegungsstand): void {
    this.richtung = this.dir.aufloesen(s.blick);
    if (s.tot) { this.einmal = null; this.wechsel("death"); }
    else if (this.einmal) { const { fertig } = this.reg.frameBei(this.einmal, this.t + dt); if (fertig) { this.einmal = null; } }
    if (!s.tot && !this.einmal) { if (this.anim === "death") this.t = 0; this.wechsel(s.tempo > this.laufAb ? "run" : s.tempo > this.stehBis ? "walk" : s.block ? "block" : "idle"); }
    const d = this.reg.def(this.anim); this.skala = d.tempoMeterProSek && (this.anim === "walk" || this.anim === "run") ? Math.min(2, Math.max(0.5, s.tempo / d.tempoMeterProSek)) : 1;
    this.t += dt * this.skala; this.frame = this.reg.frameBei(this.anim, this.t).i;
  }
}
