/*
 * Schließt die offene Welt an das Spiel an: Die Waldmark der Welt ist der Ausgangspunkt (statt des gemalten Bildes, das unter ?stadt=bild bleibt).
 * Übernimmt, was die gemalte Waldmark (stadt.ts) kann:
 *   Heldenhalle, Weltkarte am Südtor, Riss, Menütafel, Rucksack und Ausrüstung, runde Minikarte mit Knöpfen, Held wechseln,
 *   gemeinsame Welt (Mitspieler mit Namen, Chat, Sprechblasen, Spielerliste und -karte), modulare Figuren,
 *   Freigaben (freigabe.ts: Kampagnen, Waldweg, Riss).
 * Rückkehr aus Kampagnen (?von=tor): vor dem Südtor auf dem Waldweg; nach einem Tod (?von=tod): in der Waldmark, mit Hinweis im Chat.
 * Positionen gehen relativ zur Region an den Server (Bildpunkte, wie seine Prüfung sie erwartet); der Server bleibt unverändert.
 */

import { WELT, Welt, weltDatei } from "./welt";
import { heldenhalle } from "../halle";
import { weltkarte } from "../weltkarte";
import { uebersicht } from "../uebersicht";
import { hudProfil, hudTitel, hudKarte, hudMenue, menueTafel, ZEICHEN } from "../hud";
import { wecken } from "../netz";
import { karteZoom, rundeKarte, karteFolgen, rahmenTasten, taschenTafel, questTafel, RKnopf } from "../rahmen";
import { frei as freigabe } from "../freigabe";
import { weltBetreten, weltPos, heldenLaden, Mitspieler, lokalerHeld, chatSystem, weltHeld, weltIch, spielerKarte, spielerListe, sprechblase, weltOnline } from "../welt";
import { heldenFigur, richten, blickVon } from "../modulfigur";
import { CHUNK_PX, FELD_PX, HELD_PX } from "../../../shared/welt/typen";
import { stufeAusEp } from "../../../shared/config";
import { kontoName } from "../konto";
import { epAlle } from "../halle";
import type Phaser from "phaser";
import { serverZusatz } from "../gruppe";
import { WeltKampf, WeltSzene, tastenFuellen } from "./kampf";
import { WELTZONEN } from "../../../shared/karten";

/** Name und Stufe über dem eigenen Helden: wie die anderen mich sehen (vom Server), sonst Konto- bzw. Gastname und die Stufe auf dem Gerät */
let schild: Phaser.GameObjects.Text | null = null;
function schildText(held: string): string { const i = weltIch(); if (i) return i.gast ? i.name : `${i.name} · St. ${i.stufe}`; return `${kontoName() || "Gast"} · St. ${stufeAusEp(epAlle()[held] || 0)}`; }

type Wahl = (los: (held: string, mit: string[]) => void, zurueck: () => void, wort?: { los: string; zurueck: string }) => void;
const $ = (s: string) => document.querySelector(s) as HTMLElement;
const torOffen = () => freigabe("kampagnen") || freigabe("waldweg");

/** Was zur gemeinsamen Welt gehört, je Szene */
let mit: Mitspieler | null = null, region = { id: "", x: 0, y: 0, b: 1, h: 1 };

