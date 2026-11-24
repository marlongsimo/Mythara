/*
 * Mythara – Kampfregeln v3 mit OSRS-Würfen (shared/kampfwerte.ts + shared/sim.ts) ohne Server:
 * Formeln aus den Balancing-Dokumenten, Startausrüstung, Angriffsstile, Tick-Takt (0,5 s), XP nach Stil, Bandit mit festen Werten,
 * und viele Duelle Held Level 1 gegen Bandit Level 1 je Waffe und Stil (Siegquote, Dauer, Trefferquoten).
 * Aufruf: node test/kampf-v2.test.mjs   (nach node build.mjs)
 */
import { fels, karteJetzt, Sim, KARTEN, FEIN, setzeKarte, STAERKE, MONSTER, kampfwerte, xpFuer, levelAus, heldenlevel, maxLp, startAusruestung, trefferChance, NULL_XP, schadenWurf, maxHit, maxHitMagie, gegnerWerte, STILE, SKILLS } from "./sim.gebaut.mjs";
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
const nah = (a, b) => Math.abs(a - b) < 1e-9, NULL = { ...NULL_XP };

/* 1. Formeln und Startausrüstung (Kampfregeln v3) */
{ const soll = { 2: 71, 3: 148, 5: 330, 10: 981, 20: 3800, 30: 11359, 50: 86133, 75: 1028858, 92: 5539665, 99: 11079266, 100: 12232486 };
  check(Object.entries(soll).every(([L, x]) => xpFuer(+L) === x) && SKILLS.every((k) => xpFuer(50, k) === 86133), "XP-Kurve: 85 % OSRS an allen geprüften Leveln wie in der Tabelle (2 → 71 … 99 → 11.079.266, 100 → 12.232.486), für alle sechs Skills dieselbe");
  check(levelAus(70) === 1 && levelAus(71) === 2 && levelAus(981) === 10 && levelAus(1e9) === 100 && heldenlevel({ ...NULL, geschick: xpFuer(8), staerke: xpFuer(8), lp: xpFuer(8), defense: xpFuer(8) }) === 10 && heldenlevel(NULL) === 3 && heldenlevel({ geschick: xpFuer(99), staerke: xpFuer(99), fernkampf: xpFuer(99), magie: xpFuer(99), lp: xpFuer(99), defense: xpFuer(99) }) === 113 && heldenlevel({ ...NULL, fernkampf: xpFuer(30) }) === 17, "Level aus XP; Heldenlevel wie das OSRS-Combat-Level ohne Prayer (neuer Held mit LP 10 → 3; Fernkampf 30 → 17; alles 99 → 113)");
  check(maxLp(0) === 10 && maxLp(xpFuer(11) - xpFuer(10)) === 11 && maxLp(xpFuer(99) - xpFuer(10)) === 99 && levelAus(0, "lp") === 10, "Lebenspunkte starten auf Level 10; Max-LP = LP-Level (10 → 10 LP, 99 → 99 LP)");
  check(maxHit(99, 0, 114) === 30 && maxHit(99, 3, 114) === 31 && maxHit(1, 0, 114) === 3 && maxHit(50, 0, 114) === 16 && maxHit(50, 3, 150) === 20 && maxHit(99, 3, 150) === 37 && maxHit(1, 0, 5) === 1 && maxHit(1, 3, 5) === 1 && maxHit(99, 0, 5) === 12 && maxHit(99, 3, 5) === 12, "Max Hit Nahkampf: alle Referenzwerte des Dokuments (99/+114 → 30/31, 50/+114 → 16, 99/+150 aggressiv → 37, Startschwert 1 → 1, 99 → 12)");
  check([1, 10, 25, 50, 75, 99].map((L) => maxHit(L, 3, 10) + "/" + maxHit(L, 0, 10)).join(" ") === "1/1 2/2 4/4 7/7 10/10 13/12", "Max Hit Fernkampf mit Fernkampf-Stärke +10: Tabelle des Dokuments (Akkurat/Schnell: 1, 2, 4, 7, 10, 13/12)");
  check(STILE.nah.map((x) => x.name).join() === "Akkurat,Ausgewogen,Aggressiv,Verteidigung" && STILE.fern.map((x) => x.name).join() === "Akkurat,Schnell,Fern" && STILE.magie.map((x) => x.name).join() === "Akkurat,Schnell,Defensiv", "Stile: Nahkampf 4, Fernkampf 3, Magie 3");
  const k = kampfwerte({ ...NULL, defense: xpFuer(5), magie: xpFuer(3) }, startAusruestung("schwert"), 0); check(k.abwehr.nah === 13 * 70 && k.abwehr.fern === 13 * 70 && k.abwehr.magie === (2 + 3) * 63 && k.max === 10, `Abwehr (OSRS): Nah/Fern = (Defense 5 + 8) × (Schild 6 + 64), Magie = (⌊0,7 × 3⌋ + ⌊0,3 × 13⌋) × (−1 + 64) (${k.abwehr.nah}/${k.abwehr.fern}/${k.abwehr.magie}), Max-LP 10`); }
{ const k = [0, 1, 2, 3].map((s) => kampfwerte(NULL, startAusruestung("schwert"), s));
  check(k.map((x) => x.angriff.nah).join() === "852,710,639,639", `Schwert L1 (OSRS): Angriffswurf (Geschick 1 + Stil + 8) × (7 + 64) → Akkurat 852 · Ausgewogen 710 · Aggressiv 639 · Verteidigung 639 (${k.map((x) => x.angriff.nah).join("/")})`);
  check(k.every((x) => x.waffe.schaden.join() === "1,1" && x.waffe.ticks === 3), "Schwert L1: Max Hit 1 in allen Stilen (Kontrollwert des Dokuments), 3 Ticks");
  check(k.map((x) => x.abwehr.nah).join() === "630,700,630,840" && k.map((x) => x.abwehr.magie).join() === "126,189,126,189", `Mit Schild (OSRS): Abwehr (Defense 1 + Stil + 8) × (6 + 64) → 630/700/630/840; gegen Magie (⌊0,7 × Magie⌋ + ⌊0,3 × eff. Defense⌋) × (−1 + 64) (${k.map((x) => x.abwehr.nah).join("/")} · ${k.map((x) => x.abwehr.magie).join("/")})`);
  const a = (st, s) => kampfwerte({ ...NULL, geschick: xpFuer(50), staerke: xpFuer(st) }, { waffe: "ritterschwert" }, s);
  check(a(50, 2).waffe.schaden[1] === 7 && a(50, 0).waffe.schaden[1] === 6 && a(50, 0).angriff.nah === 61 * 71 && a(50, 2).angriff.nah === 58 * 71, "Stärke 50, Schwert +6: Max Hit 6, aggressiv 7; Akkurat erhöht nur den Angriffswurf (61 × 71 statt 58 × 71)");
  check(kampfwerte(NULL, startAusruestung("schwert"), 7).stil === 1 && kampfwerte(NULL, startAusruestung("bogen"), 3).stil === 1, "Unbekannter Stil (z. B. Nahkampf-Stil 3 mit Bogen) → Standard"); }
{ const k = [0, 1, 2].map((s) => kampfwerte(NULL, startAusruestung("bogen"), s));
  check(k.map((x) => x.angriff.fern).join() === "888,666,666" && k.every((x) => x.waffe.schaden.join() === "1,1"), `Kurzbogen L1 (OSRS): Angriffswurf (Fernkampf 1 + Stil + 8) × (Bogen 8 + Leder 2 + 64) → Akkurat 888, sonst 666; Max Hit 1 (${k.map((x) => x.angriff.fern).join("/")})`);
  check(k.map((x) => x.waffe.ticks).join() === "4,3,4" && k.map((x) => x.waffe.reich).join() === "6,6,8" && k.map((x) => x.abwehr.nah).join() === "657,657,876", "Kurzbogen: Akkurat 4 Ticks / 6 Felder · Schnell 3 / 6 · Fern 4 / 8 und +3 Defense (Abwehr 9 × 73 → 12 × 73)");
  const h = kampfwerte({ ...NULL, fernkampf: xpFuer(99) }, { waffe: "jagdbogen" }, 0); check(h.waffe.schaden[1] === 12 && kampfwerte({ ...NULL, fernkampf: xpFuer(99) }, { waffe: "jagdbogen" }, 1).waffe.schaden[1] === 12, "Fernkampf 99, Trainingsbogen (Pfeilstärke +7): Max Hit 12 – der Skill erhöht den Schaden"); }
{ const k = [0, 1, 2].map((s) => kampfwerte(NULL, startAusruestung("stab"), s));
  check(k.map((x) => x.angriff.magie).join() === "924,693,770" && k.map((x) => x.waffe.ticks).join() === "5,4,5" && k.every((x) => x.waffe.reich === 6) && k.map((x) => x.abwehr.nah - k[1].abwehr.nah).join() === "0,0,192", "Stab L1 (OSRS): Angriffswurf (Magie 1 + Stil + 8) × (Stab 10 + Robe 3 + 64) → Akkurat 924 · Schnell 693 · Defensiv 770; Schnell 4 Ticks, sonst 5; Defensiv +3 Defense");
  check(k.every((x) => x.waffe.schaden.join() === "1,1" && schadenWurf(x.waffe, 0.999) === 1), "Stab L1 (Magie-Stärke +10): Max Hit 1 in allen Stilen");
  check([3, 0, 1].map((b) => maxHitMagie(50, b, 10)).join() === "6,6,6" && kampfwerte({ ...NULL, magie: xpFuer(50) }, { waffe: "hirtenstab" }, 0).waffe.schaden[1] === 6, "Magie-Max-Hit: Level 50, Magie-Stärke +10 → 6 / 6 / 6 (Beispiel aus der Vorgabe); effektive Magie ohne +8"); }
{ const B = MONSTER.bandit_dolch, g = gegnerWerte(B.v2, "nah"); check(B.lp === 6 && B.v2.geschick === 1 && B.v2.staerke === 1 && B.v2.defense === 1 && B.v2.ticks === 4 && g.treffer === 640 && g.maxHit === 1 && g.abwehr.nah === 640 && g.abwehr.fern === 640 && g.abwehr.magie === 640 && B.angriff.reich === 1.5, `Bandit (OSRS-Monster Level 1, ohne Boni): Angriffswurf (1 + 9) × 64 = ${g.treffer}, Max Hit ${g.maxHit}, Abwehr ${g.abwehr.nah}/${g.abwehr.fern}/${g.abwehr.magie}, 6 LP, 4 Ticks`);
  const A = { nah: 0, fern: 0, magie: 0 }, mh = (v, art) => gegnerWerte({ ticks: 4, abwehr: A, ...v }, art).maxHit;
  check(mh({ staerke: 5 }, "nah") === 1 && mh({ staerke: 6 }, "nah") === 2 && mh({ staerke: 99 }, "nah") === 11 && mh({ fernkampf: 50 }, "fern") === 6 && mh({ magie: 50 }, "magie") === 5 && gegnerWerte({ fernkampf: 20, ticks: 4, abwehr: A }, "fern").treffer === 29 * 64
    && gegnerWerte({ defense: 10, magie: 5, ticks: 4, abwehr: { nah: 3, fern: -2, magie: 4 } }, "nah").abwehr.fern === 19 * 62 && gegnerWerte({ defense: 10, magie: 5, ticks: 4, abwehr: { nah: 3, fern: -2, magie: 4 } }, "nah").abwehr.magie === 14 * 68,
    "Gegner wie OSRS-Monster: effektives Level = Level + 9 (Stärke 6 → Max Hit 2, 99 → 11; Fernkampf 50 → 6; Magie 50 → 5); Würfe (Level + 9) × (Bonus + 64), gegen Magie das Magie-Level"); }

