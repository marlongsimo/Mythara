# Midgame-Bosse: Mechanik und Steckbriefe

*Entwurf Konzept-Chat, 27.11.2026, noch nicht abgesegnet.*
Grundlage: `boss-regeln.md` (Kanon), `endgame.md` Abschnitt 1 (jeder bestehende Boss bekommt **1–2 Mechaniken**, nicht steigend; Ziel: ein Gespür fürs Bossen).
Bestand nachgesehen in `realtime/shared/bosse.ts` und `config.ts` (Stand `feature/realtime-engine`, 27.11.). Die Stufen bleiben, wie sie sind (Nutzer).

## Was es heute gibt

| Boss | Stufe | heute im Spiel |
|---|---|---|
| Hauptmann Rotmantel | 64 | Rundumschlag, ruft 2 Schläger, trinkt am Thron einen Heiltrank |
| Federmutter Ravena | 98 | **keine Mechanik**, nur Grundangriffe |
| Der Wrackkapitän | 103 | Säbelwirbel, ruft 2 Strandräuber, Geisterflut (Deckung hinter Kisten) |
| Tjark Sölde | 119 | **keine Mechanik** (kein Boss-Eintrag) |
| Der Graue Hauptmann | 135 | Rundumschlag, ruft 2 Wiedergänger, Grabessturm (Deckung hinter Grabsteinen) |
| Der Oberste Rabenpriester | 151 | Doppelhieb, Splitterbecken heilt, Schweben, ruft Akoluthen, Sturzraben, Schwarzer Flügelschlag (Deckung) |
| Die Sandmutter | 157 | Sandschlag, Eingraben, ruft Sandkriecher, Treibsand |

Auffällig: Zwei Bosse haben gar nichts, der Oberste hat sechs Dinge. Außerdem sind fast alle schwach gegen **Magie** (Magie-Abwehr 0–10). Man lernt also kaum, den Stil zu wechseln.

## Regel für alle Midgame-Bosse

- **Rundumschläge** (angezeigter Kreis um den Boss, ausweichen) zählen als **Grundlage** und nicht als eigene Mechanik. Jeder Boss darf einen haben.
- Dazu kommen **1–2 Kernmechaniken** aus den Boss-Regeln. Alles andere fällt weg.
- Jeder Boss bekommt **eine klare Stil-Schwäche**, verteilt auf alle drei Stile, damit man das Wechseln lernt.
- Jeder Boss hat das **Schwächefenster** nach einem gemeisterten Großangriff (Boss-Regeln).
- Jeder Boss ist **Schläger** oder **Taktiker** (Boss-Regeln).

## Steckbriefe (Vorschlag)

| Boss | Art | schwach gegen | Kernmechanik 1 | Kernmechanik 2 | fällt weg |
|---|---|---|---|---|---|
| **Rotmantel** | Schläger | Magie | **Diener:** 2 Schläger bei halbem Leben | – (bewusst nur eine, erster Boss) | Heiltrank am Thron |
| **Federmutter** | Taktiker | **Fernkampf** | **Ausweichen:** „Federsturm“, angezeigte Fläche am Ziel | **Diener:** 3 Moorraben aus dem Nest. Bleiben sie, heilen sie Ravena | – (neu) |
| **Wrackkapitän** | Schläger | Magie | **Deckung:** Geisterflut, hinter Kisten | **Diener:** 2 Strandräuber | – |
| **Tjark Sölde** | Schläger | **Nahkampf** (leichte Söldnerrüstung) | **Unterbrechen:** „Sammelruf“ wird angezeigt geladen. Nicht unterbrochen, rufen zwei Deserteure an | **Ausweichen:** Ansturm in angezeigter Linie | – (neu) |
| **Grauer Hauptmann** | Schläger | Magie | **Deckung:** Grabessturm, hinter Grabsteinen | **Diener:** 2 Wiedergänger | – |
| **Oberster Rabenpriester** | Taktiker | **Nahkampf** (Robe) | **Stilwechsel:** Schweben, in der Luft nur mit Fernkampf oder Magie treffbar | **Gelände:** Splitterbecken heilt ihn, bis man es trübt (Quest kennt „becken_getrübt“) | Doppelhieb, Akoluthen, Sturzraben, Flügelschlag |
| **Sandmutter** | Schläger | **Fernkampf** | **Gelände:** Treibsand wandert über angezeigte Felder | **Diener:** Sandkriecher beim Eingraben | – (Eingraben bleibt als Übergang) |

Verteilung der Schwächen: **Magie 3** (Rotmantel, Wrackkapitän, Grauer Hauptmann), **Fernkampf 2** (Federmutter, Sandmutter), **Nahkampf 2** (Tjark, Oberster).
Die Hüter danach kombinieren alles (Stilwechsel und je Hüter eine eigene Mechanik).

## Begehrter Seltenheits-Drop je Boss (Vorschlag)

Jeder Boss hat **einen** seltenen Drop, schwächer als die Endgame-Ausrüstung (`endgame.md`):

| Boss | Drop (Vorschlag) | Art |
|---|---|---|
| Rotmantel | Rotmantels Umhang | kosmetisch |
| Federmutter | Federamulett (+kleiner Fernkampf-Bonus) | Schmuck |
| Wrackkapitän | Kompass der „Morgenstern“ (kosmetisch, zeigt zum nächsten Wrack) | Spielerei |
| Tjark Sölde | Söldnerring (+kleiner Stärke-Bonus) | Schmuck |
| Grauer Hauptmann | Grauer Wachtmantel | kosmetisch |
| Oberster Rabenpriester | Rabenfokus (+kleiner Magie-Bonus) | Schmuck |
| Sandmutter | **Glutsteinschild** (steht schon im Kanon) | Schild Stufe 40 |

Modelle gibt es dafür noch keine. Die Werte trägt die Integration ein, wenn es freigegeben ist.

## Offen
- Passen die Kernmechaniken je Boss? Sollen beim Obersten wirklich vier Dinge wegfallen?
- Passt die neue Verteilung der Schwächen? Sie ändert Abwehrwerte, die Stufen können sich dadurch leicht verschieben.
- Seltenheits-Drops: Ideen so recht? Werte und Chancen (Vorschlag etwa 1 : 100 je Sieg in der starken Fassung).
