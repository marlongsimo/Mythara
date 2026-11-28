/*
 * Schließt die offene Welt an das Spiel an: Die Waldmark der Welt ist der Ausgangspunkt (statt des gemalten Bildes, das unter ?stadt=bild bleibt).
 * Übernimmt, was die gemalte Waldmark (stadt.ts) kann:
 *   Heldenhalle, Weltkarte am Südtor, Riss, Menütafel, Rucksack und Ausrüstung, runde Minikarte mit Knöpfen, Held wechseln,
 *   gemeinsame Welt (Mitspieler mit Namen, Chat, Sprechblasen, Spielerliste und -karte), modulare Figuren,
 *   Freigaben (freigabe.ts: Kampagnen, Waldweg, Riss).
 * Rückkehr aus Kampagnen (?von=tor): vor dem Südtor auf dem Waldweg; nach einem Tod (?von=tod): in der Waldmark, mit Hinweis im Chat.
 * Positionen gehen relativ zur Region an den Server (Bildpunkte, wie seine Prüfung sie erwartet); der Server bleibt unverändert.
 */

import { fremdeArbeit } from "../arbeit";
import { SPIEL_SYMBOLE, SPIEL_SYMBOL_NAMEN } from "../../../shared/kartensymbole";
import { eigenesLevel } from "../skills";
import { WELT, Welt, weltDatei } from "./welt";
import { heldenhalle } from "../halle";
import { weltkarte } from "../weltkarte";
import { uebersicht } from "../uebersicht";
import { hudProfil, hudTitel, hudKarte, hudMenue, menueTafel, ZEICHEN } from "../hud";
import { wecken } from "../netz";
import { karteZoom, rundeKarte, karteFolgen, rahmenTasten, taschenTafel, questTafel, baldTafel, stilTab, seitenTab, skillTafel, ladenTafel, RKnopf } from "../rahmen";
import { leisteAufbauen, leisteOnline, boegenAufbauen, kartenBogen, rechteLeiste } from "../welt3d/oberflaeche";
import { LAEDEN } from "../../../shared/laden";
import { LAEDEN as LAEDEN_ECHT, LadenId, ladenOffen as ladenOffenB } from "../../../shared/laeden";
import { schalterAn as schalterAnB } from "../../../shared/quests";
import { ladenZeigen } from "../laden";
import { frei as freigabe } from "../freigabe";
import type { Fremder } from "../welt";
import { weltBetreten, weltPos, heldenLaden, Mitspieler, lokalerHeld, chatSystem, weltHeld, weltIch, spielerKarte, spielerListe, sprechblase, weltOnline, teleportFragen, betenBitten, questStandB } from "../welt";
import { heldenFigur, richten, blickVon, eigeneWaffenQuelle } from "../modulfigur";
import { CHUNK_PX, FELD_PX, HELD_PX } from "../../../shared/welt/typen";
import { stufeAusEp } from "../../../shared/config";
import { kontoName } from "../konto";
import { freundeTafel } from "../freunde";
import { epAlle } from "../halle";
import type Phaser from "phaser";
import { serverZusatz } from "../gruppe";
import { WeltKampf, WeltSzene, tastenFuellen, karteRahmen } from "./kampf";
import { WELTZONEN } from "../../../shared/karten";
import ORTSNAMEN from "../../../welt/ortsnamen.json"; /* Ortsnamen der Weltkarte (#90, Worldbuilding) */
import { aktiverHeld } from "../held";
import { angelegteEbenen } from "../inventar";

/** Name und Stufe über dem eigenen Helden: wie die anderen mich sehen (vom Server), sonst Konto- bzw. Gastname und die Stufe auf dem Gerät */
let schild: Phaser.GameObjects.Text | null = null;
export function schildText(held: string): string { const i = weltIch(); if (i) return i.gast ? i.name : `${i.name} · Lv ${i.stufe}`; return `${kontoName() || "Gast"} · Lv ${eigenesLevel(stufeAusEp(epAlle()[held] || 0))}`; }

type Wahl = (los: (held: string, mit: string[]) => void, zurueck: () => void, wort?: { los: string; zurueck: string }) => void;
const $ = (s: string) => document.querySelector(s) as HTMLElement;
const torOffen = () => freigabe("kampagnen") || freigabe("waldweg");

/** Was zur gemeinsamen Welt gehört, je Szene */
let mit: MitArt | null = null, region = { id: "", x: 0, y: 0, b: 1, h: 1 };

/** Was die Anbindung von einer Welt braucht – die 2D-Welt (Phaser, welt.ts) und die 3D-Welt (welt3d/spielwelt.ts) erfüllen es beide */
export interface WeltKern { gesperrt: boolean; hier: string; held: string; ort: { x: number; y: number }; pfad: { x: number; y: number }[]; laeuft: boolean; gemerkteStelle: boolean;
  halt(): void; profil(): void; /** eine Szene des Spiels starten (Riss) */ szeneStarten(key: string, daten: object): void; /** abblenden, danach weiter */ abblenden(ms: number, dann: () => void): void; /** Teleport-Abreise der eigenen Figur (Lichtsäule); zurück: Dauer in ms, 0 = sofort */ teleportAbreise(): number;
  /* nur die 3D-Welt: eigene Darstellung der Mitspieler, Sprechblase über dem eigenen Helden, Laufzeit, Versetzen, Blickwinkel */
  mitspielerNeu?(o: { versatz: { x: number; y: number }; karte: { breit: number; hoch: number } }): MitArt; eigeneBlase?(text: string): void; seit?(): number; versetzen?(x: number, y: number): void; blick?(): number;
  /** eigener Kampf (3D-Darstellung) */ kampfNeu?(region: string, wx: number, wy: number, gefallen: () => void, wartend: boolean): WeltKampf }
