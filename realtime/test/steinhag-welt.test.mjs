/*
 * Riftmere – Hauptstadt Steinhag (#167): die drei kleinen Stadt-Quests Ende zu Ende: echter Spielserver (localhost:8864), nachgebildete Supabase (localhost:8863), echte Welt.
 * Jo spielt „Der Dieb vom Bergmarkt“ (drei Spuren, Fenn am Fischerhaus, quer Merit in Graufurt), Ida „Die Burgwache“ (vier Ecktürme, Kuno wecken, quer Wigand in Grauwacht),
 * Bea „Eintopf für die Kumpel“ (zwei Bauerneintöpfe am Herd der Taverne, Zunftwache am Stollen, Steiger Wendel). Alle nach H1, Lohn mit „abholen“; Tom (ohne H1) ist die Gegenprobe.
 * Aufruf: node test/steinhag-welt.test.mjs   (nach node build.mjs und python3 werkzeug/weltzonen.py)
 */
import { starte, starkerHeld, QUESTS } from "./questwelt.mjs";

const VOR = ["ostufer_das_gruene_licht", "grauwacht_der_weg", "grauwacht_die_glocke", "grauwacht_fahnenflucht", "grauwacht_grab_des_hauptmanns", "hochlande_ueber_den_pass"];
const viel = (g, n) => Array.from({ length: n }, () => g);
const W = await starte({ sb: 8863, srv: 8864, helden: { /* localhost:8863 · localhost:8864 */
  jo: starkerHeld({ fertig: VOR }), ida: starkerHeld({ fertig: VOR }),
  bea: starkerHeld({ fertig: VOR, berufe: { kochen: 90 }, rucksack: [...viel("kuhfleisch", 4), ...viel("mehl", 4), ...viel("krug_wasser", 4)] }),
  tom: starkerHeld({ fertig: VOR.slice(0, 5) }) } });
const { check, spieler, sprich, objekt, stand, erl, fertig, kampf, anzahl, schlaf, herstellen } = W;
const Q = (id) => QUESTS.find((q) => q.id === id);
const DIEB = Q("steinhag_dieb_vom_bergmarkt"), WACHE = Q("steinhag_die_burgwache"), TOPF = Q("steinhag_eintopf_fuer_die_kumpel");
/** ansprechen, während eine Kampfverbindung offen ist (der Server kennt Skills und Heldenlevel nur daher) */
async function mitHeld(s, q, npc, a) { const F = q.figuren.find((x) => x.id === npc), z = await kampf(s.name, F.x + 1, F.y); const ok = await sprich(s, q, npc, a); if (z) { z.ws.close(); await schlaf(2500); } return ok; }

try {
  const [jo, ida, bea, tom] = await Promise.all(["jo", "ida", "bea", "tom"].map((n) => spieler(n)));
  check(DIEB && WACHE && TOPF, "Die drei Stadt-Quests von Steinhag sind im Spiel");
  check(!(await sprich(tom, DIEB, "jakob", "annehmen")), "Tom (ohne „Über den Pass“): Jakob bietet nichts an");

  async function dieb() {
    console.log("„Der Dieb vom Bergmarkt“");
    check(await sprich(jo, DIEB, "jakob", "annehmen") && stand(jo, DIEB).phase === "laeuft", "Jo nimmt die Quest bei Jakob Kiesel am Bergmarkt an");
    await objekt(jo, DIEB, "sd_spur_2"); check(!erl(jo, DIEB, "spur_2"), "Die Spuren nur der Reihe nach");
    for (const i of [1, 2, 3]) await objekt(jo, DIEB, "sd_spur_" + i);
    check(["spur_1", "spur_2", "spur_3"].every((x) => erl(jo, DIEB, x)), "Drei Spuren vom Stand hinunter zu den Fischerhäusern");
    check(await sprich(jo, DIEB, "fenn", "stellen") && erl(jo, DIEB, "fenn"), "Fenn, der Fischerjunge, gesteht");
    check(await sprich(jo, DIEB, "merit", "lehre_fragen") && erl(jo, DIEB, "merit"), "Quer: Merit Stahl in Graufurt nimmt Fenn im Frühjahr als Lehrling");
    check(await sprich(jo, DIEB, "jakob", "fertig") && fertig(jo, DIEB), "Abgabe bei Jakob, Lohn abgeholt");
  }
  async function burgwache() {
    console.log("„Die Burgwache“");
    check(await sprich(ida, WACHE, "ragnhild", "annehmen") && stand(ida, WACHE).phase === "laeuft", "Ida nimmt die Quest bei Hauptfrau Ragnhild auf dem Burgplatz an");
    for (const i of [1, 2, 3, 4]) await objekt(ida, WACHE, "bw_posten_" + i);
    check(["posten_1", "posten_2", "posten_3", "posten_4"].every((x) => erl(ida, WACHE, x)), "Vier Ecktürme der Ringmauer abgegangen");
    check(await sprich(ida, WACHE, "wachmann_kuno", "wecken") && erl(ida, WACHE, "kuno"), "Wachmann Kuno an der Südostecke geweckt");
    check(await sprich(ida, WACHE, "wigand", "bericht_steinhag") && erl(ida, WACHE, "wigand"), "Quer: Wigand Fels in Grauwacht hat den Wachbericht");
    check(await sprich(ida, WACHE, "ragnhild", "fertig") && fertig(ida, WACHE), "Abgabe bei Ragnhild, Lohn abgeholt");
  }
  async function eintopf() {
    console.log("„Eintopf für die Kumpel“");
    check(await mitHeld(bea, TOPF, "ruprecht", "annehmen") && stand(bea, TOPF).phase === "laeuft", "Bea nimmt die Quest bei Wirt Ruprecht Talg an (Kochen 25)");
    { let r = "ok"; for (let i = 0; i < 4 && r === "ok" && !erl(bea, TOPF, "kochen"); i++) r = await herstellen(bea, 7008.2, 5874 + 1.2, "bauerneintopf"); /* Herd der Taverne (herd_steinhag) */
      check(erl(bea, TOPF, "kochen") && anzahl(bea, "bauerneintopf") >= 2, `Zwei Bauerneintöpfe am Herd der Taverne (${r}, ${anzahl(bea, "bauerneintopf")})`); }
    check(await sprich(bea, TOPF, "zunftwache", "eintopf_bodo") && erl(bea, TOPF, "zunft"), "Zunftwächter Bodo am Stollen bekommt seinen Eintopf");
    check(await sprich(bea, TOPF, "wendel", "eintopf_wendel") && erl(bea, TOPF, "wendel"), "Steiger Wendel am Erzberg bekommt seinen Eintopf");
    check(await sprich(bea, TOPF, "ruprecht", "fertig") && fertig(bea, TOPF) && anzahl(bea, "bauerneintopf") >= 2, "Abgabe bei Ruprecht, Lohn abgeholt (zwei Eintöpfe)");
  }
  await Promise.all([dieb(), burgwache(), eintopf()]);
} catch (e) { console.error(e); check(false, "Ausnahme: " + e.message); }
W.ende("Steinhag-Stadtquests (#167)");
