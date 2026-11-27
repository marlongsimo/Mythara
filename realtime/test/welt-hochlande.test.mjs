/*
 * Mythara – Phase 11 Vorarbeit Welt (#147), ohne Browser: die Hochlande über die Brücke zur Furt.
 * Brücke ohne Sperre, von Grauwacht aus zu Fuß über Brücke und Furt nach Steinhag und zu allen Orten, Lesestellen, NPC-Plätzen, Kräutern und Fischplätzen;
 * Steinhag mit Bank, Markt, Schmiede, Werkbank, Taverne, Wegstein, Bindestein und mehr Häusern als Haferstedt; das Bergwerk als Untergrund mit Ein- und Ausgang
 * und erreichbaren Adern; Gegner der Hochlande (Widder, Bär, Troll, Adler, Steppenwolf) mit Stufe 45–60, keiner in Steinhag; Streifgebiete für Bär und Steppenwolf;
 * Ortsnamen und Minikarten.
 * Aufruf (im Ordner realtime): node test/welt-hochlande.test.mjs
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { gemeinsam, bibliothek, region, WELT, WURZEL } from "../werkzeug/welt/laden.mjs";
let ok = true; const check = (b, t, e = []) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) { ok = false; for (const z of e.slice(0, 12)) console.log("      " + z); } };
const G = await gemeinsam(), bib = bibliothek(), lies = (f) => JSON.parse(readFileSync(join(WELT, f), "utf8"));
const HO = lies("hochlande_orte.json"), BOX = [6640, 5200, 7700, 6300], M = HO.hauptstadt.mauer, inMauer = (o, r = 0) => o.x > M[0] - r && o.x < M[2] + r && o.y > M[1] - r && o.y < M[3] + r;
const R = new G.WeltRaster(), IA = new Map(), OBJ = [];
for (const n of readdirSync(join(WELT, "regionen"))) { const rp = join(WELT, "regionen", n, "region.json"); if (!existsSync(rp)) continue; const r = JSON.parse(readFileSync(rp, "utf8")); if (r.entwurf) continue;
  const x0 = r.ursprung[0] * 32, y0 = r.ursprung[1] * 32, x1 = x0 + r.chunks[0] * 32, y1 = y0 + r.chunks[1] * 32; if (!["hochlande_bergwerk", "steinhag_zunftstollen"].includes(n) && (x1 < BOX[0] || x0 > BOX[2] || y1 < BOX[1] || y0 > BOX[3])) continue;
  const reg = region(n); for (const c of G.chunksBauen(reg, bib.gelaende, bib.objekte).chunks) R.dazu(c);
  for (const i of reg.spiel.interaktionen) IA.set(i.id, { ...i, x: i.x + x0, y: i.y + y0 }); for (const o of reg.objekte) OBJ.push({ ...o, x: o.x + x0, y: o.y + y0, region: n }); }
const flut = ([sx, sy], box) => { const s = 2, seen = new Set(), q = [[Math.floor(sx * s), Math.floor(sy * s)]];
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + "," + ny; if (seen.has(k) || nx / s < box[0] || ny / s < box[1] || nx / s > box[2] || ny / s > box[3] || !R.begehbar((nx + .5) / s, (ny + .5) / s)) continue; seen.add(k); q.push([nx, ny]); } }
  return (x, y, w = 1.8) => { for (let r = 0; r <= w; r += 0.1) for (let t = 0; t < 6.3; t += 0.2) if (seen.has(Math.floor((x + Math.cos(t) * r) * s) + "," + Math.floor((y + Math.sin(t) * r) * s))) return true; return false; }; };

console.log("\nHochlande – Zugang");
const fb = IA.get("furtbruecke"); check(fb && !fb.daten.gesperrt && !OBJ.some((o) => o.id === "furtbruecke_sperre"), "Brücke zur Furt ohne Sperre (Wache und Schild, keine Schranke)");
{ const fb = OBJ.filter((o) => /^furtbruecke_\d+$/.test(o.id)).sort((a, b) => a.x - b.x).map((o) => o.objekt);
  check(fb.length === 10 && fb[0] === "hochland_bruecke_kopf_w" && fb[9] === "hochland_bruecke_kopf_o" && fb.slice(1, 9).every((o) => o === "hochland_bruecke_mitte_ow") && OBJ.some((o) => o.id === "furtbruecke_schild") && HO.npc.some((n) => n.id === "wache_furtbruecke"), "große Steinbrücke aus dem Baukasten (#153): Brückenkopf West, acht Mittelstücke, Brückenkopf Ost; Schild und Wachposten", fb); }
const greifbar = flut([fb.x, fb.y], BOX);
const pflicht = ["furt", "steinhag", "steinhag_vogthof", "steinhag_bank_tuer", "steinhag_wegstein", "steinhag_bindestein", "steinhag_werkstatt", "bergwerk_eingang", "passwacht", "grauhorn_steinmann", "almhuette", "einsiedelei", "nordklippen", "fischplatz_steinhagsee", "fischplatz_spiegelsee", "wegweiser_furt", "wegweiser_steinhag_west", "wegweiser_steinhag_ost", "wegweiser_erzberg"];
const fehlt = pflicht.filter((id) => !IA.has(id)), weg = pflicht.filter((id) => IA.has(id) && !greifbar(IA.get(id).x, IA.get(id).y));
check(!fehlt.length, `${pflicht.length} Lesestellen vorhanden`, fehlt); check(!weg.length, "alle von Grauwacht aus über Brücke und Furt zu Fuß erreichbar", weg);
const npc = HO.npc.filter((p) => p.y < 9000 && !greifbar(p.x, p.y, 1.2)); check(HO.npc.length >= 15 && !npc.length, `${HO.npc.length} NPC-Plätze erreichbar (Bergvögtin, Wirt, Schmied, Bergleute, Sennerin, Passwache, Einsiedler, Händler, Trödler …)`, npc.map((p) => p.id));
const fisch = HO.fischplaetze.filter((f) => !greifbar(...f.stehplatz, 0.8) || R.begehbar(f.x, f.y)); check(HO.fischplaetze.length >= 2 && !fisch.length, `${HO.fischplaetze.length} Fischplätze an den Bergseen (Stehplatz erreichbar, Fanggrund im Wasser)`, fisch.map((f) => f.id));
const KR = lies("kraeuter_standorte.json").stellen.filter((s) => s.id.startsWith("hochlande_")), kw = KR.filter((s) => !greifbar(s.x, s.y, 1));
check(KR.filter((s) => ["eisenhut", "nebelkraut"].includes(s.art)).length >= 8 && KR.filter((s) => ["wegerich", "ringelblume", "moorgloeckchen"].includes(s.art)).length >= 5 && !kw.length, `${KR.length} Kräuter erreichbar: Eisenhut/Nebelkraut an den Hängen, Wegerich/Ringelblume auf der Alm, Beet am Einsiedler-Garten`, kw.map((s) => s.id));

console.log("\nHochlande füllen");
{ const SM = lies("sammelstellen.json"), punkte = [...SM.lichtungen.flatMap((l) => l.baeume), ...SM.senken.flatMap((s) => s.adern)].filter((p) => p.x > 6780 && p.y < 6350), alle = [...punkte, ...KR, ...HO.fischplaetze.map((f) => ({ x: f.stehplatz[0], y: f.stehplatz[1] }))];
  const luecken = []; for (const w of HO.wege) for (let j = 1; j < w.punkte.length; j++) { const [x0, y0] = w.punkte[j - 1], [x1, y1] = w.punkte[j], L = Math.hypot(x1 - x0, y1 - y0);
    for (let t = 0; t <= L; t += 10) { const x = x0 + (x1 - x0) * t / L, y = y0 + (y1 - y0) * t / L; if (!inMauer({ x, y }, 12) && !alle.some((p) => Math.hypot(p.x - x, p.y - y) < 45)) luecken.push(`${Math.round(x)}|${Math.round(y)}`); } }
  check(!luecken.length, `von jedem Weg aus (außerhalb der Stadt Steinhag) höchstens 45 Felder bis zu Holz, Erz, Kraut oder Fisch (${punkte.length} Bäume und Adern, ${KR.length} Kräuter, ${HO.fischplaetze.length} Fischplätze)`, luecken);
  const niedrig = (arten) => punkte.filter((p) => arten.includes(p.art)).length; check(niedrig(["eiche", "tanne"]) >= 8 && niedrig(["kupfer", "eisen", "schwarzeisen"]) >= 10 && niedrig(["kernbaum"]) >= 6 && niedrig(["sterneisen", "splittereisen"]) >= 10, "verschiedene Stufen: Grundholz und Kupfer bis Schwarzeisen, Kernbaum, Sterneisen und Splittereisen");
  const fi = new Set(HO.fischplaetze.map((f) => f.fisch)); check(["bachling", "muehlbarsch", "wels", "klippenbarsch"].every((f) => fi.has(f)), `Fische: ${[...fi].join(", ")} (Bergbäche, Seen, Nordklippen)`);
  const st = new Set(HO.stationen.map((s) => s.station)), stw = HO.stationen.filter((s) => !greifbar(s.x, s.y, 1.6)); check(["esse", "amboss", "herd", "feuer", "kessel"].every((x) => st.has(x)) && !stw.length, "Stationen (Vorschlag für Systeme): Esse und Amboss am Bergwerk, Herd an der Alm, Feuer an der Passwacht, Kessel an der Einsiedelei – erreichbar", stw.map((s) => s.id));
  const tiere = HO.npc.filter((n) => /Ziege|Murmeltier|Schaf/.test(n.rolle)); check(tiere.length >= 12 && OBJ.filter((o) => o.objekt === "hochland_steinmann").length >= 5 && ["rast_passweg", "rast_siedelweg", "rast_klippenweg"].every((id) => IA.has(id) && greifbar(IA.get(id).x, IA.get(id).y)), `Leben: ${tiere.length} Tiere (Ziegen, Murmeltiere, Schafe), Steinmänner, drei Rastplätze, Bergleute als Reisende (${HO.reisende.length})`); }


console.log("\nSteinhag");
const [SX, SY] = HO.orte.steinhag, imOrt = (o) => inMauer(o) || Math.hypot(o.x - SX, o.y - SY) < 60;
const hat = (re) => OBJ.some((o) => imOrt(o) && re.test(o.objekt)), HAUS = /haus|taverne|schmiede|kapelle|scheune|schuppen|kornspeicher|muehle|baeckerei|fachwerk|kate|bergfried|bank_01|huette|fischer|heldenhalle|turm/;
const gebaeude = OBJ.filter((o) => imOrt(o) && HAUS.test(o.objekt)).length, ha = lies("beleben_orte.json").orte.haferstedt;
const haferstedt = lies("festland/plan_beleben.json").objekte.filter((o) => Math.hypot(o.x - ha[0], o.y - ha[1]) < 60 && HAUS.test(o.objekt)).length;
check(hat(/waldmark_bank/) && hat(/marktstand/) && hat(/dorf_schmiede/) && hat(/hand_werkbank/) && hat(/dorf_taverne/) && hat(/moor_menhir_02/) && hat(/wz_bindestein/) && hat(/graufurt_bergfried/), "Bank, Markt, Schmiede, Werkbank, Taverne, Wegstein, Bindestein, Hof der Bergvögte");
check(gebaeude > haferstedt && gebaeude >= 80 && gebaeude <= 130, `Hauptstadt (#167): ${gebaeude} Gebäude in den Mauern (Haferstedt ${haferstedt}), Viertel ${JSON.stringify(HO.hauptstadt.viertel)}`);
{ const tore = ["steinhag_tor_west", "steinhag_tor_ost", "steinhag_tor_nordwest"], hat = (id) => OBJ.some((o) => o.id === id);
  check(tore.every(hat) && OBJ.filter((o) => /^steinhag_mauer_/.test(o.id)).length > 150 && tore.every((id) => greifbar(IA.get(id).x, IA.get(id).y)), "Ringmauer mit Ecktürmen und drei Toren (West: Furt, Nordwest: Pass, Ost: Erzberg und Alm), alle Tore zu Fuß erreichbar");
  { /* die Mauer ist dicht: mit geschlossenen Toren kommt man von der Furt nicht auf den Markt */
    const zu = [[M[0] - 2, 5896, M[0] + 2, 5906], [HO.hauptstadt.tore.nordwest[0] - 4, M[1] - 2, HO.hauptstadt.tore.nordwest[0] + 4, M[1] + 2], [M[2] - 2, 5896, M[2] + 2, 5906]], s = 2, seen = new Set(), q = [[Math.floor(6799 * s), Math.floor(5761.5 * s)]];
    while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + "," + ny, wx = (nx + 0.5) / s, wy = (ny + 0.5) / s;
        if (seen.has(k) || wx < BOX[0] || wy < BOX[1] || wx > BOX[2] || wy > BOX[3] || !R.begehbar(wx, wy) || zu.some((r) => wx >= r[0] && wx <= r[2] && wy >= r[1] && wy <= r[3])) continue; seen.add(k); q.push([nx, ny]); } }
    check(!seen.has(Math.floor(6990 * s) + "," + Math.floor(5893 * s)), "die Ringmauer ist dicht (mit geschlossenen Toren kein Weg auf den Markt)"); }
  const innen = ["steinhag_vogtsburg", "steinhag_burgplatz", "steinhag_zunftbank_tuer", "steinhag_zunftschmiede", "steinhag_brennofen", "steinhag_zunftstollen_eingang", "steinhag_bank_tuer"], iw = innen.filter((id) => !IA.has(id) || !greifbar(IA.get(id).x, IA.get(id).y));
  check(["steinhag_vogtsburg_bergfried", "steinhag_vogtsburg_palas", "steinhag_zunftbank", "steinhag_zunftschmiede", "steinhag_brennofen", "steinhag_zunftstollen_eingang"].every(hat) && !iw.length, "Vogtsburg auf dem Fels, zweite Bank, Zunftschmiede, Brennofen und Stollen-Abstieg – erreichbar", iw);
  const lw = HO.hauptstadt.laeden.filter((l) => !greifbar(l.x, l.y, 1.4)), sw = HO.hauptstadt.stationen.filter((s) => !greifbar(s.x, s.y, 1.6));
  check(HO.hauptstadt.banken.length === 2 && HO.hauptstadt.laeden.length >= 5 && !lw.length && !sw.length, `${HO.hauptstadt.laeden.length} neue Ladenplätze, ${HO.hauptstadt.stationen.length} Stationen (Zunft), 2 Banken – erreichbar`, [...lw, ...sw].map((x) => x.id));
  const baum = OBJ.filter((o) => inMauer(o) && /tanne|birke|baum|busch|fels/.test(o.objekt) && !/^steinhag/.test(o.id)); check(!baum.length, "keine Bäume, Büsche und Felsbrocken in den Mauern", baum.map((o) => o.id));
  const sm = lies("sammelstellen.json"), smIn = [...sm.lichtungen, ...sm.senken].filter((g) => (g.baeume || g.adern).some((p) => inMauer(p))); check(!smIn.length, "keine Sammelstelle in den Mauern", smIn.map((g) => g.name)); }
