/*
 * Riftmere – Block E (Phase 8, Grauwacht), „Mettes Schafe“ und „Ruhelose Gräber“ Ende zu Ende: echter Spielserver (localhost:8842), nachgebildete Supabase (localhost:8841), echte Kampfwelt, Lohn mit „abholen“.
 * Block E ist in fünf Tests geteilt (unter 400 s je Test): e-welt (E1, E2), e2-welt (Schafe, Gräber), e3-welt (E3), e4-welt (E4 bis zum Siegel), e4b-welt (E4 ab dem Siegel).
 * Aufruf: node test/e2-welt.test.mjs   (nach node build.mjs und python3 werkzeug/weltzonen.py)
 */
import { starte, starkerHeld, QUESTS, QB } from "./questwelt.mjs";
const Q = (id) => QUESTS.find((q) => q.id === id);
const E1 = Q("grauwacht_der_weg"), E2 = Q("grauwacht_die_glocke"), E3 = Q("grauwacht_fahnenflucht"), E4 = Q("grauwacht_grab_des_hauptmanns");
const SCHAFE = Q("heidrast_mettes_schafe"), GRAEBER = Q("grauwacht_ruhelose_graeber");
const BERUFE = { kochen: 90, splitterbinden: 35 }; /* Kochen 90: der Eintopf (Stufe 30) verbrennt dann kaum – Mette gibt das Fleisch nur einmal */
const viel = (g, n) => Array.from({ length: n }, () => g);
const SACHEN = ["krug_wasser", "ringelblume"]; /* #156: der Hammeleintopf braucht Ringelblume (Querverbindung zu den Obstwiesen) – nur, was dieser Teil braucht (ein voller Rucksack nimmt keine Grablichter mehr) */
/* eine Waffe, wie man sie in dieser Stufe trägt (Heldenlevel 42+), statt des Anfänger-Ritterschwerts */
const mitWaffe = (H) => { H.inventar.angelegt.waffe = "eidschwert_episch"; return H; };
const W = await starte({ sb: 8841, srv: 8842, helden: {
  /* Ida: Level 99, mit den Quests vor diesem Teil fertig */
  ida: mitWaffe(starkerHeld({ berufe: BERUFE, fertig: ["ostufer_das_gruene_licht", "grauwacht_der_weg", "grauwacht_die_glocke"], rucksack: SACHEN })) } }); /* Ports: localhost:8841, localhost:8842 */
const { check, spieler, schlaf, anzahl, stelle, sprich, objekt, stand, erl, fertig, kampf, kaempfen, kampfBis, sammeln, herstellen, sende, ding } = W;
const an = (s, q, id) => QB.schalter(q, s.b[q.id] || "", id) === true;
/** reden, während eine Kampfverbindung steht (dann kennt der Server das Heldenlevel) */
async function sprichImKampf(s, q, npc, a) { const F = q.figuren.find((x) => x.id === npc); const z = await kampf(s.name, F.x + 1, F.y); const ok = await sprich(s, q, npc, a); if (z) { z.ws.close(); await schlaf(2500); } return ok; }

/* Die Welt-Verbindung meldet sich wie der Browser regelmäßig (sonst schläft sie in langen Kämpfen ein – und mit ihr die Quest-Meldungen) */
const wach = (s) => { const t = setInterval(() => { try { sende(s, { t: "da" }); } catch { /* zu */ } }, 10000); t.unref(); return s; };
try {
  const ida = wach(await spieler("ida"));
  check([E1, E2, E3, E4, SCHAFE, GRAEBER].every(Boolean), "E1–E4, Mettes Schafe und Ruhelose Gräber sind im Spiel");

  console.log("Mettes Schafe");
  check(await sprich(ida, SCHAFE, "mette", "annehmen") && stand(ida, SCHAFE).phase === "laeuft", "Mette: angenommen");
  { const r = await kampfBis(ida, 6560, 5820, ["heidewolf"], () => erl(ida, SCHAFE, "woelfe"), 360000);
    check(erl(ida, SCHAFE, "woelfe"), `Fünf Heidewölfe besiegt (${r.siege} Siege, Zähler ${QB.zaehler(SCHAFE, ida.b[SCHAFE.id] || "", "woelfe")})`); }
  check(await sprich(ida, SCHAFE, "mette", "fleisch_nehmen") && anzahl(ida, "hammelfleisch") === 1, "Mette gibt das Hammelfleisch");
  { const r = await herstellen(ida, 6684.5 + 1.2, 5783.5, "hammeleintopf"); check(r === "ok" && anzahl(ida, "hammeleintopf") === 1 && erl(ida, SCHAFE, "eintopf"), `Hammeleintopf am Herd der Abtei (${r}, Eintopf ${anzahl(ida, "hammeleintopf")}, verbrannt ${anzahl(ida, "suppe_verbrannt")}, Krug ${anzahl(ida, "krug_wasser")})`); }
  check(await sprich(ida, SCHAFE, "mette", "abgeben") && fertig(ida, SCHAFE), "Mettes Schafe fertig, Lohn abgeholt");

  console.log("Ruhelose Gräber");
  check(await sprich(ida, GRAEBER, "gunhild", "annehmen") && stand(ida, GRAEBER).phase === "laeuft", "Gunhild: angenommen (Splitterbinden 35)");
  { const L = [[6464.5, 5764.5, "hg_grab_1"], [6476.5, 5763.5, "hg_grab_2"], [6467.5, 5772.5, "hg_grab_3"], [6478.5, 5770.5, "hg_grab_4"], [6471.5, 5775.5, "hg_grab_5"]];
    let i = 0; const t0 = Date.now(); while (anzahl(ida, "grablicht") < 3 && Date.now() - t0 < 180000) /* ein Grablicht hält nur jedes zweite Mal (fall 0.5), darum rasch von Grab zu Grab */ { const [x, y, id] = L[i++ % L.length]; await sammeln(ida, "licht", id, x, y, "grablicht", anzahl(ida, "grablicht") + 1, 12000); }
    check(anzahl(ida, "grablicht") === 3 && erl(ida, GRAEBER, "lichter"), `Drei Grablichter gefangen, der Questgegenstand fällt dazu (${anzahl(ida, "grablicht")})`); }
  for (const id of ["eg_kammer_1", "eg_kammer_2", "eg_kammer_3"]) await objekt(ida, GRAEBER, id);
  check(["kammer_1", "kammer_2", "kammer_3"].every((x) => erl(ida, GRAEBER, x)) && anzahl(ida, "grablicht") === 0, "Drei Grabkammern zur Ruhe gelegt");
  check(await sprich(ida, GRAEBER, "gunhild", "fertig") && fertig(ida, GRAEBER), "Ruhelose Gräber fertig, Lohn abgeholt");

} catch (e) { console.error(e); check(false, "Ausnahme: " + e.message); }
W.ende("Block E (Grauwacht, Teil 2: Schafe, Gräber)");
