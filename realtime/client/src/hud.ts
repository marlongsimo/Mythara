/*
 * Die Oberfläche in der Waldmark und in den Orten der Kampagnen (mittelalterlich, goldgerahmt):
 * oben links das Profil mit Stufe und Seelensplittern, oben in der Mitte das Ortsbanner, oben rechts die Minikarte mit Zoom,
 * darunter links die aktive Quest mit ihren Schritten (zum Ein- und Ausklappen), unten links das Team, unten rechts die Menüknöpfe.
 * Nur was es im Spiel wirklich gibt; Händler, Schmiede, Taverne, Post und Taschen kommen, wenn sie gebaut sind.
 */
import { HELDEN, stufeAusEp, EP_BIS, STUFE_MAX } from "../../shared/config";
import { epAlle } from "./halle";
import { kontoKnopf, kontoFenster, kontoName, kontoAbmelden, kontoAnmelden } from "./konto";

const $ = (s: string) => document.querySelector(s) as HTMLElement;
const lies = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };

/* ---------- Quests: Schritte der Hauptquest und freiwillige Nebenaufgaben, je Ort. Ein Schritt ist erledigt, wenn sein Merker gesetzt ist. ---------- */
export interface Schritt { text: string; fertig: string; wenn?: string[] }
export const QUESTS: Record<string, { titel: string; ort: string; stufe: number; haupt: Schritt[]; neben: Schritt[] }> = {
  weidenhain: { titel: "Das Erntefest von Weidenhain", ort: "Weidenhain", stufe: 1,
    haupt: [
      { text: "Durchs Stadttor nach Weidenhain aufbrechen", fertig: "ankunft" },
      { text: "Mit Hanne Kalk sprechen", fertig: "hanne" },
      { text: "Den Kornspeicher von den Kröten befreien", fertig: "kampf_speicher" },
      { text: "Mit Lene reden – sie sucht dich", fertig: "tebbe" },
      { text: "Tebbe an der alten Mühle finden", fertig: "kampf_muehle" },
      { text: "Die alte Unke am Wehr stellen", fertig: "kampf_wehr" },
    ],
    neben: [
      { text: "Lene nach den Kröten fragen", wenn: ["hanne"], fertig: "lene" },
      { text: "Agnes am Baum zuhören", wenn: ["hanne"], fertig: "agnes" },
      { text: "Hanne vom Kornspeicher berichten", wenn: ["kampf_speicher"], fertig: "hanne2" },
      { text: "Nach Tebbe sehen", wenn: ["tebbe_gefunden"], fertig: "tebbe_rede" },
      { text: "Den Krötenlaich hinter der Scheune zerschlagen", wenn: ["nest_auftrag"], fertig: "kampf_nest" },
      { text: "Die Irrlichter am Mühlteich vertreiben", wenn: ["ufer_auftrag"], fertig: "kampf_ufer" },
    ] },
};
/** Merker eines Ortes aus dem Spielstand */
export const merkerVon = (ort: string): Record<string, boolean> => { try { return JSON.parse(lies("ez_ort_" + ort) || "{}") || {}; } catch { return {}; } };

