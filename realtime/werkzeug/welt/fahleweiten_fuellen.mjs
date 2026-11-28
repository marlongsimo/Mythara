/*
 * World Pipeline – Fahle Weiten füllen, Schritt 1 (#171, 27.11.2026; Konzept doku/konzepte/fahle-weiten.md, Entscheidungen des Nutzers vom 27.11.):
 *   Grauwacht wird zur mittleren Hauptstadt (Stadtstufe „burg“): Stadtmauer mit zwei Toren (Süden; Osten über die Brücke zur Furt), Kaserne mit Bankkiste,
 *   Taverne, Markt, Handwerkergasse, Häuser – alles Neue mit ausbau "burg" (zeigt sich erst nach E3, sperrt nur dann).
 *   Neue Orte gegen die Lücken: Hügelgrund (Westen, Dorf mit Bank, Laden, Herd, Kräuterbeet) und vier Dörfer im mittleren Bereich, jedes mit eigenem Beruf
 *   und Bankkiste: Kohlstatt (Köhler, Holz), Brechstein (Steinbrecher, Erz), Wollhag (Schäferei), Weiherhof (Fischer am Weiher). Heidrast wird etwas größer.
 *   Dazu Wege, Rastplätze, Fischplätze (Weiher, Küste), Kräuter an den Orten; Holz und Erz setzt sammelstellen.mjs (Orte und Wege aus fahleweiten_orte.json).
 * Nur vorhandene Objekte. Schreibt welt/festland/plan_fahleweiten_fuellen.json (festland.py, nach plan_fahleweiten.json) und welt/fahleweiten_orte.json.
 * Wiederholbar (Grund unter den eigenen Flächen in welt/festland/fahleweiten_fuellen_grund.json).
 * Aufruf (im Ordner realtime): node werkzeug/welt/fahleweiten_fuellen.mjs (nach fahleweiten.mjs), danach die ganze Kette.
 */
import { writeFileSync, readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";

const BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy || 1))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };
const welle = (x, y) => Math.sin(x / 3.1 + y / 4.3) + 0.6 * Math.sin(y / 2.3 - x / 5.1);
let saat = 17117; const wurf = () => (saat = (saat * 1103515245 + 12345) % 2147483648) / 2147483648;
const wahl = (l) => l[Math.floor(wurf() * l.length)];

/* ───── Grund: Regionen (ohne eigene Flächen früherer Läufe) ───── */
const GRUNDDATEI = join(WELT, "festland", "fahleweiten_fuellen_grund.json");
const alt = existsSync(GRUNDDATEI) ? new Map(Object.entries(JSON.parse(readFileSync(GRUNDDATEI, "utf8")).felder)) : new Map();
const GR = [];
for (const n of readdirSync(join(WELT, "regionen"))) { const rp = join(WELT, "regionen", n, "region.json"); if (!existsSync(rp)) continue; const r = JSON.parse(readFileSync(rp, "utf8")); if (r.ebene || r.entwurf) continue;
  GR.push({ n, x0: r.ursprung[0] * 32, y0: r.ursprung[1] * 32, z: readFileSync(join(WELT, "regionen", n, "gelaende.txt"), "utf8").split("\n") }); }
const regionVon = (x, y) => GR.find((g) => { const z = g.z[Math.floor(y) - g.y0]; return z && x >= g.x0 && x < g.x0 + z.length; })?.n;
const roh = (x, y) => { for (const g of GR) { const z = g.z[Math.floor(y) - g.y0]; if (z && x >= g.x0 && x < g.x0 + z.length) return z[Math.floor(x) - g.x0]; } return "?"; };
const grund = (x, y) => alt.get(Math.floor(x) + "," + Math.floor(y)) ?? roh(x, y);

/* ───── Plan ───── */
const feld = new Map(), urs = new Map(), hoehen = new Map(), eben = [], objekte = [], interaktionen = [], sperren = [], freigeben = [], npc = [], fische = [], kraeuter = [], wege = [];
const orte = {}, namen = [], banken = [], laeden = [], stationen = [], rast = [];
const nass = (c) => "~wMo".includes(c);
const setze = (x, y, c) => { const k = Math.floor(x) + "," + Math.floor(y), g = grund(x, y); if (g === "?" || (nass(g) && c !== "w") || g === "F") return; if (!urs.has(k)) urs.set(k, g); feld.set(k, c); };
const jetzt = (x, y) => feld.get(Math.floor(x) + "," + Math.floor(y)) ?? grund(x, y);
const hebe = (x, y, h) => { const k = Math.floor(x) + "," + Math.floor(y); hoehen.set(k, (hoehen.get(k) || 0) + h); };
const male = (x0, y0, x1, y1, f) => { for (let y = Math.floor(y0); y < Math.ceil(y1); y++) for (let x = Math.floor(x0); x < Math.ceil(x1); x++) { const c = f(x + 0.5, y + 0.5); if (c) setze(x, y, c); } };
/* Körper aller anderen Pläne (Fahle Weiten, Wegenetz …), damit nichts übereinander steht */
const koerperVon = (o) => { const b = BIB.get(o.objekt); const k = o.kollision || b?.kollision; const s = o.s ?? 1;
  const kk = k?.koerper || (k?.art === "rechteck" ? [{ x0: k.x, x1: k.x + k.b, y0: k.y, y1: k.y + k.h }] : k?.art === "kreis" ? [{ x0: -k.r, x1: k.r, y0: -k.r, y1: k.r }] : []);
  return kk.map((c) => [o.x + c.x0 * s, o.y + c.y0 * s, o.x + c.x1 * s, o.y + c.y1 * s, o.id || o.objekt]); };
const koerper = [];
for (const f of readdirSync(join(WELT, "festland"))) if (/^plan_.*\.json$/.test(f) && f !== "plan_fahleweiten_fuellen.json") for (const o of JSON.parse(readFileSync(join(WELT, "festland", f), "utf8")).objekte || []) if (o.objekt) koerper.push(...koerperVon(o));
const FW = JSON.parse(readFileSync(join(WELT, "festland", "plan_fahleweiten.json"), "utf8"));
const fremdeLesestellen = FW.interaktionen.map((i) => [i.x, i.y]);
let nr = 0;
const ding = (objekt, x, y, mehr = {}) => { const b = BIB.get(objekt); if (!b) throw new Error("unbekanntes Objekt " + objekt); if (b.kategorie !== "bewuchs" && Number.isInteger(y / 32)) y -= 0.01;
  const o = { id: mehr.id || `fwf_${objekt.replace(/^(dorf|graufurt|stil|k|moor|hand|welt|weidenhain|wald|burg|hoehle|wz|holz|waldmark|kueste)_/, "").replace(/_\d+$/, "")}_${++nr}`, objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...mehr };
  const rs = koerperVon(o); for (const r of rs) { const hit = koerper.find((q) => r[0] < q[2] && q[0] < r[2] && r[1] < q[3] && q[1] < r[3]); if (hit && b.kategorie === "gebaeude") throw new Error(`${o.id} überdeckt ${hit[4]}`); } koerper.push(...rs);   /* erst alle Körper prüfen: mehrteilige Gebäude überdecken sich nicht selbst */
  objekte.push(o); return o; };
const lies = (id, x, y, text, mehr = {}) => interaktionen.push({ id, art: "lesen", x: +x.toFixed(2), y: +y.toFixed(2), radius: 1.8, abgleich: "keiner", daten: { text, ...mehr } });
const weg = (punkte, breite = 1.8, zeichen = "e") => { const xs = punkte.map((p) => p[0]), ys = punkte.map((p) => p[1]); wege.push({ punkte, breite, zeichen });
  male(Math.min(...xs) - 3, Math.min(...ys) - 3, Math.max(...xs) + 3, Math.max(...ys) + 3, (x, y) => (strecke(x, y, punkte) < breite / 2 + 0.15 * welle(x, y) && !"Fp".includes(jetzt(x, y)) ? zeichen : null)); };
