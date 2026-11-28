/*
 * Riftmere – Wahl am Boss-Eingang nach der Quest (#125 zu #116): „Öffentlich“ (Standard: offene Welt, wer da ist, kämpft mit, kein Eintritt)
 * oder „Eigene Instanz“ (allein, gegebenenfalls mit Eintritt wie dem Federsiegel). Der Server bestätigt ({ t: "bosswahl" }), dann geht es hinein.
 */
import type { InstanzDef, BossWahl } from "../../shared/boss";
import { GEGENSTAENDE } from "../../shared/gegenstaende";
import { inventar } from "./inventar";
import { bossWahl } from "./welt";

const $ = (s: string) => document.querySelector(s) as HTMLElement;
/** Das Fenster zeigen; weiter(wahl) wird nach der Wahl gerufen (der Aufrufer fragt den Server und springt hinein) */
export function bossWahlFenster(I: InstanzDef, weiter: (wahl: BossWahl) => void): void {
  const f = $("#ez-konto"); f.hidden = false;
  const G = I.eintritt ? GEGENSTAENDE[I.eintritt] : undefined, inv = inventar(), hat = G ? inv.rucksack.reduce((n, g, i) => n + (g === I.eintritt ? (inv.anzahl || [])[i] || 1 : 0), 0) : 0;
  const zuletzt = bossWahl(I.id);
  const schliessen = () => { removeEventListener("keydown", esc, true); f.hidden = true; f.innerHTML = ""; };
  const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); schliessen(); } }; addEventListener("keydown", esc, true);
  f.innerHTML = `<div class="tafel bosswahl"><i class="ecke a"></i><i class="ecke b"></i><i class="ecke c"></i><i class="ecke d"></i><button type="button" class="schliessen" data-w="zu" aria-label="Schließen">✕</button>
    <h2>${I.name}</h2><div class="zier"></div>
    <div class="bwahlen">
      <button type="button" class="bwahl${zuletzt === "oeffentlich" ? " zuletzt" : ""}" data-w="oeffentlich"><span class="bsym" aria-hidden="true">👥</span><b>Öffentlich</b>
        <small>In der offenen Welt – wer da ist, kämpft mit. Jeder mit genug Schaden bekommt eigene Beute.</small><em>Kein Eintritt</em></button>
      <button type="button" class="bwahl${zuletzt === "instanz" ? " zuletzt" : ""}${G && hat < 1 ? " fehlt" : ""}" data-w="instanz"><span class="bsym" aria-hidden="true">🛡️</span><b>Eigene Instanz</b>
        <small>Du kämpfst allein, niemand stört.</small><em>${G ? `Eintritt: 1 ${G.name} <i>(du hast ${hat})</i>` : "Kein Eintritt"}</em></button>
    </div></div>`;
  f.onpointerdown = (e) => e.stopPropagation(); f.onkeydown = (e) => e.stopPropagation();
  f.onclick = (e) => { if (e.target === f) { schliessen(); return; } const t = (e.target as HTMLElement).closest<HTMLElement>("[data-w]"); if (!t) return; const w = t.dataset.w;
    if (w === "zu") { schliessen(); return; } schliessen(); weiter(w as BossWahl); };
}
