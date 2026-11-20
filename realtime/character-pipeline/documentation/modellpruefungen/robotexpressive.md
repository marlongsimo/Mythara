# Modellprüfung: RobotExpressive.glb

Grundskelett: warrior_base · Ergebnis: **nicht geeignet – siehe Hinweise**

- ✓ Ignoriert (Hilfsobjekte laut Figur): Icosphere
- ✓ Genau ein Skelett (1 gefunden)
- ✗ Knochen des Grundskeletts vorhanden (0/21; Griffknochen ergänzt die Pipeline)  
  → Fehlend: root, hips, spine, chest, head, upperarm.l, lowerarm.l, wrist.l, hand.l, upperarm.r, lowerarm.r, wrist.r, hand.r, upperleg.l, lowerleg.l, foot.l, toes.l, upperleg.r, lowerleg.r, foot.r, toes.r. Lösung: Knochen umbenennen oder eine Zuordnung angeben (zuordnung=… mit {"QuellName": "zielname"}); sie gilt auch für Animationen (knochenZuordnung).
- ✗ Größe 4.21 m (erwartet 1,2–3,0 m)  
  → In Metern modellieren bzw. beim Export skalieren (FBX: Maßstab 0,01 prüfen).
- ✗ Füße auf dem Boden (unterste Stelle z = -0.313 m)  
  → Ursprung zwischen die Füße auf z = 0 legen.
- ✗ Alle Meshes am Skelett gebunden (2/14)  
  → Ungebundene Teile: Arm.L, Arm.R, Foot.L, Foot.R, Head, Leg.L, Leg.R, LowerLeg.L, LowerLeg.R, Shoulder.L, Shoulder.R, Torso
- ✓ Gewichte nur auf vorhandene Knochen
- ✓ Körper in Regionen getrennt (14 Meshes: Arm.L, Arm.R, Foot.L, Foot.R, Hand.L, Hand.R, Head, Leg.L)
- ✓ Polygonbudget: 3234 Dreiecke (Richtwert ≤ 40 000)
- ✓ Texturen vorhanden
