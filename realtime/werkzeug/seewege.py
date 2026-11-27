#!/usr/bin/env python3
"""
Riftmere – Seewege der Schiffslinien (Ausgabe 2): aus dem Gehraster der gebauten Welt (echtzeit/welt/*_*.json, „~“ = Wasser)
je zwei Häfen (shared/haefen.json) den Weg übers Wasser suchen und als wenige Wegpunkte nach shared/seewege.json schreiben.
Gitter in Zellen zu Z × Z Feldern (eine Zelle ist Wasser, wenn alle ihre Felder Wasser sind); Ufernähe kostet mehr, damit das Schiff (4 m breit)
nicht am Strand schrammt. Danach wird der Weg geglättet (gerade Stücke, solange die Linie über Wasser mit Abstand bleibt).
Dazu je Hafen: Region (aus dem Chunk des Kapitäns) und die Ankunft (freies Feld nahe beim Kapitän).
Aufruf (im Ordner realtime, nach dem Bau der Welt): python3 werkzeug/seewege.py
"""
import glob, heapq, json, math, os, re, sys
import numpy as np

HIER = os.path.dirname(os.path.abspath(__file__)); RT = os.path.dirname(HIER); WELT = os.path.join(RT, "..", "echtzeit", "welt")
C = 32; Z = 4; ABSTAND = 3  # Zellen bis zum Ufer, ab dem es nichts extra kostet
H = json.load(open(os.path.join(RT, "shared", "haefen.json")))["haefen"]

chunks = {}
for f in glob.glob(os.path.join(WELT, "*_*.json")):
    m = re.match(r"(\d+)_(\d+)\.json$", os.path.basename(f))
    if m: chunks[(int(m[1]), int(m[2]))] = f
cx0 = min(k[0] for k in chunks); cy0 = min(k[1] for k in chunks); cx1 = max(k[0] for k in chunks); cy1 = max(k[1] for k in chunks)
W = (cx1 - cx0 + 1) * C; Hh = (cy1 - cy0 + 1) * C; X0 = cx0 * C; Y0 = cy0 * C
wasser = np.zeros((Hh, W), dtype=bool); geh = np.zeros((Hh, W), dtype=bool); region = {}
for (cx, cy), f in chunks.items():
    d = json.load(open(f)); region[(cx, cy)] = d.get("region", "")
    g = d.get("geh") or []
    for j, zeile in enumerate(g[:C]):
        for i, ch in enumerate(zeile[:C]):
            y = (cy - cy0) * C + j; x = (cx - cx0) * C + i
            if ch == "~": wasser[y, x] = True
            elif ch != "#": geh[y, x] = True
