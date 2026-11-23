/*
 * Der gemeinsame Spielrahmen (MMO-Oberfläche) für Waldmark, Dörfer und Kämpfe:
 * oben rechts die runde Minikarte, die dem Helden folgt, darunter Weltkarte · Teleport · Quests;
 * Rucksack und Ausrüstung als Tafeln (noch ohne Gegenstände – das Grundgerüst für das kommende Inventar).
 * Unten rechts liegen im Kampf die Aktionen 1–4 (links läuft man mit dem Steuerknüppel), unten in der Mitte der Chat (welt.ts).
 */
import { questStand, questVerfolgt, questVerfolgen } from "./welt";
import { freundeHtml, freundKlick, freundFormular, freundeBeobachten } from "./freunde";
import { aktionsMenue, langDruecken, Aktion } from "./aktionsmenue";
import { chatSystem, tafelZeigen } from "./welt";
import { QUESTLOG } from "../../shared/quest01";
import { QUESTS, merkerVon, sternText } from "./hud";
import { HELDEN } from "../../shared/config";
import { GEGENSTAENDE, PLAETZE, Platz, RUCKSACK_PLAETZE, werteVon, SELTENHEITEN } from "../../shared/gegenstaende";
import { aktiverHeld, gegenstandBild } from "./held";
import { teilBild, TEIL_3D } from "./welt3d/teilbild";
/** Bild eines Gegenstands: Rüstungen und Helme aus ihrem 3D-Teil, Waffen und Schilde aus den 2D-Ebenen */
async function dingBild(c: HTMLCanvasElement, G: { ebenen?: string[]; platz?: string }): Promise<void> {
  const id = (G.ebenen || [])[0], h = aktiverHeld(); if (id && TEIL_3D.test(id) && (await teilBild(c, h ? h.aussehen.g : "mann", id))) return;
  await gegenstandBild(c, G.ebenen, G.platz === "brust" || G.platz === "beine" || G.platz === "kopf"); }
import { inventar, ablegen, anlegen, fallenLassen, inventarAmServer } from "./inventar";
import { kampfwerte, STILE, SKILLS, SKILL_NAME, TICK, heldenlevel, Skill } from "../../shared/kampfwerte";
import { skillsLesen, stilLesen, stilSetzen, kampfartJetzt, skillStand, autoLesen, autoSetzen, SKILL_ZEICHEN } from "./skills";

const $ = (s: string) => document.querySelector(s) as HTMLElement;
const SVG = (inhalt: string) => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${inhalt}</svg>`;
/** Gemalte Symbole (img/echtzeit/leiste/<zeichen>.webp, mit eigenem Goldring) – wo vorhanden, statt des gezeichneten Zeichens */
export const RBILD = new Set(["karte", "sprint", "teleport", "spieler", "einstellungen"]);
export const rbild = (zeichen: string): string => `<img class="rbild" src="../img/echtzeit/leiste/${zeichen}.webp" alt="" draggable="false">`;
export const RZEICHEN = {
  karte: SVG('<path d="M3 6.2 9 4l6 2.2L21 4v13.8L15 20l-6-2.2L3 20z"/><path d="M9 4v13.8M15 6.2V20"/>'),
  teleport: SVG('<path d="M12 3c3.3 3 5 5.8 5 8.5a5 5 0 0 1-10 0C7 8.8 8.7 6 12 3z"/><path d="M12 9.5v6M9.5 13 12 15.5 14.5 13"/><path d="M5 20.5h14"/>'),
  quests: SVG('<path d="M6 3.5h10.5a2 2 0 0 1 2 2V19a1.5 1.5 0 0 1-1.5 1.5H7.5A1.5 1.5 0 0 1 6 19z"/><path d="M9 8h6.5M9 11.5h6.5M9 15h4"/><path d="M4 3.5h2"/>'),
  rucksack: SVG('<path d="M8 7V5.5a4 4 0 0 1 8 0V7"/><rect x="5" y="7" width="14" height="13.5" rx="3"/><path d="M8.5 13h7v4h-7z"/>'),
  spieler: SVG('<circle cx="9" cy="8" r="3.2"/><path d="M3 19.5c0-3.6 2.7-6.2 6-6.2s6 2.6 6 6.2"/><circle cx="16.6" cy="7.4" r="2.6"/><path d="M15.4 12.7c3.1-.5 5.8 1.9 5.8 5.6"/>'),
  held: SVG('<path d="M5 19 15.5 8.5M14 5l5 5M12.5 6.5l5 5M6.5 15.5l2 2M4 20l2-2"/>'),
  ausruestung: SVG('<path d="M12 3 5 6v5.5c0 4.4 3 7.8 7 9.5 4-1.7 7-5.1 7-9.5V6z"/><path d="M12 8v8M9 11h6"/>'),
  /* gekreuzte Schwerter (Angriffsstil) */
  schwerter: SVG('<path d="M4 4l10.5 10.5M4 4h3.2l9 9M4 4v3.2l9 9"/><path d="M20 4 9.5 14.5M20 4h-3.2l-3.4 3.4M20 4v3.2l-3.4 3.4"/><path d="M12.6 16.4 16.4 12.6M15.4 18.4l3-3M17.6 17.6 20 20"/><path d="M11.4 16.4 7.6 12.6M8.6 18.4l-3-3M6.4 17.6 4 20"/>'),
  /* Schriftrolle mit Ausrufezeichen (Quests) */
  quest: SVG('<path d="M7 4h10.5a2 2 0 0 1 0 4H17v10.5a2 2 0 0 1-2 2H6.5a2 2 0 0 1 0-4H7z"/><path d="M7 16.5V4M15.5 4a2 2 0 0 0-2 2"/><path d="M12 9v4.2"/><circle cx="12" cy="15.6" r=".6" fill="currentColor"/>'),
  /* Stern mit Aufstieg (Skills) */
  skills: SVG('<path d="m12 3.5 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.9l-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z"/><path d="M12 20.5v0"/>'),
  /* laufender Stiefel mit Fahrtlinien (Sprint) */
  sprint: SVG('<path d="M9 5.5h4l.6 5.2 4.8 2.3a2 2 0 0 1 1.1 1.8V17H8.5z"/><path d="M8.5 17h11M13 7.6h-2.4M13.3 9.8h-2.6"/><path d="M2.5 10h4M3.5 13h3.5M2.5 16h4"/>'),
  einstellungen: SVG('<circle cx="12" cy="12" r="3"/><path d="M12 2.6v2.6M12 18.8v2.6M2.6 12h2.6M18.8 12h2.6M5.4 5.4l1.8 1.8M16.8 16.8l1.8 1.8M5.4 18.6l1.8-1.8M16.8 7.2l1.8-1.8"/><circle cx="12" cy="12" r="6.6"/>'),
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
  leiste.innerHTML = D.svg + knoepfe.map((b, i) => `<button type="button" data-i="${i}" aria-label="${b.name}" title="${b.name}${b.taste ? ` (${b.taste})` : ""}" style="left:${D.lage[i][0].toFixed(2)}%;top:${D.lage[i][1].toFixed(2)}%"><span${RBILD.has(b.zeichen) ? ` class="mitbild"` : ""}>${RBILD.has(b.zeichen) ? rbild(b.zeichen) : RZEICHEN[b.zeichen]}</span><small>${b.name}</small></button>`).join("");
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
  k.style.transformOrigin = `${(fx * w).toFixed(1)}px ${(fy * h).toFixed(1)}px`; /* gedreht wird um den Helden (3D-Welt: mit der Kamera) */
  k.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)` + (drehung ? ` rotate(${drehung.toFixed(4)}rad)` : "");
  const nord = rund.parentElement && rund.parentElement.querySelector(".nord") as HTMLElement | null; /* das N wandert am Ring mit und zeigt nach Norden */
  if (nord) { if (!drehung) { if (nordVersatz.x || nordVersatz.y) { nord.style.transform = ""; nordVersatz = { x: 0, y: 0 }; } }
    else { const n = nord.getBoundingClientRect(), r = rund.getBoundingClientRect(), bx = n.left + n.width / 2 - nordVersatz.x, by = n.top + n.height / 2 - nordVersatz.y; /* Lage ohne Verschiebung */
      const zx = r.left + r.width / 2 + Math.sin(drehung) * (R / 2 + 4), zy = r.top + r.height / 2 - Math.cos(drehung) * (R / 2 + 4); nordVersatz = { x: zx - bx, y: zy - by };
      nord.style.transform = `translate(${nordVersatz.x.toFixed(1)}px, ${nordVersatz.y.toFixed(1)}px)`; } }
}
/** 3D-Welt: Drehung der Minikarte (Bogenmaß, im Uhrzeigersinn) – oben ist die Blickrichtung der Kamera */
let drehung = 0, nordVersatz = { x: 0, y: 0 };
export function karteDrehen(rad: number): void { drehung = rad; }
/** Tastenkürzel der Knöpfe unter der Karte und für Rucksack/Ausrüstung (nicht beim Tippen) */
let tastenDa = false;
export function rahmenTasten(extra: Record<string, () => void>): void { tastenExtra = extra; if (tastenDa) return; tastenDa = true;
  window.addEventListener("keydown", (e) => { if (e.repeat || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.ctrlKey || e.metaKey || e.altKey) return; const k = e.key.toLowerCase();
    const b = knoepfeJetzt.find((x) => x.taste && x.taste.toLowerCase() === k); if (b) { b.tat(); return; } if (tastenExtra[k]) tastenExtra[k](); }); }
