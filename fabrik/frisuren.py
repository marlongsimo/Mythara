"""Mythara Fabrik – stilisierte Frisuren aus Strähnen-Clustern direkt auf dem Kopf eines Grundkörpers erzeugen (Blender-Python, ohne Vorlage).

  python3 fabrik/frisuren.py <basis.blend> <ziel.glb> <stil> [farbe=#3b2618] [dichte=1.0] [laenge=1.0] [saat=1] [pony=0.74]

stil   kurz | lang | zopf | undercut | militaer | undercut_bun | zerzaust | zopf_eng | scheitel
       Frauen (breite Bandsträhnen): dutt_hoch | wuschel_hoch | pixie | zopf_wild | seitenbob
Keine einzelnen Haare, sondern größere Strähnen: abgeflachte, spitz zulaufende Bänder entlang von Leitkurven. Sie wachsen von Wurzeln auf der
Kopfhaut (innerhalb des Haaransatzes) in Kämmrichtung, mit Schwerkraft und etwas Zufall, und werden außerhalb von Kopf und Schultern gehalten.
Darunter liegt eine dunkle Grundschale, damit keine Kopfhaut durchscheint. Farbe als Punktfarben: Ansatz dunkler, Spitzen heller, jede Strähne
etwas anders. Ergebnis: ein Teilnetz für rig.py (Platz „haar“, Gewichte vom Grundkörper).
  kurz      3–6 cm, eng am Kopf, nach vorn und zur Seite gekämmt, kurzer Pony
  lang      Mittelscheitel, fällt über Ohren und Schultern bis auf den oberen Rücken
  zopf      nach hinten zum Nacken gekämmt, dort gesammelt, geflochtener Zopf bis zwischen die Schulterblätter
  undercut  Seiten und Nacken rasiert (nur Stoppeln), oben lang nach hinten zu einem Knoten
"""
import math, os, sys
import numpy as np
import bpy, bmesh
from mathutils import Vector
from mathutils.bvhtree import BVHTree

basis, ziel, STIL = sys.argv[1:4]; opt = dict(a.split("=", 1) for a in sys.argv[4:] if "=" in a)
hexf = opt.get("farbe", "#3b2618"); FARBE = np.array([int(hexf[i:i + 2], 16) / 255 for i in (1, 3, 5)]) ** 2.2
DICHTE, LAENGE = float(opt.get("dichte", 1.0)), float(opt.get("laenge", 1.0)); rng = np.random.default_rng(int(opt.get("saat", 1)))
bpy.ops.wm.read_factory_settings(use_empty=True)
with bpy.data.libraries.load(os.path.abspath(basis), link=False) as (src, dst): dst.objects = list(src.objects)
objs = [o for o in dst.objects if o]; arm = next(o for o in objs if o.type == "ARMATURE"); k = next(o for o in objs if o.get("art") == "koerper")
KN = arm.data.bones; KZ0, KZ1 = KN["kopf"].head_local.z, KN["kopf"].tail_local.z; KL = KZ1 - KZ0
me = k.data; P = np.array([v.co[:] for v in me.vertices]); ZT = P[:, 2].max()
bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0005); bvh = BVHTree.FromBMesh(bm)
MITTE = np.array([KN["kopf"].head_local.x, KN["kopf"].head_local.y + 0.02, KZ0 + 0.55 * KL]); CX = MITTE[0]
def naechst(p):
    r = bvh.find_nearest(Vector(p)); n = np.array(r[1]); q = np.array(r[0])
    if np.dot(n, q - MITTE) < 0 and q[2] > KZ0: n = -n                                              # Flächenrichtung nach außen
    return q, n, (1 if np.dot(np.asarray(p) - q, n) >= 0 else -1) * r[3]
# ---- Kopfhaut: Punkte auf den Kopfflächen, innerhalb des Haaransatzes ---------------------------------------------------------
kopf_f = [f for f in bm.faces if min(v.co.z for v in f.verts) > KZ0 - 0.02]
flaechen = np.array([f.calc_area() for f in kopf_f]); mitten = np.array([f.calc_center_median()[:] for f in kopf_f]); normalen = np.array([f.normal[:] for f in kopf_f])
aus = np.einsum("ij,ij->i", normalen, mitten - MITTE) < 0; normalen[aus] *= -1
def ansatz(p, n):
    """Höhe des Haaransatzes je Richtung um den Kopf (vorn hoch, Schläfen mittel, Nacken tief) – als Anteil des Kopfknochens"""
    d = p - MITTE; w = np.arctan2(d[..., 0], -d[..., 1]); c, s_ = np.cos(w), np.sin(w)
    a = 0.8 * c ** 2 * (c > 0) + 0.6 * s_ ** 2 + 0.16 * c ** 2 * (c < 0)
    return a
