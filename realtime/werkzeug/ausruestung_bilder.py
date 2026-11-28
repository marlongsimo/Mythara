"""Rucksack-Bilder für Waffen und Rüstungen aus den Vorschaubildern der Figuren-Fabrik.
Jedes fabrik/assets/…/datenblatt.json nennt seinen Gegenstand („gegenstand“); daneben liegt vorschau.png (freigestellt).
Daraus: img/objekte3d/ausruestung/bilder/<id>.webp (256 × 256, mittig; lange Waffen schräg) und shared/gegenstand_bilder.ts (id → Bild).
Gegenstände mit eigenem „bild“ in gegenstaende.ts behalten es. Aufruf (im Ordner realtime): python3 werkzeug/ausruestung_bilder.py"""
import json, glob, os
from PIL import Image
WURZEL = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
ZIEL = "img/objekte3d/ausruestung/bilder/"
os.makedirs(os.path.join(WURZEL, ZIEL), exist_ok=True)
bilder = {}
for f in sorted(glob.glob(os.path.join(WURZEL, "fabrik/assets/**/datenblatt.json"), recursive=True)):
    try: g = json.load(open(f)).get("gegenstand")
    except Exception: continue
    v = os.path.join(os.path.dirname(f), "vorschau.png")
    if not g or g in bilder or not os.path.exists(v): continue
    im = Image.open(v).convert("RGBA"); box = im.getchannel("A").point(lambda a: 255 if a > 12 else 0).getbbox()
    if not box: continue
    im = im.crop(box)
    if im.height > 2.2 * im.width: im = im.rotate(-45, resample=Image.BICUBIC, expand=True); im = im.crop(im.getchannel("A").point(lambda a: 255 if a > 12 else 0).getbbox())  # lange Waffen schräg legen: füllen das Fach besser
    f2 = 232 / max(im.size); im = im.resize((max(1, round(im.width * f2)), max(1, round(im.height * f2))), Image.LANCZOS)
    c = Image.new("RGBA", (256, 256), (0, 0, 0, 0)); c.paste(im, ((256 - im.width) // 2, (256 - im.height) // 2), im)
    c.save(os.path.join(WURZEL, ZIEL, g + ".webp"), quality=88); bilder[g] = ZIEL + g + ".webp"
with open(os.path.join(WURZEL, "realtime/shared/gegenstand_bilder.ts"), "w") as o:
    o.write("/* Erzeugt von werkzeug/ausruestung_bilder.py aus den Vorschaubildern der Figuren-Fabrik – nicht von Hand ändern. Rucksack-Bild je Gegenstand-ID. */\n")
    o.write("export const BILDER_AUS_FABRIK: Record<string, string> = " + json.dumps(bilder, indent=1, ensure_ascii=False) + ";\n")
print(len(bilder), "Bilder")
