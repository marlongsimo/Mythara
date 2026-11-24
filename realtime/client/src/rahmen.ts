/*
 * Der gemeinsame Spielrahmen (MMO-Oberfläche) für Waldmark, Dörfer und Kämpfe:
 * oben rechts die runde Minikarte, die dem Helden folgt, darunter Weltkarte · Teleport · Quests;
 * Rucksack und Ausrüstung als Tafeln (noch ohne Gegenstände – das Grundgerüst für das kommende Inventar).
 * Unten rechts liegen im Kampf die Aktionen 1–4 (links läuft man mit dem Steuerknüppel), unten in der Mitte der Chat (welt.ts).
 */
import { QUESTS, merkerVon, sternText } from "./hud";
import { HELDEN } from "../../shared/config";

const $ = (s: string) => document.querySelector(s) as HTMLElement;
const SVG = (inhalt: string) => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${inhalt}</svg>`;
export const RZEICHEN = {
  karte: SVG('<path d="M3 6.2 9 4l6 2.2L21 4v13.8L15 20l-6-2.2L3 20z"/><path d="M9 4v13.8M15 6.2V20"/>'),
  teleport: SVG('<path d="M12 3c3.3 3 5 5.8 5 8.5a5 5 0 0 1-10 0C7 8.8 8.7 6 12 3z"/><path d="M12 9.5v6M9.5 13 12 15.5 14.5 13"/><path d="M5 20.5h14"/>'),
  quests: SVG('<path d="M6 3.5h10.5a2 2 0 0 1 2 2V19a1.5 1.5 0 0 1-1.5 1.5H7.5A1.5 1.5 0 0 1 6 19z"/><path d="M9 8h6.5M9 11.5h6.5M9 15h4"/><path d="M4 3.5h2"/>'),
  rucksack: SVG('<path d="M8 7V5.5a4 4 0 0 1 8 0V7"/><rect x="5" y="7" width="14" height="13.5" rx="3"/><path d="M8.5 13h7v4h-7z"/>'),
  spieler: SVG('<circle cx="9" cy="8" r="3.2"/><path d="M3 19.5c0-3.6 2.7-6.2 6-6.2s6 2.6 6 6.2"/><circle cx="16.6" cy="7.4" r="2.6"/><path d="M15.4 12.7c3.1-.5 5.8 1.9 5.8 5.6"/>'),
  held: SVG('<path d="M5 19 15.5 8.5M14 5l5 5M12.5 6.5l5 5M6.5 15.5l2 2M4 20l2-2"/>'),
  ausruestung: SVG('<path d="M12 3 5 6v5.5c0 4.4 3 7.8 7 9.5 4-1.7 7-5.1 7-9.5V6z"/><path d="M12 8v8M9 11h6"/>'),
};
export interface RKnopf { name: string; zeichen: keyof typeof RZEICHEN; tat: () => void; taste?: string }

/* ---------- Runde Minikarte ---------- */
let zoomK = 2.4, knoepfeJetzt: RKnopf[] = [];
/** Die Minikarte rund machen (einmal je Seite) und die Knöpfe darunter setzen. zoom: wie viele Kartenbreiten der Kreis zeigt (Kehrwert) */
export function rundeKarte(zoom: number, knoepfe: RKnopf[]): void {
  const r = $("#ez-kartenrahmen"), k = $("#ez-karte"); if (!r || !k) return; zoomK = zoom; knoepfeJetzt = knoepfe; r.classList.add("rund-an");
  let rund = r.querySelector(".rund") as HTMLElement | null; if (!rund) { rund = document.createElement("div"); rund.className = "rund"; r.insertBefore(rund, r.firstChild); rund.appendChild(k); }
  k.style.setProperty("--zk", String(zoom));
  let leiste = r.querySelector(".rknoepfe") as HTMLElement | null; if (!leiste) { leiste = document.createElement("div"); leiste.className = "rknoepfe"; r.appendChild(leiste);
    leiste.onpointerdown = (e) => e.stopPropagation(); leiste.onclick = (e) => { e.stopPropagation(); const b = (e.target as HTMLElement).closest("[data-i]") as HTMLElement | null; if (b) knoepfeJetzt[Number(b.dataset.i)].tat(); }; }
  /* Halbmond-Dock links an der Karte: die Knöpfe sitzen auf dem Bogen (Lage aus der Form berechnet, siehe dock()) */
  const D = dock(knoepfe.length);
  leiste.innerHTML = D.svg + knoepfe.map((b, i) => `<button type="button" data-i="${i}" aria-label="${b.name}" title="${b.name}${b.taste ? ` (${b.taste})` : ""}" style="left:${D.lage[i][0].toFixed(2)}%;top:${D.lage[i][1].toFixed(2)}%"><span>${RZEICHEN[b.zeichen]}</span><small>${b.name}</small></button>`).join("");
  /* Zier am Kartenring: Goldring und blaue Rauten links und rechts */
  if (!r.querySelector(".ring")) { const ring = document.createElement("i"); ring.className = "ring"; rund.after(ring);
    for (const seite of ["l", "r"]) { const ra = document.createElement("i"); ra.className = "raute " + seite; r.appendChild(ra); } }
  rund.onpointerdown = (e) => e.stopPropagation();
}
/** Das Halbmond-Dock als SVG und die Lage seiner Knöpfe (in Prozent der Dock-Fläche).
    Maße in Einheiten des Kartenradius (100): Kartenmitte (0, 0), die Fläche reicht von x −200 bis 0 und y −120 bis 120.
    Innen folgt der Bogen dem Kartenring, außen ein weiterer Kreis durch die beiden Spitzen und den äußersten Punkt links. */
function dock(n: number): { svg: string; lage: number[][] } {
  const ri = 106, links = 196, spitze = 100 * Math.PI / 180;
  const px = ri * Math.cos(spitze), py = ri * Math.sin(spitze), sag = links + px, /* px ist negativ */ rho = (py * py + sag * sag) / (2 * sag), cx = -links + rho;
  const weg = `M${px.toFixed(1)} ${(-py).toFixed(1)}A${rho.toFixed(1)} ${rho.toFixed(1)} 0 1 0 ${px.toFixed(1)} ${py.toFixed(1)}A${ri} ${ri} 0 0 1 ${px.toFixed(1)} ${(-py).toFixed(1)}Z`;
  const schritt = n <= 3 ? 40 : n === 4 ? 32 : 26, lage: number[][] = [];
  for (let i = 0; i < n; i++) { const g = (180 + (i - (n - 1) / 2) * schritt) * Math.PI / 180, ux = Math.cos(g), uy = Math.sin(g);
    const b = ux * cx, t = b + Math.sqrt(b * b - (cx * cx - rho * rho)), m = (ri + t) / 2 + 2; /* Mitte zwischen Kartenring und Außenbogen */
    lage.push([(ux * m + 200) / 200 * 100, (uy * m + 120) / 240 * 100]); }
  const svg = `<svg class="dock" viewBox="-200 -120 200 240" aria-hidden="true"><defs><linearGradient id="dgold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6dd92"/><stop offset=".35" stop-color="#b98a35"/><stop offset=".6" stop-color="#f0cf7a"/><stop offset="1" stop-color="#7a5420"/></linearGradient>
    <radialGradient id="dgrund" cx="-60" cy="0" r="150" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2b2116"/><stop offset="1" stop-color="#0d0a06"/></radialGradient></defs>
    <path d="${weg}" fill="url(#dgrund)" stroke="#000" stroke-width="9" stroke-linejoin="round" opacity=".85"/><path d="${weg}" fill="url(#dgrund)" stroke="url(#dgold)" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="${weg}" fill="none" stroke="#3a2a12" stroke-width="1.2" transform="translate(-6 0) scale(.955)" opacity=".9"/></svg>`;
  return { svg, lage };
}
/** Wie groß die Karte im Kreis erscheint (Kartenbreiten je Kreisbreite) – je Region, damit der Kreis immer etwa gleich viel Umgebung zeigt */
export function karteZoom(zoom: number): void { zoomK = zoom; const k = document.getElementById("ez-karte"); if (k) k.style.setProperty("--zk", String(zoom)); window.dispatchEvent(new Event("ez-kartenzoom")); }
/** Die Karte so schieben, dass der Held (fx, fy: Anteil 0…1 der Kartenbreite und -höhe) in der Mitte des Kreises steht */
export function karteFolgen(fx: number, fy: number): void {
  const k = document.getElementById("ez-karte"), rund = k && k.parentElement; if (!k || !rund || !rund.classList.contains("rund")) return;
  const R = rund.clientWidth, w = k.offsetWidth, h = k.offsetHeight; if (!R || !w) return;
  const x = R / 2 - fx * w, y = R / 2 - fy * h; /* der eigene Held steht immer genau in der Mitte – am Rand der Karte zeigt der Kreis dahinter Dunkel */
  k.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
}
/** Tastenkürzel der Knöpfe unter der Karte und für Rucksack/Ausrüstung (nicht beim Tippen) */
let tastenDa = false;
export function rahmenTasten(extra: Record<string, () => void>): void { tastenExtra = extra; if (tastenDa) return; tastenDa = true;
  window.addEventListener("keydown", (e) => { if (e.repeat || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.ctrlKey || e.metaKey || e.altKey) return; const k = e.key.toLowerCase();
    const b = knoepfeJetzt.find((x) => x.taste && x.taste.toLowerCase() === k); if (b) { b.tat(); return; } if (tastenExtra[k]) tastenExtra[k](); }); }
let tastenExtra: Record<string, () => void> = {};

/* ---------- Tafeln ---------- */
function tafel(klasse: string, inhalt: string, zu: () => void): HTMLElement {
  const f = $("#ez-konto"); f.hidden = false;
  const schliessen = () => { removeEventListener("keydown", esc, true); f.hidden = true; f.innerHTML = ""; f.onclick = null; zu(); };
  const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); schliessen(); } }; addEventListener("keydown", esc, true);
  f.innerHTML = `<div class="tafel ${klasse}"><i class="ecke a"></i><i class="ecke b"></i><i class="ecke c"></i><i class="ecke d"></i><button type="button" class="schliessen" data-t="zu" aria-label="Schließen">✕</button>${inhalt}</div>`;
  f.onpointerdown = (e) => e.stopPropagation(); f.onkeydown = (e) => e.stopPropagation(); f.onkeyup = (e) => e.stopPropagation();
  f.onclick = (e) => { if (e.target === f || (e.target as HTMLElement).closest('[data-t="zu"]')) schliessen(); };
  return f;
}
/** Rucksack und Ausrüstung: das Grundgerüst – die Plätze stehen, Gegenstände kommen mit dem Inventar */
export function taschenTafel(art: "rucksack" | "ausruestung", held: string, zu: () => void): void {
  const D = HELDEN[held] || HELDEN.schildwaechter, PLAETZE = ["Kopf", "Hals", "Schultern", "Brust", "Hände", "Gürtel", "Beine", "Füße", "Waffe", "Nebenhand", "Ring", "Ring"];
  const reiter = `<div class="treiter"><button type="button" data-a="ausruestung" class="${art === "ausruestung" ? "an" : ""}">Ausrüstung</button><button type="button" data-a="rucksack" class="${art === "rucksack" ? "an" : ""}">Rucksack</button></div>`;
  const inhalt = art === "rucksack"
    ? `<h2>Rucksack</h2><div class="zier"></div>${reiter}<div class="faecher">${Array.from({ length: 24 }, () => "<i></i>").join("")}</div><p class="klein">Noch leer – Gegenstände und Beute kommen mit dem Inventar.</p>`
    : `<h2>Ausrüstung</h2><div class="zier"></div>${reiter}<div class="puppe"><div class="plaetze l">${PLAETZE.slice(0, 6).map((p) => `<i title="${p}"><small>${p}</small></i>`).join("")}</div>
       <img src="../${D.bild}" alt="${D.name}"><div class="plaetze r">${PLAETZE.slice(6).map((p) => `<i title="${p}"><small>${p}</small></i>`).join("")}</div></div><p class="klein">${D.name} · ${D.klasse}. Ausrüstung kommt mit dem Inventar.</p>`;
  const f = tafel("taschen", inhalt, zu);
  f.querySelectorAll<HTMLElement>(".treiter [data-a]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); const a = b.dataset.a as "rucksack" | "ausruestung"; if (a !== art) { f.hidden = true; f.innerHTML = ""; taschenTafel(a, held, zu); } }));
}
/** Alle Quests auf einen Blick: je Kampagne der nächste Schritt und die Sterne */
/** Laden eines Händlers (24.11.2026): Sortiment mit Seltenheit und Preis in Seelensplittern, dazu der eigene Splitter-Stand.
    Kaufen prüft den Stand; das eigentliche Kaufen (Splitter abziehen, Gegenstand in den Rucksack) kommt mit dem Inventar auf dem Server. */
const WARENBILD: Record<string, string> = {
  beil: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M30 6l3 3-17 31-4-2z" fill="#8a5a32"/><path d="M27 7c6-3 14 0 17 7-5 1-10 1-14-2l-3-5z" fill="currentColor"/><path d="M27 7l3 5" stroke="#00000055" stroke-width="1.5"/></svg>',
  spitzhacke: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M25 12l3 2-14 28-4-2z" fill="#8a5a32"/><path d="M8 14c8-8 22-10 34-4-1 2-2 3-3 3-10-4-20-3-28 3z" fill="currentColor"/></svg>',
  hammer: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 18l4 0 0 26-4 0z" fill="#8a5a32"/><rect x="12" y="8" width="24" height="11" rx="2" fill="currentColor"/></svg>' };
export function ladenTafel(laden: { name: string; haendler: string; gruss: string; waren: { id: string; name: string; art: string; seltenheit: string; preis: number; text: string }[] }, zu: () => void): void {
  let splitter = 0; try { splitter = Number(localStorage.getItem("ez_seelen")) || 0; } catch { /* privat */ }
  if (!document.getElementById("ez-laden-stil")) { const st = document.createElement("style"); st.id = "ez-laden-stil"; st.textContent = `
