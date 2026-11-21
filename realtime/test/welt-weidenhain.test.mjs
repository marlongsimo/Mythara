/*
 * Mythara Echtzeit – Prüfung von Weidenhain (Region der offenen Welt, nachgebaut nach dem gemalten Dorf), ohne Browser.
 * Vom Dorfeingang erreichbar: alle Türen und Lesestellen; keine Figur steht in einem Haus, im Wasser oder auf einem Ding.
 * Aufruf (im Ordner realtime): node test/welt-weidenhain.test.mjs
 */
import { gemeinsam, bibliothek, region } from "../werkzeug/welt/laden.mjs";
let ok = true; const check = (b, t, e = []) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) { ok = false; for (const z of e.slice(0, 12)) console.log("      " + z); } };
const G = await gemeinsam(), bib = bibliothek(), d = region("weidenhain"), bau = G.chunksBauen(d, bib.gelaende, bib.objekte);
const R = new G.WeltRaster(); for (const c of bau.chunks) R.dazu(c);
const [OX, OY] = d.region.ursprung.map((v) => v * 32), BB = d.region.chunks[0] * 32, HH = d.region.chunks[1] * 32, w = (x, y) => ({ x: x + OX, y: y + OY });
const erreicht = new Uint8Array(BB * HH), s = d.spiel.start[0], q = [[Math.floor(s[0]), Math.floor(s[1])]]; erreicht[q[0][1] * BB + q[0][0]] = 1;
while (q.length) { const [i, j] = q.pop(); for (const [a, b] of [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]]) { if (a < 0 || b < 0 || a >= BB || b >= HH || erreicht[b * BB + a] || R.fels(a + OX, b + OY)) continue; erreicht[b * BB + a] = 1; q.push([a, b]); } }
const nah = (x, y, r = 1.5) => { for (let dy = -r; dy <= r; dy += 0.5) for (let dx = -r; dx <= r; dx += 0.5) { const i = Math.floor(x + dx), j = Math.floor(y + dy); if (i >= 0 && j >= 0 && i < BB && j < HH && Math.hypot(dx, dy) <= r && erreicht[j * BB + i]) return true; } return false; };
console.log("\nWeidenhain");
check(R.begehbar(...Object.values(w(s[0], s[1]))), `Start am Dorfeingang ist frei (${s.join(" | ")})`);
const ziele = d.spiel.interaktionen.map((i) => ({ id: i.id, x: i.x, y: i.y })), nicht = ziele.filter((z) => !nah(z.x, z.y));
check(nicht.length === 0, `erreichbar: ${ziele.map((z) => z.id).join(", ")}`, nicht.map((z) => z.id));
const fig = d.spiel.figuren.filter((f) => !R.begehbar(...Object.values(w(f.x, f.y))) || !nah(f.x, f.y, 1));
check(fig.length === 0, `Dorfbewohner stehen frei und erreichbar (${d.spiel.figuren.map((f) => f.id).join(", ")})`, fig.map((f) => f.id));
const dinge = ["weidenhain_kornspeicher_01", "weidenhain_bauernhaus_01", "weidenhain_muehle_01", "dorf_festfeuer_01", "dorf_wehr_01", "dorf_steinring_01"].filter((id) => !d.objekte.some((o) => o.objekt === id));
check(dinge.length === 0, "Kornspeicher, Bauernhaus, Mühle, Erntefeuer, Wehr und Linde im Steinring stehen im Dorf", dinge);
const def = new Map(bib.objekte.objekte.map((x) => [x.id, x])), haeuser = d.objekte.filter((x) => (def.get(x.objekt) || {}).kategorie === "gebaeude");
const tueren = haeuser.map((h) => { const i = def.get(h.objekt).interaktion || { dx: 0, dy: 0.7 }; return { id: h.id, x: h.x + i.dx, y: h.y + i.dy }; }), zu = tueren.filter((t) => !nah(t.x, t.y, 1.2));
check(haeuser.length >= 25 && zu.length === 0, `alle ${haeuser.length} Haustüren sind vom Dorfeingang erreichbar (auch über die Brücken)`, zu.map((t) => t.id));
const plaene = new Map(JSON.parse((await import("node:fs")).readFileSync(new URL("../welt/bibliothek/bauplaene.json", import.meta.url), "utf8")).bauplaene.map((p) => [p.id, p]));
const koerper = haeuser.flatMap((h) => (plaene.get(h.objekt) || { koerper: [] }).koerper.map((k) => ({ id: h.id, r: [h.x + k.x, h.y - k.d - k.t, h.x + k.x + k.b, h.y - k.d] })));
const ueber = []; for (let i = 0; i < koerper.length; i++) for (let j = i + 1; j < koerper.length; j++) { const a = koerper[i].r, b = koerper[j].r; if (koerper[i].id !== koerper[j].id && a[0] < b[2] + 0.6 && b[0] < a[2] + 0.6 && a[1] < b[3] + 0.6 && b[1] < a[3] + 0.6) ueber.push(koerper[i].id + " / " + koerper[j].id); }
check(ueber.length === 0, "keine zwei Gebäude berühren sich (mindestens 0,6 Felder Abstand)", ueber);
const schlecht = koerper.filter(({ id, r }) => { if (id.startsWith("muehle")) return false; /* die Mühle steht mit dem Rad am Graben */ for (let y = Math.floor(r[1]); y < r[3]; y++) for (let x = Math.floor(r[0]); x < r[2]; x++) { const c = (d.gelaende[y] || "")[x]; if (c === "~" || c === "e" && y < r[3] - 1) return true; } return false; });
check(schlecht.length === 0, "kein Gebäude steht im Wasser oder auf einer Gasse", [...new Set(schlecht.map((k) => k.id))]);
const wasser = d.gelaende.reduce((n, z) => n + [...z].filter((c) => c === "~").length, 0); check(wasser > 150, `der Mühlgraben fließt durchs Dorf (${wasser} Felder Wasser)`);
console.log(ok ? "\nWeidenhain: alles in Ordnung" : "\nWeidenhain: FEHLER"); process.exit(ok ? 0 : 1);
