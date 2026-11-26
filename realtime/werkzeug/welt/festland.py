"""
World Pipeline – das erste Festland und die Hochlande-Insel (26.11.2026): nur Gelände und Höhen, keine Bäume, Orte, Wege oder Figuren.
Liest welt/festland/vorlage.png (aus festland_vorlage.py) und rechnet Feld für Feld über den ganzen Weltrahmen (Chunks 186–260 × 155–253),
außer dem Rechteck der heutigen Karte (192–211 × 198–210). Ergebnis: 34 Regionen fl_<cx>_<cy> mit gelaende.txt, hoehen.json, leeren Objekten.
  Länder: Fahle Weiten (Tundra → Wiese, Wald), Umland der Splitterlande (Wiese, Wald, Moorwiese), Smaragdküste (Dschungel, Wiese),
          Glutsande (Steppe → Dünen, grüne Inseln), Ockerlande (Steppe, Dünen, Geröll), Weißes Ende (Schnee, Geröll); Gebirge mit Felswänden.
  Nahe der heutigen Karte gilt deren Rand (Wald bleibt Wald, Moor bleibt Moor); der Fluss von Graufurt läuft nach Norden ins Splittermeer
  und nach Süden zur Ostküste der Glutsande, der Graben von Weidenhain in einen kleinen See.
Alle Regionen tragen "nahtlos": "festland" – sie stammen aus einem Guss, ihre Grenzen sind von selbst bündig.
Aufruf (im Ordner realtime): python3 werkzeug/welt/festland.py [--vorschau bild.png]
"""
import json, math, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

HIER = os.path.dirname(os.path.abspath(__file__)); WELT = os.path.normpath(os.path.join(HIER, '..', '..', 'welt'))
C = 32; CX0, CX1, CY0, CY1 = 186, 261, 155, 254; X0, Y0 = CX0 * C, CY0 * C; W, H = (CX1 - CX0) * C, (CY1 - CY0) * C
AX0, AX1, AY0, AY1 = 192 * C, 212 * C, 198 * C, 211 * C            # die heutige Karte
FELD_JE_PX = C / 13.0
rng = np.random.default_rng(20261126)

def rauschen(skala, saat):
    """glattes Rauschen −1 … 1 über das ganze Feldraster (Skala in Feldern)"""
    r = np.random.default_rng(saat); gh, gw = int(H / skala) + 4, int(W / skala) + 4
    g = ndimage.zoom(r.standard_normal((gh, gw)).astype(np.float32), skala, order=3)[:H, :W]
    return np.clip(g / 1.6, -1, 1)
def fbm(skala, saat, stufen=4):
    s = np.zeros((H, W), np.float32); amp = 1.0; t = 0
    for k in range(stufen): s += amp * rauschen(max(2.0, skala / 2 ** k), saat + k); t += amp; amp *= 0.5
    return s / t

print('Vorlage lesen …')
V = np.asarray(Image.open(os.path.join(WELT, 'festland', 'vorlage.png')).convert('RGBA')).astype(np.float32)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
# Bildpunkte der Vorlage für jedes Feld, mit Verwerfung (natürliche Küsten und Ländergrenzen)
warp_x = fbm(90, 1) * 7 + fbm(22, 2) * 1.6; warp_y = fbm(90, 3) * 7 + fbm(22, 4) * 1.6     # in Bildpunkten
px = (xx + 0.5) / FELD_JE_PX + warp_x; py = (yy + 0.5) / FELD_JE_PX + warp_y
def probe(kanal, ordnung=1, glaetten=0):
    k = V[..., kanal] if not glaetten else ndimage.gaussian_filter(V[..., kanal], glaetten)
    return ndimage.map_coordinates(k, [py.ravel(), px.ravel()], order=ordnung, mode='nearest').reshape(H, W)
landfeld = probe(0, 1, 0) if False else ndimage.map_coordinates(ndimage.gaussian_filter((V[..., 0] > 0).astype(np.float32), 1.0), [py.ravel(), px.ravel()], order=1, mode='nearest').reshape(H, W)
klasse = probe(0, 0).astype(np.uint8)
berg = probe(1, 1, 1.5) / 255; trocken = probe(2, 1, 2) / 255; wald = probe(3, 1, 1.5) / 255
n1, n2, n3 = fbm(40, 11), fbm(12, 12, 3), fbm(160, 13, 3)