/* ---------- Bildzeichen (gezeichnet, golden) ---------- */
const SVG = (inhalt: string) => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${inhalt}</svg>`;
export const ZEICHEN = {
  helden: SVG('<circle cx="9" cy="8" r="3.2"/><path d="M3 19.5c0-3.6 2.7-6.2 6-6.2s6 2.6 6 6.2"/><circle cx="16.6" cy="7.4" r="2.6"/><path d="M15.4 12.7c3.1-.5 5.8 1.9 5.8 5.6"/>'),
  karte: SVG('<path d="M3 6.2 9 4l6 2.2L21 4v13.8L15 20l-6-2.2L3 20z"/><path d="M9 4v13.8M15 6.2V20"/><path d="M5.5 10.5l1.4 1.4M6.9 10.5l-1.4 1.4" stroke-width="1.3"/>'),
  riss: SVG('<circle cx="12" cy="12" r="8.4"/><path d="M12 6.6a5.4 5.4 0 1 1-5 3.4"/><path d="M12 9.6a2.4 2.4 0 1 1-2.3 1.8"/>'),
  menue: SVG('<circle cx="12" cy="12" r="3"/><path d="M12 2.6v2.6M12 18.8v2.6M2.6 12h2.6M18.8 12h2.6M5.4 5.4l1.8 1.8M16.8 16.8l1.8 1.8M5.4 18.6l1.8-1.8M16.8 7.2l1.8-1.8"/><circle cx="12" cy="12" r="6.6"/>'),
  heim: SVG('<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 9.6V20h13V9.6"/><path d="M10 20v-5.5h4V20"/>'),
};

/* ---------- Profil oben links ---------- */
/** Bild, Name, Held und Stufe des Helden, der gerade läuft */
export function hudProfil(held: string) {
  const D = HELDEN[held] || HELDEN.schildwaechter; ($("#ez-profil-bild") as HTMLImageElement).src = "../" + D.bild; $("#ez-profil-held").textContent = `${D.name} · ${D.klasse}`;
  $("#ez-profil-stufe").textContent = "St. " + stufeAusEp(epAlle()[held] || 0); kontoKnopf();
}

/* ---------- Banner oben in der Mitte ---------- */
export function hudTitel(name: string, unter: string) { const t = $("#ez-titel"); (t.querySelector("b") as HTMLElement).textContent = name; (t.querySelector("small") as HTMLElement).textContent = unter; t.hidden = false; }

/* ---------- Minikarte: Der Zoom sitzt unten im Rahmen ---------- */
export function hudKarte() { const z = $("#ez-zoom"), r = $("#ez-kartenrahmen"); if (z && r && z.parentElement !== r) r.appendChild(z); }

/* ---------- Aktive Quest ---------- */
let questZu = (() => { const v = lies("ezhud_quest"); return v ? v === "zu" : window.innerWidth < 700 || window.innerHeight < 500; })(); /* auf kleinen Bildschirmen anfangs eingeklappt */
/** Die Quest eines Ortes zeigen (oder ausblenden, wenn ort leer ist) */
export function hudQuest(ort: string, merker: Record<string, boolean>) {
  const el = $("#ez-quest"), Q = QUESTS[ort]; if (!el) return; if (!Q) { el.hidden = true; return; } el.hidden = false;
  const offen = Q.haupt.findIndex((s) => !merker[s.fertig]), jetzt = offen < 0 ? Q.haupt.length : offen;
  const zeile = (s: Schritt, an: boolean) => `<li class="${merker[s.fertig] ? "fertig" : an ? "jetzt" : ""}"><i></i><span>${s.text}</span></li>`;
  const haupt = Q.haupt.slice(0, jetzt + 1).map((s, i) => zeile(s, i === jetzt)).join("");
  const neben = Q.neben.filter((s) => (s.wenn || []).every((m) => merker[m])).map((s) => zeile(s, false)).join("");
  const naechster = offen < 0 ? "Alles erledigt" : Q.haupt[offen].text;
  el.classList.toggle("zu", questZu);
  el.innerHTML = `<button type="button" class="kopf" aria-expanded="${!questZu}"><em>!</em><b>Aktive Quest</b><i class="pfeil"></i></button>
    <div class="titel"><img src="../img/mythara/siegel.webp" alt=""><div><b>${Q.titel}</b><small>${Q.ort} · Stufe ${Q.stufe}</small></div></div>
    <p class="kurz">${naechster}</p>
    <div class="inhalt"><ul>${haupt}</ul>${neben ? `<h4>Nebenaufgaben</h4><ul class="neben">${neben}</ul>` : ""}</div>`;
  const k = el.querySelector(".kopf") as HTMLElement; k.onpointerdown = (e) => e.stopPropagation();
  k.onclick = (e) => { e.stopPropagation(); questZu = !questZu; try { localStorage.setItem("ezhud_quest", questZu ? "zu" : "auf"); } catch { /* privat */ } hudQuest(ort, merker); };
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
    <h2>Menü</h2><div class="zier"></div>
    <div class="liste"><button type="button" data-t="profil">Heldenprofil &amp; Bildnis</button><button type="button" data-t="start">Zur Startseite von Mythara</button>
    ${n ? `<button type="button" data-t="ab">Abmelden <small>(${n})</small></button>` : `<button type="button" data-t="hin">Anmelden</button>`}</div>
    <p class="klein">Splitterlande · Beta</p></div>`;
  f.onpointerdown = (e) => e.stopPropagation(); f.onkeydown = (e) => e.stopPropagation(); f.onkeyup = (e) => e.stopPropagation();
  f.onclick = (e) => { const t = (e.target as HTMLElement).closest("[data-t]") as HTMLElement | null; if (e.target === f) { schliessen(); return; } if (!t) return; const w = t.dataset.t;
    if (w === "zu") schliessen(); else if (w === "profil") { removeEventListener("keydown", esc, true); f.innerHTML = ""; kontoFenster(zu); } else if (w === "start") location.href = "../"; else if (w === "ab") void kontoAbmelden(); else if (w === "hin") kontoAnmelden(); };
}
