/*
 * World Pipeline – Objekte auf Felder ausrichten (23.11.2026). Grundregel der Welt: Bild und Kollision decken sich feldgenau.
 *   Gebäude: die Südwestecke des ersten Baukörpers liegt auf einer Feldecke – mit ganzzahligen Bauplänen (Breite, Tiefe, Türen)
 *            liegen damit alle Wände auf Feldkanten und Türen sind ganze Felder breit.
 *   Alles andere mit Kollision (Bäume, Kisten, Zäune, Felsen …): die Form sitzt mittig auf den Feldern, die sie sperrt
 *            (ein Baum genau in der Mitte seines Feldes). Die gesperrten Felder ändern sich dabei nicht.
 *   Ohne Kollision (Schilf, Nebel, Brücken, Wasserbauten): unverändert.
 * Schreibt die Regionen (objekte.json) zurück. Läuft auch am Anfang von bauen.mjs mit, damit neu erzeugte Gebiete ausgerichtet bleiben.
 * Aufruf (im Ordner realtime): node werkzeug/welt/ausrichten.mjs [region …]
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { gemeinsam, bibliothek, region, regionNamen, WELT } from "./laden.mjs";

const r2 = (v) => Math.round(v * 100) / 100;
export async function ausrichten(namen, still = false) {
  const G = await gemeinsam(), bib = bibliothek(), OBJ = new Map(bib.objekte.objekte.map((o) => [o.id, o])), summe = { gebaeude: 0, dinge: 0, gleich: 0, frei: 0 };
  for (const n of namen) {
    const d = region(n, true) /* roh: schreibt objekte.json zurück – nie die ausgelichtete Liste */; let geaendert = false;
    for (const p of d.objekte) { const def = OBJ.get(p.objekt), k = def && def.kollision; if (!k) { summe.frei++; continue; }
      const alt = [p.x, p.y];
      if (k.art === "gebaeude") { const s = p.s ?? 1, x0 = k.koerper[0].x0 * s, y1 = k.koerper[0].y1 * s;
        p.x = r2(Math.round(p.x + x0) - x0); p.y = r2(Math.round(p.y + y1) - y1); summe.gebaeude++; }
      else { const felder = G.sperrFelder(p, def); if (!felder.length) { summe.frei++; continue; }
        const i0 = Math.min(...felder.map((f) => f[0])), i1 = Math.max(...felder.map((f) => f[0])), j0 = Math.min(...felder.map((f) => f[1])), j1 = Math.max(...felder.map((f) => f[1]));
        const s = p.s ?? 1, sp = p.spiegeln ? -1 : 1; let mx, my;
        if (k.art === "kreis") { mx = p.x + (k.dx || 0) * s * sp; my = p.y + (k.dy || 0) * s; }
        else { const a = p.x + k.x * s * sp, b = p.x + (k.x + k.b) * s * sp; mx = (a + b) / 2; my = p.y + (k.y + k.h / 2) * s; }
        p.x = r2(p.x + (i0 + i1 + 1) / 2 - mx); p.y = r2(p.y + (j0 + j1 + 1) / 2 - my);
        const neu = G.sperrFelder(p, def), gleich = neu.length === felder.length && neu.every((f) => felder.some((g) => g[0] === f[0] && g[1] === f[1]));
        if (!gleich) { p.x = alt[0]; p.y = alt[1]; summe.gleich++; continue; }   /* sperrte jetzt andere Felder: lieber stehen lassen */
        summe.dinge++; }
      if (p.x !== alt[0] || p.y !== alt[1]) geaendert = true; }
    if (geaendert) writeFileSync(join(WELT, "regionen", n, "objekte.json"), "[\n" + d.objekte.map((p) => " " + JSON.stringify(p)).join(",\n") + "\n]\n");
  }
  if (!still) console.log(`ausgerichtet: ${summe.gebaeude} Gebäude, ${summe.dinge} Dinge mit Kollision${summe.gleich ? `, ${summe.gleich} unverändert (hätten andere Felder gesperrt)` : ""}, ${summe.frei} ohne Kollision`);
  return summe;
}
if (process.argv[1] && process.argv[1].endsWith("ausrichten.mjs")) { const a = process.argv.slice(2); await ausrichten(a.length ? a : regionNamen()); }