console.log("\nStollen der Bergmannszunft (Untergrund, #167)");
{ const ZS = region("steinhag_zunftstollen"), [ZX, ZY] = ZS.region.ursprung.map((v) => v * 32), ein = IA.get("steinhag_zunftstollen_eingang"), hin = IA.get("zunftstollen_hinaus");
  check(ZS.region.ebene === "untergrund" && R.begehbar(...ein.daten.ziel) && greifbar(...hin.daten.ziel), "Abstieg im Zunftviertel führt hinein, der Ausgang wieder hinauf");
  const unten = flut(ein.daten.ziel, [ZX, ZY, ZX + 64, ZY + 64]), ad = lies("sammelstellen.json").senken.filter((s) => s.name.startsWith("Adern im Stollen der Bergmannszunft")).flatMap((s) => s.adern), aw = ad.filter((a) => !unten(a.x, a.y, 1.2));
  const arten = new Set(ad.map((a) => a.art)); check(ad.length >= 20 && !aw.length && ["eisen", "schwarzeisen", "sterneisen", "splittereisen", "ureisen"].every((a) => arten.has(a)), `${ad.length} Adern (${[...arten].join(", ")}), alle erreichbar`, aw.map((a) => a.id));
  const ia = ["zunftstollen_schmelzofen", "zunftstollen_bankkiste", "zunftstollen_halle"].filter((id) => !IA.has(id) || !unten(IA.get(id).x, IA.get(id).y)); check(!ia.length, "Zunfthalle mit Schmelzofen und Bankkiste erreichbar", ia); }

