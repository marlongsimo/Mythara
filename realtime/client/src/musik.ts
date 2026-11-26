/*
 * Riftmere – Hintergrundmusik im Spiel (26.11.2026): „Sanctuary of the Ancient“ in Dauerschleife, leise.
 * Startet mit der ersten Berührung oder Taste (Browser und iOS spielen erst nach einer Bedienung Ton ab), pausiert, wenn das Spiel
 * im Hintergrund ist (App verlassen, anderer Tab). Abschalten: Einstellungen im Spiel → „Musik“ (merkt sich das Gerät).
 */
const AUS = "ez_musik_aus", DATEI = "musik/heiligtum.mp3", LAUT = 0.35;
let el: HTMLAudioElement | null = null, gestartet = false, laeuft = false;
export function musikAus(): boolean { try { return localStorage.getItem(AUS) === "1"; } catch { return false; } }
function spielen(): void { if (!gestartet || musikAus() || document.hidden) return;
  if (!el) { el = new Audio(DATEI); el.loop = true; el.volume = LAUT; el.preload = "auto"; }
  if (laeuft && !el.paused) return; void el.play().then(() => { laeuft = true; }).catch(() => { laeuft = false; /* noch keine Bedienung: beim nächsten Antippen */ }); }
function anhalten(): void { if (el) el.pause(); laeuft = false; }
/** Musik ein- oder ausschalten (Einstellungen) */
export function musikAusSetzen(aus: boolean): void { try { localStorage.setItem(AUS, aus ? "1" : "0"); } catch { /* privat */ } if (aus) anhalten(); else spielen(); }
/** Einmal beim Betreten der Spielwelt */
export function musikStarten(): void { if (gestartet) return; gestartet = true; spielen();
  const bedienung = () => { if (!laeuft) spielen(); }; for (const t of ["pointerdown", "keydown", "touchend"]) addEventListener(t, bedienung, { passive: true });
  document.addEventListener("visibilitychange", () => { if (document.hidden) anhalten(); else spielen(); });
  addEventListener("pagehide", anhalten); }
