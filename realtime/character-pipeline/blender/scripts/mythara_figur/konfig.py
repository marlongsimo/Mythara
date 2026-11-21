"""Konfiguration lesen. Alle Pfade in den JSON-Dateien sind relativ zum Ordner character-pipeline/."""
import json, os
WURZEL = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
def pfad(p): return p if os.path.isabs(p) else os.path.join(WURZEL, p)
def lade(p):
    with open(pfad(p), encoding='utf-8') as f: return json.load(f)
def render(): return lade('configs/render.json')
def slots(): return lade('configs/slots.json')
def skelett(i): return lade(f'configs/skelette/{i}.json')
def bibliothek(i): return lade(f'configs/animationen/{i}.json')
def figur(i): return lade(f'configs/figuren/{i}.json')
def gegenstand(i): return lade(f'configs/ausruestung/{i}.json')
def alle_gegenstaende():
    d = pfad('configs/ausruestung'); return [json.load(open(os.path.join(d, f), encoding='utf-8')) for f in sorted(os.listdir(d)) if f.endswith('.json')]
