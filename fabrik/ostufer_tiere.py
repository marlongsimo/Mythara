"""Mythara Fabrik – Gegner des Ostufers aus einfachen Formen (wenige Flächen), mit Skelett und Bewegungen (wie fabrik/rabe.py).

  <blender-python> fabrik/ostufer_tiere.py -- <art> <ziel.blend>      art: krebs | reiher | gruenlicht | wolf | rudelfuehrer | fuchs | graupelz | wildschwein | feldhase | schaf | bienen
Danach: fabrik/export3d.py <ziel.blend> <spiel.glb> echtzeit=1

krebs      – Schlickkrebs (St. 45): flacher schlammbrauner Panzer (≈ 0,9 m breit), zwei große Scheren, acht Beine, Stielaugen.
             ruhe (Scheren klappern) · gehen (seitwärts) · angriff (Scherenhieb, Treffer Bild 5) · treffer · tod (kippt auf den Rücken)
reiher     – Splitterreiher (St. 50): grauer Stelzvogel (≈ 1,5 m), blaue Splitterkristalle auf Rücken und Schopf.
             ruhe · gehen (staksen) · angriff (Splitter-Stoß: Hals zurück, nach vorn stoßen, Schnabel öffnet – Geschoss ab Bild 6) · treffer · tod
gruenlicht – Grünlicht (St. 60): Irrlicht, leuchtender grüner Kern mit Flammenzungen und kreisenden Funken, schwebt (1,2 m).
             ruhe (schweben, flackern) · angriff (zusammenziehen, aufblähen – Treffer Bild 5) · heilen (ausdehnen, Funken weit) · treffer · tod (verlöscht)
wolf       – Heidewolf (Fahle Weiten): graubraun · ruhe, gehen, laufen, angriff (Sprungbiss, Treffer Bild 6), treffer, tod
rudelfuehrer – Rudelführer: ×1,22, dunkler, Nackenmähne, gelb glimmende Augen · dazu heulen (ruft das Rudel)
Süden (#121), aus der Wolfsform abgeleitet (gleiche Knochen und Bewegungen wie der Wolf):
fuchs (×0,72, rotorange, weiße Schwanzspitze) · graupelz (Alpha-Wolf ×1,35, hellgrau, Mähne, Narbe, glimmende Augen, heulen) ·
wildschwein (Borsten, Hauer, Rüssel) · feldhase (Löffel, Blume) · schaf (Wollbausch, schwarzes Gesicht; fressen statt angriff)
bienen – Wildbienen-Schwarm (#121): Gerüst und Bewegungen des Grünlichts, statt Flammen 21 Bienen (ohne heilen)
Gesicht nach -y, oben +z. Jedes Teil hängt starr an einem Knochen.
"""
import json, math, os, random, sys
import bpy
from mathutils import Quaternion, Vector

a_ = sys.argv[sys.argv.index("--") + 1:]; ART, ZIEL = a_[0], a_[1]
bpy.ops.wm.read_factory_settings(use_empty=True); random.seed(5)
def mat(n, c, r=0.6, gl=0.0, leucht=0.0):
    m = bpy.data.materials.get(n)
    if m: return m
    m = bpy.data.materials.new(n); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]; f = (*[(x / 255) ** 2.2 for x in c], 1)
    b.inputs["Base Color"].default_value = f; b.inputs["Roughness"].default_value = r; b.inputs["Metallic"].default_value = gl
    if leucht: b.inputs["Emission Color"].default_value = f; b.inputs["Emission Strength"].default_value = leucht
    return m
teile = []
def kugel(ort, sk, m, kn, seg=10, ringe=6):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=ringe, radius=1, location=ort); o = bpy.context.object; o.scale = sk; o.data.materials.append(m); teile.append((o, kn)); return o
def rohr(p0, p1, r0, m, kn, r1=None, n=6):
    p0, p1 = Vector(p0), Vector(p1); d = p1 - p0
    bpy.ops.mesh.primitive_cone_add(vertices=n, radius1=r0, radius2=r0 if r1 is None else r1, depth=d.length, location=(p0 + p1) / 2)
    o = bpy.context.object; o.rotation_mode = "QUATERNION"; o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized()); o.data.materials.append(m); teile.append((o, kn)); return o
def kristall(ort, r, h, m, kn, kipp=(0, 0, 0)):
    bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=r, radius2=0, depth=h, location=ort, rotation=kipp); o = bpy.context.object; o.data.materials.append(m); teile.append((o, kn)); return o
KN = {}
def knochen(n, k, e, el=None): KN[n] = (k, e, el)

