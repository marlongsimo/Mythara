/*
 * 3D-Prototyp – Werkstatt der Schmiede (24.11.2026): Schmiedeofen (Esse) und Amboss als eigene Modelle aus einfachen Körpern.
 * Lage in Gebäude-Koordinaten (x Osten, z Süden, Fuß im Ursprung), Maße in Feldern. Die Flammen sind ein eigenes Netz, damit sie flackern können.
 */
import * as THREE from "three";
import { Teile, matrix, zufall } from "./teile";

const STEIN = "#8a8378", KRANZ = "#6f6a63", KOHLE = "#221d1a", EISEN = "#3b3d42", EISEN_HELL = "#585b62", GLUT = "#ff7a1c", GLUT_HELL = "#ffcf6e", HOLZ = "#6a4527", LEDER = "#7c4a2c";

/** Schmiedeofen: Herd aus Bruchstein mit Glut, Rauchfang auf Eisenstützen, Blasebalg rechts, Zange auf dem Rand. Zurück: die Höhe der Glut (für Licht und Schein). */
export function esse(t: Teile, x: number, z: number): number {
  const B = 1.9, T = 1.5, H = 0.85;
  t.box(B, H, T, x, 0, z, STEIN, 0, { muster: "stein", schwanken: 0.05 });                                            /* Herdblock */
  t.box(B - 0.3, 0.05, T - 0.3, x, H, z, KOHLE, 0, { muster: "glatt" });                                               /* Kohlebett */
  for (const [dx, dz, b, tt] of [[0, -(T / 2 - 0.07), B, 0.14], [0, T / 2 - 0.07, B, 0.14], [-(B / 2 - 0.07), 0, 0.14, T], [B / 2 - 0.07, 0, 0.14, T]] as const)
    t.box(b, 0.13, tt, x + dx, H, z + dz, KRANZ, 0, { muster: "stein" });                                              /* Steinkranz */
  for (let i = 0; i < 14; i++) { const a = zufall(i, 3) * Math.PI * 2, r = zufall(i, 5) * 0.45, s = 0.07 + zufall(i, 7) * 0.07;   /* Glutstücke */
    t.add(new THREE.IcosahedronGeometry(1, 0), i % 3 ? GLUT : GLUT_HELL, matrix(x + Math.cos(a) * r, H + 0.07, z + Math.sin(a) * r * 0.7, 0, i, 0, s, s * 0.6, s), { muster: "glatt" }); }
  for (const s of [-1, 1]) t.box(0.09, 0.78, 0.09, x + s * (B / 2 - 0.12), H, z - T / 2 + 0.12, EISEN, 0, { muster: "metall" });   /* Stützen vorn */
  t.add(new THREE.CylinderGeometry(0.42, 1.18, 0.9, 4, 1, true), STEIN, matrix(x, H + 0.78 + 0.45, z, 0, Math.PI / 4, 0, 1, 1, 0.78), { muster: "stein", schwanken: 0.04 });   /* Rauchfang */
  t.box(0.62, 0.7, 0.62, x, H + 1.62, z, STEIN, 0, { muster: "stein" });                                              /* Abzug bis unters Dach */
  /* Blasebalg: zwei Bretter, dazwischen Leder, Griff; die Düse zeigt in die Glut */
  const bx = x + B / 2 + 0.55;
  t.box(0.9, 0.05, 0.55, bx, 0.62, z, HOLZ, 0, { muster: "holz" }); t.box(0.9, 0.05, 0.55, bx, 0.98, z, HOLZ, 0, { muster: "holz" });
  t.add(new THREE.CylinderGeometry(0.06, 0.3, 0.8, 6, 1), LEDER, matrix(bx + 0.05, 0.8, z, 0, 0, Math.PI / 2, 1, 1, 0.8), { muster: "putz" });
  t.add(new THREE.CylinderGeometry(0.035, 0.05, 0.5, 6), EISEN, matrix(bx - 0.6, 0.8, z, 0, 0, Math.PI / 2), { muster: "metall" });
  t.box(0.06, 0.06, 0.5, bx + 0.48, 1.0, z, HOLZ, 0, { muster: "holz" });
  for (const s of [-1, 1]) t.box(0.08, 0.62, 0.08, bx + 0.3 * s, 0, z + 0.22, HOLZ, 0, { muster: "holz" });
  /* Zange auf dem Steinkranz */
  for (const s of [-1, 1]) t.add(new THREE.BoxGeometry(0.75, 0.03, 0.035), EISEN, matrix(x - 0.15, H + 0.15, z + T / 2 - 0.07 + s * 0.03, 0, s * 0.06, 0), { muster: "metall" });
  return H + 0.1;
}

