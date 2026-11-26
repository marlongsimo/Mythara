"""Mythara Fabrik – Flugvariante einer geflügelten Figur (Boss-Phase 2): Flügelknochen ergänzen und Flugbewegungen bauen.

  python3 fabrik/fluegel.py -- <figur.blend> <ziel.blend> [hoehe=0.6]

Erwartet eine mit rig.py gebaute Figur (Knochen becken, brust, oberschenkel.*, …) und ihre Bewegungen ruhe, doppelhieb, treffer, tod.
1. Flügelknochen fluegel.L/R an der Brust (Schulterblatt → Flügelspitze); die Federn seitlich und hinter dem Rücken hängen daran
   (weich auslaufend zur Wurzel, damit Rücken und Umhang nicht reißen).
2. Flugbewegungen, jede aus einer Bodenbewegung abgeleitet (Arme und Oberkörper wie dort), dazu Schwebehöhe, Flügelschlag und hängende Beine:
   abheben (in die Luft, 0,9 s) · fliegen (Schweben und Fortbewegung, Schleife, ein Flügelschlag je 0,7 s) · flug_hieb (Doppelschwert-Angriff in der Luft)
   · flug_treffer · flug_tod (stürzt mit eingeklappten Flügeln ab und bleibt liegen) · fluegelschlag (zwei harte Schläge, Windstoß)
   · sturzraben_rufen (nur wenn die Figur „kampfschrei“ hat: Schwert hoch, Flügel weit gespreizt).
Danach fabrik/kind.py (Größe) und fabrik/export3d.py … echtzeit=1. boden.py NICHT laufen lassen (es stellte die Füße zurück auf den Boden).
"""
import json, math, sys
import numpy as np
import bpy
from mathutils import Quaternion, Vector

a_ = sys.argv[sys.argv.index("--") + 1:]; quelle, ziel = a_[0], a_[1]; opt = dict(x.split("=", 1) for x in a_[2:] if "=" in x); HOCH = float(opt.get("hoehe", 0.6))
bpy.ops.wm.open_mainfile(filepath=quelle)
arm = bpy.data.objects["skelett"]; ob = bpy.data.objects["koerper"]; me = ob.data
P = np.array([v.co[:] for v in me.vertices], np.float32); x, y, z = P[:, 0], P[:, 1], P[:, 2]
kb = arm.data.bones["brust"]; zb = kb.head_local.z; yb = kb.head_local.y
WURZEL = {"L": Vector((0.12, yb + 0.22, zb + 0.18)), "R": Vector((-0.12, yb + 0.22, zb + 0.18))}
# ---- Flügelknochen
bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode="EDIT"); E = arm.data.edit_bones
for S, sx in (("L", 1), ("R", -1)):
    seite = (x * sx > 0.05); spitze = P[seite & (x * sx > np.percentile(x[seite] * sx, 97))].mean(0)
    b = E.new("fluegel." + S); b.head = WURZEL[S]; b.tail = Vector(spitze.tolist()); b.parent = E["brust"]; b.use_connect = False
bpy.ops.object.mode_set(mode="OBJECT"); KN = arm.data.bones
# ---- Gewichte: Federn = weit außen, oder hinter dem Rücken über der Hüfte
for S, sx in (("L", 1), ("R", -1)):
    xs = x * sx; w = np.clip((xs - 0.3) / 0.07, 0, 1)                                                # seitlich außerhalb von Körper und Armen
    hinten = np.clip((y - (yb + 0.12)) / 0.08, 0, 1) * np.clip((xs - 0.1) / 0.08, 0, 1) * np.clip((z - (zb - 0.25)) / 0.1, 0, 1)
    w = np.maximum(w, hinten) * (xs > 0) * np.clip((z - (zb - 0.55)) / 0.3, 0, 1)                 # nur der obere Flügel: unten (Höhe des Rocks) bleibt er am Körper, sonst reißen lange Streifen
    g = ob.vertex_groups.get("fluegel." + S) or ob.vertex_groups.new(name="fluegel." + S)
    for i in np.where(w > 0.01)[0]:
        v = me.vertices[int(i)]; wi = float(w[i])
        for gg in v.groups:
            if gg.group != g.index: gg.weight *= (1 - wi)
        g.add([int(i)], wi, "REPLACE")
print("Flügel: Punkte L", int((np.clip((x - 0.3) / 0.07, 0, 1) > 0.5).sum()), "R", int((np.clip((-x - 0.3) / 0.07, 0, 1) > 0.5).sum()))
# ---- Bewegungen
PB = arm.pose.bones
for b in PB: b.rotation_mode = "QUATERNION"
def q_achse(n, *schritte):
    """Drehung um Achsen der Figur (x Breite, y vorn–hinten, z oben) im Raum des Knochens"""
    R = KN[n].matrix_local.to_quaternion(); q = Quaternion()
    for achse, grad in schritte: q = Quaternion(Vector(achse), math.radians(grad)) @ q
    return R.inverted() @ q @ R
def lesen(aktion, bild):
    arm.animation_data.action = bpy.data.actions[aktion]; bpy.context.scene.frame_set(int(round(bild)))
    return {b.name: (b.rotation_quaternion.copy(), b.location.copy()) for b in PB}
