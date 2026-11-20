"""Mythara Echtzeit – das Dorf: Grundriss festlegen und den Pflasterboden malen.

Schreibt img/echtzeit/dorf-boden.webp (Steinpflaster aus einer Raumkarte des Würfelspiels, mit Laternenlicht und Schatten an den Gebäuden)
und client/src/dorf.json (Größe, Gebäude, Lichter). Aufruf im Ordner realtime: python3 werkzeug/dorf.py

Die Gebäude sind vorerst Platzhalter (Kästen mit Dach). Sobald es Bilder gibt, bekommt ein Gebäude den Eintrag "bild".
"""
import json, os
import numpy as np
from PIL import Image

HIER = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HIER, "..", ".."); KW, KHOCH = 64, 32
DB, DH = 24, 18
# Grundriss [x, y, breite, tiefe], Höhe in Bildpunkten, Farben (Wand, Dach), Tür (Punkt vor dem Eingang), was dort passiert
BAUTEN = [
    {"id": "tor", "name": "Der Riss", "r": [10.7, 1.0, 2.8, 5.6], "h": 0, "wand": "", "dach": "", "tuer": [12.1, 7.6], "tat": "riss", "text": "In den Riss", "flach": True, "bild": "img/echtzeit/riss-tor.webp", "breite": 310},  # der Spalt im Boden: flach, man läuft außen herum
    {"id": "taverne", "name": "Taverne", "r": [3.6, 0, 5, 5], "h": 0, "wand": "", "dach": "", "tuer": [9.3, 3.0], "tat": "bald", "text": "Taverne – kommt noch", "bild": "img/echtzeit/taverne.webp", "breite": 335, "anker": [0.465, 0.985]},  # Bild steht mit der vorderen Ecke seines Sockels auf der vorderen Ecke des Grundrisses
    {"id": "haendler", "name": "Händler", "r": [16, 0, 5, 3], "h": 76, "wand": "#6a5632", "dach": "#8a6a2a", "tuer": [18.5, 3.9], "tat": "bald", "text": "Händler – kommt noch"},
    {"id": "kathedrale", "name": "Kathedrale", "r": [0, 4, 3.4, 6], "h": 140, "wand": "#6d6a78", "dach": "#44485e", "tuer": [4.3, 7], "tat": "bald", "text": "Kathedrale – kommt noch"},
    {"id": "arena", "name": "Arena", "r": [0, 12, 3.6, 5], "h": 96, "wand": "#6b5b4a", "dach": "#8a2f2a", "tuer": [4.5, 14.5], "tat": "arena", "text": "Zur Arena (Würfelspiel)"},
]
BRUNNEN = {"x": 12.0, "y": 11.0, "r": 1.3}
START = {"x": 12.0, "y": 14.5}
LICHTER = [[b["tuer"][0], b["tuer"][1]] for b in BAUTEN if not b.get("flach")] + [[7.5, 6.5], [16.5, 6.5], [8.5, 13], [15.5, 13], [20.5, 9.5], [12, 16]]

roh = np.asarray(Image.open(os.path.join(ROOT, "img", "welt", "halle.webp")).convert("RGB").crop((520, 300, 930, 780))).astype(np.float32) / 255.0; roh = roh * (0.40 / roh.mean()); PX = 100.0  # Steinboden aus der Hallenkarte: das Pflaster im Dorfbild ist perspektivisch gemalt und verschmiert in der Schrägansicht
OX = DH * KW // 2; BREIT = (DB + DH) * KW // 2; HOCH = (DB + DH) * KHOCH // 2; S = 2
py, px = np.mgrid[0:HOCH * S, 0:BREIT * S].astype(np.float32); sx = (px + 0.5) / S - OX; sy = (py + 0.5) / S; wx = sy / KHOCH + sx / KW; wy = sy / KHOCH - sx / KW
innen = (wx >= 0) & (wy >= 0) & (wx < DB) & (wy < DH)
h, w = roh.shape[:2]; u = np.mod(wx * PX, 2 * w); u = np.where(u >= w, 2 * w - 1 - u, u).astype(int); v = np.mod(wy * PX, 2 * h); v = np.where(v >= h, 2 * h - 1 - v, v).astype(int); bild = roh[np.clip(v, 0, h - 1), np.clip(u, 0, w - 1)]
hell = np.full(wx.shape, 0.42, dtype=np.float32); warm = np.zeros(wx.shape, dtype=np.float32)
for lx, ly in LICHTER: b = 1.0 / (1.0 + ((wx - lx) ** 2 + (wy - ly) ** 2) / 2.2) ** 1.2; hell += b; warm += b
blau = 0.7 / (1.0 + ((wx - BRUNNEN["x"]) ** 2 + (wy - BRUNNEN["y"]) ** 2) / 4.0) + 0.9 / (1.0 + ((wx - 12.1) ** 2 / 4.0 + (wy - 3.8) ** 2 / 14.0))  # der Brunnen leuchtet kühl
schatten = np.ones(wx.shape, dtype=np.float32)
for b in BAUTEN:  # dunkler vor den Gebäuden
    if b.get("flach"): continue
    x, y, bw, bh = b["r"]; dx = np.maximum(np.maximum(x - wx, wx - (x + bw)), 0); dy = np.maximum(np.maximum(y - wy, wy - (y + bh)), 0); schatten = np.minimum(schatten, 0.5 + 0.5 * np.clip(np.hypot(dx, dy) / 1.2, 0, 1))
warm = np.minimum(warm, 1.0); farbe = np.stack([1.0 + 0.22 * warm - 0.25 * blau, 1.0 + 0.02 * warm + 0.05 * blau, 1.0 - 0.30 * warm + 0.5 * blau], axis=-1) * np.array([0.9, 0.95, 1.1], dtype=np.float32)
bild = bild * (np.minimum(hell + blau * 0.5, 1.25) * schatten)[..., None] * farbe
rand = np.minimum(np.minimum(wx, DB - wx), np.minimum(wy, DH - wy)); alpha = np.where(innen, np.clip(rand / 1.2, 0, 1), 0).astype(np.float32)  # der Platz läuft am Rand ins Dunkel aus
aus = Image.fromarray((np.dstack([np.clip(bild, 0, 1), alpha]) * 255).astype(np.uint8), "RGBA").resize((BREIT, HOCH), Image.LANCZOS)
ziel = os.path.join(ROOT, "img", "echtzeit", "dorf-boden.webp"); aus.save(ziel, quality=84, method=6); print("dorf-boden", aus.size, os.path.getsize(ziel) // 1024, "KB")
json.dump({"DB": DB, "DH": DH, "OX": OX, "bauten": BAUTEN, "brunnen": BRUNNEN, "start": START, "lichter": LICHTER}, open(os.path.join(HIER, "..", "client", "src", "dorf.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("dorf.json geschrieben")
