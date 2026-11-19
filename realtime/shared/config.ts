/*
 * Mythara Echtzeit – gemeinsame Zahlen für Server und Client.
 * Längen in Feldern (ein Feld = eine Kachel), Zeiten in Sekunden. Alle Werte sind Startwerte und nicht abgestimmt.
 */
export const TICK = 20;            // Rechenschritte je Sekunde (Server-Simulation)
export const DT = 1 / TICK;
export const ZUSTAND_JE = 1;       // jeder Schritt geht an den Client: 20 Zustände je Sekunde (direkte Steuerung soll sich unmittelbar anfühlen)
export const PROTOKOLL = 1;

export interface HeldDef { name: string; klasse: string; bild: string; figur?: string; /* ganze Figur von schräg oben, freigestellt, blickt nach rechts */ lauf?: string; hieb?: string; /* Bildblätter mit je acht Bildern (laufen, zuschlagen), 4 x 2, je 176 Pixel */ lp: number; tempo: number; reich: number; schaden: number; takt: number; nah: boolean; flug?: number;
  q: { name: string; zeit: number; text: string }; e: { name: string; zeit: number; text: string } }
export const HELDEN: Record<string, HeldDef> = {
  schildwaechter: { name: "Torvald", klasse: "Krieger", bild: "img/figuren/schildwaechter.jpg", figur: "img/echtzeit/torvald.webp", lauf: "img/echtzeit/torvald-lauf.webp", hieb: "img/echtzeit/torvald-hieb.webp", lp: 320, tempo: 4.2, reich: 1.35, schaden: 26, takt: 0.8, nah: true,
    q: { name: "Schildstoß", zeit: 7, text: "Stürmt vor: Schaden und kurze Betäubung für den ersten Gegner." }, e: { name: "Bollwerk", zeit: 12, text: "3 Sekunden lang 60 % weniger Schaden." } },
  elementarist: { name: "Vaelin", klasse: "Magier", bild: "img/figuren/elementarist.jpg", lp: 190, tempo: 4.2, reich: 6, schaden: 20, takt: 0.75, nah: false, flug: 14,
    q: { name: "Feuerball", zeit: 6, text: "Explodiert am Ziel und trifft alle im Umkreis." }, e: { name: "Blinzeln", zeit: 10, text: "Springt ein Stück in Zielrichtung." } },
};

export interface MonsterDef { name: string; bild: string; lp: number; tempo: number; reich: number; schaden: number; takt: number; r: number; xp: number; boss?: boolean }
export const MONSTER: Record<string, MonsterDef> = {
  schattenkobold: { name: "Schattenkobold", bild: "img/gegner/schattenkobold.jpg", lp: 60, tempo: 3.7, reich: 1.2, schaden: 8, takt: 0.9, r: 0.32, xp: 20 },
  rostkaefer: { name: "Rostkäfer", bild: "img/gegner/rostkaefer.jpg", lp: 95, tempo: 3.2, reich: 1.2, schaden: 11, takt: 1.0, r: 0.36, xp: 28 },
  knochenwaechter: { name: "Knochenwächter", bild: "img/gegner/knochenwaechter.jpg", lp: 150, tempo: 3.3, reich: 1.3, schaden: 15, takt: 1.1, r: 0.38, xp: 45 },
  grabritter: { name: "Siegelwächter", bild: "img/gegner/grabritter.jpg", lp: 700, tempo: 2.9, reich: 1.6, schaden: 28, takt: 1.3, r: 0.62, xp: 200, boss: true },
};

export const K = {
  R_HELD: 0.36,
  SICHT: 6,               // so weit greift ein Held von selbst an, wenn er nichts zu tun hat
  AGGRO: 5.5, LEINE: 9,   // Monster: ab wann sie angreifen, wie weit sie ihrem Lager folgen
  WIEDER_HELD: 5,         // Sekunden bis ein gefallener Held am Eingang wieder aufsteht
  XP_STUFE: [0, 60, 150, 280, 450, 660, 910, 1200, 1530, 1900], // Erfahrung für Stufe 1 bis 10
  LP_JE_STUFE: 0.12, SCHADEN_JE_STUFE: 0.1,
  SPLITTER: [1, 20] as [number, number], SPLITTER_BOSS: [40, 60] as [number, number],
  BOSS_SCHLAG: { alle: 6, warn: 1.1, r: 2.3, schaden: 60 }, // der Boss kündigt einen Flächenschlag an – ausweichen!
  STOSS: { weite: 3.4, schaden: 32, betaeubt: 1.0 }, BOLLWERK: { dauer: 3, faktor: 0.4 },
  FEUER: { reich: 6.5, r: 1.6, schaden: 48, flug: 11 }, BLINZELN: 3.5,
  EINGABEN_JE_SEK: 30,    // mehr nimmt der Server von einem Client nicht an
};
