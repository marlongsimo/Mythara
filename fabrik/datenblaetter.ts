/*
 * Mythara Fabrik – Datenblätter der Waffen und Schilde anlegen oder ergänzen:
 *   fabrik/assets/waffen/<klasse>/<n-stufe>/<gegenstand>/datenblatt.json  (0-training, 1-einfach, 2-selten … 5-mythisch)
 *   fabrik/assets/waffen/<klasse>/klasse.json  (Bewegungen und Haltung der Klasse)
 * aus der Gegenstandsliste des Spiels (realtime/shared/gegenstaende.ts). Schon eingetragene Werte bleiben stehen,
 * es werden nur fehlende Felder ergänzt – die Datei darf also von Hand gepflegt werden.
 *   npx esbuild fabrik/datenblaetter.ts --bundle --platform=node --log-level=error | node
 */
import * as fs from "fs";
import * as path from "path";
import { GEGENSTAENDE, SELTENHEITEN, ANGRIFF_JE_ART, PLAETZE } from "../realtime/shared/gegenstaende";

const WAFFEN = "fabrik/assets/waffen";
const STUFEN = ["anfaenger", "gewoehnlich", "selten", "episch", "legendaer", "mythisch"];
const ORDNER: Record<string, string> = { anfaenger: "training", gewoehnlich: "einfach" };   // Ordnernamen wie die angezeigten Stufen
const ordner = (s: string) => `${STUFEN.indexOf(s)}-${ORDNER[s] || s}`;
const slug = (n: string) => n.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
/* Modellordner (Quelle) je Grundebene: waffen/<klasse>/<id> */
const quelle = new Map<string, string>();
for (const k of fs.readdirSync(WAFFEN)) { const d = path.join(WAFFEN, k); if (!fs.statSync(d).isDirectory()) continue;
  for (const id of fs.readdirSync(d)) if (/^(waffe|schild)\./.test(id)) quelle.set(id, k); }
const BEWEGUNG: Record<string, string[]> = { schild: ["block", "ruhe", "gehen", "laufen"] };
/* je Klasse: welche Bewegungen der Held mit Waffen dieser Klasse zeigt und wie er sie hält (aus rig.py; gilt für alle Waffen der Klasse) */
const KLASSEN: Record<string, { angriff: string | null; halten: string; bewegungen: string[] }> = {
  schwert: { angriff: "stich", halten: "rechte Hand, Griff am Handballen; mit Schild in der linken Hand: block", bewegungen: ["ruhe", "gehen", "laufen", "stich", "block", "tod"] },
  dolch: { angriff: "stich", halten: "rechte Hand; dolchwurf für Wurfdolche", bewegungen: ["ruhe", "gehen", "laufen", "stich", "dolchwurf", "tod"] },
  zweihand: { angriff: "hieb2h", halten: "rechte Hand, linke Hand 11 cm zum Knauf hin", bewegungen: ["ruhe", "gehen", "laufen", "hieb2h", "tod"] },
  streitkolben: { angriff: "angriff", halten: "rechte Hand; Hieb von oben (ausholen, schlagen, durchziehen)", bewegungen: ["ruhe", "gehen", "laufen", "angriff", "block", "tod"] },
  axt: { angriff: "angriff", halten: "rechte Hand (noch keine Gegenstände)", bewegungen: ["ruhe", "gehen", "laufen", "angriff", "tod"] },
  speer: { angriff: "stich2h", halten: "beide Hände am Schaft, etwa in der Mitte gegriffen", bewegungen: ["ruhe", "gehen", "laufen", "stich2h", "tod"] },
  stab: { angriff: "zauber_stab", halten: "rechte Hand, Kopf nach vorn", bewegungen: ["ruhe", "gehen", "laufen", "zauber_stab", "tod"] },
  bogen: { angriff: "bogen", halten: "linke Hand in der Mitte, die rechte zieht die Sehne", bewegungen: ["ruhe", "gehen", "laufen", "bogen", "tod"] },
  armbrust: { angriff: "armbrust1h", halten: "rechte Hand, Pistolengriff; linke Hand am Vorderschaft", bewegungen: ["ruhe", "gehen", "laufen", "armbrust1h", "tod"] },
  schild: { angriff: "block", halten: "linker Unterarm, Vorderseite nach außen", bewegungen: ["ruhe", "gehen", "laufen", "block", "tod"] },
};
for (const [k, v] of Object.entries(KLASSEN)) if (fs.existsSync(path.join(WAFFEN, k)))
  fs.writeFileSync(path.join(WAFFEN, k, "klasse.json"), JSON.stringify({ klasse: k, ...v, hinweis: "Alle Waffen dieser Klasse nutzen diese Bewegungen (fabrik/rig.py). Welche Angriffsbewegung das Spiel zeigt, steht in realtime/shared/gegenstaende.ts ANGRIFF_JE_ART." }, null, 2) + "\n");
