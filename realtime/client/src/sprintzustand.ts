/*
 * Mythara – die Ausdauer des eigenen Helden (Sprint, shared/sprint.ts) als ein gemeinsamer Stand im Browser:
 * in der offenen Welt rechnet die 3D-Welt sie selbst; im Kampfgebiet bewegt der Server den Helden und schickt die Ausdauer mit (welt/kampf.ts).
 * „ez-sprint“: der Spieler hat umgeschaltet (der Kampf meldet es dem Server).
 */
import { Ausdauer, SPRINT_TICK, erholungJeTick } from "../../shared/sprint";
export const AUSDAUER = new Ausdauer();
/* Über ein Neuladen (Teleport, Abmelden, Neustart) hinweg: der letzte Stand mit Zeitstempel; beim Laden kommt nur die Erholung seither dazu (wie Stehen, mit Geschick 1 gerechnet).
   Mit Konto setzt der Server im Kampfgebiet ohnehin seinen eigenen Stand. */
const MERK = "rift_ausdauer";
try { const m = JSON.parse(localStorage.getItem(MERK) || "null") as { w: number; t: number } | null;
  if (m && Number.isFinite(m.w) && Number.isFinite(m.t)) { const ticks = Math.max(0, Math.floor((Date.now() - m.t) / 1000 / SPRINT_TICK)); AUSDAUER.wert = Math.min(100, m.w + ticks * erholungJeTick(1) / 100); } } catch { /* privat */ }
const merken = () => { try { localStorage.setItem(MERK, JSON.stringify({ w: Math.round(AUSDAUER.wert * 100) / 100, t: Date.now() })); } catch { /* privat */ } };
if (typeof window !== "undefined") { setInterval(merken, 2000); addEventListener("pagehide", merken); addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") merken(); }); }
/** Werte vom Server übernehmen (im Kampfgebiet) */
export function ausdauerVomServer(a: [number, number]): void { AUSDAUER.wert = a[0]; AUSDAUER.an = a[1] === 1; }
