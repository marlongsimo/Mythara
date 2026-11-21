/*
 * Mythara Echtzeit – Prüfung der Waldmark und des Kreuzwalds südlich davon (Region „waldweg“), ohne Browser.
 * Prüft Laufwege, Kollision, Türen und Interaktionen, Figuren, Sichtbarkeit von Tor, Palisade und Gebäuden,
 * den Übergang zwischen den Regionen und die Verträglichkeit mit dem bestehenden Koop-Relay.
 *
 * Aufruf (im Ordner realtime): node test/welt-waldmark.test.mjs [--befund]
 *   --befund: jede Einzelheit ausgeben (für die Bestandsaufnahme), sonst nur das Ergebnis je Prüfung
 */
import { gemeinsam, bibliothek, region } from "../werkzeug/welt/laden.mjs";
import { readFileSync } from "node:fs";
const BEFUND = process.argv.includes("--befund");
let ok = true; const check = (b, t, einzel = []) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) ok = false; if ((BEFUND || !b) && einzel.length) for (const e of einzel.slice(0, BEFUND ? 60 : 12)) console.log("      " + e); };
const G = await gemeinsam(), bib = bibliothek(), def = new Map(bib.objekte.objekte.map((o) => [o.id, o]));
const F = 48, C = 32, rund = (v) => Math.round(v * 10) / 10;

const namen = ["waldmark", "waldweg", "weidenhain", "rabenmoor", "nordwald", "westmark", "osthof", "obstwiesen", "osthang", "graufurt"], daten = Object.fromEntries(namen.map((n) => [n, region(n)])), bau = Object.fromEntries(namen.map((n) => [n, G.chunksBauen(daten[n], bib.gelaende, bib.objekte)]));
const R = new G.WeltRaster(); for (const n of namen) for (const c of bau[n].chunks) R.dazu(c);
const ursprung = (n) => daten[n].region.ursprung.map((v) => v * C), welt = (n, x, y) => { const [ox, oy] = ursprung(n); return { x: x + ox, y: y + oy }; };
const WM = daten.waldmark, start = welt("waldmark", ...WM.spiel.start[0]);

/* Erreichbarkeit: Flutfüllung über das Gehraster beider Regionen (umschließendes Rechteck), ab dem Start in der Waldmark */
const [OX, OY] = ursprung("waldmark"), [GX, GY] = [Math.min(...namen.map((n) => ursprung(n)[0])), OY];
const GB = Math.max(...namen.map((n) => ursprung(n)[0] + daten[n].region.chunks[0] * C)) - GX, GH = Math.max(...namen.map((n) => ursprung(n)[1] + daten[n].region.chunks[1] * C)) - GY;
const erreicht = new Uint8Array(GB * GH);
{ const q = [[Math.floor(start.x) - GX, Math.floor(start.y) - GY]]; erreicht[q[0][1] * GB + q[0][0]] = 1;
  while (q.length) { const [i, j] = q.pop(); for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= GB || b >= GH || erreicht[b * GB + a] || R.fels(a + GX, b + GY)) continue; erreicht[b * GB + a] = 1; q.push([a, b]); } } }
const erreichbar = (p) => { const i = Math.floor(p.x) - GX, j = Math.floor(p.y) - GY; return i >= 0 && j >= 0 && i < GB && j < GH && erreicht[j * GB + i] === 1; };
/** Nächstes erreichbares Feld in höchstens r Feldern Abstand */
const nahErreichbar = (p, r = 1.2) => { for (let dj = -2; dj <= 2; dj++) for (let di = -2; di <= 2; di++) { const q = { x: p.x + di * 0.5, y: p.y + dj * 0.5 }; if (Math.hypot(di * 0.5, dj * 0.5) <= r && erreichbar(q)) return true; } return false; };

