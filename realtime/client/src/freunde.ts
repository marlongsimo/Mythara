/*
 * Mythara – Freunde (Tab „Freunde“ an der Minikarte, ersetzt „Spieler online“).
 * Anfragen stellen und beantworten: rpg_request_friend / rpg_answer_friend (Migration 003, im Browser mit dem eigenen Konto).
 * Ob ein Freund online ist, wo er steht, ob er kämpft und wann er zuletzt da war, weiß nur der Spielserver (welt.ts „freunde“, Migration 047) –
 * er gibt das nur für bestätigte Freunde heraus. Flüstern geht per Name überall hin, Teleport nur, wenn der Freund online ist, nicht kämpft
 * und sein Gebiet für einen selbst schon freigeschaltet ist (prüft der Server, „zufreund“).
 */
import { kontoRpc, kontoName } from "./konto";
import { freundeAbfragen, zuFreund, freundMelden, fluestern, chatSystem, tafelZeigen } from "./welt";

type Status = { n: string; online: boolean; ort?: string; kampf: boolean; zuletzt: string | null };
type Person = { handle: string };
type Meine = { freunde: Person[]; an_mich: Person[]; von_mir: Person[] };
let status: Status[] = [], meine: Meine | null = null, fehler = "", geladen = false, hinweis = "";
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const melden = () => { window.dispatchEvent(new CustomEvent("ez-freunde-neu")); zahlZeigen(); };
/** offene Anfragen an mich (Zahl am Freunde-Knopf) */
export const offeneAnfragen = (): number => (meine ? meine.an_mich.length : 0);
function zahlZeigen(): void { const n = offeneAnfragen(); document.querySelectorAll<HTMLElement>(".ez-freunde-zahl").forEach((z) => { z.hidden = n < 1; z.textContent = String(n); }); }
/** Liste neu holen: eigene Freundschaften aus der Datenbank, Online-Stand vom Spielserver */
export function freundeLaden(): void {
  if (!kontoName()) { fehler = "Freunde gibt es mit Konto (Menü → Anmelden)."; melden(); return; }
  freundeAbfragen();
  kontoRpc<Meine>("rpg_my_friends").then((m) => { meine = m; fehler = ""; melden(); }).catch((e) => { fehler = (e as Error).message || "Freunde konnten nicht geladen werden."; melden(); });
}
addEventListener("ez-freunde", (e) => { status = (e as CustomEvent).detail as Status[]; geladen = true; melden(); });
addEventListener("ez-freundanfrage", () => freundeLaden());
let uhr = 0;
/** solange der Tab offen ist: alle 15 s auffrischen */
export function freundeBeobachten(an: boolean): void { clearInterval(uhr); uhr = 0; if (an) { freundeLaden(); uhr = window.setInterval(freundeLaden, 15000); } }

