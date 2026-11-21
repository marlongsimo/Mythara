/*
 * Schließt die offene Welt an das Spiel an: Die Waldmark der Welt ist der Ausgangspunkt (statt des gemalten Bildes, das unter ?stadt=bild bleibt).
 * Übernimmt, was die gemalte Waldmark (stadt.ts) kann:
 *   Heldenhalle, Weltkarte am Südtor, Riss, Menütafel, Rucksack und Ausrüstung, runde Minikarte mit Knöpfen, Held wechseln,
 *   gemeinsame Welt (Mitspieler mit Namen, Chat, Sprechblasen, Spielerliste und -karte), modulare Figuren,
 *   Freigaben (freigabe.ts: Kampagnen, Waldweg, Riss).
 * Rückkehr aus Kampagnen (?von=tor): vor dem Südtor auf dem Waldweg; nach einem Tod (?von=tod): in der Waldmark, mit Hinweis im Chat.
 * Positionen gehen relativ zur Region an den Server (Bildpunkte, wie seine Prüfung sie erwartet); der Server bleibt unverändert.
 */

import { WELT, Welt } from "./welt";
import { heldenhalle } from "../halle";
import { weltkarte } from "../weltkarte";
import { hudProfil, hudTitel, hudKarte, hudMenue, menueTafel } from "../hud";
import { wecken } from "../netz";
import { rundeKarte, karteFolgen, rahmenTasten, taschenTafel, questTafel, RKnopf } from "../rahmen";
import { frei as freigabe } from "../freigabe";
import { weltBetreten, weltPos, heldenLaden, Mitspieler, lokalerHeld, chatSystem, weltHeld, weltIch, spielerKarte, spielerListe, sprechblase, weltOnline } from "../welt";
import { heldenFigur, richten, blickVon } from "../modulfigur";
import { CHUNK_PX, FELD_PX, HELD_PX } from "../../../shared/welt/typen";

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
function heldWaehlen(s: Welt) { if (s.gesperrt) return; s.halt(); s.gesperrt = true; const wahl = (window as unknown as { EZ_WAHL: Wahl }).EZ_WAHL;
  wahl((held) => { weltHeld(held); s.gesperrt = false; if (held !== s.held) location.reload(); }, () => { s.gesperrt = false; }, { los: "Mit diesem Helden ziehen", zurueck: "Zurück" }); }
function onlineZeigen() { const b = document.querySelector('#ez-kartenrahmen [aria-label="Spieler"] small') as HTMLElement | null; if (b) { const n = weltOnline(); b.textContent = n > 1 ? `Spieler (${n})` : "Spieler"; } }

/** Die gemeinsame Welt für die Region, in der man steht: Mitspieler neu aufstellen und beim Server den Ort melden */
function regionBetreten(s: Welt, id: string, ux: number, uy: number, b: number, h: number) {
  if (region.id === id && mit) return;
  if (mit) mit.liste([]);
  region = { id, x: ux * CHUNK_PX, y: uy * CHUNK_PX, b: b * CHUNK_PX, h: h * CHUNK_PX };
  mit = new Mitspieler(s, { f: 1, gross: HELD_PX, tiefe: (y) => y + region.y, karte: { breit: region.b, hoch: region.h }, versatz: { x: region.x, y: region.y } });
  (s as unknown as { mit: Mitspieler }).mit = mit;   /* für Prüfungen sichtbar, wie in der gemalten Waldmark */
  weltBetreten(id, { spieler: (l) => { if (mit) mit.liste(l); onlineZeigen(); }, fort: (i) => { if (mit) mit.weg(i); },
    ich: (i) => { if (i.held !== s.held) location.reload(); },
    blase: (i, text) => { const ich = weltIch(); if (ich && i === ich.id) sprechblase(s, () => (s.figur && s.figur.active ? { x: s.figur.x, y: s.figur.y - HELD_PX - 30 } : null), text); else if (mit) mit.blase(i, text); } });
}

