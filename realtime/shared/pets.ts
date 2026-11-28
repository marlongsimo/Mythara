/*
 * Riftmere – Skilling-Pets (#170, Wunsch des Nutzers 27.11.): kleine Begleiter, die man beim Arbeiten eines Berufs findet.
 * Bei jedem erfolgreichen Abbau (Baum gefällt, Erz abgebaut – je Stück) eine kleine Chance, die mit der Stufe der Ressource steigt:
 * Arbeitswert 1 : (60.000 − 800 × Stufe) → Stufe 1 ≈ 1 : 59.200, Stufe 40 = 1 : 28.000, Stufe 65 = 1 : 8.000. Je Beruf nur eins; wer es hat, würfelt nicht mehr.
 * Gebunden: gespeichert im Spielerstand (Inventar-Feld pets, nicht im Rucksack – nicht handelbar, nicht verkaufbar, geht nicht verloren, auch nicht beim Tod).
 * Das aktive Pet folgt dem Spieler (alle sehen es), kämpft nicht; wegschicken und rufen. Modelle von Figuren (#170: ruhe, gehen, laufen, freude).
 */
export interface PetDef { id: string; name: string; /** Beruf (shared/berufe.ts) */ beruf: string; /** Modell img/figuren-echt3d/<datei>.glb */ datei: string; bild: string; /** für die Ansage: „… hat <tat> einen kleinen Begleiter gefunden!“ */ tat: string }
export const PETS: Record<string, PetDef> = {
  nagbert: { id: "nagbert", name: "Nagbert", beruf: "holzfaellerei", datei: "pet.nagbert", bild: "img/objekte3d/pets/pet.nagbert.webp", tat: "beim Holzfällen" },
  steinbert: { id: "steinbert", name: "Steinbert", beruf: "bergbau", datei: "pet.steinbert", bild: "img/objekte3d/pets/pet.steinbert.webp", tat: "beim Bergbau" },
};
/** #170 (Entscheidung des Nutzers, KANON fd1014fd0): jedes Pet ist ein Gegenstand – im Rucksack, folgt von dort aus, darf in die Bank (gebunden: nicht handelbar) */
export const petGegenstand = (id: string): string => "pet_" + id;
export const petAusGegenstand = (g: string): string | null => (g.startsWith("pet_") && g.slice(4) in PETS ? g.slice(4) : null);
export const petFuerBeruf = (beruf: string): PetDef | undefined => Object.values(PETS).find((p) => p.beruf === beruf);
/** 1 : petNenner(Stufe) je Abbau (nie seltener als 1 : 60.000, nie häufiger als 1 : 1.000) */
export const petNenner = (stufe: number): number => Math.max(1000, 60000 - 800 * Math.max(0, stufe));
export const petChance = (stufe: number): number => 1 / petNenner(stufe);
/** Ansage im Chat */
export const petAnsage = (name: string, P: PetDef): string => `${name} hat ${P.tat} einen kleinen Begleiter gefunden: ${P.name}!`;

/** Folgen: so weit hinter dem Spieler, Tempo (Felder/s) gehen und laufen, ab dieser Entfernung laufen, ab dieser springt es zum Spieler */
export const PET_FOLGE = { abstand: 1.6, gehen: 2.2, laufen: 4.6, laufenAb: 4, springenAb: 14 };
export interface PetStelle { x: number; y: number; dx: number; dy: number; tat: "ruhe" | "gehen" | "laufen" }
/** Ein Schritt des Pets hinter dem Spieler her (Weltfelder; dt Sekunden). Ohne Wege: es läuft gerade, springt bei zu großem Abstand zum Spieler. */
export function petFolgen(p: { x: number; y: number }, ziel: { x: number; y: number }, dt: number): PetStelle {
  const ax = ziel.x - p.x, ay = ziel.y - p.y, d = Math.hypot(ax, ay);
  if (d > PET_FOLGE.springenAb) return { x: ziel.x - PET_FOLGE.abstand * 0.7, y: ziel.y + PET_FOLGE.abstand * 0.7, dx: ax, dy: ay, tat: "ruhe" };
  if (d <= PET_FOLGE.abstand) return { x: p.x, y: p.y, dx: ax, dy: ay, tat: "ruhe" };
  const tat = d - PET_FOLGE.abstand > PET_FOLGE.laufenAb ? "laufen" : "gehen", s = Math.min(d - PET_FOLGE.abstand, (tat === "laufen" ? PET_FOLGE.laufen : PET_FOLGE.gehen) * dt);
  return { x: p.x + (ax / d) * s, y: p.y + (ay / d) * s, dx: ax, dy: ay, tat }; }
