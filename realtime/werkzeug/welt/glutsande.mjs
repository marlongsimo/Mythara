/*
 * World Pipeline – Phase 9 vorab (#74, 27.11.2026): die Glutsande (W2) mit Glutbrunn, Salzpfanne, Kanal, Oase und dem versandeten Tempel.
 * Wie fahleweiten.mjs: schreibt einen Plan (welt/festland/plan_glutsande.json), den festland.py beim Schneiden der Kacheln einarbeitet,
 * dazu den Tempel im Untergrund (Chunks 352–355|300) und das Archiv im Rathaus der Waldmark (356|300).
 *   Übergang vom Ostufer: der Pass im Südosten des Felskessels (ostufer_form.mjs, PASS) – offene Welt; Wegmarke „Ende des Grases“.
 *   Ein ausgetrockneter Kanal quer durch die Dünen (zwei Lager), die Salzpfanne mit der Siederei, die Tafelberge mit dem versandeten Tempel,
 *   eine Oase mit einem alten Weltenbaum, das grüne Flusstal am Strom mit Glutbrunn (Markt mit Karawanenrast, Bank, Werkstatt, Badehaus,
 *   Hafenmole, Brunnen mit Wegstein und Bindestein, Fischplatz).
 * Aufruf (im Ordner realtime): node werkzeug/welt/glutsande.mjs && python3 werkzeug/welt/festland.py && node werkzeug/welt/ostufer.mjs && (orte, lichtungen, naehte, bauen …)
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";
import { PASS, passWeg } from "./ostufer_form.mjs";
import { OBEN as RATSSAAL_OBEN, URSPRUNG as RATSSAAL_U } from "./rathaus.mjs";

const BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy || 1))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };
const welle = (x, y) => Math.sin(x / 3.1 + y / 4.3) + 0.6 * Math.sin(y / 2.3 - x / 5.1);
const breit = (x, y) => Math.sin(x / 17 + y / 23 + 0.7) + 0.7 * Math.sin(y / 13 - x / 19);
let saat = 9119; const wurf = () => (saat = (saat * 1103515245 + 12345) % 2147483648) / 2147483648;

/* Grundgelände des Festlands lesen (für Fluss und Küste) */
const GR = new Map(); { const { readdirSync } = await import("node:fs"); for (const n of readdirSync(join(WELT, "regionen"))) { if (!n.startsWith("fl_")) continue; const r = JSON.parse(readFileSync(join(WELT, "regionen", n, "region.json"), "utf8"));
  GR.set(n, { x0: r.ursprung[0] * 32, y0: r.ursprung[1] * 32, z: readFileSync(join(WELT, "regionen", n, "gelaende.txt"), "utf8").split("\n") }); } }
const grund = (x, y) => { for (const g of GR.values()) { const z = g.z[Math.floor(y) - g.y0]; if (z && x >= g.x0 && x < g.x0 + z.length) return z[Math.floor(x) - g.x0]; } return "?"; };
const nass = (x, y) => "~wM".includes(grund(x, y));

const feld = new Map(), hoehe = new Map(), eben = [], objekte = [], interaktionen = [], sperren = [], freigeben = [], npc = [], vorschlag = {};
const setze = (x, y, c) => { if (!nass(x + 0.5, y + 0.5) || c === "w") feld.set(Math.floor(x) + "," + Math.floor(y), c); };
const hebe = (x, y, h) => { const k = Math.floor(x) + "," + Math.floor(y); hoehe.set(k, (hoehe.get(k) || 0) + h); };
const male = (x0, y0, x1, y1, f) => { for (let y = Math.floor(y0); y < Math.ceil(y1); y++) for (let x = Math.floor(x0); x < Math.ceil(x1); x++) { const c = f(x + 0.5, y + 0.5); if (c) setze(x, y, c); } };
let n = 0; const ding = (objekt, x, y, mehr = {}) => { if (!BIB.has(objekt)) throw new Error("unbekanntes Objekt " + objekt); const o = { id: mehr.id || "gs_" + objekt.replace(/^(dorf|graufurt|stil|k|moor|hand|burg|hoehle|welt|wz|holz|waldmark|weidenhain)_/, "").replace(/_\d+$/, "") + "_" + ++n, objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...mehr }; objekte.push(o); return o; };
const lies = (id, x, y, text, mehr = {}) => interaktionen.push({ id, art: mehr.tat ? "eingang" : "lesen", x: +x.toFixed(2), y: +y.toFixed(2), radius: mehr.tat ? 2.0 : 1.8, abgleich: "keiner", daten: { text, ...mehr } });
const sperre = (x, y, b = 1, h = 1) => sperren.push({ art: "rechteck", x0: x, y0: y, x1: x + b, y1: y + h });
const weg = (punkte, breite = 1.8, zeichen = "e") => { const xs = punkte.map((p) => p[0]), ys = punkte.map((p) => p[1]);
  male(Math.min(...xs) - 3, Math.min(...ys) - 3, Math.max(...xs) + 3, Math.max(...ys) + 3, (x, y) => strecke(x, y, punkte) < breite / 2 + 0.15 * welle(x, y) ? zeichen : null); };
