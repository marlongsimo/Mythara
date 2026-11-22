/*
 * 3D-Prototyp – Bäume und Kleinteile als Low-Poly-Modelle (eine Geometrie je Art, in der Welt als Instanzen gesetzt).
 * Maße in Feldern für Maßstab 1; die Größe der Bäume richtet sich nach ihrem gemalten 2D-Bild (groesse / 48 Bildpunkte je Feld),
 * damit Wald und Lichtungen so dicht wirken wie in der 2D-Welt. Was hier kein Modell hat, zeigt die Welt als gemaltes Bild (Billboard).
 */
import * as THREE from "three";
import { Teile, matrix, zufall } from "./teile";

export type Typ = { id: string; kategorie: string; bild: string; groesse: [number, number]; anker: [number, number]; massstab: number; kollision: { art: string; r?: number; x?: number; y?: number; b?: number; h?: number } | null; plan: boolean };

const STAMM = "#5d4129";
function krone(t: Teile, hoehe: number, breite: number, farben: string[], kugeln: number, saat: number, form = 1) {
  for (let i = 0; i < kugeln; i++) { const a = (i / kugeln) * Math.PI * 2 + saat, r = i === 0 ? 0 : breite * 0.28, s = (i === 0 ? 0.62 : 0.46 + 0.1 * zufall(i, saat)) * breite;
    t.add(new THREE.IcosahedronGeometry(1, 1), farben[i % farben.length], matrix(Math.cos(a) * r, hoehe * (i === 0 ? 0.68 : 0.56 + 0.12 * zufall(saat, i)), Math.sin(a) * r, zufall(i, 3), zufall(i, 4), 0, s, s * form, s), 0.07); } }
function laubbaum(H: number, Bt: number, farben: string[], saat: number, stamm = STAMM, form = 1, kugeln = 5) {
  const t = new Teile(); t.add(new THREE.CylinderGeometry(0.16, 0.3, H * 0.55, 6), stamm, matrix(0, H * 0.275, 0), 0.05);
  t.add(new THREE.CylinderGeometry(0.05, 0.1, H * 0.3, 4), stamm, matrix(0.35, H * 0.4, 0, 0, 0, -0.7));
  krone(t, H, Bt, farben, kugeln, saat, form); return t.geometrie(); }
function tanne(H: number, Bt: number, farben: string[]) {
  const t = new Teile(); t.add(new THREE.CylinderGeometry(0.12, 0.22, H * 0.3, 6), STAMM, matrix(0, H * 0.15, 0));
  const stufen = 4; for (let i = 0; i < stufen; i++) { const u = i / stufen, r = Bt * 0.5 * (1 - u * 0.72), h = H * 0.42 * (1 - u * 0.35);
    t.add(new THREE.ConeGeometry(r, h, 7), farben[i % farben.length], matrix(0, H * 0.18 + u * H * 0.62 + h / 2, 0, 0, i * 0.4, 0), 0.06); }
  return t.geometrie(); }
function toterBaum(H: number) {
  const t = new Teile(); t.add(new THREE.CylinderGeometry(0.12, 0.28, H * 0.7, 6), "#5a5148", matrix(0, H * 0.35, 0), 0.05);
  for (let i = 0; i < 5; i++) { const a = i * 1.3, y = H * (0.35 + i * 0.08); t.add(new THREE.CylinderGeometry(0.03, 0.08, H * 0.32, 4), "#5a5148", matrix(Math.cos(a) * 0.5, y + H * 0.1, Math.sin(a) * 0.5, Math.sin(a) * 0.8, 0, -Math.cos(a) * 0.8)); }
  return t.geometrie(); }

function palisade() { const t = new Teile(); for (let i = 0; i < 5; i++) { const x = -0.8 + i * 0.4, h = 2.0 + zufall(i, 9) * 0.3;
    t.add(new THREE.CylinderGeometry(0.19, 0.2, h, 6), "#6e4c2e", matrix(x, h / 2, -0.35), 0.06); t.add(new THREE.ConeGeometry(0.19, 0.4, 6), "#6e4c2e", matrix(x, h + 0.2, -0.35)); }
  t.box(2.0, 0.14, 0.1, 0, 1.4, -0.12, "#4f3420"); return t.geometrie(); }
