"""
World Pipeline – Bodenbäcker: malt den Boden einer Region aus ihrer Geländekarte, ein Bild je Chunk.

  python3 werkzeug/welt/boden.py <region> [--nur cx_cy] [--vorschau]

Ergebnis: ../echtzeit/welt/<cx>_<cy>.webp (1536 × 1536, Chunk im Weltgitter) und – mit --vorschau –
welt/regionen/<region>/vorschau.webp (die ganze Region verkleinert).

So entsteht das Bild (die Verfahren stammen aus werkzeug/gelaende.py):
  - Jede Geländeart hat eine Textur, die um 45 Grad gedreht in der Welt liegt, damit kein Kachelraster auffällt.
  - Die Arten werden nach Rang übereinandergelegt. Wer höher steht, wächst mit seinem Rand über die Nachbarn:
    „fransen“ franst unregelmäßig aus, „steine“ endet in ganzen Steinen, „hart“ hat eine klare Kante.
  - Wasser bekommt rundherum einen feuchten Saum und, wenn vorhanden, den gemalten Uferstreifen.
  - Alles Unregelmäßige hängt nur von der Lage in der Welt ab (kein Zufallsgenerator mit Reihenfolge).
    Darum passen Nachbar-Chunks ohne Naht aneinander, auch über Regionsgrenzen hinweg, und jeder Chunk lässt sich einzeln neu backen.
"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

HIER = os.path.dirname(os.path.abspath(__file__))
REALTIME = os.path.normpath(os.path.join(HIER, '..', '..'))
WURZEL = os.path.normpath(os.path.join(REALTIME, '..'))
WELT = os.path.join(REALTIME, 'welt')
ZIEL = os.path.join(WURZEL, 'echtzeit', 'welt')
FELD, CHUNK = 48, 32
RAND = 4            # so viele Rechenfelder rechnet jeder Chunk über seinen Rand hinaus (für Übergänge und ganze Steine)
C45 = math.sqrt(0.5)


# ---------- Rauschen, das nur von der Lage in der Welt abhängt ----------
def _wurf(i, j, saat):
    n = (i.astype(np.int64) * 374761393 + j.astype(np.int64) * 668265263 + saat * 2147483647) & 0xFFFFFFFF
    n = ((n ^ (n >> 13)) * 1274126177) & 0xFFFFFFFF
    n = n ^ (n >> 16)
    return (n & 0xFFFFFF).astype(np.float32) / 0x7FFFFF - 1.0


def rauschen(X, Y, weite, saat):
    """Weiches Rauschen zwischen -1 und 1; weite = Größe der Flecken in Bildpunkten"""
    gx, gy = X / weite, Y / weite
    x0, y0 = np.floor(gx), np.floor(gy)
    fx, fy = gx - x0, gy - y0
    fx, fy = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
    i, j = x0.astype(np.int64), y0.astype(np.int64)
    a, b, c, d = _wurf(i, j, saat), _wurf(i + 1, j, saat), _wurf(i, j + 1, saat), _wurf(i + 1, j + 1, saat)
    return ((a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy).astype(np.float32)


def nahtlos(a, rand=40):
    """Ränder einer Textur angleichen: eine zur Mitte verschobene Kopie wird am Rand eingeblendet."""
    n = a.shape[0]
    v = np.roll(a, (n // 2, n // 2), axis=(0, 1))
    y, x = np.mgrid[0:n, 0:n]
    d = np.minimum(np.minimum(x, n - 1 - x), np.minimum(y, n - 1 - y)).astype(np.float32)
    w = np.clip(d / rand, 0, 1)[..., None]
    return a * w + v * (1 - w)


_TEXTUREN = {}
def textur(pfad, n, glatt=False):
    """Textur auf n × n Bildpunkte gebracht (gemerkt)"""
    key = (pfad, n, glatt)
    if key not in _TEXTUREN:
        a = np.asarray(Image.open(os.path.join(WURZEL, pfad)).convert('RGB').resize((n, n), Image.LANCZOS)).astype(np.float32)
        _TEXTUREN[key] = nahtlos(a, max(8, n // 14)) if glatt else a
    return _TEXTUREN[key]


def farbe(hexa):
    return np.array([int(hexa[k:k + 2], 16) for k in (1, 3, 5)], dtype=np.float32)


class Fenster:
    """Ein Ausschnitt der Welt in Bildpunkten: Lage jedes Bildpunkts, gedrehte Texturlage, gemeinsames Rauschen"""
    def __init__(self, x0, y0, breit, hoch):
        Y, X = np.mgrid[0:hoch, 0:breit].astype(np.float32)
        self.X, self.Y = X + x0, Y + y0
        self.TU = self.X * C45 - self.Y * C45 + 200000.0
        self.TV = self.X * C45 + self.Y * C45 + 200000.0
        self.grob = rauschen(self.X, self.Y, 300, 1) * 0.65 + rauschen(self.X, self.Y, 140, 2) * 0.35
        self.mittel = rauschen(self.X, self.Y, 60, 3)
        self.fein = rauschen(self.X, self.Y, 26, 4) * 0.6 + rauschen(self.X, self.Y, 13, 5) * 0.4
        self.buschel = rauschen(self.X, self.Y, 9, 6)
        self.streu = rauschen(self.X, self.Y, 420, 7) * 0.6 + rauschen(self.X, self.Y, 170, 8) * 0.4

    def flaeche(self, tile):
        n = tile.shape[0]
        return np.dstack([ndimage.map_coordinates(tile[..., k], [self.TV % n, self.TU % n], order=1, mode='wrap') for k in range(3)])


def decke(F, art):
    """Die Fläche einer Geländeart als Bild"""
    if art['kachel'] is None:
        # Platzhalter: Farbe mit etwas Körnung, damit die Fläche nicht tot wirkt
        return farbe(art['farbe'])[None, None, :] * (1 + 0.07 * F.fein + 0.05 * F.grob)[..., None]
    n = int(art.get('kachelPx', 330))
    bild = F.flaeche(textur(art['kachel'], n, glatt=bool(art.get('wasser'))))
    for k, pfad in enumerate(art.get('varianten', [])):
        # Varianten wachsen in großen, unregelmäßigen Flecken ein
        fleck = rauschen(F.X, F.Y, 380, 20 + k) * 0.6 + rauschen(F.X, F.Y, 150, 40 + k) * 0.3 + rauschen(F.X, F.Y, 40, 60 + k) * 0.1
        m = np.clip((fleck - 0.2) / 0.2, 0, 1)[..., None]
        bild = bild * (1 - m) + F.flaeche(textur(pfad, n)) * m
    if not art.get('wasser'):
        bild = bild * (1 + 0.10 * F.grob[..., None])
    return bild


def gestalt(F, maske_felder, breit, hoch):
    """Aus der kantigen Feldmaske eine runde, leicht unregelmäßige Form in Bildpunkten (Stufen der Feldkarte verschwinden)."""
    weich = ndimage.gaussian_filter(maske_felder.astype(np.float32), 0.6, mode='nearest')
    f = np.asarray(Image.fromarray(weich, mode='F').resize((breit, hoch), Image.BICUBIC))
    return (f + 0.13 * F.mittel + 0.08 * F.grob) > 0.44


def abstand(form):
    """Abstand zum Rand der Form in Bildpunkten: innen negativ, außen positiv"""
    if not form.any():
        return np.full(form.shape, 1e6, dtype=np.float32)
    if form.all():
        return np.full(form.shape, -1e6, dtype=np.float32)
    return (ndimage.distance_transform_edt(~form) - ndimage.distance_transform_edt(form)).astype(np.float32)


def steine(F, art, d, bild, unter):
    """Pflaster: ganze Steine bleiben, am Rand liegen lose Brocken, dazwischen dunkle Fugenerde."""
    n = int(art.get('kachelPx', 190))
    tile = textur(art['kachel'], n)
    hell = tile.mean(-1)
    r_, g_, b_ = tile[..., 0], tile[..., 1], tile[..., 2]
    fuge = (ndimage.gaussian_filter(hell, 0.8) < 80) | ((g_ > r_ * 1.08) & (g_ > b_ * 1.25))
    lab_t, nl = ndimage.label(ndimage.binary_opening(~fuge, iterations=1))
    ui, vi = (F.TU % n).astype(np.int64), (F.TV % n).astype(np.int64)
    lab = lab_t[vi, ui].astype(np.int64)
    ku, kv = (F.TU // n).astype(np.int64), (F.TV // n).astype(np.int64)
    roh = np.where(lab > 0, (ku * 65536 + kv) * (nl + 1) + lab, 0)
    eind, inv = np.unique(roh, return_inverse=True)
    ids = inv.reshape(roh.shape).astype(np.int32)
    idx = np.arange(len(eind))
    reich = art['rand']['breite'] * FELD
    lage = ndimage.mean(d + F.grob * 10, ids, idx)
    gross = ndimage.sum(np.ones_like(ids, dtype=np.float32), ids, idx)
    # Der Wurf hängt am Stein selbst (seiner Lage in der Welt), nicht an der Reihenfolge: gleicher Stein, gleiche Entscheidung in jedem Chunk
    wurf = (_wurf(eind // (nl + 1), eind % (nl + 1), 9) + 1) / 2
    bleibt = (gross > 20) & ((lage < 0) | ((lage < reich) & (wurf < 0.6 * (1 - lage / reich))))
    bleibt[eind == 0] = False
    m_stein = ndimage.binary_dilation(bleibt[ids], iterations=1)
    ms = ndimage.gaussian_filter(m_stein.astype(np.float32), 0.9)[..., None]
    P = F.flaeche(tile)
    kern = np.clip(0.5 - (d + F.fein * 10) / 14, 0, 1)[..., None]
    moos = np.clip(F.buschel * 2.2, 0, 1)[..., None] * np.clip(1 + d / 45, 0, 1)[..., None]   # am Rand wächst der Untergrund in die Fugen
    fugenfarbe = (P * 0.42) * (1 - moos) + unter * 0.8 * moos
    bild = bild * (1 - kern) + fugenfarbe * kern
    schatten = ndimage.gaussian_filter(m_stein.astype(np.float32), 2.5)[..., None]
    bild = bild * (1 - 0.35 * schatten * (1 - ms))
    return bild * (1 - ms) + P * ms


def ufer(F, art, d, bild, wasserbild):
    """Rund um ein Wasser: gemalter Uferstreifen (wenn vorhanden) und ein schmaler dunkler, feuchter Saum. d: innen (im Wasser) negativ."""
    reich = art['rand']['breite'] * FELD
    if art['rand'].get('bild'):
        UF = textur(art['rand']['bild'], 1254)
        HU = UF.shape[0]
        # Quer durch das Bild läuft der Verlauf von Land (links) nach Wasser (rechts); die Mitte liegt auf der Uferlinie
        xq = 600 - d / reich * 400
        v = np.clip(np.abs(((F.TU * 2.2 + HU) % (2 * HU)) - HU), 0, HU - 1)
        streifen = np.dstack([ndimage.map_coordinates(UF[..., k], [v, np.clip(xq, 0, HU - 1)], order=1) for k in range(3)])
        gw = (np.clip((xq - 200) / 180, 0, 1) * np.clip((1000 - xq) / 180, 0, 1))[..., None]
        bild = bild * (1 - gw) + streifen * gw
    else:
        # ohne gemaltes Bild: das Wasser wird zum Ufer hin etwas heller und trüber
        flach = np.clip(1 + d / (reich * 0.8), 0, 1)[..., None] * (d < 0)[..., None]
        bild = bild * (1 - 0.35 * flach) + (wasserbild * 0.6 + 60) * 0.35 * flach
    nass = np.clip(1 - np.abs(d - 5) / 10, 0, 1)[..., None] * 0.35
    return bild * (1 - 0.45 * nass)


# ---------- Einzelheiten: Grasbüschel, Steinchen, Zweige, Blumen; Schatten und Wurzeln unter Bäumen; ausgetretene Erde vor Türen ----------
def zufall(i, j, saat):
    """Ein Wurf zwischen 0 und 1, der nur von der Lage in der Welt abhängt"""
    return (float(_wurf(np.array([i]), np.array([j]), saat)[0]) + 1) / 2


GRAS = [(46, 70, 22), (64, 92, 28), (86, 118, 36), (112, 142, 46), (148, 168, 64)]
TROCKEN = [(108, 106, 44), (138, 128, 56), (164, 150, 74)]


def bueschel(d, x, y, g, w):
    """Ein Grasbüschel: ein paar gebogene Halme, dunkle zuerst. g: Größe in Bildpunkten (Rechengröße), w: Würfelfunktion"""
    d.ellipse([x - g * 0.32, y - g * 0.1, x + g * 0.32, y + g * 0.12], fill=(20, 30, 10, 60))
    n = 6 + int(w(1) * 5); farben = TROCKEN if w(2) < 0.18 else GRAS
    halme = sorted(range(n), key=lambda k: w(10 + k))
    for k in halme:
        a = (w(30 + k) - 0.5) * 1.3; L = g * (0.55 + 0.5 * w(50 + k)); bx = x + (w(70 + k) - 0.5) * g * 0.4
        biege = (w(90 + k) - 0.5) * g * 0.35
        p = [(bx, y), (bx + math.sin(a) * L * 0.5, y - math.cos(a) * L * 0.55), (bx + math.sin(a) * L + biege, y - math.cos(a) * L)]
        c = farben[min(len(farben) - 1, int(k / n * len(farben)))]
        d.line(p, fill=c + (235,), width=2, joint='curve')


def stein(d, x, y, g, w):
    """Ein Steinchen mit Schatten unten rechts und Licht oben links"""
    rx, ry = g * (0.7 + 0.5 * w(1)), g * (0.5 + 0.3 * w(2)); t = 108 + w(3) * 50; c = (t, t * 0.97, t * 0.9)
    d.ellipse([x - rx + g * 0.25, y - ry + g * 0.3, x + rx + g * 0.25, y + ry + g * 0.3], fill=(18, 16, 12, 110))
    d.ellipse([x - rx, y - ry, x + rx, y + ry], fill=tuple(int(v) for v in c) + (255,))
    d.ellipse([x - rx * 0.7, y - ry * 0.8, x + rx * 0.1, y - ry * 0.05], fill=tuple(int(min(255, v * 1.25)) for v in c) + (150,))


def zweig(d, x, y, g, w):
    a = w(1) * math.pi; L = g * (0.8 + 0.6 * w(2)); dx, dy = math.cos(a) * L / 2, math.sin(a) * L / 2 * 0.6; c = (72 + int(w(3) * 30), 50, 30, 235)
    d.line([(x - dx, y - dy), (x + dx, y + dy)], fill=c, width=3)
    t = 0.2 + w(4) * 0.5; ax, ay = x - dx + 2 * dx * t, y - dy + 2 * dy * t; b = a + (0.6 if w(5) < 0.5 else -0.6)
    d.line([(ax, ay), (ax + math.cos(b) * L * 0.3, ay + math.sin(b) * L * 0.18)], fill=c, width=2)


def blumen(d, x, y, g, w):
    f = [(236, 232, 214), (240, 206, 84), (176, 140, 214), (150, 186, 236)][int(w(1) * 4)]
    for k in range(3 + int(w(2) * 4)):
        bx, by = x + (w(10 + k) - 0.5) * g * 1.4, y + (w(20 + k) - 0.5) * g * 0.8; r = g * 0.13
        d.ellipse([bx - r, by - r, bx + r, by + r], fill=f + (255,))
        d.ellipse([bx - r * 0.35, by - r * 0.35, bx + r * 0.35, by + r * 0.35], fill=(240, 196, 70, 255))


ZEICHNER = {'bueschel': (bueschel, 26), 'steinchen': (stein, 9), 'kiesel': (stein, 4), 'zweige': (zweig, 22), 'blumen': (blumen, 18)}


def wurzeln(d, x, y, s, w):
    """Ein paar Wurzeln, die vom Stammfuß ausgehen (Rechengröße: 2 Bildpunkte je Bildpunkt)"""
    for k in range(3 + int(w(1) * 3)):
        a = math.pi * (0.05 + 0.9 * (k + w(10 + k) * 0.6) / 4.2); L = FELD * 2 * s * (0.45 + 0.45 * w(20 + k))
        pts = [(x + math.cos(a) * L * t * (1 if a < math.pi / 2 else 1) * (1 if k % 2 else 1), y + math.sin(a) * L * t * 0.45 - 6) for t in (0, 0.35, 0.7, 1.0)]
        pts = [(px + (w(40 + k) - 0.5) * 8 * t, py) for t, (px, py) in zip((0, .35, .7, 1), pts)]
        for i in range(3):
            breit = int(round(14 * s * (1 - i / 3) + 2))
            d.line(pts[i:i + 2], fill=(66, 46, 28, 255), width=breit)
            d.line([(px, py - breit * 0.3) for px, py in pts[i:i + 2]], fill=(118, 88, 56, 200), width=max(1, breit // 3))


def einzelheiten(F, arten, aus, bild, dinge, ox, oy, fi0, fj0):
    """Alles Kleine auf dem Boden. ox/oy: Lage des Fensters in Bildpunkten der Welt, fi0/fj0 in Rechenfeldern."""
    ph, pb = bild.shape[:2]
    # Schatten unter den Bäumen und ausgetretene Erde vor den Türen (weich, als Maske)
    schatten = Image.new('L', (pb, ph), 0); ds = ImageDraw.Draw(schatten)
    erde = Image.new('L', (pb, ph), 0); de = ImageDraw.Draw(erde)
    nah = [g for g in dinge if -3 * FELD < g['x'] * FELD - ox < pb + 3 * FELD and -3 * FELD < g['y'] * FELD - oy < ph + 3 * FELD]
    for g in nah:
        x, y, s = g['x'] * FELD - ox, g['y'] * FELD - oy, g['s']
        if g['kat'] == 'bewuchs' and not g.get('stil'):
            rx, ry = FELD * 1.5 * s, FELD * 0.85 * s
            ds.ellipse([x - rx + 18 * s, y - ry + 4, x + rx + 18 * s, y + ry + 4], fill=150)
        for tdx, tdy in g.get('tueren', []):
            tx, ty = x + tdx * FELD, y + tdy * FELD
            de.ellipse([tx - FELD * 1.0, ty - FELD * 0.75, tx + FELD * 1.0, ty + FELD * 0.65], fill=255)
    sm = np.asarray(schatten.filter(__import__('PIL.ImageFilter', fromlist=['x']).GaussianBlur(18))).astype(np.float32)[..., None] / 255
    bild = bild * (1 - 0.32 * sm)
    em = np.asarray(erde).astype(np.float32) / 255
    if em.any():
        em = ndimage.gaussian_filter(em, 6)
        a = np.clip((em + F.fein * 0.35 + F.buschel * 0.25 - 0.45) * 3, 0, 1)[..., None]
        erdart = next((x for x in arten if x['id'] == 'erde'), None)
        if erdart:
            bild = bild * (1 - a * 0.85) + decke(F, erdart) * (a * 0.85)
    # Streu und Wurzeln: in doppelter Größe zeichnen, dann verkleinern (weiche Kanten)
    lage = Image.new('RGBA', (pb * 2, ph * 2), (0, 0, 0, 0)); d = ImageDraw.Draw(lage)
    gesperrt = set()
    for g in nah:
        if g['kat'] in ('gebaeude', 'bauteil', 'kleinteil') and g.get('rahmen'):
            x0, y0, x1, y1 = g['rahmen']
            for j in range(int(math.floor(g['y'] + y0)) - 1, int(math.ceil(g['y'] + y1)) + 1):
                for i in range(int(math.floor(g['x'] + x0)) - 1, int(math.ceil(g['x'] + x1)) + 1):
                    gesperrt.add((i, j))
    hh, bb = aus.shape
    for j in range(hh):
        for i in range(bb):
            wi, wj = fi0 + i, fj0 + j
            art = arten[aus[j, i]]
            if art.get('wasser') or (wi, wj) in gesperrt:
                continue
            for n, st in enumerate(art.get('streu', [])):
                saat = 300 + 17 * n + sum(map(ord, st['art']))
                for wdh in range(3):
                    if zufall(wi, wj, saat + 1000 * wdh) >= st['dichte'] - wdh:
                        continue
                    w = lambda k, wi=wi, wj=wj, saat=saat, wdh=wdh: zufall(wi * 7 + k, wj * 13 - k, saat + 50 + wdh * 997)
                    x, y = ((wi + w(901)) * FELD - ox) * 2, ((wj + w(902)) * FELD - oy) * 2
                    zeichne, g = ZEICHNER[st['art']]
                    zeichne(d, x, y, g * 2 * (0.75 + 0.5 * w(903)), w)
    for g in nah:
        if g['kat'] == 'bewuchs' and not g.get('stil'):   # Bäume im Spielstil bringen Stammfuß und Schatten selbst mit
            w = lambda k, g=g: zufall(int(g['x'] * 31) + k, int(g['y'] * 17) - k, 777)
            wurzeln(d, (g['x'] * FELD - ox) * 2, (g['y'] * FELD - oy) * 2, g['s'] * (1.3 if g.get('gross') else 1.0), w)
    lage = lage.resize((pb, ph), Image.LANCZOS)
    a = np.asarray(lage).astype(np.float32)
    al = a[..., 3:] / 255
    return bild * (1 - al) + a[..., :3] * al


def backe(arten, karte, fx0, fy0, weltx, welty, felder_b, felder_h, dinge=None):
    """Ein Stück Boden backen. karte: Rang-Nummern je Rechenfeld (mit RAND rundherum), fx0/fy0: linkes oberes Feld im Ausschnitt.
    weltx/welty: Lage dieses Feldes in der Welt (Rechenfelder). Zurück: Bild felder_b × felder_h Felder (uint8)."""
    b, h = felder_b + 2 * RAND, felder_h + 2 * RAND
    aus = karte[fy0:fy0 + h, fx0:fx0 + b]
    pb, ph = b * FELD, h * FELD
    F = Fenster((weltx - RAND) * FELD, (welty - RAND) * FELD, pb, ph)
    da = [k for k in range(len(arten)) if (aus == k).any()]
    decken = {k: decke(F, arten[k]) for k in da}
    # Grund: Am Rand einer Fläche liegt unter ihr die tiefer stehende Nachbarart (eine Feldbreite weit). Darüber kommen die runden Formen;
    # wo eine Form etwas zurückweicht, schaut so der Nachbar hervor und nirgends eine kantige Feldgrenze.
    grund = ndimage.minimum_filter(aus, size=3, mode='nearest')
    gross = np.repeat(np.repeat(grund, FELD, axis=0), FELD, axis=1)
    bild = np.zeros((ph, pb, 3), dtype=np.float32)
    for k in da:
        if (grund == k).any():
            bild = np.where((gross == k)[..., None], decken[k], bild)
    wasser = {}                                # je Wasserart: wo sie am Ende zu sehen ist
    for k in da:
        art = arten[k]
        form = gestalt(F, aus == k, pb, ph)
        d = abstand(form)
        if art.get('wasser'):
            a = np.clip(0.5 - d / 6, 0, 1)
            bild = bild * (1 - a[..., None]) + decken[k] * a[..., None]
            for w in wasser:
                wasser[w] &= ~form
            wasser[k] = form | ((gross == k) & ~np.any([wasser[w] for w in wasser], axis=0) if wasser else (gross == k))
            continue
        rand, reich = art['rand']['art'], max(art['rand']['breite'] * FELD, 2.0)
        if rand == 'steine' and art['kachel']:
            bild = steine(F, art, d, bild, bild.copy())
            deckt = d < 0
        else:
            if rand == 'fransen':
                a = np.clip(0.5 - (d + F.mittel * 0.45 * reich + F.fein * 0.30 * reich + F.buschel * 0.42 * reich) / (0.14 * reich), 0, 1)
                saum = art['rand'].get('saum')
                if saum:
                    # ausgetretener Saum neben dem Weg: das Gras wird gelblich und lichter, dazwischen schaut Erde durch
                    sb = saum['breite'] * FELD
                    t = (np.clip(1 - (d + F.mittel * 0.4 * sb) / sb, 0, 1) * (d > -reich * 0.2))[..., None] * saum['staerke']
                    bild = bild * (1 - t * 0.55) + bild * np.array([1.12, 1.02, 0.72], dtype=np.float32) * (t * 0.55)
                    erdig = (t * np.clip(0.5 + F.buschel[..., None] * 1.6, 0, 1)) ** 1.5
                    bild = bild * (1 - erdig * 0.7) + decken[k] * (erdig * 0.7)
            else:
                a = np.clip(0.5 - d / max(2.0, 0.25 * reich), 0, 1)
            bild = bild * (1 - a[..., None]) + decken[k] * a[..., None]
            deckt = a > 0.5
        for w in wasser:                       # was Land überwächst, ist kein Wasser mehr
            wasser[w] &= ~deckt
    # Ufer zuletzt, damit der Saum über allen Landarten liegt
    for k, mein in wasser.items():
        art = arten[k]
        if art['rand']['art'] == 'ufer' and mein.any():
            mein = ndimage.binary_opening(mein, iterations=2)
            d = abstand(mein)
            nah = np.abs(d) < art['rand']['breite'] * FELD * 1.6
            bild = np.where(nah[..., None], ufer(F, art, d, bild, decken[k]), bild)
    bild = einzelheiten(F, arten, aus, bild, dinge or [], (weltx - RAND) * FELD, (welty - RAND) * FELD, weltx - RAND, welty - RAND)
    r = RAND * FELD
    return np.clip(bild[r:ph - r, r:pb - r], 0, 255).astype(np.uint8)


def lade_region(name):
    ordner = os.path.join(WELT, 'regionen', name)
    with open(os.path.join(WELT, 'bibliothek', 'gelaende.json'), encoding='utf8') as f:
        arten = sorted(json.load(f)['arten'], key=lambda a: a['rang'])
    with open(os.path.join(ordner, 'region.json'), encoding='utf8') as f:
        region = json.load(f)
    with open(os.path.join(ordner, 'gelaende.txt'), encoding='utf8') as f:
        zeilen = [z for z in f.read().split('\n') if z]
    nr = {a['zeichen']: k for k, a in enumerate(arten)}
    karte = np.array([[nr[c] for c in z] for z in zeilen], dtype=np.int16)
    # Über den Rand hinaus: Wo eine Nachbarregion liegt, gilt deren Gelände (so entsteht an der Grenze keine Kante), sonst das eigene Randfeld
    voll = np.pad(karte, RAND, mode='edge')
    x0, y0 = region['ursprung'][0] * CHUNK - RAND, region['ursprung'][1] * CHUNK - RAND
    for n in sorted(os.listdir(os.path.join(WELT, 'regionen'))):
        o2 = os.path.join(WELT, 'regionen', n)
        if n == name or not os.path.exists(os.path.join(o2, 'region.json')):
            continue
        with open(os.path.join(o2, 'region.json'), encoding='utf8') as f:
            r2 = json.load(f)
        nx, ny = r2['ursprung'][0] * CHUNK - x0, r2['ursprung'][1] * CHUNK - y0           # Lage des Nachbarn im eigenen Feld
        nb, nh = r2['chunks'][0] * CHUNK, r2['chunks'][1] * CHUNK
        ax, ay, bx, by = max(0, nx), max(0, ny), min(voll.shape[1], nx + nb), min(voll.shape[0], ny + nh)
        if ax >= bx or ay >= by:
            continue
        with open(os.path.join(o2, 'gelaende.txt'), encoding='utf8') as f:
            z2 = [z for z in f.read().split('\n') if z]
        for j in range(ay, by):
            for i in range(ax, bx):
                voll[j, i] = nr[z2[j - ny][i - nx]]
    return ordner, region, arten, voll, dinge_lesen(arten)


def dinge_lesen(arten):
    """Alle Objekte aller Regionen in Weltkoordinaten (Rechenfelder), mit dem, was der Boden über sie wissen muss"""
    with open(os.path.join(WELT, 'bibliothek', 'objekte.json'), encoding='utf8') as f:
        bib = {o['id']: o for o in json.load(f)['objekte']}
    aus = []
    for n in sorted(os.listdir(os.path.join(WELT, 'regionen'))):
        o2 = os.path.join(WELT, 'regionen', n)
        if not os.path.exists(os.path.join(o2, 'objekte.json')):
            continue
        with open(os.path.join(o2, 'region.json'), encoding='utf8') as f:
            r2 = json.load(f)
        with open(os.path.join(o2, 'objekte.json'), encoding='utf8') as f:
            liste = json.load(f)
        ux, uy = r2['ursprung'][0] * CHUNK, r2['ursprung'][1] * CHUNK
        for p in liste:
            o = bib.get(p['objekt'])
            if not o:
                continue
            s = p.get('s', 1); sp = -1 if p.get('spiegeln') else 1; k = p.get('kollision', o.get('kollision'))
            g = {'x': p['x'] + ux, 'y': p['y'] + uy, 's': s, 'kat': o['kategorie'], 'gross': o['groesse'][0] > 500, 'stil': p['objekt'].startswith('stil_')}
            if o.get('tueren'):
                g['tueren'] = [(t['x'] * s, t['y'] * s) for t in o['tueren']]
            elif o.get('interaktion') and o['kategorie'] == 'gebaeude':
                g['tueren'] = [(o['interaktion']['dx'] * s * sp, o['interaktion']['dy'] * s)]
            if k and k['art'] == 'rechteck':
                xs = sorted([k['x'] * s * sp, (k['x'] + k['b']) * s * sp]); g['rahmen'] = (xs[0], k['y'] * s, xs[1], (k['y'] + k['h']) * s)
            elif k and k['art'] == 'gebaeude':
                g['rahmen'] = (min(b['x0'] for b in k['koerper']) * s, min(b['y0'] for b in k['koerper']) * s, max(b['x1'] for b in k['koerper']) * s, max(b['y1'] for b in k['koerper']) * s)
            elif k and k['art'] == 'kreis':
                g['rahmen'] = (-k['r'] * s, (k.get('dy', 0) - k['r']) * s, k['r'] * s, (k.get('dy', 0) + k['r']) * s)
            aus.append(g)
    return aus


def main():
    if len(sys.argv) < 2 or sys.argv[1].startswith('--'):
        sys.exit(__doc__)
    name = sys.argv[1]
    nur = sys.argv[sys.argv.index('--nur') + 1] if '--nur' in sys.argv else None
    ordner, region, arten, karte, dinge = lade_region(name)
    (ux, uy), (cb, ch) = region['ursprung'], region['chunks']
    os.makedirs(ZIEL, exist_ok=True)
    teile = {}
    for cy in range(ch):
        for cx in range(cb):
            marke = f'{ux + cx}_{uy + cy}'
            if nur and marke != nur:
                continue
            bild = backe(arten, karte, cx * CHUNK, cy * CHUNK, (ux + cx) * CHUNK, (uy + cy) * CHUNK, CHUNK, CHUNK, dinge)
            Image.fromarray(bild).save(os.path.join(ZIEL, marke + '.webp'), quality=86, method=6)
            teile[(cx, cy)] = bild
            print(f'  Chunk {marke}: {os.path.getsize(os.path.join(ZIEL, marke + ".webp")) // 1024} KB')
    if '--vorschau' in sys.argv and not nur:
        k = 4 if max(cb, ch) <= 4 else 8
        n = CHUNK * FELD // k
        gesamt = Image.new('RGB', (cb * n, ch * n))
        for (cx, cy), bild in teile.items():
            gesamt.paste(Image.fromarray(bild).resize((n, n), Image.LANCZOS), (cx * n, cy * n))
        gesamt.save(os.path.join(ordner, 'vorschau.webp'), quality=84)
        gesamt.save(os.path.join(ZIEL, 'karte-' + name + '.webp'), quality=80)   # Minikarte im Spiel
        print('  Vorschau: welt/regionen/' + name + '/vorschau.webp', gesamt.size)
    print(f'Boden gebacken: {len(teile)} Chunks nach echtzeit/welt/')


if __name__ == '__main__':
    main()
