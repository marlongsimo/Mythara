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
  Waffe "drehen": <Grad>      die Waffe um ihre Längsachse gedreht in die Hand legen (Bogen: Sehne zum Körper)
  Teilnetz "arme_nur_aussen": true  Jacke mit Ärmeln: nur die Ärmel folgen den Armen, der Rumpf nicht den herabhängenden Händen
  Waffe "angriff": "<name>"  welche Angriffsbewegung zu dieser Waffe gehört (angriff, angriff_axt, angriff_dolch); Standard: angriff
Bewegungen, die es zusätzlich gibt: ruhe_2h, gehen_2h, laufen_2h (Zweihänder auf der Schulter), teleport_weg (Teleport: Abreise), trinken (Trinken/Essen: Hand zum Mund), faustschlag (ohne Waffe), angriff_axt, angriff_dolch, angriff_links (Waffe in der linken Hand), zauber, segen, nova, tod (bleibt liegen).
Für wechselbare Waffen (Bewegung hängt nur von der Waffenklasse ab): stich, block, hieb2h, stich2h, zauber_stab, bogen, armbrust1h, dolchwurf –
  Waffe "bewegungen": [...]  nur in diesen Bewegungen wird die Waffe gerendert; Zweihand greift an festen Punkten (griff_hieb 0.11 m zum Knauf, griff_stich 0.32 m zur Spitze).
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
  Teilnetz "ersetzt": [...]  ein Gesamtset: beim Anlegen werden diese Plätze abgelegt (Testszene/Spiel)
  Teilnetz "nur_knochen": [..]  nur diese Knochen bewegen das Teil (Brustpanzer: brust, bauch, becken – die Arme ziehen es nicht mit)
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

def handflaeche_lage(S_):
    """Wo die Handfläche entlang des Handknochens liegt (Anteil der Knochenlänge). Gemessen an der Form der Hand: 45 % vom Handgelenk bis zu den
    Fingerspitzen. Bei Modellen, deren Hand weit über den kurzen Handknochen hinausreicht (Meshy), liegt der Griff sonst am Handgelenk statt in der Faust.
    "griff_hand": <Anteil> in der Ausrüstungsliste setzt den Wert fest; nie weniger als 0.45 (so bleiben ältere Figuren unverändert)."""
    if "griff_hand" in AUS: return float(AUS["griff_hand"])
    b = KN["hand." + S_]; h, ax = b.head_local, b.tail_local - b.head_local; vg = ob.vertex_groups.get("hand." + S_)
    if vg is None: return 0.45
    lage = [(v.co - h).dot(ax) / ax.length_squared for v in ob.data.vertices for g in v.groups if g.group == vg.index and g.weight > 0.5]
    if len(lage) < 20: return 0.45
    lage = np.array(lage); a, e = np.percentile(lage, 2), np.percentile(lage, 98); HSPITZE[S_] = max(1.0, float(e)); return max(0.45, float(a + 0.45 * (e - a)))
HSPITZE = {"L": 1.0, "R": 1.0}   # wie weit die Fingerspitzen über den Handknochen hinausreichen (Anteil der Knochenlänge)
HFL = {S_: handflaeche_lage(S_) for S_ in "LR"}; print("Handfläche entlang des Handknochens:", {k: round(v, 2) for k, v in HFL.items()})
HAND_R = richtung("hand.R"); KLINGE0 = senkrecht((0, -1, 0.15), HAND_R)
HAND_L = richtung("hand.L"); KLINGE0_L = senkrecht((0, -1, 0.15), HAND_L); LINKS = any(t["art"] == "schwert" and t.get("hand") == "L" for t in AUS["starr"])   # eine Waffe in der linken Hand (Streitkolben neben dem Stab)                             # in der Grundhaltung zeigt die Klinge nach vorn, quer zur Hand (Hammergriff)
UARM_L = richtung("unterarm.L"); SCHILD0 = senkrecht((1, -0.15, 0), UARM_L)                        # der Schild liegt außen am linken Unterarm
for t in AUS["starr"]:
    o = laden(t["glb"], t["id"]); e = [Vector(c) for c in o.bound_box]; oben = max(v.z for v in e); unten = min(v.z for v in e)
    if t["art"] == "schwert":                                                                    # im Bild: Knauf oben, Spitze unten -> die Spitze (-z) zeigt in Klingenrichtung; "hand": "L" = linke Hand
        S_ = t.get("hand", "R"); HD, K0 = (HAND_L, KLINGE0_L) if S_ == "L" else (HAND_R, KLINGE0)
        ez = -K0; ey = K0.cross(HD).normalized(); ex = ey.cross(ez); R = Matrix((ex, ey, ez)).transposed(); griff = Vector((0, 0, oben - t["griff"] * (oben - unten)))
        if t.get("drehen"): R = R @ Matrix.Rotation(math.radians(t["drehen"]), 3, "Z")              # um die eigene Achse gedreht in der Hand (Bogen: Sehne zum Körper)
        handflaeche = KN["hand." + S_].head_local.lerp(KN["hand." + S_].tail_local, HFL[S_]); M = Matrix.Translation(handflaeche - R @ griff) @ R.to_4x4(); an_knochen(o, "hand." + S_, M)
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
    o["ebene"] = t["id"]; o["platz"] = t["platz"]; o["art"] = "starr"; o["reihe"] = AUS["starr"].index(t); o["angriff"] = t.get("angriff", "angriff"); o["bewegungen"] = json.dumps(t.get("bewegungen", [])); print("starr:", t["id"], "an", o.parent_bone)
