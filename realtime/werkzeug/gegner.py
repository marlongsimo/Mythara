"""Mythara Echtzeit – ein Gegner-Bildblatt aufbereiten und vermessen.

  python3 -I werkzeug/gegner.py <quelle> <ziel.webp> <spalten> <zeilen> [schweben]

Entfernt Trennlinien zwischen den Feldern, stellt frei (durchsichtige Vorlage: Farbsäume weg; weiße Vorlage: Papier und Schlagschatten weg),
ruft blatt.py und nennt die Maße fürs Spiel: [Mitte x, Bodenlinie y, Körperhöhe] als Anteile des Feldes, gemessen am ersten Bild.
schweben: so viele Bildpunkte schwebt die Figur über dem Boden.
Ein GIF wird Bild für Bild zu einem Blatt zusammengesetzt.
"""
import ast, os, re, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

quelle, ziel, sp, ze = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]); schweben = float(sys.argv[5]) if len(sys.argv) > 5 else 0
HIER = os.path.dirname(os.path.abspath(__file__)); roh = ziel + ".roh.png"; im = Image.open(quelle)
if getattr(im, "n_frames", 1) > 1:
    n = im.n_frames; sp, ze = n, 1; b = Image.new("RGB", (im.width * n, im.height), (255, 255, 255))
    for i in range(n): im.seek(i); b.paste(im.convert("RGB"), (i * im.width, 0))
    im = b
a = np.asarray(im.convert("RGBA")).copy(); H, W = a.shape[:2]
if a[..., 3].min() < 10:
    al = a[..., 3] > 60; r_, g_, b_ = [a[..., i].astype(int) for i in range(3)]; al &= ~((r_ > 200) & (g_ < 60) & (b_ < 60)) & ~((r_ > 235) & (g_ > 235) & (b_ < 60))  # grellrote und grellgelbe Säume der Vorlage
    lab, n = ndimage.label(al); gr = ndimage.sum(al, lab, range(1, n + 1)); al = np.isin(lab, [i + 1 for i in range(n) if gr[i] > 2500]); al = ndimage.binary_erosion(al, iterations=2)
    a[..., 3] = np.where(al, a[..., 3], 0); Image.fromarray(a, "RGBA").save(roh); grund = "alpha"
else:
    rgb = im.convert("RGB"); d = ImageDraw.Draw(rgb)
    for k in range(sp + 1): d.rectangle((k * W / sp - 7, 0, k * W / sp + 7, H), fill=(255, 255, 255))
    for k in range(ze + 1): d.rectangle((0, k * H / ze - 7, W, k * H / ze + 7), fill=(255, 255, 255))
    rgb.save(roh); grund = "karoS"
aus = subprocess.run([sys.executable, "-I", os.path.join(HIER, "blatt.py"), "blatt", roh, ziel, str(sp), str(ze), grund, ziel + ".vorschau.png"], capture_output=True, text=True); os.remove(roh)
if aus.returncode: print(aus.stderr); sys.exit(1)
cw, ch = [int(v) for v in re.search(r"Feld (\d+) x (\d+)", aus.stdout).groups()]; f = float(re.search(r"Maßstab ([\d.]+)", aus.stdout).group(1)); x0, y0, x1, y1 = ast.literal_eval(aus.stdout.split("Rahmen:")[1].strip())[0]
Z = 176; links = (Z - cw * f) / 2; oben = Z - ch * f
print(os.path.basename(ziel), grund, "Maß: [%.3f, %.3f, %.3f]" % ((links + (x0 + x1) / 2 * f) / Z, (oben + y1 * f + schweben) / Z, (y1 - y0) * f / Z))
