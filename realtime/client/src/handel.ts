/*
 * Riftmere – Handel zwischen Spielern im Browser (#65). Der Server führt den Handel (server/src/handel.ts); hier nur Bitten und Anzeige.
 * Schnittstelle für das richtige Fenster der Oberfläche (#71): handelAnfragen(name), handelAnfrageAnnehmen(von), handelAngebot(posten, splitter),
 * handelAnnehmen(), handelAblehnen(); Ereignis „ez-handel“ (detail: Nachricht des Servers: anfrage · offen · zu · fertig · nein) und handelStand().
 * Bis das Fenster da ist: ein schlichtes Arbeitsfenster (unten).
 */
import { handelSenden, chatSystem } from "./welt";
import { inventar } from "./inventar";
import { anzeigeName, handelbar, type Daten } from "../../shared/gegenstaende";
export interface Posten { g: string; n: number; d?: Daten }
export interface HandelStand { mit: string; stufe: 1 | 2; ich: { posten: Posten[]; splitter: number; ok: boolean }; er: { posten: Posten[]; splitter: number; ok: boolean }; freiIch: number; freiEr: number }
let stand: HandelStand | null = null; const anfragenVon = new Set<string>();
export const handelStand = (): HandelStand | null => stand;
export const handelAnfragen = (name: string): void => handelSenden({ tat: "anfrage", an: name });
export const handelAnfrageAnnehmen = (von: string): void => handelSenden({ tat: "annehmen_anfrage", von });
export const handelAngebot = (posten: Posten[], splitter: number): void => handelSenden({ tat: "angebot", posten, splitter });
export const handelAnnehmen = (): void => handelSenden({ tat: "annehmen" });
export const handelAblehnen = (von?: string): void => handelSenden({ tat: "ablehnen", ...(von ? { von } : {}) });
/** Hat dieser Spieler mich gefragt (und läuft die Anfrage noch)? */
export const hatGefragt = (name: string): boolean => anfragenVon.has(name);
addEventListener("ez-handel", (e) => { const m = (e as CustomEvent).detail as { tat: string; von?: string; grund?: string } & HandelStand;
  if (m.tat === "anfrage" && m.von) { const v = m.von; anfragenVon.add(v); setTimeout(() => anfragenVon.delete(v), 30_000); chatSystem(`${v} möchte mit dir handeln. (Lange drücken → „Handeln“)`); }
  else if (m.tat === "offen") { stand = { mit: m.mit, stufe: m.stufe, ich: m.ich, er: m.er, freiIch: m.freiIch, freiEr: m.freiEr }; anfragenVon.delete(m.mit); fensterZeigen(); }
  else if (m.tat === "zu" || m.tat === "fertig") { stand = null; fensterZu(); } });

/* ───── Arbeitsfenster (schlicht; die Oberfläche ersetzt es, #71) ───── */
let el: HTMLElement | null = null;
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const liste = (p: Posten[], s: number) => [...p.map((x) => `${x.n} × ${anzeigeName(x.g, x.d)}`), ...(s ? [`${s} Splitter`] : [])].map((t) => `<li>${esc(t)}</li>`).join("") || "<li><i>nichts</i></li>";
function fensterZu(): void { if (el) el.remove(); el = null; }
function fensterZeigen(): void { const S = stand; if (!S) return; if (!el) { el = document.createElement("div"); el.className = "ez-handel"; el.setAttribute("role", "dialog"); document.body.appendChild(el);
    el.style.cssText = "position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:80;width:min(560px,94vw);padding:12px 14px;border-radius:10px;background:rgba(32,22,10,.95);color:#f3e3b5;font:14px Georgia,serif;box-shadow:0 6px 24px rgba(0,0,0,.6)"; }
  const inv = inventar(), daten = inv.daten || [], mein = inv.rucksack.map((g, i) => ({ g, n: (inv.anzahl || [])[i] || 1, d: daten[i], i })).filter((x) => x.g !== "splitter");
  const zwei = S.stufe === 2;
  el.innerHTML = `<h3 style="margin:0 0 6px">Handel mit ${esc(S.mit)}${zwei ? " – Zusammenfassung" : ""}</h3>
    <div style="display:flex;gap:12px"><div style="flex:1;outline:${S.ich.ok ? "2px solid #6c6" : "none"};padding:4px"><b>${zwei ? "Du gibst" : "Dein Angebot"}</b><ul class="ich">${liste(S.ich.posten, S.ich.splitter)}</ul></div>
    <div style="flex:1;outline:${S.er.ok ? "2px solid #6c6" : "none"};padding:4px"><b>${zwei ? "Du bekommst" : "Angebot von " + esc(S.mit)}</b><ul class="er">${liste(S.er.posten, S.er.splitter)}</ul><small>${esc(S.mit)} hat ${S.freiEr} freie Plätze${S.er.ok ? " · hat angenommen" : ""}</small></div></div>
    ${zwei ? "" : `<div class="rucksack" style="margin:6px 0;display:flex;flex-wrap:wrap;gap:4px">${mein.map((x) => `<button type="button" data-i="${x.i}" ${handelbar(x.g, x.d) ? "" : "disabled title=\"nicht handelbar\""}>${esc(anzeigeName(x.g, x.d))}${x.n > 1 ? " ×" + x.n : ""}</button>`).join("")}</div>
    <label>Splitter <input type="number" min="0" class="splitter" value="${S.ich.splitter}" style="width:90px"></label> <button type="button" class="leeren">Angebot leeren</button>`}
    <div style="margin-top:8px;display:flex;gap:8px;justify-content:center"><button type="button" class="ja">Annehmen</button><button type="button" class="nein">Ablehnen</button></div>`;
  const neu = (p: Posten[], s: number) => handelAngebot(p, s);
  el.querySelectorAll<HTMLButtonElement>("[data-i]").forEach((b) => b.onclick = () => { const x = mein.find((m) => m.i === Number(b.dataset.i)); if (!x) return; const p = S.ich.posten.map((q) => ({ ...q })), da = p.find((q) => q.g === x.g && JSON.stringify(q.d || {}) === JSON.stringify(x.d || {}));
    if (da) { if (da.n < x.n) da.n++; } else p.push({ g: x.g, n: 1, ...(x.d ? { d: x.d } : {}) }); neu(p, S.ich.splitter); }); /* antippen = 1 Stück dazu */
  const sp = el.querySelector<HTMLInputElement>(".splitter"); if (sp) sp.onchange = () => neu(S.ich.posten, Math.max(0, Math.floor(Number(sp.value) || 0)));
  const le = el.querySelector<HTMLButtonElement>(".leeren"); if (le) le.onclick = () => neu([], 0);
  (el.querySelector(".ja") as HTMLButtonElement).onclick = () => handelAnnehmen(); (el.querySelector(".nein") as HTMLButtonElement).onclick = () => handelAblehnen(); }
