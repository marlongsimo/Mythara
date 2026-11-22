/*
 * Der eigene Held im Browser: laden und speichern, Bilder aus den Editor-Streifen zusammensetzen und färben, das Gesicht fürs Profil.
 * Gemeinsam für den Heldeneditor (heldeneditor.ts) und das Spiel.
 *
 * Speichern: mit Spielerkonto über rpg_held_speichern (Migration 040) und zusätzlich auf dem Gerät („ez_mein_held“);
 * als Gast nur auf dem Gerät. Laden: mit Konto aus dem Konto (das Gerät ist nur Zwischenspeicher), sonst vom Gerät.
 * Bilder: img/figuren-fabrik/held.<g>/editor/<ebene>.webp – Ruhe, erstes Bild, 8 Richtungen nebeneinander (werkzeug/grundfigur.py).
 */
import { Held, Aussehen, heldPruefen, ebenenVon, farbeVon, farbMatrix, figurVon, STARTWAFFEN, aussehenSchluessel, satzVon } from "../../shared/aussehen";
import { kontoRpc, kontoAngemeldet } from "./konto";

const SPEICHER = "ez_mein_held", BILD = "ez_mein_held_bild";
const lies = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const schreib = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* privat */ } };

/** Der Held vom Gerät (sofort, ohne Netz) */
export function heldAufGeraet(): Held | null { try { return heldPruefen(JSON.parse(lies(SPEICHER) || "null")); } catch { return null; } }
/** Der Held: mit Konto aus dem Konto, sonst vom Gerät. null = noch keiner angelegt → Heldeneditor */
export async function heldLaden(): Promise<Held | null> {
  if (await kontoAngemeldet()) { try { const h = heldPruefen(await kontoRpc<unknown>("rpg_held_lesen")); if (h) schreib(SPEICHER, JSON.stringify(h)); return h; } catch { return heldAufGeraet(); } }
  return heldAufGeraet();
}
/** Speichern (Konto und Gerät). Wirft, wenn das Konto ablehnt. */
export async function heldSpeichern(h: Held): Promise<void> {
  if (await kontoAngemeldet()) await kontoRpc("rpg_held_speichern", { p_aussehen: h.aussehen, p_waffe: h.waffe });
  schreib(SPEICHER, JSON.stringify(h)); try { localStorage.removeItem(BILD); } catch { /* privat */ }
}

/* ---------- Bilder ---------- */
export interface EditorAngaben { breite: number; hoehe: number; kopf: { y: number; h: number }; ebenen: string[] }
export interface FigurAngaben { bezug: { haut: number; haar: number; bart: number } }
const BASIS = "../img/figuren-fabrik/";
const json = new Map<string, Promise<unknown>>(), bilder = new Map<string, Promise<HTMLImageElement>>(), gefaerbt = new Map<string, HTMLCanvasElement>();
const holeJson = <T>(url: string): Promise<T> => { let p = json.get(url); if (!p) { p = fetch(url).then((r) => { if (!r.ok) throw new Error(url); return r.json(); }); json.set(url, p); } return p as Promise<T>; };
export function bildLaden(url: string): Promise<HTMLImageElement> { let p = bilder.get(url); if (!p) { p = new Promise((ok, fehler) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => fehler(new Error(url)); i.src = url; }); bilder.set(url, p); } return p; }
export const editorAngaben = (g: string) => holeJson<EditorAngaben>(`${BASIS}held.${g}/editor/editor.json`);
export const figurAngaben = (g: string) => holeJson<FigurAngaben>(`${BASIS}held.${g}/held.${g}.json`);

