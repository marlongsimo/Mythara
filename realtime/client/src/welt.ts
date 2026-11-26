/* (Stand 25.11.2026, Regionswechsel) 
 * Mythara Echtzeit – die gemeinsame Welt im Client: andere Spieler sehen (Name, Stufe, Leben), Chat, aktiver Held.
 * Verbindung zum Spielserver mit ?welt=1&ort=<ort> (nur mit Spielerkonto). Name, Held und Stufe bestimmt der Server.
 * Den Helden wechselt man nur in der Waldmark – der Server lehnt den Wechsel anderswo ab.
 */
import { GEGENSTAENDE } from "../../shared/gegenstaende";
import { abmelden, kuerzlichAktiv, beimAbmelden, restAus } from "./abmeldung";
import { Q1 } from "../../shared/quest01";
import type { Stand } from "../../shared/quest01";
import { freundHinzufuegen } from "./freunde";
import { skillsLesen, skillsSchreiben, xpDrops, stufenBanner } from "./skills";
import { Q2 } from "../../shared/quest02";
import { Q3 } from "../../shared/quest03";
import { QUESTS as QUESTS_B } from "../../shared/quests";
import { neuErledigt, laeuft as laeuftB, lage as lageB, gueltig as gueltigB } from "../../shared/questbau";
import { SKILL_NAME } from "../../shared/kampfwerte";
import { inventarSender, inventarVomServer } from "./inventar";
import Phaser from "phaser";
import { HELDEN, HELDENREIHE } from "../../shared/config";
import { heldenFigur, richten } from "./modulfigur";
import { aktiverHeld } from "./held";
import { Held, heldPruefen, aussehenSchluessel } from "../../shared/aussehen";
import { kontoName, kontoToken, kontoRpc } from "./konto";
import { gruppe, serverAdresse } from "./gruppe";
import { KanalWs } from "./kanal";
import { kanalFabrikSetzen } from "./netz";

export interface Fremder { i: number; n: string; h: string; /** gewähltes Aussehen (Heldeneditor) */ a?: Held; s: number; x: number; y: number; /** Weltfelder (offene Welt) – gilt vor x/y, auch über Regionsgrenzen */ wx?: number; wy?: number; b: number; l: number; lp?: number; max?: number }
export interface Ich { id: number; name: string; held: string; stufe: number; ort: string; festerHeld?: boolean; gast?: boolean; /** zuletzt gemerkte Stelle in der Welt (Weltfelder; null = Start der Region) */ pos?: { region: string; x: number | null; y: number | null } }
type Kanal = "oeffentlich" | "gruppe" | "system" | "fluestern";
export interface Hand { spieler?(l: Fremder[]): void; fort?(id: number): void; ich?(i: Ich): void; blase?(id: number, text: string): void }
/** Zonen Stufe 3: der Kampfkanal über diese Verbindung (kanal.ts) */
let kanal: KanalWs | null = null;
let ws: WebSocket | null = null, ich: Ich | null = null, hand: Hand = {}, ort = "", versuch = 0, gesendet = { x: NaN, y: NaN, t: 0, l: -1 };
const nachrichten: { kanal: Kanal; von?: string; an?: string; i?: number; text: string; zeit: number }[] = [];
let fremde: Fremder[] = [], online = 0;
/** Wer gerade am selben Ort ist (ohne mich) und wie viele insgesamt in der Welt sind */
export const weltSpieler = (): Fremder[] => fremde.slice();
export const weltOnline = (): number => online;
export const weltIch = (): Ich | null => ich;

/** Die Welt betreten (je Seite einmal). Ohne Konto oder ohne Server: nur der Chat zeigt einen Hinweis. */
export function weltBetreten(o: string, h: Hand): void { const schon = ws && ort === o, wechsel = Boolean(ws) && ort !== o; ort = o; hand = h; chatAnzeigen(); if (schon) return;
  if (wechsel) { fremde = []; bodenJetzt = []; window.dispatchEvent(new CustomEvent("ez-boden")); senden({ t: "ort", ort: o }); return; } /* andere Region bei bestehender Verbindung: dem Server melden (Boden, Mitspieler, Chat in der Nähe gelten je Region) – 25.11.2026 */
  if (!serverAdresse()) { chatSystem("Ohne Spielserver bist du allein unterwegs."); return; }
  if (!kontoName()) chatSystem("Als Gast siehst du die anderen Spieler. Zum Schreiben brauchst du ein Konto."); void verbinden(); }
let verbindet = false;
/* Ein Konto spielt nur auf einem Gerät (Server: sitz.ts): jede Seite hat eine eigene Kennung. Mit ihr darf dieselbe Seite nach einem Funkloch oder
   Neuladen jederzeit wieder hinein; jedes andere Gerät wird abgewiesen (4410), bis abgemeldet wurde oder die Frist nach dem Abbruch abgelaufen ist. */
const sitz = (k: string, v?: string | null): string | null => { try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch { /* privat */ } return null; };
const GERAET = sitz("rift_geraet") || ((): string => { const g = Math.random().toString(36).slice(2, 12) + Date.now().toString(36); sitz("rift_geraet", g); return g; })();
/* „schon verbunden“ übersteht ein Neuladen (z. B. nach dem Einfrieren): auch das ist kein frisches Anmelden */
let verbundenGewesen = sitz("rift_verbunden") === "1";
/** Für die Kampf-/Weltzonen-Verbindung: dieselbe Geräteregel */
export function geraetAngaben(): { geraet: string; wieder: boolean } { return { geraet: GERAET, wieder: verbundenGewesen }; }
/* iPhone: nach dem Zurückkommen in die App sofort neu verbinden, statt die Wartezeit abzusitzen; eine Verbindung, die iOS still geschlossen hat, schließen */
/* Wachhund (26.11.2026): iOS schließt die Verbindung im Hintergrund oft still – readyState bleibt OPEN, es kommt nur nichts mehr. Darum ein eigenes
   Lebenszeichen: bei sichtbarer Seite alle 2 s {"t":"puls"}, der Server antwortet sofort (zählt nicht als Aktivität). Kam 5 s lang gar nichts
   (auch kein Zustand der Kampfwelt), wird neu verbunden – ohne Wartezeit; die Kampfwelt folgt von selbst (kampf.ts). */
