"""Mythara Fabrik – Kartensymbole (Minikarte und Weltkarte) im Stil gold auf schwarz (#33).

  python3 fabrik/karten_symbole.py

1. Die 12 Symbole aus der Vorlage des Nutzers ausschneiden (fabrik/assets/skilling/symbole/quelle/kartensymbole-neu.png):
   Ring außen durchsichtig, ohne Beschriftung.
2. Neue in derselben Optik zeichnen: fanggrund (Fisch über Wellen), bindestein (Stein mit Rune), taverne (Krug mit Schaum), faehre (Floß mit Kette, Phase 7) –
   Ring und dunkler Grund vom ausgeschnittenen Amboss, Motiv als Goldfläche mit Verlauf (hell oben, warm unten) wie in der Vorlage.
Ausgabe: img/karte/symbole/<name>.webp in der bisherigen Größe 143 × 160 – der Ring (143 px) sitzt unten, oben bleibt durchsichtig
(dort saß früher der blaue Edelstein), damit die Symbole auf der Karte an derselben Stelle stehen wie bisher.
Lesbarkeit bei 30 px: fabrik/assets/skilling/symbole/uebersicht_karte.png zeigt alle in 143 und 30 px.
"""
import math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
W = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); Q = os.path.join(W, "fabrik/assets/skilling/symbole/quelle/kartensymbole-neu.png")
Z = os.path.join(W, "img/karte/symbole"); os.makedirs(Z, exist_ok=True)
KREISE = {
    "amboss": (167.5, 257.5, 95.5),
    "ausruestungshaendler": (410.0, 257.0, 95.5),
    "bank": (647.0, 257.0, 95.5),
    "dungeon": (886.5, 257.5, 96.0),
    "friseur": (1122.5, 257.5, 96.0),
    "handwerkshaendler": (1362.5, 257.5, 96.0),
    "holzfaellerei": (1602.5, 258.0, 95.8),
    "mine": (167.5, 571.5, 95.5),
    "ofen": (410.5, 571.5, 95.5),
    "traenkehaendler": (648.5, 571.5, 95.5),
    "waffenhaendler": (886.5, 572.0, 95.8),
    "werkbank": (1122.5, 572.0, 95.8)
}
im = Image.open(Q).convert("RGB"); N = 512
def ausschneiden(xc, yc, r):
    R = r + 0.3; s = R + 1
    big = im.crop(tuple(int(round(v)) for v in (xc - s, yc - s, xc + s, yc + s))).resize((N, N), Image.LANCZOS)
    g = np.mgrid[:N, :N]; f = N / (2 * s); d = np.hypot(g[1] + 0.5 - N / 2, g[0] + 0.5 - N / 2) / f
    return Image.fromarray(np.dstack([np.array(big, np.float32), np.clip((R - d) * f / 1.5, 0, 1) * 255]).astype(np.uint8), "RGBA")
def speichern(b, name):
    ring = b.resize((143, 143), Image.LANCZOS).filter(ImageFilter.UnsharpMask(0.8, 50, 2)); out = Image.new("RGBA", (143, 160), (0, 0, 0, 0)); out.alpha_composite(ring, (0, 17))
    out.save(os.path.join(Z, name + ".webp"), "WEBP", quality=92); return out
DICKER = {"friseur": 9, "handwerkshaendler": 7, "waffenhaendler": 7, "bindestein": 9}                # feine Motive für ≈ 30 px auf der Karte kräftiger
def kraeftiger(b, px):
    """Goldmotiv im Inneren verbreitern (heller Wert gewinnt), Ring und Rand bleiben"""
    A = np.array(b, np.float32); M = np.array(b.convert("RGB").filter(ImageFilter.MaxFilter(px)).filter(ImageFilter.GaussianBlur(0.8)), np.float32)
    g = np.mgrid[:N, :N]; d = np.hypot(g[1] - N / 2 + 0.5, g[0] - N / 2 + 0.5); innen = (d < 0.78 * N / 2)[..., None]
    A[..., :3] = np.where(innen, M, A[..., :3]); return Image.fromarray(A.astype(np.uint8), "RGBA")
fertig = {}
for n, k in KREISE.items():
    b = ausschneiden(*k)
    if n in DICKER: b = kraeftiger(b, DICKER[n])
    fertig[n] = speichern(b, n); print("Kartensymbol:", n)