if ART == "krebs":
    PZ = mat("panzer", (96, 78, 58), 0.55, 0.1); PH = mat("panzerhell", (150, 120, 85), 0.5); SCH = mat("schlamm", (70, 62, 48), 0.9); AU = mat("auge", (20, 18, 16), 0.2)
    Z = 0.32
    kugel((0, 0, Z), (0.42, 0.32, 0.15), PZ, "koerper", 14, 7); kugel((0, -0.05, Z + 0.06), (0.32, 0.22, 0.08), PH, "koerper", 12, 6)
    for k in range(5): kugel((random.uniform(-.3, .3), random.uniform(-.2, .2), Z + 0.1), (0.06, 0.05, 0.02), SCH, "koerper", 6, 4)
    for sx in (-1, 1):
        rohr((sx * 0.08, -0.28, Z + 0.08), (sx * 0.1, -0.33, Z + 0.22), 0.015, PZ, "koerper"); kugel((sx * 0.1, -0.33, Z + 0.24), (0.035, 0.035, 0.035), AU, "koerper", 8, 4)
        S = "L" if sx > 0 else "R"
        rohr((sx * 0.32, -0.18, Z), (sx * 0.5, -0.38, Z + 0.06), 0.05, PZ, "arm." + S)                   # Oberarm
        kugel((sx * 0.55, -0.5, Z + 0.08), (0.13, 0.17, 0.09), PZ, "schere." + S, 10, 6)                    # Scherenhand
        kristall((sx * 0.6, -0.68, Z + 0.1), 0.05, 0.18, PH, "schere." + S, (math.radians(90), 0, 0))       # fester Finger
        kristall((sx * 0.5, -0.66, Z + 0.06), 0.04, 0.16, PH, "finger." + S, (math.radians(90), 0, 0))      # beweglicher Finger
        knochen("arm." + S, (sx * 0.3, -0.16, Z), (sx * 0.5, -0.38, Z + 0.06), "koerper"); knochen("schere." + S, (sx * 0.5, -0.38, Z + 0.06), (sx * 0.58, -0.6, Z + 0.08), "arm." + S)
        knochen("finger." + S, (sx * 0.5, -0.56, Z + 0.06), (sx * 0.5, -0.72, Z + 0.06), "schere." + S)
        for i in range(4):
            y = -0.12 + i * 0.1; b = f"bein{i}.{S}"
            rohr((sx * 0.36, y, Z), (sx * 0.58, y + 0.03, Z + 0.08), 0.022, PZ, b); rohr((sx * 0.58, y + 0.03, Z + 0.08), (sx * 0.72, y + 0.05, 0.0), 0.018, PZ, b, 0.006)
            knochen(b, (sx * 0.34, y, Z), (sx * 0.72, y + 0.05, 0.0), "koerper")
    knochen("wurzel", (0, 0, 0), (0, 0, 0.1)); knochen("koerper", (0, 0.2, Z), (0, -0.2, Z), "wurzel")
elif ART == "reiher":
    GR = mat("gefieder", (128, 134, 142), 0.7); HE = mat("brust", (205, 208, 212), 0.7); SN = mat("schnabel", (205, 170, 70), 0.4); BE = mat("bein", (150, 120, 70), 0.6)
    BL = mat("splitter", (100, 170, 245), 0.15, 0, 1.4); AU = mat("auge", (230, 200, 60), 0.3)
    Z = 0.95
    kugel((0, 0, Z), (0.14, 0.26, 0.16), GR, "koerper", 12, 7); kugel((0, -0.1, Z - 0.03), (0.11, 0.14, 0.12), HE, "koerper", 10, 6)
    for sx in (-1, 1): kugel((sx * 0.12, 0.04, Z + 0.03), (0.05, 0.25, 0.1), GR, "koerper", 8, 5)                  # angelegte Flügel
    rohr((0, 0.22, Z), (0, 0.4, Z - 0.08), 0.06, GR, "koerper", 0.01)                                              # Schwanz
    for k in range(4): kristall((random.uniform(-.06, .06), 0.02 + k * 0.05, Z + 0.15), 0.025, 0.12, BL, "koerper", (random.uniform(-.4, .4), random.uniform(-.4, .4), 0))
    rohr((0, -0.2, Z + 0.06), (0, -0.25, Z + 0.3), 0.04, HE, "hals1"); rohr((0, -0.25, Z + 0.3), (0, -0.22, Z + 0.52), 0.035, HE, "hals2")
    kugel((0, -0.25, Z + 0.56), (0.06, 0.08, 0.06), GR, "kopf", 8, 5); rohr((0, -0.31, Z + 0.56), (0, -0.55, Z + 0.53), 0.022, SN, "kopf", 0.003)
    for sx in (-1, 1): kugel((sx * 0.04, -0.29, Z + 0.58), (0.012, 0.012, 0.012), AU, "kopf", 6, 4)
    kristall((0, -0.2, Z + 0.63), 0.02, 0.14, BL, "kopf", (math.radians(-55), 0, 0))                              # Splitterschopf
    for sx, S in ((1, "L"), (-1, "R")):
        rohr((sx * 0.06, 0.02, Z - 0.12), (sx * 0.06, 0.06, 0.45), 0.02, BE, "bein." + S); rohr((sx * 0.06, 0.06, 0.45), (sx * 0.06, 0.02, 0.02), 0.016, BE, "bein." + S)
        for a in (-0.5, 0, 0.5): rohr((sx * 0.06, 0.02, 0.01), (sx * 0.06 + 0.08 * math.sin(a), 0.02 - 0.09 * math.cos(a), 0.0), 0.008, BE, "bein." + S)
        knochen("bein." + S, (sx * 0.06, 0.02, Z - 0.1), (sx * 0.06, 0.02, 0.0), "koerper")
    knochen("wurzel", (0, 0, 0), (0, 0, 0.1)); knochen("koerper", (0, 0.2, Z), (0, -0.2, Z), "wurzel")
    knochen("hals1", (0, -0.2, Z + 0.06), (0, -0.25, Z + 0.3), "koerper"); knochen("hals2", (0, -0.25, Z + 0.3), (0, -0.22, Z + 0.52), "hals1"); knochen("kopf", (0, -0.23, Z + 0.53), (0, -0.5, Z + 0.54), "hals2")
