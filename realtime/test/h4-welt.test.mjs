/*
 * Riftmere – Quest H4 „Die Hüter der Hochlande“ (Phase 11, Boss-Quest) Ende zu Ende: echter Spielserver (localhost:8862), nachgebildete Supabase (localhost:8861), echte Kampfwelt.
 * Eine Quest, drei Stränge in freier Reihenfolge. Damit der Test unter 400 s bleibt, spielt je ein Held einen Strang zugleich (jeder hat H4 angenommen):
 *   Ida – Grumhold: Wendel zeigt den Weg, Grumhold allein in der Trollhalle (Instanz im Bergwerk), Splitterkern, Hedda (quer).
 *   Ella – Sturmschwinge: drei Sturmfedern am Steinmann-Pfad, die Sturmschwinge allein im Horst (Instanz horst_grauhorn), mit dem Bogen.
 *   Cora – Frostwitwe: Eisrunen am Höhlenmund, der Einsiedler deutet sie, die Frostwitwe allein in der Eishöhle (Instanz eishoehle_hochpass).
 *   Dora – alle drei Stränge erledigt (Stand aus den Ereignissen): Abgabe bei Hilde, danach die drei *_danach-Schalter, die Quest-Kammern zu.
 * Boss-Regel #116: vor der Quest ist die Kammer zu (Schalter aus), in der Quest offen, danach die starke Fassung. Lohn mit „abholen“.
 * Aufruf: node test/h4-welt.test.mjs   (nach node build.mjs und python3 werkzeug/weltzonen.py)
 */
import { starte, starkerHeld, standNach, MYTHISCH, QUESTS, QB } from "./questwelt.mjs";

const VOR = ["ostufer_das_gruene_licht", "grauwacht_der_weg", "grauwacht_die_glocke", "grauwacht_fahnenflucht", "grauwacht_grab_des_hauptmanns", "hochlande_ueber_den_pass", "hochlande_tiefer_als_erlaubt"];
const H4_ID = "hochlande_hueter_der_hochlande", H4Q = QUESTS.find((q) => q.id === H4_ID);
/* alle drei Stränge erledigt – der Reihe nach (Antworten und Ereignisse abwechselnd, wie im Spiel) */
const ant = (st, id) => QB.nachFolge(H4Q, st, { erledige: [id], zeilen: [] }), erg = (st, m) => QB.ereignis(H4Q, st, m);
let ALLES = ant(standNach(H4Q, []), "weg"); ALLES = erg(erg(ALLES, { art: "erlegen", typ: "grumhold" }), { art: "objekt", id: "h4_kern" }); ALLES = ant(ALLES, "hedda");
for (const i of [1, 2, 3]) ALLES = erg(ALLES, { art: "objekt", id: "h4_feder_" + i }); ALLES = erg(ALLES, { art: "erlegen", typ: "sturmschwinge" });
ALLES = ant(erg(ALLES, { art: "objekt", id: "h4_runen" }), "einsiedler"); ALLES = erg(ALLES, { art: "erlegen", typ: "frostwitwe" });
const held = (angelegt, mehr = {}) => starkerHeld({ fertig: VOR, angelegt, ...mehr });
const BOGEN = { ...MYTHISCH, waffe: "mondlangbogen_mythisch", nebenhand: undefined };
const W = await starte({ sb: 8861, srv: 8862, helden: { /* localhost:8861 · localhost:8862 */
  ida: held(MYTHISCH), ella: held(BOGEN), cora: held(MYTHISCH), dora: held(MYTHISCH, { staende: { [H4_ID]: ALLES } }), tom: starkerHeld({ fertig: VOR.slice(0, 6) }) } });
const { check, spieler, sprich, objekt, stand, erl, fertig, kampf, kaempfen, stelle, schlaf, sende } = W;
const H4 = H4Q;
const K0 = { hat: () => false, verloren: () => false };
const an = (s, id) => [].concat(H4.schalter[id]).some((b) => QB.gilt(H4, s.b[H4.id] || "", b, K0));
const fig = (id) => H4.figuren.find((x) => x.id === id);
/** ansprechen, während eine Kampfverbindung offen ist (der Server kennt das Heldenlevel nur daher) */
async function mitHeld(s, npc, a) { const F = fig(npc), z = await kampf(s.name, F.x + 1, F.y); const ok = await sprich(s, H4, npc, a); if (z) { z.ws.close(); await schlaf(2500); } return ok; }
/** Region wechseln (wie der Browser beim Eingang einer Kammer) */
const ort = async (s, region, x, y) => { sende(s, { t: "ort", ort: region }); await schlaf(200); await stelle(s, x, y); await schlaf(300); };
/** Bosskampf in der eigenen Kopie der Kammer */
async function boss(s, region, x, y, typ, helfer, schritt) {
  await ort(s, region, x, y); const z = await kampf(s.name, x, y); if (!z) return { da: false, siege: 0 };
  { const t0 = Date.now(); while (!z.w.some((w) => w[2] === typ) && Date.now() - t0 < 15000) await schlaf(300); }
  const da = z.w.some((w) => w[2] === typ), siege = await kaempfen(z, [typ, ...helfer], () => erl(s, H4, schritt), 330000);
  z.ws.close(); await schlaf(2500); return { da, siege }; }

