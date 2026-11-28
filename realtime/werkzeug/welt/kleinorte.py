"""
World Pipeline – Kleinorte planen (Leitlinie des Nutzers 28.11.: Dichte wie ein klassisches MMO, höchstens ~70 Felder zwischen benannten Orten).
Plant – baut noch nichts – je Schritt (Länder) kleine benannte Orte auf offenem, erreichbarem Land:
  1. Besonderheiten: je Land eine Handvoll von Hand beschriebener Orte, gesetzt in die größten Lücken (Hünengrab, Galgenhügel, Windharfe …).
  2. Kleinorte: unregelmäßig verteilt (Poisson-Scheiben, Abstand 50–78 Feldern), Art nach Umgebung: Küste → Fischerhütte/Leuchtfeuer, Bach und See → Mühle,
     Wald → Jäger-/Köhlerlager, Ruine, Schrein; Heide und Tundra → Hirtenlager, Steinkreis, Wachturm; Fels → Höhleneingang; fern vom Weg → Banditenlager, Ruine;
     Wiese am Weg → Hof, Weiler, Brunnen. Name aus Wortlisten je Land (eindeutig).
  Frei bleiben: Städte und Mauern, Orte mit Namen (45 Felder), Lesestellen (12), Streifgebiete, Tier- und Trödlerplätze, Wasser.
  Ein Feldweg wird vorgeschlagen, wenn der nächste Weg näher als 60 Felder liegt (sonst „abseits“: dort gehören hochrangige Arbeitsstellen hin).
Schreibt welt/plaene/kleinorte_<schritt>.json und …png (Skizze zur Freigabe). Aufruf (im Ordner realtime): python3 werkzeug/welt/kleinorte.py schritt1
"""
import json, os, sys, math, random
import numpy as np
from scipy import ndimage
from PIL import Image, ImageDraw, ImageFont
try: SCHRIFT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 11); SCHRIFT_F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 12)
except Exception: SCHRIFT = SCHRIFT_F = None

RT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')); W = os.path.join(RT, 'welt'); C = 32
lies = lambda *p: json.load(open(os.path.join(*p), encoding='utf8'))
SCHRITTE = {'schritt1': ['Grenzland', 'Fahle Weiten'], 'schritt2': ['Ockerlande'], 'schritt3': ['Glutsande', 'Küste', 'Süden/Westen'], 'schritt4': ['Hochlande']}
schritt = next((a for a in sys.argv[1:] if a in SCHRITTE), 'schritt1'); LAENDER = SCHRITTE[schritt]

# ───── Welt lesen ─────
ARTEN = {a['zeichen']: a for a in lies(W, 'bibliothek', 'gelaende.json')['arten']}
KAT = {o['id']: o.get('kategorie') for o in lies(W, 'bibliothek', 'objekte.json')['objekte']}
X0, Y0, B, H = 186 * C, 155 * C, 75 * C, 99 * C
G = np.full((H, B), 'M', dtype='<U1'); REG = np.full((H, B), '', dtype=object); RN = {}; FREI = []; IA = []
for n in sorted(os.listdir(os.path.join(W, 'regionen'))):
    p = os.path.join(W, 'regionen', n, 'region.json')
    if not os.path.exists(p): continue
    r = lies(p)
    if r.get('ebene') or r.get('entwurf'): continue
    x0, y0 = r['ursprung'][0] * C - X0, r['ursprung'][1] * C - Y0
    z = [l for l in open(os.path.join(W, 'regionen', n, 'gelaende.txt'), encoding='utf8').read().split('\n') if l]
    G[y0:y0 + len(z), x0:x0 + len(z[0])] = np.array([list(l) for l in z]); REG[y0:y0 + len(z), x0:x0 + len(z[0])] = n; RN[n] = r
    s = lies(W, 'regionen', n, 'spiel.json')
    for f in s.get('kollision', {}).get('freigeben', []):
        if 'x0' in f: FREI.append((f['x0'] + x0, f['y0'] + y0, f['x1'] + x0, f['y1'] + y0))
    for i in s.get('interaktionen', []): IA.append((i['x'] + x0 + X0, i['y'] + y0 + Y0))
