/*
 * Riftmere – laufende Wirkungen unter der Minikarte (Phase 3b): je Wirkung ein kleines Schild mit Symbol, Text und Restzeit (z. B. „Defense +2 · 4:32“).
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
  /* unter die Minikarte (3D-Welt), sonst unter das Profil oben links */
  const k = document.getElementById("ez-kartenrahmen"), r = k && k.getBoundingClientRect(), p = document.getElementById("ez-ich"), q = p && p.getBoundingClientRect();
  if (r && r.width) { el.style.top = Math.round(r.bottom + 6) + "px"; el.style.right = Math.round(innerWidth - r.right) + "px"; el.style.left = "auto"; el.style.justifyContent = "flex-end"; }
  else if (q && q.width) { el.style.top = Math.round(q.bottom + 6) + "px"; el.style.left = Math.round(q.left) + "px"; el.style.right = "auto"; }
  el.innerHTML = w.map((x) => { const D = WIRKUNGEN[x.id]; return `<span class="wirkung" data-w="${x.id}" title="${D ? D.name + ": " + D.text : x.id}"><img src="../${D ? D.symbol : ""}" alt=""><b>${D ? D.text : x.id}</b><i>${zeit(x.bis - jetzt)}</i></span>`; }).join("");
  if (!w.length && uhr) { clearInterval(uhr); uhr = undefined; } else if (w.length && !uhr) uhr = setInterval(zeichnen, 1000);
}
export function wirkanzeigeStarten(): void {
  if (document.getElementById("ez-wirkungen")) return;
  const el = document.createElement("div"); el.id = "ez-wirkungen"; el.hidden = true; document.body.appendChild(el);
  const st = document.createElement("style");
  st.textContent = `#ez-wirkungen { position: fixed; z-index: 30; display: flex; flex-wrap: wrap; gap: 4px; max-width: 260px; pointer-events: none; } #ez-wirkungen[hidden] { display: none; }
    #ez-wirkungen .wirkung { display: inline-flex; align-items: center; gap: 5px; padding: 1px 8px 1px 2px; border-radius: 10px; font: 600 11px Georgia, serif; color: #f3e6c4; background: rgba(30, 55, 30, .85); border: 1px solid #8fbf6a; box-shadow: 0 1px 4px rgba(0,0,0,.5); }
    #ez-wirkungen img { width: 18px; height: 18px; } #ez-wirkungen i { font-style: normal; color: #cfe8b8; font-variant-numeric: tabular-nums; }`;
  document.head.appendChild(st);
  addEventListener("ez-wirkungen", zeichnen); addEventListener("resize", zeichnen); zeichnen();
}