let neu = 0, ergaenzt = 0;
for (const g of Object.values(GEGENSTAENDE)) {
  if (g.platz !== "waffe" && g.platz !== "nebenhand") continue;
  const ebene = (g.ebenen || [])[0]; if (!ebene) continue;
  const stufe = STUFEN.find((s) => ebene.endsWith("." + s)); const basis = stufe ? ebene.slice(0, -(stufe.length + 1)) : ebene;
  const klasse = quelle.get(basis); if (!klasse) { console.warn("ohne Modellordner:", g.id, basis); continue; }
  const ziel = path.join(WAFFEN, klasse, ordner(g.seltenheit), slug(g.name)); fs.mkdirSync(ziel, { recursive: true });
  const datei = path.join(ziel, "datenblatt.json"); const alt = fs.existsSync(datei) ? JSON.parse(fs.readFileSync(datei, "utf8")) : null;
  const angriff = klasse === "schild" ? "block" : ANGRIFF_JE_ART[g.art] || (KLASSEN[klasse] && KLASSEN[klasse].angriff) || null;
  const blatt = {
    name: g.name, gegenstand: g.id, klasse, art: g.art, seltenheit: SELTENHEITEN[g.seltenheit].name, platz: PLAETZE.find((p) => p.id === g.platz)!.name,
    modell: { ebene, quelle: `fabrik/assets/waffen/${klasse}/${basis}`, spiel_mann: `img/figuren-echt3d/basemann3d.teile/${ebene}.glb`, spiel_frau: `img/figuren-echt3d/basefrau3d.teile/${ebene}.glb`,
      stufenbild: fs.existsSync(`fabrik/assets/waffen/${klasse}/${basis}/referenz/stufen.png`) ? `fabrik/assets/waffen/${klasse}/${basis}/referenz/stufen.png` : null },
    animation: { angriff, weitere: BEWEGUNG[klasse] || ["ruhe", "gehen", "laufen"], klasse: `fabrik/assets/waffen/${klasse}/klasse.json` },
    werte: Object.fromEntries(g.werte.filter(([, v]) => v !== "Werte folgen").map(([k, v]) => [k, v])),
    werte_offen: g.werte.some(([, v]) => v === "Werte folgen"),
    text: g.text,
  };
  if (alt) { const z = { ...blatt, ...alt, modell: { ...blatt.modell, ...(alt.modell || {}) }, animation: { ...blatt.animation, ...(alt.animation || {}) }, werte: { ...blatt.werte, ...(alt.werte || {}) } };
    fs.writeFileSync(datei, JSON.stringify(z, null, 2) + "\n"); ergaenzt++; }
  else { fs.writeFileSync(datei, JSON.stringify(blatt, null, 2) + "\n"); neu++; }
}
console.log(`Datenblätter: ${neu} neu, ${ergaenzt} ergänzt`);