geh = np.vectorize(lambda c: bool(ARTEN.get(c, {}).get('begehbar', False)) and not ARTEN.get(c, {}).get('wasser', False))(G)
nass = np.isin(G, list('~wMo')); weg = np.isin(G, list('ekpd')); fels = G == 'F'
for a0, b0, a1, b1 in FREI: geh[max(0, int(b0)):int(math.ceil(b1)), max(0, int(a0)):int(math.ceil(a1))] = True
SP = lies(W, 'sperren.json'); zu = geh.copy()
for k in ('drachenarm', 'frostkrone'):
    for x, y in SP[k]['kette']: zu[max(0, y - Y0 - 2):y - Y0 + 3, max(0, x - X0 - 2):x - X0 + 3] = False
lab, _ = ndimage.label(zu); offen = lab == lab[5901 - Y0, 6990 - X0]

ALT = {'waldweg', 'obstwiesen', 'osthof', 'westried', 'westmark', 'nordwald', 'nordsaum', 'osthang', 'graufurt', 'rabenmoor', 'aschenwerth', 'waldmark', 'weidenhain'}
meerab = ndimage.distance_transform_edt(G != 'M')
def land(x, y):   # wie bestandsaufnahme.py
    n = REG[y - Y0, x - X0] if 0 <= y - Y0 < H and 0 <= x - X0 < B else ''
    if not n: return '?'
    if n in ALT: return 'Grenzland'
    if n == 'ostufer': return 'Fahle Weiten'
    name = RN[n]['name'].replace('Die ', '').replace('Das ', '').replace('Der ', '').replace('Fahlen Weiten', 'Fahle Weiten')
    if y < 6300 and x < 6760: return 'Fahle Weiten'
    if y < 6300: return 'Frostkrone' if G[y - Y0, x - X0] in 'TS' and x < 7300 else 'Drachenarm' if x > 7700 else 'Hochlande'
    if name == 'Smaragdküste' or (x < 6640 and y >= 6780): return 'Küste' if meerab[y - Y0, x - X0] < 45 else 'Süden/Westen'
    if x >= 6640 and y >= 6300: return 'Ockerlande' if y > 7300 else 'Glutsande'
    return name

# ───── was frei bleibt ─────
on = lies(W, 'ortsnamen.json'); BENANNT = []
for o in on['orte']:
    if o['art'] != 'Landschaft': BENANNT.append((o['x'], o['y'], o['name']))
for g in on['gebiete']:
    if g['art'] in ('Stadt', 'Dorf', 'Gehöft'): BENANNT.append((g['schrift'][0], g['schrift'][1], g['name']))
STADT = [(o['x'], o['y'], 55) for o in on['orte'] if o['art'] == 'Stadt'] + [(g['schrift'][0], g['schrift'][1], 55) for g in on['gebiete'] if g['art'] == 'Stadt']
MAUERN = []
def _m(o):
    if isinstance(o, dict):
        for k, v in o.items():
            if k == 'mauer' and isinstance(v, list) and len(v) == 4 and all(isinstance(t, (int, float)) for t in v): MAUERN.append(v)
            else: _m(v)
for f in os.listdir(W):
    if f.endswith('_orte.json'): _m(lies(W, f))
STREIF = [g['rechteck'] for g in lies(W, 'streifgebiete.json')['gebiete']]
WEICH = [(t['x'], t['y'], t.get('radius', 6) + 6) for t in lies(RT, 'shared', 'tierplaetze.json')['plaetze']] + [(t['x'], t['y'], 8) for t in lies(W, 'troedler_standorte.json')['standorte']]
verbot = ~offen | nass | fels
GEB = []
for n, r in RN.items():
    ux, uy = r['ursprung'][0] * C, r['ursprung'][1] * C
    for o in lies(W, 'regionen', n, 'objekte.json'):
        if KAT.get(o['objekt']) == 'gebaeude': GEB.append((o['x'] + ux, o['y'] + uy))
gm = np.ones((H, B), bool)
for x, y in GEB:
    i, j = int(x - X0), int(y - Y0)
    if 0 <= i < B and 0 <= j < H: gm[j, i] = False
