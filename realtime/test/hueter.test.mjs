/*
 * Riftmere – die drei Hüter der Hochlande (#160, Block H): Grumhold, die Sturmschwinge und die Frostwitwe nach der Boss-Regel #116.
 * Geprüft ohne Server in der Kampfwelt (Sim.welt): das Dreieck aus stark und schwach, die Mechaniken (Stampf-Ring, Felsbrocken-Wächter heilen, Flug und Sturzflug,
 * Sturmböe schiebt, Eisfeld verlangsamt und lässt erstarren), die Rüstung der Stufe 70 mit Set-Bonus (% Magieschaden neu) und die Beute (nur stark, 1 : 75 je Sieg).
 * Horst und Eishöhle baut Welt noch – Sturmschwinge und Frostwitwe kämpfen hier zur Probe in einer Kopie der Trollhalle.
 * Aufruf (im Ordner realtime, nach python3 werkzeug/weltzonen.py): node test/hueter.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-hueter-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/sim"; export * from "./shared/config"; export * from "./shared/karte"; export * from "./shared/karten"; export * from "./shared/kampfwerte"; export { INSTANZEN, BOSSE, HUETER } from "./shared/bosse"; export { ansageFelder, QUEST_STAERKE, SCHWAECHE, STREIF_ANTEIL } from "./shared/boss"; export { GEGENSTAENDE, SETS, RUESTUNG_STUFE70, beuteAufloesen } from "./shared/gegenstaende"; export { weltJeSpieler, bossWahlSetzen, wahlenVergessen } from "./server/src/bosse"; export { H_QUESTS, H_SCHALTER } from "./shared/hochlande"; export { rezept } from "./shared/handwerk"; export { TUEREN } from "./shared/bosse"; export { WEGSTEIN_ZIELE } from "./shared/wegstein"; export { VERBRAUCH } from "./shared/gegenstaende"; export { begehbar } from "./shared/karte";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const M = await import(datei);
const { SCHWAECHE, STREIF_ANTEIL, gegnerStufe, Sim, KARTEN, FEIN, setzeKarte, kampfwerte, NULL_XP, xpFuer, INSTANZEN, BOSSE, HUETER, MONSTER, ansageFelder, GEGENSTAENDE: G, SETS, RUESTUNG_STUFE70, beuteAufloesen, weltJeSpieler, bossWahlSetzen, wahlenVergessen, H_QUESTS, H_SCHALTER, rezept, TUEREN, WEGSTEIN_ZIELE, VERBRAUCH, begehbar } = M;
setzeKarte(KARTEN.welt, FEIN);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
/* Die Räume der Hüter (Welt a897bc23). Fehlt ein Raum noch in der Kampfwelt (Welt noch nicht eingemischt), kämpft der Hüter zur Probe in einer Kopie der Bergwerkshalle */
const frei = (x, y) => begehbar(x - KARTEN.welt.ursprung[0], y - KARTEN.welt.ursprung[1]);
const raum = (typ) => { const D = INSTANZEN.find((d) => d.gegner && d.gegner[0].art === typ && !d.id.startsWith("probe_")); if (frei(D.gegner[0].x, D.gegner[0].y)) return D;
  let P = INSTANZEN.find((d) => d.id === "probe_" + typ); if (!P) { P = { ...D, id: "probe_" + typ, feld: [11595, 9602, 11618, 9624], gegner: [{ art: typ, x: 11607.5, y: 9611.5 }] }; INSTANZEN.unshift(P); } return P; };
const ECHT = HUETER.filter((H) => { const D = INSTANZEN.find((d) => d.id === H.instanz); return D && frei(D.gegner[0].x, D.gegner[0].y); }).map((H) => H.typ);
const L = (n) => { const X = { ...NULL_XP }; for (const k of Object.keys(NULL_XP)) X[k] = xpFuer(n); return X; };
const AUS = { nah: { waffe: "eidschwert_mythisch", nebenhand: "sternenschild_mythisch", brust: "eisenwacht_mythisch", kopf: "eisenwachthelm_mythisch", beine: "eisenbeinschienen_mythisch" },
  fern: { waffe: "mondkurzbogen_mythisch", brust: "jaegerwams_mythisch", kopf: "jaegerkapuze_mythisch", beine: "jaegerhose_mythisch" },
  magie: { waffe: "sternenszepter_mythisch", brust: "magierrobe_mythisch", kopf: "magierkapuze_mythisch", beine: "magierrock_mythisch" } };
