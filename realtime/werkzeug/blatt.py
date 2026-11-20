"""Mythara Echtzeit – Figurenbilder fürs Spiel aufbereiten.

Aus einem Bildblatt (Spalten x Zeilen) wird eine Reihe von Feldern zu je 176 Pixeln, unten bündig, mit sauberem durchsichtigem Hintergrund.
Aus einem Standbild wird ein auf die Figur beschnittenes Bild.

  python3 -I werkzeug/blatt.py blatt <quelle> <ziel.webp> <spalten> <zeilen> <grund> [vorschau.png]
  python3 -I werkzeug/blatt.py stand <quelle> <ziel.webp> <grund> [vorschau.png]

grund:  alpha    die Vorlage ist schon durchsichtig; fast unsichtbare Farbreste werden abgeschnitten
        karo     ein Karomuster (weiß/hellgrau) ist ins Bild gemalt
        karo2    wie karo, aber mit dunklerem Grau (kräftiges Karo)
        karo3    wie karo2, entfernt auch kleine eingeschlossene Reste – nur für dunkle Figuren ohne helle, graue Flächen
        karoS    wie karo, entfernt auch einen grauen Schlagschatten am Boden – nur für Figuren ohne neutralgraue Flächen
        schwarz  schwarzer Hintergrund; violettes oder helles Leuchten läuft weich aus
Die Ausgabe nennt je Bild den Rahmen der festen Teile (links, oben, rechts, unten im Feld der Vorlage) – daraus ergeben sich die Maße in shared/config.ts.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

Z = 176


def alpha_sauber(im):
    a = np.asarray(im.convert("RGBA")).copy(); a[..., 3] = np.where(a[..., 3] < 14, 0, a[..., 3]); return Image.fromarray(a, "RGBA")


def karo_weg(z, ab=218, insel=50):
    a = np.asarray(z.convert("RGB")).astype(np.int16); mx = a.max(-1); mn = a.min(-1); karo = (mx - mn <= 8) & (mn >= ab); lab, n = ndimage.label(karo)
    rand = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}; bg = np.isin(lab, list(rand)); gr = ndimage.sum(karo, lab, range(1, n + 1))
    for k in range(1, n + 1):
        if k not in rand and gr[k - 1] >= insel: bg |= lab == k  # eingeschlossene Flächen zwischen Arm und Körper
    bg = ndimage.binary_dilation(bg, iterations=1); alpha = np.where(bg, 0, 255).astype(np.uint8); deck = alpha > 0; l2, m = ndimage.label(deck); g2 = ndimage.sum(deck, l2, range(1, m + 1))
    alpha = np.where(l2 == 1 + int(np.argmax(g2)), alpha, 0).astype(np.uint8)  # nur die zusammenhängende Figur behalten
    o = Image.fromarray(np.dstack([a.astype(np.uint8), alpha]), "RGBA"); o.putalpha(o.split()[3].filter(ImageFilter.GaussianBlur(0.7)).point(lambda v: 0 if v < 110 else min(255, int((v - 110) * 255 / 120)))); return o


def schwarz_weg(z):
    a = np.asarray(z.convert("RGB")).astype(np.float32); mx = a.max(-1); dunkel = mx < 16; lab, n = ndimage.label(dunkel); rand = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}; bg = np.isin(lab, list(rand)); gr = ndimage.sum(dunkel, lab, range(1, n + 1))
    for k in range(1, n + 1):
        if k not in rand and gr[k - 1] >= 400: bg |= lab == k
    nah = ndimage.distance_transform_edt(~bg); alpha = np.where(bg, 0, 255).astype(np.float32); blau = ((a[..., 2] > a[..., 0] * 1.25) & (a[..., 2] > a[..., 1] * 1.4)) | ((a[..., 2] > a[..., 0] * 1.35) & (a[..., 1] > a[..., 0] * 1.15))  # violett oder eisblau
    saum = (~bg) & (nah <= 6) & (mx < 120) & blau; alpha[saum] = np.clip(mx[saum] / 120 * 255, 0, 255); kante = (~bg) & (nah <= 1.5) & ~blau; alpha[kante] = np.minimum(alpha[kante], 150)
    return Image.fromarray(np.dstack([a.astype(np.uint8), alpha.astype(np.uint8)]), "RGBA")


def frei(z, grund):
    return alpha_sauber(z) if grund == "alpha" else karo_weg(z) if grund == "karo" else karo_weg(z, 185, 300) if grund == "karo2" else karo_weg(z, 185, 20) if grund == "karo3" else karo_weg(z, 150, 50) if grund == "karoS" else schwarz_weg(z)


def rahmen(z): return z.split()[3].point(lambda v: 255 if v > 200 else 0).getbbox()


def main():
    art = sys.argv[1]
    if art == "stand":
        quelle, ziel, grund = sys.argv[2:5]; vorschau = sys.argv[5] if len(sys.argv) > 5 else None; z = frei(Image.open(quelle), grund); z = z.crop(rahmen(z)); h = 340; k = z.resize((round(z.width * h / z.height), h), Image.LANCZOS); k.save(ziel, quality=90, method=6)
        A = np.asarray(k.split()[3]); print("stand", k.size, "unterste Zeilen (Zeile: von–bis):", [(y, int(np.where(A[y] > 60)[0].min()), int(np.where(A[y] > 60)[0].max())) for y in (339, 320, 300, 280) if (A[y] > 60).any()])
        if vorschau: d = Image.new("RGBA", z.size, (24, 20, 34, 255)); d.alpha_composite(z); d.convert("RGB").resize((z.width // 2, z.height // 2)).save(vorschau)
        return
    quelle, ziel, sp, ze, grund = sys.argv[2], sys.argv[3], int(sys.argv[4]), int(sys.argv[5]), sys.argv[6]; vorschau = sys.argv[7] if len(sys.argv) > 7 else None
    im = Image.open(quelle); W, H = im.size; cw, ch = W / sp, H / ze; n = sp * ze; aus = Image.new("RGBA", (n * Z, Z), (0, 0, 0, 0)); d = Image.new("RGBA", (round(cw) * sp, round(ch) * ze), (24, 20, 34, 255)); f = Z / max(cw, ch); kaesten = []
    for i in range(n):
        r, c = divmod(i, sp); z = frei(im.crop((round(c * cw), round(r * ch), round((c + 1) * cw), round((r + 1) * ch))), grund); k = z.resize((round(z.width * f), round(z.height * f)), Image.LANCZOS)
        aus.paste(k, (i * Z + (Z - k.width) // 2, Z - k.height)); d.alpha_composite(z, (c * round(cw), r * round(ch))); kaesten.append(rahmen(z))
    aus.save(ziel, quality=90, method=6); print("blatt", n, "Bilder · Feld", round(cw), "x", round(ch), "· Maßstab", round(f, 4), "· Rahmen:", kaesten)
    if vorschau: d.convert("RGB").resize((900, round(d.height * 900 / d.width))).save(vorschau)


main()
