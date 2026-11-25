/*
 * 3D-Prototyp – Bäume und Kleinteile als Low-Poly-Modelle (eine Geometrie je Art, in der Welt als Instanzen gesetzt).
 * Maße in Feldern für Maßstab 1; die Größe der Bäume richtet sich nach ihrem gemalten 2D-Bild (groesse / 48 Bildpunkte je Feld),
 * damit Wald und Lichtungen so dicht wirken wie in der 2D-Welt. Was hier kein Modell hat, zeigt die Welt als gemaltes Bild (Billboard).
 */
import * as THREE from "three";
import { Teile, matrix, zufall, bausch, type Muster } from "./teile";

export type Typ = { id: string; kategorie: string; bild: string; groesse: [number, number]; anker: [number, number]; massstab: number; kollision: { art: string; r?: number; x?: number; y?: number; b?: number; h?: number } | null; plan: boolean };

const STAMM = "#5d4129";
function krone(t: Teile, hoehe: number, breite: number, farben: string[], kugeln: number, saat: number, form = 1) {
  for (let i = 0; i < kugeln; i++) { const a = (i / kugeln) * Math.PI * 2 + saat, r = i === 0 ? 0 : breite * 0.28, s = (i === 0 ? 0.62 : 0.46 + 0.1 * zufall(i, saat)) * breite;
    t.add(bausch(2, 0.13, saat * 3 + i), farben[i % farben.length], matrix(Math.cos(a) * r, hoehe * (i === 0 ? 0.68 : 0.56 + 0.12 * zufall(saat, i)), Math.sin(a) * r, zufall(i, 3), zufall(i, 4), 0, s, s * form, s), { muster: "laub", verlauf: [0.55, 1.2] }); } }
function laubbaum(H: number, Bt: number, farben: string[], saat: number, stamm = STAMM, form = 1, kugeln = 5) {
  const t = new Teile("rinde"); t.add(new THREE.CylinderGeometry(0.18, 0.32, H * 0.55, 9), stamm, matrix(0, H * 0.275, 0), 0.05);
  t.add(new THREE.CylinderGeometry(0.05, 0.1, H * 0.3, 4), stamm, matrix(0.35, H * 0.4, 0, 0, 0, -0.7));
  krone(t, H, Bt, farben, kugeln, saat, form); return t.geometrie(); }
function tanne(H: number, Bt: number, farben: string[]) {
  const t = new Teile("rinde"); t.add(new THREE.CylinderGeometry(0.12, 0.22, H * 0.3, 8), STAMM, matrix(0, H * 0.15, 0));
  const stufen = 4; for (let i = 0; i < stufen; i++) { const u = i / stufen, r = Bt * 0.5 * (1 - u * 0.72), h = H * 0.42 * (1 - u * 0.35);
    t.add(new THREE.ConeGeometry(r, h, 11), farben[i % farben.length], matrix(0, H * 0.18 + u * H * 0.62 + h / 2, 0, 0, i * 0.4, 0), { muster: "laub", verlauf: [0.6, 1.15] }); }
  return t.geometrie(); }
function toterBaum(H: number) {
  const t = new Teile("rinde"); t.add(new THREE.CylinderGeometry(0.12, 0.28, H * 0.7, 8), "#5a5148", matrix(0, H * 0.35, 0), 0.05);
  for (let i = 0; i < 5; i++) { const a = i * 1.3, y = H * (0.35 + i * 0.08); t.add(new THREE.CylinderGeometry(0.03, 0.08, H * 0.32, 4), "#5a5148", matrix(Math.cos(a) * 0.5, y + H * 0.1, Math.sin(a) * 0.5, Math.sin(a) * 0.8, 0, -Math.cos(a) * 0.8)); }
  return t.geometrie(); }

function palisade() { const t = new Teile("holz"); for (let i = 0; i < 5; i++) { const x = -0.8 + i * 0.4, h = 2.0 + zufall(i, 9) * 0.3;
    t.add(new THREE.CylinderGeometry(0.19, 0.2, h, 6), "#6e4c2e", matrix(x, h / 2, -0.35), 0.06); t.add(new THREE.ConeGeometry(0.19, 0.4, 6), "#6e4c2e", matrix(x, h + 0.2, -0.35)); }
  t.box(2.0, 0.14, 0.1, 0, 1.4, -0.12, "#4f3420"); return t.geometrie(); }
