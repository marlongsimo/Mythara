/*
 * Mythara – 3D-Welt im Spiel (?3d=1): wird von der 2D-Welt (client/src/welt/welt.ts) nachgeladen, damit Three.js das normale Spiel
 * nicht vergrößert. Die 2D-Welt reicht eine Anbindung herein (Stelle des Helden, Laufen, Wegsuche, Stick) und bekommt die Drehung zurück.
 */
import { Welt3D, type Anbindung } from "./welt3d";
(window as unknown as Record<string, unknown>).MytharaWelt3D = {
  starten(an: Anbindung) { const w = new Welt3D(an, document.body); void w.start(); return { drehen: (rx: number, ry: number) => w.drehen(rx, ry) }; },
};
