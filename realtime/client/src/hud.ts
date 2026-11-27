/*
 * Die Oberfläche in der Waldmark und in den Orten der Kampagnen (mittelalterlich, goldgerahmt):
 * oben links das Profil mit Stufe und Seelensplittern, oben in der Mitte das Ortsbanner, oben rechts die Minikarte mit Zoom,
 * darunter links die aktive Quest mit ihren Schritten (zum Ein- und Ausklappen), unten links das Team, unten rechts die Menüknöpfe.
 * Nur was es im Spiel wirklich gibt; Händler, Schmiede, Taverne, Post und Taschen kommen, wenn sie gebaut sind.
 */
import { blockieren, blockierteNamen } from "./welt";
import { dropsAn, dropsSetzen, daecherAus, daecherAusSetzen } from "./skills";
import { musikAus, musikAusSetzen } from "./musik";
import { eigenesLevel } from "./skills";
import { profilZeigen } from "./held";
import { HELDEN, stufeAusEp, EP_BIS, STUFE_MAX } from "../../shared/config";
import { KARTEN, KAMPFFOLGE, ORTREIHE } from "../../shared/karten";
import { epAlle } from "./halle";
import { kontoKnopf, kontoFenster, kontoName, kontoAbmelden, kontoAnmelden } from "./konto";
import { gruppenTafel, gruppeVerbinden, einladungenBeobachten, serverAdresse } from "./gruppe";
import { wechselWarten } from "./kampfzeit";

const $ = (s: string) => document.querySelector(s) as HTMLElement;
const lies = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };

