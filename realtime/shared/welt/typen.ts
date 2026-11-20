/*
 * World Pipeline – das Datenmodell der offenen Welt.
 * Reine Beschreibung und Rechnung, läuft auf dem Server, im Browser und in den Werkzeugen gleich.
 *
 * Maße: Alles, was eine Lage in der Welt hat, steht in Rechenfeldern (48 px), als Kommazahl, Ursprung oben links.
 * Innerhalb einer Region gelten Regionskoordinaten; die Welt ist ein gemeinsames Gitter aus Chunks,
 * in dem jede Region ihren Platz hat (Region.ursprung). So grenzen Regionen ohne Naht aneinander.
 */

/** Ein Rechenfeld in Bildpunkten (wie Kampf und Waldweg: 96 / FEIN) */
export const FELD_PX = 48;
/** Eine gemalte Geländekachel ist 2 × 2 Rechenfelder (96 px) */
export const KACHEL_FELDER = 2;
/** Kantenlänge eines Chunks in Rechenfeldern (= 16 Geländekacheln = 1536 px) */
export const CHUNK_FELDER = 32;
export const CHUNK_PX = CHUNK_FELDER * FELD_PX;
/** Höhe eines Helden in der Welt (wie im Kampf) – Bezug für den Maßstab aller Objekte */
export const HELD_PX = 84;

/* ───────────── Bibliothek: Gelände ───────────── */

export type GelaendeKategorie = "gelaende" | "wasser" | "weg";
/** Wie der Rand einer Geländeart in tiefer liegende Arten übergeht (gerechnet beim Backen des Bodens) */
export interface GelaendeRand {
  /** fransen: weich und unregelmäßig · steine: endet in ganzen Steinen · ufer: gemalter Uferstreifen · hart: klare Kante */
  art: "fransen" | "steine" | "ufer" | "hart";
  /** Breite des Übergangs in Rechenfeldern */
  breite: number;
  /** Bild für den Übergang (nur „ufer“), Pfad ab Repository-Wurzel */
  bild?: string;
}
export interface Gelaendeart {
  id: string;
  name: string;
  /** Ein Zeichen, mit dem die Art in der Geländekarte einer Region steht */
  zeichen: string;
  kategorie: GelaendeKategorie;
  /** Kann man darauf laufen? */
  begehbar: boolean;
  /** Wasser versperrt den Weg, aber nicht Sicht und Geschosse (wie „~“ in den Kampfkarten) */
  wasser?: boolean;
  /** Kachelbare Bodentextur (Pfad ab Repository-Wurzel) – oder null, solange es nur die Platzhalterfarbe gibt */
  kachel: string | null;
  /** Weitere Texturen, die beim Backen eingestreut werden (gegen Wiederholungsmuster) */
  varianten?: string[];
  /** Wer höher steht, legt sich über die Nachbarn (Weg über Gras, Gras über Wasser …) */
  rang: number;
  rand: GelaendeRand;
  /** Farbe für Editor, Minikarte und Platzhalter, „#rrggbb“ */
  farbe: string;
  /** Herkunft und Lizenz der Textur */
  herkunft?: string;
}
export interface GelaendeBibliothek { arten: Gelaendeart[] }

/* ───────────── Bibliothek: Objekte ───────────── */

export type ObjektKategorie = "bewuchs" | "fels" | "gebaeude" | "bauteil" | "kleinteil" | "wasserbau" | "sonderort";
/** Kollisionsfläche, gemessen ab dem Fußpunkt des Objekts in Rechenfeldern (bei Maßstab 1). Unabhängig vom Bild bearbeitbar. */
export type Kollision =
  | { art: "kreis"; r: number; dx?: number; dy?: number }
  | { art: "rechteck"; x: number; y: number; b: number; h: number }
  | { art: "vieleck"; punkte: number[][] };
