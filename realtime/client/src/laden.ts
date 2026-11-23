/*
 * Mythara – Ladenfenster der Händler am Marktplatz (shared/laeden.ts): ein Pergament in der Bildschirmmitte mit dem Namen des Ladens und den Waren als Raster.
 * Kurz antippen = kaufen. Lange drücken / Rechtsklick = Aktionsmenü: „Kaufen“, „Untersuchen“. Bezahlt wird mit Splittern; der Server prüft Preis, Nähe und Platz.
 */
import { LAEDEN, LadenId, WAEHRUNG } from "../../shared/laeden";
import { GEGENSTAENDE, SELTENHEITEN } from "../../shared/gegenstaende";
import { tafelZeigen, chatSystem } from "./welt";
import { inventar, kaufenBitten } from "./inventar";
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
/** Den Laden in der Bildschirmmitte zeigen */
export function ladenZeigen(id: LadenId): void {
  const L = LAEDEN[id]; offen = id; let aus = () => { /* abmelden */ };
  const f = tafelZeigen("laden", `<h2>${esc(L.name)}</h2><p class="lspruch">${esc(L.spruch)}</p><div class="zier"></div>
    <div class="lkopf"><span>${esc(L.haendler)}</span><b class="lgeld">◆ <i>${geld()}</i> Splitter</b></div>
    <div class="lraster">${L.waren.map((w) => { const G = GEGENSTAENDE[w.g], S = SELTENHEITEN[G.seltenheit];
      return `<button type="button" class="lware s-${G.seltenheit}" data-g="${w.g}" title="${esc(G.name)} – ${w.preis} Splitter (kurz: kaufen · lang: mehr)"><canvas width="96" height="96" data-bild="${w.g}"></canvas>
        <span class="lname" style="color:${S.farbe}">${esc(G.name)}</span><span class="lpreis${geld() < w.preis ? " zuteuer" : ""}">◆ ${w.preis}</span></button>`; }).join("")}</div>
    <p class="klein">Antippen: kaufen · lange drücken: untersuchen</p>`, () => { offen = null; aus(); });
  f.querySelectorAll<HTMLCanvasElement>("canvas[data-bild]").forEach((c) => gegenstandMalen(c, c.dataset.bild!));
  const raster = f.querySelector(".lraster") as HTMLElement;
  raster.addEventListener("click", (e) => { const b = (e.target as HTMLElement).closest<HTMLElement>(".lware"); if (!b) return; e.stopPropagation(); kaufen(id, b.dataset.g!); });
  langDruecken(raster, (e) => { const b = (e.target as HTMLElement | null)?.closest<HTMLElement>(".lware"); if (!b) return false; const g = b.dataset.g!, G = GEGENSTAENDE[g], w = L.waren.find((x) => x.g === g)!;
    aktionsMenue(e.clientX, e.clientY, [{ kopf: G.name, farbe: SELTENHEITEN[G.seltenheit].farbe, aktionen: [
      { text: `Kaufen (◆ ${w.preis})`, sym: "🛒", tat: () => kaufen(id, g) }, { text: "Untersuchen", sym: "🔍", tat: () => gegenstandUntersuchen(g, () => ladenZeigen(id)) }] }]); return true; });
  /* Splitter und „zu teuer“ frisch halten, solange der Laden offen ist */
  const neu = () => { if (!f.isConnected || offen !== id) { aus(); return; } const n = geld(), z = f.querySelector(".lgeld i"); if (z) z.textContent = String(n);
    f.querySelectorAll<HTMLElement>(".lware").forEach((b) => { const w = L.waren.find((x) => x.g === b.dataset.g); const p = b.querySelector(".lpreis"); if (w && p) p.classList.toggle("zuteuer", n < w.preis); }); };
  addEventListener("ez-inventar", neu); aus = () => removeEventListener("ez-inventar", neu); }