hz_f = (mitten[:, 2] - KZ0) / KL
halbe = np.percentile(np.abs(mitten[(hz_f > 0.2) & (hz_f < 0.7), 0] - CX), 80)
ohr_f = (np.abs(mitten[:, 0] - CX) > halbe * 0.97) & (hz_f > 0.2) & (hz_f < 0.64) & (np.abs(mitten[:, 1] - MITTE[1]) < 0.06)
kopfhaut = (hz_f >= ansatz(mitten, normalen)) & ~ohr_f & ~((normalen[:, 1] < -0.55) & (hz_f < 0.8))
kopfhaut &= ~((mitten[:, 1] < MITTE[1] + 0.01) & (hz_f < 0.7))                                             # vor dem Ohr unter der Schläfe kein Haar (keine Koteletten bis auf die Wange)
def wurzeln(anzahl, maske, abstand):
    w = flaechen * maske
    if w.sum() <= 0: return np.zeros((0, 3)), np.zeros((0, 3))                                      # kein passender Bereich auf diesem Kopf (z. B. sehr hoher Haaransatz): überspringen
    w = w / w.sum(); idx = rng.choice(len(kopf_f), size=anzahl * 6, p=w); pts = []; nrm = []
    for i in idx:
        vs = [v.co for v in kopf_f[i].verts]; a, b = rng.random(2)
        if a + b > 1: a, b = 1 - a, 1 - b
        p = np.array(vs[0] + (vs[1] - vs[0]) * a + (vs[-1] - vs[0]) * b)
        if all(np.linalg.norm(p - q) > abstand for q in pts[-400:]): pts.append(p); nrm.append(normalen[i])
        if len(pts) >= anzahl: break
    return np.array(pts), np.array(nrm)
# ---- Strähnen ---------------------------------------------------------------------------------------------------------------
strang = []                                                                                          # (punkte, breiten, dicke, normalen, helligkeit)
def tangential(v, n): return v - np.dot(v, n) * n
def wachsen(p0, n0, kamm, laenge, schwer, anlage=0.012, seg=10, breite=0.014, wirr=0.15, ziel_p=None, abstand0=0.004, stirn_z=None, boden_z=None, flach=0.3, schwung=0.0, frei=False):
    pts = [p0 + n0 * abstand0]; d = tangential(kamm(p0), n0); d = d / (np.linalg.norm(d) + 1e-9) * 0.93 + n0 * 0.15; d /= np.linalg.norm(d)
    off = abstand0 + rng.random() * 0.006; schritt = laenge / seg; nrms = [n0]
    for i in range(seg):
        t = (i + 1) / seg; p = pts[-1]
        q, n, sd = naechst(p); want = kamm(p)
        if ziel_p is not None: want = want * (1 - t) + (ziel_p - p) / (np.linalg.norm(ziel_p - p) + 1e-9) * (0.3 + t)
        d = d + tangential(want, n) * 0.5 + np.array([0, 0, -1.0]) * schwer * t + rng.normal(0, wirr, 3) * 0.3; d /= np.linalg.norm(d)
        p = p + d * schritt; q, n, sd = naechst(p)
        if sd < off: p = q + n * off                                                                    # nicht eindringen (Kopf, Hals, Schultern)
        elif not frei and sd > off + anlage and (ziel_p is None or np.linalg.norm(ziel_p - p) > 0.035): p = q + n * (off + anlage)   # am Kopf anliegen (nicht abstehen), mit Ziel erst kurz davor frei
        if boden_z is not None and p[2] < boden_z: p[2] = boden_z; q, n, sd = naechst(p); p = q + n * max(off, sd)   # Strähnen enden über dieser Höhe (rasierte Seiten, kurzer Nacken)
        if stirn_z is not None and p[1] < MITTE[1] and p[2] < stirn_z: p[2] = stirn_z; q, n, sd = naechst(p); p = q + n * max(off, sd)   # Pony endet über den Augenbrauen
        if schwung and t > 0.6: p = p + n * schwung * ((t - 0.6) / 0.4) ** 2                          # Spitze schwingt nach außen
        pts.append(p); nrms.append(n)
    t = np.linspace(0, 1, len(pts)); br = breite * (1 - 0.7 * t ** 2.2) + 0.002                         # breite Büschel, erst zur Spitze schmal
    if flach < 0.3:                                                                                     # Bandsträhne: breit am Ansatz, gleichmäßig zur Spitze verjüngt, Weg geglättet
        br = breite * (1 - t ** 1.5) ** 0.8 + 0.0012
        P_ = np.array(pts)
        for _ in range(3): P_[1:-1] = (P_[:-2] + 2 * P_[1:-1] + P_[2:]) / 4
        pts = list(P_)
    strang.append((np.array(pts), br, flach, np.array(nrms), 0.85 + 0.25 * rng.random()))
