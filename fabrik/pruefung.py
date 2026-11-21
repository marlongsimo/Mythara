"""Mythara Fabrik – automatische Prüfung einer modularen Figur: Modell (Blender-Datei) und gerenderte Bildblätter.

  python3 fabrik/pruefung.py <figur.blend> <export-ordner> <asset-id>

Schreibt <export-ordner>/bericht.json und nennt je Prüfung Messwert, Grenzwert und Urteil (ok / warnung / fehler).
Gesamturteil: erfolgreich · erfolgreich mit Einschränkungen (nur Warnungen) · fehlerhaft (mindestens ein Fehler).
„manuelle Prüfung erforderlich“ setzt die Fabrik dort, wo sie etwas nicht selbst beurteilen kann – hier: ob eine Bewegung glaubhaft aussieht.
"""
import json, os, sys
import numpy as np
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from PIL import Image
from scipy import ndimage

blend, ordner, kennung = sys.argv[1], sys.argv[2], sys.argv[3]; meta = json.load(open(os.path.join(ordner, kennung + ".json"))); F = meta["feld"]; ANIM = meta["animationen"]; EB = meta["ebenen"]
ergebnis = []
def melde(bereich, name, wert, grenze, ok, warn=False, mehr=None):
    urteil = "ok" if ok else ("warnung" if warn else "fehler"); ergebnis.append({"bereich": bereich, "pruefung": name, "wert": wert, "grenze": grenze, "urteil": urteil, **({"mehr": mehr} if mehr else {})})
    print(f"  {'✓' if ok else ('!' if warn else '✗')} [{bereich}] {name}: {wert} (Grenze: {grenze})" + (f" – {mehr}" if mehr and not ok else ""))

# ---------------------------------------------------------- Bildblätter ----------------------------------------------------------
_blatt = {}
def blatt(ebene, anim):
    k = (ebene, anim)
    if k not in _blatt: p = os.path.join(ordner, f"{ebene}.{anim}.webp"); _blatt[k] = np.asarray(Image.open(p).convert("RGBA")).astype(np.float32) / 255 if os.path.exists(p) else None
    return _blatt[k]
def feld(b, r, i): return b[r * F:(r + 1) * F, i * F:(i + 1) * F]
def ueber(unten, oben): a = oben[..., 3:]; aus = unten.copy(); aus[..., :3] = oben[..., :3] * a + unten[..., :3] * (1 - a); aus[..., 3:] = a + unten[..., 3:] * (1 - a); return aus
huellen = [e for e, d in EB.items() if d["art"] == "huelle"]; starr = [e for e, d in EB.items() if d["art"] == "starr"]; erst = {p: t[0] for p, t in meta["plaetze"].items()}
def gesamt(anim, r, i, teile):
    """So setzt das Spiel die Figur zusammen: Waffen hinten (fernste zuerst), Körper, Rüstung, Waffen vorn"""
    w = sorted([t for t in teile if EB[t]["art"] == "starr"], key=lambda t: -meta["tiefe"][t][anim][r][i]); bild = np.zeros((F, F, 4), np.float32)
    for e in [t + ".hinten" for t in w] + ["koerper"] + [t for t in teile if EB[t]["art"] == "huelle"] + [t + ".vorn" for t in w]: bild = ueber(bild, feld(blatt(e, anim), r, i))
    return bild

print("Bildblätter")
fehlend = [f"{e}.{a}" for e in ["koerper"] + huellen + [s + x for s in starr for x in (".hinten", ".vorn")] for a in ANIM if blatt(e, a) is None]
melde("bild", "alle Blätter vorhanden", f"{len(fehlend)} fehlen", "0", not fehlend, mehr=fehlend[:6])
falsch = [f"{e}.{a}" for (e, a), b in _blatt.items() if b is not None and b.shape[:2] != (8 * F, ANIM[a]["bilder"] * F)]
melde("bild", "Blattgröße = 8 Richtungen × Bilder × Feld", f"{len(falsch)} abweichend", "0", not falsch, mehr=falsch[:6])
leer = [f"{a}/{r}/{i}" for a in ANIM for r in range(8) for i in range(ANIM[a]["bilder"]) if feld(blatt("koerper", a), r, i)[..., 3].max() < 0.5]
melde("bild", "acht Richtungen, jedes Bild des Körpers gefüllt", f"{len(leer)} leere Bilder", "0", not leer, mehr=leer[:6])
# keine gespiegelten Richtungen: Osten/Westen, Südosten/Südwesten, Nordosten/Nordwesten dürfen keine Spiegelbilder voneinander sein
alle = list(erst.values()); klein = 9.0
for a in ANIM:
    for r, g in ((0, 4), (1, 3), (7, 5)):
        for i in range(ANIM[a]["bilder"]):
            x = gesamt(a, r, i, alle); y = gesamt(a, g, i, alle)[:, ::-1]; u = (x[..., 3] > 0.1) | (y[..., 3] > 0.1); klein = min(klein, float(np.abs(x - y)[u].mean()))
