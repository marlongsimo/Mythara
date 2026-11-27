/*
 * Riftmere – Block H „Über den Pass“ (#160, doku/konzepte/phase-11.md): Kennungen der Quests und ihre Bausteine an einem Ort.
 * Die Quest-Dateien schreibt die Rolle Quests; die Kennungen hier sind Vorschläge und gelten, sobald die Quests so heißen
 * (sonst bitte hier ändern – Wegstein, Rezepte, Tür und Schalter hängen daran).
 *
 * Bausteine (Systeme):
 *   H1 „Über den Pass“: Wegstein-Ziel Steinhag (shared/wegstein.ts, wenn H1 fertig).
 *   H2 „Käse für die Passwacht“: Ziegenmilch (Rohstoff), Rezept „kaeserad“ am Herd der Alm (Kochen 40, gesperrt über QuestDef.sperren.herstellen von H2),
 *      Ziegen folgen dem Spieler (Folgen-Baustein wie S6, Questfiguren).
 *   H3 „Tiefer als erlaubt“: Grubenholz (Rezept an der Werkbank, Handwerk 40, über H3 gesperrt), Erzprobe mit Splitterlicht (für Hedda),
 *      Tür zur Urkammer (shared/bosse.ts TUEREN „urkammer“, Schalter urkammer_offen – nach H3).
 *   H4 „Die Hüter der Hochlande“: drei Instanzen nach #116 (shared/bosse.ts HUETER): Schalter <hüter>_<raum> solange H4 läuft und der Hüter noch steht,
 *      <hüter>_danach nach H4. Sieg zählt als { art: "erlegen", typ: "grumhold" | "sturmschwinge" | "frostwitwe" }.
 */
export const H_QUESTS = {
  h1: "hochlande_ueber_den_pass",
  h2: "hochlande_kaese_fuer_die_passwacht",
  h3: "hochlande_tiefer_als_erlaubt",
  h4: "hochlande_die_hueter",
  einsiedler: "hochlande_der_einsiedler",
} as const;
/** Schalter, die die Quests setzen (QuestDef.schalter) */
export const H_SCHALTER = {
  urkammer: "urkammer_offen",
  grumhold: "grumhold_halle", grumholdDanach: "grumhold_danach",
  sturmschwinge: "sturmschwinge_horst", sturmschwingeDanach: "sturmschwinge_danach",
  frostwitwe: "frostwitwe_hoehle", frostwitweDanach: "frostwitwe_danach",
} as const;