/** Was ein Objekt kann, wenn man davorsteht. Die Logik dazu liegt in den bestehenden Systemen; hier steht nur, was wo auslöst. */
export interface ObjektInteraktion {
  art: "tuer" | "truhe" | "haendler" | "sammeln" | "schalter" | "lesen" | "eingang";
  /** Punkt, an dem man stehen muss, ab dem Fußpunkt in Rechenfeldern */
  dx: number; dy: number;
  /** Reichweite in Rechenfeldern */
  radius: number;
}
export interface ObjektAnimation { /** Breite eines Einzelbilds im Blatt (px) */ feld: number; bilder: number; /** Bilder je Sekunde */ rate: number }
export interface ObjektEffekt { art: "licht" | "feuer" | "rauch" | "glitzer"; dx: number; dy: number; farbe?: string; radius?: number }
export interface ObjektDef {
  id: string;
  name: string;
  kategorie: ObjektKategorie;
  /** Bild, Pfad ab Repository-Wurzel */
  bild: string;
  /** Größe des Bildes in Bildpunkten [breit, hoch] */
  groesse: [number, number];
  /** Fußpunkt im Bild, 0 bis 1 [x, y] */
  anker: [number, number];
  /** Maßstab, mit dem das Bild gezeigt wird, damit es zum Helden (84 px) passt */
  massstab: number;
  kollision: Kollision | null;
  /** fuss: nach Fußpunkt sortiert · boden: liegt immer unter allen Figuren · oben: immer über allen Figuren */
  tiefe: "fuss" | "boden" | "oben";
  /** Wird durchscheinend, wenn der eigene Held dahinter steht (wie die Bäume am Waldweg) */
  durchscheinend?: boolean;
  interaktion?: ObjektInteraktion | null;
  animation?: ObjektAnimation;
  effekte?: ObjektEffekt[];
  /** Weitere Zustände mit eigenem Bild, etwa „offen“ / „zu“ bei Gebäuden und Truhen */
  zustaende?: Record<string, { bild: string }>;
  /** Darf der Generator das Objekt spiegeln? */
  spiegelbar?: boolean;
  /** Herkunft und Lizenz */
  herkunft: string;
  /** Vorläufiges Bild, das noch ersetzt werden muss */
  platzhalter?: boolean;
}
export interface ObjektBibliothek { objekte: ObjektDef[] }

/* ───────────── Region ───────────── */

export type Biom = "wald" | "wiese" | "dorf" | "sumpf" | "gebirge" | "ufer";
export interface Region {
  id: string;
  name: string;
  /** Lage in der Welt: Chunk oben links [cx, cy] */
  ursprung: [number, number];
  /** Größe in Chunks [breit, hoch] */
  chunks: [number, number];
  biom: Biom;
  /** Stufe der Aufgabe (bestimmt die Stärke der Gegner, wie ORTSTUFE) */
  stufe: number;
  /** Stimmung für die Darstellung */
  licht?: { farbe: string; staerke: number };
  /** Bereiche, die von Hand gestaltet sind: Der Generator lässt sie in Ruhe. [x0, y0, x1, y1] in Rechenfeldern */
  gesperrt?: number[][];
}

/** Ein Objekt an seinem Platz. x, y: Fußpunkt in Rechenfeldern (Regionskoordinaten) */
export interface Platzierung {
  /** Eindeutige Kennung innerhalb der Region */
  id: string;
  objekt: string;
  x: number; y: number;
  /** Zusätzlicher Maßstab (1 = wie in der Bibliothek) */
  s?: number;
  spiegeln?: boolean;
  zustand?: string;
  /** Kollision nur für dieses eine Objekt überschreiben (null = keine) */
  kollision?: Kollision | null;
}

/** Wie ein Stück Welt zwischen Server und Spielern abgeglichen wird */
export type Abgleich =
  /** nur Darstellung, steht in der Chunk-Datei */ | "keiner"
  /** der Server prüft und entscheidet, merkt sich aber nichts über den Besuch hinaus */ | "server"
  /** der Server entscheidet und speichert den Zustand dauerhaft */ | "dauerhaft";

export interface Bereich { art: "rechteck"; x0: number; y0: number; x1: number; y1: number }
export interface Kreis { art: "kreis"; x: number; y: number; r: number }
export type Zone = Bereich | Kreis;

