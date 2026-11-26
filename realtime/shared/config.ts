/*
 * Mythara Echtzeit – die Wertetabelle (Kampfsystem 0.1). Server und Client lesen dieselben Zahlen.
 * Längen in Feldern, Zeiten in Sekunden. Wer am Balancing dreht, ändert nur diese Datei.
 *
 * Treffer nach dem Prinzip von Old School RuneScape, zwei getrennte Würfe:
 *  1. Trefferwurf: Der Angreifer würfelt 0 bis Angriffswert (für Nahkampf, Fernkampf oder Magie), der Verteidiger 0 bis Verteidigungswert für genau diese Art. Der höhere Angriffswurf trifft.
 *  2. Schadenswurf: Bei einem Treffer wird zwischen Mindest- und Höchstschaden der Waffe gewürfelt.
 * Verteidigung senkt also die Trefferchance, nicht den Schaden. Torvalds Schild erhöht seinen Verteidigungswurf; Schutzpunkte fangen Schaden ab.
 */
import type { GegnerV3 } from "./kampfwerte";
export const TICK = 20;            // Rechenschritte je Sekunde (Server-Simulation)
export const DT = 1 / TICK;
export const ZUSTAND_JE = 1;       // jeder Schritt geht an den Client: 20 Zustände je Sekunde
export const PROTOKOLL = 2;

export type Schadensart = "nah" | "fern" | "magie";            // physischer Nahkampf, physischer Fernkampf, Magie
export type Werte = Record<Schadensart, number>;                  // je Angriffsart ein Wert
export interface Modus { name: string; art: Schadensart | "heil"; schaden: [number, number]; /* Mindest- und Höchstschaden (oder Heilung) */ takt: number; reich: number; flug?: number; wucht?: boolean; untot?: number; schild?: boolean; text: string }
export interface Faehigkeit { name: string; zeit: number; text: string }
export interface HeldDef { name: string; titel: string; klasse: string; rolle: string; bild: string; figur?: string; lauf?: string; hieb?: string; schild?: string; /* schild: Laufbilder für die zweite Waffe */ hieb2?: string; hiebMass?: [number, number, number]; hieb2Mass?: [number, number, number]; /* hieb: Angriffsbilder der ersten Waffe, hieb2: der zweiten; Maße wie laufMass */ ruhe?: string; ruheMass?: [number, number, number]; hoehe?: number; /* ruhe: Bildblatt fürs Stehen (bewegt); hoehe: Körperhöhe am Bildschirm, sonst 84 */ schildStand?: string; schildFuss?: [number, number, number]; laufMass?: [number, number, number]; /* schildStand: Standbild der zweiten Waffe, schildFuss: Füße von links, von oben, Maßstab; laufMass: bei den Laufbildern Füße von links, von oben und Anteil des Felds, der der Körperhöhe entspricht */ fuss?: [number, number]; gross?: number; /* fuss: wo im Standbild die Füße stehen (Anteil von links, von oben); gross: Maßstab, wenn das Bild über den Kopf hinausragt */
  lp: number; tempo: number; angriff: Werte; abwehr: Werte; modi: [Modus, Modus]; q: Faehigkeit; e: Faehigkeit; r: Faehigkeit; passiv: string }

export const K = {
  /* Trefferwurf */
  TREFFERWURF: true,                       // false: jeder Angriff trifft
  /* Fähigkeiten: Der Wert in der Tabelle ist der Höchstschaden. Räumlich treffende Fähigkeiten (Flächen, Sprünge) brauchen keinen Trefferwurf. */
  FAEHIG_MIN: 0.7,                         // Mindestschaden einer Fähigkeit als Anteil am Höchstschaden
  /* Fernkampf: Wer schießt oder zaubert, steht dafür kurz still. Nahkämpfer schlagen auch im Laufen zu. */
  AUSHOLEN_FERN: 0.3,
  /* Erholung: Wer eine Weile keinen Schaden nimmt, heilt von selbst */
  ERHOLUNG: { nach: 5, jeSek: 0.015 },     // nach 5 s ohne Schaden: 1,5 % des Höchstlebens je Sekunde
  /* Torvalds Schild (zweiter Waffenmodus): von vorn wird er um diesen Anteil seltener getroffen (sein Verteidigungswurf steigt entsprechend).
     Gegen Flächen ohne Trefferwurf mindert der Schild stattdessen den Schaden um „flaeche“. */
  BLOCK: { nah: 0.6, fern: 0.4, magie: 0.2, flaeche: 0.05, winkel: 70, tempo: 0.85 }, // winkel: so viele Grad links und rechts der Blickrichtung
  BOLLWERK: { dauer: 3, plus: 0.25, hinter: 0.35 },  // zusätzliche Minderung für Torvald; Verbündete direkt hinter ihm bekommen „hinter“
  MINDERUNG_MAX: 0.8,                      // mehr als 80 % bringen Schild und Bollwerk zusammen nie
  WUCHT: 0.5,                              // Wuchtangriffe gegen Gegner mit dieser Schwäche: +50 %
  WECHSEL: 0.4,                            // so lange dauert der Waffenwechsel (Sperre)
  R_HELD: 0.36, SICHT: 7,
  AGGRO: 5.5, LEINE: 10,                   // Monster: ab wann sie angreifen, wie weit sie ihrem Lager folgen
  WIEDER_HELD: 5,
  HEIL_EP: 0.3,                            // gemeinsame Welt: Heiler bekommen so viele EP je geheiltem Lebenspunkt
  AGGRO_DAUER: 900, AGGRO_RUECKSETZEN: 20, // offene Welt: nach 15 min greifen Gegner einen Helden nicht mehr von selbst an – bis er 20 Felder weggeht oder die Region verlässt und wieder betritt (unsichtbar)
  WELT_WIEDERKEHR: 60,                     // gemeinsame Welt: Sekunden, bis ein besiegter Gegner wieder an seinem Lager steht
  HEIM_HEILUNG: 0.15, HEIM_HEILUNG_BOSS: 0.02, // Monster, die niemanden mehr verfolgen, heilen an ihrem Platz so viel ihres Lebens je Sekunde
  SPLITTER: [1, 20] as [number, number],
  EINGABEN_JE_SEK: 30,
  /* Einzelne Fähigkeiten */
  FESTNAGELN: { langsam: 0.15, dauer: 1.5, sperre: 3 },
  STOSS: { weite: 2.5, schaden: 30, zurueck: 1.6 },
  SCHILD_GRAUWACHT: { radius: 6, schutz: 80, schutzDauer: 6, spott: 4 },
  FROST: { reich: 8, radius: 2, schaden: 24, langsam: 0.3, dauer: 2 },
  DONNER: { reich: 7, radius: 2, schaden: 42, zurueck: 1.5 },
  GLUT: { reich: 8, radius: 3, schaden: 85, brand: 8, dauer: 3, flug: 9 },
  WORT: { reich: 7, heilung: 55 },
  SCHUTZKREIS: { radius: 3, schutz: 35, magie: 15, dauer: 4 },   // magie: Punkte auf die Magieverteidigung
  GOETTLICH: { radius: 6, anteil: 0.3, heilig: 50 },
  BEISTAND: { radius: 3, magie: 5 },
  STICH: { weite: 3.5, schaden: 38, hinten: 0.25 },
  GIFT: { hiebe: 3, jeSek: 6, dauer: 3 },
  HINRICHTUNG: { reich: 2.2, schaden: 110, unter: 0.25, plus: 0.75 },
  NACHBLUTEN: { jeSek: 3, dauer: 3 },
  MAL: { reich: 10, dauer: 7, plus: 0.12 },
  BOLZEN: { schaden: 28, langsam: 0.4, dauer: 2.5 },
  ERLEGEN: { schaden: 100, mal: 0.25, unter: 0.35, plus: 0.4 },
  DURCHBRECHEN: { abwehr: 10, dauer: 3, sperre: 5 },              // senkt Nah- und Fernkampfverteidigung des Ziels
};

