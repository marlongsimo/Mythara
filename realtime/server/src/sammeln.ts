/*
 * Mythara Echtzeit – Sammelberufe auf dem Server (Holzfällerei: holz.ts, Bergbau: bergbau.ts). Der Server ist die einzige Wahrheit:
 *   · „start“: Nähe zum Ziel, Level, bestes benutzbares Werkzeug (Rucksack oder Hand), Ziel noch da, Platz im Rucksack.
 *   · Im Takt ein Versuch (hiebChance): Erfolg → ein Stück (stapelt nicht) + XP, mit 25 % dazu 5–15 Splitter; danach ist das Ziel mit seiner
 *     Erschöpfungschance leer (Stumpf bzw. leere Ader) – für alle, bis es nachwächst.
 *   · Aktiver Moment (Kernschlag / Riss): nach einem Versuch manchmal ein Fenster; wer darin antippt, bekommt zwei Stücke und 50 % mehr XP.
 *   · Abbruch: weggegangen, Rucksack voll, Ziel leer, anderes Ziel („stop“) oder Verbindung weg.
 * Die XP liegen im Inventar des Helden (inventar.ts → berufe.<beruf>), wie die Bank – keine neue Tabelle.
 */
import { levelAus } from "../../shared/kampfwerte";
import { GEGENSTAENDE } from "../../shared/gegenstaende";
import { hiebChance, SammelArt, SammelWerkzeug, SPLITTER_CHANCE, SPLITTER_MIN, SPLITTER_MAX } from "../../shared/sammeln";
import { aufnehmen, abgeben, anzahlVon, berufXp, berufXpDazu, besitzt, freieFaecher, platzFuer } from "./inventar";

type Sb = (pfad: string, init?: RequestInit) => Promise<unknown>;
export interface SammelSpieler { nutzer: string; gast: boolean; wx?: number; wy?: number }
export interface SammelZiel { id: string; art: string; x: number; y: number }
/** Was einen Sammelberuf ausmacht; Nachrichten an den Browser: { t, tat: start | hieb | <ertrag> | <moment> | stop | nein } und { t: <liste>, weg } */
export interface SammelBeruf {
  beruf: string; t: string; liste: string; arten: Record<string, SammelArt>; ziel: (id: string) => SammelZiel | undefined; werkzeuge: SammelWerkzeug[];
  taktMs: number; weit: number; momentChance: number; momentMs: number; tatErtrag: string; tatMoment: string; grundLeer: string;
  texte: { ohneWerkzeug: string; werkzeugLevel: (level: number) => string; weg: (a: SammelArt) => string; level: (a: SammelArt) => string; gast: string; unbekannt: string; nah: string };
  /** nur Tests: Umgebungsvariablen <ENV>_KERN (Chance des Moments) und <ENV>_FALL (Faktor auf die Erschöpfung, 0 = nie leer) */
  env: string;
  /** ohne Werkzeug sammeln (Pflücken) und ohne Splitter-Wurf */ ohneWerkzeug?: boolean; ohneSplitter?: boolean;
  /** Wandernde Stellen (Fischen, Würmer): je Gruppe sind nur „aktiv“ Ziele da; ist eine Stelle leer gefischt oder nach „ms“, zieht sie zu einer anderen der Gruppe */
  wandern?: { ziele: () => SammelZiel[]; gruppe: (id: string) => string; aktiv: (gruppe: string) => number; ms: number };
  /** Text, wenn der Köder fehlt (SammelArt.koeder) */ ohneKoeder?: (a: SammelArt) => string;
  /** Darf dieser Spieler hier sammeln? (Fischen: Wehrkolk erst mit Quest-Schalter) Zurück: Fehlertext oder null */ erlaubt?: (nutzer: string, ziel: SammelZiel) => string | null;
}
interface Sitzung { s: SammelSpieler; ziel: SammelZiel; naechst: number; momentBis: number; stufe: number }
type Senden = (s: SammelSpieler, m: object) => void;