elif ART in ("wolf", "rudelfuehrer", "fuchs", "graupelz"):
    G_ = {"rudelfuehrer": 1.22, "fuchs": 0.72, "graupelz": 1.35}.get(ART, 1.0)
    FARBEN = {"wolf": ((118, 108, 92), (176, 166, 148)), "rudelfuehrer": ((70, 66, 62), (120, 114, 106)), "fuchs": ((196, 98, 38), (236, 226, 210)), "graupelz": ((150, 148, 146), (206, 204, 200))}[ART]
    FE = mat("fell" + ART, FARBEN[0], 0.9); BA = mat("bauch" + ART, FARBEN[1], 0.9)
    NA = mat("nase", (25, 22, 20), 0.4); AU = mat("auge_w", (230, 190, 70), 0.3, 0, 0.6 if ART in ("rudelfuehrer", "graupelz") else 0.0); MA = mat("maehne" + ART, (52, 48, 44) if ART != "graupelz" else (96, 94, 92), 0.95)
    Z = 0.55 * G_
    kugel((0, 0.05 * G_, Z), (0.17 * G_, 0.42 * G_, 0.17 * G_), FE, "koerper", 12, 7); kugel((0, -0.18 * G_, Z - 0.05 * G_), (0.13 * G_, 0.18 * G_, 0.12 * G_), BA, "koerper", 10, 6)
    if ART in ("rudelfuehrer", "graupelz"):
        for k in range(7): kristall((random.uniform(-.08, .08) * G_, -0.2 * G_ + k * 0.06 * G_, Z + 0.14 * G_), 0.06 * G_, 0.18 * G_, MA, "koerper", (random.uniform(-.6, .6), 0.3, 0))   # Nackenmähne
    kugel((0, -0.5 * G_, Z + 0.1 * G_), (0.1 * G_, 0.13 * G_, 0.1 * G_), FE, "kopf", 10, 6); rohr((0, -0.58 * G_, Z + 0.07 * G_), (0, -0.74 * G_, Z + 0.03 * G_), 0.055 * G_, FE, "kopf", 0.03 * G_)
    kugel((0, -0.75 * G_, Z + 0.04 * G_), (0.025 * G_, 0.025 * G_, 0.022 * G_), NA, "kopf", 6, 4)
    for sx in (-1, 1):
        kristall((sx * 0.055 * G_, -0.47 * G_, Z + 0.21 * G_), 0.035 * G_, 0.1 * G_, FE, "kopf", (0, sx * 0.25, 0)); kugel((sx * 0.05 * G_, -0.6 * G_, Z + 0.13 * G_), (0.015, 0.015, 0.012), AU, "kopf", 6, 4)
    rohr((0, -0.62 * G_, Z - 0.0), (0, -0.72 * G_, Z - 0.02 * G_), 0.035 * G_, FE, "kiefer", 0.02 * G_)
    rohr((0, 0.45 * G_, Z + 0.05 * G_), (0, 0.78 * G_, Z - 0.12 * G_), 0.06 * G_, FE, "schwanz", (0.02 if ART != "fuchs" else 0.07) * G_)
    if ART == "fuchs": kugel((0, 0.8 * G_, Z - 0.13 * G_), (0.05 * G_, 0.08 * G_, 0.05 * G_), BA, "schwanz", 8, 5)                                  # weiße Schwanzspitze
    if ART == "graupelz":                                                                                                                     # Narbe über dem Auge
        rohr((0.075 * G_, -0.5 * G_, Z + 0.17 * G_), (0.085 * G_, -0.57 * G_, Z + 0.12 * G_), 0.005 * G_, mat("narbe", (170, 120, 110), 0.6), "kopf")
    for v_, S, sx, y in (("v", "L", 1, -0.25), ("v", "R", -1, -0.25), ("h", "L", 1, 0.32), ("h", "R", -1, 0.32)):
        b = f"bein{v_}.{S}"; rohr((sx * 0.08 * G_, y * G_, Z - 0.05 * G_), (sx * 0.08 * G_, y * G_ + 0.03, 0.18 * G_), 0.04 * G_, FE, b, 0.03 * G_)
        rohr((sx * 0.08 * G_, y * G_ + 0.03, 0.18 * G_), (sx * 0.08 * G_, y * G_ - 0.02, 0.02), 0.028 * G_, FE, b, 0.022 * G_); kugel((sx * 0.08 * G_, y * G_ - 0.04, 0.02), (0.035 * G_, 0.05 * G_, 0.02), FE, b, 6, 4)
        knochen(b, (sx * 0.08 * G_, y * G_, Z - 0.05 * G_), (sx * 0.08 * G_, y * G_, 0.0), "koerper")
    knochen("wurzel", (0, 0, 0), (0, 0, 0.1)); knochen("koerper", (0, 0.35 * G_, Z), (0, -0.35 * G_, Z), "wurzel")
    knochen("kopf", (0, -0.4 * G_, Z + 0.05 * G_), (0, -0.74 * G_, Z + 0.04 * G_), "koerper"); knochen("kiefer", (0, -0.6 * G_, Z), (0, -0.72 * G_, Z - 0.02 * G_), "kopf")
    knochen("schwanz", (0, 0.42 * G_, Z + 0.05 * G_), (0, 0.78 * G_, Z - 0.12 * G_), "koerper")
