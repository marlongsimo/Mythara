/*
 * Riftmere – Kennungen von Questfiguren und Questdingen (Hinweis Quests/Leitstelle 28.11.): der Server nimmt im Gespräch ({ t: "rede"/"antwort", npc })
 * und an Questdingen ({ t: "qding", id }) nur KENNUNG_MAX Zeichen an (Schutz vor überlangen Eingaben). Eine längere Kennung würde gekürzt und nie gefunden.
 * Geprüft: alle Quests und Entwürfe – Kennungen kurz genug, nur a–z, 0–9, _ und -, und keine zwei verschiedenen gleich nach dem Kürzen.
 * Aufruf (im Ordner realtime): node test/kennungen.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-kennungen-${process.pid}.mjs`);
await build({ stdin: { contents: 'export { QUESTS } from "./shared/quests"; export * as E from "./shared/quest_entwuerfe"; export { KENNUNG_MAX } from "./shared/questbau";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { QUESTS, E, KENNUNG_MAX } = await import(datei);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
const alle = [...QUESTS]; for (const v of Object.values(E)) for (const x of Array.isArray(v) ? v : [v]) { const q = x && x.q ? x.q : x; /* ENTWUERFE: { q, wartet } */ if (q && typeof q === "object" && q.id && (q.figuren || q.objekte) && !alle.some((y) => y.id === q.id)) alle.push(q); }
const ids = { figur: new Map(), ding: new Map() };
for (const q of alle) { for (const F of q.figuren || []) ids.figur.set(F.id, [...(ids.figur.get(F.id) || []), q.id]); for (const O of q.objekte || []) ids.ding.set(O.id, [...(ids.ding.get(O.id) || []), q.id]); }
console.log(`\n${alle.length} Quests und Entwürfe · ${ids.figur.size} Figuren · ${ids.ding.size} Questdinge · Grenze ${KENNUNG_MAX} Zeichen`);
for (const [art, M] of Object.entries(ids)) { const k = [...M.keys()];
  const lang = k.filter((x) => x.length > KENNUNG_MAX); check(!lang.length, `${art}: alle höchstens ${KENNUNG_MAX} Zeichen (längste ${Math.max(...k.map((x) => x.length))})${lang.length ? " – zu lang: " + lang.join(", ") : ""}`);
  const form = k.filter((x) => !/^[a-z0-9_-]+$/.test(x)); check(!form.length, `${art}: nur a–z, 0–9, _ und -${form.length ? " – " + form.join(", ") : ""}`);
  const gekuerzt = new Map(); for (const x of k) { const g = x.slice(0, KENNUNG_MAX); gekuerzt.set(g, [...(gekuerzt.get(g) || []), x]); }
  const doppelt = [...gekuerzt.values()].filter((v) => v.length > 1); check(!doppelt.length, `${art}: keine zwei gleich nach dem Kürzen${doppelt.length ? " – " + doppelt.map((v) => v.join(" = ")).join("; ") : ""}`); }
console.log(f ? `\nKennungen: ${f} FEHLER` : "\nKennungen: alles in Ordnung");
process.exit(f ? 1 : 0);
