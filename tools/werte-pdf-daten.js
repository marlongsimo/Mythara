/*
 * Liest die Werte der fünf Helden für den Echtzeit-Umbau und der Knochenwächter aus dem Regelwerk des Würfelspiels (Zehn-Stufen-Modell)
 * und gibt sie als JSON aus. Aufruf: node tools/werte-pdf-daten.js > daten.json   (danach tools/werte-pdf.py)
 */
const R = require("../js/regeln.js"), F = R.FD; F.STUFEN10.aktiv = true;
const HELDEN = ["schildwaechter", "elementarist", "lichtbringer", "assassine", "kopfgeldjaeger"];
const ATTR = { STR: "Stärke", GES: "Geschicklichkeit", KON: "Konstitution", INT: "Intelligenz", WEI: "Weisheit", CHA: "Charisma" };
const aus = { xp: F.XP_BIS, attr: ATTR, helden: [] };
for (const fid of HELDEN) {
  const d = F.FIGUREN[fid], k = F.KLASSEN[d.klasse], haupt = F.hauptAttr(fid), roh = d.faehig.concat(F.KLASSE_FAEHIG[d.klasse]);
  const stufen = F.stufenpfad(fid).map((p) => { const s = p.stufe, w = F.werteVon(fid, s), pl = F.plaetzeVon(s);
    return { stufe: s, tp: F.tpVon(fid, s), rk: F.rkVon(fid, s), uebung: F.uebung(s), haupt: w[haupt], mod: F.mod(w[haupt]), plaetze: k.plaetze ? pl : null, werte: p.werte, neu: p.neu.map((n) => n.name), verbesserung: p.verbesserung, meister: p.meister, titel: p.titel }; });
  // Fähigkeiten: Grundtext aus den Rohdaten (ohne die späteren Verbesserungen), dazu ab welcher Stufe im Zehn-Stufen-Modell
  const faehig = roh.map((a) => ({ name: a.name, typ: a.typ, ab: F.neuAb(a.ab), text: a.text, reichweite: a.reichweite || null, schaden: a.schaden || null, heilung: a.heilung || null, attr: a.attr || null, rettung: a.rettung || null, pro: a.pro || null, platz: a.platz || null, fern: Boolean(a.fern), form: a.form || null, groesse: a.groesse || null, zustand: a.zustand || null, dauer: a.dauer || null, anzahl: a.anzahl || null, ziele: a.ziele || null, brennt: a.brennt || null, halb: Boolean(a.halb), wucht: Boolean(a.wucht), plusStufe: Boolean(a.plusStufe), plusAttr: a.plusAttr || null, gerissen: Boolean(a.gerissen) }));
  aus.helden.push({ fid, name: d.name, titel: d.titel, klasse: k.name, rolle: d.rolle, spruch: d.spruch, werte: d.werte, haupt, ruestung: d.ruestung, bewegung: k.bewegung, trefferwuerfel: k.wuerfel, rettung: k.rettung, merkmal: k.merkmal, meistertitel: (F.AUFSTIEG[fid] || {}).titel || "", stufen, faehig });
}
const g = R.GEGNER.knochenwaechter, beg = Object.keys(R.BEGEGNUNGEN).filter((b) => R.BEGEGNUNGEN[b].gegner.some((x) => x[0] === "knochenwaechter")).map((b) => ({ name: R.BEGEGNUNGEN[b].name, stufe: R.BEGEGNUNGEN[b].stufe, mit: R.BEGEGNUNGEN[b].gegner.map((x) => R.GEGNER[x[0]].name) }));
// Beispiel: so viele stehen in der Gruft je Gruppengröße (Stufe 2 der Kampagne), mit ihren Lebenspunkten
const gruft = [3, 4, 5, 6].map((n) => { const st = R.neuesSpiel(7, { figuren: F.REIHE.slice(0, n), stufenListe: F.REIHE.slice(0, n).map(() => 2), begegnung: "gruft" }), m = st.figuren.filter((f) => f.art === "knochenwaechter"); return { helden: n, anzahl: m.length, tp: m[0] ? m[0].tpMax : 0 }; });
aus.skelett = { name: g.name, tp: g.tp, rk: g.rk, werte: g.werte, angriff: g.angriff, bewegung: g.bewegung != null ? g.bewegung : 6, untot: Boolean(g.untot), anfaellig: g.anfaellig || "", xp: g.xp, begegnungen: beg, gruft };
process.stdout.write(JSON.stringify(aus));
