/*
 * Riftmere – Block I (Phase 12, Ockerlande): I1 „Die Karawanenstraße“, I2 „Wasser für Dornhag“ und I3 „Der Tafelberg“ Ende zu Ende: echter Spielserver (localhost:8868),
 * nachgebildete Supabase (localhost:8867), echte Welt. Ida spielt I1 (Ruben → Selma → Tarik → zwei Rastfeuer → drei Ockerhyänen → Wagen → Nadira in Rotlehm),
 * Bea zugleich I2 (Ayla in Sandquell, drei Lehmklumpen, Tränke mit dem Krug, vier Ziegen vom Akazienhain, Gatter), Cora I3 (Lore, zwei Sterneisen, Inschrift in der Höhle im Roten Tisch,
 * Hasim in den Glutsanden). Tom (ohne F1) ist die Gegenprobe. I4 „Die Ockermutter“ wartet als Entwurf auf ihren Gegner und ihren Bau.
 * Aufruf: node test/ockerlande-welt.test.mjs   (nach node build.mjs und python3 werkzeug/weltzonen.py)
 */
import { starte, starkerHeld, MYTHISCH, QUESTS } from "./questwelt.mjs";

const VOR = ["ostufer_das_gruene_licht", "glutsande_ende_des_grases"];
const W = await starte({ sb: 8867, srv: 8868, helden: { /* localhost:8867 · localhost:8868 */
  ida: starkerHeld({ fertig: VOR, angelegt: MYTHISCH }),
  bea: starkerHeld({ fertig: [...VOR, "ockerlande_die_karawanenstrasse"], berufe: { bergbau: 40 }, rucksack: ["krug"] }),
  cora: starkerHeld({ fertig: [...VOR, "ockerlande_die_karawanenstrasse", "glutsande_versandeter_tempel"], berufe: { bergbau: 60, handwerk: 30 }, rucksack: ["spitzhacke_episch"] }),
  tom: starkerHeld({ fertig: ["ostufer_das_gruene_licht"] }) } });
const { check, spieler, sprich, objekt, stand, erl, fertig, kampf, kampfBis, stelle, anzahl, schlaf, sammeln, sende } = W;
const Q = (id) => QUESTS.find((q) => q.id === id);
const I1 = Q("ockerlande_die_karawanenstrasse"), I2 = Q("ockerlande_wasser_fuer_dornhag"), I3 = Q("ockerlande_der_tafelberg"); /* I3: Entwurf, bis Integration die Sammelstellen der Ockerlande nach shared/ übernimmt */
/** ansprechen, während eine Kampfverbindung offen ist (der Server kennt Skills und Heldenlevel nur daher) */
async function mitHeld(s, q, npc, a) { const F = q.figuren.find((x) => x.id === npc), z = await kampf(s.name, F.x + 1, F.y); const ok = await sprich(s, q, npc, a); if (z) { z.ws.close(); await schlaf(2500); } return ok; }
/** Region wechseln (wie der Browser am Höhleneingang oder an einer Grenze) */
const ort = async (s, region, x, y) => { sende(s, { t: "ort", ort: region }); await schlaf(200); await stelle(s, x, y); await schlaf(300); };

