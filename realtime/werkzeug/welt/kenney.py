"""
World Pipeline – Kenney-Modelle (CC0) in der Ansicht der Welt rendern und mit unseren Materialien bemalen.

  python3 werkzeug/welt/kenney.py [kennung …] [--vorschau bild.png]

Die Modelle (OBJ, Kenney-Baukästen, Lizenz CC0: werkzeug/welt/kenney/*/License.txt) liefern nur die Form. Aus der Farbe jeder Fläche
in Kenneys Farbtafel wird das Material bestimmt (Stein, Dach, Holz, Metall, Öffnung) und mit unseren eigenen, gerechneten Texturen gemalt
(gebaeude.tex: quader, schiefer, holz – ohne Bildvorlage). So passt das Ergebnis zu den räumlichen Gebäuden der Welt.

Ansicht wie die Gebäude: schräge Parallelprojektion, Bildpunkt = ((x + 0,32·d)·48, −(d + z)·48) relativ zum Fuß (x Osten, d Norden, z oben, Felder).
Gerendert wird mit Tiefenpuffer je Bildpunkt; die Texturen liegen in Weltkoordinaten (je nach Lage der Fläche x/z, d/z oder x/d), damit
Mauerwerk über die vielen kleinen Flächen der Modelle durchläuft. Dazu Licht wie bei den Gebäuden, weicher Schatten, dunkle Kontur.

Schreibt img/welt/gebaeude/kenney/<kennung>.webp und den Eintrag in welt/bibliothek/objekte.json.
"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageFilter

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import haus3d                       # noqa: E402  (Licht)
from gebaeude import tex            # noqa: E402  (unsere Texturen)

REALTIME = os.path.normpath(os.path.join(HIER, '..', '..'))
WURZEL = os.path.normpath(os.path.join(REALTIME, '..'))
BIB = os.path.join(REALTIME, 'welt', 'bibliothek', 'objekte.json')
ZIEL = os.path.join(WURZEL, 'img', 'welt', 'gebaeude', 'kenney')
F, K, KX = 48, 2, 0.32

# Modelle: Teile übereinander (Datei, Höhe des Teils in Kenney-Einheiten wird aus dem Modell gelesen), Maßstab in Feldern je Einheit
MODELLE = {
    'burg_turm_01': dict(name='Burgturm (Kenney-Form)', paket='castle', teile=['tower-square-mid-door', 'tower-square-mid-windows', 'tower-square-top-roof-high'], mass=3.0, dreh=-90, kategorie='gebaeude'),
    # Ringmauer einer kompakten Burgsiedlung (Probe „Waldmark kompakt“)
    'burg_mauer_quer': dict(name='Burgmauer (Ost–West)', paket='castle', teile=['wall'], mass=2.0, dreh=90, kategorie='bauteil'),
    'burg_mauer_laengs': dict(name='Burgmauer (Nord–Süd)', paket='castle', teile=['wall'], mass=2.0, dreh=0, kategorie='bauteil'),
    'burg_eckturm': dict(name='Eckturm', paket='castle', teile=['tower-square-mid', 'tower-square-top-roof-high'], mass=2.6, dreh=-90, kategorie='bauteil'),
    'burg_torhaus': dict(name='Torhaus', paket='castle', teile=['wall-doorway'], mass=3.0, dreh=90, kategorie='bauteil', durchgang=True),
    # Dorfdinge (Town Kit, Retro Fantasy Kit)
    'burg_torhaus_tief': dict(name='Torhaus (Nord–Süd)', paket='castle', teile=['wall-doorway'], mass=3.0, dreh=0, kategorie='bauteil', durchgang=True),
    'k_stand_rot': dict(name='Marktstand rot', paket='town', teile=['stall-red'], mass=2.6, kategorie='kleinteil'),
    'k_stand_gruen': dict(name='Marktstand grün', paket='town', teile=['stall-green'], mass=2.6, kategorie='kleinteil'),
    'k_karren': dict(name='Karren', paket='town', teile=['cart'], mass=2.4, dreh=90, kategorie='kleinteil'),
    'k_karren_hoch': dict(name='Heuwagen', paket='town', teile=['cart-high'], mass=2.4, kategorie='kleinteil'),
    'k_laterne': dict(name='Laterne', paket='town', teile=['lantern'], mass=2.6, kategorie='kleinteil', klein=True),
    'k_hecke': dict(name='Hecke', paket='town', teile=['hedge-large'], mass=2.4, dreh=90, kategorie='bewuchs'),
    'k_zaun': dict(name='Zaun', paket='town', teile=['fence'], mass=2.4, dreh=90, kategorie='bauteil'),
    'k_banner_rot': dict(name='Banner rot', paket='town', teile=['banner-red'], mass=2.6, dreh=90, kategorie='kleinteil', klein=True),
    'k_banner_gruen': dict(name='Banner grün', paket='town', teile=['banner-green'], mass=2.6, dreh=90, kategorie='kleinteil', klein=True),
    'k_fels_gross': dict(name='Felsen', paket='town', teile=['rock-large'], mass=2.6, kategorie='fels'),
    'k_fels_klein': dict(name='Felsbrocken', paket='town', teile=['rock-small'], mass=2.6, kategorie='fels'),
    'k_fels_breit': dict(name='Felsplatte', paket='town', teile=['rock-wide'], mass=2.6, kategorie='fels'),
    'k_ruine_mauer': dict(name='Zerbrochene Mauer', paket='town', teile=['wall-broken'], mass=3.0, dreh=90, kategorie='sonderort', moos=True),
    'k_ruine_mauer_tief': dict(name='Zerbrochene Mauer (Nord–Süd)', paket='town', teile=['wall-broken'], mass=3.0, dreh=0, kategorie='sonderort', moos=True),
    'k_ruine_saeule': dict(name='Beschädigte Säule', paket='retro', teile=['column-damaged'], mass=3.2, kategorie='sonderort', klein=True, moos=True),
    'k_ruine_saeule_ganz': dict(name='Säule', paket='retro', teile=['column'], mass=3.2, kategorie='sonderort', klein=True, moos=True),
    'k_faesser': dict(name='Fässer', paket='retro', teile=['barrels'], mass=2.0, kategorie='kleinteil'),
    'k_kiste': dict(name='Kiste', paket='retro', teile=['detail-crate'], mass=2.0, kategorie='kleinteil'),
    'k_flaschenzug': dict(name='Flaschenzug', paket='retro', teile=['pulley-crate'], mass=2.0, kategorie='kleinteil'),
    # Nordwald (24.11.2026): Ruinen einer verfallenen Feste (Castle Kit, Fantasy Town Kit) und ein alter Friedhof (Graveyard Kit)
    'k_ruine_halbmauer': dict(name='Halbe Burgmauer (Ost–West)', paket='castle', teile=['wall-half'], mass=2.0, dreh=90, kategorie='sonderort', moos=True),
    'k_ruine_halbmauer_tief': dict(name='Halbe Burgmauer (Nord–Süd)', paket='castle', teile=['wall-half'], mass=2.0, dreh=0, kategorie='sonderort', moos=True),
    'k_ruine_turmstumpf': dict(name='Turmstumpf', paket='castle', teile=['tower-hexagon-base', 'tower-hexagon-mid'], mass=2.6, kategorie='sonderort', moos=True),
    'k_ruine_katapult': dict(name='Zerstörtes Katapult', paket='castle', teile=['siege-catapult-demolished'], mass=2.2, kategorie='kleinteil'),
    'k_gruft': dict(name='Gruft', paket='friedhof', teile=['crypt'], mass=2.4, kategorie='sonderort'),
    'k_grabstein_kreuz': dict(name='Grabstein mit Kreuz', paket='friedhof', teile=['gravestone-cross'], mass=2.4, kategorie='kleinteil', klein=True),
    'k_grabstein_rund': dict(name='Runder Grabstein', paket='friedhof', teile=['gravestone-round'], mass=2.4, kategorie='kleinteil', klein=True),
    'k_grabstein_zerbrochen': dict(name='Zerbrochener Grabstein', paket='friedhof', teile=['gravestone-broken'], mass=2.4, kategorie='kleinteil', klein=True),
    'k_grabstein_breit': dict(name='Breiter Grabstein', paket='friedhof', teile=['gravestone-wide'], mass=2.4, kategorie='kleinteil', klein=True),
    'k_obelisk': dict(name='Obelisk', paket='friedhof', teile=['pillar-obelisk'], mass=2.6, kategorie='sonderort', klein=True),
    'k_saeule_gross': dict(name='Große Säule', paket='friedhof', teile=['column-large'], mass=2.6, kategorie='sonderort', klein=True),
    'k_altar_stein': dict(name='Steinaltar', paket='friedhof', teile=['altar-stone'], mass=2.4, kategorie='sonderort'),
    'k_truemmer': dict(name='Trümmer', paket='friedhof', teile=['debris'], mass=2.4, kategorie='kleinteil', klein=True),
}
# Material aus der Farbe der Farbtafel: (Textur, Maßstab der Textur, Tönung oder None) oder ('farbe', rgb)
def gedaempft(r, g, b, k=0.38):
    """Kenneys kräftige Farben zur gedeckten Palette der Welt hin ziehen"""
    m = (r + g + b) / 3; return (r + (m - r) * k, g + (m - g) * k, b + (m - b) * k)


WALDGRUEN = (92, 126, 64)


def material(rgb, paket='castle', teil=''):
    r, g, b = [float(c) for c in rgb]; m = (r + g + b) / 3; satt = max(r, g, b) - min(r, g, b)
    if teil.startswith('rock') and satt < 70:
        return ('fels', 0.3, (128 + (m - 165) * 0.6, 124 + (m - 165) * 0.6, 116 + (m - 165) * 0.6))
    if 'lantern' in teil and b > r + 15 and m > 205:
        return ('farbe', (255, 214, 130))                # Laternenglas leuchtet
    if g > r + 30 and g > b - 10:
        return ('laub', 0.35, tuple(0.4 * c + 0.6 * w for c, w in zip(gedaempft(r, g, b), WALDGRUEN)))
    if paket == 'town':          # Town Kit: Ocker ist Holz, Blaugrau ist Stein, sehr helles Blau ist Wasser
        if r > 180 and 70 < r - b < 125 and 115 < g < 150:
            return ('holz', 0.1, None)
        if 125 < r < 165 and r - b > 60:
            return ('holz', 0.1, (118, 84, 58))
        if b > r + 15 and m > 200 and ('fountain' in teil or 'well' in teil):
            return ('farbe', (112, 158, 182))
        if b > r + 15 and m > 180:
            return ('farbe', (128, 130, 138))            # helles Metall: Beschläge, Achsen
        if b > r + 15 and g < r + 25 and satt < 60:
            return ('stein', 0.16, None)
        if g > r + 30:
            return ('laub', 0.35, gedaempft(r, g, b))
        if satt > 60:
            return ('stoff', 0.5, gedaempft(r, g, b))
    if m < 95 and satt < 40:
        return ('farbe', (34, 28, 30))                 # Öffnung: Fenster, Tür, Schießscharte
    if g > r + 12 and g > b:
        return ('laub', 0.35, gedaempft(r, g, b))      # Laub, Gras, Hecke (in der Farbe des Modells)
    if b > r + 40 and m < 170:
        return ('schiefer', 0.12, None)                # Dach
    if b >= r and r > 140:
        return ('farbe', (118, 122, 132))              # Metall
    if satt < 22:
        return ('stein', 0.16, (r, g, b))              # grauer Stein, Fels
    if r > 185 and r > g > b and satt < 120:
        return ('quader', 0.24, None)                  # Mauerstein (Kenneys Ocker)
    if r > g > b and m < 150:
        return ('holz', 0.1, None)                     # Holz
    return ('stoff', 0.5, gedaempft(r, g, b))         # kräftige Farben: Stoff, Fahnen, Planen
# Materialnamen (Retro Fantasy Kit) statt Farbtafel
NAMEN = {'bricks': ('quader', 0.24, None), 'stones': ('stein', 0.16, None), 'stonesPainted': ('stoff', 0.5, (214, 200, 172)), 'planks': ('holz', 0.1, None),
         'roof': ('schiefer', 0.12, None), 'barrel': ('holz', 0.1, None), 'fence': ('holz', 0.1, None), 'tree': ('laub', 0.35, (96, 140, 70)), 'water': ('farbe', (70, 120, 150))}


def lade(pfad):
    v, vt, flaechen = [], [], []; mtl = None
    for z in open(pfad, encoding='utf8', errors='ignore'):
        t = z.split()
        if not t:
            continue
        if t[0] == 'v':
            v.append([float(a) for a in t[1:4]])
        elif t[0] == 'vt':
            vt.append([float(a) for a in t[1:3]])
        elif t[0] == 'usemtl':
            mtl = t[1] if len(t) > 1 else None
        elif t[0] == 'f':
            ii = [p.split('/') for p in t[1:]]
            flaechen.append(([int(p[0]) - 1 for p in ii], [int(p[1]) - 1 if len(p) > 1 and p[1] else -1 for p in ii], mtl))
    return np.array(v, dtype=np.float64), np.array(vt if vt else [[0.5, 0.5]], dtype=np.float64), flaechen


def dreiecke(M):
    """Alle Teile übereinander: Liste (Ecken in Weltfeldern 3×3, Farbe aus der Tafel)"""
    ordner = M.get('ordner') or os.path.join(HIER, 'kenney', M['paket'])
    tafel = np.asarray(Image.open(os.path.join(ordner, 'colormap.png') if os.path.exists(os.path.join(ordner, 'colormap.png')) else os.path.join(ordner, 'Textures', 'colormap.png')).convert('RGB')) \
        if any(os.path.exists(os.path.join(ordner, *q)) for q in (('colormap.png',), ('Textures', 'colormap.png'))) else None
    aus, z0 = [], 0.0
    for teil in M['teile']:
        v, vt, fl = lade(os.path.join(ordner, teil + '.obj'))
        P = np.stack([v[:, 0], -v[:, 2], v[:, 1] - v[:, 1].min() + z0], 1) * M['mass']   # OBJ: y oben, −z nach Norden
        if M.get('dreh'):                                                                 # um die senkrechte Achse drehen (Grad, gegen den Uhrzeigersinn von oben)
            w = math.radians(M['dreh']); c, si = math.cos(w), math.sin(w); P = np.stack([P[:, 0] * c - P[:, 1] * si, P[:, 0] * si + P[:, 1] * c, P[:, 2]], 1)
        for fi, ti, mtl in fl:
            if mtl in NAMEN:
                art = NAMEN[mtl]
            else:
                uv = (vt[[t for t in ti if t >= 0]] % 1.0).mean(0) if any(t >= 0 for t in ti) else np.array([0.5, 0.5])
                art = material(tafel[int(min(tafel.shape[0] - 1, max(0, (1 - uv[1]) * tafel.shape[0]))), int(min(tafel.shape[1] - 1, max(0, uv[0] * tafel.shape[1])))], M.get('paket', 'castle'), teil) if tafel is not None else ('farbe', (150, 140, 130))
            if M.get('moos') and art[0] == 'holz':
                art = ('quader', 0.24, None)                                       # Ruinen: auch Pfosten und Balken sind Stein
            for k in range(1, len(fi) - 1):
                aus.append((P[[fi[0], fi[k], fi[k + 1]]], art))
        z0 += (v[:, 1].max() - v[:, 1].min()) * 0.985          # das nächste Teil sitzt (mit einer Spur Überlappung) darauf
    return aus


def render(M):
    tris = dreiecke(M)
    alle = np.concatenate([t[0] for t in tris])
    fuss = np.array([(alle[:, 0].min() + alle[:, 0].max()) / 2, alle[:, 1].min(), 0.0])   # Mitte der Südkante
    S = lambda P: np.stack([(P[:, 0] - fuss[0] + KX * (P[:, 1] - fuss[1])) * F, -((P[:, 1] - fuss[1]) + P[:, 2]) * F], 1)
    sa = S(alle); rand = 40
    x0, y0 = sa[:, 0].min() - rand, sa[:, 1].min() - rand; W, H = int(sa[:, 0].max() - x0 + rand), int(sa[:, 1].max() - y0 + rand)
    bild = np.zeros((H * K, W * K, 3), np.float32); tiefe = np.full((H * K, W * K), np.inf, np.float32); deck = np.zeros((H * K, W * K), np.float32)
    licht = np.array(haus3d.LICHT, dtype=np.float64)
    blick = np.array([-KX, 1.0, -1.0])
    for P, art in tris:
        n = np.cross(P[1] - P[0], P[2] - P[0]); ln = np.linalg.norm(n)
        if ln < 1e-12 or np.dot(n, blick) > 0:            # Rückseiten weglassen
            continue
        n = n / ln
        s = (S(P) - [x0, y0]) * K
        bx0, by0 = max(0, int(s[:, 0].min())), max(0, int(s[:, 1].min())); bx1, by1 = min(W * K - 1, int(s[:, 0].max()) + 1), min(H * K - 1, int(s[:, 1].max()) + 1)
        if bx1 < bx0 or by1 < by0:
            continue
        gx, gy = np.meshgrid(np.arange(bx0, bx1 + 1) + 0.5, np.arange(by0, by1 + 1) + 0.5)
        (ax, ay), (bxx, byy), (cx, cy) = s
        den = (byy - cy) * (ax - cx) + (cx - bxx) * (ay - cy)
        if abs(den) < 1e-9:
            continue
        l1 = ((byy - cy) * (gx - cx) + (cx - bxx) * (gy - cy)) / den; l2 = ((cy - ay) * (gx - cx) + (ax - cx) * (gy - cy)) / den; l3 = 1 - l1 - l2
        innen = (l1 >= -1e-4) & (l2 >= -1e-4) & (l3 >= -1e-4)
        if not innen.any():
            continue
        Wp = l1[..., None] * P[0] + l2[..., None] * P[1] + l3[..., None] * P[2]          # Weltpunkt je Bildpunkt
        t = Wp[..., 1] - Wp[..., 2]                                                     # Tiefe: kleiner = näher am Betrachter
        ausschnitt = (slice(by0, by1 + 1), slice(bx0, bx1 + 1))
        neu = innen & (t < tiefe[ausschnitt] - 1e-6)
        if not neu.any():
            continue
        if art[0] == 'farbe':
            c = np.broadcast_to(np.array(art[1], np.float32), Wp.shape)
        else:
            T = tex(art[0]).astype(np.float32); m = art[1]; a = np.abs(n)
            if a[2] >= a[0] and a[2] >= a[1]:
                u, v = Wp[..., 0], -Wp[..., 1]
            elif a[1] >= a[0]:
                u, v = Wp[..., 0], -Wp[..., 2]
            else:
                u, v = Wp[..., 1], -Wp[..., 2]
            if art[0] == 'schiefer' and a[2] < 0.97:                                   # Dachflächen: Reihen laufen entlang der Traufe
                u, v = (Wp[..., 0] if a[0] < a[1] else Wp[..., 1]), -(Wp[..., 2] + Wp[..., 1] * 0.0)
            px = ((u * F / m) % T.shape[1]).astype(int); py = ((v * F / m) % T.shape[0]).astype(int)
            c = T[py, px]
            if art[2] is not None:                                                      # eingefärbt: Helligkeit der Textur, Farbe des Modells
                c = c.mean(-1, keepdims=True) / max(1.0, float(T.mean())) * np.array(art[2], np.float32)
        h = 0.5 + 0.62 * max(0.0, float(n @ licht))
        bild[ausschnitt][neu] = np.clip(c[neu] * h, 0, 255)
        tiefe[ausschnitt][neu] = t[neu]; deck[ausschnitt][neu] = 1
    if M.get('moos'):                                                                   # Ruinen: Moos und Efeu in Flecken, nach unten dichter
        rng = np.random.default_rng(len(M['teile'][0]) * 7 + 3); hh, ww = deck.shape
        fl = np.zeros((hh, ww), np.float32); yy, xx = np.mgrid[0:hh, 0:ww]
        for _ in range(int(deck.sum() / 900) + 8):
            ys, xs = np.where(deck > 0.5); i = rng.integers(0, len(ys)); r = rng.uniform(4, 11) * K
            fl = np.maximum(fl, np.clip(1 - ((xx - xs[i]) ** 2 + (yy - ys[i]) ** 2 * 1.6) / (r * r), 0, 1) * (0.5 + 0.5 * ys[i] / hh))
        fl = np.clip(fl * 1.6, 0, 1) * deck
        gruen = np.array((84, 116, 52), np.float32) * (0.85 + 0.3 * rng.random((hh, ww, 1)).astype(np.float32))
        bild[:] = bild * (1 - fl[..., None] * 0.85) + gruen * fl[..., None] * 0.85
    # Schatten: Grundriss nach Nordosten versetzt, weich
    a = Image.fromarray((deck * 255).astype(np.uint8))
    rgba = np.dstack([bild, deck * 255]).astype(np.uint8)
    im = Image.fromarray(rgba, 'RGBA')
    gx0, gx1 = alle[:, 0].min(), alle[:, 0].max(); gd0, gd1 = alle[:, 1].min(), alle[:, 1].max(); hz = alle[:, 2].max()
    from PIL import ImageDraw
    sch = Image.new('L', im.size, 0); d = ImageDraw.Draw(sch)
    ecken = np.array([[gx0, gd0, 0], [gx1 + 0.25 * hz * 0.4, gd0, 0], [gx1 + 0.35 * hz * 0.4, gd1 + 0.3 * hz * 0.4, 0], [gx0 + 0.1, gd1 + 0.3 * hz * 0.4, 0]])
    d.polygon([tuple(p) for p in ((S(ecken) - [x0, y0]) * K)], fill=150)
    sch = np.asarray(sch.filter(ImageFilter.GaussianBlur(9 * K))).astype(np.float32) / 255 * 0.55
    sch = sch * (1 - deck)
    unten = np.zeros((im.height, im.width, 4), np.float32); unten[..., :3] = (10, 12, 6); unten[..., 3] = sch * 255
    im = Image.alpha_composite(Image.fromarray(unten.astype(np.uint8), 'RGBA'), im)
    # dunkle Kontur außen
    al = np.asarray(a).astype(np.float32); aussen = np.asarray(a.filter(ImageFilter.MaxFilter(3))).astype(np.float32) - al
    kontur = np.zeros((im.height, im.width, 4), np.uint8); kontur[..., :3] = 24; kontur[..., 3] = np.clip(aussen * 0.6, 0, 255).astype(np.uint8)
    im = Image.alpha_composite(im, Image.fromarray(kontur, 'RGBA'))
    im = im.resize((W, H), Image.LANCZOS)
    fx, fy = -x0, -y0
    return im, [round(fx / W, 4), round(fy / H, 4)], (gx1 - gx0, gd1 - gd0)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    vorschau = sys.argv[sys.argv.index('--vorschau') + 1] if '--vorschau' in sys.argv else None
    if vorschau:
        args = [a for a in args if a != vorschau]
    bib = json.load(open(BIB, encoding='utf8')); bilder = []
    for kennung in args or list(MODELLE):
        M = MODELLE[kennung]; im, anker, (b, t) = render(M)
        os.makedirs(ZIEL, exist_ok=True); im.save(os.path.join(ZIEL, kennung + '.webp'), quality=90, method=6)
        a = np.asarray(im.getchannel('A')) > 200; ys, xs = np.where(a)
        if M.get('klein'):
            koll = {'art': 'kreis', 'r': 0.25}
        elif M.get('durchgang'):          # Torhaus: die Pfeiler sperrt das Gebiet (kollision.sperren), der Durchgang bleibt frei
            koll = None
        else:
            koll = {'art': 'rechteck', 'x': round(-b / 2, 2), 'y': round(-t, 2), 'b': round(b, 2), 'h': round(t, 2)}
        eintrag = {'id': kennung, 'name': M['name'], 'kategorie': M.get('kategorie', 'gebaeude'), 'bild': f'img/welt/gebaeude/kenney/{kennung}.webp', 'groesse': [im.width, im.height],
                   'anker': anker, 'massstab': 1, 'kollision': koll, 'tiefe': 'fuss',
                   'durchscheinend': True, 'interaktion': None, 'sichtbar': [int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1],
                   'herkunft': f'Form: Kenney {M["paket"]} kit (CC0, werkzeug/welt/kenney/{M["paket"]}/License.txt); Texturen selbst gerechnet (gebaeude.tex) – frei verwendbar'}
        bib['objekte'] = [o for o in bib['objekte'] if o['id'] != kennung] + [eintrag]; bilder.append(im)
        print(f'  {kennung}: {im.width} × {im.height} px, Grundfläche {b:.1f} × {t:.1f} Felder')
    with open(BIB, 'w', encoding='utf8') as f:
        json.dump(bib, f, ensure_ascii=False, indent=1); f.write('\n')
    if vorschau:
        G = Image.new('RGB', (sum(i.width for i in bilder) + 40 * (len(bilder) + 1), max(i.height for i in bilder) + 40), (96, 134, 62)); x = 40
        for i in bilder:
            G.paste(i, (x, G.height - 20 - i.height), i); x += i.width + 40
        G.save(vorschau)


if __name__ == '__main__':
    main()
