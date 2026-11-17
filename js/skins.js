/*
 * Mythara – Helden-Skins: anderes Aussehen für einen Helden (nur Bilder, keine Werte).
 * Kaufen beim Händler (Reiter „Skins“), anlegen auf der Heldenkarte in der Heldenhalle. In der Arena sieht der Gegner den Skin.
 * Datenbank: Migration 029 (rpg_skins, rpg_skin_buy, rpg_skin_equip, rpg_arena_skins). Ohne sie bleibt alles unsichtbar.
 * Der Katalog der Bilder und Namen steht hier (SKINS); Preis und Besitz kommen aus der Datenbank.
 * Bewusst nicht in js/figuren.js: Diese Datei gehört zu den Regeln des Arena-Servers, und Skins sind nur Aussehen.
 *
 * Bilder je Skin: img/figuren/<skin>.jpg (Porträt), img/figuren/ganz/<skin>.webp (Kampffigur im Seitenverhältnis des Helden),
 * img/figuren/ganz/<skin>-gross.webp (Händler, Heldenkarte) – erzeugt mit tools/skin-bild.py.
 * Neue Skins bekommen die Kennung <held>_s1 bis <held>_s3: Diese Plätze legt Migration 029 für jeden Helden schon an
 * (je 650 Seelensplitter), sodass ein neuer Skin ohne weiteres SQL erscheint, sobald er hier und als Bild vorhanden ist.
 */
