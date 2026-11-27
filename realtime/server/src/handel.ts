/*
 * Riftmere – Handel zwischen Spielern (#65, Konzept doku/konzepte/handel.md). Der Server führt den ganzen Handel; der Browser zeigt nur an.
 *   Anfrage: { t: "handel", tat: "anfrage", an: Name } – nur nah (ein Feld, der Browser läuft heran), mit Konto, nicht im Kampf; verfällt nach 30 s.
 *     Der andere bekommt { tat: "anfrage", von } und nimmt mit { tat: "annehmen_anfrage", von } an (oder fragt selbst zurück).
 *   Angebot: { tat: "angebot", posten: [{ g, n, d? }], splitter } – ersetzt das eigene Angebot; jede Änderung setzt beide Annahmen zurück.
 *   Annehmen: { tat: "annehmen" } – Stufe 1 (Angebote), dann Stufe 2 (Zusammenfassung); erst wenn beide in Stufe 2 annehmen, tauscht der Server
 *     in einem Schritt (inventar.ts handelTauschen: alles oder nichts). Ablehnen: { tat: "ablehnen" }.
 *   Zustand an beide: { t: "handel", tat: "offen", mit, stufe, ich: { posten, splitter, ok }, er: { … }, freiIch, freiEr }; Ende: { tat: "zu", grund } / { tat: "fertig" }.
 *   Abbruch: Ablehnen, Weglaufen (mehr als HANDEL_WEG Felder), Kampf, Gebietswechsel/Teleport (Abstand), Verbindungsabbruch – nichts wechselt den Besitzer.
 * Nicht handelbar (shared/gegenstaende.ts handelbar): Questgegenstände, gebundener Questlohn, geladene Ausrüstung „(s)“.
 */
import { angebotPruefen, tauschPasst, handelTauschen, freiePlaetze, type Posten } from "./inventar";
import { datenPruefen, GEGENSTAENDE, anzeigeName } from "../../shared/gegenstaende";

type Sb = (pfad: string, init?: RequestInit) => Promise<unknown>;
export interface HandelSpieler { nutzer: string; name: string; gast: boolean; wx?: number; wy?: number; ort: string }
interface Seite { s: HandelSpieler; posten: Posten[]; splitter: number; ok: boolean }
interface Handel { a: Seite; b: Seite; stufe: 1 | 2 }
/** Nähe zum Anfragen und Öffnen (Felder; der Browser läuft bis auf ein Feld heran), Abstand, ab dem der Handel abbricht, Gültigkeit einer Anfrage */
export const HANDEL_NAH = 2.5, HANDEL_WEG = 6, ANFRAGE_MS = 30_000;
const anfragen = new Map<string, { an: string; bis: number }>(), laufend = new Map<string, Handel>();
let senden: (s: HandelSpieler, m: object) => void = () => {}, istDa: (s: HandelSpieler) => boolean = () => true, finde: (name: string) => HandelSpieler | null = () => null, imKampf: (nutzer: string) => boolean = () => false;
export function handelEinrichten(o: { senden: typeof senden; istDa: typeof istDa; finde: typeof finde; imKampf: typeof imKampf }): void { senden = o.senden; istDa = o.istDa; finde = o.finde; imKampf = o.imKampf; }
const abstand = (a: HandelSpieler, b: HandelSpieler): number => (a.wx === undefined || a.wy === undefined || b.wx === undefined || b.wy === undefined ? Infinity : Math.hypot(a.wx - b.wx, a.wy - b.wy));
const chat = (s: HandelSpieler, text: string) => senden(s, { t: "chat", kanal: "system", text, zeit: Date.now() });
const seite = (h: Handel, s: HandelSpieler) => (h.a.s === s ? { ich: h.a, er: h.b } : { ich: h.b, er: h.a });
/** Ein Angebot aus dem Browser lesen: höchstens 24 Posten, bekannte Gegenstände, ganze Mengen, Daten geprüft; gleiche Posten zusammengefasst */
function postenLesen(roh: unknown): Posten[] { const aus: Posten[] = []; if (!Array.isArray(roh)) return aus;
  for (const x of roh.slice(0, 24)) { if (!x || typeof x !== "object") continue; const o = x as Record<string, unknown>, g = String(o.g || ""), n = Math.floor(Number(o.n)); if (!GEGENSTAENDE[g] || g === "splitter" || !(n >= 1)) continue;
    const d = datenPruefen(o.d), da = aus.find((p) => p.g === g && JSON.stringify(p.d || {}) === JSON.stringify(d || {})); if (da) da.n += n; else aus.push(d ? { g, n, d } : { g, n }); }
  return aus; }