export const HELDEN: Record<string, HeldDef> = {
  schildwaechter: { name: "Torvald", titel: "Der Schildwächter", klasse: "Krieger", rolle: "Verteidiger an der Front", bild: "img/figuren/schildwaechter.jpg", figur: "img/echtzeit/torvald.webp", gross: 1.065, lauf: "img/echtzeit/torvald-lauf.webp", laufMass: [0.5, 0.946, 0.855], hieb: "img/echtzeit/torvald-hieb.webp", hiebMass: [0.5, 0.955, 0.855], schild: "img/echtzeit/torvald-schild.webp", schildStand: "img/echtzeit/torvald-schild-stand.webp", schildFuss: [0.46, 0.95, 1.15],
    lp: 320, tempo: 3.3, angriff: { nah: 100, fern: 55, magie: 25 }, abwehr: { nah: 90, fern: 80, magie: 45 },
    modi: [{ name: "Langschwert", art: "nah", schaden: [18, 30], takt: 0.9, reich: 1.6, text: "Nahkampf. Treffer verlangsamen den Gegner kurz (Festnageln)." },
      { name: "Schild", art: "nah", schaden: [0, 0], takt: 1, reich: 0, schild: true, text: "Kein Angriff. Torvald hält den Schild dem Gegner entgegen: Von vorn treffen ihn Nahkampfangriffe 60 % seltener, Fernkampf 40 %, Magie 20 %. Er läuft 15 % langsamer. Fähigkeiten gehen weiter." }],
    q: { name: "Schildstoß", zeit: 8, text: "Stürmt bis zu 2,5 Felder vor, 30 Schaden, stößt den Gegner zurück." },
    e: { name: "Bollwerk", zeit: 14, text: "3 Sekunden deutlich stärkerer Block. Verbündete direkt hinter Torvald sind mitgeschützt." },
    r: { name: "Schild von Grauwacht", zeit: 80, text: "Gegner im Umkreis von 6 Feldern greifen Torvald an. Verbündete in der Nähe bekommen 80 Schutzpunkte." },
    passiv: "Festnageln: Schwerttreffer verlangsamen um 15 % für 1,5 Sekunden (je Gegner höchstens alle 3 Sekunden)." },
  elementarist: { name: "Vaelin", titel: "Der Elementarist", klasse: "Magier", rolle: "Flächenschaden aus der Ferne", bild: "img/figuren/elementarist.jpg", figur: "img/echtzeit/vaelin.webp", fuss: [0.55, 0.96], gross: 1.075, lauf: "img/echtzeit/vaelin-lauf.webp", laufMass: [0.516, 0.91, 0.81], hieb: "img/echtzeit/vaelin-zauber.webp", hiebMass: [0.47, 0.982, 0.80], hieb2: "img/echtzeit/vaelin-schlag.webp", hieb2Mass: [0.45, 0.926, 0.824],
    lp: 210, tempo: 3.4, angriff: { nah: 25, fern: 25, magie: 115 }, abwehr: { nah: 25, fern: 35, magie: 70 },
    modi: [{ name: "Elementarstab", art: "magie", schaden: [16, 30], takt: 1.2, reich: 8, flug: 13, text: "Magisches Geschoss aus der Ferne." },
      { name: "Stabschlag", art: "nah", schaden: [5, 13], takt: 0.9, reich: 1.5, text: "Schwacher Nahkampfschlag zur Selbstverteidigung, stößt leicht zurück." }],
    q: { name: "Frosthauch", zeit: 9, text: "Eiswolke (Radius 2): 24 Magieschaden, verlangsamt um 30 % für 2 Sekunden." },
    e: { name: "Donnerwelle", zeit: 14, text: "Blitz (Radius 2): 42 Magieschaden, stößt Gegner zurück." },
    r: { name: "Glutsphäre", zeit: 75, text: "Feuerexplosion (Radius 3): 85 Magieschaden, danach 8 Schaden je Sekunde für 3 Sekunden." },
    passiv: "Zauberformung: Vaelins Flächenzauber treffen keine Verbündeten." },
  lichtbringer: { name: "Elara", titel: "Die Lichtbringerin", klasse: "Kleriker", rolle: "Heilerin, stark gegen Untote", bild: "img/figuren/lichtbringer.jpg", figur: "img/echtzeit/elara.webp", fuss: [0.42, 0.965], gross: 1.07, lauf: "img/echtzeit/elara-lauf.webp", laufMass: [0.44, 0.957, 0.875], hieb: "img/echtzeit/elara-heil.webp", hiebMass: [0.42, 0.955, 0.867], hieb2: "img/echtzeit/elara-hieb.webp", hieb2Mass: [0.42, 0.94, 0.77],
    lp: 270, tempo: 3.5, angriff: { nah: 65, fern: 25, magie: 100 }, abwehr: { nah: 65, fern: 55, magie: 65 },
    modi: [{ name: "Heilstab", art: "heil", schaden: [10, 18], takt: 2.2, reich: 6, text: "Heilt einen Verbündeten (oder Elara selbst) um 10 bis 18. Ohne gewähltes Ziel: wer am schwersten verletzt ist. Heilung braucht keinen Trefferwurf." },
      { name: "Streitkolben", art: "nah", schaden: [15, 27], takt: 1.0, reich: 1.5, untot: 0.15, text: "Nahkampf, 15 % mehr Schaden gegen Untote." }],
    q: { name: "Heilendes Wort", zeit: 8, text: "Heilt einen Verbündeten in bis zu 7 Feldern um 55." },
    e: { name: "Schutzkreis", zeit: 16, text: "Kreis (Radius 3) um Elara: Verbündete bekommen 35 Schutzpunkte und 15 Magieverteidigung für 4 Sekunden." },
    r: { name: "Göttliches Licht", zeit: 90, text: "Heilt Verbündete im Umkreis von 6 Feldern um 30 % ihres Höchstlebens. Untote dort erleiden 50 heiligen Schaden." },
    passiv: "Beistand: Verbündete im Umkreis von 3 Feldern haben 5 Magieverteidigung mehr." },
  assassine: { name: "Vex", titel: "Der Assassine", klasse: "Schurke", rolle: "Schneller Einzelschaden", bild: "img/figuren/assassine.jpg", figur: "img/echtzeit/vex.webp", fuss: [0.5, 0.95], gross: 1.07, lauf: "img/echtzeit/vex-lauf.webp", laufMass: [0.47, 0.93, 0.885], hieb: "img/echtzeit/vex-dolch.webp", hiebMass: [0.45, 0.975, 0.895], hieb2: "img/echtzeit/vex-schuss.webp", hieb2Mass: [0.46, 0.985, 0.925],
    lp: 220, tempo: 4.4, angriff: { nah: 110, fern: 90, magie: 15 }, abwehr: { nah: 45, fern: 70, magie: 30 },
    modi: [{ name: "Dolch", art: "nah", schaden: [7, 18], takt: 0.55, reich: 1.5, text: "Sehr schneller Nahkampf. Jeder Treffer lässt den Gegner nachbluten." },
      { name: "Armbrust", art: "fern", schaden: [19, 32], takt: 1.2, reich: 7.5, flug: 16, text: "Fernkampf aus sicherem Abstand." }],
    q: { name: "Schattenstich", zeit: 7, text: "Springt bis zu 3,5 Felder auf ein Ziel: 38 Schaden, von hinten 25 % mehr." },
    e: { name: "Giftklinge", zeit: 14, text: "Die nächsten 3 Dolchtreffer vergiften: 6 Schaden je Sekunde für 3 Sekunden." },
    r: { name: "Hinrichtung", zeit: 75, text: "110 Schaden an einem Ziel in Nahkampfreichweite; unter 25 % Leben 75 % mehr (nicht bei Bossen)." },
    passiv: "Nachbluten: Dolchtreffer verursachen 3 Schaden je Sekunde für 3 Sekunden (wird erneuert, nicht gestapelt)." },
  kopfgeldjaeger: { name: "Orin", titel: "Der Kopfgeldjäger", klasse: "Waldläufer", rolle: "Gezielter Fernkampf", bild: "img/figuren/kopfgeldjaeger.jpg", figur: "img/echtzeit/orin.webp", fuss: [0.46, 0.95], gross: 1.07, lauf: "img/echtzeit/orin-lauf.webp", laufMass: [0.46, 0.941, 0.854], hieb: "img/echtzeit/orin-schuss.webp", hiebMass: [0.48, 0.98, 0.925], hieb2: "img/echtzeit/orin-messer.webp", hieb2Mass: [0.47, 0.959, 0.9],
    lp: 245, tempo: 3.9, angriff: { nah: 45, fern: 115, magie: 20 }, abwehr: { nah: 55, fern: 75, magie: 40 },
    modi: [{ name: "Schwere Armbrust", art: "fern", schaden: [25, 45], takt: 1.45, reich: 9, flug: 18, text: "Hoher Einzelschaden. Treffer senken die Verteidigung des Ziels (Durchbrechen)." },
      { name: "Jagdmesser", art: "nah", schaden: [8, 16], takt: 0.85, reich: 1.5, text: "Schneller Nahkampf zur Selbstverteidigung." }],
    q: { name: "Jägermal", zeit: 10, text: "Markiert einen Gegner für 7 Sekunden: Orins Angriffe machen dort 12 % mehr Schaden." },
    e: { name: "Lähmender Bolzen", zeit: 14, text: "28 Schaden, verlangsamt das Ziel um 40 % für 2,5 Sekunden." },
    r: { name: "Erlegen", zeit: 80, text: "Schuss mit 100 Schaden; gegen ein markiertes Ziel 25 % mehr, unter 35 % Leben weitere 40 % mehr." },
    passiv: "Durchbrechen: Treffer der schweren Armbrust senken Nah- und Fernkampfverteidigung um 10 für 3 Sekunden (je Gegner höchstens alle 5 Sekunden)." },
};
export const HELDENREIHE = ["schildwaechter", "elementarist", "lichtbringer", "assassine", "kopfgeldjaeger"];

