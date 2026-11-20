#!/usr/bin/env python3
"""Mythara Figuren-Pipeline – ein Befehl für alles: rendern (Blender, parallel) → packen (Atlanten, Metadaten) → prüfen (Bericht).
Beispiele:
  python3 tools/produzieren.py krieger_test                     # alles, was sich geändert hat
  python3 tools/produzieren.py krieger_test --nur item:test_helm_stahl   # nur ein neues Teil
  python3 tools/produzieren.py krieger_test --neu               # alles neu rendern
  python3 tools/produzieren.py krieger_test --schnell           # nur Süd und Nordost, nur idle/walk (Entwicklung)
Ein neues Ausrüstungsteil: Modell nach blender/equipment/, JSON nach configs/ausruestung/ – mehr ist nicht nötig. Es wird automatisch erkannt,
für alle Animationen und Richtungen gerendert, gepackt und geprüft. Unveränderte Ebenen werden aus dem Zwischenspeicher (render/) übernommen."""
import argparse, hashlib, json, os, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor
W = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); sys.path.insert(0, os.path.join(W, 'tools'))
lade = lambda p: json.load(open(os.path.join(W, p), encoding='utf-8'))

def ebenen(fig, nur=None):
    items = [json.load(open(os.path.join(W, 'configs/ausruestung', f), encoding='utf-8')) for f in sorted(os.listdir(os.path.join(W, 'configs/ausruestung'))) if f.endswith('.json')]
    alle = ['koerper:' + r for r in fig['koerper']['regionen']] + ['item:' + g['id'] for g in items if g.get('skeleton') == fig['skelett']]
    return [e for e in alle if not nur or e in nur]

def fingerabdruck(fig, ebene):
    """Alles, wovon das Rendering einer Ebene abhängt. Ändert sich nichts davon, wird nicht neu gerendert."""
    h = hashlib.sha1(); dat = lambda p: h.update(open(os.path.join(W, p), 'rb').read())
    for p in ['configs/render.json', 'configs/materialien.json', f'configs/skelette/{fig["skelett"]}.json', f'configs/animationen/{fig["animationen"]["bibliothek"]}.json', fig['koerper']['datei']]: dat(p)
    h.update(json.dumps([fig['koerper'], fig['animationen'], fig['skelett']], sort_keys=True).encode())
    lib = lade(f'configs/animationen/{fig["animationen"]["bibliothek"]}.json')
    for d in sorted(set(lib['clips'][a]['datei'] for a in fig['animationen']['liste'] if a in lib['clips'])): dat(lib['dateien'][d])
    for f in sorted(os.listdir(os.path.join(W, 'blender/scripts/mythara_figur'))):
        if f.endswith('.py'): dat('blender/scripts/mythara_figur/' + f)
    dat('blender/scripts/render_ebene.py')
    if ebene.startswith('item:'):
        g = lade(f'configs/ausruestung/{ebene[5:]}.json'); h.update(json.dumps(g, sort_keys=True).encode()); dat(g['model']['file'])
    h.update(ebene.encode()); return h.hexdigest()[:16]

def rendern(fid, fig, liste, neu, extra, jobs):
    def eine(e):
        fp = fingerabdruck(fig, e); man = os.path.join(W, 'render', fid, e.replace(':', '_'), 'ebene.json')
        fp = fingerabdruck(fig, e) + ('-teil' if extra else '')  # Teil-Läufe (--schnell) gelten nie als vollständig
        if not neu and os.path.exists(man):
            m = json.load(open(man)); R = lade('configs/render.json')
            vollstaendig = extra or (set(fig['animationen']['liste']) <= set(m.get('animationen', {})) and len(m.get('richtungen', [])) == len(R['richtungen']))
            if m.get('hash') == fp and vollstaendig: return (e, 'zwischengespeichert', 0)
        t = time.time(); cmd = ['blender', '-b', '--python', os.path.join(W, 'blender/scripts/render_ebene.py'), '--', fid, e, 'hash=' + fp] + extra
        r = subprocess.run(cmd, cwd=W, capture_output=True, text=True)
        if 'EBENE FERTIG' not in r.stdout: return (e, 'FEHLER\n' + (r.stdout[-1500:] + r.stderr[-1500:]), time.time() - t)
        m = json.load(open(man)); m['hash'] = fp; json.dump(m, open(man, 'w'), indent=1); return (e, f'{m["bilder"]} Bilder', time.time() - t)
    with ThreadPoolExecutor(jobs) as ex: return list(ex.map(eine, liste))

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('figur'); ap.add_argument('--nur', nargs='*'); ap.add_argument('--neu', action='store_true')
    ap.add_argument('--schnell', action='store_true'); ap.add_argument('--jobs', type=int, default=os.cpu_count() or 2); ap.add_argument('--ohne-render', action='store_true'); ap.add_argument('--nur-rendern', action='store_true')
    a = ap.parse_args(); fig = lade(f'configs/figuren/{a.figur}.json'); liste = ebenen(fig, a.nur)
    extra = ['anims=idle,walk', 'richtungen=S,NO'] if a.schnell else []
    print(f'Figur {a.figur}: {len(liste)} Ebenen' + (' (schnell)' if a.schnell else '')); t0 = time.time(); fehler = 0
    if not a.ohne_render:
        for e, stand, sek in rendern(a.figur, fig, liste, a.neu, extra, a.jobs):
            print(f'  {e:34s} {stand}' + (f'  ({sek:.0f} s)' if sek else '')); fehler += stand.startswith('FEHLER')
    if a.nur_rendern: print(f'Gerendert in {time.time() - t0:.0f} s'); sys.exit(1 if fehler else 0)
    import packen, pruefen, kombinationen
    exp = packen.packen(a.figur); print(f'Gepackt: {exp["ebenen"]} Ebenen, {exp["seiten"]} Atlasseiten, {exp["kb"]} KB → {exp["ziel"]}')
    ko = kombinationen.erzeugen(a.figur); print('Kombinationsbilder:', ', '.join(f'{k} {v}' for k, v in ko.items()))
    ber = pruefen.pruefen(a.figur); print(f'Prüfung: {ber["ok"]} bestanden, {ber["fehler"]} Fehler, {ber["warnungen"]} Warnungen → {ber["datei"]}')
    print(f'Fertig in {time.time() - t0:.0f} s'); sys.exit(1 if fehler or ber['fehler'] else 0)