def kamm_vorn(p):                                                                                    # kurz: vom Wirbel weg, vorn nach vorn, seitlich nach unten
    d = p - SCHEITEL; d[2] = 0; d = d / (np.linalg.norm(d) + 1e-9); return d + np.array([0, -0.2, -0.35])
def kamm_scheitel(p):                                                                                # lang: vom Mittelscheitel zur Seite und nach unten
    s = np.sign(p[0] - CX) or 1.0; return np.array([s * 0.8, 0.15, -1.0])
KOPF_P = P[(P[:, 2] > KZ0 + 0.35 * KL)]; Y_HINTEN = KOPF_P[:, 1].max(); Y_VORN = KOPF_P[:, 1].min()          # Hinterkopf und Stirn aus der Form (nicht vom Knochen)
NACKEN = np.array([CX, Y_HINTEN + 0.012, KZ0 + 0.3 * KL])                                            # Sammelpunkt des Zopfs (am Hinterkopf, über dem Nacken)
KNOTEN = np.array([CX, Y_HINTEN - 0.035, ZT + 0.012])                                                # Knoten oben hinten
SCHEITEL = np.array([CX, (Y_VORN + Y_HINTEN) / 2 + 0.03, ZT])
def kamm_zu(z): return lambda p: (z - p) / (np.linalg.norm(z - p) + 1e-9)
hz_ok = lambda m: m
if STIL == "kurz":
    r, n = wurzeln(int(230 * DICHTE), kopfhaut, 0.009)
    for p, nn in zip(r, n):
        vorn = (p[1] < MITTE[1] - 0.02) & ((p[2] - KZ0) / KL > 0.7)
        wachsen(p, nn, kamm_vorn, (0.045 if vorn else 0.04) * LAENGE * (0.85 + 0.3 * rng.random()), 0.1, anlage=0.006, seg=7, breite=0.024, wirr=0.08, stirn_z=KZ0 + float(opt.get("pony", 0.74)) * KL)
elif STIL == "lang":
    r, n = wurzeln(int(300 * DICHTE), kopfhaut, 0.008)
    for p, nn in zip(r, n):
        hinten = p[1] > MITTE[1] + 0.02; vorne = p[1] < MITTE[1] - 0.03
        L = (0.30 if hinten else (0.22 if vorne else 0.27)) * LAENGE * (0.85 + 0.3 * rng.random())
        wachsen(p, nn, kamm_scheitel, L, 1.1, anlage=0.03, seg=14, breite=0.024, wirr=0.1)
