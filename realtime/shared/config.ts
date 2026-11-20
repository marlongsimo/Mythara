/*
 * Mythara Echtzeit – die Wertetabelle (Kampfsystem 0.1). Server und Client lesen dieselben Zahlen.
 * Längen in Feldern, Zeiten in Sekunden. Wer am Balancing dreht, ändert nur diese Datei.
 *
 * Treffer nach dem Prinzip von Old School RuneScape, zwei getrennte Würfe:
 *  1. Trefferwurf: Der Angreifer würfelt 0 bis Angriffswert (für Nahkampf, Fernkampf oder Magie), der Verteidiger 0 bis Verteidigungswert für genau diese Art. Der höhere Angriffswurf trifft.
 *  2. Schadenswurf: Bei einem Treffer wird zwischen Mindest- und Höchstschaden der Waffe gewürfelt.
 * Verteidigung senkt also die Trefferchance, nicht den Schaden. Torvalds Schild erhöht seinen Verteidigungswurf; Schutzpunkte fangen Schaden ab.
 */
export const TICK = 20;            // Rechenschritte je Sekunde (Server-Simulation)
export const DT = 1 / TICK;
export const ZUSTAND_JE = 1;       // jeder Schritt geht an den Client: 20 Zustände je Sekunde
export const PROTOKOLL = 2;

export type Schadensart = "nah" | "fern" | "magie";            // physischer Nahkampf, physischer Fernkampf, Magie
export type Werte = Record<Schadensart, number>;                  // je Angriffsart ein Wert
export interface Modus { name: string; art: Schadensart | "heil"; schaden: [number, number]; /* Mindest- und Höchstschaden (oder Heilung) */ takt: number; reich: number; flug?: number; wucht?: boolean; untot?: number; schild?: boolean; text: string }
export interface Faehigkeit { name: string; zeit: number; text: string }
export interface HeldDef { name: string; titel: string; klasse: string; rolle: string; bild: string; figur?: string; lauf?: string; hieb?: string; schild?: string; /* schild: Laufbilder für die zweite Waffe */ hieb2?: string; hiebMass?: [number, number, number]; hieb2Mass?: [number, number, number]; /* hieb: Angriffsbilder der ersten Waffe, hieb2: der zweiten; Maße wie laufMass */ schildStand?: string; schildFuss?: [number, number, number]; laufMass?: [number, number, number]; /* schildStand: Standbild der zweiten Waffe, schildFuss: Füße von links, von oben, Maßstab; laufMass: bei den Laufbildern Füße von links, von oben und Anteil des Felds, der der Körperhöhe entspricht */ fuss?: [number, number]; gross?: number; /* fuss: wo im Standbild die Füße stehen (Anteil von links, von oben); gross: Maßstab, wenn das Bild über den Kopf hinausragt */
  lp: number; tempo: number; angriff: Werte; abwehr: Werte; modi: [Modus, Modus]; q: Faehigkeit; e: Faehigkeit; r: Faehigkeit; passiv: string }

