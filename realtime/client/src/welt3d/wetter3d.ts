/*
 * Riftmere – Wetter (#186): der Schneesturm vor der Frostkrone (shared/sperren.ts). Solange frostkrone_frei für den Spieler aus ist, treibt nahe der Sturmlinie
 * dichter Schnee: Flocken um die Kamera, die mit dem Wind quer zur Linie ziehen, und ein weißer, naher Nebel – je näher an der Linie, desto dichter.
 * Rein im Browser; die Sperre selbst sind die Sturmstücke der Welt (Stadtstufe frostkrone_frei).
 */
import * as THREE from "three";
import { WELT_SPERREN, sturmStaerke } from "../../../shared/sperren";

const HANDY = matchMedia("(pointer: coarse)").matches, N = HANDY ? 600 : 1600, BOX = { x: 40, y: 16, z: 40 }, WEISS = new THREE.Color(0xeef3f8);
/** Weißstufe des Nebels mitten im Sturm (Befund Oberfläche: 0,85 war zu weiß) und Ebene der Flocken (nur die Hauptkamera, nicht die Minikarte) */
const WEISS_STUFE = 0.6, EBENE = 1;
/** runde, weiche Flocke (Kreisverlauf) statt eckiger Punkte */
function flocke(): THREE.Texture { const n = 32, c = document.createElement("canvas"); c.width = c.height = n; const g = c.getContext("2d")!, v = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
  v.addColorStop(0, "rgba(255,255,255,1)"); v.addColorStop(0.45, "rgba(255,255,255,0.75)"); v.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = v; g.fillRect(0, 0, n, n); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
interface Kamera { szene: THREE.Scene; kamera: THREE.Camera; abstand: number }
const STURM = WELT_SPERREN.find((s) => s.id === "frostkrone")!;

export class Schneesturm {
  private punkte: THREE.Points; private pos: Float32Array; private mat: THREE.PointsMaterial; private grund = new THREE.Color(); private war = 0;
  /** Windrichtung: quer zur Sturmlinie (von der Frostkrone her) */ private wind = (() => { const [a, b] = [STURM.punkte[0], STURM.punkte[STURM.punkte.length - 1]], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return { x: -dy / l, z: dx / l }; })();
  constructor(private m: Kamera) { const szene = m.szene; m.kamera.layers.enable(EBENE);
    this.pos = new Float32Array(N * 3); for (let i = 0; i < N; i++) { this.pos[i * 3] = (Math.random() - 0.5) * BOX.x; this.pos[i * 3 + 1] = Math.random() * BOX.y; this.pos[i * 3 + 2] = (Math.random() - 0.5) * BOX.z; }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
    this.mat = new THREE.PointsMaterial({ color: 0xffffff, map: flocke(), size: HANDY ? 0.18 : 0.14, transparent: true, alphaTest: 0.02, opacity: 0, depthWrite: false, fog: false });
    this.punkte = new THREE.Points(g, this.mat); this.punkte.frustumCulled = false; this.punkte.visible = false; this.punkte.layers.set(EBENE); szene.add(this.punkte); }
  /** Je Bild nach dem Nebel des Motors: x, z = Held (Weltfelder), boden = Geländehöhe dort, frei = Sturm aufgehoben (Schalter frostkrone_frei) */
  schritt(dt: number, x: number, z: number, boden: number, frei: boolean, fog: THREE.Fog | null): void {
    const s = frei ? 0 : sturmStaerke(STURM, x, z);
    if (fog) { if (s <= 0) { if (this.war > 0) fog.color.copy(this.grund); this.grund.copy(fog.color); } else { if (this.war <= 0) this.grund.copy(fog.color);
      /* der Held bleibt sichtbar: der Nebel beginnt kurz vor ihm (Kameraabstand) und ist 10 Felder dahinter dicht */
      const a = this.m.abstand; fog.color.copy(this.grund).lerp(WEISS, WEISS_STUFE * s); fog.far = THREE.MathUtils.lerp(fog.far, a + 10, s); fog.near = THREE.MathUtils.lerp(fog.near, a * 0.85, s); } }
    this.war = s; this.punkte.visible = s > 0; if (s <= 0) return;
    this.mat.opacity = 0.3 + 0.55 * s; this.punkte.position.set(x, boden - 2, z);
    const P = this.pos, v = (6 + 10 * s) * dt, fall = (2.5 + 2 * s) * dt;
    for (let i = 0; i < N; i++) { let px = P[i * 3] + this.wind.x * v, py = P[i * 3 + 1] - fall, pz = P[i * 3 + 2] + this.wind.z * v;
      if (py < 0) py += BOX.y; if (px > BOX.x / 2) px -= BOX.x; else if (px < -BOX.x / 2) px += BOX.x; if (pz > BOX.z / 2) pz -= BOX.z; else if (pz < -BOX.z / 2) pz += BOX.z;
      P[i * 3] = px; P[i * 3 + 1] = py; P[i * 3 + 2] = pz; }
    (this.punkte.geometry.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true; }
}
