/*
 * 3D-Modelle fürs Handwerk (27.11.2026): Kessel, Herd, Backofen, Tebbes Schuppen, Wasserrad – aus einfachen Körpern gebaut wie Esse und Amboss
 * (client/src/welt3d/werkstatt.ts), als GLB für `modell3d` in der Objektbibliothek.
 * Maße in Metern (1 m ≈ 1 Feld), Fuß im Ursprung, y nach oben, die Vorderseite zeigt nach +z (Süden, zur Kamera).
 * Benannte Knoten im GLB: „modell“ (alles Feste), „flammen“ (unbeleuchtet, zum Flackern), „rad“ (Wasserrad, dreht sich um die z-Achse).
 * Aufruf (im Ordner realtime): node werkzeug/modelle3d/bauen.mjs
 */
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { Teile, matrix, zufall, bausch, MUSTER, MATERIALIEN } from "../../client/src/welt3d/teile";
import { esse, flammen, amboss } from "../../client/src/welt3d/werkstatt";

const HOLZ = "#6e4a2c", HOLZ_HELL = "#8a6240", HOLZ_ALT = "#6a5a48", EISEN = "#3b3d42", EISEN_HELL = "#5a5d64", STEIN = "#8a8378", LEHM = "#b4825a", GLUT = "#ff7a1c";

/** Stange von a nach b */
function stab(t: Teile, a: THREE.Vector3, b: THREE.Vector3, r: number, farbe: string, muster: "holz" | "metall" | "rinde" = "holz") {
  const d = b.clone().sub(a), l = d.length(), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  t.add(new THREE.CylinderGeometry(r, r, l, 7), farbe, new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1)), { muster }); }
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
/** Holzscheit liegend: Länge entlang der Drehung ry, Neigung rz */
function scheit(t: Teile, x: number, y: number, z: number, ry: number, l = 0.7, r = 0.07, neig = 0) {
  t.add(new THREE.CylinderGeometry(r, r * 1.08, l, 7), "#5d4129", matrix(x, y + r, z, 0, ry, Math.PI / 2 + neig), { muster: "rinde" });
  for (const s of [-1, 1]) t.add(new THREE.CircleGeometry(r * 0.95, 7), "#b08a5a", new THREE.Matrix4().compose(V(x + Math.cos(ry) * s * l / 2, y + r, z - Math.sin(ry) * s * l / 2), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry + (s > 0 ? Math.PI / 2 : -Math.PI / 2), 0)), V(1, 1, 1)), { muster: "glatt" }); }
/** Gemauerter Bogen (Halbkreis aus Steinen) in der x-y-Ebene bei z */
function bogen(t: Teile, x: number, y: number, z: number, r: number, tiefe: number, farbe = STEIN) {
  const n = 9; for (let i = 0; i < n; i++) { const a = Math.PI * (i + 0.5) / n;
    t.add(new THREE.BoxGeometry(0.16, 0.13, tiefe), farbe, matrix(x + Math.cos(a) * r, y + Math.sin(a) * r, z, 0, 0, a - Math.PI / 2), { muster: "stein", schwanken: 0.08 }); } }
/** Glutstücke */
function glut(t: Teile, x: number, y: number, z: number, r: number, n = 12, saat = 1) {
  for (let i = 0; i < n; i++) { const a = zufall(i, saat) * Math.PI * 2, rr = zufall(i, saat + 2) * r, s = 0.05 + zufall(i, saat + 4) * 0.06;
    t.add(new THREE.IcosahedronGeometry(1, 0), i % 3 ? GLUT : "#ffcf6e", matrix(x + Math.cos(a) * rr, y + s * 0.5, z + Math.sin(a) * rr * 0.8, 0, i, 0, s, s * 0.6, s), { muster: "glatt" }); } }