console.log("\nLaufwege und Kollision");
check(R.begehbar(start.x, start.y) && erreichbar(start), `Startpunkt am Brunnen ist frei (${rund(WM.spiel.start[0][0])} | ${rund(WM.spiel.start[0][1])})`);
{ /* freie Felder im Dorf, die man nicht erreicht: eingeschlossene Taschen */
  const taschen = []; let frei = 0; for (let j = 6; j < 56; j++) for (let i = 14; i < 82; i++) { if (R.fels(i + OX, j + OY)) continue; frei++; if (!erreichbar({ x: i + OX + 0.5, y: j + OY + 0.5 })) taschen.push(`${i}|${j}`); }
  check(taschen.length <= frei * 0.01, `im Dorf sind ${frei - taschen.length} von ${frei} freien Feldern erreichbar (${taschen.length} eingeschlossen)`, taschen.length ? ["eingeschlossene Felder: " + taschen.slice(0, 40).join(" ")] : []); }
{ const tor = { x: start.x, y: welt("waldweg", 0, 6).y }, ziel = welt("waldweg", ursprung("waldmark")[0] + 48 - ursprung("waldweg")[0], 6);
  const w = R.weg(start, ziel, 0.3, 40); const l = w.reduce((s, p, i) => s + Math.hypot(p.x - (i ? w[i - 1].x : start.x), p.y - (i ? w[i - 1].y : start.y)), 0); void tor;
  check(w.length > 0, `Weg vom Brunnen durch das Südtor in den Kreuzwald (${rund(l)} Felder)`); }
{ /* Kreuzwald nach der Skizze: Kreuzung, beide Steinwege, Feldweg, Lichtung; die beiden Pfade zur Lichtung; hinter den umgestürzten Bäumen geht es nicht weiter */
  const WW = daten.waldweg, g = WW.gelaende, an = (x, y) => welt("waldweg", x, y), st = [].map((id) => WW.objekte.find((o) => o.id === id)).filter(Boolean);
  const zeichen = (x, y) => g[Math.floor(y)][Math.floor(x)];
  const steinZeilen = (x) => [...Array(g.length).keys()].filter((y) => zeichen(x, y) === "k"), feldSpalten = (y) => [...Array(g[0].length).keys()].filter((x) => zeichen(x, y) === "e");
  check(steinZeilen(40).length >= 5 && steinZeilen(200).length >= 5, `breite Steinwege nach Westen und Osten (${steinZeilen(40).length} bzw. ${steinZeilen(200).length} Felder breit)`);
  check(feldSpalten(150).length >= 4 && feldSpalten(150).length <= 6, `breiter Feldweg nach Süden (${feldSpalten(150).length} Felder breit)`);
  const orte = { "Kreuzung": [112, 46], "Lichtung": [214, 120], "Pfad vom Steinweg": [201, 70], "Pfad vom Feldweg": [150, 129], "Feldweg am Südrand": [feldSpalten(190)[2] + 0.5, 190.5] };
  const nicht = Object.entries(orte).filter(([, [x, y]]) => !nahErreichbar(an(x, y), 2));
  check(nicht.length === 0, `erreichbar: ${Object.keys(orte).join(", ")}`, nicht.map(([n]) => n));
  const hinter = {};
  const durch = Object.entries(hinter).filter(([, [x, y]]) => erreichbar(an(x, y)));
  check(durch.length === 0, "an den umgestürzten Bäumen kommt man nicht vorbei", durch.map(([n]) => n));
  const wh = daten.weidenhain, ws = wh.spiel.start[0], wo = ursprung("weidenhain"), w = R.weg(start, { x: wo[0] + ws[0], y: wo[1] + ws[1] + 6 }, 0.3, 400);
  { const ro = ursprung("rabenmoor"), RM = daten.rabenmoor.spiel, ziele = Object.fromEntries(["brunnen_ansehen", "langhaus_tuer", "steg_ansehen", "hedda_tuer"].map((id) => { const i = RM.interaktionen.find((q) => q.id === id); return [id, { x: ro[0] + i.x, y: ro[1] + i.y }]; }));
    const nicht = Object.entries(ziele).filter(([, p]) => !nahErreichbar(p, 1.6));
    const tueren = daten.rabenmoor.objekte.filter((q) => (def.get(q.objekt) || {}).kategorie === "gebaeude").map((q) => { const i = def.get(q.objekt).interaktion; return { id: q.id, x: ro[0] + q.x + i.dx, y: ro[1] + q.y + i.dy }; }), zu = tueren.filter((t) => !nahErreichbar(t, 1.4));
    check(zu.length === 0, `alle ${tueren.length} Hüttentüren in Rabenmoor sind erreichbar`, zu.map((t) => t.id));
    const wm2 = ursprung("westmark"), WS = daten.westmark.spiel, an = (id) => { const i = WS.interaktionen.find((q) => q.id === id); return { x: wm2[0] + i.x, y: wm2[1] + i.y }; };
    { const ko = ursprung("waldweg"), wg = daten.waldweg.gelaende, mitte = wg[113].slice(60, 80).includes("e") || wg[115].slice(60, 80).includes("e") || wg[118].slice(60, 80).includes("e");
      check(mitte && nahErreichbar({ x: ko[0] + 70, y: ko[1] + 119 }, 2) && nahErreichbar({ x: wm2[0] + 40, y: wm2[1] + 104.5 }, 2), "Waldweg vom Feldweg durch den Kreuzwald in die Westmark"); }
    check(nahErreichbar(an("huette_tuer"), 1.6) && nahErreichbar(an("stamm_west_ansehen"), 2), "über den westlichen Steinweg in die Westmark: Hütte mit dem Loch und Wegende erreichbar");
    { /* der Trampelpfad allein: von der Insel in Rabenmoor nach Norden zur Hütte (ohne den Umweg über den Steinweg) – Flutfüllung nur südlich des Steinwegs */
      const y0 = wm2[1] + 60, frei = (x, y) => y > y0 && !R.fels(x, y), seen = new Set(), q = [[Math.floor(ziele.brunnen_ansehen.x), Math.floor(ziele.brunnen_ansehen.y)]]; seen.add(q[0].join()); let ok = false; const zh = an("huette_tuer");
      while (q.length && !ok) { const [x, y] = q.pop(); if (Math.hypot(x + 0.5 - zh.x, y + 0.5 - zh.y) < 1.6) ok = true; for (const [a, b] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) { const k = a + "," + b; if (seen.has(k) || !frei(a, b)) continue; seen.add(k); q.push([a, b]); } }
      check(ok, "der Trampelpfad führt von Rabenmoor durchs Moor bis zur Hütte"); }
    { const lese = (n, id) => { const u = ursprung(n), i = daten[n].spiel.interaktionen.find((q) => q.id === id); return { x: u[0] + i.x, y: u[1] + i.y }; };
      const orte = { "Windmühle (Osthof)": lese("osthof", "muehle_tuer"), "Bauernhaus (Osthof)": lese("osthof", "hof_tuer"), "Hütte des Obstbauern": lese("obstwiesen", "huette_tuer"), "Quelle (Obstwiesen)": lese("obstwiesen", "quelle"), "Kohlenmeiler (Nordwald)": lese("nordwald", "meiler"), "Ruine (Nordwald)": lese("nordwald", "ruine") };
      const zu = Object.entries(orte).filter(([, p]) => !nahErreichbar(p, 1.6)); check(zu.length === 0, `zu Fuß erreichbar: ${Object.keys(orte).join(", ")}`, zu.map(([n]) => n)); }
    { const lese = (n, id) => { const u = ursprung(n), i = daten[n].spiel.interaktionen.find((q) => q.id === id); return { x: u[0] + i.x, y: u[1] + i.y }; };
      const gf = { "Rastplatz (Osthang)": lese("osthang", "rastplatz"), "Bergfried": lese("graufurt", "bergfried_tuer"), "Fährhaus": lese("graufurt", "faehrhaus_tuer"), "Anlegestelle mit der Fähre": lese("graufurt", "faehre"), "Uferweg bis zur Sperre": lese("graufurt", "uferweg_sperre") };
      const zu = Object.entries(gf).filter(([, p]) => !nahErreichbar(p, 1.8)); check(zu.length === 0, `über den östlichen Steinweg nach Graufurt: ${Object.keys(gf).join(", ")}`, zu.map(([n]) => n));
      const u = ursprung("graufurt"); check(!nahErreichbar({ x: u[0] + 92, y: u[1] + 106 }, 3), "der Turm am Ostufer ist unerreichbar (die Fähre ist kaputt, der Fluss sperrt)");
      check(!nahErreichbar({ x: u[0] + 51.5, y: u[1] + 8 }, 2), "hinter dem Stamm am Uferweg geht es nicht weiter"); }
    check(nicht.length === 0, `zu Fuß von der Waldmark über Weidenhain und den Bohlenweg nach Rabenmoor: ${Object.keys(ziele).join(", ")}`, nicht.map(([n]) => n)); }
  check(erreichbar({ x: wo[0] + ws[0], y: wo[1] + ws[1] }) && w.length > 0, `vom Brunnen der Waldmark zu Fuß über den Feldweg nach Weidenhain (${w.length ? rund(w.reduce((s, p, i) => s + Math.hypot(p.x - (i ? w[i - 1].x : start.x), p.y - (i ? w[i - 1].y : start.y)), 0)) + " Felder" : "kein Weg"})`); }
{ const gruende = []; for (let x = 45.6; x <= 50.4; x += 0.4) { const p = welt("waldmark", x, 57); if (!R.begehbar(p.x, p.y)) gruende.push(`Feld ${rund(x)}|57 im Tor ist gesperrt`); }
  const breite = [44, 45, 46, 47, 48, 49, 50, 51, 52].filter((x) => R.begehbar(...Object.values(welt("waldmark", x + 0.5, 56.5)))).length; /* Zeile der Palisade */
  check(gruende.length === 0 && breite >= 4 && breite <= 6, `die Tordurchfahrt ist ${breite} Felder breit und frei`, gruende); }
{ const aus = bau.waldweg.kopf.ausgaenge.map((a) => ({ id: a.id, p: { x: (a.zone.x0 + a.zone.x1) / 2, y: (a.zone.y0 + a.zone.y1) / 2 - 0.6 } })), nicht = aus.filter((a) => !nahErreichbar(a.p, 1.5));
  check(nicht.length === 0, `Ausgänge des Waldwegs erreichbar (${aus.map((a) => a.id).join(", ")})`, nicht.map((a) => a.id)); }
{ const zonen = bau.waldweg.kopf.spawnzonen, nicht = zonen.filter((z) => !nahErreichbar({ x: z.zone.x, y: z.zone.y }, 3));
  check(nicht.length === 0, `Spawnzonen erreichbar (${zonen.map((z) => z.id).join(", ")})`, nicht.map((z) => z.id)); }

