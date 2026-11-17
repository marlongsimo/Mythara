/*
 * Mythara – neue Helden: Freigabe und Start-Angebot (Datenbank: Migration 033).
 *
 *  • Ein neuer Held steckt schon in den Regeln (js/figuren.js), steht aber nicht in ABF.REIHE und ist damit unsichtbar.
 *    Sichtbar wird er, sobald er im Heldenkatalog der Datenbank steht (rpg_hero_katalog) – das Spiel fragt beim Öffnen des
 *    Dorfs nach und merkt sich die Antwort im Browser, damit er beim nächsten Laden sofort da ist.
 *  • Start-Angebot beim Händler, ganz oben: Held, Skin und Erfahrungspakete zusammen günstiger, für wenige Tage.
 *  • Admin-Bereich, Reiter „Helden“: Plan ansehen und den Schalter umlegen (rpg_admin_hero_release).
 */
(function () {
  "use strict";
  const KEY = "mythara_helden_frei", $ = (s) => document.querySelector(s), F = () => window.ABF;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const netz = () => window.AB && window.AB.liveClient && window.AB.liveClient();
  const fehlt = (e) => Boolean(e && (e.code === "PGRST202" || e.code === "42883" || /Could not find the function|schema cache|does not exist/i.test(e.roh || e.message || "")));
  const WN = () => (window.ARENA ? window.ARENA.WAEHRUNG : "Seelensplitter"), WZ = () => (window.ARENA ? window.ARENA.ZEICHEN : "◈");
  const PAKET_NAME = { klein: "kleines Erfahrungspaket (50 EP)", mittel: "mittleres Erfahrungspaket (150 EP)", gross: "großes Erfahrungspaket (350 EP)" };
  const restZeit = (bis) => { const ms = new Date(bis).getTime() - Date.now(); if (ms <= 0) return "0 Min."; const t = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4); return t ? `${t} T. ${h} Std.` : h ? `${h} Std. ${m} Min.` : `${Math.max(1, m)} Min.`; };
  let angebote = [], geld = 0, geprueft = false;

  /** Freigegebene Helden in die Anzeigereihenfolge aufnehmen (hinter den letzten Helden derselben Klasse) */
  function aufnehmen(ids) {
    const A = F(); let neu = false;
    for (const id of ids || []) { if (!A.FIGUREN[id] || A.REIHE.includes(id)) continue;
      let i = -1; A.REIHE.forEach((f, n) => { if (A.FIGUREN[f].klasse === A.FIGUREN[id].klasse) i = n; }); A.REIHE.splice(i + 1, 0, id); neu = true; }
    return neu;
  }
  try { aufnehmen(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch (e) { /* privat */ }
  /** Beim Öffnen des Dorfs: den Heldenkatalog fragen (einmal je Seitenaufruf). Zurück: true, wenn ein Held neu dazugekommen ist */
  async function pruefen() {
    if (geprueft || !netz()) return false; geprueft = true;
    try { await netz().ensureUser(); const l = await netz().rpc("rpg_hero_katalog", {}); if (!Array.isArray(l)) return false;
      const extra = l.filter((id) => F().FIGUREN[id] && F().FREIGABE && id in F().FREIGABE);
      try { localStorage.setItem(KEY, JSON.stringify(extra)); } catch (e) { /* privat */ }
      return aufnehmen(extra); }
    catch (e) { geprueft = !fehlt(e) ? false : true; return false; }
  }

  /* ---------- Start-Angebot beim Händler ---------- */
  async function laden() {
    angebote = [];
    try { const r = await netz().rpc("rpg_launch_list", {}); if (r && r.konto) { geld = r.waehrung || 0; angebote = (r.angebote || []).filter((a) => F().FIGUREN[a.held] && new Date(a.bis).getTime() > Date.now()); } } catch (e) { /* ohne Angebot */ }
    return angebote;
  }
  const skinBild = (a) => (a.skin ? "img/figuren/ganz/" + a.skin + "-gross.webp" : null), heldBild = (a) => "img/figuren/ganz/" + a.held + "-gross.webp";
  const skinName = (a) => (a.skin && F().SKINS && F().SKINS[a.skin] ? F().SKINS[a.skin].name : "Skin");
  function angebotHtml() {
    return angebote.map((a) => { const d = F().FIGUREN[a.held];
      return `<button class="shop-angebot paket start${a.gekauft ? " gekauft" : ""}" data-start="${esc(a.id)}"><span class="shop-angebot-band">★ Neue Heldin · Start-Angebot</span>${a.gekauft ? "" : `<span class="shop-angebot-rabatt">−${Math.round(100 * (1 - a.preis / a.einzeln))} %</span>`}
        <span class="paket-faecher zwei" aria-hidden="true"><img src="${heldBild(a)}" alt="" style="--i:-.5">${a.skin ? `<img src="${skinBild(a)}" alt="" style="--i:.5">` : ""}</span>
        <span class="shop-angebot-text"><b>${esc(d.name)}</b><small>${esc(d.titel)} · mit Skin „${esc(skinName(a))}“ und ${a.ep} EP</small><span class="my-link">Ansehen</span></span>
        <span class="shop-angebot-kauf">${a.gekauft ? `<span class="shop-gekauft">✓ Gekauft</span>` : `<span class="shop-preis"><s><i>${WZ()}</i> ${a.einzeln}</s> <b><i>${WZ()}</i> ${a.preis}</b> <span>${WN()}</span></span>`}
          <em class="shop-uhr">Noch <strong>${restZeit(a.bis)}</strong></em></span></button>`; }).join("");
  }
  function angebotBinden() { document.querySelectorAll("[data-start]").forEach((b) => { b.onclick = () => zeigen(b.dataset.start); }); }
  function zeigen(id, meldung) {
    const a = angebote.find((x) => x.id === id); if (!a || !window.MYTHARA) return;
    const d = F().FIGUREN[a.held], kl = F().KLASSEN[d.klasse], fehlt2 = Math.max(0, a.preis - geld);
    const pakete = Object.entries(a.pakete || {}).map(([p, n]) => `<li><b>${n}×</b> ${esc(PAKET_NAME[p] || p)}</li>`).join("");
    window.MYTHARA.seite("shop", `<div class="shop" data-shop data-startseite="${esc(id)}"><button class="hub-zurueck shop-zurueck" data-shop-zurueck>← Zum Händler</button>
      <div class="shop-kopf"><div><p class="shop-eyebrow">Start-Angebot · noch ${restZeit(a.bis)}</p><h1 class="hub-gruss">${esc(d.name)}, ${esc(d.titel.replace(/^Die |^Der /, (m) => m.toLowerCase()))}</h1><p class="hub-untertitel">${esc(kl.name)} · ${esc(d.rolle)}. „${esc(d.spruch)}“</p></div>
        <p class="shop-konto"><i>${WZ()}</i> <b>${geld}</b> ${WN()}</p></div>
      ${meldung ? `<p class="shop-meldung" role="status">${esc(meldung)}</p>` : ""}
      <div class="start-inhalt" style="--k:${kl.farbe}"><div class="start-bilder"><figure><img src="${heldBild(a)}" alt="${esc(d.name)}"><figcaption>${esc(d.name)}</figcaption></figure>${a.skin ? `<figure><img src="${skinBild(a)}" alt=""><figcaption>Skin „${esc(skinName(a))}“</figcaption></figure>` : ""}</div>
        <div class="start-liste"><h2>Das steckt drin</h2><ul><li><b>${esc(d.name)}</b> für deine Sammlung${a.hat_held ? " <em>(hast du schon)</em>" : ""}</li>${a.skin ? `<li>Skin <b>„${esc(skinName(a))}“</b>${a.hat_skin ? " <em>(hast du schon)</em>" : ""}</li>` : ""}${pakete}</ul>
          <p class="note">Die Erfahrungspakete (zusammen ${a.ep} EP) landen in deinem Vorrat und reichen, um ${esc(d.name)} von Stufe 1 auf Stufe 5 zu bringen.</p>
          <button class="my-link" data-start-held="${esc(a.held)}">Fähigkeiten ansehen</button></div></div>
      <div class="paket-kauf">${a.gekauft ? `<span class="shop-gekauft">✓ Du hast dieses Angebot gekauft. ${esc(d.name)} wartet in der Heldenhalle, die Pakete beim Händler unter „Erfahrung“.</span>`
        : `<p class="shop-preis"><s><i>${WZ()}</i> ${a.einzeln}</s> <b><i>${WZ()}</i> ${a.preis}</b> <span>${WN()}</span></p>
           <button class="btn gross" data-start-kauf ${fehlt2 ? "disabled" : ""}>Für <i>${WZ()}</i> ${a.preis} kaufen</button>
           ${fehlt2 ? `<small class="shop-fehlt">Dir fehlen ${fehlt2} ${WN()}.</small>` : ""}${a.hat_held || a.hat_skin ? `<small class="note">Einen Teil davon besitzt du schon; der Angebotspreis bleibt gleich.</small>` : ""}`}</div></div>`);
    const z = $("[data-shop-zurueck]"); if (z) z.onclick = () => window.MYTHARA.shop();
    const h = $("[data-start-held]"); if (h) h.onclick = () => window.MYTHARA.fenster(d.name, window.ABH_HELDEN.detail(a.held, 1, ""));
    const k = $("[data-start-kauf]"); if (k) k.onclick = async () => {
      if (!confirm(`Start-Angebot „${d.name}“ für ${a.preis} ${WN()} kaufen?`)) return; k.disabled = true;
      try { await netz().rpc("rpg_launch_buy", { p_id: id }); await laden(); if (window.SKINS) await window.SKINS.laden().catch(() => {}); if (window.ABSAMMLUNG) await window.ABSAMMLUNG.laden(true).catch(() => {});
        if (window.MYTHARA.waehrungZeigen) window.MYTHARA.waehrungZeigen(geld); if (window.ARENA && window.ARENA.pruefen) window.ARENA.pruefen(true).catch(() => {});
        zeigen(id, `${d.name} gehört jetzt zu deiner Sammlung.`); }
      catch (e) { await laden(); if (angebote.find((x) => x.id === id)) zeigen(id, e.message); else window.MYTHARA.shop(e.message); } };
  }

  /* ---------- Admin-Bereich: Reiter „Helden“ ---------- */
  async function admin(meldung) {
    if (!window.MYTHARA) return;
    let l; try { l = await netz().rpc("rpg_admin_hero_plan", {}); }
    catch (e) { return window.MYTHARA.fenster("Helden-Freigabe", `<p class="note">${fehlt(e) ? "Die Helden-Freigabe ist in der Datenbank noch nicht eingerichtet (Migration 033)." : esc(e.message)}</p>`); }
    const wann = (x) => { try { return new Date(x).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }); } catch (e) { return ""; } };
    const o = window.MYTHARA.fenster("Helden-Freigabe", `<div class="fb-admin">${meldung ? `<p class="shop-meldung" role="status">${esc(meldung)}</p>` : ""}
      ${l.length ? l.map((g) => { const d = F().FIGUREN[g.held], bekannt = Boolean(d);
        return `<article class="fb-eintrag${g.freigegeben ? "" : " neu"}"><header><span class="fb-marke">${g.freigegeben ? "freigegeben" : "wartet"}</span><b>${esc(bekannt ? d.name + ", " + d.titel : g.held)}</b></header>
          <p>Start-Angebot: Held${g.skin ? ", Skin" : ""}, Erfahrungspakete (${esc(Object.entries(g.pakete || {}).map(([p, n]) => n + "× " + p).join(", "))}) für <b>${g.preis}</b> ${WN()}, ${g.tage} Tage.</p>
          ${g.freigegeben ? `<small>Freigegeben am ${esc(wann(g.freigegeben))} · Angebot bis ${esc(wann(g.angebot_bis))} · ${g.gekauft}× gekauft</small>`
            : bekannt ? `<button class="btn" data-frei="${esc(g.held)}">${esc(d.name)} jetzt freigeben</button><br><small>Ab dann ist ${esc(d.name)} für alle sichtbar und wie jeder Held zu bekommen, und das Start-Angebot läuft ${g.tage} Tage. Das lässt sich nicht zurücknehmen.</small>`
            : `<small>Dieses Spiel kennt den Helden noch nicht. Erst das Spiel aktualisieren.</small>`}</article>`; }).join("") : `<p class="note">Es ist keine Freigabe vorbereitet.</p>`}</div>`);
    o.querySelectorAll("[data-frei]").forEach((b) => { b.onclick = async () => { const d = F().FIGUREN[b.dataset.frei];
      if (!confirm(`${d.name} jetzt für alle Spieler freigeben und das Start-Angebot starten? Das lässt sich nicht zurücknehmen.`)) return; b.disabled = true;
      try { await netz().rpc("rpg_admin_hero_release", { p_held: b.dataset.frei }); geprueft = false; await pruefen(); admin(`${d.name} ist freigegeben. Das Start-Angebot läuft.`); } catch (e) { admin(e.message); } }; });
  }
  window.FREIGABE = { pruefen, laden, angebotHtml, angebotBinden, zeigen, admin, aufnehmen };
})();