let letzteNachricht = Date.now(), verstecktSeit = 0, pulseOffen = 0;
/** Die Verbindung gilt als tot: sofort neu (der Kampfkanal hängt daran und verbindet sich danach selbst neu) */
function neuVerbinden(grund: string): void { const alt = ws; if (!alt) return; console.warn("Welt: neu verbinden –", grund); ws = null; if (kanal) kanal.weg(1006, ""); inventarSender(null);
  try { alt.close(4000, "stumm"); } catch { /* schon zu */ } versuch = 0; void verbinden(); }
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => { if (document.visibilityState !== "visible") { verstecktSeit = Date.now(); return; }
    const weg = verstecktSeit ? Date.now() - verstecktSeit : 0; verstecktSeit = 0;
    if (ws && ws.readyState > WebSocket.OPEN) { const alt = ws; ws = null; try { alt.close(); } catch { /* schon zu */ } }
    if (!ws) { versuch = 0; void verbinden(); return; }
    if (weg > 3000 && ws.readyState === WebSocket.OPEN) { /* nach dem Hintergrund: sofort fragen – kommt binnen 1,5 s nichts, neu verbinden */
      const s = ws, vor = Date.now(); letzteNachricht = Math.min(letzteNachricht, vor - 1); try { s.send('{"t":"puls"}'); } catch { /* zu */ }
      setTimeout(() => { if (ws === s && letzteNachricht < vor) neuVerbinden("keine Antwort nach dem Hintergrund"); }, 1500); } });
  /* gezählt werden Pulse ohne jede Antwort dazwischen: hängt der Browser selbst (Laden, Grafik), gehen in der Zeit auch keine Pulse hinaus – kein Fehlalarm */
  setInterval(() => { if (document.visibilityState !== "visible" || !ws || ws.readyState !== WebSocket.OPEN) return;
    if (pulseOffen >= 3 && Date.now() - letzteNachricht > 5000) { neuVerbinden("3 Pulse ohne Antwort"); return; } pulseOffen++; try { ws.send('{"t":"puls"}'); } catch { /* zu */ } }, 2000);
  /* Netz wieder da: nicht die wachsende Wartezeit absitzen */
  addEventListener("online", () => { versuch = 0; if (!ws) void verbinden(); else if (ws.readyState === WebSocket.OPEN && Date.now() - letzteNachricht > 2500) neuVerbinden("Netz wieder da"); }); }
