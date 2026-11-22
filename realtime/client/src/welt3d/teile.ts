/*
 * 3D-Prototyp – Bausteine: Teile sammeln (jedes mit eigener Farbe) und zu einem einzigen Netz verschmelzen.
 * Alle Modelle der Welt sind schlichte Low-Poly-Körper mit Eckpunktfarben – ein Material, wenige Zeichenaufrufe.
 */
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export const MATERIAL = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide });

/** Fester Zufall aus zwei Zahlen (0 … 1) */
export const zufall = (x: number, y: number) => { let h = Math.imul(Math.floor(x * 7919), 374761393) + Math.imul(Math.floor(y * 6037), 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), S = new THREE.Vector3(), P = new THREE.Vector3();
export const matrix = (x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => M.clone().compose(P.set(x, y, z), Q.setFromEuler(E.set(rx, ry, rz)), S.set(sx, sy, sz));

export class Teile {
  private liste: THREE.BufferGeometry[] = [];
  get leer() { return this.liste.length === 0; }
  /** Ein Körper mit einer Farbe; schwanken = leichte Farbstreuung je Fläche */
  add(geo: THREE.BufferGeometry, farbe: THREE.ColorRepresentation, m?: THREE.Matrix4, schwanken = 0) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone(); if (m) g.applyMatrix4(m);
    for (const k of Object.keys(g.attributes)) if (k !== "position" && k !== "normal") g.deleteAttribute(k);
    if (!g.attributes.normal) g.computeVertexNormals();
    const n = g.attributes.position.count, c = new THREE.Color(farbe), a = new Float32Array(n * 3);
    for (let i = 0; i < n; i += 3) { const f = schwanken ? 1 + (zufall(i + n, n * 0.37 + i * 0.11) - 0.5) * 2 * schwanken : 1;
      for (let j = 0; j < 3 && i + j < n; j++) { a[(i + j) * 3] = c.r * f; a[(i + j) * 3 + 1] = c.g * f; a[(i + j) * 3 + 2] = c.b * f; } }
    g.setAttribute("color", new THREE.BufferAttribute(a, 3)); this.liste.push(g); geo.dispose?.(); return this;
  }
  box(b: number, h: number, t: number, x: number, y: number, z: number, farbe: THREE.ColorRepresentation, ry = 0, schwanken = 0) {
    return this.add(new THREE.BoxGeometry(b, h, t), farbe, matrix(x, y + h / 2, z, 0, ry), schwanken); }
  /** Freie Flächen aus Dreiecken (Punkte als [x,y,z]) */
  flaechen(dreiecke: number[][][], farbe: THREE.ColorRepresentation, schwanken = 0) {
    const p = new Float32Array(dreiecke.length * 9); dreiecke.forEach((d, i) => d.forEach((q, j) => p.set(q, i * 9 + j * 3)));
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3)); g.computeVertexNormals(); return this.add(g, farbe, undefined, schwanken); }
  viereck(a: number[], b: number[], c: number[], d: number[], farbe: THREE.ColorRepresentation, schwanken = 0) { return this.flaechen([[a, b, c], [a, c, d]], farbe, schwanken); }
  geometrie(): THREE.BufferGeometry { const g = mergeGeometries(this.liste, false) as THREE.BufferGeometry; for (const x of this.liste) x.dispose(); this.liste = []; g.computeBoundingSphere(); return g; }
  netz(material: THREE.Material = MATERIAL, schatten = true) { const m = new THREE.Mesh(this.geometrie(), material); m.castShadow = schatten; m.receiveShadow = true; return m; }
}