const uferplatz = (id, fisch, stufe, x, y, text) => { let best = null; for (let r = 0; r < 30 && !best; r++) for (let a = 0; a < 6.3; a += 0.05) { const px = Math.floor(x + Math.cos(a) * r) + 0.5, py = Math.floor(y + Math.sin(a) * r) + 0.5;
    if (nass(jetzt(px, py)) || "F".includes(jetzt(px, py)) || koerper.some((q) => px > q[0] - 0.5 && px < q[2] + 0.5 && py > q[1] - 0.5 && py < q[3] + 0.5)) continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (nass(jetzt(px + dx, py + dy)) && nass(jetzt(px + 2 * dx, py + 2 * dy))) { best = [px, py, dx, dy]; break; } if (best) break; }
  if (!best) throw new Error("kein Uferplatz für " + id); const [px, py, dx, dy] = best; lies(id, px, py, text, { fisch, stufe }); fische.push({ id, fisch, stufe, x: px + dx, y: py + dy, stehplatz: [px, py] }); };
const kraut = (id, art, x, y) => { for (let r = 0; r < 8; r++) for (let a = 0; a < 6.3; a += 0.5) { const px = Math.floor(x + Math.cos(a) * r) + 0.5, py = Math.floor(y + Math.sin(a) * r) + 0.5;
    if (!".,Tag".includes(jetzt(px, py)) || koerper.some((q) => px > q[0] - 1 && px < q[2] + 1 && py > q[1] - 1 && py < q[3] + 1)) continue; kraeuter.push({ id, art, x: px, y: py, region: regionVon(px, py) }); return; } };

/* Bauplatz suchen: nächster Platz um (x, y), an dem das Objekt frei auf festem Boden steht (1 Feld Abstand zu allem, nicht auf Wegen, nicht an Lesestellen) */
const BODEN = new Set([..."., fTagys"].filter((c) => c !== " "));
const passt = (objekt, x, y, s = 1, mehr = {}) => { const rs = koerperVon({ objekt, x, y, s }); if (!rs.length) return true; return rs.every((r) => passt1(r, mehr)); };
const passt1 = (r, mehr) => { const rand = mehr.rand ?? 1;
  if (regionVon(r[0], r[1] - 0.5) !== regionVon(r[2], r[3] + 0.5)) return false;   /* nicht über eine Gebietsgrenze bauen */
  for (let v = Math.floor(r[1]) - rand; v < Math.ceil(r[3]) + rand; v++) for (let u = Math.floor(r[0]) - rand; u < Math.ceil(r[2]) + rand; u++) if (!BODEN.has(jetzt(u + 0.5, v + 0.5))) return false;
  if (koerper.some((q) => r[0] - 1.4 < q[2] && q[0] < r[2] + 1.4 && r[1] - 1.4 < q[3] && q[1] < r[3] + 1.4)) return false;
  if ([...interaktionen.map((i) => [i.x, i.y]), ...fremdeLesestellen, ...npc.map((n) => [n.x, n.y])].some(([px, py]) => px > r[0] - 2 && px < r[2] + 2 && py > r[1] - 2 && py < r[3] + 2)) return false;
  return !(mehr.frei && mehr.frei.some(([a, b, c, d]) => r[0] < c && a < r[2] && r[1] < d && b < r[3])); };
const baue = (objekt, x, y, mehr = {}, suche = 8) => { const s = mehr.s ?? 1; for (let r = 0; r <= suche; r += 0.5) for (let a = 0; a < 6.28; a += r ? 0.4 / r + 0.2 : 7) { const px = Math.round((x + Math.cos(a) * r) * 2) / 2, py = Math.round((y + Math.sin(a) * r) * 2) / 2;
    if (passt(objekt, px, py, s, mehr)) { const { rand, frei, ...rest } = mehr; return ding(objekt, px, py, rest); } }
  throw new Error(`kein Platz für ${mehr.id || objekt} bei ${x}|${y}`); };
const ortsboden = (cx, cy, rx, ry) => male(cx - rx - 2, cy - ry - 2, cx + rx + 2, cy + ry + 2, (x, y) => { const d = Math.hypot((x - cx) / rx, (y - cy) / ry) + 0.06 * welle(x, y); if (d > 1) return null; const c = jetzt(x, y);
  return "kpe~w".includes(c) || nass(c) ? null : c === "f" || c === "T" ? (welle(x, y) > 1.0 ? "," : ".") : null; });

