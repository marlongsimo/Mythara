"""Mythara Fabrik – ein Körpermodell ohne Bild-zu-3D-Dienst: Hülle aus drei Ansichten.

  python3 fabrik/huelle.py fabrik/assets/<asset-id> [version=v001]

Braucht die freigestellten Ansichten aus referenz/teile/ (koerper-vorn, koerper-seite, koerper-hinten) und Blender als Python-Paket (bpy).
Schreibt <version>/quelle/huelle.glb (Modell mit Textur), <version>/quelle/huelle-textur.png und <version>/arbeit/rundum.png (acht Richtungen).

So entsteht die Form: Der Umriss von vorn legt fest, wo Körper ist. Je Bildzeile bekommt jedes zusammenhängende Stück (Rumpf, Arm, Bein) einen
runden Querschnitt; wie tief er ist, sagt die Seitenansicht in derselben Höhe. Vorder- und Rückseite sind zwei Flächen, die am Umriss zusammenlaufen.
Die Vorderansicht wird auf die vordere Fläche gelegt, die gespiegelte Rückansicht auf die hintere.

Grenzen: Die Form ist eine Näherung. Was die Seitenansicht verdeckt (Arme vor dem Rumpf), wird geschätzt; Überhänge (Nase, Schulterplatten, Taschen)
gibt es nicht; an den Flanken wird die Textur gestreckt. Für kleine Spielfiguren gedacht, nicht für Nahaufnahmen.
"""
import math, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

HOEHE_PX = 640       # Rechenhöhe der Figur in Bildpunkten
HOEHE_M = 1.80       # Körpermaß laut Stilstandard
SCHRITT = 2          # jeder wievielte Bildpunkt wird ein Punkt des Netzes
RICHTUNGEN = ["o", "so", "s", "sw", "w", "nw", "n", "no"]   # 0 = Osten, im Uhrzeigersinn am Bildschirm


def ansicht(pfad, spiegeln=False):
    """freigestelltes Bild, auf die Figur beschnitten und auf die Rechenhöhe gebracht -> (rgb, maske)"""
    im = Image.open(pfad).convert("RGBA"); im = im.crop(im.split()[3].point(lambda v: 255 if v > 128 else 0).getbbox())
    if spiegeln: im = im.transpose(Image.FLIP_LEFT_RIGHT)
    im = im.resize((max(1, round(im.width * HOEHE_PX / im.height)), HOEHE_PX), Image.LANCZOS); a = np.asarray(im)
    return a[..., :3].copy(), a[..., 3] > 128


def auffuellen(rgb, maske):
    """Farbe über den Rand der Figur hinaus fortsetzen, damit an der Naht kein Loch in der Textur entsteht"""
    idx = ndimage.distance_transform_edt(~maske, return_distances=False, return_indices=True); return rgb[idx[0], idx[1]]


def form(vorn, seite):
    """Höhenfelder der vorderen und hinteren Fläche (in Bildpunkten, + = nach vorn) über der Vorderansicht"""
    H, W = vorn.shape; zv = np.zeros((H, W), np.float32); zh = np.zeros((H, W), np.float32)
    kopf = np.where(seite[: int(H * 0.10)].any(0))[0]; null = (kopf.min() + kopf.max()) / 2          # Tiefe 0 = Mitte des Kopfes
    for z in range(H):
        s = np.where(seite[z])[0]
        if len(s) == 0: continue
        tief = (s.max() - s.min() + 1) / 2; mitte = (s.min() + s.max()) / 2 - null                   # Seitenansicht blickt nach rechts: rechts = vorn
        lab, n = ndimage.label(vorn[z]); laeufe = [np.where(lab == i + 1)[0] for i in range(n)]; breit = max((len(l) for l in laeufe), default=0)
        for l in laeufe:
            a = len(l) / 2; c = (l[0] + l[-1]) / 2; haupt = len(l) >= 0.6 * breit
            b = min(tief, 1.1 * a) if not haupt else min(tief, max(0.55 * a, 0.06 * H)); m = mitte * 0.5      # Rumpf flacher als breit; die Seitenansicht (mit Umhang) ist nur die Obergrenze
            u = np.clip((l - c) / max(a, 0.5), -1, 1); r = b * np.sqrt(1 - u * u); zv[z, l] = m + r; zh[z, l] = m - r
    g = ndimage.gaussian_filter(vorn.astype(np.float32), 2.5) + 1e-6                                 # glätten, nur innerhalb des Umrisses
    zv = ndimage.gaussian_filter(zv * vorn, 2.5) / g; zh = ndimage.gaussian_filter(zh * vorn, 2.5) / g
    rand = np.clip((ndimage.distance_transform_edt(vorn) - 1) / 4.0, 0, 1) ** 0.5; mitte = (zv + zh) / 2   # am Umriss laufen beide Flächen zusammen
    return mitte + (zv - mitte) * rand, mitte + (zh - mitte) * rand