/** Eine Kampfwelt mit einem Helden in der Kopie des Hüters (fassung: quest = Schalter an, stark = danach mit eigener Instanz) */
function kampf(typ, stil = "nah", level = 75, an = (D) => (x) => x === D.schalter) {
  const D = raum(typ); INSTANZEN.splice(INSTANZEN.indexOf(D), 1); INSTANZEN.unshift(D); /* gleicher Raum (Probe): dieser zuerst */
  const s = Sim.welt(16, undefined, true), U = KARTEN.welt.ursprung; s.ursprung = [U[0], U[1]]; s.wesen = s.wesen.filter((w) => w.held);
  const g = D.gegner[0], hx = g.x, hy = g.y + 6, id = s.beitreten("schildwaechter", 0, { x: hx - U[0], y: hy - U[1] }, kampfwerte(L(level), AUS[stil], 1)), h = s.nach(id);
  h.schalterAn = [D.schalter, D.danach].filter((x) => an(D)(x)); /* die Hüter sind öffentlich friedlich – gegen wen ihr Schalter an ist, greifen sie an (setzt sonst der Server) */
  wahlenVergessen(); bossWahlSetzen("probe", D.id, "instanz", an(D)); /* nach der Quest: eigene Instanz (starke Fassung) */
  weltJeSpieler(s, id, "probe", hx, hy, an(D), { hat: () => true, abgeben: () => true });
  const b = s.wesen.find((w) => w.typ === typ && w.instanz && w.instanz === h.instanz); return { s, U, id, h, b, D };
}
const schritte = (s, n, jeSchritt) => { for (let i = 0; i < n; i++) { if (jeSchritt) jeSchritt(i); s.schritt(); } };

console.log("\nDie drei Hüter");
check(HUETER.length === 3 && HUETER.every((H) => MONSTER[H.typ] && MONSTER[H.typ].boss && BOSSE[H.typ] && BOSSE[H.typ].phasen.length >= 2 && MONSTER[H.typ].stufe >= 150 && MONSTER[H.typ].stufe <= 200 && MONSTER[H.typ].stufe === gegnerStufe(MONSTER[H.typ].v2, MONSTER[H.typ].lp)),
  `Grumhold, Sturmschwinge, Frostwitwe: Bosse der Stufe 150–200 nach ihren Werten (#175), mit Phasen (${HUETER.map((H) => `${MONSTER[H.typ].name} ${MONSTER[H.typ].stufe}`).join(", ")})`);
const W = (t) => MONSTER[t].widerstand || {};
check(W("grumhold").nah === 0.5 && W("grumhold").magie > 1 && W("sturmschwinge").magie === 0.5 && W("sturmschwinge").fern > 1 && W("frostwitwe").fern === 0.5 && W("frostwitwe").nah > 1,
  "Dreieck: Grumhold stark gegen Nahkampf, schwach gegen Magie · Sturmschwinge stark gegen Magie, schwach gegen Fernkampf · Frostwitwe stark gegen Fernkampf, schwach gegen Nahkampf");
check(HUETER.every((H) => { const D = INSTANZEN.find((d) => d.id === H.instanz); return D && D.schalter === H.schalter && D.danach === H.danach && D.gegner[0].art === H.typ; }),
  "drei Instanzen in Welts Räumen (trollhalle, horst_grauhorn, eishoehle_hochpass) mit den Schaltern für H4 und danach");
console.log(ECHT.length === 3 ? "  (alle drei Räume sind in der Kampfwelt)" : `  (Räume fehlen noch in der Kampfwelt – Probe in der Bergwerkshalle für: ${HUETER.map((H) => H.typ).filter((t) => !ECHT.includes(t)).join(", ")})`);
check(["grumhold", "sturmschwinge", "frostwitwe"].every((t) => MONSTER[t].aggressiv === false && MONSTER[t].aggressivNach && MONSTER[t].aggressivNach.schalter === t + "_danach"),
  "öffentlich friedlich gegen alle, die H4 noch nicht abgeschlossen haben (aggressivNach *_danach)");
