/*
 * Riftmere – Quest C1 „Schwarze Federn“ (Raben-Trilogie, Teil 1) Ende zu Ende: echter Spielserver (localhost:8822), nachgebildete Supabase (localhost:8821), echte Kampfwelt, Lohn mit „abholen“.
 * Block C ist in drei Tests geteilt (unter 400 s je Test): c1-welt, c2-welt, c3-welt – jeder beginnt mit den vorigen Quests als fertig.
 * Aufruf: node test/c1-welt.test.mjs   (nach node build.mjs und python3 werkzeug/weltzonen.py)
 */
const SB = 8821, SRV = 8822, FERTIG = ["westmark_das_rote_banner", "obstwiesen_fallobst"];
import { starte, starkerHeld, QUESTS, QB } from "./questwelt.mjs";
const C1 = QUESTS.find((q) => q.id === "rabenmoor_schwarze_federn"), C2 = QUESTS.find((q) => q.id === "aschenwerth_gesang_der_spiralsteine"), C3 = QUESTS.find((q) => q.id === "rabengrund_der_oberste");
const W = await starte({ sb: SB, srv: SRV, helden: {
  ute: starkerHeld({ fertig: FERTIG, berufe: { holzfaellerei: 40, handwerk: 30 }, rucksack: ["holzbeil_einfach", "hammer", ...Array(5).fill("stamm_tanne")] }),
  bea: starkerHeld({}) } });
const { check, schlaf, anzahl, stelle, rede, sprich, objekt, stand, erl, fertig, kampf, kaempfen, aufheben, sammeln, herstellen, sende } = W;
const K0 = { hat: () => false, verloren: () => false };
const an = (q, s, name) => [].concat(q.schalter[name]).some((b) => QB.gilt(q, s.b[q.id] || "", b, K0));
/** Region wechseln (wie der Browser beim Laufen über eine Grenze) */
const ort = async (s, region, x, y) => { sende(s, { t: "ort", ort: region }); await schlaf(200); await stelle(s, x, y); await schlaf(300); };
const WEIDEN = [["moorweide_1", 6332.5, 6691.5], ["moorweide_2", 6336.5, 6691.5], ["moorweide_3", 6331.5, 6695.5]];

try {
  const ute = await W.spieler("ute"), bea = await W.spieler("bea");
  check(Boolean(C1 && C2 && C3), "C1, C2, C3 sind im Spiel");
  console.log("C1 „Schwarze Federn“");
  { const z = await kampf("bea", 6321, 6697); check(!(await sprich(bea, C1, "bertold", "annehmen")), "Bea (ohne „Das rote Banner“): Bertold bietet C1 nicht an"); z && z.ws.close(); }
  { const z = await kampf("ute", 6321, 6697); check(await sprich(ute, C1, "bertold", "annehmen") && stand(ute, C1).phase === "laeuft", "Ute nimmt C1 an (B4 fertig, Heldenlevel 30)"); z && z.ws.close(); await schlaf(2500); }
  check(await sprich(ute, C1, "joost", "bruecke_frage") && erl(ute, C1, "joost"), "Joost am Steg erzählt von der alten Brücke");
  check(await sprich(ute, C1, "gisbert", "weiden_frage") && erl(ute, C1, "gisbert"), "Gisbert Ast weiß, welche Moorweiden taugen (quer: Obstwiesen)");
  { let i = 0; const t0 = Date.now(); while (anzahl(ute, "stamm_moorweide") < 4 && Date.now() - t0 < 120000) { const [id, x, y] = WEIDEN[i++ % 3]; await sammeln(ute, "holz", id, x, y, "stamm_moorweide", anzahl(ute, "stamm_moorweide") + 1, 20000); }
    check(erl(ute, C1, "weiden") && anzahl(ute, "stamm_moorweide") >= 4, `Vier Moorweiden gefällt (${anzahl(ute, "stamm_moorweide")})`); }
  { let r = "ok"; for (let i = 0; i < 4 && r === "ok"; i++) r = await herstellen(ute, 6310.7, 6703.5, "brueckenplanke"); /* ein Quest-Rezept stellt je Auftrag so viele her, wie die Quest noch braucht – hier zählt erst Harm */
    check(r === "ok" && anzahl(ute, "brueckenplanke") === 4, `Vier Brückenplanken an der Werkbank neben Harm (${r}, ${anzahl(ute, "brueckenplanke")})`); }
  check(await sprich(ute, C1, "harm", "planken_geben") && erl(ute, C1, "planken") && anzahl(ute, "brueckenplanke") === 0, "Harm nimmt die vier Planken");
  check(await sprich(ute, C1, "ulf", "tannen") && erl(ute, C1, "pech") && anzahl(ute, "meilerpech") === 1, "Köhler Ulf brennt Meilerpech für fünf Tannenstämme");
  { const t = await objekt(ute, C1, "c1_bruecke"); check(erl(ute, C1, "bruecke") && an(C1, ute, "bruecke_aschenwerth"), `Brücke geflickt, sie trägt (Schalter bruecke_aschenwerth) – ${t.slice(0, 40)}`); }
  { const r = await W.kampfBis(ute, 6243, 6733, ["rabenpriester_novize"], () => W.erl(ute, C1, "novizen"));
    check(erl(ute, C1, "novizen"), `Drei Novizen am Steinkreis besiegt (${r.siege} Siege)`); }
  check(await sprich(ute, C1, "ebbo", "losbinden") && erl(ute, C1, "ebbo"), "Ebbo losgebunden");
  await objekt(ute, C1, "c1_kapuze"); check(erl(ute, C1, "kapuze") && anzahl(ute, "novizenkapuze") === 1, "Die Novizenkapuze am Ufer aufgehoben");
  check(await sprich(ute, C1, "bertold", "kapuze_zeigen") && fertig(ute, C1), "C1 fertig: Kapuze bei Bertold, Lohn abgeholt");

} catch (e) { console.error(e); check(false, "Ausnahme: " + e.message); }
W.ende("C1 „Schwarze Federn“");
