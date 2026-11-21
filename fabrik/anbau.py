"""Mythara Fabrik – Rüstungsteile mit Volumen bauen (gerechnete Formen statt dünner Lagen auf dem Körper).

  python3 fabrik/anbau.py <art> <ziel.glb> [farbe=#b4b9c2] [rand=#8f949c] [groesse=1.0] [stoff=#2f58ab] [borte=#d9cfb4]

art
  schulter    Schulterplatte: gewölbte Schale (Kuppel nach +z, nach außen +x geneigt) mit Wulstrand und Nieten – für die linke Seite gebaut,
              rig.py spiegelt sie für rechts
  armschiene  Röhre um den Unterarm (Achse +z = Richtung des Knochens), zum Handgelenk hin weiter, zwei Ränder
  knie        Kniekachel: Halbkugel nach vorn (-y) mit zwei seitlichen Flügeln
  frisur      Haar mit Volumen um den Schädel (Ursprung Kopfmitte): Ansatz vorn hoch, hinten im Nacken, Tolle vorn nach oben gestrichen
  bart        Vollbart von Ohr zu Ohr (Ursprung Kopfmitte), Kinn nach unten-vorn
  waffenrock  Stoffbahn vorn vom Gürtel bis über die Knie (oben z = 0, hängt nach -z), mit heller Borte; rig.py lässt sie mit den Beinen schwingen
Alle Teile haben ihren Ursprung dort, wo rig.py sie ansetzt (Gelenk bzw. Gürtelmitte). Maße für eine Figur von 1,80 m (groesse skaliert).
"""
import math, sys
import bpy, bmesh
from mathutils import Matrix, Vector

art, ziel = sys.argv[1], sys.argv[2]; opt = dict(a.split("=", 1) for a in sys.argv[3:] if "=" in a); G = float(opt.get("groesse", 1.0))
def farbe(h): h = h.lstrip("#"); return tuple((int(h[i:i + 2], 16) / 255) ** 2.2 for i in (0, 2, 4)) + (1.0,)
def stoff(name, hexwert, met, rau):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = farbe(hexwert); b.inputs["Metallic"].default_value = met; b.inputs["Roughness"].default_value = rau; return m
bpy.ops.wm.read_factory_settings(use_empty=True); teile = []
METALL = stoff("metall", opt.get("farbe", "#b4b9c2"), 0.75, 0.38); RAND = stoff("rand", opt.get("rand", "#8f949c"), 0.75, 0.45); NIET = stoff("niet", "#c9a24a", 0.8, 0.35)
def neu(o, mat): o.data.materials.append(mat); teile.append(o); return o
def niete(p, r=0.011): bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=5, radius=r * G, location=p); neu(bpy.context.object, NIET)
def schale(rx, ry, rz, dicke, abschnitt=0.55):
    """obere Kappe eines Ellipsoids (Anteil der Höhe), mit Dicke"""
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=20, v_segments=12, radius=1.0)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < 1 - 2 * abschnitt], context="VERTS")
    for v in bm.verts: v.co = Vector((v.co.x * rx, v.co.y * ry, v.co.z * rz))
    me = bpy.data.meshes.new("schale"); bm.to_mesh(me); o = bpy.data.objects.new("schale", me); bpy.context.collection.objects.link(o)
    s = o.modifiers.new("d", "SOLIDIFY"); s.thickness = dicke; bpy.context.view_layer.objects.active = o; bpy.ops.object.modifier_apply(modifier="d"); return o
if art == "schulter":
    o = neu(schale(0.13 * G, 0.12 * G, 0.09 * G, 0.012 * G), METALL)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.125 * G, minor_radius=0.014 * G, location=(0, 0, -0.01 * G)); r = neu(bpy.context.object, RAND); r.scale = (1.0, 0.93, 1.0)
    bpy.ops.object.select_all(action="DESELECT")
    for w in (-50, 0, 50): a = math.radians(w); niete((0.115 * G * math.sin(a) * 0.3 + 0.08 * G * math.cos(a), 0.11 * G * math.sin(a), 0.035 * G))
    for t in teile: t.rotation_euler = (0, math.radians(-28), 0)                                    # nach außen geneigt (linke Seite, +x)
elif art == "armschiene":
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=False, cap_tris=False, segments=16, radius1=0.058 * G, radius2=0.048 * G, depth=0.17 * G)
    me = bpy.data.meshes.new("r"); bm.to_mesh(me); o = bpy.data.objects.new("r", me); bpy.context.collection.objects.link(o); o.location = (0, 0, 0.12 * G)
    s = o.modifiers.new("d", "SOLIDIFY"); s.thickness = 0.01 * G; bpy.context.view_layer.objects.active = o; bpy.ops.object.modifier_apply(modifier="d"); neu(o, METALL)
    for z, rr in ((0.035, 0.06), (0.205, 0.05)): bpy.ops.mesh.primitive_torus_add(major_radius=rr * G, minor_radius=0.009 * G, location=(0, 0, z * G)); neu(bpy.context.object, RAND)
elif art == "knie":
    o = neu(schale(0.07 * G, 0.07 * G, 0.07 * G, 0.01 * G, 0.5), METALL); o.rotation_euler = (math.radians(90), 0, 0)   # Kuppel nach vorn (-y)
    for s_ in (-1, 1): bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.045 * G, location=(s_ * 0.06 * G, 0.01 * G, 0)); f = neu(bpy.context.object, RAND); f.scale = (0.5, 0.35, 0.9)
    niete((0, -0.072 * G, 0), 0.012)