verbot |= ndimage.distance_transform_edt(gm) < 30   # nicht dicht an Dörfer und Höfe (dort sind schon Orte, auch ohne Namen)
yy, xx = np.mgrid[0:H, 0:B]
for m in MAUERN: verbot[max(0, m[1] - Y0 - 10):m[3] - Y0 + 11, max(0, m[0] - X0 - 10):m[2] - X0 + 11] = True
for r in STREIF: verbot[max(0, r[1] - Y0):r[3] - Y0 + 1, max(0, r[0] - X0):r[2] - X0 + 1] = True
for x, y, rr in STADT + WEICH + [(x, y, 12) for x, y in IA]:
    a, b, c, d = int(max(0, y - Y0 - rr)), int(min(H, y - Y0 + rr + 1)), int(max(0, x - X0 - rr)), int(min(B, x - X0 + rr + 1))
    verbot[a:b, c:d] |= (xx[a:b, c:d] + X0 + 0.5 - x) ** 2 + (yy[a:b, c:d] + Y0 + 0.5 - y) ** 2 < rr * rr
dweg = ndimage.distance_transform_edt(~weg); dmeer = meerab; dsee = ndimage.distance_transform_edt(~(np.isin(G, list('~w')))); dfels = ndimage.distance_transform_edt(~fels)
LANDGRID = np.full((H, B), '', dtype=object)
for y in range(0, H, 8):
    for x in range(0, B, 8):
        if REG[y, x]: LANDGRID[y:y + 8, x:x + 8] = land(x + X0, y + Y0)
im_land = np.isin(LANDGRID, LAENDER)
kand = im_land & ~verbot & ndimage.binary_erosion(geh, iterations=3)

# ───── Namen ─────
NAMEN = {
 'Grenzland': {'vor': ['Distel', 'Eichen', 'Holler', 'Brom', 'Krähen', 'Linden', 'Erlen', 'Moos', 'Dachs', 'Fuchs', 'Weiden', 'Hasel', 'Rabens', 'Nessel', 'Birken', 'Lerchen'],
               'hof': 'hof', 'weiler': 'au', 'muehle': 'mühle', 'lager': 'lager', 'turm': 'wacht', 'ruine': 'ruine', 'schrein': 'schrein', 'stein': 'stein', 'hoehle': 'loch', 'fischer': 'hütte', 'banditen': 'versteck', 'brunnen': 'brunnen'},
 'Fahle Weiten': {'vor': ['Heide', 'Grau', 'Wind', 'Reif', 'Krähen', 'Hünen', 'Fahl', 'Nebel', 'Ginster', 'Wacholder', 'Frost', 'Asch', 'Stein', 'Wolfs', 'Moor', 'Dorn'],
                  'hof': 'hof', 'weiler': 'weiler', 'muehle': 'mühle', 'lager': 'lager', 'turm': 'warte', 'ruine': 'ruine', 'schrein': 'schrein', 'stein': 'stein', 'hoehle': 'grotte', 'fischer': 'kate', 'banditen': 'nest', 'brunnen': 'born'},
 'Ockerlande': {'vor': ['Rot', 'Lehm', 'Ocker', 'Dorn', 'Akazien', 'Sand', 'Hyänen', 'Staub', 'Dürr', 'Kamel', 'Salz', 'Ton'],
                'hof': 'hof', 'weiler': 'rast', 'muehle': 'brunnen', 'lager': 'lager', 'turm': 'turm', 'ruine': 'ruine', 'schrein': 'schrein', 'stein': 'stein', 'hoehle': 'höhle', 'fischer': 'hütte', 'banditen': 'lager', 'brunnen': 'loch'},
}
for l in ('Glutsande', 'Küste', 'Süden/Westen', 'Hochlande'): NAMEN.setdefault(l, NAMEN['Fahle Weiten'])
ARTNAME = {'hof': 'Hof', 'weiler': 'Weiler', 'muehle': 'Mühle', 'lager': 'Lager', 'turm': 'Wachturm', 'ruine': 'Ruine', 'schrein': 'Schrein', 'stein': 'Steinkreis', 'hoehle': 'Höhleneingang',
           'fischer': 'Fischerhütte', 'leuchtfeuer': 'Leuchtfeuer', 'banditen': 'Banditenlager', 'brunnen': 'Brunnen', 'jaeger': 'Jägerlager', 'koehler': 'Köhlerlager', 'hirten': 'Hirtenlager'}
