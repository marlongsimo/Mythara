/*
 * Mythara – Oberfläche der 3D-Welt (seit 22.11.2026):
 * links oben der Chat (nach oben einklappbar, Nachrichten und Eingabe halb durchsichtig), darunter hochkant die Leiste
 * Angriffsstil · Quests · Rucksack · Ausrüstung · Skills; das Profil oben links entfällt. Teleport, Spieler online und Einstellungen sitzen links an der Minikarte
 * (PC: im Halbmond-Dock mit Karte und Sprint, Handy: auf einem Bogen links an der Karte – kartenBogen).
 * An der Minikarte: rechts im Halbkreis die Lebenspunkte und daneben eine gelbe Leiste (Ausdauer – Funktion kommt noch).
 * Die Knöpfe an der Karte selbst (Karte, Sprint) setzt anschluss.ts über rahmen.ts rundeKarte.
 */
import { RZEICHEN, RBILD, rbild } from "../rahmen";
import { aktiveSets } from "../../../shared/gegenstaende";
import { inventar } from "../inventar";

/* ───────── Rechte Leiste (seit 25.11.2026): Karte, Sprint, Teleport, Freunde, Einstellungen – unten rechts hochkant, wie die linke Leiste ───────── */
let rechtsJetzt: LeistenKnopf[] = [];
export function rechteLeiste(knoepfe: LeistenKnopf[]): void {
  let el = document.getElementById("ez-leiste-r"); if (!el) { el = document.createElement("nav"); el.id = "ez-leiste-r"; el.setAttribute("aria-label", "Karte und Reisen"); document.body.appendChild(el);
    el.addEventListener("pointerdown", (e) => e.stopPropagation());
    el.addEventListener("click", (e) => { e.stopPropagation(); const b = (e.target as HTMLElement).closest("[data-l]") as HTMLElement | null; if (b) rechtsJetzt.find((k) => k.id === b.dataset.l)?.tat(); });
    addEventListener("resize", () => rechtsEinpassen()); }
  rechtsJetzt = knoepfe;
  el.innerHTML = knoepfe.map((k) => `<button type="button" data-l="${k.id}"${RBILD.has(k.zeichen) ? ` class="mitbild"` : ""} aria-label="${k.name}" title="${k.name}${k.taste ? ` (${k.taste})` : ""}"><span>${RBILD.has(k.zeichen) ? rbild(k.zeichen) : RZEICHEN[k.zeichen]}</span>${k.id === "spieler" ? `<em class="zahl ez-freunde-zahl" hidden></em>` : ""}</button>`).join("");
  rechtsEinpassen(); }
function rechtsEinpassen(): void { const el = document.getElementById("ez-leiste-r"), l = document.getElementById("ez-leiste"); if (!el) return;
  /* gleiche Knopfgröße wie links – aber nie bis an die Minikarte heran (Handy quer: wenig Höhe) */
  const gl = parseFloat(l ? l.style.getPropertyValue("--g") : "") || 46, a = parseFloat(l ? l.style.getPropertyValue("--a") : "") || 8, n = Math.max(1, el.childElementCount);
  const rund = document.querySelector("#ez-kartenrahmen .rund") as HTMLElement | null, unten = rund ? rund.getBoundingClientRect().bottom + 14 : 0;
  const frei = innerHeight - unten - 10 - 20, g = Math.max(28, Math.min(gl, Math.floor((frei - a * (n - 1)) / n)));
  el.style.setProperty("--g", g + "px"); el.style.setProperty("--a", a + "px"); document.body.style.setProperty("--rbreite", (g + 16) + "px"); }
/** Werte-Balken direkt links an die runde Karte legen */
function balkenLegen(): void { const rahmen = document.getElementById("ez-kartenrahmen"), rund = rahmen && rahmen.querySelector(".rund") as HTMLElement | null; if (!rund || !balken) return;
  const h = rund.offsetHeight; if (!h) return; Object.assign(balken.style, { right: "auto", left: (rund.offsetLeft - balken.offsetWidth - 10) + "px", top: (rund.offsetTop + h * 0.06) + "px", height: (h * 0.88) + "px", bottom: "auto" }); rechtsEinpassen(); }

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
  el.innerHTML = knoepfe.map((k) => `<button type="button" data-l="${k.id}"${RBILD.has(k.zeichen) ? ` class="mitbild"` : ""} aria-label="${k.name}" title="${k.name}"><span>${RBILD.has(k.zeichen) ? rbild(k.zeichen) : RZEICHEN[k.zeichen]}</span>${k.id === "spieler" ? `<em class="zahl ez-freunde-zahl" hidden></em>` : ""}</button>`).join("");
  leisteOnline(zahlOnline); bogenLegen(); }