elif ART in ("wildschwein", "feldhase", "schaf"):                                                   # gleiche Knochen wie der Wolf → gleiche Bewegungen
    if ART == "wildschwein":
        FE = mat("borsten", (74, 58, 46), 0.95); BA = mat("schwbauch", (104, 86, 70), 0.9); NA = mat("ruessel", (150, 110, 100), 0.6); HZ = mat("hauer", (236, 228, 206), 0.4); AU = mat("auge_s", (20, 16, 14), 0.3)
        Z = 0.5; L0, LH, R_ = 0.42, 0.62, 0.24
        kugel((0, 0.05, Z), (0.26, 0.5, 0.27), FE, "koerper", 12, 7); kugel((0, -0.25, Z + 0.06), (0.25, 0.25, 0.28), FE, "koerper", 10, 6)
        for k in range(8): kristall((0, -0.35 + k * 0.08, Z + 0.24 - 0.01 * k), 0.04, 0.12, mat("kamm", (40, 32, 26), 0.95), "koerper", (0.4, 0, 0))   # Borstenkamm
        kugel((0, -0.52, Z), (0.17, 0.2, 0.17), FE, "kopf", 10, 6); rohr((0, -0.62, Z - 0.03), (0, -0.8, Z - 0.06), 0.09, FE, "kopf", 0.07)
        kugel((0, -0.82, Z - 0.06), (0.07, 0.025, 0.06), NA, "kopf", 8, 5)
        for sx in (-1, 1):
            kristall((sx * 0.09, -0.48, Z + 0.17), 0.05, 0.1, FE, "kopf", (0, sx * 0.5, 0)); kugel((sx * 0.08, -0.62, Z + 0.06), (0.015, 0.015, 0.015), AU, "kopf", 6, 4)
            kristall((sx * 0.07, -0.76, Z - 0.02), 0.015, 0.09, HZ, "kiefer", (math.radians(-30), sx * 0.3, 0))                                # Hauer
        rohr((0, -0.62, Z - 0.1), (0, -0.76, Z - 0.11), 0.05, BA, "kiefer", 0.04)
        rohr((0, 0.52, Z + 0.1), (0, 0.66, Z - 0.05), 0.02, FE, "schwanz", 0.01)
        beine = ((0.12, -0.25, 0.045), (0.12, 0.3, 0.05))
    elif ART == "feldhase":
        FE = mat("hasenfell", (150, 120, 84), 0.9); BA = mat("hasenbauch", (226, 216, 196), 0.9); NA = mat("hasennase", (120, 80, 80), 0.5); AU = mat("auge_h", (30, 20, 14), 0.2); HZ = FE
        Z = 0.2; L0, LH, R_ = 0.12, 0.16, 0.1
        kugel((0, 0.04, Z), (0.11, 0.2, 0.12), FE, "koerper", 10, 6); kugel((0, 0.12, Z - 0.02), (0.12, 0.12, 0.12), FE, "koerper", 10, 6)
        kugel((0, -0.17, Z + 0.07), (0.07, 0.09, 0.07), FE, "kopf", 10, 6)
        for sx in (-1, 1):
            kugel((sx * 0.03, -0.14, Z + 0.2), (0.022, 0.025, 0.1), FE, "kopf", 8, 5); kugel((sx * 0.03, -0.155, Z + 0.21), (0.012, 0.01, 0.075), BA, "kopf", 6, 4)   # Löffel
            kugel((sx * 0.05, -0.21, Z + 0.09), (0.012, 0.012, 0.012), AU, "kopf", 6, 4)
        kugel((0, -0.255, Z + 0.06), (0.012, 0.01, 0.01), NA, "kopf", 6, 4); kugel((0, -0.23, Z + 0.03), (0.035, 0.03, 0.025), BA, "kiefer", 6, 4)
        kugel((0, 0.26, Z + 0.02), (0.04, 0.04, 0.04), BA, "schwanz", 8, 5)                                                                      # Blume
        beine = ((0.06, -0.08, 0.02), (0.08, 0.14, 0.035))
    else:
        FE = mat("wolle", (232, 226, 210), 0.95); BA = FE; NA = mat("schafgesicht", (46, 40, 38), 0.6); AU = mat("auge_sch", (200, 170, 90), 0.3); HZ = NA
        Z = 0.55; L0, LH, R_ = 0.3, 0.42, 0.18
        for k in range(14): kugel((random.uniform(-.13, .13), random.uniform(-.25, .32), Z + random.uniform(-.05, .12)), (0.14, 0.14, 0.13), FE, "koerper", 8, 5)   # Wollbausch
        kugel((0, 0.03, Z), (0.22, 0.38, 0.22), FE, "koerper", 10, 6)
        kugel((0, -0.46, Z + 0.12), (0.08, 0.13, 0.09), NA, "kopf", 10, 6); kugel((0, -0.38, Z + 0.2), (0.1, 0.08, 0.06), FE, "kopf", 8, 5)
        for sx in (-1, 1): kugel((sx * 0.1, -0.4, Z + 0.15), (0.06, 0.025, 0.025), NA, "kopf", 6, 4); kugel((sx * 0.05, -0.52, Z + 0.16), (0.012, 0.012, 0.012), AU, "kopf", 6, 4)
        kugel((0, -0.56, Z + 0.06), (0.04, 0.03, 0.03), NA, "kiefer", 6, 4)
        kugel((0, 0.42, Z + 0.05), (0.05, 0.06, 0.06), FE, "schwanz", 6, 4)
        beine = ((0.1, -0.22, 0.03), (0.1, 0.25, 0.03))
    for v_, (bx, by, br) in zip("vh", beine):
        for S, sx in (("L", 1), ("R", -1)):
            b = f"bein{v_}.{S}"; rohr((sx * bx, by, Z - R_ * 0.4), (sx * bx, by, 0.02), br, NA if ART == "schaf" else FE, b, br * 0.75); kugel((sx * bx, by - 0.01, 0.015), (br, br * 1.3, br * 0.6), mat("huf", (40, 34, 30), 0.6) if ART != "feldhase" else FE, b, 6, 4)
            knochen(b, (sx * bx, by, Z - R_ * 0.4), (sx * bx, by, 0.0), "koerper")
    knochen("wurzel", (0, 0, 0), (0, 0, 0.1)); knochen("koerper", (0, LH, Z), (0, -LH, Z), "wurzel")
    kopf_y = {"wildschwein": (-0.42, -0.84), "feldhase": (-0.12, -0.26), "schaf": (-0.36, -0.58)}[ART]
    knochen("kopf", (0, kopf_y[0], Z + 0.04), (0, kopf_y[1], Z + 0.04), "koerper"); knochen("kiefer", (0, kopf_y[1] * 0.85, Z - 0.02), (0, kopf_y[1], Z - 0.03), "kopf")
    knochen("schwanz", (0, LH * 0.85, Z + 0.05), (0, LH * 1.1, Z - 0.05), "koerper")