# feste Griffpunkte für die linke Hand bei Zweihandwaffen – gemessen von der rechten Hand entlang der Waffenachse, für JEDE Waffe gleich.
# So sind die Bewegungen hieb2h/stich2h unabhängig von der Waffe: jede Waffe, deren Griff bis dorthin reicht, passt ohne neue Bewegung.
HF_R = KN["hand.R"].head_local.lerp(KN["hand.R"].tail_local, HFL["R"])
for nm, abst in (("griff2.hieb", -float(AUS.get("griff_hieb", 0.11))), ("griff2.stich", float(AUS.get("griff_stich", 0.32)))):   # hieb: zum Knauf hin; stich (Speer): zur Spitze hin
    g = bpy.data.objects.new(nm, None); bpy.context.collection.objects.link(g); g.empty_display_size = 0.03; an_knochen(g, "hand.R", Matrix.Translation(HF_R + KLINGE0 * abst))
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
    if t.get("nur_knochen"):                                                                       # starre Teile (Brustpanzer): nur diese Knochen bewegen das Teil, andere Gewichte (Arme, die am Rumpf anliegen) werden umgelegt
        erlaubt_ = set(t["nur_knochen"]); G_ = {g.name: g for g in o.vertex_groups}
        for v in o.data.vertices:
            w = {o.vertex_groups[g.group].name: g.weight for g in v.groups}; ok = {k: x for k, x in w.items() if k in erlaubt_}; s_ = sum(ok.values())
            if s_ < 1e-6: nah = min(erlaubt_, key=lambda k: (KN[k].head_local.lerp(KN[k].tail_local, 0.5) - v.co).length); ok = {nah: 1.0}; s_ = 1.0
            for k in w:
                if k not in erlaubt_: G_[k].remove([v.index])
            for k, x in ok.items(): (G_[k] if k in G_ else o.vertex_groups.new(name=k)).add([v.index], x / s_, "REPLACE")
    if t.get("arme_nur_aussen"):                                                                   # Jacke: nur die Ärmel (außerhalb der Schultern) folgen den Armen – der Rumpf nicht den Händen, die an der Hüfte hängen
        G_ = {g.name: g for g in o.vertex_groups}; xs = abs(KN["oberarm.L"].head_local.x) + 0.02; ARMK = [b.name for b in KN if b.name.split(".")[0] in ("oberarm", "unterarm", "hand")]
        RUMPF = [b for b in ("brust", "bauch", "becken", "hals") if b in KN]
        def am_arm(p):                                                                               # nahe an einem Arm (Schulter bis Handgelenk): Ärmel – darf dem Arm folgen
            for S__ in "LR":
                a_, b_ = KN["oberarm." + S__].head_local, KN["hand." + S__].tail_local; ab = b_ - a_; t_ = max(0.0, min(1.0, (p - a_).dot(ab) / ab.length_squared))
                if t_ > 0.04 and (p - (a_ + ab * t_)).length < 0.13: return True
            return False
        for v in o.data.vertices:
            if am_arm(v.co): continue
            w = {o.vertex_groups[g.group].name: g.weight for g in v.groups}
            if not any(k_ in ARMK for k_ in w): continue
            for k_ in [k_ for k_ in w if k_ in ARMK]: G_[k_].remove([v.index]); del w[k_]
            if sum(w.values()) < 1e-6: nah = min(RUMPF, key=lambda b: (KN[b].head_local.lerp(KN[b].tail_local, 0.5) - v.co).length); (G_.get(nah) or o.vertex_groups.new(name=nah)).add([v.index], 1.0, "REPLACE"); G_ = {g.name: g for g in o.vertex_groups}
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
    o["ebene"] = t["id"]; o["platz"] = t["platz"]; o["art"] = "huelle"; o["reihe"] = 50 + nr; o["umhang"] = bool(t.get("umhang")); o["ersetzt"] = ",".join(t.get("ersetzt", [])); o["unten"] = bool(t.get("unten")); o["ueberlage"] = False; o["wahlfrei"] = bool(t.get("wahlfrei")); o["volumen"] = True; volumen[t["platz"]] = o
    print("Teilnetz:", t["id"], "Platz", t["platz"], "·", len(o.data.vertices), "Punkte, Gewichte vom Grundkörper")

# ====================================================== 4. Bewegungen ======================================================
bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode="POSE"); PB = arm.pose.bones
for b in PB: b.rotation_mode = "QUATERNION"
X, Y, Z = Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1)); RUHE = {b.name: b.matrix_local.to_quaternion() for b in KN}; RICHT = {b.name: richtung(b.name) for b in KN}; ganz = {}
def setze(name, q):
    """q: Drehung des Knochens im Raum der Figur, gemessen gegen seine Grundhaltung (einschließlich aller Elternknochen)"""
    e = ELTERN[name]; lokal = (ganz[e].inverted() @ q) if e else q; r = RUHE[name]; PB[name].rotation_quaternion = r.inverted() @ lokal @ r; ganz[name] = q
def beine_eng():
    """„beine_eng“: <halber Fußabstand in m> in der Ausrüstungsliste – breit modellierte Beine (Meshy) in jeder Bewegung leicht nach innen drehen,
    bis die Knöchel so weit von der Mitte stehen; die Füße bleiben flach. Ohne die Angabe: 0 (unverändert)"""
    if not AUS.get("beine_eng"): return {"L": 0.0, "R": 0.0}
    w = {}
    for S_, v in (("L", 1), ("R", -1)):
        h, f = KN["oberschenkel." + S_].head_local, KN["fuss." + S_].head_local; ab = abs(f.x) - float(AUS["beine_eng"])
        w[S_] = v * min(12.0, max(0.0, math.degrees(math.atan2(ab, h.z - f.z))))
    print("Beine enger:", {k: round(x, 1) for k, x in w.items()}, "Grad"); return w
