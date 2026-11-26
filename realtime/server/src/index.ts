/*
 * Mythara Echtzeit – der Spielserver. Er rechnet die Partie (20 Schritte je Sekunde) und schickt Zustände.
 * Der Client schickt nur Eingaben. Jede Verbindung bekommt ihre eigene Partie: den Riss (PvE) oder einen Kampagnenkampf.
 *
 * Kampagnenkämpfe (?kampf=<karte>&ort=<ort>): Der Spieler muss angemeldet sein. Die erste Nachricht ist {t:"anmeldung", token}; der Server prüft das Token
 * bei Supabase, liest die Stufen der Helden und rechnet den Kampf. Erfahrung und Seelensplitter zählt allein der Server und bucht sie über rpg_echtzeit_gutschrift
 * (Migration 035) schon während des Kampfes zwischendurch (nur die Differenz, {t:"gebucht", ep, seelen}); beim Verlassen ({t:"verlassen"} oder Trennung)
 * bucht er den Rest und schickt {t:"gutschrift", ep, seelen} zurück.
 *
 * Geheime Schlüssel gehören ausschließlich in die Umgebung dieses Servers (SUPABASE_SERVICE_KEY), nie in den Browser.
 */
import { LP_REGEN_SEK, maxLp, SKILLS, levelAus } from "../../shared/kampfwerte";
import { SPRINT_TICK, erholungJeTick } from "../../shared/sprint";
import { wirkungenAktiv } from "../../shared/wirkungen";
import { createServer } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { TICK, ZUSTAND_JE, PROTOKOLL, HELDEN, K, setzeStaerke, STAERKE, HELDENSTUFE, HELDENEP, stufeAusEp } from "../../shared/config";
import { Sim, Eingabe } from "../../shared/sim";
import { setzeKarte, karteNehmen, GRUNDKARTE } from "../../shared/karte";
import { KARTEN, FEIN, darfKaempfen, ORTSTUFE, STRECKEN, WELTZONEN, WELTZONE, weltRegionBei } from "../../shared/karten";
import { weltVerbindung, wegsteinZielNehmen, stelleMerken , aussehenJe, imKampfPruefer, heilenMit, weltOnline, stufeSetzen, belegtAbweisen, systemAn, VOLLES_LEBEN } from "./welt";
import * as Sitz from "./sitz";
import { trankHeilungBei } from "../../shared/gegenstaende";
import { HeldV1, heldV1Lesen, angelegtPruefen, kampfwerteVon, v1Takt, stilPruefen } from "./kampfv1";
import { inventarLaden, inventarHoeren, inventarVon, bodenDazu, bedingungErfuellt, LOOT, waffeLadungVerbrauchen } from "./inventar";
import { geladen as istGeladen } from "../../shared/gegenstaende";
import { erlegt, xpLiveSetzen, heldXpSetzen, getroffen, zielscheibeFrei, schalter } from "./quests";
import { weltJeSpieler, instanzAus, bossSieg } from "./bosse";
import { ZIELSCHEIBE_BIS } from "../../shared/sim";
import { levelAus as levelVon } from "../../shared/kampfwerte";

const PORT = Number(process.env.PORT) || 8787, MAX = Number(process.env.MAX_SPIELER) || 150, RUHE_MS = 5.5 * 60 * 1000; /* Inaktivität: der Browser meldet nach 5 Minuten ohne Eingabe selbst ab, der Server nach 5½ als Sicherheitsnetz */
/* Abbruch im Kampf (wie OSRS): Wer die Verbindung verliert, das Spiel schließt oder sich abmeldet, solange er kämpft, dessen Held bleibt stehen und wehrt sich –
   bis 10 Sekunden ohne Kampf vergangen sind, höchstens 60 Sekunden. Am Gebietsrand (Wechsel ins Nachbargebiet) und ohne Kampf geht er sofort. */
const KAMPF_RUHE_MS = 10000, HAENGEN_MS = 60000, RAND = 2.5;
/* Von welchen Seiten aus verbunden werden darf (Komma-getrennt). Leer = alle, nur für Tests gedacht. */
/* Erlaubte Seiten: aus ERLAUBTE_HERKUNFT (Render) – riftmere.de (seit 25.11.2026) und die alte Adresse gelten immer, damit der Umzug nicht an der Render-Einstellung hängt */
const HERKUNFT = [...new Set([...(process.env.ERLAUBTE_HERKUNFT || "https://mythara-dungeon.de,http://localhost:8765").split(","), "https://riftmere.de", "https://www.riftmere.de", "https://mythara-dungeon.de"].map((s) => s.trim()).filter(Boolean))];
const SB_URL = (process.env.SUPABASE_URL || "").replace(/\/$/, ""), SB_KEY = process.env.SUPABASE_SERVICE_KEY || "";
/* Stufe der Aufgabe je Ort – wie im Client (kampagne.ts) */

/** Ein Kampagnenkampf eines Spielers. Gebucht wird zwischendurch, immer nur die Differenz zum schon Gebuchten (siehe buchen). */
interface Kampf { karte: string; ort: string; team: string[]; nutzer: string; ep: number; fertig: boolean; gesiegt: boolean;
  gebuchtEp: number; gebuchtS: number; /* schon in der Datenbank */ bucht: boolean; nochmal: boolean; ende: boolean; seit: number; geaendert: number; letzterEp: number; letzterS: number; stand: object | null; wartende: (() => void)[] }
const neuerKampf = (karte: string, ort: string, team: string[]): Kampf => ({ karte, ort, team, nutzer: "", ep: 0, fertig: false, gesiegt: false, gebuchtEp: 0, gebuchtS: 0, bucht: false, nochmal: false, ende: false, seit: Date.now(), geaendert: 0, letzterEp: 0, letzterS: 0, stand: null, wartende: [] });
/** Zwischenbuchung: so lange nach der letzten neuen Beute Ruhe, spätestens so lange nach der letzten Buchung (Millisekunden) */
const BUCHUNG_RUHE = Number(process.env.BUCHUNG_RUHE_MS) || 5000, BUCHUNG_SPAETESTENS = Number(process.env.BUCHUNG_SPAETESTENS_MS) || 30000;
interface Platz { /** Zielscheibe: letzter Hinweis */ zielHinweis?: number; ws: WebSocket; sim: Sim | null; zuletzt: number; /** absichtlich abgereist: tp = Teleport (neu in der Waldmark), tor = Tür/Untergrund (neu am Ziel) – der Held ist sofort weg */ abreise?: "tp" | "tor"; /** zuletzt an alle gemeldete Heldenstufe (Namensschild) */ lvGemeldet?: number; fenster: number; zahl: number; kampf?: Kampf;
  /* Koop: beim Anführer die Mitspieler, beim Mitspieler der Platz des Anführers und die Kennung seines Helden */ mit?: Set<Platz>; haupt?: Platz; heldId?: number; raum?: string;
  /* gemeinsamer Start: warten, bis die erwarteten Mitspieler da sind (höchstens bis „bis“), dann ab „los“ herunterzählen */ start?: { bis: number; erwartet: number; los: number; zuletzt: string };
  /* gemeinsame Kampfwelt (Strecken wie der Waldweg): die Zone, in der sein Held steht */ zone?: Zone; name?: string; zoneWeg?: boolean; /** Inventar-Hörer abmelden */ invAus?: () => void; /** vorverbunden, noch nicht im Gebiet */ vorbereitet?: { typ: string; ep: number; name: string };
  /** Kampfregeln v1: der eigene Held (Skill-XP, Ausrüstung) – ohne eigenen Helden die alten Kampfwerte */ v1?: HeldV1; v1T?: number; /** Eingaben vor dem Betreten der Zone (Autoangriff, Sprint) */ nachher?: Eingabe[]; /** Stil, den der Browser gemeldet hat, bevor der Held geladen war */ stilVorab?: unknown;
  /** zuletzt im Kampf (ms); Verbindung weg, Held bleibt noch (seit, ms); ersetzt = übernommen oder ins Nachbargebiet gewechselt: beim Schließen sofort weg */ kampfZ?: number; haengt?: number; ersetzt?: boolean }
/** Eine gemeinsame Kampfwelt: eine Simulation für alle Spieler dort; Gegner kehren zurück, EP nach Schadensanteil (shared/sim.ts, Sim.welt) */
interface Zone { karte: string; sim: Sim; spieler: Set<Platz>; leerSeit: number }
const zonen = new Map<string, Zone>();
/** Lebenspunkte eines Kontos zwischen den Kampfgebieten (sonst wäre man nach jedem Betreten wieder voll): beim Verlassen gemerkt, beim Betreten plus Regeneration (1 LP je 50 s) */
const lebenJe = new Map<string, { lp: number; zeit: number }>();
/** Laufenergie je Konto (Sprint, shared/sprint.ts): beim Verlassen gemerkt, beim Betreten mit der Erholung seither wieder gesetzt – Teleport, Neuladen oder ein anderes Gerät füllen sie nicht auf */
const ausdauerJe = new Map<string, { wert: number; zeit: number }>();
/** Kämpft dieses Konto gerade? (Freunde-Teleport): im Einzelkampf gebunden oder ein lebender Gegner hat den Helden im Ziel */
imKampfPruefer((nutzer) => { for (const Z of zonen.values()) for (const p of Z.spieler) { if (!p.kampf || p.kampf.nutzer !== nutzer || !p.heldId) continue; const h = Z.sim.nach(p.heldId); if (!h || h.tot) continue;
  if ((h.kampfMit && (h.kampfBis || 0) > Z.sim.zeit) || Z.sim.wesen.some((w) => !w.held && !w.tot && w.zielId === h.id)) return true; } return false; });