function zaun() { const t = new Teile("holz"); for (const x of [-0.95, 0.95]) t.box(0.14, 1.0, 0.14, x, 0, -0.15, "#6e4c2e"); t.box(2.0, 0.1, 0.06, 0, 0.75, -0.15, "#8a6440"); t.box(2.0, 0.1, 0.06, 0, 0.4, -0.15, "#8a6440"); return t.geometrie(); }
function fass() { const t = new Teile("holz"); t.add(new THREE.CylinderGeometry(0.3, 0.3, 0.72, 8), "#7a5232", matrix(0, 0.36, -0.1), 0.05); for (const y of [0.15, 0.57]) t.add(new THREE.CylinderGeometry(0.315, 0.315, 0.06, 8), "#3b3530", matrix(0, y, -0.1)); return t.geometrie(); }
function kiste() { const t = new Teile("holz"); t.box(0.82, 0.6, 0.5, 0, 0, -0.27, "#8b6440", 0.2, 0.06); t.box(0.86, 0.08, 0.54, 0, 0.5, -0.27, "#5b3b22", 0.2); return t.geometrie(); }
function laterne() { const t = new Teile(); t.box(0.1, 1.9, 0.1, 0, 0, 0, "#3b3530"); t.box(0.5, 0.06, 0.06, 0.2, 1.8, 0, "#3b3530"); t.box(0.22, 0.3, 0.22, 0.4, 1.45, 0, "#f3c25a"); return t.geometrie(); }
function heu() { const t = new Teile("stroh"); t.add(new THREE.CylinderGeometry(0.48, 0.48, 0.9, 10), "#c8a55a", matrix(0, 0.48, 0, 0, 0, Math.PI / 2), 0.06); return t.geometrie(); }
function holzstapel() { const t = new Teile("holz"); for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++) t.add(new THREE.CylinderGeometry(0.15, 0.15, 1.5, 6), r % 2 ? "#8a6440" : "#7a5634", matrix(-0.45 + i * 0.3 + r * 0.15, 0.15 + r * 0.26, -0.3, 0, 0, Math.PI / 2), 0.08); return t.geometrie(); }
function bank() { const t = new Teile("holz"); t.box(1.4, 0.08, 0.36, 0, 0.42, -0.18, "#8a6440"); for (const x of [-0.6, 0.6]) t.box(0.08, 0.42, 0.3, x, 0, -0.18, "#5b3b22"); return t.geometrie(); }
function marktstand(tuch: string) { const t = new Teile("holz"); for (const [x, z] of [[-1.4, -0.1], [1.4, -0.1], [-1.4, -1.0], [1.4, -1.0]]) t.box(0.1, 2.2, 0.1, x, 0, z, "#5b3b22");
  t.box(3.0, 0.9, 0.7, 0, 0, -0.35, "#8a6440", 0, 0.04); t.viereck([-1.6, 2.0, 0.2], [1.6, 2.0, 0.2], [1.6, 2.5, -1.2], [-1.6, 2.5, -1.2], tuch, { muster: "putz" });
  for (let i = 0; i < 6; i++) t.box(0.22, 0.2, 0.22, -1.1 + i * 0.44, 0.9, -0.35, ["#d2463c", "#e8c547", "#6aa04a"][i % 3]); return t.geometrie(); }
function kuerbisse() { const t = new Teile(); for (let i = 0; i < 6; i++) { const s = 0.22 + zufall(i, 2) * 0.12; t.add(new THREE.IcosahedronGeometry(1, 0), "#d9792c", matrix(-0.8 + i * 0.32, s * 0.8, -0.25 + zufall(i, 5) * 0.2 - 0.1, 0, i, 0, s, s * 0.8, s), 0.08); } return t.geometrie(); }
function brunnen() { const t = new Teile("stein"); t.add(new THREE.CylinderGeometry(1.0, 1.05, 0.8, 10, 1, true), "#8e8a80", matrix(0, 0.4, -0.35), 0.08); t.add(new THREE.CylinderGeometry(0.9, 0.9, 0.05, 10), "#2f6f8f", matrix(0, 0.55, -0.35), { muster: "glatt" });
  for (const x of [-0.9, 0.9]) t.box(0.14, 2.1, 0.14, x, 0, -0.35, "#5b3b22"); t.viereck([-1.2, 2.0, 0.4], [1.2, 2.0, 0.4], [1.2, 2.6, -0.35], [-1.2, 2.6, -0.35], "#a2553a", { muster: "ziegel" }); t.viereck([-1.2, 2.0, -1.1], [1.2, 2.0, -1.1], [1.2, 2.6, -0.35], [-1.2, 2.6, -0.35], "#a2553a", { muster: "ziegel" }); return t.geometrie(); }
