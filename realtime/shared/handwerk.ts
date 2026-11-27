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
import { WAFFE_LADEN, AN_WAFFE } from "./splitterbinden";
import KOCHSTELLEN from "./kochstellen.json";

export const BERUF_HAND = "handwerk";
/** Werkstätten in der Welt; „hand“ = im Rucksack (Benutzen: Sehne auf ungespannten Bogen) */
export type WeltStation = "esse" | "amboss" | "werkbank" | "bindestein" | "feuer" | "backofen" | "herd" | "kessel" | "brunnen" | "raeucherhuette";
export type StationId = WeltStation | "hand";
/** Werkstätten (Weltfelder; Esse und Amboss stehen in der Schmiede der Waldmark, die Werkbank im Osthof beim Kuhgehege) */
export const STATIONEN: Record<WeltStation, { id: WeltStation; name: string; x: number; y: number; tun: string }> = {
  esse: { id: "esse", name: "Esse", x: 6467.4, y: 6427.8, tun: "Schmelzen" },
  amboss: { id: "amboss", name: "Amboss", x: 6470.4, y: 6427.6, tun: "Schmieden" },
  werkbank: { id: "werkbank", name: "Werkbank", x: 6530.5, y: 6426.5, /* die einzige Werkbank steht im Osthof (die in der Waldmark ist entfernt) */ tun: "Werken" },
  /* Splitterbinden (Phase 3a): Bindestein an der Linde im Steinring in Weidenhain – nutzbar nach B1 „Der Wegstein“ (Schalter bindestein_linde) */
  bindestein: { id: "bindestein", name: "Bindestein", x: 6453.2, y: 6679.4, tun: "Binden" },
  /* Kochen (Phase 3b): Standorte in kochstellen.json – hier nur der erste je Station (für Texte); Backofen, Herd und Kessel stehen erst, wenn die Welt sie gebaut hat */
  feuer: { id: "feuer", name: "Feuer", x: 6442, y: 6687.25, tun: "Kochen" },
  backofen: { id: "backofen", name: "Backofen", x: 0, y: 0, tun: "Backen" },
  herd: { id: "herd", name: "Herd", x: 0, y: 0, tun: "Kochen" },
  kessel: { id: "kessel", name: "Kessel", x: 0, y: 0, tun: "Kochen" },
  brunnen: { id: "brunnen", name: "Brunnen", x: 6448, y: 6432.85, tun: "Schöpfen" },
  /* Phase 10 (#102): Räucherhütte der Möwenbucht – Kochstation mit Wartezeit (Rezept.warten); Standort trägt die Integration in kochstellen.json ein */
  raeucherhuette: { id: "raeucherhuette", name: "Räucherhütte", x: 0, y: 0, tun: "Räuchern" },
};
/** Am Amboss braucht man einen Hammer im Rucksack (wie in OSRS) */
export const WERKZEUG_AN: Partial<Record<StationId, string>> = { amboss: "hammer" };
/** Die Werkstätten in der Welt: eine Station kann mehrere Standorte haben (die Werkbank steht auch im Osthof) */
export interface Werkstatt { id: string; station: WeltStation; x: number; y: number; ort: string; /** nutzbar nur mit diesem Quest-Schalter (shared/quests.ts schalterAn) – sonst dieser Text */ schalter?: string; gesperrt?: string }
export const WERKSTAETTEN: Werkstatt[] = [
  { id: "esse", station: "esse", x: STATIONEN.esse.x, y: STATIONEN.esse.y, ort: "waldmark" },
  { id: "amboss", station: "amboss", x: STATIONEN.amboss.x, y: STATIONEN.amboss.y, ort: "waldmark" },
  { id: "werkbank_osthof", station: "werkbank", x: 6530.5, y: 6426.5, ort: "osthof" },
  { id: "bindestein_linde", station: "bindestein", x: STATIONEN.bindestein.x, y: STATIONEN.bindestein.y, ort: "weidenhain", schalter: "bindestein_linde",
    gesperrt: "Ein glatter Stein zwischen den Wurzeln der Linde. Agnes weiß, was es mit ihm auf sich hat." },   /* südlich des Kuhgeheges beim Tor, links neben der Scheune – nicht unter ihrem Dach (handwerk_welt.json) */
];
/* Kochen (Phase 3b): Feuer, Brunnen – und später Backofen, Herd, Kessel – aus kochstellen.json */
for (const k of (KOCHSTELLEN as unknown as { stellen: (Werkstatt & { name: string })[] }).stellen) WERKSTAETTEN.push({ id: k.id, station: k.station, x: k.x, y: k.y, ort: k.ort, ...(k.schalter ? { schalter: k.schalter, gesperrt: k.gesperrt } : {}) });
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
export interface Rezept { id: string; station: StationId; ergebnis: string; level: number; zutaten: Zutat[]; xp: number; ticks: number; stufe: number; gruppe: string; /** nur mit dieser Quest (shared/quest03.ts) */ quest?: string;
  /** Kochen: kann anbrennen – dann dieser Gegenstand, ohne XP (brennChance) */ verbrannt?: string;
  /** so viele Stück je Herstellen (Standard 1; Eisenbänder: 2 je Barren) */ menge?: number;
  /** Waffe laden (ergebnis „ladung:@waffe“ / „entladen:@waffe“): nur für eine angelegte Waffe dieser Seltenheit (Phase 5b) */ fuer?: string;
  /** Station mit Wartezeit (Räucherhütte, #102): die Zutaten gehen sofort hinein, nach so vielen Sekunden holt man alles ab (XP beim Abholen, brennt nicht an); ein Auftrag je Spieler */ warten?: number }
