# Holzfällerei

Bäume für die Holzfällerei – jeder Baum ein eigener Ordner:

    holzfaellerei/<baum>/asset.json              Name, Quelle, Spieldatei, Weltobjekt
    holzfaellerei/<baum>/v001/quelle/meshy.blend  Meshy-Modell (nicht im Repository, fabrik/.gitignore)
    holzfaellerei/<baum>/referenz/vorschau.png    Vorschau

Ablauf je Baum:

    python3 fabrik/baum_export.py -- <meshy.blend> img/objekte3d/holzfaellerei/<baum>.glb <höhe in m> luecken=1   # 3D-Spieldatei, graue Füllflächen der Textur aufgefüllt
    python3 fabrik/baum_render.py -- img/objekte3d/holzfaellerei/<baum>.glb <render.png> 0                                       # Ersatzbild (Quelle)
    python3 realtime/werkzeug/welt/baum_bilder.py --einzeln <render.png> <kennung> "<Name>" img/objekte3d/holzfaellerei/<baum>.glb <höhe in m>

Im Spiel (mit 3D-Figuren) wird jeder Baum live in 3D gezeichnet: eigene Drehung und Wind je Standort.
Blau leuchtende Stellen (Adern, Kristalle) pulsieren automatisch.
Die Holzfäller-Funktion (fällen, Holz) kommt später; bis dahin sind die Bäume reine Optik.