export interface MonsterDef { name: string; /** Kampfregeln v1: eigenes Level (Anzeige; die Werte stehen fest am Gegner) */ stufe?: number; bild: string; figur?: string; fuss?: [number, number]; gross?: number; lauf?: string; laufMass?: [number, number, number]; hieb?: string; hiebMass?: [number, number, number]; ruhe?: string; ruheMass?: [number, number, number]; hoehe?: number; links?: boolean; /* links: die Vorlagen blicken nach links */ lp: number; tempo: number; angriffswert: Werte; abwehr: Werte; r: number; untot?: boolean; anfaellig?: "wucht"; boss?: boolean;
  angriff: { name: string; art: Schadensart; schaden: [number, number]; takt: number; reich: number; aushol: number };
  /* Spezialangriff auf eine Fläche: Der Gegner hält inne und lädt (laden Sekunden), die Fläche ist am Boden zu sehen; dann trifft er jeden, der noch darin steht. alle: Pause bis zum nächsten Mal. */
  /* fest: bewegt sich nicht und greift nicht an (z. B. Laich). unsichtbar: kein eigenes Bild – es ist schon auf die Karte gemalt. brut: bringt alle takt Sekunden ein Junges hervor, höchstens max zugleich und gesamt insgesamt. */
  /* aufstehen: fällt der Gegner, steht er einmal wieder auf – mit diesem Anteil seines Lebens (Moorleichen) */
  aufstehen?: number;
  /** Verkleidung (#49): wer einen dieser Gegenstände angelegt hat, wird nicht von selbst angegriffen (Rabenkapuze → Novizen friedlich) – wer angreift, bekommt Gegenwehr */
  friedlichMit?: string[];
  /** Stilwechsel (#49): im Kampf reihum diese Stile, je sek Sekunden (Federmutter: Schwerter, dann Federn) – angriff und v2 ersetzen die Grundwerte, v2 Feld für Feld */
  stile?: { sek: number; name?: string; angriff?: { name: string; art: Schadensart; schaden: [number, number]; takt: number; reich: number; aushol: number }; v2?: Partial<GegnerV3>; text?: string }[];
  /** flieht einmal je Leben unter diesem Anteil seines Lebens zum nächsten Lagerkumpan und kämpft dort weiter (Banditen-Späher: 0,25) – shared/sim.ts fliehen */
  fliehen?: number;
  /** Offene Welt: greift von selbst an (Standard ja) und ab welcher Entfernung in Feldern (Standard: aggro des Gebiets, sonst 5). Nach AGGRO_DAUER greift er einen Helden nicht mehr von selbst an. */
  /** gemeinsame Welt: Sekunden, bis er nach dem Besiegen wieder dasteht (sonst WELT_WIEDERKEHR) */ wiederkehr?: number; /** Gegnerfamilie (Waffen mit „gegen“ treffen sie härter): wald = Waldgolem, Mooshocker */ familie?: string;
  aggressiv?: boolean; aggroReich?: number;
  /** sonst friedlich, aber gegen Helden, für die dieser Schalter an ist (QuestDef.schalter, setzt der Server), im Umkreis von weit Feldern aggressiv – z. B. Mooshocker nach ihrer Quest (#81) */ aggressivNach?: { schalter: string; weit: number }; /** greift nur Helden unter diesem Heldenlevel von selbst an (stärkere lässt er in Ruhe, bis sie angreifen) */ aggroBisLevel?: number;
  /** Drop-Tabelle (offene Welt) als Rolls: jeder Roll wählt höchstens einen Eintrag (Chancen in Prozent, zusammen ≤ 100; der Rest ist „nichts“).
   *  anzahl [min, max] (Standard 1). nur: der Roll zählt nur, wenn der Bezwinger diese Bedingung erfüllt (z. B. „einsteigerquest“ begonnen) – sonst fällt nichts. */
  drops?: { nur?: string; wurf: { g: string; chance: number; anzahl?: [number, number] }[] }[];
  /** Kampfregeln v3 (OSRS-Rechnung): die Skill-Level der Kampfart (Nahkampf: Geschick und Stärke; Fernkampf; Magie), Defense- und Magie-Level und Verteidigungsboni gegen alle drei Angriffsarten.
   *  Würfe und Max Hit rechnet kampfwerte.ts gegnerWerte() wie OSRS für Monster (Level + 9). Angriffstakt in Ticks (1 Tick = 0,5 s). */
  v2?: GegnerV3;
  /** Untersuchen (Bestiarium): kurzer Text über das Wesen */
  info?: string;
  fest?: boolean; unsichtbar?: boolean; /** Zielscheibe: unverwundbar, greift nicht an, keine Beute; Treffer melden sich als Ereignis „treffer“ (Phase 2) */ zielscheibe?: boolean; brut?: { art: string; takt: number; max: number; gesamt: number };
  spezial?: { name: string; laden: number; alle: number; radius: number; reich: number; schaden: [number, number]; art: Schadensart; bild?: string; mass?: [number, number, number] } }