elif art == "waffenrock":
    TUCH = stoff("tuch", opt.get("stoff", "#2f58ab"), 0.0, 0.9); BORTE = stoff("borte", opt.get("borte", "#d9cfb4"), 0.0, 0.8)
    bm = bmesh.new(); nx, nz = 6, 10; B, L = 0.24 * G, 0.42 * G; V = []
    for j in range(nz + 1):
        for i in range(nx + 1): t = j / nz; u = i / nx * 2 - 1; V.append(bm.verts.new((u * B / 2 * (1 + 0.15 * t), -0.035 * (1 - u * u) * G, -t * L)))
    for j in range(nz):
        for i in range(nx): a = j * (nx + 1) + i; bm.faces.new((V[a], V[a + nx + 1], V[a + nx + 2], V[a + 1]))
    me = bpy.data.meshes.new("rock"); bm.to_mesh(me); o = bpy.data.objects.new("rock", me); bpy.context.collection.objects.link(o)
    s = o.modifiers.new("d", "SOLIDIFY"); s.thickness = 0.012 * G; bpy.context.view_layer.objects.active = o; bpy.ops.object.modifier_apply(modifier="d")
    me.materials.append(TUCH); me.materials.append(BORTE)
    for p in me.polygons:                                                                          # Borte: unterer Saum und Seitenkanten
        c = p.center; br = B / 2 * (1 + 0.15 * (-c.z / L))
        p.material_index = 1 if (c.z < -L + 0.035 * G or abs(c.x) > br - 0.03 * G) else 0
    teile.append(o)
elif art in ("frisur", "bart"):
    # Ursprung = Kopfmitte. Kopfmaße (Halbachsen) für den Kenney-Kopf: 0.21 breit, 0.25 tief, 0.19 hoch; kopf=bx,by,bz ändert sie
    bx, by, bz = (float(v) for v in opt.get("kopf", "0.21,0.25,0.19").split(",")); HAAR = stoff("haar", opt.get("farbe", "#5b3520"), 0.0, 0.62)
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=40, v_segments=24, radius=1.0)
    if art == "frisur":
        for v in bm.verts: v.co = Vector((v.co.x * (bx + 0.012), v.co.y * (by + 0.014), v.co.z * (bz + 0.06) if v.co.z > 0 else v.co.z * (bz + 0.012)))   # eng an den Seiten, Volumen oben
        # Haaransatz: vorn hoch über der Stirn (über den Brauen), seitlich über den Ohren, hinten tief im Nacken
        ansatz = float(opt.get("ansatz", 0.14))
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < ansatz * G - (ansatz + 0.2) * G * max(0.0, (v.co.y + by) / (2 * by)) ** 1.3 - (0.04 if abs(v.co.x) > bx * 0.85 else 0)], context="VERTS")
        for v in bm.verts:
            vorn = max(0.0, min(1.0, (-v.co.y - 0.05) / (by - 0.05))) * max(0.0, min(1.0, (v.co.z - 0.08) / 0.1)) * max(0.0, 1 - abs(v.co.x) / (bx * 0.9))
            v.co.z += 0.075 * G * vorn ** 1.3; v.co.y -= 0.03 * G * vorn                               # Tolle: vorn nach oben und etwas nach vorn gestrichen
            n = v.co.normalized(); v.co += n * 0.006 * G * math.sin(v.co.x * 70)                     # nach hinten gekämmte Strähnen (Rillen quer zur Kopfbreite)
    else:
        for v in bm.verts:                                                                           # kastenförmiger Kenney-Kiefer: unten breiter als ein Ellipsoid (Überellipse)
            k_ = lambda c: math.copysign(abs(c) ** 0.7, c); v.co = Vector((k_(v.co.x) * (bx + 0.025), k_(v.co.y) * (by + 0.03), v.co.z * (bz + 0.07) - 0.02))
        mund_z = float(opt.get("mund", -0.1)) * G
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.y > 0.04 * G or v.co.z > mund_z + 0.02 * (abs(v.co.x) / bx) * 4 or v.co.z < -(bz + 0.06) * 0.98], context="VERTS")
        for v in bm.verts:
            kinn = max(0.0, (-v.co.z - 0.12) / 0.12) * max(0.0, -v.co.y / by)
            v.co.z -= 0.045 * G * kinn; v.co.y -= 0.03 * G * kinn                                     # Kinnbart: nach unten und vorn
            v.co += v.co.normalized() * 0.005 * G * math.sin(v.co.z * 90)                            # Strähnen nach unten
    me = bpy.data.meshes.new(art); bm.to_mesh(me); o = bpy.data.objects.new(art, me); bpy.context.collection.objects.link(o)
    sd = o.modifiers.new("d", "SOLIDIFY"); sd.thickness = 0.014 * G; sd.offset = 1.0; bpy.context.view_layer.objects.active = o; bpy.ops.object.modifier_apply(modifier="d"); neu(o, HAAR)
else: sys.exit("unbekannte Art: " + art)
bpy.ops.object.select_all(action="DESELECT")
for t in teile: t.select_set(True)
bpy.context.view_layer.objects.active = teile[0]; bpy.ops.object.transform_apply(location=True, rotation=True, scale=True); bpy.ops.object.join()
o = bpy.context.object; o.name = art; bpy.ops.object.shade_smooth()
bpy.ops.export_scene.gltf(filepath=ziel, export_format="GLB"); print(f"{art}: Maße {[round(v, 3) for v in o.dimensions]} m · geschrieben: {ziel}")
