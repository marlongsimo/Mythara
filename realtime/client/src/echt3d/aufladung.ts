/*
 * Splitterbinden – eine aufgeladene Waffe sichtbar machen (Nahkampf, zuerst das Schwert).
 *
 *   const a = new Aufladung(waffe, wurzel); … jedes Bild a.weiter(dt); … a.entfernen();
 *
 * waffe: das Teil der Figur (Gruppe am Handknochen), wurzel: die Figur (dort hängt die Leuchtspur, damit sie mitgezeichnet wird).
 * 1. Leuchten: Kanten der Klinge glühen im Splitter-Violett (Randlicht im Shader, langsam pulsierend) – die Stufe der Waffe bleibt darunter sichtbar.
 * 2. Splitter: drei kleine Kristalle kreisen um die Klinge, mit weichem Lichthof.
 * 3. Spur: schwingt die Klinge schnell (Hieb), zieht ihre Spitze einen violetten Leuchtbogen nach, der rasch verblasst.
 * Aufladen (die ersten 1,2 s): acht Splitter strömen spiralförmig von außen zur Klinge, das Leuchten wächst an, zum Schluss ein heller Blitz;
 *   danach bleiben drei Splitter, die kreisen. Dazu spielt die Figur (falls vorhanden) „block“ – die Waffe vor dem Körper erhoben.
 * Ablaufen: rest (0…1) – unter 0,2 flackert alles und die Splitter werden kleiner.
 *
 * Geladene Waffe „(s)“ (Phase 5b, dauerhaft, solange Ladungen da sind): new Aufladung(waffe, wurzel, SPLITTER_VIOLETT, { zart: true })
 *   – schwaches Randleuchten (40 %), nur zwei kleine Splitter, keine Einleitung und kein Blitz; die Spur beim Hieb bleibt (schwächer).
 *   Für alle Waffenklassen geeignet (die Klinge wird vermessen: längste Achse vom Griff aus).
 */
import * as THREE from "three";

export const SPLITTER_VIOLETT = 0x9b5cff;
let lichtBild: THREE.Texture | null = null;
function weichesLicht(): THREE.Texture {
  if (lichtBild) return lichtBild; const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d")!, g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.3, "rgba(255,255,255,0.6)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  lichtBild = new THREE.CanvasTexture(c); lichtBild.colorSpace = THREE.SRGBColorSpace; return lichtBild;
}

export class Aufladung {
  /** wie viel noch übrig ist (1 = frisch, 0 = abgelaufen) – setzt das Spiel */
  rest = 1;
  private t = 0; private uniform = { uLicht: { value: 0 }, uFarbe: { value: new THREE.Color(SPLITTER_VIOLETT) } };
  private alt: { mesh: THREE.Mesh; mat: THREE.Material | THREE.Material[] }[] = [];
  private splitter: THREE.Object3D[] = []; private kreis = new THREE.Group();
  private basis = new THREE.Vector3(); private spitze = new THREE.Vector3(); private laenge = 1;
  private spur: { a: THREE.Vector3; b: THREE.Vector3; t: number }[] = []; private spurMesh: THREE.Mesh; private letzteSpitze: THREE.Vector3 | null = null;
  static readonly EINLEITUNG = 1.2; private zustrom: THREE.Object3D[] = []; private blitz: THREE.Sprite;

