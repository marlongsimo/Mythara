/*
 * World Pipeline – Formprüfung der Weltdaten.
 * Prüft, ob Bibliotheken und Regionen so aufgebaut sind, wie typen.ts es beschreibt, und ob ihre Verweise stimmen.
 * Gibt eine Liste verständlicher Fehler zurück (leer = in Ordnung). Die inhaltliche Prüfung der Welt
 * (Erreichbarkeit, Engstellen, Nähte) kommt in Phase 8 dazu und baut hierauf auf.
 */
import { CHUNK_FELDER, regionFelder } from "./typen";
import type { GelaendeBibliothek, ObjektBibliothek, RegionDaten, Kollision, Zone } from "./typen";

type Roh = Record<string, unknown>;
const istObj = (v: unknown): v is Roh => typeof v === "object" && v !== null && !Array.isArray(v);
const istZahl = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const istText = (v: unknown): v is string => typeof v === "string" && v.length > 0;
const istPaar = (v: unknown): v is [number, number] => Array.isArray(v) && v.length === 2 && v.every(istZahl);
const ID = /^[a-z][a-z0-9_]{1,47}$/;
const FARBE = /^#[0-9a-f]{6}$/i;

/** Sammelt Fehler mit der Stelle, an der sie stehen */
class Liste {
  fehler: string[] = [];
  wenn(b: boolean, wo: string, was: string): boolean { if (b) this.fehler.push(`${wo}: ${was}`); return b; }
  id(v: unknown, wo: string): v is string { return !this.wenn(!istText(v) || !ID.test(v as string), wo, `ungültige Kennung ${JSON.stringify(v)} (klein, Ziffern, Unterstrich)`); }
  zahl(v: unknown, wo: string, min = -Infinity, max = Infinity): v is number { return !this.wenn(!istZahl(v) || (v as number) < min || (v as number) > max, wo, `Zahl${min > -Infinity ? ` ab ${min}` : ""}${max < Infinity ? ` bis ${max}` : ""} erwartet, gefunden ${JSON.stringify(v)}`); }
  text(v: unknown, wo: string): v is string { return !this.wenn(!istText(v), wo, "Text fehlt"); }
  eins<T extends string>(v: unknown, erlaubt: readonly T[], wo: string): v is T { return !this.wenn(!erlaubt.includes(v as T), wo, `${JSON.stringify(v)} ist keins von ${erlaubt.join(", ")}`); }
  /** Doppelte Kennungen in einer Liste melden; gibt die Menge der Kennungen zurück */
  eindeutig(liste: unknown[], wo: string): Set<string> {
    const gesehen = new Set<string>();
    liste.forEach((e, i) => { const id = istObj(e) ? e.id : undefined; if (!istText(id)) return; this.wenn(gesehen.has(id), `${wo}[${i}]`, `Kennung „${id}“ ist doppelt`); gesehen.add(id); });
    return gesehen;
  }
}

function kollisionPruefen(L: Liste, k: unknown, wo: string): void {
  if (k === null) return;
  if (L.wenn(!istObj(k), wo, "Kollision muss null oder ein Objekt sein")) return;
  const c = k as Roh;
  if (!L.eins(c.art, ["kreis", "rechteck", "vieleck"] as const, wo + ".art")) return;
  if (c.art === "kreis") L.zahl(c.r, wo + ".r", 0.05, 20);
  else if (c.art === "rechteck") { L.zahl(c.x, wo + ".x"); L.zahl(c.y, wo + ".y"); L.zahl(c.b, wo + ".b", 0.05, 40); L.zahl(c.h, wo + ".h", 0.05, 40); }
  else L.wenn(!Array.isArray(c.punkte) || c.punkte.length < 3 || !c.punkte.every(istPaar), wo + ".punkte", "mindestens drei Punkte [x, y] erwartet");
}

