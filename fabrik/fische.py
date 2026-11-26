"""Mythara Fabrik – Fische fürs Angeln als Rucksackbilder (in Blender gebaut und gerendert, 256 × 256, durchsichtig).

  python3 fabrik/fische.py -- <ziel-ordner> [art=alle] [zustand=alle] [glb=1]

Arten: bachling (kleine Bachforelle, rot-schwarz getupft), muehlbarsch (Barsch: grüngold mit dunklen Querbinden, rote Flossen),
       moorhecht (langer Hecht mit Entenschnabel, olivgrün mit hellen Flecken), wels (Graufurter Wels: dunkelgrau marmoriert, breiter Kopf, Barteln),
       glutwels (Glutwels, Phase 9: glutrot mit dunklen und goldenen Flecken, Barteln).
Zustand: roh · gebraten (goldbraun, Grillstreifen) · verbrannt (schwarz verkohlt, Asche).
Ausgabe: <ziel>/fisch_<art>_<zustand>.webp (und mit glb=1 auch .glb, liegt flach am Boden).
"""
import math, os, sys, random
import bpy, bmesh
from mathutils import Vector

a_ = sys.argv[sys.argv.index("--") + 1:]; ZIEL = a_[0]; opt = dict(x.split("=", 1) for x in a_[1:] if "=" in x)
ARTEN = {   # Länge (m), Höhe/Länge, Breite/Höhe, Kopfspitze, Farben (Rücken, Seite, Bauch), Flossen
    "bachling":   dict(L=0.30, h=0.27, w=0.55, schnabel=0.0, ruecken=(0.18, 0.2, 0.12), seite=(0.55, 0.5, 0.32), bauch=(0.92, 0.86, 0.7), flosse=(0.55, 0.42, 0.3), muster="tupfen"),
    "muehlbarsch": dict(L=0.34, h=0.32, w=0.5, schnabel=0.0, ruecken=(0.14, 0.24, 0.1), seite=(0.55, 0.6, 0.22), bauch=(0.95, 0.9, 0.72), flosse=(0.85, 0.25, 0.12), muster="binden"),
    "wels":       dict(L=0.7, h=0.17, w=0.95, schnabel=0.0, ruecken=(0.16, 0.15, 0.13), seite=(0.34, 0.32, 0.27), bauch=(0.78, 0.74, 0.66), flosse=(0.22, 0.2, 0.17), muster="marmor"),   # Graufurter Wels (Phase 7): lang, flacher breiter Kopf, Barteln
    "glutwels":   dict(L=0.75, h=0.17, w=0.95, schnabel=0.0, ruecken=(0.3, 0.07, 0.04), seite=(0.78, 0.3, 0.09), bauch=(0.95, 0.8, 0.55), flosse=(0.8, 0.3, 0.07), muster="glut"),   # Glutwels (Phase 9, Strom bei Glutbrunn): glutrot, dunkle und goldene Flecken, Barteln
    "moorhecht":  dict(L=0.62, h=0.19, w=0.6, schnabel=0.12, ruecken=(0.12, 0.17, 0.08), seite=(0.34, 0.42, 0.18), bauch=(0.86, 0.84, 0.66), flosse=(0.45, 0.35, 0.18), muster="flecken"),
}
ZUSTAENDE = ["roh", "gebraten", "verbrannt"]
def lin(c): return tuple(x ** 2.2 for x in c)

