/*
 * Riftmere – Zunfthäuser (#167 Steinhag, #168 außerhalb; Konzept doku/konzepte/hauptstaedte.md): Orte für Meister eines Berufs, erst ab Stufe 60.
 * Baustein (Systeme): der Zugang prüft die Berufsstufe (Tür mit beruf, shared/boss.ts – Server und Browser gleich; die „Wache“ sagt den Text),
 * drinnen eine Bankkiste (shared/bank.ts BANKKISTEN: nur ablegen und abheben). Die Orte, Türfelder und Kisten liefert Welt – dann hier mit zunftEinrichten eintragen.
 */
import { TUEREN } from "./bosse";
import type { Tuer } from "./boss";
import { BANKKISTEN } from "./bank";
import { beruf } from "./berufe";
import { WERKSTAETTEN } from "./handwerk";

/** Ab dieser Berufsstufe öffnet eine Zunft (Entscheidung des Nutzers, 27.11.) */
export const ZUNFT_STUFE = 60;

export interface Zunft { id: string; name: string; /** Beruf (shared/berufe.ts), dessen Stufe zählt */ beruf: string; ort: string; issue: number }
export const ZUENFTE: Zunft[] = [
  { id: "bergmannszunft", name: "Stollen der Bergmannszunft", beruf: "bergbau", ort: "Steinhag, unter dem Zunftviertel", issue: 167 },
  { id: "zunftschmiede", name: "Zunftschmiede", beruf: "schmieden", ort: "Steinhag, Zunftviertel", issue: 167 },
  { id: "holzfaellerhof", name: "Holzfällerhof", beruf: "holzfaellerei", ort: "Erlengrund, bei der Sägemühle", issue: 168 },
  { id: "kraeutergarten", name: "Kräutergarten der Heilkundigen", beruf: "kraeuterkunde", ort: "Waldmark, bei Mira", issue: 168 },
  { id: "kochzunft", name: "Kochzunft", beruf: "kochen", ort: "Haferstedt, bei Bäckerei und Mühle", issue: 168 },
  { id: "fischerzunft", name: "Fischerzunft", beruf: "fischen", ort: "Kielmund, am Hafen", issue: 168 },
];
export const zunft = (id: string): Zunft | undefined => ZUENFTE.find((z) => z.id === id);

/** Was die Wache sagt, wenn die Stufe fehlt */
export const zunftZu = (Z: Zunft): string => `„Nur für Meister.“ Die Wache der ${Z.name} lässt dich nicht ein – dafür brauchst du ${(beruf(Z.beruf) || { name: Z.beruf }).name} ${ZUNFT_STUFE}.`;

/** Eine Zunft einrichten, sobald Welt sie gebaut hat: Tür (Feld in Weltfeldern, Ecken eingeschlossen; eingang = Interaktion mit Teleport, z. B. der Abstieg in den Stollen)
 *  und Bankkiste (Kennung der Interaktion in den Weltdaten und ihre Stelle). Gibt die Tür zurück. */
export function zunftEinrichten(id: string, tuer: { feld: [number, number, number, number]; eingang?: string }, kiste?: { id: string; x: number; y: number }): Tuer {
  const Z = zunft(id); if (!Z) throw new Error(`Zunft ${id} gibt es nicht`);
  const T: Tuer = { id: "zunft_" + Z.id, feld: tuer.feld, zu: zunftZu(Z), beruf: { id: Z.beruf, level: ZUNFT_STUFE }, ...(tuer.eingang ? { eingang: tuer.eingang } : {}) };
  if (!TUEREN.some((t) => t.id === T.id)) TUEREN.push(T);
  if (kiste && !BANKKISTEN.some((k) => k.id === kiste.id)) BANKKISTEN.push({ id: kiste.id, name: `Bankkiste – ${Z.name}`, x: kiste.x, y: kiste.y, ort: "waldmark" });
  return T; }

/** Stationen einer Zunft: erst ab der Zunftstufe ihres Berufs nutzbar (die Zunftschmiede ist ein offener Hof – die Sperre sitzt an Esse und Amboss) */
export function zunftStationen(id: string, stellen: { id: string; station: "esse" | "amboss"; x: number; y: number; ort: string; name?: string }[]): void {
  const Z = zunft(id); if (!Z) throw new Error(`Zunft ${id} gibt es nicht`);
  for (const S of stellen) if (!WERKSTAETTEN.some((W) => W.id === S.id)) WERKSTAETTEN.push({ ...S, beruf: { id: Z.beruf, level: ZUNFT_STUFE }, gesperrt: zunftZu(Z) }); }

/* ───── Steinhag (#167, Welt 72658709, welt/hochlande_orte.json → hauptstadt) ───── */
/* Stollen der Bergmannszunft: der Abstieg im Zunftviertel (Interaktion steinhag_zunftstollen_eingang) öffnet erst ab Bergbau 60; unten die Bankkiste der Zunfthalle */
zunftEinrichten("bergmannszunft", { feld: [7066, 5944, 7066, 5944], eingang: "steinhag_zunftstollen_eingang" }, { id: "zunftstollen_bankkiste", x: 11878, y: 9646.4 });
/* Zunftschmiede: vier Essen und zwei Ambosse im Hof der Zunft, ab Schmieden 60 */
zunftStationen("zunftschmiede", [
  ...[7055, 7058.3, 7061.7, 7065].map((x, i) => ({ id: `esse_zunft_${i + 1}`, station: "esse" as const, x, y: 5934.4, ort: "fl_216_183" })),
  ...[7056.6, 7063.4].map((x, i) => ({ id: `amboss_zunft_${i + 1}`, station: "amboss" as const, x, y: 5935.6, ort: "fl_216_183" })),
]);
/* Neue Stationen (Konzept: keine neuen Rohstoffe): Schmelzofen in der Zunfthalle (hinter dem Abstieg ab Bergbau 60) und Brennofen im Zunftviertel (für alle) –
   beide schmelzen wie die Esse (dieselben Rezepte, auch die Glut) */
WERKSTAETTEN.push({ id: "schmelzofen_zunft", station: "esse", name: "Schmelzofen", x: 11866, y: 9646.6, ort: "steinhag_zunftstollen" },
  { id: "brennofen_zunft", station: "esse", name: "Brennofen", x: 7049, y: 5934, ort: "fl_216_183" });
