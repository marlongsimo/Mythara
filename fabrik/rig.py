"""Mythara Fabrik – aus einem Körpermodell eine modulare, bewegte Figur bauen.

  python3 fabrik/rig.py <koerper.glb> <ziel.blend> <ausruestung.json>

Erwartet das Modell ausgerichtet wie aus anmalen.py: 1,80 m hoch, Füße auf dem Boden, Blick nach -y, Arme leicht abgespreizt.
Ablauf:
  1. lose Splitter entfernen, Gelenke aus der Form schätzen, Humanoid-Skelett bauen, automatisch gewichten (mit Rückfallweg)
  2. starre Ausrüstung (Schwert, Schild) an ihre Knochen hängen
  3. Rüstungsteile als eigene Hüllen über dem Körper anlegen – sie tragen dieselben Gewichte und laufen deshalb auf demselben Skelett
  4. Bewegungen anlegen: ruhe, laufen, angriff (einhändig), block, angriff2h (beidhändig), treffer, ausweichen – und auf Wunsch angriff_axt, angriff_dolch, tod
Alle Bewegungen bleiben an Ort und Stelle; der Fußpunkt ist der Ursprung. Sie sind gerechnet, nicht aufgenommen (frei von Lizenzfragen).
Koordinaten der Figur: +x = ihre linke Seite, -y = vorn, +z = oben.

Optionen in der Ausrüstungsliste (alle wahlfrei, ohne sie verhält sich die Fabrik wie beim Krieger v004):
  "bewegungen": [...]        nur diese Bewegungen anlegen (Standard: alle sieben)
  "exklusiv": true           jeder Punkt des Körpers gehört höchstens zu einer Hülle (die erste in der Liste gewinnt) – keine doppelten Schichten
  Hülle "gesicht_frei": true das Gesicht bleibt frei (für Kapuzen und Helme mit offenem Gesicht)
  "vorbereitet": [...]       Teile, die gebaut und eingetragen, aber noch nicht an die Figur gehängt werden (z. B. Bogen: braucht eigene Bewegungen)
  "block": "waffe"           Block ohne Schild: Parade mit der Waffe
  "haltung": "zivil"         ohne Kampfstellung: Arme hängen locker, schwingen beim Gehen (Dorfbewohner)
  "haltung": "stab"          Stab aufrecht in der rechten Hand, linker Arm locker (Priesterin, Magier); Bewegungen zauber, segen, nova
  Hülle "vorn": true         nur nach vorn gerichtete Flächen (Schürze)
  Hülle "wahlfrei": true     wird nicht standardmäßig getragen (Kapuze); in Vorschau und Testszene zunächst abgelegt
  Hülle "ueberlage": true    wahlfreie Lage über der übrigen Kleidung (Schürze, Halstuch): zählt nicht bei "exklusiv" und schneidet beim Rendern nichts aus
  starr "art": "umhang"      Umhang aus umhang.py, hängt am Brustknochen hinter dem Rücken ("sitz": Höhe der Oberkante entlang der Brust, Standard 0.85)
  starr "art": "kopf"        sitzt auf dem Kopf (Hut): "sitz" = wie weit die Krempe unter dem Scheitel liegt (Anteil der Kopflänge)
  Waffe "angriff": "<name>"  welche Angriffsbewegung zu dieser Waffe gehört (angriff, angriff_axt, angriff_dolch); Standard: angriff
Bewegungen, die es zusätzlich gibt: angriff_axt, angriff_dolch, angriff_links (Waffe in der linken Hand), zauber, segen, nova, tod (bleibt liegen).
  Waffe "hand": "L"          sitzt in der linken Hand (z. B. Streitkolben neben dem Stab); Platz hand_l
  "haltung": "armbrust"      Armbrust mit Pistolengriff in der rechten Hand (armbrust.py), Bewegungen zielen (halten), schiessen, nachladen
  Waffe "griff2_ort": [x,y,z] Ort der zweiten Hand im Raum der Waffe (Armbrust: unter dem Vorderschaft); sonst auf der Achse ("griff2")
  "linke_hand_am_griff": {"<bewegung>": "alle" | [bilder]}   in diesen Bewegungen (Bildern) greift die linke Hand den Griff der ersten Waffe mit "zweihand": true
  Hülle "hinten": true       nur nach hinten gerichtete Flächen (Umhang)
  Hülle "unten": true        Unterkleidung (Hemd, Hose): wird beim Rendern nicht von abnehmbarer Rüstung ausgestanzt, liegt in der Zeichenreihenfolge zuunterst
  Hülle "seiten_frei": true  seitlich gerichtete Flächen auslassen (Flanken unter anliegenden Armen)
  Hülle "farbe": "#rrggbb"   fester Farbton statt des Tons aus der Zeichnung ("ton") oder der Zeichnung selbst ("bild")
  "luecken_schliessen": true Lagen nehmen auch Punkte in Übergängen (Hüftfalte), die zusammen überwiegend an ihren Knochen hängen – keine Streifen zwischen Hemd und Hose
  "zeichenfolge": true       Baukasten: Rüstungsteile werden nur vom Körper ausgestanzt, die Zeichenreihenfolge (innen nach außen) bestimmt, was vorn liegt –
                             so ist jedes Teil unabhängig austauschbar; Teil "umhang": true liegt von vorn hinter, von hinten vor allen anderen
  "stuecke_behalten": true   lose Stücke des Körpers nicht als Splitter verwerfen (Grundkörper aus mehreren Teilen)
  "teilnetze": [...]          fertige Teile eines Figurenmodells (meshy_teile.py) als eigene Ebenen: {id, platz, glb, beine_mitteln}; Gewichte vom Grundkörper
  "anbau": [...]              Rüstungsteile mit Volumen (anbau.py) als eigene Ebenen: je Teil "teile": [{glb, knochen, lage, versatz, spiegeln,
                             ausrichten (entlang des Knochens), flaeche ("vorn"/"aussen": auf die Körperoberfläche), verlauf (Knochen, zu denen es unten überblendet)}]
  "koerper_textur": true     der Körper behält Material und Textur seines Modells (statt Punktfarben) – Kenney-Haut mit scharfem Gesicht
  "stil": "gemalt"           rendern.py: weiches warmes Licht mit kühlen Randlichtern, Schatten in Falten, helle Kanten (gemalter Look)
  "gelenke": "gelenke.json"  Gelenkorte aus einer Datei (neben der Liste) statt aus der Form geschätzt – Kenney-Körper (kenney_figur.py)
  "arm_radius": 0.1          Rückfallweg der Gewichtung: Armknochen bewegen nur Punkte bis zu diesem Abstand (m) – gegen Flügel aus Robe und Umhang
  "eigenanteil": 0.6         eine Hülle nimmt nur Punkte, die zu mindestens diesem Anteil von ihren eigenen Knochen bewegt werden (sonst falten sich
                             Punkte im Übergang Arm/Rumpf bei Bewegung unter die Körperoberfläche, z. B. Gürtel neben herabhängenden Händen)
"""
import json, math, os, sys
import numpy as np
import bpy, bmesh
from mathutils import Matrix, Quaternion, Vector
from PIL import Image
from scipy import ndimage

quelle, zieldatei, liste = sys.argv[1], sys.argv[2], sys.argv[3]; H = 1.8; AUS = json.load(open(liste))
ARM_RADIUS = float(AUS.get("arm_radius", 99.0))                                                    # nur im Rückfallweg der Gewichtung: wie weit (m) ein Armknochen Punkte mitnimmt; Standard unbegrenzt wie bisher
FIGUR = os.path.dirname(os.path.abspath(liste))                                                    # die Liste liegt im Ordner der Figur oder in einem ihrer Versionsordner
while not os.path.isdir(os.path.join(FIGUR, "referenz")) and os.path.dirname(FIGUR) != FIGUR: FIGUR = os.path.dirname(FIGUR)
ASSETS = os.path.dirname(FIGUR)
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=quelle)
ob = [o for o in bpy.data.objects if o.type == "MESH"][0]; bpy.context.view_layer.objects.active = ob; ob.select_set(True); bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM"); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
for o in list(bpy.data.objects):
    if o is not ob: bpy.data.objects.remove(o)

# ====================================================== 1. Körper, Skelett, Gewichte ======================================================
bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT"); bpy.ops.mesh.remove_doubles(threshold=0.0005)
if not AUS.get("stuecke_behalten"): bpy.ops.mesh.separate(type="LOOSE")                           # Grundkörper aus mehreren Stücken (meshy_teile.py: Rumpf + Originalkopf) bleibt ganz
bpy.ops.object.mode_set(mode="OBJECT")
stuecke = sorted([o for o in bpy.data.objects if o.type == "MESH"], key=lambda o: -len(o.data.vertices)); ob = stuecke[0]; entfernt = [len(o.data.vertices) for o in stuecke[1:]]
for o in stuecke[1:]: bpy.data.objects.remove(o)
ob.name = "koerper"; bpy.context.view_layer.objects.active = ob; ob.select_set(True); bpy.ops.object.shade_smooth(); me = ob.data
print("Stücke:", len(stuecke), "· behalten:", len(me.vertices), "Punkte · entfernt:", entfernt or "nichts")
FARBE = me.color_attributes[0].name if me.color_attributes else None
def material(name):
    mat = bpy.data.materials.new(name); mat.use_nodes = True; nt = mat.node_tree; nt.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.9
    if FARBE: f = nt.nodes.new("ShaderNodeVertexColor"); f.layer_name = FARBE; nt.links.new(f.outputs["Color"], nt.nodes["Principled BSDF"].inputs["Base Color"])
    return mat
if not AUS.get("koerper_textur"): me.materials.clear(); me.materials.append(material("koerper"))   # sonst behält der Körper seine Textur (Kenney-Haut: scharfes Gesicht)
else:                                                                                            # der glTF-Import multipliziert die Textur mit den Punktfarben (dieselbe Farbe ein zweites Mal): Textur direkt anschließen
    for m_ in me.materials:
        if m_ and m_.use_nodes:
            nt_ = m_.node_tree; tx = next((n for n in nt_.nodes if n.type == "TEX_IMAGE"), None); bs = next((n for n in nt_.nodes if n.type == "BSDF_PRINCIPLED"), None)
            if tx and bs: nt_.links.new(tx.outputs["Color"], bs.inputs["Base Color"])

