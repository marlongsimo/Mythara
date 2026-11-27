/*
 * World Pipeline – Zunfthäuser außerhalb Steinhag (#168, 27.11.2026, Entscheidung des Nutzers: ab Stufe 60, thematisch verteilt, Konzept doku/konzepte/hauptstaedte.md).
 *   Holzfällerhof in Erlengrund: eingehegter Hain südlich der Sägemühle mit Kernbäumen und Weltenbaum-Setzlingen, Werkbank, Bankkiste.
 *   Kochzunft in Haferstedt: Kochhof hinter der Bäckerei mit drei Herden, zwei Backöfen, Kessel, Bankkiste.
 *   Kräutergarten der Heilkundigen in der Waldmark: Garten am Teich neben Mira mit Beeten aller Kräuter, Kessel, Bankkiste.
 *   (Bergmannszunft und Zunftschmiede: Steinhag, hochlande.mjs. Fischerzunft: Kielmund, kueste.mjs.)
 * Jede Zunft ist eingehegt (Hecke) und hat genau ein Tor: das Feld des Tors bekommt Systeme als Tür mit beruf: { id, level: 60 } (shared/zunft.ts).
 * Nur vorhandene Objekte. Schreibt welt/festland/plan_zunft.json (Erlengrund, Haferstedt; festland.py), ändert welt/regionen/waldmark (Kennungen zunft_…, wiederholbar)
 * und schreibt welt/zunft_orte.json (Tore, Bankkisten, Stationen, Baumgruppen für sammelstellen.mjs, Kräuter für kraeuter.py). Trägt die Kräuter auch gleich in
 * welt/kraeuter_standorte.json ein.
 * Aufruf (im Ordner realtime): node werkzeug/welt/zunfthaeuser.mjs, danach die ganze Kette.
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";

const BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const objekte = [], interaktionen = [], zuenfte = [], holzgruppen = [], kraeuter = [];
const ding = (liste, objekt, x, y, mehr = {}) => { if (!BIB.has(objekt)) throw new Error("unbekanntes Objekt " + objekt); const o = { id: mehr.id, objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...mehr }; liste.push(o); return o; };
const lies = (liste, id, x, y, text, mehr = {}) => liste.push({ id, art: "lesen", x: +x.toFixed(2), y: +y.toFixed(2), radius: 1.8, abgleich: "keiner", daten: { text, ...mehr } });

/* Hecke um das Rechteck [x0, y0, x1, y1] mit einem Tor (Seite n/s/w/o, Mitte, Breite) – oben/unten Hecken zu 2,4 nebeneinander, seitlich übereinander (dicht).
   Gibt das Feld des Tors zurück (Weltfelder, Ecken eingeschlossen) und den Innenraum. */
function hecke(liste, pre, [x0, y0, x1, y1], tor) { let n = 0; const id = () => `zaun_${pre}_${++n}`, [seite, mitte, breite = 3] = tor, frei = (a, b) => b < mitte - breite / 2 || a > mitte + breite / 2;
  const xs = []; for (let x = x0 + 1.2; x < x1 - 1.2; x += 2.2) xs.push(x); xs.push(x1 - 1.2);
  const ys = []; for (let y = y0 + 1.7; y < y1 - 0.8; y += 0.8) ys.push(y); ys.push(y1 - 0.8);
  let lo = -Infinity, hi = Infinity;   /* die Öffnung zwischen den Hecken links/rechts (oben/unten) vom Tor */
  for (const [y, s] of [[y0 + 0.96, "n"], [y1, "s"]]) for (const x of xs) { if (seite === s) { if (!frei(x - 1.2, x + 1.2)) continue; if (x < mitte) lo = Math.max(lo, x + 1.2); else hi = Math.min(hi, x - 1.2); } ding(liste, "k_hecke", x, y, { id: id() }); }
  for (const [x, s] of [[x0 + 1.2, "w"], [x1 - 1.2, "o"]]) for (const y of ys) { if (seite === s) { if (!frei(y - 0.96, y)) continue; if (y < mitte) lo = Math.max(lo, y); else hi = Math.min(hi, y - 0.96); } ding(liste, "k_hecke", x, y, { id: id() }); }
  const a = Math.floor(lo), b = Math.ceil(hi) - 1;
  const feld = seite === "n" ? [a, y0, b, y0] : seite === "s" ? [a, y1 - 1, b, y1 - 1] : seite === "w" ? [x0, a, x0 + 2, b] : [x1 - 3, a, x1 - 1, b];
  return { feld, innen: [x0 + 2.4, y0 + 1, x1 - 2.4, y1 - 1] }; }

