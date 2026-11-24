# Skilling-Pets

Begleiter der Skills, hüfthoch (0,9 m). Je Pet ein Ordner mit asset.json, Meshy-Quelle (nicht im Repository) und referenz/bewegungen.png.

| Pet | Skill | Vorlage | Bewegungen | Spieldatei |
|---|---|---|---|---|
| Nagbert (vorläufig) | Holzfällerei | Acorn Guardian | ruhe: nagt an der Nuss · laufen: tapselt, Schwanz wedelt | img/figuren-echt3d/pet.nagbert.glb |
| Steinbert | Bergbau | Crystalback Miner | ruhe: wiegt sich · laufen: auf vier Beinen | img/figuren-echt3d/pet.steinbert.glb |

Bau:

    python3 fabrik/rig_nager.py -- <meshy.blend> <figur.blend> hoehe=0.9          # sitzender Nager (Nuss, buschiger Schwanz)
    python3 fabrik/rig_vierbeiner.py -- <meshy.blend> <figur.blend> hoehe=0.9      # Vierbeiner
    python3 fabrik/export3d.py <figur.blend> img/figuren-echt3d/pet.<name>.glb textur=1024 webp

Bewegungen laufen mit 24 Bildern/s. Das Hinterherlaufen im Spiel kommt später.
