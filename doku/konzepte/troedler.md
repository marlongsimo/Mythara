# Trödler – Händler, die alles ankaufen

Wunsch des Nutzers (26.11.2026). Ergänzt die Regel „Händler kaufen nur, was sie führen, zu 80 %“ (#87).

## Regel
- Hier und da in der Welt steht ein **Trödler** (eigene Figur, gern mit Karren oder Bauchladen).
- Er kauft **alles Handelbare**, zahlt dafür aber nur **50 % des Grundwerts** (abgerundet, mindestens 1 Splitter).
- **Grundwert** eines Gegenstands = der normale Händlerpreis, wo ihn ein Händler führt (höchster Preis, falls mehrere).
  Gegenstände, die kein Händler führt (Rohstoffe, Beute, Fische …), bekommen einen **festen Wert** in `shared/gegenstaende.ts` (Feld `wert`) – nach Stufe/Seltenheit gestaffelt, von der Integration eingetragen.
- **Nicht ankaufbar:** gebundene Gegenstände (Quest-Belohnungen), geladene „(s)“-Ausrüstung, Questgegenstände (`handelbar()`).
- Er **verkauft** nur Kleinkram (leere Fläschchen, Würmer, Seil …) oder gar nichts – er ist vor allem der Ort, an dem man Beute loswird.
- Bedienung wie beim Händler-Verkauf (#87): Rucksack daneben offen, Antippen = Preis, langes Drücken = „Verkaufen“ (Menge).

## Standorte (Vorschlag)
Nicht in jeder Stadt – eher an Wegen und in Dörfern, damit Reisen sich lohnt: Kreuzwald (Straßensperre), Osthof, Rabenmoor (Steg), Graufurt (Fährhafen), Heidrast, Karawanenrast Glutbrunn, Möwenbucht.

## Wer macht was
| Rolle | Aufgabe |
|---|---|
| Systeme | Händler-Art „kauft alles zu 50 %“ (Feld am Laden, z. B. `ankauf: { alles: 0.5 }`), Grundwert-Funktion (Ladenpreis oder `wert`) – baut auf #87 auf |
| Integration | Trödler in `laeden.ts` eintragen, `wert` für Rohstoffe/Beute/Fische festlegen |
| Figuren | Trödler-Figur (2 Varianten) mit Karren/Bauchladen |
| Welt | Standorte an Wegen und in Dörfern |
| Oberfläche | gleiches Fenster wie #87 |
