/*
 * Konto und Spielstand der Splitterlande.
 * Anmeldung: dieselben Zugangsdaten wie im Würfelspiel (Supabase, derselbe Anmelde-Speicher im Browser „mr-rpg-auth“ – wer dort angemeldet ist, ist es auch hier).
 * Fortschritt: ganz eigenständig. Er liegt je Konto in rpg_echtzeit_stand (Migration 034) und hat mit dem Würfelspiel nichts zu tun.
 *
 * So wird gespeichert: Das Spiel merkt sich alles wie bisher im Browser (Schlüssel „ez_…“). Dieses Modul gleicht das mit dem Konto ab:
 *   - Jede Änderung setzt eine Merkmarke und wird kurz darauf ins Konto geschrieben.
 *   - Beim Laden der Seite: Steht die Merkmarke noch (das Speichern kam nicht mehr durch), wird der Stand vom Gerät hochgeladen.
 *     Sonst gilt der Stand aus dem Konto; weicht er vom Gerät ab, wird er übernommen und die Seite einmal neu geladen.
 *   - Hat das Konto noch gar keinen Stand, wird der vom Gerät übernommen.
 * Gäste spielen wie bisher nur auf dem Gerät. Es wird nur der veröffentlichbare Schlüssel verwendet.
 */
import { HELDEN, HELDENREIHE } from "../../shared/config";
import { geschaffteKampagnen } from "../../shared/karten";
interface Db { auth: { getSession(): Promise<{ data: { session: { access_token?: string; user: { is_anonymous?: boolean } } | null } }>; signInAnonymously(): Promise<{ error: { message: string } | null }>; signInWithPassword(a: { email: string; password: string }): Promise<{ error: { message: string } | null }>; signOut(): Promise<unknown>; updateUser(a: { email: string; password: string }): Promise<{ error: { message: string } | null }> };
  rpc(name: string, args?: Record<string, unknown>): Promise<{ data: unknown; error: { message: string } | null }> }
const W = window as unknown as { supabase?: { createClient(url: string, key: string, o: unknown): Db }; MR_MULTIPLAYER_CONFIG?: { supabaseUrl: string; supabasePublishableKey: string } };
const $ = (s: string) => document.querySelector(s) as HTMLElement;
const OHNE = new Set(["ez_zoom", "ez__offen", "ez__version"]); // gehört zum Gerät, nicht zum Konto
const meins = (k: string) => k.startsWith("ez_") && !OHNE.has(k) && !(name && (k === "ez_ep" || k === "ez_seelen" || k === "ez_kampagnen")); /* mit Konto führt der Spielserver EP, Seelensplitter und geschaffte Kampagnen (Migrationen 035, 036) */ /* mit Konto führt der Spielserver EP und Seelensplitter (Migration 035) */

let db: Db | null = null, name = "", version = 0, takt = 0, schreibt = false;
function verbindung(): Db | null { if (db) return db; const c = W.MR_MULTIPLAYER_CONFIG; if (!W.supabase || !c) return null; try { db = W.supabase.createClient(c.supabaseUrl, c.supabasePublishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: "mr-rpg-auth" } }); } catch { db = null; } return db; }
/** Eine Datenbankfunktion als angemeldeter Spieler aufrufen (für Freunde und Einladungen) */
export function kontoRpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> { return rpc<T>(fn, args); }
async function rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> { const d = verbindung(); if (!d) throw new Error("Keine Verbindung zum Konto."); const { data, error } = await d.rpc(fn, args); if (error) throw new Error(error.message); return data as T; }

