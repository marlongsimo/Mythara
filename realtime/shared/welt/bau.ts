/*
 * World Pipeline – aus einer Region (wie sie im Repository liegt) werden Gehraster und Chunks, wie Simulation und Client sie laden.
 * Reine Rechnung: dieselbe Funktion nutzen Werkzeuge, Editor und Prüfung.
 */
import { CHUNK_FELDER, chunkName, regionFelder } from "./typen";
import type { GelaendeBibliothek, ObjektBibliothek, ObjektDef, RegionDaten, Kollision, Platzierung, ChunkDaten, Figur, Interaktion, Spawnzone, Ausgang, Region, Zone } from "./typen";

/** Liegt der Punkt (in Rechenfeldern, ab dem Fußpunkt gemessen) in der Kollisionsfläche? */
type Flaeche = Exclude<Kollision, { art: "gebaeude" }>;
function trifft(k: Flaeche, x: number, y: number): boolean {
  if (k.art === "kreis") return Math.hypot(x - (k.dx || 0), y - (k.dy || 0)) <= k.r;
  if (k.art === "rechteck") return x >= k.x && x <= k.x + k.b && y >= k.y && y <= k.y + k.h;
  let innen = false; const p = k.punkte;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) if ((p[i][1] > y) !== (p[j][1] > y) && x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) innen = !innen;
  return innen;
}
/** Umgebendes Rechteck einer Kollisionsfläche [x0, y0, x1, y1] */
function rahmen(k: Flaeche): number[] {
  if (k.art === "kreis") return [(k.dx || 0) - k.r, (k.dy || 0) - k.r, (k.dx || 0) + k.r, (k.dy || 0) + k.r];
  if (k.art === "rechteck") return [k.x, k.y, k.x + k.b, k.y + k.h];
  return [Math.min(...k.punkte.map((p) => p[0])), Math.min(...k.punkte.map((p) => p[1])), Math.max(...k.punkte.map((p) => p[0])), Math.max(...k.punkte.map((p) => p[1]))];
}
/** Drehung (#148) eines Versatzes vom Fußpunkt, im Uhrzeigersinn von oben gesehen (x nach Osten, y nach Süden): 90° macht aus Osten Süden */
export function drehe(dx: number, dy: number, dreh = 0): [number, number] { const d = ((dreh % 360) + 360) % 360;
  return d === 90 ? [-dy, dx] : d === 180 ? [-dx, -dy] : d === 270 ? [dy, -dx] : [dx, dy]; }
/** Welche Kollision gilt für diese Platzierung? (eigene Angabe vor Bibliothek) */
export const kollisionVon = (p: Platzierung, def: ObjektDef | undefined): Kollision | null => (p.kollision !== undefined ? p.kollision : def ? def.kollision : null);

/** Die Rechenfelder, die eine Platzierung versperrt: [i, j] in Regionskoordinaten.
 *  Ein Feld gilt als versperrt, wenn die Fläche mindestens vier von neun Messpunkten des Feldes trifft; das Feld unter dem Fußpunkt eines Kreises immer. */
export function sperrFelder(p: Platzierung, def: ObjektDef | undefined): number[][] {
  const k = kollisionVon(p, def); if (!k) return [];
  const d = p.dreh || 0;
  if (k.art === "gebaeude") { const f = gebaeudeFelder(p, k); if (!d) return f; /* #148: die Felder des ungedrehten Gebäudes um den Fußpunkt drehen (Feldmitten) */
    const da = new Set<string>(); for (const [i, j] of f) { const [cx, cy] = drehe(i + 0.5 - p.x, j + 0.5 - p.y, d); da.add(Math.floor(p.x + cx) + "," + Math.floor(p.y + cy)); }
    return [...da].map((x) => x.split(",").map(Number)); }
  const s = p.s ?? 1, sp = p.spiegeln ? -1 : 1, [x0, y0, x1, y1] = rahmen(k), aus: number[][] = [];
  /* örtlich (spiegeln, Maßstab) → gedreht → Welt; Messpunkte rückwärts: Welt → zurückgedreht → örtlich */
  const ecken = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map(([x, y]) => drehe(x * s * sp, y * s, d));
  const ax = p.x + Math.min(...ecken.map((e) => e[0])), bx = p.x + Math.max(...ecken.map((e) => e[0])), ay = p.y + Math.min(...ecken.map((e) => e[1])), by = p.y + Math.max(...ecken.map((e) => e[1]));
  for (let j = Math.floor(ay); j <= Math.floor(by); j++) for (let i = Math.floor(ax); i <= Math.floor(bx); i++) {
    let n = 0; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) { const [ux, uy] = drehe(i + (a + 0.5) / 3 - p.x, j + (b + 0.5) / 3 - p.y, 360 - d); if (trifft(k, ux / (s * sp), uy / s)) n++; }
    if (n >= 4) aus.push([i, j]);
  }
  if (k.art === "kreis") { const [cx, cy] = drehe((k.dx || 0) * s * sp, (k.dy || 0) * s, d), i = Math.floor(p.x + cx), j = Math.floor(p.y + cy); if (!aus.some((f) => f[0] === i && f[1] === j)) aus.push([i, j]); }
  return aus;
}

