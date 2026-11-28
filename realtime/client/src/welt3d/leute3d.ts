/*
 * 3D – Leute als echte Modelle (24.11.2026): der Handwerker der Waldmark aus einfachen Körpern, gegliedert in Hüfte, Rumpf, Kopf und Arme,
 * damit er im Stehen lebt: Atmen, Gewicht verlagern, sich umschauen, ab und zu den Hammer prüfen. Maße in Feldern, Blick nach +z (Süden).
 */
import * as THREE from "three";
import { Teile, matrix } from "./teile";

const HAUT = "#d6a07a", HAUT_DUNKEL = "#b98563", HAAR = "#6e3a1f", HEMD = "#c9b58c", HOSE = "#4b3b2b", STIEFEL = "#2f2520", LEDER = "#7a4a2b", LEDER_DUNKEL = "#55331d",
  GURT = "#3a2a1f", MESSING = "#c79a3e", TUCH = "#8d3b2a", STIEL = "#7a5230", EISEN = "#5b5e66";

type Glied = { g: THREE.Group; ruhe: THREE.Euler };
const glied = (eltern: THREE.Object3D, x: number, y: number, z: number, t?: Teile) => { const g = new THREE.Group(); g.position.set(x, y, z); if (t && !t.leer) g.add(t.netz()); eltern.add(g); return g; };
const kugel = (r: number, w = 10, h = 8) => new THREE.SphereGeometry(r, w, h);
const rohr = (r0: number, r1: number, l: number, n = 9) => new THREE.CylinderGeometry(r0, r1, l, n);

/** Ein Arm: Schulter → Oberarm (Hemdsärmel, hochgekrempelt) → Ellbogen → Unterarm mit Hand. Zurück: Schulter- und Ellbogengelenk. */
function arm(rumpf: THREE.Group, seite: -1 | 1) {
  const ob = new Teile("putz"); ob.add(kugel(0.1), HEMD, matrix(0, 0, 0, 0, 0, 0, 1.1, 1, 1));                 /* Schulter */
  ob.add(rohr(0.085, 0.075, 0.3), HEMD, matrix(0, -0.15, 0)); ob.add(rohr(0.085, 0.085, 0.06), "#b6a27a", matrix(0, -0.29, 0));   /* Ärmel + Umschlag */
  const schulter = glied(rumpf, seite * 0.3, 0.56, 0, ob);
  const un = new Teile("glatt"); un.add(rohr(0.065, 0.055, 0.28), HAUT, matrix(0, -0.14, 0)); un.add(rohr(0.07, 0.07, 0.07), LEDER_DUNKEL, matrix(0, -0.25, 0), { muster: "holz" });   /* Unterarm, Lederstulpe */
  un.add(kugel(0.072, 8, 6), HAUT, matrix(0, -0.33, 0.01, 0, 0, 0, 0.9, 1.15, 1));                                /* Hand */
  const ellbogen = glied(schulter, 0, -0.31, 0, un);
  return { schulter, ellbogen };
}