/** Das Anmelde-Token für den Spielserver (nur mit Konto) */
export async function kontoToken(): Promise<string> { const d = verbindung(); if (!d || !name) return ""; try { const { data } = await d.auth.getSession(); return (data.session && data.session.access_token) || ""; } catch { return ""; } }
/** EP und Seelensplitter aus dem Konto holen (vom Server geführt) und für die Anzeige ablegen */
export async function kontoWerte(): Promise<void> { if (!name) return; try { const w = await rpc<{ ep: Record<string, number>; seelen: number }>("rpg_echtzeit_werte"); roh.setzen("ez_ep", JSON.stringify(w.ep || {})); roh.setzen("ez_seelen", String(w.seelen || 0)); } catch { /* Migration 035 fehlt: Anzeige bleibt */ }
  try { const s = await rpc<{ ort: string; kampf: string }[]>("rpg_echtzeit_siege"); roh.setzen("ez_kampagnen", String(geschaffteKampagnen(new Set((s || []).map((q) => q.ort + "/" + q.kampf))))); } catch { /* Migration 036 fehlt */ } }
/** Der Anmeldename, leer für Gäste */
export const kontoName = () => name;

function lies(): Record<string, string> { const o: Record<string, string> = {}; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i) as string; if (meins(k)) o[k] = localStorage.getItem(k) as string; } } catch { /* privat */ } return o; }
function setze(daten: Record<string, string>) { try { for (const k of Object.keys(lies())) roh.entfernen(k); for (const k in daten) if (meins(k)) roh.setzen(k, String(daten[k])); } catch { /* privat */ } }
const gleich = (a: Record<string, string>, b: Record<string, string>) => { const ka = Object.keys(a).sort(), kb = Object.keys(b).sort(); return ka.length === kb.length && ka.every((k, i) => k === kb[i] && a[k] === b[k]); };
/* die unveränderten Speicherfunktionen des Browsers – das Spiel selbst geht über die mithörenden unten */
const roh = { setzen: Storage.prototype.setItem.bind(localStorage) as (k: string, v: string) => void, entfernen: Storage.prototype.removeItem.bind(localStorage) as (k: string) => void };

async function speichern() {
  if (!name || schreibt) return; schreibt = true;
  try { for (let versuch = 0; versuch < 2; versuch++) { const r = await rpc<{ ok: boolean; version: number }>("rpg_echtzeit_speichern", { p_stand: { v: 1, daten: lies() }, p_version: version }); version = r.version; try { roh.setzen("ez__version", String(version)); } catch { /* privat */ } if (r.ok) { try { roh.entfernen("ez__offen"); } catch { /* privat */ } break; } /* sonst: ein anderes Gerät war schneller – mit dessen Version noch einmal; das Gerät, an dem gerade gespielt wird, gilt */ } }
  catch { /* bleibt als offen vermerkt und wird beim nächsten Laden nachgeholt */ } schreibt = false;
}
function geaendert() { if (!name) return; try { roh.setzen("ez__offen", "1"); } catch { /* privat */ } clearTimeout(takt); takt = window.setTimeout(() => void speichern(), 400); }