(function () {
  "use strict";
  const SKINS = {
    berserker_wolfsblut: { held: "berserker", name: "Wolfsblut", text: "Wolfsfell über der Schulter, Runen aus Glut auf der Haut. Ragnar, wie ihn seine Feinde in Erinnerung behalten." },
    assassine_rabenschatten: { held: "assassine", name: "Rabenschatten", text: "Ein Umhang aus violettem Rauch, ein Rabe auf der Schulter, Klingen, die nachglühen. Vex, wenn er gesehen werden will." },
    inquisitor_s1: { held: "inquisitor", name: "Sonnenrichter", text: "Ein Strahlenkranz aus Gold, Roben in Rot und Elfenbein, das Weihrauchfass in der Faust. Seran, wie ihn die Schuldigen fürchten." },
    wanderheiler_s1: { held: "wanderheiler", name: "Lebenshüter", text: "Kräuter im Gürtel, eine Laterne am blühenden Stab, Licht in der offenen Hand. Brogar nach einem langen Sommer auf der Straße." },
    schildwaechter_s1: { held: "schildwaechter", name: "Löwenwacht", text: "Ein Löwenfell über nachtblauem Umhang, das Schwert vor sich in den Boden gestellt. Torvald als Hauptmann einer Wache, die es nicht mehr gibt." },
    lichtbringer_s1: { held: "lichtbringer", name: "Morgenweihe", text: "Ein Strahlenkranz mit weißen Lilien, Gewänder in Elfenbein und Nachtblau, ein Kristall, der wie die Sonne leuchtet. Elara am Tag ihrer Weihe." },
    elementarist_s1: { held: "elementarist", name: "Sternenrufer", text: "Eine Robe wie der Nachthimmel, ein Buch, aus dem Licht aufsteigt, Sternbilder, die um seine Hände kreisen. Vaelin, wenn das Feuer vom Himmel kommt." },
    trickser_s1: { held: "trickser", name: "Kartenlegerin", text: "Violette Tücher, Münzen und ein Mond am Gürtel, drei Karten, die über ihrer Hand schweben. Silra, wenn sie dir die Zukunft verkauft und die Börse gleich mitnimmt." },
    kopfgeldjaeger_s1: { held: "kopfgeldjaeger", name: "Waldjäger", text: "Ein Wolfsfell über dem Laubumhang, eine Armbrust mit Zielrohr, eine Laterne am Gürtel. Orin auf einer Fährte, die er seit Wochen hält." },
    wildnislaeufer_s1: { held: "wildnislaeufer", name: "Eichenhüter", text: "Eichenlaub auf dem Umhang, ein Wolfsfell über der Schulter, ein Bogen, an dem grünes Licht entlangläuft. Kael, wenn der Wald ihn zu den Seinen zählt." },
    duellant_s1: { held: "duellant", name: "Eulenritterin", text: "Eine Schleiereule auf der Schulter, Rüstung mit goldenem Baum, ein Umhang wie der Sternenhimmel. Isolde, die keinen Schritt zu viel macht." },
    tiergefaehrte_s1: { held: "tiergefaehrte", name: "Herbstjägerin", text: "Ein Umhang aus Herbstlaub, ein Bogen voller Glut, und hinter ihr der Geist eines Hirschs. Faye, wenn der Wald mit ihr zieht." },
    schattenmagier_s1: { held: "schattenmagier", name: "Rabenkönigin", text: "Federn und violettes Feuer, ein Rabe auf dem Stab, Monde auf dem Kleid. Morwen, wie sie in Albträumen erscheint." },
    gelehrter_sternenkunde: { held: "gelehrter", name: "Sternenkunde", text: "Nachtblauer Samt mit goldenen Sternbildern, eine Armillarsphäre aus Licht in der Hand. Lyra, wie sie in den Archiven von Veyrholm gemalt worden wäre." },
  };
  if (typeof module !== "undefined" && module.exports) { module.exports = { SKINS }; return; }   // für Tests
  /* Bildwahl in den Heldendaten ergänzen: ABF.bild(held, skin) und ABF.ganzBild(held, skin).
     skin: undefined = der eigene angelegte Skin, null = normales Aussehen, sonst der genannte Skin (nur wenn er zum Helden passt).
     ABF.SKIN.eigen = angelegte Skins des eigenen Kontos { held: skin }, ABF.SKIN.gegner = die des Arena-Gegners. */
  { const A = window.ABF; A.SKINS = SKINS; A.SKIN = { eigen: {}, gegner: {} };
    A.skinFuer = (fid, skin) => { const s = skin === undefined ? A.SKIN.eigen[fid] : skin; return s && SKINS[s] && SKINS[s].held === fid ? s : null; };
    A.bild = (fid, skin) => "img/figuren/" + (A.skinFuer(fid, skin) || fid) + ".jpg";
    A.ganzBild = (fid, skin) => "img/figuren/ganz/" + (A.skinFuer(fid, skin) || fid) + ".webp"; }
  const $ = (s) => document.querySelector(s), F = () => window.ABF;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const netz = () => window.AB && window.AB.liveClient && window.AB.liveClient();
  const fehlt = (e) => Boolean(e && (e.code === "PGRST202" || e.code === "42883" || /Could not find the function|schema cache|does not exist/i.test(e.roh || e.message || "")));
  const WN = () => (window.ARENA ? window.ARENA.WAEHRUNG : "Seelensplitter"), WZ = () => (window.ARENA ? window.ARENA.ZEICHEN : "◈");
  const gross = (id) => "img/figuren/ganz/" + id + "-gross.webp";
  let stand = null, arenaFehlt = false;

  function uebernehmen(s) {
    stand = s && s.konto ? s : null;
    F().SKIN.eigen = stand ? Object.assign({}, stand.aktiv || {}) : {};
    if (stand && window.MYTHARA && window.MYTHARA.waehrungZeigen) window.MYTHARA.waehrungZeigen(stand.waehrung);
    return stand;
  }
  /** Katalog, Besitz und angelegte Skins laden (im Dorf, nach Käufen). Ohne Konto oder ohne Migration: nichts */
  async function laden() {
    if (!netz()) return null;
    try { await netz().ensureUser(); const s = await netz().rpc("rpg_skins", {}); stand = s && s.konto ? s : null; F().SKIN.eigen = stand ? Object.assign({}, stand.aktiv || {}) : {}; }
    catch (e) { stand = null; F().SKIN.eigen = {}; }
    return stand;
  }
  /** Nur Skins, die das Spiel auch kennt (Bilder und Name) */
  const katalog = () => (stand ? stand.katalog.filter((k) => F().SKINS[k.id] && F().SKINS[k.id].held === k.held) : []);
  const da = () => katalog().length > 0;

  /* ---------- Händler: Reiter „Skins“ ---------- */
  function shop(meldung) {
    if (!stand || !window.MYTHARA) return;
    // Gekaufte Skins verschwinden aus dem Händler; an- und abgelegt werden sie auf der Heldenkarte in der Heldenhalle
    const karten = katalog().filter((k) => !k.besitzt).map((k) => { const s = F().SKINS[k.id], d = F().FIGUREN[k.held], fehlt2 = Math.max(0, k.preis - stand.waehrung);
      const knopf = !k.hat_held ? `<button class="btn" disabled>Kaufen</button><small class="shop-fehlt">Dafür brauchst du erst ${esc(d.name)} in deiner Sammlung.</small>`
        : `<button class="btn" data-skin-kauf="${k.id}" ${fehlt2 ? "disabled" : ""}><i>${WZ()}</i> Für ${k.preis} ${WN()} kaufen</button>${fehlt2 ? `<small class="shop-fehlt">Dir fehlen ${fehlt2} ${WN()}.</small>` : ""}`;
      return `<article class="skin-karte" style="--k:${F().KLASSEN[d.klasse].farbe}"><div class="skin-bild"><img src="${gross(k.id)}" alt="${esc(d.name)} – ${esc(s.name)}" loading="lazy"></div>
        <div class="skin-text"><p class="shop-eyebrow">Skin für ${esc(d.name)}</p><h2>${esc(s.name)}</h2><p>${esc(s.text || "")}</p><p class="skin-preis"><i>${WZ()}</i> ${k.preis} ${WN()}</p><div class="skin-knoepfe">${knopf}</div></div></article>`; }).join("");
    window.MYTHARA.seite("shop", `<div class="shop" data-shop data-skins><button class="hub-zurueck shop-zurueck" data-shop-zurueck>← Zum Händler</button>
      <div class="shop-kopf"><div><p class="shop-eyebrow">Der Händler</p><h1 class="hub-gruss">Skins</h1><p class="hub-untertitel">Ein anderes Aussehen für deine Helden – im Kampf, in der Heldenhalle und für deine Gegner in der Arena sichtbar. Skins ändern nichts an Werten oder Fähigkeiten.</p></div>
        <p class="shop-konto"><i>${WZ()}</i> <b>${stand.waehrung}</b> ${WN()}</p></div>
      ${meldung ? `<p class="shop-meldung" role="status">${esc(meldung)}</p>` : ""}
      <div class="skin-liste">${karten || `<p class="note">${katalog().length ? "Du besitzt alle Skins, die der Händler führt. An- und ablegen kannst du sie auf den Heldenkarten in der Heldenhalle." : "Der Händler hat gerade keine Skins."}</p>`}</div>
      ${katalog().some((k) => k.besitzt) && karten ? `<p class="note">Deine gekauften Skins findest du auf den Heldenkarten in der Heldenhalle. Dort legst du sie an und ab.</p>` : ""}</div>`);
    const z = $("[data-shop-zurueck]"); if (z) z.onclick = () => window.MYTHARA.shop();
    document.querySelectorAll("[data-skin-kauf]").forEach((b) => { b.onclick = async () => {
      const id = b.dataset.skinKauf, k = katalog().find((x) => x.id === id), s = F().SKINS[id], d = F().FIGUREN[k.held];
      if (!confirm(`„${s.name}“ für ${d.name} kaufen? Das kostet ${k.preis} ${WN()}.`)) return; b.disabled = true;
      try { uebernehmen(await netz().rpc("rpg_skin_buy", { p_id: id })); if (window.ARENA && window.ARENA.pruefen) window.ARENA.pruefen(true).catch(() => {});
        try { uebernehmen(await netz().rpc("rpg_skin_equip", { p_held: k.held, p_skin: id })); } catch (e) { /* gekauft ist er; anlegen geht auch später */ }
        shop(`„${s.name}“ gehört jetzt dir und ist angelegt. An- und ablegen kannst du ihn auf der Heldenkarte von ${d.name} in der Heldenhalle.`); }
      catch (e) { await laden(); shop(e.message); } }; });
  }
  /** Kachel für die Übersicht des Händlers (leer, solange es keine Skins gibt) */
  function shopKachel() {
    if (!da()) return "";
    const k = katalog(), n = k.filter((x) => x.besitzt).length;
    return `<button class="shop-feld skins" data-shop-feld="skins"><span class="shop-feld-bilder skin"><img src="${gross(k[0].id)}" alt=""></span>
      <b>Skins</b><span>Ein anderes Aussehen für deine Helden. Ab ${Math.min(...k.map((x) => x.preis))} ${WN()}.</span><em class="shop-uhr">${n ? `Im Besitz: ${n}` : "Rein fürs Auge"}</em></button>`;
  }

  /* ---------- Heldenkarte: Aussehen wählen ---------- */
  function wahlHtml(fid) {
    const liste = katalog().filter((k) => k.held === fid); if (!liste.length) return "";
    const d = F().FIGUREN[fid], an = (stand.aktiv && stand.aktiv[fid]) || null, hatHeld = liste.some((k) => k.hat_held);
    const punkt = (id, name, bildSrc, zustand, attr) => `<button class="skin-wahl-punkt${zustand === "an" ? " an" : ""}${zustand === "zu" ? " zu" : ""}" ${attr}><img src="${bildSrc}" alt=""><b>${esc(name)}</b><small>${zustand === "an" ? "angelegt" : zustand === "zu" ? "beim Händler" : "anlegen"}</small></button>`;
    return `<div class="skin-wahl" data-skin-wahl="${fid}"><h3>Aussehen</h3><div class="skin-wahl-reihe">
      ${punkt("", "Standard", F().bild(fid, null), an ? "" : "an", hatHeld ? 'data-skin-setzen=""' : "disabled")}
      ${liste.map((k) => punkt(k.id, F().SKINS[k.id].name, F().bild(fid, k.id), k.besitzt ? (an === k.id ? "an" : "") : "zu", k.besitzt ? `data-skin-setzen="${k.id}"` : 'data-skin-haendler="1"')).join("")}
      </div><p class="my-fb" id="skin-wahl-fb" role="status"></p></div>`;
  }
  function wahlBinden(fid, neuZeichnen) {
    document.querySelectorAll("[data-skin-wahl] [data-skin-setzen]").forEach((b) => { b.onclick = async () => {
      const id = b.dataset.skinSetzen || null; if (((stand.aktiv && stand.aktiv[fid]) || null) === id) return;
      try { uebernehmen(await netz().rpc("rpg_skin_equip", { p_held: fid, p_skin: id })); neuZeichnen(); } catch (e) { const fb = $("#skin-wahl-fb"); if (fb) fb.textContent = e.message; } }; });
    document.querySelectorAll("[data-skin-wahl] [data-skin-haendler]").forEach((b) => { b.onclick = () => shop(); });
  }

  /* ---------- Arena: Skins des Gegners ---------- */
  async function arena(matchId, ich, wurzel) {
    F().SKIN.gegner = {};
    if (arenaFehlt || !matchId || !netz()) return;
    try { const r = await netz().rpc("rpg_arena_skins", { p_match_id: matchId }); F().SKIN.gegner = Object.assign({}, (ich === 1 ? r && r.gast : r && r.host) || {}); }
    catch (e) { if (fehlt(e)) arenaFehlt = true; return; }
    if (wurzel) wurzel.querySelectorAll(".arena-team.gegner img[data-skin-held]").forEach((im) => { im.src = F().bild(im.dataset.skinHeld, F().SKIN.gegner[im.dataset.skinHeld] || null); });
  }

  window.SKINS = { laden, shop, shopKachel, wahlHtml, wahlBinden, arena, da, zustand: () => stand };
})();
