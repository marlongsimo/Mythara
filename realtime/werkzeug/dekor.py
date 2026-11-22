"""Mythara Echtzeit – malt die Arena aus Bildern des Würfelspiels.

Aus den Raumkarten (img/welt/*.webp), der Fackel und der Siegelrune entstehen:
  img/echtzeit/boden.webp    der ganze Boden isometrisch, je Raum eigener Stein, mit Schatten an den Wänden und Fackellicht
  img/echtzeit/wand.webp     gemauerte Wandblöcke (hoch und niedrig, je vier Spielarten)
  img/echtzeit/fackel.webp   die Fackel als Bildblatt
  img/echtzeit/rune.webp     die Siegelrune als Bildblatt
  client/src/dekor.json      Maße und Fackelplätze für den Client

Aufruf (im Ordner realtime): node werkzeug/karte-json.mjs > werkzeug/.karte.json && python3 werkzeug/dekor.py
"""
import json, math, os
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

HIER = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HIER, "..", ".."); WELT = os.path.join(ROOT, "img", "welt"); ZIEL = os.path.join(ROOT, "img", "echtzeit")
K = json.load(open(os.path.join(HIER, ".karte.json"))); KB, KH = K["KB"], K["KH"]; FELS = np.array(K["FELS"], dtype=bool).reshape(KH, KB)
KW, KHOCH, WAND, NIEDRIG = 64, 32, 46, 14
fels = lambda i, j: i < 0 or j < 0 or i >= KB or j >= KH or FELS[j, i]

# ---------- Räume: welcher Stein wo liegt (Ausschnitte aus den Raumkarten, nur freie Bodenflächen) ----------
def stein(name, kasten, hell=1.0):
    im = Image.open(os.path.join(WELT, name + ".webp")).convert("RGB").crop(kasten); a = np.asarray(im).astype(np.float32) / 255.0
    return a * (hell * 0.42 / max(0.05, float(a.mean())))  # alle Böden auf dieselbe Grundhelligkeit bringen
STEINE = {"halle": stein("halle", (520, 300, 930, 780)), "gruft": stein("gruft", (610, 380, 850, 1000)), "schacht": stein("schacht", (500, 650, 1000, 1000)), "pilz": stein("schacht", (500, 650, 1000, 1000), 0.92) * np.array([0.78, 1.0, 0.7], dtype=np.float32), "siegel": stein("siegelkammer", (560, 780, 900, 930))}
RAUM = [((1, 1, 7, 6), "halle"), ((8, 3, 3, 2), "halle"), ((11, 1, 8, 7), "schacht"), ((14, 8, 2, 3), "schacht"), ((10, 11, 10, 7), "pilz"), ((20, 13, 3, 2), "gruft"), ((23, 10, 9, 8), "gruft"), ((26, 7, 2, 3), "gruft"), ((21, 1, 11, 6), "siegel")]
PX = 100.0  # so viele Bildpunkte der Vorlage entsprechen einem Feld

# ---------- Fackeln: an Wänden, deren Vorderseite man sieht, mit Abstand zueinander ----------
fackeln = []
for j in range(KH):
    for i in range(KB):
        if not fels(i, j): continue
        for seite, (di, dj) in (("l", (0, 1)), ("r", (1, 0))):  # l: Wandfläche zeigt nach +y (links unten im Bild), r: nach +x
            if fels(i + di, j + dj): continue
            ort = (i + 0.5, j + 1.0) if seite == "l" else (i + 1.0, j + 0.5); licht = (i + 0.5, j + 1.45) if seite == "l" else (i + 1.45, j + 0.5)
            if (i * 7 + j * 13) % 3 != 0: continue
            if any(math.hypot(licht[0] - f["lx"], licht[1] - f["ly"]) < 3.4 for f in fackeln): continue
            fackeln.append({"x": ort[0], "y": ort[1], "lx": licht[0], "ly": licht[1], "seite": seite})
print(len(fackeln), "Fackeln")