/* ───────── Kessel: Feuerstelle mit Steinring, Dreibein, Kette, eiserner Kessel mit Suppe ───────── */
export function kessel() {
  const t = new Teile("glatt"), fl = new Teile("glatt");
  for (let i = 0; i < 11; i++) { const a = (i / 11) * Math.PI * 2; t.add(bausch(1, 0.14, i + 3), i % 2 ? "#7d776e" : "#8f897f", matrix(Math.cos(a) * 0.58, 0.07, Math.sin(a) * 0.58, 0, a, 0, 0.17, 0.13, 0.15), { muster: "stein" }); }
  t.add(new THREE.CylinderGeometry(0.48, 0.5, 0.04, 16), "#2b2622", matrix(0, 0.02, 0), { muster: "glatt" });
  for (const [a, n] of [[0.3, 0.12], [1.9, -0.1], [3.4, 0.15], [4.8, -0.08]] as const) scheit(t, Math.cos(a) * 0.12, 0.04, Math.sin(a) * 0.12, a, 0.62, 0.06, n);
  glut(t, 0, 0.05, 0, 0.3, 14, 3);
  const top = V(0, 1.62, 0); for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2 + 0.5; stab(t, V(Math.cos(a) * 0.82, 0, Math.sin(a) * 0.82), top, 0.035, HOLZ_ALT, "holz"); }
  t.add(new THREE.TorusGeometry(0.06, 0.02, 6, 12), EISEN, matrix(0, 1.57, 0, Math.PI / 2), { muster: "metall" });
  for (let i = 0; i < 7; i++) t.add(new THREE.TorusGeometry(0.03, 0.009, 5, 8), EISEN_HELL, matrix(0, 1.5 - i * 0.055, 0, 0, i % 2 ? Math.PI / 2 : 0, 0, 1, 1.4, 1), { muster: "metall" });
  const profil = [[0, 0], [0.2, 0.01], [0.31, 0.07], [0.36, 0.18], [0.35, 0.29], [0.31, 0.37], [0.3, 0.4], [0.34, 0.42]].map(([r, y]) => new THREE.Vector2(r, y));
  t.add(new THREE.LatheGeometry(profil, 18), EISEN, matrix(0, 0.62, 0), { muster: "metall" });
  t.add(new THREE.TorusGeometry(0.335, 0.025, 6, 20), EISEN_HELL, matrix(0, 1.04, 0, Math.PI / 2), { muster: "metall" });
  t.add(new THREE.CircleGeometry(0.3, 18), "#7a8a3a", matrix(0, 0.99, 0, -Math.PI / 2), { muster: "glatt" });    /* Suppe */
  for (let i = 0; i < 5; i++) t.add(new THREE.SphereGeometry(0.025 + zufall(i, 9) * 0.02, 6, 4), "#9aaa52", matrix((zufall(i, 1) - 0.5) * 0.4, 0.995, (zufall(i, 2) - 0.5) * 0.4), { muster: "glatt" });
  t.add(new THREE.TorusGeometry(0.36, 0.012, 5, 20, Math.PI), EISEN_HELL, matrix(0, 1.04, 0, 0, 0, 0, 1, 1.25, 1), { muster: "metall" });   /* Henkel bis zur Kette */
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; fl.add(new THREE.ConeGeometry(0.08, 0.32 + zufall(i, 4) * 0.2, 6), i % 2 ? GLUT : "#ffb040", matrix(Math.cos(a) * 0.14, 0.2, Math.sin(a) * 0.14), { muster: "glatt" }); }
  fl.add(new THREE.ConeGeometry(0.12, 0.5, 7), "#ff9a2e", matrix(0, 0.27, 0), { muster: "glatt" });
  return { teile: t, flammen: fl };
}

