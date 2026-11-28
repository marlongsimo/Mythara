# Einsteiger-Insel Ankerholm: Quest „Gestrandet auf Ankerholm“ (#190, Ausgabe 2)

Rolle Quests, 28.11.2026. Grundlage: `doku/konzepte/einsteiger-insel.md`, vom Nutzer abgesegnet.

- **Datei:** `realtime/shared/quest_ankerholm.ts`, Kennung `ankerholm_gestrandet`
- **Stand:** Entwurf in `shared/quest_entwuerfe.ts`, bis die Insel steht.
- **Stellen:** Platzhalter in `ANKERHOLM` (oben in der Datei). Ich setze die echten ein, sobald Welt die Insel gebaut hat.
- **Hilfetexte:** `ANKERHOLM_HILFE`, je ein Satz Bedienung pro Abschnitt, am Rechner und am Handy. Die Oberfläche zeigt ihn unter dem Zielpfeil.
- **Zielpfeil:** Jeder Schritt hat `wo` (Stelle oder Figur).

## Ablauf: acht Abschnitte, 16 Schritte

| Abschnitt | Schritte | Figur |
|---|---|---|
| 1. Gestrandet | Telse am Feuer ansprechen, sie gibt das Trainings-Holzbeil | Kapitänin Telse Brack |
| 2. Ein neuer Mast | 3 Kiefern fällen (`sammeln kiefer`), Stämme zu Telse bringen | Telse |
| 3. Beschläge | bei Arvid Spitzhacke und Treibholz holen, 2 Kupfererz abbauen, 1 Kupferbarren schmelzen, Schiffsbeschläge schmieden | Arvid Thorn |
| 4. Proviant | bei Merle Angel und Würmer holen, 2 Bachlinge fangen, 2 braten, Merle kosten lassen | Merle Haff |
| 5. Haukes Lehre | bei Hauke Schwert, Schild, Bogen und Stab leihen; rote Puppe mit Nahkampf, grüne mit Fernkampf, blaue mit Magie treffen | Hauke Morn |
| 6. Die Plünderer | 3 Plünderer, dann der Schwarze Ole | – |
| 7. Die Wahl | Hauke die Übungswaffen zurückgeben und einen Weg wählen; er gibt den Satz (Nahkampf: Schwert, Schild, Lederpanzer · Fernkampf: Bogen, Lederpanzer · Magie: Stab, Robe) | Hauke |
| 8. Ablegen | Telse die Beschläge geben, ablegen; Ankunft am Steg der Waldmark, dort Abschluss bei Hagan Voss | Telse, Hagan Voss |

**Lohn:** je 100 XP in Stärke, Defense, Fernkampf, Magie, Holzfällerei, Bergbau, Schmieden, Fischen und Kochen, 50 Splitter, 1 Questpunkt. Werte nach Wunsch von Integration.

**Übergang zu Quest 1:** Hagan Voss (`hagan_steg`) steht am Steg, solange man ihn nach dem Ablegen noch nicht gesprochen hat. Er schließt die Quest ab und kündigt Jori an. Danach steht er wie immer am Rathaus (`hagan`, Quest 1).

## Abweichung vom Konzept: die Ausrüstungswahl

Das Konzept sieht die Wahl im Abschlussfenster vor. `belohnung.wahl` kann dort aber nur **einen** Gegenstand wählen lassen, keinen Satz. Außerdem liegt der Abschluss erst bei Hagan, nach Schritt 8. Deshalb wählt man im Gespräch mit Hauke:
- Drei Antworten, je mit den Teilen des Satzes im Text.
- Hauke gibt den Satz mit „(Du bekommst: …)“.

Baut Systeme eine Wahl von Sätzen im Abschlussfenster, stelle ich auf das Fenster um.

## Was andere bauen (laut Konzept)

**Welt:**
- Insel Ankerholm (Stellen siehe `ANKERHOLM`)
- Kiefernhain mit mindestens 3 Kiefern
- 2 Kupferadern
- Ofen und Amboss, Steg mit Fischstelle für Bachlinge, Feuer
- Übungsplatz mit drei Puppen, Bucht der Plünderer
- Steg der Waldmark

**Figuren:**
- Seeschwalbe (Wrack und geflickt)
- Telse, Arvid, Merle, Hauke (bis dahin vorhandene Modelle: `npc.hafen_frau`, `npc.schmied`, `npc.moewen_fischerin`, `npc.passwaechter`)
- Plünderer, Schwarzer Ole, drei Puppen in Rot, Grün und Blau

**Systeme:**
- Neue Figuren starten auf der Insel mit laufender Quest.
- Übungspuppen `puppe_nah`, `puppe_fern`, `puppe_magie` sind nur mit ihrer Kampfart zu treffen und melden „treffen“.
- Sobald der Schritt „ablegen“ erledigt ist, fährt die Seeschwalbe sofort zum Steg der Waldmark.
- Wer stirbt, erwacht am Feuer.
- Wunsch: `nehmen` sollte auch angelegte Gegenstände nehmen. Bis dahin müssen Neue Haukes Waffen erst ablegen; der Hilfetext sagt es.

**Integration:**
- Baum `kiefer` mit Ertrag `stamm_kiefer`
- Rezept `schiffsbeschlaege` am Amboss (1 Kupferbarren) und Gegenstand `schiffsbeschlaege` (Questgegenstand)
- Gegner `pluenderer` und `schwarzer_ole` (Mini-Boss mit angezeigtem Rundumschlag)
- Werte und Lohn

**Quests, beim Einschalten:**
- echte Stellen eintragen
- bei Jori (Quest 1) `kommt` erst nach Ankerholm (Phase neu oder fertig)
- Welt-Test schreiben
