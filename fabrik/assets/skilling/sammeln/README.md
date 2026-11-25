# Sammeln

Pflanzen zum Einsammeln, am Boden wachsend – je Pflanze ein Ordner mit asset.json und Vorschau (voll und geerntet).

| Pflanze | Höhe | Spieldatei | geerntet | Weltobjekte |
|---|---|---|---|---|
| Flachs | 0,9 m | img/objekte3d/skilling/sammeln/flachs.glb | flachs-geerntet.glb | samm_flachs_01, samm_flachs_geerntet |
| Hanf | 1,3 m | img/objekte3d/skilling/sammeln/hanf.glb | hanf-geerntet.glb | samm_hanf_01, samm_hanf_geerntet |

Bau: `python3 fabrik/pflanze.py -- <flachs|hanf> <voll|geerntet> <ziel.glb>` (in Blender gebaut, nur einfache Farben).
Im Spiel live in 3D, wiegt sich im Wind, begehbar (keine Kollision). Die Sammel-Funktion kommt später.