try {
  const [ida, ella, cora, dora, tom] = await Promise.all(["ida", "ella", "cora", "dora", "tom"].map((n) => spieler(n)));
  check(Boolean(H4), "H4 ist im Spiel");
  check(!(await mitHeld(tom, "bergvoegtin", "annehmen")), "Tom (ohne H3): Hilde bietet H4 nicht an");
  for (const s of [ida, ella, cora]) await mitHeld(s, "bergvoegtin", "annehmen");
  check([ida, ella, cora].every((s) => stand(s, H4).phase === "laeuft"), "Ida, Ella und Cora nehmen H4 bei Hilde an (nach H1 und H3, Heldenlevel 55)");
  check(!an(ida, "grumhold_halle") && !an(ella, "sturmschwinge_horst") && !an(cora, "frostwitwe_hoehle"), "Vor den Vorbereitungen: alle drei Kammern zu");

  async function grumhold() {
    check(await sprich(ida, H4, "wendel", "weg_fragen") && erl(ida, H4, "weg") && an(ida, "grumhold_halle"), "Grumhold: Wendel zeigt den Weg – die Trollhalle steht offen (grumhold_halle)");
    await stelle(ida, 7128, 5808); const r = await boss(ida, "hochlande_bergwerk", 11607.5, 9620.5, "grumhold", ["felsbrocken_waechter"], "grumhold");
    check(r.da, "Grumhold steht in Idas Kopie der Trollhalle");
    check(erl(ida, H4, "grumhold") && !an(ida, "grumhold_halle"), `Grumhold besiegt, allein (${r.siege} Siege) – die Quest-Kammer ist zu`);
    await objekt(ida, H4, "h4_kern"); check(erl(ida, H4, "kern"), "Den Splitterkern in der Trollhalle gefunden");
    await ort(ida, "rabenmoor", 6290.4, 6677.4);
    check(await sprich(ida, H4, "hedda", "kern_zeigen") && erl(ida, H4, "hedda"), "Quer: Mutter Hedda erkennt den Splitterkern");
  }
  async function sturmschwinge() {
    for (const i of [1, 2, 3]) await objekt(ella, H4, "h4_feder_" + i);
    check([1, 2, 3].every((i) => erl(ella, H4, "feder_" + i)) && an(ella, "sturmschwinge_horst"), "Sturmschwinge: drei Sturmfedern am Pfad – der Horst steht offen (sturmschwinge_horst)");
    await stelle(ella, 7028.5, 5549.5); const r = await boss(ella, "horst_grauhorn", 11728.5, 9622.5, "sturmschwinge", [], "sturmschwinge");
    check(r.da, "Die Sturmschwinge kreist in Ellas Kopie des Horsts");
    check(erl(ella, H4, "sturmschwinge") && !an(ella, "sturmschwinge_horst"), `Die Sturmschwinge besiegt, allein, mit dem Bogen (${r.siege} Siege)`);
  }
  async function frostwitwe() {
    await objekt(cora, H4, "h4_runen"); check(erl(cora, H4, "runen"), "Frostwitwe: die Eisrunen am Höhlenmund abgeschrieben");
    check(!an(cora, "frostwitwe_hoehle"), "…die Eishöhle bleibt zu, bis der Einsiedler sie gedeutet hat");
    check(await sprich(cora, H4, "einsiedler", "runen_zeigen") && erl(cora, H4, "einsiedler") && an(cora, "frostwitwe_hoehle"), "Der Einsiedler deutet die Runen – die Eishöhle steht offen (frostwitwe_hoehle)");
    await stelle(cora, 6950.5, 5633.5); const r = await boss(cora, "eishoehle_hochpass", 11760.5, 9620.5, "frostwitwe", ["eissplitter_waechter"], "frostwitwe");
    check(r.da, "Die Frostwitwe steht in Coras Kopie der Eishöhle");
    check(erl(cora, H4, "frostwitwe") && !an(cora, "frostwitwe_hoehle"), `Die Frostwitwe besiegt, allein (${r.siege} Siege)`);
  }
  async function abgabe() {
    check(H4.schritte.every((x) => erl(dora, H4, x.id)) && !an(dora, "grumhold_danach"), "Dora: alle drei Hüter besiegt, noch nicht abgegeben – keine starke Fassung");
    check(await sprich(dora, H4, "bergvoegtin", "fertig") && fertig(dora, H4), "H4 fertig bei Hilde, Lohn abgeholt");
    check(["grumhold_danach", "sturmschwinge_danach", "frostwitwe_danach"].every((x) => an(dora, x)) && !["grumhold_halle", "sturmschwinge_horst", "frostwitwe_hoehle"].some((x) => an(dora, x)),
      "Danach: alle drei *_danach-Schalter an (starke Fassung), die Quest-Kammern zu");
  }
  await Promise.all([grumhold(), sturmschwinge(), frostwitwe(), abgabe()]);
  check([ida, ella, cora].every((s) => stand(s, H4).phase === "laeuft"), "Ida, Ella und Cora haben je nur einen Strang – ihre Quest läuft weiter (Reihenfolge frei)");
} catch (e) { console.error(e); check(false, "Ausnahme: " + e.message); }
W.ende("H4 „Die Hüter der Hochlande“");
