/*
 * Mythara – Abmelden aus dem Spiel (wie OSRS):
 *  · 5 Minuten ohne Eingabe (Tippen, Klicken, Taste, Mausrad) → zurück auf die Willkommensseite mit Hinweis. Der Server meldet nach 5½ Minuten ab (Sicherheitsnetz).
 *  · Ein Konto, ein Gerät (Server: sitz.ts): Wer zuerst in der Welt ist, bleibt. Ein späteres Gerät wird abgewiesen (Code 4410) und landet mit
 *    „Es ist aktuell schon ein Gerät in Riftmere“ auf der Willkommensseite. Frei wird das Konto durch Abmelden, durch die Zwangsabmeldung bei
 *    Inaktivität oder – nach einem Verbindungsabbruch – erst nach der Frist (5 Minuten). Dafür schließen Abmelden und Zwangsabmeldung
 *    alle Verbindungen mit dem Grund „abmelden“ (kontoFreigeben); ein bloßes Schließen der Seite gibt das Konto nicht frei.
 *  · 4409: dieselbe Seitenkennung hat sich neu verbunden (etwa ein kopierter Tab) – dieser Tab geht auf die Willkommensseite.
 *  Steht der Held gerade im Kampf, bleibt er auf dem Server noch stehen und wehrt sich (bis 10 s ohne Kampf, höchstens 60 s) – siehe server/src/index.ts.
 *  Solange es Eingaben gibt, schicken die Verbindungen jede Minute ein Lebenszeichen („da“), damit z. B. Chatten nicht als untätig zählt.
 */
export const UNTAETIG_MS = 5 * 60 * 1000;
let letzte = Date.now(), weg = false, an = false;
/** Gab es in der letzten Minute (plus Spielraum) eine Eingabe? */
export const kuerzlichAktiv = (): boolean => Date.now() - letzte < 70000;
/* Offene Verbindungen zum Spielserver (Welt, Kampfgebiet): beim Abmelden mit dem Grund „abmelden“ schließen – erst das gibt das Konto auf dem Server frei */
const freigeber = new Set<() => void>();
/** Eine Verbindung meldet sich an: f schließt sie mit (1000, "abmelden"). Rückgabe: wieder austragen (wenn die Verbindung zu ist). */
export function beimAbmelden(f: () => void): () => void { freigeber.add(f); return () => { freigeber.delete(f); }; }
/** Abmelden (Knopf oder Zwangsabmeldung): alle Verbindungen mit „abmelden“ schließen, damit ein anderes Gerät sofort ins Spiel kann */
export function kontoFreigeben(): void { for (const f of [...freigeber]) try { f(); } catch { /* schon zu */ } freigeber.clear(); }
/** Aus dem Spiel abmelden: grund "ruhe" (untätig – gibt das Konto frei), "anderes" (dieselbe Seite neu verbunden) oder "bereits" (Konto auf einem anderen Gerät;
 *  rest: Sekunden, bis es nach einem Verbindungsabbruch dort frei wird). Die übrigen Verbindungen schließen beim Seitenwechsel. */
export function abmelden(grund: "ruhe" | "anderes" | "bereits", rest?: number): void {
  if (weg) return; weg = true;
  if (grund === "ruhe") kontoFreigeben();
  try { sessionStorage.removeItem("ez__lager"); } catch { /* privat */ } /* zurück ins Spiel nur über „Ins Spiel“ */
  location.replace("willkommen.html?grund=" + grund + (rest !== undefined && rest > 0 ? "&rest=" + Math.ceil(rest) : "") + (location.search ? "&weiter=" + encodeURIComponent(location.search) : ""));
}
/** Abweisung 4410 vom Server: „bereits angemeldet;rest=123“ – Sekunden bis zur Freigabe, fehlt, wenn das andere Gerät verbunden ist */
export const restAus = (grund: string): number | undefined => { const m = /rest=(\d+)/.exec(grund || ""); return m ? Number(m[1]) : undefined; };
/** Ab jetzt zählt Inaktivität (im Spiel, nicht im Heldeneditor) */
export function untaetigWaechter(): void {
  if (an) return; an = true; letzte = Date.now();
  const da = () => { letzte = Date.now(); };
  for (const t of ["pointerdown", "keydown", "wheel", "touchstart"]) addEventListener(t, da, { capture: true, passive: true });
  setInterval(() => { if (Date.now() - letzte >= UNTAETIG_MS) abmelden("ruhe"); }, 5000);
}
/* für Prüfungen: Inaktivität vorspulen */
(window as unknown as { EZ_UNTAETIG?: (ms: number) => void }).EZ_UNTAETIG = (ms: number) => { letzte -= ms; };
