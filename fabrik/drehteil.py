"""Mythara Fabrik – ein rundes Teil (Hut, Helm ohne Visier, Topf) als Drehkörper aus seiner Zeichnung bauen.

  python3 fabrik/drehteil.py <bild.png> <ziel.glb> <breite_m> [krempe=0.06]

Aus dem Umriss der Vorderansicht wird ein Profil (Halbmesser je Höhe) gewonnen und um die senkrechte Achse gedreht:
  Krone   die Zeilen oberhalb der breitesten Stelle (dort ist das Teil schmaler als 3/4 der größten Breite)
  Krempe  eine flache, leicht abfallende Scheibe in der größten Breite; krempe = ihre Höhe (Abfall nach außen) in Metern
Farbe je Höhe aus der Zeichnung (Mittelwert der Zeile, Krempe: Mittelwert des Krempenbereichs), als Punktfarbe.
Der Ursprung liegt auf der Achse in Höhe der Krempe; oben = +z, vorn = -y. Hängende Bänder und Ähnliches fallen weg.
"""
import math, os, sys
import numpy as np
from PIL import Image

bild, ziel, breite = sys.argv[1], sys.argv[2], float(sys.argv[3]); KREMPE = float(next((a.split("=")[1] for a in sys.argv[4:] if a.startswith("krempe=")), 0.06))
im = Image.open(bild).convert("RGBA"); a = np.asarray(im).astype(np.float32) / 255; m = a[..., 3] > 0.5
zeilen = np.where(m.any(1))[0]; w = np.array([m[z].sum() for z in range(m.shape[0])], np.float32)
breit_z = int(np.argmax(w)); wmax = float(w.max()); k = breite / wmax                                # Meter je Bildpunkt
oben = int(zeilen.min()); krone = [z for z in range(oben, breit_z) if 0 < w[z] < 0.75 * wmax]
if not krone: sys.exit("keine Krone gefunden")
kz0, kz1 = min(krone), max(krone); farbe = lambda zs: np.median(a[zs][..., :3][m[zs]], axis=0)
# Profil der Krone: von oben nach unten, Halbmesser aus der Zeilenbreite (geglättet)
prof = []
for z in range(kz0, kz1 + 1):
    r = 0.5 * w[z] * k; prof.append(((kz1 - z) * k + KREMPE * 0.3, r, farbe([z])))
rs = np.convolve([p[1] for p in prof], np.ones(5) / 5, mode="same"); prof = [(h, max(0.01, float(r)), c) for (h, _, c), r in zip(prof, rs)]
krempen_farbe = farbe(list(range(max(kz1 + 1, breit_z - 6), min(m.shape[0], breit_z + 10))))
N = 48; P = []; F = []; C = []
def ring(h, r, c): base = len(P); [P.append((r * math.cos(2 * math.pi * i / N), r * math.sin(2 * math.pi * i / N), h)) or C.append(c) for i in range(N)]; return base
ringe = [ring(h, r, c) for h, r, c in prof]                                                       # Krone, von oben nach unten
top = len(P); P.append((0, 0, prof[0][0] + 0.004)); C.append(prof[0][2])
for i in range(N): F.append((top, ringe[0] + (i + 1) % N, ringe[0] + i))                          # Deckel
for a_, b_ in zip(ringe, ringe[1:]):
    for i in range(N): j = (i + 1) % N; F.append((a_ + i, a_ + j, b_ + j, b_ + i))
r_innen = prof[-1][1]; r_aussen = 0.5 * wmax * k; d = 0.012
oi = ring(KREMPE * 0.3, r_innen, krempen_farbe); oa = ring(0.0, r_aussen, krempen_farbe); ua = ring(-d, r_aussen, krempen_farbe); ui = ring(KREMPE * 0.3 - d, r_innen * 0.98, krempen_farbe)
for i in range(N):
    j = (i + 1) % N
    for p_, q_ in ((oi, oa), (oa, ua), (ua, ui), (ui, oi)): F.append((p_ + i, p_ + j, q_ + j, q_ + i))   # Krempe: oben, Rand, unten, innen
F.append(tuple(ringe[-1] + i for i in range(N)))                                                  # Boden der Krone schließen (unsichtbar, hält das Netz dicht)

import bpy
bpy.ops.wm.read_factory_settings(use_empty=True); name = os.path.splitext(os.path.basename(ziel))[0]
me = bpy.data.meshes.new(name); me.from_pydata(P, [], F); me.update(); ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob)
lin = lambda c: np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
ca = me.color_attributes.new("Col", "FLOAT_COLOR", "POINT"); ca.data.foreach_set("color", np.concatenate([lin(np.array(C, np.float32)), np.ones((len(C), 1), np.float32)], 1).ravel())
bpy.context.view_layer.objects.active = ob; ob.select_set(True); bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT"); bpy.ops.mesh.normals_make_consistent(inside=False); bpy.ops.object.mode_set(mode="OBJECT"); bpy.ops.object.shade_smooth()
mat = bpy.data.materials.new(name); mat.use_nodes = True; nt = mat.node_tree; f = nt.nodes.new("ShaderNodeVertexColor"); f.layer_name = "Col"; nt.links.new(f.outputs["Color"], nt.nodes["Principled BSDF"].inputs["Base Color"]); nt.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.9; me.materials.append(mat)
os.makedirs(os.path.dirname(os.path.abspath(ziel)), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=ziel, export_format="GLB")
print(f"{name}: Krempe {round(2 * r_aussen, 2)} m, Krone {round(2 * r_innen, 2)} m breit, {round(prof[0][0], 2)} m hoch · {len(P)} Punkte · geschrieben: {ziel}")
