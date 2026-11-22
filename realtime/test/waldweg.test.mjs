/*
 * Mythara Echtzeit – Prüfung: der Waldweg von der Waldmark nach Weidenhain (Strecke mit Lichtung).
 * Aufruf (nach „node build.mjs“): node test/waldweg.test.mjs
 */
import { Sim, KARTEN, FEIN, setzeKarte, setzeStaerke, weg, begehbar, darfKaempfen } from "./sim.gebaut.mjs";
let ok = true; const check = (b, t) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) ok = false; };
const lauf = (s, sek) => { for (let i = 0; i < sek * 20; i++) s.schritt(); };
const K = KARTEN.waldweg, wegY = (x) => 9.7 + 1.1 * Math.sin((x + 2.0) / 5.2) - 0.5 * Math.sin(x / 13.0); /* Mitte des Wegs in gemalten Feldern */

setzeKarte(K, FEIN); setzeStaerke(1, 1);
const neu = (seed = 3) => new Sim("schildwaechter", seed, []);
{ const s = neu(), h = s.ich, mon = s.wesen.filter((w) => !w.held);
  check(mon.length === 6 && new Set(mon.map((m) => m.gruppe)).size === 2, "Auf der Lichtung: sechs Gegner in zwei Gruppen");
  check(h.x < 3 && Math.abs(h.y / FEIN - wegY(h.x / FEIN)) < 1, "Start am linken Rand auf dem Weg (Seite der Waldmark)");
  const rechts = { x: 39.6 * FEIN, y: wegY(39.6) * FEIN }, lichtung = { x: 20.8 * FEIN, y: 4.2 * FEIN };
  check(begehbar(rechts.x, rechts.y) && weg(h, rechts).length > 0, "Der Weg führt durchgehend bis nach Weidenhain");
  check(weg(h, lichtung).length > 0, "An der Kreuzung führt ein Pfad hinauf zur Lichtung");
  check(!begehbar(20 * FEIN, 14.5 * FEIN) && !begehbar(5 * FEIN, 3 * FEIN), "Der Wald neben dem Weg ist nicht begehbar");
  check(K.ausgaenge.map((a) => a.nach).join() === "waldmark,weidenhain", "Ausgänge: links Waldmark, rechts Weidenhain"); }

/* Auf dem Weg an der Kreuzung vorbei: Die Gegner bleiben auf der Lichtung */
{ const s = neu(5), h = s.ich, mon = s.wesen.filter((w) => !w.held); h.ruhe = 0;
  let geweckt = false; for (let x = 2; x <= 38; x += 0.25) { h.x = x * FEIN; h.y = wegY(x) * FEIN; s.schritt(); if (mon.some((m) => m.zielId)) geweckt = true; }
  check(!geweckt, "Wer auf dem Weg bleibt, wird nicht angegriffen"); }

/* Annähern: Ab 7 Rechenfeldern laufen sie los – die ganze Gruppe */
{ const s = neu(9), h = s.ich, mon = s.wesen.filter((w) => !w.held);
  const naechst = () => Math.min(...mon.map((o) => Math.hypot(o.x - h.x, o.y - h.y)));
  /* von unten den Pfad hinauf: die Stelle suchen, an der der nächste Gegner gerade so weit weg ist */
  const setze = (d) => { h.x = 20.6 * FEIN; for (let y = 8 * FEIN; y > 0; y -= 0.02) { h.y = y; if (naechst() <= d) return; } };
  setze(7.4); let d = naechst(); for (let i = 0; i < 20; i++) { s.schritt(); setze(7.4); }
  check(d > 7 && !mon.some((o) => o.zielId), `Abstand ${d.toFixed(1)}: alle bleiben ruhig`);
  setze(6.8); d = naechst(); s.schritt(); const nah = mon.reduce((a, o) => Math.hypot(o.x - h.x, o.y - h.y) < Math.hypot(a.x - h.x, a.y - h.y) ? o : a), gr = mon.filter((o) => o.gruppe === nah.gruppe), wach = gr.filter((o) => o.zielId === h.id).length;
  check(d <= 7 && nah.zielId === h.id, `Abstand ${d.toFixed(1)}: der Gegner greift an`);
  check(wach === gr.length && mon.filter((o) => o.zielId).length === gr.length, `Die ganze Gruppe kommt mit (${wach} von ${gr.length}), die andere Gruppe bleibt ruhig`);
  const m = nah;
  const vorher = Math.hypot(m.x - h.x, m.y - h.y); lauf(s, 0.6); const nachher = Math.hypot(m.x - h.x, m.y - h.y);
  check(nachher < vorher - 0.3, `Er läuft auf den Helden zu (${vorher.toFixed(1)} → ${nachher.toFixed(1)})`); }

/* Verfolgung: Wer zurück auf den Weg flieht, wird ein gutes Stück verfolgt (Leine 16), aber nicht bis ans Ende */
{ const s = neu(11), h = s.ich, mon = s.wesen.filter((w) => !w.held), m = mon[0]; h.x = m.x + 1.5; h.y = m.y + 5.5; s.schritt();
  check(m.zielId === h.id, "Angriff ausgelöst");
  h.x = 20.5 * FEIN; h.y = wegY(20.5) * FEIN; lauf(s, 0.2); const verfolgt = m.zielId === h.id; check(verfolgt, "Bis hinunter auf den Weg wird verfolgt");
  h.x = 36 * FEIN; h.y = wegY(36) * FEIN; lauf(s, 3); check(m.zielId === 0, "Weit weg auf dem Weg: Die Gegner geben auf"); }

/* Freigabe: Die Strecke darf man jederzeit gehen (Server prüft das genauso) */
check(darfKaempfen(new Set(), "weidenhain", "waldweg") && !darfKaempfen(new Set(), "weidenhain", "muehle"), "Strecke ist immer frei; die Kämpfe bleiben in ihrer Reihenfolge");

console.log(ok ? "\nWaldweg: alles in Ordnung" : "\nWaldweg: FEHLER"); process.exit(ok ? 0 : 1);