/* Fluss: Mittellinie aus dem Grundgelände je x (Spalte) */
const stromY = (x) => { let s = 0, k = 0; for (let y = 6880; y < 7120; y++) if (grund(x + 0.5, y + 0.5) === "~") { s += y + 0.5; k++; } return k ? s / k : null; };

export const ORTE = { ende_des_grases: [6914, 6742], glutbrunn: [7160, 6956], salzpfanne: [7330, 6642], tempel: [7112, 6680], oase: [7256, 6800], lager_west: [7046, 6852], lager_ost: [7210, 6724] };

/* ───── Flusstal: grüner Saum beiderseits des Stroms, Felder, Gebüsch ───── */
for (let x = 6930; x < 7420; x++) { const m = stromY(x); if (m === null) continue; const b = 22 + 8 * breit(x, 0) + (Math.abs(x - 7160) < 70 ? 10 : 0);
  for (let y = Math.floor(m - b - 4); y < m + b + 4; y++) { const d = Math.abs(y + 0.5 - m), w = welle(x, y), r = b + 3 * Math.sin(x / 7 + y / 11);
    if (d > r) continue; const c = d > r - 4 ? (w > 0.2 ? "y" : null) : (breit(x * 1.7, y * 1.7) > 0.9 && d > 9 ? "a" : w > 1.0 ? "," : "."); if (c) setze(x, y, c); } }

/* ───── Wege ───── */
const W_PASS = [PASS[PASS.length - 1], [6918, 6739], ORTE.ende_des_grases, [6950, 6800], [6996, 6860], [7050, 6905], [7110, 6935], [7140, 6945]];
const W_TEMPEL = [[7156, 6928], [7146, 6860], [7128, 6780], [7114, 6712]];
const W_SALZ = [[7132, 6712], [7190, 6690], [7260, 6660], [7320, 6640]];
const W_OASE = [[7146, 6860], [7200, 6830], [7246, 6806]];
for (const w of [W_TEMPEL, W_SALZ, W_OASE]) weg(w, 1.8, "e");
weg(W_PASS.slice(1), 1.8, "e"); male(6912, 6728, 6930, 6750, (x, y) => (passWeg(x, y) ? "e" : null));   /* bündig an den Pass im Ostufer */
lies("ende_des_grases", ORTE.ende_des_grases[0] + 1.5, ORTE.ende_des_grases[1] + 1.4, "Ein Wegstein, halb im Sand. Jemand hat hineingeritzt: „Ende des Grases“. Dahinter nur noch Dünen und flirrende Luft.");
ding("moor_menhir_02", ...ORTE.ende_des_grases, { id: "ende_des_grases" });

/* ───── Ausgetrockneter Kanal mit zwei Lagern ───── */
const KANAL = [[6990, 6924], [7040, 6866], [7100, 6806], [7180, 6744], [7260, 6688], [7304, 6656]];
{ const xs = KANAL.map((p) => p[0]), ys = KANAL.map((p) => p[1]);
  male(Math.min(...xs) - 8, Math.min(...ys) - 8, Math.max(...xs) + 8, Math.max(...ys) + 8, (x, y) => { const d = strecke(x, y, KANAL); return d < 2.6 + 0.3 * welle(x, y) ? (welle(x, y) > 0.9 ? "s" : "g") : d < 4.2 ? (welle(x, y) > -0.3 ? "y" : "g") : null; });
  for (let t = 0; t < KANAL.length - 1; t++) { const [a, b] = [KANAL[t], KANAL[t + 1]]; for (let u = 0; u <= 1; u += 0.05) for (let j = -5; j <= 5; j++) for (let i = -5; i <= 5; i++) { const x = a[0] + (b[0] - a[0]) * u + i, y = a[1] + (b[1] - a[1]) * u + j; const d = strecke(x + 0.5, y + 0.5, KANAL); if (d < 4) hoehe.set(Math.floor(x) + "," + Math.floor(y), -0.9 * Math.max(0, 1 - d / 4)); } }
  for (const [x, y, id] of [[7020, 6890, "kanal_bruecke_1"], [7140, 6775, "kanal_bruecke_2"]]) ding("k_ruine_mauer", x + 3.5, y + 1, { id: id + "_mauer" });
  lies("kanal", 7070, 6840, "Ein Kanal aus behauenem Stein, längst ausgetrocknet. Im Sand liegen Scherben von Krügen – und frische Fußspuren.");
  for (const [k, [cx, cy]] of [["west", ORTE.lager_west], ["ost", ORTE.lager_ost]]) { male(cx - 9, cy - 7, cx + 9, cy + 7, (x, y) => Math.hypot((x - cx) / 8, (y - cy) / 6) < 1 ? (welle(x, y) > 0.5 ? "g" : "s") : null);
    ding("welt_zelt_01", cx - 3, cy - 2); ding("welt_zelt_01", cx + 4, cy - 1, { spiegeln: true }); ding("dorf_festfeuer_01", cx, cy + 2); ding("k_kiste", cx - 5, cy + 3); ding("k_faesser", cx + 6, cy + 3); ding("k_banner_rot", cx + 1, cy - 4);
    lies("lager_" + k, cx - 1, cy + 4, "Ein Lager im Kanalbett: Zelte aus Kamelhaar, ein Feuer, Kisten mit fremden Siegeln. Karawanenräuber."); vorschlag["lager_" + k] = { x: cx, y: cy, r: 9 }; } }

