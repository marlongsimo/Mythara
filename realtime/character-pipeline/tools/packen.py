"""Packen: aus den gerenderten Ebenen spielfertige Daten für Phaser 3 machen.
Je Ebene ein Multiatlas (Phaser: this.load.multiatlas), Frames beschnitten (trimmed) mit Originalmaß – so bleibt der Fußpunkt in jedem Frame gleich.
Dazu figur.json (alles, was das Spiel über die Figur wissen muss), ausruestung.json (Katalog) und Vorschau-Sheets für Menschen."""
import hashlib, json, os, shutil, time
from PIL import Image
import ebenen as E

def seiten_packen(bilder, maxs):
    """Skyline-Packen (unten-links): dichter als Regale. bilder: [(name, Image)] → [(seitenbild, [(name, x, y, w, h)])]. 1 px Rand je Bild."""
    reste = sorted(bilder, key=lambda b: (-b[1].height, -b[1].width)); aus = []
    while reste:
        sky = [(0, 0, maxs)]; pos = []; uebrig = []
        for name, im in reste:
            w, h = im.width + 2, im.height + 2; best = None
            for k in range(len(sky)):
                x = sky[k][0]
                if x + w > maxs: break
                y = 0; breite = 0; j = k
                while breite < w and j < len(sky): y = max(y, sky[j][1]); breite += sky[j][2]; j += 1
                if breite < w or y + h > maxs: continue
                if best is None or y + h < best[1] + best[3] or (y + h == best[1] + best[3] and x < best[0]): best = (x, y, w, h, k)
            if best is None: uebrig.append((name, im)); continue
            x, y, w, h, k = best; pos.append((name, im, x + 1, y + 1))
            neu = []; ende = x + w
            for (sx, sy, sw) in sky:
                if sx + sw <= x or sx >= ende: neu.append((sx, sy, sw)); continue
                if sx < x: neu.append((sx, sy, x - sx))
                if sx + sw > ende: neu.append((ende, sy, sx + sw - ende))
            neu.append((x, y + h, w)); neu.sort(); sky = []
            for seg in neu:
                if sky and sky[-1][1] == seg[1] and sky[-1][0] + sky[-1][2] == seg[0]: sky[-1] = (sky[-1][0], sky[-1][1], sky[-1][2] + seg[2])
                else: sky.append(seg)
        if not pos: raise RuntimeError('Bild größer als eine Atlasseite')
        bw = max(px + im.width for _, im, px, _ in pos) + 1; bh = max(py + im.height for _, im, _, py in pos) + 1; bw = ((bw + 3) // 4) * 4; bh = ((bh + 3) // 4) * 4
        sb = Image.new('RGBA', (bw, bh), (0, 0, 0, 0))
        for _, im, px, py in pos: sb.paste(im, (px, py))
        aus.append((sb, [(n, px, py, im.width, im.height) for n, im, px, py in pos])); reste = uebrig
    return aus

def packen(fid):
    R = E.lade('configs/render.json'); fig = E.lade(f'configs/figuren/{fid}.json'); kat = E.items(); B = R['bild']
    ziel = os.path.normpath(os.path.join(E.W, R['export']['ziel'], fig['export'])); os.makedirs(os.path.join(ziel, 'ebenen'), exist_ok=True)
    exp = os.path.join(E.W, 'export', fid); os.makedirs(os.path.join(exp, 'vorschau'), exist_ok=True)
    MS = R['export'].get('massstab', 1); BW, BH = round(B['breite'] * MS), round(B['hoehe'] * MS); stat = {}
    for f in os.listdir(os.path.join(ziel, 'ebenen')): os.remove(os.path.join(ziel, 'ebenen', f))  # alte Seiten weg (Seitenzahl kann sich ändern)
    liste = sorted(os.listdir(os.path.join(E.W, 'render', fid))); seiten_n = 0; kb = 0; eb = {}; anims = None
    for d in liste:
        if not os.path.exists(os.path.join(E.W, 'render', fid, d, 'ebene.json')): continue
        m = json.load(open(os.path.join(E.W, 'render', fid, d, 'ebene.json'))); e = m['ebene']
        if e.startswith('item:') and e[5:] not in kat: continue  # Gegenstand gibt es nicht mehr
        anims = anims or m['animationen']; bilder = []; leer = {}; gleich = {}; schon = {}
        for an, A in m['animationen'].items():
            for ri in m['richtungen']:
                for i in range(A['frames']):
                    im = Image.open(E.bild(fid, e, an, ri, i)).convert('RGBA'); name = f'{an}/{ri}/{i:03d}'
                    if MS != 1: im = im.resize((BW, BH), Image.LANCZOS)
                    bb = im.getchannel('A').getbbox()
                    if bb is None: bb = (0, 0, 1, 1); leer[name] = True
                    stueck = im.crop(bb); h = hashlib.md5(stueck.tobytes() + bytes(str(bb), 'ascii')).hexdigest()
                    if h in schon: gleich[name] = schon[h]; continue   # gleiches Bild an gleicher Stelle: nur einmal speichern
                    schon[h] = name; bilder.append((name, stueck, bb))
        boxen = {n: bb for n, _, bb in bilder}; texturen = []; gpu = 0
        for k, (sb, pos) in enumerate(seiten_packen([(n, im) for n, im, _ in bilder], R['export']['atlasMaxSeite'])):
            datei = f'{d}-{k}.webp'; sb.save(os.path.join(ziel, 'ebenen', datei), 'WEBP', quality=R['export']['qualitaet'], method=6, exact=True); seiten_n += 1; kb += os.path.getsize(os.path.join(ziel, 'ebenen', datei)) // 1024
            gpu += sb.width * sb.height * 4; doppelt = [(d, q) for d, q in gleich.items()]
            eintrag = lambda n, q, x, y, w, h: {'filename': n, 'rotated': False, 'trimmed': True, 'sourceSize': {'w': BW, 'h': BH}, 'spriteSourceSize': {'x': boxen[q][0], 'y': boxen[q][1], 'w': w, 'h': h}, 'frame': {'x': x, 'y': y, 'w': w, 'h': h}}
            fr = [eintrag(n, n, x, y, w, h) for n, x, y, w, h in pos]; hier = {n: (x, y, w, h) for n, x, y, w, h in pos}
            fr += [eintrag(d, q, *hier[q]) for d, q in doppelt if q in hier]   # Dubletten zeigen auf dasselbe Rechteck
            texturen.append({'image': datei, 'format': 'RGBA8888', 'size': {'w': sb.width, 'h': sb.height}, 'scale': 1, 'frames': fr})
        meta = {'app': 'mythara-character-pipeline', 'version': '2', 'mythara': {'ebene': e, 'art': m['art'], 'slot': m.get('slot'), 'region': m.get('region'), 'tiefe': m['tiefe'], 'leer': sorted(leer), 'testAsset': m.get('testAsset', False),
            'statistik': {'frames': sum(A['frames'] for A in m['animationen'].values()) * len(m['richtungen']), 'einzigartig': len(bilder), 'seiten': len(texturen), 'gpuBytes': gpu}}}
        stat[e] = {'frames': meta['mythara']['statistik']['frames'], 'einzigartig': len(bilder), 'seiten': len(texturen), 'gpuBytes': gpu, 'dateiBytes': sum(os.path.getsize(os.path.join(ziel, 'ebenen', t['image'])) for t in texturen)}
        json.dump({'textures': texturen, 'meta': meta}, open(os.path.join(ziel, 'ebenen', d + '.json'), 'w'), separators=(',', ':'))
        eb[e] = {'atlas': f'ebenen/{d}.json', 'art': m['art'], **({'region': m['region']} if m.get('region') else {}), **({'item': m['item'], 'slot': m['slot']} if m.get('item') else {})}
    # Maßstab fürs Spiel: Höhe der Standardfigur in Ruhe von Süden
    std = fig['standardAusruestung']; ref = E.zusammensetzen(fid, fig, {s: g for s, g in std.items() if ('item:' + str(g)) in eb}, 'idle', 'S', 0)
    bb = ref.getchannel('A').getbbox() if ref else None; hoehe = (bb[3] - bb[1]) if bb else B['hoehe']
    m0 = json.load(open(os.path.join(E.W, 'render', fid, 'koerper_' + list(fig['koerper']['regionen'])[0], 'ebene.json')))
    F = {'schema': 'mythara-figur3d/1', 'id': fid, 'name': fig['name'], 'testAsset': fig.get('testAsset', False), 'klasse': fig['klasse'], 'skelett': fig['skelett'],
         'erzeugt': time.strftime('%Y-%m-%d %H:%M'), 'bild': {'breite': BW, 'hoehe': BH}, 'fuss': {'x': round(m0['fuss'][0] * MS, 2), 'y': round(m0['fuss'][1] * MS, 2)}, 'exportMassstab': MS,
         'fussNorm': {'x': round(m0['fuss'][0] / B['breite'], 4), 'y': round(m0['fuss'][1] / B['hoehe'], 4)}, 'pixelProMeter': R['pixelProMeter'],
         'spiel': {'figurHoehePx': R['spiel']['figurHoehePx'], 'renderHoehePx': round(hoehe * MS, 1), 'massstab': round(R['spiel']['figurHoehePx'] / (hoehe * MS), 4)},
         'haltungen': fig.get('haltungen', {}), 'statistik': stat,
         'richtungen': [{'id': r['id'], 'grad': r['grad']} for r in R['richtungen'] if r['id'] in m0['richtungen']], 'animationen': {an: {k: A.get(k) for k in ('frames', 'fps', 'schleife', 'halten', 'tempoMeterProSek')} for an, A in (anims or {}).items()},
         'ebenen': eb, 'koerperRegionen': list(fig['koerper']['regionen']), 'standardAusruestung': std, 'slots': E.lade('configs/slots.json')['slots'], 'katalog': 'ausruestung.json'}
    json.dump(F, open(os.path.join(ziel, 'figur.json'), 'w'), ensure_ascii=False, indent=1)
    kat_aus = [{k: g[k] for k in ('id', 'name', 'slot', 'type', 'rarity', 'skeleton', 'stats', 'special', 'visual', 'hides', 'testAsset', 'stance') if k in g} | {'occupies': g.get('occupies', [g['slot']]), 'ebene': 'item:' + g['id'], 'atlas': eb.get('item:' + g['id'], {}).get('atlas')}
               for g in kat.values() if g.get('skeleton') == fig['skelett']]
    json.dump({'schema': 'mythara-ausruestung/1', 'skelett': fig['skelett'], 'seltenheit': E.lade('configs/slots.json')['seltenheit'], 'gegenstaende': kat_aus}, open(os.path.join(ziel, 'ausruestung.json'), 'w'), ensure_ascii=False, indent=1)
    # Vorschau-Sheets (Standardausrüstung): Zeilen = Richtungen, Spalten = Frames; dazu ein Überblick mit allen Animationen von Süden
    tief = {}
    for an, A in (anims or {}).items():
        zellen = 112; sh = Image.new('RGBA', (zellen * A['frames'], zellen * len(F['richtungen'])), (0, 0, 0, 0))
        for j, r in enumerate(F['richtungen']):
            for i in range(A['frames']):
                im = E.zusammensetzen(fid, fig, {s: g for s, g in std.items() if ('item:' + str(g)) in eb}, an, r['id'], i, tief)
                if im: sh.paste(im.resize((zellen, zellen), Image.LANCZOS), (i * zellen, j * zellen))
        sh.save(os.path.join(exp, 'vorschau', f'{an}.webp'), 'WEBP', quality=85)
    return {'ebenen': len(eb), 'seiten': seiten_n, 'kb': kb, 'ziel': ziel}
