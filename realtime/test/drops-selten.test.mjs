/*
 * Riftmere – Legendär und Mythisch als seltene Drops (Ausgabe 1, Entscheidung des Nutzers 27.11.), ohne Browser und ohne Server.
 * Würfelt je Gegner 10.000 Kills mit der Schleife aus shared/sim.ts (je Wurf höchstens ein Treffer) und prüft die Quote gegen die Vorgabe,
 * dazu: die Pools „@legendaer“ und „@mythisch“ lösen in Teile aller drei Stile auf, unter Kampfstufe 80 fällt nichts davon,
 * die Quest-Fassung eines Bosses bekommt die Boss-Würfe nicht (stark), und der Glutsteinschild fällt bei der Sandmutter 1:60.
 * Aufruf (im Ordner realtime, nach node build.mjs): node test/drops-selten.test.mjs
 */
import { MONSTER, GEGENSTAENDE } from "./sim.gebaut.mjs";
/* wie beuteAufloesen in shared/gegenstaende.ts (dort nicht im Test-Bündel): Pool je Seltenheit ohne Nebenhand, Questlohn, Passives, Stufe 70, Werkzeug, Rabenset */
const beuteAufloesen = (g, zufall) => { const sel = g.slice(1), werkzeug = /^(holzbeil|spitzhacke|angel)/;
  const L = Object.values(GEGENSTAENDE).filter((G) => G.seltenheit === sel && G.platz && G.platz !== "nebenhand" && !G.untauschbar && !G.passiv && !(G.anforderung && G.anforderung.level >= 70) && !werkzeug.test(G.id) && !/^raben/.test(G.id));
  return L.length ? L[Math.floor(zufall() * L.length)].id : null; };
let ok = true; const check = (b, t) => { console.log(`  ${b ? "✓" : "✗"} ${t}`); if (!b) ok = false; };
/* fester Zufall, damit der Test nicht wackelt */
let s = 20261127; const zf = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32; };
const kills = (art, n, quest = false) => { const D = MONSTER[art].drops || [], z = {}; for (let i = 0; i < n; i++) for (const R of D) { if (R.stark && quest) continue; let r = zf() * 100;
  for (const d of R.wurf) { if (r < d.chance) { z[d.g] = (z[d.g] || 0) + 1; break; } r -= d.chance; } } return z; };
const N = 10000, nahe = (ist, eins) => Math.abs(ist - N / eins) <= Math.max(4, 4 * Math.sqrt(N / eins)); /* vier Standardabweichungen */

console.log("Legendär und Mythisch (je 10.000 Kills)");
const VORGABE = [
  [["eisgolem", "bergtroll", "tundraelch", "frostwolf", "drakling", "turmwaechter", "hochlandbaer"], "@legendaer", 400],
  [["eisgolem", "bergtroll", "tundraelch"], "@mythisch", 1500],
  [["kerkermeister", "grabwaechter", "karawanenraeuber_saebel", "karawanenraeuber_bogen", "hochlandwidder", "klippenadler", "glutskorpion", "ockerhyaene", "glutgeist", "eissplitter_waechter"], "@legendaer", 600],
  [["grumhold", "sturmschwinge", "frostwitwe", "sandmutter", "oberster_rabenpriester", "grauer_hauptmann"], "@mythisch", 400],
  [["tjark", "wrackkapitaen", "federmutter"], "@legendaer", 150],
];
for (const [arten, g, eins] of VORGABE) { const ist = arten.map((a) => [a, kills(a, N)[g] || 0]);
  /* ein Gegner kann denselben Pool schon vorher (aus einem älteren Wurf) haben – dann zählt mindestens die Vorgabe */
  check(ist.every(([, n]) => nahe(n, eins) || n > N / eins), `${g} 1:${eins} bei ${arten.length} Gegnern (${ist.map(([a, n]) => `${a} ${n}`).join(", ")}; erwartet ≈ ${Math.round(N / eins)})`); }

console.log("\nNicht vom Strand");
{ const schwach = Object.keys(MONSTER).filter((a) => typeof MONSTER[a].stufe === "number" && MONSTER[a].stufe < 80);
  const mit = schwach.filter((a) => (MONSTER[a].drops || []).some((R) => R.wurf.some((d) => d.g === "@legendaer" || d.g === "@mythisch")));
  check(schwach.length > 20 && !mit.length, `kein Gegner unter Kampfstufe 80 wirft Legendär oder Mythisch (${schwach.length} geprüft${mit.length ? ", aber: " + mit.join(", ") : ""})`); }

console.log("\nDie Pools: alle drei Stile");
for (const p of ["@legendaer", "@mythisch"]) { const arten = new Set(), stile = new Set(); for (let i = 0; i < 4000; i++) { const id = beuteAufloesen(p, zf), G = id && GEGENSTAENDE[id];
    if (!G) continue; arten.add(G.seltenheit); if (G.waffe) stile.add(G.waffe.art); }
  check(arten.size === 1 && arten.has(p.slice(1)) && ["nah", "fern", "magie"].every((x) => stile.has(x)), `${p} gibt nur ${p.slice(1)}e Teile, mit Waffen für nah, fern und magie (${[...stile].join(", ")})`); }

console.log("\nBosse");
{ const quest = kills("sandmutter", N, true)["@mythisch"] || 0; check(quest === 0, `die Quest-Fassung der Sandmutter wirft kein @mythisch (${quest})`);
  const schild = kills("sandmutter", N)["glutsteinschild"] || 0; check(nahe(schild, 60), `Glutsteinschild bei der Sandmutter 1:60 (${schild} in ${N}, erwartet ≈ ${Math.round(N / 60)})`); }

console.log(ok ? "\nSeltene Drops: alles in Ordnung" : "\nSeltene Drops: FEHLER"); process.exit(ok ? 0 : 1);
