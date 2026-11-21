/* Symbole der Fähigkeiten und Waffen je Held (Kampfszene und Kampf in der offenen Welt) */
export const SYMBOL: Record<string, { q?: string; e?: string; r?: string; modi?: string[] }> = {
  schildwaechter: { q: "welle", e: "schild", r: "aura", modi: ["symbole/schwert", "symbole/schild"] }, elementarist: { q: "eis", e: "blitz", r: "feuer", modi: ["symbole/elementarstab", "symbole/stab"] },
  lichtbringer: { q: "heil", e: "sterne", r: "licht", modi: ["symbole/heilstab", "symbole/streitkolben"] }, assassine: { q: "schatten", e: "gift", r: "blut", modi: ["dolch", "symbole/armbrust"] },
  kopfgeldjaeger: { q: "mal", e: "netz", r: "blut", modi: ["symbole/armbrust", "dolch"] } };
export const symbolBild = (n: string) => n.includes("/") ? `../img/${n}.webp` : `../img/fx/${n}.webp`; /* „symbole/…“: eigene Bilder, sonst die Effektbilder */
