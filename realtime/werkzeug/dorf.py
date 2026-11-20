"""Mythara Echtzeit – die Stadt: Grundriss festlegen, Wege und Wiesen malen, Bäume verteilen.

Schreibt img/echtzeit/dorf-boden.webp (Wiese mit gepflasterten Wegen und Platz, bei Tageslicht; aus den beiden Bodenkacheln in diesem Ordner zurückgerechnet)
und client/src/dorf.json (Größe, Gebäude, Bäume). Aufruf im Ordner realtime: python3 werkzeug/dorf.py

Felder: x läuft am Bildschirm nach rechts unten, y nach links unten. Gebäude, deren Vorderseite nach rechts unten zeigt, stehen deshalb am Rand mit kleinem x.
"""
import json, os
import numpy as np
from PIL import Image
from scipy import ndimage

HIER = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HIER, "..", ".."); KW, KHOCH = 64, 32
DB, DH, M = 58, 50, 4  # begehbare Fläche und der Wiesenrand darum (nur Kulisse)
# r: Grundriss [x, y, breite, tiefe] · tuer: Punkt vor dem Eingang · tat: was dort passiert · bild/breite/anker: gemaltes Bild, Breite am Bildschirm, wo im Bild die vordere Sockelecke liegt
B = lambda id, name, r, tuer, tat, text, bild, breite, anker, **mehr: dict({"id": id, "name": name, "r": r, "h": 0, "wand": "", "dach": "", "tuer": tuer, "tat": tat, "text": text, "bild": "img/echtzeit/" + bild, "breite": breite, "anker": anker}, **mehr)
BAUTEN = [
    B("riss", "Der Riss", [35, 25, 2.4, 5.0], [36, 31], "riss", "In den Riss", "riss-tor.webp", 270, [0.5, 0.5], flach=True),
    B("reihe", "Handwerkergasse", [2, 4, 6, 18], [-99, -99], "kulisse", "", "hausreihe.webp", 900, [0.36, 0.985]),
    B("reihe2", "Marktgasse", [11, 1, 18, 6], [-99, -99], "kulisse", "", "hausreihe2.webp", 900, [0.64, 0.985]),
    B("tor", "Stadttor", [1, 24, 6.5, 12], [8.8, 30.5], "bald", "Stadttor – von hier geht es bald in die Kampagne", "stadttor.webp", 620, [0.585, 0.985]),
    B("halle", "Heldenhalle", [33, 0.5, 7.5, 7.5], [42, 5.5], "bald", "Heldenhalle – die Heldensammlung kommt noch", "heldenhalle.webp", 560, [0.6, 0.985]),
    B("haendler", "Händler", [30, 13, 5.2, 5.2], [36.3, 16.6], "bald", "Händler – kommt noch", "haendler.webp", 400, [0.45, 0.985]),
    B("taverne", "Taverne", [12, 27, 6.2, 6.2], [19.3, 30.8], "bald", "Taverne – kommt noch", "taverne.webp", 480, [0.465, 0.985]),
    B("brunnen", "Splitterbrunnen", [19.8, 16.8, 4.4, 4.4], [-99, -99], "kulisse", "", "brunnen.webp", 320, [0.5, 0.985]),
]
PLATZ = (22.0, 19.0, 6.4)
# Wege: Mittellinien und Breite
WEGE = [
    ([(8.8, 30.5), (15, 24.5), (22, 19)], 3.2),                     # Stadttor – Platz
    ([(9.6, 3.5), (9.6, 23), (8.8, 30.5)], 2.8),                    # vor der Handwerkergasse
    ([(9.6, 8.6), (30, 8.6)], 2.8),                                 # vor der Marktgasse
    ([(22, 8.6), (22, 19)], 3.0),                                   # Marktgasse – Platz
    ([(30, 8.6), (31.5, 10.6), (42, 10.6), (42, 5.5)], 2.6),        # zur Heldenhalle
    ([(22, 19), (28, 20), (36.3, 20), (36.3, 16.6)], 2.6),          # zum Händler
    ([(22, 19), (20, 26), (19.3, 30.8)], 2.6),                      # zur Taverne
    ([(22, 19), (29, 24), (33.6, 27.5)], 2.6),                      # zum Riss
    ([(19.3, 30.8), (24, 36), (33, 36.5), (40.5, 32), (38.6, 27.5), (36.3, 20)], 1.9),  # Rundweg durch die Wiesen
    ([(42, 10.6), (43.5, 18), (40.5, 32)], 1.7),                    # Pfad am Ostrand
    ([(24, 36), (27, 44), (39, 46.5), (51, 40), (53.5, 26), (43.5, 18)], 1.8),  # großer Rundweg durch den Hain
    ([(42, 5.5), (50, 7), (53.5, 26)], 1.6),                        # Pfad hinter der Heldenhalle
    ([(8.8, 30.5), (9.5, 41), (27, 44)], 1.7),                      # Pfad an der Stadtmauer
]
START = {"x": 21.0, "y": 25.5}


