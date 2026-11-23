/*
 * Mythara – Oberfläche der 3D-Welt (seit 22.11.2026):
 * links oben der Chat (nach oben einklappbar, Nachrichten und Eingabe halb durchsichtig), darunter hochkant die Leiste
 * Angriffsstil · Quests · Rucksack · Ausrüstung · Skills; das Profil oben links entfällt. Teleport, Spieler online und Einstellungen sitzen links an der Minikarte
 * (PC: im Halbmond-Dock mit Karte und Sprint, Handy: auf einem Bogen links an der Karte – kartenBogen).
 * An der Minikarte: rechts im Halbkreis die Lebenspunkte und daneben eine gelbe Leiste (Ausdauer – Funktion kommt noch).
 * Die Knöpfe an der Karte selbst (Karte, Sprint) setzt anschluss.ts über rahmen.ts rundeKarte.
 */
import { RZEICHEN } from "../rahmen";

export interface LeistenKnopf { id: string; name: string; zeichen: keyof typeof RZEICHEN; tat: () => void; taste?: string }

/** Die Leiste links unter dem Chat aufbauen (einmal je Seite; erneuter Aufruf ersetzt die Knöpfe) */
/** Gemalte Symbole der linken Leiste (img/echtzeit/leiste/<id>.webp, mit eigenem Goldring) */
const LEISTE_BILD = new Set(["stil", "quests", "rucksack", "ausruestung", "skills"]);
export function leisteAufbauen(knoepfe: LeistenKnopf[]): void {
  let el = document.getElementById("ez-leiste"); if (!el) { el = document.createElement("nav"); el.id = "ez-leiste"; el.setAttribute("aria-label", "Spielmenü"); document.body.appendChild(el);
    el.addEventListener("pointerdown", (e) => e.stopPropagation()); /* Antippen der Leiste lässt den Helden nicht loslaufen */
    el.addEventListener("click", (e) => { e.stopPropagation(); const b = (e.target as HTMLElement).closest("[data-l]") as HTMLElement | null; if (b) jetzt.find((k) => k.id === b.dataset.l)?.tat(); }); }
  jetzt = knoepfe;
  el.innerHTML = knoepfe.map((k) => `<button type="button" data-l="${k.id}"${LEISTE_BILD.has(k.id) ? ` class="mitbild"` : ""} aria-label="${k.name}" title="${k.name}${k.taste ? ` (${k.taste})` : ""}">${LEISTE_BILD.has(k.id) ? `<img src="../img/echtzeit/leiste/${k.id}.webp" alt="" draggable="false">` : `<span>${RZEICHEN[k.zeichen]}</span>`}${k.id === "freunde" ? `<em class="zahl ez-online-zahl" hidden></em>` : ""}</button>`).join("");
  if (!beobachtet) { beobachtet = true; addEventListener("resize", () => einpassen());  }
  einpassen();
}
let jetzt: LeistenKnopf[] = [], beobachtet = false;
/** Wie viele sind online (Zahl am Freunde-Knopf) */
export function leisteOnline(n: number): void { zahlOnline = n; document.querySelectorAll<HTMLElement>(".ez-online-zahl").forEach((z) => { z.hidden = n < 2; z.textContent = String(n); }); }
let zahlOnline = 0;

/** Die Leiste steht fest unten links (CSS) – unabhängig vom Chat. Nur auf sehr niedrigen Bildschirmen werden die Knöpfe kleiner, damit sie den offenen Chat nicht berühren. */
function einpassen(): void {
  const el = document.getElementById("ez-leiste"); if (!el) return; const n = Math.max(1, el.childElementCount), klein = innerHeight < 520;
  const chatOffen = klein ? 175 : 215, abstand = klein ? 5 : 8, frei = innerHeight - chatOffen - 10; /* so hoch wird der Chat aufgeklappt (oben links) */
  const g = Math.max(28, Math.min(klein ? 38 : 48, Math.floor((frei - abstand * (n - 1)) / n)));
  el.style.setProperty("--g", g + "px"); el.style.setProperty("--a", abstand + "px"); el.style.top = ""; el.style.left = ""; }

/* ───────── Handy: Knöpfe auf einem Bogen links an der Minikarte ───────── */
let bogenJetzt: LeistenKnopf[] = [];
/** Knöpfe links an der runden Karte entlang ihres Rings (leere Liste: weg) */
export function kartenBogen(knoepfe: LeistenKnopf[]): void {
  const rahmen = document.getElementById("ez-kartenrahmen"); if (!rahmen) return; let el = document.getElementById("ez-kbogen");
  if (!knoepfe.length) { if (el) el.remove(); return; }
  if (!el) { el = document.createElement("div"); el.id = "ez-kbogen"; rahmen.appendChild(el); el.addEventListener("pointerdown", (e) => e.stopPropagation());
    el.addEventListener("click", (e) => { e.stopPropagation(); const b = (e.target as HTMLElement).closest("[data-l]") as HTMLElement | null; if (b) bogenJetzt.find((k) => k.id === b.dataset.l)?.tat(); });
    const rund = rahmen.querySelector(".rund") as HTMLElement | null; if (rund && "ResizeObserver" in window) new ResizeObserver(() => bogenLegen()).observe(rund); addEventListener("resize", () => bogenLegen()); }
  bogenJetzt = knoepfe;
  el.innerHTML = knoepfe.map((k) => `<button type="button" data-l="${k.id}" aria-label="${k.name}" title="${k.name}"><span>${RZEICHEN[k.zeichen]}</span>${k.id === "spieler" ? `<em class="zahl ez-online-zahl" hidden></em>` : ""}</button>`).join("");
  leisteOnline(zahlOnline); bogenLegen(); }