/* 2. Simulation: Duelle in der Weltzone (eigene Gegnerwerte) */
const K = KARTEN.kreuzwald; setzeKarte(K, FEIN);
function duell(seed, waffe, stil) {
  STAERKE.lp = 2.2; STAERKE.schaden = 1.7; /* absichtlich verstellt: Weltzonen mit eigenen Werten dürfen das nicht spüren */
  const s = Sim.welt(seed, undefined, true); for (const g of s.wesen.filter((w) => !w.held)) { g.streifT = 1e9; g.pfad = []; g.x = g.heim.x = 5 + (g.id % 7) * 0.3; g.y = g.heim.y = 150; }
  const b = s.wesen.find((w) => !w.held && /bandit/.test(w.typ)), E = { x: 112, y: 6 }; b.x = b.heim.x = E.x; b.y = b.heim.y = E.y; b.wach = false;
  const fern = waffe !== "schwert", h = s.nach(s.beitreten("schildwaechter", 0, { x: E.x - (fern ? 5 : 1.2), y: E.y }, kampfwerte(NULL, startAusruestung(waffe), stil)));
  return { s, b, h };
}
/* Tick-Takt: alle Angriffe fallen auf ganze 0,5 s, Abstand = Takt */
{ const { s, b, h } = duell(3, "schwert", 1); s.eingabe({ t: "ziel", id: b.id }, h.id); const zeitH = [], zeitB = [];
  for (let i = 0; i < 20 * 20 && !b.tot && !h.tot; i++) { s.schritt(); for (const e of s.zustand().ev) if (e.a === "hieb") (e.id === h.id ? zeitH : zeitB).push(s.tick); }
  const aufTick = (l) => l.every((t) => t % 10 === 0), abst = (l) => l.slice(1).map((t, i) => (t - l[i]) / 20);
  check(zeitH.length > 3 && aufTick(zeitH) && aufTick(zeitB), `Alle Angriffe fallen auf einen Kampf-Tick (0,5 s): Held ${zeitH.length}, Bandit ${zeitB.length} Angriffe`);
  check(abst(zeitH).every((d) => d === 1.5) && abst(zeitB).every((d) => d === 2), `Takt: Schwert alle 1,5 s (3 Ticks) · Dolch alle 2,0 s (4 Ticks) – ${[...new Set(abst(zeitH))].join("/")} s · ${[...new Set(abst(zeitB))].join("/")} s`); }
