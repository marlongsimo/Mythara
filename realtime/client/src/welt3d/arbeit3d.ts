/*
 * Riftmere – Arbeits-Bewegungen an fremden Figuren (Issue #67, shared/arbeit.ts): Werkzeugschlag (Holzbeil, Spitzhacke …), Werken, Angeln –
 * mit dem Werkzeug in der Hand und zum Ziel gedreht, solange der andere arbeitet. Für Mitspieler (mitspieler.ts) und Helden im Kampfgebiet (kampf3d.ts).
 */
import { type Arbeit, arbeitSchluessel } from "../../../shared/arbeit";
interface Fig { blick(x: number, y: number): void; beilHieb?(url: string, clip?: string): number; werken?(wahl: string[], url?: string): number; angeln?(url: string, phase: "auswerfen" | "warten" | "einholen"): boolean; beilWeg?(): void }
export class ArbeitAnzeige {
  private key = ""; private naechst = 0;
  /** jedes Bild: w = was der andere gerade tut (undefined: nichts); fx, fy: wo seine Figur steht (Weltfelder) */
  schritt(f: Fig, w: Arbeit | undefined, fx: number, fy: number): void { const k = arbeitSchluessel(w), jetzt = performance.now();
    if (!w) { if (this.key) { this.key = ""; this.naechst = 0; if (f.beilWeg) f.beilWeg(); } return; }
    if (w.x !== undefined && w.y !== undefined && Math.hypot(w.x - fx, w.y - fy) > 0.05) f.blick(w.x - fx, w.y - fy);
    if (w.a === "angeln") { if (k !== this.key && w.u && f.angeln) f.angeln(w.u, "auswerfen"); this.key = k; return; } /* die Rute bleibt draußen */
    this.key = k; if (jetzt < this.naechst) return;
    const ms = w.a === "werken" && f.werken ? f.werken([w.c || "", "angriff"].filter(Boolean), w.u || "") : w.u && f.beilHieb ? f.beilHieb(w.u, w.c || "") : 0;
    this.naechst = jetzt + Math.max(900, ms || 1200); }
  /** Für Prüfungen: was gerade gezeigt wird */
  get zeigt(): string { return this.key; }
}