function tor() { const t = new Teile("holz"); for (const x of [-2.1, 2.1]) { t.box(0.5, 4.0, 0.5, x, 0, -0.2, "#6e4c2e", 0, 0.05); t.add(new THREE.ConeGeometry(0.36, 0.5, 6), "#6e4c2e", matrix(x, 4.25, -0.2)); }
  t.box(4.9, 0.36, 0.4, 0, 3.3, -0.2, "#5b3b22"); t.box(1.6, 0.7, 0.08, 0, 2.55, 0.02, "#8a6440"); return t.geometrie(); }
function meiler() { const t = new Teile("stroh"); t.add(new THREE.ConeGeometry(1.1, 1.3, 9), "#3a332c", matrix(0, 0.65, 0), 0.1); return t.geometrie(); }
function stamm() { const t = new Teile("rinde"); t.add(new THREE.CylinderGeometry(0.45, 0.55, 9, 8), "#5d4129", matrix(0, 0.5, -4.5, Math.PI / 2, 0, 0), 0.05); return t.geometrie(); }

/** Kenney-Modelle (echtzeit/welt3d/modelle.json, aus werkzeug/welt/kenney3d.py): Dreiecke relativ zum Fuß, je Gruppe Muster und Farbe */
export type KenneyModell = { muster: string; farbe: string; p: number[] }[];
let KENNEY: Record<string, KenneyModell> = {};
export function setzeKenney(m: Record<string, KenneyModell>) { KENNEY = m; }
function kenney(m: KenneyModell) { const t = new Teile();
  for (const g of m) { const d: number[][][] = []; for (let i = 0; i + 8 < g.p.length; i += 9) d.push([[g.p[i], g.p[i + 1], g.p[i + 2]], [g.p[i + 3], g.p[i + 4], g.p[i + 5]], [g.p[i + 6], g.p[i + 7], g.p[i + 8]]]);
    if (d.length) t.flaechen(d, g.farbe, { muster: g.muster as Muster, schwanken: 0.03 }); }
  return t.geometrie(); }

/* ───────── Wasserbauten (begehbar: siehe STEGE), Moor, Höhle, Feuer, Schilf ───────── */
const BRETT = "#7a5634", BRETT_HELL = "#8f6a42", STEIN = "#8a857a", EISEN = "#3a3836", FLAMME = "#ffb24a", FLAMME_KERN = "#fff0b0";
/** Alte Moorbrücke (25.11.2026): fehlende Bohlen, gebrochenes Geländer (vorn/hinten: wie weit es reicht, kurz: abgebrochener Pfosten) */
const ALTE_BRUECKE: Record<string, { luecken: number[]; vorn: number; kurzVorn: number; hinten: number; kurzHinten: number }> = {
  moor_bruecke_alt_01: { luecken: [5, 11], vorn: 1, kurzVorn: 2, hinten: 1, kurzHinten: -1 }, moor_bruecke_alt_02: { luecken: [3, 9, 10], vorn: 0.42, kurzVorn: -1, hinten: 1, kurzHinten: 1 },
  moor_bruecke_alt_03: { luecken: [7], vorn: 0, kurzVorn: -1, hinten: 0.7, kurzHinten: 3 } };