# ---------- Licht: schwaches Grundlicht, warmes Fackellicht, dunkler an den Wänden ----------
def licht(x, y):
    """x, y: Felder (Arrays). Zurück: Helligkeit (0..1.4) und Wärme (0..1)"""
    hell = np.full(x.shape, 0.42, dtype=np.float32); warm = np.zeros(x.shape, dtype=np.float32)
    for f in fackeln:
        d2 = (x - f["lx"]) ** 2 + (y - f["ly"]) ** 2; b = 1.1 / (1.0 + d2 / 1.5) ** 1.25; hell += b; warm += b
    sx, sy = K["SIEGEL"]["x"], K["SIEGEL"]["y"]; hell += 0.35 / (1.0 + ((x - sx) ** 2 + (y - sy) ** 2) / 2.0)
    return np.minimum(hell, 1.2), np.minimum(warm, 1.0)

# ---------- Boden malen ----------
OX = KH * KW // 2; BREIT = (KB + KH) * KW // 2; HOCH = (KB + KH) * KHOCH // 2; S = 2  # doppelt so fein rechnen, dann verkleinern
py, px = np.mgrid[0:HOCH * S, 0:BREIT * S].astype(np.float32); sx = (px + 0.5) / S - OX; sy = (py + 0.5) / S
wx = sy / KHOCH + sx / KW; wy = sy / KHOCH - sx / KW; ti = np.floor(wx).astype(int); tj = np.floor(wy).astype(int)
innen = (ti >= 0) & (tj >= 0) & (ti < KB) & (tj < KH); frei = np.zeros(wx.shape, dtype=bool); frei[innen] = ~FELS[tj[innen], ti[innen]]
bild = np.zeros(wx.shape + (3,), dtype=np.float32)
def muster(t, u, v):  # Vorlage spiegelnd wiederholen: so entstehen keine Nähte
    h, w = t.shape[:2]; a = np.mod(u, 2 * w); a = np.where(a >= w, 2 * w - 1 - a, a).astype(int); b = np.mod(v, 2 * h); b = np.where(b >= h, 2 * h - 1 - b, b).astype(int); return t[np.clip(b, 0, h - 1), np.clip(a, 0, w - 1)]
for (x0, y0, w, h), name in RAUM:
    m = frei & (wx >= x0) & (wx < x0 + w) & (wy >= y0) & (wy < y0 + h); bild[m] = muster(STEINE[name], (wx[m] - x0) * PX, (wy[m] - y0) * PX)
# Fugen zwischen den Feldern, ganz leicht
fx = np.abs(wx - np.round(wx)); fy = np.abs(wy - np.round(wy)); fuge = np.clip(1.0 - np.minimum(fx, fy) / 0.035, 0, 1); bild *= (1.0 - 0.22 * fuge)[..., None]
# Schatten an den Wänden: Abstand zur nächsten Felskante
nah = np.full(wx.shape, 9.0, dtype=np.float32); bx = wx - ti; by = wy - tj
for di in (-1, 0, 1):
    for dj in (-1, 0, 1):
        if not di and not dj: continue
        ni = np.clip(ti + di, 0, KB - 1); nj = np.clip(tj + dj, 0, KH - 1); istFels = FELS[nj, ni] | (ti + di < 0) | (tj + dj < 0) | (ti + di >= KB) | (tj + dj >= KH)
        dx = np.where(di < 0, bx, np.where(di > 0, 1 - bx, 0.0)); dy = np.where(dj < 0, by, np.where(dj > 0, 1 - by, 0.0)); nah = np.where(istFels, np.minimum(nah, np.hypot(dx, dy)), nah)