elif STIL == "zopf":
    r, n = wurzeln(int(240 * DICHTE), kopfhaut, 0.0085)
    for p, nn in zip(r, n):
        L = np.linalg.norm(NACKEN - p) * 1.25
        wachsen(p, nn, kamm_zu(NACKEN), L, 0.0, anlage=0.006, seg=10, breite=0.022, wirr=0.04, ziel_p=NACKEN)
    # geflochtener Zopf: drei verschränkte Stränge den Rücken hinunter
    bahn = [NACKEN.copy()]
    for i in range(24):
        p = bahn[-1] + np.array([0, 0.004, -0.012]); q, nn, sd = naechst(p)
        if sd < 0.02: p = q + nn * 0.02
        bahn.append(p)
    bahn = np.array(bahn); s_ = np.linspace(0, 1, len(bahn))
    for j in range(3):
        ph = s_ * 2 * np.pi * 5 + j * 2 * np.pi / 3; br = 0.024 * (1 - 0.4 * s_)
        pts = bahn + np.c_[np.sin(ph) * 0.011 * (1 - 0.3 * s_), np.cos(2 * ph) * 0.005, np.zeros_like(ph)]
        strang.append((pts, br, 0.75, np.tile([0, 1.0, 0], (len(pts), 1)), 0.9 + 0.1 * j))
    ende = bahn[-1]
    for i in range(7):                                                                                  # Quaste unter dem Band
        d = np.array([rng.normal(0, 0.3), 0.15, -1.0]); d /= np.linalg.norm(d); pts = np.array([ende + d * 0.06 * t for t in np.linspace(0, 1, 5)])
        strang.append((pts, 0.012 * (1 - 0.8 * np.linspace(0, 1, 5)) + 0.002, 0.5, np.tile([0, 1.0, 0], (5, 1)), 0.9 + 0.2 * rng.random()))
    BAND = ende
elif STIL == "undercut":
    oben = kopfhaut & (hz_f > 0.74) & (np.abs(mitten[:, 0] - CX) < 0.052)
    r, n = wurzeln(int(170 * DICHTE), oben, 0.008)
    for p, nn in zip(r, n):
        L = np.linalg.norm(KNOTEN - p) * 1.15
        wachsen(p, nn, kamm_zu(KNOTEN), L, 0.0, anlage=0.006, seg=9, breite=0.022, wirr=0.03, ziel_p=KNOTEN, stirn_z=KZ0 + 0.8 * KL)
    for i in range(9):                                                                                  # Knoten aus gewickelten Strähnen
        ach = rng.normal(0, 1, 3); ach /= np.linalg.norm(ach); u = np.cross(ach, [0, 0, 1.0]); u /= np.linalg.norm(u) + 1e-9; v = np.cross(ach, u)
        w = np.linspace(0, 2 * np.pi * 0.9, 14); rad = 0.016 + 0.004 * rng.random()
        pts = KNOTEN + np.array([0, 0.008, 0.01]) + np.outer(np.cos(w), u) * rad + np.outer(np.sin(w), v) * rad
        strang.append((pts, np.full(len(w), 0.012), 0.55, np.tile(ach, (len(w), 1)), 0.85 + 0.25 * rng.random()))
elif STIL == "militaer":                                                                             # Kurzhaar Militär: oben 1,5–2 cm nach vorn/oben, Seiten und Nacken fast rasiert
    oben = kopfhaut & (hz_f > 0.7) & (np.abs(mitten[:, 0] - CX) < 0.05)
    r, n = wurzeln(int(320 * DICHTE), oben, 0.0065)
    for p, nn in zip(r, n): wachsen(p, nn, lambda q: np.array([0, -1.0, 0.3]), 0.016 * LAENGE * (0.8 + 0.4 * rng.random()), 0.0, anlage=0.002, seg=3, breite=0.016, wirr=0.02, abstand0=0.002, stirn_z=KZ0 + 0.84 * KL, boden_z=KZ0 + 0.68 * KL)
elif STIL == "undercut_bun":                                                                         # Undercut, oben lang nach hinten zu einem Knoten am Hinterkopf
    BUN = np.array([CX, Y_HINTEN + 0.006, KZ0 + 0.62 * KL])
    oben = kopfhaut & (hz_f > 0.7) & (np.abs(mitten[:, 0] - CX) < 0.055)
    r, n = wurzeln(int(190 * DICHTE), oben, 0.008)
    for p, nn in zip(r, n): wachsen(p, nn, kamm_zu(BUN), np.linalg.norm(BUN - p) * 1.2, 0.0, anlage=0.006, seg=10, breite=0.022, wirr=0.03, ziel_p=BUN, stirn_z=KZ0 + 0.8 * KL, boden_z=KZ0 + 0.56 * KL)
    for i in range(11):
        ach = np.array([0, 1.0, 0.25]) + rng.normal(0, 0.45, 3); ach /= np.linalg.norm(ach); u = np.cross(ach, [0, 0, 1.0]); u /= np.linalg.norm(u) + 1e-9; v = np.cross(ach, u)
        w = np.linspace(0, 2 * np.pi * 0.92, 16); rad = 0.019 + 0.004 * rng.random()
        pts = BUN + np.array([0, 0.022, 0.0]) + np.outer(np.cos(w), u) * rad + np.outer(np.sin(w), v) * rad
        strang.append((pts, np.full(len(w), 0.013), 0.55, np.tile(ach, (len(w), 1)), 0.85 + 0.25 * rng.random()))