/* ───── Salzpfanne mit Siederei ───── */
{ const [cx, cy] = ORTE.salzpfanne; male(cx - 36, cy - 22, cx + 36, cy + 24, (x, y) => { const d = Math.hypot((x - cx) / 32, (y - cy - 4) / 18) + 0.05 * welle(x, y); return d < 1 ? (welle(x, y) > 1.3 ? "s" : "S") : d < 1.1 ? "g" : null; });
  eben.push([cx - 34, cy - 20, cx + 34, cy + 24]);
  const D = [cx, cy - 22]; male(D[0] - 14, D[1] - 8, D[0] + 14, D[1] + 6, (x, y) => Math.hypot((x - D[0]) / 13, (y - D[1]) / 7) < 1 ? (Math.abs(y - D[1] - 1) < 1 ? "e" : "y") : null);
  ding("graufurt_steinhaus_01", D[0] - 8, D[1] - 1, { id: "siederei_haus" }); ding("moor_kate_01", D[0] + 8, D[1] - 1, { id: "siederei_kate" }); ding("weidenhain_kate_01", D[0], D[1] - 3, { id: "salzspeicher" });
  ding("hand_kessel_01", D[0] - 3, D[1] + 3.5, { id: "siedekessel_1" }); ding("hand_kessel_01", D[0] + 3, D[1] + 3.5, { id: "siedekessel_2" }); ding("dorf_holzstapel_01", D[0] + 11, D[1] + 3);
  for (let i = 0; i < 4; i++) { const px = cx - 15 + i * 10, py = cy + 2; male(px - 3, py - 2, px + 3, py + 2, () => "w"); vorschlag["siedepfanne_" + (i + 1)] = { x: px, y: py }; }
  lies("salzpfanne", cx, cy - 12, "Die Salzpfanne: eine weiße Kruste, so weit man sieht. In vier gemauerten Becken verdunstet Sole – in zweien stehen Skorpione.");
  lies("siederei", D[0], D[1] + 5, "Die Salzsiederei. Die Kessel sind kalt, die Pfannen rissig.");
  npc.push({ id: "ruwen_kehl", rolle: "Salzsieder (F2)", x: D[0] + 1.5, y: D[1] + 5.5 }); vorschlag.skorpione_salzpfanne = { x: cx, y: cy + 4, r: 22 }; }

