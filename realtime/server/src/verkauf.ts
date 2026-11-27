/*
 * Riftmere – an Händler verkaufen (#87) und Trödler (#88). Prüft Laden, Nähe, Öffnung und Preis (shared/laeden.ts ankaufPreis)
 * und verkauft dann atomar (inventar.ts verkaufen: Ware raus und Splitter rein, oder gar nichts).
 * Nicht verkaufbar ist, was nicht handelbar ist: Questgegenstände, gebundener Questlohn, geladene Waffen „(s)“ (shared/gegenstaende.ts handelbar).
 */
import { LAEDEN, ladenOffen, ankaufPreis, KAUF_WEIT, type LadenId } from "../../shared/laeden";
import { GEGENSTAENDE } from "../../shared/gegenstaende";
import { verkaufen } from "./inventar";
type Sb = (pfad: string, init?: RequestInit) => Promise<unknown>;
export type Verkauft = { laden: string; g: string; name: string; n: number; splitter: number };
/** n Stück aus Rucksackfach i an den Händler laden verkaufen. wx/wy: Stelle des Spielers (Weltfelder), stand: Queststände (Laden offen?) */
export function ladenVerkauf(sb: Sb, nutzer: string, laden: unknown, i: unknown, n: unknown, wx: number | undefined, wy: number | undefined, stand: (id: string) => string): { fehler: string } | Verkauft {
  const L = LAEDEN[String(laden) as LadenId]; if (!L) return { fehler: "Diesen Händler gibt es nicht." };
  if (!ladenOffen(L, stand)) return { fehler: L.zu || "Hier ist zu." };
  if (wx === undefined || wy === undefined || Math.hypot(wx - L.x, wy - L.y) > KAUF_WEIT) return { fehler: `Geh näher an ${L.haendler}.` };
  const r = verkaufen(sb, nutzer, Number(i), Number(n), (g, d) => ankaufPreis(L, g, d));
  if (typeof r === "string") return { fehler: r === "Das kauft dieser Händler nicht." ? `${L.haendler} kauft das nicht.` : r };
  return { laden: L.id, g: r.g, name: GEGENSTAENDE[r.g] ? GEGENSTAENDE[r.g].name : r.g, n: r.n, splitter: r.splitter }; }