async function verbinden() { if (verbindet || ws) return; verbindet = true; /* nie zwei Verbindungen zugleich: während auf das Token gewartet wird, gibt es noch keine – ein zweiter Aufruf öffnete sonst eine zweite (der Server wirft dann eine hinaus) */
  let token = ""; try { token = kontoName() ? await kontoToken() : ""; } finally { verbindet = false; } if (kontoName() && !token) return; if (ws) return; const g = gruppe(); /* ohne Konto: als Gast */
  const s = new WebSocket(serverAdresse() + "?welt=1&ort=" + encodeURIComponent(ort)); ws = s;
  const austragen = beimAbmelden(() => s.close(1000, "abmelden")); /* Abmelden gibt das Konto auf dem Server frei (sitz.ts) */
  { const puls = setInterval(() => { if (ws !== s || s.readyState > 1) { clearInterval(puls); return; } if (s.readyState === 1 && kuerzlichAktiv()) s.send('{"t":"da"}'); }, 60000); } /* Lebenszeichen gegen die Inaktivität (abmeldung.ts) */
  s.onopen = () => { versuch = 0; letzteNachricht = Date.now(); pulseOffen = 0; s.send(JSON.stringify({ t: "anmeldung", token, held: lokalerHeld(), aussehen: aktiverHeld() || undefined, raum: g ? g.code : "", geraet: GERAET, wieder: verbundenGewesen })); gesendet = { x: NaN, y: NaN, t: 0, l: -1 }; };
  s.onmessage = (ev) => { if (ws === s) { letzteNachricht = Date.now(); pulseOffen = 0; } const roh = String(ev.data); /* jede Nachricht zählt für den Wachhund, auch Kampfrahmen */
    if (roh.charCodeAt(0) === 75 /* K: Kampfkanal */) { if (roh.charCodeAt(1) === 33) { try { const c = JSON.parse(roh.slice(2)) as { t?: string; code?: number; grund?: string }; if (c.t === "zu" && kanal) kanal.weg(Number(c.code) || 1000, String(c.grund || "")); } catch { /* kaputt */ } } else if (kanal) kanal.rein(roh.slice(1)); return; }
    let m: { t: string; [k: string]: unknown }; try { m = JSON.parse(roh); } catch { return; }
    if (m.t === "puls") return;
    if (m.t === "ich") { window.dispatchEvent(new CustomEvent("ez-welt-verbunden")); /* die Kampfwelt verbindet sich wieder (kampf.ts) */ ich = m as unknown as Ich; heldMerken(ich.held); if (hand.ich) hand.ich(ich); verbundenGewesen = true; sitz("rift_verbunden", "1"); if (blockiert.size) senden({ t: "blockiert", namen: [...blockiert] }); /* erst nach der Anmeldung – vorher verwirft der Server jede andere Nachricht */ }
    else if (m.t === "stufe") { if (ich && typeof m.stufe === "number") ich.stufe = m.stufe; }
    else if (m.t === "spieler") { fremde = m.liste as Fremder[]; online = Number(m.online) || fremde.length + 1; if (hand.spieler) hand.spieler(fremde); window.dispatchEvent(new CustomEvent("ez-welt-spieler")); }
    else if (m.t === "inventar") { inventarSender(senden); inventarVomServer(m.inv as Parameters<typeof inventarVomServer>[0]); }
    else if (m.t === "quests") { const alt = questBekannt ? { q1: questJetzt as string, b: { ...questB } } : null; questJetzt = (typeof m.q1 === "string" ? m.q1 : "") as Stand;
      /* Stände aller Quests des Baukastens (b: id → Stand); ältere Server schicken nur q2/q3 */
      const b = (m.b && typeof m.b === "object" ? m.b : { [Q2]: m.q2, [Q3]: m.q3 }) as Record<string, unknown>; questB = {}; for (const q of QUESTS_B) questB[q.id] = gueltigB(q, b[q.id]);
      questBekannt = true; if (alt) questFortschritt(alt.q1, alt.b); window.dispatchEvent(new CustomEvent("ez-quest")); }
    else if (m.t === "teleport") { const f = teleportWarten; teleportWarten = null; if (f) f(Boolean(m.ok), Number(m.rest) || 0, Boolean(m.gast)); }
    else if (m.t === "qtext") { chatSystem(String(m.text || "")); window.dispatchEvent(new CustomEvent("ez-qtext", { detail: String(m.text || "") })); }
    else if (m.t === "dialog") { window.dispatchEvent(new CustomEvent("ez-dialog", { detail: m })); if (m.belohnung) belohnungBuchen(m.belohnung as Record<string, number>); if (m.splitter) chatSystem(`Belohnung: ${m.splitter} Splitter.`); }
    else if (m.t === "getrunken") { const G = GEGENSTAENDE[String(m.g)]; chatSystem(`Du trinkst ${G ? (/^Kleiner /.test(G.name) ? "einen " + G.name.replace(/^Kleiner/, "kleinen") : "einen " + G.name) : "einen Trank"}: +${m.n} Leben (${m.lp} / ${m.max}).`); window.dispatchEvent(new CustomEvent("ez-getrunken", { detail: m })); }
    else if (m.t === "holz") window.dispatchEvent(new CustomEvent("ez-holz", { detail: m })); /* Holzfällerei (welt3d/holz3d.ts) */
    else if (m.t === "baeume") window.dispatchEvent(new CustomEvent("ez-baeume", { detail: m.weg || [] }));
    else if (m.t === "berg") window.dispatchEvent(new CustomEvent("ez-berg", { detail: m })); /* Bergbau (welt3d/sammeln3d.ts) */
    else if (m.t === "adern") window.dispatchEvent(new CustomEvent("ez-adern", { detail: m.weg || [] }));
    else if (m.t === "pflanze") window.dispatchEvent(new CustomEvent("ez-pflanze", { detail: m })); /* Handwerk: Flachs und Hanf (welt3d/pflanzen3d.ts) */
    else if (m.t === "pflanzen") window.dispatchEvent(new CustomEvent("ez-pflanzen", { detail: m.weg || [] }));
    else if (m.t === "handwerk") window.dispatchEvent(new CustomEvent("ez-handwerk", { detail: m })); /* Handwerk an den Werkstätten (welt3d/handwerk3d.ts) */
    else if (m.t === "gekauft") { const G = GEGENSTAENDE[String(m.g)]; chatSystem(`Gekauft: ${G ? G.name : m.g} für ${m.preis} Splitter.`); window.dispatchEvent(new CustomEvent("ez-gekauft", { detail: m })); }
    else if (m.t === "freunde") window.dispatchEvent(new CustomEvent("ez-freunde", { detail: Array.isArray(m.liste) ? m.liste : [] }));
    else if (m.t === "zufreund") { if (m.ok && typeof m.x === "number" && typeof m.y === "number") window.dispatchEvent(new CustomEvent("ez-zufreund", { detail: m })); else chatSystem(String(m.text || "Teleport nicht möglich.")); }
    else if (m.t === "freundanfrage") { chatSystem(m.angenommen ? `${m.von} hat deine Freundschaftsanfrage angenommen.` : `${m.von} möchte dein Freund sein – sieh unter Freunde nach.`); window.dispatchEvent(new CustomEvent("ez-freundanfrage", { detail: m })); }
    else if (m.t === "zurueck") { window.dispatchEvent(new CustomEvent("ez-zurueck", { detail: m })); if (m.text) chatSystem(String(m.text)); }
    else if (m.t === "boden") { bodenJetzt = (m.liste as BodenDing[]) || []; window.dispatchEvent(new CustomEvent("ez-boden")); }
    else if (m.t === "fort") { fremde = fremde.filter((f) => f.i !== Number(m.id)); if (hand.fort) hand.fort(Number(m.id)); }
    else if (m.t === "chat") { const n = { kanal: (m.kanal as Kanal) || "oeffentlich", von: m.von as string | undefined, an: m.an as string | undefined, i: typeof m.i === "number" ? m.i : undefined, text: String(m.text || ""), zeit: Number(m.zeit) || Date.now() };
      if (n.von && n.kanal !== "system" && blockiert.has(n.von) && !(ich && n.von === ich.name)) return; /* blockiert: weder Chat noch Sprechblase */
      chatDazu(n); if (n.kanal === "oeffentlich" && n.i !== undefined && hand.blase) hand.blase(n.i, n.text); } };
  s.onclose = (ev) => { austragen(); if (kanal && ws === s) kanal.weg(1006, ""); /* der Kampfkanal hängt an dieser Verbindung */ if (ws !== s) return; ws = null; inventarSender(null); /* getrennt: das Inventar zeigt den letzten Stand, ändern geht erst wieder verbunden */ if (ev.code === 4410) { chatSystem("Es ist aktuell schon ein Gerät in Riftmere."); abmelden("bereits", restAus(ev.reason)); return; } if (ev.code === 4409) { verbundenGewesen = false; sitz("rift_verbunden", null); /* über Willkommen → Spielen meldet man sich wieder frisch an */ chatSystem("Du bist an einem anderen Gerät unterwegs."); abmelden("anderes"); return; } if (ev.code === 1000 && ev.reason === "ruhe") { abmelden("ruhe"); return; } /* abmeldung.ts */ if (ev.code === 4401 && ev.reason === "keine anmeldung") { /* die Seite war zu beschäftigt (Laden der 3D-Welt) und hat sich nicht rechtzeitig angemeldet: gleich neu */ setTimeout(() => { if (!ws) void verbinden(); }, 1500); return; } if (ev.code === 4401 || ev.code === 4400) return;   /* 4400: diesen Ort kennt der Server (noch) nicht – nicht endlos neu verbinden */
    const warte = Math.min(30000, 2000 * 2 ** versuch++); setTimeout(() => { if (!ws) void verbinden(); }, warte); };
}
const senden = (m: object) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(m)); };
/* Zonen Stufe 3: Kampfverbindungen zum selben Server laufen als Kanal über diese Verbindung – ein Gerät, eine Verbindung */
kanalFabrikSetzen((url) => { const basis = serverAdresse(), s = ws; if (!s || s.readyState !== 1 || kanal || !basis || !url.startsWith(basis + "?")) return null;
  const k = new KanalWs((t) => { if (s.readyState === 1) s.send(t); }, (x) => { if (kanal === x) kanal = null; }, url.slice(basis.length + 1)); kanal = k; return k as unknown as WebSocket; });
