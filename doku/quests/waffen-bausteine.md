# Waffen-Quests der mittleren Stufe (Ausgabe 1, App-Start)

Rolle Quests, 27.11.2026. Wunsch des Nutzers: Fernkampf und Magie bekommen je eine Quest-Waffe, wie der Nahkampf den Waldsäbel. Die Kurzfassung hat der Nutzer freigegeben.

- **Datei:** `realtime/shared/quest_waffen.ts`
- **Stand:** **Entwurf** in `shared/quest_entwuerfe.ts`, bis Integration die zwei Waffen einträgt. Der Server lädt Entwürfe nicht, deshalb geht nichts halb fertig live.
- **Welt-Test:** `realtime/test/waffen-welt.test.mjs` (Ports 8881/8882)
  - Mit vorläufigen Waffen im Probelauf: grün in 31 s.
  - Solange die Quests Entwurf sind, endet der Test sofort grün.

| Quest | Kennung | Ablauf | Quer | Lohn |
|---|---|---|---|---|
| „Hartwigs Eibenbogen“ | `nordwald_hartwigs_eibenbogen` | Förster Hartwig · Eibe am Waldweg fällen · Bogensehne (Werkbank) · Rabenfedern von Hedda (2 Moorglöckchen) · Hartwig baut den Bogen · anlegen · 3 Treffer an der Zielscheibe der Waldmark | **Mutter Hedda** (Rabenmoor) | **Hartwigs Eibenbogen**, Fernkampf 2.000, Holzfällerei 800 XP, 300 Splitter, 2 QP |
| „Der Stab der Linde“ | `weidenhain_der_stab_der_linde` | Agnes an der Linde · den leuchtenden Zweig nehmen · 3 Irrlichter im Rabenmoor (Splitterbinden 20) · Mira bindet ihn mit einem Heiltrank · Bindestein · anlegen · 3 Treffer mit Magie | **Mira Kräuterlieb** (Waldmark) | **Lindenstab**, Magie 2.000, Splitterbinden 800 XP, 300 Splitter, 2 QP |

**Voraussetzungen:**
- **Eibenbogen:** Heldenlevel 25 und Fernkampf 30.
- **Lindenstab:** Heldenlevel 25, Magie 30 und Splitterbinden 20.

Hartwig bietet zuerst den Waldsäbel (Q3) an, solange der offen ist. Danach bietet er den Bogen an.

## Was Integration einträgt

**Neue Gegenstände:**

| Gegenstand | Werte | Modell | Bild |
|---|---|---|---|
| `eibenbogen_hartwig` | „Hartwigs Eibenbogen“, Fernkampf-Waffe, Anforderung Fernkampf 30, Takt 5, Reichweite 7, fernAngriff 27, fernStaerke 29, `gegen: { wild: 0.15 }`, nicht tauschbar | Mondlangbogen | Figuren |
| `lindenstab` | „Der Stab der Linde“, Magie-Waffe, Anforderung Magie 30, Takt 5, Reichweite 6, genau 14, magieStaerke 182, `gegen: { untot: 0.15 }`, nicht tauschbar | Hirtenstab oder Sternenszepter | Figuren |

**Neue Gegnerfamilien** in `config.ts` (Feld `familie`, wie `wald`):

| Familie | Gegner |
|---|---|
| `wild` | Wolf, Heidewolf, Steppenwolf, Rudelführer, Hochlandbär, Hochlandwidder, Ockerhyäne |
| `untot` | Wiedergänger, Grabwächter, Grauer Hauptmann, Rabenpriester-Akoluthen, Oberster Rabenpriester |

Der Bonus „gegen“ gilt schon für jede Angriffsart (`shared/sim.ts`: `waffe.gegen[familie]`). Systeme muss dafür nichts bauen.

Ist beides da, nehme ich die zwei Quests aus den Entwürfen in `shared/quests.ts` auf und lasse den Welt-Test laufen.