/** Darstellung der Mitspieler (2D: welt.ts Mitspieler, 3D: welt3d/mitspieler.ts) */
export interface MitArt { liste(l: Fremder[]): void; weg(id: number): void; blase(id: number, text: string): void; schritt(dt: number): void; unterPunkt?(px: number, py: number): Fremder | null; /** Folgen: Stelle eines Mitspielers (Weltfelder) nach Namen */ ortVon?(name: string): { x: number; y: number } | null }
/** Tafeln öffnen; die Welt steht still, solange eine offen ist */
function tafel(s: WeltKern, f: (zu: () => void) => void) { if (s.gesperrt) return; s.halt(); s.gesperrt = true; f(() => { s.gesperrt = false; }); }
export function oeffne(art: string, s: WeltKern) {
  if (s.gesperrt) return;
  if (art === "riss") { if (!freigabe("riss")) return; s.halt(); s.gesperrt = true; const wahl = (window as unknown as { EZ_WAHL: Wahl }).EZ_WAHL;
    wahl((held, gefolgt) => { try { localStorage.setItem("ez_held", held); } catch { /* privat */ } s.szeneStarten("spiel", { held, mit: gefolgt }); }, () => { s.gesperrt = false; }); }
  else if (art === "halle") tafel(s, (zu) => heldenhalle(() => { zu(); s.profil(); }));
  else if (art === "welt") { if (!torOffen()) { $("#ez-dorf-knopf").classList.add("bald"); return; }
    tafel(s, (zu) => weltkarte(() => { zu(); if (lokalerHeld() !== s.held) { location.reload(); return; } s.profil(); })); }
  else if (art === "menue") tafel(s, (zu) => menueTafel(() => { zu(); s.profil(); }));
  else if (art === "beten") betenBitten();   /* heilende Stelle (Kapelle): der Server antwortet im Chat */
  else if (art.startsWith("laden:") && art.slice(6) in LAEDEN_ECHT && !ladenOffenB(LAEDEN_ECHT[art.slice(6) as LadenId], (id) => questStandB(id), (x) => schalterAnB((id) => questStandB(id), x))) chatSystem(LAEDEN_ECHT[art.slice(6) as LadenId].zu || "Hier ist zu.");   /* Laden mit Bedingung (Bäckerei nach Quest A3) */
  else if (art.startsWith("laden:") && art.slice(6) in LAEDEN_ECHT) ladenZeigen(art.slice(6) as LadenId);   /* echter Laden mit Kauf auf dem Server (shared/laeden.ts) */
  else if (art.startsWith("laden:") && LAEDEN[art.slice(6)]) tafel(s, (zu) => ladenTafel(LAEDEN[art.slice(6)], () => { zu(); s.profil(); }));   /* Händler (shared/laden.ts) */
  else $("#ez-dorf-knopf").classList.add("bald");   /* „kommt noch“ */
}
/** Den Helden wechseln – nur in der Waldmark (der Server speichert ihn mit dem Konto) */
/** Helden wechseln geht nur in der Waldmark (der Server prüft es ebenso) */
const nurWaldmark = (s: WeltKern) => { if (s.hier === "waldmark") return true; const t = $("#ez-dorf-hilfe"); t.textContent = "Den Helden wechselst du nur in der Waldmark."; t.style.display = ""; chatSystem("Den Helden wechselst du nur in der Waldmark."); return false; };
/* Nach dem Wechsel lädt die Seite erst, wenn der Server den neuen Helden bestätigt („ich“) – sonst käme er beim Neuladen mit dem alten zurück; notfalls nach 3 s */
/** Aussehen und Startwaffe ändern: im Heldeneditor (nur in der Waldmark, wie früher der Heldenwechsel) */
function aussehenAendern(s: WeltKern) { if (s.gesperrt || !nurWaldmark(s)) return; s.halt(); s.gesperrt = true; location.href = "held.html?weiter=" + encodeURIComponent(location.search); }
function heldWaehlen(s: WeltKern) { if (s.gesperrt || !nurWaldmark(s)) return; s.halt(); s.gesperrt = true; const wahl = (window as unknown as { EZ_WAHL: Wahl }).EZ_WAHL;
  wahl((held) => { s.gesperrt = false; if (held === s.held) return; s.gesperrt = true; weltHeld(held); setTimeout(() => location.reload(), 3000); }, () => { s.gesperrt = false; }, { los: "Mit diesem Helden ziehen", zurueck: "Zurück" }); }
/** Teleport: von überall in der Welt zurück an den Start der Waldmark (die gemerkte Stelle gilt dann nicht mehr) */
/** Heim-Teleport: danach 5 Minuten Pause (auf dem Gerät gemerkt, übersteht das Neuladen nach dem Teleport) */
const TELEPORT_PAUSE_MS = 5 * 60 * 1000;
function teleportRest(): number { try { const t = Number(localStorage.getItem("ez_teleport_zuletzt")) || 0; return Math.max(0, t + TELEPORT_PAUSE_MS - Date.now()); } catch { return 0; } }
function teleport(s: WeltKern) { if (s.gesperrt) return; if (s.hier === "waldmark") { chatSystem("Du bist schon in der Waldmark – der Teleport bringt dich von überall hierher zurück."); return; }
  /* Mit Konto entscheidet der Server (je Konto 5 Minuten); Gäste und ohne Verbindung: der Zeitstempel auf dem Gerät */
  const nein = (rest: number) => { const m = Math.floor(rest / 60000), sek = Math.ceil((rest % 60000) / 1000) % 60; chatSystem(`Der Teleport sammelt noch Kraft – noch ${m > 0 ? `${m}:${String(sek).padStart(2, "0")} Minuten` : `${Math.max(1, sek)} Sekunden`}.`); };
  const lokal = () => { const rest = teleportRest(); if (rest > 0) { nein(rest); return; } los(); };
  const los = () => { try { localStorage.setItem("ez_teleport_zuletzt", String(Date.now())); } catch { /* privat */ } reise(s); };
  if (s.gesperrt) return; teleportFragen((ok, rest, gast) => { if (gast) lokal(); else if (ok) los(); else nein(rest); }, lokal); }
function reise(s: WeltKern) { if (s.gesperrt) return;
  s.halt(); s.gesperrt = true; try { localStorage.removeItem("ez_welt_pos"); } catch { /* privat */ }
  if (kampf) kampf.abreise(true); /* der Server gibt den Helden frei (kein Zurückholen an die alte Stelle) */
  const ms = s.teleportAbreise(); /* 3D-Held: Lichtsäule, er vergeht im Licht – erst danach abblenden */
  setTimeout(() => s.abblenden(300, () => { location.href = "./?von=teleport" + serverZusatz(); }), Math.max(0, ms - 250)); }