#ez-konto .tafel.laden { width: min(620px, 100%); text-align: left; }
#ez-konto .laden .gruss { margin: 8px 0 12px; font-style: italic; color: #d9c9a2; text-align: center; }
#ez-konto .laden .stand { display: flex; justify-content: center; align-items: center; gap: 8px; margin-bottom: 10px; font: 600 15px Cinzel, Georgia, serif; color: #f0d48a; }
#ez-konto .laden .stand em { font-style: normal; color: #8fc6ff; }
#ez-konto .laden ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
#ez-konto .laden li { display: grid; grid-template-columns: 52px minmax(0, 1fr) auto; gap: 12px; align-items: center; padding: 8px 10px; border: 1px solid #5d4a2e; border-radius: 8px; background: rgba(0,0,0,.28); }
#ez-konto .laden li .bild { width: 52px; height: 52px; display: grid; place-items: center; border-radius: 8px; border: 2px solid #9a9a9a; background: radial-gradient(#2b2a2a, #141313); color: #cfd3d8; }
#ez-konto .laden li.selten .bild { border-color: #4f8fe8; box-shadow: 0 0 10px rgba(79,143,232,.5); color: #b9d4ff; }
#ez-konto .laden li .bild svg { width: 40px; height: 40px; }
#ez-konto .laden li b { display: block; font: 600 16px Cinzel, Georgia, serif; color: #efe2c4; } #ez-konto .laden li.selten b { color: #8fc6ff; }
#ez-konto .laden li small { display: block; color: #a8966a; } #ez-konto .laden li .art { font: 600 11px Inter, sans-serif; letter-spacing: .08em; text-transform: uppercase; color: #9a9a9a; } #ez-konto .laden li.selten .art { color: #4f8fe8; }
#ez-konto .laden li .kauf { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
#ez-konto .laden li .preis { font: 600 16px Cinzel, Georgia, serif; color: #f0d48a; white-space: nowrap; } #ez-konto .laden li .preis.zuwenig { color: #d9776a; }
#ez-konto .laden li button { font: 600 13px Cinzel, Georgia, serif; letter-spacing: .05em; padding: 6px 14px; border-radius: 6px; border: 1px solid #d6b066; background: linear-gradient(#4b2a78, #2c1748); color: #efe2c4; cursor: pointer; }
#ez-konto .laden li button:disabled { opacity: .5; cursor: default; } #ez-konto .laden .meldung { min-height: 1.4em; margin: 10px 0 0; text-align: center; color: #d9c9a2; }`; document.head.appendChild(st); }
  const zeile = (w: { id: string; name: string; art: string; seltenheit: string; preis: number; text: string }) => `<li class="${w.seltenheit}"><span class="bild">${WARENBILD[w.art] || ""}</span>
    <span><b>${w.name}</b><span class="art">${w.seltenheit === "selten" ? "Selten" : "Einfach"}</span><small>${w.text}</small></span>
    <span class="kauf"><span class="preis${splitter < w.preis ? " zuwenig" : ""}">◈ ${w.preis}</span><button type="button" data-kauf="${w.id}"${splitter < w.preis ? " disabled" : ""}>Kaufen</button></span></li>`;
  const f = tafel("laden", `<h2>${laden.name}</h2><div class="zier"></div><p class="gruss">${laden.haendler}: „${laden.gruss}“</p>
    <p class="stand">Deine Splitter: <em>◈ ${splitter}</em></p><ul>${laden.waren.map(zeile).join("")}</ul><p class="meldung" role="status"></p>
    <p class="klein">Preise in Seelensplittern. Gekaufte Werkzeuge landen im Rucksack, sobald das Inventar da ist.</p>`, zu);
  f.querySelectorAll<HTMLButtonElement>("[data-kauf]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); const w = laden.waren.find((q) => q.id === b.dataset.kauf); if (!w) return;
    (f.querySelector(".meldung") as HTMLElement).textContent = `„${w.name}“ für ◈ ${w.preis}: Kaufen wird freigeschaltet, sobald der Rucksack Gegenstände speichert.`; }));
}

export function questTafel(zu: () => void): void {
  const zeilen = Object.entries(QUESTS).map(([ort, Q]) => { const m = merkerVon(ort), offen = Q.haupt.find((s) => !m[s.fertig]), begonnen = Object.keys(m).length > 0;
    return `<li class="${offen ? "" : "fertig"}"><b>${Q.titel}</b><small>${Q.ort} · Stufe ${Q.stufe} · <span class="sterne">${sternText(ort)}</span></small><span>${!begonnen ? "Noch nicht begonnen – über die Weltkarte aufbrechen" : offen ? "Als Nächstes: " + offen.text : "Abgeschlossen"}</span></li>`; }).join("");
  tafel("quests", `<h2>Quests</h2><div class="zier"></div><ul class="qliste">${zeilen}</ul><p class="klein">Die Schritte im Einzelnen siehst du im jeweiligen Dorf.</p>`, zu);
}
