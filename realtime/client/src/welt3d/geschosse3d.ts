/*
 * Mythara – Geschosse in der 3D-Welt: Pfeil, Armbrustbolzen, Zauber- und Feuerkugel als kleine Modelle (wie echt3d/darsteller.ts → GeschossBild
 * aus der Figuren-Fabrik, hier direkt in der Szene). Der Server rechnet die Geschosse (Zustand g: [id, x, y, art]); hier wird nur gezeichnet:
 * jedes Geschoss gleitet weich zur Stelle des Servers, zeigt in Flugrichtung, Pfeile und Bolzen drehen sich um die eigene Achse, Kugeln pulsieren.
 * Verschwindet ein Geschoss beim Server (Treffer), fliegt es noch kurz bis zur letzten Stelle und verlischt dann.
 */
import * as THREE from "three";

export type GeschossArt = "pfeil" | "bolzen" | "zauber" | "feuer";
/** Größe in der Welt: die Modelle sind in Metern gebaut; etwas größer als echt, damit man sie in der Draufsicht sieht */
const MASS = 1.7, HOEHE = 1.05;
let glut: THREE.Texture | null = null;
function weichesLicht(): THREE.Texture { if (glut) return glut; const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d")!, g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.25, "rgba(255,255,255,0.75)"); g.addColorStop(0.6, "rgba(255,255,255,0.18)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  glut = new THREE.CanvasTexture(c); glut.colorSpace = THREE.SRGBColorSpace; return glut; }

/** Ein Geschoss-Modell (entlang +x gebaut); kugeln: kreisende Funken der Zauber */
function modell(art: GeschossArt): { gruppe: THREE.Group; dreh: THREE.Group; kugeln: THREE.Object3D[] } {
  const gruppe = new THREE.Group(), dreh = new THREE.Group(), kugeln: THREE.Object3D[] = []; gruppe.add(dreh);
  const std = (farbe: number, metall = 0, rau = 0.7) => new THREE.MeshStandardMaterial({ color: farbe, metalness: metall, roughness: rau });
  const stab = (r: number, l: number, m: THREE.Material, x: number) => { const g = new THREE.CylinderGeometry(r, r, l, 8); g.rotateZ(-Math.PI / 2); const o = new THREE.Mesh(g, m); o.position.x = x; return o; };
  const spitze = (r: number, l: number, m: THREE.Material, x: number) => { const g = new THREE.ConeGeometry(r, l, 10); g.rotateZ(-Math.PI / 2); const o = new THREE.Mesh(g, m); o.position.x = x; return o; };
  const feder = (l: number, h: number, m: THREE.Material, x: number, w: number) => { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(new Float32Array([-l / 2, 0, 0, l / 2, 0, 0, -l / 2, h, 0]), 3)); g.computeVertexNormals();
    const o = new THREE.Mesh(g, m); o.position.x = x; o.rotation.x = w; return o; };
  if (art === "pfeil") { const rot = new THREE.MeshStandardMaterial({ color: 0xb8372b, roughness: 0.8, side: THREE.DoubleSide }), weiss = new THREE.MeshStandardMaterial({ color: 0xeee6d2, roughness: 0.8, side: THREE.DoubleSide });
    dreh.add(stab(0.009, 0.62, std(0x8a5a2b), -0.02), spitze(0.024, 0.09, std(0xd4dbe3, 0.85, 0.3), 0.33), stab(0.012, 0.03, std(0x3a2a1a), -0.34));
    for (let i = 0; i < 3; i++) dreh.add(feder(0.13, 0.04, i ? weiss : rot, -0.25, (i * 2 * Math.PI) / 3)); }
  else if (art === "bolzen") { const eisen = std(0x9aa3ad, 0.9, 0.35), leder = new THREE.MeshStandardMaterial({ color: 0x2a2420, roughness: 0.9, side: THREE.DoubleSide });
    dreh.add(stab(0.014, 0.3, std(0x4a3322), -0.02), spitze(0.032, 0.08, eisen, 0.17), stab(0.02, 0.02, eisen, 0.12));
    for (let i = 0; i < 2; i++) dreh.add(feder(0.08, 0.035, leder, -0.13, i * Math.PI)); }
  else { const [a, b] = art === "feuer" ? [0xff6a1a, 0xffd27a] : [0x6aa8ff, 0xcfe6ff], add = (f: number, o: number) => new THREE.MeshBasicMaterial({ color: f, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false });
    dreh.add(new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff })), new THREE.Mesh(new THREE.IcosahedronGeometry(0.075, 1), add(b, 0.55)));
    const hof = new THREE.Sprite(new THREE.SpriteMaterial({ map: weichesLicht(), color: a, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })); hof.scale.setScalar(0.42); gruppe.add(hof);
    for (let i = 0; i < 3; i++) { const k = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), add(b, 1)); kugeln.push(k); gruppe.add(k); }
    if (art === "feuer") dreh.scale.setScalar(1.25); }
  gruppe.scale.setScalar(MASS); gruppe.traverse((o) => { o.castShadow = false; }); return { gruppe, dreh, kugeln };
}

