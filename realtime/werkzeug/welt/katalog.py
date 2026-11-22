"""
World Pipeline – Katalog und Bildprüfung.

Misst alle Bilder der Bibliotheken (welt/bibliothek/gelaende.json, objekte.json) und des eingeordneten Bestands
(welt/bibliothek/bestand.json), prüft sie gegen den Asset-Standard (doku/world-pipeline/03-asset-standard.md)
und schreibt eine Übersichtsseite mit Vorschaubildern.

Aufruf (im Ordner realtime):  python3 werkzeug/welt/katalog.py [--ohne-seite]
Ausgabe: welt/katalog.html; Fehlercode 1, wenn ein Bild der Bibliotheken gegen eine Muss-Regel verstößt.
"""
import html, json, os, sys
import numpy as np
from PIL import Image

HIER = os.path.dirname(os.path.abspath(__file__))
REALTIME = os.path.normpath(os.path.join(HIER, '..', '..'))
WURZEL = os.path.normpath(os.path.join(REALTIME, '..'))
WELT = os.path.join(REALTIME, 'welt')
FELD, HELD = 48, 84
# Höchstes Dateigewicht (KB) und erlaubte gezeigte Höhe in Heldenhöhen je Kategorie
GEWICHT = {'objekt': 350, 'gelaende': 900}
HOEHE = {'bewuchs': (0.4, 8), 'fels': (0.2, 4), 'gebaeude': (1.5, 10), 'bauteil': (0.3, 5), 'kleinteil': (0.15, 3), 'wasserbau': (0.3, 8), 'sonderort': (1, 40)}

def lies(name):
    with open(os.path.join(WELT, 'bibliothek', name), encoding='utf8') as f:
        return json.load(f)

def masse(pfad):
    """Breite, Höhe, Modus, Gewicht in KB – oder None, wenn das Bild fehlt"""
    voll = os.path.join(WURZEL, pfad)
    if not os.path.exists(voll):
        return None
    with Image.open(voll) as im:
        return im.size[0], im.size[1], im.mode, os.path.getsize(voll) / 1024

def deckung(pfad):
    with Image.open(os.path.join(WURZEL, pfad)) as im:
        if im.mode != 'RGBA':
            return None
        return np.asarray(im)[:, :, 3] > 40