ENG = beine_eng()
def dreh(name, *schritte):
    """zusätzlich zum Elternknochen um Achsen des Raums drehen (Grad); der erste Schritt wirkt zuerst. +x: Rumpf nach vorn, Bein nach hinten"""
    teil, _, S_ = name.partition(".")
    if S_ in ENG and ENG[S_]:                                                                         # breite Beine nach innen (beine_eng), Fuß wieder waagerecht
        if teil == "oberschenkel": schritte = ((Y, ENG[S_]),) + tuple(schritte)
        elif teil == "fuss": schritte = ((Y, -ENG[S_]),) + tuple(schritte)
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
def zum_koerper(v, grad):
    """eine Armrichtung um die Vorwärtsachse zur Mitte drehen (rechte Seite: x < 0)"""
    w = math.radians(grad) * (-1 if v[0] < 0 else 1); c, s_ = math.cos(w), math.sin(w); return (v[0] * c + v[2] * s_, v[1], -v[0] * s_ + v[2] * c)
ARME_ENG = float(AUS.get("arme_eng", 0))   # Grad: hängende Arme (zivil, gehen, laufen) zusätzlich an den Körper – Meshy-Figuren, deren Schultergewichte einen Teil des Oberarms am Rumpf halten
if ZIVIL and ARME_ENG: BEREIT.update({k: zum_koerper(BEREIT[k], ARME_ENG) for k in ("o_r", "u_r", "o_l", "u_l")})
def ruhe(i, n):
    s = math.sin(2 * math.pi * i / n); PB["becken"].location = (0, -0.004 * (1 - math.cos(2 * math.pi * i / n)), 0); rumpf(vor=2 + 1.2 * s, kopf=-1.5 * s, dreh_z=-15 if ARMBRUST else 0.0)
    for S in "LR": dreh("oberschenkel." + S); dreh("unterschenkel." + S, (X, 2)); dreh("fuss." + S)
    if ZIVIL: arme(**mit(BEREIT, o_r=zum_koerper((-0.2, 0.01 * s, -1.0), ARME_ENG), o_l=zum_koerper((0.2, -0.01 * s, -1.0), ARME_ENG))); return
    if STAB: arme(**mit(BEREIT, o_l=(0.22, -0.02 + 0.01 * s, -0.98))); return
    if ARMBRUST: arme(**mit(BEREIT, u_r=(0.42, -0.85, 0.32 + 0.02 * s))); return
    arme(**mit(BEREIT, u_r=(-0.15, -0.6, -0.8 + 0.02 * s), u_l=(0.2, -0.62, -0.78 + 0.02 * s)))
def laufen(i, n):
    p = 2 * math.pi * i / n; s, c = math.sin(p), math.cos(p); PB["becken"].location = (0, 0.022 * math.cos(2 * p) - 0.022, 0); rumpf(vor=4 if ZIVIL else 13, dreh_z=9 * s - (15 if ARMBRUST else 0), kopf=0 if ZIVIL else -7)   # rennen: deutlich vorgebeugt, der Blick bleibt nach vorn
    for S, v in (("L", 1), ("R", -1)): dreh("oberschenkel." + S, (X, -26 * s * v + 3)); dreh("unterschenkel." + S, (X, 6 + 42 * max(0.0, c * v) ** 1.3)); dreh("fuss." + S, (X, -8 * s * v))
    if STAB: arme(**mit(BEREIT, o_r=(-0.25, -0.15 + 0.05 * s, -0.96), o_l=(0.18, -0.32 * s, -0.95), u_l=(0.1, -0.25 - 0.3 * s, -0.95))); return   # der Stab bleibt ruhig, der linke Arm schwingt
    if ARMBRUST: arme(**mit(BEREIT, o_r=(-0.1, -0.62 + 0.04 * s, -0.78))); return                              # die Armbrust bleibt ruhig in beiden Händen
    if ZIVIL: E_ = lambda v: zum_koerper(v, ARME_ENG); arme(**mit(BEREIT, o_r=E_((-0.18, 0.32 * s, -0.95)), u_r=E_((-0.1, -0.25 + 0.3 * s, -0.95)), o_l=E_((0.18, -0.32 * s, -0.95)), u_l=E_((0.1, -0.25 - 0.3 * s, -0.95)))); return   # Arme schwingen gegen die Beine
    arme(**mit(BEREIT, o_r=(-0.28, -0.08 + 0.38 * s, -1.0), u_r=(-0.15, -0.6 + 0.25 * s, -0.8), o_l=(0.32, -0.1 - 0.38 * s, -1.0), u_l=(0.2, -0.62 - 0.25 * s, -0.78)))   # rennen: Arme schwingen kräftig