/** Auf die offene Welt-Verbindung warten (höchstens ms) – damit der Kampf als Kanal darüber läuft statt über eine zweite Verbindung */
export function aufWeltWarten(ms: number): Promise<void> { return new Promise((fertig) => { const bis = Date.now() + ms; const pruefe = () => { if ((ws && ws.readyState === 1) || Date.now() > bis || (!ws && !verbindet)) { fertig(); return; } setTimeout(pruefe, 100); }; pruefe(); }); }
/* Freunde (Server: welt.ts „freunde“, „zufreund“, „freundanfrage“) */
export const freundeAbfragen = (): void => senden({ t: "freunde" });
export const zuFreund = (n: string): void => senden({ t: "zufreund", n });
export const freundMelden = (n: string, angenommen = false): void => senden({ t: "freundanfrage", n, angenommen });
export const ichName = (): string => (ich && !ich.gast ? ich.name : "");
/** Angemeldet mit Konto? null = der Server hat sich noch nicht gemeldet */
export const mitKonto = (): boolean | null => (ich ? !ich.gast : null);
/* ---------- Quests (der Server führt den Stand; Dialoge bekommt nur, wer spricht) ---------- */
let questJetzt: Stand = "", questB: Record<string, string> = {}, questBekannt = false;
/** Stand von Quest 01; bekannt: der Server hat ihn geschickt (mit Konto) */
export const questStand = (): Stand => questJetzt;
export const questGeladen = (): boolean => questBekannt;
/** Stand von Quest 02 „Der stille Rain“ (shared/quest02.ts) */
/** Stand einer Quest des Baukastens (shared/quests.ts) */
export const questStandB = (id: string): string => questB[id] || "";
export const questStand2 = (): string => questStandB(Q2);
export const questStand3 = (): string => questStandB(Q3);
/** Fortschritt melden: erledigte Schritte (Quest 03) im Chat, Abschluss jeder Quest als Banner oben */
function questFortschritt(alt1: string, alt: Record<string, string>): void {
  if (questJetzt === "fertig" && alt1 !== "fertig") stufenBanner("Quest abgeschlossen: Die gesperrte Straße", "📜");
  /* Quests des Baukastens: erledigte Schritte und neue Quest im Chat (Questobjekte melden sich selbst mit ihrem Text) */
  for (const q of QUESTS_B) { const a = alt[q.id] || "", n = questStandB(q.id);
    for (const x of neuErledigt(q, a, n)) if (x.ereignis.art !== "objekt") chatSystem(`Quest „${q.titel}“: ${x.text} – erledigt.`);
    if (laeuftB(q, n) && lageB(q, a).phase === "neu") chatSystem(`Neue Quest: „${q.titel}“ (Quest-Tab).`);
    if (n === "fertig" && a !== "fertig") stufenBanner(`Quest abgeschlossen: ${q.titel}`, "📜"); } }
/** Quest verfolgen (im Quest-Tab abgehakt): Pfeil am Helden zum nächsten Ziel */
/* Immer nur eine Quest wird verfolgt (ez_quest_verfolgt = ihre Id); früher: ez_q1_verfolgen = "1" für Quest 01 */
export function verfolgteQuest(): string { try { const v = localStorage.getItem("ez_quest_verfolgt"); if (v !== null) return v; return localStorage.getItem("ez_q1_verfolgen") === "1" ? Q1 : ""; } catch { return ""; } }
export function questVerfolgt(id: string = Q1): boolean { return verfolgteQuest() === id; }
export function questVerfolgen(an: boolean, id: string = Q1): void { try { localStorage.setItem("ez_quest_verfolgt", an ? id : verfolgteQuest() === id ? "" : verfolgteQuest()); } catch { /* privat */ } window.dispatchEvent(new CustomEvent("ez-quest")); }
/** Quest 02: Bruchstelle oder Rutenbündel benutzen (der Server prüft Stand und Abstand); Mooshocker untersucht */
/** Holzfällerei: fällen („start“ mit Baum-id), Kernschlag („kern“), aufhören („stop“) – der Server prüft alles */
/** Heim-Teleport beim Server anfragen: antwort(ok, Restzeit in ms, gast). Ohne Verbindung (oder ohne Antwort nach 3 s): null */
let teleportWarten: ((ok: boolean, rest: number, gast: boolean) => void) | null = null;
export function teleportFragen(antwort: (ok: boolean, rest: number, gast: boolean) => void, ohne: () => void): void {
  if (!ws || ws.readyState !== 1) { ohne(); return; } teleportWarten = antwort; senden({ t: "teleport" });
  setTimeout(() => { if (teleportWarten === antwort) { teleportWarten = null; ohne(); } }, 3000); }
export function holzBitten(tat: "start" | "kern" | "stop", id?: string): void { if (tat === "start") stelleMelden(); senden({ t: "holz", tat, ...(id ? { id } : {}) }); }
export function bergBitten(tat: "start" | "riss" | "stop", id?: string): void { if (tat === "start") stelleMelden(); senden({ t: "berg", tat, ...(id ? { id } : {}) }); }
export function pflanzeBitten(tat: "start" | "stop", id?: string): void { if (tat === "start") stelleMelden(); senden({ t: "pflanze", tat, ...(id ? { id } : {}) }); }
export function handwerkBitten(tat: "start" | "glut" | "stop", rezept?: string, menge?: number): void { if (tat === "start") stelleMelden(); senden({ t: "handwerk", tat, ...(rezept ? { rezept } : {}), ...(menge ? { menge } : {}) }); }
export function questDing(id: string, wo?: { x: number; y: number }): void { stelleMelden(); senden({ t: "qding", id, ...(wo ? { x: wo.x, y: wo.y } : {}) }); }
export function untersuchtMelden(typ: string, wo?: { x: number; y: number }): void { stelleMelden(); senden({ t: "untersucht", typ, ...(wo ? { x: wo.x, y: wo.y } : {}) }); }
/** Gespräch beginnen – vorher die genaue Stelle melden (sonst kennt der Server nach schnellem Hinlaufen nur eine ältere und sagt „Geh näher heran“) */
export function rede(npc: string): void { stelleMelden(); senden({ t: "rede", npc }); }
/** Die genaue eigene Stelle sofort melden – vor allem, wobei der Server den Abstand prüft (Reden, Fällen, Abbauen, Werken, Questdinge) */
function stelleMelden(): void { if (posZuletzt) { senden(posZuletzt); gesendet = { ...gesendet, t: performance.now() }; } }
export function antworte(npc: string, a: string): void { senden({ t: "antwort", npc, a }); }
export function dialogZu(): void { senden({ t: "dialogzu" }); }
/** Questbelohnung: die Skill-XP auf dem Gerät nachtragen (der Server hat sie schon gutgeschrieben) und als Drops zeigen */
function belohnungBuchen(b: Record<string, number>) { const x = skillsLesen(); for (const k of Object.keys(x) as (keyof typeof x)[]) x[k] += Math.max(0, Number(b[k]) || 0);
  xpDrops(skillsLesen()); skillsSchreiben(x); xpDrops(x); window.dispatchEvent(new CustomEvent("ez-skills"));
  chatSystem(`Belohnung: ${Object.entries(b).filter(([, n]) => n > 0).map(([k, n]) => `+${n} ${SKILL_NAME[k as keyof typeof SKILL_NAME] || k}`).join(", ")}.`); }
