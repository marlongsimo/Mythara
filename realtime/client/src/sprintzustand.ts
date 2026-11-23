/*
 * Mythara – die Ausdauer des eigenen Helden (Sprint, shared/sprint.ts) als ein gemeinsamer Stand im Browser:
 * in der offenen Welt rechnet die 3D-Welt sie selbst; im Kampfgebiet bewegt der Server den Helden und schickt die Ausdauer mit (welt/kampf.ts).
 * „ez-sprint“: der Spieler hat umgeschaltet (der Kampf meldet es dem Server).
 */
import { Ausdauer } from "../../shared/sprint";
export const AUSDAUER = new Ausdauer();
/** Werte vom Server übernehmen (im Kampfgebiet) */
export function ausdauerVomServer(a: [number, number]): void { AUSDAUER.wert = a[0]; AUSDAUER.an = a[1] === 1; }
