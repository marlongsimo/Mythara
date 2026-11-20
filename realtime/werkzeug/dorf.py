"""Mythara Echtzeit – das Dorf: Grundriss festlegen und den Boden malen.

Schreibt img/echtzeit/dorf-boden.webp (Pflaster auf dem Platz, Wiese am Rand – aus den beiden Bodenkacheln in diesem Ordner zurückgerechnet,
mit Laternenlicht und Schatten an den Gebäuden) und client/src/dorf.json (Größe, Gebäude, Laternen). Aufruf im Ordner realtime: python3 werkzeug/dorf.py

Gebäude mit "bild" sind gemalt (freigestellt mit werkzeug/bau.py), die anderen sind Platzhalter (Kästen mit Dach).
"""
import json, os
import numpy as np
from PIL import Image
from scipy import ndimage

HIER = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HIER, "..", ".."); KW, KHOCH = 64, 32
DB, DH = 32, 26
# r: Grundriss [x, y, breite, tiefe] · tuer: Punkt vor dem Eingang · tat: was dort passiert · bild/breite/anker: gemaltes Bild, Breite am Bildschirm, wo im Bild die vordere Sockelecke liegt
BAUTEN = [
    {"id": "riss", "name": "Der Riss", "r": [21.1, 1.7, 2.0, 4.2], "h": 0, "wand": "", "dach": "", "tuer": [22.1, 6.6], "tat": "riss", "text": "In den Riss", "flach": True, "bild": "img/echtzeit/riss-tor.webp", "breite": 230},
    {"id": "halle", "name": "Heldenhalle", "r": [5.5, 0, 5.6, 5.6], "h": 0, "wand": "", "dach": "", "tuer": [12.0, 3.4], "tat": "bald", "text": "Heldenhalle – kommt noch", "bild": "img/echtzeit/heldenhalle.webp", "breite": 380, "anker": [0.6, 0.985]},
    {"id": "taverne", "name": "Taverne", "r": [13.6, 0, 5, 5], "h": 0, "wand": "", "dach": "", "tuer": [19.3, 3.0], "tat": "bald", "text": "Taverne – kommt noch", "bild": "img/echtzeit/taverne.webp", "breite": 335, "anker": [0.465, 0.985]},
    {"id": "haendler", "name": "Händler", "r": [25.5, 0.5, 4.4, 4.4], "h": 0, "wand": "", "dach": "", "tuer": [30.6, 3.0], "tat": "bald", "text": "Händler – kommt noch", "bild": "img/echtzeit/haendler.webp", "breite": 300, "anker": [0.45, 0.985]},
    {"id": "reihe", "name": "Häuserreihe", "r": [0, 4.5, 3.4, 10.5], "h": 0, "wand": "", "dach": "", "tuer": [-9, -9], "tat": "kulisse", "text": "", "bild": "img/echtzeit/hausreihe.webp", "breite": 520, "anker": [0.43, 0.985]},  # nur Kulisse
    {"id": "tor", "name": "Stadttor", "r": [0, 15.5, 3.6, 6.6], "h": 0, "wand": "", "dach": "", "tuer": [4.6, 18.8], "tat": "bald", "text": "Stadttor – hier geht es bald zur Kampagne", "bild": "img/echtzeit/stadttor.webp", "breite": 400, "anker": [0.585, 0.985]},
    {"id": "brunnen", "name": "Splitterbrunnen", "r": [15.3, 12.3, 3.4, 3.4], "h": 0, "wand": "", "dach": "", "tuer": [-9, -9], "tat": "kulisse", "text": "", "bild": "img/echtzeit/brunnen.webp", "breite": 250, "anker": [0.5, 0.985]},
    {"id": "arena", "name": "Arena", "r": [0, 22.3, 3.6, 3.4], "h": 96, "wand": "#6b5b4a", "dach": "#8a2f2a", "tuer": [4.5, 24.0], "tat": "arena", "text": "Zur Arena (Würfelspiel)"},
]
BRUNNEN = {"x": -50, "y": -50, "r": 0}  # der gezeichnete Brunnen ist dem gemalten gewichen
BLAU = [17.0, 14.0]
START = {"x": 17.0, "y": 19.0}
LATERNEN = [[11.5, 9], [23.5, 9], [12, 18], [22, 18], [27.5, 13], [7, 21], [16, 23]]
LICHTER = [[b["tuer"][0], b["tuer"][1]] for b in BAUTEN if not b.get("flach") and b["tat"] != "kulisse"] + LATERNEN + [[4.5, 7], [4.5, 12]]
WIESE = 2.4  # so breit ist der Wiesenrand


def flach(pfad, oben, rechts, links, n=512, rand=0.07):
    """Eine schräg gemalte Bodenkachel in eine flache Textur zurückrechnen (oben, rechts, links: Ecken der Oberseite im Bild)"""
    a = np.asarray(Image.open(pfad).convert("RGB")).astype(np.float32) / 255.0; v, u = np.mgrid[0:n, 0:n].astype(np.float32); u = rand + (1 - 2 * rand) * u / (n - 1); v = rand + (1 - 2 * rand) * v / (n - 1)
    x = oben[0] + u * (rechts[0] - oben[0]) + v * (links[0] - oben[0]); y = oben[1] + u * (rechts[1] - oben[1]) + v * (links[1] - oben[1]); return a[np.clip(y.astype(int), 0, a.shape[0] - 1), np.clip(x.astype(int), 0, a.shape[1] - 1)]