def gehen(i, n):
    """ruhiges Gehen: kleinere Schritte als beim Laufen, Oberkörper aufrecht, Waffe und Schild bleiben in Bereitschaft"""
    p = 2 * math.pi * i / n; s, c = math.sin(p), math.cos(p); PB["becken"].location = (0, 0.01 * math.cos(2 * p) - 0.01, 0); rumpf(vor=2, dreh_z=5 * s)
    for S, v in (("L", 1), ("R", -1)): dreh("oberschenkel." + S, (X, -16 * s * v + 2)); dreh("unterschenkel." + S, (X, 4 + 24 * max(0.0, c * v) ** 1.3)); dreh("fuss." + S, (X, -5 * s * v))
    if ZIVIL: E_ = lambda v: zum_koerper(v, ARME_ENG); arme(**mit(BEREIT, o_r=E_((-0.18, 0.2 * s, -0.98)), u_r=E_((-0.1, -0.22 + 0.18 * s, -0.97)), o_l=E_((0.18, -0.2 * s, -0.98)), u_l=E_((0.1, -0.22 - 0.18 * s, -0.97)))); return   # ruhig gehen: Arme schwingen dicht am Körper
    arme(**mit(BEREIT, o_r=(-0.28, -0.08 + 0.2 * s, -1.0), u_r=(-0.15, -0.6 + 0.12 * s, -0.8), o_l=(0.32, -0.1 - 0.2 * s, -1.0), u_l=(0.2, -0.62 - 0.12 * s, -0.78)))   # Arme schwingen leicht gegen die Beine, auch mit Waffe und Schild
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
BLOCK = mit(BEREIT, o_l=(0.12, -0.72, -0.6), u_l=(-0.82, -0.32, 0.42), sch=(0.05, -1.0, 0.08), o_r=(-0.32, 0.1, -0.94), u_r=(-0.2, -0.6, -0.78), kl=(-0.05, -0.72, 0.69))   # Unterarm quer vor der Brust, Schildfläche nach vorn; Schwert neben dem Schild nach vorn oben, stichbereit
# (die Klinge steht quer zur Hand: zeigt der Unterarm nach unten, kann sie nicht senkrecht nach oben zeigen – sonst kippt sie seitlich weg)
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

# ---- Bewegungen für wechselbare Waffen: sie hängen nur von der Waffenklasse ab (Einhand rechts, Schild links, Zweihand, Speer, Stab,
#      Bogen links, Armbrust rechts, Wurfdolch) – die Waffe selbst ist eine eigene Ebene und wird nur in ihren Bewegungen gerendert.
def stich_rechts(i, n):
    """Stich rechts (Schwert, Dolch, jede Einhandwaffe): zurückziehen, mit Ausfallschritt gerade nach vorn stoßen. Die Waffe liegt quer in der Faust (Hammergriff):
    damit sie trotz gestrecktem Arm nach vorn zeigt, knickt das Handgelenk nach unten ab (h_r)"""
    t = i / (n - 1); w = spur([(0, 0.0), (0.3, 0.3), (0.5, 1.0), (0.75, 0.7), (1, 0.0)], t); schritt(24, w)
    rumpf(vor=spur([(0, 2.0), (0.3, 0.0), (0.5, 14.0), (1, 2.0)], t), dreh_z=spur([(0, 0.0), (0.3, -24.0), (0.5, 14.0), (1, 0.0)], t))
    b = mit(BEREIT, h_r=BEREIT["u_r"])
    zurueck = mit(BEREIT, o_r=(-0.45, 0.45, -0.77), u_r=(-0.1, -0.15, -0.98), h_r=(-0.1, -0.15, -0.98), kl=(0.0, -0.95, 0.3))
    stoss = mit(BEREIT, o_r=(-0.12, -0.96, -0.25), u_r=(0.05, -0.99, -0.1), h_r=(0.1, -0.3, -0.95), kl=(0.05, -0.99, 0.05))
    nach = mit(BEREIT, o_r=(-0.25, -0.75, -0.6), u_r=(-0.05, -0.8, -0.6), h_r=(0.0, -0.2, -0.98), kl=(0.0, -0.95, 0.3))
    arme_spur([(0, b), (0.3, zurueck), (0.5, stoss), (0.75, nach), (1, b)], t)
def hieb2h(i, n):
    """Zweihandhieb für jede Zweihandwaffe: Hände vor dem Körper zusammen, über den Kopf ausholen, mit Ausfallschritt gerade nach unten schlagen"""
    t = i / (n - 1); w = spur([(0, 0.0), (0.35, 0.6), (0.65, 1.0), (1, 0.0)], t); schritt(18, w); rumpf(vor=spur([(0, 2.0), (0.35, -12.0), (0.65, 24.0), (1, 2.0)], t), dreh_z=spur([(0, 0.0), (0.35, -8.0), (0.65, 8.0), (1, 0.0)], t))
    vorn = mit(BEREIT, o_r=(-0.12, -0.45, -0.88), u_r=(0.45, -0.75, 0.48), kl=(0.0, -0.4, 0.92))          # beide Hände vor dem Bauch am Griff, Klinge schräg nach oben
    arme_spur([(0, BEREIT), (0.14, vorn), (0.35, mit(BEREIT, o_r=(0.15, -0.2, 0.95), u_r=(0.5, 0.35, 0.8), kl=(0.0, 0.8, 0.6), o_l=(0.2, -0.3, 0.9), u_l=(-0.3, 0.3, 0.9))),
               (0.5, mit(BEREIT, o_r=(0.2, -0.8, 0.5), u_r=(0.5, -0.85, 0.2), kl=(0.0, -0.35, 0.94), o_l=(0.2, -0.8, 0.4), u_l=(-0.3, -0.9, 0.2))),
               (0.65, mit(BEREIT, o_r=(0.25, -0.8, -0.5), u_r=(0.55, -0.75, -0.4), kl=(0.0, -0.96, -0.28), o_l=(0.15, -0.8, -0.5), u_l=(-0.25, -0.85, -0.45))), (0.86, vorn), (1, BEREIT)], t)