function bruecke(laenge: number, breite: number, laengs: boolean, altId = "") {
  /* gebaut entlang x (Ost–West); laengs = Nord–Süd: am Ende um 90° gedreht. Fuß = Mitte der Südkante */
  const t = new Teile("holz"), hoch = 0.85, z0 = laengs ? 0 : -breite / 2, n = Math.round(laenge / 0.42), A = ALTE_BRUECKE[altId];
  for (let i = 0; i < n; i++) { if (A && A.luecken.includes(i)) continue; const x = -laenge / 2 + (i + 0.5) * laenge / n, kipp = A ? (zufall(i, 17) - 0.5) * 0.08 : 0, tief = A ? -zufall(i, 5) * 0.05 : 0;
    t.add(new THREE.BoxGeometry(laenge / n - (A ? 0.07 : 0.04), 0.12, breite * (A ? 0.94 + zufall(i, 9) * 0.06 : 1)), A ? (i % 3 ? "#7a6a58" : i % 2 ? "#6a5c4c" : "#86745e") : i % 3 ? BRETT : BRETT_HELL, matrix(x, hoch - 0.06 + tief, z0 + (A ? (zufall(i, 11) - 0.5) * 0.12 : 0), kipp, (A ? (zufall(i, 13) - 0.5) * 0.06 : 0), 0), { muster: "holz", schwanken: 0.06 });
    if (A && zufall(i, 21) < 0.3) t.box(laenge / n * 0.7, 0.02, breite * 0.4, x, hoch, z0 + (zufall(i, 23) - 0.5) * breite * 0.5, "#4f6236", 0, { muster: "laub" }); }   /* Moos */
  for (const [zr, bis, kurz] of [[z0 - breite / 2 + 0.1, A ? A.hinten : 1, A ? A.kurzHinten : -1], [z0 + breite / 2 - 0.1, A ? A.vorn : 1, A ? A.kurzVorn : -1]] as const) {
    let k = 0; for (let x = -laenge / 2 + 0.15; x <= laenge / 2; x += laenge / 4, k++) { t.box(0.22, 1.8, 0.22, x, hoch - 1.8, zr, A ? "#3d3226" : "#4a3020");
      if (k / 4 > bis + 0.01) continue; const h = k === kurz ? 0.42 : 0.9; t.add(new THREE.BoxGeometry(0.16, h, 0.16), A ? "#4e4032" : "#5b3b22", matrix(x, hoch - 0.1 + h / 2, zr, 0, 0, A && k === kurz ? 0.25 : 0)); }
    if (bis > 0) { const l = laenge * Math.min(1, bis); if (kurz >= 0 && A) { const kx = -laenge / 2 + 0.15 + kurz * laenge / 4, a = Math.atan2(0.4, kx + laenge / 2);   /* durchhängender Holm */
        t.add(new THREE.BoxGeometry(Math.hypot(kx + laenge / 2, 0.4), 0.12, 0.12), "#5b4a38", matrix((-laenge / 2 + kx) / 2, hoch + 0.55, zr, 0, 0, -a)); }
      else t.box(l, 0.12, 0.12, -laenge / 2 + l / 2, hoch + 0.75, zr, A ? "#5b4a38" : "#5b3b22"); } }
  const g = t.geometrie(); if (laengs) { g.rotateY(Math.PI / 2); g.translate(0, 0, -laenge / 2); } return g; }
function wehr() { const t = new Teile("stein");
  t.box(7.6, 1.7, 1.5, 0, -0.8, -0.85, STEIN, 0, { muster: "stein", schwanken: 0.05 });
  for (let i = 0; i < 17; i++) t.box(0.42, 0.1, 1.4, -3.4 + i * 0.425, 0.9, -0.85, i % 2 ? BRETT : BRETT_HELL, 0, { muster: "holz" });
  for (const x of [-2.2, 0, 2.2]) { t.box(0.9, 0.5, 0.25, x, 0.1, -0.05, "#cfe4ec", 0, { muster: "glatt" }); t.box(1.1, 0.25, 0.9, x, -0.15, 0.45, "#e8f3f6", 0, { muster: "glatt" }); }
  for (const x of [-3.6, 3.6]) t.box(0.5, 1.3, 1.7, x, -0.4, -0.85, "#77726a", 0, { muster: "stein" });
  return t.geometrie(); }