export function weltAnschliessen(start: string, tor: string) {
  if (start) WELT.start = start;
  WELT.tor = tor;
  WELT.hud = { profil: hudProfil, titel: hudTitel, karte: hudKarte };
  WELT.tat = oeffne;
  WELT.knopf = (art, knopf) => (art === "welt" && !torOffen() ? "Das Südtor ist noch geschlossen" : art === "riss" && !freigabe("riss") ? "Der Riss ist gerade versiegelt" : knopf);
  /* Solange der Waldweg nicht freigegeben ist, bleibt das Südtor zu: Der Waldweg wird nicht geladen, die Durchfahrt ist gesperrt */
  if (!freigabe("waldweg")) { WELT.gesperrteRegionen = [tor]; WELT.sperren = [[200 * 32 + 45, 200 * 32 + 55.5, 200 * 32 + 51, 200 * 32 + 58]]; }
  WELT.figur = (s, x, y, held, hoehe) => heldenFigur(s, x, y, held, hoehe);
  WELT.richten = richten;
  WELT.laden = (s) => heldenLaden(s);   /* Bilder der Mitspieler */
  WELT.menue = (s) => {
    const rucksack = () => tafel(s, (zu) => taschenTafel("rucksack", s.held, zu)), ausruestung = () => tafel(s, (zu) => taschenTafel("ausruestung", s.held, zu));
    /* Unter der Karte: was gerade freigeschaltet ist – Weltkarte und Quests gehören zu den Kampagnen */
    const knoepfe: RKnopf[] = [];
    if (torOffen()) knoepfe.push({ name: "Weltkarte", zeichen: "karte", taste: "M", tat: () => oeffne("welt", s) });
    if (freigabe("kampagnen")) knoepfe.push({ name: "Teleport", zeichen: "teleport", taste: "T", tat: () => chatSystem("Du bist schon in der Waldmark – der Teleport bringt dich von überall hierher zurück.") }, { name: "Quests", zeichen: "quests", taste: "L", tat: () => tafel(s, questTafel) });
    knoepfe.push({ name: "Spieler", zeichen: "spieler", taste: "P", tat: () => tafel(s, spielerListe) }, { name: "Held", zeichen: "held", taste: "H", tat: () => heldWaehlen(s) });
    rundeKarte(2.2, knoepfe); rahmenTasten({ b: rucksack, i: rucksack, c: ausruestung }); onlineZeigen();
    hudMenue([{ name: "Helden", zeichen: "helden", tat: () => oeffne("halle", s) }, { name: "Rucksack", zeichen: "rucksack", tat: rucksack }, { name: "Ausrüstung", zeichen: "ausruestung", tat: ausruestung },
      ...(freigabe("riss") ? [{ name: "Riss", zeichen: "riss" as const, art: "riss", tat: () => oeffne("riss", s) }] : []), { name: "Menü", zeichen: "menue", tat: () => oeffne("menue", s) }]);
    if (!new URLSearchParams(location.search).has("server")) wecken(); /* Riss und Kampagnen brauchen den Server – schon jetzt aufwecken */
  };
  WELT.betreten = (s) => {
    const q = new URLSearchParams(location.search);
    if (q.get("von") === "tod") { setTimeout(() => chatSystem("Du bist gefallen und in der Waldmark wieder zu dir gekommen."), 300); q.delete("von"); history.replaceState(null, "", "?" + q.toString()); }
    /* Heldenprofil: Bildnis = Held. Der Server speichert den Wechsel (sonst setzt er den alten zurück); seine Bestätigung lädt neu, notfalls nach kurzer Zeit */
    const heldWahl = (ev: Event) => { const h = String((ev as CustomEvent).detail || ""); if (!h || h === s.held) return; ev.preventDefault(); weltHeld(h); setTimeout(() => location.reload(), 1500); };
    window.addEventListener("ez-held-wahl", heldWahl);
    s.events.once("shutdown", () => { window.removeEventListener("ez-held-wahl", heldWahl); if (mit) mit.liste([]); mit = null; region.id = ""; });
  };
  WELT.regionWechsel = (s, r) => regionBetreten(s, r.region.id, r.region.ursprung[0], r.region.ursprung[1], r.region.chunks[0], r.region.chunks[1]);
  WELT.antippen = (s, p) => { if (!mit) return false; const d = mit.unter(s.input.hitTestPointer(p)); if (!d) return false; tafel(s, (zu) => spielerKarte(d, zu)); return true; };
  WELT.schritt = (s, d) => {
    if (!mit) return; const px = s.ort.x * FELD_PX - region.x, py = s.ort.y * FELD_PX - region.y;
    weltPos(px, py, blickVon(s.figur), s.laeuft); mit.schritt(d); karteFolgen(px / region.b, py / region.h);
  };
}

