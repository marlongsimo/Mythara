/*
 * Mythara – Feedback und Fehlermeldungen: Eintrag „Feedback geben“ im Profil-Menü (nur mit Konto) und der Reiter
 * „Nachrichten“ im Admin-Bereich. Datenbank: Migration 032 (rpg_feedback_send, rpg_admin_feedback, rpg_admin_feedback_read).
 * Mit jeder Nachricht gehen technische Angaben mit: Spielstand (Regeln.Figuren), Seite, Gerät, Bildschirm, letzter Skriptfehler.
 */
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const netz = () => window.AB && window.AB.liveClient && window.AB.liveClient();
  const fehlt = (e) => Boolean(e && (e.code === "PGRST202" || e.code === "42883" || /Could not find the function|schema cache|does not exist/i.test(e.roh || e.message || "")));
  let letzterFehler = null;
  window.addEventListener("error", (e) => { letzterFehler = String((e && e.message) || "").slice(0, 300) + (e && e.filename ? " @ " + String(e.filename).split("/").pop() + ":" + e.lineno : ""); });
  window.addEventListener("unhandledrejection", (e) => { letzterFehler = String((e && e.reason && (e.reason.message || e.reason)) || "").slice(0, 300); });

  function kontext() {
    const v = (n) => { const s = document.querySelector(`script[src*="${n}.js?v="]`); return s ? (/\?v=(\d+)/.exec(s.src) || [])[1] : "?"; };
    const offen = ["hub", "kampf", "szene", "lobby", "mythara"].find((id) => { const el = document.getElementById(id); return el && !el.hidden; }) || "";
    const seite = (document.querySelector(".hub-nav-punkt.an") || { dataset: {} }).dataset.hub || "";
    return { stand: v("regeln") + "." + v("figuren"), ansicht: offen + (seite ? "/" + seite : ""), arena: Boolean(window.AB && window.AB.st && window.AB.st.arena), geraet: navigator.userAgent.slice(0, 200), schirm: innerWidth + "x" + innerHeight,
      app: Boolean(matchMedia("(display-mode: standalone)").matches || navigator.standalone), fehler: letzterFehler };
  }
  /** Fenster zum Senden */
  function zeigen() {
    if (!window.MYTHARA) return;
    if (!window.MYTHARA.istKonto()) return window.MYTHARA.toast("Feedback kannst du mit einem Spielerkonto senden.");
    const o = window.MYTHARA.fenster("Feedback geben", `<form class="feedback" id="fb-form">
      <p class="note">Was gefällt dir, was stört dich, was ist kaputt? Deine Nachricht geht direkt an den Entwickler.</p>
      <div class="fb-art" role="radiogroup" aria-label="Art der Nachricht"><label><input type="radio" name="fb-art" value="feedback" checked><span>💬 Feedback</span></label><label><input type="radio" name="fb-art" value="bug"><span>🐞 Bug melden</span></label></div>
      <label class="fb-feld"><span>Deine Nachricht</span><textarea id="fb-text" rows="6" maxlength="2000" placeholder="Bei einem Bug: Was hast du getan, und was ist passiert?" required></textarea></label>
      <p class="fb-zaehler"><span id="fb-zahl">0</span> / 2000</p>
      <p class="note">Mitgeschickt werden dein Benutzername, der Spielstand, dein Gerät und die Seite, auf der du gerade warst – damit sich ein Fehler nachstellen lässt.</p>
      <p class="my-fb" id="fb-fb" role="status"></p>
      <div class="knoepfe"><button class="btn" type="submit" id="fb-senden">Senden</button></div></form>`);
    const t = o.querySelector("#fb-text"), fb = o.querySelector("#fb-fb"), k = kontext();
    t.oninput = () => { o.querySelector("#fb-zahl").textContent = t.value.length; };
    o.querySelector("#fb-form").onsubmit = async (e) => { e.preventDefault(); const text = t.value.trim(), art = o.querySelector('input[name="fb-art"]:checked').value, b = o.querySelector("#fb-senden");
      if (text.length < 5) { fb.textContent = "Bitte schreib ein paar Worte dazu."; return; }
      b.disabled = true; fb.textContent = "Wird gesendet …";
      try { await netz().ensureUser(); await netz().rpc("rpg_feedback_send", { p_art: art, p_text: text, p_kontext: k });
        o.querySelector(".feedback").innerHTML = `<p class="fb-danke"><b>Danke!</b> Deine Nachricht ist angekommen.</p>`; }
      catch (err) { b.disabled = false; fb.textContent = fehlt(err) ? "Feedback ist gerade noch nicht eingerichtet. Bitte versuch es später noch einmal." : err.message; } };
    setTimeout(() => t.focus(), 50);
  }
  /** Admin-Bereich, Reiter „Nachrichten“ */
  async function admin(nurNeu) {
    if (!window.MYTHARA) return;
    let d; try { d = await netz().rpc("rpg_admin_feedback", { p_nur_neu: Boolean(nurNeu) }); }
    catch (e) { return window.MYTHARA.fenster("Nachrichten", `<p class="note">${fehlt(e) ? "Die Nachrichten sind in der Datenbank noch nicht eingerichtet (Migration 032)." : esc(e.message)}</p>`); }
    const wann = (x) => { try { return new Date(x).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }); } catch (e) { return ""; } };
    const o = window.MYTHARA.fenster("Nachrichten", `<div class="fb-admin">
      <div class="fb-admin-kopf"><span><b>${d.neu}</b> ungelesen · ${d.gesamt} insgesamt</span><span class="fb-admin-knoepfe"><button class="btn ghost klein" data-fb-filter>${nurNeu ? "Alle zeigen" : "Nur ungelesene"}</button>${d.neu ? `<button class="btn ghost klein" data-fb-alle>Alle als gelesen</button>` : ""}</span></div>
      ${d.liste.length ? d.liste.map((x) => { const k = x.kontext || {};
        return `<article class="fb-eintrag${x.gelesen ? "" : " neu"}" data-art="${esc(x.art)}"><header><span class="fb-marke">${x.art === "bug" ? "Bug" : "Feedback"}</span><b>${esc(x.von || "gelöschtes Konto")}</b><span>${esc(wann(x.am))}</span>
          <button class="my-link" data-fb-lesen="${esc(x.id)}" data-gelesen="${x.gelesen ? 1 : 0}">${x.gelesen ? "als ungelesen" : "gelesen"}</button></header>
          <p>${esc(x.text).replace(/\n/g, "<br>")}</p>
          <small>${[k.stand ? "Stand " + esc(k.stand) : "", esc(k.ansicht || ""), k.arena ? "im Arenakampf" : "", esc(k.schirm || ""), k.app ? "als App" : "", esc((k.geraet || "").replace(/^Mozilla\/5\.0 \(([^)]*)\).*$/, "$1"))].filter(Boolean).join(" · ")}${k.fehler ? `<br>Letzter Fehler: ${esc(k.fehler)}` : ""}</small></article>`; }).join("")
        : `<p class="note">${nurNeu ? "Keine ungelesenen Nachrichten." : "Noch keine Nachrichten."}</p>`}</div>`);
    const neu = async (id, gelesen) => { try { await netz().rpc("rpg_admin_feedback_read", { p_id: id, p_gelesen: gelesen }); } catch (e) { window.MYTHARA.toast(e.message); } admin(nurNeu); };
    o.querySelectorAll("[data-fb-lesen]").forEach((b) => { b.onclick = () => neu(b.dataset.fbLesen, b.dataset.gelesen !== "1"); });
    { const f = o.querySelector("[data-fb-filter]"); if (f) f.onclick = () => admin(!nurNeu); const a = o.querySelector("[data-fb-alle]"); if (a) a.onclick = () => neu(null, true); }
  }
  /** Zahl der ungelesenen Nachrichten (für den Hinweis im Profil-Menü der Admins); ohne Migration 0 */
  async function ungelesen() { try { const d = await netz().rpc("rpg_admin_feedback", { p_nur_neu: true }); return d.neu || 0; } catch (e) { return 0; } }
  window.FEEDBACK = { zeigen, admin, ungelesen };
})();
