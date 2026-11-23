/*
 * Mythara – liest die Zahlen fürs Kampfsystem-PDF (v4) aus dem gebauten Spielcode und schreibt sie als JSON.
 * Aufruf (im Ordner realtime nach „node build.mjs“): node ../doku/kampfsystem/quelle/kampfdaten.mjs > ../doku/kampfsystem/quelle/kampfdaten.json
 */
import { GEGENSTAENDE, MONSTER, STILE, kampfwerte, gegnerWerte, startAusruestung, xpFuer, maxHit, NULL_XP } from "../../../realtime/test/sim.gebaut.mjs";

const NULL = { ...NULL_XP };
const xp = [2, 3, 5, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 99, 100].map((L) => [L, xpFuer(L)]);
const mh = [[1, 0], [10, 16], [20, 22], [50, 50], [75, 80], [99, 114]].map(([L, b]) => [L, b, maxHit(L, 0, b), maxHit(L, 3, b)]);
const teil = (id) => { const G = GEGENSTAENDE[id]; return { id, name: G.name, platz: G.platz, seltenheit: G.seltenheit, art: G.art, waffe: G.waffe || null, abwehr: G.abwehr || null, bonus: G.bonus || null, anforderung: G.anforderung || null, zweihand: Boolean(G.zweihand) }; };
const start = {};
for (const w of ["schwert", "bogen", "stab"]) {
  const an = startAusruestung(w), art = w === "schwert" ? "nah" : w === "bogen" ? "fern" : "magie";
  start[w] = { teile: Object.values(an).map(teil), stile: STILE[art].map((S, i) => { const k = kampfwerte(NULL, an, i); return { name: S.name, angriff: k.angriff[art], max: k.waffe.schaden[1], ticks: k.waffe.ticks, reich: k.waffe.reich, abwehr: k.abwehr }; }) };
}
const ausruestung = Object.keys(GEGENSTAENDE).filter((id) => GEGENSTAENDE[id].platz).map(teil);
const B = MONSTER.bandit_dolch, bw = gegnerWerte(B.v2, "nah");
const bandit = { lp: B.lp, v2: B.v2, treffer: bw.treffer, maxHit: bw.maxHit, abwehr: bw.abwehr, drops: B.drops };
/* Beispiel: Level 20 in allem, Mithril-Platte, Stab oder Kurzbogen – zeigt die Abzüge der Metallrüstung */
const x20 = { ...NULL, geschick: xpFuer(20), staerke: xpFuer(20), defense: xpFuer(20), fernkampf: xpFuer(20), magie: xpFuer(20) };
const platte = { kopf: "eisenwachthelm", brust: "eisenwacht", beine: "eisenbeinschienen", nebenhand: "sternenschild" };
const beispiel = [["Kurzbogen (Selten)", "mondkurzbogen", "fern"], ["Zauberstab (Selten)", "sternenszepter", "magie"], ["Schwert (Selten)", "eidschwert", "nah"]]
  .map(([n, w, art]) => ({ n, ohne: kampfwerte(x20, { waffe: w }, 0).angriff[art], mit: kampfwerte(x20, { ...platte, waffe: w }, 0).angriff[art] }));
const abwehr20 = kampfwerte(x20, { ...platte, waffe: "eidschwert" }, 0).abwehr;
console.log(JSON.stringify({ xp, mh, start, ausruestung, bandit, beispiel, abwehr20 }));