/* ═══════ Holzfällerhof in Erlengrund (Region fl_186_211): Hain 22 × 16 südlich der Sägemühle, Tor im Norden zum Dorf ═══════ */
{ const R = [6389, 7009, 6411, 7025], { feld } = hecke(objekte, "holzfaellerhof", R, ["n", 6397.5, 3]), reg = "fl_186_211";
  const baum = (art, x, y, i) => ({ id: `holzfaellerhof_${art}_${i}`, art, x, y, region: reg });
  holzgruppen.push({ ort: "erlengrund", name: "Hain des Holzfällerhofs: Kernbäume", baeume: [baum("kernbaum", 6393.5, 7013.5, 1), baum("kernbaum", 6399.5, 7014.5, 2), baum("kernbaum", 6405.5, 7013.5, 3), baum("eibe", 6407.5, 7018.5, 4)] },
    { ort: "erlengrund", name: "Hain des Holzfällerhofs: Weltenbaum-Setzlinge", baeume: [baum("weltenbaum", 6394.5, 7019.5, 5), baum("weltenbaum", 6400.5, 7020.5, 6), baum("eibe", 6404.5, 7022.5, 7)] });
  ding(objekte, "hand_werkbank_01", 6397.5, 7021.8, { id: "holzfaellerhof_werkbank" }); ding(objekte, "steinhag_bankkiste", 6406, 7023, { id: "holzfaellerhof_bankkiste" }); ding(objekte, "dorf_holzstapel_01", 6402.5, 7023.2, { id: "holzfaellerhof_holz" });
  ding(objekte, "welt_wegweiser_01", 6395, 7007.6, { id: "holzfaellerhof_schild" });
  lies(interaktionen, "holzfaellerhof", 6395.5, 7008.6, "Der Holzfällerhof. Ein Schild am Tor: „Hain der Zunft – nur für Meister der Holzfällerei (ab Stufe 60).“");
  lies(interaktionen, "holzfaellerhof_bankkiste", 6406, 7023.6, "Die Bankkiste der Holzfäller. Was du hier einlegst, liegt auf deinem Konto.");
  lies(interaktionen, "holzfaellerhof_werkbank", 6397.5, 7023.1, "Die Werkbank des Holzfällerhofs. Hier werden Stämme zu Brettern und Bögen.");
  zuenfte.push({ zunft: "holzfaellerhof", name: "Holzfällerhof", ort: "Erlengrund", beruf: "holzfaellerei", ab: 60, region: reg, flaeche: R, tor: feld, wache: [6397.5, 7007.4],
    bankkiste: { id: "holzfaellerhof_bankkiste", x: 6406, y: 7023.6 }, stationen: [{ id: "werkbank_holzfaellerhof", station: "werkbank", x: 6397.5, y: 7023.1 }], baeume: holzgruppen.flatMap((g) => g.baeume.map((b) => b.id)) }); }

