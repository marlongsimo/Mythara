/*
 * Riftmere – Inhalte der Phase 4 (Integration): Mooshocker-Beute und -Aggression (#81), Banditen-Varianten (#15), B3, Rotmantel, Instanz, Tür und B4 (#16, #60).
 * Ohne Server und ohne Browser; die Regeln selbst prüft test/phase4.test.mjs (Systeme). Aufruf (im Ordner realtime): node test/phase4-inhalte.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-phase4-inhalte-${process.pid}.mjs`);
await build({ stdin: { contents: 'export { MONSTER } from "./shared/config"; export { GEGENSTAENDE } from "./shared/gegenstaende"; export { QUESTS } from "./shared/quests"; export { WELTKAMPF } from "./shared/weltzonen"; export { BOSSE, INSTANZEN, TUEREN, SPRUENGE } from "./shared/bosse"; export { LAEDEN, LADEN_ZEICHEN, grundwert, ankaufPreis } from "./shared/laeden"; export { WERKSTAETTEN } from "./shared/handwerk"; export { LICHTER, SEELENLICHTER } from "./shared/splitterbinden";',
  resolveDir: process.cwd(), loader: "ts" }, bundle: true, format: "esm", platform: "node", outfile: datei, logLevel: "error" });
const M = await import(datei);
let fehler = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) fehler++; };
const quest = (id) => M.QUESTS.find((q) => q.id === id);
const tabelleOk = (typ) => { const D = M.MONSTER[typ]; return Boolean(D && (D.drops || []).every((r) => r.wurf.reduce((s, w) => s + w.chance, 0) <= 100 && r.wurf.every((w) => M.GEGENSTAENDE[w.g]))); };

console.log("Mooshocker (#81)");
{ const D = M.MONSTER.mooshocker, Q2 = quest("osthof_der_stille_rain");
  check(D.drops && D.drops.length === 1 && tabelleOk("mooshocker"), "Ein Wurf, Chancen ≤ 100 %, alle Gegenstände gibt es");
  check(!D.drops[0].wurf.some((w) => M.GEGENSTAENDE[w.g].art !== "Rohstoff" && w.g !== "wurm" && w.g !== "seelenlicht"), "Keine Ausrüstung in der Beute");
  check(D.aggressiv === false && D.aggressivNach && D.aggressivNach.weit === 8 && Q2 && Q2.schalter && Q2.schalter[D.aggressivNach.schalter], `Nach der Quest aggressiv in 8 Feldern (Schalter ${D.aggressivNach && D.aggressivNach.schalter} kommt aus „Der stille Rain“)`);
  const z = M.WELTKAMPF.find((g) => g.region === "osthof"); check(z && z.lager.filter((l) => l.art === "mooshocker").length === 10, "Zehn Mooshocker am Moosrain"); }

console.log("Banditen-Varianten (#15, #24)");
{ const V = ["bandit_spaeher", "bandit_schlaeger", "bandit_armbrust"];
  check(V.every((t) => M.MONSTER[t] && tabelleOk(t)), "Späher, Schläger, Armbrustschütze mit gültigen Beutetabellen");
  check(M.MONSTER.bandit_spaeher.fliehen === 0.25 && M.MONSTER.bandit_spaeher.angriff.art === "fern" && M.MONSTER.bandit_armbrust.angriff.art === "fern" && M.MONSTER.bandit_schlaeger.angriff.art === "nah", "Späher flieht unter 25 %, Schleuder und Armbrust schießen, der Schläger haut");
  check([18, 22, 24].every((st, i) => M.MONSTER[V[i]].stufe === st), "Stufen 18, 22, 24 wie im Konzept");
  const w = M.WELTKAMPF.find((g) => g.region === "westmark"), a = M.WELTKAMPF.find((g) => g.region === "aschenwerth"), u = M.WELTKAMPF.find((g) => g.region === "unterschlupf");
  check(w && w.lager.filter((l) => l.art === "bandit_spaeher").length === 6 && w.mehrkampf.length === 1, "Westmark: sechs Späher, das Lager ist Mehrkampf (der Kumpan hilft)");
  check(a && a.lager.filter((l) => l.art.startsWith("bandit_")).length === 5 && u && u.lager.every((l) => V.includes(l.art)), "Riedwiesen-Lager am Moorrand und der Unterschlupf mit den neuen Banditen");
  check(M.MONSTER.bandit_spaeher.drops.some((r) => r.nur === "b3_karrenbrief") && quest("obstwiesen_fallobst").beute.b3_karrenbrief.zaehler.min === 4, "Karrenbrief: garantiert beim fünften Späher"); }

console.log("B3 „Fallobst“ (#15)");
{ const Q = quest("obstwiesen_fallobst");
  check(Boolean(Q) && Q.figuren.some((f) => f.modell === "npc.gisbert"), "B3 ist im Spiel, Gisbert mit eigenem Modell");
  check(["karrenbrief", "apfelkisten", "apfel"].every((g) => M.GEGENSTAENDE[g] && M.GEGENSTAENDE[g].bild), "Karrenbrief, Kisten und Äpfel mit Bild");
  check(M.LAEDEN.obstwiesen && M.LAEDEN.obstwiesen.questFigur === "gisbert" && M.LAEDEN.obstwiesen.wenn.quest === Q.id, "Gisberts Apfelladen öffnet nach B3"); }

console.log("Rotmantel, Instanzen, Tür, B4 (#16, #60)");
{ const R = M.MONSTER.rotmantel, B = M.BOSSE.rotmantel, Q = quest("westmark_das_rote_banner");
  const frei = (x, y) => M.WELTKAMPF.some((g) => x >= g.x0 && y >= g.y0 && x < g.x0 + g.b && y < g.y0 + g.h && g.zeilen[Math.floor(y) - g.y0][Math.floor(x) - g.x0] === ".");
  check(R && R.stufe === 32 && R.lp === 120 && R.wiederkehr === 180 && tabelleOk("rotmantel"), "Rotmantel: Stufe 32, 120 LP, 3 min Wiederkehr, gültige Beute");
  check(B && B.phasen.length === 2 && B.phasen[1].ab === 0.5 && B.phasen[1].ruf.n === 2 && B.phasen[0].ansagen[0].alle === 5 && B.phasen[1].ansagen[0].alle === 3, "Phasen: Rundumschlag alle 5, ab 50 % Ruf (2 Schläger) und alle 3");
  check(B.phasen[1].heilorte.length === 1 && !B.phasen[1].heilorte[0].hingehen && frei(B.phasen[1].heilorte[0].x, B.phasen[1].heilorte[0].y), "Heiltrank am Thron, ohne hingehen (weglocken geht)");
  const K = M.INSTANZEN.find((i) => i.id === "rotmantel_kammer"), H = M.INSTANZEN.find((i) => i.id === "unterschlupf_halle");
  check(K && K.gegner[0].art === "rotmantel" && Q.schalter[K.schalter] && H && H.wellen.length === 2 && H.wellen.every((w) => w.length === 3) && H.welle === "unterschlupf_welle" && Q.schalter[H.schalter],
    "Kammer als Instanz mit Rotmantel, Halle mit zwei Wellen à 3 – beide an Schaltern von B4");
  check([...K.gegner, ...H.wellen.flat()].every((g) => frei(g.x, g.y) && M.MONSTER[g.art]), "Alle Gegner der Kopien stehen auf freien Feldern");
  const T = M.TUEREN.find((t) => t.id === "beutelager"); check(T && Q.schalter[T.schalter], "Tür zum Beutelager hängt am Schalter beutelager_offen");
  const kammer = M.WELTKAMPF.find((g) => g.region === "rotmantel_kammer"); check(kammer && kammer.lager.some((l) => l.art === "rotmantel"), "Danach öffentlich: Rotmantel in der Kammer");
  check(Boolean(Q) && ["schluesselbund", "silberleuchter", "rabenbrief", "rotes_banner"].every((g) => M.GEGENSTAENDE[g]), "B4 ist im Spiel, alle Questgegenstände gibt es");
  check(M.MONSTER.bandit_schlaeger.drops.some((r) => r.nur === "b4_schluessel") && R.drops.some((r) => r.nur === "b4_rabenbrief"), "Schlüsselbund vom Schläger, Rabenbrief von Rotmantel (nur in der Quest)"); }

console.log("Phase 5: Bindestein am Obelisk (#80)");
{ const W = M.WERKSTAETTEN.find((w) => w.id === "bindestein_obelisk"), A2 = quest("waldmark_das_wappen_mit_dem_turm") || M.QUESTS.find((q) => q.titel === "Das Wappen mit dem Turm"), B1 = M.QUESTS.find((q) => (q.figuren || []).some((f) => f.id === "agnes"));
  check(W && W.station === "bindestein" && A2 && A2.schalter && A2.schalter[W.schalter], "Bindestein am Obelisk (Nordwald), nutzbar nach A2");
  check(B1 && B1.dialoge.agnes.reden.some((r) => r.wenn && r.wenn.skill && r.wenn.skill.k === "splitterbinden" && r.wenn.skill.min === 20), "Agnes erzählt ab Splitterbinden 20 vom Laden einer Waffe"); }

{ const arten = ["irrlicht", "grablicht", "nebellicht", "splitterlicht"];
  check(arten.every((a, i) => M.LICHTER[a] && M.LICHTER[a].level === [20, 35, 45, 65][i]) && [28, 45, 70].every((x, i) => M.LICHTER[arten[i]].xp === x), "Seelenlichter 20/35/45/65 mit 28/45/70 XP laut Konzept");
  check(arten.every((a) => M.SEELENLICHTER.some((l) => l.art === a)) && M.SEELENLICHTER.every((l) => M.LICHTER[l.art]), `Standorte der Welt übernommen, jedes Licht hat eine Art (${M.SEELENLICHTER.length} Lichter)`); }

console.log("Trödler (#88)");
{ const T = Object.values(M.LAEDEN).filter((l) => l.troedler);
  check(T.length >= 5 && T.every((l) => l.waren.length === 0 && M.LADEN_ZEICHEN[l.id]) && !T.some((l) => /kreuzwald|osthof/.test(l.id)), `Ein Trödler je Standplatz der Welt, kein Kreuzwald, kein Osthof (${T.map((l) => l.id).join(", ")})`);
  const t = T[0], p = (g) => M.ankaufPreis(t, g);
  check(p("erz_eisen") === 2 && p("stamm_eibe") === 12 && p("eidschwert_episch") === 240 && p("brot") === 4, `Ankauf zu 50 % des Grundwerts (Eisenerz ${p("erz_eisen")}, Eibenstamm ${p("stamm_eibe")}, epischer Säbel ${p("eidschwert_episch")}, Brot ${p("brot")})`);
  check(p("karrenbrief") === null && p("rotes_banner") === null && p("splitter") === null && p("wegstein") === null, "Questgegenstände, Zierde, Splitter und der Wegstein: kein Ankauf"); }

try { (await import("node:fs")).unlinkSync(datei); } catch { /* egal */ }
console.log(fehler ? fehler + " Fehler" : "Phase-4-Inhalte: alles in Ordnung"); process.exit(fehler ? 1 : 0);