/* ═══════════════════════ Grauwacht: mittlere Hauptstadt (Stufe „burg“) ═══════════════════════ */
const GW = { burg: [6706, 5704], rx: 20, ry: 12, platz: [6706, 5748] }, MAUER = { x0: 6644, y0: 5712, y1: 5810 }, TOR_SUED = 6680, B = { ausbau: "burg" };
const imFels = (x, y) => Math.hypot((x - GW.burg[0]) / GW.rx, (y - GW.burg[1]) / GW.ry) < 1.0;
const grauwacht = { mauer: [MAUER.x0, MAUER.y0, null, MAUER.y1], tore: { sued: [TOR_SUED, MAUER.y1], ost_bruecke: [6727, 5760] }, laeden: [], gebaeude: 0 };
{ let mz = 0; const mid = () => "grauwacht_mauer_" + ++mz, geh = (x, y) => { const c = jetzt(x + 0.5, y + 0.5); return !nass(c) && c !== "F" && c !== "?"; };
  /* Nord (zwei Stücke links und rechts vom Burgfelsen, bis an den Fels bzw. ans Meer) und Süd (bis ans Meer, Tor bei TOR_SUED) */
  let ostEnde = MAUER.x0;
  for (const Y of [MAUER.y0, MAUER.y1]) for (let x = MAUER.x0; x < MAUER.x0 + 140; x += 2) {
    const meer = (u, v) => nass(jetzt(u + 0.5, v + 0.5));
    if ([Y - 1, Y, Y + 1].every((yy) => meer(x, yy) && meer(x + 1, yy))) { if (x > GW.burg[0] + GW.rx || Y === MAUER.y1) { if (Y === MAUER.y1) ostEnde = x; break; } continue; }   /* bis drei Reihen ganz im Meer liegen */
    if (!geh(x, Y) && !geh(x + 1, Y)) continue;   /* Fels: keine Mauer nötig */
    if (Y === MAUER.y0 && (imFels(x + 0.5, Y + 0.5) || imFels(x + 1.5, Y + 0.5))) continue;
    if (Y === MAUER.y1 && Math.abs(x + 1 - TOR_SUED) < 3) continue;
    ding("burg_mauer_quer", x + 1, Y + 1, { id: mid(), ...B }); }
  for (let y = MAUER.y0; y < MAUER.y1 - 1; y += 2) ding("burg_mauer_laengs", MAUER.x0, y + 2, { id: mid(), ...B });   /* ab y0: keine Lücke an der Ecke zur Nordmauer */
  for (const [x, y] of [[MAUER.x0, MAUER.y0], [MAUER.x0, MAUER.y1], [MAUER.x0, 5760]]) ding("burg_eckturm", x, y + 1.3, { id: mid(), ...B });
  ding("burg_torhaus", TOR_SUED, MAUER.y1 + 1, { id: "grauwacht_tor_sued", ...B }); ding("burg_torhaus_tief", 6726, 5761.5, { id: "grauwacht_tor_bruecke", ...B });
  grauwacht.mauer[2] = ostEnde;
  lies("grauwacht_tor_sued", TOR_SUED + 3, MAUER.y1 + 3, "Das Südtor von Grauwacht. Die Wacht hat es wieder besetzt – der Weg führt nach Heidrast.", B);
  npc.push({ id: "torwache_grauwacht_1", rolle: "Torwache (Südtor)", x: TOR_SUED - 3, y: MAUER.y1 + 3, ausbau: "burg" }, { id: "torwache_grauwacht_2", rolle: "Torwache (Brückentor)", x: 6724, y: 5764.5, ausbau: "burg" });
  /* Kaserne im Nordwesten mit Übungsplatz und Bankkiste */
  male(6650, 5740, 6684, 5749, () => "p");
  ding("grauwacht_kaserne_01", 6664, 5736, { id: "grauwacht_kaserne", ...B });   /* Modell von Figuren (#171) */ ding("dorf_wachturm_01", 6651, 5725, { id: "grauwacht_kaserne_turm", ...B });
  ding("steinhag_bankkiste", 6671.5, 5736.4, { id: "grauwacht_kaserne_bankkiste", ...B }); ding("k_banner_rot", 6658, 5738.4, B); ding("k_banner_rot", 6670, 5738.4, B);
  for (const [x, y] of [[6656, 5744], [6662, 5746], [6668, 5744]]) ding("dorf_heuballen_01", x, y, B);   /* Ziele am Übungsplatz */
  lies("grauwacht_kaserne", 6664, 5737.6, "Die Kaserne der Wacht. Drinnen hängen die Spieße in Reihen, draußen übt die Wache an Strohzielen.", B);
  lies("grauwacht_kaserne_bankkiste", 6671.5, 5737.8, "Die Bankkiste der Kaserne. Was du hier einlegst, liegt auf deinem Konto.", B);
  npc.push({ id: "hauptmann_kaserne", rolle: "Hauptmann der Wacht (Kaserne)", x: 6666, y: 5738.4, ausbau: "burg" }, { id: "rekrut_1", rolle: "Rekrut (übt)", x: 6659, y: 5743, ausbau: "burg" }, { id: "rekrut_2", rolle: "Rekrut (übt)", x: 6665, y: 5747.5, ausbau: "burg" });
  /* Taverne am Platz, Marktstände */
  ding("dorf_taverne_01", 6727, 5751, { id: "grauwacht_taverne", ...B }); lies("grauwacht_taverne", 6728.5, 5751.6, "Die Taverne „Zur Furt“. Wer über die Brücke kommt, kehrt hier zuerst ein.", B);
  stationen.push({ id: "herd_grauwacht_taverne", station: "herd", x: 6731, y: 5752.4 });
  for (const [i, [o, x, y]] of [["dorf_marktstand_03", 6698, 5756], ["dorf_marktstand_01", 6715.5, 5756.5]].entries()) { const st = baue(o, x, y, { id: "grauwacht_stand_" + (i + 3), ...B, rand: 0 }, 3); grauwacht.laeden.push({ id: st.id, art: "Marktstand", x: st.x, y: +(st.y + 1.2).toFixed(1), blick: [0, -1] }); }
  grauwacht.laeden.push({ id: "grauwacht_stand_1", art: "Marktstand (vorhanden)", x: 6702, y: 5746.4 }, { id: "grauwacht_stand_2", art: "Marktstand (vorhanden)", x: 6710, y: 5746.4 }, { id: "grauwacht_stand_waffen", art: "Waffenstand (vorhanden)", x: 6710.5, y: 5754.4 }, { id: "grauwacht_taverne", art: "Taverne", x: 6729, y: 5752.4 });
  /* Handwerkergasse im Süden: Gasse vom Südtor nach Osten, Werkstätten an der Nordseite */
  weg([[TOR_SUED, MAUER.y1 + 3], [TOR_SUED, 5801], [6744, 5801]], 2.4, "p"); weg([[6690, 5801], [6699, 5793]], 2, "p");
  const werk = [["grauwacht_gerberei_01", 6722, 5797, "grauwacht_gerberei", "Gerberei"], ["grauwacht_tischlerei_01", 6731, 5797, "grauwacht_tischlerei", "Tischlerei"], ["grauwacht_weberei_01", 6740, 5797, "grauwacht_weberei", "Weberei"]];   /* Werkstätten von Figuren (#171), Läden davor (shared/laeden.ts) */
  for (const [o, x, y, id, name] of werk) { const w = baue(o, x, y, { id, ...B, rand: 0 }, 4); lies(id, w.x, w.y + 1.6, `Die ${name} in der Handwerkergasse.`, B); grauwacht.laeden.push({ id, art: name, x: w.x, y: +(w.y + 1.2).toFixed(1), blick: [0, 1] }); }
  ding("hand_werkbank_01", 6735.5, 5798.4, { id: "grauwacht_tischlerei_werkbank", ...B }); stationen.push({ id: "werkbank_grauwacht_tischlerei", station: "werkbank", x: 6735.5, y: 5799.6 });
  /* Häuser: ausbau „burg“, an den Gassen, außerhalb von Abtei, Burgfelsen, Kaserne, Platz und Werkstatt-Hof */
  const FREI = [[6654, 5750, 6690, 5788], [6648, 5718, 6686, 5750], [6693, 5780, 6713, 5794], [6698, 5742, 6714, 5756]];
  const HAUS = ["grauwacht_buergerhaus_01", "grauwacht_buergerhaus_02", "graufurt_steinhaus_01", "dorf_haus_holz_01", "grauwacht_buergerhaus_01", "dorf_haus_holz_03", "dorf_huette_holz_01"];   /* Bürgerhäuser von Figuren (#171) */
  weg([[MAUER.x0 + 5, MAUER.y0 + 6], [MAUER.x0 + 5, MAUER.y1 - 4]], 2, "p"); weg([[6714, 5786], [6744, 5786]], 2, "p"); weg([[6726, 5786], [6726, 5764]], 2, "p"); weg([[MAUER.x0 + 6, 5801], [TOR_SUED, 5801]], 2.4, "p"); weg([[6726, 5772], [6746, 5772]], 2, "p");   /* Mauergasse im Westen, Gassen im Osten */
  let neu = 0; const SOLL = 42;
  for (const pass of [4, 8]) for (let y = MAUER.y0 + 5; y < MAUER.y1 - 2 && neu < SOLL; y++) for (let x = MAUER.x0 + 4; x < ostEnde - 3 && neu < SOLL; x++) {
    if (x > ostEnde - 4 || imFels(x, y - 2) || Math.hypot((x - GW.burg[0]) / (GW.rx + 4), (y - GW.burg[1]) / (GW.ry + 4)) < 1) continue;
    const o = wahl(HAUS), s = +(0.95 + wurf() * 0.1).toFixed(2); if (!passt(o, x, y, s, { frei: FREI })) continue;
    let vorn = false; for (let v = 1; v <= pass && !vorn; v++) for (let u = -1; u <= 1; u++) if ("pke".includes(jetzt(x + u, y + v))) vorn = true; if (!vorn) continue;
    let nass_ = false; for (let v = -5; v <= 2 && !nass_; v++) for (let u = -4; u <= 4; u++) if (nass(jetzt(x + u, y + v))) nass_ = true; if (nass_) continue;   /* nicht direkt ans Ufer */
    ding(o, x, y, { s, ...B }); neu++; }
  grauwacht.gebaeude = objekte.filter((o) => BIB.get(o.objekt)?.kategorie === "gebaeude").length + FW.objekte.filter((o) => BIB.get(o.objekt)?.kategorie === "gebaeude" && o.x > MAUER.x0 && o.x < ostEnde && o.y > MAUER.y0 - 20 && o.y < MAUER.y1).length;
  /* Fischplatz an der Ufermauer (Hering), Laternen */
  uferplatz("fischplatz_grauwacht", "hering", 20, 6738, 5778, "An der Kaimauer von Grauwacht beißen die Heringe aus dem Sund.");
  for (const [x, y] of [[6690, 5803], [6712, 5803], [6734, 5803], [6684, 5750]]) ding("dorf_laterne_01", x, y, B);
  banken.push({ id: "grauwacht_bank", ort: "Grauwacht", gebaeude: "grauwacht_bank", schalter: [6716, 5731.4], vorhanden: true, ausbau: "burg" }, { id: "grauwacht_kaserne_bankkiste", ort: "Grauwacht", kiste: [6671.5, 5737.8], ausbau: "burg" });
  orte.grauwacht = GW.platz; }