elif STIL == "zerzaust":                                                                             # mittellang zerzaust: 7–11 cm, Büschel in Gruppen mit gemeinsamer Richtung, Spitzen gezackt
    r, n = wurzeln(int(210 * DICHTE), kopfhaut, 0.0095)
    gruppen = {}
    for p, nn in zip(r, n):
        g = tuple(np.round((p - MITTE) / 0.035).astype(int))                                          # benachbarte Strähnen gehören zu einem Büschel (gleiche Richtung)
        if g not in gruppen: zf = rng.normal(0, 0.55, 3); zf[2] = -abs(zf[2]) * 0.6; gruppen[g] = zf
        kamm = (lambda zf: lambda q: kamm_vorn(q) * 0.8 + zf)(gruppen[g])
        hinten = p[1] > MITTE[1] + 0.02
        seitlich = abs(p[0] - CX) > 0.045
        wachsen(p, nn, kamm, (0.055 if hinten else 0.05) * LAENGE * (0.8 + 0.4 * rng.random()), 0.35, anlage=0.02, seg=8, breite=0.03, wirr=0.12, stirn_z=KZ0 + 0.78 * KL, boden_z=KZ0 + (0.5 if seitlich and not hinten else 0.32) * KL)   # Seiten enden über dem Ohr, Nacken über dem Kragen
        pts, br, fl, nr, h = strang[-1]; tt = np.linspace(0, 1, len(pts)); strang[-1] = (pts, 0.03 * (1 - tt ** 0.9) + 0.0008, 0.22, nr, h)   # flach und spitz (kein Wulst)
elif STIL == "zopf_eng":                                                                             # lange Haare straff nach hinten, eng am Hinterkopf gebunden, Zopf hängt glatt herab
    BAND_P = np.array([CX, Y_HINTEN + 0.008, KZ0 + 0.42 * KL])
    r, n = wurzeln(int(240 * DICHTE), kopfhaut, 0.0085)
    for p, nn in zip(r, n): wachsen(p, nn, kamm_zu(BAND_P), np.linalg.norm(BAND_P - p) * 1.1, 0.0, anlage=0.004, seg=10, breite=0.022, wirr=0.02, ziel_p=BAND_P, abstand0=0.003)
    for i in range(16):                                                                              # Pferdeschwanz: Strähnen vom Band nach unten, eng gebündelt
        o_ = rng.normal(0, 0.007, 3); pts = [BAND_P + np.array([0, 0.012, 0]) + o_]
        for j in range(12):
            q_ = pts[-1] + np.array([o_[0] * 0.15, 0.003, -0.023 * LAENGE]); qq, nq_, sd = naechst(q_)
            if sd < 0.012: q_ = qq + nq_ * 0.012
            pts.append(q_)
        pts = np.array(pts); tt = np.linspace(0, 1, len(pts)); strang.append((pts, 0.02 * (1 - 0.75 * tt ** 1.5) + 0.002, 0.45, np.tile([0, 1.0, 0], (len(pts), 1)), 0.85 + 0.25 * rng.random()))
    w = np.linspace(0, 2 * np.pi, 13); u = np.array([1.0, 0, 0]); v = np.array([0, 0.3, 1.0]) / np.linalg.norm([0, 0.3, 1.0])   # Band
    strang.append((BAND_P + np.array([0, 0.014, -0.004]) + np.outer(np.cos(w), u) * 0.013 + np.outer(np.sin(w), np.cross(u, v)) * 0.013, np.full(13, 0.007), 1.0, np.tile([0, 1.0, 0], (13, 1)), 0.35))