/* ---------- Gegenstände am Boden (der Server schickt, was man sieht) ---------- */
export interface BodenDing { i: number; g: string; n: number; x: number; y: number }
let bodenJetzt: BodenDing[] = [];
/** Was man in dieser Region am Boden sieht (Weltfelder) */
export const bodenListe = (): BodenDing[] => bodenJetzt;
/** Aufheben bitten (der Server prüft Sichtbarkeit, Abstand und Platz im Rucksack) */
export function aufheben(id: number | number[], wo?: { x: number; y: number }): void { senden({ ...(Array.isArray(id) ? { t: "aufheben", ids: id } : { t: "aufheben", id }), ...(wo ? { x: wo.x, y: wo.y } : {}) }); }
/** Eigene Position melden (gedrosselt: bei Bewegung höchstens 6-mal je Sekunde, sonst alle 2 Sekunden) */
let posZuletzt: Record<string, unknown> | null = null; /* die jüngste Stelle, auch wenn sie (gedrosselt) noch nicht gesendet wurde */
export function weltPos(x: number, y: number, blick: number, laeuft: boolean, wx?: number, wy?: number): void { const j = performance.now(), g = gesendet, l = laeuft ? 1 : 0; /* wx, wy: Weltfelder – der Server merkt sich die Stelle fürs nächste Anmelden */
  posZuletzt = { t: "pos", x, y, b: blick, l, ...(wx !== undefined && wy !== undefined ? { wx: Math.round(wx * 100) / 100, wy: Math.round(wy * 100) / 100 } : {}) };
  if ((Math.hypot(x - g.x, y - g.y) > 2 || l !== g.l) && j - g.t > 160 || j - g.t > 2000) { gesendet = { x, y, t: j, l }; senden({ t: "pos", x, y, b: blick, l, ...(wx !== undefined && wy !== undefined ? { wx: Math.round(wx * 100) / 100, wy: Math.round(wy * 100) / 100 } : {}) }); } }
export function weltLeben(lp: number, max: number): void { senden({ t: "leben", lp, max }); }
/** Helden wechseln – nur in der Waldmark (der Server prüft das) */
export function weltHeld(held: string): void { heldMerken(held); senden({ t: "held", held }); }

/* ---------- Der aktive Held: einer je Spieler, auch ohne Konto lokal gemerkt ---------- */
export function lokalerHeld(): string { try { const h = localStorage.getItem("ez_held") || ""; if (HELDEN[h]) return h; const t = JSON.parse(localStorage.getItem("ez_team") || "null"); if (t && HELDEN[t.held]) return t.held; } catch { /* privat */ } return HELDENREIHE[0]; }
function heldMerken(h: string) { if (!HELDEN[h]) return; try { localStorage.setItem("ez_held", h); localStorage.setItem("ez_team", JSON.stringify({ held: h, mit: [] })); } catch { /* privat */ } }

/* ---------- Chat ---------- */
const NAMEN: Record<string, string> = { alle: "Alle", oeffentlich: "Öffentlich", gruppe: "Gruppe", system: "System" };
let reiter = "alle";
export function chatSystem(text: string): void { chatDazu({ kanal: "system", text, zeit: Date.now() }); }
function chatDazu(m: (typeof nachrichten)[number]) { nachrichten.push(m); if (nachrichten.length > 120) nachrichten.shift(); zeichnen(); }
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
function zeichnen() { const liste = document.querySelector("#ez-chat .liste"); if (!liste) return;
  const zeige = nachrichten.filter((m) => reiter === "alle" || m.kanal === reiter);
  liste.innerHTML = zeige.slice(-60).map((m) => { const d = new Date(m.zeit), z = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    return `<p class="k-${m.kanal}"><time>[${z}]</time> ${m.kanal === "fluestern" ? `<b><a class="cn" data-cn="${esc(m.von || "")}">${esc(m.von || "")}</a> → <a class="cn" data-cn="${esc(m.an || "")}">${esc(m.an || "")}</a>:</b> ` : m.von ? `<b><a class="cn" data-cn="${esc(m.von)}" data-ci="${m.i ?? ""}">${esc(m.von)}</a>:</b> ` : ""}${esc(m.text)}</p>`; }).join("") || `<p class="leer">Noch keine Nachrichten.</p>`;
  liste.scrollTop = liste.scrollHeight; }
/** Das Chatfenster (unten in der Mitte); auf dem Handy einklappbar */
export function chatAnzeigen(): void {
  if (document.getElementById("ez-chat")) return; const c = document.createElement("div"); c.id = "ez-chat"; c.className = "ez-chat";
  c.innerHTML = `<div class="reiter">${Object.entries(NAMEN).map(([k, v]) => `<button type="button" data-k="${k}" class="${k === reiter ? "an" : ""}">${v}</button>`).join("")}<button type="button" class="klapp" aria-label="Chat ein- oder ausklappen">▾</button></div>
    <div class="liste" aria-live="polite"></div><form class="eingabe"><select aria-label="Kanal"><option value="oeffentlich">Öffentlich</option><option value="gruppe">Gruppe</option></select><input type="text" maxlength="160" placeholder="Nachricht eingeben …" autocomplete="off"><button type="submit" aria-label="Senden">➤</button></form>`;
  document.body.appendChild(c); for (const ev of ["keydown", "keyup", "pointerdown"]) c.addEventListener(ev, (e) => e.stopPropagation()); /* Tippen steuert nicht den Helden */
  (c.querySelector(".liste") as HTMLElement).addEventListener("click", (e) => { const a = (e.target as HTMLElement).closest<HTMLElement>("a.cn"); if (!a) return; const n = a.dataset.cn || ""; if (!n || (ich && n === ich.name)) return;
    const d = fremde.find((x) => (a.dataset.ci ? x.i === Number(a.dataset.ci) : false) || x.n === n); if (d) spielerKarte(d, () => {}); else namenKarte(n); }); /* Namen im Chat antippen: Spielerkarte (Flüstern, Freund hinzufügen) */
  c.querySelectorAll<HTMLButtonElement>(".reiter button[data-k]").forEach((b) => b.onclick = () => { reiter = b.dataset.k as string; c.querySelectorAll(".reiter button").forEach((x) => x.classList.toggle("an", x === b)); zeichnen(); });
  (c.querySelector(".klapp") as HTMLElement).onclick = () => c.classList.toggle("zu");
  if (window.matchMedia("(max-width: 700px), (max-height: 500px)").matches) c.classList.add("zu");
  const f = c.querySelector("form") as HTMLFormElement, inp = c.querySelector("input") as HTMLInputElement, sel = c.querySelector("select") as HTMLSelectElement;
  f.onsubmit = (e) => { e.preventDefault(); const t = inp.value.trim(); if (!t) return; if (!ws || ws.readyState !== 1) { chatSystem("Nicht verbunden – Nachricht nicht gesendet."); return; } if (ich && ich.gast) { chatSystem("Zum Schreiben brauchst du ein Konto (Menü → Anmelden)."); return; }
    if (sel.value === "fluestern" && fluesterZiel) senden(fluesterZiel.id > 0 ? { t: "chat", kanal: "fluestern", an: fluesterZiel.id, text: t } : { t: "chat", kanal: "fluestern", anName: fluesterZiel.name, text: t }); /* Freunde: per Name, überall in der Welt */ else senden({ t: "chat", kanal: sel.value === "gruppe" ? "gruppe" : "oeffentlich", text: t }); inp.value = ""; };
  window.addEventListener("keydown", (e) => { if (e.key === "Enter" && document.activeElement !== inp && !(e.target instanceof HTMLInputElement)) { c.classList.remove("zu"); inp.focus(); } });
  zeichnen(); }