P = np.zeros(len(me.vertices) * 3, np.float32); me.vertices.foreach_get("co", P); P = P.reshape(-1, 3); x, y, z = P[:, 0], P[:, 1], P[:, 2]
def tiefe(maske, sonst=0.0): return float(np.median(y[maske])) if maske.sum() > 20 else sonst
yr = tiefe((np.abs(x) < 0.12) & (z > 0.5 * H) & (z < 0.8 * H)); yk = tiefe((np.abs(x) < 0.08) & (z > 0.9 * H), yr); G = {}
for seite, s in (("L", 1), ("R", -1)):
    bein = (x * s > 0.02) & (z > 0.06 * H) & (z < 0.2 * H); bx = float(np.median(x[bein])); by = tiefe(bein, yr)
    band = np.where((z > 0.42 * H) & (z < 0.62 * H))[0]; hand = band[np.argsort(-x[band] * s)[:300]]; hx, hy, hz = [float(np.mean(P[hand, i])) for i in range(3)]   # die Hand nur in Handhöhe suchen (sonst greift ein ausgestellter Robensaum)
    schulter = Vector((s * 0.2, yr, 0.795 * H)); spitze = Vector((hx, hy, hz)); gelenk = schulter.lerp(spitze, 0.82); ellbogen = schulter.lerp(gelenk, 0.5) + Vector((0, 0.02, 0))
    G[seite] = dict(huefte=Vector((bx, yr, 0.47 * H)), knie=Vector((bx, by - 0.02, 0.26 * H)), knoechel=Vector((bx, by + 0.02, 0.055 * H)), zehe=Vector((bx, by - 0.16, 0.01)), schulter=schulter, ellbogen=ellbogen, hand=gelenk, spitze=spitze)

arm = bpy.data.objects.new("skelett", bpy.data.armatures.new("skelett")); bpy.context.collection.objects.link(arm); bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode="EDIT"); E = arm.data.edit_bones
def knochen(name, kopf, ende, eltern=None, fest=False):
    b = E.new(name); b.head = kopf; b.tail = ende; b.parent = E[eltern] if eltern else None; b.use_connect = fest; return b
ZB = [0.47 * H, 0.56 * H, 0.68 * H, 0.82 * H, 0.87 * H, 1.0 * H]                                   # Höhen von Becken, Bauch, Brust, Hals, Kopf, Scheitel (menschliche Proportionen)
if AUS.get("gelenke"):                                                                           # Gelenke aus einer Datei (z. B. Kenneys eigenes Skelett, kenney_figur.py) statt geschätzt – für andere Proportionen (großer Kopf)
    J = json.load(open(os.path.join(os.path.dirname(os.path.abspath(liste)), AUS["gelenke"]))); ZB = [J[k][2] for k in ("becken", "bauch", "brust", "hals", "kopf", "scheitel")]
    for S in "LR": G[S] = {k: Vector(J[k + "." + S]) for k in ("huefte", "knie", "knoechel", "zehe", "schulter", "ellbogen", "hand", "spitze")}
    print("Gelenke aus", AUS["gelenke"])
knochen("becken", (0, yr, ZB[0]), (0, yr, ZB[1])); knochen("bauch", (0, yr, ZB[1]), (0, yr, ZB[2]), "becken", True); knochen("brust", (0, yr, ZB[2]), (0, yr, ZB[3]), "bauch", True)
knochen("hals", (0, yr, ZB[3]), (0, yk, ZB[4]), "brust", True); knochen("kopf", (0, yk, ZB[4]), (0, yk, ZB[5]), "hals", True)
for S, g in G.items():
    knochen("oberarm." + S, g["schulter"], g["ellbogen"], "brust"); knochen("unterarm." + S, g["ellbogen"], g["hand"], "oberarm." + S, True); knochen("hand." + S, g["hand"], g["spitze"], "unterarm." + S, True)
    knochen("oberschenkel." + S, g["huefte"], g["knie"], "becken"); knochen("unterschenkel." + S, g["knie"], g["knoechel"], "oberschenkel." + S, True); knochen("fuss." + S, g["knoechel"], g["zehe"], "unterschenkel." + S, True)
bpy.ops.object.mode_set(mode="OBJECT"); KN = arm.data.bones; ELTERN = {b.name: (b.parent.name if b.parent else None) for b in KN}
L_OBER = (G["L"]["huefte"] - G["L"]["knie"]).length; L_UNTER = (G["L"]["knie"] - G["L"]["knoechel"]).length

def gewichtet(o): return sum(1 for v in o.data.vertices if any(g.weight > 0.01 for g in v.groups)) / len(o.data.vertices)
def anhaengen(o, art):
    bpy.ops.object.select_all(action="DESELECT"); o.select_set(True); arm.select_set(True); bpy.context.view_layer.objects.active = arm; bpy.ops.object.parent_set(type=art)
# 1. Weg: Wärmeverteilung auf einer geschlossenen Ersatzhülle (das Netz aus dem Bild-zu-3D-Modell hat innere Flächen, daran scheitert sie oft), dann aufs Modell übertragen
huelle = ob.copy(); huelle.data = ob.data.copy(); huelle.name = "ersatz"; bpy.context.collection.objects.link(huelle)
bpy.ops.object.select_all(action="DESELECT"); huelle.select_set(True); bpy.context.view_layer.objects.active = huelle
r = huelle.modifiers.new("neu", "REMESH"); r.mode = "VOXEL"; r.voxel_size = 0.014; bpy.ops.object.modifier_apply(modifier="neu")
anhaengen(huelle, "ARMATURE_AUTO"); weg = None
if gewichtet(huelle) > 0.98:
    for b in KN: ob.vertex_groups.new(name=b.name)
    bpy.ops.object.select_all(action="DESELECT"); ob.select_set(True); bpy.context.view_layer.objects.active = ob
    t = ob.modifiers.new("gewichte", "DATA_TRANSFER"); t.object = huelle; t.use_vert_data = True; t.data_types_verts = {"VGROUP_WEIGHTS"}; t.vert_mapping = "POLYINTERP_NEAREST"; bpy.ops.object.modifier_apply(modifier="gewichte")
    a = ob.modifiers.new("skelett", "ARMATURE"); a.object = arm; ob.parent = arm; weg = "automatisch (Wärmeverteilung über eine Ersatzhülle)"
bpy.data.objects.remove(huelle)
if weg is None or gewichtet(ob) < 0.98:                                                           # 2. Weg: Gewichte nach Abstand zu den Knochen, über das Netz geglättet
    for g in list(ob.vertex_groups): ob.vertex_groups.remove(g)
    A = np.array([b.head_local for b in KN], np.float32); B = np.array([b.tail_local for b in KN], np.float32)
    AB = B - A; t_ = np.clip(((P[:, None, :] - A[None]) * AB[None]).sum(-1) / (AB * AB).sum(-1)[None], 0, 1); D = np.linalg.norm(P[:, None, :] - (A[None] + t_[..., None] * AB[None]), axis=-1)
    W = 1.0 / (D + 0.01) ** 4; W /= W.sum(1, keepdims=True); K = np.zeros((len(me.edges), 2), int); me.edges.foreach_get("vertices", K.ravel())
    for _ in range(12):
        S_ = np.zeros_like(W); N_ = np.zeros(len(W), np.float32); np.add.at(S_, K[:, 0], W[K[:, 1]]); np.add.at(S_, K[:, 1], W[K[:, 0]]); np.add.at(N_, K[:, 0], 1); np.add.at(N_, K[:, 1], 1); W = 0.5 * W + 0.5 * S_ / np.maximum(N_, 1)[:, None]
    ARMK = [k for k, b in enumerate(KN) if b.name.split(".")[0] in ("oberarm", "unterarm", "hand")]   # Armknochen bewegen nur Punkte am Arm selbst – sonst ziehen sie Robe und Umhang zu Flügeln aus
    nah = D[:, ARMK] <= ARM_RADIUS; W[:, ARMK] *= nah; leer = W.sum(1) < 1e-6; W[leer] = (1.0 / (D[leer] + 0.01) ** 4) * np.isin(np.arange(len(KN)), ARMK, invert=True)[None]
    W[W < 0.03] = 0; W /= W.sum(1, keepdims=True)
    for k, b in enumerate(KN):
        g = ob.vertex_groups.new(name=b.name)
        for w in np.unique(np.round(W[:, k][W[:, k] > 0], 2)):
            if w > 0: g.add(np.where(np.round(W[:, k], 2) == w)[0].tolist(), float(w), "REPLACE")
    if not any(m.type == "ARMATURE" for m in ob.modifiers): a = ob.modifiers.new("skelett", "ARMATURE"); a.object = arm
    ob.parent = arm; weg = "nach Abstand zu den Knochen (Rückfall – die Wärmeverteilung ist gescheitert)"
def luecken_fuellen(o):
    """Punkte ohne Gewicht (z. B. an einer Schnittkante) übernehmen die Gewichte ihres nächsten gewichteten Nachbarn – sonst bleiben sie bei jeder Bewegung in der Grundhaltung stehen"""
    from mathutils.kdtree import KDTree
    leer = [v.index for v in o.data.vertices if not any(g.weight > 0.001 for g in v.groups)]
    voll = [v for v in o.data.vertices if any(g.weight > 0.001 for g in v.groups)]
    if not leer or not voll: return 0
    kd = KDTree(len(voll))
    for j, v in enumerate(voll): kd.insert(v.co, j)
    kd.balance()
    for i in leer:
        _, j, _ = kd.find(o.data.vertices[i].co)
        for g in voll[j].groups: o.vertex_groups[g.group].add([i], g.weight, "REPLACE")
    return len(leer)
print("ohne Gewicht, vom Nachbarn übernommen:", luecken_fuellen(ob), "Punkte")
anteil = gewichtet(ob); print("Gewichte:", weg, "·", round(anteil * 100, 1), "% der Punkte gewichtet")
ob["ebene"] = "koerper"; ob["art"] = "koerper"

# ====================================================== 2. starre Ausrüstung ======================================================
def senkrecht(v, zu): v = Vector(v); zu = Vector(zu).normalized(); return (v - v.dot(zu) * zu).normalized()
def rahmen(d, n):
    """Drehmatrix aus einer Richtung und einer zweiten, dazu senkrecht gemachten Richtung"""
    d = Vector(d).normalized(); n = senkrecht(n, d); return Matrix((d, n, d.cross(n))).transposed()
def richtung(name): b = KN[name]; return (b.tail_local - b.head_local).normalized()
def laden(pfad, name):
    vorher = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=os.path.join(ASSETS, pfad)); neu = [o for o in bpy.data.objects if o not in vorher]; m = [o for o in neu if o.type == "MESH"][0]
    bpy.ops.object.select_all(action="DESELECT"); m.select_set(True); bpy.context.view_layer.objects.active = m; bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM"); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    for o in neu:
        if o is not m: bpy.data.objects.remove(o)
    m.name = name; return m
def an_knochen(o, bone, welt):
    o.parent = arm; o.parent_type = "BONE"; o.parent_bone = bone; bpy.context.view_layer.update(); o.matrix_world = welt; bpy.context.view_layer.update()

