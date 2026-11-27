/*
 * Riftmere – Block E (Phase 8, Grauwacht), E4 ab dem gebrochenen Siegel: der Graue Hauptmann in Idas Kopie der Gruft, Klinge, Abgabe, danach Ende zu Ende: echter Spielserver (localhost:8848), nachgebildete Supabase (localhost:8847), echte Kampfwelt, Lohn mit „abholen“.
 * Block E ist in fünf Tests geteilt (unter 400 s je Test): e-welt (E1, E2), e2-welt (Schafe, Gräber), e3-welt (E3), e4-welt (E4 bis zum Siegel), e4b-welt (E4 ab dem Siegel).
 * Aufruf: node test/e4b-welt.test.mjs   (nach node build.mjs und python3 werkzeug/weltzonen.py)
 */
import { starte, starkerHeld, LEGENDAER, standNach, QUESTS, QB } from "./questwelt.mjs";
const Q = (id) => QUESTS.find((q) => q.id === id);
const E1 = Q("grauwacht_der_weg"), E2 = Q("grauwacht_die_glocke"), E3 = Q("grauwacht_fahnenflucht"), E4 = Q("grauwacht_grab_des_hauptmanns");
const SCHAFE = Q("heidrast_mettes_schafe"), GRAEBER = Q("grauwacht_ruhelose_graeber");
/* Stand: hinabgestiegen, zwei Grabwächter besiegt, das Siegel gebrochen */
const SIEGEL = standNach(QUESTS.find((q) => q.id === "grauwacht_grab_des_hauptmanns"), [{ art: "betreten", region: "hauptmann_grab" }, ...Array(2).fill({ art: "erlegen", typ: "grabwaechter" }), { art: "objekt", id: "e4_siegel" }]);
const BERUFE = { holzfaellerei: 40, schmieden: 45, kochen: 45, splitterbinden: 35, handwerk: 30 }; /* Kochen 45: die Glocke gießt man am Herd (Rezept glocke, Station herd) */
const viel = (g, n) => Array.from({ length: n }, () => g);
const SACHEN = [];
/* eine Waffe, wie man sie in dieser Stufe trägt (Heldenlevel 42+), statt des Anfänger-Ritterschwerts */
const mitWaffe = (H) => { H.inventar.angelegt = { ...LEGENDAER }; return H; }; /* Ausrüstung in passender Stufe für den Grauen Hauptmann */
const W = await starte({ sb: 8847, srv: 8848, helden: {
  /* Ida: Level 99, mit den Quests vor diesem Teil fertig */
  ida: mitWaffe(starkerHeld({ berufe: BERUFE, fertig: ["ostufer_das_gruene_licht", "grauwacht_der_weg", "grauwacht_die_glocke", "heidrast_mettes_schafe", "grauwacht_ruhelose_graeber", "grauwacht_fahnenflucht"], staende: { grauwacht_grab_des_hauptmanns: SIEGEL }, rucksack: SACHEN })) } }); /* Ports: localhost:8847, localhost:8848 */
const { check, spieler, schlaf, anzahl, stelle, sprich, objekt, stand, erl, fertig, kampf, kaempfen, kampfBis, sammeln, herstellen, sende, ding } = W;
const an = (s, q, id) => QB.schalter(q, s.b[q.id] || "", id) === true;
/** reden, während eine Kampfverbindung steht (dann kennt der Server das Heldenlevel) */
async function sprichImKampf(s, q, npc, a) { const F = q.figuren.find((x) => x.id === npc); const z = await kampf(s.name, F.x + 1, F.y); const ok = await sprich(s, q, npc, a); if (z) { z.ws.close(); await schlaf(2500); } return ok; }

/* Die Welt-Verbindung meldet sich wie der Browser regelmäßig (sonst schläft sie in langen Kämpfen ein – und mit ihr die Quest-Meldungen) */
const wach = (s) => { const t = setInterval(() => { try { sende(s, { t: "da" }); } catch { /* zu */ } }, 10000); t.unref(); return s; };
try {
  const ida = wach(await spieler("ida"));
  check([E1, E2, E3, E4, SCHAFE, GRAEBER].every(Boolean), "E1–E4, Mettes Schafe und Ruhelose Gräber sind im Spiel");

  console.log("E4 „Das Grab des Grauen Hauptmanns“ (ab dem Siegel)");
  check(erl(ida, E4, "siegel") && !erl(ida, E4, "hauptmann") && an(ida, E4, "hauptmann_gruft"), "Start: Siegel gebrochen, hauptmann_gruft an (Kopie der Gruft)");
  { sende(ida, { t: "ort", ort: "hauptmann_gruft" }); await stelle(ida, 11216, 9614); const z = await kampf("ida", 11216, 9614); await schlaf(2500);
    const hm = () => z && z.w.find((w) => w[2] === "grauer_hauptmann");
    check(Boolean(hm()), "Der Graue Hauptmann steht in Idas Kopie der Gruft");
    const s = z ? await kaempfen(z, ["grauer_hauptmann", "wiedergaenger"], () => erl(ida, E4, "hauptmann"), 330000) : 0; /* unter 400 s je Test; der Hauptmann ist zu stark (#156) */
    check(erl(ida, E4, "hauptmann"), `Der Graue Hauptmann besiegt (${s} Siege)`); if (z) { z.ws.close(); await schlaf(2500); } }
  await objekt(ida, E4, "e4_klinge"); check(erl(ida, E4, "klinge") && anzahl(ida, "klinge_hauptmann") === 1, "Die Klinge des Hauptmanns aufgehoben (Questobjekt)");
  check(await sprich(ida, E4, "wigand", "klinge_geben") && fertig(ida, E4), "E4 fertig, Lohn abgeholt");
  check(anzahl(ida, "klinge_hauptmann") === 1, "Wigand gibt die Klinge geschärft zurück (Lohn)");
  check(an(ida, E4, "hauptmann_danach") && !an(ida, E4, "hauptmann_gruft"), "Danach: hauptmann_danach an, die Quest-Kopie der Gruft aus");

} catch (e) { console.error(e); check(false, "Ausnahme: " + e.message); }
W.ende("Block E (Grauwacht, Teil 5: E4, der Graue Hauptmann)");