gw = wasser[: Hh // Z * Z, : W // Z * Z].reshape(Hh // Z, Z, W // Z, Z).all(axis=(1, 3)); GH, GW = gw.shape
# Abstand zum Ufer (Zellen), BFS
ufer = np.full(gw.shape, 99, dtype=np.int16); q = []
ys, xs = np.nonzero(~gw); ufer[ys, xs] = 0; front = list(zip(ys.tolist(), xs.tolist()))
for k in range(1, ABSTAND + 2):
    neu = []
    for y, x in front:
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            a, b = y + dy, x + dx
            if 0 <= a < GH and 0 <= b < GW and ufer[a, b] == 99: ufer[a, b] = k; neu.append((a, b))
    front = neu

def zelle(px, py): return int((py - Y0) // Z), int((px - X0) // Z)
def mitte(c): return (X0 + (c[1] + 0.5) * Z, Y0 + (c[0] + 0.5) * Z)
def naechstWasser(px, py, r=10):
    y0, x0 = zelle(px, py); best = None
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            a, b = y0 + dy, x0 + dx
            if 0 <= a < GH and 0 <= b < GW and gw[a, b]:
                d = math.hypot(dy, dx) - 0.3 * min(ufer[a, b], 3)
                if best is None or d < best[0]: best = (d, (a, b))
    return best and best[1]
def weg(s, z):
    INF = 1e18; dist = {s: 0.0}; vor = {}; h = [(0.0, s)]; zx = z
    while h:
        f, c = heapq.heappop(h); g = dist[c]
        if c == zx: break
        if f - math.hypot(c[0] - zx[0], c[1] - zx[1]) > g + 1e-9: continue
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if not dy and not dx: continue
                a, b = c[0] + dy, c[1] + dx
                if not (0 <= a < GH and 0 <= b < GW) or not gw[a, b]: continue
                if dy and dx and not (gw[c[0] + dy, c[1]] and gw[c[0], c[1] + dx]): continue
                k = math.hypot(dy, dx) * (1 + 2.5 * max(0, ABSTAND - ufer[a, b]))
                ng = g + k
                if ng < dist.get((a, b), INF): dist[(a, b)] = ng; vor[(a, b)] = c; heapq.heappush(h, (ng + math.hypot(a - zx[0], b - zx[1]), (a, b)))
    if zx not in dist: return None
    p = [zx]
    while p[-1] != s: p.append(vor[p[-1]])
    return p[::-1]
def frei(a, b, min_ufer):
    n = int(max(abs(a[0] - b[0]), abs(a[1] - b[1])) * 2) + 1
    for t in range(n + 1):
        y = a[0] + (b[0] - a[0]) * t / n; x = a[1] + (b[1] - a[1]) * t / n; yi, xi = int(round(y)), int(round(x))
        if not gw[yi, xi] or ufer[yi, xi] < min(min_ufer, ufer[a], ufer[b]): return False
    return True
def glatt(p):
    out = [p[0]]; i = 0
    while i < len(p) - 1:
        j = len(p) - 1
        while j > i + 1 and not frei(p[i], p[j], 2): j -= 1
        out.append(p[j]); i = j
    return out

haefen = {}; zellen = {}
for P in H:
    k = P["kapitaen"]; cx, cy = int(k["x"] // C), int(k["y"] // C)
    # Ankunft: freies Feld nahe beim Kapitän (zum Land hin)
    best = None
    for dy in range(-4, 5):
        for dx in range(-4, 5):
            x, y = int(k["x"]) + dx, int(k["y"]) + dy
            if geh[y - Y0, x - X0]:
                d = math.hypot(x + 0.5 - k["x"], y + 0.5 - k["y"])
                if d > 0.6 and (best is None or d < best[0]): best = (d, [x + 0.5, y + 0.5])
    s = P["schiff"]; zc = naechstWasser(s["x"], s["y"])
    haefen[P["id"]] = {"region": region.get((cx, cy), ""), "ankunft": best and best[1], "kapitaen_frei": bool(geh[int(k["y"]) - Y0, int(k["x"]) - X0]), "auf_see": zc is not None}
    zellen[P["id"]] = zc
    print(f"{P['id']:12s} Region {haefen[P['id']]['region']:12s} Ankunft {best and best[1]}  Kapitän auf festem Boden: {haefen[P['id']]['kapitaen_frei']}  Liegeplatz {mitte(zc) if zc else 'KEIN WASSER'}")
wege = {}; fehler = 0
ids = [P["id"] for P in H]
for i, a in enumerate(ids):
    for b in ids[i + 1:]:
        if not zellen[a] or not zellen[b]: print(f"  ✗ {a} – {b}: kein Liegeplatz im Wasser"); fehler += 1; continue
        p = weg(zellen[a], zellen[b])
        if not p: print(f"  ✗ {a} – {b}: kein Seeweg"); fehler += 1; continue
        g = glatt(p); pts = [[round(v, 1) for v in mitte(c)] for c in g]
        L = sum(math.hypot(pts[k + 1][0] - pts[k][0], pts[k + 1][1] - pts[k][1]) for k in range(len(pts) - 1))
        wege[f"{a}|{b}"] = pts; print(f"  ✓ {a} – {b}: {len(pts)} Wegpunkte, {L:.0f} Felder")
json.dump({"_": "erzeugt von werkzeug/seewege.py aus dem Gehraster der Welt und shared/haefen.json – nicht von Hand ändern", "zelle": Z, "haefen": haefen, "wege": wege},
          open(os.path.join(RT, "shared", "seewege.json"), "w"), ensure_ascii=False, separators=(",", ":"))
print(f"{len(wege)} Seewege" + (f", {fehler} fehlen" if fehler else ""))
