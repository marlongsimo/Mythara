/*
 * World Pipeline – Nordwald und Westmark (nach der Skizze vom 21.11.2026):
 *   Nordwald (4 × 2 Chunks ab 196|200): dichter Wald westlich der Waldmark.
 *   Westmark (2 × 6 Chunks ab 196|202): oben dichter Wald; der westliche Steinweg aus dem Kreuzwald läuft durch bis an den Westrand
 *   (dort ein umgestürzter Baum); darunter ein Übergang von Wiese mit einzelnen Bäumen (Norden) zu kargem Moor (Süden, an Rabenmoor).
 *   Mittendrin eine verlassene Hütte mit einem Loch im Boden. Ein Trampelpfad führt von Rabenmoor durchs Moor an der Hütte vorbei hinauf zum Steinweg.
 * Gleich große Chunks im gemeinsamen Raster. Aufruf (im Ordner realtime): node werkzeug/welt/westmark.mjs   danach: node werkzeug/welt/bauen.mjs nordwald westmark
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WELT } from "./laden.mjs";

const BAUM = [null, "stil_eiche_01", "stil_eiche_02", "stil_tanne_01", "stil_herbst_01", "stil_tanne_02", "stil_linde_01"];
let saat = 57; const wurf = () => (saat = (saat * 1103515245 + 12345) % 2147483648) / 2147483648;
const strecke = (x, y, p) => { let d = Infinity; for (let i = 1; i < p.length; i++) { const [x0, y0] = p[i - 1], [x1, y1] = p[i], dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy))); d = Math.min(d, Math.hypot(x - x0 - t * dx, y - y0 - t * dy)); } return d; };
const BIB = new Map(JSON.parse(readFileSync(join(WELT, "bibliothek", "objekte.json"), "utf8")).objekte.map((o) => [o.id, o]));
const welle = (x, y) => Math.sin(x / 3.1 + y / 4.3) + 0.6 * Math.sin(y / 2.3 - x / 5.1);
const baumZufall = () => { const z = wurf(); return BAUM[z < 0.26 ? 1 : z < 0.5 ? 2 : z < 0.74 ? 3 : z < 0.8 ? 4 : z < 0.9 ? 5 : 6]; };
const schreibe = (id, region, g, objekte, spiel) => { const dir = join(WELT, "regionen", id); mkdirSync(dir, { recursive: true });
  for (const p of objekte) if (!BIB.has(p.objekt)) throw new Error("unbekanntes Objekt " + p.objekt);
  writeFileSync(join(dir, "region.json"), JSON.stringify(region, null, 1) + "\n"); writeFileSync(join(dir, "gelaende.txt"), g.map((z) => z.join("")).join("\n") + "\n");
  writeFileSync(join(dir, "objekte.json"), "[\n" + objekte.sort((a, b) => a.y - b.y).map((p) => " " + JSON.stringify(p)).join(",\n") + "\n]\n"); writeFileSync(join(dir, "spiel.json"), JSON.stringify(spiel, null, 1) + "\n");
  console.log(`${id}: ${g[0].length} × ${g.length} Felder, ${objekte.length} Objekte`); };
/** dichter Wald: Bäume mit Mindestabstand, wo `wo` wahr ist */
const wald = (B, H, wo, dichte = 0.95) => { const aus = [], gitter = new Map(), z = (x, y) => Math.floor(x / 3) + 4096 * Math.floor(y / 3);
  for (let i = 0; i < B * H * dichte; i++) { const x = +(wurf() * B).toFixed(2), y = +(wurf() * H).toFixed(2); if (!wo(x, y)) continue;
    let frei = true; for (let dj = -1; dj <= 1 && frei; dj++) for (let di = -1; di <= 1 && frei; di++) for (const p of gitter.get(z(x + di * 3, y + dj * 3)) || []) if (Math.hypot(p.x - x, p.y - y) < 2.3) { frei = false; break; }
    if (!frei) continue; const p = { id: "b" + String(aus.length + 1).padStart(4, "0"), objekt: baumZufall(), x, y, s: +(0.85 + wurf() * 0.27).toFixed(2), ...(wurf() < 0.5 ? { spiegeln: true } : {}) };
    aus.push(p); gitter.set(z(x, y), [...(gitter.get(z(x, y)) || []), p]); }
  return aus; };