/** Beim Start der Seite: Konto erkennen und den Spielstand abgleichen. Gibt true zurück, wenn die Seite gleich neu lädt. */
export async function kontoStart(): Promise<boolean> {
  /* mithören, was das Spiel im Browser ablegt */
  /* Über das Urbild des Speichers, nicht über localStorage selbst: Eine Zuweisung an localStorage.setItem legt in manchen Browsern (Safari) nur einen Eintrag namens „setItem“ an, statt die Funktion zu ersetzen. */
  try { const S0 = Storage.prototype.setItem, R0 = Storage.prototype.removeItem;
    Storage.prototype.setItem = function (this: Storage, k: string, v: string) { if (this !== localStorage) { S0.call(this, k, v); return; } const alt = this.getItem(k); S0.call(this, k, v); if (meins(String(k)) && alt !== String(v)) geaendert(); };
    Storage.prototype.removeItem = function (this: Storage, k: string) { if (this !== localStorage) { R0.call(this, k); return; } const da = this.getItem(k) !== null; R0.call(this, k); if (meins(String(k)) && da) geaendert(); };
    for (const falsch of ["setItem", "removeItem"]) if (Object.prototype.hasOwnProperty.call(localStorage, falsch)) R0.call(localStorage, falsch); /* Rest einer früheren Fassung aufräumen */ } catch { /* privat */ }
  const d = verbindung(); if (!d) return false;
  try { const { data } = await d.auth.getSession(); if (!data.session || data.session.user.is_anonymous) return false;
    const p = await rpc<{ handle?: string; konto?: boolean } | null>("rpg_my_profile"); if (!p || !p.konto || !p.handle) return false; name = p.handle;
    await kontoWerte();
    const s = await rpc<{ stand: { daten?: Record<string, string> }; version: number }>("rpg_echtzeit_laden"); version = s.version; const lokal = lies(), fern = (s.stand && s.stand.daten) || {};
    let offen = false; try { offen = localStorage.getItem("ez__offen") === "1"; } catch { /* privat */ }
    if (s.version === 0 || offen) { if (Object.keys(lokal).length || offen) await speichern(); return false; } /* Konto ohne Stand, oder das letzte Speichern kam nicht durch: der Stand vom Gerät gilt */
    if (!gleich(lokal, fern)) { setze(fern); try { roh.setzen("ez__version", String(version)); if (sessionStorage.getItem("ez__neu") === "1") return false; sessionStorage.setItem("ez__neu", "1"); } catch { return false; } location.reload(); return true; }
    try { sessionStorage.removeItem("ez__neu"); } catch { /* privat */ }
  } catch { /* Konto nicht erreichbar oder Migration 034 fehlt: es wird wie als Gast auf dem Gerät gespielt */ }
  return false;
}

