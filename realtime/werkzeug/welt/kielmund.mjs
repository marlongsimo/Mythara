/*
 * World Pipeline – Hauptstadt Kielmund (#174, 27.11.2026; Plan welt/plaene/kielmund_plan.png, Konzept doku/konzepte/hauptstaedte.md).
 *   Kielmund an der Mündung der Kiel wird zur großen Hafenstadt (~100 Gebäude): Stadtmauer zur Landseite mit Nordtor (Südstraße) und Brückentor (Kiel),
 *   im Westen begrenzen Fluss und Meer die Stadt (Kaimauer). Wahrzeichen: Leuchtturm-Mole ins Meer, Haus der Küstenhäuser (Ratssaal, kueste.mjs), Tempel.
 *   Viertel Hafen, Altstadt, Kaufmannsviertel, Fischerquartier; zweite Bank, Ladenplätze, Stationen. Der Privatsteg der Fischerzunft (kueste.mjs, #168) liegt im Hafen.
 * Nur vorhandene Modelle (Wünsche an Figuren: #174). Schreibt welt/festland/plan_kueste_kielmund.json (festland.py, nach plan_kueste.json) und welt/kielmund_orte.json.
 * Wiederholbar (Grund unter den eigenen Flächen in welt/festland/kielmund_grund.json).
 * Aufruf (im Ordner realtime): node werkzeug/welt/kielmund.mjs (nach kueste.mjs), danach die ganze Kette.
 */
import { writeFileSync, readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";

const BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy || 1))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };
const welle = (x, y) => Math.sin(x / 3.1 + y / 4.3) + 0.6 * Math.sin(y / 2.3 - x / 5.1);
let saat = 31337; const wurf = () => (saat = (saat * 1103515245 + 12345) % 2147483648) / 2147483648;
const wahl = (l) => l[Math.floor(wurf() * l.length)];

/* ───── Grund ───── */
const GRUNDDATEI = join(WELT, "festland", "kielmund_grund.json");
const alt = existsSync(GRUNDDATEI) ? new Map(Object.entries(JSON.parse(readFileSync(GRUNDDATEI, "utf8")).felder)) : new Map();
const GR = [];
for (const n of readdirSync(join(WELT, "regionen"))) { const rp = join(WELT, "regionen", n, "region.json"); if (!existsSync(rp)) continue; const r = JSON.parse(readFileSync(rp, "utf8")); if (r.ebene || r.entwurf) continue;
  GR.push({ n, x0: r.ursprung[0] * 32, y0: r.ursprung[1] * 32, z: readFileSync(join(WELT, "regionen", n, "gelaende.txt"), "utf8").split("\n") }); }
const regionVon = (x, y) => GR.find((g) => { const z = g.z[Math.floor(y) - g.y0]; return z && x >= g.x0 && x < g.x0 + z.length; })?.n;
const roh = (x, y) => { for (const g of GR) { const z = g.z[Math.floor(y) - g.y0]; if (z && x >= g.x0 && x < g.x0 + z.length) return z[Math.floor(x) - g.x0]; } return "?"; };
const grund = (x, y) => alt.get(Math.floor(x) + "," + Math.floor(y)) ?? roh(x, y);

/* ───── Plan ───── */
const feld = new Map(), urs = new Map(), hoehen = new Map(), eben = [], objekte = [], interaktionen = [], sperren = [], freigeben = [], npc = [], fische = [];
const banken = [], laeden = [], stationen = [];
const nass = (c) => "~wMo".includes(c);
const setze = (x, y, c, ueberWasser = false) => { const k = Math.floor(x) + "," + Math.floor(y), g = grund(x, y); if (g === "?" || (nass(g) && c !== "w" && !ueberWasser) || g === "F") return; if (!urs.has(k)) urs.set(k, g); feld.set(k, c); };
const jetzt = (x, y) => feld.get(Math.floor(x) + "," + Math.floor(y)) ?? grund(x, y);
const male = (x0, y0, x1, y1, f, ueberWasser = false) => { for (let y = Math.floor(y0); y < Math.ceil(y1); y++) for (let x = Math.floor(x0); x < Math.ceil(x1); x++) { const c = f(x + 0.5, y + 0.5); if (c) setze(x, y, c, ueberWasser); } };
const koerperVon = (o) => { const b = BIB.get(o.objekt); const k = o.kollision || b?.kollision; const s = o.s ?? 1;
  const kk = k?.koerper || (k?.art === "rechteck" ? [{ x0: k.x, x1: k.x + k.b, y0: k.y, y1: k.y + k.h }] : k?.art === "kreis" ? [{ x0: -k.r, x1: k.r, y0: -k.r, y1: k.r }] : []);
  return kk.map((c) => [o.x + c.x0 * s, o.y + c.y0 * s, o.x + c.x1 * s, o.y + c.y1 * s, o.id || o.objekt]); };