HAND_R = richtung("hand.R"); KLINGE0 = senkrecht((0, -1, 0.15), HAND_R)
HAND_L = richtung("hand.L"); KLINGE0_L = senkrecht((0, -1, 0.15), HAND_L); LINKS = any(t["art"] == "schwert" and t.get("hand") == "L" for t in AUS["starr"])   # eine Waffe in der linken Hand (Streitkolben neben dem Stab)                             # in der Grundhaltung zeigt die Klinge nach vorn, quer zur Hand (Hammergriff)
UARM_L = richtung("unterarm.L"); SCHILD0 = senkrecht((1, -0.15, 0), UARM_L)                        # der Schild liegt außen am linken Unterarm
for t in AUS["starr"]:
    o = laden(t["glb"], t["id"]); e = [Vector(c) for c in o.bound_box]; oben = max(v.z for v in e); unten = min(v.z for v in e)
    if t["art"] == "schwert":                                                                    # im Bild: Knauf oben, Spitze unten -> die Spitze (-z) zeigt in Klingenrichtung; "hand": "L" = linke Hand
        S_ = t.get("hand", "R"); HD, K0 = (HAND_L, KLINGE0_L) if S_ == "L" else (HAND_R, KLINGE0)
        ez = -K0; ey = K0.cross(HD).normalized(); ex = ey.cross(ez); R = Matrix((ex, ey, ez)).transposed(); griff = Vector((0, 0, oben - t["griff"] * (oben - unten)))
        handflaeche = KN["hand." + S_].head_local.lerp(KN["hand." + S_].tail_local, 0.45); M = Matrix.Translation(handflaeche - R @ griff) @ R.to_4x4(); an_knochen(o, "hand." + S_, M)
        g2 = bpy.data.objects.new("griff2", None); bpy.context.collection.objects.link(g2); g2.parent = o; g2.location = tuple(t["griff2_ort"]) if "griff2_ort" in t else (0, 0, oben - t.get("griff2", 0.4) * (oben - unten)); g2.empty_display_size = 0.03
        if t.get("zweihand"): g2.name = "griff2." + t["id"]      # Platz der zweiten Hand, zum Knauf hin
    elif t["art"] == "umhang":                                                                   # Umhang (umhang.py): Oberkante zwischen den Schulterblättern, hängt am Brustknochen
        sb = KN["brust"]; z0 = sb.head_local.lerp(sb.tail_local, t.get("sitz", 0.85)).z; band = P[np.abs(P[:, 2] - z0) < 0.05]; ruecken = float(band[:, 1].max()) if len(band) else 0.12
        an_knochen(o, "brust", Matrix.Translation(Vector((0, ruecken - 0.02, z0)))); o["umhang"] = True
    elif t["art"] == "kopf":                                                                     # Hut: Achse entlang des Kopfknochens, vorn bleibt vorn; die Krempe sitzt etwas unter dem Scheitel
        kb = KN["kopf"]; ach = richtung("kopf"); ey_ = senkrecht((0, 1, 0), ach); R = Matrix((ey_.cross(ach), ey_, ach)).transposed()
        ort = kb.head_local.lerp(kb.tail_local, 1 - t.get("sitz", 0.32)) + ey_ * t.get("versatz", 0.0); an_knochen(o, "kopf", Matrix.Translation(ort) @ R.to_4x4())
    else:                                                                                        # Schild: Vorderseite (-y) zeigt vom Arm weg, oben zeigt zum Ellbogen
        ey = -SCHILD0; ez = -UARM_L; ex = ey.cross(ez); R = Matrix((ex, ey, ez)).transposed(); dicke = max(v.y for v in e) - min(v.y for v in e)
        mitte = KN["unterarm.L"].head_local.lerp(KN["unterarm.L"].tail_local, 0.55) + SCHILD0 * (0.055 + dicke / 2) - UARM_L * 0.04; an_knochen(o, "unterarm.L", Matrix.Translation(mitte) @ R.to_4x4())
    o["ebene"] = t["id"]; o["platz"] = t["platz"]; o["art"] = "starr"; o["reihe"] = AUS["starr"].index(t); o["angriff"] = t.get("angriff", "angriff"); print("starr:", t["id"], "an", o.parent_bone)
for name, bone in (("punkt.kopf", "kopf"), ("punkt.ruecken", "brust"), ("punkt.huefte", "becken")):   # weitere Befestigungspunkte für später (Helm, Umhang, Scheide)
    p = bpy.data.objects.new(name, None); bpy.context.collection.objects.link(p); p.parent = arm; p.parent_type = "BONE"; p.parent_bone = bone; p.empty_display_size = 0.05

# ====================================================== 3. Rüstungsteile als Hüllen ======================================================
nv = len(me.vertices); GW = {b.name: np.zeros(nv, np.float32) for b in KN}; gname = {g.index: g.name for g in ob.vertex_groups}
for v in me.vertices:
    for g in v.groups:
        if gname[g.group] in GW: GW[gname[g.group]][v.index] = g.weight
NORM = np.zeros(nv * 3, np.float32); me.vertices.foreach_get("normal", NORM); NORM = NORM.reshape(-1, 3)
def linear(c): return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
def farben_lesen(m):
    ca = m.color_attributes[FARBE]; roh = np.zeros(len(ca.data) * 4, np.float32); ca.data.foreach_get("color", roh); roh = roh.reshape(-1, 4)
    if ca.domain == "POINT": return roh[:, :3]
    ecken = np.zeros(len(m.loops), int); m.loops.foreach_get("vertex_index", ecken); aus = np.zeros((len(m.vertices), 3), np.float32); aus[ecken] = roh[:, :3]; return aus
def farben_setzen(m, farbe):
    ca = m.color_attributes[FARBE]; voll = np.concatenate([farbe, np.ones((len(farbe), 1), np.float32)], 1)
    if ca.domain != "POINT": ecken = np.zeros(len(m.loops), int); m.loops.foreach_get("vertex_index", ecken); voll = voll[ecken]
    ca.data.foreach_set("color", voll.astype(np.float32).ravel())
def teilbild(name):
    im = Image.open(os.path.join(FIGUR, "referenz", "teile", name + ".png")).convert("RGBA"); im = im.crop(im.split()[3].point(lambda v: 255 if v > 128 else 0).getbbox()); a = np.asarray(im).astype(np.float32) / 255; return a[..., :3], a[..., 3] > 0.5
KOERPERFARBE = farben_lesen(me) if FARBE else None; volumen = {}; vergeben = np.zeros(nv, bool)
def lage_an(bone): b = KN[bone]; ab = np.array(b.tail_local - b.head_local, np.float32); return ((P - np.array(b.head_local, np.float32)) @ ab) / float(ab @ ab)
for t in AUS["huelle"]:
    wahl = np.zeros(nv, bool)
    for bone, t0, t1 in t["bereich"]:
        lage = lage_an(bone); wahl |= (GW[bone] >= 0.35) & (lage >= t0 - 0.02) & (lage <= t1 + 0.02)
    if AUS.get("luecken_schliessen"):                                                                # Übergänge (Hüftfalte, Achsel): Punkte, die zusammengenommen überwiegend an den Knochen dieser Lage hängen, gehören auch dazu
        summe = sum(GW[b] for b in {bone for bone, _, _ in t["bereich"]}); zw = P[wahl, 2] if wahl.any() else P[:, 2]
        wahl |= (summe >= 0.6) & (P[:, 2] >= zw.min() - 0.03) & (P[:, 2] <= zw.max() + 0.03)
    if t.get("gesicht_frei"): wahl &= ~((lage_an("kopf") < 0.85) & (NORM[:, 1] < -0.35) & (np.abs(P[:, 0]) < 0.085))       # nach vorn gerichtete Punkte vorn am Kopf: das Gesicht
    if t.get("vorn"): wahl &= NORM[:, 1] < -0.15                                                    # nur die Vorderseite (Schürze)
    if t.get("hinten"): wahl &= NORM[:, 1] > 0.15                                                   # nur die Rückseite (Umhang)
    if t.get("seiten_frei"): wahl &= np.abs(NORM[:, 0]) < 0.6                                        # Flanken unter den Armen frei lassen (dicke Arme liegen dort an)
    if AUS.get("eigenanteil"): wahl &= sum(GW[b] for b in {bone for bone, _, _ in t["bereich"]}) >= AUS["eigenanteil"]
    ARM = [b.name for b in KN if b.name.split(".")[0] in ("oberarm", "unterarm", "hand")]
    if not any(bone in ARM for bone, _, _ in t["bereich"]): wahl &= sum(GW[b] for b in ARM) < 0.3          # nennt die Hülle keinen Armknochen, gehören Arm und Hand nicht dazu (herabhängende Hände an der Hüfte)
    if AUS.get("exklusiv") and not t.get("ueberlage"): wahl &= ~vergeben; vergeben |= wahl
    o = ob.copy(); o.data = ob.data.copy(); o.name = t["id"]; bpy.context.collection.objects.link(o); bm = bmesh.new(); bm.from_mesh(o.data); bm.verts.ensure_lookup_table()
    for v in bm.verts: v.co += Vector(NORM[v.index].tolist()) * t["dicke"]                         # ein Stück nach außen: die Hülle liegt über dem Körper, nie darunter
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not wahl[v.index]], context="VERTS"); bm.to_mesh(o.data); bm.free(); m2 = o.data
    if FARBE:
        rgb, maske = teilbild(t["bild"]) if not t["farbe"].startswith("#") else (None, None); Q = np.zeros(len(m2.vertices) * 3, np.float32); m2.vertices.foreach_get("co", Q); Q = Q.reshape(-1, 3)
        if t["farbe"] == "bild":                                                                 # die Zeichnung von vorn auflegen (hinten dieselbe)
            hh, ww = maske.shape; u = np.clip(np.round((Q[:, 0] - Q[:, 0].min()) / np.ptp(Q[:, 0]) * (ww - 1)).astype(int), 0, ww - 1); v_ = np.clip(np.round((1 - (Q[:, 2] - Q[:, 2].min()) / np.ptp(Q[:, 2])) * (hh - 1)).astype(int), 0, hh - 1)
            idx = ndimage.distance_transform_edt(~maske, return_distances=False, return_indices=True); farbe = linear(rgb[idx[0], idx[1]][v_, u])
        elif t["farbe"].startswith("#"):                                                       # fester Farbton (flacher Stil, z. B. Kenney): nur ein Hauch Helligkeitsmuster vom Körper
            h_ = t["farbe"].lstrip("#"); ton = linear(np.array([int(h_[i:i + 2], 16) / 255 for i in (0, 2, 4)], np.float32)); hell = KOERPERFARBE[wahl].mean(1, keepdims=True)
            farbe = ton[None] * np.clip(hell / max(1e-4, float(hell.mean())), 0.85, 1.15)
        else:                                                                                    # Farbton der Zeichnung, Helligkeitsmuster vom Körper darunter
            ton = linear(rgb[maske]).mean(0); alt = KOERPERFARBE[wahl]; hell = alt.mean(1, keepdims=True); farbe = ton[None] * np.clip(hell / max(1e-4, float(hell.mean())), 0.45, 1.8)
        farben_setzen(m2, np.clip(farbe, 0, 1).astype(np.float32))
    m2.materials.clear(); m2.materials.append(material(t["id"])); o["ebene"] = t["id"]; o["platz"] = t["platz"]; o["art"] = "huelle"; o["reihe"] = AUS["huelle"].index(t); o["ueberlage"] = bool(t.get("ueberlage")); o["wahlfrei"] = bool(t.get("wahlfrei")); o["unten"] = bool(t.get("unten"))
    if t["platz"] not in volumen and not t.get("ueberlage"): volumen[t["platz"]] = o; o["volumen"] = True                    # das erste Teil je Platz steht beim Rendern für den Raum, den dieser Platz einnimmt
    print("Hülle:", t["id"], "Platz", t["platz"], "·", len(m2.vertices), "Punkte")

