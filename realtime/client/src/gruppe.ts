/*
 * Koop-Gruppen: Ein Spieler gründet eine Gruppe und bekommt einen Code aus sechs Buchstaben, bis zu zwei Freunde treten mit dem Code bei.
 * Der Anführer spielt die Kampagne. Betritt er einen Kampf, werden die Mitspieler aus der Waldmark oder ihrem Dorf mit hineingeholt.
 * Die Gruppe lebt auf dem Spielserver (nur im Arbeitsspeicher); hier im Browser steht nur, in welcher Gruppe man ist (sessionStorage).
 * Nur mit Konto: Der Server prüft die Anmeldung, und Fortschritt, Erfahrung und Seelensplitter bekommt jeder für sein eigenes Konto.
 */
import { HELDEN } from "../../shared/config";
import { SPIELSERVER } from "./netz";
import { kontoName, kontoToken, kontoRpc } from "./konto";

const $ = (s: string) => document.querySelector(s) as HTMLElement, P = new URLSearchParams(location.search);
export interface Gruppe { code: string; fuehrer: boolean }
interface Mitglied { name: string; held: string; fuehrer: boolean; bereit?: boolean }
/** Die Adresse des Spielservers (für Prüfungen über ?server= änderbar) */
export const serverAdresse = () => (P.has("server") ? P.get("server") || "" : SPIELSERVER);
/** In welcher Gruppe bin ich? */
export function gruppe(): Gruppe | null { try { const g = JSON.parse(sessionStorage.getItem("ez__gruppe") || "null"); return g && /^[A-Z]{6}$/.test(g.code) ? { code: g.code, fuehrer: Boolean(g.fuehrer) } : null; } catch { return null; } }
function merke(g: Gruppe | null) { try { if (g) sessionStorage.setItem("ez__gruppe", JSON.stringify(g)); else sessionStorage.removeItem("ez__gruppe"); } catch { /* privat */ } }
const neuerCode = () => Array.from({ length: 6 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.floor(Math.random() * 24)]).join("");

let ws: WebSocket | null = null, liste: Mitglied[] = [], fehler = "", lauscher: (() => void) | null = null, laeuftKampf: { ort: string; karte: string } | null = null;
const held = () => { try { const t = JSON.parse(localStorage.getItem("ez_team") || "null"); if (t && HELDEN[t.held]) return t.held as string; const h = localStorage.getItem("ez_held") || ""; return HELDEN[h] ? h : "schildwaechter"; } catch { return "schildwaechter"; } };
/** Der Held, mit dem ich in der Gruppe spiele (im Aufbruchslager gewählt) */
export const koopHeld = () => { try { const h = sessionStorage.getItem("ez__koopheld") || ""; if (HELDEN[h]) return h; } catch { /* privat */ } return held(); };
const koopHeldSetzen = (h: string) => { try { sessionStorage.setItem("ez__koopheld", h); } catch { /* privat */ } };
let lagerOrt: string | null = null, lagerOffen = false;

