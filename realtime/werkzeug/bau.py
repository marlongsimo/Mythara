"""Mythara Echtzeit – ein Gebäude- oder Bodenbild vom dunklen Hintergrund lösen (auch mit weichem Lichtschein darum).

  python3 -I werkzeug/bau.py <quelle> <ziel.webp> [breite=760] [vorschau.png]

Der Hintergrund wird vom Bildrand her erkannt: dunkel und ohne Struktur. Alles, was zusammenhängend übrig bleibt, ist das Motiv.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

quelle, ziel = sys.argv[1], sys.argv[2]; breite = int(sys.argv[3]) if len(sys.argv) > 3 else 760; vorschau = sys.argv[4] if len(sys.argv) > 4 else None
im = Image.open(quelle); a = np.asarray(im.convert("RGB")).astype(np.float32); mx = a.max(-1)
grau = np.asarray(im.convert("L").filter(ImageFilter.GaussianBlur(1))).astype(np.float32); rau = np.sqrt(np.maximum(ndimage.uniform_filter(grau ** 2, 9) - ndimage.uniform_filter(grau, 9) ** 2, 0))
glatt = (rau < 3.2) & (mx < 240); lab, n = ndimage.label(glatt); rand = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bg = np.isin(lab, list(rand)); bg = ndimage.binary_opening(bg, iterations=2); bg = ndimage.binary_dilation(bg, iterations=3)
fest = ~bg; l2, m = ndimage.label(fest); g = ndimage.sum(fest, l2, range(1, m + 1)); fest = ndimage.binary_fill_holes(l2 == 1 + int(np.argmax(g)))
alpha = Image.fromarray((fest * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3)); o = im.convert("RGBA"); o.putalpha(alpha); o = o.crop(alpha.point(lambda v: 255 if v > 30 else 0).getbbox())
k = o.resize((breite, round(o.height * breite / o.width)), Image.LANCZOS); k.save(ziel, quality=88, method=6); A = np.asarray(k.split()[3]); unten = np.where(A[-6] > 60)[0]
print("fertig", k.size, "· unterste Kante von–bis:", (int(unten.min()), int(unten.max())) if len(unten) else None)
if vorschau: d = Image.new("RGBA", k.size, (90, 70, 60, 255)); d.alpha_composite(k); d.convert("RGB").save(vorschau)