# ---- Anbauteile (anbau.py): Rüstungsteile mit Volumen, fest an ihren Knochen (Waffenrock: vom Becken zu den Oberschenkeln überblendet); beide Seiten bilden eine Ebene
for nr, t in enumerate(AUS.get("anbau", [])):
    stuecke = []
    for tl in t["teile"]:
        o = laden(tl["glb"], t["id"] + "." + tl["knochen"]); kb = KN[tl["knochen"]]; ort = kb.head_local.lerp(kb.tail_local, tl.get("lage", 0.0)) + Vector(tl.get("versatz", (0, 0, 0)))
        if tl.get("spiegeln"): o.data.transform(Matrix.Scale(-1, 4, (1, 0, 0))); o.data.flip_normals()
        R = (Vector((0, 0, 1)).rotation_difference((kb.tail_local - kb.head_local).normalized()).to_matrix().to_4x4()) if tl.get("ausrichten") else Matrix.Identity(4)
        if tl.get("flaeche"):                                                                     # auf die Körperoberfläche setzen: vorn (kleinstes y) oder außen (größtes |x|) im Band um den Ansatzpunkt
            band = P[(np.abs(P[:, 2] - ort.z) < 0.04) & (np.abs(P[:, 0] - ort.x) < 0.09)]
            if len(band) and tl["flaeche"] == "vorn": ort.y = float(band[:, 1].min()) - tl.get("abstand", 0.012)
            if len(band) and tl["flaeche"] == "aussen": ort.x = float(band[:, 0].max() if ort.x > 0 else band[:, 0].min()) + math.copysign(tl.get("abstand", 0.012), ort.x)
        o.data.transform(Matrix.Translation(ort) @ R); o.matrix_world = Matrix.Identity(4)
        g = o.vertex_groups.new(name=tl["knochen"]); Q = [v.co.copy() for v in o.data.vertices]
        if tl.get("verlauf"):                                                                     # oben am Knochen, unten zu gleichen Teilen an den genannten Knochen (Stoff schwingt mit den Beinen)
            z1 = max(q.z for q in Q); z0 = min(q.z for q in Q); gs = [o.vertex_groups.new(name=b) for b in tl["verlauf"]]
            for v in o.data.vertices:
                f = min(1.0, max(0.0, (z1 - v.co.z) / max(1e-4, z1 - z0))) ** 1.2; g.add([v.index], 1 - f, "REPLACE")
                for gg in gs: gg.add([v.index], f / len(gs), "REPLACE")
        else: g.add([v.index for v in o.data.vertices], 1.0, "REPLACE")
        stuecke.append(o)
    bpy.ops.object.select_all(action="DESELECT")
    for o in stuecke: o.select_set(True)
    bpy.context.view_layer.objects.active = stuecke[0]; bpy.ops.object.join(); o = bpy.context.object; o.name = t["id"]
    m = o.modifiers.new("skelett", "ARMATURE"); m.object = arm; o.parent = arm
    o["ebene"] = t["id"]; o["platz"] = t["platz"]; o["art"] = "huelle"; o["reihe"] = 100 + nr; o["ueberlage"] = True; o["wahlfrei"] = bool(t.get("wahlfrei")); o["anbau"] = True
    print("Anbau:", t["id"], "Platz", t["platz"], "·", len(stuecke), "Stücke,", len(o.data.vertices), "Punkte")

# ---- Teilnetze (meshy_teile.py): fertige Teile aus einem Figurenmodell; sie übernehmen die Gewichte vom Grundkörper darunter
for nr, t in enumerate(AUS.get("teilnetze", [])):
    o = laden(t["glb"], t["id"]); bpy.ops.object.select_all(action="DESELECT"); o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT"); bpy.ops.mesh.remove_doubles(threshold=0.0002)   # GLB trennt Ecken an Kanten: zusammenführen (sonst schrumpft beim Glätten jedes Dreieck für sich)
    bpy.ops.mesh.normals_make_consistent(inside=False); bpy.ops.object.mode_set(mode="OBJECT")   # Flächen einheitlich nach außen (Meshy-Netze sind teils verdreht)
    if t.get("glaetten", 0): gl = o.modifiers.new("glatt", "SMOOTH"); gl.factor = 0.5; gl.iterations = int(t.get("glaetten", 0)); bpy.ops.object.modifier_apply(modifier="glatt")
    bpy.ops.object.shade_smooth()
    dt = o.modifiers.new("gewichte", "DATA_TRANSFER"); dt.object = ob; dt.use_vert_data = True; dt.data_types_verts = {"VGROUP_WEIGHTS"}; dt.vert_mapping = "POLYINTERP_NEAREST"
    dt.layers_vgroup_select_src = "ALL"; dt.layers_vgroup_select_dst = "NAME"; bpy.ops.object.datalayout_transfer(modifier="gewichte"); bpy.ops.object.modifier_apply(modifier="gewichte")
    if t.get("beine_mitteln"):                                                                     # Umhang, Waffenrock: folgen dem Mittel beider Beine (sonst reißt das Tuch zwischen den Beinen auseinander)
        G_ = {g.name: g for g in o.vertex_groups}
        for v in o.data.vertices:
            w = {o.vertex_groups[g.group].name: g.weight for g in v.groups}
            for b in ("oberschenkel", "unterschenkel", "fuss"):
                l_, r_ = w.get(b + ".L", 0.0), w.get(b + ".R", 0.0); m_ = (l_ + r_) / 2
                if l_ + r_ > 0:
                    for S in "LR": (G_.get(b + "." + S) or o.vertex_groups.new(name=b + "." + S)).add([v.index], m_, "REPLACE"); G_[b + "." + S] = o.vertex_groups[b + "." + S]
    if t.get("farbe"):                                                                             # eigener Farbton statt des mitgebrachten
        h_ = t["farbe"].lstrip("#"); c_ = [int(h_[i:i + 2], 16) / 255 for i in (0, 2, 4)]; c_ = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in c_]
        for m_ in o.data.materials:
            b_ = next((n for n in m_.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None) if m_ and m_.use_nodes else None
            if b_: b_.inputs["Base Color"].default_value = tuple(c_) + (1,)
    m = o.modifiers.new("skelett", "ARMATURE"); m.object = arm; o.parent = arm
    o["ebene"] = t["id"]; o["platz"] = t["platz"]; o["art"] = "huelle"; o["reihe"] = 50 + nr; o["umhang"] = bool(t.get("umhang")); o["ueberlage"] = False; o["wahlfrei"] = bool(t.get("wahlfrei")); o["volumen"] = True; volumen[t["platz"]] = o
    print("Teilnetz:", t["id"], "Platz", t["platz"], "·", len(o.data.vertices), "Punkte, Gewichte vom Grundkörper")

# ====================================================== 4. Bewegungen ======================================================
bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode="POSE"); PB = arm.pose.bones
for b in PB: b.rotation_mode = "QUATERNION"
X, Y, Z = Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1)); RUHE = {b.name: b.matrix_local.to_quaternion() for b in KN}; RICHT = {b.name: richtung(b.name) for b in KN}; ganz = {}
def setze(name, q):
    """q: Drehung des Knochens im Raum der Figur, gemessen gegen seine Grundhaltung (einschließlich aller Elternknochen)"""
    e = ELTERN[name]; lokal = (ganz[e].inverted() @ q) if e else q; r = RUHE[name]; PB[name].rotation_quaternion = r.inverted() @ lokal @ r; ganz[name] = q
def dreh(name, *schritte):
    """zusätzlich zum Elternknochen um Achsen des Raums drehen (Grad); der erste Schritt wirkt zuerst. +x: Rumpf nach vorn, Bein nach hinten"""
    q = Quaternion()
    for achse, w in schritte: q = Quaternion(achse, math.radians(w)) @ q
    e = ELTERN[name]; setze(name, (ganz[e] @ q) if e else q)
def ziel(name, d, n=None, n0=None):
    """den Knochen in eine Richtung drehen; mit n/n0 zusätzlich eine Querrichtung festlegen (Klinge, Schildfläche)"""
    d = Vector(d).normalized()
    if n is None: setze(name, RICHT[name].rotation_difference(d))
    else: setze(name, (rahmen(d, n) @ rahmen(RICHT[name], n0).transposed()).to_quaternion())
def spur(keys, t):
    """zwischen Stützwerten (t, wert) weich überblenden; wert ist eine Zahl oder ein Tupel"""
    for (t0, a), (t1, b) in zip(keys, keys[1:]):
        if t <= t1 or (t1, b) == keys[-1]:
            f = 0 if t1 == t0 else min(1.0, max(0.0, (t - t0) / (t1 - t0))); f = f * f * (3 - 2 * f)
            return a + (b - a) * f if isinstance(a, (int, float)) else tuple(p + (q - p) * f for p, q in zip(a, b))
spaeter = []   # Beine hängen am Becken: sie werden erst gestellt, wenn der Rumpf steht
def hocke(grad, vor=0.0): spaeter.append(lambda: hocke_(grad, vor))
def schritt(vor_l, t): spaeter.append(lambda: schritt_(vor_l, t))
def hocke_(grad, vor=0.0):
    """in die Knie gehen, die Füße bleiben am Boden; vor: beide Oberschenkel zusätzlich nach vorn (Grad)"""
    w = math.radians(grad); PB["becken"].location = (0, -(L_OBER + L_UNTER) * (1 - math.cos(w)), 0)
    for S in "LR": dreh("oberschenkel." + S, (X, -grad - vor)); dreh("unterschenkel." + S, (X, 2 * grad + vor)); dreh("fuss." + S, (X, -grad))

# Grundhaltung mit Waffen: Schwertarm leicht angewinkelt, Klinge nach vorn oben; Schild seitlich vor dem Körper
BEREIT = dict(o_r=(-0.28, -0.08, -1.0), u_r=(-0.15, -0.6, -0.8), kl=(0.0, -0.7, 0.72), o_l=(0.32, -0.1, -1.0), u_l=(0.2, -0.62, -0.78), sch=(0.75, -0.66, 0.0))
def arme(o_r, u_r, kl, o_l, u_l, sch, kl_l=(0.0, -0.7, 0.72), h_r=(0.0, 0.0, 0.0)):
    """h_r: Richtung der rechten Hand, wenn das Handgelenk abknickt (Armbrust: der Lauf zeigt nach vorn, der Unterarm schräg nach innen); (0, 0, 0) = wie der Unterarm"""
    ziel("oberarm.R", o_r); ziel("unterarm.R", u_r); ziel("hand.R", h_r if any(h_r) else u_r, kl, KLINGE0)   # das Handgelenk führt die Klinge
    ziel("oberarm.L", o_l); ziel("unterarm.L", u_l, sch, SCHILD0)                                   # der Unterarm führt den Schild
    if LINKS: ziel("hand.L", u_l, kl_l, KLINGE0_L)                                                  # Waffe in der linken Hand: das linke Handgelenk führt sie
    else: ziel("hand.L", u_l)
