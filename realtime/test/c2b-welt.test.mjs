/*
 * Riftmere – Quest C2 „Der Gesang der Spiralsteine“, Teil 2: Abstieg ins Nest, die Federmutter (Quest-Fassung), Abgabe, danach federmutter_danach Ende zu Ende: echter Spielserver (localhost:8834), nachgebildete Supabase (localhost:8833), echte Kampfwelt, Lohn mit „abholen“.
 * Block C ist geteilt (unter 400 s je Test): c1-welt, c2-welt, c2b-welt, c3-welt, c3b-welt. Dieser Teil beginnt mitten in C2 (Spiralsteine gelöst).
 * Aufruf: node test/c2-welt.test.mjs   (nach node build.mjs und python3 werkzeug/weltzonen.py)
 */
const SB = 8833, SRV = 8834, FERTIG = ["westmark_das_rote_banner", "obstwiesen_fallobst", "rabenmoor_schwarze_federn"];
import { starte, starkerHeld, standNach, QUESTS, QB } from "./questwelt.mjs";
const C1 = QUESTS.find((q) => q.id === "rabenmoor_schwarze_federn"), C2 = QUESTS.find((q) => q.id === "aschenwerth_gesang_der_spiralsteine"), C3 = QUESTS.find((q) => q.id === "rabengrund_der_oberste");
const C2_ID = "aschenwerth_gesang_der_spiralsteine", C2Q = QUESTS.find((q) => q.id === C2_ID);
const MITTE = standNach(C2Q, [{ art: "objekt", id: "c2_kreis_moor" }, { art: "objekt", id: "c2_kreis_insel" }, ...Array(3).fill({ art: "aufheben", g: "federsiegel" })], ["silben"]);
const STEINE = ["mond", "welle", "feder", "auge"].reduce((st, k) => QB.ereignis(C2Q, st, { art: "objekt", id: "c2_" + k }), MITTE);
const W = await starte({ sb: SB, srv: SRV, helden: {
  ute: starkerHeld({ fertig: FERTIG, staende: { [C2_ID]: STEINE }, berufe: { holzfaellerei: 40, handwerk: 30 }, rucksack: ["holzbeil_einfach", "hammer", ...Array(5).fill("stamm_tanne")] }),
  bea: starkerHeld({}) } });
const { check, schlaf, anzahl, stelle, rede, sprich, objekt, stand, erl, fertig, kampf, kaempfen, aufheben, sammeln, herstellen, sende } = W;
const K0 = { hat: () => false, verloren: () => false };
const an = (q, s, name) => [].concat(q.schalter[name]).some((b) => QB.gilt(q, s.b[q.id] || "", b, K0));
/** Region wechseln (wie der Browser beim Laufen über eine Grenze) */
const ort = async (s, region, x, y) => { sende(s, { t: "ort", ort: region }); await schlaf(200); await stelle(s, x, y); await schlaf(300); };
const WEIDEN = [["moorweide_1", 6332.5, 6691.5], ["moorweide_2", 6336.5, 6691.5], ["moorweide_3", 6331.5, 6695.5]];

try {
  const ute = await W.spieler("ute");
  check(["mond", "welle", "feder", "auge"].every((k) => erl(ute, C2, k)) && an(C2, ute, "federmutter_kammer"), "Start: Spiralsteine gelöst, das Nest steht offen (federmutter_kammer)");
  await ort(ute, "federmutter_kammer", 11536.5, 9620.5); check(erl(ute, C2, "abstieg"), "Unter den Steinkreis hinabgestiegen");
  { const z = await kampf("ute", 11536.5, 9620.5); const rv = () => z && z.w.find((w) => w[2] === "federmutter");
    check(Boolean(rv()), "Ravena steht in Utes Kopie des Nests");
    await kaempfen(z, ["federmutter", "rabenpriester_akoluth", "rabenpriester_akoluth_speer"], () => erl(ute, C2, "ravena"), 280000);
    check(erl(ute, C2, "ravena"), "Federmutter Ravena besiegt (Quest-Fassung)"); z && z.ws.close(); await schlaf(2500); }
  await ort(ute, "rabenmoor", 6290.4, 6677.4);
  check(await sprich(ute, C2, "hedda", "fertig") && fertig(ute, C2), "C2 fertig bei Hedda, Lohn abgeholt");
  check(an(C2, ute, "federmutter_danach") && !an(C2, ute, "federmutter_kammer") && an(C2, ute, "gruft_offen"), "Danach: federmutter_danach an, die Quest-Kammer zu, die Gruft offen");

} catch (e) { console.error(e); check(false, "Ausnahme: " + e.message); }
W.ende("C2 „Der Gesang der Spiralsteine“ (Teil 2)");