/* Aggro: höchstens 15 Minuten, dann erst wieder nach 20 Feldern Abstand (oder neuem Betreten der Region) */
{ const { s, b, h } = duell(5, "schwert", 1); h.x = b.x - 3; h.y = b.y; b.wach = false; b.zielId = 0;
  const greiftAn = (sek) => { for (let i = 0; i < sek * 20; i++) { s.schritt(); s.zustand(); if (b.zielId === h.id) return true; } return false; };
  check(greiftAn(3), "Ein Held in Aggro-Reichweite wird angegriffen");
  b.zielId = 0; b.wach = false; b.pfad = []; b.x = b.heim.x; b.y = b.heim.y; h.x = b.x - 3; h.lp = h.max; h.aggroZeit = 15 * 60;
  check(!greiftAn(4), "Nach 15 Minuten am selben Ort greift der Bandit nicht mehr von selbst an");
  h.x = b.x - 1.2; s.eingabe({ t: "ziel", id: b.id }, h.id); check(greiftAn(6), "Wird er selbst angegriffen, wehrt er sich trotzdem"); s.eingabe({ t: "ziel", id: 0 }, h.id);
  b.zielId = 0; b.wach = false; b.pfad = []; b.lp = b.max; b.x = b.heim.x; b.y = b.heim.y; h.aggroZeit = 15 * 60; h.x = b.x - 24; s.schritt(); h.x = b.x - 3; h.lp = h.max;
  check(greiftAn(4), `20 Felder weg und zurück: der Zähler beginnt neu, der Bandit greift wieder an (Zähler ${(h.aggroZeit ?? 0).toFixed(1)} s)`); }