export const REZEPTE: Rezept[] = [];
/** Welche Bewegung der Held beim Werken macht: Ofen (Esse), Hämmern (Amboss), Weben (Sehne, Garn, Stoff, Leder), Schnitzen (Holzwaren), Zusammenfügen (Rüstung aus Leder und Stoff) */
export type WerkTat = "ofen" | "haemmern" | "weben" | "schnitzen" | "fuegen";
export const werkTat = (r: { station: StationId; gruppe: string }): WerkTat => r.station === "esse" || r.station === "feuer" || r.station === "backofen" || r.station === "herd" ? "ofen" : r.station === "kessel" || r.station === "brunnen" ? "fuegen" : r.station === "amboss" ? "haemmern" : r.station === "hand" || r.station === "bindestein" ? "fuegen"
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
/* Phase 2 „Waldland“: Quest-Rezepte (nur mit dem Auftrag) – A1 Wachbogen an der Werkbank und im Rucksack, A3 Mühlenachslager am Amboss */
dazu({ id: "wachbogen_ungespannt", station: "werkbank", ergebnis: "wachbogen_ungespannt", level: 1, zutaten: [{ g: ["stamm_eiche"], n: 1 }], xp: 30, ticks: 3, stufe: 0, gruppe: "Auftrag der Wachführerin", quest: "waldmark_sehnen_fuer_den_wachturm" });
dazu({ id: "wachbogen", station: "hand", ergebnis: "wachbogen", level: 1, zutaten: [{ g: ["wachbogen_ungespannt"], n: 1 }, { g: ["bogensehne"], n: 1 }], xp: 15, ticks: 2, stufe: 0, gruppe: "Auftrag der Wachführerin", quest: "waldmark_sehnen_fuer_den_wachturm" });
dazu({ id: "muehlenachslager", station: "amboss", ergebnis: "muehlenachslager", level: 1, zutaten: [{ g: ["barren_kupfer"], n: 2 }], xp: 40, ticks: 5, stufe: 0, gruppe: "Auftrag des Müllerjungen", quest: "osthof_die_muehle_steht_still" });
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