def rumpf(vor=0.0, dreh_z=0.0, kipp=0.0, kopf=0.0, ganz=0.0):
    """ganz: den ganzen Körper ums Becken kippen (Grad; negativ = nach hinten) – nur für den Tod"""
    dreh("becken", *(((X, ganz),) if ganz else ()), (Z, dreh_z * 0.3)); dreh("bauch", (X, vor * 0.5), (Y, kipp * 0.5), (Z, dreh_z * 0.35)); dreh("brust", (X, vor * 0.5), (Y, kipp * 0.5), (Z, dreh_z * 0.35)); dreh("hals", (X, kopf * 0.5), (Z, -dreh_z * 0.3)); dreh("kopf", (X, kopf * 0.5), (Z, -dreh_z * 0.3))
    for f in spaeter: f()
    spaeter.clear()
def mit(basis, **neu): d = dict(basis); d.update(neu); return d
BEREIT["kl_l"] = (0.0, -0.7, 0.72); BEREIT["h_r"] = (0.0, 0.0, 0.0)
def spiegel(v): return (-v[0], v[1], v[2])
def arme_spur(keys, t): arme(**{k: spur([(tt, w[k]) for tt, w in keys], t) for k in BEREIT})

TIEF = bool(AUS.get("arme_tief"))   # weite Ärmel, die mit dem Arm verwachsen sind: Arme nie über die Schulter heben (sonst ziehen die Ärmel zu Bändern aus)
ZIVIL = AUS.get("haltung") == "zivil"; STAB = AUS.get("haltung") == "stab"; ARMBRUST = AUS.get("haltung") == "armbrust"
# Armbrust: der Lauf zeigt in Richtung der Hand (Pistolengriff, die Klinge der Schwert-Logik ist hier das Griffende und zeigt nach unten).
# Bereit: Armbrust tief an der rechten Hüfte, nach vorn unten; Anschlag: Ellbogen seitlich angehoben, Unterarm und Lauf waagerecht nach vorn. Die linke Hand liegt am Vorderschaft (umgekehrte Kinematik, unten).
if ARMBRUST: BEREIT.update(o_r=(-0.1, -0.62, -0.78), u_r=(0.42, -0.85, 0.32), h_r=(0.15, -0.8, -0.58), kl=(0.0, 0.0, -1.0), o_l=(-0.2, -0.45, -0.87), u_l=(-0.5, -0.8, 0.3))   # Unterarm quer vor dem Bauch, Lauf nach vorn unten
ANSCHLAG = mit(BEREIT, o_r=(-0.08, -0.64, -0.77), u_r=(0.6, -0.64, 0.49), h_r=(0.1, -0.99, 0.0), kl=(0.0, 0.0, -1.0), o_l=(-0.3, -0.8, -0.5), u_l=(-0.4, -0.9, 0.15))   # Hand vor dem Kinn, Lauf waagerecht
if STAB: BEREIT.update(o_r=(-0.2, -0.05, -0.98), u_r=(-0.08, -0.95, -0.25), kl=(0.0, 0.05, 1.0), o_l=(0.22, -0.02, -0.98), u_l=(0.15, -0.3, -0.94)) if not LINKS else BEREIT.update(o_r=(-0.2, -0.05, -0.98), u_r=(-0.08, -0.95, -0.25), kl=(0.0, 0.05, 1.0), o_l=(0.24, -0.05, -0.97), u_l=(0.12, -0.75, -0.65))   # Unterarm waagerecht nach vorn, der Stab steht senkrecht (er liegt quer in der Faust)
if ZIVIL: BEREIT.update(o_r=(-0.2, 0.0, -1.0), u_r=(-0.12, -0.22, -0.97), kl=(0.0, -0.7, 0.72), o_l=(0.2, 0.0, -1.0), u_l=(0.12, -0.22, -0.97))   # Arme hängen locker
def ruhe(i, n):
    s = math.sin(2 * math.pi * i / n); PB["becken"].location = (0, -0.004 * (1 - math.cos(2 * math.pi * i / n)), 0); rumpf(vor=2 + 1.2 * s, kopf=-1.5 * s, dreh_z=-15 if ARMBRUST else 0.0)
    for S in "LR": dreh("oberschenkel." + S); dreh("unterschenkel." + S, (X, 2)); dreh("fuss." + S)
    if ZIVIL: arme(**mit(BEREIT, o_r=(-0.2, 0.01 * s, -1.0), o_l=(0.2, -0.01 * s, -1.0))); return
    if STAB: arme(**mit(BEREIT, o_l=(0.22, -0.02 + 0.01 * s, -0.98))); return
    if ARMBRUST: arme(**mit(BEREIT, u_r=(0.42, -0.85, 0.32 + 0.02 * s))); return
    arme(**mit(BEREIT, u_r=(-0.15, -0.6, -0.8 + 0.02 * s), u_l=(0.2, -0.62, -0.78 + 0.02 * s)))
def laufen(i, n):
    p = 2 * math.pi * i / n; s, c = math.sin(p), math.cos(p); PB["becken"].location = (0, 0.022 * math.cos(2 * p) - 0.022, 0); rumpf(vor=4, dreh_z=9 * s - (15 if ARMBRUST else 0))
    for S, v in (("L", 1), ("R", -1)): dreh("oberschenkel." + S, (X, -26 * s * v + 3)); dreh("unterschenkel." + S, (X, 6 + 42 * max(0.0, c * v) ** 1.3)); dreh("fuss." + S, (X, -8 * s * v))
    if STAB: arme(**mit(BEREIT, o_r=(-0.25, -0.15 + 0.05 * s, -0.96), o_l=(0.18, -0.32 * s, -0.95), u_l=(0.1, -0.25 - 0.3 * s, -0.95))); return   # der Stab bleibt ruhig, der linke Arm schwingt
    if ARMBRUST: arme(**mit(BEREIT, o_r=(-0.1, -0.62 + 0.04 * s, -0.78))); return                              # die Armbrust bleibt ruhig in beiden Händen
    if ZIVIL: arme(**mit(BEREIT, o_r=(-0.18, 0.32 * s, -0.95), u_r=(-0.1, -0.25 + 0.3 * s, -0.95), o_l=(0.18, -0.32 * s, -0.95), u_l=(0.1, -0.25 - 0.3 * s, -0.95))); return   # Arme schwingen gegen die Beine
    arme(**mit(BEREIT, o_r=(-0.28, -0.08 + 0.18 * s, -1.0), u_r=(-0.15, -0.6 + 0.12 * s, -0.8), o_l=(0.32, -0.1 - 0.18 * s, -1.0), u_l=(0.2, -0.62 - 0.12 * s, -0.78)))
def gehen(i, n):
    """ruhiges Gehen: kleinere Schritte als beim Laufen, Oberkörper aufrecht, Waffe und Schild bleiben in Bereitschaft"""
    p = 2 * math.pi * i / n; s, c = math.sin(p), math.cos(p); PB["becken"].location = (0, 0.01 * math.cos(2 * p) - 0.01, 0); rumpf(vor=2, dreh_z=5 * s)
    for S, v in (("L", 1), ("R", -1)): dreh("oberschenkel." + S, (X, -16 * s * v + 2)); dreh("unterschenkel." + S, (X, 4 + 24 * max(0.0, c * v) ** 1.3)); dreh("fuss." + S, (X, -5 * s * v))
    arme(**mit(BEREIT, o_r=(-0.28, -0.08 + 0.08 * s, -1.0), o_l=(0.32, -0.1 - 0.08 * s, -1.0)))
def schritt_(vor_l, t):
    """Ausfallschritt: linkes Bein vor, rechtes zurück (Grad), leicht in die Knie"""
    PB["becken"].location = (0, -0.03 * t, 0); dreh("oberschenkel.L", (X, -vor_l * t)); dreh("unterschenkel.L", (X, vor_l * 0.9 * t)); dreh("fuss.L", (X, 0)); dreh("oberschenkel.R", (X, vor_l * 0.6 * t)); dreh("unterschenkel.R", (X, 6 * t)); dreh("fuss.R", (X, -vor_l * 0.5 * t))
def angriff(i, n):
    t = i / (n - 1); w = spur([(0, 0.0), (0.3, 1.0), (0.65, 1.0), (1, 0.0)], t); schritt(16, w); rumpf(vor=spur([(0, 2.0), (0.3, -4.0), (0.65, 14.0), (1, 2.0)], t), dreh_z=spur([(0, 0.0), (0.3, -28.0), (0.5, 5.0), (0.65, 26.0), (0.82, 30.0), (1, 0.0)], t))
    arme_spur([(0, BEREIT), (0.3, mit(BEREIT, o_r=(-0.65, 0.35, 0.3), u_r=(-0.2, 0.45, 0.9), kl=(0.1, 0.75, 0.65))),                      # ausholen: Arm hoch und zurück, Klinge hinter dem Kopf
               (0.5, mit(BEREIT, o_r=(-0.35, -0.75, 0.3), u_r=(-0.15, -0.9, 0.35), kl=(0.05, -0.45, 0.9))),                              # Hieb von oben
               (0.65, mit(BEREIT, o_r=(-0.15, -0.85, -0.45), u_r=(0.1, -0.9, -0.4), kl=(0.25, -0.92, -0.3))),                            # Treffer: Arm gestreckt nach vorn unten
               (0.82, mit(BEREIT, o_r=(0.0, -0.6, -0.8), u_r=(0.35, -0.6, -0.7), kl=(0.7, -0.55, -0.45))), (1, BEREIT)], t)              # durchziehen zur linken Seite
def angriff_links(i, n):
    """Hieb mit der Waffe in der linken Hand (Streitkolben), gespiegelt zum Einhandangriff; die rechte Hand hält den Stab ruhig"""
    t = i / (n - 1); w = spur([(0, 0.0), (0.3, 1.0), (0.65, 1.0), (1, 0.0)], t); schritt(14, w); rumpf(vor=spur([(0, 2.0), (0.3, -4.0), (0.65, 14.0), (1, 2.0)], t), dreh_z=-spur([(0, 0.0), (0.3, -28.0), (0.5, 5.0), (0.65, 26.0), (0.82, 30.0), (1, 0.0)], t))
    L = lambda o, u, k: mit(BEREIT, o_l=spiegel(o), u_l=spiegel(u), kl_l=spiegel(k))
    arme_spur([(0, BEREIT), (0.3, L((-0.65, 0.35, 0.3), (-0.2, 0.45, 0.9), (0.1, 0.75, 0.65))), (0.5, L((-0.35, -0.75, 0.3), (-0.15, -0.9, 0.35), (0.05, -0.45, 0.9))),
               (0.65, L((-0.15, -0.85, -0.45), (0.1, -0.9, -0.4), (0.25, -0.92, -0.3))), (0.82, L((0.0, -0.6, -0.8), (0.35, -0.6, -0.7), (0.7, -0.55, -0.45))), (1, BEREIT)], t)