def fisch(art, zustand):
    bpy.ops.wm.read_factory_settings(use_empty=True); A = ARTEN[art]; L, H, W = A["L"], A["L"] * A["h"], A["L"] * A["h"] * A["w"]
    bm = bmesh.new(); NU, NV = 40, 20; ringe = []
    for i in range(NU + 1):
        t = i / NU                                                                       # 0 = Schwanzwurzel, 1 = Maulspitze
        x = (t - 0.5) * L
        prof = math.sin(math.pi * min(1.0, t ** 0.75)) ** 0.8; kopf = max(0.0, (t - 0.85) / 0.15)
        h = H / 2 * (0.12 + 0.88 * prof) * (1 - 0.35 * kopf * (A["schnabel"] > 0)); w = W / 2 * (0.15 + 0.85 * prof)
        zring = []
        for j in range(NV):
            a = 2 * math.pi * j / NV; z = h * math.sin(a) * (1.08 if math.sin(a) < 0 else 1.0); y = w * math.cos(a)
            zring.append(bm.verts.new((x, y, z)))
        ringe.append(zring)
    for i in range(NU):
        for j in range(NV): bm.faces.new((ringe[i][j], ringe[i + 1][j], ringe[i + 1][(j + 1) % NV], ringe[i][(j + 1) % NV]))
    bmesh.ops.contextual_create(bm, geom=ringe[0]); bmesh.ops.contextual_create(bm, geom=ringe[-1])
    me = bpy.data.meshes.new(art); bm.to_mesh(me); bm.free(); koerper = bpy.data.objects.new("koerper", me); bpy.context.collection.objects.link(koerper)
    koerper.modifiers.new("glatt", "SUBSURF").levels = 1
    teile = [koerper]
    def flosse(punkte, mat):
        bm2 = bmesh.new(); vs = [bm2.verts.new(p) for p in punkte]; bm2.faces.new(vs); m2 = bpy.data.meshes.new("flosse"); bm2.to_mesh(m2); bm2.free()
        o = bpy.data.objects.new("flosse", m2); bpy.context.collection.objects.link(o); o.data.materials.append(mat); s = o.modifiers.new("dick", "SOLIDIFY"); s.thickness = 0.003; teile.append(o); return o
    x0 = -L / 2
    # Material des Körpers: Rücken dunkel, Bauch hell (Verlauf über die Höhe), Muster je Art; gebraten / verbrannt darüber
    m = bpy.data.materials.new("haut"); m.use_nodes = True; nt = m.node_tree; bs = nt.nodes["Principled BSDF"]; bs.inputs["Roughness"].default_value = 0.35 if zustand == "roh" else 0.7
    tc = nt.nodes.new("ShaderNodeTexCoord"); sep = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(tc.outputs["Object"], sep.inputs["Vector"])
    mz = nt.nodes.new("ShaderNodeMapRange"); mz.inputs["From Min"].default_value = -H / 2; mz.inputs["From Max"].default_value = H / 2; nt.links.new(sep.outputs["Z"], mz.inputs["Value"])
    ramp = nt.nodes.new("ShaderNodeValToRGB"); e = ramp.color_ramp.elements; e[0].position = 0.25; e[0].color = (*lin(A["bauch"]), 1); e[1].position = 0.85; e[1].color = (*lin(A["ruecken"]), 1)
    mid = e.new(0.55); mid.color = (*lin(A["seite"]), 1); nt.links.new(mz.outputs["Result"], ramp.inputs["Fac"])
    farbe = ramp.outputs["Color"]
    if A["muster"] == "binden":                                                          # dunkle Querbinden
        wv = nt.nodes.new("ShaderNodeTexWave"); wv.inputs["Scale"].default_value = 2.2 / L * 0.3; wv.inputs["Distortion"].default_value = 1.5; wv.bands_direction = "X"; nt.links.new(tc.outputs["Object"], wv.inputs["Vector"])
        r2 = nt.nodes.new("ShaderNodeMapRange"); r2.inputs["From Min"].default_value = 0.65; r2.inputs["From Max"].default_value = 0.8; nt.links.new(wv.outputs["Fac"], r2.inputs["Value"])
        mx = nt.nodes.new("ShaderNodeMixRGB"); mx.blend_type = "MULTIPLY"; mx.inputs["Color2"].default_value = (0.25, 0.3, 0.15, 1); nt.links.new(r2.outputs["Result"], mx.inputs["Fac"]); nt.links.new(farbe, mx.inputs["Color1"]); farbe = mx.outputs["Color"]
    else:                                                                                # Tupfen (Bachling: rot und schwarz) / helle Flecken (Hecht)
        for skala, farbe_t, schwelle in ({"tupfen": [(38, (0.03, 0.02, 0.02), 0.72), (30, (0.75, 0.08, 0.03), 0.75)], "marmor": [(11, (0.035, 0.035, 0.03), 0.7), (24, (0.06, 0.055, 0.05), 0.7)], "glut": [(12, (0.1, 0.02, 0.012), 0.7), (30, (1.0, 0.62, 0.12), 0.75)]}.get(A["muster"]) or [(18, lin((0.85, 0.82, 0.55)), 0.68)]):
            v = nt.nodes.new("ShaderNodeTexVoronoi"); v.inputs["Scale"].default_value = skala; nt.links.new(tc.outputs["Object"], v.inputs["Vector"])
            r2 = nt.nodes.new("ShaderNodeMapRange"); r2.inputs["From Min"].default_value = 0.3; r2.inputs["From Max"].default_value = 0.2; nt.links.new(v.outputs["Distance"], r2.inputs["Value"])
            mk = nt.nodes.new("ShaderNodeMath"); mk.operation = "MULTIPLY"; nt.links.new(r2.outputs["Result"], mk.inputs[0]); mk.inputs[1].default_value = 1.0
            mx = nt.nodes.new("ShaderNodeMixRGB"); mx.inputs["Color2"].default_value = (*farbe_t, 1); nt.links.new(mk.outputs["Value"], mx.inputs["Fac"]); nt.links.new(farbe, mx.inputs["Color1"]); farbe = mx.outputs["Color"]
    if zustand != "roh":                                                                 # gebraten: goldbraun mit Grillstreifen; verbrannt: fast schwarz, Asche
        mx = nt.nodes.new("ShaderNodeMixRGB"); mx.inputs["Fac"].default_value = 0.75 if zustand == "gebraten" else 0.95
        mx.inputs["Color2"].default_value = ((0.55, 0.28, 0.06, 1) if zustand == "gebraten" else (0.02, 0.016, 0.014, 1)); nt.links.new(farbe, mx.inputs["Color1"]); farbe = mx.outputs["Color"]
        if zustand == "gebraten":                                                       # vier schräge Grillstreifen
            mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Rotation"].default_value = (0, 0, math.radians(35)); nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
            sx = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(mp.outputs["Vector"], sx.inputs["Vector"])
            mm = nt.nodes.new("ShaderNodeMath"); mm.operation = "MULTIPLY"; mm.inputs[1].default_value = 4.5 / L; nt.links.new(sx.outputs["X"], mm.inputs[0])
            fr = nt.nodes.new("ShaderNodeMath"); fr.operation = "FRACT"; nt.links.new(mm.outputs["Value"], fr.inputs[0])
            r2 = nt.nodes.new("ShaderNodeMapRange"); r2.inputs["From Min"].default_value = 0.0; r2.inputs["From Max"].default_value = 0.15; r2.inputs["To Min"].default_value = 1; r2.inputs["To Max"].default_value = 0; nt.links.new(fr.outputs["Value"], r2.inputs["Value"])
        else:                                                                            # verkohlt: fleckige Asche
            nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 22; nz.inputs["Detail"].default_value = 6; nt.links.new(tc.outputs["Object"], nz.inputs["Vector"])
            r2 = nt.nodes.new("ShaderNodeMapRange"); r2.inputs["From Min"].default_value = 0.58; r2.inputs["From Max"].default_value = 0.7; nt.links.new(nz.outputs["Fac"], r2.inputs["Value"])
        mx2 = nt.nodes.new("ShaderNodeMixRGB"); mx2.inputs["Color2"].default_value = ((0.09, 0.04, 0.012, 1) if zustand == "gebraten" else (0.2, 0.19, 0.18, 1)); nt.links.new(r2.outputs["Result"], mx2.inputs["Fac"])
        nt.links.new(farbe, mx2.inputs["Color1"]); farbe = mx2.outputs["Color"]
    nt.links.new(farbe, bs.inputs["Base Color"]); koerper.data.materials.append(m)
    fl_farbe = A["flosse"] if zustand == "roh" else ((0.35, 0.18, 0.06) if zustand == "gebraten" else (0.03, 0.03, 0.03))
    fm = bpy.data.materials.new("flosse"); fm.use_nodes = True; fb = fm.node_tree.nodes["Principled BSDF"]; fb.inputs["Base Color"].default_value = (*lin(fl_farbe), 1); fb.inputs["Roughness"].default_value = 0.5
    sw = L * 0.22                                                                        # Schwanzflosse (gegabelt)
    flosse([(x0 + 0.01, 0, 0), (x0 - sw, 0, H * 0.55), (x0 - sw * 0.7, 0, 0), (x0 - sw, 0, -H * 0.55)], fm)
    if art == "muehlbarsch":                                                             # stachlige Rückenflosse
        flosse([(x0 + L * 0.45, 0, H * 0.44), (x0 + L * 0.5, 0, H * 0.78), (x0 + L * 0.6, 0, H * 0.7), (x0 + L * 0.68, 0, H * 0.75), (x0 + L * 0.72, 0, H * 0.42)], fm)
    elif art == "moorhecht":                                                             # Rückenflosse weit hinten
        flosse([(x0 + L * 0.18, 0, H * 0.35), (x0 + L * 0.22, 0, H * 0.8), (x0 + L * 0.32, 0, H * 0.4)], fm)
    else: flosse([(x0 + L * 0.42, 0, H * 0.42), (x0 + L * 0.5, 0, H * 0.72), (x0 + L * 0.6, 0, H * 0.4)], fm)
    for sy in (1, -1): flosse([(x0 + L * 0.7, sy * W * 0.4, -H * 0.15), (x0 + L * 0.55, sy * W * 1.3, -H * 0.42), (x0 + L * 0.62, sy * W * 0.4, -H * 0.3)], fm)   # Brustflossen
    for sy in (1, -1):                                                                   # Augen
        aug_x = x0 + L * (0.86 if A["schnabel"] == 0 else 0.8); ah = H * 0.12
        bpy.ops.mesh.primitive_uv_sphere_add(radius=H * 0.1, location=(aug_x, sy * W * 0.42, ah)); o = bpy.context.object
        am = bpy.data.materials.new("auge"); am.use_nodes = True; ab = am.node_tree.nodes["Principled BSDF"]
        ab.inputs["Base Color"].default_value = ((0.85, 0.7, 0.2, 1) if zustand == "roh" else (0.9, 0.88, 0.8, 1) if zustand == "gebraten" else (0.15, 0.15, 0.15, 1)); ab.inputs["Roughness"].default_value = 0.15
        o.data.materials.append(am); teile.append(o)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=H * 0.055, location=(aug_x + H * 0.03, sy * W * 0.5, ah)); o = bpy.context.object
        pm = bpy.data.materials.new("pupille"); pm.use_nodes = True; pm.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.01, 0.01, 0.01, 1); o.data.materials.append(pm); teile.append(o)
    if art in ("wels", "glutwels"):                                                                  # vier Barteln am breiten Maul
        bm_ = bpy.data.materials.new("bartel"); bm_.use_nodes = True; bm_.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (*lin(fl_farbe), 1)
        mx_ = x0 + L * 1.0
        for sy, lz, dz in ((1, 0.32, -0.02), (-1, 0.32, -0.02), (1, 0.18, -0.1), (-1, 0.18, -0.1)):
            p0 = Vector((mx_ - L * 0.02, sy * W * 0.3, -H * 0.05)); p1 = p0 + Vector((-L * lz * 0.3, sy * L * lz * 0.55, dz * L))
            bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=H * 0.035, radius2=H * 0.008, depth=(p1 - p0).length, location=(p0 + p1) / 2)
            o = bpy.context.object; o.rotation_mode = "QUATERNION"; o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference((p1 - p0).normalized()); o.data.materials.append(bm_); teile.append(o)
    return teile

