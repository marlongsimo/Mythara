/*
 * Riftmere – Block H „Über den Pass“ (#160, doku/konzepte/phase-11.md): Kennungen der Quests und ihre Bausteine an einem Ort.
 * Die Quest-Dateien schreibt die Rolle Quests (a626fdfd1, doku/quests/h-bausteine.md); die Kennungen hier sind dieselben – Wegstein, Läden, Rezepte, Tür und Schalter hängen daran.
 *
 * Bausteine (Systeme):
 *   H1 „Über den Pass“: Wegstein-Ziel Steinhag (shared/wegstein.ts, wenn H1 fertig).
 *   H2 „Käse für die Passwacht“: Ziegenmilch (Rohstoff), Lab (von Mette), Rezept „kaeselaib“ am Herd der Alm (herd_alm, Kochen 45, gesperrt über
 *      QuestDef.sperren.herstellen von H2); Käsekeller (Region kaesekeller, Questobjekt kaeseregal) und Käsekessel (kaeserei_kessel_quest) von Welt,
 *      Ziegen folgen dem Spieler (Folgen-Baustein wie S6, Questfiguren).
 *   H3 „Tiefer als erlaubt“: Grubenstempel (Rezept an der Werkbank, Handwerk 45, über H3 gesperrt), leuchtende Erzprobe (für Hedda),
 *      der eingestürzte Stollen vor der Urkammer (shared/bosse.ts TUEREN „bergwerk_stollen“, Schalter urkammer_offen – H3 setzt ihn).
 *   H4 „Die Hüter der Hochlande“: drei Instanzen nach #116 (shared/bosse.ts HUETER): Schalter <hüter>_<raum> solange H4 läuft und der Hüter noch steht,
 *      <hüter>_danach nach H4. Sieg zählt als { art: "erlegen", typ: "grumhold" | "sturmschwinge" | "frostwitwe" }.
 */
export const H_QUESTS = {
  h1: "hochlande_ueber_den_pass",
  h2: "hochlande_kaese_fuer_die_passwacht",
  h3: "hochlande_tiefer_als_erlaubt",
  h4: "hochlande_hueter_der_hochlande",
  einsiedler: "hochlande_einsiedler_vom_spiegelsee",
} as const;
/** Schalter, die die Quests setzen (QuestDef.schalter) */
export const H_SCHALTER = {
  stollen: "urkammer_offen",
  grumhold: "grumhold_halle", grumholdDanach: "grumhold_danach",
  sturmschwinge: "sturmschwinge_horst", sturmschwingeDanach: "sturmschwinge_danach",
  frostwitwe: "frostwitwe_hoehle", frostwitweDanach: "frostwitwe_danach",
} as const;