/* Autoangriff und Hinlaufen: an = wer mich angreift, bekommt Antwort; aus = nur angeklickte Gegner; Gegner anklicken = hinlaufen und angreifen */
{ const hiebe = (s, id, sek) => { let n = 0; for (let i = 0; i < sek * 20; i++) { s.schritt(); for (const e of s.zustand().ev) if (e.a === "hieb" && e.id === id) n++; } return n; };
  { const { s, b, h } = duell(11, "schwert", 1); b.zielId = h.id; b.wach = true; check(hiebe(s, h.id, 4) > 0, "Autoangriff an (Standard): der Bandit greift an, der Held schlägt zurück"); }
  { const { s, b, h } = duell(11, "schwert", 1); s.eingabe({ t: "auto", an: false }, h.id); b.zielId = h.id; b.wach = true; check(hiebe(s, h.id, 4) === 0 && b.zielId === h.id, "Autoangriff aus: der Held steht still, obwohl er angegriffen wird");
    s.eingabe({ t: "ziel", id: b.id }, h.id); check(hiebe(s, h.id, 4) > 0, "… bis man den Gegner antippt"); }
  { const { s, b, h } = duell(12, "schwert", 1); s.eingabe({ t: "auto", an: false }, h.id); h.x = b.x - 8; b.aggroReichSperre = true; b.zielId = 0; b.wach = false; h.aggroZeit = 15 * 60; /* Bandit soll nicht selbst kommen */
    const x0 = h.x; s.eingabe({ t: "ziel", id: b.id }, h.id); const n = hiebe(s, h.id, 8);
    check(h.x > x0 + 5 && n > 0, `Gegner 8 Felder weit angetippt: der Held läuft hin (${(h.x - x0).toFixed(1)} Felder) und greift in Reichweite an (${n} Hiebe)`); }
  { const { s, b, h } = duell(13, "bogen", 1); s.eingabe({ t: "auto", an: false }, h.id); h.x = b.x - 12; b.zielId = 0; b.wach = false; h.aggroZeit = 15 * 60; const x0 = h.x;
    s.eingabe({ t: "ziel", id: b.id }, h.id); let d = 0, gelaufen = 0; for (let i = 0; i < 8 * 20 && !d; i++) { s.schritt(); for (const e of s.zustand().ev) if (e.a === "hieb" && e.id === h.id) { d = Math.hypot(b.x - h.x, b.y - h.y); gelaufen = h.x - x0; } }
    check(gelaufen > 3 && d < 6.3 && d > 4.5, `Bogen: läuft nur bis in Schussweite und schießt dann (${gelaufen.toFixed(1)} Felder gelaufen, erster Schuss aus ${d.toFixed(1)} Feldern, Reichweite 6)`); }
  { const { s, b, h } = duell(14, "schwert", 1); h.x = b.x - 8; s.eingabe({ t: "ziel", id: b.id }, h.id); s.schritt(); s.eingabe({ t: "lauf", x: h.x - 3, y: h.y }, h.id); for (let i = 0; i < 40; i++) s.schritt();
    check(h.zielId === 0 && h.x < b.x - 8, "Wegklicken (laufen) bricht den Angriff ab"); } }
{ const s2 = Sim.welt(9, undefined, true), h2 = s2.nach(s2.beitreten("schildwaechter", 0, { x: 50, y: 50 }, kampfwerte(NULL, startAusruestung("schwert"))));
  for (let i = 0; i < 40; i++) s2.schritt(); check(h2.aggroZeit > 1.5 && h2.aggroZeit < 2.5, `Neues Betreten der Region: der Zähler beginnt bei 0 (${h2.aggroZeit.toFixed(2)} s nach 2 s)`); }