export const K = {
  /* Trefferwurf */
  TREFFERWURF: true,                       // false: jeder Angriff trifft
  /* Fähigkeiten: Der Wert in der Tabelle ist der Höchstschaden. Räumlich treffende Fähigkeiten (Flächen, Sprünge) brauchen keinen Trefferwurf. */
  FAEHIG_MIN: 0.7,                         // Mindestschaden einer Fähigkeit als Anteil am Höchstschaden
  /* Fernkampf: Wer schießt oder zaubert, steht dafür kurz still. Nahkämpfer schlagen auch im Laufen zu. */
  AUSHOLEN_FERN: 0.3,
  /* Erholung: Wer eine Weile keinen Schaden nimmt, heilt von selbst */
  ERHOLUNG: { nach: 5, jeSek: 0.04 },      // nach 5 s ohne Schaden: 4 % des Höchstlebens je Sekunde
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
  schildwaechter: { name: "Torvald", titel: "Der Schildwächter", klasse: "Krieger", rolle: "Verteidiger an der Front", bild: "img/figuren/schildwaechter.jpg", figur: "img/echtzeit/torvald.webp", lauf: "img/echtzeit/torvald-lauf.webp", hieb: "img/echtzeit/torvald-hieb.webp", schild: "img/echtzeit/torvald-schild.webp", schildStand: "img/echtzeit/torvald-schild-stand.webp", schildFuss: [0.46, 0.95, 1.08],
    lp: 320, tempo: 3.3, angriff: { nah: 100, fern: 55, magie: 25 }, abwehr: { nah: 90, fern: 80, magie: 45 },
    modi: [{ name: "Langschwert", art: "nah", schaden: [18, 30], takt: 0.9, reich: 1.6, text: "Nahkampf. Treffer verlangsamen den Gegner kurz (Festnageln)." },
      { name: "Schild", art: "nah", schaden: [0, 0], takt: 1, reich: 0, schild: true, text: "Kein Angriff. Torvald hält den Schild dem Gegner entgegen: Von vorn treffen ihn Nahkampfangriffe 60 % seltener, Fernkampf 40 %, Magie 20 %. Er läuft 15 % langsamer. Fähigkeiten gehen weiter." }],
    q: { name: "Schildstoß", zeit: 8, text: "Stürmt bis zu 2,5 Felder vor, 30 Schaden, stößt den Gegner zurück." },
    e: { name: "Bollwerk", zeit: 14, text: "3 Sekunden deutlich stärkerer Block. Verbündete direkt hinter Torvald sind mitgeschützt." },
    r: { name: "Schild von Grauwacht", zeit: 80, text: "Gegner im Umkreis von 6 Feldern greifen Torvald an. Verbündete in der Nähe bekommen 80 Schutzpunkte." },
    passiv: "Festnageln: Schwerttreffer verlangsamen um 15 % für 1,5 Sekunden (je Gegner höchstens alle 3 Sekunden)." },
  elementarist: { name: "Vaelin", titel: "Der Elementarist", klasse: "Magier", rolle: "Flächenschaden aus der Ferne", bild: "img/figuren/elementarist.jpg",
    lp: 210, tempo: 3.4, angriff: { nah: 25, fern: 25, magie: 115 }, abwehr: { nah: 25, fern: 35, magie: 70 },
    modi: [{ name: "Elementarstab", art: "magie", schaden: [16, 30], takt: 1.2, reich: 8, flug: 13, text: "Magisches Geschoss aus der Ferne." },
      { name: "Stabschlag", art: "nah", schaden: [5, 13], takt: 0.9, reich: 1.5, text: "Schwacher Nahkampfschlag zur Selbstverteidigung, stößt leicht zurück." }],
    q: { name: "Frosthauch", zeit: 9, text: "Eiswolke (Radius 2): 24 Magieschaden, verlangsamt um 30 % für 2 Sekunden." },
    e: { name: "Donnerwelle", zeit: 14, text: "Blitz (Radius 2): 42 Magieschaden, stößt Gegner zurück." },
    r: { name: "Glutsphäre", zeit: 75, text: "Feuerexplosion (Radius 3): 85 Magieschaden, danach 8 Schaden je Sekunde für 3 Sekunden." },
    passiv: "Zauberformung: Vaelins Flächenzauber treffen keine Verbündeten." },
  lichtbringer: { name: "Elara", titel: "Die Lichtbringerin", klasse: "Kleriker", rolle: "Heilerin, stark gegen Untote", bild: "img/figuren/lichtbringer.jpg", figur: "img/echtzeit/elara.webp", fuss: [0.42, 0.965], gross: 1.27, lauf: "img/echtzeit/elara-lauf.webp", laufMass: [0.44, 0.957, 0.735], hieb: "img/echtzeit/elara-heil.webp", hiebMass: [0.42, 0.955, 0.754], hieb2: "img/echtzeit/elara-hieb.webp", hieb2Mass: [0.42, 0.94, 0.66],
    lp: 270, tempo: 3.5, angriff: { nah: 65, fern: 25, magie: 100 }, abwehr: { nah: 65, fern: 55, magie: 65 },
    modi: [{ name: "Heilstab", art: "heil", schaden: [10, 18], takt: 1.2, reich: 6, text: "Heilt einen Verbündeten (oder Elara selbst) um 10 bis 18. Ohne gewähltes Ziel: wer am schwersten verletzt ist. Heilung braucht keinen Trefferwurf." },
      { name: "Streitkolben", art: "nah", schaden: [15, 27], takt: 1.0, reich: 1.5, untot: 0.15, text: "Nahkampf, 15 % mehr Schaden gegen Untote." }],
    q: { name: "Heilendes Wort", zeit: 8, text: "Heilt einen Verbündeten in bis zu 7 Feldern um 55." },
    e: { name: "Schutzkreis", zeit: 16, text: "Kreis (Radius 3) um Elara: Verbündete bekommen 35 Schutzpunkte und 15 Magieverteidigung für 4 Sekunden." },
    r: { name: "Göttliches Licht", zeit: 90, text: "Heilt Verbündete im Umkreis von 6 Feldern um 30 % ihres Höchstlebens. Untote dort erleiden 50 heiligen Schaden." },
    passiv: "Beistand: Verbündete im Umkreis von 3 Feldern haben 5 Magieverteidigung mehr." },
  assassine: { name: "Vex", titel: "Der Assassine", klasse: "Schurke", rolle: "Schneller Einzelschaden", bild: "img/figuren/assassine.jpg",
    lp: 220, tempo: 4.4, angriff: { nah: 110, fern: 90, magie: 15 }, abwehr: { nah: 45, fern: 70, magie: 30 },
    modi: [{ name: "Dolch", art: "nah", schaden: [7, 18], takt: 0.55, reich: 1.5, text: "Sehr schneller Nahkampf. Jeder Treffer lässt den Gegner nachbluten." },
      { name: "Armbrust", art: "fern", schaden: [19, 32], takt: 1.2, reich: 7.5, flug: 16, text: "Fernkampf aus sicherem Abstand." }],
    q: { name: "Schattenstich", zeit: 7, text: "Springt bis zu 3,5 Felder auf ein Ziel: 38 Schaden, von hinten 25 % mehr." },
    e: { name: "Giftklinge", zeit: 14, text: "Die nächsten 3 Dolchtreffer vergiften: 6 Schaden je Sekunde für 3 Sekunden." },
    r: { name: "Hinrichtung", zeit: 75, text: "110 Schaden an einem Ziel in Nahkampfreichweite; unter 25 % Leben 75 % mehr (nicht bei Bossen)." },
    passiv: "Nachbluten: Dolchtreffer verursachen 3 Schaden je Sekunde für 3 Sekunden (wird erneuert, nicht gestapelt)." },
  kopfgeldjaeger: { name: "Orin", titel: "Der Kopfgeldjäger", klasse: "Waldläufer", rolle: "Gezielter Fernkampf", bild: "img/figuren/kopfgeldjaeger.jpg", figur: "img/echtzeit/orin.webp", fuss: [0.46, 0.95], gross: 1.1, lauf: "img/echtzeit/orin-lauf.webp", laufMass: [0.46, 0.941, 0.854], hieb: "img/echtzeit/orin-schuss.webp", hiebMass: [0.48, 0.98, 0.898], hieb2: "img/echtzeit/orin-messer.webp", hieb2Mass: [0.47, 0.959, 0.872],
    lp: 245, tempo: 3.9, angriff: { nah: 45, fern: 115, magie: 20 }, abwehr: { nah: 55, fern: 75, magie: 40 },
    modi: [{ name: "Schwere Armbrust", art: "fern", schaden: [25, 45], takt: 1.45, reich: 9, flug: 18, text: "Hoher Einzelschaden. Treffer senken die Verteidigung des Ziels (Durchbrechen)." },
      { name: "Jagdmesser", art: "nah", schaden: [8, 16], takt: 0.85, reich: 1.5, text: "Schneller Nahkampf zur Selbstverteidigung." }],
    q: { name: "Jägermal", zeit: 10, text: "Markiert einen Gegner für 7 Sekunden: Orins Angriffe machen dort 12 % mehr Schaden." },
    e: { name: "Lähmender Bolzen", zeit: 14, text: "28 Schaden, verlangsamt das Ziel um 40 % für 2,5 Sekunden." },
    r: { name: "Erlegen", zeit: 80, text: "Schuss mit 100 Schaden; gegen ein markiertes Ziel 25 % mehr, unter 35 % Leben weitere 40 % mehr." },
    passiv: "Durchbrechen: Treffer der schweren Armbrust senken Nah- und Fernkampfverteidigung um 10 für 3 Sekunden (je Gegner höchstens alle 5 Sekunden)." },
};
export const HELDENREIHE = ["schildwaechter", "elementarist", "lichtbringer", "assassine", "kopfgeldjaeger"];

