/*
 * Riftmere – Kräuterkunde (Phase 5c, Issue #133; Konzept doku/konzepte/phase-5.md Abschnitt 5c).
 *   · Sammeln mit der Sichel (Sammel-Kern wie Holz und Erz, server/src/kraeuter.ts): Fundstellen aus der Welt (welt/kraeuter_standorte.json, #35),
 *     Kräuter-Stufen 1/10/20/35/45/65, Moment „Tau“ (zwei Kräuter, 50 % mehr XP), 25 % Splitter-Fund. Abgeerntet wächst das Kraut nach (Lindenblüte langsam).
 *   · Brauen am Kessel (Rezepte in shared/handwerk.ts, Beruf Kräuterkunde): feste Rezepte je Level, Zutaten + leeres Fläschchen, schwache und starke Fassung,
 *     Fehlschlag „Trüber Sud“ (25 % auf Rezeptstufe, 0 % ab +20), Moment „Siedepunkt“ (kein Fehlschlag, +50 % XP) – wie der Garpunkt beim Kochen.
 *   · Tränke belegen den Trank-Platz (shared/wirkungen.ts): eine Trank- und eine Essens-Wirkung zugleich; nach dem Trinken kommt das Fläschchen zurück.
 */
import ORTE from "../welt/kraeuter_standorte.json";
import type { SammelArt, SammelWerkzeug } from "./sammeln";

export const BERUF_KRAEUTER = "kraeuterkunde";
export type KrautArt = "wegerich" | "ringelblume" | "moorgloeckchen" | "eisenhut" | "nebelkraut" | "lindenbluete";
export interface KrautDef extends SammelArt { art: KrautArt; modell: string; leer: string; hoehe: number }
const M = "img/objekte3d/skilling/kraeuter/";
const K = (art: KrautArt, name: string, level: number, xp: number, lo: number, hi: number, fall: number, nachwachsen: number, hoehe = 0.6): KrautDef =>
  ({ art, name, level, xp, lo, hi, fall, nachwachsen, ertrag: art, werkzeug: "sichel", modell: M + art + ".glb", leer: M + art + "-geerntet.glb", hoehe });
export const KRAEUTER: Record<KrautArt, KrautDef> = {
  wegerich: K("wegerich", "Wegerich", 1, 10, 120, 250, 0.25, 20),
  ringelblume: K("ringelblume", "Ringelblume", 10, 18, 90, 240, 0.25, 30),
  moorgloeckchen: K("moorgloeckchen", "Moorglöckchen", 20, 30, 70, 220, 0.25, 45),
  eisenhut: K("eisenhut", "Eisenhut", 35, 50, 50, 200, 0.25, 60, 0.8),
  nebelkraut: K("nebelkraut", "Nebelkraut", 45, 75, 35, 180, 0.3, 90),
  lindenbluete: K("lindenbluete", "Lindenblüte", 65, 110, 20, 150, 0.5, 300, 0.5), /* wenige Blüten an der alten Linde, wachsen langsam nach */
};
export interface Krautstelle { id: string; art: KrautArt; x: number; y: number; region: string }
/** Fundstellen (Welt #35) – dazu die des Südens (Summweide, #120), sobald die Welt sie in kraeuter_standorte.json einträgt */
export const KRAUTSTELLEN: Krautstelle[] = (ORTE as unknown as { stellen: Krautstelle[] }).stellen.filter((s) => s.art in KRAEUTER);
export const krautstelle = (id: string): Krautstelle | undefined => KRAUTSTELLEN.find((s) => s.id === id);
/** Die Kessel zum Brauen (Kräuterhaus Waldmark, Heddas Hütte) – als Werkstätten in shared/handwerk.ts */
export const KESSEL: { id: string; x: number; y: number; region: string }[] = (ORTE as unknown as { kessel: { id: string; x: number; y: number; region: string }[] }).kessel;
/** Die Sichel: ein Werkzeug ohne Stufen (Laden: Handwerker; Handwerk 1 an der Werkbank) */
export const SICHELN: SammelWerkzeug[] = [{ g: "sichel", stufe: 0, level: 1 }];
export const KRAUT_TAKT_MS = 1500, KRAUT_WEIT = 1.8, TAU_CHANCE = 0.12, TAU_MS = 1500;
/** Fehlschlag beim Brauen: 25 % auf Rezeptstufe, 0 % ab Rezeptstufe + 20 */
export const SUD_FEHLSCHLAG = { grund: 0.25, bis: 20 };
