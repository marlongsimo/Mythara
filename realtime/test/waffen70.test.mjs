/*
 * Riftmere – Waffen der Stufe 70 (#151, doku/konzepte/waffen-70.md): Echoschneide, Seelenbogen, Seelenfokus.
 * Werte und Anforderung 70, nicht in der Platzhalter-Beute; Laden am Bindestein mit 1 Splitter je Ladung (Splitterbinden 70, nur dieses Rezept), höchstens 1.000,
 * Laden bindet die Waffe (bleibt gebunden, auch leer); geladen die Passive statt × 1,1; im Kampf (Chance im Test auf 100 % gesetzt):
 * Nachhall (zweiter Treffer mit halbem Schaden), Seelenzug (ein Viertel heilt), Seelenbrand (6 s, alle 2 s 3). Ohne Browser und ohne Supabase.
 * Aufruf (im Ordner realtime): node test/waffen70.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-waffen70-${process.pid}.mjs`);
process.env.HANDWERK_GLUT = "0";
await build({ stdin: { contents: 'export * as I from "./server/src/inventar"; export * as HW from "./server/src/handwerk"; export * from "./shared/gegenstaende"; export * from "./shared/kampfwerte"; export * from "./shared/splitterbinden"; export { STATIONEN, rezept } from "./shared/handwerk"; export { Sim } from "./shared/sim"; export * from "./shared/karte"; export { LAEDEN } from "./shared/laeden";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const M = await import(datei);
const { I, HW, GEGENSTAENDE: G, WAFFEN_STUFE70, PASSIVE, STUFE70_BEUTE, beuteAufloesen, handelbar, kampfwerte, xpFuer, NULL_XP, STATIONEN, rezept, WAFFE_LADUNG_MAX, Sim, setzeKarte, LAEDEN } = M;
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
let ROW = []; const sb = async (pfad) => (pfad.includes("rpg_held?") ? ROW : null);
const laden = async (nutzer, inventar) => { ROW = [{ waffe: "schwert", inventar }]; return I.inventarLaden(sb, nutzer); };

console.log("\nWerte");
{ const E = G.echoschneide, B = G.seelenbogen, F = G.seelenfokus;
  check(E && E.waffe.art === "nah" && E.waffe.ticks === 3 && E.waffe.geschick === 75 && E.waffe.staerke === 77 && E.anforderung.skill === "geschick" && E.anforderung.level === 70 && E.passiv.id === "nachhall", "Echoschneide: Schwert, 3 Ticks, Geschick 75 / Stärke 77, Geschick 70, Nachhall");
  check(B && B.waffe.art === "fern" && B.waffe.ticks === 4 && B.waffe.fernAngriff === 75 && B.waffe.fernStaerke === 66 && B.anforderung.level === 70 && B.zweihand && B.passiv.id === "seelenzug", "Seelenbogen: Kurzbogen, 4 Ticks, 75 / 66, Fernkampf 70, zweihändig, Seelenzug");
  check(F && F.art === "Stab" && F.waffe.art === "magie" && F.waffe.ticks === 5 && F.waffe.genau === 30 && F.waffe.magieStaerke === 216 && F.anforderung.level === 70 && F.passiv.id === "seelenbrand", "Seelenfokus: Stab, 5 Ticks, genau 30 / magieStaerke 216, Magie 70, Seelenbrand");
  check(Object.values(PASSIVE).every((p) => p.chance === 0.15), "alle Passive mit 15 % je Treffer");
  const gezogen = new Set(); for (let i = 0; i < 400; i++) { gezogen.add(beuteAufloesen("@mythisch", Math.random)); gezogen.add(beuteAufloesen("@mythisch:Bogen", Math.random)); }
  check(WAFFEN_STUFE70.every((g) => !gezogen.has(g)) && !Object.values(LAEDEN).some((L) => L.waren.some((w) => WAFFEN_STUFE70.includes(w.g))), "nicht in der Platzhalter-Beute „@mythisch“ und in keinem Laden");
  check(STUFE70_BEUTE.wurf.length === 3 && STUFE70_BEUTE.wurf.every((w) => G[w.g]), "Drop für die Rissgrube (später) vorbereitet, noch in keiner Drop-Tabelle");
  check(handelbar("echoschneide"), "frisch (ungeladen) handelbar");
  check(WAFFEN_STUFE70.every((g) => G[g].ebenen[0] === "waffe." + g && G[g].bild === `img/objekte3d/ausruestung/stufe70/${g}.webp`) && G.seelenfokus.zweihand, "eigene Modelle (waffe.<name>) und Rucksackbilder der Figuren; Seelenfokus zweihändig"); }

console.log("\nKampfwerte");
{ const xp = { ...NULL_XP, geschick: xpFuer(70), staerke: xpFuer(70) }, leer = kampfwerte(xp, { waffe: "echoschneide" }, 1), voll = kampfwerte(xp, { waffe: "echoschneide" }, 1, {}, { geladen: true });
  check(!leer.passiv && voll.passiv && voll.passiv.id === "nachhall" && voll.geladen, "geladen: die Passive ist da, leer nicht");
  check(voll.angriff.nah === leer.angriff.nah && voll.waffe.schaden[1] === leer.waffe.schaden[1], "geladen wirkt nur die Passive – kein × 1,1 auf die Werte");
  const e = kampfwerte(xp, { waffe: "eidschwert_mythisch" }, 1, {}, { geladen: true }); check(!e.passiv && e.geladen, "andere geladene Waffen: wie bisher × 1,1, ohne Passive"); }

console.log("\nLaden am Bindestein");
const L = STATIONEN.bindestein, BEI = { nutzer: "lea", gast: false, wx: L.x, wy: L.y };
HW.handwerkEinrichten({ sb, senden: () => {} }); HW.HANDWERK_QUEST.schalter = () => true;
const arbeiten = (n = 40) => { for (let t = 1; t <= n; t++) HW.handwerkTakt(2e13 + t * 600); };
{ await laden("lea", { angelegt: { waffe: "echoschneide" }, rucksack: [{ g: "splitter", n: 100 }], v: 2, berufe: { splitterbinden: xpFuer(69) } });
  check(rezept("waffe_laden_stufe70") && rezept("waffe_laden_stufe70").zutaten[0].n === 1, "eigenes Rezept: 1 Splitter je Ladung");
  check(/Splitterbinden 70/.test(HW.handwerkStart(BEI, "waffe_laden_stufe70", 10) || ""), "Splitterbinden 69: noch nicht");
  I.berufXpDazu(M.I ? sb : sb, "lea", "splitterbinden", xpFuer(70) - xpFuer(69));
  check(/Splitter je Ladung/.test(HW.handwerkStart(BEI, "waffe_laden_mythisch", 10) || ""), "das mythische Lade-Rezept (2 Splitter) nimmt sie nicht");
  check(HW.handwerkStart(BEI, "waffe_laden_stufe70", 10) === null, "Splitterbinden 70 am Bindestein: laden beginnt"); arbeiten(15);
  const D = I.inventarVon("lea").angelegtD.waffe;
  check(I.waffeLadung("lea").n === 10 && I.anzahlVon("lea", "splitter") === 90, `10 Ladungen für 10 Splitter (${I.waffeLadung("lea").n} / ${100 - I.anzahlVon("lea", "splitter")})`);
  check(D.gebunden && !handelbar("echoschneide", D), "Laden bindet die Waffe");
  I.waffeLadenDazu(sb, "lea", 5000); check(I.waffeLadung("lea").n === WAFFE_LADUNG_MAX, `höchstens ${WAFFE_LADUNG_MAX}`);
  for (let i = 0; i < WAFFE_LADUNG_MAX; i++) I.waffeLadungVerbrauchen(sb, "lea");
  const D2 = I.inventarVon("lea").angelegtD && I.inventarVon("lea").angelegtD.waffe; check(I.waffeLadung("lea").n === 0 && D2 && D2.gebunden && !handelbar("echoschneide", D2), "jeder Angriff kostet 1 Ladung; leer bleibt sie gebunden");
  await laden("ole", { angelegt: { waffe: "eidschwert_mythisch" }, rucksack: [{ g: "splitter", n: 10 }], v: 2, berufe: { splitterbinden: xpFuer(70) } });
  check(/Stufe 70/.test(HW.handwerkStart({ ...BEI, nutzer: "ole" }, "waffe_laden_stufe70", 1) || ""), "das Stufe-70-Rezept nur für Waffen der Stufe 70"); }

console.log("\nPassive im Kampf");
setzeKarte({ zeilen: Array.from({ length: 20 }, () => ".".repeat(30)), start: [[1, 1]], lager: [] }, 1);
function kampf(waffe, xp, sek, vorher) { const s = Sim.welt(5, undefined, true); s.wesen = s.wesen.filter((w) => w.held); s["karte"].MEHRKAMPF = [[0, 0, 1e5, 1e5]];
  const kw = kampfwerte(xp, { waffe }, 1, {}, { geladen: true }); kw.passiv.chance = 1; /* im Test immer */
  const id = s.beitreten("schildwaechter", 0, { x: 10.5, y: 10.5 }, kw), h = s.nach(id); h.max = 1e6; h.lp = 1e6;
  const z = s["neu"](false, "heidewolf", 1, { x: waffe === "echoschneide" ? 11.5 : 14.5, y: 10.5 }, true, 7); z.lp = z.max = 1e6; z.streifT = 1e9;
  if (vorher) vorher(s, h, z); s.eingabe({ t: "ziel", id: z.id }, id); const ev = []; for (let i = 0; i < sek * 20; i++) { z.zielId = 0; z.wach = false; s.schritt(); ev.push(...s.zustand().ev); } return { ev, h, z, id }; }
{ const { ev, z } = kampf("echoschneide", { ...NULL_XP, geschick: xpFuer(70), staerke: xpFuer(70) }, 4);
  const S = ev.filter((e) => e.a === "schaden" && e.id === z.id), N = ev.filter((e) => e.a === "text" && e.t === "Nachhall");
  check(N.length > 0 && S.length >= 2 * N.length, `Nachhall: ${N.length}× ausgelöst, ${S.length} Schadenszahlen (zweiter Treffer je Auslösung)`);
  const paar = S.findIndex((e, i) => S[i + 1] && Math.abs(S[i + 1].n - Math.max(1, Math.round(e.n / 2))) <= 0); check(paar >= 0, "der zweite Treffer hat den halben Schaden"); }
{ let vor = 0; const { ev, h, z } = kampf("seelenbogen", { ...NULL_XP, fernkampf: xpFuer(70) }, 5, (_s, h) => { h.lp = vor = 500000; });
  const S = ev.filter((e) => e.a === "schaden" && e.id === z.id).reduce((a, e) => a + e.n, 0);
  check(ev.some((e) => e.a === "text" && e.t === "Seelenzug") && h.lp > vor && h.lp - vor <= S, `Seelenzug: der Held heilt (+${Math.round(h.lp - vor)} bei ${S} Schaden)`); }
{ const { ev, z } = kampf("seelenfokus", { ...NULL_XP, magie: xpFuer(70) }, 3);
  check(ev.some((e) => e.a === "text" && e.t === "Seelenbrand") && (z.dauer.some((d) => d.art === "brand") || ev.some((e) => e.a === "schaden" && e.id === z.id && e.art === "brand")), "Seelenbrand: das Ziel brennt");
  const brand = ev.filter((e) => e.a === "schaden" && e.id === z.id && e.art === "brand"); check(brand.every((e) => e.n >= 3), `Brandschaden in Stößen zu 3 (${brand.map((e) => e.n).join(", ") || "noch keiner"})`); }

console.log(f ? `\nWaffen Stufe 70: ${f} FEHLER` : "\nWaffen Stufe 70: alles in Ordnung");
process.exit(f ? 1 : 0);