/* Stärke der Gegner: hängt an der Stufe der Aufgabe und an der Zahl der Helden. Die Grundwerte in MONSTER gelten für Stufe 1 … und werden hiermit malgenommen.
   Stufe 1 ist Einsteigerniveau (0,6-fach), je Stufe 0,15 mehr. Leben wächst je weiterem Helden um die Hälfte, der Schaden um ein Zehntel. Im Riss gilt 1. */
export const STAERKE: { lp: number; schaden: number; beute: [number, number] | null; bossMal: number; ep: number } = { lp: 1, schaden: 1, beute: null, bossMal: 6, ep: 0 };
/* ep: Erfahrung je besiegtem Gegner = seine Lebenspunkte, wie er gegen EINEN Helden wäre (Stufenfaktor), geteilt durch 10. Größere Gruppen bekommen also nicht mehr – aber jeder Held im Team bekommt sie ganz. Im Riss gibt es keine (0). */
/* Stufen der Helden: 1 bis 10. EP_BIS[s] = gesamte Erfahrung, ab der Stufe s erreicht ist. Weidenhain einmal gespielt gibt rund 190 EP. */
export const STUFE_MAX = 10;
export const EP_BIS = [0, 0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];
export const stufeAusEp = (ep: number): number => { let s = 1; while (s < STUFE_MAX && ep >= EP_BIS[s + 1]) s++; return s; };
/** Was eine Stufe gegenüber Stufe 1 bringt */
export const STUFENBONUS = (s: number) => ({ lp: 0.05 * (s - 1), angriff: 3 * (s - 1), abwehr: 3 * (s - 1), schaden: 0.03 * (s - 1), abklingen: s >= 10 ? 0.2 : s >= 5 ? 0.1 : 0 });
/** Stufen der Helden in der laufenden Simulation (vom Spielstand gesetzt; fehlt ein Held, gilt Stufe 1) */
export const HELDENSTUFE: Record<string, number> = {};
/** Erfahrung der Helden beim Anlegen einer Simulation (vom Spielstand gesetzt). Daraus steigen sie mitten im Kampf auf. */
export const HELDENEP: Record<string, number> = {};
/* beute: Seelensplitter je besiegtem Gegner (von–bis), nach Stufe der Aufgabe: Stufe 1 gibt 2–5, jede weitere Stufe 1–2 mehr. Ein Boss gibt das Sechsfache.
   Ist beute gesetzt (Kampagne), bleiben die Splitter am Boden liegen und werden im Darüberlaufen aufgehoben; der Kampf läuft nach dem Sieg weiter, bis man ihn verlässt. */