# ───── die heutige Karte: Abstand und Randzeichen ─────
print('Rand der heutigen Karte …')
alt = np.full((AY1 - AY0, AX1 - AX0), 'M', dtype='<U1')
for n in os.listdir(os.path.join(WELT, 'regionen')):
    p = os.path.join(WELT, 'regionen', n, 'region.json')
    if not os.path.exists(p) or n.startswith('fl_'): continue
    r = json.load(open(p, encoding='utf8'))
    if r.get('ebene') or r.get('entwurf'): continue
    ux, uy = r['ursprung'][0] * C - AX0, r['ursprung'][1] * C - AY0
    if ux < 0 or uy < 0 or ux >= AX1 - AX0 or uy >= AY1 - AY0: continue
    for j, z in enumerate(open(os.path.join(WELT, 'regionen', n, 'gelaende.txt'), encoding='utf8').read().split('\n')):
        if z and 0 <= uy + j < AY1 - AY0: alt[uy + j, ux:ux + len(z)] = list(z)
wx = xx + X0 + 0.5; wy = yy + Y0 + 0.5
innen = (wx >= AX0) & (wx < AX1) & (wy >= AY0) & (wy < AY1)
dax = np.maximum(np.maximum(AX0 - wx, 0), wx - AX1); day = np.maximum(np.maximum(AY0 - wy, 0), wy - AY1); o = np.hypot(dax, day)
kx = np.clip(np.floor(wx) - AX0, 0, AX1 - AX0 - 1).astype(int); ky = np.clip(np.floor(wy) - AY0, 0, AY1 - AY0 - 1).astype(int)
rand = alt[ky, kx]
WASSER_ALT = np.isin(rand, ['~', 'o', 'w'])

# ───── Land und Meer ─────
land = landfeld + 0.06 * n2 > 0.5
land |= (o < 14) & ~innen & ~WASSER_ALT                     # an der heutigen Karte: erst Land, dann Küste
land = ndimage.binary_opening(land, iterations=2) | (o < 14) & ~innen & ~WASSER_ALT
e = ndimage.distance_transform_edt(land).astype(np.float32)   # Abstand zum Meer in Feldern

