/*
 * World Pipeline – Weidenhain als Region der offenen Welt, nachgebaut nach dem gemalten Dorf der Kampagne (img/echtzeit/weidenhain.webp)
 * und zu einem dicht besiedelten Dorf erweitert (dichter als die Waldmark):
 *   Kern wie im Gemälde: gepflasterter Platz mit Erntefeuer und Bänken, Kornspeicher, Fachwerk-Bauernhaus, Stände, Linde im Steinring,
 *   Wassermühle mit Mühlrad, Mühlgraben mit Wehr und Zaun.
 *   Drumherum Gassen mit Häuserreihen: Nordwesten, Westen, an der Dorfstraße im Norden, ein Viertel östlich des Grabens (über eine Holzbrücke)
 *   und eines südlich davon (über eine zweite Brücke). Ringsum Wald. Bei Tag statt bei Nacht.
 *
 * Lage: 4 × 3 Chunks ab Chunk 200|208, direkt südlich des Kreuzwalds. Der Feldweg des Kreuzwalds führt bei x ≈ 48 geradewegs ins Dorf. Der Spielserver kennt den Ort „weidenhain“ schon.
 *
 * Aufruf (im Ordner realtime): node werkzeug/welt/weidenhain.mjs      danach: node werkzeug/welt/bauen.mjs weidenhain
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";

const B = 128, H = 96;
let saat = 77; const wurf = () => (saat = (saat * 1103515245 + 12345) % 2147483648) / 2147483648;
const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };
const rand = (x, y) => 1 + 0.07 * Math.sin(x / 3.3 + y / 4.1) + 0.05 * Math.sin(y / 2.1 - x / 5.7);   /* unruhige Ränder */
const BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const PLAN = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "bauplaene.json"), "utf8")).bauplaene.map((p) => [p.id, p]));

/* ───── Plan (Felder; x nach Osten, y nach Süden) ───── */
const SAUM = (x, y) => 4.5 + 1.6 * Math.sin(x / 5.3 + y / 7.1) + 1.1 * Math.sin(y / 3.7 - x / 4.3);   /* Waldsaum ringsum */
const imDorf = (x, y) => { const s = SAUM(x, y); return x > s && y > s && x < B - s && y < H - s; };
const PLATZ = { x: 42, y: 30, rx: 14.5, ry: 9.5 };                   /* gepflastert */
const aufPlatz = (x, y) => Math.hypot((x - PLATZ.x) / PLATZ.rx, (y - PLATZ.y) / PLATZ.ry) < rand(x * 1.7, y * 1.3);
/* Mühlgraben: von Norden östlich der Mühle herab, unter dem Mühlrad nach Westen, am Wehr vorbei nach Süden, dann am Platz entlang nach Westen und hinaus nach Süden */
const GRABEN = [[67.5, -1], [67.5, 31], [66, 33.4], [62.8, 33.6], [62.8, 45.5], [60, 48.5], [27, 48.5], [24.5, 51], [24.5, H + 1]];
const imGraben = (x, y) => strecke(x, y, GRABEN) < 1.55 + 0.12 * Math.sin(x / 2.3 + y / 3.1);
const nahGraben = (x, y, r) => strecke(x, y, GRABEN) < r;
const WEG_NORD = [[48.8, -1], [47.6, 5], [46.5, 10], [44.5, 21.5]];   /* oben trifft der Feldweg des Kreuzwalds (x ≈ 48,8) */               /* die Dorfstraße: der Feldweg aus dem Kreuzwald */
const PFADE = [[[55, 31], [58.5, 33.4], [60.4, 33.2]], [[31.5, 37.5], [31.6, 46], [27.9, 46.1]], [[31, 22.4], [30.6, 21]]];
/* Gassen (je eine Häuserreihe steht nördlich davon, die Türen zur Gasse) */
const GASSEN = {
  nordwest: [[46.5, 12.5], [30, 12.8], [9, 12.4]],
  nordost: [[46.5, 12.5], [58, 12.6], [64.6, 12.5]],
  ost1: [[70.4, 12.5], [86, 12.8], [104, 12.4], [120, 12.6]],
  west1: [[28, 27], [18, 26.4], [6.5, 26.8]],
  west2: [[30.5, 37.4], [20, 40], [6.5, 40]],
  ostquer: [[96, 12.5], [96.5, 30], [96, 46], [96.4, 66]],
  ost2: [[71, 29.5], [96.5, 29.5], [121, 29.8]],
  ost3: [[66.5, 45.6], [96, 46], [121, 45.6]],
  sued: [[44, 51.2], [44.5, 66], [44, 82.5]],
  sued1: [[28.5, 66.5], [44.5, 66], [64, 66.4], [84, 66], [110, 66.6]],
  sued2: [[29.5, 82.5], [44, 82], [62, 82.4]] };
