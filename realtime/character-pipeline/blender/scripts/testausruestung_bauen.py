"""TEST ASSETS: baut einfache Platzhalter-Ausrüstung für die Entwicklung der Pipeline (keine finale Mythara-Grafik!).
Aufruf: blender -b --python blender/scripts/testausruestung_bauen.py
Ergebnis: blender/equipment/test/<id>.blend – je Gegenstand ein oder mehrere Objekte, nach den Modell-Konventionen in mythara_figur/ausruestung.py.
Gehäutete Teile entstehen aus einer nach außen versetzten Hülle des Körpers (ohne Gewichte – die Pipeline bindet sie selbst)."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh, mathutils
from mythara_figur import szene, konfig
V = mathutils.Vector
szene.leeren(); SK = konfig.skelett('warrior_base'); FIG = konfig.figur('krieger_test')
ARM = szene.skelett_laden(SK); REG = szene.koerper_laden(FIG, ARM); SO = szene.sockel_anlegen(SK, ARM); bpy.context.view_layer.update()
AUS = konfig.pfad('blender/equipment/test'); os.makedirs(AUS, exist_ok=True)
NUR = set(sys.argv[sys.argv.index('--') + 1:]) if '--' in sys.argv else set()  # nur diese Teile neu bauen (sonst alle)

def huelle(regionen, filt, dicke):
    """Hülle um Körperregionen (Ruhepose, Welt): nur Flächen, deren Punkte filt erfüllen, entlang der Normalen versetzt."""
    bm = bmesh.new()
    for r in regionen:
        for o in REG[r]:
            me = o.data; mw = o.matrix_world; vs = [bm.verts.new(mw @ v.co) for v in me.vertices]
            for p in me.polygons:
                if all(filt(vs[i].co) for i in p.vertices): bm.faces.new([vs[i] for i in p.vertices])
    for v in [v for v in bm.verts if not v.link_faces]: bm.verts.remove(v)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.002); bm.normal_update()
    for v in bm.verts: v.co += v.normal * dicke
    return bm

def form(art, **k):
    bm = bmesh.new()
    if art == 'kugel': bmesh.ops.create_uvsphere(bm, u_segments=k.get('u', 20), v_segments=k.get('v', 12), radius=1)
    elif art == 'wuerfel': bmesh.ops.create_cube(bm, size=2)
    elif art == 'kegel': bmesh.ops.create_cone(bm, cap_ends=True, segments=k.get('u', 12), radius1=1, radius2=k.get('spitze', 0), depth=2)
    elif art == 'zylinder': bmesh.ops.create_cone(bm, cap_ends=True, segments=k.get('u', 24), radius1=1, radius2=1, depth=2)
    elif art == 'ring': bmesh.ops.create_cone(bm, cap_ends=False, segments=k.get('u', 24), radius1=1, radius2=1, depth=2)
    m = mathutils.Matrix.LocRotScale(V(k.get('ort', (0, 0, 0))), mathutils.Euler([math.radians(a) for a in k.get('dreh', (0, 0, 0))]), V(k.get('mass', (1, 1, 1))))
    bmesh.ops.transform(bm, matrix=m, verts=bm.verts); return bm

def zusammen(*bms):
    aus = bmesh.new(); me = bpy.data.meshes.new('tmp')
    for i, b in enumerate(bms):
        b.to_mesh(me); 
        for p in me.polygons: p.material_index = getattr(b, '_mat', 0)
        aus.from_mesh(me) if i == 0 else None
        if i: 
            t = bmesh.new(); t.from_mesh(me); 
            for f in t.faces: f.material_index = getattr(b, '_mat', 0)
            t.to_mesh(me); aus2 = aus; aus2.from_mesh(me)
    return aus

def mit_mat(bm, i):
    for f in bm.faces: f.material_index = i
    return bm

def objekt(name, bms, materialien, sockel=None):
    """Objekt aus einer oder mehreren Formen; sockel: in den Raum dieses Sockels umrechnen (starre Teile)."""
    me = bpy.data.meshes.new(name); gesamt = bmesh.new()
    for b in bms:
        tmp = bpy.data.meshes.new('t'); b.to_mesh(tmp); gesamt.from_mesh(tmp); bpy.data.meshes.remove(tmp)
    gesamt.to_mesh(me); gesamt.free()
    o = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(o)
    for n in materialien: me.materials.append(bpy.data.materials.get(n) or bpy.data.materials.new(n))
    if len(materialien) > 1: o['mythara_material'] = ','.join(materialien)
    if sockel: me.transform(SO[sockel].matrix_world.inverted())
    for p in me.polygons: p.use_smooth = True
    o['mythara_test_asset'] = True; return o

def speichern(gid, objs):
    if NUR and gid not in NUR: return
    p = os.path.join(AUS, gid + '.blend'); bpy.data.libraries.write(p, set(objs), fake_user=True); print('GESPEICHERT', gid, [o.name for o in objs])

# Maße aus dem Körper
def zonen(r): pts = [o.matrix_world @ v.co for o in REG[r] for v in o.data.vertices]; return pts
kopf = zonen('kopf'); kz0, kz1 = min(p.z for p in kopf), max(p.z for p in kopf); kmitte = sum((p for p in kopf), V()) / len(kopf)
rumpf = zonen('rumpf'); rz0, rz1 = min(p.z for p in rumpf), max(p.z for p in rumpf)
print('MASSE kopf', round(kz0, 3), round(kz1, 3), 'mitte', [round(c, 3) for c in kmitte], 'rumpf', round(rz0, 3), round(rz1, 3))

def faerben(bm, i, wo):
    for f in bm.faces:
        if wo(f.calc_center_median()): f.material_index = i
    return bm

# ---- Kopf ----
h = huelle(['kopf'], lambda p: p.z > kz0 + (kz1 - kz0) * 0.42, 0.035)
nase = form('wuerfel', ort=(0, kmitte.y - (kmitte.y - min(p.y for p in kopf)) - 0.02, kz0 + (kz1 - kz0) * 0.5), mass=(0.03, 0.025, 0.14))
speichern('test_helm_stahl', [objekt('test_helm_stahl', [h, nase], ['stahl'], 'Head')])
h = huelle(['kopf'], lambda p: p.z > kz0 + (kz1 - kz0) * 0.38, 0.045)
faerben(h, 1, lambda c: abs(c.z - (kz0 + (kz1 - kz0) * 0.55)) < 0.025)
hl = form('kegel', u=10, ort=(-0.42, kmitte.y, kz1 - 0.12), dreh=(0, -38, 0), mass=(0.07, 0.07, 0.2)); hr = form('kegel', u=10, ort=(0.42, kmitte.y, kz1 - 0.12), dreh=(0, 38, 0), mass=(0.07, 0.07, 0.2))
speichern('test_helm_schatten', [objekt('test_helm_schatten', [h, hl, hr], ['stahl_dunkel', 'schatten_runen'], 'Head')])
speichern('test_haare_kurz', [objekt('test_haare_kurz', [huelle(['kopf'], lambda p: p.z > kz0 + (kz1 - kz0) * 0.6 and p.y > kmitte.y - 0.15, 0.012)], ['leder'], 'Hair')])
# ---- Brust (gehäutet) ----
for gid, mats, glanz in [('test_brust_stahl', ['stahl'], None), ('test_brust_schatten', ['stahl_dunkel', 'schatten_runen'], 1), ('test_brust_splitter', ['gold', 'splitter_licht'], 1)]:
    b = huelle(['rumpf'], lambda p: True, 0.03)
    if glanz: faerben(b, 1, lambda c: abs(c.x) < 0.06 and c.y < -0.05 and rz0 + 0.25 < c.z < rz1 - 0.12)
    speichern(gid, [objekt(gid, [b], mats)])
# ---- Schultern (starr, zwei Teile) ----
teile = []
for seite, sx, so in [('l', 1, 'Shoulder_Left'), ('r', -1, 'Shoulder_Right')]:
    k = form('kugel', u=16, v=10, ort=(sx * 0.3, 0, 1.17), mass=(0.17, 0.16, 0.11))
    for v in [v for v in k.verts if v.co.z < 1.13]: v.co.z = 1.13 + (v.co.z - 1.13) * 0.25
    teile.append(objekt('test_schulter_stahl_' + seite, [k], ['stahl'], so))
speichern('test_schulter_stahl', teile)
# ---- Arme, Beine, Füße (gehäutet) ----
speichern('test_handschuhe_stahl', [objekt('test_handschuhe_stahl', [huelle(['arm_l', 'arm_r'], lambda p: abs(p.x) > 0.58, 0.028)], ['stahl'])])
speichern('test_beinschutz_stahl', [objekt('test_beinschutz_stahl', [huelle(['bein_l', 'bein_r'], lambda p: 0.2 < p.z < 0.62, 0.025)], ['stahl'])])
speichern('test_stiefel_schwer', [objekt('test_stiefel_schwer', [huelle(['bein_l', 'bein_r'], lambda p: p.z < 0.24, 0.03)], ['leder'])])
# ---- Umhang (gehäutet, am Rumpf): eine gebogene Bahn hinter dem Rücken ----
bm = bmesh.new(); N, M_ = 9, 8; z_oben, z_unten = rz1 - 0.06, 0.42; zeilen = []
for j in range(M_):
    z = z_oben + (z_unten - z_oben) * j / (M_ - 1); band = [p for p in rumpf if abs(p.z - z) < 0.08] or rumpf
    yb = max(p.y for p in band) + 0.05 + 0.06 * j / (M_ - 1); breite = 0.24 + 0.14 * j / (M_ - 1); zeile = []
    for i in range(N):
        u = -1 + 2 * i / (N - 1); zeile.append(bm.verts.new((u * breite, yb - 0.07 * (1 - u * u), z)))
    zeilen.append(zeile)
for j in range(M_ - 1):
    for i in range(N - 1): bm.faces.new([zeilen[j][i], zeilen[j][i + 1], zeilen[j + 1][i + 1], zeilen[j + 1][i]])
bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=0.015)
speichern('test_umhang_rot', [objekt('test_umhang_rot', [bm], ['stoff_rot'])])
# ---- Waffen (starr an Hand_Right, Griff am Ursprung, Klinge entlang +Z) ----
def waffe(gid, klinge, breite, mats):
    griff = form('zylinder', u=10, ort=(0, 0, 0.02), mass=(0.022, 0.022, 0.17)); knauf = form('kugel', u=10, v=6, ort=(0, 0, -0.17), mass=(0.04, 0.04, 0.04))
    parier = form('wuerfel', ort=(0, 0, 0.2), mass=(0.16, 0.03, 0.025)); kl = form('wuerfel', ort=(0, 0, 0.22 + klinge / 2), mass=(breite, 0.012, klinge / 2))
    for v in kl.verts:
        if v.co.z > 0.22 + klinge * 0.92: v.co.x *= 0.15
    for b in (griff, knauf): [setattr(f, 'material_index', 1) for f in b.faces]
    o = objekt(gid, [kl, parier, griff, knauf], mats); o['mythara_material'] = ','.join(mats); return o
speichern('test_zweihaender', [waffe('test_zweihaender', 1.15, 0.045, ['stahl', 'leder'])])
speichern('test_schwert_kurz', [waffe('test_schwert_kurz', 0.68, 0.035, ['stahl', 'leder'])])
# ---- Schild (starr an Hand_Left): in der Ruhepose direkt außen an der linken Hand, Fläche nach außen (+X) ----
s = form('zylinder', u=28, ort=(0.935, -0.02, 1.06), dreh=(0, 90, 0), mass=(0.3, 0.3, 0.025)); buckel = form('kugel', u=12, v=8, ort=(0.965, -0.02, 1.06), mass=(0.03, 0.07, 0.07))
rand = form('ring', u=28, ort=(0.935, -0.02, 1.06), dreh=(0, 90, 0), mass=(0.305, 0.305, 0.03)); [setattr(f, 'material_index', 1) for b in (buckel, rand) for f in b.faces]
speichern('test_schild_rund', [objekt('test_schild_rund', [s, buckel, rand], ['holz', 'stahl'], 'Hand_Left')])

# =====================  Erweiterung: weitere Varianten für den Belastungstest  =====================
# ---- Helm 3: Topfhelm der Wacht (zylindrisch, Sehschlitz, goldenes Kreuz) ----
kb = max(p.x for p in kopf) - min(p.x for p in kopf); ky0 = min(p.y for p in kopf)
topf = form('zylinder', u=24, ort=(0, kmitte.y, kz0 + (kz1 - kz0) * 0.5), mass=(kb / 2 + 0.05, kb / 2 + 0.05, (kz1 - kz0) * 0.53))  # deckt den ganzen (großen) Kopf
deckel = form('kugel', u=24, v=8, ort=(0, kmitte.y, kz0 + (kz1 - kz0) * 1.03), mass=(kb / 2 + 0.05, kb / 2 + 0.05, 0.08))
schlitz = mit_mat(form('wuerfel', ort=(0, ky0 - 0.045, kz0 + (kz1 - kz0) * 0.62), mass=(kb * 0.36, 0.012, 0.018)), 1)
kreuz_v = mit_mat(form('wuerfel', ort=(0, ky0 - 0.05, kz0 + (kz1 - kz0) * 0.5), mass=(0.018, 0.01, 0.13)), 2)
speichern('test_helm_wacht', [objekt('test_helm_wacht', [topf, deckel, schlitz, kreuz_v], ['stahl', 'stahl_dunkel', 'gold'], 'Head')])
# ---- Schultern 2 und 3 ----
for gid, mats, stacheln, lagen in [('test_schulter_schatten', ['stahl_dunkel', 'schatten_runen'], True, 1), ('test_schulter_runen', ['gold', 'splitter_licht'], False, 2)]:
    teile = []
    for seite, sx, so in [('l', 1, 'Shoulder_Left'), ('r', -1, 'Shoulder_Right')]:
        bms = []
        for j in range(lagen):
            k = form('kugel', u=16, v=10, ort=(sx * (0.3 + 0.03 * j), 0, 1.19 - 0.06 * j), mass=(0.19 - 0.02 * j, 0.17, 0.12))
            for v in [v for v in k.verts if v.co.z < 1.15 - 0.06 * j]: v.co.z = 1.15 - 0.06 * j + (v.co.z - 1.15 + 0.06 * j) * 0.25
            bms.append(k)
        if stacheln:
            for d in (-0.07, 0.07): bms.append(mit_mat(form('kegel', u=8, ort=(sx * 0.33, d, 1.33), dreh=(0, sx * -25, 0), mass=(0.035, 0.035, 0.11)), 1))
        else: bms.append(mit_mat(form('kugel', u=10, v=6, ort=(sx * 0.33, -0.12, 1.2), mass=(0.035, 0.02, 0.035)), 1))
        teile.append(objekt(gid + '_' + seite, bms, mats, so))
    speichern(gid, teile)
# ---- Handschuhe 2 (Leder, dünner), Beinschutz 2 (dunkel), Stiefel 2 (Stahl) ----
speichern('test_handschuhe_leder', [objekt('test_handschuhe_leder', [huelle(['arm_l', 'arm_r'], lambda p: abs(p.x) > 0.66, 0.018)], ['leder'])])
speichern('test_beinschutz_dunkel', [objekt('test_beinschutz_dunkel', [huelle(['bein_l', 'bein_r'], lambda p: 0.18 < p.z < 0.66, 0.03)], ['stahl_dunkel'])])
speichern('test_stiefel_stahl', [objekt('test_stiefel_stahl', [huelle(['bein_l', 'bein_r'], lambda p: p.z < 0.28, 0.038)], ['stahl'])])
# ---- Umhang 2: lang und blau ----
bm = bmesh.new(); N, M_ = 9, 10; z_oben, z_unten = rz1 - 0.06, 0.2; zeilen = []
for j in range(M_):
    z = z_oben + (z_unten - z_oben) * j / (M_ - 1); band = [p for p in rumpf if abs(p.z - z) < 0.08] or rumpf
    yb = max(p.y for p in band) + 0.06 + 0.14 * j / (M_ - 1); breite = 0.25 + 0.18 * j / (M_ - 1); zeile = []
    for i in range(N):
        u = -1 + 2 * i / (N - 1); zeile.append(bm.verts.new((u * breite, yb - 0.08 * (1 - u * u), z)))
    zeilen.append(zeile)
for j in range(M_ - 1):
    for i in range(N - 1): bm.faces.new([zeilen[j][i], zeilen[j][i + 1], zeilen[j + 1][i + 1], zeilen[j + 1][i]])
bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=0.015)
speichern('test_umhang_blau_lang', [objekt('test_umhang_blau_lang', [bm], ['stoff_blau'])])
# ---- Einhandwaffen 2 und 3, Zweihandwaffe 2 (alle: Griff am Ursprung, Kopf entlang +Z) ----
def stiel(laenge, r=0.022): return form('zylinder', u=10, ort=(0, 0, laenge / 2 - 0.15), mass=(r, r, laenge / 2))
ax_k = mit_mat(form('wuerfel', ort=(0.07, 0, 0.5), mass=(0.08, 0.012, 0.07)), 0)
for v in ax_k.verts:
    if v.co.x > 0.1: v.co.z = 0.5 + (v.co.z - 0.5) * 1.8
speichern('test_axt_einhand', [objekt('test_axt_einhand', [mit_mat(stiel(0.72), 1), ax_k], ['stahl', 'holz'])])
kolben = form('kugel', u=12, v=8, ort=(0, 0, 0.52), mass=(0.07, 0.07, 0.08)); flansche = [form('wuerfel', ort=(0, 0, 0.52), dreh=(0, 0, w), mass=(0.1, 0.012, 0.06)) for w in (0, 45, 90, 135)]
speichern('test_streitkolben', [objekt('test_streitkolben', [mit_mat(stiel(0.7, 0.02), 1), kolben] + flansche, ['stahl', 'leder'])])
gk = form('wuerfel', ort=(0.12, 0, 1.12), mass=(0.14, 0.014, 0.12))
for v in gk.verts:
    if v.co.x > 0.2: v.co.z = 1.12 + (v.co.z - 1.12) * 2.0
gk2 = form('wuerfel', ort=(-0.08, 0, 1.12), mass=(0.07, 0.014, 0.06))
speichern('test_kriegsaxt', [objekt('test_kriegsaxt', [mit_mat(stiel(1.45, 0.025), 1), gk, gk2], ['stahl_dunkel', 'holz'])])
# ---- Schild 2: Drachenschild (spitz zulaufend), außen an der linken Hand ----
ds = bmesh.new(); pts = [(-0.24, 0.28), (0.24, 0.28), (0.26, 0.05), (0.15, -0.25), (0, -0.42), (-0.15, -0.25), (-0.26, 0.05)]
vs_v = [ds.verts.new((0.93, -0.02 + x, 1.08 + y)) for x, y in pts]; vs_h = [ds.verts.new((0.955, -0.02 + x * 0.98, 1.08 + y * 0.98)) for x, y in pts]
ds.faces.new(vs_v[::-1]); ds.faces.new(vs_h)
for i in range(len(pts)): ds.faces.new([vs_v[i], vs_v[(i + 1) % len(pts)], vs_h[(i + 1) % len(pts)], vs_h[i]])
wap = mit_mat(form('wuerfel', ort=(0.965, -0.02, 1.1), mass=(0.006, 0.05, 0.12)), 1)
speichern('test_schild_drachen', [objekt('test_schild_drachen', [ds, wap], ['stoff_blau', 'gold'], 'Hand_Left')])