/* Sprint im Kampfgebiet: der Server rechnet Tempo und Ausdauer selbst (shared/sprint.ts) */
{ const weg = (an) => { const { s, b, h } = duell(41, "schwert", 1); b.x = b.heim.x = b.x + 80; const x0 = h.x; s.eingabe({ t: "sprint", an, wert: 100 }, h.id); const y0 = h.y; s.eingabe({ t: "richtung", x: 0, y: 1 }, h.id); for (let i = 0; i < 20; i++) s.schritt(); return { weg: h.y - y0, z: s.zustand(h.id).ich.ausdauer }; };
  const n = weg(false), sp = weg(true);
  check(Math.abs(n.weg - 2) < 0.01 && Math.abs(sp.weg - 4) < 0.01 && sp.z && sp.z[1] === 1 && sp.z[0] < 100 && n.z[0] === 100, `Felder: Gehen 1 Feld je Tick, Sprint 2 (${n.weg.toFixed(2)} → ${sp.weg.toFixed(2)} Felder in 1 s), Ausdauer ${sp.z && sp.z[0]} %, Zustand meldet sie`); }
/* Die angelegte Waffe bestimmt die Kampfart – nicht die Startwaffe: Bogen aufheben = Pfeile, Zweihänder = Nahkampf mit 4 Ticks */
{ const kb = kampfwerte(NULL, { waffe: "jagdbogen" }), kz = kampfwerte(NULL, { waffe: "eidzweihaender" }), kd = kampfwerte(NULL, { waffe: "eiddolch_episch" });
  const { s, b, h } = duell(81, "schwert", 1); s.kampfwerteSetzen(h.id, kb); h.x = b.x - 5; b.wach = false; s.eingabe({ t: "ziel", id: b.id }, h.id); let pfeil = false; for (let i = 0; i < 6 * 20 && !pfeil; i++) { s.schritt(); pfeil = s.geschosse.some((g) => g.von === h.id); }
  check(kb.waffe.art === "fern" && pfeil && kz.waffe.art === "nah" && kz.waffe.ticks === 4 && kd.waffe.ticks === 2, `Angelegte Waffe zählt: Schwert-Held mit Bogen schießt Pfeile (${pfeil}), Zweihänder Nahkampf 4 Ticks, Eiddolch (episch) 2 Ticks`); }