/** Trank trinken (welt.ts „inv“ trinken): im Kampfgebiet heilt der Held in der Simulation, sonst die gemerkten Lebenspunkte (lebenJe bzw. Migration 046).
 *  Nie über das maximale Leben; bei vollem Leben bleibt der Trank im Rucksack. */
/* Quest-XP (schon in der Datenbank gebucht): auch dem laufenden Helden dazu – Level, Kampfwerte und Namensschild sofort neu, ohne doppelte Buchung (h.xp ist der Gesamtstand, h.offen bleibt) */
xpLiveSetzen((nutzer, xp) => { for (const Z of zonen.values()) for (const p of Z.spieler) { if (!p.v1 || !p.kampf || p.kampf.nutzer !== nutzer || !p.heldId || p.zoneWeg) continue;
  for (const k of SKILLS) p.v1.xp[k] += Number(xp[k as keyof typeof xp]) || 0; Z.sim.kampfwerteSetzen(p.heldId, kampfwerteVon(p.v1)); namenMelden(Z); console.log("Welt: Quest-XP live für", p.name || "?"); } });
/* Quest-Bedingungen (Skill-Level, Heldenlevel): die Kampf-XP des geladenen Helden */
heldXpSetzen((nutzer) => { for (const Z of zonen.values()) for (const p of Z.spieler) if (p.v1 && p.kampf && p.kampf.nutzer === nutzer && !p.zoneWeg) return p.v1.xp; return undefined; });
heilenMit(async (nutzer, v) => {
  for (const Z of zonen.values()) for (const p of Z.spieler) { if (!p.kampf || p.kampf.nutzer !== nutzer || !p.heldId || p.zoneWeg) continue; const h = Z.sim.nach(p.heldId); if (!h || h.tot) continue;
    const n = trankHeilungBei(v, h.lp, h.max); if (n <= 0) return { fehler: VOLLES_LEBEN };
    return { n, lp: Math.min(h.max, h.lp + n), max: h.max, anwenden: () => { h.lp = Math.min(h.max, h.lp + n); } }; }
  let r: { lp_stand?: { lp?: number; z?: number } | null; skill_lp?: number } | undefined;
  try { r = ((await sb(`/rest/v1/rpg_held?user_id=eq.${nutzer}&select=*`)) as typeof r[])[0]; } catch { return { fehler: "Gerade nicht möglich." }; }
  const max = maxLp(Number(r && r.skill_lp) || 0), ls = r && r.lp_stand, L = lebenJe.get(nutzer) || (ls && typeof ls.lp === "number" && typeof ls.z === "number" ? { lp: ls.lp, zeit: ls.z * 1000 } : undefined);
  const jetzt = L ? Math.min(max, L.lp + Math.floor((Date.now() - L.zeit) / 1000 / LP_REGEN_SEK)) : max;
  const n = trankHeilungBei(v, jetzt, max); if (n <= 0) return { fehler: VOLLES_LEBEN };
  return { n, lp: jetzt + n, max, anwenden: () => { const neu = Math.min(max, jetzt + n), voll = neu >= max; if (voll) lebenJe.delete(nutzer); else lebenJe.set(nutzer, { lp: neu, zeit: Date.now() });
    void sb("/rest/v1/rpc/rpg_held_lp_setzen", { method: "POST", body: JSON.stringify({ p_user: nutzer, p_lp: voll ? null : neu }) }).catch((e) => console.error("LP speichern:", (e as Error).message)); } }; });
/** Einen Spieler in die gemeinsame Welt eines Gebiets setzen (die Zone entsteht beim ersten Spieler) – jede Person nur einmal */
function zoneBetreten(p: Platz, karte: string, ort: string, typ: string, epWert: number, name: string, wo?: { x: number; y: number }): void {
  let Z = zonen.get(karte); const eigen = Boolean(KARTEN[karte] && KARTEN[karte].ursprung); /* Weltzonen: Gegner mit ihren eigenen Werten (Kampfregeln v1) */
  if (!Z) { setzeKarte(KARTEN[karte], FEIN); setzeStaerke(ORTSTUFE[ort] || 1, 1); for (const k of Object.keys(HELDENSTUFE)) delete HELDENSTUFE[k]; for (const k of Object.keys(HELDENEP)) delete HELDENEP[k];
    Z = { karte, sim: Sim.welt((Date.now() ^ (Math.random() * 1e9)) >>> 0, undefined, eigen), spieler: new Set(), leerSeit: 0 }; { const U = KARTEN[karte] && KARTEN[karte].ursprung; if (U) Z.sim.ursprung = [U[0], U[1]]; } /* Instanzen, Türen, Heilorte stehen in Weltfeldern */
    zonen.set(karte, Z); console.log("Welt: Zone", karte, "eröffnet"); }
  const nutzer = p.kampf && p.kampf.nutzer;
  /* Jede Person nur einmal (das neue Gerät übernimmt). Im selben Gebiet übernimmt die neue Verbindung den stehenden Helden samt Leben, Stelle und Kampf –
     so rettet Neu-Einloggen nicht aus dem Kampf. In einem anderen Gebiet: ein stehender (abgebrochener) Held geht jetzt, eine offene Verbindung am Gebietsrand
     ist der eigene Wechsel ins Nachbargebiet (die alte Verbindung schließt gleich selbst), jede andere offene ist ein anderes Gerät und wird abgemeldet. */
  /* Wegstein (welt.ts): der Server hat das Ziel gesetzt – der alte Held geht (kein Übernehmen samt alter Stelle), der neue beginnt am Ziel */
  const weg = nutzer ? wegsteinZielNehmen(nutzer) : null;
  if (nutzer) for (const Z2 of zonen.values()) for (const q of [...Z2.spieler]) { if (q === p || !q.kampf || q.kampf.nutzer !== nutzer) continue;
    const offen = q.ws.readyState === WebSocket.OPEN, h = q.heldId ? Z2.sim.nach(q.heldId) : undefined;
    if (Z2 === Z && h && !h.tot && !q.zoneWeg && !weg) { uebernehmen(q, p, Z, typ, name); return; }
    if (Z2 !== Z && offen && amRand(q)) { q.ersetzt = true; continue; }
    q.ersetzt = true; zoneVerlassen(q); if (offen) try { q.ws.close(4409, "anderswo angemeldet"); } catch { /* zu */ } }
  { const t = weg, K = KARTEN[karte]; /* Wegstein: der Server setzt die Position (welt.ts), nicht der Browser – in der gemeinsamen Kampfwelt (ohne weltRegion) oder im Gebiet des Ziels */
    if (t && K && K.ursprung && (!K.weltRegion || K.weltRegion === t.region)) { wo = { x: t.x - K.ursprung[0], y: t.y - K.ursprung[1] }; void stelleMerken({ sb }, nutzer as string, t.region, t.x, t.y); /* das Gehen des alten Helden hat seine alte Stelle gemerkt */ } }
  p.zone = Z; p.heldId = Z.sim.beitreten(typ, epWert, wo, p.v1 ? kampfwerteVon(p.v1) : undefined); { const a = p.kampf && p.kampf.nutzer ? ausdauerJe.get(p.kampf.nutzer) : undefined, h = Z.sim.nach(p.heldId) as { ausdauer?: { wert: number }; ausdauerDa?: boolean; kw?: { skills: { geschick?: number } } } | undefined;
    if (a && h && h.ausdauer) { const g = levelAus((h.kw && h.kw.skills.geschick) || 0, "geschick"), ticks = Math.floor((Date.now() - a.zeit) / 1000 / SPRINT_TICK); h.ausdauer.wert = Math.min(100, a.wert + ticks * erholungJeTick(g) / 100); h.ausdauerDa = true; /* der Browser darf sie nicht mehr setzen */ } } p.v1T = Date.now(); p.name = name; if (p.kampf) p.kampf.team = [typ]; Z.spieler.add(p); Z.leerSeit = 0;
  if (p.nachher) { for (const e of p.nachher) try { Z.sim.eingabe(e, p.heldId); } catch { /* egal */ } p.nachher = undefined; } /* Autoangriff und Sprint von vor dem Betreten */
  { const L = nutzer && p.v1 ? lebenJe.get(nutzer) || (p.v1.lpStand ? { lp: p.v1.lpStand.lp, zeit: p.v1.lpStand.z * 1000 } : undefined) : undefined, h = Z.sim.nach(p.heldId); /* aus dem Speicher, sonst aus der Datenbank (Migration 046) */
    if (L && h) h.lp = Math.max(1, Math.min(h.max, L.lp + Math.floor((Date.now() - L.zeit) / 1000 / LP_REGEN_SEK))); }
  console.log("Welt:", name, "betritt", karte, "·", Z.spieler.size, "dort"); namenMelden(Z); }