def fuss_messen(a):
    """Fußpunkt aus dem Bild schätzen: Mitte der untersten deckenden Zeilen. Zurück (x, y) als Anteil."""
    ys = np.where(a.any(axis=1))[0]
    unten = ys[-1]
    band = a[max(0, unten - max(2, a.shape[0] // 25)):unten + 1]
    xs = np.where(band.any(axis=0))[0]
    return float((xs[0] + xs[-1] + 1) / 2 / a.shape[1]), float((unten + 1) / a.shape[0])

def stamm_breite(a, ax, ay):
    """Breite der deckenden Fläche am Ankerpunkt (ein kleines Stück darüber), in Bildpunkten"""
    h, w = a.shape
    y = min(h - 1, max(0, int(ay * h) - max(2, h // 40)))
    x = min(w - 1, max(0, int(ax * w)))
    zeile = a[y]
    if not zeile[x]:
        return 0
    l = x
    while l > 0 and zeile[l - 1]:
        l -= 1
    r = x
    while r < w - 1 and zeile[r + 1]:
        r += 1
    return r - l + 1

def naht(pfad):
    """Wie stark springt die Textur am Rand im Vergleich zum Inneren? Um 1 = kachelbar."""
    with Image.open(os.path.join(WURZEL, pfad)) as im:
        a = np.asarray(im.convert('RGB')).astype(np.float32)
    innen = (np.abs(a[:, 1:] - a[:, :-1]).mean() + np.abs(a[1:] - a[:-1]).mean()) / 2
    rand = (np.abs(a[:, 0] - a[:, -1]).mean() + np.abs(a[0] - a[-1]).mean()) / 2
    return rand / max(innen, 1e-3)

def objekt_pruefen(o):
    """Zurück: (muss, soll, werte) – Verstöße gegen Muss-Regeln, Hinweise, gemessene Werte"""
    muss, soll, w = [], [], {}
    m = masse(o['bild'])
    if m is None:
        return ['Bild fehlt: ' + o['bild']], soll, w
    b, h, modus, kb = m
    w.update(breit=b, hoch=h, kb=round(kb))
    if [b, h] != list(o['groesse']):
        muss.append(f'„groesse“ {o["groesse"]} stimmt nicht, das Bild ist {b} × {h}')
    if not o['bild'].endswith('.webp'):
        soll.append('kein WebP')
    a = deckung(o['bild'])
    if a is None:
        muss.append('kein durchsichtiger Hintergrund (Modus ' + modus + ')')
        return muss, soll, w
    if not a.any():
        return ['Bild ist leer'], soll, w
    if a[0, 0] or a[0, -1] or a[-1, 0] or a[-1, -1]:
        muss.append('nicht freigestellt: die Bildecken sind deckend')
    rand = max(a[0].mean(), a[:, 0].mean(), a[:, -1].mean())
    if rand > 0.15:
        soll.append('oben oder seitlich angeschnitten')
    ax, ay = o['anker']
    fx, fy = fuss_messen(a)
    w.update(fuss=(round(fx, 3), round(fy, 3)))
    if abs(ay - fy) > 0.12:
        soll.append(f'Anker y {ay} liegt weit von der Unterkante der Figur ({fy:.2f})')
    hoch = h * o['massstab']
    w.update(gezeigt=round(hoch), helden=round(hoch / HELD, 1))
    lo, hi = HOEHE.get(o['kategorie'], (0.1, 40))
    if not lo <= hoch / HELD <= hi:
        soll.append(f'gezeigte Höhe {hoch:.0f} px = {hoch / HELD:.1f} Heldenhöhen, üblich für {o["kategorie"]}: {lo} bis {hi}')
    k = o.get('kollision')
    if k and k['art'] == 'kreis':
        sb = stamm_breite(a, ax, ay) * o['massstab'] / FELD
        w.update(stamm=round(float(sb), 2))
        if sb > 0 and o['kategorie'] == 'bewuchs' and ((2 * k['r']) / sb < 0.4 or ((2 * k['r']) / sb > 2.5 and 2 * k['r'] > 1.0)):
            soll.append(f'Kollisionskreis ⌀ {2 * k["r"]:.2f} Felder, am Fuß gemessen {sb:.2f}')
    if kb > GEWICHT['objekt']:
        soll.append(f'{kb:.0f} KB (Richtwert bis {GEWICHT["objekt"]})')
    if o.get('platzhalter'):
        soll.append('Platzhalter – muss ersetzt werden')
    if any(t in o['herkunft'].lower() for t in ('offen', 'vermutlich', 'zu klären', 'zu bestätigen')):
        soll.append('Herkunft/Lizenz ungeklärt')
    return muss, soll, w

def gelaende_pruefen(g):
    muss, soll, w = [], [], {}
    if g['kachel'] is None:
        return muss, ['noch keine Textur (Platzhalterfarbe)'], w
    for pfad in [g['kachel']] + g.get('varianten', []):
        m = masse(pfad)
        if m is None:
            muss.append('Bild fehlt: ' + pfad)
            continue
        b, h, modus, kb = m
        w.update(breit=b, hoch=h, kb=round(kb))
        if b != h:
            muss.append(f'{pfad}: nicht quadratisch ({b} × {h})')
        if b < 512:
            soll.append(f'{pfad}: nur {b} px, Wiederholung wird sichtbar')
        n = naht(pfad)
        w.update(naht=round(float(n), 2))
        if n > 2.5:
            soll.append(f'{pfad}: nicht nahtlos kachelbar (Sprung am Rand {n:.1f}-fach)')
        if kb > GEWICHT['gelaende']:
            soll.append(f'{pfad}: {kb:.0f} KB')
    if not g.get('herkunft'):
        soll.append('Herkunft fehlt')
    return muss, soll, w

def seite(gel, obj, bestand, rest):
    e = html.escape
    rel = lambda p: '../../' + p
    def karte(bild, titel, zeilen, muss, soll, farbe=None):
        k = 'k' + (' muss' if muss else ' soll' if soll else '')
        b = f'<div class="b"><img loading="lazy" src="{e(rel(bild))}"></div>' if bild else f'<div class="b" style="background:{farbe}"></div>'
        m = ''.join(f'<li class="m">{e(t)}</li>' for t in muss) + ''.join(f'<li>{e(t)}</li>' for t in soll)
        return f'<div class="{k}">{b}<h3>{e(titel)}</h3><p>{"<br>".join(e(z) for z in zeilen)}</p>{"<ul>" + m + "</ul>" if m else ""}</div>'
    t = ['<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mythara – Weltkatalog</title>',
         '<style>body{font:14px/1.45 system-ui,sans-serif;background:#1b1a17;color:#e6dfd0;margin:0;padding:16px}h1{font-size:22px}h2{margin:28px 0 8px;font-size:17px;border-bottom:1px solid #4a4538;padding-bottom:4px}'
         '.r{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}.k{background:#26241f;border:1px solid #3a372f;border-radius:6px;padding:8px}.k.soll{border-color:#a8882a}.k.muss{border-color:#c0492f}'
         '.b{height:150px;display:flex;align-items:center;justify-content:center;background:repeating-conic-gradient(#3a3832 0 25%,#2f2d28 0 50%) 0 0/16px 16px;border-radius:4px}.b img{max-width:100%;max-height:150px}'
         'h3{font-size:13px;margin:6px 0 2px;word-break:break-all}p{margin:0;color:#b9b19f;font-size:12px}ul{margin:6px 0 0;padding-left:16px;font-size:12px;color:#e0c060}li.m{color:#ff8a6a}table{border-collapse:collapse;font-size:12px}td,th{border:1px solid #3a372f;padding:3px 7px;text-align:left}</style>',
         '<h1>Mythara – Weltkatalog</h1><p>Erzeugt von werkzeug/welt/katalog.py. Rot: Verstoß gegen eine Muss-Regel. Gelb: Hinweis.</p>']
    t.append(f'<h2>Geländearten ({len(gel)})</h2><div class="r">')
    for g, (muss, soll, w) in gel:
        z = [f'Zeichen „{g["zeichen"]}“ · Rang {g["rang"]} · {"begehbar" if g["begehbar"] else "gesperrt"}', f'Rand: {g["rand"]["art"]} {g["rand"]["breite"]}']
        if w: z.append(f'{w.get("breit")} × {w.get("hoch")} · {w.get("kb")} KB · Naht {w.get("naht")}')
        t.append(karte(g['kachel'], g['id'] + ' – ' + g['name'], z, muss, soll, g['farbe']))
    t.append(f'</div><h2>Objekte ({len(obj)})</h2><div class="r">')
    for o, (muss, soll, w) in obj:
        z = [o['kategorie'] + ' · ' + o['tiefe'], f'{w.get("breit")} × {w.get("hoch")} · {w.get("kb")} KB', f'gezeigt {w.get("gezeigt")} px = {w.get("helden")} Heldenhöhen',
             f'Anker {o["anker"]} · gemessen {list(w.get("fuss", []))}', 'Kollision: ' + (json.dumps(o['kollision']) if o['kollision'] else 'keine')]
        t.append(karte(o['bild'], o['id'] + ' – ' + o['name'], z, muss, soll))
    t.append('</div>')
    for nutz, titel in (('ja', 'Bestand – in der Welt nutzbar'), ('bedingt', 'Bestand – mit Nacharbeit nutzbar'), ('nein', 'Bestand – nicht für die Welt (andere Ansicht oder ganzer Ort)')):
        teil = [x for x in bestand if x[0]['nutzbar'] == nutz]
        t.append(f'<h2>{titel} ({len(teil)})</h2><div class="r">')
        for b, m in teil:
            z = [b['art'] + ' · ' + b['ansicht'], (f'{m[0]} × {m[1]} · {m[2]} · {m[3]:.0f} KB' if m else 'BILD FEHLT')]
            if b.get('in'): z.append('in der Bibliothek: ' + b['in'])
            if b.get('notiz'): z.append(b['notiz'])
            t.append(karte(b['bild'] if m else None, b['bild'], z, [] if m else ['Bild fehlt'], [], '#522'))
        t.append('</div>')
    t.append(f'<h2>Figuren und Übriges in img/echtzeit ({len(rest)})</h2><table><tr><th>Bild</th><th>Maße</th><th>Bilderfolge</th><th>KB</th></tr>')
    for n, (b, h, _, kb) in rest:
        feld = h if h in (176, 240, 300) else 176 if h == 352 else None
        t.append(f'<tr><td>{e(n)}</td><td>{b} × {h}</td><td>{f"{b // feld} × {h // feld} zu {feld} px" if feld and b % feld == 0 else "Einzelbild"}</td><td>{kb:.0f}</td></tr>')
    t.append('</table></html>')
    with open(os.path.join(WELT, 'katalog.html'), 'w', encoding='utf8') as f:
        f.write('\n'.join(t))

def main():
    gel = [(g, gelaende_pruefen(g)) for g in lies('gelaende.json')['arten']]
    obj = [(o, objekt_pruefen(o)) for o in lies('objekte.json')['objekte']]
    eintraege = lies('bestand.json')['bilder']
    bestand = [(b, masse(b['bild'])) for b in eintraege]
    bekannt = {b['bild'] for b in eintraege}
    rest = []
    for n in sorted(os.listdir(os.path.join(WURZEL, 'img', 'echtzeit'))):
        p = 'img/echtzeit/' + n
        if p not in bekannt and n.lower().endswith(('.webp', '.png', '.jpg')):
            rest.append((n, masse(p)))
    # Bilder in den Quellordnern der Welt, die noch niemand eingeordnet hat
    lose = []
    for ordner in ('realtime/werkzeug/boden', 'realtime/werkzeug/teile', 'realtime/werkzeug/orte', 'img/welt'):
        for n in sorted(os.listdir(os.path.join(WURZEL, ordner))):
            p = ordner + '/' + n
            if n.lower().endswith(('.webp', '.png')) and p not in bekannt and ordner != 'img/welt':
                lose.append(p)
    fehler = 0
    for titel, liste in (('Gelände', gel), ('Objekte', obj)):
        print(titel)
        for d, (muss, soll, w) in liste:
            print(f'  {"✗" if muss else "!" if soll else "✓"} {d["id"]}')
            for m in muss: print('      MUSS: ' + m)
            for s in soll: print('      Hinweis: ' + s)
            fehler += len(muss)
    fehlt = [b['bild'] for b, m in bestand if m is None]
    print(f'Bestand: {len(bestand)} eingeordnet ({sum(1 for b, _ in bestand if b["nutzbar"] == "ja")} nutzbar, {sum(1 for b, _ in bestand if b["nutzbar"] == "bedingt")} bedingt), {len(rest)} Figuren und Übriges')
    for p in fehlt: print('  ✗ eingeordnetes Bild fehlt: ' + p)
    for p in lose: print('  ! noch nicht eingeordnet: ' + p)
    fehler += len(fehlt)
    if '--ohne-seite' not in sys.argv:
        seite(gel, obj, bestand, rest)
        print('geschrieben: welt/katalog.html')
    print(f'\nKatalog: {fehler} Verstöße gegen Muss-Regeln' if fehler else '\nKatalog: keine Verstöße gegen Muss-Regeln')
    sys.exit(1 if fehler else 0)

if __name__ == '__main__':
    main()