/* ───────── Herd: gemauerter Küchenherd mit Eisenplatte, Feuerloch, Rauchabzug, Topf und Pfanne ───────── */
export function herd() {
  const t = new Teile("stein"), fl = new Teile("glatt"), B = 1.6, T = 0.85, H = 0.86;
  t.box(B, H, T, 0, 0, 0, "#8d857a", 0, { muster: "stein", schwanken: 0.05 });
  t.box(B + 0.06, 0.06, T + 0.06, 0, H, 0, "#6f6a63", 0, { muster: "stein" });                         /* Abdeckstein */
  t.box(B - 0.2, 0.04, T - 0.2, 0, H + 0.06, 0, "#2f3034", 0, { muster: "metall" });                    /* Herdplatte */
  for (const x of [-0.42, 0.32]) t.add(new THREE.TorusGeometry(0.16, 0.02, 5, 18), EISEN_HELL, matrix(x, H + 0.1, 0.02, Math.PI / 2), { muster: "metall" });
  /* Feuerloch vorn mit Glut, halb offene Eisentür, darunter Holzfach mit Scheiten */
  t.box(0.56, 0.32, 0.04, -0.25, 0.4, T / 2 + 0.001, "#1a1614", 0, { muster: "glatt" }); bogen(t, -0.25, 0.72, T / 2 + 0.03, 0.3, 0.08, "#7a6f66");
  glut(t, -0.25, 0.41, T / 2 - 0.05, 0.2, 10, 7);
  t.add(new THREE.BoxGeometry(0.34, 0.3, 0.03), EISEN, matrix(-0.62, 0.56, T / 2 + 0.16, 0, -1.1, 0), { muster: "metall" });
  t.box(0.6, 0.3, 0.04, 0.42, 0.05, T / 2 + 0.001, "#2a221c", 0, { muster: "glatt" });
  for (let i = 0; i < 3; i++) scheit(t, 0.42, 0.06 + i * 0.09 - (i > 1 ? 0.02 : 0), T / 2 - 0.15 + (i % 2) * 0.04, Math.PI / 2 + 0.05 * i, 0.5, 0.045);
  /* Rauchabzug hinten */
  t.box(0.62, 1.4, 0.36, 0, H, -T / 2 + 0.18, "#857c71", 0, { muster: "stein", schwanken: 0.05 });
  t.add(new THREE.CylinderGeometry(0.42, 0.62, 0.36, 4, 1), "#7d756b", matrix(0, H + 0.55, -T / 2 + 0.36, 0, Math.PI / 4, 0, 1, 1, 0.55), { muster: "stein" });
  /* Topf mit Deckel, Pfanne mit Stiel, Kochlöffel an einer Stange */
  t.add(new THREE.CylinderGeometry(0.15, 0.13, 0.22, 14), "#4a4c52", matrix(-0.42, H + 0.21, 0.02), { muster: "metall" });
  t.add(new THREE.CylinderGeometry(0.16, 0.16, 0.025, 14), "#5a5d64", matrix(-0.42, H + 0.33, 0.02), { muster: "metall" }); t.add(new THREE.SphereGeometry(0.03, 6, 4), HOLZ, matrix(-0.42, H + 0.355, 0.02), { muster: "holz" });
  t.add(new THREE.CylinderGeometry(0.17, 0.15, 0.05, 14), "#2e3034", matrix(0.32, H + 0.125, 0.02), { muster: "metall" }); t.box(0.34, 0.025, 0.04, 0.6, H + 0.12, 0.05, HOLZ, -0.25, { muster: "holz" });
  t.add(new THREE.CircleGeometry(0.14, 12), "#d8b45a", matrix(0.32, H + 0.152, 0.02, -Math.PI / 2), { muster: "glatt" });     /* Eier/Pfannkuchen */
  stab(t, V(-0.75, H + 0.55, T / 2 + 0.02), V(0.75, H + 0.55, T / 2 + 0.02), 0.015, EISEN_HELL, "metall");
  for (const [x, l] of [[-0.45, 0.32], [-0.2, 0.28], [0.1, 0.36]] as const) { stab(t, V(x, H + 0.55, T / 2 + 0.03), V(x, H + 0.55 - l, T / 2 + 0.03), 0.012, HOLZ_HELL, "holz"); t.add(new THREE.SphereGeometry(0.04, 6, 4), HOLZ_HELL, matrix(x, H + 0.55 - l, T / 2 + 0.03, 0, 0, 0, 1, 0.6, 0.5), { muster: "holz" }); }
  for (let i = 0; i < 4; i++) fl.add(new THREE.ConeGeometry(0.06, 0.14 + zufall(i, 3) * 0.08, 6), i % 2 ? GLUT : "#ffb040", matrix(-0.25 + (i - 1.5) * 0.11, 0.48, T / 2 - 0.06), { muster: "glatt" });
  return { teile: t, flammen: fl };
}