const leer = { start: [], figuren: [], spawnzonen: [], interaktionen: [], ausgaenge: [], kollision: { sperren: [], freigeben: [] } };

/* ───── Nordwald ───── */
{ const B = 128, H = 64, K = { x: 88, y: 28, r: 10 }, PFAD = [[88, H + 1], [86.6, 50], [88, 38]];   /* Köhlerlichtung; der Pfad kommt aus dem Kreuzwald (dort x = 24) */
  const lichtung = (x, y) => Math.hypot((x - K.x) / K.r, (y - K.y) / (K.r * 0.8)) < 1 + 0.1 * welle(x, y);
  const g = Array.from({ length: H }, (_, y) => Array.from({ length: B }, (_, x) => { const cx = x + 0.5, cy = y + 0.5; return strecke(cx, cy, PFAD) < 1.0 ? "e" : lichtung(cx, cy) ? (welle(cx, cy) > 0.9 ? "t" : ".") : strecke(cx, cy, PFAD) < 2.4 ? "." : "f"; }));
  let n = 0; const o = (objekt, x, y, mehr = {}) => ({ id: objekt.replace(/^(dorf|wald|stil)_/, "").replace(/_\d+$/, "") + "_" + ++n, objekt, x, y, ...mehr });
  const dinge = [o("dorf_huette_holz_02", K.x - 4.5, K.y - 2), o("wald_meiler_01", K.x + 3.5, K.y + 1.5), o("wald_meiler_01", K.x + 6, K.y - 4.5, { s: 0.8 }), o("dorf_holzstapel_01", K.x - 0.5, K.y - 3.8), o("dorf_holzstapel_01", K.x + 1.5, K.y - 3.6),
    /* verfallene Halle aus Kenney-Teilen: Südmauer in zwei Stücken, Westmauer, eine Säulenreihe davor */
    o("k_ruine_mauer", K.x - 6.5, K.y + 7.2), o("k_ruine_mauer", K.x - 3.2, K.y + 7.2, { spiegeln: true }), o("k_ruine_mauer_tief", K.x - 8.3, K.y + 6.8),
    o("k_ruine_saeule", K.x - 0.6, K.y + 7.6), o("k_ruine_saeule_ganz", K.x + 1.6, K.y + 7.6), o("k_ruine_saeule", K.x - 0.6, K.y + 4.6, { spiegeln: true })];
  const baeume = wald(B, H, (x, y) => !lichtung(x, y) && Math.hypot(x - K.x, y - K.y) > K.r + 1 && strecke(x, y, PFAD) > 2.6, 1.1);
  const lies = (id, x, y, text) => ({ id, art: "lesen", x, y, radius: 1.6, abgleich: "keiner", daten: { text } });
  const spiel = { ...leer, start: [[88, 60]], interaktionen: [lies("meiler", K.x + 3.5, K.y + 2.9, "Ein Kohlenmeiler. Unter der Erde schwelt das Holz seit Tagen und wird zu Kohle für die Schmiede."),
    lies("ruine", K.x - 4.8, K.y + 8.4, "Mauerreste aus einer Zeit vor der Waldmark, halb vom Efeu verschluckt.")] };
  schreibe("nordwald", { id: "nordwald", name: "Der Nordwald", untertitel: "Dichter Wald mit einer Köhlerlichtung", ursprung: [196, 200], chunks: [4, 2], biom: "wald", stufe: 1 }, g, [...dinge, ...baeume], spiel); }

