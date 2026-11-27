/*
 * Riftmere – Block C (Phase 6, Raben-Trilogie) Ende zu Ende: echter Spielserver (localhost:8822), nachgebildete Supabase (localhost:8821), echte Kampfwelt.
 * Ute spielt C1 „Schwarze Federn“, C2 „Der Gesang der Spiralsteine“ und C3 „Der Oberste Rabenpriester“ ganz, mit den Bossen in ihrer Quest-Fassung
 * (Federmutter im Nest, der Oberste im Thronsaal) und den Schaltern danach (federmutter_danach, rabenpriester_danach). Lohn jeweils mit „abholen“.
 * Bea (ohne B4) ist die Gegenprobe. Aufruf: node test/c-welt.test.mjs   (nach node build.mjs und python3 werkzeug/weltzonen.py)
 */
import { starte, starkerHeld, QUESTS, QB } from "./questwelt.mjs";
const C1 = QUESTS.find((q) => q.id === "rabenmoor_schwarze_federn"), C2 = QUESTS.find((q) => q.id === "aschenwerth_gesang_der_spiralsteine"), C3 = QUESTS.find((q) => q.id === "rabengrund_der_oberste");
const W = await starte({ sb: 8821, srv: 8822, helden: {
  ute: starkerHeld({ fertig: ["westmark_das_rote_banner", "obstwiesen_fallobst"], berufe: { holzfaellerei: 40, handwerk: 30 }, rucksack: ["holzbeil_einfach", "hammer", ...Array(5).fill("stamm_tanne")] }),
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

  console.log("C1 „Schwarze Federn“");
  { const z = await kampf("bea", 6321, 6697); check(!(await sprich(bea, C1, "bertold", "annehmen")), "Bea (ohne „Das rote Banner“): Bertold bietet C1 nicht an"); z && z.ws.close(); }
  { const z = await kampf("ute", 6321, 6697); check(await sprich(ute, C1, "bertold", "annehmen") && stand(ute, C1).phase === "laeuft", "Ute nimmt C1 an (B4 fertig, Heldenlevel 30)"); z && z.ws.close(); await schlaf(2500); }
  check(await sprich(ute, C1, "joost", "bruecke_frage") && erl(ute, C1, "joost"), "Joost am Steg erzählt von der alten Brücke");
  check(await sprich(ute, C1, "gisbert", "weiden_frage") && erl(ute, C1, "gisbert"), "Gisbert Ast weiß, welche Moorweiden taugen (quer: Obstwiesen)");
  { let i = 0; const t0 = Date.now(); while (anzahl(ute, "stamm_moorweide") < 4 && Date.now() - t0 < 120000) { const [id, x, y] = WEIDEN[i++ % 3]; await sammeln(ute, "holz", id, x, y, "stamm_moorweide", anzahl(ute, "stamm_moorweide") + 1, 20000); }
    check(erl(ute, C1, "weiden") && anzahl(ute, "stamm_moorweide") >= 4, `Vier Moorweiden gefällt (${anzahl(ute, "stamm_moorweide")})`); }
  { let r = "ok"; for (let i = 0; i < 4 && r === "ok"; i++) r = await herstellen(ute, 6310.7, 6703.5, "brueckenplanke"); /* ein Quest-Rezept stellt je Auftrag so viele her, wie die Quest noch braucht – hier zählt erst Harm */
    check(r === "ok" && anzahl(ute, "brueckenplanke") === 4, `Vier Brückenplanken an der Werkbank neben Harm (${r}, ${anzahl(ute, "brueckenplanke")})`); }
  check(await sprich(ute, C1, "harm", "planken_geben") && erl(ute, C1, "planken") && anzahl(ute, "brueckenplanke") === 0, "Harm nimmt die vier Planken");
  check(await sprich(ute, C1, "ulf", "tannen") && erl(ute, C1, "pech") && anzahl(ute, "meilerpech") === 1, "Köhler Ulf brennt Meilerpech für fünf Tannenstämme");
  { const t = await objekt(ute, C1, "c1_bruecke"); check(erl(ute, C1, "bruecke") && an(C1, ute, "bruecke_aschenwerth"), `Brücke geflickt, sie trägt (Schalter bruecke_aschenwerth) – ${t.slice(0, 40)}`); }
  { const r = await W.kampfBis(ute, 6193, 6664, ["rabenpriester_novize"], () => W.erl(ute, C1, "novizen"));
    check(erl(ute, C1, "novizen"), `Drei Novizen am Steinkreis besiegt (${r.siege} Siege)`); }
  check(await sprich(ute, C1, "ebbo", "losbinden") && erl(ute, C1, "ebbo"), "Ebbo losgebunden");
  await objekt(ute, C1, "c1_kapuze"); check(erl(ute, C1, "kapuze") && anzahl(ute, "novizenkapuze") === 1, "Die Novizenkapuze am Ufer aufgehoben");
  check(await sprich(ute, C1, "bertold", "kapuze_zeigen") && fertig(ute, C1), "C1 fertig: Kapuze bei Bertold, Lohn abgeholt");

  console.log("C2 „Der Gesang der Spiralsteine“");
  check(await sprich(ute, C2, "hedda", "annehmen") && stand(ute, C2).phase === "laeuft" && anzahl(ute, "moorwachs") === 1, "Ute nimmt C2 bei Hedda an und bekommt Moorglöckchen-Wachs");
  await objekt(ute, C2, "c2_kreis_moor"); await objekt(ute, C2, "c2_kreis_insel");
  check(erl(ute, C2, "lauschen_moor") && erl(ute, C2, "lauschen_insel"), "An beiden Steinkreisen gelauscht");
  { const t0 = Date.now(); await stelle(ute, 6178.5, 6656); const z = await kampf("ute", 6178.5, 6656); const AK = ["rabenpriester_akoluth", "rabenpriester_akoluth_speer"];
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

  console.log("C3 „Der Oberste Rabenpriester“");
  check(await sprich(ute, C3, "hedda", "annehmen") && stand(ute, C3).phase === "laeuft" && anzahl(ute, "moorwasser") === 1 && anzahl(ute, "federsiegel") >= 1, "Ute nimmt C3 an: Moorwasser und ein Federsiegel");
  await objekt(ute, C3, "c3_linde"); check(erl(ute, C3, "weihen") && anzahl(ute, "moorwasser_geweiht") === 1, "Moorwasser am Bindestein an der Linde geweiht (quer: Weidenhain)");
  await ort(ute, "rabengrund", 10645, 9620); check(erl(ute, C3, "abstieg"), "In den Rabengrund hinabgestiegen");
  { const t0 = Date.now(); const z = await kampf("ute", 10645, 9620);
    while (anzahl(ute, "kerkerschluessel") < 1 && Date.now() - t0 < 240000) { await kaempfen(z, ["kerkermeister"], (n) => n >= 1, 90000); await schlaf(1000);
      for (const b of ute.boden.filter((x) => x.g === "kerkerschluessel")) { await stelle(ute, b.x, b.y); sende(ute, { t: "aufheben", id: b.i }); await schlaf(600); } }
    z && z.ws.close(); await schlaf(2500); check(erl(ute, C3, "schluessel"), "Den Kerkerschlüssel vom Kerkermeister erbeutet"); }
  await objekt(ute, C3, "c3_kaefige"); check(erl(ute, C3, "kaefige"), "Die Käfige aufgeschlossen");
  await objekt(ute, C3, "c3_becken"); check(erl(ute, C3, "becken") && an(C3, ute, "becken_getruebt") && an(C3, ute, "rabenpriester_thronsaal"), "Moorwasser ins Becken (getrübt), der Thronsaal steht offen");
  await ort(ute, "rabengrund_thronsaal", 10768.5, 9625);
  { const z = await kampf("ute", 10768.5, 9625); await schlaf(1500); const ob = () => z && z.w.find((w) => w[2] === "oberster_rabenpriester");
    check(Boolean(ob()) && anzahl(ute, "federsiegel") === 0, "Thronsaal: das Federsiegel zerfällt, der Oberste steht in Utes Kopie");
    await kaempfen(z, ["oberster_rabenpriester", "rabenpriester_akoluth", "rabenpriester_akoluth_speer"], () => erl(ute, C3, "oberster"), 360000);
    check(erl(ute, C3, "oberster"), "Der Oberste Rabenpriester besiegt (Quest-Fassung)"); z && z.ws.close(); await schlaf(2500); }
  await ort(ute, "rabenmoor", 6292.5, 6679.5);
  check(await sprich(ute, C3, "liske", "sprechen") && erl(ute, C3, "liske"), "Liske bei Hedda wiedergesehen");
  check(await sprich(ute, C3, "bertold", "fest") && fertig(ute, C3) && anzahl(ute, "rabenpanzer") === 1, "C3 fertig: Fest im Langhaus, der Rabenpanzer");
  check(an(C3, ute, "rabenpriester_danach") && !an(C3, ute, "rabenpriester_thronsaal") && an(C3, ute, "bindestein_becken"), "Danach: rabenpriester_danach an, Quest-Thronsaal zu, Bindestein am Becken");
} catch (e) { console.error(e); check(false, "Ausnahme: " + e.message); }
W.ende("Block C (Raben-Trilogie)");
