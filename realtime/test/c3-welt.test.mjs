/*
 * Riftmere – Quest C3 „Der Oberste Rabenpriester“, Teil 1: Linde, Rabengrund, Kerkermeister, Käfige, Becken – bis der Thronsaal offen steht Ende zu Ende: echter Spielserver (localhost:8828), nachgebildete Supabase (localhost:8827), echte Kampfwelt, Lohn mit „abholen“.
 * Block C ist geteilt (unter 400 s je Test): c1-welt, c2-welt, c2b-welt, c3-welt, c3b-welt – jeder beginnt mit den vorigen Quests als fertig.
 * Aufruf: node test/c3-welt.test.mjs   (nach node build.mjs und python3 werkzeug/weltzonen.py)
 */
const SB = 8827, SRV = 8828, FERTIG = ["westmark_das_rote_banner", "obstwiesen_fallobst", "rabenmoor_schwarze_federn", "aschenwerth_gesang_der_spiralsteine"];
import { starte, starkerHeld, QUESTS, QB } from "./questwelt.mjs";
const C1 = QUESTS.find((q) => q.id === "rabenmoor_schwarze_federn"), C2 = QUESTS.find((q) => q.id === "aschenwerth_gesang_der_spiralsteine"), C3 = QUESTS.find((q) => q.id === "rabengrund_der_oberste");
const W = await starte({ sb: SB, srv: SRV, helden: {
  ute: starkerHeld({ fertig: FERTIG, berufe: { holzfaellerei: 40, handwerk: 30 }, rucksack: ["holzbeil_einfach", "hammer", ...Array(5).fill("stamm_tanne")] }),
  bea: starkerHeld({}) } });
const { check, schlaf, anzahl, stelle, rede, sprich, objekt, stand, erl, fertig, kampf, kaempfen, aufheben, sammeln, herstellen, sende } = W;
const K0 = { hat: () => false, verloren: () => false };
const an = (q, s, name) => [].concat(q.schalter[name]).some((b) => QB.gilt(q, s.b[q.id] || "", b, K0));
/** Region wechseln (wie der Browser beim Laufen über eine Grenze) */
const ort = async (s, region, x, y) => { sende(s, { t: "ort", ort: region }); await schlaf(200); await stelle(s, x, y); await schlaf(300); };
const WEIDEN = [["moorweide_1", 6332.5, 6691.5], ["moorweide_2", 6336.5, 6691.5], ["moorweide_3", 6331.5, 6695.5]];

try {
  const ute = await W.spieler("ute"), bea = await W.spieler("bea");
  check(Boolean(C1 && C2 && C3), "C1, C2, C3 sind im Spiel");
  console.log("C3 „Der Oberste Rabenpriester“");
  { const z = await kampf("ute", 6290.4, 6677.4);
    check(await sprich(ute, C3, "hedda", "annehmen") && stand(ute, C3).phase === "laeuft" && anzahl(ute, "moorwasser") === 1 && anzahl(ute, "federsiegel") >= 1, "Ute nimmt C3 an: Moorwasser und ein Federsiegel"); z && z.ws.close(); await schlaf(2500); }
  await objekt(ute, C3, "c3_linde"); check(erl(ute, C3, "weihen") && anzahl(ute, "moorwasser_geweiht") === 1, "Moorwasser am Bindestein an der Linde geweiht (quer: Weidenhain)");
  await ort(ute, "rabengrund", 10645, 9620); check(erl(ute, C3, "abstieg"), "In den Rabengrund hinabgestiegen");
  { const t0 = Date.now(); const z = await kampf("ute", 10645, 9620);
    while (anzahl(ute, "kerkerschluessel") < 1 && Date.now() - t0 < 240000) { await kaempfen(z, ["kerkermeister"], (n) => n >= 1, 90000); await schlaf(1000);
      for (const b of ute.boden.filter((x) => x.g === "kerkerschluessel")) { await stelle(ute, b.x, b.y); sende(ute, { t: "aufheben", id: b.i }); await schlaf(600); } }
    z && z.ws.close(); await schlaf(2500); check(erl(ute, C3, "schluessel"), "Den Kerkerschlüssel vom Kerkermeister erbeutet"); }
  await objekt(ute, C3, "c3_kaefige"); check(erl(ute, C3, "kaefige"), "Die Käfige aufgeschlossen");
  await objekt(ute, C3, "c3_becken"); check(erl(ute, C3, "becken") && an(C3, ute, "becken_getruebt") && an(C3, ute, "rabenpriester_thronsaal"), "Moorwasser ins Becken (getrübt), der Thronsaal steht offen");
} catch (e) { console.error(e); check(false, "Ausnahme: " + e.message); }
W.ende("C3 „Der Oberste Rabenpriester“ (Teil 1)");
