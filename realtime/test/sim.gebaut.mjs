// shared/config.ts
var TICK = 20;
var DT = 1 / TICK;
var ZUSTAND_JE = 1;
var PROTOKOLL = 2;
var K = {
  /* Trefferwurf */
  TREFFERWURF: true,
  // false: jeder Angriff trifft
  /* Fähigkeiten: Der Wert in der Tabelle ist der Höchstschaden. Räumlich treffende Fähigkeiten (Flächen, Sprünge) brauchen keinen Trefferwurf. */
  FAEHIG_MIN: 0.7,
  // Mindestschaden einer Fähigkeit als Anteil am Höchstschaden
  /* Fernkampf: Wer schießt oder zaubert, steht dafür kurz still. Nahkämpfer schlagen auch im Laufen zu. */
  AUSHOLEN_FERN: 0.3,
  /* Erholung: Wer eine Weile keinen Schaden nimmt, heilt von selbst */
  ERHOLUNG: { nach: 5, jeSek: 0.015 },
  // nach 5 s ohne Schaden: 1,5 % des Höchstlebens je Sekunde
  /* Torvalds Schild (zweiter Waffenmodus): von vorn wird er um diesen Anteil seltener getroffen (sein Verteidigungswurf steigt entsprechend).
     Gegen Flächen ohne Trefferwurf mindert der Schild stattdessen den Schaden um „flaeche“. */
  BLOCK: { nah: 0.6, fern: 0.4, magie: 0.2, flaeche: 0.05, winkel: 70, tempo: 0.85 },
  // winkel: so viele Grad links und rechts der Blickrichtung
  BOLLWERK: { dauer: 3, plus: 0.25, hinter: 0.35 },
  // zusätzliche Minderung für Torvald; Verbündete direkt hinter ihm bekommen „hinter“
  MINDERUNG_MAX: 0.8,
  // mehr als 80 % bringen Schild und Bollwerk zusammen nie
  WUCHT: 0.5,
  // Wuchtangriffe gegen Gegner mit dieser Schwäche: +50 %
  WECHSEL: 0.4,
  // so lange dauert der Waffenwechsel (Sperre)
  R_HELD: 0.36,
  SICHT: 7,
  AGGRO: 5.5,
  LEINE: 10,
  // Monster: ab wann sie angreifen, wie weit sie ihrem Lager folgen
  WIEDER_HELD: 5,
  HEIM_HEILUNG: 0.15,
  HEIM_HEILUNG_BOSS: 0.02,
  // Monster, die niemanden mehr verfolgen, heilen an ihrem Platz so viel ihres Lebens je Sekunde
  SPLITTER: [1, 20],
  EINGABEN_JE_SEK: 30,
  /* Einzelne Fähigkeiten */
  FESTNAGELN: { langsam: 0.15, dauer: 1.5, sperre: 3 },
  STOSS: { weite: 2.5, schaden: 30, zurueck: 1.6 },
  SCHILD_GRAUWACHT: { radius: 6, schutz: 80, schutzDauer: 6, spott: 4 },
  FROST: { reich: 8, radius: 2, schaden: 24, langsam: 0.3, dauer: 2 },
  DONNER: { reich: 7, radius: 2, schaden: 42, zurueck: 1.5 },
  GLUT: { reich: 8, radius: 3, schaden: 85, brand: 8, dauer: 3, flug: 9 },
  WORT: { reich: 7, heilung: 55 },
  SCHUTZKREIS: { radius: 3, schutz: 35, magie: 15, dauer: 4 },
  // magie: Punkte auf die Magieverteidigung
  GOETTLICH: { radius: 6, anteil: 0.3, heilig: 50 },
  BEISTAND: { radius: 3, magie: 5 },
  STICH: { weite: 3.5, schaden: 38, hinten: 0.25 },
  GIFT: { hiebe: 3, jeSek: 6, dauer: 3 },
  HINRICHTUNG: { reich: 2.2, schaden: 110, unter: 0.25, plus: 0.75 },
  NACHBLUTEN: { jeSek: 3, dauer: 3 },
  MAL: { reich: 10, dauer: 7, plus: 0.12 },
  BOLZEN: { schaden: 28, langsam: 0.4, dauer: 2.5 },
  ERLEGEN: { schaden: 100, mal: 0.25, unter: 0.35, plus: 0.4 },
  DURCHBRECHEN: { abwehr: 10, dauer: 3, sperre: 5 }
  // senkt Nah- und Fernkampfverteidigung des Ziels
};
var HELDEN = {
  schildwaechter: {
    name: "Torvald",
    titel: "Der Schildw\xE4chter",
    klasse: "Krieger",
    rolle: "Verteidiger an der Front",
    bild: "img/figuren/schildwaechter.jpg",
    figur: "img/echtzeit/torvald.webp",
    gross: 1.065,
    lauf: "img/echtzeit/torvald-lauf.webp",
    laufMass: [0.5, 0.946, 0.855],
    hieb: "img/echtzeit/torvald-hieb.webp",
    hiebMass: [0.5, 0.955, 0.855],
    schild: "img/echtzeit/torvald-schild.webp",
    schildStand: "img/echtzeit/torvald-schild-stand.webp",
    schildFuss: [0.46, 0.95, 1.15],
    lp: 320,
    tempo: 3.3,
    angriff: { nah: 100, fern: 55, magie: 25 },
    abwehr: { nah: 90, fern: 80, magie: 45 },
    modi: [
      { name: "Langschwert", art: "nah", schaden: [18, 30], takt: 0.9, reich: 1.6, text: "Nahkampf. Treffer verlangsamen den Gegner kurz (Festnageln)." },
      { name: "Schild", art: "nah", schaden: [0, 0], takt: 1, reich: 0, schild: true, text: "Kein Angriff. Torvald h\xE4lt den Schild dem Gegner entgegen: Von vorn treffen ihn Nahkampfangriffe 60 % seltener, Fernkampf 40 %, Magie 20 %. Er l\xE4uft 15 % langsamer. F\xE4higkeiten gehen weiter." }
    ],
    q: { name: "Schildsto\xDF", zeit: 8, text: "St\xFCrmt bis zu 2,5 Felder vor, 30 Schaden, st\xF6\xDFt den Gegner zur\xFCck." },
    e: { name: "Bollwerk", zeit: 14, text: "3 Sekunden deutlich st\xE4rkerer Block. Verb\xFCndete direkt hinter Torvald sind mitgesch\xFCtzt." },
    r: { name: "Schild von Grauwacht", zeit: 80, text: "Gegner im Umkreis von 6 Feldern greifen Torvald an. Verb\xFCndete in der N\xE4he bekommen 80 Schutzpunkte." },
    passiv: "Festnageln: Schwerttreffer verlangsamen um 15 % f\xFCr 1,5 Sekunden (je Gegner h\xF6chstens alle 3 Sekunden)."
  },
  elementarist: {
    name: "Vaelin",
    titel: "Der Elementarist",
    klasse: "Magier",
    rolle: "Fl\xE4chenschaden aus der Ferne",
    bild: "img/figuren/elementarist.jpg",
    figur: "img/echtzeit/vaelin.webp",
    fuss: [0.55, 0.96],
    gross: 1.075,
    lauf: "img/echtzeit/vaelin-lauf.webp",
    laufMass: [0.516, 0.91, 0.81],
    hieb: "img/echtzeit/vaelin-zauber.webp",
    hiebMass: [0.47, 0.982, 0.8],
    hieb2: "img/echtzeit/vaelin-schlag.webp",
    hieb2Mass: [0.45, 0.926, 0.824],
    lp: 210,
    tempo: 3.4,
    angriff: { nah: 25, fern: 25, magie: 115 },
    abwehr: { nah: 25, fern: 35, magie: 70 },
    modi: [
      { name: "Elementarstab", art: "magie", schaden: [16, 30], takt: 1.2, reich: 8, flug: 13, text: "Magisches Geschoss aus der Ferne." },
      { name: "Stabschlag", art: "nah", schaden: [5, 13], takt: 0.9, reich: 1.5, text: "Schwacher Nahkampfschlag zur Selbstverteidigung, st\xF6\xDFt leicht zur\xFCck." }
    ],
    q: { name: "Frosthauch", zeit: 9, text: "Eiswolke (Radius 2): 24 Magieschaden, verlangsamt um 30 % f\xFCr 2 Sekunden." },
    e: { name: "Donnerwelle", zeit: 14, text: "Blitz (Radius 2): 42 Magieschaden, st\xF6\xDFt Gegner zur\xFCck." },
    r: { name: "Glutsph\xE4re", zeit: 75, text: "Feuerexplosion (Radius 3): 85 Magieschaden, danach 8 Schaden je Sekunde f\xFCr 3 Sekunden." },
    passiv: "Zauberformung: Vaelins Fl\xE4chenzauber treffen keine Verb\xFCndeten."
  },
  lichtbringer: {
    name: "Elara",
    titel: "Die Lichtbringerin",
    klasse: "Kleriker",
    rolle: "Heilerin, stark gegen Untote",
    bild: "img/figuren/lichtbringer.jpg",
    figur: "img/echtzeit/elara.webp",
    fuss: [0.42, 0.965],
    gross: 1.07,
    lauf: "img/echtzeit/elara-lauf.webp",
    laufMass: [0.44, 0.957, 0.875],
    hieb: "img/echtzeit/elara-heil.webp",
    hiebMass: [0.42, 0.955, 0.867],
    hieb2: "img/echtzeit/elara-hieb.webp",
    hieb2Mass: [0.42, 0.94, 0.77],
    lp: 270,
    tempo: 3.5,
    angriff: { nah: 65, fern: 25, magie: 100 },
    abwehr: { nah: 65, fern: 55, magie: 65 },
    modi: [
      { name: "Heilstab", art: "heil", schaden: [10, 18], takt: 2.2, reich: 6, text: "Heilt einen Verb\xFCndeten (oder Elara selbst) um 10 bis 18. Ohne gew\xE4hltes Ziel: wer am schwersten verletzt ist. Heilung braucht keinen Trefferwurf." },
      { name: "Streitkolben", art: "nah", schaden: [15, 27], takt: 1, reich: 1.5, untot: 0.15, text: "Nahkampf, 15 % mehr Schaden gegen Untote." }
    ],
    q: { name: "Heilendes Wort", zeit: 8, text: "Heilt einen Verb\xFCndeten in bis zu 7 Feldern um 55." },
    e: { name: "Schutzkreis", zeit: 16, text: "Kreis (Radius 3) um Elara: Verb\xFCndete bekommen 35 Schutzpunkte und 15 Magieverteidigung f\xFCr 4 Sekunden." },
    r: { name: "G\xF6ttliches Licht", zeit: 90, text: "Heilt Verb\xFCndete im Umkreis von 6 Feldern um 30 % ihres H\xF6chstlebens. Untote dort erleiden 50 heiligen Schaden." },
    passiv: "Beistand: Verb\xFCndete im Umkreis von 3 Feldern haben 5 Magieverteidigung mehr."
  },
  assassine: {
    name: "Vex",
    titel: "Der Assassine",
    klasse: "Schurke",
    rolle: "Schneller Einzelschaden",
    bild: "img/figuren/assassine.jpg",
    figur: "img/echtzeit/vex.webp",
    fuss: [0.5, 0.95],
    gross: 1.07,
    lauf: "img/echtzeit/vex-lauf.webp",
    laufMass: [0.47, 0.93, 0.885],
    hieb: "img/echtzeit/vex-dolch.webp",
    hiebMass: [0.45, 0.975, 0.895],
    hieb2: "img/echtzeit/vex-schuss.webp",
    hieb2Mass: [0.46, 0.985, 0.925],
    lp: 220,
    tempo: 4.4,
    angriff: { nah: 110, fern: 90, magie: 15 },
    abwehr: { nah: 45, fern: 70, magie: 30 },
    modi: [
      { name: "Dolch", art: "nah", schaden: [7, 18], takt: 0.55, reich: 1.5, text: "Sehr schneller Nahkampf. Jeder Treffer l\xE4sst den Gegner nachbluten." },
      { name: "Armbrust", art: "fern", schaden: [19, 32], takt: 1.2, reich: 7.5, flug: 16, text: "Fernkampf aus sicherem Abstand." }
    ],
    q: { name: "Schattenstich", zeit: 7, text: "Springt bis zu 3,5 Felder auf ein Ziel: 38 Schaden, von hinten 25 % mehr." },
    e: { name: "Giftklinge", zeit: 14, text: "Die n\xE4chsten 3 Dolchtreffer vergiften: 6 Schaden je Sekunde f\xFCr 3 Sekunden." },
    r: { name: "Hinrichtung", zeit: 75, text: "110 Schaden an einem Ziel in Nahkampfreichweite; unter 25 % Leben 75 % mehr (nicht bei Bossen)." },
    passiv: "Nachbluten: Dolchtreffer verursachen 3 Schaden je Sekunde f\xFCr 3 Sekunden (wird erneuert, nicht gestapelt)."
  },
  kopfgeldjaeger: {
    name: "Orin",
    titel: "Der Kopfgeldj\xE4ger",
    klasse: "Waldl\xE4ufer",
    rolle: "Gezielter Fernkampf",
    bild: "img/figuren/kopfgeldjaeger.jpg",
    figur: "img/echtzeit/orin.webp",
    fuss: [0.46, 0.95],
    gross: 1.07,
    lauf: "img/echtzeit/orin-lauf.webp",
    laufMass: [0.46, 0.941, 0.854],
    hieb: "img/echtzeit/orin-schuss.webp",
    hiebMass: [0.48, 0.98, 0.925],
    hieb2: "img/echtzeit/orin-messer.webp",
    hieb2Mass: [0.47, 0.959, 0.9],
    lp: 245,
    tempo: 3.9,
    angriff: { nah: 45, fern: 115, magie: 20 },
    abwehr: { nah: 55, fern: 75, magie: 40 },
    modi: [
      { name: "Schwere Armbrust", art: "fern", schaden: [25, 45], takt: 1.45, reich: 9, flug: 18, text: "Hoher Einzelschaden. Treffer senken die Verteidigung des Ziels (Durchbrechen)." },
      { name: "Jagdmesser", art: "nah", schaden: [8, 16], takt: 0.85, reich: 1.5, text: "Schneller Nahkampf zur Selbstverteidigung." }
    ],
    q: { name: "J\xE4germal", zeit: 10, text: "Markiert einen Gegner f\xFCr 7 Sekunden: Orins Angriffe machen dort 12 % mehr Schaden." },
    e: { name: "L\xE4hmender Bolzen", zeit: 14, text: "28 Schaden, verlangsamt das Ziel um 40 % f\xFCr 2,5 Sekunden." },
    r: { name: "Erlegen", zeit: 80, text: "Schuss mit 100 Schaden; gegen ein markiertes Ziel 25 % mehr, unter 35 % Leben weitere 40 % mehr." },
    passiv: "Durchbrechen: Treffer der schweren Armbrust senken Nah- und Fernkampfverteidigung um 10 f\xFCr 3 Sekunden (je Gegner h\xF6chstens alle 5 Sekunden)."
  }
};
var HELDENREIHE = ["schildwaechter", "elementarist", "lichtbringer", "assassine", "kopfgeldjaeger"];
var STAERKE = { lp: 1, schaden: 1, beute: null, bossMal: 6, ep: 0 };
var STUFE_MAX = 10;
var EP_BIS = [0, 0, 100, 250, 450, 700, 1e3, 1400, 1900, 2500, 3200];
var stufeAusEp = (ep) => {
  let s = 1;
  while (s < STUFE_MAX && ep >= EP_BIS[s + 1]) s++;
  return s;
};
var STUFENBONUS = (s) => ({ lp: 0.05 * (s - 1), angriff: 3 * (s - 1), abwehr: 3 * (s - 1), schaden: 0.03 * (s - 1), abklingen: s >= 10 ? 0.2 : s >= 5 ? 0.1 : 0 });
var HELDENSTUFE = {};
var HELDENEP = {};
function setzeStaerke(stufe, helden) {
  const g = 0.45 + 0.15 * stufe, n = Math.max(1, Math.min(3, helden));
  STAERKE.lp = g * (0.5 + 0.5 * n);
  STAERKE.schaden = g * (1 + 0.1 * (n - 1));
  STAERKE.beute = [1 + stufe, 3 + 2 * stufe];
  STAERKE.ep = g;
}
var MONSTER = {
  knochenwaechter: {
    name: "Knochenw\xE4chter",
    bild: "img/gegner/knochenwaechter.jpg",
    figur: "img/echtzeit/kw.webp",
    fuss: [0.62, 0.95],
    gross: 1.065,
    lauf: "img/echtzeit/kw-lauf.webp",
    laufMass: [0.52, 0.93, 0.65],
    hieb: "img/echtzeit/kw-hieb.webp",
    hiebMass: [0.55, 0.935, 0.75],
    links: true,
    lp: 150,
    tempo: 3.3,
    angriffswert: { nah: 70, fern: 0, magie: 0 },
    abwehr: { nah: 70, fern: 55, magie: 35 },
    r: 0.38,
    untot: true,
    anfaellig: "wucht",
    angriff: { name: "Kurzschwert", art: "nah", schaden: [10, 20], takt: 1.2, reich: 1.5, aushol: 0.45 }
  },
  // aushol: so lange holt er sichtbar aus – wer dann außer Reichweite ist, wird nicht getroffen
  /* Weidenhain. Werte aus dem Würfelspiel umgerechnet wie beim Knochenwächter (TP 13 → 150 LP, RK 13 → Verteidigung 70, Angriffsbonus +4 → 70, Schaden 1W6+2 → 10–20):
     Schlammkröte TP 18, RK 11, +4, 1W8+2, Reichweite 2 · Irrlicht TP 6, RK 14, +4, 1W6+1, Reichweite 4, flink · alte Unke TP 34, RK 12, +5, 1W8+3, holt vor dem Schlag Luft.
     Das Irrlicht ist im Nahkampf schwer zu treffen; Fernkampf und Zauber holen es herunter. */
  schlammkroete: {
    name: "Riesenkr\xF6te",
    bild: "img/gegner/schlammkroete.jpg",
    figur: "img/echtzeit/kroete.webp",
    fuss: [0.5, 0.9],
    lauf: "img/echtzeit/kroete-lauf.webp",
    laufMass: [0.507, 0.88, 0.604],
    hieb: "img/echtzeit/kroete-hieb.webp",
    hiebMass: [0.5, 0.87, 0.581],
    hoehe: 90,
    lp: 210,
    tempo: 2.4,
    angriffswert: { nah: 70, fern: 0, magie: 0 },
    abwehr: { nah: 60, fern: 50, magie: 40 },
    r: 0.36,
    angriff: { name: "Zunge", art: "nah", schaden: [12, 24], takt: 1.6, reich: 2.5, aushol: 0.55 }
  },
  // langsam, aber die Zunge reicht weit
  kroetchen: {
    name: "Junge Kr\xF6te",
    bild: "img/gegner/schlammkroete.jpg",
    figur: "img/echtzeit/kroete.webp",
    fuss: [0.5, 0.9],
    lauf: "img/echtzeit/kroete-lauf.webp",
    laufMass: [0.507, 0.88, 0.604],
    hieb: "img/echtzeit/kroete-hieb.webp",
    hiebMass: [0.5, 0.87, 0.581],
    hoehe: 58,
    lp: 80,
    tempo: 2.9,
    angriffswert: { nah: 55, fern: 0, magie: 0 },
    abwehr: { nah: 45, fern: 40, magie: 35 },
    r: 0.28,
    angriff: { name: "Zunge", art: "nah", schaden: [6, 12], takt: 1.3, reich: 1.8, aushol: 0.45 }
  },
  // frisch geschlüpft: klein, flink, harmloser
  laich: {
    name: "Kr\xF6tenlaich",
    bild: "img/gegner/schlammkroete.jpg",
    fest: true,
    unsichtbar: true,
    lp: 170,
    tempo: 0,
    angriffswert: { nah: 0, fern: 0, magie: 0 },
    abwehr: { nah: 20, fern: 35, magie: 30 },
    r: 0.6,
    angriff: { name: "\u2013", art: "nah", schaden: [0, 0], takt: 99, reich: 0, aushol: 0 },
    brut: { art: "kroetchen", takt: 9, max: 2, gesamt: 3 }
  },
  // liegt im Tümpel; solange er heil ist, schlüpfen Junge
  moorleiche: {
    name: "Moorleiche",
    bild: "img/gegner/moorleiche.jpg",
    figur: "img/echtzeit/moorleiche.webp",
    fuss: [0.433, 0.957],
    lauf: "img/echtzeit/moorleiche-lauf.webp",
    laufMass: [0.433, 0.957, 0.936],
    hieb: "img/echtzeit/moorleiche-hieb.webp",
    hiebMass: [0.438, 0.945, 0.912],
    ruhe: "img/echtzeit/moorleiche-ruhe.webp",
    ruheMass: [0.482, 0.979, 0.958],
    hoehe: 88,
    lp: 190,
    tempo: 1.9,
    angriffswert: { nah: 72, fern: 0, magie: 0 },
    abwehr: { nah: 50, fern: 60, magie: 35 },
    r: 0.38,
    untot: true,
    aufstehen: 0.5,
    angriff: { name: "Nasser Griff", art: "nah", schaden: [16, 28], takt: 1.9, reich: 1.6, aushol: 0.6 }
  },
  // langsam und zäh; steht einmal wieder auf
  alwine: {
    name: "Alwine, die Stumme",
    bild: "img/gegner/alwine.jpg",
    figur: "img/echtzeit/alwine.webp",
    fuss: [0.456, 1.192],
    lauf: "img/echtzeit/alwine-lauf.webp",
    laufMass: [0.456, 1.192, 0.92],
    hieb: "img/echtzeit/alwine-hieb.webp",
    hiebMass: [0.436, 1.167, 0.906],
    hoehe: 120,
    lp: 1e3,
    tempo: 2.4,
    angriffswert: { nah: 0, fern: 0, magie: 78 },
    abwehr: { nah: 60, fern: 60, magie: 70 },
    r: 0.5,
    boss: true,
    untot: true,
    angriff: { name: "Kalte Hand", art: "magie", schaden: [14, 24], takt: 1.8, reich: 5, aushol: 0.6 },
    brut: { art: "irrlicht", takt: 13, max: 2, gesamt: 5 },
    /* ruft Irrlichter herbei */
    spezial: { name: "Wehklage", laden: 3, alle: 12, radius: 3, reich: 9, schaden: [70, 100], art: "magie", bild: "img/echtzeit/alwine-spezial.webp", mass: [0.439, 1.163, 0.902] }
  },
  kornsack: {
    name: "Kornsack",
    bild: "img/gegner/schlammkroete.jpg",
    figur: "img/echtzeit/kornsack.webp",
    fuss: [0.5, 0.975],
    hoehe: 78,
    fest: true,
    lp: 150,
    tempo: 0,
    angriffswert: { nah: 0, fern: 0, magie: 0 },
    abwehr: { nah: 20, fern: 20, magie: 20 },
    r: 0.4,
    angriff: { name: "\u2013", art: "nah", schaden: [0, 0], takt: 99, reich: 0, aushol: 0 }
  },
  // Schützling im Kornspeicher
  irrlicht: {
    name: "Irrlicht",
    bild: "img/gegner/irrlicht.jpg",
    figur: "img/echtzeit/irrlicht.webp",
    fuss: [0.5, 1.09],
    ruhe: "img/echtzeit/irrlicht-ruhe.webp",
    ruheMass: [0.482, 0.99, 0.816],
    hieb: "img/echtzeit/irrlicht-hieb.webp",
    hiebMass: [0.436, 0.983, 0.809],
    hoehe: 82,
    /* schwebt: die Bodenlinie liegt unter der Figur */
    lp: 70,
    tempo: 4.2,
    angriffswert: { nah: 0, fern: 0, magie: 70 },
    abwehr: { nah: 85, fern: 55, magie: 50 },
    r: 0.28,
    angriff: { name: "Kalter Funke", art: "magie", schaden: [8, 16], takt: 2, reich: 5.5, aushol: 0.6 }
  },
  // bleibt auf Abstand und wirft Funken
  alte_unke: {
    name: "Die alte Unke",
    bild: "img/gegner/schlammkroete.jpg",
    figur: "img/echtzeit/unke.webp",
    fuss: [0.5, 0.9],
    lauf: "img/echtzeit/unke-lauf.webp",
    laufMass: [0.504, 0.851, 0.712],
    hieb: "img/echtzeit/unke-hieb.webp",
    hiebMass: [0.489, 0.889, 0.758],
    hoehe: 160,
    lp: 900,
    tempo: 2.1,
    angriffswert: { nah: 85, fern: 0, magie: 0 },
    abwehr: { nah: 65, fern: 55, magie: 45 },
    r: 0.62,
    boss: true,
    angriff: { name: "Zungenschlag", art: "nah", schaden: [8, 14], takt: 2, reich: 2.8, aushol: 0.5 },
    /* viel Leben, leichter Standardangriff – gefährlich ist der Giftschwall */
    spezial: { name: "Giftschwall", laden: 4, alle: 11, radius: 2.4, reich: 5, schaden: [110, 150], art: "magie", bild: "img/echtzeit/unke-spezial.webp", mass: [0.49, 0.867, 0.803] }
  },
  // holt lange Luft: wer dann aus der Reichweite geht, wird nicht getroffen
  /* Der Boss in der Siegelkammer. Werte frei gesetzt, nicht abgestimmt. */
  knochenfuerst: {
    name: "Knochenf\xFCrst",
    bild: "img/gegner/grabritter.jpg",
    figur: "img/echtzeit/boss.webp",
    fuss: [0.55, 0.96],
    hoehe: 118,
    lauf: "img/echtzeit/boss-lauf.webp",
    laufMass: [0.5, 0.94, 0.66],
    hieb: "img/echtzeit/boss-hieb.webp",
    hiebMass: [0.5, 0.905, 0.6],
    ruhe: "img/echtzeit/boss-ruhe.webp",
    ruheMass: [0.48, 0.945, 0.91],
    lp: 520,
    tempo: 3,
    angriffswert: { nah: 100, fern: 0, magie: 0 },
    abwehr: { nah: 85, fern: 70, magie: 50 },
    r: 0.55,
    untot: true,
    boss: true,
    angriff: { name: "Knochenklinge", art: "nah", schaden: [20, 36], takt: 1.7, reich: 1.9, aushol: 0.6 }
  }
};
var trefferchance = (a, d) => a > d ? 1 - (d + 2) / (2 * (a + 1)) : a / (2 * (d + 1));

