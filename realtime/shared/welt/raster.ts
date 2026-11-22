/*
 * World Pipeline – das Gehraster der offenen Welt: Chunks kommen und gehen, die Abfragen bleiben dieselben.
 * Entspricht shared/karte.ts (fels, begehbar, frei, schieben, naechstFrei, weg) – nur ohne feste Kartengröße
 * und ohne gemeinsamen Zustand: Jede Welt hat ihr eigenes Raster. Reine Rechnung, läuft auf Server und im Browser gleich.
 *
 * Lagen in Rechenfeldern der Welt. Was nicht geladen ist, gilt als Fels.
 */
import { CHUNK_FELDER } from "./typen";
import type { ChunkDaten } from "./typen";

export interface Punkt { x: number; y: number }
const C = CHUNK_FELDER, FREI = 0, FELS = 1, WASSER = 2;
/* Chunk-Koordinaten dürfen negativ sein; der Schlüssel verschiebt sie in den positiven Bereich */
const VERSATZ = 32768, schluessel = (cx: number, cy: number): number => (cx + VERSATZ) * 65536 + (cy + VERSATZ);

/** Kleinste-zuerst-Halde für die Wegsuche (Feldnummer mit Kosten) */
class Halde {
  private id: number[] = []; private wert: number[] = [];
  get leer(): boolean { return this.id.length === 0; }
  dazu(id: number, wert: number): void { const a = this.id, w = this.wert; let i = a.length; a.push(id); w.push(wert);
    while (i > 0) { const e = (i - 1) >> 1; if (w[e] <= wert) break; a[i] = a[e]; w[i] = w[e]; i = e; } a[i] = id; w[i] = wert; }
  nimm(): number { const a = this.id, w = this.wert, oben = a[0], id = a.pop() as number, wert = w.pop() as number, n = a.length;
    if (n > 0) { let i = 0; for (;;) { let k = 2 * i + 1; if (k >= n) break; if (k + 1 < n && w[k + 1] < w[k]) k++; if (w[k] >= wert) break; a[i] = a[k]; w[i] = w[k]; i = k; } a[i] = id; w[i] = wert; }
    return oben; }
}

export class WeltRaster {
  private chunks = new Map<number, Uint8Array>();
  /** So viele Felder darf eine Wegsuche höchstens ansehen (schützt vor langen Suchen nach unerreichbaren Zielen) */
  suchGrenze = 6000;

  /** Einen Chunk einsetzen (Gehraster: „.“ frei, „~“ Wasser, alles andere gesperrt) */
  dazu(c: Pick<ChunkDaten, "cx" | "cy" | "geh">): void {
    const a = new Uint8Array(C * C).fill(FELS);
    for (let j = 0; j < C; j++) { const z = c.geh[j] || ""; for (let i = 0; i < C; i++) { const ch = z[i]; a[j * C + i] = ch === "." ? FREI : ch === "~" ? WASSER : FELS; } }
    this.chunks.set(schluessel(c.cx, c.cy), a); this.zuletzt = -1;
  }
  /** Felder sperren (etwa ein geschlossenes Tor), Lage in Rechenfeldern der Welt; gilt für schon geladene Chunks */
  sperren(x0: number, y0: number, x1: number, y1: number): void {
    for (let j = Math.floor(y0); j < Math.ceil(y1); j++) for (let i = Math.floor(x0); i < Math.ceil(x1); i++) { const cx = Math.floor(i / C), cy = Math.floor(j / C), a = this.chunks.get(schluessel(cx, cy)); if (a) a[(j - cy * C) * C + (i - cx * C)] = FELS; }
    this.zuletzt = -1;
  }
  weg_damit(cx: number, cy: number): void { this.chunks.delete(schluessel(cx, cy)); this.zuletzt = -1; }
  hat(cx: number, cy: number): boolean { return this.chunks.has(schluessel(cx, cy)); }
  get anzahl(): number { return this.chunks.size; }

  /* Die meisten Abfragen treffen denselben Chunk wie die vorige: den zuletzt benutzten merken */
  private zuletzt = -1; private zuletztFeld: Uint8Array | undefined;
  private art(i: number, j: number): number {
    const cx = Math.floor(i / C), cy = Math.floor(j / C), k = schluessel(cx, cy);
    if (k !== this.zuletzt) { this.zuletzt = k; this.zuletztFeld = this.chunks.get(k); }
    const a = this.zuletztFeld; return a ? a[(j - cy * C) * C + (i - cx * C)] : FELS;
  }
  /** Versperrt das Feld den Weg? (Fels, Wasser, nicht geladen) */
  fels(i: number, j: number): boolean { return this.art(i, j) !== FREI; }
  /** Versperrt das Feld die Sicht? Nur Fels, Wasser nicht. */
  dicht(x: number, y: number): boolean { return this.art(Math.floor(x), Math.floor(y)) === FELS; }
  begehbar(x: number, y: number): boolean { return this.art(Math.floor(x), Math.floor(y)) === FREI; }

  /** Freie Linie von a nach b? rand: halbe Breite dessen, was hindurch soll (0 = Sichtlinie, geht über Wasser hinweg). */
  frei(a: Punkt, b: Punkt, rand = 0): boolean {
    const d = Math.hypot(a.x - b.x, a.y - b.y), n = Math.max(1, Math.ceil(d / 0.2)), nx = d > 0 ? -(b.y - a.y) / d : 0, ny = d > 0 ? (b.x - a.x) / d : 0;
    for (let k = 0; k <= n; k++) { const x = a.x + (b.x - a.x) * k / n, y = a.y + (b.y - a.y) * k / n;
      if (rand > 0 ? !this.begehbar(x, y) : this.dicht(x, y)) return false;
      if (rand > 0 && (!this.begehbar(x + nx * rand, y + ny * rand) || !this.begehbar(x - nx * rand, y - ny * rand))) return false; }
    return true;
  }

