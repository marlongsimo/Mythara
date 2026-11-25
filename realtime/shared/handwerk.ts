/*
 * Mythara – Handwerk (seit 25.11.2026, Konzept doku/berufe/Mythara-Handwerk.pdf). Der Server rechnet alles (server/src/handwerk.ts).
 *   · Drei Werkstätten in der Waldmark: Esse (Erz + Brennholz → Barren), Amboss (Barren … → Klingen, schwere Rüstung, Werkzeuge),
 *     Werkbank (Flachs → Bogensehne, Hanf → Garn, Kuhhaut → Leder, Garn → Stoff, Holz → Bögen/Stäbe/Schilde, Leder/Stoff → leichte und Stoffrüstung).
 *   · Flachs und Hanf wachsen auf Feldern im Osthof (Pflücken ohne Werkzeug, gemeinsamer Sammel-Kern), Kuhhaut lassen die Kühe im Gehege fallen.
 *   · Herstellen gelingt immer; „Glut“ (12 %): wer binnen 1,5 s antippt, spart beim nächsten Stück eine Einheit der häufigsten Zutat und bekommt 50 % mehr XP.
 *   · XP fürs Verarbeiten = 50 % der Sammel-XP, die in den Zutaten steckt; Schmelzen 30 % der Erz-XP. Nur Garn stapelt.
 * Die XP stehen im Inventar des Helden (Feld „berufe“, Schlüssel „handwerk“) – keine neue Tabelle.
 */
import { SammelArt } from "./sammeln";
import { zwischenteil } from "./gegenstaende";

export const BERUF_HAND = "handwerk";
/** Werkstätten in der Welt; „hand“ = im Rucksack (Benutzen: Sehne auf ungespannten Bogen) */
export type WeltStation = "esse" | "amboss" | "werkbank";
export type StationId = WeltStation | "hand";
/** Werkstätten (Weltfelder; Esse und Amboss stehen in der Schmiede der Waldmark, die Werkbank davor) */
export const STATIONEN: Record<WeltStation, { id: WeltStation; name: string; x: number; y: number; tun: string }> = {
  esse: { id: "esse", name: "Esse", x: 6467.4, y: 6427.8, tun: "Schmelzen" },
  amboss: { id: "amboss", name: "Amboss", x: 6470.4, y: 6427.6, tun: "Schmieden" },
  werkbank: { id: "werkbank", name: "Werkbank", x: 6463.5, y: 6426.5, tun: "Werken" },
};
/** Am Amboss braucht man einen Hammer im Rucksack (wie in OSRS) */
export const WERKZEUG_AN: Partial<Record<StationId, string>> = { amboss: "hammer" };
/** Die Werkstätten in der Welt: eine Station kann mehrere Standorte haben (die Werkbank steht auch im Osthof) */
export interface Werkstatt { id: string; station: WeltStation; x: number; y: number; ort: string }
export const WERKSTAETTEN: Werkstatt[] = [
  { id: "esse", station: "esse", x: STATIONEN.esse.x, y: STATIONEN.esse.y, ort: "waldmark" },
  { id: "amboss", station: "amboss", x: STATIONEN.amboss.x, y: STATIONEN.amboss.y, ort: "waldmark" },
  { id: "werkbank", station: "werkbank", x: STATIONEN.werkbank.x, y: STATIONEN.werkbank.y, ort: "waldmark" },
  { id: "werkbank_osthof", station: "werkbank", x: 6536.5, y: 6421.5, ort: "osthof" },   /* auf der Wiese südlich des Kuhgeheges, rechts neben dem Tor (handwerk_welt.json) */
];
export const HANDWERK_WEIT = 2.6;           // so nah muss man an der Werkstatt stehen (Felder)
export const GLUT_CHANCE = 0.12, GLUT_MS = 1500, TICK_MS = 500;

