# Mythara UI-Baukasten

Rahmen, Buttons, Leisten, Container und Ornamente für **Mythara · Splitterlande** – nach den Entwürfen in `vorlage/`, ohne Inhalte und Icons.
Alle Bausteine sind reines CSS (das Halbmond-Dock zusätzlich mit einem kleinen JS-Helfer), skalieren verlustfrei und lassen sich in Gold, Eis und Bronze einfärben.

**Ansehen:** `UI/index.html` im Browser öffnen (live: `https://mythara-dungeon.de/UI/`). Die Seite zeigt jeden Baustein in allen Varianten und Zuständen, dazu einen Abschnitt „Anwendung“ mit der rechten Spielseite aus den Bausteinen.

## Inhalt

| Datei / Ordner | Zweck |
|---|---|
| `mythara-ui.css` | alle Bausteine (Klassen `mu-…`) |
| `mythara-ui.js` | `muDock()` für das Halbmond-Dock, `muAbklingen()` für Abklingzeiten, `muAlle()` |
| `index.html` | Katalog zum Ansehen und Ausprobieren (Metall oben umschaltbar) |
| `png/` | jeder Baustein als transparentes PNG in 1×, 2× und 4× (`name.png`, `name@2x.png`, `name@4x.png`) |
| `werkzeug/export.mjs` | erzeugt `png/` neu: `node UI/werkzeug/export.mjs` (alle) oder `node UI/werkzeug/export.mjs slot-aktiv` |
| `vorlage/` | die Gestaltungsentwürfe, nach denen der Baukasten gebaut ist |

## Einbinden

```html
<link rel="stylesheet" href="UI/mythara-ui.css">
<script type="module">
  import { muAlle } from "./UI/mythara-ui.js";
  muAlle(); // zeichnet alle [data-mu-dock]
</script>
```

Die Schrift Cinzel wird aus `fonts/` geladen (liegt im Projekt).

## Grundregeln

- **Größe:** Jeder Baustein hat eine Grundgröße `--mu-g` (zum Beispiel Slot-Durchmesser oder Kartengröße). Alles andere – Ringstärke, Steine, Spitzen, Schrift – richtet sich danach: `style="--mu-g: 48px"`.
- **Metall:** Gold ist Standard. `mu-eis` (Silber/Eis) oder `mu-bronze` (Bronze mit roten Steinen) auf einen Baustein oder einen ganzen Bereich setzen.
- **Steine:** `mu-stein-blau` (Standard), `mu-stein-rot`, `mu-stein-gold`.
- **Farben anpassen:** `--mu-m1` (hell) … `--mu-m4` (tief) für das Metall, `--mu-grund-a/b/c` für die dunklen Flächen, `--mu-text`, `--mu-schrift`.
- Kinder richten sich nach dem Elternbaustein (Slots in einer Leiste, Rauten an der Karte). Die Größe also am Eltern-Baustein setzen.

## Bausteine

### Runde Buttons / Slots – `.mu-slot`
```html
<button class="mu-slot" aria-label="Angriff"><svg>…</svg></button>
```
Zustände: `:hover`, `ist-aktiv`, `:active` / `ist-gedrueckt`, `ist-ausgewaehlt` (auch Tastaturfokus), `ist-abklingend` mit `--mu-cd` (0…1, Anteil der Restzeit), `:disabled` / `ist-deaktiviert`, `ist-gesperrt` (Schloss), `ist-warnung`, `ist-quest` (pulsiert).
Eine Nummer kommt mit `<b class="mu-zahl">1</b>` in den Slot und sitzt dann oben links.
Abklingzeit aus JS: `muAbklingen(slot, 0.4)`.

### Minimap-Rahmen – `.mu-minimap`
```html
<div class="mu-minimap" style="--mu-g:180px">
  <div class="mu-minimap__karte" style="background-image:url(karte.webp)"></div>
  <i class="mu-minimap__nord">N</i>
  <i class="mu-raute links"></i><i class="mu-raute rechts"></i><i class="mu-raute unten"></i>
</div>
```
Spielerpunkt: `<i class="mu-minimap__punkt" style="left:50%;top:50%">` in die Karte.