/** Räumliches Gebäude: volle Baukörper versperren ihre Fläche, begehbare nur ihre Wände; in der Südwand bleiben die Türen frei.
 *  Jede Wand belegt genau eine Zeile bzw. Spalte – die, in der ihre Mittellinie liegt (eine Viertel Feldbreite innerhalb der Außenkante).
 *  Die Tür lässt jede Zelle der Südwand frei, die sie zu mehr als 0,3 Feldern überdeckt. */
function gebaeudeFelder(p: Platzierung, k: Extract<Kollision, { art: "gebaeude" }>): number[][] {
  const s = p.s ?? 1, W = 0.25, zu = new Set<string>(), frei = new Set<string>();
  void W; const ueber = (ax0: number, ay0: number, ax1: number, ay1: number, i: number, j: number) => Math.max(0, Math.min(ax1, i + 1) - Math.max(ax0, i)) * Math.max(0, Math.min(ay1, j + 1) - Math.max(ay0, j));
  const streifen = (x0: number, y0: number, x1: number, y1: number, mind: number) => {
    for (let j = Math.floor(y0); j < Math.ceil(y1); j++) for (let i = Math.floor(x0); i < Math.ceil(x1); i++) if (ueber(x0, y0, x1, y1, i, j) > mind) zu.add(i + "," + j); };
  for (const b of k.koerper) { const x0 = p.x + b.x0 * s, x1 = p.x + b.x1 * s, y0 = p.y + b.y0 * s, y1 = p.y + b.y1 * s;
    if (b.voll) { streifen(x0, y0, x1, y1, 0.4); continue; }
    const rN = Math.floor(y0 + W / 2), rS = Math.floor(y1 - W / 2), cW = Math.floor(x0 + W / 2), cO = Math.floor(x1 - W / 2);
    for (let i = cW; i <= cO; i++) { zu.add(i + "," + rN); zu.add(i + "," + rS); }
    for (let j = rN; j <= rS; j++) { zu.add(cW + "," + j); zu.add(cO + "," + j); }
    for (const t of k.tueren) { if (Math.abs(t.y - b.y1) > 0.01 || t.x0 < b.x0 || t.x1 > b.x1) continue;
      const tx0 = p.x + t.x0 * s, tx1 = p.x + t.x1 * s;
      for (let i = cW + 1; i < cO; i++) if (Math.min(i + 1, tx1) - Math.max(i, tx0) > 0.3) frei.add(i + "," + rS); } }
  /* Möbel: jedes Feld, das ein Möbelstück zu mehr als einem Viertel bedeckt oder dessen Mitte darin liegt, ist gesperrt (die Türlücke bleibt frei) */
  for (const m of k.moebel || []) { const x0 = p.x + m.x0 * s, x1 = p.x + m.x1 * s, y0 = p.y + m.y0 * s, y1 = p.y + m.y1 * s;
    for (let j = Math.floor(y0); j < Math.ceil(y1); j++) for (let i = Math.floor(x0); i < Math.ceil(x1); i++) {
      const mitte = i + 0.5 >= x0 && i + 0.5 <= x1 && j + 0.5 >= y0 && j + 0.5 <= y1; if (mitte || ueber(x0, y0, x1, y1, i, j) > 0.25) zu.add(i + "," + j); } }
  return [...zu].filter((f) => !frei.has(f)).map((f) => f.split(",").map(Number));
}

/** Gehraster einer ganzen Region: eine Zeile je Rechenfeld-Reihe, „.“ frei, „~“ Wasser, „#“ gesperrt.
 *  Reihenfolge: Gelände → Objekte → von Hand sperren → von Hand freigeben. */
export function gehRaster(d: RegionDaten, gelaende: GelaendeBibliothek, objekte: ObjektBibliothek): string[] {
  const [B, H] = regionFelder(d.region), art = new Map(gelaende.arten.map((a) => [a.zeichen, a])), def = new Map(objekte.objekte.map((o) => [o.id, o]));
  const g: string[][] = d.gelaende.map((z) => [...z].map((c) => { const a = art.get(c); return !a ? "#" : a.wasser ? "~" : a.begehbar ? "." : "#"; }));
  const setze = (i: number, j: number, c: string) => { if (i >= 0 && j >= 0 && i < B && j < H) g[j][i] = c; };
  for (const p of d.objekte) if (!p.ausbau && !p.ausbau_bis) for (const [i, j] of sperrFelder(p, def.get(p.objekt))) setze(i, j, "#"); /* Stadtstufen: sperren je Spieler (ChunkDaten.ausbau) */
  const flaeche = (z: { x0: number; y0: number; x1: number; y1: number }, c: string) => {
    for (let j = Math.floor(z.y0); j < Math.ceil(z.y1); j++) for (let i = Math.floor(z.x0); i < Math.ceil(z.x1); i++) if (i + 0.5 >= z.x0 && i + 0.5 <= z.x1 && j + 0.5 >= z.y0 && j + 0.5 <= z.y1) setze(i, j, c); };
  for (const z of d.spiel.kollision.sperren) flaeche(z, "#");
  for (const z of d.spiel.kollision.freigeben) flaeche(z, ".");
  return g.map((z) => z.join(""));
}

