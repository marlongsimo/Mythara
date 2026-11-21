/*
 * Der eigene Held: Aussehen und Startwaffe (Heldeneditor, Spiel und Spielserver gleich).
 *
 * Figuren: Grundmann und Grundfrau der Figuren-Fabrik, fürs Spiel aufbereitet von werkzeug/grundfigur.py
 * (img/figuren-fabrik/held.mann und held.frau: Körper, Haut als eigene Ebene, Frisuren, Bärte, Startwaffen).
 * Färben: Haut, Haar und Bart sind neutral gerendert; gefärbt wird „Helligkeit × Zielfarbe / Bezugshelligkeit“
 * (Bezug je Figur in held.<g>.json). Das Spiel macht das mit einer Farbmatrix, der Editor auf der Leinwand – beides mit farbMatrix().
 * Startwaffe → Ausrüstungssatz: Bis die Fertigkeiten aus dem Konzept „Ein Held. Drei Wege.“ kommen, nutzt der Held die Kampfwerte und
 * Fähigkeiten eines bisherigen Satzes (Nahkampf: Torvalds, Fernkampf: Orins, Magie: Vaelins). Die fünf Helden selbst sind nicht mehr wählbar.
 * Die erlaubten Werte stehen auch in der Datenbank (supabase/040_rpg_held.sql) – bei Änderungen beide anpassen.
 */
export type Geschlecht = "mann" | "frau";
export type Startwaffe = "schwert" | "bogen" | "stab";
export interface Aussehen { g: Geschlecht; frisur: string; bart: string; haar: string; haut: string }
export interface Held { aussehen: Aussehen; waffe: Startwaffe }

export const FRISUREN: Record<Geschlecht, { id: string; name: string }[]> = {
  mann: [{ id: "glatze", name: "Glatze" }, { id: "militaer", name: "Kurz (Militär)" }, { id: "undercut_bun", name: "Undercut mit Knoten" }, { id: "zerzaust", name: "Zerzaust" }, { id: "zopf_eng", name: "Zopf" }, { id: "scheitel", name: "Scheitel" }],
  frau: [{ id: "glatze", name: "Glatze" }, { id: "dutt_hoch", name: "Dutt" }, { id: "wuschel_hoch", name: "Hochgesteckt" }, { id: "pixie", name: "Pixie" }, { id: "zopf_wild", name: "Zopf" }, { id: "seitenbob", name: "Seitenbob" }],
};
export const BAERTE: { id: string; name: string }[] = [{ id: "ohne", name: "Ohne Bart" }, { id: "stoppeln", name: "Dreitagebart" }, { id: "vollbart", name: "Vollbart" }, { id: "hufeisen", name: "Hufeisen" }, { id: "schnurrbart", name: "Schnurrbart" }, { id: "wikinger", name: "Langer Bart" }];
export const HAARFARBEN: Record<string, { name: string; rgb: [number, number, number] }> = {
  schwarz: { name: "Schwarz", rgb: [34, 30, 28] }, dunkelbraun: { name: "Dunkelbraun", rgb: [72, 46, 28] }, hellbraun: { name: "Hellbraun", rgb: [156, 108, 64] },
  grau: { name: "Grau", rgb: [158, 156, 152] }, orange: { name: "Rotorange", rgb: [200, 100, 44] },
};
export const HAUTFARBEN: Record<string, { name: string; rgb: [number, number, number] }> = {
  hell: { name: "Hell", rgb: [232, 190, 160] }, mittel: { name: "Mittel", rgb: [212, 160, 122] }, oliv: { name: "Oliv", rgb: [190, 140, 98] },
  braun: { name: "Braun", rgb: [146, 98, 66] }, dunkel: { name: "Dunkel", rgb: [100, 66, 46] },
};
export const STARTWAFFEN: Record<Startwaffe, { name: string; weg: string; text: string; waffen: string[]; angriff: string; satz: string }> = {
  schwert: { name: "Schwert und Schild", weg: "Nahkampf", text: "Druck auf kurze Distanz: binden, unterbrechen, Treffer mit dem Schild abwehren.", waffen: ["waffe.schwert.schildwahrer", "schild.kreuz"], angriff: "stich", satz: "schildwaechter" },
  bogen: { name: "Bogen", weg: "Fernkampf", text: "Reichweite und Präzision: früher Schaden aus sicherer Entfernung.", waffen: ["waffe.bogen"], angriff: "bogen", satz: "kopfgeldjaeger" },
  stab: { name: "Stab", weg: "Magie", text: "Kontrolle und Fläche: verlangsamen, zurückstoßen, mehrere Gegner treffen.", waffen: ["waffe.zeremonienstab"], angriff: "zauber_stab", satz: "elementarist" },
};
export const STANDARD: Held = { aussehen: { g: "mann", frisur: "militaer", bart: "ohne", haar: "dunkelbraun", haut: "mittel" }, waffe: "schwert" };