/** Der Handwerker: kräftig, rotbrauner Vollbart, Kopftuch, Lederschürze mit Werkzeuggürtel, in der rechten Hand ein Hammer. */
export function handwerker() {
  const wurzel = new THREE.Group(), huefte = glied(wurzel, 0, 0.86, 0);
  /* Beine (stehen fest; die Hüfte darüber schwingt) */
  const beine = new Teile("putz");
  for (const s of [-1, 1]) { beine.add(rohr(0.115, 0.095, 0.72), HOSE, matrix(s * 0.13, -0.42, 0), 0.03);
    beine.box(0.19, 0.2, 0.3, s * 0.13, -0.86, 0.04, STIEFEL, 0, { muster: "holz" }); beine.add(rohr(0.1, 0.1, 0.05), LEDER_DUNKEL, matrix(s * 0.13, -0.66, 0), { muster: "holz" }); }
  huefte.add(beine.netz());
  /* Rumpf: Hemd, Lederschürze mit Latz und Trägern, Gürtel mit Messingschnalle und Werkzeug */
  const r = new Teile("putz");
  r.add(rohr(0.27, 0.23, 0.66, 12), HEMD, matrix(0, 0.31, 0, 0, 0, 0, 1, 1, 0.74), 0.03);                         /* Leib */
  r.add(kugel(0.27, 12, 8), HEMD, matrix(0, 0.62, 0, 0, 0, 0, 1.05, 0.42, 0.72));                                  /* Schulterpartie */
  r.add(rohr(0.245, 0.25, 0.14, 12), HOSE, matrix(0, -0.03, 0, 0, 0, 0, 1, 1, 0.76));                              /* Hosenbund */
  r.box(0.42, 0.78, 0.04, 0, -0.42, 0.185, LEDER, 0, { muster: "holz", schwanken: 0.04 });                          /* Schürze unten */
  r.box(0.3, 0.36, 0.04, 0, 0.08, 0.19, LEDER, 0, { muster: "holz", schwanken: 0.04 });                             /* Latz */
  for (const s of [-1, 1]) r.add(new THREE.BoxGeometry(0.05, 0.42, 0.03), LEDER_DUNKEL, matrix(s * 0.12, 0.5, 0.15, -0.25, 0, s * -0.12), { muster: "holz" });   /* Träger */
  r.add(rohr(0.255, 0.255, 0.07, 14), GURT, matrix(0, 0.04, 0, 0, 0, 0, 1, 1, 0.8), { muster: "holz" });           /* Gürtel */
  r.box(0.08, 0.07, 0.02, 0, 0.005, 0.215, MESSING, 0, { muster: "metall" });                                         /* Schnalle */
  r.box(0.1, 0.13, 0.06, -0.21, -0.12, 0.08, LEDER_DUNKEL, 0.3, { muster: "holz" });                                  /* Tasche */
  r.add(rohr(0.015, 0.015, 0.24, 6), STIEL, matrix(0.22, -0.08, 0.1, 0, 0, 0.15), { muster: "holz" });              /* Meißel im Gürtel */
  r.box(0.035, 0.05, 0.03, 0.235, 0.05, 0.1, EISEN, 0, { muster: "metall" });
  const rumpf = glied(huefte, 0, 0, 0, r);
  /* Kopf: Hals, Kopf, Nase, Augen, buschige Brauen, Vollbart, Kopftuch mit Knoten */
  const k = new Teile("glatt");
  k.add(rohr(0.08, 0.09, 0.12), HAUT_DUNKEL, matrix(0, 0.04, 0));
  k.add(kugel(0.165, 12, 10), HAUT, matrix(0, 0.22, 0.01, 0, 0, 0, 0.95, 1.08, 1));
  k.add(new THREE.ConeGeometry(0.035, 0.09, 6), HAUT_DUNKEL, matrix(0, 0.21, 0.17, Math.PI / 2 - 0.15, 0, 0));       /* Nase */
  for (const s of [-1, 1]) { k.box(0.035, 0.03, 0.02, s * 0.06, 0.245, 0.145, "#1f1814");                           /* Augen */
    k.box(0.07, 0.03, 0.04, s * 0.065, 0.275, 0.14, HAAR, s * 0.15, { muster: "putz" });                            /* Brauen */
    k.add(kugel(0.04, 6, 5), HAUT_DUNKEL, matrix(s * 0.158, 0.22, 0, 0, 0, 0, 0.5, 1, 0.8)); }                      /* Ohren */
  k.add(kugel(0.15, 10, 8), HAAR, matrix(0, 0.12, 0.06, 0, 0, 0, 1.02, 1.0, 0.85), { muster: "putz" });            /* Vollbart */
  k.add(new THREE.ConeGeometry(0.11, 0.16, 8), HAAR, matrix(0, 0.0, 0.1, Math.PI + 0.25, 0, 0), { muster: "putz" });   /* Bartspitze */
  k.box(0.1, 0.025, 0.03, 0, 0.17, 0.165, HAAR, 0, { muster: "putz" });                                               /* Schnurrbart */
  k.add(new THREE.SphereGeometry(0.175, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.52), TUCH, matrix(0, 0.25, -0.005, -0.12, 0, 0, 1, 0.95, 1.05), { muster: "putz", schwanken: 0.04 });   /* Kopftuch */
  k.add(kugel(0.05, 6, 5), TUCH, matrix(0, 0.26, -0.18), { muster: "putz" });
  for (const s of [-1, 1]) k.box(0.05, 0.12, 0.02, s * 0.03, 0.15, -0.19, TUCH, s * 0.3, { muster: "putz" });     /* Knotenenden */
  const kopf = glied(rumpf, 0, 0.68, 0.0, k);
  /* Arme; rechts der Hammer (Stiel nach unten, Kopf an der Hand) */
  const li = arm(rumpf, -1), re = arm(rumpf, 1);
  const h = new Teile("holz"); h.add(rohr(0.022, 0.025, 0.46, 7), STIEL, matrix(0, -0.12, 0)); h.box(0.07, 0.07, 0.2, 0, 0.1, 0.03, EISEN, 0, { muster: "metall" });
  const hammer = glied(re.ellbogen, 0, -0.33, 0.03, h); hammer.rotation.x = 1.25;
  /* Ruhehaltung: Arme leicht vom Körper, Ellbogen etwas gebeugt, rechter Unterarm hält den Hammer vor sich */
  li.schulter.rotation.set(0.05, 0, -0.16); li.ellbogen.rotation.set(-0.2, 0, 0.05);
  re.schulter.rotation.set(0.1, 0, 0.14); re.ellbogen.rotation.set(-0.75, 0, -0.1);
  const ruhe = (g: THREE.Group): Glied => ({ g, ruhe: g.rotation.clone() });
  const G = { huefte: ruhe(huefte), rumpf: ruhe(rumpf), kopf: ruhe(kopf), lS: ruhe(li.schulter), lE: ruhe(li.ellbogen), rS: ruhe(re.schulter), rE: ruhe(re.ellbogen), hammer: ruhe(hammer) };
  wurzel.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  /** t in Sekunden; eigener Takt je Figur, damit nicht alle gleich atmen */
  const tick = (t: number) => {
    const atmen = Math.sin(t * 1.7), wiegen = Math.sin(t * 0.55);
    rumpf.scale.set(1 + 0.012 * atmen, 1 + 0.018 * atmen, 1 + 0.02 * atmen);
    huefte.position.x = 0.025 * wiegen; G.huefte.g.rotation.z = G.huefte.ruhe.z - 0.025 * wiegen; G.rumpf.g.rotation.z = G.rumpf.ruhe.z + 0.03 * wiegen; G.rumpf.g.rotation.x = G.rumpf.ruhe.x + 0.015 * atmen;
    /* Umschauen: ruhig zur Seite, kurz verweilen, zurück */
    const blick = Math.sin(t * 0.31) * Math.abs(Math.sin(t * 0.31)) ** 0.5; G.kopf.g.rotation.y = G.kopf.ruhe.y + 0.5 * blick; G.kopf.g.rotation.x = G.kopf.ruhe.x - 0.04 * atmen + 0.06 * Math.sin(t * 0.23);
    G.lS.g.rotation.x = G.lS.ruhe.x + 0.04 * Math.sin(t * 1.7 + 0.6); G.lE.g.rotation.x = G.lE.ruhe.x - 0.03 * Math.sin(t * 1.7 + 1);
    /* alle 9 Sekunden hebt er den Hammer, dreht ihn und prüft den Kopf */
    const p = (t % 9) / 9, w = p > 0.72 ? Math.sin(((p - 0.72) / 0.28) * Math.PI) : 0, w2 = w * w * (3 - 2 * w);
    G.rS.g.rotation.x = G.rS.ruhe.x - 0.35 * w2 + 0.03 * atmen; G.rE.g.rotation.x = G.rE.ruhe.x - 0.75 * w2; G.hammer.g.rotation.y = G.hammer.ruhe.y + 0.9 * w2 * Math.sin(t * 2.2);
    G.kopf.g.rotation.x += 0.22 * w2; G.kopf.g.rotation.y = G.kopf.g.rotation.y * (1 - w2) + 0.25 * w2;
  };
  wurzel.scale.setScalar(1.12);   /* kräftiger Mann, etwa so groß wie die Helden */
  tick(0);
  return { gruppe: wurzel, tick };
}

export const MODELLE: Record<string, () => { gruppe: THREE.Group; tick(t: number): void }> = { handwerker };
