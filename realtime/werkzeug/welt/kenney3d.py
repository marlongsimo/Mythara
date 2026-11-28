"""
World Pipeline – Kenney-Modelle (CC0) als 3D-Formen für die 3D-Welt (echtzeit/welt3d/modelle.json, 22.11.2026).

  python3 werkzeug/welt/kenney3d.py

Nimmt dieselben Modelle und Materialien wie kenney.py (dort: MODELLE, dreiecke) und schreibt je Kennung die Dreiecke relativ zum Fuß
(Mitte der Südkante, wie im 2D-Bild) mit Muster und Farbe. Achsen der 3D-Welt: x Osten, y oben, z Süden (Norden = −z).
"""
import json, os, sys
import numpy as np

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import kenney                     # noqa: E402

WURZEL = os.path.normpath(os.path.join(HIER, '..', '..', '..'))
ZIEL = os.path.join(WURZEL, 'echtzeit', 'welt3d', 'modelle.json')
# Material aus kenney.py → Muster der 3D-Welt und Grundfarbe (wenn das Material keine eigene Tönung hat)
MUSTER = {'quader': ('stein', (168, 156, 138)), 'stein': ('stein', (142, 138, 128)), 'fels': ('stein', (128, 124, 116)), 'schiefer': ('schindel', (78, 86, 100)),
          'holz': ('holz', (122, 86, 54)), 'laub': ('laub', (92, 126, 64)), 'stoff': ('putz', (170, 60, 50)), 'farbe': ('glatt', (150, 140, 130))}


def main():
    aus = {}
    for kennung, M in kenney.MODELLE.items():
        try:
            tris = kenney.dreiecke(M)
        except FileNotFoundError as e:
            print('  fehlt:', kennung, e); continue
        alle = np.concatenate([t[0] for t in tris]); fx, fd = (alle[:, 0].min() + alle[:, 0].max()) / 2, alle[:, 1].min()
        gruppen = {}
        for P, art in tris:
            muster, grund = MUSTER.get(art[0], ('glatt', (150, 140, 130)))
            farbe = art[1] if art[0] == 'farbe' else (art[2] if len(art) > 2 and art[2] is not None else grund)
            k = (muster, tuple(int(round(c)) for c in farbe))
            pts = [[round(float(p[0] - fx), 3), round(float(p[2]), 3), round(float(-(p[1] - fd)), 3)] for p in P]
            gruppen.setdefault(k, []).extend(c for p in pts for c in p)
        aus[kennung] = [{'muster': m, 'farbe': '#%02x%02x%02x' % f, 'p': p} for (m, f), p in gruppen.items()]
        print(f'  {kennung}: {len(tris)} Dreiecke')
    os.makedirs(os.path.dirname(ZIEL), exist_ok=True)
    json.dump(aus, open(ZIEL, 'w'), separators=(',', ':'))
    print(f'Kenney-Modelle: {len(aus)} → {os.path.relpath(ZIEL, WURZEL)} ({os.path.getsize(ZIEL) // 1024} KB)')


if __name__ == '__main__':
    main()
