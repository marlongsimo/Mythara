/* Zonen Stufe 2 (25.11.2026): EINE Kampfwelt für die ganze offene Welt.
   Prüft die zusammengesetzte Karte „welt“: alle Regionen in einer Simulation, Lager mit den Werten ihres Gebiets,
   Wege über Regionsgrenzen, Wegsuche auf der großen Karte schnell genug, Region nach Weltfeld. */
import { Sim, KARTEN, FEIN, setzeKarte, setzeStaerke, WELTZONEN, WELTZONE, weltRegionBei, ORTSTUFE, STRECKEN, darfKaempfen, KB, KH, weg } from "./sim.gebaut.mjs";
let ok = true; const check = (b, t) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) ok = false; };
const lauf = (s, sek) => { for (let i = 0; i < sek * 20; i++) s.schritt(); };

console.log("Eine Kampfwelt:");
const regionen = Object.keys(WELTZONEN);
check(regionen.length >= 15 && regionen.every((r) => WELTZONEN[r] === WELTZONE), `Alle ${regionen.length} Regionen (auch die Waldmark) gehören zur selben Kampfwelt`);
check(WELTZONE.karte === "welt" && KARTEN.welt && KARTEN.welt.ursprung[0] === WELTZONE.x0 && KARTEN.welt.ursprung[1] === WELTZONE.y0, `Karte „welt“ ab Weltfeld ${WELTZONE.x0}|${WELTZONE.y0}, ${WELTZONE.b} × ${WELTZONE.h} Felder`);
check(STRECKEN.has("welt") && ORTSTUFE.welt === 1 && darfKaempfen(new Set(), "welt", "welt"), "Der Server lässt die Kampfwelt zu (Strecke, Stufe, immer frei)");
const t0 = performance.now(); setzeKarte(KARTEN.welt, FEIN); setzeStaerke(1, 1); const tKarte = performance.now() - t0;
check(KB === WELTZONE.b && KH === WELTZONE.h, `Raster gesetzt: ${KB} × ${KH} (${tKarte.toFixed(0)} ms)`);

const s = Sim.welt(7, undefined, true), gegner = () => s.wesen.filter((w) => !w.held);
const typen = {}; for (const w of gegner()) typen[w.typ] = (typen[w.typ] || 0) + 1;
check(gegner().length === KARTEN.welt.lager.length && gegner().length >= 30, `Alle Lager in einer Simulation: ${gegner().length} Gegner (${Object.entries(typen).map(([t, n]) => n + " " + t).join(", ")})`);
const welt = (w) => ({ x: WELTZONE.x0 + w.x, y: WELTZONE.y0 + w.y });
const imGebiet = (w, r) => weltRegionBei(welt(w).x, welt(w).y) === r;
check(gegner().filter((w) => w.typ === "bandit_dolch" && imGebiet(w, "waldweg")).length === 4, "Vier Dolch-Banditen auf der Lichtung im Kreuzwald");
check(gegner().filter((w) => w.typ === "kuh").every((w) => imGebiet(w, "osthof")), "Die Kühe stehen im Osthof");
check(gegner().filter((w) => w.typ === "waldgolem").every((w) => imGebiet(w, "nordwald") && w.lagerAggro === 4 && w.lagerLeine === 10), "Waldgolems im Nordwald mit Aggro 4 und Leine 10 (Werte ihres Gebiets)");
check(gegner().filter((w) => w.typ === "mooshocker").every((w) => w.lagerAggro === 0 && w.lagerLeine === 8 && w.lagerWandern === 2), "Mooshocker im Osthof: passiv (Aggro 0), Leine 8, Streifen 2");
check(gegner().filter((w) => imGebiet(w, "unterschlupf")).every((w) => w.lagerStufe === 4), "Banditen im Unterschlupf mit Stufe 4 (Splitter wie bisher)");
check(new Set(gegner().map((w) => w.gruppe)).size === gegner().length, "Jedes Lager hat eine eigene Gruppe (keine Verwechslung über Gebiete hinweg)");
{ const M = KARTEN.welt.mehrkampf; const u = gegner().filter((w) => imGebiet(w, "unterschlupf")).map(welt);
  check(M.length === 1 && u.some((p) => p.x - WELTZONE.x0 >= M[0][0] && p.x - WELTZONE.x0 <= M[0][2] && p.y - WELTZONE.y0 >= M[0][1] && p.y - WELTZONE.y0 <= M[0][3]), "Die Mehrkampf-Halle des Unterschlupfs liegt in Weltfeldern an der richtigen Stelle"); }
check(weltRegionBei(6440, 6400) === "waldmark" && weltRegionBei(6544, 6578) === "waldweg" && weltRegionBei(6530, 6410) === "osthof", "Region nach Weltfeld: Waldmark, Kreuzwald, Osthof");

/* Ein Held geht aus der Waldmark durchs Südtor in den Kreuzwald – in derselben Simulation */
const start = { x: 6448 - WELTZONE.x0, y: 6450 - WELTZONE.y0 }, id = s.beitreten("schildwaechter", 0, start), h = s.nach(id);
check(imGebiet(h, "waldmark"), `Held betritt die Kampfwelt in der Waldmark (${welt(h).x.toFixed(1)}|${welt(h).y.toFixed(1)})`);
const ziel = { x: 6448 - WELTZONE.x0, y: 6475 - WELTZONE.y0 };
const tw = performance.now(); const pfad = weg(h, ziel, 0.3, true); const tWeg = performance.now() - tw;
check(pfad.length > 0, `Weg über die Regionsgrenze gefunden (${pfad.length} Felder, ${tWeg.toFixed(1)} ms)`);
s.eingabe({ t: "lauf", x: ziel.x, y: ziel.y }, id); lauf(s, 25);
check(imGebiet(h, "waldweg"), `…und ist danach im Kreuzwald, ohne neue Simulation (${welt(h).x.toFixed(1)}|${welt(h).y.toFixed(1)})`);

/* Wegsuche auf der großen Karte: viele Suchen hintereinander bleiben schnell (früher legte jede Suche Felder für die ganze Karte an) */
{ const tt = performance.now(); let n = 0; for (const w of gegner().slice(0, 30)) { const p = weg(w, { x: w.heim.x + 6, y: w.heim.y + 4 }, 0.3, true); if (p) n++; } const ms = performance.now() - tt;
  check(ms < 600, `30 Wegsuchen von Gegnern: ${ms.toFixed(0)} ms`); }
{ const tt = performance.now(); lauf(s, 10); const ms = performance.now() - tt; check(ms < 4000, `10 s Kampfwelt mit allen Gegnern in ${ms.toFixed(0)} ms gerechnet`); }

console.log(ok ? "Kampfwelt: alles in Ordnung" : "Kampfwelt: FEHLER"); if (!ok) process.exit(1);
