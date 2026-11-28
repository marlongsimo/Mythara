/*
 * Riftmere – Quest C3 „Der Oberste Rabenpriester“, Teil 2: der Thronsaal (Quest-Fassung, Federsiegel), Liske, das Fest, danach rabenpriester_danach Ende zu Ende: echter Spielserver (localhost:8836), nachgebildete Supabase (localhost:8835), echte Kampfwelt, Lohn mit „abholen“.
 * Block C ist geteilt (unter 400 s je Test): c1-welt, c2-welt, c2b-welt, c3-welt, c3b-welt. Dieser Teil beginnt mitten in C3 (Käfige offen, Becken getrübt).
 * Aufruf: node test/c3-welt.test.mjs   (nach node build.mjs und python3 werkzeug/weltzonen.py)
 */
const SB = 8835, SRV = 8836, FERTIG = ["westmark_das_rote_banner", "obstwiesen_fallobst", "rabenmoor_schwarze_federn", "aschenwerth_gesang_der_spiralsteine"];
import { starte, starkerHeld, LEGENDAER, standNach, QUESTS, QB } from "./questwelt.mjs";
const C1 = QUESTS.find((q) => q.id === "rabenmoor_schwarze_federn"), C2 = QUESTS.find((q) => q.id === "aschenwerth_gesang_der_spiralsteine"), C3 = QUESTS.find((q) => q.id === "rabengrund_der_oberste");
const C3_ID = "rabengrund_der_oberste", C3Q = QUESTS.find((q) => q.id === C3_ID);
const MITTE = standNach(C3Q, [{ art: "betreten", region: "rabengrund", x: 10645, y: 9620 }, { art: "aufheben", g: "kerkerschluessel" }, { art: "objekt", id: "c3_kaefige" }, { art: "objekt", id: "c3_linde" }, { art: "objekt", id: "c3_becken" }]);
const W = await starte({ sb: SB, srv: SRV, helden: {
  ute: starkerHeld({ angelegt: LEGENDAER /* Ausrüstung in passender Stufe für den Obersten */, fertig: FERTIG, staende: { [C3_ID]: MITTE }, berufe: { holzfaellerei: 40, handwerk: 30 }, rucksack: ["holzbeil_einfach", "hammer", "federsiegel", ...Array(5).fill("stamm_tanne")] }),
  bea: starkerHeld({}) } });
const { check, schlaf, anzahl, stelle, rede, sprich, objekt, stand, erl, fertig, kampf, kaempfen, aufheben, sammeln, herstellen, sende } = W;
const K0 = { hat: () => false, verloren: () => false };
const an = (q, s, name) => [].concat(q.schalter[name]).some((b) => QB.gilt(q, s.b[q.id] || "", b, K0));
/** Region wechseln (wie der Browser beim Laufen über eine Grenze) */
const ort = async (s, region, x, y) => { sende(s, { t: "ort", ort: region }); await schlaf(200); await stelle(s, x, y); await schlaf(300); };
const WEIDEN = [["moorweide_1", 6332.5, 6691.5], ["moorweide_2", 6336.5, 6691.5], ["moorweide_3", 6331.5, 6695.5]];

try {
  const ute = await W.spieler("ute");
  check(erl(ute, C3, "kaefige") && erl(ute, C3, "becken") && an(C3, ute, "rabenpriester_thronsaal"), "Start: Käfige offen, Becken getrübt, der Thronsaal steht offen");
  await ort(ute, "rabengrund_thronsaal", 10768.5, 9625);
  { const z = await kampf("ute", 10768.5, 9625); await schlaf(1500); const ob = () => z && z.w.find((w) => w[2] === "oberster_rabenpriester");
    check(Boolean(ob()) && anzahl(ute, "federsiegel") === 0, "Thronsaal: das Federsiegel zerfällt, der Oberste steht in Utes Kopie");
    await kaempfen(z, ["oberster_rabenpriester", "rabenpriester_akoluth", "rabenpriester_akoluth_speer"], () => erl(ute, C3, "oberster"), 300000);
    check(erl(ute, C3, "oberster"), "Der Oberste Rabenpriester besiegt (Quest-Fassung)"); z && z.ws.close(); await schlaf(2500); }
  await ort(ute, "rabenmoor", 6292.5, 6679.5);
  check(await sprich(ute, C3, "liske", "sprechen") && erl(ute, C3, "liske"), "Liske bei Hedda wiedergesehen");
  check(await sprich(ute, C3, "bertold", "fest") && fertig(ute, C3) && anzahl(ute, "rabenpanzer") === 1, "C3 fertig: Fest im Langhaus, der Rabenpanzer");
  check(an(C3, ute, "rabenpriester_danach") && !an(C3, ute, "rabenpriester_thronsaal") && an(C3, ute, "bindestein_becken"), "Danach: rabenpriester_danach an, Quest-Thronsaal zu, Bindestein am Becken");
} catch (e) { console.error(e); check(false, "Ausnahme: " + e.message); }
W.ende("C3 „Der Oberste Rabenpriester“ (Teil 2)");
