"""
World Pipeline – Einsteiger-Insel Ankerholm (#190, Konzept doku/konzepte/einsteiger-insel.md, vom Nutzer abgesegnet 28.11.; Ziel Ausgabe 2).
Baut die Region welt/regionen/ankerholm: eine kleine Felseninsel (etwa 120 × 90 Felder) fern vom Festland, eigene Ebene „draussen“ (wie der Horst),
bis Ausgabe 2 als Entwurf („entwurf“: true, bauen.mjs lässt sie aus; --live nimmt den Entwurf heraus).
  Südstrand: die gestrandete Seeschwalbe (Startpunkt), Feuerstelle der Mannschaft, Merles Kochplatz, Steg mit Fischstellen.
  Mitte:     Kiefernhain (wenige Bäume zum Fällen).
  Osten:     Felsen mit zwei Kupferadern, Arvids Behelfsschmiede (Esse, Amboss).
  Norden:    Leuchtfeuer der Wacht mit Haukes Übungsplatz (drei Übungspuppen) und die Bucht der Plünderer.
Modelle der Figuren-Rolle (ankerholm_seeschwalbe_wrack, ankerholm_uebungspuppe_*) werden genommen, sobald sie in der Bibliothek sind, sonst Platzhalter.
Schreibt die Region und welt/ankerholm_orte.json (Stellen für Quests, Systeme und Integration: Start, Bäume, Adern, Stationen, Fischstellen, Puppen,
Plünderer, Plätze der vier Figuren). Wiederholbar (schreibt die Region jedes Mal ganz neu).
Aufruf (im Ordner realtime): python3 werkzeug/welt/ankerholm.py [--live]
"""
import json, os, sys, math, random
RT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')); W = os.path.join(RT, 'welt'); C = 32
lies = lambda *p: json.load(open(os.path.join(*p), encoding='utf8'))
BIB = {o['id']: o for o in lies(W, 'bibliothek', 'objekte.json')['objekte']}
URSPRUNG, CHUNKS = [380, 300], [5, 4]; B, H = CHUNKS[0] * C, CHUNKS[1] * C   # 160 × 128 Felder, fern von allem (Instanzen liegen bei 320–375|300)
rng = random.Random('ankerholm')

def hsh(x, y):
    h = (x * 374761393 + y * 668265263) & 0xffffffff; h = ((h ^ (h >> 13)) * 1274126177) & 0xffffffff; return ((h ^ (h >> 16)) & 0xffffffff) / 4294967296
def wert(x, y):
    xi, yi = math.floor(x), math.floor(y); fx, fy = x - xi, y - yi; fx, fy = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
    a, b, c, d = hsh(xi, yi), hsh(xi + 1, yi), hsh(xi, yi + 1), hsh(xi + 1, yi + 1); return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy
def welle(x, y): return (wert(x / 9, y / 9) + 0.5 * wert(x / 4 + 31, y / 4 + 17)) / 1.5 * 2 - 1   # −1 … 1
def ell(x, y, cx, cy, rx, ry): return math.hypot((x - cx) / rx, (y - cy) / ry)

# ───── Gelände ─────
def land(x, y):   # > 0: Land
    v = 1 - ell(x, y, 80, 68, 56, 38)                                   # Hauptinsel
    v = max(v, 1 - ell(x, y, 84, 26, 15, 13))                           # Nordspitze (Leuchtfeuer)
    v = max(v, 1 - ell(x, y, 128, 62, 20, 22))                          # Felsen im Osten
    v -= max(0, 1 - ell(x, y, 50, 36, 13, 10)) * 1.6                    # Bucht der Plünderer (Nordwesten)
    return v + 0.07 * welle(x, y)