function faehre() { const t = new Teile("holz");
  for (let i = 0; i < 12; i++) t.box(0.44, 0.16, 3.2, -2.6 + i * 0.47, 0.05, -1.4, i % 3 ? BRETT : BRETT_HELL, 0, { muster: "holz", schwanken: 0.06 });
  for (const z of [-0.1, -2.7]) t.box(5.7, 0.18, 0.2, 0, 0.22, z, "#5b3b22");
  for (const x of [-2.6, 2.6]) for (const z of [-0.1, -2.7]) t.box(0.18, 0.8, 0.18, x, 0.2, z, "#4a3020");
  for (let i = 0; i < 6; i++) t.add(new THREE.TorusGeometry(0.12, 0.04, 5, 8), EISEN, matrix(-2.4 + i * 0.22, 0.32, -0.1 + (i % 2) * 0.05, Math.PI / 2 * (i % 2), 0, 0), { muster: "metall" });
  const g = t.geometrie(); g.rotateZ(0.08); g.rotateX(-0.05); g.translate(0, 0.72, 0); return g; }   /* schwimmt auf dem Wasser (der Grund liegt tiefer) */
function kahn() { const t = new Teile("holz");
  t.box(3.2, 0.36, 1.1, 0, 0, -0.5, "#5e4029", 0, { muster: "holz" }); t.box(3.0, 0.08, 0.9, 0, 0.2, -0.5, "#3b2a1c");
  for (const s of [-1, 1]) t.add(new THREE.ConeGeometry(0.55, 0.9, 4), "#5e4029", matrix(s * 2.0, 0.18, -0.5, 0, Math.PI / 4, s * Math.PI / 2, 1, 1, 0.7), { muster: "holz" });
  t.box(0.08, 0.06, 2.4, 0.3, 0.42, -0.5, BRETT, 0.5);
  const g = t.geometrie(); g.translate(0, 0.6, 0); return g; }
function menhir(schief: number) { const t = new Teile("stein");
  t.add(bausch(1, 0.08, 3 + schief), "#7d7a72", matrix(0, 1.1, -0.2, 0, 0.3, schief, 0.42, 1.25, 0.3), { muster: "stein", verlauf: [0.75, 1.1] });
  for (let i = 0; i < 6; i++) t.add(new THREE.TorusGeometry(0.16 + i * 0.03, 0.025, 4, 10, Math.PI * 1.4), "#5d8f8a", matrix(0, 1.25 + i * 0.02, 0.1, 0, 0, i * 1.1), { muster: "glatt" });
  return t.geometrie(); }
function schrein() { const t = new Teile("stein");
  t.box(2.0, 0.4, 0.9, 0, -0.15, -0.45, "#6f6b62"); for (const x of [-0.75, 0.75]) t.box(0.25, 1.1, 0.25, x, 0.25, -0.45, "#7d7a72");
  t.box(2.1, 0.22, 1.0, 0, 1.35, -0.45, "#6a665d"); t.box(0.5, 0.6, 0.35, 0, 0.25, -0.45, "#8d887d"); t.add(bausch(1, 0.1, 9), "#3f5a30", matrix(-0.6, 1.6, -0.3, 0, 0, 0, 0.5, 0.18, 0.4), { muster: "laub" });
  const g = t.geometrie(); g.rotateZ(-0.12); return g; }
function steinring() { const t = new Teile("stein");
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, s = 0.32 + zufall(i, 4) * 0.12; t.add(bausch(1, 0.12, i), i % 3 ? "#8a857a" : "#77726a", matrix(Math.cos(a) * 2.0, s * 0.5, -1.2 + Math.sin(a) * 1.0, 0, a, 0, s * 1.2, s * 0.8, s), { muster: "stein", verlauf: [0.8, 1.1] }); }
  t.box(3.6, 0.06, 1.6, 0, 0, -1.2, "#4a3a28", 0, { muster: "glatt" }); return t.geometrie(); }
function flamme(t: Teile, x: number, y: number, z: number, s: number) {
  t.add(new THREE.ConeGeometry(0.3 * s, 0.9 * s, 7), FLAMME, matrix(x, y + 0.45 * s, z), { muster: "glatt" });
  t.add(new THREE.ConeGeometry(0.16 * s, 0.55 * s, 6), FLAMME_KERN, matrix(x + 0.04, y + 0.3 * s, z + 0.04), { muster: "glatt" }); }
