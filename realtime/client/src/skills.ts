/*
 * Skills des eigenen Helden (Kampfregeln v1, shared/kampfwerte.ts): Stärke, Geschicklichkeit, Magie – als XP.
 * Mit Konto zählt der Server (Migration 041, rpg_held); der Browser merkt sich den letzten Stand unter „ez_skills“ für die Anzeige
 * und fürs Rechnen ohne Server. Als Gast zählt allein dieser Speicher auf dem Gerät.
 */
import { Kampfwerte, SkillXp, kampfwerte, skillXpPruefen, levelAus, xpFuer, heldenlevel, SKILL_NAME, SKILL_MAX, Skill } from "../../shared/kampfwerte";
import { aktiverHeld } from "./held";
import { inventar } from "./inventar";

const SCHLUESSEL = "ez_skills";
export function skillsLesen(): SkillXp { try { return skillXpPruefen(JSON.parse(localStorage.getItem(SCHLUESSEL) || "null")); } catch { return skillXpPruefen(null); } }
export function skillsSchreiben(x: SkillXp): void { try { const v = JSON.stringify(skillXpPruefen(x)); if (localStorage.getItem(SCHLUESSEL) !== v) localStorage.setItem(SCHLUESSEL, v); } catch { /* privat */ } }
/** Die Kampfwerte des eigenen Helden (null ohne eigenen Helden) */
export function meineKampfwerte(x = skillsLesen()): Kampfwerte | null { return aktiverHeld() ? kampfwerte(x, inventar().angelegt) : null; }
export const stufenVon = (x: SkillXp): string => [levelAus(x.staerke), levelAus(x.geschick), levelAus(x.magie)].join("/");

/** Die drei Skill-Balken im Heldenkasten (Level und Fortschritt zum nächsten Level) */
export function skillAnzeige(x: SkillXp): void {
  const box = document.getElementById("ez-skills"); if (!box) return;
  let html = ""; for (const k of ["staerke", "geschick", "magie"] as Skill[]) {
    const L = levelAus(x[k]), von = xpFuer(L), bis = L < SKILL_MAX ? xpFuer(L + 1) : von, anteil = L < SKILL_MAX ? Math.min(100, Math.round(100 * (x[k] - von) / Math.max(1, bis - von))) : 100;
    html += `<span class="skill ${k}" title="${SKILL_NAME[k]}: ${L < SKILL_MAX ? `${x[k] - von} / ${bis - von} XP bis Level ${L + 1}` : "höchstes Level"}"><b>${SKILL_NAME[k] === "Geschicklichkeit" ? "Geschick" : SKILL_NAME[k]}</b><i class="ez-balken"><u style="width:${anteil}%"></u></i><span class="lv">${L}</span></span>`; }
  if (box.dataset.h !== html) { box.dataset.h = html; box.innerHTML = html; } box.hidden = false;
}
export { heldenlevel };
/** Das Level des eigenen Helden fürs Namensschild: Heldenlevel (v1); ohne eigenen Helden die alte Stufe aus der Erfahrung */
export function eigenesLevel(altStufe: number): number { return aktiverHeld() ? heldenlevel(skillsLesen()) : altStufe; }