# ───── Gelände nach Land ─────
print('Gelände …')
G = np.full((H, W), 'M', dtype='<U1')
breite_nord = (wy - 5700) / 450                                   # Fahle Weiten: Norden karg, Süden grün
basis = np.full((H, W), '.', dtype='<U1')
k1 = klasse == 1; k2 = klasse == 2; k3 = klasse == 3; k4 = klasse == 4; k5 = klasse == 5; k6 = (klasse == 6) | (klasse == 0)
k7 = klasse == 7; k8 = klasse == 8; k9 = klasse == 9          # Hochlande-Insel: Hochlande, Frostkrone, Drachenarm
basis[k1] = np.where(breite_nord[k1] + 0.6 * n1[k1] < 0.35, np.where(n2[k1] > 0.6, 'g', 'T'), np.where(wald[k1] + 0.2 * n2[k1] > 0.55, 'f', np.where(n2[k1] > 0.45, ',', '.')))
basis[k6] = np.where(wald[k6] + 0.25 * n1[k6] > 0.5, 'f', np.where(n2[k6] > 0.55, 'v', np.where(n1[k6] > 0.35, ',', '.')))
basis[k2] = np.where(wald[k2] + 0.35 * n1[k2] > 0.35, 'j', np.where(n2[k2] > 0.5, 'v', '.'))
dt = trocken + 0.12 * n1 + 0.05 * n2
basis[k3] = np.where(dt[k3] > 0.62, 'u', np.where(dt[k3] > 0.5, 'y', np.where(wald[k3] > 0.45, 'f', '.')))
basis[k4] = np.where(dt[k4] > 0.72, 'u', np.where(dt[k4] > 0.42, 'y', '.'))
basis[k5] = np.where(n2[k5] > 0.5, 'g', 'S')
# Hochlande: Grasland und Bergwald, im Norden karger; Frostkrone: Schnee und Fels, am Südrand Tundra; Drachenarm: trockene, felsige Halbinsel
basis[k7] = np.where(wald[k7] + 0.25 * n1[k7] > 0.5, 'f', np.where(n2[k7] > 0.55, ',', np.where(breite_nord[k7] + 0.5 * n1[k7] < -0.9, 'T', '.')))
sued8 = (wy - 5150) / 220 + 0.5 * n1
basis[k8] = np.where(sued8[k8] > 0.8, np.where(n2[k8] > 0.4, 'g', 'T'), np.where(n2[k8] > 0.55, 'g', 'S'))
basis[k9] = np.where(dt[k9] > 0.6, 'u', np.where(n2[k9] + 0.3 * n1[k9] > 0.3, 'g', np.where(wald[k9] > 0.45, '.', 'y')))
# Gebirge: Felswände im Kern, Geröll an den Flanken (im Weißen Ende Schnee)
bk = berg * np.where(k7, 1.35, np.where(k8 | k9, 1.15, 1.0)) + 0.12 * n1 + 0.06 * n2   # die Hochlande sind bergiger
basis = np.where(bk > 0.78, 'F', np.where(bk > 0.6, np.where(k5 | k8, 'S', 'g'), basis))
# kleine Seen (nur in den feuchten Ländern)
see = (n2 > 0.82) & (n1 > 0.2) & (k1 | k6 | k2) & (e > 12)
basis[see] = 'w'
# Küste: Sand im Süden und Westen, Kies im kalten Norden
kuestenbreite = 3.5 + 2.5 * n1
strand = np.where(k1 | k5 | k7 | k8, 'g', 's')
G = np.where(land, np.where(e < kuestenbreite, strand, basis), 'M')
# an der heutigen Karte: genau deren Rand, dann ausklingend
nah = ~innen & (o < 4)
G = np.where(nah, rand, G)
weich = ~innen & (o >= 4) & (o < 16) & (n2 * 0.5 + 0.5 < (16 - o) / 12)
G = np.where(weich & ~np.isin(rand, ['~', 'k', 'p', 'e', 'd', 'a']), rand, G)   # Wald, Wiese, Moor laufen aus (Wege und Flüsse nicht)

# ───── Flüsse ─────
print('Flüsse …')
def flussX(y):
    yg = y - 200 * C; return 208 * C + 72 + 4 * np.sin(yg / 23) + 2 * np.sin(yg / 9)
tief = np.clip((AY0 - wy) / 80, 0, 1)                            # ab der Kartengrenze beginnt er zu mäandern
mitte = flussX(wy) + tief * (38 * np.sin((AY0 - wy) / 95) + 14 * np.sin((AY0 - wy) / 31) - 20 * np.clip((AY0 - wy) / 600, 0, 1))
nord = (wy < AY0) & (np.abs(wx - mitte) < 6.4 + 0.5 * np.sin((wy - 200 * C) / 3.7) + tief * 1.5) & (G != 'M')
# er mündet an der ersten Küste nördlich der Karte (nicht weiter über den Sund auf die Insel)
lab_f, _ = ndimage.label(nord | ((G == 'M') & False)); rand_y = AY0 - Y0 - 1
start = set(np.unique(lab_f[rand_y - 2:rand_y + 1, :][lab_f[rand_y - 2:rand_y + 1, :] > 0]).tolist())
nord = np.isin(lab_f, list(start)) if start else nord
G[nord] = '~'
# nach Süden: dem Lauf von Graufurt folgen, dann in weiten Bögen nach Osten zur Küste
lauf = [(6731, 6752), (6736, 6800), (6770, 6860), (6850, 6905), (6960, 6930), (7080, 6990), (7200, 7010), (7330, 7060), (7470, 7080), (7600, 7090)]
pts = []
for (a0, b0), (a1, b1) in zip(lauf, lauf[1:]):
    for t in np.linspace(0, 1, 40, endpoint=False): pts.append((a0 + (a1 - a0) * t, b0 + (b1 - b0) * t))
