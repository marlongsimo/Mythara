/*
 * Riftmere – Konto löschen über den Spielserver (POST /konto/loeschen): nur mit gültiger Anmeldung, richtigem Passwort und von den eigenen Seiten.
 * Nachgebildete Supabase: /auth/v1/user, /auth/v1/token (Passwort), DELETE /auth/v1/admin/users/{id}. Aufruf: node test/konto-loeschen.test.mjs (nach node build.mjs)
 */
import { createServer } from "node:http"; import { spawn } from "node:child_process";
let f = 0; const check = (ok, t) => { console.log((ok ? "✓ " : "✗ ") + t); if (!ok) f++; };
const KONTEN = { tok_anna_xxxxxxxxxxxxxxxxxxxxxxxxxx: { id: "a001", email: "anna@x.de", pw: "geheim123" }, tok_cara_xxxxxxxxxxxxxxxxxxxxxxxxxx: { id: "c003", email: "cara@x.de", pw: "pw-cara-1" }, tok_gast_xxxxxxxxxxxxxxxxxxxxxxxxxx: { id: "g009", is_anonymous: true } }, GELOESCHT = [];
const sb = createServer((req, res) => { let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => { const send = (code, o) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
  if (req.url === "/auth/v1/user") { const k = KONTEN[(req.headers.authorization || "").replace("Bearer ", "")]; return k && !GELOESCHT.includes(k.id) ? send(200, { id: k.id, email: k.email, is_anonymous: Boolean(k.is_anonymous) }) : send(401, {}); }
  if (req.url === "/auth/v1/token?grant_type=password") { const a = JSON.parse(b), k = Object.values(KONTEN).find((x) => x.email === a.email); return k && k.pw === a.password ? send(200, { access_token: "neu" }) : send(400, { error: "invalid_grant" }); }
  if (req.method === "DELETE" && req.url.startsWith("/auth/v1/admin/users/")) { if (req.headers.authorization !== "Bearer sb_secret_test") return send(401, {}); GELOESCHT.push(decodeURIComponent(req.url.split("/").pop())); return send(200, {}); }
  send(404, {}); }); }).listen(8796);
const srv = spawn(process.execPath, ["server/dist/server.js"], { env: { ...process.env, PORT: "8786", SUPABASE_URL: "http://localhost:8796", SUPABASE_SERVICE_KEY: "sb_secret_test", ERLAUBTE_HERKUNFT: "http://localhost:8765" }, stdio: ["ignore", "pipe", "pipe"] });
let log = ""; srv.stdout.on("data", (d) => (log += d)); srv.stderr.on("data", (d) => (log += d)); await new Promise((r) => setTimeout(r, 1200));
const loesch = async (token, passwort, origin = "http://localhost:8765") => { const r = await fetch("http://localhost:8786/konto/loeschen", { method: "POST", headers: { origin, "content-type": "application/json", authorization: "Bearer " + token }, body: JSON.stringify({ passwort }) }); return { code: r.status, ...(await r.json().catch(() => ({}))) }; };
try {
  const vor = await fetch("http://localhost:8786/konto/loeschen", { method: "OPTIONS", headers: { origin: "https://riftmere.de", "access-control-request-method": "POST" } });
  check(vor.status === 204 && vor.headers.get("access-control-allow-origin") === "https://riftmere.de", "Vorabfrage von riftmere.de: erlaubt");
  check((await loesch("tok_anna_xxxxxxxxxxxxxxxxxxxxxxxxxx", "geheim123", "https://boese.example")).code === 403 && !GELOESCHT.length, "Von einer fremden Seite: abgelehnt, nichts gelöscht");
  check((await loesch("kaputt", "geheim123")).code === 400, "Ohne gültige Anmeldung: abgelehnt");
  check((await loesch("tok_gast_xxxxxxxxxxxxxxxxxxxxxxxxxx", "x")).code === 401, "Gastkonto: abgelehnt");
  const falsch = await loesch("tok_anna_xxxxxxxxxxxxxxxxxxxxxxxxxx", "falsch"); check(falsch.code === 403 && /Passwort/.test(falsch.text) && !GELOESCHT.length, `Falsches Passwort: „${falsch.text}“, nichts gelöscht`);
  for (let i = 0; i < 4; i++) await loesch("tok_cara_xxxxxxxxxxxxxxxxxxxxxxxxxx", "falsch");
  await loesch("tok_cara_xxxxxxxxxxxxxxxxxxxxxxxxxx", "falsch"); const gesperrt = await loesch("tok_cara_xxxxxxxxxxxxxxxxxxxxxxxxxx", "pw-cara-1");
  check(gesperrt.code === 429 && !GELOESCHT.includes("c003"), "Nach 5 Fehlversuchen: 15 Minuten gesperrt, auch mit richtigem Passwort");
  const ok = await loesch("tok_anna_xxxxxxxxxxxxxxxxxxxxxxxxxx", "geheim123"); check(ok.code === 200 && ok.ok && GELOESCHT.join() === "a001", `Richtiges Passwort: genau dieses Konto gelöscht (${GELOESCHT.join()})`);
  check((await loesch("tok_anna_xxxxxxxxxxxxxxxxxxxxxxxxxx", "geheim123")).code === 401, "Danach: die alte Anmeldung gilt nicht mehr");
  check((await (await fetch("http://localhost:8786/")).json()).ok === true, "Lebenszeichen des Servers unverändert");
} catch (e) { check(false, "Ausnahme: " + e.stack); }
srv.kill(); sb.close(); if (f) console.log(log.slice(-1500)); console.log(f ? `\n${f} Prüfungen fehlgeschlagen` : "\nAlle Prüfungen bestanden"); process.exit(f ? 1 : 0);
