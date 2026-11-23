"""Mythara Fabrik – eine eigenständige 3D-Beinrüstung (Plattenhose, Beinschienen; z. B. von Meshy) auf einen Grundkörper setzen.

  python3 fabrik/beine_anpassen.py <basis.blend> <teil.glb> <ziel.glb> [abstand=0.03] [oben=0.16] [unten=0.04] [max_weit=1.8] [min_weit=0.85] [schritt=0.12] [richtung=0|1]
Höhe: drei Punkte werden auf den Körper abgebildet (stückweise linear) – Oberkante → Hüftgelenk + „oben“ (Gürtel), Schritt der Hose → Hüftgelenk − „schritt“,
Unterkante → Knöchel + „unten“. Unter dem Schritt wird jedes Hosenbein auf die Achse des Körperbeins gesetzt (Meshy baut die Beine meist enger als die Figur)
und je Höhe so weit aufgeweitet, dass seine Innenseite überall „abstand“ vor Bein und Stiefel liegt (lieber mehr Spiel als zu wenig); zu weite Stellen
werden höchstens auf „min_weit“ verengt. Darüber um die Rumpfachse (Hüfte, Gesäß; die herabhängenden Arme zählen nicht), dort je Richtung eigen – vorn und hinten wenig, seitlich mehr.
Am Schritt gehen beide Arten weich ineinander über. Ergebnis: ein Teilnetz für rig.py (Gewichte vom Grundkörper – die Hose folgt den Beinen).
"""
import os, sys
import numpy as np
import bpy, bmesh
basis, quelle, ziel = sys.argv[1:4]; opt = dict(a.split("=", 1) for a in sys.argv[4:] if "=" in a)
RICHTUNG = opt.get("richtung", "0") == "1"   # richtung=1: auch die Beine je Richtung einpassen (schlanker – nur wo nötig weiter)
AB, OBEN, UNTEN, MAXW, MINW, SCHRITT = (float(opt.get(k, d)) for k, d in (("abstand", 0.03), ("oben", 0.16), ("unten", 0.04), ("max_weit", 1.8), ("min_weit", 0.85), ("schritt", 0.12)))
bpy.ops.wm.read_factory_settings(use_empty=True)
with bpy.data.libraries.load(os.path.abspath(basis), link=False) as (src, dst): dst.objects = list(src.objects)
objs = [o for o in dst.objects if o]; arm = next(o for o in objs if o.type == "ARMATURE"); k = next(o for o in objs if o.get("art") == "koerper"); KN = arm.data.bones
P = np.array([v.co[:] for v in k.data.vertices]); gi = {g.index: g.name for g in k.vertex_groups}; GW = {}
for v in k.data.vertices:
    for g in v.groups: GW.setdefault(gi[g.group], np.zeros(len(P)))[v.index] = g.weight
w = lambda *n: sum(GW.get(x, np.zeros(len(P))) for x in n)
ARM = w(*[b.name for b in KN if b.name.split(".")[0] in ("oberarm", "unterarm", "hand")])
BEIN = {S: w("oberschenkel." + S, "unterschenkel." + S, "fuss." + S) for S in "LR"}
ZH = KN["oberschenkel.L"].head_local.z; Z_GURT, Z_SCHRITT, Z_KN = ZH + OBEN, ZH - SCHRITT, KN["fuss.L"].head_local.z + UNTEN
# Teil laden, aufräumen, fein unterteilen
bpy.ops.import_scene.gltf(filepath=os.path.abspath(quelle)); o = next(x for x in bpy.context.selected_objects if x.type == "MESH")
bpy.ops.object.select_all(action="DESELECT"); o.select_set(True); bpy.context.view_layer.objects.active = o
bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM"); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bm = bmesh.new(); bm.from_mesh(o.data); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
for _ in range(5):
    lang = [e for e in bm.edges if e.calc_length() > 0.025]
    if not lang: break
    bmesh.ops.subdivide_edges(bm, edges=lang, cuts=1, use_grid_fill=False); bmesh.ops.triangulate(bm, faces=bm.faces[:])
bm.to_mesh(o.data); bm.free(); me = o.data; V = np.array([v.co[:] for v in me.vertices]); V[:, 0] -= (V[:, 0].max() + V[:, 0].min()) / 2
# Schritt der Hose: tiefste Höhe, auf der noch Stoff über die Mitte geht
z0, z1 = V[:, 2].min(), V[:, 2].max(); zs = np.linspace(z0, z1, 80); breite_mitte = np.abs(V[:, 0]) < 0.012 * (z1 - z0)
schritt_t = next((z for z in zs if (breite_mitte & (np.abs(V[:, 2] - z) < (z1 - z0) / 80)).any() and z > z0 + 0.4 * (z1 - z0)), z0 + 0.6 * (z1 - z0))
def hoehe(z):                                                           # stückweise linear: Unterkante → Knöchel, Schritt → Schritt, Oberkante → Gürtel
    return np.where(z < schritt_t, Z_KN + (z - z0) / (schritt_t - z0) * (Z_SCHRITT - Z_KN), Z_SCHRITT + (z - schritt_t) / (z1 - schritt_t) * (Z_GURT - Z_SCHRITT))
