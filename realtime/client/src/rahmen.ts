/*
 * Der gemeinsame Spielrahmen (MMO-Oberfläche) für Waldmark, Dörfer und Kämpfe:
 * oben rechts die runde Minikarte, die dem Helden folgt, darunter Weltkarte · Teleport · Quests;
 * Rucksack und Ausrüstung als Tafeln (noch ohne Gegenstände – das Grundgerüst für das kommende Inventar).
 * Unten rechts liegen im Kampf die Aktionen 1–4 (links läuft man mit dem Steuerknüppel), unten in der Mitte der Chat (welt.ts).
 */
import { QUESTS, merkerVon, sternText } from "./hud";
import { HELDEN } from "../../shared/config";
import { GEGENSTAENDE, PLAETZE, Platz, RUCKSACK_PLAETZE } from "../../shared/gegenstaende";
import { aktiverHeld, gegenstandBild } from "./held";
import { inventar, ablegen, anlegen } from "./inventar";

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
export function karteZoom(zoom: number): void { zoomK = zoom; const k = document.getElementById("ez-karte"); if (k) k.style.setProperty("--zk", String(zoom)); }
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
/* ---------- Ausrüstung und Rucksack des eigenen Helden ---------- */
const PLATZBILD: Record<Platz, string> = {
  amulett: SVG('<path d="M6 3c0 4 2.7 7 6 8 3.3-1 6-4 6-8"/><path d="M12 13.5 15 17l-3 4-3-4z"/><circle cx="12" cy="11.5" r="1.2"/>'), waffe: SVG('<path d="M5 19 15.5 8.5M14 5l5 5M12.5 6.5l5 5M6.5 15.5l2 2M4 20l2-2"/>'),
  brust: SVG('<path d="M8 4 4 7l2 4 2-1v10h8V10l2 1 2-4-4-3c-1 1.5-2.4 2-4 2s-3-.5-4-2z"/>'), nebenhand: SVG('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5"/>'),
};
function eigeneTasche(art: "rucksack" | "ausruestung", zu: () => void): void {
  const inv = inventar(), feld = (g: string | undefined, wo: string, platz?: Platz) => `<button type="button" class="ifeld${g ? " voll" : ""}" data-wo="${wo}"${g ? ` data-g="${g}"` : ""} aria-label="${g ? GEGENSTAENDE[g].name : platz ? PLAETZE.find((p) => p.id === platz)!.name + " (leer)" : "leer"}">
      ${g ? `<canvas width="120" height="120" data-bild="${g}"></canvas>` : platz ? `<span class="leer">${PLATZBILD[platz]}</span>` : ""}${platz ? `<small>${PLAETZE.find((p) => p.id === platz)!.name}</small>` : ""}</button>`;
  const reiter = `<div class="treiter"><button type="button" data-a="ausruestung" class="${art === "ausruestung" ? "an" : ""}">Ausrüstung</button><button type="button" data-a="rucksack" class="${art === "rucksack" ? "an" : ""}">Rucksack</button></div>`;
  const inhalt = art === "ausruestung"
    ? `<h2>Ausrüstung</h2><div class="zier"></div>${reiter}<div class="iplaetze"><div class="p-amulett">${feld(inv.angelegt.amulett, "amulett", "amulett")}</div><div class="p-waffe">${feld(inv.angelegt.waffe, "waffe", "waffe")}</div>
       <div class="p-brust">${feld(inv.angelegt.brust, "brust", "brust")}</div><div class="p-nebenhand">${feld(inv.angelegt.nebenhand, "nebenhand", "nebenhand")}</div></div><p class="klein">Tippe auf einen Gegenstand: untersuchen oder ablegen.</p>`
    : `<h2>Rucksack</h2><div class="zier"></div>${reiter}<div class="faecher">${Array.from({ length: RUCKSACK_PLAETZE }, (_, i) => feld(inv.rucksack[i], "r" + i)).join("")}</div><p class="klein">${inv.rucksack.length ? "Tippe auf einen Gegenstand: untersuchen oder anlegen." : "Leer – abgelegte Ausrüstung und Beute landen hier."}</p>`;
  const f = tafel("taschen eigen", inhalt + `<div class="iwahl" hidden></div>`, zu);
  f.querySelectorAll<HTMLCanvasElement>("canvas[data-bild]").forEach((c) => { const G = GEGENSTAENDE[c.dataset.bild!]; void gegenstandBild(c, G.ebenen, G.platz === "brust"); });
  const neu = (a: "rucksack" | "ausruestung") => { f.hidden = true; f.innerHTML = ""; eigeneTasche(a, zu); };
  f.querySelectorAll<HTMLElement>(".treiter [data-a]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); const a = b.dataset.a as "rucksack" | "ausruestung"; if (a !== art) neu(a); }));
  const wahl = f.querySelector(".iwahl") as HTMLElement;
  f.querySelectorAll<HTMLElement>(".ifeld.voll").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); const g = b.dataset.g!, G = GEGENSTAENDE[g], angelegt = !b.dataset.wo!.startsWith("r");
    f.querySelectorAll(".ifeld").forEach((x) => x.classList.toggle("gewaehlt", x === b));
    wahl.hidden = false; wahl.innerHTML = `<b>${G.name}</b><div class="reihe"><button type="button" data-t="untersuchen">Untersuchen</button><button type="button" class="haupt" data-t="${angelegt ? "ablegen" : "anlegen"}">${angelegt ? "Ablegen" : "Anlegen"}</button></div>`;
    wahl.onclick = (ev) => { ev.stopPropagation(); const t = (ev.target as HTMLElement).closest<HTMLElement>("[data-t]")?.dataset.t; if (!t) return;
      if (t === "untersuchen") untersuchen(g, () => neu(art));
      else if (t === "ablegen") { if (!ablegen(G.platz)) { wahl.innerHTML = `<b>Der Rucksack ist voll.</b>`; return; } neu(art); }
      else if (t === "anlegen") { anlegen(g); neu(art); } }; }));
}
/** Untersuchen: die Werte eines Gegenstands */
function untersuchen(g: string, zurueck: () => void): void {
  const G = GEGENSTAENDE[g], f = $("#ez-konto"); f.hidden = true; f.innerHTML = "";
  const t = tafel("taschen eigen untersuchen", `<h2>${G.name}</h2><div class="zier"></div><p class="iart">${G.art} · ${PLAETZE.find((p) => p.id === G.platz)!.name}</p>
    <canvas class="igross" width="220" height="220" data-bild="${g}"></canvas><dl class="iwerte">${G.werte.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>
    <p class="klein">${G.text}</p><div class="reihe"><button type="button" class="haupt" data-t="zurueck">Zurück</button></div>`, () => { /* schließen */ });
  void gegenstandBild(t.querySelector("canvas") as HTMLCanvasElement, G.ebenen, G.platz === "brust");
  (t.querySelector('[data-t="zurueck"]') as HTMLElement).addEventListener("click", (e) => { e.stopPropagation(); t.hidden = true; t.innerHTML = ""; zurueck(); });
}
/** Rucksack und Ausrüstung: mit eigenem Helden das echte Inventar, sonst (Kampagnen ohne eigenen Helden) das bisherige Grundgerüst */
export function taschenTafel(art: "rucksack" | "ausruestung", held: string, zu: () => void): void {
  if (aktiverHeld()) { eigeneTasche(art, zu); return; }
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