/** Flammen über der Glut (eigenes Netz zum Flackern), Mitte im Ursprung */
export function flammen(): THREE.Mesh {
  const t = new Teile("glatt");
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2, r = i ? 0.28 : 0, h = i ? 0.32 + zufall(i, 2) * 0.18 : 0.55;
    t.add(new THREE.ConeGeometry(i ? 0.12 : 0.18, h, 7), i % 2 ? GLUT : "#ff9a2e", matrix(Math.cos(a) * r, h / 2, Math.sin(a) * r * 0.7), { muster: "glatt" });
    t.add(new THREE.ConeGeometry(i ? 0.06 : 0.09, h * 0.6, 6), GLUT_HELL, matrix(Math.cos(a) * r, h * 0.3, Math.sin(a) * r * 0.7), { muster: "glatt" }); }
  const m = new THREE.Mesh(t.geometrie(), new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false })); m.castShadow = false; return m;
}

/** Amboss auf einem Holzklotz: Fuß, Taille, Bahn, Horn (nach Osten), Ferse; ein Hammer liegt darauf. ry: Drehung um die Hochachse. */
export function amboss(t: Teile, x: number, z: number, ry = 0) {
  const basis = new THREE.Matrix4().makeRotationY(ry).setPosition(x, 0, z);
  const teil = (geo: THREE.BufferGeometry, farbe: string, m: THREE.Matrix4, muster: "metall" | "holz" | "rinde") => t.add(geo, farbe, basis.clone().multiply(m), { muster });
  const quader = (b: number, h: number, tt: number, px: number, py: number, pz: number, farbe: string, dreh = 0) => teil(new THREE.BoxGeometry(b, h, tt), farbe, matrix(px, py + h / 2, pz, 0, dreh), "metall");
  teil(new THREE.CylinderGeometry(0.4, 0.47, 0.55, 11), "#6a4a2e", matrix(0, 0.275, 0), "rinde");                       /* Holzklotz */
  teil(new THREE.CylinderGeometry(0.41, 0.41, 0.03, 11), "#a07a4e", matrix(0, 0.56, 0), "holz");                          /* Schnittfläche */
  quader(0.64, 0.15, 0.42, 0, 0.57, 0, EISEN);                                                                             /* Fuß */
  quader(0.34, 0.2, 0.24, 0, 0.72, 0, EISEN);                                                                              /* Taille */
  quader(0.96, 0.19, 0.34, -0.05, 0.92, 0, EISEN_HELL);                                                                    /* Bahn */
  quader(0.9, 0.02, 0.3, -0.05, 1.11, 0, "#7d8087");                                                                       /* blanke Arbeitsfläche */
  teil(new THREE.ConeGeometry(0.15, 0.55, 10), EISEN_HELL, matrix(0.7, 1.02, 0, 0, 0, -Math.PI / 2, 1, 1, 1.05), "metall"); /* Horn */
  quader(0.2, 0.13, 0.26, -0.62, 0.98, 0, EISEN_HELL);                                                                     /* Ferse */
  teil(new THREE.CylinderGeometry(0.03, 0.035, 0.6, 6), HOLZ, matrix(-0.1, 1.17, 0.06, 0, 0.5, Math.PI / 2), "holz");      /* Hammerstiel */
  quader(0.11, 0.11, 0.24, 0.17, 1.12, -0.11, EISEN, 0.5);                                                                 /* Hammerkopf */
}