/** Flüstern: die nächste Nachricht geht nur an diesen Spieler (Auswahl im Chat bleibt, bis man sie umstellt); id 0 = Freund per Name */
let fluesterZiel: { id: number; name: string } | null = null;
export function fluestern(id: number, name: string): void { chatAnzeigen(); fluesterZiel = { id, name }; const c = document.getElementById("ez-chat"); if (!c) return; c.classList.remove("zu");
  const sel = c.querySelector("select") as HTMLSelectElement; let o = sel.querySelector('option[value="fluestern"]') as HTMLOptionElement | null; if (!o) { o = document.createElement("option"); o.value = "fluestern"; sel.appendChild(o); }
  o.textContent = "→ " + name; sel.value = "fluestern"; (c.querySelector("input") as HTMLInputElement).focus(); }

/* ---------- Spielerkarte und Spielerliste ---------- */
const $t = (s: string) => document.querySelector(s) as HTMLElement;
export function tafelZeigen(klasse: string, html: string, zu: () => void): HTMLElement { const f = $t("#ez-konto"); f.hidden = false;
  const schliessen = () => { removeEventListener("keydown", esc2, true); f.hidden = true; f.innerHTML = ""; f.onclick = null; zu(); };
  const esc2 = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); schliessen(); } }; addEventListener("keydown", esc2, true);
  f.innerHTML = `<div class="tafel ${klasse}"><i class="ecke a"></i><i class="ecke b"></i><i class="ecke c"></i><i class="ecke d"></i><button type="button" class="schliessen" data-t="zu" aria-label="Schließen">✕</button>${html}</div>`;
  f.onpointerdown = (e) => e.stopPropagation(); f.onkeydown = (e) => e.stopPropagation(); f.onkeyup = (e) => e.stopPropagation();
  f.onclick = (e) => { const t = (e.target as HTMLElement).closest("[data-t]") as HTMLElement | null; if (e.target === f || (t && t.dataset.t === "zu")) { schliessen(); return; } if (t && t.dataset.t === "fl") { const id = Number(t.dataset.id), n = t.dataset.n || ""; schliessen(); fluestern(id, n); } if (t && t.dataset.t === "freund") { const n = t.dataset.n || ""; schliessen(); void freundHinzufuegen(n).then((x) => { if (x) chatSystem(x); }); return; } if (t && t.dataset.t === "block") { const n = t.dataset.n || ""; schliessen(); blockieren(n, !blockiert.has(n)); return; }
    if (t && t.dataset.t === "melden") { const n = t.dataset.n || ""; schliessen(); meldenFenster(n); return; }
    if (t && t.dataset.t === "karte") { schliessen(); const d = fremde.find((x) => x.i === Number(t.dataset.id)); if (d) spielerKarte(d, zu); } };
  return f; }
/* ---------- Schutz im Chat: blockieren und melden ---------- */
/** Blockierte Spieler (Namen): liegen auf dem Gerät; der Server bekommt die Liste und stellt deren Nachrichten nicht mehr zu */
const BLOCK_SCHLUESSEL = "rift_blockiert";
const blockiert = new Set<string>(((): string[] => { try { const a = JSON.parse(localStorage.getItem(BLOCK_SCHLUESSEL) || "[]"); return Array.isArray(a) ? a.map(String).slice(0, 300) : []; } catch { return []; } })());
export function istBlockiert(n: string): boolean { return blockiert.has(n); }
export function blockierteNamen(): string[] { return [...blockiert].sort((a, b) => a.localeCompare(b)); }
export function blockieren(n: string, an: boolean): void { if (!n) return; if (an) blockiert.add(n); else blockiert.delete(n);
  try { localStorage.setItem(BLOCK_SCHLUESSEL, JSON.stringify([...blockiert])); } catch { /* privat */ }
  senden({ t: "blockiert", namen: [...blockiert] });
  if (an) { for (let k = nachrichten.length - 1; k >= 0; k--) if (nachrichten[k].von === n && nachrichten[k].kanal !== "system") nachrichten.splice(k, 1); }
  chatSystem(an ? `${n} ist blockiert – du siehst keine Nachrichten mehr von ${n}. Aufheben: Einstellungen → Blockierte Spieler.` : `${n} ist nicht mehr blockiert.`); }
/** Die zwei Knöpfe unter jeder Spielerkarte */
function schutzKnoepfe(n: string): string { if (!ich || ich.gast || n === ich.name) return "";
  return `<div class="reihe schutz"><button type="button" class="leise" data-t="block" data-n="${esc(n)}">${blockiert.has(n) ? "Nicht mehr blockieren" : "Blockieren"}</button><button type="button" class="leise warn" data-t="melden" data-n="${esc(n)}">Melden</button></div>`; }