/* ---------- Gemeinsames Dorf: Die Gruppe reist mit dem Anführer, sieht sich gegenseitig und teilt den Questfortschritt ---------- */
/** Zusatz an Adressen, damit Prüfungen mit ?server= weiterlaufen */
export const serverZusatz = () => (P.has("server") ? "&server=" + encodeURIComponent(P.get("server") || "") : "");
/** Bin ich als Mitspieler im Dorf des Anführers? (dann gilt sein Fortschritt, nicht meiner) */
export const mitreise = () => P.get("mitreise") === "1" && Boolean(gruppe()) && !gruppe()!.fuehrer;
/** Der zuletzt bekannte Fortschritt der Gruppe in einem Ort (für Mitspieler; kommt vom Server) */
export function gruppenMerker(ort: string): Record<string, boolean> { try { const s = JSON.parse(sessionStorage.getItem("ez__mitmerker") || "null"); return s && s.ort === ort && s.merker ? s.merker : {}; } catch { return {}; } }
const mitMerken = (ort: string, merker: Record<string, boolean>) => { try { sessionStorage.setItem("ez__mitmerker", JSON.stringify({ ort, merker })); } catch { /* privat */ } };
export interface DorfHand { merker(m: Record<string, boolean>): void; pos(n: string, held: string, x: number, y: number, f: boolean, l: boolean): void; weg(n: string): void; sage(von: string, id: string, setzt: string): void; tuer(kampf: string, von: string): void }
let dorfHand: DorfHand | null = null, dorfOrt = "", warteschlange: object[] = [];
/** Nachricht an die Gruppe (wartet, bis die Verbindung steht) */
export function dorfSende(m: object) { if (!gruppe()) return; if (ws && ws.readyState === 1 && angemeldet) ws.send(JSON.stringify(m)); else { warteschlange.push(m); if (warteschlange.length > 20) warteschlange.shift(); } }
/** Das Dorf meldet sich an: Der Anführer sagt der Gruppe, wo sie ist; alle bekommen Fortschritt, Positionen, Gespräche */
export function dorfAnmelden(ort: string, merker: Record<string, boolean>, hand: DorfHand) { dorfHand = hand; dorfOrt = ort; const g = gruppe(); if (g && g.fuehrer) dorfSende({ t: "ort", ort, merker }); }
/** Ein Mitspieler geht selbst heim: bis der Anführer woanders hinreist, nicht zurückholen */
export function mitPause(ort: string) { try { sessionStorage.setItem("ez__mitpause", ort); } catch { /* privat */ } }
/** Der Anführer bringt die Gruppe zurück in die Waldmark */
export function dorfVerlassen() { const g = gruppe(); if (g && g.fuehrer && ws && ws.readyState === 1) ws.send(JSON.stringify({ t: "ort", ort: null })); }
let angemeldet = false;

