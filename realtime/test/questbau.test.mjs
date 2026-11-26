/* Prüfer für alle Quests des Baukastens (shared/questbau.ts, Fahrplan Phase 1): jede Quest-Datei wird auf Fehler geprüft –
   Verweise, Erreichbarkeit, Begrüßung in jedem Stand, Abschluss möglich, Stände passen in die Datenbank. Dazu Quest 3 Schritt für Schritt.
   Aufruf: node test/questbau.test.mjs (nach node build.mjs) */
import { QB, QUEST3, REZEPTE, weltRegionBei } from "./sim.gebaut.mjs";
let ok = true; const check = (b, t) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) ok = false; };
const QUESTS = [QUEST3];

for (const q of QUESTS) {
  console.log(`Quest „${q.titel}“ (${q.id}):`);
  const ids = q.schritte.map((s) => s.id), fehler = [];
  if (!/^[a-z0-9_]{1,40}$/.test(q.id)) fehler.push("Quest-ID passt nicht in die Datenbank");
  if (new Set(ids).size !== ids.length) fehler.push("Schritt-IDs doppelt");
  if (q.schritte.length > 20) fehler.push("mehr als 20 Schritte (Stand zu lang)");
  q.schritte.forEach((s, i) => { for (const n of s.nach || []) { const j = ids.indexOf(n); if (j < 0) fehler.push(`${s.id}: unbekannter Vorgänger ${n}`); else if (j >= i) fehler.push(`${s.id}: Vorgänger ${n} steht nicht davor`); }
    if (!s.text || !s.log) fehler.push(`${s.id}: Text fehlt`);
    if (s.ereignis.art === "herstellen" && !REZEPTE.some((r) => r.id === s.ereignis.rezept)) fehler.push(`${s.id}: Rezept ${s.ereignis.rezept} gibt es nicht`); });
  if (!q.figuren.some((f) => f.id === q.geber)) fehler.push("Questgeber ist keine Figur");
  for (const f of q.figuren) if (!weltRegionBei(f.x, f.y)) fehler.push(`${f.id}: steht außerhalb der Welt`);
  const bedPruefen = (b, wo) => { if (!b) return; for (const id of [...(b.erledigt || []), ...(b.offen || [])]) if (!ids.includes(id)) fehler.push(`${wo}: unbekannter Schritt ${id}`); };
  for (const [npc, D] of Object.entries(q.dialoge)) {
    if (!q.figuren.some((f) => f.id === npc)) fehler.push(`Dialog für unbekannte Figur ${npc}`);
    const oIds = D.optionen.map((o) => o.id); if (new Set(oIds).size !== oIds.length) fehler.push(`${npc}: Antwort-IDs doppelt`);
    const benutzt = new Set();
    D.reden.forEach((r, i) => { bedPruefen(r.wenn, `${npc} Rede ${i}`); for (const a of r.antworten) { benutzt.add(a); if (!oIds.includes(a)) fehler.push(`${npc} Rede ${i}: Antwort ${a} fehlt`); } if (!r.zeilen.length) fehler.push(`${npc} Rede ${i}: sagt nichts`); });
    for (const o of D.optionen) { if (!benutzt.has(o.id)) fehler.push(`${npc}: Antwort ${o.id} wird nie angeboten`); bedPruefen(o.wenn, `${npc}/${o.id}`);
      for (const v of o.folge) { bedPruefen(v.wenn, `${npc}/${o.id}`); for (const id of v.f.erledige || []) if (!ids.includes(id)) fehler.push(`${npc}/${o.id}: erledigt unbekannten Schritt ${id}`); if (!v.f.zeilen.length) fehler.push(`${npc}/${o.id}: Folge ohne Text`); } } }
  for (const art of ["sammeln", "herstellen"]) for (const [z, L] of Object.entries((q.sperren || {})[art] || {})) L.forEach((p, i) => bedPruefen(p.wenn, `Sperre ${art}/${z} ${i}`));
  check(!fehler.length, "Verweise stimmen" + (fehler.length ? ": " + fehler.join(" · ") : ""));

  /* Jeder Stand × jede Lage des Spielers (hat / verloren für jeden genannten Gegenstand): der Geber begrüßt und bietet etwas an */
  const dinge = [...new Set(JSON.stringify(q).match(/"(hat|verloren)":"([a-z0-9_]+)"/g)?.map((m) => m.split(":")[1].replace(/"/g, "")) || [])];
  const staende = ["", ...Array.from({ length: 1 << q.schritte.length }, (_, b) => `auftrag_${b}`), "fertig"];
  const lagen = []; for (let m = 0; m < 1 << (dinge.length * 2); m++) { const hat = new Set(dinge.filter((_, i) => m >> (2 * i) & 1)), weg = new Set(dinge.filter((_, i) => m >> (2 * i + 1) & 1)); if ([...hat].some((g) => weg.has(g))) continue; lagen.push({ hat: (g) => hat.has(g), verloren: (g) => weg.has(g) }); }
  const stumm = []; for (const s of staende) for (const k of lagen) { const d = QB.dialog(q, q.geber, s, k); if (!d || !d.antworten.length) stumm.push(s); }
  check(!stumm.length, `Der Questgeber hat in allen ${staende.length} Ständen × ${lagen.length} Lagen etwas zu sagen` + (stumm.length ? ` (stumm: ${[...new Set(stumm)].join(", ")})` : ""));
  check(staende.every((s) => s.length <= 24 && /^[a-z0-9_]*$/.test(s)), "Alle Stände passen in die Datenbank (höchstens 24 Zeichen)");

  /* Erreichbarkeit: vom Annehmen über Ereignisse und Antworten bis zum Abschluss */
  const k0 = lagen[0], kHat = { hat: () => true, verloren: () => false };
  let s = ""; const ann = q.dialoge[q.geber].optionen.find((o) => o.folge.some((v) => v.f.start));
  check(Boolean(ann), "Es gibt eine Antwort zum Annehmen"); if (ann) s = QB.nachFolge(q, s, QB.antwort(q, q.geber, s, ann.id, k0));
  check(QB.laeuft(q, s), `Nach dem Annehmen läuft die Quest (${s})`);
  for (let runde = 0; runde < q.schritte.length + 1; runde++) for (const S of q.schritte) if (QB.moeglich(q, s, S.id) && S.ereignis.art !== "antwort") s = QB.ereignis(q, s, S.ereignis);
  check(QB.lage(q, s).bits === (1 << q.schritte.length) - 1, `Alle Schritte über ihre Ereignisse erreichbar (${s})`);
  const abg = QB.dialog(q, q.geber, s, kHat), abschluss = abg && abg.antworten.find((a) => { const f = QB.antwort(q, q.geber, s, a.id, kHat); return f && f.abschluss; });
  check(Boolean(abschluss), `Abgabe möglich: „${abschluss ? abschluss.text : "?"}“`);
  check(QB.questlog(q, "") === q.logNeu && QB.questlog(q, "fertig") === q.logFertig && QB.questlog(q, s) === q.logAbgabe, "Questlog vor, nach und bei der Abgabe");
}

console.log("Quest 3 Schritt für Schritt:");
{ const q = QUEST3, k = { hat: () => false, verloren: () => false };
  check(QB.gueltig(q, "auftrag_5") === "auftrag_5" && QB.gueltig(q, "auftrag_99") === "" && QB.gueltig(q, "quatsch") === "", "Alte Stände („auftrag_N“) gelten unverändert, Unsinn wird zu „noch nicht angenommen“");
  check(QB.erledigteSchritte(q, "auftrag_5").join("|") === "Den Baum des Waldgottes fällen|Den Waldstein an der Esse schmelzen", "auftrag_5 = Holz und Barren erledigt (wie bisher Bit 1 und 4)");
  check(QB.sperre(q, "sammeln", "waldgott", "", k).startsWith("Ein uralter Baum") && QB.sperre(q, "sammeln", "waldgott", "auftrag_0", k) === null, "Baum des Waldgottes: ohne Auftrag gesperrt, mit Auftrag frei");
  check(QB.sperre(q, "sammeln", "waldgott", "auftrag_0", { hat: (g) => g === "holz_waldgott", verloren: () => false }).startsWith("Du hast schon"), "…aber nur ein Ast (schon im Rucksack: gesperrt)");
  check(QB.ereignis(q, "auftrag_0", { art: "herstellen", rezept: "barren_waldstein" }) === "auftrag_0", "Barren erst nach dem Waldstein (Reihenfolge aus den Daten)");
  let s = QB.ereignis(q, "auftrag_0", { art: "sammeln", ziel: "waldstein" }); check(s === "auftrag_2", "Waldstein abgebaut → Schritt „erz“");
  check(QB.neuErledigt(q, "auftrag_0", s).map((x) => x.id).join() === "erz", "Chat-Meldung: genau der neue Schritt");
  check(QB.questlog(q, s) === "Fälle den Baum des Waldgottes nordwestlich des Försters. Schmilz den Waldstein an der Esse in der Schmiede der Waldmark zu einem Barren.", "Questlog nennt alle jetzt möglichen Schritte");
  const z = QB.ziel(q, s, { esse: [1, 2], amboss: [3, 4] }); check(Array.isArray(z) && z[0] === 6350.5, "Pfeil zum ersten möglichen Schritt (Baum)");
  check(QB.zeichen(q, "", "foerster") === "!" && QB.zeichen(q, "auftrag_15", "foerster") === "?" && QB.zeichen(q, "auftrag_3", "foerster") === null, "Zeichen über dem Förster: ! / ? / nichts");
  const d = QB.dialog(q, "foerster", "auftrag_15", { hat: (g) => g === "waldsaebel", verloren: () => false }); check(d && d.zeilen[0].text === "Warte. Ist das …?" && d.antworten.map((a) => a.id).join() === "zeigen,tschuess", "Mit dem Säbel: „Warte. Ist das …?“ – zeigen oder gehen");
  check(QB.antwort(q, "foerster", "auftrag_15", "annehmen", k) === null, "Antworten, die gerade nicht angeboten werden, wirken nicht");
  const v = QB.antwort(q, "foerster", "auftrag_15", "verloren", { hat: () => false, verloren: (g) => g === "waldsaebel" }); check(v && v.vonVorn && QB.nachFolge(q, "auftrag_15", v) === "auftrag_0", "Säbel vor der Abgabe verloren: noch einmal von vorn");
}
console.log(ok ? "Quest-Baukasten: alles in Ordnung" : "Quest-Baukasten: FEHLER"); if (!ok) process.exit(1);