/* ───────── Backofen: Lehmkuppel auf Steinsockel, gemauerter Bogen, Glut, Rauchloch, Brotschieber, Brote, Holzfach ───────── */
export function backofen() {
  const t = new Teile("putz"), fl = new Teile("glatt"), SB = 2.0, ST = 1.9, SH = 0.85;
  t.box(SB, SH, ST, 0, 0, 0, STEIN, 0, { muster: "stein", schwanken: 0.05 });
  t.box(SB + 0.08, 0.08, ST + 0.08, 0, SH, 0, "#78726a", 0, { muster: "stein" });
  t.box(0.9, 0.42, 0.05, 0, 0.12, ST / 2 + 0.001, "#2a221c", 0, { muster: "glatt" });                  /* Holzfach im Sockel */
  for (let i = 0; i < 5; i++) scheit(t, -0.25 + (i % 3) * 0.25, 0.13 + Math.floor(i / 3) * 0.13, ST / 2 - 0.25, Math.PI / 2, 0.6, 0.06);
  const kuppel = new THREE.SphereGeometry(0.88, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2); const p = kuppel.attributes.position;
  for (let i = 0; i < p.count; i++) { const f = 1 + (zufall(i, 13) - 0.5) * 0.04; p.setXYZ(i, p.getX(i) * f, p.getY(i) * f, p.getZ(i) * f); }
  t.add(kuppel, LEHM, matrix(0, SH + 0.08, -0.05, 0, 0, 0, 1, 0.82, 1), { muster: "putz", schwanken: 0.04, verlauf: [0.85, 1.08] });
  /* Ofenloch vorn: dunkle Öffnung, Glut, Bogen aus Ziegeln */
  t.add(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 14, 1, false, 0, Math.PI), "#1c1714", matrix(0, SH + 0.1, 0.78, Math.PI / 2, 0, -Math.PI / 2), { muster: "glatt" });
  t.box(0.6, 0.02, 0.06, 0, SH + 0.08, 0.78, "#1c1714", 0, { muster: "glatt" });
  bogen(t, 0, SH + 0.1, 0.8, 0.36, 0.14, "#9a5a42");
  glut(t, 0, SH + 0.09, 0.55, 0.22, 10, 11);
  t.add(new THREE.CylinderGeometry(0.1, 0.12, 0.32, 10), "#8f6a4c", matrix(0, SH + 0.08 + 0.72 + 0.05, 0.35, 0.25, 0, 0), { muster: "putz" });     /* Rauchloch */
  /* Brotschieber angelehnt, Brote auf dem Rand */
  stab(t, V(0.95, 0, 1.15), V(0.75, 1.95, 0.98), 0.025, HOLZ_HELL, "holz"); t.add(new THREE.BoxGeometry(0.34, 0.02, 0.4), HOLZ_HELL, matrix(0.97, 0.12, 1.2, 1.38, 0, -0.1), { muster: "holz" });
  for (const [x, z] of [[-0.75, 0.8], [-0.52, 0.86], [0.62, 0.84]] as const) { t.add(new THREE.SphereGeometry(0.13, 10, 7), "#a8743e", matrix(x, SH + 0.15, z, 0, x * 3, 0, 1.25, 0.55, 0.85), { muster: "putz", verlauf: [0.8, 1.15] });
    for (const d of [-0.05, 0.04]) t.box(0.012, 0.01, 0.12, x + d, SH + 0.215, z, "#e2c08a", x * 3 + 0.4, { muster: "glatt" }); }
  for (let i = 0; i < 5; i++) fl.add(new THREE.ConeGeometry(0.05, 0.1 + zufall(i, 7) * 0.1, 6), i % 2 ? GLUT : "#ffb040", matrix((i - 2) * 0.08, SH + 0.14, 0.58), { muster: "glatt" });
  return { teile: t, flammen: fl };
}

