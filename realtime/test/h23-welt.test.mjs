/*
 * Riftmere – Block H (Phase 11, Hochlande): H2 „Käse für die Passwacht“ und H3 „Tiefer als erlaubt“ Ende zu Ende: echter Spielserver (localhost:8860),
 * nachgebildete Supabase (localhost:8859), echte Welt. Bea spielt H2 (vier Ziegen folgen, Gatter, melken, Mettes Kniff, Almkäse am Herd der Alm, Käse zu Brun),
 * Jo zugleich H3 (Grubenholz an der Werkbank, drei Stempel im Bergwerk, Geröll, drei Verschüttete mit Heiltränken, Erzprobe zu Hedda; danach urkammer_offen).
 * Lohn mit „abholen“. Aufruf: node test/h23-welt.test.mjs   (nach node build.mjs und python3 werkzeug/weltzonen.py)
 */
import { starte, starkerHeld, QUESTS, QB } from "./questwelt.mjs";

const VOR = ["ostufer_das_gruene_licht", "grauwacht_der_weg", "grauwacht_die_glocke", "grauwacht_fahnenflucht", "grauwacht_grab_des_hauptmanns", "hochlande_ueber_den_pass"];
const viel = (g, n) => Array.from({ length: n }, () => g);
const W = await starte({ sb: 8859, srv: 8860, helden: { /* localhost:8859 · localhost:8860 */
  bea: starkerHeld({ fertig: VOR, berufe: { kochen: 90 } }), /* Kochen 90: der Almkäse (Stufe 40) verbrennt dann kaum */
  jo: starkerHeld({ fertig: VOR, berufe: { bergbau: 55, handwerk: 45 }, rucksack: ["hammer", ...viel("stamm_kernbaum", 2), ...viel("heiltrank", 3)] }) } });
const { check, spieler, sprich, objekt, stand, erl, fertig, kampf, stelle, anzahl, schlaf, herstellen, sende } = W;
const Q = (id) => QUESTS.find((q) => q.id === id);
const H2 = Q("hochlande_kaese_fuer_die_passwacht"), H3 = Q("hochlande_tiefer_als_erlaubt");
const K0 = { hat: () => false, verloren: () => false };
const an = (q, s, id) => [].concat(q.schalter[id]).some((b) => QB.gilt(q, s.b[q.id] || "", b, K0));
const fig = (q, id) => q.figuren.find((x) => x.id === id);
/** ansprechen, während eine Kampfverbindung offen ist (der Server kennt Heldenlevel und Skills nur daher) */
async function mitHeld(s, q, npc, a) { const F = fig(q, npc), z = await kampf(s.name, F.x + 1, F.y); const ok = await sprich(s, q, npc, a); if (z) { z.ws.close(); await schlaf(2500); } return ok; }
/** Region wechseln (wie der Browser beim Laufen über eine Grenze oder durch den Stolleneingang) */
const ort = async (s, region, x, y) => { sende(s, { t: "ort", ort: region }); await schlaf(200); await stelle(s, x, y); await schlaf(300); };