/** Das Profil oben links: zeigt den Namen; ein Klick öffnet Anmelden oder Abmelden. */
export function kontoKnopf() {
  const el = $("#ez-profil"); if (!el) return; { let n = 0; try { n = Number(localStorage.getItem("ez_seelen")) || 0; } catch { /* privat */ } const se = $("#ez-seelen"); if (se) se.innerHTML = `<i class="kristall"></i><b>${n}</b>`; } $("#ez-profil-name").textContent = name || "Gast · anmelden"; el.style.cursor = "pointer"; el.style.pointerEvents = "auto"; el.title = name ? "Konto" : "Anmelden";
  el.onpointerdown = (e) => e.stopPropagation(); el.onclick = (e) => { e.stopPropagation(); fenster(); };
}
/** Für das Menü: Profilfenster, Abmelden, zur Anmeldung */
export function kontoFenster(zu?: () => void) { fenster(zu); }
export function kontoAbmelden() { return abmelden(); }
export function kontoAnmelden() { zurAnmeldung(); }
/** Vor dem Spiel: Wer nicht angemeldet ist, kommt einmal je Besuch auf die Anmeldeseite (anmelden.html, gestaltet wie die des Würfelspiels). Dort meldet man sich an, legt ein Konto an oder spielt als Gast weiter. */
export function kontoSeite(): Promise<void> { if (name || !verbindung()) return Promise.resolve(); try { if (sessionStorage.getItem("ez__gefragt") === "1") return Promise.resolve(); } catch { return Promise.resolve(); } zurAnmeldung(); return new Promise(() => { /* die Seite wechselt */ }); }
function zurAnmeldung() { location.replace("anmelden.html" + (location.search ? "?weiter=" + encodeURIComponent(location.search) : "")); }
/** Das Profil als Tafel: Name, Seelensplitter, Kampagnen – und die Wahl des Bildnisses. Das gewählte Bildnis ist auch die Figur, mit der man durch die Waldmark läuft (in Kampagnen läuft immer der Anführer des Teams). */
function fenster(danach?: () => void) {
  const f = $("#ez-konto"); f.hidden = false; const zu = () => { f.hidden = true; f.innerHTML = ""; if (danach) danach(); };
  const lies1 = (k: string) => { try { return localStorage.getItem(k) || ""; } catch { return ""; } }; let held = lies1("ez_held"); if (!HELDEN[held]) held = "schildwaechter"; const start = held;
  const kopf = () => `<img src="../${HELDEN[held].bild}" alt=""><div><b></b><small>${HELDEN[held].name} · ${HELDEN[held].klasse}</small></div>`;
  f.innerHTML = `<div class="tafel"><i class="ecke a"></i><i class="ecke b"></i><i class="ecke c"></i><i class="ecke d"></i><button type="button" class="schliessen" data-t="zu" aria-label="Schließen">✕</button>
    <h2>Heldenprofil</h2><div class="zier"></div>
    <div class="kopf">${kopf()}</div>
    <div class="werte"><span><em>◈</em><b>${Number(lies1("ez_seelen")) || 0}</b><small>Seelensplitter</small></span><span><em>⚑</em><b>${Number(lies1("ez_kampagnen")) || 0} / 6</b><small>Kampagnen</small></span></div>
    <h3>Bildnis wählen</h3><div class="bildnisse">${HELDENREIHE.map((k) => `<button type="button" data-held="${k}" title="${HELDEN[k].name}"><img src="../${HELDEN[k].bild}" alt="${HELDEN[k].name}"><small>${HELDEN[k].name}</small></button>`).join("")}</div>
    <p class="klein">Mit diesem Helden läufst du durch die Waldmark. In einer Kampagne läuft immer der Anführer deines Teams.</p>
    <div class="reihe"><button type="button" class="haupt" data-t="zu">Fertig</button>${name ? `<button type="button" data-t="ab">Abmelden</button>` : `<button type="button" data-t="hin">Anmelden</button>`}</div>
    <p class="klein">${name ? "Dein Fortschritt wird in deinem Konto gespeichert." : "Als Gast bleibt dein Fortschritt nur auf diesem Gerät."}</p></div>`;
  const zeige = () => { const k = f.querySelector(".kopf") as HTMLElement; k.innerHTML = kopf(); (k.querySelector("b") as HTMLElement).textContent = name || "Gast"; for (const b of Array.from(f.querySelectorAll<HTMLElement>("[data-held]"))) b.classList.toggle("an", b.dataset.held === held); }; zeige();
  const fertig = () => { if (held !== start && ((window as unknown as { EZD?: unknown }).EZD || ((window as unknown as { EZW?: { szene?: unknown } }).EZW || {}).szene)) { location.reload(); return; } /* in der Waldmark (gemalt oder Welt) wechselt die Figur */ ($("#ez-profil-bild") as HTMLImageElement).src = "../" + HELDEN[held].bild; zu(); };
  f.onpointerdown = (e) => e.stopPropagation(); f.onkeydown = (e) => { e.stopPropagation(); if (e.key === "Escape") fertig(); }; f.onkeyup = (e) => e.stopPropagation();
  f.onclick = (e) => { const el = (e.target as HTMLElement).closest("[data-t],[data-held]") as HTMLElement | null; if (e.target === f) { fertig(); return; } if (!el) return;
    if (el.dataset.held) { held = el.dataset.held; try { localStorage.setItem("ez_held", held); } catch { /* privat */ } zeige(); } else if (el.dataset.t === "zu") fertig(); else if (el.dataset.t === "ab") void abmelden(); else if (el.dataset.t === "hin") zurAnmeldung(); };
}
async function abmelden() {
  clearTimeout(takt); await speichern(); const d = verbindung(); if (d) await d.auth.signOut();
  /* der Fortschritt gehört zum Konto: Auf dem Gerät bleibt nichts zurück, sonst landete er beim nächsten Anmelden in einem fremden Konto */
  name = ""; setze({}); try { roh.entfernen("ez__offen"); roh.entfernen("ez__version"); sessionStorage.removeItem("ez__neu"); sessionStorage.removeItem("ez__gefragt"); } catch { /* privat */ } location.replace("anmelden.html"); /* nach dem Abmelden zurück zur Anmeldeseite */
}