def abst_weg(x, y):
    """Abstand zum nächsten Wegrand (negativ = auf dem Pflaster)"""
    d = np.hypot(x - PLATZ[0], y - PLATZ[1]) - PLATZ[2]
    for punkte, breit in WEGE:
        for (ax, ay), (bx, by) in zip(punkte, punkte[1:]):
            l2 = (bx - ax) ** 2 + (by - ay) ** 2; t = np.clip(((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / l2, 0, 1); d = np.minimum(d, np.hypot(x - ax - t * (bx - ax), y - ay - t * (by - ay)) - breit / 2)
    return d


def flach(pfad, oben, rechts, links, n=512, rand=0.07):
    """Eine schräg gemalte Bodenkachel in eine flache Textur zurückrechnen (oben, rechts, links: Ecken der Oberseite im Bild)"""
    a = np.asarray(Image.open(pfad).convert("RGB")).astype(np.float32) / 255.0; v, u = np.mgrid[0:n, 0:n].astype(np.float32); u = rand + (1 - 2 * rand) * u / (n - 1); v = rand + (1 - 2 * rand) * v / (n - 1)
    x = oben[0] + u * (rechts[0] - oben[0]) + v * (links[0] - oben[0]); y = oben[1] + u * (rechts[1] - oben[1]) + v * (links[1] - oben[1]); return a[np.clip(y.astype(int), 0, a.shape[0] - 1), np.clip(x.astype(int), 0, a.shape[1] - 1)]


def kacheln(t, wx, wy, je):
    n = t.shape[0]; u = np.mod(wx / je * n, 2 * n); u = np.where(u >= n, 2 * n - 1 - u, u).astype(int); v = np.mod(wy / je * n, 2 * n); v = np.where(v >= n, 2 * n - 1 - v, v).astype(int); return t[np.clip(v, 0, n - 1), np.clip(u, 0, n - 1)]


# ---------- Bäume: auf den Wiesen verteilt und dicht am Rand, nie auf Wegen oder an Gebäuden ----------
rng = np.random.default_rng(11); baeume = []
def frei(x, y):
    if abst_weg(np.float32(x + 1.1), np.float32(y + 1.1)) < 2.3: return False
    for b in BAUTEN:
        bx, by, bw, bt = b["r"]
        vor = 8.5 if b.get("flach") or b["tat"] != "kulisse" else 3.2  # vor Eingängen und dem Riss bleibt der Blick frei
        if bx - 3.5 < x + 1.1 < bx + bw + vor and by - 3.5 < y + 1.1 < by + bt + vor: return False
    return all(np.hypot(x - t[0], y - t[1]) > 3.1 for t in baeume)
for _ in range(4200):
    x, y = rng.uniform(-M + 0.5, DB + M - 3), rng.uniform(-M + 0.5, DH + M - 3); aussen = x < 0 or y < 0 or x > DB - 2.2 or y > DH - 2.2
    if (aussen or rng.random() < 0.22) and frei(x, y): tanne = rng.random() < 0.4; baeume.append((round(float(x), 1), round(float(y), 1), round(float(rng.uniform(150, 195) if tanne else rng.uniform(210, 270))), tanne))
for i, (x, y, br, tanne) in enumerate(baeume): BAUTEN.append(B("baum" + str(i), "", [x + 0.5, y + 0.5, 1.2, 1.2], [-99, -99], "kulisse", "", "tanne.webp" if tanne else "baum.webp", br, [0.5, 0.95] if tanne else [0.5, 0.93], tex="tanne" if tanne else "baum"))
print(len(baeume), "Bäume")

# ---------- Boden ----------
pflaster = flach(os.path.join(HIER, "vorlage-pflaster.png"), (775, 30), (1450, 450), (85, 450)); pflaster *= 0.56 / pflaster.mean()
wiese = flach(os.path.join(HIER, "vorlage-wiese.png"), (760, 40), (1440, 490), (85, 490)); wiese *= 0.43 / wiese.mean()
GB, GH = DB + 2 * M, DH + 2 * M; OX = (GH - M + M) * KW // 2; OX = (DH + M + M) * KW // 2 + (M - M) * 0; BREIT = (GB + GH) * KW // 2; HOCH = (GB + GH) * KHOCH // 2
OX = (DH + M) * KW // 2 + M * KW // 2; OY = M * KHOCH  # Bildpunkt (px, py) zeigt den Ort mit sx = px - OX, sy = py - OY
py, px = np.mgrid[0:HOCH, 0:BREIT].astype(np.float32); sx = px + 0.5 - OX; sy = py + 0.5 - OY; wx = sy / KHOCH + sx / KW; wy = sy / KHOCH - sx / KW
innen = (wx >= -M) & (wy >= -M) & (wx < DB + M) & (wy < DH + M); rand = np.minimum(np.minimum(wx + M, DB + M - wx), np.minimum(wy + M, DH + M - wy))
def rauschen(n, seed): return ndimage.zoom(np.random.default_rng(seed).random((n, n)).astype(np.float32), (wx.shape[0] / n, wx.shape[1] / n), order=3)[:wx.shape[0], :wx.shape[1]]
d = abst_weg(wx, wy) + (rauschen(60, 1) - 0.5) * 0.55; stein = np.clip(0.5 - d / 0.35, 0, 1)  # ausgefranste Wegränder
bild = kacheln(pflaster, wx, wy, 3.0) * stein[..., None] + kacheln(wiese, wx, wy, 5.0) * (1 - stein[..., None]) * (0.86 + 0.28 * rauschen(9, 2))[..., None]  # die Wiese ist fleckig hell und dunkel
kante = np.clip(1 - np.abs(d) / 0.5, 0, 1) * (1 - stein); bild *= (1 - 0.18 * kante)[..., None]  # dunklerer Saum am Weg
schatten = np.ones(wx.shape, dtype=np.float32)
for b in BAUTEN:  # Schlagschatten vor Gebäuden und unter Bäumen
    if b.get("flach"): continue
    x, y, bw, bh = b["r"]; baum = b["id"].startswith("baum"); weit = 2.2 if baum else 1.6
    dx = np.maximum(np.maximum(x - wx, wx - (x + bw)), 0); dy = np.maximum(np.maximum(y - wy, wy - (y + bh)), 0); schatten = np.minimum(schatten, (0.72 if baum else 0.68) + 0.3 * np.clip(np.hypot(dx, dy) / weit, 0, 1))
R = BAUTEN[0]["r"]; blau = 0.5 / (1.0 + ((wx - R[0] - R[2] / 2) ** 2 / 3.0 + (wy - R[1] - R[3] / 2) ** 2 / 9.0))  # der Riss leuchtet kühl
bild = bild * schatten[..., None] * np.stack([1.08 - 0.2 * blau, 1.0 + 0.05 * blau, 0.86 + 0.5 * blau], axis=-1)  # warmes Nachmittagslicht
gruen = (kacheln(wiese, wx, wy, 5.0)[innen].mean(axis=0) * np.array([1.08, 1.0, 0.86]) * 0.8)
alpha = np.where(innen, np.clip(rand / 2.5, 0, 1), 0).astype(np.float32)  # am Rand läuft der Boden in die Wiese dahinter aus
w2 = ndimage.gaussian_filter(wiese, (14, 14, 0), mode='wrap') * 0.8 + wiese * 0.2; w2 = np.clip(w2 * np.array([1.08, 1.0, 0.86], dtype=np.float32) * 0.92, 0, 1); Image.fromarray((np.concatenate([np.concatenate([w2, w2[:, ::-1]], 1), np.concatenate([w2[::-1], w2[::-1, ::-1]], 1)], 0) * 255).astype(np.uint8)).save(os.path.join(ROOT, 'img', 'echtzeit', 'wiese-kachel.webp'), quality=82)  # weiche, nahtlose Wiese für die Fläche hinter der Stadt (ohne erkennbares Muster)
aus = Image.fromarray((np.dstack([np.clip(bild, 0, 1), alpha]) * 255).astype(np.uint8), "RGBA")
ziel = os.path.join(ROOT, "img", "echtzeit", "dorf-boden.webp"); aus.save(ziel, quality=74, method=5)
json.dump({"DB": DB, "DH": DH, "OX": OX, "OY": OY, "gruen": "#%02x%02x%02x" % tuple(int(v * 255) for v in np.clip(gruen, 0, 1)), "bauten": BAUTEN, "brunnen": {"x": -99, "y": -99, "r": 0}, "start": START, "laternen": []},
          open(os.path.join(HIER, "..", "client", "src", "dorf.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("dorf-boden", aus.size, os.path.getsize(ziel) // 1024, "KB · dorf.json geschrieben")