function feuerkorb() { const t = new Teile("metall"); t.box(0.08, 1.35, 0.08, 0, 0, 0, EISEN, 0, { muster: "metall" });
  t.add(new THREE.CylinderGeometry(0.3, 0.18, 0.35, 8, 1, true), EISEN, matrix(0, 1.5, 0), { muster: "metall" }); t.add(new THREE.CylinderGeometry(0.24, 0.24, 0.12, 8), "#c2552a", matrix(0, 1.55, 0)); flamme(t, 0, 1.6, 0, 0.8); return t.geometrie(); }
function festfeuer() { const t = new Teile("holz");
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; t.add(bausch(1, 0.1, i), "#77726a", matrix(Math.cos(a) * 1.2, 0.12, -0.7 + Math.sin(a) * 0.9, 0, 0, 0, 0.26, 0.2, 0.26), { muster: "stein" }); }
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; t.add(new THREE.CylinderGeometry(0.08, 0.1, 1.5, 6), "#5d4129", matrix(Math.cos(a) * 0.32, 0.6, -0.7 + Math.sin(a) * 0.32, Math.sin(a) * 0.45, 0, -Math.cos(a) * 0.45), { muster: "rinde" }); }
  flamme(t, 0, 0.15, -0.7, 1.7); return t.geometrie(); }
function moorlicht() { const t = new Teile("glatt");
  t.add(new THREE.CylinderGeometry(0.025, 0.05, 1.6, 4), "#4a4a32", matrix(0, 0.8, 0, 0.1, 0, 0.08), { muster: "rinde" });
  t.add(new THREE.IcosahedronGeometry(0.2, 1), "#c8ffd8", matrix(0.08, 1.75, 0)); t.add(new THREE.IcosahedronGeometry(0.11, 1), "#a8f0c0", matrix(-0.25, 1.3, 0.1)); return t.geometrie(); }
function strohlager() { const t = new Teile("stroh"); t.box(1.1, 0.28, 2.0, 0, 0, -0.5, "#c8a55a", 0, { muster: "stroh" }); t.box(0.9, 0.06, 1.1, 0, 0.28, -0.25, "#6a4a3a", 0.1, { muster: "putz" }); t.box(0.5, 0.14, 0.32, 0, 0.28, -1.25, "#d8cdb0", 0, { muster: "putz" }); return t.geometrie(); }
function truhe() { const t = new Teile("holz"); t.box(1.2, 0.55, 0.7, 0, 0, -0.35, "#6a4527", 0, { muster: "holz" });
  t.add(new THREE.CylinderGeometry(0.35, 0.35, 1.2, 10, 1, false, 0, Math.PI), "#7a5232", matrix(0, 0.55, -0.35, 0, 0, Math.PI / 2), { muster: "holz" });
  for (const x of [-0.45, 0.45]) t.box(0.08, 0.95, 0.74, x, 0, -0.35, "#b08a3a", 0, { muster: "metall" }); t.box(0.16, 0.2, 0.06, 0, 0.35, 0.02, "#d8b04a", 0, { muster: "metall" }); return t.geometrie(); }
function hoehlentisch() { const t = new Teile("holz"); t.box(2.0, 0.1, 0.95, 0, 0.75, -0.5, "#7a5232", 0, { muster: "holz" });
  for (const [x, z] of [[-0.85, -0.12], [0.85, -0.12], [-0.85, -0.88], [0.85, -0.88]]) t.box(0.12, 0.75, 0.12, x, 0, z, "#5b3b22");
  t.add(new THREE.CylinderGeometry(0.05, 0.05, 0.28, 6), "#efe6cf", matrix(0.5, 0.99, -0.5)); flamme(t, 0.5, 1.13, -0.5, 0.18);
  t.box(0.7, 0.02, 0.5, -0.3, 0.85, -0.5, "#d8c8a0", 0.2, { muster: "glatt" }); return t.geometrie(); }
