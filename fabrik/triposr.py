"""Mythara Fabrik – Bild-zu-3D ohne Dienst: TripoSR (Stability AI und Tripo, MIT-Lizenz) auf dem Prozessor.

  python3 fabrik/triposr.py <bild.png> <ziel.glb> <ablage> [aufloesung=256]

bild      freigestelltes Bild (durchsichtiger Hintergrund), z. B. aus referenz/teile/
ablage    Ordner mit dem, was einmalig geladen wurde (liegt nicht im Repository):
            space/          Quelltext von TripoSR (Ordner tsr/, von huggingface.co/spaces/stabilityai/TripoSR)
            gewichte/       config.yaml und model.ckpt (von huggingface.co/stabilityai/TripoSR, etwa 1,6 GB)
            pakete/         Python-Pakete: torch (CPU), transformers, omegaconf, einops, trimesh, scikit-image, imageio

Zwei Pakete, die TripoSR einbindet, werden hier ersetzt:
  torchmcubes  (nur aus dem Quelltext baubar)  -> Marching Cubes aus scikit-image
  rembg        (Freistellen)                   -> nicht nötig, das Bild ist schon freigestellt

Ergebnis: ein Netz mit Punktfarben (keine Textur). Die Form stammt aus einem einzigen Bild; die Rückseite ist vom Modell erfunden.
"""
import os, sys, time, types

bild, ziel, ablage = sys.argv[1], sys.argv[2], os.path.abspath(sys.argv[3]); res = int(sys.argv[4]) if len(sys.argv) > 4 else 256
sys.path[:0] = [os.path.join(ablage, "pakete"), os.path.join(ablage, "space")]

import numpy as np, torch
from PIL import Image
from skimage import measure


def marching_cubes(vol, thresh):
    v, f, _, _ = measure.marching_cubes(vol.cpu().numpy(), float(thresh))
    return torch.from_numpy(np.ascontiguousarray(v[:, ::-1])).float(), torch.from_numpy(f.astype(np.int64))


mc = types.ModuleType("torchmcubes"); mc.marching_cubes = marching_cubes; sys.modules["torchmcubes"] = mc
sys.modules["rembg"] = types.ModuleType("rembg")
from tsr.system import TSR

t = time.time(); m = TSR.from_pretrained(os.path.join(ablage, "gewichte"), config_name="config.yaml", weight_name="model.ckpt"); m.renderer.set_chunk_size(8192); m.to("cpu")
print("Modell geladen:", round(time.time() - t), "s", flush=True)
im = Image.open(bild).convert("RGBA"); a = np.asarray(im).astype(np.float32) / 255; rgb = a[..., :3] * a[..., 3:] + 0.5 * (1 - a[..., 3:])   # auf mittelgrauem Grund, wie TripoSR es erwartet
im = Image.fromarray((rgb * 255).astype(np.uint8)).resize((512, 512), Image.LANCZOS)
t = time.time()
with torch.no_grad(): codes = m([im], device="cpu")
print("Bild verarbeitet:", round(time.time() - t), "s", flush=True); t = time.time()
netz = m.extract_mesh(codes, resolution=res)[0]
print("Netz:", round(time.time() - t), "s ·", len(netz.vertices), "Punkte,", len(netz.faces), "Flächen · Grenzen", netz.bounds.round(3).tolist(), flush=True)
os.makedirs(os.path.dirname(os.path.abspath(ziel)), exist_ok=True); netz.export(ziel); print("geschrieben:", ziel)