const LV = [1, 10, 20, 35, 45, 65];
const HOLZ = ["stamm_eiche", "stamm_tanne", "stamm_eibe", "stamm_moorweide", "stamm_kernbaum", "stamm_weltenbaum"], HXP = [25, 40, 70, 110, 175, 260];
const ERZ = ["kupfer", "eisen", "schwarzeisen", "sterneisen", "splittereisen", "ureisen"], EXP = [20, 35, 60, 100, 160, 250], ERZ_JE_BARREN = [1, 2, 2, 2, 2, 3];
const LEDER = ["leder_rau", "leder_weich", "leder_gehaertet", "leder_moor", "leder_splitter", "leder_ur"], HAEUTE = [1, 1, 2, 2, 3, 4], GXP = [15, 25, 45, 75, 120, 190];
const STOFF = ["stoff_hanf", "stoff_grob", "stoff_fein", "stoff_mond", "stoff_splitter", "stoff_welten"], GARNE = [2, 3, 4, 5, 6, 8], WXP = [12, 22, 40, 65, 105, 170];
/** Pflücken gibt keine XP (nur der Wert der Zutat für die XP der Endprodukte) */ const PFLUECK_XP = 8, GARN_XP = 4, SEHNE_XP = 4;
const r5 = (x: number) => (x >= 20 ? 5 * Math.round(x / 5) : Math.round(x));

export interface Zutat { /** eine der Sorten (z. B. jedes Holz ab Eibe) */ g: string[]; n: number }
export interface Rezept { id: string; station: StationId; ergebnis: string; level: number; zutaten: Zutat[]; xp: number; ticks: number; stufe: number; gruppe: string; /** nur mit dieser Quest (shared/quest03.ts) */ quest?: string }
export const REZEPTE: Rezept[] = [];
/** Welche Bewegung der Held beim Werken macht: Ofen (Esse), Hämmern (Amboss), Weben (Sehne, Garn, Stoff, Leder), Schnitzen (Holzwaren), Zusammenfügen (Rüstung aus Leder und Stoff) */
export type WerkTat = "ofen" | "haemmern" | "weben" | "schnitzen" | "fuegen";
export const werkTat = (r: { station: StationId; gruppe: string }): WerkTat => r.station === "esse" ? "ofen" : r.station === "amboss" ? "haemmern" : r.station === "hand" ? "fuegen"
  : ["Sehne und Garn", "Leder", "Stoff"].includes(r.gruppe) ? "weben" : /Kapuze|Hose|Rock|Wams|Robe/.test(r.gruppe) ? "fuegen" : "schnitzen";
const dazu = (r: Rezept) => { if (!REZEPTE.some((x) => x.id === r.id)) REZEPTE.push(r); };