def stich2h(i, n):
    """Speerstoß: linke Schulter vor, Schaft waagerecht an der rechten Hüfte (rechter Unterarm hängt, der Schaft liegt quer in der Faust),
    zurückziehen, mit Ausfallschritt nach vorn stoßen; die linke Hand greift 40 cm weiter vorn (fester Griffpunkt)"""
    t = i / (n - 1); w = spur([(0, 0.0), (0.3, 0.3), (0.55, 1.0), (0.75, 0.8), (1, 0.0)], t); schritt(24, w)
    rumpf(vor=spur([(0, 2.0), (0.3, -2.0), (0.55, 12.0), (0.75, 9.0), (1, 2.0)], t), dreh_z=spur([(0, 0.0), (0.15, -34.0), (0.3, -40.0), (0.55, -30.0), (0.75, -30.0), (1, 0.0)], t))
    lage = mit(BEREIT, o_r=(-0.18, 0.1, -0.98), u_r=(0.42, -0.3, -0.86), kl=(0.15, -0.99, 0.02))       # Hand vor dem Bauch, Schaft nach vorn (die linke Hand erreicht ihn)
    zurueck = mit(BEREIT, o_r=(-0.18, 0.4, -0.9), u_r=(0.4, 0.02, -0.92), kl=(0.15, -0.99, 0.02))
    stoss = mit(BEREIT, o_r=(0.0, -0.5, -0.87), u_r=(0.55, -0.55, -0.63), kl=(0.12, -0.99, 0.06))
    arme_spur([(0, BEREIT), (0.15, lage), (0.3, zurueck), (0.55, stoss), (0.75, stoss), (0.9, lage), (1, BEREIT)], t)
def zauber_stab(i, n):
    """Zauberspruch: Stab (oder jede Waffe) in der rechten Hand senkrecht hoch erheben – Unterarm nach vorn, der Stab steht quer in der Faust –,
    linke Hand offen nach vorn, halten, zurück"""
    t = i / (n - 1); hocke(spur([(0, 0.0), (0.3, 8.0), (0.55, 0.0), (1, 0.0)], t))
    rumpf(vor=spur([(0, 2.0), (0.3, 8.0), (0.55, -6.0), (0.8, -6.0), (1, 2.0)], t), kopf=spur([(0, 0.0), (0.55, -10.0), (0.8, -10.0), (1, 0.0)], t))
    sammeln = mit(BEREIT, o_r=(-0.3, -0.25, -0.92), u_r=(-0.05, -0.95, -0.3), kl=(0.0, 0.0, 1.0))      # die linke Hand bleibt in Bereitschaft (mit Schild am Arm)
    hoch = mit(BEREIT, o_r=(-0.3, -0.72, 0.62), u_r=(-0.05, -0.97, 0.2), kl=(0.0, 0.05, 1.0))
    arme_spur([(0, BEREIT), (0.3, sammeln), (0.55, hoch), (0.8, hoch), (1, BEREIT)], t)
def bogenschuss(i, n):
    """Bogen in der linken Hand: seitlich zum Ziel drehen, Bogenarm gestreckt, Sehne mit der rechten Hand an die Wange ziehen, lösen (Trefferbild), nachhalten"""
    t = i / (n - 1); dz = spur([(0, 0.0), (0.25, -35.0), (0.75, -35.0), (1, 0.0)], t); rumpf(vor=2.0, dreh_z=dz, kopf=spur([(0, 0.0), (0.3, 4.0), (0.75, 4.0), (1, 0.0)], t))
    for S in "LR": dreh("oberschenkel." + S); dreh("unterschenkel." + S, (X, 3)); dreh("fuss." + S)
    vor = mit(BEREIT, o_l=(0.1, -0.99, 0.05), u_l=(0.04, -1.0, 0.04), kl_l=(0.0, 0.08, 1.0), sch=(0.0, 0.0, 1.0))   # Bogenarm gestreckt, Bogen senkrecht
    angelegt = mit(vor, o_r=(-0.1, -0.97, 0.0), u_r=(0.3, -0.95, 0.05), kl=(0.0, -0.3, 0.95))          # rechte Hand an der Sehne
    gezogen = mit(vor, o_r=(-0.62, 0.78, 0.02), u_r=(0.66, -0.75, -0.05), kl=(0.0, 0.0, 1.0))         # Ellbogen hinten auf Schulterhöhe, Hand an der Wange
    geloest = mit(vor, o_r=(-0.66, 0.75, 0.0), u_r=(-0.3, 0.95, 0.05), kl=(0.0, 0.0, 1.0))           # die Hand springt nach hinten weg (nicht nach oben)
    arme_spur([(0, BEREIT), (0.25, angelegt), (0.5, gezogen), (0.62, gezogen), (0.7, geloest), (0.85, geloest), (1, BEREIT)], t)
def armbrust1h(i, n):
    """Armbrust einhändig rechts: Arm gestreckt nach vorn, Lauf waagerecht, abdrücken (Trefferbild), Rückstoß, absetzen; die linke Hand bleibt frei"""
    t = i / (n - 1); a = spur([(0, 0.0), (0.3, 1.0), (0.85, 1.0), (1, 0.0)], t); rueck = spur([(0, 0.0), (0.4, 0.0), (0.5, 1.0), (0.7, 0.0), (1, 0.0)], t)
    rumpf(vor=2 - 2 * a - 4 * rueck, dreh_z=-18 * a, kopf=6 * a)
    anschlag = mit(BEREIT, o_r=(-0.12, -0.96, -0.24), u_r=(0.1, -0.99, 0.02), h_r=(0.05, -1.0, 0.0), kl=(0.0, 0.0, -1.0))
    arme_spur([(0, BEREIT), (0.3, anschlag), (0.4, anschlag), (0.5, mit(anschlag, h_r=(0.05, -0.92, 0.38), o_r=(-0.14, -0.92, -0.18))), (0.7, anschlag), (0.85, anschlag), (1, BEREIT)], t)