/* ═══════════════════════ Neue Orte ═══════════════════════ */
const ORT_REIF = [6424, 5722];
const ORT = { huegelgrund: [6165, 5800], kohlstatt: [6420, 5878], brechstein: [6656, 5946], wollhag: [6570, 5738], weiherhof: [6340, 5834] };
Object.assign(orte, ORT);
/* ───── Hügelgrund: Dorf im Westen (Bank, Laden, Gasthaus mit Herd, Kräuterbeet) ───── */
{ const [cx, cy] = ORT.huegelgrund; ortsboden(cx, cy, 26, 20); eben.push([cx - 22, cy - 16, cx + 22, cy + 16]);
  male(cx - 6, cy - 4, cx + 6, cy + 4, (x, y) => (Math.hypot((x - cx) / 6, (y - cy) / 4) < 1 ? "p" : null));
  weg([[cx - 24, cy + 6], [cx + 26, cy + 6]], 2.2, "k"); weg([[cx, cy + 4], [cx, cy + 6]], 2, "k");
  ding("dorf_brunnen_01", cx, cy - 0.5, { id: "huegelgrund_brunnen" });
  const bank = baue("waldmark_bank_01", cx - 12, cy + 3, { id: "huegelgrund_bank" }); lies("huegelgrund_bank_tuer", bank.x, bank.y + 0.6, "Die Bank von Hügelgrund – ein Steinhaus mit Eisengittern vor den Fenstern.");
  const gast = baue("dorf_taverne_01", cx + 12, cy + 3, { id: "huegelgrund_gasthaus" }); lies("huegelgrund_gasthaus", gast.x + 1.5, gast.y + 0.6, "Das Gasthaus „Zum Hügelgrab“. Am Herd brodelt Graupensuppe.");
  ding("hand_herd_01", gast.x + 6.5, gast.y + 2, { id: "huegelgrund_herd" }); stationen.push({ id: "herd_huegelgrund", station: "herd", x: gast.x + 6.5, y: gast.y + 3.4 });
  const laden = baue("dorf_marktstand_02", cx - 2, cy + 9.5, { id: "huegelgrund_laden", rand: 0 }); laeden.push({ id: "huegelgrund_laden", ort: "Hügelgrund", art: "Marktstand", x: laden.x, y: +(laden.y + 1.2).toFixed(1), blick: [0, -1] });
  for (const [o, dx, dy] of [["graufurt_steinhaus_01", -20, -6], ["dorf_haus_holz_01", -10, -10], ["weidenhain_kate_01", 10, -10], ["dorf_haus_holz_03", 20, -6], ["graufurt_steinhaus_02", -18, 16], ["dorf_huette_holz_01", 6, 16], ["weidenhain_bauernhaus_01", 18, 16]]) baue(o, cx + dx, cy + dy);
  male(cx - 6, cy + 13, cx + 2, cy + 17, () => "a"); ["wegerich", "ringelblume", "wegerich", "ringelblume"].forEach((a, i) => kraut(`huegelgrund_${a}_${i + 1}`, a, cx - 5 + i * 2, cy + 15));   /* Kräuterbeet */
  lies("huegelgrund", cx + 2.5, cy + 1.6, "Hügelgrund. Ein Dorf zwischen den alten Hügelgräbern und dem stillen Kernbaum-Tal – die Leute hier grüßen die Toten, bevor sie die Lebenden grüßen.");
  banken.push({ id: "huegelgrund_bank", ort: "Hügelgrund", gebaeude: "huegelgrund_bank", schalter: [bank.x, bank.y + 1.4] });
  npc.push({ id: "wirtin_huegelgrund", rolle: "Wirtin (Gasthaus)", x: gast.x + 1.5, y: gast.y + 1.6 }, { id: "bankier_huegelgrund", rolle: "Bank", x: bank.x, y: bank.y + 1.4 }, { id: "haendler_huegelgrund", rolle: "Händler (Laden)", x: laden.x, y: laden.y + 1.2 }, { id: "kraeuterin_huegelgrund", rolle: "Kräuterin (Beet)", x: cx - 7, y: cy + 15 });
  namen.push(["Hügelgrund", "Dorf", cx, cy]);
  /* Wege: um das Kernbaum-Tal herum an den Talweg, nach Westen zur Küste */
  weg([[cx + 24, cy + 6], [6214, 5808], [6250, 5802], [6262, 5786], [6252, 5780]], 1.8); }

/* ───── Kohlstatt: Köhlerdorf am Waldrand (Holz) ───── */
{ const [cx, cy] = ORT.kohlstatt; ortsboden(cx, cy, 18, 13); eben.push([cx - 15, cy - 10, cx + 15, cy + 10]);
  for (const [i, [dx, dy]] of [[-8, 6], [8, 7]].entries()) { const m = baue("wald_meiler_01", cx + dx, cy + dy, { id: "kohlstatt_meiler_" + (i + 1), rand: 0 }, 4); }
  ding("dorf_festfeuer_01", cx, cy + 1, { id: "kohlstatt_feuer" }); stationen.push({ id: "feuer_kohlstatt", station: "feuer", x: cx, y: cy + 2.6 });
  for (const [o, dx, dy] of [["dorf_huette_holz_01", -12, -5], ["dorf_haus_holz_01", -3, -8], ["dorf_huette_holz_02", 7, -6], ["dorf_haus_holz_03", 14, -2], ["dorf_schuppen_holz_01", -14, 10]]) baue(o, cx + dx, cy + dy);
  baue("dorf_holzstapel_01", cx + 3, cy + 9, { rand: 0 }, 4); baue("dorf_holzstapel_01", cx - 4, cy + 11, { rand: 0 }, 4);
  const kiste = baue("steinhag_bankkiste", cx + 4, cy + 3, { id: "kohlstatt_bankkiste", rand: 0 }, 7); lies("kohlstatt_bankkiste", kiste.x, kiste.y + 1.4, "Die Bankkiste der Köhler – rußig, aber dicht. Was du einlegst, liegt auf deinem Konto.");
  const laden = baue("dorf_marktstand_03", cx - 5, cy + 3, { id: "kohlstatt_laden", rand: 0 }, 4); laeden.push({ id: "kohlstatt_laden", ort: "Kohlstatt", art: "Marktstand (Holzkohle, Beile)", x: laden.x, y: +(laden.y + 1.2).toFixed(1), blick: [0, -1] });
  lies("kohlstatt", cx + 1.5, cy + 3.4, "Kohlstatt. Die Meiler qualmen Tag und Nacht, und alles hier riecht nach Rauch und Harz.");
  banken.push({ id: "kohlstatt_bankkiste", ort: "Kohlstatt", kiste: [kiste.x, kiste.y + 1.4] });
  npc.push({ id: "koehler_kohlstatt", rolle: "Köhler (Meiler)", x: cx - 6, y: cy + 4 }, { id: "haendlerin_kohlstatt", rolle: "Händlerin (Laden)", x: laden.x, y: laden.y + 1.2 });
  namen.push(["Kohlstatt", "Dorf", cx, cy]);
  weg([[cx, cy - 10], [6416, 5840], [6404, 5800], [6400, 5779]], 1.8); weg([[cx + 16, cy + 1], [6470, 5884], [6530, 5880], [6584, 5873]], 1.8); }

