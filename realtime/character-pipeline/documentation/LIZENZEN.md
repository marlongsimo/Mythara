# Herkunft und Lizenzen der Assets in der Figuren-Pipeline

| Asset | Pfad | Quelle | Lizenz | Status |
|---|---|---|---|---|
| Mannequin (Testkörper) | `blender/models/kaykit/Mannequin_Medium.glb` | KayKit Character Animations 1.1, Kay Lousberg (www.kaylousberg.com); bezogen über github.com/NoLimitNexus/game-models (`tools/reference`, Stand d188ebf) | **CC0 1.0** (Lizenztext liegt daneben) | **TEST ASSET** |
| Animationen (Rig_Medium_*) | `blender/animations/kaykit/` | KayKit Character Animations 1.1, Kay Lousberg; bezogen wie oben (`library/animations`) | **CC0 1.0** (Lizenztext liegt daneben) | wiederverwendbar |
| Ausrüstung `test_*` | `blender/equipment/test/` | selbst erzeugt mit `blender/scripts/testausruestung_bauen.py` | frei (Eigenbau) | **TEST ASSET** |

Nicht verwendet: die eigenen Körperteile im Repo NoLimitNexus/game-models (`library/ours`) – dort ist keine Lizenz angegeben.
Namensnennung von KayKit ist nicht vorgeschrieben, aber erwünscht: „Kay Lousberg, www.kaylousberg.com“.

Alle Test-Assets sind in ihren Konfigurationen mit `"testAsset": true` und „(TEST ASSET)“ im Namen gekennzeichnet; die Prüfung (`tools/pruefen.py`) schlägt fehl, wenn die Kennzeichnung fehlt.
Die Vorschau und die Testszene zeigen den Hinweis „TEST ASSET – keine finale Mythara-Grafik“.