console.log("\nBergwerk (Untergrund)");
const BW = region("hochlande_bergwerk"), [UX, UY] = BW.region.ursprung.map((v) => v * 32), ein = IA.get("bergwerk_eingang"), hin = IA.get("bergwerk_hinaus");
check(BW.region.ebene === "untergrund" && ein?.daten.ziel && R.begehbar(...ein.daten.ziel) && hin?.daten.ziel && greifbar(...hin.daten.ziel), "Eingang am Erzberg führt hinein, der Ausgang wieder hinaus an den Erzberg");
const unten = flut(ein.daten.ziel, [UX, UY, UX + 96, UY + 64]), adern = lies("sammelstellen.json").senken.filter((s) => s.ort === "bergwerk").flatMap((s) => s.adern).filter((a) => a.region === "hochlande_bergwerk");
/* H3: die Urkammer liegt hinter dem eingestürzten Stollen (Sperre mit Schalter urkammer_offen) – mit offenem Schalter erreichbar */
const R2 = new G.WeltRaster(); { const bw = region("hochlande_bergwerk"); bw.spiel.kollision.sperren = bw.spiel.kollision.sperren.filter((z) => !z.schalter); for (const c of G.chunksBauen(bw, bib.gelaende, bib.objekte).chunks) R2.dazu(c); }
const offen = (() => { const s = 2, seen = new Set(), q = [[Math.floor(ein.daten.ziel[0] * s), Math.floor(ein.daten.ziel[1] * s)]]; while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + "," + ny; if (seen.has(k) || nx / s < UX || ny / s < UY || nx / s > UX + 96 || ny / s > UY + 64 || !R2.begehbar((nx + .5) / s, (ny + .5) / s)) continue; seen.add(k); q.push([nx, ny]); } }
  return (x, y, w = 1.6) => { for (let r = 0; r <= w; r += 0.1) for (let t = 0; t < 6.3; t += 0.2) if (seen.has(Math.floor((x + Math.cos(t) * r) * s) + "," + Math.floor((y + Math.sin(t) * r) * s))) return true; return false; }; })();