/* ───── Tafelberg mit dem versandeten Tempel ───── */
const TEMPEL_U = [352, 300], KAMMER_U = [355, 300];
const TEMPEL_EIN = [TEMPEL_U[0] * 32 + 48, TEMPEL_U[1] * 32 + 60];
{ const [cx, cy] = ORTE.tempel, RX = 24, RY = 15;
  const norm = (x, y) => Math.hypot((x - cx) / RX, (y - cy) / RY) / (1 + 0.06 * welle(x, y));
  const TOR = [cx, cy + RY - 2], GANG = [[cx, cy + RY + 6], [cx, cy + RY - 3]];
  male(cx - RX - 5, cy - RY - 5, cx + RX + 5, cy + RY + 6, (x, y) => { const d = norm(x, y); if (strecke(x, y, GANG) < 2.4) return welle(x, y) > 0.6 ? "s" : "p"; return d < 0.95 ? "F" : d < 1.12 ? "g" : null; });
  for (let j = -RY - 4; j <= RY + 4; j++) for (let i = -RX - 4; i <= RX + 4; i++) { const d = norm(cx + i + 0.5, cy + j + 0.5); if (d < 1.1) hebe(cx + i, cy + j, 4.5 * Math.min(1, (1.1 - d) / 0.25) * Math.min(1, Math.max(0, (strecke(cx + i + 0.5, cy + j + 0.5, GANG) - 2.4) / 2))); }   /* der Zugang ist eine Schlucht im Fels */
  ding("hoehle_tuer_01", cx, cy + RY - 2.6, { id: "tempel_tuer" });
  for (const s of [-1, 1]) { ding("k_saeule_gross", cx + s * 3.4, TOR[1] + 3.5); ding("k_ruine_saeule", cx + s * 5.5, TOR[1] + 6.5); }
  ding("k_truemmer", cx - 2, TOR[1] + 8); ding("k_ruine_halbmauer", cx + 6, TOR[1] + 9);
  lies("tempel_tor", cx, TOR[1] + 1.4, "Ein Tor im Fels, halb im Sand versunken. Über dem Sturz: ein Auge, aus dem Strahlen fallen.", { tat: "tempel", knopf: "Hinabsteigen", ziel: TEMPEL_EIN });
  /* Ureisen am Fuß des Tafelbergs (gesperrte Aderfelder) */
  const ADERN = [["ureisen_glut_1", 200], ["ureisen_glut_2", 330], ["ureisen_glut_3", 20]];
  vorschlag.adern = ADERN.map(([id, grad]) => { const w = grad * Math.PI / 180; const x = Math.floor(cx + Math.cos(w) * RX * 1.05) + 0.5, y = Math.floor(cy + Math.sin(w) * RY * 1.05) + 0.5; setze(x, y, "g"); sperre(Math.floor(x), Math.floor(y)); return { id, art: "ureisen", x, y }; });
  npc.push({ id: "hasim_tal", rolle: "Gelehrter (F3) – vor dem Tempel", x: cx + 2.5, y: TOR[1] + 5 }); }

/* ───── Oase mit dem alten Weltenbaum ───── */
{ const [cx, cy] = ORTE.oase; male(cx - 18, cy - 15, cx + 18, cy + 15, (x, y) => { const d = Math.hypot((x - cx) / 16, (y - cy) / 13) + 0.06 * welle(x, y); return d < 0.32 ? "w" : d < 0.75 ? (welle(x, y) > 0.8 ? "," : ".") : d < 1 ? "y" : null; });
  ding("holz_weltenbaum_setzling_01", cx + 7, cy - 4, { id: "weltenbaum_oase", s: 2.6 }); vorschlag.weltenbaum = { id: "weltenbaum_oase", art: "weltenbaum", x: cx + 7, y: cy - 4 };
  for (let i = 0; i < 8; i++) { const w = (i / 8) * 6.28 + 0.4, r = 8 + wurf() * 3; ding(i % 2 ? "stil_busch_01" : "stil_birke_01", cx + Math.cos(w) * r, cy + Math.sin(w) * r * 0.8, { s: +(0.8 + wurf() * 0.3).toFixed(2) }); }
  lies("oase", cx - 3, cy + 6, "Eine Oase. Am Wasser steht ein Baum, so alt, dass seine Rinde wie Stein aussieht – ein Weltenbaum."); }