/** Neues Gerät im selben Gebiet: die neue Verbindung steuert ab jetzt den Helden der alten (Leben, Stelle, Kampf bleiben). Die alte bucht ab und wird abgemeldet. */
function uebernehmen(alt: Platz, p: Platz, Z: Zone, typ: string, name: string): void { const nutzer = (p.kampf && p.kampf.nutzer) || "", id = alt.heldId as number;
  if (alt.v1 && nutzer) { v1Takt(sb, nutzer, alt.v1, Z.sim, id, true); if (p.v1) for (const k of SKILLS) p.v1.xp[k] = Math.max(p.v1.xp[k], alt.v1.xp[k]); } /* Skill-XP der alten Verbindung buchen; die neue rechnet ab dem höheren Stand weiter */
  void buchen(alt, true); if (alt.invAus) { alt.invAus(); alt.invAus = undefined; }
  alt.zoneWeg = true; alt.ersetzt = true; Z.spieler.delete(alt); if (alt.ws.readyState === WebSocket.OPEN) try { alt.ws.close(4409, "anderswo angemeldet"); } catch { /* zu */ }
  p.zone = Z; p.heldId = id; p.v1T = Date.now(); p.name = name; p.kampfZ = alt.kampfZ; if (p.kampf) p.kampf.team = [typ]; if (p.v1) Z.sim.kampfwerteSetzen(id, kampfwerteVon(p.v1));
  if (p.nachher) { for (const e of p.nachher) try { Z.sim.eingabe(e, id); } catch { /* egal */ } p.nachher = undefined; }
  Z.spieler.add(p); Z.leerSeit = 0; console.log("Welt:", name, "übernimmt den Helden auf einem neuen Gerät in", Z.karte); namenMelden(Z); }
/** Steht der Held am Rand seines Gebiets (Wechsel ins Nachbargebiet)? */
function amRand(q: Platz): boolean { const Z = q.zone, K0 = Z && KARTEN[Z.karte], wz = Z && Z.karte === "welt" ? WELTZONE : K0 && K0.weltRegion ? WELTZONEN[K0.weltRegion] : undefined, h = Z && q.heldId ? Z.sim.nach(q.heldId) : undefined;
  if (!wz || !h) return true; return h.x < RAND || h.y < RAND || h.x > wz.b - RAND || h.y > wz.h - RAND; }
/** Verbindung weg: im Kampf (oder bis vor 10 s) bleibt der Held noch stehen; sonst sofort raus */
function sollHaengen(p: Platz): boolean { const Z = p.zone; if (!Z || !p.heldId || p.zoneWeg || p.ersetzt) return false; const h = Z.sim.nach(p.heldId); if (!h || h.tot) return false;
  return Date.now() - (p.kampfZ || 0) < KAMPF_RUHE_MS && !amRand(p); }
/** Einen Spieler aus seiner gemeinsamen Welt nehmen (genau einmal): Stelle merken, Gutschrift anstoßen, Held sofort weg */
function zoneVerlassen(p: Platz): void { const Z = p.zone; if (!Z || !p.heldId || p.zoneWeg) return; p.zoneWeg = true; if (p.invAus) { p.invAus(); p.invAus = undefined; } const K0 = KARTEN[Z.karte], h = Z.sim.nach(p.heldId);
  if (p.kampf && p.kampf.nutzer && K0 && K0.ursprung && h) { /* wer hier aufhört, beginnt wieder hier – wer gefallen ist, in der Waldmark */ const wx = K0.ursprung[0] + h.x, wy = K0.ursprung[1] + h.y;
    void (h.tot || p.abreise === "tp" ? stelleMerken({ sb }, p.kampf.nutzer, "waldmark", null, null) : stelleMerken({ sb }, p.kampf.nutzer, K0.weltRegion || weltRegionBei(wx, wy), Math.round(wx * 100) / 100, Math.round(wy * 100) / 100)); }
  void buchen(p, true); /* liest EP und Splitter sofort, bucht dann im Hintergrund */
  if (p.v1 && p.kampf && p.kampf.nutzer) v1Takt(sb, p.kampf.nutzer, p.v1, Z.sim, p.heldId, true); /* die letzten Skill-XP */
  if (p.v1 && p.kampf && p.kampf.nutzer && h) { const n = p.kampf.nutzer, voll = h.tot || h.lp >= h.max; if (voll) lebenJe.delete(n); else lebenJe.set(n, { lp: h.lp, zeit: Date.now() }); /* gefallen: in der Waldmark wieder voll */
    void sb("/rest/v1/rpc/rpg_held_lp_setzen", { method: "POST", body: JSON.stringify({ p_user: n, p_lp: voll ? null : Math.round(h.lp) }) }).catch((e) => console.error("LP speichern (Migration 046 eingespielt?):", (e as Error).message)); } /* bleibt auch über einen Neustart */
  if (p.kampf && p.kampf.nutzer && h && h.ausdauer) ausdauerJe.set(p.kampf.nutzer, { wert: h.ausdauer.wert, zeit: Date.now() });
  Z.sim.verlassen(p.heldId); Z.spieler.delete(p); if (!Z.spieler.size) Z.leerSeit = Date.now(); namenMelden(Z); }
function namenMelden(Z: Zone) { const m = JSON.stringify({ t: "namen", liste: [...Z.spieler].map((q) => { const w = Z.sim.nach(q.heldId || 0) as { stufe?: number } | undefined; const a = q.kampf && q.kampf.nutzer ? aussehenJe.get(q.kampf.nutzer) : undefined; const st = (w && w.stufe) || 1; q.lvGemeldet = st; if (q.kampf && q.kampf.nutzer) stufeSetzen(q.kampf.nutzer, st); return { id: q.heldId, name: q.name || "Wanderer", stufe: st, ...(a ? { a } : {}) }; }) });
  for (const q of Z.spieler) if (q.ws.readyState === WebSocket.OPEN) q.ws.send(m); }
const plaetze = new Set<Platz>();
/* ---------- Koop-Gruppen: nur im Arbeitsspeicher, über einen Code aus sechs Buchstaben. Der Anführer spielt die Kampagne, bis zu zwei Mitspieler kommen in seine Kämpfe. ---------- */
interface Warter { ws: WebSocket; nutzer: string; name: string; held: string; bereit?: boolean }
interface Raum { code: string; fuehrer: string; fuehrerName: string; warten: Set<Warter>; kampf: Platz | null; zuletzt: number;
  /* gemeinsames Dorf: wo die Gruppe ist und der Questfortschritt (Merker) des Anführers – Mitspieler sehen und ändern denselben */ ort: string | null; merker: Record<string, true>;
  /* Aufbruchslager: Vor dem gemeinsamen Aufbruch wählt jeder seinen Helden (keiner doppelt) und meldet sich bereit */ lager: string | null }
const raeume = new Map<string, Raum>();
const CODE = /^[A-Z]{6}$/;
function gruppeMelden(R: Raum) { const m = JSON.stringify({ t: "gruppe", code: R.code, fuehrer: R.fuehrerName, mitglieder: [...R.warten].map((w) => ({ name: w.name, held: w.held, fuehrer: w.nutzer === R.fuehrer, bereit: Boolean(w.bereit) })), lager: R.lager, kampf: R.kampf && R.kampf.kampf ? { ort: R.kampf.kampf.ort, karte: R.kampf.kampf.karte } : null });
  for (const w of R.warten) if (w.ws.readyState === WebSocket.OPEN) w.ws.send(m); }
/** Der Sim des Anführers sagt: hier geht es los – die wartenden Mitspieler kommen nach */
function losMelden(R: Raum, ort: string, karte: string) { for (const w of R.warten) if (w.nutzer !== R.fuehrer && w.ws.readyState === WebSocket.OPEN) w.ws.send(JSON.stringify({ t: "los", ort, kampf: karte })); gruppeMelden(R); }
setInterval(() => { const jetzt = Date.now(); for (const [c, R] of raeume) if (!R.warten.size && !R.kampf && jetzt - R.zuletzt > 30 * 60 * 1000) raeume.delete(c); }, 60000);