const ur = adern.filter((a) => a.art === "ureisen"), au = adern.filter((a) => a.art !== "ureisen" && !unten(a.x, a.y, 1.6) || R.begehbar(a.x, a.y)), innen = ["bergwerk_vorraum", "bergwerk_trollhalle", "bergwerk_hinaus"].filter((id) => !unten(IA.get(id).x, IA.get(id).y));
{ const BO = readFileSync(join(WELT, "..", "shared", "bosse.ts"), "utf8"), tuer = /id: "bergwerk_stollen", feld: \[(\d+), (\d+), (\d+), (\d+)\], schalter: "urkammer_offen"/.exec(BO), sp = BW.spiel.kollision.sperren.find((z) => z.schalter === "urkammer_offen");
  const passt = tuer && sp && +tuer[1] === UX + sp.x0 && +tuer[2] === UY + sp.y0 && +tuer[3] === UX + sp.x1 && +tuer[4] === UY + sp.y1;
  check(ur.length >= 3 && passt && ur.every((a) => offen(a.x, a.y, 1.6)) && offen(IA.get("bergwerk_urkammer").x, IA.get("bergwerk_urkammer").y), "Urkammer (Ureisen) hinter dem eingestürzten Stollen: Tür „bergwerk_stollen“ (shared/bosse.ts, Schalter urkammer_offen, je Spieler) deckt die Sperre der Welt genau ab; dahinter erreichbar"); }
