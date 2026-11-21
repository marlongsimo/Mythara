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
  leiste.innerHTML = knoepfe.map((b, i) => `<button type="button" data-i="${i}" aria-label="${b.name}" title="${b.name}${b.taste ? ` (${b.taste})` : ""}"><span>${RZEICHEN[b.zeichen]}</span><small>${b.name}</small></button>`).join("");
  rund.onpointerdown = (e) => e.stopPropagation();
}
/** Wie groß die Karte im Kreis erscheint (Kartenbreiten je Kreisbreite) – je Region, damit der Kreis immer etwa gleich viel Umgebung zeigt */
export function karteZoom(zoom: number): void { zoomK = zoom; const k = document.getElementById("ez-karte"); if (k) k.style.setProperty("--zk", String(zoom)); }
/** Die Karte so schieben, dass der Held (fx, fy: Anteil 0…1 der Kartenbreite und -höhe) in der Mitte des Kreises steht */
export function karteFolgen(fx: number, fy: number): void {
  const k = document.getElementById("ez-karte"), rund = k && k.parentElement; if (!k || !rund || !rund.classList.contains("rund")) return;
  const R = rund.clientWidth, w = k.offsetWidth, h = k.offsetHeight; if (!R || !w) return;
  const x = Math.max(R - w, Math.min(0, R / 2 - fx * w)), y = h > R ? Math.max(R - h, Math.min(0, R / 2 - fy * h)) : (R - h) / 2; /* am Rand nicht ins Leere schieben */
  k.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
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
export function questTafel(zu: () => void): void {
  const zeilen = Object.entries(QUESTS).map(([ort, Q]) => { const m = merkerVon(ort), offen = Q.haupt.find((s) => !m[s.fertig]), begonnen = Object.keys(m).length > 0;
    return `<li class="${offen ? "" : "fertig"}"><b>${Q.titel}</b><small>${Q.ort} · Stufe ${Q.stufe} · <span class="sterne">${sternText(ort)}</span></small><span>${!begonnen ? "Noch nicht begonnen – über die Weltkarte aufbrechen" : offen ? "Als Nächstes: " + offen.text : "Abgeschlossen"}</span></li>`; }).join("");
  tafel("quests", `<h2>Quests</h2><div class="zier"></div><ul class="qliste">${zeilen}</ul><p class="klein">Die Schritte im Einzelnen siehst du im jeweiligen Dorf.</p>`, zu);
}
