/*
 * Mythara – Neuigkeiten vom „Game Developer“: Megafon im Dorfkopf, Fenster mit den Meldungen, Punkt für Ungelesenes.
 *
 * Die Meldungen stehen in daten/neuigkeiten.json (neueste zuerst oder beliebig; sortiert wird nach Datum):
 *   { "id": "eindeutig", "datum": "JJJJ-MM-TT", "art": "info" | "balance" | "held" | "roadmap" | "wartung",
 *     "titel": "…", "text": "Absätze durch Leerzeile getrennt, Zeilen mit „- “ werden zur Liste",
 *     "link": { "text": "Zum Händler", "hub": "shop" }   oder   { "text": "…", "url": "https://…" }   (optional) }
 * Veröffentlichen heißt: einen Eintrag ergänzen und ausliefern. Die Datei wird am Zwischenspeicher vorbei geladen.
 * „Gelesen“ merkt sich das Gerät (localStorage), nicht das Konto.
 */
(function () {
  "use strict";
  const KEY = "mythara_funk_gelesen", $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ART = { info: "Neuigkeit", balance: "Balance", held: "Neuer Held", roadmap: "Roadmap", wartung: "Wartung" };
  const MEGAFON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 3.500v15l-8-3.600H7.500l1.300 5.200a1 1 0 0 1-1 1.300H6.300a1 1 0 0 1-1-.800L4 14.700A3.500 3.500 0 0 1 2 11.500v-1A3.500 3.500 0 0 1 5.500 7H11zM20.500 8.300a3.500 3.500 0 0 1 0 5.400z"/></svg>`;
  let liste = null, geladenUm = 0;
  const gelesen = () => { try { return new Set(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch (e) { return new Set(); } };
  const merken = (ids) => { try { localStorage.setItem(KEY, JSON.stringify([...ids].slice(-200))); } catch (e) { /* privat */ } };
  const tag = (d) => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || ""); return m ? `${+m[3]}.${+m[2]}.${m[1]}` : ""; };

  async function laden(neu) {
    if (liste && !neu && Date.now() - geladenUm < 5 * 60000) return liste;
    try { const r = await fetch("daten/neuigkeiten.json?frisch=" + Date.now(), { cache: "no-store" }); if (!r.ok) throw new Error(String(r.status));
      const l = await r.json(); liste = (Array.isArray(l) ? l : []).filter((x) => x && x.id && x.titel).sort((a, b) => String(b.datum).localeCompare(String(a.datum))); geladenUm = Date.now(); }
    catch (e) { liste = liste || []; }
    return liste;
  }
  const ungelesen = () => { const g = gelesen(); return (liste || []).filter((x) => !g.has(x.id)).length; };
  function punkt() { const k = $("#hub-funk"); if (!k) return; const n = ungelesen(), z = k.querySelector(".hub-zahl"); k.classList.toggle("neu", n > 0); if (z) { z.hidden = !n; z.textContent = n; } k.setAttribute("aria-label", n ? `Neuigkeiten (${n} ungelesen)` : "Neuigkeiten"); }
  /** Knopf für den Dorfkopf */
  const knopf = () => `<button class="hub-rund" id="hub-funk" aria-label="Neuigkeiten" title="Neuigkeiten vom Game Developer"><span class="my-ico">${MEGAFON}</span><span class="hub-zahl" hidden></span></button>`;
  async function binden() { const k = $("#hub-funk"); if (!k) return; k.onclick = zeigen; await laden(); punkt(); }

  function textHtml(t) {
    return String(t || "").split(/\n\s*\n/).map((ab) => { const z = ab.split("\n").map((x) => x.trim()).filter(Boolean);
      return z.length && z.every((x) => /^[-•]\s+/.test(x)) ? `<ul>${z.map((x) => `<li>${esc(x.replace(/^[-•]\s+/, ""))}</li>`).join("")}</ul>` : `<p>${z.map(esc).join("<br>")}</p>`; }).join("");
  }
  async function zeigen() {
    await laden(true); if (!window.MYTHARA) return;
    const g = gelesen();
    const o = window.MYTHARA.fenster("Neuigkeiten", liste.length ? `<div class="funk">${liste.map((x) => `<article class="funk-meldung${g.has(x.id) ? "" : " neu"}" data-art="${esc(x.art || "info")}">
        <header><span class="funk-art">${esc(ART[x.art] || ART.info)}</span><span class="funk-von">Game Developer · ${esc(tag(x.datum))}</span>${g.has(x.id) ? "" : `<i class="funk-neu">neu</i>`}</header>
        <h3>${esc(x.titel)}</h3>${textHtml(x.text)}
        ${x.link && x.link.text ? (x.link.url && /^https:\/\//.test(x.link.url) ? `<a class="btn klein" href="${esc(x.link.url)}" target="_blank" rel="noopener">${esc(x.link.text)}</a>` : x.link.hub ? `<button class="btn klein" data-funk-hub="${esc(x.link.hub)}">${esc(x.link.text)}</button>` : "") : ""}</article>`).join("")}</div>`
      : `<p class="note">Noch keine Neuigkeiten.</p>`);
    o.querySelectorAll("[data-funk-hub]").forEach((b) => { b.onclick = () => { const zu = $("#fenster-zu"); if (zu) zu.click(); const z = document.querySelector(`.hub-nav-punkt[data-hub="${b.dataset.funkHub}"], .dorf-ort[data-hub="${b.dataset.funkHub}"]`); if (z) z.click(); }; });
    liste.forEach((x) => g.add(x.id)); merken(g); punkt();
  }
  window.NEUIGKEITEN = { knopf, binden, zeigen, laden, ungelesen };
})();