/** Kampf in der offenen Welt: in einem Kampfgebiet (WELTZONEN) bewegt der Spielserver den Helden, Gegner und Treffer erscheinen an Ort und Stelle */
let kampf: WeltKampf | null = null;
const randAbstand = (s: WeltKern, z: { x0: number; y0: number; b: number; h: number }) => Math.min(s.ort.x - z.x0, s.ort.y - z.y0, z.x0 + z.b - s.ort.x, z.y0 + z.h - s.ort.y);
/** Unter der Minimap: Sicherer Ort, Einzelkampf oder Mehrkampf – je nachdem, wo man steht */
let zoomJetzt = 2.2;
const KAMPFZEICHEN: Record<string, string> = {
  mehr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6-6M16 16l4 4M19 21l2-2"/><path d="M9.5 17.5 21 6V3h-3L6.5 14.5"/><path d="m11 19-6-6M8 16l-4 4M5 21l-2-2"/></svg>',
  einzel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6-6M16 16l4 4M19 21l2-2"/></svg>',
  sicher: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v5.5c0 4.4 3 7.8 7 9.5 4-1.7 7-5.1 7-9.5V6z"/><path d="M9 12l2 2 4-4"/></svg>' };
function kampfartZeigen(s: WeltKern) { let el = document.getElementById("ez-kampfart"); const r = document.getElementById("ez-kartenrahmen"); if (!r) return;
  if (!el) { el = document.createElement("div"); el.id = "ez-kampfart"; r.appendChild(el); }
  /* nur noch Solo (Einzelkampf) oder Multi (Mehrkampf) – auch die Waldmark gilt als Solo; keine Gegneranzahl (25.11.2026) */
  const art = (kampf && kampf.mehrkampf(s.ort.x, s.ort.y) ? "mehr" : "einzel") as string;
  if (el.dataset.art === art) return;
  el.dataset.art = art; el.className = art; r.dataset.art = art; /* auch die Farbe des Kartenrings zeigt es */
  el.innerHTML = `<span class="sym">${KAMPFZEICHEN[art]}</span><b>${art === "sicher" ? "Sicherer Ort" : art === "mehr" ? "Mehrkampf" : "Einzelkampf"}</b><i class="kurz">${art === "sicher" ? "Sicher" : art === "mehr" ? "Multi" : "Solo"}</i>`;
  el.title = art === "sicher" ? "Hier wird nicht gekämpft" : art === "mehr" ? "Viele gegen viele: mehrere Gegner können einen Helden angreifen und mehrere Helden einen Gegner" : "Einer gegen einen: Wer kämpft, kann von keinem Dritten angegriffen werden und greift keinen Dritten an"; }
function kampfEnde() { if (kampf) { kampf.ende(); kampf = null; } }
/** Der Held wird versetzt (Untergrund, Ausgang, gemerkte Stelle): in der einen Kampfwelt den Helden beim Server freigeben, dann neu verbinden – sonst holte die neue Verbindung ihn an die alte Stelle zurück */
function kampfVersetzt() { if (kampf) kampf.abreise(false); kampfEnde(); naechsterEnde(); }
/* für Prüfungen im Browser: das vorab verbundene Nachbargebiet */
Object.defineProperty(window, "EZN", { get: () => naechster, configurable: true });
/* für Prüfungen im Browser */
Object.defineProperty(window, "EZK", { get: () => kampf, configurable: true });
/** Abstand (Felder) von der Stelle zum Rechteck eines Kampfgebiets – 0, wenn man drin steht */
const abstandZu = (x: number, y: number, z: { x0: number; y0: number; b: number; h: number }) => Math.hypot(Math.max(z.x0 - x, 0, x - (z.x0 + z.b)), Math.max(z.y0 - y, 0, y - (z.y0 + z.h)));
const gefallen = () => { kampfEnde(); try { localStorage.removeItem("ez_welt_pos"); } catch { /* privat */ } location.href = "./?von=tod" + serverZusatz(); };
/** Vorverbinden: nähert sich der Held einem Kampfgebiet (unter 10 Feldern), meldet sich die Welt dort schon an und lädt die Gegnerfiguren –
    über die Grenze geht es dann ohne Halt. Entfernt er sich wieder (über 16 Felder), wird die Verbindung geschlossen. */
function vorverbinden(s: WeltKern) { if (!freigabe("suedtor") || s.gesperrt) return;
  if (kampf) { if (!kampf.eingetreten && abstandZu(s.ort.x, s.ort.y, kampf.zone) > 16) kampfEnde(); return; }
  const rid = naechstesGebiet(s, ""); if (rid) kampf = kampfNeu(s, rid, s.ort.x, s.ort.y, gefallen, true); }
/** Das nächstgelegene Kampfgebiet in weniger als 10 Feldern (außer dem, in dem man steht) */
function naechstesGebiet(s: WeltKern, ausser: string): string { let best = "", d = 10; const zu = WELTZONEN[ausser]; for (const [rid, z] of Object.entries(WELTZONEN)) { const a = abstandZu(s.ort.x, s.ort.y, z); if (rid !== ausser && z !== zu && a < d) { d = a; best = rid; } } return best; } /* Regionen derselben Kampfwelt zählen nicht als Nachbargebiet */
/* Zwischen zwei Kampfgebieten: Nähert sich der Held im Kampfgebiet der Grenze eines anderen (unter 10 Feldern), wird das Nachbargebiet
   schon vorab verbunden – beim Überschreiten der Grenze geht es ohne Halt weiter. Entfernt er sich wieder (über 16 Felder), wird es geschlossen. */
let naechster: WeltKampf | null = null;
function naechsterEnde() { if (naechster) { naechster.ende(); naechster = null; } }
function nachbarVorbereiten(s: WeltKern) { if (s.gesperrt) return;
  if (naechster) { if (naechster.zone !== WELTZONEN[s.hier] && abstandZu(s.ort.x, s.ort.y, naechster.zone) > 16) naechsterEnde(); return; }
  const rid = naechstesGebiet(s, s.hier); if (rid) naechster = kampfNeu(s, rid, s.ort.x, s.ort.y, gefallen, true); }
/** Bekommt die gewünschte Richtung; true = der Server bewegt (die Welt bewegt nicht selbst) */
/** Kampf anlegen: die 3D-Welt mit eigener Darstellung, die 2D-Welt wie bisher */
const kampfNeu = (s: WeltKern, rid: string, x: number, y: number, gef: () => void, wartend = false): WeltKampf => (s.kampfNeu ? s.kampfNeu(rid, x, y, gef, wartend) : new WeltKampf(s as unknown as WeltSzene, rid, x, y, gef, wartend));
function fremd(s: WeltKern, rx: number, ry: number): boolean {
  const z = WELTZONEN[s.hier]; if (!z || !freigabe("suedtor")) { if (kampf && kampf.eingetreten) kampfEnde(); if (!kampf && naechster) { kampf = naechster; naechster = null; } vorverbinden(s); return false; } const rand = randAbstand(s, z);
  if (kampf && kampf.zone !== z) kampfEnde(); /* Zonen Stufe 2: alle Regionen sind eine Kampfwelt – über Regionsgrenzen bleibt die Verbindung */
  if (!kampf && naechster && naechster.zone === z) { kampf = naechster; naechster = null; } /* das Nachbargebiet war schon verbunden */
  nachbarVorbereiten(s);
  if (!kampf) { if (rand < 2 || s.gesperrt) return false; kampf = kampfNeu(s, s.hier, s.ort.x, s.ort.y, gefallen); }
  if (!kampf.eingetreten) { const pf0 = (s as unknown as { pfad: { x: number; y: number }[] }).pfad; kampf.betreten(s.ort.x, s.ort.y, pf0.length ? pf0[pf0.length - 1] : null, [rx, ry]); } /* vorverbunden: jetzt hinein, ohne Wartezeit – mit dem Laufziel, damit der Server gleich weitergeht */
  if (!kampf.bereit && kampf.vorverbunden) return false; /* bis der Server den Helden meldet (Bruchteile einer Sekunde): selbst weiterlaufen */
  if (!kampf.bereit) { if (kampf.art === "warte") { const t = $("#ez-dorf-hilfe"); t.textContent = "Verbinde mit dem Spielserver …"; t.style.display = ""; } return true; } /* bis der Server antwortet, bleibt der Held stehen */
  /* am Rand des Gebiets und weiter hinaus: die Welt übernimmt wieder (etwa durchs Tor zurück in die Waldmark) */
  const lx = s.ort.x - z.x0, ly = s.ort.y - z.y0; if (rand < 1.2 && ((lx < 1.2 && rx < 0) || (ly < 1.2 && ry < 0) || (lx > z.b - 1.2 && rx > 0) || (ly > z.h - 1.2 && ry > 0))) { kampfEnde(); return false; }
  { const t = $("#ez-dorf-hilfe"); if (t.textContent === "Verbinde mit dem Spielserver …") { t.textContent = ""; t.style.display = "none"; } }
  const pf = (s as unknown as { pfad: { x: number; y: number }[] }).pfad; if (pf.length) { /* Tasten und Stick leeren den Weg der Welt vorher – dann wird selbst gesteuert */ const z = pf[pf.length - 1]; kampf.gehe(z.x, z.y); return true; } /* angetippt: der Server sucht den Weg */
  kampf.steuern(rx, ry); return true; }
/** Der Server kennt die zuletzt gemerkte Stelle (anderes Gerät): dorthin, wenn auf diesem Gerät keine gemerkt war und man noch nicht losgelaufen ist */
let serverStelleGenutzt = false;
function serverStelle(s: WeltKern, p: { region: string; x: number | null; y: number | null } | undefined) {
  if (serverStelleGenutzt || !p || s.gemerkteStelle || (s.seit ? s.seit() : (s as unknown as Welt).time.now) > 15000 || p.x === null || p.y === null) return; serverStelleGenutzt = true;
  const x = p.x, y = p.y; if (Math.hypot(x - s.ort.x, y - s.ort.y) < 1) return;
  if (s.versetzen) { s.versetzen(x, y); return; } s.ort = { x, y }; s.pfad = []; (s as unknown as Welt).cameras.main.centerOn(x * FELD_PX, y * FELD_PX); }
/** Oben neben der Profilanzeige: Spieler (wer ist hier, mit Zahl) und Einstellungen (Menü) */
function obenKnoepfe(s: WeltKern) { let el = document.getElementById("ez-oben-knoepfe"); if (!el) { el = document.createElement("div"); el.id = "ez-oben-knoepfe"; document.body.appendChild(el); }
  el.hidden = false; el.innerHTML = `<button type="button" data-o="spieler" aria-label="Spieler" title="Spieler hier (P)"><span>${ZEICHEN.helden}</span><em class="zahl" hidden></em></button><button type="button" data-o="menue" aria-label="Einstellungen" title="Einstellungen"><span>${ZEICHEN.menue}</span></button>`;
  el.onpointerdown = (e) => e.stopPropagation(); el.onclick = (e) => { e.stopPropagation(); const b = (e.target as HTMLElement).closest("[data-o]") as HTMLElement | null; if (!b) return; if (b.dataset.o === "spieler") tafel(s, spielerListe); else oeffne("menue", s); }; obenPlatz(); }
const GROSS = matchMedia("(min-width: 701px) and (min-height: 501px)");
/** Rechte Seite einpassen (Tablet und PC): die Menüleiste steht als Säule
    zwischen Karte (samt Kampf-Banner) und Aktionen, wenn sie dort Platz hat – sonst kompakt neben den Aktionen */
let menueSchluessel = "";
function menuePlatz() { const m = document.getElementById("ez-menue"), r = document.getElementById("ez-kartenrahmen"); if (!m || !r || m.hidden) return;
  if (!GROSS.matches) { if (menueSchluessel) { menueSchluessel = ""; document.body.classList.remove("menue-spalte"); m.style.top = ""; } return; } /* Handy: vorerst die bisherige Anordnung */
  let unten = r.getBoundingClientRect().bottom; for (const id of ["ez-kampfart", "ez-zoom"]) { const e = document.getElementById(id); if (e && e.offsetParent && r.contains(e)) unten = Math.max(unten, e.getBoundingClientRect().bottom); }
  const t = document.getElementById("ez-tasten"), tr = t ? t.getBoundingClientRect() : null, oben = tr && tr.height ? tr.top : innerHeight; /* fest positioniert: offsetParent ist immer null */
  const schluessel = `${innerWidth}x${innerHeight}:${Math.round(unten)}:${Math.round(oben)}:${m.childElementCount}`; if (schluessel === menueSchluessel) return; menueSchluessel = schluessel;
  document.body.classList.add("menue-spalte"); m.style.top = "0px"; const h = m.offsetHeight, frei = oben - unten, spalte = h + 36 <= frei; /* oben und unten je eine Zierspitze (14 px) und etwas Luft */
  document.body.classList.toggle("menue-spalte", spalte); m.style.top = spalte ? Math.round(unten + (frei - h) / 2) + "px" : ""; }
/** rechts neben die sichtbare Profilanzeige (im Kampfgebiet: Leben und Erfahrung) setzen */
function obenPlatz() { const el = document.getElementById("ez-oben-knoepfe"); if (!el) return; const p = document.querySelector(document.body.classList.contains("weltkampf") ? "#ez-ich" : "#ez-profil") as HTMLElement | null, r = p && p.getBoundingClientRect();
  if (!r || !r.width) return; const ban = document.querySelector("#ez-titel:not([hidden])") as HTMLElement | null, br = ban && ban.getBoundingClientRect(), kr = (document.querySelector("#ez-kartenrahmen .rknoepfe") as HTMLElement | null)?.getBoundingClientRect(), kl = kr && kr.width && kr.top < r.bottom ? kr.left : innerWidth,
    passt = (!br || !br.width || r.right + 10 + el.offsetWidth + 6 <= br.left) && r.right + 10 + el.offsetWidth + 6 <= kl;
  /* neben das Profil – reicht der Platz bis zum Ortsbanner nicht, direkt darunter an seine rechte Kante */
  const l = Math.round(passt ? r.right + 10 : r.right - el.offsetWidth) + "px", t = Math.round(passt ? r.top + (r.height - el.offsetHeight) / 2 : r.bottom + 8) + "px"; if (el.style.left !== l) el.style.left = l; if (el.style.top !== t) el.style.top = t; }
function onlineZeigen() { const z = document.querySelector("#ez-oben-knoepfe .zahl") as HTMLElement | null, n = weltOnline(); if (z) { z.hidden = n < 2; z.textContent = String(n); } leisteOnline(n); }

/** Minikarte für die Region, in der man steht: Maßstab und die Karten der Nachbarregionen rundherum */
function karteRegion(s: WeltKern, id: string, ux: number, uy: number, b: number, h: number) {
  region = { id, x: ux * CHUNK_PX, y: uy * CHUNK_PX, b: b * CHUNK_PX, h: h * CHUNK_PX }; karteRahmen({ x0: region.x / FELD_PX, y0: region.y / FELD_PX, b: region.b / FELD_PX, h: region.h / FELD_PX }); /* Gegnerpunkte des Kampfs relativ zu dieser Karte (#97) */
  zoomJetzt = Math.max(2.2, b * CHUNK_PX / FELD_PX / 40); karteZoom(zoomJetzt);
  /* Nachbarregionen auf der Minimap: ihre Karten an der richtigen Stelle um die aktuelle – der Kreis zeigt die Welt ohne Lücke */
  { const k = document.getElementById("ez-karte"), idx = (s as unknown as { index?: { regionen: Record<string, { region: { id: string; ursprung: number[]; chunks: number[] } }> } }).index;
    if (k && idx) { k.querySelectorAll("img.nachbar").forEach((e) => e.remove());
      for (const r of Object.values(idx.regionen)) { const R = r.region; if (R.id === id || WELT.gesperrteRegionen.includes(R.id)) continue;
        const im = document.createElement("img"); im.className = "nachbar"; im.alt = ""; im.src = weltDatei("karte-" + R.id + ".webp");
        Object.assign(im.style, { left: (100 * (R.ursprung[0] - ux) / b) + "%", top: (100 * (R.ursprung[1] - uy) / h) + "%", width: (100 * R.chunks[0] / b) + "%", height: (100 * R.chunks[1] / h) + "%" }); k.prepend(im); } } } /* der Kreis zeigt etwa 40 Felder: die Karte scrollt beim Laufen sichtbar mit */
}
/** Die gemeinsame Welt für die Region, in der man steht: Mitspieler neu aufstellen und beim Server den Ort melden */
function regionBetreten(s: WeltKern, id: string, ux: number, uy: number, b: number, h: number) {
  if (region.id === id && mit) return;
  if (mit) mit.liste([]);
  karteRegion(s, id, ux, uy, b, h);
  mit = s.mitspielerNeu ? s.mitspielerNeu({ versatz: { x: region.x, y: region.y }, karte: { breit: region.b, hoch: region.h } }) : new Mitspieler(s as unknown as Welt, { f: 1, gross: HELD_PX, tiefe: (y) => y + region.y, karte: { breit: region.b, hoch: region.h }, versatz: { x: region.x, y: region.y } });
  (s as unknown as { mit: MitArt | null }).mit = mit;   /* für Prüfungen sichtbar, wie in der gemalten Waldmark */
  weltBetreten(id, { spieler: (l) => { fremdeArbeit(l); /* #67: auch für die Helden im Kampfgebiet */ if (mit) mit.liste(WELTZONEN[id] && freigabe("suedtor") ? [] : l); onlineZeigen(); }, /* in der Kampfwelt zeigt der Kampf die anderen Helden (vor dem Südtor gibt es keinen Kampf: dann die Welt) */ fort: (i) => { if (mit) mit.weg(i); },
    ich: (i) => { if (i.held !== s.held) { location.reload(); return; } serverStelle(s, i.pos); },
    blase: (i, text, von) => { const ich = weltIch(); if (ich && i === ich.id) { if (s.eigeneBlase) s.eigeneBlase(text); else { const w = s as unknown as Welt; sprechblase(w, () => (w.figur && w.figur.active ? { x: w.figur.x, y: w.figur.y - HELD_PX - 30 } : null), text); } } else { const k = kampf as unknown as { blaseHeld?: (n: string, t: string) => boolean } | null; if (!(von && k && k.blaseHeld && k.blaseHeld(von, text)) && mit) mit.blase(i, text); } } }); /* in der Kampfwelt zeigt der Kampf die anderen Helden: die Blase dort (#68) */
}

/** Die Übersichtskarte öffnen: Regionen aus dem Weltindex (gesperrte sind dort schon entfernt), die eigene Stelle läuft mit */
function karteZeigen(s: WeltKern) {
  const idx = (s as unknown as { index?: { chunkFelder: number; regionen: Record<string, { region: { id: string; name: string; ursprung: number[]; chunks: number[] } }> } }).index; if (!idx) return;
  uebersicht({ daten: WELT.daten, stand: WELT.stand, chunkFelder: idx.chunkFelder || 32, symbolNamen: { ...SPIEL_SYMBOL_NAMEN, ...((idx as unknown as { kartensymbole?: Record<string, string> }).kartensymbole || {}) }, symbolBild: WELT.bild + "img/karte/symbole/", regionen: Object.values(idx.regionen).map((r) => ({ ...r.region, symbole: [...((r as unknown as { symbole?: { s: string; x: number; y: number }[] }).symbole || []), ...SPIEL_SYMBOLE.filter((q) => q.region === r.region.id)] })).filter((R) => !WELT.gesperrteRegionen.includes(R.id) && !(R as { ebene?: string }).ebene),
    ich: () => (s.ort ? { x: s.ort.x, y: s.ort.y } : null), hier: () => s.hier, namen: ORTSNAMEN });
}

/** Menüs, runde Karte mit Knöpfen, Tasten und die Knöpfe oben – für die 2D- und die 3D-Welt */
export function menueEinrichten(s: WeltKern) {
    if (document.body.classList.contains("welt3d")) { menue3D(s); return; }
    const rucksack = () => tafel(s, (zu) => taschenTafel("rucksack", s.held, zu)), ausruestung = () => tafel(s, (zu) => taschenTafel("ausruestung", s.held, zu));
    /* Unter der Karte: was gerade freigeschaltet ist – Weltkarte und Quests gehören zu den Kampagnen */
    const knoepfe: RKnopf[] = [];
    /* Karte: die ganze bekannte Welt von oben (alle Regionen aus welt.json – neue Gebiete erscheinen von selbst) */
    knoepfe.push({ name: "Karte", zeichen: "karte", taste: torOffen() ? "K" : "M", tat: () => karteZeigen(s) });
    if (torOffen()) knoepfe.push({ name: "Weltkarte", zeichen: "karte", taste: "M", tat: () => oeffne("welt", s) });
    if (freigabe("kampagnen")) knoepfe.push({ name: "Quests", zeichen: "quests", taste: "L", tat: () => tafel(s, questTafel) });
    knoepfe.push({ name: "Teleport", zeichen: "teleport", taste: "T", tat: () => teleport(s) }, { name: "Aussehen", zeichen: "held", taste: "H", tat: () => aussehenAendern(s) });
    rundeKarte(zoomJetzt, knoepfe); tastenFuellen(s.held); rahmenTasten({ b: rucksack, i: rucksack, c: ausruestung, p: () => tafel(s, spielerListe) }); obenKnoepfe(s); onlineZeigen();
    hudMenue([{ name: "Rucksack", zeichen: "rucksack", tat: rucksack }, { name: "Ausrüstung", zeichen: "ausruestung", tat: ausruestung }]); /* Spieler und Einstellungen sitzen oben neben dem Profil */
    if (!new URLSearchParams(location.search).has("server")) wecken(); /* Riss und Kampagnen brauchen den Server – schon jetzt aufwecken */
}
/** 3D-Welt: Chat links oben, darunter die Leiste (Angriffsstil, Quests, Rucksack, Ausrüstung, Skills, Freunde, Einstellungen);
    an der Minikarte nur Karte und Sprint, rechts um die Karte Lebenspunkte und die gelbe Leiste. Teleport, Aussehen, Weltkarte und Quests bleiben auf ihren Tasten. */
let karteMedien = false, zuFreundS: WeltKern | null = null;
/** Teleport zu einem Freund (der Server hat erlaubt: online, nicht im Kampf, Gebiet freigeschaltet): Lichtsäule, dann dort auftauchen */
addEventListener("ez-zufreund", (e) => { const s = zuFreundS, m = (e as CustomEvent).detail as { n: string; x: number; y: number }; const w = s as unknown as { springen?: (x: number, y: number) => void } | null;
  if (!s || !w || !w.springen) return; (document.querySelector("#ez-konto .tafel.freunde .schliessen") as HTMLElement | null)?.click(); /* erst das Freunde-Fenster schließen – solange es offen ist, ist der Held gesperrt */
  if (s.gesperrt) return; chatSystem(`Teleport zu ${m.n} …`);
  const ms = s.teleportAbreise(); setTimeout(() => w.springen!(m.x, m.y), Math.max(0, ms - 250)); });
/** Wegstein (Phase 3a): der Server hat geprüft, eine Ladung abgezogen und die Stelle gesetzt – hier nur Lichtsäule und Sprung dorthin */
addEventListener("ez-wegstein", (e) => { const m = (e as CustomEvent).detail as { ok?: boolean; text?: string; name?: string; x?: number; y?: number; ladungen?: number };
  if (!m.ok || typeof m.x !== "number" || typeof m.y !== "number") { chatSystem(m.text || "Der Stein bleibt kalt."); return; }
  const s = zuFreundS, w = s as unknown as { springen?: (x: number, y: number) => void } | null; if (!s || !w || !w.springen) return;
  (document.querySelector("#ez-konto .tafel .schliessen") as HTMLElement | null)?.click();
  chatSystem((m as { reisekarte?: boolean }).reisekarte ? `Die Reisekarte bringt dich nach ${m.name || "Hause"} – der freie Sprung für heute ist verbraucht.` : `Du reibst den Wegstein … er bringt dich nach ${m.name || "Hause"}. (${m.ladungen ?? 0} Ladung${m.ladungen === 1 ? "" : "en"} übrig)`);
  const x = m.x, y = m.y, ms = s.teleportAbreise(); setTimeout(() => w.springen!(x, y), Math.max(0, ms - 250)); });
/* Fähre (#49): kurze Überfahrt (Blende mit Text), dann springt der Held ans andere Ufer – die Stelle hat der Server schon gesetzt */
addEventListener("ez-faehre", (e) => { const m = (e as CustomEvent).detail as { ok?: boolean; text?: string; von?: string; nach?: string; x?: number; y?: number; dauer?: number };
  if (!m.ok || typeof m.x !== "number" || typeof m.y !== "number") { chatSystem(m.text || "Die Fähre legt nicht ab."); return; }
  const s = zuFreundS, w = s as unknown as { springen?: (x: number, y: number) => void } | null; if (!s || !w || !w.springen) return;
  const x = m.x, y = m.y, ms = Math.max(1000, (m.dauer || 3) * 1000); chatSystem(`Die Fähre legt ab – hinüber zum ${m.nach || "anderen Ufer"} …`);
  const b = document.createElement("div"); b.className = "ez-ueberfahrt"; b.textContent = `Überfahrt zum ${m.nach || "anderen Ufer"} …`;
  b.style.cssText = "position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(10,18,28,.0);color:#e8eef5;font:600 20px/1.4 system-ui,sans-serif;transition:background .6s;pointer-events:none";
  document.body.appendChild(b); requestAnimationFrame(() => { b.style.background = "rgba(10,18,28,.92)"; });
  setTimeout(() => w.springen!(x, y), ms - 400); setTimeout(() => { b.style.background = "rgba(10,18,28,0)"; b.textContent = ""; setTimeout(() => b.remove(), 700); }, ms); });
function menue3D(s: WeltKern) { zuFreundS = s;
    const rucksack = () => { if (!seitenTab("rucksack")) tafel(s, (zu) => taschenTafel("rucksack", s.held, zu, true)); }, ausruestung = () => { if (!seitenTab("ausruestung")) tafel(s, (zu) => taschenTafel("ausruestung", s.held, zu, true)); }; /* mit eigenem Held: Tabs neben der Leiste */
    const knoepfe: RKnopf[] = [{ name: "Karte", zeichen: "karte", taste: "K", tat: () => karteZeigen(s) }, { name: "Sprint", zeichen: "sprint", taste: "Umschalt", tat: () => { const w = s as unknown as { sprint?: () => void }; if (w.sprint) w.sprint(); else chatSystem("Sprinten geht in der 3D-Welt."); } }];
    /* links an der Karte: Teleport, Spieler online, Einstellungen – am PC im Halbmond-Dock mit Karte und Sprint, am Handy auf einem Bogen links an der Karte */
    const links = [{ id: "teleport", name: "Teleport", zeichen: "teleport" as const, taste: "T", tat: () => teleport(s) }, { id: "spieler", name: "Freunde", zeichen: "spieler" as const, taste: "P", tat: () => { if (kontoName()) tafel(s, freundeTafel); else tafel(s, spielerListe); } }, /* Freunde in der Bildschirmmitte (ersetzt „Spieler online“); Gäste sehen weiter, wer hier ist */
      { id: "einstellungen", name: "Einstellungen", zeichen: "einstellungen" as const, tat: () => oeffne("menue", s) }];
    /* seit 25.11.2026: keine Knöpfe mehr an der Minikarte – alle in der rechten Leiste unten rechts (PC, iPad, Handy gleich) */
    const karteKnoepfe = () => { rundeKarte(zoomJetzt, []); kartenBogen([]);
      rechteLeiste([{ id: "karte", ...knoepfe[0] }, { id: "sprint", ...knoepfe[1] }, ...links]); onlineZeigen(); };
    karteKnoepfe(); if (!karteMedien) { karteMedien = true; GROSS.addEventListener("change", karteKnoepfe); }
    boegenAufbauen(); tastenFuellen(s.held);
    const tasten: Record<string, () => void> = { b: rucksack, i: rucksack, c: ausruestung, p: () => tafel(s, spielerListe), t: () => teleport(s), h: () => aussehenAendern(s) };
    if (torOffen()) tasten.m = () => oeffne("welt", s); else tasten.m = () => karteZeigen(s);
    if (freigabe("kampagnen")) tasten.l = () => tafel(s, questTafel);
    rahmenTasten(tasten);
    leisteAufbauen([
      { id: "stil", name: "Angriffsstil", zeichen: "schwerter", tat: () => stilTab() },
      { id: "quests", name: "Quests", zeichen: "quest", tat: () => { seitenTab("quests"); } },
      { id: "rucksack", name: "Rucksack", zeichen: "rucksack", taste: "B", tat: rucksack },
      { id: "ausruestung", name: "Ausrüstung", zeichen: "ausruestung", taste: "C", tat: ausruestung },
      { id: "skills", name: "Skills", zeichen: "skills", tat: () => { if (!seitenTab("skills")) tafel(s, skillTafel); } }]);
    onlineZeigen();
    if (!new URLSearchParams(location.search).has("server")) wecken();
}
/** Was beim Betreten jeder Welt gilt (2D und 3D): Hinweis nach einem Tod, Heldenwahl im Profil, Menü rechts als Spalte, Hinweis „sicherer Ort“. Zurück: Aufräumen */
function betretenAllgemein(s: WeltKern): () => void {
    const q = new URLSearchParams(location.search);
    if (q.get("von") === "tod") { setTimeout(() => chatSystem("Du bist gefallen und in der Waldmark wieder zu dir gekommen."), 300); q.delete("von"); history.replaceState(null, "", "?" + q.toString()); }
    const heldWahl = (ev: Event) => { const h = String((ev as CustomEvent).detail || ""); if (!h || h === s.held) return; ev.preventDefault(); if (!nurWaldmark(s)) return; s.gesperrt = true; weltHeld(h); setTimeout(() => location.reload(), 3000); };
    window.addEventListener("ez-held-wahl", heldWahl);
    document.body.classList.add("offenewelt"); /* Menü rechts als Spalte, Kampfsteuerung immer sichtbar */
    const ruhig = (ev: Event) => { if (kampf || !(ev.target as HTMLElement).closest("#ez-tasten")) return; const t = $("#ez-dorf-hilfe"); t.textContent = "Hier ist ein sicherer Ort – gekämpft wird draußen, etwa im Kreuzwald hinter dem Südtor."; t.style.display = ""; };
    document.addEventListener("pointerdown", ruhig, true);
    return () => { document.body.classList.remove("offenewelt"); document.removeEventListener("pointerdown", ruhig, true); window.removeEventListener("ez-held-wahl", heldWahl); };
}
/** Die 3D-Welt (welt3d/spielwelt.ts) an das Spiel anschließen: dieselben Menüs, Tafeln, Minikarte und Hinweise wie die 2D-Welt */
export const anschluss3D = {
  tat: oeffne, knopf: (art: string, knopf: string): string => (WELT.knopf ? WELT.knopf(art, knopf) : knopf), menue: menueEinrichten, betreten: betretenAllgemein,
  regionWechsel: (s: WeltKern, R: { id: string; ursprung: number[]; chunks: number[] }) => regionBetreten(s, R.id, R.ursprung[0], R.ursprung[1], R.chunks[0], R.chunks[1]),
  schritt: (s: WeltKern, dt: number) => { kampfartZeigen(s); menuePlatz(); obenPlatz(); const px = s.ort.x * FELD_PX - region.x, py = s.ort.y * FELD_PX - region.y; karteFolgen(px / region.b, py / region.h);
    if (kampf) kampf.schritt(dt); if (mit) { weltPos(px, py, s.blick ? s.blick() : 0, s.laeuft, s.ort.x, s.ort.y); mit.schritt(dt); } },
  /** Kampfgebiet: true = der Server bewegt den Helden (wie WELT.fremd in der 2D-Welt) */
  fremd: (s: WeltKern, rx: number, ry: number): boolean => fremd(s, rx, ry),
  /** Antippen eines Bodenpunkts (Weltfelder) im Kampf: ein Gegner wird zum Ziel. true = erledigt */
  /** Einen bestimmten Gegner angreifen (Aktionsmenü: er kann seit dem Öffnen weitergelaufen sein) */
  kampfZiel: (id: number): void => { if (kampf && kampf.bereit && kampf.netz) kampf.netz.sende({ t: "ziel", id }); },
  kampfAntippen: (wx: number, wy: number): boolean => Boolean(kampf && kampf.bereit && kampf.antippen(wx, wy)),
  /** Bildschirm statt Boden: die ganze Figur (auch Kopf und Oberkörper) zählt */
  kampfAntippenSchirm: (px: number, py: number): boolean => { const k = kampf as unknown as { bereit?: boolean; antippenSchirm?: (x: number, y: number) => boolean } | null; return Boolean(k && k.bereit && k.antippenSchirm && k.antippenSchirm(px, py)); },
  kampfAmSchirm: (px: number, py: number): { id: number; held: boolean; team: number; name: string; stufe: number; farbe?: string; a?: unknown; typ?: string } | null => { const k = kampf as unknown as { bereit?: boolean; amSchirm?: (x: number, y: number) => ReturnType<NonNullable<typeof k>["amSchirm"] & ((...a: never[]) => unknown)> } | null; return k && k.bereit && k.amSchirm ? (k.amSchirm(px, py) as never) : null; },
  /** Aktionsmenü: Gegner an der Weltstelle, Mitspieler unter dem Bildschirmpunkt, dessen Karte */
  kampfZielBei: (wx: number, wy: number): { name: string; stufe: number; farbe: string } | null => (kampf && kampf.bereit ? kampf.zielBei(wx, wy) : null),
  /** Mitspieler am Bildschirmpunkt: in der freien Welt die Mitspieler, im Kampfgebiet die anderen Helden der Zone (dann ohne Welt-Id: Flüstern per Name) */
  spielerBei: (px: number, py: number): Fremder | null => { const d = mit && mit.unterPunkt ? mit.unterPunkt(px, py) : null; if (d) return d;
    const k = kampf as unknown as { bereit?: boolean; amSchirm?: (x: number, y: number) => { held: boolean; name: string; stufe: number; a?: unknown } | null } | null, t = k && k.bereit && k.amSchirm ? k.amSchirm(px, py) : null;
    return t && t.held ? { i: 0, n: t.name, h: "schildwaechter", s: t.stufe, x: 0, y: 0, b: 0, l: 0, ...(t.a ? { a: t.a as Fremder["a"] } : {}) } : null; },
  /** Folgen (#54): wo steht dieser Spieler gerade (Weltfelder)? Erst die Mitspieler der Welt, sonst die Helden des Kampfgebiets – null: nicht hier */
  spielerOrt: (name: string): { x: number; y: number } | null => { const a = mit && mit.ortVon ? mit.ortVon(name) : null; if (a) return a; const k = kampf as unknown as { bereit?: boolean; heldOrt?: (n: string) => { x: number; y: number } | null } | null; return k && k.bereit && k.heldOrt ? k.heldOrt(name) : null; },
  /** #67, für Prüfungen: welche Arbeit der Held mit diesem Namen im Kampfgebiet gerade zeigt */
  /** #139: hat die Kampfwelt die erste Lage vom Server (null: kein Kampf verbunden) */ kampfBereit: (): boolean | null => (kampf ? kampf.bereit : null),
  kampfArbeitZeigt: (name: string): string => { const k = kampf as unknown as { arbeitZeigt?: (n: string) => string } | null; return k && k.arbeitZeigt ? k.arbeitZeigt(name) : ""; },
  spielerKarteZeigen: (s: WeltKern, d: Fremder): void => { tafel(s, (zu) => spielerKarte(d, zu)); },
  /** Versetzen (Untergrund): der Kampf der alten Stelle endet */
  springen: () => kampfVersetzt(),
  /** Antippen: ein Mitspieler öffnet seine Karte. true = erledigt */
  antippen: (s: WeltKern, px: number, py: number): boolean => { const d = mit && mit.unterPunkt ? mit.unterPunkt(px, py) : null; if (!d) return false; tafel(s, (zu) => spielerKarte(d, zu)); return true; },
};
export function weltAnschliessen(start: string, tor: string) {
  if (start) WELT.start = start;
  WELT.tor = tor;
  WELT.hud = { profil: hudProfil, titel: hudTitel, karte: hudKarte };
  WELT.tat = oeffne;
  WELT.knopf = (art, knopf) => (art === "welt" && !torOffen() ? "Das Südtor ist noch geschlossen" : art === "riss" && !freigabe("riss") ? "Der Riss ist gerade versiegelt" : knopf);
  /* Solange das Südtor nicht freigegeben ist (freigabe.ts), bleibt es zu: Der Wald dahinter wird nicht geladen, die Durchfahrt ist gesperrt */
  if (!freigabe("suedtor")) { WELT.gesperrteRegionen = [tor]; WELT.sperren = [[200 * 32 + 45, 200 * 32 + 55.5, 200 * 32 + 51, 200 * 32 + 58]]; }
  WELT.figur = (s, x, y, held, hoehe) => { const h = aktiverHeld(); const f = heldenFigur(s, x, y, held, hoehe, undefined, h ? { ...h, ich: true } : null); /* der eigene Held aus dem Heldeneditor, mit den angelegten Waffen */
    if (h) { eigeneWaffenQuelle(angelegteEbenen); window.addEventListener("ez-inventar", () => { const m = f as unknown as { neuZeichnen?: () => void }; if (m.neuZeichnen) m.neuZeichnen(); }); } return f; };
  WELT.richten = richten;
  WELT.laden = (s) => heldenLaden(s);   /* Bilder der Mitspieler */
  WELT.menue = (s) => menueEinrichten(s);
  WELT.betreten = (s) => {
    const weg = betretenAllgemein(s);
    schild = s.add.text(0, 0, "", { fontFamily: "Cinzel, Georgia, serif", fontSize: "14px", color: "#ffe08a", stroke: "#000", strokeThickness: 4 }).setOrigin(0.5, 1).setResolution(2).setDepth(1e7);
    (s as unknown as { schild: Phaser.GameObjects.Text }).schild = schild; /* für Prüfungen, wie in der gemalten Waldmark */
    s.events.once("shutdown", () => { const ok = document.getElementById("ez-oben-knoepfe"); if (ok) ok.hidden = true; weg(); kampfEnde(); schild = null;  if (mit) mit.liste([]); mit = null; region.id = ""; });
  };
  WELT.regionWechsel = (s, r) => regionBetreten(s, r.region.id, r.region.ursprung[0], r.region.ursprung[1], r.region.chunks[0], r.region.chunks[1]);
  WELT.fremd = fremd;
  WELT.springen = () => kampfVersetzt();   /* Abstieg in den Untergrund und zurück: der Kampf der alten Stelle endet, am Ziel beginnt (wenn dort Gegner sind) ein neuer */
  WELT.antippen = (s, p) => { if (kampf && kampf.bereit) { const w = s.cameras.main.getWorldPoint(p.x, p.y); if (kampf.antippen(w.x / FELD_PX, w.y / FELD_PX)) return true; } if (!mit) return false; const d = (mit as unknown as Mitspieler).unter(s.input.hitTestPointer(p)); if (!d) return false; tafel(s, (zu) => spielerKarte(d, zu)); return true; };
  WELT.schritt = (s, d) => {
    if (kampf) kampf.schritt(d);
    kampfartZeigen(s); menuePlatz(); obenPlatz();
    if (schild && s.figur) { const t = schildText(s.held); if (schild.text !== t) schild.setText(t); schild.setPosition(s.figur.x, s.figur.y - HELD_PX - 12); }
    if (!mit) return; const px = s.ort.x * FELD_PX - region.x, py = s.ort.y * FELD_PX - region.y;
    weltPos(px, py, blickVon(s.figur), s.laeuft, s.ort.x, s.ort.y); mit.schritt(d); karteFolgen(px / region.b, py / region.h);
  };
}