/* Eigene Helden bekommen keine alten EP und Stufen (früher: „Aufstieg auf Stufe 5“ im ersten Kampf und dabei volles Leben) */
{ const { s, b, h } = duell(72, "schwert", 2); s.kampfwerteSetzen(h.id, kampfwerte({ ...NULL, geschick: xpFuer(30), staerke: xpFuer(30), defense: xpFuer(30) }, startAusruestung("schwert"), 2)); /* stark genug, um sicher zu gewinnen */ const ev = [];  s.eingabe({ t: "ziel", id: b.id }, h.id); for (let i = 0; i < 30 * 20 && !b.tot && !h.tot; i++) { s.schritt(); for (const e of s.zustand().ev) ev.push(e); }
  const vor = h.lp; for (let i = 0; i < 4; i++) s.schritt(); check(b.tot && !h.tot && !ev.some((e) => e.a === "stufe" || e.a === "ep") && h.lp === vor, `Bandit besiegt: kein alter EP-Aufstieg, Leben bleibt (${h.lp} / ${h.max})`); }
/* Felder und Schräge: schräg kostet wie gerade, Nahkampf nur von N/O/S/W, Fernkampf nach Feldabstand */
{ const mitteOk = (w) => Math.abs(w.x % 1 - 0.5) < 1e-6 && Math.abs(w.y % 1 - 0.5) < 1e-6, F = Math.floor;
  { const { s, b, h } = duell(51, "schwert", 1); b.x = b.heim.x += 80; for (let i = 0; i < 12; i++) s.schritt(); const x0 = h.x, y0 = h.y;
    s.eingabe({ t: "richtung", x: 1, y: 1 }, h.id); for (let i = 0; i < 20; i++) s.schritt(); s.eingabe({ t: "richtung", x: 0, y: 0 }, h.id); for (let i = 0; i < 12; i++) s.schritt();
    check(mitteOk(h) && Math.abs(h.x - x0 - (h.y - y0)) < 1e-6 && h.x - x0 >= 2 && h.x - x0 <= 3, `Schräg gehen: ${(h.x - x0).toFixed(0)} Felder schräg in gut 1 s (wie gerade), danach steht der Held auf einer Feldmitte`); }
  { const { s, b, h } = duell(52, "schwert", 1); s.eingabe({ t: "auto", an: false }, h.id); b.aggroReichSperre = true; b.zielId = 0; b.wach = false; h.aggroZeit = 15 * 60;
    b.x = b.heim.x = 112.5; b.y = b.heim.y = 6.5; h.x = 111.5; h.y = 5.5; for (let i = 0; i < 2; i++) s.schritt();
    s.eingabe({ t: "ziel", id: b.id }, h.id); const lagen = []; for (let i = 0; i < 6 * 20; i++) { s.schritt(); for (const e of s.zustand().ev) if (e.a === "hieb" && e.id === h.id) lagen.push([F(h.x) - F(b.x), F(h.y) - F(b.y)]); }
    check(lagen.length > 0 && lagen.every(([dx, dy]) => Math.abs(dx) + Math.abs(dy) === 1), `Nahkampf schräg daneben: der Held tritt erst auf ein Feld N/O/S/W und schlägt dann (${lagen.length} Hiebe, Lagen ${JSON.stringify([...new Set(lagen.map(String))])})`); }
  { const { s, b, h } = duell(53, "schwert", 1); const lagen = []; s.eingabe({ t: "ziel", id: b.id }, h.id); for (let i = 0; i < 15 * 20 && !b.tot && !h.tot; i++) { s.schritt(); for (const e of s.zustand().ev) if (e.a === "hieb" && e.id === b.id) lagen.push([F(h.x) - F(b.x), F(h.y) - F(b.y)]); }
    check(lagen.length > 0 && lagen.every(([dx, dy]) => Math.abs(dx) + Math.abs(dy) === 1), `Der Bandit schlägt ebenfalls nur von N/O/S/W (${lagen.length} Hiebe)`); }
  { const { s, b, h } = duell(54, "bogen", 1); s.eingabe({ t: "auto", an: false }, h.id); b.aggroReichSperre = true; b.zielId = 0; b.wach = false; h.aggroZeit = 15 * 60;
    b.x = b.heim.x = 112.5; b.y = b.heim.y = 6.5; h.x = 104.5; h.y = 2.5; for (let i = 0; i < 2; i++) s.schritt(); s.eingabe({ t: "ziel", id: b.id }, h.id); let erst = null;
    for (let i = 0; i < 6 * 20 && !erst; i++) { s.schritt(); for (const e of s.zustand().ev) if (e.a === "hieb" && e.id === h.id) erst = Math.max(Math.abs(F(h.x) - F(b.x)), Math.abs(F(h.y) - F(b.y))); }
    check(erst === 6, `Bogen: schießt ab Feldabstand 6 (max(|dx|, |dy|)), auch schräg – erster Schuss aus ${erst} Feldern`); }
  /* Safespot: hinter einer langen Wand (mehr als 4 Felder Umweg) bleibt der Gegner stehen; hinter einem einzelnen Hindernis geht er kurz drumherum */
  { const frei = (i0, j0) => { for (let j = j0 - 6; j <= j0 + 6; j++) for (let i = i0 - 3; i <= i0 + 3; i++) if (fels(i, j)) return false; return true; };
    for (const [lang, text] of [[true, "lange Wand (9 Felder): der Bandit bleibt dahinter stehen (Safespot)"], [false, "einzelnes Hindernis: der Bandit geht kurz drumherum und greift an"]]) {
      const { s, b, h } = duell(60 + Number(lang), "schwert", 1), KS = karteJetzt(); let p = null; for (let j = 20; j < KS.KH - 20 && !p; j++) for (let i = 20; i < KS.KB - 20 && !p; i++) if (frei(i, j)) p = { i, j };
      const wand = []; for (let d = lang ? -4 : 0; d <= (lang ? 4 : 0); d++) { const k = (p.j + d) * KS.KB + p.i; wand.push(k); KS.FELS[k] = 1; }
      s.eingabe({ t: "auto", an: false }, h.id); b.x = b.heim.x = p.i + 1.5; b.y = b.heim.y = p.j + 0.5; h.x = p.i - 0.5; h.y = p.j + 0.5; b.zielId = h.id; b.wach = true;
      let hiebe = 0; const x0 = b.x, y0 = b.y; for (let i = 0; i < 8 * 20; i++) { s.schritt(); b.zielId = h.id; for (const e of s.zustand().ev) if (e.a === "hieb" && e.id === b.id) hiebe++; }
      for (const k of wand) KS.FELS[k] = 0;
      check(lang ? hiebe === 0 && Math.abs(b.x - x0) <= 1 : hiebe > 0, `${text} (${hiebe} Hiebe, Bandit ${(b.x - x0).toFixed(1)}/${(b.y - y0).toFixed(1)} Felder bewegt)`); } } }

