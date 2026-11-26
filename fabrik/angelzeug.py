"""Mythara Fabrik – Angelzeug in Blender bauen: Angelrute, Lamberts Rute, Fischreuse (als glb, Stielende/Griff im Ursprung, oben = +z).

  python3 fabrik/angelzeug.py -- <art> <ziel.glb>
  art: angelrute | lamberts_rute | fischreuse

Angelrute: 2 m, sich verjüngender Holzstab, Korkgriff, Metallringe, Rolle mit Kurbel, Ringführungen, Schnur mit rot-weißem Schwimmer.
  Metall grau und Holz hell – so färbt fabrik/seltenheit.py … holz=1 die Stufen (Training bis Mythisch) wie bei Holzbeil und Spitzhacke.
Lamberts Rute: dunkles Nussholz, Messingbeschläge, grüne Seidenwicklungen, grünblaue Schnur, Federköder – ein Einzelstück.
Fischreuse: Weidengeflecht (Längsstäbe, vier Reifen), Trichter vorn, Tragschlaufe oben (dort wird sie gehalten).
"""
import math, os, sys
import bpy
from mathutils import Vector

a_ = sys.argv[sys.argv.index("--") + 1:]; ART, ZIEL = a_[0], a_[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
def mat(name, farbe, rau=0.6, metall=0.0):
    m = bpy.data.materials.get(name)
    if m: return m
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = (*farbe, 1); b.inputs["Roughness"].default_value = rau; b.inputs["Metallic"].default_value = metall; return m
def lin(c): return tuple((x / 255) ** 2.2 for x in c)
def rohr(p0, p1, r0, r1, m, n=12):
    p0, p1 = Vector(p0), Vector(p1); d = p1 - p0
    bpy.ops.mesh.primitive_cone_add(vertices=n, radius1=r0, radius2=r1, depth=d.length, location=(p0 + p1) / 2)
    o = bpy.context.object; o.rotation_mode = "QUATERNION"; o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized()); o.data.materials.append(m)
    for p in o.data.polygons: p.use_smooth = True
    return o
def ring(ort, r, dicke, m, achse="z"):
    rot = {"z": (0, 0, 0), "x": (0, math.radians(90), 0), "y": (math.radians(90), 0, 0)}[achse]
    bpy.ops.mesh.primitive_torus_add(major_radius=r, minor_radius=dicke, location=ort, rotation=rot, major_segments=20, minor_segments=6); o = bpy.context.object; o.data.materials.append(m); return o
def kugel(ort, r, m, n=12):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=n, ring_count=n // 2, radius=r, location=ort); o = bpy.context.object; o.data.materials.append(m)
    for p in o.data.polygons: p.use_smooth = True
    return o

