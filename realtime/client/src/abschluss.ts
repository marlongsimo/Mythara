/*
 * Riftmere – Quest-Abschlussfenster (#77), schlichtes Arbeitsfenster der Rolle Systeme: zeigt Quest, Lohn und Questpunkte und holt den Lohn mit „Okay“ ab.
 * Die richtige Gestaltung (HUD-Stil, Vorschau mit dem Nutzer) baut die Rolle Oberfläche – Ereignisse: „ez-quest-abholen“ (detail: Quest-Id),
 * „ez-quest-abgeholt“ (detail: Antwort des Servers); Daten: shared/questbau.ts lohnListe(q), questAbholen(id) in welt.ts.
 */
import { lohnListe, type LohnZeile } from "../../shared/questbau";
import { questDef } from "../../shared/quests";
import { GEGENSTAENDE } from "../../shared/gegenstaende";
import { questAbholen } from "./welt";
const SKILL: Record<string, string> = { geschick: "Geschick", staerke: "Stärke", fernkampf: "Fernkampf", magie: "Magie", lp: "Lebenspunkte", defense: "Defense" };
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const zeile = (z: LohnZeile): string => z.art === "xp" ? `${z.n.toLocaleString("de-DE")} XP ${SKILL[z.k] || z.k}` : z.art === "beruf" ? `${z.n.toLocaleString("de-DE")} XP ${z.k[0].toUpperCase() + z.k.slice(1)}`
  : z.art === "splitter" ? `${z.n} Splitter` : z.art === "gegenstand" ? `${z.n > 1 ? z.n + " × " : ""}${GEGENSTAENDE[z.g] ? GEGENSTAENDE[z.g].name : z.g}` : z.art === "ladungen" ? `${z.n} Ladungen für ${GEGENSTAENDE[z.g] ? GEGENSTAENDE[z.g].name : z.g}` : `+${z.n} Questpunkt${z.n === 1 ? "" : "e"}`;
const offen = new Map<string, HTMLElement>();
addEventListener("ez-quest-abholen", (e) => { const id = String((e as CustomEvent).detail || ""), q = questDef(id); if (!q || offen.has(id)) return;
  const el = document.createElement("div"); el.className = "ez-abschluss"; el.dataset.quest = id; el.setAttribute("role", "dialog");
  el.style.cssText = "position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:80;min-width:260px;max-width:92vw;padding:14px 18px;border-radius:10px;background:rgba(32,22,10,.95);color:#f3e3b5;font:15px Georgia,serif;box-shadow:0 6px 24px rgba(0,0,0,.6);text-align:center";
  el.innerHTML = `<h2 style="margin:0 0 4px;font-size:20px">Quest abgeschlossen!</h2><div style="margin-bottom:8px">„${esc(q.titel)}“</div>
    <ul style="list-style:none;margin:0 0 10px;padding:0;text-align:left">${lohnListe(q).map((z) => `<li>• ${esc(zeile(z))}</li>`).join("")}</ul>
    <small class="hinweis" style="display:block;margin-bottom:8px;opacity:.8">${esc(q.belohnungText || "")}</small><button type="button" class="okay" style="padding:6px 22px;font:600 15px Georgia,serif">Okay</button>`;
  const knopf = el.querySelector(".okay") as HTMLButtonElement; knopf.onclick = () => { knopf.disabled = true; knopf.textContent = "…"; questAbholen(id); };
  document.body.appendChild(el); offen.set(id, el); });
addEventListener("ez-quest-abgeholt", (e) => { const m = (e as CustomEvent).detail as { abgeholt?: string; fehler?: string }; const el = m && m.abgeholt ? offen.get(m.abgeholt) : null;
  if (el && m.abgeholt) { el.remove(); offen.delete(m.abgeholt); return; }
  for (const x of offen.values()) { const b = x.querySelector(".okay") as HTMLButtonElement | null; if (b && b.disabled) { b.disabled = false; b.textContent = "Okay"; } } }); /* Fehler: noch einmal versuchen */
/** Für Prüfungen: offene Abschlussfenster (Quest-Ids) */
export const abschlussOffen = (): string[] => [...offen.keys()];
