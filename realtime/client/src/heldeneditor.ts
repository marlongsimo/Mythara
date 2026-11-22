/*
 * Der Heldeneditor (echtzeit/held.html): nach der Registrierung oder beim ersten Spielstart ohne Helden.
 * Schritt 1 Aussehen: Geschlecht, Frisur und Bart (Pfeile), Haar- und Hautfarbe; große Nahansicht des Gesichts zum Drehen, daneben die ganze Figur.
 * Schritt 2 Startwaffe: Schwert und Schild, Bogen oder Stab. „Abenteuer beginnen“ speichert (Konto oder Gerät) und geht ins Spiel –
 * dort beginnt man in der Waldmark oder an der gemerkten Stelle. ?weiter=… wird ans Spiel weitergegeben.
 */
import { FRISUREN, BAERTE, HAARFARBEN, HAUTFARBEN, STARTWAFFEN, STANDARD, Held, Startwaffe } from "../../shared/aussehen";
import { heldLaden, heldSpeichern, heldZeichnen, editorAngaben } from "./held";
import { querformat } from "./quer";

const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector(s) as T;
const RNAME = ["Rechts", "Vorn rechts", "Vorn", "Vorn links", "Links", "Hinten links", "Hinten", "Hinten rechts"];
let held: Held = JSON.parse(JSON.stringify(STANDARD)), richtung = 2, zeichnet = 0;

async function zeichnen() { const n = ++zeichnet; await Promise.all([heldZeichnen($<HTMLCanvasElement>("#nahbild"), held, richtung, "kopf", false), heldZeichnen($<HTMLCanvasElement>("#ganzbild"), held, richtung, "ganz", false)]); if (n !== zeichnet) return; }
function anzeigen() {
  const a = held.aussehen; document.querySelectorAll<HTMLElement>("[data-g]").forEach((b) => b.classList.toggle("ist-gewaehlt", b.dataset.g === a.g));
  $("#frisur").textContent = FRISUREN[a.g].find((f) => f.id === a.frisur)!.name; $("#bartfeld").hidden = a.g !== "mann"; $("#bart").textContent = BAERTE.find((b) => b.id === a.bart)!.name;
  document.querySelectorAll<HTMLElement>("#haar [data-k]").forEach((b) => b.classList.toggle("ist-aktiv", b.dataset.k === a.haar)); $("#haarname").textContent = HAARFARBEN[a.haar].name;
  document.querySelectorAll<HTMLElement>("#haut [data-k]").forEach((b) => b.classList.toggle("ist-aktiv", b.dataset.k === a.haut)); $("#hautname").textContent = HAUTFARBEN[a.haut].name;
  $("#richtung").textContent = RNAME[richtung]; void zeichnen();
}
const css = (rgb: number[]) => `rgb(${rgb.join(",")})`;
function farben(id: string, liste: Record<string, { name: string; rgb: [number, number, number] }>, feld: "haar" | "haut") {
  const el = $("#" + id); el.innerHTML = Object.entries(liste).map(([k, v]) => `<button class="mu-slot farbe" style="--f:${css(v.rgb)}" data-k="${k}" aria-label="${v.name}" title="${v.name}"></button>`).join("");
  el.addEventListener("click", (e) => { const b = (e.target as HTMLElement).closest<HTMLElement>("[data-k]"); if (!b) return; held.aussehen[feld] = b.dataset.k!; anzeigen(); });
}
function drehen(d: number) { richtung = (richtung + d + 8) % 8; anzeigen(); }

