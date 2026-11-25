/*
 * Mythara – Aktionsmenü im Pergament-Stil (wie der Rechtsklick in OSRS, im Stil der Tabs): erscheint direkt am angeklickten Ziel.
 * PC: Rechtsklick (oder Maustaste halten) · Handy: lange drücken. Kurz tippen / Linksklick führt weiter die erste Aktion aus.
 * Gruppen: je Ziel an der Stelle eine Kopfzeile (Name in der Farbe seiner Art) und darunter die Aktionen; Gegenstände am Boden als Liste
 * (je Gegenstand aufheben, daneben eine Lupe zum Untersuchen) mit „Alles aufheben“ unten. Schließt bei Klick daneben, Esc oder nach einer Aktion.
 */
export interface Aktion { text: string; sym: string; tat: () => void; farbe?: string; anzahl?: number; lupe?: () => void; haupt?: boolean }
export interface Gruppe { kopf: string; farbe?: string; aktionen: Aktion[]; liste?: boolean; /** Level hinter dem Namen, in eigener Farbe (Gegner: nach Schwierigkeit wie in OSRS) */ lv?: { text: string; farbe: string } }
/** Farben je Art (wie die Namen über den Köpfen) */
export const FARBE = { figur: "#ffd86a", spieler: "#ffffff", objekt: "#7fd4ff", gegner: "#ff8a6a", ding: "#ff9a2e" };
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
let offen: HTMLElement | null = null, aus: (() => void) | null = null;
export const menueOffen = (): boolean => Boolean(offen);
export function menueZu(): void { if (offen) offen.remove(); offen = null; if (aus) { aus(); aus = null; } }
/** Das Menü an Bildschirmpunkt (px, py) zeigen */
export function aktionsMenue(px: number, py: number, gruppen: Gruppe[]): void {
  menueZu(); const g = gruppen.filter((x) => x.aktionen.length); if (!g.length) return;
  const m = document.createElement("div"); m.className = "ez-aktionen"; m.setAttribute("role", "menu"); const alle: Aktion[] = [];
  const knopf = (a: Aktion, klasse = "") => { const i = alle.push(a) - 1; return `<button type="button" role="menuitem" class="${klasse}${a.haupt ? " alles" : ""}" data-i="${i}"><span class="sy">${a.sym}</span><b${a.farbe ? ` style="color:${a.farbe}"` : ""}>${esc(a.text)}</b>${a.anzahl && a.anzahl > 1 ? `<em>×${a.anzahl}</em>` : ""}</button>`; };
  m.innerHTML = g.map((x) => (x.kopf ? `<div class="kopf"><i style="background:${x.farbe || FARBE.objekt}"></i>${esc(x.kopf)}${x.lv ? ` <b class="lv" style="color:${x.lv.farbe}">${esc(x.lv.text)}</b>` : ""}</div>` : `<div class="trenn"></div>`) + (x.liste
    ? `<div class="stapelliste">${x.aktionen.filter((a) => !a.haupt).map((a) => `<div class="ding">${knopf(a)}${a.lupe ? knopf({ text: "", sym: "🔍", tat: a.lupe }, "lupe") : ""}</div>`).join("")}</div>${x.aktionen.filter((a) => a.haupt).map((a) => knopf(a)).join("")}`
    : x.aktionen.map((a) => knopf(a)).join(""))).join("");
  document.body.appendChild(m); offen = m;
  for (const ev of ["pointerdown", "pointerup", "wheel", "contextmenu"]) m.addEventListener(ev, (e) => { e.stopPropagation(); if (ev === "contextmenu") e.preventDefault(); });
  m.addEventListener("click", (e) => { e.stopPropagation(); const b = (e.target as HTMLElement).closest<HTMLElement>("[data-i]"); if (!b) return; const a = alle[Number(b.dataset.i)]; menueZu(); if (a) a.tat(); });
  /* an den Punkt legen (leicht darunter), im Bild halten */
  const w = m.offsetWidth, h = m.offsetHeight, x = Math.min(Math.max(6, px - w / 2), innerWidth - w - 6), y = py + 10 + h > innerHeight - 6 ? Math.max(6, py - h - 10) : py + 10;
  m.style.left = x + "px"; m.style.top = y + "px";
  const weg = (e: Event) => { if (offen && !offen.contains(e.target as Node)) menueZu(); }, taste = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); menueZu(); } };
  setTimeout(() => { if (offen !== m) return; addEventListener("pointerdown", weg, true); addEventListener("keydown", taste, true); }, 0);
  aus = () => { removeEventListener("pointerdown", weg, true); removeEventListener("keydown", taste, true); };
}
/** Langes Drücken (oder Rechtsklick) auf einem Element erkennen; true aus beiLang = Menü gezeigt (der folgende Klick wird geschluckt) */
export function langDruecken(el: HTMLElement, beiLang: (e: { clientX: number; clientY: number; target: EventTarget | null }) => boolean, ms = 450): void {
  let t = 0, start: { x: number; y: number; id: number } | null = null, gezeigt = false;
  el.addEventListener("pointerdown", (e) => { gezeigt = false; if (e.button !== 0) return; start = { x: e.clientX, y: e.clientY, id: e.pointerId }; const ziel = e.target;
    clearTimeout(t); t = window.setTimeout(() => { if (start && beiLang({ clientX: start.x, clientY: start.y, target: ziel })) gezeigt = true; start = null; }, ms); });
  el.addEventListener("pointermove", (e) => { if (start && e.pointerId === start.id && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 9) { clearTimeout(t); start = null; } });
  for (const ev of ["pointerup", "pointercancel"]) el.addEventListener(ev, () => { clearTimeout(t); start = null; });
  el.addEventListener("click", (e) => { if (gezeigt) { gezeigt = false; e.stopPropagation(); e.preventDefault(); } }, true);
  el.addEventListener("contextmenu", (e) => { e.preventDefault(); clearTimeout(t); start = null; if (beiLang(e)) gezeigt = false; });
}
