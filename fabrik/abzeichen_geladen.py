"""Mythara Fabrik – Abzeichen „(s)“ für geladene Waffen (Splitterbinden, Phase 5b): klein in die Ecke des Rucksackbilds.

  python3 fabrik/abzeichen_geladen.py [rucksackbild.webp …]

Schreibt img/echtzeit/abzeichen_geladen.webp (64 × 64, durchsichtig): runder dunkler Grund mit Goldrand wie die neuen Symbole (#30),
darin ein violetter Splitter mit Lichthof und ein „s“. Das Spiel legt es per CSS über die rechte untere Ecke des Fachs (≈ 40 % der Fachbreite).
Mit Bildpfaden als Argument zusätzlich je eine Vorschau <bild>.geladen.png (Abzeichen unten rechts aufgelegt) im Scratch-Ordner fabrik/assets/splitterbinden/vorschau/.
"""
import os, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); N = 256
GOLD, GOLD_HELL, GRUND, VIOLETT, KRISTALL = (231, 178, 74), (255, 217, 138), (22, 16, 12), (155, 92, 255), (222, 202, 255)
b = Image.new("RGBA", (N, N), (0, 0, 0, 0)); d = ImageDraw.Draw(b)
d.ellipse((10, 10, N - 10, N - 10), fill=(*GRUND, 245)); d.ellipse((10, 10, N - 10, N - 10), outline=(*GOLD, 255), width=14); d.ellipse((28, 28, N - 28, N - 28), outline=(*GOLD_HELL, 90), width=3)
hof = Image.new("RGBA", (N, N), (0, 0, 0, 0)); ImageDraw.Draw(hof).ellipse((60, 40, 196, 176), fill=(*VIOLETT, 170)); b.alpha_composite(hof.filter(ImageFilter.GaussianBlur(18)))
d = ImageDraw.Draw(b)
d.polygon([(110, 46), (140, 96), (110, 148), (80, 96)], fill=(*VIOLETT, 255)); d.polygon([(110, 58), (128, 96), (110, 136), (96, 96)], fill=(*KRISTALL, 255))   # Splitter
schrift = None
for f in ("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"):
    if os.path.exists(f): schrift = ImageFont.truetype(f, 92); break
schrift = schrift or ImageFont.load_default()
d.text((172, 168), "s", font=schrift, fill=(*GOLD_HELL, 255), anchor="mm", stroke_width=6, stroke_fill=(*GRUND, 255))
ziel = os.path.join(W, "img/echtzeit/abzeichen_geladen.webp"); os.makedirs(os.path.dirname(ziel), exist_ok=True)
b.resize((64, 64), Image.LANCZOS).save(ziel, "WEBP", quality=92); print("Abzeichen:", ziel)
for p in sys.argv[1:]:                                                                           # Vorschau: auf ein Rucksackbild legen
    im = Image.open(p).convert("RGBA"); g = round(im.width * 0.4); a = b.resize((g, g), Image.LANCZOS); im.alpha_composite(a, (im.width - g - 4, im.height - g - 4))
    o = os.path.join(W, "fabrik/assets/splitterbinden/vorschau", os.path.basename(p).rsplit(".", 1)[0] + ".geladen.png"); os.makedirs(os.path.dirname(o), exist_ok=True); im.save(o); print("Vorschau:", o)
