"""Mythara Fabrik – eine Bewegung „schild_laufen“ ergänzen: Beine und Rumpf wie beim Laufen, Arme in der Blockhaltung (Schild vorn).

  python3 fabrik/schildlauf.py <figur.blend> <ziel.blend>

Das Spiel kennt für Torvald einen eigenen Gang mit erhobenem Schild (zweite Waffe „Schild“). Die Quelldatei bleibt unverändert; das Ergebnis ist eine neue Datei.
"""
import json, sys
import bpy

quelle, ziel = sys.argv[1], sys.argv[2]
bpy.ops.wm.open_mainfile(filepath=quelle); sc = bpy.context.scene; arm = bpy.data.objects["skelett"]; PB = arm.pose.bones
ARME = ["oberarm.L", "unterarm.L", "hand.L", "oberarm.R", "unterarm.R", "hand.R"]
block = bpy.data.actions["block"]; arm.animation_data.action = block; sc.frame_set(int(block["bilder"])); bpy.context.view_layer.update()
halt = {n: PB[n].rotation_quaternion.copy() for n in ARME}                                         # Armhaltung im Haltebild des Blocks (relativ zum Oberkörper)
lauf = bpy.data.actions["laufen"]; neu = lauf.copy(); neu.name = "schild_laufen"; neu.use_fake_user = True; arm.animation_data.action = neu
for i in range(int(lauf["bilder"])):
    sc.frame_set(i + 1)
    for n in ARME: PB[n].rotation_quaternion = halt[n]; PB[n].keyframe_insert("rotation_quaternion", frame=i + 1, group=n)
neu["bilder"] = lauf["bilder"]; neu["rate"] = 10; neu["schleife"] = True; neu["mehr"] = json.dumps({})
arm.animation_data.action = bpy.data.actions["ruhe"]; sc.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=ziel); print("schild_laufen:", int(neu["bilder"]), "Bilder · geschrieben:", ziel)