if ART in ("angelrute", "lamberts_rute"):
    L = 2.0; lambert = ART == "lamberts_rute"
    HOLZ = mat("holz", lin((112, 70, 40) if lambert else (196, 150, 92)), 0.55); GRIFF = mat("griff", lin((90, 60, 40) if lambert else (176, 130, 84)), 0.85)
    MET = mat("metall", lin((200, 160, 70)) if lambert else lin((150, 152, 158)), 0.3, 1.0)
    WICKEL = mat("wickel", lin((40, 110, 60) if lambert else (150, 40, 30)), 0.6); SCHNUR = mat("schnur", lin((120, 200, 190) if lambert else (235, 235, 225)), 0.4)
    rohr((0, 0, 0), (0, 0, L), 0.017, 0.004, HOLZ, 14)                                     # Stab (verjüngt)
    rohr((0, 0, 0.0), (0, 0, 0.34), 0.022, 0.02, GRIFF, 14)                                 # Griff
    rohr((0, 0, -0.012), (0, 0, 0.004), 0.024, 0.024, MET, 14)                              # Endkappe
    for z in (0.34, 0.37, 1.0):                                                               # Beschläge und Steckverbindung
        rohr((0, 0, z), (0, 0, z + 0.025), 0.02 - z * 0.006, 0.02 - z * 0.006, MET, 14)
    # Rolle unter dem Griff: Spule, Seitenscheiben, Kurbel
    rohr((0, 0.0, 0.42), (0, -0.04, 0.42), 0.012, 0.012, MET, 10)
    rohr((-0.03, -0.06, 0.42), (0.03, -0.06, 0.42), 0.042, 0.042, MET, 20)
    rohr((-0.022, -0.06, 0.42), (0.022, -0.06, 0.42), 0.036, 0.036, SCHNUR, 20)
    rohr((0.03, -0.06, 0.42), (0.05, -0.06, 0.42), 0.006, 0.006, MET); rohr((0.05, -0.06, 0.42), (0.05, -0.06, 0.37), 0.005, 0.005, MET); kugel((0.05, -0.06, 0.365), 0.01, GRIFF)
    for i, z in enumerate((0.6, 0.95, 1.3, 1.62, 1.86, 1.99)):                               # Ringführungen (mit Wicklung)
        r = 0.017 - z * 0.0065; ring((0, -r - 0.012, z), 0.009 - i * 0.0008, 0.0018, MET, "y"); rohr((0, 0, z - 0.012), (0, 0, z + 0.012), r + 0.0015, r + 0.0015, WICKEL, 10)
    rohr((0, -0.05, 0.42), (0, -0.016, 1.99), 0.0012, 0.0012, SCHNUR, 4)                    # Schnur zur Spitze …
    rohr((0, -0.006, 2.0), (0, -0.06, 1.62), 0.0012, 0.0012, SCHNUR, 4)                     # … und hängend
    if lambert:                                                                               # Federköder
        kugel((0, -0.06, 1.6), 0.012, MET); rohr((0, -0.06, 1.6), (0.02, -0.07, 1.54), 0.008, 0.001, WICKEL, 6); rohr((0, -0.06, 1.6), (-0.02, -0.07, 1.55), 0.007, 0.001, mat("feder", lin((200, 60, 40)), 0.7), 6)
    else:                                                                                     # Schwimmer rot-weiß
        kugel((0, -0.06, 1.6), 0.018, mat("rot", lin((200, 40, 30)), 0.4)); kugel((0, -0.06, 1.615), 0.014, mat("weiss", lin((240, 240, 235)), 0.4)); rohr((0, -0.06, 1.62), (0, -0.06, 1.66), 0.003, 0.002, mat("rot", lin((200, 40, 30))))
    if lambert:
        for z in (0.12, 0.22): rohr((0, 0, z), (0, 0, z + 0.03), 0.0225, 0.0225, WICKEL, 14)   # Seidenwicklungen im Griff
elif ART == "fischreuse":
    WEIDE = mat("weide", lin((170, 130, 80)), 0.85); RING = mat("ring", lin((120, 85, 50)), 0.8); SEIL = mat("seil", lin((190, 165, 120)), 0.9)
    LR = 0.75; R = 0.17                                                                       # liegt waagrecht (x), wird an der Schlaufe getragen: wir bauen sie hängend (oben = Schlaufe)
    n = 30
    for i in range(n):                                                                        # Längsstäbe: hinten spitz zulaufend, vorn offen
        a = 2 * math.pi * i / n; c, s = math.cos(a), math.sin(a)
        rohr((R * c, R * s, 0.0), (R * c, R * s, LR * 0.65), 0.0055, 0.0055, WEIDE, 5); rohr((R * c, R * s, LR * 0.65), (0.03 * c, 0.03 * s, LR), 0.0055, 0.004, WEIDE, 5)
        if i % 2 == 0: rohr((R * c, R * s, 0.0), (0.06 * c, 0.06 * s, 0.2), 0.004, 0.003, WEIDE, 5)   # Trichter nach innen
    for k in range(9):                                                                        # Flechtringe (dicht) und drei kräftige Reifen
        z = k * LR * 0.65 / 8; ring((0, 0, z), R + 0.004, 0.009 if k in (0, 4, 8) else 0.0045, RING if k in (0, 4, 8) else WEIDE)
    for z, r in ((LR * 0.78, R * 0.62), (LR * 0.9, R * 0.33)): ring((0, 0, z), r, 0.0045, WEIDE)
    ring((0, 0, 0.2), 0.06, 0.004, RING)
    ring((0, 0, LR + 0.04), 0.045, 0.006, SEIL, "x")                                         # Tragschlaufe oben (Griff)
for o in bpy.context.scene.objects: o.select_set(o.type == "MESH")
bpy.context.view_layer.objects.active = [o for o in bpy.context.scene.objects if o.type == "MESH"][0]; bpy.ops.object.join(); o = bpy.context.object; o.name = ART
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
lo = min(v.co.z for v in o.data.vertices)
for v in o.data.vertices: v.co.z -= lo
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ZIEL), export_format="GLB", use_selection=True)
print("Angelzeug:", ART, round(max(v.co.z for v in o.data.vertices), 2), "m ·", os.path.getsize(ZIEL) // 1024, "KB")