const koerper = [], fremdeLesestellen = [];
for (const f of readdirSync(join(WELT, "festland"))) if (/^plan_.*\.json$/.test(f) && f !== "plan_kueste_kielmund.json") { const P = JSON.parse(readFileSync(join(WELT, "festland", f), "utf8"));
  for (const o of P.objekte || []) if (o.objekt) koerper.push(...koerperVon(o)); for (const i of P.interaktionen || []) fremdeLesestellen.push([i.x, i.y]); }
const KUESTE = JSON.parse(readFileSync(join(WELT, "kueste_orte.json"), "utf8"));
let nr = 0;
const ding = (objekt, x, y, mehr = {}) => { const b = BIB.get(objekt); if (!b) throw new Error("unbekanntes Objekt " + objekt); if (b.kategorie !== "bewuchs" && Number.isInteger(y / 32)) y -= 0.01;
  const o = { id: mehr.id || `km_${objekt.replace(/^(dorf|graufurt|stil|k|moor|hand|welt|weidenhain|wald|burg|hoehle|wz|holz|waldmark|kueste|hochland)_/, "").replace(/_\d+$/, "")}_${++nr}`, objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...mehr };
  for (const r of koerperVon(o)) { const hit = koerper.find((q) => r[0] < q[2] && q[0] < r[2] && r[1] < q[3] && q[1] < r[3]); if (hit && b.kategorie === "gebaeude") throw new Error(`${o.id} überdeckt ${hit[4]}`); koerper.push(r); }
  objekte.push(o); return o; };
const lies = (id, x, y, text, mehr = {}) => interaktionen.push({ id, art: "lesen", x: +x.toFixed(2), y: +y.toFixed(2), radius: 1.8, abgleich: "keiner", daten: { text, ...mehr } });
const weg = (punkte, breite = 1.8, zeichen = "p") => { const xs = punkte.map((p) => p[0]), ys = punkte.map((p) => p[1]);
  male(Math.min(...xs) - 3, Math.min(...ys) - 3, Math.max(...xs) + 3, Math.max(...ys) + 3, (x, y) => (strecke(x, y, punkte) < breite / 2 + 0.12 * welle(x, y) && !nass(jetzt(x, y)) && jetzt(x, y) !== "F" ? zeichen : null)); };
const steg = (x, y, id) => { ding("dorf_bruecke_01", x, y, { id }); freigeben.push({ art: "rechteck", x0: +(x - 4.9).toFixed(2), y0: +(y - 2.6).toFixed(2), x1: +(x + 3.0).toFixed(2), y1: y }); };
const BODEN = new Set([..."., fTagsv"].filter((c) => c !== " "));
const imKoerper = (x, y, m = 0) => koerper.some((q) => x > q[0] - m && x < q[2] + m && y > q[1] - m && y < q[3] + m);
const passt = (objekt, x, y, s = 1, mehr = {}) => { const rs = koerperVon({ objekt, x, y, s }); if (!rs.length) return true; return rs.every((r) => passt1(r, mehr)); };
const passt1 = (r, mehr) => { const rand = mehr.rand ?? 1;
  if (regionVon(r[0], r[1] - 0.5) !== regionVon(r[2], r[3] + 0.5)) return false;
  for (let v = Math.floor(r[1]) - rand; v < Math.ceil(r[3]) + rand; v++) for (let u = Math.floor(r[0]) - rand; u < Math.ceil(r[2]) + rand; u++) if (!BODEN.has(jetzt(u + 0.5, v + 0.5))) return false;
  if (koerper.some((q) => r[0] - 1.4 < q[2] && q[0] < r[2] + 1.4 && r[1] - 1.4 < q[3] && q[1] < r[3] + 1.4)) return false;
  if ([...interaktionen.map((i) => [i.x, i.y]), ...fremdeLesestellen, ...npc.map((n) => [n.x, n.y])].some(([px, py]) => px > r[0] - 2 && px < r[2] + 2 && py > r[1] - 2 && py < r[3] + 2)) return false;
  return !(mehr.frei && mehr.frei.some(([a, b, c, d]) => r[0] < c && a < r[2] && r[1] < d && b < r[3])); };