def bild(teile, ziel_png, kipp=0.0):
    sc = bpy.context.scene
    for o in teile: o.rotation_euler = (0, 0, 0)
    g = bpy.data.objects.new("halter", None); sc.collection.objects.link(g)
    for o in teile: o.parent = g
    g.rotation_euler = (math.radians(-28), math.radians(-12), math.radians(18 + kipp)); bpy.context.view_layer.update()
    ps = [o.matrix_world @ Vector(c) for o in teile for c in o.bound_box]; lo = Vector([min(p[i] for p in ps) for i in range(3)]); hi = Vector([max(p[i] for p in ps) for i in range(3)])
    c = (lo + hi) / 2
    eng = [i.identifier for i in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items]; sc.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in eng else "BLENDER_EEVEE"
    sc.render.resolution_x = sc.render.resolution_y = 512; sc.render.film_transparent = True; sc.view_settings.view_transform = "Standard"
    w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True; w.node_tree.nodes["Background"].inputs[1].default_value = 0.9
    l = bpy.data.objects.new("l", bpy.data.lights.new("l", "SUN")); l.data.energy = 3.4; l.rotation_euler = (math.radians(40), 0, math.radians(-30)); sc.collection.objects.link(l)
    cam = bpy.data.objects.new("k", bpy.data.cameras.new("k")); sc.collection.objects.link(cam); sc.camera = cam; cam.data.type = "ORTHO"
    cam.data.ortho_scale = max(hi.x - lo.x, hi.z - lo.z) * 0.96; cam.location = c + Vector((0, -5, 0)); cam.rotation_euler = (math.radians(90), 0, 0)
    sc.render.filepath = ziel_png; bpy.ops.render.render(write_still=True)

if __name__ == "__main__":
    from PIL import Image
    os.makedirs(ZIEL, exist_ok=True)
    arten = list(ARTEN) if opt.get("art", "alle") == "alle" else opt["art"].split(","); zust = ZUSTAENDE if opt.get("zustand", "alle") == "alle" else opt["zustand"].split(",")
    for art in arten:
        for z in zust:
            teile = fisch(art, z); png = os.path.join(ZIEL, f"_fisch_{art}_{z}.png"); bild(teile, os.path.abspath(png))
            Image.open(png).resize((256, 256), Image.LANCZOS).save(os.path.join(ZIEL, f"fisch_{art}_{z}.webp"), "WEBP", quality=90); os.remove(png)
            print("Fisch:", art, z)