elif ART == "bienen":                                                                                # Wildbienen-Schwarm: Gerüst des Grünlichts (kern, flamme, funken), statt Flammen Bienen
    GE = mat("biene_gelb", (230, 176, 40), 0.5); SW = mat("biene_schwarz", (30, 24, 20), 0.5); FL_ = mat("fluegel", (220, 230, 240), 0.2); Z = 1.0
    def biene(ort, kn, w=0.0):
        x, y, z = ort; kugel((x, y, z), (0.022, 0.035, 0.022), GE, kn, 6, 4); kugel((x, y + 0.02, z), (0.018, 0.02, 0.018), SW, kn, 6, 4); kugel((x, y - 0.035, z + 0.005), (0.014, 0.014, 0.014), SW, kn, 6, 4)
        for sx in (-1, 1): kugel((x + sx * 0.025, y - 0.005, z + 0.02), (0.022, 0.012, 0.003), FL_, kn, 6, 3)
    for k in range(5): biene((random.uniform(-.08, .08), random.uniform(-.08, .08), Z + random.uniform(-.08, .08)), "kern")
    for k in range(7): a = k / 7 * 2 * math.pi; biene((0.2 * math.cos(a), 0.2 * math.sin(a), Z + 0.15 + 0.08 * math.sin(2 * a)), "flamme")
    for k in range(9): a = k / 9 * 2 * math.pi; biene((0.36 * math.cos(a), 0.36 * math.sin(a), Z + 0.06 * math.sin(3 * a)), "funken")
    knochen("wurzel", (0, 0, 0), (0, 0, 0.1)); knochen("kern", (0, 0, Z - 0.15), (0, 0, Z + 0.15), "wurzel"); knochen("flamme", (0, 0, Z + 0.05), (0, 0, Z + 0.4), "kern"); knochen("funken", (0, 0, Z), (0, 0, Z + 0.2), "kern")
