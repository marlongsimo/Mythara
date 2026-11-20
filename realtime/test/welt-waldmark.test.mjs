/*
 * Mythara Echtzeit – Prüfung der Waldmark und des Waldwegs (Regionen der offenen Welt), ohne Browser.
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

const namen = ["waldmark", "waldweg"], daten = Object.fromEntries(namen.map((n) => [n, region(n)])), bau = Object.fromEntries(namen.map((n) => [n, G.chunksBauen(daten[n], bib.gelaende, bib.objekte)]));
const R = new G.WeltRaster(); for (const n of namen) for (const c of bau[n].chunks) R.dazu(c);
const ursprung = (n) => daten[n].region.ursprung.map((v) => v * C), welt = (n, x, y) => { const [ox, oy] = ursprung(n); return { x: x + ox, y: y + oy }; };
const WM = daten.waldmark, start = welt("waldmark", ...WM.spiel.start[0]);

/* Erreichbarkeit: Flutfüllung über das Gehraster von beiden Regionen, ab dem Start in der Waldmark */
const B = 96, H = 128, [OX, OY] = ursprung("waldmark"), erreicht = new Uint8Array(B * H);
{ const q = [[Math.floor(start.x) - OX, Math.floor(start.y) - OY]]; erreicht[q[0][1] * B + q[0][0]] = 1;
  while (q.length) { const [i, j] = q.pop(); for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= B || b >= H || erreicht[b * B + a] || R.fels(a + OX, b + OY)) continue; erreicht[b * B + a] = 1; q.push([a, b]); } } }
const erreichbar = (p) => { const i = Math.floor(p.x) - OX, j = Math.floor(p.y) - OY; return i >= 0 && j >= 0 && i < B && j < H && erreicht[j * B + i] === 1; };
/** Nächstes erreichbares Feld in höchstens r Feldern Abstand */
const nahErreichbar = (p, r = 1.2) => { for (let dj = -2; dj <= 2; dj++) for (let di = -2; di <= 2; di++) { const q = { x: p.x + di * 0.5, y: p.y + dj * 0.5 }; if (Math.hypot(di * 0.5, dj * 0.5) <= r && erreichbar(q)) return true; } return false; };

console.log("\nLaufwege und Kollision");
check(R.begehbar(start.x, start.y) && erreichbar(start), `Startpunkt am Brunnen ist frei (${rund(WM.spiel.start[0][0])} | ${rund(WM.spiel.start[0][1])})`);
{ /* freie Felder im Dorf, die man nicht erreicht: eingeschlossene Taschen */
  const taschen = []; let frei = 0; for (let j = 6; j < 56; j++) for (let i = 14; i < 82; i++) { if (R.fels(i + OX, j + OY)) continue; frei++; if (!erreicht[j * B + i]) taschen.push(`${i}|${j}`); }
  check(taschen.length <= frei * 0.01, `im Dorf sind ${frei - taschen.length} von ${frei} freien Feldern erreichbar (${taschen.length} eingeschlossen)`, taschen.length ? ["eingeschlossene Felder: " + taschen.slice(0, 40).join(" ")] : []); }
{ const w = R.weg(start, welt("waldweg", 48, 6), 0.3, 40); const l = w.reduce((s, p, i) => s + Math.hypot(p.x - (i ? w[i - 1].x : start.x), p.y - (i ? w[i - 1].y : start.y)), 0);
  check(w.length > 0, `Weg vom Brunnen durch das Südtor auf den Waldweg (${rund(l)} Felder)`); }
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

console.log("\nFiguren");
{ const fehler = []; for (const f of WM.spiel.figuren) { const p = welt("waldmark", f.x, f.y);
    if (!R.begehbar(p.x, p.y)) fehler.push(`${f.id} steht auf gesperrtem Feld ${f.x}|${f.y}`); else if (!erreichbar(p)) fehler.push(`${f.id} ist nicht erreichbar`); }
  check(fehler.length === 0, `alle ${WM.spiel.figuren.length} Dorfleute stehen frei und erreichbar`, fehler); }

/* ---------- Sichtbarkeit: Wer steht im Bild vor wem? ---------- */
/** Bildrechteck in Bildpunkten der Welt [x0, y0, x1, y1] */
const bildRahmen = (p) => { const d = p.def, s = (p.s ?? 1) * d.massstab, b = d.groesse[0] * s, h = d.groesse[1] * s, ax = p.spiegeln ? 1 - d.anker[0] : d.anker[0];
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
{ const fehler = []; for (const b of alle.filter((p) => p.def && p.def.kategorie === "bewuchs")) for (const g of gebaeude) { const k = g.def.kollision; if (!k || k.art !== "rechteck") continue; const s = (g.s ?? 1);
    if (b.w.x > g.w.x + k.x * s - 0.6 && b.w.x < g.w.x + (k.x + k.b) * s + 0.6 && b.w.y > g.w.y + k.y * s - 0.6 && b.w.y < g.w.y + 0.6) fehler.push(`${b.id} wächst in ${g.id}`); }
  check(fehler.length === 0, "kein Baum steht in oder an einer Hauswand", fehler); }
{ const fehler = []; for (const o of alle) { if (!o.def || !o.def.kollision) continue; const c = daten[o.region].gelaende[Math.floor(o.y)]?.[Math.floor(o.x)]; if (c === "w" || c === "~" || c === "o") fehler.push(`${o.id} (${o.objekt}) steht im Wasser`); }
  check(fehler.length === 0, "nichts steht im Wasser", fehler); }

console.log("\nÜbergang Waldmark – Waldweg");
{ const wm = daten.waldmark.region, ww = daten.waldweg.region;
  check(wm.ursprung[0] === ww.ursprung[0] && wm.ursprung[1] + wm.chunks[1] === ww.ursprung[1] && wm.chunks[0] === ww.chunks[0], `die Regionen grenzen ohne Lücke aneinander (Waldmark ${wm.ursprung.join("|")} + ${wm.chunks.join("×")}, Waldweg ${ww.ursprung.join("|")})`);
  const unten = daten.waldmark.gelaende[63], oben = daten.waldweg.gelaende[0], wechsel = [...unten].filter((c, i) => (c === "e") !== (oben[i] === "e")).length;
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
