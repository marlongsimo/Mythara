/*
 * Riftmere – Quest G3 „Was das Wrack verschweigt“ Teil 2 (Wrackkapitän allein, Abgabe, danach wrackkapitaen_danach) Ende zu Ende: echter Spielserver (localhost:8840), nachgebildete Supabase (localhost:8839), Kampfwelt, Lohn mit „abholen“ (#77).
 * Block G ist geteilt (unter 400 s je Test): g12-welt (G1, G2), g3-welt (G3 bis zu den Zeugen), g3b-welt (G3: Wrackkapitän, Abgabe, danach), g4-welt. Tom ist die Gegenprobe.
 * Aufruf: node test/g3b-welt.test.mjs   (nach node build.mjs und python3 werkzeug/weltzonen.py)
 */
import { starte, starkerHeld, standNach, QUESTS, QB } from "./questwelt.mjs";
const G3Q = QUESTS.find((q) => q.id === "kueste_was_das_wrack_verschweigt");
/* Stand: Räuber besiegt, Kiste geöffnet, Bertold und Merit haben sie gesehen */
const ZEUGEN = standNach(G3Q, [...Array(2).fill({ art: "erlegen", typ: "strandraeuber_saebel" }), ...Array(2).fill({ art: "erlegen", typ: "strandraeuber_armbrust" }), { art: "objekt", id: "g3_kiste" }], ["bertold", "merit"]);

const ida = starkerHeld({ fertig: ["obstwiesen_fallobst", "westmark_das_rote_banner", "weidenhain_der_wegstein", "kueste_die_suedstrasse"], berufe: { splitterbinden: 30, handwerk: 30, fischen: 30, kochen: 30 },
  staende: { kueste_was_das_wrack_verschweigt: ZEUGEN }, rucksack: ["wrackkiste", "angelrute", "hammer", { g: "wurm", n: 60 }, { g: "garn", n: 6 }, { g: "seelenlicht", n: 2 }] });
/* Rüstung dazu: der Wrackkapitän (Stufe 40) schlägt einen Helden ohne Rüstung auch mit Level 99 einmal nieder */
ida.inventar.angelegt = { waffe: "ritterschwert", nebenhand: "sternenschild_legendaer", brust: "eisenwacht_legendaer", beine: "eisenbeinschienen_legendaer", kopf: "eisenwachthelm_legendaer" };
const tom = { ...starkerHeld(), quests: {} };
const W = await starte({ sb: 8839, srv: 8840, helden: { ida, tom } }); /* localhost:8839 · localhost:8840 */
const { check, schlaf, anzahl, stelle, sprich, objekt, stand, erl, fertig, kampf, kaempfen, kampfBis, herstellen, fischen, sende, warte } = W;
const Q = (id) => QUESTS.find((q) => q.id === id);
const G1 = Q("kueste_die_suedstrasse"), G2 = Q("kueste_das_leuchtfeuer"), G3 = Q("kueste_was_das_wrack_verschweigt"), G4 = Q("kueste_netze_fuer_die_moewenbucht");
const K0 = { hat: () => false, verloren: () => false, anzahl: () => 0 };
const schalterAn = (s, q, name) => [].concat(q.schalter[name]).some((b) => QB.gilt(q, s.b[q.id] || "", b, K0));
/** annehmen mit Kampfverbindung (Heldenlevel kennt der Server nur aus der Kampfwelt) */
async function annehmen(s, q, npc) { const F = q.figuren.find((x) => x.id === npc); await stelle(s, F.x + 1, F.y); const z = await kampf(s.name, F.x + 1, F.y);
  const ok = await sprich(s, q, npc, "annehmen"); if (z) { z.ws.close(); await schlaf(2500); } return ok && stand(s, q).phase === "laeuft"; }

try {
  check(G1 && G2 && G3 && G4, "G1–G4 sind im Spiel");
  const I = await W.spieler("ida");
  console.log("G3 „Was das Wrack verschweigt“ (Teil 2)");
  check(erl(I, G3, "bertold") && erl(I, G3, "merit") && !erl(I, G3, "kapitaen") && schalterAn(I, G3, "wrackkapitaen_kajuete"), "Start: die Zeugen haben die Kiste gesehen, die Kajüte ist Idas Instanz");
  { const P = G3.schritte.find((x) => x.id === "kapitaen").wo; await stelle(I, P[0], P[1] + 4); const z = await kampf("ida", P[0], P[1] + 4);
    const kap = () => z && z.w.find((w) => w[2] === "wrackkapitaen");
    { const t0 = Date.now(); while (z && !kap() && Date.now() - t0 < 15000) await schlaf(300); }
    check(Boolean(kap()), "Der Wrackkapitän steht in Idas Kajüte");
    const n = z ? await kaempfen(z, ["wrackkapitaen", "strandraeuber_saebel", "strandraeuber_armbrust"], () => erl(I, G3, "kapitaen"), 300000) : 0;
    check(erl(I, G3, "kapitaen"), `Den Wrackkapitän besiegt (${n} Siege, Ansagen ${z ? z.ev.filter((e) => e.a === "ansage").length : 0})`);
    await objekt(I, G3, "g3_logbuch"); check(erl(I, G3, "logbuch"), "Die Logbuchseite in der Kajüte gelesen");
    if (z) { z.ws.close(); await schlaf(2500); } }
  check(await sprich(I, G3, "kranich", "bericht") && fertig(I, G3), "G3 bei Kranich abgegeben, Lohn abgeholt");
  check(!schalterAn(I, G3, "wrackkapitaen_kajuete") && schalterAn(I, G3, "wrackkapitaen_danach"), "Nach der Quest: wrackkapitaen_danach an (stärkere Fassung öffentlich oder eigene Instanz)");

} catch (e) { console.error(e); check(false, "Ausnahme: " + e.message); }
W.ende("G3 (Smaragdküste, Teil 2)");
