/*
 * Riftmere – Block F (Phase 9) Ende zu Ende: F1 „Ende des Grases“, F2 „Salz und Feuer“, F4 „Der Strom trägt“ und „Die Karte des Boten“.
 * Block F ist geteilt (unter 400 s je Test): f-welt (F1, F2, F4, Karte), f3-welt (F3 bis zur Inschrift), f3b-welt (F3: Sandmutter, Abgabe, danach).
 * Echter Spielserver (localhost:8816), nachgebildete Supabase (localhost:8815), Kampfwelt in den Glutsanden, im Tempel und in der Kammer der Sandmutter (Instanz).
 * Ida (stark, D2 und E4 fertig) spielt alles ganz, Lohn mit „abholen“; Tom (ohne D2) ist die Gegenprobe.
 * Aufruf: node test/f-welt.test.mjs   (nach node build.mjs und python3 werkzeug/weltzonen.py)
 */
import { starte, starkerHeld, QUESTS, QB } from "./questwelt.mjs";

const D2 = "ostufer_das_gruene_licht", E4 = "grauwacht_grab_des_hauptmanns";
/** mythische Ausrüstung: in den Glutsanden fallen ganze Lager über einen her (Level 40–55) */
const RUESTUNG = { waffe: "eidschwert_mythisch", brust: "eisenwacht_mythisch", beine: "eisenbeinschienen_mythisch", kopf: "eisenwachthelm_mythisch", nebenhand: "sternenschild_mythisch" };
const geruestet = (h) => { h.inventar.angelegt = { ...RUESTUNG }; return h; };
const F1_ID = "glutsande_ende_des_grases", F2_ID = "glutsande_salz_und_feuer", F3_ID = "glutsande_versandeter_tempel";
/* je Quest ein eigener Held mit den Voraussetzungen als „fertig“ – die Quests laufen gleichzeitig, ein langer Kampf hält die anderen nicht auf */
const W = await starte({ sb: 8815, srv: 8816, helden: {
  ida: geruestet(starkerHeld({ fertig: [D2] })),                                                              /* F1 */
  bea: geruestet(starkerHeld({ fertig: [D2, F1_ID], berufe: { schmieden: 55 }, rucksack: ["hammer", "barren_splittereisen", "barren_splittereisen"] })), /* F2 */
  dora: geruestet(starkerHeld({ fertig: [D2, F1_ID, F2_ID], berufe: { fischen: 70, kochen: 70 }, rucksack: ["reuse", { g: "salz", n: 5 }] })), /* F4 */
  ella: geruestet(starkerHeld({ fertig: [D2, E4, F1_ID, F3_ID], berufe: { kraeuterkunde: 35 }, rucksack: ["steinhaut_schwach"] })),          /* Karte */
  tom: starkerHeld({}) } });
const { check, spieler, sprich, objekt, stand, erl, fertig, kampf, kaempfen, kampfBis, stelle, herstellen, fischen, anzahl, schlaf, rede } = W;
const Q = (id) => QUESTS.find((q) => q.id === id);
const F1 = Q("glutsande_ende_des_grases"), F2 = Q("glutsande_salz_und_feuer"), F3 = Q("glutsande_versandeter_tempel"), F4 = Q("glutsande_der_strom_traegt"), K = Q("festland_karte_des_boten");
const K0 = { hat: () => false, verloren: () => false };
const schalterAn = (q, s, id) => [].concat(q.schalter[id]).some((b) => QB.gilt(q, s.b[q.id] || "", b, K0));
const fig = (q, id) => q.figuren.find((x) => x.id === id);
/** ansprechen, während eine Kampfverbindung offen ist (der Server kennt das Heldenlevel nur daher) */
async function mitHeld(s, q, npc, a) { const F = fig(q, npc), z = await kampf(s.name, F.x + 1, F.y); const ok = await sprich(s, q, npc, a); if (z) { z.ws.close(); await schlaf(2500); } return ok; }