/** Eine Gasse sanft schwingen lassen: dicht abgetastet, quer zur Richtung versetzt; an beiden Enden ohne Versatz (Kreuzungen und Brücken bleiben, wo sie sind) */
const kurve = (p, amp, welle, ph) => { const aus = []; let s = 0, L = 0; for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
  for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], l = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / l, ny = (x1 - x0) / l;
    for (let k = i === 1 ? 0 : 1; k <= Math.ceil(l); k++) { const t = k / Math.ceil(l), ss = s + t * l, f = Math.sin(Math.PI * Math.min(1, ss / L)) ** 0.6, v = amp * f * (Math.sin(ss / welle + ph) + 0.4 * Math.sin(ss / (welle * 0.43) + ph * 2));
      aus.push([+(x0 + (x1 - x0) * t + nx * v).toFixed(2), +(y0 + (y1 - y0) * t + ny * v).toFixed(2)]); } s += l; }
  return aus; };
{ let ph = 0.7; for (const k of Object.keys(GASSEN)) { GASSEN[k] = kurve(GASSEN[k], k.startsWith("ost") && k !== "ostquer" ? 1.1 : 1.4, 7.5, ph); ph += 1.9; } }
const inGasse = (x, y, r) => Object.values(GASSEN).some((p) => strecke(x, y, p) < r);
/* Brücken: Fuß = Südkante, Mitte. quer: 6 × 2,6 Felder, laengs: 2,6 × 5 Felder */
const BRUECKEN = [{ objekt: "dorf_bruecke_01", x: 67.5, y: 13.8, frei: [64.5, 11.2, 70.5, 13.8] }, { objekt: "dorf_bruecke_02", x: 44, y: 51.2, frei: [42.7, 46.2, 45.3, 51.2] }];
const aufBruecke = (x, y) => BRUECKEN.some((b) => x >= b.frei[0] && x <= b.frei[2] && y >= b.frei[1] && y <= b.frei[3]);

/* ───── Häuserreihen: [Gasse, Lage der Fußpunkte entlang der Gasse] – die Häuser stehen 1,5 Felder nördlich der Gasse ───── */
const REIHEN = [["nordwest", [11, 20, 29, 37.5]], ["nordost", [55, 61.5]], ["ost1", [76, 84.5, 104.5, 113]], ["west1", [10, 18.5]], ["west2", [10, 18.5]],
  ["ost2", [76, 85, 105, 114]], ["ost3", [76, 85, 105, 114]], ["sued1", [33, 52.5, 61, 71, 80, 89, 105]], ["sued2", [34, 52.5]]];
const HAUSARTEN = ["weidenhain_fachwerk_02", "dorf_haus_holz_01", "weidenhain_kate_01", "weidenhain_fachwerk_03", "dorf_haus_holz_03", "dorf_huette_holz_02",
  "weidenhain_bauernhaus_01", "dorf_haus_holz_02", "dorf_kraeuterhaus_01", "dorf_huette_holz_01", "weidenhain_fachwerk_02", "weidenhain_kate_01"];
