/*
 * Kartensymbole entzerren (24.11.2026): Symbole bleiben auf jeder Zoomstufe gleich groß. Wo mehrere dicht beieinander liegen
 * (Schmiedeofen, Amboss und Handwerker vor derselben Schmiede), schieben sie sich gerade so weit auseinander, dass jedes ganz zu sehen ist –
 * je näher man heranzoomt, desto genauer stehen sie wieder auf ihrem Punkt.
 */
export type Symbolpunkt = { el: HTMLElement; x: number; y: number };

/** x, y: Lage auf dem Schirm in Pixeln; abstand: Mindestabstand der Mitten; faktor: Schirm-Pixel je Pixel im Element (Zoom der Ebene); nach: angehängte Umformung (etwa scale) */
export function symboleOrdnen(liste: Symbolpunkt[], abstand: number, faktor = 1, nach = ""): void {
  const n = liste.length, dx = new Float64Array(n), dy = new Float64Array(n);
  for (let runde = 0; runde < 60; runde++) { let bewegt = false;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      let ax = liste[i].x + dx[i] - (liste[j].x + dx[j]), ay = liste[i].y + dy[i] - (liste[j].y + dy[j]); let d = Math.hypot(ax, ay);
      if (d >= abstand - 0.01) continue; bewegt = true;
      if (d < 0.01) { ax = liste[i].x <= liste[j].x ? -1 : 1; ay = 0; d = 1; }   /* genau übereinander: nebeneinander legen */
      const schub = (abstand - d) / 2 + 0.05; dx[i] += (ax / d) * schub; dy[i] += (ay / d) * schub; dx[j] -= (ax / d) * schub; dy[j] -= (ay / d) * schub; }
    if (!bewegt) break; }
  liste.forEach((p, i) => { p.el.style.transform = `translate(calc(-50% + ${(dx[i] / faktor).toFixed(1)}px), calc(-58% + ${(dy[i] / faktor).toFixed(1)}px))${nach}`; });
}