/* ---------- Supabase (nur mit dem geheimen Schlüssel aus der Umgebung) ---------- */
async function sb(pfad: string, init: RequestInit = {}): Promise<unknown> {
  const r = await fetch(SB_URL + pfad, { ...init, headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, "content-type": "application/json", ...(init.headers || {}) } /* der Geheimschlüssel in beiden Köpfen: nur so arbeitet die Datenbank mit Server-Rechten (sonst als „anon“) */, signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error("Supabase " + r.status + " " + (await r.text()).slice(0, 200)); return r.status === 204 ? null : r.json();
}
/** Wer ist angemeldet? Prüft das Token des Spielers bei Supabase. Gäste (anonyme Anmeldung) zählen nicht. */
async function nutzerAus(token: string): Promise<string | null> {
  if (!/^[A-Za-z0-9._-]{20,4000}$/.test(token)) return null;
  const r = await fetch(SB_URL + "/auth/v1/user", { headers: { apikey: SB_KEY, Authorization: "Bearer " + token }, signal: AbortSignal.timeout(8000) });
  if (!r.ok) return null; const u = (await r.json()) as { id?: string; is_anonymous?: boolean }; return u.id && !u.is_anonymous ? u.id : null;
}
async function epLesen(nutzer: string): Promise<Record<string, number>> {
  const z = (await sb(`/rest/v1/rpg_echtzeit_werte?user_id=eq.${nutzer}&select=ep`)) as { ep: Record<string, number> }[]; return (z[0] && z[0].ep) || {};
}
async function siegeLesen(nutzer: string): Promise<Set<string>> {
  const z = (await sb(`/rest/v1/rpg_echtzeit_siege?user_id=eq.${nutzer}&select=ort,kampf`)) as { ort: string; kampf: string }[]; return new Set(z.map((q) => q.ort + "/" + q.kampf));
}
/** Sieg eintragen, sobald alle Gegner besiegt sind (einmal je Kampf) */
async function siegEintragen(p: Platz): Promise<void> { const k = p.kampf; if (!k || k.gesiegt) return; k.gesiegt = true;
  try { await sb("/rest/v1/rpc/rpg_echtzeit_sieg", { method: "POST", body: JSON.stringify({ p_user: k.nutzer, p_ort: k.ort, p_kampf: k.karte }) }); if (p.ws.readyState === WebSocket.OPEN) p.ws.send(JSON.stringify({ t: "sieg", ort: k.ort, kampf: k.karte })); }
  catch (e) { console.error("Sieg nicht eingetragen:", (e as Error).message); k.gesiegt = false; /* beim nächsten Schritt noch einmal */ } }
/** EP und Seelensplitter in die Datenbank buchen: nur, was seit der letzten Buchung dazugekommen ist – so wird nichts doppelt gebucht.
 *  Mitten im Kampf ruft der Takt das von selbst auf (nach BUCHUNG_RUHE ohne neue Beute, spätestens nach BUCHUNG_SPAETESTENS); stirbt der Server, fehlt höchstens der letzte Rest.
 *  Schlägt eine Buchung fehl, bleibt der Betrag offen und geht mit der nächsten mit. schluss: Der Kampf ist vorbei – dann noch einmal alles Offene (mit bis zu drei Versuchen)
 *  und der Spieler bekommt {t:"gutschrift", ep, seelen} mit den Werten aus der Datenbank. Zwischenbuchungen meldet der Server als {t:"gebucht", ep, seelen}. */
async function buchen(p: Platz, schluss = false): Promise<void> {
  const sim = p.sim || (p.haupt && p.haupt.sim) || (p.zone && p.zone.sim), k = p.kampf; if (!k || !sim || !k.nutzer) return;
  if (schluss) { if (k.ende) return; k.ende = true; k.fertig = true; /* ab jetzt zählt nichts mehr dazu */ }
  if (k.bucht) { if (!schluss) return; k.nochmal = true; return new Promise<void>((ok) => k.wartende.push(ok)); } /* läuft gerade eine: danach den Rest */
  const ep = k.ep - k.gebuchtEp, seelen = seelenVon(p, sim) - k.gebuchtS, sende = (o: object) => { if (p.ws.readyState === WebSocket.OPEN) p.ws.send(JSON.stringify(o)); };
  const fertig = (o: object) => { if (k.ende) { sende({ t: "gutschrift", ...o }); for (const w of k.wartende.splice(0)) w(); } };
  if (ep <= 0 && seelen <= 0) { fertig(k.stand || { leer: true }); return; }
  k.bucht = true; k.seit = Date.now(); const epHeld: Record<string, number> = {}; for (const h of k.team) epHeld[h] = ep; let ok = false;
  for (let versuch = 0; versuch < (k.ende ? 3 : 1) && !ok; versuch++) {
    if (versuch) await new Promise((r) => setTimeout(r, 1500 * versuch));
    try { const r = await sb("/rest/v1/rpc/rpg_echtzeit_gutschrift", { method: "POST", body: JSON.stringify({ p_user: k.nutzer, p_ep: epHeld, p_seelen: seelen, p_kampf: k.ort + "/" + k.karte }) });
      k.gebuchtEp += ep; k.gebuchtS += seelen; k.stand = r as object; ok = true; if (!k.ende) sende({ t: "gebucht", ...(r as object) }); }
    catch (e) { console.error("Gutschrift fehlgeschlagen (bleibt offen):", (e as Error).message, ep, "EP", seelen, "Splitter"); }
  }
  k.bucht = false;
  if (k.nochmal || (k.ende && ok && (k.ep > k.gebuchtEp || seelenVon(p, sim) > k.gebuchtS))) { k.nochmal = false; return buchen(p); } /* inzwischen kam der Schluss oder neue Beute */
  if (k.ende) { if (ok) fertig(k.stand as object); else { console.error("Gutschrift endgültig fehlgeschlagen:", k.nutzer, k.ort + "/" + k.karte, k.ep - k.gebuchtEp, "EP", seelenVon(p, sim) - k.gebuchtS, "Splitter"); fertig({ fehler: true }); } }
}
/** Im Takt: Ist seit einer Weile Ruhe nach neuer Beute (oder lange nicht gebucht), zwischendurch buchen */
/** Seelensplitter eines Spielers: in der gemeinsamen Welt nur die selbst aufgehobenen, sonst alle des Kampfes */
const seelenVon = (q: Platz, sim: Sim): number => (q.zone && q.heldId ? sim.splitterVon(q.heldId) : sim.splitter);
function zwischenbuchen(q: Platz, sim: Sim, jetzt: number): void { const k = q.kampf; if (!k || k.ende || k.bucht || !k.nutzer) return; const sp = seelenVon(q, sim);
  if (k.ep !== k.letzterEp || sp !== k.letzterS) { k.letzterEp = k.ep; k.letzterS = sp; k.geaendert = jetzt; }
  if ((k.ep > k.gebuchtEp || sp > k.gebuchtS) && (jetzt - k.geaendert >= BUCHUNG_RUHE || jetzt - k.seit >= BUCHUNG_SPAETESTENS)) void buchen(q); }

/* ---------- Konto löschen (Willkommensseite → Einstellungen): nur mit gültiger Anmeldung UND dem Passwort; dann löscht der Server das Konto bei Supabase
   (Admin-Schnittstelle, nur mit dem geheimen Schlüssel hier auf dem Server). Alle Tabellen hängen mit „on delete cascade“ am Konto – es verschwinden nur die Daten dieses Kontos. */
const loeschVersuche = new Map<string, number[]>(); /* je Konto: Zeitpunkte der Fehlversuche (höchstens 5 in 15 Minuten) */
async function kontoLoeschen(token: string, passwort: string): Promise<{ code: number; text: string }> {
  if (!SB_URL || !SB_KEY) return { code: 503, text: "Der Server ist nicht eingerichtet." };
  if (!/^[A-Za-z0-9._-]{20,4000}$/.test(token) || typeof passwort !== "string" || !passwort || passwort.length > 200) return { code: 400, text: "Bitte melde dich an und gib dein Passwort ein." };
  const r = await fetch(SB_URL + "/auth/v1/user", { headers: { apikey: SB_KEY, Authorization: "Bearer " + token }, signal: AbortSignal.timeout(8000) });
  if (!r.ok) return { code: 401, text: "Deine Anmeldung ist abgelaufen. Bitte melde dich neu an." };
  const u = (await r.json()) as { id?: string; email?: string; is_anonymous?: boolean }; if (!u.id || u.is_anonymous || !u.email) return { code: 401, text: "Nur angemeldete Konten können gelöscht werden." };
  const jetzt = Date.now(), alt = (loeschVersuche.get(u.id) || []).filter((t) => jetzt - t < 15 * 60 * 1000); if (alt.length >= 5) return { code: 429, text: "Zu viele Versuche. Bitte warte 15 Minuten." };
  const pr = await fetch(SB_URL + "/auth/v1/token?grant_type=password", { method: "POST", headers: { apikey: SB_KEY, "content-type": "application/json" }, body: JSON.stringify({ email: u.email, password: passwort }), signal: AbortSignal.timeout(8000) });
  if (!pr.ok) { alt.push(jetzt); loeschVersuche.set(u.id, alt); return { code: 403, text: "Das Passwort stimmt nicht." }; }
  const d = await fetch(SB_URL + "/auth/v1/admin/users/" + encodeURIComponent(u.id), { method: "DELETE", headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY }, signal: AbortSignal.timeout(10000) });
  if (!d.ok) { console.error("Konto löschen:", d.status, (await d.text()).slice(0, 200)); return { code: 502, text: "Das Konto konnte gerade nicht gelöscht werden. Versuch es gleich noch einmal." }; }
  loeschVersuche.delete(u.id); console.log("Konto gelöscht (auf Wunsch des Spielers)"); return { code: 200, text: "Dein Konto ist gelöscht." }; }
