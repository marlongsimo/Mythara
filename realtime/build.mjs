// Baut den Client (nach ../echtzeit, wird von GitHub Pages ausgeliefert) und den Server (nach server/dist).
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
const v = Date.now().toString(36), aus = new URL("../echtzeit/", import.meta.url).pathname;
/* Namen der Gegenstände aus den Datenblättern der Figuren-Fabrik (fabrik/assets/…/datenblatt.json): eine Quelle für die Anzeigenamen.
   Fehlt der Ordner (z. B. auf einem Server ohne Fabrik), bleibt die zuletzt erzeugte Datei shared/gegenstand_namen.ts. */
{ const { readdirSync, existsSync, statSync } = await import("node:fs"), wurzel = new URL("../fabrik/assets/", import.meta.url).pathname, namen = {};
  const suche = (d) => { for (const n of readdirSync(d)) { const f = d + "/" + n; if (statSync(f).isDirectory()) suche(f); else if (n === "datenblatt.json") { try { const j = JSON.parse(readFileSync(f, "utf8")); if (j.gegenstand && j.name) namen[j.gegenstand] = j.name; } catch { /* kaputtes Datenblatt: überspringen */ } } } };
  if (existsSync(wurzel)) { suche(wurzel.replace(/\/$/, "")); const sortiert = Object.fromEntries(Object.entries(namen).sort(([a], [b]) => a.localeCompare(b)));
    writeFileSync("shared/gegenstand_namen.ts", "/* Erzeugt von build.mjs aus fabrik/assets/…/datenblatt.json – nicht von Hand ändern. Anzeigenamen je Gegenstand-ID. */\nexport const NAMEN_AUS_DATENBLAETTERN: Record<string, string> = " + JSON.stringify(sortiert, null, 1) + ";\n"); } }