def netz(vorn, zv, zh):
    H, W = vorn.shape; ys = np.arange(0, H, SCHRITT); xs = np.arange(0, W, SCHRITT); m = vorn[np.ix_(ys, xs)]; nr = -np.ones(m.shape, int); nr[m] = np.arange(m.sum()); n = int(m.sum())
    jj, ii = np.where(m); px = xs[ii].astype(np.float32); pz = ys[jj].astype(np.float32); k = HOEHE_M / HOEHE_PX
    kante = (m & ~ndimage.binary_erosion(m, np.ones((3, 3), bool)))[jj, ii]; mitte = ((zv + zh) / 2)[ys[jj], xs[ii]]   # äußerste Punkte des Netzes: vorn und hinten an derselben Stelle, damit die Naht schließt
    def punkte(feld): return np.stack([(px - W / 2) * k, -np.where(kante, mitte, feld[ys[jj], xs[ii]]) * k, (H - pz) * k], 1)            # Blender: x rechts, -y vorn, z oben
    P = np.concatenate([punkte(zv), punkte(zh)]); uv = np.concatenate([np.stack([px / W / 2, 1 - pz / H], 1), np.stack([0.5 + px / W / 2, 1 - pz / H], 1)])
    q = m[:-1, :-1] & m[1:, :-1] & m[:-1, 1:] & m[1:, 1:]; a, b, c, d = nr[:-1, :-1][q], nr[1:, :-1][q], nr[1:, 1:][q], nr[:-1, 1:][q]
    F = np.concatenate([np.stack([a, b, c, d], 1), np.stack([d + n, c + n, b + n, a + n], 1)])               # vorn und hinten, beide nach außen gerichtet
    return P, F, uv


