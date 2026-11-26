# Ausrüstung (Rüstungen) nach Gruppe, Teil und Stufe

```
ausruestung/
  nahkampf/                        Gruppe: nahkampf, fernkampf, magie
    kopf/                          Teil: kopf, brust, beine
      0-training/                  Stufe (nur wo es Trainingsausrüstung gibt)
      1-einfach/
        einfacher-helm/            Gegenstand (Name = Stufe + Teil)
          datenblatt.json          Name, Gruppe, Teil, Seltenheit, Modell (Spieldateien), Werte, Text
          vorschau.png
      2-selten/ … 5-mythisch/
      helm.eisenwacht/             Modellquelle (Meshy-Datei, Stufenbild)
```

Datenblätter anlegen/ergänzen (eingetragene Werte bleiben): `cd realtime && npx esbuild ../fabrik/datenblaetter.ts --bundle --platform=node --log-level=error | (cd .. && node)`; Vorschaubilder: `python3 fabrik/datenblatt_bilder.py`.
Die angepassten Modelle je Figur liegen bei der Grundfigur (`basemann3d/v001/quelle/teile/`), die Spieldateien in `img/figuren-echt3d/<figur>.teile/`.