### Halbkreis-Dock – `.mu-dock` + `muDock()`
```html
<div class="mu-dock" data-mu-dock style="--mu-g:180px">
  <button class="mu-slot" aria-label="Karte">…</button>
  <button class="mu-slot" aria-label="Teleport">…</button>
  <button class="mu-slot" aria-label="Held">…</button>
</div>
```
1 bis 5 Slots; `muDock()` zeichnet den Bogen und setzt die Slots darauf. Hängt das Dock links an einer Minimap gleicher Größe, die Klasse `mu-an-karte` dazunehmen. Das Dock ist dann `1,02 × --mu-g` breit, und seine rechte Kante liegt auf der Kartenmitte (siehe „Anwendung“ in `index.html`).

### Vertikale Menüleiste – `.mu-menueleiste`
Slots untereinander, optional mit Beschriftung als `<figure><button class="mu-slot">…</button><figcaption>Rucksack</figcaption></figure>`.
`mit-steinen` setzt Edelsteine in die Spitzen oben und unten.

### Skill-Leiste – `.mu-skillleiste`
Vier `.mu-slot` und eine `<i class="mu-raute"></i>` für den Stein in der Mitte. Varianten über `mu-eis` und `mu-bronze`.

### Wechsel-Schalter Primär / Sekundär – `.mu-wechsel`
```html
<button class="mu-wechsel" aria-pressed="false"><span>Primär</span><span class="mu-slot" aria-hidden="true"><svg>…</svg></span><span>Sekundär</span></button>
```
`ist-sekundaer` schaltet um, `ist-aus` zeigt keine Seite hervorgehoben.

### Status-Banner – `.mu-banner`
`mu-mehrkampf` (rot), `mu-einzelkampf` (blau), `mu-sicher` (grün). Inhalt: Symbol (`<svg>`), Text, Zahl als `<span class="mu-pille">2 Gegner</span>`, Zierstein unten als `<i class="mu-raute"></i>`.

### Zoom-Leiste – `.mu-zoomleiste`
`<button class="mu-slot">−</button><b>100 %</b><button class="mu-slot">+</button>`; `mit-steinen` für Steine an den Enden.

### Ressourcenleisten – `.mu-balken`
```html
<div class="mu-balken mu-lp" style="--mu-wert:.8"><i></i><span>256 / 320</span></div>
```
`mu-lp`, `mu-mana`, `mu-ausdauer`, `mu-ep`; Beschriftung darüber mit `.mu-beschriftung`.

### Container & Panels
- `.mu-tafel`: Fläche mit Rahmen und vier Eckornamenten. Die Ecken bleiben gleich groß, die Fläche wächst mit dem Inhalt, wie bei 9-Slice. `mu-schlicht` lässt die Ecken weg.
- `.mu-plakette`: kleine Schilder in Bronze, `mu-stahl` oder `mu-dunkel`.

### Dialog – `.mu-sprechblase`
Sprechblase mit Zipfel, auch als `mu-dunkel`.

### Listen & Auswahl
`.mu-eintrag` als Listenzeile, mit `ist-gewaehlt`. Haken und Auswahlknopf auf echten Eingabefeldern: `<input type="checkbox" class="mu-haken">`, `<input type="radio" class="mu-auswahl">`.

### Nummern-Badges – `.mu-zahl`
Gold, `mu-silber`, `mu-dunkel`, `mu-raute` (Inhalt in `<span>`), `mu-sechseck`.

### Marker & Hinweise
`.mu-raute` (Edelstein, `mu-hohl` für die Fassung), `.mu-zielring` (Bodenmarkierung; `mu-blau`, `mu-rot`, `mu-doppelt`), `.mu-pfeil`, `.mu-wappen` (Schild, z. B. mit „!“), `.mu-hinweispunkt`.

### Trenner & Ornamente
`.mu-trenner` auf `<hr>` (`mu-doppelt`, `mu-stein`, `mu-spitzen`). `.mu-ornament` als Ecke (`mu-ecke-or/-ul/-ur`), Stern (`mu-stern`) oder Spitze (`mu-spitze`).

## Barrierefreiheit

Buttons sind echte `<button>`. Symbol-Buttons brauchen ein `aria-label`. Die Fokus-Markierung ist sichtbar (blau). Bei „Bewegung reduzieren“ pulsiert der Quest-Zustand nicht.

## Im Spiel

Die rechte Spielseite auf Tablet und PC (Minikarte mit Goldring, Halbmond-Dock, Zoomleiste, Kampf-Banner, Menüsäule) folgt diesem Baukasten. Sie steht derzeit noch als eigenes CSS in `realtime/client/index.html` und `realtime/client/src/rahmen.ts`; die Dock-Form ist dieselbe wie in `mythara-ui.js`.