/* ───── Brechstein: Steinbrecher-Weiler am Grauen Fels (Erz) ───── */
{ const [cx, cy] = ORT.brechstein; ortsboden(cx, cy, 16, 12); eben.push([cx - 12, cy - 9, cx + 14, cy + 9]);
  for (const [o, dx, dy, id] of [["graufurt_steinhaus_01", 0, -7], ["graufurt_steinhaus_02", 10, -5], ["moor_kate_02", 12, 7], ["dorf_schmiede_01", -2, 8, "brechstein_schmiede"]]) baue(o, cx + dx, cy + dy, id ? { id } : {});
  const sm = objekte.find((o) => o.id === "brechstein_schmiede"); stationen.push({ id: "esse_brechstein", station: "esse", x: sm.x - 1.5, y: sm.y + 1.4 }, { id: "amboss_brechstein", station: "amboss", x: sm.x + 1.5, y: sm.y + 1.4 });
  lies("brechstein_schmiede", sm.x, sm.y + 1.6, "Die Schmiede der Steinbrecher: Meißel schärfen, Keile richten, Hacken härten.");
  baue("hochland_lore", cx - 8, cy, { id: "brechstein_lore", rand: 0 }, 3); baue("k_truemmer", cx - 10, cy - 4, { rand: 0 }, 3); baue("k_truemmer", cx - 11, cy + 4, { rand: 0, spiegeln: true }, 3);
  const kiste = baue("steinhag_bankkiste", cx + 5, cy + 1, { id: "brechstein_bankkiste", rand: 0 }, 7); lies("brechstein_bankkiste", kiste.x, kiste.y + 1.4, "Die Bankkiste der Steinbrecher. Was du einlegst, liegt auf deinem Konto.");
  const laden = baue("dorf_marktstand_01", cx + 2, cy + 3, { id: "brechstein_laden", rand: 0 }, 4); laeden.push({ id: "brechstein_laden", ort: "Brechstein", art: "Marktstand (Hacken, Erz)", x: laden.x, y: +(laden.y + 1.2).toFixed(1), blick: [0, -1] });
  lies("brechstein", cx + 3, cy - 1.4, "Brechstein. Hier wird der Graue Fels Stück für Stück abgetragen – und manchmal kommt eine Ader zum Vorschein.");
  banken.push({ id: "brechstein_bankkiste", ort: "Brechstein", kiste: [kiste.x, kiste.y + 1.4] });
  npc.push({ id: "steinbrecher_brechstein", rolle: "Steinbrecherin", x: cx - 6, y: cy + 1.5 }, { id: "haendler_brechstein", rolle: "Händler (Laden)", x: laden.x, y: laden.y + 1.2 });
  namen.push(["Brechstein", "Ort", cx, cy]); weg([[cx - 14, cy - 1], [6614, 5944]], 1.8); }

/* ───── Wollhag: Schäferei auf der Heide (Wolle, Fleisch) ───── */
{ const [cx, cy] = ORT.wollhag; ortsboden(cx, cy, 18, 13); eben.push([cx - 14, cy - 10, cx + 14, cy + 10]);
  for (const [o, dx, dy, id] of [["weidenhain_bauernhaus_01", -6, -4, "wollhag_hof"], ["dorf_scheune_holz_01", 8, -5, "wollhag_scheune"], ["weidenhain_kate_01", -14, 4], ["dorf_huette_holz_02", 12, 6]]) baue(o, cx + dx, cy + dy, id ? { id } : {});
  /* Pferch im Süden (Zaun ringsum, Gatter nach Norden) */
  const P = [cx - 8, cy + 6, cx + 6, cy + 14];
  for (let x = P[0] + 1.2; x <= P[2] - 1.2 + 0.01; x += 2.4) { if (Math.abs(x - (P[0] + P[2]) / 2) > 2) ding("k_zaun", x, P[1]); ding("k_zaun", x, P[3]); }
  male(P[0], P[1], P[2], P[3], (x, y) => (welle(x, y) > 0.3 ? "t" : "."));
  ding("dorf_heuballen_01", P[2] + 2, P[1] + 2); ding("dorf_heuballen_01", P[2] + 2.5, P[1] + 4);
  const kiste = baue("steinhag_bankkiste", cx + 3, cy, { id: "wollhag_bankkiste", rand: 0 }, 7); lies("wollhag_bankkiste", kiste.x, kiste.y + 1.4, "Die Bankkiste der Schäferei. Was du einlegst, liegt auf deinem Konto.");
  const laden = baue("dorf_marktstand_02", cx - 3, cy + 1, { id: "wollhag_laden", rand: 0 }, 3); laeden.push({ id: "wollhag_laden", ort: "Wollhag", art: "Marktstand (Wolle, Käse)", x: laden.x, y: +(laden.y + 1.2).toFixed(1), blick: [0, -1] });
  ding("hand_kessel_01", cx + 6, cy + 2, { id: "wollhag_kessel" }); stationen.push({ id: "kessel_wollhag", station: "kessel", x: cx + 6, y: cy + 3.4 });
  lies("wollhag", cx, cy - 0.5, "Wollhag. Eine Schäferei mitten auf der Heide – im Frühjahr wird hier geschoren, dass die Wolle wie Schnee über die Weiten fliegt.");
  lies("wollhag_pferch", (P[0] + P[2]) / 2, P[1] - 1.4, "Der Pferch der Schäferei. Die Schafe drängen sich an den Zaun, sobald jemand kommt.");
  banken.push({ id: "wollhag_bankkiste", ort: "Wollhag", kiste: [kiste.x, kiste.y + 1.4] });
  npc.push({ id: "schaeferin_wollhag", rolle: "Schäferin", x: cx - 1, y: cy + 2.5 }, { id: "scherer_wollhag", rolle: "Schafscherer", x: cx + 8, y: cy + 1 },
    ...[[-5, 9], [-2, 11], [1, 9], [3, 12], [-6, 12]].map(([dx, dy], i) => ({ id: "wollhag_schaf_" + (i + 1), rolle: "Schaf (Stimmung)", x: cx + dx, y: cy + dy })));
  namen.push(["Wollhag", "Ort", cx, cy]);
  weg([[cx + 14, cy], [6620, 5768], [6650, 5818], [TOR_SUED - 4, MAUER.y1 + 4]], 1.8); weg([[cx - 14, cy + 2], [6530, 5752], [6500, 5762]], 1.8); }