const gasseY = (p, x) => { let best = null; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i]; if ((x - x0) * (x - x1) <= 0 && x0 !== x1) { best = y0 + (y1 - y0) * (x - x0) / (x1 - x0); break; } } return best; };
const haeuser = []; let art = 0;
for (const [gasse, xs] of REIHEN) for (const x of xs) {
  const yG = gasseY(GASSEN[gasse], x); if (yG === null) throw new Error(`Gasse ${gasse} reicht nicht bis x = ${x}`);
  const id = HAUSARTEN[art++ % HAUSARTEN.length], plan = PLAN.get(id), tx = plan.tueren[0].x;
  const dx = (wurf() - 0.5) * 1.2, zurueck = wurf() < 0.45 ? 0.8 + wurf() * 1.4 : 0, xt = x + dx, yt = (gasseY(GASSEN[gasse], xt) ?? yG) - 1.5 - zurueck;
  haeuser.push({ objekt: id, x: +(xt - tx).toFixed(2), y: +yt.toFixed(2), tuer: [xt, yt] });                /* die Tür liegt über der Gasse, manche Häuser stehen etwas zurück */
  if (zurueck) PFADE.push([[xt, yt + 1.0], [xt + (wurf() - 0.5) * 0.8, yt + 1.5 + zurueck]]); }
const koerperVon = (h) => PLAN.get(h.objekt).koerper.map((k) => [h.x + k.x, h.y - k.d - k.t, h.x + k.x + k.b, h.y - k.d]);
const imHaus = (x, y, rand_ = 0) => haeuser.some((h) => koerperVon(h).some(([x0, y0, x1, y1]) => x > x0 - rand_ && x < x1 + rand_ && y > y0 - rand_ && y < y1 + rand_));

/* ───── Gelände ───── */
const g = []; for (let y = 0; y < H; y++) { const z = []; for (let x = 0; x < B; x++) { const cx = x + 0.5, cy = y + 0.5; let c = "f";
  if (imGraben(cx, cy)) c = "~";
  else if (strecke(cx, cy, WEG_NORD) < 2.1) c = "e";
  else if (aufPlatz(cx, cy)) c = "p";
  else if (PFADE.some((p) => strecke(cx, cy, p) < 1.0) || inGasse(cx, cy, 1.15)) c = "e";
  else if (imDorf(cx, cy) || nahGraben(cx, cy, 3.2) && cy > 8) c = Math.sin(cx / 3.7) * Math.cos(cy / 2.9) > 0.55 ? "," : ".";
  else if (strecke(cx, cy, WEG_NORD) < 4.2 + Math.sin(cy / 2)) c = ".";
  z.push(c); } g.push(z); }

/* ───── Gebäude und Dinge ───── */
let n = 0; const o = (objekt, x, y, mehr = {}) => ({ id: objekt.replace(/^(dorf|weidenhain|wald)_/, "").replace(/_\d+$/, "") + "_" + ++n, objekt, x, y, ...mehr });
const MUEHLE = [62, 32.5], SPEICHER = [30, 20.6], HAUS = [27, 45], FEUER = [42, 31.2], RING = [52, 22.4], WEHR = [62.8, 41.6];
const dinge = [
  o("weidenhain_kornspeicher_01", ...SPEICHER), o("weidenhain_bauernhaus_01", ...HAUS), o("weidenhain_muehle_01", ...MUEHLE),
  o("dorf_marktstand_02", 40, 19.6), o("dorf_marktstand_01", 28.6, 31.6),
  o("dorf_festfeuer_01", ...FEUER), o("dorf_bank_01", 37.5, 28.5), o("dorf_bank_01", 46.5, 28.5), o("dorf_bank_01", 37.5, 34.6), o("dorf_bank_01", 46.5, 34.6),
  o("wald_baum4", RING[0] + 0.2, RING[1] - 1.3, { s: 1.0 }), o("dorf_steinring_01", ...RING),
  o("dorf_wehr_01", ...WEHR), ...BRUECKEN.map((b) => o(b.objekt, b.x, b.y)),
  o("dorf_kuerbisse_01", 37.6, 21.8), o("dorf_kuerbisse_01", 31.2, 34), o("dorf_heuballen_01", 22.4, 21.6), o("dorf_heuballen_01", 23.8, 22.3),
  o("dorf_fass_01", 35.4, 21.3), o("dorf_fass_01", 36.1, 21.9), o("dorf_kiste_01", 25.9, 33.4), o("dorf_fass_01", 56.6, 34.6), o("dorf_holzstapel_01", 22.2, 44.6),
  ...[[34, 23.6], [49.6, 24.6], [34.4, 38.4], [49.6, 38.4], [57.4, 36], [45.4, 14.6], [48.6, 10.6], [70.8, 10.8], [41.6, 49.6], [46.4, 64.4], [94.4, 28], [97.8, 44.4]].map(([x, y]) => o("dorf_laterne_01", x, y)),
  ...[32, 35, 38, 41, 47, 50, 53, 56].map((x) => o("dorf_zaun_01", x, 46.6)),   /* am Ufer des Grabens, vor dem Platz; bei x = 44 die Brücke */
  ...haeuser.map((h) => o(h.objekt, h.x, h.y)) ];