mkdirSync(aus, { recursive: true });
await build({ entryPoints: ["client/src/main.ts"], bundle: true, minify: true, format: "iife", target: "es2020", outfile: aus + "spiel.js", legalComments: "none", define: { "process.env.NODE_ENV": '"production"' } });
writeFileSync(aus + "index.html", readFileSync("client/index.html", "utf8").replaceAll("__V__", v));
/* Login-Fenster und Landing-Page (seit 24.11.2026) mit gemeinsamer Gestaltung und den Neuigkeiten */
writeFileSync(aus + "anmelden.html", readFileSync("client/anmelden.html", "utf8").replaceAll("__V__", v));
writeFileSync(aus + "willkommen.html", readFileSync("client/willkommen.html", "utf8").replaceAll("__V__", v));
writeFileSync(aus + "datenschutz.html", readFileSync("client/datenschutz.html", "utf8").replaceAll("__V__", v)); /* Datenschutzerklärung Riftmere */
writeFileSync(aus + "impressum.html", readFileSync("client/impressum.html", "utf8").replaceAll("__V__", v)); /* Impressum Riftmere */
writeFileSync(aus + "wache-9gv41g35qkwx.html", readFileSync("client/wache-9gv41g35qkwx.html", "utf8").replaceAll("__V__", v)); /* Admin-Seite (nicht verlinkt) */
writeFileSync(aus + "start.css", readFileSync("client/start.css", "utf8"));
writeFileSync(aus + "start-passen.js", readFileSync("client/start-passen.js", "utf8"));
writeFileSync(aus + "mythara.webmanifest", readFileSync("client/mythara.webmanifest", "utf8")); /* Web-App vom Home-Bildschirm: Querformat, Vollbild */
/* Querformat schon ab dem Login (client/src/quer.ts): hochkant „Bitte dreh dein Gerät“, auf Android Vollbild + Querformat-Sperre beim ersten Tippen */
await build({ stdin: { contents: 'import { querformat } from "./client/src/quer"; querformat();', resolveDir: ".", loader: "ts" }, bundle: true, minify: true, format: "iife", target: "es2020", outfile: aus + "quer.js", legalComments: "none" });
writeFileSync(aus + "neuigkeiten.json", readFileSync("client/neuigkeiten.json", "utf8"));
/* Heldeneditor: nach der Registrierung und beim ersten Spielstart ohne Helden */
await build({ entryPoints: ["client/src/heldeneditor.ts"], bundle: true, minify: true, format: "iife", target: "es2020", outfile: aus + "held.js", legalComments: "none" });
writeFileSync(aus + "held.html", readFileSync("client/held.html", "utf8").replaceAll("__V__", v));
/* Echtzeit-3D-Figuren (Versuch, ?figur3d=1): three.js in eigener Datei, wird nur bei Bedarf geladen */
await build({ entryPoints: ["client/src/echt3d/darsteller.ts"], bundle: true, minify: true, format: "iife", target: "es2020", outfile: aus + "figur3d.js", legalComments: "none" });
/* Modulare 3D-Figuren (getrennt vom Spiel): isolierte Testszene und die Vorschau der Figuren-Pipeline */
await build({ entryPoints: ["client/src/figurentest.ts"], bundle: true, minify: true, format: "iife", target: "es2020", outfile: aus + "figurentest.js", legalComments: "none", define: { "process.env.NODE_ENV": '"production"' } });
writeFileSync(aus + "figurentest.html", readFileSync("client/figurentest.html", "utf8").replace("__V__", v));
/* 3D-Prototyp der Welt (eigene Seite, nicht Teil des Spiels) */
await build({ entryPoints: ["client/src/welt3d/main.ts"], bundle: true, minify: true, format: "iife", target: "es2020", outfile: aus + "welt3d.js", legalComments: "none" });
await build({ entryPoints: ["client/src/welt3d/spiel.ts"], bundle: true, minify: true, format: "iife", target: "es2020", outfile: aus + "welt3d-spiel.js", legalComments: "none" });
writeFileSync(aus + "welt3d.html", readFileSync("client/welt3d.html", "utf8").replace("__V__", v));
writeFileSync(aus + "figurenvorschau.html", readFileSync("character-pipeline/preview/index.html", "utf8"));
/* Animations-Testseite (nicht verlinkt): alle 3D-Figuren mit Bewegungen, Teilen, ausgelagerten Teilen und deren Seltenheitsstufen */
{ const ORD = new URL("../img/figuren-echt3d/", import.meta.url).pathname, STUFEN = ["training", "gewoehnlich", "selten", "episch", "legendaer", "mythisch"], figuren = [];
  for (const f of readdirSync(ORD).filter((d) => d.endsWith(".json")).sort()) { const id = f.slice(0, -5); if (!existsSync(ORD + id + ".glb")) continue;
    const d = JSON.parse(readFileSync(ORD + f, "utf8")), teile = d.teile || {}, stufen = {}, dateien = existsSync(ORD + id + ".teile") ? readdirSync(ORD + id + ".teile") : [];
    for (const t of Object.keys(teile)) { const s = STUFEN.filter((st) => dateien.includes(`${t}.${st}.glb`)); if (s.length) stufen[t] = s; }
    const haut = existsSync(ORD + "haut") ? readdirSync(ORD + "haut").filter((h) => h.startsWith(id + ".")).map((h) => h.slice(id.length + 1, -5)) : [];
    figuren.push({ id, teile, aktionen: d.aktionen || {}, stufen, haut }); }
  writeFileSync(aus + "animationen-liste.json", JSON.stringify({ figuren }));
  writeFileSync(aus + "animationen.html", readFileSync("client/animationen.html", "utf8").replace(/__V__/g, v)); }
await build({ entryPoints: ["server/src/index.ts"], bundle: true, platform: "node", format: "cjs", target: "node20", outfile: "server/dist/server.js", external: ["bufferutil", "utf-8-validate"] });
await build({ stdin: { contents: 'export * from "./shared/sim"; export * from "./shared/config"; export * from "./shared/karte"; export * from "./shared/karten"; export * from "./shared/kampfwerte"; export { GEGENSTAENDE, startAusruestung } from "./shared/gegenstaende"; export * as QB from "./shared/questbau"; export { QUEST3 } from "./shared/quest03"; export { QUEST2 } from "./shared/quest02"; export { QUEST1 } from "./shared/quest01"; export { QUEST_A1 } from "./shared/quest_a1"; export { QUEST_A2 } from "./shared/quest_a2"; export { QUEST_A3 } from "./shared/quest_a3"; export { QUEST_B1 } from "./shared/quest_b1"; export { WEGSTEIN_ZIELE, wegZiel } from "./shared/wegstein"; export { SEELENLICHTER, LICHTER, LADUNG_MAX } from "./shared/splitterbinden"; export { wegzielFrei } from "./shared/quests"; export { LAEDEN, ladenOffen } from "./shared/laeden"; export { GEGENSTAENDE as GEG, VERBRAUCH } from "./shared/gegenstaende"; export { QUESTS } from "./shared/quests"; export { REZEPTE } from "./shared/handwerk";', resolveDir: ".", loader: "ts" }, bundle: true, platform: "node", format: "esm", target: "node20", outfile: "test/sim.gebaut.mjs" });
console.log("gebaut: echtzeit/ (Client), server/dist/server.js (Server)");