BLOCK = mit(BEREIT, o_l=(0.12, -0.72, -0.6), u_l=(-0.82, -0.32, 0.42), sch=(0.05, -1.0, 0.08), o_r=(-0.4, 0.22, -0.9), u_r=(-0.3, -0.25, -0.9), kl=(-0.25, -0.25, 0.94))   # Unterarm quer vor der Brust, Schildfläche nach vorn
PARADE = mit(BEREIT, o_r=(-0.35, -0.6, 0.15), u_r=(0.5, -0.55, 0.65), kl=(0.95, -0.15, 0.25), o_l=(0.35, -0.2, -0.9), u_l=(0.2, -0.75, -0.6))   # ohne Schild: Waffe quer vor Kopf und Brust
def block(i, n):
    t = min(1.0, i / 2); feder = 0.0 if i < 3 else (3.0 if i == 3 else (1.0 if i == 4 else 0.0)); hocke(13 * t + feder); rumpf(vor=7 * t + feder, dreh_z=10 * t)
    arme_spur([(0, BEREIT), (1, PARADE if AUS.get("block") == "waffe" else BLOCK)], t)
def angriff2h(i, n):
    t = i / (n - 1); w = spur([(0, 0.0), (0.35, 0.6), (0.65, 1.0), (1, 0.0)], t); schritt(18, w); rumpf(vor=spur([(0, 2.0), (0.35, -12.0), (0.65, 24.0), (1, 2.0)], t), dreh_z=spur([(0, 0.0), (0.35, -8.0), (0.65, 8.0), (1, 0.0)], t))
    arme_spur([(0, BEREIT), (0.35, mit(BEREIT, o_r=(0.15, -0.2, 0.95), u_r=(0.5, 0.35, 0.8), kl=(0.0, 0.8, 0.6), o_l=(0.2, -0.3, 0.9), u_l=(-0.3, 0.3, 0.9))),    # beide Hände über dem Kopf, zur Körpermitte hin
               (0.5, mit(BEREIT, o_r=(0.2, -0.8, 0.5), u_r=(0.5, -0.85, 0.2), kl=(0.0, -0.35, 0.94), o_l=(0.2, -0.8, 0.4), u_l=(-0.3, -0.9, 0.2))),
               (0.65, mit(BEREIT, o_r=(0.25, -0.8, -0.5), u_r=(0.55, -0.75, -0.4), kl=(0.0, -0.96, -0.28), o_l=(0.15, -0.8, -0.5), u_l=(-0.25, -0.85, -0.45))),    # Hieb gerade nach unten
               (1, BEREIT)], t)
def schildstoss(i, n):
    """Schildstoß: Schild vor die Brust ziehen, mit Ausfallschritt und eingedrehter linker Schulter nach vorn stoßen (Trefferbild), zurück"""
    t = i / (n - 1); w = spur([(0, 0.0), (0.3, 0.3), (0.57, 1.0), (0.75, 0.8), (1, 0.0)], t); schritt(22, w)
    rumpf(vor=spur([(0, 2.0), (0.3, -2.0), (0.57, 12.0), (1, 2.0)], t), dreh_z=spur([(0, 0.0), (0.3, 10.0), (0.57, -20.0), (0.75, -16.0), (1, 0.0)], t))
    stoss = mit(BLOCK, o_l=(0.1, -0.92, -0.35), u_l=(-0.8, -0.45, 0.38), sch=(0.05, -1.0, 0.1))
    arme_spur([(0, BEREIT), (0.3, BLOCK), (0.57, stoss), (0.75, stoss), (1, BEREIT)], t)
def kampfschrei(i, n):
    """Kampfschrei: Brust raus, Schwert senkrecht nach oben gereckt, Schild zur Seite, Kopf in den Nacken – kurz halten, zurück"""
    t = i / (n - 1); w = spur([(0, 0.0), (0.4, 1.0), (0.8, 1.0), (1, 0.0)], t); hocke(10 * w)
    rumpf(vor=2 - 14 * w, dreh_z=-6 * w, kopf=-16 * w)
    hoch = mit(BEREIT, o_r=(-0.4, -0.55, 0.73), u_r=(-0.15, -0.97, 0.2), kl=(0.0, 0.1, 1.0), o_l=(0.85, -0.3, -0.42), u_l=(0.7, -0.62, 0.25), sch=(0.75, -0.66, 0.0))
    arme_spur([(0, BEREIT), (0.4, hoch), (0.8, hoch), (1, BEREIT)], t)
def treffer(i, n):
    t = i / (n - 1); w = spur([(0, 0.0), (0.3, 1.0), (1, 0.0)], t); hocke(7 * w); rumpf(vor=2 - 20 * w, dreh_z=-14 * w, kopf=-12 * w)
    arme_spur([(0, BEREIT), (0.3, mit(BEREIT, o_r=(-0.6, 0.15, -0.8), u_r=(-0.5, -0.3, -0.8), kl=(-0.3, -0.5, 0.8), o_l=(0.6, 0.1, -0.8), u_l=(0.5, -0.35, -0.8))), (1, BEREIT)], t)
def ausweichen(i, n):
    t = i / (n - 1); w = spur([(0, 0.0), (0.4, 1.0), (0.6, 1.0), (1, 0.0)], t); hocke(36 * w, vor=6 * w); rumpf(vor=2 + 26 * w, dreh_z=24 * w, kipp=14 * w, kopf=-14 * w)
    arme_spur([(0, BEREIT), (0.5, mit(BEREIT, o_l=(0.15, -0.6, -0.7), u_l=(-0.6, -0.45, 0.5), sch=(0.1, -0.9, 0.4), o_r=(-0.45, 0.3, -0.85), u_r=(-0.4, -0.1, -0.9), kl=(-0.3, 0.2, 0.93))), (1, BEREIT)], t)

def angriff_axt(i, n):
    """Axt: schwer und langsam – weit über die Schulter ausholen, schräg von oben nach unten durchziehen, mit Ausfallschritt und Drehung"""
    t = i / (n - 1); w = spur([(0, 0.0), (0.4, 0.5), (0.71, 1.0), (1, 0.0)], t); schritt(20, w)
    rumpf(vor=spur([(0, 2.0), (0.4, -8.0), (0.71, 20.0), (0.86, 16.0), (1, 2.0)], t), dreh_z=spur([(0, 0.0), (0.4, -38.0), (0.71, 20.0), (0.86, 28.0), (1, 0.0)], t))
    arme_spur([(0, BEREIT), (0.4, mit(BEREIT, o_r=(-0.5, 0.3, 0.8), u_r=(-0.15, 0.6, 0.78), kl=(0.05, 0.85, -0.5))),                  # ausholen: Axtkopf hinter der Schulter
               (0.55, mit(BEREIT, o_r=(-0.3, -0.7, 0.6), u_r=(0.0, -0.9, 0.45), kl=(0.1, -0.2, 0.97))),                               # Kopf über die Schulter nach vorn
               (0.71, mit(BEREIT, o_r=(-0.1, -0.92, -0.38), u_r=(0.2, -0.88, -0.43), kl=(0.25, -0.78, -0.57))),                       # Treffer: Arm gestreckt nach vorn, Axtkopf schräg nach unten
               (0.86, mit(BEREIT, o_r=(0.1, -0.6, -0.8), u_r=(0.45, -0.5, -0.74), kl=(0.6, -0.3, -0.74))), (1, BEREIT)], t)
def angriff_dolch(i, n):
    """Dolch: schnell – Arm zurückziehen, gerader Stich nach vorn mit tiefem Ausfallschritt, zurück"""
    t = i / (n - 1); w = spur([(0, 0.0), (0.3, 0.3), (0.5, 1.0), (0.75, 0.7), (1, 0.0)], t); schritt(24, w)
    rumpf(vor=spur([(0, 2.0), (0.3, 0.0), (0.5, 16.0), (1, 2.0)], t), dreh_z=spur([(0, 0.0), (0.3, -24.0), (0.5, 14.0), (1, 0.0)], t))
    arme_spur([(0, BEREIT), (0.3, mit(BEREIT, o_r=(-0.45, 0.45, -0.77), u_r=(-0.1, -0.15, -0.98), kl=(0.0, -0.8, 0.6))),               # zurückgezogen, Klinge nach vorn
               (0.5, mit(BEREIT, o_r=(-0.12, -0.96, -0.25), u_r=(0.05, -0.99, -0.1), kl=(0.05, -0.99, 0.05))),                         # Stich: Arm und Klinge gestreckt nach vorn
               (0.75, mit(BEREIT, o_r=(-0.25, -0.75, -0.6), u_r=(-0.05, -0.8, -0.6), kl=(0.0, -0.9, 0.4))), (1, BEREIT)], t)
def zauber(i, n):
    """Heilung: Stab zurück, dann mit Stab und offener linker Hand nach vorn zum Ziel, kurz halten, zurück"""
    t = i / (n - 1); w = spur([(0, 0.0), (0.35, 0.3), (0.6, 1.0), (0.8, 1.0), (1, 0.0)], t); schritt(10, w)
    rumpf(vor=spur([(0, 2.0), (0.35, -6.0), (0.6, 5.0), (0.8, 5.0), (1, 2.0)], t), dreh_z=spur([(0, 0.0), (0.35, -12.0), (0.6, 6.0), (1, 0.0)], t))
    arme_spur([(0, BEREIT), (0.35, mit(BEREIT, o_r=(-0.4, 0.15, -0.9), u_r=(-0.2, -0.3, 0.93), kl=(0.0, 0.3, 0.95))),
               (0.6, mit(BEREIT, o_r=(-0.18, -0.85, -0.25), u_r=(-0.05, -0.97, 0.15), kl=(0.0, -0.45, 0.89), o_l=(0.22, -0.8, -0.35), u_l=(0.08, -0.97, -0.05))),   # Stab und Hand zum Ziel (Arme etwas unter der Waagerechten: die weiten Ärmel ziehen sonst durch die Taille)
               (0.8, mit(BEREIT, o_r=(-0.18, -0.85, -0.25), u_r=(-0.05, -0.97, 0.15), kl=(0.0, -0.45, 0.89), o_l=(0.22, -0.8, -0.35), u_l=(0.08, -0.97, -0.05))), (1, BEREIT)], t)
