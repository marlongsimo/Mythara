/*
 * Riftmere – Hauptstadt Kielmund (#174): die vier kleinen Stadt-Quests Ende zu Ende: echter Spielserver (localhost:8866), nachgebildete Supabase (localhost:8865), echte Welt.
 * Zugleich: Ida „Lichter im Nebel“ (Kisten, Wiebke am Leuchtfeuer, drei Lichtzeichen, Strandräuber am Wrack, Liste, Kranich), Bea „Kiel auf Stapel“ (Segeltuch, Eisen,
 * Eiche von Hofwächter Jost in Erlengrund, Stapellauf), Cora „Suppe für die Altstadt“ (Mühlbarsche vom Fischmarkt, Heringe am Kai, Bente in der Möwenbucht, Fischsuppe,
 * Räucherheringe, Speisung am Tempel), Dora „Der Brief des Ratsherrn“ (vier Viertel). Alle nach G1, Lohn mit „abholen“; Tom (ohne G1) ist die Gegenprobe.
 * Aufruf: node test/kielmund-welt.test.mjs   (nach node build.mjs und python3 werkzeug/weltzonen.py)
 */
import { starte, starkerHeld, MYTHISCH, QUESTS } from "./questwelt.mjs";

const VOR = ["die_gesperrte_strasse", "kueste_die_suedstrasse"];
const viel = (g, n) => Array.from({ length: n }, () => g);
const W = await starte({ sb: 8865, srv: 8866, helden: { /* localhost:8865 · localhost:8866 */
  ida: starkerHeld({ fertig: VOR, angelegt: MYTHISCH }),
  bea: starkerHeld({ fertig: VOR, berufe: { handwerk: 30, schmieden: 30 }, rucksack: ["hammer", ...viel("garn", 4), ...viel("erz_eisen", 4), ...viel("stamm_tanne", 2)] }),
  cora: starkerHeld({ fertig: VOR, berufe: { fischen: 40, kochen: 99 }, rucksack: ["angelrute", { g: "wurm", n: 40 }, ...viel("garn", 4), ...viel("krug_wasser", 2)] }),
  dora: starkerHeld({ fertig: VOR }),
  tom: starkerHeld({}) } });
const { check, spieler, sprich, objekt, stand, erl, fertig, kampf, kampfBis, anzahl, schlaf, herstellen, fischen, stelle } = W;
const Q = (id) => QUESTS.find((q) => q.id === id);
const LI = Q("kielmund_lichter_im_nebel"), KIEL = Q("kielmund_kiel_auf_stapel"), SUPPE = Q("kielmund_suppe_fuer_die_altstadt"), BRIEF = Q("kielmund_brief_des_ratsherrn");
/** ansprechen, während eine Kampfverbindung offen ist (der Server kennt Skills und Heldenlevel nur daher) */
async function mitHeld(s, q, npc, a) { const F = q.figuren.find((x) => x.id === npc), z = await kampf(s.name, F.x + 1, F.y); const ok = await sprich(s, q, npc, a); if (z) { z.ws.close(); await schlaf(2500); } return ok; }
/** ein Rezept so oft herstellen, bis der Schritt erledigt ist (verbrannt zählt nicht) */
async function bis(s, q, schritt, x, y, rezept, n = 6) { let r = "ok"; for (let i = 0; i < n && r === "ok" && !erl(s, q, schritt); i++) r = await herstellen(s, x, y, rezept); return r; }

