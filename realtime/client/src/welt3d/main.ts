/* Mythara – 3D-Welt als eigene Seite (echtzeit/welt3d.html): eigene Bewegung und Wegsuche, kein Server. Die Welt selbst: welt3d.ts */
import { Welt3D } from "./welt3d";
const w = new Welt3D();
w.start().catch((e) => { const l = document.querySelector("#ez-lade"); if (l) l.textContent = "Fehler: " + (e && e.message ? e.message : e); console.error(e); });
