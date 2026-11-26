/*
 * Riftmere – Heilende Stellen (Phase 2 „Waldland“, 26.11.2026): „Beten“ an einem Ort füllt die Lebenspunkte auf –
 * nur mit dem Schalter der Quest (QuestDef.schalter), mit Abklingzeit je Konto auf dem Server. Technisch wie der Heiltrank (heilenMit).
 */
export interface Heilstelle { id: string; name: string; /** Weltfelder und wie nah man sein muss */ x: number; y: number; weit: number;
  /** nur mit diesem Schalter (sonst: zu) */ schalter: string; /** Abklingzeit je Konto (ms) */ abkling: number; zu: string; geheilt: string; voll: string }
export const HEILSTELLEN: Heilstelle[] = [
  /* Kapelle der Waldmark: Bruder Anselm öffnet sie nach Quest A2 „Das Wappen mit dem Turm“ */
  { id: "kapelle_waldmark", name: "Kapelle der Waldmark", x: 6457, y: 6422.6, weit: 3, schalter: "kapelle_offen", abkling: 10 * 60_000,
    zu: "Die Kapelle ist verschlossen. Bruder Anselm hat andere Sorgen.",
    geheilt: "Du kniest vor dem Altar. Die Stille füllt dich – deine Wunden schließen sich.", voll: "Du betest still. Dir fehlt nichts." },
];
export const heilstelle = (id: string): Heilstelle | undefined => HEILSTELLEN.find((h) => h.id === id);
