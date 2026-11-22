/*
 * World Pipeline – legt die Waldmark als Dorf auf einer Waldlichtung an und südlich davon den Kreuzwald (Region „waldweg“: Steinwege, Feldweg, Lichtung).
 * Aufruf (im Ordner realtime): node werkzeug/welt/waldmark.mjs      danach: node werkzeug/welt/bauen.mjs waldmark waldweg
 * Schreibt welt/regionen/waldmark/ und welt/regionen/waldweg/. Beide grenzen im Weltgitter aneinander:
 * Durch das offene Tor im Süden läuft man ohne Wechsel in den Kreuzwald.
 * Die Gebäude stammen aus werkzeug/welt/haus.py. Alles hier ist ein erster Entwurf zum Ansehen und Nachbessern (später im Editor).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";
import { readFileSync } from "node:fs";
const BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
/** Bildrechteck eines Objekts in Rechenfeldern [x0, y0, x1, y1] (Fußpunkt x, y) */
const bildRahmen = (id, x, y, sp, s = 1) => { const o = BIB.get(id);
  if (o.sichtbar) { const fx = o.anker[0] * o.groesse[0], fy = o.anker[1] * o.groesse[1]; return [x + (o.sichtbar[0] - fx) * s / 48, y + (o.sichtbar[1] - fy) * s / 48, x + (o.sichtbar[2] - fx) * s / 48, y + (o.sichtbar[3] - fy) * s / 48]; }
  const b = o.groesse[0] * o.massstab * s / 48, h = o.groesse[1] * o.massstab * s / 48, ax = sp ? 1 - o.anker[0] : o.anker[0]; return [x - ax * b, y - o.anker[1] * h, x + (1 - ax) * b, y + (1 - o.anker[1]) * h]; };
const schnitt = (a, b) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
/** Was frei zu sehen sein soll: Bildflächen von Gebäuden, Bauteilen, Kleinteilen und Figuren (Waldmark-Koordinaten) */
const SICHT = [];
/** Darf ein Baum hier stehen, ohne etwas Wichtiges zu verdecken? dy: Versatz der Region gegenüber der Waldmark */
const sichtFrei = (p, dy = 0, dx = 0) => { const t = bildRahmen(p.objekt, p.x + dx, p.y + dy, p.spiegeln, p.s);
  return !SICHT.some((v) => p.y + dy > v.y - 0.1 && schnitt(t, v.r) > 0.1 * (v.r[2] - v.r[0]) * (v.r[3] - v.r[1])); };
/** Türpunkt eines Objekts aus der Bibliothek */
const tuerVon = (id, x, y, sp) => { const a = BIB.get(id).interaktion; return a ? [+(x + a.dx * (sp ? -1 : 1)).toFixed(2), +(y + a.dy).toFixed(2)] : [x, y]; };
/* Vor der Palisade bleibt ein Streifen ohne Bäume, damit Tor und Zaun zu sehen sind. Sein Rand ist unregelmäßig und läuft über die Regionsgrenze
   hinweg: Lage in Rechenfeldern der Waldmark (y ab dort gezählt, der Waldweg beginnt bei y = 64). */
const ZAUN_Y = 57, vorfeldTiefe = (x) => 10.2 + 1.7 * Math.sin(x / 4.3 + 0.7) + 1.1 * Math.sin(x / 1.9 + 2.1) + 0.8 * Math.sin(x / 9.7);
const vorfeldX = (y) => [12.5 + 2.4 * Math.sin(y / 2.3) + 1.2 * Math.sin(y / 0.9), 83.5 + 2.4 * Math.cos(y / 2.1) - 1.1 * Math.sin(y / 1.1)];
const imVorfeld = (x, y, rand = 0) => { const [a, b] = vorfeldX(y); return y >= ZAUN_Y - 0.5 && y < ZAUN_Y + vorfeldTiefe(x) - rand && x > a + rand && x < b - rand; };
const BAUM = [null, "stil_eiche_01", "stil_eiche_02", "stil_tanne_01", "stil_herbst_01", "stil_tanne_02", "stil_linde_01"];   /* Bäume im Spielstil (werkzeug/welt/baum.py) statt der alten Waldbäume */
let saat = 21; const wurf = () => (saat = (saat * 1103515245 + 12345) % 2147483648) / 2147483648;
const schreibe = (name, region, g, objekte, spiel) => { const o = join(WELT, "regionen", name); mkdirSync(o, { recursive: true });
  writeFileSync(join(o, "region.json"), JSON.stringify(region, null, 1) + "\n"); writeFileSync(join(o, "gelaende.txt"), g.map((z) => z.join("")).join("\n") + "\n");
  writeFileSync(join(o, "objekte.json"), "[\n" + objekte.map((p) => " " + JSON.stringify(p)).join(",\n") + "\n]\n"); writeFileSync(join(o, "spiel.json"), JSON.stringify(spiel, null, 1) + "\n");
  console.log(`${name}: ${g[0].length} × ${g.length} Felder, ${objekte.length} Objekte, ${spiel.figuren.length} Figuren`); };