pts = np.array(pts); maske = np.zeros((H, W), bool)
for i, (x, y) in enumerate(pts):
    if i < len(pts) - 1:
        nx, ny = pts[min(i + 1, len(pts) - 1)][1] - pts[max(i - 1, 0)][1], -(pts[min(i + 1, len(pts) - 1)][0] - pts[max(i - 1, 0)][0]); l = math.hypot(nx, ny) or 1
        q = 9 * math.sin(i / 23) + 4 * math.sin(i / 7) if i > 30 else 0; x += nx / l * q; y += ny / l * q
    b = 6.4 + min(6, i / 60)
    i0, i1 = int(y - Y0 - b - 1), int(y - Y0 + b + 2); j0, j1 = int(x - X0 - b - 1), int(x - X0 + b + 2)
    sy, sx = slice(max(0, i0), min(H, i1)), slice(max(0, j0), min(W, j1))
    maske[sy, sx] |= np.hypot(wx[sy, sx] - x, wy[sy, sx] - y) < b
G[maske & (wy >= AY1) & (G != 'M')] = '~'
# Graben von Weidenhain → Bach → kleiner See
bach = (wy >= AY1) & (wy < AY1 + 30) & (np.abs(wx - (6424 + 3 * np.sin((wy - AY1) / 7))) < 1.6)
G[bach] = '~'; G[(np.hypot((wx - 6426) / 14, (wy - AY1 - 38) / 9) < 1 + 0.12 * n2)] = 'w'
G[innen] = '#'

# ───── Höhen (Eckpunkte, Hundertstel Feld) ─────
print('Höhen …')
hz = np.zeros((H, W), np.float32)
hz += np.clip(bk - 0.35, 0, None) ** 1.4 * 26                     # Gebirge
hz += np.where(G == 'F', 2.5, 0)                                   # Felswände ragen auf
hz += 0.9 * (n3 + 0.4)                                             # weite Wellen
hz += np.where(G == 'u', 0.9 * (1 + np.sin((wx * 0.8 - wy) / 9 + 2 * n1)), 0)   # Dünen
maske_h = np.clip(e / 14, 0, 1) ** 1.5 * np.clip(o / 26, 0, 1) ** 1.5
hz = np.where(np.isin(G, ['M', '~', 'w', '#']), 0, hz * maske_h)
hz = ndimage.gaussian_filter(hz, 1.2)
ecken = np.zeros((H + 1, W + 1), np.float32); ecken[:-1, :-1] += hz; ecken[1:, :-1] += hz; ecken[:-1, 1:] += hz; ecken[1:, 1:] += hz; ecken /= 4

# ───── in Regionen schneiden ─────
NAMEN = {1: 'Die Fahlen Weiten', 2: 'Die Smaragdküste', 3: 'Die Glutsande', 4: 'Die Ockerlande', 5: 'Das Weiße Ende', 6: 'Das Grenzland', 7: 'Die Hochlande', 8: 'Die Frostkrone', 9: 'Der Drachenarm'}
BIOM = {1: 'tundra', 2: 'tropen', 3: 'wueste', 4: 'wueste', 5: 'schnee', 6: 'wiese', 7: 'gebirge', 8: 'schnee', 9: 'kueste'}
def stuecke(a, b, n):
    g = np.linspace(a, b, n + 1).round().astype(int); return list(zip(g[:-1], g[1:]))
kacheln = []
for (ya, yb) in [(155, 169), (169, 183), (183, 198)]:
    for (xa, xb) in stuecke(186, 261, 5): kacheln.append((xa, ya, xb, yb))
kacheln.append((186, 198, 192, 211))
for (xa, xb) in stuecke(212, 261, 3): kacheln.append((xa, 198, xb, 211))
for (ya, yb) in [(211, 225), (225, 239), (239, 254)]:
    for (xa, xb) in stuecke(186, 261, 5): kacheln.append((xa, ya, xb, yb))
for n in os.listdir(os.path.join(WELT, 'regionen')):
    if n.startswith('fl_'):
        for f in os.listdir(os.path.join(WELT, 'regionen', n)): os.remove(os.path.join(WELT, 'regionen', n, f))
        os.rmdir(os.path.join(WELT, 'regionen', n))
