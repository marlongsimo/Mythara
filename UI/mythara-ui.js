/*
 * Mythara UI-Baukasten – Helfer für Bausteine, deren Form berechnet wird.
 *
 *   muDock(element, { anKarte })   Halbmond-Dock: zeichnet den Bogen (SVG) und setzt die .mu-slot-Kinder auf den Bogen.
 *                                  anKarte: true, wenn das Dock links an einer .mu-minimap gleicher Größe (--mu-g) hängt
 *                                  (die Fläche reicht dann bis zur Kartenmitte, der Innenbogen folgt dem Kartenring).
 *   muAbklingen(slot, anteil)       Abklingzeit eines Slots zeigen (0 = bereit, 1 = gerade benutzt).
 *   muAlle(wurzel)                  muDock für alle [data-mu-dock] unter wurzel (Standard: document).
 *
 * Die Farben kommen aus den CSS-Variablen (--mu-m1 … --mu-m4), also wirken .mu-eis und .mu-bronze auch hier.
 * Gleiche Geometrie wie im Spiel (realtime/client/src/rahmen.ts, dock()).
 */
let zaehler = 0;

/** Form des Halbmonds in Einheiten des Kartenradius (100), Kartenmitte (0, 0) */
export function dockForm(n, ri = 106, links = 196, spitzeGrad = 100) {
  const spitze = spitzeGrad * Math.PI / 180, px = ri * Math.cos(spitze), py = ri * Math.sin(spitze);
  const sag = links + px, /* Pfeilhöhe: vom äußersten Punkt links bis zur Sehne durch die Spitzen (px ist negativ) */ rho = (py * py + sag * sag) / (2 * sag), cx = -links + rho;
  const weg = `M${px.toFixed(1)} ${(-py).toFixed(1)}A${rho.toFixed(1)} ${rho.toFixed(1)} 0 1 0 ${px.toFixed(1)} ${py.toFixed(1)}A${ri} ${ri} 0 0 1 ${px.toFixed(1)} ${(-py).toFixed(1)}Z`;
  const schritt = n <= 3 ? 40 : n === 4 ? 32 : 26, punkte = [];
  for (let i = 0; i < n; i++) {
    const g = (180 + (i - (n - 1) / 2) * schritt) * Math.PI / 180, ux = Math.cos(g), uy = Math.sin(g);
    const b = ux * cx, t = b + Math.sqrt(b * b - (cx * cx - rho * rho)), m = (ri + t) / 2 + 2; /* Mitte zwischen Innen- und Außenbogen */
    punkte.push([ux * m, uy * m]);
  }
  return { weg, punkte };
}

export function muDock(el, opt = {}) {
  const anKarte = opt.anKarte ?? el.classList.contains("mu-an-karte"), slots = [...el.querySelectorAll(":scope > .mu-slot")];
  const { weg, punkte } = dockForm(Math.max(1, slots.length));
  const [x0, x1] = anKarte ? [-204, 0] : [-204, -8], y0 = -120, y1 = 120, id = "mudock" + (++zaehler);
  el.querySelector(":scope > svg")?.remove();
  el.style.width = `calc(var(--mu-g) * ${(1.2 * (x1 - x0) / (y1 - y0)).toFixed(3)})`;
  el.insertAdjacentHTML("afterbegin", `<svg viewBox="${x0} ${y0} ${x1 - x0} ${y1 - y0}" aria-hidden="true">
    <defs><linearGradient id="${id}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--mu-m1)"/><stop offset=".35" style="stop-color:var(--mu-m3)"/><stop offset=".6" style="stop-color:var(--mu-m1)"/><stop offset="1" style="stop-color:var(--mu-m4)"/></linearGradient>
    <radialGradient id="${id}g" cx="-70" cy="0" r="150" gradientUnits="userSpaceOnUse"><stop offset="0" style="stop-color:var(--mu-grund-a)"/><stop offset="1" style="stop-color:var(--mu-grund-c)"/></radialGradient></defs>
    <path d="${weg}" fill="url(#${id}g)" stroke="#000" stroke-width="9" stroke-linejoin="round" opacity=".85"/>
    <path d="${weg}" fill="url(#${id}g)" stroke="url(#${id}m)" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="${weg}" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="1.2" transform="translate(-6 0) scale(.955)"/></svg>`);
  slots.forEach((s, i) => { const [x, y] = punkte[i]; s.style.left = ((x - x0) / (x1 - x0) * 100).toFixed(2) + "%"; s.style.top = ((y - y0) / (y1 - y0) * 100).toFixed(2) + "%"; });
}

export function muAbklingen(slot, anteil) {
  const a = Math.max(0, Math.min(1, anteil)); slot.style.setProperty("--mu-cd", String(a)); slot.classList.toggle("ist-abklingend", a > 0);
}

export function muAlle(wurzel = document) { wurzel.querySelectorAll("[data-mu-dock]").forEach((el) => muDock(el)); }
