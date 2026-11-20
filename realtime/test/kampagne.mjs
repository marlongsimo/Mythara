/* Weidenhain im Rechner durchgespielt: Jede Karte muss mit jedem Helden allein zu gewinnen sein. Gibt Dauer und Tode aus. */
import { Sim, HELDEN, HELDENREIHE, KARTEN, FEIN, setzeKarte, setzeStaerke, frei } from "./sim.gebaut.mjs";
let fehler = 0;
for (const k of ["speicher", "muehle", "wehr", "nest"]) { const zeile = [];
  for (const typ of HELDENREIHE) { setzeKarte(KARTEN[k], FEIN); setzeStaerke(1, 1); const sim = new Sim(typ, 7, []); const h = sim.wesen.find((w) => w.held); let tode = 0, warTot = false;
    if (typ === "lichtbringer") sim.eingabe({ t: "modus" });
    for (let n = 0; n < 20 * 600 && sim.phase !== "sieg"; n++) { if (h.tot && !warTot) tode++; warTot = h.tot;
      if (!h.tot && n % 5 === 0) { let m = null, bd = 1e9; for (const w of sim.wesen) { if (w.held || w.tot) continue; const d = Math.hypot(w.x - h.x, w.y - h.y); if (d < bd) { bd = d; m = w; } }
        const sl = sim.sl; if (sl && sl.offen && (!m || bd > 5)) { /* Schleuse offen und kein Gegner nah: zum Hebel und dort stehen bleiben */ if (Math.hypot(h.x - sl.x, h.y - sl.y) > 0.7) { if (!h.pfad.length || n % 20 === 0) sim.eingabe({ t: "lauf", x: sl.x, y: sl.y }); } else if (h.pfad.length) sim.eingabe({ t: "halt" }); m = null; }
        if (m) { const A = HELDEN[typ].modi[h.modus], soll = A.reich * 0.85; if (bd > soll + m.r || !frei(h, m)) { if (!h.pfad.length || n % 20 === 0) sim.eingabe({ t: "lauf", x: m.x, y: m.y }); } else { if (h.pfad.length) sim.eingabe({ t: "halt" }); if (h.zielId !== m.id) sim.eingabe({ t: "ziel", id: m.id }); }
          if (bd < 6 && frei(h, m)) for (const t of ["q", "e", "r"]) { if (typ === "lichtbringer" && t !== "e" && h.lp > h.max * 0.5) continue; sim.eingabe({ t: "faehig", taste: t, x: m.x, y: m.y }); } } }
      sim.schritt(); }
    const ok = sim.phase === "sieg"; if (!ok) fehler++; zeile.push(`${HELDEN[typ].name} ${ok ? Math.round(sim.zeit) + " s" + (sim.sl ? " (" + (sim.monsterZahl - 6) + " aus dem Graben)" : "") : "NICHT GESCHAFFT (" + sim.besiegt + "/" + sim.monsterZahl + (sim.sl && sim.sl.offen ? ", Schleuse offen" : "") + ")"}${tode ? ", " + tode + "× gefallen" : ""}`); }
  console.log(KARTEN[k].name.padEnd(18), zeile.join(" · ")); }
console.log(fehler ? `\n${fehler} Läufe nicht geschafft` : "\nWeidenhain: jede Karte ist mit jedem Helden allein zu gewinnen"); process.exit(fehler ? 1 : 0);
