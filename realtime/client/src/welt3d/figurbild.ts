/*
 * 3D-Prototyp – gemalte Figuren in der 3D-Welt (Mischform). Das Bild zeigt immer zur Kamera (wie ein Sprite), für die Verdeckung
 * zählt es aber wie eine aufrecht stehende Figur am Fußpunkt: Bildschirmlage vom kamerazugewandten Bild, Tiefe von der senkrechten
 * Fläche. So kippt die Figur bei steiler Kamera nicht nach hinten in Boden und Wände (sonst verschwindet die untere Hälfte im Fußboden).
 * Steht die Figur hinter einer Wand, scheint eine dunkle Silhouette durch – wie in der 2D-Welt.
 */
import * as THREE from "three";

const ECKEN = `
  uniform vec2 groesse; uniform vec2 mitte; uniform vec2 rep; uniform vec2 off; varying vec2 vUv;
  void main() {
    vUv = uv * rep + off;
    vec3 fuss = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    vec3 rechts = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]), oben = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
    vec2 q = vec2((uv.x - mitte.x) * groesse.x, (uv.y - mitte.y) * groesse.y);
    vec3 r0 = normalize(vec3(rechts.x, 0.0, rechts.z) + vec3(1e-5, 0.0, 0.0));
    vec4 a = projectionMatrix * viewMatrix * vec4(fuss + rechts * q.x + oben * q.y, 1.0);      /* so sieht man sie */
    vec4 b = projectionMatrix * viewMatrix * vec4(fuss + r0 * q.x + vec3(0.0, q.y, 0.0), 1.0); /* so tief steht sie (aufrecht) */
    gl_Position = vec4(a.xy, clamp(b.z / b.w, -1.0, 1.0) * a.w, a.w);
  }`;
const FLAECHE = `
  uniform sampler2D map; uniform float deck; uniform float durch; varying vec2 vUv;
  void main() {
    vec4 c = texture2D(map, vUv); if (c.a < 0.35) discard;
    gl_FragColor = durch > 0.5 ? vec4(mix(c.rgb, vec3(0.08, 0.1, 0.16), 0.75), 0.5) : vec4(c.rgb, deck);
    #include <colorspace_fragment>
  }`;

export class Figurbild {
  gruppe = new THREE.Group(); private haupt: THREE.ShaderMaterial; private durch: THREE.ShaderMaterial;
  constructor(map: THREE.Texture) {
    const u = () => ({ map: { value: map }, groesse: { value: new THREE.Vector2(1, 2) }, mitte: { value: new THREE.Vector2(0.5, 0.05) }, rep: { value: new THREE.Vector2(1, 1) }, off: { value: new THREE.Vector2(0, 0) }, deck: { value: 1 }, durch: { value: 0 } });
    this.haupt = new THREE.ShaderMaterial({ uniforms: u(), vertexShader: ECKEN, fragmentShader: FLAECHE, transparent: true });
    this.durch = new THREE.ShaderMaterial({ uniforms: u(), vertexShader: ECKEN, fragmentShader: FLAECHE, transparent: true, depthTest: false, depthWrite: false });
    this.durch.uniforms.durch.value = 1;
    const geo = new THREE.PlaneGeometry(1, 1); geo.translate(0.5, 0.5, 0);   /* uv = Lage im Bild */
    const a = new THREE.Mesh(geo, this.durch), b = new THREE.Mesh(geo, this.haupt);
    a.renderOrder = 10; b.renderOrder = 11; a.frustumCulled = b.frustumCulled = false; this.gruppe.add(a, b);
  }
  /** Bild, Ausschnitt (rep/off wie Texture.repeat/offset), Größe in Feldern und Fußpunkt im Bild (0…1, von unten) */
  setze(map: THREE.Texture, rep: [number, number], off: [number, number], groesse: [number, number], mitte: [number, number]) {
    for (const m of [this.haupt, this.durch]) { const U = m.uniforms; U.map.value = map; U.rep.value.set(rep[0], rep[1]); U.off.value.set(off[0], off[1]); U.groesse.value.set(groesse[0], groesse[1]); U.mitte.value.set(mitte[0], mitte[1]); } }
  /** Einzelbild i von n eines Bildstreifens zeigen (gespiegelt: Blick nach links) */
  bild(i: number, n: number, gespiegelt = false) { for (const m of [this.haupt, this.durch]) { const U = m.uniforms; U.rep.value.x = (gespiegelt ? -1 : 1) / n; U.off.value.x = (i + (gespiegelt ? 1 : 0)) / n; } }
  /** Silhouette hinter Wänden an/aus (nur für den Helden) */
  silhouette(an: boolean) { this.gruppe.children[0].visible = an; }
}
