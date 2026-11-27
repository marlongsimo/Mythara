/*
 * Riftmere – die zwei Waffen-Quests der mittleren Stufe (Ausgabe 1) Ende zu Ende: echter Spielserver (localhost:8870), nachgebildete Supabase (localhost:8869), echte Welt.
 * Ida spielt „Hartwigs Eibenbogen“ (Eibe am Waldweg, Bogensehne, Rabenfedern bei Hedda, Hartwig baut den Bogen, anlegen, drei Treffer an der Zielscheibe),
 * Cora zugleich „Der Stab der Linde“ (Zweig der Linde, drei Irrlichter im Rabenmoor, Mira bindet ihn mit einem Heiltrank, Bindestein, anlegen, drei Treffer mit Magie).
 * Tom (Heldenlevel 1) ist die Gegenprobe. Lohn mit „abholen“.
 * Aufruf: node test/waffen-welt.test.mjs   (nach node build.mjs und python3 werkzeug/weltzonen.py)
 */
import { starte, starkerHeld, roh, QUESTS } from "./questwelt.mjs";

const viel = (g, n) => Array.from({ length: n }, () => g);
const W = await starte({ sb: 8869, srv: 8870, helden: { /* localhost:8869 · localhost:8870 */
  ida: starkerHeld({ fertig: ["nordwald_waldsaebel"] /* Hartwig bietet sonst zuerst den Waldsäbel (Q3) an */, berufe: { holzfaellerei: 40, handwerk: 10 }, rucksack: ["holzbeil_einfach", "flachs", ...viel("moorgloeckchen", 2)] }),
  cora: starkerHeld({ berufe: { splitterbinden: 40 }, rucksack: ["heiltrank"] }),
  tom: { ...roh(), inventar: { angelegt: { waffe: "trainingsschwert" }, rucksack: [], v: 2 } } } });
const { check, spieler, sprich, objekt, stand, erl, fertig, kampf, anzahl, schlaf, sammeln, herstellen, sende, stelle } = W;
const Q = (id) => QUESTS.find((q) => q.id === id);
const BOGEN = Q("nordwald_hartwigs_eibenbogen"), STAB = Q("weidenhain_der_stab_der_linde");
/** ansprechen, während eine Kampfverbindung offen ist (der Server kennt Skills und Heldenlevel nur daher) */
async function mitHeld(s, q, npc, a) { const F = q.figuren.find((x) => x.id === npc), z = await kampf(s.name, F.x + 1, F.y); const ok = await sprich(s, q, npc, a); if (z) { z.ws.close(); await schlaf(2500); } return ok; }
/** Gegenstand aus dem Rucksack anlegen (wie der Browser: inv/anlegen mit dem Platz im Rucksack) */
async function anlegen(s, g) { const i = (s.inv && s.inv.rucksack || []).findIndex((f) => (f.g || f) === g); if (i < 0) return false; sende(s, { t: "inv", tat: "anlegen", i }); await schlaf(1500);
  return Boolean(s.inv && s.inv.angelegt && s.inv.angelegt.waffe === g); }
/** an der Zielscheibe der Waldmark üben, bis der Schritt erledigt ist */
async function scheibe(s, q, schritt, nr = 0) { const z = await kampf(s.name, 6436.5, 6458); if (!z) return; await schlaf(1500); const sch = z.w.filter((w) => w[2] === "zielscheibe")[nr] || z.w.find((w) => w[2] === "zielscheibe"); /* je Held eine eigene Scheibe (Einzelkampf) */
  if (sch) { z.ws.send(JSON.stringify({ t: "ziel", id: sch[0] })); const t0 = Date.now(); while (!erl(s, q, schritt) && Date.now() - t0 < 90000) await schlaf(300); }
  z.ws.send(JSON.stringify({ t: "ziel", id: 0 })); await schlaf(800); z.ws.close(); await schlaf(2500); }