Z = [['M'] * B for _ in range(H)]
for y in range(H):
    for x in range(B):
        v = land(x + 0.5, y + 0.5)
        if v > 0:
            c = '.' if welle(x * 1.7, y * 1.7) < 0.45 else ','
            if v < (0.16 if y > 92 else 0.09): c = 's'                  # Strand (im Süden breit)
            if ell(x, y, 78, 62, 16, 11) < 1 + 0.12 * welle(x, y): c = 'f'                 # Kiefernhain
            if ell(x, y, 133, 62, 10, 15) < 1 + 0.15 * welle(x, y): c = 'F'                # Felsen
            elif ell(x, y, 129, 64, 15, 20) < 1 and c not in 's': c = 'g'                  # Geröll um die Felsen
            if ell(x, y, 50, 36, 19, 15) < 1 and v < 0.25: c = 's'                          # Strand der Bucht
            Z[y][x] = c
        elif v > -0.12: Z[y][x] = 'w'                                    # flaches Wasser am Ufer
def zeichen(x, y): return Z[int(y)][int(x)] if 0 <= int(x) < B and 0 <= int(y) < H else 'M'
def strecke(px, py, pts):
    best = 9e9
    for (ax, ay), (bx, by) in zip(pts, pts[1:]):
        dx, dy = bx - ax, by - ay; t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy or 1))); best = min(best, math.hypot(px - ax - t * dx, py - ay - t * dy))
    return best
def weg(pts, breite=1.8):
    for y in range(H):
        for x in range(B):
            if Z[y][x] in '.,fgs' and strecke(x + 0.5, y + 0.5, pts) < breite / 2 + 0.25 * welle(x * 2, y * 2): Z[y][x] = 'e'
LAGER, HAIN, SCHMIEDE, FEUER, BUCHT = (80, 100), (78, 62), (116, 74), (84, 24), (52, 42)
weg([LAGER, (79, 86), (78, 72)]); weg([(80, 56), (82, 44), (84, 34)]); weg([(88, 64), (100, 70), (112, 76)]); weg([(78, 40), (66, 42), (58, 44)], 1.4); weg([(86, 102), (98, 105), (104, 107)], 1.4)

# ───── Objekte ─────
objekte, ia, stellen = [], [], {}
def ding(objekt, x, y, id, **mehr):
    if objekt not in BIB: raise SystemExit(f'unbekanntes Objekt {objekt}')
    o = {'id': id, 'objekt': objekt, 'x': round(x, 2), 'y': round(y, 2), **mehr}; objekte.append(o); return o
def lies_(id, x, y, text, **mehr): ia.append({'id': id, 'art': 'lesen', 'x': round(x, 2), 'y': round(y, 2), 'radius': 1.8, 'abgleich': 'keiner', 'daten': {'text': text, **mehr}})
hat = lambda i: i in BIB

# Südstrand: Wrack (auf der Uferlinie aufgelaufen: Heck auf dem Sand, Bug im flachen Wasser), Lager der Mannschaft, Kochplatz, Steg
WY = next(y for y in range(90, H) if zeichen(64, y) in 'wM') + 0.5   # erstes Wasserfeld unter dem Wrack
if hat('ankerholm_seeschwalbe_wrack'): ding('ankerholm_seeschwalbe_wrack', 64, WY, 'ankerholm_wrack', dreh=270)
else: ding('kueste_segelschiff', 64, WY + 1, 'ankerholm_wrack', dreh=270)   # Platzhalter, bis das Wrack der Figuren-Rolle da ist
for i, (dx, dy) in enumerate([(-6, -3), (-3, -5), (5, -4)]): ding(['kueste_wrackkiste', 'k_kiste', 'k_faesser'][i], 64 + dx, WY - 3 + dy, f'ankerholm_treibgut_{i + 1}')
ding('dorf_festfeuer_01', FEUER_LAGER := LAGER[0], LAGER[1], 'ankerholm_feuer')
ding('hoehle_lager_01', 74, 98, 'ankerholm_schlafplatz_1'); ding('hoehle_lager_01', 74, 102, 'ankerholm_schlafplatz_2', spiegeln=True)
ding('hand_kessel_01', 88, 100, 'ankerholm_kochplatz'); ding('kueste_fischkisten', 91, 99, 'ankerholm_fischkisten'); ding('dorf_fass_01', 86, 97, 'ankerholm_wasserfass')
lies_('ankerholm_namensbrett', 70.5, WY - 2.5, '„Seeschwalbe“ steht auf dem Brett am Heck. Der Rumpf ist leck, der Mast gebrochen – so kommt hier niemand fort.')
# Steg nach Süden ins Wasser (Stücke 5,3 lang, lückenlos), Fischstellen am Ende
sx, sy = 104.5, None
for y in range(H - 1, 0, -1):
    if zeichen(sx, y) in 'se': sy = y + 0.6; break
