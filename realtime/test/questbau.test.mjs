/* Prüfer für alle Quests des Baukastens (shared/questbau.ts, Fahrplan Phase 1): jede Quest-Datei wird auf Fehler geprüft –
   Verweise, Erreichbarkeit, Begrüßung in jedem Stand, Abschluss möglich, Stände passen in die Datenbank. Dazu Quest 3 Schritt für Schritt.
   Aufruf: node test/questbau.test.mjs (nach node build.mjs) */
import { QB, QUESTS, QUEST1, QUEST2, QUEST3, REZEPTE, GEG, weltRegionBei } from "./sim.gebaut.mjs";
import { build } from "esbuild"; import { tmpdir } from "node:os"; import { pathToFileURL } from "node:url";
let ok = true; const check = (b, t) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) ok = false; };
check(QUESTS.length >= 2 && new Set(QUESTS.map((q) => q.id)).size === QUESTS.length, `Gemeinsame Questliste (shared/quests.ts): ${QUESTS.map((q) => q.id).join(", ")}`);
/* Entwürfe (shared/quest_entwuerfe.ts): noch nicht im Spiel, aber genauso geprüft; fehlende Rezepte und Gegenstände sind „wartet auf“, kein Fehler */
const ENTW_DATEI = `${tmpdir()}/riftmere-entwuerfe-${process.pid}.mjs`;
await build({ stdin: { contents: 'export { ENTWUERFE } from "./shared/quest_entwuerfe";', resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", target: "node20", outfile: ENTW_DATEI, logLevel: "silent" });
const { ENTWUERFE } = await import(pathToFileURL(ENTW_DATEI).href);
check(ENTWUERFE.every((e) => !QUESTS.some((q) => q.id === e.q.id)) && new Set(ENTWUERFE.map((e) => e.q.id)).size === ENTWUERFE.length, `Entwürfe (shared/quest_entwuerfe.ts), nicht doppelt im Spiel: ${ENTWUERFE.map((e) => e.q.id).join(", ") || "–"}`);
const ALLE_IDS = [...QUESTS, ...ENTWUERFE.map((e) => e.q)].map((q) => q.id);

for (const { q, wartet } of [...QUESTS.map((q) => ({ q })), ...ENTWUERFE]) {
  console.log(`Quest „${q.titel}“ (${q.id})${wartet ? ` – Entwurf, wartet auf ${wartet}` : ""}:`);
  const ids = q.schritte.map((s) => s.id), fehler = [], fehlt = [];
  /* fehlender Baustein: in einer Quest des Spiels ein Fehler, in einem Entwurf ein Hinweis */
  const baustein = (t) => (wartet ? fehlt : fehler).push(t);
  if (!/^[a-z0-9_]{1,40}$/.test(q.id)) fehler.push("Quest-ID passt nicht in die Datenbank");
  if (new Set(ids).size !== ids.length) fehler.push("Schritt-IDs doppelt");
  if (q.schritte.length > 20) fehler.push("mehr als 20 Schritte (Stand zu lang)");
  q.schritte.forEach((s, i) => { for (const n of s.nach || []) { const j = ids.indexOf(n); if (j < 0) fehler.push(`${s.id}: unbekannter Vorgänger ${n}`); else if (j >= i) fehler.push(`${s.id}: Vorgänger ${n} steht nicht davor`); }
    if (!s.text || !s.log) fehler.push(`${s.id}: Text fehlt`);
    if (s.ereignis.art === "herstellen" && !REZEPTE.some((r) => r.id === s.ereignis.rezept)) baustein(`${s.id}: Rezept ${s.ereignis.rezept} gibt es nicht`); });
  /* Gegenstände, die die Quest nennt (hat, verloren, anzahl, geben, nehmen, Lohn), müssen es geben */
  const genannt = new Set([...JSON.stringify(q).matchAll(/"(?:hat|verloren)":"([a-z0-9_]+)"|"g":"([a-z0-9_]+)"/g)].map((m) => m[1] || m[2]));
  for (const g of genannt) if (!GEG[g]) baustein(`Gegenstand ${g} gibt es nicht`);
  if (!q.figuren.some((f) => f.id === q.geber)) fehler.push("Questgeber ist keine Figur");
  for (const f of q.figuren) if (!weltRegionBei(f.x, f.y)) fehler.push(`${f.id}: steht außerhalb der Welt`);
  const bedPruefen = (b, wo) => { if (!b) return; for (const id of [...(b.erledigt || []), ...(b.offen || []), ...(b.zaehler ? [b.zaehler.schritt] : [])]) if (!ids.includes(id)) fehler.push(`${wo}: unbekannter Schritt ${id}`);
    if (b.zaehler && !q.schritte.find((x) => x.id === b.zaehler.schritt).anzahl) fehler.push(`${wo}: ${b.zaehler.schritt} zählt nicht`);
    if (b.quest && !ALLE_IDS.includes(b.quest.id) && b.quest.id !== "die_gesperrte_strasse") fehler.push(`${wo}: unbekannte Quest ${b.quest.id}`); };
  const oIds = (q.objekte || []).map((o) => o.id); if (new Set(oIds).size !== oIds.length) fehler.push("Objekt-IDs doppelt");
  for (const o of q.objekte || []) { if (!weltRegionBei(o.x, o.y)) fehler.push(`${o.id}: liegt außerhalb der Welt`); if (!q.schritte.some((x) => x.ereignis.art === "objekt" && x.ereignis.id === o.id)) fehler.push(`${o.id}: kein Schritt dazu`); o.sonst.forEach((p, i) => bedPruefen(p.wenn, `Objekt ${o.id} ${i}`)); (o.heil || []).forEach((b) => bedPruefen(b, `Objekt ${o.id} heil`)); }
  for (const x of q.schritte) { if (x.ereignis.art === "objekt" && !oIds.includes(x.ereignis.id)) fehler.push(`${x.id}: Objekt ${x.ereignis.id} fehlt`);
    for (const b of [].concat(x.bei || [])) if (!q.figuren.some((f) => f.id === b)) fehler.push(`${x.id}: bei unbekannter Figur ${b}`);
    if (x.ereignis.art === "antwort" && !Object.values(q.dialoge).some((D) => D.optionen.some((o) => o.folge.some((v) => (v.f.erledige || []).includes(x.id))))) fehler.push(`${x.id}: keine Antwort erledigt ihn`); }
  for (const [n, b] of Object.entries(q.beute || {})) bedPruefen(b, `Beute ${n}`); (q.voraussetzungen || []).forEach((v, i) => bedPruefen(v.wenn, `Voraussetzung ${i}`));
  for (const [npc, D] of Object.entries(q.dialoge)) {
    if (!q.figuren.some((f) => f.id === npc)) fehler.push(`Dialog für unbekannte Figur ${npc}`);
    const oIds = D.optionen.map((o) => o.id); if (new Set(oIds).size !== oIds.length) fehler.push(`${npc}: Antwort-IDs doppelt`);
    const benutzt = new Set();
    D.reden.forEach((r, i) => { bedPruefen(r.wenn, `${npc} Rede ${i}`); for (const a of r.antworten) { benutzt.add(a); if (!oIds.includes(a)) fehler.push(`${npc} Rede ${i}: Antwort ${a} fehlt`); } if (!r.zeilen.length) fehler.push(`${npc} Rede ${i}: sagt nichts`); });
    for (const o of D.optionen) { if (!benutzt.has(o.id)) fehler.push(`${npc}: Antwort ${o.id} wird nie angeboten`); bedPruefen(o.wenn, `${npc}/${o.id}`);
      for (const v of o.folge) { bedPruefen(v.wenn, `${npc}/${o.id}`); for (const id of v.f.erledige || []) if (!ids.includes(id)) fehler.push(`${npc}/${o.id}: erledigt unbekannten Schritt ${id}`); if (!v.f.zeilen.length) fehler.push(`${npc}/${o.id}: Folge ohne Text`); } } }
  for (const art of ["sammeln", "herstellen"]) for (const [z, L] of Object.entries((q.sperren || {})[art] || {})) L.forEach((p, i) => bedPruefen(p.wenn, `Sperre ${art}/${z} ${i}`));
  check(!fehler.length, "Verweise stimmen" + (fehler.length ? ": " + fehler.join(" · ") : ""));
  if (fehlt.length) console.log(`  … wartet auf: ${fehlt.join(" · ")}`);

  /* Jeder Stand × jede Lage des Spielers (hat / verloren für jeden genannten Gegenstand): der Geber begrüßt und bietet etwas an */
  const dinge = [...new Set(JSON.stringify(q).match(/"(hat|verloren)":"([a-z0-9_]+)"/g)?.map((m) => m.split(":")[1].replace(/"/g, "")) || [])];
  /* alle Stände: jede Bitmaske, dazu jeder Zählerstand der noch nicht erledigten Zähl-Schritte */
  const zs = q.schritte.map((x, i) => [x, i]).filter(([x]) => x.anzahl), staende = ["", "angeboten", "fertig"];
  for (let b = 0; b < 1 << q.schritte.length; b++) { let varianten = [[]]; for (const [x, i] of zs) varianten = varianten.flatMap((v) => (b >> i & 1 ? [x.anzahl] : Array.from({ length: x.anzahl }, (_, n) => n)).map((n) => [...v, n]));
    for (const v of varianten) staende.push(QB.stand({ phase: "laeuft", bits: b, z: v, angeboten: true })); }
  check(staende.every((s) => QB.gueltig(q, s) === s), `Alle ${staende.length} Stände lesen sich zurück`);
  /* Voraussetzungen (Skills, andere Quests, Heldenlevel) gelten als erfüllt – geprüft werden Dialog und Ablauf */
  const alleVoraus = { skill: () => 99, quest: () => "fertig", heldenlevel: () => 99 };
  const lagen = []; for (let m = 0; m < 1 << (dinge.length * 2); m++) { const hat = new Set(dinge.filter((_, i) => m >> (2 * i) & 1)), weg = new Set(dinge.filter((_, i) => m >> (2 * i + 1) & 1)); if ([...hat].some((g) => weg.has(g))) continue; lagen.push({ hat: (g) => hat.has(g), verloren: (g) => weg.has(g), ...alleVoraus }); }
  const stumm = []; for (const s of staende) for (const k of lagen) { const d = QB.dialog(q, q.geber, s, k); if (!d || !d.antworten.length) stumm.push(s); }
  check(!stumm.length, `Der Questgeber hat in allen ${staende.length} Ständen × ${lagen.length} Lagen etwas zu sagen` + (stumm.length ? ` (stumm: ${[...new Set(stumm)].join(", ")})` : ""));
  check(staende.every((s) => s.length <= 24 && /^[a-z0-9_]*$/.test(s)), "Alle Stände passen in die Datenbank (höchstens 24 Zeichen)");

  /* Erreichbarkeit: vom Annehmen über Ereignisse und Antworten bis zum Abschluss */
  const k0 = lagen[0], kHat = { hat: () => true, verloren: () => false, anzahl: () => 9999, ...alleVoraus }; /* genug von allem (B1: 250 Splitter) */
  let s = ""; const ann = q.dialoge[q.geber].optionen.find((o) => o.folge.some((v) => v.f.start));
  check(Boolean(ann), "Es gibt eine Antwort zum Annehmen");
  const annF = ann && QB.antwort(q, q.geber, s, ann.id, k0); check(Boolean(annF), "Mit erfüllten Voraussetzungen lässt sich die Quest annehmen"); if (annF) s = QB.nachFolge(q, s, annF);
  check(QB.laeuft(q, s), `Nach dem Annehmen läuft die Quest (${s})`);
  /* Ereignis eines Schritts nachspielen (Stelle: Mitte von „bei“); Antwort-Schritte über die Figur, die sie erledigt */
  const melden = (e) => ({ ...e, ...(e.bei ? { x: e.bei[0], y: e.bei[1] } : {}) });
  for (let runde = 0; runde < q.schritte.length + 1; runde++) for (const S of q.schritte) { if (!QB.moeglich(q, s, S.id)) continue;
    if (S.ereignis.art === "objekt") { const r = QB.objekt(q, s, S.ereignis.id, kHat); s = r.stand; continue; }
    if (S.ereignis.art !== "antwort") { for (let i = 0; i < (S.anzahl || 1); i++) s = QB.ereignis(q, s, melden(S.ereignis)); continue; }
    /* in jeder Lage des Spielers (z. B. mit dem Schriftstück im Rucksack) */
    suche: for (const k of [k0, kHat, ...lagen]) for (const npc of Object.keys(q.dialoge)) { const d = QB.dialog(q, npc, s, k); const a = d && d.antworten.find((x) => { const f = QB.antwort(q, npc, s, x.id, k); return f && (f.erledige || []).includes(S.id); }); if (a) { s = QB.nachFolge(q, s, QB.antwort(q, npc, s, a.id, k)); break suche; } } }
  check(QB.lage(q, s).bits === (1 << q.schritte.length) - 1, `Alle Schritte über ihre Ereignisse erreichbar (${s})`);
  const wer = q.abgabe || q.geber, abg = QB.dialog(q, wer, s, kHat), abschluss = abg && abg.antworten.find((a) => { const f = QB.antwort(q, wer, s, a.id, kHat); return f && f.abschluss; });
  check(Boolean(abschluss), `Abgabe möglich: „${abschluss ? abschluss.text : "?"}“`);
  check(QB.questlog(q, "") === q.logNeu && QB.questlog(q, "fertig") === q.logFertig && QB.questlog(q, s) === q.logAbgabe, "Questlog vor, nach und bei der Abgabe");
  check(staende.every((x) => !/\{n:/.test(QB.questlog(q, x))), "Questlog ohne offene Platzhalter");
  for (const F of q.figuren) { const leer = staende.filter((x) => { const d = QB.dialog(q, F.id, x, k0); return !d || !d.antworten.length; }); if (leer.length) fehler.push(`${F.id} stumm in ${leer.slice(0, 3).join(",")}`); }
  check(!fehler.length, "Jede Figur hat in jedem Stand etwas zu sagen" + (fehler.length ? ": " + fehler.join(" · ") : ""));
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
console.log("Quest 2 Schritt für Schritt:");
{ const q = QUEST2, k = { hat: () => false, verloren: () => false };
  const alt = { "": "", angenommen: "auftrag_0", spuren_0_0: "auftrag_1", spuren_7_15: "auftrag_255", spuren_5_3: `auftrag_${1 | 5 << 1 | 3 << 4}`, abgabe: "auftrag_255", beobachten: "auftrag_511", kampf_0: "auftrag_1023", kampf_2: "auftrag_1023_2", bereit: "auftrag_2047_3", fertig: "fertig", quatsch: "", spuren_9_0: "" };
  check(Object.entries(alt).every(([a, n]) => QB.gueltig(q, a) === n), "Alte Stände (angenommen, spuren_Z_R, abgabe, beobachten, kampf_N, bereit) werden richtig übersetzt");
  check(QB.questlog(q, QB.gueltig(q, "spuren_5_3")) === "Untersuche die drei beschädigten Stellen am Hofrain (2/3) und sammle vier Bündel Weidenruten am Feldweg (2/4).", "Gruppen-Fortschritt im Questlog (2/3, 2/4)");
  let s = "auftrag_1"; const r1 = QB.objekt(q, s, "zaun2", k); check(r1.stand === "auftrag_5" && r1.text.endsWith("(1/3)"), "Bruchstelle untersuchen → Schritt und „(1/3)“");
  check(QB.objekt(q, r1.stand, "zaun2", k).text === "Diese Stelle hast du dir schon angesehen.", "…zweimal zählt nicht");
  check(QB.objekt(q, "auftrag_0", "zaun1", k).stand === "auftrag_0" && QB.objekt(q, "", "rute1", k).text === "Ein paar Weidenruten am Wegrand.", "Vor Odo: Objekte zählen nicht");
  check(QB.objektLage(q, "auftrag_17", q.objekte.find((o) => o.id === "rute1")).weg && !QB.objektLage(q, "auftrag_17", q.objekte.find((o) => o.id === "rute2")).weg, "Aufgehobene Ruten verschwinden (je Spieler)");
  check(QB.objektLage(q, "auftrag_511", q.objekte[0]).heil && !QB.objektLage(q, "auftrag_255", q.objekte[0]).heil, "Zaun erst nach der Abgabe geflickt");
  check(QB.ereignis(q, "auftrag_511", { art: "untersuchen", ziel: "mooshocker", x: 6400, y: 6400 }) === "auftrag_511", "Mooshocker untersuchen zählt nur am Moosrain");
  s = QB.ereignis(q, "auftrag_511", { art: "untersuchen", ziel: "mooshocker", x: 6580, y: 6412 }); check(s === "auftrag_1023", "…am Moosrain: weiter zum Kampf");
  check(QB.ereignis(q, "auftrag_255", { art: "erlegen", typ: "mooshocker" }) === "auftrag_255", "Mooshocker vor der Kampfphase zählen nicht");
  s = QB.ereignis(q, s, { art: "erlegen", typ: "mooshocker" }); s = QB.ereignis(q, s, { art: "erlegen", typ: "mooshocker" }); check(s === "auftrag_1023_2" && QB.questlog(q, s).includes("(2/3)"), "Zähler: 2 Mooshocker → auftrag_1023_2, Questlog (2/3)");
  check(QB.neuErledigt(q, "auftrag_1023_2", QB.ereignis(q, s, { art: "erlegen", typ: "mooshocker" })).map((x) => x.id).join() === "kampf", "Dritter Mooshocker erledigt den Schritt");
  check(QB.zeichen(q, "", "brida") === "!" && QB.zeichen(q, "auftrag_0", "odo") === "!" && QB.zeichen(q, "auftrag_255", "odo") === "!" && QB.zeichen(q, "auftrag_2047_3", "odo") === "?" && QB.zeichen(q, "auftrag_1023", "odo") === null, "Zeichen wie bisher (! bei Brida/Odo, ? bei der Abgabe)");
  const z = QB.ziel(q, "auftrag_1"); check(Array.isArray(z) && z[0] === 6556.5, "Pfeil zur ersten offenen Bruchstelle");
  check(QB.dialog(q, "wenzel", "auftrag_1023_1", k).zeilen.length === 2 && QB.dialog(q, "wenzel", "auftrag_1023", k).zeilen.length === 1, "Wenzel hat's gesehen, sobald ein Mooshocker besiegt ist");
  check(QB.nachFolge(q, "", QB.antwort(q, "brida", "", "spaeter", k)) === "angeboten" && QB.dialog(q, "brida", "angeboten", k).antworten.some((a) => a.id === "annehmen"), "„Jetzt nicht.“ → angeboten, annehmen geht weiter");
  check(q.belohnung.splitter === 20 && !q.dialoge.odo.optionen.find((o) => o.id === "lohn").folge[0].f.geben, "Lohn (20 Splitter) kommt aus belohnung – erst nach der Buchung");
}
console.log("Quest 1 Schritt für Schritt:");
{ const q = QUEST1, k = { hat: () => false, verloren: () => false }, mit = { hat: (g) => g === "hinweispergament", verloren: () => false };
  const alt = { "": "", angeboten: "angeboten", angenommen: "auftrag_0", auftrag: "auftrag_1", osthof: "auftrag_3", wachen: "auftrag_7", beweis: "auftrag_15", bestaetigt: "auftrag_31", frei: "auftrag_63", fertig: "fertig", quatsch: "" };
  check(Object.entries(alt).every(([a, n]) => QB.gueltig(q, a) === n), "Alte Stände (angeboten … frei) werden richtig übersetzt");
  const w = QB.gueltig(q, "wachen"); check(QB.questlog(q, w).startsWith("Die Wachen bestätigen die Überfälle") && QB.gilt(q, w, q.beute.einsteigerquest), "Alter Stand „wachen“: Questlog „Lager suchen“, Pergament kann fallen");
  check(!QB.gilt(q, QB.gueltig(q, "osthof"), q.beute.einsteigerquest) && !QB.gilt(q, QB.gueltig(q, "beweis"), q.beute.einsteigerquest), "Pergament fällt nur im Abschnitt „wachen“");
  check(QB.frei(q, QB.gueltig(q, "auftrag"), "kreuzung") === false && QB.frei(q, QB.gueltig(q, "osthof"), "kreuzung") === true, "Kreuzung öffnet bei „osthof“");
  check(["strasse", "westmark", "osthang", "weidenhain", "rabenmoor", "obstwiesen"].every((id) => QB.frei(q, QB.gueltig(q, "bestaetigt"), id) === false && QB.frei(q, QB.gueltig(q, "frei"), id) === true && QB.frei(q, "fertig", id) === true), "Straße, Westmark, Osthang und Weidenhain/Rabenmoor/Obstwiesen erst nach „durch“ frei");
  check(QB.frei(q, "", "waldmark") === undefined, "Andere Regionen regelt die Quest nicht");
  check(QB.dialog(q, "hagan", w, mit).antworten.map((a) => a.id).join() === "zeigen" && QB.nachFolge(q, w, QB.antwort(q, "hagan", w, "zeigen", mit)) === "auftrag_31", "Pergament schon vor dem Lager gefunden: Hagan nimmt es gleich (beweis + vorzeigen)");
  check(QB.antwort(q, "hagan", w, "zeigen", mit).nehmen[0].g === "hinweispergament" && QB.antwort(q, "hagan", w, "zeigen", k) === null, "Vorzeigen nimmt das Pergament – ohne Pergament gibt es die Antwort nicht");
  const d = QB.dialog(q, "tilda", QB.gueltig(q, "osthof"), k); check(d.zeilen.some((z) => z.wer === "Tilda") && d.zeilen.some((z) => z.wer === "Raban") && d.zeilen.some((z) => z.wer === "Du"), "Wachen: zweite Sprecherin und „Du“ im selben Gespräch");
  check(QB.zeichen(q, "", "jori") === "!" && QB.zeichen(q, "auftrag_3", "tilda") === "!" && QB.zeichen(q, "auftrag_63", "othmar") === "?", "Zeichen: Jori ! · Wachen ! · Othmar ?");
  check(QB.nachFolge(q, "", { zeilen: [], anbieten: true }) === "angeboten" && QB.dialog(q, "jori", "angeboten", k).antworten.some((a) => a.id === "annehmen"), "Ansprechen bietet an, Annehmen geht später");
  check(q.belohnung.xp.defense === 200 && q.belohnung.xp.lp === 100, "Belohnung wie bisher (150 je Kampfskill, 100 LP, 200 Defense)");
}
console.log("Bausteine (Test-Auftrag, nicht im Spiel):");
{ const q = { id: "test", titel: "T", ort: "", start: "", logNeu: "neu", logFertig: "fertig", logAbgabe: "abgabe", geber: "a", figuren: [{ id: "a", name: "A", modell: "", x: 0, y: 0, blick: [0, 1] }],
    schritte: [{ id: "hin", text: "Hin", log: "Geh hin.", ereignis: { art: "betreten", region: "osthof", bei: [10, 10, 3] } },
      { id: "auf", text: "Auf", log: "Heb {n:auf} auf.", ereignis: { art: "aufheben", g: "pergament" }, anzahl: 2 },
      { id: "nutz", text: "Nutz", log: "Benutz es.", ereignis: { art: "benutzen", g: "schluessel", ziel: "tuer" }, nach: ["hin"] }],
    dialoge: { a: { reden: [{ zeilen: ["Hallo"], antworten: ["geben", "start"] }], optionen: [
      { id: "start", text: "Start", wenn: { phase: ["neu"], voraussetzungen: true }, folge: [{ f: { start: true, zeilen: ["Los."] } }] },
      { id: "geben", text: "Abgeben", wenn: { phase: ["laeuft"], anzahl: { g: "pergament", min: 2 } }, folge: [{ f: { nehmen: [{ g: "pergament", n: 2 }], abschluss: true, zeilen: ["Danke."] } }] }] } },
    voraussetzungen: [{ text: "Geschick 10", wenn: { skill: { k: "geschick", min: 10 } } }, { text: "Quest X fertig", wenn: { quest: { id: "x", phase: ["fertig"] } } }, { text: "Heldenlevel 5", wenn: { heldenlevel: 5 } }],
    beute: { testbeute: { erledigt: ["hin"], offen: ["auf"] } }, belohnungText: "" };
  const k = (o = {}) => ({ hat: () => false, verloren: () => false, anzahl: () => o.n || 0, skill: () => o.skill || 0, quest: () => o.quest || "neu", heldenlevel: () => o.hl || 0 });
  check(!QB.dialog(q, "a", "", k()).antworten.some((a) => a.id === "start") && QB.dialog(q, "a", "", k({ skill: 10, quest: "fertig", hl: 5 })).antworten.some((a) => a.id === "start"), "Voraussetzungen (Skill, andere Quest, Heldenlevel) schalten das Annehmen frei");
  check(QB.voraussetzungen(q, "", k({ skill: 12 })).map((v) => v.ok).join() === "true,false,false", "Voraussetzungen einzeln: erfüllt / nicht erfüllt");
  check(!QB.gilt(q, "auftrag_0", { skill: { k: "geschick", min: 1 } }, { hat: () => false, verloren: () => false }), "Ohne Wissen über Skills gilt eine Skill-Bedingung nicht (Browser)");
  let s = "auftrag_0";
  check(QB.ereignis(q, s, { art: "betreten", region: "osthof", x: 20, y: 20 }) === s && QB.ereignis(q, s, { art: "betreten", region: "waldmark", x: 10, y: 10 }) === s, "Betreten: falsche Stelle oder falsche Region zählt nicht");
  s = QB.ereignis(q, s, { art: "betreten", region: "osthof", x: 11, y: 9 }); check(s === "auftrag_1", "Betreten: Region und Stelle stimmen");
  check(QB.gilt(q, s, q.beute.testbeute) && !QB.gilt(q, "auftrag_0", q.beute.testbeute), "Bedingte Beute: nur in diesem Abschnitt");
  check(QB.ereignis(q, s, { art: "benutzen", g: "schluessel", ziel: "fenster" }) === s && QB.ereignis(q, s, { art: "benutzen", g: "schluessel", ziel: "tuer" }) === "auftrag_5", "Benutzen: Gegenstand an genau diesem Ding");
  s = QB.ereignis(q, s, { art: "aufheben", g: "pergament" }); check(s === "auftrag_1_1" && QB.questlog(q, s).includes("Heb 1/2 auf."), "Aufheben zählt (1/2)");
  s = QB.ereignis(q, s, { art: "aufheben", g: "pergament" }); check(s === "auftrag_3_2", "…zweites Mal: erledigt");
  check(!QB.dialog(q, "a", s, k({ n: 1 })).antworten.some((a) => a.id === "geben") && QB.antwort(q, "a", s, "geben", k({ n: 2 })).nehmen[0].n === 2, "Abgeben erst mit genug im Rucksack");
}
console.log(ok ? "Quest-Baukasten: alles in Ordnung" : "Quest-Baukasten: FEHLER"); if (!ok) process.exit(1);