  private staerke = 1; private zart = false;
  constructor(private waffe: THREE.Object3D, private wurzel: THREE.Object3D, farbe = SPLITTER_VIOLETT, opt: { zart?: boolean } = {}) {
    this.uniform.uFarbe.value.set(farbe);
    if (opt.zart) { this.zart = true; this.staerke = 0.4; this.t = Aufladung.EINLEITUNG + 1; }   // gleich im Dauerzustand, ohne Zustrom und Blitz
    /* Klinge vermessen (im Raum der Waffe): längste Achse; die Spitze ist das Ende weiter weg vom Griff (Ursprung = Griff) */
    const box = new THREE.Box3(); waffe.updateWorldMatrix(true, true); const inv = waffe.matrixWorld.clone().invert(); const p = new THREE.Vector3();
    let fern = 0; const pts: THREE.Vector3[] = [];
    waffe.traverse((o) => { const m = o as THREE.Mesh; if (!m.isMesh) return; const pos = m.geometry.getAttribute("position");
      for (let i = 0; i < pos.count; i += 3) { p.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld).applyMatrix4(inv); box.expandByPoint(p); pts.push(p.clone()); } });
    for (const q of pts) if (q.length() > fern) { fern = q.length(); this.spitze.copy(q); }
    this.basis.copy(this.spitze).multiplyScalar(0.25); this.laenge = this.spitze.distanceTo(this.basis);
    /* 1. Randleuchten: Materialien dieser einen Figur kopieren und um ein Fresnel-Glühen ergänzen */
    const U = this.uniform;
    waffe.traverse((o) => { const m = o as THREE.Mesh; if (!m.isMesh) return; this.alt.push({ mesh: m, mat: m.material });
      const neu = (Array.isArray(m.material) ? m.material : [m.material]).map((mt) => { const k = (mt as THREE.MeshStandardMaterial).clone();
        k.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, U); sh.fragmentShader = "uniform float uLicht; uniform vec3 uFarbe;\n" + sh.fragmentShader.replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
          { float rand = pow(1.0 - clamp(abs(dot(normalize(vNormal), normalize(vViewPosition))), 0.0, 1.0), 2.2);
            totalEmissiveRadiance += uFarbe * uLicht * (0.25 + 2.2 * rand); }`); };
        k.customProgramCacheKey = () => "aufladung"; return k; });
      m.material = Array.isArray(m.material) ? neu : neu[0]; });
    /* 2. kreisende Splitter (Kristalle mit Lichthof) */
    const kristall = new THREE.MeshBasicMaterial({ color: 0xd9c2ff, transparent: true, opacity: 0.95 }), hof = new THREE.SpriteMaterial({ map: weichesLicht(), color: farbe, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    for (let i = 0; i < 3; i++) {
      const g = new THREE.Group(), k = new THREE.Mesh(new THREE.OctahedronGeometry(0.035), kristall); k.scale.set(0.7, 1.6, 0.7); g.add(k);
      const s = new THREE.Sprite(hof); s.scale.setScalar(0.16); g.add(s); this.splitter.push(g); this.kreis.add(g);
    }
    for (let i = 0; i < 8; i++) { const g = new THREE.Group(), k = new THREE.Mesh(new THREE.OctahedronGeometry(0.03), kristall); k.scale.set(0.7, 1.6, 0.7); g.add(k);   // Zustrom beim Aufladen
      const s = new THREE.Sprite(hof); s.scale.setScalar(0.14); g.add(s); this.zustrom.push(g); this.kreis.add(g); }
    this.blitz = new THREE.Sprite(new THREE.SpriteMaterial({ map: weichesLicht(), color: 0xe6d6ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    this.blitz.position.copy(this.basis).lerp(this.spitze, 0.55); this.kreis.add(this.blitz);
    waffe.add(this.kreis);
    /* 3. Leuchtspur (Band zwischen Klingenmitte und Spitze, in Figurenkoordinaten) */
    const N = 16, geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 2 * 3), 3)); geo.setAttribute("alpha", new THREE.BufferAttribute(new Float32Array(N * 2), 1));
    const idx: number[] = []; for (let i = 0; i < N - 1; i++) idx.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2); geo.setIndex(idx);
    const sm = new THREE.ShaderMaterial({ uniforms: { uFarbe: U.uFarbe }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      vertexShader: "attribute float alpha; varying float vA; void main(){ vA = alpha; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: "uniform vec3 uFarbe; varying float vA; void main(){ gl_FragColor = vec4(mix(uFarbe, vec3(1.0), vA * 0.5) * vA, vA); }" });
    this.spurMesh = new THREE.Mesh(geo, sm); this.spurMesh.frustumCulled = false; wurzel.add(this.spurMesh);
  }

  weiter(dt: number): void {
    this.t += dt; const t = this.t, ende = this.rest < 0.2, flacker = ende ? 0.55 + 0.45 * Math.sin(t * 38) * Math.sin(t * 11) : 1;
    const E = Aufladung.EINLEITUNG, auf = Math.min(1, t / E);                                    // Aufladen: 0 → 1
    this.uniform.uLicht.value = this.staerke * ((0.75 + 0.25 * Math.sin(t * 2.6)) * flacker * (t < E ? auf * auf : 1) + (t < E ? 0 : Math.max(0, 1.6 * (1 - (t - E) / 0.35))));
    const blitzT = (t - E * 0.85) / 0.45; (this.blitz.material as THREE.SpriteMaterial).opacity = blitzT > 0 && blitzT < 1 ? Math.sin(Math.PI * blitzT) : 0;
    this.blitz.scale.setScalar(0.25 + 0.9 * Math.max(0, Math.min(1, blitzT)));
    /* Splitter kreisen um die Klinge (um ihre Achse, gegeneinander versetzt, leicht auf und ab) */
    const achse = this.spitze.clone().sub(this.basis).normalize(), q = new THREE.Vector3(1, 0, 0); if (Math.abs(achse.x) > 0.9) q.set(0, 1, 0);
    const u = q.clone().cross(achse).normalize(), v = achse.clone().cross(u), gr = ende ? 0.6 : 1;
    this.splitter.forEach((g, i) => { const w = t * 1.6 + (i * 2 * Math.PI) / 3, h = 0.35 + 0.5 * ((i / 3 + t * 0.12) % 1), r = 0.09 + 0.02 * Math.sin(t * 3 + i);
      g.position.copy(this.basis).addScaledVector(achse, h * this.laenge).addScaledVector(u, Math.cos(w) * r).addScaledVector(v, Math.sin(w) * r);
      g.rotation.set(t * 2 + i, t * 3, 0); g.scale.setScalar(gr * (0.9 + 0.2 * Math.sin(t * 5 + i))); g.visible = !ende || Math.sin(t * 20 + i * 2) > -0.3; });
    this.zustrom.forEach((g, i) => { const f = Math.min(1, t / (E * (0.75 + 0.03 * i)));          // spiralförmig von außen (0,7 m) zur Klinge
      g.visible = f < 1; if (!g.visible) return; const w = i * 0.785 + f * 5.5, r = 0.7 * (1 - f) ** 1.4 + 0.02, h = 0.2 + 0.6 * ((i * 0.37) % 1);
      g.position.copy(this.basis).addScaledVector(achse, h * this.laenge).addScaledVector(u, Math.cos(w) * r).addScaledVector(v, Math.sin(w) * r).addScaledVector(achse, -0.3 * (1 - f));
      g.rotation.set(t * 6 + i, t * 4, 0); g.scale.setScalar(0.6 + 0.6 * f); });
    this.splitter.forEach((g, i) => { g.scale.multiplyScalar((t < E ? auf * auf : 1) * (this.zart ? 0.6 : 1)); if (this.zart && i === 2) g.visible = false; });
    /* Spur: Klingenpunkte in Figurenkoordinaten merken; schnelle Bewegung = helle Spur */
    this.waffe.updateWorldMatrix(true, false); this.wurzel.updateWorldMatrix(true, false); const zuFigur = this.wurzel.matrixWorld.clone().invert();
    const a = this.basis.clone().lerp(this.spitze, 0.35).applyMatrix4(this.waffe.matrixWorld).applyMatrix4(zuFigur), b = this.spitze.clone().applyMatrix4(this.waffe.matrixWorld).applyMatrix4(zuFigur);
    const tempo = this.letzteSpitze && dt > 0 ? b.distanceTo(this.letzteSpitze) / dt : 0; this.letzteSpitze = b.clone();
    this.spur.unshift({ a, b, t: Math.min(1, Math.max(0, (tempo - 1.2) / 2.5)) }); if (this.spur.length > 16) this.spur.pop();
    const pos = this.spurMesh.geometry.getAttribute("position") as THREE.BufferAttribute, al = this.spurMesh.geometry.getAttribute("alpha") as THREE.BufferAttribute;
    for (let i = 0; i < 16; i++) { const e = this.spur[Math.min(i, this.spur.length - 1)], f = (1 - i / 15) * e.t * flacker;
      pos.setXYZ(2 * i, e.a.x, e.a.y, e.a.z); pos.setXYZ(2 * i + 1, e.b.x, e.b.y, e.b.z); al.setX(2 * i, f * 0.35 * this.staerke); al.setX(2 * i + 1, f * this.staerke); }
    pos.needsUpdate = true; al.needsUpdate = true;
  }

  entfernen(): void {
    for (const { mesh, mat } of this.alt) mesh.material = mat;
    this.kreis.removeFromParent(); this.spurMesh.removeFromParent(); this.spurMesh.geometry.dispose();
  }
}
