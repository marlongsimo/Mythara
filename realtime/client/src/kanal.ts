/*
 * Riftmere – Zonen Stufe 3 (25.11.2026): eine Verbindung je Gerät (Gegenstück zu server/src/kanal.ts).
 * Die Kampfwelt läuft als Kanal über die Welt-Verbindung. Dieses Objekt verhält sich für netz.ts wie ein WebSocket
 * (readyState, onopen, onmessage, onclose, onerror, send, close). Rahmen: „K“ + Text = Nachricht, „K!“ + JSON = Steuerung (auf / zu).
 */
export class KanalWs {
  readyState = 0;
  onopen: ((ev?: unknown) => void) | null = null;
  onmessage: ((ev: { data: string }) => void) | null = null;
  onclose: ((ev: { code: number; reason: string }) => void) | null = null;
  onerror: ((ev?: unknown) => void) | null = null;
  constructor(private raus: (t: string) => void, private fertig: (k: KanalWs) => void, q: string) {
    raus("K!" + JSON.stringify({ t: "auf", q }));
    setTimeout(() => { if (this.readyState !== 0) return; this.readyState = 1; if (this.onopen) this.onopen(); }, 0); }
  send(d: string): void { if (this.readyState === 1) this.raus("K" + d); }
  /** Der Browser schließt den Kanal (die Welt-Verbindung bleibt) */
  close(code = 1000, reason = ""): void { if (this.readyState >= 2) return; this.readyState = 3; this.fertig(this);
    try { this.raus("K!" + JSON.stringify({ t: "zu", code, grund: reason })); } catch { /* zu */ }
    setTimeout(() => { if (this.onclose) this.onclose({ code, reason }); }, 0); }
  /** Der Server hat ihn geschlossen oder die Welt-Verbindung ist weg */
  weg(code: number, reason: string): void { if (this.readyState >= 2) return; this.readyState = 3; this.fertig(this); if (this.onclose) this.onclose({ code, reason }); }
  /** Nachricht vom Server */
  rein(d: string): void { if (this.readyState === 1 && this.onmessage) this.onmessage({ data: d }); }
}