OBJEKTE = {   # vorhandene Objekte, je Art (wenige, leichte – Handy)
 'hof': ['weidenhain_bauernhaus_01', 'dorf_scheune_holz_01', 'k_zaun'], 'weiler': ['dorf_huette_holz_01', 'dorf_huette_holz_02', 'weidenhain_kate_01', 'dorf_brunnen_01'],
 'muehle': ['weidenhain_muehle_01 (am Bach) / dorf_windmuehle_01', 'dorf_holzstapel_01'], 'turm': ['dorf_wachturm_01', 'dorf_festfeuer_01'], 'ruine': ['k_ruine_mauer', 'k_ruine_turmstumpf', 'k_ruine_saeule'],
 'schrein': ['moor_schrein_01', 'wz_seelenlicht_grablicht'], 'stein': ['moor_menhir_01', 'moor_menhir_02', 'hochland_steinmann'], 'hoehle': ['hoehle_tuer_01 (ohne Untergrund: Lesestelle)', 'k_fels_gross'],
 'fischer': ['moor_fischer_01', 'kueste_netze', 'moor_kahn_01'], 'leuchtfeuer': ['turm_signalfeuer_01', 'k_fels_klein'], 'banditen': ['welt_zelt_01', 'dorf_festfeuer_01', 'k_kiste'],
 'brunnen': ['dorf_brunnen_01', 'dorf_bank_01'], 'jaeger': ['welt_zelt_01', 'dorf_festfeuer_01', 'welt_spuren_01'], 'koehler': ['wald_meiler_01', 'dorf_holzstapel_01', 'dorf_huette_holz_02'],
 'hirten': ['dorf_huette_holz_02', 'k_zaun', 'wegrand_heuhaufen'], 'besonders': ['je nach Ort, siehe Liste']}

# ───── Besonderheiten je Land (von Hand beschrieben, in die größten Lücken gesetzt) ─────
BESONDERS = {
 'Grenzland': [('Der Hängende Stein', 'stein', 'Ein Findling, so groß wie ein Haus, liegt schief auf einem kleinen – man sagt, ein Riese habe ihn verloren.'),
               ('Galgenhügel', 'ruine', 'Ein alter Galgen auf einem Hügel. Die Krähen sitzen hier lieber als sonst irgendwo.'),
               ('Die Sieben Linden', 'schrein', 'Sieben Linden im Kreis um einen Opferstein. Wer hier lügt, dem fällt ein Blatt auf den Kopf.')],
 'Fahle Weiten': [('Hünengrab', 'stein', 'Ein Grab aus Steinplatten, älter als jede Karte. Der Wind pfeift durch die Fugen.'),
                  ('Die Windharfe', 'turm', 'Ein verlassener Turm, durch dessen Ritzen der Wind singt. In Sturmnächten hört man ihn bis Grauwacht.'),
                  ('Krähenbaum', 'schrein', 'Ein toter Baum voller Krähen. Die Heideleute hängen Knochen hinein – gegen den Frost.'),
                  ('Der Versunkene Hof', 'ruine', 'Ein Hof, halb im Moor versunken. Nur das Dach schaut noch heraus.')],
 'Ockerlande': [('Der Rote Finger', 'stein', 'Eine Felsnadel aus rotem Lehm, die wie ein Finger in den Himmel zeigt.'), ('Karawanengrab', 'ruine', 'Gerippe von Wagen und Tieren im Sand – eine Karawane, die nie ankam.'),
                ('Der Durstbrunnen', 'brunnen', 'Ein Brunnen ohne Wasser. Wer hineinruft, hört eine Antwort.')],
}

rng = random.Random('kleinorte-' + schritt)
def umgebung(x, y):
    i, j = x - X0, y - Y0; w = G[max(0, j - 8):j + 9, max(0, i - 8):i + 9]
    wald = np.isin(w, list('ftj')).mean(); heide = np.isin(w, list('Tg,')).mean(); wueste = np.isin(w, list('uylL')).mean()
    return dict(wald=wald, heide=heide, wueste=wueste, meer=dmeer[j, i], see=dsee[j, i], fels=dfels[j, i], weg=dweg[j, i])
