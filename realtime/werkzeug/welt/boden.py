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
from PIL import Image
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
        m = np.clip((np.roll(F.streu, 37 * (k + 1), axis=1) - 0.28) / 0.22, 0, 1)[..., None]
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


def backe(arten, karte, fx0, fy0, weltx, welty, felder_b, felder_h):
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
                a = np.clip(0.5 - (d + F.fein * 0.30 * reich + F.buschel * 0.42 * reich) / (0.14 * reich), 0, 1)
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
    return ordner, region, arten, voll


def main():
    if len(sys.argv) < 2 or sys.argv[1].startswith('--'):
        sys.exit(__doc__)
    name = sys.argv[1]
    nur = sys.argv[sys.argv.index('--nur') + 1] if '--nur' in sys.argv else None
    ordner, region, arten, karte = lade_region(name)
    (ux, uy), (cb, ch) = region['ursprung'], region['chunks']
    os.makedirs(ZIEL, exist_ok=True)
    teile = {}
    for cy in range(ch):
        for cx in range(cb):
            marke = f'{ux + cx}_{uy + cy}'
            if nur and marke != nur:
                continue
            bild = backe(arten, karte, cx * CHUNK, cy * CHUNK, (ux + cx) * CHUNK, (uy + cy) * CHUNK, CHUNK, CHUNK)
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
