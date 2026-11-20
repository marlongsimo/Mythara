/*
 * Mythara – modulare 3D-Figuren (gerendert in 8 Richtungen): Datenformate aus der Figuren-Pipeline (realtime/character-pipeline).
 * figur.json beschreibt eine Figur (Körperregionen, Animationen, Richtungen, Fußpunkt, Maßstab), ausruestung.json den Katalog.
 * Reine Daten und Regeln – kein Phaser, damit auch Tests und Werkzeuge sie nutzen können.
 */
export type Slot = "head" | "hair" | "beard" | "chest" | "shoulders" | "hands" | "legs" | "feet" | "back" | "main_hand" | "off_hand";
export type Seltenheit = "common" | "uncommon" | "rare" | "epic" | "legendary";
/** Welche Gegenstände eine Figur trägt (Slot → Gegenstands-ID; leer/undefined = nichts). Kommt später vom Server; der Client stellt nur dar. */
export type Ausruestung = Partial<Record<Slot, string | null>>;
export interface AnimationDef { frames: number; fps: number; schleife: boolean; halten: boolean; tempoMeterProSek?: number | null }
export interface EbeneDef { atlas: string; art: "koerper" | "item"; region?: string; item?: string; slot?: Slot }
export interface FigurDaten {
  schema: string; id: string; name: string; testAsset: boolean; klasse: string; skelett: string;
  bild: { breite: number; hoehe: number }; fuss: { x: number; y: number }; fussNorm: { x: number; y: number }; pixelProMeter: number;
  spiel: { figurHoehePx: number; renderHoehePx: number; massstab: number };
  richtungen: { id: string; grad: number }[]; animationen: Record<string, AnimationDef>;
  ebenen: Record<string, EbeneDef>; koerperRegionen: string[]; standardAusruestung: Ausruestung; katalog: string; slots: Record<Slot, { name: string; sockel: string | string[] }>;
  /** Haltungen: je Waffenart eine Zuordnung Spielzustand → Animation (z. B. einhand: attack → attack_1h); standard = Haltung ohne Waffe */
  haltungen?: Record<string, Record<string, string> | string>;
}
export interface Gegenstand {
  id: string; name: string; slot: Slot; type: string; rarity: Seltenheit; skeleton: string; occupies: Slot[];
  hides: { regions: string[]; slots: Slot[] }; stats: Record<string, unknown>; special: Record<string, unknown>; visual: Record<string, unknown>;
  testAsset?: boolean; ebene: string; atlas: string | null; /** Haltung, die der Gegenstand verlangt (Waffen, Schilde) */ stance?: string;
}
export interface Katalog { schema: string; skelett: string; seltenheit: Record<Seltenheit, string>; gegenstaende: Gegenstand[] }
/** Metadaten im Atlas einer Ebene (meta.mythara): Tiefe je Animation/Richtung/Frame (größer = weiter hinten), leere Frames */
export interface EbenenMeta { ebene: string; art: string; slot?: Slot; region?: string; tiefe: Record<string, Record<string, (number | null)[]>>; leer: string[]; testAsset?: boolean }

/** Frame-Name im Atlas einer Ebene */
export const frameName = (anim: string, richtung: string, i: number): string => `${anim}/${richtung}/${String(i).padStart(3, "0")}`;
/** Texturschlüssel einer Ebene in Phaser */
export const texturSchluessel = (figur: string, ebene: string): string => `fig3d:${figur}:${ebene}`;

/** Ist die Ausrüstung gültig? Zurück: Liste der Probleme (leer = in Ordnung). Gleiche Regeln wie die Pipeline (tools/ebenen.py). */
export function ausruestungPruefen(fig: FigurDaten, kat: Katalog, a: Ausruestung): string[] {
  const f: string[] = [], belegt = new Map<string, string>(), byId = new Map(kat.gegenstaende.map((g) => [g.id, g]));
  for (const [slot, id] of Object.entries(a)) { if (!id) continue; const g = byId.get(id);
    if (!g) { f.push(`${slot}: unbekannter Gegenstand ${id}`); continue; }
    if (g.slot !== slot) f.push(`${id} gehört in Slot ${g.slot}, nicht ${slot}`);
    if (g.skeleton !== fig.skelett) f.push(`${id}: Skelett ${g.skeleton} passt nicht zu ${fig.skelett}`);
    for (const s of g.occupies || [g.slot]) { const b = belegt.get(s); if (b && b !== id) f.push(`Slot ${s} doppelt belegt (${b}, ${id})`); belegt.set(s, id); } }
  return f;
}
/** Welche Ebenen sichtbar sind: Körper ohne verdeckte Regionen, Gegenstände ohne verdeckte Slots (z. B. Haare unter dem Helm). */
export function sichtbareEbenen(fig: FigurDaten, kat: Katalog, a: Ausruestung): { koerper: string[]; items: string[] } {
  const byId = new Map(kat.gegenstaende.map((g) => [g.id, g])), gs = Object.values(a).filter((x): x is string => Boolean(x)).map((id) => byId.get(id)).filter((g): g is Gegenstand => Boolean(g));
  const wegR = new Set(gs.flatMap((g) => g.hides.regions || [])), wegS = new Set(gs.flatMap((g) => g.hides.slots || []));
  return { koerper: fig.koerperRegionen.filter((r) => !wegR.has(r)).map((r) => "koerper:" + r).filter((e) => fig.ebenen[e]), items: gs.filter((g) => !wegS.has(g.slot)).map((g) => g.ebene).filter((e) => fig.ebenen[e]) };
}
/** Gegenstände eines Slots aus dem Katalog (für Auswahlmenüs) */
export const fuerSlot = (kat: Katalog, slot: Slot): Gegenstand[] => kat.gegenstaende.filter((g) => g.slot === slot);

/** Haltung aus der Ausrüstung: stance der Haupthand, sonst der Nebenhand, sonst die Standardhaltung der Figur. Zurück: Zuordnung Spielzustand → Animation. */
export function haltung(fig: FigurDaten, kat: Katalog, a: Ausruestung): Record<string, string> {
  const H = fig.haltungen || {}, byId = new Map(kat.gegenstaende.map((g) => [g.id, g])); let st: string | undefined;
  for (const s of ["main_hand", "off_hand"] as Slot[]) { const g = a[s] ? byId.get(a[s] as string) : undefined; if (g && g.stance) { st = g.stance; break; } }
  st = st || (typeof H.standard === "string" ? H.standard : undefined); const z = st ? H[st] : undefined; return z && typeof z === "object" ? { ...z } : {};
}
