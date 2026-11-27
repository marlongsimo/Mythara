/*
 * Riftmere – Handy-Stufe der Figuren-Atlanten (#105, Bilder aus #104): neben jedem Atlas in img/figuren-fabrik/<figur>/ liegt <ebene>.mobil.webp/.json
 * in halber Auflösung (meta.mobil_faktor = 0,5). Auf dem Handy (oder mit Grafik „flüssig“) lädt der Browser diese; Fuß, Tiefe und sichtbar_px aus
 * <figur>.json gelten weiter in voller Auflösung – das Bild wird nur um 1 / Faktor vergrößert gezeichnet. Alle Ebenen einer Figur in derselben Stufe:
 * geprüft an der ersten Ebene; fehlt dort die Mobil-Fassung (ältere Figuren), lädt die Figur ganz in voller Auflösung.
 */
const BASIS = "../img/figuren-fabrik/";
/** Mobil-Atlanten verwenden? ?grafik=scharf/fluessig oder Einstellung „ez_grafik“ (wie welt3d/motor.ts), sonst auf Handys und kleinen Bildschirmen */
export const FIGUR_MOBIL: boolean = (() => { try { const g = new URLSearchParams(location.search).get("grafik") || localStorage.getItem("ez_grafik"); if (g === "scharf") return false; if (g === "fluessig") return true; } catch { /* privat */ }
  return matchMedia("(pointer: coarse)").matches || Math.min(innerWidth, innerHeight) < 600; })();
const probe = new Map<string, Promise<number>>();
/** Faktor der Atlanten dieser Figur: 0,5 (Mobil-Fassung) oder 1 (volle Auflösung) */
export function figurFaktor(figur: string, ersteEbene: string | undefined): Promise<number> { if (!FIGUR_MOBIL || !ersteEbene) return Promise.resolve(1);
  let p = probe.get(figur); if (!p) { p = fetch(BASIS + figur + "/" + ersteEbene + ".mobil.json").then((r) => (r.ok ? r.json() : null))
      .then((j: { meta?: { mobil_faktor?: number } } | null) => { const k = j && j.meta && Number(j.meta.mobil_faktor); return k && k > 0 && k < 1 ? k : 1; }).catch(() => 1); probe.set(figur, p); }
  return p; }
/** Dateiendung vor .webp/.json für diesen Faktor */
export const stufeEndung = (k: number): string => (k < 1 ? ".mobil" : "");
