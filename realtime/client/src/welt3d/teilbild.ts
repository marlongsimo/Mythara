/*
 * Mythara – Bilder für Rüstungen und Helme im Ausrüstungsfenster: das ausgelagerte 3D-Teil der Figuren-Fabrik (img/figuren-echt3d/<figur>.teile/<id>.glb)
 * wird allein, von vorn und leicht von der Seite, in ein kleines Bild gerendert (eigener kleiner Zeichner, durchsichtiger Hintergrund) und je Teil gemerkt.
 * Für diese Teile gibt es keine 2D-Ebenen mehr – ohne das stand dort nur das Grundhemd.
 */
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const GROESSE = 240, bilder = new Map<string, Promise<string>>();
export const TEIL_3D = /^(ruestung|kopf\.helm|waffe|schild)\./;
let zeichner: THREE.WebGLRenderer | null = null;
/** Bild eines Teils als Daten-URL; "" wenn es nicht geht */
export function teilBildUrl(g: string, id: string): Promise<string> {
  const k = g + "/" + id; let p = bilder.get(k); if (p) return p;
  p = new GLTFLoader().loadAsync(`../img/figuren-echt3d/base${g}3d.teile/${id}.glb`).then((gl) => {
    if (!zeichner) { zeichner = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true }); zeichner.setSize(GROESSE, GROESSE, false); zeichner.setClearColor(0x000000, 0); zeichner.outputColorSpace = THREE.SRGBColorSpace; }
    const szene = new THREE.Scene(), teil = gl.scene; szene.add(teil); teil.traverse((o) => { o.frustumCulled = false; }); teil.updateMatrixWorld(true);
    const huelle = () => { szene.updateMatrixWorld(true); const b = new THREE.Box3(); teil.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.geometry.computeBoundingBox(); b.union(m.geometry.boundingBox!.clone().applyMatrix4(m.matrixWorld)); } }); return b; };
    let box = huelle();
    if (/^(waffe|schild)\./.test(id)) { /* Waffen und Schilde: längste Achse schräg ins Bild (von vorn zeigte die Klinge auf die Kamera), Schilde von vorn */
      const g0 = box.getSize(new THREE.Vector3()), dreh = new THREE.Group(); szene.remove(teil); dreh.add(teil); szene.add(dreh);
      if (g0.z >= g0.x && g0.z >= g0.y) dreh.rotation.x = -Math.PI / 2; else if (g0.x > g0.y) dreh.rotation.z = Math.PI / 2;
      dreh.updateMatrixWorld(true); const g1 = huelle().getSize(new THREE.Vector3()); if (g1.y > 2.2 * g1.x) { const h = new THREE.Group(); szene.remove(dreh); h.add(dreh); h.rotation.z = -Math.PI / 4; szene.add(h); }
      teil.traverse((o) => { o.frustumCulled = false; }); box = huelle(); }
    const mitte = box.getCenter(new THREE.Vector3()), gr = box.getSize(new THREE.Vector3()), r = Math.max(gr.x, gr.y) * 0.58 || 0.5;
    szene.add(new THREE.HemisphereLight(0xfff1dc, 0x3a2e22, 1.8)); const sonne = new THREE.DirectionalLight(0xffe2b8, 2.2); sonne.position.set(-1.5, 3, 4); szene.add(sonne);
    const kamera = new THREE.OrthographicCamera(-r, r, r, -r, 0.01, 50); const waffe = /^(waffe|schild)\./.test(id); kamera.position.set(mitte.x + (waffe ? 0 : r * 0.6), mitte.y + r * 0.15, mitte.z + 4); kamera.lookAt(mitte);
    zeichner.render(szene, kamera); return zeichner.domElement.toDataURL("image/png"); }).catch((e) => { console.warn("Teilbild:", id, e); return ""; });
  bilder.set(k, p); return p; }
/** In eine Leinwand zeichnen (eingepasst, mittig) */
export async function teilBild(ziel: HTMLCanvasElement, g: string, id: string): Promise<boolean> {
  const url = await teilBildUrl(g, id); if (!url) return false; const img = new Image(); img.src = url; await img.decode().catch(() => {});
  const x = ziel.getContext("2d"); if (!x) return false; x.clearRect(0, 0, ziel.width, ziel.height); x.drawImage(img, 0, 0, ziel.width, ziel.height); return true; }