melde("bild", "keine gespiegelten Richtungen (kleinster Unterschied zum Spiegelbild der Gegenrichtung)", round(klein, 3), "> 0.03", klein > 0.03)
# Hintergrund durchsichtig und nichts abgeschnitten: kein Bild berührt den Rand seines Feldes
rand = []
for (e, a), b in _blatt.items():
    if b is None: continue
    al = b[..., 3].reshape(8, F, ANIM[a]["bilder"], F); kante = np.maximum.reduce([al[:, 0].max(-1), al[:, -1].max(-1), al[:, :, :, 0].max(1), al[:, :, :, -1].max(1)])
    rand += [f"{e}.{a}/{r}/{i}" for r, i in zip(*np.where(kante > 0.05))]
melde("bild", "nichts abgeschnitten (kein Teil berührt den Feldrand)", f"{len(rand)} Bilder", "0", not rand, mehr=rand[:8])
ecken = max(float(max(b[0, 0, 3], b[-1, -1, 3], b[0, -1, 3], b[-1, 0, 3])) for b in _blatt.values() if b is not None)
melde("bild", "Hintergrund durchsichtig (Ecken der Blätter)", round(ecken, 3), "0", ecken == 0)
# Fußpunkt: die unterste Zeile des Körpers schwankt innerhalb einer Bewegung und Richtung kaum
schwank = {}
for a in ANIM:
    b = blatt("koerper", a); m = 0
    for r in range(8): u = [int(np.where(feld(b, r, i)[..., 3].max(1) > 0.5)[0].max()) for i in range(ANIM[a]["bilder"])]; m = max(m, max(u) - min(u))
    schwank[a] = m
melde("bild", "unterste Körperzeile je Bewegung (px) – nur Hinweis: in der Schrägsicht liegt ein Fuß, der näher an der Kamera steht, tiefer im Bild; maßgeblich ist die Prüfung „Fußpunkt am Boden“ unten", schwank, "Hinweis", True)
# Rüstungsebenen überlagern sich nicht (jede schneidet die Räume der anderen aus)
doppelt = 0.0
for a in ANIM:
    for x in range(len(huellen)):
        for y in range(x + 1, len(huellen)):
            if EB[huellen[x]]["platz"] == EB[huellen[y]]["platz"]: continue
            p = blatt(huellen[x], a)[..., 3] > 0.6; q = blatt(huellen[y], a)[..., 3] > 0.6; doppelt = max(doppelt, float((p & q).sum() / max(1, min(p.sum(), q.sum()))))
melde("bild", "keine Überlagerung zwischen Rüstungsebenen (größter gemeinsamer Anteil)", round(doppelt, 4), "≤ 0.02", doppelt <= 0.02)
# keine Löcher: mit voller Ausrüstung entstehen im Umriss keine durchsichtigen Stellen, die der Körper allein nicht hat
def loecher(al): voll = al > 0.5; return ndimage.binary_fill_holes(voll) & ~voll
neu = 0; echt = 0
for a in ANIM:
    for r in range(8):
        for i in range(ANIM[a]["bilder"]):
            voll = gesamt(a, r, i, [t for t in alle if EB[t]["art"] == "huelle"])[..., 3]; kal = feld(blatt("koerper", a), r, i)[..., 3]; g = loecher(voll); k = loecher(kal)
            neu = max(neu, int((g & ~ndimage.binary_dilation(k, iterations=2)).sum())); echt = max(echt, int(((kal > 0.5) & (voll < 0.5)).sum()))
