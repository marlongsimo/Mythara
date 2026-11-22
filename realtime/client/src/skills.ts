/*
 * Skills des eigenen Helden (Kampfregeln v2, shared/kampfwerte.ts): Geschick, Stärke, Fernkampf, Magie – als XP – und der gewählte Angriffsstil je Kampfart.
 * Mit Konto zählt der Server (Migration 042, rpg_held); der Browser merkt sich den letzten Stand unter „ez_skills2“ für die Anzeige
 * und fürs Rechnen ohne Server (die v1-Werte unter „ez_skills“ bleiben unberührt). Als Gast zählt allein dieser Speicher auf dem Gerät.
 */
import { Kampfwerte, SkillXp, Skill, Art, kampfwerte, skillXpPruefen, levelAus, xpFuer, heldenlevel, SKILL_NAME, SKILL_MAX, SKILLS } from "../../shared/kampfwerte";
import { GEGENSTAENDE } from "../../shared/gegenstaende";
import { aktiverHeld } from "./held";
import { inventar } from "./inventar";

const SCHLUESSEL = "ez_skills2", STIL = "ez_stil";
export function skillsLesen(): SkillXp { try { return skillXpPruefen(JSON.parse(localStorage.getItem(SCHLUESSEL) || "null")); } catch { return skillXpPruefen(null); } }
export function skillsSchreiben(x: SkillXp): void { try { const v = JSON.stringify(skillXpPruefen(x)); if (localStorage.getItem(SCHLUESSEL) !== v) localStorage.setItem(SCHLUESSEL, v); } catch { /* privat */ } }
/** Die Kampfwerte des eigenen Helden (null ohne eigenen Helden) */
export function meineKampfwerte(x = skillsLesen()): Kampfwerte | null { return aktiverHeld() ? kampfwerte(x, inventar().angelegt, stilJetzt()) : null; }
export const stufenVon = (x: SkillXp): string => SKILLS.map((k) => levelAus(x[k] || 0, k)).join("/");
/** Kampfart der angelegten Waffe (ohne Waffe: Nahkampf mit den Fäusten) */
export function kampfartJetzt(): Art { const w = inventar().angelegt.waffe, G = w ? GEGENSTAENDE[w] : null; return G && G.waffe ? G.waffe.art : "nah"; }
/** Gewählter Angriffsstil je Kampfart (0, 1 = Normal, 2) */
export function stilLesen(art: Art): number { try { const o = JSON.parse(localStorage.getItem(STIL) || "{}") as Record<string, number>; return o[art] === 0 || o[art] === 2 ? o[art] : 1; } catch { return 1; } }
export function stilJetzt(): number { return stilLesen(kampfartJetzt()); }
/** Stil wählen: merken und dem Kampf Bescheid geben (er meldet ihn dem Server oder rechnet neu) */
export function stilSetzen(art: Art, stil: number): void { try { const o = JSON.parse(localStorage.getItem(STIL) || "{}") as Record<string, number>; o[art] = stil; localStorage.setItem(STIL, JSON.stringify(o)); } catch { /* privat */ }
  window.dispatchEvent(new CustomEvent("ez-stil")); }
/** Autoangriff (Standard an): wer mich angreift, bekommt sofort Antwort; aus = nur angeklickte Gegner angreifen */
const AUTO = "ez_autoangriff";
export function autoLesen(): boolean { try { return localStorage.getItem(AUTO) !== "0"; } catch { return true; } }
export function autoSetzen(an: boolean): void { try { localStorage.setItem(AUTO, an ? "1" : "0"); } catch { /* privat */ } window.dispatchEvent(new CustomEvent("ez-stil")); }
/** Fortschritt eines Skills: Level, XP im Level, XP bis zum nächsten, Anteil 0…100 */
export function skillStand(xp: number, skill?: Skill): { L: number; im: number; bis: number; anteil: number } { xp = xp || 0; const L = levelAus(xp, skill), von = xpFuer(L, skill), nach = L < SKILL_MAX ? xpFuer(L + 1, skill) : von;
  return { L, im: xp - von, bis: nach - von, anteil: L < SKILL_MAX ? Math.min(100, Math.round(100 * (xp - von) / Math.max(1, nach - von))) : 100 }; }

/** Die Skill-Balken im Heldenkasten (Level und Fortschritt zum nächsten Level) */
export function skillAnzeige(x: SkillXp): void {
  const box = document.getElementById("ez-skills"); if (!box) return;
  let html = ""; for (const k of SKILLS) { const S = skillStand(x[k], k);
    html += `<span class="skill ${k}" title="${SKILL_NAME[k]}: ${S.L < SKILL_MAX ? `${S.im} / ${S.bis} XP bis Level ${S.L + 1}` : "höchstes Level"}"><b>${SKILL_NAME[k]}</b><i class="ez-balken"><u style="width:${S.anteil}%"></u></i><span class="lv">${S.L}</span></span>`; }
  if (box.dataset.h !== html) { box.dataset.h = html; box.innerHTML = html; } box.hidden = false;
}
export { heldenlevel };
/** Das Level des eigenen Helden fürs Namensschild: Heldenlevel (v2); ohne eigenen Helden die alte Stufe aus der Erfahrung */
export function eigenesLevel(altStufe: number): number { return aktiverHeld() ? heldenlevel(skillsLesen()) : altStufe; }