/* Phase 3a Splitterbinden (shared/splitterbinden.ts): den Wegstein am Bindestein laden – „ladung:wegstein“ ist kein Gegenstand, sondern zählt die Ladungen im Inventar hoch */
dazu({ id: "wegstein_laden", station: "bindestein", ergebnis: "ladung:wegstein", level: 1, zutaten: [{ g: ["splitter"], n: 2 }], xp: 2, ticks: 1, stufe: 0, gruppe: "Wegstein" });
/* Phase 5b: Waffen ab Selten laden – die angelegte Waffe (ladung:@waffe); 2 Splitter oder 1 Splitter + 1 Seelenlicht je Ladung, Stufe und XP nach Seltenheit (Kanon) */
for (const [sel, W] of Object.entries(WAFFE_LADEN)) {
  dazu({ id: `waffe_laden_${sel}`, station: "bindestein", ergebnis: "ladung:" + AN_WAFFE, fuer: sel, level: W.level, zutaten: [{ g: ["splitter"], n: 2 }], xp: W.xp, ticks: 1, stufe: 0, gruppe: "Waffe laden" });
  dazu({ id: `waffe_laden_${sel}_licht`, station: "bindestein", ergebnis: "ladung:" + AN_WAFFE, fuer: sel, level: W.level, zutaten: [{ g: ["splitter"], n: 1 }, { g: ["seelenlicht"], n: 1 }], xp: W.xp, ticks: 1, stufe: 0, gruppe: "Waffe laden" }); }
/* Entladen: nur am Bindestein, die Splitter verfallen */
/* Phase 6 (#17, #18): Federsiegel herstellen (zweiter Weg zum Thronsaal) und den Splitterkern in den Wegstein setzen (200 Ladungen, einmal) */
dazu({ id: "federsiegel", station: "bindestein", ergebnis: "federsiegel", level: 30, zutaten: [{ g: ["rabenfedern"], n: 25 }, { g: ["splitter"], n: 50 }], xp: 120, ticks: 6, stufe: 2, gruppe: "Siegel" });
dazu({ id: "splitterkern_einsetzen", station: "bindestein", ergebnis: "merker:splitterkern_wegstein", level: 1, zutaten: [{ g: ["splitterkern"], n: 1 }], xp: 50, ticks: 4, stufe: 2, gruppe: "Wegstein" });
dazu({ id: "waffe_entladen", station: "bindestein", ergebnis: "entladen:" + AN_WAFFE, level: 1, zutaten: [], xp: 0, ticks: 1, stufe: 0, gruppe: "Waffe laden" });
dazu({ id: "wegstein_laden_licht", station: "bindestein", ergebnis: "ladung:wegstein", level: 1, zutaten: [{ g: ["splitter"], n: 1 }, { g: ["seelenlicht"], n: 1 }], xp: 2, ticks: 1, stufe: 0, gruppe: "Wegstein" });
/* B1 „Der Wegstein“: Quellstein, Lindenspan und geweihter Splitter an der Werkbank zum ungeweihten Wegstein fügen (Handwerk 10) */
dazu({ id: "wegstein_ungeweiht", station: "werkbank", ergebnis: "wegstein_ungeweiht", level: 10, zutaten: [{ g: ["quellstein"], n: 1 }, { g: ["lindenspan"], n: 1 }, { g: ["geweihter_splitter"], n: 1 }], xp: 120, ticks: 4, stufe: 0, gruppe: "Auftrag von Agnes", quest: "weidenhain_der_wegstein" });

/* Phase 3b Kochen (doku/konzepte/phase-3.md, Tabelle „Kochen“): Fisch am Feuer, Brot im Backofen, Suppe im Kessel, Eintopf am Herd. Wasser schöpft man am Brunnen in einen Krug.
 * Anbrennen: Chance sinkt mit dem Kochen-Level über dem Rezept, ab +30 brennt nichts mehr. Garpunkt (der Moment wie die Glut): das Stück brennt sicher nicht an und gibt 50 % mehr XP. */
