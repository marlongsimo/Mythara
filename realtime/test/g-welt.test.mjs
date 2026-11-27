/*
 * Riftmere – Block G (Phase 10, Smaragdküste) Ende zu Ende: echter Spielserver, nachgebildete Supabase, Kampfwelt, Lohn mit „abholen“ (#77).
 * Ida spielt G1 „Die Südstraße“, G2 „Das Leuchtfeuer“, G3 „Was das Wrack verschweigt“ (Wrackkapitän allein in der Kajüte, danach wrackkapitaen_danach)
 * und G4 „Netze für die Möwenbucht“ (Räucherhütte mit raeucherhuette_frei). Tom (ohne Voraussetzungen) ist die Gegenprobe.
 * Server auf localhost:8818, Supabase-Nachbildung auf localhost:8817 (Gerüst test/questwelt.mjs).
 * Aufruf: node test/g-welt.test.mjs   (nach node build.mjs und python3 werkzeug/weltzonen.py)
 */
import { starte, starkerHeld, QUESTS, QB } from "./questwelt.mjs";

const ida = starkerHeld({ fertig: ["obstwiesen_fallobst", "westmark_das_rote_banner", "weidenhain_der_wegstein"], berufe: { splitterbinden: 30, handwerk: 30, fischen: 30, kochen: 30 },
  rucksack: ["angelrute", "hammer", { g: "wurm", n: 60 }, { g: "garn", n: 6 }, { g: "seelenlicht", n: 2 }] });