/** Mit dem Wartebereich der Gruppe verbinden (in Waldmark und Dorf). Der Anführer sieht, wer da ist; Mitspieler werden geholt, sobald ein Kampf beginnt. */
export async function gruppeVerbinden() {
  const g = gruppe(), basis = serverAdresse(); if (!g || !basis || ws) { anzeigen(); return; }
  const token = await kontoToken(); if (!token) { fehler = "Koop geht nur mit Konto."; anzeigen(); return; }
  const s = new WebSocket(basis + "?raum=" + g.code + "&warte=1" + (g.fuehrer ? "&fuehrer=1" : "")); ws = s;
  s.onopen = () => { s.send(JSON.stringify({ t: "anmeldung", token, name: kontoName() || "Held", held: koopHeld() })); setTimeout(() => { if (ws !== s || s.readyState !== 1) return; angemeldet = true; for (const m of warteschlange.splice(0)) s.send(JSON.stringify(m)); }, 1500); /* nach der Prüfung der Anmeldung */ };
  s.onmessage = (ev) => { let m: { t: string; mitglieder?: Mitglied[]; ort?: string | null; kampf?: string | { ort: string; karte: string } | null; merker?: Record<string, boolean>; n?: string; held?: string; x?: number; y?: number; f?: number; l?: number; von?: string; id?: string; setzt?: string }; try { m = JSON.parse(String(ev.data)); } catch { return; }
    if (m.t === "gruppe" && !angemeldet) { angemeldet = true; for (const q of warteschlange.splice(0)) s.send(JSON.stringify(q)); }
    if (m.t === "ort" && !g.fuehrer) { /* der Anführer ist in ein Dorf gereist (oder heim) */
      if (!m.ort) { if (P.get("mitreise") === "1") location.href = "./?von=tor" + serverZusatz(); return; }
      mitMerken(m.ort, m.merker || {}); let pause = ""; try { pause = sessionStorage.getItem("ez__mitpause") || ""; } catch { /* privat */ } if (pause === m.ort && !P.get("ort")) return; /* selbst heimgegangen: erst beim nächsten Ort oder Kampf wieder mit */
      if (P.get("ort") === m.ort && P.get("mitreise") === "1" && !P.get("kampf")) { if (dorfHand) dorfHand.merker(m.merker || {}); }
      else if (!P.get("kampf")) location.href = "./?ort=" + encodeURIComponent(m.ort) + "&mitreise=1" + serverZusatz(); return; }
    if (m.t === "merker" && m.merker) { if (!g.fuehrer && dorfOrt) mitMerken(dorfOrt, m.merker); if (dorfHand) dorfHand.merker(m.merker); return; }
    if (m.t === "pos" && dorfHand && m.n) { dorfHand.pos(m.n, m.held || "schildwaechter", Number(m.x), Number(m.y), Boolean(m.f), Boolean(m.l)); return; }
    if (m.t === "weg" && dorfHand && m.n) { dorfHand.weg(m.n); return; }
    if (m.t === "sage" && dorfHand && m.von && m.id && m.setzt) { dorfHand.sage(m.von, m.id, m.setzt); return; }
    if (m.t === "tuer" && dorfHand && g.fuehrer && typeof m.kampf === "string") { dorfHand.tuer(m.kampf, m.von || ""); return; }
    if (m.t === "gruppe") { liste = m.mitglieder || []; fehler = ""; laeuftKampf = m.kampf && typeof m.kampf === "object" ? m.kampf : null;
      const ich = liste.find((q) => q.name === kontoName()); if (ich && HELDEN[ich.held]) koopHeldSetzen(ich.held); /* der Server vergibt jeden Helden nur einmal */
      const lg = (m as { lager?: string | null }).lager || null; if (!g.fuehrer && !P.get("ort")) { if (lg && !lagerOffen) lagerTafel({ ort: lg }, () => { /* nichts */ }); else if (!lg && lagerOffen) lagerSchliessen(); } lagerOrt = lg;
      anzeigen(); if (lauscher) lauscher(); }
    else if (m.t === "los" && !g.fuehrer && (() => { try { sessionStorage.removeItem("ez__mitpause"); } catch { /* privat */ } return true; })() && m.ort && typeof m.kampf === "string") { fehler = ""; hinein(m.ort, m.kampf); } };
  s.onclose = (ev) => { ws = null; angemeldet = false; if (ev.code === 4404) { fehler = "Diese Gruppe gibt es nicht (mehr)."; merke(null); } else if (ev.code === 4409) { fehler = ev.reason === "gruppe voll" ? "Die Gruppe ist voll (höchstens drei)." : "Dieser Code ist schon vergeben."; merke(null); } else if (ev.code === 4401) fehler = "Anmeldung nicht bestätigt – Koop geht nur mit Konto.";
    anzeigen(); if (lauscher) lauscher(); if (ev.code < 4400 && gruppe()) setTimeout(() => void gruppeVerbinden(), 4000); /* kurz weg: wieder verbinden */ };
}
/** Als Mitspieler in den Kampf des Anführers */
function hinein(ort: string, karte: string) { const g = gruppe(); if (!g) return; const s = serverZusatz(); location.href = "./?ort=" + encodeURIComponent(ort) + "&kampf=" + encodeURIComponent(karte) + "&raum=" + g.code + "&mitglied=1" + s; }

/** Kleines Schild unter dem Profil: Gruppe, wer da ist, und für Mitspieler „wartet auf …“ */
function anzeigen() { const el = document.getElementById("ez-gruppe"); if (!el) return; const g = gruppe(); el.hidden = !g && !fehler; if (el.hidden) return;
  const fuehrer = liste.find((m) => m.fuehrer);
  el.innerHTML = fehler && !g ? `<b>Koop</b><small>${fehler}</small>` : `<b>Gemeinsam unterwegs</b><small>${liste.length ? liste.map((m) => (m.fuehrer ? "♛ " : "") + m.name).join(" · ") : "verbinde …"}</small>`
    + (g && !g.fuehrer ? `<small class="warte">${laeuftKampf ? "Der Kampf läuft – du wirst geholt …" : mitreise() ? "Du reist mit " + (fuehrer ? fuehrer.name : "dem Anführer") + "." : "Du reist mit, sobald " + (fuehrer ? fuehrer.name : "der Anführer") + " aufbricht"}</small>` : g && liste.length < 2 ? `<small class="warte">Lade Freunde über „Zusammen spielen“ ein.</small>` : "") + (fehler && g ? `<small class="fehler">${fehler}</small>` : "");
  el.onpointerdown = (e) => e.stopPropagation(); el.onclick = (e) => { e.stopPropagation(); gruppenTafel(() => { /* nichts */ }); };
}