const baue = (objekt, x, y, mehr = {}, suche = 8) => { const s = mehr.s ?? 1; for (let r = 0; r <= suche; r += 0.5) for (let a = 0; a < 6.28; a += r ? 0.4 / r + 0.2 : 7) { const px = Math.round((x + Math.cos(a) * r) * 2) / 2, py = Math.round((y + Math.sin(a) * r) * 2) / 2;
    if (passt(objekt, px, py, s, mehr)) { const { rand, frei, ...rest } = mehr; return ding(objekt, px, py, rest); } }
  throw new Error(`kein Platz für ${mehr.id || objekt} bei ${x}|${y}`); };

/* ═══════ Stadtmauer zur Landseite (Nord, Ost, Süd) – im Westen Kiel und Meer ═══════ */
const M = { x0: 6410, y0: 7262, x1: 6500, y1: 7380 }, NORDTOR = 6452, B0 = [M.x0, M.y0, M.x1, M.y1];
const inStadt = (x, y, r = 0) => x > M.x0 - 60 - r && x < M.x1 + r && y > M.y0 - r && y < M.y1 + r && !(x < 6400 && y < 7300 && strecke(x, y, [[6419, 7262], [6384, 7310]]) > 0 && x < 6419 - (y - 7262) * 0.73 - r);
const VIERTEL = (x, y) => (y < 7298 ? "Altstadt" : x < 6420 ? "Hafen" : y < 7340 ? "Kaufmannsviertel" : "Fischerquartier");
const SOLL = { Hafen: 22, Altstadt: 26, Kaufmannsviertel: 28, Fischerquartier: 22 };
const kielmund = { mauer: B0, tore: { nord: [NORDTOR, M.y0], bruecke: [6392, 7300] }, wahrzeichen: {}, viertel: {}, laeden, banken, stationen };
{ let mz = 0; const mid = () => "kielmund_mauer_" + ++mz, geh = (x, y) => { const c = jetzt(x + 0.5, y + 0.5); return !nass(c) && c !== "F" && c !== "?"; }, meer = (x, y) => nass(jetzt(x + 0.5, y + 0.5));
  /* Nord und Süd von Osten nach Westen, bis drei Reihen ganz im Wasser liegen (Kiel bzw. Meer) */
  const westEnde = {};
  for (const Y of [M.y0, M.y1]) for (let x = M.x1 - 2; x > M.x0 - 80; x -= 2) {
    if ([Y - 1, Y, Y + 1].every((yy) => meer(x, yy) && meer(x + 1, yy))) { westEnde[Y] = x; break; }
    if (!geh(x, Y) && !geh(x + 1, Y)) continue;
    if (Y === M.y0 && Math.abs(x + 1 - NORDTOR) < 4) continue;
    ding("burg_mauer_quer", x + 1, Y + 1, { id: mid() }); }
  for (let y = M.y0; y < M.y1 - 1; y += 2) ding("burg_mauer_laengs", M.x1, y + 2, { id: mid() });
  for (const [x, y] of [[M.x1, M.y0], [M.x1, M.y1], [M.x1, 7320], [6476, M.y0], [6440, M.y1]]) ding("burg_eckturm", x, y + 1.3, { id: mid() });
  ding("burg_torhaus", NORDTOR, M.y0 + 1, { id: "kielmund_tor_nord" }); ding("burg_torhaus_tief", 6394.5, 7301.6, { id: "kielmund_tor_bruecke" });
  lies("kielmund_tor_nord", NORDTOR + 3.5, M.y0 + 3, "Das Nordtor von Kielmund. Hier endet die Südstraße – dahinter riecht alles nach Salz und Teer.");
  npc.push({ id: "torwache_kielmund_nord", rolle: "Torwache (Nordtor)", x: NORDTOR - 3.5, y: M.y0 + 3 }, { id: "torwache_kielmund_bruecke", rolle: "Torwache (Brückentor)", x: 6396, y: 7304 });
  kielmund.west = westEnde; }