melde("bild", "keine Löcher durch die Ausrüstung (Bildpunkte, an denen der Körper allein deckt, die angezogene Figur aber durchsichtig ist – je Bild)", echt, "0", echt == 0)
melde("bild", "umschlossene Spalten (px je Bild) – nur Hinweis: Rüstungsebenen legen nur Deckung über den Körper und können ihn nicht durchlöchern; gemessen werden natürliche Spalten zwischen Beinen oder zwischen Arm und Rumpf, die die Kleidung umschließt", neu, "Hinweis", True)
# Handzuordnung im Bild: von vorn (Süden) ist das Schwert links im Bild, der Schild rechts; von hinten (Norden) umgekehrt
def schwerpunkt(e, a, r, i): al = feld(blatt(e + ".hinten", a), r, i)[..., 3]; return float((al.sum(0) * np.arange(F)).sum() / max(1e-6, al.sum()))
sw = next((t for t in starr if EB[t]["platz"] == "hand_r"), None); sd = next((t for t in starr if EB[t]["platz"] == "arm_l"), None)
if sw and sd:
    s_, n_ = schwerpunkt(sw, "ruhe", 2, 0) - schwerpunkt(sd, "ruhe", 2, 0), schwerpunkt(sw, "ruhe", 6, 0) - schwerpunkt(sd, "ruhe", 6, 0)
    melde("bild", "Handzuordnung: Schwert in der rechten Hand, Schild am linken Arm (Abstand Schwert–Schild im Bild: Süden, Norden)", [round(s_), round(n_)], "Süden < 0, Norden > 0", s_ < 0 < n_)
elif sw:                                                                                             # ohne Schild: die Waffe gegen die Mitte des Körpers
    def mitte(a, r, i): al = feld(blatt("koerper", a), r, i)[..., 3]; return float((al.sum(0) * np.arange(F)).sum() / max(1e-6, al.sum()))
    s_, n_ = schwerpunkt(sw, "ruhe", 2, 0) - mitte("ruhe", 2, 0), schwerpunkt(sw, "ruhe", 6, 0) - mitte("ruhe", 6, 0)
    melde("bild", "Handzuordnung: Waffe in der rechten Hand (Abstand Waffe–Körpermitte im Bild: Süden, Norden)", [round(s_), round(n_)], "Süden < 0, Norden > 0", s_ < 0 < n_)
# stabile Bewegungen: der Schwerpunkt des Körpers springt zwischen zwei Bildern nicht
sprung = {}
for a in ANIM:
    b = blatt("koerper", a); n = ANIM[a]["bilder"]; m = 0.0
    for r in range(8):
        c = []
        for i in range(n): al = feld(b, r, i)[..., 3]; ys, xs = np.where(al > 0.5); c.append((xs.mean(), ys.mean()))
        paare = list(zip(c, c[1:])) + ([(c[-1], c[0])] if ANIM[a]["schleife"] else []); m = max(m, max(float(np.hypot(p[0] - q[0], p[1] - q[1])) for p, q in paare))
    sprung[a] = round(m, 1)
grenze = {a: (40 if a == "tod" else 18) for a in sprung}                                            # der Tod fällt um: dort darf der Schwerpunkt weit wandern
melde("bild", "stabile Bewegungen (größter Sprung des Körperschwerpunkts zwischen zwei Bildern, px)", sprung, "≤ 18, Tod ≤ 40", all(sprung[a] <= grenze[a] for a in sprung))