/* ───────── Tebbes Schuppen: offener Werkschuppen mit Pultdach; Esse links hinten, Amboss vorn, rechts hinten Platz für die Werkbank ───────── */
export const SCHUPPEN_WERKBANK = { x: 1.25, z: -0.95, ry: 0 };    /* hier passt die Werkbank (1,9 × 0,9 m) hin, Vorderseite nach Süden */
export function schuppen() {
  const t = new Teile("holz"), fl = new Teile("glatt"), B = 5.0, T = 3.4, HV = 2.6, HH = 2.05, x0 = -B / 2, x1 = B / 2, zv = T / 2, zh = -T / 2;
  const hoehe = (z: number) => HH + (HV - HH) * ((z - zh) / T);
  /* Boden aus Bohlen, ein Stück über der Erde */
  for (let i = 0; i < 12; i++) t.box(B / 12 - 0.02, 0.1, T, x0 + (i + 0.5) * B / 12, 0, 0, i % 3 ? "#7a5a3c" : "#6e5034", 0, { muster: "holz", schwanken: 0.06 });
  /* Pfosten an den Ecken und vorn in der Mitte */
  for (const [x, z] of [[x0 + 0.1, zv - 0.1], [x1 - 0.1, zv - 0.1], [x0 + 0.1, zh + 0.1], [x1 - 0.1, zh + 0.1], [-0.6, zv - 0.1], [0.9, zv - 0.1]] as const) t.box(0.18, hoehe(z) - 0.1, 0.18, x, 0.1, z, "#5e4128", 0, { muster: "holz" });
  /* Rückwand und Seitenwände aus senkrechten Brettern (eine fehlt, einige kürzer) */
  const brett = (x: number, z: number, h: number, ry: number, i: number) => { if (i === 7) return; t.add(new THREE.BoxGeometry(0.22, h, 0.05), i % 4 ? "#6a4a2e" : "#5a3e26", matrix(x, 0.1 + h / 2, z, 0, ry, 0), { muster: "holz", schwanken: 0.07 }); };
  for (let i = 0; i < 22; i++) { const x = x0 + 0.12 + i * 0.226; brett(x, zh + 0.03, HH - 0.1 - (i % 5 === 3 ? 0.18 : 0), 0, i); }
  for (const xs of [x0 + 0.03, x1 - 0.03]) for (let i = 0; i < 15; i++) { const z = zh + 0.12 + i * 0.226; if (z > zv - 0.15) break; if (xs > 0 && i > 9 && i < 13) continue; brett(xs, z, hoehe(z) - 0.12, Math.PI / 2, i + 30); }
  /* Querriegel und Dachbalken */
  t.box(B, 0.14, 0.16, 0, HV - 0.14, zv - 0.1, "#5e4128", 0, { muster: "holz" }); t.box(B, 0.14, 0.16, 0, HH - 0.14, zh + 0.1, "#5e4128", 0, { muster: "holz" });
  const neig = Math.atan2(HV - HH, T);
  for (let i = 0; i < 6; i++) t.add(new THREE.BoxGeometry(0.12, 0.14, T + 0.7), "#5e4128", matrix(x0 + 0.1 + i * (B - 0.2) / 5, (HH + HV) / 2 + 0.02, 0, neig, 0, 0), { muster: "holz" });
  /* Pultdach aus Schindeln, mit Moos */
  t.add(new THREE.BoxGeometry(B + 0.6, 0.08, T + 0.9), "#5c5048", matrix(0, (HH + HV) / 2 + 0.14, 0.05, neig, 0, 0), { muster: "schindel", schwanken: 0.05 });
  for (let i = 0; i < 7; i++) t.add(bausch(1, 0.1, i + 40), "#5f7038", matrix(-2.2 + zufall(i, 3) * 4.4, (HH + HV) / 2 + 0.2 + (zufall(i, 5) - 0.5) * 0.4, -1.4 + zufall(i, 5) * 2.8, neig, 0, 0, 0.22 + zufall(i, 6) * 0.2, 0.05, 0.18), { muster: "laub" });
  /* Esse hinten links (Abzug durchs Dach), daneben Kohlehaufen und Löschfass */
  const eg = esse(t, -1.3, -0.75); const f = flammen(); f.updateMatrix(); fl.add(f.geometry.clone(), "#ffffff", matrix(-1.3, eg + 0.1, -0.75), { muster: "glatt" });
  t.box(0.62, 0.9, 0.62, -1.3, 0.85 + 1.62 + 0.7, -0.75, STEIN, 0, { muster: "stein" });
  t.add(bausch(2, 0.2, 77), "#1e1b19", matrix(-2.1, 0.12, 0.4, 0, 0, 0, 0.35, 0.22, 0.32), { muster: "glatt" });
  t.add(new THREE.CylinderGeometry(0.3, 0.27, 0.62, 12), "#6a4527", matrix(-0.2, 0.41, -1.05), { muster: "holz" });
  for (const y of [0.2, 0.62]) t.add(new THREE.TorusGeometry(0.29, 0.015, 4, 16), EISEN, matrix(-0.2, y, -1.05, Math.PI / 2), { muster: "metall" });
  t.add(new THREE.CircleGeometry(0.27, 14), "#3f6f84", matrix(-0.2, 0.68, -1.05, -Math.PI / 2), { muster: "glatt" });
  /* Amboss vorn rechts der Mitte */
  amboss(t, 0.55, 0.45, 0.25);
  /* Werkzeugbrett an der Rückwand: Zangen, Hämmer, Hufeisen; eine Laterne am Dachbalken; eine Kiste */
  t.box(1.4, 0.08, 0.06, 0.7, 1.45, zh + 0.09, "#5e4128", 0, { muster: "holz" });
  for (let i = 0; i < 6; i++) { const x = 0.15 + i * 0.22; if (i % 2) { stab(t, V(x, 1.45, zh + 0.13), V(x, 1.05, zh + 0.13), 0.015, HOLZ_HELL, "holz"); t.box(0.14, 0.06, 0.06, x, 1.0, zh + 0.13, EISEN, 0, { muster: "metall" }); }
    else { for (const s of [-1, 1]) stab(t, V(x, 1.45, zh + 0.13), V(x + s * 0.05, 1.0, zh + 0.13), 0.01, EISEN_HELL, "metall"); } }
  for (const x of [1.5, 1.7]) t.add(new THREE.TorusGeometry(0.06, 0.015, 5, 10, Math.PI * 1.6), EISEN_HELL, matrix(x, 1.62, zh + 0.12, 0, 0, Math.PI * 0.7), { muster: "metall" });
  stab(t, V(0.2, HV - 0.25, 0.3), V(0.2, HV - 0.6, 0.3), 0.01, EISEN, "metall"); t.box(0.16, 0.24, 0.16, 0.2, HV - 0.85, 0.3, "#c9a44a", 0, { muster: "metall" });
  t.box(0.5, 0.4, 0.4, 2.05, 0.1, 1.1, "#7a5232", 0.3, { muster: "holz" });
  return { teile: t, flammen: fl };
}

