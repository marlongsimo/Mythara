/*
 * Riftmere – Quest „Die Taverne öffnet“ (Phase 3b, Kochen), Daten für den Quest-Baukasten (shared/questbau.ts).
 * Grundlage: doku/konzepte/phase-3.md Abschnitt 3b. Hilde Krug, Wirtin der Taverne der Waldmark; Voraussetzung Kochen 10.
 * Sie will wieder aufmachen und braucht drei Proben: ein Brot, einen gebratenen Bachling, eine Fischsuppe (Kochen 15, Mühlbarsch, Kessel).
 * Lohn: Kochen-XP, 80 Splitter, 1 Questpunkt; danach Schalter „taverne_offen“ (Herd, Kessel, Verkauf einfacher Gerichte).
 * Damit die Suppe gekocht werden kann, steht die Küche schon während der Quest offen: Schalter „taverne_kueche“ (Herd und Kessel), ab dem Annehmen.
 *
 * Im Spiel (shared/quests.ts). Als Entwurf wartete die Quest auf Phase 3b (Issue #4). Erwartete Bausteine – Kennungen siehe doku/quests/3b-bausteine.md:
 * Gegenstände brot (vorhanden), fisch_bachling_gebraten, fischsuppe; Stationen Herd und Kessel in der Taverne mit den Schaltern oben.
 */
import type { QuestDef, Bed } from "./questbau";

export const TAVERNE = "waldmark_die_taverne_oeffnet";
const NEU: Bed = { phase: ["neu"] }, FERTIG: Bed = { phase: ["fertig"] }, LAEUFT: Bed = { phase: ["laeuft"] };
/** Hilde vor der Tür der Taverne (Tür: Waldmark 28 | 30,8) */
const HILDE: [number, number] = [6428.5, 6432.5];
const HILFE = ["Drei Proben. Ein Brot – das backt Grete, oder du backst es selbst im Ofen der Bäckerei.",
  "Einen gebratenen Bachling. Die beißen in Weidenhain, frag Lambert Schilf am Mühlgraben.",
  "Und eine Fischsuppe: ein Mühlbarsch und Wasser, im Kessel hier drinnen. Dafür brauchst du Kochen 15. Mein Kessel steht dir offen, solange du für mich kochst."];