// shared/karte.ts
var KB = 33;
var KH = 20;
var OFFEN = [
  [1, 1, 7, 6],
  // Eingang
  [8, 3, 3, 2],
  [11, 1, 8, 7],
  // Koboldhöhle
  [14, 8, 2, 3],
  [10, 11, 10, 7],
  // Käfernest
  [20, 13, 3, 2],
  [23, 10, 9, 8],
  // Gruft
  [26, 7, 2, 3],
  [21, 1, 11, 6]
  // Siegelkammer
];
var SAEULEN = [[14, 4], [15, 4], [14, 14], [27, 14], [27, 15], [24, 3]];
var FELS = new Uint8Array(KB * KH).fill(1);
var WASSER = new Uint8Array(KB * KH);
for (const [x, y, w, h] of OFFEN) for (let i = x; i < x + w; i++) for (let j = y; j < y + h; j++) FELS[j * KB + i] = 0;
for (const [x, y] of SAEULEN) FELS[y * KB + x] = 1;
var START = [{ x: 3.5, y: 4.5 }, { x: 4.5, y: 5.5 }, { x: 2.5, y: 5.5 }];
var LAGER = [
  { art: "knochenwaechter", x: 15.5, y: 2.5, gruppe: 1 },
  { art: "knochenwaechter", x: 17.5, y: 4.5, gruppe: 1 },
  { art: "knochenwaechter", x: 12.5, y: 14.5, gruppe: 2 },
  { art: "knochenwaechter", x: 13.5, y: 16.5, gruppe: 2 },
  { art: "knochenwaechter", x: 17.5, y: 15.5, gruppe: 2 },
  { art: "knochenwaechter", x: 29.5, y: 12.5, gruppe: 3 },
  { art: "knochenwaechter", x: 29.5, y: 15.5, gruppe: 3 },
  { art: "knochenwaechter", x: 26.5, y: 16.5, gruppe: 3 },
  { art: "knochenwaechter", x: 22.5, y: 1.5, gruppe: 4 },
  { art: "knochenwaechter", x: 22.5, y: 3.5, gruppe: 4 },
  { art: "knochenwaechter", x: 30.5, y: 1.5, gruppe: 5 },
  { art: "knochenwaechter", x: 31.5, y: 5.5, gruppe: 5 },
  { art: "knochenfuerst", x: 27.5, y: 4.5, gruppe: 6 }
];
var SIEGEL = { x: 30.5, y: 3.5 };
var SCHLEUSE = null;
var PROBE = null;
var SCHUETZ = [];
var AGGRO = null;
var LEINE = null;
var karteJetzt = () => ({ KB, KH, FELS, WASSER, START, LAGER, SCHLEUSE, PROBE, SCHUETZ, AGGRO, LEINE });
function karteNehmen(k) {
  KB = k.KB;
  KH = k.KH;
  FELS = k.FELS;
  WASSER = k.WASSER;
  START = k.START;
  LAGER = k.LAGER;
  SCHLEUSE = k.SCHLEUSE;
  PROBE = k.PROBE;
  SCHUETZ = k.SCHUETZ;
  AGGRO = k.AGGRO ?? null;
  LEINE = k.LEINE ?? null;
}
var GRUNDKARTE = karteJetzt();
var fels = (i, j) => i < 0 || j < 0 || i >= KB || j >= KH || FELS[j * KB + i] === 1 || WASSER[j * KB + i] === 1;
var dicht = (x, y) => {
  const i = Math.floor(x), j = Math.floor(y);
  return i < 0 || j < 0 || i >= KB || j >= KH || FELS[j * KB + i] === 1;
};
function setzeKarte(k0, mal = 1) {
  const zm = k0.feinZeilen ? 1 : mal;
  const k = { zeilen: k0.zeilen.flatMap((z) => {
    const breit = [...z].map((c) => c.repeat(zm)).join("");
    return Array.from({ length: zm }, () => breit);
  }), start: k0.start, lager: k0.lager.map((l) => ({ ...l, x: l.x * mal, y: l.y * mal })) };
  KH = k.zeilen.length;
  KB = k.zeilen[0].length;
  FELS = new Uint8Array(KB * KH);
  WASSER = new Uint8Array(KB * KH);
  k.zeilen.forEach((z, j) => [...z].forEach((c, i) => {
    if (c === "~") WASSER[j * KB + i] = 1;
    else if (c !== ".") FELS[j * KB + i] = 1;
  }));
  START = k.start.map(([x, y]) => ({ x: (x + 0.5) * mal, y: (y + 0.5) * mal }));
  LAGER = k.lager;
  AGGRO = k0.aggro ?? null;
  LEINE = k0.leine ?? null;
  PROBE = k0.probe || null;
  SCHUETZ = (k0.schuetz || []).map((l) => ({ ...l, x: l.x * mal, y: l.y * mal }));
  const s = k0.schleuse;
  SCHLEUSE = s ? { ...s, x: s.x * mal, y: s.y * mal, quellen: s.quellen.map(([x, y]) => ({ x: x * mal, y: y * mal })) } : null;
}
var begehbar = (x, y) => !fels(Math.floor(x), Math.floor(y));
var abstand = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function frei(a, b, rand = 0) {
  const d = abstand(a, b), n = Math.max(1, Math.ceil(d / 0.2)), nx = d > 0 ? -(b.y - a.y) / d : 0, ny = d > 0 ? (b.x - a.x) / d : 0;
  for (let k = 0; k <= n; k++) {
    const x = a.x + (b.x - a.x) * k / n, y = a.y + (b.y - a.y) * k / n;
    if (rand > 0 ? !begehbar(x, y) : dicht(x, y)) return false;
    if (rand > 0 && (!begehbar(x + nx * rand, y + ny * rand) || !begehbar(x - nx * rand, y - ny * rand))) return false;
  }
  return true;
}
function schieben(e) {
  const i0 = Math.floor(e.x), j0 = Math.floor(e.y);
  for (let i = i0 - 1; i <= i0 + 1; i++) for (let j = j0 - 1; j <= j0 + 1; j++) {
    if (!fels(i, j)) continue;
    const nx = Math.max(i, Math.min(i + 1, e.x)), ny = Math.max(j, Math.min(j + 1, e.y)), dx = e.x - nx, dy = e.y - ny, d = Math.hypot(dx, dy);
    if (d >= e.r) continue;
    if (d > 1e-4) {
      e.x = nx + dx / d * e.r;
      e.y = ny + dy / d * e.r;
    } else {
      e.x = i0 + 0.5;
      e.y = j0 + 0.5;
    }
  }
}
function naechstFrei(p) {
  if (begehbar(p.x, p.y)) return { x: p.x, y: p.y };
  let best = null, bd = Infinity;
  for (let i = 0; i < KB; i++) for (let j = 0; j < KH; j++) {
    if (fels(i, j)) continue;
    const d = Math.hypot(i + 0.5 - p.x, j + 0.5 - p.y);
    if (d < bd) {
      bd = d;
      best = { x: i + 0.5, y: j + 0.5 };
    }
  }
  return best || { x: START[0].x, y: START[0].y };
}
function weg(von, nach, rand = 0.3) {
  const ziel = naechstFrei(nach), start = naechstFrei(von);
  if (frei(start, ziel, rand)) return [ziel];
  const si = Math.floor(start.x), sj = Math.floor(start.y), zi = Math.floor(ziel.x), zj = Math.floor(ziel.y), N = KB * KH;
  const g = new Float32Array(N).fill(Infinity), her = new Int32Array(N).fill(-1), zu = new Uint8Array(N), offen = [];
  const h = (i, j) => {
    const dx = Math.abs(i - zi), dy = Math.abs(j - zj);
    return Math.max(dx, dy) + 0.414 * Math.min(dx, dy);
  };
  const f = new Float32Array(N).fill(Infinity), s0 = sj * KB + si;
  g[s0] = 0;
  f[s0] = h(si, sj);
  offen.push(s0);
  while (offen.length) {
    let bi = 0;
    for (let k2 = 1; k2 < offen.length; k2++) if (f[offen[k2]] < f[offen[bi]]) bi = k2;
    const c = offen[bi];
    offen[bi] = offen[offen.length - 1];
    offen.pop();
    if (zu[c]) continue;
    zu[c] = 1;
    const ci = c % KB, cj = (c - ci) / KB;
    if (ci === zi && cj === zj) break;
    for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
      if (!di && !dj) continue;
      const i = ci + di, j = cj + dj;
      if (fels(i, j)) continue;
      if (di && dj && (fels(ci + di, cj) || fels(ci, cj + dj))) continue;
      const n = j * KB + i, kosten = g[c] + (di && dj ? 1.414 : 1);
      if (kosten < g[n]) {
        g[n] = kosten;
        her[n] = c;
        f[n] = kosten + h(i, j);
        offen.push(n);
      }
    }
  }
  const z0 = zj * KB + zi;
  if (her[z0] < 0 && z0 !== s0) return [];
  const roh = [ziel];
  for (let c = her[z0]; c >= 0 && c !== s0; c = her[c]) roh.push({ x: c % KB + 0.5, y: Math.floor(c / KB) + 0.5 });
  roh.reverse();
  const aus = [];
  let hier = start, k = 0;
  while (k < roh.length) {
    let m = k;
    for (let n = roh.length - 1; n > k; n--) if (frei(hier, roh[n], rand)) {
      m = n;
      break;
    }
    aus.push(roh[m]);
    hier = roh[m];
    k = m + 1;
  }
  return aus;
}

