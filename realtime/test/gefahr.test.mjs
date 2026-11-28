/*
 * Riftmere – Gefahr eines Gegners für diesen Helden (KANON 9360e367b, gegnerstufen.md Variante A): Farbe aus der Kampfrechnung
 * (Trefferchance × mittlerer Schaden je Sekunde beider Seiten → Zeit bis zum Sieg / Zeit bis zum Tod). Grenzen: Vorschlag (GEFAHR_GRENZEN).
 * Aufruf (im Ordner realtime): node test/gefahr.test.mjs
 */
import { build } from "esbuild";
import { tmpdir } from "node:os";
import { join } from "node:path";
const datei = join(tmpdir(), `riftmere-gefahr-${process.pid}.mjs`);
await build({ stdin: { contents: 'export * from "./shared/gefahr"; export { kampfwerte, NULL_XP, xpFuer } from "./shared/kampfwerte"; export { startAusruestung } from "./shared/gegenstaende"; export { MONSTER } from "./shared/config";',
  resolveDir: new URL("..", import.meta.url).pathname, loader: "ts" }, bundle: true, platform: "node", format: "esm", outfile: datei, logLevel: "error" });
const { kampfSchaetzung, gefahr, GEFAHR_GRENZEN, kampfwerte, NULL_XP, xpFuer, startAusruestung, MONSTER } = await import(datei);
let f = 0; const check = (ok, t) => { console.log((ok ? "  ✓ " : "  ✗ ") + t); if (!ok) f++; };
const held = (L, t) => { const X = { ...NULL_XP }; for (const k of Object.keys(NULL_XP)) X[k] = xpFuer(L); return kampfwerte(X, { waffe: "eidschwert" + t, nebenhand: "sternenschild" + t, brust: "eisenwacht" + t, kopf: "eisenwachthelm" + t, beine: "eisenbeinschienen" + t }, 1); };
const frisch = kampfwerte({ ...NULL_XP }, startAusruestung("schwert"), 1), h30 = held(30, "_episch"), h60 = held(60, "_legendaer"), h75 = held(75, "_mythisch");
console.log("\nVier Stufen aus der Kampfrechnung");
check(GEFAHR_GRENZEN.map((g) => g.stufe).join() === "gruen,gelb,orange,rot", "grün, gelb, orange, rot");
check(gefahr(frisch, "mooshocker") === "gelb" && gefahr(frisch, "heidewolf") === "rot" && gefahr(h30, "mooshocker") === "gruen", "frischer Held: Mooshocker gelb, Heidewolf rot · Held 30: Mooshocker grün");
check(gefahr(h60, "bergtroll") === "gelb" && gefahr(h30, "bergtroll") === "rot" && gefahr(h75, "bergtroll") === "gruen", "Bergtroll: Held 30 rot, Held 60 gelb, Held 75 grün");
check(gefahr(h60, "grumhold") === "rot" && gefahr(h60, "grumhold", { lp: Math.round(MONSTER.grumhold.lp * 0.2), abwehrMal: 0.5, schadenMal: 0.2 }) !== "rot", "Grumhold für Held 60: stark rot, in der Quest-Fassung nicht");
{ const L = [1, 30, 60, 75, 99].map((n) => n === 1 ? frisch : held(n, n >= 65 ? "_mythisch" : n >= 45 ? "_legendaer" : "_episch")).map((kw) => kampfSchaetzung(kw, "bergtroll").verhaeltnis);
  check(L.every((v, i) => i === 0 || v <= L[i - 1]), `je stärker der Held, desto kleiner das Verhältnis (${L.map((v) => v.toFixed(2)).join(" → ")})`); }
check(gefahr(h60, "zielscheibe") === null || MONSTER.zielscheibe.v2, "Gegner ohne Werte: keine Farbe (nur die Stufe)");
console.log(f ? `\nGefahr: ${f} FEHLER` : "\nGefahr: alles in Ordnung");
process.exit(f ? 1 : 0);