function zustand(h: Handel): void { for (const s of [h.a.s, h.b.s]) { const { ich, er } = seite(h, s);
  senden(s, { t: "handel", tat: "offen", mit: er.s.name, stufe: h.stufe, ich: { posten: ich.posten, splitter: ich.splitter, ok: ich.ok }, er: { posten: er.posten, splitter: er.splitter, ok: er.ok }, freiIch: freiePlaetze(ich.s.nutzer), freiEr: freiePlaetze(er.s.nutzer) }); } }
function abbrechen(h: Handel, grund: string): void { laufend.delete(h.a.s.nutzer); laufend.delete(h.b.s.nutzer); for (const s of [h.a.s, h.b.s]) { senden(s, { t: "handel", tat: "zu", grund }); chat(s, grund); } }
function oeffnen(a: HandelSpieler, b: HandelSpieler): void { anfragen.delete(a.nutzer); anfragen.delete(b.nutzer);
  const h: Handel = { a: { s: a, posten: [], splitter: 0, ok: false }, b: { s: b, posten: [], splitter: 0, ok: false }, stufe: 1 }; laufend.set(a.nutzer, h); laufend.set(b.nutzer, h); zustand(h); }
/** Kann s gerade mit o handeln? Zurück: Grund, warum nicht, oder null */
function hindernis(s: HandelSpieler, o: HandelSpieler | null): string | null {
  if (s.gast) return "Handeln geht mit Konto (Menü → Anmelden)."; if (!o || !istDa(o)) return "Dieser Spieler ist nicht hier."; if (o.nutzer === s.nutzer) return "Mit dir selbst kannst du nicht handeln.";
  if (o.gast) return `${o.name} spielt als Gast und kann nicht handeln.`; if (laufend.has(s.nutzer)) return "Du handelst schon."; if (laufend.has(o.nutzer)) return `${o.name} handelt gerade mit jemand anderem.`;
  if (imKampf(s.nutzer) || imKampf(o.nutzer)) return "Im Kampf wird nicht gehandelt."; if (abstand(s, o) > HANDEL_NAH) return `Geh näher an ${o.name}.`; return null; }