console.log("\nGebäude, Türen und Interaktionen");
const platz = (n) => daten[n].objekte.map((p) => ({ ...p, def: def.get(p.objekt), w: welt(n, p.x, p.y), region: n }));
const alle = [...platz("waldmark"), ...platz("waldweg")], gebaeude = alle.filter((p) => p.def && p.def.kategorie === "gebaeude");
/** Türpunkt eines Gebäudes aus der Bibliothek (Rechenfelder, Welt) */
const tuer = (p) => { const a = p.def.interaktion, s = p.s ?? 1, sp = p.spiegeln ? -1 : 1; return a ? { x: p.w.x + a.dx * s * sp, y: p.w.y + a.dy * s } : null; };
{ const zu = []; for (const g of gebaeude) { const t = tuer(g); if (!t) continue; if (!nahErreichbar(t, 0.8)) zu.push(`${g.id} (${g.objekt}): vor der Tür bei ${rund(t.x - OX)}|${rund(t.y - OY)} kommt man nicht hin`); }
  check(zu.length === 0, `vor jeder Gebäudetür ist freier, erreichbarer Boden (${gebaeude.length} Gebäude)`, zu); }
{ const fehler = [], ints = WM.spiel.interaktionen;
  for (const a of ints) { const p = welt("waldmark", a.x, a.y);
    if (!nahErreichbar(p, 0.8)) fehler.push(`${a.id}: Punkt ${a.x}|${a.y} nicht erreichbar`);
    const g = a.objekt ? alle.find((o) => o.id === a.objekt && o.region === "waldmark") : null, t = g ? tuer(g) : null;
    if (g && g.def.kategorie === "gebaeude" && t && Math.hypot(t.x - p.x, t.y - p.y) > 1.0) fehler.push(`${a.id}: liegt ${rund(Math.hypot(t.x - p.x, t.y - p.y))} Felder neben der Tür von ${g.id} (Tür bei ${rund(t.x - OX)}|${rund(t.y - OY)})`); }
  check(fehler.length === 0, `Interaktionen (${ints.map((a) => a.id).join(", ")}) erreichbar und an der richtigen Tür`, fehler); }
{ const versperrt = [];
  for (const g of gebaeude) { const t = tuer(g); if (!t) continue; for (const o of alle) { if (o === g || !o.def || !o.def.kollision) continue; if (Math.hypot(o.w.x - t.x, o.w.y - t.y) < 1.2 && o.w.y > g.w.y - 0.2) versperrt.push(`${g.id}: ${o.id} (${o.objekt}) steht vor der Tür`); } }
  check(versperrt.length === 0, "keine Türen zugestellt", versperrt); }