/** Nur erlaubte Werte; sonst null */
export function heldPruefen(roh: unknown): Held | null {
  const h = roh as { aussehen?: Partial<Aussehen>; waffe?: string } | null; if (!h || typeof h !== "object" || !h.aussehen) return null; const a = h.aussehen;
  if (a.g !== "mann" && a.g !== "frau") return null;
  if (!FRISUREN[a.g].some((f) => f.id === a.frisur) || !HAARFARBEN[a.haar || ""] || !HAUTFARBEN[a.haut || ""]) return null;
  const bart = a.g === "mann" ? a.bart : "ohne"; if (!BAERTE.some((b) => b.id === bart)) return null;
  if (!h.waffe || !(h.waffe in STARTWAFFEN)) return null;
  return { aussehen: { g: a.g, frisur: a.frisur!, bart: bart!, haar: a.haar!, haut: a.haut! }, waffe: h.waffe as Startwaffe };
}
/** Der Ausrüstungssatz (Kampfwerte und Fähigkeiten in shared/config.ts HELDEN) zur Startwaffe */
export const satzVon = (h: Held | null): string => (h ? STARTWAFFEN[h.waffe].satz : "schildwaechter");
/** Figur der Fabrik zum Geschlecht */
export const figurVon = (a: Aussehen): string => "held." + a.g;
/** Ebenen der Figur in Zeichenreihenfolge (ohne Waffen) und welche davon gefärbt werden */
export function ebenenVon(a: Aussehen): { ebene: string; faerben?: "haut" | "haar" | "bart" }[] {
  const e: { ebene: string; faerben?: "haut" | "haar" | "bart" }[] = [{ ebene: "koerper" }, { ebene: "haut", faerben: "haut" }];
  if (a.g === "mann" && a.bart !== "ohne") e.push({ ebene: "kopf.bart." + a.bart, faerben: "bart" });
  if (a.frisur !== "glatze") e.push({ ebene: "kopf.haar." + a.frisur, faerben: "haar" });
  return e;
}
/** Zielfarbe einer gefärbten Ebene */
export function farbeVon(a: Aussehen, art: "haut" | "haar" | "bart"): [number, number, number] { return art === "haut" ? HAUTFARBEN[a.haut].rgb : HAARFARBEN[a.haar].rgb; }
/** Farbmatrix (4 × 5, Zeilen R, G, B, A) für „Helligkeit × Zielfarbe / Bezugshelligkeit“ – für Phaser (ColorMatrix) und die Leinwand */
export function farbMatrix(ziel: [number, number, number], bezug: number): number[] {
  const z = (c: number) => c / Math.max(1, bezug), zeile = (k: number) => [0.299 * k, 0.587 * k, 0.114 * k, 0, 0];
  return [...zeile(z(ziel[0])), ...zeile(z(ziel[1])), ...zeile(z(ziel[2])), 0, 0, 0, 1, 0];
}
/** Kurzer Schlüssel eines Aussehens (Zwischenspeicher, Vergleich) */
export const aussehenSchluessel = (h: Held): string => [h.aussehen.g, h.aussehen.frisur, h.aussehen.bart, h.aussehen.haar, h.aussehen.haut, h.waffe].join(".");