def art_waehlen(u, l):
    if u['meer'] < 9: return rng.choice(['fischer', 'fischer', 'leuchtfeuer'])
    if u['see'] < 7: return rng.choice(['muehle', 'fischer', 'muehle'])
    if u['fels'] < 6: return rng.choice(['hoehle', 'hoehle', 'turm'])
    if u['weg'] > 55: return rng.choice(['banditen', 'ruine', 'schrein', 'stein'])
    if u['wald'] > 0.5: return rng.choice(['jaeger', 'koehler', 'ruine', 'schrein'])
    if u['wueste'] > 0.5: return rng.choice(['brunnen', 'hirten', 'ruine', 'lager', 'stein'])
    if u['heide'] > 0.4: return rng.choice(['hirten', 'stein', 'turm', 'hof'])
    return rng.choice(['hof', 'weiler', 'hof', 'brunnen', 'muehle' if u['see'] < 25 else 'turm'])
benutzt = {n for _, _, n in BENANNT}
def name_fuer(art, l):
    N = NAMEN[l]; teil = N.get(art)
    if art in ('jaeger', 'koehler', 'hirten', 'leuchtfeuer'): teil = {'jaeger': 'jägerlager', 'koehler': 'köhlerei', 'hirten': 'hirtenlager', 'leuchtfeuer': 'feuer'}[art]
    for _ in range(200):
        n = rng.choice(N['vor']) + teil
        if n not in benutzt: benutzt.add(n); return n
    return None

# ───── 1. Besonderheiten, 2. Kleinorte (unregelmäßig) ─────
punkte = [(x, y, 'benannt', n) for x, y, n in BENANNT]
def frei_von(x, y, mind):
    return all((x - a) ** 2 + (y - b) ** 2 >= (mind if t != 'benannt' else max(45, mind - 10)) ** 2 for a, b, t, _ in punkte)
neu = []
for l in LAENDER:
    m = kand & (LANDGRID == l)
    for name, art, text in BESONDERS.get(l, []):
        best = None
        mm = np.ones((H, B), bool)
        for a, b, _, _ in punkte:
            i, j = int(a - X0), int(b - Y0)
            if 0 <= i < B and 0 <= j < H: mm[j, i] = False
        dd = ndimage.distance_transform_edt(mm); dd[~m] = 0
        j, i = np.unravel_index(int(dd.argmax()), dd.shape)
        if dd[j, i] < 40: continue
        x, y = int(i + X0), int(j + Y0); punkte.append((x, y, art, name)); u = umgebung(x, y)
        neu.append({'name': name, 'art': art, 'artname': ARTNAME[art], 'land': l, 'x': x, 'y': y, 'besonders': True, 'text': text, 'feldweg': bool(u['weg'] < 60), 'abseits': bool(u['weg'] >= 60), 'region': REG[j, i]})
    ys, xs = np.nonzero(m[::3, ::3]); order = list(zip(xs * 3, ys * 3)); rng.shuffle(order)
    for i, j in order:
        x, y = int(i + X0), int(j + Y0); mind = rng.uniform(50, 78)
        if not frei_von(x, y, mind): continue
        u = umgebung(x, y); art = art_waehlen(u, l); name = name_fuer(art, l)
        if not name: continue
        punkte.append((x, y, art, name))
        neu.append({'name': name, 'art': art, 'artname': ARTNAME[art], 'land': l, 'x': x, 'y': y, 'besonders': False, 'feldweg': bool(u['weg'] < 60), 'abseits': bool(u['weg'] >= 60), 'region': REG[j, i]})

# ───── Messung: Abstand zum nächsten benannten Ort, vorher / nachher (nur in den Ländern des Schritts) ─────
def messung(pts):
    mm = np.ones((H, B), bool)
    for x, y in pts:
        i, j = int(x - X0), int(y - Y0)
        if 0 <= i < B and 0 <= j < H: mm[j, i] = False
    dd = ndimage.distance_transform_edt(mm); f = offen & im_land
    return {'weiter_als_30': round(float((dd[f] > 30).mean()) * 100, 1), 'weiter_als_45': round(float((dd[f] > 45).mean()) * 100, 1), 'max': round(float(dd[f].max()), 0)}
vor = messung([(x, y) for x, y, _ in BENANNT]); nach = messung([(x, y) for x, y, _, _ in punkte])
from collections import Counter
erg = {'hinweis': f'Kleinorte {schritt} (kleinorte.py): PLAN zur Freigabe – noch nichts gebaut. Weltfelder.', 'schritt': schritt, 'laender': LAENDER, 'anzahl': len(neu),
       'je_art': dict(Counter(q['artname'] for q in neu)), 'je_land': dict(Counter(q['land'] for q in neu)), 'messung': {'vorher': vor, 'nachher': nach}, 'objekte_je_art': OBJEKTE, 'orte': neu}
