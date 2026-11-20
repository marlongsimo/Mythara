"""Mythara Fabrik – eine geriggte Figur in acht Richtungen rendern und als Bildblätter fürs Spiel ausgeben.

  python3 fabrik/rendern.py <figur.blend> <export-ordner> <asset-id> [feld=176]

Je Bewegung der Figur entsteht ein Blatt: Zeilen = Richtungen (O, SO, S, SW, W, NW, N, NO – 0 = Osten, im Uhrzeigersinn am Bildschirm, y nach unten),
Spalten = Bilder der Bewegung. Dazu <id>.json mit Feldgröße, Fußpunkt, Maßen und Bewegungen, und <id>.vorschau.gif zur Kontrolle.
Nichts ist gespiegelt: jede Richtung wird eigens gerendert. Die Figur dreht sich, Kamera und Licht bleiben stehen.
Der Fußpunkt (Ursprung des Modells) liegt in jedem Bild auf demselben Bildpunkt.
"""
import json, math, os, sys
import numpy as np
import bpy
from PIL import Image

quelle, ziel, kennung = sys.argv[1], sys.argv[2], sys.argv[3]; FELD = int(sys.argv[4]) if len(sys.argv) > 4 else 176
RICHTUNGEN = ["o", "so", "s", "sw", "w", "nw", "n", "no"]; NEIGUNG = 35.0; BREITE_M = 2.05; FUSS = (0.5, 0.92); UEBER = 2     # Kamera laut Stilstandard; intern doppelt gerendert
RATE = {"ruhe": 6, "laufen": 11}

bpy.ops.wm.open_mainfile(filepath=quelle); sc = bpy.context.scene; arm = bpy.data.objects["skelett"]; os.makedirs(ziel, exist_ok=True)
sc.render.engine = "CYCLES"; sc.cycles.samples = 24; sc.cycles.device = "CPU"; sc.render.film_transparent = True; sc.render.resolution_x = sc.render.resolution_y = FELD * UEBER
sc.render.image_settings.file_format = "PNG"; sc.render.image_settings.color_mode = "RGBA"; sc.view_settings.view_transform = "Standard"
n = math.radians(NEIGUNG); h = (FUSS[1] - 0.5) * BREITE_M / math.cos(n)                                                    # die Kamera zielt so hoch über den Boden, dass der Ursprung auf dem Fußpunkt landet
cam = bpy.data.objects.new("kamera", bpy.data.cameras.new("kamera")); sc.collection.objects.link(cam); cam.data.type = "ORTHO"; cam.data.ortho_scale = BREITE_M
cam.location = (0, -10 * math.cos(n), h + 10 * math.sin(n)); cam.rotation_euler = (math.radians(90) - n, 0, 0); sc.camera = cam
for name, rot, staerke in [("haupt", (50, 0, -40), 5.0), ("fuell", (65, 0, 60), 1.6), ("rand", (-40, 0, 170), 1.2)]:
    l = bpy.data.objects.new(name, bpy.data.lights.new(name, "SUN")); l.data.energy = staerke; l.data.angle = math.radians(12); l.rotation_euler = tuple(math.radians(v) for v in rot); sc.collection.objects.link(l)
welt = bpy.data.worlds.new("welt"); sc.world = welt; welt.use_nodes = True; welt.node_tree.nodes["Background"].inputs[1].default_value = 1.3

meta = {"id": kennung, "feld": FELD, "richtungen": RICHTUNGEN, "winkel0": "osten", "drehsinn": "im Uhrzeigersinn am Bildschirm (y nach unten)", "zeile": "round(winkel / (pi/4)) mod 8",
        "fuss": list(FUSS), "kamera": {"neigung": NEIGUNG, "breite_m": BREITE_M}, "animationen": {}}
tmp = os.path.join(ziel, ".bild.png"); blaetter = {}; oben, unten = FELD, 0
for akt in [a for a in bpy.data.actions if a.get("bilder")]:
    bilder = int(akt["bilder"]); arm.animation_data.action = akt; blatt = Image.new("RGBA", (FELD * bilder, FELD * 8), (0, 0, 0, 0))
    for r in range(8):
        arm.rotation_euler = (0, 0, math.radians(90 - 45 * r))
        for b in range(bilder):
            sc.frame_set(b + 1); sc.render.filepath = tmp; bpy.ops.render.render(write_still=True); im = Image.open(tmp).convert("RGBA").resize((FELD, FELD), Image.LANCZOS); blatt.paste(im, (b * FELD, r * FELD))
            zeilen = np.where(np.asarray(im)[..., 3].max(1) > 40)[0]; oben, unten = min(oben, int(zeilen.min())), max(unten, int(zeilen.max()))
    name = f"{kennung}.{akt.name}"; blatt.save(os.path.join(ziel, name + ".png")); blatt.save(os.path.join(ziel, name + ".webp"), quality=88, method=6); blaetter[akt.name] = blatt
    meta["animationen"][akt.name] = {"blatt": name + ".webp", "bilder": bilder, "rate": RATE.get(akt.name, 10), "schleife": True}; print("Blatt:", name, blatt.size, flush=True)
os.remove(tmp)
meta["mass"] = [FUSS[0], FUSS[1], round(1.8 * math.cos(n) / BREITE_M, 3)]                                                    # wie laufMass im Spiel: Mitte x, Bodenlinie y, Körperhöhe – als Anteile des Feldes
meta["rahmen"] = {"oben": oben, "unten": unten}
json.dump(meta, open(os.path.join(ziel, kennung + ".json"), "w"), ensure_ascii=False, indent=1)

# Vorschau: alle acht Richtungen nebeneinander, erst Ruhe, dann Laufen
Z = 1.5; grund = (52, 44, 60, 255); folge = []
for name, wdh in (("ruhe", 1), ("laufen", 3)):
    if name not in blaetter: continue
    bl = blaetter[name]; nb = bl.width // FELD
    for _ in range(wdh):
        for b in range(nb):
            k = Image.new("RGBA", (FELD * 4, FELD * 2), grund)
            for r in range(8): k.alpha_composite(bl.crop((b * FELD, r * FELD, (b + 1) * FELD, (r + 1) * FELD)), (r % 4 * FELD, r // 4 * FELD))
            folge.append((k.convert("RGB").resize((round(FELD * 4 * Z), round(FELD * 2 * Z)), Image.LANCZOS).quantize(96), 1000 // meta["animationen"][name]["rate"]))
folge[0][0].save(os.path.join(ziel, kennung + ".vorschau.gif"), save_all=True, append_images=[f for f, _ in folge[1:]], duration=[d for _, d in folge], loop=0)
print("geschrieben:", ziel)
