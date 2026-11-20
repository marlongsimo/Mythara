"""Mythara Echtzeit – malt den Boden eines Ortes aus kachelbaren Flächen (werkzeug/boden/*.webp).

  python3 -I werkzeug/gelaende.py weidenhain

Ergebnis: img/echtzeit/<ort>-boden.webp (der Boden in schräger Sicht) und client/src/<ort>.json (wo man laufen kann, wichtige Stellen).

So entsteht das Bild: Der Boden wird zuerst unverzerrt gerechnet (jeder Bildpunkt ein Stück Boden) und am Ende in der Höhe gestaucht.
Die Flächen liegen um 45 Grad gedreht, damit kein Kachelraster entlang der Bildkanten sichtbar wird.
Ränder werden gerechnet, nicht gemalt: Erde franst ins Gras aus; Pflaster endet in ganzen Steinen; Wasser bekommt den gemalten Uferverlauf als Streifen.
"""
import json, math, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

HIER = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HIER, "..", ".."); BODEN = os.path.join(HIER, "boden")
Q = 0.62  # Stauchung der Höhe: so schräg schaut man auf den Boden

# ---------- Orte: alle Angaben in Bildpunkten des fertigen Bildes ----------
ORTE = {
    "weidenhain": {
        "breit": 2700, "hoch": 1500,
        # Pflaster: Plätze (x, y, Halbmesser) und Wege (Punkte, halbe Breite)
        "plaetze": [(720, 520, 250)],
        "pflasterwege": [([(720, 520), (800, 880), (1120, 1060), (1230, 1500)], 62), ([(1120, 1060), (1400, 1050)], 52)],
        # Erde: Feldwege und Höfe
        "erdwege": [([(820, 420), (1100, 330), (1380, 310)], 50), ([(930, 640), (1380, 690), (1800, 560), (2050, 380)], 46), ([(1880, 905), (2120, 830)], 50)],
        "hoefe": [(1400, 300, 150), (2180, 800, 150)],
        # Wasser: der Fluss (Punkte, halbe Breite) und Becken
        "fluss": ([(2760, 250), (2300, 520), (1900, 720), (1660, 960), (1560, 1200), (1800, 1560)], 105),
        "becken": [(1760, 1400, 300)],
        # Stege: von–bis, halbe Breite
        "stege": [((1380, 1050), (1900, 900), 40)],
        "stellen": {"start": (1210, 1400), "platz": (720, 560), "scheune": (1400, 330), "muehle": (2180, 810), "steg": (1640, 975)},
    },
}


def lade(name, n):
    return np.asarray(Image.open(os.path.join(BODEN, name + ".webp")).convert("RGB").resize((n, n), Image.LANCZOS)).astype(np.float32)