def dolchwurf(i, n):
    """Wurfdolch rechts: weit hinter dem Kopf ausholen, mit Schritt nach vorn werfen (Trefferbild = Loslassen), durchschwingen; ab dem Loslassen ist die Hand leer"""
    t = i / (n - 1); w = spur([(0, 0.0), (0.35, 0.3), (0.57, 1.0), (0.8, 0.8), (1, 0.0)], t); schritt(18, w)
    rumpf(vor=spur([(0, 2.0), (0.35, -6.0), (0.57, 14.0), (0.8, 16.0), (1, 2.0)], t), dreh_z=spur([(0, 0.0), (0.35, -34.0), (0.57, 10.0), (0.8, 24.0), (1, 0.0)], t))
    aus = mit(BEREIT, o_r=(-0.5, 0.42, 0.75), u_r=(-0.15, 0.55, 0.82), kl=(0.0, -0.85, 0.5))           # Dolch quer in der Faust: Spitze nach vorn oben
    wurf = mit(BEREIT, o_r=(-0.2, -0.88, 0.42), u_r=(0.0, -0.97, 0.25), kl=(0.0, 0.2, 0.98))
    durch = mit(BEREIT, o_r=(0.05, -0.7, -0.7), u_r=(0.35, -0.72, -0.6), kl=(0.5, -0.6, -0.6))
    arme_spur([(0, BEREIT), (0.35, aus), (0.57, wurf), (0.8, durch), (1, BEREIT)], t)

def teleport_weg(i, n):
    """Teleport, Abreise: Hände vor der Brust sammeln (leicht in die Knie), dann die Arme weit über den Kopf reißen, Blick nach oben – und so halten,
    während die Figur im Licht vergeht (Lichtsäule, Funken und Auflösen macht der Darsteller im Spiel, echt3d/darsteller.ts teleport)"""
    t = i / (n - 1); hocke(spur([(0, 0.0), (0.35, 16.0), (0.6, 0.0), (1, 0.0)], t))
    rumpf(vor=spur([(0, 2.0), (0.35, 8.0), (0.6, -5.0), (1, -6.0)], t), kopf=spur([(0, 0.0), (0.35, 6.0), (0.6, -14.0), (1, -16.0)], t))
    sammeln = mit(BEREIT, o_r=(-0.12, -0.72, -0.68), u_r=(0.55, -0.75, 0.36), kl=(0.0, 0.3, 0.95), o_l=(0.12, -0.72, -0.68), u_l=(-0.55, -0.75, 0.36), sch=(0.05, -1.0, 0.1))
    hoch = mit(BEREIT, o_r=(-0.3, -0.12, 0.95), u_r=(-0.12, -0.08, 0.99), kl=(0.0, -1.0, 0.05), o_l=(0.3, -0.12, 0.95), u_l=(0.12, -0.08, 0.99), sch=(1.0, 0.0, 0.0))
    arme_spur([(0, BEREIT), (0.35, sammeln), (0.65, hoch), (1, hoch)], t)
# Zweihänder auf der Schulter (ruhe_2h, gehen_2h, laufen_2h): die rechte Faust vor der Brust, Handgelenk nach innen abgeknickt (h_r), damit die Klinge nach hinten über die rechte Schulter kippt; die linke Hand ist frei
SCHULTER = mit(BEREIT, o_r=(-0.25, -0.1, -0.96), u_r=(0.45, -0.8, 0.4), h_r=(0.9, 0.05, -0.43), kl=(0.0, 0.86, 0.51), o_l=(0.2, 0.0, -1.0), u_l=(0.12, -0.22, -0.97))
def ruhe_2h(i, n):
    s = math.sin(2 * math.pi * i / n); PB["becken"].location = (0, -0.004 * (1 - math.cos(2 * math.pi * i / n)), 0); rumpf(vor=2 + 1.2 * s, kopf=-1.5 * s)
    for S in "LR": dreh("oberschenkel." + S); dreh("unterschenkel." + S, (X, 2)); dreh("fuss." + S)
    arme(**mit(SCHULTER, u_r=(0.45, -0.8, 0.4 + 0.02 * s)))
def gehen_2h(i, n):
    p = 2 * math.pi * i / n; s, c = math.sin(p), math.cos(p); PB["becken"].location = (0, 0.01 * math.cos(2 * p) - 0.01, 0); rumpf(vor=2, dreh_z=5 * s)
    for S, v in (("L", 1), ("R", -1)): dreh("oberschenkel." + S, (X, -16 * s * v + 2)); dreh("unterschenkel." + S, (X, 4 + 24 * max(0.0, c * v) ** 1.3)); dreh("fuss." + S, (X, -5 * s * v))
    arme(**mit(SCHULTER, o_r=(-0.25, -0.1 + 0.03 * s, -0.96), o_l=(0.2, -0.25 * s, -0.97), u_l=(0.12, -0.22 - 0.2 * s, -0.97)))
def laufen_2h(i, n):
    p = 2 * math.pi * i / n; s, c = math.sin(p), math.cos(p); PB["becken"].location = (0, 0.022 * math.cos(2 * p) - 0.022, 0); rumpf(vor=13, dreh_z=7 * s, kopf=-7)
    for S, v in (("L", 1), ("R", -1)): dreh("oberschenkel." + S, (X, -26 * s * v + 3)); dreh("unterschenkel." + S, (X, 6 + 42 * max(0.0, c * v) ** 1.3)); dreh("fuss." + S, (X, -8 * s * v))
    arme(**mit(SCHULTER, o_r=(-0.25, -0.1 + 0.05 * s, -0.96), o_l=(0.22, -0.4 * s, -0.9), u_l=(0.15, -0.3 - 0.35 * s, -0.9)))