else:
    KE = mat("kern", (230, 255, 200), 0.2, 0, 4.0); FL = mat("flamme", (90, 255, 140), 0.3, 0, 2.6); FU = mat("funke", (170, 255, 190), 0.3, 0, 3.0)
    Z = 1.2
    kugel((0, 0, Z), (0.1, 0.1, 0.11), KE, "kern", 12, 7); kugel((0, 0, Z - 0.02), (0.16, 0.16, 0.13), FL, "kern", 10, 6)
    kristall((0, 0, Z + 0.3), 0.07, 0.6, FL, "flamme")
    for k in range(7):
        a = k / 7 * 2 * math.pi; kristall((0.08 * math.cos(a), 0.08 * math.sin(a), Z + 0.2), 0.075, 0.48 - 0.08 * (k % 3), FL, "flamme", (0.3 * math.sin(a), -0.3 * math.cos(a), 0))
    for k in range(6):
        a = k / 6 * 2 * math.pi; kugel((0.32 * math.cos(a), 0.32 * math.sin(a), Z + 0.05 * math.sin(3 * a)), (0.025, 0.025, 0.025), FU, "funken", 6, 4)
    knochen("wurzel", (0, 0, 0), (0, 0, 0.1)); knochen("kern", (0, 0, Z - 0.15), (0, 0, Z + 0.15), "wurzel"); knochen("flamme", (0, 0, Z + 0.05), (0, 0, Z + 0.4), "kern"); knochen("funken", (0, 0, Z), (0, 0, Z + 0.2), "kern")

VIERBEINER = ("wolf", "rudelfuehrer", "fuchs", "graupelz", "wildschwein", "feldhase", "schaf")
# ---- Skelett, Teile starr an ihre Knochen, ein Netz „koerper“
arm = bpy.data.objects.new("skelett", bpy.data.armatures.new("skelett")); bpy.context.collection.objects.link(arm)
bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode="EDIT")
for n, (k, e, el) in KN.items(): b = arm.data.edit_bones.new(n); b.head = Vector(k); b.tail = Vector(e)
for n, (k, e, el) in KN.items():
    if el: arm.data.edit_bones[n].parent = arm.data.edit_bones[el]
bpy.ops.object.mode_set(mode="OBJECT")
for o, kn in teile:
    bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)
    for p in o.data.polygons: p.use_smooth = ART != "krebs"
    g = o.vertex_groups.new(name=kn); g.add(list(range(len(o.data.vertices))), 1.0, "REPLACE")
bpy.ops.object.select_all(action="DESELECT")
for o, _ in teile: o.select_set(True)
bpy.context.view_layer.objects.active = teile[0][0]; bpy.ops.object.join(); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
ob = bpy.context.object; ob.name = "koerper"; ob["ebene"] = "koerper"; ob["art"] = "koerper"; ob.parent = arm; ob.modifiers.new("skelett", "ARMATURE").object = arm
print(ART, "–", len(ob.data.polygons), "Flächen")

# ---- Bewegungen
PB = arm.pose.bones; B = arm.data.bones
for b in PB: b.rotation_mode = "QUATERNION"
X, Y, Zx = (1, 0, 0), (0, 1, 0), (0, 0, 1)
def dreh(n, *schritte):
    R = B[n].matrix_local.to_quaternion(); q = Quaternion()
    for achse, grad in schritte: q = Quaternion(Vector(achse), math.radians(grad)) @ q
    PB[n].rotation_quaternion = R.inverted() @ q @ R
def ort(v): PB["wurzel"].location = (v[0], v[2], -v[1])
def gross(n, f): PB[n].scale = (f, f, f)
def nullen():
    for b in PB: b.rotation_quaternion = (1, 0, 0, 0); b.location = (0, 0, 0); b.scale = (1, 1, 1)