/* ───── Weiherhof: Fischerhof am Weiher (Fischen) ───── */
{ const [cx, cy] = ORT.weiherhof; ortsboden(cx, cy, 22, 15); eben.push([cx - 18, cy - 12, cx + 18, cy + 4]);
  const W = [cx + 2, cy + 10, 12, 6];   /* der Weiher südlich vom Hof */
  male(W[0] - W[2] - 3, W[1] - W[3] - 3, W[0] + W[2] + 3, W[1] + W[3] + 3, (x, y) => { const d = Math.hypot((x - W[0]) / W[2], (y - W[1]) / W[3]) + 0.06 * welle(x, y); if (d < 1.3) hebe(x, y, -0.6 * Math.max(0, 1.3 - d)); return d < 1 ? "w" : d < 1.18 ? (welle(x, y) > 0 ? "s" : "v") : null; });
  for (const [o, dx, dy, id] of [["weidenhain_bauernhaus_01", -6, -6, "weiherhof_hof"], ["moor_fischer_01", 8, -4, "weiherhof_fischerkate"], ["dorf_huette_holz_01", -16, -2], ["moor_kate_01", 16, -8]]) baue(o, cx + dx, cy + dy, id ? { id } : {});
  { let lx = W[0] - W[2]; while (nass(jetzt(lx - 0.5, W[1]))) lx--; const sx = lx - 2 + 4.9; ding("dorf_bruecke_01", sx, W[1] + 1.3, { id: "weiherhof_steg" }); freigeben.push({ art: "rechteck", x0: +(sx - 4.9).toFixed(2), y0: +(W[1] - 1.3).toFixed(2), x1: +(sx + 3).toFixed(2), y1: +(W[1] + 1.3).toFixed(2) }); }   /* Steg vom Westufer hinein */
  ding("kueste_netze", cx + 12, cy - 1, { id: "weiherhof_netze" }); ding("kueste_raeucherhuette", cx - 10, cy + 2, { id: "weiherhof_raeucherhuette" }); stationen.push({ id: "raeucherhuette_weiherhof", station: "raeucherhuette", x: cx - 10, y: cy + 3.6 });
  const kiste = baue("steinhag_bankkiste", cx + 3, cy - 1, { id: "weiherhof_bankkiste", rand: 0 }, 7); lies("weiherhof_bankkiste", kiste.x, kiste.y + 1.4, "Die Bankkiste vom Weiherhof. Was du einlegst, liegt auf deinem Konto.");
  const laden = baue("dorf_marktstand_03", cx - 3, cy + 0.5, { id: "weiherhof_laden", rand: 0 }, 3); laeden.push({ id: "weiherhof_laden", ort: "Weiherhof", art: "Marktstand (Fisch, Angeln)", x: laden.x, y: +(laden.y + 1.2).toFixed(1), blick: [0, -1] });
  uferplatz("fischplatz_weiherhof_steg", "moorhecht", 20, W[0] - W[2] - 1, W[1] - 2, "Am Westufer, neben dem Steg, beißen die Moorhechte.");
  uferplatz("fischplatz_weiherhof_ost", "muehlbarsch", 10, W[0] + W[2] + 1, W[1], "Am Ostufer des Weihers ziehen Mühlbarsche.");
  uferplatz("fischplatz_weiherhof_sued", "wels", 45, W[0] + 2, W[1] + W[3] + 1, "In der tiefen Mitte des Weihers steht ein alter Wels.");
  lies("weiherhof", cx + 1, cy - 0.6, "Der Weiherhof. Ein Fischerhof an einem dunklen Weiher – das einzige stehende Wasser weit und breit.");
  banken.push({ id: "weiherhof_bankkiste", ort: "Weiherhof", kiste: [kiste.x, kiste.y + 1.4] });
  npc.push({ id: "fischer_weiherhof", rolle: "Fischer (Steg)", x: W[0] - 4, y: W[1] - W[3] - 1 }, { id: "haendlerin_weiherhof", rolle: "Händlerin (Laden)", x: laden.x, y: laden.y + 1.2 });
  namen.push(["Weiherhof", "Ort", cx, cy]); weg([[cx, cy - 12], [6342, 5800], [6344, 5787]], 1.8); }

/* ───── Heidrast etwas größer: drei Katen dazu, Bankkiste am Brunnen ───── */
{ const [cx, cy] = [6596, 5872];
  for (const [o, dx, dy] of [["weidenhain_kate_01", -4, -14], ["dorf_huette_holz_02", 17, -2], ["moor_kate_01", -18, -1]]) baue(o, cx + dx, cy + dy, { id: `heidrast_kate_${dx < 0 ? "w" : "o"}_${Math.abs(dy)}` }, 6);
  const kiste = baue("steinhag_bankkiste", cx + 3, cy - 2, { id: "heidrast_bankkiste", rand: 0 }, 7); lies("heidrast_bankkiste", kiste.x, kiste.y + 1.4, "Die Bankkiste von Heidrast, an den Brunnen gekettet. Was du einlegst, liegt auf deinem Konto.");
  banken.push({ id: "heidrast_bankkiste", ort: "Heidrast", kiste: [kiste.x, kiste.y + 1.4] });
  ["wegerich", "ringelblume"].forEach((a, i) => kraut(`heidrast_${a}_1`, a, cx - 8 + i * 16, cy + 12)); }

/* ───── Reifbach (#171 Schritt 2): Fischerweiler an einem Bach, der in die Bucht der Nordküste fällt ───── */
{ const BACH = [[6394, 5764], [6390, 5748], [6398, 5732], [6404, 5718], [6408, 5704]], [cx, cy] = [6424, 5722];
  male(6378, 5698, 6420, 5770, (x, y) => { const d = strecke(x, y, BACH) + 0.25 * welle(x, y); return nass(jetzt(x, y)) ? null : d < 1.1 ? "~" : d < 2.3 ? (welle(x, y) > 0.2 ? "s" : ".") : null; });
  ortsboden(cx, cy, 16, 12); eben.push([cx - 12, cy - 9, cx + 14, cy + 10]); orte.reifbach = [cx, cy]; namen.push(["Reifbach", "Ort", cx, cy]);
  for (const [o, dx, dy, id] of [["moor_fischer_01", -4, -4, "reifbach_kate_1"], ["moor_fischer_01", 6, -6, "reifbach_kate_2"], ["moor_kate_01", 10, 4], ["weidenhain_kate_01", -2, 8]]) baue(o, cx + dx, cy + dy, id ? { id } : {}, 6);
  const r = baue("kueste_raeucherhuette", cx + 2, cy + 1, { id: "reifbach_raeucherhuette", rand: 0 }, 5), f = baue("dorf_festfeuer_01", cx + 6, cy + 2, { id: "reifbach_feuer", rand: 0 }, 4);
  stationen.push({ id: "raeucherhuette_reifbach", station: "raeucherhuette", x: r.x, y: r.y + 1.6 }, { id: "feuer_reifbach", station: "feuer", x: f.x, y: f.y + 1.6 });
  const kiste = baue("steinhag_bankkiste", cx - 6, cy + 2, { id: "reifbach_bankkiste", rand: 0 }, 6); lies("reifbach_bankkiste", kiste.x, kiste.y + 1.4, "Die Bankkiste von Reifbach, salzverkrustet. Was du einlegst, liegt auf deinem Konto.");
  banken.push({ id: "reifbach_bankkiste", ort: "Reifbach", kiste: [kiste.x, kiste.y + 1.4] });
  const st = baue("dorf_marktstand_03", cx + 2, cy + 6, { id: "reifbach_laden", rand: 0 }, 5); laeden.push({ id: "reifbach_laden", ort: "Reifbach", art: "Räucherfisch, Angelzeug", x: st.x, y: +(st.y + 1.2).toFixed(1), blick: [0, -1] });
  ding("kueste_netze", cx + 12, cy - 2, { id: "reifbach_netze" });
  lies("reifbach", cx + 1.5, cy + 3.6, "Reifbach. Wo der kalte Bach ins Meer fällt, räuchern drei Familien ihren Fang – im Winter liegt Reif auf den Netzen.");
  npc.push({ id: "fischerin_reifbach", rolle: "Fischerin (Räucherfeuer)", x: f.x - 1.5, y: f.y + 1.6 }, { id: "haendler_reifbach", rolle: "Händler (Laden)", x: st.x, y: st.y + 1.2 });
  uferplatz("fischplatz_reifbach_bach", "bachling", 1, 6396, 5745, "Im Reifbach schießen kleine Bachlinge zwischen den Steinen.");
  uferplatz("fischplatz_reifbach_bach_unten", "muehlbarsch", 10, 6404, 5722, "Am Unterlauf des Reifbachs stehen Mühlbarsche.");
  uferplatz("fischplatz_reifbach_bucht", "hering", 20, 6414, 5708, "In der Bucht vor Reifbach ziehen Heringsschwärme.");
  ["wegerich", "ringelblume"].forEach((a, i) => kraut(`reifbach_${a}_1`, a, cx - 10 + i * 20, cy - 10));
  weg([[cx, cy + 9], [6418, 5750], [6412, 5776]], 1.8); weg([[cx + 14, cy + 1], [6480, 5730], [6530, 5752]], 1.8); }