// shared/sim.ts
var SB = (w) => STUFENBONUS(w.held ? HELDENSTUFE[w.typ] || 1 : 1);
var BIT = { bollwerk: 1, betaeubt: 2, langsam: 4, dauer: 8, mal: 16, schild: 32, aushol: 64, schutz: 128 };
var Sim = class {
  constructor(heldTyp = "schildwaechter", seed = 1, begleiter = []) {
    this.heldTyp = heldTyp;
    this.tick = 0;
    this.zeit = 0;
    this.phase = "lauf";
    this.splitter = 0;
    this.besiegt = 0;
    this.monsterZahl = 0;
    this.wesen = [];
    this.geschosse = [];
    this.ev = [];
    this.beute = [];
    this.lauf = 1;
    /** heldTyp: der Held des Spielers. begleiter: bis zu zwei weitere Helden, die der Rechner spielt. */
    /* eigene Karte, Gegnerstärke und Heldenstufen dieser Partie (beim Anlegen übernommen, vor jedem Schritt wieder eingesetzt) */
    /* Schleuse dieses Kampfes (oder keine): offen, Fortschritt beim Schließen, Zeit bis zur nächsten Welle */
    this.sl = null;
    /* Brut (Laich): je Mutter die Zeit bis zum nächsten Jungen, wie viele schon geschlüpft sind, und die Kennungen der Jungen */
    /** Herausforderung dieses Kampfes: 0 läuft, 1 geschafft, 2 verfehlt */
    this.probe = 0;
    this.brut = /* @__PURE__ */ new Map();
    /* wer noch einmal davonhuschen kann (Irrlichter am Teich) */
    this.blinzler = /* @__PURE__ */ new Set();
    /* wer schon einmal wieder aufgestanden ist (Moorleichen) */
    this.erhoben = /* @__PURE__ */ new Set();
    this.karte = karteJetzt();
    this.staerke = { ...STAERKE };
    this.stufen = { ...HELDENSTUFE };
    this.epStand = { ...HELDENEP };
    this.zs = seed >>> 0 || 1;
    if (!HELDEN[this.heldTyp]) this.heldTyp = "schildwaechter";
    this.begleiter = (Array.isArray(begleiter) ? begleiter : []).filter((b, i, l) => HELDEN[b] && b !== this.heldTyp && l.indexOf(b) === i).slice(0, 2);
    this.aufbau();
  }
  bereit() {
    karteNehmen(this.karte);
    Object.assign(STAERKE, this.staerke);
    for (const k of Object.keys(HELDENSTUFE)) delete HELDENSTUFE[k];
    Object.assign(HELDENSTUFE, this.stufen);
  }
  zf() {
    this.zs = this.zs + 1831565813 >>> 0;
    let t = this.zs;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  neu(held, typ, team, p, bot, gruppe = 0) {
    const lp = held ? Math.round(HELDEN[typ].lp * (1 + STUFENBONUS(HELDENSTUFE[typ] || 1).lp)) : Math.round(MONSTER[typ].lp * STAERKE.lp);
    const w = {
      id: this.lauf++,
      held,
      typ,
      team,
      bot,
      x: p.x,
      y: p.y,
      r: held ? K.R_HELD : MONSTER[typ].r,
      blick: 0,
      lp,
      max: lp,
      pfad: [],
      zielId: 0,
      cdA: 0,
      cdQ: 0,
      cdE: 0,
      cdR: 0,
      cdM: 0,
      cdS: 5,
      ladeT: 0,
      ladeX: 0,
      ladeY: 0,
      modus: 0,
      tot: false,
      wieder: 0,
      heim: { x: p.x, y: p.y },
      gruppe,
      neuWeg: 0,
      rx: 0,
      ry: 0,
      fuehrer: 0,
      aushol: 0,
      ausholZiel: 0,
      bollwerk: 0,
      betaeubt: 0,
      langsamT: 0,
      langsamF: 0,
      dauer: [],
      dauerRest: 0,
      malT: 0,
      bruchT: 0,
      bruchSperre: 0,
      festSperre: 0,
      schutz: 0,
      schutzT: 0,
      mrPlusT: 0,
      spottT: 0,
      spottId: 0,
      giftHiebe: 0,
      ruhe: 99,
      wach: false
    };
    this.wesen.push(w);
    return w;
  }
  aufbau() {
    this.wesen = [];
    this.geschosse = [];
    this.beute = [];
    this.tick = 0;
    this.zeit = 0;
    this.phase = "lauf";
    this.splitter = 0;
    this.besiegt = 0;
    this.lauf = 1;
    const ich = this.neu(true, this.heldTyp, 0, START[0], false);
    this.begleiter.forEach((b, i) => {
      this.neu(true, b, 0, START[i + 1], true).fuehrer = ich.id;
    });
    this.blinzler.clear();
    this.erhoben.clear();
    for (const l of LAGER) {
      const m = this.neu(false, l.art, 1, l, true, l.gruppe);
      if (l.blinzeln) this.blinzler.add(m.id);
    }
    this.monsterZahl = LAGER.length;
    this.brut.clear();
    this.probe = 0;
    for (const l of SCHUETZ) this.neu(false, l.art, 0, l, true, 0);
    const S0 = this.karte.SCHLEUSE;
    this.sl = S0 ? { ...S0, offen: true, fort: 0, warte: S0.erst, raus: 0 } : null;
  }
  get ich() {
    return this.wesen[0];
  }
  /** Erfahrung für jeden Helden im Team; wer dabei eine Stufe erreicht, wird sofort stärker und bekommt sein Leben ganz zurück */
  erfahrung(n) {
    for (const w of this.wesen) {
      if (!w.held || w.team !== 0) continue;
      const vor = this.stufen[w.typ] || 1;
      this.epStand[w.typ] = (this.epStand[w.typ] || 0) + n;
      const nach = Math.max(vor, stufeAusEp(this.epStand[w.typ]));
      if (nach <= vor) continue;
      this.stufen[w.typ] = nach;
      HELDENSTUFE[w.typ] = nach;
      w.max = Math.round(HELDEN[w.typ].lp * (1 + STUFENBONUS(nach).lp));
      if (!w.tot) w.lp = w.max;
      this.ev.push({ a: "stufe", id: w.id, s: nach });
    }
  }
  nach(id) {
    return this.wesen.find((w) => w.id === id);
  }
  wert(w) {
    return w.held ? HELDEN[w.typ] : MONSTER[w.typ];
  }
  /** Der Angriff, der gerade gilt: beim Helden der gewählte Waffenmodus */
  waffe(w) {
    return w.held ? HELDEN[w.typ].modi[w.modus] : MONSTER[w.typ].angriff;
  }
  tempo(w) {
    return this.wert(w).tempo * (w.langsamT > 0 ? 1 - w.langsamF : 1) * (w.held && HELDEN[w.typ].modi[w.modus].schild ? K.BLOCK.tempo : 1);
  }
  feinde(w) {
    return this.wesen.filter((o) => !o.tot && o.team !== w.team);
  }
  freunde(w) {
    return this.wesen.filter((o) => !o.tot && o.team === w.team);
  }
  untot(w) {
    return !w.held && Boolean(MONSTER[w.typ].untot);
  }
  /** Eine Eingabe des Spielers. Alles wird geprüft und begrenzt – der Client bestimmt nie ein Ergebnis. */
  eingabe(e, wer = 0) {
    this.bereit();
    const h0 = wer ? this.nach(wer) : this.ich;
    if (!h0 || !h0.held || h0.bot) return;
    const h = h0;
    if (!e || typeof e !== "object") return;
    if (e.t === "neu") {
      if (this.phase === "sieg") this.aufbau();
      return;
    }
    if (h.tot || this.phase !== "lauf" && !STAERKE.beute) return;
    const zahl = (v) => typeof v === "number" && Number.isFinite(v);
    if (e.t === "richtung") {
      if (!zahl(e.x) || !zahl(e.y)) return;
      const l = Math.hypot(e.x, e.y);
      if (l < 0.05) {
        h.rx = 0;
        h.ry = 0;
      } else {
        const k = Math.min(1, l) / l;
        h.rx = e.x * k;
        h.ry = e.y * k;
        h.pfad = [];
      }
    } else if (e.t === "lauf") {
      if (!zahl(e.x) || !zahl(e.y)) return;
      h.zielId = 0;
      h.rx = 0;
      h.ry = 0;
      h.pfad = weg(h, { x: e.x, y: e.y });
    } else if (e.t === "ziel") {
      if (e.id === 0) {
        h.zielId = 0;
        return;
      }
      const z = this.nach(e.id);
      if (!z || z.tot) return;
      const heilt = this.waffe(h).art === "heil";
      if (z.team !== h.team ? !heilt : heilt) h.zielId = z.id;
    } else if (e.t === "modus") this.wechsel(h);
    else if (e.t === "halt") {
      h.pfad = [];
      h.zielId = 0;
      h.rx = 0;
      h.ry = 0;
    } else if (e.t === "faehig") {
      if (e.taste !== "q" && e.taste !== "e" && e.taste !== "r" || !zahl(e.x) || !zahl(e.y)) return;
      this.faehigkeit(h, e.taste, { x: e.x, y: e.y });
    }
  }
  wechsel(w) {
    if (w.cdM > 0 || w.aushol > 0 || w.betaeubt > 0) return;
    w.modus = w.modus ? 0 : 1;
    w.cdM = K.WECHSEL;
    w.zielId = 0;
    w.cdA = Math.max(w.cdA, 0.25);
  }
  /* ---------- Treffen und Schaden ---------- */
  heilen(z, menge) {
    if (z.tot) return;
    const v = z.lp;
    z.lp = Math.min(z.max, z.lp + Math.round(menge));
    if (z.lp > v) this.ev.push({ a: "heil", id: z.id, n: z.lp - v });
  }
  schutzGeben(z, punkte, dauer) {
    z.schutz = Math.max(z.schutz, punkte);
    z.schutzT = dauer;
  }
  /** Direkter Schaden ohne Würfe (Gift, Blutung, Brand, heiliges Licht): nur Schutzpunkte fangen ihn ab */
  abziehen(z, menge, von, art) {
    if (z.tot || menge <= 0) return;
    let m = Math.max(1, Math.round(menge));
    if (z.schutz > 0) {
      const a2 = Math.min(z.schutz, m);
      z.schutz -= a2;
      m -= a2;
      if (m <= 0) {
        this.ev.push({ a: "block", id: z.id });
        return;
      }
    }
    z.lp -= m;
    z.ruhe = 0;
    this.ev.push(art ? { a: "schaden", id: z.id, n: m, art } : { a: "schaden", id: z.id, n: m });
    if (!z.held) {
      z.wach = true;
      if (von && von.held && !z.zielId) z.zielId = von.id;
      this.wecken(z);
    }
    if (z.lp > 0 && z.lp < z.max * 0.4 && this.blinzler.delete(z.id)) {
      const v = von || this.ich, dx = z.x - v.x, dy = z.y - v.y, l = Math.hypot(dx, dy) || 1, a2 = Math.atan2(dy / l, dx / l) + (this.zf() - 0.5) * 1.2;
      const p = naechstFrei({ x: z.x + Math.cos(a2) * 5, y: z.y + Math.sin(a2) * 5 });
      z.x = p.x;
      z.y = p.y;
      z.pfad = [];
      z.aushol = 0;
      this.ev.push({ a: "blinzeln", id: z.id, x: p.x, y: p.y });
    }
    if (z.lp > 0) return;
    if (!z.held && z.team === 0) {
      z.lp = 0;
      z.tot = true;
      this.ev.push({ a: "tot", id: z.id });
      const P = this.karte.PROBE;
      if (P && P.art === "schuetzlinge" && this.probe === 0 && this.wesen.filter((w) => !w.held && w.team === 0 && !w.tot).length < (P.wert || 0)) this.probe = 2;
      return;
    }
    {
      const A = !z.held && MONSTER[z.typ].aufstehen;
      if (A && !this.erhoben.has(z.id)) {
        this.erhoben.add(z.id);
        z.lp = Math.round(z.max * A);
        z.betaeubt = 2.5;
        z.aushol = 0;
        z.dauer = [];
        this.ev.push({ a: "aufstehen", id: z.id, x: z.x, y: z.y });
        return;
      }
    }
    z.lp = 0;
    z.tot = true;
    z.pfad = [];
    z.zielId = 0;
    z.dauer = [];
    z.aushol = 0;
    this.ev.push({ a: "tot", id: z.id });
    if (z.held) {
      z.wieder = K.WIEDER_HELD;
      return;
    }
    this.besiegt++;
    const B = STAERKE.beute, [a, b] = B || K.SPLITTER;
    let n = a + Math.floor(this.zf() * (b - a + 1));
    if (B && MONSTER[z.typ].boss) n *= STAERKE.bossMal;
    if (STAERKE.ep > 0) {
      const e = Math.max(1, Math.round(MONSTER[z.typ].lp * STAERKE.ep / 10));
      this.ev.push({ a: "ep", x: z.x, y: z.y, n: e });
      this.erfahrung(e);
    }
    if (B) this.beute.push({ id: this.lauf++, x: z.x, y: z.y, n });
    else {
      this.splitter += n;
      this.ev.push({ a: "splitter", x: z.x, y: z.y, n });
    }
    if (this.besiegt >= this.monsterZahl && !(this.sl && this.sl.offen)) this.sieg();
  }
  /** Ein Angriff trifft auf ein Ziel. Zurück: Schaden (0 = abgewehrt oder verfehlt). */
  treffen(von, z, s) {
    if (z.tot) return 0;
    let minder = 0;
    const winkel = (a, b) => {
      let d = Math.abs(a - b) % (2 * Math.PI);
      if (d > Math.PI) d = 2 * Math.PI - d;
      return d;
    };
    if (z.held && HELDEN[z.typ].modi[z.modus].schild) {
      if (winkel(Math.atan2(von.y - z.y, von.x - z.x), z.blick) <= K.BLOCK.winkel * Math.PI / 180) minder = K.BLOCK[s.art] + (z.bollwerk > 0 ? K.BOLLWERK.plus : 0);
    } else if (z.held) {
      const t = this.freunde(z).find((o) => o.bollwerk > 0 && o !== z && abstand(o, z) <= 1.8);
      if (t && winkel(Math.atan2(von.y - t.y, von.x - t.x), Math.atan2(z.y - t.y, z.x - t.x)) > Math.PI / 2) minder = K.BOLLWERK.hinter;
    }
    minder = Math.min(K.MINDERUNG_MAX, minder);
    const wurf = !s.sicher && K.TREFFERWURF;
    if (wurf) {
      const a = (von.held ? HELDEN[von.typ].angriff : MONSTER[von.typ].angriffswert)[s.art] + SB(von).angriff;
      let d = this.wert(z).abwehr[s.art] + SB(z).abwehr;
      if (s.art === "magie") d += (z.mrPlusT > 0 ? K.SCHUTZKREIS.magie : 0) + (z.held && this.freunde(z).some((o) => o.typ === "lichtbringer" && abstand(o, z) <= K.BEISTAND.radius) ? K.BEISTAND.magie : 0);
      else if (z.bruchT > 0) d -= K.DURCHBRECHEN.abwehr;
      d = Math.max(0, d) / (1 - minder);
      if (!(this.zf() * (a + 1) > this.zf() * (d + 1))) {
        this.ev.push(minder >= 0.4 ? { a: "block", id: z.id } : { a: "null", id: z.id });
        if (!z.held) {
          z.wach = true;
          if (!z.zielId && von.held) z.zielId = von.id;
          this.wecken(z);
        }
        return 0;
      }
    }
    const min = s.min != null ? s.min : s.grund * K.FAEHIG_MIN;
    let m = (min + this.zf() * (s.grund - min)) * (1 + SB(von).schaden);
    if (s.mal && z.malT > 0) m *= 1 + s.mal;
    if (s.wucht && !z.held && MONSTER[z.typ].anfaellig === "wucht") m *= 1 + K.WUCHT;
    if (s.untot && this.untot(z)) m *= 1 + s.untot;
    if (!wurf && minder > 0) {
      m *= 1 - (s.flaeche ? Math.min(minder, K.BLOCK.flaeche + (z.bollwerk > 0 ? K.BOLLWERK.plus : 0)) : minder);
    }
    const vor = z.lp + z.schutz;
    this.abziehen(z, m, von);
    return Math.max(0, vor - (z.lp + z.schutz));
  }
  /** Wer ein Monster weckt, weckt seine Gruppe */
  wecken(m) {
    if (!m.gruppe || !m.zielId) return;
    for (const o of this.wesen) if (!o.tot && !o.held && o.gruppe === m.gruppe && !o.zielId) {
      o.zielId = m.zielId;
      o.wach = true;
    }
  }
  langsam(z, f, t) {
    if (f >= z.langsamF || z.langsamT <= 0) {
      z.langsamF = f;
      z.langsamT = Math.max(z.langsamT, t);
    }
  }
  dauerSchaden(z, art, jeSek, t, von) {
    const d = z.dauer.find((x) => x.art === art);
    if (d) {
      d.t = t;
      d.jeSek = Math.max(d.jeSek, jeSek);
      d.von = von.id;
    } else z.dauer.push({ t, jeSek, von: von.id, art });
  }
  stossen(z, dx, dy, weite) {
    const l = Math.hypot(dx, dy) || 1;
    for (let s = 0; s < weite; s += 0.15) {
      const nx = z.x + dx / l * 0.15, ny = z.y + dy / l * 0.15;
      if (!begehbar(nx + dx / l * z.r, ny + dy / l * z.r)) break;
      z.x = nx;
      z.y = ny;
    }
    schieben(z);
    z.pfad = [];
    z.aushol = 0;
  }
  sprung(w, richtung, weite, beiGegner) {
    const dx = Math.cos(richtung), dy = Math.sin(richtung);
    for (let s = 0; s < weite; s += 0.15) {
      const nx = w.x + dx * 0.15, ny = w.y + dy * 0.15;
      if (!begehbar(nx + dx * w.r, ny + dy * w.r)) break;
      w.x = nx;
      w.y = ny;
      if (beiGegner) {
        const o = this.feinde(w).find((o2) => abstand(w, o2) < w.r + o2.r + 0.15);
        if (o) {
          beiGegner(o);
          break;
        }
      }
    }
    schieben(w);
    w.pfad = [];
  }
  flaeche(von, ort, radius, s, je) {
    for (const o of this.feinde(von)) if (Math.hypot(o.x - ort.x, o.y - ort.y) <= radius + o.r) {
      this.treffen(von, o, Object.assign({ flaeche: true, sicher: true }, s));
      if (je && !o.tot) je(o);
    }
  }
  /** Das Ziel einer gezielten Fähigkeit: das gewählte Ziel, sonst der Gegner am nächsten zum angegebenen Punkt, sonst der nächste überhaupt – immer in Reichweite und mit Sicht */
  zielBei(w, punkt, reich) {
    const ok = (o) => Boolean(o && !o.tot && o.team !== w.team && abstand(w, o) - o.r <= reich && frei(w, o));
    const g = this.nach(w.zielId);
    if (ok(g)) return g;
    let best = null, bd = 2.5;
    for (const o of this.feinde(w)) {
      const d = Math.hypot(o.x - punkt.x, o.y - punkt.y);
      if (d < bd && ok(o)) {
        bd = d;
        best = o;
      }
    }
    if (best) return best;
    bd = reich + 1;
    for (const o of this.feinde(w)) {
      const d = abstand(w, o);
      if (d < bd && ok(o)) {
        bd = d;
        best = o;
      }
    }
    return best;
  }
  schwaechster(w, reich, unter = 1) {
    let best = null, bq = unter;
    for (const o of this.freunde(w)) {
      const q = o.lp / o.max;
      if (q < bq && abstand(w, o) <= reich && (o === w || frei(w, o))) {
        bq = q;
        best = o;
      }
    }
    return best;
  }
  schuss(von, z, ort, tempo, spec, art, knall = 0) {
    this.geschosse.push({ id: this.lauf++, x: von.x, y: von.y, zielId: z ? z.id : 0, zx: ort.x, zy: ort.y, tempo, von: von.id, spec, knall, art });
  }
  /* ---------- Fähigkeiten ---------- */
  faehigkeit(w, taste, ziel) {
    if (w.tot || w.betaeubt > 0 || !w.held || w.aushol > 0) return false;
    const D = HELDEN[w.typ], cd = taste === "q" ? "cdQ" : taste === "e" ? "cdE" : "cdR";
    if (w[cd] > 0) return false;
    const richtung = Math.atan2(ziel.y - w.y, ziel.x - w.x), nahBei = (reich) => {
      const d = Math.min(reich, abstand(w, ziel));
      return { x: w.x + Math.cos(richtung) * d, y: w.y + Math.sin(richtung) * d };
    };
    let ok = true;
    if (w.typ === "schildwaechter") {
      if (taste === "q") {
        w.blick = richtung;
        this.ev.push({ a: "stoss", id: w.id });
        this.sprung(w, richtung, K.STOSS.weite, (o) => {
          this.treffen(w, o, { grund: K.STOSS.schaden, art: "nah", wucht: true, sicher: true });
          if (!o.tot) this.stossen(o, Math.cos(richtung), Math.sin(richtung), K.STOSS.zurueck);
          w.zielId = o.id;
        });
      } else if (taste === "e") w.bollwerk = K.BOLLWERK.dauer;
      else {
        const S = K.SCHILD_GRAUWACHT;
        for (const o of this.feinde(w)) if (abstand(w, o) <= S.radius) {
          o.spottT = S.spott;
          o.spottId = w.id;
          o.zielId = w.id;
          o.wach = true;
        }
        for (const o of this.freunde(w)) if (abstand(w, o) <= S.radius) this.schutzGeben(o, S.schutz, S.schutzDauer);
        this.ev.push({ a: "knall", x: w.x, y: w.y, r: S.radius, farbe: "licht" });
      }
    } else if (w.typ === "elementarist") {
      if (taste === "q") {
        const o = nahBei(K.FROST.reich);
        this.ev.push({ a: "knall", x: o.x, y: o.y, r: K.FROST.radius, farbe: "eis" });
        this.flaeche(w, o, K.FROST.radius, { grund: K.FROST.schaden, art: "magie" }, (g) => this.langsam(g, K.FROST.langsam, K.FROST.dauer));
      } else if (taste === "e") {
        const o = nahBei(K.DONNER.reich);
        this.ev.push({ a: "knall", x: o.x, y: o.y, r: K.DONNER.radius, farbe: "blitz" });
        this.flaeche(w, o, K.DONNER.radius, { grund: K.DONNER.schaden, art: "magie" }, (g) => this.stossen(g, g.x - o.x || 0.01, g.y - o.y, K.DONNER.zurueck));
      } else this.schuss(w, null, nahBei(K.GLUT.reich), K.GLUT.flug, { grund: K.GLUT.schaden, art: "magie", nach: "brand" }, "feuer", K.GLUT.radius);
    } else if (w.typ === "lichtbringer") {
      if (taste === "q") {
        const g = this.nach(w.zielId), z = g && !g.tot && g.team === w.team && abstand(w, g) <= K.WORT.reich ? g : this.schwaechster(w, K.WORT.reich);
        if (!z) ok = false;
        else this.heilen(z, K.WORT.heilung);
      } else if (taste === "e") {
        const S = K.SCHUTZKREIS;
        for (const o of this.freunde(w)) if (abstand(w, o) <= S.radius) {
          this.schutzGeben(o, S.schutz, S.dauer);
          o.mrPlusT = S.dauer;
        }
        this.ev.push({ a: "knall", x: w.x, y: w.y, r: S.radius, farbe: "licht" });
      } else {
        const S = K.GOETTLICH;
        for (const o of this.freunde(w)) if (abstand(w, o) <= S.radius) this.heilen(o, o.max * S.anteil);
        for (const o of this.feinde(w)) if (abstand(w, o) <= S.radius && this.untot(o)) this.abziehen(o, S.heilig, w, "licht");
        this.ev.push({ a: "knall", x: w.x, y: w.y, r: S.radius, farbe: "licht" });
      }
    } else if (w.typ === "assassine") {
      if (taste === "q") {
        const z = this.zielBei(w, ziel, K.STICH.weite);
        if (!z) ok = false;
        else {
          const hin = Math.atan2(z.y - w.y, z.x - w.x);
          let d = Math.abs(Math.atan2(w.y - z.y, w.x - z.x) - z.blick) % (2 * Math.PI);
          if (d > Math.PI) d = 2 * Math.PI - d;
          const hinten = d > Math.PI * 2 / 3;
          this.sprung(w, hin, Math.max(0, abstand(w, z) - w.r - z.r - 0.1));
          w.blick = hin;
          this.ev.push({ a: "stoss", id: w.id });
          this.treffen(w, z, { grund: K.STICH.schaden * (hinten ? 1 + K.STICH.hinten : 1), art: "nah", sicher: true });
          if (hinten) this.ev.push({ a: "text", id: z.id, t: "von hinten" });
          w.zielId = z.id;
        }
      } else if (taste === "e") {
        w.giftHiebe = K.GIFT.hiebe;
        this.ev.push({ a: "text", id: w.id, t: "Giftklinge" });
      } else {
        const z = this.zielBei(w, ziel, K.HINRICHTUNG.reich);
        if (!z) ok = false;
        else {
          const H = K.HINRICHTUNG, mehr = z.lp / z.max < H.unter && !(MONSTER[z.typ] && MONSTER[z.typ].boss);
          w.blick = Math.atan2(z.y - w.y, z.x - w.x);
          this.ev.push({ a: "hieb", id: w.id });
          this.treffen(w, z, { grund: H.schaden * (mehr ? 1 + H.plus : 1), art: "nah", sicher: true });
        }
      }
    } else if (w.typ === "kopfgeldjaeger") {
      const z = this.zielBei(w, ziel, taste === "q" ? K.MAL.reich : HELDEN[w.typ].modi[0].reich);
      if (!z) ok = false;
      else if (taste === "q") {
        for (const o of this.wesen) o.malT = 0;
        z.malT = K.MAL.dauer;
        w.zielId = z.id;
        this.ev.push({ a: "text", id: z.id, t: "J\xE4germal" });
      } else if (taste === "e") {
        w.blick = Math.atan2(z.y - w.y, z.x - w.x);
        this.schuss(w, z, z, 20, { grund: K.BOLZEN.schaden, art: "fern", mal: K.MAL.plus, nach: "laehmen" }, "bolzen");
      } else {
        const E = K.ERLEGEN;
        w.blick = Math.atan2(z.y - w.y, z.x - w.x);
        this.schuss(w, z, z, 24, { grund: E.schaden * (z.lp / z.max < E.unter ? 1 + E.plus : 1), art: "fern", mal: E.mal, sicher: true }, "erlegen");
      }
    }
    if (ok) w[cd] = D[taste].zeit * (1 - SB(w).abklingen);
    return ok;
  }
  /* ---------- Grundangriff ---------- */
  /** Angriff beginnen: Nahkämpfer treffen sofort, Fernkämpfer und Monster holen erst aus */
  angriff(w, z) {
    const A = this.waffe(w);
    if (w.held && A.schild) return;
    w.cdA = A.takt;
    w.blick = Math.atan2(z.y - w.y, z.x - w.x);
    const aus = w.held ? A.art === "nah" ? 0 : K.AUSHOLEN_FERN : A.aushol;
    if (aus > 0) {
      w.aushol = aus;
      w.ausholZiel = z.id;
      w.pfad = [];
      this.ev.push({ a: w.held ? "anlegen" : "aushol", id: w.id, t: aus });
    } else this.ausloesen(w, z);
  }
  ausloesen(w, z) {
    const A = this.waffe(w);
    this.ev.push({ a: "hieb", id: w.id });
    if (A.art === "heil") {
      if (z.team === w.team && abstand(w, z) <= A.reich + 1) this.heilen(z, A.schaden[0] + this.zf() * (A.schaden[1] - A.schaden[0]));
      return;
    }
    if (z.tot || abstand(w, z) - z.r > A.reich + (w.held ? 0.6 : 0.35) || !frei(w, z)) return;
    const M = w.held ? A : null, spec = { grund: A.schaden[1] * (w.held ? 1 : STAERKE.schaden), min: A.schaden[0] * (w.held ? 1 : STAERKE.schaden), art: A.art, wucht: Boolean(M && M.wucht), untot: M ? M.untot : 0, mal: w.typ === "kopfgeldjaeger" ? K.MAL.plus : 0 };
    if (w.held && A.art !== "nah") {
      spec.nach = w.typ === "kopfgeldjaeger" && w.modus === 0 ? "durchbrechen" : "";
      this.schuss(w, z, z, A.flug || 14, spec, A.art === "magie" ? "blitz" : "bolzen");
      return;
    }
    const n = this.treffen(w, z, spec);
    if (n > 0 && !z.tot) this.nachTreffer(w, z, w.typ === "schildwaechter" ? w.modus === 0 ? "festnageln" : "schildhieb" : w.typ === "assassine" && w.modus === 0 ? "dolch" : w.typ === "elementarist" ? "rueckstoss" : "");
  }
  /** Was ein Treffer zusätzlich auslöst */
  nachTreffer(von, z, was) {
    if (was === "festnageln") {
      if (z.festSperre <= 0) {
        this.langsam(z, K.FESTNAGELN.langsam, K.FESTNAGELN.dauer);
        z.festSperre = K.FESTNAGELN.sperre;
      }
    } else if (was === "schildhieb") {
      z.aushol = 0;
      z.cdA = Math.max(z.cdA, 0.5);
    } else if (was === "dolch") {
      this.dauerSchaden(z, "blut", K.NACHBLUTEN.jeSek, K.NACHBLUTEN.dauer, von);
      if (von.giftHiebe > 0) {
        von.giftHiebe--;
        this.dauerSchaden(z, "gift", K.GIFT.jeSek, K.GIFT.dauer, von);
      }
    } else if (was === "rueckstoss") this.stossen(z, z.x - von.x, z.y - von.y, 0.6);
    else if (was === "durchbrechen") {
      if (z.bruchSperre <= 0) {
        z.bruchT = K.DURCHBRECHEN.dauer;
        z.bruchSperre = K.DURCHBRECHEN.sperre;
      }
    } else if (was === "laehmen") this.langsam(z, K.BOLZEN.langsam, K.BOLZEN.dauer);
  }
  /** Auf ein Ziel zugehen und angreifen, sobald es in Reichweite ist (Monster und Begleiter) */
  jagen(w, z, reich) {
    const d = abstand(w, z) - z.r;
    if (d <= reich && frei(w, z)) {
      w.pfad = [];
      w.blick = Math.atan2(z.y - w.y, z.x - w.x);
      if (w.cdA <= 0) this.angriff(w, z);
      return;
    }
    w.neuWeg -= DT;
    if (w.neuWeg <= 0 || !w.pfad.length) {
      w.pfad = weg(w, z);
      w.neuWeg = 0.3;
    }
  }
  naechsterGegner(w, weit) {
    let best = null, bd = weit;
    for (const o of this.feinde(w)) {
      const d = abstand(w, o);
      if (d < bd && frei(w, o)) {
        bd = d;
        best = o;
      }
    }
    return best;
  }
  /* ---------- Begleiter (vom Rechner gespielte Helden) ---------- */
  begleiterZug(w) {
    const f = this.nach(w.fuehrer), D = HELDEN[w.typ];
    let ziel;
    const folgen = () => {
      if (f && !f.tot && abstand(w, f) > 2.4) {
        w.neuWeg -= DT;
        if (w.neuWeg <= 0) {
          w.pfad = weg(w, { x: f.x - Math.cos(f.blick) * 1.2, y: f.y - Math.sin(f.blick) * 1.2 });
          w.neuWeg = 0.4;
        }
      }
    };
    for (const g of this.wesen) {
      if (g.held || g.tot || g.ladeT <= 0) continue;
      const S = MONSTER[g.typ].spezial, d2 = Math.hypot(w.x - g.ladeX, w.y - g.ladeY), rand = S.radius + w.r + 0.5;
      if (d2 >= rand) continue;
      let wx = w.x - g.ladeX, wy = w.y - g.ladeY;
      if (f && !f.tot && Math.hypot(f.x - g.ladeX, f.y - g.ladeY) > rand) {
        wx = f.x - g.ladeX;
        wy = f.y - g.ladeY;
      }
      const l = Math.hypot(wx, wy) || 1;
      w.neuWeg -= DT;
      if (w.neuWeg <= 0 || !w.pfad.length) {
        w.pfad = weg(w, naechstFrei({ x: g.ladeX + wx / l * (rand + 0.8), y: g.ladeY + wy / l * (rand + 0.8) }));
        w.neuWeg = 0.5;
      }
      w.zielId = 0;
      return;
    }
    if (f && !f.tot && abstand(w, f) > 8) {
      w.zielId = 0;
      folgen();
      return;
    }
    if (w.typ === "lichtbringer") {
      const v = this.schwaechster(w, 12, 0.92), feind = this.naechsterGegner(w, 2.6);
      if (v && v.lp / v.max < 0.6 && w.cdQ <= 0 && abstand(w, v) <= K.WORT.reich) {
        w.zielId = v.id;
        this.faehigkeit(w, "q", v);
      }
      if (w.cdR <= 0 && this.freunde(w).filter((o) => o.lp / o.max < 0.45 && abstand(w, o) <= K.GOETTLICH.radius).length >= (this.freunde(w).length > 1 ? 2 : 1)) this.faehigkeit(w, "r", w);
      if (feind && w.cdE <= 0 && w.lp / w.max < 0.8) this.faehigkeit(w, "e", w);
      if (v) {
        if (w.modus !== 0) this.wechsel(w);
        if (w.modus === 0) {
          if (abstand(w, v) > D.modi[0].reich - 0.5) {
            w.neuWeg -= DT;
            if (w.neuWeg <= 0) {
              w.pfad = weg(w, v);
              w.neuWeg = 0.3;
            }
          } else {
            w.pfad = [];
            if (w.cdA <= 0 && w.aushol <= 0) this.angriff(w, v);
          }
        }
        return;
      }
      if (feind) {
        if (w.modus !== 1) this.wechsel(w);
        if (w.modus === 1) this.jagen(w, feind, D.modi[1].reich);
        return;
      }
      folgen();
      return;
    }
    const fz = f && f.zielId ? this.nach(f.zielId) : void 0;
    ziel = w.zielId ? this.nach(w.zielId) : void 0;
    if (ziel && (ziel.tot || ziel.team === w.team)) ziel = void 0;
    if (!ziel) ziel = (fz && !fz.tot && fz.team !== w.team ? fz : this.naechsterGegner(w, K.SICHT)) || void 0;
    w.zielId = ziel ? ziel.id : 0;
    if (!ziel) {
      folgen();
      return;
    }
    const d = abstand(w, ziel);
    if (w.typ === "schildwaechter") {
      const soll = w.lp / w.max < 0.35 ? 1 : w.lp / w.max > 0.6 ? 0 : w.modus;
      if (w.modus !== soll) this.wechsel(w);
      if (w.modus === 1) w.blick = Math.atan2(ziel.y - w.y, ziel.x - w.x);
      if (w.cdQ <= 0 && d < K.STOSS.weite && d > 1.2) this.faehigkeit(w, "q", ziel);
      if (w.cdE <= 0 && w.modus === 1) this.faehigkeit(w, "e", ziel);
      if (w.cdR <= 0 && this.feinde(w).filter((o) => abstand(w, o) < 5 && o.zielId && o.zielId !== w.id).length >= 2) this.faehigkeit(w, "r", w);
    } else if (w.typ === "elementarist") {
      if (d < 8 && frei(w, ziel)) {
        const viele = this.feinde(w).filter((o) => abstand(o, ziel) < 2.5).length;
        if (w.cdR <= 0 && viele >= 2) this.faehigkeit(w, "r", ziel);
        if (w.cdQ <= 0) this.faehigkeit(w, "q", ziel);
        if (w.cdE <= 0 && d < 7) this.faehigkeit(w, "e", ziel);
      }
    } else if (w.typ === "assassine") {
      if (w.cdE <= 0 && d < 3) this.faehigkeit(w, "e", ziel);
      if (w.cdQ <= 0 && d < K.STICH.weite && d > 1.4) this.faehigkeit(w, "q", ziel);
      if (w.cdR <= 0 && d < K.HINRICHTUNG.reich && ziel.lp / ziel.max < 0.6) this.faehigkeit(w, "r", ziel);
    } else if (w.typ === "kopfgeldjaeger") {
      if (d < 9 && frei(w, ziel)) {
        if (w.cdQ <= 0) this.faehigkeit(w, "q", ziel);
        if (w.cdE <= 0) this.faehigkeit(w, "e", ziel);
        if (w.cdR <= 0 && ziel.lp > 60) this.faehigkeit(w, "r", ziel);
      }
    }
    const A = D.modi[w.modus];
    if (A.art !== "nah" && d < 2.4 && w.aushol <= 0) {
      const fort = Math.atan2(w.y - ziel.y, w.x - ziel.x);
      w.pfad = [naechstFrei({ x: w.x + Math.cos(fort) * 2.5, y: w.y + Math.sin(fort) * 2.5 })];
      return;
    }
    this.jagen(w, ziel, A.reich - (A.art === "nah" ? 0 : 0.5));
  }
  /* ---------- ein Rechenschritt (DT Sekunden) ---------- */
  schritt() {
    this.bereit();
    this.tick++;
    if (this.phase !== "lauf" && !STAERKE.beute) return;
    if (this.phase === "lauf") this.zeit += DT;
    {
      const P = this.karte.PROBE;
      if (P && P.art === "schleuse" && this.probe === 0 && this.sl && this.sl.offen && this.zeit > (P.wert || 0)) this.probe = 2;
    }
    if (this.beute.length) this.beute = this.beute.filter((b) => {
      const h = this.wesen.find((w) => w.held && !w.tot && Math.hypot(w.x - b.x, w.y - b.y) < 0.9);
      if (!h) return true;
      this.splitter += b.n;
      this.ev.push({ a: "splitter", x: b.x, y: b.y, n: b.n });
      return false;
    });
    for (const w of this.wesen) {
      if (w.tot) {
        if (w.held) {
          w.wieder -= DT;
          if (w.wieder <= 0) {
            w.tot = false;
            w.lp = w.max;
            const p = START[Math.max(0, this.wesen.filter((o) => o.held).indexOf(w))] || START[0];
            w.x = p.x;
            w.y = p.y;
            w.pfad = [];
            w.zielId = 0;
            w.ruhe = 99;
          }
        }
        continue;
      }
      for (const k of ["cdA", "cdQ", "cdE", "cdR", "cdM", "cdS", "bollwerk", "langsamT", "malT", "bruchT", "bruchSperre", "festSperre", "mrPlusT", "spottT"]) if (w[k] > 0) w[k] = Math.max(0, w[k] - DT);
      if (w.schutzT > 0) {
        w.schutzT -= DT;
        if (w.schutzT <= 0) w.schutz = 0;
      }
      if (w.dauer.length) {
        for (const d of w.dauer) {
          w.dauerRest += d.jeSek * DT;
          d.t -= DT;
        }
        const art = w.dauer[0].art, von = this.nach(w.dauer[0].von);
        w.dauer = w.dauer.filter((d) => d.t > 0);
        if (w.dauerRest >= 3 || !w.dauer.length) {
          const n = w.dauerRest;
          w.dauerRest = 0;
          this.abziehen(w, n, von, art);
          if (w.tot) continue;
        }
      }
      w.ruhe += DT;
      if (w.held && w.ruhe >= K.ERHOLUNG.nach && w.lp < w.max) w.lp = Math.min(w.max, w.lp + w.max * K.ERHOLUNG.jeSek * DT);
      if (w.betaeubt > 0) {
        w.betaeubt = Math.max(0, w.betaeubt - DT);
        continue;
      }
      if (w.ladeT > 0) {
        w.ladeT -= DT;
        if (w.ladeT <= 0) {
          {
            const P = this.karte.PROBE, Sz = MONSTER[w.typ].spezial;
            if (P && P.art === "ausweichen" && this.probe === 0 && this.wesen.some((o) => o.held && !o.tot && Math.hypot(o.x - w.ladeX, o.y - w.ladeY) <= Sz.radius + o.r)) this.probe = 2;
          }
          const S = MONSTER[w.typ].spezial;
          this.ev.push({ a: "speien", id: w.id, x: w.ladeX, y: w.ladeY, r: S.radius });
          this.flaeche(w, { x: w.ladeX, y: w.ladeY }, S.radius, { grund: S.schaden[1] * STAERKE.schaden, min: S.schaden[0] * STAERKE.schaden, art: S.art });
          w.cdS = S.alle;
        }
        continue;
      }
      if (w.aushol > 0) {
        w.aushol -= DT;
        if (w.aushol <= 0) {
          const z = this.nach(w.ausholZiel);
          if (z) this.ausloesen(w, z);
        }
        continue;
      }
      let ziel = w.zielId ? this.nach(w.zielId) : void 0;
      if (ziel && ziel.tot) {
        ziel = void 0;
        w.zielId = 0;
      }
      if (!w.held && MONSTER[w.typ].fest) {
        const B = MONSTER[w.typ].brut;
        if (B) this.brueten(w, B);
        continue;
      }
      if (!w.held && MONSTER[w.typ].brut && w.wach) this.brueten(w, MONSTER[w.typ].brut);
      if (!w.held) {
        const D = MONSTER[w.typ];
        if (w.spottT > 0) {
          const s = this.nach(w.spottId);
          if (s && !s.tot) {
            ziel = s;
            w.zielId = s.id;
          }
        }
        if (ziel && abstand(ziel, w.heim) > (this.karte.LEINE ?? K.LEINE) && w.spottT <= 0) {
          ziel = void 0;
          w.zielId = 0;
          w.wach = false;
        }
        if (!ziel) {
          const o = this.naechsterGegner(w, this.karte.AGGRO ?? K.AGGRO);
          if (o && abstand(o, w.heim) <= (this.karte.LEINE ?? K.LEINE)) {
            ziel = o;
            w.zielId = o.id;
            w.wach = true;
            this.wecken(w);
          }
        }
        if (ziel && D.spezial && w.cdS <= 0 && abstand(w, ziel) <= D.spezial.reich) {
          w.ladeT = D.spezial.laden;
          w.ladeX = ziel.x;
          w.ladeY = ziel.y;
          w.pfad = [];
          w.blick = Math.atan2(ziel.y - w.y, ziel.x - w.x);
          this.ev.push({ a: "laden", id: w.id, x: ziel.x, y: ziel.y, r: D.spezial.radius, t: D.spezial.laden });
        } else if (ziel) this.jagen(w, ziel, D.angriff.reich);
        else if (abstand(w, w.heim) > 0.3) {
          w.neuWeg -= DT;
          if (w.neuWeg <= 0 || !w.pfad.length) {
            w.pfad = weg(w, w.heim);
            w.neuWeg = 1;
          }
        } else if (w.lp < w.max) w.lp = Math.min(w.max, w.lp + w.max * (D.boss ? K.HEIM_HEILUNG_BOSS : K.HEIM_HEILUNG) * DT);
      } else if (w.bot) this.begleiterZug(w);
      else {
        const A = this.waffe(w), faehrt = w.rx !== 0 || w.ry !== 0, v = this.tempo(w);
        if (faehrt) {
          w.x += w.rx * v * DT;
          w.y += w.ry * v * DT;
          w.blick = Math.atan2(w.ry, w.rx);
        }
        if (w.held && A.schild) {
          const g = ziel && ziel.team !== w.team && abstand(w, ziel) < 10 ? ziel : this.naechsterGegner(w, 5);
          if (g) w.blick = Math.atan2(g.y - w.y, g.x - w.x);
        } else if (A.art === "heil") {
          const z = ziel && ziel.team === w.team && ziel.lp < ziel.max ? ziel : this.schwaechster(w, A.reich);
          if (z && !faehrt && w.cdA <= 0 && abstand(w, z) <= A.reich && (z === w || frei(w, z))) this.angriff(w, z);
        } else {
          if (ziel && ziel.team === w.team) {
            ziel = void 0;
            w.zielId = 0;
          }
          const nah = A.art === "nah", darf = nah || !faehrt;
          if (!ziel && !faehrt && !w.pfad.length) ziel = this.naechsterGegner(w, nah ? 2.2 : A.reich) || void 0;
          if (ziel && darf && abstand(w, ziel) - ziel.r <= A.reich && frei(w, ziel)) {
            if (!faehrt || nah) w.blick = Math.atan2(ziel.y - w.y, ziel.x - w.x);
            if (w.cdA <= 0) this.angriff(w, ziel);
          }
        }
      }
      if (w.pfad.length && w.aushol <= 0) {
        let rest = this.tempo(w) * DT;
        while (rest > 0 && w.pfad.length) {
          const p = w.pfad[0], d = abstand(w, p);
          if (d <= rest) {
            w.x = p.x;
            w.y = p.y;
            rest -= d;
            w.pfad.shift();
          } else {
            w.blick = Math.atan2(p.y - w.y, p.x - w.x);
            w.x += (p.x - w.x) / d * rest;
            w.y += (p.y - w.y) / d * rest;
            rest = 0;
          }
        }
      }
    }
    if (this.sl && this.sl.offen && this.phase === "lauf") this.schleuse(this.sl);
    for (let i = 0; i < this.wesen.length; i++) for (let j = i + 1; j < this.wesen.length; j++) {
      const a = this.wesen[i], b = this.wesen[j];
      if (a.tot || b.tot) continue;
      const d = abstand(a, b), soll = a.r + b.r;
      if (d < soll && d > 1e-4) {
        const s = (soll - d) / 2, dx = (b.x - a.x) / d, dy = (b.y - a.y) / d;
        a.x -= dx * s;
        a.y -= dy * s;
        b.x += dx * s;
        b.y += dy * s;
      }
    }
    for (const w of this.wesen) if (!w.tot) schieben(w);
    for (const w of this.wesen) if (!w.held && !w.tot && MONSTER[w.typ].fest) {
      w.x = w.heim.x;
      w.y = w.heim.y;
    }
    for (const g of this.geschosse) {
      const z = g.zielId ? this.nach(g.zielId) : void 0;
      if (z && !z.tot) {
        g.zx = z.x;
        g.zy = z.y;
      }
      const d = Math.hypot(g.zx - g.x, g.zy - g.y), s = g.tempo * DT;
      if (d > s) {
        g.x += (g.zx - g.x) / d * s;
        g.y += (g.zy - g.y) / d * s;
        if (g.knall && !begehbar(g.x, g.y)) {
          g.zx = g.x;
          g.zy = g.y;
        } else continue;
      }
      g.tempo = 0;
      const von = this.nach(g.von);
      if (!von) continue;
      if (g.knall) {
        this.ev.push({ a: "knall", x: g.zx, y: g.zy, r: g.knall, farbe: "feuer" });
        this.flaeche(von, { x: g.zx, y: g.zy }, g.knall, g.spec, (o) => {
          if (g.spec.nach === "brand") this.dauerSchaden(o, "brand", K.GLUT.brand, K.GLUT.dauer, von);
        });
      } else if (z && !z.tot) {
        const n = this.treffen(von, z, g.spec);
        if (n > 0 && !z.tot && g.spec.nach) this.nachTreffer(von, z, g.spec.nach);
      }
    }
    this.geschosse = this.geschosse.filter((g) => g.tempo > 0);
  }
  /** Offene Schleuse: Gegner kriechen in Wellen aus dem Wasser und sammeln sich am Hebel. Wer drei Sekunden ungestört am Hebel steht, schließt sie; ein Treffer fängt von vorn an. */
  schleuse(sl) {
    const nah = this.wesen.some((h) => h.held && !h.bot && !h.tot && h.ruhe > 0.05 && Math.hypot(h.x - sl.x, h.y - sl.y) < 1.4);
    if (nah) {
      sl.fort = Math.min(1, sl.fort + DT / 3);
      if (sl.fort >= 1) {
        sl.offen = false;
        {
          const P = this.karte.PROBE;
          if (P && P.art === "schleuse" && this.probe === 0) this.probe = this.zeit <= (P.wert || 0) ? 1 : 2;
        }
        this.ev.push({ a: "schleuse", x: sl.x, y: sl.y });
        if (this.besiegt >= this.monsterZahl) this.sieg();
        return;
      }
    } else sl.fort = 0;
    sl.warte -= DT;
    if (sl.warte > 0 || sl.raus >= sl.gesamt) return;
    sl.warte = sl.takt;
    if (this.wesen.filter((w) => !w.held && !w.tot && w.gruppe >= 100).length >= sl.max) return;
    const p = sl.quellen[Math.floor(this.zf() * sl.quellen.length)], m = this.neu(false, sl.art, 1, { x: p.x, y: p.y }, true, 100 + this.lauf);
    m.wach = true;
    m.heim = { x: sl.x, y: sl.y };
    this.monsterZahl++;
    sl.raus++;
    this.ev.push({ a: "auftauchen", id: m.id, x: p.x, y: p.y });
  }
  /** Laich: Sobald ein Held in der Nähe ist, schlüpft alle takt Sekunden ein Junges – höchstens max zugleich, gesamt insgesamt. */
  brueten(w, B) {
    let b = this.brut.get(w.id);
    if (!b) {
      b = { t: B.takt * 0.4, n: 0, junge: [] };
      this.brut.set(w.id, b);
    }
    if (b.n >= B.gesamt || !this.wesen.some((h) => h.held && !h.tot && abstand(h, w) < 9)) return;
    b.t -= DT;
    if (b.t > 0) return;
    b.t = B.takt;
    b.junge = b.junge.filter((id) => {
      const j2 = this.nach(id);
      return j2 && !j2.tot;
    });
    if (b.junge.length >= B.max) return;
    const a = this.zf() * Math.PI * 2, p = naechstFrei({ x: w.x + Math.cos(a) * 1.1, y: w.y + Math.sin(a) * 1.1 }), j = this.neu(false, B.art, 1, p, true, 200 + this.lauf);
    j.wach = true;
    j.heim = { x: w.x, y: w.y };
    b.n++;
    b.junge.push(j.id);
    this.monsterZahl++;
    this.ev.push({ a: "auftauchen", id: j.id, x: p.x, y: p.y });
  }
  /** Sieg: die Herausforderung ist geschafft, wenn sie bis hierher nicht verfehlt wurde */
  sieg() {
    this.phase = "sieg";
    if (this.karte.PROBE && this.probe === 0) this.probe = 1;
  }
  /** Die Angaben zum eigenen Helden (für jeden Spieler einer Koop-Gruppe seine eigenen) */
  ichVon(id) {
    const r = (v) => Math.round(v * 100) / 100, h = this.nach(id) || this.ich;
    return { id: h.id, cdQ: r(h.cdQ), cdE: r(h.cdE), cdR: r(h.cdR), zielId: h.zielId, wieder: r(Math.max(0, h.wieder)), modus: h.modus, stufe: this.stufen[h.typ] || 1, ep: this.epStand[h.typ] || 0 };
  }
  /** Stufe eines Helden aus seiner Erfahrung setzen (Koop: jeder bringt seine eigene mit) – Leben passt sich an */
  setzeErfahrung(typ, ep) {
    this.bereit();
    this.epStand[typ] = ep;
    this.stufen[typ] = stufeAusEp(ep);
    HELDENSTUFE[typ] = this.stufen[typ];
    for (const w of this.wesen) if (w.held && w.typ === typ) {
      const q = w.lp / w.max;
      w.max = Math.round(HELDEN[typ].lp * (1 + STUFENBONUS(this.stufen[typ]).lp));
      w.lp = Math.max(1, Math.round(w.max * q));
    }
  }
  /** Koop: Ein Mitspieler übernimmt einen Helden. Erst einen Begleiter desselben Helden, sonst einen neuen (bis drei), sonst irgendeinen Begleiter. Zurück: Kennung oder 0. */
  uebernehmen(typ) {
    this.bereit();
    const helden = this.wesen.filter((w2) => w2.held && w2.team === 0);
    let w = helden.find((o) => o.bot && o.typ === typ);
    if (!w && HELDEN[typ] && helden.length < 3 && !helden.some((o) => o.typ === typ)) {
      const p = START[helden.length] || START[0];
      w = this.neu(true, typ, 0, p, false);
      this.begleiter.push(typ);
    }
    if (!w) w = helden.find((o) => o.bot);
    if (!w) return 0;
    w.bot = false;
    w.pfad = [];
    w.zielId = 0;
    w.rx = 0;
    w.ry = 0;
    return w.id;
  }
  /** Koop: Ein Mitspieler geht – sein Held läuft als Begleiter weiter */
  freigeben(id) {
    const w = this.nach(id);
    if (!w || !w.held || w === this.ich) return;
    w.bot = true;
    w.fuehrer = this.ich.id;
    w.rx = 0;
    w.ry = 0;
  }
  /** Der Zustand für den Client (kompakt). Die Ereignisse seit dem letzten Abruf sind enthalten und werden danach geleert. */
  zustand() {
    this.bereit();
    const r = (v) => Math.round(v * 100) / 100, h = this.ich, ev = this.ev;
    this.ev = [];
    const bits = (w) => (w.bollwerk > 0 ? BIT.bollwerk : 0) | (w.betaeubt > 0 ? BIT.betaeubt : 0) | (w.langsamT > 0 ? BIT.langsam : 0) | (w.dauer.length ? BIT.dauer : 0) | (w.malT > 0 ? BIT.mal : 0) | (w.held && HELDEN[w.typ].modi[w.modus].schild ? BIT.schild : 0) | (w.aushol > 0 ? BIT.aushol : 0) | (w.schutz > 0 ? BIT.schutz : 0);
    return {
      tick: this.tick,
      phase: this.phase,
      zeit: Math.round(this.zeit * 10) / 10,
      splitter: this.splitter,
      besiegt: this.besiegt,
      monster: this.monsterZahl,
      b: this.beute.map((q) => [q.id, q.x, q.y, q.n]),
      w: this.wesen.filter((w) => w.held || !w.tot).map((w) => [w.id, w.held ? 1 : 0, w.typ, w.team, r(w.x), r(w.y), r(w.blick), Math.round(w.lp), w.max, bits(w), w.tot ? 1 : 0, Math.round(w.schutz), w.modus]),
      g: this.geschosse.map((g) => [g.id, r(g.x), r(g.y), g.art]),
      ev,
      ich: this.ichVon(h.id),
      pr: this.karte.PROBE ? this.probe : void 0,
      sl: this.sl ? [r(this.sl.x), r(this.sl.y), this.sl.offen ? 1 : 0, r(this.sl.fort)] : void 0,
      st: Object.fromEntries(this.wesen.filter((w) => w.held && w.team === 0).map((w) => [w.typ, [this.stufen[w.typ] || 1, this.epStand[w.typ] || 0]]))
    };
  }
};

// shared/waldweg.ts
var WALDWEG_ZEILEN = ["TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT........TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT...............TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT....................TTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT.TTT...................TTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTT..TTT....................TTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTT..........................TTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTT...........................TTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTT...........................TTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTT.........................TTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT....................TTT.TTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT...................TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT...................TTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT.............TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT.................TTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT...........................TTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTT....................................TTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTT.............................................TTTTTTTTTTTTT", "......TTTTTTTTT..........................................................TTTTTTT", "....................................TTTTTTTTTTTTTTTTT...........................", "...............................TTTTTTTTTTTTTTTTTTTTTTTTTTT......................", "...........................TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT.................", "......................TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT.............", "TTTTTT.........TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT.......", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT", "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT"];
var WALDWEG_START = [[0.5, 9.76], [0.1, 9.2], [0.1, 10.2]];
var WALDWEG_LAGER = [{ "art": "schlammkroete", "x": 18.4, "y": 2.5, "gruppe": 1 }, { "art": "schlammkroete", "x": 19.5, "y": 3.3, "gruppe": 1 }, { "art": "kroetchen", "x": 17.6, "y": 3.5, "gruppe": 1 }, { "art": "irrlicht", "x": 23.4, "y": 2.2, "gruppe": 2 }, { "art": "schlammkroete", "x": 24.1, "y": 3.1, "gruppe": 2 }, { "art": "kroetchen", "x": 22.6, "y": 3.5, "gruppe": 2 }];
var WALDWEG_BAEUME = { "baum1": { "fuss": [0.5549, 0.9335], "w": 356, "h": 345 }, "baum2": { "fuss": [0.4475, 0.9428], "w": 371, "h": 297 }, "baum3": { "fuss": [0.438, 0.9596], "w": 368, "h": 321 }, "baum4": { "fuss": [0.6439, 0.949], "w": 604, "h": 564 }, "baum5": { "fuss": [0.5949, 0.9907], "w": 231, "h": 317 }, "baum6": { "fuss": [0.5536, 0.9875], "w": 237, "h": 367 } };
var WALDWEG_DEKO = [{ "b": "baum3", "x": 23.57, "y": 0.3, "s": 1.072 }, { "b": "baum1", "x": 12.32, "y": 0.33, "s": 1.043 }, { "b": "baum5", "x": 33.03, "y": 0.35, "s": 0.944 }, { "b": "baum5", "x": 6.44, "y": 0.36, "s": 0.945 }, { "b": "baum5", "x": 17.46, "y": 0.37, "s": 0.939 }, { "b": "baum3", "x": 38.23, "y": 0.46, "s": 1.018 }, { "b": "baum1", "x": 4.87, "y": 0.57, "s": 0.873 }, { "b": "baum2", "x": 25.46, "y": 0.59, "s": 0.967 }, { "b": "baum3", "x": 9.77, "y": 0.6, "s": 1.11 }, { "b": "baum6", "x": 3.06, "y": 0.66, "s": 0.884 }, { "b": "baum4", "x": 29.11, "y": 0.68, "s": 0.882 }, { "b": "baum1", "x": 35.29, "y": 0.72, "s": 0.877 }, { "b": "baum5", "x": 1.21, "y": 0.73, "s": 1.041 }, { "b": "baum3", "x": 8, "y": 0.75, "s": 1.006 }, { "b": "baum3", "x": 15.42, "y": 0.95, "s": 0.878 }, { "b": "baum3", "x": 30.93, "y": 1.08, "s": 1.095 }, { "b": "baum1", "x": -0.35, "y": 1.12, "s": 1.042 }, { "b": "baum1", "x": 39.53, "y": 1.2, "s": 0.994 }, { "b": "baum1", "x": 11.23, "y": 1.25, "s": 0.87 }, { "b": "baum1", "x": 36.75, "y": 1.26, "s": 0.965 }, { "b": "baum6", "x": 13.44, "y": 1.31, "s": 0.889 }, { "b": "baum2", "x": 27.22, "y": 1.34, "s": 0.933 }, { "b": "baum2", "x": 4.1, "y": 1.66, "s": 0.909 }, { "b": "baum2", "x": 33.01, "y": 1.84, "s": 1.115 }, { "b": "baum1", "x": 29.42, "y": 1.93, "s": 1.074 }, { "b": "baum5", "x": 2.36, "y": 2.05, "s": 0.974 }, { "b": "baum3", "x": 7.39, "y": 2.05, "s": 0.999 }, { "b": "baum6", "x": 34.85, "y": 2.05, "s": 0.864 }, { "b": "baum4", "x": 8.98, "y": 2.1, "s": 1.072 }, { "b": "baum3", "x": 0.73, "y": 2.16, "s": 1.112 }, { "b": "baum1", "x": 37.82, "y": 2.35, "s": 1.015 }, { "b": "baum4", "x": 5.41, "y": 2.57, "s": 0.87 }, { "b": "baum3", "x": 39.69, "y": 2.58, "s": 1.071 }, { "b": "baum3", "x": 10.59, "y": 2.8, "s": 0.953 }, { "b": "baum5", "x": 12.78, "y": 3.21, "s": 1.097 }, { "b": "baum1", "x": -0.49, "y": 3.22, "s": 0.917 }, { "b": "baum5", "x": 31.78, "y": 3.31, "s": 1.054 }, { "b": "baum2", "x": 33.48, "y": 3.42, "s": 1.118 }, { "b": "baum6", "x": 3.99, "y": 3.42, "s": 1.011 }, { "b": "baum2", "x": 8.06, "y": 3.43, "s": 0.874 }, { "b": "baum1", "x": 29.22, "y": 3.58, "s": 0.956 }, { "b": "baum2", "x": 6.32, "y": 3.62, "s": 0.873 }, { "b": "baum1", "x": 9.99, "y": 4.04, "s": 1.084 }, { "b": "baum4", "x": 36.14, "y": 4.15, "s": 0.947 }, { "b": "baum1", "x": 1.94, "y": 4.28, "s": 1.102 }, { "b": "baum5", "x": 39.04, "y": 4.3, "s": 1.056 }, { "b": "baum3", "x": 12.42, "y": 4.39, "s": 1.035 }, { "b": "baum2", "x": 31.72, "y": 4.59, "s": 1.001 }, { "b": "baum1", "x": 4.58, "y": 4.61, "s": 0.937 }, { "b": "baum1", "x": 8.54, "y": 4.68, "s": 0.88 }, { "b": "baum4", "x": -0.34, "y": 4.74, "s": 0.969 }, { "b": "baum2", "x": 6.72, "y": 4.78, "s": 1.061 }, { "b": "baum3", "x": 11.06, "y": 4.97, "s": 1.032 }, { "b": "baum5", "x": 28.17, "y": 5.09, "s": 0.9 }, { "b": "baum2", "x": 33.08, "y": 5.29, "s": 0.869 }, { "b": "baum4", "x": 38.13, "y": 5.31, "s": 1.053 }, { "b": "baum1", "x": 13.55, "y": 5.41, "s": 0.942 }, { "b": "baum1", "x": 2.55, "y": 5.43, "s": 1.071 }, { "b": "baum3", "x": 9.69, "y": 5.64, "s": 0.917 }, { "b": "baum4", "x": 0.65, "y": 5.69, "s": 1.102 }, { "b": "baum5", "x": 29.41, "y": 5.86, "s": 0.954 }, { "b": "baum1", "x": 4.19, "y": 5.88, "s": 0.95 }, { "b": "baum2", "x": 34.7, "y": 5.89, "s": 1.041 }, { "b": "baum2", "x": 36.46, "y": 5.89, "s": 1.079 }, { "b": "baum2", "x": 27.25, "y": 6.07, "s": 1.091 }, { "b": "baum6", "x": 12.29, "y": 6.19, "s": 0.996 }, { "b": "baum1", "x": 40.15, "y": 6.2, "s": 1.063 }, { "b": "baum5", "x": 7.53, "y": 6.45, "s": 0.886 }, { "b": "baum4", "x": 14.59, "y": 6.49, "s": 0.875 }, { "b": "baum2", "x": 2.03, "y": 6.63, "s": 0.928 }, { "b": "baum1", "x": 31.35, "y": 6.83, "s": 1.023 }, { "b": "baum6", "x": 5.27, "y": 6.94, "s": 0.986 }, { "b": "baum6", "x": 9.84, "y": 7, "s": 0.922 }, { "b": "baum1", "x": 16.09, "y": 7.01, "s": 0.926 }, { "b": "baum5", "x": 33.68, "y": 7.15, "s": 0.938 }, { "b": "baum2", "x": 29.65, "y": 7.24, "s": 1.085 }, { "b": "baum3", "x": 3.66, "y": 7.32, "s": 0.957 }, { "b": "baum5", "x": 38.66, "y": 7.34, "s": 0.888 }, { "b": "baum1", "x": 35.83, "y": 7.4, "s": 1.017 }, { "b": "baum3", "x": 12.31, "y": 7.41, "s": 1.035 }, { "b": "baum5", "x": 40.38, "y": 7.52, "s": 1.035 }, { "b": "baum1", "x": -0.46, "y": 7.67, "s": 1.045 }, { "b": "baum2", "x": 7.26, "y": 7.76, "s": 0.876 }, { "b": "baum2", "x": 1.97, "y": 7.89, "s": 0.954 }, { "b": "baum3", "x": 10.75, "y": 8.01, "s": 0.882 }, { "b": "baum3", "x": 34.6, "y": 8.28, "s": 0.953 }, { "b": "baum6", "x": 8.66, "y": 8.35, "s": 0.98 }, { "b": "baum5", "x": 3.43, "y": 8.57, "s": 1.068 }, { "b": "baum3", "x": 36.73, "y": 8.6, "s": 1.029 }, { "b": "baum1", "x": 6.12, "y": 8.63, "s": 1.095 }, { "b": "baum6", "x": 39.7, "y": 8.73, "s": 1.099 }, { "b": "baum1", "x": 21.74, "y": 12.93, "s": 0.908 }, { "b": "baum2", "x": 18.94, "y": 13.12, "s": 0.897 }, { "b": "baum2", "x": 25.18, "y": 13.44, "s": 0.876 }, { "b": "baum3", "x": 17.33, "y": 13.51, "s": 1.086 }, { "b": "baum2", "x": 20.5, "y": 13.67, "s": 1.076 }, { "b": "baum5", "x": 27.5, "y": 13.68, "s": 1.005 }, { "b": "baum5", "x": 22.89, "y": 13.82, "s": 0.918 }, { "b": "baum3", "x": 14.54, "y": 14.05, "s": 1.024 }, { "b": "baum1", "x": 11.71, "y": 14.56, "s": 1.116 }, { "b": "baum2", "x": 29.79, "y": 14.65, "s": 0.99 }, { "b": "baum5", "x": 32.21, "y": 14.74, "s": 0.979 }, { "b": "baum1", "x": 13.26, "y": 14.77, "s": 1.117 }, { "b": "baum5", "x": 19.75, "y": 14.91, "s": 0.983 }, { "b": "baum2", "x": 16.64, "y": 14.91, "s": 0.851 }, { "b": "baum2", "x": 1.92, "y": 15.13, "s": 1.115 }, { "b": "baum4", "x": 10.16, "y": 15.31, "s": 0.89 }, { "b": "baum3", "x": 21.34, "y": 15.34, "s": 0.873 }, { "b": "baum3", "x": 36.38, "y": 15.35, "s": 1.107 }, { "b": "baum1", "x": 24.44, "y": 15.38, "s": 0.985 }, { "b": "baum6", "x": 38.24, "y": 15.44, "s": 0.877 }, { "b": "baum2", "x": 28.08, "y": 15.49, "s": 1.066 }, { "b": "baum5", "x": 6.82, "y": 15.53, "s": 0.995 }, { "b": "baum3", "x": 4.06, "y": 15.57, "s": 0.996 }, { "b": "baum3", "x": 18.31, "y": 15.64, "s": 1.114 }, { "b": "baum3", "x": -0.34, "y": 15.72, "s": 0.911 }, { "b": "baum2", "x": 26.27, "y": 15.73, "s": 0.982 }, { "b": "baum3", "x": 8.48, "y": 15.77, "s": 1.064 }, { "b": "baum2", "x": 34.46, "y": 15.86, "s": 0.901 }, { "b": "baum1", "x": 29.59, "y": 15.98, "s": 1.055 }, { "b": "baum1", "x": 12.15, "y": 16.05, "s": 0.853 }, { "b": "baum2", "x": 14.12, "y": 16.16, "s": 1.068 }, { "b": "baum6", "x": 31.81, "y": 16.2, "s": 0.922 }, { "b": "baum2", "x": 23.08, "y": 16.24, "s": 0.879 }, { "b": "baum1", "x": 5.49, "y": 16.25, "s": 0.903 }, { "b": "baum5", "x": 16.91, "y": 16.26, "s": 1.042 }, { "b": "baum4", "x": 40.08, "y": 16.37, "s": 1.059 }, { "b": "baum1", "x": 19.8, "y": 16.41, "s": 1.112 }, { "b": "baum3", "x": 9.83, "y": 16.48, "s": 0.922 }, { "b": "baum5", "x": 24.77, "y": 16.7, "s": 0.917 }, { "b": "baum1", "x": 2.93, "y": 16.83, "s": 1.055 }, { "b": "baum1", "x": 38.18, "y": 16.89, "s": 1.118 }, { "b": "baum5", "x": 26.63, "y": 16.9, "s": 0.94 }, { "b": "baum6", "x": 18.2, "y": 16.97, "s": 1.01 }, { "b": "baum3", "x": 33.09, "y": 16.97, "s": 0.927 }, { "b": "baum5", "x": 15.53, "y": 17.12, "s": 1.016 }, { "b": "baum2", "x": 0.55, "y": 17.17, "s": 0.934 }, { "b": "baum2", "x": 21.03, "y": 17.19, "s": 0.939 }, { "b": "baum6", "x": 30.05, "y": 17.21, "s": 1.006 }, { "b": "baum3", "x": 28.17, "y": 17.22, "s": 1.051 }, { "b": "baum1", "x": 34.76, "y": 17.26, "s": 1.013 }, { "b": "baum5", "x": 8.1, "y": 17.35, "s": 0.872 }, { "b": "baum6", "x": 36.32, "y": 17.35, "s": 0.983 }, { "b": "baum1", "x": 6.38, "y": 17.5, "s": 1.113 }, { "b": "baum2", "x": 31.64, "y": 17.61, "s": 1.073 }, { "b": "baum6", "x": 12.54, "y": 17.73, "s": 0.859 }, { "b": "baum2", "x": 9.69, "y": 17.74, "s": 0.983 }, { "b": "baum2", "x": 23.42, "y": 17.75, "s": 1.042 }, { "b": "baum2", "x": 4.87, "y": 17.86, "s": 0.979 }, { "b": "baum2", "x": 14.37, "y": 18.01, "s": 1.06 }, { "b": "baum3", "x": 38, "y": 18.1, "s": 0.954 }, { "b": "baum5", "x": 3.17, "y": 18.15, "s": 0.969 }, { "b": "baum6", "x": 26.86, "y": 18.16, "s": 0.885 }, { "b": "baum1", "x": 39.6, "y": 18.37, "s": 1.038 }, { "b": "baum5", "x": 19.1, "y": 18.47, "s": 0.864 }, { "b": "baum2", "x": 33.94, "y": 18.53, "s": 1.047 }, { "b": "baum4", "x": 15.96, "y": 18.57, "s": 1 }, { "b": "baum3", "x": 25.22, "y": 18.59, "s": 1.085 }, { "b": "baum3", "x": 0.45, "y": 18.65, "s": 0.952 }, { "b": "baum1", "x": 8.5, "y": 18.68, "s": 0.94 }, { "b": "baum5", "x": 10.29, "y": 18.86, "s": 1.082 }, { "b": "baum2", "x": 6.71, "y": 18.94, "s": 0.913 }, { "b": "baum6", "x": 35.7, "y": 18.97, "s": 0.865 }, { "b": "baum2", "x": 31.82, "y": 19.05, "s": 0.96 }, { "b": "baum4", "x": 29.83, "y": 19.13, "s": 0.861 }, { "b": "baum3", "x": 21.15, "y": 19.19, "s": 0.86 }, { "b": "baum1", "x": 12.86, "y": 19.22, "s": 0.969 }, { "b": "baum4", "x": 17.36, "y": 19.24, "s": 0.902 }, { "b": "baum3", "x": 27.7, "y": 19.26, "s": 0.856 }, { "b": "baum1", "x": 2.14, "y": 19.31, "s": 0.933 }, { "b": "baum1", "x": 23.3, "y": 19.36, "s": 1.068 }, { "b": "baum3", "x": 37.92, "y": 19.37, "s": 1.074 }, { "b": "baum3", "x": 14.44, "y": 19.43, "s": 1 }, { "b": "baum1", "x": 3.79, "y": 19.46, "s": 1.102 }, { "b": "baum2", "x": 40.08, "y": 19.58, "s": 1.023 }];

// shared/karten.ts
var L = (art, x, y, gruppe) => ({ art, x: x + 0.5, y: y + 0.5, gruppe });
var ORTREIHE = ["weidenhain", "rabenmoor", "graufurt", "grauwacht", "hochwacht", "krone"];
var KAMPFFOLGE = { weidenhain: ["speicher", "muehle", "wehr"], rabenmoor: ["bohlenweg", "ried", "totenpfad", "schrein"] };
var ORTSTUFE = { weidenhain: 1, rabenmoor: 2 };
var NEBENKAEMPFE = { weidenhain: ["nest", "ufer"] };
var STRECKEN = /* @__PURE__ */ new Set(["waldweg"]);
var geschafft = (siege, ort) => {
  const f = KAMPFFOLGE[ort];
  return Boolean(f && f.length && siege.has(ort + "/" + f[f.length - 1]));
};
function geschaffteKampagnen(siege) {
  let n = 0;
  while (n < ORTREIHE.length && geschafft(siege, ORTREIHE[n])) n++;
  return n;
}
function darfKaempfen(siege, ort, kampf) {
  if (STRECKEN.has(kampf)) return ORTREIHE.includes(ort);
  const f = KAMPFFOLGE[ort], o = ORTREIHE.indexOf(ort);
  if (o >= 0 && (NEBENKAEMPFE[ort] || []).includes(kampf)) return o === 0 || geschafft(siege, ORTREIHE[o - 1]);
  const i = f ? f.indexOf(kampf) : -1;
  if (i < 0 || o < 0) return false;
  if (i > 0) return siege.has(ort + "/" + f[i - 1]);
  return o === 0 || geschafft(siege, ORTREIHE[o - 1]);
}
var FEIN = 2;
var KARTEN = {
  /* Der Waldweg von der Waldmark nach Weidenhain (werkzeug/waldweg.py): links die Waldmark, rechts Weidenhain. An der Kreuzung führt ein Pfad nach oben auf eine Lichtung,
     auf der zwei Krötengruppen hausen. Sie greifen an, sobald ein Held auf 7 Rechenfelder herankommt, und verfolgen ihn ein gutes Stück. */
  waldweg: {
    name: "Der Waldweg",
    bild: "img/welt/waldweg.webp",
    zeilen: WALDWEG_ZEILEN,
    feinZeilen: true,
    start: WALDWEG_START,
    aggro: 7,
    leine: 16,
    weg: true,
    lager: WALDWEG_LAGER.map((l) => ({ ...l })),
    deko: WALDWEG_DEKO,
    dekoBilder: WALDWEG_BAEUME,
    ausgaenge: [{ x0: 0, x1: 0.8, y0: 0, y1: 18, nach: "waldmark", text: "Zur\xFCck in die Waldmark" }, { x0: 39.2, x1: 40, y0: 0, y1: 18, nach: "weidenhain", text: "Weiter nach Weidenhain" }]
  },
  /* Der Kornspeicher: links das Tor, rechts das Loch zum Graben, dazwischen Säcke und Fässer */
  speicher: {
    name: "Der Kornspeicher",
    bild: "img/weidenhain/speicher.webp",
    zeilen: ["MMMMMMMMMMMM", "MMKK.....KMM", "M..KK..KK.MM", "M..KK..KK.MM", "............", "M..KK..KK.MM", "M.........MM", "MMKK.....KMM", "MMMMMMMMMMMM"],
    start: [[1, 4], [1, 3], [1, 5]],
    lager: [L("schlammkroete", 6, 4, 1), L("schlammkroete", 6, 6, 1), L("schlammkroete", 9, 3, 2), L("schlammkroete", 10, 4, 2)],
    /* sechs Kornsäcke vor den Stapeln: Die Kröten fressen sich hinein */
    schuetz: [L("kornsack", 2, 2, 0), L("kornsack", 5, 3, 0), L("kornsack", 6, 3, 0), L("kornsack", 2, 5, 0), L("kornsack", 5, 5, 0), L("kornsack", 9, 5, 0)],
    probe: { text: "Mindestens 4 Korns\xE4cke retten", art: "schuetzlinge", wert: 4 }
  },
  /* Am Mühlgraben: der Graben teilt die Wiese, in der Mitte ein Steg, oben rechts das Mühlhaus */
  muehle: {
    name: "Am M\xFChlgraben",
    bild: "img/weidenhain/muehle.webp",
    zeilen: ["TTT...~~.MMM", "TTTKK.~~KMMM", "TT....~~..MM", "..K...~~..K.", "............", "..K...~~....", "TT....~~.KKT", "TT....~~..TT", "TTT...~~..TT"],
    start: [[0, 4], [1, 3], [1, 5]],
    lager: [L("schlammkroete", 4, 2, 1), L("schlammkroete", 5, 4, 1), L("irrlicht", 8, 4, 2), L("schlammkroete", 9, 5, 2), L("irrlicht", 9, 7, 3), L("schlammkroete", 11, 5, 3)],
    /* der Hebel am Ufer vor dem Mühlhaus; die Kröten kriechen an beiden Ufern aus dem Graben */
    schleuse: { x: 8.5, y: 3.2, quellen: [[5.5, 7.5], [8.5, 7.5], [5.5, 1.5], [8.5, 6.5]], art: "schlammkroete", takt: 10, erst: 7, max: 3, gesamt: 8 },
    probe: { text: "Die Schleuse in unter 60 s schlie\xDFen", art: "schleuse", wert: 60 }
  },
  /* Hinter der Scheune (Nebenkampf): ein Tümpel unter dem alten Baum voller Krötenlaich. 16 × 9 Felder, der Tümpel ist flach und begehbar. */
  nest: {
    name: "Hinter der Scheune",
    bild: "img/weidenhain/nest.webp",
    zeilen: ["MMMMMMMMMMTTTTTT", "MMMMMMMMMMTTTTTT", "MMMMMMMMMMTTTTTT", "MMMMMMT.....TTTT", ".KKKKKK......KTT", ".KK...K......K.T", "....KK.....KKKTT", "T.....K...TTTTTT", "TTTT......TTTTTT"],
    start: [[1, 6], [2, 7], [0, 5]],
    lager: [
      { art: "laich", x: 9.6, y: 4.55, gruppe: 9 },
      { art: "laich", x: 10.4, y: 3.4, gruppe: 9 },
      { art: "laich", x: 11.6, y: 3.9, gruppe: 9 },
      L("schlammkroete", 8, 5, 1),
      L("kroetchen", 7, 4, 1),
      L("kroetchen", 11, 5, 2),
      L("kroetchen", 12, 4, 2)
    ]
  },
  /* Am Mühlteich (Nebenkampf): Mettes Kräuterufer, rechts das Wasser. Die Irrlichter huschen einmal davon, wenn sie fast besiegt sind. */
  ufer: {
    name: "Am M\xFChlteich",
    bild: "img/weidenhain/ufer.webp",
    zeilen: ["TTTTTTTTTT....TT", "TTTT.TT....TTTTT", "TTT.........TT~~", "T........T...~~~", ".......KTTK~~~~~", "...........T~~~~", ".KT..........~~T", "TT...........TTT", "TTTT...........T"],
    start: [[1, 4], [1, 5], [2, 3]],
    lager: [
      { ...L("irrlicht", 9, 2, 1), blinzeln: true },
      { ...L("irrlicht", 11, 3, 1), blinzeln: true },
      { ...L("irrlicht", 8, 6, 2), blinzeln: true },
      { ...L("irrlicht", 11, 6, 2), blinzeln: true },
      L("schlammkroete", 10, 6, 2),
      { ...L("irrlicht", 12, 7, 3), blinzeln: true },
      { ...L("irrlicht", 13, 0, 3), blinzeln: true },
      L("schlammkroete", 11, 7, 3)
    ]
  },
  /* ---------- Rabenmoor (gemalte Karten aus dem Würfelspiel, 12 × 9) ---------- */
  /* Der Bohlenweg: ein Steg, nur eine Feldreihe breit; links und rechts eine Insel. Hinter dir im Schilf warten Kröten – wer losläuft, ist eingekesselt. */
  bohlenweg: {
    name: "Der Bohlenweg",
    bild: "img/rabenmoor/bohlenweg.webp",
    zeilen: ["~~~~~~~~~~~~", "~..~~~~~~~~~", "T..~~~~~~~.T", "...~~~~~~~..", "............", "K..~~~~~~~.K", "K..~~~~~~~K.", ".~~~~~~~~~~~", "~~~~~~~~~~~~"],
    start: [[1, 3], [2, 3], [1, 5]],
    lager: [L("schlammkroete", 6, 4, 1), L("irrlicht", 5, 4, 1), L("schlammkroete", 10, 4, 2), L("irrlicht", 10, 3, 2), L("irrlicht", 10, 5, 2), L("schlammkroete", 10, 2, 2), L("schlammkroete", 11, 3, 2)]
  },
  /* Das Ried: Schlamminseln zwischen gewundenen Wasserläufen; Kröten in drei Gruppen, Irrlichter, die davonhuschen */
  ried: {
    name: "Das Ried",
    bild: "img/rabenmoor/ried.webp",
    zeilen: ["TTTTT~~..TTT", "TT..~~~...TT", "........K~~.", "...~T....~~.", "~~~...~~~...", "...~........", "...~~....K~T", "TT..~.~~~.TT", "TTT...~~.TTT"],
    start: [[1, 3], [1, 2], [2, 3]],
    lager: [
      L("schlammkroete", 6, 2, 1),
      L("schlammkroete", 7, 3, 1),
      { ...L("irrlicht", 8, 1, 1), blinzeln: true },
      L("schlammkroete", 10, 4, 2),
      L("schlammkroete", 11, 5, 2),
      { ...L("irrlicht", 10, 5, 2), blinzeln: true },
      L("schlammkroete", 6, 6, 3),
      L("kroetchen", 7, 5, 3),
      L("kroetchen", 8, 6, 3)
    ]
  },
  /* Der Totenpfad: ein Damm aus Wurzeln zwischen schwarzen Tümpeln. Die Ertrunkenen stehen einmal wieder auf. */
  totenpfad: {
    name: "Der Totenpfad",
    bild: "img/rabenmoor/totenpfad.webp",
    zeilen: ["~~~~~~~~~~~~", "~T~~~~TT~~T~", ".T..~T....M.", "...T~..K.~..", "............", "...~T..~~..T", "TK.....~~.KT", "T~~~~~~T.~~T", "~~~~~~~~~~~~"],
    start: [[1, 4], [0, 4], [1, 3]],
    lager: [L("moorleiche", 5, 4, 1), L("moorleiche", 6, 3, 1), L("irrlicht", 8, 2, 2), L("moorleiche", 9, 4, 2), L("moorleiche", 10, 3, 2), L("irrlicht", 11, 4, 2)]
  },
  /* Der versunkene Schrein: Alwine, die Stumme, zwischen sechs Spiralsteinen. Ihre Wehklage trifft alles in der Nähe; sie ruft Irrlichter. */
  schrein: {
    name: "Der versunkene Schrein",
    bild: "img/rabenmoor/schrein.webp",
    zeilen: ["~~~~~~~~~~~~", "~~~~.....T~~", "~~T.M...M.~~", "~~...MM....~", "~~M..KK..M.~", "~T........K~", "~~..M..M.T~~", "~~~T....T~~~", "~~~~~~~~~~~~"],
    start: [[5, 7], [6, 7], [4, 7]],
    lager: [L("alwine", 6, 2, 1), L("moorleiche", 3, 3, 1), L("moorleiche", 8, 3, 1), L("irrlicht", 5, 1, 1)]
  },
  /* Das alte Wehr: ein Streifen Ufer zwischen Mühlteich oben und dem Abfluss unten */
  wehr: {
    name: "Das alte Wehr",
    bild: "img/weidenhain/wehr.webp",
    zeilen: ["TT~~~~~~~~~T", "TTT~~~~~~MMT", ".TT......MM.", "............", ".T..........", "TTT.......K.", "............", "MMMMMMMMMMMM", "T~~~~~~~~~~~"],
    start: [[0, 3], [1, 3], [0, 4]],
    lager: [L("alte_unke", 9, 4, 1), L("irrlicht", 8, 2, 1), L("irrlicht", 10, 6, 1), L("schlammkroete", 7, 5, 1)],
    probe: { text: "Kein Held vom Giftschwall getroffen", art: "ausweichen" }
  }
};
export {
  AGGRO,
  BIT,
  DT,
  EP_BIS,
  FEIN,
  FELS,
  GRUNDKARTE,
  HELDEN,
  HELDENEP,
  HELDENREIHE,
  HELDENSTUFE,
  K,
  KAMPFFOLGE,
  KARTEN,
  KB,
  KH,
  LAGER,
  LEINE,
  MONSTER,
  NEBENKAEMPFE,
  ORTREIHE,
  ORTSTUFE,
  PROBE,
  PROTOKOLL,
  SCHLEUSE,
  SCHUETZ,
  SIEGEL,
  STAERKE,
  START,
  STRECKEN,
  STUFENBONUS,
  STUFE_MAX,
  Sim,
  TICK,
  WASSER,
  ZUSTAND_JE,
  abstand,
  begehbar,
  darfKaempfen,
  fels,
  frei,
  geschaffteKampagnen,
  karteJetzt,
  karteNehmen,
  naechstFrei,
  schieben,
  setzeKarte,
  setzeStaerke,
  stufeAusEp,
  trefferchance,
  weg
};
