/*
 * Riftmere – Quest C2 „Der Gesang der Spiralsteine“ mit der Federmutter im Nest (Quest-Fassung, danach federmutter_danach) Ende zu Ende: echter Spielserver (localhost:8826), nachgebildete Supabase (localhost:8825), echte Kampfwelt, Lohn mit „abholen“.
 * Block C ist in drei Tests geteilt (unter 400 s je Test): c1-welt, c2-welt, c3-welt – jeder beginnt mit den vorigen Quests als fertig.
 * Aufruf: node test/c2-welt.test.mjs   (nach node build.mjs und python3 werkzeug/weltzonen.py)
 */
const SB = 8825, SRV = 8826, FERTIG = ["westmark_das_rote_banner", "obstwiesen_fallobst", "rabenmoor_schwarze_federn"];
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
  console.log("C2 „Der Gesang der Spiralsteine“");
  { const z = await kampf("ute", 6290.4, 6677.4); /* Kampfskills (Defense 25) kennt der Server aus der Kampfverbindung */
    check(await sprich(ute, C2, "hedda", "annehmen") && stand(ute, C2).phase === "laeuft" && anzahl(ute, "moorwachs") === 1, "Ute nimmt C2 bei Hedda an und bekommt Moorglöckchen-Wachs"); z && z.ws.close(); await schlaf(2500); }
  await objekt(ute, C2, "c2_kreis_moor"); await objekt(ute, C2, "c2_kreis_insel");
  check(erl(ute, C2, "lauschen_moor") && erl(ute, C2, "lauschen_insel"), "An beiden Steinkreisen gelauscht");
  { const t0 = Date.now(); await stelle(ute, 6243, 6733); const z = await kampf("ute", 6243, 6733); const AK = ["rabenpriester_akoluth", "rabenpriester_akoluth_speer"];
    while (!erl(ute, C2, "siegel") && Date.now() - t0 < 240000) { await kaempfen(z, AK, (n) => n >= 1, 60000); await schlaf(800);
      for (const b of ute.boden.filter((x) => x.g === "federsiegel")) { await stelle(ute, b.x, b.y); sende(ute, { t: "aufheben", id: b.i }); await schlaf(500); } }
    z && z.ws.close(); await schlaf(2500);
    check(erl(ute, C2, "siegel"), `Drei Federsiegel von Akoluthen erbeutet (Zähler ${QB.zaehler(C2, ute.b[C2.id] || "", "siegel")})`); }
  check(!(await sprich(ute, C2, "hedda", "reihe_falsch")) || !erl(ute, C2, "silben"), "Falsche Reihenfolge bei Hedda: noch nicht");
  check(await sprich(ute, C2, "hedda", "reihe_richtig") && erl(ute, C2, "silben"), "Mit Hedda die Silben zusammengesetzt (Mond, Welle, Feder, Auge)");
  { await objekt(ute, C2, "c2_welle"); check(!erl(ute, C2, "welle"), "Welle vor dem Mond: nur ein Misston");
    for (const k of ["mond", "welle", "feder", "auge"]) await objekt(ute, C2, "c2_" + k);
    check(["mond", "welle", "feder", "auge"].every((k) => erl(ute, C2, k)) && an(C2, ute, "federmutter_kammer"), "Spiralsteine in der richtigen Reihenfolge – das Nest steht offen (federmutter_kammer)"); }
  await ort(ute, "federmutter_kammer", 11536.5, 9620.5); check(erl(ute, C2, "abstieg"), "Unter den Steinkreis hinabgestiegen");
  { const z = await kampf("ute", 11536.5, 9620.5); const rv = () => z && z.w.find((w) => w[2] === "federmutter");
    check(Boolean(rv()), "Ravena steht in Utes Kopie des Nests");
    await kaempfen(z, ["federmutter", "rabenpriester_akoluth", "rabenpriester_akoluth_speer"], () => erl(ute, C2, "ravena"), 300000);
    check(erl(ute, C2, "ravena"), "Federmutter Ravena besiegt (Quest-Fassung)"); z && z.ws.close(); await schlaf(2500); }
  await ort(ute, "rabenmoor", 6290.4, 6677.4);
  check(await sprich(ute, C2, "hedda", "fertig") && fertig(ute, C2), "C2 fertig bei Hedda, Lohn abgeholt");
  check(an(C2, ute, "federmutter_danach") && !an(C2, ute, "federmutter_kammer") && an(C2, ute, "gruft_offen"), "Danach: federmutter_danach an, die Quest-Kammer zu, die Gruft offen");

} catch (e) { console.error(e); check(false, "Ausnahme: " + e.message); }
W.ende("C2 „Der Gesang der Spiralsteine“");