STEG = []
for k in range(3): STEG.append(ding('dorf_bruecke_02', sx, sy + 5.3 * (k + 1), f'ankerholm_steg_{k + 1}'))
steg_ende = sy + 5.3 * 3 - 0.6
freigeben = [{'art': 'rechteck', 'x0': round(sx - 1.3, 2), 'y0': round(sy - 0.2, 2), 'x1': round(sx + 1.3, 2), 'y1': round(steg_ende, 2)}]
ding('kueste_netze', sx + 1.6, sy + 1.5, 'ankerholm_netze')
FISCH = [{'id': 'ankerholm_fisch_1', 'fisch': 'bachling', 'stehplatz': [sx - 0.7, round(steg_ende - 0.8, 1)], 'wasser': [sx - 2.2, round(steg_ende - 0.8, 1)]},
         {'id': 'ankerholm_fisch_2', 'fisch': 'bachling', 'stehplatz': [sx + 0.7, round(steg_ende - 0.8, 1)], 'wasser': [sx + 2.2, round(steg_ende - 0.8, 1)]}]

# Kiefernhain: wenige Bäume zum Fällen (Kiefer → Integration; bis dahin Tanne als Bild)
KIEFERN = []
for k, (dx, dy) in enumerate([(-9, -4), (-4, -7), (3, -6), (9, -3), (-10, 3), (-3, 4), (6, 5), (11, 2)]):
    x, y = HAIN[0] + dx + rng.uniform(-1, 1), HAIN[1] + dy + rng.uniform(-1, 1)
    ding('holz_tanne_01', x, y, f'ankerholm_kiefer_{k + 1}'); KIEFERN.append({'id': f'ankerholm_kiefer_{k + 1}', 'x': round(x, 1), 'y': round(y, 1)})
for k in range(10):   # Kranz aus stehenden Bäumen und Büschen ums Hain (nicht zum Fällen)
    a = k / 10 * 6.283; x, y = HAIN[0] + math.cos(a) * 18, HAIN[1] + math.sin(a) * 12
    if zeichen(x, y) in '.,f': ding(['stil_tanne_01', 'stil_tanne_02', 'stil_busch_01'][k % 3], x, y, f'ankerholm_baum_{k + 1}')

# Felsen im Osten: zwei Kupferadern, Arvids Behelfsschmiede
ADERN = []
for k, (x, y) in enumerate([(123.5, 57), (124.5, 67)]):
    ding('berg_kupferstein_01', x, y, f'ankerholm_kupfer_{k + 1}'); ADERN.append({'id': f'ankerholm_kupfer_{k + 1}', 'erz': 'kupfer', 'x': x, 'y': y})
ding('dorf_schmiede_01', SCHMIEDE[0], SCHMIEDE[1], 'ankerholm_schmiede')
ding('k_kiste', SCHMIEDE[0] + 4, SCHMIEDE[1] + 1, 'ankerholm_schmiede_kiste')
lies_('ankerholm_felsen', 120, 62, 'Grünliche Adern im Fels: Kupfer. Arvid sagt, daraus werden Beschläge für den neuen Mast.')