elif STIL == "scheitel":                                                                             # mittellanger Seitenscheitel: links gescheitelt, über die Stirn zur rechten Seite gekämmt, bis über die Ohren
    SX = CX + 0.03
    def kamm_seite(q):
        s_ = 1.0 if q[0] > SX else -1.0; return np.array([s_ * 1.0, -0.35 if s_ < 0 else 0.1, -0.55])
    r, n = wurzeln(int(250 * DICHTE), kopfhaut, 0.0085)
    for p, nn in zip(r, n):
        L = (0.09 if p[0] < SX else 0.07) * LAENGE * (0.85 + 0.3 * rng.random())
        wachsen(p, nn, kamm_seite, L, 0.55, anlage=0.014, seg=9, breite=0.024, wirr=0.07, stirn_z=KZ0 + 0.72 * KL)
# ---- Frauenfrisuren im Stil breiter, flacher Bandsträhnen (wenige große Cluster, Schwung an den Spitzen) ----
elif STIL in ("dutt_hoch", "wuschel_hoch", "pixie", "zopf_wild", "seitenbob"):
    VORN_Z = KZ0 + 0.74 * KL; SEITE = 1.0                                                            # Scheitel links, Pony nach rechts
    band = dict(flach=0.16, wirr=0.015)
    def pony(anzahl, laenge, ziel_x=-0.07, tief=0.0):                                                 # breite Strähnen über die Stirn zur Seite
        vorn_m = kopfhaut & (mitten[:, 1] < MITTE[1] - 0.02) & (hz_f > 0.78)
        if not vorn_m.any(): vorn_m = kopfhaut & (mitten[:, 1] < MITTE[1]) & (hz_f > 0.7)          # Kopf mit anderer Lage des Haaransatzes
        r, n = wurzeln(anzahl, vorn_m, 0.02)
        for p, nn in zip(r, n):
            wachsen(p, nn, lambda q: np.array([ziel_x * 14, -0.55, -0.55]), laenge * (0.85 + 0.3 * rng.random()), 0.2, anlage=0.012, seg=10, breite=0.065, stirn_z=VORN_Z - tief, schwung=0.012, **band)
    def rahmen(laenge, anzahl=2):                                                                     # lange Strähnen vor den Ohren, rahmen das Gesicht
        for sx in (-1, 1):
            m_ = kopfhaut & (np.sign(mitten[:, 0] - CX) == sx) & (mitten[:, 1] < MITTE[1] + 0.005) & (hz_f > 0.62) & (hz_f < 0.82)
            r, n = wurzeln(anzahl, m_, 0.012)
            for p, nn in zip(r, n): wachsen(p, nn, lambda q, sx=sx: np.array([sx * 0.15, -0.25, -1.0]), laenge * (0.85 + 0.3 * rng.random()), 0.8, anlage=0.01, seg=11, breite=0.04, schwung=0.008, **band)
    if STIL == "dutt_hoch":
        BUN = np.array([CX + 0.01, Y_HINTEN - 0.045, ZT + 0.03])
        r, n = wurzeln(int(48 * DICHTE), kopfhaut & ~((mitten[:, 1] < MITTE[1] - 0.02) & (hz_f > 0.78)), 0.022)
        for p, nn in zip(r, n): wachsen(p, nn, kamm_zu(BUN), np.linalg.norm(BUN - p) * 1.15, 0.0, anlage=0.006, seg=12, breite=0.06, ziel_p=BUN, **band)
        for i in range(8):
            ach = np.array([0, 0.3, 1.0]) + rng.normal(0, 0.35, 3); ach /= np.linalg.norm(ach); u = np.cross(ach, [1.0, 0, 0]); u /= np.linalg.norm(u) + 1e-9; v = np.cross(ach, u)
            w = np.linspace(0, 2 * np.pi * 0.85, 14); rad = 0.022 + 0.006 * rng.random()
            strang.append((BUN + np.array([0, 0, 0.022]) + np.outer(np.cos(w), u) * rad + np.outer(np.sin(w), v) * rad, np.full(14, 0.026), 0.4, np.tile(ach, (14, 1)), 0.85 + 0.25 * rng.random()))
        pony(4, 0.11); rahmen(0.15)
    elif STIL == "wuschel_hoch":
        HOCH = np.array([CX, MITTE[1] + 0.03, ZT + 0.08])
        r, n = wurzeln(int(44 * DICHTE), kopfhaut & (hz_f > 0.45), 0.022)
        for p, nn in zip(r, n): wachsen(p, nn, kamm_zu(HOCH), 0.1 * LAENGE * (0.8 + 0.4 * rng.random()), -0.3, anlage=0.03, seg=10, breite=0.06, frei=True, schwung=0.02, flach=0.16, wirr=0.08)
        pony(3, 0.1); rahmen(0.16, 1)
    elif STIL == "pixie":
        r, n = wurzeln(int(46 * DICHTE), kopfhaut & ~((mitten[:, 1] < MITTE[1] - 0.02) & (hz_f > 0.78)), 0.022)
        for p, nn in zip(r, n):
            oben = (p[2] - KZ0) / KL > 0.85
            wachsen(p, nn, lambda q: kamm_vorn(q) + np.array([-0.4, 0, 0]), (0.06 if oben else 0.045) * LAENGE * (0.8 + 0.4 * rng.random()), 0.0 if oben else 0.3,
                    anlage=0.012 if oben else 0.006, seg=8, breite=0.058, schwung=0.01 if oben else 0.004, boden_z=KZ0 + 0.3 * KL, **band)
        pony(4, 0.08, tief=-0.01)
    elif STIL == "zopf_wild":
        BAND_P = np.array([CX, Y_HINTEN - 0.005, KZ0 + 0.78 * KL])
        r, n = wurzeln(int(48 * DICHTE), kopfhaut & ~((mitten[:, 1] < MITTE[1] - 0.02) & (hz_f > 0.78)), 0.022)
        for p, nn in zip(r, n): wachsen(p, nn, kamm_zu(BAND_P), np.linalg.norm(BAND_P - p) * 1.1, 0.0, anlage=0.006, seg=11, breite=0.06, ziel_p=BAND_P, **band)
        for i in range(16):                                                                          # voller Zopf: breite Strähnen, die aufsteigen und nach hinten unten ausfächern
            ang = rng.normal(0, 0.55); pts = [BAND_P + np.array([0, 0.015, 0.0])]; d = np.array([math.sin(ang) * 0.5, 0.8, 0.25]); d /= np.linalg.norm(d)
            L = 0.2 * LAENGE * (0.75 + 0.5 * rng.random())
            for j in range(11):
                d = d + np.array([math.sin(ang) * 0.04, -0.02, -0.28]); d /= np.linalg.norm(d); q_ = pts[-1] + d * L / 11; qq, nq_, sd = naechst(q_)
                if sd < 0.015: q_ = qq + nq_ * 0.015
                pts.append(q_)
            pts = np.array(pts); tt = np.linspace(0, 1, len(pts)); strang.append((pts, 0.06 * (1 - tt ** 1.5) ** 0.8 + 0.0015, 0.18, np.tile([0, 0.6, 0.8], (len(pts), 1)), 0.85 + 0.25 * rng.random()))
        pony(3, 0.11); rahmen(0.13, 1)
    elif STIL == "seitenbob":                                                                       # asymmetrischer Bob: Seitenscheitel, großer Pony über ein Auge, Spitzen schwingen nach außen
        SX = CX + 0.03
        def kamm_bob(q): s_ = 1.0 if q[0] > SX else -1.0; return np.array([s_ * 0.9, -0.2 if s_ < 0 else 0.15, -0.6])
        r, n = wurzeln(int(52 * DICHTE), kopfhaut, 0.021)
        for p, nn in zip(r, n):
            vorn_ = p[1] < MITTE[1] - 0.02
            wachsen(p, nn, kamm_bob, (0.16 if vorn_ else 0.15) * LAENGE * (0.85 + 0.3 * rng.random()), 0.7, anlage=0.02, seg=12, breite=0.065, schwung=0.012, stirn_z=VORN_Z - 0.035, boden_z=KZ0 + 0.12 * KL, **band)
