# Bergbau

Gesteine für den Bergbau – jedes ein eigener Ordner:

    bergbau/<gestein>/asset.json              Name, Quelle, Spieldatei, Weltobjekt
    bergbau/<gestein>/v001/quelle/meshy.blend  Meshy-Modell (nicht im Repository, fabrik/.gitignore)
    bergbau/<gestein>/referenz/vorschau.png    Vorschau

| Gestein | Höhe | Spieldatei | Weltobjekt |
|---|---|---|---|
| Kupferstein | 1,2 m | img/objekte3d/skilling/bergbau/kupferstein.glb | berg_kupferstein_01 |
| Eisen | 1,4 m | img/objekte3d/skilling/bergbau/eisen.glb | berg_eisen_01 |
| Schwarzeisen | 1,3 m | img/objekte3d/skilling/bergbau/schwarzeisen.glb | berg_schwarzeisen_01 |
| Sterneisen | 1,3 m | img/objekte3d/skilling/bergbau/sterneisen.glb | berg_sterneisen_01 |
| Splittereisen | 1,5 m | img/objekte3d/skilling/bergbau/splittereisen.glb | berg_splittereisen_01 |
| Ureisen | 1,6 m | img/objekte3d/skilling/bergbau/ureisen.glb | berg_ureisen_01 |

Ablauf je Gestein (wie die Bäume der Holzfällerei, aber ohne luecken=1 – Grau ist hier die echte Gesteinsfarbe):

    python3 fabrik/baum_export.py -- <meshy.blend> img/objekte3d/skilling/bergbau/<gestein>.glb <höhe in m>
    python3 fabrik/baum_render.py -- img/objekte3d/skilling/bergbau/<gestein>.glb <render.png> 30
    python3 realtime/werkzeug/welt/baum_bilder.py --einzeln <render.png> berg_<gestein>_01 "<Name>" img/objekte3d/skilling/bergbau/<gestein>.glb <höhe>

Im Spiel (mit 3D-Figuren) live in 3D gezeichnet, eigene Drehung je Standort, kein Wind (modell3d.wind = 0); blaue Adern pulsieren.
Zu jedem Gestein gibt es die abgebaute Fassung (<gestein>-leer.glb, Weltobjekt berg_<gestein>_leer): Erzadern leer, Moos bleibt.

    python3 fabrik/baum_export.py -- <meshy.blend> img/objekte3d/skilling/bergbau/<gestein>-leer.glb <höhe> adern=leer          # farbige Adern → dunkles Gestein
    … adern=leer ader_ton=warm     # Kupferstein: nur warme Töne sind Erz (das Gestein selbst ist bläulich)
    … adern=leer_schwarz           # Schwarzeisen: schwarze Adern → helles, leeres Bruchgestein

Die Abbau-Funktion kommt später; bis dahin reine Optik.
