"""Automatische Vorschaubilder für repräsentative und ungewöhnliche Ausrüstungskombinationen.
Je Set ein Bild: Zeilen = 8 Richtungen, Spalten = Posen (Ruhe, Gehen, Angriff, Block) – in der Haltung, die die Waffe verlangt.
Ergebnis: export/<figur>/kombinationen/<set>.webp und uebersicht.webp (alle Sets von Südwesten)."""
import os, sys
from PIL import Image, ImageDraw
import ebenen as E

SETS = {
    'standard': None,
    'schwert_und_schild': {'head': 'test_helm_stahl', 'chest': 'test_brust_stahl', 'shoulders': 'test_schulter_stahl', 'hands': 'test_handschuhe_stahl', 'legs': 'test_beinschutz_stahl', 'feet': 'test_stiefel_schwer', 'back': 'test_umhang_rot', 'main_hand': 'test_schwert_kurz', 'off_hand': 'test_schild_rund'},
    'schatten_episch': {'head': 'test_helm_schatten', 'chest': 'test_brust_schatten', 'shoulders': 'test_schulter_schatten', 'hands': 'test_handschuhe_stahl', 'legs': 'test_beinschutz_dunkel', 'feet': 'test_stiefel_stahl', 'back': 'test_umhang_blau_lang', 'main_hand': 'test_kriegsaxt'},
    'splitter_legendaer': {'head': 'test_helm_wacht', 'chest': 'test_brust_splitter', 'shoulders': 'test_schulter_runen', 'hands': 'test_handschuhe_stahl', 'legs': 'test_beinschutz_stahl', 'feet': 'test_stiefel_stahl', 'back': 'test_umhang_blau_lang', 'main_hand': 'test_streitkolben', 'off_hand': 'test_schild_drachen'},
    'leicht': {'hair': 'test_haare_kurz', 'hands': 'test_handschuhe_leder', 'feet': 'test_stiefel_schwer', 'main_hand': 'test_axt_einhand'},
    'ungewoehnlich_nur_schild': {'hair': 'test_haare_kurz', 'off_hand': 'test_schild_drachen'},
    'ungewoehnlich_ohne_alles': {},
    'ungewoehnlich_stilmix': {'head': 'test_helm_stahl', 'chest': 'test_brust_splitter', 'shoulders': 'test_schulter_schatten', 'legs': 'test_beinschutz_stahl', 'feet': 'test_stiefel_stahl', 'back': 'test_umhang_rot', 'main_hand': 'test_kriegsaxt'},
}
POSEN = [('idle', 'Ruhe', 0.0), ('walk', 'Gehen', 0.3), ('attack', 'Angriff', 0.45), ('block', 'Block', 0.2)]

def erzeugen(fid, zelle=150):
    fig = E.lade(f'configs/figuren/{fid}.json'); R = E.lade('configs/render.json'); kat = E.items(); aus = os.path.join(E.W, 'export', fid, 'kombinationen'); os.makedirs(aus, exist_ok=True)
    ri_ids = [r['id'] for r in R['richtungen']]; tief = {}; ergebnis = {}; ueb = []
    for name, wahl in SETS.items():
        wahl = dict(fig['standardAusruestung']) if wahl is None else wahl
        f = E.ausruestung_pruefen(fig, wahl, kat)
        if f: ergebnis[name] = 'ungültig: ' + '; '.join(f); continue
        bild = Image.new('RGBA', (zelle * (len(POSEN) + 1), zelle * len(ri_ids) + 30), (36, 34, 44, 255)); d = ImageDraw.Draw(bild)
        d.text((6, 8), name.replace('_', ' ') + ' – ' + ', '.join(kat[g]['name'].replace(' (TEST ASSET)', '') for g in wahl.values() if g) + '   [TEST ASSET]', fill=(239, 232, 216))
        for j, ri in enumerate(ri_ids):
            d.text((10, 30 + j * zelle + zelle // 2), ri, fill=(217, 180, 90))
            for k, (zustand, titel, anteil) in enumerate(POSEN):
                an = E.anim_fuer(fig, wahl, zustand, kat); m = E.manifest(fid, 'koerper:rumpf'); i = int(anteil * (m['animationen'][an]['frames'] - 1))
                im = E.zusammensetzen(fid, fig, wahl, an, ri, i, tief)
                if im: bild.alpha_composite(im.resize((zelle, zelle), Image.LANCZOS), ((k + 1) * zelle, 30 + j * zelle))
                if j == 0: d.text(((k + 1) * zelle + 6, 30), f'{titel} ({an})', fill=(169, 159, 140))
            if ri == 'SW': ueb.append((name, E.zusammensetzen(fid, fig, wahl, E.anim_fuer(fig, wahl, 'idle', kat), 'SW', 0, tief)))
        bild.save(os.path.join(aus, name + '.webp'), 'WEBP', quality=88); ergebnis[name] = 'ok'
    u = Image.new('RGBA', (len(ueb) * 190, 230), (36, 34, 44, 255)); d = ImageDraw.Draw(u)
    for k, (n, im) in enumerate(ueb):
        if im: u.alpha_composite(im.resize((190, 190), Image.LANCZOS), (k * 190, 20))
        d.text((k * 190 + 6, 4), n.replace('_', ' ')[:28], fill=(239, 232, 216))
    u.save(os.path.join(aus, 'uebersicht.webp'), 'WEBP', quality=88); return ergebnis

if __name__ == '__main__': print(erzeugen(sys.argv[1]))
