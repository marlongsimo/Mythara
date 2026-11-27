/*
 * Riftmere – zwei Waffen-Quests der mittleren Stufe (Ausgabe 1, App-Start), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Wunsch des Nutzers: Fernkampf und Magie bekommen, wie der Nahkampf mit dem Waldsäbel (Q3), je eine Quest-Waffe. Freigegeben 27.11. (Kurzfassung der Rolle Quests):
 * Stufe 30, je 2 Questpunkte, Waffe knapp unter episch (35), +15 % gegen eine Gegnerfamilie, nicht tauschbar.
 *  – „Hartwigs Eibenbogen“ (Fernkampf): Förster Hartwig · ein Eibenstamm vom Waldweg · eine Bogensehne an der Werkbank · QUER Mutter Hedda tauscht Rabenfedern gegen Moorglöckchen ·
 *    Hartwig baut den Bogen · drei Treffer an der Zielscheibe der Waldmark. Lohn-Waffe eibenbogen_hartwig (Fernkampf 30, fernAngriff 27, fernStaerke 29, +15 % gegen Wildtiere).
 *  – „Der Stab der Linde“ (Magie): Agnes an der Linde · den Zweig der Linde nehmen · drei Irrlichter im Rabenmoor (Splitterbinden 20) · QUER Mira Kräuterlieb bindet den Zweig mit einem Heiltrank ·
 *    am Bindestein weihen · drei Treffer mit Magie an der Zielscheibe. Lohn-Waffe lindenstab (Magie 30, genau 14, magieStaerke 182, +15 % gegen Untote und Rabenkult).
 * Die Waffe bekommt man vor den Probeschüssen (Folge.geben) – geschossen wird mit ihr; der Abschluss bucht XP, Splitter und Questpunkte.
 * Neu (Integration): Gegenstände eibenbogen_hartwig, lindenstab (Werte oben, Modelle Mondlangbogen bzw. Hirtenstab, Bild von Figuren); Gegnerfamilien „wild“ und „untot“ in config.ts (familie, wie „wald“).
 */
import type { QuestDef, Bed, QuestFigur, Voraussetzung, Option } from "./questbau";

type Feld = [number, number];
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
const tschuess = (zeile: string): Option => ({ id: "tschuess", text: "Auf Wiedersehen.", folge: [{ f: { zeilen: [zeile] } }] });
const HELD25: Voraussetzung = { text: "Heldenlevel 25", wenn: { heldenlevel: 25 } };

/* ───── Figuren (gleich wie in den anderen Quests) ───── */
const HARTWIG: QuestFigur = { id: "foerster", name: "Förster Hartwig", modell: "npc.foerster", x: 6362.5, y: 6452.5, blick: [0, 1] };   /* quest03.ts, S8 */
const HEDDA: QuestFigur = { id: "hedda", name: "Mutter Hedda", modell: "npc.hedda", x: 6289.4, y: 6677.4, blick: [1, 0] };            /* C2, H3 */
const AGNES: QuestFigur = { id: "agnes", name: "Agnes", modell: "npc.agnes", x: 6450.5, y: 6681.6, blick: [1, -1] };                 /* B1, S7 */
const MIRA: QuestFigur = { id: "mira", name: "Mira Kräuterlieb", modell: "npc.kraeuterfrau", x: 6456, y: 6441, blick: [0, -1] };      /* Mira, Einsiedler */

/* ───── Stellen ───── */
const EIBE: Feld = [6498.5, 6525.5];                 /* eibe_1 am Waldweg */
const SCHEIBEN: Feld = [6434.5, 6461];               /* Zielscheiben der Waldmark (A1) */
const LINDE_ZWEIG: Feld = [6451.5, 6677.5];          /* an der alten Linde in Weidenhain */
const BINDESTEIN: Feld = [6453.2, 6679.4];           /* Bindestein an der Linde (B1) */
const IRRLICHTER: Feld = [6372, 6669.5];             /* Irrlichter im Rabenmoor (irr_1–5) */

