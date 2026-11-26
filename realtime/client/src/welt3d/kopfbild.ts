/*
 * Mythara – Kopfbilder („Chatheads“) der 3D-Figuren für das Gesprächsfenster: das Modell der Figuren-Fabrik wird einmal von vorn
 * auf Kopfhöhe in ein kleines Bild gerendert (eigener kleiner Zeichner, durchsichtiger Hintergrund) und je Modell gemerkt.
 */
import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { vorlage } from "./held3d";

const GROESSE = 160, bilder = new Map<string, Promise<string>>();
let zeichner: THREE.WebGLRenderer | null = null;
/** Kopfbild eines Modells (img/figuren-echt3d/<modell>.glb) als Daten-URL; "" wenn es nicht geht */
export function kopfbild(modell: string): Promise<string> {
  let p = bilder.get(modell); if (p) return p;
  p = vorlage(modell).then((v) => {
    if (!zeichner) { zeichner = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true }); zeichner.setSize(GROESSE, GROESSE, false); zeichner.setClearColor(0x000000, 0); zeichner.outputColorSpace = THREE.SRGBColorSpace; }
    const szene = new THREE.Scene(), fig = SkeletonUtils.clone(v.szene); szene.add(fig);
    const ruhe = v.clips.get("ruhe"); if (ruhe) { const m = new THREE.AnimationMixer(fig); m.clipAction(ruhe).play(); m.update(0.01); }
    fig.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(fig), h = box.max.y - box.min.y, kopf = box.max.y - h * 0.11, mitte = (box.min.x + box.max.x) / 2;
    szene.add(new THREE.HemisphereLight(0xfff1dc, 0x3a2e22, 1.7)); const sonne = new THREE.DirectionalLight(0xffe2b8, 2.0); sonne.position.set(-1.5, 3, 4); szene.add(sonne);
    const kamera = new THREE.PerspectiveCamera(22, 1, 0.05, 50); kamera.position.set(mitte + h * 0.05, kopf + h * 0.02, box.max.z + h * 0.72); kamera.lookAt(mitte, kopf - h * 0.01, (box.min.z + box.max.z) / 2);
    zeichner.render(szene, kamera); const url = zeichner.domElement.toDataURL("image/png");
    return url; }).catch(() => "");
  bilder.set(modell, p); return p; }