check(HUETER.every((H) => H.schalter && H.danach && H.danach !== H.schalter), "jeder Hüter hat seinen Schalter für H4 und für danach (" + HUETER.map((H) => H.schalter + "/" + H.danach).join(", ") + ")");

console.log("\nStark und schwach (60 s Schaden, Held 75, mythische Ausrüstung, starke Fassung)");
for (const typ of ["grumhold", "sturmschwinge", "frostwitwe"]) {
  const erg = {};
  for (const stil of ["nah", "fern", "magie"]) { const { s, id, h, b } = kampf(typ, stil, 75, (D) => (x) => x === D.danach); if (!b) { erg[stil] = -1; continue; }
    h.max = h.lp = 1e6; b.lp = b.max = 1e6; const vor = b.lp; schritte(s, 20 * 60, (i) => { if (i % 20 === 0) s.eingabe({ t: "ziel", id: b.id }, id); }); erg[stil] = vor - b.lp; }
  const sw = { grumhold: ["magie", "nah"], sturmschwinge: ["fern", "magie"], frostwitwe: ["nah", "fern"] }[typ];
  check(erg[sw[1]] > 0 && erg[sw[0]] > 1.5 * erg[sw[1]], `${MONSTER[typ].name}: ${Object.entries(erg).map(([k, v]) => `${k} ${v}`).join(" · ")} – ${sw[0]} deutlich besser als ${sw[1]}`); }

console.log("\nGrumhold");
{ const A = BOSSE.grumhold.phasen[0].ansagen.find((a) => a.felder === "ring"), F = ansageFelder(A, 100.5, 100.5, 0, 0);
  check(F.length === 16 && F.every(([x, y]) => Math.max(Math.abs(Math.floor(x) - 100), Math.abs(Math.floor(y) - 100)) === 2), `Stampf-Ring: ${F.length} Felder im Abstand 2 – innen und außen bleibt frei`);
  const { s, id, h, b } = kampf("grumhold", "magie", 75, (D) => (x) => x === D.danach); h.max = h.lp = 1e6; b.lp = Math.round(b.max * 0.49);
  schritte(s, 20 * 6, (i) => { if (i % 20 === 0) s.eingabe({ t: "ziel", id: b.id }, id); });
  const W2 = s.wesen.filter((w) => w.typ === "felsbrocken_waechter" && w.instanz === b.instanz);
  check(W2.length === 2, `bei halbem Leben: ${W2.length} Felsbrocken-Wächter`);
  s.eingabe({ t: "ziel", id: 0 }, id); s.eingabe({ t: "auto", an: false }, id); const lp0 = b.lp; schritte(s, 20 * 12);
  check(b.lp > lp0, `die Wächter heilen ihn, solange sie stehen (${lp0} → ${b.lp})`);
  for (const w of W2) s["abziehen"](w, 1e6, h); const lp1 = b.lp; schritte(s, 20 * 12);
  check(b.lp <= lp1 + 1, `zerschlagen: keine Heilung mehr (${lp1} → ${b.lp})`); }

console.log("\nDie Sturmschwinge");
{ const { s, id, h, b } = kampf("sturmschwinge", "nah", 75, (D) => (x) => x === D.danach); h.max = h.lp = 1e6; b.lp = b.max = 1e6;
  schritte(s, 20 * 2, (i) => { if (i % 20 === 0) s.eingabe({ t: "ziel", id: b.id }, id); });
  check(s.schwebt(b), "kreist: für Nahkampf unerreichbar");
  let gelandet = -1, wieder = -1, ev = []; const lp0 = b.lp;
  for (let i = 0; i < 20 * 20 && wieder < 0; i++) { if (i % 20 === 0) s.eingabe({ t: "ziel", id: b.id }, id); s.schritt(); const E = s.zustand().ev || []; ev.push(...E);
    if (gelandet < 0 && E.some((e) => e.a === "landen" && e.id === b.id)) gelandet = i; if (gelandet >= 0 && i > gelandet && s.schwebt(b)) wieder = i; }
  check(ev.some((e) => e.a === "ansage" && e.id === b.id && e.name === "Sturzflug") && gelandet >= 0, "Sturzflug mit Schattenkreis (Ansage), danach landet sie");
  check(wieder > gelandet && Math.abs((wieder - gelandet) / 20 - 4) <= 0.6, `nach ${((wieder - gelandet) / 20).toFixed(1)} s am Boden steigt sie wieder auf`);
  check(b.lp < lp0, `am Boden trifft sie der Nahkampf (${lp0 - b.lp} Schaden)`);
  const A = BOSSE.sturmschwinge.phasen[0].ansagen.find((a) => a.name === "Sturmböe"), x0 = h.x, y0 = h.y; b.x = h.x; b.y = h.y - 1.2; b.ansage = { t: 0, felder: [[Math.floor(h.x) + 0.5, Math.floor(h.y) + 0.5]], a: A }; s["ansageTreffen"](b);
  check(Math.hypot(h.x - x0, h.y - y0) >= 1, `Sturmböe schiebt den Helden weg (${Math.hypot(h.x - x0, h.y - y0).toFixed(1)} Felder)`); }

