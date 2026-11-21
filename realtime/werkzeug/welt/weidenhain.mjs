/*
 * World Pipeline – Weidenhain als Region der offenen Welt, nachgebaut nach dem gemalten Dorf der Kampagne (img/echtzeit/weidenhain.webp):
 * gepflasterter Dorfplatz mit Erntefeuer und Bänken, Kornspeicher mit Anbau, Fachwerk-Bauernhaus, zwei Stände, Linde im Steinring,
 * Wassermühle mit Mühlrad am Mühlgraben, Wehr mit drei Überläufen, Zaun am Ufer, ringsum Wald. Bei Tag statt bei Nacht.
 *
 * Lage: 3 × 2 Chunks ab Chunk 200|208, direkt südlich des Kreuzwalds. Der Feldweg des Kreuzwalds endet (noch) an einem umgestürzten Baum;
 * nimmt man ihn weg (werkzeug/welt/waldmark.mjs), führt er geradewegs ins Dorf. Der Spielserver kennt den Ort „weidenhain“ schon.
 *
 * Aufruf (im Ordner realtime): node werkzeug/welt/weidenhain.mjs      danach: node werkzeug/welt/bauen.mjs weidenhain
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";

const B = 96, H = 64;
let saat = 77; const wurf = () => (saat = (saat * 1103515245 + 12345) % 2147483648) / 2147483648;
const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };
const rand = (x, y) => 1 + 0.07 * Math.sin(x / 3.3 + y / 4.1) + 0.05 * Math.sin(y / 2.1 - x / 5.7);   /* unruhige Ränder */

/* ───── Plan (Felder; x nach Osten, y nach Süden) ───── */
const DORF = { x: 44, y: 30, rx: 34, ry: 26 };                       /* gerodete Fläche, ringsum Wald */
const PLATZ = { x: 42, y: 30, rx: 14.5, ry: 9.5 };                      /* gepflastert */
const imDorf = (x, y, k = 1) => Math.hypot((x - DORF.x) / DORF.rx, (y - DORF.y) / DORF.ry) < k * rand(x, y);
const aufPlatz = (x, y) => Math.hypot((x - PLATZ.x) / PLATZ.rx, (y - PLATZ.y) / PLATZ.ry) < rand(x * 1.7, y * 1.3);
/* Mühlgraben: von Norden östlich der Mühle herab, unter dem Mühlrad nach Westen, am Wehr vorbei nach Süden, dann am Platz entlang nach Westen und hinaus */
const GRABEN = [[67.5, -1], [67.5, 31], [66, 33.4], [62.8, 33.6], [62.8, 45.5], [60, 48.5], [27, 48.5], [24.5, 51], [24.5, 65]];
const imGraben = (x, y) => strecke(x, y, GRABEN) < 1.55 + 0.12 * Math.sin(x / 2.3 + y / 3.1);
const nahGraben = (x, y, r) => strecke(x, y, GRABEN) < r;
const WEG_NORD = [[48, -1], [46.5, 10], [44.5, 21.5]];                  /* der Feldweg aus dem Kreuzwald */
const PFADE = [[[55, 31], [58.5, 33.4], [60.4, 33.2]], [[31.5, 37.5], [28.6, 43], [27.9, 45.4]], [[31, 22.4], [30.6, 21]]];

