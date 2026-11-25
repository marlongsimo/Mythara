/*
 * Mythara – ein gemeinsamer Lader für alle 3D-Modelle (.glb). Die Modelle im Spiel sind mit Meshopt komprimiert
 * (werkzeug/modelle_komprimieren.mjs, etwa 55–77 % kleiner, gleiches Aussehen) – dafür braucht der Lader den Meshopt-Entpacker.
 * Jede Stelle, die ein Modell lädt, nimmt deshalb gltfLader() statt new GLTFLoader().
 */
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

let lader: GLTFLoader | null = null;
export function gltfLader(): GLTFLoader { if (!lader) { lader = new GLTFLoader(); lader.setMeshoptDecoder(MeshoptDecoder); } return lader; }