def mund_haltung():
    """Rechter Arm so, dass die Fingerspitzen an den Lippen liegen und die Hand flach zum Mund zeigt (die Finger haben keine Knochen und stehen gerade –
    zielt man mit der Handfläche, decken sie Nase und Augen ab). Aus den Knochenlängen dieser Figur gerechnet (Zwei-Gelenk-Kette Schulter–Ellbogen–Handgelenk):
    Ellbogen vorn und seitlich unter der Schulter. Mundhöhe: „mund“ = Anteil der Kopflänge über dem Kopfansatz (Standard 0.15, in der Ausrüstungsliste einstellbar)."""
    S_ = KN["oberarm.R"].head_local; L1 = (KN["oberarm.R"].tail_local - S_).length; L2 = (KN["unterarm.R"].tail_local - KN["unterarm.R"].head_local).length
    HL = (KN["hand.R"].tail_local - KN["hand.R"].head_local).length * HSPITZE["R"]; kh, kt = KN["kopf"].head_local, KN["kopf"].tail_local
    zm = kh.z + float(AUS.get("mund", 0.15)) * (kt.z - kh.z); band = P[(np.abs(P[:, 2] - zm) < 0.012) & (np.abs(P[:, 0] - kh.x) < 0.02)]
    M = Vector((kh.x - 0.01, (float(band[:, 1].min()) if len(band) else kh.y - 0.1) - 0.01, zm)); best = None
    for hx in np.linspace(-0.2, 0.9, 12):
        for hy in np.linspace(-0.6, 0.9, 13):
            for hz in np.linspace(-0.3, 1.0, 14):
                h = Vector((hx, hy, hz))
                if h.length < 1e-3: continue
                h.normalize(); W = M - h * HL; d = (W - S_).length
                if d > L1 + L2 - 0.01 or d < abs(L1 - L2) + 0.01: continue
                ax = (W - S_).normalized(); a_ = (L1 * L1 - L2 * L2 + d * d) / (2 * d); r = math.sqrt(max(0.0, L1 * L1 - a_ * a_)); C = S_ + ax * a_; e1 = ax.orthogonal().normalized(); e2 = ax.cross(e1)
                for phi in np.linspace(0, 2 * math.pi, 24, endpoint=False):
                    E = C + (e1 * math.cos(phi) + e2 * math.sin(phi)) * r; o = (E - S_).normalized(); u = (W - E).normalized(); knick = math.degrees(u.angle(h))
                    k_ = 0.5 * max(0.0, knick - 15) + 60 * max(0.0, h.z - 0.35) + 40 * max(0, o.z + 0.3) + 600 * max(0, E.x - (S_.x + 0.08)) + 600 * max(0, E.y - (S_.y - 0.08)) + 400 * max(0, E.z - (S_.z - 0.12)) + 300 * max(0.0, -h.y)
                    if best is None or k_ < best[0]: best = (k_, tuple(o), tuple(u), tuple(h))
    print("Trinken: Fingerspitzen an den Lippen, Oberarm", tuple(round(x, 2) for x in best[1]), "Unterarm", tuple(round(x, 2) for x in best[2]), "Hand", tuple(round(x, 2) for x in best[3]))
    return best[1:]
MUND = mund_haltung() if "trinken" in (AUS.get("bewegungen") or []) else None
def trinken(i, n):
    """Trinken oder Essen (dieselbe Bewegung, ohne Gegenstand): die rechte Hand zum Mund führen, den Kopf leicht zurück, zweimal nippen, die Hand wieder senken.
    Die Waffe in der rechten Hand blendet das Spiel währenddessen aus (echt3d/figur.ts trinken)"""
    t = i / (n - 1); a = spur([(0, 0.0), (0.28, 1.0), (0.78, 1.0), (1, 0.0)], t); nip = spur([(0, 0.0), (0.35, 0.0), (0.45, 1.0), (0.55, 0.0), (0.62, 1.0), (0.72, 0.0), (1, 0.0)], t)
    rumpf(vor=2 - 2 * a, kopf=-3 * a - 4 * nip)
    mund = mit(BEREIT, o_r=MUND[0], u_r=MUND[1], h_r=MUND[2], kl=(-1.0, 0.0, 0.3))
    arme_spur([(0, BEREIT), (0.28, mund), (0.78, mund), (1, BEREIT)], t)

def faustschlag(i, n):
    """Faustschlag rechts (ohne Waffe, z. B. Golem): ausholen (Arm zurück und angewinkelt, Rumpf dreht weg), gerade nach vorn schlagen mit Schritt, zurück"""
    t = i / (n - 1); w = spur([(0, 0.0), (0.35, 0.4), (0.55, 1.0), (0.75, 0.8), (1, 0.0)], t); schritt(14, w)
    rumpf(vor=spur([(0, 2.0), (0.35, -4.0), (0.55, 12.0), (0.75, 10.0), (1, 2.0)], t), dreh_z=spur([(0, 0.0), (0.35, -30.0), (0.55, 22.0), (0.75, 18.0), (1, 0.0)], t))
    aus = mit(BEREIT, o_r=(-0.45, 0.55, -0.7), u_r=(-0.1, -0.35, 0.93), h_r=(-0.1, -0.35, 0.93))
    schlag = mit(BEREIT, o_r=(-0.12, -0.99, -0.05), u_r=(-0.02, -1.0, 0.02), h_r=(-0.02, -1.0, 0.02))
    arme_spur([(0, BEREIT), (0.35, aus), (0.55, schlag), (0.75, schlag), (1, BEREIT)], t)

