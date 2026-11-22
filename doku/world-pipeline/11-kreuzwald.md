# 11 – Der Kreuzwald (Wegenetz südlich der Waldmark)

Stand: 21.11.2026 · Grundlage: Skizze des Auftraggebers (Waldmark oben, Kreuzung, Steinwege West/Ost, Feldweg Süd, zwei Pfade zu einer Lichtung, ringsum Wald)

## Was gebaut wurde

| Teil | Umsetzung |
|---|---|
| Südtor | offen und **ohne Knopf** passierbar (die frühere „Ansehen“-Stelle im Tor ist entfernt) |
| Weg Tor → Kreuzung | Erdweg wie im Dorf, etwa 3 Felder breit, ca. 44 Felder lang |
| Steinwege West und Ost | neue Geländeart **Steinweg** (`k`), 6 Felder breit, mit Grassaum; West ca. 94, Ost ca. 126 Felder lang |
| Feldweg Süd | Erdweg, 4 Felder breit, mit Grassaum, ca. 130 Felder lang |
| Pfad vom Steinweg Ost | schmaler Erdpfad (2–3 Felder) hinunter zur Lichtung |
| Pfad vom Feldweg | schmaler Erdpfad nach Osten zur Lichtung |
| Lichtung | rund und unregelmäßig, ca. 50 × 38 Felder, Wiese mit Blumenflecken, vier einzelne Bäume am Saum |
| Wegenden | Steinwege West und Ost: je ein **umgestürzter Baum** quer über dem Weg, Hinweis „Hier geht es noch nicht weiter“; dazu eine unsichtbare Sperre durch den Wald bis an den Gebietsrand (im Osten oberhalb der Lichtung) |
| Wald | dichte Bäume aus der vorhandenen Baumbibliothek, nie auf Wegen, Säumen oder der Lichtung |

## Technik

- **Ein Gebiet, Kennung `waldweg`:** 8 × 6 Chunks (256 × 192 Felder) ab Chunk 198|202, das Südtor liegt bei x = 112. Der Spielserver kennt die Orte `waldmark` und `waldweg`; als *ein* Gebiet bleibt der Server unverändert, und alle Spieler im Wald sehen sich gegenseitig. Positionen relativ zum Gebiet: höchstens 12 288 px (Grenze des Servers: 20 000).
- **Steinweg statt Pflaster:** gleiche Steinoptik wie das Pflaster des Dorfs, aber kleinere Steine (`kachelPx` 118 statt 190). Das Dorf bleibt unverändert.
- **Umgestürzte Bäume** (`werkzeug/welt/haus.py`): `wald_baumstamm_01` liegt quer (für den Feldweg), `wald_baumstamm_02` liegt in die Tiefe, in der Schrägansicht der Gebäude gezeichnet (für die Steinwege, deshalb nicht spiegelbar). Beide sind **ohne Bildvorlage** gezeichnet; die Rinde entsteht aus Rauschen. Sie sind also frei verwendbar.
- **Freigabe:** neuer Schalter `suedtor` in `client/src/freigabe.ts` (an). Er ist getrennt vom alten Schalter `waldweg`, der die Kampagnen-Strecke nach Weidenhain meint und aus bleibt. Die Weltkarte gibt es weiterhin nur mit freigeschalteten Kampagnen.
- Erzeugung: `node werkzeug/welt/waldmark.mjs && node werkzeug/welt/bauen.mjs` (Boden für 54 Chunks: etwa 9 Minuten).

## Prüfungen

`test/welt-waldmark.test.mjs` prüft zusätzlich:
- Steinwege mindestens 5 Felder breit, Feldweg 4–6 Felder;
- Kreuzung, Lichtung, beide Pfade und alle drei Wegenden sind vom Brunnen aus erreichbar;
- hinter keinem der drei Stämme ist ein Feld erreichbar.

`test/welt-spielstart.test.mjs` prüft: kein Knopf im Südtor, man läuft hindurch in den Kreuzwald, und ohne Kampagnen gibt es keine Weltkarte.

## Nachtrag 21.11.2026

Der Feldweg endet nicht mehr am Stamm: Er führt bis an den Südrand und weiter nach **Weidenhain** (siehe 12-weidenhain.md).

## Für später

- Hinter den Stämmen anbauen: Die Sperren aus `kollision.sperren` entfernen und das Gebiet erweitern oder ein Nachbargebiet anlegen. Für den Server dann denselben Ort verwenden oder ihn um den neuen Ort ergänzen.
- Die Lichtung ist bewusst leer: Platz für einen besonderen Ort, ein Lager oder Gegner.
- Ein Wegweiser an der Kreuzung wäre ein naheliegendes nächstes Objekt.
