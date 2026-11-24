/*
 * Mythara – Querformat ab dem Heldeneditor (Handy und Tablet). Anmeldung und Website bleiben, wie das Gerät gehalten wird.
 *
 * Websites können das Gerät nicht selbst drehen. Wo der Browser es erlaubt (Android, Chrome), sperrt das Spiel beim ersten Antippen
 * im Vollbild auf Querformat (screen.orientation.lock braucht einen Fingertipp und Vollbild). iPhone und iPad erlauben keine Sperre:
 * Dort – und überall, solange das Gerät hochkant gehalten wird – liegt ein Hinweis „Bitte Gerät drehen“ über dem Spiel.
 * Am PC (Maus) passiert nichts. Auf dem iPhone wird die Sperre trotzdem versucht (falls Apple sie einmal erlaubt) – als Web-App vom
 * Home-Bildschirm gilt zusätzlich "orientation": "landscape" aus echtzeit/mythara.webmanifest. Prüfen auf dem Gerät: ?quertest=1.
 */
const STIL = `
#ez-quer { position: fixed; inset: 0; z-index: 2147483000; display: none; flex-direction: column; align-items: center; justify-content: center; gap: 22px; padding: 24px;
  background: radial-gradient(circle at 50% 40%, #2a1d10, #0b0805 70%); color: #f3e6c4; text-align: center; font: 500 16px/1.4 Inter, system-ui, sans-serif; touch-action: none; }
#ez-quer.an { display: flex; }
#ez-quer b { font: 600 22px/1.2 Cinzel, Georgia, serif; color: #f3d895; letter-spacing: .04em; }
#ez-quer svg { width: 120px; height: 120px; color: #d6b066; animation: ez-quer-dreh 2.4s ease-in-out infinite; }
#ez-quer button { margin-top: 4px; padding: 12px 22px; border-radius: 999px; border: 1px solid #d6b066; background: linear-gradient(#5a3e1c, #2e1f0e); color: #ffe7b0; font: 600 15px Cinzel, Georgia, serif; letter-spacing: .05em; }
#ez-quer button[hidden] { display: none; }
@keyframes ez-quer-dreh { 0%, 20% { transform: rotate(0deg); } 50%, 80% { transform: rotate(-90deg); } 100% { transform: rotate(0deg); } }
`;
const HANDY = () => matchMedia("(pointer: coarse)").matches && Math.min(screen.width, screen.height) <= 1366;
const HOCH = matchMedia("(orientation: portrait)");
const IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
type Ausrichtung = ScreenOrientation & { lock?: (o: string) => Promise<void> };
const sperrbar = () => !IOS && Boolean(screen.orientation && typeof (screen.orientation as Ausrichtung).lock === "function") && typeof document.documentElement.requestFullscreen === "function";

/* iPhone-Versuche: Variante 1 = Sperre im Browser (screen.orientation.lock), Variante 2 = als Web-App vom Home-Bildschirm (Manifest mit
   "orientation": "landscape"). Beide werden auch auf dem iPhone probiert; ?quertest=1 zeigt unten links, was das Gerät dazu sagt. */
