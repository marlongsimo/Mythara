"""Eingangsprüfung für ein neues Körpermodell (z. B. das finale Painted-3D-Modell des Waldmark-Kriegers), bevor es in die Pipeline geht.
Aufruf: blender -b --python blender/scripts/modell_pruefen.py -- <modell.glb|fbx|blend> [skelett=warrior_base] [zuordnung=pfad.json] [bericht=pfad.md]
Prüft: ein Skelett mit den Knochen des Grundskeletts (oder einer Zuordnung), T-Pose, Blick nach −Y, Maßstab und Bodenhöhe, Gewichte nur auf
vorhandene Knochen, getrennte Körperregionen, fehlende Texturen, Polygonbudget. Gibt einen Bericht mit konkreten Hinweisen aus."""
import sys, os, json, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, mathutils
from mythara_figur import szene, konfig
a = sys.argv[sys.argv.index('--') + 1:]; MODELL = a[0]; opt = dict(x.split('=', 1) for x in a[1:])
FIG = konfig.figur(opt['figur']) if opt.get('figur') else None
SK = konfig.skelett(opt.get('skelett', FIG['skelett'] if FIG else 'warrior_base')); Z = json.load(open(opt['zuordnung'])) if opt.get('zuordnung') else {}
erg = []; p = lambda ok, text, hinweis='': erg.append((ok, text, hinweis))
szene.leeren(); neu = szene.importieren(MODELL)
IGN = set(FIG['koerper'].get('ignorieren', [])) if FIG else set(x for x in opt.get('ignorieren', '').split(',') if x)
arms = [o for o in neu if o.type == 'ARMATURE']; meshes = [o for o in neu if o.type == 'MESH' and o.name not in IGN]
if IGN: p(True, 'Ignoriert (Hilfsobjekte laut Figur): ' + ', '.join(sorted(IGN)))
p(len(arms) == 1, f'Genau ein Skelett ({len(arms)} gefunden)', 'Alle Körperteile und Ausrüstung müssen an einem gemeinsamen Skelett hängen.')
if arms:
    arm = arms[0]; namen = [b.name for b in arm.data.bones]; abgebildet = {Z.get(n, n) for n in namen}
    OPT = {'handslot.l', 'handslot.r'}  # Griffknochen bringt das Grundskelett mit (der Körper wird daran gebunden)
    fehlt = [k for k in SK['knochen'] if k not in abgebildet and k not in OPT]
    p(not fehlt, f'Knochen des Grundskeletts vorhanden ({len(SK["knochen"]) - 2 - len(fehlt)}/{len(SK["knochen"]) - 2}; Griffknochen ergänzt die Pipeline)', ('Fehlend: ' + ', '.join(fehlt) + '. Lösung: Knochen umbenennen oder eine Zuordnung angeben (zuordnung=… mit {"QuellName": "zielname"}); sie gilt auch für Animationen (knochenZuordnung).') if fehlt else '')
    if fehlt: print('Knochen im Modell:', ', '.join(namen[:40]))
    welt = lambda n: next((arm.matrix_world @ arm.data.bones[q].head_local, arm.matrix_world @ arm.data.bones[q].tail_local) for q in namen if Z.get(q, q) == n)
    try:
        h, t = welt('upperarm.r'); d = (t - h).normalized(); winkel = math.degrees(math.acos(min(1, abs(d.x))))
        p(winkel < 25, f'Ruhepose ist eine T-Pose (Oberarm {winkel:.0f}° zur Waagerechten)', 'Die Animationen erwarten die T-Pose des Grundskeletts; A-Pose vor dem Export in T-Pose bringen.')
    except StopIteration: pass
    try:
        h, t = welt('foot.l'); p(t.y < h.y, 'Blick nach −Y (Süden): Füße zeigen nach −Y', 'Modell um 180° um Z drehen und Drehung anwenden.')
    except StopIteration: pass
if meshes:
    pts = [o.matrix_world @ v.co for o in meshes for v in o.data.vertices]; z0, z1 = min(q.z for q in pts), max(q.z for q in pts)
    p(1.2 <= z1 - z0 <= 3.0, f'Größe {z1 - z0:.2f} m (erwartet 1,2–3,0 m)', 'In Metern modellieren bzw. beim Export skalieren (FBX: Maßstab 0,01 prüfen).')
    p(abs(z0) < 0.05, f'Füße auf dem Boden (unterste Stelle z = {z0:.3f} m)', 'Ursprung zwischen die Füße auf z = 0 legen.')
    gehaeutet = [o for o in meshes if any(m.type == 'ARMATURE' for m in o.modifiers)]
    p(len(gehaeutet) == len(meshes), f'Alle Meshes am Skelett gebunden ({len(gehaeutet)}/{len(meshes)})', 'Ungebundene Teile: ' + ', '.join(o.name for o in meshes if o not in gehaeutet))
    if arms:
        kn = {b.name for b in arms[0].data.bones}; fremd = sorted({vg.name for o in meshes for vg in o.vertex_groups if vg.name not in kn})
        p(not fremd, 'Gewichte nur auf vorhandene Knochen', 'Gruppen ohne Knochen: ' + ', '.join(fremd[:10]))
    if FIG:
        fr = [n for r, l in FIG['koerper']['regionen'].items() for n in l if n not in [o.name for o in meshes]]
        p(not fr, f'Regionen der Figur gefunden ({", ".join(FIG["koerper"]["regionen"])})', 'Fehlende Objekte: ' + ', '.join(fr))
    p(len(meshes) >= 4, f'Körper in Regionen getrennt ({len(meshes)} Meshes: {", ".join(o.name for o in meshes[:8])})', 'Für Ausrüstung, die Körperteile verdeckt, braucht es getrennte Objekte (z. B. Kopf, Rumpf, Arme, Beine). Namen kommen in koerper.regionen der Figur.')
    tris = sum(sum(len(pg.vertices) - 2 for pg in o.data.polygons) for o in meshes); p(tris <= 40000, f'Polygonbudget: {tris} Dreiecke (Richtwert ≤ 40 000)', 'Für 2D-Sprites genügt deutlich weniger; das beschleunigt das Rendern.', )
    fehlende = sorted({n.image.name for o in meshes for ms in o.material_slots if ms.material and ms.material.use_nodes for n in ms.material.node_tree.nodes if n.type == 'TEX_IMAGE' and n.image and not n.image.has_data and not n.image.packed_file})
    p(not fehlende, 'Texturen vorhanden', 'Fehlend: ' + ', '.join(fehlende) + ' – Texturen ins Modell packen oder neben die Datei legen.')
ok = all(x[0] for x in erg); z = [f'# Modellprüfung: {os.path.basename(MODELL)}', '', f'Grundskelett: {SK["id"]} · Ergebnis: **{"geeignet" if ok else "nicht geeignet – siehe Hinweise"}**', '']
z += [f'- {"✓" if o else "✗"} {t}' + (f'  \n  → {h}' if h and not o else '') for o, t, h in erg]
text = '\n'.join(z); print(text)
if opt.get('bericht'): open(opt['bericht'], 'w').write(text + '\n')
