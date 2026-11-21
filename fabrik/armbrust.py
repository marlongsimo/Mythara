"""Mythara Fabrik – eine Armbrust aus einfachen Körpern bauen (Schaft, Pistolengriff, waagerechte Bogenarme, Sehne, Bolzen).

  python3 fabrik/armbrust.py <ziel.glb> [laenge=0.78] [spannweite=0.66] [holz=#5a3a22] [metall=#3c3a36] [sehne=#c8b89a]

Eine ausgeschnittene Zeichnung wäre von oben gesehen nur ein dünnes Brett; die Bogenarme einer Armbrust liegen aber waagerecht.
Ausrichtung für rig.py (wie ein Schwert, Platz hand_r): die z-Achse ist die Achse des Pistolengriffs – oben (+z) der Schaft, unten (-z) das Griffende.
Die Faust umschließt den Griff (griff = 0.5); der Schaft verläuft entlang der Hand: nach -x zur Spitze (in Richtung der Finger), nach +x zum Kolben (zum Unterarm hin).
Die Bogenarme liegen quer dazu entlang y. Ein Leerobjekt-Ort für die zweite Hand (unter dem Vorderschaft) steht als „griff2_ort“ in der Ausgabe.
"""
import sys
import bpy, bmesh
from mathutils import Vector

ziel = sys.argv[1]; opt = dict(a.split("=", 1) for a in sys.argv[2:] if "=" in a)
L = float(opt.get("laenge", 0.78)); SP = float(opt.get("spannweite", 0.66))
def farbe(h): h = h.lstrip("#"); return tuple((int(h[i:i + 2], 16) / 255) ** 2.2 for i in (0, 2, 4)) + (1.0,)
bpy.ops.wm.read_factory_settings(use_empty=True)
def stoff(name, hexwert, rau=0.75, met=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = farbe(hexwert); b.inputs["Roughness"].default_value = rau; b.inputs["Metallic"].default_value = met; return m
HOLZ = stoff("holz", opt.get("holz", "#5a3a22")); METALL = stoff("metall", opt.get("metall", "#3c3a36"), 0.45, 0.7); SEHNE = stoff("sehne", opt.get("sehne", "#c8b89a"), 0.9)
teile = []
def kasten(x0, x1, y0, y1, z0, z1, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)); o = bpy.context.object; o.scale = (x1 - x0, y1 - y0, z1 - z0)
    bpy.ops.object.transform_apply(scale=True); o.data.materials.append(mat); teile.append(o); return o
def stab(a, b, r, mat, ecken=8):
    a, b = Vector(a), Vector(b); bpy.ops.mesh.primitive_cylinder_add(vertices=ecken, radius=r, depth=(b - a).length, location=(a + b) / 2); o = bpy.context.object
    o.rotation_mode = "QUATERNION"; o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference((b - a).normalized()); bpy.ops.object.transform_apply(rotation=True)
    o.data.materials.append(mat); teile.append(o); return o
vorn, hinten = -0.62 * L, 0.38 * L                                                               # Spitze und Kolbenende entlang x (Ursprung = Mitte der Faust)
kasten(vorn, hinten, -0.025, 0.025, 0.035, 0.085, HOLZ)                                        # Schaft
kasten(hinten - 0.16 * L, hinten, -0.032, 0.032, -0.02, 0.09, HOLZ)                           # Kolben, nach unten verbreitert
kasten(-0.03, 0.035, -0.02, 0.02, -0.095, 0.04, HOLZ)                                         # Pistolengriff (die Faust)
kasten(vorn, vorn + 0.05, -0.04, 0.04, 0.03, 0.095, METALL)                                    # Bogenträger
kasten(-0.02, 0.06, -0.03, 0.03, 0.085, 0.105, METALL)                                         # Abzugsschloss
spitze_x = vorn + 0.025; zb = 0.07; n = 8
for s in (-1, 1):                                                                              # zwei Bogenarme, nach hinten geschwungen
    pkt = [Vector((spitze_x + 0.09 * L * (k / n) ** 2, s * SP / 2 * k / n, zb)) for k in range(n + 1)]
    for a, b in zip(pkt, pkt[1:]): stab(a, b, 0.016 - 0.008 * (pkt.index(a) / n), METALL)
ende_l = Vector((spitze_x + 0.09 * L, -SP / 2, zb)); ende_r = Vector((spitze_x + 0.09 * L, SP / 2, zb)); nuss = Vector((0.0, 0, zb + 0.02))
stab(ende_l, nuss, 0.004, SEHNE, 5); stab(ende_r, nuss, 0.004, SEHNE, 5)                     # Sehne, gespannt bis zum Schloss
stab((0.0, 0, 0.1), (vorn - 0.06, 0, 0.1), 0.007, SEHNE, 6); stab((vorn - 0.06, 0, 0.1), (vorn - 0.1, 0, 0.1), 0.012, METALL, 6)   # eingelegter Bolzen mit Spitze
bpy.ops.mesh.primitive_torus_add(major_radius=0.05, minor_radius=0.007, location=(vorn - 0.04, 0, 0.06), rotation=(1.5708, 0, 0)); bg = bpy.context.object; bg.data.materials.append(METALL); teile.append(bg)   # Spannbügel vorn
bpy.ops.object.select_all(action="DESELECT")
for o in teile: o.select_set(True)
bpy.context.view_layer.objects.active = teile[0]; bpy.ops.object.join(); o = bpy.context.object; o.name = "armbrust"
bpy.ops.export_scene.gltf(filepath=ziel, export_format="GLB")
e = [Vector(c) for c in o.bound_box]; z0 = min(v.z for v in e); z1 = max(v.z for v in e)
print(f"Armbrust: Länge {L} m, Spannweite {SP} m · z {z0:.3f} bis {z1:.3f} · griff = {(z1 - 0.0) / (z1 - z0):.2f} · griff2_ort = [{-0.32 * L:.3f}, 0, 0.035] · geschrieben: {ziel}")
