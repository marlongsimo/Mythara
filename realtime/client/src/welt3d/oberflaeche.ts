/*
 * Mythara – Oberfläche der 3D-Welt (seit 22.11.2026):
 * links oben der Chat (nach oben einklappbar, Nachrichten und Eingabe halb durchsichtig), darunter hochkant die Leiste
 * Angriffsstil · Quests · Rucksack · Ausrüstung · Skills · Freunde · Einstellungen; das Profil oben links entfällt.
 * An der Minikarte: rechts im Halbkreis die Lebenspunkte und daneben eine gelbe Leiste (Ausdauer – Funktion kommt noch).
 * Die Knöpfe an der Karte selbst (Karte, Sprint) setzt anschluss.ts über rahmen.ts rundeKarte.
 */
import { RZEICHEN } from "../rahmen";

export interface LeistenKnopf { id: string; name: string; zeichen: keyof typeof RZEICHEN; tat: () => void; taste?: string }

/** Die Leiste links unter dem Chat aufbauen (einmal je Seite; erneuter Aufruf ersetzt die Knöpfe) */
export function leisteAufbauen(knoepfe: LeistenKnopf[]): void {
  let el = document.getElementById("ez-leiste"); if (!el) { el = document.createElement("nav"); el.id = "ez-leiste"; el.setAttribute("aria-label", "Spielmenü"); document.body.appendChild(el);
    el.addEventListener("pointerdown", (e) => e.stopPropagation()); /* Antippen der Leiste lässt den Helden nicht loslaufen */
    el.addEventListener("click", (e) => { e.stopPropagation(); const b = (e.target as HTMLElement).closest("[data-l]") as HTMLElement | null; if (b) jetzt.find((k) => k.id === b.dataset.l)?.tat(); }); }
  jetzt = knoepfe;
  el.innerHTML = knoepfe.map((k) => `<button type="button" data-l="${k.id}" aria-label="${k.name}" title="${k.name}${k.taste ? ` (${k.taste})` : ""}"><span>${RZEICHEN[k.zeichen]}</span>${k.id === "freunde" ? `<em class="zahl" hidden></em>` : ""}</button>`).join("");
  if (!beobachtet) { beobachtet = true; addEventListener("resize", () => einpassen()); setInterval(einpassen, 500); }
  einpassen();
}
let jetzt: LeistenKnopf[] = [], beobachtet = false, chatBeobachtet: HTMLElement | null = null;
/** Wie viele sind online (Zahl am Freunde-Knopf) */
export function leisteOnline(n: number): void { const z = document.querySelector("#ez-leiste .zahl") as HTMLElement | null; if (z) { z.hidden = n < 2; z.textContent = String(n); } }

/** Leiste unter den Chat setzen; reicht die Höhe nicht (Chat offen auf dem Handy), werden die Knöpfe kleiner – und notfalls steht die Leiste rechts neben dem Chat */
function einpassen(): void {
  const el = document.getElementById("ez-leiste"), c = document.getElementById("ez-chat"); if (!el) return; const n = Math.max(1, el.childElementCount);
  if (c && c !== chatBeobachtet && "ResizeObserver" in window) { chatBeobachtet = c; new ResizeObserver(() => einpassen()).observe(c); } /* Chat auf- und zuklappen: Leiste rückt sofort mit */
  const r = c ? c.getBoundingClientRect() : null, oben = r && r.height ? r.bottom + 10 : 12, frei = innerHeight - oben - 10, abstand = innerHeight < 520 ? 5 : 8;
  let g = Math.floor(Math.min(innerHeight < 520 ? 40 : 48, (frei - abstand * (n - 1)) / n)), links = "", top = Math.round(oben) + "px";
  if (g < 30 && r) { g = Math.floor(Math.min(innerHeight < 520 ? 40 : 48, (innerHeight - r.top - 10 - abstand * (n - 1)) / n)); links = Math.round(r.right + 10) + "px"; top = Math.round(r.top) + "px"; }
  el.style.setProperty("--g", Math.max(26, g) + "px"); el.style.setProperty("--a", abstand + "px"); el.style.top = top; el.style.left = links; }

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