/* ───────── Wasserrad: zwei Kränze, Speichen, Schaufeln, Eisenbänder, Nabe und Welle; dazu ein Lagerbock. Das Rad steht in der x-y-Ebene, die Welle zeigt nach Norden (−z) ───────── */
export function wasserrad() {
  const rad = new Teile("holz"), fest = new Teile("holz"), R = 1.6, Bw = 0.75, MY = 1.5;
  for (const z of [-Bw / 2, Bw / 2]) { const n = 18;
    for (let i = 0; i < n; i++) { const a = (i + 0.5) / n * Math.PI * 2, l = 2 * Math.PI * R / n + 0.02;
      rad.add(new THREE.BoxGeometry(l, 0.2, 0.09), i % 3 ? "#6e4a2c" : "#5e3e24", matrix(Math.cos(a) * R, Math.sin(a) * R, z, 0, 0, a + Math.PI / 2), { muster: "holz", schwanken: 0.06 }); }
    rad.add(new THREE.TorusGeometry(R + 0.105, 0.018, 5, 40), EISEN, matrix(0, 0, z), { muster: "metall" });
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; rad.add(new THREE.BoxGeometry(R - 0.12, 0.1, 0.08), "#6a4628", matrix(Math.cos(a) * (R / 2 + 0.05), Math.sin(a) * (R / 2 + 0.05), z, 0, 0, a), { muster: "holz" }); } }
  for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2;   /* Schaufeln quer zwischen den Kränzen, leicht schräg */
    rad.add(new THREE.BoxGeometry(0.42, 0.05, Bw + 0.04), i % 2 ? "#7a5636" : "#6a4a2e", matrix(Math.cos(a) * (R - 0.02), Math.sin(a) * (R - 0.02), 0, 0, 0, a + 0.25), { muster: "holz", schwanken: 0.06 }); }
  rad.add(new THREE.CylinderGeometry(0.24, 0.24, Bw + 0.16, 12), "#5a3c22", matrix(0, 0, 0, Math.PI / 2), { muster: "rinde" });
  for (const z of [-Bw / 2 - 0.08, Bw / 2 + 0.08]) rad.add(new THREE.TorusGeometry(0.24, 0.025, 5, 14), EISEN, matrix(0, 0, z), { muster: "metall" });
  rad.add(new THREE.CylinderGeometry(0.09, 0.09, 1.9, 10), "#4a3420", matrix(0, 0, -0.75, Math.PI / 2), { muster: "holz" });   /* Welle zur Mühle */
  /* Lagerbock vorn (außen), steht im Wasser */
  fest.box(0.5, MY - 0.15, 0.4, 0, -0.4, Bw / 2 + 0.45, "#7d776e", 0, { muster: "stein", schwanken: 0.06 });
  fest.box(0.36, 0.22, 0.3, 0, MY - 0.55 + 0.02, Bw / 2 + 0.45, "#5e4128", 0, { muster: "holz" });
  fest.add(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8), "#4a3420", matrix(0, MY, Bw / 2 + 0.3, Math.PI / 2), { muster: "holz" });
  return { teile: fest, rad, mitte: MY };
}

