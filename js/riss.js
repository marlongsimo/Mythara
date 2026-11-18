/*
 * Mythara – Rissgänger (Prototyp): die Oberfläche. Regeln: doku/konzepte/rissgaenger.md, Regelkern: js/riss-kern.js
 *
 * Nur gegen den Rechner, nur auf diesem Gerät: kein Server, keine Datenbank, keine Belohnung. Die Arena bleibt unberührt.
 * Sichtbar nur mit dem Schalter …/spiel.html?riss=1 (gilt für diesen Tab; ?riss=0 schaltet ihn wieder ab).
 * Heilung vor dem Finale: gerechnete Regel (Voreinstellung) oder Testvariante „niemand wird geheilt“ – wählbar vor dem Start, oder fest über ?rissheil=keine.
 * Räume laufen als gewöhnlicher Kampf (AB.kampfStarten), das Finale als Arena-Duell auf diesem Gerät (AB.arenaStart);
 * die Siegel-Regeln hängen sich für die Dauer des Finales hinter bewegen, handeln und Zugende der Regeln und werden danach wieder gelöst.
 * Jede Partie wird auf dem Gerät mitgeschrieben (localStorage „ab_riss_mitschrift“).
 * Globaler Name: window.RISS
 */
(function () {
  "use strict";
  const params = new URLSearchParams(location.search);
  const AN = (() => { let a = ""; const p = params.get("riss"); try { if (p === "1" || p === "0") sessionStorage.setItem("ab_riss", p); a = sessionStorage.getItem("ab_riss") || ""; } catch (e) { a = p || ""; } return a === "1"; })();
  if (!AN) return;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const F = window.ABF, R = window.ABR, SPEICHER = "ab_riss_mitschrift";
  const NAMEN = ["Varn der Stille", "Ilka Aschenhand", "Der Graue Tomas", "Mirelle vom Spalt", "Odo Rissläufer", "Senna Dunkelwasser"];
  let K = null;
  const Z = { wahl: [], heilung: params.get("rissheil") === "keine" ? "keine" : "gerechnet", ich: null, bot: null, seed: 0, st: null, orig: null, botRuft: false, botBis: 0, takt: null, beob: null, log: null, beginn: 0, wegEnde: 0, sicht: 0 };

  /* ---------- Hilfen ---------- */
  function skript(src) { return new Promise((ok, nein) => { if (document.querySelector(`script[data-riss="${src}"]`)) return ok(); const s = document.createElement("script"); s.src = src; s.dataset.riss = src; s.onload = ok; s.onerror = () => nein(new Error("Datei fehlt: " + src)); document.head.appendChild(s); }); }
  async function bereit() {
    if (K) return;
    const v = (document.querySelector('script[src*="riss.js"]').getAttribute("src").split("?v=")[1]) || "1";
    // bewusst nicht „?v=“: Die Fassungsprüfung (js/mythara.js) vergleicht alle eingebundenen Dateien mit „?v=“ gegen die Seite und lüde sonst neu
    await skript("server/arena-bot.js?r=" + v); await skript("js/riss-kern.js?r=" + v);
    K = window.ABRISSKERN(R, (window.ABD_ALLE && window.ABD_ALLE.grauwacht && window.ABD_ALLE.grauwacht.KARTEN) || {}, window.ABARENABOT);
  }
  const seite = (html) => window.MYTHARA.seite("arena", `<div data-riss class="riss">${html}</div>`);
  const zufall = () => Math.floor(Math.random() * 1e9);
  const woche = () => Math.floor((Date.now() / 86400000 + 3) / 7);
  /** Wählbare Helden: die eigenen und drei Leihhelden, die jede Woche wechseln */
  function wahlHelden() {
    const sm = window.ABSAMMLUNG, alle = F.REIHE.slice(), eigene = alle.filter((f) => !sm || sm.frei(f));
    let zs = woche() * 7919 + 13; const zf = () => { zs = (zs * 1103515245 + 12345) & 0x7fffffff; return zs / 0x7fffffff; };
    const leih = alle.filter((f) => !eigene.includes(f)).map((f) => [zf(), f]).sort((a, b) => a[0] - b[0]).slice(0, 3).map((x) => x[1]);
    return { eigene, leih };
  }
  const heldKarte = (f, zusatz, klasse, attr) => { const d = F.FIGUREN[f]; return `<button type="button" class="arena-held ${klasse || ""}" ${attr || ""} style="--k:${F.KLASSEN[d.klasse].farbe}"><img src="${F.bild(f)}" alt=""><b>${esc(d.name)}</b><small>${esc(F.KLASSEN[d.klasse].name)}</small><em>${zusatz || "&nbsp;"}</em></button>`; };
  const heilText = (h) => (h === "keine" ? "Testvariante: Vor dem Finale wird niemand geheilt." : "Gerechnete Regel: Die frühere Gruppe bekommt vor dem Finale die Hälfte der fehlenden Trefferpunkte zurück, die spätere nichts.");
  /** Zeile je Held: Stufe und Leben */
  function gruppeHtml(titel, gruppe, stufen, leben, dinge, segen) {
    return `<div class="riss-gruppe"><h3>${esc(titel)}</h3><div class="riss-gruppe-helden">${gruppe.map((f) => { const d = F.FIGUREN[f], l = Math.round(100 * (leben ? leben[f] : 1));
      return `<div class="riss-held" style="--k:${F.KLASSEN[d.klasse].farbe}"><img src="${F.bild(f)}" alt=""><div><b>${esc(d.name)}</b><span>Stufe ${stufen[f]}</span><i class="riss-tp"><u style="width:${l}%"></u></i><small>${l} % Leben${dinge && (dinge[f] || []).length ? " · " + dinge[f].map((id) => esc(R.GEGENSTAENDE[id].name)).join(", ") : ""}</small></div></div>`; }).join("")}</div>
      ${segen && segen.length ? `<p class="riss-segen">Segen: ${segen.map((id) => `${F.SEGEN[id].zeichen} ${esc(F.SEGEN[id].name)}`).join(", ")}</p>` : ""}</div>`;
  }
  /** Was man vom Gegner sieht: wie tief er zuletzt war, mit Stufen und Leben von dort. Ob er abgebogen ist, bleibt verdeckt. */
  function gegnerSicht() {
    const B = Z.bot, n = Z.sicht; if (!n) return `<div class="riss-gruppe"><h3>${esc(B.name)}</h3><p class="note">Noch nichts zu hören.</p></div>`;
    const v = B.verlauf[n - 1];
    return gruppeHtml(`${B.name} – zuletzt gehört: Raum ${n}`, B.gruppe, v.stufen, v.leben) ;
  }
  /** Nach jedem eigenen Raum: Der Gegner ist gleich weit oder einen Raum zurück (er spielt gleichzeitig, aber nicht gleich schnell) */
  function sichtNeu() { const mein = Z.ich.raeume, lag = Math.random() < 0.5 ? 1 : 0; Z.sicht = Math.max(Z.sicht, Math.min(Z.bot.raeume, Math.max(1, mein - lag))); }

  /* ---------- Start ---------- */
  async function zeigen() {
    seite(`<h1 class="hub-gruss">Rissgänger</h1><p class="hub-untertitel">Einen Moment …</p>`);
    try { await bereit(); if (window.ABSAMMLUNG) await window.ABSAMMLUNG.laden().catch(() => null); } catch (e) { return seite(`<h1 class="hub-gruss">Rissgänger</h1><p class="note">${esc(e.message)}</p>`); }
    start();
  }
  function start() {
    const { eigene, leih } = wahlHelden(); Z.wahl = Z.wahl.filter((f) => eigene.includes(f) || leih.includes(f));
    seite(`<div class="riss-kopf"><h1 class="hub-gruss">Rissgänger <span class="riss-marke">Prototyp</span></h1>
      <p class="hub-untertitel">Ein Riss öffnet sich. Zwei Gruppen steigen von zwei Seiten hinein und kämpfen sich zum Siegel.</p></div>
      <div class="riss-regeln"><ul>
        <li><b>Alle beginnen auf Stufe 1.</b> Jeder gewonnene Raum gibt eine Stufe, Raum 4 und 5 dazu Beute.</li>
        <li><b>Nach Raum 2 entscheidest du nach jedem Raum:</b> weiter in die Tiefe oder zum Siegel. Höchstens fünf Räume.</li>
        <li><b>Du siehst, wie tief dein Gegner ist</b> – aber nicht, ob er schon zum Siegel abgebogen ist.</li>
        <li><b>Wer nach weniger Räumen abbiegt,</b> steht schon am Siegel und beginnt mit 2 oder 3 Siegelpunkten. Wer tiefer geht, kommt stärker an.</li>
        <li><b>Am Siegel:</b> Am Ende jeder Runde bekommt einen Punkt, wer mehr Helden am Siegel hat. Das Siegel springt alle zwei Runden. Gefallene kehren nach zwei Runden zurück. Fünf Punkte gewinnen, sonst wird nach zwölf Runden gewertet.</li></ul></div>
      <h2 class="riss-h2">Wähle drei Helden</h2>
      <div class="arena-helden" id="riss-helden">${eigene.map((f) => heldKarte(f, "Stufe 1", Z.wahl.includes(f) ? "an" : "", `data-held="${f}"`)).join("")}${leih.map((f) => heldKarte(f, "Leihheld", Z.wahl.includes(f) ? "an" : "", `data-held="${f}"`)).join("")}</div>
      <label class="riss-schalter">Heilung vor dem Finale
        <select id="riss-heilung"><option value="gerechnet"${Z.heilung === "gerechnet" ? " selected" : ""}>Gerechnete Regel: frühere Gruppe halbe fehlende Trefferpunkte, spätere keine</option><option value="keine"${Z.heilung === "keine" ? " selected" : ""}>Testvariante: niemand wird geheilt</option></select></label>
      <div class="knoepfe"><button class="btn" id="riss-los" ${Z.wahl.length === 3 ? "" : "disabled"}>In den Riss</button><button class="btn ghost" id="riss-mitschrift">Mitschrift (${mitschrift().length})</button></div>
      <p class="note">Prototyp gegen den Rechner. Es gibt keine Belohnung, und nichts wird an den Server geschickt. Lädst du die Seite neu, ist die Partie weg.</p>`);
    $("#riss-helden").onclick = (ev) => { const b = ev.target.closest("[data-held]"); if (!b) return; const f = b.dataset.held;
      if (Z.wahl.includes(f)) Z.wahl = Z.wahl.filter((x) => x !== f); else if (Z.wahl.length < 3) Z.wahl.push(f); else return; start(); };
    $("#riss-heilung").onchange = (ev) => { Z.heilung = ev.target.value === "keine" ? "keine" : "gerechnet"; };
    $("#riss-los").onclick = los; $("#riss-mitschrift").onclick = mitschriftZeigen;
  }
  function los() {
    if (Z.wahl.length !== 3) return;
    Z.seed = zufall(); Z.beginn = Date.now(); Z.sicht = 0;
    Z.ich = K.neu(Z.wahl, "Du");
    const gegner = F.REIHE.slice().map((f) => [Math.random(), f]).sort((a, b) => a[0] - b[0]).slice(0, 3).map((x) => x[1]);
    Z.bot = K.botWeg(gegner, Z.seed % 100000 + 17, NAMEN[Z.seed % NAMEN.length]); // der Rechner geht seinen Weg für sich; gezeigt wird davon nur, was man hören darf
    Z.log = { v: 1, wann: new Date().toISOString(), heilung: Z.heilung, ich: { helden: Z.wahl.slice(), raeume: [], entscheidungen: [], beute: [] }, gegner: { helden: gegner, raeume: Z.bot.raeume, verlauf: Z.bot.verlauf.map((v) => ({ raum: v.raum, sieg: v.sieg, runden: v.runden, gefallen: v.gefallen.length, beute: v.beute || null })) } };
    raumVor(0);
  }

  /* ---------- der Weg ---------- */
  function raumVor(i) {
    const r = K.RAEUME[i];
    seite(`<p class="riss-schritt">Raum ${i + 1} von höchstens ${K.MAX_RAEUME}</p><h1 class="hub-gruss">${esc(r.name)}</h1><p class="hub-untertitel">${esc(r.text)}</p>
      <p class="riss-lohn">Lohn bei Sieg: +1 Stufe für jeden, der am Ende steht${i === 3 ? ", dazu ein Gegenstand" : i === 4 ? ", dazu ein Gegenstand oder ein Segen" : ""}.</p>
      <div class="riss-zwei">${gruppeHtml("Deine Gruppe", Z.ich.gruppe, Z.ich.stufen, K.leben(Z.ich), Z.ich.dinge, Z.ich.segen)}${gegnerSicht()}</div>
      <div class="knoepfe"><button class="btn" id="riss-kampf">In den Raum</button></div>`);
    $("#riss-kampf").onclick = () => raum(i);
  }
  function raum(i) {
    const t0 = Date.now();
    window.AB.kampfStarten(K.raumOpts(Z.ich, i), (st) => { window.MYTHARA.zeigeHub(); raumNach(i, st, Date.now() - t0); });
    if (window.AB.st) { K.raumDinge(Z.ich, window.AB.st); window.AB.render(); }
  }
  function raumNach(i, st, dauer) {
    const e = K.raumEnde(Z.ich, i, st); sichtNeu();
    Z.log.ich.raeume.push({ raum: i + 1, sieg: e.sieg, runden: e.runden, gefallen: e.gefallen.length, sekunden: Math.round(dauer / 1000) });
    const name = (f) => esc(F.FIGUREN[f].name);
    const ergebnis = e.sieg ? `<p class="riss-ergebnis gut">Raum ${i + 1} geschafft, in ${e.runden} ${e.runden === 1 ? "Runde" : "Runden"}.${e.auf.length ? ` +1 Stufe: ${e.auf.map(name).join(", ")}.` : ""}${e.gefallen.length ? ` Gefallen und ohne Stufe: ${e.gefallen.map(name).join(", ")} (steht mit halben Trefferpunkten wieder auf).` : ""}</p>`
      : `<p class="riss-ergebnis schlecht">Die Gruppe ist in Raum ${i + 1} gefallen. Kein Lohn. Alle stehen wieder auf, voll geheilt.</p>`;
    const angebot = e.sieg ? K.beuteAngebot(Z.ich, i, Math.random) : null;
    if (angebot && (angebot.dinge.length || angebot.segen.length)) return beute(i, ergebnis, angebot);
    entscheidung(i, ergebnis);
  }
  function beute(i, ergebnis, a) {
    let wahl = null;
    const zeichne = () => {
      seite(`<p class="riss-schritt">Nach Raum ${i + 1}</p><h1 class="hub-gruss">Beute</h1>${ergebnis}
        <p class="hub-untertitel">${a.segen.length ? "Wähle einen Gegenstand für einen Helden oder einen Segen für die ganze Gruppe." : "Wähle einen Gegenstand für einen Helden."}</p>
        <div class="riss-beute">${a.dinge.map((id) => { const d = R.GEGENSTAENDE[id]; return `<button type="button" class="riss-ding${wahl && wahl.ding === id ? " an" : ""}" data-ding="${id}"><i>${d.sym || "◆"}</i><b>${esc(d.name)}</b><small>${esc(d.text)}</small></button>`; }).join("")}
          ${a.segen.map((id) => { const d = F.SEGEN[id]; return `<button type="button" class="riss-ding segen${wahl && wahl.segen === id ? " an" : ""}" data-segen="${id}"><i>${d.zeichen}</i><b>Segen: ${esc(d.name)}</b><small>${esc(d.text)} Gilt für die ganze Gruppe.</small></button>`; }).join("")}</div>
        ${wahl && wahl.ding ? `<h2 class="riss-h2">Wer bekommt ${esc(R.GEGENSTAENDE[wahl.ding].name)}?</h2><div class="arena-helden riss-wer">${Z.ich.gruppe.map((f) => (K.kannTragen(Z.ich, wahl.ding, f) ? heldKarte(f, "Stufe " + Z.ich.stufen[f], wahl.held === f ? "an" : "", `data-wer="${f}"`) : heldKarte(f, "kann das nicht tragen", "fest leer", "disabled"))).join("")}</div>` : ""}
        <div class="knoepfe"><button class="btn" id="riss-nehmen" ${wahl && (wahl.segen || wahl.held) ? "" : "disabled"}>Nehmen</button></div>`);
      document.querySelector("[data-riss] .riss-beute").onclick = (ev) => { const b = ev.target.closest("button"); if (!b) return; wahl = b.dataset.segen ? { segen: b.dataset.segen } : { ding: b.dataset.ding, held: null };
        if (wahl.ding) { const l = Z.ich.gruppe.filter((f) => K.kannTragen(Z.ich, wahl.ding, f)); if (l.length === 1) wahl.held = l[0]; } zeichne(); };
      const wer = document.querySelector("[data-riss] .riss-wer"); if (wer) wer.onclick = (ev) => { const b = ev.target.closest("[data-wer]"); if (!b) return; wahl.held = b.dataset.wer; zeichne(); };
      $("#riss-nehmen").onclick = () => { K.beuteNehmen(Z.ich, wahl); Z.log.ich.beute.push(Object.assign({ raum: i + 1 }, wahl)); entscheidung(i, ""); };
    };
    zeichne();
  }
  /** Weiter oder zum Siegel */
  function entscheidung(i, ergebnis) {
    const n = i + 1, muss = n < K.MIN_RAEUME, ende = n >= K.MAX_RAEUME, t0 = Date.now();
    const merke = (w) => Z.log.ich.entscheidungen.push({ nach: n, wahl: w, gegnerGehoert: Z.sicht, sekunden: Math.round((Date.now() - t0) / 1000), leben: Math.round(100 * K.lebenSchnitt(Z.ich)) });
    seite(`<p class="riss-schritt">Nach Raum ${n}</p><h1 class="hub-gruss">${muss ? "Weiter in den Riss" : ende ? "Tiefer geht es nicht" : "Weiter oder zum Siegel?"}</h1>${ergebnis}
      <div class="riss-zwei">${gruppeHtml("Deine Gruppe", Z.ich.gruppe, Z.ich.stufen, K.leben(Z.ich), Z.ich.dinge, Z.ich.segen)}${gegnerSicht()}</div>
      ${muss || ende ? "" : `<p class="riss-verdeckt">Du hörst ${esc(Z.bot.name)} im Riss. Ob die Gruppe noch kämpft oder schon am Siegel steht, weißt du nicht.</p>
      <div class="riss-wege"><div><b>Weiter in Raum ${n + 1}</b><small>+1 Stufe${n === 3 ? ", ein Gegenstand" : n === 4 ? ", ein Gegenstand oder Segen" : ""}. Kommst du später an als dein Gegner, steht er schon am Siegel, hat 2 oder 3 Siegelpunkte${Z.heilung === "gerechnet" ? ", und du wirst vor dem Finale nicht geheilt" : ""}.</small></div>
        <div><b>Zum Siegel</b><small>Endgültig. Kommst du früher an, stehst du am Siegel und beginnst mit 2 Siegelpunkten für einen Raum Vorsprung, mit 3 für zwei oder mehr${Z.heilung === "gerechnet" ? ", dazu die Hälfte der fehlenden Trefferpunkte" : ""}.</small></div></div>`}
      <div class="knoepfe">${ende ? "" : `<button class="btn${muss ? "" : " ghost"}" id="riss-weiter">Weiter in Raum ${n + 1}</button>`}${muss ? "" : `<button class="btn" id="riss-siegel">Zum Siegel</button>`}</div>`);
    const w = $("#riss-weiter"), s = $("#riss-siegel");
    if (w) w.onclick = () => { if (!muss) merke("weiter"); raumVor(i + 1); };
    if (s) s.onclick = () => { merke(ende ? "siegel (Ende des Wegs)" : "siegel"); ankunft(); };
  }

  /* ---------- Ankunft und Finale ---------- */
  function ankunft() {
    Z.ich.abgebogen = true; Z.wegEnde = Date.now();
    const a = Z.ich.raeume, b = Z.bot.raeume, vor = Math.abs(a - b), frueh = a < b ? 1 : b < a ? 2 : 0, p = K.startPunkte(vor), heil = Z.heilung === "gerechnet";
    const lage = !frueh ? `Ihr kommt gleichzeitig an: beide nach ${a} Räumen. Niemand beginnt mit Siegelpunkten.${heil ? " Beide bekommen die Hälfte der fehlenden Trefferpunkte zurück." : ""}`
      : frueh === 1 ? `Du bist zuerst da: ${a} Räume gegen ${b}. Deine Gruppe steht am Siegel und beginnt mit <b>${p} Siegelpunkten</b>.${heil ? " Deine Helden bekommen die Hälfte der fehlenden Trefferpunkte zurück." : ""}`
        : `${esc(Z.bot.name)} war zuerst da: ${b} Räume gegen deine ${a}. Die Gruppe steht am Siegel und beginnt mit <b>${p} Siegelpunkten</b>.${heil ? " Deine Helden werden vor dem Finale nicht geheilt." : ""}`;
    seite(`<p class="riss-schritt">Ankunft</p><h1 class="hub-gruss">Der Siegelsaal</h1><p class="riss-ergebnis ${frueh === 2 ? "schlecht" : "gut"}">${lage}</p>
      <div class="riss-zwei">${gruppeHtml("Deine Gruppe", Z.ich.gruppe, Z.ich.stufen, K.leben(Z.ich), Z.ich.dinge, Z.ich.segen)}${gruppeHtml(`${Z.bot.name} – ${b} Räume`, Z.bot.gruppe, Z.bot.stufen, K.leben(Z.bot), Z.bot.dinge, Z.bot.segen)}</div>
      <div class="riss-regeln"><ul><li>Am Siegel steht, wer auf dem leuchtenden Feld oder direkt daneben steht, auch schräg.</li><li>Am Ende jeder Runde: ein Siegelpunkt für die Seite mit mehr Helden am Siegel.</li>
        <li>Nach jeder zweiten Runde springt das Siegel auf das gestrichelte Feld.</li><li>Holt die Seite, die zurückliegt, zwei Runden in Folge den Punkt, verliert die führende einen.</li>
        <li>Gefallene kehren nach zwei Runden am eigenen Eingang zurück. Liegt eine ganze Gruppe am Boden, bekommt der Gegner einen Punkt.</li><li>Fünf Siegelpunkte gewinnen. Sonst wird nach zwölf Runden gewertet.</li></ul><p class="note">${esc(heilText(Z.heilung))}</p></div>
      <div class="knoepfe"><button class="btn" id="riss-finale">Zum Siegel</button></div>`);
    $("#riss-finale").onclick = finale;
  }
  /** Die Siegel-Schicht hinter die Regeln hängen (nur für den Stand dieses Finales) */
  function einhaengen() {
    const o = Z.orig = { bewegen: R.bewegen, handeln: R.handeln, zugEnde: R.zugEnde };
    const huelle = (k) => function (s, ...a) {
      if (s !== Z.st || !s.riss || s.riss.aus) return o[k].call(this, s, ...a);
      const akt = R.aktiv(s);
      if (akt && R.teamVon(s, akt) === 2 && !Z.botRuft) return k === "zugEnde" ? undefined : { fehler: "Du bist gerade nicht am Zug." }; // die Helden des Gegners zieht nur der Rechner
      K.vor(s); const r = o[k].call(this, s, ...a); K.nach(s, o.zugEnde); leiste(); return r;
    };
    for (const k of Object.keys(o)) R[k] = huelle(k);
  }
  function aushaengen() { if (Z.orig) for (const k of Object.keys(Z.orig)) R[k] = Z.orig[k]; Z.orig = null; }
  function finale() {
    const st = Z.st = K.finaleNeu(Z.seed, Z.ich, Z.bot, { heilung: Z.heilung, namen: ["Du", Z.bot.name] });
    Z.finalBeginn = Date.now(); Z.botBis = Date.now() + 1500;
    einhaengen();
    window.AB.arenaStart({ st, seite: 1, ende: (s) => setTimeout(() => finaleEnde(s), 2600) });
    Z.takt = setInterval(botTakt, 300);
    const karte = $("#karte"); if (karte) { Z.beob = new MutationObserver(marken); Z.beob.observe(karte, { childList: true, subtree: true }); }
    marken(); leiste();
  }
  /** Der Rechner zieht: ein Schritt, dann eine Pause (lang genug für den Würfel) */
  function botTakt() {
    const st = Z.st; if (!st || st.ende || !st.riss || st.riss.aus) return;
    const a = R.aktiv(st); if (!a || R.teamVon(st, a) !== 2) { Z.botBis = Math.max(Z.botBis, Date.now() + 900); return; }
    if (Date.now() < Z.botBis) return;
    let w; try { w = K.finaleBot(st); } catch (e) { w = { typ: "ende" }; }
    Z.botRuft = true;
    try { if (window.AB.arenaWunsch(w) && w.typ !== "ende") window.AB.arenaWunsch({ typ: "ende" }); } finally { Z.botRuft = false; }
    Z.botBis = Date.now() + (w.typ === "aktion" ? Math.max(2500, (window.AB_WURFZEIT || 0) + 600) : w.typ === "bewegen" ? 900 : 1100);
  }
  /** Siegelfeld, Siegelzone und das nächste Feld auf der Karte kennzeichnen */
  function marken() {
    const st = Z.st, karte = $("#karte"); if (!karte) return;
    const S = st && st.riss && !st.ende ? K.siegel(st) : null, N = S ? K.naechstesSiegel(st) : null;
    karte.querySelectorAll("rect.feld").forEach((r) => { const x = +r.dataset.x, y = +r.dataset.y, d = S ? Math.max(Math.abs(x - S.x), Math.abs(y - S.y)) : 9;
      const kl = d === 0 ? "riss-siegel" : d === 1 && !st.karte.block.has(x + "," + y) ? "riss-zone" : N && x === N.x && y === N.y ? "riss-naechst" : "";
      for (const c of ["riss-siegel", "riss-zone", "riss-naechst"]) if (r.classList.contains(c) !== (c === kl)) r.classList.toggle(c, c === kl); });
  }
  function leiste() {
    let el = document.getElementById("riss-leiste"); const st = Z.st;
    if (!st || !st.riss || st.ende) { if (el) el.hidden = true; return; }
    if (!el) { el = document.createElement("div"); el.id = "riss-leiste"; el.className = "riss-leiste"; document.body.appendChild(el); }
    const X = st.riss, a = K.steht(st, 1), b = K.steht(st, 2), springt = X.runde % 2 === 0 ? "springt nach dieser Runde" : "springt nach der nächsten Runde";
    el.hidden = false;
    el.innerHTML = `<span class="rl-punkte">Siegel <b>${X.P[1]}</b> : <b>${X.P[2]}</b> <small>bis ${X.ziel}</small></span><span class="rl-am ${a > b ? "gut" : b > a ? "schlecht" : ""}">Am Siegel: du <b>${a}</b> · Gegner <b>${b}</b></span><span>Runde ${Math.min(X.runde, X.max)}/${X.max} · ${springt}</span>`;
    marken();
  }
  function finaleAufraeumen() {
    clearInterval(Z.takt); Z.takt = null; if (Z.beob) { Z.beob.disconnect(); Z.beob = null; }
    window.AB.arenaEnde(); aushaengen(); Z.st = null; marken();
    const el = document.getElementById("riss-leiste"); if (el) el.hidden = true;
  }
  function finaleEnde(st) {
    const X = st.riss, aus = X.aus || { sieger: st.arena.sieger, grund: "abbruch", runden: st.runde, punkte: X.P }, sieg = aus.sieger === 1, jetzt = Date.now();
    const kopie = JSON.parse(JSON.stringify({ aus, M: X.M, start: X.start, frueh: X.frueh, vor: X.vor }));
    finaleAufraeumen(); window.MYTHARA.zeigeHub();
    Object.assign(Z.log, { raeume: [Z.ich.raeume, Z.bot.raeume], stufen: [K.stufeSchnitt(Z.ich), K.stufeSchnitt(Z.bot)].map((x) => Math.round(x * 100) / 100), frueh: kopie.frueh, startPunkte: [kopie.start[1], kopie.start[2]], sieger: aus.sieger, sieg, grund: aus.grund, punkte: [aus.punkte[1], aus.punkte[2]],
      finalRunden: aus.runden, wegRunden: [Z.ich.runden, Z.bot.runden], auslöschungen: kopie.M.aus, rueckkehrer: kopie.M.rueck, zurueckerobert: kopie.M.zurueck, siegelwechsel: kopie.M.wechsel, runden: kopie.M.runden,
      minuten: { weg: Math.round((Z.wegEnde - Z.beginn) / 6000) / 10, finale: Math.round((jetzt - Z.finalBeginn) / 6000) / 10, gesamt: Math.round((jetzt - Z.beginn) / 6000) / 10 } });
    const alle = mitschrift(); alle.push(Z.log); try { localStorage.setItem(SPEICHER, JSON.stringify(alle.slice(-60))); } catch (e) { /* privat */ }
    const L = Z.log, grund = aus.grund === "siegel" ? `${sieg ? "Du hast" : esc(Z.bot.name) + " hat"} fünf Siegelpunkte.` : "Zwölf Runden sind um. Es zählen die Siegelpunkte.";
    seite(`<p class="riss-schritt">Ende der Partie</p><h1 class="hub-gruss">${sieg ? "Der Riss gehört dir" : "Der Riss schließt sich"}</h1>
      <p class="riss-ergebnis ${sieg ? "gut" : "schlecht"}">${sieg ? "Sieg" : "Niederlage"}: Siegelpunkte <b>${L.punkte[0]} : ${L.punkte[1]}</b>. ${grund}</p>
      <table class="riss-tabelle"><tr><th></th><th>Du</th><th>${esc(Z.bot.name)}</th></tr>
        <tr><td>Räume</td><td>${L.raeume[0]}</td><td>${L.raeume[1]}</td></tr><tr><td>Stufe im Schnitt</td><td>${String(L.stufen[0]).replace(".", ",")}</td><td>${String(L.stufen[1]).replace(".", ",")}</td></tr>
        <tr><td>Siegelpunkte zu Beginn</td><td>${L.startPunkte[0]}</td><td>${L.startPunkte[1]}</td></tr><tr><td>Siegelpunkte am Ende</td><td>${L.punkte[0]}</td><td>${L.punkte[1]}</td></tr></table>
      <p class="note">Finale: ${L.finalRunden} Runden · Siegelwechsel ${L.siegelwechsel} · Rückkehrer ${L.rueckkehrer} · Auslöschungen ${L["auslöschungen"]} · zurückerobert ${L.zurueckerobert}<br>Dauer: Weg ${String(L.minuten.weg).replace(".", ",")} min, Finale ${String(L.minuten.finale).replace(".", ",")} min, zusammen ${String(L.minuten.gesamt).replace(".", ",")} min · ${esc(heilText(L.heilung))}</p>
      <div class="knoepfe"><button class="btn" id="riss-nochmal">Noch einmal</button><button class="btn ghost" id="riss-mitschrift">Mitschrift (${alle.length})</button></div>`);
    $("#riss-nochmal").onclick = start; $("#riss-mitschrift").onclick = mitschriftZeigen;
  }

  /* ---------- Mitschrift ---------- */
  function mitschrift() { try { const l = JSON.parse(localStorage.getItem(SPEICHER) || "[]"); return Array.isArray(l) ? l : []; } catch (e) { return []; } }
  function mitschriftZeigen() {
    const l = mitschrift(), n = l.length, siege = l.filter((x) => x.sieg).length, schnitt = (f) => (n ? (l.reduce((a, x) => a + f(x), 0) / n).toFixed(1).replace(".", ",") : "–");
    const tiefe = [2, 3, 4, 5].map((k) => `${k} Räume: ${l.filter((x) => x.raeume && x.raeume[0] === k).length}`).join(" · ");
    const o = window.MYTHARA.fenster("Rissgänger: Mitschrift", `<div class="riss-mitschrift"><p>${n} ${n === 1 ? "Partie" : "Partien"} auf diesem Gerät · ${siege} gewonnen</p>
      ${n ? `<p>Abgebogen nach – ${tiefe}</p><p>Dauer im Schnitt: ${schnitt((x) => (x.minuten || {}).gesamt || 0)} min (Weg ${schnitt((x) => (x.minuten || {}).weg || 0)}, Finale ${schnitt((x) => (x.minuten || {}).finale || 0)}) · Finale im Schnitt ${schnitt((x) => x.finalRunden || 0)} Runden</p>
      <table class="riss-tabelle"><tr><th>Wann</th><th>Räume</th><th>Start</th><th>Ende</th><th>Dauer</th><th>Heilung</th></tr>${l.slice().reverse().map((x) => `<tr class="${x.sieg ? "gut" : "schlecht"}"><td>${esc((x.wann || "").slice(5, 16).replace("T", " "))}</td><td>${(x.raeume || []).join(" : ")}</td><td>${(x.startPunkte || []).join(" : ")}</td><td>${(x.punkte || []).join(" : ")} ${x.sieg ? "Sieg" : "Niederlage"}</td><td>${String((x.minuten || {}).gesamt || "").replace(".", ",")} min</td><td>${x.heilung === "keine" ? "keine" : "gerechnet"}</td></tr>`).join("")}</table>` : `<p class="note">Noch keine Partie gespielt.</p>`}
      <div class="knoepfe"><button class="btn klein" id="riss-kopieren" ${n ? "" : "disabled"}>Alles kopieren</button><button class="btn ghost klein" id="riss-leeren" ${n ? "" : "disabled"}>Mitschrift leeren</button></div><p class="note" id="riss-kopiert" role="status"></p></div>`);
    const w = (o && o.querySelector ? o : document), kop = w.querySelector("#riss-kopieren"), leer = w.querySelector("#riss-leeren"), hin = w.querySelector("#riss-kopiert");
    if (kop) kop.onclick = async () => { const t = JSON.stringify(l); try { await navigator.clipboard.writeText(t); hin.textContent = "Kopiert. Du kannst die Mitschrift jetzt irgendwo einfügen."; } catch (e) { hin.textContent = "Kopieren ging nicht. Der Text steht in der Zwischenablage nicht bereit."; } };
    if (leer) leer.onclick = () => { if (leer.dataset.sicher !== "1") { leer.dataset.sicher = "1"; leer.textContent = "Wirklich leeren?"; return; } try { localStorage.removeItem(SPEICHER); } catch (e) { /* privat */ } hin.textContent = "Mitschrift geleert."; leer.disabled = true; kop.disabled = true; };
  }

  /* ---------- Zugang: ein Knopf im Dorf, solange der Schalter an ist ---------- */
  function knopf() {
    let b = document.getElementById("riss-zugang");
    if (!b) { b = document.createElement("button"); b.id = "riss-zugang"; b.className = "riss-zugang"; b.type = "button"; b.innerHTML = "⟁ Rissgänger <small>Prototyp</small>"; b.onclick = zeigen; document.body.appendChild(b); }
    const hub = $("#hub"); b.hidden = !(hub && !hub.hidden) || Boolean(document.querySelector("[data-riss]"));
  }
  setInterval(knopf, 700);
  window.RISS = { zeigen, zustand: () => Z, kern: () => K, mitschrift };
})();