/** Prüft die Geländebibliothek */
export function gelaendeFehler(roh: unknown): string[] {
  const L = new Liste();
  if (L.wenn(!istObj(roh) || !Array.isArray(roh.arten), "gelaende", "„arten“ fehlt")) return L.fehler;
  const arten = (roh as Roh).arten as unknown[]; L.eindeutig(arten, "gelaende.arten");
  const zeichen = new Set<string>();
  arten.forEach((a0, i) => {
    const wo = `gelaende.arten[${i}]`; if (L.wenn(!istObj(a0), wo, "Objekt erwartet")) return; const a = a0 as Roh;
    L.id(a.id, wo + ".id"); L.text(a.name, wo + ".name");
    if (!L.wenn(typeof a.zeichen !== "string" || [...(a.zeichen as string)].length !== 1 || /\s/.test(a.zeichen as string), wo + ".zeichen", "genau ein sichtbares Zeichen erwartet")) {
      L.wenn(zeichen.has(a.zeichen as string), wo + ".zeichen", `Zeichen „${a.zeichen}“ ist doppelt vergeben`); zeichen.add(a.zeichen as string);
    }
    L.eins(a.kategorie, ["gelaende", "wasser", "weg"] as const, wo + ".kategorie");
    L.wenn(typeof a.begehbar !== "boolean", wo + ".begehbar", "wahr oder falsch erwartet");
    L.wenn(a.wasser === true && a.begehbar === true, wo, "Wasser kann nicht begehbar sein");
    L.wenn(a.kachel !== null && !istText(a.kachel), wo + ".kachel", "Pfad oder null erwartet");
    L.wenn(a.varianten !== undefined && !(Array.isArray(a.varianten) && a.varianten.every(istText)), wo + ".varianten", "Liste von Pfaden erwartet");
    L.zahl(a.rang, wo + ".rang", 0, 100);
    if (a.streu !== undefined && !L.wenn(!Array.isArray(a.streu), wo + ".streu", "Liste erwartet")) (a.streu as unknown[]).forEach((e, k) => {
      if (L.wenn(!istObj(e), `${wo}.streu[${k}]`, "Objekt erwartet")) return; L.eins((e as Roh).art, ["bueschel", "steinchen", "kiesel", "zweige", "blumen"] as const, `${wo}.streu[${k}].art`); L.zahl((e as Roh).dichte, `${wo}.streu[${k}].dichte`, 0, 3); });
    L.wenn(!istText(a.farbe) || !FARBE.test(a.farbe as string), wo + ".farbe", "Farbe als #rrggbb erwartet");
    if (!L.wenn(!istObj(a.rand), wo + ".rand", "fehlt")) { const r = a.rand as Roh;
      L.eins(r.art, ["fransen", "steine", "ufer", "hart"] as const, wo + ".rand.art"); L.zahl(r.breite, wo + ".rand.breite", 0, 8);
      L.wenn(r.art === "ufer" && a.wasser !== true, wo + ".rand.art", "einen Uferrand kann nur Wasser haben");
      L.wenn(r.bild !== undefined && !istText(r.bild), wo + ".rand.bild", "Pfad erwartet");
      if (r.saum !== undefined) { const sm = r.saum as Roh; L.wenn(r.art !== "fransen", wo + ".rand.saum", "einen Saum gibt es nur bei „fransen“"); L.zahl(istObj(sm) ? sm.breite : undefined, wo + ".rand.saum.breite", 0.2, 6); L.zahl(istObj(sm) ? sm.staerke : undefined, wo + ".rand.saum.staerke", 0, 1); } }
    L.wenn(istText(a.kachel) && !(istZahl(a.kachelPx) && (a.kachelPx as number) >= 64 && (a.kachelPx as number) <= 2048), wo + ".kachelPx", "zu einer Textur gehört ihre Kantenlänge in der Welt (64 bis 2048 Bildpunkte)");
  });
  return L.fehler;
}

