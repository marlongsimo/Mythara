/*
 * Was im Spiel gerade zu sehen ist. Abgeschaltetes bleibt vollständig im Code (Kampagnen, Waldweg, Server, Datenbank)
 * und lässt sich hier mit einem Wort wieder einschalten. Zum Prüfen: localStorage „ez__alles“ = "1" schaltet alles frei.
 */
export const FREIGABE = {
  /** Kampagnen (Weidenhain, Rabenmoor …) über Stadttor und Weltkarte */ kampagnen: false,
  /** der Waldweg nach Weidenhain mit der Lichtung (gemeinsame Kampfwelt) */ waldweg: false,
  /** der Riss in der Waldmark (Dungeon) */ riss: true,
};
const alles = (() => { try { return localStorage.getItem("ez__alles") === "1"; } catch { return false; } })();
export const frei = (k: keyof typeof FREIGABE): boolean => alles || FREIGABE[k];
/** Darf diese Seite (Adresse) überhaupt geöffnet werden? Kampagnenorte und -kämpfe nur, wenn freigeschaltet. */
export function adresseErlaubt(q: URLSearchParams): boolean {
  if (!q.get("ort")) return true; if (q.get("kampf") === "waldweg") return frei("waldweg"); return frei("kampagnen"); }
