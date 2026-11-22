/*
 * 3D-Prototyp – Bausteine: Teile sammeln (jedes mit Farbe und Oberflächenmuster) und zu einer Geometrie verschmelzen.
 * Stil wie die Heldenfiguren: weich schattiert, warme Farben, handgemalt wirkende Oberflächen (Holzbretter, Bruchstein, Dachziegel,
 * Schindeln, Stroh, Putz, Laub, Rinde). Die Muster sind grau und werden mit der Teilfarbe multipliziert – so reicht ein Material je Muster.
 * Texturkoordinaten werden je Fläche aus ihrer Lage berechnet (Bretter liegen waagerecht, Ziegelreihen laufen quer zum Gefälle).
 */
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export const MUSTER = ["glatt", "holz", "stein", "ziegel", "schindel", "stroh", "putz", "laub", "rinde", "metall"] as const;
export type Muster = (typeof MUSTER)[number];

/** Fester Zufall aus zwei Zahlen (0 … 1) */
export const zufall = (x: number, y: number) => { let h = Math.imul(Math.floor(x * 7919), 374761393) + Math.imul(Math.floor(y * 6037), 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

/* ───────── gemalte Muster (Leinwand, 256 × 256, kachelbar) ───────── */
function leinwand(malen: (g: CanvasRenderingContext2D, r: () => number, n: number) => void, saat: number) {
  const n = 256, c = document.createElement("canvas"); c.width = c.height = n; const g = c.getContext("2d")!; let s = saat; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  g.fillStyle = "rgb(225,225,225)"; g.fillRect(0, 0, n, n); malen(g, r, n);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
const grau = (v: number, a = 1) => `rgba(${v | 0},${v | 0},${v | 0},${a})`;
/** an allen Rändern wiederholt zeichnen, damit die Kachel nahtlos ist */
const rundum = (n: number, f: (dx: number, dy: number) => void) => { for (const dx of [-n, 0, n]) for (const dy of [-n, 0, n]) f(dx, dy); };
const TEXTUR: Record<Muster, () => THREE.Texture | null> = {
  glatt: () => null, metall: () => null,
  holz: () => leinwand((g, r, n) => { const reihen = 6, h = n / reihen;   /* waagerechte Bretter mit Fugen, Maserung und Nagelköpfen */
    for (let i = 0; i < reihen; i++) { const y = i * h, v = 200 + r() * 45; g.fillStyle = grau(v); g.fillRect(0, y, n, h);
      for (let k = 0; k < 14; k++) { g.strokeStyle = grau(v - 30 - r() * 30, 0.5); g.lineWidth = 1 + r() * 1.5; g.beginPath(); const yy = y + 4 + r() * (h - 8); g.moveTo(0, yy); g.bezierCurveTo(n * 0.3, yy + (r() - 0.5) * 6, n * 0.6, yy + (r() - 0.5) * 6, n, yy); g.stroke(); }
      g.fillStyle = grau(255, 0.35); g.fillRect(0, y + 2, n, 3); g.fillStyle = grau(70); g.fillRect(0, y + h - 3, n, 3);
      const stoss = r() * n; g.fillStyle = grau(80); g.fillRect(stoss, y, 3, h); g.fillStyle = grau(110); for (const yy of [y + 9, y + h - 12]) { g.beginPath(); g.arc(stoss + 9, yy, 2.4, 0, 7); g.arc(stoss - 6, yy, 2.4, 0, 7); g.fill(); } } }, 11),
  stein: () => leinwand((g, r, n) => { g.fillStyle = grau(95); g.fillRect(0, 0, n, n);   /* Bruchstein: gerundete Steine, Licht oben links */
    let y = 0; while (y < n) { const h = 26 + r() * 18; let x = -r() * 40; while (x < n) { const b = 34 + r() * 36, v = 175 + r() * 60;
        rundum(n, (dx, dy) => { g.fillStyle = grau(v); g.beginPath(); g.roundRect(x + dx + 2, y + dy + 2, b - 4, h - 4, 9); g.fill(); g.fillStyle = grau(255, 0.28); g.beginPath(); g.roundRect(x + dx + 5, y + dy + 4, b - 12, 5, 3); g.fill(); g.fillStyle = grau(0, 0.18); g.beginPath(); g.roundRect(x + dx + 4, y + dy + h - 10, b - 8, 5, 3); g.fill(); });
        x += b; } y += h; } }, 23),
  ziegel: () => leinwand((g, r, n) => { const rh = 32, sb = 32; g.fillStyle = grau(90); g.fillRect(0, 0, n, n);   /* Mönch-und-Nonne: gerundete Ziegel in versetzten Reihen */
    for (let i = 0; i < n / rh + 1; i++) for (let k = -1; k < n / sb + 1; k++) { const x = k * sb + (i % 2) * sb / 2, y = i * rh, v = 185 + r() * 55;
      rundum(n, (dx, dy) => { const gr = g.createLinearGradient(x + dx, 0, x + dx + sb, 0); gr.addColorStop(0, grau(v - 50)); gr.addColorStop(0.45, grau(v + 15)); gr.addColorStop(1, grau(v - 60)); g.fillStyle = gr;
        g.beginPath(); g.moveTo(x + dx + 1, y + dy); g.lineTo(x + dx + sb - 1, y + dy); g.lineTo(x + dx + sb - 1, y + dy + rh - 8); g.quadraticCurveTo(x + dx + sb / 2, y + dy + rh + 6, x + dx + 1, y + dy + rh - 8); g.closePath(); g.fill(); }); } }, 37),
  schindel: () => leinwand((g, r, n) => { const rh = 26; g.fillStyle = grau(80); g.fillRect(0, 0, n, n);   /* Holzschindeln: Rechtecke, versetzt, untere Kante dunkel */
    for (let i = 0; i < n / rh; i++) { let x = -r() * 30; while (x < n) { const b = 20 + r() * 22, v = 170 + r() * 70, y = i * rh;
        rundum(n, (dx, dy) => { g.fillStyle = grau(v); g.fillRect(x + dx + 1, y + dy, b - 2, rh - 2); g.fillStyle = grau(0, 0.25); g.fillRect(x + dx + 1, y + dy + rh - 7, b - 2, 5); g.strokeStyle = grau(v - 40, 0.6); g.lineWidth = 1; g.beginPath(); g.moveTo(x + dx + b * 0.4, y + dy + 2); g.lineTo(x + dx + b * 0.45, y + dy + rh - 6); g.stroke(); });
        x += b; } } }, 41),
  stroh: () => leinwand((g, r, n) => { for (let i = 0; i < 1500; i++) { const x = r() * n, y = r() * n, l = 14 + r() * 26, v = 150 + r() * 105;   /* Stroh: dichte, fast senkrechte Halme */
      rundum(n, (dx, dy) => { g.strokeStyle = grau(v, 0.8); g.lineWidth = 1.2 + r() * 1.6; g.beginPath(); g.moveTo(x + dx, y + dy); g.lineTo(x + dx + (r() - 0.5) * 5, y + dy + l); g.stroke(); }); }
    for (let i = 0; i < 6; i++) { g.fillStyle = grau(60, 0.45); g.fillRect(0, i * (n / 6) + n / 6 - 6, n, 5); } }, 53),
  putz: () => leinwand((g, r, n) => { for (let i = 0; i < 260; i++) { const x = r() * n, y = r() * n, s = 8 + r() * 26, v = 200 + r() * 55;   /* Putz: weiche Flecken, ein paar Risse */
      rundum(n, (dx, dy) => { g.fillStyle = grau(v, 0.35); g.beginPath(); g.ellipse(x + dx, y + dy, s, s * 0.7, r() * 3, 0, 7); g.fill(); }); }
    for (let i = 0; i < 5; i++) { let x = r() * n, y = r() * n; g.strokeStyle = grau(120, 0.6); g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 18; y += r() * 12; g.lineTo(x, y); } g.stroke(); } }, 67),
  laub: () => leinwand((g, r, n) => { for (let i = 0; i < 1100; i++) { const x = r() * n, y = r() * n, s = 4 + r() * 9, v = 150 + r() * 105;   /* Blattwerk: Tupfer, oben hell */
      rundum(n, (dx, dy) => { g.fillStyle = grau(v, 0.7); g.beginPath(); g.ellipse(x + dx, y + dy, s, s * 0.6, r() * 3, 0, 7); g.fill(); }); } }, 71),
  rinde: () => leinwand((g, r, n) => { for (let i = 0; i < 220; i++) { const x = r() * n, v = 110 + r() * 120;   /* Rinde: senkrechte Furchen */
      rundum(n, (dx, dy) => { g.strokeStyle = grau(v, 0.7); g.lineWidth = 2 + r() * 4; g.beginPath(); g.moveTo(x + dx, dy); g.bezierCurveTo(x + dx + 6, dy + n * 0.3, x + dx - 6, dy + n * 0.7, x + dx, dy + n); g.stroke(); }); } }, 83),
};
/** Ein Material je Muster (Index wie MUSTER); weich schattiert, Eckpunktfarben × Muster */
export const MATERIALIEN: THREE.Material[] = MUSTER.map((m) => { const map = TEXTUR[m](); return new THREE.MeshLambertMaterial({ vertexColors: true, map, color: map ? new THREE.Color(1.18, 1.18, 1.18) : 0xffffff, side: THREE.DoubleSide }); });
/** Wie groß ein Muster in Feldern ist (eine Kachel) */
const KACHEL: Record<Muster, number> = { glatt: 1, metall: 1, holz: 1.6, stein: 2.0, ziegel: 1.7, schindel: 1.5, stroh: 2.2, putz: 3, laub: 2.6, rinde: 1.2 };

const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), S = new THREE.Vector3(), P = new THREE.Vector3();
export const matrix = (x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => M.clone().compose(P.set(x, y, z), Q.setFromEuler(E.set(rx, ry, rz)), S.set(sx, sy, sz));

export type Zusatz = { schwanken?: number; muster?: Muster; verlauf?: [number, number] };
const OBEN = new THREE.Vector3(0, 1, 0), A = new THREE.Vector3(), B = new THREE.Vector3(), Cc = new THREE.Vector3(), N = new THREE.Vector3(), T = new THREE.Vector3(), Bt = new THREE.Vector3();

export class Teile {
  private liste: { g: THREE.BufferGeometry; m: Muster }[] = [];
  /** standard: Muster für Teile ohne eigene Angabe */
  constructor(private standard: Muster = "glatt") {}
  get leer() { return this.liste.length === 0; }
  /** Ein Körper mit einer Farbe. schwanken: Farbstreuung je Fläche; verlauf: [unten, oben] Helligkeit nach der Höhe im Teil (Kronen, Steine) */
  add(geo: THREE.BufferGeometry, farbe: THREE.ColorRepresentation, m?: THREE.Matrix4, z: Zusatz | number = {}) {
    const o: Zusatz = typeof z === "number" ? { schwanken: z } : z, muster = o.muster || this.standard;
    const g = geo.index ? geo.toNonIndexed() : geo.clone(); geo.dispose(); if (m) g.applyMatrix4(m);
    for (const k of Object.keys(g.attributes)) if (k !== "position" && k !== "normal") g.deleteAttribute(k);
    if (!g.attributes.normal) g.computeVertexNormals();
    const pos = g.attributes.position, n = pos.count, c = new THREE.Color(farbe), farben = new Float32Array(n * 3), uv = new Float32Array(n * 2);
    let y0 = Infinity, y1 = -Infinity; if (o.verlauf) for (let i = 0; i < n; i++) { const y = pos.getY(i); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const k = KACHEL[muster], sw = o.schwanken || 0;
    for (let i = 0; i < n; i += 3) {
      const f = sw ? 1 + (zufall(i + n, n * 0.37 + i * 0.11) - 0.5) * 2 * sw : 1;
      /* Fläche: Normale → Richtung der Musterzeilen (waagerecht entlang der Fläche) */
      A.fromBufferAttribute(pos, i); B.fromBufferAttribute(pos, i + 1); Cc.fromBufferAttribute(pos, i + 2); N.subVectors(B, A).cross(Cc.clone().sub(A)).normalize();
      T.crossVectors(OBEN, N); if (T.lengthSq() < 0.01) T.set(1, 0, 0); else T.normalize(); Bt.crossVectors(N, T).normalize(); if (Bt.y < 0 || (Math.abs(Bt.y) < 0.01 && Bt.z < 0)) Bt.negate();
      for (let j = 0; j < 3; j++) { const q = i + j, x = pos.getX(q), y = pos.getY(q), zz = pos.getZ(q); const v = o.verlauf ? o.verlauf[0] + (o.verlauf[1] - o.verlauf[0]) * ((y - y0) / Math.max(1e-6, y1 - y0)) : 1;
        farben[q * 3] = c.r * f * v; farben[q * 3 + 1] = c.g * f * v; farben[q * 3 + 2] = c.b * f * v;
        uv[q * 2] = (x * T.x + y * T.y + zz * T.z) / k; uv[q * 2 + 1] = (x * Bt.x + y * Bt.y + zz * Bt.z) / k; } }
    g.setAttribute("color", new THREE.BufferAttribute(farben, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); this.liste.push({ g, m: muster }); return this;
  }
  box(b: number, h: number, t: number, x: number, y: number, z: number, farbe: THREE.ColorRepresentation, ry = 0, zusatz: Zusatz | number = {}) {
    return this.add(new THREE.BoxGeometry(b, h, t), farbe, matrix(x, y + h / 2, z, 0, ry), zusatz); }
  /** Freie Flächen aus Dreiecken (Punkte als [x,y,z]) */
  flaechen(dreiecke: number[][][], farbe: THREE.ColorRepresentation, zusatz: Zusatz | number = {}) {
    const p = new Float32Array(dreiecke.length * 9); dreiecke.forEach((d, i) => d.forEach((q, j) => p.set(q, i * 9 + j * 3)));
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3)); g.computeVertexNormals(); return this.add(g, farbe, undefined, zusatz); }
  viereck(a: number[], b: number[], c: number[], d: number[], farbe: THREE.ColorRepresentation, zusatz: Zusatz | number = {}) { return this.flaechen([[a, b, c], [a, c, d]], farbe, zusatz); }
  /** Eine Geometrie mit einer Gruppe je Muster (materialIndex = Stelle in MUSTER) */
  geometrie(): THREE.BufferGeometry {
    const teile: THREE.BufferGeometry[] = [], idx: number[] = [];
    MUSTER.forEach((m, i) => { const l = this.liste.filter((q) => q.m === m).map((q) => q.g); if (l.length) { teile.push(mergeGeometries(l, false) as THREE.BufferGeometry); idx.push(i); } });
    const g = mergeGeometries(teile, true) as THREE.BufferGeometry; g.groups.forEach((gr, i) => (gr.materialIndex = idx[i]));
    for (const q of this.liste) q.g.dispose(); for (const t of teile) t.dispose(); this.liste = []; g.computeBoundingSphere(); return g; }
  netz(schatten = true) { const m = new THREE.Mesh(this.geometrie(), MATERIALIEN); m.castShadow = schatten; m.receiveShadow = true; return m; }
}

/** Bauschige Kugel (für Kronen, Büsche): leicht verbeult, weich schattiert */
export function bausch(detail = 2, beule = 0.12, saat = 1) {
  const g = new THREE.IcosahedronGeometry(1, detail), p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = v.clone().normalize(), d = 1 + beule * (Math.sin(n.x * 5.1 + saat) * Math.sin(n.y * 4.3 + saat * 2) + 0.6 * Math.sin(n.z * 6.7 - saat));
    p.setXYZ(i, n.x * d, n.y * d, n.z * d); }
  g.computeVertexNormals(); /* nicht indiziert: Normale je Fläche – darum die glatten Kugelnormalen zurücksetzen */
  const nn = g.attributes.normal; for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).normalize(); nn.setXYZ(i, v.x, v.y, v.z); }
  return g; }