console.log("\nDie Frostwitwe");
{ const { s, h, b } = kampf("frostwitwe", "nah", 75, (D) => (x) => x === D.danach); h.max = h.lp = 1e6;
  const A = BOSSE.frostwitwe.phasen[0].ansagen.find((a) => a.name === "Eisfeld"), feld = () => [[Math.floor(h.x) + 0.5, Math.floor(h.y) + 0.5]];
  b.ansage = { t: 0, felder: feld(), a: A }; s["ansageTreffen"](b);
  check(h.langsamT > 0 && h.betaeubt <= 0, `Eisfeld: verlangsamt (${h.langsamT.toFixed(1)} s), noch nicht erstarrt`);
  b.ansage = { t: 0, felder: feld(), a: A }; s["ansageTreffen"](b);
  check(h.betaeubt > 0, `wer noch langsam auf dem Eis steht, erstarrt (${h.betaeubt.toFixed(1)} s)`);
  h.betaeubt = 0; h.langsamT = 0; b.lp = Math.round(b.max * 0.5); schritte(s, 20 * 6, (i) => { if (i % 20 === 0) s.eingabe({ t: "ziel", id: b.id }, h.id); });
  check(s.wesen.filter((w) => w.typ === "eissplitter_waechter" && w.instanz === b.instanz).length === 2, "ab 60 %: zwei Eissplitter-Wächter"); }

console.log("\nRüstung der Stufe 70 (Entscheidung des Nutzers: defensiv schwächer als Mythisch, Angriffsboni in den Teilen, kein Set-Bonus)");
{ const alle = Object.values(RUESTUNG_STUFE70).flat(), V = { steinvogt_helm: "eisenwachthelm_mythisch", steinvogt_platte: "eisenwacht_mythisch", steinvogt_beinschienen: "eisenbeinschienen_mythisch",
    sturmfeder_haube: "jaegerkapuze_mythisch", sturmfeder_wams: "jaegerwams_mythisch", sturmfeder_hose: "jaegerhose_mythisch", frostschleier_kapuze: "magierkapuze_mythisch", frostschleier_robe: "magierrobe_mythisch", frostschleier_rock: "magierrock_mythisch" };
  check(alle.length === 9 && !alle.some((g) => G[g].platz === "nebenhand") && alle.every((g) => G[g] && G[g].platz && G[g].anforderung && G[g].anforderung.skill === "defense" && G[g].anforderung.level === 70 && !G[g].untauschbar),
    "neun Teile, je drei: Löwenwacht, Sturmfeder, Frostschleier (kein Schild), Defense 70, handelbar");
  check(["Löwenwacht-Helm", "Löwenwacht-Harnisch", "Löwenwacht-Beinschutz"].every((n, i) => G[RUESTUNG_STUFE70.steinvogt[i]].name === n), "der Nahkampf-Satz heißt Löwenwacht (Helm, Harnisch, Beinschutz)");
  const summe = (a) => a.nah + a.fern + Math.max(0, a.magie), q = alle.map((g) => summe(G[g].abwehr) / summe(G[V[g]].abwehr));
  check(q.every((x) => x >= 0.75 && x <= 0.92), `Abwehr etwa 85 % von Mythisch (${Math.min(...q).toFixed(2)}–${Math.max(...q).toFixed(2)})`);
  const bon = (satz, k) => RUESTUNG_STUFE70[satz].map((g) => (G[g].bonus || {})[k] || 0);
  check(bon("steinvogt", "staerke").join() === "2,3,3" && bon("sturmfeder", "fernStaerke").join() === "2,3,3" && bon("frostschleier", "magieSchaden").join() === "1,2,2",
    "Angriffsboni: Löwenwacht +2/+3/+3 Stärke (8), Sturmfeder +2/+3/+3 Fernkampf-Stärke (8), Frostschleier +1/+2/+2 % Magieschaden (5)");
  check(!["steinvogt", "sturmfeder", "frostschleier"].some((s) => SETS[s]) && Object.values(SETS).every((S) => !S.teile.some((t) => alle.includes(t))), "kein Set-Bonus für die Sätze der Stufe 70");
  const X = L(99), mag = (beine) => kampfwerte(X, { waffe: "sternenszepter_mythisch", kopf: "frostschleier_kapuze", brust: "frostschleier_robe", beine }).waffe.schaden[1];
  const voll = mag("frostschleier_rock"), ohneAlles = kampfwerte(X, { waffe: "sternenszepter_mythisch" }).waffe.schaden[1];
  check(voll > ohneAlles, `Frostschleier: Magie-Max-Hit ${voll} statt ${ohneAlles} (+5 % Magieschaden)`);
  const nah = (a) => kampfwerte(X, { waffe: "eidschwert_mythisch", ...a }).waffe.schaden[1];
  check(nah({ kopf: "steinvogt_helm", brust: "steinvogt_platte", beine: "steinvogt_beinschienen" }) > nah({ kopf: "eisenwachthelm_mythisch", brust: "eisenwacht_mythisch", beine: "eisenbeinschienen_mythisch" }),
    "Löwenwacht: höherer Nahkampf-Max-Hit als die mythische Eisenwacht (+8 Stärke)");
  let aus70 = 0; for (let i = 0; i < 400; i++) { const g = beuteAufloesen("@mythisch", Math.random); if (g && G[g].anforderung && G[g].anforderung.level >= 70) aus70++; }
  check(aus70 === 0, "„@mythisch“ gibt nie Stufe-70-Teile (nur von den Hütern)"); }

