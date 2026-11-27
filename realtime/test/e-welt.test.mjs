/*
 * Riftmere – Block E (Phase 8, Grauwacht) Ende zu Ende: echter Spielserver (localhost:8814), nachgebildete Supabase (localhost:8813), echte Kampfwelt.
 * Ida spielt E1 „Der Weg nach Grauwacht“, E2 „Die Glocke“, „Mettes Schafe“, „Ruhelose Gräber“, E3 „Fahnenflucht“ (Weg: Glocke und Eid)
 * und E4 „Das Grab des Grauen Hauptmanns“ (Grabwächter, Grauer Hauptmann in ihrer Kopie der Gruft, Klinge, danach). Tom spielt E3 über „Ergib dich“ (Tjark wird Gegner).
 * Lohn jeweils mit „abholen“, Schalter danach (dornenwall_offen, grauwacht_abtei, glocke_heil, grauwacht_burg, hauptmann_danach).
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
  /* Ida: Level 99, „Das grüne Licht“ fertig – spielt den ganzen Block */
  ida: mitWaffe(starkerHeld({ berufe: BERUFE, fertig: ["ostufer_das_gruene_licht"], rucksack: SACHEN })),
  /* Tom: E1 und E2 schon fertig – E3 über „Ergib dich“ */
  tom: mitWaffe(starkerHeld({ berufe: BERUFE, fertig: ["ostufer_das_gruene_licht", "grauwacht_der_weg", "grauwacht_die_glocke"] })) } }); /* Ports: localhost:8813, localhost:8814 */
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
    let i = 0; const t0 = Date.now(); while (anzahl(ida, "grablicht") < 3 && Date.now() - t0 < 120000) { const [x, y, id] = L[i++ % L.length]; await sammeln(ida, "licht", id, x, y, "grablicht", anzahl(ida, "grablicht") + 1, 20000); }
    check(anzahl(ida, "grablicht") === 3 && erl(ida, GRAEBER, "lichter"), `Drei Grablichter gefangen, der Questgegenstand fällt dazu (${anzahl(ida, "grablicht")})`); }
  for (const id of ["eg_kammer_1", "eg_kammer_2", "eg_kammer_3"]) await objekt(ida, GRAEBER, id);
  check(["kammer_1", "kammer_2", "kammer_3"].every((x) => erl(ida, GRAEBER, x)) && anzahl(ida, "grablicht") === 0, "Drei Grabkammern zur Ruhe gelegt");
  check(await sprich(ida, GRAEBER, "gunhild", "fertig") && fertig(ida, GRAEBER), "Ruhelose Gräber fertig, Lohn abgeholt");

  console.log("E3 „Fahnenflucht“ – Weg der Glocke (Ida)");
  check(await sprichImKampf(ida, E3, "wigand", "annehmen") && stand(ida, E3).phase === "laeuft", "Wigand Fels (ab Stufe „abtei“): angenommen (Heldenlevel 42)");
  await objekt(ida, E3, "e3_lager"); check(erl(ida, E3, "lager"), "Das Lager am Grenzposten ausgekundschaftet");
  check(await sprich(ida, E3, "tjark", "glocke") && erl(ida, E3, "tjark") && anzahl(ida, "tjarks_eid") === 1, "„Die Glocke läutet wieder“: Tjark gibt seinen Eid");
  check(await sprich(ida, E3, "wigand", "eid_zeigen") && fertig(ida, E3) && an(ida, E3, "grauwacht_burg"), "E3 fertig, Lohn abgeholt; grauwacht_burg an");

  console.log("E3 „Fahnenflucht“ – Weg des Kampfs (Tom)");
  const tom = wach(await spieler("tom")); /* erst jetzt anmelden (eine lange stille Verbindung schläft ein) */
  check(await sprichImKampf(tom, E3, "wigand", "annehmen") && stand(tom, E3).phase === "laeuft", "Tom nimmt E3 an");
  await objekt(tom, E3, "e3_lager");
  { const T = E3.figuren.find((x) => x.id === "tjark"); await stelle(tom, T.x + 1, T.y); const z = await kampf("tom", T.x + 1, T.y); await schlaf(800);
    const ok = await sprich(tom, E3, "tjark", "kampf"); await schlaf(1500);
    const tj = () => z && z.w.find((w) => w[2] === "tjark");
    check(ok && Boolean(tj()), "„Ergib dich“: Tjark wird zum Gegner (Folge.angriff)"); 
    const s = z ? await kaempfen(z, ["tjark"], () => erl(tom, E3, "tjark"), 180000) : 0;
    await schlaf(1500);
    check(erl(tom, E3, "tjark") && anzahl(tom, "tjarks_eid") === 0, `Tjark besiegt, sein Tod erledigt den Schritt (${s} Siege)`);
    if (z) { z.ws.close(); await schlaf(2500); } }
  check(await sprich(tom, E3, "wigand", "bericht") && fertig(tom, E3) && an(tom, E3, "grauwacht_burg"), "Tom: E3 über „Bericht erstatten“ fertig; grauwacht_burg an");

  console.log("E4 „Das Grab des Grauen Hauptmanns“");
  check(await sprich(ida, E4, "wigand", "annehmen") && stand(ida, E4).phase === "laeuft" && an(ida, E4, "hauptmann_gruft"), "Wigand: angenommen; hauptmann_gruft an (Kopie der Gruft)");
  await stelle(ida, 6466, 5787.8); sende(ida, { t: "ort", ort: "hauptmann_grab" }); await stelle(ida, 11168, 9630); await schlaf(800); /* Region gewechselt (der Browser meldet „ort“) */
  { const z = await kampf("ida", 11168, 9630); await schlaf(1000);
    check(erl(ida, E4, "abstieg"), "In das Hügelgrab hinabgestiegen (betreten hauptmann_grab)");
    const s = z ? await kaempfen(z, ["grabwaechter"], () => erl(ida, E4, "waechter"), 240000) : 0;
    check(erl(ida, E4, "waechter"), `Zwei Grabwächter besiegt (${s} Siege)`); await schlaf(30000); /* verschnaufen: nach 5 s ohne Kampf kommen die Lebenspunkte zurück */ if (z) { z.ws.close(); await schlaf(2500); } }
  await objekt(ida, E4, "e4_siegel"); check(erl(ida, E4, "siegel"), "Das Siegel des Hauptmanns gebrochen");
  { sende(ida, { t: "ort", ort: "hauptmann_gruft" }); await stelle(ida, 11216, 9614); const z = await kampf("ida", 11216, 9614); await schlaf(2500);
    const hm = () => z && z.w.find((w) => w[2] === "grauer_hauptmann");
    check(Boolean(hm()), "Der Graue Hauptmann steht in Idas Kopie der Gruft");
    const s = z ? await kaempfen(z, ["grauer_hauptmann", "wiedergaenger"], () => erl(ida, E4, "hauptmann"), 720000) : 0; /* wer stehen bleibt statt hinter die Grabsteine zu gehen, braucht rund 5 Minuten */
    check(erl(ida, E4, "hauptmann"), `Der Graue Hauptmann besiegt (${s} Siege)`); if (z) { z.ws.close(); await schlaf(2500); } }
  await objekt(ida, E4, "e4_klinge"); check(erl(ida, E4, "klinge") && anzahl(ida, "klinge_hauptmann") === 1, "Die Klinge des Hauptmanns aufgehoben (Questobjekt)");
  check(await sprich(ida, E4, "wigand", "klinge_geben") && fertig(ida, E4), "E4 fertig, Lohn abgeholt");
  check(anzahl(ida, "klinge_hauptmann") === 1, "Wigand gibt die Klinge geschärft zurück (Lohn)");
  check(an(ida, E4, "hauptmann_danach") && !an(ida, E4, "hauptmann_gruft"), "Danach: hauptmann_danach an, die Quest-Kopie der Gruft aus");
} catch (e) { console.error(e); check(false, "Ausnahme: " + e.message); }
W.ende("Block E (Grauwacht)");