/* ───── Rastplätze an den langen Wegen ───── */
for (const [id, x, y] of [["rast_talweg", 6300, 5790], ["rast_graeberweg", 6532, 5838], ["rast_nordweg", 6624, 6010]]) {
  let px = x, py = y; for (let r = 0; r < 12; r++) { if (passt("dorf_festfeuer_01", x + r, y + 2, 1, { rand: 1 })) { px = x + r; py = y + 2; break; } if (passt("dorf_festfeuer_01", x - r, y + 3, 1, { rand: 1 })) { px = x - r; py = y + 3; break; } }
  ding("dorf_festfeuer_01", px, py, { id: id + "_feuer" }); ding("wald_baumstamm_01", px - 2.5, py + 1.5, { id: id + "_stamm", s: 0.8 });
  lies(id, px + 0.5, py + 2.4, "Ein Rastplatz am Weg. Asche im Steinring, ein Stamm zum Sitzen – Hirten und Händler ruhen hier."); rast.push(id); }

/* ───── Kräuter an den Orten und auf der Heide ───── */
for (const [k, [cx, cy]] of Object.entries(ORT)) if (k !== "huegelgrund") ["wegerich", "ringelblume"].forEach((a, i) => kraut(`${k}_${a}_1`, a, cx - 10 + i * 20, cy - 12));
[[6500, 5720], [6380, 5740], [6560, 5800], [6260, 5840]].forEach(([x, y], i) => kraut(`fahleweiten_${i % 2 ? "nebelkraut" : "eisenhut"}_${i + 1}`, i % 2 ? "nebelkraut" : "eisenhut", x, y));
/* Küstenfische an der Nordküste bei Wollhag (Klippenbarsch) */
uferplatz("fischplatz_nordkueste_wollhag", "klippenbarsch", 35, 6560, 5690, "An der Nordküste der Fahlen Weiten stehen Klippenbarsche zwischen den Steinen.");

/* ═══════════════════════ Westwald (Leitstelle 28.11., freigegeben): Pechtann – Harzsammler und Pechsieder, eine Jägerin ═══════════════════════
   Lichtung östlich der Heidewölfe (Streifgebiet E2 bleibt frei), Wege nach Osten (Straße bei 6642|6080, nicht durch den Grenzposten), Nordosten (Straße → Brechstein),
   Süden (Alte Wachruine → Gehöft) und Westen (Harzpfad zur Küste); unterwegs Harzlichtung, die Verfallene Pechhütte und ein Jägerlager. */
const PT = { dorf: [6470, 6095], lichtung: [6230, 6045], huette: [6200, 6126], lager: [6402, 6172] }, WOELFE = [6286, 5954, 6417, 6085];
orte.pechtann = PT.dorf; orte.harzlichtung = PT.lichtung;
{ const [cx, cy] = PT.dorf; ortsboden(cx, cy, 22, 15); eben.push([cx - 18, cy - 12, cx + 18, cy + 12]);
  /* Wege zuerst (die Häuser stehen an ihnen) */
  weg([[cx + 20, cy - 2], [6540, cy - 6], [6600, 6084], [6642, 6080]], 2);                       /* Ost: zur Straße Grauwacht–Heidrast */
  weg([[cx + 6, cy - 14], [6500, 6040], [6560, 5996], [6612, 5972]], 1.8);                       /* Nordost: Waldpfad zur Straße (→ Brechstein) */
  weg([[cx - 6, cy + 14], [6440, 6140], PT.lager, [6360, 6206], [6326, 6228]], 1.8);            /* Süd: über das Jägerlager zur Alten Wachruine */
  weg([[cx - 21, cy + 2], [6420, 6104], [6340, 6102], [6280, 6080], PT.lichtung, [6196, 6056], [6176, 6060]], 1.6);   /* West: Harzpfad bis an die Küste */
  weg([[6262, 6086], [6226, 6106], [PT.huette[0] + 2, PT.huette[1] - 2]], 1.4);               /* Abzweig zur Pechhütte */
  /* Pechsiederei: Kessel (Station), Fässer, Meiler */
  const kessel = baue("hand_kessel_01", cx - 6, cy + 4, { id: "pechtann_pechkessel", rand: 0 }, 5); stationen.push({ id: "kessel_pechtann", station: "kessel", x: kessel.x, y: kessel.y + 1.4 });
  lies("pechtann_pechsiederei", kessel.x + 1.6, kessel.y + 1.2, "Die Pechsiederei. Im Kessel brodelt Harz zu Pech – für Fackeln, Fässer und die Bootsbauer in Kielmund.");
  for (const [o, dx, dy] of [["k_faesser", -10, 6], ["dorf_fass_01", -2, 7], ["k_faesser", -11, 1]]) try { baue(o, cx + dx, cy + dy, { rand: 0 }, 3); } catch { /* kein Platz */ }
  baue("wald_meiler_01", cx + 11, cy + 8, { id: "pechtann_meiler", rand: 0 }, 5);
  for (const [o, dx, dy, id] of [["dorf_haus_holz_01", -12, -7, "pechtann_pechsieder_haus"], ["dorf_huette_holz_01", 10, -8, "pechtann_jaegerhuette"], ["dorf_haus_holz_03", -2, -10], ["dorf_huette_holz_02", 15, 2], ["dorf_haus_holz_02", -16, 8], ["dorf_schuppen_holz_01", 4, 11], ["dorf_huette_holz_01", -7, 12]])
    try { baue(o, cx + dx, cy + dy, id ? { id } : {}, 6); } catch { /* weniger Häuser */ }
  baue("dorf_holzstapel_01", cx + 7, cy - 3, { rand: 0 }, 4); baue("dorf_festfeuer_01", cx + 1, cy + 2, { id: "pechtann_feuer", rand: 0 }, 3);
  const kiste = baue("steinhag_bankkiste", cx + 5, cy + 4, { id: "pechtann_bankkiste", rand: 0 }, 6); lies("pechtann_bankkiste", kiste.x, kiste.y + 1.4, "Die Bankkiste von Pechtann – mit Pech versiegelt. Was du einlegst, liegt auf deinem Konto.");
  banken.push({ id: "pechtann_bankkiste", ort: "Pechtann", kiste: [kiste.x, kiste.y + 1.4] });
  const laden = baue("dorf_marktstand_02", cx - 3, cy - 3, { id: "pechtann_laden", rand: 0 }, 5); laeden.push({ id: "pechtann_laden", ort: "Pechtann", art: "Pech und Pfeile (Pech, Fackeln, Pfeile, Felle)", x: laden.x, y: +(laden.y + 1.2).toFixed(1), blick: [0, -1] });
  lies("pechtann", cx + 2.5, cy + 0.4, "Pechtann. Ein Dorf der Harzsammler mitten im Westwald – die Kiefern weinen hier Harz, und die Leute machen Pech daraus.");
  const jh = objekte.find((o) => o.id === "pechtann_jaegerhuette"); if (jh) lies("pechtann_jaegerhuette", jh.x, jh.y + 1.4, "Die Hütte der Jägerin. Felle hängen zum Trocknen, an der Wand lehnt ein Bogen.");
  npc.push({ id: "jaegerin_pechtann", rolle: "Jägerin (Aufgabe: Wildschweine)", x: (jh?.x ?? cx + 10) + 1.5, y: (jh?.y ?? cy - 8) + 2.2 },
    { id: "pechsieder_pechtann", rolle: "Pechsieder (Aufgabe: Harzeimer)", x: kessel.x - 1.5, y: kessel.y + 1.6 }, { id: "haendlerin_pechtann", rolle: "Händlerin (Laden)", x: laden.x, y: laden.y + 1.2 });
  namen.push(["Pechtann", "Dorf", cx, cy]);
  kraut("pechtann_moorgloeckchen_1", "moorgloeckchen", cx - 18, cy - 4); kraut("pechtann_eisenhut_1", "eisenhut", cx + 18, cy + 8); }