const GEBIET: Record<string, string> = { waldweg: "Kreuzwald", rathaus_oben: "Rathaus" };
const gebiet = (o?: string) => (o ? GEBIET[o] || o.charAt(0).toUpperCase() + o.slice(1) : "");
function zuletzt(z: string | null): string {
  if (!z) return "Noch nie in der Welt"; const s = Math.max(0, (Date.now() - new Date(z).getTime()) / 1000);
  if (s < 120) return "Gerade eben online"; if (s < 3600) return `Zuletzt online vor ${Math.round(s / 60)} Min.`;
  if (s < 86400) return `Zuletzt online vor ${Math.round(s / 3600)} Std.`; const t = Math.round(s / 86400); return `Zuletzt online vor ${t} ${t === 1 ? "Tag" : "Tagen"}`;
}
/** Inhalt des Tabs */
export function freundeHtml(mitte = false): string {
  const on = status.filter((f) => f.online).length, zahl = geladen ? `${on} von ${status.length} online` : "wird geladen …";
  const kopf = mitte ? `<h2>Freunde</h2><div class="zier"></div><p class="klein fzahl">${zahl}</p>` : `<div class="kopf gross"><b>Freunde</b><small>${zahl}</small></div>`;
  if (fehler && !meine) return kopf + `<div class="tleer"><p>${esc(fehler)}</p></div>`;
  const an = meine ? meine.an_mich : [], von = meine ? meine.von_mir : [];
  const anfragen = an.length ? `<div class="fanfragen">${an.map((p) => `<div class="fanfrage"><span><b>${esc(p.handle)}</b><small>möchte dein Freund sein</small></span><button type="button" class="ja" data-fja="${esc(p.handle)}">Annehmen</button><button type="button" class="nein" data-fnein="${esc(p.handle)}">Ablehnen</button></div>`).join("")}</div>` : "";
  const sortiert = [...status].sort((a, b) => Number(b.online) - Number(a.online) || a.n.localeCompare(b.n));
  const zeilen = sortiert.map((f) => { const st = f.online ? (f.kampf ? `Im Kampf · ${gebiet(f.ort)}` : `Online · ${gebiet(f.ort)}`) : zuletzt(f.zuletzt);
    return `<li class="${f.online ? (f.kampf ? "online kampf" : "online") : "aus"}"><i class="dot"></i><span class="wer"><b>${esc(f.n)}</b><small>${esc(st)}</small></span>
      <button type="button" class="fk" data-fl="${esc(f.n)}" ${f.online ? "" : "disabled"} title="Flüstern">✉</button><button type="button" class="fk" data-tp="${esc(f.n)}" ${f.online ? "" : "disabled"} title="Teleport zu ${esc(f.n)}">⟿</button></li>`; }).join("");
  const liste = status.length ? `<ul class="fliste">${zeilen}</ul>` : `<div class="tleer"><p>Noch keine Freunde.</p><small>Tippe im Spiel oder im Chat auf einen Spieler und wähle „Freund hinzufügen“.</small></div>`;
  const offen = von.length ? `<p class="klein foffen">Gesendet an: ${von.map((p) => esc(p.handle)).join(", ")}</p>` : "";
  const neu = `<form class="fneu"><input type="text" maxlength="24" placeholder="Name des Spielers" aria-label="Name des Spielers"><button type="submit">Hinzufügen</button></form>`;
  return kopf + anfragen + liste + offen + neu + (hinweis ? `<p class="klein fhinweis">${esc(hinweis)}</p>` : "");
}
/** Eine Freundschaftsanfrage stellen (aus dem Tab, der Spielerkarte oder dem Chat) */
export async function freundHinzufuegen(handle: string): Promise<string> {
  const h = handle.trim(); if (!h) return ""; if (!kontoName()) return "Freunde gibt es mit Konto (Menü → Anmelden).";
  try { await kontoRpc("rpg_request_friend", { p_handle: h }); freundMelden(h); freundeLaden(); return `Anfrage an ${h} gesendet.`; }
  catch (e) { return (e as Error).message || "Anfrage nicht möglich."; }
}
/** Klicks im Tab; true = erledigt */
export function freundKlick(t: HTMLElement): boolean {
  const b = t.closest<HTMLElement>("[data-fja],[data-fnein],[data-fl],[data-tp]"); if (!b) return false;
  if (b.dataset.fja || b.dataset.fnein) { const h = (b.dataset.fja || b.dataset.fnein)!, ja = Boolean(b.dataset.fja);
    void kontoRpc("rpg_answer_friend", { p_handle: h, p_accept: ja }).then(() => { hinweis = ja ? `Du und ${h} seid jetzt Freunde.` : "Anfrage abgelehnt."; if (ja) freundMelden(h, true); freundeLaden(); })
      .catch((e) => { hinweis = (e as Error).message; melden(); }); return true; }
  if (b.dataset.fl) { fluestern(0, b.dataset.fl); return true; }
  if (b.dataset.tp) { hinweis = `Teleport zu ${b.dataset.tp} …`; melden(); zuFreund(b.dataset.tp); return true; }
  return false;
}
/** Formular „Hinzufügen“ im Tab */
export function freundFormular(f: HTMLFormElement): void {
  const i = f.querySelector("input") as HTMLInputElement; const h = i.value.trim(); if (!h) return; i.value = "";
  void freundHinzufuegen(h).then((t) => { hinweis = t; melden(); if (t) chatSystem(t); });
}

/** Freunde als Fenster in der Bildschirmmitte (wie früher „Spieler online“): Liste frischt sich auf, solange es offen ist */
export function freundeTafel(zu: () => void): void {
  let inh: HTMLElement | null = null; const neu = () => { if (!inh) return; if (!inh.isConnected) { aus(); return; } const h = freundeHtml(true); if ((inh as HTMLElement & { _h?: string })._h !== h) { (inh as HTMLElement & { _h?: string })._h = h; inh.innerHTML = h; } };
  const aus = () => { freundeBeobachten(false); removeEventListener("ez-freunde-neu", neu); };
  const f = tafelZeigen("freunde", `<div class="finhalt ftafel"></div>`, () => { aus(); zu(); }); inh = f.querySelector(".finhalt") as HTMLElement;
  inh.addEventListener("click", (e) => { const t = e.target as HTMLElement; if (t.closest("[data-fl]")) { (f.querySelector(".schliessen") as HTMLElement | null)?.click(); } if (freundKlick(t)) e.stopPropagation(); });
  inh.addEventListener("submit", (e) => { e.preventDefault(); e.stopPropagation(); freundFormular(e.target as HTMLFormElement); });
  addEventListener("ez-freunde-neu", neu); freundeBeobachten(true); neu(); }