def segen(i, n):
    """Schutzsegen: leicht in die Knie, dann beide Arme weit nach oben, der Stab senkrecht über die Schulter gehoben"""
    t = i / (n - 1); hocke(spur([(0, 0.0), (0.25, 14.0), (0.55, 0.0), (1, 0.0)], t)); rumpf(vor=spur([(0, 2.0), (0.25, 10.0), (0.55, -6.0), (0.8, -6.0), (1, 2.0)], t), kopf=spur([(0, 0.0), (0.55, -10.0), (1, 0.0)], t))
    hoch = mit(BEREIT, o_r=(-0.45, -0.2, 0.85), u_r=(-0.12, -0.25, 0.96), kl=(0.0, 0.0, 1.0), o_l=(0.6, -0.3, 0.7), u_l=(0.5, -0.45, 0.75))
    arme_spur([(0, BEREIT), (0.25, mit(BEREIT, o_l=(0.3, -0.6, -0.7), u_l=(0.2, -0.8, -0.5))), (0.55, hoch), (0.8, hoch), (1, BEREIT)], t)
def nova(i, n):
    """Lichtnova: tief in die Knie, Stab nach unten, dann aufrichten und den Stab mit gestrecktem Arm senkrecht über den Kopf stoßen"""
    t = i / (n - 1); hocke(spur([(0, 0.0), (0.3, 28.0), (0.6, 0.0), (1, 0.0)], t)); rumpf(vor=spur([(0, 2.0), (0.3, 18.0), (0.6, -4.0), (0.85, -4.0), (1, 2.0)], t), kopf=spur([(0, 0.0), (0.3, 10.0), (0.6, -14.0), (1, 0.0)], t))
    oben = mit(BEREIT, o_r=(-0.12, -0.1, 0.99), u_r=(-0.05, -0.08, 1.0), kl=(0.0, -0.05, 1.0), o_l=(0.88, -0.2, 0.3), u_l=(0.85, -0.3, 0.4))
    arme_spur([(0, BEREIT), (0.3, mit(BEREIT, o_r=(-0.35, -0.4, -0.85), u_r=(-0.2, -0.75, -0.6), kl=(0.0, -0.4, -0.92), o_l=(0.3, -0.5, -0.8), u_l=(0.15, -0.8, -0.55))), (0.6, oben), (0.85, oben), (1, BEREIT)], t)
# ---- Magier (Stabhaltung): Kampfstellung und Elementarzauber. Die Zaubereffekte selbst sind eigene, wiederverwendbare Bilder (effekte.py), nicht Teil der Figur.
def stabhaltung(i, n):
    """Kampfstellung: Stab schräg nach vorn, Kopf voraus, linke Hand offen vor dem Körper, leichtes Wiegen"""
    s = math.sin(2 * math.pi * i / n); hocke(9 + 1.5 * s); rumpf(vor=6 + 1.5 * s, dreh_z=-8, kopf=-2 * s)
    arme(**mit(BEREIT, o_r=(-0.25, -0.35, -0.9), u_r=(-0.05, -0.97, 0.2), kl=(0.0, -0.45, 0.89), o_l=(0.3, -0.45, -0.84), u_l=(0.1, -0.95, 0.12 + 0.04 * s)))
def geschoss(i, n):
    """magisches Geschoss: Stab kurz zurück, dann mit dem Kopf voran zum Ziel stoßen (Trefferbild = Abschuss), zurück"""
    t = i / (n - 1); w = spur([(0, 0.0), (0.35, 0.3), (0.57, 1.0), (0.75, 0.8), (1, 0.0)], t); schritt(12, w)
    rumpf(vor=spur([(0, 2.0), (0.35, -5.0), (0.57, 9.0), (1, 2.0)], t), dreh_z=spur([(0, 0.0), (0.35, -14.0), (0.57, 8.0), (1, 0.0)], t))
    stoss = mit(BEREIT, o_r=(-0.15, -0.9, -0.1), u_r=(-0.05, -0.98, 0.12), kl=(0.0, -0.85, 0.5), o_l=(0.3, -0.3, -0.9), u_l=(0.15, -0.7, -0.7))
    arme_spur([(0, BEREIT), (0.35, mit(BEREIT, o_r=(-0.4, 0.2, -0.9), u_r=(-0.2, -0.3, 0.93), kl=(0.0, 0.35, 0.94))), (0.57, stoss), (0.75, stoss), (1, BEREIT)], t)
def frosthauch(i, n):
    """Frosthauch: die linke Hand zieht an die Brust und stößt dann flach nach vorn (der Kegel kommt aus der Hand), der Stab bleibt hinten"""
    t = i / (n - 1); w = spur([(0, 0.0), (0.3, 0.2), (0.57, 1.0), (0.8, 1.0), (1, 0.0)], t); schritt(14, w)
    rumpf(vor=spur([(0, 2.0), (0.3, 0.0), (0.57, 10.0), (0.8, 10.0), (1, 2.0)], t), dreh_z=spur([(0, 0.0), (0.3, 12.0), (0.57, -16.0), (0.8, -16.0), (1, 0.0)], t))
    vor = mit(BEREIT, o_l=(0.12, -0.95, -0.2), u_l=(0.0, -1.0, 0.05), o_r=(-0.3, 0.15, -0.94), u_r=(-0.15, -0.6, -0.78))
    if TIEF: vor = mit(vor, o_l=(0.15, -0.78, -0.6), u_l=(0.02, -0.98, 0.18))
    arme_spur([(0, BEREIT), (0.3, mit(BEREIT, o_l=(0.35, -0.1, -0.93), u_l=(-0.45, -0.55, 0.7))), (0.57, vor), (0.8, vor), (1, BEREIT)], t)
def donnerwelle(i, n):
    """Donnerwelle: Stab und linke Hand hoch über den Kopf, dann den Stab nach vorn unten schlagen (Trefferbild = Einschlag), in die Knie"""
    t = i / (n - 1); hocke(spur([(0, 0.0), (0.35, 0.0), (0.57, 22.0), (0.8, 18.0), (1, 0.0)], t))
    rumpf(vor=spur([(0, 2.0), (0.35, -10.0), (0.57, 22.0), (0.8, 18.0), (1, 2.0)], t), kopf=spur([(0, 0.0), (0.35, -12.0), (0.57, 6.0), (1, 0.0)], t))
    hoch = mit(BEREIT, o_r=(-0.3, -0.25, 0.92), u_r=(-0.1, -0.2, 0.97), kl=(0.0, 0.1, 1.0), o_l=(0.45, -0.3, 0.84), u_l=(0.3, -0.3, 0.9))
    if TIEF: hoch = mit(BEREIT, o_r=(-0.35, -0.55, -0.25), u_r=(-0.1, -0.6, 0.8), kl=(0.0, 0.2, 1.0), o_l=(0.3, -0.4, -0.86), u_l=(0.2, -0.85, -0.45))   # weite Ärmel: Arme unter der Schulter, nur der Stab geht hoch
    schlag = mit(BEREIT, o_r=(-0.15, -0.85, -0.5), u_r=(-0.05, -0.92, -0.38), kl=(0.0, -0.78, -0.4), o_l=(0.3, -0.6, -0.74), u_l=(0.2, -0.85, -0.5))
    arme_spur([(0, BEREIT), (0.35, hoch), (0.57, schlag), (0.8, schlag), (1, BEREIT)], t)
def glutsphaere(i, n):
    """Glutsphäre: beide Hände sammeln die Glut vor der rechten Brust, dann wirft die linke Hand sie weit nach vorn oben, der Stab folgt"""
    t = i / (n - 1); w = spur([(0, 0.0), (0.35, 0.3), (0.57, 1.0), (0.8, 0.8), (1, 0.0)], t); schritt(16, w)
    rumpf(vor=spur([(0, 2.0), (0.35, -4.0), (0.57, 12.0), (1, 2.0)], t), dreh_z=spur([(0, 0.0), (0.35, 22.0), (0.57, -18.0), (0.8, -18.0), (1, 0.0)], t))
    sammeln = mit(BEREIT, o_r=(-0.35, -0.3, -0.89), u_r=(0.2, -0.9, 0.38), kl=(0.0, -0.3, 0.95), o_l=(0.1, -0.4, -0.91), u_l=(-0.75, -0.6, 0.27))
    wurf = mit(BEREIT, o_r=(-0.2, -0.75, -0.6), u_r=(-0.05, -0.95, 0.3), kl=(0.0, -0.6, 0.8), o_l=(0.1, -0.9, 0.42) if not TIEF else (0.12, -0.85, -0.5), u_l=(0.0, -0.9, 0.44) if not TIEF else (0.0, -0.98, 0.15))
    arme_spur([(0, BEREIT), (0.35, sammeln), (0.57, wurf), (0.8, wurf), (1, BEREIT)], t)
def zielen(i, n):
    """Armbrust in Anschlag bringen und halten (letztes Bild wird gehalten, solange gezielt wird)"""
    t = min(1.0, i / max(1, n - 2)); hocke(6 * t); rumpf(vor=2 - 2 * t, dreh_z=-15 - 12 * t, kopf=8 * t); arme_spur([(0, BEREIT), (1, ANSCHLAG)], t)
def schiessen(i, n):
    """anlegen, abdrücken (Trefferbild), Rückstoß, kurz im Anschlag bleiben, absetzen"""
    t = i / (n - 1); a = spur([(0, 0.0), (0.3, 1.0), (0.85, 1.0), (1, 0.0)], t); rueck = spur([(0, 0.0), (0.43, 0.0), (0.55, 1.0), (0.75, 0.0), (1, 0.0)], t)
    hocke(6 * a); rumpf(vor=2 - 2 * a - 6 * rueck, dreh_z=-15 - 12 * a, kopf=8 * a - 4 * rueck)
    arme_spur([(0, BEREIT), (0.3, ANSCHLAG), (0.43, ANSCHLAG), (0.55, mit(ANSCHLAG, h_r=(0.1, -0.94, 0.33))), (0.75, ANSCHLAG), (0.85, ANSCHLAG), (1, BEREIT)], t)
def nachladen(i, n):
    """Armbrust mit der Spitze zum Boden, die linke Hand holt einen Bolzen aus dem Köcher an der linken Hüfte, legt ihn auf, Armbrust wieder hoch"""
    t = i / (n - 1); k = spur([(0, 0.0), (0.25, 1.0), (0.75, 1.0), (1, 0.0)], t); hocke(18 * k); rumpf(vor=2 + 14 * k, dreh_z=-15 + 9 * k, kopf=10 * k)
    unten = mit(BEREIT, o_r=(-0.2, -0.3, -0.93), u_r=(0.3, -0.5, -0.8), h_r=(0.0, -0.3, -0.95))
    arme_spur([(0, BEREIT), (0.25, mit(unten, o_l=(0.35, 0.15, -0.92), u_l=(0.1, 0.35, -0.93))), (0.4, mit(unten, o_l=(0.35, 0.1, -0.93), u_l=(0.05, 0.2, -0.98))),
               (0.6, mit(unten, o_l=(0.2, -0.55, -0.8), u_l=(-0.3, -0.7, -0.6))), (0.75, mit(unten, o_l=(0.2, -0.55, -0.8), u_l=(-0.3, -0.7, -0.6))), (1, BEREIT)], t)
