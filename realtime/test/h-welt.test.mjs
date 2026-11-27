/*
 * Riftmere – Block H (Phase 11, Hochlande): H1 „Über den Pass“ und „Der Einsiedler vom Spiegelsee“ Ende zu Ende: echter Spielserver (localhost:8856),
 * nachgebildete Supabase (localhost:8855), echte Kampfwelt. Ida spielt H1 (Wigand → Merit → Odo → Hilde → Bergtrolle am Hochpass → Ansgar, Afra → Hilde),
 * Ella zugleich die Nebenquest (Kräuter, drei Steinmänner, Mira). Tom (ohne Block E) ist die Gegenprobe. Lohn mit „abholen“.
 * H2–H4 warten als Entwurf (shared/quest_entwuerfe.ts) auf Bausteine aus #118.
 * Aufruf: node test/h-welt.test.mjs   (nach node build.mjs und python3 werkzeug/weltzonen.py)
 */
import { starte, starkerHeld, QUESTS, QB } from "./questwelt.mjs";

const E = ["ostufer_das_gruene_licht", "grauwacht_der_weg", "grauwacht_die_glocke", "grauwacht_fahnenflucht", "grauwacht_grab_des_hauptmanns"];
const RUESTUNG = { waffe: "eidschwert_mythisch", brust: "eisenwacht_mythisch", beine: "eisenbeinschienen_mythisch", kopf: "eisenwachthelm_mythisch", nebenhand: "sternenschild_mythisch" };
const geruestet = (h) => { h.inventar.angelegt = { ...RUESTUNG }; return h; };
const viel = (g, n) => Array.from({ length: n }, () => g);
const W = await starte({ sb: 8855, srv: 8856, helden: { /* localhost:8855 · localhost:8856 */
  ida: geruestet(starkerHeld({ fertig: E })),
  ella: starkerHeld({ fertig: [...E, "hochlande_ueber_den_pass"], berufe: { kraeuterkunde: 40 }, rucksack: [...viel("eisenhut", 3), ...viel("nebelkraut", 3)] }),
  tom: starkerHeld({ fertig: ["ostufer_das_gruene_licht"] }) } });
const { check, spieler, sprich, objekt, stand, erl, fertig, kampf, kampfBis, stelle, anzahl, schlaf } = W;
const Q = (id) => QUESTS.find((q) => q.id === id);
const H1 = Q("hochlande_ueber_den_pass"), HE = Q("hochlande_der_einsiedler");
const K0 = { hat: () => false, verloren: () => false };
const an = (q, s, id) => [].concat(q.schalter[id]).some((b) => QB.gilt(q, s.b[q.id] || "", b, K0));
const fig = (q, id) => q.figuren.find((x) => x.id === id);
/** ansprechen, während eine Kampfverbindung offen ist (der Server kennt das Heldenlevel nur daher) */
async function mitHeld(s, q, npc, a) { const F = fig(q, npc), z = await kampf(s.name, F.x + 1, F.y); const ok = await sprich(s, q, npc, a); if (z) { z.ws.close(); await schlaf(2500); } return ok; }

try {
  const [ida, ella, tom] = await Promise.all(["ida", "ella", "tom"].map((n) => spieler(n)));
  check(H1 && HE, "H1 und „Der Einsiedler vom Spiegelsee“ sind im Spiel");

  async function spielH1() {
    console.log("H1 „Über den Pass“");
    check(!(await mitHeld(tom, H1, "wigand", "annehmen")), "Tom (ohne Block E): Wigand bietet H1 nicht an");
    check(await mitHeld(ida, H1, "wigand", "annehmen") && stand(ida, H1).phase === "laeuft", "Ida nimmt H1 bei Wigand Fels an (nach E4, Heldenlevel 45)");
    check(await sprich(ida, H1, "merit", "erz_fragen") && erl(ida, H1, "merit"), "Quer: Merit Stahl in Graufurt wartet auf das Sterneisen");
    check(await sprich(ida, H1, "furtwache", "weg_fragen") && erl(ida, H1, "furtwache"), "Wache Odo an der Brücke zur Furt");
    check(await sprich(ida, H1, "bergvoegtin", "wagen_fragen") && erl(ida, H1, "bergvoegtin"), "Hilde Erzgrund in Steinhag: die Trolle am Pass");
    { const [x, y] = H1.schritte.find((s) => s.id === "trolle").wo; const r = await kampfBis(ida, x, y, ["bergtroll"], () => erl(ida, H1, "trolle"), 300000);
      check(erl(ida, H1, "trolle"), `Zwei Bergtrolle am Hochpass besiegt (${r.siege} Siege${r.z ? "" : ", kein Kampfgebiet"})`); }
    check(await sprich(ida, H1, "ansgar", "pass_frei") && erl(ida, H1, "ansgar"), "Wächter Ansgar an der Passwacht weiß Bescheid");
    check(await sprich(ida, H1, "afra", "wagen_sagen") && erl(ida, H1, "afra"), "Sennerin Afra auf der Hohen Alm weiß Bescheid");
    check(await sprich(ida, H1, "bergvoegtin", "fertig") && fertig(ida, H1), "H1 fertig bei Hilde, Lohn abgeholt");
    check(an(H1, ida, "erzwagen_steinhag") && !an(H1, tom, "erzwagen_steinhag"), "Schalter erzwagen_steinhag: bei Ida an, bei Tom aus");
  }
  async function spielEinsiedler() {
    console.log("„Der Einsiedler vom Spiegelsee“");
    check(await mitHeld(ella, HE, "einsiedler", "annehmen") && stand(ella, HE).phase === "laeuft", "Ella nimmt die Nebenquest beim Einsiedler an (nach H1, Kräuterkunde 35)");
    check(await sprich(ella, HE, "einsiedler", "kraeuter_geben") && erl(ella, HE, "kraeuter") && anzahl(ella, "eisenhut") === 0 && anzahl(ella, "nebelkraut") === 0, "Drei Eisenhut und drei Nebelkraut gebracht");
    for (const i of [1, 2, 3]) await objekt(ella, HE, "he_stein_" + i);
    check(["stein_1", "stein_2", "stein_3"].every((x) => erl(ella, HE, x)), "Drei Steinmänner am Grauhorn gelesen");
    check(await sprich(ella, HE, "mira", "gruss") && erl(ella, HE, "mira"), "Quer: Mira Kräuterlieb in der Waldmark");
    check(await sprich(ella, HE, "einsiedler", "fertig") && fertig(ella, HE) && an(HE, ella, "kessel_spiegelsee"), "Nebenquest fertig, Lohn abgeholt; kessel_spiegelsee an");
  }
  await Promise.all([spielH1(), spielEinsiedler()]);
} catch (e) { console.error(e); check(false, "Ausnahme: " + e.message); }
W.ende("Block H (H1, Einsiedler)");
