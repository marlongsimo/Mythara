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
    schattenlaeufer_s1: { held: "schattenlaeufer", name: "Nachtkrähe", text: "Eine Kapuze voller Runen, eine Krähe auf der Schulter, zwei Dolche, an denen violetter Rauch hängt. Darian in der Nacht, in der er nicht vorhat, ungesehen zu bleiben." },
    assassine_s1: { held: "assassine", name: "Schattenfürst", paket: "schattenreich", text: "Eine Krone über der Kapuze, das Gesicht verhüllt, Klingen aus violettem Licht. Vex, wie er im Schattenreich herrscht." },
    tiergefaehrte_s2: { held: "tiergefaehrte", name: "Schattenjägerin", paket: "schattenreich", text: "Rabenfedern auf dem Umhang, Pfeile mit violetten Federn, ein Bogen wie eine Sichel. Faye auf der Jagd im Schattenreich." },
    wanderheiler_s2: { held: "wanderheiler", name: "Schattenheiler", paket: "schattenreich", text: "Schwarze Roben mit einem Raben im Mond, ein Stab mit violettem Kristall. Brogar, der auch im Schattenreich Wunden schließt." },
    tiergefaehrte_s1: { held: "tiergefaehrte", name: "Herbstjägerin", text: "Ein Umhang aus Herbstlaub, ein Bogen voller Glut, und hinter ihr der Geist eines Hirschs. Faye, wenn der Wald mit ihr zieht." },
    schattenmagier_s1: { held: "schattenmagier", name: "Rabenkönigin", text: "Federn und violettes Feuer, ein Rabe auf dem Stab, Monde auf dem Kleid. Morwen, wie sie in Albträumen erscheint." },
    gelehrter_sternenkunde: { held: "gelehrter", name: "Sternenkunde", text: "Nachtblauer Samt mit goldenen Sternbildern, eine Armillarsphäre aus Licht in der Hand. Lyra, wie sie in den Archiven von Veyrholm gemalt worden wäre." },
  };
  /* Pakete: mehrere Skins zusammen günstiger, für begrenzte Zeit (Preis, Laufzeit und Inhalt kommen aus der Datenbank, Migration 030) */
  const PAKETE = { schattenreich: { name: "Aus dem Schattenreich", text: "Drei Helden, wie sie auf der anderen Seite aussehen: schwarz, violett und mit Raben im Gefolge." } };
  /* VORBEREITET, NOCH NICHT IM SPIEL: Bilder liegen bereit, die Einträge werden bei „Go“ nach SKINS und PAKETE verschoben
     (dazu ein Eintrag für das Paket in der Datenbank). Solange sie hier stehen, zeigt das Spiel nichts davon. */
  const WARTET = {
    pakete: { unter_dem_eis: { name: "Unter dem Eis", text: "Reif auf Pelz und Stahl, Eiszapfen an den Säumen, Schneekristalle auf dem Wappenrock: die Garde des versunkenen Veyrholm." },
      glut_und_asche: { name: "Glut und Asche", text: "Verkohlter Stoff, an dessen Säumen es noch glimmt, Runen aus Glut und überall die Waage: die Richter, die nach dem Brand kommen." },
      goldene_garde: { name: "Die Goldene Garde", text: "Weißer Stahl, nachtblaue Umhänge, der goldene Löwe auf dem Wappenrock: die Leibwache eines Reiches, das es nicht mehr gibt." } },
    skins: {
      duellant_s3: { held: "duellant", name: "Frostklinge", paket: "unter_dem_eis", text: "Eine Krone aus Eis, Rüstung mit Reif überzogen, ein Schwert wie ein gefrorener Bach. Isolde, wie sie unter dem Gletscher Wache hielte." },
      gelehrter_s1: { held: "gelehrter", name: "Eisgelehrte", paket: "unter_dem_eis", text: "Ein Buch mit Schneekristall, ein Stab mit blauem Eis, eine Flocke, die über ihrer Hand schwebt. Lyra in den Archiven von Veyrholm." },
      wildnislaeufer_s2: { held: "wildnislaeufer", name: "Frostläufer", paket: "unter_dem_eis", text: "Pelz voller Reif, Pfeile mit Federn aus Eis, ein Bogen, an dem Zapfen hängen. Kael auf der Jagd über den Gletscher." },
      berserker_s1: { held: "berserker", name: "Aschenhammer", paket: "glut_und_asche", text: "Geschwärzte Platten, ein Weihrauchfass an der Kette, ein Hammer, in dessen Rissen Glut steht. Ragnar als Vollstrecker des Urteils." },
      schattenmagier_s2: { held: "schattenmagier", name: "Glutrichterin", paket: "glut_und_asche", text: "Ein Reif aus Eisen über dem Haar, ein brennendes Buch, die Waage am Gürtel. Morwen, die das Urteil schon kennt." },
      inquisitor_s2: { held: "inquisitor", name: "Aschenrichter", paket: "glut_und_asche", text: "Eine Robe wie verkohltes Pergament, ein Stab, auf dem Feuer brennt, das Buch aufgeschlagen. Seran, wenn er nicht mehr fragt." },
      duellant_s2: { held: "duellant", name: "Gardehauptfrau", paket: "goldene_garde", text: "Eine Krone im Haar, Plattenrüstung in Weiß und Gold, das Schwert gezogen. Isolde an der Spitze der Garde." },
      kopfgeldjaeger_s2: { held: "kopfgeldjaeger", name: "Gardeschütze", paket: "goldene_garde", text: "Weißer Pelz über der Schulter, der Löwe auf der Brust, eine Armbrust aus Gold. Orin im Dienst der Krone." },
      elementarist_s2: { held: "elementarist", name: "Gardemagier", paket: "goldene_garde", text: "Roben in Elfenbein und Blau, ein Stab mit einer Sonne an der Spitze, Licht in der offenen Hand. Vaelin als Hofmagier." },
    },
  };
  if (typeof module !== "undefined" && module.exports) { module.exports = { SKINS, PAKETE, WARTET }; return; }   // für Tests
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
  let stand = null, arenaFehlt = false, pakete = [], paketUhr = null;
  const restZeit = (bis) => { const ms = new Date(bis).getTime() - Date.now(); if (ms <= 0) return "0 Min."; const t = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4); return t ? `${t} T. ${h} Std.` : h ? `${h} Std. ${m} Min.` : `${Math.max(1, m)} Min.`; };
  /** Laufende Pakete laden (ohne Migration 030: keine) */
  async function paketeLaden() {
    pakete = [];
    try { const r = await netz().rpc("rpg_skin_bundles_list", {}); if (r && r.konto) pakete = (r.pakete || []).filter((p) => PAKETE[p.id] && p.skins.every((id) => SKINS[id]) && new Date(p.bis).getTime() > Date.now()); } catch (e) { /* ohne Pakete */ }
    return pakete;
  }
  /** Sonderangebot für die Startseite des Händlers (über dem Held der Woche): aufgefächerte Vorschau, Preis, Restzeit */
  function angebotHtml() {
    return pakete.map((p) => { const P = PAKETE[p.id], n = p.skins.length;
      const faecher = p.skins.map((id, i) => `<img src="${gross(id)}" alt="" style="--i:${i - (n - 1) / 2}">`).join("");
      return `<button class="shop-angebot paket${p.gekauft ? " gekauft" : ""}" data-paket="${p.id}"><span class="shop-angebot-band">★ Sonderangebot · Skin-Paket</span>${p.gekauft ? "" : `<span class="shop-angebot-rabatt">−${Math.round(100 * (1 - p.preis / p.einzeln))} %</span>`}
        <span class="paket-faecher" aria-hidden="true">${faecher}</span>
        <span class="shop-angebot-text"><b>${esc(P.name)}</b><small>${n} Skins: ${p.skins.map((id) => esc(F().FIGUREN[SKINS[id].held].name)).join(", ")}</small><span class="my-link">Ansehen</span></span>
        <span class="shop-angebot-kauf">${p.gekauft ? `<span class="shop-gekauft">✓ In deinem Besitz</span>` : `<span class="shop-preis"><s><i>${WZ()}</i> ${p.einzeln}</s> <b><i>${WZ()}</i> ${p.preis}</b> <span>${WN()}</span></span>`}
          <em class="shop-uhr">Noch <strong data-paket-uhr="${p.id}">${restZeit(p.bis)}</strong></em></span></button>`; }).join("");
  }
  function angebotBinden() {
    document.querySelectorAll("[data-paket]").forEach((b) => { b.onclick = () => paketZeigen(b.dataset.paket); });
    clearInterval(paketUhr); if (!pakete.length) return;
    paketUhr = setInterval(() => { const els = document.querySelectorAll("[data-paket-uhr]"); if (!els.length) return clearInterval(paketUhr);
      els.forEach((el) => { const p = pakete.find((x) => x.id === el.dataset.paketUhr); if (!p || new Date(p.bis).getTime() <= Date.now()) { clearInterval(paketUhr); if (window.MYTHARA && document.querySelector("[data-paket]")) window.MYTHARA.shop(); } else el.textContent = restZeit(p.bis); }); }, 30000);
  }
  /** Paketseite: die einzelnen Skins und der Kauf als Paket */
  function paketZeigen(id, meldung) {
    const p = pakete.find((x) => x.id === id); if (!p || !window.MYTHARA) return;
    const P = PAKETE[id], geld = stand ? stand.waehrung : 0, fehlt2 = Math.max(0, p.preis - geld);
    const karten = p.skins.map((sid) => { const s = SKINS[sid], d = F().FIGUREN[s.held], hat = p.hat.includes(sid) || p.gekauft;
      return `<article class="skin-karte${hat ? " hat" : ""}" style="--k:${F().KLASSEN[d.klasse].farbe}"><div class="skin-bild"><img src="${gross(sid)}" alt="${esc(d.name)} – ${esc(s.name)}" loading="lazy"></div>
        <div class="skin-text"><p class="shop-eyebrow">Skin für ${esc(d.name)}</p><h2>${esc(s.name)}</h2><p>${esc(s.text || "")}</p>${hat ? `<small class="skin-hat">✓ In deinem Besitz</small>` : ""}</div></article>`; }).join("");
    window.MYTHARA.seite("shop", `<div class="shop" data-shop data-paketseite="${id}"><button class="hub-zurueck shop-zurueck" data-shop-zurueck>← Zum Händler</button>
      <div class="shop-kopf"><div><p class="shop-eyebrow">Sonderangebot · noch ${restZeit(p.bis)}</p><h1 class="hub-gruss">${esc(P.name)}</h1><p class="hub-untertitel">${esc(P.text)}</p></div>
        <p class="shop-konto"><i>${WZ()}</i> <b>${geld}</b> ${WN()}</p></div>
      ${meldung ? `<p class="shop-meldung" role="status">${esc(meldung)}</p>` : ""}
      <div class="paket-kauf">${p.gekauft ? `<span class="shop-gekauft">✓ Dieses Paket gehört dir. An- und ablegen kannst du die Skins auf den Heldenkarten in der Heldenhalle.</span>`
        : `<p class="shop-preis"><s><i>${WZ()}</i> ${p.einzeln}</s> <b><i>${WZ()}</i> ${p.preis}</b> <span>${WN()} für alle ${p.skins.length} Skins</span></p>
           <button class="btn gross" data-paket-kauf ${fehlt2 ? "disabled" : ""}>Paket für <i>${WZ()}</i> ${p.preis} kaufen</button>
           ${fehlt2 ? `<small class="shop-fehlt">Dir fehlen ${fehlt2} ${WN()}.</small>` : ""}${p.hat.length ? `<small class="note">${p.hat.length === 1 ? "Einen der Skins" : p.hat.length + " der Skins"} besitzt du schon; der Paketpreis bleibt gleich.</small>` : ""}
           <small class="note">Das Paket gilt auch für Helden, die du noch nicht hast: Die Skins warten in der Heldenhalle, bis der Held zu dir stößt.</small>`}</div>
      <div class="skin-liste">${karten}</div></div>`);
    const z = $("[data-shop-zurueck]"); if (z) z.onclick = () => window.MYTHARA.shop();
    const k = $("[data-paket-kauf]"); if (k) k.onclick = async () => {
      if (!confirm(`„${P.name}“ kaufen? Das kostet ${p.preis} ${WN()}.`)) return; k.disabled = true;
      try { await netz().rpc("rpg_skin_bundle_buy", { p_id: id }); await laden(); await paketeLaden(); if (window.ARENA && window.ARENA.pruefen) window.ARENA.pruefen(true).catch(() => {});
        paketZeigen(id, `„${P.name}“ gehört jetzt dir. Anlegen kannst du die Skins auf den Heldenkarten in der Heldenhalle.`); }
      catch (e) { await laden(); await paketeLaden(); if (pakete.find((x) => x.id === id)) paketZeigen(id, e.message); else window.MYTHARA.shop(e.message); } };
  }

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

  /* ---------- Händler: Bereich „Skins“ ----------
     Zwei Reiter: „Im Angebot“ (Raster mit Filter nach Klasse; gekaufte Skins verschwinden) und „Meine Skins“ (reine Übersicht).
     Ein Tipp auf eine Kachel öffnet die Skin-Ansicht (große Figur, Vergleich mit dem Standardaussehen, Kauf).
     An- und abgelegt wird ausschließlich auf der Heldenkarte in der Heldenhalle. */
  const SICHT = { reiter: "laden", klasse: "alle", nurMeine: false };
  const paketVon = (id) => pakete.find((p) => !p.gekauft && p.skins.includes(id)) || null;
  function kachel(k) {
    const s = SKINS[k.id], d = F().FIGUREN[k.held], an = stand.aktiv && stand.aktiv[k.held] === k.id, zu = !k.besitzt && !k.hat_held;
    const marke = an ? `<i class="sk-marke an">Angelegt</i>` : k.besitzt ? `<i class="sk-marke hat">✓ Deins</i>` : paketVon(k.id) ? `<i class="sk-marke paket">Im Paket</i>` : "";
    return `<button class="sk-kachel${zu ? " zu" : ""}" data-skin="${k.id}" style="--k:${F().KLASSEN[d.klasse].farbe}">${marke}<img src="${gross(k.id)}" alt="" loading="lazy"><b>${esc(s.name)}</b><span>${esc(d.name)}</span>${k.besitzt ? "" : `<span class="sk-preis"><i>${WZ()}</i> ${k.preis}</span>`}${zu ? `<span class="sk-schloss">🔒 Held fehlt</span>` : ""}</button>`;
  }
  function shop(meldung) {
    if (!stand || !window.MYTHARA) return;
    const kat = katalog(), meine = kat.filter((k) => k.besitzt), reihe = F().REIHE || Object.keys(F().FIGUREN), platz = (k) => reihe.indexOf(k.held);
    let inhalt = "";
    if (SICHT.reiter === "laden") {
      const band = pakete.filter((p) => !p.gekauft).map((p) => { const P = PAKETE[p.id], n = p.skins.length;
        return `<button class="sk-paket" data-paket="${p.id}"><span class="sk-paket-band">★ Sonderangebot · noch ${restZeit(p.bis)}</span><span class="paket-faecher klein" aria-hidden="true">${p.skins.map((id, i) => `<img src="${gross(id)}" alt="" style="--i:${i - (n - 1) / 2}">`).join("")}</span>
          <span class="sk-paket-text"><b>${esc(P.name)}</b><small>${n} Skins: ${p.skins.map((id) => esc(F().FIGUREN[SKINS[id].held].name)).join(", ")}</small></span>
          <span class="sk-paket-preis"><span class="shop-preis"><s><i>${WZ()}</i> ${p.einzeln}</s> <b><i>${WZ()}</i> ${p.preis}</b></span><small>−${Math.round(100 * (1 - p.preis / p.einzeln))} % gegenüber Einzelkauf</small></span></button>`; }).join("");
      const klassen = [["alle", "Alle"]].concat(Object.entries(F().KLASSEN).map(([id, kl]) => [id, kl.name]));
      const liste = kat.filter((k) => !k.besitzt && (SICHT.klasse === "alle" || F().FIGUREN[k.held].klasse === SICHT.klasse) && (!SICHT.nurMeine || k.hat_held)).sort((a, b) => (b.hat_held - a.hat_held) || platz(a) - platz(b));
      inhalt = `${band ? `<div class="sk-pakete">${band}</div>` : ""}
        <div class="sk-filter"><div class="sk-chips" role="group" aria-label="Nach Klasse filtern">${klassen.map(([id, n]) => `<button data-sk-klasse="${id}" class="${SICHT.klasse === id ? "an" : ""}">${esc(n)}</button>`).join("")}</div>
          <label class="sk-schalter"><input type="checkbox" id="sk-nur" ${SICHT.nurMeine ? "checked" : ""}> Nur für meine Helden</label></div>
        <div class="sk-raster">${liste.map(kachel).join("") || `<p class="sk-leer">${kat.length && !kat.some((k) => !k.besitzt) ? "Du besitzt alle Skins, die der Händler führt." : "Hier gibt es gerade nichts Neues für dich."}</p>`}</div>`;
    } else {
      inhalt = `<p class="note">An- und ablegen kannst du deine Skins auf den Heldenkarten in der Heldenhalle.</p>
        <div class="sk-raster">${meine.slice().sort((a, b) => platz(a) - platz(b)).map(kachel).join("") || `<p class="sk-leer">Du besitzt noch keine Skins. Sieh dich unter „Im Angebot“ um.</p>`}</div>`;
    }
    window.MYTHARA.seite("shop", `<div class="shop" data-shop data-skins><button class="hub-zurueck shop-zurueck" data-shop-zurueck>← Zum Händler</button>
      <div class="shop-kopf"><div><p class="shop-eyebrow">Der Händler</p><h1 class="hub-gruss">Skins</h1><p class="hub-untertitel">Ein anderes Aussehen für deine Helden – im Kampf, in der Heldenhalle und für deine Gegner in der Arena sichtbar. Skins ändern nichts an Werten oder Fähigkeiten.</p></div>
        <p class="shop-konto"><i>${WZ()}</i> <b>${stand.waehrung}</b> ${WN()}</p></div>
      ${meldung ? `<p class="shop-meldung" role="status">${esc(meldung)}</p>` : ""}
      <nav class="sk-reiter" aria-label="Skins"><button data-sk-reiter="laden" class="${SICHT.reiter === "laden" ? "an" : ""}">Im Angebot</button><button data-sk-reiter="meine" class="${SICHT.reiter === "meine" ? "an" : ""}">Meine Skins<em>${meine.length}</em></button></nav>
      ${inhalt}</div>`);
    const z = $("[data-shop-zurueck]"); if (z) z.onclick = () => window.MYTHARA.shop();
    document.querySelectorAll("[data-sk-reiter]").forEach((b) => { b.onclick = () => { SICHT.reiter = b.dataset.skReiter; shop(); }; });
    document.querySelectorAll("[data-sk-klasse]").forEach((b) => { b.onclick = () => { SICHT.klasse = b.dataset.skKlasse; shop(); }; });
    { const n = $("#sk-nur"); if (n) n.onchange = () => { SICHT.nurMeine = n.checked; shop(); }; }
    document.querySelectorAll("[data-skins] [data-paket]").forEach((b) => { b.onclick = () => paketZeigen(b.dataset.paket); });
    document.querySelectorAll("[data-skins] [data-skin]").forEach((b) => { b.onclick = () => ansicht(b.dataset.skin); });
  }
  /** Skin-Ansicht: große Figur, Vergleich mit dem Standardaussehen, Kauf (kein An- und Ablegen – das geht nur auf der Heldenkarte) */
  function ansicht(id, sichtStd, fehler) {
    const k = katalog().find((x) => x.id === id); if (!k) return;
    const s = SKINS[id], d = F().FIGUREN[k.held], kl = F().KLASSEN[d.klasse], an = stand.aktiv && stand.aktiv[k.held] === id, zu = !k.besitzt && !k.hat_held, fehlt2 = Math.max(0, k.preis - stand.waehrung), p = k.besitzt ? null : paketVon(id);
    let o = $("#sk-ansicht"); if (!o) { o = document.createElement("div"); o.id = "sk-ansicht"; o.className = "sk-schleier"; document.body.appendChild(o); }
    const kauf = k.besitzt ? `<p class="skin-hat">✓ In deinem Besitz${an ? " · angelegt" : ""}</p><p class="note">An- und ablegen kannst du ihn auf der Heldenkarte von ${esc(d.name)} in der Heldenhalle.</p>`
      : `<p class="skin-preis"><i>${WZ()}</i> ${k.preis} ${WN()}</p><button class="btn gross" data-sk-kauf ${zu || fehlt2 ? "disabled" : ""}><i>${WZ()}</i> Für ${k.preis} kaufen</button>
         ${zu ? `<small class="shop-fehlt">🔒 Du brauchst erst ${esc(d.name)} in deiner Sammlung.${p ? " Im Paket bekommst du den Skin trotzdem; er wartet dann auf den Helden." : ""}</small>` : fehlt2 ? `<small class="shop-fehlt">Dir fehlen ${fehlt2} ${WN()}.</small>` : ""}`;
    o.innerHTML = `<div class="sk-detail" role="dialog" aria-label="${esc(s.name)}" style="--k:${kl.farbe}"><button class="sk-zu" data-sk-zu aria-label="Schließen">✕</button>
      <div><div class="sk-buehne"><img src="${sichtStd ? F().ganzBild(k.held, null) : gross(id)}" alt="${esc(d.name)}"></div>
        <div class="sk-vergleich"><button data-sk-sicht="skin" class="${sichtStd ? "" : "an"}">${esc(s.name)}</button><button data-sk-sicht="std" class="${sichtStd ? "an" : ""}">Standard</button></div></div>
      <div class="sk-detail-text"><p class="shop-eyebrow">Skin für ${esc(d.name)} · ${esc(kl.name)}</p><h2>${esc(s.name)}</h2><p>${esc(s.text || "")}</p>${kauf}
        ${p ? `<div class="sk-tipp">Teil von <b>${esc(PAKETE[p.id].name)}</b>: alle ${p.skins.length} Skins für <i>${WZ()}</i> ${p.preis}. <button class="my-link" data-sk-paket="${p.id}">Paket ansehen</button></div>` : ""}
        ${fehler ? `<p class="my-fb" role="status">${esc(fehler)}</p>` : ""}</div></div>`;
    o.hidden = false;
    const zuMachen = () => { o.hidden = true; o.innerHTML = ""; };
    o.onclick = (e) => { if (e.target === o || e.target.closest("[data-sk-zu]")) zuMachen(); };
    o.querySelectorAll("[data-sk-sicht]").forEach((b) => { b.onclick = () => ansicht(id, b.dataset.skSicht === "std"); });
    { const pk = o.querySelector("[data-sk-paket]"); if (pk) pk.onclick = () => { zuMachen(); paketZeigen(pk.dataset.skPaket); }; }
    { const kb = o.querySelector("[data-sk-kauf]"); if (kb) kb.onclick = async () => {
        if (!confirm(`„${s.name}“ für ${d.name} kaufen? Das kostet ${k.preis} ${WN()}.`)) return; kb.disabled = true;
        try { uebernehmen(await netz().rpc("rpg_skin_buy", { p_id: id })); if (window.ARENA && window.ARENA.pruefen) window.ARENA.pruefen(true).catch(() => {});
          try { uebernehmen(await netz().rpc("rpg_skin_equip", { p_held: k.held, p_skin: id })); } catch (e) { /* gekauft ist er; anlegen geht auch später */ }
          await paketeLaden(); zuMachen(); shop(`„${s.name}“ gehört jetzt dir und ist angelegt. An- und ablegen kannst du ihn auf der Heldenkarte von ${d.name} in der Heldenhalle.`); }
        catch (e) { await laden(); shop(); ansicht(id, false, e.message); } }; }
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

  window.SKINS = { laden, shop, shopKachel, wahlHtml, wahlBinden, arena, da, zustand: () => stand, paketeLaden, angebotHtml, angebotBinden, paketZeigen };
})();