/* ═══════ Gassen ═══════ */
const GASSEN = [[[NORDTOR, M.y0 - 4], [NORDTOR, 7270], [6440, 7290], [6428, 7300]], [[6396, 7300], [M.x1 - 2, 7300]], [[6426, 7300], [6426, 7376]], [[6400, 7338], [M.x1 - 2, 7338]],
  [[6440, 7278], [M.x1 - 2, 7278]], [[6466, 7300], [6466, M.y1 - 2]], [[6404, 7360], [M.x1 - 2, 7360]], [[6486, M.y0 + 2], [6486, 7300]], [[6412, 7300], [6408, 7338]], [[6446, 7338], [6446, 7360]], [[6404, 7374], [M.x1 - 2, 7374]], [[6468, 7320], [M.x1 - 2, 7320]]];
for (const g of GASSEN) weg(g, 2.2, "p");

/* ═══════ Leuchtturm-Mole: drei Stegstücke vom Strand ins Meer, am Ende eine Plattform mit dem Leuchtturm ═══════ */
{ const Y = 7338.3; let land = 6400; while (land > 6340 && !nass(jetzt(land - 0.5, Y - 1.3))) land--;
  male(land - 2, Y - 3, land + 6, Y + 1, (x, y) => (nass(jetzt(x, y)) ? null : "p"));   /* Molenkopf am Strand */
  for (let i = 0; i < 4; i++) steg(land + 4.9 - i * 6.8, Y, "kielmund_mole_" + (i + 1));   /* 6,8 Felder: die Stege stoßen ohne Lücke aneinander */
  const ex = land - 22.4; freigeben.push({ art: "rechteck", x0: +(ex - 4).toFixed(2), y0: +(Y - 5).toFixed(2), x1: +(ex + 4.6).toFixed(2), y1: +(Y + 2).toFixed(2) });   /* Plattform am Ende (Meer bleibt Meer, festland.py) */
  ding("graufurt_turm_ost_01", ex - 1.5, Y + 0.6, { id: "kielmund_leuchtturm", s: 1.4 }); ding("turm_signalfeuer_01", ex - 1.5, Y - 4.6, { id: "kielmund_leuchtfeuer", s: 0.8 });
  for (const [o, dx, dy, s] of [["k_fels_gross", -4.6, -3.4, 0.9], ["k_fels_breit", -4.2, 1.6, 0.8], ["k_fels_klein", 0.8, -5.2, 0.8], ["k_fels_klein", -1.2, 2.6, 0.7]]) ding(o, ex + dx, Y + dy, { s });   /* Felsen am Fuß des Leuchtturms */
  lies("kielmund_mole", land + 1, Y - 1.3, "Die Leuchtturm-Mole von Kielmund. Am Ende brennt das Feuer, das die Boote heimholt – man sieht es bis zur Möwenbucht.");
  lies("kielmund_leuchtturm", ex + 0.6, Y - 1.3, "Der Leuchtturm am Ende der Mole. Der Wärter hat Salz in den Bart und Rost an den Händen.");
  npc.push({ id: "leuchtturmwaerter_kielmund", rolle: "Leuchtturmwärter (Mole)", x: ex + 0.5, y: Y - 1.8 });
  kielmund.wahrzeichen.mole = { von: [land, Y - 1.3], bis: [ex, Y - 1.3], leuchtturm: [ex - 1.5, Y + 0.6] }; }
kielmund.wahrzeichen.kuestenhaus = [6414, 7296];