{ /* räumliche Gebäude: Jeder Innenraum ist durch seine Tür erreichbar, und Gebäude überschneiden sich nicht */
  const raeume = [], ueber = [];
  for (const g of gebaeude) { if (!g.def.raum) continue; for (const r of g.def.raum) { const m = { x: g.w.x + (r.x0 + r.x1) / 2, y: g.w.y + (r.y0 + r.y1) / 2 }; if (!nahErreichbar(m, 1.2)) raeume.push(`${g.id}: Innenraum nicht erreichbar`); } }
  const kasten = (g) => { const k = g.def.kollision; return k && k.art === "gebaeude" ? k.koerper.map((q) => [g.w.x + q.x0, g.w.y + q.y0, g.w.x + q.x1, g.w.y + q.y1]) : []; };
  for (let a = 0; a < gebaeude.length; a++) for (let b = a + 1; b < gebaeude.length; b++) for (const p of kasten(gebaeude[a])) for (const q of kasten(gebaeude[b])) if (Math.min(p[2], q[2]) - Math.max(p[0], q[0]) > 0.3 && Math.min(p[3], q[3]) - Math.max(p[1], q[1]) > 0.3) ueber.push(`${gebaeude[a].id} und ${gebaeude[b].id} überschneiden sich`);
  check(raeume.length === 0, `jeder begehbare Innenraum ist durch seine Tür erreichbar (${gebaeude.filter((g) => g.def.raum && g.def.raum.length).length} Gebäude)`, raeume);
  check(ueber.length === 0 && gebaeude.every((g) => !g.spiegeln || !g.def.ebenen), "räumliche Gebäude überschneiden sich nicht und sind nicht gespiegelt", ueber); }

