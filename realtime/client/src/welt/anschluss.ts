/*
 * Schließt die offene Welt an das Spiel an: Die Waldmark der Welt ist der Ausgangspunkt (statt des gemalten Bildes, das unter ?stadt=bild bleibt).
 * Übernimmt, was die bisherige Waldmark (stadt.ts) konnte: Heldenhalle, Weltkarte am Südtor, Riss über das Menü, Menütafel, Server früh wecken.
 * Rückkehr aus Kampagnen (?von=tor): Man steht vor dem Südtor auf dem Waldweg.
 */
import { WELT, Welt } from "./welt";
import { heldenhalle } from "../halle";
import { weltkarte } from "../weltkarte";
import { hudProfil, hudTitel, hudKarte, hudMenue, menueTafel } from "../hud";
import { wecken } from "../netz";

type Wahl = (los: (held: string, mit: string[]) => void, zurueck: () => void) => void;
const $ = (s: string) => document.querySelector(s) as HTMLElement;

/** Riss, Heldenhalle, Weltkarte öffnen; die Welt steht still, solange eine Tafel offen ist */
function oeffne(art: string, s: Welt) {
  if (s.gesperrt) return;
  const zu = () => { s.gesperrt = false; s.profil(); };
  if (art === "riss") { s.halt(); s.gesperrt = true; const wahl = (window as unknown as { EZ_WAHL: Wahl }).EZ_WAHL;
    wahl((held, mit) => { try { localStorage.setItem("ez_held", held); } catch { /* privat */ } s.scene.start("spiel", { held, mit }); }, () => { s.gesperrt = false; }); }
  else if (art === "halle") { s.halt(); s.gesperrt = true; heldenhalle(zu); }
  else if (art === "welt") { s.halt(); s.gesperrt = true; weltkarte(zu); }
  else if (art === "menue") { s.halt(); s.gesperrt = true; menueTafel(zu); }
  else { const k = $("#ez-dorf-knopf"); k.classList.add("bald"); }   /* „kommt noch“ */
}

export function weltAnschliessen(start: string, tor: string) {
  if (start) WELT.start = start;
  WELT.tor = tor;
  WELT.hud = { profil: hudProfil, titel: hudTitel, karte: hudKarte };
  WELT.tat = oeffne;
  WELT.menue = (s) => {
    hudMenue([{ name: "Helden", zeichen: "helden", tat: () => oeffne("halle", s) }, { name: "Weltkarte", zeichen: "karte", tat: () => oeffne("welt", s) },
      { name: "Riss", zeichen: "riss", art: "riss", tat: () => oeffne("riss", s) }, { name: "Menü", zeichen: "menue", tat: () => oeffne("menue", s) }]);
    if (!new URLSearchParams(location.search).has("server")) wecken(); /* Riss und Kampagnen brauchen den Server – schon jetzt aufwecken */
  };
}