/** Prüft die Objektbibliothek */
export function objekteFehler(roh: unknown): string[] {
  const L = new Liste();
  if (L.wenn(!istObj(roh) || !Array.isArray(roh.objekte), "objekte", "„objekte“ fehlt")) return L.fehler;
  const liste = (roh as Roh).objekte as unknown[]; L.eindeutig(liste, "objekte");
  liste.forEach((o0, i) => {
    const wo = `objekte[${i}]`; if (L.wenn(!istObj(o0), wo, "Objekt erwartet")) return; const o = o0 as Roh, ort = istText(o.id) ? `objekte.${o.id}` : wo;
    L.id(o.id, wo + ".id"); L.text(o.name, ort + ".name"); L.text(o.bild, ort + ".bild"); L.text(o.herkunft, ort + ".herkunft");
    L.eins(o.kategorie, ["bewuchs", "fels", "gebaeude", "bauteil", "kleinteil", "wasserbau", "sonderort"] as const, ort + ".kategorie");
    L.wenn(!istPaar(o.groesse) || o.groesse[0] < 1 || o.groesse[1] < 1, ort + ".groesse", "[breit, hoch] in Bildpunkten erwartet");
    L.wenn(!istPaar(o.anker) || o.anker.some((v) => v < 0 || v > 1), ort + ".anker", "Ankerpunkt [x, y] zwischen 0 und 1 fehlt");
    L.zahl(o.massstab, ort + ".massstab", 0.05, 8);
    L.wenn(o.kollision === undefined, ort + ".kollision", "fehlt (null schreiben, wenn das Objekt nichts versperrt)"); if (o.kollision !== undefined) kollisionPruefen(L, o.kollision, ort + ".kollision");
    L.eins(o.tiefe, ["fuss", "boden", "oben"] as const, ort + ".tiefe");
    if (o.interaktion !== undefined && o.interaktion !== null && !L.wenn(!istObj(o.interaktion), ort + ".interaktion", "Objekt oder null erwartet")) { const a = o.interaktion as Roh;
      L.eins(a.art, ["tuer", "truhe", "haendler", "sammeln", "schalter", "lesen", "eingang"] as const, ort + ".interaktion.art");
      L.zahl(a.dx, ort + ".interaktion.dx"); L.zahl(a.dy, ort + ".interaktion.dy"); L.zahl(a.radius, ort + ".interaktion.radius", 0.2, 10); }
    if (o.animation !== undefined && !L.wenn(!istObj(o.animation), ort + ".animation", "Objekt erwartet")) { const a = o.animation as Roh;
      L.zahl(a.feld, ort + ".animation.feld", 1); L.zahl(a.bilder, ort + ".animation.bilder", 2); L.zahl(a.rate, ort + ".animation.rate", 0.1, 60); }
    if (o.effekte !== undefined && !L.wenn(!Array.isArray(o.effekte), ort + ".effekte", "Liste erwartet")) (o.effekte as unknown[]).forEach((e, k) => {
      if (L.wenn(!istObj(e), `${ort}.effekte[${k}]`, "Objekt erwartet")) return;
      L.eins((e as Roh).art, ["licht", "feuer", "rauch", "glitzer"] as const, `${ort}.effekte[${k}].art`); L.zahl((e as Roh).dx, `${ort}.effekte[${k}].dx`); L.zahl((e as Roh).dy, `${ort}.effekte[${k}].dy`); });
    if (o.zustaende !== undefined && !L.wenn(!istObj(o.zustaende), ort + ".zustaende", "Objekt erwartet"))
      for (const [n, z] of Object.entries(o.zustaende as Roh)) L.wenn(!istObj(z) || !istText(z.bild), `${ort}.zustaende.${n}`, "braucht ein Bild");
  });
  return L.fehler;
}

function zonePruefen(L: Liste, z: unknown, wo: string, b: number, h: number, nurRechteck = false): z is Zone {
  if (L.wenn(!istObj(z), wo, "Zone fehlt")) return false; const o = z as Roh;
  if (!L.eins(o.art, nurRechteck ? ["rechteck"] as const : ["rechteck", "kreis"] as const, wo + ".art")) return false;
  if (o.art === "kreis") return [L.zahl(o.x, wo + ".x", 0, b), L.zahl(o.y, wo + ".y", 0, h), L.zahl(o.r, wo + ".r", 0.5, 64)].every(Boolean);
  const gut = [L.zahl(o.x0, wo + ".x0", 0, b), L.zahl(o.y0, wo + ".y0", 0, h), L.zahl(o.x1, wo + ".x1", 0, b), L.zahl(o.y1, wo + ".y1", 0, h)].every(Boolean);
  return gut && !L.wenn((o.x1 as number) <= (o.x0 as number) || (o.y1 as number) <= (o.y0 as number), wo, "x1 und y1 müssen größer sein als x0 und y0");
}

