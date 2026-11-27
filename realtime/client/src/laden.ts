/*
 * Mythara – Ladenfenster der Händler am Marktplatz (shared/laeden.ts): ein Pergament in der Bildschirmmitte mit dem Namen des Ladens und den Waren als Raster.
 * Kurz antippen = untersuchen. Lange drücken / Rechtsklick = Aktionsmenü: „Kaufen“, „Untersuchen“. Rechts der Rucksack zum Verkaufen (#87) (seit 25.11.2026 – vorher kaufte schon das Antippen). Bezahlt wird mit Splittern; der Server prüft Preis, Nähe und Platz.
 */
import { LAEDEN, LadenId, WAEHRUNG, ankaufPreis } from "../../shared/laeden";
import { GEGENSTAENDE, SELTENHEITEN, RUCKSACK_PLAETZE } from "../../shared/gegenstaende";
import { tafelZeigen, chatSystem } from "./welt";
import { inventar, kaufenBitten, verkaufenBitten } from "./inventar";
import { gegenstandMalen, gegenstandUntersuchen } from "./rahmen";
import { aktionsMenue, langDruecken } from "./aktionsmenue";

const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
/** Splitter im Rucksack */
const geld = (): number => { const i = inventar(); return i.rucksack.reduce((n, g, k) => n + (g === WAEHRUNG ? (i.anzahl || [])[k] || 1 : 0), 0); };
let offen: LadenId | null = null;
export const ladenOffen = (): LadenId | null => offen;
function kaufen(id: LadenId, g: string): void { const w = LAEDEN[id].waren.find((x) => x.g === g); if (!w) return;
  if (geld() < w.preis) { chatSystem(`Dafür fehlen dir ${w.preis - geld()} Splitter.`); return; }
  if (!kaufenBitten(id, g)) chatSystem("Einkaufen geht mit Konto (Menü → Anmelden)."); }
/* Verkaufen (#87): Rucksack neben den Waren. Antippen = Preis zeigen (oder „Kauft er nicht“), lange drücken = „Verkaufen“ mit Menge */
let xWert = (() => { try { return Math.max(1, Number(localStorage.getItem("ez_laden_x")) || 10); } catch { return 10; } })();
function verkaufen(id: LadenId, i: number, n: number | "x"): void { let k = n;
  if (k === "x") { const ein = prompt("Wie viele?", String(xWert)); if (ein === null) return; const z = Math.floor(Number(ein.replace(/[^\d]/g, ""))); if (!(z >= 1)) return; xWert = z; try { localStorage.setItem("ez_laden_x", String(z)); } catch { /* privat */ } k = z; }
  if (!verkaufenBitten(id, i, k)) chatSystem("Verkaufen geht mit Konto (Menü → Anmelden)."); }