/* Rüstung dazu: der Wrackkapitän (Stufe 40) schlägt einen Helden ohne Rüstung auch mit Level 99 einmal nieder */
ida.inventar.angelegt = { waffe: "ritterschwert", nebenhand: "sternenschild_legendaer", brust: "eisenwacht_legendaer", beine: "eisenbeinschienen_legendaer", kopf: "eisenwachthelm_legendaer" };
const tom = { ...starkerHeld(), quests: {} };
const W = await starte({ sb: 8817, srv: 8818, helden: { ida, tom } }); /* localhost:8817 · localhost:8818 */
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

  console.log("G1 „Die Südstraße“");
  check(!(await sprich(T, G1, "othmar", "annehmen")), "Tom (ohne „Die gesperrte Straße“): Othmar bietet G1 nicht an");
  check(await annehmen(I, G1, "othmar"), "Ida nimmt G1 bei Othmar an");
  await objekt(I, G1, "g1_spur_1"); await objekt(I, G1, "g1_spur_2");
  check(erl(I, G1, "spur_1") && erl(I, G1, "spur_2"), "Beide Spuren auf der Südstraße gelesen");
  { const R = G1.schritte.find((x) => x.id === "raeuber_knueppel").wo, fertigR = () => erl(I, G1, "raeuber_knueppel") && erl(I, G1, "raeuber_schleuder");
    for (let runde = 0; runde < 3 && !fertigR(); runde++) for (const [x, y] of [R, [6496, 7166]]) if (!fertigR()) await kampfBis(I, x + 1, y, ["wegelagerer_knueppel", "wegelagerer_schleuder"], () => fertigR(), 120000);
    check(fertigR(), `Vier Wegelagerer am Lager der Südstraße besiegt (Knüppel ${QB.zaehler(G1, I.b[G1.id] || "", "raeuber_knueppel")}, Schleuder ${QB.zaehler(G1, I.b[G1.id] || "", "raeuber_schleuder")})`); }
  await objekt(I, G1, "g1_wagen"); check(erl(I, G1, "wagen") && anzahl(I, "frachtbrief") === 1, "Der Wagen: Frachtbrief gefunden");
  { const sp = anzahl(I, "splitter"); check(await sprich(I, G1, "kranich", "brief_geben") && fertig(I, G1) && anzahl(I, "frachtbrief") === 0 && anzahl(I, "splitter") >= sp + 400, `G1 bei Kranich in Kielmund abgegeben, Lohn abgeholt (${anzahl(I, "splitter") - sp} Splitter)`); }
  { const { WEGSTEIN_ZIELE } = await import("./sim.gebaut.mjs").catch(() => ({})); const Z = (WEGSTEIN_ZIELE || []).find((z) => z.quest === G1.id);
    check(Boolean(Z), `Wegstein-Ziel Kielmund nach G1 (${Z ? Z.id : "fehlt in shared/wegstein.ts"})`); }

  console.log("G2 „Das Leuchtfeuer“");
  check(await annehmen(I, G2, "wiebke"), "Ida nimmt G2 bei Wiebke Strand an");
  check(await fischen(I, "kielmund_kai", "fisch_hering_roh", 5) && erl(I, G2, "heringe"), `Fünf Heringe am Kai von Kielmund (${anzahl(I, "fisch_hering_roh")})`);
  { const r = await herstellen(I, 6190 - 1.2, 7039.5, "lampenoel"); check(r === "ok" && erl(I, G2, "oel") && anzahl(I, "lampenoel") === 1, `Lampenöl im Kessel des Wärterhauses (${r})`); }
  { const r = await herstellen(I, 6453.2 - 1.2, 6679.4, "splitterglut"); check(r === "ok" && erl(I, G2, "glut") && anzahl(I, "splitterglut") === 1, `Splitterglut am Bindestein an der Linde (${r})`); }
  await objekt(I, G2, "g2_linse"); check(erl(I, G2, "linse"), "Die Linse poliert (Handwerk 25)");
  await objekt(I, G2, "g2_feuer"); check(erl(I, G2, "feuer") && anzahl(I, "lampenoel") === 0 && anzahl(I, "splitterglut") === 0, "Das Leuchtfeuer brennt (Öl und Glut verbraucht)");
  check(schalterAn(I, G2, "leuchtfeuer_an"), "Schalter leuchtfeuer_an ist an");
  check(await sprich(I, G2, "wiebke", "fertig") && fertig(I, G2), "G2 bei Wiebke abgegeben, Lohn abgeholt");

  console.log("G3 „Was das Wrack verschweigt“");
  check(await annehmen(I, G3, "kranich"), "Ida nimmt G3 bei Kranich an (nach G1 und B4, Heldenlevel 35)");
  { const R = G3.schritte.find((x) => x.id === "raeuber_saebel").wo, fertigR = () => erl(I, G3, "raeuber_saebel") && erl(I, G3, "raeuber_armbrust");
    for (let runde = 0; runde < 4 && !fertigR(); runde++) await kampfBis(I, R[0] + 1, R[1], ["strandraeuber_saebel", "strandraeuber_armbrust"], () => fertigR(), 150000);
    check(fertigR(), "Vier Strandräuber im Wrack besiegt"); }
  await objekt(I, G3, "g3_kiste"); check(erl(I, G3, "kiste") && anzahl(I, "wrackkiste") === 1, "Die Kiste mit dem Rabensiegel aus dem Wrack");
  check(await sprich(I, G3, "bertold", "wrackkiste_bertold") && erl(I, G3, "bertold"), "Bertold Krähe hat die Kiste gesehen");
  check(await sprich(I, G3, "merit", "wrackkiste_merit") && erl(I, G3, "merit"), "Merit Stahl hat die Kiste gesehen");
  check(schalterAn(I, G3, "wrackkapitaen_kajuete") && !schalterAn(I, G3, "wrackkapitaen_danach"), "Während der Quest: Kajüte als Instanz (allein), noch nicht „danach“");
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

  console.log("G4 „Netze für die Möwenbucht“");
  { const r = await herstellen(I, 6309.5 - 1.2, 6703.5, "fischernetz"); check(r !== "ok" && anzahl(I, "fischernetz") === 0, `Vor G4: kein Fischernetz (${r})`); }
  check(await annehmen(I, G4, "bente"), "Ida nimmt G4 bei Bente Möller an");
  { const r = await herstellen(I, 6309.5 - 1.2, 6703.5, "fischernetz"); check(r === "ok" && erl(I, G4, "netz") && anzahl(I, "fischernetz") === 1, `Fischernetz an der Werkbank in Rabenmoor (${r})`); }
  check(await sprich(I, G4, "bente", "netz_geben") && erl(I, G4, "netz_geben") && anzahl(I, "fischernetz") === 0, "Bente hat ihr Netz");
  check(await fischen(I, "moewenbucht_steg", "fisch_hering_roh", 5) && erl(I, G4, "heringe"), "Fünf Heringe am Steg der Möwenbucht");
  check(schalterAn(I, G4, "raeucherhuette_frei"), "Schalter raeucherhuette_frei während G4");
  { await stelle(I, 6214 - 1.2, 7168); I.msgs.handwerk = []; sende(I, { t: "handwerk", tat: "start", rezept: "raeucherhering", menge: 3 });
    const m = await warte(I, (x) => x.t === "handwerk" && ["warten", "nein", "start"].includes(x.tat), 5000);
    check(m && m.tat === "warten" && m.menge === 3, `Drei Heringe hängen in der Räucherhütte (${m && (m.tat + " " + (m.text || m.menge))})`);
    if (m && m.tat === "warten") { await schlaf(m.ms + 1500); I.msgs.handwerk = []; sende(I, { t: "handwerk", tat: "start", rezept: "raeucherhering", menge: 3 }); await schlaf(3000); }
    check(anzahl(I, "raeucherhering") >= 3 && erl(I, G4, "raeuchern"), `Drei Räucherheringe abgeholt (${anzahl(I, "raeucherhering")})`); }
  check(await sprich(I, G4, "bente", "abgeben") && fertig(I, G4) && anzahl(I, "raeucherhering") === 0, "G4 bei Bente abgegeben, Lohn abgeholt");
  check(schalterAn(I, G4, "raeucherhuette_frei"), "Räucherhütte bleibt frei nach G4");
} catch (e) { console.error(e); check(false, "Ausnahme: " + e.message); }
W.ende("Block G (Smaragdküste)");