export function setzeStaerke(stufe: number, helden: number): void { const g = 0.45 + 0.15 * stufe, n = Math.max(1, Math.min(3, helden)); STAERKE.lp = g * (0.5 + 0.5 * n); STAERKE.schaden = g * (1 + 0.1 * (n - 1)); STAERKE.beute = [1 + stufe, 3 + 2 * stufe]; STAERKE.ep = g; }
export const MONSTER: Record<string, MonsterDef> = {
  knochenwaechter: { name: "Knochenwächter", bild: "img/gegner/knochenwaechter.jpg", figur: "img/echtzeit/kw.webp", fuss: [0.62, 0.95], gross: 1.065, lauf: "img/echtzeit/kw-lauf.webp", laufMass: [0.52, 0.93, 0.65], hieb: "img/echtzeit/kw-hieb.webp", hiebMass: [0.55, 0.935, 0.75], links: true, lp: 150, tempo: 3.3, angriffswert: { nah: 70, fern: 0, magie: 0 }, abwehr: { nah: 70, fern: 55, magie: 35 }, r: 0.38, untot: true, anfaellig: "wucht",
    angriff: { name: "Kurzschwert", art: "nah", schaden: [10, 20], takt: 1.2, reich: 1.5, aushol: 0.45 } }, // aushol: so lange holt er sichtbar aus – wer dann außer Reichweite ist, wird nicht getroffen
  /* Weidenhain. Werte aus dem Würfelspiel umgerechnet wie beim Knochenwächter (TP 13 → 150 LP, RK 13 → Verteidigung 70, Angriffsbonus +4 → 70, Schaden 1W6+2 → 10–20):
     Schlammkröte TP 18, RK 11, +4, 1W8+2, Reichweite 2 · Irrlicht TP 6, RK 14, +4, 1W6+1, Reichweite 4, flink · alte Unke TP 34, RK 12, +5, 1W8+3, holt vor dem Schlag Luft.
     Das Irrlicht ist im Nahkampf schwer zu treffen; Fernkampf und Zauber holen es herunter. */
  schlammkroete: { name: "Riesenkröte", bild: "img/gegner/schlammkroete.jpg", figur: "img/echtzeit/kroete.webp", fuss: [0.5, 0.9], lauf: "img/echtzeit/kroete-lauf.webp", laufMass: [0.507, 0.88, 0.604], hieb: "img/echtzeit/kroete-hieb.webp", hiebMass: [0.5, 0.87, 0.581], hoehe: 90, lp: 210, tempo: 2.4, angriffswert: { nah: 70, fern: 0, magie: 0 }, abwehr: { nah: 60, fern: 50, magie: 40 }, r: 0.36,
    angriff: { name: "Zunge", art: "nah", schaden: [12, 24], takt: 1.6, reich: 2.5, aushol: 0.55 } }, // langsam, aber die Zunge reicht weit
  kroetchen: { name: "Junge Kröte", bild: "img/gegner/schlammkroete.jpg", figur: "img/echtzeit/kroete.webp", fuss: [0.5, 0.9], lauf: "img/echtzeit/kroete-lauf.webp", laufMass: [0.507, 0.88, 0.604], hieb: "img/echtzeit/kroete-hieb.webp", hiebMass: [0.5, 0.87, 0.581], hoehe: 58, lp: 80, tempo: 2.9, angriffswert: { nah: 55, fern: 0, magie: 0 }, abwehr: { nah: 45, fern: 40, magie: 35 }, r: 0.28,
    angriff: { name: "Zunge", art: "nah", schaden: [6, 12], takt: 1.3, reich: 1.8, aushol: 0.45 } }, // frisch geschlüpft: klein, flink, harmloser
  /* Bandit Level 1 (Kampfregeln v1): 40 LP, Nahkampf-Angriff 5 (Stärke 2 + 3), Verteidigung 5/3/2, Dolch 3–6 alle 2 s – Schild und Dolch der Figur sind nur Optik.
     Kreuzwald: Banditen mit Dolch und Beuteschild (Figur aus der Fabrik, gegner.bandit v003). Für Anfänger: wenig Leben, schnelle, schwache Stiche;
     auf der Lichtung als Gegner der Stufe 3 (setzeStaerke), damit sie zu frischen Helden passen. */
  bandit_dolch: { name: "Bandit", stufe: 1, bild: "img/echtzeit/bandit.webp", figur: "img/echtzeit/bandit.webp", fuss: [0.5, 0.94], lauf: "img/echtzeit/bandit.webp", laufMass: [0.5, 0.94, 0.84], hieb: "img/echtzeit/bandit.webp", hiebMass: [0.5, 0.94, 0.84], hoehe: 84, lp: 6, tempo: 2.9, angriffswert: { nah: 5, fern: 1, magie: 0 }, abwehr: { nah: 5, fern: 3, magie: 2 }, r: 0.3,
    angriff: { name: "Dolch", art: "nah", schaden: [1, 1], takt: 2.0, reich: 1.5, aushol: 0 },
    /* v3 (Simulation 23.11.2026, Helden starten mit 10 LP und Max Hit 1): Nahkämpfer – Geschick 5 = Trefferwert 5 · Stärke 1 → Max Hit 1 (ab Stärke 7: 2) · Abwehr 4/4/3 · 6 LP */
    v2: { geschick: 1, staerke: 1, defense: 1, magie: 1, ticks: 4, abwehr: { nah: 0, fern: 0, magie: 0 } }, /* OSRS-Rechnung: ein Level-1-Monster ohne Boni (Simulation 23.11.2026) */
    drops: [ /* 1. Splitter · 2. Ausrüstung oder Kleiner Heiltrank · 3. Hinweispergament, nur mit dem Quest-Auftrag, es zu sichern */
      { wurf: [{ g: "splitter", chance: 95, anzahl: [1, 5] }, { g: "splitter", chance: 5, anzahl: [15, 20] }] },
      { wurf: [{ g: "ritterschwert", chance: 1 }, { g: "rundschild", chance: 1 }, { g: "jagdbogen", chance: 1 }, { g: "hirtenstab", chance: 1 }, { g: "lederpanzer", chance: 1 }, { g: "magiepanzer", chance: 1 }, { g: "kleiner_heiltrank", chance: 8 }] }, /* 2. Wurf: je 1 % Trainingsausrüstung, 8 % Kleiner Heiltrank */
      { nur: "einsteigerquest", wurf: [{ g: "hinweispergament", chance: 35 }] }] },
  /* Mooshocker (Quest „Der stille Rain“, Osthof, 23.11.2026): passiver Trainingsgegner wie die Sand Crab in OSRS – viel Leben, Max Hit 1, langsam, greift nie von selbst an.
     Für Helden um Kampflevel 5–6 gedacht (gut eine Minute je Mooshocker), ab Level 1 machbar. Modell img/figuren-echt3d/mooshocker3d.glb. */
  mooshocker: { name: "Mooshocker", familie: "wald", stufe: 1, bild: "img/echtzeit/bandit.webp", hoehe: 62, lp: 40, tempo: 1.5, angriffswert: { nah: 1, fern: 0, magie: 0 }, abwehr: { nah: 1, fern: 1, magie: 1 }, r: 0.4, aggressiv: false,
    angriff: { name: "Kopfstoß", art: "nah", schaden: [1, 1], takt: 3.0, reich: 1.5, aushol: 0 },
    v2: { geschick: 1, staerke: 1, defense: 1, magie: 1, angriffBonus: -50, ticks: 6, abwehr: { nah: 0, fern: 0, magie: 0 } }, /* trifft selten (Angriffsbonus −50): Simulation – Level 1: 98–100 % Siege, 110–150 s, −2 bis −4 LP · Kampflevel 6–7: 55–70 s (Stab 128 s), −1 LP */
    info: "Ein gedrungenes Wesen mit einem breiten, moosbewachsenen Panzer. Es bewegt sich langsam und sucht feuchte Steine, an denen es seinen Rücken reibt. Es wirkt träge, hält aber erstaunlich viel aus. Bei Bedrängnis stößt es mit dem Kopf nach seinem Angreifer." },
  /* Kuh (Handwerk, Gehege im Osthof, 25.11.2026): friedlich, Level 1, 10 Lebenspunkte, lässt immer eine Kuhhaut fallen, steht nach 20 s wieder da. Modell img/figuren-echt3d/kuh3d.glb. */
  kuh: { name: "Kuh", stufe: 1, bild: "img/echtzeit/bandit.webp", hoehe: 50, lp: 10, tempo: 1.2, angriffswert: { nah: 1, fern: 0, magie: 0 }, abwehr: { nah: 1, fern: 1, magie: 1 }, r: 0.45, aggressiv: false, wiederkehr: 20,
    angriff: { name: "Kopfstoß", art: "nah", schaden: [0, 1], takt: 3.0, reich: 1.5, aushol: 0 },
    v2: { geschick: 1, staerke: 1, defense: 1, magie: 1, angriffBonus: -60, ticks: 6, abwehr: { nah: 0, fern: 0, magie: 0 } },
    drops: [{ wurf: [{ g: "kuhhaut", chance: 100 }] }, { wurf: [{ g: "kuhfleisch", chance: 100 }] }] /* Phase 3b: Kuhfleisch für den Bauerneintopf */,
    info: "Eine gutmütige Kuh mit kastanienbraunen Flecken. Sie kaut, schaut und stößt höchstens einmal mit dem Kopf, wenn man sie ärgert." },
  /* Waldgolem (Nordwald, verfallene Feste, 24.11.2026): Level 15, wie ein OSRS-Monster – schlägt selten, aber hart (Max Hit 5 aus Stärke 36), langsam (6 Ticks),
     Holz: Pfeile bleiben stecken (+20 Fern), Magie trifft gut (−10). Greift nur Helden unter Level 15 von selbst an. Modell img/figuren-echt3d/waldgolem3d.glb.
     Simulation (Heldenlevel 15, Einfach-Ausrüstung, ohne Tränke): Schwert 90 % Siege, 42 s, 62 % LP übrig · Bogen 83 %, 34 s, 45 % · Stab 89 %, 24 s, 51 %. */
  waldgolem: { name: "Waldgolem", familie: "wald", stufe: 15, bild: "img/echtzeit/bandit.webp", hoehe: 134, lp: 30, tempo: 1.6, angriffswert: { nah: 6, fern: 0, magie: 0 }, abwehr: { nah: 12, fern: 12, magie: 3 }, r: 0.5, aggroBisLevel: 15, aggroReich: 4,
    angriff: { name: "Faustschlag", art: "nah", schaden: [1, 5], takt: 3.0, reich: 1.5, aushol: 0 },
    v2: { geschick: 6, staerke: 36, defense: 12, magie: 3, ticks: 6, abwehr: { nah: 10, fern: 20, magie: -10 } },
    info: "Ein hünenhaftes Wesen aus Wurzelholz, Moos und altem Mauerstein. Es bewegt sich schwerfällig und trifft selten – doch wenn seine Faust trifft, dann mit aller Wucht. Pfeile bleiben in seiner Rinde stecken; Zauber setzen ihm sichtlich zu.",
    /* Beute (Phase 2, 26.11.2026): 1. Golemstein · 2. Splitter oder ein Eichenstamm · 3. Steintafel-Bruchstück, nur im passenden Schritt von A2 „Das Wappen mit dem Turm“ */
    drops: [{ wurf: [{ g: "golemstein", chance: 60, anzahl: [1, 2] }] },
      { wurf: [{ g: "splitter", chance: 50, anzahl: [5, 15] }, { g: "stamm_eiche", chance: 20 }] },
      { nur: "a2_steintafel", wurf: [{ g: "steintafel", chance: 30 }] }] },
  /* Zielscheibe (Phase 2 „Waldland“, A1): Strohscheibe neben dem Südturm der Waldmark – unverwundbar, greift nie an, keine Beute. Fernkampf-XP nur bis Fernkampf 10. */
  zielscheibe: { name: "Zielscheibe", bild: "img/echtzeit/bandit.webp", hoehe: 160, lp: 100, tempo: 0, fest: true, zielscheibe: true, aggressiv: false, angriffswert: { nah: 0, fern: 0, magie: 0 }, abwehr: { nah: 0, fern: 0, magie: 0 }, r: 0.5,
    angriff: { name: "–", art: "nah", schaden: [0, 0], takt: 99, reich: 0, aushol: 0 },
    info: "Eine Strohscheibe auf einem Holzgestell, bemalt mit drei Ringen. Hier üben die Wachen der Waldmark – bis Fernkampf 10 lernst du daran etwas, danach nicht mehr." },
  laich: { name: "Krötenlaich", bild: "img/gegner/schlammkroete.jpg", fest: true, unsichtbar: true, lp: 170, tempo: 0, angriffswert: { nah: 0, fern: 0, magie: 0 }, abwehr: { nah: 20, fern: 35, magie: 30 }, r: 0.6,
    angriff: { name: "–", art: "nah", schaden: [0, 0], takt: 99, reich: 0, aushol: 0 }, brut: { art: "kroetchen", takt: 9, max: 2, gesamt: 3 } }, // liegt im Tümpel; solange er heil ist, schlüpfen Junge
  moorleiche: { name: "Moorleiche", bild: "img/gegner/moorleiche.jpg", figur: "img/echtzeit/moorleiche.webp", fuss: [0.433, 0.957], lauf: "img/echtzeit/moorleiche-lauf.webp", laufMass: [0.433, 0.957, 0.936], hieb: "img/echtzeit/moorleiche-hieb.webp", hiebMass: [0.438, 0.945, 0.912], ruhe: "img/echtzeit/moorleiche-ruhe.webp", ruheMass: [0.482, 0.979, 0.958], hoehe: 88, lp: 190, tempo: 1.9, angriffswert: { nah: 72, fern: 0, magie: 0 }, abwehr: { nah: 50, fern: 60, magie: 35 }, r: 0.38, untot: true, aufstehen: 0.5,
    angriff: { name: "Nasser Griff", art: "nah", schaden: [16, 28], takt: 1.9, reich: 1.6, aushol: 0.6 } }, // langsam und zäh; steht einmal wieder auf
  alwine: { name: "Alwine, die Stumme", bild: "img/gegner/alwine.jpg", figur: "img/echtzeit/alwine.webp", fuss: [0.456, 1.192], lauf: "img/echtzeit/alwine-lauf.webp", laufMass: [0.456, 1.192, 0.92], hieb: "img/echtzeit/alwine-hieb.webp", hiebMass: [0.436, 1.167, 0.906], hoehe: 120, lp: 1000, tempo: 2.4, angriffswert: { nah: 0, fern: 0, magie: 78 }, abwehr: { nah: 60, fern: 60, magie: 70 }, r: 0.5, boss: true, untot: true,
    angriff: { name: "Kalte Hand", art: "magie", schaden: [14, 24], takt: 1.8, reich: 5, aushol: 0.6 },
    brut: { art: "irrlicht", takt: 13, max: 2, gesamt: 5 }, /* ruft Irrlichter herbei */
    spezial: { name: "Wehklage", laden: 3, alle: 12, radius: 3, reich: 9, schaden: [70, 100], art: "magie", bild: "img/echtzeit/alwine-spezial.webp", mass: [0.439, 1.163, 0.902] } },
  kornsack: { name: "Kornsack", bild: "img/gegner/schlammkroete.jpg", figur: "img/echtzeit/kornsack.webp", fuss: [0.5, 0.975], hoehe: 78, fest: true, lp: 150, tempo: 0, angriffswert: { nah: 0, fern: 0, magie: 0 }, abwehr: { nah: 20, fern: 20, magie: 20 }, r: 0.4,
    angriff: { name: "–", art: "nah", schaden: [0, 0], takt: 99, reich: 0, aushol: 0 } }, // Schützling im Kornspeicher
  irrlicht: { name: "Irrlicht", bild: "img/gegner/irrlicht.jpg", figur: "img/echtzeit/irrlicht.webp", fuss: [0.5, 1.09], ruhe: "img/echtzeit/irrlicht-ruhe.webp", ruheMass: [0.482, 0.99, 0.816], hieb: "img/echtzeit/irrlicht-hieb.webp", hiebMass: [0.436, 0.983, 0.809], hoehe: 82, /* schwebt: die Bodenlinie liegt unter der Figur */ lp: 70, tempo: 4.2, angriffswert: { nah: 0, fern: 0, magie: 70 }, abwehr: { nah: 85, fern: 55, magie: 50 }, r: 0.28,
    angriff: { name: "Kalter Funke", art: "magie", schaden: [8, 16], takt: 2.0, reich: 5.5, aushol: 0.6 } }, // bleibt auf Abstand und wirft Funken
  alte_unke: { name: "Die alte Unke", bild: "img/gegner/schlammkroete.jpg", figur: "img/echtzeit/unke.webp", fuss: [0.5, 0.9], lauf: "img/echtzeit/unke-lauf.webp", laufMass: [0.504, 0.851, 0.712], hieb: "img/echtzeit/unke-hieb.webp", hiebMass: [0.489, 0.889, 0.758], hoehe: 160, lp: 900, tempo: 2.1, angriffswert: { nah: 85, fern: 0, magie: 0 }, abwehr: { nah: 65, fern: 55, magie: 45 }, r: 0.62, boss: true,
    angriff: { name: "Zungenschlag", art: "nah", schaden: [8, 14], takt: 2.0, reich: 2.8, aushol: 0.5 }, /* viel Leben, leichter Standardangriff – gefährlich ist der Giftschwall */
    spezial: { name: "Giftschwall", laden: 4, alle: 11, radius: 2.4, reich: 5, schaden: [110, 150], art: "magie", bild: "img/echtzeit/unke-spezial.webp", mass: [0.49, 0.867, 0.803] } }, // holt lange Luft: wer dann aus der Reichweite geht, wird nicht getroffen
  /* Der Boss in der Siegelkammer. Werte frei gesetzt, nicht abgestimmt. */
  knochenfuerst: { name: "Knochenfürst", bild: "img/gegner/grabritter.jpg", figur: "img/echtzeit/boss.webp", fuss: [0.55, 0.96], hoehe: 118, lauf: "img/echtzeit/boss-lauf.webp", laufMass: [0.5, 0.94, 0.66], hieb: "img/echtzeit/boss-hieb.webp", hiebMass: [0.5, 0.905, 0.6], ruhe: "img/echtzeit/boss-ruhe.webp", ruheMass: [0.48, 0.945, 0.91],
    lp: 520, tempo: 3.0, angriffswert: { nah: 100, fern: 0, magie: 0 }, abwehr: { nah: 85, fern: 70, magie: 50 }, r: 0.55, untot: true, boss: true,
    angriff: { name: "Knochenklinge", art: "nah", schaden: [20, 36], takt: 1.7, reich: 1.9, aushol: 0.6 } },
};

/** Trefferchance aus Angriffs- und Verteidigungswert (beide würfeln 0 bis Wert, der höhere Angriffswurf trifft) */
export const trefferchance = (a: number, d: number) => (a > d ? 1 - (d + 2) / (2 * (a + 1)) : a / (2 * (d + 1)));
