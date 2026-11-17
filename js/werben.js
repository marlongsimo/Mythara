/*
 * Mythara – Freunde werben: Kommt ein Freund über den Einladungslink ins Spiel und beendet seine erste Kampagne,
 * bekommen beide je einen Heldentoken (Datenbank: Migration 028; der Werber wird für höchstens fünf Freunde belohnt).
 *
 *   • Einladungslink: https://mythara-dungeon.de/?von=<Benutzername>. Startseite und Spiel merken sich den Namen im Browser.
 *   • Sobald der neue Spieler mit einem Konto im Dorf steht, wird der Werber einmal eingetragen (rpg_referral_set).
 *   • Im Dorf zeigt ein Hinweis den Weg zum Fenster „Freunde einladen“ (Link kopieren/teilen, Stand).
 * Ohne Migration 028 bleibt alles unsichtbar; es gibt keine Fehlermeldungen.
 */
(function () {
  "use strict";
  const KEY = "mythara_von", NAME = /^[A-Za-z0-9_ÄÖÜäöüß]{3,20}$/, $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const netz = () => window.AB && window.AB.liveClient && window.AB.liveClient();
  const fehlt = (e) => Boolean(e && (e.code === "PGRST202" || e.code === "42883" || /Could not find the function|schema cache|does not exist/i.test(e.roh || e.message || "")));
  let stand = null, laeuft = false;

  /** ?von=Name aus der Adresse merken (und aus der Adresszeile nehmen, damit er nicht in Lesezeichen landet) */
  function merken() {
    try {
      const u = new URL(location.href), von = (u.searchParams.get("von") || "").trim();
      if (!von) return;
      if (NAME.test(von)) localStorage.setItem(KEY, von);
      u.searchParams.delete("von"); history.replaceState(null, "", u.pathname + (u.searchParams.toString() ? "?" + u.searchParams : "") + u.hash);
    } catch (e) { /* privat */ }
  }
  const gemerkt = () => { try { return localStorage.getItem(KEY) || ""; } catch (e) { return ""; } };
  const vergessen = () => { try { localStorage.removeItem(KEY); } catch (e) { /* privat */ } };
  const link = (name) => location.origin + "/?von=" + encodeURIComponent(name);

  /** Im Dorf: Werber eintragen (einmal), Stand laden, Hinweis zeigen. konto = angemeldetes Spielerkonto */
  async function hub(konto) {
    const platz = $("#hub-start"); let el = $("#werben-hinweis");
    if (!konto || !netz()) { if (el) el.hidden = true; return; }
    if (laeuft) return; laeuft = true;
    try {
      const von = gemerkt();
      if (von) {
        try { const r = await netz().rpc("rpg_referral_set", { p_von: von }); vergessen(); if (r && r.ok && window.MYTHARA) window.MYTHARA.toast(`${r.von} hat dich nach Mythara eingeladen. Beende deine erste Kampagne, dann bekommt ihr beide einen Heldentoken.`); }
        catch (e) { if (!fehlt(e)) vergessen(); }   // ohne Migration 028: später noch einmal versuchen
      }
      try { stand = await netz().rpc("rpg_referral_status", {}); } catch (e) { stand = null; }
      if (!stand || !stand.konto || !stand.name || !platz) { if (el) el.hidden = true; return; }
      if (!el) { el = document.createElement("button"); el.id = "werben-hinweis"; el.className = "werben-hinweis"; el.type = "button"; platz.appendChild(el); el.onclick = zeigen; }
      const frei = stand.belohnt < stand.max;
      el.innerHTML = `<img src="img/shop/heldentoken.webp" alt=""><span><b>Freunde einladen</b><small>${frei ? "Je ein Heldentoken für dich und deinen Freund, sobald er seine erste Kampagne beendet." : "Du hast alle Heldentoken für geworbene Freunde erhalten."}</small></span><i>${stand.belohnt} / ${stand.max}</i>`;
      el.hidden = false;
      // Selbst geworben und die erste Kampagne beendet? Einmal Bescheid sagen.
      try { const k2 = "mythara_geworben_" + stand.name; if (stand.selbst_belohnt && !localStorage.getItem(k2)) { localStorage.setItem(k2, "1"); if (window.MYTHARA) window.MYTHARA.toast("Erste Kampagne beendet: Du und " + (stand.von || "dein Freund") + " bekommt je einen Heldentoken. Einlösen kannst du ihn in der Heldenhalle."); } } catch (e) { /* privat */ }
      // Neuer Token seit dem letzten Besuch? Einmal Bescheid sagen.
      try { const k = "mythara_werben_" + stand.name, alt = Number(localStorage.getItem(k) || 0); if (stand.belohnt > alt && window.MYTHARA) { if (localStorage.getItem(k) != null) window.MYTHARA.toast(stand.belohnt - alt === 1 ? "Ein geworbener Freund hat seine erste Kampagne beendet: Du bekommst einen Heldentoken!" : `${stand.belohnt - alt} geworbene Freunde haben ihre erste Kampagne beendet: ${stand.belohnt - alt} Heldentoken für dich!`); } localStorage.setItem(k, String(stand.belohnt)); } catch (e) { /* privat */ }
    } finally { laeuft = false; }
  }

  function zeigen() {
    if (!stand || !window.MYTHARA) return;
    const url = link(stand.name), teilbar = typeof navigator.share === "function";
    const freunde = stand.freunde && stand.freunde.length
      ? `<ul class="werben-liste">${stand.freunde.map((f) => `<li><b>${esc(f.name)}</b><span class="${f.belohnt ? "ok" : ""}">${f.belohnt ? "Kampagne beendet · Token erhalten" : "spielt noch seine erste Kampagne"}</span></li>`).join("")}</ul>`
      : `<p class="note">Noch hat sich niemand über deinen Link angemeldet.</p>`;
    const o = window.MYTHARA.fenster("Freunde einladen", `
      <div class="werben">
        <div class="werben-kopf"><img src="img/shop/heldentoken.webp" alt=""><div><b>Ein Heldentoken für euch beide</b><p>Schick Freunden deinen Link. Meldet sich jemand darüber neu an und beendet seine erste Kampagne, bekommt ihr beide je einen Heldentoken – damit schaltet ihr in der Heldenhalle einen Helden eurer Wahl frei.</p></div></div>
        <label class="werben-link"><span>Dein Einladungslink</span><input id="werben-url" readonly value="${esc(url)}"></label>
        <div class="knoepfe"><button class="btn" id="werben-kopieren">Link kopieren</button>${teilbar ? `<button class="btn ghost" id="werben-teilen">Teilen …</button>` : ""}</div>
        <p class="fb" id="werben-fb" role="status"></p>
        <h3>Deine geworbenen Freunde <small>${stand.belohnt} von ${stand.max} Token erhalten</small></h3>
        ${freunde}
        <p class="note">Es zählt, wer sich neu registriert (das Konto darf höchstens 14 Tage alt sein und noch keine Kampagne beendet haben). Du wirst für höchstens ${stand.max} Freunde belohnt.</p>
      </div>`);
    const fb = (t) => { const e = o.querySelector("#werben-fb"); if (e) e.textContent = t; }, feld = o.querySelector("#werben-url");
    feld.onclick = () => feld.select();
    o.querySelector("#werben-kopieren").onclick = async () => { try { await navigator.clipboard.writeText(url); fb("Der Link ist kopiert."); } catch (e) { feld.select(); fb("Markiert – jetzt mit „Kopieren“ übernehmen."); } };
    const t = o.querySelector("#werben-teilen");
    if (t) t.onclick = () => navigator.share({ title: "Mythara", text: "Spiel mit mir Mythara – ein rundenbasiertes Rollenspiel im Browser, kostenlos:", url }).catch(() => {});
  }

  merken();
  window.WERBEN = { hub, zeigen, link, gemerkt };
})();