/* ───────── Phase 4: Zelt der Banditen, Fußspuren, verschlossene Tür im Fels ───────── */
/** Spitzzelt aus grober Plane über zwei Stangen und einem Firstholz, vorn halb offen, rot geflickt; 2,6 × 2,2 m */
export function zelt() {
  const t = new Teile("putz"), B = 2.6, T = 2.2, H = 1.75, PLANE = "#8c7a5c", FLICK = "#8a2e24";
  stab(t, V(0, 0, T / 2 + 0.05), V(0, H + 0.12, T / 2 + 0.05), 0.04, HOLZ_ALT); stab(t, V(0, 0, -T / 2 - 0.05), V(0, H + 0.12, -T / 2 - 0.05), 0.04, HOLZ_ALT);
  stab(t, V(0, H, -T / 2 - 0.15), V(0, H, T / 2 + 0.15), 0.035, HOLZ_ALT);
  for (const s of [-1, 1]) { const g = new THREE.BufferGeometry(); const p = new Float32Array([0, H, -T / 2, s * B / 2, 0, -T / 2, s * B / 2, 0, T / 2, 0, H, -T / 2, s * B / 2, 0, T / 2, 0, H, T / 2]);
    g.setAttribute("position", new THREE.BufferAttribute(p, 3)); g.computeVertexNormals(); t.add(g, PLANE, undefined, { muster: "putz", schwanken: 0.05 }); }
  t.flaechen([[[0, H, -T / 2], [-B / 2, 0, -T / 2], [B / 2, 0, -T / 2]]], "#7d6c50", { muster: "putz" });                           /* Rückwand */
  t.flaechen([[[0, H, T / 2], [-B / 2, 0, T / 2], [-0.25, 0, T / 2 + 0.15]]], "#7d6c50", { muster: "putz" });                     /* Vorderseite halb, Eingang offen */
  t.flaechen([[[0.05, H * 0.95, T / 2 + 0.02], [0.35, 0, T / 2 + 0.45], [B / 2, 0, T / 2]]], "#6e5e44", { muster: "putz" });          /* zurückgeschlagene Klappe */
  t.box(0.5, 0.35, 0.02, -0.65, 0.4, -T / 2 - 0.01, FLICK, 0, { muster: "putz" }); t.add(new THREE.BoxGeometry(0.45, 0.4, 0.02), FLICK, matrix(0.75, 0.75, 0.2, 0, Math.PI / 2, 0.55), { muster: "putz" });
  for (const [x, z] of [[-B / 2 - 0.25, -T / 2 + 0.2], [B / 2 + 0.25, -T / 2 + 0.2], [-B / 2 - 0.25, T / 2 - 0.2], [B / 2 + 0.25, T / 2 - 0.2]] as const) { stab(t, V(x, 0, z), V(x * 0.9, 0.25, z), 0.02, HOLZ_ALT); stab(t, V(x * 0.9, 0.22, z), V(x > 0 ? 1.0 : -1.0, 0.6, z), 0.006, "#c8b88a"); }
  t.box(1.0, 0.08, 0.7, 0, 0, -0.2, "#5a4a3a", 0.1, { muster: "putz" });                                                            /* Lager drinnen */
  return { teile: t, flammen: new Teile("glatt") };
}
/** Fußspuren im Boden: zwei Paar Stiefel, eine Karrenspur, ein liegengelassener Apfel (flach, ohne Kollision) */
export function spuren() {
  const t = new Teile("glatt"), MATSCH = "#4a3a28";
  for (let i = 0; i < 7; i++) { const z = -1.1 + i * 0.36, x = (i % 2 ? 0.14 : -0.14) - 0.35 + i * 0.03;
    t.add(new THREE.CylinderGeometry(0.075, 0.07, 0.012, 9), MATSCH, matrix(x, 0.006, z, 0, 0.1, 0, 0.75, 1, 1.35), { muster: "glatt" });
    t.add(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 8), MATSCH, matrix(x, 0.006, z - 0.17, 0, 0, 0, 0.8, 1, 0.8), { muster: "glatt" }); }
  for (let i = 0; i < 5; i++) { const z = -0.9 + i * 0.42, x = 0.45 + (i % 2 ? 0.12 : -0.12);
    t.add(new THREE.CylinderGeometry(0.07, 0.065, 0.012, 9), "#3f3122", matrix(x, 0.007, z, 0, -0.15, 0, 0.8, 1, 1.4), { muster: "glatt" }); }
  for (const x of [-0.95, -0.55]) t.box(0.07, 0.008, 2.4, x, 0, 0, "#54432f", 0.05, { muster: "glatt" });
  t.add(new THREE.SphereGeometry(0.06, 9, 7), "#b8352c", matrix(0.15, 0.055, 0.85), { muster: "glatt" }); t.add(new THREE.CylinderGeometry(0.006, 0.006, 0.04, 4), "#4a3520", matrix(0.15, 0.12, 0.85), { muster: "holz" });
  return { teile: t, flammen: new Teile("glatt") };
}
/** Verschlossene Tür in einem Felsgang: Bohlentür mit Eisenbändern und Schloss in einem Rahmen aus Balken, 3 m breit (füllt den Gang) */
export function felstuer() {
  const t = new Teile("holz"), B = 3.0, H = 2.3;
  t.box(0.35, H + 0.3, 0.5, -B / 2 + 0.17, 0, 0, "#6f6a63", 0, { muster: "stein", schwanken: 0.06 }); t.box(0.35, H + 0.3, 0.5, B / 2 - 0.17, 0, 0, "#6f6a63", 0, { muster: "stein", schwanken: 0.06 });
  t.box(B, 0.3, 0.5, 0, H, 0, "#5e4128", 0, { muster: "holz" });
  for (let i = 0; i < 7; i++) t.box((B - 0.7) / 7 - 0.02, H, 0.12, -B / 2 + 0.35 + (i + 0.5) * (B - 0.7) / 7, 0, 0, i % 2 ? "#6a4628" : "#5e3e24", 0, { muster: "holz", schwanken: 0.06 });
  for (const y of [0.35, 1.15, 1.95]) t.box(B - 0.7, 0.09, 0.03, 0, y, 0.075, EISEN, 0, { muster: "metall" });
  for (const y of [0.35, 1.15, 1.95]) for (const x of [-1.0, -0.4, 0.2, 0.8]) t.add(new THREE.SphereGeometry(0.025, 6, 4), EISEN_HELL, matrix(x, y + 0.045, 0.1), { muster: "metall" });
  t.box(0.22, 0.28, 0.06, 0.75, 0.95, 0.09, "#3a3c40", 0, { muster: "metall" }); t.add(new THREE.TorusGeometry(0.07, 0.015, 5, 12), "#8a6a2a", matrix(0.75, 1.0, 0.14), { muster: "metall" });
  t.add(new THREE.CylinderGeometry(0.018, 0.018, 0.04, 6), "#111111", matrix(0.75, 1.03, 0.12, Math.PI / 2), { muster: "glatt" });
  return { teile: t, flammen: new Teile("glatt") };
}