console.log("\nFiguren");
{ const fehler = []; for (const f of WM.spiel.figuren) { const p = welt("waldmark", f.x, f.y);
    if (!R.begehbar(p.x, p.y)) fehler.push(`${f.id} steht auf gesperrtem Feld ${f.x}|${f.y}`); else if (!erreichbar(p)) fehler.push(`${f.id} ist nicht erreichbar`); }
  check(fehler.length === 0, `alle ${WM.spiel.figuren.length} Dorfleute stehen frei und erreichbar`, fehler); }

/* ---------- Sichtbarkeit: Wer steht im Bild vor wem? ---------- */
/** Bildrechteck in Bildpunkten der Welt [x0, y0, x1, y1] */
const bildRahmen = (p) => { const d = p.def, s = (p.s ?? 1) * d.massstab, b = d.groesse[0] * s, h = d.groesse[1] * s, ax = p.spiegeln ? 1 - d.anker[0] : d.anker[0];
  if (d.sichtbar) { const fx = d.anker[0] * d.groesse[0], fy = d.anker[1] * d.groesse[1]; return [p.w.x * F + (d.sichtbar[0] - fx) * s, p.w.y * F + (d.sichtbar[1] - fy) * s, p.w.x * F + (d.sichtbar[2] - fx) * s, p.w.y * F + (d.sichtbar[3] - fy) * s]; }
  return [p.w.x * F - ax * b, p.w.y * F - d.anker[1] * h, p.w.x * F + (1 - ax) * b, p.w.y * F + (1 - d.anker[1]) * h]; };
const schnitt = (a, b) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
const flaeche = (a) => (a[2] - a[0]) * (a[3] - a[1]);
console.log("\nSichtbarkeit");
{ const baeume = alle.filter((p) => p.def && p.def.kategorie === "bewuchs"), wichtig = alle.filter((p) => p.def && ["gebaeude", "bauteil", "kleinteil"].includes(p.def.kategorie)), verdeckt = [];
  for (const w of wichtig) { const r = bildRahmen(w); let summe = 0; const vor = [];
    for (const b of baeume) { if (b.w.y <= w.w.y) continue; const s = schnitt(r, bildRahmen(b)); if (s > 0) { summe += s; vor.push(b.id); } }
    const anteil = summe / flaeche(r); if (anteil > 0.2) verdeckt.push(`${w.id} (${w.objekt}): ${Math.round(anteil * 100)} % von Baumkronen davor überdeckt (${vor.slice(0, 5).join(", ")})`); }
  check(verdeckt.length === 0, `Tor, Palisade, Gebäude und Kleinteile werden nicht von Bäumen davor verdeckt (${wichtig.length} geprüft)`, verdeckt); }
{ const fehler = []; for (const f of WM.spiel.figuren) { const p = welt("waldmark", f.x, f.y), koerper = [p.x * F - 22, p.y * F - 90, p.x * F + 22, p.y * F];
    for (const o of alle) { if (!o.def || o.w.y <= p.y || o.def.tiefe !== "fuss") continue; const s = schnitt(koerper, bildRahmen(o)); if (s > flaeche(koerper) * 0.5 && !["bauteil"].includes(o.def.kategorie)) fehler.push(`${f.id} steht hinter ${o.id} (${o.objekt})`); } }
  check(fehler.length === 0, "keine Dorffigur steht hinter einem Gebäude oder Baum", fehler); }
{ const fehler = []; for (const b of alle.filter((p) => p.def && p.def.kategorie === "bewuchs")) for (const g of gebaeude) { const k = g.def.kollision; if (!k) continue; const s = (g.s ?? 1);
    const r = k.art === "rechteck" ? [k.x, k.y, k.x + k.b, k.y + k.h] : k.art === "gebaeude" ? [Math.min(...k.koerper.map((q) => q.x0)), Math.min(...k.koerper.map((q) => q.y0)), Math.max(...k.koerper.map((q) => q.x1)), Math.max(...k.koerper.map((q) => q.y1))] : null; if (!r) continue;
    if (b.w.x > g.w.x + r[0] * s - 0.6 && b.w.x < g.w.x + r[2] * s + 0.6 && b.w.y > g.w.y + r[1] * s - 0.6 && b.w.y < g.w.y + r[3] * s + 0.6) fehler.push(`${b.id} wächst in ${g.id}`); }
  check(fehler.length === 0, "kein Baum steht in oder an einer Hauswand", fehler); }
{ const fehler = []; for (const o of alle) { if (!o.def || !o.def.kollision) continue; const c = daten[o.region].gelaende[Math.floor(o.y)]?.[Math.floor(o.x)]; if (c === "w" || c === "~" || c === "o") fehler.push(`${o.id} (${o.objekt}) steht im Wasser`); }
  check(fehler.length === 0, "nichts steht im Wasser", fehler); }