/* Lebensregeneration: 1 LP je 100 Game-Ticks (50 s) */
{ const { s, b, h } = duell(31, "schwert", 1); b.x = b.heim.x = b.x + 60; h.lp = 5; let t = 0; const lp0 = h.lp; for (; t < 151 * 20; t++) s.schritt();
  check(h.lp === lp0 + 3, `Regeneration: in 151 s genau 3 LP (5 → ${h.lp}), also 1 LP je 50 s`); }
/* XP nach Stil (v3): je abgezogenem LP die Raten des Stils, dazu 1,33 LP-XP; Bruchteile bleiben als Rest, gebucht werden ganze XP; ein Block gibt keine Defense-XP */
for (const [waffe, stil, soll] of [["schwert", 0, { geschick: 4 }], ["schwert", 1, { geschick: 4 / 3, staerke: 4 / 3, defense: 4 / 3 }], ["schwert", 2, { staerke: 4 }], ["schwert", 3, { defense: 4 }],
  ["bogen", 0, { fernkampf: 4 }], ["bogen", 1, { fernkampf: 4 }], ["bogen", 2, { fernkampf: 2, defense: 2 }], ["stab", 0, { magie: 2 }], ["stab", 1, { magie: 2 }], ["stab", 2, { magie: 4 / 3, defense: 1 }]]) {
  const { s, b, h } = duell(21, waffe, stil); s.eingabe({ t: "ziel", id: b.id }, h.id); let abgezogen = 0, bloecke = 0;
  for (let i = 0; i < 120 * 20 && !b.tot && !h.tot; i++) { h.lp = h.max; s.schritt(); for (const e of s.zustand().ev) { if (e.a === "schaden" && e.id === b.id) abgezogen += e.n; if (e.a === "block" && e.id === h.id) bloecke++; } }
  const x = s.xpAbholen(h.id) || NULL, echt = Math.min(b.max, abgezogen), ok = SKILLS.every((k) => x[k] === Math.floor(echt * ((soll[k] || 0) + (k === "lp" ? 4 / 3 : 0)) + 1e-9));
  check(ok && echt > 0, `XP ${waffe} Stil ${stil} (${STILE[waffe === "schwert" ? "nah" : waffe === "bogen" ? "fern" : "magie"][stil].name}): ${JSON.stringify(x)} für ${echt} abgezogene LP, ${bloecke} Blocks ohne XP`); }
