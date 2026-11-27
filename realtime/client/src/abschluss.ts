/*
 * Riftmere – Quest-Abschlussfenster (#77, Gestaltung Oberfläche): „Quest abgeschlossen!“ mit Questname und Glückwunsch der Figur,
 * die Belohnungen als Felder mit Symbol (XP je Skill und Beruf, Splitter, Gegenstände, Ladungen), dazu die Questpunkte (+N und der neue Stand)
 * und was danach frei ist („danach: …“ aus belohnungText). Erst „Okay“ holt den Lohn ab (Systeme: questAbholen, genau einmal gebucht).
 * Belohnung zur Auswahl (#146): die Gegenstände nebeneinander, antippen = groß ansehen mit Werten, „… nehmen?“ – erst dann ist „Okay“ frei.
 * Ereignisse: „ez-quest-abholen“ (detail: Quest-Id), „ez-quest-abgeholt“ (detail: Antwort des Servers).
 */
import { lohnListe, type LohnZeile } from "../../shared/questbau";
import { questDef } from "../../shared/quests";
import { GEGENSTAENDE, SELTENHEITEN, werteVon } from "../../shared/gegenstaende";
import { SKILL_NAME, type Skill } from "../../shared/kampfwerte";
import { questAbholen, questpunkte } from "./welt";
import { SKILL_ZEICHEN, BERUF_ZEICHEN, BERUF_NAME } from "./skills";
import { gegenstandMalen } from "./rahmen";
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const zahl = (n: number) => n.toLocaleString("de-DE");
/** Ein Feld je Belohnung: Bild, Menge, Name */
function feld(z: LohnZeile): string {
  if (z.art === "xp") return `<li class="lohn"><span class="lbild">${SKILL_ZEICHEN[z.k as Skill] || ""}</span><b>+${zahl(z.n)} XP</b><small>${esc(z.k === "lp" ? "Lebenspunkte" : SKILL_NAME[z.k as Skill] || z.k)}</small></li>`;
  if (z.art === "beruf") return `<li class="lohn"><span class="lbild">${BERUF_ZEICHEN[z.k] || ""}</span><b>+${zahl(z.n)} XP</b><small>${esc(BERUF_NAME[z.k] || z.k)}</small></li>`;
  if (z.art === "splitter") return `<li class="lohn"><span class="lbild"><canvas width="72" height="72" data-bild="splitter"></canvas></span><b>${zahl(z.n)}</b><small>Splitter</small></li>`;
  if (z.art === "gegenstand") { const G = GEGENSTAENDE[z.g]; return `<li class="lohn ding"><span class="lbild"><canvas width="72" height="72" data-bild="${esc(z.g)}"></canvas></span><b>${z.n > 1 ? z.n + " × " : ""}${esc(G ? G.name : z.g)}</b><small>${esc(G ? G.art : "")}</small></li>`; }
  if (z.art === "ladungen") { const G = GEGENSTAENDE[z.g]; return `<li class="lohn"><span class="lbild"><canvas width="72" height="72" data-bild="${esc(z.g)}"></canvas></span><b>+${z.n} Ladungen</b><small>${esc(G ? G.name : z.g)}</small></li>`; }
  return "";
}
const offen = new Map<string, HTMLElement>();
addEventListener("ez-quest-abholen", (e) => { const id = String((e as CustomEvent).detail || ""), q = questDef(id); if (!q || offen.has(id)) return;
  const L = lohnListe(q), P = L.find((z) => z.art === "punkte"), felder = L.filter((z) => z.art !== "punkte" && z.art !== "wahl"),
    W = (L.find((z) => z.art === "wahl") as { art: "wahl"; optionen: { g: string; n: number }[] } | undefined)?.optionen || [];
  let gewaehlt = ""; const danach = ((q.belohnungText || "").split(/·\s*danach:\s*/i)[1] || "").trim();
  const glueck = (q as { glueckwunsch?: string }).glueckwunsch || "";
  const el = document.createElement("div"); el.className = "ez-abschluss"; el.dataset.quest = id; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Quest abgeschlossen");
  el.innerHTML = `<div class="abkasten"><div class="abkopf"><span class="abstern" aria-hidden="true">★</span><div><h2>Quest abgeschlossen!</h2><p class="abtitel">${esc(q.titel)}</p></div></div>
    ${glueck ? `<p class="abglueck">„${esc(glueck)}“</p>` : ""}
    <div class="abrumpf"><ul class="ablohn">${felder.map(feld).join("")}</ul>
      ${P ? `<div class="abpunkte"><b>+${P.n}</b><small>Questpunkt${P.n === 1 ? "" : "e"}</small><em>Stand: <i class="abstand">${questpunkte() + P.n}</i></em></div>` : ""}</div>
    ${W.length ? `<div class="abwahl"><h3>Wähle eine Belohnung <small>antippen zum Ansehen</small></h3><ul>${W.map((o) => { const G = GEGENSTAENDE[o.g];
      return `<li><button type="button" class="wopt s-${G ? G.seltenheit : ""}" data-wahl="${esc(o.g)}"><span class="lbild"><canvas width="96" height="96" data-bild="${esc(o.g)}"></canvas></span><b>${o.n > 1 ? o.n + " × " : ""}${esc(G ? G.name : o.g)}</b><small>${esc(G ? G.art : "")}</small><i class="haken" aria-hidden="true">✓</i></button></li>`; }).join("")}</ul></div>` : ""}
    ${danach ? `<p class="abdanach"><b>Neu:</b> ${esc(danach)}</p>` : ""}
    <p class="abboden" hidden></p>
    <button type="button" class="okay"${W.length ? " disabled" : ""}>${W.length ? "Erst wählen" : "Okay"}</button>
    <div class="abgross" hidden></div></div>`;
  el.querySelectorAll<HTMLCanvasElement>("canvas[data-bild]").forEach((c) => gegenstandMalen(c, c.dataset.bild!));
  for (const t of ["pointerdown", "keydown", "keyup", "wheel"]) el.addEventListener(t, (ev) => ev.stopPropagation());
  const knopf = el.querySelector(".okay") as HTMLButtonElement; knopf.onclick = () => { if (W.length && !gewaehlt) return; knopf.disabled = true; knopf.textContent = "…"; questAbholen(id, gewaehlt || undefined); };
  /* Auswahl: antippen → groß mit Werten, „… nehmen?“ → gewählt (Haken), dann ist „Okay“ frei; erneut antippen und anders wählen geht bis „Okay“ */
  const gross = el.querySelector(".abgross") as HTMLElement;
  el.addEventListener("click", (ev) => { const t = ev.target as HTMLElement, o = t.closest<HTMLElement>("[data-wahl]"); if (o) { const g = o.dataset.wahl!, G = GEGENSTAENDE[g]; if (!G) return;
      gross.innerHTML = `<div class="grosskasten"><canvas width="220" height="220" data-bild="${esc(g)}"></canvas><div class="grosstext"><h3 style="color:${SELTENHEITEN[G.seltenheit].farbe}">${esc(G.name)}</h3><p class="gart">${esc(SELTENHEITEN[G.seltenheit].name)} · ${esc(G.art)}</p>
        <dl>${werteVon(G).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl><div class="greihe"><button type="button" class="zurueck" data-gross="zu">Zurück</button><button type="button" class="nehmen" data-nehmen="${esc(g)}">${esc(G.name)} nehmen?</button></div></div></div>`;
      gross.querySelectorAll<HTMLCanvasElement>("canvas[data-bild]").forEach((c) => gegenstandMalen(c, c.dataset.bild!)); gross.hidden = false; return; }
    if (t.closest("[data-gross]")) { gross.hidden = true; return; }
    const n = t.closest<HTMLElement>("[data-nehmen]"); if (n) { gewaehlt = n.dataset.nehmen!; gross.hidden = true;
      el.querySelectorAll<HTMLElement>("[data-wahl]").forEach((b) => b.classList.toggle("an", b.dataset.wahl === gewaehlt)); knopf.disabled = false; knopf.textContent = "Okay"; } });
  document.body.appendChild(el); offen.set(id, el); requestAnimationFrame(() => el.classList.add("da")); });