# name: (Funktion, Bilder, Bilder je Sekunde, Schleife, Zusatz)
BEWEGUNGEN = {"ruhe": (ruhe, 6, 6, True, {}), "laufen": (laufen, 8, 11, True, {}), "angriff": (angriff, 8, 16, False, {"treffer": 5}), "block": (block, 6, 12, False, {"halten": 5}),
              "angriff2h": (angriff2h, 8, 14, False, {"treffer": 5, "ohne": ["arm_l"]}), "treffer": (treffer, 5, 12, False, {}), "ausweichen": (ausweichen, 6, 12, False, {}),
              "angriff_axt": (angriff_axt, 8, 12, False, {"treffer": 5}), "angriff_dolch": (angriff_dolch, 7, 18, False, {"treffer": 3}),
              "zauber": (zauber, 8, 14, False, {"treffer": 4}), "angriff_links": (angriff_links, 8, 16, False, {"treffer": 5}), "segen": (segen, 8, 12, False, {}), "nova": (nova, 8, 12, False, {"treffer": 4}), "tod": (tod, 8, 10, False, {"halten": 7}),
              "stabhaltung": (stabhaltung, 6, 8, True, {}), "geschoss": (geschoss, 8, 14, False, {"treffer": 4}), "frosthauch": (frosthauch, 8, 12, False, {"treffer": 4}),
              "donnerwelle": (donnerwelle, 8, 12, False, {"treffer": 4}), "glutsphaere": (glutsphaere, 8, 12, False, {"treffer": 4}), "stabschlag": (angriff, 8, 16, False, {"treffer": 5}),
              "gehen": (gehen, 8, 8, True, {}), "schildstoss": (schildstoss, 8, 14, False, {"treffer": 4}), "kampfschrei": (kampfschrei, 8, 10, False, {"treffer": 3}),
              "zielen": (zielen, 6, 12, False, {"halten": 5}), "schiessen": (schiessen, 8, 12, False, {"treffer": 3}), "nachladen": (nachladen, 8, 8, False, {}),
              "stich": (stich_rechts, 7, 16, False, {"treffer": 3}), "hieb2h": (hieb2h, 8, 14, False, {"treffer": 5, "ohne": ["arm_l"]}), "stich2h": (stich2h, 8, 14, False, {"treffer": 4, "ohne": ["arm_l"]}),
              "zauber_stab": (zauber_stab, 8, 12, False, {"treffer": 4}), "bogen": (bogenschuss, 9, 12, False, {"treffer": 5, "ohne": ["arm_l", "hand_r"]}),
              "armbrust1h": (armbrust1h, 8, 12, False, {"treffer": 3}), "dolchwurf": (dolchwurf, 8, 16, False, {"treffer": 4, "loslassen": 4}),
              "teleport_weg": (teleport_weg, 14, 12, False, {"halten": 13}), "trinken": (trinken, 16, 12, False, {"ohne": ["hand_r"]}), "faustschlag": (faustschlag, 9, 12, False, {"treffer": 4}),
              "ruhe_2h": (ruhe_2h, 6, 6, True, {}), "gehen_2h": (gehen_2h, 8, 8, True, {}), "laufen_2h": (laufen_2h, 8, 11, True, {})}
GRUND = ["ruhe", "laufen", "angriff", "block", "angriff2h", "treffer", "ausweichen"]                 # ohne eigene Liste: die sieben Bewegungen des Kriegers v004
BEWEGUNGEN = {k: v for k, v in BEWEGUNGEN.items() if k in (AUS.get("bewegungen") or GRUND)}
KAMPF = {"angriff", "block", "angriff2h", "treffer", "ausweichen", "angriff_axt", "angriff_dolch", "zauber", "angriff_links", "segen", "nova", "stich", "hieb2h", "stich2h", "zauber_stab", "bogen",
         "armbrust1h", "dolchwurf", "schildstoss", "kampfschrei", "zielen", "schiessen", "nachladen", "donnerwelle", "glutsphaere", "stabschlag", "faustschlag"}
if AUS.get("kampftempo"):                                                                       # "kampftempo": 0.6 – alle Kampfbewegungen langsamer (Bilder je Sekunde × Faktor)
    BEWEGUNGEN = {k: ((f, n, max(1, round(r * float(AUS["kampftempo"]))), sl, z) if k in KAMPF else (f, n, r, sl, z)) for k, (f, n, r, sl, z) in BEWEGUNGEN.items()}
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
for name, zielname in (("hieb2h", "griff2.hieb"), ("stich2h", "griff2.stich")):                    # Zweihand mit festem Griffpunkt (für jede Waffe gleich)
    if name not in bpy.data.actions: continue
    a = bpy.data.actions[name]; arm.animation_data.action = a; zg = bpy.data.objects[zielname]; ik = PB["unterarm.L"].constraints.new("IK"); ik.target = zg; ik.chain_count = 2; gemerkt = []
    for i in range(int(a["bilder"])): sc.frame_set(i + 1); bpy.context.view_layer.update(); gemerkt.append((PB["oberarm.L"].matrix.copy(), PB["unterarm.L"].matrix.copy()))
    PB["unterarm.L"].constraints.remove(ik)
    for i, (mo, mu) in enumerate(gemerkt):
        if i == 0 or i == len(gemerkt) - 1: continue
        sc.frame_set(i + 1); PB["oberarm.L"].matrix = mo; bpy.context.view_layer.update(); PB["unterarm.L"].matrix = mu; bpy.context.view_layer.update(); schluessel({"oberarm.L", "unterarm.L"}, i + 1)
    luecke = []
    for i in range(1, len(gemerkt) - 1): sc.frame_set(i + 1); bpy.context.view_layer.update(); luecke.append(((arm.matrix_world @ PB["unterarm.L"].tail) - zg.matrix_world.translation).length * 100)
    print(f"{name}: linke Hand am festen Griffpunkt, Abstand je Bild (cm) {[round(v, 1) for v in luecke]}"); a["griffluecke_cm"] = max(luecke)
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