/** Was die Welt außerhalb der Chunks über eine Region wissen muss (für Server und Client) – Lagen in Weltkoordinaten */
export interface RegionKopf { region: Region; start: number[][]; spawnzonen: Spawnzone[]; ausgaenge: Ausgang[] }
export interface Gebaut { kopf: RegionKopf; chunks: ChunkDaten[]; /** Kennungen aller verwendeten Objekte */ benutzt: string[] }

/** Eine Region in Chunks zerlegen. Alle Lagen werden in Weltkoordinaten umgerechnet; jedes Ding liegt in dem Chunk, in dem sein Fußpunkt steht. */
export function chunksBauen(d: RegionDaten, gelaende: GelaendeBibliothek, objekte: ObjektBibliothek): Gebaut {
  const r = d.region, [B, H] = regionFelder(r), ox = r.ursprung[0] * CHUNK_FELDER, oy = r.ursprung[1] * CHUNK_FELDER, geh = gehRaster(d, gelaende, objekte);
  const chunks = new Map<string, ChunkDaten>();
  for (let cy = 0; cy < r.chunks[1]; cy++) for (let cx = 0; cx < r.chunks[0]; cx++) { const wx = r.ursprung[0] + cx, wy = r.ursprung[1] + cy;
    chunks.set(chunkName(wx, wy), { cx: wx, cy: wy, region: r.id, boden: chunkName(wx, wy) + ".webp",
      geh: geh.slice(cy * CHUNK_FELDER, (cy + 1) * CHUNK_FELDER).map((z) => z.slice(cx * CHUNK_FELDER, (cx + 1) * CHUNK_FELDER)), objekte: [], figuren: [], interaktionen: [] }); }
  /* Was knapp außerhalb steht (Bäume am Rand), kommt in den nächstgelegenen Chunk der Region */
  const heim = (x: number, y: number): ChunkDaten => chunks.get(chunkName(
    r.ursprung[0] + Math.max(0, Math.min(r.chunks[0] - 1, Math.floor(x / CHUNK_FELDER))), r.ursprung[1] + Math.max(0, Math.min(r.chunks[1] - 1, Math.floor(y / CHUNK_FELDER)))))!;
  const rund = (v: number) => Math.round(v * 100) / 100;
  for (const p of d.objekte) heim(p.x, p.y).objekte.push({ ...p, x: rund(p.x + ox), y: rund(p.y + oy) });
  { const def = new Map(objekte.objekte.map((o) => [o.id, o])); for (const p of d.objekte) { if (!p.ausbau && !p.ausbau_bis) continue; const f = sperrFelder(p, def.get(p.objekt)); if (!f.length) continue; /* Stadtstufen */
    const c = heim(p.x, p.y); (c.ausbau || (c.ausbau = [])).push({ m: `${p.ausbau || ""}|${p.ausbau_bis || ""}`, f: f.map(([i, j]) => [i + ox, j + oy]) }); } }
  for (const f of d.spiel.figuren) heim(f.x, f.y).figuren.push({ ...f, x: rund(f.x + ox), y: rund(f.y + oy) } as Figur);
  for (const a of d.spiel.interaktionen) heim(a.x, a.y).interaktionen.push({ ...a, x: rund(a.x + ox), y: rund(a.y + oy) } as Interaktion);
  for (const c of chunks.values()) c.objekte.sort((a, b) => a.y - b.y);
  const zone = <Z extends Zone>(z: Z): Z => (z.art === "kreis" ? { ...z, x: z.x + ox, y: z.y + oy } : { ...z, x0: z.x0 + ox, y0: z.y0 + oy, x1: z.x1 + ox, y1: z.y1 + oy });
  void B; void H;
  return {
    kopf: { region: r, start: d.spiel.start.map(([x, y]) => [x + ox, y + oy]), spawnzonen: d.spiel.spawnzonen.map((s) => ({ ...s, zone: zone(s.zone) })), ausgaenge: d.spiel.ausgaenge.map((a) => ({ ...a, zone: zone(a.zone) })) },
    chunks: [...chunks.values()], benutzt: [...new Set(d.objekte.map((p) => p.objekt))].sort(),
  };
}
