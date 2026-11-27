/*
 * Riftmere – Arbeits-Bewegungen anderer Spieler (Issue #67): was ein Held gerade tut (Holz fällen, abbauen, angeln, werken),
 * mit welchem Werkzeug und wohin er schaut. Der Browser meldet es mit der Stelle (welt „pos“), der Weltserver prüft und gibt es
 * an die Spieler in Sichtweite weiter (Fremder.w), deren Browser spielt die Bewegung an der fremden Figur ab.
 *   a: hieb (Werkzeugschlag: Holzbeil, Spitzhacke, Sichel …) · werken (Handwerk, Kochen, Brauen) · angeln (Rute bleibt draußen)
 *   u: 3D-Modell des Werkzeugs (img/…glb) · c: Bewegung (Clip der Figuren-Fabrik) · x, y: wohin (Weltfelder)
 */
export interface Arbeit { a: "hieb" | "werken" | "angeln"; u?: string; c?: string; x?: number; y?: number }
const ARTEN = new Set(["hieb", "werken", "angeln"]);
/** Aus unbekannter Quelle prüfen (Browser → Server): nur bekannte Arten, Werkzeug als Pfad unter img/, Bewegung als kurzer Name, Stelle als Zahl */
export function arbeitPruefen(roh: unknown): Arbeit | undefined { if (!roh || typeof roh !== "object") return undefined; const o = roh as Record<string, unknown>;
  if (typeof o.a !== "string" || !ARTEN.has(o.a)) return undefined; const w: Arbeit = { a: o.a as Arbeit["a"] };
  if (typeof o.u === "string" && /^(\.\.\/)?img\/[A-Za-z0-9_./-]{1,150}\.glb$/.test(o.u) && !o.u.replace(/^\.\.\//, "").includes("..")) w.u = o.u;
  if (typeof o.c === "string" && /^[a-z0-9_]{1,30}$/.test(o.c)) w.c = o.c;
  const z = (v: unknown) => typeof v === "number" && Number.isFinite(v) && Math.abs(v) < 1e5; if (z(o.x) && z(o.y)) { w.x = Math.round((o.x as number) * 10) / 10; w.y = Math.round((o.y as number) * 10) / 10; }
  return w; }
export const arbeitSchluessel = (w?: Arbeit): string => (w ? `${w.a}|${w.u || ""}|${w.c || ""}|${w.x ?? ""}|${w.y ?? ""}` : "");
/** So lange gilt ein gemeldeter Schlag (hieb, werken) ohne neuen (ms); Angeln, solange es nicht beendet wird (höchstens so lange ohne Meldung) */
export const ARBEIT_HALTEN_MS = 3000, ANGELN_HALTEN_MS = 60000;