const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };
/** Bäume streuen: dicht, wo `wald` wahr ist, mit Mindestabstand; nie, wo `tabu` wahr ist */
function baeume(B, H, wald, tabu, dichte, licht = 0, passt = () => true) { /* wald: wahr/falsch oder eine Dichte zwischen 0 und 1; passt: letzte Prüfung des fertigen Baums */ const aus = [], gitter = new Map(), zelle = (x, y) => Math.floor(x / 3) + 4096 * Math.floor(y / 3);
  const frei = (x, y, ab) => { for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) for (const p of gitter.get(zelle(x + di * 3, y + dj * 3)) || []) if (Math.hypot(p.x - x, p.y - y) < ab) return false; return true; };
  for (let n = 0; n < B * H * dichte; n++) { const x = +(wurf() * B).toFixed(2), y = +(wurf() * H).toFixed(2), wv = wald(x, y), w = wv === true || wv >= 0.6;
    if (tabu(x, y) || (typeof wv === "number" ? wurf() > Math.max(wv, licht) : (!w && wurf() > licht)) || !frei(x, y, w ? 2.3 : 4.2)) continue;
    const z = wurf(), art = z < 0.26 ? 1 : z < 0.5 ? 2 : z < 0.74 ? 3 : z < 0.8 ? 4 : z < 0.9 ? 5 : 6, p = { id: "b" + String(aus.length + 1).padStart(4, "0"), objekt: BAUM[art], x, y, s: +(0.85 + wurf() * 0.27).toFixed(2) };
    if (wurf() < 0.5) p.spiegeln = true; if (!passt(p)) continue; aus.push(p); const k = zelle(x, y); gitter.set(k, [...(gitter.get(k) || []), p]); }
  return aus; }