/* an manchen Häusern etwas davor: Fass, Holzstapel, Kürbisse, Heu */
const KLEIN = ["dorf_fass_01", "dorf_holzstapel_01", "dorf_kuerbisse_01", "dorf_heuballen_01", "dorf_kiste_01"];
haeuser.forEach((h, i) => { if (i % 3 === 2) return; const ks = koerperVon(h), x1 = Math.max(...ks.map((k) => k[2])), x0 = Math.min(...ks.map((k) => k[0]));
  const x = i % 2 ? x1 + 0.9 : x0 - 0.9, y = h.y - 0.3; if (!inGasse(x, y, 1.6) && !imHaus(x, y, 0.4)) dinge.push(o(KLEIN[i % KLEIN.length], +x.toFixed(2), y)); });
/* einzelne Bäume im Dorf, wo Platz ist */
const fuesse = () => dinge.map((d) => [d.x, d.y]);
for (let i = 0; i < 400 && dinge.filter((d) => d.id.startsWith("dorfbaum")).length < 22; i++) {
  const x = +(8 + wurf() * (B - 16)).toFixed(2), y = +(8 + wurf() * (H - 16)).toFixed(2);
  if (!imDorf(x, y) || inGasse(x, y, 4) || strecke(x, y, WEG_NORD) < 4.5 || nahGraben(x, y, 4) || aufPlatz(x, y) || imHaus(x, y, 3.5) || imHaus(x, y + 5, 3) || fuesse().some(([a, b]) => Math.hypot(a - x, b - y) < 5)) continue;
  dinge.push({ id: "dorfbaum_" + i, objekt: "wald_baum" + (1 + Math.floor(wurf() * 3)), x, y, s: +(0.85 + wurf() * 0.2).toFixed(2) }); }

/* Wald ringsum: dicht, mit Mindestabstand; nie im Dorf, am Graben oder auf dem Weg */
const frei = (x, y, ab, liste) => liste.every((p) => Math.hypot(p.x - x, p.y - y) >= ab);
const wald = []; for (let i = 0; i < B * H * 0.95; i++) { const x = +(wurf() * B).toFixed(2), y = +(wurf() * H).toFixed(2), s = SAUM(x, y);
  if ((x > s - 1 && y > s - 1 && x < B - s + 1 && y < H - s + 1) || nahGraben(x, y, 3.6) || strecke(x, y, WEG_NORD) < 4.5 || !frei(x, y, 2.3, wald)) continue;
  const z = wurf(), a = z < 0.26 ? 1 : z < 0.5 ? 2 : z < 0.74 ? 3 : z < 0.8 ? 4 : z < 0.9 ? 5 : 6;
  wald.push({ id: "b" + String(wald.length + 1).padStart(4, "0"), objekt: "wald_baum" + a, x, y, s: +(0.85 + wurf() * 0.27).toFixed(2), ...(wurf() < 0.5 ? { spiegeln: true } : {}) }); }
