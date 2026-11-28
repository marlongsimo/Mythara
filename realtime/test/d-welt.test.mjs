/*
 * Riftmere – Block D (Phase 7) Ende zu Ende: D1 „Die Fährkette“, D2 „Das grüne Licht“, D3 „Wels im Trüben“ auf dem echten Spielserver (nachgebildete Supabase, test/questwelt.mjs).
 * Kai spielt alle drei ganz (Lohn mit „abholen“), danach: Fähre frei, Wappentür offen, Wegstein-Ziel am Turm, Alma verkauft Welspastete. Lea (ohne Voraussetzungen) als Gegenprobe.
 * Ports: Supabase localhost:8811, Spielserver localhost:8812.   Aufruf (im Ordner realtime, nach node build.mjs): node test/d-welt.test.mjs
 */
import { starte, starkerHeld, roh, LEGENDAER, QUESTS, QB } from "./questwelt.mjs";
const D1 = QUESTS.find((q) => q.id === "graufurt_die_faehrkette"), D2 = QUESTS.find((q) => q.id === "ostufer_das_gruene_licht"), D3 = QUESTS.find((q) => q.id === "graufurt_wels_im_trueben");
const kai = starkerHeld({ fertig: ["nordwald_das_wappen_mit_dem_turm"], berufe: { bergbau: 50, schmieden: 50, fischen: 50, kochen: 50 },
  rucksack: ["hammer", "spitzhacke_legendaer", "angelrute", "wappenabrieb", { g: "wurm", n: 40 }, ...Array(3).fill("stamm_tanne"), ...Array(8).fill("barren_splittereisen"), { g: "mehl", n: 5 } /* zwei mehr: eine Pastete kann anbrennen */] });