addEventListener("ez-quest-abgeholt", (e) => { const m = (e as CustomEvent).detail as { abgeholt?: string; fehler?: string; amBoden?: number; gesamtPunkte?: number }; const el = m && m.abgeholt ? offen.get(m.abgeholt) : null;
  if (el && m.abgeholt) { const id = m.abgeholt; offen.delete(id);
    if (m.amBoden) { /* Rucksack voll: der Rest liegt am Boden – kurz zeigen, dann schließen */ const b = el.querySelector(".abboden") as HTMLElement; b.hidden = false; b.textContent = `Dein Rucksack ist voll – ${m.amBoden} Gegenstand${m.amBoden === 1 ? "" : "e"} lieg${m.amBoden === 1 ? "t" : "en"} zu deinen Füßen.`;
      const k = el.querySelector(".okay") as HTMLButtonElement; k.disabled = false; k.textContent = "Schließen"; k.onclick = () => el.remove(); return; }
    el.classList.remove("da"); setTimeout(() => el.remove(), 250); return; }
  for (const x of offen.values()) { const b = x.querySelector(".okay") as HTMLButtonElement | null; if (b && b.textContent === "…") { b.disabled = false; b.textContent = "Okay"; } } }); /* Fehler: noch einmal versuchen */
/** Für Prüfungen: offene Abschlussfenster (Quest-Ids) */
export const abschlussOffen = (): string[] => [...offen.keys()];