os.makedirs(os.path.join(W, 'plaene'), exist_ok=True)
json.dump(erg, open(os.path.join(W, 'plaene', f'kleinorte_{schritt}.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)

# ───── Skizze ─────
ys, xs = np.nonzero(im_land & offen); x0, x1, y0, y1 = xs.min() - 20, xs.max() + 20, ys.min() - 20, ys.max() + 20; sc = 1
sub = G[y0:y1, x0:x1]
FAR = {'M': (40, 70, 120), 'F': (90, 80, 75), 'g': (150, 140, 125), '.': (120, 170, 90), ',': (140, 180, 100), 'f': (45, 95, 45), 'T': (190, 195, 170), 'S': (240, 240, 250), 'e': (240, 225, 190), 'k': (240, 225, 190), 'p': (240, 225, 190), 'd': (240, 225, 190),
       'w': (60, 100, 160), '~': (60, 100, 160), 's': (235, 220, 170), 'v': (100, 140, 90), 't': (70, 110, 60), 'j': (60, 120, 60), 'o': (60, 80, 70), 'l': (184, 107, 66), 'L': (158, 87, 54), 'u': (225, 205, 150), 'y': (190, 180, 110), 'a': (160, 140, 80)}
img = np.full(sub.shape + (3,), 120, np.uint8)
for k, c in FAR.items(): img[sub == k] = c
img[~(im_land[y0:y1, x0:x1])] = (img[~(im_land[y0:y1, x0:x1])] * 0.45).astype(np.uint8)
bild = Image.fromarray(img); dr = ImageDraw.Draw(bild); P = lambda x, y: (x - X0 - x0, y - Y0 - y0)
FARBE = {'hof': (230, 200, 60), 'weiler': (230, 160, 40), 'muehle': (90, 160, 230), 'fischer': (60, 120, 230), 'leuchtfeuer': (255, 120, 40), 'turm': (200, 80, 80), 'ruine': (150, 120, 110), 'schrein': (200, 120, 220),
         'stein': (220, 220, 220), 'hoehle': (80, 60, 50), 'banditen': (230, 40, 40), 'brunnen': (120, 200, 230), 'jaeger': (60, 200, 90), 'koehler': (40, 40, 40), 'hirten': (240, 240, 150), 'lager': (200, 160, 120)}
for x, y, n in BENANNT:
    if x0 <= x - X0 < x1 and y0 <= y - Y0 < y1: c = P(x, y); dr.rectangle([c[0] - 4, c[1] - 4, c[0] + 4, c[1] + 4], fill=(255, 255, 255), outline=(0, 0, 0)); dr.text((c[0] + 6, c[1] - 7), n, fill=(255, 255, 255), font=SCHRIFT_F)
for q in neu:
    c = P(q['x'], q['y']); r = 6 if q['besonders'] else 4; dr.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], fill=FARBE.get(q['art'], (255, 0, 255)), outline=(255, 255, 0) if q['besonders'] else (0, 0, 0), width=2 if q['besonders'] else 1)
    dr.text((c[0] + 6, c[1] - 6), q['name'], fill=(255, 255, 160) if q['besonders'] else (20, 20, 20), font=SCHRIFT)
# Legende
ly = 10
for a, f in FARBE.items():
    if any(q['art'] == a for q in neu): dr.ellipse([10, ly, 20, ly + 10], fill=f, outline=(0, 0, 0)); dr.text((26, ly - 2), ARTNAME[a], fill=(255, 255, 255), font=SCHRIFT); ly += 14
dr.text((10, ly + 4), f'Quadrat: vorhandene Orte · Kreis: neu ({len(neu)}) · gelb umrandet: Besonderheit', fill=(255, 255, 255), font=SCHRIFT)
bild.save(os.path.join(W, 'plaene', f'kleinorte_{schritt}.png'))
print(f'{schritt} {LAENDER}: {len(neu)} Kleinorte {dict(Counter(q["artname"] for q in neu))} · vorher {vor} · nachher {nach}')
