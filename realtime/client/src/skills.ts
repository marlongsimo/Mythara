/*
 * Skills des eigenen Helden (Kampfregeln v2, shared/kampfwerte.ts): Geschick, Stärke, Fernkampf, Magie – als XP – und der gewählte Angriffsstil je Kampfart.
 * Mit Konto zählt der Server (Migration 042, rpg_held); der Browser merkt sich den letzten Stand unter „ez_skills2“ für die Anzeige
 * und fürs Rechnen ohne Server (die v1-Werte unter „ez_skills“ bleiben unberührt). Als Gast zählt allein dieser Speicher auf dem Gerät.
 */
import { BERUFE } from "../../shared/berufe";
import { Kampfwerte, SkillXp, Skill, Art, kampfwerte, skillXpPruefen, levelAus, xpFuer, heldenlevel, SKILL_NAME, SKILL_MAX, SKILLS, stilIndex, xpEffektiv } from "../../shared/kampfwerte";
import { GEGENSTAENDE } from "../../shared/gegenstaende";
import { aktiverHeld } from "./held";
import { inventar, inventarVomServerDa } from "./inventar";

const SCHLUESSEL = "ez_skills2", STIL = "ez_stil";
export function skillsLesen(): SkillXp { try { return skillXpPruefen(JSON.parse(localStorage.getItem(SCHLUESSEL) || "null")); } catch { return skillXpPruefen(null); } }
export function skillsSchreiben(x: SkillXp): void { try { const v = JSON.stringify(skillXpPruefen(x)); if (localStorage.getItem(SCHLUESSEL) !== v) localStorage.setItem(SCHLUESSEL, v); } catch { /* privat */ } stufenPruefen(true); }
/** Die Kampfwerte des eigenen Helden (null ohne eigenen Helden) */
export function meineKampfwerte(x = skillsLesen()): Kampfwerte | null { return aktiverHeld() ? kampfwerte(x, inventar().angelegt, stilJetzt()) : null; }
export const stufenVon = (x: SkillXp): string => SKILLS.map((k) => levelAus(x[k] || 0, k)).join("/");
/** Kampfart der angelegten Waffe (ohne Waffe: Nahkampf mit den Fäusten) */
export function kampfartJetzt(): Art { const w = inventar().angelegt.waffe, G = w ? GEGENSTAENDE[w] : null; return G && G.waffe ? G.waffe.art : "nah"; }
/** Gewählter Angriffsstil je Kampfart (Index in STILE; 1 = Standard) */
export function stilLesen(art: Art): number { try { const o = JSON.parse(localStorage.getItem(STIL) || "{}") as Record<string, number>; return stilIndex(o[art], art); } catch { return 1; } }
export function stilJetzt(): number { return stilLesen(kampfartJetzt()); }
/** Stil wählen: merken und dem Kampf Bescheid geben (er meldet ihn dem Server oder rechnet neu) */
export function stilSetzen(art: Art, stil: number): void { try { const o = JSON.parse(localStorage.getItem(STIL) || "{}") as Record<string, number>; o[art] = stil; localStorage.setItem(STIL, JSON.stringify(o)); } catch { /* privat */ }
  window.dispatchEvent(new CustomEvent("ez-stil")); }
