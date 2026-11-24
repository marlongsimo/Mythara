/*
 * Mythara – das Bankfenster (shared/bank.ts), wie in OSRS: oben die Bank als Raster (alles stapelt, Mengen in Gelb/Weiß/Grün), darunter der eigene Rucksack.
 * Kurz antippen: in der Bank = abheben, im Rucksack = einzahlen – jeweils so viel, wie bei „Menge“ gewählt ist (1, 5, 10, X oder Alle).
 * Lange drücken / Rechtsklick: Menü mit allen Mengen und „Untersuchen“. Dazu Suche, „Rucksack einzahlen“ und „Ausrüstung einzahlen“.
 * Der Server prüft alles (Nähe zum Schalter, Platz, Mengen) und schickt das neue Inventar mit der Bank zurück.
 */
import { GEGENSTAENDE, SELTENHEITEN, RUCKSACK_PLAETZE } from "../../shared/gegenstaende";
import { BANK_PLAETZE } from "../../shared/bank";
import { tafelZeigen, chatSystem } from "./welt";
import { inventar, bankBitten, inventarAmServer } from "./inventar";
import { gegenstandMalen, gegenstandUntersuchen } from "./rahmen";
import { aktionsMenue, langDruecken } from "./aktionsmenue";

const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
type Menge = 1 | 5 | 10 | "x" | "alle";
const SPEICHER = "ez_bank_menge";
let menge: Menge = (() => { try { const v = localStorage.getItem(SPEICHER); return v === "5" ? 5 : v === "10" ? 10 : v === "x" ? "x" : v === "alle" ? "alle" : 1; } catch { return 1; } })();
let xWert = (() => { try { return Math.max(1, Number(localStorage.getItem(SPEICHER + "_x")) || 50); } catch { return 50; } })();
let offen = false, suche = "";
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
function bitte(tat: "ein" | "ab", g: string, m: Menge) { const n = stueck(m); if (n === null) return; if (!bankBitten({ tat, g, menge: n })) chatSystem("Eine Bank gibt es mit Konto (Menü → Anmelden)."); }
const mengeName = (m: Menge) => (m === "alle" ? "Alle" : m === "x" ? `X (${xWert})` : String(m));

/** Das Bankfenster zeigen (vom Schalter oder aus dem Gespräch mit einem Bankmitarbeiter) */
export function bankZeigen(ort = "Bank der Splitterlande"): void {
  if (!inventarAmServer()) { chatSystem("Eine Bank gibt es mit Konto (Menü → Anmelden)."); return; }
  offen = true; suche = ""; let aus = () => { /* abmelden */ };
  const f = tafelZeigen("bank", `<h2>${esc(ort)}</h2><div class="zier"></div>
    <div class="bkopf"><input type="search" class="bsuche" placeholder="Suchen …" aria-label="In der Bank suchen"><span class="bplatz"></span></div>
    <div class="braster" role="list" aria-label="Bank"></div>
    <div class="bleiste"><span>Menge:</span>${([1, 5, 10, "x", "alle"] as Menge[]).map((m) => `<button type="button" class="bmenge" data-m="${m}">${m === "x" ? "X" : m === "alle" ? "Alle" : m}</button>`).join("")}
      <span class="bluecke"></span><button type="button" class="balles" data-was="rucksack" title="Den ganzen Rucksack einzahlen">🎒 Rucksack einzahlen</button><button type="button" class="balles" data-was="ausruestung" title="Alles Angelegte einzahlen">🛡 Ausrüstung einzahlen</button></div>
    <h3 class="brs">Rucksack</h3><div class="brucksack" role="list" aria-label="Rucksack"></div>
    <p class="klein">Antippen: abheben bzw. einzahlen (Menge oben) · lange drücken: alle Mengen und untersuchen</p>`, () => { offen = false; aus(); });
  const raster = f.querySelector(".braster") as HTMLElement, rs = f.querySelector(".brucksack") as HTMLElement;
  const zeichnen = () => {
    const inv = inventar(), bank = inv.bank || [], q = suche.trim().toLowerCase();
    (f.querySelector(".bplatz") as HTMLElement).textContent = `${bank.length} / ${BANK_PLAETZE}`;
    const sicht = bank.filter(([g]) => !q || GEGENSTAENDE[g].name.toLowerCase().includes(q));
    raster.innerHTML = sicht.length ? sicht.map(([g, n]) => { const G = GEGENSTAENDE[g], M = mengeText(n);
      return `<button type="button" class="bfach s-${G.seltenheit}" data-g="${g}" role="listitem" title="${esc(G.name)} ×${n.toLocaleString("de-DE")}"><i data-bild="b:${g}" data-g2="${g}"></i><b style="color:${M.farbe}">${M.t}</b></button>`; }).join("")
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
      { text: "Untersuchen", sym: "🔍", tat: () => gegenstandUntersuchen(g, () => bankZeigen(ort)) }] }]); return true; };
  langDruecken(raster, menue("ab", "Abheben")); langDruecken(rs, menue("ein", "Einzahlen"));
  const neu = () => { if (!f.isConnected || !offen) { aus(); return; } zeichnen(); };
  addEventListener("ez-inventar", neu); aus = () => removeEventListener("ez-inventar", neu);
}