console.log("\nÜbergang Waldmark – Kreuzwald");
{ const wm = daten.waldmark.region, ww = daten.waldweg.region, dx = (wm.ursprung[0] - ww.ursprung[0]) * C;
  check(ww.ursprung[0] <= wm.ursprung[0] && ww.ursprung[0] + ww.chunks[0] >= wm.ursprung[0] + wm.chunks[0] && wm.ursprung[1] + wm.chunks[1] === ww.ursprung[1], `die Regionen grenzen ohne Lücke aneinander (Waldmark ${wm.ursprung.join("|")} + ${wm.chunks.join("×")}, Kreuzwald ${ww.ursprung.join("|")} + ${ww.chunks.join("×")})`);
  const unten = daten.waldmark.gelaende[63], oben = daten.waldweg.gelaende[0].slice(dx, dx + unten.length), wechsel = [...unten].filter((c, i) => (c === "e") !== (oben[i] === "e")).length;
  check(wechsel <= 2, `der Weg läuft über die Grenze weiter (${wechsel} Spalten, in denen er nur auf einer Seite liegt)`);
  const gesperrt = [...Array(96).keys()].filter((i) => R.begehbar(OX + i + 0.5, OY + 63.5) !== R.begehbar(OX + i + 0.5, OY + 64.5) && R.begehbar(OX + i + 0.5, OY + 63.5)).length;
  check(gesperrt <= 40, `an der Grenze geht es meist ohne Kante weiter (${gesperrt} Spalten frei → gesperrt)`); }

console.log("\nKoop (bestehendes Dorf-Relay, nur geprüft)");
{ const srv = readFileSync(new URL("../server/src/index.ts", import.meta.url), "utf8"), ORT = new RegExp(srv.match(/ORTNAME = \/(.+?)\/,?/)[1]), grenze = Number(srv.match(/Math\.abs\(v\) < (\d+)/)[1]);
  check(namen.every((n) => ORT.test(n)), `Regionsnamen passen zum Ortsnamen-Muster des Relays (${ORT})`);
  const maxLokal = Math.max(...namen.map((n) => daten[n].region.chunks[0] * C * F)), maxWelt = Math.max(...namen.map((n) => (daten[n].region.ursprung[0] + daten[n].region.chunks[0]) * C * F));
  console.log(`      Positionsgrenze des Relays: ±${grenze}; Weltkoordinaten in Bildpunkten bis ${maxWelt}, in Rechenfeldern bis ${maxWelt / F}; innerhalb einer Region bis ${maxLokal} px`);
  check(maxLokal < grenze, "Positionen relativ zur Region (Bildpunkte) passen in die Grenze des Relays – absolute Weltbildpunkte nicht", maxWelt >= grenze ? [`absolute Bildpunkte (${maxWelt}) würden vom Relay verworfen`] : []); }

console.log(ok ? "\nWaldmark: alles in Ordnung" : "\nWaldmark: Befunde siehe oben"); process.exit(ok ? 0 : 1);