def blender(P, F, uv, textur, ziel_glb, ziel_bild, feld=256):
    import bpy
    bpy.ops.wm.read_factory_settings(use_empty=True)
    me = bpy.data.meshes.new("koerper"); me.from_pydata(P.tolist(), [], F.tolist()); me.update(); ob = bpy.data.objects.new("koerper", me); bpy.context.collection.objects.link(ob)
    lage = me.uv_layers.new(name="uv"); ecken = np.zeros(len(me.loops), int); me.loops.foreach_get("vertex_index", ecken); lage.data.foreach_set("uv", uv[ecken].astype(np.float32).ravel())
    bpy.context.view_layer.objects.active = ob; ob.select_set(True); bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT"); bpy.ops.mesh.remove_doubles(threshold=0.0015)
    bpy.ops.mesh.normals_make_consistent(inside=False); bpy.ops.object.mode_set(mode="OBJECT"); bpy.ops.object.shade_smooth()
    mat = bpy.data.materials.new("koerper"); mat.use_nodes = True; nt = mat.node_tree; bsdf = nt.nodes["Principled BSDF"]; tex = nt.nodes.new("ShaderNodeTexImage"); tex.image = bpy.data.images.load(textur)
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"]); bsdf.inputs["Roughness"].default_value = 0.9; me.materials.append(mat)
    print("Netz:", len(me.vertices), "Punkte,", len(me.polygons), "Flächen")
    bpy.ops.export_scene.gltf(filepath=ziel_glb, export_format="GLB")
    # Rundumansicht nach Stilstandard: Kamera schräg von vorn oben, die Figur dreht sich, das Licht bleibt stehen
    sc = bpy.context.scene; sc.render.engine = "CYCLES"; sc.cycles.samples = 24; sc.cycles.device = "CPU"; sc.render.film_transparent = True; sc.render.resolution_x = sc.render.resolution_y = feld
    sc.render.image_settings.file_format = "PNG"; sc.render.image_settings.color_mode = "RGBA"; sc.view_settings.view_transform = "Standard"
    n = math.radians(35); cam = bpy.data.objects.new("kamera", bpy.data.cameras.new("kamera")); sc.collection.objects.link(cam); cam.data.type = "ORTHO"; cam.data.ortho_scale = 2.3
    cam.location = (0, -10 * math.cos(n), 0.9 + 10 * math.sin(n)); cam.rotation_euler = (math.radians(90) - n, 0, 0); sc.camera = cam
    for name, rot, staerke in [("haupt", (50, 0, -40), 4.0), ("fuell", (65, 0, 60), 1.0), ("rand", (-40, 0, 170), 1.2)]:
        l = bpy.data.objects.new(name, bpy.data.lights.new(name, "SUN")); l.data.energy = staerke; l.data.angle = math.radians(12); l.rotation_euler = tuple(math.radians(v) for v in rot); sc.collection.objects.link(l)
    welt = bpy.data.worlds.new("welt"); sc.world = welt; welt.use_nodes = True; welt.node_tree.nodes["Background"].inputs[1].default_value = 1.0
    bogen = Image.new("RGBA", (feld * 8, feld), (52, 44, 60, 255))
    for i in range(8):
        ob.rotation_euler = (0, 0, math.radians(90 - 45 * i)); sc.render.filepath = ziel_bild + f".{RICHTUNGEN[i]}.png"; bpy.ops.render.render(write_still=True)
        bogen.alpha_composite(Image.open(sc.render.filepath), (i * feld, 0)); os.remove(sc.render.filepath)
    bogen.convert("RGB").save(ziel_bild)


def main(ordner, version="v001"):
    t = os.path.join(ordner, "referenz", "teile"); quelle = os.path.join(ordner, version, "quelle"); arbeit = os.path.join(ordner, version, "arbeit"); os.makedirs(quelle, exist_ok=True); os.makedirs(arbeit, exist_ok=True)
    rgb_v, vorn = ansicht(os.path.join(t, "koerper-vorn.png")); _, seite = ansicht(os.path.join(t, "koerper-seite.png")); rgb_h, hinten = ansicht(os.path.join(t, "koerper-hinten.png"), spiegeln=True)
    H, W = vorn.shape; vorn = ndimage.binary_fill_holes(vorn)
    hb = Image.fromarray(np.dstack([auffuellen(rgb_h, hinten), hinten.astype(np.uint8) * 255]), "RGBA").resize((W, H), Image.LANCZOS)   # Rückansicht auf die Breite der Vorderansicht bringen
    hb = np.asarray(hb); rgb_h, hinten = hb[..., :3], hb[..., 3] > 128
    tex = Image.new("RGB", (2 * W, H)); tex.paste(Image.fromarray(auffuellen(rgb_v, vorn)), (0, 0)); tex.paste(Image.fromarray(auffuellen(rgb_h, hinten & vorn if (hinten & vorn).any() else hinten)), (W, 0))
    textur = os.path.join(quelle, "huelle-textur.png"); tex.save(textur)
    zv, zh = form(vorn, seite); P, F, uv = netz(vorn, zv, zh)
    print("Umriss", W, "x", H, "· größte Tiefe", round(float((zv - zh).max()) * HOEHE_M / HOEHE_PX, 2), "m · Deckung Rück- auf Vorderansicht", round(float((hinten & vorn).sum() / vorn.sum()), 2))
    blender(P, F, uv, textur, os.path.join(quelle, "huelle.glb"), os.path.join(arbeit, "rundum.png"))


if __name__ == "__main__": main(*sys.argv[1:3])
