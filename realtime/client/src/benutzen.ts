/*
 * Mythara – „Benutzen“ wie in OSRS: einen Gegenstand im Rucksack wählen (erste Aktion bei Dingen ohne eigenen Zweck, etwa Stämme),
 * dann eine Werkstatt antippen (zeigt die Rezepte mit diesem Gegenstand) oder einen anderen Gegenstand („Nichts Interessantes passiert.“).
 */
export interface Benutzt { wo: string; g: string }
let jetzt: Benutzt | null = null;
export const benutzt = (): Benutzt | null => jetzt;
export function benutzen(b: Benutzt | null): void { jetzt = b; dispatchEvent(new CustomEvent("ez-benutzen", { detail: b })); }
