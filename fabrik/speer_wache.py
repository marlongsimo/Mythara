"""Mythara Fabrik – Speer der Stadtwache (nach dem Konzeptbild): dunkler Holzschaft mit Lederwicklung, Goldringe, lange Stahlspitze mit blauem Stein,
Parierflügel, blauer Wimpel mit Goldrand, goldener Schuh. Spitze unten wie alle Waffen der Fabrik.

  python3 fabrik/speer_wache.py <ziel.glb> [laenge=2.1]
"""
import sys, math, bpy, bmesh
ziel = sys.argv[1]; opt = dict(a.split("=", 1) for a in sys.argv[2:] if "=" in a); L = float(opt.get("laenge", 2.1))
bpy.ops.wm.read_factory_settings(use_empty=True)
def mat(n, c, met, rau):
    m = bpy.data.materials.new(n); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = (*c, 1); b.inputs["Metallic"].default_value = met; b.inputs["Roughness"].default_value = rau; return m
HOLZ, LEDER, GOLD, STAHL, BLAU, STEIN = mat("holz", (0.12, 0.07, 0.04), 0, 0.7), mat("leder", (0.25, 0.13, 0.06), 0, 0.8), mat("gold", (0.75, 0.5, 0.18), 0.9, 0.35), mat("stahl", (0.62, 0.63, 0.66), 0.9, 0.3), mat("blau", (0.06, 0.12, 0.45), 0, 0.8), mat("stein", (0.05, 0.2, 0.9), 0.2, 0.15)
teile = []; oben, unten = L / 2, -L / 2; SP = 0.38                                                        # Länge der Spitze
def rohr(z0, z1, r0, r1, m, n=14):
    bpy.ops.mesh.primitive_cone_add(vertices=n, radius1=r0, radius2=r1, depth=z1 - z0, location=(0, 0, (z0 + z1) / 2)); o = bpy.context.object; o.data.materials.append(m); teile.append(o)
rohr(unten + SP, oben - 0.08, 0.016, 0.017, HOLZ)                                                         # Schaft
for z in (oben - 0.08, unten + SP + 0.02, unten + SP + 0.32, 0.1, -0.15): rohr(z - 0.015, z + 0.015, 0.021, 0.021, GOLD)   # Ringe
rohr(-0.05, 0.08, 0.019, 0.019, LEDER); rohr(0.25, 0.38, 0.019, 0.019, LEDER)                            # Wicklungen (Griff)
rohr(oben - 0.08, oben, 0.022, 0.006, GOLD)                                                               # Schuh
bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.05, radius2=0.0, depth=SP * 0.8, location=(0, 0, unten + SP * 0.4), rotation=(math.pi, 0, math.pi / 4)); s = bpy.context.object; s.scale = (1, 0.22, 1); s.data.materials.append(STAHL); teile.append(s)   # Blatt
for sx in (-1, 1):                                                                                         # Parierflügel
    bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.018, radius2=0.0, depth=0.11, location=(sx * 0.045, 0, unten + SP * 0.86), rotation=(0, sx * 2.4, math.pi / 4)); f = bpy.context.object; f.scale = (1, 0.3, 1); f.data.materials.append(STAHL); teile.append(f)
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.016, location=(0, -0.012, unten + SP * 0.62)); g = bpy.context.object; g.scale = (0.7, 0.5, 1.4); g.data.materials.append(STEIN); teile.append(g)   # blauer Stein
bm = bmesh.new(); z0 = unten + SP + 0.04                                                                   # Wimpel: zweizipflig, hängt seitlich vom Schaft
pts = [(0.02, 0, z0), (0.2, 0, z0 + 0.02), (0.16, 0, z0 + 0.12), (0.22, 0, z0 + 0.24), (0.02, 0, z0 + 0.2)]
vs = [bm.verts.new(p) for p in pts]; bm.faces.new(vs); me = bpy.data.meshes.new("wimpel"); bm.to_mesh(me); w = bpy.data.objects.new("wimpel", me); bpy.context.collection.objects.link(w)
sol = w.modifiers.new("d", "SOLIDIFY"); sol.thickness = 0.006; bpy.context.view_layer.objects.active = w; w.select_set(True); bpy.ops.object.modifier_apply(modifier="d"); me.materials.append(BLAU); teiles = teile.append(w)
bpy.ops.object.select_all(action="DESELECT")
for o in teile: o.select_set(True)
bpy.context.view_layer.objects.active = teile[0]; bpy.ops.object.transform_apply(location=False, rotation=True, scale=True); bpy.ops.object.join(); bpy.ops.object.shade_smooth()
bpy.ops.export_scene.gltf(filepath=ziel, export_format="GLB", use_selection=True); print("Speer der Wache:", ziel)