interface Flug { von: number; art: GeschossArt; gruppe: THREE.Group; dreh: THREE.Group; kugeln: THREE.Object3D[]; x: number; z: number; zx: number; zz: number; t: number; weg: boolean; rest: number }
/** Alle Geschosse einer Kampfzone */
export class Geschosse3D {
  private fluege = new Map<number, Flug>();
  constructor(private szene: THREE.Scene, private hoehe: (x: number, z: number) => number) {}
  /** Stand des Servers: liste = [id, x, y, art] in Weltfeldern; start(id, x, y) liefert für ein neues Geschoss Art und Startpunkt (Schütze) */
  abgleich(liste: [number, number, number, string][], start: (x: number, y: number, art: string) => { art: GeschossArt; x: number; y: number; von: number },
    /** Ziel beim Einschlag: die Figur, die dort getroffen wurde (nicht der Schütze) */ einschlag: (x: number, y: number, von: number) => { x: number; y: number } | null): void {
    const da = new Set<number>();
    for (const [id, x, y, a] of liste) { da.add(id); let f = this.fluege.get(id);
      if (!f) { const s = start(x, y, a), m = modell(s.art); f = { von: s.von, art: s.art, ...m, x: s.x, z: s.y, zx: x, zz: y, t: 0, weg: false, rest: 0 }; this.fluege.set(id, f); this.szene.add(m.gruppe); }
      f.zx = x; f.zz = y; }
    /* beim Server verschwunden = Treffer: noch bis zur getroffenen Figur fliegen, dann verlöschen */
    for (const [id, f] of this.fluege) if (!da.has(id) && !f.weg) { f.weg = true; const z = einschlag(f.zx, f.zz, f.von); if (z) { f.zx = z.x; f.zz = z.y; } f.rest = 0.22; } }
  schritt(dt: number): void {
    for (const [id, f] of this.fluege) { f.t += dt; const k = Math.min(1, dt * (f.weg ? 14 : 18)), vx = f.zx - f.x, vz = f.zz - f.z; f.x += vx * k; f.z += vz * k;
      const y = this.hoehe(f.x, f.z) + HOEHE; f.gruppe.position.set(f.x, y, f.z);
      if (!f.kugeln.length) { if (Math.hypot(vx, vz) > 1e-3) f.gruppe.rotation.set(0, Math.atan2(-vz, vx), 0); f.dreh.rotation.x = f.t * 14; }
      else { f.dreh.rotation.set(f.t * 3.1, f.t * 4.3, 0); f.dreh.scale.setScalar((f.art === "feuer" ? 1.25 : 1) * (1 + 0.12 * Math.sin(f.t * 30)));
        f.kugeln.forEach((o, i) => { const w = f.t * 9 + (i * 2 * Math.PI) / 3; o.position.set(Math.cos(w) * 0.12, Math.sin(w * 1.4) * 0.05, Math.sin(w) * 0.12); }); }
      if (f.weg) { f.rest -= dt; if (f.rest <= 0) this.entfernen(id, f); } } }
  private entfernen(id: number, f: Flug): void { this.fluege.delete(id); this.szene.remove(f.gruppe);
    f.gruppe.traverse((o) => { const m = o as THREE.Mesh; if (m.geometry) m.geometry.dispose(); const mt = m.material as THREE.Material | undefined; if (mt) mt.dispose(); }); }
  alleWeg(): void { for (const [id, f] of [...this.fluege]) this.entfernen(id, f); }
  /** nur für Tests */
  get anzahl(): number { return this.fluege.size; }
}