else: sys.exit(f"unbekannter Stil: {STIL}")
# ---- Netz bauen: Strähnen als abgeflachte Röhren + Grundschale ---------------------------------------------------------------
V, F, C = [], [], []
SEITEN = 6
for pts, br, flach, nrms, h in strang:
    nP = len(pts); basis_i = len(V)
    for i in range(nP):
        t_ = pts[min(i + 1, nP - 1)] - pts[max(i - 1, 0)]; t_ /= np.linalg.norm(t_) + 1e-9
        up = nrms[i] - np.dot(nrms[i], t_) * t_; up /= np.linalg.norm(up) + 1e-9; side = np.cross(t_, up)
        tt = i / (nP - 1)
        for j in range(SEITEN):
            a = 2 * np.pi * j / SEITEN; V.append(pts[i] + side * math.cos(a) * br[i] * 0.5 + up * math.sin(a) * br[i] * 0.5 * flach)
            C.append(FARBE * h * (0.62 + 0.5 * tt) * (1.0 + 0.12 * math.sin(a)))                       # Ansatz dunkler, Spitze heller, Oberseite heller
    for i in range(nP - 1):
        for j in range(SEITEN):
            a0, a1 = basis_i + i * SEITEN + j, basis_i + i * SEITEN + (j + 1) % SEITEN; F.append((a0, a1, a1 + SEITEN, a0 + SEITEN))
    F.append(tuple(basis_i + j for j in range(SEITEN))[::-1]); F.append(tuple(basis_i + (nP - 1) * SEITEN + j for j in range(SEITEN)))
