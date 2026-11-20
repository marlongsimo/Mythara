/* Weltkarte am Stadttor: zeigt die Kampagnen als Orte auf der Karte. Die Texte stammen aus den Kampagnen des Würfelspiels. */
type Ziel = { id: string; nr: number; name: string; ort: string; x: number; y: number; text: string; dauer: string };
/* x, y in Prozent des Kartenbilds */
const ZIELE: Ziel[] = [
  { id: "weidenhain", nr: 1, name: "Das Erntefest von Weidenhain", ort: "Weidenhain", x: 17.7, y: 22.6, text: "Kröten plündern den Kornspeicher, mitten im Erntefest.", dauer: "Einstieg" },
  { id: "rabenmoor", nr: 2, name: "Das Moor der stummen Lichter", ort: "Rabenmoor", x: 16, y: 39, text: "Drei Kinder sind stummen Lichtern ins Moor gefolgt. Das Dorf will die Kräuterfrau verbrennen.", dauer: "kurz" },
  { id: "graufurt", nr: 3, name: "Die Fähre von Graufurt", ort: "Graufurt", x: 31, y: 47, text: "Kobolde haben den Sohn der Fährfrau verschleppt. Im Norden läutet zum ersten Mal die Glocke von Grauwacht.", dauer: "kurz" },
  { id: "grauwacht", nr: 4, name: "Das Siegel von Grauwacht", ort: "Grauwacht", x: 51.4, y: 27, text: "Eine alte Abtei, ein vergessenes Siegel und eine Glocke, die seit sieben Nächten läutet.", dauer: "lang" },
  { id: "hochwacht", nr: 5, name: "Die letzte Fackel von Hochwacht", ort: "Hochwacht", x: 79.3, y: 28, text: "Bringt die Botin Sera Venn durch einen belagerten Pass zur Hochwarte.", dauer: "lang" },
  { id: "krone", nr: 6, name: "Die Krone unter dem Eis", ort: "Veyrholm", x: 87.5, y: 15.7, text: "Drei Wege führen in eine Stadt unter dem Gletscher – und zum Herzen der sieben Siegel.", dauer: "sehr lang" },
];
const HIER = { x: 49.5, y: 67.6 };

/** Wie viele Kampagnen der Reihe nach geschafft sind. Vorläufig auf dem Gerät gemerkt; mit der Anmeldung zieht das aufs Konto um. */
export const kampagnenGeschafft = () => { try { return Math.max(0, Math.min(ZIELE.length, Number(localStorage.getItem("ez_kampagnen")) || 0)); } catch { return 0; } };
export const kampagneGeschafft = (nr: number) => { try { if (nr === kampagnenGeschafft() + 1) localStorage.setItem("ez_kampagnen", String(nr)); } catch { /* privat */ } };

/** Öffnet die Weltkarte; `zu` wird gerufen, wenn sie wieder geschlossen wird. */
export function weltkarte(zu: () => void) {
  const w = document.querySelector("#ez-welt") as HTMLElement; w.hidden = false; const fertig = kampagnenGeschafft();
  w.innerHTML = `<div class="blatt"><img src="../img/echtzeit/weltkarte.webp" alt="Karte der Splitterlande" draggable="false">`
    + `<i class="hier" style="left:${HIER.x}%;top:${HIER.y}%"><b>Waldmark</b></i>`
    + ZIELE.map((z) => `<button type="button" class="ziel${z.nr <= fertig ? " fertig" : z.nr > fertig + 1 ? " zu" : ""}" data-id="${z.id}" style="left:${z.x}%;top:${z.y}%"><span>${z.nr <= fertig ? "✓" : z.nr > fertig + 1 ? "🔒" : z.nr}</span><b>${z.ort}</b></button>`).join("")
    + `</div><button type="button" class="schliessen" aria-label="Karte schließen">✕</button><h2>Wohin soll die Reise gehen?</h2><div class="info" hidden></div>`;
  const info = w.querySelector(".info") as HTMLElement;
  const ende = () => { w.hidden = true; w.innerHTML = ""; removeEventListener("keydown", taste, true); zu(); };
  const taste = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); ende(); } };
  addEventListener("keydown", taste, true); (w.querySelector(".schliessen") as HTMLElement).onclick = ende;
  for (const k of Array.from(w.querySelectorAll<HTMLElement>(".ziel"))) k.onclick = () => {
    const z = ZIELE.find((q) => q.id === k.dataset.id) as Ziel; for (const a of Array.from(w.querySelectorAll(".ziel"))) a.classList.toggle("an", a === k);
    info.hidden = false; info.innerHTML = `<small>Kampagne ${z.nr} · ${z.ort} · ${z.dauer}</small><h3>${z.name}</h3><p>${z.text}</p><em>${z.nr <= fertig ? "Geschafft." : z.nr > fertig + 1 ? `Verschlossen – erst „${ZIELE[z.nr - 2].name}“ abschließen.` : "Noch nicht spielbar – diese Kampagne kommt als Echtzeit-Dungeon."}</em>`;
  };
}
