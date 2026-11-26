/*
 * Mythara – Gespräche mit Questfiguren im Stil der klassischen Chatbox (wie OSRS): unten ein Pergamentkasten, immer eine Aussage auf einmal.
 * Spricht die Figur, steht ihr Kopfbild links und ihr Name oben; sprichst du, steht dein Bildnis rechts. Darunter „Klicke hier, um fortzufahren“
 * (oder Leertaste). Nach der letzten Aussage: „Wähle eine Antwort“ mit den Antworten als Liste (auch Tasten 1–9) – die gewählte sagt dein Held,
 * dann antwortet die Figur. Privat: der Server schickt Gespräche nur an den, der spricht ({t:"dialog", npc, dialog?, zeilen?, ende?}, welt.ts → „ez-dialog“).
 */
import { antworte, dialogZu } from "./welt";
import type { Dialog, Zeile, Antwort } from "../../shared/questbau";

type Nachricht = { npc: string; dialog?: Dialog; zeilen?: Zeile[]; ende?: boolean };
/** Kopfbild zu einem Sprecher („Du“ = der eigene Held); die 3D-Welt setzt das (welt3d/quest3d.ts) */
let bildnisFuer: (wer: string, npc: string) => Promise<string> = async () => "";
export function bildnisseVon(f: typeof bildnisFuer): void { bildnisFuer = f; }

/** schlange: die Aussagen, die noch kommen (die erste wird gezeigt); wahl: Antworten danach; wartet: die eigene Antwort ist unterwegs */
let npcJetzt = "", schlange: Zeile[] = [], wahl: Antwort[] | null = null, wartet = false;
/** Gespräch ohne Server (Händler am Marktplatz): die Wahl beantwortet der Browser selbst – Zeilen danach oder "zu" (Gespräch schließen) */
let lokal: ((id: string) => Zeile[] | "zu") | null = null;
export function lokalesGespraech(wer: string, zeilen: Zeile[], antworten: Antwort[], beiWahl: (id: string) => Zeile[] | "zu"): void {
  schliessen(true); npcJetzt = "lokal:" + wer; lokal = beiWahl; schlange = zeilen; wahl = antworten; wartet = false; zeichnen(); }
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const zeigtWahl = () => Boolean(wahl) && schlange.length === 0;
function kasten(): HTMLElement { let d = document.getElementById("ez-gespraech"); if (d) return d;
  const neu = document.createElement("section"); neu.id = "ez-gespraech"; neu.hidden = true; neu.setAttribute("aria-live", "polite"); document.body.appendChild(neu);
  for (const t of ["pointerdown", "pointerup", "keydown", "keyup", "wheel"]) neu.addEventListener(t, (e) => e.stopPropagation());
  neu.addEventListener("click", (e) => { e.stopPropagation(); const b = (e.target as HTMLElement).closest<HTMLElement>("[data-a]");
    if (b && b.dataset.a === "__zu") { schliessen(true); return; }
    if (zeigtWahl()) { if (b) waehlen(b.dataset.a!); return; } weiter(); });
  return neu; }
export function schliessen(melden = false): void { const d = document.getElementById("ez-gespraech"); if (d) { d.hidden = true; d.innerHTML = ""; } if (melden && npcJetzt && !npcJetzt.startsWith("lokal:")) dialogZu(); npcJetzt = ""; schlange = []; wahl = null; wartet = false; lokal = null; }
/** Mit wem gerade gesprochen wird: Quest-Id (jori, raban …) oder „lokal:Name“ (Händler) */
export const gespraechMit = (): string => npcJetzt;
export const dialogOffen = (): boolean => { const d = document.getElementById("ez-gespraech"); return !!d && !d.hidden; };
/** Weiter: nächste Aussage, dann die Antworten, sonst schließen */
function weiter(): void { if (wartet) return; if (schlange.length > 1 || (schlange.length === 1 && wahl)) { schlange.shift(); zeichnen(); return; } schliessen(); }
function waehlen(id: string): void { const a = wahl && wahl.find((x) => x.id === id); if (!a) return;
  if (lokal) { const f = lokal, r = f(a.id); if (r === "zu") { schliessen(); return; } wahl = null; lokal = null; schlange = [{ wer: "Du", text: a.text }, ...r]; zeichnen(); return; } wahl = null; wartet = true; schlange = [{ wer: "Du", text: a.text.replace(/\s*\([^)]*\)\s*$/, "") }]; zeichnen(); antworte(npcJetzt, a.id); }
