/*
 * Riftmere – wann der eigene Held zuletzt gekämpft hat (angegriffen oder getroffen worden). welt/kampf.ts meldet es; der Weltenwechsel wartet 10 s danach.
 */
let zuletzt = 0;
export function kampfMerken(): void { zuletzt = Date.now(); }
/** Sekunden, die man noch warten muss, bis man die Welt wechseln darf (0: jetzt) */
export function wechselWarten(): number { return Math.max(0, Math.ceil((zuletzt + 10000 - Date.now()) / 1000)); }
