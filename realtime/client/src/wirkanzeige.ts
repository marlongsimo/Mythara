/*
 * Riftmere – laufende Wirkungen im Profil oben links (Phase 3b): je Wirkung ein kleines Schild mit Symbol, Text und Restzeit (z. B. „Defense +2 · 4:32“).
 * Die Wirkungen kommen vom Server (inventar.ts wirkungenJetzt, Ereignis „ez-wirkungen“); die Uhr läuft im Browser, abgelaufene verschwinden von selbst.
 */
import { wirkungenJetzt } from "./inventar";
import { WIRKUNGEN } from "../../shared/wirkungen";

const zeit = (ms: number) => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
let uhr: ReturnType<typeof setInterval> | undefined;
function zeichnen(): void {
  const el = document.getElementById("ez-wirkungen"); if (!el) return;
  const w = wirkungenJetzt(), jetzt = Date.now();
  el.hidden = !w.length;
  el.innerHTML = w.map((x) => { const D = WIRKUNGEN[x.id]; return `<span class="wirkung" data-w="${x.id}" title="${D ? D.name + ": " + D.text : x.id}"><img src="../${D ? D.symbol : ""}" alt=""><b>${D ? D.text : x.id}</b><i>${zeit(x.bis - jetzt)}</i></span>`; }).join("");
  if (!w.length && uhr) { clearInterval(uhr); uhr = undefined; } else if (w.length && !uhr) uhr = setInterval(zeichnen, 1000);
}
export function wirkanzeigeStarten(): void {
  const werte = document.querySelector("#ez-ich .werte"); if (!werte || document.getElementById("ez-wirkungen")) return;
  const el = document.createElement("span"); el.id = "ez-wirkungen"; el.hidden = true; werte.appendChild(el);
  const st = document.createElement("style");
  st.textContent = `#ez-wirkungen { display: flex; flex-wrap: wrap; gap: 4px; } #ez-wirkungen[hidden] { display: none; }
    #ez-wirkungen .wirkung { display: inline-flex; align-items: center; gap: 5px; padding: 1px 8px 1px 2px; border-radius: 10px; font: 600 11px Georgia, serif; color: #f3e6c4; background: rgba(40, 70, 40, .75); border: 1px solid #8fbf6a; }
    #ez-wirkungen img { width: 18px; height: 18px; } #ez-wirkungen i { font-style: normal; color: #cfe8b8; font-variant-numeric: tabular-nums; }`;
  document.head.appendChild(st);
  addEventListener("ez-wirkungen", zeichnen); zeichnen();
}