/** Den Laden in der Bildschirmmitte zeigen */
export function ladenZeigen(id: LadenId): void {
  const L = LAEDEN[id]; offen = id; let aus = () => { /* abmelden */ };
  const vorname = L.haendler.split(" ")[0];
  const f = tafelZeigen("laden", `<h2>${esc(L.name)}</h2><p class="lspruch">${esc(L.spruch)}</p><div class="zier"></div>
    <div class="lkopf"><span>${esc(L.haendler)}</span><b class="lgeld">◆ <i>${geld()}</i> Splitter</b></div>
    <div class="lkoerper"><div class="lraster">${L.waren.map((w) => { const G = GEGENSTAENDE[w.g], S = SELTENHEITEN[G.seltenheit];
      return `<button type="button" class="lware s-${G.seltenheit}" data-g="${w.g}" title="${esc(G.name)} – ${w.preis} Splitter (antippen: untersuchen · lang drücken: kaufen)"><canvas width="96" height="96" data-bild="${w.g}"></canvas>
        <span class="lname" style="color:${S.farbe}">${esc(G.name)}</span><span class="lpreis${geld() < w.preis ? " zuteuer" : ""}">◆ ${w.preis}</span></button>`; }).join("")}</div>
    <div class="lrechts"><h3 class="lrs">Rucksack <small class="lrzahl"></small></h3><div class="lrucksack" role="list" aria-label="Rucksack"></div></div></div>
    <p class="lpreiszeile" aria-live="polite">Tippe im Rucksack auf einen Gegenstand: ${esc(vorname)} sagt dir, was er zahlt.</p>`, () => { offen = null; aus(); });
  const rs = f.querySelector(".lrucksack") as HTMLElement, zeile = f.querySelector(".lpreiszeile") as HTMLElement; let gewaehlt = -1;
  const rucksackZeichnen = () => { const inv = inventar(), an = inv.anzahl || [], da = (inv as { daten?: (Record<string, unknown> | undefined)[] }).daten || [];
    (f.querySelector(".lrzahl") as HTMLElement).textContent = `${inv.rucksack.length} / ${RUCKSACK_PLAETZE}`;
    rs.innerHTML = Array.from({ length: RUCKSACK_PLAETZE }, (_, i) => { const g = inv.rucksack[i]; if (!g) return `<span class="lfach leer"></span>`; const G = GEGENSTAENDE[g], n = an[i] || 1, p = ankaufPreis(L, g, da[i] as never);
      return `<button type="button" class="lfach s-${G.seltenheit}${p === null ? " nein" : ""}${i === gewaehlt ? " an" : ""}" data-i="${i}" data-g="${g}" title="${esc(G.name)}${n > 1 ? " ×" + n : ""}"><canvas width="72" height="72" data-bild="${g}"></canvas>${n > 1 ? `<b>${n}</b>` : ""}</button>`; }).join("");
    rs.querySelectorAll<HTMLCanvasElement>("canvas[data-bild]").forEach((c) => gegenstandMalen(c, c.dataset.bild!)); };
  const preisZeigen = (i: number) => { const inv = inventar(), g = inv.rucksack[i]; if (!g) return; const G = GEGENSTAENDE[g], n = (inv.anzahl || [])[i] || 1, d = ((inv as { daten?: unknown[] }).daten || [])[i], p = ankaufPreis(L, g, d as never);
    gewaehlt = i; rucksackZeichnen();
    zeile.innerHTML = p === null ? `<b>${esc(G.name)}</b> – <span class="nein">${g === WAEHRUNG ? "Splitter sind Geld." : "Kauft er nicht."}</span>`
      : `<b>${esc(G.name)}</b> – ${esc(vorname)} zahlt <span class="ja">◆ ${p}</span>${n > 1 ? ` je Stück (alle ${n}: ◆ ${p * n})` : ""} · lange drücken: verkaufen`; };
  rucksackZeichnen();
  rs.addEventListener("click", (e) => { const b = (e.target as HTMLElement).closest<HTMLElement>(".lfach[data-i]"); if (!b) return; e.stopPropagation(); preisZeigen(Number(b.dataset.i)); });
  langDruecken(rs, (e) => { const b = (e.target as HTMLElement | null)?.closest<HTMLElement>(".lfach[data-i]"); if (!b) return false; const i = Number(b.dataset.i), inv = inventar(), g = inv.rucksack[i], G = GEGENSTAENDE[g], n = (inv.anzahl || [])[i] || 1;
    const p = ankaufPreis(L, g, ((inv as { daten?: unknown[] }).daten || [])[i] as never); preisZeigen(i);
    const a = p === null ? [] : n > 1 ? [...[1, 5, 10].filter((m) => m < n).map((m) => ({ text: `Verkaufen: ${m} (◆ ${p * m})`, sym: "💰", tat: () => verkaufen(id, i, m) })), { text: "Verkaufen: X", sym: "💰", tat: () => verkaufen(id, i, "x") }, { text: `Verkaufen: Alle ${n} (◆ ${p * n})`, sym: "💰", tat: () => verkaufen(id, i, n) }]
      : [{ text: `Verkaufen (◆ ${p})`, sym: "💰", tat: () => verkaufen(id, i, 1) }];
    aktionsMenue(e.clientX, e.clientY, [{ kopf: G.name, farbe: SELTENHEITEN[G.seltenheit].farbe, aktionen: [...a, { text: "Untersuchen", sym: "🔍", tat: () => gegenstandUntersuchen(g, () => ladenZeigen(id)) }] }]); return true; });
  f.querySelectorAll<HTMLCanvasElement>("canvas[data-bild]").forEach((c) => gegenstandMalen(c, c.dataset.bild!));
  const raster = f.querySelector(".lraster") as HTMLElement;
  raster.addEventListener("click", (e) => { const b = (e.target as HTMLElement).closest<HTMLElement>(".lware"); if (!b) return; e.stopPropagation(); const g = b.dataset.g!; gegenstandUntersuchen(g, () => ladenZeigen(id)); });
  langDruecken(raster, (e) => { const b = (e.target as HTMLElement | null)?.closest<HTMLElement>(".lware"); if (!b) return false; const g = b.dataset.g!, G = GEGENSTAENDE[g], w = L.waren.find((x) => x.g === g)!;
    aktionsMenue(e.clientX, e.clientY, [{ kopf: G.name, farbe: SELTENHEITEN[G.seltenheit].farbe, aktionen: [
      { text: `Kaufen (◆ ${w.preis})`, sym: "🛒", tat: () => kaufen(id, g) }, { text: "Untersuchen", sym: "🔍", tat: () => gegenstandUntersuchen(g, () => ladenZeigen(id)) }] }]); return true; });
  /* Splitter und „zu teuer“ frisch halten, solange der Laden offen ist */
  const neu = () => { if (!f.isConnected || offen !== id) { aus(); return; } const n = geld(), z = f.querySelector(".lgeld i"); if (z) z.textContent = String(n);
    f.querySelectorAll<HTMLElement>(".lware").forEach((b) => { const w = L.waren.find((x) => x.g === b.dataset.g); const p = b.querySelector(".lpreis"); if (w && p) p.classList.toggle("zuteuer", n < w.preis); });
    if (gewaehlt >= 0 && !inventar().rucksack[gewaehlt]) gewaehlt = -1; rucksackZeichnen(); };
  addEventListener("ez-inventar", neu); aus = () => removeEventListener("ez-inventar", neu); }
