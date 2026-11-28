/*
 * Riftmere – Pechtann im Westwald (#189): die zwei kleinen Aufgaben Ende zu Ende: echter Spielserver (localhost:8884), nachgebildete Supabase (localhost:8883), echte Welt.
 * Jo spielt „Drei Wildschweine für die Jägerin“ (Spuren am Jägerlager, drei Wildschweine im Westwald), Ida „Die verlorenen Harzeimer“ (Harzlichtung, Verfallene Pechhütte).
 * Beide nach E1, Lohn mit „abholen“; Tom (ohne E1) ist die Gegenprobe.
 * Aufruf: node test/pechtann-welt.test.mjs   (nach node build.mjs und python3 werkzeug/weltzonen.py)
 */
import { starte, starkerHeld, QUESTS } from "./questwelt.mjs";

const VOR = ["ostufer_das_gruene_licht", "grauwacht_der_weg"];
const W = await starte({ sb: 8883, srv: 8884, helden: { /* localhost:8883 · localhost:8884 */
  jo: starkerHeld({ fertig: VOR }), ida: starkerHeld({ fertig: VOR }), tom: starkerHeld({ fertig: VOR.slice(0, 1) }) } });
const { check, spieler, sprich, objekt, stand, erl, fertig, kampfBis } = W;
const Q = (id) => QUESTS.find((q) => q.id === id);
const SAU = Q("pechtann_drei_wildschweine"), EIMER = Q("pechtann_die_verlorenen_harzeimer");

try {
  const [jo, ida, tom] = await Promise.all(["jo", "ida", "tom"].map((n) => spieler(n)));
  if (!SAU || !EIMER) { console.log("(Pechtann-Aufgaben noch Entwurf – warten auf Pechtann im Westwald, c3103542)"); W.ende("Pechtann (Entwurf)"); }
  check(SAU && EIMER, "Die zwei Aufgaben von Pechtann sind im Spiel");
  check(!(await sprich(tom, SAU, "sigrun", "annehmen")), "Tom (ohne „Der Weg nach Grauwacht“): Sigrun bietet nichts an");

  async function wildschweine() {
    console.log("„Drei Wildschweine für die Jägerin“");
    check(await sprich(jo, SAU, "sigrun", "annehmen") && stand(jo, SAU).phase === "laeuft", "Jo nimmt die Quest bei der Jägerin Sigrun Fähr in Pechtann an");
    await objekt(jo, SAU, "pt_spuren"); check(erl(jo, SAU, "lager"), "Die Spuren am Jägerlager gelesen");
    const r = await kampfBis(jo, 6280, 6175, ["wildschwein"], () => erl(jo, SAU, "schweine"));
    check(erl(jo, SAU, "schweine"), `Drei Wildschweine im Westwald erlegt (${r.siege} Siege)`);
    check(await sprich(jo, SAU, "sigrun", "fertig") && fertig(jo, SAU), "Abgabe bei Sigrun, Lohn abgeholt");
  }
  async function harzeimer() {
    console.log("„Die verlorenen Harzeimer“");
    check(await sprich(ida, EIMER, "gerlach", "annehmen") && stand(ida, EIMER).phase === "laeuft", "Ida nimmt die Quest beim Pechsieder Gerlach Ruß an");
    await objekt(ida, EIMER, "pt_harzeimer"); check(!erl(ida, EIMER, "huette"), "Die Pechhütte erst nach der Harzlichtung");
    await objekt(ida, EIMER, "pt_lichtung"); check(erl(ida, EIMER, "lichtung"), "Umgestoßene Eimer an der Harzlichtung");
    await objekt(ida, EIMER, "pt_harzeimer"); check(erl(ida, EIMER, "huette"), "Die Harzeimer in der Verfallenen Pechhütte gefunden");
    check(await sprich(ida, EIMER, "gerlach", "fertig") && fertig(ida, EIMER), "Abgabe bei Gerlach, Lohn abgeholt");
  }
  await Promise.all([wildschweine(), harzeimer()]);
} catch (e) { console.error(e); check(false, "Ausnahme: " + e.message); }
W.ende("Pechtann (Wildschweine, Harzeimer)");
