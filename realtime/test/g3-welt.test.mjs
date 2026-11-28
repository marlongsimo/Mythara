/*
 * Riftmere – Quest G3 „Was das Wrack verschweigt“ (Wrackkapitän allein, danach wrackkapitaen_danach) Ende zu Ende: echter Spielserver (localhost:8830), nachgebildete Supabase (localhost:8829), Kampfwelt, Lohn mit „abholen“ (#77).
 * Block G ist geteilt (unter 400 s je Test): g12-welt (G1, G2), g3-welt (G3 bis zu den Zeugen), g3b-welt (G3: Wrackkapitän, Abgabe, danach), g4-welt. Tom ist die Gegenprobe.
 * Aufruf: node test/g3-welt.test.mjs   (nach node build.mjs und python3 werkzeug/weltzonen.py)
 */
import { starte, starkerHeld, QUESTS, QB } from "./questwelt.mjs";

const ida = starkerHeld({ fertig: ["obstwiesen_fallobst", "westmark_das_rote_banner", "weidenhain_der_wegstein", "kueste_die_suedstrasse"], berufe: { splitterbinden: 30, handwerk: 30, fischen: 30, kochen: 30 },
  rucksack: ["angelrute", "hammer", { g: "wurm", n: 60 }, { g: "garn", n: 6 }, { g: "seelenlicht", n: 2 }] });
/* Rüstung dazu: der Wrackkapitän (Stufe 40) schlägt einen Helden ohne Rüstung auch mit Level 99 einmal nieder */
ida.inventar.angelegt = { waffe: "ritterschwert", nebenhand: "sternenschild_legendaer", brust: "eisenwacht_legendaer", beine: "eisenbeinschienen_legendaer", kopf: "eisenwachthelm_legendaer" };
const tom = { ...starkerHeld(), quests: {} };
const W = await starte({ sb: 8829, srv: 8830, helden: { ida, tom } }); /* localhost:8829 · localhost:8830 */
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
  const I = await W.spieler("ida"), T = await W.spieler("tom");

  console.log("G3 „Was das Wrack verschweigt“");
  check(await annehmen(I, G3, "kranich"), "Ida nimmt G3 bei Kranich an (nach G1 und B4, Heldenlevel 35)");
  { const R = G3.schritte.find((x) => x.id === "raeuber_saebel").wo, fertigR = () => erl(I, G3, "raeuber_saebel") && erl(I, G3, "raeuber_armbrust");
    for (let runde = 0; runde < 4 && !fertigR(); runde++) await kampfBis(I, R[0] + 1, R[1], ["strandraeuber_saebel", "strandraeuber_armbrust"], () => fertigR(), 150000);
    check(fertigR(), "Vier Strandräuber im Wrack besiegt"); }
  await objekt(I, G3, "g3_kiste"); check(erl(I, G3, "kiste") && anzahl(I, "wrackkiste") === 1, "Die Kiste mit dem Rabensiegel aus dem Wrack");
  check(await sprich(I, G3, "bertold", "wrackkiste_bertold") && erl(I, G3, "bertold"), "Bertold Krähe hat die Kiste gesehen");
  check(await sprich(I, G3, "merit", "wrackkiste_merit") && erl(I, G3, "merit"), "Merit Stahl hat die Kiste gesehen");
  check(schalterAn(I, G3, "wrackkapitaen_kajuete") && !schalterAn(I, G3, "wrackkapitaen_danach"), "Während der Quest: Kajüte als Instanz (allein), noch nicht „danach“");
} catch (e) { console.error(e); check(false, "Ausnahme: " + e.message); }
W.ende("G3 (Smaragdküste, Teil 1)");