const h3 = ["eingestuerzter_stollen", "morsches_grubenholz", "verletzter_bergmann_1", "verletzter_bergmann_2", "verletzter_bergmann_3", "trollhalle_eingang"].filter((id) => !IA.has(id) || !unten(IA.get(id).x, IA.get(id).y)); check(!h3.length, "H3: eingestürzter Stollen, morsches Grubenholz, drei verletzte Bergleute und der Eingang der Trollhalle erreichbar", h3);
check(adern.length >= 9 && new Set(adern.map((a) => a.art)).size === 3 && !au.length, `${adern.length} Adern (Sterneisen, Splittereisen, Ureisen) erreichbar und gesperrt`, au.map((a) => a.id));
check(!innen.length, "Füllort und Trollhalle (öffentliche Arena) erreichbar", innen);
check(existsSync(join(WURZEL, "echtzeit", "welt", "karte-hochlande_bergwerk.webp")), "Minikarte des Bergwerks gebaut");
{ const A = HO.arena, frei = []; let boden = 0, alle = 0; for (let y = A.y - A.r; y <= A.y + A.r; y++) for (let x = A.x - A.r; x <= A.x + A.r; x++) if (Math.hypot(x - A.x, y - A.y) < A.r - 0.5) { alle++; if (R.begehbar(x, y)) boden++; }
  const drin = OBJ.filter((o) => o.region === "hochlande_bergwerk" && Math.hypot(o.x - A.x, o.y - A.y) < A.r - 1.5).map((o) => o.id);
  check(boden / alle > 0.97 && !drin.length && unten(A.x, A.y, 1), `Trollhalle als Boss-Arena: ${Math.round(boden / alle * 100)} % freie Fläche (Radius ${A.r}), Steinboden, keine Dinge darin, erreichbar`, drin); }