try {
  const [ida, cora, tom] = await Promise.all(["ida", "cora", "tom"].map((n) => spieler(n)));
  if (!BOGEN || !STAB) { console.log("(Waffen-Quests noch Entwurf – warten auf die zwei Waffen von Integration)"); W.ende("Waffen-Quests (Entwurf)"); }
  check(BOGEN && STAB, "Beide Waffen-Quests sind im Spiel");
  await mitHeld(tom, BOGEN, "foerster", "annehmen"); check(stand(tom, BOGEN).phase !== "laeuft", "Tom (Heldenlevel 1): Hartwig gibt ihm den Bogen-Auftrag nicht");

  async function bogen() {
    console.log("„Hartwigs Eibenbogen“");
    check(await mitHeld(ida, BOGEN, "foerster", "annehmen") && stand(ida, BOGEN).phase === "laeuft", "Ida nimmt die Quest bei Förster Hartwig an (Heldenlevel 25, Fernkampf 30)");
    check(await sammeln(ida, "holz", "eibe_1", 6498.5, 6525.5, "stamm_eibe", 1, 120000) && erl(ida, BOGEN, "eibe"), "Einen Eibenstamm am Waldweg gefällt");
    { const r = await herstellen(ida, 6530.5, 6426.5 + 1.2, "bogensehne"); check(r === "ok" && erl(ida, BOGEN, "sehne"), `Eine Bogensehne an der Werkbank (${r})`); }
    check(await sprich(ida, BOGEN, "hedda", "federn_tauschen") && erl(ida, BOGEN, "federn") && anzahl(ida, "rabenfedern") >= 1, "Quer: Mutter Hedda tauscht Rabenfedern gegen zwei Moorglöckchen");
    check(await sprich(ida, BOGEN, "foerster", "bauen") && erl(ida, BOGEN, "bauen") && anzahl(ida, "eibenbogen_hartwig") === 1, "Hartwig baut den Eibenbogen");
    check(await anlegen(ida, "eibenbogen_hartwig"), "Den Eibenbogen angelegt (Fernkampf 30)");
    await scheibe(ida, BOGEN, "schiessen"); check(erl(ida, BOGEN, "schiessen"), "Drei Treffer mit dem Eibenbogen an der Zielscheibe");
    check(await sprich(ida, BOGEN, "foerster", "fertig") && fertig(ida, BOGEN), "Abgabe bei Hartwig, Lohn abgeholt");
  }
  async function stab() {
    console.log("„Der Stab der Linde“");
    check(await mitHeld(cora, STAB, "agnes", "annehmen") && stand(cora, STAB).phase === "laeuft", "Cora nimmt die Quest bei Agnes an der Linde an (Magie 30, Splitterbinden 20)");
    await objekt(cora, STAB, "ws_zweig"); check(erl(cora, STAB, "zweig"), "Den leuchtenden Zweig der Linde genommen");
    { const L = [["irr_5", 6372, 6669.5], ["irr_2", 6339, 6698], ["irr_4", 6330.5, 6681], ["irr_1", 6369.5, 6723], ["irr_3", 6319, 6726.5]]; let i = 0; const t0 = Date.now();
      while (!erl(cora, STAB, "lichter") && Date.now() - t0 < 150000) { const [id, x, y] = L[i++ % L.length]; await sammeln(cora, "licht", id, x, y, "seelenlicht", anzahl(cora, "seelenlicht") + 1, 15000); }
      check(erl(cora, STAB, "lichter") && anzahl(cora, "seelenlicht") >= 3, `Drei Irrlichter im Rabenmoor (${anzahl(cora, "seelenlicht")} Seelenlichter)`); }
    check(await sprich(cora, STAB, "mira", "binden") && erl(cora, STAB, "mira") && anzahl(cora, "heiltrank") === 0, "Quer: Mira bindet den Zweig mit einem Heiltrank");
    await objekt(cora, STAB, "ws_bindestein"); check(erl(cora, STAB, "weihen") && anzahl(cora, "lindenstab") === 1, "Am Bindestein geweiht: der Lindenstab");
    check(await anlegen(cora, "lindenstab"), "Den Lindenstab angelegt (Magie 30)");
    await scheibe(cora, STAB, "zaubern", 1); check(erl(cora, STAB, "zaubern"), "Drei Treffer mit Magie an der Zielscheibe");
    check(await sprich(cora, STAB, "agnes", "fertig") && fertig(cora, STAB), "Abgabe bei Agnes, Lohn abgeholt");
  }
  await Promise.all([bogen(), stab()]);
} catch (e) { console.error(e); check(false, "Ausnahme: " + e.message); }
W.ende("Waffen-Quests (Eibenbogen, Lindenstab)");