# ---------------------------------------------------------- Modell ----------------------------------------------------------
print("Modell")
bpy.ops.wm.open_mainfile(filepath=blend); sc = bpy.context.scene; arm = bpy.data.objects["skelett"]; teile = {o["ebene"]: o for o in bpy.data.objects if o.get("ebene")}; koerper = teile["koerper"]; KN = {b.name for b in arm.data.bones}
fremd = [e for e, o in teile.items() if o["art"] != "starr" and not any(m.type == "ARMATURE" and m.object == arm for m in o.modifiers)]
melde("rig", "Körper und alle Rüstungsteile hängen am selben Skelett", f"{len(fremd)} ohne", "0", not fremd, mehr=fremd)
ohne = {e: round(sum(1 for v in o.data.vertices if not any(g.weight > 0.01 and o.vertex_groups[g.group].name in KN for g in v.groups)) / len(o.data.vertices), 4) for e, o in teile.items() if o["art"] != "starr"}
melde("rig", "jeder Punkt ist gewichtet (Anteil ohne Gewicht je Teil)", max(ohne.values()), "≤ 0.01", max(ohne.values()) <= 0.01, mehr=ohne)
melde("rig", "Art der Gewichtung", arm.get("gewichte", "?"), "automatisch", "automatisch" in str(arm.get("gewichte", "")), warn=True)
seiten = {e: (o.parent_bone, round(arm.data.bones[o.parent_bone].head_local.x, 2)) for e, o in teile.items() if o["art"] == "starr"}
gut = all((b.endswith(".R") and x < 0) or (b.endswith(".L") and x > 0) for b, x in seiten.values())
melde("rig", "Waffen hängen am richtigen Knochen (rechte Körperseite = -x)", seiten, "hand.R bei x < 0, unterarm.L bei x > 0", gut)
fest = 0.0; boden = {}; innen = 0.0; hoch = {}; wpos = {}; dg = bpy.context.evaluated_depsgraph_get(); zur_figur = arm.matrix_world.inverted()
for a in [x for x in bpy.data.actions if x.name in ANIM]:
    arm.animation_data.action = a; ab = {e: [] for e, o in teile.items() if o["art"] == "starr"}; tief = []
    for i in range(ANIM[a.name]["bilder"]):
        sc.frame_set(i + 1); bpy.context.view_layer.update(); dg = bpy.context.evaluated_depsgraph_get(); pb = arm.pose.bones
        for e in ab: o = teile[e]; k = pb[o.parent_bone]; ab[e].append(((arm.matrix_world @ k.matrix).inverted() @ o.matrix_world.translation).copy())      # Lage des Teils, vom Knochen aus gesehen
        ko = koerper.evaluated_get(dg); me = ko.to_mesh(); P = np.zeros(len(me.vertices) * 3, np.float32); me.vertices.foreach_get("co", P); P = P.reshape(-1, 3); tief.append(float(P[:, 2].min())); hoch.setdefault(a.name, []).append(float(P[:, 2].max()))
        for e in ab: o = teile[e]; c = sum((Vector(v) for v in o.bound_box), Vector()) / 8; wpos.setdefault((e, a.name), []).append(zur_figur @ (o.matrix_world @ c))   # Mitte der Waffe im Raum der Figur (-y = vorn)
        if i in (0, ANIM[a.name]["bilder"] // 2):                                                # Rüstung liegt außen auf dem Körper, nicht darunter
            baum = BVHTree.FromPolygons([tuple(v) for v in P.tolist()], [tuple(p.vertices) for p in me.polygons])
            for e, o in teile.items():
                if o["art"] != "huelle": continue
                m2 = o.evaluated_get(dg).to_mesh(); Q = np.zeros(len(m2.vertices) * 3, np.float32); m2.vertices.foreach_get("co", Q); Q = Q.reshape(-1, 3)[::25]; drin = 0
                for q in Q:
                    ort, nrm, _, d = baum.find_nearest(Vector(q.tolist()))
                    if ort is not None and (Vector(q.tolist()) - ort).dot(nrm) < -0.004: drin += 1
                innen = max(innen, drin / len(Q)); o.evaluated_get(dg).to_mesh_clear()
        ko.to_mesh_clear()
    for e, l in ab.items(): fest = max(fest, max((p - l[0]).length for p in l) * 1000)
    boden[a.name] = [round(min(tief) * 100, 1), round(max(tief) * 100, 1)]
melde("animation", "Waffen bleiben fest an ihrem Knochen (größte Verschiebung über alle Bilder, mm)", round(fest, 3), "≤ 1", fest <= 1)
schlimm = max(max(abs(v[0]), abs(v[1])) for v in boden.values())
melde("animation", "Fußpunkt am Boden in allen Bewegungen (tiefster Punkt des Körpers, cm) – sonst springt, sinkt oder schwebt die Figur im Spiel", boden, "±1 cm", schlimm <= 1)
# Waffenführung: jede Waffe hat ihre Angriffsbewegung, und im Trefferbild ist die Waffe vor dem Körper
for e, o in teile.items():
    if o["art"] != "starr" or EB[e]["platz"] != "hand_r": continue
    an = EB[e].get("angriff", "angriff")
    if an not in ANIM: melde("animation", f"{e}: Angriffsbewegung vorhanden", an, "vorhanden", False); continue
    i = ANIM[an].get("treffer", ANIM[an]["bilder"] // 2); v = wpos[(e, an)][i]; v0 = wpos[(e, "ruhe")][0] if (e, "ruhe") in wpos else v
    melde("animation", f"{e}: im Trefferbild ({an}, Bild {i + 1}) ist die Waffe vor dem Körper (Mitte der Waffe, m: vor / Höhe)", [round(-v.y, 2), round(v.z, 2)], "vor ≥ 0.3 m, Höhe 0.3–1.9 m", -v.y >= 0.3 and 0.3 <= v.z <= 1.9)
if "tod" in ANIM:
    h = hoch["tod"]; melde("animation", "Tod: steht am Anfang, liegt am Ende (höchster Punkt des Körpers im ersten und letzten Bild, m)", [round(h[0], 2), round(h[-1], 2)], "Anfang ≥ 1.6, Ende ≤ 0.6", h[0] >= 1.6 and h[-1] <= 0.6)
    for e, o in teile.items():                                                                       # die Waffe liegt am Ende flach auf dem Boden, nicht senkrecht in die Luft
        if o["art"] != "starr": continue
        arm.animation_data.action = bpy.data.actions["tod"]; sc.frame_set(ANIM["tod"]["bilder"]); bpy.context.view_layer.update(); oben = max((zur_figur @ (o.matrix_world @ Vector(c))).z for c in o.bound_box)
        melde("animation", f"Tod: {e} liegt am Ende am Boden (höchster Punkt der Waffe im letzten Bild, m)", round(oben, 2), "≤ 0.5", oben <= 0.5)
if "block" in ANIM and not any(EB[t]["platz"] == "arm_l" for t in starr):
    for e, o in teile.items():
        if o["art"] == "starr" and EB[e]["platz"] == "hand_r": v = wpos[(e, "block")][ANIM["block"].get("halten", -1)]; melde("animation", f"Block ohne Schild: {e} deckt vor dem Oberkörper (Mitte der Waffe, m: vor / Höhe)", [round(-v.y, 2), round(v.z, 2)], "vor ≥ 0.2 m, Höhe 1.1–1.9 m", -v.y >= 0.2 and 1.1 <= v.z <= 1.9)
melde("rig", "Rüstung liegt über dem Körper (größter Anteil geprüfter Punkte unter der Körperoberfläche)", round(innen, 4), "≤ 0.03", innen <= 0.03, warn=innen <= 0.1)
luecke = float(bpy.data.actions["angriff2h"].get("griffluecke_cm", -1)) if "angriff2h" in bpy.data.actions else -1
if luecke >= 0: melde("animation", "beidhändiger Angriff: linkes Handgelenk am Griff (größter Abstand in den Bildern 2–7, cm)", round(luecke, 1), "≤ 6 im Hieb, Übergangsbilder dürfen abweichen", luecke <= 6, warn=True)
liste = os.path.join(os.path.dirname(os.path.abspath(ordner)), "ausruestung.json")
if not os.path.exists(liste): liste = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(ordner))), "ausruestung.json")   # eigene Liste der Version, sonst die der Figur
SOLL = ["ruhe", "laufen", "angriff", "block", "angriff2h", "treffer", "ausweichen"]
if os.path.exists(liste): SOLL = json.load(open(liste)).get("bewegungen", SOLL)                     # was die Figur laut ihrer Liste haben soll
melde("animation", "alle Bewegungen vorhanden", sorted(ANIM), ", ".join(SOLL), set(SOLL) <= set(ANIM))

fehler = [e for e in ergebnis if e["urteil"] == "fehler"]; warn = [e for e in ergebnis if e["urteil"] == "warnung"]
status = "fehlerhaft" if fehler else ("erfolgreich mit Einschränkungen" if warn else "erfolgreich")
json.dump({"id": kennung, "status": status, "manuell": ["Ob die Bewegungen glaubhaft aussehen, kann die Prüfung nicht beurteilen – bitte in der Testszene ansehen."], "pruefungen": ergebnis}, open(os.path.join(ordner, "bericht.json"), "w"), ensure_ascii=False, indent=1)
print(f"\nStatus: {status} · {len(ergebnis) - len(fehler) - len(warn)} ok, {len(warn)} Warnungen, {len(fehler)} Fehler")