/* ───── Westmark ───── */
{ const B = 64, H = 192, TOR = 112, KY = 44, XK = 64;                 /* XK: so weit liegt der Kreuzwald (x = 0) östlich – derselbe Steinweg wie dort */
  const steinY = (x) => { const xk = x - XK; return KY + 2.6 * Math.sin((xk - TOR) / 21) + 1.3 * Math.sin((xk - TOR) / 8.3) * Math.min(1, Math.abs(xk - TOR) / 14); };
  const ENDE = 5, HUETTE = [30, 120];
  const PFAD = [[50.5, H + 1], [50, 178], [45, 160], [38, 140], [29.2, 121.2], [27, 104], [31, 84], [36, 66], [38, steinY(38) + 2]];   /* Trampelpfad von Rabenmoor zum Steinweg */
  const QUER = [[B + 1, 104], [52, 103], [40, 104.5], [28.2, 105]];   /* Waldweg aus dem Kreuzwald, trifft hier auf den Trampelpfad */
  const moor = (y) => Math.min(1, Math.max(0, (y - 104) / 70));       /* 0 = Wiese (Norden) … 1 = kahles Moor (Süden) */
  const g = []; for (let y = 0; y < H; y++) { const z = []; for (let x = 0; x < B; x++) { const cx = x + 0.5, cy = y + 0.5, s = steinY(cx), m = moor(cy), w = welle(cx, cy); let c;
    if (cx >= ENDE - 2 && Math.abs(cy - s) < 3.1) c = "k";
    else if (cy < s - 5 - 1.2 * w) c = "f";                                    /* dichter Wald nördlich des Weges */
    else if (cy < s + 5 + 1.2 * w) c = ".";                                    /* Wegsaum */
    else if (strecke(cx, cy, PFAD) < (m > 0.5 ? 1.1 : 0.95) || strecke(cx, cy, QUER) < 1.1) c = m > 0.45 ? "m" : "e";
    else if (strecke(cx, cy, QUER) < 2.6 + 0.6 * w) c = ".";
    else if (cx > B - 4 - 1.5 * w) c = "f";   /* Waldrand zum Kreuzwald – auf ganzer Länge, damit die Grenze bündig ist */                         /* Waldrand zum Kreuzwald */
    else if (m < 0.15) c = w > 1.1 ? "," : ".";
    else if (m < 0.55) c = w > 0.6 + m ? "t" : "v";
    else if (cy > H - 10 - 2 * w) c = strecke(cx, cy, PFAD) < 2.4 || cx > 53 + 2 * Math.sin(cy / 2) ? "t" : "o";   /* rechts unten Torf: dort stoßen Rabenmoors Waldsaum und der Kreuzwald an */  /* an Rabenmoor: offenes Moorwasser */
    else c = w > 1.05 ? "o" : w > 0.2 ? "t" : (w < -0.9 ? "m" : "v");
    z.push(c); } g.push(z); }
  const zeichen = (x, y) => g[Math.max(0, Math.min(H - 1, Math.floor(y)))][Math.max(0, Math.min(B - 1, Math.floor(x)))];
  let n = 0; const o = (objekt, x, y, mehr = {}) => ({ id: objekt.replace(/^(dorf|moor|wald|stil|k)_/, "").replace(/_\d+$/, "") + "_" + ++n, objekt, x: +x.toFixed(2), y: +y.toFixed(2), ...mehr });
  const nah = (x, y, r) => strecke(x, y, PFAD) < r || strecke(x, y, QUER) < r + 0.5 || Math.abs(y - steinY(x)) < r + 3 || Math.hypot(x - HUETTE[0], y - HUETTE[1] + 2) < 7;
  const dinge = [o("moor_huette_loch_01", ...HUETTE), o("wald_baumstamm_02", ENDE, steinY(ENDE) + 4.5), o("dorf_zaun_01", HUETTE[0] + 4.6, HUETTE[1] + 0.4), o("dorf_holzstapel_01", HUETTE[0] - 4.2, HUETTE[1] - 0.2)];
  /* einzelne Bäume auf der Wiese, nach Süden immer weniger und zuletzt nur noch tote Erlen; Schilf an den Moorlöchern */
  for (let i = 0; i < 3000 && dinge.length < 70; i++) { const x = +(3 + wurf() * (B - 8)).toFixed(2), y = +(steinY(30) + 8 + wurf() * (H - steinY(30) - 12)).toFixed(2), m = moor(y), c = zeichen(x, y);
    if (c === "o" || c === "f" || c === "m" || c === "e" || nah(x, y, 3) || dinge.some((d) => Math.hypot(d.x - x, d.y - y) < 6)) continue;
    if (wurf() > 0.5 - m * 0.2) continue;
    dinge.push(o(m < 0.35 ? [BAUM[1], BAUM[2], BAUM[6], "stil_birke_01"][Math.floor(wurf() * 4)] : m < 0.65 ? (wurf() < 0.5 ? "stil_birke_01" : "stil_erle_tot_02") : (wurf() < 0.5 ? "stil_erle_tot_01" : "stil_erle_tot_02"), x, y, { s: +(0.85 + wurf() * 0.25).toFixed(2), ...(wurf() < 0.5 ? { spiegeln: true } : {}) })); }
  const amUfer = (x, y) => zeichen(x, y) === "o" && [[1.5, 0], [-1.5, 0], [0, 1.5], [0, -1.5]].some(([dx, dy]) => zeichen(x + dx, y + dy) !== "o");
  for (let i = 0; i < 3000 && dinge.filter((d) => d.objekt.startsWith("stil_schilf")).length < 50; i++) { const x = +(wurf() * B).toFixed(2), y = +(120 + wurf() * (H - 120)).toFixed(2);
    if (amUfer(x, y) && !nah(x, y, 1.6) && !dinge.some((d) => Math.hypot(d.x - x, d.y - y) < 2.2)) dinge.push(o(wurf() < 0.5 ? "stil_schilf_01" : "stil_schilf_02", x, y)); }
  for (let i = 0; i < 400 && dinge.filter((d) => d.objekt === "moor_nebel_01").length < 5; i++) { const x = +(8 + wurf() * (B - 16)).toFixed(2), y = +(150 + wurf() * 36).toFixed(2);
    if (zeichen(x, y) === "o" && !dinge.some((d) => d.objekt === "moor_nebel_01" && Math.hypot(d.x - x, d.y - y) < 14)) dinge.push(o("moor_nebel_01", x, y, { s: 1.1 })); }
  const baeume = wald(B, H, (x, y) => zeichen(x, y) === "f" && !nah(x, y, 2.5));
  const lies = (id, x, y, text) => ({ id, art: "lesen", x: +x.toFixed(2), y: +y.toFixed(2), radius: 1.6, abgleich: "keiner", daten: { text } });
  const spiel = { ...leer, start: [[60, steinY(60)]],
    interaktionen: [lies("huette_tuer", HUETTE[0] - 0.8, HUETTE[1] + 0.7, "Eine verlassene Hütte. Die Tür hängt schief in den Angeln, drinnen riecht es nach feuchter Erde."),
      { id: "loch_abstieg", art: "eingang", x: HUETTE[0] + 0.4, y: HUETTE[1] - 1.2, radius: 1.4, abgleich: "keiner", daten: { text: "Mitten im Boden klafft ein Loch. Eine Leiter führt hinab in die Dunkelheit – von unten hört man Stimmen.", tat: "abstieg", knopf: "In das Loch hinabsteigen", ziel: [230 * 32 + 12, 230 * 32 + 31] } },
      lies("stamm_west_ansehen", ENDE + 1.6, steinY(ENDE), "Ein umgestürzter Baum versperrt den Steinweg. Hier geht es noch nicht weiter.")],
    kollision: { sperren: [{ art: "rechteck", x0: 0, y0: steinY(ENDE) - 6, x1: ENDE + 0.8, y1: steinY(ENDE) + 6 }], freigeben: [] } };
  schreibe("westmark", { id: "westmark", name: "Die Westmark", untertitel: "Wiesen und karges Moor am Westweg", ursprung: [196, 202], chunks: [2, 6], biom: "wiese", stufe: 1 }, g, [...dinge, ...baeume], spiel); }
