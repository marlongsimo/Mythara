"""Gemeinsame Hilfen für Packen, Prüfen und Vorschau: Ebenen lesen und eine Ausrüstung zusammensetzen (wie im Spiel)."""
import json, os
from PIL import Image
W = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
def lade(p): return json.load(open(os.path.join(W, p), encoding='utf-8'))
def manifest(fid, ebene): return json.load(open(os.path.join(W, 'render', fid, ebene.replace(':', '_'), 'ebene.json')))
def bild(fid, ebene, an, ri, i): return os.path.join(W, 'render', fid, ebene.replace(':', '_'), an, ri, f'{i:03d}.png')
def items(): return {g['id']: g for g in (json.load(open(os.path.join(W, 'configs/ausruestung', f), encoding='utf-8')) for f in sorted(os.listdir(os.path.join(W, 'configs/ausruestung'))) if f.endswith('.json'))}

def ausruestung_pruefen(fig, wahl, kat=None):
    """Gültigkeit einer Ausrüstung (Slots, Zweihänder, Skelett). Zurück: Liste der Fehler."""
    kat = kat or items(); f = []; belegt = {}
    for slot, gid in wahl.items():
        if not gid: continue
        g = kat.get(gid)
        if not g: f.append(f'{slot}: unbekannter Gegenstand {gid}'); continue
        if g['slot'] != slot: f.append(f'{gid} gehört in Slot {g["slot"]}, nicht {slot}')
        if g.get('skeleton') != fig['skelett']: f.append(f'{gid}: anderes Skelett')
        for s in g.get('occupies', [g['slot']]):
            if s in belegt and belegt[s] != gid: f.append(f'Slot {s} doppelt belegt ({belegt[s]}, {gid})')
            belegt[s] = gid
    return f

def sichtbare_ebenen(fig, wahl, kat=None):
    """Welche Ebenen gezeigt werden: Körperregionen ohne die verdeckten, Gegenstände ohne verdeckte Slots (z. B. Haare unter dem Helm)."""
    kat = kat or items(); gs = [kat[g] for g in wahl.values() if g and g in kat]
    weg_r = {r for g in gs for r in g['hides'].get('regions', [])}; weg_s = {s for g in gs for s in g['hides'].get('slots', [])}
    return ['koerper:' + r for r in fig['koerper']['regionen'] if r not in weg_r], ['item:' + g['id'] for g in gs if g['slot'] not in weg_s]

def zusammensetzen(fid, fig, wahl, an, ri, i, tiefen=None):
    """Ein Bild der Figur mit Ausrüstung: Körper zuerst, dann Gegenstände nach Tiefe (weiter hinten zuerst) – genau wie im Spiel."""
    k, g = sichtbare_ebenen(fig, wahl); tiefen = tiefen or {}
    def tf(e):
        if e not in tiefen: tiefen[e] = manifest(fid, e)['tiefe']
        return tiefen[e][an][ri][i]
    g = sorted(g, key=lambda e: -tf(e)); aus = None
    for e in k + g:
        p = bild(fid, e, an, ri, i)
        if not os.path.exists(p): continue
        im = Image.open(p).convert('RGBA'); aus = im if aus is None else Image.alpha_composite(aus, im)
    return aus

def haltung(fig, wahl, kat=None):
    """Haltung (Animationssatz) aus der Waffe: stance der Haupthand, sonst der Nebenhand, sonst Standard. Zurück: {spielzustand: animation}"""
    kat = kat or items(); H = fig.get('haltungen', {}); st = None
    for slot in ('main_hand', 'off_hand'):
        g = kat.get(wahl.get(slot) or '')
        if g and g.get('stance'): st = g['stance']; break
    st = st or H.get('standard'); return {k: v for k, v in H.get(st or '', {}).items()} if isinstance(H.get(st or ''), dict) else {}

def anim_fuer(fig, wahl, zustand, kat=None): return haltung(fig, wahl, kat).get(zustand, zustand)