/** Wie die klassische Chatbox: das Gespräch liegt genau über dem Chatfenster (eingeklappt: an seiner Stelle in voller Höhe); ohne Chat unten in der Mitte */
function lage(): void { const d = document.getElementById("ez-gespraech"), c = document.querySelector<HTMLElement>(".ez-chat"); if (!d) return;
  const r = c && c.offsetWidth ? c.getBoundingClientRect() : null;
  if (!r || r.width < 200) { d.classList.remove("imchat"); Object.assign(d.style, { left: "", top: "", width: "", minHeight: "" }); return; }
  d.classList.add("imchat"); Object.assign(d.style, { left: r.left + "px", top: r.top + "px", width: r.width + "px", minHeight: Math.max(r.height, 140) + "px" }); } /* mindestens so hoch wie der Chat, bei langen Antworten höher */
addEventListener("resize", lage);
function zeichnen(): void {
  const d = kasten(), x = `<button type="button" class="zu" data-a="__zu" aria-label="Gespräch beenden">✕</button>`;
  if (zeigtWahl()) { d.className = "wahl"; d.innerHTML = `<div class="kasten"><b class="titel">Wähle eine Antwort</b><div class="antworten">${wahl!.map((a, i) => `<button type="button" data-a="${esc(a.id)}"><i>${i + 1}.</i> ${esc(a.text)}</button>`).join("")}</div></div>${x}`; d.hidden = false; lage(); return; }
  const z = schlange[0]; if (!z) { schliessen(); return; }
  const ich = z.wer === "Du"; d.className = ich ? "ich" : "npc";
  d.innerHTML = `<div class="kasten"><span class="rahmen"><img class="bild" alt=""></span><div class="mitte"><b class="name">${esc(ich ? "Du" : z.wer)}</b><p class="text">${esc(z.text)}</p><span class="weiter">${wartet ? "…" : "Klicke hier, um fortzufahren"}</span></div></div>${x}`;
  d.hidden = false; lage(); const img = d.querySelector(".bild") as HTMLImageElement, wer = z.wer, zeile = z;
  void bildnisFuer(wer, npcJetzt).then((u) => { if (u && schlange[0] === zeile && img.isConnected) img.src = u; }); }
/** Eine Nachricht des Servers aufnehmen: Aussagen hinten an die Schlange, danach die Antworten (oder Ende) */
function aufnehmen(m: Nachricht): void {
  if (m.dialog) npcJetzt = m.npc;
  if (m.ende && !m.zeilen) { if (!wartet) { schliessen(); return; } }
  const eigene = wartet ? schlange.slice(0, 1) : []; wartet = false;
  /* weiter=true schickt Antwortzeilen und den Dialog (dessen Zeilen schon gezeigt wurden): dann nur die Antwortzeilen */
  const neu = m.zeilen ? m.zeilen : m.dialog ? m.dialog.zeilen : [];
  schlange = [...eigene, ...neu]; wahl = m.dialog && !m.ende ? m.dialog.antworten : null;
  if (!schlange.length && !wahl) { schliessen(); return; } zeichnen(); }
addEventListener("ez-dialog", (e) => aufnehmen((e as CustomEvent).detail as Nachricht));
addEventListener("keydown", (e) => { if (!dialogOffen()) return; if (e.key === "Escape") { schliessen(true); return; }
  if (zeigtWahl()) { if (/^[1-9]$/.test(e.key) && wahl![Number(e.key) - 1]) waehlen(wahl![Number(e.key) - 1].id); return; }
  if (e.key === " " || e.key === "Enter") { e.preventDefault(); weiter(); } });
