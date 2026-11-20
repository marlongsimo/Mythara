/* Rabenmoor im Rechner durchgespielt: jeder Held allein auf Stufe 1 und 2, dazu ein Dreierteam auf Stufe 1. Gibt Dauer und Tode aus.
   Ziel: auf Stufe 1 anspruchsvoll (man fällt), aber zu schaffen; auf Stufe 2 deutlich ruhiger. */
import { Sim, HELDEN, HELDENREIHE, KARTEN, FEIN, ORTSTUFE, KAMPFFOLGE, setzeKarte, setzeStaerke, frei, HELDENSTUFE } from "./sim.gebaut.mjs";
const lauf = (k, typ, mit, stufe, seed) => { setzeKarte(KARTEN[k], FEIN); setzeStaerke(ORTSTUFE.rabenmoor, 1 + mit.length); for (const h of Object.keys(HELDENSTUFE)) delete HELDENSTUFE[h]; for (const h of [typ, ...mit]) HELDENSTUFE[h] = stufe;
  const sim = new Sim(typ, seed, mit), h = sim.ich; let tode = 0, warTot = false; if (typ === "lichtbringer") sim.eingabe({ t: "modus" });
  for (let n = 0; n < 20 * 600 && sim.phase !== "sieg"; n++) { if (h.tot && !warTot) tode++; warTot = h.tot;
    if (!h.tot && n % 5 === 0) { let m = null, bd = 1e9; for (const w of sim.wesen) { if (w.held || w.tot) continue; const d = Math.hypot(w.x - h.x, w.y - h.y); if (d < bd) { bd = d; m = w; } }
      for (const w of sim.wesen) if (!w.held && !w.tot && w.ladeT > 0 && Math.hypot(h.x - w.ladeX, h.y - w.ladeY) < 4) { sim.eingabe({ t: "lauf", x: h.x + (h.x - w.ladeX) * 2, y: h.y + (h.y - w.ladeY) * 2 }); m = null; } /* aus der Wehklage laufen */
      if (m) { const A = HELDEN[typ].modi[h.modus], soll = A.reich * 0.85; if (bd > soll + m.r || !frei(h, m)) { if (!h.pfad.length || n % 20 === 0) sim.eingabe({ t: "lauf", x: m.x, y: m.y }); } else { if (h.pfad.length) sim.eingabe({ t: "halt" }); if (h.zielId !== m.id) sim.eingabe({ t: "ziel", id: m.id }); }
        if (bd < 6 && frei(h, m)) for (const t of ["q", "e", "r"]) { if (typ === "lichtbringer" && t !== "e" && h.lp > h.max * 0.5) continue; sim.eingabe({ t: "faehig", taste: t, x: m.x, y: m.y }); } } }
    sim.schritt(); }
  return { ok: sim.phase === "sieg", zeit: Math.round(sim.zeit), tode, rest: sim.monsterZahl - sim.besiegt }; };
let fehler = 0; const zeilen = [];
for (const k of KAMPFFOLGE.rabenmoor) for (const stufe of [1, 2]) { const z = [];
  for (const typ of HELDENREIHE) { let s = 0, t = 0, ok = 0; for (const seed of [3, 7, 11]) { const e = lauf(k, typ, [], stufe, seed); if (e.ok) { ok++; s += e.zeit; } t += e.tode; }
    z.push(`${HELDEN[typ].name} ${ok}/3${ok ? " ~" + Math.round(s / ok) + "s" : ""}${t ? " †" + t : ""}`); if (stufe === 2 && ok < 2) fehler++; }
  console.log(`${KARTEN[k].name.padEnd(24)} St.${stufe}  ${z.join(" · ")}`); }
{ const e = lauf("schrein", "schildwaechter", ["lichtbringer", "elementarist"], 1, 5); console.log(`Dreierteam am Schrein, St.1: ${e.ok ? "geschafft in " + e.zeit + " s" : "NICHT geschafft"}${e.tode ? ", Torvald " + e.tode + "× gefallen" : ""}`); if (!e.ok) fehler++; }
console.log(fehler ? `\nRabenmoor: ${fehler} Fälle auf Stufe 2 nicht sicher zu schaffen` : "\nRabenmoor: auf Stufe 2 mit jedem Helden allein zu schaffen"); process.exit(fehler ? 1 : 0);
