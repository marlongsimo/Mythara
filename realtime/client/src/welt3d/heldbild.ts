/*
 * Mythara – Bild der eigenen Figur für die Werte-Übersicht der Ausrüstung („i“): das 3D-Modell des Helden in der Welt
 * (mit allem, was er gerade trägt) wird von vorn, leicht gedreht, ganz in ein Bild gerendert (eigener kleiner Zeichner, durchsichtiger Hintergrund).
 */
import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";

const B = 300, H = 420;
let zeichner: THREE.WebGLRenderer | null = null;
/** Die eigene Figur als Daten-URL; "" ohne 3D-Welt oder solange das Modell noch lädt */
export function heldGanzbild(): string {
  const fig = ((window as unknown as { EZW?: { welt3d?: { figur?: { modell?: THREE.Object3D | null } } } }).EZW || {}).welt3d?.figur, w = fig && fig.modell; if (!w) return "";
  try {
    if (!zeichner) { zeichner = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true }); zeichner.setSize(B, H, false); zeichner.setClearColor(0x000000, 0); zeichner.outputColorSpace = THREE.SRGBColorSpace; }
    const szene = new THREE.Scene(), k = SkeletonUtils.clone(w); k.position.set(0, 0, 0); k.rotation.set(0, -0.35, 0); k.scale.setScalar(1); szene.add(k);
    k.traverse((o) => { o.frustumCulled = false; }); k.updateMatrixWorld(true);
    const sichtbar = (o: THREE.Object3D | null): boolean => { for (; o && o !== k; o = o.parent) if (!o.visible) return false; return true; };
    const box = new THREE.Box3(); k.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh && sichtbar(m)) box.expandByObject(m); });
    if (box.isEmpty()) return ""; const mitte = box.getCenter(new THREE.Vector3()), gr = box.getSize(new THREE.Vector3());
    szene.add(new THREE.HemisphereLight(0xfff1dc, 0x3a2e22, 1.7)); const sonne = new THREE.DirectionalLight(0xffe2b8, 2.0); sonne.position.set(-1.5, 3, 4); szene.add(sonne);
    const h = Math.max(gr.y, gr.x * H / B) * 0.56, kamera = new THREE.OrthographicCamera(-h * B / H, h * B / H, h, -h, 0.01, 50);
    kamera.position.set(mitte.x, mitte.y + gr.y * 0.05, mitte.z + 6); kamera.lookAt(mitte.x, mitte.y, mitte.z);
    zeichner.render(szene, kamera); return zeichner.domElement.toDataURL("image/png");
  } catch (e) { console.warn("Heldbild:", e); return ""; }
}