/* ───── Glutbrunn ───── */
const GB = { platz: [7160, 6950], markt: [7140, 6940], brunnen: [7172, 6946] };
{ const [px, py] = GB.platz, sm = stromY(7160);
  male(7100, 6905, 7220, 6996, (x, y) => { if (nass(x, y)) return null; const d = Math.hypot((x - px) / 52, (y - py) / 36) - 0.12 * breit(x * 2.3, y * 2.3) - 0.05 * welle(x, y); if (d > 0.88 && d < 1.05) return welle(x, y) > -0.2 ? "y" : null; return d < 0.88 ? (Math.hypot((x - px) / 9, (y - py) / 7) < 1 || strecke(x, y, [[7112, 6940], [7208, 6950]]) < 1.4 || strecke(x, y, [[px, py], [px, sm - 6]]) < 1.4 || strecke(x, y, [[px, py], [7150, 6912]]) < 1.4 ? "p" : welle(x, y) > 1.0 ? "," : ".") : null; });
  eben.push([7104, 6908, 7216, 6992]);
  /* Häuser ringsum, Bank, Werkstatt-Hof, Badehaus, Karawanenrast */
  const HAEUSER = [[7130, 6928], [7176, 6926], [7194, 6936], [7128, 6964], [7190, 6966], [7206, 6952]];
  HAEUSER.forEach(([x, y], i) => ding(i % 2 ? "graufurt_steinhaus_02" : "graufurt_steinhaus_01", x, y, { id: "glutbrunn_haus_" + (i + 1) }));
  ding("waldmark_bank_01", 7160, 6932, { id: "glutbrunn_bank" }); lies("glutbrunn_bank_tuer", 7160, 6932.6, "Die Bank von Glutbrunn. Dasselbe Konto wie in der Waldmark – nur der Wechsler schwitzt mehr.");
  male(7112, 6944, 7126, 6956, () => "p"); ding("dorf_schmiede_01", 7116, 6950, { id: "glutbrunn_schmiede" }); ding("hand_werkbank_01", 7123, 6953, { id: "glutbrunn_werkbank" }); ding("hand_herd_01", 7121, 6946, { id: "glutbrunn_herd" });
  lies("glutbrunn_werkstatt", 7119, 6954.4, "Die Werkstatt von Glutbrunn: Esse, Werkbank und ein Herd, auf dem Glutwels mit Salzkruste gart.");
  ding("graufurt_steinhaus_02", 7178, 6974, { id: "glutbrunn_badehaus" }); male(7172, 6976, 7184, 6982, (x, y) => (Math.abs(x - 7178) < 4.5 && Math.abs(y - 6979) < 2 ? "w" : "p"));
  lies("badehaus", 7176, 6975, "Das Badehaus. Warmes Wasser aus der Tiefe, Dampf und Klatsch aus allen Ländern.");
  /* Markt mit Karawanenrast */
  ding("dorf_marktstand_01", GB.markt[0] - 6, GB.markt[1] + 1, { id: "glutbrunn_stand_1" }); ding("dorf_marktstand_02", GB.markt[0] - 1, GB.markt[1] - 2, { id: "glutbrunn_stand_2" }); ding("k_stand_rot", GB.markt[0] + 4, GB.markt[1] + 1, { id: "glutbrunn_stand_3" });
  ding("welt_zelt_01", 7146, 6962, { id: "karawanenrast_zelt_1" }); ding("welt_zelt_01", 7140, 6966, { id: "karawanenrast_zelt_2", spiegeln: true }); ding("k_kiste", 7150, 6966); ding("k_faesser", 7136, 6961);
  lies("karawanenrast", 7144, 6968.6, "Die Karawanenrast: Zelte, Kisten, Kamelglocken. Hier hört man, was im Süden los ist.");
  /* Brunnen mit Wegstein und Bindestein */
  ding("dorf_brunnen_01", GB.brunnen[0], GB.brunnen[1] + 0.6, { id: "glutbrunn_brunnen" }); ding("moor_menhir_02", GB.brunnen[0] - 3.5, GB.brunnen[1] + 1, { id: "glutbrunn_wegstein" }); ding("wz_bindestein", GB.brunnen[0] + 3.5, GB.brunnen[1] + 1, { id: "glutbrunn_bindestein" });
  lies("glutbrunn_wegstein", GB.brunnen[0] - 3.5, GB.brunnen[1] + 2.6, "Der Wegstein von Glutbrunn."); lies("glutbrunn_bindestein", GB.brunnen[0] + 3.5, GB.brunnen[1] + 2.6, "Ein Bindestein am Brunnen.");
  lies("glutbrunn", px, py + 2, "Glutbrunn. Palmen, Lehm und Stein, und über allem der Geruch von Fisch und Gewürzen.");
  /* Hafenmole in den Strom, Fischplatz */
  const my = Math.floor(sm) - 25; let ufer = my; while (ufer < sm && !nass(7160.5, ufer + 0.5)) ufer++;
  ding("dorf_bruecke_01", 7160, ufer + 2.6, { id: "hafenmole_1", s: 1.03 }); ding("dorf_bruecke_01", 7166.6, ufer + 2.6, { id: "hafenmole_2", s: 1.03 });   /* #187: lückenlos (6,6 Abstand) */
  freigeben.push({ art: "rechteck", x0: 7155.1, y0: ufer, x1: 7169.6, y1: ufer + 2.6 }); lies("hafenmole", 7161, ufer - 0.8, "Die Hafenmole. Flache Boote liegen im Schlamm; stromab geht es zum Meer – irgendwann.");
  let fu = Math.floor(stromY(7112)) - 25; while (!nass(7112.5, fu + 1.5)) fu++;
  lies("fischplatz_strom", 7112.5, fu + 0.6, "Ein Fischplatz am Strom. Im braunen Wasser zieht ein Glutwels seine Kreise."); vorschlag.fischplatz = { id: "fischplatz_strom", x: 7112.5, y: fu + 1.5, stehplatz: [7112.5, fu + 0.3] };
  npc.push({ id: "selma_dornfeld", rolle: "Händlerin, Karawanenrast (F1)", x: 7142, y: 6970 }, { id: "nalia", rolle: "Fischerin (F4)", x: 7114, y: fu - 0.6 }, { id: "bankier_glutbrunn", rolle: "Bank", x: 7160, y: 6934 },
    { id: "schmied_glutbrunn", rolle: "Werkstatt", x: 7118, y: 6952 }, { id: "haendler_markt_1", rolle: "Markt", x: GB.markt[0] - 6, y: GB.markt[1] + 2.6 }, { id: "haendler_markt_2", rolle: "Markt", x: GB.markt[0] + 4, y: GB.markt[1] + 2.6 }); }