/* ═══════ Altstadt: Tempel mit Platz ═══════ */
{ male(6464, 7280, 6486, 7290, () => "p");
  const t = baue("dorf_kapelle_01", 6474, 7276, { id: "kielmund_tempel", s: 1.6, rand: 0 }, 4); lies("kielmund_tempel", t.x + 0.6, t.y + 0.8, "Der Tempel der Gezeiten. Drinnen hängen Netze voller Muscheln – Dank für jede Heimkehr.");
  ding("dorf_brunnen_01", 6470, 7287, { id: "kielmund_tempelbrunnen" }); kielmund.wahrzeichen.tempel = [t.x, t.y];
  npc.push({ id: "priesterin_kielmund", rolle: "Priesterin (Tempel)", x: t.x + 1.5, y: t.y + 2 }); }

/* ═══════ Hafen: zweite Bank, Räucherhütte, Lagerhäuser, Ladenplätze am Kai ═══════ */
{ const bank = baue("waldmark_bank_01", 6414, 7332, { id: "kielmund_hafenbank" }); lies("kielmund_hafenbank_tuer", bank.x, bank.y + 0.6, "Die Hafenbank von Kielmund. Kapitäne zahlen hier ihre Heuer aus.");
  banken.push({ id: "kielmund_bank", gebaeude: "kielmund_bank", schalter: [6452, 7297.4], vorhanden: true }, { id: "kielmund_hafenbank", gebaeude: "kielmund_hafenbank", schalter: [bank.x, bank.y + 1.4] });
  npc.push({ id: "bankier_kielmund_hafen", rolle: "Bank (Hafenbank)", x: bank.x, y: bank.y + 1.4 }, { id: "bankier_kielmund", rolle: "Bank (Kaufmannsviertel)", x: 6452, y: 7297.4 });
  const r = baue("kueste_raeucherhuette", 6400, 7318, { id: "kielmund_raeucherhuette", rand: 0 }, 6); stationen.push({ id: "raeucherhuette_kielmund", station: "raeucherhuette", x: r.x, y: r.y + 1.6 });
  for (const [i, [o, x, y]] of [["dorf_scheune_holz_01", 6404, 7348], ["dorf_scheune_holz_01", 6412, 7372]].entries()) baue(o, x, y, { id: "kielmund_lagerhaus_" + (i + 1) }, 8);
  for (const [i, [o, x, y]] of [["dorf_marktstand_01", 6404, 7308], ["dorf_marktstand_03", 6410, 7322], ["k_stand_rot", 6402, 7340]].entries()) { const st = baue(o, x, y, { id: "kielmund_hafenstand_" + (i + 1), rand: 0 }, 5);
    laeden.push({ id: st.id, viertel: "Hafen", art: "Stand am Kai", x: st.x, y: +(st.y + 1.2).toFixed(1), blick: [0, -1] }); }
  for (const [x, y] of [[6400, 7326], [6405, 7334], [6398, 7312]]) baue(wahl(["k_faesser", "k_kiste", "dorf_fass_01"]), x, y, { rand: 0 }, 3); }

/* ═══════ Kaufmannsviertel: Stände, Kessel am Teich; Fischerquartier: Kessel, Netze ═══════ */
for (const [i, [o, x, y]] of [["dorf_marktstand_02", 6440, 7306], ["dorf_marktstand_03", 6476, 7306], ["dorf_marktstand_01", 6488, 7306]].entries()) { const st = baue(o, x, y, { id: "kielmund_kaufstand_" + (i + 1), rand: 0 }, 5);
  laeden.push({ id: st.id, viertel: "Kaufmannsviertel", art: "Marktstand", x: st.x, y: +(st.y + 1.2).toFixed(1), blick: [0, -1] }); }
{ const k = baue("hand_kessel_01", 6472, 7364, { id: "kielmund_fischerkessel", rand: 0 }, 5); stationen.push({ id: "kessel_kielmund", station: "kessel", x: k.x, y: k.y + 1.4 });
  for (const [x, y] of [[6456, 7366], [6482, 7368]]) baue("kueste_netze", x, y, { rand: 0 }, 4);
  stationen.push({ id: "esse_kielmund", station: "esse", x: 6447.5, y: 7325.4, vorhanden: true }, { id: "amboss_kielmund", station: "amboss", x: 6450.5, y: 7325.4, vorhanden: true }, { id: "werkbank_kielmund", station: "werkbank", x: 6456, y: 7327.4, vorhanden: true }, { id: "herd_kielmund_taverne", station: "herd", x: 6440, y: 7297.4 }); }