/* ───────────── Waldmark: 3 × 2 Chunks ───────────── */
{ const B = 96, H = 64, MX = 48, MY = 31, ZAUN = 56, TOR = 48;
  /* Die Lichtung: ein runder Rand mit Buchten und Vorsprüngen. q < 1 heißt drinnen; q zwischen 1 und 1,12 ist der lichte Waldrand. */
  const lq = (x, y) => { const dx = (x - MX) / 33, dy = (y - MY) / 24.5, w = Math.atan2(dy, dx), p = 2.9;
    return Math.pow(Math.pow(Math.abs(dx), p) + Math.pow(Math.abs(dy), p), 1 / p) / (1 + 0.06 * Math.sin(3 * w + 1.3) + 0.045 * Math.sin(5 * w + 0.4) + 0.025 * Math.sin(11 * w + 2.2)); };
  const lichtung = (x, y) => lq(x, y) < 1 && y < ZAUN;
  const wege = [[[TOR, 38], [TOR, 64]], [[42, 32], [33, 31], [26, 32]], [[54, 32], [63, 31], [70, 32]], [[48, 26], [48, 21]], [[40, 36], [37, 44]], [[55, 36], [60, 46]]];
  const teich = (x, y) => Math.hypot((x - 71) / 4.6, (y - 46) / 3.2) < 1;
  const g = []; for (let y = 0; y < H; y++) { const z = []; for (let x = 0; x < B; x++) { const cx = x + 0.5, cy = y + 0.5;
    const platz = Math.hypot(cx - MX, cy - 32) < 6.6, weg = wege.some((p) => strecke(cx, cy, p) < 1.5), blume = Math.sin(x / 4.1) * Math.cos(y / 3.3) + Math.sin((x + y) / 6) > 1.25;
    /* vor der Palisade Wiese; der Waldboden beginnt etwas vor den ersten Bäumen */
    const vorfeld = cy >= ZAUN && imVorfeld(cx, cy, 1.6);
    z.push(platz ? "p" : weg ? "e" : vorfeld ? "." : !lichtung(cx, cy) ? "f" : teich(cx, cy) ? "w" : blume ? "," : "."); } g.push(z); }
  const FIGUREN = [{ id: "wache_west", rolle: "wache", figur: "wache", x: 45.2, y: 58.6 }, { id: "wache_ost", rolle: "wache", figur: "wache", x: 50.8, y: 58.6, links: true }, { id: "schmied", rolle: "haendler", figur: "schmied", x: 61.5, y: 31.4 },
      { id: "kraemer", rolle: "haendler", figur: "kraemer", x: 39.2, y: 39.9 }, { id: "kraeuterfrau", rolle: "haendler", figur: "kraeuterfrau", x: 43.6, y: 42.9 }, { id: "ausrufer", rolle: "npc", figur: "ausrufer", x: 52.6, y: 35.2, links: true },
      { id: "junge", rolle: "npc", figur: "junge", x: 44.2, y: 29.4 }, { id: "wanderer", rolle: "npc", figur: "wanderer", x: 33.2, y: 31.4 }];
  /* Gebäude: Fußpunkt (Mitte der Vorderwand unten) */
  const bauten = [["heldenhalle", "dorf_heldenhalle_01", 48, 20.4], ["taverne", "dorf_taverne_01", 28, 30.2], ["schmiede", "dorf_schmiede_01", 68.5, 30.2],
    ["haus_nw", "dorf_haus_holz_01", 33, 17.5], ["haus_no", "dorf_haus_holz_02", 64, 17.5], ["huette_sw", "dorf_huette_holz_01", 25, 44], ["haus_s", "dorf_haus_holz_03", 36.5, 50],
    ["scheune", "dorf_scheune_holz_01", 78, 39], ["schuppen", "dorf_schuppen_holz_01", 62, 50.5], ["huette_o", "dorf_huette_holz_02", 76.5, 23],
    /* neu: Wachtürme am Tor, Kapelle mit Glockenturm, Kräuterhaus mit Erker, Bäckerei mit Ofenanbau */
    ["wachturm_w", "dorf_wachturm_01", 40.0, 54.6], ["wachturm_o", "dorf_wachturm_01", 54.5, 54.6], ["kapelle", "dorf_kapelle_01", 57, 22],
    ["kraeuterhaus", "dorf_kraeuterhaus_01", 19.5, 39], ["baeckerei", "dorf_baeckerei_01", 55, 49.5],
    /* Nias Salon (22.11.2026): an der Nordostecke des Marktplatzes zwischen Kapelle und Schmiede, die Tür zur Dorfstraße */
    ["salon", "waldmark_salon_01", 59, 28.2],
    /* Rathaus (22.11.2026): zweistöckig, an der Westseite des Marktplatzes zwischen Taverne und Heldenhalle, Glockenturm hinten links */
    ["rathaus", "waldmark_rathaus_01", 39, 27.4],
    ["stand_1", "dorf_marktstand_01", 39.2, 38.6], ["stand_2", "dorf_marktstand_02", 43.6, 41.6], ["stand_3", "dorf_marktstand_03", 56, 40.4], ["brunnen", "dorf_brunnen_01", 48, 32.8]];
  const objekte = bauten.map(([id, objekt, x, y, sp]) => ({ id, objekt, x, y, ...(sp ? { spiegeln: true } : {}) }));
  for (let x = 17; x <= 79; x += 2) if (Math.abs(x - TOR) > 4) objekte.push({ id: "zaun_" + x, objekt: wurf() < 0.5 ? "dorf_palisade_01" : "dorf_palisade_02", x, y: ZAUN + 1 });
  objekte.push({ id: "tor", objekt: "dorf_tor_01", x: TOR, y: ZAUN + 1.05 });
  /* Kleinigkeiten an den Häusern: neben den Türen, nie davor */
  const details = [["taverne_fass_1", "dorf_fass_01", 24.6, 30.8], ["taverne_fass_2", "dorf_fass_01", 25.4, 31.3], ["taverne_bank", "dorf_bank_01", 31.6, 30.9],
    ["kraeuter_fass", "dorf_fass_01", 17.0, 39.5], ["kraeuter_kiste", "dorf_kiste_01", 21.6, 39.6], ["baecker_holz", "dorf_holzstapel_01", 51.3, 49.9], ["baecker_kiste", "dorf_kiste_01", 58.3, 49.6],
    ["schmiede_holz", "dorf_holzstapel_01", 74.4, 30.7], ["schmiede_kiste", "dorf_kiste_01", 72.6, 31.3],
    ["halle_laterne_w", "dorf_laterne_01", 45.4, 21.1], ["halle_laterne_o", "dorf_laterne_01", 50.6, 21.1],
    ["haus_nw_holz", "dorf_holzstapel_01", 36.7, 17.9], ["haus_nw_fass", "dorf_fass_01", 30.0, 18.0],
    ["haus_no_fass", "dorf_fass_01", 68.1, 17.9], ["haus_no_bank", "dorf_bank_01", 61.6, 18.1],
    ["huette_sw_holz", "dorf_holzstapel_01", 28.0, 44.4], ["haus_s_fass", "dorf_fass_01", 33.6, 50.4],
    ["scheune_heu_1", "dorf_heuballen_01", 74.4, 39.5], ["scheune_heu_2", "dorf_heuballen_01", 74.0, 40.8], ["scheune_kiste", "dorf_kiste_01", 81.4, 39.4],
    ["schuppen_holz", "dorf_holzstapel_01", 64.6, 50.8], ["huette_o_fass", "dorf_fass_01", 73.9, 23.4],
    ["salon_fass", "dorf_fass_01", 55.6, 28.6], ["salon_laterne", "dorf_laterne_01", 61.9, 28.9],
    ["markt_kiste_1", "dorf_kiste_01", 41.4, 38.7], ["markt_kiste_2", "dorf_kiste_01", 58.6, 40.7], ["markt_fass", "dorf_fass_01", 36.8, 38.9]];
  objekte.push(...details.map(([id, objekt, x, y]) => ({ id, objekt, x, y })));
  const nahBau = (x, y) => bauten.some(([, , bx, by]) => Math.abs(x - bx) < 6.5 && y > by - 7 && y < by + 3.5);
  const amWeg = (x, y) => wege.some((p) => strecke(x, y, p) < 3.2) || Math.hypot(x - MX, y - 32) < 9.5;
  /* Dichte: tief im Wald dicht, am Waldrand lückig, in der Lichtung nur am Rand vereinzelt */
  const wald = (x, y) => { if (y >= ZAUN - 0.5) return 1; const q = lq(x, y); return q >= 1.12 ? 1 : q >= 1 ? 0.5 : q >= 0.9 ? 0.07 : 0; };
  /* Sicht: Vor einem Gebäude, dem Tor oder einem Stand steht kein Baum, dessen Krone es verdecken würde (Krone gut 4 Felder breit, bis 10 hoch) */
  for (const o of objekte) SICHT.push({ y: o.y, r: bildRahmen(o.objekt, o.x, o.y, o.spiegeln) });
  for (const f of FIGUREN) SICHT.push({ y: f.y, r: [f.x - 0.5, f.y - 1.9, f.x + 0.5, f.y] });
  objekte.push(...baeume(B, H, wald, (x, y) => amWeg(x, y) || nahBau(x, y) || Math.hypot((x - 71) / 6.5, (y - 46) / 5) < 1 || (y > ZAUN - 6 && y < ZAUN && x > 15 && x < 81) || imVorfeld(x, y), 0.95, 0, (p) => sichtFrei(p)));
  objekte.sort((a, b) => a.y - b.y);
  /* tat: was das Spiel dort öffnet (halle = Heldenhalle, welt = Weltkarte, bald = kommt noch); ohne tat zeigt der Knopf den Text */
  const lies = (id, x, y, text, objekt, tat, knopf) => ({ id, art: tat && tat !== "bald" ? "eingang" : "lesen", x, y, radius: 1.5, ...(objekt ? { objekt } : {}), abgleich: "keiner", daten: { text, ...(tat ? { tat, knopf } : {}) } });
  const spiel = { start: [[48, 37.5], [46.8, 38.5], [49.2, 38.5]],
    figuren: FIGUREN,
    spawnzonen: [],
    interaktionen: [lies("brunnen_ansehen", 48, 34.6, "Der Brunnen der Waldmark. Das Wasser kommt kalt und klar aus dem Waldboden.", "brunnen"),
      lies("halle_tuer", ...tuerVon("dorf_heldenhalle_01", 48, 20.4), "Die Heldenhalle. Hier sammeln sich die Wanderer, bevor sie aufbrechen.", "heldenhalle", "halle", "Die Heldenhalle betreten"),
      lies("taverne_tuer", ...tuerVon("dorf_taverne_01", 28, 30.2), "Die Taverne. Drinnen riecht es nach Eintopf und Rauch.", "taverne", "bald", "Taverne – kommt noch"),
      lies("schmiede_tuer", ...tuerVon("dorf_schmiede_01", 68.5, 30.2), "Die Schmiede. In der Esse glüht es Tag und Nacht.", "schmiede"),
      lies("kapelle_tuer", ...tuerVon("dorf_kapelle_01", 57, 22), "Die Kapelle der Waldmark. Die Glocke ruft, wenn Wanderer heimkehren.", "kapelle"),
      lies("kraeuter_tuer", ...tuerVon("dorf_kraeuterhaus_01", 19.5, 39), "Das Kräuterhaus. Unter dem Strohdach trocknen Bündel von Salbei und Wermut.", "kraeuterhaus"),
      lies("salon_tuer", ...tuerVon("waldmark_salon_01", 59, 28.2), "Nias Salon. Hinter violettem Glas funkeln Fläschchen, Kämme und ein Spiegel mit goldenem Rahmen. Hier verändert die Wandlerin gegen Gold Frisur, Haarfarbe, Bart und Gesichtszüge – Werte, Klasse und Fortschritt bleiben unberührt.", "salon", "bald", "Nias Salon – öffnet bald"),
      lies("rathaus_tuer", ...tuerVon("waldmark_rathaus_01", 39, 27.4), "Das Rathaus der Waldmark. Unten hängen Aushänge, Steckbriefe und die Liste der Wanderer; oben tagt der Dorfrat. Vom Glockenturm sieht man bis zum Kreuzwald.", "rathaus", "bald", "Rathaus – kommt noch"),
      lies("baecker_tuer", ...tuerVon("dorf_baeckerei_01", 55, 49.5), "Die Bäckerei. Aus dem Ofenanbau zieht der Duft von frischem Brot.", "baeckerei"), lies("markt", 41.4, 40.6, "Der Markt der Waldmark: Kräuter, Brot und allerlei Nützliches.", undefined, "bald", "Markt – kommt noch")],
    ausgaenge: [],
    /* Torpfosten versperren, die Durchfahrt bleibt frei – ohne Knopf: man läuft einfach hindurch */
    kollision: { sperren: [{ art: "rechteck", x0: 44, y0: 56, x1: 45.6, y1: 57 }, { art: "rechteck", x0: 50.4, y0: 56, x1: 52, y1: 57 }], freigeben: [{ art: "rechteck", x0: 45.6, y0: 55, x1: 50.4, y1: 58 }] } };
  schreibe("waldmark", { id: "waldmark", name: "Waldmark", untertitel: "Die Zuflucht der Wanderer", ursprung: [200, 200], chunks: [3, 2], biom: "dorf", stufe: 1, gesperrt: [[14, 6, 82, 58]] }, g, objekte, spiel); }