/* ───── Gelände ───── */
const g = []; for (let y = 0; y < H; y++) { const z = []; for (let x = 0; x < B; x++) { const cx = x + 0.5, cy = y + 0.5; let c = "f";
  if (imGraben(cx, cy)) c = "~";
  else if (strecke(cx, cy, WEG_NORD) < 2.1) c = "e";
  else if (aufPlatz(cx, cy)) c = "p";
  else if (PFADE.some((p) => strecke(cx, cy, p) < 1.0)) c = "e";
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
  o("dorf_wehr_01", ...WEHR),
  o("dorf_kuerbisse_01", 37.6, 21.8), o("dorf_kuerbisse_01", 31.2, 34), o("dorf_heuballen_01", 22.4, 21.6), o("dorf_heuballen_01", 23.8, 22.3),
  o("dorf_fass_01", 35.4, 21.3), o("dorf_fass_01", 36.1, 21.9), o("dorf_kiste_01", 25.9, 33.4), o("dorf_fass_01", 56.6, 34.6), o("dorf_holzstapel_01", 22.2, 44.6),
  ...[[34, 23.6], [49.6, 24.6], [34.4, 38.4], [49.6, 38.4], [57.4, 36], [45.4, 14.6]].map(([x, y]) => o("dorf_laterne_01", x, y)),
  ...[32, 35, 38, 41, 44, 47, 50, 53, 56].map((x) => o("dorf_zaun_01", x, 46.6)),   /* am Ufer des Grabens, vor dem Platz */
  ...[[14, 30, 2], [16, 16, 3], [74, 16, 1], [74, 44, 5], [16, 52, 6], [50, 56, 3]].map(([x, y, a]) => o("wald_baum" + a, x, y, { s: 0.95 })) ];

/* Wald ringsum: dicht, mit Mindestabstand; nie im Dorf, am Graben oder auf dem Weg */
const frei = (x, y, ab, liste) => liste.every((p) => Math.hypot(p.x - x, p.y - y) >= ab);
const wald = []; for (let i = 0; i < B * H * 0.95; i++) { const x = +(wurf() * B).toFixed(2), y = +(wurf() * H).toFixed(2);
  if (imDorf(x, y, 1.06) || nahGraben(x, y, 3.6) || strecke(x, y, WEG_NORD) < 4.5 || !frei(x, y, 2.3, wald)) continue;
  const z = wurf(), art = z < 0.26 ? 1 : z < 0.5 ? 2 : z < 0.74 ? 3 : z < 0.8 ? 4 : z < 0.9 ? 5 : 6;
  wald.push({ id: "b" + String(wald.length + 1).padStart(4, "0"), objekt: "wald_baum" + art, x, y, s: +(0.85 + wurf() * 0.27).toFixed(2), ...(wurf() < 0.5 ? { spiegeln: true } : {}) }); }
const objekte = [...dinge, ...wald].sort((a, b) => a.y - b.y);

/* ───── Leute, Lesestellen, Start ───── */
const lies = (id, x, y, text) => ({ id, art: "lesen", x, y, radius: 1.6, abgleich: "keiner", daten: { text } });
const spiel = {
  start: [[47.5, 3], [46.5, 2.2], [48.5, 2.2]],
  figuren: [{ id: "hanne", rolle: "npc", figur: "hanne", x: 33.4, y: 23.4 }, { id: "lene", rolle: "npc", figur: "lene", x: 40.6, y: 25.2 }, { id: "tebbe", rolle: "npc", figur: "tebbe", x: 58.6, y: 36.6, links: true },
    { id: "agnes", rolle: "npc", figur: "agnes", x: 50.2, y: 33.2, links: true }, { id: "mette", rolle: "npc", figur: "mette", x: 32.4, y: 43.2 }],
  spawnzonen: [],
  interaktionen: [
    lies("speicher_tuer", SPEICHER[0] + 0.6, SPEICHER[1] + 0.7, "Der Kornspeicher von Hanne Kalk. Säcke bis unters Dach, und es riecht nach frischem Korn."),
    lies("muehle_tuer", MUEHLE[0] - 1.6, MUEHLE[1] + 0.7, "Die Wassermühle am Mühlgraben. Das Rad dreht sich unermüdlich, drinnen mahlt der Stein."),
    lies("haus_tuer", HAUS[0] + 0.9, HAUS[1] + 0.7, "Ein Bauernhaus aus Fachwerk. Hinter den Läden blühen Geranien."),
    lies("feuer", FEUER[0], FEUER[1] + 0.7, "Das Erntefeuer auf dem Dorfplatz. Hier wird gefeiert, wenn das Korn eingebracht ist."),
    lies("wehr", WEHR[0] - 2.8, WEHR[1] - 1.4, "Das Wehr staut den Mühlgraben. Durch drei Überläufe stürzt das Wasser schäumend hinab."),
    lies("linde", RING[0], RING[1] + 0.8, "Die alte Linde von Weidenhain. Zwischen ihren Wurzeln blühen Wildblumen.")],
  ausgaenge: [], kollision: { sperren: [], freigeben: [] } };

const dir = join(WELT, "regionen", "weidenhain"); mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "region.json"), JSON.stringify({ id: "weidenhain", name: "Weidenhain", untertitel: "Das Dorf am Mühlgraben", ursprung: [200, 208], chunks: [3, 2], biom: "dorf", stufe: 1 }, null, 1) + "\n");
writeFileSync(join(dir, "gelaende.txt"), g.map((z) => z.join("")).join("\n") + "\n");
writeFileSync(join(dir, "objekte.json"), "[\n" + objekte.map((p) => " " + JSON.stringify(p)).join(",\n") + "\n]\n");
writeFileSync(join(dir, "spiel.json"), JSON.stringify(spiel, null, 1) + "\n");
console.log(`weidenhain: ${B} × ${H} Felder, ${objekte.length} Objekte (${dinge.length} im Dorf), ${spiel.figuren.length} Figuren`);