export const QUEST_TAVERNE: QuestDef = {
  id: TAVERNE, titel: "Die Taverne öffnet", ort: "Waldmark · Kochen", start: "Sprich mit Hilde Krug vor der Taverne der Waldmark.",
  logNeu: "Vor der Taverne der Waldmark steht eine Frau mit hochgekrempelten Ärmeln und starrt auf die verrammelte Tür.",
  logAngeboten: "Hilde Krug vor der Taverne der Waldmark sucht noch jemanden, der kochen kann.",
  logAbgabe: "Hilde Krug hat alle drei Proben. Sag ihr, dass sie aufmachen kann.",
  logFertig: "Die Taverne der Waldmark hat wieder offen. Hilde Krug verkauft einfache Gerichte, und an Herd und Kessel darfst du selbst kochen.",
  geber: "hilde",
  figuren: [{ id: "hilde", name: "Hilde Krug", modell: "npc.hilde", x: HILDE[0], y: HILDE[1], blick: [0, 1] }],
  voraussetzungen: [{ text: "Kochen 10", wenn: { skill: { k: "kochen", min: 10 } } }],
  schritte: [
    { id: "brot", text: "Ein Brot bringen", ereignis: { art: "antwort" }, bei: "hilde", gruppe: "proben",
      log: "Bring Hilde Krug drei Proben: ein Brot, einen gebratenen Bachling und eine Fischsuppe ({n:proben})." },
    { id: "fisch", text: "Einen gebratenen Bachling bringen", ereignis: { art: "antwort" }, bei: "hilde", gruppe: "proben",
      log: "Bring Hilde Krug drei Proben: ein Brot, einen gebratenen Bachling und eine Fischsuppe ({n:proben})." },
    { id: "suppe", text: "Eine Fischsuppe bringen", ereignis: { art: "antwort" }, bei: "hilde", gruppe: "proben",
      log: "Bring Hilde Krug drei Proben: ein Brot, einen gebratenen Bachling und eine Fischsuppe ({n:proben}). Die Suppe kochst du im Kessel der Taverne (Kochen 15)." },
  ],
  /* Hilde: laut, gerade heraus, Hände in den Hüften. Redet in Anweisungen und Küchenweisheiten; lobt selten, dann aber richtig. Je Probe eine eigene Begrüßung. */
  dialoge: {
    hilde: {
      reden: [
        { wenn: { ...NEU, voraussetzungen: true }, zeilen: ["Na endlich jemand, der nicht nach Pferd riecht. Riechst nach Rauch. Kochst du?",
          "Zwei Winter war die Straße zu. Keine Gäste, kein Bier, kein Grund aufzumachen. Jetzt kommen sie wieder – und mein Koch ist in Graufurt geblieben."],
          antworten: ["annehmen", "wer", "spaeter"] },
        { wenn: NEU, zeilen: ["Zu. Siehst du doch.", "Ich such einen Koch, keinen Gast. Komm wieder, wenn du ein Feuer von einem Ofen unterscheiden kannst."], antworten: ["was_fehlt", "wer", "tschuess"] },
        { wenn: FERTIG, zeilen: ["Rein mit dir, ist warm drinnen. Herd und Kessel kennst du ja.", "Und wenn's dir schmeckt: weitersagen. Wenn nicht: mir sagen."], antworten: ["wer", "tschuess"] },
        { wenn: { ...LAEUFT, alle: true }, zeilen: ["Brot, Fisch, Suppe. Alle drei auf dem Tisch.", "Dann schauen wir mal, ob das hier wieder eine Taverne wird."], antworten: ["aufmachen"] },
        { wenn: { ...LAEUFT, erledigt: ["brot", "fisch"] }, zeilen: ["Fehlt nur noch die Suppe. Die Suppe ist das Herz. Ohne Suppe keine Taverne."],
          antworten: ["suppe_geben", "hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["suppe"], offen: ["brot"] }, zeilen: ["Die Suppe hast du schon gemacht? Erst das Schwerste. Gefällt mir.", "Jetzt noch das Einfache."],
          antworten: ["brot_geben", "fisch_geben", "hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["fisch"] }, zeilen: ["Der Bachling war ordentlich. Knusprig, nicht schwarz. Wer hat dir das gezeigt?"],
          antworten: ["brot_geben", "suppe_geben", "hilfe", "tschuess"] },
        { wenn: { ...LAEUFT, erledigt: ["brot"] }, zeilen: ["Gretes Brot? Oder deins? …Egal. Es ist Brot, und es ist gut.", "Weiter. Fisch und Suppe."],
          antworten: ["fisch_geben", "suppe_geben", "hilfe", "tschuess"] },
        { zeilen: ["Na? Hast du was für mich? Ich hab Hunger und eine leere Gaststube."], antworten: ["brot_geben", "fisch_geben", "suppe_geben", "hilfe", "tschuess"] },
      ],
      optionen: [
        { id: "annehmen", text: "Ich koche für dich. (Quest annehmen)", folge: [{ f: { start: true, zeilen: ["Gut. Aber erst probier ich. Drei Proben, dann sehen wir weiter.",
          "Ein Brot. Einen gebratenen Bachling. Und eine Fischsuppe – im Kessel hier drinnen, die Tür ist jetzt offen für dich.", "Und fass nichts an, was du nicht kochst."] } }] },
        { id: "wer", text: "Wer bist du?", folge: [
          { wenn: FERTIG, f: { weiter: true, zeilen: ["Hilde Krug. Wirtin. Wieder.", "Klingt gut, oder? Wieder."] } },
          { f: { weiter: true, zeilen: ["Hilde Krug. Mir gehört die Taverne, und meiner Mutter davor.", "Wir haben nie zugemacht. Nicht im Hungerwinter, nicht als die Wölfe kamen. Erst, als die Straße zu war. Ohne Straße keine Gäste."] } }] },
        { id: "spaeter", text: "Jetzt nicht.", folge: [{ f: { anbieten: true, zeilen: ["Dann eben nicht. Die Tür bleibt zu, die Töpfe bleiben kalt. Ist ja nicht deine Taverne."] } }] },
        { id: "was_fehlt", text: "Was muss ich können?", folge: [{ f: { weiter: true, zeilen: ["Kochen 10. Darunter verbrennst du mir das Wasser.", "Brat Fisch an einem Feuer, back Brot. Dann komm wieder."] } }] },
        { id: "hilfe", text: "Wie war das noch?", folge: [{ f: { weiter: true, zeilen: HILFE } }] },
        { id: "brot_geben", text: "Ein Brot geben.", wenn: { offen: ["brot"], hat: "brot" }, folge: [{ f: { erledige: ["brot"], nehmen: [{ g: "brot" }],
          zeilen: ["Hilde bricht das Brot, riecht daran und nickt.", "Krume ist gut. Das kommt auf den Tisch."] } }] },
        { id: "fisch_geben", text: "Einen gebratenen Bachling geben.", wenn: { offen: ["fisch"], hat: "fisch_bachling_gebraten" }, folge: [{ f: { erledige: ["fisch"], nehmen: [{ g: "fisch_bachling_gebraten" }],
          zeilen: ["Sie zupft mit den Fingern ein Stück ab. Kaut.", "Salz fehlt. Sonst – ja. Das geht."] } }] },
        { id: "suppe_geben", text: "Eine Fischsuppe geben.", wenn: { offen: ["suppe"], hat: "fischsuppe" }, folge: [{ f: { erledige: ["suppe"], nehmen: [{ g: "fischsuppe" }],
          zeilen: ["Hilde nimmt einen Löffel. Dann noch einen. Dann sagt sie lange nichts.", "…So hat sie bei meiner Mutter geschmeckt. Genau so."] } }] },
        { id: "aufmachen", text: "Mach auf, Hilde. (Quest abschließen)", folge: [{ f: { abschluss: true, zeilen: ["Hilde stemmt die Tür auf. Drinnen ist es kalt und staubig – aber nicht lange.",
          "Hier. Dein Anteil, und mehr als verdient.", "Herd und Kessel gehören ab heute auch dir. Und das Bier ist für dich billiger. Nicht umsonst. Billiger."] } }] },
        { id: "tschuess", text: "Auf Wiedersehen.", folge: [{ wenn: FERTIG, f: { zeilen: ["Bis zum nächsten Hunger."] } }, { f: { zeilen: ["Und bring Hunger mit, wenn du wiederkommst."] } }] },
      ],
    },
  },
  /* Küche (Herd, Kessel) ab dem Annehmen, damit die Suppe gekocht werden kann; Verkauf erst nach dem Abschluss */
  schalter: { taverne_kueche: [LAEUFT, FERTIG], taverne_offen: FERTIG },
  glueckwunsch: "Die Taverne ist offen! Rein mit dir, ist warm drinnen.",
  belohnungText: "Belohnung: Kochen-XP, 80 Splitter · danach: die Taverne der Waldmark ist offen (Herd, Kessel, Verkauf einfacher Gerichte)",
  belohnung: { berufe: { kochen: 400 }, splitter: 80 },
  punkte: 1,
};
