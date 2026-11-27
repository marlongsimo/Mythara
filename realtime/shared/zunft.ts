/*
 * Riftmere – Zunfthäuser (#167 Steinhag, #168 außerhalb; Konzept doku/konzepte/hauptstaedte.md): Orte für Meister eines Berufs, erst ab Stufe 60.
 * Baustein (Systeme): der Zugang prüft die Berufsstufe (Tür mit beruf, shared/boss.ts – Server und Browser gleich; die „Wache“ sagt den Text),
 * drinnen eine Bankkiste (shared/bank.ts BANKKISTEN: nur ablegen und abheben). Die Orte, Türfelder und Kisten liefert Welt – dann hier mit zunftEinrichten eintragen.
 */
import { TUEREN } from "./bosse";
import type { Tuer } from "./boss";
import { BANKKISTEN } from "./bank";
import { beruf } from "./berufe";
import { WERKSTAETTEN, type WeltStation } from "./handwerk";

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

/** Stationen einer Zunft: erst ab der Zunftstufe ihres Berufs nutzbar (zusätzlich zur Tür – wer doch drinnen steht, kann ohne Stufe nichts herstellen) */
export function zunftStationen(id: string, stellen: { id: string; station: WeltStation; x: number; y: number; ort: string; name?: string }[]): void {
  const Z = zunft(id); if (!Z) throw new Error(`Zunft ${id} gibt es nicht`);
  for (const S of stellen) if (!WERKSTAETTEN.some((W) => W.id === S.id)) WERKSTAETTEN.push({ ...S, beruf: { id: Z.beruf, level: ZUNFT_STUFE }, gesperrt: zunftZu(Z) }); }

/* ───── Die Zunfthäuser (Welt c29d415b, #168; Orte in welt/zunft_orte.json, hochlande_orte.json → hauptstadt, kueste_orte.json → fischerzunft):
   je Zunft eingehegt mit genau einem Tor (feld), dort die Wache (shared/laeden.ts), drinnen Bankkiste und Stationen. Holz-, Kräuter- und Fangstellen drinnen trägt Integration ein. ───── */
/* Steinhag (#167): der Stollen der Bergmannszunft – Abstieg ab Bergbau 60, unten Bankkiste und Schmelzofen (wie die Esse) */
zunftEinrichten("bergmannszunft", { feld: [7066, 5944, 7066, 5944], eingang: "steinhag_zunftstollen_eingang" }, { id: "zunftstollen_bankkiste", x: 11878, y: 9646.4 });
WERKSTAETTEN.push({ id: "schmelzofen_zunft", station: "esse", name: "Schmelzofen", x: 11866, y: 9646.6, ort: "steinhag_zunftstollen" });
/* Steinhag (#167): die Zunftschmiede – ummauerter Hof mit Tor, vier Essen, zwei Ambosse und der Brennofen (schmilzt wie die Esse), ab Schmieden 60 */
zunftEinrichten("zunftschmiede", { feld: [7056, 5934, 7059, 5935] }, { id: "steinhag_zunftschmiede_bankkiste", x: 7067, y: 5927.4 });
zunftStationen("zunftschmiede", [
  ...[7055, 7057.7, 7060.3, 7063].map((x, i) => ({ id: `esse_zunft_${i + 1}`, station: "esse" as const, x, y: 5931.2, ort: "fl_216_183" })),
  ...[7056.3, 7061.7].map((x, i) => ({ id: `amboss_zunft_${i + 1}`, station: "amboss" as const, x, y: 5932.8, ort: "fl_216_183" })),
  { id: "brennofen_zunft", station: "esse", name: "Brennofen", x: 7051.5, y: 5930.4, ort: "fl_216_183" }]);
/* Erlengrund: der Holzfällerhof im Hain südlich der Sägemühle – Werkbank; Kernbäume, Eiben, Weltenbäume (Sammelstellen, Integration) */
zunftEinrichten("holzfaellerhof", { feld: [6395, 7009, 6399, 7009] }, { id: "holzfaellerhof_bankkiste", x: 6406, y: 7023.6 });
zunftStationen("holzfaellerhof", [{ id: "werkbank_holzfaellerhof", station: "werkbank", x: 6397.5, y: 7023.1, ort: "fl_186_211" }]);
/* Haferstedt: die Kochzunft im Kochhof hinter der Bäckerei – drei Herde, zwei Backöfen, ein Kessel */
zunftEinrichten("kochzunft", { feld: [6230, 6963, 6232, 6966] }, { id: "kochzunft_bankkiste", x: 6234, y: 6969.4 });
zunftStationen("kochzunft", [
  ...[6235, 6238.5, 6242].map((x, i) => ({ id: `herd_kochzunft_${i + 1}`, station: "herd" as const, x, y: 6963.4, ort: "fl_186_211" })),
  ...[6235.5, 6239.5].map((x, i) => ({ id: `backofen_kochzunft_${i + 1}`, station: "backofen" as const, x, y: 6969.4, ort: "fl_186_211" })),
  { id: "kessel_kochzunft", station: "kessel", x: 6242.4, y: 6968.2, ort: "fl_186_211" }]);
/* Waldmark: der Kräutergarten der Heilkundigen am Teich neben Mira – sechs Beete (kraeuter_standorte.json), ein Kessel */
zunftEinrichten("kraeutergarten", { feld: [6461, 6437, 6463, 6441] }, { id: "kraeutergarten_bankkiste", x: 6469.6, y: 6438.2 });
zunftStationen("kraeutergarten", [{ id: "kessel_kraeutergarten", station: "kessel", x: 6469.6, y: 6440.8, ort: "waldmark" }]);
/* Kielmund: die Fischerzunft am Privatsteg südwestlich – sechs Fangstellen (Integration), Räucherhütte */
zunftEinrichten("fischerzunft", { feld: [6399, 7350, 6401, 7354] }, { id: "fischerzunft_bankkiste", x: 6399, y: 7359 });
zunftStationen("fischerzunft", [{ id: "raeucherhuette_fischerzunft", station: "raeucherhuette", x: 6396, y: 7351, ort: "fl_186_225" }]);
