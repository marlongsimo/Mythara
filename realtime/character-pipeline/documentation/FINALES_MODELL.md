# Vorgaben für das finale Mythara-Modell (Waldmark-Krieger und weitere Helden)

Der aktuelle Krieger ist ein **TEST ASSET** (KayKit-Mannequin, CC0). Das hochwertige, eigens für Mythara gestaltete Modell ersetzt nur den
Körper und die Ausrüstungsmodelle – Skelett, Animationen, Ausrüstungslogik, Export, Vorschau und Spielschnittstelle bleiben gleich.

## 1. Was das Modell mitbringen muss
| Punkt | Vorgabe | Warum |
|---|---|---|
| Skelett | Knochennamen und Ruhepose wie `warrior_base` (KayKit `Rig_Medium`, 23 Knochen) – oder eine Zuordnung `QuellName → zielname` | dieselben Animationen für alle Teile |
| Ruhepose | T-Pose, Blick nach −Y, Z oben, Meter, Füße auf z = 0 | Bindung und Sockel stimmen nur in dieser Pose |
| Körper | **in Regionen getrennt** (mindestens Kopf, Rumpf, Arme, Beine – feiner ist möglich, z. B. Hände) | Ausrüstung blendet verdeckte Regionen aus (keine durchstechende Haut) |
| Gewichte | auf Knochen des Grundskeletts | Animationen ohne Nacharbeit |
| Ausrüstung | je Teil eine eigene Datei; starr: im Sockelraum (Waffen: Griff am Ursprung, Klinge +Z), verformbar: in Ruhepose um den Körper | siehe README → Modell-Konventionen |
| Materialien | eigene Texturen (Painted-Look im Bild, nicht nur über Licht); gepackt oder neben der Datei | Stil der gemalten Welt |
| Umfang | Richtwert ≤ 40 000 Dreiecke für den ganzen Körper | Sprites brauchen nicht mehr; schnelleres Rendern |

## 2. Ablauf
1. Modell prüfen: `blender -b --python blender/scripts/modell_pruefen.py -- <modell> figur=<figur>` → Bericht mit konkreten Hinweisen
   (Beispiele: `documentation/modellpruefungen/mannequin.md` – geeignet; `robotexpressive.md` – anderes Skelett, nicht geeignet).
2. Neue Figur anlegen (`configs/figuren/waldmark_krieger.json`): `koerper.datei`, `koerper.regionen` (Objektnamen je Region), `material: null`
   (eigene Texturen behalten), Animationsliste und Haltungen wie beim Test-Krieger, `testAsset: false`.
3. Ausrüstung: neue JSON-Dateien mit `skeleton: "warrior_base"` – die Test-Gegenstände bleiben zum Vergleich erhalten.
4. `python3 tools/produzieren.py waldmark_krieger` → Atlanten, Metadaten, Prüfbericht, Kombinationsbilder; Vorschau mit `?figur=waldmark_krieger`.

## 3. Fremde Skelette (z. B. Mixamo)
Mixamo-Animationen und -Rigs haben andere Knochennamen und eine andere Ruhepose. Möglich ist:
* **Knochenzuordnung** (`knochenZuordnung` in der Animationsbibliothek bzw. `zuordnung=` bei der Modellprüfung) – reicht, wenn die Ruhepose gleich ist.
* Bei abweichender Ruhepose: Retargeting in Blender (z. B. Rokoko/Auto-Rig Pro) vor dem Import – das ist bewusst nicht automatisiert.

## 4. Stil „Painted 3D“
Die Pipeline rendert, was das Modell zeigt. Der gemalte Eindruck entsteht im Modell (handgemalte Texturen, betonte Kanten, wenig Glanz),
die Beleuchtung ist im Renderstandard festgelegt (warm, von links oben) und für alle Teile gleich. Shader-Experimente (z. B. Kanten,
Farbstufen) gehören in `configs/render.json` / `kamera.py`, damit Körper und Ausrüstung immer gleich behandelt werden.
