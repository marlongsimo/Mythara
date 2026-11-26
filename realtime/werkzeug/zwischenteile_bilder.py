"""Rucksack-Bilder der Zwischenteile (Handwerk): ungespannte Bögen (Bild des Bogens ohne Sehne) und Armbrustschäfte (Armbrust ohne Bogenarme und Sehne).
Quelle: img/objekte3d/ausruestung/bilder/<waffe>.webp (werkzeug/ausruestung_bilder.py). Ziel: img/objekte3d/skilling/erzeugnisse/ungespannt_<waffe>.webp bzw. schaft_<waffe>.webp.
Aufruf (im Ordner realtime): python3 werkzeug/zwischenteile_bilder.py [vorschau.png]"""
import os, sys, math
import numpy as np
from PIL import Image
W = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
Q, Z = os.path.join(W, "img/objekte3d/ausruestung/bilder/"), os.path.join(W, "img/objekte3d/skilling/erzeugnisse/")
STUFEN = ["_gewoehnlich", "", "_episch", "_legendaer", "_mythisch"]
BOEGEN = ["mondkurzbogen" + s for s in STUFEN] + ["mondlangbogen" + s for s in STUFEN]
ARMBRUESTE = ["sternarmbrust" + s for s in STUFEN]

def ohne_sehne(im):
    """Die Sehne ist dünn (1–3 Pixel): Öffnen mit einer Scheibe nimmt alles Dünne weg; der Bogen (dicker) bleibt, dazu seine Spitzen."""
    from scipy import ndimage
    a = np.array(im); al = a[:, :, 3] > 20; ys, xs = np.nonzero(al)
    yy, xx = np.mgrid[-3:4, -3:4]; scheibe = (xx * xx + yy * yy) <= 9
    dick = ndimage.binary_dilation(ndimage.binary_opening(al, structure=scheibe), structure=np.ones((5, 5)))
    # Spitzen (oben rechts, unten links) und was dort am Bogen hängt
    spitzen = np.zeros_like(al)
    for i in (ys.argmin(), ys.argmax()): spitzen[max(0, ys[i] - 22): ys[i] + 23, max(0, xs[i] - 22): xs[i] + 23] = True
    behalten = al & (dick | spitzen)
    # nur die größte zusammenhängende Fläche (Reste der Sehne an den Spitzen fallen weg)
    lab, n = ndimage.label(behalten, structure=np.ones((3, 3)))
    if n > 1: groesse = ndimage.sum(behalten, lab, range(1, n + 1)); behalten = lab == (1 + int(np.argmax(groesse)))
    a[:, :, 3] = np.where(behalten, a[:, :, 3], 0); return Image.fromarray(a)

def nur_schaft(im):
    """Armbrust: in den Zeilen, die viel breiter als der Schaft sind (Bogenarme, Sehne), nur die Mittelsäule des Schafts behalten."""
    a = np.array(im); al = a[:, :, 3] > 20; zeilen = [np.nonzero(al[y])[0] for y in range(a.shape[0])]
    breit = [(z.max() - z.min() + 1) if len(z) else 0 for z in zeilen]; schmal = [b for b in breit if b > 0]
    sw = float(np.percentile(schmal, 35)); mitte = np.median([ (z.min() + z.max()) / 2 for z, b in zip(zeilen, breit) if 0 < b <= sw * 1.3])
    for y, b in enumerate(breit):
        if b > sw * 1.6: a[y, : int(mitte - sw * 0.75), 3] = 0; a[y, int(mitte + sw * 0.75) + 1 :, 3] = 0
    out = Image.fromarray(a); box = out.getchannel("A").point(lambda v: 255 if v > 12 else 0).getbbox(); out = out.crop(box)
    f = 232 / max(out.size); out = out.resize((max(1, round(out.width * f)), max(1, round(out.height * f))), Image.LANCZOS)
    c = Image.new("RGBA", (256, 256), (0, 0, 0, 0)); c.paste(out, ((256 - out.width) // 2, (256 - out.height) // 2), out); return c

os.makedirs(Z, exist_ok=True); fertig = []
for g in BOEGEN:
    if os.path.exists(Q + g + ".webp"): ohne_sehne(Image.open(Q + g + ".webp").convert("RGBA")).save(Z + "ungespannt_" + g + ".webp", quality=88); fertig.append("ungespannt_" + g)
for g in ARMBRUESTE:
    if os.path.exists(Q + g + ".webp"): nur_schaft(Image.open(Q + g + ".webp").convert("RGBA")).save(Z + "schaft_" + g + ".webp", quality=88); fertig.append("schaft_" + g)
print(len(fertig), "Bilder:", " ".join(fertig))
if len(sys.argv) > 1:
    c = Image.new("RGBA", (256 * 8, 256 * 2), (40, 40, 40, 255))
    for i, g in enumerate(fertig): im = Image.open(Z + g + ".webp"); c.paste(im, ((i % 8) * 256, (i // 8) * 256), im)
    c.save(sys.argv[1])
