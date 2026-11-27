/*
 * Riftmere – Quest F3 „Der versandete Tempel“, Teil 2: die Sandmutter allein in der Kammer (Instanz), Abgabe, danach sandmutter_danach. Echter Spielserver (localhost:8852), nachgebildete Supabase (localhost:8851), Kampfwelt im Tempel.
 * Block F ist geteilt (unter 400 s je Test): f-welt (F1, F2, F4, Karte), f3-welt (F3 bis zur Inschrift), f3b-welt (F3: Sandmutter, Abgabe, danach).
 * Aufruf: node test/f3b-welt.test.mjs   (nach node build.mjs und python3 werkzeug/weltzonen.py)
 */
import { starte, starkerHeld, standNach, QUESTS, QB } from "./questwelt.mjs";

const D2 = "ostufer_das_gruene_licht", E4 = "grauwacht_grab_des_hauptmanns";
/** mythische Ausrüstung: in den Glutsanden fallen ganze Lager über einen her (Level 40–55) */
const RUESTUNG = { waffe: "eidschwert_mythisch", brust: "eisenwacht_mythisch", beine: "eisenbeinschienen_mythisch", kopf: "eisenwachthelm_mythisch", nebenhand: "sternenschild_mythisch" };
const geruestet = (h) => { h.inventar.angelegt = { ...RUESTUNG }; return h; };
const F1_ID = "glutsande_ende_des_grases", F2_ID = "glutsande_salz_und_feuer", F3_ID = "glutsande_versandeter_tempel";
/* je Quest ein eigener Held mit den Voraussetzungen als „fertig“ – die Quests laufen gleichzeitig, ein langer Kampf hält die anderen nicht auf */
/* Stand: im Tempel, drei Glutgeister besiegt, die Spiegel gelöst, die Inschrift abgeschrieben */
const INSCHRIFT = standNach(QUESTS.find((q) => q.id === F3_ID), [{ art: "betreten", region: "tempel" }, ...Array(3).fill({ art: "erlegen", typ: "glutgeist" }), ...[1, 2, 3, 4].map((i) => ({ art: "objekt", id: "f3_spiegel_" + i })), { art: "objekt", id: "f3_inschrift" }]);
const W = await starte({ sb: 8851, srv: 8852, helden: { /* localhost:8851 · localhost:8852 */
  cora: geruestet(starkerHeld({ fertig: [D2, F1_ID], staende: { [F3_ID]: INSCHRIFT }, rucksack: ["tempelabschrift"] })) } });
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
  console.log("F3 „Der versandete Tempel“ (ab der Inschrift)");
  check(erl(cora, F3, "inschrift") && !erl(cora, F3, "sandmutter") && schalterAn(F3, cora, "sandmutter_kammer"), "Start: Inschrift abgeschrieben, die Kammer ist Coras Instanz");
  await stelle(cora, 7112, 6694.4); W.sende(cora, { t: "ort", ort: "tempel" }); await schlaf(300);
  { const [x, y] = F3.schritte.find((x) => x.id === "sandmutter").wo; await stelle(cora, x, y); const z = await kampf("cora", x, y);
    const sm = () => z && z.w.find((w) => w[2] === "sandmutter"); check(Boolean(sm()), "Die Sandmutter steht in Coras Kammer (Instanz)");
    const r = z ? await kaempfen(z, ["sandmutter", "sandkriecher"], () => erl(cora, F3, "sandmutter"), 300000) /* #155 */ : 0;
    check(erl(cora, F3, "sandmutter"), `Sandmutter besiegt, allein (${r} Siege, ${z ? z.ev.filter((e) => e.a === "ansage").length : 0} Ansagen)`); if (z) { z.ws.close(); await schlaf(2500); } }
  W.sende(cora, { t: "ort", ort: "fl_216_198" }); await schlaf(300);
  check(await sprich(cora, F3, "hasim", "abgeben") && fertig(cora, F3) && anzahl(cora, "tempelabschrift") === 0, "F3 fertig, Lohn abgeholt");
  check(schalterAn(F3, cora, "sandmutter_danach") && !schalterAn(F3, cora, "sandmutter_kammer") && schalterAn(F3, cora, "ureisen_tafelberge"), "Nach F3: sandmutter_danach an (stärkere Fassung öffentlich oder eigene Instanz), ureisen_tafelberge an");
} catch (e) { console.error(e); check(false, "Ausnahme: " + e.message); }
W.ende("F3 (Teil 2)");
