/*
 * Mythara – Abmelden aus dem Spiel (wie OSRS):
 *  · 5 Minuten ohne Eingabe (Tippen, Klicken, Taste, Mausrad) → zurück auf die Willkommensseite mit Hinweis. Der Server meldet nach 5½ Minuten ab (Sicherheitsnetz).
 *  · Auf einem anderen Gerät mit demselben Konto angemeldet (Server: Code 4409) → dieses Gerät geht auf die Willkommensseite, das neue übernimmt den Helden.
 *  Steht der Held gerade im Kampf, bleibt er auf dem Server noch stehen und wehrt sich (bis 10 s ohne Kampf, höchstens 60 s) – siehe server/src/index.ts.
 *  Solange es Eingaben gibt, schicken die Verbindungen jede Minute ein Lebenszeichen („da“), damit z. B. Chatten nicht als untätig zählt.
 */
export const UNTAETIG_MS = 5 * 60 * 1000;
let letzte = Date.now(), weg = false, an = false;
/** Gab es in der letzten Minute (plus Spielraum) eine Eingabe? */
export const kuerzlichAktiv = (): boolean => Date.now() - letzte < 70000;
/** Aus dem Spiel abmelden: grund "ruhe" (untätig) oder "anderes" (anderes Gerät). Die Verbindungen schließen beim Seitenwechsel. */
export function abmelden(grund: "ruhe" | "anderes"): void {
  if (weg) return; weg = true;
  try { sessionStorage.removeItem("ez__lager"); } catch { /* privat */ } /* zurück ins Spiel nur über „Ins Spiel“ */
  location.replace("willkommen.html?grund=" + grund + (location.search ? "&weiter=" + encodeURIComponent(location.search) : ""));
}
/** Ab jetzt zählt Inaktivität (im Spiel, nicht im Heldeneditor) */
export function untaetigWaechter(): void {
  if (an) return; an = true; letzte = Date.now();
  const da = () => { letzte = Date.now(); };
  for (const t of ["pointerdown", "keydown", "wheel", "touchstart"]) addEventListener(t, da, { capture: true, passive: true });
  setInterval(() => { if (Date.now() - letzte >= UNTAETIG_MS) abmelden("ruhe"); }, 5000);
}
/* für Prüfungen: Inaktivität vorspulen */
(window as unknown as { EZ_UNTAETIG?: (ms: number) => void }).EZ_UNTAETIG = (ms: number) => { letzte -= ms; };