try {
  const [ida, bea, dora, ella, tom] = await Promise.all(["ida", "bea", "dora", "ella", "tom"].map((n) => spieler(n)));
  check([F1, F2, F3, F4, K].every(Boolean), "F1–F4 und die Karte des Boten sind im Spiel");
  async function spielF1() {
    console.log("F1 „Ende des Grases“");
    check(!(await mitHeld(tom, F1, "kord", "annehmen")), "Tom (ohne „Das grüne Licht“): Kord bietet F1 nicht an");
    check(await mitHeld(ida, F1, "kord", "annehmen") && stand(ida, F1).phase === "laeuft" && anzahl(ida, "kords_brief") === 1, "Ida nimmt F1 an und bekommt Kords Brief");
    await objekt(ida, F1, "f1_grasende"); check(erl(ida, F1, "gras"), "Die Wegmarke „Ende des Grases“ gelesen");
    { const [x, y] = F1.schritte.find((x) => x.id === "raeuber_saebel").wo; await stelle(ida, x, y); const z = await kampf("ida", x, y); let n = 0;
      if (z) { n += await kaempfen(z, ["karawanenraeuber_saebel", "karawanenraeuber_bogen"], () => erl(ida, F1, "raeuber_saebel") && erl(ida, F1, "raeuber_bogen"), 400000); /* #154: beide zusammen – wer vom Bogenschützen beschossen wird, ist an ihn gebunden (Einzelkampf) und kann erst nach ihm einen Säbelräuber angreifen */
        { const ich = (z.w.find((w) => w[1] === 1) || [])[0]; check(!z.ev.some((e) => e.a === "tot" && e.id === ich), "Ida überlebt den Kanal"); } z.ws.close(); await schlaf(2500); } const r = { z, siege: n };
      check(erl(ida, F1, "raeuber_saebel") && erl(ida, F1, "raeuber_bogen"), `Karawanenräuber am Kanal besiegt (${r.siege} Siege${r.z ? "" : ", kein Kampfgebiet"})`); }
    check(await sprich(ida, F1, "selma", "brief_geben") && fertig(ida, F1) && anzahl(ida, "kords_brief") === 0, "F1 fertig: Selma liest den Brief, Lohn abgeholt");

  }
  async function spielF2() {
    console.log("F2 „Salz und Feuer“");
    check(await sprich(bea, F2, "ruwen", "annehmen") && stand(bea, F2).phase === "laeuft", "Bea nimmt F2 an");
    { const [x, y] = F2.schritte.find((x) => x.id === "skorpione").wo, z = await kampf("bea", x, y); await schlaf(1500);
      const n = z ? z.w.filter((w) => w[2] === "glutskorpion").length : 0; if (z) { z.ws.close(); await schlaf(2500); }
      check(n > 0, `An der Salzpfanne stehen Glutskorpione (${n}) – sonst lässt sich F2 dort nicht spielen`);
      /* Ersatz, solange die Salzpfanne leer ist: Glutskorpione am Kanal (zählt überall) */
      const r = await kampfBis(bea, 7046, 6855, ["glutskorpion"], () => erl(bea, F2, "skorpione"), 360000);
      check(erl(bea, F2, "skorpione"), `Fünf Glutskorpione vertrieben (${r.siege} Siege)`); }
    { const r = await herstellen(bea, 7116.2, 6947.6, "pfannenblech"); check(r === "ok" && anzahl(bea, "pfannenblech") === 1 && erl(bea, F2, "blech"), `Pfannenblech am Amboss in Glutbrunn (${r})`); }
    await objekt(bea, F2, "f2_pfanne"); await objekt(bea, F2, "f2_sieden");
    check(erl(bea, F2, "pfanne") && erl(bea, F2, "sieden") && anzahl(bea, "salz") >= 5, `Siedepfanne repariert, erstes Salz (${anzahl(bea, "salz")})`);
    { const ab = F2.dialoge.ruwen.optionen.find((o) => (o.folge || []).some((v) => v.f.abschluss)); check(ab && await sprich(bea, F2, "ruwen", ab.id) && fertig(bea, F2), "F2 fertig, Lohn abgeholt"); }
    check(schalterAn(F2, bea, "ruwen_salz") && !schalterAn(F2, tom, "ruwen_salz"), "Schalter ruwen_salz: bei Bea an, bei Tom aus");

  }
  async function spielF4() {
    console.log("F4 „Der Strom trägt“");
    check(await sprich(dora, F4, "nalia", "annehmen") && stand(dora, F4).phase === "laeuft", "Dora nimmt F4 an (nach F2, Fischen und Kochen 65)");
    check(await fischen(dora, "glutstrom", "fisch_glutwels_roh", 2) && erl(dora, F4, "welse"), `Zwei Glutwelse aus dem Strom (${anzahl(dora, "fisch_glutwels_roh")})`);
    { let r = await herstellen(dora, 7121 - 1.2, 6946, "glutwels_salzkruste"); if (!erl(dora, F4, "kruste") && anzahl(dora, "fisch_glutwels_roh") > 0) r = await herstellen(dora, null, null, "glutwels_salzkruste"); /* verbrannt: noch ein Wels */ check(r === "ok" && anzahl(dora, "glutwels_salzkruste") === 1 && erl(dora, F4, "kruste"), `Glutwels in Salzkruste am Herd von Glutbrunn (${r})`); }
    check(await sprich(dora, F4, "nalia", "abgeben") && fertig(dora, F4) && anzahl(dora, "glutwels_salzkruste") === 0, "F4 fertig, Lohn abgeholt");

  }
  async function spielKarte() {
    console.log("Die Karte des Boten");
    check(await sprich(ella, K, "ysolde", "annehmen") && stand(ella, K).phase === "laeuft", "Ella nimmt die Karte des Boten bei Ysolde an");
    { const F = fig(K, "hagan"); await stelle(ella, F.x + 1, F.y); await rede(ella, "hagan"); await W.sag(ella, "hagan", "raetsel_rabe"); await W.sag(ella, "hagan", "raetsel_turm"); await schlaf(300); }
    check(erl(ella, K, "archiv"), "Hagans Rätsel gelöst (Turm über drei Wellen), das Archiv steht offen");
    await objekt(ella, K, "karte_archiv"); check(anzahl(ella, "kartenstueck_1") === 1, "Stück 1 im Archiv der Waldmark");
    check(await sprich(ella, K, "hedda", "steinhaut") && anzahl(ella, "kartenstueck_2") === 1 && anzahl(ella, "steinhaut_schwach") === 0, "Stück 2 von Hedda gegen eine schwache Steinhaut");
    check(await sprich(ella, K, "merit", "stueck_nehmen") && anzahl(ella, "kartenstueck_3") === 1, "Stück 3 von Merit in Graufurt");
    await objekt(ella, K, "karte_sarkophag"); check(anzahl(ella, "kartenstueck_4") === 1, "Stück 4 aus dem Sarkophag in Grauwacht (nach E4)");
    await objekt(ella, K, "karte_tempel"); check(anzahl(ella, "kartenstueck_5") === 1, "Stück 5 aus der Kammer der Sandmutter (nach F3)");
    check(await sprich(ella, K, "ysolde", "zusammenlegen") && fertig(ella, K) && anzahl(ella, "reisekarte") === 1 && [1, 2, 3, 4, 5].every((i) => anzahl(ella, "kartenstueck_" + i) === 0),
      `Die Karte des Boten fertig: die fünf Stücke werden zur Reisekarte (${anzahl(ella, "reisekarte")})`);
  }
  await Promise.all([spielF1(), spielF2(), spielF4(), spielKarte()]);
} catch (e) { console.error(e); check(false, "Ausnahme: " + e.message); }
W.ende("Block F (Phase 9)");