/** Ein Streifen, gefärbt mit der Farbmatrix (wie im Spiel) – zwischengespeichert je Ebene und Farbe */
async function streifen(g: string, ebene: string, matrix?: number[], quelle: "editor" | "portraet" = "editor"): Promise<HTMLCanvasElement | HTMLImageElement> {
  const bild = await bildLaden(`${BASIS}held.${g}/${quelle}/${ebene}.webp`); if (!matrix) return bild;
  const schluessel = `${quelle}/${g}/${ebene}/${matrix.slice(0, 15).map((v) => v.toFixed(4)).join(",")}`, da = gefaerbt.get(schluessel); if (da) return da;
  const c = document.createElement("canvas"); c.width = bild.naturalWidth; c.height = bild.naturalHeight; const x = c.getContext("2d", { willReadFrequently: true })!; x.drawImage(bild, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height), p = d.data, m = matrix;
  for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; const r = p[i], gr = p[i + 1], b = p[i + 2];
    p[i] = Math.min(255, m[0] * r + m[1] * gr + m[2] * b); p[i + 1] = Math.min(255, m[5] * r + m[6] * gr + m[7] * b); p[i + 2] = Math.min(255, m[10] * r + m[11] * gr + m[12] * b); }
  x.putImageData(d, 0, 0); gefaerbt.set(schluessel, c); return c;
}
/** Alle Ebenen eines Helden in Zeichenreihenfolge (Waffen hinten, Körper, Haut, Bart, Haar, Waffen vorn), gefärbt */
export const portraetAngaben = (g: string) => holeJson<{ groesse: number; ebenen: string[]; bezug: FigurAngaben["bezug"] }>(`${BASIS}held.${g}/portraet/portraet.json`);
export async function heldEbenen(h: Held, mitWaffe = true, quelle: "editor" | "portraet" = "editor"): Promise<(HTMLCanvasElement | HTMLImageElement)[]> {
  const a = h.aussehen, F = quelle === "portraet" ? await portraetAngaben(a.g) : await figurAngaben(a.g), waffen = mitWaffe && quelle === "editor" ? STARTWAFFEN[h.waffe].waffen : [];
  const liste: Promise<HTMLCanvasElement | HTMLImageElement>[] = [];
  for (const w of waffen) liste.push(streifen(a.g, w + ".hinten"));
  for (const e of ebenenVon(a)) liste.push(streifen(a.g, e.ebene, e.faerben ? farbMatrix(farbeVon(a, e.faerben), F.bezug[e.faerben]) : undefined, quelle));
  for (const w of waffen) liste.push(streifen(a.g, w + ".vorn"));
  return Promise.all(liste.map((p) => p.catch(() => null))).then((l) => l.filter((x): x is HTMLCanvasElement | HTMLImageElement => Boolean(x)));
}
/** Den Helden in Richtung r (0 = Osten, 2 = Süden/vorn, im Uhrzeigersinn) zeichnen; ausschnitt: „ganz“ oder „kopf“ */
export async function heldZeichnen(ziel: HTMLCanvasElement, h: Held, r: number, ausschnitt: "ganz" | "kopf", mitWaffe = true): Promise<void> {
  const rr = ((r % 8) + 8) % 8, x = ziel.getContext("2d")!; x.imageSmoothingEnabled = true; x.imageSmoothingQuality = "high";
  if (ausschnitt === "kopf") { /* Nahansicht: eigene Porträts (werkzeug/portraet.py), Kopf und Schultern fast auf Augenhöhe */
    const [P, ebenen] = await Promise.all([portraetAngaben(h.aussehen.g), heldEbenen(h, false, "portraet")]), A = P.groesse; x.clearRect(0, 0, ziel.width, ziel.height);
    for (const b of ebenen) x.drawImage(b, rr * A, 0, A, A, 0, 0, ziel.width, ziel.height); return; }
  const [E, ebenen] = await Promise.all([editorAngaben(h.aussehen.g), heldEbenen(h, mitWaffe)]); x.clearRect(0, 0, ziel.width, ziel.height);
  const W = E.breite, H = E.hoehe, s = Math.min(ziel.width / W, ziel.height / H), dw = W * s, dh = H * s, dx = (ziel.width - dw) / 2, dy = ziel.height - dh;
  for (const b of ebenen) x.drawImage(b, rr * W, 0, W, H, dx, dy, dw, dh);
}
/** Das Gesicht als Bild (für das Profil oben links), zwischengespeichert auf dem Gerät */
export async function heldBildnis(h: Held): Promise<string> {
  const schluessel = aussehenSchluessel(h); try { const da = JSON.parse(lies(BILD) || "null"); if (da && da.s === schluessel) return da.url; } catch { /* neu */ }
  const c = document.createElement("canvas"); c.width = 128; c.height = 128; const x = c.getContext("2d")!;
  const g = x.createRadialGradient(64, 54, 8, 64, 64, 80); g.addColorStop(0, "#5a4a36"); g.addColorStop(1, "#1a140d"); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const k = document.createElement("canvas"); k.width = 160; k.height = 160; await heldZeichnen(k, h, 2, "kopf", false); x.drawImage(k, -16, -2);
  const url = c.toDataURL("image/png"); schreib(BILD, JSON.stringify({ s: schluessel, url })); return url;
}
export { figurVon };
export type { Held, Aussehen };

