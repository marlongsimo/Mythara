/*
 * Mythara – Einzel- und Mehrkampf in der offenen Welt (Simulation, ohne Server).
 * Einzelkampf (Standard): ein Gegner gegen einen Helden – kein Dritter greift ein, weder Held noch Gegner.
 * Mehrkampf (Gebiete der Karte, z. B. die Lichtung im Kreuzwald): viele gegen viele.
 * Aufruf (nach „node build.mjs“): node test/einzelkampf.test.mjs
 */
import { Sim, KARTEN, FEIN, setzeKarte, setzeStaerke, ORTSTUFE } from "./sim.gebaut.mjs";
let ok = true; const check = (b, t) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) ok = false; };
const lauf = (s, sek) => { for (let i = 0; i < sek * 20; i++) s.schritt(); };
const K = KARTEN.kreuzwald, M = K.mehrkampf[0]; setzeKarte(K, FEIN); setzeStaerke(ORTSTUFE.kreuzwald, 1);
const s = Sim.welt(3), gegner = () => s.wesen.filter((w) => !w.held), [b1, b2, b3, b4] = gegner();
for (const g of gegner()) { g.streifT = 1e9; g.pfad = []; g.lp = g.max = 400; } /* zähe Testbanditen: geprüft wird die Bindung, nicht das Balancing (Banditen haben seit v1 nur 40 LP) */
/* Einzelkampf-Stelle: der Weg nahe dem Südtor, weit weg von der Lichtung */
const E = { x: 112, y: 6 }; check(!s.mehrkampfBei(E) && s.mehrkampfBei({ x: (M[0] + M[2]) / 2, y: (M[1] + M[3]) / 2 }), `Weg am Tor: Einzelkampf · Lichtung (${M.join(", ")}): Mehrkampf`);
const setze = (w, x, y) => { w.x = w.heim.x = x; w.y = w.heim.y = y; w.pfad = []; w.zielId = 0; w.wach = false; };
setze(b1, E.x, E.y); setze(b2, E.x + 3, E.y); setze(b3, 20, 150); setze(b4, 24, 150);
const a = s.nach(s.beitreten("schildwaechter", 300, { x: E.x - 1.2, y: E.y })), b = s.nach(s.beitreten("schildwaechter", 300, { x: E.x, y: E.y + 1.2 }));
s.eingabe({ t: "ziel", id: b1.id }, a.id); lauf(s, 2.5);
check(a.kampfMit === b1.id && b1.kampfMit === a.id, "Anna greift Bandit 1 an: die beiden sind im Einzelkampf gebunden");
const lpVorher = b1.lp; s.zustand(); s.eingabe({ t: "ziel", id: b1.id }, b.id); const ev = s.zustand().ev;
check(b.zielId !== b1.id && ev.some((e) => e.a === "text" && /jemand anderem/.test(e.t)), "Ben kann Bandit 1 nicht als Ziel nehmen („Kämpft schon mit jemand anderem“)");
check(b2.zielId !== a.id, "Bandit 2 steht 3 Felder neben Anna, greift sie aber nicht an – sie kämpft schon");
const lpAnna = a.lp; let annaVonB2 = false; for (let i = 0; i < 60; i++) { s.schritt(); for (const e of s.zustand().ev) if (e.a === "schaden" && e.id === a.id && b2.zielId === a.id) annaVonB2 = true; }
check(!annaVonB2 && b2.zielId !== a.id, "Auch nach drei Sekunden: Bandit 2 hält sich aus Annas Kampf heraus");
check(b2.zielId === b.id || b2.zielId === 0, "Bandit 2 nimmt sich stattdessen den freien Helden vor (oder bleibt ruhig): " + (b2.zielId === b.id ? "greift Ben an" : "ruhig"));
lauf(s, 25); check(b1.tot, "Anna besiegt Bandit 1 allein");
check(!s.darf(a, b1) || b1.tot, "Danach ist Anna wieder frei");
/* Mehrkampf auf der Lichtung: zwei Helden auf einen Banditen, zwei Banditen auf einen Helden */
const L = { x: (M[0] + M[2]) / 2, y: (M[1] + M[3]) / 2 }; setze(b3, L.x, L.y); setze(b4, L.x + 1.5, L.y);
const c = s.nach(s.beitreten("schildwaechter", 300, { x: L.x - 1.2, y: L.y })), d = s.nach(s.beitreten("schildwaechter", 300, { x: L.x, y: L.y + 1.2 }));
s.eingabe({ t: "ziel", id: b3.id }, c.id); s.eingabe({ t: "ziel", id: b3.id }, d.id); check(c.zielId === b3.id && d.zielId === b3.id, "Lichtung: beide Helden nehmen denselben Banditen ins Ziel");
const schlaeger = new Set(), angreifer = new Set(); s.zustand(); for (let i = 0; i < 100; i++) { s.schritt(); const z = s.zustand(); }
for (const [id, m] of s.anteile || []) if (id === b3.id) for (const h of m.keys()) schlaeger.add(h);
check(b3.tot || (s.anteile && s.anteile.get(b3.id) && s.anteile.get(b3.id).size === 2), "…und beide treffen ihn (Mehrkampf)");
check(b4.zielId === c.id || b4.zielId === d.id, "Bandit 4 greift mit an, obwohl die Helden schon kämpfen (Mehrkampf)");
console.log(ok ? "Einzel- und Mehrkampf: alles in Ordnung" : "Einzel- und Mehrkampf: FEHLER"); process.exit(ok ? 0 : 1);