# Nordspitze: Leuchtfeuer, Haukes Übungsplatz, Hütte
ding('kueste_leuchtturm', FEUER[0], FEUER[1], 'ankerholm_leuchtfeuer')
ding('dorf_huette_holz_02', 96, 30, 'ankerholm_haukes_huette')
PUPPEN = []
for k, (farbe, art, dx) in enumerate([('rot', 'nah', -6), ('gruen', 'fern', 0), ('blau', 'magie', 6)]):
    obj = f'ankerholm_uebungspuppe_{farbe}' if hat(f'ankerholm_uebungspuppe_{farbe}') else 'wegrand_wegkreuz_holz'   # Platzhalter bis zu den Puppen der Figuren-Rolle
    x, y = FEUER[0] + dx, 36.5; ding(obj, x, y, f'ankerholm_puppe_{art}'); PUPPEN.append({'id': f'puppe_{art}', 'farbe': farbe, 'kampfart': art, 'x': x, 'y': y})
lies_('ankerholm_leuchtfeuer_tafel', FEUER[0] + 2.5, FEUER[1] + 3, 'Ein altes Leuchtfeuer der Wacht. Seit Jahren hält Hauke Morn es allein am Brennen.')

# Bucht der Plünderer (Nordwesten): Zelte, Feuer, Beute, Boot
for k, (dx, dy) in enumerate([(-3, 0), (4, -2)]): ding('welt_zelt_01', BUCHT[0] + dx, BUCHT[1] + dy, f'ankerholm_pluenderer_zelt_{k + 1}', **({'spiegeln': True} if k else {}))
ding('dorf_festfeuer_01', BUCHT[0] + 1, BUCHT[1] + 4, 'ankerholm_pluenderer_feuer'); ding('k_kiste', BUCHT[0] + 6, BUCHT[1] + 3, 'ankerholm_pluenderer_beute'); ding('kueste_wrackkiste', BUCHT[0] - 5, BUCHT[1] + 4, 'ankerholm_pluenderer_splitter')
bx, by = BUCHT[0] - 2, BUCHT[1] - 6
while zeichen(bx, by) not in 'wM' and by > 2: by -= 1
ding('kueste_ruderboot', bx, by - 1.5, 'ankerholm_pluenderer_boot')
PLUENDERER = [{'id': f'pluenderer_{k + 1}', 'x': BUCHT[0] + dx, 'y': BUCHT[1] + dy} for k, (dx, dy) in enumerate([(-6, 6), (7, 6), (0, 9)])]
OLE = {'id': 'schwarzer_ole', 'x': BUCHT[0] + 1, 'y': BUCHT[1] + 1}

# ───── Plätze der Figuren und Ablauf (für Quests, Systeme, Integration) ─────
FIGUREN = {'telse_brack': [LAGER[0] - 3, LAGER[1] + 3], 'arvid_thorn': [SCHMIEDE[0] - 3, SCHMIEDE[1] + 2.5], 'merle_haff': [88, 102.5], 'hauke_morn': [FEUER[0] + 3, 33]}
START = [LAGER[0] - 8, LAGER[1] + 6]
# Kollision: Wrack nach Figuren-Rolle ≈ 4,5 × 12 m (Bug −y, um 270° gedreht: liegt Ost–West)
sperren = [{'art': 'rechteck', 'x0': 58, 'y0': round(WY - 2.25, 2), 'x1': 70, 'y1': round(WY + 2.25, 2), 'quelle': 'ankerholm_wrack'}]

