/*
 * Heldenhalle der Waldmark: die fünf spielbaren Helden mit Stufe, Erfahrung, Werten und Fähigkeiten.
 * Erfahrung (EP) gibt es in Kampagnenkämpfen für jeden besiegten Gegner, für alle Helden des Teams. Sie liegt im Spielstand unter „ez_ep“.
 */
import { HELDEN, HELDENREIHE, EP_BIS, STUFE_MAX, stufeAusEp, STUFENBONUS } from "../../shared/config";

const $ = (s: string) => document.querySelector(s) as HTMLElement;
/** Erfahrung aller Helden aus dem Spielstand */
export function epAlle(): Record<string, number> { try { const o = JSON.parse(localStorage.getItem("ez_ep") || "{}"); return o && typeof o === "object" ? o : {}; } catch { return {}; } }
/** Erfahrung gutschreiben; gibt die neue Stufe zurück, wenn der Held aufgestiegen ist */
export function epDazu(typ: string, n: number): number { const o = epAlle(), vor = stufeAusEp(o[typ] || 0); o[typ] = (o[typ] || 0) + n; try { localStorage.setItem("ez_ep", JSON.stringify(o)); } catch { /* privat */ } const nach = stufeAusEp(o[typ]); return nach > vor ? nach : 0; }

const w3 = (o: { nah: number; fern: number; magie: number }, plus = 0) => `${o.nah + plus} / ${o.fern + plus} / ${o.magie + plus}`;
/** Die Heldenhalle als Tafel öffnen; `zu` wird beim Schließen gerufen. */
export function heldenhalle(zu: () => void) {
  const f = $("#ez-konto"); f.hidden = false; let wahl = HELDENREIHE[0]; try { const h = localStorage.getItem("ez_held") || ""; if (HELDEN[h]) wahl = h; } catch { /* privat */ }
  const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); schliessen(); } }; addEventListener("keydown", esc, true);
  const schliessen = () => { removeEventListener("keydown", esc, true); f.hidden = true; f.innerHTML = ""; zu(); };
  const zeichne = () => { const ep = epAlle(), H = HELDEN[wahl], e = ep[wahl] || 0, s = stufeAusEp(e), B = STUFENBONUS(s), N = s < STUFE_MAX ? STUFENBONUS(s + 1) : null;
    const von = EP_BIS[s], bis = s < STUFE_MAX ? EP_BIS[s + 1] : EP_BIS[s], anteil = s < STUFE_MAX ? Math.min(1, (e - von) / (bis - von)) : 1;
    f.innerHTML = `<div class="tafel breit"><i class="ecke a"></i><i class="ecke b"></i><i class="ecke c"></i><i class="ecke d"></i><button type="button" class="schliessen" data-t="zu" aria-label="Schließen">✕</button>
      <h2>Heldenhalle</h2><div class="zier"></div>
      <div class="bildnisse">${HELDENREIHE.map((k) => `<button type="button" data-held="${k}" class="${k === wahl ? "an" : ""}"><img src="../${HELDEN[k].bild}" alt="${HELDEN[k].name}"><small>${HELDEN[k].name} · St. ${stufeAusEp(ep[k] || 0)}</small></button>`).join("")}</div>
      <div class="held">
        <div class="kopf"><img src="../${H.bild}" alt=""><div><b>${H.name}</b><small>${H.titel} · ${H.klasse}</small><small class="rolle">${H.rolle}</small></div><span class="stufe"><em>Stufe</em>${s}</span></div>
        <div class="ep"><i style="width:${Math.round(anteil * 100)}%"></i><span>${s < STUFE_MAX ? `${e - von} / ${bis - von} EP bis Stufe ${s + 1}` : `Höchste Stufe · ${e} EP`}</span></div>
        <table class="werte2"><tr><th></th><th>Stufe ${s}</th>${N ? `<th>Stufe ${s + 1}</th>` : ""}</tr>
          <tr><td>Lebenspunkte</td><td>${Math.round(H.lp * (1 + B.lp))}</td>${N ? `<td>${Math.round(H.lp * (1 + N.lp))}</td>` : ""}</tr>
          <tr><td>Angriff Nah / Fern / Magie</td><td>${w3(H.angriff, B.angriff)}</td>${N ? `<td>${w3(H.angriff, N.angriff)}</td>` : ""}</tr>
          <tr><td>Verteidigung Nah / Fern / Magie</td><td>${w3(H.abwehr, B.abwehr)}</td>${N ? `<td>${w3(H.abwehr, N.abwehr)}</td>` : ""}</tr>
          <tr><td>Schaden</td><td>+${Math.round(B.schaden * 100)} %</td>${N ? `<td>+${Math.round(N.schaden * 100)} %</td>` : ""}</tr>
          <tr><td>Abklingzeiten</td><td>${B.abklingen ? "−" + Math.round(B.abklingen * 100) + " %" : "–"}</td>${N ? `<td>${N.abklingen ? "−" + Math.round(N.abklingen * 100) + " %" : "–"}</td>` : ""}</tr></table>
        <h3>Waffen</h3><ul>${H.modi.map((m) => `<li><b>${m.name}</b> <span>${m.schaden[1] ? Math.round(m.schaden[0] * (1 + B.schaden)) + "–" + Math.round(m.schaden[1] * (1 + B.schaden)) + " · " : ""}${m.art} · alle ${m.takt} s</span><br>${m.text}</li>`).join("")}</ul>
        <h3>Fähigkeiten</h3><ul>${(["q", "e", "r"] as const).map((t) => { const q = H[t]; return `<li><b>${t.toUpperCase()} · ${q.name}</b> <span>alle ${Math.round(q.zeit * (1 - B.abklingen) * 10) / 10} s</span><br>${q.text}</li>`; }).join("")}<li><b>Passiv</b><br>${H.passiv}</li></ul>
        <h3>Stufenweg</h3><div class="weg">${Array.from({ length: STUFE_MAX }, (_, i) => `<span class="${i + 1 <= s ? "an" : ""}${i + 1 === 5 || i + 1 === 10 ? " mark" : ""}" title="${i + 1 === 5 ? "Abklingzeiten −10 %" : i + 1 === 10 ? "Abklingzeiten −20 %" : ""}">${i + 1}</span>`).join("")}</div>
        <p class="klein">Je Stufe: +5 % Lebenspunkte, +3 Angriff und Verteidigung, +3 % Schaden. Auf Stufe 5 und 10 laden Fähigkeiten schneller. Erfahrung gibt es in Kampagnen für jeden besiegten Gegner – für alle Helden im Team.</p>
      </div>
      <div class="reihe"><button type="button" class="haupt" data-t="zu">Halle verlassen</button></div></div>`; };
  zeichne();
  f.onpointerdown = (e) => e.stopPropagation(); f.onkeydown = (e) => e.stopPropagation(); f.onkeyup = (e) => e.stopPropagation();
  f.onclick = (e) => { const el = (e.target as HTMLElement).closest("[data-t],[data-held]") as HTMLElement | null; if (e.target === f) { schliessen(); return; } if (!el) return; if (el.dataset.held) { wahl = el.dataset.held; zeichne(); } else if (el.dataset.t === "zu") schliessen(); };
}
