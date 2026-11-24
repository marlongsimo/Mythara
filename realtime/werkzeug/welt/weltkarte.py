"""
World Pipeline – Weltkarte aus den gebauten Chunks zusammensetzen.

  python3 werkzeug/welt/weltkarte.py [--px 128] [--ohne-dinge] [--ziel bild.webp]

Grundregel der Welt: Jeder Chunk ist gleich groß (32 × 32 Rechenfelder = 1536 × 1536 Bildpunkte) und liegt mit ganzen Chunk-Koordinaten
in einem gemeinsamen Raster; ein Gebiet besteht nur aus ganzen Chunks. Darum ist die Weltkarte einfach das Raster der Bodenbilder
(echtzeit/welt/<cx>_<cy>.webp), verkleinert auf --px Bildpunkte je Chunk, darüber Gebäude, Bäume und Dinge an ihrem Fußpunkt.
Leere Stellen im Raster (noch nicht gebaute Gebiete) bleiben dunkel.
"""
import json, os, re, sys
from PIL import Image

HIER = os.path.dirname(os.path.abspath(__file__))
WURZEL = os.path.normpath(os.path.join(HIER, '..', '..', '..'))
WELT = os.path.join(WURZEL, 'echtzeit', 'welt')


def main():
    px = int(sys.argv[sys.argv.index('--px') + 1]) if '--px' in sys.argv else 128
    ziel = sys.argv[sys.argv.index('--ziel') + 1] if '--ziel' in sys.argv else os.path.join(WELT, 'weltkarte.webp')
    index = json.load(open(os.path.join(WELT, 'welt.json'), encoding='utf8'))
    feld, cf = index.get('feldPx', 48), index.get('chunkFelder', 32)
    cpx = feld * cf; s = px / cpx                                     # Verkleinerung Welt -> Karte
    chunks = sorted((int(m.group(1)), int(m.group(2))) for f in os.listdir(WELT) for m in [re.match(r'^(\d+)_(\d+)\.json$', f)] if m)
    x0, y0 = min(c[0] for c in chunks), min(c[1] for c in chunks); x1, y1 = max(c[0] for c in chunks), max(c[1] for c in chunks)
    K = Image.new('RGBA', ((x1 - x0 + 1) * px, (y1 - y0 + 1) * px), (16, 20, 14, 255))
    unten = {(r['region']['ursprung'][0] + i, r['region']['ursprung'][1] + j) for r in index['regionen'].values() if r['region'].get('ebene') for i in range(r['region']['chunks'][0]) for j in range(r['region']['chunks'][1])}
    chunks = [c for c in chunks if c not in unten]; x0, y0 = min(c[0] for c in chunks), min(c[1] for c in chunks); x1, y1 = max(c[0] for c in chunks), max(c[1] for c in chunks)
    K = Image.new('RGBA', ((x1 - x0 + 1) * px, (y1 - y0 + 1) * px), (16, 20, 14, 255))
    dinge = []
    for cx, cy in chunks:
        d = json.load(open(os.path.join(WELT, f'{cx}_{cy}.json'), encoding='utf8'))
        b = os.path.join(WELT, d.get('boden') or f'{cx}_{cy}.webp')
        if os.path.exists(b):
            K.paste(Image.open(b).convert('RGBA').resize((px, px), Image.LANCZOS), ((cx - x0) * px, (cy - y0) * px))
        dinge += d.get('objekte', [])
    if '--ohne-dinge' not in sys.argv:
        cache = {}
        for p in sorted(dinge, key=lambda p: p['y']):
            o = index['objekte'].get(p['objekt'])
            if not o:
                continue
            k = (p['objekt'], p.get('s', 1), bool(p.get('spiegeln')))
            if k not in cache:
                im = Image.open(os.path.join(WURZEL, o['bild'])).convert('RGBA'); f = s * o.get('massstab', 1) * p.get('s', 1)
                im = im.resize((max(1, round(im.width * f)), max(1, round(im.height * f))), Image.LANCZOS)
                cache[k] = im.transpose(Image.FLIP_LEFT_RIGHT) if p.get('spiegeln') else im
            im = cache[k]; ax = (1 - o['anker'][0]) if p.get('spiegeln') else o['anker'][0]
            X = (p['x'] * feld - x0 * cpx) * s - ax * im.width; Y = (p['y'] * feld - y0 * cpx) * s - o['anker'][1] * im.height
            K.alpha_composite(im, (int(round(X)), int(round(Y)))) if X >= 0 and Y >= 0 else K.paste(im, (int(round(X)), int(round(Y))), im)
    # Kartensymbole (aus welt.json): an ihrer Stelle, fest gut 1/4 Chunk groß
    sym_ordner = os.path.join(WURZEL, 'img', 'karte', 'symbole'); groesse = max(16, int(px * 0.26))
    liste = []
    for r in index['regionen'].values():
        for q in r.get('symbole', []):
            p = os.path.join(sym_ordner, q['s'] + '.webp')
            if not os.path.exists(p) or (int(q['x'] // cf), int(q['y'] // cf)) not in set(chunks):
                continue
            liste.append([p, (q['x'] * feld - x0 * cpx) * s, (q['y'] * feld - y0 * cpx) * s, 0.0, 0.0])
    # dicht beieinander (Ofen, Amboss, Händler vor einer Schmiede): auseinanderschieben, bis jedes ganz zu sehen ist (wie Minikarte und Übersicht)
    abstand = groesse * 0.88
    for _ in range(60):
        bewegt = False
        for i in range(len(liste)):
            for j in range(i + 1, len(liste)):
                a, b = liste[i], liste[j]; ax, ay = a[1] + a[3] - b[1] - b[3], a[2] + a[4] - b[2] - b[4]; d = (ax * ax + ay * ay) ** 0.5
                if d >= abstand - 0.01:
                    continue
                bewegt = True
                if d < 0.01:
                    ax, ay, d = (-1 if a[1] <= b[1] else 1), 0, 1
                sch = (abstand - d) / 2 + 0.05; a[3] += ax / d * sch; a[4] += ay / d * sch; b[3] -= ax / d * sch; b[4] -= ay / d * sch
        if not bewegt:
            break
    for p, x, y, dx, dy in liste:
        im = Image.open(p).convert('RGBA'); im.thumbnail((groesse, groesse), Image.LANCZOS)
        X = int(round(x + dx - im.width / 2)); Y = int(round(y + dy - im.height * 0.58))
        K.alpha_composite(im, (max(0, X), max(0, Y)))
    K.convert('RGB').save(ziel, quality=88, method=6)
    print(f'Weltkarte: {len(chunks)} Chunks ({x0}|{y0} bis {x1}|{y1}), {K.width} × {K.height} px → {os.path.relpath(ziel, WURZEL)}')


if __name__ == '__main__':
    main()