/* Vorstufen */
dazu({ id: "bogensehne", station: "werkbank", ergebnis: "bogensehne", level: 1, zutaten: [{ g: ["flachs"], n: 1 }], xp: SEHNE_XP, ticks: 2, stufe: 0, gruppe: "Sehne und Garn" });
dazu({ id: "garn", station: "werkbank", ergebnis: "garn", level: 1, zutaten: [{ g: ["hanf"], n: 1 }], xp: GARN_XP, ticks: 2, stufe: 0, gruppe: "Sehne und Garn" });
for (let t = 0; t < 6; t++) {
  dazu({ id: "barren_" + ERZ[t], station: "esse", ergebnis: "barren_" + ERZ[t], level: LV[t], zutaten: [{ g: ["erz_" + ERZ[t]], n: ERZ_JE_BARREN[t] }, { g: HOLZ.slice(Math.max(0, t - 2)), n: 1 }],
    xp: r5(0.3 * EXP[t] * ERZ_JE_BARREN[t]), ticks: 3, stufe: t, gruppe: "Barren" });
  dazu({ id: LEDER[t], station: "werkbank", ergebnis: LEDER[t], level: LV[t], zutaten: [{ g: ["kuhhaut"], n: HAEUTE[t] }, { g: HOLZ, n: 1 }], xp: GXP[t], ticks: 3, stufe: t, gruppe: "Leder" });
  dazu({ id: STOFF[t], station: "werkbank", ergebnis: STOFF[t], level: LV[t], zutaten: [{ g: ["garn"], n: GARNE[t] }], xp: WXP[t], ticks: 3, stufe: t, gruppe: "Stoff" });
}
/* Endprodukte: Familie, Werkstatt, Gegenstand je Stufe (– = gibt es auf dieser Stufe nicht), Level-Versatz, Zutaten (B Barren, S Stamm, L Leder, G Garn, N Sehne, T Stoff) */
const ST = ["_gewoehnlich", "", "_episch", "_legendaer", "_mythisch"];   // Stufe 1–5 bei Klingen, Bögen, Schild, Stab, schwerer Rüstung (Selten ohne Endung)
const kette = (b: string, training = "-") => [training, ...ST.map((e) => b + e)];
const leicht = (b: string, training = "-") => [training, b, b + "_selten", b + "_episch", b + "_legendaer", b + "_mythisch"];   // leichte/Stoff-Rüstung: Einfach ohne Endung
const werkzeug = (b: string) => ["training", "einfach", "selten", "episch", "legendaer", "mythisch"].map((e) => b + "_" + e);
type E = "B" | "S" | "L" | "G" | "N" | "T";
const FAMILIEN: [string, StationId, string[], number, Partial<Record<E, number>>][] = [
  ["Dolch", "amboss", kette("eiddolch"), 0, { B: 1, S: 1 }],
  ["Holzbeil", "amboss", werkzeug("holzbeil"), 1, { B: 1, S: 1 }],
  ["Spitzhacke", "amboss", werkzeug("spitzhacke"), 1, { B: 1, S: 1 }],
  ["Einhandschwert", "amboss", kette("eidschwert", "ritterschwert"), 2, { B: 2, S: 1 }],
  ["Speer", "amboss", kette("sterndorn"), 3, { B: 1, S: 2 }],
  ["Helm", "amboss", kette("eisenwachthelm"), 3, { B: 2, L: 1 }],
  ["Streitkolben", "amboss", kette("sternbrecher"), 5, { B: 3, S: 1 }],
  ["Beinschienen", "amboss", kette("eisenbeinschienen"), 6, { B: 3, L: 1 }],
  ["Zweihänder", "amboss", kette("eidzweihaender"), 7, { B: 3, S: 1, L: 1 }],
  ["Brustpanzer", "amboss", kette("eisenwacht"), 9, { B: 5, L: 1 }],
  ["Kurzbogen", "werkbank", kette("mondkurzbogen", "jagdbogen"), 1, { S: 2, N: 1 }],
  ["Langbogen", "werkbank", kette("mondlangbogen"), 4, { S: 3, N: 1 }],
  ["Schild", "werkbank", kette("sternenschild", "rundschild"), 5, { S: 3, B: 1 }],
  ["Stab", "werkbank", kette("sternenszepter", "hirtenstab"), 6, { S: 3, G: 1 }],
  ["Armbrust", "werkbank", kette("sternarmbrust"), 6, { S: 2, B: 1, N: 1 }],
  ["Kapuze (Leder)", "werkbank", leicht("jaegerkapuze"), 1, { L: 2, G: 1 }],
  ["Kapuze (Stoff)", "werkbank", leicht("magierkapuze"), 1, { T: 2, G: 1 }],
  ["Hose (Leder)", "werkbank", leicht("jaegerhose"), 3, { L: 3, G: 1 }],
  ["Rock (Stoff)", "werkbank", leicht("magierrock"), 3, { T: 3, G: 1 }],
  ["Wams (Leder)", "werkbank", leicht("jaegerwams", "lederpanzer"), 8, { L: 4, G: 1 }],
  ["Robe (Stoff)", "werkbank", leicht("magierrobe", "magiepanzer"), 8, { T: 4, G: 1 }],
];
const einheit = (e: E, t: number): string => ({ B: "barren_" + ERZ[t], S: HOLZ[t], L: LEDER[t], G: "garn", N: "bogensehne", T: STOFF[t] })[e];
const wert = (e: E, t: number): number => ({ B: EXP[t] * ERZ_JE_BARREN[t], S: HXP[t], L: GXP[t] * 2, G: (PFLUECK_XP + GARN_XP) * 2, N: (PFLUECK_XP + SEHNE_XP) * 2, T: WXP[t] * 2 })[e];
for (const [gruppe, station, ids, versatz, zut] of FAMILIEN) for (let t = 1; t < 6; t++) { const g = ids[t]; if (!g || g === "-") continue; /* Trainingsteile (Stufe 0) kann man nicht herstellen */
  const z = Object.entries(zut) as [E, number][], einheiten = z.reduce((s, [, n]) => s + n, 0);
  const level = Math.min(99, LV[t] + versatz), xp = r5(0.5 * z.reduce((s, [e, n]) => s + wert(e, t) * n, 0)), teil = zwischenteil(g);
  if (teil) { /* zweistufig wie in OSRS: an der Werkbank schnitzen (ungespannter Bogen / Armbrustschaft), dann im Rucksack die Sehne darauf benutzen */
    const ohneSehne = z.filter(([e]) => e !== "N"), xpA = r5(xp * 0.6);
    dazu({ id: teil, station, ergebnis: teil, level, zutaten: ohneSehne.map(([e, n]) => ({ g: [einheit(e, t)], n })), xp: xpA, ticks: 3 + 2 * (einheiten - 1), stufe: t, gruppe });
    dazu({ id: g, station: "hand", ergebnis: g, level, zutaten: [{ g: [teil], n: 1 }, { g: ["bogensehne"], n: 1 }], xp: xp - xpA, ticks: 2, stufe: t, gruppe }); continue; }
  dazu({ id: g, station, ergebnis: g, level, zutaten: z.map(([e, n]) => ({ g: [einheit(e, t)], n })), xp, ticks: 3 + 2 * einheiten, stufe: t, gruppe }); }
