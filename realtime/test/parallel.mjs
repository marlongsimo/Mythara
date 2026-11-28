/*
 * Riftmere – Tests gleichzeitig laufen lassen, ohne dass sie sich in die Quere kommen.
 * Jeder Test startet eigene Server auf festen Ports. Dieser Starter liest die Ports aus der Testdatei
 * (listen(…), PORT: "…", localhost:…) und lässt nur Tests gleichzeitig laufen, die keinen Port teilen.
 *
 * Aufruf im Ordner realtime/ (nach node build.mjs):
 *   node test/parallel.mjs                       alle Tests aus test/server-tests.sh, bis zu 6 gleichzeitig
 *   node test/parallel.mjs questbau quest01-welt  nur diese
 *   GLEICHZEITIG=3 node test/parallel.mjs        weniger gleichzeitig (schwache Maschine)
 *   DAUER_MERKEN=1 node test/parallel.mjs        Dauern in test/dauer.json festhalten (lange Tests starten zuerst)
 */
import { readFileSync, mkdtempSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const liste = () => { const t = readFileSync(new URL("./server-tests.sh", import.meta.url), "utf8"); const m = /TESTS=\(([\s\S]*?)^\)/m.exec(t); /* Ende: eine Zeile nur mit „)“ – Klammern in Kommentaren zählen nicht */
  return m[1].split("\n").map((z) => z.replace(/#.*/, "").trim()).filter(Boolean); };
const tests = process.argv.slice(2).length ? process.argv.slice(2) : liste();
const N = Math.max(1, Number(process.env.GLEICHZEITIG) || 6), LOGS = process.env.TEST_LOGS || mkdtempSync(join(tmpdir(), "tests-"));
const portsVon = (t) => { const q = readFileSync(new URL(`./${t}.test.mjs`, import.meta.url), "utf8"), p = new Set();
  for (const re of [/listen\((\d{4,5})\)/g, /PORT:\s*"(\d{4,5})"/g, /localhost:(\d{4,5})/g]) for (const m of q.matchAll(re)) p.add(m[1]);
  /* 8765 steht in Server-Tests nur als erlaubte Herkunft (origin) – dort läuft kein Server; nur Browser-Tests öffnen ihn wirklich */
  if (!/listen\(8765\)|8765\)\.listen|route\(\s*["'`]http:\/\/localhost:8765/.test(q)) p.delete("8765"); return p; };
/* Lange Tests zuerst (Dauer vom letzten Lauf, test/dauer.json) – so ist der Lauf am kürzesten */
const DAUER_DATEI = new URL("./dauer.json", import.meta.url); let dauer = {}; try { dauer = JSON.parse(readFileSync(DAUER_DATEI, "utf8")); } catch { /* erster Lauf */ }

const offen = tests.map((t) => ({ t, ports: portsVon(t) })).sort((a, b) => (dauer[b.t] || 1) - (dauer[a.t] || 1)), laufend = new Map(), fehler = [], start = Date.now(), neu = { ...dauer };
const frei = (x) => [...laufend.values()].every((l) => ![...x.ports].some((p) => l.ports.has(p)));
await new Promise((fertig) => {
  const weiter = () => {
    while (laufend.size < N) { const i = offen.findIndex(frei); if (i < 0) break; const x = offen.splice(i, 1)[0], s = Date.now(); let aus = "";
      const k = spawn(process.execPath, [`test/${x.t}.test.mjs`], { stdio: ["ignore", "pipe", "pipe"] }); laufend.set(x.t, x);
      k.stdout.on("data", (d) => (aus += d)); k.stderr.on("data", (d) => (aus += d));
      const uhr = setTimeout(() => k.kill("SIGKILL"), 600000);
      k.on("close", (code) => { clearTimeout(uhr); laufend.delete(x.t); writeFileSync(join(LOGS, x.t + ".log"), aus);
        const d = ((Date.now() - s) / 1000).toFixed(0).padStart(4); neu[x.t] = Math.round((Date.now() - s) / 1000);
        if (code === 0) console.log(`✓ ${x.t.padEnd(24)} ${d}s`); else { console.log(`✗ ${x.t.padEnd(24)} ${d}s`); console.log(aus.split("\n").slice(-40).join("\n")); fehler.push(x.t); }
        if (!offen.length && !laufend.size) fertig(); else weiter(); }); }
  };
  weiter();
});
/* neue Dauern nur auf Wunsch zurückschreiben (sonst ändert jeder Lauf eine Datei im Repo): DAUER_MERKEN=1 node test/parallel.mjs */
if (process.env.DAUER_MERKEN === "1") try { writeFileSync(DAUER_DATEI, JSON.stringify(neu, null, 1) + "\n"); } catch { /* egal */ }
console.log(`Dauer: ${((Date.now() - start) / 1000).toFixed(0)}s · ${tests.length} Tests · ${fehler.length} fehlgeschlagen · bis zu ${N} gleichzeitig · Logs: ${LOGS}`);
if (fehler.length) { console.log("Fehlgeschlagen: " + fehler.join(" ")); process.exit(1); }
