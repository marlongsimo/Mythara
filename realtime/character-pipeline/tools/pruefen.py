"""Automatische Qualitätsprüfung einer produzierten Figur. Schreibt export/<figur>/bericht.md und bericht.json.
Prüft: Vollständigkeit (Animationen, 8 Richtungen, Frames), Framegrößen, Transparenz und Beschnitt am Bildrand, Fußpunkt und Bodenkontakt,
Sprünge zwischen Frames, Frame-Reihenfolge, Taktrate, Texturfehler (Magenta), fehlende Dateien, Phaser-Atlasformat, Ausrüstungsdaten, Kennzeichnung der TEST ASSETS."""
import json, os, time
from PIL import Image
import ebenen as E

def pruefen(fid):
    R = E.lade('configs/render.json'); fig = E.lade(f'configs/figuren/{fid}.json'); kat = E.items(); B = R['bild']
    ziel = os.path.normpath(os.path.join(E.W, R['export']['ziel'], fig['export'])); erg = []
    def p(gruppe, ok, text, warn=False): erg.append({'gruppe': gruppe, 'status': 'ok' if ok else ('warnung' if warn else 'fehler'), 'text': text})
    soll_r = [r['id'] for r in R['richtungen']]; soll_a = fig['animationen']['liste']
    ebs = ['koerper:' + r for r in fig['koerper']['regionen']] + ['item:' + g for g, d in kat.items() if d.get('skeleton') == fig['skelett']]
    # 1. Daten der Ausrüstung
    sl = E.lade('configs/slots.json'); sk = E.lade(f'configs/skelette/{fig["skelett"]}.json')
    for g in kat.values():
        f = []
        if g['slot'] not in sl['slots']: f.append('unbekannter Slot')
        if g['rarity'] not in sl['seltenheit']: f.append('unbekannte Seltenheit')
        for s in g.get('occupies', []): 
            if s not in sl['slots']: f.append('occupies ' + s)
        for s in ([g['attach'].get('socket')] if g['attach'].get('socket') else []) + [t['socket'] for t in g['attach'].get('parts', [])]:
            if s not in sk['sockel']: f.append('Sockel ' + s)
        for r in g['hides'].get('regions', []):
            if r not in fig['koerper']['regionen']: f.append('Region ' + r)
        if not os.path.exists(os.path.join(E.W, g['model']['file'])): f.append('Modell fehlt')
        if g.get('testAsset') and 'TEST ASSET' not in g['name']: f.append('TEST ASSET nicht im Namen')
        p('Ausrüstungsdaten', not f, f'{g["id"]}: ' + (', '.join(f) if f else 'Slot, Sockel, Seltenheit, Modell und Kennzeichnung gültig'))
    p('Ausrüstungsdaten', not E.ausruestung_pruefen(fig, fig['standardAusruestung'], kat), 'Standardausrüstung gültig (keine doppelt belegten Slots)')
    p('Ausrüstungsdaten', bool(E.ausruestung_pruefen(fig, {'main_hand': 'test_zweihaender', 'off_hand': 'test_schild_rund'}, kat)), 'Zweihänder + Schild wird als ungültig erkannt')
    # 2. Rendering je Ebene
    for e in ebs:
        try: m = E.manifest(fid, e)
        except FileNotFoundError: p('Vollständigkeit', False, f'{e}: nicht gerendert'); continue
        fa = [a for a in soll_a if a not in m['animationen']]; fr = [r for r in soll_r if r not in m['richtungen']]
        p('Vollständigkeit', not fa and not fr and not m['fehler'], f'{e}: ' + ('alle Animationen und 8 Richtungen' if not fa and not fr else f'fehlt: {fa} {fr}') + (f' · {m["fehler"]}' if m['fehler'] else ''))
        p('Fußpunkt', abs(m['fuss'][0] - R['fusspunkt']['x'] * B['breite']) < 0.6 and abs(m['fuss'][1] - R['fusspunkt']['y'] * B['hoehe']) < 0.6, f'{e}: Fußpunkt {m["fuss"]} (Soll {[R["fusspunkt"]["x"] * B["breite"], R["fusspunkt"]["y"] * B["hoehe"]]})')
        groesse = rand = magenta = fehlt = folge = takt = 0; leer = 0; n = 0; LIB = E.lade(f'configs/animationen/{fig["animationen"]["bibliothek"]}.json')
        for an, A in m['animationen'].items():
            if A['fps'] != LIB['clips'][an].get('fps', R['fps']): takt += 1
            for ri in m['richtungen']:
                d = os.path.dirname(E.bild(fid, e, an, ri, 0)); dateien = sorted(f for f in os.listdir(d) if f.endswith('.png'))
                if dateien != [f'{i:03d}.png' for i in range(A['frames'])]: folge += 1
                if len(m['tiefe'][an][ri]) != A['frames']: folge += 1
                for i in range(A['frames']):
                    q = E.bild(fid, e, an, ri, i)
                    if not os.path.exists(q): fehlt += 1; continue
                    im = Image.open(q); n += 1
                    if im.size != (B['breite'], B['hoehe']) or im.mode != 'RGBA': groesse += 1; continue
                    a = im.getchannel('A'); w, h = im.size
                    if a.getbbox() is None: leer += 1; continue
                    if max(a.crop((0, 0, w, 1)).getextrema()[1], a.crop((0, h - 1, w, h)).getextrema()[1], a.crop((0, 0, 1, h)).getextrema()[1], a.crop((w - 1, 0, w, h)).getextrema()[1]) > 8: rand += 1
                    k = im.convert('RGB').resize((56, 56)); bt = k.tobytes(); magenta += sum(1 for j in range(0, len(bt), 3) if bt[j] > 200 and bt[j + 2] > 200 and bt[j + 1] < 60)
        p('Framegrößen', groesse == 0, f'{e}: {n} Frames, {groesse} mit falscher Größe/ohne Alpha')
        p('Transparenz', rand == 0, f'{e}: {rand} Frames am Bildrand abgeschnitten', warn=e.startswith('item:'))
        p('Frame-Reihenfolge', folge == 0 and fehlt == 0, f'{e}: Nummerierung lückenlos, {fehlt} fehlende Dateien')
        p('Taktrate', takt == 0, f'{e}: alle Animationen mit ihrer Bildrate (Standard {R["fps"]} fps, Angriffe 15 fps)')
        p('Texturfehler', magenta == 0, f'{e}: {magenta} Pixel in Fehlerfarbe (fehlende Textur)')
        if e.startswith('koerper:'): p('Transparenz', leer < n * 0.5, f'{e}: {leer} von {n} Frames ganz verdeckt', warn=True)
    # 3. Zusammengesetzte Standardfigur: Bodenkontakt und ruhiger Stand
    std = {s: g for s, g in fig['standardAusruestung'].items()}; tief = {}; fy = R['fusspunkt']['y'] * B['hoehe']
    def koerperbild(an, ri, i):
        im = None
        for e in E.sichtbare_ebenen(fig, {})[0]:
            q = Image.open(E.bild(fid, e, an, ri, i)).convert('RGBA'); im = q if im is None else Image.alpha_composite(im, q)
        return im.getchannel('A').point(lambda v: 255 if v > 128 else 0).getbbox()
    beine = [r for r in fig['koerper']['regionen'] if r.startswith('bein')] or list(fig['koerper']['regionen'])
    def standbild(an, ri, i):
        im = None
        for r in beine:
            q = Image.open(E.bild(fid, 'koerper:' + r, an, ri, i)).convert('RGBA'); im = q if im is None else Image.alpha_composite(im, q)
        return im.getchannel('A').point(lambda v: 255 if v > 128 else 0).getbbox()
    m0 = E.manifest(fid, 'koerper:' + list(fig['koerper']['regionen'])[0])
    ruhe = {ri: (koerperbild('idle', ri, 0) or (0, 0, 0, fy))[3] for ri in m0['richtungen']} if 'idle' in m0['animationen'] else {}
    for an in soll_a:
        if an in ('death', 'dodge'): continue
        sprung = boden = stand = 0; m = E.manifest(fid, 'koerper:' + list(fig['koerper']['regionen'])[0])
        if an not in m['animationen']: continue
        for ri in m['richtungen']:
            vorher = None; unten = []
            for i in range(m['animationen'][an]['frames']):
                bb = koerperbild(an, ri, i); ref = ruhe.get(ri, fy)
                if not bb or abs(bb[3] - ref) > 12: boden += 1  # Sohle im Vergleich zur Ruhehaltung derselben Richtung (Zehen ragen schräg nach vorn)
                unten.append(bb[3] if bb else 0)
                bs = standbild(an, ri, i); mx = (bs[0] + bs[2]) / 2 if bs else 0   # Stand = Beine/Füße: schwingende Arme oder Waffen zählen nicht als Sprung
                if vorher is not None and abs(mx - vorher) > B['breite'] * 0.035: sprung += 1
                vorher = mx
            if an in ('idle', 'block') and unten: stand = max(stand, max(unten) - min(unten))
        p('Fußpunktstabilität', boden == 0, f'{an}: Füße auf dem Boden in allen Frames (höchstens 12 px Abstand zur Ruhehaltung; {boden} Abweichungen)', warn=an in ('attack', 'hit'))
        p('Fußpunktstabilität', sprung == 0, f'{an}: kein Springen oder Rutschen des Stands zwischen Frames (Beine höchstens {B["breite"] * 0.035:.0f} px je Frame; {sprung})', warn=True)
        if an in ('idle', 'block'): p('Fußpunktstabilität', stand <= 2, f'{an}: Figur steht ruhig, die Sohle schwankt um {stand} px (höchstens 2)')
    # 3b. Überlagerung: Hände, Schultern, Helm, Umhang, Löcher und Durchragen
    import numpy as np
    from scipy import ndimage
    def maske(e, an, ri, i): return np.asarray(Image.open(E.bild(fid, e, an, ri, i)).getchannel('A')) > 100
    def abstand(mk, pt):
        ys, xs = np.nonzero(mk)
        return float(np.min(np.hypot(xs - pt[0], ys - pt[1]))) if len(xs) else 1e9
    hand = {'main_hand': ('Hand_Right', 'Hand_Left'), 'off_hand': ('Hand_Left', 'Hand_Right')}
    for g in kat.values():
        if g.get('skeleton') != fig['skelett']: continue
        e = 'item:' + g['id']
        try: m = E.manifest(fid, e)
        except FileNotFoundError: continue
        if 'sockel' not in m: p('Überlagerung', False, f'{e}: Sockelpositionen fehlen im Manifest (neu rendern)'); continue
        if g['slot'] in hand:
            gut = falsch = n = 0; soll, anders = hand[g['slot']]; an_liste = [a for a in m['animationen'] if a in ('idle', 'walk', 'attack', 'block', 'idle_1h', 'attack_1h', 'block_1h', 'hit', 'death')]
            for an in an_liste:
                for ri in m['richtungen']:
                    for i in range(0, m['animationen'][an]['frames'], 2):
                        mk = maske(e, an, ri, i)
                        if not mk.any(): continue
                        S_ = m['sockel'][an][ri][i]; d1 = abstand(mk, S_[soll]); d2 = abstand(mk, S_[anders]); n += 1
                        gut += d1 <= 24; falsch += d2 + 12 < d1
            p('Überlagerung', n and gut / n >= 0.9 and falsch <= n * 0.02, f'{e}: liegt an der {"rechten" if soll == "Hand_Right" else "linken"} Hand ({gut}/{n} Frames, {falsch} näher an der anderen Hand)')
        if g['slot'] == 'shoulders':
            gut = n = 0
            for ri in m['richtungen']:
                for i in range(0, m['animationen']['idle']['frames'], 3):
                    mk = maske(e, 'idle', ri, i); S_ = m['sockel']['idle'][ri][i]; n += 1
                    gut += min(abstand(mk, S_['Shoulder_Left']), abstand(mk, S_['Shoulder_Right'])) <= 30
            p('Überlagerung', gut / n >= 0.95, f'{e}: sitzt an den Schultern ({gut}/{n} Frames)')
        if g['slot'] == 'head':
            gut = n = 0
            for ri in m['richtungen']:
                mk = maske(e, 'idle', ri, 0); kk = maske('koerper:kopf', 'idle', ri, 0) | mk  # Kopf samt der vom Helm verdeckten Teile
                yb, xb = np.nonzero(mk); yk, xk = np.nonzero(maske('koerper:kopf', 'idle', ri, 0) if maske('koerper:kopf', 'idle', ri, 0).any() else kk); n += 1
                if len(xb) and len(xk): gut += (xb.max() - xb.min()) >= 0.9 * (xk.max() - xk.min()) and yb.min() <= yk.min() + 3
            p('Überlagerung', gut == n, f'{e}: passt zur Kopfgröße (deckt Breite und Scheitel in {gut}/{n} Richtungen)')
        if g['slot'] == 'back':
            ok_ = n = 0; mr = E.manifest(fid, 'koerper:rumpf')
            for an in ('idle', 'walk'):
                for ri, hinten in (('S', True), ('SO', True), ('SW', True), ('N', False), ('NO', False), ('NW', False)):
                    for i in range(m['animationen'][an]['frames']):
                        tc, tr = m['tiefe'][an][ri][i], mr['tiefe'][an][ri][i]; n += 1; ok_ += (tc > tr) == hinten
            p('Überlagerung', ok_ == n, f'{e}: von Süden hinter, von Norden vor dem Körper ({ok_}/{n} Frames)')
        if g['attach']['mode'] == 'skinned' and g['slot'] in ('hands', 'legs', 'feet', 'chest'):
            durch = flaeche = 0; regs = g['attach'].get('bindTo', [])
            for an in ('idle', 'walk', 'attack'):
                for ri in m['richtungen']:
                    for i in range(0, m['animationen'][an]['frames'], 3):
                        mk = maske(e, an, ri, i)
                        if not mk.any(): continue
                        innen = ndimage.binary_fill_holes(mk) & ~mk; koerper = np.zeros_like(mk)
                        for r in regs:
                            if r not in g['hides']['regions']: koerper |= maske('koerper:' + r, an, ri, i)
                        durch += int((innen & koerper).sum()); flaeche += int(mk.sum())
            anteil = durch / max(1, flaeche); p('Überlagerung', anteil < 0.01, f'{e}: Körper ragt kaum durch ({anteil * 100:.2f} % der Fläche)', warn=anteil < 0.03)
    # Löcher in der Gesamtsilhouette (Standard und ein schweres Set)
    for name, wahl in (('Standard', fig['standardAusruestung']), ('Schwer', {**fig['standardAusruestung'], 'head': 'test_helm_wacht', 'shoulders': 'test_schulter_schatten', 'legs': 'test_beinschutz_dunkel', 'feet': 'test_stiefel_stahl'})):
        if E.ausruestung_pruefen(fig, wahl, kat) or any(not os.path.exists(os.path.join(E.W, 'render', fid, 'item_' + g)) for g in wahl.values() if g): continue
        loch = n = 0; tief = {}
        for an in ('idle', 'walk', 'attack', 'block'):
            for ri in soll_r:
                for i in range(0, E.manifest(fid, 'koerper:rumpf')['animationen'][an]['frames'], 2):
                    im = E.zusammensetzen(fid, fig, wahl, an, ri, i, tief); mk = np.asarray(im.getchannel('A')) > 100; L, k = ndimage.label(ndimage.binary_fill_holes(mk) & ~mk)
                    gr = ndimage.sum(np.ones_like(L), L, range(1, k + 1)) if k else []; loch += sum(1 for x in gr if x > 6); n += 1
        p('Überlagerung', loch <= n * 0.05, f'Set „{name}“: Löcher in der Silhouette in {loch} von {n} Frames', warn=loch <= n * 0.15)

    # 4. Phaser-Export
    try:
        F = json.load(open(os.path.join(ziel, 'figur.json'))); fehl = []
        for e, d in F['ebenen'].items():
            A = json.load(open(os.path.join(ziel, d['atlas']))); namen = set()
            for t in A['textures']:
                if not os.path.exists(os.path.join(ziel, 'ebenen', t['image'])): fehl.append(t['image'])
                if t['size']['w'] > R['export']['atlasMaxSeite'] or t['size']['h'] > R['export']['atlasMaxSeite']: fehl.append(t['image'] + ' zu groß')
                for fr in t['frames']:
                    namen.add(fr['filename']); f_ = fr['frame']
                    if f_['x'] + f_['w'] > t['size']['w'] or f_['y'] + f_['h'] > t['size']['h']: fehl.append(fr['filename'] + ' außerhalb')
            soll = {f'{an}/{ri}/{i:03d}' for an, a in F['animationen'].items() for ri in [r['id'] for r in F['richtungen']] for i in range(a['frames'])}
            if soll - namen: fehl.append(f'{e}: {len(soll - namen)} Frames fehlen im Atlas')
        p('Phaser-Kompatibilität', not fehl, 'Multiatlas-Format, Seitengröße ≤ ' + str(R['export']['atlasMaxSeite']) + ', alle Frames vorhanden' + (': ' + '; '.join(fehl[:5]) if fehl else ''))
        p('Kennzeichnung', not F['testAsset'] or 'TEST ASSET' in F['name'], 'Testfigur als TEST ASSET gekennzeichnet')
    except FileNotFoundError as x: p('Phaser-Kompatibilität', False, 'Export fehlt: ' + str(x))
    ok = sum(1 for x in erg if x['status'] == 'ok'); fe = sum(1 for x in erg if x['status'] == 'fehler'); wa = sum(1 for x in erg if x['status'] == 'warnung')
    exp = os.path.join(E.W, 'export', fid); os.makedirs(exp, exist_ok=True)
    json.dump({'figur': fid, 'zeit': time.strftime('%Y-%m-%d %H:%M'), 'ok': ok, 'fehler': fe, 'warnungen': wa, 'ergebnisse': erg}, open(os.path.join(exp, 'bericht.json'), 'w'), ensure_ascii=False, indent=1)
    z = [f'# Produktionsbericht: {fig["name"]}', '', f'Erstellt {time.strftime("%Y-%m-%d %H:%M")} · **{ok} bestanden · {fe} Fehler · {wa} Warnungen**', '']
    if fig.get('testAsset'): z += ['> TEST ASSET: Körper KayKit-Mannequin (CC0), Ausrüstung selbstgebaute Platzhalter. Keine finale Mythara-Grafik.', '']
    for gr in dict.fromkeys(x['gruppe'] for x in erg):
        z += [f'## {gr}', ''] + [f'- {"✓" if x["status"] == "ok" else "⚠" if x["status"] == "warnung" else "✗"} {x["text"]}' for x in erg if x['gruppe'] == gr] + ['']
    open(os.path.join(exp, 'bericht.md'), 'w').write('\n'.join(z))
    return {'ok': ok, 'fehler': fe, 'warnungen': wa, 'datei': os.path.join(exp, 'bericht.md')}

if __name__ == '__main__':
    import sys; r = pruefen(sys.argv[1]); print(r); sys.exit(1 if r['fehler'] else 0)