const APP = () => matchMedia("(display-mode: standalone), (display-mode: fullscreen)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
const hatLock = () => Boolean(screen.orientation && typeof (screen.orientation as Ausrichtung).lock === "function");
let TEST = false; try { if (new URLSearchParams(location.search).get("quertest") === "1") sessionStorage.setItem("ez_quertest", "1"); if (new URLSearchParams(location.search).get("quertest") === "0") sessionStorage.removeItem("ez_quertest"); TEST = sessionStorage.getItem("ez_quertest") === "1"; } catch { /* privat */ }
let versuch = "noch keiner (einmal auf die Seite tippen)", diag: HTMLElement | null = null;
function bericht() { if (!diag) return;
  diag.textContent = [`Gerät: ${IOS ? "iPhone/iPad" : HANDY() ? "Handy/Tablet" : "PC"}`, `Web-App (Home-Bildschirm): ${APP() ? "ja" : "nein"}`, `orientation.lock vorhanden: ${hatLock() ? "ja" : "nein"}`,
    `Vollbild möglich: ${typeof document.documentElement.requestFullscreen === "function" ? "ja" : "nein"}`, `Lage jetzt: ${HOCH.matches ? "hochkant" : "quer"} (${(screen.orientation && screen.orientation.type) || "?"})`, `Sperr-Versuch: ${versuch}`].join("\n"); }

let an = false, gesperrt = false, el: HTMLElement | null = null;
/** Vollbild und Querformat-Sperre (nur nach einem Fingertipp möglich). Auf dem iPhone wird die Sperre ohne Vollbild versucht (Safari kennt dort kein Vollbild). */
async function sperren(): Promise<void> {
  if (gesperrt || !(sperrbar() || (IOS && hatLock()))) { if (!hatLock()) versuch = "nicht möglich: orientation.lock fehlt"; bericht(); return; }
  try { if (!IOS && !document.fullscreenElement) await document.documentElement.requestFullscreen({ navigationUI: "hide" }); await (screen.orientation as Ausrichtung).lock!("landscape"); gesperrt = true; versuch = "geklappt – Querformat gesperrt"; }
  catch (e) { versuch = "abgelehnt: " + ((e as Error).name || "") + " " + ((e as Error).message || ""); /* nicht erlaubt: der Hinweis bleibt, bis man dreht */ }
  zeigen(); bericht();
}
function zeigen() { if (!el) return; el.classList.toggle("an", an && HANDY() && HOCH.matches); }

/** Ab hier (Heldeneditor, Spielwelt) gilt Querformat auf Handy und Tablet */
export function querformat(): void {
  if (an) return; an = true;
  if (TEST) { diag = document.createElement("pre"); diag.id = "ez-quertest"; diag.style.cssText = "position:fixed;left:6px;bottom:6px;z-index:2147483600;margin:0;padding:8px 10px;max-width:92vw;white-space:pre-wrap;background:rgba(0,0,0,.82);color:#9ff59f;font:12px/1.35 ui-monospace,monospace;border-radius:6px;pointer-events:none";
    document.body.appendChild(diag); bericht(); for (const t of ["resize", "orientationchange"]) addEventListener(t, bericht); if (!HANDY()) addEventListener("pointerup", () => void sperren(), { once: true }); }
  if (!HANDY()) return;
  const st = document.createElement("style"); st.textContent = STIL; document.head.appendChild(st);
  el = document.createElement("div"); el.id = "ez-quer"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Bitte Gerät drehen");
  el.innerHTML = `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="20" y="6" width="24" height="44" rx="4"/><path d="M29 44h6"/><path d="M50 30a20 20 0 0 1-8 18M42 48l1-6M42 48l-6-1"/></svg>
    <b>Bitte dreh dein Gerät</b><span>Mythara spielt sich im Querformat.</span><button type="button"${sperrbar() ? "" : " hidden"}>Querformat einschalten</button>`;
  document.body.appendChild(el);
  (el.querySelector("button") as HTMLElement).addEventListener("click", () => void sperren());
  /* nach dem Drehen die Seite auf null zurück: sonst bleibt sie auf dem iPhone verschoben und Tippen trifft daneben */
  const zurueck = () => { zeigen(); for (const t of [0, 150, 400, 900]) setTimeout(() => { if (scrollY || scrollX) scrollTo(0, 0); }, t); };
  HOCH.addEventListener("change", zurueck); addEventListener("resize", zurueck); addEventListener("orientationchange", zurueck);
  document.addEventListener("fullscreenchange", () => { if (!document.fullscreenElement) gesperrt = false; zeigen(); });
  /* beim ersten Antippen gleich sperren (Android): das Gerät dreht sich dann von selbst nicht mehr ins Hochformat */
  const erstes = () => { removeEventListener("pointerup", erstes, true); void sperren(); }; addEventListener("pointerup", erstes, true);
  zeigen();
}