export const BRENN_GRUND = 0.35, BRENN_BIS = 30;
export const brennChance = (level: number, r: Rezept): number => (r.verbrannt ? Math.max(0, BRENN_GRUND * (1 - (level - r.level) / BRENN_BIS)) : 0);
const fisch = (f: string, level: number, xp: number, name: string) => dazu({ id: `fisch_${f}_gebraten`, station: "feuer", ergebnis: `fisch_${f}_gebraten`, level, zutaten: [{ g: [`fisch_${f}_roh`], n: 1 }], xp, ticks: 4, stufe: 0, gruppe: name, verbrannt: `fisch_${f}_verbrannt` });
fisch("bachling", 1, 30, "Fisch");
fisch("muehlbarsch", 10, 50, "Fisch");
fisch("moorhecht", 20, 80, "Fisch");
dazu({ id: "krug_wasser", station: "brunnen", ergebnis: "krug_wasser", level: 1, zutaten: [{ g: ["krug"], n: 1 }], xp: 0, ticks: 2, stufe: 0, gruppe: "Wasser" });
dazu({ id: "brot_backen", station: "backofen", ergebnis: "brot", level: 1, zutaten: [{ g: ["mehl"], n: 1 }, { g: ["krug_wasser"], n: 1 }], xp: 25, ticks: 5, stufe: 0, gruppe: "Brot", verbrannt: "brot_verbrannt" });
dazu({ id: "fischsuppe", station: "kessel", ergebnis: "fischsuppe", level: 15, zutaten: [{ g: ["fisch_muehlbarsch_roh"], n: 1 }, { g: ["krug_wasser"], n: 1 }], xp: 70, ticks: 5, stufe: 0, gruppe: "Suppe", verbrannt: "suppe_verbrannt" });
dazu({ id: "bauerneintopf", station: "herd", ergebnis: "bauerneintopf", level: 25, zutaten: [{ g: ["kuhfleisch"], n: 1 }, { g: ["mehl"], n: 1 }, { g: ["krug_wasser"], n: 1 }], xp: 100, ticks: 6, stufe: 0, gruppe: "Eintopf", verbrannt: "suppe_verbrannt" });
/* Fischen: Angelrute (Handwerk 1) und Reuse (Handwerk 20) an der Werkbank */
dazu({ id: "angelrute", station: "werkbank", ergebnis: "angelrute", level: 1, zutaten: [{ g: ["stamm_eiche"], n: 1 }, { g: ["garn"], n: 1 }], xp: 20, ticks: 3, stufe: 0, gruppe: "Fischen" });
dazu({ id: "reuse", station: "werkbank", ergebnis: "reuse", level: 20, zutaten: [{ g: ["stamm_tanne"], n: 2 }, { g: ["garn"], n: 3 }], xp: 70, ticks: 5, stufe: 0, gruppe: "Fischen" });

/* Phase 3c B2 „Wasser auf die Mühle“ (shared/quest_b2.ts): Quest-Rezepte – Schütztafeln und Hanftau an der Werkbank, Eisenbänder am Amboss (1 Barren → 2 Bänder) */
const B2 = "weidenhain_wasser_auf_die_muehle";
dazu({ id: "schuetztafel", station: "werkbank", ergebnis: "schuetztafel", level: 15, zutaten: [{ g: ["stamm_tanne"], n: 2 }], xp: 50, ticks: 4, stufe: 0, gruppe: "Auftrag des Müllers", quest: B2 });
dazu({ id: "eisenbaender", station: "amboss", ergebnis: "eisenband", menge: 2, level: 10, zutaten: [{ g: ["barren_eisen"], n: 1 }], xp: 35, ticks: 4, stufe: 0, gruppe: "Auftrag des Müllers", quest: B2 });
dazu({ id: "hanftau", station: "werkbank", ergebnis: "hanftau", level: 15, zutaten: [{ g: ["garn"], n: 4 }], xp: 30, ticks: 4, stufe: 0, gruppe: "Auftrag des Müllers", quest: B2 });
/* Werkstatt Weidenhain in Tebbes Schuppen: erst nach B2 (Schalter werkstatt_weidenhain); Esse und Amboss folgen, sobald die Welt sie aufstellt (#64) */
WERKSTAETTEN.push({ id: "werkbank_weidenhain", station: "werkbank", x: 6447, y: 6671.5, ort: "weidenhain", schalter: "werkstatt_weidenhain", gesperrt: "Tebbes Werkbank. Er lässt erst jemanden ran, wenn das Wehr wieder hält." });