/* ---------- Freunde (dieselben wie im Würfelspiel) und Einladungen (Migration 037) ---------- */
interface Freunde { freunde: { handle: string }[]; an_mich: { handle: string }[]; von_mir: { handle: string }[] }
interface Einladung { id: string; von: string; code: string }
let freunde: Freunde | null = null, eingeladen = new Set<string>(), einladungen: Einladung[] = [], dbFehler = "";
async function freundeLaden() { try { freunde = await kontoRpc<Freunde>("rpg_my_friends"); dbFehler = ""; } catch (e) { dbFehler = (e as Error).message; } }
async function einladungenLaden() { try { einladungen = (await kontoRpc<Einladung[]>("rpg_echtzeit_einladungen")) || []; } catch { einladungen = []; } }
/** Eingehende Einladungen zeigen (alle 20 Sekunden nachsehen, solange man in Waldmark oder Dorf ist) */
let wacht = 0;
export function einladungenBeobachten() { if (wacht || !kontoName()) return; const sieh = async () => { await einladungenLaden(); hinweis(); }; void sieh(); wacht = window.setInterval(() => void sieh(), 20000); }
function hinweis() { const el = document.getElementById("ez-einladung"); if (!el) return; const e = einladungen.find((x) => !gruppe() || gruppe()!.code !== x.code); el.hidden = !e; if (!e) return;
  el.innerHTML = `<b>${e.von}</b> lädt dich zum gemeinsamen Spielen ein.<div><button type="button" data-a="ja">Mitspielen</button><button type="button" data-a="nein">Ablehnen</button></div>`;
  el.onpointerdown = (ev) => ev.stopPropagation(); el.onclick = (ev) => { ev.stopPropagation(); const a = (ev.target as HTMLElement).closest("[data-a]") as HTMLElement | null; if (!a) return; void annehmen(e, a.dataset.a === "ja"); }; }
async function annehmen(e: Einladung, ja: boolean) { try { await kontoRpc("rpg_echtzeit_einladung_weg", { p_id: e.id }); } catch { /* egal */ } einladungen = einladungen.filter((x) => x.id !== e.id);
  if (ja) { if (ws) { const s = ws; ws = null; s.onclose = null; s.close(); } merke({ code: e.code, fuehrer: false }); liste = []; fehler = ""; void gruppeVerbinden(); } hinweis(); if (lauscher) lauscher(); }