export interface MonsterDef { name: string; bild: string; lp: number; tempo: number; angriffswert: Werte; abwehr: Werte; r: number; untot?: boolean; anfaellig?: "wucht"; boss?: boolean;
  angriff: { name: string; art: Schadensart; schaden: [number, number]; takt: number; reich: number; aushol: number } }
export const MONSTER: Record<string, MonsterDef> = {
  knochenwaechter: { name: "Knochenwächter", bild: "img/gegner/knochenwaechter.jpg", lp: 150, tempo: 3.3, angriffswert: { nah: 70, fern: 0, magie: 0 }, abwehr: { nah: 70, fern: 55, magie: 35 }, r: 0.38, untot: true, anfaellig: "wucht",
    angriff: { name: "Kurzschwert", art: "nah", schaden: [10, 20], takt: 1.2, reich: 1.5, aushol: 0.45 } }, // aushol: so lange holt er sichtbar aus – wer dann außer Reichweite ist, wird nicht getroffen
};

/** Trefferchance aus Angriffs- und Verteidigungswert (beide würfeln 0 bis Wert, der höhere Angriffswurf trifft) */
export const trefferchance = (a: number, d: number) => (a > d ? 1 - (d + 2) / (2 * (a + 1)) : a / (2 * (d + 1)));