function thron() { const t = new Teile("holz"); t.box(1.2, 0.5, 1.0, 0, 0, -0.5, "#5b3b22", 0, { muster: "holz" }); t.box(1.2, 1.9, 0.18, 0, 0.5, -0.92, "#5b3b22", 0, { muster: "holz" });
  t.box(1.0, 0.12, 0.85, 0, 0.5, -0.45, "#9b2f2a", 0, { muster: "putz" }); t.box(0.9, 1.0, 0.06, 0, 0.9, -0.82, "#9b2f2a", 0, { muster: "putz" });
  for (const x of [-0.6, 0.6]) { t.box(0.14, 0.3, 0.9, x, 0.5, -0.5, "#4a3020"); t.add(new THREE.SphereGeometry(0.12, 8, 6), "#b08a3a", matrix(x, 2.5, -0.92), { muster: "metall" }); } return t.geometrie(); }
function leiter() { const t = new Teile("holz"); for (const x of [-0.32, 0.32]) t.box(0.09, 4.4, 0.09, x, 0, 0, "#7a5634", 0, { muster: "holz" });
  for (let i = 0; i < 11; i++) t.box(0.64, 0.06, 0.07, 0, 0.3 + i * 0.38, 0, "#8f6a42");
  const g = t.geometrie(); g.rotateX(-0.22); return g; }
function stammQuer() { const t = new Teile("rinde"); t.add(new THREE.CylinderGeometry(0.45, 0.6, 9.6, 9), "#5d4129", matrix(0, 0.5, -0.45, 0, 0, Math.PI / 2), { muster: "rinde" });
  t.add(new THREE.CylinderGeometry(0.62, 0.62, 0.06, 9), "#b08a5a", matrix(-4.82, 0.5, -0.45, 0, 0, Math.PI / 2)); for (const x of [-2, 1.5, 3.2]) t.add(new THREE.CylinderGeometry(0.04, 0.12, 1.2, 4), "#5d4129", matrix(x, 1.0, -0.45, 0.5, 0, 0.4)); return t.geometrie(); }
function schilf(breit: number) { const t = new Teile("glatt");
  for (let i = 0; i < 16; i++) { const a = zufall(i, 7) * Math.PI * 2, r = zufall(i, 3) * breit, h = 0.9 + zufall(i, 5) * 0.9, x = Math.cos(a) * r, z = Math.sin(a) * r * 0.6 - 0.3;
    t.add(new THREE.ConeGeometry(0.05, h, 3), i % 3 ? "#6f8a3c" : "#8a9a48", matrix(x, h / 2, z, (zufall(i, 1) - 0.5) * 0.4, 0, (zufall(i, 2) - 0.5) * 0.4), { muster: "glatt", verlauf: [0.6, 1.15] });
    if (i % 4 === 0) t.add(new THREE.CylinderGeometry(0.06, 0.06, 0.26, 5), "#6a4228", matrix(x, h * 0.85, z)); }
  return t.geometrie(); }
/** Begehbare Flächen (Brücken, Wehr) relativ zum Fuß: x0, z0, x1, z1 (z nach Süden) und die Höhe der Lauffläche über dem Fuß */
export const STEGE: Record<string, [number, number, number, number, number]> = {
  dorf_bruecke_01: [-3.2, -2.7, 3.2, 0.1, 0.85], moor_bruecke_alt_01: [-3.2, -2.7, 3.2, 0.1, 0.85], moor_bruecke_alt_02: [-3.2, -2.7, 3.2, 0.1, 0.85], moor_bruecke_alt_03: [-3.2, -2.7, 3.2, 0.1, 0.85], dorf_bruecke_02: [-1.4, -5.2, 1.4, 0.1, 0.85], dorf_wehr_01: [-3.5, -1.6, 3.5, -0.1, 1.0] };