/* ---------- Quests: Schritte der Hauptquest und freiwillige Nebenaufgaben, je Ort. Ein Schritt ist erledigt, wenn sein Merker gesetzt ist. ---------- */
export interface Schritt { text: string; fertig: string; wenn?: string[] }
/* Eine Nebenquest: erscheint, sobald „wenn“ erfüllt ist. Ihre Schritte kommen der Reihe nach – außer bei „frei“: dann jeder, sobald sein eigenes „wenn“ erfüllt ist. */
export interface Nebenquest { titel: string; wenn: string[]; frei?: boolean; schritte: Schritt[] }
export const QUESTS: Record<string, { titel: string; ort: string; stufe: number; haupt: Schritt[]; neben: Nebenquest[] }> = {
  weidenhain: { titel: "Das Erntefest von Weidenhain", ort: "Weidenhain", stufe: 1,
    haupt: [
      { text: "Durchs Stadttor nach Weidenhain aufbrechen", fertig: "ankunft" },
      { text: "Mit Hanne Kalk sprechen", fertig: "hanne" },
      { text: "Den Kornspeicher von den Kröten befreien", fertig: "kampf_speicher" },
      { text: "Mit Lene reden – sie sucht dich", fertig: "tebbe" },
      { text: "Tebbe an der alten Mühle finden", fertig: "kampf_muehle" },
      { text: "Die alte Unke am Wehr stellen", fertig: "kampf_wehr" },
      { text: "Den Jungen anhören, der ins Dorf gerannt kommt", fertig: "bote" },
    ],
    neben: [
      { titel: "Lichter am Mühlteich", wenn: ["hanne"], schritte: [
        { text: "Mette am Wehr anhören", fertig: "ufer_auftrag" }, { text: "Die Irrlichter am Mühlteich vertreiben", fertig: "kampf_ufer" }, { text: "Mette Bescheid geben", fertig: "mette_dank" }] },
      { titel: "Der Laich hinter der Scheune", wenn: ["agnes"], schritte: [
        { text: "Agnes noch einmal anhören", fertig: "nest_auftrag" }, { text: "Den Krötenlaich im Tümpel zerschlagen", fertig: "kampf_nest" }, { text: "Agnes Bescheid geben", fertig: "nest_dank" }] },
      { titel: "Stimmen im Dorf", wenn: ["hanne"], frei: true, schritte: [
        { text: "Lene nach den Kröten fragen", fertig: "lene" }, { text: "Agnes am Baum zuhören", fertig: "agnes" },
        { text: "Hanne vom Kornspeicher berichten", wenn: ["kampf_speicher"], fertig: "hanne2" }, { text: "Nach Tebbe sehen", wenn: ["tebbe_gefunden"], fertig: "tebbe_rede" }] },
    ] },
  rabenmoor: { titel: "Das Moor der stummen Lichter", ort: "Rabenmoor", stufe: 2,
    haupt: [
      { text: "Nach Rabenmoor aufbrechen", fertig: "ankunft" },
      { text: "Mit Bertold Krähe, dem Schulzen, sprechen", fertig: "bertold" },
      { text: "Über den Bohlenweg ins Schwarzmoor", fertig: "kampf_bohlenweg" },
      { text: "Joost am Anleger ansprechen", fertig: "joost" },
      { text: "Mit dem Kahn durchs Ried", fertig: "kampf_ried" },
      { text: "Mutter Hedda in ihrer Hütte anhören", fertig: "hedda" },
      { text: "Den Totenpfad gehen", fertig: "kampf_totenpfad" },
      { text: "Alwine am versunkenen Schrein stellen", fertig: "kampf_schrein" },
    ],
    neben: [
      { titel: "Miras Pfeife", wenn: ["bertold"], schritte: [
        { text: "Ilse am Brunnen anhören", fertig: "ilse" }, { text: "Die Kinder aus dem Moor holen", fertig: "kampf_schrein" }, { text: "Ilse Bescheid geben", fertig: "ilse_dank" }] },
      { titel: "Was Bertold verschweigt", wenn: ["hedda"], schritte: [
        { text: "Bertold nach Alwine fragen", fertig: "bertold_schuld" }, { text: "Alwine zur Ruhe bringen", fertig: "kampf_schrein" }, { text: "Bertolds Geständnis hören", fertig: "bertold_gestanden" }] },
      { titel: "Fackeln am Brunnen", wenn: ["bertold"], schritte: [
        { text: "Harm, den Schmied, anhören", fertig: "harm" }, { text: "Heddas Geschichte erfahren", fertig: "hedda" }, { text: "Die Meute nach Hause schicken", fertig: "harm_ruhig" }] },
      { titel: "Jorins Schwester", wenn: ["bertold"], schritte: [{ text: "Mit Jorin reden", fertig: "jorin" }] },
    ] },
};
/** Gehört dieser Merker zur Hauptquest des Ortes? (sonst ist es eine Nebenquest – hellblau statt gelb) */
export const istHaupt = (ort: string, merker: string) => Boolean(QUESTS[ort] && QUESTS[ort].haupt.some((s) => s.fertig === merker));
/* ---------- Sterne je Kampagne: ★ abgeschlossen · ★★ alle Nebenquests · ★★★ jede Herausforderung der Hauptkämpfe (beste Leistung zählt) ---------- */
const liesJ = (k: string): Record<string, boolean> => { try { return JSON.parse(lies(k) || "{}") || {}; } catch { return {}; } };
const schreibJ = (k: string, o: Record<string, boolean>) => { try { localStorage.setItem(k, JSON.stringify(o)); } catch { /* privat */ } };
/** Eine geschaffte Herausforderung festhalten („ort/kampf“) */
export function probeGeschafft(ort: string, kampf: string) { const o = liesJ("ez_proben"); o[ort + "/" + kampf] = true; schreibJ("ez_proben", o); }
/** Alle Nebenquests eines Ortes erledigt? */
export const nebenFertig = (ort: string, m: Record<string, boolean>) => Boolean(QUESTS[ort]) && QUESTS[ort].neben.every((n) => n.schritte.every((s) => m[s.fertig]));
/** Die drei Sterne einer Kampagne, mit Begründung */
export function sterne(ort: string): { an: boolean; name: string; warum: string }[] {
  const nr = ORTREIHE.indexOf(ort) + 1; let fertig = 0; try { fertig = Number(lies("ez_kampagnen")) || 0; } catch { /* privat */ }
  const neben = liesJ("ez_neben")[ort], proben = liesJ("ez_proben"), kaempfe = (KAMPFFOLGE[ort] || []).filter((k) => KARTEN[k] && KARTEN[k].probe);
  const alle = kaempfe.length > 0 && kaempfe.length === (KAMPFFOLGE[ort] || []).length, geschafft = kaempfe.filter((k) => proben[ort + "/" + k]).length;
  return [{ an: nr > 0 && fertig >= nr, name: "Abgeschlossen", warum: "Das Ende der Kampagne erreichen" },
    { an: Boolean(neben), name: "Gründlich", warum: "Alle Nebenquests erledigen, bevor die Kampagne endet" },
    { an: alle && geschafft === kaempfe.length, name: "Meisterhaft", warum: alle ? `Jede Herausforderung der Hauptkämpfe schaffen (${geschafft} / ${kaempfe.length}): ` + kaempfe.map((k) => `${proben[ort + "/" + k] ? "✓" : "☐"} ${KARTEN[k].probe!.text}`).join(" · ") : "Herausforderungen kommen noch" }];
}
export const sternText = (ort: string) => sterne(ort).map((s) => (s.an ? "★" : `<em class="aus">★</em>`)).join(""); /* fehlende Sterne blass (das Zeichen ☆ sieht in manchen Schriften wie ★ aus) */
/** Beim Abschluss: festhalten, ob alle Nebenquests erledigt waren, und die Wertung zeigen */
export function wertung(ort: string, merker: Record<string, boolean>, weiter: () => void) {
  if (nebenFertig(ort, merker)) { const o = liesJ("ez_neben"); o[ort] = true; schreibJ("ez_neben", o); }
  const f = $("#ez-konto"), Q = QUESTS[ort], S = sterne(ort); f.hidden = false;
  f.innerHTML = `<div class="tafel wertung"><i class="ecke a"></i><i class="ecke b"></i><i class="ecke c"></i><i class="ecke d"></i>
    <h2>${Q ? Q.titel : "Geschafft"}</h2><div class="zier"></div><div class="grosse-sterne">${S.map((s) => `<span class="${s.an ? "an" : ""}">★</span>`).join("")}</div>
    <ul class="gruende">${S.map((s) => `<li class="${s.an ? "an" : ""}"><b>${s.an ? "★" : `<span class=\"aus\">★</span>`} ${s.name}</b><small>${s.warum}</small></li>`).join("")}</ul>
    <p class="klein">Die beste Leistung zählt. Spielst du die Kampagne erneut, kannst du fehlende Sterne nachholen.</p>
    <div class="reihe"><button type="button" class="haupt" data-t="weiter">Zurück in die Waldmark</button></div></div>`;
  f.onpointerdown = (e) => e.stopPropagation(); f.onclick = (e) => { if ((e.target as HTMLElement).closest('[data-t="weiter"]')) { f.hidden = true; weiter(); } };
}
/** Merker eines Ortes aus dem Spielstand */
export const merkerVon = (ort: string): Record<string, boolean> => { try { return JSON.parse(lies("ez_ort_" + ort) || "{}") || {}; } catch { return {}; } };