const objekte = [...dinge, ...wald].sort((a, b) => a.y - b.y);
for (const p of objekte) if (!BIB.has(p.objekt)) throw new Error("unbekanntes Objekt " + p.objekt);

/* ───── Leute, Lesestellen, Start ───── */
const lies = (id, x, y, text) => ({ id, art: "lesen", x, y, radius: 1.6, abgleich: "keiner", daten: { text } });
const spiel = {
  start: [[47.5, 3], [46.5, 2.2], [48.5, 2.2]],
  figuren: [{ id: "hanne", rolle: "npc", figur: "hanne", x: 33.4, y: 23.4 }, { id: "lene", rolle: "npc", figur: "lene", x: 40.6, y: 25.2 }, { id: "tebbe", rolle: "npc", figur: "tebbe", x: 58.6, y: 36.6, links: true },
    { id: "agnes", rolle: "npc", figur: "agnes", x: 50.2, y: 33.2, links: true }, { id: "mette", rolle: "npc", figur: "mette", x: 32.4, y: 43.2 },
    { id: "junge_sued", rolle: "npc", figur: "junge", x: 46.6, y: 70.4 }, { id: "wanderer_ost", rolle: "npc", figur: "wanderer", x: 98.6, y: 37.6, links: true }, { id: "kraeuterfrau_ost", rolle: "npc", figur: "kraeuterfrau", x: 80.6, y: 31.6 }],
  spawnzonen: [],
  interaktionen: [
    lies("speicher_tuer", SPEICHER[0] + 0.6, SPEICHER[1] + 0.7, "Der Kornspeicher von Hanne Kalk. Säcke bis unters Dach, und es riecht nach frischem Korn."),
    lies("muehle_tuer", MUEHLE[0] - 1.6, MUEHLE[1] + 0.7, "Die Wassermühle am Mühlgraben. Das Rad dreht sich unermüdlich, drinnen mahlt der Stein."),
    lies("haus_tuer", HAUS[0] + 0.9, HAUS[1] + 0.7, "Ein Bauernhaus aus Fachwerk. Hinter den Läden blühen Geranien."),
    lies("feuer", FEUER[0], FEUER[1] + 0.7, "Das Erntefeuer auf dem Dorfplatz. Hier wird gefeiert, wenn das Korn eingebracht ist."),
    lies("wehr", WEHR[0] - 2.8, WEHR[1] - 1.4, "Das Wehr staut den Mühlgraben. Durch drei Überläufe stürzt das Wasser schäumend hinab."),
    lies("linde", RING[0], RING[1] + 0.8, "Die alte Linde von Weidenhain. Zwischen ihren Wurzeln blühen Wildblumen.")],
  ausgaenge: [], kollision: { sperren: [], freigeben: BRUECKEN.map((b) => ({ art: "rechteck", x0: b.frei[0], y0: b.frei[1], x1: b.frei[2], y1: b.frei[3] })) } };

const dir = join(WELT, "regionen", "weidenhain"); mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "region.json"), JSON.stringify({ id: "weidenhain", name: "Weidenhain", untertitel: "Das Dorf am Mühlgraben", ursprung: [200, 208], chunks: [B / 32, H / 32], biom: "dorf", stufe: 1 }, null, 1) + "\n");
writeFileSync(join(dir, "gelaende.txt"), g.map((z) => z.join("")).join("\n") + "\n");
writeFileSync(join(dir, "objekte.json"), "[\n" + objekte.map((p) => " " + JSON.stringify(p)).join(",\n") + "\n]\n");
writeFileSync(join(dir, "spiel.json"), JSON.stringify(spiel, null, 1) + "\n");
console.log(`weidenhain: ${B} × ${H} Felder, ${objekte.length} Objekte (${dinge.length} im Dorf, ${haeuser.length + 3} Häuser), ${spiel.figuren.length} Figuren`);
export const WEIDENHAIN_HAEUSER = haeuser;