schatten = 0.45 + 0.55 * np.clip(nah / 0.75, 0, 1) ** 0.8
hell, warm = licht(wx, wy); farbe = np.stack([1.0 + 0.22 * warm, 1.0 + 0.02 * warm, 1.0 - 0.30 * warm], axis=-1) * np.array([0.92, 0.95, 1.08], dtype=np.float32)  # Grundton kühl, Fackellicht warm
bild = bild * (hell * schatten)[..., None] * farbe
# der Siegelkreis aus der Siegelkammer als Bodenzeichnung, mitten in der letzten Kammer
kreis = Image.open(os.path.join(WELT, "siegelkammer.webp")).convert("RGB").crop((724 - 270, 543 - 250, 724 + 270, 543 + 250)); ka = np.asarray(kreis).astype(np.float32) / 255.0; kr = 2.6; kx, ky = 26.5, 3.9
u = (wx - kx) / kr; v = (wy - ky) / kr; r = np.hypot(u, v); m = frei & (r < 1.0)
# die Vorlage ist von vorn gemalt; in der Welt liegt „oben im Bild“ in Richtung −x−y: um 45 Grad drehen
ru = (u - v) * 0.7071; rv = (u + v) * 0.7071; qa = np.clip(((ru[m] * 0.5 + 0.5) * (ka.shape[1] - 1)).astype(int), 0, ka.shape[1] - 1); qb = np.clip(((rv[m] * 0.5 + 0.5) * (ka.shape[0] - 1)).astype(int), 0, ka.shape[0] - 1)
deck = (np.clip((1.0 - r[m]) / 0.2, 0, 1) * np.clip((r[m] - 0.36) / 0.12, 0, 1))[..., None] * 0.8;  # nur der Ring, ohne den Thron in der Mitte
bild[m] = bild[m] * (1 - deck) + ka[qb, qa] * 1.25 * (hell[m] * 0.6 + 0.4)[..., None] * deck
alpha = frei.astype(np.float32)
aus = np.dstack([np.clip(bild, 0, 1), alpha]); gross = Image.fromarray((aus * 255).astype(np.uint8), "RGBA").resize((BREIT, HOCH), Image.LANCZOS)
os.makedirs(ZIEL, exist_ok=True); gross.save(os.path.join(ZIEL, "boden.webp"), quality=86, method=6); print("boden", gross.size, os.path.getsize(os.path.join(ZIEL, "boden.webp")) // 1024, "KB")

# ---------- Wandblöcke: Mauerwerk aus dem Stein der Gruft ----------
roh = np.asarray(Image.open(os.path.join(WELT, "gruft.webp")).convert("RGB").crop((610, 380, 850, 1000))).astype(np.float32) / 255.0; roh = roh * (0.40 / roh.mean())
def mauer(seed):
    """Eine Fläche 64 x 64 mit Steinquadern (Fugen dunkel, Kanten leicht hell)"""
    rng = np.random.default_rng(seed); o = rng.integers(0, roh.shape[0] - 64); p = rng.integers(0, roh.shape[1] - 64); t = roh[o:o + 64, p:p + 64].copy(); zeile = 11
    for r in range(0, 64, zeile):
        t[r:r + 1] *= 0.45; t[r + 1:r + 2] *= 1.18; versatz = (r // zeile % 2) * 10 + rng.integers(0, 4)
        for c in range(int(versatz), 64, 20): t[r:r + zeile, c:c + 1] *= 0.5
        t[r:r + zeile] *= rng.uniform(0.88, 1.1)
    return np.clip(t, 0, 1)
def block(hoehe, seed):
    w, h = KW, KHOCH + hoehe; a = np.zeros((h * 3, w * 3, 4), dtype=np.float32); yy, xx = np.mgrid[0:h * 3, 0:w * 3].astype(np.float32); x = (xx + 0.5) / 3; y = (yy + 0.5) / 3; m = mauer(seed); m2 = mauer(seed + 50); deckel = mauer(seed + 99)
    # Deckel (Raute oben)
    cx, cy = w / 2, KHOCH / 2; d = np.abs(x - cx) / (w / 2) + np.abs(y - cy) / (KHOCH / 2); oben = d <= 1.0
    u = ((x - cx) / KW + (y - cy) / KHOCH + 0.5) * 63; v = ((y - cy) / KHOCH - (x - cx) / KW + 0.5) * 63; a[oben, :3] = deckel[np.clip(v[oben].astype(int), 0, 63), np.clip(u[oben].astype(int), 0, 63)] * 0.62; a[oben, 3] = 1
    kante = oben & (d > 0.9); a[kante, :3] *= 1.35
    # linke Fläche (zeigt nach +y): x 0..32, obere Kante von (0,16) nach (32,32)
    yo = KHOCH / 2 + x * (KHOCH / 2) / (w / 2); links = (x < w / 2) & (y >= yo) & (y <= yo + hoehe) & ~oben
    a[links, :3] = m[np.clip(((y - yo)[links] * 63 / max(hoehe, 1)).astype(int) % 64 if hoehe < 30 else ((y - yo)[links]).astype(int) % 64, 0, 63), np.clip((x[links] * 2).astype(int), 0, 63)] * 0.95; a[links, 3] = 1
    # rechte Fläche (zeigt nach +x): obere Kante von (32,32) nach (64,16)
    yr = KHOCH - (x - w / 2) * (KHOCH / 2) / (w / 2); rechts = (x >= w / 2) & (y >= yr) & (y <= yr + hoehe) & ~oben
    a[rechts, :3] = m2[np.clip(((y - yr)[rechts] * 63 / max(hoehe, 1)).astype(int) % 64 if hoehe < 30 else ((y - yr)[rechts]).astype(int) % 64, 0, 63), np.clip(((x[rechts] - w / 2) * 2).astype(int), 0, 63)] * 0.6; a[rechts, 3] = 1
    # unten dunkler (Schmutz am Sockel), oben an der Kante heller
    for fl, y0 in ((links, yo), (rechts, yr)): t = np.clip((y - y0) / max(hoehe, 1), 0, 1); a[fl, :3] *= (1.08 - 0.45 * t[fl] ** 1.5)[..., None]
    return Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8), "RGBA").resize((w, h), Image.LANCZOS)