def tod(i, n):
    """getroffen zurücktaumeln, in die Knie sacken, nach hinten fallen, liegen bleiben (letztes Bild)"""
    t = i / (n - 1); fall = spur([(0, 0.0), (0.3, 0.08), (0.65, 0.6), (0.9, 1.0), (1, 1.0)], t); knick = spur([(0, 0.0), (0.3, 1.0), (0.65, 0.7), (1, 0.15)], t)
    hocke(38 * knick); rumpf(vor=14 * knick - 8 * fall, dreh_z=-12 * knick + 8 * fall, kipp=6 * fall, kopf=18 * knick + AUS.get("tod_kopf", -22) * fall, ganz=AUS.get("tod_ganz", -90) * fall)   # großer Kopf (Kenney): flacher kippen, Kopf anheben
    if AUS.get("tod_fuesse_strecken"):                                                               # große Füße (Kenney): im Liegen zeigen die Zehen sonst steil nach oben
        for S in "LR": dreh("fuss." + S, (X, -38 * knick + 50 * fall))
    if TIEF:                                                                                         # weite Ärmel: die Arme bleiben am Körper und liegen am Ende neben ihm (zu den Füßen hin)
        arme_spur([(0, BEREIT), (0.3, mit(BEREIT, o_r=(-0.4, -0.3, -0.86), u_r=(-0.3, -0.7, -0.6), kl=(-0.2, -0.3, 0.93), o_l=(0.4, -0.3, -0.86), u_l=(0.3, -0.7, -0.6))),
                   (1, mit(BEREIT, o_r=(-0.3, -0.93, -0.18), u_r=(-0.35, -0.9, -0.25), kl=(0.6, 0.0, -0.1), o_l=(0.3, -0.93, -0.18), u_l=(0.35, -0.9, -0.25)))], t); return
    arme_spur([(0, BEREIT), (0.3, mit(BEREIT, o_r=(-0.6, -0.35, 0.3), u_r=(-0.55, -0.55, 0.6), kl=(-0.3, -0.5, 0.8), o_l=(0.6, -0.35, 0.3), u_l=(0.55, -0.55, 0.6))),   # Arme hochgerissen
               (0.65, mit(BEREIT, o_r=(-0.85, 0.2, 0.45), u_r=(-0.8, 0.45, 0.4), kl=(-0.2, 0.3, 0.93), o_l=(0.85, 0.2, 0.45), u_l=(0.8, 0.45, 0.4), h_r=(-0.8, 0.45, 0.4) if any(BEREIT["h_r"]) else (0.0, 0.0, 0.0))),
               (1, mit(BEREIT, sch=(0.0, 0.1, 1.0) if AUS.get("tod_schild_flach") else BEREIT["sch"], o_r=(-0.9, 0.42, -0.08) if not ARMBRUST else (-0.9, 0.42, -0.12), u_r=(-0.75, 0.65, -0.1) if not ARMBRUST else (-0.75, 0.64, -0.17), kl=(0.0, 0.0, -1.0) if ARMBRUST else (0.6, 0.72, 0.0), o_l=(0.9, 0.42, -0.08), u_l=(0.75, 0.65, -0.1), kl_l=(-0.6, 0.72, -0.3), h_r=(-0.75, 0.66, 0.0) if any(BEREIT["h_r"]) else (0.0, 0.0, 0.0)))], t)   # Armbrust flach am Boden        # Waffe liegt flach am Boden                 # liegt auf dem Rücken, Arme ausgebreitet

# name: (Funktion, Bilder, Bilder je Sekunde, Schleife, Zusatz)
BEWEGUNGEN = {"ruhe": (ruhe, 6, 6, True, {}), "laufen": (laufen, 8, 11, True, {}), "angriff": (angriff, 8, 16, False, {"treffer": 5}), "block": (block, 6, 12, False, {"halten": 5}),
              "angriff2h": (angriff2h, 8, 14, False, {"treffer": 5, "ohne": ["arm_l"]}), "treffer": (treffer, 5, 12, False, {}), "ausweichen": (ausweichen, 6, 12, False, {}),
              "angriff_axt": (angriff_axt, 8, 12, False, {"treffer": 5}), "angriff_dolch": (angriff_dolch, 7, 18, False, {"treffer": 3}),
              "zauber": (zauber, 8, 14, False, {"treffer": 4}), "angriff_links": (angriff_links, 8, 16, False, {"treffer": 5}), "segen": (segen, 8, 12, False, {}), "nova": (nova, 8, 12, False, {"treffer": 4}), "tod": (tod, 8, 10, False, {"halten": 7}),
              "stabhaltung": (stabhaltung, 6, 8, True, {}), "geschoss": (geschoss, 8, 14, False, {"treffer": 4}), "frosthauch": (frosthauch, 8, 12, False, {"treffer": 4}),
              "donnerwelle": (donnerwelle, 8, 12, False, {"treffer": 4}), "glutsphaere": (glutsphaere, 8, 12, False, {"treffer": 4}), "stabschlag": (angriff, 8, 16, False, {"treffer": 5}),
              "gehen": (gehen, 8, 8, True, {}), "schildstoss": (schildstoss, 8, 14, False, {"treffer": 4}), "kampfschrei": (kampfschrei, 8, 10, False, {"treffer": 3}),
              "zielen": (zielen, 6, 12, False, {"halten": 5}), "schiessen": (schiessen, 8, 12, False, {"treffer": 3}), "nachladen": (nachladen, 8, 8, False, {})}
GRUND = ["ruhe", "laufen", "angriff", "block", "angriff2h", "treffer", "ausweichen"]                 # ohne eigene Liste: die sieben Bewegungen des Kriegers v004
BEWEGUNGEN = {k: v for k, v in BEWEGUNGEN.items() if k in (AUS.get("bewegungen") or GRUND)}
arm.animation_data_create()
def schluessel(namen, nr):
    for b in PB:
        if b.name in namen: b.keyframe_insert("rotation_quaternion", frame=nr, group=b.name)
        if b.name == "becken" and "becken" in namen: b.keyframe_insert("location", frame=nr, group=b.name)
ALLE = {b.name for b in PB}
for name, (fn, n, rate, schleife, mehr) in BEWEGUNGEN.items():
    a = bpy.data.actions.new(name); a.use_fake_user = True; arm.animation_data.action = a
    for i in range(n): ganz.clear(); spaeter.clear(); PB["becken"].location = (0, 0, 0); fn(i, n); schluessel(ALLE, i + 1)
    a["bilder"] = n; a["rate"] = rate; a["schleife"] = schleife; a["mehr"] = json.dumps(mehr); print("Bewegung:", name, n, "Bilder")

# beidhändiger Angriff: die linke Hand greift den Griff unter der rechten. Das rechnet Blender (umgekehrte Kinematik); das Ergebnis wird Bild für Bild festgeschrieben.
sc = bpy.context.scene
if "angriff2h" in bpy.data.actions and "griff2" in bpy.data.objects:
    a = bpy.data.actions["angriff2h"]; arm.animation_data.action = a; ik = PB["unterarm.L"].constraints.new("IK"); ik.target = bpy.data.objects["griff2"]; ik.chain_count = 2; gemerkt = []
    for i in range(int(a["bilder"])): sc.frame_set(i + 1); bpy.context.view_layer.update(); gemerkt.append((PB["oberarm.L"].matrix.copy(), PB["unterarm.L"].matrix.copy()))
    PB["unterarm.L"].constraints.remove(ik)
    for i, (mo, mu) in enumerate(gemerkt):
        if i == 0 or i == len(gemerkt) - 1: continue                                                 # erstes und letztes Bild bleiben die Grundhaltung, damit die Bewegung an die anderen anschließt
        sc.frame_set(i + 1); PB["oberarm.L"].matrix = mo; bpy.context.view_layer.update(); PB["unterarm.L"].matrix = mu; bpy.context.view_layer.update(); schluessel({"oberarm.L", "unterarm.L"}, i + 1)
    luecke = []
    for i in range(1, len(gemerkt) - 1): sc.frame_set(i + 1); bpy.context.view_layer.update(); luecke.append(((arm.matrix_world @ PB["unterarm.L"].tail) - bpy.data.objects["griff2"].matrix_world.translation).length * 100)
    print("beidhändig: Abstand linkes Handgelenk – Griff in den Bildern 2 bis 7 (cm):", [round(v, 1) for v in luecke]); a["griffluecke_cm"] = max(luecke)
zw = next((bpy.data.objects["griff2." + t["id"]] for t in AUS["starr"] if t.get("zweihand")), None)   # genau der Griff der beidhändigen Waffe (andere Griffpunkte heißen griff2, griff2.001 …)
for name, welche in (AUS.get("linke_hand_am_griff") or {}).items():
    if zw is None or name not in bpy.data.actions: continue
    a = bpy.data.actions[name]; arm.animation_data.action = a; n = int(a["bilder"]); bilder = range(n) if welche == "alle" else [b for b in welche if b < n]
    ik = PB["unterarm.L"].constraints.new("IK"); ik.target = zw; ik.chain_count = 2; gemerkt = {}
    for i in bilder: sc.frame_set(i + 1); bpy.context.view_layer.update(); gemerkt[i] = (PB["oberarm.L"].matrix.copy(), PB["unterarm.L"].matrix.copy())
    PB["unterarm.L"].constraints.remove(ik)
    for i, (mo, mu) in gemerkt.items(): sc.frame_set(i + 1); PB["oberarm.L"].matrix = mo; bpy.context.view_layer.update(); PB["unterarm.L"].matrix = mu; bpy.context.view_layer.update(); schluessel({"oberarm.L", "unterarm.L"}, i + 1)
    luecke = []
    for i in gemerkt: sc.frame_set(i + 1); bpy.context.view_layer.update(); luecke.append(((arm.matrix_world @ PB["unterarm.L"].tail) - zw.matrix_world.translation).length * 100)
    print(f"linke Hand am Griff ({name}): größter Abstand Handgelenk – Griff {max(luecke):.1f} cm"); a["griffluecke_cm"] = max(luecke)
bpy.ops.object.mode_set(mode="OBJECT"); arm.animation_data.action = bpy.data.actions["ruhe"]; sc.frame_set(1)
arm["stil"] = AUS.get("stil", ""); arm["zeichenfolge"] = bool(AUS.get("zeichenfolge")); arm["gewichte"] = weg; arm["gewichtet"] = anteil; arm["vorbereitet"] = json.dumps(AUS.get("vorbereitet", []), ensure_ascii=False)
bpy.ops.wm.save_as_mainfile(filepath=zieldatei); print("geschrieben:", zieldatei)