/** Tafeln öffnen; die Welt steht still, solange eine offen ist */
function tafel(s: Welt, f: (zu: () => void) => void) { if (s.gesperrt) return; s.halt(); s.gesperrt = true; f(() => { s.gesperrt = false; }); }
function oeffne(art: string, s: Welt) {
  if (s.gesperrt) return;
  if (art === "riss") { if (!freigabe("riss")) return; s.halt(); s.gesperrt = true; const wahl = (window as unknown as { EZ_WAHL: Wahl }).EZ_WAHL;
    wahl((held, gefolgt) => { try { localStorage.setItem("ez_held", held); } catch { /* privat */ } s.scene.start("spiel", { held, mit: gefolgt }); }, () => { s.gesperrt = false; }); }
  else if (art === "halle") tafel(s, (zu) => heldenhalle(() => { zu(); s.profil(); }));
  else if (art === "welt") { if (!torOffen()) { $("#ez-dorf-knopf").classList.add("bald"); return; }
    tafel(s, (zu) => weltkarte(() => { zu(); if (lokalerHeld() !== s.held) { location.reload(); return; } s.profil(); })); }
  else if (art === "menue") tafel(s, (zu) => menueTafel(() => { zu(); s.profil(); }));
  else $("#ez-dorf-knopf").classList.add("bald");   /* „kommt noch“ */
}
/** Den Helden wechseln – nur in der Waldmark (der Server speichert ihn mit dem Konto) */
/** Helden wechseln geht nur in der Waldmark (der Server prüft es ebenso) */
const nurWaldmark = (s: Welt) => { if (s.hier === "waldmark") return true; const t = $("#ez-dorf-hilfe"); t.textContent = "Den Helden wechselst du nur in der Waldmark."; t.style.display = ""; chatSystem("Den Helden wechselst du nur in der Waldmark."); return false; };
/* Nach dem Wechsel lädt die Seite erst, wenn der Server den neuen Helden bestätigt („ich“) – sonst käme er beim Neuladen mit dem alten zurück; notfalls nach 3 s */
function heldWaehlen(s: Welt) { if (s.gesperrt || !nurWaldmark(s)) return; s.halt(); s.gesperrt = true; const wahl = (window as unknown as { EZ_WAHL: Wahl }).EZ_WAHL;
  wahl((held) => { s.gesperrt = false; if (held === s.held) return; s.gesperrt = true; weltHeld(held); setTimeout(() => location.reload(), 3000); }, () => { s.gesperrt = false; }, { los: "Mit diesem Helden ziehen", zurueck: "Zurück" }); }
/** Teleport: von überall in der Welt zurück an den Start der Waldmark (die gemerkte Stelle gilt dann nicht mehr) */
function teleport(s: Welt) { if (s.gesperrt) return; if (s.hier === "waldmark") { chatSystem("Du bist schon in der Waldmark – der Teleport bringt dich von überall hierher zurück."); return; }
  s.halt(); s.gesperrt = true; try { localStorage.removeItem("ez_welt_pos"); } catch { /* privat */ } s.cameras.main.fadeOut(300, 0, 0, 0); s.time.delayedCall(320, () => { location.href = "./?von=teleport" + serverZusatz(); }); }
