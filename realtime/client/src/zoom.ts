/* Zoom-Einstellung für alle Ansichten: 80 bis 120 Prozent, auf dem Gerät gemerkt. Der Knopf sitzt oben rechts. */
const STUFEN = [0.8, 0.9, 1, 1.1, 1.2];
let stufe = 2; try { const s = Number(localStorage.getItem("ez_zoom")); if (STUFEN.includes(s)) stufe = STUFEN.indexOf(s); } catch { /* privat */ }
/** Der gewählte Faktor (0.8 bis 1.2) */
export const zoomFaktor = () => STUFEN[stufe];
/** Den Knopf anschließen; `neu` wird gerufen, wenn sich die Einstellung ändert. */
export function zoomKnopf(neu: () => void) {
  const el = document.querySelector("#ez-zoom") as HTMLElement; if (!el) return; el.hidden = false; const zeige = () => { (el.querySelector("b") as HTMLElement).textContent = Math.round(STUFEN[stufe] * 100) + " %"; }; zeige();
  for (const k of Array.from(el.querySelectorAll<HTMLElement>("button"))) { k.onpointerdown = (e) => e.stopPropagation(); k.onclick = (e) => { e.stopPropagation(); stufe = Math.max(0, Math.min(STUFEN.length - 1, stufe + Number(k.dataset.z))); try { localStorage.setItem("ez_zoom", String(STUFEN[stufe])); } catch { /* privat */ } zeige(); neu(); }; }
}