function bogenLegen(): void {
  const rahmen = document.getElementById("ez-kartenrahmen"), rund = rahmen && rahmen.querySelector(".rund") as HTMLElement | null, el = document.getElementById("ez-kbogen"); if (!rund || !el) return;
  const R = rund.offsetWidth / 2; if (!R) return; const g = Math.round(Math.max(30, Math.min(40, R * 0.6))), rb = R * 1.09 + g / 2 + 5, cx = rund.offsetLeft + R, cy = rund.offsetTop + R, n = el.children.length, schritt = (g + 7) / rb;
  [...el.children].forEach((b, i) => { const w = Math.PI + (i - (n - 1) / 2) * schritt; Object.assign((b as HTMLElement).style, { width: g + "px", height: g + "px", left: (cx + rb * Math.cos(w) - g / 2) + "px", top: (cy + rb * Math.sin(w) - g / 2) + "px" }); }); }

/* ───────── Lebenspunkte und Laufenergie (seit 25.11.2026): zwei stehende Balken links neben der Minikarte – breit das Leben, schmal die Laufenergie ───────── */
let balken: HTMLElement | null = null, lebenText = "";
export function boegenAufbauen(): void {
  const rahmen = document.getElementById("ez-kartenrahmen"); if (!rahmen) return;
  if (!balken || balken.parentElement !== rahmen) { balken = document.createElement("div"); balken.className = "ez-werte"; balken.setAttribute("aria-hidden", "true");
    balken.innerHTML = `<div class="bal leben" title="Lebenspunkte"><span class="medaille"><svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.6-9.1C.9 8.7 2.7 5 6.3 5c2.1 0 3.6 1.2 4.4 2.5h2.6C14.1 6.2 15.6 5 17.7 5c3.6 0 5.4 3.7 3.9 6.9C19.5 16.4 12 21 12 21z"/></svg></span><span class="rinne"><i class="fuell"></i><i class="glanz"></i></span><b class="zahl"></b><i class="stein"></i></div>
      <div class="bal lauf" title="Laufenergie"><span class="medaille"><svg viewBox="0 0 24 24"><path d="M13.5 2 5 13.2h5.6L9.5 22 19 9.8h-5.7z"/></svg></span><span class="rinne"><i class="fuell"></i><i class="glanz"></i></span><i class="stein"></i></div>`;
    { const m = document.createElement("span"); m.className = "ez-setmarke"; m.hidden = true; m.textContent = "⚜"; balken.appendChild(m); setZeigen(); addEventListener("ez-inventar", setZeigen); } /* #79: Set aktiv – Marke am Lebensbalken */
    rahmen.appendChild(balken); const rund = rahmen.querySelector(".rund") as HTMLElement | null;
    if (rund && "ResizeObserver" in window) new ResizeObserver(() => balkenLegen()).observe(rund); addEventListener("resize", () => balkenLegen()); }
  requestAnimationFrame(() => balkenLegen());
  lebenAnzeigen(null); gelbAnzeigen(1); }
/** Lebenspunkte zeigen (null: voll, ohne Zahl – außerhalb der Kampfgebiete) */
export function lebenAnzeigen(lp: number | null, max = 0): void { if (!balken) return; const a = lp === null || !max ? 1 : Math.max(0, Math.min(1, lp / max)), b = balken.querySelector(".leben") as HTMLElement;
  (b.querySelector(".fuell") as HTMLElement).style.height = (a * 100).toFixed(1) + "%"; b.classList.toggle("mittel", a <= 0.5 && a > 0.25); b.classList.toggle("wenig", a <= 0.25);
  const text = lp === null || !max ? "" : String(Math.round(lp)); if (text !== lebenText) { lebenText = text; (b.querySelector(".zahl") as HTMLElement).textContent = text; b.title = lp === null || !max ? "Lebenspunkte" : `Lebenspunkte ${Math.round(lp)} / ${max}`; } }
/** Laufenergie (0–1) */
export function gelbAnzeigen(anteil: number): void { if (!balken) return; ((balken.querySelector(".lauf .fuell")) as HTMLElement).style.height = (Math.max(0, Math.min(1, anteil)) * 100).toFixed(1) + "%"; }

/** #79: kleines Set-Symbol am Lebensbalken, solange ein Set vollständig angelegt ist (Tooltip „Rabenset 3/3“ mit Wirkung) */
function setZeigen(): void { const m = balken && balken.querySelector<HTMLElement>(".ez-setmarke"); if (!m) return;
  const S = aktiveSets(Object.values(inventar().angelegt)); m.hidden = !S.length; if (S.length) { const t = S.map((x) => `${x.name} ${x.teile.length}/${x.teile.length}: ${x.text}`).join("\n"); m.title = t; m.setAttribute("aria-label", t); } }