/* ══════════════ „Hartwigs Eibenbogen“ ══════════════ */
export const WAFFE_BOGEN = "nordwald_hartwigs_eibenbogen";
export const QUEST_EIBENBOGEN: QuestDef = {
  id: WAFFE_BOGEN, titel: "Hartwigs Eibenbogen", ort: "Nordwald · Waldweg · Rabenmoor · Waldmark", start: "Sprich mit Förster Hartwig am Waldrand der Waldmark.",
  logNeu: "Förster Hartwig wiegt einen alten Bogen in der Hand. Die Sehne ist gerissen, das Holz hat einen Riss.",
  logAngeboten: "Förster Hartwig will einen neuen Bogen bauen – einen, der zu einem Jäger passt.",
  logAbgabe: "Der Eibenbogen schießt, wohin du zielst. Sag Hartwig Bescheid.",
  logFertig: "Hartwigs Eibenbogen gehört jetzt dir. Er hat schon drei Jäger überlebt – und jedes Tier im Wald kennt ihn.",
  geber: "foerster",
  figuren: [HARTWIG, HEDDA],
  voraussetzungen: [HELD25, { text: "Fernkampf 30", wenn: { skill: { k: "fernkampf", min: 30 } } }],
  schritte: [
    { id: "eibe", text: "Einen Eibenstamm am Waldweg fällen", ereignis: { art: "sammeln", ziel: "eibe" }, wo: EIBE,
      log: "Hartwig braucht Eibenholz, gerade gewachsen. Am Waldweg steht eine alte Eibe. Fäll einen Stamm." },
    { id: "sehne", text: "Eine Bogensehne an der Werkbank drehen", ereignis: { art: "herstellen", rezept: "bogensehne" }, wo: "werkbank",
      log: "Dreh an einer Werkbank aus Flachs eine Bogensehne." },
    { id: "federn", text: "Rabenfedern bei Mutter Hedda holen", ereignis: { art: "antwort" }, bei: "hedda",
      log: "Für die Befiederung der Pfeile will Hartwig Rabenfedern – die besten hat Mutter Hedda im Rabenmoor. Sie tauscht gegen zwei Moorglöckchen." },
    { id: "bauen", text: "Hartwig den Bogen bauen lassen", ereignis: { art: "antwort" }, nach: ["eibe", "sehne", "federn"], bei: "foerster",
      log: "Eibenholz, Sehne, Federn: Bring alles zu Hartwig. Er baut den Bogen." },
    { id: "schiessen", text: "Drei Treffer mit dem Eibenbogen an der Zielscheibe", ereignis: { art: "treffen", ziel: "zielscheibe", waffe: "fern" }, anzahl: 3, nach: ["bauen"], wo: SCHEIBEN,
      log: "Leg den Eibenbogen an und triff dreimal die Zielscheibe der Waldmark ({n:schiessen})." },
  ],
  /* Hartwig: Förster, ruhig, spricht über den Wald wie über einen alten Freund. Hedda: tauscht nie umsonst. */
  dialoge: {
    foerster: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Dreißig Jahre hat er gehalten. Gestern ist die Sehne gerissen, und das Holz gleich mit.",
          "Ich bin zu alt, um einen neuen zu schnitzen und ihn auch noch zu schießen. Aber du – du hast die Hand dafür."], antworten: ["annehmen", "spaeter"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Drei Treffer? Ich hab's gehört. Der Wald hört so etwas."], antworten: ["fertig"] },
        { wenn: { ...LAEUFT, erledigt: ["bauen"] }, zeilen: ["Jetzt schieß. Drüben bei den Scheiben in der Waldmark. Dreimal ins Holz, dann gehört er dir."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["eibe", "sehne", "federn"], offen: ["bauen"] }, zeilen: ["Eibe, Sehne und Federn. …Gib her."], antworten: ["bauen", "tschuess"] },
        { wenn: LAEUFT, zeilen: ["Eibe vom Waldweg, eine Sehne aus Flachs, Rabenfedern von Hedda. Dann bau ich ihn."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Er liegt dir gut in der Hand. Pass auf ihn auf – er war mein bester Freund im Wald."], antworten: ["tschuess"] },
        { zeilen: ["Der Wald ist ruhig heute. Ruhig ist gut."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich helfe dir, einen neuen zu bauen. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Gut. Eibe brauche ich – am Waldweg steht eine, gerade gewachsen.",
          "Eine Sehne aus Flachs, an der Werkbank gedreht. Und Federn. Rabenfedern, die besten hat Mutter Hedda im Rabenmoor. Sie will dafür Moorglöckchen, wenn ich sie kenne."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Der Bogen wartet. Er hat Zeit. Ich auch."] } }] },
        { id: "bauen", text: "Eibe, Sehne und Rabenfedern.", wenn: { hat: "stamm_eibe" }, folge: [{ f: { erledige: ["bauen"], nehmen: [{ g: "stamm_eibe" }, { g: "bogensehne" }, { g: "rabenfedern" }],
          geben: [{ g: "eibenbogen_hartwig", name: "Hartwigs Eibenbogen" }],
          zeilen: ["Hartwig setzt sich auf den Baumstumpf vor seiner Hütte. Er schnitzt, biegt, wärmt das Holz über dem Feuer. Die Sonne wandert, er merkt es nicht.",
          "Dann spannt er die Sehne. Der Bogen singt, als er ihn loslässt.", "Hier. Er gehört dir – wenn du triffst. Drüben in der Waldmark stehen die Scheiben."] } }] },
        { id: "fertig", text: "Drei Treffer. Er schießt, wohin ich ziele.", folge: [{ f: { abschluss: true, zeilen: ["Hartwig nickt langsam und lächelt in seinen Bart.",
          "Dann ist er deiner. Nimm ihn mit, wo das Wild wohnt. Wölfe, Bären, Hyänen – sie werden ihn fürchten lernen."] } }] },
        tschuess("Der Wald hört dich."),
      ],
    },
    hedda: {
      reden: [
        { wenn: { ...LAEUFT, offen: ["federn"], anzahl: { g: "moorgloeckchen", min: 2 } }, zeilen: ["Kind. Du riechst nach Moorglöckchen. Was willst du dafür?"], antworten: ["federn_tauschen", "tschuess"] },
        { wenn: { ...LAEUFT, offen: ["federn"] }, zeilen: ["Rabenfedern? Für Hartwig? …Zwei Moorglöckchen. Sonst nichts."], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["federn"] }, zeilen: ["Grüß den alten Förster. Und sag ihm, er schuldet mir noch einen Hasen."], antworten: ["tschuess"] },
        { zeilen: ["Kind. Setz dich nicht auf den Kessel."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "federn_tauschen", text: "Zwei Moorglöckchen gegen Rabenfedern – für Hartwigs Bogen.", wenn: { anzahl: { g: "moorgloeckchen", min: 2 } }, folge: [{ f: { erledige: ["federn"],
          nehmen: [{ g: "moorgloeckchen", n: 2 }], geben: [{ g: "rabenfedern", name: "Rabenfedern" }],
          zeilen: ["Hedda zieht aus einem Sack ein Bündel schwarzer Federn. „Von den Akoluthen. Die brauchen sie nicht mehr.“", "„Für Hartwig. Der Alte schießt noch besser als er redet.“"] } }] },
        tschuess("Geh, Kind."),
      ],
    },
  },
  glueckwunsch: "Er singt, wenn du ihn spannst. Das hat er bei mir nie getan. Gut gemacht.",
  belohnungText: "Belohnung: Hartwigs Eibenbogen (Fernkampf 30, +15 % gegen Wildtiere), Fernkampf 2.000, Holzfällerei 800 XP, 300 Splitter",
  belohnung: { xp: { fernkampf: 2000 }, berufe: { holzfaellerei: 800 }, splitter: 300 },
  punkte: 2,
};

/* ══════════════ „Der Stab der Linde“ ══════════════ */
export const WAFFE_STAB = "weidenhain_der_stab_der_linde";
export const QUEST_LINDENSTAB: QuestDef = {
  id: WAFFE_STAB, titel: "Der Stab der Linde", ort: "Weidenhain · Rabenmoor · Waldmark", start: "Sprich mit Agnes an der alten Linde in Weidenhain.",
  logNeu: "An der alten Linde in Weidenhain hängt ein Zweig, der im Dunkeln leise leuchtet. Agnes lässt niemanden in seine Nähe.",
  logAngeboten: "Agnes will aus dem leuchtenden Zweig der Linde einen Stab machen – für jemanden, der Splitter binden kann.",
  logAbgabe: "Der Lindenstab trifft, wohin du willst. Sag Agnes Bescheid.",
  logFertig: "Der Stab der Linde gehört jetzt dir. In ihm schläft ein wenig vom Licht des Bindesteins – und was nicht leben sollte, fürchtet es.",
  geber: "agnes",
  figuren: [AGNES, MIRA],
  voraussetzungen: [HELD25, { text: "Magie 30", wenn: { skill: { k: "magie", min: 30 } } }, { text: "Splitterbinden 20", wenn: { skill: { k: "splitterbinden", min: 20 } } }],
  schritte: [
    { id: "zweig", text: "Den leuchtenden Zweig der Linde nehmen", ereignis: { art: "objekt", id: "ws_zweig" }, wo: LINDE_ZWEIG,
      log: "Agnes erlaubt dir, den leuchtenden Zweig von der alten Linde zu nehmen. Vorsichtig." },
    { id: "lichter", text: "Drei Irrlichter im Rabenmoor einfangen", ereignis: { art: "sammeln", ziel: "irrlicht" }, anzahl: 3, wo: IRRLICHTER,
      log: "Der Zweig braucht Licht, sonst erlischt er. Fang im Rabenmoor drei Irrlichter ein (Splitterbinden 20, {n:lichter})." },
    { id: "mira", text: "Mira Kräuterlieb den Zweig binden lassen", ereignis: { art: "antwort" }, nach: ["zweig"], bei: "mira",
      log: "Damit der Zweig nicht bricht, muss er gebunden werden. Mira Kräuterlieb in der Waldmark weiß, wie – mit einem Heiltrank als Sud." },
    { id: "weihen", text: "Den Stab am Bindestein weihen", ereignis: { art: "objekt", id: "ws_bindestein" }, nach: ["lichter", "mira"], wo: BINDESTEIN,
      log: "Leg den gebundenen Zweig und die Irrlichter auf den Bindestein an der Linde." },
    { id: "zaubern", text: "Drei Treffer mit Magie an der Zielscheibe", ereignis: { art: "treffen", ziel: "zielscheibe", waffe: "magie" }, anzahl: 3, nach: ["weihen"], wo: SCHEIBEN,
      log: "Nimm den Lindenstab und triff dreimal mit Magie die Zielscheibe der Waldmark ({n:zaubern})." },
  ],
  objekte: [
    { id: "ws_zweig", name: "Leuchtender Zweig", x: LINDE_ZWEIG[0], y: LINDE_ZWEIG[1], modell: "stelle", tat: "benutzen", tatText: "Den Zweig nehmen", weit: 2.5,
      text: "Der Zweig löst sich ohne einen Laut, als hätte er gewartet. In deiner Hand leuchtet er weiter – schwach, wie eine Kerze im Wind.", schon: "Den Zweig hast du.",
      sonst: [{ wenn: NEU, text: "Ein Zweig, der leise leuchtet. Agnes sieht dich an. Lieber nicht." }, { wenn: FERTIG, text: "Wo der Zweig war, treibt die Linde schon neu aus." }] },
    { id: "ws_bindestein", name: "Bindestein an der Linde", x: BINDESTEIN[0], y: BINDESTEIN[1], modell: "stelle", tat: "benutzen", tatText: "Den Stab weihen", weit: 3,
      braucht: { wenn: { anzahl: { g: "seelenlicht", min: 3 } }, text: "Der Zweig braucht Licht – drei Seelenlichter, eingefangen aus den Irrlichtern." },
      nehmen: [{ g: "seelenlicht", n: 3 }], geben: [{ g: "lindenstab" }],
      text: "Du legst den Zweig auf den Stein und lässt die Lichter frei. Sie kreisen, sinken, verschwinden im Holz. Als du den Stab aufhebst, ist er warm – und schwerer, als er aussieht.",
      schon: "Der Stab ist geweiht.", sonst: [{ wenn: NEU, text: "Der Bindestein an der Linde." }, { wenn: FERTIG, text: "Der Bindestein an der Linde." }, { wenn: { offen: ["mira"] }, text: "Der Zweig ist noch nicht gebunden. Er würde brechen." }] },
  ],
  /* Agnes: Hüterin der Linde, ernst, spricht leise. Mira: herzlich, praktisch. */
  dialoge: {
    agnes: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Siehst du den Zweig? Er leuchtet, seit der Bindestein wieder brennt.",
          "Wer Splitter binden kann, kann ihn tragen. Aber er muss gebunden werden, geweiht und gefüttert. Willst du?"], antworten: ["annehmen", "spaeter"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Ich habe es gespürt. Dreimal. Wie Wellen auf dem Wasser."], antworten: ["fertig"] },
        { wenn: { ...LAEUFT, erledigt: ["weihen"] }, zeilen: ["Jetzt zeig, was er kann. An den Scheiben in der Waldmark. Dreimal."], antworten: ["tschuess"] },
        { wenn: LAEUFT, zeilen: ["Den Zweig, drei Irrlichter aus dem Moor, Miras Sud. Dann der Stein."], antworten: ["tschuess"] },
        { wenn: FERTIG, zeilen: ["Die Linde treibt neu aus. Sie hat dir den Zweig gern gegeben."], antworten: ["tschuess"] },
        { zeilen: ["Die Linde hört zu. Sprich leise."], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich trage den Stab. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Gut. Nimm den Zweig – vorsichtig.",
          "Er braucht Licht: drei Irrlichter aus dem Rabenmoor. Und Mira in der Waldmark muss ihn binden, sonst bricht er.", "Dann leg alles auf den Bindestein hier. Er weiß, was zu tun ist."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Der Zweig wartet. Die Linde hat Geduld."] } }] },
        { id: "fertig", text: "Dreimal getroffen. Der Stab gehorcht.", folge: [{ f: { abschluss: true, zeilen: ["Agnes legt die Hand auf den Stab, dann auf die Linde.",
          "Dann gehört er dir. Was nicht leben sollte – Wiedergänger, die Raben des Kults –, wird ihn spüren. Trag ihn gut."] } }] },
        tschuess("Die Linde hört dich."),
      ],
    },
    mira: {
      reden: [
        { wenn: { ...LAEUFT, erledigt: ["zweig"], offen: ["mira"], hat: "heiltrank" }, zeilen: ["Oh! Ein Zweig von der Linde? Der leuchtet ja! Gib her, bevor er bricht."], antworten: ["binden", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["zweig"], offen: ["mira"] }, zeilen: ["Zum Binden brauch ich einen Heiltrank. Den koch ich zum Sud ein. Hast du einen?"], antworten: ["tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["mira"] }, zeilen: ["Der hält jetzt. Und riecht nach Ringelblume. Das macht nichts."], antworten: ["tschuess"] },
        { zeilen: ["Na, brauchst du was aus dem Kessel?"], antworten: ["tschuess"] },
      ],
      optionen: [
        { id: "binden", text: "Agnes sagt, du kannst ihn binden. Hier ist ein Heiltrank für den Sud.", wenn: { hat: "heiltrank" }, folge: [{ f: { erledige: ["mira"], nehmen: [{ g: "heiltrank" }],
          zeilen: ["Mira kocht den Trank ein, bis er zäh wird wie Honig. Dann streicht sie ihn auf den Zweig und wickelt ihn mit Bast.", "So. Der bricht nicht mehr. Bring ihn Agnes zum Stein."] } }] },
        tschuess("Pass auf dich auf, ja?"),
      ],
    },
  },
  glueckwunsch: "Die Linde hat dir ihren Zweig gegeben. Das tut sie nicht für jeden.",
  belohnungText: "Belohnung: Der Stab der Linde (Magie 30, +15 % gegen Untote und Rabenkult), Magie 2.000, Splitterbinden 800 XP, 300 Splitter",
  belohnung: { xp: { magie: 2000 }, berufe: { splitterbinden: 800 }, splitter: 300 },
  punkte: 2,
};