/** Die Tafel „Zusammen spielen“: Gruppe gründen, Freunde einladen, Einladungen annehmen, Freunde verwalten */
/** Die Gruppe verlassen oder auflösen (allein weiterspielen) */
export function gruppeAufloesen() { merke(null); liste = []; fehler = ""; if (ws) { const s = ws; ws = null; s.onclose = null; s.close(); } anzeigen(); }
/** Wer ist in meiner Gruppe? */
export const gruppenListe = () => liste.slice();
export function gruppenTafel(zu: () => void, auf?: { ort: string; los: () => void }) {
  const f = $("#ez-konto"); f.hidden = false; let meldung = "";
  const schliessen = () => { removeEventListener("keydown", esc, true); lauscher = null; f.hidden = true; f.innerHTML = ""; zu(); };
  const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); schliessen(); } }; addEventListener("keydown", esc, true);
  const zeichne = () => { const g = gruppe(), konto = Boolean(kontoName()), F = freunde, imKreis = new Set(liste.map((m) => m.name.toLowerCase()));
    const freundListe = F && F.freunde.length ? `<ul class="freunde">${F.freunde.map((x) => `<li><b>${x.handle}</b>${g && g.fuehrer ? imKreis.has(x.handle.toLowerCase()) ? `<small class="da">in der Gruppe</small>` : `<button type="button" data-ein="${x.handle}">${eingeladen.has(x.handle) ? "erneut einladen" : "Einladen"}</button>` : ""}</li>`).join("")}</ul>` : `<p class="klein">${F ? "Noch keine Freunde. Füge unten jemanden über seinen Spielernamen hinzu." : "Freunde werden geladen …"}</p>`;
    f.innerHTML = `<div class="tafel menue gruppe"><i class="ecke a"></i><i class="ecke b"></i><i class="ecke c"></i><i class="ecke d"></i><button type="button" class="schliessen" data-t="zu" aria-label="Schließen">✕</button>
      <h2>${auf ? "Gemeinsam nach " + auf.ort : "Zusammen spielen"}</h2><div class="zier"></div>
      ${auf && g && g.fuehrer ? `<div class="liste"><button type="button" class="haupt" data-t="aufbrechen">Gemeinsam aufbrechen ▸ <small>(${Math.max(1, liste.length)} von 3 dabei)</small></button></div><p class="klein">Wer noch nicht da ist, kommt nach, sobald er die Einladung annimmt.</p>` : ""}
      ${!konto ? `<p>Zusammen spielen geht nur mit Konto, damit jeder seinen Fortschritt behält.</p>` : `
        ${einladungen.length ? `<h3>Einladungen</h3><ul class="freunde">${einladungen.map((e) => `<li><b>${e.von}</b> <small>lädt dich ein</small><button type="button" data-ja="${e.id}">Mitspielen</button><button type="button" data-nein="${e.id}">✕</button></li>`).join("")}</ul>` : ""}
        ${g ? `<h3>Deine Gruppe</h3><ul class="mitglieder">${liste.map((m) => `<li>${m.fuehrer ? "♛ " : ""}<b>${m.name}</b> <small>${HELDEN[m.held] ? HELDEN[m.held].name : ""}</small></li>`).join("") || "<li><small>verbinde …</small></li>"}</ul>
          <p class="klein">${g.fuehrer ? "Lade bis zu zwei Freunde ein. Sobald du einen Kampf betrittst, kommen alle, die da sind, mit hinein." : "Sobald der Anführer einen Kampf betritt, wirst du geholt – egal, wo du gerade bist."}</p>
          ${fehler ? `<p class="fehler">${fehler}</p>` : ""}` : `<p>Spielt die Kampagnen zu zweit oder zu dritt. Einer führt und erlebt die Geschichte, die anderen kämpfen mit. Erfahrung, Seelensplitter und Siege bekommt jeder für sich.</p>
          ${fehler ? `<p class="fehler">${fehler}</p>` : ""}<div class="liste"><button type="button" data-t="neu">Gruppe gründen und Freunde einladen</button></div>`}
        <h3>Freunde</h3>${freundListe}
        ${F && F.an_mich.length ? `<h3>Freundschaftsanfragen</h3><ul class="freunde">${F.an_mich.map((x) => `<li><b>${x.handle}</b><button type="button" data-fja="${x.handle}">Annehmen</button><button type="button" data-fnein="${x.handle}">✕</button></li>`).join("")}</ul>` : ""}
        ${F && F.von_mir.length ? `<p class="klein">Angefragt: ${F.von_mir.map((x) => x.handle).join(", ")}</p>` : ""}
        <div class="beitreten"><input type="text" maxlength="24" placeholder="Spielername" autocomplete="off" spellcheck="false"><button type="button" data-t="anfrage">Hinzufügen</button></div>
        ${meldung ? `<p class="klein meldung">${meldung}</p>` : ""}${dbFehler ? `<p class="fehler">Freunde konnten nicht geladen werden.</p>` : ""}
        ${g ? `<div class="liste"><button type="button" data-t="raus">${g.fuehrer ? "Gruppe auflösen" : "Gruppe verlassen"}</button></div>` : ""}`}
      <p class="klein">Deine Freunde sind dieselben wie im Würfelspiel. Du nimmst deinen Helden aus „Mein Team“ mit.</p></div>`;
    const inp = f.querySelector("input") as HTMLInputElement | null; if (inp) inp.onkeydown = (e) => { e.stopPropagation(); if (e.key === "Enter") (f.querySelector('[data-t="anfrage"]') as HTMLElement).click(); }; };
  lauscher = zeichne; zeichne(); if (kontoName()) void Promise.all([freundeLaden(), einladungenLaden()]).then(zeichne);
  const tun = async (fn: string, args: Record<string, unknown>, ok: string) => { try { await kontoRpc(fn, args); meldung = ok; } catch (e) { meldung = (e as Error).message.replace(/^.*?: /, ""); } await freundeLaden(); zeichne(); };
  f.onpointerdown = (e) => e.stopPropagation(); f.onkeyup = (e) => e.stopPropagation();
  f.onclick = (e) => { const t = (e.target as HTMLElement).closest("[data-t],[data-ein],[data-ja],[data-nein],[data-fja],[data-fnein]") as HTMLElement | null; if (e.target === f) { schliessen(); return; } if (!t) return; const d = t.dataset;
    if (d.t === "zu") schliessen();
    else if (d.t === "aufbrechen" && auf) { removeEventListener("keydown", esc, true); lauscher = null; auf.los(); }
    else if (d.t === "neu") { fehler = ""; merke({ code: neuerCode(), fuehrer: true }); liste = []; eingeladen = new Set(); void gruppeVerbinden(); zeichne(); }
    else if (d.ein) { const g = gruppe(); if (!g) return; const h = d.ein; void kontoRpc("rpg_echtzeit_einladen", { p_handle: h, p_code: g.code }).then(() => { eingeladen.add(h); meldung = h + " ist eingeladen."; zeichne(); }, (er: Error) => { meldung = /function|does not exist|schema cache/i.test(er.message) ? "Einladungen sind noch nicht eingerichtet (Migration 037)." : er.message.replace(/^.*?: /, ""); zeichne(); }); }
    else if (d.ja || d.nein) { const x = einladungen.find((q) => q.id === (d.ja || d.nein)); if (x) void annehmen(x, Boolean(d.ja)).then(zeichne); }
    else if (d.fja || d.fnein) void tun("rpg_answer_friend", { p_handle: d.fja || d.fnein, p_accept: Boolean(d.fja) }, d.fja ? "Ihr seid jetzt Freunde." : "Anfrage abgelehnt.");
    else if (d.t === "anfrage") { const h = ((f.querySelector("input") as HTMLInputElement).value || "").trim(); if (h) void tun("rpg_request_friend", { p_handle: h }, "Anfrage an " + h + " geschickt."); }
    else if (d.t === "raus") { merke(null); liste = []; fehler = ""; if (ws) { const s = ws; ws = null; s.onclose = null; s.close(); } anzeigen(); zeichne(); } };
}
/* ---------- Aufbruchslager: alle wählen ihren Helden, melden sich bereit, dann bricht der Anführer auf ---------- */
let lagerSchliessen = () => { /* noch keins offen */ };
export function lagerTafel(auf: { ort: string; los?: () => void }, zu: () => void) {
  const f = $("#ez-konto"); f.hidden = false; lagerOffen = true; let meldung = ""; const name = auf.ort.charAt(0).toUpperCase() + auf.ort.slice(1);
  const schliessen = () => { removeEventListener("keydown", esc, true); lauscher = null; lagerOffen = false; f.hidden = true; f.innerHTML = ""; zu(); }; lagerSchliessen = schliessen;
  const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); abbrechen(); } }; addEventListener("keydown", esc, true);
  const abbrechen = () => { const g = gruppe(); if (g && g.fuehrer) dorfSende({ t: "lager", ort: null }); else gruppeAufloesen(); schliessen(); };
  const zeichne = () => { const g = gruppe(), ich = kontoName(), meinHeld = koopHeld(), vergeben = new Map(liste.filter((q) => q.name !== ich).map((q) => [q.held, q.name])), mich = liste.find((q) => q.name === ich);
    const andere = liste.filter((q) => !q.fuehrer), alleBereit = andere.length > 0 && andere.every((q) => q.bereit), F = freunde, imKreis = new Set(liste.map((q) => q.name.toLowerCase()));
    f.innerHTML = `<div class="tafel breit lager gruppe"><i class="ecke a"></i><i class="ecke b"></i><i class="ecke c"></i><i class="ecke d"></i><button type="button" class="schliessen" data-t="ab" aria-label="Abbrechen">✕</button>
      <h2>Aufbruch nach ${name}</h2><div class="zier"></div>
      <h3>Wähle deinen Helden</h3><div class="bildnisse">${Object.keys(HELDEN).map((k) => { const wer = vergeben.get(k); return `<button type="button" data-held="${k}" class="${k === meinHeld ? "an" : ""}${wer ? " vergeben" : ""}"${wer ? " disabled" : ""}><img src="../${HELDEN[k].bild}" alt="${HELDEN[k].name}"><small>${wer ? wer : HELDEN[k].name}</small></button>`; }).join("")}</div>
      <h3>Die Gruppe</h3><ul class="mitglieder">${liste.map((q) => `<li class="${q.bereit || q.fuehrer ? "bereit" : ""}">${q.fuehrer ? "♛ " : ""}<b>${q.name}</b> <small>${HELDEN[q.held] ? HELDEN[q.held].name + " · " + HELDEN[q.held].klasse : ""}</small><em>${q.fuehrer ? "führt" : q.bereit ? "✓ bereit" : "wählt …"}</em></li>`).join("") || "<li><small>verbinde …</small></li>"}</ul>
      ${g && g.fuehrer ? `${F && F.freunde.length ? `<h3>Freunde einladen</h3><ul class="freunde">${F.freunde.map((x) => `<li><b>${x.handle}</b>${imKreis.has(x.handle.toLowerCase()) ? `<small class="da">dabei</small>` : `<button type="button" data-ein="${x.handle}">${eingeladen.has(x.handle) ? "erneut einladen" : "Einladen"}</button>`}</li>`).join("")}</ul>` : `<p class="klein">${F ? "Noch keine Freunde – füge sie im Menü unter „Zusammen spielen“ hinzu." : "Freunde werden geladen …"}</p>`}` : ""}
      ${meldung ? `<p class="klein meldung">${meldung}</p>` : ""}${fehler ? `<p class="fehler">${fehler}</p>` : ""}
      <div class="reihe">${g && g.fuehrer ? `<button type="button" class="haupt" data-t="los"${alleBereit ? "" : " disabled"}>Gemeinsam aufbrechen ▸</button>` : `<button type="button" class="haupt" data-t="bereit">${mich && mich.bereit ? "Doch noch nicht bereit" : "Ich bin bereit"}</button>`}<button type="button" data-t="ab">${g && g.fuehrer ? "Abbrechen" : "Gruppe verlassen"}</button></div>
      <p class="klein">${g && g.fuehrer ? (andere.length ? (alleBereit ? "Alle sind bereit." : "Warte, bis alle bereit sind.") : "Lade mindestens einen Freund ein – oder brich allein auf der Weltkarte auf.") : "Wenn alle bereit sind, bricht der Anführer auf und du reist mit."}</p></div>`; };
  lauscher = zeichne; zeichne(); if (kontoName()) void freundeLaden().then(() => { if (lauscher === zeichne) zeichne(); });
  f.onpointerdown = (e) => e.stopPropagation(); f.onkeyup = (e) => e.stopPropagation(); f.onkeydown = (e) => e.stopPropagation();
  f.onclick = (e) => { const t = (e.target as HTMLElement).closest("[data-t],[data-held],[data-ein]") as HTMLElement | null; if (!t || (t as HTMLButtonElement).disabled) return; const d = t.dataset;
    if (d.held) { koopHeldSetzen(d.held); dorfSende({ t: "held", held: d.held }); zeichne(); }
    else if (d.ein) { const g = gruppe(); if (!g) return; const h = d.ein; void kontoRpc("rpg_echtzeit_einladen", { p_handle: h, p_code: g.code }).then(() => { eingeladen.add(h); meldung = h + " ist eingeladen."; zeichne(); }, (er: Error) => { meldung = /function|does not exist|schema cache/i.test(er.message) ? "Einladungen sind noch nicht eingerichtet (Migration 037)." : er.message.replace(/^.*?: /, ""); zeichne(); }); }
    else if (d.t === "bereit") { const mich = liste.find((q) => q.name === kontoName()); dorfSende({ t: "bereit", ja: !(mich && mich.bereit) }); }
    else if (d.t === "los" && auf.los) { removeEventListener("keydown", esc, true); lauscher = null; lagerOffen = false; auf.los(); }
    else if (d.t === "ab") abbrechen(); };
}
/** Für den Kampf: die Zusätze an die Serveradresse (Gruppe, Rolle) */
export function kampfZusatz(): string { const g = gruppe(); if (!g) return ""; return "&raum=" + g.code + (P.get("mitglied") === "1" ? "&mitglied=1" : ""); }