/** Quest-Ziele (SammelArt.quest): quests.ts setzt, ob man darf und was ein Stück bewirkt */
export const SAMMEL_QUEST = { pruefen: (_nutzer: string, _art: string, _quest: string): string | null => "Das geht noch nicht.", ertrag: (_nutzer: string, _art: string, _quest: string): void => { /* quests.ts */ } };
/** Zufall (für Tests austauschbar) */
export let wuerfel = Math.random; export function wuerfelSetzen(f: () => number): void { wuerfel = f; }

export function sammelBeruf(B: SammelBeruf) {
  let sb: Sb = async () => null, senden: Senden = () => {}, alle: () => Iterable<SammelSpieler> = () => [];
  const leer = new Map<string, number>(), sitzungen = new Map<SammelSpieler, Sitzung>();
  /* Wandernde Stellen: ruhend = gerade nicht da (für alle); naechsterWechsel je Gruppe */
  const ruhend = new Set<string>(), wechselJe = new Map<string, number>(); let verteilt = false;
  const WANDER_MS = process.env[B.env + "_WANDER_MS"] !== undefined ? Number(process.env[B.env + "_WANDER_MS"]) : B.wandern ? B.wandern.ms : 0;
  function verteilen(jetzt: number): void { if (verteilt || !B.wandern) return; verteilt = true; const W = B.wandern;
    const gruppen = new Map<string, string[]>(); for (const z of W.ziele()) { const g = W.gruppe(z.id); gruppen.set(g, [...(gruppen.get(g) || []), z.id]); }
    for (const [g, ids] of gruppen) { const mix = [...ids].sort(() => wuerfel() - 0.5); mix.slice(W.aktiv(g)).forEach((id) => ruhend.add(id)); wechselJe.set(g, jetzt + WANDER_MS * (0.5 + wuerfel())); } }
  /** Stelle id zieht weiter: sie ruht, eine ruhende derselben Gruppe kommt dafür */
  function weiterziehen(id: string, jetzt: number): void { if (!B.wandern) return; const W = B.wandern, g = W.gruppe(id);
    const frei = W.ziele().filter((z) => W.gruppe(z.id) === g && ruhend.has(z.id) && z.id !== id); ruhend.add(id);
    if (frei.length) ruhend.delete(frei[Math.floor(wuerfel() * frei.length)].id); else ruhend.delete(id);
    wechselJe.set(g, jetzt + WANDER_MS * (0.5 + wuerfel()));
    for (const [o, w] of [...sitzungen]) if (ruhend.has(w.ziel.id)) stop(o, B.grundLeer); }
  const MOMENT = process.env[B.env + "_KERN"] !== undefined ? Number(process.env[B.env + "_KERN"]) : B.momentChance;
  const FAKTOR = process.env[B.env + "_FALL"] !== undefined ? Number(process.env[B.env + "_FALL"]) : 1;
  const level = (nutzer: string): number => levelAus(berufXp(nutzer, B.beruf));
  const daNoch = (id: string, jetzt = Date.now()) => { verteilen(jetzt); return !(leer.get(id)! > jetzt) && !ruhend.has(id); };
  /** Die leeren Ziele (für die Anzeige): [id, Sekunden bis nachgewachsen] */
  const erschoepfte = (jetzt = Date.now()): [string, number][] => { verteilen(jetzt); return [...[...leer].filter(([, bis]) => bis > jetzt).map(([id, bis]) => [id, Math.ceil((bis - jetzt) / 1000)] as [string, number]), ...[...ruhend].map((id) => [id, 0] as [string, number])]; };
  const allenMelden = () => { const m = { t: B.liste, weg: erschoepfte() }; for (const s of alle()) senden(s, m); };
  /** Bestes Werkzeug, das man mit diesem Level benutzen darf (Rucksack oder Hand) */
  const bestes = (nutzer: string, L: number, A?: SammelArt) => { const hat = new Set(besitzt(nutzer)); let st = -1; for (const w of B.werkzeuge) if (hat.has(w.g) && w.level <= L && (!A || !A.werkzeug || A.werkzeug === w.g)) st = Math.max(st, w.stufe); return st; };
  const nah = (s: SammelSpieler, z: SammelZiel) => s.wx !== undefined && s.wy !== undefined && Math.hypot(s.wx - z.x, s.wy - z.y) <= B.weit;

  function stop(s: SammelSpieler, grund = ""): void { const z = sitzungen.get(s); if (!z) return; sitzungen.delete(s); senden(s, { t: B.t, tat: "stop", id: z.ziel.id, grund }); }
  /** Mit dem Sammeln beginnen. Zurück: Fehlertext oder null */
  function start(s: SammelSpieler, id: string): string | null {
    if (s.gast) return B.texte.gast;
    const z = B.ziel(id); if (!z) return B.texte.unbekannt; const A = B.arten[z.art];
    if (!nah(s, z)) return B.texte.nah;
    if (!daNoch(id)) return B.texte.weg(A);
    if (B.erlaubt) { const e = B.erlaubt(s.nutzer, z); if (e) return e; }
    const L = level(s.nutzer); if (L < A.level) return B.texte.level(A);
    if (A.quest) { const f = SAMMEL_QUEST.pruefen(s.nutzer, z.art, A.quest); if (f) return f; } /* Questziel: nur mit dem Auftrag */
    const st = B.ohneWerkzeug ? 0 : bestes(s.nutzer, L, A);
    if (st < 0) { const passend = B.werkzeuge.filter((w) => !A.werkzeug || w.g === A.werkzeug), hat = passend.filter((w) => besitzt(s.nutzer).includes(w.g)); return hat.length ? B.texte.werkzeugLevel(Math.min(...hat.map((w) => w.level))) : B.texte.ohneWerkzeug; }
    if (A.koeder && anzahlVon(s.nutzer, A.koeder) <= 0) return B.ohneKoeder ? B.ohneKoeder(A) : "Dir fehlt der Köder.";
    if (freieFaecher(s.nutzer) <= 0) return "Dein Rucksack ist voll.";
    sitzungen.set(s, { s, ziel: z, naechst: Date.now() + B.taktMs, momentBis: 0, stufe: st });
    senden(s, { t: B.t, tat: "start", id, werkzeug: B.ohneWerkzeug ? undefined : B.werkzeuge.find((w) => w.stufe === st && (!A.werkzeug || w.g === A.werkzeug))!.g }); return null;
  }
  /** Ein Stück (beim Moment zwei): Rucksack, XP, Splitter-Wurf, Erschöpfung. Zurück: ob es weitergeht */
  function ernten(z: Sitzung, moment: boolean, jetzt: number): boolean {
    const { s, ziel } = z, A = B.arten[ziel.art], G = GEGENSTAENDE[A.ertrag]; let stuecke = 0, splitter = 0;
    for (let i = 0; i < (moment ? 2 : 1); i++) { if (A.koeder && anzahlVon(s.nutzer, A.koeder) <= 0) break; if (!aufnehmen(sb, s.nutzer, A.ertrag, 1)) break; stuecke++; if (A.koeder) abgeben(sb, s.nutzer, A.koeder);
      if (!B.ohneSplitter && wuerfel() < SPLITTER_CHANCE) { const n = SPLITTER_MIN + Math.floor(wuerfel() * (SPLITTER_MAX - SPLITTER_MIN + 1)); if (platzFuer(s.nutzer, "splitter")) splitter += aufnehmen(sb, s.nutzer, "splitter", n); } }
    if (!stuecke) { stop(s, A.koeder && anzahlVon(s.nutzer, A.koeder) <= 0 ? "koeder" : "voll"); return false; }
    const vorher = level(s.nutzer), xp = A.xp * stuecke * (moment ? 1.5 : 1); berufXpDazu(sb, s.nutzer, B.beruf, xp); const nachher = level(s.nutzer);
    senden(s, { t: B.t, tat: B.tatErtrag, id: ziel.id, g: A.ertrag, name: G ? G.name : A.ertrag, n: stuecke, xp, splitter, [B.tatMoment]: moment, level: nachher, aufstieg: nachher > vorher ? nachher : 0 });
    if (!A.quest) for (let i = 0; i < stuecke; i++) SAMMEL_QUEST.ertrag(s.nutzer, ziel.art, ""); /* Quests mit „anzahl“ (2 Flachs, 4 Kupfer …): jedes Stück zählt */
    if (A.quest) { SAMMEL_QUEST.ertrag(s.nutzer, ziel.art, A.quest); stop(s, "fertig"); return false; } /* Questziel: ein Stück, fertig – das Ziel bleibt für andere stehen */
    if (B.wandern && wuerfel() < A.fall * FAKTOR) { weiterziehen(ziel.id, jetzt); allenMelden(); return false; }
    if (wuerfel() < A.fall * FAKTOR) { leer.set(ziel.id, jetzt + A.nachwachsen * 1000); for (const [o, w] of [...sitzungen]) if (w.ziel.id === ziel.id) stop(o, B.grundLeer); allenMelden(); return false; }
    if (freieFaecher(s.nutzer) <= 0) { stop(s, "voll"); return false; }
    if (A.koeder && anzahlVon(s.nutzer, A.koeder) <= 0) { stop(s, "koeder"); return false; }
    return true;
  }
  /** Der aktive Moment (Kernschlag / Riss) wurde angetippt */
  function moment(s: SammelSpieler): void { const z = sitzungen.get(s); if (!z) return; const jetzt = Date.now();
    if (!z.momentBis || jetzt > z.momentBis + 300 /* Laufzeit */) { z.momentBis = 0; return; }
    z.momentBis = 0; if (ernten(z, true, jetzt)) z.naechst = jetzt + B.taktMs; }
  /** Takt: alle 100 ms (vom Weltserver gerufen) */
  function takt(jetzt = Date.now()): void {
    let nach = false; for (const [id, bis] of [...leer]) if (bis <= jetzt) { leer.delete(id); nach = true; }
    if (B.wandern && WANDER_MS > 0) { verteilen(jetzt); const W = B.wandern; for (const [g, bis] of [...wechselJe]) { if (jetzt < bis) continue;   /* eine Stelle der Gruppe zieht weiter */
      const da = W.ziele().filter((z) => W.gruppe(z.id) === g && !ruhend.has(z.id)); if (da.length) weiterziehen(da[Math.floor(wuerfel() * da.length)].id, jetzt); else wechselJe.set(g, jetzt + WANDER_MS); nach = true; } }
    if (nach) allenMelden();
    for (const [s, z] of [...sitzungen]) {
      if (!nah(s, z.ziel)) { stop(s, "weg"); continue; }
      if (z.momentBis && jetzt > z.momentBis + 300) z.momentBis = 0;
      if (jetzt < z.naechst) continue; z.naechst = jetzt + B.taktMs;
      const A = B.arten[z.ziel.art]; senden(s, { t: B.t, tat: "hieb", id: z.ziel.id });
      if (wuerfel() < hiebChance(level(s.nutzer), A, z.stufe)) { if (!ernten(z, false, jetzt)) continue; }
      if (!z.momentBis && wuerfel() < MOMENT) { z.momentBis = jetzt + B.momentMs; senden(s, { t: B.t, tat: B.tatMoment, id: z.ziel.id, ms: B.momentMs }); }
    }
  }
  return {
    einrichten(o: { sb: Sb; senden: Senden; alle: () => Iterable<SammelSpieler> }): void { sb = o.sb; senden = o.senden; alle = o.alle; },
    start, stop, moment, takt, erschoepfte, level,
    weg: (s: SammelSpieler): void => { sitzungen.delete(s); },
    aktiv: (s: SammelSpieler): string | null => (sitzungen.get(s) ? sitzungen.get(s)!.ziel.id : null),
    zuruecksetzen: (): void => { leer.clear(); sitzungen.clear(); ruhend.clear(); wechselJe.clear(); verteilt = false; },
    /** nur Tests und Anzeige: die gerade ruhenden (nicht vorhandenen) Stellen */ ruhende: (): string[] => { verteilen(Date.now()); return [...ruhend]; },
  };
}
