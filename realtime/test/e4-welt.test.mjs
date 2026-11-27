/*
 * Riftmere – Block E (Phase 8, Grauwacht), E4 „Das Grab des Grauen Hauptmanns“ bis zum Siegel (Abstieg, Grabwächter, Siegel) Ende zu Ende: echter Spielserver (localhost:8846), nachgebildete Supabase (localhost:8845), echte Kampfwelt, Lohn mit „abholen“.
 * Block E ist in fünf Tests geteilt (unter 400 s je Test): e-welt (E1, E2), e2-welt (Schafe, Gräber), e3-welt (E3), e4-welt (E4 bis zum Siegel), e4b-welt (E4 ab dem Siegel).
 * Aufruf: node test/e4-welt.test.mjs   (nach node build.mjs und python3 werkzeug/weltzonen.py)
 */
import { starte, starkerHeld, QUESTS, QB } from "./questwelt.mjs";
const Q = (id) => QUESTS.find((q) => q.id === id);
const E1 = Q("grauwacht_der_weg"), E2 = Q("grauwacht_die_glocke"), E3 = Q("grauwacht_fahnenflucht"), E4 = Q("grauwacht_grab_des_hauptmanns");
const SCHAFE = Q("heidrast_mettes_schafe"), GRAEBER = Q("grauwacht_ruhelose_graeber");
const BERUFE = { holzfaellerei: 40, schmieden: 45, kochen: 45, splitterbinden: 35, handwerk: 30 }; /* Kochen 45: die Glocke gießt man am Herd (Rezept glocke, Station herd) */
const viel = (g, n) => Array.from({ length: n }, () => g);
const SACHEN = [];
/* eine Waffe, wie man sie in dieser Stufe trägt (Heldenlevel 42+), statt des Anfänger-Ritterschwerts */
const mitWaffe = (H) => { H.inventar.angelegt.waffe = "eidschwert_episch"; return H; };
const W = await starte({ sb: 8845, srv: 8846, helden: {
  /* Ida: Level 99, mit den Quests vor diesem Teil fertig */
  ida: mitWaffe(starkerHeld({ berufe: BERUFE, fertig: ["ostufer_das_gruene_licht", "grauwacht_der_weg", "grauwacht_die_glocke", "heidrast_mettes_schafe", "grauwacht_ruhelose_graeber", "grauwacht_fahnenflucht"], rucksack: SACHEN })) } }); /* Ports: localhost:8845, localhost:8846 */
const { check, spieler, schlaf, anzahl, stelle, sprich, objekt, stand, erl, fertig, kampf, kaempfen, kampfBis, sammeln, herstellen, sende, ding } = W;
const an = (s, q, id) => QB.schalter(q, s.b[q.id] || "", id) === true;
/** reden, während eine Kampfverbindung steht (dann kennt der Server das Heldenlevel) */
async function sprichImKampf(s, q, npc, a) { const F = q.figuren.find((x) => x.id === npc); const z = await kampf(s.name, F.x + 1, F.y); const ok = await sprich(s, q, npc, a); if (z) { z.ws.close(); await schlaf(2500); } return ok; }

/* Die Welt-Verbindung meldet sich wie der Browser regelmäßig (sonst schläft sie in langen Kämpfen ein – und mit ihr die Quest-Meldungen) */
const wach = (s) => { const t = setInterval(() => { try { sende(s, { t: "da" }); } catch { /* zu */ } }, 10000); t.unref(); return s; };
try {
  const ida = wach(await spieler("ida"));
  check([E1, E2, E3, E4, SCHAFE, GRAEBER].every(Boolean), "E1–E4, Mettes Schafe und Ruhelose Gräber sind im Spiel");

  console.log("E4 „Das Grab des Grauen Hauptmanns“");
  check(await sprich(ida, E4, "wigand", "annehmen") && stand(ida, E4).phase === "laeuft" && an(ida, E4, "hauptmann_gruft"), "Wigand: angenommen; hauptmann_gruft an (Kopie der Gruft)");
  await stelle(ida, 6466, 5787.8); sende(ida, { t: "ort", ort: "hauptmann_grab" }); await stelle(ida, 11168, 9630); await schlaf(800); /* Region gewechselt (der Browser meldet „ort“) */
  { const z = await kampf("ida", 11168, 9630); await schlaf(1000);
    check(erl(ida, E4, "abstieg"), "In das Hügelgrab hinabgestiegen (betreten hauptmann_grab)");
    const s = z ? await kaempfen(z, ["grabwaechter"], () => erl(ida, E4, "waechter"), 240000) : 0;
    check(erl(ida, E4, "waechter"), `Zwei Grabwächter besiegt (${s} Siege)`); await schlaf(30000); /* verschnaufen: nach 5 s ohne Kampf kommen die Lebenspunkte zurück */ if (z) { z.ws.close(); await schlaf(2500); } }
  await objekt(ida, E4, "e4_siegel"); check(erl(ida, E4, "siegel"), "Das Siegel des Hauptmanns gebrochen");
} catch (e) { console.error(e); check(false, "Ausnahme: " + e.message); }
W.ende("Block E (Grauwacht, Teil 4: E4 bis zum Siegel)");