/* ───────────── Der Wald südlich der Waldmark: 8 × 6 Chunks, ein Gebiet (für den Server ein Ort: „waldweg“) ─────────────
   Nach der Skizze vom 21.11.2026: Vom Südtor ein Erdweg zur Kreuzung. Dort breite Steinwege nach Westen und Osten, ein breiter Feldweg nach Süden.
   Vom östlichen Steinweg ein Pfad hinunter, vom Feldweg einer nach rechts: Beide treffen sich auf einer großen Lichtung. Ringsum Wald.
   Wo die drei Wege (noch) enden, liegt ein umgestürzter Baum quer. Lage: x ab Chunk 198 (das Südtor liegt bei x = 112), y = 0 ist die Südkante der Waldmark. */
saat = 1170455552;   /* fester Zufall für den Kreuzwald: Änderungen in der Waldmark verschieben seine Bäume nicht */
{ const B = 256, H = 192, DX = 64, TOR = 112, KY = 44;                       /* DX: so weit liegt die Waldmark (x = 0) östlich des Gebiets; KY: Höhe der Kreuzung */
  const torWegX = (y) => TOR + 1.6 * Math.sin(y / 9) * Math.min(1, y / 12);   /* vom Tor zur Kreuzung, sacht geschwungen */
  const steinY = (x) => KY + 2.6 * Math.sin((x - TOR) / 21) + 1.3 * Math.sin((x - TOR) / 8.3) * Math.min(1, Math.abs(x - TOR) / 14);
  const WEST = -4, OST = 260,   /* seit 21.11.2026 auch nach Osten durchgehend (Osthang, Graufurt) */   /* der Westweg läuft seit 21.11.2026 weiter nach Westen (Westmark) */ feldX = (y) => TOR + 6 * Math.sin((y - KY) / 23) + 2 * Math.sin((y - KY) / 7.9) * Math.min(1, (y - KY) / 14), SUED = 176;   /* bis hier ging der Feldweg zuerst (dort lag ein umgestürzter Baum); jetzt führt er weiter nach Weidenhain */
  const L = { x: 214, y: 120, rx: 25, ry: 19 }, lichtR = (x, y) => { const t = Math.atan2((y - L.y) / L.ry, (x - L.x) / L.rx); return Math.hypot((x - L.x) / L.rx, (y - L.y) / L.ry) / (1 + 0.1 * Math.sin(3 * t + 0.6) + 0.06 * Math.sin(7 * t + 2) + 0.04 * Math.sin(11 * t)); };
  const pfadOben = [[202, steinY(202)], [200.5, 62], [205, 80], [209, L.y - L.ry + 3]], pfadUnten = [[feldX(128), 128], [140, 130], [162, 126], [178, 124.5], [L.x - L.rx + 3, 122]];
  /* Abstand zu den Wegen (Mittellinie), in Feldern */
  const dTor = (x, y) => (y <= KY + 1 ? Math.abs(x - torWegX(y)) : Infinity);
  const dStein = (x, y) => (x >= WEST - 2 && x <= OST + 2 ? Math.abs(y - steinY(x)) : Infinity);
  const dFeld = (x, y) => (y >= KY ? Math.abs(x - feldX(y)) : Infinity);   /* seit dem 21.11.2026 bis an den Südrand: weiter nach Weidenhain */
  /* Waldweg nach Westen (Skizze 21.11.2026): vom Feldweg durch den Wald hinüber in die Westmark, mit einer Senke in der Mitte */
  const pfadWest = [[feldX(108), 108], [100, 110], [86, 114], [70, 119], [52, 113], [30, 104], [12, 103], [-1, 104]];
  const pfadOsthof = [[180, steinY(180) - 2], [178.5, 24], [180.5, 10], [180, -1]], pfadKoehler = [[24, steinY(24) - 2], [22.5, 24], [24, -1]];   /* nach Norden: zum Osthof und zur Köhlerlichtung im Nordwald */
  const dPfad = (x, y) => Math.min(strecke(x, y, pfadOben), strecke(x, y, pfadUnten), strecke(x, y, pfadWest) * 0.9, strecke(x, y, pfadOsthof) * 0.85, strecke(x, y, pfadKoehler));
  const saum = (x, y) => 1.2 * Math.sin(x / 3.1 + y / 5.3) + 0.8 * Math.sin(y / 2.2 - x / 4.7);   /* unruhiger Rand der Wegsäume */
  const g = []; for (let y = 0; y < H; y++) { const z = []; for (let x = 0; x < B; x++) { const cx = x + 0.5, cy = y + 0.5, st = Math.min(dTor(cx, cy), dStein(cx, cy)), fe = dFeld(cx, cy), pf = dPfad(cx, cy), li = lichtR(cx, cy);
    let c = "f";
    if (dStein(cx, cy) < 3.1) c = "k"; else if (dTor(cx, cy) < 1.6 || fe < 2.1) c = "e"; else if (pf < 1.25) c = "e";   /* vom Tor ein Erdweg wie im Dorf, ab der Kreuzung Steinwege */
    else if (li < 1) c = li < 0.62 && Math.sin(cx / 2.7) * Math.cos(cy / 3.1) > 0.35 ? "," : ".";
    else if (st < 5.6 + saum(cx, cy) || fe < 4.6 + saum(cx, cy) || pf < 2.4 + 0.5 * saum(cx, cy)) c = ".";
    else if (imVorfeld(cx - DX, cy + 64, 1.6)) c = ".";                          /* das Vorfeld des Dorfs läuft hier aus */
    z.push(c); } g.push(z); }
  /* Umgestürzte Bäume an den Wegenden (vorerst geht es dort nicht weiter): auf den Steinwegen ein Stamm, der in die Tiefe liegt (quer zum Weg), auf dem Feldweg einer quer */
  const stamm = (id, objekt, x, y, spiegeln) => ({ id, objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...(spiegeln ? { spiegeln: true } : {}) });
  const ende = [];
  const amStamm = (x, y) => ende.some((e) => (e.objekt === "wald_baumstamm_02" ? Math.abs(x - e.x) < 3.2 && y > e.y - 10.5 && y < e.y + 2.5 : Math.abs(x - e.x) < 6.5 && y > e.y - 4.5 && y < e.y + 1.5));
  const frei = (x, y) => Math.min(dTor(x, y), dStein(x, y)) < 5 || dFeld(x, y) < 4 || dPfad(x, y) < 2.6 || lichtR(x, y) < 1.12 || imVorfeld(x - DX, y + 64) || amStamm(x, y);
  const wald = baeume(B, H, (x, y) => g[Math.min(H - 1, Math.floor(y))][Math.min(B - 1, Math.floor(x))] === "f", frei, 0.95, 0.02, (p) => sichtFrei(p, 64, -DX));
  /* ein paar einzelne Bäume auf der Lichtung und am Saum, damit sie natürlich wirkt */
  const einzeln = [[200, 112, 3], [229, 129, 1], [221, 106, 5], [196, 128, 2]].map(([x, y, a], i) => ({ id: "l" + (i + 1), objekt: BAUM[a], x, y, s: 1.05 }));
  const objekte = [...wald, ...einzeln, ...ende].sort((a, b) => a.y - b.y);
  const lies = (id, x, y, text) => ({ id, art: "lesen", x, y, radius: 1.8, abgleich: "keiner", daten: { text } });
  const versperrt = "Ein umgestürzter Baum versperrt den Weg. Hier geht es noch nicht weiter.";
  /* Der Stamm allein hält niemanden auf: Durch den Wald käme man drumherum. Darum läuft von jedem Stamm eine unsichtbare Sperre durch den Wald bis an den Rand
     des Gebiets (im Osten oberhalb der Lichtung, damit sie frei bleibt). Was dahinter liegt, ist für später. */
  const riegel = [];
  const spiel = { start: [[TOR, 2.5], [TOR - 1, 1.5], [TOR + 1, 1.5]], figuren: [], spawnzonen: [],
    interaktionen: [
      lies("lichtung_ansehen", L.x - 4, L.y + 2, "Eine weite, stille Lichtung mitten im Wald. Das Gras steht hoch, dazwischen blühen Wildblumen.")],
    ausgaenge: [], kollision: { sperren: riegel, freigeben: [] } };
  schreibe("waldweg", { id: "waldweg", name: "Der Kreuzwald", untertitel: "Steinwege nach Westen und Osten, der Feldweg nach Weidenhain", ursprung: [198, 202], chunks: [8, 6], biom: "wald", stufe: 1 }, g, objekte, spiel); }