s_ = lambda t, k=1.0, ph=0.0: math.sin(2 * math.pi * k * t + ph)
glatt = lambda u: u * u * (3 - 2 * u)
if ART == "krebs":
    def beine(t, k=1.0):
        for i in range(4):
            for S, v in (("L", 1), ("R", -1)): dreh(f"bein{i}.{S}", (Y, v * 12 * s_(t, k, i * 1.6 + (0 if S == "L" else math.pi))), (Zx, 10 * s_(t, k, i * 1.6 + 1.5)))
    def ruhe(t):
        for S, v in (("L", 1), ("R", -1)): dreh("finger." + S, (Zx, v * 18 * max(0, s_(t, 2, 0 if S == "L" else 1)))); dreh("arm." + S, (X, 4 * s_(t)))
        ort((0, 0, 0.01 * s_(t)))
    def gehen(t): beine(t, 2); ort((0.03 * s_(t, 2), 0, 0.015 * abs(s_(t, 2)))); dreh("koerper", (Y, 4 * s_(t, 2)))
    def angriff(t):
        w = math.sin(math.pi * min(1, t / 0.45)) if t < 0.45 else 0.0; h = math.sin(math.pi * min(1, max(0, (t - 0.4) / 0.4)))
        for S, v in (("L", 1), ("R", -1)): dreh("arm." + S, (X, 35 * w - 25 * h), (Zx, -v * 20 * h)); dreh("finger." + S, (Zx, v * 30 * w))
        dreh("koerper", (X, -6 * w + 8 * h)); ort((0, -0.08 * h, 0))
    def treffer(t): w = math.sin(math.pi * t); dreh("koerper", (X, -10 * w), (Y, 8 * w)); ort((0, 0.08 * w, 0.03 * w))
    def tod(t):
        f = glatt(min(1.0, t / 0.6)); dreh("koerper", (Y, 180 * f)); ort((0, 0, 0.28 * math.sin(math.pi * f) + 0.3 * f))
        for i in range(4):
            for S in "LR": dreh(f"bein{i}.{S}", (X, 25 * f * s_(t, 3, i)))
    BW = {"ruhe": (ruhe, 16, 10, True, {}), "gehen": (gehen, 12, 12, True, {}), "angriff": (angriff, 10, 12, False, {"treffer": 5}), "treffer": (treffer, 6, 14, False, {}), "tod": (tod, 12, 12, False, {"halten": 11})}
elif ART == "reiher":
    def ruhe(t): dreh("hals1", (X, 4 * s_(t))); dreh("kopf", (Zx, 12 * s_(t, 1, 1)) if t > 0.5 else (X, 0)); ort((0, 0, 0.005 * s_(t, 2)))
    def gehen(t):
        dreh("bein.L", (X, 26 * s_(t))); dreh("bein.R", (X, -26 * s_(t))); dreh("hals1", (X, 10 * s_(t, 2))); dreh("kopf", (X, -10 * s_(t, 2))); ort((0, 0, 0.02 * abs(s_(t))))
    def angriff(t):
        zu = glatt(min(1.0, t / 0.4)) if t < 0.5 else 1 - glatt(min(1.0, (t - 0.5) / 0.15)); vor = math.sin(math.pi * min(1.0, max(0.0, (t - 0.45) / 0.45)))
        dreh("hals1", (X, -30 * zu + 45 * vor)); dreh("hals2", (X, -20 * zu + 35 * vor)); dreh("kopf", (X, 10 * zu - 25 * vor)); dreh("koerper", (X, 10 * vor)); ort((0, -0.08 * vor, 0))
    def treffer(t): w = math.sin(math.pi * t); dreh("koerper", (X, -12 * w)); dreh("hals1", (X, -25 * w)); dreh("kopf", (X, 20 * w)); ort((0, 0.06 * w, 0))
    def tod(t):
        f = glatt(min(1.0, t / 0.7)); dreh("wurzel", (Y, 85 * f)); dreh("hals1", (X, 40 * f)); dreh("hals2", (X, 30 * f)); dreh("bein.L", (X, -30 * f)); ort((0, 0, -0.85 * f * 0))
    BW = {"ruhe": (ruhe, 16, 8, True, {}), "gehen": (gehen, 10, 10, True, {}), "angriff": (angriff, 12, 12, False, {"treffer": 6}), "treffer": (treffer, 6, 14, False, {}), "tod": (tod, 12, 12, False, {"halten": 11})}