let tastenExtra: Record<string, () => void> = {};

/* ---------- Tafeln ---------- */
let altesEsc: ((e: KeyboardEvent) => void) | null = null;
function tafel(klasse: string, inhalt: string, zu: () => void): HTMLElement {
  const f = $("#ez-konto"); f.hidden = false; if (altesEsc) removeEventListener("keydown", altesEsc, true); /* eine Tafel ersetzt die vorige: deren Esc-Taste nicht mehr */
  const schliessen = () => { removeEventListener("keydown", esc, true); if (altesEsc === esc) altesEsc = null; f.hidden = true; f.innerHTML = ""; f.onclick = null; zu(); };
  const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); schliessen(); } }; addEventListener("keydown", esc, true); altesEsc = esc;
  f.innerHTML = `<div class="tafel ${klasse}"><i class="ecke a"></i><i class="ecke b"></i><i class="ecke c"></i><i class="ecke d"></i><button type="button" class="schliessen" data-t="zu" aria-label="Schließen">✕</button>${inhalt}</div>`;
  f.onpointerdown = (e) => e.stopPropagation(); f.onkeydown = (e) => e.stopPropagation(); f.onkeyup = (e) => e.stopPropagation();
  f.onclick = (e) => { if (e.target === f || (e.target as HTMLElement).closest('[data-t="zu"]')) schliessen(); };
  return f;
}
/* ---------- Ausrüstung und Rucksack des eigenen Helden ---------- */
const PLATZBILD: Record<Platz, string> = {
  kopf: SVG('<path d="M5 14c0-5 3-9 7-9s7 4 7 9v5h-4l-1-5h-4l-1 5H5z"/><path d="M9 10h6"/>'), beine: SVG('<path d="M7 3h10l1 7-2 11h-3l-1-9-1 9H8L6 10z"/>'),
  waffe: SVG('<path d="M5 19 15.5 8.5M14 5l5 5M12.5 6.5l5 5M6.5 15.5l2 2M4 20l2-2"/>'),
  brust: SVG('<path d="M8 4 4 7l2 4 2-1v10h8V10l2 1 2-4-4-3c-1 1.5-2.4 2-4 2s-3-.5-4-2z"/>'), nebenhand: SVG('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5"/>'),
};
function eigeneTasche(art: "rucksack" | "ausruestung", zu: () => void, ohneReiter = false): void {
  const inv = inventar(), menge = (wo: string) => (wo.startsWith("r") ? (inv.anzahl || [])[Number(wo.slice(1))] || 1 : 1), feld = (g: string | undefined, wo: string, platz?: Platz) => `<button type="button" class="ifeld${g ? " voll s-" + GEGENSTAENDE[g].seltenheit : ""}" data-wo="${wo}"${g ? ` data-g="${g}"` : ""} aria-label="${g ? GEGENSTAENDE[g].name : platz ? PLAETZE.find((p) => p.id === platz)!.name + " (leer)" : "leer"}">
      ${g ? `<canvas width="120" height="120" data-bild="${g}"></canvas>` : platz ? `<span class="leer">${PLATZBILD[platz]}</span>` : ""}${platz ? `<small>${PLAETZE.find((p) => p.id === platz)!.name}</small>` : ""}${g && menge(wo) > 1 ? `<em class="menge">${menge(wo)}</em>` : ""}</button>`;
  const reiter = ohneReiter ? "" : `<div class="treiter"><button type="button" data-a="ausruestung" class="${art === "ausruestung" ? "an" : ""}">Ausrüstung</button><button type="button" data-a="rucksack" class="${art === "rucksack" ? "an" : ""}">Rucksack</button></div>`;
  const inhalt = art === "ausruestung"
    ? `<h2>Ausrüstung</h2><div class="zier"></div>${reiter}<div class="iplaetze"><div class="p-kopf">${feld(inv.angelegt.kopf, "kopf", "kopf")}</div><div class="p-waffe">${feld(inv.angelegt.waffe, "waffe", "waffe")}</div>
       <div class="p-brust">${feld(inv.angelegt.brust, "brust", "brust")}</div><div class="p-nebenhand">${feld(inv.angelegt.nebenhand, "nebenhand", "nebenhand")}</div><div class="p-beine">${feld(inv.angelegt.beine, "beine", "beine")}</div></div><p class="klein">Tippe auf einen Gegenstand: untersuchen oder ablegen.</p>`
    : `<h2>Rucksack</h2><div class="zier"></div>${reiter}<div class="faecher">${Array.from({ length: RUCKSACK_PLAETZE }, (_, i) => feld(inv.rucksack[i], "r" + i)).join("")}</div><p class="klein">${inv.rucksack.length ? "Tippe auf einen Gegenstand: untersuchen oder anlegen." : "Leer – abgelegte Ausrüstung und Beute landen hier."}</p>`;
  const f = tafel("taschen eigen", inhalt + `<div class="iwahl" hidden></div>`, zu);
  f.querySelectorAll<HTMLCanvasElement>("canvas[data-bild]").forEach((c) => { const G = GEGENSTAENDE[c.dataset.bild!]; if (G.symbol) symbolMalen(c, G.symbol); else void dingBild(c, G); });
  const neu = (a: "rucksack" | "ausruestung") => { f.hidden = true; f.innerHTML = ""; eigeneTasche(a, zu, ohneReiter); };
  f.querySelectorAll<HTMLElement>(".treiter [data-a]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); const a = b.dataset.a as "rucksack" | "ausruestung"; if (a !== art) neu(a); }));
  const wahl = f.querySelector(".iwahl") as HTMLElement;
  /** neu zeichnen, sobald das geänderte Inventar da ist (vom Server oder sofort vom Gerät); zurück: abbrechen */
  const nachher = () => { let fertig = false; const g = () => { if (fertig) return; fertig = true; removeEventListener("ez-inventar", g); if (!f.hidden) neu(art); }; addEventListener("ez-inventar", g); const u = setTimeout(g, 2000); return () => { fertig = true; clearTimeout(u); removeEventListener("ez-inventar", g); }; };
  f.querySelectorAll<HTMLElement>(".ifeld.voll").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); const g = b.dataset.g!, G = GEGENSTAENDE[g], angelegt = !b.dataset.wo!.startsWith("r");
    f.querySelectorAll(".ifeld").forEach((x) => x.classList.toggle("gewaehlt", x === b));
    const fallen = !angelegt && inventarAmServer() ? `<button type="button" data-t="fallen">Fallen lassen</button>` : "", n = menge(b.dataset.wo!);
    const haupt = angelegt ? `<button type="button" class="haupt" data-t="ablegen">Ablegen</button>` : G.platz ? `<button type="button" class="haupt" data-t="anlegen">Anlegen</button>` : "";
    wahl.hidden = false; wahl.innerHTML = `<b>${G.name}${n > 1 ? " ×" + n : ""}</b><div class="reihe"><button type="button" data-t="untersuchen">Untersuchen</button>${fallen}${haupt}</div>`;
    wahl.onclick = (ev) => { ev.stopPropagation(); const t = (ev.target as HTMLElement).closest<HTMLElement>("[data-t]")?.dataset.t; if (!t) return;
      if (t === "untersuchen") untersuchen(g, () => neu(art), zu);
      else if (t === "ablegen" && G.platz) { const n = nachher(); if (!ablegen(G.platz)) { n(); wahl.innerHTML = `<b>Der Rucksack ist voll.</b>`; return; } }
      else if (t === "anlegen") { nachher(); anlegen(g); }
      else if (t === "fallen") { nachher(); fallenLassen(Number(b.dataset.wo!.slice(1))); } }; })); /* mit Server-Inventar kommt das neue Inventar gleich zurück */
}
/** Untersuchen: die Werte eines Gegenstands */
/** Aktionsmenü zu einem Gegenstand im Rucksack (wo = "r0" …) oder in der Ausrüstung (wo = Platz): Ausrüsten bzw. Ablegen zuerst, dann Untersuchen, Fallen lassen */
/** Aktionen eines Gegenstands im Tab; die erste führt kurzes Antippen aus */
function dingAktionen(wo: string, g: string): { kopf: string; farbe?: string; a: Aktion[] } | null {
  const G = GEGENSTAENDE[g]; if (!G) return null; const imRucksack = wo.startsWith("r"), n = imRucksack ? (inventar().anzahl || [])[Number(wo.slice(1))] || 1 : 1, a: Aktion[] = [];
  if (!imRucksack && G.platz) a.push({ text: "Ablegen", sym: "⤵️", tat: () => { if (!ablegen(G.platz!)) chatSystem("Der Rucksack ist voll."); } });
  if (imRucksack && G.platz) a.push({ text: "Ausrüsten", sym: "🛡️", tat: () => anlegen(g) });
  a.push({ text: "Untersuchen", sym: "🔍", tat: () => untersuchen(g, () => { /* zurück */ }, () => { /* zu */ }) });
  if (imRucksack && inventarAmServer()) a.push({ text: "Fallen lassen", sym: "⬇️", tat: () => fallenLassen(Number(wo.slice(1))) });
  return { kopf: G.name + (n > 1 ? ` ×${n}` : ""), farbe: SELTENHEITEN[G.seltenheit] ? SELTENHEITEN[G.seltenheit].farbe : undefined, a }; }