kai.inventar.angelegt = { ...LEGENDAER }; /* Ausrüstung in passender Stufe: mit dem Trainingsschwert heilt das Grünlicht den Turmwächter schneller, als man trifft */
const W = await starte({ sb: 8811, srv: 8812, helden: { kai, lea: { ...roh(), inventar: { angelegt: { waffe: "trainingsschwert" }, rucksack: [{ g: "splitter", n: 20 }], v: 2 } } } });
/* Ports für parallel.mjs: localhost:8811, localhost:8812 */
const { check, schlaf, anzahl, sprich, objekt, stand, erl, fertig, kampfBis, sammeln, herstellen, fischen, sende, warte } = W;
const K0 = { hat: () => false, verloren: () => false };
const schalterAn = (q, s, id) => [].concat(q.schalter[id]).some((b) => QB.gilt(q, s.b[q.id] || "", b, K0));
try {
  const k = await W.spieler("kai"), l = await W.spieler("lea");
  check(Boolean(D1 && D2 && D3), "D1–D3 sind im Spiel");

  console.log("D1 „Die Fährkette“");
  check(!(await sprich(l, D1, "kord", "annehmen")), "Lea (ohne A2, Schmieden/Bergbau 45): Kord bietet nichts an");
  check(await sprich(k, D1, "kord", "annehmen") && stand(k, D1).phase === "laeuft", "Kai nimmt D1 an");
  check(await sprich(k, D1, "merit", "wappen") && erl(k, D1, "merit"), "Merit sieht den Wappenabrieb – Erlaubnis");
  check(await sammeln(k, "berg", "splitterfels_am_lammerhang_splittereisen_1", 6337.5, 7087.5, "erz_splittereisen", 6, 150000) && erl(k, D1, "erz"), `Sechs Splittereisenerz (${anzahl(k, "erz_splittereisen")})`);
  { let r = ""; for (let i = 0; i < 12 && anzahl(k, "kettenglied") < 8; i++) r = await herstellen(k, 6470.4 - 1.2, 6427.6, "kettenglied", 8 - anzahl(k, "kettenglied")); check(r === "ok" && anzahl(k, "kettenglied") === 8 && erl(k, D1, "glieder"), `Acht Kettenglieder am Amboss (${r}, ${anzahl(k, "kettenglied")})`); }
  check(await sprich(k, D1, "ulf", "tannen") && anzahl(k, "meilerpech") === 1 && erl(k, D1, "pech"), "Köhler Ulf brennt Meilerpech gegen drei Tannenstämme");
  check(await sprich(k, D1, "schmiedin", "schloss_nehmen") && anzahl(k, "kettenschloss") === 1 && erl(k, D1, "schloss"), "Die Schmiedin gibt das Kettenschloss");
  await objekt(k, D1, "d1_winde"); check(erl(k, D1, "winde") && anzahl(k, "kettenglied") === 0, "Die Kette hängt an der Winde");
  check(await sprich(k, D1, "kord", "fahrt") && fertig(k, D1), "D1 fertig, Lohn abgeholt");
  check(schalterAn(D1, k, "faehre_frei") && !schalterAn(D1, l, "faehre_frei"), "Schalter faehre_frei: bei Kai an, bei Lea aus");

  console.log("D2 „Das grüne Licht“");
  check(await sprich(k, D2, "kord_ost", "annehmen") && stand(k, D2).phase === "laeuft", "Kai nimmt D2 am Ostanleger an");
  check(!schalterAn(D2, k, "wappentuer_offen"), "Wappentür vor dem Schritt: zu");
  await objekt(k, D2, "d2_tuer"); check(erl(k, D2, "tuer") && schalterAn(D2, k, "wappentuer_offen"), "Wappentür geöffnet, Schalter wappentuer_offen an");
  { const zw = () => QB.zaehler(D2, k.b[D2.id] || "", "waechter"); await kampfBis(k, 10896.5, 9614.5, ["turmwaechter"], () => zw() >= 2, 240000);
    if (zw() < 2) await kampfBis(k, 10928.5, 9614.5, ["turmwaechter"], () => zw() >= 2, 180000);
    check(erl(k, D2, "waechter"), `Zwei Turmwächter auf Ebene 1 und 2 (Zähler ${zw()})`); }
  await objekt(k, D2, "d2_buch"); check(erl(k, D2, "buch"), "Das Wächterbuch gelesen");
  { /* in Runden (wie f-welt): hängt ein Ziel oder die Verbindung (CI mit mehreren Läufen zugleich), neu verbinden – höchstens 330 s */
    const t0 = Date.now(); for (let runde = 0; runde < 4 && !erl(k, D2, "gruenlicht") && Date.now() - t0 < 330000; runde++) {
      await W.stelle(k, 10990, 9617.2); const z = await W.kampf("kai", 10990, 9617.2); await schlaf(1500); if (!z) continue;
      await W.kaempfen(z, ["gruenlicht", "turmwaechter"], () => erl(k, D2, "gruenlicht"), Math.min(120000, 330000 - (Date.now() - t0))); await schlaf(800); z.ws.close(); await schlaf(2500); } }
  check(erl(k, D2, "gruenlicht"), "Das Grünlicht auf dem Dach besiegt");
  await objekt(k, D2, "d2_feuer"); check(erl(k, D2, "kern") && anzahl(k, "splitterkern_gruen") === 1, "Den Splitterkern aus dem Signalfeuer genommen");
  check(await sprich(k, D2, "ysolde", "sprechen") && erl(k, D2, "ysolde"), "Mit Ysolde gesprochen");
  check(await sprich(k, D2, "merit", "kern_geben") && fertig(k, D2) && anzahl(k, "splitterkern_gruen") === 0, "D2 fertig bei Merit, Lohn abgeholt");
  check(schalterAn(D2, k, "wappentuer_offen"), "Wappentür bleibt nach der Quest offen");

  console.log("D3 „Wels im Trüben“");
  check(await sprich(k, D3, "alma", "annehmen") && stand(k, D3).phase === "laeuft", "Kai nimmt D3 an");
  check(await fischen(k, "faehrhafen", "fisch_wels_roh", 5, 240000) /* zwei mehr: eine Pastete kann anbrennen */ && erl(k, D3, "welse"), `Drei Graufurter Welse im Fährhafen (${anzahl(k, "fisch_wels_roh")})`);
  { let r = ""; for (let i = 0; i < 6 && anzahl(k, "welspastete") < 2; i++) { r = await herstellen(k, 6698.2, 6537.2, "welspastete", 2 - anzahl(k, "welspastete"));
      if (/fehlt.*Wels/.test(r) && anzahl(k, "welspastete") < 2) await fischen(k, "faehrhafen", "fisch_wels_roh", anzahl(k, "fisch_wels_roh") + 1, 90000); } /* eine angebrannte Pastete verbraucht einen Wels: einen nachangeln */ check(r === "ok" && anzahl(k, "welspastete") >= 2 && erl(k, D3, "pasteten"), `Zwei Welspasteten am Herd „Zur Furt“ (${r}, ${anzahl(k, "welspastete")})`); }
  check(await sprich(k, D3, "alma", "abgeben") && fertig(k, D3), "D3 fertig, Lohn abgeholt");
  { const vor = anzahl(k, "welspastete"); await W.stelle(k, 6700.5, 6543.8); sende(k, { t: "kaufen", laden: "graufurt_alma", g: "welspastete" }); await schlaf(800);
    check(anzahl(k, "welspastete") === vor + 1, `Alma verkauft jetzt Welspastete (${vor} → ${anzahl(k, "welspastete")})`);
    const n = l.chat.length; await W.stelle(l, 6700.5, 6543.8); sende(l, { t: "kaufen", laden: "graufurt_alma", g: "welspastete" }); await schlaf(800);
    check(anzahl(l, "welspastete") === 0, "… Lea (ohne D3) bekommt keine"); }
} catch (e) { console.error(e); check(false, "Ausnahme: " + e.message); }
W.ende("Block D (D1–D3)");