try {
  const [ida, bea, cora, tom] = await Promise.all(["ida", "bea", "cora", "tom"].map((n) => spieler(n)));
  check(I1 && I2, "I1 und I2 sind im Spiel" + (I3 ? ", I3 auch" : " (I3 wartet als Entwurf)"));
  check(!(await mitHeld(tom, I1, "ruben", "annehmen")), "Tom (ohne „Ende des Grases“): Ruben bietet I1 nicht an");

  async function karawane() {
    console.log("I1 „Die Karawanenstraße“");
    check(await mitHeld(ida, I1, "ruben", "annehmen") && stand(ida, I1).phase === "laeuft", "Ida nimmt I1 bei Ruben Weit in Sandquell an (nach F1, Heldenlevel 45)");
    check(await sprich(ida, I1, "selma", "route_fragen") && erl(ida, I1, "selma"), "Quer: Selma Dornfeld in Glutbrunn kennt die Route");
    check(await sprich(ida, I1, "tarik", "karawane_fragen") && erl(ida, I1, "tarik"), "Brunnenwächter Tarik am Brunnenkreis");
    for (const i of [1, 2]) await objekt(ida, I1, "i1_rast_" + i);
    check(erl(ida, I1, "rast_1") && erl(ida, I1, "rast_2"), "Zwei Rastfeuer an der Karawanenstraße untersucht");
    { const [x, y] = I1.schritte.find((s) => s.id === "hyaenen").wo; const r = await kampfBis(ida, x, y, ["ockerhyaene"], () => erl(ida, I1, "hyaenen"), 240000);
      check(erl(ida, I1, "hyaenen"), `Drei Ockerhyänen am Wagen vertrieben (${r.siege} Siege${r.z ? "" : ", kein Kampfgebiet"})`); }
    await objekt(ida, I1, "i1_wagen"); check(erl(ida, I1, "wagen"), "Den zerbrochenen Wagen untersucht – die Spuren führen nach Rotlehm");
    check(await sprich(ida, I1, "nadira", "bericht") && fertig(ida, I1), "I1 fertig bei Karawanenmeisterin Nadira in Rotlehm, Lohn abgeholt");
  }
  async function brunnen() {
    console.log("I2 „Wasser für Dornhag“");
    check(await mitHeld(bea, I2, "malika", "annehmen") && stand(bea, I2).phase === "laeuft", "Bea nimmt I2 bei Hirtin Malika in Dornhag an (nach I1, Bergbau 30)");
    check(await sprich(bea, I2, "ayla", "rat_fragen") && erl(bea, I2, "ayla"), "Quer: Ayla Dünenruh in Sandquell weiß, wie man den Brunnen öffnet");
    for (const i of [1, 2, 3]) await objekt(bea, I2, "i2_lehm_" + i);
    check(["lehm_1", "lehm_2", "lehm_3"].every((x) => erl(bea, I2, x)), "Drei Lehmklumpen aus dem Brunnen gehackt");
    await objekt(bea, I2, "i2_traenke"); check(erl(bea, I2, "traenke") && anzahl(bea, "krug") === 0, "Die Tränke mit dem Krug gefüllt");
    for (const i of [1, 2, 3, 4]) await sprich(bea, I2, "dornhag_ziege_" + i, "locken");
    check(["ziege_1", "ziege_2", "ziege_3", "ziege_4"].every((x) => erl(bea, I2, x)), "Vier Ziegen vom Akazienhain zurückgelockt");
    await objekt(bea, I2, "i2_gatter"); check(erl(bea, I2, "gatter"), "Das Gatter in der Dornenhecke geschlossen");
    check(await sprich(bea, I2, "malika", "fertig") && fertig(bea, I2), "I2 fertig bei Malika, Lohn abgeholt");
  }
  async function tafelberg() {
    if (!I3) return; /* noch Entwurf */
    console.log("I3 „Der Tafelberg“");
    check(await mitHeld(cora, I3, "rahel", "annehmen") && stand(cora, I3).phase === "laeuft", "Cora nimmt I3 bei Steinbrecherin Rahel in Tafelrast an (nach I1 und F3)");
    await objekt(cora, I3, "i3_lore"); check(erl(cora, I3, "lore"), "Die Lore wieder aufs Gleis gesetzt (Handwerk 25)");
    check(await sammeln(cora, "berg", "steinbruch_am_roten_tisch_sterneisen_1", 7515.5, 7516.5, "erz_sterneisen", 2, 150000) && erl(cora, I3, "erz"), `Zwei Sterneisen im Steinbruch (${anzahl(cora, "erz_sterneisen")})`);
    await stelle(cora, 7552, 7588.5); await ort(cora, "ockerhoehle", 11943.5, 9613); /* durch den Spalt in der Südflanke */
    await objekt(cora, I3, "i3_inschrift"); check(erl(cora, I3, "inschrift"), "Die Inschrift in der Höhle im Roten Tisch abgeschrieben");
    await ort(cora, "fl_216_198", 7115.5, 6698);
    check(await sprich(cora, I3, "hasim", "lesen_lassen") && erl(cora, I3, "hasim"), "Quer: Hasim Tal liest die Inschrift – „die Mutter unter der Kanzel“");
    await ort(cora, "fl_231_225", 7490, 7521.5);
    check(await sprich(cora, I3, "rahel", "fertig") && fertig(cora, I3), "I3 fertig bei Rahel, Lohn abgeholt");
  }
  await Promise.all([karawane(), brunnen(), tafelberg()]);
} catch (e) { console.error(e); check(false, "Ausnahme: " + e.message); }
W.ende("Block I (I1–I3, Ockerlande)");
