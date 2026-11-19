/*
 * Mythara – Rissgänger (Prototyp): die Oberfläche. Regeln: doku/konzepte/rissgaenger.md, Regelkern: js/riss-kern.js
 *
 * Nur gegen den Rechner, nur auf diesem Gerät: kein Server, keine Datenbank, keine Belohnung. Die Arena bleibt unberührt.
 * Sichtbar nur mit dem Schalter …/spiel.html?riss=1 (gilt für diesen Tab; ?riss=0 schaltet ihn wieder ab).
 * Schalter: Heilung vor dem Finale (vor dem Start wählbar oder ?rissheil=keine) · ?rissweg=fest spielt den festen Weg der ersten Fassung.
 * Räume laufen als gewöhnlicher Kampf (AB.kampfStarten), das Finale als Arena-Duell auf diesem Gerät (AB.arenaStart);
 * die Siegel-Regeln hängen sich für die Dauer des Finales hinter bewegen, handeln und Zugende der Regeln und werden danach wieder gelöst.
 * Wer früher am Siegel ist, wartet dort: Helden aufstellen, die Siegelpunkte zählen hoch, und man kann dem Gegner zuschauen
 * (seine Räume werden dafür mit demselben Zufall noch einmal gespielt und wie ein fremder Kampf angezeigt).
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
  const SCHNELL = params.has("schnell"), TAKT = +params.get("risstakt") || (SCHNELL ? 60 : 2300); // so lange dauert beim Warten ein Zug des Gegners
  let K = null;
  const Z = { wahl: [], heilung: params.get("rissheil") === "keine" ? "keine" : "gerechnet", fest: params.get("rissweg") === "fest", art: params.get("rissart") === "abbiegen" ? "abbiegen" : "karte", zeit: Math.max(20, +params.get("risszeit") || 240), gegnerZiel: [2, 3, 4, 5].includes(+params.get("rissgegner")) ? +params.get("rissgegner") : 0, folge: null, ich: null, bot: null, seed: 0, st: null, orig: null, botRuft: false, botBis: 0, takt: null, beob: null, log: null, beginn: 0, wegEnde: 0, sicht: 0, warte: null };

  /* ---------- Hilfen ---------- */
  function skript(src) { return new Promise((ok, nein) => { if (document.querySelector(`script[data-riss="${src}"]`)) return ok(); const s = document.createElement("script"); s.src = src; s.dataset.riss = src; s.onload = ok; s.onerror = () => nein(new Error("Datei fehlt: " + src)); document.head.appendChild(s); }); }
  async function bereit() {
    if (K) return;
    const v = (document.querySelector('script[src*="riss.js"]').getAttribute("src").split("?v=")[1]) || "1";
    // bewusst nicht „?v=“: Die Fassungsprüfung (js/mythara.js) vergleicht alle eingebundenen Dateien mit „?v=“ gegen die Seite und lüde sonst neu
    await skript("server/arena-bot.js?r=" + v); await skript("js/riss-kern.js?r=" + v);
    K = window.ABRISSKERN(R, (window.ABD_ALLE && window.ABD_ALLE.grauwacht && window.ABD_ALLE.grauwacht.KARTEN) || {}, window.ABARENABOT);
  }
  /** Zurück aus einem Kampf: Was noch über dem Bild liegt (Würfel, Ergebnisrolle, Banner), gehört nicht auf die nächste Seite */
  function kampfBildWeg() { const w = $("#wurf"); if (w) w.classList.remove("an"); const b = $("#fx-banner"); if (b) { b.className = "fx-banner"; b.innerHTML = ""; } if (window.W3D && window.W3D.weg) window.W3D.weg(); }
  const zumHub = () => { kampfBildWeg(); window.MYTHARA.zeigeHub(); };
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
  const ART = { E: "Einstieg", S: "Schwerer Raum", B: "Beuteraum", F: "Raum" };
  const lohnText = (r, i) => (r.art === "B" ? "Lohn bei Sieg: ein Gegenstand" + (Z.ich.folge.slice(0, i).includes("B") ? " oder ein Segen" : "") + ". Keine Stufe."
    : "Lohn bei Sieg: +1 Stufe für jeden, der am Ende steht" + (r.art === "F" && i === 3 ? ", dazu ein Gegenstand" : r.art === "F" && i === 4 ? ", dazu ein Gegenstand oder ein Segen" : "") + ".");
  /** Der Weg bisher als Reihe: bekannte Räume mit ihrer Art, kommende verdeckt */
  function wegHtml(bis) {
    if (!Z.ich.folge) return "";
    return `<div class="riss-weg" aria-label="Der Weg bisher">${[0, 1, 2, 3, 4].map((i) => (i < bis ? `<span class="art-${Z.ich.folge[i]}"><i>${i + 1}</i>${ART[Z.ich.folge[i]]}</span>` : `<span class="offen"><i>${i + 1}</i>?</span>`)).join("")}</div>`;
  }
  /** Zeile je Held: Stufe und Leben */
  function gruppeHtml(titel, gruppe, stufen, leben, dinge, segen) {
    return `<div class="riss-gruppe"><h3>${esc(titel)}</h3><div class="riss-gruppe-helden">${gruppe.map((f) => { const d = F.FIGUREN[f], l = Math.round(100 * (leben ? leben[f] : 1));
      return `<div class="riss-held" style="--k:${F.KLASSEN[d.klasse].farbe}"><img src="${F.bild(f)}" alt=""><div><b>${esc(d.name)}</b><span>Stufe ${stufen[f]}</span><i class="riss-tp"><u style="width:${l}%"></u></i><small>${l} % Leben${dinge && (dinge[f] || []).length ? " · " + dinge[f].map((id) => esc(R.GEGENSTAENDE[id].name)).join(", ") : ""}</small></div></div>`; }).join("")}</div>
      ${segen && segen.length ? `<p class="riss-segen">Segen: ${segen.map((id) => `${F.SEGEN[id].zeichen} ${esc(F.SEGEN[id].name)}`).join(", ")}</p>` : ""}</div>`;
  }
  /** Was man vom Gegner sieht: nur, wie tief er zuletzt war. Seine Helden, Stufen und sein Zustand bleiben verdeckt, bis man sich am Siegel trifft –
   *  und ob er schon abgebogen ist, erst recht. */
  function gegnerSicht() {
    const B = Z.bot, n = Z.sicht;
    return `<div class="riss-gruppe riss-gegner"><h3>${esc(B.name)}</h3><p class="riss-gehoert">${n ? `Zuletzt gehört: <b>Raum ${n}</b>` : "Noch nichts zu hören."}</p><p class="note">Wer in der Gruppe ist und wie stark sie ist, siehst du erst am Siegel.</p></div>`;
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
    warteStopp(); uhrEnde(); if (Z.log && !Z.log.fertig) Z.log = null;
    const { eigene, leih } = wahlHelden(); Z.wahl = Z.wahl.filter((f) => eigene.includes(f) || leih.includes(f));
    seite(`<div class="riss-kopf"><h1 class="hub-gruss">Rissgänger <span class="riss-marke">Prototyp</span></h1>
      <p class="hub-untertitel">Ein Riss öffnet sich. Zwei Gruppen steigen von zwei Seiten hinein und kämpfen sich zum Siegel.</p></div>
      <div class="riss-regeln"><ul>
        ${Z.art === "karte" ? `<li><b>Alle beginnen auf Stufe 1.</b> Der erste Raum ist die Mitte des Risses und leicht.</li>
        <li><b>Danach öffnet sich die Karte, und die Zeit läuft:</b> ${Math.round(Z.zeit / 60 * 10) / 10} Minuten für vier dunkle Räume – ein schwerer, ein Boss, zwei leichte. Für beide Seiten dieselben, und die Uhr läuft für beide gleich.</li>
        <li><b>Erfahrung gibt es für jeden Lebenspunkt, den ein Monster verliert.</b> Sie hebt die ganze Gruppe; der blaue Balken im Kampf zählt mit.</li>
        <li><b>Erbsplitter und Funde:</b> Jedes besiegte Monster lässt Erbsplitter liegen – oder selten einen Fund für einen Helden (der Boss oft). Aufgehoben wird von Hand: einen Helden daneben stellen und das Feld antippen. Bei einem Fund wählst du, wer ihn bekommt.</li>
        <li><b>Der Raum bleibt offen,</b> auch wenn alle Monster besiegt sind: Du entscheidest, ob du noch einsammelst oder zur Karte gehst. Die Zeit läuft weiter.</li>
        <li><b>Raum verlassen:</b> Mitten im Kampf kannst du gehen. Erfahrung und Aufgehobenes bleiben, der Raum ist danach zu.</li>
        <li><b>Vor dem Finale erscheint die Siegelwächterin.</b> Bei ihr kaufst du für Erbsplitter Heilung, Tränke, Gegenstände und Segen.</li>
        <li><b>Ist die Zeit um, holt der Riss beide Gruppen in den Siegelsaal</b> – auch mitten aus einem Kampf. Niemand wartet, niemand beginnt mit Punkten.</li>
        <li><b>Deinen Gegner hörst du nur werkeln.</b> Was er erkundet und wie stark er ist, siehst du erst am Siegel.</li>` : `        <li><b>Alle beginnen auf Stufe 1.</b> Raum 1 ist leicht und gibt eine Stufe.</li>
        ${Z.fest ? `<li><b>Fester Weg:</b> Jeder gewonnene Raum gibt eine Stufe, Raum 4 und 5 dazu Beute.</li>` : `<li><b>Danach ist gelost, was kommt:</b> zwei schwere Räume (+1 Stufe, echte Gefahr) und zwei Beuteräume (kurzer Kampf, ein Gegenstand, keine Stufe). Die Reihenfolge ist für beide Seiten dieselbe – und du siehst sie erst, wenn du den Raum betrittst.</li>`}
        <li><b>Nach Raum 2 entscheidest du nach jedem Raum:</b> weiter in die Tiefe oder zum Siegel. Höchstens fünf Räume.</li>
        <li><b>Du hörst, wie tief dein Gegner ist</b> – aber nicht, wer in seiner Gruppe ist, wie stark sie ist und ob er schon zum Siegel abgebogen ist.</li>
        <li><b>Wer nach weniger Räumen abbiegt,</b> stellt seine Helden am Siegel auf und sammelt Siegelpunkte, solange der andere noch im Riss ist: 2 für den ersten Raum, 1 für jeden weiteren, höchstens 3. Wer tiefer geht, kommt stärker an.</li>`}
        <li><b>Am Siegel:</b> Am Ende jeder Runde bekommt einen Punkt, wer mehr Helden am Siegel hat. Das Siegel springt alle zwei Runden. Gefallene kehren nach zwei Runden mit vollen Trefferpunkten zurück. Fünf Punkte gewinnen, sonst wird nach zwölf Runden gewertet.</li>
        <li><b>Im Finale sind Zauberplätze, Tränke und Fähigkeiten wieder frisch.</b> Nur die Trefferpunkte und die Beute kommen vom Weg mit.</li></ul></div>
      <h2 class="riss-h2">Wähle drei Helden</h2>
      <div class="arena-helden" id="riss-helden">${eigene.map((f) => heldKarte(f, "Stufe 1", Z.wahl.includes(f) ? "an" : "", `data-held="${f}"`)).join("")}${leih.map((f) => heldKarte(f, "Leihheld", Z.wahl.includes(f) ? "an" : "", `data-held="${f}"`)).join("")}</div>
      <label class="riss-schalter"${Z.art === "karte" ? " hidden" : ""}>Heilung vor dem Finale
        <select id="riss-heilung"><option value="gerechnet"${Z.heilung === "gerechnet" ? " selected" : ""}>Gerechnete Regel: frühere Gruppe halbe fehlende Trefferpunkte, spätere keine</option><option value="keine"${Z.heilung === "keine" ? " selected" : ""}>Testvariante: niemand wird geheilt</option></select></label>
      <label class="riss-schalter">Spielart
        <select id="riss-art"><option value="karte"${Z.art === "karte" ? " selected" : ""}>Karte mit Zeit: Räume frei wählen, am Ende holt der Riss beide ans Siegel</option><option value="abbiegen"${Z.art === "abbiegen" ? " selected" : ""}>Abbiegen: fester Weg, selbst entscheiden, wann es zum Siegel geht</option></select></label>
      ${Z.art === "karte" ? `<label class="riss-schalter">Zeit auf der Karte
        <select id="riss-zeit">${[180, 240, 300].map((n) => `<option value="${n}"${Z.zeit === n ? " selected" : ""}>${n / 60} Minuten</option>`).join("")}${[180, 240, 300].includes(Z.zeit) ? "" : `<option value="${Z.zeit}" selected>${Z.zeit} Sekunden</option>`}</select></label>` : ""}
      <label class="riss-schalter"${Z.art === "karte" ? " hidden" : ""}>Der Gegner biegt ab (nur zum Testen)
        <select id="riss-gegner"><option value="0">zufällig, wie im echten Spiel</option>${[2, 3, 4, 5].map((n) => `<option value="${n}"${Z.gegnerZiel === n ? " selected" : ""}>immer nach Raum ${n}</option>`).join("")}</select></label>
      <div class="knoepfe"><button class="btn" id="riss-los" ${Z.wahl.length === 3 ? "" : "disabled"}>In den Riss</button><button class="btn ghost" id="riss-mitschrift">Mitschrift (${mitschrift().length})</button></div>
      <p class="note">Prototyp gegen den Rechner. Es gibt keine Belohnung, und nichts wird an den Server geschickt. Lädst du die Seite neu, ist die Partie weg.</p>`);
    $("#riss-helden").onclick = (ev) => { const b = ev.target.closest("[data-held]"); if (!b) return; const f = b.dataset.held;
      if (Z.wahl.includes(f)) Z.wahl = Z.wahl.filter((x) => x !== f); else if (Z.wahl.length < 3) Z.wahl.push(f); else return; start(); };
    $("#riss-heilung").onchange = (ev) => { Z.heilung = ev.target.value === "keine" ? "keine" : "gerechnet"; };
    $("#riss-art").onchange = (ev) => { Z.art = ev.target.value === "abbiegen" ? "abbiegen" : "karte"; start(); };
    if ($("#riss-zeit")) $("#riss-zeit").onchange = (ev) => { Z.zeit = +ev.target.value || 240; start(); };
    $("#riss-gegner").onchange = (ev) => { Z.gegnerZiel = +ev.target.value || 0; };
    $("#riss-los").onclick = los; $("#riss-mitschrift").onclick = mitschriftZeigen;
  }
  function los() {
    if (Z.wahl.length !== 3) return;
    if (Z.art === "karte") return losK();
    Z.seed = zufall(); Z.beginn = Date.now(); Z.sicht = 0; Z.warte = null; Z.karte = null;
    Z.folge = Z.fest ? null : K.folgeLosen(Math.random);
    Z.ich = K.neu(Z.wahl, "Du", Z.folge);
    const gegner = F.REIHE.slice().map((f) => [Math.random(), f]).sort((a, b) => a[0] - b[0]).slice(0, 3).map((x) => x[1]);
    Z.bot = K.botWeg(gegner, Z.seed % 100000 + 17, NAMEN[Z.seed % NAMEN.length], Z.folge, Z.gegnerZiel); // der Rechner geht seinen Weg für sich; gezeigt wird davon nur, was man hören darf
    Z.log = { v: 3, wann: new Date().toISOString(), heilung: Z.heilung, weg: Z.fest ? "fest" : "gelost", folge: Z.folge, ich: { helden: Z.wahl.slice(), raeume: [], entscheidungen: [], beute: [] }, gegner: { helden: gegner, fest: Z.gegnerZiel || null } };
    raumVor(0);
  }

  /* ---------- der Weg ---------- */
  function raumVor(i) {
    const r = K.raumVon(Z.ich, i);
    seite(`<p class="riss-schritt">Raum ${i + 1} von höchstens ${K.MAX_RAEUME}${r.art === "F" ? "" : " · " + ART[r.art]}</p><h1 class="hub-gruss">${esc(r.name)}</h1><p class="hub-untertitel">${esc(r.text)}</p>
      ${wegHtml(i + 1)}<p class="riss-lohn">${lohnText(r, i)}</p>
      <div class="riss-zwei">${gruppeHtml("Deine Gruppe", Z.ich.gruppe, Z.ich.stufen, K.leben(Z.ich), Z.ich.dinge, Z.ich.segen)}${gegnerSicht()}</div>
      <div class="knoepfe"><button class="btn" id="riss-kampf">In den Raum</button></div>`);
    $("#riss-kampf").onclick = () => raum(i);
  }
  function raum(i) {
    const t0 = Date.now();
    window.AB.kampfStarten(K.raumOpts(Z.ich, i), (st) => { zumHub(); raumNach(i, st, Date.now() - t0); });
    if (window.AB.st) { K.raumDinge(Z.ich, window.AB.st); window.AB.render(); }
  }
  function raumNach(i, st, dauer) {
    const e = K.raumEnde(Z.ich, i, st); sichtNeu();
    Z.log.ich.raeume.push({ raum: i + 1, art: e.art, sieg: e.sieg, runden: e.runden, gefallen: e.gefallen.length, sekunden: Math.round(dauer / 1000) });
    const name = (f) => esc(F.FIGUREN[f].name);
    const ergebnis = e.sieg ? `<p class="riss-ergebnis gut">Raum ${i + 1} geschafft, in ${e.runden} ${e.runden === 1 ? "Runde" : "Runden"}.${e.auf.length ? ` +1 Stufe: ${e.auf.map(name).join(", ")}.` : ""}${e.gefallen.length ? ` Gefallen${e.art === "B" ? "" : " und ohne Stufe"}: ${e.gefallen.map(name).join(", ")} (steht mit halben Trefferpunkten wieder auf).` : ""}</p>`
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
  /** Weiter oder zum Siegel. Was im nächsten Raum wartet, ist nicht bekannt. */
  function entscheidung(i, ergebnis) {
    const n = i + 1, muss = n < K.MIN_RAEUME, ende = n >= K.MAX_RAEUME, t0 = Date.now(), gelost = Boolean(Z.ich.folge);
    const merke = (w) => Z.log.ich.entscheidungen.push({ nach: n, wahl: w, gegnerGehoert: Z.sicht, sekunden: Math.round((Date.now() - t0) / 1000), leben: Math.round(100 * K.lebenSchnitt(Z.ich)) });
    const wasKommt = gelost ? "Was dort wartet, weißt du nicht: ein schwerer Raum (+1 Stufe, Gefahr) oder ein Beuteraum (ein Gegenstand, keine Stufe)." : `+1 Stufe${n === 3 ? ", ein Gegenstand" : n === 4 ? ", ein Gegenstand oder Segen" : ""}.`;
    seite(`<p class="riss-schritt">Nach Raum ${n}</p><h1 class="hub-gruss">${muss ? "Weiter in den Riss" : ende ? "Tiefer geht es nicht" : "Weiter oder zum Siegel?"}</h1>${ergebnis}${wegHtml(n)}
      <div class="riss-zwei">${gruppeHtml("Deine Gruppe", Z.ich.gruppe, Z.ich.stufen, K.leben(Z.ich), Z.ich.dinge, Z.ich.segen)}${gegnerSicht()}</div>
      ${muss || ende ? "" : `<p class="riss-verdeckt">Du hörst ${esc(Z.bot.name)} im Riss. Ob die Gruppe noch kämpft oder schon am Siegel steht, weißt du nicht.</p>
      <div class="riss-wege"><div><b>Weiter in Raum ${n + 1}</b><small>${wasKommt} Kommst du später an als dein Gegner, steht er schon am Siegel, hat 2 oder 3 Siegelpunkte${Z.heilung === "gerechnet" ? ", und du wirst vor dem Finale nicht geheilt" : ""}.</small></div>
        <div><b>Zum Siegel</b><small>Endgültig. Bist du früher da, stellst du deine Helden am Siegel auf und sammelst Siegelpunkte, solange dein Gegner noch im Riss ist: 2 für seinen ersten Raum, 3 ab dem zweiten${Z.heilung === "gerechnet" ? ". Dazu die Hälfte der fehlenden Trefferpunkte" : ""}.</small></div></div>`}
      <div class="knoepfe">${ende ? "" : `<button class="btn${muss ? "" : " ghost"}" id="riss-weiter">Weiter in Raum ${n + 1}</button>`}${muss ? "" : `<button class="btn" id="riss-siegel">Zum Siegel</button>`}</div>`);
    const w = $("#riss-weiter"), s = $("#riss-siegel");
    if (w) w.onclick = () => { if (!muss) merke("weiter"); raumVor(i + 1); };
    if (s) s.onclick = () => { merke(ende ? "siegel (Ende des Wegs)" : "siegel"); abbiegen(); };
  }

  /* ---------- am Siegel warten: aufstellen, Punkte zählen hoch, zuschauen ---------- */
  function abbiegen() {
    Z.ich.abgebogen = true; Z.wegEnde = Date.now();
    if (Z.ich.raeume < Z.bot.raeume) return warteStart();
    ankunft();
  }
  function warteStart() {
    const S = K.saal(), frei = S.felder.slice().sort((a, b) => Math.hypot(a.x - S.orte[0].x, a.y - S.orte[0].y) - Math.hypot(b.x - S.orte[0].x, b.y - S.orte[0].y));
    const platz = {}; Z.ich.gruppe.forEach((f, k) => { platz[f] = { x: frei[k].x, y: frei[k].y }; });
    Z.warte = { saal: S, platz, held: Z.ich.gruppe[0], raum: Z.ich.raeume, fertigeRaeume: 0, punkte: 0, sim: null, zuschauen: false, fertig: false, beginn: Date.now(), geschaut: 0, uebersprungen: false, timer: null };
    Z.warte.timer = setInterval(warteTakt, TAKT);
    warteZeichnen();
  }
  function warteStopp() { const W = Z.warte; if (!W) return; clearInterval(W.timer); W.timer = null; if (W.zuschauen) { W.zuschauen = false; window.AB.arenaEnde(); } zuschauLeiste(); }
  const wartePunkte = (n) => K.startPunkte(n);
  /** Ein Zug im Raum des Gegners (oder der nächste Raum, oder die Ankunft) */
  function warteTakt() {
    const W = Z.warte; if (!W || W.fertig) return;
    if (!W.zuschauen && !document.querySelector("[data-riss-warte]")) return warteStopp(); // Seite verlassen
    if (!W.sim) { W.sim = K.raumWieder(Z.bot.verlauf[W.raum].wieder); zeigeSim(); warteStand(); return; }
    if (!W.sim.ende) { K.raumSchritt(W.sim); zeigeSim(); if (!W.sim.ende) return; }
    W.sim = null; W.raum++; W.fertigeRaeume++; raumFertig();
  }
  function raumFertig() {
    const W = Z.warte, alt = W.punkte; W.punkte = wartePunkte(W.fertigeRaeume);
    if (W.raum >= Z.bot.raeume) { W.fertig = true; clearInterval(W.timer); W.timer = null; if (W.zuschauen) zuschauenAus(); }
    if (document.querySelector("[data-riss-warte]")) { warteZeichnen(); if (W.punkte > alt) { const z = $("#riss-zaehler"); if (z) { z.classList.remove("neu"); void z.offsetWidth; z.classList.add("neu"); } } }
    zuschauLeiste();
    if (W.punkte > alt && window.MYTHARA.toast) window.MYTHARA.toast(`Du hältst das Siegel: ${W.punkte} Siegelpunkte.`);
  }
  function zeigeSim() { const W = Z.warte; if (W && W.zuschauen && W.sim) { const j = R.speichern(W.sim); window.AB.arenaStand(JSON.parse(JSON.stringify(j))); } }
  function warteStand() { const el = $("#riss-warte-stand"), W = Z.warte; if (el && W) el.textContent = W.fertig ? `${Z.bot.name} ist am Siegel angekommen.` : `${Z.bot.name} kämpft in Raum ${W.raum + 1}.`; }
  function ueberspringen() {
    const W = Z.warte; if (!W || W.fertig) return; W.uebersprungen = true;
    W.fertigeRaeume += Z.bot.raeume - W.raum; W.raum = Z.bot.raeume; W.sim = null; raumFertig();
  }
  function zuschauenAn() {
    const W = Z.warte; if (!W || W.fertig || W.zuschauen) return; W.zuschauen = true; W.geschaut++;
    window.AB.arenaStart({ gast: true, server: true, seite: 1, ende: () => {} });
    if (W.sim) zeigeSim(); zuschauLeiste();
  }
  function zuschauenAus() { const W = Z.warte; if (!W || !W.zuschauen) return; W.zuschauen = false; window.AB.arenaEnde(); zumHub(); zuschauLeiste(); warteZeichnen(); }
  /** Beim Zuschauen: Leiste über dem fremden Kampf mit dem Weg zurück */
  function zuschauLeiste() {
    let el = document.getElementById("riss-zuschau"); const W = Z.warte;
    if (!W || !W.zuschauen) { if (el) el.hidden = true; return; }
    if (!el) { el = document.createElement("div"); el.id = "riss-zuschau"; el.className = "riss-zuschau"; document.body.appendChild(el); el.onclick = (ev) => { if (ev.target.closest("button")) zuschauenAus(); }; }
    el.hidden = false; el.innerHTML = `<span>Du schaust zu: <b>${esc(Z.bot.name)}</b>, Raum ${Math.min(W.raum + 1, Z.bot.raeume)} · deine Siegelpunkte <b>${W.punkte}</b></span><button type="button" class="btn klein">Zurück zum Siegel</button>`;
  }
  function warteZeichnen() {
    const W = Z.warte, S = W.saal, block = new Set(S.block), erlaubt = new Set(S.felder.map((p) => p.x + "," + p.y)), wer = {}; for (const f of Z.ich.gruppe) wer[W.platz[f].x + "," + W.platz[f].y] = f;
    let zellen = "";
    for (let y = 0; y < S.h; y++) for (let x = 0; x < S.b; x++) { const k = x + "," + y, f = wer[k], si = S.orte.findIndex((p) => p.x === x && p.y === y);
      zellen += `<button type="button" class="rs-feld${block.has(k) ? " zu" : ""}${erlaubt.has(k) ? " frei" : ""}${si === 0 ? " siegel" : si > 0 ? " spaeter" : ""}${f && f === W.held ? " gewaehlt" : ""}" data-x="${x}" data-y="${y}" ${erlaubt.has(k) ? "" : "disabled"} aria-label="Feld ${x + 1}, ${y + 1}">${f ? `<img src="${F.bild(f)}" alt="${esc(F.FIGUREN[f].name)}" style="--k:${F.KLASSEN[F.FIGUREN[f].klasse].farbe}">` : ""}</button>`; }
    seite(`<div data-riss-warte><p class="riss-schritt">Am Siegel</p><h1 class="hub-gruss">Du hältst das Siegel</h1>
      <div class="riss-warte-kopf"><div class="riss-zaehler" id="riss-zaehler"><small>Siegelpunkte</small><b>${W.punkte}</b><span>${W.fertig ? "Stand zu Beginn des Finales" : W.punkte >= 3 ? "mehr als 3 gibt es nicht" : W.punkte ? "+1, wenn der Gegner noch einen Raum spielt" : "+2, sobald der Gegner seinen nächsten Raum beendet"}</span></div>
        <div class="riss-warte-text"><p id="riss-warte-stand" class="riss-verdeckt"></p><p class="note">${W.fertig ? "Deine Aufstellung steht. Jetzt wird um das Siegel gekämpft." : "Dein Gegner ist tiefer gegangen und weiß nicht, dass du schon hier bist. Stell deine Helden auf, solange du wartest."}</p>
          <div class="knoepfe">${W.fertig ? `<button class="btn" id="riss-ankunft">Der Gegner ist da</button>` : `<button class="btn" id="riss-zuschauen">Dem Gegner zuschauen</button><button class="btn ghost klein" id="riss-ueberspringen">Nicht warten</button>`}</div></div></div>
      <h2 class="riss-h2">Aufstellung</h2><p class="note">Wähle einen Helden und tippe ein helles Feld an. Golden ist das Siegel, gestrichelt die Felder, auf die es später springt.</p>
      <div class="riss-wer-stellt">${Z.ich.gruppe.map((f) => `<button type="button" class="rs-held${f === W.held ? " an" : ""}" data-stell="${f}" style="--k:${F.KLASSEN[F.FIGUREN[f].klasse].farbe}"><img src="${F.bild(f)}" alt=""><b>${esc(F.FIGUREN[f].name)}</b></button>`).join("")}</div>
      <div class="riss-saal" id="riss-saal" style="--b:${S.b};--h:${S.h};${S.bild ? `background-image:url(${S.bild})` : ""}">${zellen}</div></div>`);
    warteStand();
    document.querySelector("[data-riss] .riss-wer-stellt").onclick = (ev) => { const b = ev.target.closest("[data-stell]"); if (!b) return; W.held = b.dataset.stell; warteZeichnen(); };
    $("#riss-saal").onclick = (ev) => { const b = ev.target.closest(".rs-feld.frei"); if (!b) return; const x = +b.dataset.x, y = +b.dataset.y, da = wer[x + "," + y];
      if (da && da !== W.held) { W.platz[da] = W.platz[W.held]; } W.platz[W.held] = { x, y }; warteZeichnen(); };
    const zu = $("#riss-zuschauen"), ue = $("#riss-ueberspringen"), an = $("#riss-ankunft");
    if (zu) zu.onclick = zuschauenAn; if (ue) ue.onclick = ueberspringen; if (an) an.onclick = ankunft;
  }

  /* ---------- Spielart „Karte“: vier Minuten, fünf Räume, Erfahrung je Monster, Beute, Truhen, ein Boss ---------- */
  const KZ = { rest: 0, laeuft: false, takt: null, letzter: 0, imKampf: false, zeitAb: false, ergebnis: null };
  const mmss = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  function uhrZeigen() {
    let el = document.getElementById("riss-uhr");
    if (Z.art !== "karte" || !Z.ich || !Z.ich.karte || KZ.fertig) { if (el) el.hidden = true; return; }
    if (!el) { el = document.createElement("div"); el.id = "riss-uhr"; el.className = "riss-uhr"; document.body.appendChild(el); }
    el.hidden = false; el.classList.toggle("knapp", KZ.rest <= 30000); el.classList.toggle("steht", !KZ.laeuft);
    const t = `<small>${KZ.laeuft ? "Der Riss schließt sich in" : "Die Zeit läuft ab der Karte"}</small><b>${mmss(KZ.rest)}</b>`; if (el.dataset.t !== t) { el.dataset.t = t; el.innerHTML = t; }
  }
  /* Die Uhr läuft ab dem Öffnen der Karte durch – für beide Seiten gleich, ohne Anhalten und ohne Abzüge. So kommen beide im selben Moment am Siegel an. */
  function uhrAn() { if (KZ.fertig || KZ.laeuft) return; KZ.laeuft = true; KZ.endeZeit = Date.now() + Z.zeit * 1000; KZ.rest = Z.zeit * 1000; if (!KZ.takt) KZ.takt = setInterval(uhrTakt, 250); uhrZeigen(); }
  function uhrEnde() { KZ.laeuft = false; KZ.fertig = true; clearInterval(KZ.takt); KZ.takt = null; clearInterval(KZ.wache); KZ.wache = null; rausKnopf(false); xpLeiste(null); fundFensterZu(); uhrZeigen(); }
  function uhrTakt() {
    if (!KZ.laeuft) return; KZ.rest = KZ.endeZeit - Date.now(); uhrZeigen();
    if (KZ.rest <= 0) zeitUm();
  }
  /** Den laufenden Kampf beenden (Zeit um, selbst gegangen oder fertig eingesammelt): Der Kampfbildschirm meldet sich dann wie nach einem Ende zurück.
   *  Sind alle Monster besiegt, gilt der Raum als gewonnen. */
  function kampfAbbrechen() {
    const st = window.AB.st; KZ.schluss = true; if (st && !st.ende) st.ende = KZ.frei ? "sieg" : "rueckzug";
    let n = 0; const t = setInterval(() => { const b = document.getElementById("weiter-abenteuer");
      if (!KZ.imKampf || n++ > 40) return clearInterval(t);
      if (b && !document.getElementById("ende").hidden) { clearInterval(t); b.click(); } else window.AB.render(); }, 150);
  }
  /** Die Zeit ist um: Der Riss holt die Gruppe heraus – auch mitten aus einem Kampf */
  function zeitUm() {
    KZ.rest = 0; KZ.laeuft = false; uhrZeigen();
    if (!KZ.imKampf) return teleport();
    KZ.zeitAb = true; fundFensterZu(); kampfAbbrechen();
  }
  /** Knopf im Kampf: den Raum verlassen und zurück zur Karte. Solange Monster stehen, bleibt nur die Erfahrung und was aufgehoben ist;
   *  sind alle besiegt, heißt er „Zur Karte“ und schließt den gewonnenen Raum ab (was noch liegt, bleibt liegen). */
  function rausKnopf(an) {
    let b = document.getElementById("riss-raus");
    if (!an) { if (b) b.hidden = true; return; }
    if (!b) { b = document.createElement("button"); b.id = "riss-raus"; b.type = "button"; b.className = "riss-raus"; document.body.appendChild(b);
      b.onclick = () => { if (!KZ.imKampf || KZ.zeitAb || KZ.schluss) return;
        if (!KZ.frei && b.dataset.sicher !== "1") { b.dataset.sicher = "1"; b.textContent = "Wirklich gehen?"; setTimeout(() => { if (b.dataset.sicher === "1") { b.dataset.sicher = ""; rausText(); } }, 2500); return; }
        if (!KZ.frei) KZ.verlassen = true; rausKnopf(false); kampfAbbrechen(); }; }
    b.dataset.sicher = ""; b.hidden = false; rausText();
  }
  function rausText() { const b = document.getElementById("riss-raus"); if (!b || b.dataset.sicher === "1") return; const offen = KZ.drops ? KZ.drops.liste.filter((d) => !d.weg).length : 0;
    const t = KZ.frei ? (offen ? `Zur Karte (${offen} liegt noch)` : "Zur Karte") : "Raum verlassen"; if (b.textContent !== t) b.textContent = t; b.classList.toggle("frei", Boolean(KZ.frei)); }
  /** Der Raum bleibt nach dem letzten Monster offen, solange noch etwas liegt: Dafür hängt sich eine dünne Schicht hinter die Regeln (nur für diesen Kampf) */
  function raumEinhaengen() {
    const o = KZ.orig = { bewegen: R.bewegen, handeln: R.handeln, zugEnde: R.zugEnde, gegnerZug: R.gegnerZug, autoZug: R.autoZug };
    const huelle = (k) => function (s, ...a) { const r = o[k].call(this, s, ...a); if (KZ.imKampf && s === window.AB.st) raumOffenHalten(s); return r; };
    for (const k of Object.keys(o)) R[k] = huelle(k);
  }
  function raumAushaengen() { if (KZ.orig) for (const k of Object.keys(KZ.orig)) R[k] = KZ.orig[k]; KZ.orig = null; }
  function raumOffenHalten(st) {
    if (KZ.schluss || st.ende !== "sieg") return;
    fundeErfassen(st); KZ.frei = true;
    if (KZ.drops.liste.some((d) => !d.weg)) { st.ende = null; if (!KZ.gemeldet) { KZ.gemeldet = true; st.log.push({ t: "Der Raum ist frei. Sammelt ein, was noch liegt – oder geht zur Karte.", art: "gut" }); } }
  }
  /** Besiegte Monster lassen etwas liegen: Erbsplitter oder selten einen Fund für einen Helden */
  function fundeErfassen(st) {
    const D = KZ.drops;
    for (const f of st.figuren) { if (f.seite !== "gegner" || !R.GEGNER[f.art] || f.tp > 0 || D.gesehen[f.id]) continue; D.gesehen[f.id] = true;
      const d = K.kDrop(Z.ich, f.art === D.boss, Math.random); D.liste.push(Object.assign({ x: f.x, y: f.y, weg: false }, d)); }
  }
  const heldDaneben = (st, d) => st.figuren.find((x) => x.seite === "spieler" && x.fid && x.tp > 0 && !x.tot && Math.max(Math.abs(x.x - d.x), Math.abs(x.y - d.y)) <= 1);
  /** Im Kampf, vier Mal je Sekunde: Funde erfassen und markieren, Erfahrung mitzählen, Knopf und Ende nachführen */
  function kampfWache() {
    const st = window.AB.st, D = KZ.drops; if (!KZ.imKampf || !st || !D) return;
    if (st.ende === "sieg" && !KZ.schluss) { raumOffenHalten(st); if (!st.ende) window.AB.render(); } // falls das Ende an der Schicht vorbei kam
    fundeErfassen(st); xpLeiste(st); rausText();
    if (KZ.frei && !KZ.schluss && !D.liste.some((d) => !d.weg) && !KZ.fenster) { st.ende = "sieg"; KZ.schluss = true; window.AB.render(); } // alles eingesammelt: Der Raum ist fertig
    const karte = $("#karte"); if (!karte) return; const wo = {};
    for (const d of D.liste) if (!d.weg) wo[d.x + "," + d.y] = (d.ding ? "riss-drop-segen" : wo[d.x + "," + d.y] || "riss-drop") + (heldDaneben(st, d) ? " greifbar" : "");
    karte.querySelectorAll("rect.feld").forEach((r) => { const kl = (wo[r.dataset.x + "," + r.dataset.y] || "").split(" "); for (const c of ["riss-drop", "riss-drop-segen", "greifbar"]) if (r.classList.contains(c) !== kl.includes(c)) r.classList.toggle(c, kl.includes(c)); });
  }
  /** Antippen der Karte: Liegt dort etwas und steht ein Held daneben, wird aufgehoben (statt zu laufen) */
  function karteKlick(ev) {
    const st = window.AB.st, D = KZ.drops; if (!KZ.imKampf || !st || !D || KZ.schluss) return;
    const r = document.elementsFromPoint(ev.clientX, ev.clientY).find((e) => e.matches && e.matches("#karte rect.feld")); if (!r) return;
    if (feldAufheben(+r.dataset.x, +r.dataset.y)) { ev.stopPropagation(); ev.preventDefault(); }
  }
  /** Zurück: true, wenn auf dem Feld etwas lag (aufgehoben oder Hinweis gezeigt) */
  function feldAufheben(x, y) {
    const st = window.AB.st, D = KZ.drops, hier = D.liste.filter((d) => !d.weg && d.x === x && d.y === y); if (!hier.length) return false;
    const h = heldDaneben(st, hier[0]); if (!h) { if (window.MYTHARA.toast) window.MYTHARA.toast("Zu weit weg: Ein Held muss daneben stehen."); return false; } // nicht daneben: der Klick läuft weiter (hinlaufen)
    for (const d of hier) { if (d.ding) { fundFenster(d); break; } aufheben(d, null); }
    kampfWache(); return true;
  }
  function aufheben(d, held) {
    d.weg = true; K.kNimm(Z.ich, d, held); const st = window.AB.st;
    if (d.ding) { KZ.drops.funde.push({ ding: d.ding, held }); const f = st && st.figuren.find((x) => x.fid === held); if (f) { f.rucksack = f.rucksack || []; if (!f.rucksack.some((x) => x.id === d.ding)) f.rucksack.push({ id: d.ding, n: 1 }); } }
    else KZ.drops.splitter += d.splitter || 0;
    if (window.MYTHARA.toast) window.MYTHARA.toast(d.ding ? `${F.FIGUREN[held].name} bekommt: ${R.GEGENSTAENDE[d.ding].name}` : `+${d.splitter} Erbsplitter`);
  }
  /** Ein Fund für einen Helden: Wer bekommt ihn? (Die Zeit läuft weiter.) */
  function fundFenster(d) {
    fundFensterZu(); const g = R.GEGENSTAENDE[d.ding], el = document.createElement("div"); el.id = "riss-fund"; el.className = "riss-fund"; KZ.fenster = el;
    el.innerHTML = `<div class="riss-fund-blatt" role="dialog" aria-label="Fund"><p class="riss-schritt">Fund</p><h2>${esc(g.name)}</h2><p>${esc(g.text)}</p><b>Für wen?</b>
      <div class="riss-fund-helden">${Z.ich.gruppe.map((f) => `<button type="button" class="rs-held" data-wer="${f}" ${K.kannTragen(Z.ich, d.ding, f) ? "" : "disabled"} style="--k:${F.KLASSEN[F.FIGUREN[f].klasse].farbe}"><img src="${F.bild(f)}" alt=""><b>${esc(F.FIGUREN[f].name)}</b></button>`).join("")}</div>
      <button type="button" class="btn ghost klein" data-zu>Liegen lassen</button></div>`;
    el.onclick = (ev) => { const b = ev.target.closest("[data-wer]"); if (b && !b.disabled) { fundFensterZu(); aufheben(d, b.dataset.wer); return; } if (ev.target.closest("[data-zu]") || ev.target === el) fundFensterZu(); };
    document.body.appendChild(el);
  }
  function fundFensterZu() { if (KZ.fenster) { KZ.fenster.remove(); KZ.fenster = null; } }
  /** Blauer Balken im Kampf: die Erfahrung der Gruppe, sie wächst mit jedem Lebenspunkt, den ein Monster verliert */
  function xpLeiste(st) {
    let el = document.getElementById("riss-xpleiste");
    if (!st) { if (el) el.hidden = true; return; }
    if (!el) { el = document.createElement("div"); el.id = "riss-xpleiste"; el.className = "riss-xpleiste"; document.body.appendChild(el); }
    const xp = Z.ich.xp + K.kXp(st), s = K.kStufe(xp), alt = K.kStufe(Z.ich.xp).stufe;
    const html = `<b>Stufe ${alt}${s.stufe > alt ? ` → ${s.stufe}` : ""}</b><i><u style="width:${s.voll ? 100 : Math.round(100 * s.in / s.bis)}%"></u></i><small>${s.voll ? "höchste Stufe" : `${s.in} / ${s.bis} EP`}</small><span>◈ ${Z.ich.splitter}</span>`;
    el.hidden = false; if (el.dataset.h !== html) { el.dataset.h = html; el.innerHTML = html; }
  }
  function losK() {
    Z.seed = zufall(); Z.beginn = Date.now(); Z.sicht = 0; Z.warte = null; Z.folge = null;
    Z.karte = K.karteLosen(Math.random); Z.ich = K.neuK(Z.wahl, "Du", Z.karte);
    const gegner = F.REIHE.slice().map((f) => [Math.random(), f]).sort((a, b) => a[0] - b[0]).slice(0, 3).map((x) => x[1]);
    Z.bot = K.botKarte(gegner, Z.seed % 100000 + 17, NAMEN[Z.seed % NAMEN.length], Z.karte, Z.zeit);
    clearInterval(KZ.takt); Object.assign(KZ, { rest: Z.zeit * 1000, laeuft: false, takt: null, imKampf: false, zeitAb: false, verlassen: false, ergebnis: null, fertig: false, drops: null });
    Z.log = { v: 5, art: "karte", wann: new Date().toISOString(), heilung: "keine", zeit: Z.zeit, karte: Z.karte.slice(), ich: { helden: Z.wahl.slice(), raeume: [], kaeufe: [] }, gegner: { helden: gegner } };
    const r = K.kDef(Z.ich, "M");
    seite(`<p class="riss-schritt">Die Mitte des Risses</p><h1 class="hub-gruss">${esc(r.name)}</h1><p class="hub-untertitel">${esc(r.text)}</p>
      <p class="riss-lohn">Sobald dieser Raum geschafft ist, öffnet sich die Karte – und die Zeit läuft: ${mmss(Z.zeit * 1000)} Minuten, dann holt der Riss beide Gruppen im selben Moment in den Siegelsaal.</p>
      ${gruppeHtml("Deine Gruppe", Z.ich.gruppe, Z.ich.stufen, K.leben(Z.ich), Z.ich.dinge, Z.ich.segen)}
      <div class="knoepfe"><button class="btn" id="riss-kampf">In den Riss</button></div>`);
    $("#riss-kampf").onclick = () => kampfK("M");
  }
  function kampfK(ort) {
    const t0 = Date.now(), def = K.kDef(Z.ich, ort); Object.assign(KZ, { imKampf: true, zeitAb: false, verlassen: false, frei: false, schluss: false, gemeldet: false });
    KZ.drops = { boss: def.boss || null, gesehen: {}, liste: [], splitter: 0, funde: [] };
    raumEinhaengen();
    window.AB.kampfStarten(K.kOpts(Z.ich, ort), (st) => { KZ.imKampf = false; clearInterval(KZ.wache); KZ.wache = null; raumAushaengen(); fundFensterZu(); rausKnopf(false); xpLeiste(null);
      const k = $("#karte"); if (k) k.removeEventListener("click", karteKlick, true); zumHub(); nachK(ort, st, Date.now() - t0); });
    if (window.AB.st) { K.raumDinge(Z.ich, window.AB.st); window.AB.render(); }
    const karte = $("#karte"); if (karte) karte.addEventListener("click", karteKlick, true); // vor dem Spiel: Aufheben statt Laufen
    clearInterval(KZ.wache); KZ.wache = setInterval(kampfWache, 250); kampfWache();
    rausKnopf(true);
  }
  function nachK(ort, st, dauer) {
    const D = KZ.drops, sieg = st.ende === "sieg", liegen = D.liste.filter((d) => !d.weg).length;
    const e = K.kEnde(Z.ich, ort, st, Math.random, KZ.zeitAb || KZ.verlassen, KZ.verlassen); e.splitter = D.splitter; e.funde = D.funde.slice(); e.liegen = liegen; e.verlassen = KZ.verlassen && !sieg; KZ.ergebnis = e;
    Z.log.ich.raeume.push({ ort, id: e.id, sieg: e.sieg, abgebrochen: e.abgebrochen, verlassen: e.verlassen, runden: e.runden, xp: e.xp, besiegt: e.besiegt, gegner: e.gegner, gefallen: e.gefallen.length, splitter: e.splitter, funde: e.funde, liegenGelassen: liegen, sekunden: Math.round(dauer / 1000), restSek: Math.max(0, Math.round(KZ.rest / 1000)) });
    if (KZ.fertig) return; if (KZ.zeitAb || (KZ.laeuft && KZ.rest <= 0) || Z.ich.besucht.length >= 5) return teleport(); karteZeigen(); uhrAn();
  }
  /** Vor dem Finale: die Siegelwächterin verkauft für Erbsplitter, was im Endkampf hilft (ohne Zeitdruck) */
  function laden() {
    const W = Z.ich, angebot = K.ladenAngebot(W, Math.random); let wahl = null, hinweis = "";
    const zeichne = () => {
      const karte = (a, k) => { const d = a.typ === "ding" ? R.GEGENSTAENDE[a.id] : a.typ === "segen" ? F.SEGEN[a.id] : null, voll = a.typ === "heilung" && K.lebenSchnitt(W) >= 1, hat = a.typ === "segen" && W.segen.includes(a.id);
        const name = a.typ === "heilung" ? "Heilung der Wächterin" : a.typ === "trank" ? "Heiltrank" : (a.typ === "segen" ? "Segen: " : "") + d.name, text = a.typ === "heilung" ? "Alle Helden gehen mit vollen Trefferpunkten ins Finale." : a.typ === "trank" ? "Ein zusätzlicher Heiltrank für einen Helden." : d.text + (a.typ === "segen" ? " Gilt für die ganze Gruppe." : "");
        return `<button type="button" class="riss-ding${a.typ === "segen" ? " segen" : ""}${wahl === a ? " an" : ""}" data-k="${k}" ${W.splitter < a.preis || voll || hat ? "disabled" : ""}><i>${a.typ === "heilung" ? "✚" : a.typ === "trank" ? "⚱" : a.typ === "segen" ? d.zeichen : d.sym || "◆"}</i><b>${esc(name)}</b><small>${esc(text)}</small><em>${hat ? "gekauft" : voll ? "alle sind gesund" : "◈ " + a.preis}</em></button>`; };
      const brauchtHeld = wahl && (wahl.typ === "trank" || wahl.typ === "ding");
      seite(`<div data-riss-laden><p class="riss-schritt">Vor dem Siegelsaal</p><h1 class="hub-gruss">Die Siegelwächterin</h1>
        <p class="hub-untertitel">„Erbsplitter gegen das, was ihr dort drin braucht. Wählt klug – am Siegel nützen sie euch nichts mehr.“</p>
        <p class="riss-splitter gross">◈ <b>${W.splitter}</b> Erbsplitter</p>${hinweis ? `<p class="riss-ergebnis gut">${esc(hinweis)}</p>` : ""}
        <div class="riss-beute">${angebot.map(karte).join("")}</div>
        ${brauchtHeld ? `<h2 class="riss-h2">Für wen?</h2><div class="arena-helden riss-wer">${W.gruppe.map((f) => (wahl.typ === "trank" || K.kannTragen(W, wahl.id, f) ? heldKarte(f, wahl.typ === "trank" ? `Tränke +${W.traenke[f] || 0}` : "Stufe " + W.stufen[f], "", `data-wer="${f}"`) : heldKarte(f, "kann das nicht tragen", "fest leer", "disabled"))).join("")}</div>` : ""}
        ${gruppeHtml("Deine Gruppe", W.gruppe, W.stufen, K.leben(W), W.dinge, W.segen)}
        <div class="knoepfe"><button class="btn" id="riss-laden-fertig">Zum Siegel</button></div></div>`);
      const kauf = (a, held) => { if (K.ladenKauf(W, a, held)) { hinweis = a.typ === "heilung" ? "Alle Helden sind geheilt." : a.typ === "trank" ? `${F.FIGUREN[held].name} bekommt einen Heiltrank.` : a.typ === "segen" ? `Segen ${F.SEGEN[a.id].name} liegt auf der Gruppe.` : `${F.FIGUREN[held].name} bekommt ${R.GEGENSTAENDE[a.id].name}.`; if (a.typ === "ding") angebot.splice(angebot.indexOf(a), 1); } wahl = null; zeichne(); };
      document.querySelector("[data-riss] .riss-beute").onclick = (ev) => { const b = ev.target.closest("[data-k]"); if (!b || b.disabled) return; const a = angebot[+b.dataset.k]; if (a.typ === "heilung" || a.typ === "segen") return kauf(a); wahl = a; hinweis = ""; zeichne(); };
      const wer = document.querySelector("[data-riss] .riss-wer"); if (wer) wer.onclick = (ev) => { const b = ev.target.closest("[data-wer]"); if (b && wahl) kauf(wahl, b.dataset.wer); };
      $("#riss-laden-fertig").onclick = () => { Z.log.ich.kaeufe = W.kaeufe.slice(); Z.log.ich.splitterRest = W.splitter; finale(); };
    };
    zeichne();
  }
  const ORT = [{ x: 49.9, y: 12.4, n: "Norden" }, { x: 85.7, y: 48.4, n: "Osten" }, { x: 49.6, y: 84.3, n: "Süden" }, { x: 13.3, y: 48.4, n: "Westen" }]; // Mittelpunkte der Räume auf dem Kartenbild (img/mythara/riss-karte.webp), in Prozent
  function karteZeigen() {
    const W = Z.ich, C = K.KARTE, e = KZ.ergebnis, S = K.kStufe(W.xp), stufe = S.stufe;
    const raum = (k) => { const da = W.besucht.includes(k), d = da ? K.kDef(W, k) : null, v = da ? W.verlauf.find((x) => x.ort === k) : null;
      return `<button type="button" class="rk-raum ${da ? "hell" + (v && !v.sieg ? " verloren" : "") : "dunkel"}${W.ort === k ? " hier" : ""}" style="left:${ORT[k].x}%;top:${ORT[k].y}%" ${da ? "disabled" : `data-ort="${k}"`}>
        <i>${da ? (d.boss ? "☠" : d.id === "schwer" ? "⚔" : "◆") : "?"}</i><b>${da ? esc(d.kurz) : ORT[k].n}</b><small>${da ? (v && v.sieg ? "geschafft" : v && v.abgebrochen ? "verlassen" : "verloren") : "unerkundet"}</small></button>`; };
    const letztes = e ? `<p class="riss-ergebnis ${e.sieg ? "gut" : "schlecht"}">${esc(K.kDef(W, e.ort).name)}: ${e.sieg ? "geschafft" : e.verlassen ? "verlassen" : "die Gruppe ist gefallen und steht voll geheilt wieder auf"} · ${e.besiegt} von ${e.gegner} Monstern besiegt · +${e.xp} Erfahrung${e.splitter ? ` · +${e.splitter} Erbsplitter` : ""}${(e.funde || []).map((x) => ` · ${esc(R.GEGENSTAENDE[x.ding].name)} für ${esc(F.FIGUREN[x.held].name)}`).join("")}${e.liegen ? ` · ${e.liegen} Fund${e.liegen === 1 ? "" : "e"} liegen gelassen` : ""}${e.stufe > e.stufeVor ? ` · <b>Stufe ${e.stufe}</b>` : ""}${e.gefallen.length ? ` · gefallen: ${e.gefallen.map((f) => esc(F.FIGUREN[f].name)).join(", ")}` : ""}</p>` : "";
    seite(`<div data-riss-karte><p class="riss-schritt">Die Karte des Risses</p><h1 class="hub-gruss">Wohin jetzt?</h1>${letztes}
      <div class="riss-karte-zwei"><div class="riss-karte" id="riss-karte">
          <span class="rk-raum hell mitte${W.ort === "M" ? " hier" : ""}" style="left:49.5%;top:48.4%"><b>Mitte</b><small>geschafft</small></span>${[0, 1, 2, 3].map(raum).join("")}</div>
        <div><p class="riss-splitter">◈ <b>${W.splitter}</b> Erbsplitter</p><div class="riss-xp"><b>Stufe ${stufe}</b><i><u style="width:${S.voll ? 100 : Math.round(100 * S.in / S.bis)}%"></u></i><small>${S.voll ? "höchste Stufe" : `${S.in} von ${S.bis} Erfahrung bis Stufe ${stufe + 1}`}</small></div>
          ${gruppeHtml("Deine Gruppe", W.gruppe, W.stufen, K.leben(W), W.dinge, W.segen)}
          <p class="riss-verdeckt">Du hörst ${esc(Z.bot.name)} irgendwo im Riss werkeln.</p>
          <p class="note">Dunkle Räume sind unerkundet: ein schwerer Raum, ein Boss und zwei leichte Räume. Erfahrung gibt es für jeden Lebenspunkt, den ein Monster verliert (${C.XP_LP} je Punkt). Jedes besiegte Monster lässt Erbsplitter liegen – oder selten einen Fund für einen Helden (${Math.round(C.DROP * 100)} %, der Boss ${Math.round(C.DROP_BOSS * 100)} %). Aufheben: einen Helden daneben stellen und das Feld antippen. Der Raum bleibt offen, bis du zur Karte gehst.</p></div></div></div>`);
    $("#riss-karte").onclick = (ev) => { const b = ev.target.closest("[data-ort]"); if (!b || KZ.imKampf) return; const k = +b.dataset.ort;
      if (KZ.rest <= 0) return zeitUm(); kampfK(k); };
  }
  /** Die Zeit ist um (oder alles erkundet): Der Riss holt beide Gruppen in den Siegelsaal */
  function teleport() {
    const voll = Z.ich.besucht.length >= 5 && KZ.rest > 0; Z.log.restSek = Math.max(0, Math.round(KZ.rest / 1000));
    uhrEnde(); Z.ich.abgebogen = true; Z.wegEnde = Date.now(); const B = Z.bot;
    seite(`<p class="riss-schritt">${voll ? "Alles erkundet" : "Die Zeit ist um"}</p><h1 class="hub-gruss">Der Riss holt euch in den Siegelsaal</h1>
      <p class="riss-ergebnis gut">Beide Gruppen kommen gleichzeitig an, jede an ihrem Eingang. Niemand beginnt mit Siegelpunkten. Vorher wartet noch die Siegelwächterin: Bei ihr tauschst du deine <b>${Z.ich.splitter} Erbsplitter</b> gegen Heilung, Tränke, Gegenstände und Segen.</p>
      <div class="riss-zwei">${gruppeHtml(`Deine Gruppe – ${Z.ich.besucht.length} Räume`, Z.ich.gruppe, Z.ich.stufen, K.leben(Z.ich), Z.ich.dinge, Z.ich.segen)}${gruppeHtml(`${B.name} – ${B.besucht.length} Räume`, B.gruppe, B.stufen, K.leben(B), B.dinge, B.segen)}</div>
      <div class="riss-regeln"><ul><li>Am Siegel steht, wer auf dem leuchtenden Feld oder direkt daneben steht, auch schräg.</li><li>Am Ende jeder Runde: ein Siegelpunkt für die Seite mit mehr Helden am Siegel.</li>
        <li>Nach jeder zweiten Runde springt das Siegel auf das gestrichelte Feld.</li><li>Holt die Seite, die zurückliegt, zwei Runden in Folge den Punkt, verliert die führende einen.</li>
        <li>Gefallene kehren nach zwei Runden am eigenen Eingang zurück, mit vollen Trefferpunkten. Liegt eine ganze Gruppe am Boden, bekommt der Gegner einen Punkt.</li><li>Fünf Siegelpunkte gewinnen. Sonst wird nach zwölf Runden gewertet.</li></ul>
        <p class="note">Zauberplätze, Tränke und Fähigkeiten sind für das Finale wieder frisch.</p></div>
      <div class="knoepfe"><button class="btn" id="riss-waechterin">Zur Siegelwächterin</button></div>`);
    $("#riss-waechterin").onclick = laden;
  }

  /* ---------- Ankunft und Finale ---------- */
  function ankunft() {
    const a = Z.ich.raeume, b = Z.bot.raeume, vor = Math.abs(a - b), frueh = a < b ? 1 : b < a ? 2 : 0, p = K.startPunkte(vor), heil = Z.heilung === "gerechnet";
    const lage = !frueh ? `Ihr kommt gleichzeitig an: beide nach ${a} Räumen. Niemand beginnt mit Siegelpunkten.${heil ? " Beide bekommen die Hälfte der fehlenden Trefferpunkte zurück." : ""}`
      : frueh === 1 ? `Du warst zuerst da: ${a} Räume gegen ${b}. Deine Gruppe steht am Siegel und beginnt mit <b>${p} Siegelpunkten</b>.${heil ? " Deine Helden bekommen die Hälfte der fehlenden Trefferpunkte zurück." : ""}`
        : `${esc(Z.bot.name)} war zuerst da: ${b} Räume gegen deine ${a}. Die Gruppe steht am Siegel und beginnt mit <b>${p} Siegelpunkten</b>.${heil ? " Deine Helden werden vor dem Finale nicht geheilt." : ""}`;
    seite(`<p class="riss-schritt">Ankunft</p><h1 class="hub-gruss">Der Siegelsaal</h1><p class="riss-ergebnis ${frueh === 2 ? "schlecht" : "gut"}">${lage}</p>
      <div class="riss-zwei">${gruppeHtml("Deine Gruppe", Z.ich.gruppe, Z.ich.stufen, K.leben(Z.ich), Z.ich.dinge, Z.ich.segen)}${gruppeHtml(`${Z.bot.name} – ${b} Räume`, Z.bot.gruppe, Z.bot.stufen, K.leben(Z.bot), Z.bot.dinge, Z.bot.segen)}</div>
      <div class="riss-regeln"><ul><li>Am Siegel steht, wer auf dem leuchtenden Feld oder direkt daneben steht, auch schräg.</li><li>Am Ende jeder Runde: ein Siegelpunkt für die Seite mit mehr Helden am Siegel.</li>
        <li>Nach jeder zweiten Runde springt das Siegel auf das gestrichelte Feld.</li><li>Holt die Seite, die zurückliegt, zwei Runden in Folge den Punkt, verliert die führende einen.</li>
        <li>Gefallene kehren nach zwei Runden am eigenen Eingang zurück, mit vollen Trefferpunkten. Liegt eine ganze Gruppe am Boden, bekommt der Gegner einen Punkt.</li><li>Fünf Siegelpunkte gewinnen. Sonst wird nach zwölf Runden gewertet.</li></ul><p class="note">Zauberplätze, Tränke und Fähigkeiten sind für das Finale wieder frisch. ${esc(heilText(Z.heilung))}</p></div>
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
      const vorher = s.log.length;
      K.vor(s); const r = o[k].call(this, s, ...a); K.nach(s, o.zugEnde);
      // Der Rechner wartet, bis Würfel, Ergebnis und Wirkung des letzten Schritts zu sehen waren (wie in der Arena: nichts wird abgeschnitten)
      const wurf = s.log.slice(vorher).some((l) => l.wurf), gross = wurf && window.AB_WURFZEIT ? window.AB_WURFZEIT(s.log.slice(vorher)) : 0;
      Z.botBis = Math.max(Z.botBis, Date.now() + (SCHNELL ? 0 : wurf ? gross + 1500 : k === "bewegen" ? 800 : 1000));
      leiste(); return r;
    };
    for (const k of Object.keys(o)) R[k] = huelle(k);
  }
  function aushaengen() { if (Z.orig) for (const k of Object.keys(Z.orig)) R[k] = Z.orig[k]; Z.orig = null; }
  function finale() {
    warteStopp();
    const st = Z.st = K.finaleNeu(Z.seed, Z.ich, Z.bot, { heilung: Z.art === "karte" ? "keine" : Z.heilung, namen: ["Du", Z.bot.name], aufstellung: Z.warte ? Z.warte.platz : null, gleich: Z.art === "karte" });
    Z.finalBeginn = Date.now(); Z.botBis = Date.now() + 1500;
    einhaengen();
    window.AB.arenaStart({ st, seite: 1, ohnePruef: true, ende: (s) => setTimeout(() => finaleEnde(s), 2600) });
    Z.takt = setInterval(botTakt, 250);
    let offen = false; const karte = $("#karte");
    if (karte) { Z.beob = new MutationObserver(() => { if (offen) return; offen = true; requestAnimationFrame(() => { offen = false; marken(); }); }); Z.beob.observe(karte, { childList: true, subtree: true }); }
    marken(); leiste();
  }
  /** Der Rechner zieht: ein Schritt, dann eine Pause (gesetzt in einhaengen: lang genug für Würfel und Wirkung) */
  function botTakt() {
    const st = Z.st; if (!st || st.ende || !st.riss || st.riss.aus) return;
    const a = R.aktiv(st); if (!a || R.teamVon(st, a) !== 2) return;
    if (Date.now() < Z.botBis) return;
    let w; try { w = K.finaleBot(st); } catch (e) { w = { typ: "ende" }; }
    Z.botRuft = true;
    try { if (window.AB.arenaWunsch(w) && w.typ !== "ende") window.AB.arenaWunsch({ typ: "ende" }); } finally { Z.botRuft = false; }
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
    const html = `<span class="rl-punkte">Siegel <b>${X.P[1]}</b> : <b>${X.P[2]}</b> <small>bis ${X.ziel}</small></span><span class="rl-am ${a > b ? "gut" : b > a ? "schlecht" : ""}">Am Siegel: du <b>${a}</b> · Gegner <b>${b}</b></span><span>Runde ${Math.min(X.runde, X.max)}/${X.max} · ${springt}</span>`;
    el.hidden = false; if (el.dataset.html !== html) { el.dataset.html = html; el.innerHTML = html; }
  }
  function finaleAufraeumen() {
    clearInterval(Z.takt); Z.takt = null; if (Z.beob) { Z.beob.disconnect(); Z.beob = null; }
    window.AB.arenaEnde(); aushaengen(); Z.st = null; marken();
    const el = document.getElementById("riss-leiste"); if (el) el.hidden = true;
  }
  function finaleEnde(st) {
    const X = st.riss, aus = X.aus || { sieger: st.arena.sieger, grund: "abbruch", runden: st.runde, punkte: X.P }, sieg = aus.sieger === 1, jetzt = Date.now(), W = Z.warte;
    const kopie = JSON.parse(JSON.stringify({ aus, M: X.M, start: X.start, frueh: X.frueh, vor: X.vor }));
    finaleAufraeumen(); zumHub();
    Object.assign(Z.log.gegner, { raeume: Z.bot.raeume, xp: Z.bot.xp, splitter: Z.bot.splitter, kaeufe: Z.bot.kaeufe, verlauf: Z.bot.verlauf.map((v) => ({ raum: v.raum, art: v.art, id: v.id, xp: v.xp, abgebrochen: v.abgebrochen, splitter: v.splitter, funde: v.funde, sieg: v.sieg, runden: v.runden, gefallen: v.gefallen.length, beute: v.beute || null })) });
    Object.assign(Z.log, { raeume: [Z.ich.raeume, Z.bot.raeume], stufen: [K.stufeSchnitt(Z.ich), K.stufeSchnitt(Z.bot)].map((x) => Math.round(x * 100) / 100), frueh: kopie.frueh, startPunkte: [kopie.start[1], kopie.start[2]], sieger: aus.sieger, sieg, grund: aus.grund, punkte: [aus.punkte[1], aus.punkte[2]],
      finalRunden: aus.runden, wegRunden: [Z.ich.runden, Z.bot.runden], auslöschungen: kopie.M.aus, rueckkehrer: kopie.M.rueck, zurueckerobert: kopie.M.zurueck, siegelwechsel: kopie.M.wechsel, runden: kopie.M.runden,
      warten: W ? { sekunden: Math.round((Z.finalBeginn - W.beginn) / 1000), zugeschaut: W.geschaut, uebersprungen: W.uebersprungen, aufstellung: W.platz } : null,
      minuten: { weg: Math.round((Z.wegEnde - Z.beginn) / 6000) / 10, finale: Math.round((jetzt - Z.finalBeginn) / 6000) / 10, gesamt: Math.round((jetzt - Z.beginn) / 6000) / 10 } });
    Z.log.fertig = true; const alle = mitschrift(); alle.push(Z.log); try { localStorage.setItem(SPEICHER, JSON.stringify(alle.slice(-60))); } catch (e) { /* privat */ }
    const L = Z.log, grund = aus.grund === "siegel" ? `${sieg ? "Du hast" : esc(Z.bot.name) + " hat"} fünf Siegelpunkte.` : "Zwölf Runden sind um. Es zählen die Siegelpunkte.";
    seite(`<p class="riss-schritt">Ende der Partie</p><h1 class="hub-gruss">${sieg ? "Der Riss gehört dir" : "Der Riss schließt sich"}</h1>
      <p class="riss-ergebnis ${sieg ? "gut" : "schlecht"}">${sieg ? "Sieg" : "Niederlage"}: Siegelpunkte <b>${L.punkte[0]} : ${L.punkte[1]}</b>. ${grund}</p>
      <table class="riss-tabelle"><tr><th></th><th>Du</th><th>${esc(Z.bot.name)}</th></tr>
        <tr><td>Räume</td><td>${L.raeume[0]}</td><td>${L.raeume[1]}</td></tr><tr><td>Stufe im Schnitt</td><td>${String(L.stufen[0]).replace(".", ",")}</td><td>${String(L.stufen[1]).replace(".", ",")}</td></tr>
        <tr><td>Siegelpunkte zu Beginn</td><td>${L.startPunkte[0]}</td><td>${L.startPunkte[1]}</td></tr><tr><td>Siegelpunkte am Ende</td><td>${L.punkte[0]}</td><td>${L.punkte[1]}</td></tr></table>
      ${Z.folge ? `<p class="note">Der Weg dieser Partie: ${[...Z.folge].map((x, k) => `${k + 1} ${ART[x]}`).join(" · ")}</p>` : ""}
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
  /** Läuft gerade eine Partie? (Dann lädt das Spiel sich nicht von selbst neu, siehe js/mythara.js) */
  const laeuft = () => Boolean(Z.log && !Z.log.fertig && (Z.ich || Z.st));
  /** Wird die Seite mitten in einer Partie verlassen oder neu geladen, bleibt wenigstens ein Eintrag in der Mitschrift */
  window.addEventListener("pagehide", () => { if (!laeuft()) return; try { const L = Object.assign({}, Z.log, { abgebrochen: "Seite verlassen oder neu geladen", phase: Z.st ? "finale" : "weg", minuten: { gesamt: Math.round((Date.now() - Z.beginn) / 6000) / 10 } });
    if (Z.st && Z.st.riss) { L.punkte = [Z.st.riss.P[1], Z.st.riss.P[2]]; L.finalRunden = Z.st.riss.runde; L.runden = Z.st.riss.M.runden; }
    const alle = mitschrift(); alle.push(L); localStorage.setItem(SPEICHER, JSON.stringify(alle.slice(-60))); } catch (e) { /* privat */ } });
  window.RISS = { laeuft, feldAufheben, zeigen, zustand: () => Z, karteZustand: () => KZ, laden, kern: () => K, mitschrift };
})();
