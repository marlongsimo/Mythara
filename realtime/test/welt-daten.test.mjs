/*
 * Mythara Echtzeit – Prüfung: Datenmodell der World Pipeline (Bibliotheken, Beispielregion, Formprüfung).
 * Aufruf (im Ordner realtime): node test/welt-daten.test.mjs
 */
import { gemeinsam, bibliothek, region, formPruefen } from "../werkzeug/welt/laden.mjs";
let ok = true; const check = (b, t) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) ok = false; };
const G = await gemeinsam(), bib = bibliothek(), gegner = new Set(Object.keys(G.MONSTER));
const kopie = (v) => JSON.parse(JSON.stringify(v));
const hat = (liste, teil) => liste.some((f) => f.includes(teil));

check(G.FELD_PX === 48 && G.CHUNK_FELDER === 32 && G.CHUNK_PX === 1536, "Maße: Rechenfeld 48 px, Chunk 32 × 32 Rechenfelder = 1536 px");
const alles = await formPruefen();
check(Object.values(alles).every((f) => f.length === 0), `Bibliotheken und alle Regionen sind in Ordnung (${Object.keys(alles).join(", ")})`);

const d = region("beispiel"), pruefe = (x) => G.regionFehler(x, bib.gelaende, bib.objekte, gegner);
check(d.gelaende.length === 64 && d.gelaende.every((z) => z.length === 64), "Beispielregion: 2 × 2 Chunks = 64 × 64 Rechenfelder");
check(G.zurWelt({ ...d.region, ursprung: [3, 1] }, 1.5, 2)[0] === 97.5 && G.chunkVon(97.5) === 3 && G.chunkName(3, 1) === "3_1", "Regionskoordinaten ↔ Weltgitter");
check(G.inZone(d.spiel.spawnzonen[0].zone, 46, 26) && !G.inZone(d.spiel.spawnzonen[0].zone, 40, 26), "Zonen: Punkt innerhalb und außerhalb");

/* Fehlerhafte Daten müssen auffallen – jeweils genau eine Sache kaputt machen */
{ const k = kopie(d); k.objekte[1].id = k.objekte[0].id; check(hat(pruefe(k), "ist doppelt"), "doppelte Kennung einer Platzierung fällt auf"); }
{ const k = kopie(d); k.objekte[0].objekt = "gibt_es_nicht"; check(hat(pruefe(k), "nicht in der Objektbibliothek"), "unbekanntes Objekt fällt auf"); }
{ const k = kopie(d); k.objekte[0].x = 999; check(hat(pruefe(k), "objekte." + k.objekte[0].id + ".x"), "Objekt weit außerhalb der Region fällt auf"); }
{ const k = kopie(d); k.gelaende[5] = k.gelaende[5].slice(1); check(hat(pruefe(k), "gelaende Zeile 6"), "zu kurze Geländezeile fällt auf"); }
{ const k = kopie(d); k.gelaende[5] = "?" + k.gelaende[5].slice(1); check(hat(pruefe(k), "unbekanntes Zeichen „?“"), "unbekanntes Geländezeichen fällt auf"); }
{ const k = kopie(d); k.gelaende.pop(); check(hat(pruefe(k), "63 Zeilen"), "fehlende Geländezeile fällt auf"); }
{ const k = kopie(d); k.spiel.spawnzonen[0].gegner[0].art = "drache"; check(hat(pruefe(k), "Gegnerart „drache“ gibt es nicht"), "unbekannte Gegnerart fällt auf"); }
{ const k = kopie(d); k.spiel.interaktionen[0].objekt = "weg"; check(hat(pruefe(k), "Platzierung „weg“ gibt es nicht"), "Interaktion an fehlender Platzierung fällt auf"); }
{ const k = kopie(d); k.spiel.figuren[0].id = k.spiel.spawnzonen[0].id; check(hat(pruefe(k), "gibt es schon"), "gleiche Kennung in zwei Listen fällt auf"); }
{ const k = kopie(d); k.spiel.start = []; check(hat(pruefe(k), "spiel.start"), "fehlender Startpunkt fällt auf"); }
{ const k = kopie(d); k.spiel.ausgaenge[0].nach = { art: "kampf", ort: "weidenhain" }; check(hat(pruefe(k), "nach.kampf"), "Ausgang ohne Kampf fällt auf"); }
{ const k = kopie(d); k.region.chunks = [2, 3]; check(hat(pruefe(k), "erwartet 96"), "Regionsgröße und Geländekarte passen nicht zusammen: fällt auf"); }
{ const k = kopie(bib.objekte); delete k.objekte[0].anker; check(hat(G.objekteFehler(k), "Ankerpunkt"), "Objekt ohne Ankerpunkt fällt auf"); }
{ const k = kopie(bib.objekte); delete k.objekte[0].kollision; check(hat(G.objekteFehler(k), "kollision: fehlt"), "Objekt ohne Kollisionsangabe fällt auf"); }
{ const k = kopie(bib.gelaende); k.arten[1].zeichen = k.arten[0].zeichen; check(hat(G.gelaendeFehler(k), "doppelt vergeben"), "doppeltes Geländezeichen fällt auf"); }
{ const a = { ...d.region }, b = { ...d.region, id: "b", ursprung: [1, 1] }, c = { ...d.region, id: "c", ursprung: [2, 0] };
  check(G.ueberlappen(a, b) && !G.ueberlappen(a, c), "Regionen im Weltgitter: Überschneidung wird erkannt, Nachbarschaft ist erlaubt"); }

console.log(ok ? "\nWeltdaten: alles in Ordnung" : "\nWeltdaten: FEHLER"); process.exit(ok ? 0 : 1);