/* Dünen: einzelne Büsche und Steine an den Wegen */
for (let i = 0; i < 4000 && objekte.filter((o) => o.duene).length < 40; i++) { const x = 6920 + wurf() * 420, y = 6640 + wurf() * 300;
  if (Object.values(ORTE).some(([a, b]) => Math.hypot(a - x, b - y) < 28) || [W_PASS, W_TEMPEL, W_SALZ, W_OASE, KANAL].some((w) => strecke(x, y, w) < 5) || nass(x, y)) continue;
  if (![W_PASS, W_TEMPEL, W_SALZ, W_OASE].some((w) => strecke(x, y, w) < 16)) continue;
  ding(wurf() < 0.6 ? "stil_busch_02" : "k_fels_klein", x, y, { duene: true, s: +(0.6 + wurf() * 0.3).toFixed(2) }); }
for (const o of objekte) delete o.duene;

/* ───── Untergrund: der versandete Tempel (3 Räume) und die Kammer der Sandmutter (Instanz) ───── */
const raster = (B, H, frei) => Array.from({ length: H }, (_, y) => Array.from({ length: B }, (_, x) => (frei(x + 0.5, y + 0.5) ? "h" : "F")));
const iaU = (id, x, y, text, mehr = {}) => ({ id, art: mehr.tat ? "eingang" : "lesen", x, y, radius: mehr.tat ? 2.0 : 1.6, abgleich: "keiner", daten: { text, ...mehr } });
const schreibeGebiet = (id, R, g, dinge, spiel) => { const dir = join(WELT, "regionen", id); mkdirSync(dir, { recursive: true });
  for (const p of dinge) { if (!BIB.has(p.objekt)) throw new Error("unbekanntes Objekt " + p.objekt); if (g[Math.floor(p.y)][Math.floor(p.x)] === "F") throw new Error(id + ": im Fels " + p.id); }
  writeFileSync(join(dir, "region.json"), JSON.stringify({ id, ...R }, null, 1) + "\n"); writeFileSync(join(dir, "gelaende.txt"), g.map((z) => z.join("")).join("\n") + "\n");
  writeFileSync(join(dir, "objekte.json"), "[\n" + dinge.map((p) => " " + JSON.stringify(p)).join(",\n") + "\n]\n"); writeFileSync(join(dir, "spiel.json"), JSON.stringify(spiel, null, 1) + "\n");
  console.log(`${id}: ${g[0].length} × ${g.length} Felder, ${dinge.length} Dinge, ${spiel.interaktionen.length} Interaktionen`); };