/* ═══════ Kochzunft in Haferstedt (Region fl_186_211): Kochhof 16 × 12 hinter der Bäckerei, Tor im Westen zur Kapellengasse ═══════ */
{ const R = [6230, 6959, 6246, 6971], { feld } = hecke(objekte, "kochzunft", R, ["w", 6965, 3]), reg = "fl_186_211", st = [];
  for (const [i, x] of [6235, 6238.5, 6242].entries()) { ding(objekte, "hand_herd_01", x, 6962, { id: `kochzunft_herd_${i + 1}` }); st.push({ id: `herd_kochzunft_${i + 1}`, station: "herd", x, y: 6963.4 }); }
  for (const [i, x] of [6235.5, 6239.5].entries()) { ding(objekte, "hand_backofen_01", x, 6967.5, { id: `kochzunft_backofen_${i + 1}` }); st.push({ id: `backofen_kochzunft_${i + 1}`, station: "backofen", x, y: 6969.4 }); }
  ding(objekte, "hand_kessel_01", 6242.4, 6966.8, { id: "kochzunft_kessel" }); st.push({ id: "kessel_kochzunft", station: "kessel", x: 6242.4, y: 6968.2 });
  ding(objekte, "steinhag_bankkiste", 6234, 6969.6, { id: "kochzunft_bankkiste" }); ding(objekte, "k_faesser", 6242.4, 6960.6, { id: "kochzunft_faesser" });
  lies(interaktionen, "kochzunft", 6228.2, 6967.2, "Der Kochhof der Zunft. „Herde und Öfen für Meisterköche – ab Stufe 60 im Kochen.“");
  lies(interaktionen, "kochzunft_bankkiste", 6234, 6969.4, "Die Bankkiste der Kochzunft. Was du hier einlegst, liegt auf deinem Konto.");
  zuenfte.push({ zunft: "kochzunft", name: "Kochzunft", ort: "Haferstedt", beruf: "kochen", ab: 60, region: reg, flaeche: R, tor: feld, wache: [6228, 6965.5], bankkiste: { id: "kochzunft_bankkiste", x: 6234, y: 6969.4 }, stationen: st }); }

/* ═══════ Kräutergarten der Heilkundigen in der Waldmark (Region waldmark): Garten 12 × 8 am Teich neben Mira, Tor im Westen ═══════ */
const WM = [];
{ const R = [6461, 6435, 6473, 6443], { feld } = hecke(WM, "kraeutergarten", R, ["w", 6439.5, 3]), BEET = [];
  /* 3 × 3 Beete: vorn Wegerich, Eisenhut, Nebelkraut (Zutaten der Zunft-Tränke), dahinter je Zunft-Kraut eine Gruppe (#176: Mondsalbei 70, Glutwurz 80, Splitterlilie 90) */
  const SPALTEN = [6464.3, 6466.3, 6468.3], ZEILEN = [6437.4, 6439.4, 6441.4];
  const ARTEN = [["wegerich", "eisenhut", "nebelkraut"], ["mondsalbei", "glutwurz", "splitterlilie"], ["mondsalbei", "glutwurz", "splitterlilie"]];
  ZEILEN.forEach((y, r) => SPALTEN.forEach((x, c) => { const art = ARTEN[r][c], n = kraeuter.filter((k) => k.art === art).length + 1; BEET.push([x, y]); kraeuter.push({ id: `kraeutergarten_${art}_${n}`, art, x, y, region: "waldmark" }); }));
  ding(WM, "hand_kessel_01", 6470, 6439.6, { id: "kraeutergarten_kessel", s: 0.7 }); ding(WM, "steinhag_bankkiste", 6470, 6437, { id: "kraeutergarten_bankkiste" });
  lies(WM, "kraeutergarten", 6459.6, 6438, "Der Kräutergarten der Heilkundigen. Mira hat den Schlüssel – „nur für Meister der Kräuterkunde, ab Stufe 60“.");
  lies(WM, "kraeutergarten_bankkiste", 6469.6, 6438.2, "Die Bankkiste der Heilkundigen. Was du hier einlegst, liegt auf deinem Konto.");
  zuenfte.push({ zunft: "kraeutergarten", name: "Kräutergarten der Heilkundigen", ort: "Waldmark", beruf: "kraeuterkunde", ab: 60, region: "waldmark", flaeche: R, tor: feld, wache: [6459.5, 6439.5],
    bankkiste: { id: "kraeutergarten_bankkiste", x: 6469.6, y: 6438.2 }, stationen: [{ id: "kessel_kraeutergarten", station: "kessel", x: 6469.6, y: 6440.8 }], kraeuter: kraeuter.map((k) => k.id), beete: BEET }); }