/** Eine Handels-Nachricht aus dem Browser */
export function handelNachricht(sb: Sb, s: HandelSpieler, e: Record<string, unknown>): void { const jetzt = Date.now();
  if (e.tat === "anfrage" || e.tat === "annehmen_anfrage") { const o = finde(String(e.tat === "anfrage" ? e.an : e.von || "").slice(0, 40)), w = hindernis(s, o); if (w) { chat(s, w); senden(s, { t: "handel", tat: "nein", grund: w }); return; }
    const gegen = anfragen.get(o!.nutzer); if (gegen && gegen.an === s.nutzer && gegen.bis > jetzt) { oeffnen(o!, s); return; } /* der andere hat schon gefragt: los */
    if (e.tat === "annehmen_anfrage") { chat(s, `${o!.name} hat dich nicht (mehr) gefragt.`); return; }
    anfragen.set(s.nutzer, { an: o!.nutzer, bis: jetzt + ANFRAGE_MS }); senden(o!, { t: "handel", tat: "anfrage", von: s.name }); chat(s, `Du fragst ${o!.name}, ob ihr handelt …`); return; }
  const h = laufend.get(s.nutzer); if (!h) { if (e.tat === "ablehnen" && typeof e.von === "string") { const o = finde(e.von); if (o) { const a = anfragen.get(o.nutzer); if (a && a.an === s.nutzer) { anfragen.delete(o.nutzer); chat(o, `${s.name} möchte nicht handeln.`); } } } return; }
  const { ich, er } = seite(h, s);
  if (e.tat === "ablehnen") { abbrechen(h, `${s.name} hat den Handel abgebrochen.`); return; }
  if (e.tat === "angebot") { if (h.stufe !== 1) { chat(s, "In der Zusammenfassung lässt sich nichts mehr ändern."); return; }
    const posten = postenLesen(e.posten), splitter = Math.max(0, Math.floor(Number(e.splitter) || 0)), f = angebotPruefen(s.nutzer, posten, splitter); if (f) { chat(s, f); zustand(h); return; }
    ich.posten = posten; ich.splitter = splitter; ich.ok = false; er.ok = false; zustand(h); return; } /* jede Änderung setzt beide Annahmen zurück */
  if (e.tat === "annehmen") {
    const platz = tauschPasst(h.a.s.nutzer, h.b.s.nutzer, h.a.posten, h.a.splitter, h.b.posten, h.b.splitter);
    if (platz) { const wer = platz === "a" ? h.a.s : h.b.s; chat(s, wer === s ? "Du hast nicht genug Platz im Rucksack." : `${wer.name} hat nicht genug Platz im Rucksack.`); ich.ok = false; zustand(h); return; }
    ich.ok = true; if (!er.ok) { zustand(h); return; }
    if (h.stufe === 1) { h.stufe = 2; h.a.ok = false; h.b.ok = false; zustand(h); return; } /* beide angenommen: Zusammenfassung, dort noch einmal annehmen */
    const fehler = handelTauschen(sb, h.a.s.nutzer, h.b.s.nutzer, h.a.posten, h.a.splitter, h.b.posten, h.b.splitter); if (fehler) { abbrechen(h, fehler); return; }
    laufend.delete(h.a.s.nutzer); laufend.delete(h.b.s.nutzer);
    const text = (x: Seite) => [...x.posten.map((p) => `${p.n} × ${anzeigeName(p.g, p.d)}`), ...(x.splitter ? [`${x.splitter} Splitter`] : [])].join(", ") || "nichts";
    console.log(`Handel: ${h.a.s.name} gibt ${text(h.a)} · ${h.b.s.name} gibt ${text(h.b)}`); /* Protokoll (später eine Tabelle, falls Betrugsfälle zu klären sind) */
    for (const x of [h.a, h.b]) { senden(x.s, { t: "handel", tat: "fertig" }); chat(x.s, "Handel abgeschlossen."); } return; } }
/** Einmal je Sekunde: Anfragen verfallen, laufende Handel brechen ab bei Abstand, Kampf oder wenn einer weg ist */
export function handelTakt(jetzt = Date.now()): void { for (const [k, a] of anfragen) if (a.bis <= jetzt) anfragen.delete(k);
  for (const h of new Set(laufend.values())) { if (!istDa(h.a.s) || !istDa(h.b.s)) { abbrechen(h, "Der Handel ist abgebrochen – der andere ist nicht mehr da."); continue; }
    if (abstand(h.a.s, h.b.s) > HANDEL_WEG) { abbrechen(h, "Der Handel ist abgebrochen – ihr seid zu weit auseinander."); continue; }
    if (imKampf(h.a.s.nutzer) || imKampf(h.b.s.nutzer)) abbrechen(h, "Der Handel ist abgebrochen – im Kampf wird nicht gehandelt."); } }
/** Verbindung weg: laufender Handel bricht ab, Anfragen verfallen */
export function handelWeg(s: HandelSpieler): void { anfragen.delete(s.nutzer); const h = laufend.get(s.nutzer); if (h && (h.a.s === s || h.b.s === s)) abbrechen(h, `Der Handel ist abgebrochen – ${s.name} ist nicht mehr da.`); }