const zw = (x, y) => 0.6 * Math.sin(x / 2.3 + y / 3.1) + 0.4 * Math.sin(y / 1.7 - x / 2.9);
{ /* Tempel (96 × 64): Vorhalle unten Mitte, Spiegelsaal links, Inschriftensaal rechts, Tor zur Kammer oben */
  const VORHALLE = [36, 44, 60, 62], SPIEGEL = { x: 20, y: 26, r: 11 }, INSCHRIFT = [62, 14, 86, 34];
  const GAENGE = [[[48, 44], [48, 30], [30, 26]], [[48, 30], [62, 24]], [[48, 30], [48, 6]]];
  const inR = ([x0, y0, x1, y1], x, y) => x > x0 - 0.5 * zw(x, y) && x < x1 + 0.5 * zw(x, y) && y > y0 - 0.5 * zw(x, y) && y < y1 + 0.5 * zw(x, y);
  const g = raster(96, 64, (x, y) => inR(VORHALLE, x, y) || inR(INSCHRIFT, x, y) || Math.hypot(x - SPIEGEL.x, y - SPIEGEL.y) < SPIEGEL.r + 0.6 * zw(x, y) || GAENGE.some((p) => strecke(x, y, p) < 1.9 + 0.3 * zw(x, y)) || Math.hypot(x - 48, y - 7) < 5.2);
  let m = 0; const o = (objekt, x, y, mehr = {}) => ({ id: objekt.replace(/^(k|hoehle|moor|wz)_/, "").replace(/_\d+$/, "") + "_" + ++m, objekt, x, y, ...mehr });
  const SPIEGELPLATTEN = [[13, 19], [27, 19], [13, 33], [27, 33]];
  const dinge = [o("hoehle_leiter_01", 48, 61.4), ...[[39, 47], [57, 47], [39, 57], [57, 57]].map(([x, y]) => o("k_saeule_gross", x, y)), o("k_truemmer", 44, 52, { spiegeln: true }),
    o("wz_splitter_obelisk", SPIEGEL.x, SPIEGEL.y), ...SPIEGELPLATTEN.map(([x, y]) => o("hoehle_steinsaeule_01", x, y - 0.6)),
    o("k_altar_stein", 74, 17), ...[[66, 20], [82, 20], [66, 30], [82, 30]].map(([x, y]) => o("k_ruine_saeule_ganz", x, y)), o("moor_feuerkorb_01", 46, 8), o("moor_feuerkorb_01", 50, 8)];
  const [ox, oy] = [TEMPEL_U[0] * 32, TEMPEL_U[1] * 32];
  const spiel = { start: [[48, 58]], figuren: [], spawnzonen: [], ausgaenge: [], kollision: { sperren: [], freigeben: [] },
    interaktionen: [iaU("tempel_hinauf", 48, 63.2, "Die Stufen hinauf ins Licht.", { tat: "tempel_hinauf", knopf: "Hinaufsteigen", ziel: [ORTE.tempel[0], ORTE.tempel[1] + 15 + 5] }),
      iaU("tempel_vorhalle", 48, 54, "Die Vorhalle. Sand rieselt durch Ritzen in der Decke; an den Wänden Reliefs von Magiern, die einander bekämpfen."),
      ...SPIEGELPLATTEN.map(([x, y], i) => iaU("spiegelplatte_" + (i + 1), x, y + 1.4, "Eine Bronzeplatte auf einem drehbaren Sockel. Sie fängt das Licht aus dem Schacht.", { questobjekt: "spiegelplatte" })),
      iaU("lichtschacht", SPIEGEL.x, SPIEGEL.y + 2.4, "Durch einen Schacht fällt ein einzelner Sonnenstrahl auf den Obelisken."),
      iaU("inschrift", 74, 19.4, "Eine Inschrift in der alten Schrift: „… und der Bote zog nach Osten, wo das Meer splittert …“", { questobjekt: "inschrift" }),
      iaU("kammer_tor", 48, 3.6, "Ein Tor aus Sandstein mit einem Auge. Es öffnet sich nur, wenn das Licht es trifft.", { tat: "tempel_kammer", knopf: "Die Kammer betreten", ziel: [KAMMER_U[0] * 32 + 16, KAMMER_U[1] * 32 + 27] })] };
  vorschlag.spiegelplatten = SPIEGELPLATTEN.map(([x, y], i) => ({ id: "spiegelplatte_" + (i + 1), x: ox + x, y: oy + y }));
  schreibeGebiet("tempel", { name: "Der versandete Tempel", untertitel: "Unter den Tafelbergen der Glutsande", ursprung: TEMPEL_U, chunks: [3, 2], biom: "hoehle", stufe: 9, ebene: "untergrund" }, g, dinge, spiel);
  /* Kammer der Sandmutter (32 × 32, Instanz): runder Sandsaal, vier Säulen, Sandfelder in der Mitte (die Sandmutter gräbt sich ein) */
  const gk = raster(32, 32, (x, y) => Math.hypot(x - 16, y - 14) < 12.5 + 0.6 * zw(x, y) || (Math.abs(x - 16) < 2 && y > 24 && y < 31));
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) if (gk[y][x] === "h" && Math.hypot(x + 0.5 - 16, y + 0.5 - 14) < 6 + 0.8 * zw(x, y)) gk[y][x] = "s";
  let mk = 0; const ok = (objekt, x, y, mehr = {}) => ({ id: objekt.replace(/^(k|hoehle|moor|wz)_/, "").replace(/_\d+$/, "") + "_" + ++mk, objekt, x, y, ...mehr });
  const dk = [...[[8, 7], [24, 7], [8, 21], [24, 21]].map(([x, y]) => ok("hoehle_steinsaeule_01", x, y)), ...[[5, 14], [27, 14], [16, 3.5]].map(([x, y]) => ok("moor_feuerkorb_01", x, y))];
  schreibeGebiet("tempel_kammer", { name: "Die Kammer der Sandmutter", untertitel: "Instanz", ursprung: KAMMER_U, chunks: [1, 1], biom: "hoehle", stufe: 10, ebene: "untergrund" }, gk, dk,
    { start: [[16, 27]], figuren: [], spawnzonen: [], ausgaenge: [], kollision: { sperren: [], freigeben: [] },
      interaktionen: [iaU("kammer_ausgang", 16, 29, "Zurück in den Tempel.", { tat: "tempel_kammer_zurueck", knopf: "Zurück", ziel: [ox + 48, oy + 9.5] }), iaU("kartenstueck_5", 16, 5.4, "Im Sand, unter dem Tor, ein Stück Pergament: ein Teil einer Karte.", { questobjekt: "kartenstueck_5" })] }); }

