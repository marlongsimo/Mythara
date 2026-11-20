"""Packen: aus den gerenderten Ebenen spielfertige Daten für Phaser 3 machen.
Je Ebene ein Multiatlas (Phaser: this.load.multiatlas), Frames beschnitten (trimmed) mit Originalmaß – so bleibt der Fußpunkt in jedem Frame gleich.
Dazu figur.json (alles, was das Spiel über die Figur wissen muss), ausruestung.json (Katalog) und Vorschau-Sheets für Menschen."""
import json, os, shutil, time
from PIL import Image
import ebenen as E

def seiten_packen(bilder, maxs):
    """Einfaches Regal-Packen (nach Höhe sortiert). bilder: [(name, Image)] → [(seitenbild, [(name, x, y, w, h)])]"""
    reihen = sorted(bilder, key=lambda b: -b[1].height); seiten = []; frei = []; x = y = zeile = 0; pos = []
    def neu():
        nonlocal x, y, zeile, pos; 
        if pos: seiten.append(pos)
        x = y = zeile = 0; pos = []
    for name, im in reihen:
        w, h = im.width + 2, im.height + 2  # 1 px Rand gegen Überlaufen beim Filtern
        if x + w > maxs: x = 0; y += zeile; zeile = 0
        if y + h > maxs: neu()
        pos.append((name, im, x + 1, y + 1)); x += w; zeile = max(zeile, h)
    if pos: seiten.append(pos)
    aus = []
    for pos in seiten:
        bw = max(px + im.width for _, im, px, _ in pos) + 1; bh = max(py + im.height for _, im, _, py in pos) + 1
        bw = 1 << (bw - 1).bit_length() if bw > 1 else 1; bh = max(4, ((bh + 3) // 4) * 4)
        sb = Image.new('RGBA', (bw, bh), (0, 0, 0, 0))
        for _, im, px, py in pos: sb.paste(im, (px, py))
        aus.append((sb, [(n, px, py, im.width, im.height) for n, im, px, py in pos]))
    return aus

def packen(fid):
    R = E.lade('configs/render.json'); fig = E.lade(f'configs/figuren/{fid}.json'); kat = E.items(); B = R['bild']
    ziel = os.path.normpath(os.path.join(E.W, R['export']['ziel'], fig['export'])); os.makedirs(os.path.join(ziel, 'ebenen'), exist_ok=True)
    exp = os.path.join(E.W, 'export', fid); os.makedirs(os.path.join(exp, 'vorschau'), exist_ok=True)
    liste = sorted(os.listdir(os.path.join(E.W, 'render', fid))); seiten_n = 0; kb = 0; eb = {}; anims = None
    for d in liste:
        if not os.path.exists(os.path.join(E.W, 'render', fid, d, 'ebene.json')): continue
        m = json.load(open(os.path.join(E.W, 'render', fid, d, 'ebene.json'))); e = m['ebene']
        if e.startswith('item:') and e[5:] not in kat: continue  # Gegenstand gibt es nicht mehr
        anims = anims or m['animationen']; bilder = []; leer = {}
        for an, A in m['animationen'].items():
            for ri in m['richtungen']:
                for i in range(A['frames']):
                    im = Image.open(E.bild(fid, e, an, ri, i)).convert('RGBA'); bb = im.getchannel('A').getbbox(); name = f'{an}/{ri}/{i:03d}'
                    if bb is None: bb = (0, 0, 1, 1); leer[name] = True
                    bilder.append((name, im.crop(bb), bb))
        boxen = {n: bb for n, _, bb in bilder}; texturen = []
        for k, (sb, pos) in enumerate(seiten_packen([(n, im) for n, im, _ in bilder], R['export']['atlasMaxSeite'])):
            datei = f'{d}-{k}.webp'; sb.save(os.path.join(ziel, 'ebenen', datei), 'WEBP', quality=R['export']['qualitaet'], method=6, exact=True); seiten_n += 1; kb += os.path.getsize(os.path.join(ziel, 'ebenen', datei)) // 1024
            texturen.append({'image': datei, 'format': 'RGBA8888', 'size': {'w': sb.width, 'h': sb.height}, 'scale': 1, 'frames': [
                {'filename': n, 'rotated': False, 'trimmed': True, 'sourceSize': {'w': B['breite'], 'h': B['hoehe']},
                 'spriteSourceSize': {'x': boxen[n][0], 'y': boxen[n][1], 'w': w, 'h': h}, 'frame': {'x': x, 'y': y, 'w': w, 'h': h}} for n, x, y, w, h in pos]})
        meta = {'app': 'mythara-character-pipeline', 'version': '1', 'mythara': {'ebene': e, 'art': m['art'], 'slot': m.get('slot'), 'region': m.get('region'), 'tiefe': m['tiefe'], 'leer': sorted(leer), 'testAsset': m.get('testAsset', False)}}
        json.dump({'textures': texturen, 'meta': meta}, open(os.path.join(ziel, 'ebenen', d + '.json'), 'w'), separators=(',', ':'))
        eb[e] = {'atlas': f'ebenen/{d}.json', 'art': m['art'], **({'region': m['region']} if m.get('region') else {}), **({'item': m['item'], 'slot': m['slot']} if m.get('item') else {})}
    # Maßstab fürs Spiel: Höhe der Standardfigur in Ruhe von Süden
    std = fig['standardAusruestung']; ref = E.zusammensetzen(fid, fig, {s: g for s, g in std.items() if ('item:' + str(g)) in eb}, 'idle', 'S', 0)
    bb = ref.getchannel('A').getbbox() if ref else None; hoehe = (bb[3] - bb[1]) if bb else B['hoehe']
    m0 = json.load(open(os.path.join(E.W, 'render', fid, 'koerper_' + list(fig['koerper']['regionen'])[0], 'ebene.json')))
    F = {'schema': 'mythara-figur3d/1', 'id': fid, 'name': fig['name'], 'testAsset': fig.get('testAsset', False), 'klasse': fig['klasse'], 'skelett': fig['skelett'],
         'erzeugt': time.strftime('%Y-%m-%d %H:%M'), 'bild': {'breite': B['breite'], 'hoehe': B['hoehe']}, 'fuss': {'x': m0['fuss'][0], 'y': m0['fuss'][1]},
         'fussNorm': {'x': round(m0['fuss'][0] / B['breite'], 4), 'y': round(m0['fuss'][1] / B['hoehe'], 4)}, 'pixelProMeter': R['pixelProMeter'],
         'spiel': {'figurHoehePx': R['spiel']['figurHoehePx'], 'renderHoehePx': hoehe, 'massstab': round(R['spiel']['figurHoehePx'] / hoehe, 4)},
         'richtungen': [{'id': r['id'], 'grad': r['grad']} for r in R['richtungen'] if r['id'] in m0['richtungen']], 'animationen': {an: {k: A[k] for k in ('frames', 'fps', 'schleife', 'halten', 'tempoMeterProSek')} for an, A in (anims or {}).items()},
         'ebenen': eb, 'koerperRegionen': list(fig['koerper']['regionen']), 'standardAusruestung': std, 'slots': E.lade('configs/slots.json')['slots'], 'katalog': 'ausruestung.json'}
    json.dump(F, open(os.path.join(ziel, 'figur.json'), 'w'), ensure_ascii=False, indent=1)
    kat_aus = [{k: g[k] for k in ('id', 'name', 'slot', 'type', 'rarity', 'skeleton', 'stats', 'special', 'visual', 'hides', 'testAsset') if k in g} | {'occupies': g.get('occupies', [g['slot']]), 'ebene': 'item:' + g['id'], 'atlas': eb.get('item:' + g['id'], {}).get('atlas')}
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