try {
  const [ida, bea, cora, dora, tom] = await Promise.all(["ida", "bea", "cora", "dora", "tom"].map((n) => spieler(n)));
  check(LI && KIEL && SUPPE && BRIEF, "Die vier Stadt-Quests von Kielmund sind im Spiel");
  check(!(await sprich(tom, BRIEF, "edzard", "annehmen")), "Tom (ohne „Die Südstraße“): der Ratsherr bietet nichts an");

  async function lichter() {
    console.log("„Lichter im Nebel“");
    check(await sprich(ida, LI, "ilka", "annehmen") && stand(ida, LI).phase === "laeuft", "Ida nimmt die Quest bei Hafenmeisterin Ilka Brandt am Kai an");
    await objekt(ida, LI, "kl_kisten"); check(erl(ida, LI, "kisten"), "Die Kisten ohne Siegel untersucht");
    check(await sprich(ida, LI, "wiebke", "lichter_fragen") && erl(ida, LI, "wiebke"), "Quer: Wiebke Strand am Leuchtfeuer hat die falschen Lichter gesehen");
    for (const i of [1, 2, 3]) await objekt(ida, LI, "kl_licht_" + i);
    check(["licht_1", "licht_2", "licht_3"].every((x) => erl(ida, LI, x)), "Drei falsche Lichtzeichen an der Küste gefunden");
    { const [x, y] = LI.schritte.find((s) => s.id === "raeuber").wo; const r = await kampfBis(ida, x, y, ["strandraeuber_saebel", "strandraeuber_armbrust"], () => erl(ida, LI, "raeuber"), 240000);
      check(erl(ida, LI, "raeuber"), `Zwei Strandräuber am Wrack vertrieben (${r.siege} Siege)`); }
    await objekt(ida, LI, "kl_liste"); check(erl(ida, LI, "liste"), "Die Liste der Hehler im Lager gefunden");
    check(await sprich(ida, LI, "kranich", "liste_geben") && fertig(ida, LI), "Ende bei Jasper Kranich, Lohn abgeholt");
  }
  async function kiel() {
    console.log("„Kiel auf Stapel“");
    check(await mitHeld(bea, KIEL, "okko", "annehmen") && stand(bea, KIEL).phase === "laeuft", "Bea nimmt die Quest bei Werftmeister Okko Spant an (Handwerk 15, Schmieden 15)");
    { const r = await bis(bea, KIEL, "segel", 6456, 7327.4 + 1.2, "stoff_hanf"); check(erl(bea, KIEL, "segel") && anzahl(bea, "stoff_hanf") === 2, `Zwei Bahnen Segeltuch an der Werkbank (${r})`); }
    { const r = await bis(bea, KIEL, "eisen", 6447.5, 7325.4 + 1.2, "barren_eisen"); check(erl(bea, KIEL, "eisen") && anzahl(bea, "barren_eisen") === 2, `Zwei Eisenbarren an der Esse, mit Tanne geheizt (${r})`); }
    check(await sprich(bea, KIEL, "hofwaechter_jost", "brief_geben") && erl(bea, KIEL, "holz") && anzahl(bea, "stamm_eiche") === 2, "Quer: Hofwächter Jost am Holzfällerhof in Erlengrund schickt zwei Eichenstämme");
    await objekt(bea, KIEL, "kk_stapellauf"); check(erl(bea, KIEL, "stapellauf") && anzahl(bea, "stamm_eiche") === 0, "Stapellauf an der Werft – das Boot schwimmt");
    check(await sprich(bea, KIEL, "okko", "fertig") && fertig(bea, KIEL), "Abgabe bei Okko, Lohn abgeholt");
  }
  async function suppe() {
    console.log("„Suppe für die Altstadt“");
    check(await mitHeld(cora, SUPPE, "maren", "annehmen") && stand(cora, SUPPE).phase === "laeuft", "Cora nimmt die Quest bei Schwester Maren am Tempel an (Fischen 20, Kochen 25)");
    check(await sprich(cora, SUPPE, "wiebke_hering", "fische_bitten") && anzahl(cora, "fisch_muehlbarsch_roh") === 2, "Zwei Mühlbarsche vom Fischmarkt");
    check(await fischen(cora, "kielmund_kai", "fisch_hering_roh", 3) && erl(cora, SUPPE, "heringe"), `Drei Heringe am Kai gefangen (${anzahl(cora, "fisch_hering_roh")})`);
    check(await sprich(cora, SUPPE, "bente", "garn_geben") && erl(cora, SUPPE, "bente") && anzahl(cora, "fisch_hering_roh") === 5, "Quer: Bente Möller nimmt das Garn und schickt zwei Heringe");
    { const r = await bis(cora, SUPPE, "suppe", 6472, 7365.4 + 1.2, "fischsuppe"); check(erl(cora, SUPPE, "suppe") && anzahl(cora, "fischsuppe") === 2, `Zwei Fischsuppen am Kessel im Fischerquartier (${r})`); }
    { /* Räuchern dauert (warten): Heringe aufhängen, warten, abholen – wie in g4-welt */
      await stelle(cora, 6400.5, 7320.6 + 1.2); cora.msgs.handwerk = []; W.sende(cora, { t: "handwerk", tat: "start", rezept: "raeucherhering", menge: 5 });
      const m = await W.warte(cora, (x) => x.t === "handwerk" && ["warten", "nein", "start"].includes(x.tat), 5000);
      check(m && m.tat === "warten" && m.menge === 5, `Fünf Heringe hängen in der Räucherhütte am Hafen (${m && (m.tat + " " + (m.text || m.menge))})`);
      if (m && m.tat === "warten") { await schlaf(m.ms + 1500); cora.msgs.handwerk = []; W.sende(cora, { t: "handwerk", tat: "start", rezept: "raeucherhering", menge: 5 }); await schlaf(3000); }
      check(erl(cora, SUPPE, "raeuchern") && anzahl(cora, "raeucherhering") === 5, `Fünf Räucherheringe abgeholt (${anzahl(cora, "raeucherhering")})`); }
    await objekt(cora, SUPPE, "ks_speisung"); check(erl(cora, SUPPE, "speisung") && anzahl(cora, "fischsuppe") === 0, "Die Speisung vor dem Tempel bereitet");
    check(await sprich(cora, SUPPE, "maren", "fertig") && fertig(cora, SUPPE), "Abgabe bei Schwester Maren, Lohn abgeholt");
  }
  async function brief() {
    console.log("„Der Brief des Ratsherrn“");
    check(await sprich(dora, BRIEF, "edzard", "annehmen") && stand(dora, BRIEF).phase === "laeuft", "Dora nimmt die Quest bei Ratsherr Edzard Wellmann an");
    for (const id of ["ilka", "samira", "maren", "hanne_kombuese"]) await sprich(dora, BRIEF, id, "brief_" + id);
    check(["ilka", "samira", "maren", "hanne_kombuese"].every((id) => erl(dora, BRIEF, "brief_" + id)) && anzahl(dora, "salz") === 1 && anzahl(dora, "brot") === 1, "Briefe in alle vier Viertel gebracht (Salz und Brot zurück)");
    check(await sprich(dora, BRIEF, "edzard", "fertig") && fertig(dora, BRIEF), "Abgabe beim Ratsherrn, Lohn abgeholt");
  }
  await Promise.all([lichter(), kiel(), suppe(), brief()]);
} catch (e) { console.error(e); check(false, "Ausnahme: " + e.message); }
W.ende("Kielmund-Stadtquests (#174)");