function dingMenue(wo: string, g: string, px: number, py: number): void { const d = dingAktionen(wo, g); if (d) aktionsMenue(px, py, [{ kopf: d.kopf, farbe: d.farbe, aktionen: d.a }]); }
/** Infoblatt zu einem Skill (in der Bildschirmmitte): wofür er gut ist, wie man XP bekommt, Stand */
const SKILL_INFO: Record<Skill, { wofuer: string; xp: string }> = {
  geschick: { wofuer: "Wie oft du im Nahkampf triffst (Trefferwert = Geschick + Stilbonus + Geschick-Bonus der Ausrüstung). Beim Sprinten: wie lange die Ausdauer reicht und wie schnell sie zurückkommt.", xp: "Nahkampf im Stil Akkurat: 4 XP je abgezogenem Lebenspunkt. Im Stil Ausgewogen: 1,33 XP." },
  staerke: { wofuer: "Wie hart du im Nahkampf zuschlägst: dein höchster Schaden (Max Hit) steigt mit der Stärke und dem Stärke-Bonus der gesamten Ausrüstung.", xp: "Nahkampf im Stil Aggressiv: 4 XP je abgezogenem Lebenspunkt. Im Stil Ausgewogen: 1,33 XP." },
  fernkampf: { wofuer: "Wie oft du mit Bogen oder Armbrust triffst und wie hoch dein höchster Schaden (Max Hit) ist – zusammen mit der Fernkampf-Stärke der Ausrüstung.", xp: "Fernkampf in den Stilen Akkurat und Schnell: 4 XP je abgezogenem Lebenspunkt. Im Stil Fern: 2 XP." },
  magie: { wofuer: "Wie oft du mit dem Stab triffst und wie viel Schaden deine Zauber machen (Waffenwurf plus Magie ÷ 3). Außerdem deine Verteidigung gegen Magie.", xp: "Magie in den Stilen Akkurat und Schnell: 2 XP je abgezogenem Lebenspunkt. Im Stil Defensiv: 1,33 XP." },
  lp: { wofuer: "Deine Lebenspunkte: höchstens 9 + Lebenspunkte-Level (Start 10). Sie regenerieren 1 LP je 50 Sekunden.", xp: "Mit jeder Waffe und in jedem Stil: 1,33 XP je Schadenspunkt, den du verursachst." },
  defense: { wofuer: "Deine Verteidigung gegen Nah- und Fernkampf (dazu kommen die Boni deiner Rüstung und des Stils).", xp: "Je abgezogenem Lebenspunkt: Nahkampf Verteidigung 4 XP, Ausgewogen 1,33 XP · Fernkampf Fern 2 XP · Magie Defensiv 1 XP. Ein Block gibt keine XP mehr." },
};
function skillInfo(k: Skill): void {
  const S = skillStand(skillsLesen()[k], k), I = SKILL_INFO[k], name = k === "lp" ? "Lebenspunkte" : SKILL_NAME[k];
  tafelZeigen("skillinfo", `<div class="skopf"><span class="sz gross">${SKILL_ZEICHEN[k]}</span><div><h2>${name}</h2><small>Level ${S.L}${S.L < 100 ? ` · ${S.im} / ${S.bis} XP bis Level ${S.L + 1}` : " · höchstes Level"}</small></div></div><div class="zier"></div>
    <h3>Wofür</h3><p>${I.wofuer}</p><h3>So steigst du auf</h3><p>${I.xp}</p>`, () => { /* zu */ }); }