try {
  const [bea, jo] = await Promise.all(["bea", "jo"].map((n) => spieler(n)));
  check(H2 && H3, "H2 und H3 sind im Spiel");

  async function spielH2() {
    console.log("H2 „Käse für die Passwacht“");
    check(await mitHeld(bea, H2, "afra", "annehmen") && stand(bea, H2).phase === "laeuft", "Bea nimmt H2 bei Sennerin Afra an (nach H1, Kochen 40)");
    for (const id of ["ziege_1", "ziege_2", "ziege_3", "ziege_4"]) await sprich(bea, H2, id, "locken");
    check(["ziege_1", "ziege_2", "ziege_3", "ziege_4"].every((x) => erl(bea, H2, x)), "Vier Ziegen gelockt (sie folgen)");
    await objekt(bea, H2, "h2_gatter"); check(erl(bea, H2, "gatter"), "Gatter am Pferch geschlossen");
    await objekt(bea, H2, "h2_melken"); check(erl(bea, H2, "melken") && anzahl(bea, "ziegenmilch") === 3, `Gemolken: drei Krüge Ziegenmilch (${anzahl(bea, "ziegenmilch")})`);
    check(await sprich(bea, H2, "mette", "lab_holen") && erl(bea, H2, "lab"), "Quer: Mette Heider in Heidrast verrät ihren Käse-Kniff");
    { let r = await herstellen(bea, 7178 + 1.2, 6007.4, "kaeserad");
      if (!erl(bea, H2, "kaese")) { await sprich(bea, H2, "afra", "milch_neu"); r = await herstellen(bea, 7178 + 1.2, 6007.4, "kaeserad"); } /* verdorben: Afra gibt neue Milch */
      check(r === "ok" && erl(bea, H2, "kaese") && anzahl(bea, "kaeserad") === 1, `Almkäse am Herd der Alm (${r}, Käse ${anzahl(bea, "kaeserad")})`); }
    check(await sprich(bea, H2, "brun", "kaese_geben") && erl(bea, H2, "brun") && anzahl(bea, "kaeserad") === 0, "Wächterin Brun an der Passwacht nimmt den Käse");
    check(await sprich(bea, H2, "afra", "fertig") && fertig(bea, H2) && an(H2, bea, "afra_laden"), "H2 fertig bei Afra, Lohn abgeholt; afra_laden an");
  }
  async function spielH3() {
    console.log("H3 „Tiefer als erlaubt“");
    check(await mitHeld(jo, H3, "wendel", "annehmen") && stand(jo, H3).phase === "laeuft", "Jo nimmt H3 bei Steiger Wendel an (nach H1, Bergbau 50, Handwerk 40)");
    { let r = "ok"; for (let i = 0; i < 3 && r === "ok" && anzahl(jo, "grubenholz") < 3; i++) r = await herstellen(jo, 6310.7, 6703.5, "grubenholz"); /* Werkbank im Rabenmoor (neben Harm) */
      check(anzahl(jo, "grubenholz") >= 3, `Grubenholz an der Werkbank (${r}, ${anzahl(jo, "grubenholz")})`); }
    await stelle(jo, 7128, 5808); await ort(jo, "hochlande_bergwerk", 11607.5, 9628); /* durch den Stolleneingang am Erzberg */
    for (const i of [1, 2, 3]) await objekt(jo, H3, "h3_stempel_" + i);
    check(["stempel_1", "stempel_2", "stempel_3"].every((x) => erl(jo, H3, x)) && anzahl(jo, "grubenholz") <= 1, "Drei morsche Stempel durch Grubenholz ersetzt");
    await objekt(jo, H3, "h3_geroell"); check(erl(jo, H3, "geroell"), "Das Geröll vor dem tiefen Stollen weggeräumt (Bergbau 50)");
    for (const id of ["jost", "marthe", "pit"]) await sprich(jo, H3, id, "versorgen");
    check(["jost", "marthe", "pit"].every((x) => erl(jo, H3, x)) && anzahl(jo, "heiltrank") === 0, "Drei Verschüttete mit Heiltränken versorgt");
    await objekt(jo, H3, "h3_ader"); check(erl(jo, H3, "probe") && anzahl(jo, "erzprobe_splitterlicht") === 1, "Erzprobe mit Splitterlicht an der Bruchstelle");
    await ort(jo, "rabenmoor", 6290.4, 6677.4);
    check(await sprich(jo, H3, "hedda", "probe_zeigen") && erl(jo, H3, "hedda") && anzahl(jo, "erzprobe_splitterlicht") === 0, "Quer: Mutter Hedda erkennt das Splitterlicht");
    await ort(jo, "fl_216_169", 7125, 5811);
    check(!an(H3, jo, "urkammer_offen"), "Vor der Abgabe: die Urkammer ist zu");
    check(await sprich(jo, H3, "wendel", "fertig") && fertig(jo, H3) && an(H3, jo, "urkammer_offen"), "H3 fertig bei Wendel, Lohn abgeholt; urkammer_offen an");
  }
  await Promise.all([spielH2(), spielH3()]);
} catch (e) { console.error(e); check(false, "Ausnahme: " + e.message); }
W.ende("Block H (H2, H3)");