/* Quest 03 „Der Säbel des Waldgottes“: Waldstein schmelzen, Waldsäbel schmieden – nur mit dem Auftrag des Försters */
dazu({ id: "barren_waldstein", station: "esse", ergebnis: "barren_waldstein", level: 1, zutaten: [{ g: ["erz_waldstein"], n: 1 }], xp: 25, ticks: 3, stufe: 0, gruppe: "Auftrag des Försters", quest: "nordwald_waldsaebel" });
dazu({ id: "waldsaebel", station: "amboss", ergebnis: "waldsaebel", level: 1, zutaten: [{ g: ["barren_waldstein"], n: 1 }, { g: ["holz_waldgott"], n: 1 }], xp: 40, ticks: 5, stufe: 0, gruppe: "Auftrag des Försters", quest: "nordwald_waldsaebel" });
export const rezept = (id: string): Rezept | undefined => REZEPTE.find((r) => r.id === id);
export const rezepteAn = (st: StationId): Rezept[] => REZEPTE.filter((r) => r.station === st).sort((a, b) => a.level - b.level || a.gruppe.localeCompare(b.gruppe));

/* Flachs- und Hanffelder im Osthof (Pflücken ohne Werkzeug, Sammel-Kern) */
export type PflanzenArt = "flachs" | "hanf";
export interface PflanzenDef extends SammelArt { art: PflanzenArt; modell: string; leer: string; hoehe: number }
const P = "img/objekte3d/skilling/sammeln/";
export const PFLANZEN: Record<PflanzenArt, PflanzenDef> = {
  flachs: { art: "flachs", name: "Flachs", level: 1, xp: 0, lo: 200, hi: 255, fall: 0.3, nachwachsen: 15, ertrag: "flachs", modell: P + "flachs.glb", leer: P + "flachs-geerntet.glb", hoehe: 1.0 },
  hanf: { art: "hanf", name: "Hanf", level: 1, xp: 0, lo: 200, hi: 255, fall: 0.3, nachwachsen: 15, ertrag: "hanf", modell: P + "hanf.glb", leer: P + "hanf-geerntet.glb", hoehe: 1.3 },
};
export interface Pflanze { id: string; art: PflanzenArt; x: number; y: number }
/** Osthof: Flachs auf dem westlichen, Hanf auf dem mittleren Acker (je 8 Pflanzen) */
export const PFLANZEN_STANDORTE: Pflanze[] = [
  ...[6506.5, 6509.5, 6512.5, 6515.5].flatMap((x, i) => [6412.5, 6416.5].map((y, j) => ({ id: `flachs_${i * 2 + j + 1}`, art: "flachs" as const, x, y }))),
  ...[6546.5, 6549.5, 6552.5, 6555.5].flatMap((x, i) => [6410.5, 6414.5].map((y, j) => ({ id: `hanf_${i * 2 + j + 1}`, art: "hanf" as const, x, y }))),
];
export const pflanze = (id: string): Pflanze | undefined => PFLANZEN_STANDORTE.find((p) => p.id === id);
export const PFLUECK_TAKT_MS = 1500, PFLUECK_WEIT = 1.8;