/** Zeichen je Skill (Tabs, XP-Drops): Bilder unter img/echtzeit/skills/ */
export const SKILL_ZEICHEN: Record<Skill, string> = Object.fromEntries(SKILLS.map((k) => [k, `<img class="skillbild" src="../img/echtzeit/skills/${k}.webp" alt="" width="32" height="32" draggable="false">`])) as Record<Skill, string>;
/** XP-Drops: nach jedem Treffer steigen die neuen XP mit Zeichen am oberen Bildschirmrand auf und verblassen (in den Einstellungen abschaltbar) */
const DROPS = "ez_xpdrops";
export function dropsAn(): boolean { try { return localStorage.getItem(DROPS) !== "0"; } catch { return true; } }
/** Einstellung: Dächer der begehbaren Gebäude immer ausblenden (welt3d/motor.ts liest sie je Bild) */
let daecherAusMerk: boolean | null = null;
export function daecherAus(): boolean { if (daecherAusMerk === null) { try { daecherAusMerk = localStorage.getItem("ez_daecher_aus") === "1"; } catch { daecherAusMerk = false; } } return daecherAusMerk; }
export function daecherAusSetzen(an: boolean): void { daecherAusMerk = an; try { localStorage.setItem("ez_daecher_aus", an ? "1" : "0"); } catch { /* privat */ } }
export function dropsSetzen(an: boolean): void { try { localStorage.setItem(DROPS, an ? "1" : "0"); } catch { /* privat */ } }
let dropsVorher: SkillXp | null = null;
/** Neuen Skill-Stand melden: was dazukam, erscheint als Drop. Der erste Stand (Laden) zeigt nichts */
export function xpDrops(x: SkillXp): void {
  const v = dropsVorher; dropsVorher = { ...x }; if (!v || !dropsAn()) return;
  const neu = SKILLS.map((k) => [k, (x[k] || 0) - (v[k] || 0)] as [Skill, number]).filter(([, n]) => n > 0); if (!neu.length) return;
  let box = document.getElementById("ez-xpdrops"); if (!box) { box = document.createElement("div"); box.id = "ez-xpdrops"; box.setAttribute("aria-hidden", "true"); document.body.appendChild(box); }
  const d = document.createElement("div"); d.className = "xpdrop"; d.innerHTML = neu.map(([k, n]) => `<span class="${k}" title="${SKILL_NAME[k]}">${SKILL_ZEICHEN[k]}+${n}</span>`).join("");
  box.appendChild(d); setTimeout(() => d.remove(), 1900); }
/** Berufe (Holzfällerei …): Zeichen und XP-Drop wie bei den Kampf-Skills */
export const BERUF_ZEICHEN: Record<string, string> = Object.fromEntries(BERUFE.map((b) => [b.id, `<img class="skillbild" src="../${b.symbolKlein}" alt="" width="32" height="32" draggable="false">`]));
export const BERUF_NAME: Record<string, string> = Object.fromEntries(BERUFE.map((b) => [b.id, b.name]));
export function berufDrop(beruf: string, n: number): void {
  if (!dropsAn() || !(n > 0)) return; let box = document.getElementById("ez-xpdrops"); if (!box) { box = document.createElement("div"); box.id = "ez-xpdrops"; box.setAttribute("aria-hidden", "true"); document.body.appendChild(box); }
  const d = document.createElement("div"); d.className = "xpdrop"; d.innerHTML = `<span class="${beruf}" title="${BERUF_NAME[beruf] || beruf}">${BERUF_ZEICHEN[beruf] || ""}+${Math.round(n)}</span>`;
  box.appendChild(d); setTimeout(() => d.remove(), 1900); }