console.log("\nGlutsteinschild (Entscheidung des Nutzers): Drop der Sandmutter, nur stark, 1 : 60 (Ausgabe 1, vorher 1 : 100)");
{ const S = G.glutsteinschild, R = MONSTER.sandmutter.drops.find((d) => d.stark && d.wurf.some((w) => w.g === "glutsteinschild"));
  check(S && S.platz === "nebenhand" && S.seltenheit === "selten" && S.anforderung.level === 40 && S.abwehr.nah === 34 && S.bonus.geschick === 5 && S.bonus.staerke === 3 && !S.untauschbar && S.ebenen[0] === "schild.glutstein",
    "seltener Schild, Defense 40, Abwehr 34/34/−1, +5 Geschick, +3 Stärke, handelbar, Ebene schild.glutstein");
  check(Object.values(G).filter((g) => g.platz === "nebenhand" && g.bonus && (g.bonus.geschick || g.bonus.staerke)).length === 1, "der einzige Schild mit Angriffsboni");
  check(R && R.wurf.length === 1 && Math.abs(R.wurf[0].chance - 100 / 60) < 1e-9, "Sandmutter: eigener Wurf nur in der starken Fassung, 1 : 60"); }

console.log("\nBeute: Rüstung nur in der starken Fassung, insgesamt 1 : 75 je Sieg");
for (const H of HUETER) { const R = MONSTER[H.typ].drops.find((d) => d.stark), satz = { grumhold: "steinvogt", sturmschwinge: "sturmfeder", frostwitwe: "frostschleier" }[H.typ];
  const sum = R ? R.wurf.reduce((a, w) => a + w.chance, 0) : 0, gleich = R && R.wurf.every((w) => Math.abs(w.chance - R.wurf[0].chance) < 1e-9);
  check(R && Math.abs(sum - 100 / 75) < 1e-9 && gleich && R.wurf.map((w) => w.g).join() === RUESTUNG_STUFE70[satz].join(),
    `${MONSTER[H.typ].name}: nur sein Satz (${RUESTUNG_STUFE70[satz].length} Teile, je ${(100 / 75 / RUESTUNG_STUFE70[satz].length).toFixed(3)} %), zusammen 1 : 75`); }
{ const R = MONSTER.grumhold.drops.find((d) => d.stark), alt = R.wurf.map((w) => w.chance); R.wurf.forEach((w) => (w.chance = 100 / R.wurf.length)); /* zur Probe sicher */
  const sieg = (an) => { const { s, h, b } = kampf("grumhold", "nah", 75, an); s["anteile"].set(b.id, new Map([[h.id, b.max]])); s["abziehen"](b, 1e9, h);
    return (s.zustand().ev || []).filter((e) => e.a === "beute").flatMap((e) => e.g.map((x) => x[0])); };
  const q = sieg((D) => (x) => x === D.schalter), st = sieg((D) => (x) => x === D.danach);
  check(!q.some((g) => RUESTUNG_STUFE70.steinvogt.includes(g)) && q.includes("splitter"), `in der Quest-Fassung (H4): keine Rüstung, sonst Beute (${q.join(", ")})`);
  check(st.some((g) => RUESTUNG_STUFE70.steinvogt.includes(g)), `in der starken Fassung: der Rüstungswurf zählt (${st.join(", ")})`);
  R.wurf.forEach((w, i) => (w.chance = alt[i])); }