  /** Einen Kreis aus dem Fels schieben (nach einer Bewegung) */
  schieben(e: { x: number; y: number; r: number }): void {
    const i0 = Math.floor(e.x), j0 = Math.floor(e.y);
    for (let i = i0 - 1; i <= i0 + 1; i++) for (let j = j0 - 1; j <= j0 + 1; j++) { if (!this.fels(i, j)) continue;
      const nx = Math.max(i, Math.min(i + 1, e.x)), ny = Math.max(j, Math.min(j + 1, e.y)), dx = e.x - nx, dy = e.y - ny, d = Math.hypot(dx, dy);
      if (d >= e.r) continue;
      if (d > 1e-4) { e.x = nx + dx / d * e.r; e.y = ny + dy / d * e.r; }
      else { const p = this.naechstFrei({ x: i0 + 0.5, y: j0 + 0.5 }); if (p) { e.x = p.x; e.y = p.y; } return; } } // mitten im Fels: auf das nächste freie Feld
  }

  /** Das nächste begehbare Feld zu einem Punkt: Suche in wachsenden Ringen, höchstens `weit` Felder. Nichts gefunden: null. */
  naechstFrei(p: Punkt, weit = 24): Punkt | null {
    if (this.begehbar(p.x, p.y)) return { x: p.x, y: p.y };
    const i0 = Math.floor(p.x), j0 = Math.floor(p.y); let best: Punkt | null = null, bd = Infinity;
    for (let r = 1; r <= weit; r++) {
      /* Was im Ring r liegt, ist mindestens r - 1 entfernt: Ist schon etwas Näheres gefunden, kann kein weiterer Ring es schlagen */
      if (best && bd <= r - 1) break;
      for (let k = -r; k <= r; k++) for (const [i, j] of [[i0 + k, j0 - r], [i0 + k, j0 + r], [i0 - r, j0 + k], [i0 + r, j0 + k]]) {
        if (this.fels(i, j)) continue; const d = Math.hypot(i + 0.5 - p.x, j + 0.5 - p.y); if (d < bd) { bd = d; best = { x: i + 0.5, y: j + 0.5 }; } }
    }
    return best;
  }

  /** Wegsuche A* über die Felder, acht Richtungen, nicht um Ecken schneiden. Zurück: Wegpunkte (ohne den Start), geglättet. Kein Weg: leere Liste.
   *  Gesucht wird in einem Fenster um Start und Ziel (mit `luft` Feldern Rand) und höchstens über `suchGrenze` Felder. */
  weg(von: Punkt, nach: Punkt, rand = 0.3, luft = 24): Punkt[] {
    const ziel = this.naechstFrei(nach), start = this.naechstFrei(von); if (!ziel || !start) return [];
    if (this.frei(start, ziel, rand)) return [ziel];
    const si = Math.floor(start.x), sj = Math.floor(start.y), zi = Math.floor(ziel.x), zj = Math.floor(ziel.y);
    const x0 = Math.min(si, zi) - luft, y0 = Math.min(sj, zj) - luft, B = Math.abs(si - zi) + 2 * luft + 1, H = Math.abs(sj - zj) + 2 * luft + 1, N = B * H;
    const g = new Float32Array(N).fill(Infinity), her = new Int32Array(N).fill(-1), zu = new Uint8Array(N), offen = new Halde();
    const h = (i: number, j: number) => { const dx = Math.abs(i - zi), dy = Math.abs(j - zj); return Math.max(dx, dy) + 0.414 * Math.min(dx, dy); };
    const s0 = (sj - y0) * B + (si - x0), z0 = (zj - y0) * B + (zi - x0); g[s0] = 0; offen.dazu(s0, h(si, sj));
    let gesehen = 0, da = false;
    while (!offen.leer) {
      const c = offen.nimm(); if (zu[c]) continue; zu[c] = 1; if (c === z0) { da = true; break; } if (++gesehen > this.suchGrenze) break;
      const ci = c % B + x0, cj = Math.floor(c / B) + y0;
      for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) { if (!di && !dj) continue; const i = ci + di, j = cj + dj;
        if (i < x0 || j < y0 || i >= x0 + B || j >= y0 + H || this.fels(i, j)) continue;
        if (di && dj && (this.fels(ci + di, cj) || this.fels(ci, cj + dj))) continue;
        const n = (j - y0) * B + (i - x0), kosten = g[c] + (di && dj ? 1.414 : 1); if (kosten < g[n]) { g[n] = kosten; her[n] = c; offen.dazu(n, kosten + h(i, j)); } }
    }
    if (!da) return [];
    const roh: Punkt[] = [ziel]; for (let c = her[z0]; c >= 0 && c !== s0; c = her[c]) roh.push({ x: c % B + x0 + 0.5, y: Math.floor(c / B) + y0 + 0.5 }); roh.reverse();
    /* glätten: von der aktuellen Stelle aus immer den fernsten Punkt nehmen, zu dem der Weg frei ist */
    const aus: Punkt[] = []; let hier = start, k = 0;
    while (k < roh.length) { let m = k; for (let n = roh.length - 1; n > k; n--) if (this.frei(hier, roh[n], rand)) { m = n; break; } aus.push(roh[m]); hier = roh[m]; k = m + 1; }
    return aus;
  }
}