elif ART in VIERBEINER:
    def bein(f, vorn, hinten):
        for S, v in (("L", 1), ("R", -1)): dreh("beinv." + S, (X, vorn * v * f)); dreh("beinh." + S, (X, -hinten * v * f))
    def ruhe(t): dreh("kopf", (X, 4 * s_(t)), (Zx, 10 * s_(t, 0.5))); dreh("schwanz", (Zx, 12 * s_(t, 1.5))); ort((0, 0, 0.005 * s_(t, 2)))
    def gehen(t): bein(s_(t), 22, 22); dreh("kopf", (X, 4 * s_(t, 2))); dreh("schwanz", (Zx, 10 * s_(t))); ort((0, 0, 0.012 * abs(s_(t))))
    def laufen(t):
        f = s_(t); dreh("beinv.L", (X, 40 * f)); dreh("beinv.R", (X, 34 * f)); dreh("beinh.L", (X, -40 * f)); dreh("beinh.R", (X, -34 * f))
        dreh("koerper", (X, 6 * f)); dreh("kopf", (X, -8 * f)); dreh("schwanz", (X, -20)); ort((0, 0, 0.06 * max(0.0, s_(t, 1, 0.5))))
    def angriff(t):
        zurueck = math.sin(math.pi * min(1, t / 0.35)) if t < 0.35 else 0.0; sprung = math.sin(math.pi * min(1, max(0, (t - 0.3) / 0.5)))
        dreh("koerper", (X, 10 * zurueck - 12 * sprung)); dreh("kopf", (X, -10 * zurueck + 14 * sprung)); dreh("kiefer", (X, 35 * sprung))
        bein(1, -25 * sprung + 10 * zurueck, 20 * sprung); ort((0, -0.25 * sprung, 0.12 * sprung - 0.04 * zurueck))
    def treffer(t): w = math.sin(math.pi * t); dreh("koerper", (X, -8 * w), (Y, 10 * w)); dreh("kopf", (X, 12 * w)); ort((0, 0.1 * w, 0))
    def heulen(t): w = math.sin(math.pi * min(1, t / 0.3)) if t < 0.85 else math.sin(math.pi * (1 - t) / 0.3); dreh("kopf", (X, -55 * w)); dreh("kiefer", (X, 25 * w)); dreh("koerper", (X, -10 * w))
    def tod(t): f = glatt(min(1.0, t / 0.6)); dreh("wurzel", (Y, 90 * f)); dreh("kopf", (X, 15 * f)); ort((0, 0, 0.0)); bein(f, 15, 15)
    def fressen(t): w = min(1.0, math.sin(math.pi * t) * 1.6); dreh("kopf", (X, 45 * w)); dreh("kiefer", (X, 12 * max(0, s_(t, 4)) * w)); dreh("schwanz", (Zx, 10 * s_(t, 2)))
    BW = {"ruhe": (ruhe, 16, 8, True, {}), "gehen": (gehen, 10, 10, True, {}), "laufen": (laufen, 8, 12, True, {}), "angriff": (angriff, 10, 12, False, {"treffer": 6}),
          "treffer": (treffer, 6, 14, False, {}), "tod": (tod, 12, 12, False, {"halten": 11})}
    if ART in ("rudelfuehrer", "graupelz"): BW["heulen"] = (heulen, 20, 10, False, {})
    if ART == "schaf": del BW["angriff"]; BW["fressen"] = (fressen, 16, 8, True, {})                    # Stimmungstier: grast statt anzugreifen
else:
    def flackern(t, f=1.0): gross("flamme", f * (1 + 0.12 * s_(t, 3) + 0.06 * s_(t, 7, 1))); dreh("flamme", (Zx, 40 * s_(t)))
    def ruhe(t): ort((0, 0, 0.1 * s_(t))); flackern(t); dreh("funken", (Zx, 360 * t)); gross("kern", 1 + 0.05 * s_(t, 2))
    def angriff(t):
        z = math.sin(math.pi * min(1, t / 0.4)) if t < 0.4 else 0.0; a = math.sin(math.pi * min(1, max(0, (t - 0.35) / 0.5)))
        gross("kern", 1 - 0.3 * z + 0.4 * a); flackern(t, 1 - 0.4 * z + 0.7 * a); dreh("funken", (Zx, 720 * t)); gross("funken", 1 - 0.4 * z + 0.6 * a); ort((0, -0.15 * a, 0))
    def heilen(t): w = math.sin(math.pi * t); gross("funken", 1 + 1.4 * w); dreh("funken", (Zx, -540 * t)); flackern(t, 1 + 0.3 * w); ort((0, 0, 0.2 * w))
    def treffer(t): w = math.sin(math.pi * t); gross("kern", 1 - 0.25 * w); flackern(t, 1 - 0.5 * w); ort((0, 0.12 * w, 0))
    def tod(t): f = glatt(min(1.0, t / 0.8)); gross("kern", max(0.01, 1 - f)); gross("flamme", max(0.01, 1 - f * 1.2)); gross("funken", 1 + 1.5 * f); ort((0, 0, -0.9 * f))
    BW = {"ruhe": (ruhe, 16, 10, True, {}), "angriff": (angriff, 10, 12, False, {"treffer": 5}), "heilen": (heilen, 14, 10, False, {}), "treffer": (treffer, 6, 14, False, {}), "tod": (tod, 12, 10, False, {"halten": 11})}
    if ART == "bienen": del BW["heilen"]
arm.animation_data_create()
for name, (fn, n, rate, schleife, mehr) in BW.items():
    a = bpy.data.actions.new(name); a.use_fake_user = True; arm.animation_data.action = a; k = n + 1 if schleife else n
    for i in range(k):
        nullen(); fn(i / n if schleife else i / (n - 1))
        for b in PB: b.keyframe_insert("rotation_quaternion", frame=i + 1, group=b.name); b.keyframe_insert("scale", frame=i + 1, group=b.name)
        PB["wurzel"].keyframe_insert("location", frame=i + 1, group="wurzel")
    a["bilder"] = k; a["rate"] = rate; a["schleife"] = schleife; a["mehr"] = json.dumps(mehr); print("Bewegung:", name, k, "Bilder")
arm.animation_data.action = bpy.data.actions["ruhe"]; bpy.context.scene.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(ZIEL)); print("geschrieben:", ZIEL)