/** Untersuchen-Fenster eines Gegenstands (auch aus dem Aktionsmenü am Boden) */
export function gegenstandUntersuchen(g: string): void { untersuchen(g, () => { /* zurück */ }, () => { /* zu */ }); }
function untersuchen(g: string, zurueck: () => void, zu: () => void): void {
  const G = GEGENSTAENDE[g], f = $("#ez-konto"); f.hidden = true; f.innerHTML = "";
  const t = tafel("taschen eigen untersuchen", `<h2>${G.name}</h2><div class="zier"></div><p class="iart"><span class="isel s-${G.seltenheit}">${SELTENHEITEN[G.seltenheit].name}</span> · ${G.art}${G.platz ? " · " + PLAETZE.find((p) => p.id === G.platz)!.name : ""}</p>
    <canvas class="igross" width="220" height="220" data-bild="${g}"></canvas><dl class="iwerte">${werteVon(G).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>
    <p class="klein">${G.text}</p><div class="reihe"><button type="button" class="haupt" data-t="zurueck">Zurück</button></div>`, zu); /* ✕ oder Esc: ganz schließen – das Spiel läuft weiter (früher blieb es gesperrt) */
  { const c = t.querySelector("canvas") as HTMLCanvasElement; if (G.symbol) symbolMalen(c, G.symbol); else void dingBild(c, G); }
  (t.querySelector('[data-t="zurueck"]') as HTMLElement).addEventListener("click", (e) => { e.stopPropagation(); t.hidden = true; t.innerHTML = ""; zurueck(); });
}
/** Rucksack und Ausrüstung: mit eigenem Helden das echte Inventar, sonst (Kampagnen ohne eigenen Helden) das bisherige Grundgerüst */
export function taschenTafel(art: "rucksack" | "ausruestung", held: string, zu: () => void, ohneReiter = false): void {
  if (aktiverHeld()) { eigeneTasche(art, zu, ohneReiter); return; }
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
/** Eine Tafel für das, was noch kommt (Angriffsstil, Quests, Skills): Name, Zeichen und ein kurzer Hinweis */
export function baldTafel(titel: string, zeichen: keyof typeof RZEICHEN, zu: () => void): void {
  tafel("bald", `<h2>${titel}</h2><div class="zier"></div><div class="bald-zeichen">${RZEICHEN[zeichen]}</div><p class="klein">Kommt bald – hier entsteht gerade etwas.</p>`, zu); }
/** Angriffsstil: die Stile der angelegten Waffe mit den Werten, die sich daraus ergeben (Kampfregeln v3) */
export function stilTafel(zu: () => void): void {
  const zeichnen = () => { const art = kampfartJetzt(), jetzt = stilLesen(art), x = skillsLesen(), an = inventar().angelegt, w = an.waffe ? GEGENSTAENDE[an.waffe] : null, z = (v: number) => String(Math.round(v * 100) / 100).replace(".", ",");
    const zeile = (i: number) => { const k = kampfwerte(x, an, i), W = k.waffe, schaden = W.art === "magie" ? `${Math.max(1, Math.round(W.schaden[0] + W.plus))}–${Math.max(1, Math.round(W.schaden[1] + W.plus))}` : `${W.schaden[0]}–${W.schaden[1]}`;
      return `<button type="button" class="stil${i === jetzt ? " an" : ""}" data-s="${i}"><b>${STILE[art][i].name}</b><small>${STILE[art][i].text}</small>
        <span class="werte"><em>Treffer ${z(k.angriff[art])}</em><em>Schaden ${schaden}</em><em>${W.ticks} Ticks · ${z(W.ticks * TICK)} s</em><em>${art === "nah" ? "Nahkampf" : z(W.reich) + " Felder"}</em></span></button>`; };
    return `<h2>Angriffsstil</h2><div class="zier"></div><p class="klein">${w ? w.name : "Fäuste"} · ${art === "nah" ? "Nahkampf" : art === "fern" ? "Fernkampf" : "Magie"}</p><div class="stile">${STILE[art].map((_, i) => zeile(i)).join("")}</div>
      <p class="klein">Der Stil gilt für alle Waffen dieser Kampfart. Getroffen wird, wenn dein Trefferwurf höher ist als der Abwehrwurf des Gegners.</p>`; };
  const f = tafel("stiltafel", zeichnen(), zu), neu = () => { const t = f.querySelector(".tafel") as HTMLElement; t.innerHTML = t.innerHTML.replace(/<h2>[\s\S]*$/, "") + zeichnen(); binden(); };
  const binden = () => f.querySelectorAll<HTMLElement>("[data-s]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); stilSetzen(kampfartJetzt(), Number(b.dataset.s)); neu(); }));
  binden(); }
/* ---------- Tabs neben der Leiste (3D-Welt): Angriffsstil, Rucksack, Ausrüstung, Skills ----------
 * Oben bündig mit dem obersten Knopf, unten mit dem untersten, rechts mit dem Chat. Immer nur einer offen; nochmal antippen schließt; der Knopf leuchtet. */
export type TabArt = "stil" | "rucksack" | "ausruestung" | "skills" | "quests" | "freunde";
let tabJetzt: TabArt | null = null;
const tabEl = () => document.getElementById("ez-" + tabJetzt + "tab");
/** Tab öffnen/schließen. false: geht nicht (ohne eigenen Helden gibt es Rucksack und Ausrüstung nur als Tafel) */
export function seitenTab(art: TabArt): boolean {
  if ((art === "rucksack" || art === "ausruestung") && !aktiverHeld()) return false;
  const war = tabJetzt; tabZu(); tabWahl = null; if (war === art) return true;
  tabJetzt = art; const el = document.createElement("aside"); el.id = "ez-" + art + "tab"; el.className = "seitentab tab-" + art; el.setAttribute("aria-label", TAB_NAME[art]); document.body.appendChild(el);
  document.querySelector(`#ez-leiste [data-l="${art}"]`)?.classList.add("an");
  for (const t of ["pointerdown", "keydown", "keyup", "wheel"]) el.addEventListener(t, (e) => e.stopPropagation());
  { /* mit dem Finger ziehen = scrollen (die Seite sperrt Wischgesten für die Kamera, deshalb hier selbst); wer gezogen hat, tippt danach nichts an */
    let zug: { id: number; y: number; top: number; weit: number } | null = null, gezogen = false;
    el.addEventListener("pointerdown", (e) => { gezogen = false; zug = e.pointerType === "mouse" ? null : { id: e.pointerId, y: e.clientY, top: (el.querySelector<HTMLElement>(".tinhalt") || el).scrollTop, weit: 0 }; });
    el.addEventListener("pointermove", (e) => { if (!zug || e.pointerId !== zug.id) return; const dy = e.clientY - zug.y; zug.weit = Math.max(zug.weit, Math.abs(dy)); if (zug.weit > 6) { gezogen = true; const i = el.querySelector<HTMLElement>(".tinhalt") || el; i.scrollTop = zug.top - dy; } });
    const ende = (e: PointerEvent) => { if (zug && e.pointerId === zug.id) zug = null; }; el.addEventListener("pointerup", ende); el.addEventListener("pointercancel", ende);
    el.addEventListener("click", (e) => { if (gezogen) { gezogen = false; e.stopPropagation(); e.preventDefault(); } }, true); }
  langDruecken(el, (e) => { const f = (e.target as HTMLElement | null)?.closest<HTMLElement>(".ifeld.voll"); if (!f) return false; dingMenue(f.dataset.wo!, f.dataset.g!, e.clientX, e.clientY); return true; }); /* lange drücken (Handy, auch iPhone-Safari) oder Rechtsklick = Aktionsmenü */
  el.addEventListener("click", tabKlick); tabZeichnen(); tabLage(); addEventListener("resize", tabLage);
  for (const t of ["ez-inventar", "ez-skills", "ez-stil", "ez-quest", "ez-freunde-neu"]) addEventListener(t, tabZeichnen);
  if (art === "freunde") { freundeBeobachten(true); el.addEventListener("submit", (e) => { e.preventDefault(); freundFormular(e.target as HTMLFormElement); }); document.querySelector('[aria-label="Freunde"]')?.classList.add("an"); }
  return true; }
const TAB_NAME: Record<TabArt, string> = { stil: "Angriffsstil", rucksack: "Rucksack", ausruestung: "Ausrüstung", skills: "Skills", quests: "Quests", freunde: "Freunde" };
function tabZu(): void { const el = tabEl(); if (el) el.remove(); if (tabJetzt) document.querySelector(`#ez-leiste [data-l="${tabJetzt}"]`)?.classList.remove("an"); tabJetzt = null;
  removeEventListener("resize", tabLage); for (const t of ["ez-inventar", "ez-skills", "ez-stil", "ez-quest", "ez-freunde-neu"]) removeEventListener(t, tabZeichnen); freundeBeobachten(false); document.querySelector('[aria-label="Freunde"]')?.classList.remove("an"); }
/** Angriffsstil-Tab (alter Name) */
export const stilTab = (): void => { seitenTab("stil"); };
function tabLage(): void {
  const el = tabEl(), k = [...document.querySelectorAll<HTMLElement>("#ez-leiste [data-l]")], chat = document.querySelector<HTMLElement>(".ez-chat"); if (!el || !k.length) return;
  const oben = k[0].getBoundingClientRect(), unten = k[k.length - 1].getBoundingClientRect(), links = Math.max(...k.map((b) => b.getBoundingClientRect().right)) + 12;
  const rechts = chat && chat.offsetWidth ? chat.getBoundingClientRect().right : links + 340;
  const h = Math.max(120, unten.bottom - oben.top); Object.assign(el.style, { left: links + "px", top: oben.top + "px", height: h + "px", width: Math.max(200, rechts - links) + "px" }); el.classList.toggle("eng", h < 300); /* niedrig (Handy): ohne Erklärzeilen */ }
let tabWahl: { wo: string; g: string } | null = null;
function tabZeichnen(): void {
  const el = tabEl(); if (!el || !tabJetzt) return; let neu = "";
  /* nur neu zeichnen, wenn sich der Inhalt ändert – im Kampf kommen ständig XP, sonst würde ein Knopf mitten im Antippen ersetzt */
  const setzen = (): boolean => { if ((el as HTMLElement & { _html?: string })._html === neu) return false; (el as HTMLElement & { _html?: string })._html = neu; el.innerHTML = `<button type="button" class="tzu" data-tzu="1" aria-label="Schließen">✕</button><div class="tinhalt">${neu}</div>`; return true; }; /* Inhalt eigens (scrollt), der Rahmen mit Rauten bleibt außen */
  if (tabJetzt === "stil") { const art = kampfartJetzt(), jetzt = stilLesen(art), x = skillsLesen(), an = inventar().angelegt, w = an.waffe ? GEGENSTAENDE[an.waffe] : null, auto = autoLesen();
    const zeile = (i: number) => { const k = kampfwerte(x, an, i), W = k.waffe; return `<button type="button" class="stil${i === jetzt ? " an" : ""}" data-s="${i}" aria-pressed="${i === jetzt}" title="${STILE[art][i].text}"><i class="punkt"></i><b>${STILE[art][i].name}</b><em>Max ${W.art === "magie" ? Math.max(1, Math.round(W.schaden[1] + W.plus)) : W.schaden[1]} · ${W.ticks} Ticks</em>${i === jetzt ? `<span class="aktiv">✓ Aktiv</span>` : ""}<small>${STILE[art][i].text}</small></button>`; };
    neu = `<div class="kopf gross"><b>Heldenlevel ${heldenlevel(x)}</b><small>${w ? w.name : "Fäuste"} · ${art === "nah" ? "Nahkampf" : art === "fern" ? "Fernkampf" : "Magie"}</small></div>
      <div class="stile pergament">${STILE[art].map((_, i) => zeile(i)).join("")}</div>
      <button type="button" class="kipp${auto ? " an" : ""}" data-auto="1" role="switch" aria-checked="${auto}"><i></i><span><b>Autoangriff</b><small>${auto ? "Greift dich ein Gegner an, schlägst du sofort zurück." : "Aus: Gegner antippen, um sie anzugreifen."}</small></span></button>`; setzen(); return; }
  if (tabJetzt === "freunde") { neu = freundeHtml(); setzen(); return; }
  if (tabJetzt === "quests") { const st = questStand();
    neu = !st ? `<div class="kopf"><b>Quests</b><small>0 aktiv</small></div><div class="tleer"><span>${RZEICHEN.quest}</span><p>Noch keine Quests.</p><small>Sprich mit den Leuten in der Waldmark – vielleicht braucht jemand Hilfe.</small></div>`
      : `<div class="kopf"><b>Quests</b><small>${st === "fertig" ? "abgeschlossen" : "1 aktiv"}</small></div><div class="tquest${st === "fertig" ? " fertig" : ""}"><b>Die gesperrte Straße</b><small>Einführung · Waldmark</small><p>${QUESTLOG[st]}</p>${st !== "fertig" ? `<button type="button" class="kipp verfolgen${questVerfolgt() ? " an" : ""}" data-verfolgen="1" role="switch" aria-checked="${questVerfolgt()}"><i></i><span><b>Verfolgen</b><small>Ein Pfeil am Helden zeigt den Weg zum nächsten Ziel.</small></span></button>` : ""}</div>`; setzen(); return; }
  if (tabJetzt === "skills") { const x = skillsLesen();
    neu = `<div class="kopf"><b>Skills</b><small>Heldenlevel ${heldenlevel(x)}</small></div><ul class="tskills">${SKILLS.map((k) => { const S = skillStand(x[k], k);
      return `<li data-skill="${k}" title="${SKILL_NAME[k]}: ${S.L < 100 ? `${S.im} / ${S.bis} XP bis Level ${S.L + 1}` : "höchstes Level"}"><span class="sz">${SKILL_ZEICHEN[k]}</span><b>${k === "lp" ? "Leben" : SKILL_NAME[k]}</b><span class="lv">${S.L}</span><i class="ez-balken"><u style="width:${S.anteil}%"></u></i><span class="lv nach">${S.L < 100 ? S.L + 1 : "–"}</span></li>`; }).join("")}</ul>`; setzen(); return; }
  const inv = inventar(), menge = (i: number) => (inv.anzahl || [])[i] || 1;
  const feld = (g: string | undefined, wo: string, platz?: Platz) => `<button type="button" class="ifeld${g ? " voll" : ""}${tabWahl && tabWahl.wo === wo ? " gewaehlt" : ""}" data-wo="${wo}"${g ? ` data-g="${g}"` : ""} aria-label="${g ? GEGENSTAENDE[g].name : platz ? PLAETZE.find((p) => p.id === platz)!.name + " (leer)" : "leer"}">${g ? `<canvas width="96" height="96" data-bild="${g}"></canvas>` : platz ? `<span class="leer">${PLATZBILD[platz]}</span>` : ""}${g && wo.startsWith("r") && menge(Number(wo.slice(1))) > 1 ? `<em class="menge">${menge(Number(wo.slice(1)))}</em>` : ""}</button>`;
  let wahl = ""; if (tabWahl) { const G = GEGENSTAENDE[tabWahl.g], angelegt = !tabWahl.wo.startsWith("r"), n = angelegt ? 1 : menge(Number(tabWahl.wo.slice(1)));
    wahl = `<div class="twahl"><b>${G ? G.name : ""}${n > 1 ? " ×" + n : ""}</b><span class="reihe"><button type="button" data-t="untersuchen">Untersuchen</button>${angelegt ? `<button type="button" class="haupt" data-t="ablegen">Ablegen</button>` : `${inventarAmServer() ? `<button type="button" data-t="fallen">Fallen lassen</button>` : ""}${G && G.platz ? `<button type="button" class="haupt" data-t="anlegen">Anlegen</button>` : ""}`}<button type="button" data-t="weg" aria-label="Auswahl schließen">✕</button></span></div>`; }
  if (tabJetzt === "rucksack") neu = `<div class="kopf"><b>Rucksack</b><small>${inv.rucksack.length} / ${RUCKSACK_PLAETZE}</small></div><div class="traster">${Array.from({ length: RUCKSACK_PLAETZE }, (_, i) => feld(inv.rucksack[i], "r" + i)).join("")}</div>${wahl}`;
  else neu = `<div class="kopf"><b>Ausrüstung</b><button type="button" class="info" data-t="werte" aria-label="Werte der Ausrüstung" title="Werte der Ausrüstung">i</button></div>
    <div class="tplaetze">${PLAETZE.map((p) => `<div class="tplatz">${feld(inv.angelegt[p.id], p.id, p.id)}<small>${p.name}</small></div>`).join("")}</div>${wahl || `<p class="klein">Antippen: untersuchen oder ablegen · i: Werte der Ausrüstung</p>`}`;
  if (!setzen()) return;
  el.querySelectorAll<HTMLCanvasElement>("canvas[data-bild]").forEach((c) => { const G = GEGENSTAENDE[c.dataset.bild!]; if (G.symbol) symbolMalen(c, G.symbol); else void dingBild(c, G); }); }
function tabKlick(e: Event): void {
  e.stopPropagation(); const t = e.target as HTMLElement;
  if (t.closest("[data-tzu]")) { tabZu(); return; } /* rotes ✕ oben rechts */
  if (tabJetzt === "freunde") { freundKlick(t); return; }
  if (tabJetzt === "quests") { if (t.closest("[data-verfolgen]")) { questVerfolgen(!questVerfolgt()); tabZeichnen(); } return; }
  if (tabJetzt === "stil") { const b = t.closest<HTMLElement>("[data-s],[data-auto]"); if (!b) return; if (b.dataset.s) stilSetzen(kampfartJetzt(), Number(b.dataset.s)); else autoSetzen(!autoLesen()); tabZeichnen(); return; }
  const f = t.closest<HTMLElement>(".ifeld.voll"); if (f) { const d = dingAktionen(f.dataset.wo!, f.dataset.g!); if (d && d.a[0]) d.a[0].tat(); return; } /* Gegenstand kurz antippen: erste Aktion (Ausrüsten / Ablegen / Untersuchen) */
  const sk = t.closest<HTMLElement>("[data-skill]"); if (sk) { skillInfo(sk.dataset.skill as Skill); return; }
  const a = t.closest<HTMLElement>("[data-t]")?.dataset.t; if (!a) return;
  if (a === "werte") { ausruestungsWerte(); return; }
  const w = tabWahl; if (!w) return; const G = GEGENSTAENDE[w.g];
  if (a === "weg") tabWahl = null;
  else if (a === "untersuchen") { untersuchen(w.g, () => { /* zurück: der Tab bleibt offen */ }, () => { /* schließen */ }); return; }
  else if (a === "ablegen" && G && G.platz) { if (!ablegen(G.platz)) { chatHinweis("Der Rucksack ist voll."); return; } tabWahl = null; }
  else if (a === "anlegen") { anlegen(w.g); tabWahl = null; }
  else if (a === "fallen") { fallenLassen(Number(w.wo.slice(1))); tabWahl = null; }
  tabZeichnen(); }
const chatHinweis = (t: string) => { const el = tabEl(); const p = el && el.querySelector(".twahl b"); if (p) p.textContent = t; };
/** Overlay in der Mitte: die Werte der angelegten Ausrüstung zusammengezählt (nur Gegenstände, ohne Heldenwerte) */
export function ausruestungsWerte(): void {
  const an = inventar().angelegt, teile = PLAETZE.map((p) => an[p.id]).filter(Boolean).map((g) => GEGENSTAENDE[g!]).filter(Boolean), W = teile.find((G) => G.waffe)?.waffe, z = (v: number) => String(Math.round(v * 100) / 100).replace(".", ",");
  const ab = { nah: 0, fern: 0, magie: 0 }; for (const G of teile) if (G.abwehr) { ab.nah += G.abwehr.nah; ab.fern += G.abwehr.fern; ab.magie += G.abwehr.magie; }
  const angriff: [string, string][] = W ? [["Kampfart", W.art === "nah" ? "Nahkampf" : W.art === "fern" ? "Fernkampf" : "Magie"],
    ...(W.art === "nah" ? [["Geschick", "+" + (W.geschick || 0)], ["Stärke", "+" + (W.staerke || 0)]] as [string, string][] : W.art === "fern" ? [["Fernkampf-Angriff", "+" + (W.fernAngriff || 0)], ["Fernkampf-Stärke", "+" + (W.fernStaerke || 0)]] as [string, string][] : [["Magische Genauigkeit", "+" + (W.genau || 0)], ["Schaden", `${(W.schaden || [1, 1])[0]}–${(W.schaden || [1, 1])[1]}`]] as [string, string][]),
    ["Angriffstempo", `${W.ticks} Ticks (${z(W.ticks * TICK)} s)`], ["Reichweite", W.art === "nah" ? "Nahkampf" : z(W.reich) + " Felder"]] : [["Waffe", "keine (Fäuste)"]];
  const liste = (z: [string, string][]) => `<dl class="iwerte">${z.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>`;
  tafel("taschen eigen ausruestungswerte", `<h2>Werte der Ausrüstung</h2><div class="zier"></div><p class="klein">${teile.length ? teile.map((G) => G.name).join(" · ") : "Nichts angelegt"}</p>
    <h3>Angriff</h3>${liste(angriff)}<h3>Verteidigung</h3>${liste([["Nahkampf", "+" + ab.nah], ["Fernkampf", "+" + ab.fern], ["Magie", "+" + ab.magie]])}
    <p class="klein">Nur die Gegenstände – deine Skills (Geschick, Defense, Magie …) kommen im Kampf noch dazu.</p>`, () => { /* schließen */ }); }
/** Skills: die vier Skills mit Level und Fortschritt, dazu Heldenlevel, Leben und Abwehr (Kampfregeln v2) */
export function skillTafel(zu: () => void): void {
  const x = skillsLesen(), hl = heldenlevel(x), k = kampfwerte(x, inventar().angelegt), WAS: Record<string, string> = { geschick: "Nahkampf: Trefferwert", staerke: "Nahkampf: Schaden", fernkampf: "Fernkampf: Trefferwert", magie: "Magie: Trefferwert, Schaden und Magieabwehr", lp: "Max-LP = 19 + Level · 1 XP je verursachtem Schadenspunkt", defense: "Abwehr Nah- und Fernkampf · 10 XP je Block" };
  const zeilen = SKILLS.map((s) => { const S = skillStand(x[s], s); return `<li><b>${SKILL_NAME[s]}</b><span class="lv">${S.L}</span><i class="ez-balken"><u style="width:${S.anteil}%"></u></i><small>${WAS[s]} · ${S.L < 100 ? `${S.im} / ${S.bis} XP bis Level ${S.L + 1}` : "höchstes Level"}</small></li>`; }).join("");
  const z = (v: number) => String(Math.round(v * 10) / 10).replace(".", ",");
  tafel("skilltafel", `<h2>Skills</h2><div class="zier"></div><ul class="skills">${zeilen}</ul>
    <p class="klein">Heldenlevel ${hl} (Durchschnitt der sechs Skills) · ${k.max} Lebenspunkte · Abwehr Nahkampf ${z(k.abwehr.nah)}, Fernkampf ${z(k.abwehr.fern)}, Magie ${z(k.abwehr.magie)}</p>
    <p class="klein">Jeder Lebenspunkt Schaden bringt XP: Nah- und Fernkampf 4, Magie 2 – verteilt nach dem gewählten Stil – und dazu 1,33 Lebenspunkte-XP.</p>`, zu); }
/** Bild für Gegenstände ohne Figurenteil: Kristall (Splitter) oder Pergament */
function symbolMalen(c: HTMLCanvasElement, art: "kristall" | "pergament"): void {
  const x = c.getContext("2d"); if (!x) return; const W = c.width, H = c.height; x.clearRect(0, 0, W, H); x.save(); x.translate(W / 2, H / 2); x.scale(W / 120, H / 120); x.lineJoin = "round";
  if (art === "kristall") { const g = x.createLinearGradient(-20, -40, 20, 40); g.addColorStop(0, "#e6d8ff"); g.addColorStop(0.45, "#9a6cf0"); g.addColorStop(1, "#4a2a9a");
    x.shadowColor = "rgba(170,120,255,.8)"; x.shadowBlur = 14; x.fillStyle = g; x.strokeStyle = "#2a1650"; x.lineWidth = 2.5;
    x.beginPath(); x.moveTo(0, -44); x.lineTo(20, -10); x.lineTo(12, 38); x.lineTo(-12, 38); x.lineTo(-20, -10); x.closePath(); x.fill(); x.shadowBlur = 0; x.stroke();
    x.strokeStyle = "rgba(255,255,255,.55)"; x.lineWidth = 2; x.beginPath(); x.moveTo(0, -44); x.lineTo(-4, 36); x.moveTo(-20, -10); x.lineTo(20, -10); x.stroke(); }
  else { x.fillStyle = "#e9d7a8"; x.strokeStyle = "#7a5a2a"; x.lineWidth = 2.5; x.beginPath(); x.moveTo(-30, -36); x.lineTo(30, -36); x.lineTo(30, 30); x.quadraticCurveTo(0, 22, -30, 30); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = "#c9ad72"; for (const y of [-36, 30]) { x.beginPath(); x.ellipse(0, y, 34, 7, 0, 0, Math.PI * 2); x.fill(); x.stroke(); }
    x.strokeStyle = "rgba(90,60,20,.7)"; x.lineWidth = 2; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(-20, -18 + i * 11); x.lineTo(14 - (i % 2) * 8, -18 + i * 11); x.stroke(); } }
  x.restore(); }