console.log("\nQuest-Bausteine H1–H4");
{ const st = WEGSTEIN_ZIELE.find((z) => z.id === "steinhag");
  check(st && st.quest === H_QUESTS.h1, `H1: Wegstein-Ziel Steinhag nach ${H_QUESTS.h1}`);
  const K = rezept("kaeselaib"), Gh = rezept("grubenstempel");
  check(K && K.station === "herd" && K.level === 45 && K.quest === H_QUESTS.h2 && K.zutaten.some((z) => z.g.includes("ziegenmilch") && z.n === 3) && K.zutaten.some((z) => z.g.includes("lab")) && G.kaeselaib && VERBRAUCH.kaeselaib && G.lab,
    `H2: Käselaib aus 3 Ziegenmilch und Lab am Herd (Kochen ${K && K.level}, über ${H_QUESTS.h2})`);
  check(Gh && Gh.station === "werkbank" && Gh.level === 45 && Gh.quest === H_QUESTS.h3 && G.grubenstempel && G.grubenstempel.untauschbar && G.erzprobe_leuchtend && G.eisrunen_abschrift,
    `H3/H4: Grubenstempel an der Werkbank (Handwerk ${Gh && Gh.level}), leuchtende Erzprobe, Abschrift der Eisrunen`);
  const T = TUEREN.find((x) => x.id === "bergwerk_stollen"), U = KARTEN.welt.ursprung, zellen = [];
  if (T) for (let x = T.feld[0]; x <= T.feld[2]; x++) for (let y = T.feld[1]; y <= T.feld[3]; y++) zellen.push(begehbar(x + 0.5 - U[0], y + 0.5 - U[1]));
  check(T && T.schalter === H_SCHALTER.stollen && zellen.filter(Boolean).length >= 3, `H3: eingestürzter Stollen vor der Urkammer (${zellen.filter(Boolean).length} gangbare Felder im Raster – die Tür sperrt je Spieler, Schalter ${T && T.schalter})`);
  check(HUETER.map((H) => H.schalter).join() === [H_SCHALTER.grumhold, H_SCHALTER.sturmschwinge, H_SCHALTER.frostwitwe].join(), "H4: Schalter der drei Hüter wie in shared/hochlande.ts"); }