land_gesamt = 0
for (xa, ya, xb, yb) in [tuple(int(v) for v in k) for k in kacheln]:
    i0, i1, j0, j1 = (ya - CY0) * C, (yb - CY0) * C, (xa - CX0) * C, (xb - CX0) * C
    t = G[i0:i1, j0:j1]; kl = np.where(np.isin(t, ['M', '#']), 0, klasse[i0:i1, j0:j1]); anteil = (kl > 0).mean(); land_gesamt += int((kl > 0).sum())
    if anteil < 0.04: name, biom = ('Das Splittermeer' if xa >= 212 and ya < 215 else 'Das Endlose Meer'), 'meer'
    else: k = int(np.bincount(kl[kl > 0]).argmax()); name, biom = NAMEN[k], BIOM[k]
    rid = f'fl_{xa}_{ya}'; d = os.path.join(WELT, 'regionen', rid); os.makedirs(d, exist_ok=True)
    region = {'id': rid, 'name': name, 'untertitel': ('Die Hochlande-Insel' if k in (7, 8, 9) else 'Das erste Festland') + ' – noch unbesiedelt' if anteil >= 0.04 else 'Offenes Meer', 'ursprung': [xa, ya], 'chunks': [xb - xa, yb - ya], 'biom': biom, 'stufe': 3, 'nahtlos': 'festland'}
    json.dump(region, open(os.path.join(d, 'region.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    open(os.path.join(d, 'gelaende.txt'), 'w', encoding='utf8').write('\n'.join(''.join(z) for z in t) + '\n')
    open(os.path.join(d, 'objekte.json'), 'w', encoding='utf8').write('[\n]\n')
    bh, bw = (yb - ya) * C, (xb - xa) * C
    json.dump({'start': [[bw / 2, bh / 2]], 'figuren': [], 'spawnzonen': [], 'ausgaenge': [], 'kollision': {'sperren': [], 'freigeben': []}, 'interaktionen': []},
              open(os.path.join(d, 'spiel.json'), 'w', encoding='utf8'), indent=1)
    werte = np.round(ecken[i0:i1 + 1, j0:j1 + 1] * 100).astype(int)
    json.dump({'hinweis': 'Zusatzhöhe je Eckpunkt in Hundertsteln eines Feldes, (Breite+1) × (Höhe+1), zeilenweise', 'werte': werte.ravel().tolist()}, open(os.path.join(d, 'hoehen.json'), 'w'), separators=(',', ':'))
print(f'Festland: {len(kacheln)} Regionen, {W} × {H} Felder, Land {land_gesamt / C / C:.0f} Chunks ({land_gesamt / C / C / 260:.1f} × heute)')

if '--vorschau' in sys.argv:
    arten = {a['zeichen']: a['farbe'] for a in json.load(open(os.path.join(WELT, 'bibliothek', 'gelaende.json'), encoding='utf8'))['arten']}
    farbe = np.zeros((H, W, 3), np.float32)
    for z, f in arten.items(): farbe[G == z] = [int(f[i:i + 2], 16) for i in (1, 3, 5)]
    # Hangschattierung aus den Höhen
    gy, gx = np.gradient(hz); licht = np.clip(1 + (gx * -0.55 + gy * -0.75) * 0.9, 0.55, 1.35); farbe *= licht[..., None]
    bild = Image.fromarray(np.clip(farbe, 0, 255).astype(np.uint8)).resize((W // 2, H // 2), Image.LANCZOS)
    karte = os.path.normpath(os.path.join(WELT, '..', '..', 'echtzeit', 'welt', 'weltkarte.webp'))
    if os.path.exists(karte):
        k = Image.open(karte).convert('RGB'); s_ = k.width / (W / C)   # Weltkarte: Bildpunkte je Chunk
        if k.width > (AX1 - AX0) // C * s_ + 1: k = k.crop((int((AX0 - X0) / C * s_), int((AY0 - Y0) / C * s_), int((AX1 - X0) / C * s_), int((AY1 - Y0) / C * s_)))
        bild.paste(k.resize(((AX1 - AX0) // 2, (AY1 - AY0) // 2), Image.LANCZOS), ((AX0 - X0) // 2, (AY0 - Y0) // 2))
    bild.save(sys.argv[sys.argv.index('--vorschau') + 1]); print('Vorschau gespeichert')