const SPEICHER = new Map<string, THREE.BufferGeometry | null>();
/** Geometrie für eine Objektart (Maßstab 1, Fuß im Ursprung) oder null = als Bild zeigen */
export function modell(t: Typ): THREE.BufferGeometry | null {
  if (SPEICHER.has(t.id)) return SPEICHER.get(t.id)!;
  const H = (t.groesse[1] / 48) * t.massstab * 0.85, Bt = (t.groesse[0] / 48) * t.massstab * 0.68, id = t.id; let g: THREE.BufferGeometry | null = null;
  if (KENNEY[id]) g = kenney(KENNEY[id]);
  else if (/eiche_01/.test(id)) g = laubbaum(H, Bt, ["#4a6e2a", "#557a30", "#41622a"], 1);
  else if (/eiche_02/.test(id)) g = laubbaum(H, Bt, ["#527a30", "#46692c", "#5e8538"], 2, STAMM, 0.9, 4);
  else if (/linde/.test(id)) g = laubbaum(H, Bt * 0.9, ["#5a8034", "#4e702f", "#668c3c"], 3, STAMM, 1.25, 5);
  else if (/herbst/.test(id)) g = laubbaum(H, Bt, ["#c9772e", "#b85e28", "#d8963a"], 4);
  else if (/apfel/.test(id)) g = laubbaum(H, Bt, ["#6b9b43", "#5d8c3b", "#b8433a"], 5, STAMM, 0.85, 6);
  else if (/birke/.test(id)) g = laubbaum(H, Bt * 0.7, ["#8aa84a", "#7c9a42"], 6, "#d9d4c8", 1.3, 4);
  else if (/tanne/.test(id)) g = tanne(H, Bt * 0.95, ["#2f5a34", "#386640", "#2a5030"]);
  else if (/erle_tot/.test(id)) g = toterBaum(H * 0.85);
  else if (/palisade/.test(id)) g = palisade();
  else if (/zaun/.test(id)) g = zaun();
  else if (/fass/.test(id)) g = fass();
  else if (/kiste/.test(id)) g = kiste();
  else if (/laterne/.test(id)) g = laterne();
  else if (/heuballen/.test(id)) g = heu();
  else if (/holzstapel/.test(id)) g = holzstapel();
  else if (/dorf_bank/.test(id)) g = bank();
  else if (/marktstand_01/.test(id)) g = marktstand("#b8433a");
  else if (/marktstand_02/.test(id)) g = marktstand("#3f6aa0");
  else if (/marktstand_03/.test(id)) g = marktstand("#5f8a3a");
  else if (/kuerbisse/.test(id)) g = kuerbisse();
  else if (/brunnen/.test(id)) g = brunnen();
  else if (id === "dorf_tor_01") g = tor();
  else if (/meiler/.test(id)) g = meiler();
  else if (/baumstamm_02/.test(id)) g = stamm();
  else if (id === "dorf_bruecke_01") g = bruecke(6.4, 2.7, false);
  else if (ALTE_BRUECKE[id]) g = bruecke(6.4, 2.7, false, id);
  else if (id === "dorf_bruecke_02") g = bruecke(5.3, 2.7, true);
  else if (id === "dorf_wehr_01") g = wehr();
  else if (/faehre/.test(id)) g = faehre();
  else if (/kahn/.test(id)) g = kahn();
  else if (id === "moor_menhir_01") g = menhir(0);
  else if (id === "moor_menhir_02") g = menhir(0.28);
  else if (/schrein/.test(id)) g = schrein();
  else if (/steinring/.test(id)) g = steinring();
  else if (/festfeuer/.test(id)) g = festfeuer();
  else if (/feuerkorb/.test(id)) g = feuerkorb();
  else if (/moorlicht/.test(id)) g = moorlicht();
  else if (/hoehle_lager/.test(id)) g = strohlager();
  else if (/hoehle_truhe/.test(id)) g = truhe();
  else if (/hoehle_tisch/.test(id)) g = hoehlentisch();
  else if (/hoehle_thron/.test(id)) g = thron();
  else if (/hoehle_leiter/.test(id)) g = leiter();
  else if (/baumstamm_01/.test(id)) g = stammQuer();
  else if (id === "stil_schilf_01") g = schilf(0.45);
  else if (id === "stil_schilf_02") g = schilf(0.7);
  if (g) g.userData.geteilt = true;   /* von allen Chunks benutzt: beim Freigeben nicht wegwerfen */
  SPEICHER.set(t.id, g); return g;
}
/** Bäume drehen sich zufällig, Bauteile (Palisaden, Zäune) richten sich nach ihren Nachbarn */
export const istBaum = (t: Typ) => t.kategorie === "bewuchs" && !/baumstamm|^k_/.test(t.id);
export const istReihe = (t: Typ) => /^dorf_(palisade|zaun)/.test(t.id);
