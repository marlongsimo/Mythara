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
interface Db { auth: { getSession(): Promise<{ data: { session: { user: { is_anonymous?: boolean } } | null } }>; signInAnonymously(): Promise<{ error: { message: string } | null }>; signInWithPassword(a: { email: string; password: string }): Promise<{ error: { message: string } | null }>; signOut(): Promise<unknown>; updateUser(a: { email: string; password: string }): Promise<{ error: { message: string } | null }> };
  rpc(name: string, args?: Record<string, unknown>): Promise<{ data: unknown; error: { message: string } | null }> }
const W = window as unknown as { supabase?: { createClient(url: string, key: string, o: unknown): Db }; MR_MULTIPLAYER_CONFIG?: { supabaseUrl: string; supabasePublishableKey: string } };
const $ = (s: string) => document.querySelector(s) as HTMLElement;
const OHNE = new Set(["ez_zoom", "ez__offen", "ez__version"]); // gehört zum Gerät, nicht zum Konto
const meins = (k: string) => k.startsWith("ez_") && !OHNE.has(k);

let db: Db | null = null, name = "", version = 0, takt = 0, schreibt = false;
function verbindung(): Db | null { if (db) return db; const c = W.MR_MULTIPLAYER_CONFIG; if (!W.supabase || !c) return null; try { db = W.supabase.createClient(c.supabaseUrl, c.supabasePublishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: "mr-rpg-auth" } }); } catch { db = null; } return db; }
async function rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> { const d = verbindung(); if (!d) throw new Error("Keine Verbindung zum Konto."); const { data, error } = await d.rpc(fn, args); if (error) throw new Error(error.message); return data as T; }

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
  const el = $("#ez-profil"); if (!el) return; $("#ez-profil-name").textContent = name || "Gast · anmelden"; el.style.cursor = "pointer"; el.style.pointerEvents = "auto"; el.title = name ? "Konto" : "Anmelden";
  el.onpointerdown = (e) => e.stopPropagation(); el.onclick = (e) => { e.stopPropagation(); if (name) fenster(); else zurAnmeldung(); };
}
/** Vor dem Spiel: Wer nicht angemeldet ist, kommt einmal je Besuch auf die Anmeldeseite (anmelden.html, gestaltet wie die des Würfelspiels). Dort meldet man sich an, legt ein Konto an oder spielt als Gast weiter. */
export function kontoSeite(): Promise<void> { if (name || !verbindung()) return Promise.resolve(); try { if (sessionStorage.getItem("ez__gefragt") === "1") return Promise.resolve(); } catch { return Promise.resolve(); } zurAnmeldung(); return new Promise(() => { /* die Seite wechselt */ }); }
function zurAnmeldung() { location.replace("anmelden.html" + (location.search ? "?weiter=" + encodeURIComponent(location.search) : "")); }
function fenster(weiter?: () => void) {
  const f = $("#ez-konto"); f.hidden = false; f.classList.toggle("seite", !name); const zu = () => { f.hidden = true; f.innerHTML = ""; if (weiter) weiter(); };
  if (name) { f.innerHTML = `<div class="blatt"><h2>Konto</h2><p>Angemeldet als <b></b>.<br>Dein Fortschritt in den Splitterlanden wird in deinem Konto gespeichert.</p><div class="reihe"><button type="button" class="haupt" data-t="zu">Weiterspielen</button><button type="button" data-t="ab">Abmelden</button></div></div>`; (f.querySelector("b") as HTMLElement).textContent = name; }
  else f.innerHTML = `<div class="blatt"><small class="marke">Mythara</small><h1>Splitterlande <i>Beta</i></h1>
    <div class="reiter"><button type="button" data-t="r-an" class="an">Anmelden</button><button type="button" data-t="r-neu">Konto anlegen</button></div>
    <p class="hinweis" data-fuer="an">Dein Konto aus dem Würfelspiel gilt auch hier. Der Fortschritt in den Splitterlanden ist eigenständig.</p>
    <p class="hinweis" data-fuer="neu" hidden>Ein Konto für Mythara: Es gilt für die Splitterlande und das Würfelspiel. Benutzername 3 bis 20 Zeichen (Buchstaben, Ziffern, Unterstrich), Passwort mindestens 8 Zeichen.</p>
    <label>Benutzername<input id="ez-k-name" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="20"></label><label>Passwort<input id="ez-k-pw" type="password" autocomplete="current-password"></label>
    <label data-fuer="neu" hidden>Passwort wiederholen<input id="ez-k-pw2" type="password" autocomplete="new-password"></label><p class="meldung"></p>
    <div class="reihe"><button type="button" class="haupt" data-t="an">Anmelden</button><button type="button" data-t="zu">Als Gast spielen</button></div>
    <p class="klein">Als Gast bleibt dein Fortschritt nur auf diesem Gerät. <a href="../">← zur Startseite von Mythara</a></p></div>`;
  let neu = false; const reiter = (n: boolean) => { neu = n; for (const el of Array.from(f.querySelectorAll<HTMLElement>("[data-fuer]"))) el.hidden = (el.dataset.fuer === "neu") !== n; for (const k of Array.from(f.querySelectorAll<HTMLElement>(".reiter button"))) k.classList.toggle("an", (k.dataset.t === "r-neu") === n); (f.querySelector('[data-t="an"]') as HTMLElement).textContent = n ? "Konto anlegen" : "Anmelden"; (f.querySelector(".meldung") as HTMLElement).textContent = ""; };
  f.onpointerdown = (e) => e.stopPropagation(); f.onkeydown = (e) => { e.stopPropagation(); if (e.key === "Enter" && !name) void (neu ? anlegen(f) : anmelden(f)); if (e.key === "Escape") zu(); }; f.onkeyup = (e) => e.stopPropagation();
  f.onclick = (e) => { const t = (e.target as HTMLElement).dataset.t; if (t === "zu" || (name && e.target === f)) zu(); else if (t === "an") void (neu ? anlegen(f) : anmelden(f)); else if (t === "ab") void abmelden(); else if (t === "r-an") reiter(false); else if (t === "r-neu") reiter(true); };
}
/** Neues Konto, wie im Würfelspiel: erst eine Gastsitzung, dann den Namen sichern, dann wird aus dem Gast ein Konto mit Passwort. */
async function anlegen(f: HTMLElement) {
  const n = (f.querySelector("#ez-k-name") as HTMLInputElement).value.trim(), pw = (f.querySelector("#ez-k-pw") as HTMLInputElement).value, pw2 = (f.querySelector("#ez-k-pw2") as HTMLInputElement).value, m = f.querySelector(".meldung") as HTMLElement, kn = f.querySelector('[data-t="an"]') as HTMLButtonElement;
  if (!/^[A-Za-z0-9_]{3,20}$/.test(n)) { m.textContent = "Der Benutzername braucht 3 bis 20 Zeichen: Buchstaben, Ziffern oder Unterstrich."; return; } if (pw.length < 8) { m.textContent = "Das Passwort braucht mindestens 8 Zeichen."; return; } if (pw !== pw2) { m.textContent = "Die beiden Passwörter stimmen nicht überein."; return; }
  const d = verbindung(); if (!d) { m.textContent = "Keine Verbindung zum Konto."; return; } kn.disabled = true; m.textContent = "Konto wird angelegt …";
  try { const { data } = await d.auth.getSession(); if (!data.session) { const r = await d.auth.signInAnonymously(); if (r.error) throw new Error(r.error.message); }
    const p = await rpc<{ anmeldung: string }>("rpg_set_profile", { p_handle: n }); const { error } = await d.auth.updateUser({ email: p.anmeldung, password: pw }); if (error) throw new Error(/password/i.test(error.message) ? "Dieses Passwort ist zu schwach. Bitte ein längeres wählen." : error.message);
    try { sessionStorage.removeItem("ez__neu"); } catch { /* privat */ } location.reload();
  } catch (e) { m.textContent = (e as Error).message; kn.disabled = false; }
}
async function anmelden(f: HTMLElement) {
  const n = (f.querySelector("#ez-k-name") as HTMLInputElement).value.trim(), pw = (f.querySelector("#ez-k-pw") as HTMLInputElement).value, m = f.querySelector(".meldung") as HTMLElement, kn = f.querySelector('[data-t="an"]') as HTMLButtonElement;
  if (!n || !pw) { m.textContent = "Bitte Benutzername und Passwort eingeben."; return; } const d = verbindung(); if (!d) { m.textContent = "Keine Verbindung zum Konto."; return; } kn.disabled = true; m.textContent = "Anmeldung …";
  try { const { data } = await d.auth.getSession(); if (!data.session) { const r = await d.auth.signInAnonymously(); if (r.error) throw new Error(r.error.message); } /* die Namensabfrage braucht eine (Gast-)Sitzung, wie im Würfelspiel */
    const adresse = /^[A-Za-z0-9_ÄÖÜäöüß]{3,20}$/.test(n) ? await rpc<string | null>("rpg_login_email", { p_handle: n }) : null; if (!adresse) throw new Error("Benutzername oder Passwort ist falsch.");
    const { error } = await d.auth.signInWithPassword({ email: adresse, password: pw }); if (error) throw new Error(/invalid/i.test(error.message) ? "Benutzername oder Passwort ist falsch." : error.message);
    try { sessionStorage.removeItem("ez__neu"); } catch { /* privat */ } location.reload();
  } catch (e) { m.textContent = (e as Error).message; kn.disabled = false; }
}
async function abmelden() {
  clearTimeout(takt); await speichern(); const d = verbindung(); if (d) await d.auth.signOut();
  /* der Fortschritt gehört zum Konto: Auf dem Gerät bleibt nichts zurück, sonst landete er beim nächsten Anmelden in einem fremden Konto */
  name = ""; setze({}); try { roh.entfernen("ez__offen"); roh.entfernen("ez__version"); sessionStorage.removeItem("ez__neu"); sessionStorage.removeItem("ez__gefragt"); } catch { /* privat */ } location.replace("anmelden.html"); /* nach dem Abmelden zurück zur Anmeldeseite */
}
