# Gegnerbeute in die Berufe

*Konzept-Chat, 27.11.2026. **Vom Nutzer abgesegnet (27.11.)**: Verteilung passt, Rabenküken wird Haustier, **Gift kommt vorerst nicht**.*
Kanon: Neue Rohstoffe aus Gegnerbeute sollen **verteilt** in die Berufe fließen, auch in Kräuterkunde und Kochen, nicht alles ins Handwerk. Es kommen **keine neuen Rohstoffe** dazu, nur neue Rezepte für Beute, die es schon gibt.
Bestand nachgesehen (Stand `feature/realtime-engine`, 27.11.): Welche Beute fällt, und wo wird sie heute gebraucht?

## Was heute ungenutzt herumliegt

| Beute | fällt bei (Gegnerstufe neu) | heute genutzt |
|---|---|---|
| Krebsschere | Strandkrabbe, Riesenkrabbe, Schlickkrebs (31–79) | nirgends |
| Federn | Seevogel, Reiher, Krähen, Ente, Klippenadler, Sturmschwinge | nur in Quest H4 |
| Wolfsfell | Heidewolf, Graupelz, Steppenwolf, Frostwolf (45–111) | nirgends |
| Chitin | Sandkriecher, Sandmutter (77–157) | nirgends |
| Giftdrüse | Glutskorpion (85) | nirgends |
| Wachtstein (selten) | Turmwächter, Tjark, Grabwächter, Grauer Hauptmann (92–135) | nirgends |
| Grüner Splitterkern | Grünlicht (76) | nur in Quest D2 |
| Rabenküken (legendär) | Oberster Rabenpriester | nirgends (Sammelstück) |

## Vorschlag: Verteilung auf die Berufe

Jeder Beruf bekommt etwas. Einige Beuteteile haben zwei Wege, damit sie gefragt bleiben.

| Beute | Beruf | neues Rezept (Vorschlag) | Stufe | Wirkung |
|---|---|---|---|---|
| Krebsschere | **Kochen** | Krebsscheren in Salzkruste (Feuer, + Salz) | 38 | heilt wie Fisch dieser Stufe |
| Krebsschere | **Kräuterkunde** | Scherenpulver für einen „Panzersud“ (mit Eisenhut) | 42 | Defense +3, 5 min |
| Federn | **Fischen** | Federköder (Werkbank, Federn + Garn) | 25 | an der Küste mehr Fang, seltener Fisch etwas häufiger |
| Federn | **Kräuterkunde** | Leichtfuß-Trank (Federn + Wegerich) | 30 | 10 % schneller laufen, 3 min |
| Wolfsfell | **Handwerk** | Fellhaube (Kopf, leichte Fernkampf-Rüstung) | 40 | eigene Haube zwischen den vorhandenen Stufen |
| Wolfsfell | **Handwerk** | Fellfutter für Lederrüstung (Rüstung +1 Stufe Abwehr) | 55 | Aufwertung, keine neue Rüstung |
| Chitin | **Schmieden** | Chitinplatten auf Schilde schmieden (Schild +Fernkampf-Abwehr) | 60 | Aufwertung |
| Chitin | **Kräuterkunde** | Steinhaut (sehr stark) mit Chitin statt Golemstein | 65 | Defense +6, 5 min |
| Giftdrüse | *(später)* | Klingengift und Gegengift, **erst wenn es Gift im Kampf gibt** (Nutzer: vorerst nicht) | – | – |
| Wachtstein | **Schmieden** | Wachtstahl (Eisenbarren + Wachtstein) für die Wachtrüstung (Phase 8) als Aufwertung | 60 | Wachtrüstung +1 Stufe |
| Wachtstein | **Splitterbinden** | Wachtsiegel (Wachtstein + Splitter): Teleport nach Grauwacht | 50 | einmal nutzbar |
| Grüner Splitterkern | **Splitterbinden** | grüne Ladung für geladene Waffen | 55 | Treffer heilen 1 LP (selten) |
| Rabenküken | **(kein Beruf)** | wird ein **Haustier** (Pets gibt es seit Steinhag) | – | Begleiter, kosmetisch |

**Verteilung:** Kochen 1 · Kräuterkunde 3 (+2 später mit Gift) · Fischen 1 · Handwerk 2 · Schmieden 2 · Splitterbinden 2. Holzfällerei und Bergbau liefern schon Rohstoffe und bekommen nichts.

## Regeln
- Es kommen **keine neuen Rohstoffe** dazu, nur neue Rezepte und Ergebnisse.
- Ergebnisse sind **handelbar**. Damit lohnt sich Beute auch für Spieler, die den Beruf nicht haben.
- Läden **kaufen** die Beute nicht an (Kanon: Händler kaufen nur, was sie führen). Wert kommt also aus Handel und Berufen.

## Offen
- Genaue Werte, XP und Stufen der Rezepte (Integration/Systeme).
- Giftdrüse bleibt bis zu einem Gift-System ohne Verwendung.
