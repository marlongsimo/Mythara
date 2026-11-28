/*
 * Mythara – Ein Konto, ein Gerät (Kontosperre).
 *
 * Wer zuerst in die Welt geht, hat den Sitz. Kein anderes Gerät kommt hinein, solange der Sitz besteht – egal, ob das erste Gerät gerade
 * etwas tut oder nur dasteht (früher zählte ein Gerät nach 20 s ohne Nachricht als frei, und das neue verdrängte es).
 * Frei wird der Sitz nur
 *  · durch Abmelden (Knopf „Abmelden“; der Browser schließt seine Verbindungen mit dem Grund „abmelden“),
 *  · durch die Zwangsabmeldung bei Inaktivität (Browser nach 5 min, Server nach 5½ min),
 *  · nach einem Verbindungsabbruch erst, wenn die Frist abgelaufen ist (SITZ_FRIST_MS, Standard 5 Minuten).
 * Dasselbe Gerät (gleiche Seitenkennung „geraet“ aus dem sessionStorage) darf jederzeit wieder verbinden, auch während der Frist – sonst
 * sperrte schon jedes kurze Funkloch das eigene Konto aus.
 */
import type { WebSocket } from "ws";

export const SITZ_FRIST_MS = Number(process.env.SITZ_FRIST_MS) || 5 * 60 * 1000;

interface Sitz { geraet: string; offen: Set<WebSocket>; /** schon in der Welt (sonst gibt das Schließen den Sitz sofort frei) */ drin: boolean;
  /** Verbindung weg: frei ab diesem Zeitpunkt (ms) */ frei: number; /** abgemeldet: frei, sobald keine Verbindung mehr offen ist */ ab: boolean }
const sitze = new Map<string, Sitz>(), vonWs = new Map<WebSocket, string>();
let ohne = 0;
/** Seitenkennung prüfen; ohne Kennung (alter Browserstand) bekommt jede Verbindung eine eigene – sie gilt dann als eigenes Gerät */
export const geraetVon = (g: unknown): string => { const s = String(g || "").slice(0, 40); return /^[A-Za-z0-9_-]{4,40}$/.test(s) ? s : "ohne-" + ++ohne; };

function aktuell(nutzer: string, jetzt = Date.now()): Sitz | undefined { const s = sitze.get(nutzer); if (!s) return undefined;
  if (!s.offen.size && (s.ab || (s.frei && jetzt >= s.frei))) { sitze.delete(nutzer); return undefined; } return s; }

/** Ist das Konto auf einem anderen Gerät? rest: ms bis zur Freigabe nach einem Verbindungsabbruch, null = das andere Gerät ist verbunden */
export function belegt(nutzer: string, geraet: string): { belegt: false } | { belegt: true; rest: number | null } {
  const jetzt = Date.now(), s = aktuell(nutzer, jetzt); if (!s || s.geraet === geraet) return { belegt: false };
  return { belegt: true, rest: s.offen.size ? null : Math.max(0, s.frei - jetzt) }; }

/** Sitz nehmen (sofort nach der Anmeldung, vor jedem Warten auf die Datenbank – so kommen zwei gleichzeitige Anmeldungen nie beide durch).
 *  false: belegt, die Verbindung muss abgelehnt werden. */
export function nehmen(nutzer: string, geraet: string, ws: WebSocket): boolean {
  if (belegt(nutzer, geraet).belegt) return false;
  let s = aktuell(nutzer); if (!s) { s = { geraet, offen: new Set(), drin: false, frei: 0, ab: false }; sitze.set(nutzer, s); }
  s.offen.add(ws); s.frei = 0; s.ab = false; vonWs.set(ws, nutzer); return true; }

/** Die Verbindung ist in der Welt angekommen (ab jetzt gilt nach einem Abbruch die Frist) */
export function drin(ws: WebSocket): void { const n = vonWs.get(ws), s = n ? sitze.get(n) : undefined; if (s && s.offen.has(ws)) s.drin = true; }

/** Verbindung zu. abmelden: der Spieler hat sich abgemeldet oder wurde wegen Inaktivität abgemeldet – dann ist das Konto sofort frei. */
export function los(ws: WebSocket, abmelden: boolean): void { const n = vonWs.get(ws); if (!n) return; vonWs.delete(ws); const s = sitze.get(n); if (!s || !s.offen.delete(ws)) return;
  if (abmelden) s.ab = true;
  if (s.offen.size) return;
  if (s.ab || !s.drin) { sitze.delete(n); return; } /* abgemeldet oder nie angekommen (z. B. abgelehnter Kampf): sofort frei */
  s.frei = Date.now() + SITZ_FRIST_MS; }

/** Zwangsabmeldung durch den Server (Inaktivität): vor dem Schließen rufen */
export function abmelden(ws: WebSocket): void { const n = vonWs.get(ws), s = n ? sitze.get(n) : undefined; if (s) s.ab = true; }

/** Für Prüfungen und die Startseite */
export const sitzVon = (nutzer: string) => { const s = aktuell(nutzer); return s ? { geraet: s.geraet, offen: s.offen.size, drin: s.drin, frei: s.frei } : null; };