console.log("\nBoss-Regeln (#175): Großangriffe angezeigt und vermeidbar, Schläger und Taktiker, Schwächefenster");
check(BOSSE.grumhold.art === "schlaeger" && BOSSE.sturmschwinge.art === "schlaeger" && BOSSE.frostwitwe.art === "taktiker", "Grumhold und Sturmschwinge sind Schläger, die Frostwitwe ist Taktikerin");
check(HUETER.every((H) => MONSTER[H.typ].stufe > 115), "jeder Hüter liegt über dem höchsten Heldenlevel (etwa 115)");
/** Starke Fassung: warten, bis der Boss einen Großangriff auf das Feld des Helden ansagt; ausweichen = vor dem Einschlag auf ein Feld außerhalb */
function grossangriff(typ, stil, ausweichen) {
  const K = kampf(typ, stil, 75, (D) => (x) => x === D.danach), { s, U, id, h, b } = K; if (!b) return null;
  s.eingabe({ t: "ziel", id: b.id }, id); let A = null;
  for (let n = 0; n < 20 * 120 && !A; n++) { h.lp = h.max; s.schritt(); for (const e of s.zustand().ev || []) if (e.a === "ansage" && e.id === b.id && e.felder.some(([x, y]) => Math.floor(x) === Math.floor(h.x) && Math.floor(y) === Math.floor(h.y))) A = e; }
  if (!A) return null; const auf = new Set(A.felder.map(([x, y]) => Math.floor(x) + "," + Math.floor(y)));
  if (ausweichen) { let ziel = null; for (let r = 1; r <= 6 && !ziel; r++) for (let dx = -r; dx <= r && !ziel; dx++) for (let dy = -r; dy <= r && !ziel; dy++) { const x = Math.floor(h.x) + dx + 0.5, y = Math.floor(h.y) + dy + 0.5;
      if (!auf.has(Math.floor(x) + "," + Math.floor(y)) && begehbar(x, y) && Math.hypot(x - b.x, y - b.y) > 1.2) ziel = { x, y }; }
    if (ziel) { h.x = ziel.x; h.y = ziel.y; h.pfad = []; } }
  h.lp = h.max; const vor = h.lp; let n = 0, zeit = 0; const verwundbar = [];
  for (; n < 20 * 5 && b.ansage; n++) { if (ausweichen) { h.zielId = 0; h.pfad = []; } /* draußen stehen bleiben, nicht zurück an den Boss laufen */ s.schritt(); zeit += 0.05; for (const e of s.zustand().ev || []) if (e.a === "text" && e.id === b.id && /verwundbar/.test(e.t)) verwundbar.push(e); }
  return { A, verlust: vor - h.lp, vorlauf: A.t, verwundbar: verwundbar.length > 0, schwach: b.boss && b.boss.schwachBis > s.zeit, s, b, h }; }
{ const G = grossangriff("grumhold", "magie", false), A = G && BOSSE.grumhold.phasen[0].ansagen.find((a) => a.name === G.A.name);
  check(G && G.vorlauf >= 1 && A && G.verlust >= A.schaden[0], `Schläger, stehen geblieben: ${G ? `„${G.A.name}“ ${G.vorlauf} s vorher angezeigt, trifft voll (${G.verlust} LP)` : "kein Großangriff"}`);
  check(G && !G.verwundbar && !G.schwach, "… und kein Schwächefenster"); }
{ const G = grossangriff("grumhold", "magie", true);
  check(G && G.verlust === 0, `Schläger, ausgewichen: kein Schaden (${G ? G.verlust : "–"} LP)`);
  check(G && G.verwundbar && G.schwach, `danach Schwächefenster (${SCHWAECHE.sek} s, +${Math.round((SCHWAECHE.mal - 1) * 100)} %): „verwundbar!“`);
  if (G) { const { s, b, h } = G; b.boss.schwachBis = s.zeit + 1; const l0 = b.lp; s.abziehen(b, 100, h); const mit = l0 - b.lp; b.boss.schwachBis = s.zeit - 1; const l1 = b.lp; s.abziehen(b, 100, h); const ohne = l1 - b.lp;
    check(mit === Math.round(100 * SCHWAECHE.mal) && ohne === 100, `im Schwächefenster trifft man den Boss stärker (${ohne} → ${mit})`); } }
{ const G = grossangriff("frostwitwe", "nah", true), A = G && BOSSE.frostwitwe.phasen[0].ansagen.find((a) => a.name === G.A.name);
  check(G && A && G.verlust >= 1 && G.verlust <= Math.ceil(A.schaden[1] * STREIF_ANTEIL), `Taktikerin, ausgewichen: Streifschaden ${G ? G.verlust : "–"} LP (höchstens ${A ? Math.ceil(A.schaden[1] * STREIF_ANTEIL) : "?"} = ${STREIF_ANTEIL * 100} % des vollen Treffers, Rüstung mindert)`);
  check(G && G.schwach, "… auch bei ihr danach das Schwächefenster"); }
console.log(f ? `\nHüter (#160): ${f} FEHLER` : "\nHüter (#160): alles in Ordnung");
process.exit(f ? 1 : 0);