function bogenLegen(): void {
  const rahmen = document.getElementById("ez-kartenrahmen"), rund = rahmen && rahmen.querySelector(".rund") as HTMLElement | null, el = document.getElementById("ez-kbogen"); if (!rund || !el) return;
  const R = rund.offsetWidth / 2; if (!R) return; const g = Math.round(Math.max(30, Math.min(40, R * 0.6))), rb = R * 1.09 + g / 2 + 5, cx = rund.offsetLeft + R, cy = rund.offsetTop + R, n = el.children.length, schritt = (g + 7) / rb;
  [...el.children].forEach((b, i) => { const w = Math.PI + (i - (n - 1) / 2) * schritt; Object.assign((b as HTMLElement).style, { width: g + "px", height: g + "px", left: (cx + rb * Math.cos(w) - g / 2) + "px", top: (cy + rb * Math.sin(w) - g / 2) + "px" }); }); }

/* ───────── Lebenspunkte und gelbe Leiste im Halbkreis um die Minikarte ───────── */
let boegen: SVGSVGElement | null = null, lebenText = "";
/** Die beiden Bögen an die runde Karte hängen (rechte Hälfte, von unten nach oben gefüllt) */
export function boegenAufbauen(): void {
  const rahmen = document.getElementById("ez-kartenrahmen"), rund = rahmen && rahmen.querySelector(".rund") as HTMLElement | null; if (!rahmen || !rund) return;
  if (!boegen || boegen.parentElement !== rahmen) {
    const ns = "http://www.w3.org/2000/svg"; boegen = document.createElementNS(ns, "svg"); boegen.setAttribute("class", "ez-boegen"); boegen.setAttribute("aria-hidden", "true");
    boegen.innerHTML = `<path class="grund lp"/><path class="voll lp" pathLength="100"/><path class="grund gelb"/><path class="voll gelb" pathLength="100"/><text class="lpzahl"></text>`;
    rahmen.appendChild(boegen);
    if ("ResizeObserver" in window) new ResizeObserver(() => boegenLegen()).observe(rund); addEventListener("resize", () => boegenLegen()); }
  boegenLegen(); lebenAnzeigen(null); gelbAnzeigen(1);
}
/** Lage und Größe der Bögen aus der Lage der Karte im Rahmen (Karte ist rund, Ring liegt außen darum) */
function boegenLegen(): void {
  const rahmen = document.getElementById("ez-kartenrahmen"), rund = rahmen && rahmen.querySelector(".rund") as HTMLElement | null; if (!rahmen || !rund || !boegen) return;
  const R = rund.offsetWidth / 2; if (!R) return; const ring = R * 1.09, r1 = ring + 7, r2 = r1 + 9, rand = r2 + 6, cx = rund.offsetLeft + R, cy = rund.offsetTop + R;
  Object.assign(boegen.style, { left: (cx - rand) + "px", top: (cy - rand) + "px", width: 2 * rand + "px", height: 2 * rand + "px" }); boegen.setAttribute("viewBox", `${-rand} ${-rand} ${2 * rand} ${2 * rand}`);
  /* rechte Hälfte: von unten (6 Uhr) über 3 Uhr nach oben (12 Uhr), mit etwas Abstand zu den Polen */
  const bogen = (r: number) => { const a0 = 80 * Math.PI / 180, a1 = -80 * Math.PI / 180; /* Winkel von 3 Uhr aus, im Bildschirm (y nach unten) */
    const p = (a: number) => `${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`; return `M${p(a0)}A${r} ${r} 0 0 0 ${p(a1)}`; };
  boegen.querySelectorAll(".lp").forEach((e) => e.setAttribute("d", bogen(r1))); boegen.querySelectorAll(".gelb").forEach((e) => e.setAttribute("d", bogen(r2)));
  const t = boegen.querySelector(".lpzahl") as SVGTextElement; t.setAttribute("x", "0"); t.setAttribute("y", String((ring - 5).toFixed(1)));
}
/** Lebenspunkte zeigen (null: voll, ohne Zahl – außerhalb der Kampfgebiete) */
export function lebenAnzeigen(lp: number | null, max = 0): void { if (!boegen) return; const a = lp === null || !max ? 1 : Math.max(0, Math.min(1, lp / max)), v = boegen.querySelector(".voll.lp") as SVGPathElement;
  v.style.strokeDasharray = `${(a * 100).toFixed(1)} 100`; v.classList.toggle("mittel", a <= 0.5 && a > 0.25); v.classList.toggle("wenig", a <= 0.25);
  const text = lp === null || !max ? "" : `${Math.round(lp)} / ${max}`; if (text !== lebenText) { lebenText = text; (boegen.querySelector(".lpzahl") as SVGTextElement).textContent = text; } }
/** Die gelbe Leiste (Funktion kommt noch – vorerst voll) */
export function gelbAnzeigen(anteil: number): void { if (!boegen) return; (boegen.querySelector(".voll.gelb") as SVGPathElement).style.strokeDasharray = `${(Math.max(0, Math.min(1, anteil)) * 100).toFixed(1)} 100`; }