/** Autoangriff (Standard an): wer mich angreift, bekommt sofort Antwort; aus = nur angeklickte Gegner angreifen */
const AUTO = "ez_autoangriff";
export function autoLesen(): boolean { try { return localStorage.getItem(AUTO) !== "0"; } catch { return true; } }
export function autoSetzen(an: boolean): void { try { localStorage.setItem(AUTO, an ? "1" : "0"); } catch { /* privat */ } window.dispatchEvent(new CustomEvent("ez-stil")); }
/** Fortschritt eines Skills: Level, XP im Level, XP bis zum nächsten, Anteil 0…100 */
export function skillStand(xp: number, skill?: Skill): { L: number; im: number; bis: number; anteil: number } { const L = levelAus(xp || 0, skill); xp = xpEffektiv(xp || 0, skill); const von = xpFuer(L, skill), nach = L < SKILL_MAX ? xpFuer(L + 1, skill) : von;
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

/* ───────── Banner beim Level-Aufstieg (jeder Kampf-Skill und jeder Beruf): oben in der Mitte, schmal, ein paar Sekunden ───────── */
let stufen: Record<string, number> | null = null, stufenBerufe = false;
const reihe: { text: string; zeichen: string }[] = []; let zeigt = false;
function stufenJetzt(): Record<string, number> { const x = skillsLesen(), aus: Record<string, number> = {};
  for (const k of SKILLS) aus[k] = levelAus(x[k] || 0, k);
  if (inventarVomServerDa()) { const b = inventar().berufe || {}; for (const k of Object.keys(BERUF_NAME)) aus["b:" + k] = levelAus(b[k] || 0); }
  return aus; }
/** Neue Stufen erkennen. vomServer: neue Kampf-XP sind da. Die ersten Werte (und Sprünge um mehr als zwei Stufen, etwa beim Anmelden) gelten nicht als Aufstieg */
export function stufenPruefen(vomServer = false): void { const neu = stufenJetzt();
  if (!stufen) { if (vomServer || inventarVomServerDa()) { stufen = neu; stufenBerufe = inventarVomServerDa(); } return; }
  if (!stufenBerufe && inventarVomServerDa()) { for (const k of Object.keys(neu)) if (k.startsWith("b:")) stufen[k] = neu[k]; stufenBerufe = true; }
  for (const [k, L] of Object.entries(neu)) { const alt = stufen[k]; if (alt !== undefined && L > alt && L - alt <= 2) {
    const beruf = k.startsWith("b:") ? k.slice(2) : "", name = beruf ? BERUF_NAME[beruf] : k === "lp" ? "Lebenspunkte" : SKILL_NAME[k as Skill];
    stufenBanner(`Du hast ${name} Stufe ${L} erreicht!`, beruf ? BERUF_ZEICHEN[beruf] || "" : SKILL_ZEICHEN[k as Skill] || ""); } }
  stufen = neu; }
export function stufenBanner(text: string, zeichen = ""): void { reihe.push({ text, zeichen }); if (!zeigt) naechstesBanner(); }
function naechstesBanner(): void { const b = reihe.shift(); if (!b) { zeigt = false; return; } zeigt = true;
  if (!document.getElementById("ez-stufe-stil")) { const s = document.createElement("style"); s.id = "ez-stufe-stil"; s.textContent = `
#ez-stufe { position: fixed; left: 50%; top: max(12px, env(safe-area-inset-top)); transform: translate(-50%, -140%); z-index: 60; pointer-events: none; display: flex; align-items: center; gap: 10px;
  max-width: min(92vw, 460px); padding: 7px 18px 7px 10px; border: 1px solid #c9a24a; border-radius: 10px; background: linear-gradient(#2c2112f0, #1a130af0); box-shadow: 0 4px 18px rgba(0,0,0,.55), inset 0 0 0 1px rgba(255,220,140,.12);
  font: 600 15px Cinzel, Georgia, serif; color: #ffe7a6; text-shadow: 0 1px 2px #000; transition: transform .35s ease-out, opacity .35s; opacity: 0; }
#ez-stufe.an { transform: translate(-50%, 0); opacity: 1; }
#ez-stufe .skillbild, #ez-stufe img { width: 28px; height: 28px; flex: 0 0 auto; } #ez-stufe span.z { display: grid; place-items: center; width: 28px; height: 28px; flex: 0 0 auto; }
#ez-stufe span.z svg { width: 26px; height: 26px; }`; document.head.appendChild(s); }
  let el = document.getElementById("ez-stufe"); if (!el) { el = document.createElement("div"); el.id = "ez-stufe"; el.setAttribute("role", "status"); document.body.appendChild(el); }
  el.innerHTML = `${b.zeichen ? `<span class="z">${b.zeichen}</span>` : ""}<span></span>`; (el.lastElementChild as HTMLElement).textContent = b.text;
  const e = el; requestAnimationFrame(() => e.classList.add("an"));
  setTimeout(() => { e.classList.remove("an"); setTimeout(naechstesBanner, 400); }, 3600); }
if (typeof window !== "undefined") addEventListener("ez-inventar", () => stufenPruefen());
