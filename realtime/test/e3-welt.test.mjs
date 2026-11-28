/*
 * Riftmere – Block E (Phase 8, Grauwacht), E3 „Fahnenflucht“ auf beiden Wegen (Ida: Glocke und Eid, Tom: „Ergib dich“) Ende zu Ende: echter Spielserver (localhost:8844), nachgebildete Supabase (localhost:8843), echte Kampfwelt, Lohn mit „abholen“.
 * Block E ist in fünf Tests geteilt (unter 400 s je Test): e-welt (E1, E2), e2-welt (Schafe, Gräber), e3-welt (E3), e4-welt (E4 bis zum Siegel), e4b-welt (E4 ab dem Siegel).
 * Aufruf: node test/e3-welt.test.mjs   (nach node build.mjs und python3 werkzeug/weltzonen.py)
 */
import { starte, starkerHeld, QUESTS, QB } from "./questwelt.mjs";
const Q = (id) => QUESTS.find((q) => q.id === id);
const E1 = Q("grauwacht_der_weg"), E2 = Q("grauwacht_die_glocke"), E3 = Q("grauwacht_fahnenflucht"), E4 = Q("grauwacht_grab_des_hauptmanns");
const SCHAFE = Q("heidrast_mettes_schafe"), GRAEBER = Q("grauwacht_ruhelose_graeber");
const BERUFE = { holzfaellerei: 40, schmieden: 45, kochen: 45, splitterbinden: 35, handwerk: 30 }; /* Kochen 45: die Glocke gießt man am Herd (Rezept glocke, Station herd) */
const viel = (g, n) => Array.from({ length: n }, () => g);
const SACHEN = [];
/* eine Waffe, wie man sie in dieser Stufe trägt (Heldenlevel 42+), statt des Anfänger-Ritterschwerts */
/* Tjark ist ein Boss (Stufe 46): ohne Rüstung fiel Tom unter Last manchmal – dann ging Tjark ohne Ziel (einmaliger Gegner) und die Wachen erledigten den Rest, ohne Questschritt */
const mitWaffe = (H) => { Object.assign(H.inventar.angelegt, { waffe: "eidschwert_episch", nebenhand: "sternenschild_mythisch", brust: "eisenwacht_mythisch", beine: "eisenbeinschienen_mythisch", kopf: "eisenwachthelm_mythisch" }); return H; };
const W = await starte({ sb: 8843, srv: 8844, helden: {
  /* Ida: Level 99, mit den Quests vor diesem Teil fertig */
  ida: mitWaffe(starkerHeld({ berufe: BERUFE, fertig: ["ostufer_das_gruene_licht", "grauwacht_der_weg", "grauwacht_die_glocke", "heidrast_mettes_schafe", "grauwacht_ruhelose_graeber"], rucksack: SACHEN })),
  /* Tom: E1 und E2 schon fertig – E3 über „Ergib dich“ */
  tom: mitWaffe(starkerHeld({ berufe: BERUFE, fertig: ["ostufer_das_gruene_licht", "grauwacht_der_weg", "grauwacht_die_glocke"] })) } }); /* Ports: localhost:8843, localhost:8844 */
const { check, spieler, schlaf, anzahl, stelle, sprich, objekt, stand, erl, fertig, kampf, kaempfen, kampfBis, sammeln, herstellen, sende, ding } = W;
const an = (s, q, id) => QB.schalter(q, s.b[q.id] || "", id) === true;
/** reden, während eine Kampfverbindung steht (dann kennt der Server das Heldenlevel) */
async function sprichImKampf(s, q, npc, a) { const F = q.figuren.find((x) => x.id === npc); const z = await kampf(s.name, F.x + 1, F.y); const ok = await sprich(s, q, npc, a); if (z) { z.ws.close(); await schlaf(2500); } return ok; }

/* Die Welt-Verbindung meldet sich wie der Browser regelmäßig (sonst schläft sie in langen Kämpfen ein – und mit ihr die Quest-Meldungen) */
const wach = (s) => { const t = setInterval(() => { try { sende(s, { t: "da" }); } catch { /* zu */ } }, 10000); t.unref(); return s; };
try {
  const ida = wach(await spieler("ida"));
  check([E1, E2, E3, E4, SCHAFE, GRAEBER].every(Boolean), "E1–E4, Mettes Schafe und Ruhelose Gräber sind im Spiel");

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
    /* Tjark ist ein einmaliger Gegner (Folge.angriff): Hat er 20 s kein Ziel (EINMAL_WEG), geht er wieder. Unter Last (6 Tests gleichzeitig) kam
       der Angriff manchmal zu spät – Tjark war weg und kaempfen() wartete bis zur Frist (rot nach rund 201 s, „0 Siege“). Dann erneut ansprechen. */
    let s = 0, weg = 0; const tjOrt = tj() ? [tj()[4], tj()[5]] : null; /* Stelle in der Kampfwelt, an der Tjark erscheint */
    for (let v = 0; z && v < 3 && !erl(tom, E3, "tjark"); v++) {
      if (!tj()) { weg++; /* meist ist Tom gefallen (unter Last): erst wieder lebendig und zurück bei Tjark, sonst hat der neue Tjark gleich kein Ziel */
        const ich = () => z.w.find((w) => w[1] === 1), nah = () => ich() && !ich()[10] && tjOrt && Math.hypot(ich()[4] - tjOrt[0], ich()[5] - tjOrt[1]) < 3;
        await stelle(tom, T.x + 1, T.y); for (let i = 0; i < 120 && !nah(); i++) { if (i % 10 === 9) await stelle(tom, T.x + 1, T.y); await schlaf(500); } /* nach dem Wiederaufstehen läuft er zurück */
        await sprich(tom, E3, "tjark", "kampf"); await schlaf(1500); }
      s += await kaempfen(z, ["tjark"], () => erl(tom, E3, "tjark") || !tj(), 120000);
      for (let i = 0; i < 50 && !erl(tom, E3, "tjark"); i++) await schlaf(100); }
    await schlaf(1500);
    check(erl(tom, E3, "tjark") && anzahl(tom, "tjarks_eid") === 0, `Tjark besiegt, sein Tod erledigt den Schritt (${s} Siege${weg ? `, ${weg}× war Tjark wieder fort und wurde neu angesprochen` : ""})`);
    if (z) { z.ws.close(); await schlaf(2500); } }
  check(await sprich(tom, E3, "wigand", "bericht") && fertig(tom, E3) && an(tom, E3, "grauwacht_burg"), "Tom: E3 über „Bericht erstatten“ fertig; grauwacht_burg an");

} catch (e) { console.error(e); check(false, "Ausnahme: " + e.message); }
W.ende("Block E (Grauwacht, Teil 3: E3)");