N = 4; blatt = Image.new("RGBA", (KW * N, (KHOCH + WAND) * 2), (0, 0, 0, 0))
for n in range(N): blatt.paste(block(WAND, 10 + n), (n * KW, 0)); blatt.paste(block(NIEDRIG, 30 + n), (n * KW, KHOCH + WAND + (WAND - NIEDRIG)))  # niedrige Blöcke unten bündig im selben Rahmen
blatt.save(os.path.join(ZIEL, "wand.webp"), quality=92, method=6); print("wand", blatt.size)

# ---------- Fackel und Rune als Bildblätter ----------
def blattAus(gif, breite, hoehe, ziel, n=9):
    g = Image.open(gif); b = Image.new("RGBA", (breite * n, hoehe), (0, 0, 0, 0))
    for k in range(n): g.seek(k % g.n_frames); b.paste(g.convert("RGBA").resize((breite, hoehe), Image.LANCZOS), (k * breite, 0))
    b.save(ziel, quality=90, method=6); print(os.path.basename(ziel), b.size)
blattAus(os.path.join(ROOT, "img", "mythara", "fackel.gif"), 26, 78, os.path.join(ZIEL, "fackel.webp"))
blattAus(os.path.join(ROOT, "img", "riss", "siegel-rune.gif"), 160, 160, os.path.join(ZIEL, "rune.webp"))

# Helligkeit je Wandfeld (für die Tönung der Blöcke im Client)
wandlicht = {}
for j in range(-1, KH + 1):
    for i in range(-1, KB + 1):
        if fels(i, j): h, w = licht(np.array([i + 0.5 + 0.4]), np.array([j + 0.5 + 0.4])); wandlicht[f"{i},{j}"] = [round(float(h[0]), 2), round(float(w[0]), 2)]
json.dump({"KW": KW, "KHOCH": KHOCH, "WAND": WAND, "NIEDRIG": NIEDRIG, "OX": OX, "BREIT": BREIT, "HOCH": HOCH, "SPIELARTEN": N, "fackeln": [{"x": f["x"], "y": f["y"], "seite": f["seite"]} for f in fackeln], "wandlicht": wandlicht}, open(os.path.join(HIER, "..", "client", "src", "dekor.json"), "w"), separators=(",", ":"))
print("dekor.json geschrieben")
