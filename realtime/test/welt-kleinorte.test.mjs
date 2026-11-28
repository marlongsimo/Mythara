/*
 * Welt-Test Kleinorte (Leitlinie 28.11., kleinorte_bauen.py): Jeder geplante Ort der freigegebenen Schritte ist gebaut, steht mit Namen auf der Karte
 * (ortsnamen.json, Feld „ko“), hat eine erreichbare Lesestelle „ko_<nr>_l“, liegt nicht in einem Streifgebiet (außer Banditenlager, oder das Gebiet meidet den Ort), und alle
 * Kennungen „ko_…“ sind weltweit eindeutig und kurz (≤ 40 Zeichen).
 * Aufruf (im Ordner realtime, nach der Kette): node test/welt-kleinorte.test.mjs
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { gemeinsam, bibliothek, region, WELT } from "../werkzeug/welt/laden.mjs";

let ok = true; const check = (b, t, e = []) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) { ok = false; for (const z of e.slice(0, 15)) console.log("      " + z); } };
const lies = (...p) => JSON.parse(readFileSync(join(WELT, ...p), "utf8")), C = 32;
const K = lies("kleinorte_orte.json"), G = await gemeinsam(), bib = bibliothek(), R = new G.WeltRaster();
const geplant = K.schritte.flatMap((s) => lies("plaene", `kleinorte_${s}.json`).orte);
console.log(`\nKleinorte: ${K.orte.length} gebaut, ${geplant.length} geplant (${K.schritte.join(", ")})`);

const ids = new Map(), lesen = new Map();
for (const n of readdirSync(join(WELT, "regionen"))) { const rp = join(WELT, "regionen", n, "region.json"); if (!existsSync(rp)) continue; const r = JSON.parse(readFileSync(rp, "utf8")); if (r.entwurf || r.ebene) continue;
  const ux = r.ursprung[0] * C, uy = r.ursprung[1] * C, obj = lies("regionen", n, "objekte.json"), sp = lies("regionen", n, "spiel.json");
  const ko = obj.filter((o) => String(o.id).startsWith("ko_")), ia = (sp.interaktionen || []).filter((i) => String(i.id).startsWith("ko_"));
  if (!ko.length && !ia.length) continue;
  for (const c of G.chunksBauen(region(n), bib.gelaende, bib.objekte).chunks) R.dazu(c);
  for (const o of [...ko, ...ia]) ids.set(o.id, (ids.get(o.id) || 0) + 1);
  for (const i of ia) lesen.set(i.id, { x: i.x + ux, y: i.y + uy, text: i.daten?.text || "" }); }

const fehlt = geplant.filter((q) => !K.orte.some((o) => o.name === q.name)).map((q) => `${q.name} (${q.x}|${q.y})`);
check(!fehlt.length, "jeder geplante Ort ist gebaut", fehlt);
const on = lies("ortsnamen.json").orte, ohneName = K.orte.filter((o) => !on.some((p) => p.ko === o.id && p.name === o.name)).map((o) => o.name);
check(!ohneName.length, "jeder Kleinort steht mit Namen auf der Karte", ohneName);
const namen = new Map(); for (const p of on) namen.set(p.name, (namen.get(p.name) || 0) + 1);
const doppelt = K.orte.filter((o) => namen.get(o.name) > 1).map((o) => o.name);
check(!doppelt.length, "kein Kleinort-Name gibt es zweimal auf der Karte", doppelt);
const doppelId = [...ids].filter(([, n]) => n > 1).map(([i]) => i), lang = [...ids.keys()].filter((i) => i.length > 40);
check(!doppelId.length && !lang.length, "Kennungen „ko_…“ eindeutig und höchstens 40 Zeichen", [...doppelId, ...lang]);
const ohneL = K.orte.filter((o) => !lesen.has(o.lesestelle)).map((o) => o.name), zuL = K.orte.filter((o) => lesen.has(o.lesestelle) && !R.begehbar(lesen.get(o.lesestelle).x, lesen.get(o.lesestelle).y)).map((o) => o.name);
check(!ohneL.length, "jeder Kleinort hat eine Lesestelle", ohneL);
check(!zuL.length, "jede Lesestelle steht auf begehbarem Boden", zuL);
const leer = K.orte.filter((o) => lesen.has(o.lesestelle) && !lesen.get(o.lesestelle).text.startsWith(o.name)).map((o) => o.name);
check(!leer.length, "der Text jeder Lesestelle beginnt mit dem Namen des Orts", leer);
const streif = lies("streifgebiete.json").gebiete, drin = K.orte.filter((o) => o.art !== "banditen").flatMap((o) => streif.filter((g) => o.x >= g.rechteck[0] && o.x <= g.rechteck[2] && o.y >= g.rechteck[1] && o.y <= g.rechteck[3]
  && !(g.meiden || []).some((m) => Math.hypot(m.x - o.x, m.y - o.y) < 2 && m.r >= 16)).map((g) => `${o.name} in ${g.name}`));   /* ein Meidekreis um den Ort hält das Rudel fern */
check(!drin.length, "kein Kleinort liegt in einem Streifgebiet, das ihn nicht meidet (Banditenlager dürfen)", drin);
console.log(ok ? "\nKleinorte: alles in Ordnung" : "\nKleinorte: FEHLER"); process.exit(ok ? 0 : 1);