const http = createServer((req, res) => { // Lebenszeichen für den Anbieter
  if (req.url === "/konto/belegt") { /* „Ins Spiel“ auf der Willkommensseite: ist das Konto schon auf einem anderen Gerät? (nur fragen, nichts nehmen) */
    const herkunft = String(req.headers.origin || ""), erlaubt = !HERKUNFT.length || HERKUNFT.includes(herkunft);
    const kopf = { "content-type": "application/json", ...(erlaubt ? { "access-control-allow-origin": herkunft, "access-control-allow-headers": "content-type, authorization", "access-control-allow-methods": "POST, OPTIONS", vary: "Origin" } : {}) };
    if (req.method === "OPTIONS") { res.writeHead(erlaubt ? 204 : 403, kopf); res.end(); return; }
    if (req.method !== "POST" || !erlaubt || !SB_URL || !SB_KEY) { res.writeHead(403, kopf); res.end(JSON.stringify({ ok: false })); return; }
    let b = ""; req.on("data", (c) => { b += c; if (b.length > 2000) req.destroy(); });
    req.on("end", () => { let g: unknown = ""; try { g = (JSON.parse(b || "{}") as { geraet?: unknown }).geraet; } catch { /* leer */ }
      nutzerAus(String(req.headers.authorization || "").replace(/^Bearer /, "")).then((nutzer) => {
        if (!nutzer) { res.writeHead(401, kopf); res.end(JSON.stringify({ ok: false })); return; }
        const r = Sitz.belegt(nutzer, Sitz.geraetVon(g)); res.writeHead(200, kopf); res.end(JSON.stringify({ ok: true, belegt: r.belegt, rest: r.belegt && r.rest !== null ? Math.ceil(r.rest / 1000) : null })); })
        .catch(() => { res.writeHead(503, kopf); res.end(JSON.stringify({ ok: false })); }); });
    return; }
  if (req.url === "/konto/loeschen") { /* nur von den eigenen Seiten (Herkunft wie beim Spiel) */
    const herkunft = String(req.headers.origin || ""), erlaubt = !HERKUNFT.length || HERKUNFT.includes(herkunft);
    const kopf = { "content-type": "application/json", ...(erlaubt ? { "access-control-allow-origin": herkunft, "access-control-allow-headers": "content-type, authorization", "access-control-allow-methods": "POST, OPTIONS", vary: "Origin" } : {}) };
    if (req.method === "OPTIONS") { res.writeHead(erlaubt ? 204 : 403, kopf); res.end(); return; }
    if (req.method !== "POST" || !erlaubt) { res.writeHead(403, kopf); res.end(JSON.stringify({ ok: false, text: "Nicht erlaubt." })); return; }
    let b = ""; req.on("data", (c) => { b += c; if (b.length > 4000) req.destroy(); });
    req.on("end", () => { let pw = ""; try { pw = String((JSON.parse(b || "{}") as { passwort?: string }).passwort || ""); } catch { /* leer */ }
      const token = String(req.headers.authorization || "").replace(/^Bearer /, "");
      kontoLoeschen(token, pw).then((e) => { res.writeHead(e.code, kopf); res.end(JSON.stringify({ ok: e.code === 200, text: e.text })); })
        .catch((x) => { console.error("Konto löschen:", (x as Error).message); res.writeHead(500, kopf); res.end(JSON.stringify({ ok: false, text: "Fehler beim Löschen. Versuch es gleich noch einmal." })); }); });
    return; }
  res.writeHead(200, { "content-type": "application/json", "access-control-allow-origin": "*" });
  res.end(JSON.stringify({ ok: true, dienst: "mythara-echtzeit", stand: (process.env.RENDER_GIT_COMMIT || "lokal").slice(0, 8) /* welcher Commit läuft (Render setzt die Variable selbst) */, handwerk: true, protokoll: PROTOKOLL, spieler: plaetze.size, welten: [{ id: "beta", name: "Riftmere 1", online: weltOnline() }] /* Weltenwahl auf der Willkommensseite (bisher nur eine Welt) */, kampagnen: Boolean(SB_URL && SB_KEY) }));
});
const wss = new WebSocketServer({ server: http, maxPayload: 65536, verifyClient: (info: { origin: string }) => { const ok = !HERKUNFT.length || HERKUNFT.includes(info.origin); if (!ok) console.log("Verbindung abgelehnt: Herkunft", info.origin); return ok; } });
/* Ein Fehler in einer einzelnen Partie darf nicht den ganzen Server beenden: melden und weiterlaufen */
process.on("uncaughtException", (e) => console.error("Unerwarteter Fehler:", e && (e as Error).stack || e));
process.on("unhandledRejection", (e) => console.error("Unerwarteter Fehler (Zusage):", e && (e as Error).stack || e));