/* ═══════ Häuser je Viertel bis zur Sollzahl ═══════ */
const istGeb = (o) => BIB.get(o.objekt)?.kategorie === "gebaeude";
const alle = () => [...objekte, ...JSON.parse(readFileSync(join(WELT, "festland", "plan_kueste.json"), "utf8")).objekte];
const zahl = {}; for (const o of alle().filter((o) => istGeb(o) && o.x > M.x0 - 50 && o.x < M.x1 && o.y > M.y0 && o.y < M.y1)) zahl[VIERTEL(o.x, o.y)] = (zahl[VIERTEL(o.x, o.y)] || 0) + 1;
const HAUS = { Hafen: ["dorf_haus_holz_01", "dorf_haus_holz_02", "graufurt_steinhaus_02", "dorf_schuppen_holz_01", "moor_fischer_01"], Altstadt: ["graufurt_steinhaus_01", "graufurt_steinhaus_02", "weidenhain_fachwerk_02", "weidenhain_fachwerk_03", "hochland_stadthaus_03"],
  Kaufmannsviertel: ["weidenhain_fachwerk_02", "weidenhain_fachwerk_03", "hochland_stadthaus_01", "hochland_ladenhaus_01", "hochland_ladenhaus_02", "graufurt_steinhaus_02"], Fischerquartier: ["moor_fischer_01", "dorf_haus_holz_03", "dorf_huette_holz_01", "weidenhain_kate_01", "moor_kate_01"] };
const FREI = [[6380, 7342, 6404, 7362], [6464, 7279, 6487, 7291], [6416, 7308, 6436, 7326]];   /* Zunftsteg, Tempelplatz, Markt/Fischmarkt */
for (const guete of [4, 8, 12]) for (let y = M.y0 + 5; y < M.y1 - 2; y++) for (let x = 6380; x < M.x1 - 3; x++) {
  const v = VIERTEL(x, y); if ((zahl[v] || 0) >= SOLL[v]) continue; const o = wahl(HAUS[v]), s = +(0.95 + wurf() * 0.1).toFixed(2); if (!passt(o, x, y, s, { frei: FREI })) continue;
  let vorn = false; for (let w = 1; w <= guete && !vorn; w++) for (let u = -1; u <= 1; u++) if ("pke".includes(jetzt(x + u, y + w))) vorn = true; if (!vorn) continue;
  ding(o, x, y, { s }); zahl[v] = (zahl[v] || 0) + 1; }
kielmund.viertel = zahl; kielmund.gebaeude = Object.values(zahl).reduce((a, b) => a + b, 0);
/* Ladenplätze in Häusern an den Hauptgassen (Händler vor der Tür) */
for (const o of objekte.filter((o) => istGeb(o) && /^km_/.test(o.id) && [7276, 7298, 7318, 7336, 7358, 7372].some((g) => Math.abs(o.y - g) < 2)).sort((a, b) => (/ladenhaus/.test(b.objekt) - /ladenhaus/.test(a.objekt)) || a.x - b.x).slice(0, 6))
  laeden.push({ id: "kielmund_laden_" + o.id.replace(/^km_/, ""), viertel: VIERTEL(o.x, o.y), art: "Ladenhaus", gebaeude: o.id, x: o.x, y: +(o.y + 1.2).toFixed(1), blick: [0, 1] });
for (let x = 6406; x < M.x1 - 4; x += 12) for (const y of [7302.6, 7340.6]) if (BODEN.has(jetzt(x, y)) && !imKoerper(x, y, 1)) ding("dorf_laterne_01", x, y);

/* ═══════ Fischerzunft (#176): Plätze für die Fische der Stufen 70–90 am Privatsteg ═══════ */
const ZUNFT176 = (KUESTE.fischplaetze || []).filter((f) => /^fischerzunft_fang_/.test(f.id)).map((f) => ({ ...f }));