# Grundschale: Kopfhaut 3 mm abgehoben, dunkel (bei undercut: Stoppeln an den Seiten, heller)
RASIERT = {"undercut": (0.74, 0.052), "undercut_bun": (0.7, 0.055), "militaer": (0.7, 0.05)}         # Stil: (oben ab Höhe, halbe Breite) – außerhalb Stoppeln
wange = (mitten[:, 1] < MITTE[1] + 0.015) & (hz_f < 0.86)                                            # vor dem Ohr unterhalb der Schläfe: Gesicht (keine Stoppeln auf der Wange)
stoppel_ok = (hz_f > 0.47) | ((mitten[:, 1] > MITTE[1] + 0.045) & (hz_f > 0.2))                    # Seiten nur oberhalb der Ohrmitte, tiefer nur im Nacken (nicht Kiefer und Hals)
schale = kopfhaut if STIL not in RASIERT else (kopfhaut & (hz_f > RASIERT[STIL][0] + 0.03) & (np.abs(mitten[:, 0] - CX) < RASIERT[STIL][1] - 0.008))   # Seiten sauber rasiert (hautfarben), keine gezackte Stoppelfläche
for i in np.where(schale)[0]:
    f = kopf_f[i]; b0 = len(V); hell = 0.55 if (STIL not in RASIERT or (hz_f[i] > RASIERT[STIL][0] and abs(mitten[i, 0] - CX) < RASIERT[STIL][1])) else 0.9
    farbe_s = FARBE * hell if hell < 0.8 else FARBE * 0.3 + np.array([0.5, 0.36, 0.28]) ** 2.2 * 0.7      # Stoppeln: Haut mit wenig Haarton
    for v in f.verts: V.append(np.array(v.co) + normalen[i] * 0.003); C.append(farbe_s)
    F.append(tuple(range(b0, b0 + len(f.verts))))
V = np.array(V); C = np.clip(np.array(C), 0, 1)
netz = bpy.data.meshes.new("haar"); netz.from_pydata(V.tolist(), [], F); netz.update()
o = bpy.data.objects.new("haar", netz); bpy.context.collection.objects.link(o); bpy.context.view_layer.objects.active = o; o.select_set(True)
bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT"); bpy.ops.mesh.normals_make_consistent(inside=False); bpy.ops.object.mode_set(mode="OBJECT")
ca = netz.color_attributes.new("Col", "FLOAT_COLOR", "POINT"); ca.data.foreach_set("color", np.c_[C, np.ones(len(C))].astype(np.float32).ravel())
netz.color_attributes.active_color = ca; netz.color_attributes.render_color_index = netz.color_attributes.active_color_index
m = bpy.data.materials.new("haar"); m.use_nodes = True; nt = m.node_tree; vc = nt.nodes.new("ShaderNodeVertexColor"); vc.layer_name = "Col"; b_ = nt.nodes["Principled BSDF"]
nt.links.new(vc.outputs[0], b_.inputs["Base Color"]); b_.inputs["Roughness"].default_value = 0.55; netz.materials.append(m)
bpy.ops.object.shade_smooth(); bm.free()
bpy.ops.object.select_all(action="DESELECT"); o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True, export_vertex_color="MATERIAL", export_all_vertex_colors=False)
print(f"Frisur {STIL}: {len(strang)} Strähnen · {len(V)} Punkte · geschrieben {ziel}")