/** Eine Kampfverbindung (eigener WebSocket oder – Zonen Stufe 3 – ein Kanal über die Welt-Verbindung, kanal.ts) */
function kampfVerbindung(ws: WebSocket, req: { url?: string }): void {
  if (plaetze.size >= MAX) { ws.close(1013, "voll"); return; }
  const url = new URL(req.url || "/", "http://x"), held0 = url.searchParams.get("held") || "schildwaechter", held = HELDEN[held0] ? held0 : "schildwaechter", mit = (url.searchParams.get("mit") || "").split(",").filter((x) => HELDEN[x] && x !== held).slice(0, 2);
  const karte = url.searchParams.get("kampf") || "", ort = url.searchParams.get("ort") || "", raum = (url.searchParams.get("raum") || "").toUpperCase(), mitglied = url.searchParams.get("mitglied") === "1";
  if (url.searchParams.get("warte") === "1") { warten(ws, raum, url.searchParams.get("fuehrer") === "1"); return; } /* Wartebereich einer Koop-Gruppe */
  if (url.searchParams.get("welt") === "1") { if (!SB_URL || !SB_KEY) { ws.close(4400, "welt nicht eingerichtet"); return; } /* gemeinsame Welt: wer ist wo (welt.ts) */
    weltVerbindung(ws, url, { nutzerAus, sb, epLesen, gruppeHat: (c, n) => { const R = raeume.get(c); return Boolean(R && [...R.warten].some((w) => w.nutzer === n)); },
      kanalAuf: (k, q) => { const u = new URLSearchParams(q); if (u.has("welt") || u.has("warte") || !u.get("kampf")) { k.close(4400, "kanal"); return; } kampfVerbindung(k as unknown as WebSocket, { url: "/?" + q }); } }); return; }
  const p: Platz = { ws, sim: null, zuletzt: Date.now(), fenster: Date.now(), zahl: 0 }; plaetze.add(p);
  console.log("Verbindung:", karte ? `Kampf ${ort}/${karte}` : "Riss", "· Held", held, "· Begleiter", mit.length);
  const los = () => ws.send(JSON.stringify({ t: "hallo", protokoll: PROTOKOLL, tick: TICK }));
  if (!karte) { karteNehmen(GRUNDKARTE); Object.assign(STAERKE, { lp: 1, schaden: 1, beute: null, ep: 0 }); for (const k of Object.keys(HELDENSTUFE)) delete HELDENSTUFE[k]; for (const k of Object.keys(HELDENEP)) delete HELDENEP[k]; p.sim = new Sim(held, (Date.now() ^ (Math.random() * 1e9)) >>> 0, mit); los(); }
  else if (!KARTEN[karte] || !ORTSTUFE[ort] || !SB_URL || !SB_KEY) { console.log("Kampf abgelehnt: unbekannt oder Supabase nicht eingerichtet"); ws.close(4400, "kampf unbekannt"); plaetze.delete(p); return; }
  const frist = karte ? setTimeout(() => { if (!p.sim) { console.log("Kampf abgelehnt: keine Anmeldung binnen 10 s"); ws.close(4401, "keine anmeldung"); } }, 10000) : null;
  ws.on("message", async (roh) => {
    const jetzt = Date.now(); if (jetzt - p.fenster > 1000) { p.fenster = jetzt; p.zahl = 0; } if (++p.zahl > K.EINGABEN_JE_SEK) return; // zu viele Eingaben: verwerfen
    let e: Eingabe & { token?: string }; try { e = JSON.parse(String(roh)); } catch { return; } p.zuletzt = jetzt;
    if (p.vorbereitet && (e as { t: string }).t === "betreten") { const v = p.vorbereitet, m = e as unknown as { x?: number; y?: number }; p.vorbereitet = undefined; /* an der Grenze: jetzt hinein, an der Stelle, an der der Held die Grenze überschreitet */
      const wo = Number.isFinite(m.x) && Number.isFinite(m.y) ? { x: Number(m.x), y: Number(m.y) } : undefined; if (KARTEN[karte] && KARTEN[karte].ursprung) zoneBetreten(p, karte, ort, v.typ, v.ep, v.name, wo); return; }
    if (karte && !p.sim && !p.haupt && !p.zone) { /* Kampagnenkampf: zuerst die Anmeldung */
      /* Einstellungen, die der Browser gleich nach dem „hallo“ schickt (Stil, Autoangriff, Sprint), nicht verwerfen: merken und beim Betreten der Zone anwenden */
      { const t = (e as { t: string }).t; if (t === "stil") { p.stilVorab = (e as { stil?: unknown }).stil; if (p.v1) p.v1.stil = stilPruefen(p.stilVorab); return; }
        if (t === "auto" || t === "sprint") { p.nachher = (p.nachher || []).filter((x) => (x as { t: string }).t !== t).concat([e]); return; } }
      if ((e as { t: string }).t !== "anmeldung" || p.kampf) return; p.kampf = neuerKampf(karte, ort, [held, ...mit]);
      try { const nutzer = await nutzerAus(String(e.token || "")); if (!nutzer) { console.log("Kampf abgelehnt: Anmeldung von Supabase nicht bestätigt"); ws.close(4401, "anmeldung ungueltig"); return; }
        { const g = Sitz.geraetVon((e as { geraet?: unknown }).geraet), b = Sitz.belegt(nutzer, g); /* Ein Konto, ein Gerät (sitz.ts): wer zuerst spielt, bleibt */
          if (b.belegt || !Sitz.nehmen(nutzer, g, ws)) { console.log("Kampf abgelehnt: Konto ist auf einem anderen Gerät"); belegtAbweisen(ws, b.belegt ? b.rest : null); return; }
          ws.once("close", (_c: number, grund: Buffer) => Sitz.los(ws, String(grund) === "abmelden")); }
        p.kampf.nutzer = nutzer; const [ep, siege] = await Promise.all([epLesen(nutzer), siegeLesen(nutzer)]);
        if (STRECKEN.has(karte)) { /* gemeinsame Kampfwelt: alle Spieler auf dieser Strecke teilen sich Simulation und Gegner */
          const [aktiv, profil, v1] = await Promise.all([sb(`/rest/v1/rpg_echtzeit_aktiver_held?user_id=eq.${nutzer}&select=held`).catch(() => []) as Promise<{ held: string }[]>, sb(`/rest/v1/rpg_profiles?user_id=eq.${nutzer}&select=handle`).catch(() => []) as Promise<{ handle: string }[]>, heldV1Lesen(sb, nutzer)]);
          if (v1) { if ((e as { angelegt?: unknown }).angelegt !== undefined) v1.angelegt = angelegtPruefen((e as { angelegt?: unknown }).angelegt, v1.waffe); if (p.stilVorab !== undefined) { v1.stil = stilPruefen(p.stilVorab); p.stilVorab = undefined; } p.v1 = v1; } /* Stil, der während des Ladens kam, gilt (sonst stand Akkurat im Browser, gerechnet wurde Ausgewogen) */ /* Kampfregeln v2: eigener Held mit Skill-XP und geprüfter Ausrüstung */
          if (v1) { const iv = await inventarLaden(sb, nutzer); if (iv && p.v1) { p.v1.angelegt = { ...iv.inv.angelegt }; p.v1.wirkungen = wirkungenAktiv(iv.inv.wirkungen); p.v1.geladen = istGeladen(iv.inv.angelegtD && iv.inv.angelegtD.waffe); /* die Ausrüstung kommt aus dem Server-Inventar (Migration 043) */
            p.invAus = inventarHoeren(nutzer, (inv) => { if (!p.v1) return; p.v1.angelegt = { ...inv.angelegt }; p.v1.wirkungen = wirkungenAktiv(inv.wirkungen); p.v1.geladen = istGeladen(inv.angelegtD && inv.angelegtD.waffe); if (p.zone && p.heldId) p.zone.sim.kampfwerteSetzen(p.heldId, kampfwerteVon(p.v1)); }); } }
          const typ = aktiv[0] && HELDEN[aktiv[0].held] ? aktiv[0].held : held, name = (profil[0] && profil[0].handle) || "Wanderer";
          /* Während auf die Datenbank gewartet wurde, kann die Seite schon wieder weg sein (Neuladen): dann keinen Helden mehr hineinsetzen – er bliebe sonst als Geist stehen */
          if (ws.readyState !== WebSocket.OPEN || !plaetze.has(p)) { console.log("Welt: Anmeldung verworfen – Verbindung schon zu"); return; }
          if (frist) clearTimeout(frist);
          /* Vorverbinden (?warten=1): die offene Welt meldet sich schon an, wenn der Held sich der Grenze nähert – betreten wird erst mit „betreten“, ohne Wartezeit */
          Sitz.drin(ws);
          if (url.searchParams.get("warten") === "1") { p.vorbereitet = { typ, ep: Number(ep[typ]) || 0, name }; los(); console.log("Welt:", name, "bereit an der Grenze von", karte); return; }
          const lx = Number(url.searchParams.get("lx")), ly = Number(url.searchParams.get("ly")), wo = KARTEN[karte].ursprung && Number.isFinite(lx) && Number.isFinite(ly) && url.searchParams.has("lx") ? { x: lx, y: ly } : undefined; /* Kampfzone der offenen Welt: dort hinein, wo man steht */
          zoneBetreten(p, karte, ort, typ, Number(ep[typ]) || 0, name, wo); if (ws.readyState === WebSocket.OPEN) los(); return; }
        if (mitglied) { /* Koop-Mitspieler: in den laufenden Kampf des Anführers; der Fortschritt zählt auch für ihn */
          const R = raeume.get(raum), H = R && R.kampf; if (!R || !H || !H.sim || !H.kampf || H.kampf.karte !== karte || H.kampf.ort !== ort || H.kampf.fertig) { console.log("Koop abgelehnt: kein laufender Kampf in", raum); ws.close(4404, "kein gemeinsamer kampf"); return; }
          if ((H.mit || new Set()).size >= 2) { ws.close(4409, "gruppe voll"); return; }
          const id = H.sim.uebernehmen(held); if (!id) { ws.close(4409, "kein platz"); return; } const typ = (H.sim.nach(id) as { typ: string }).typ; H.sim.setzeErfahrung(typ, Number(ep[typ]) || 0);
          p.haupt = H; p.heldId = id; p.kampf.team = [typ]; (H.mit = H.mit || new Set()).add(p); Sitz.drin(ws); if (frist) clearTimeout(frist); console.log("Koop: Mitspieler kommt dazu", ort + "/" + karte, typ); if (ws.readyState === WebSocket.OPEN) los(); return; }
        if (!darfKaempfen(siege, ort, karte)) { console.log("Kampf abgelehnt: noch nicht freigeschaltet", ort, karte, [...siege].join(",")); ws.close(4403, "noch nicht freigeschaltet"); return; } /* Reihenfolge: erst der Kampf davor, erst die Kampagne davor */
        const R = raum && CODE.test(raum) ? raeume.get(raum) : undefined, gruppe = R && R.fuehrer === nutzer ? R : undefined, menschen = gruppe ? Math.min(3, [...gruppe.warten].filter((w) => w.nutzer !== nutzer).length + 1) : 1;
        setzeKarte(KARTEN[karte], FEIN); setzeStaerke(ORTSTUFE[ort], Math.max(1 + mit.length, menschen)); /* die Gegner richten sich nach der ganzen Gruppe */ for (const k of Object.keys(HELDENSTUFE)) delete HELDENSTUFE[k]; for (const k of Object.keys(HELDENEP)) delete HELDENEP[k]; for (const [h, v] of Object.entries(ep)) { HELDENEP[h] = Number(v) || 0; HELDENSTUFE[h] = stufeAusEp(HELDENEP[h]); }
        p.sim = new Sim(held, (Date.now() ^ (Math.random() * 1e9)) >>> 0, mit); Sitz.drin(ws); if (frist) clearTimeout(frist); console.log("Kampf beginnt:", ort + "/" + karte, gruppe ? "(Koop " + gruppe.code + ")" : ""); if (ws.readyState === WebSocket.OPEN) los();
        if (gruppe) { gruppe.kampf = p; p.raum = gruppe.code; gruppe.zuletzt = Date.now(); const erwartet = [...gruppe.warten].filter((w) => w.nutzer !== nutzer).length; if (erwartet) p.start = { bis: Date.now() + 20000, erwartet, los: 0, zuletzt: "" }; losMelden(gruppe, ort, karte); }
      } catch (err) { console.error("Anmeldung fehlgeschlagen [Schlüssel in Render: " + SCHLUESSELART + "]:", (err as Error).message); ws.close(4503, "anmeldung nicht moeglich"); }
      return; }
    if ((e as { t: string }).t === "da") return; /* Lebenszeichen des Browsers (es gab Eingaben, etwa im Chat): zählt gegen die Inaktivität */
    if ((e as { t: string }).t === "verlassen") { void buchen(p, true); return; }
    if ((e as { t: string }).t === "abreise") { if (p.zone && p.heldId && !p.zoneWeg) { p.abreise = (e as { tp?: unknown }).tp === false ? "tor" : "tp"; zoneVerlassen(p); } return; } /* Teleport: Held sofort aus der Kampfwelt, neu beginnt er in der Waldmark */
    if ((e as { t: string }).t === "stil") { /* v3: Angriffsstil gewählt (Index der Kampfart, 1 = Standard) – Kampfwerte neu */
      if (p.v1) { p.v1.stil = stilPruefen((e as { stil?: unknown }).stil); if (p.zone && p.heldId) p.zone.sim.kampfwerteSetzen(p.heldId, kampfwerteVon(p.v1)); } else p.stilVorab = (e as { stil?: unknown }).stil; /* Held lädt noch: merken */ return; }
    if ((e as { t: string }).t === "ausruestung") { /* v1: anderes angelegt – Kampfwerte neu (nur eigene Gegenstände, siehe kampfv1.ts) */
      if (p.v1 && p.kampf && p.kampf.nutzer && inventarVon(p.kampf.nutzer)) return; /* mit Server-Inventar zählt dessen Ausrüstung, nicht die Meldung des Browsers */
      if (p.v1) { p.v1.angelegt = angelegtPruefen((e as { angelegt?: unknown }).angelegt, p.v1.waffe); console.log(`Welt: Ausrüstung ${p.name || "?"}: waffe=${p.v1.angelegt.waffe || "-"} nebenhand=${p.v1.angelegt.nebenhand || "-"}`); if (p.zone && p.heldId) p.zone.sim.kampfwerteSetzen(p.heldId, kampfwerteVon(p.v1)); } return; }
    try { if (p.sim) p.sim.eingabe(e); else if (p.haupt && p.haupt.sim && p.heldId) p.haupt.sim.eingabe(e, p.heldId); else if (p.zone && p.heldId) p.zone.sim.eingabe(e, p.heldId); } catch (err) { console.error("Eingabe:", (err as Error).message); }
  });
  const weg = () => { if (!plaetze.has(p)) return; plaetze.delete(p); if (frist) clearTimeout(frist);
    if (sollHaengen(p)) { p.haengt = Date.now(); console.log("Welt:", p.name || "?", "Verbindung weg im Kampf – der Held bleibt noch stehen"); return; } /* gebucht und entfernt wird in der Zonen-Runde */
    void buchen(p, true); /* wer die Seite schließt, bekommt trotzdem, was er erkämpft hat */
    if (p.haupt) { p.haupt.mit?.delete(p); if (p.haupt.sim && p.heldId) p.haupt.sim.freigeben(p.heldId); } /* sein Held kämpft als Begleiter weiter */
    zoneVerlassen(p); /* sein Held verschwindet aus der gemeinsamen Welt, die Stelle wird gemerkt, gutgeschrieben wird trotzdem */
    if (p.mit) for (const m of p.mit) { void buchen(m, true).finally(() => { if (m.ws.readyState === WebSocket.OPEN) { m.ws.send(JSON.stringify({ t: "koopende" })); m.ws.close(4410, "anfuehrer weg"); } }); }
    if (p.raum) { const R = raeume.get(p.raum); if (R && R.kampf === p) { R.kampf = null; R.zuletzt = Date.now(); gruppeMelden(R); } } }; ws.on("close", weg); ws.on("error", weg);
}
wss.on("connection", (ws, req) => kampfVerbindung(ws, req));