/* ---------- Bildzeichen (gezeichnet, golden) ---------- */
const SVG = (inhalt: string) => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${inhalt}</svg>`;
export const ZEICHEN = {
  helden: SVG('<circle cx="9" cy="8" r="3.2"/><path d="M3 19.5c0-3.6 2.7-6.2 6-6.2s6 2.6 6 6.2"/><circle cx="16.6" cy="7.4" r="2.6"/><path d="M15.4 12.7c3.1-.5 5.8 1.9 5.8 5.6"/>'),
  karte: SVG('<path d="M3 6.2 9 4l6 2.2L21 4v13.8L15 20l-6-2.2L3 20z"/><path d="M9 4v13.8M15 6.2V20"/><path d="M5.5 10.5l1.4 1.4M6.9 10.5l-1.4 1.4" stroke-width="1.3"/>'),
  riss: SVG('<circle cx="12" cy="12" r="8.4"/><path d="M12 6.6a5.4 5.4 0 1 1-5 3.4"/><path d="M12 9.6a2.4 2.4 0 1 1-2.3 1.8"/>'),
  menue: SVG('<circle cx="12" cy="12" r="3"/><path d="M12 2.6v2.6M12 18.8v2.6M2.6 12h2.6M18.8 12h2.6M5.4 5.4l1.8 1.8M16.8 16.8l1.8 1.8M5.4 18.6l1.8-1.8M16.8 7.2l1.8-1.8"/><circle cx="12" cy="12" r="6.6"/>'),
  rucksack: SVG('<path d="M8 7V5.5a4 4 0 0 1 8 0V7"/><rect x="5" y="7" width="14" height="13.5" rx="3"/><path d="M8.5 13h7v4h-7z"/>'),
  ausruestung: SVG('<path d="M12 3 5 6v5.5c0 4.4 3 7.8 7 9.5 4-1.7 7-5.1 7-9.5V6z"/><path d="M12 8v8M9 11h6"/>'),
  heim: SVG('<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 9.6V20h13V9.6"/><path d="M10 20v-5.5h4V20"/>'),
};

/* ---------- Profil oben links ---------- */
/** Bild, Name, Held und Stufe des Helden, der gerade läuft */
export function hudProfil(held: string) {
  const D = HELDEN[held] || HELDEN.schildwaechter; ($("#ez-profil-bild") as HTMLImageElement).src = "../" + D.bild; $("#ez-profil-held").textContent = `${D.name} · ${D.klasse}`;
  $("#ez-profil-stufe").textContent = "Lv " + eigenesLevel(stufeAusEp(epAlle()[held] || 0)); kontoKnopf(); void gruppeVerbinden(); einladungenBeobachten(); profilZeigen(); /* der eigene Held: Gesicht statt der fünf Helden */
}

/* ---------- Banner oben in der Mitte ---------- */
/** Das Ortsbanner beim Betreten: blendet ein, steht TITEL_MS und verblasst dann (danach ausgeblendet, damit es nichts verdeckt) */
const TITEL_MS = 3500, VERBLASSEN_MS = 900; let titelUhr = 0;
export function hudTitel(name: string, unter: string) { const t = $("#ez-titel"); (t.querySelector("b") as HTMLElement).textContent = name; (t.querySelector("small") as HTMLElement).textContent = unter;
  clearTimeout(titelUhr); t.classList.remove("weg"); t.hidden = false; t.classList.remove("ein"); void t.offsetWidth; t.classList.add("ein");
  titelUhr = window.setTimeout(() => { t.classList.add("weg"); titelUhr = window.setTimeout(() => { t.hidden = true; t.classList.remove("weg"); }, VERBLASSEN_MS); }, TITEL_MS); }

/* ---------- Minikarte: Der Zoom sitzt unten im Rahmen ---------- */
export function hudKarte() { const z = $("#ez-zoom"), r = $("#ez-kartenrahmen"); if (z && r && z.parentElement !== r) r.appendChild(z); }

/* ---------- Aktive Quest ---------- */
let questZu = (() => { const v = lies("ezhud_quest"); return v ? v === "zu" : window.innerWidth < 700 || window.innerHeight < 500; })(); /* auf kleinen Bildschirmen anfangs eingeklappt */
/** Die Quest eines Ortes zeigen (oder ausblenden, wenn ort leer ist) */
/* Was einzeln eingeklappt ist: "haupt", "neben" und je Nebenquest "nq:<Titel>" – auf dem Gerät gemerkt */
let klappe: Record<string, boolean> = (() => { try { return JSON.parse(lies("ezhud_klappe") || "{}") || {}; } catch { return {}; } })();
export function hudQuest(ort: string, merker: Record<string, boolean>) {
  const el = $("#ez-quest"), Q = QUESTS[ort]; if (!el) return; if (!Q) { el.hidden = true; return; } el.hidden = false;
  const zeile = (s: Schritt, an: boolean) => `<li class="${merker[s.fertig] ? "fertig" : an ? "jetzt" : ""}"><i></i><span>${s.text}</span></li>`;
  const pfeil = (k: string) => `<i class="pfeil klein" data-k="${k}"></i>`;
  const offen = Q.haupt.findIndex((s) => !merker[s.fertig]), jetzt = offen < 0 ? Q.haupt.length : offen;
  const haupt = Q.haupt.slice(0, jetzt + 1).map((s, i) => zeile(s, i === jetzt)).join("");
  const neben = Q.neben.filter((n) => n.wenn.every((m) => merker[m])).map((n) => {
    const sicht = n.frei ? n.schritte.filter((s) => (s.wenn || []).every((m) => merker[m])) : (() => { const o = n.schritte.findIndex((s) => !merker[s.fertig]); return n.schritte.slice(0, o < 0 ? n.schritte.length : o + 1); })();
    const fertig = n.schritte.every((s) => merker[s.fertig]), erste = sicht.findIndex((s) => !merker[s.fertig]), k = "nq:" + n.titel, zu = fertig || klappe[k];
    return `<div class="nq${fertig ? " fertig" : ""}${zu ? " zu" : ""}"><div class="nqkopf" ${fertig ? "" : `data-k="${k}"`}><em>${fertig ? "✓" : "!"}</em><b>${n.titel}</b>${fertig ? "" : pfeil(k)}</div>${fertig ? "" : `<ul>${sicht.map((s, i) => zeile(s, !n.frei && i === erste)).join("")}</ul>`}</div>`; });
  const offenNeben = Q.neben.filter((n) => n.wenn.every((m) => merker[m]) && !n.schritte.every((s) => merker[s.fertig])).length;
  el.classList.toggle("zu", questZu);
  el.innerHTML = `<button type="button" class="kopf" aria-expanded="${!questZu}"><em>!</em><b>Quests</b>${offenNeben ? `<span class="zahl" title="offene Nebenquests">${offenNeben}</span>` : ""}<i class="pfeil"></i></button>
    <div class="abschnitt haupt${klappe.haupt ? " zu" : ""}"><h4 data-k="haupt"><em>!</em>Hauptquest${pfeil("haupt")}</h4><div class="titel"><img src="../img/mythara/siegel.webp" alt=""><div><b>${Q.titel}</b><small>${Q.ort} · Stufe ${Q.stufe} · <span class="sterne" title="Sterne dieser Kampagne">${sternText(ort)}</span></small></div></div>
    <p class="kurz">${offen < 0 ? "Alles erledigt" : Q.haupt[offen].text}</p><div class="inhalt"><ul>${haupt}</ul></div></div>
    ${neben.length ? `<div class="abschnitt neben inhalt${klappe.neben ? " zu" : ""}"><h4 data-k="neben"><em>!</em>Nebenquests${offenNeben ? ` <span class="anz">${offenNeben} offen</span>` : ""}${pfeil("neben")}</h4><div class="liste">${neben.join("")}</div></div>` : ""}`;
  const k = el.querySelector(".kopf") as HTMLElement; k.onpointerdown = (e) => e.stopPropagation();
  k.onclick = (e) => { e.stopPropagation(); questZu = !questZu; try { localStorage.setItem("ezhud_quest", questZu ? "zu" : "auf"); } catch { /* privat */ } hudQuest(ort, merker); };
  for (const t of Array.from(el.querySelectorAll<HTMLElement>("h4[data-k], .nqkopf[data-k]"))) t.onclick = (e) => { e.stopPropagation(); const key = t.dataset.k as string; klappe[key] = !klappe[key]; try { localStorage.setItem("ezhud_klappe", JSON.stringify(klappe)); } catch { /* privat */ } hudQuest(ort, merker); };
  el.onpointerdown = (e) => e.stopPropagation();
}

/* ---------- Team unten links ---------- */
/** Die Helden des Teams mit Stufe und Erfahrung; ein Klick öffnet die Heldenhalle */
export function hudTeam(helden: string[], klick: () => void) {
  const el = $("#ez-team"), ep = epAlle(); el.hidden = false;
  el.innerHTML = helden.filter((h) => HELDEN[h]).map((h, i) => { const e = ep[h] || 0, s = stufeAusEp(e), von = EP_BIS[s], bis = s < STUFE_MAX ? EP_BIS[s + 1] : von, anteil = s < STUFE_MAX ? Math.min(1, (e - von) / (bis - von)) : 1;
    return `<button type="button" class="${i ? "" : "fuehrt"}" title="${HELDEN[h].name} · Stufe ${s}${s < STUFE_MAX ? ` · ${e - von} / ${bis - von} EP` : ""}"><img src="../${HELDEN[h].bild}" alt="${HELDEN[h].name}"><em>${s}</em><i><u style="width:${Math.round(anteil * 100)}%"></u></i></button>`; }).join("");
  el.onpointerdown = (e) => e.stopPropagation(); el.onclick = (e) => { e.stopPropagation(); if ((e.target as HTMLElement).closest("button")) klick(); };
}

/* ---------- Menüknöpfe unten rechts ---------- */
export interface Knopf { name: string; zeichen: keyof typeof ZEICHEN; tat: () => void; art?: string }
export function hudMenue(knoepfe: Knopf[]) {
  const el = $("#ez-menue"); el.hidden = false;
  el.innerHTML = knoepfe.map((k, i) => `<button type="button" data-i="${i}" class="${k.art || ""}" aria-label="${k.name}"><span>${ZEICHEN[k.zeichen]}</span><small>${k.name}</small></button>`).join("");
  el.onpointerdown = (e) => e.stopPropagation(); el.onclick = (e) => { e.stopPropagation(); const b = (e.target as HTMLElement).closest("[data-i]") as HTMLElement | null; if (b) knoepfe[Number(b.dataset.i)].tat(); };
}
/** Das Menü als Tafel: Profil, Startseite, Anmelden oder Abmelden */
export function menueTafel(zu: () => void) {
  const f = $("#ez-konto"); f.hidden = false; const n = kontoName();
  const schliessen = () => { removeEventListener("keydown", esc, true); f.hidden = true; f.innerHTML = ""; zu(); };
  const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); schliessen(); } }; addEventListener("keydown", esc, true);
  f.innerHTML = `<div class="tafel menue"><i class="ecke a"></i><i class="ecke b"></i><i class="ecke c"></i><i class="ecke d"></i><button type="button" class="schliessen" data-t="zu" aria-label="Schließen">✕</button>
    <h2>Einstellungen</h2><div class="zier"></div>
    <div class="einst">
      <button type="button" data-t="drops" class="schalter${dropsAn() ? " an" : ""}" role="switch" aria-checked="${dropsAn()}"><span>XP-Drops anzeigen</span><i class="regler"></i></button>
      <button type="button" data-t="daecher" class="schalter${daecherAus() ? " an" : ""}" role="switch" aria-checked="${daecherAus()}"><span>Dächer immer ausblenden</span><i class="regler"></i></button>
      <button type="button" data-t="musik" class="schalter${musikAus() ? "" : " an"}" role="switch" aria-checked="${!musikAus()}"><span>Musik</span><i class="regler"></i></button>
    </div>
    <button type="button" class="weltknopf" data-t="welt"><span>Welt</span><b>Riftmere 1</b><i>›</i></button>
    <button type="button" class="weltknopf" data-t="blockiert"><span>Blockierte Spieler</span><b>${blockierteNamen().length}</b><i>›</i></button>
    ${n ? `<button type="button" class="abmelden" data-t="ab">Abmelden <small>${n}</small></button>` : `<button type="button" class="abmelden" data-t="hin">Anmelden</button>`}
    <p class="klein">Riftmere · <a href="datenschutz.html" target="_blank" rel="noopener">Datenschutz</a> · <a href="impressum.html" target="_blank" rel="noopener">Impressum</a></p></div>`;
  f.onpointerdown = (e) => e.stopPropagation(); f.onkeydown = (e) => e.stopPropagation(); f.onkeyup = (e) => e.stopPropagation();
  f.onclick = (e) => { const t = (e.target as HTMLElement).closest("[data-t]") as HTMLElement | null; if (e.target === f) { schliessen(); return; } if (!t) return; const w = t.dataset.t;
    if (w === "welt") { weltenFenster(f.querySelector(".tafel") as HTMLElement); return; }
    if (w === "blockiert") { blockiertFenster(f.querySelector(".tafel") as HTMLElement); return; }
    if (w === "daecher") { daecherAusSetzen(!daecherAus()); t.classList.toggle("an", daecherAus()); t.setAttribute("aria-checked", String(daecherAus())); return; }
    if (w === "musik") { musikAusSetzen(!musikAus()); t.classList.toggle("an", !musikAus()); t.setAttribute("aria-checked", String(!musikAus())); return; }
    if (w === "drops") { dropsSetzen(!dropsAn()); t.classList.toggle("an", dropsAn()); t.setAttribute("aria-checked", String(dropsAn())); return; }
    if (w === "zu") schliessen(); else if (w === "koop") { removeEventListener("keydown", esc, true); f.innerHTML = ""; gruppenTafel(zu); } else if (w === "profil") { removeEventListener("keydown", esc, true); f.innerHTML = ""; kontoFenster(zu); } else if (w === "start") location.href = "../"; else if (w === "ab") { const n = wechselWarten(); /* wie beim Weltenwechsel: erst 10 s nach dem letzten Kampf (25.11.2026) */
      if (n > 0) { const alt = t.innerHTML; t.innerHTML = `Im Kampf <small>Abmelden in ${n} s möglich</small>`; t.classList.add("gesperrt"); setTimeout(() => { if (t.isConnected) { t.innerHTML = alt; t.classList.remove("gesperrt"); } }, 2200); }
      else void kontoAbmelden(); } else if (w === "hin") kontoAnmelden(); };
}

/* ---------- Blockierte Spieler: Liste mit „Aufheben“ (blockieren und melden geht über den Namen im Chat) ---------- */
function blockiertFenster(tafel: HTMLElement): void {
  const alt = tafel.innerHTML; const e2 = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
  const zeichnen = () => { const n = blockierteNamen();
    tafel.innerHTML = `<i class="ecke a"></i><i class="ecke b"></i><i class="ecke c"></i><i class="ecke d"></i><button type="button" class="schliessen" data-w="zurueck" aria-label="Zurück">‹</button>
      <h2>Blockierte Spieler</h2><div class="zier"></div>
      ${n.length ? `<ul class="blockliste">${n.map((x) => `<li><b>${e2(x)}</b><button type="button" data-frei="${e2(x)}">Aufheben</button></li>`).join("")}</ul>` : `<p class="klein">Du hast niemanden blockiert.</p>`}
      <p class="klein">Blockieren oder melden: den Namen im Chat oder einen Spieler in der Welt antippen.</p>`; };
  zeichnen();
  tafel.onclick = (e) => { const t = e.target as HTMLElement; e.stopPropagation();
    if (t.closest('[data-w="zurueck"]')) { tafel.onclick = null; tafel.innerHTML = alt; const z = tafel.querySelector('[data-t="blockiert"] b'); if (z) z.textContent = String(blockierteNamen().length); return; }
    const b = t.closest<HTMLElement>("[data-frei]"); if (b) { blockieren(b.dataset.frei || "", false); zeichnen(); } }; }

/* ---------- Welten (wie in OSRS): die verfügbaren Welten mit Spielerzahl; wechseln erst 10 s nach dem letzten Kampf. Bisher gibt es nur „Riftmere 1“ (id „beta“). ---------- */
const WELTEN = [{ id: "beta", name: "Riftmere 1" }];
const aktuelleWelt = (): string => { try { return localStorage.getItem("rift_welt") || "beta"; } catch { return "beta"; } };
function weltenFenster(tafel: HTMLElement): void {
  const alt = tafel.innerHTML; const jetzt = aktuelleWelt(); let zahlen: Record<string, number> = {};
  let gezeichnet = ""; /* nur neu zeichnen, wenn sich etwas ändert: sonst ersetzt der Sekundentakt die Knöpfe zwischen Drücken und Loslassen, der Tipp geht verloren (#109) */
  const zeichnen = () => { const warten = wechselWarten();
    const html = `<i class="ecke a"></i><i class="ecke b"></i><i class="ecke c"></i><i class="ecke d"></i><button type="button" class="schliessen" data-w="zurueck" aria-label="Zurück">‹</button>
      <h2>Welt wechseln</h2><div class="zier"></div>
      <ul class="weltliste">${WELTEN.map((W) => `<li><button type="button" class="weltzeile${W.id === jetzt ? " an" : ""}" data-welt="${W.id}" ${W.id === jetzt ? 'aria-current="true"' : ""}><span class="punkt"></span><b>${W.name}</b><small>${zahlen[W.id] !== undefined ? zahlen[W.id] + " online" : "… online"}</small>${W.id === jetzt ? '<em>aktuell</em>' : `<em class="wechsel">Wechseln</em>`}</button></li>`).join("")}</ul>
      <p class="klein weltnote">${warten > 0 ? `Im Kampf: wechseln erst in ${warten} s.` : WELTEN.length === 1 ? "Weitere Welten folgen. Dein Konto, Held, Inventar und Quests gelten in jeder Welt." : "Dein Konto, Held, Inventar und Quests gelten in jeder Welt."}</p>`;
    if (html !== gezeichnet || !tafel.querySelector(".weltliste")) { tafel.innerHTML = html; gezeichnet = html; } };
  zeichnen();
  const uhr = window.setInterval(() => { if (!tafel.isConnected || !tafel.querySelector(".weltliste")) { clearInterval(uhr); return; } zeichnen(); }, 1000);
  fetch(serverAdresse().replace(/^ws/, "http").replace(/\/$/, "") + "/").then((r) => r.json()).then((d: { welten?: { id: string; online: number }[] }) => { for (const x of d.welten || []) zahlen[x.id] = x.online; if (tafel.querySelector(".weltliste")) zeichnen(); }).catch(() => { zahlen = {}; });
  tafel.onclick = (e) => { const t = e.target as HTMLElement; e.stopPropagation();
    if (t.closest('[data-w="zurueck"]')) { clearInterval(uhr); tafel.onclick = null; tafel.innerHTML = alt; return; }
    const b = t.closest<HTMLElement>("[data-welt]"); if (!b || b.dataset.welt === jetzt) return;
    if (wechselWarten() > 0) { zeichnen(); return; }
    try { localStorage.setItem("rift_welt", b.dataset.welt!); } catch { /* privat */ } location.reload(); }; }