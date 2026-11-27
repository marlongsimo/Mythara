/*
 * Riftmere – Zunfthäuser (#167 Steinhag, #168 außerhalb; Konzept doku/konzepte/hauptstaedte.md): Orte für Meister eines Berufs, erst ab Stufe 60.
 * Baustein (Systeme): der Zugang prüft die Berufsstufe (Tür mit beruf, shared/boss.ts – Server und Browser gleich; die „Wache“ sagt den Text),
 * drinnen eine Bankkiste (shared/bank.ts BANKKISTEN: nur ablegen und abheben). Die Orte, Türfelder und Kisten liefert Welt – dann hier mit zunftEinrichten eintragen.
 */
import { TUEREN } from "./bosse";
import type { Tuer } from "./boss";
import { BANKKISTEN } from "./bank";
import { beruf } from "./berufe";

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

/* Hier kommen die Zünfte hin, sobald Welt die Orte nennt (#167, #168), z. B.:
   zunftEinrichten("bergmannszunft", { feld: [x0, y0, x1, y1], eingang: "zunftstollen_abstieg" }, { id: "bankkiste_bergmannszunft", x, y }); */