/** Wartebereich: erste Nachricht {t:"anmeldung", token, name, held}. Der Anführer gründet die Gruppe (fuehrer=1), andere treten mit dem Code bei. */
function warten(ws: WebSocket, code: string, fuehrer: boolean) {
  if (!CODE.test(code) || !SB_URL || !SB_KEY) { ws.close(4400, "code ungueltig"); return; } let w: Warter | null = null, R: Raum | undefined;
  const frist = setTimeout(() => { if (!w) ws.close(4401, "keine anmeldung"); }, 10000);
  let fenster = Date.now(), zahl = 0;
  ws.on("message", async (roh) => { const jetzt = Date.now(); if (jetzt - fenster > 1000) { fenster = jetzt; zahl = 0; } if (++zahl > 40) return;
    let e: { t?: string; token?: string; name?: string; held?: string; ja?: boolean; ort?: string | null; merker?: unknown; x?: number; y?: number; f?: number; l?: number; id?: string; setzt?: string; kampf?: string }; try { e = JSON.parse(String(roh)); } catch { return; }
    if (w && R) { dorf(R, w, e); return; } if (w) return; if (e.t !== "anmeldung") return;
    const nutzer = await nutzerAus(String(e.token || "")).catch(() => null); if (!nutzer) { ws.close(4401, "anmeldung ungueltig"); return; } clearTimeout(frist);
    const name = String(e.name || "Held").replace(/[<>&"]/g, "").slice(0, 24) || "Held", held = HELDEN[String(e.held)] ? String(e.held) : "schildwaechter";
    R = raeume.get(code); if (fuehrer) { if (R && R.fuehrer !== nutzer) { ws.close(4409, "code vergeben"); return; } if (!R) { R = { code, fuehrer: nutzer, fuehrerName: name, warten: new Set(), kampf: null, zuletzt: Date.now(), ort: null, merker: {}, lager: null }; raeume.set(code, R); } }
    else if (!R) { ws.close(4404, "gruppe unbekannt"); return; }
    for (const o of [...R.warten]) if (o.nutzer === nutzer) { R.warten.delete(o); try { o.ws.close(1000, "neu verbunden"); } catch { /* schon zu */ } } /* dieselbe Person nur einmal */
    if (new Set([...R.warten].map((o) => o.nutzer).concat(nutzer)).size > 3) { ws.close(4409, "gruppe voll"); return; }
    const vergeben = new Set([...R.warten].map((o) => o.held)); let held2 = held; if (vergeben.has(held2)) held2 = Object.keys(HELDEN).find((k) => !vergeben.has(k)) || held2; /* jeder Held nur einmal */
    w = { ws, nutzer, name, held: held2 }; R.warten.add(w); R.zuletzt = Date.now(); console.log("Koop: Gruppe", code, fuehrer ? "gegründet" : "beigetreten", "·", R.warten.size, "da"); gruppeMelden(R);
    if (!fuehrer && R.kampf && R.kampf.kampf && !R.kampf.kampf.fertig) ws.send(JSON.stringify({ t: "los", ort: R.kampf.kampf.ort, kampf: R.kampf.kampf.karte })); /* Kampf läuft schon: gleich dazu */
    else if (!fuehrer && R.ort) ws.send(JSON.stringify({ t: "ort", ort: R.ort, merker: R.merker })); /* die Gruppe ist in einem Dorf: mitreisen */ });
  const weg = () => { clearTimeout(frist); if (R && w) { R.warten.delete(w); R.zuletzt = Date.now(); gruppeMelden(R); const m = JSON.stringify({ t: "weg", n: w.name }); for (const o of R.warten) if (o.ws.readyState === WebSocket.OPEN) o.ws.send(m); } }; ws.on("close", weg); ws.on("error", weg);
  const lebt = setInterval(() => { if (ws.readyState !== WebSocket.OPEN) { clearInterval(lebt); return; } try { ws.ping(); } catch { /* zu */ } }, 25000);
}

/** Gemeinsamer Start: Solange Mitspieler fehlen (höchstens 20 s), steht der Kampf; dann 3 Sekunden Countdown. Meldet allen den Stand. */
function startHalt(p: Platz, jetzt: number): boolean { const s = p.start!; const da = p.mit ? p.mit.size : 0;
  if (!s.los) { if (da < s.erwartet && jetzt < s.bis) { const t = `Warte auf deine Mitspieler … ${da} / ${s.erwartet} da (noch ${Math.ceil((s.bis - jetzt) / 1000)} s)`; startMelden(p, t); return true; } s.los = jetzt + 3000; }
  if (jetzt < s.los) { startMelden(p, `Alle bereit – los in ${Math.ceil((s.los - jetzt) / 1000)} …`); return true; }
  startMelden(p, ""); p.start = undefined; return false; }
function startMelden(p: Platz, text: string) { const s = p.start; if (!s || s.zuletzt === text) return; s.zuletzt = text; const m = JSON.stringify({ t: "koopstart", text });
  for (const q of [p, ...(p.mit || [])]) if (q.ws.readyState === WebSocket.OPEN) q.ws.send(m); }

const MERK = /^[a-z][a-z0-9_]{0,39}$/, ORTNAME = /^[a-z]{2,20}$/;
/** Das gemeinsame Dorf: Ort wechseln (Anführer), Fortschritt teilen, Positionen, Gespräche und Türen an die anderen weitergeben */
function dorf(R: Raum, w: Warter, e: { t?: string; ort?: string | null; merker?: unknown; x?: number; y?: number; f?: number; l?: number; id?: string; setzt?: string; kampf?: string }) {
  const an = (m: object, auch = false) => { const s = JSON.stringify(m); for (const o of R.warten) if ((auch || o !== w) && o.ws.readyState === WebSocket.OPEN) o.ws.send(s); };
  const fuehrer = w.nutzer === R.fuehrer; R.zuletzt = Date.now();
  if (e.t === "lager" && fuehrer) { R.lager = typeof e.ort === "string" && ORTNAME.test(e.ort) ? e.ort : null; for (const o of R.warten) o.bereit = false; gruppeMelden(R); return; }
  if (e.t === "held" && typeof (e as { held?: string }).held === "string" && HELDEN[(e as { held: string }).held]) { const h = (e as { held: string }).held; if ([...R.warten].some((o) => o !== w && o.held === h)) return; /* jeder Held nur einmal */ w.held = h; w.bereit = false; gruppeMelden(R); return; }
  if (e.t === "bereit") { w.bereit = Boolean((e as { ja?: boolean }).ja); gruppeMelden(R); return; }
  if (e.t === "ort" && fuehrer) { R.lager = null; const ort = typeof e.ort === "string" && ORTNAME.test(e.ort) ? e.ort : null; const neu = ort !== R.ort; R.ort = ort;
    if (ort && e.merker && typeof e.merker === "object") { const m: Record<string, true> = neu ? {} : R.merker; for (const k of Object.keys(e.merker as object).slice(0, 200)) if (MERK.test(k) && (e.merker as Record<string, unknown>)[k] === true) m[k] = true; R.merker = m; }
    if (!ort) R.merker = {}; an({ t: "ort", ort: R.ort, merker: R.merker }); }
  else if (e.t === "merker" && R.ort && typeof e.setzt === "string" && MERK.test(e.setzt)) { R.merker[e.setzt] = true; an({ t: "merker", merker: R.merker }, true); }
  else if (e.t === "pos" && R.ort) { const z = (v: unknown) => typeof v === "number" && Number.isFinite(v) && Math.abs(v) < 20000; if (!z(e.x) || !z(e.y)) return; an({ t: "pos", n: w.name, held: w.held, x: Math.round(e.x as number), y: Math.round(e.y as number), f: e.f ? 1 : 0, l: e.l ? 1 : 0 }); }
  else if (e.t === "sage" && R.ort && typeof e.id === "string" && MERK.test(e.id) && typeof e.setzt === "string" && MERK.test(e.setzt)) an({ t: "sage", von: w.name, id: e.id, setzt: e.setzt });
  else if (e.t === "tuer" && R.ort && typeof e.kampf === "string" && MERK.test(e.kampf)) { const s = JSON.stringify({ t: "tuer", kampf: e.kampf, von: w.name }); for (const o of R.warten) if (o.nutzer === R.fuehrer && o.ws.readyState === WebSocket.OPEN) o.ws.send(s); }
}

let n = 0;
setInterval(() => {
  n++; const jetzt = Date.now();
  for (const [key, Z] of zonen) { /* gemeinsame Kampfwelten: ein Schritt für alle, jeder bekommt seinen Blick und nur seine EP */
    if (!Z.spieler.size) { if (Z.leerSeit && jetzt - Z.leerSeit > 120000) { zonen.delete(key); console.log("Welt: Zone", key, "geschlossen"); } continue; }
    try { Z.sim.schritt(); } catch (err) { console.error("Welt-Schritt:", (err as Error).stack); continue; }
    const z = Z.sim.zustand(); let stufe = false;
    { const K0 = KARTEN[Z.karte]; if (K0 && K0.ursprung) for (const ev of z.ev) if (ev.a === "beute") { /* Beute auf den Boden der Region: 30 s nur für den Besitzer, dann 5 min für alle */
      const q = [...Z.spieler].find((o) => o.heldId === ev.besitzer), besitzer = (q && q.kampf && q.kampf.nutzer) || "";
      for (const [g, n, nur] of ev.g) if (!nur || (besitzer && bedingungErfuellt(besitzer, nur))) bodenDazu(K0.weltRegion || weltRegionBei(K0.ursprung[0] + ev.x, K0.ursprung[1] + ev.y), K0.ursprung[0] + ev.x, K0.ursprung[1] + ev.y, g, n, besitzer, LOOT); } } /* die eine Kampfwelt: Region nach der Stelle */ /* bedingte Beute nur, wenn der Bezwinger die Bedingung erfüllt */
    for (const ev of z.ev) if (ev.a === "treffer") { /* Zielscheibe: Treffer zählen für Quests; wer über Fernkampf 10 ist (oder sie nicht freigeschaltet hat), lernt nichts */
      const q = [...Z.spieler].find((o) => o.heldId === ev.von), nutzer = q && q.kampf && q.kampf.nutzer; if (!q || !nutzer) continue; getroffen(nutzer, ev.typ, ev.art);
      if (jetzt - (q.zielHinweis || 0) > 60000) { const frei = zielscheibeFrei(nutzer), h = q.heldId ? Z.sim.nach(q.heldId) : undefined, fern = h && h.kw ? levelVon(h.kw.skills.fernkampf || 0, "fernkampf") : 0;
        const t = !frei ? "Die Wachen lassen hier nur üben, wer für sie arbeitet." : ev.art !== "fern" ? "An der Zielscheibe übt man mit Pfeil und Bogen." : fern >= ZIELSCHEIBE_BIS ? "Hier lernst du nichts mehr." : "";
        if (t) { q.zielHinweis = jetzt; systemAn(nutzer, t); } } }
    for (const ev of z.ev) if (ev.a === "erlegt") { const q = [...Z.spieler].find((o) => o.heldId === ev.besitzer), nutzer = q && q.kampf && q.kampf.nutzer; if (nutzer) erlegt(nutzer, ev.typ); } /* Quests: Siege zählen (Quest 02: Mooshocker) */
    for (const ev of z.ev) if (ev.a === "hieb") { const q = [...Z.spieler].find((o) => o.heldId === ev.id); if (q && q.v1 && q.v1.geladen && q.kampf && q.kampf.nutzer) waffeLadungVerbrauchen(sb, q.kampf.nutzer); } /* Phase 5b: jeder Angriff mit geladener Waffe kostet eine Ladung, auch ein Fehlschlag */
    for (const ev of z.ev) if (ev.a === "welle") { const I = instanzAus(ev.instanz); if (I && I.def.welle) erlegt(I.nutzer, I.def.welle); } /* Instanz: eine Welle ist gefallen (B4: Versammlungshalle) */
    for (const ev of z.ev) if (ev.a === "boss") for (const id of ev.ids) { const q = [...Z.spieler].find((o) => o.heldId === id), nutzer = q && q.kampf && q.kampf.nutzer; /* Bosszähler und Bestzeit je Konto (Migration 050) */
      if (nutzer) void bossSieg(sb, nutzer, ev.typ, ev.sek).then((t) => systemAn(nutzer, t)).catch((e) => console.error("Bosszähler:", (e as Error).message)); }
    for (const q of [...Z.spieler]) { if (q.heldId && Z.sim.imKampf(q.heldId)) q.kampfZ = jetzt;
      if (n % 10 === 0 && q.heldId && q.kampf) { const h = Z.sim.nach(q.heldId); if (h) h.zielscheibeFrei = zielscheibeFrei(q.kampf.nutzer); } /* Zielscheibe: alle 1 s nach dem Queststand */
      if (n % 10 === 0 && q.heldId && q.kampf && q.kampf.nutzer && !q.zoneWeg) { const h = Z.sim.nach(q.heldId), K0 = KARTEN[Z.karte], nu = q.kampf.nutzer; /* Instanzen und Türen je Spieler (shared/boss.ts) nach seinem Queststand */
        if (h && !h.tot && K0 && K0.ursprung) { const d = weltJeSpieler(Z.sim, q.heldId, nu, K0.ursprung[0] + h.x, K0.ursprung[1] + h.y, (s) => schalter(nu, s)); if (d && d.text) systemAn(nu, d.text); } }
      if (q.ws.readyState === WebSocket.CLOSING || q.ws.readyState === WebSocket.CLOSED) { /* Sicherheitsnetz: keine Helden ohne Verbindung – außer im Kampf, dann bis 10 s Ruhe, höchstens 60 s */
        const h = q.heldId ? Z.sim.nach(q.heldId) : undefined;
        if (!q.haengt || !h || h.tot || q.ersetzt || jetzt - (q.kampfZ || 0) >= KAMPF_RUHE_MS || jetzt - q.haengt >= HAENGEN_MS) { if (q.haengt) console.log("Welt:", q.name || "?", "verlässt die Welt nach dem Kampf"); zoneVerlassen(q); continue; } }
      else if (jetzt - q.zuletzt > RUHE_MS) { Sitz.abmelden(q.ws); q.ws.close(1000, "ruhe"); continue; } /* Zwangsabmeldung: das Konto ist frei */
      if (q.kampf && !q.kampf.fertig) for (const ev of z.ev) { if (ev.a === "ep" && ev.id === q.heldId) q.kampf.ep += ev.n; if (ev.a === "stufe") stufe = true; }
      if (q.ws.readyState === WebSocket.OPEN && q.ws.bufferedAmount < 65536) q.ws.send(JSON.stringify({ t: "z", z: Z.sim.sichtFuer(z, q.heldId || 0) })); zwischenbuchen(q, Z.sim, jetzt);
      if (q.v1 && q.heldId && q.kampf && q.kampf.nutzer && jetzt - (q.v1T || 0) >= 1000) { q.v1T = jetzt; v1Takt(sb, q.kampf.nutzer, q.v1, Z.sim, q.heldId); } /* Skill-XP: Level prüfen, alle 10 s buchen */
      if (q.heldId && q.lvGemeldet !== undefined) { const w = Z.sim.nach(q.heldId) as { stufe?: number } | undefined; if (w && (w.stufe || 1) !== q.lvGemeldet) stufe = true; } /* Heldenlevel gestiegen (Skills): Namensschilder sofort neu */ }
    if (stufe) namenMelden(Z); }
  for (const p of plaetze) {
    if (jetzt - p.zuletzt > RUHE_MS) { Sitz.abmelden(p.ws); p.ws.close(1000, "ruhe"); continue; } // wer lange nichts tut, gibt den Platz frei
    if (!p.sim) continue;
    if (p.start && startHalt(p, jetzt)) { if (n % ZUSTAND_JE === 0 && p.ws.readyState === WebSocket.OPEN) { const z = p.sim.zustand(); p.ws.send(JSON.stringify({ t: "z", z })); if (p.mit) for (const m of p.mit) if (m.ws.readyState === WebSocket.OPEN) m.ws.send(JSON.stringify({ t: "z", z: { ...z, ich: p.sim.ichVon(m.heldId || 0) } })); } continue; } /* gemeinsamer Start: noch steht alles */
    try { p.sim.schritt(); } catch (err) { console.error("Schritt:", (err as Error).stack); p.ws.close(1011, "fehler"); plaetze.delete(p); continue; }
    if (n % ZUSTAND_JE === 0 && p.ws.readyState === WebSocket.OPEN && p.ws.bufferedAmount < 65536) { const z = p.sim.zustand();
      if (p.kampf && !p.kampf.fertig) for (const ev of z.ev) if (ev.a === "ep") p.kampf.ep += ev.n; /* Erfahrung zählt der Server selbst mit */
      if (p.kampf && !p.kampf.gesiegt && z.phase === "sieg") void siegEintragen(p);
      p.ws.send(JSON.stringify({ t: "z", z }));
      if (p.mit) for (const m of p.mit) { if (m.kampf && !m.kampf.fertig) for (const ev of z.ev) if (ev.a === "ep") m.kampf.ep += ev.n; if (m.kampf && !m.kampf.gesiegt && z.phase === "sieg") void siegEintragen(m);
        if (m.ws.readyState === WebSocket.OPEN && m.ws.bufferedAmount < 65536) m.ws.send(JSON.stringify({ t: "z", z: { ...z, ich: p.sim.ichVon(m.heldId || 0) } })); m.zuletzt = jetzt; } }
    zwischenbuchen(p, p.sim, jetzt); if (p.mit) for (const m of p.mit) zwischenbuchen(m, p.sim, jetzt); /* Zwischenbuchungen, auch ohne Zustandsmeldung */
  }
}, 1000 / TICK);

const SCHLUESSELART = SB_KEY.startsWith("sb_secret_") ? "Geheimschlüssel (sb_secret_…)" : SB_KEY.startsWith("eyJ") ? "service_role-Schlüssel (JWT)" : SB_KEY.startsWith("sb_publishable_") ? "FALSCH: das ist der öffentliche Schlüssel (sb_publishable_…) – gebraucht wird der geheime (sb_secret_…)" : SB_KEY ? "unbekannte Form" : "fehlt";
http.listen(PORT, () => { console.log("SUPABASE_SERVICE_KEY:", SCHLUESSELART); console.log(`Mythara Echtzeit läuft auf Port ${PORT} (${TICK} Schritte je Sekunde, Kampagnen ${SB_URL && SB_KEY ? "an" : "aus – SUPABASE_URL/SUPABASE_SERVICE_KEY fehlen"})`); });