const GRUENDE = ["Beleidigung oder Belästigung", "Hassrede oder Drohung", "Anstößige Inhalte", "Spam oder Werbung", "Betrug", "Anstößiger Name", "Sonstiges"];
/** Einen Spieler melden: Grund, eigene Worte, seine letzten Chatzeilen gehen mit; die Meldung landet im Admin-Bereich (Nachrichten) */
function meldenFenster(n: string): void {
  const f = tafelZeigen("melden", `<h2>${esc(n)} melden</h2><div class="zier"></div><p class="klein">Wir prüfen jede Meldung. Seine letzten Chat-Nachrichten werden mitgeschickt.</p>
    <form class="meldung"><label>Grund<select name="grund">${GRUENDE.map((g) => `<option>${g}</option>`).join("")}</select></label>
    <label>Was ist passiert? (freiwillig)<textarea name="text" maxlength="500" rows="3" placeholder="Kurz beschreiben …"></textarea></label>
    <label class="haken"><input type="checkbox" name="block" checked> ${esc(n)} auch blockieren</label>
    <div class="reihe"><button type="submit" class="haupt">Meldung senden</button><button type="button" data-t="zu">Abbrechen</button></div><p class="klein status" aria-live="polite"></p></form>`, () => {});
  const form = f.querySelector("form.meldung") as HTMLFormElement, st = f.querySelector(".status") as HTMLElement;
  form.onsubmit = (e) => { e.preventDefault(); e.stopPropagation(); const fd = new FormData(form), grund = String(fd.get("grund") || ""), eigen = String(fd.get("text") || "").trim().slice(0, 500), auch = fd.get("block") === "on";
    const zeilen = nachrichten.filter((m) => m.von === n && m.kanal !== "system").slice(-20).map((m) => ({ zeit: new Date(m.zeit).toISOString(), kanal: m.kanal, text: m.text }));
    const knopf = form.querySelector('button[type="submit"]') as HTMLButtonElement; knopf.disabled = true; st.textContent = "Wird gesendet …";
    kontoRpc("rpg_feedback_send", { p_art: "feedback", p_text: `Spielermeldung: ${n} – ${grund}${eigen ? ": " + eigen : ""}`, p_kontext: { meldung: true, gemeldet: n, grund, ort: ich ? ich.ort : "", chat: zeilen } })
      .then(() => { if (auch && !blockiert.has(n)) blockieren(n, true); chatSystem(`Danke – deine Meldung über ${n} ist eingegangen.`); (f.querySelector('[data-t="zu"]') as HTMLElement).click(); })
      .catch((x: Error) => { knopf.disabled = false; st.textContent = (x && x.message) || "Senden hat nicht geklappt. Versuch es gleich noch einmal."; }); }; }
/** Ein Name aus dem Chat, dessen Spieler nicht hier ist: Flüstern und Freund hinzufügen */
function namenKarte(n: string): void { const darf = Boolean(ich && !ich.gast);
  tafelZeigen("spieler", `<div class="skopf"><div><h2>${esc(n)}</h2><small>nicht hier in der Nähe</small></div></div><div class="zier"></div>
    <div class="reihe">${darf ? `<button type="button" class="haupt" data-t="fl" data-id="0" data-n="${esc(n)}">Flüstern</button><button type="button" data-t="freund" data-n="${esc(n)}">Freund hinzufügen</button>` : `<p class="klein">Dafür brauchst du ein Konto.</p>`}</div>${schutzKnoepfe(n)}`, () => {}); }
/** Ein anderer Spieler angeklickt: Name, Held, Stufe – Flüstern und Freund hinzufügen */
export function spielerKarte(d: Fremder, zu: () => void): void { const D = HELDEN[d.h] || HELDEN.schildwaechter, gast = !d.s, darf = !gast && Boolean(ich && !ich.gast);
  tafelZeigen("spieler", `<div class="skopf"><img src="../${D.bild}" alt=""><div><h2>${esc(d.n)}</h2><small>${gast ? "Gast" : `Stufe ${d.s}`} · ${D.name}, ${D.klasse}</small></div></div><div class="zier"></div>
    ${d.max ? `<p class="klein">Leben ${d.lp} / ${d.max}</p>` : ""}<div class="reihe">${darf ? `<button type="button" class="haupt" data-t="fl" data-id="${d.i}" data-n="${esc(d.n)}">Flüstern</button><button type="button" data-t="freund" data-n="${esc(d.n)}">Freund hinzufügen</button>` : `<p class="klein">${gast ? "Gäste können keine Nachrichten empfangen." : "Zum Flüstern brauchst du ein Konto."}</p>`}</div>${gast ? "" : schutzKnoepfe(d.n)}`, zu); }
/** Wer ist hier? Alle Spieler am Ort, mit Held und Stufe */
export function spielerListe(zu: () => void): void {
  const ichZeile = ich ? `<li class="ich"><img src="../${(HELDEN[ich.held] || HELDEN.schildwaechter).bild}" alt=""><b>${esc(ich.name)}</b><small>${ich.gast ? "Gast" : "Lv " + ich.stufe} · ${(HELDEN[ich.held] || HELDEN.schildwaechter).name} (du)</small></li>` : "";
  const zeilen = fremde.map((d) => `<li><button type="button" data-t="karte" data-id="${d.i}"><img src="../${(HELDEN[d.h] || HELDEN.schildwaechter).bild}" alt=""><b>${esc(d.n)}</b><small>${d.s ? "St. " + d.s : "Gast"} · ${(HELDEN[d.h] || HELDEN.schildwaechter).name}</small></button></li>`).join("");
  tafelZeigen("spielerliste", `<h2>Spieler hier</h2><div class="zier"></div><p class="klein">${ws ? `${fremde.length + (ich ? 1 : 0)} hier · ${Math.max(online, fremde.length + 1)} in den Splitterlanden unterwegs` : "Nicht mit dem Spielserver verbunden."}</p><ul class="sliste">${ichZeile}${zeilen || (ws ? `<li class="leer">Gerade niemand außer dir.</li>` : "")}</ul>`, zu); }