def nahtlos(a, rand=40):
    """Ränder angleichen: eine zur Mitte verschobene Kopie wird am Rand eingeblendet."""
    n = a.shape[0]; v = np.roll(a, (n // 2, n // 2), axis=(0, 1)); y, x = np.mgrid[0:n, 0:n]; d = np.minimum(np.minimum(x, n - 1 - x), np.minimum(y, n - 1 - y)).astype(np.float32); w = np.clip(d / rand, 0, 1)[..., None]
    return a * w + v * (1 - w)


def strecke(X, Y, punkte):
    """Abstand jedes Bodenpunkts zum Linienzug (Punkte in Bildpunkten des fertigen Bildes)."""
    d = np.full(X.shape, 1e9, dtype=np.float32)
    for (x0, y0), (x1, y1) in zip(punkte[:-1], punkte[1:]):
        y0, y1 = y0 / Q, y1 / Q; dx, dy = x1 - x0, y1 - y0; t = np.clip(((X - x0) * dx + (Y - y0) * dy) / (dx * dx + dy * dy), 0, 1); d = np.minimum(d, np.hypot(X - x0 - t * dx, Y - y0 - t * dy))
    return d


def main():
    name = sys.argv[1] if len(sys.argv) > 1 else "weidenhain"; O = ORTE[name]; W = O["breit"]; HB = O["hoch"]; H = round(HB / Q); rng = np.random.default_rng(11)
    Y, X = np.mgrid[0:H, 0:W].astype(np.float32); c = math.sqrt(0.5); TU = X * c - Y * c + 4000; TV = X * c + Y * c  # Lage in den gedrehten Flächen
    rauschen = lambda s: (lambda r: r / np.abs(r).max())(ndimage.gaussian_filter(rng.standard_normal((H, W)).astype(np.float32), s))
    grob, mittel, fein, buschel = rauschen(70), rauschen(16), rauschen(8), rauschen(3.5)

    def flaeche(tile):
        n = tile.shape[0]; return np.dstack([ndimage.map_coordinates(tile[..., k], [TV % n, TU % n], order=1, mode="wrap") for k in range(3)])

    wiese = flaeche(lade("wiese", 440)) * (1 + 0.14 * grob[..., None]); erde = flaeche(lade("erde", 460)); wasser = flaeche(nahtlos(lade("wasser-ruhig", 560))); stroemung = flaeche(nahtlos(lade("wasser", 560)))
    bild = wiese.copy()

    # ---------- Erde: ausgefranster Rand, in den Grasbüschel hineinwachsen ----------
    d_erde = np.full((H, W), 1e9, dtype=np.float32)
    for punkte, b in O["erdwege"]: d_erde = np.minimum(d_erde, strecke(X, Y, punkte) - b)
    for x, y, r in O["hoefe"]: d_erde = np.minimum(d_erde, np.hypot(X - x, Y - y / Q) - r)
    d_erde = d_erde + grob * 30
    me = np.clip(0.5 - (d_erde + fein * 22 + buschel * 30) / 7, 0, 1)[..., None]; bild = bild * (1 - me) + erde * me

    # ---------- Pflaster: ganze Steine bleiben, am Rand lose Brocken, dazwischen Erde ----------
    NP = 250; tile = lade("pflaster", NP); hell = tile.mean(-1); r_, g_, b_ = tile[..., 0], tile[..., 1], tile[..., 2]
    fuge = (ndimage.gaussian_filter(hell, 0.8) < 80) | ((g_ > r_ * 1.08) & (g_ > b_ * 1.25)); stein_t = ndimage.binary_opening(~fuge, iterations=1); lab_t, nl = ndimage.label(stein_t)
    ui, vi = (TU % NP).astype(np.int32), (TV % NP).astype(np.int32); lab = lab_t[vi, ui].astype(np.int64); kachel_nr = (TU // NP).astype(np.int64) * 4096 + (TV // NP).astype(np.int64)
    roh = np.where(lab > 0, kachel_nr * (nl + 1) + lab, 0); _, inv = np.unique(roh, return_inverse=True); ids = inv.reshape(roh.shape).astype(np.int32); n_id = int(ids.max()) + 1  # 0 = Fuge
    d_pfl = np.full((H, W), 1e9, dtype=np.float32)
    for x, y, r in O["plaetze"]: d_pfl = np.minimum(d_pfl, np.hypot(X - x, Y - y / Q) - r)
    for punkte, b in O["pflasterwege"]: d_pfl = np.minimum(d_pfl, strecke(X, Y, punkte) - b)
    d_pfl = d_pfl + grob * 22
    idx = np.arange(n_id); lage = ndimage.mean(d_pfl, ids, idx); gross = ndimage.sum(np.ones_like(ids, dtype=np.float32), ids, idx); wurf = rng.random(n_id)
    bleibt = (gross > 25) & ((lage < 0) | ((lage < 42) & (wurf < 0.6 * (1 - lage / 42)))); bleibt[0] = False
    m_stein = ndimage.binary_dilation(bleibt[ids], iterations=1); ms = ndimage.gaussian_filter(m_stein.astype(np.float32), 0.9)[..., None]; P = flaeche(tile)
    kern = np.clip(0.5 - (d_pfl + fein * 14) / 18, 0, 1)[..., None]; moos = np.clip(buschel * 2.2, 0, 1)[..., None] * np.clip(1 + d_pfl / 60, 0, 1)[..., None]  # am Rand wächst Gras in die Fugen
    fugenfarbe = (erde * 0.55 + P * 0.25) * (1 - moos) + wiese * 0.8 * moos; bild = bild * (1 - kern) + fugenfarbe * kern
    schatten = ndimage.gaussian_filter(m_stein.astype(np.float32), 2.5)[..., None]; bild = bild * (1 - 0.35 * schatten * (1 - ms)); bild = bild * (1 - ms) + P * ms

    # ---------- Wasser: Fluss und Becken, mit dem gemalten Uferverlauf als Streifen ----------
    punkte, b = O["fluss"]; d_w = strecke(X, Y, punkte) - b
    for x, y, r in O["becken"]: d_w = np.minimum(d_w, np.hypot(X - x, Y - y / Q) - r)
    d_w = d_w + grob * 26 + mittel * 14; im_wasser = d_w < 0; d = ndimage.distance_transform_edt(~im_wasser) - ndimage.distance_transform_edt(im_wasser)
    UF = np.asarray(Image.open(os.path.join(BODEN, "verlauf-wiese-wasser.webp")).convert("RGB")).astype(np.float32); HU = UF.shape[0]; MASS = 560 / 1254.0
    xq = 600 - d / MASS * 2.4; v = np.clip(np.abs(((TU * 2.2 + HU) % (2 * HU)) - HU), 0, HU - 1)
    streifen = np.dstack([ndimage.map_coordinates(UF[..., k], [v, np.clip(xq, 0, HU - 1)], order=1) for k in range(3)])
    stark = np.clip((Y * Q - 1050) / 250, 0, 1)[..., None] * np.clip(-d / 60, 0, 1)[..., None]  # unterhalb des Wehrs strömt das Wasser
    offen = wasser * (1 - stark) + stroemung * stark; aussen = np.where(im_wasser[..., None], offen, bild)
    gw = (np.clip((xq - 200) / 180, 0, 1) * np.clip((1000 - xq) / 180, 0, 1))[..., None] * (1 - ms * np.clip(1 + d / 30, 0, 1)[..., None]); bild = aussen * (1 - gw) + streifen * gw
    nass = np.clip(1 - np.abs(d - 6) / 12, 0, 1)[..., None] * 0.35; bild = bild * (1 - nass) + bild * 0.55 * nass  # schmaler dunkler, feuchter Saum

    # ---------- Stege: Bohlen quer zur Laufrichtung, dunkle Holme an den Seiten (vorläufig gerechnet, bis es ein gemaltes Teil gibt) ----------
    steg_maske = np.zeros((H, W), dtype=bool)
    for (x0, y0), (x1, y1), hb in O["stege"]:
        y0, y1 = y0 / Q, y1 / Q; L = math.hypot(x1 - x0, y1 - y0); ex, ey = (x1 - x0) / L, (y1 - y0) / L; laengs = (X - x0) * ex + (Y - y0) * ey; quer = -(X - x0) * ey + (Y - y0) * ex
        m = (laengs > 0) & (laengs < L) & (np.abs(quer) < hb); steg_maske |= m
        bohle = np.floor(laengs / 15); ton = 0.78 + 0.22 * np.sin(bohle * 12.9898) + fein * 0.08; ritze = (laengs % 15) < 2.2; holm = np.abs(quer) > hb - 6
        holz = np.array([124, 92, 58], dtype=np.float32) * ton[..., None]; holz = np.where(ritze[..., None], holz * 0.45, holz); holz = np.where(holm[..., None], np.array([70, 50, 32], dtype=np.float32), holz)
        wurf_schatten = ndimage.gaussian_filter(m.astype(np.float32), 5)[..., None]; bild = bild * (1 - 0.4 * wurf_schatten * (~m)[..., None]); bild = np.where(m[..., None], holz, bild)

    # ---------- fertig: stauchen, Ränder abdunkeln, speichern ----------
    aus = Image.fromarray(np.clip(bild, 0, 255).astype(np.uint8)).resize((W, HB), Image.LANCZOS); a = np.asarray(aus).astype(np.float32); yy, xx = np.mgrid[0:HB, 0:W].astype(np.float32)
    rand = np.minimum(np.minimum(xx, W - 1 - xx), np.minimum(yy, HB - 1 - yy)); a *= (0.55 + 0.45 * np.clip(rand / 170, 0, 1))[..., None]
    ziel = os.path.join(ROOT, "img", "echtzeit", name + "-boden.webp"); Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(ziel, quality=88, method=6)

    # ---------- Wo man laufen kann: Raster in Bildpunkten des fertigen Bildes ----------
    Z = 20; gehbar = (~(d < 8)) | steg_maske; zeilen = []
    for j in range(HB // Z):
        z = ""
        for i in range(W // Z):
            px, py = i * Z + Z // 2, min(H - 1, round((j * Z + Z // 2) / Q)); z += "." if gehbar[py, px] and 50 < px < W - 50 and 50 < j * Z + Z // 2 < HB - 40 else "#"
        zeilen.append(z)
    json.dump({"breit": W, "hoch": HB, "zelle": Z, "zeilen": zeilen, "stellen": {k: list(v) for k, v in O["stellen"].items()}}, open(os.path.join(HIER, "..", "client", "src", name + ".json"), "w"), ensure_ascii=False)
    print("fertig:", ziel, aus.size, "·", n_id, "Steine geprüft,", int(bleibt.sum()), "liegen")


main()