/* ───── Waldmark: eigene Dinge (zunft-Kennungen) ersetzen; Beete als Acker ───── */
{ const D = join(WELT, "regionen", "waldmark"), [UX, UY] = JSON.parse(readFileSync(join(D, "region.json"), "utf8")).ursprung.map((v) => v * 32), eigen = (id) => /^(kraeutergarten|zaun_kraeutergarten)/.test(id);
  const ob = JSON.parse(readFileSync(join(D, "objekte.json"), "utf8")).filter((o) => !eigen(o.id)), sp = JSON.parse(readFileSync(join(D, "spiel.json"), "utf8"));
  for (const o of WM.filter((o) => o.objekt)) ob.push({ ...o, x: +(o.x - UX).toFixed(2), y: +(o.y - UY).toFixed(2) });
  sp.interaktionen = [...sp.interaktionen.filter((i) => !eigen(i.id)), ...WM.filter((o) => o.art === "lesen").map((i) => ({ ...i, x: +(i.x - UX).toFixed(2), y: +(i.y - UY).toFixed(2) }))];
  writeFileSync(join(D, "objekte.json"), "[\n" + ob.map((o) => " " + JSON.stringify(o)).join(",\n") + "\n]\n"); writeFileSync(join(D, "spiel.json"), JSON.stringify(sp, null, 1) + "\n");
  const g = readFileSync(join(D, "gelaende.txt"), "utf8").split("\n").map((z) => [...z]);
  for (const [x, y] of zuenfte.find((z) => z.zunft === "kraeutergarten").beete) for (const dx of [-0.5, 0.5]) { const r = g[Math.floor(y - UY)]; if (r && ".,".includes(r[Math.floor(x + dx - UX)])) r[Math.floor(x + dx - UX)] = "a"; }
  writeFileSync(join(D, "gelaende.txt"), g.map((z) => z.join("")).join("\n")); }

/* ───── Kräuter in die Fundstellen (frühere kraeutergarten_… ersetzen; kraeuter.py übernimmt sie aus zunft_orte.json) ───── */
{ const KP = join(WELT, "kraeuter_standorte.json"), KS = JSON.parse(readFileSync(KP, "utf8")); KS.stellen = [...KS.stellen.filter((q) => !q.id.startsWith("kraeutergarten_")), ...kraeuter];
  writeFileSync(KP, JSON.stringify(KS, null, 1)); }

/* ───── schreiben ───── */
writeFileSync(join(WELT, "festland", "plan_zunft.json"), JSON.stringify({ hinweis: "Erzeugt von werkzeug/welt/zunfthaeuser.mjs (#168): Holzfällerhof in Erlengrund, Kochhof der Kochzunft in Haferstedt. Weltfelder.",
  gelaende: [], hoehen: [], eben: [], objekte, interaktionen, sperren: [], freigeben: [] }) + "\n");
writeFileSync(join(WELT, "zunft_orte.json"), JSON.stringify({ hinweis: "Zunfthäuser ab Stufe 60 (#168), Welt: werkzeug/welt/zunfthaeuser.mjs. Je Zunft: flaeche (eingehegt), tor (Feld der Tür für Systeme, Weltfelder, Ecken eingeschlossen), wache, bankkiste (Lesestelle), stationen; Bäume als Sammelstellen (sammelstellen.mjs), Kräuter (kraeuter.py). Bergmannszunft/Zunftschmiede: hochlande_orte.json → hauptstadt; Fischerzunft: kueste_orte.json.",
  zuenfte, holzgruppen, kraeuter }, null, 1) + "\n");
console.log(`Zunfthäuser: ${zuenfte.map((z) => `${z.name} (Tor ${z.tor.join(",")})`).join(" · ")}; ${objekte.length + WM.filter((o) => o.objekt).length} Objekte, ${holzgruppen.reduce((s, g) => s + g.baeume.length, 0)} Bäume, ${kraeuter.length} Kräuter`);