function zaun() { const t = new Teile(); for (const x of [-0.95, 0.95]) t.box(0.14, 1.0, 0.14, x, 0, -0.15, "#6e4c2e"); t.box(2.0, 0.1, 0.06, 0, 0.75, -0.15, "#8a6440"); t.box(2.0, 0.1, 0.06, 0, 0.4, -0.15, "#8a6440"); return t.geometrie(); }
function fass() { const t = new Teile(); t.add(new THREE.CylinderGeometry(0.3, 0.3, 0.72, 8), "#7a5232", matrix(0, 0.36, -0.1), 0.05); for (const y of [0.15, 0.57]) t.add(new THREE.CylinderGeometry(0.315, 0.315, 0.06, 8), "#3b3530", matrix(0, y, -0.1)); return t.geometrie(); }
function kiste() { const t = new Teile(); t.box(0.82, 0.6, 0.5, 0, 0, -0.27, "#8b6440", 0.2, 0.06); t.box(0.86, 0.08, 0.54, 0, 0.5, -0.27, "#5b3b22", 0.2); return t.geometrie(); }
function laterne() { const t = new Teile(); t.box(0.1, 1.9, 0.1, 0, 0, 0, "#3b3530"); t.box(0.5, 0.06, 0.06, 0.2, 1.8, 0, "#3b3530"); t.box(0.22, 0.3, 0.22, 0.4, 1.45, 0, "#f3c25a"); return t.geometrie(); }
function heu() { const t = new Teile(); t.add(new THREE.CylinderGeometry(0.48, 0.48, 0.9, 10), "#c8a55a", matrix(0, 0.48, 0, 0, 0, Math.PI / 2), 0.06); return t.geometrie(); }
function holzstapel() { const t = new Teile(); for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++) t.add(new THREE.CylinderGeometry(0.15, 0.15, 1.5, 6), r % 2 ? "#8a6440" : "#7a5634", matrix(-0.45 + i * 0.3 + r * 0.15, 0.15 + r * 0.26, -0.3, 0, 0, Math.PI / 2), 0.08); return t.geometrie(); }
function bank() { const t = new Teile(); t.box(1.4, 0.08, 0.36, 0, 0.42, -0.18, "#8a6440"); for (const x of [-0.6, 0.6]) t.box(0.08, 0.42, 0.3, x, 0, -0.18, "#5b3b22"); return t.geometrie(); }
function marktstand(tuch: string) { const t = new Teile(); for (const [x, z] of [[-1.4, -0.1], [1.4, -0.1], [-1.4, -1.0], [1.4, -1.0]]) t.box(0.1, 2.2, 0.1, x, 0, z, "#5b3b22");
  t.box(3.0, 0.9, 0.7, 0, 0, -0.35, "#8a6440", 0, 0.04); t.viereck([-1.6, 2.0, 0.2], [1.6, 2.0, 0.2], [1.6, 2.5, -1.2], [-1.6, 2.5, -1.2], tuch, 0.03);
  for (let i = 0; i < 6; i++) t.box(0.22, 0.2, 0.22, -1.1 + i * 0.44, 0.9, -0.35, ["#d2463c", "#e8c547", "#6aa04a"][i % 3]); return t.geometrie(); }
function kuerbisse() { const t = new Teile(); for (let i = 0; i < 6; i++) { const s = 0.22 + zufall(i, 2) * 0.12; t.add(new THREE.IcosahedronGeometry(1, 0), "#d9792c", matrix(-0.8 + i * 0.32, s * 0.8, -0.25 + zufall(i, 5) * 0.2 - 0.1, 0, i, 0, s, s * 0.8, s), 0.08); } return t.geometrie(); }
function brunnen() { const t = new Teile(); t.add(new THREE.CylinderGeometry(1.0, 1.05, 0.8, 10, 1, true), "#8e8a80", matrix(0, 0.4, -0.35), 0.08); t.add(new THREE.CylinderGeometry(0.9, 0.9, 0.05, 10), "#2f6f8f", matrix(0, 0.55, -0.35));
  for (const x of [-0.9, 0.9]) t.box(0.14, 2.1, 0.14, x, 0, -0.35, "#5b3b22"); t.viereck([-1.2, 2.0, 0.4], [1.2, 2.0, 0.4], [1.2, 2.6, -0.35], [-1.2, 2.6, -0.35], "#a2553a"); t.viereck([-1.2, 2.0, -1.1], [1.2, 2.0, -1.1], [1.2, 2.6, -0.35], [-1.2, 2.6, -0.35], "#a2553a"); return t.geometrie(); }
function tor() { const t = new Teile(); for (const x of [-2.1, 2.1]) { t.box(0.5, 4.0, 0.5, x, 0, -0.2, "#6e4c2e", 0, 0.05); t.add(new THREE.ConeGeometry(0.36, 0.5, 6), "#6e4c2e", matrix(x, 4.25, -0.2)); }
  t.box(4.9, 0.36, 0.4, 0, 3.3, -0.2, "#5b3b22"); t.box(1.6, 0.7, 0.08, 0, 2.55, 0.02, "#8a6440"); return t.geometrie(); }
function meiler() { const t = new Teile(); t.add(new THREE.ConeGeometry(1.1, 1.3, 9), "#3a332c", matrix(0, 0.65, 0), 0.1); return t.geometrie(); }
function stamm() { const t = new Teile(); t.add(new THREE.CylinderGeometry(0.45, 0.55, 9, 8), "#5d4129", matrix(0, 0.5, -4.5, Math.PI / 2, 0, 0), 0.05); return t.geometrie(); }

const SPEICHER = new Map<string, THREE.BufferGeometry | null>();
/** Geometrie für eine Objektart (Maßstab 1, Fuß im Ursprung) oder null = als Bild zeigen */
export function modell(t: Typ): THREE.BufferGeometry | null {
  if (SPEICHER.has(t.id)) return SPEICHER.get(t.id)!;
  const H = (t.groesse[1] / 48) * t.massstab * 0.95, Bt = (t.groesse[0] / 48) * t.massstab * 0.8, id = t.id; let g: THREE.BufferGeometry | null = null;
  if (/eiche_01/.test(id)) g = laubbaum(H, Bt, ["#4f7a2e", "#5c8a35", "#466d29"], 1);
  else if (/eiche_02/.test(id)) g = laubbaum(H, Bt, ["#5a8634", "#4c7630", "#679540"], 2, STAMM, 0.9, 4);
  else if (/linde/.test(id)) g = laubbaum(H, Bt * 0.9, ["#628f3a", "#557f33", "#6e9c44"], 3, STAMM, 1.25, 5);
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
  SPEICHER.set(t.id, g); return g;
}
/** Bäume drehen sich zufällig, Bauteile (Palisaden, Zäune) richten sich nach ihren Nachbarn */
export const istBaum = (t: Typ) => t.kategorie === "bewuchs" && !/baumstamm/.test(t.id);
export const istReihe = (t: Typ) => /palisade|zaun/.test(t.id);
