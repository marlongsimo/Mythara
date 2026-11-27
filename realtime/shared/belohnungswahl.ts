/*
 * Riftmere – Belohnung zur Auswahl (#146). Regel des Nutzers (Kanon): Eine Quest darf eine Belohnung zur Auswahl nur anbieten, wenn man die nicht
 * gewählten Gegenstände auch auf anderem Weg bekommt – als Beute (auch über Platzhalter „@selten:Bogen“), im Laden oder durch Herstellen.
 * Geprüft im Test (belohnung-wahl.test.mjs) für alle Quests und Entwürfe; der Server bucht beim Abholen nur eine der angebotenen Wahlen (questmotor.ts).
 */
import { MONSTER } from "./config";
import { GEGENSTAENDE } from "./gegenstaende";
import { LADEN_LISTE } from "./laeden";
import { REZEPTE } from "./handwerk";
import type { QuestDef } from "./questbau";

/** Woher bekommt man diesen Gegenstand außer aus der Quest? („Beute: Bandit“, „Laden: …“, „Herstellen: …“) – null: nirgends */
export function andererWeg(g: string): string | null { const G = GEGENSTAENDE[g]; if (!G) return null;
  for (const [typ, M] of Object.entries(MONSTER)) for (const R of M.drops || []) for (const w of R.wurf) {
    if (w.g === g) return `Beute: ${M.name || typ}`;
    if (w.g.startsWith("@") && G.platz && !G.untauschbar) { const [sel, art] = w.g.slice(1).split(":"); if (G.seltenheit === sel && (!art || (G.art || "").toLowerCase().includes(art.toLowerCase()))) return `Beute: ${M.name || typ} (${w.g})`; } }
  for (const L of LADEN_LISTE) if (L.waren.some((w) => w.g === g)) return `Laden: ${L.name}`;
  const r = REZEPTE.find((x) => x.ergebnis === g && !x.quest); if (r) return `Herstellen: ${r.id}`;
  return null; }
/** Verstöße einer Quest gegen die Regel (leer: in Ordnung) */
export function wahlPruefen(q: QuestDef): string[] { const W = (q.belohnung || {}).wahl || [], aus: string[] = [];
  if (W.length === 1) aus.push(`${q.id}: eine Auswahl braucht mindestens zwei Gegenstände`);
  for (const w of W) { if (!GEGENSTAENDE[w.g]) aus.push(`${q.id}: ${w.g} gibt es nicht`); else if (!andererWeg(w.g)) aus.push(`${q.id}: ${w.g} bekommt man nur aus der Quest`); }
  return aus; }