sk = (Z_GURT - Z_KN) / (z1 - z0); V[:, 0] *= sk; V[:, 1] *= sk; V[:, 2] = hoehe(V[:, 2]); V[:, 1] += np.median(P[(P[:, 2] > Z_SCHRITT) & (P[:, 2] < Z_GURT) & (ARM < 0.3), 1]) - np.median(V[:, 1])
NZ, NA = 60, 24; ZB = np.linspace(Z_KN - 0.05, Z_GURT + 0.05, NZ + 1); zi = lambda z: np.clip(np.searchsorted(ZB, z) - 1, 0, NZ - 1)
wi = lambda dx, dy: (((np.arctan2(dy, dx) + np.pi) / (2 * np.pi)) * NA).astype(int) % NA
def einpassen(Vt, Kt, mx, my, kx, ky, richtungsweise=False):
    """Vt (Teilpunkte) um ihre Mitte (mx,my je Band) auf die Körpermitte (kx,ky je Band) setzen und je Band radial aufweiten/verengen, bis überall Abstand bleibt"""
    bz_v, bz_k = zi(Vt[:, 2]), zi(Kt[:, 2]); rk = np.zeros((NZ, NA)); ra = np.full((NZ, NA), np.inf)
    dxk, dyk = Kt[:, 0] - kx[bz_k], Kt[:, 1] - ky[bz_k]; np.maximum.at(rk, (bz_k, wi(dxk, dyk)), np.hypot(dxk, dyk))
    dxv, dyv = Vt[:, 0] - mx[bz_v], Vt[:, 1] - my[bz_v]; np.minimum.at(ra, (bz_v, wi(dxv, dyv)), np.hypot(dxv, dyv))
    ok = np.isfinite(ra) & (rk > 0) & (ra > 0.35 * rk); f = np.where(ok, (rk + AB) / np.maximum(ra, 1e-4), np.nan)
    fz = np.array([np.nanmax(r) if np.isfinite(r).any() else np.nan for r in f]); gueltig = np.isfinite(fz)
    fz = np.interp(np.arange(NZ), np.where(gueltig)[0], fz[gueltig]) if gueltig.any() else np.ones(NZ)
    for _ in range(4): fz = np.maximum(fz, (np.roll(fz, 1) + fz + np.roll(fz, -1)) / 3)   # weich über die Höhe, nie enger als nötig
    fz = np.clip(fz, MINW, MAXW)
    if richtungsweise:                                                  # Hüfte: je Richtung eigener Faktor (vorn/hinten wenig, seitlich mehr), weich über Richtung und Höhe
        fa = np.where(np.isfinite(f), f, np.nan)
        for i in range(NZ):
            g = np.isfinite(fa[i])
            fa[i] = np.interp(np.arange(NA), np.where(g)[0], fa[i][g], period=NA) if g.any() else fz[i]
        for _ in range(3): fa = np.maximum(fa, (np.roll(fa, 1, 1) + fa + np.roll(fa, -1, 1)) / 3)
        for _ in range(3): fa = np.maximum(fa, (np.roll(fa, 1, 0) + fa + np.roll(fa, -1, 0)) / 3)
        fa = np.clip(fa, MINW, MAXW); fv = fa[bz_v, wi(dxv, dyv)]
    else: fv = fz[bz_v]
    out = Vt.copy(); out[:, 0] = kx[bz_v] + dxv * fv; out[:, 1] = ky[bz_v] + dyv * fv; return out, fz
def mitten(Q, sel):
    mx, my = np.full(NZ, np.nan), np.full(NZ, np.nan); b = zi(Q[:, 2])
    for i in range(NZ):
        m = sel & (b == i)
        if m.sum() > 3: mx[i] = (Q[m, 0].min() + Q[m, 0].max()) / 2; my[i] = (Q[m, 1].min() + Q[m, 1].max()) / 2
    for a in (mx, my):
        g = np.isfinite(a); a[:] = np.interp(np.arange(NZ), np.where(g)[0], a[g]) if g.any() else 0.0
        for _ in range(3): a[1:-1] = (a[:-2] + a[1:-1] + a[2:]) / 3
    return mx, my
erg = {}
for S, v in (("L", 1), ("R", -1)):                                     # Beine: jedes um seine eigene Achse (+x = linke Seite der Figur)
    selV = V[:, 0] * v > 0; selK = (BEIN[S] > 0.5) & (ARM < 0.3); mx, my = mitten(V, selV); kx, ky = mitten(P, selK)
    erg[S], fz = einpassen(V, P[selK], mx, my, kx, ky, richtungsweise=RICHTUNG); print(f"Bein {S}: Faktor {fz.min():.2f}–{fz.max():.2f}, versetzt um {np.nanmean(kx - mx) * 100:.1f} cm")
selK = (ARM < 0.3) & (P[:, 2] > Z_SCHRITT + 0.02); mx, my = mitten(V, np.ones(len(V), bool)); mx[:] = 0; kx, ky = mitten(P, selK); kx[:] = 0
erg["H"], fz = einpassen(V, P[selK], mx, my, kx, ky, richtungsweise=True); print(f"Hüfte: Faktor bis {fz.max():.2f} (je Richtung)")
t = np.clip((V[:, 2] - (Z_SCHRITT - 0.02)) / 0.1, 0, 1); t = t * t * (3 - 2 * t)   # Übergang am Schritt
bein = np.where((V[:, 0] > 0)[:, None], erg["L"], erg["R"]); N = bein * (1 - t[:, None]) + erg["H"] * t[:, None]
me.vertices.foreach_set("co", N.ravel()); me.update()
print(f"Beinrüstung: Gürtel {Z_GURT:.2f} m, Schritt {Z_SCHRITT:.2f} m, Knöchel {Z_KN:.2f} m, {len(N)} Punkte")
bpy.ops.object.select_all(action="DESELECT"); o.select_set(True); bpy.ops.export_scene.gltf(filepath=os.path.abspath(ziel), export_format="GLB", use_selection=True)
