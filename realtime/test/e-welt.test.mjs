/*
 * Riftmere – Block E (Phase 8, Grauwacht), E1 „Der Weg nach Grauwacht“ und E2 „Die Glocke“ Ende zu Ende: echter Spielserver (localhost:8814), nachgebildete Supabase (localhost:8813), echte Kampfwelt, Lohn mit „abholen“.
 * Block E ist in fünf Tests geteilt (unter 400 s je Test): e-welt (E1, E2), e2-welt (Schafe, Gräber), e3-welt (E3), e4-welt (E4 bis zum Siegel), e4b-welt (E4 ab dem Siegel).
 * Aufruf: node test/e-welt.test.mjs   (nach node build.mjs und python3 werkzeug/weltzonen.py)
 */
import { starte, starkerHeld, QUESTS, QB } from "./questwelt.mjs";
const Q = (id) => QUESTS.find((q) => q.id === id);
const E1 = Q("grauwacht_der_weg"), E2 = Q("grauwacht_die_glocke"), E3 = Q("grauwacht_fahnenflucht"), E4 = Q("grauwacht_grab_des_hauptmanns");
const SCHAFE = Q("heidrast_mettes_schafe"), GRAEBER = Q("grauwacht_ruhelose_graeber");
const BERUFE = { holzfaellerei: 40, schmieden: 45, kochen: 45, splitterbinden: 35, handwerk: 30 }; /* Kochen 45: die Glocke gießt man am Herd (Rezept glocke, Station herd) */
const viel = (g, n) => Array.from({ length: n }, () => g);
const SACHEN = [...viel("erz_kupfer", 16), ...viel("erz_splittereisen", 4), "stamm_kernbaum", "krug_wasser"];
/* eine Waffe, wie man sie in dieser Stufe trägt (Heldenlevel 42+), statt des Anfänger-Ritterschwerts */
const mitWaffe = (H) => { H.inventar.angelegt.waffe = "eidschwert_episch"; return H; };
const W = await starte({ sb: 8813, srv: 8814, helden: {
  /* Ida: Level 99, mit den Quests vor diesem Teil fertig */
  ida: mitWaffe(starkerHeld({ berufe: BERUFE, fertig: ["ostufer_das_gruene_licht"], rucksack: SACHEN })) } }); /* Ports: localhost:8813, localhost:8814 */
const { check, spieler, schlaf, anzahl, stelle, sprich, objekt, stand, erl, fertig, kampf, kaempfen, kampfBis, sammeln, herstellen, sende, ding } = W;
const an = (s, q, id) => QB.schalter(q, s.b[q.id] || "", id) === true;
/** reden, während eine Kampfverbindung steht (dann kennt der Server das Heldenlevel) */
async function sprichImKampf(s, q, npc, a) { const F = q.figuren.find((x) => x.id === npc); const z = await kampf(s.name, F.x + 1, F.y); const ok = await sprich(s, q, npc, a); if (z) { z.ws.close(); await schlaf(2500); } return ok; }

/* Die Welt-Verbindung meldet sich wie der Browser regelmäßig (sonst schläft sie in langen Kämpfen ein – und mit ihr die Quest-Meldungen) */
const wach = (s) => { const t = setInterval(() => { try { sende(s, { t: "da" }); } catch { /* zu */ } }, 10000); t.unref(); return s; };
try {
  const ida = wach(await spieler("ida"));
  check([E1, E2, E3, E4, SCHAFE, GRAEBER].every(Boolean), "E1–E4, Mettes Schafe und Ruhelose Gräber sind im Spiel");

  console.log("E1 „Der Weg nach Grauwacht“");
  check(await sprich(ida, E1, "merit", "annehmen") && stand(ida, E1).phase === "laeuft", "Merit Stahl in Graufurt: angenommen");
  check(!an(ida, E1, "dornenwall_offen"), "Dornenwall noch zu");
  for (const id of ["e1_dornen_1", "e1_dornen_2", "e1_dornen_3"]) await objekt(ida, E1, id);
  check(["dornen_1", "dornen_2", "dornen_3"].every((x) => erl(ida, E1, x)) && an(ida, E1, "dornenwall_offen"), "Drei Dornenranken gerodet (Holzfällerei 40): dornenwall_offen an");
  check(await sprich(ida, E1, "othmar", "brief") && anzahl(ida, "othmars_brief") === 1, "Othmar gibt den Brief für Gunhild mit");
  check(await sprich(ida, E1, "mette", "weg_fragen") && erl(ida, E1, "mette"), "Mette Heider in Heidrast nach dem Weg gefragt");
  { const r = await kampfBis(ida, 6560, 5820, ["rudelfuehrer", "heidewolf"], () => erl(ida, E1, "rudel"));
    check(erl(ida, E1, "rudel"), `Der Rudelführer der Heidewölfe besiegt (${r.siege} Siege)`); }
  check(await sprich(ida, E1, "gunhild", "graufurt"), "Gunhild nimmt Othmars Brief");
  check(fertig(ida, E1) && anzahl(ida, "othmars_brief") === 0 && an(ida, E1, "grauwacht_abtei"), "E1 fertig, Lohn abgeholt; grauwacht_abtei an (die Abtei ist bewohnt)");

  console.log("E2 „Die Glocke“");
  check(await sprich(ida, E2, "gunhild", "annehmen") && stand(ida, E2).phase === "laeuft", "Gunhild: angenommen");
  check(await sprich(ida, E2, "merit", "rezept_fragen") && erl(ida, E2, "rezept"), "Merit kennt das Rezept der Glockenbronze");
  { const r = await herstellen(ida, 6467.4 + 1.2, 6427.8, "glockenbronze", 4); check(r === "ok" && anzahl(ida, "barren_glockenbronze") === 4 && erl(ida, E2, "bronze"), `Vier Barren Glockenbronze an der Esse (${r})`); }
  { const r = await herstellen(ida, 6684.5 + 1.2, 5783.5, "glocke"); check(r === "ok" && anzahl(ida, "glocke_neu") === 1 && erl(ida, E2, "form"), `Die Glocke am Herd der Abteiküche gegossen (${r})`); }
  { const r = await herstellen(ida, null, null, "kloeppel"); check(r === "ok" && anzahl(ida, "kloeppel") === 1 && erl(ida, E2, "kloeppel"), `Den Klöppel aus Kernbaum geschnitzt (${r})`); }
  await objekt(ida, E2, "e2_turm"); check(erl(ida, E2, "aufhaengen") && anzahl(ida, "glocke_neu") === 0, "Die Glocke hängt im Glockenstuhl");
  check(!an(ida, E2, "glocke_heil"), "glocke_heil vor dem ersten Schlag aus");
  await objekt(ida, E2, "e2_seil"); check(erl(ida, E2, "schlag") && an(ida, E2, "glocke_heil"), "Erster Schlag geläutet: glocke_heil an");
  check(await sprich(ida, E2, "gunhild", "fertig") && fertig(ida, E2), "E2 fertig, Lohn abgeholt");

} catch (e) { console.error(e); check(false, "Ausnahme: " + e.message); }
W.ende("Block E (Grauwacht, Teil 1: E1, E2)");