/* ---------- der Held dieses Spielers im Spiel ---------- */
let aktiv: Held | null = null, bildnis = "";
/** Der eigene Held (null vor dem Start oder in alten Testaufrufen) */
export const aktiverHeld = (): Held | null => aktiv;
/** Beim Spielstart: Held setzen. Der Ausrüstungssatz (Kampfwerte) ist der „Held“ der bisherigen Spiellogik (ez_held). */
export function heldSetzen(h: Held): void { aktiv = h; const satz = satzVon(h); schreib("ez_held", satz); schreib("ez_team", JSON.stringify({ held: satz, mit: [] }));
  void heldBildnis(h).then((url) => { bildnis = url; profilZeigen(); }).catch(() => { /* ohne Bild */ }); }
/** Gesicht und Weg oben links (Profil in der Welt, Leben und Erfahrung im Kampf) – statt der bisherigen fünf Helden */
export function profilZeigen(): void { if (!aktiv) return; const W = STARTWAFFEN[aktiv.waffe];
  for (const id of ["ez-profil-bild", "ez-ich-bild"]) { const b = document.getElementById(id) as HTMLImageElement | null; if (b && bildnis && b.getAttribute("src") !== bildnis) { b.dataset.src = bildnis; b.src = bildnis; } }
  const t = document.getElementById("ez-profil-held"); if (t) t.textContent = `${W.weg} · ${W.name}`; }
export const eigenesBildnis = (): string => bildnis;

/** Bild eines Gegenstands (Ausrüstungsfenster): Waffen aus den Figurenbildern des eigenen Helden, das Hemd als Ausschnitt des Oberkörpers */
export async function gegenstandBild(ziel: HTMLCanvasElement, ebenen: string[] | undefined, brust = false): Promise<void> {
  const h = aktiv || { aussehen: { g: "mann", frisur: "glatze", bart: "ohne", haar: "dunkelbraun", haut: "mittel" }, waffe: "schwert" } as Held;
  const E = await editorAngaben(h.aussehen.g), W = E.breite, H = E.hoehe, c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d", { willReadFrequently: true })!;
  const teile = brust ? ["koerper"] : (ebenen || []).flatMap((e) => [e + ".hinten", e + ".vorn"]);
  const bilder = (await Promise.all(teile.map((t) => bildLaden(`${BASIS}held.${h.aussehen.g}/editor/${t}.webp`).catch(() => null)))).filter((b): b is HTMLImageElement => Boolean(b));
  /* die Richtung, in der der Gegenstand am größten erscheint (ein Schild von vorn, nicht von der Kante); das Hemd von vorn */
  let best = { r: 2, x0: W, y0: H, x1: 0, y1: 0, f: -1 };
  for (const r of brust ? [2] : [0, 1, 2, 3, 4, 5, 6, 7]) { x.clearRect(0, 0, W, H); for (const b of bilder) x.drawImage(b, r * W, 0, W, H, 0, 0, W, H);
    let x0 = W, y0 = H, x1 = 0, y1 = 0, n = 0; const d = x.getImageData(0, 0, W, H).data;
    for (let y = 0; y < H; y++) for (let i = 0; i < W; i++) if (d[(y * W + i) * 4 + 3] > 20) { n++; if (i < x0) x0 = i; if (i > x1) x1 = i; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (n > best.f) best = { r, x0, y0, x1, y1, f: n }; }
  x.clearRect(0, 0, W, H); for (const b of bilder) x.drawImage(b, best.r * W, 0, W, H, 0, 0, W, H);
  let { x0, y0, x1, y1 } = best;
  if (brust && y1 > y0) { const hh = y1 - y0; y0 = y0 + hh * 0.2; y1 = y0 + hh * 0.33; }
  const z = ziel.getContext("2d")!; z.clearRect(0, 0, ziel.width, ziel.height); if (x1 <= x0) return;
  const bw = x1 - x0 + 1, bh = y1 - y0 + 1, s = Math.min(ziel.width * 0.86 / bw, ziel.height * 0.86 / bh); z.imageSmoothingQuality = "high";
  z.drawImage(c, x0, y0, bw, bh, (ziel.width - bw * s) / 2, (ziel.height - bh * s) / 2, bw * s, bh * s);
}