# ---- neue Symbole: Grund und Ring vom Amboss, Innenfläche leeren
basis = ausschneiden(*KREISE["amboss"]); A = np.array(basis, np.float32); g = np.mgrid[:N, :N]; d = np.hypot(g[1] - N / 2 + 0.5, g[0] - N / 2 + 0.5)
innen = d < 0.80 * N / 2; grund = np.median(A[innen & (A[..., :3].max(-1) < 60)][:, :3], 0)
A[innen, :3] = grund; basis = Image.fromarray(A.astype(np.uint8), "RGBA")
def gold(maske):
    """Motiv (Graustufen-Maske 512²) als Goldfläche: oben hell, unten warm, leichter Glanz, weiche Kante"""
    m = np.array(maske.filter(ImageFilter.GaussianBlur(1.2)), np.float32) / 255; ys = np.where(m.max(1) > 0.5)[0]; y0, y1 = ys.min(), ys.max()
    t = np.clip((np.arange(N) - y0) / max(1, y1 - y0), 0, 1)[:, None]
    oben, unten = np.array([255, 214, 110], np.float32), np.array([222, 140, 32], np.float32); farbe = oben * (1 - t[..., None]) + unten * t[..., None]
    farbe = np.broadcast_to(farbe, (N, N, 3)).copy(); b = np.array(basis, np.float32); b[..., :3] = b[..., :3] * (1 - m[..., None]) + farbe * m[..., None]
    return Image.fromarray(b.clip(0, 255).astype(np.uint8), "RGBA")
def neu(name, zeichnen):
    m = Image.new("L", (N, N), 0); zeichnen(ImageDraw.Draw(m)); fertig[name] = speichern(gold(m), name); print("Kartensymbol (neu):", name)
def taverne(d):                                                                                     # Krug mit Schaumkrone und Henkel
    d.rounded_rectangle((168, 200, 318, 396), 26, fill=255); d.rectangle((158, 380, 328, 404), fill=255)
    d.ellipse((300, 228, 392, 350), fill=255); d.ellipse((326, 254, 366, 324), fill=0)               # Henkel
    for x, y, r in ((190, 196, 34), (238, 178, 40), (290, 192, 34)): d.ellipse((x - r, y - r, x + r, y + r), fill=255)
    for x in (204, 243, 282): d.rounded_rectangle((x - 7, 248, x + 7, 360), 7, fill=0)               # Dauben
def fanggrund(d):                                                                                   # Fisch über zwei Wellen
    d.ellipse((150, 160, 340, 270), fill=255); d.polygon([(330, 215), (392, 160), (382, 215), (392, 270)], fill=255)
    d.ellipse((182, 196, 204, 218), fill=0)
    for y in (318, 372):
        pts = [(x, y + 16 * math.sin((x - 130) / 42)) for x in range(130, 384, 4)]; d.line(pts, fill=255, width=20, joint="curve")
def bindestein(d):                                                                                  # aufrechter Stein mit Rune, kleiner Sockel
    d.polygon([(182, 400), (194, 186), (226, 132), (288, 124), (322, 168), (334, 400)], fill=255); d.rounded_rectangle((160, 392, 352, 414), 10, fill=255)
    d.polygon([(257, 190), (300, 262), (257, 334), (214, 262)], fill=0); d.polygon([(257, 230), (278, 262), (257, 294), (236, 262)], fill=255)
    d.rectangle((249, 320, 265, 372), fill=0)
def neu_dick(name, zeichnen, px):
    m = Image.new("L", (N, N), 0); zeichnen(ImageDraw.Draw(m)); fertig[name] = speichern(kraeftiger(gold(m), px), name); print("Kartensymbol (neu):", name)
def faehre(d):                                                                                      # Floß mit Geländer auf Wellen, Kette darüber
    d.polygon([(140, 300), (372, 300), (352, 336), (160, 336)], fill=255)
    for x in (170, 220, 270, 320): d.rectangle((x - 6, 236, x + 6, 300), fill=255)
    d.rectangle((160, 232, 352, 246), fill=255)
    for k, x in enumerate(range(130, 390, 30)): d.ellipse((x, 160 + 6 * (k % 2), x + 26, 176 + 6 * (k % 2)), outline=255, width=7)   # Kettenglieder
    for y in (370, 410):
        pts = [(x, y + 14 * math.sin((x - 130) / 40)) for x in range(130, 386, 4)]; d.line(pts, fill=255, width=18, joint="curve")
neu("taverne", taverne); neu_dick("faehre", faehre, 5); neu("fanggrund", fanggrund); neu_dick("bindestein", bindestein, DICKER["bindestein"])
# ---- Übersicht: 143 px und 30 px
alle = list(fertig); U = Image.new("RGBA", (len(alle) * 150, 210), (52, 70, 52, 255))
for j, n in enumerate(alle): U.alpha_composite(fertig[n], (j * 150 + 3, 2)); U.alpha_composite(fertig[n].resize((27, 30), Image.LANCZOS), (j * 150 + 60, 172))
U.save(os.path.join(W, "fabrik/assets/skilling/symbole/uebersicht_karte.png"))
