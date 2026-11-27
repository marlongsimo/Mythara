/*
 * Riftmere – Quests G1 „Die Südstraße“ und G2 „Das Leuchtfeuer“ Ende zu Ende: echter Spielserver (localhost:8818), nachgebildete Supabase (localhost:8817), Kampfwelt, Lohn mit „abholen“ (#77).
 * Block G ist in zwei Tests geteilt (unter 400 s je Test): g12-welt (G1, G2) und g34-welt (G3, G4, mit G1 als fertig). Tom ist die Gegenprobe.
 * Aufruf: node test/g12-welt.test.mjs   (nach node build.mjs und python3 werkzeug/weltzonen.py)
 */
import { starte, starkerHeld, QUESTS, QB } from "./questwelt.mjs";

const ida = starkerHeld({ fertig: ["obstwiesen_fallobst", "westmark_das_rote_banner", "weidenhain_der_wegstein"], berufe: { splitterbinden: 30, handwerk: 30, fischen: 30, kochen: 30 },
  rucksack: ["angelrute", "hammer", { g: "wurm", n: 60 }, { g: "garn", n: 6 }, { g: "seelenlicht", n: 2 }] });
/* Rüstung dazu: der Wrackkapitän (Stufe 40) schlägt einen Helden ohne Rüstung auch mit Level 99 einmal nieder */
ida.inventar.angelegt = { waffe: "ritterschwert", nebenhand: "sternenschild_legendaer", brust: "eisenwacht_legendaer", beine: "eisenbeinschienen_legendaer", kopf: "eisenwachthelm_legendaer" };
const tom = { ...starkerHeld(), quests: {} };
const W = await starte({ sb: 8817, srv: 8818, helden: { ida, tom } }); /* localhost:8817 · localhost:8818 */
const { check, schlaf, anzahl, stelle, sprich, objekt, stand, erl, fertig, kampf, kaempfen, kampfBis, herstellen, fischen, sende, warte } = W;
const Q = (id) => QUESTS.find((q) => q.id === id);
const G1 = Q("kueste_die_suedstrasse"), G2 = Q("kueste_das_leuchtfeuer"), G3 = Q("kueste_was_das_wrack_verschweigt"), G4 = Q("kueste_netze_fuer_die_moewenbucht");
const K0 = { hat: () => false, verloren: () => false, anzahl: () => 0 };
const schalterAn = (s, q, name) => [].concat(q.schalter[name]).some((b) => QB.gilt(q, s.b[q.id] || "", b, K0));
/** annehmen mit Kampfverbindung (Heldenlevel kennt der Server nur aus der Kampfwelt) */
async function annehmen(s, q, npc) { const F = q.figuren.find((x) => x.id === npc); await stelle(s, F.x + 1, F.y); const z = await kampf(s.name, F.x + 1, F.y);
  const ok = await sprich(s, q, npc, "annehmen"); if (z) { z.ws.close(); await schlaf(2500); } return ok && stand(s, q).phase === "laeuft"; }

try {
  check(G1 && G2 && G3 && G4, "G1–G4 sind im Spiel");
  const I = await W.spieler("ida"), T = await W.spieler("tom");

  console.log("G1 „Die Südstraße“");
  check(!(await sprich(T, G1, "othmar", "annehmen")), "Tom (ohne „Die gesperrte Straße“): Othmar bietet G1 nicht an");
  check(await annehmen(I, G1, "othmar"), "Ida nimmt G1 bei Othmar an");
  await objekt(I, G1, "g1_spur_1"); await objekt(I, G1, "g1_spur_2");
  check(erl(I, G1, "spur_1") && erl(I, G1, "spur_2"), "Beide Spuren auf der Südstraße gelesen");
  { const R = G1.schritte.find((x) => x.id === "raeuber_knueppel").wo, fertigR = () => erl(I, G1, "raeuber_knueppel") && erl(I, G1, "raeuber_schleuder");
    for (let runde = 0; runde < 3 && !fertigR(); runde++) for (const [x, y] of [R, [6496, 7166]]) if (!fertigR()) await kampfBis(I, x + 1, y, ["wegelagerer_knueppel", "wegelagerer_schleuder"], () => fertigR(), 120000);
    check(fertigR(), `Vier Wegelagerer am Lager der Südstraße besiegt (Knüppel ${QB.zaehler(G1, I.b[G1.id] || "", "raeuber_knueppel")}, Schleuder ${QB.zaehler(G1, I.b[G1.id] || "", "raeuber_schleuder")})`); }
  await objekt(I, G1, "g1_wagen"); check(erl(I, G1, "wagen") && anzahl(I, "frachtbrief") === 1, "Der Wagen: Frachtbrief gefunden");
  { const sp = anzahl(I, "splitter"); check(await sprich(I, G1, "kranich", "brief_geben") && fertig(I, G1) && anzahl(I, "frachtbrief") === 0 && anzahl(I, "splitter") >= sp + 400, `G1 bei Kranich in Kielmund abgegeben, Lohn abgeholt (${anzahl(I, "splitter") - sp} Splitter)`); }
  { const { WEGSTEIN_ZIELE } = await import("./sim.gebaut.mjs").catch(() => ({})); const Z = (WEGSTEIN_ZIELE || []).find((z) => z.quest === G1.id);
    check(Boolean(Z), `Wegstein-Ziel Kielmund nach G1 (${Z ? Z.id : "fehlt in shared/wegstein.ts"})`); }

  console.log("G2 „Das Leuchtfeuer“");
  check(await annehmen(I, G2, "wiebke"), "Ida nimmt G2 bei Wiebke Strand an");
  check(await fischen(I, "kielmund_kai", "fisch_hering_roh", 5) && erl(I, G2, "heringe"), `Fünf Heringe am Kai von Kielmund (${anzahl(I, "fisch_hering_roh")})`);
  { const r = await herstellen(I, 6190 - 1.2, 7039.5, "lampenoel"); check(r === "ok" && erl(I, G2, "oel") && anzahl(I, "lampenoel") === 1, `Lampenöl im Kessel des Wärterhauses (${r})`); }
  { const r = await herstellen(I, 6453.2 - 1.2, 6679.4, "splitterglut"); check(r === "ok" && erl(I, G2, "glut") && anzahl(I, "splitterglut") === 1, `Splitterglut am Bindestein an der Linde (${r})`); }
  await objekt(I, G2, "g2_linse"); check(erl(I, G2, "linse"), "Die Linse poliert (Handwerk 25)");
  await objekt(I, G2, "g2_feuer"); check(erl(I, G2, "feuer") && anzahl(I, "lampenoel") === 0 && anzahl(I, "splitterglut") === 0, "Das Leuchtfeuer brennt (Öl und Glut verbraucht)");
  check(schalterAn(I, G2, "leuchtfeuer_an"), "Schalter leuchtfeuer_an ist an");
  check(await sprich(I, G2, "wiebke", "fertig") && fertig(I, G2), "G2 bei Wiebke abgegeben, Lohn abgeholt");

} catch (e) { console.error(e); check(false, "Ausnahme: " + e.message); }
W.ende("G1 und G2 (Smaragdküste)");