/* ───────── Ausgabe ───────── */
/** Teile → Mesh mit glTF-tauglichen Materialien (Standard statt Lambert, Farbe ≤ 1; die Aufhellung der Muster steckt in den Eckpunktfarben) */
const STANDARD = MUSTER.map((m, i) => { const alt = MATERIALIEN[i] as THREE.MeshLambertMaterial;
  return new THREE.MeshStandardMaterial({ name: "mythara_" + m, vertexColors: true, map: alt.map, color: 0xffffff, roughness: m === "metall" ? 0.55 : 0.92, metalness: m === "metall" ? 0.35 : 0, side: THREE.DoubleSide }); });
function netz(t: Teile, name: string, hell = 1.12) {
  const g = t.geometrie(), c = g.attributes.color; for (let i = 0; i < c.count; i++) c.setXYZ(i, Math.min(1, c.getX(i) * hell), Math.min(1, c.getY(i) * hell), Math.min(1, c.getZ(i) * hell));
  const gr = g.groups.map((q) => q.materialIndex ?? 0); const m = new THREE.Mesh(g, gr.map((k) => STANDARD[k])); g.groups.forEach((q, i) => (q.materialIndex = i)); m.name = name; return m; }
function flammenNetz(t: Teile) { const m = new THREE.Mesh(t.geometrie(), new THREE.MeshBasicMaterial({ name: "mythara_flamme", vertexColors: true, toneMapped: false })); m.name = "flammen"; return m; }

export function alle(): Record<string, THREE.Group> {
  const aus: Record<string, THREE.Group> = {};
  for (const [id, f] of [["kessel", kessel], ["herd", herd], ["backofen", backofen], ["tebbes_schuppen", schuppen], ["zelt", zelt], ["spuren", spuren], ["felstuer", felstuer]] as const) {
    const g = new THREE.Group(); g.name = id; const r = f(); g.add(netz(r.teile, "modell")); if (!r.flammen.leer) g.add(flammenNetz(r.flammen)); aus[id] = g; }
  const w = wasserrad(), g = new THREE.Group(); g.name = "wasserrad"; g.add(netz(w.teile, "modell")); const rad = netz(w.rad, "rad"); rad.position.y = w.mitte; g.add(rad); aus.wasserrad = g;
  return aus;
}
export async function glb(g: THREE.Object3D): Promise<ArrayBuffer> {
  return (await new GLTFExporter().parseAsync(g, { binary: true, onlyVisible: true, maxTextureSize: 256 })) as ArrayBuffer; }

/* Vorschau: Szene mit Licht, Kamera schräg von vorn */
export function vorschau(g: THREE.Object3D, breite: number, hoehe: number, schraeg = true, ortho = false): string {
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); r.setSize(breite, hoehe); r.toneMapping = THREE.ACESFilmicToneMapping; r.outputColorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Scene(); s.add(new THREE.HemisphereLight(0xfff4e0, 0x5a5040, 1.4)); const l = new THREE.DirectionalLight(0xfff0d8, 2.2); l.position.set(-4, 7, 5); s.add(l);
  const box = new THREE.Box3().setFromObject(g), m = box.getCenter(new THREE.Vector3()), gr = box.getSize(new THREE.Vector3()), d = Math.max(gr.x, gr.y, gr.z);
  let cam: THREE.Camera;
  if (ortho) { const k = new THREE.OrthographicCamera(-breite / 96, breite / 96, hoehe / 96, -hoehe / 96, 0.1, 100); k.position.set(0, 0.6 * Math.tan(0.62) * 20, 20).add(new THREE.Vector3(0, 0, 0)); k.position.set(0, 20 * Math.sin(0.62), 20 * Math.cos(0.62)); k.lookAt(0, 0, 0); cam = k; }
  else { const k = new THREE.PerspectiveCamera(32, breite / hoehe, 0.1, 100); k.position.copy(m).add(new THREE.Vector3(schraeg ? d * 0.95 : 0, d * 0.75, d * 1.9)); k.lookAt(m); cam = k; }
  s.add(g); r.render(s, cam); const url = r.domElement.toDataURL("image/png"); s.remove(g); r.dispose(); return url;
}
(globalThis as unknown as { HANDWERK: unknown }).HANDWERK = { alle, glb, vorschau };
