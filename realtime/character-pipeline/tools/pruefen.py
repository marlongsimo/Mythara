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
        groesse = rand = magenta = fehlt = folge = takt = 0; leer = 0; n = 0
        for an, A in m['animationen'].items():
            if A['fps'] != R['fps']: takt += 1
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
        p('Taktrate', takt == 0, f'{e}: alle Animationen mit {R["fps"]} fps')
        p('Texturfehler', magenta == 0, f'{e}: {magenta} Pixel in Fehlerfarbe (fehlende Textur)')
        if e.startswith('koerper:'): p('Transparenz', leer < n * 0.5, f'{e}: {leer} von {n} Frames ganz verdeckt', warn=True)
    # 3. Zusammengesetzte Standardfigur: Bodenkontakt und ruhiger Stand
    std = {s: g for s, g in fig['standardAusruestung'].items()}; tief = {}; fy = R['fusspunkt']['y'] * B['hoehe']
    def koerperbild(an, ri, i):
        im = None
        for e in E.sichtbare_ebenen(fig, {})[0]:
            q = Image.open(E.bild(fid, e, an, ri, i)).convert('RGBA'); im = q if im is None else Image.alpha_composite(im, q)
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
                mx = (bb[0] + bb[2]) / 2 if bb else 0
                if vorher is not None and abs(mx - vorher) > B['breite'] * 0.06: sprung += 1
                vorher = mx
            if an in ('idle', 'block') and unten: stand = max(stand, max(unten) - min(unten))
        p('Fußpunktstabilität', boden == 0, f'{an}: Füße auf dem Boden in allen Frames (höchstens 12 px Abstand zur Ruhehaltung; {boden} Abweichungen)', warn=an in ('attack', 'hit'))
        p('Fußpunktstabilität', sprung == 0, f'{an}: keine Sprünge zwischen Frames ({sprung})', warn=True)
        if an in ('idle', 'block'): p('Fußpunktstabilität', stand <= 2, f'{an}: Figur steht ruhig, die Sohle schwankt um {stand} px (höchstens 2)')
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