/* viele Duelle: Siegquote */
const ergebnis = [];
for (const [waffe, stil] of [["schwert", 0], ["schwert", 1], ["schwert", 2], ["schwert", 3], ["bogen", 0], ["bogen", 1], ["bogen", 2], ["stab", 0], ["stab", 1], ["stab", 2]]) {
  let siege = 0, dauer = 0, rest = 0, tH = 0, aH = 0, tB = 0, aB = 0; const N = 120;
  for (let seed = 1; seed <= N; seed++) { const { s, b, h } = duell(seed * 7 + stil, waffe, stil); s.eingabe({ t: "ziel", id: b.id }, h.id); let t = 0;
    for (; t < 150 * 20 && !b.tot && !h.tot; t++) { s.schritt(); for (const e of s.zustand().ev) { if (e.id === b.id && (e.a === "schaden" || e.a === "block")) { aH++; if (e.a === "schaden") tH++; } if (e.id === h.id && (e.a === "schaden" || e.a === "block")) { aB++; if (e.a === "schaden") tB++; } } }
    if (b.tot) { siege++; dauer += t / 20; rest += h.lp / h.max; } }
  ergebnis.push({ waffe, stil, siege: siege / N, dauer: dauer / Math.max(1, siege), rest: rest / Math.max(1, siege), qH: tH / Math.max(1, aH), qB: tB / Math.max(1, aB) }); }
console.log("    Waffe   Stil  Siege   Dauer  LP übrig  Held trifft  Bandit trifft");
for (const e of ergebnis) console.log(`    ${e.waffe.padEnd(7)} ${e.stil}    ${(e.siege * 100).toFixed(0).padStart(3)} %  ${e.dauer.toFixed(1).padStart(5)} s  ${(e.rest * 100).toFixed(0).padStart(4)} %     ${(e.qH * 100).toFixed(0).padStart(3)} %        ${(e.qB * 100).toFixed(0).padStart(3)} %`);
{ const sw = ergebnis.find((e) => e.waffe === "schwert" && e.stil === 1); check(Math.abs(sw.qH - trefferChance(710, 640)) < 0.08 && Math.abs(sw.qB - trefferChance(640, 700)) < 0.08, `Trefferquoten wie gerechnet (Ausgewogen): Held 710 gegen 640 → ${(trefferChance(710, 640) * 100).toFixed(0)} %, Bandit 640 gegen 700 → ${(trefferChance(640, 700) * 100).toFixed(0)} %`); }
{ const g = (w) => ergebnis.filter((e) => e.waffe === w).reduce((m, e) => Math.max(m, e.siege), 0); check(g("schwert") >= 0.95 && g("bogen") >= 0.95 && g("stab") >= 0.9, `Ein Held auf Level 1 kann den Bandit schlagen (bester Stil: Schwert ${(g("schwert") * 100).toFixed(0)} %, Bogen ${(g("bogen") * 100).toFixed(0)} %, Stab ${(g("stab") * 100).toFixed(0)} %)`); }
/* Geschossart für die Darstellung (alle Spieler sehen dasselbe): Armbrust → Bolzen, Bogen → Pfeil, Stab → Zauber */
{ const armbrust = kampfwerte(NULL, { waffe: "sternarmbrust_gewoehnlich" }, 0), bogen = kampfwerte(NULL, { waffe: "jagdbogen" }, 0), stab = kampfwerte(NULL, { waffe: "hirtenstab" }, 0);
  check(armbrust.waffe.geschoss === "bolzen" && bogen.waffe.geschoss === "pfeil" && stab.waffe.geschoss === undefined, "Geschossart nach der Waffe: Armbrust Bolzen, Bogen Pfeil, Stab ohne (Zauber)");
  const arten = (waffe, kw) => { const { s, b, h } = duell(77, waffe, 0); h.kw = kw; s.eingabe({ t: "ziel", id: b.id }, h.id); const a = new Set(); for (let i = 0; i < 12 * 20 && !b.tot; i++) { s.schritt(); for (const g of s.zustand().g) a.add(g[3]); } return [...a].join(","); };
  const ab = arten("bogen", kampfwerte(NULL, { waffe: "sternarmbrust_gewoehnlich" }, 0)), bb = arten("bogen", bogen), sb = arten("stab", stab);
  check(ab === "bolzen" && bb === "pfeil" && sb === "blitz", `Der Server schickt die Art mit: Armbrust „${ab}“, Bogen „${bb}“, Stab „${sb}“`); }
console.log(f ? `${f} Prüfung(en) fehlgeschlagen` : "Kampfregeln v3: alles in Ordnung"); process.exit(f ? 1 : 0);