/** Prüft eine Region gegen die beiden Bibliotheken. gegnerArten: bekannte Arten aus shared/config (ohne Angabe wird das nicht geprüft). */
export function regionFehler(roh: unknown, gelaende: GelaendeBibliothek, objekte: ObjektBibliothek, gegnerArten?: ReadonlySet<string>): string[] {
  const L = new Liste();
  if (L.wenn(!istObj(roh), "region", "Objekt erwartet")) return L.fehler;
  const d = roh as Roh;
  if (L.wenn(!istObj(d.region), "region.json", "fehlt")) return L.fehler;
  const r = d.region as Roh;
  L.id(r.id, "region.id"); L.text(r.name, "region.name"); L.zahl(r.stufe, "region.stufe", 1, 20);
  L.eins(r.biom, ["wald", "wiese", "dorf", "sumpf", "gebirge", "ufer"] as const, "region.biom");
  const formOk = !L.wenn(!istPaar(r.ursprung) || !r.ursprung.every(Number.isInteger), "region.ursprung", "[cx, cy] in ganzen Chunks erwartet")
    && !L.wenn(!istPaar(r.chunks) || !r.chunks.every((v) => Number.isInteger(v) && v >= 1 && v <= 64), "region.chunks", "[breit, hoch] in ganzen Chunks (1 bis 64) erwartet");
  if (!formOk) return L.fehler;
  const [B, H] = regionFelder(d.region as unknown as RegionDaten["region"]);
  L.wenn(r.entwurf !== undefined && typeof r.entwurf !== "boolean", "region.entwurf", "wahr oder falsch erwartet");
  if (r.gesperrt !== undefined && !L.wenn(!Array.isArray(r.gesperrt), "region.gesperrt", "Liste erwartet"))
    (r.gesperrt as unknown[]).forEach((g, i) => L.wenn(!Array.isArray(g) || g.length !== 4 || !g.every(istZahl), `region.gesperrt[${i}]`, "[x0, y0, x1, y1] erwartet"));

  /* Geländekarte */
  const zeichen = new Set(gelaende.arten.map((a) => a.zeichen));
  if (!L.wenn(!Array.isArray(d.gelaende) || !d.gelaende.every((z) => typeof z === "string"), "gelaende", "Zeilen als Text erwartet")) {
    const z = d.gelaende as string[];
    L.wenn(z.length !== H, "gelaende", `${z.length} Zeilen, erwartet ${H} (${H / CHUNK_FELDER} Chunks × ${CHUNK_FELDER})`);
    const fremd = new Map<string, string>();
    z.forEach((zeile, j) => { const c = [...zeile];
      L.wenn(c.length !== B, `gelaende Zeile ${j + 1}`, `${c.length} Zeichen, erwartet ${B}`);
      c.forEach((ch, i) => { if (!zeichen.has(ch) && !fremd.has(ch)) fremd.set(ch, `Zeile ${j + 1}, Spalte ${i + 1}`); }); });
    for (const [ch, wo] of fremd) L.wenn(true, "gelaende", `unbekanntes Zeichen „${ch}“ (zuerst in ${wo})`);
  }

  /* Objekte */
  const bekannt = new Map(objekte.objekte.map((o) => [o.id, o]));
  let platzIds = new Set<string>();
  if (!L.wenn(!Array.isArray(d.objekte), "objekte.json", "Liste erwartet")) {
    const liste = d.objekte as unknown[]; platzIds = L.eindeutig(liste, "objekte");
    liste.forEach((p0, i) => {
      const wo0 = `objekte[${i}]`; if (L.wenn(!istObj(p0), wo0, "Objekt erwartet")) return; const p = p0 as Roh, wo = istText(p.id) ? `objekte.${p.id}` : wo0;
      L.id(p.id, wo0 + ".id");
      const def = istText(p.objekt) ? bekannt.get(p.objekt) : undefined;
      L.wenn(!def, wo + ".objekt", `„${String(p.objekt)}“ steht nicht in der Objektbibliothek`);
      /* Der Fußpunkt darf knapp außerhalb liegen (Bäume am Rand ragen herein), aber nicht weit */
      L.zahl(p.x, wo + ".x", -4, B + 4); L.zahl(p.y, wo + ".y", -4, H + 8);
      if (p.s !== undefined) L.zahl(p.s, wo + ".s", 0.3, 3);
      if (p.spiegeln !== undefined) L.wenn(typeof p.spiegeln !== "boolean", wo + ".spiegeln", "wahr oder falsch erwartet");
      if (p.zustand !== undefined) L.wenn(!def || !def.zustaende || !(String(p.zustand) in def.zustaende), wo + ".zustand", `Zustand „${String(p.zustand)}“ kennt das Objekt nicht`);
      if (p.kollision !== undefined) kollisionPruefen(L, p.kollision, wo + ".kollision");
    });
  }

  /* Spiel */
  if (L.wenn(!istObj(d.spiel), "spiel.json", "fehlt")) return L.fehler;
  const s = d.spiel as Roh;
  const punkt = (v: Roh, wo: string) => { L.zahl(v.x, wo + ".x", 0, B); L.zahl(v.y, wo + ".y", 0, H); };
  if (!L.wenn(!Array.isArray(s.start) || s.start.length < 1 || !s.start.every(istPaar), "spiel.start", "mindestens ein Startpunkt [x, y] erwartet"))
    (s.start as number[][]).forEach(([x, y], i) => L.wenn(x < 0 || y < 0 || x > B || y > H, `spiel.start[${i}]`, "liegt außerhalb der Region"));
  const alle = new Map<string, string>();
  const gruppe = (name: string, je: (e: Roh, wo: string) => void) => {
    const v = s[name]; if (L.wenn(!Array.isArray(v), `spiel.${name}`, "Liste erwartet")) return;
    (v as unknown[]).forEach((e0, i) => { const wo0 = `spiel.${name}[${i}]`; if (L.wenn(!istObj(e0), wo0, "Objekt erwartet")) return; const e = e0 as Roh;
      if (L.id(e.id, wo0 + ".id")) { L.wenn(alle.has(e.id), wo0, `Kennung „${e.id}“ gibt es schon in spiel.${alle.get(e.id)}`); alle.set(e.id, name); }
      je(e, istText(e.id) ? `spiel.${name}.${e.id}` : wo0); });
  };
  gruppe("figuren", (f, wo) => { L.eins(f.rolle, ["npc", "haendler", "questgeber", "wache", "tier"] as const, wo + ".rolle"); L.text(f.figur, wo + ".figur"); punkt(f, wo); });
  gruppe("spawnzonen", (z, wo) => {
    zonePruefen(L, z.zone, wo + ".zone", B, H);
    if (!L.wenn(!Array.isArray(z.gegner) || z.gegner.length < 1, wo + ".gegner", "mindestens eine Gegnerart erwartet")) (z.gegner as unknown[]).forEach((g0, k) => {
      if (L.wenn(!istObj(g0), `${wo}.gegner[${k}]`, "Objekt erwartet")) return; const g = g0 as Roh;
      if (L.text(g.art, `${wo}.gegner[${k}].art`) && gegnerArten) L.wenn(!gegnerArten.has(g.art), `${wo}.gegner[${k}].art`, `Gegnerart „${g.art}“ gibt es nicht`);
      L.zahl(g.anzahl, `${wo}.gegner[${k}].anzahl`, 1, 12); });
    if (z.aggro !== undefined) L.zahl(z.aggro, wo + ".aggro", 1, 30); if (z.leine !== undefined) L.zahl(z.leine, wo + ".leine", 1, 60);
    if (z.respawn !== undefined) L.zahl(z.respawn, wo + ".respawn", 5, 86400);
    L.eins(z.abgleich, ["server", "dauerhaft"] as const, wo + ".abgleich");
  });
  gruppe("interaktionen", (a, wo) => {
    L.eins(a.art, ["tuer", "truhe", "sammeln", "schalter", "questziel", "lesen", "eingang"] as const, wo + ".art"); punkt(a, wo); L.zahl(a.radius, wo + ".radius", 0.2, 10);
    L.eins(a.abgleich, ["keiner", "server", "dauerhaft"] as const, wo + ".abgleich");
    if (a.objekt !== undefined) L.wenn(!platzIds.has(String(a.objekt)), wo + ".objekt", `Platzierung „${String(a.objekt)}“ gibt es nicht`);
  });
  gruppe("ausgaenge", (a, wo) => {
    zonePruefen(L, a.zone, wo + ".zone", B, H, true); L.text(a.text, wo + ".text");
    if (L.wenn(!istObj(a.nach), wo + ".nach", "Ziel fehlt")) return; const n = a.nach as Roh;
    if (!L.eins(n.art, ["welt", "ort", "kampf"] as const, wo + ".nach.art")) return;
    if (n.art === "welt") { L.id(n.region, wo + ".nach.region"); L.zahl(n.x, wo + ".nach.x", 0); L.zahl(n.y, wo + ".nach.y", 0); }
    else { L.text(n.ort, wo + ".nach.ort"); if (n.art === "kampf") L.text(n.kampf, wo + ".nach.kampf"); }
  });
  if (!L.wenn(!istObj(s.kollision), "spiel.kollision", "fehlt")) for (const art of ["sperren", "freigeben"] as const) {
    const v = (s.kollision as Roh)[art]; if (L.wenn(!Array.isArray(v), `spiel.kollision.${art}`, "Liste erwartet")) continue;
    (v as unknown[]).forEach((z, i) => zonePruefen(L, z, `spiel.kollision.${art}[${i}]`, B, H, true)); }
  return L.fehler;
}