def kacheln(t, wx, wy, je):
    """Spiegelnd wiederholen, eine Kachel deckt „je“ Felder"""
    n = t.shape[0]; u = np.mod(wx / je * n, 2 * n); u = np.where(u >= n, 2 * n - 1 - u, u).astype(int); v = np.mod(wy / je * n, 2 * n); v = np.where(v >= n, 2 * n - 1 - v, v).astype(int); return t[np.clip(v, 0, n - 1), np.clip(u, 0, n - 1)]


pflaster = flach(os.path.join(HIER, "vorlage-pflaster.png"), (775, 30), (1450, 450), (85, 450)); pflaster *= 0.42 / pflaster.mean()
wiese = flach(os.path.join(HIER, "vorlage-wiese.png"), (760, 40), (1440, 490), (85, 490)); wiese *= 0.36 / wiese.mean()
OX = DH * KW // 2; BREIT = (DB + DH) * KW // 2; HOCH = (DB + DH) * KHOCH // 2; S = 2
py, px = np.mgrid[0:HOCH * S, 0:BREIT * S].astype(np.float32); sx = (px + 0.5) / S - OX; sy = (py + 0.5) / S; wx = sy / KHOCH + sx / KW; wy = sy / KHOCH - sx / KW
innen = (wx >= 0) & (wy >= 0) & (wx < DB) & (wy < DH); rand = np.minimum(np.minimum(wx, DB - wx), np.minimum(wy, DH - wy))
rng = np.random.default_rng(4); welle = ndimage.zoom(rng.random((12, 12)).astype(np.float32), (wx.shape[0] / 12, wx.shape[1] / 12), order=3)[:wx.shape[0], :wx.shape[1]]  # unregelmäßige Kante zwischen Pflaster und Wiese
gras = np.clip((WIESE + (welle - 0.5) * 1.6 - rand) / 0.5, 0, 1)
for b in BAUTEN:  # vor Tor und Türen liegt Pflaster, auch am Rand
    if b["tat"] == "kulisse": continue
    tx, ty = b["tuer"]; gras *= np.clip((np.hypot(wx - tx, wy - ty) - 2.2) / 1.0, 0, 1)
bild = kacheln(pflaster, wx, wy, 3.0) * (1 - gras[..., None]) + kacheln(wiese, wx, wy, 5.0) * gras[..., None]
hell = np.full(wx.shape, 0.5, dtype=np.float32); warm = np.zeros(wx.shape, dtype=np.float32)
for lx, ly in LICHTER: b = 1.0 / (1.0 + ((wx - lx) ** 2 + (wy - ly) ** 2) / 2.2) ** 1.2; hell += b; warm += b
R = next(b for b in BAUTEN if b["id"] == "riss")["r"]; rx, ry = R[0] + R[2] / 2, R[1] + R[3] / 2
blau = 0.7 / (1.0 + ((wx - BLAU[0]) ** 2 + (wy - BLAU[1]) ** 2) / 4.0) + 0.9 / (1.0 + ((wx - rx) ** 2 / 3.0 + (wy - ry) ** 2 / 9.0))  # Brunnen und Riss leuchten kühl
schatten = np.ones(wx.shape, dtype=np.float32)
for b in BAUTEN:  # dunkler vor den Gebäuden
    if b.get("flach"): continue
    x, y, bw, bh = b["r"]; dx = np.maximum(np.maximum(x - wx, wx - (x + bw)), 0); dy = np.maximum(np.maximum(y - wy, wy - (y + bh)), 0); schatten = np.minimum(schatten, 0.55 + 0.45 * np.clip(np.hypot(dx, dy) / 1.2, 0, 1))
warm = np.minimum(warm, 1.0); farbe = np.stack([1.0 + 0.2 * warm - 0.25 * blau, 1.0 + 0.02 * warm + 0.05 * blau, 1.0 - 0.28 * warm + 0.5 * blau], axis=-1) * np.array([0.9, 0.95, 1.1], dtype=np.float32)
bild = bild * (np.minimum(hell + blau * 0.5, 1.3) * schatten)[..., None] * farbe
alpha = np.where(innen, np.clip(rand / 1.2, 0, 1), 0).astype(np.float32)  # der Platz läuft am Rand ins Dunkel aus
aus = Image.fromarray((np.dstack([np.clip(bild, 0, 1), alpha]) * 255).astype(np.uint8), "RGBA").resize((BREIT, HOCH), Image.LANCZOS)
ziel = os.path.join(ROOT, "img", "echtzeit", "dorf-boden.webp"); aus.save(ziel, quality=84, method=6)
json.dump({"DB": DB, "DH": DH, "OX": OX, "bauten": BAUTEN, "brunnen": BRUNNEN, "start": START, "laternen": LATERNEN}, open(os.path.join(HIER, "..", "client", "src", "dorf.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("dorf-boden", aus.size, os.path.getsize(ziel) // 1024, "KB · dorf.json geschrieben")