/* Schritt 2: Startwaffen */
async function waffenZeigen() {
  const el = $("#waffen"); el.innerHTML = (Object.keys(STARTWAFFEN) as Startwaffe[]).map((w) => { const W = STARTWAFFEN[w];
    return `<button class="mu-tafel mu-schlicht waffe${w === held.waffe ? " ist-gewaehlt" : ""}" data-w="${w}" aria-pressed="${w === held.waffe}"><canvas width="340" height="420" data-bild="${w}"></canvas><em>${W.weg}</em><h3>${W.name}</h3><p>${W.text}</p></button>`; }).join("");
  for (const c of Array.from(el.querySelectorAll<HTMLCanvasElement>("canvas[data-bild]"))) void heldZeichnen(c, { ...held, waffe: c.dataset.bild as Startwaffe }, 1, "ganz", true);
}
function schritt(n: 1 | 2) { $("#schritt1").hidden = n !== 1; $("#schritt2").hidden = n !== 2; $("#s1").classList.toggle("an", n === 1); $("#s2").classList.toggle("an", n === 2); if (n === 2) void waffenZeigen(); scrollTo({ top: 0 }); }

async function start() {
  const da = await heldLaden().catch(() => null); if (da) held = da;
  void editorAngaben("mann"); void editorAngaben("frau");
  farben("haar", HAARFARBEN, "haar"); farben("haut", HAUTFARBEN, "haut");
  document.querySelectorAll<HTMLElement>("[data-g]").forEach((b) => b.addEventListener("click", () => { const g = b.dataset.g as "mann" | "frau"; if (g === held.aussehen.g) return;
    held.aussehen.g = g; held.aussehen.frisur = FRISUREN[g][g === "mann" ? 1 : 1].id; if (g === "frau") held.aussehen.bart = "ohne"; anzeigen(); }));
  document.querySelectorAll<HTMLElement>("[data-wahl]").forEach((b) => b.addEventListener("click", () => { const a = held.aussehen, d = Number(b.dataset.d);
    if (b.dataset.wahl === "frisur") { const l = FRISUREN[a.g], i = l.findIndex((f) => f.id === a.frisur); a.frisur = l[(i + d + l.length) % l.length].id; }
    else { const i = BAERTE.findIndex((x) => x.id === a.bart); a.bart = BAERTE[(i + d + BAERTE.length) % BAERTE.length].id; }
    anzeigen(); }));
  $("#links").onclick = () => drehen(-1); $("#rechts").onclick = () => drehen(1);
  /* Ziehen in der Nahansicht dreht den Kopf */
  const nah = $("#nah"); let x0: number | null = null;
  nah.addEventListener("pointerdown", (e) => { x0 = e.clientX; nah.setPointerCapture(e.pointerId); });
  nah.addEventListener("pointermove", (e) => { if (x0 === null || Math.abs(e.clientX - x0) < 36) return; drehen(e.clientX > x0 ? -1 : 1); x0 = e.clientX; });
  nah.addEventListener("pointerup", () => { x0 = null; }); nah.addEventListener("pointercancel", () => { x0 = null; });
  addEventListener("keydown", (e) => { if ($("#schritt1").hidden) return; if (e.key === "ArrowLeft") drehen(-1); else if (e.key === "ArrowRight") drehen(1); });
  $("#weiter").onclick = () => schritt(2); $("#zurueck").onclick = () => schritt(1);
  $("#waffen").addEventListener("click", (e) => { const b = (e.target as HTMLElement).closest<HTMLElement>("[data-w]"); if (!b) return; held.waffe = b.dataset.w as Startwaffe;
    document.querySelectorAll<HTMLElement>("[data-w]").forEach((x) => { x.classList.toggle("ist-gewaehlt", x === b); x.setAttribute("aria-pressed", String(x === b)); }); });
  $("#beginnen").onclick = async () => { const k = $<HTMLButtonElement>("#beginnen"), m = $("#meldung"); k.disabled = true; m.textContent = "";
    try { await heldSpeichern(held); const weiter = new URLSearchParams(location.search).get("weiter") || ""; location.href = "./" + (weiter.startsWith("?") ? weiter : ""); }
    catch (e) { m.textContent = "Speichern hat nicht geklappt: " + ((e as Error).message || "unbekannt") + ". Bitte noch einmal versuchen."; k.disabled = false; } };
  anzeigen();
}
querformat(); /* ab dem Heldeneditor: Querformat auf Handy und Tablet */
void start();
/* für Prüfungen im Browser */
(window as unknown as { EZH: unknown }).EZH = { get held() { return held; }, get richtung() { return richtung; } };