/** Eine Spielfigur ohne Kampf: Dorfleute, Händler, Questgeber, Wachen, Tiere */
export interface Figur {
  id: string;
  rolle: "npc" | "haendler" | "questgeber" | "wache" | "tier";
  /** Schlüssel der Figur in den bestehenden Systemen (Bild, Gespräch) */
  figur: string;
  x: number; y: number;
  /** blickt nach links */
  links?: boolean;
  /** Frei für das angeschlossene System (Gespräch, Laden, Aufgabe) */
  daten?: Record<string, unknown>;
}
/** Wo Gegner entstehen. Die Simulation setzt sie als Lager einer gemeinsamen Gruppe in die Zone. */
export interface Spawnzone {
  id: string;
  zone: Zone;
  gegner: { art: string; anzahl: number }[];
  /** Ab welchem Abstand sie angreifen und wie weit sie folgen (Rechenfelder); ohne Angabe gelten die Grundwerte */
  aggro?: number; leine?: number;
  /** Sekunden bis zum Wiederkommen; ohne Angabe bleiben sie besiegt */
  respawn?: number;
  boss?: boolean;
  abgleich: "server" | "dauerhaft";
}
/** Ein Punkt mit Spielfunktion, der nicht an einem Bibliotheksobjekt hängt (oder es ergänzt) */
export interface Interaktion {
  id: string;
  art: "tuer" | "truhe" | "sammeln" | "schalter" | "questziel" | "lesen" | "eingang";
  x: number; y: number;
  radius: number;
  /** Platzierung, zu der die Interaktion gehört */
  objekt?: string;
  abgleich: Abgleich;
  daten?: Record<string, unknown>;
}
/** Wohin ein Ausgang führt */
export type Reiseziel =
  | { art: "welt"; region: string; x: number; y: number }
  | { art: "ort"; ort: string }
  | { art: "kampf"; ort: string; kampf: string };
export interface Ausgang { id: string; zone: Bereich; nach: Reiseziel; text: string }
/** Alles Spielrelevante einer Region */
export interface SpielDaten {
  /** Wo Helden die Region betreten (Rechenfelder); der erste ist der Hauptstart */
  start: number[][];
  figuren: Figur[];
  spawnzonen: Spawnzone[];
  interaktionen: Interaktion[];
  ausgaenge: Ausgang[];
  /** Begehbarkeit von Hand nachbessern: erst wird gesperrt, dann freigegeben */
  kollision: { sperren: Bereich[]; freigeben: Bereich[] };
}

/** Eine Region mit allem, was dazugehört – so, wie sie im Repository liegt */
export interface RegionDaten {
  region: Region;
  /** Geländekarte: eine Zeile je Rechenfeld-Reihe, ein Zeichen je Rechenfeld (Gelaendeart.zeichen) */
  gelaende: string[];
  objekte: Platzierung[];
  spiel: SpielDaten;
}

/* ───────────── Gebauter Chunk (Ausgabe der Pipeline) ───────────── */

/** Ein Chunk, wie ihn Client und Simulation laden. Lagen in Rechenfeldern der Welt. */
export interface ChunkDaten {
  cx: number; cy: number;
  region: string;
  /** Gebackenes Bodenbild (1536 × 1536) */
  boden: string;
  /** Gehraster, 32 Zeilen zu 32 Zeichen: „.“ frei, „~“ Wasser, „#“ gesperrt */
  geh: string[];
  /** Objekte, deren Fußpunkt in diesem Chunk liegt */
  objekte: Platzierung[];
  figuren: Figur[];
  interaktionen: Interaktion[];
}

/* ───────────── Rechnung ───────────── */

export const chunkVon = (feld: number): number => Math.floor(feld / CHUNK_FELDER);
export const chunkName = (cx: number, cy: number): string => `${cx}_${cy}`;
/** Größe einer Region in Rechenfeldern */
export const regionFelder = (r: Region): [number, number] => [r.chunks[0] * CHUNK_FELDER, r.chunks[1] * CHUNK_FELDER];
/** Regionskoordinaten in Weltkoordinaten (Rechenfelder) */
export const zurWelt = (r: Region, x: number, y: number): [number, number] => [x + r.ursprung[0] * CHUNK_FELDER, y + r.ursprung[1] * CHUNK_FELDER];
export const inZone = (z: Zone, x: number, y: number): boolean =>
  z.art === "kreis" ? Math.hypot(x - z.x, y - z.y) <= z.r : x >= z.x0 && x <= z.x1 && y >= z.y0 && y <= z.y1;
/** Überschneiden sich zwei Regionen im Weltgitter? */
export const ueberlappen = (a: Region, b: Region): boolean =>
  a.ursprung[0] < b.ursprung[0] + b.chunks[0] && b.ursprung[0] < a.ursprung[0] + a.chunks[0] &&
  a.ursprung[1] < b.ursprung[1] + b.chunks[1] && b.ursprung[1] < a.ursprung[1] + a.chunks[1];