/* Harzlichtung am Harzpfad: Lichtung (Holz setzt sammelstellen.mjs), Kräuter, ein Rastplatz */
{ const [cx, cy] = PT.lichtung; male(cx - 12, cy - 9, cx + 12, cy + 9, (x, y) => (Math.hypot((x - cx) / 11, (y - cy) / 8) + 0.08 * welle(x, y) < 1 && jetzt(x, y) === "f" ? (welle(x, y) > 0.9 ? "," : ".") : null));
  const f = baue("dorf_festfeuer_01", cx + 4, cy + 3, { id: "rast_harzlichtung_feuer", rand: 0 }, 5); try { baue("wald_baumstamm_01", f.x - 2.5, f.y + 1.5, { id: "rast_harzlichtung_stamm", s: 0.8, rand: 0 }, 3); } catch { }
  lies("rast_harzlichtung", f.x + 0.5, f.y + 2.4, "Die Harzlichtung. An den Stämmen ringsum sind Rinnen geschnitten, darunter hängen Eimer – manche voll, manche umgestoßen."); rast.push("rast_harzlichtung");
  kraut("harzlichtung_ringelblume_1", "ringelblume", cx - 6, cy + 2); kraut("harzlichtung_moorgloeckchen_1", "moorgloeckchen", cx + 8, cy - 4); namen.push(["Harzlichtung", "Ort", cx, cy]); }
/* Verfallene Pechhütte: Ruine, umgestürzte Fässer – Ort der Aufgabe „Die verlorenen Harzeimer“ */
{ const [cx, cy] = PT.huette; male(cx - 7, cy - 6, cx + 7, cy + 6, (x, y) => (Math.hypot((x - cx) / 6, (y - cy) / 5) < 1 && jetzt(x, y) === "f" ? "." : null));
  for (const [o, dx, dy] of [["k_ruine_mauer", -2, -1], ["k_ruine_turmstumpf", 3, -2], ["k_truemmer", 1, 2], ["k_faesser", -4, 2]]) try { baue(o, cx + dx, cy + dy, { rand: 0 }, 3); } catch { }
  lies("pechhuette", cx, cy + 3.2, "Die Verfallene Pechhütte. Das Dach ist eingestürzt, der Kessel gesprungen. Zwischen den Trümmern liegen Harzeimer – jemand hat sie hier zurückgelassen.");
  npc.push({ id: "pechhuette_harzeimer", rolle: "Questplatz: Harzeimer (Quests)", x: cx + 2, y: cy + 3.5 }); namen.push(["Verfallene Pechhütte", "Ruine", cx, cy]); }
/* Jägerlager am Südweg: Zelt, Feuer, Spuren */
{ const [cx, cy] = PT.lager; const z = baue("welt_zelt_01", cx - 4, cy - 3, { id: "jaegerlager_zelt", rand: 0 }, 5); const f = baue("dorf_festfeuer_01", cx + 2, cy - 2, { id: "jaegerlager_feuer", rand: 0 }, 4);
  stationen.push({ id: "feuer_jaegerlager", station: "feuer", x: f.x, y: f.y + 1.6 });
  for (const [dx, dy] of [[6, 3], [9, 5], [12, 8]]) try { baue("welt_spuren_01", cx + dx, cy + dy, { rand: 0 }, 2); } catch { }
  lies("jaegerlager", f.x + 0.5, f.y + 2.4, "Ein Jägerlager. Die Spuren führen nach Westen – Wildschweine, dem Wühlen nach eine ganze Rotte."); rast.push("jaegerlager"); namen.push(["Jägerlager", "Ort", cx, cy]); }
/* das Streifgebiet der Heidewölfe (WOELFE) bleibt frei – Test welt-fahleweiten-fuellen */

/* ───── schreiben ───── */
const keys = [...feld.keys()].map((k) => k.split(",").map(Number)), X0 = Math.min(...keys.map((k) => k[0])), Y0 = Math.min(...keys.map((k) => k[1])), X1 = Math.max(...keys.map((k) => k[0])), Y1 = Math.max(...keys.map((k) => k[1]));
const patches = []; for (let ya = Y0; ya <= Y1; ya += 64) { const zeilen = []; for (let y = ya; y < Math.min(ya + 64, Y1 + 1); y++) { let s = ""; for (let x = X0; x <= X1; x++) s += feld.get(x + "," + y) || " "; zeilen.push(s.replace(/ +$/, "")); } if (zeilen.some((s) => s.trim())) patches.push({ x0: X0, y0: ya, zeilen }); }
const hoehenListe = [...hoehen].filter(([, h]) => Math.abs(h) > 0.02).map(([k, h]) => [...k.split(",").map(Number), +h.toFixed(2)]);
writeFileSync(join(WELT, "festland", "plan_fahleweiten_fuellen.json"), JSON.stringify({ hinweis: "Erzeugt von werkzeug/welt/fahleweiten_fuellen.mjs (#171): Grauwacht als mittlere Hauptstadt (ausbau burg), Hügelgrund, Kohlstatt, Brechstein, Wollhag, Weiherhof, Heidrast größer. Weltfelder.", gelaende: patches, hoehen: hoehenListe, eben, objekte, interaktionen, sperren, freigeben }) + "\n");
for (const [k, g] of urs) if (!alt.has(k)) alt.set(k, g);
writeFileSync(GRUNDDATEI, JSON.stringify({ hinweis: "fahleweiten_fuellen.mjs: ursprüngliches Gelände unter den eigenen Flächen (für wiederholte Läufe)", felder: Object.fromEntries(alt) }) + "\n");
/* alle Wege der Fahlen Weiten (auch die aus fahleweiten.mjs) – für sammelstellen.mjs („am Weg“) und den Test */
const FW_WEGE = [[[6600, 5890], [6612, 5944], [6628, 6004], [6640, 6064], [6648, 6124], [6662, 6182], [6682, 6246], [6694, 6300]], [[6604, 5866], [6622, 5846], [6648, 5826], [6668, 5818], [6680, 5814], [6680, 5801]], [[6584, 5872], [6556, 5858], [6520, 5830], [6494, 5800], [6476, 5786]], [[6444, 5770], [6400, 5778], [6344, 5786], [6288, 5784], [6252, 5780]]];
writeFileSync(join(WELT, "fahleweiten_orte.json"), JSON.stringify({ hinweis: "Fahle Weiten füllen, Schritt 1 (Welt #171): Orte, Ortsnamen, Grauwacht (Mauer, Tore, Läden), Banken und Bankkisten, Ladenplätze, Stationen, NPC-Plätze, Fischplätze, Kräuter, Wege, Rastplätze. Weltfelder. Objekte und NPCs mit ausbau gelten erst ab dieser Stadtstufe.",
  orte, namen, grauwacht, westwald: { ...PT, woelfe: WOELFE }, banken, laeden, stationen, npc, fischplaetze: fische, kraeuter, rastplaetze: rast, wege: [...FW_WEGE.map((punkte) => ({ punkte, breite: 2 })), ...wege] }, null, 1) + "\n");
console.log(`Fahle Weiten füllen: Grauwacht ${grauwacht.gebaeude} Gebäude (Mauer ${grauwacht.mauer.join(",")}, ${grauwacht.laeden.length} Läden), ${Object.keys(ORT).length} neue Orte, ${objekte.length} Objekte, ${interaktionen.length} Lesestellen, ${npc.length} NPC-Plätze, ${fische.length} Fischplätze, ${kraeuter.length} Kräuter, ${banken.length} Banken/Kisten`);