# ───── schreiben ─────
d = os.path.join(W, 'regionen', 'ankerholm'); os.makedirs(d, exist_ok=True)
region = {'id': 'ankerholm', 'name': 'Ankerholm', 'untertitel': 'Die Insel der Gestrandeten', 'ursprung': URSPRUNG, 'chunks': CHUNKS, 'biom': 'kueste', 'stufe': 1, 'ebene': 'draussen'}
if '--live' not in sys.argv: region['entwurf'] = True   # bis Ausgabe 2 (#190): nicht im Spiel
json.dump(region, open(os.path.join(d, 'region.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
open(os.path.join(d, 'gelaende.txt'), 'w', encoding='utf8').write('\n'.join(''.join(z) for z in Z) + '\n')
with open(os.path.join(d, 'objekte.json'), 'w', encoding='utf8') as f: f.write('[\n' + ',\n'.join(' ' + json.dumps(o, ensure_ascii=False, separators=(',', ':')) for o in objekte) + '\n]\n')
json.dump({'start': [START], 'figuren': [], 'spawnzonen': [], 'interaktionen': ia, 'ausgaenge': [], 'kollision': {'sperren': sperren, 'freigeben': freigeben}},
          open(os.path.join(d, 'spiel.json'), 'w', encoding='utf8'), indent=1, ensure_ascii=False)
ux, uy = URSPRUNG[0] * C, URSPRUNG[1] * C; welt = lambda p: [round(p[0] + ux, 1), round(p[1] + uy, 1)]
json.dump({'hinweis': 'Einsteiger-Insel Ankerholm (#190, ankerholm.py). Stellen in Feldern der Region (lokal) und in Weltfeldern (welt). Für Quests (Stellen statt der Platzhalter ANKERHOLM), Systeme (Start, Puppen, Überfahrt) und Integration (Bäume, Adern, Fischstellen, Stationen, Gegner).',
           'region': 'ankerholm', 'ursprung_welt': [ux, uy], 'entwurf': 'entwurf' in region,
           'start': {'lokal': START, 'welt': welt(START)}, 'figuren': {k: {'lokal': v, 'welt': welt(v)} for k, v in FIGUREN.items()},
           'orte': {k: {'lokal': list(v), 'welt': welt(v)} for k, v in {'lager': LAGER, 'wrack': (64, WY), 'kiefernhain': HAIN, 'schmiede': SCHMIEDE, 'leuchtfeuer': FEUER, 'uebungsplatz': (FEUER[0], 36.5), 'bucht': BUCHT, 'steg': (sx, steg_ende)}.items()},
           'kiefern': [{**k, 'welt': welt((k['x'], k['y']))} for k in KIEFERN], 'kupferadern': [{**a, 'welt': welt((a['x'], a['y']))} for a in ADERN],
           'stationen': {'feuer': {'lokal': list(LAGER), 'welt': welt(LAGER), 'objekt': 'ankerholm_feuer'}, 'kochplatz': {'lokal': [88, 100], 'welt': welt((88, 100)), 'objekt': 'ankerholm_kochplatz'},
                         'esse_und_amboss': {'gebaeude': 'ankerholm_schmiede', 'bauplan': 'dorf_schmiede_01', 'hinweis': 'Esse und Amboss stehen im Bauplan; die genaue Lage schreibt bedienstellen.mjs (nach dem Bau)'}},
           'fischstellen': [{**f, 'welt_wasser': welt(f['wasser']), 'welt_stehplatz': welt(f['stehplatz'])} for f in FISCH],
           'puppen': [{**p, 'welt': welt((p['x'], p['y']))} for p in PUPPEN], 'pluenderer': [{**p, 'welt': welt((p['x'], p['y']))} for p in PLUENDERER], 'schwarzer_ole': {**OLE, 'welt': welt((OLE['x'], OLE['y']))}},
          open(os.path.join(W, 'ankerholm_orte.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
land_n = sum(1 for z in Z for c in z if c not in 'Mw')
print(f'Ankerholm: {land_n} Felder Land, {len(objekte)} Objekte, {len(ia)} Lesestellen, {len(KIEFERN)} Kiefern, {len(ADERN)} Kupferadern, {len(PUPPEN)} Puppen' + (' (Entwurf)' if 'entwurf' in region else ' (live)'))