/* ═══════ Prüfung: von draußen durchs Nordtor alles erreichbar ═══════ */
{ const X0 = 6330, Y0 = 7240, BB = 190, HH = 160, zu = new Uint8Array(BB * HH);
  for (let y = 0; y < HH; y++) for (let x = 0; x < BB; x++) { const c = jetzt(X0 + x + 0.5, Y0 + y + 0.5); if ((nass(c) && !freigeben.some((f) => X0 + x + 0.5 >= f.x0 && X0 + x + 0.5 <= f.x1 && Y0 + y + 0.5 >= f.y0 && Y0 + y + 0.5 <= f.y1)) || c === "F") zu[y * BB + x] = 1; }
  for (const q of koerper) for (let y = Math.floor(q[1]); y < Math.ceil(q[3]); y++) for (let x = Math.floor(q[0]); x < Math.ceil(q[2]); x++) if (x >= X0 && y >= Y0 && x < X0 + BB && y < Y0 + HH) zu[(y - Y0) * BB + x - X0] = 1;
  const seen = new Uint8Array(BB * HH), q = [[NORDTOR - X0, M.y0 - 6 - Y0]]; seen[q[0][1] * BB + q[0][0]] = 1;
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= BB || ny >= HH) continue; const i = ny * BB + nx; if (seen[i] || zu[i]) continue; seen[i] = 1; q.push([nx, ny]); } }
  const da = (x, y) => { for (let r = 0; r <= 2; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const i = (Math.floor(y) + dy - Y0) * BB + Math.floor(x) + dx - X0; if (seen[i]) return true; } return false; };
  const fehlt = [...interaktionen.map((i) => [i.x, i.y, i.id]), ...npc.map((n) => [n.x, n.y, n.id]), ...laeden.map((l) => [l.x, l.y, l.id]), ...stationen.map((s) => [s.x, s.y, s.id])].filter(([x, y]) => !da(x, y));
  if (fehlt.length) throw new Error("Kielmund: nicht erreichbar – " + fehlt.map((f) => f[2]).join(", ")); }

/* ───── schreiben ───── */
const keys = [...feld.keys()].map((k) => k.split(",").map(Number)), X0 = Math.min(...keys.map((k) => k[0])), Y0 = Math.min(...keys.map((k) => k[1])), X1 = Math.max(...keys.map((k) => k[0])), Y1 = Math.max(...keys.map((k) => k[1]));
const patches = []; for (let ya = Y0; ya <= Y1; ya += 64) { const zeilen = []; for (let y = ya; y < Math.min(ya + 64, Y1 + 1); y++) { let s = ""; for (let x = X0; x <= X1; x++) s += feld.get(x + "," + y) || " "; zeilen.push(s.replace(/ +$/, "")); } if (zeilen.some((s) => s.trim())) patches.push({ x0: X0, y0: ya, zeilen }); }
writeFileSync(join(WELT, "festland", "plan_kueste_kielmund.json"), JSON.stringify({ hinweis: "Erzeugt von werkzeug/welt/kielmund.mjs (#174): Hauptstadt Kielmund – Stadtmauer, Mole mit Leuchtturm, Tempel, Hafen, Viertel. Weltfelder.", gelaende: patches, hoehen: [], eben, objekte, interaktionen, sperren, freigeben }) + "\n");
for (const [k, g] of urs) if (!alt.has(k)) alt.set(k, g);
writeFileSync(GRUNDDATEI, JSON.stringify({ hinweis: "kielmund.mjs: ursprüngliches Gelände unter den eigenen Flächen (für wiederholte Läufe)", felder: Object.fromEntries(alt) }) + "\n");
writeFileSync(join(WELT, "kielmund_orte.json"), JSON.stringify({ hinweis: "Hauptstadt Kielmund (Welt #174): Mauer (Rechteck der Landseite; im Westen Kiel und Meer), Tore, Wahrzeichen, Viertel mit Gebäudezahl, Banken, Ladenplätze, Stationen, NPC-Plätze. Weltfelder.",
  ...kielmund, npc, fischerzunft_fang: ZUNFT176, namen: [["Kielmund", "Stadt", 6426, 7314]] }, null, 1) + "\n");
console.log(`Kielmund: ${kielmund.gebaeude} Gebäude ${JSON.stringify(zahl)}, ${laeden.length} Ladenplätze, ${banken.length} Banken, ${stationen.length} Stationen, ${objekte.length} Objekte, ${interaktionen.length} Lesestellen`);