const FIG = ["hochland_stolleneingang", "hochland_lore", "hochland_schienen", "hochland_grubenholz", "hochland_kaeserad", "hochland_pass_schranke", "hochland_gipfelkreuz", "hochland_steinmann"].filter((id) => !OBJ.some((o) => o.objekt === id));
check(!FIG.length, "Objekte von Figuren (#148, f430c667a) in der Welt: Stolleneingang, Lore, Schienen, Grubenholz, Käserad, Pass-Schranke, Gipfelkreuz, Steinmann", FIG);
console.log("\nBlock H (#162): Hüter-Arenen als Instanz, Questorte");
{ const INST = new Map(HO.instanzen.map((i) => [i.id, i]));
  for (const id of ["horst_grauhorn", "eishoehle_hochpass", "kaesekeller"]) {
    const rg = region(id), [ix, iy] = rg.region.ursprung.map((v) => v * 32), b = rg.region.chunks[0] * 32, h = rg.region.chunks[1] * 32, RI = new G.WeltRaster(); for (const c of G.chunksBauen(rg, bib.gelaende, bib.objekte).chunks) RI.dazu(c);
    const aus = rg.spiel.interaktionen.find((i) => i.art === "eingang"), rein = [...IA.values()].find((i) => i.daten?.ziel && i.daten.ziel[0] >= ix && i.daten.ziel[0] < ix + b && i.daten.ziel[1] >= iy && i.daten.ziel[1] < iy + h);
    const s = 2, seen = new Set(), st = rein.daten.ziel, q = [[Math.floor(st[0] * s), Math.floor(st[1] * s)]]; while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + "," + ny; if (seen.has(k) || nx / s < ix || ny / s < iy || nx / s > ix + b || ny / s > iy + h || !RI.begehbar((nx + .5) / s, (ny + .5) / s)) continue; seen.add(k); q.push([nx, ny]); } }
    const da = (x, y, w = 1.8) => { for (let r = 0; r <= w; r += 0.1) for (let t = 0; t < 6.3; t += 0.2) if (seen.has(Math.floor((x + Math.cos(t) * r) * s) + "," + Math.floor((y + Math.sin(t) * r) * s))) return true; return false; };
    const draussen = (rein.y > 9000 ? unten : greifbar)(rein.x, rein.y), zurueck = aus && (aus.daten.ziel[1] > 9000 ? unten : greifbar)(...aus.daten.ziel), iaOk = rg.spiel.interaktionen.every((i) => da(i.x + ix, i.y + iy));
    let arena = true, info = ""; const A = INST.get(id)?.arena; if (A) { let f = 0, n = 0; for (let y = A.y - A.r; y <= A.y + A.r; y++) for (let x = A.x - A.r; x <= A.x + A.r; x++) if (Math.hypot(x - A.x, y - A.y) < A.r - 0.6) { n++; if (RI.begehbar(x, y) && da(x, y, 0.3)) f++; }
      const dinge = rg.objekte.filter((o) => Math.hypot(o.x + ix - A.x, o.y + iy - A.y) < A.r - 2 && !/federn|baumstamm|steinsaeule|altar/.test(o.objekt)).map((o) => o.id); arena = f / n > 0.9 && !dinge.length; info = `, Arena ${Math.round(f / n * 100)} % frei`; }
    check((id === "horst_grauhorn" ? rg.region.ebene === "draussen" : rg.region.ebene === "untergrund") && draussen && zurueck && iaOk && arena && (id === "kaesekeller" || INST.has(id)), `${rg.region.name}: eigenes Gebiet (Instanz), Eingang ${rein.id} erreichbar, drinnen alles erreichbar, Ausgang führt zurück${info}`); }
  const horst = region("horst_grauhorn"), rand = horst.gelaende.flatMap((z) => [...z]).filter((c) => c === "X").length; check(rand > 300, `Horst: runde Gipfelfläche, ringsum Abbruchkanten in die Leere (${rand} Felder, nicht begehbar)`);
  const ids = ["horst_grauhorn", "eishoehle_hochpass"].filter((id) => !INST.has(id) || !INST.get(id).raum || !INST.get(id).bossStart); check(!ids.length, "Kennungen nach #163: horst_grauhorn (366|300) und eishoehle_hochpass (367|300) mit Raum und Startfeld des Bosses", ids);
  { const G2 = INST.get("hochlande_bergwerk"), [a, b, c, d] = G2.raum, drin = OBJ.filter((o) => o.region === "hochlande_bergwerk" && o.x >= a && o.x <= c && o.y >= b && o.y <= d).map((o) => o.id); check(!drin.length, "Grumholds Raum in der Halle des Bergwerks [11595, 9602, 11618, 9624] frei von Dingen", drin); }
  const eis = region("eishoehle_hochpass").gelaende.flatMap((z) => [...z]), ii = eis.filter((c) => c === "i").length, II = eis.filter((c) => c === "I").length; check(ii > 80 && Math.abs(ii - II) < 30, `Eishöhle: Eisboden im Schachbrett (${ii} helle, ${II} dunkle Felder) – jedes Feld gut sichtbar`);
  const q = Object.entries(HO.questorte).flatMap(([h, l]) => l.map((id) => [h, id])).filter(([, id]) => !OBJ.some((o) => o.id === id)), fehltQ = q.filter(([, id]) => !IA.has(id) || !(IA.get(id).y > 9000 ? unten : greifbar)(IA.get(id).x, IA.get(id).y)).map(([h, id]) => h + ": " + id);
  check(!fehltQ.length && HO.questorte.h2.length >= 5, `Questorte H1–H4 erreichbar (${Object.values(HO.questorte).flat().length}): Botengänge, Ziegenverstecke, Käsekeller, Steinmann-Pfad zum Horst, Eisrunen`, fehltQ);
  const zw = HO.ziegenwege.filter((z) => !z.weg.every(([x, y]) => greifbar(x, y, 3))); check(HO.ziegenwege.length === 3 && !zw.length, "H2: drei Ziegen-Fluchtwege auf begehbarem Boden", zw.map((z) => z.id)); }