def bauen(name, basis, n, rate, schleife, bild_von, extra, mehr="{}"):
    """n Bilder; bild_von(t) = Bild der Bodenbewegung; extra(t) = (Schwebehöhe m, Flügel-Grad auf, Flügel-Grad zurück, Beine 0..1)"""
    posen = [lesen(basis, bild_von(i / (n - 1))) for i in range(n)]
    akt = bpy.data.actions.new(name); akt.use_fake_user = True; arm.animation_data.action = akt
    for i in range(n):
        t = i / (n - 1); h, auf, zur, beine = extra(t)
        for b in PB:
            q, l = posen[i].get(b.name, (Quaternion(), Vector()))
            b.rotation_quaternion = q; b.location = l
        PB["becken"].location = posen[i]["becken"][1] + Vector((0, h, 0))
        for S, sx in (("L", 1), ("R", -1)): PB["fluegel." + S].rotation_quaternion = q_achse("fluegel." + S, ((0, 1, 0), -sx * auf), ((0, 0, 1), sx * zur))
        for S in "LR":                                                                              # Beine hängen: Hüfte leicht zurück, Knie angewinkelt
            PB["oberschenkel." + S].rotation_quaternion = PB["oberschenkel." + S].rotation_quaternion @ q_achse("oberschenkel." + S, ((1, 0, 0), -14 * beine))
            PB["unterschenkel." + S].rotation_quaternion = PB["unterschenkel." + S].rotation_quaternion @ q_achse("unterschenkel." + S, ((1, 0, 0), 30 * beine))
            PB["fuss." + S].rotation_quaternion = PB["fuss." + S].rotation_quaternion @ q_achse("fuss." + S, ((1, 0, 0), -25 * beine))
        for b in PB:
            b.keyframe_insert("rotation_quaternion", frame=i + 1, group=b.name); b.keyframe_insert("location", frame=i + 1, group=b.name)
    akt["bilder"] = n; akt["rate"] = rate; akt["schleife"] = schleife; akt["mehr"] = mehr; print("Bewegung:", name, n, "Bilder")
glatt = lambda u: u * u * (3 - 2 * u)
schlag = lambda t, k=1: 38 * math.sin(2 * math.pi * k * t)                                         # Flügelschlag auf/ab
nb = lambda a: int(bpy.data.actions[a]["bilder"])
bauen("fliegen", "ruhe", 12, 17, True, lambda t: 1 + (nb("ruhe") - 1) * t,
      lambda t: (HOCH + 0.06 * math.sin(2 * math.pi * t - 0.8), 10 + schlag(t), 12, 1.0))
bauen("abheben", "ruhe", 13, 14, False, lambda t: 1,
      lambda t: (HOCH * glatt(max(0.0, (t - 0.25) / 0.75)) - 0.08 * math.sin(math.pi * min(1.0, t / 0.25)), 10 + schlag(t, 1.5) * min(1.0, t * 2.5), 12 * t, glatt(t)), '{"halten": 12}')
bauen("flug_hieb", "doppelhieb", nb("doppelhieb"), 14, False, lambda t: 1 + (nb("doppelhieb") - 1) * t,
      lambda t: (HOCH + 0.12 * math.sin(math.pi * t), 30 - 20 * math.sin(math.pi * t), 25 * math.sin(math.pi * t), 1.0), '{"treffer": 6}')
bauen("flug_treffer", "treffer", 6, 14, False, lambda t: 1 + (nb("treffer") - 1) * t,
      lambda t: (HOCH - 0.12 * math.sin(math.pi * t), 10 + 25 * math.sin(math.pi * t), 12, 1.0))
bauen("flug_tod", "tod", 16, 12, False, lambda t: 1 + (nb("tod") - 1) * glatt(max(0.0, (t - 0.45) / 0.55)),
      lambda t: (HOCH * (1 - glatt(min(1.0, t / 0.55))) ** 1.5, 10 - 70 * glatt(min(1.0, t / 0.5)), 12 + 30 * glatt(min(1.0, t / 0.5)), 1 - glatt(max(0.0, (t - 0.45) / 0.4))), '{"halten": 15}')
if "kampfschrei" in bpy.data.actions:                                                               # Sturzraben rufen: Schwert hoch gereckt, Kopf zurück, Flügel weit gespreizt, steigt etwas
    bauen("sturzraben_rufen", "kampfschrei", 14, 12, False, lambda t: 1 + (nb("kampfschrei") - 1) * t,
          lambda t: (HOCH + 0.18 * math.sin(math.pi * t), 10 + 50 * math.sin(math.pi * t) + 0.3 * schlag(t, 2), 12 - 22 * math.sin(math.pi * t), 1.0), '{"treffer": 7}')
bauen("fluegelschlag", "ruhe", 14, 14, False, lambda t: 1,                                         # Flügelschlag: weit ausholen (hoch und zurück), zwei harte Schläge nach unten vorn – Windstoß
      lambda t: (HOCH + 0.1 * math.sin(math.pi * t) + 0.05 * math.sin(4 * math.pi * t), 10 + 55 * math.sin(4 * math.pi * t) * math.sin(math.pi * t), 12 - 40 * math.sin(4 * math.pi * t) * math.sin(math.pi * t), 1.0), '{"treffer": 5}')
for alt in ("ruhe", "gehen", "doppelhieb", "treffer", "tod", "kampfschrei"):                                     # die Flugvariante hat nur Flugbewegungen
    if alt in bpy.data.actions: bpy.data.actions.remove(bpy.data.actions[alt])
arm.animation_data.action = bpy.data.actions["fliegen"]; bpy.context.scene.frame_set(1)
for o in bpy.data.objects:                                                                          # Waffen: dieselben Bewegungen wie die Figur
    if o.get("bewegungen"): o["bewegungen"] = json.dumps([a.name for a in bpy.data.actions if a.get("bilder")])
bpy.ops.wm.save_as_mainfile(filepath=ziel); print("geschrieben:", ziel)