/* ───── Waldmark: das Archiv im Rathaus (vom Ratssaal aus; eigenes Innengebiet) ───── */
const ARCHIV_U = [356, 300];
{ const g = raster(32, 32, (x, y) => x > 11 && x < 21 && y > 13 && y < 21); for (const z of g) for (let i = 0; i < 32; i++) z[i] = z[i] === "h" ? "d" : "X";
  let ma = 0; const oa = (objekt, x, y, mehr = {}) => ({ id: objekt.replace(/^(k|hoehle|graufurt)_/, "").replace(/_\d+$/, "") + "_" + ++ma, objekt, x, y, ...mehr });
  const dinge = [oa("graufurt_waechterbuch", 16.5, 15.6), oa("hoehle_tisch_01", 13.6, 17.6), oa("k_kiste", 19.6, 15.2), oa("k_kiste", 19.6, 17.0), oa("k_faesser", 12.8, 14.8)];
  const [rx, ry] = [RATSSAAL_U[0] * 32, RATSSAAL_U[1] * 32];
  schreibeGebiet("rathaus_archiv", { name: "Das Archiv", untertitel: "Im Rathaus der Waldmark", ursprung: ARCHIV_U, chunks: [1, 1], biom: "innen", stufe: 1, ebene: "innen" }, g, dinge,
    { start: [[16.5, 19.5]], figuren: [], spawnzonen: [], ausgaenge: [], kollision: { sperren: [], freigeben: [] },
      interaktionen: [iaU("archiv_hinaus", 16.5, 20.4, "Die Tür zurück in den Ratssaal.", { tat: "archiv_hinaus", knopf: "Zurück in den Ratssaal", ziel: RATSSAAL_OBEN }),
        iaU("archiv_regal", 16.5, 17.2, "Regale voller Akten: Grenzsteine, Erbstreitigkeiten, Wachdienstpläne der alten Wacht."),
        iaU("kartenstueck_1", 13.6, 19.0, "Zwischen zwei Akten der Wacht steckt ein zerrissenes Pergament: ein Stück einer Karte. Darauf ein Turm über drei Wellen.", { questobjekt: "kartenstueck_1" })] });
  vorschlag.archiv = { region: "rathaus_archiv", eingang: "archiv_tuer (im Ratssaal, rathaus.mjs)", ziel: [ARCHIV_U[0] * 32 + 16.5, ARCHIV_U[1] * 32 + 19.5] }; }

/* ───── Plan schreiben ───── */
const patches = []; { const keys = [...feld.keys()].map((k) => k.split(",").map(Number)); const x0 = Math.min(...keys.map((k) => k[0])), y0 = Math.min(...keys.map((k) => k[1])), x1 = Math.max(...keys.map((k) => k[0])), y1 = Math.max(...keys.map((k) => k[1]));
  for (let ya = y0; ya <= y1; ya += 64) { const zeilen = []; for (let y = ya; y < Math.min(ya + 64, y1 + 1); y++) { let z = ""; for (let x = x0; x <= x1; x++) z += feld.get(x + "," + y) || " "; zeilen.push(z); } if (zeilen.some((z) => z.trim())) patches.push({ x0, y0: ya, zeilen }); } }
const hoehen = [...hoehe.entries()].filter(([, h]) => Math.abs(h) > 0.01).map(([k, h]) => [...k.split(",").map(Number), +h.toFixed(2)]);
writeFileSync(join(WELT, "festland", "plan_glutsande.json"), JSON.stringify({ hinweis: "Erzeugt von werkzeug/welt/glutsande.mjs – festland.py arbeitet es ein. Weltfelder.", gelaende: patches, hoehen, eben, objekte, interaktionen, sperren, freigeben }) + "\n");
writeFileSync(join(WELT, "glutsande_orte.json"), JSON.stringify({ hinweis: "Phase 9 (Welt #74): NPC-Plätze, Gegnerlager, Rohstoffe und Questorte als Vorschlag (Weltfelder).", orte: ORTE, npc, ...vorschlag }, null, 1) + "\n");
export const ARCHIV_ZIEL = vorschlag.archiv.ziel;
console.log(`Glutsande: ${feld.size} Geländefelder, ${hoehen.length} Höhenfelder, ${objekte.length} Objekte, ${interaktionen.length} Interaktionen, ${npc.length} NPC-Plätze`);
