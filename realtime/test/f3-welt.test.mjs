/*
 * Riftmere – Quest F3 „Der versandete Tempel“, Teil 1: Annahme, Abstieg, Glutgeister, Spiegelplatten, Inschrift. Echter Spielserver (localhost:8850), nachgebildete Supabase (localhost:8849), Kampfwelt im Tempel.
 * Block F ist geteilt (unter 400 s je Test): f-welt (F1, F2, F4, Karte), f3-welt (F3 bis zur Inschrift), f3b-welt (F3: Sandmutter, Abgabe, danach).
 * Aufruf: node test/f3-welt.test.mjs   (nach node build.mjs und python3 werkzeug/weltzonen.py)
 */
import { starte, starkerHeld, QUESTS, QB } from "./questwelt.mjs";

const D2 = "ostufer_das_gruene_licht", E4 = "grauwacht_grab_des_hauptmanns";
/** mythische Ausrüstung: in den Glutsanden fallen ganze Lager über einen her (Level 40–55) */
const RUESTUNG = { waffe: "eidschwert_mythisch", brust: "eisenwacht_mythisch", beine: "eisenbeinschienen_mythisch", kopf: "eisenwachthelm_mythisch", nebenhand: "sternenschild_mythisch" };
const geruestet = (h) => { h.inventar.angelegt = { ...RUESTUNG }; return h; };
const F1_ID = "glutsande_ende_des_grases", F2_ID = "glutsande_salz_und_feuer", F3_ID = "glutsande_versandeter_tempel";
/* je Quest ein eigener Held mit den Voraussetzungen als „fertig“ – die Quests laufen gleichzeitig, ein langer Kampf hält die anderen nicht auf */
const W = await starte({ sb: 8849, srv: 8850, helden: { /* localhost:8849 · localhost:8850 */
  cora: geruestet(starkerHeld({ fertig: [D2, F1_ID] })) } });
const { check, spieler, sprich, objekt, stand, erl, fertig, kampf, kaempfen, kampfBis, stelle, herstellen, fischen, anzahl, schlaf, rede } = W;
const Q = (id) => QUESTS.find((q) => q.id === id);
const F1 = Q("glutsande_ende_des_grases"), F2 = Q("glutsande_salz_und_feuer"), F3 = Q("glutsande_versandeter_tempel"), F4 = Q("glutsande_der_strom_traegt"), K = Q("festland_karte_des_boten");
const K0 = { hat: () => false, verloren: () => false };
const schalterAn = (q, s, id) => [].concat(q.schalter[id]).some((b) => QB.gilt(q, s.b[q.id] || "", b, K0));
const fig = (q, id) => q.figuren.find((x) => x.id === id);
/** ansprechen, während eine Kampfverbindung offen ist (der Server kennt das Heldenlevel nur daher) */
async function mitHeld(s, q, npc, a) { const F = fig(q, npc), z = await kampf(s.name, F.x + 1, F.y); const ok = await sprich(s, q, npc, a); if (z) { z.ws.close(); await schlaf(2500); } return ok; }

try {
  const cora = await spieler("cora");
  check(F3 && K, "F3 ist im Spiel");
  console.log("F3 „Der versandete Tempel“");
  check(await mitHeld(cora, F3, "hasim", "annehmen") && stand(cora, F3).phase === "laeuft", "Cora nimmt F3 an (Defense 50)");
  check(!schalterAn(F3, cora, "sandmutter_danach") && schalterAn(F3, cora, "sandmutter_kammer"), "Während F3: Kammer als Instanz (sandmutter_kammer), noch nicht „danach“");
  /* durchs Tor hinab: der Browser meldet den Regionswechsel ({ t: "ort" }), dann die Stelle */
  await stelle(cora, 7112, 6694.4); W.sende(cora, { t: "ort", ort: "tempel" }); await schlaf(300); await stelle(cora, 11312, 9660); await schlaf(800);
  check(erl(cora, F3, "abstieg"), "In den Tempel hinabgestiegen (Region tempel)");
  { const [x, y] = F3.schritte.find((x) => x.id === "geister").wo; const r = await kampfBis(cora, x, y, ["glutgeist"], () => erl(cora, F3, "geister"), 300000); /* Glutgeister flackern – lange (#155) */
    check(erl(cora, F3, "geister"), `Drei Glutgeister besiegt (${r.siege} Siege)`); }
  { const t = await objekt(cora, F3, "f3_spiegel_2"); check(!erl(cora, F3, "spiegel_2"), "Falsche Reihenfolge: die zweite Platte zerstreut das Licht (" + t.slice(0, 40) + ")"); }
  for (let i = 1; i <= 4; i++) await objekt(cora, F3, "f3_spiegel_" + i);
  check([1, 2, 3, 4].every((i) => erl(cora, F3, "spiegel_" + i)), "Vier Spiegelplatten in der richtigen Reihenfolge");
  await objekt(cora, F3, "f3_inschrift"); check(erl(cora, F3, "inschrift") && anzahl(cora, "tempelabschrift") === 1, "Inschrift abgeschrieben");
} catch (e) { console.error(e); check(false, "Ausnahme: " + e.message); }
W.ende("F3 (Teil 1)");