/* ---------- Sprechblasen über den Köpfen ---------- */
/** Eine Sprechblase, die einem Punkt folgt (wo: Bildschirmkoordinaten der Szene, jeden Frame neu) und nach einigen Sekunden verschwindet */
export function sprechblase(scene: Phaser.Scene, wo: () => { x: number; y: number } | null, text: string): void {
  const t = text.length > 60 ? text.slice(0, 58) + "…" : text, b = scene.add.text(0, 0, t, { fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#2a2014", backgroundColor: "#f3e6c4", padding: { x: 8, y: 5 }, wordWrap: { width: 190 }, align: "center" }).setOrigin(0.5, 1).setResolution(2).setDepth(99990);
  const alt = (scene as unknown as { __blasen?: Phaser.GameObjects.Text[] }).__blasen || []; (scene as unknown as { __blasen: Phaser.GameObjects.Text[] }).__blasen = alt;
  const folge = () => { const p = wo(); if (!p) { weg(); return; } b.setPosition(p.x, p.y); }; const weg = () => { scene.events.off("update", folge); b.destroy(); const i = alt.indexOf(b); if (i >= 0) alt.splice(i, 1); };
  folge(); scene.events.on("update", folge); alt.push(b); scene.time.delayedCall(Math.min(9000, 3500 + t.length * 60), weg); }

/* ---------- Andere Spieler in einer Szene ---------- */
/** Alle Heldenbilder laden (für Mitspieler) – im preload einer Szene aufrufen */
export function heldenLaden(scene: Phaser.Scene): void { for (const k of HELDENREIHE) { const D = HELDEN[k]; if (D.figur && !scene.textures.exists("figur-" + k)) scene.load.image("figur-" + k, "../" + D.figur); if (D.lauf && !scene.textures.exists("lauf-" + k)) scene.load.spritesheet("lauf-" + k, "../" + D.lauf, { frameWidth: 176, frameHeight: 176 }); } }
interface Figur { sp: Phaser.GameObjects.Sprite; nm: Phaser.GameObjects.Text; lb: Phaser.GameObjects.Graphics; d: Fremder; x: number; y: number; laeuft: boolean; held: string; a: string }
/** Mitspieler darstellen: f = Bildmaßstab der Szenenkoordinaten, gross = Körperhöhe am Bildschirm, tiefe = Zeichentiefe zu einer y-Koordinate */
export class Mitspieler {
  figuren = new Map<number, Figur>();
  constructor(private scene: Phaser.Scene, private o: { f: number; gross: number; tiefe: (y: number) => number; auslassen?: (name: string) => boolean; karte?: { breit: number; hoch: number }; /** Verschiebung in Bildpunkten (offene Welt: Ursprung der Region) */ versatz?: { x: number; y: number } }) {}
  /** Welcher Mitspieler liegt unter dem Zeiger? (Liste der getroffenen Objekte, z. B. aus input.hitTestPointer) */
  unter(treffer: Phaser.GameObjects.GameObject[]): Fremder | null { for (const f of this.figuren.values()) if (treffer.includes(f.sp)) return f.d; return null; }
  /** Sprechblase über einem Mitspieler */
  blase(id: number, text: string): void { const f = this.figuren.get(id); if (!f) return; sprechblase(this.scene, () => (this.figuren.get(id) === f ? { x: f.sp.x, y: f.sp.y - this.o.gross - 30 } : null), text); }
  liste(l: Fremder[]): void { const da = new Set<number>();
    for (const d of l) { if (this.o.auslassen && this.o.auslassen(d.n)) continue; da.add(d.i); let f = this.figuren.get(d.i);
      if (!f || f.held !== d.h || f.a !== (d.a ? aussehenSchluessel(d.a) : "")) { if (f) this.weg(d.i); f = this.neu(d); } f.d = d; }
    for (const id of [...this.figuren.keys()]) if (!da.has(id)) this.weg(id); }
  weg(id: number): void { const f = this.figuren.get(id); if (!f) return; f.sp.destroy(); f.nm.destroy(); f.lb.destroy(); this.figuren.delete(id); const u = document.querySelector(`#ez-karte u[data-sp="${id}"]`); if (u) u.remove(); }
  private neu(d: Fremder): Figur { const D = HELDEN[d.h] || HELDEN.schildwaechter, fu = D.fuss || [0.5, 0.94], s = this.scene;
    const v = this.o.versatz || { x: 0, y: 0 }, eigen = d.a ? heldPruefen(d.a) : null, sp = heldenFigur(s, d.x * this.o.f + v.x, d.y * this.o.f + v.y, d.h, this.o.gross, undefined, eigen).setOrigin(fu[0], fu[1]); sp.setScale(this.o.gross * (D.gross || 1) / sp.height); sp.setInteractive({ useHandCursor: true });
    const nm = s.add.text(0, 0, "", { fontFamily: "Cinzel, Georgia, serif", fontSize: "14px", color: "#f3e3b5", stroke: "#000", strokeThickness: 4 }).setOrigin(0.5, 1).setResolution(2).setDepth(99980);
    if (D.lauf && !s.anims.exists("lauf-" + d.h)) s.anims.create({ key: "lauf-" + d.h, frames: s.anims.generateFrameNumbers("lauf-" + d.h, {}), frameRate: 11, repeat: -1 });
    const f: Figur = { sp, nm, lb: s.add.graphics().setDepth(99979), d, x: d.x, y: d.y, laeuft: false, held: d.h, a: eigen ? aussehenSchluessel(eigen) : "" }; this.figuren.set(d.i, f); return f; }
  /** Jeden Frame: weich zur gemeldeten Stelle, Namensschild mit Stufe, Lebensbalken wenn verletzt oder im Kampf */
  schritt(dt: number): void { for (const f of this.figuren.values()) { const d = f.d, D = HELDEN[f.held] || HELDEN.schildwaechter, k = Math.min(1, dt * 10);
    f.x += (d.x - f.x) * k; f.y += (d.y - f.y) * k; const v = this.o.versatz || { x: 0, y: 0 }, x = f.x * this.o.f + v.x, y = f.y * this.o.f + v.y, g = this.o.gross;
    f.sp.setPosition(x, y + 3).setDepth(this.o.tiefe(f.y)); richten(f.sp, Math.cos(d.b), Math.sin(d.b)); if (Math.abs(Math.cos(d.b)) > 0.25) f.sp.setFlipX(Math.cos(d.b) < 0);
    const l = Boolean(d.l); if (l !== f.laeuft && D.lauf) { f.laeuft = l; if (l) { const L = D.laufMass || [0.5, 0.946, 0.91]; f.sp.play("lauf-" + f.held); f.sp.setOrigin(L[0], L[1]).setScale(g / (L[2] * 176)); } else { const fu = D.fuss || [0.5, 0.94]; f.sp.stop(); f.sp.setTexture("figur-" + f.held); f.sp.setOrigin(fu[0], fu[1]).setScale(g * (D.gross || 1) / f.sp.height); } }
    const text = d.s ? `${d.n} · Lv ${d.s}` : d.n; if (f.nm.text !== text) f.nm.setText(text); f.nm.setPosition(x, y - g - 12);
    if (this.o.karte) { let u = document.querySelector(`#ez-karte u[data-sp="${d.i}"]`) as HTMLElement | null; const k = document.getElementById("ez-karte"); if (!u && k) { u = document.createElement("u"); u.className = "freund"; u.dataset.sp = String(d.i); k.appendChild(u); }
      if (u) { u.title = d.n; u.style.left = (100 * f.x / this.o.karte.breit) + "%"; u.style.top = (100 * f.y / this.o.karte.hoch) + "%"; } }
    f.lb.clear(); if (d.max && d.lp !== undefined) { const w = 54, a = Math.max(0, Math.min(1, d.lp / d.max)); f.lb.fillStyle(0x000000, 0.7).fillRect(x - w / 2 - 1, y - g - 10, w + 2, 7).fillStyle(a > 0.5 ? 0x5fc35a : a > 0.25 ? 0xe0b040 : 0xd04a3a, 1).fillRect(x - w / 2, y - g - 9, w * a, 5); } } }
}
/* Für Prüfungen im Browser */
(window as unknown as Record<string, unknown>).EZW = { ich: () => ich, chat: () => nachrichten.slice(), held: weltHeld, spieler: weltSpieler };
