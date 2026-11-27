/*
 * Mythara – das Bankfenster (shared/bank.ts), wie in OSRS: links die Bank als Raster (alles stapelt, Mengen in Gelb/Weiß/Grün), rechts daneben der eigene Rucksack (4 × 7); im schmalen Hochformat darunter.
 * Kurz antippen: in der Bank = abheben, im Rucksack = einzahlen – jeweils so viel, wie bei „Menge“ gewählt ist (1, 5, 10, X oder Alle).
 * Lange drücken / Rechtsklick: Menü mit allen Mengen und „Untersuchen“. Dazu Suche, „Rucksack einzahlen“ und „Ausrüstung einzahlen“.
 * Der Server prüft alles (Nähe zum Schalter, Platz, Mengen) und schickt das neue Inventar mit der Bank zurück.
 */
import { GEGENSTAENDE, SELTENHEITEN, RUCKSACK_PLAETZE } from "../../shared/gegenstaende";
import { BANK_PLAETZE, BANK_REITER } from "../../shared/bank";
import { tafelZeigen, chatSystem } from "./welt";
import { kontoName } from "./konto";
/** Warum es gerade keine Bank gibt: ohne Konto – oder (mit Konto) noch keine Verbindung zum Spielserver */
const LUPE = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/></svg>`;
const keineBank = (): string => (kontoName() ? "Keine Verbindung zum Spielserver – die Bank öffnet sich, sobald er wieder erreichbar ist. Versuch es gleich noch einmal." : "Eine Bank gibt es mit Konto (Menü → Anmelden).");
import { inventar, bankBitten, inventarAmServer } from "./inventar";
import { gegenstandMalen, gegenstandUntersuchen } from "./rahmen";
import { aktionsMenue, langDruecken } from "./aktionsmenue";

const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
type Menge = 1 | 5 | 10 | "x" | "alle";
const SPEICHER = "ez_bank_menge";
let menge: Menge = (() => { try { const v = localStorage.getItem(SPEICHER); return v === "5" ? 5 : v === "10" ? 10 : v === "x" ? "x" : v === "alle" ? "alle" : 1; } catch { return 1; } })();
let xWert = (() => { try { return Math.max(1, Number(localStorage.getItem(SPEICHER + "_x")) || 50); } catch { return 50; } })();
let offen = false, suche = "", reiter = 0; /* offener Reiter: 0 = alle */
/* Gegenstandsbilder einmal zeichnen und danach nur umhängen: das 3D-Bild je Gegenstand ist teuer, das Fenster zeichnet sich bei jeder Änderung neu */
const bilder = new Map<string, HTMLCanvasElement>();
function bild(schluessel: string, g: string): HTMLCanvasElement { let c = bilder.get(schluessel); if (!c) { c = document.createElement("canvas"); c.width = c.height = 72; gegenstandMalen(c, g); bilder.set(schluessel, c); } return c; }
export const bankOffen = (): boolean => offen;

/** Mengen wie in OSRS: bis 99.999 gelb, ab 100.000 weiß in K, ab 10 Mio. grün in M */
export function mengeText(n: number): { t: string; farbe: string } {
  if (n >= 10_000_000) return { t: Math.floor(n / 1_000_000) + "M", farbe: "#4be06a" };
  if (n >= 100_000) return { t: Math.floor(n / 1000) + "K", farbe: "#ffffff" };
  return { t: String(n), farbe: "#ffe14d" };
}
/** Die gewählte Menge in eine Zahl für den Server (0 = alle) */
function stueck(m: Menge): number | null {
  if (m === "alle") return 0;
  if (m === "x") { const ein = prompt("Wie viele?", String(xWert)); if (ein === null) return null; const n = Math.floor(Number(ein.replace(/[^\d]/g, ""))); if (!(n >= 1)) return null;
    xWert = n; try { localStorage.setItem(SPEICHER + "_x", String(n)); } catch { /* privat */ } return n; }
  return m;
}
function bitte(tat: "ein" | "ab", g: string, m: Menge) { const n = stueck(m); if (n === null) return; if (!bankBitten({ tat, g, menge: n, ...(tat === "ein" && reiter ? { tab: reiter } : {}) })) chatSystem(keineBank()); }
const mengeName = (m: Menge) => (m === "alle" ? "Alle" : m === "x" ? `X (${xWert})` : String(m));

/** Das Bankfenster zeigen (vom Schalter oder aus dem Gespräch mit einem Bankmitarbeiter) */
export function bankZeigen(ort = "Bank der Splitterlande"): void {
  if (!inventarAmServer()) { chatSystem(keineBank()); return; }
  offen = true; suche = ""; let aus = () => { /* abmelden */ };
  const f = tafelZeigen("bank", `<h2>${esc(ort)}</h2><div class="zier"></div>
    <div class="bkoerper"><div class="blinks">
    <div class="bkopf"><div class="breiter" role="tablist" aria-label="Reiter der Bank"></div><input type="search" class="bsuche" placeholder="Suchen …" aria-label="In der Bank suchen"><span class="bplatz"></span><button type="button" class="bsuchknopf" aria-label="Suchen" title="Suchen">${LUPE}</button></div>
    <div class="braster" role="list" aria-label="Bank"></div>
    <div class="bleiste"><span class="bmengen" role="group" aria-label="Menge">${([1, 5, 10, "x", "alle"] as Menge[]).map((m) => `<button type="button" class="bmenge" data-m="${m}">${m === "x" ? "X" : m === "alle" ? "Alle" : m}</button>`).join("")}</span>
      <span class="bluecke"></span><button type="button" class="balles" data-was="rucksack" title="Den ganzen Rucksack einzahlen" aria-label="Rucksack einzahlen"><img src="../img/echtzeit/leiste/rucksack.webp" alt=""><i>⬆</i></button><button type="button" class="balles" data-was="ausruestung" title="Alles Angelegte einzahlen" aria-label="Ausrüstung einzahlen"><img src="../img/echtzeit/leiste/ausruestung.webp" alt=""><i>⬆</i></button></div>
    </div><div class="brechts"><h3 class="brs">Rucksack <small class="brzahl"></small></h3><div class="brucksack" role="list" aria-label="Rucksack"></div></div></div>`, () => { offen = false; aus(); });
  /* Suche: hinter der Lupe (wie in OSRS), damit die Reiter Platz haben; Esc oder leer + Lupe schließt sie */
  { const kopf = f.querySelector(".bkopf") as HTMLElement, feld = f.querySelector(".bsuche") as HTMLInputElement;
    (f.querySelector(".bsuchknopf") as HTMLElement).addEventListener("click", (e) => { e.stopPropagation(); const an = !kopf.classList.contains("sucht"); kopf.classList.toggle("sucht", an);
      if (an) feld.focus(); else if (suche) { suche = ""; feld.value = ""; zeichnen(); } }); }
  const raster = f.querySelector(".braster") as HTMLElement, rs = f.querySelector(".brucksack") as HTMLElement;
  const zeichnen = () => {
    const inv = inventar(), bank = inv.bank || [], q = suche.trim().toLowerCase();
    (f.querySelector(".bplatz") as HTMLElement).textContent = `${bank.length} / ${BANK_PLAETZE}`; (f.querySelector(".brzahl") as HTMLElement).textContent = `${inv.rucksack.filter(Boolean).length} / ${RUCKSACK_PLAETZE}`;
    /* Reiter wie in OSRS: „Alle“, je Reiter das Bild seines ersten Gegenstands, „+“ für einen neuen (Gegenstand hineinziehen oder lange drücken) */
    const tabs = inv.bankTabs || {}, anzahlReiter = Math.max(0, ...Object.values(tabs)); if (reiter > anzahlReiter) reiter = 0;
    const erster = (t: number) => (bank.find(([g]) => tabs[g] === t) || [""])[0];
    (f.querySelector(".breiter") as HTMLElement).innerHTML = `<button type="button" class="breit${reiter === 0 ? " an" : ""}" data-r="0" role="tab" aria-selected="${reiter === 0}" title="Alle Gegenstände">∞</button>`
      + Array.from({ length: anzahlReiter }, (_, i) => { const t = i + 1, g = erster(t); return `<button type="button" class="breit${reiter === t ? " an" : ""}" data-r="${t}" role="tab" aria-selected="${reiter === t}" title="Reiter ${t}">${g ? `<i data-bild="t${t}:${g}" data-g2="${g}"></i>` : t}</button>`; }).join("")
      + (anzahlReiter < BANK_REITER ? `<button type="button" class="breit neu" data-r="neu" title="Neuer Reiter: einen Gegenstand hierher ziehen oder lange drücken → In neuen Reiter">+</button>` : "");
    const ordnung = (g: string) => tabs[g] || 99, sicht = bank.filter(([g]) => (!q || GEGENSTAENDE[g].name.toLowerCase().includes(q)) && (!reiter || tabs[g] === reiter))
      .map((b, i) => ({ b, i })).sort((a, z) => (reiter ? 0 : ordnung(a.b[0]) - ordnung(z.b[0])) || a.i - z.i).map((x) => x.b);
    let vorher = -1; raster.innerHTML = sicht.length ? sicht.map(([g, n]) => { const G = GEGENSTAENDE[g], M = mengeText(n), o = ordnung(g), trenn = !reiter && vorher !== -1 && o !== vorher ? `<span class="btrenn" aria-hidden="true"></span>` : ""; vorher = o;
      return `${trenn}<button type="button" class="bfach s-${G.seltenheit}" data-g="${g}" role="listitem" draggable="true" title="${esc(G.name)} ×${n.toLocaleString("de-DE")}"><i data-bild="b:${g}" data-g2="${g}"></i><b style="color:${M.farbe}">${M.t}</b></button>`; }).join("")
      : `<p class="bleer">${bank.length ? "Nichts gefunden." : "Deine Bank ist leer. Tippe unten im Rucksack etwas an, um es einzuzahlen."}</p>`;
    const anz = inv.anzahl || [];
    rs.innerHTML = Array.from({ length: RUCKSACK_PLAETZE }, (_, i) => { const g = inv.rucksack[i]; if (!g) return `<span class="bfach leer"></span>`; const G = GEGENSTAENDE[g], n = anz[i] || 1, M = mengeText(n);
      return `<button type="button" class="bfach s-${G.seltenheit}" data-g="${g}" data-i="${i}" title="${esc(G.name)}${n > 1 ? " ×" + n : ""}"><i data-bild="r${i}:${g}" data-g2="${g}"></i>${n > 1 ? `<b style="color:${M.farbe}">${M.t}</b>` : ""}</button>`; }).join("");
    f.querySelectorAll<HTMLElement>("i[data-bild]").forEach((p) => p.replaceWith(bild(p.dataset.bild!, p.dataset.g2!)));
    f.querySelectorAll<HTMLElement>(".bmenge").forEach((b) => b.classList.toggle("an", b.dataset.m === String(menge)));
    const xb = f.querySelector<HTMLElement>('.bmenge[data-m="x"]'); if (xb) xb.textContent = menge === "x" ? `X (${xWert})` : "X"; };
  zeichnen();
  (f.querySelector(".bsuche") as HTMLInputElement).addEventListener("input", (e) => { suche = (e.target as HTMLInputElement).value; zeichnen(); });
  f.querySelectorAll<HTMLElement>(".bmenge").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); const m = b.dataset.m!; menge = m === "x" ? "x" : m === "alle" ? "alle" : (Number(m) as 1 | 5 | 10);
    if (menge === "x" && stueck("x") === null) menge = 1; try { localStorage.setItem(SPEICHER, String(menge)); } catch { /* privat */ } zeichnen(); }));
  f.querySelectorAll<HTMLElement>(".balles").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); bankBitten({ tat: "alles", was: b.dataset.was as "rucksack" | "ausruestung" }); }));
  raster.addEventListener("click", (e) => { const b = (e.target as HTMLElement).closest<HTMLElement>(".bfach[data-g]"); if (!b) return; e.stopPropagation(); bitte("ab", b.dataset.g!, menge); });
  rs.addEventListener("click", (e) => { const b = (e.target as HTMLElement).closest<HTMLElement>(".bfach[data-g]"); if (!b) return; e.stopPropagation(); bitte("ein", b.dataset.g!, menge); });
  const menue = (tat: "ein" | "ab", wort: string) => (e: { clientX: number; clientY: number; target: EventTarget | null }) => {
    const b = (e.target as HTMLElement | null)?.closest<HTMLElement>(".bfach[data-g]"); if (!b) return false; const g = b.dataset.g!, G = GEGENSTAENDE[g];
    aktionsMenue(e.clientX, e.clientY, [{ kopf: G.name, farbe: SELTENHEITEN[G.seltenheit].farbe, aktionen: [
      ...([1, 5, 10, "x", "alle"] as Menge[]).map((m) => ({ text: `${wort}: ${mengeName(m)}`, sym: tat === "ab" ? "⬇" : "⬆", tat: () => bitte(tat, g, m) })),
      ...(tat === "ab" ? reiterAktionen(g) : []),
      { text: "Untersuchen", sym: "🔍", tat: () => gegenstandUntersuchen(g, () => bankZeigen(ort)) }] }]); return true; };
  /* Reiter: per Menü (Handy) oder Ziehen auf einen Reiter (Maus) */
  const reiterAktionen = (g: string) => { const tabs = inventar().bankTabs || {}, n = Math.max(0, ...Object.values(tabs)), jetzt = tabs[g] || 0, a: { text: string; sym: string; tat: () => void }[] = [];
    for (let t = 1; t <= n; t++) if (t !== jetzt) a.push({ text: `In Reiter ${t}`, sym: "🗂", tat: () => bankBitten({ tat: "tab", g, tab: t }) });
    if (n < BANK_REITER) a.push({ text: "In neuen Reiter", sym: "➕", tat: () => bankBitten({ tat: "tab", g, tab: n + 1 }) });
    if (jetzt) a.push({ text: "Aus dem Reiter nehmen", sym: "↩", tat: () => bankBitten({ tat: "tab", g, tab: 0 }) }); return a; };
  const leiste = f.querySelector(".breiter") as HTMLElement;
  leiste.addEventListener("click", (e) => { const b = (e.target as HTMLElement).closest<HTMLElement>(".breit"); if (!b || b.dataset.r === "neu") return; e.stopPropagation(); reiter = Number(b.dataset.r) || 0; zeichnen(); });
  raster.addEventListener("dragstart", (e) => { const b = (e.target as HTMLElement).closest<HTMLElement>(".bfach[data-g]"); if (b && e.dataTransfer) { e.dataTransfer.setData("text/plain", b.dataset.g!); e.dataTransfer.effectAllowed = "move"; } });
  leiste.addEventListener("dragover", (e) => { if ((e.target as HTMLElement).closest(".breit")) e.preventDefault(); });
  leiste.addEventListener("drop", (e) => { const b = (e.target as HTMLElement).closest<HTMLElement>(".breit"), g = e.dataTransfer && e.dataTransfer.getData("text/plain"); if (!b || !g) return; e.preventDefault();
    const n = Math.max(0, ...Object.values(inventar().bankTabs || {})); bankBitten({ tat: "tab", g, tab: b.dataset.r === "neu" ? n + 1 : Number(b.dataset.r) || 0 }); });
  langDruecken(raster, menue("ab", "Abheben")); langDruecken(rs, menue("ein", "Einzahlen"));
  const neu = () => { if (!f.isConnected || !offen) { aus(); return; } zeichnen(); };
  addEventListener("ez-inventar", neu); aus = () => removeEventListener("ez-inventar", neu);
}
