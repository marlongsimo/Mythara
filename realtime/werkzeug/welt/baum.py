"""
World Pipeline – stilisierte Bäume im neuen Spielstil (wie die Heldenbilder: handgemalt, kräftige Formen, warmes Licht, kühle Schatten, dicke Kontur).
Ohne Bildvorlage gezeichnet, also frei von Lizenzfragen.

  python3 werkzeug/welt/baum.py [kennung …] [--vorschau bild.png]

Arten: laub (runde Krone aus Laubballen), tanne (gestufte, gewellte Kegel), busch (niedrige Ballen).
Schreibt img/welt/stil/<kennung>.webp und die Einträge in welt/bibliothek/objekte.json (Kategorie bewuchs, Fuß am Stammfuß).
"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HIER = os.path.dirname(os.path.abspath(__file__))
REALTIME = os.path.normpath(os.path.join(HIER, '..', '..'))
WURZEL = os.path.normpath(os.path.join(REALTIME, '..'))
BIB = os.path.join(REALTIME, 'welt', 'bibliothek', 'objekte.json')
ZIEL = os.path.join(WURZEL, 'img', 'welt', 'stil')
K = 2
SCHATTEN_BLAU = np.array((52, 66, 108), np.float32)    # kühle Schattenfarbe (wie die Schatten an Rüstung und Umhang)

BAEUME = {
    # krone: (Breite, Stammhöhe bis zum Kronenansatz, Kronenhöhe) in Bildpunkten
    'stil_eiche_01': dict(art='laub', b=300, h=330, krone=(270, 70, 230), ballen=16, gruen=(104, 146, 62), stamm=(112, 78, 52), dicke=22, saat=1),
    'stil_eiche_02': dict(art='laub', b=270, h=290, krone=(240, 62, 200), ballen=13, gruen=(92, 138, 58), stamm=(104, 72, 50), dicke=20, saat=2),
    'stil_linde_01': dict(art='laub', b=340, h=390, krone=(310, 80, 280), ballen=20, gruen=(118, 156, 66), stamm=(116, 82, 56), dicke=26, saat=3),
    'stil_herbst_01': dict(art='laub', b=270, h=300, krone=(240, 64, 210), ballen=14, gruen=(196, 132, 56), stamm=(108, 74, 50), dicke=20, saat=4),
    'stil_tanne_01': dict(art='tanne', b=190, h=360, stufen=5, gruen=(58, 104, 70), stamm=(96, 66, 46), saat=5),
    'stil_tanne_02': dict(art='tanne', b=170, h=300, stufen=4, gruen=(66, 112, 74), stamm=(96, 66, 46), saat=6),
    'stil_erle_tot_01': dict(art='tot', b=330, h=320, stamm=(86, 70, 58), saat=11),
    'stil_erle_tot_02': dict(art='tot', b=280, h=270, stamm=(78, 66, 56), saat=12),
    'stil_birke_01': dict(art='laub', b=0, h=0, krone=(170, 120, 210), ballen=9, gruen=(206, 168, 64), stamm=(226, 222, 210), dicke=13, birke=True, saat=13),
    'stil_schilf_01': dict(art='schilf', b=110, h=110, saat=14),
    'stil_schilf_02': dict(art='schilf', b=150, h=96, saat=15),
    'stil_moorlicht_01': dict(art='licht', b=110, h=150, saat=16),
    'stil_apfel_01': dict(art='laub', b=0, h=0, krone=(200, 50, 150), ballen=10, gruen=(100, 144, 60), stamm=(110, 78, 52), dicke=16, aepfel=True, saat=17),
    'stil_apfel_02': dict(art='laub', b=0, h=0, krone=(180, 46, 136), ballen=9, gruen=(110, 150, 62), stamm=(110, 78, 52), dicke=15, aepfel=True, saat=18),
    'stil_busch_01': dict(art='busch', b=150, h=96, ballen=6, gruen=(98, 142, 60), saat=7),
    'stil_busch_02': dict(art='busch', b=120, h=84, ballen=5, gruen=(110, 150, 64), saat=8, beeren=True),
}
LICHT = np.array([-0.62, -0.78])                       # Licht von oben links (Bildkoordinaten)


class Blatt:
    def __init__(self, b, h):
        self.b, self.h = b * K, h * K
        self.rgb = np.zeros((self.h, self.b, 3), np.float32); self.a = np.zeros((self.h, self.b), np.float32)
        self.yy, self.xx = np.mgrid[0:self.h, 0:self.b].astype(np.float32)

    def maske(self, punkte):
        m = Image.new('L', (self.b, self.h), 0); ImageDraw.Draw(m).polygon([(x * K, y * K) for x, y in punkte], fill=255)
        return np.asarray(m.filter(ImageFilter.GaussianBlur(0.6 * K))).astype(np.float32) / 255

    def lege(self, farbe, m):
        f = farbe if isinstance(farbe, np.ndarray) and farbe.ndim == 3 else np.broadcast_to(np.array(farbe, np.float32), self.rgb.shape)
        self.rgb = self.rgb * (1 - m[..., None]) + f * m[..., None]; self.a = np.maximum(self.a, m)

    def fertig(self, kontur=True):
        rgb = np.clip(self.rgb, 0, 255).astype(np.uint8); a = (np.clip(self.a, 0, 1) * 255).astype(np.uint8)
        im = Image.fromarray(np.dstack([rgb, a]), 'RGBA')
        if kontur:
            A = im.getchannel('A'); rand = np.asarray(A.filter(ImageFilter.MaxFilter(7))).astype(np.float32) - np.asarray(A).astype(np.float32)
            k = Image.fromarray(np.dstack([np.full((self.h, self.b, 3), 24, np.uint8), np.clip(rand * 0.9, 0, 255).astype(np.uint8)]), 'RGBA')
            im = Image.alpha_composite(k, im)
        return im.resize((self.b // K, self.h // K), Image.LANCZOS)


def ballen_umriss(cx, cy, r, rng, zacken=9, tiefe=0.09):
    """Gewellter Rand eines Laubballens: rundliche Bögen statt einzelner Blätter"""
    ph = rng.uniform(0, 6.3); pk = []
    for t in np.linspace(0, 2 * math.pi, 72, endpoint=False):
        rr = r * (1 + tiefe * (0.5 + 0.5 * math.cos(zacken * t + ph)) ** 2.2 - tiefe * 0.4 + 0.03 * math.sin(3 * t + ph * 2))
        pk.append((cx + math.cos(t) * rr, cy + math.sin(t) * rr * 0.92))
    return pk


def ballen(B, cx, cy, r, farbe, rng, hell=1.0):
    """Ein Laubballen: Grundton, Verlauf zum Licht, kühler Schatten unten rechts, Lichtkante und ein paar aufgemalte Glanzbögen"""
    m = B.maske(ballen_umriss(cx, cy, r, rng))
    dx, dy = (B.xx / K - cx) / r, (B.yy / K - cy) / r
    licht = np.clip(-(dx * LICHT[0] + dy * LICHT[1]), -1, 1)                    # +1 zum Licht hin
    f = np.array(farbe, np.float32) * hell
    warm = f * np.array((1.14, 1.12, 0.92)); kalt = f * 0.55 + SCHATTEN_BLAU * 0.45
    t = (licht[..., None] + 1) / 2
    farbe_feld = kalt * (1 - t) ** 1.3 + warm * t ** 0.9 + f * 0.0
    # Rand etwas dunkler: Ballen wirken rund
    rand = np.clip(np.hypot(dx, dy) - 0.72, 0, 0.3) / 0.3
    farbe_feld = farbe_feld * (1 - 0.22 * rand[..., None])
    B.lege(farbe_feld, m)
    # Glanzbögen auf der Lichtseite
    for _ in range(int(r / 9)):
        w = rng.uniform(-2.6, -1.2); rr = r * rng.uniform(0.35, 0.8); x, y = cx + math.cos(w) * rr, cy + math.sin(w) * rr * 0.9; s = rng.uniform(4, 8)
        bg = Image.new('L', (B.b, B.h), 0); ImageDraw.Draw(bg).arc([(x - s) * K, (y - s * 0.6) * K, (x + s) * K, (y + s * 0.6) * K], 200, 340, fill=255, width=int(2.2 * K))
        B.lege(np.array(farbe, np.float32) * 1.42 * hell, np.asarray(bg).astype(np.float32) / 255 * 0.85 * m)


def stamm(B, x, yb, yo, breit, farbe, rng):
    breit = breit * 0.8
    """Kräftiger, leicht geschwungener Stamm mit Wurzelansatz und zwei Ästen in die Krone"""
    schwung = rng.uniform(-6, 6)
    links = [(x - breit * 0.95, yb), (x - breit * 0.55, yb - 10), (x - breit * 0.48 + schwung * 0.5, (yb + yo) / 2), (x - breit * 0.36 + schwung, yo)]
    rechts = [(x + breit * 0.36 + schwung, yo), (x + breit * 0.48 + schwung * 0.5, (yb + yo) / 2), (x + breit * 0.55, yb - 10), (x + breit * 0.95, yb)]
    m = B.maske(links + rechts)
    rel = np.clip((B.xx / K - x) / breit, -1, 1)
    f = np.array(farbe, np.float32)
    feld = f[None, None, :] * (1.15 - 0.45 * (rel[..., None] + 1) / 2)
    feld = feld * (1 + 0.06 * np.sin(B.yy / K / 6 + rel * 3)[..., None])                   # Rindenstreifen, weich
    B.lege(feld, m)
    for seite in (-1, 1):                                                               # zwei Äste
        ax, ay = x + schwung * 0.8, yo + (yb - yo) * 0.15
        pk = [(ax - 4, ay), (ax + seite * breit * 1.5, ay - 34), (ax + seite * breit * 1.6, ay - 40), (ax + 4, ay - 6)]
        B.lege(f * 0.86, B.maske(pk))


def schatten(B, cx, yb, rx, ry):
    m = Image.new('L', (B.b, B.h), 0); ImageDraw.Draw(m).ellipse([(cx - rx + 8) * K, (yb - ry) * K, (cx + rx + 14) * K, (yb + ry) * K], fill=150)
    m = np.asarray(m.filter(ImageFilter.GaussianBlur(7 * K))).astype(np.float32) / 255 * 0.5
    B.a = np.maximum(B.a, m)


def laub(P, rng):
    kb, kh, ky = P['krone']; W, H = int(kb * 1.12 + 30), int(kh + ky * 1.1 + 40); B = Blatt(W, H); cx = W / 2; yb = H - 16
    schatten(B, cx, yb, kb * 0.4, 15)
    stamm(B, cx, yb, yb - kh - ky * 0.25, P.get('dicke', 18), P['stamm'], rng)
    if P.get('birke'):
        for _ in range(9):
            y = yb - rng.uniform(8, kh + ky * 0.2); x = cx + rng.uniform(-5, 3)
            B.lege((40, 36, 34), B.maske([(x - 5, y), (x + 4, y - 1), (x + 4, y + 2), (x - 5, y + 2)]))
    kcy = yb - kh - ky * 0.48                                                            # Kronenmitte
    # Ballen füllen eine Ellipse; hintere (oben) zuerst, vordere (unten) zuletzt. Unter jedem Ballen ein weicher Schatten (Tiefe zwischen den Ballen).
    lagen = [(kcy - ky * 0.32, cx, 0.3 * min(kb, ky))]
    for i in range(P['ballen']):
        w = rng.uniform(0, 2 * math.pi); rr = math.sqrt(rng.uniform(0.05, 1))
        x = cx + math.cos(w) * rr * (kb * 0.5 - 0.22 * kb * 0.6); y = kcy + math.sin(w) * rr * (ky * 0.5 - 0.2 * ky * 0.6)
        lagen.append((y, x, rng.uniform(0.2, 0.27) * (kb + ky) / 2))
    for y, x, r in sorted(lagen):
        sch = np.exp(-(((B.xx / K - x - r * 0.15) / (r * 1.05)) ** 2 + ((B.yy / K - y - r * 0.25) / (r * 1.0)) ** 2) * 2.2) * (B.a > 0.5)
        B.rgb = B.rgb * (1 - 0.35 * sch[..., None]) + SCHATTEN_BLAU * 0.35 * sch[..., None]
        hell = 0.86 + 0.24 * (1 - (y - (kcy - ky * 0.5)) / ky)
        ballen(B, x, y, r, P['gruen'], rng, max(0.8, min(1.1, hell)))
    if P.get('aepfel'):
        for _ in range(26):
            x, y = cx + rng.uniform(-kb * 0.4, kb * 0.4), kcy + rng.uniform(-ky * 0.35, ky * 0.4)
            if B.a[int(y * K), int(x * K)] < 0.9: continue
            m = np.exp(-(((B.xx / K - x) ** 2 + (B.yy / K - y) ** 2) / 9)); B.lege((206, 52, 46), np.clip(m * 1.8, 0, 1)); B.lege((250, 150, 130), np.clip(np.exp(-(((B.xx / K - x + 1) ** 2 + (B.yy / K - y + 1) ** 2) / 1.5)) * 1.5, 0, 1))
    return B, [0.5, round(yb / H, 4)], {'art': 'kreis', 'r': 0.45}


def tanne(P, rng):
    W, H = P['b'], P['h']; B = Blatt(W, H); cx = W / 2; yb = H - 12
    schatten(B, cx, yb, W * 0.36, 12)
    stamm(B, cx, yb, yb - 40, 10, P['stamm'], rng)
    n = P['stufen']; spitze = 14; unten = yb - 26
    for i in range(n):                                                                   # von oben nach unten: untere Stufen verdecken die oberen
        t0 = i / n; t1 = (i + 1.25) / n
        y0 = spitze + (unten - spitze) * t0; y1 = spitze + (unten - spitze) * min(1, t1)
        hb = (W * 0.46) * (0.3 + 0.7 * min(1, t1))
        pk = [(cx, y0)]
        for t in np.linspace(0, 1, 26):                                                  # gewellte Unterkante
            x = cx + hb - 2 * hb * t; y = y1 + 6 * abs(math.sin(t * math.pi * (3 + i))) - 3 * math.sin(t * math.pi)
            pk.append((x, y))
        m = B.maske(pk)
        rel = (B.xx / K - cx) / max(1, hb); f = np.array(P['gruen'], np.float32)
        warm = f * np.array((1.18, 1.14, 0.94)); kalt = f * 0.55 + SCHATTEN_BLAU * 0.45
        t_ = np.clip((-rel + 1) / 2, 0, 1)[..., None] * np.clip(1.15 - (B.yy / K - y0) / max(1, (y1 - y0)) * 0.5, 0, 1)[..., None]
        B.lege(kalt * (1 - t_) + warm * t_, m)
        for _ in range(3):                                                               # Lichtkanten auf der linken Seite
            x = cx - hb * rng.uniform(0.2, 0.7); y = y0 + (y1 - y0) * rng.uniform(0.45, 0.85)
            bg = Image.new('L', (B.b, B.h), 0); ImageDraw.Draw(bg).line([(x * K, y * K), ((x + 10) * K, (y - 6) * K)], fill=255, width=int(2 * K))
            B.lege(f * 1.45, np.asarray(bg).astype(np.float32) / 255 * 0.7 * m)
    return B, [0.5, round(yb / H, 4)], {'art': 'kreis', 'r': 0.35}


def busch(P, rng):
    W, H = P['b'], P['h']; B = Blatt(W, H); cx = W / 2; yb = H - 8
    schatten(B, cx, yb, W * 0.42, 9)
    lagen = sorted([(yb - rng.uniform(22, 40), cx + rng.uniform(-W * 0.28, W * 0.28), rng.uniform(20, 30)) for _ in range(P['ballen'])])
    for y, x, r in lagen:
        ballen(B, x, y, r, P['gruen'], rng, 1.0)
    if P.get('beeren'):
        for _ in range(14):
            x, y = cx + rng.uniform(-W * 0.3, W * 0.3), yb - rng.uniform(16, 50); m = np.exp(-(((B.xx / K - x) ** 2 + (B.yy / K - y) ** 2) / 6)) * (B.a > 0.5)
            B.lege((196, 52, 60), np.clip(m * 1.6, 0, 1))
    return B, [0.5, round(yb / H, 4)], {'art': 'kreis', 'r': 0.6}


def tot(P, rng):
    """Tote Erle: kahler, knorriger Stamm mit verzweigten Ästen, Moos am Fuß"""
    W, H = P['b'], P['h']; B = Blatt(W, H); cx = W / 2; yb = H - 14
    schatten(B, cx, yb, W * 0.3, 12)
    f = np.array(P['stamm'], np.float32)
    def ast(x, y, w, l, dick, tiefe):
        x2, y2 = x + math.cos(w) * l, y - math.sin(w) * l
        pk = [(x - dick * math.sin(w), y - dick * math.cos(w) * 0.3), (x2 - dick * 0.35 * math.sin(w), y2), (x2 + dick * 0.35 * math.sin(w), y2), (x + dick * math.sin(w), y + dick * math.cos(w) * 0.3)]
        B.lege(f * (1.0 + 0.12 * math.cos(w)), B.maske(pk))
        if tiefe > 0:
            for d in (-0.5, 0.45):
                ast(x2, y2, w + d + rng.uniform(-0.2, 0.2), l * rng.uniform(0.55, 0.75), dick * 0.55, tiefe - 1)
    stamm(B, cx, yb, yb - H * 0.42, 14, P['stamm'], rng)
    for w in (1.0, 1.55, 2.15):
        ast(cx + rng.uniform(-3, 3), yb - H * 0.4, w + rng.uniform(-0.15, 0.15), H * rng.uniform(0.22, 0.3), 6, 2)
    for _ in range(18):                                                                  # Moos am Fuß
        x = cx + rng.uniform(-16, 16); y = yb - rng.uniform(0, 14); r = rng.uniform(3, 6)
        B.lege((96, 120, 56), B.maske([(x + math.cos(t) * r, y + math.sin(t) * r * 0.7) for t in np.linspace(0, 6.28, 10)]))
    return B, [0.5, round(yb / H, 4)], {'art': 'kreis', 'r': 0.35}


def schilf(P, rng):
    """Schilfbüschel mit Rohrkolben: viele schmale Halme, unten dunkel, oben hell"""
    W, H = P['b'], P['h']; B = Blatt(W, H); yb = H - 6
    for _ in range(int(W / 4)):
        x = W / 2 + rng.normal(0, W * 0.18); h = rng.uniform(H * 0.45, H * 0.92); w = rng.uniform(-0.25, 0.25); g = float(rng.uniform(0.8, 1.15))
        tip = (x + math.sin(w) * h, yb - math.cos(w) * h)
        B.lege((int(82 * g), int(104 * g), int(48 * g)), B.maske([(x - 2.2, yb), tip, (x + 2.2, yb)]))
        B.lege((int(140 * g), int(158 * g), int(78 * g)), B.maske([(x - 0.6, yb - h * 0.3), tip, (x + 1, yb - h * 0.35)]))
        if rng.random() < 0.18:                                                          # Rohrkolben
            cx_, cy_ = x + math.sin(w) * h * 0.8, yb - math.cos(w) * h * 0.8
            B.lege((104, 66, 40), B.maske([(cx_ - 3, cy_ - 9), (cx_ + 3, cy_ - 9), (cx_ + 3, cy_ + 5), (cx_ - 3, cy_ + 5)]))
    return B, [0.5, round(yb / H, 4)], None


def licht(P, rng):
    """Ein stilles Irrlicht: blasser, grünlich-weißer Lichtpunkt mit weichem Schein, schwebt über dem Wasser (ohne Kontur)"""
    W, H = P['b'], P['h']; B = Blatt(W, H); cx, cy = W / 2, H * 0.38
    d = np.hypot(B.xx / K - cx, B.yy / K - cy)
    schein = np.clip(1 - d / 48, 0, 1) ** 1.6 * 0.7; kern = np.clip(1 - d / 11, 0, 1) ** 0.6
    B.rgb[:] = np.array((214, 240, 220), np.float32); B.a = np.clip(schein + kern, 0, 1)
    return B, [0.5, 0.98], None


ARTEN = {'laub': laub, 'tanne': tanne, 'busch': busch, 'tot': tot, 'schilf': schilf, 'licht': licht}


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    vorschau = sys.argv[sys.argv.index('--vorschau') + 1] if '--vorschau' in sys.argv else None
    if vorschau:
        args = [a for a in args if a != vorschau]
    bib = json.load(open(BIB, encoding='utf8')); bilder = []
    os.makedirs(ZIEL, exist_ok=True)
    for kennung in args or list(BAEUME):
        P = BAEUME[kennung]; B, anker, koll = ARTEN[P['art']](P, np.random.default_rng(P['saat']))
        im = B.fertig(kontur=P['art'] != 'licht'); im.save(os.path.join(ZIEL, kennung + '.webp'), quality=90, method=6); bilder.append(im)
        eintrag = {'id': kennung, 'name': f"Stilbaum ({P['art']})", 'kategorie': 'sonderort' if P['art'] == 'licht' else 'bewuchs', 'bild': f'img/welt/stil/{kennung}.webp', 'groesse': [im.width, im.height],
                   'anker': anker, 'massstab': 1, 'kollision': koll, 'tiefe': 'fuss', 'durchscheinend': P['art'] not in ('busch', 'schilf', 'licht'), 'interaktion': None, 'spiegelbar': True,
                   'herkunft': 'erzeugt von werkzeug/welt/baum.py ohne Bildvorlage – frei verwendbar'}
        bib['objekte'] = [o for o in bib['objekte'] if o['id'] != kennung] + [eintrag]
        print(f'  {kennung}: {im.width} × {im.height}')
    with open(BIB, 'w', encoding='utf8') as f:
        json.dump(bib, f, ensure_ascii=False, indent=1); f.write('\n')
    if vorschau:
        G = Image.new('RGB', (sum(i.width for i in bilder) + 20 * (len(bilder) + 1), max(i.height for i in bilder) + 30), (96, 134, 62)); x = 20
        for i in bilder:
            G.paste(i, (x, G.height - 15 - i.height), i); x += i.width + 20
        G.save(vorschau)


if __name__ == '__main__':
    main()