console.log("\nGegner, Streifgebiete, Namen");
const GP = lies("gegnerplaetze.json").plaetze.filter((p) => p.land === "Die Hochlande"), arten = new Set(GP.flatMap((p) => p.gegner)), stufen = GP.map((p) => p.stufe);
const fehltArt = ["hochlandwidder", "hochlandbaer", "bergtroll", "steppenwolf"].filter((a) => !arten.has(a));
check(GP.length > 50 && !fehltArt.length && Math.min(...stufen) >= 44 && Math.max(...stufen) <= 60, `${GP.length} Gegnerplätze der Hochlande, Stufe ${Math.min(...stufen)}–${Math.max(...stufen)}: ${[...arten].join(", ")}`, fehltArt);
const adler = lies("gegnerplaetze.json").plaetze.filter((p) => p.gegner.includes("klippenadler") && p.x > 6800 && p.y < 6300); check(adler.length > 0, `${adler.length} Plätze der Klippenadler an den Hochlande-Küsten`);
const inOrt = GP.filter((p) => Math.hypot(p.x - SX, p.y - SY) < 42 || inMauer(p, 10)); check(!inOrt.length, "kein Gegnerplatz in Steinhag (Ringmauer und 10 Felder davor)", inOrt.map((p) => p.id));
const SG = lies("streifgebiete.json").gebiete.filter((g) => g.land === "Die Hochlande"); check(SG.some((g) => g.gegner === "hochlandbaer") && SG.some((g) => g.gegner === "steppenwolf"), `Streifgebiete der Hochlande: ${SG.map((g) => g.gegner).join(", ")}`);
const ON = lies("ortsnamen.json").orte.map((o) => o.name), nf = ["Die Hochlande", "Steinhag", "Hohe Alm", "Erzberg-Bergwerk", "Passwacht", "Einsiedelei", "Die Furt"].filter((n) => !ON.includes(n)); check(!nf.length, "Ortsnamen auf der Karte", nf);
console.log(ok ? "\nHochlande: alles in Ordnung" : "\nHochlande: FEHLER"); process.exit(ok ? 0 : 1);