/** Kampf in der offenen Welt: in einem Kampfgebiet (WELTZONEN) bewegt der Spielserver den Helden, Gegner und Treffer erscheinen an Ort und Stelle */
let kampf: WeltKampf | null = null;
const randAbstand = (s: Welt, z: { x0: number; y0: number; b: number; h: number }) => Math.min(s.ort.x - z.x0, s.ort.y - z.y0, z.x0 + z.b - s.ort.x, z.y0 + z.h - s.ort.y);
/** Unter der Minimap: Sicherer Ort, Einzelkampf oder Mehrkampf – je nachdem, wo man steht */
let zoomJetzt = 2.2;
const KAMPFZEICHEN: Record<string, string> = {
  mehr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11 11M4 4h3.5L17 13.5M4 4v3.5L13.5 17"/><path d="M14 17l3 3M17 14l3 3M15.5 18.5l3-3"/><path d="M20 4L9 15M20 4h-3.5M20 4v3.5"/><path d="M10 17l-3 3M7 14l-3 3M8.5 18.5l-3-3"/></svg>',
  einzel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M19 3h2v2L9 17l-2-2z"/><path d="M6 14l4 4M5 19l2-2M4 20l1-1"/></svg>',
  sicher: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v5.5c0 4.4 3 7.8 7 9.5 4-1.7 7-5.1 7-9.5V6z"/><path d="M9 12l2 2 4-4"/></svg>' };
function kampfartZeigen(s: Welt) { let el = document.getElementById("ez-kampfart"); const r = document.getElementById("ez-kartenrahmen"); if (!r) return;
  if (!el) { el = document.createElement("div"); el.id = "ez-kampfart"; r.appendChild(el); }
  const z = WELTZONEN[s.hier], art = !z || !freigabe("suedtor") ? "sicher" : kampf && kampf.mehrkampf(s.ort.x, s.ort.y) ? "mehr" : "einzel";
  const n = art === "sicher" || !kampf ? 0 : kampf.gegnerNah(8);
  if (el.dataset.art === art && el.dataset.n === String(n)) return; el.dataset.n = String(n);
  const zahl = el.querySelector("em") as HTMLElement | null; if (el.dataset.art === art && zahl) { zahl.textContent = n === 1 ? "1 Gegner" : n + " Gegner"; zahl.hidden = !n; return; }
  el.dataset.art = art; el.className = art; r.dataset.art = art; /* auch die Farbe des Kartenrings zeigt es */
  el.innerHTML = `<span class="sym">${KAMPFZEICHEN[art]}</span><b>${art === "sicher" ? "Sicherer Ort" : art === "mehr" ? "Mehrkampf" : "Einzelkampf"}</b><em${n ? "" : " hidden"}>${n === 1 ? "1 Gegner" : n + " Gegner"}</em>`;
  el.title = art === "sicher" ? "Hier wird nicht gekämpft" : art === "mehr" ? "Viele gegen viele: mehrere Gegner können einen Helden angreifen und mehrere Helden einen Gegner" : "Einer gegen einen: Wer kämpft, kann von keinem Dritten angegriffen werden und greift keinen Dritten an"; }
function kampfEnde() { if (kampf) { kampf.ende(); kampf = null; } }
/* für Prüfungen im Browser */
Object.defineProperty(window, "EZK", { get: () => kampf, configurable: true });
/** Abstand (Felder) von der Stelle zum Rechteck eines Kampfgebiets – 0, wenn man drin steht */
const abstandZu = (x: number, y: number, z: { x0: number; y0: number; b: number; h: number }) => Math.hypot(Math.max(z.x0 - x, 0, x - (z.x0 + z.b)), Math.max(z.y0 - y, 0, y - (z.y0 + z.h)));
const gefallen = () => { kampfEnde(); try { localStorage.removeItem("ez_welt_pos"); } catch { /* privat */ } location.href = "./?von=tod" + serverZusatz(); };
/** Vorverbinden: nähert sich der Held einem Kampfgebiet (unter 10 Feldern), meldet sich die Welt dort schon an und lädt die Gegnerfiguren –
    über die Grenze geht es dann ohne Halt. Entfernt er sich wieder (über 16 Felder), wird die Verbindung geschlossen. */
function vorverbinden(s: Welt) { if (!freigabe("suedtor") || s.gesperrt) return;
  if (kampf) { if (!kampf.eingetreten && abstandZu(s.ort.x, s.ort.y, kampf.zone) > 16) kampfEnde(); return; }
  for (const [rid, z] of Object.entries(WELTZONEN)) if (abstandZu(s.ort.x, s.ort.y, z) < 10) { kampf = new WeltKampf(s as unknown as WeltSzene, rid, s.ort.x, s.ort.y, gefallen, true); return; } }
/** Bekommt die gewünschte Richtung; true = der Server bewegt (die Welt bewegt nicht selbst) */
function fremd(s: Welt, rx: number, ry: number): boolean {
  const z = WELTZONEN[s.hier]; if (!z || !freigabe("suedtor")) { if (kampf && kampf.eingetreten) kampfEnde(); vorverbinden(s); return false; } const rand = randAbstand(s, z);
  if (kampf && kampf.region !== s.hier) kampfEnde();
  if (!kampf) { if (rand < 2 || s.gesperrt) return false; kampf = new WeltKampf(s as unknown as WeltSzene, s.hier, s.ort.x, s.ort.y, gefallen); }
  if (!kampf.eingetreten) kampf.betreten(s.ort.x, s.ort.y); /* vorverbunden: jetzt hinein, ohne Wartezeit */
  if (!kampf.bereit && kampf.vorverbunden) return false; /* bis der Server den Helden meldet (Bruchteile einer Sekunde): selbst weiterlaufen */
  if (!kampf.bereit) { if (kampf.art === "warte") { const t = $("#ez-dorf-hilfe"); t.textContent = "Verbinde mit dem Spielserver …"; t.style.display = ""; } return true; } /* bis der Server antwortet, bleibt der Held stehen */
  /* am Rand des Gebiets und weiter hinaus: die Welt übernimmt wieder (etwa durchs Tor zurück in die Waldmark) */
  const lx = s.ort.x - z.x0, ly = s.ort.y - z.y0; if (rand < 1.2 && ((lx < 1.2 && rx < 0) || (ly < 1.2 && ry < 0) || (lx > z.b - 1.2 && rx > 0) || (ly > z.h - 1.2 && ry > 0))) { kampfEnde(); return false; }
  { const t = $("#ez-dorf-hilfe"); if (t.textContent === "Verbinde mit dem Spielserver …") { t.textContent = ""; t.style.display = "none"; } }
  const pf = (s as unknown as { pfad: { x: number; y: number }[] }).pfad; if (pf.length) { /* Tasten und Stick leeren den Weg der Welt vorher – dann wird selbst gesteuert */ const z = pf[pf.length - 1]; kampf.gehe(z.x, z.y); return true; } /* angetippt: der Server sucht den Weg */
  kampf.steuern(rx, ry); return true; }
/** Der Server kennt die zuletzt gemerkte Stelle (anderes Gerät): dorthin, wenn auf diesem Gerät keine gemerkt war und man noch nicht losgelaufen ist */
let serverStelleGenutzt = false;
function serverStelle(s: Welt, p: { region: string; x: number | null; y: number | null } | undefined) {
  if (serverStelleGenutzt || !p || s.gemerkteStelle || s.time.now > 15000 || p.x === null || p.y === null) return; serverStelleGenutzt = true;
  const x = p.x, y = p.y; if (Math.hypot(x - s.ort.x, y - s.ort.y) < 1) return;
  s.ort = { x, y }; s.pfad = []; s.cameras.main.centerOn(x * FELD_PX, y * FELD_PX); }
/** Oben neben der Profilanzeige: Spieler (wer ist hier, mit Zahl) und Einstellungen (Menü) */
function obenKnoepfe(s: Welt) { let el = document.getElementById("ez-oben-knoepfe"); if (!el) { el = document.createElement("div"); el.id = "ez-oben-knoepfe"; document.body.appendChild(el); }
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
function onlineZeigen() { const z = document.querySelector("#ez-oben-knoepfe .zahl") as HTMLElement | null; if (z) { const n = weltOnline(); z.hidden = n < 2; z.textContent = String(n); } }

/** Die gemeinsame Welt für die Region, in der man steht: Mitspieler neu aufstellen und beim Server den Ort melden */
function regionBetreten(s: Welt, id: string, ux: number, uy: number, b: number, h: number) {
  if (region.id === id && mit) return;
  if (mit) mit.liste([]);
  region = { id, x: ux * CHUNK_PX, y: uy * CHUNK_PX, b: b * CHUNK_PX, h: h * CHUNK_PX };
  zoomJetzt = Math.max(2.2, b * CHUNK_PX / FELD_PX / 40); karteZoom(zoomJetzt);
  /* Nachbarregionen auf der Minimap: ihre Karten an der richtigen Stelle um die aktuelle – der Kreis zeigt die Welt ohne Lücke */
  { const k = document.getElementById("ez-karte"), idx = (s as unknown as { index?: { regionen: Record<string, { region: { id: string; ursprung: number[]; chunks: number[] } }> } }).index;
    if (k && idx) { k.querySelectorAll("img.nachbar").forEach((e) => e.remove());
      for (const r of Object.values(idx.regionen)) { const R = r.region; if (R.id === id || WELT.gesperrteRegionen.includes(R.id)) continue;
        const im = document.createElement("img"); im.className = "nachbar"; im.alt = ""; im.src = weltDatei("karte-" + R.id + ".webp");
        Object.assign(im.style, { left: (100 * (R.ursprung[0] - ux) / b) + "%", top: (100 * (R.ursprung[1] - uy) / h) + "%", width: (100 * R.chunks[0] / b) + "%", height: (100 * R.chunks[1] / h) + "%" }); k.prepend(im); } } } /* der Kreis zeigt etwa 40 Felder: die Karte scrollt beim Laufen sichtbar mit */
  mit = new Mitspieler(s, { f: 1, gross: HELD_PX, tiefe: (y) => y + region.y, karte: { breit: region.b, hoch: region.h }, versatz: { x: region.x, y: region.y } });
  (s as unknown as { mit: Mitspieler }).mit = mit;   /* für Prüfungen sichtbar, wie in der gemalten Waldmark */
  weltBetreten(id, { spieler: (l) => { if (mit) mit.liste(WELTZONEN[id] ? [] : l); onlineZeigen(); }, /* im Kampfgebiet zeigt der Kampf die anderen Helden */ fort: (i) => { if (mit) mit.weg(i); },
    ich: (i) => { if (i.held !== s.held) { location.reload(); return; } serverStelle(s, i.pos); },
    blase: (i, text) => { const ich = weltIch(); if (ich && i === ich.id) sprechblase(s, () => (s.figur && s.figur.active ? { x: s.figur.x, y: s.figur.y - HELD_PX - 30 } : null), text); else if (mit) mit.blase(i, text); } });
}

/** Die Übersichtskarte öffnen: Regionen aus dem Weltindex (gesperrte sind dort schon entfernt), die eigene Stelle läuft mit */
function karteZeigen(s: Welt) {
  const idx = (s as unknown as { index?: { chunkFelder: number; regionen: Record<string, { region: { id: string; name: string; ursprung: number[]; chunks: number[] } }> } }).index; if (!idx) return;
  uebersicht({ daten: WELT.daten, stand: WELT.stand, chunkFelder: idx.chunkFelder || 32, regionen: Object.values(idx.regionen).map((r) => r.region).filter((R) => !WELT.gesperrteRegionen.includes(R.id) && (R as { ebene?: string }).ebene !== "untergrund"),
    ich: () => (s.ort ? { x: s.ort.x, y: s.ort.y } : null), hier: () => s.hier });
}

export function weltAnschliessen(start: string, tor: string) {
  if (start) WELT.start = start;
  WELT.tor = tor;
  WELT.hud = { profil: hudProfil, titel: hudTitel, karte: hudKarte };
  WELT.tat = oeffne;
  WELT.knopf = (art, knopf) => (art === "welt" && !torOffen() ? "Das Südtor ist noch geschlossen" : art === "riss" && !freigabe("riss") ? "Der Riss ist gerade versiegelt" : knopf);
  /* Solange das Südtor nicht freigegeben ist (freigabe.ts), bleibt es zu: Der Wald dahinter wird nicht geladen, die Durchfahrt ist gesperrt */
  if (!freigabe("suedtor")) { WELT.gesperrteRegionen = [tor]; WELT.sperren = [[200 * 32 + 45, 200 * 32 + 55.5, 200 * 32 + 51, 200 * 32 + 58]]; }
  WELT.figur = (s, x, y, held, hoehe) => heldenFigur(s, x, y, held, hoehe);
  WELT.richten = richten;
  WELT.laden = (s) => heldenLaden(s);   /* Bilder der Mitspieler */
  WELT.menue = (s) => {
    const rucksack = () => tafel(s, (zu) => taschenTafel("rucksack", s.held, zu)), ausruestung = () => tafel(s, (zu) => taschenTafel("ausruestung", s.held, zu));
    /* Unter der Karte: was gerade freigeschaltet ist – Weltkarte und Quests gehören zu den Kampagnen */
    const knoepfe: RKnopf[] = [];
    /* Karte: die ganze bekannte Welt von oben (alle Regionen aus welt.json – neue Gebiete erscheinen von selbst) */
    knoepfe.push({ name: "Karte", zeichen: "karte", taste: torOffen() ? "K" : "M", tat: () => karteZeigen(s) });
    if (torOffen()) knoepfe.push({ name: "Weltkarte", zeichen: "karte", taste: "M", tat: () => oeffne("welt", s) });
    if (freigabe("kampagnen")) knoepfe.push({ name: "Quests", zeichen: "quests", taste: "L", tat: () => tafel(s, questTafel) });
    knoepfe.push({ name: "Teleport", zeichen: "teleport", taste: "T", tat: () => teleport(s) }, { name: "Held", zeichen: "held", taste: "H", tat: () => heldWaehlen(s) });
    rundeKarte(zoomJetzt, knoepfe); tastenFuellen(s.held); rahmenTasten({ b: rucksack, i: rucksack, c: ausruestung, p: () => tafel(s, spielerListe) }); obenKnoepfe(s); onlineZeigen();
    hudMenue([{ name: "Helden", zeichen: "helden", tat: () => oeffne("halle", s) }, { name: "Rucksack", zeichen: "rucksack", tat: rucksack }, { name: "Ausrüstung", zeichen: "ausruestung", tat: ausruestung }]); /* Spieler und Einstellungen sitzen oben neben dem Profil */
    if (!new URLSearchParams(location.search).has("server")) wecken(); /* Riss und Kampagnen brauchen den Server – schon jetzt aufwecken */
  };
  WELT.betreten = (s) => {
    const q = new URLSearchParams(location.search);
    if (q.get("von") === "tod") { setTimeout(() => chatSystem("Du bist gefallen und in der Waldmark wieder zu dir gekommen."), 300); q.delete("von"); history.replaceState(null, "", "?" + q.toString()); }
    /* Heldenprofil: Bildnis = Held. Der Server speichert den Wechsel (sonst setzt er den alten zurück); seine Bestätigung lädt neu, notfalls nach kurzer Zeit */
    const heldWahl = (ev: Event) => { const h = String((ev as CustomEvent).detail || ""); if (!h || h === s.held) return; ev.preventDefault(); if (!nurWaldmark(s)) return; s.gesperrt = true; weltHeld(h); setTimeout(() => location.reload(), 3000); };
    window.addEventListener("ez-held-wahl", heldWahl);
    schild = s.add.text(0, 0, "", { fontFamily: "Cinzel, Georgia, serif", fontSize: "14px", color: "#ffe08a", stroke: "#000", strokeThickness: 4 }).setOrigin(0.5, 1).setResolution(2).setDepth(1e7);
    (s as unknown as { schild: Phaser.GameObjects.Text }).schild = schild; /* für Prüfungen, wie in der gemalten Waldmark */
    document.body.classList.add("offenewelt"); /* Menü rechts als Spalte, Kampfsteuerung immer sichtbar */
    const ruhig = (ev: Event) => { if (kampf || !(ev.target as HTMLElement).closest("#ez-tasten")) return; const t = $("#ez-dorf-hilfe"); t.textContent = "Hier ist ein sicherer Ort – gekämpft wird draußen, etwa im Kreuzwald hinter dem Südtor."; t.style.display = ""; };
    document.addEventListener("pointerdown", ruhig, true);
    s.events.once("shutdown", () => { const ok = document.getElementById("ez-oben-knoepfe"); if (ok) ok.hidden = true; document.body.classList.remove("offenewelt"); document.removeEventListener("pointerdown", ruhig, true); kampfEnde(); schild = null; window.removeEventListener("ez-held-wahl", heldWahl); if (mit) mit.liste([]); mit = null; region.id = ""; });
  };
  WELT.regionWechsel = (s, r) => regionBetreten(s, r.region.id, r.region.ursprung[0], r.region.ursprung[1], r.region.chunks[0], r.region.chunks[1]);
  WELT.fremd = fremd;
  WELT.springen = () => kampfEnde();   /* Abstieg in den Untergrund und zurück: der Kampf der alten Stelle endet, am Ziel beginnt (wenn dort Gegner sind) ein neuer */
  WELT.antippen = (s, p) => { if (kampf && kampf.bereit) { const w = s.cameras.main.getWorldPoint(p.x, p.y); if (kampf.antippen(w.x / FELD_PX, w.y / FELD_PX)) return true; } if (!mit) return false; const d = mit.unter(s.input.hitTestPointer(p)); if (!d) return false; tafel(s, (zu) => spielerKarte(d, zu)); return true; };
  WELT.schritt = (s, d) => {
    if (kampf) kampf.schritt(d);
    kampfartZeigen(s); menuePlatz(); obenPlatz();
    if (schild && s.figur) { const t = schildText(s.held); if (schild.text !== t) schild.setText(t); schild.setPosition(s.figur.x, s.figur.y - HELD_PX - 12); }
    if (!mit) return; const px = s.ort.x * FELD_PX - region.x, py = s.ort.y * FELD_PX - region.y;
    weltPos(px, py, blickVon(s.figur), s.laeuft, s.ort.x, s.ort.y); mit.schritt(d); karteFolgen(px / region.b, py / region.h);
  };
}

