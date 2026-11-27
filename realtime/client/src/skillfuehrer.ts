/*
 * Mythara – Skill-Übersicht der Berufe (wie der Skill Guide in OSRS, in unserem Stil): Skill im Tab antippen →
 * Reiter (Bäume, Werkzeuge, Rezepte …), je Zeile Level, Bild, Name und XP; was man schon kann, leuchtet, der Rest ist abgedunkelt.
 */
import { GEGENSTAENDE } from "../../shared/gegenstaende";
import { BAEUME, BEILE } from "../../shared/holz";
import { ADERN, SPITZHACKEN } from "../../shared/bergbau";
import { REZEPTE, Rezept } from "../../shared/handwerk";
import { FISCHE, FISCH_GERAETE } from "../../shared/fischen";
import { LICHTER } from "../../shared/splitterbinden";
import { berufAn } from "../../shared/berufe";
import { tafelZeigen } from "./welt";
import { inventar } from "./inventar";
import { skillStand, BERUF_ZEICHEN, BERUF_NAME } from "./skills";

export interface Zeile { level: number; g: string; name: string; text: string }
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const nameVon = (g: string) => (GEGENSTAENDE[g] ? GEGENSTAENDE[g].name : g);
const werkzeugZeilen = (liste: { g: string; level: number; stufe: number }[], was: string): Zeile[] =>
  liste.map((w) => ({ level: w.level, g: w.g, name: nameVon(w.g), text: w.stufe ? `${was} schneller (Stufe ${w.stufe})` : "Das erste Werkzeug" }));
const rezeptZeile = (r: Rezept): Zeile => ({ level: r.level, g: r.ergebnis, name: nameVon(r.ergebnis), text: `${r.station === "hand" ? "Im Rucksack zusammensetzen · " : ""}${r.xp} XP · ${r.zutaten.map((z) => `${z.n} × ${z.g.map(nameVon).join(" / ")}`).join(", ")}` });
const nachLevel = (z: Zeile[]) => [...z].sort((a, b) => a.level - b.level);

/** Die Reiter eines Berufs */
function reiter(k: string): [string, Zeile[]][] {
  if (k === "holzfaellerei") return [["Bäume", Object.values(BAEUME).filter((b) => !b.quest).map((b) => ({ level: b.level, g: b.stamm, name: b.name, text: `${b.xp} XP je Stamm` }))], ["Beile", werkzeugZeilen(BEILE, "Fällt")]];
  if (k === "bergbau") return [["Adern", Object.values(ADERN).filter((a) => !a.quest).map((a) => ({ level: a.level, g: a.ertrag, name: a.name, text: `${a.xp} XP je Erz` }))], ["Spitzhacken", werkzeugZeilen(SPITZHACKEN, "Baut")]];
  const an = (f: (r: Rezept) => boolean) => nachLevel(REZEPTE.filter((r) => !r.quest && f(r)).map(rezeptZeile)), roh = ["Sehne und Garn", "Leder", "Stoff"];
  if (k === "schmieden") return [["Barren", an((r) => r.station === "esse")], ["Schmieden", an((r) => r.station === "amboss")]];
  if (k === "handwerk") return [["Rohstoffe", an((r) => roh.includes(r.gruppe))], ["Werkbank", an((r) => (r.station === "werkbank" || r.station === "hand") && !roh.includes(r.gruppe))]];
  if (k === "fischen") return [["Fische", nachLevel(Object.values(FISCHE).filter((f) => !f.quest).map((f) => ({ level: f.level, g: f.ertrag, name: f.name, text: `${f.xp} XP je Fisch · mit ${nameVon(f.werkzeug || "")}${f.koeder ? " und " + nameVon(f.koeder) : ""}` })))],
    ["Geräte", FISCH_GERAETE.map((w) => ({ level: w.level, g: w.g, name: nameVon(w.g), text: w.level > 1 ? "Für Fische, die nicht an die Angel gehen" : "Das erste Gerät" }))]];
  if (k === "kochen") return [["Rezepte", an((r) => berufAn(r.station) === "kochen")]];
  if (k === "splitterbinden") return [["Seelenlichter", nachLevel(Object.values(LICHTER).filter((l) => !l.quest).map((l) => ({ level: l.level, g: l.ertrag, name: l.name, text: `${l.xp} XP je Licht` })))], ["Bindestein", an((r) => r.station === "bindestein")]];
  return [];
}
/** Kampf-Skills: was man mit dem Level anlegen kann (Gegenstände mit Anforderung, shared/gegenstaende.ts) */
export function kampfFreischaltungen(k: string): [string, Zeile[]][] {
  const z = nachLevel(Object.values(GEGENSTAENDE).filter((G) => G.anforderung && G.anforderung.skill === k).map((G) => ({ level: G.anforderung!.level, g: G.id, name: G.name, text: `${G.art} · anlegen ab Level ${G.anforderung!.level}` })));
  return [["Ausrüstung", z]]; }
const STIL = `
#ez-konto .tafel.fuehrer { --f: 7px; width: min(600px, 100%); text-align: left; max-height: min(90vh, 760px); display: flex; flex-direction: column; gap: 8px; padding-top: 12px; padding-bottom: 12px; }
#ez-konto .fuehrer > .schliessen { z-index: 3; }
#ez-konto .fuehrer > .skopf { flex: 0 0 auto; display: flex; align-items: center; gap: 10px; padding: 0 36px 8px 0; position: relative; }
#ez-konto .fuehrer > .skopf::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 1px; background: linear-gradient(90deg, transparent, #c99a3c 15%, #c99a3c 85%, transparent); }
#ez-konto .fuehrer > .skopf::before { content: ""; position: absolute; left: 50%; bottom: -3px; width: 6px; height: 6px; transform: translateX(-50%) rotate(45deg); background: #1c150d; border: 1px solid #e0b860; z-index: 1; }
#ez-konto .fuehrer .sbild { flex: none; position: relative; isolation: isolate; width: 42px; height: 42px; display: grid; place-items: center; background: #c99a3c; clip-path: polygon(var(--f) 0, calc(100% - var(--f)) 0, 100% var(--f), 100% calc(100% - var(--f)), calc(100% - var(--f)) 100%, var(--f) 100%, 0 calc(100% - var(--f)), 0 var(--f)); }
#ez-konto .fuehrer .sbild::before { content: ""; position: absolute; inset: 1.5px; z-index: -1; background: radial-gradient(#241b10, #120d08); clip-path: inherit; } #ez-konto .fuehrer .sbild img { width: 28px; height: 28px; }
#ez-konto .fuehrer .sname { flex: 0 1 auto; min-width: 0; } #ez-konto .fuehrer .sname h2 { margin: 0; font-size: 18px; line-height: 1.1; text-align: left; } #ez-konto .fuehrer .sname small { color: #cdb98a; font-size: 12px; }
#ez-konto .fuehrer .sxp { flex: 1; min-width: 90px; display: grid; gap: 3px; } #ez-konto .fuehrer .sxp small { color: #cdb98a; font-size: 11.5px; text-align: right; }
#ez-konto .fuehrer .balken { height: 7px; border-radius: 4px; background: #1a140d; border: 1px solid #5a4528; overflow: hidden; } #ez-konto .fuehrer .balken u { display: block; height: 100%; background: linear-gradient(90deg, #c9962e, #ffe08a); text-decoration: none; }
#ez-konto .fuehrer .reiter { flex: 0 0 auto; display: flex; gap: 6px; flex-wrap: wrap; margin: 0; }
#ez-konto .fuehrer .reiter button { flex: 1 1 auto; position: relative; isolation: isolate; padding: 5px 10px; border: 0; border-radius: 0; background: #6d5632; color: #b9a57c; font: 600 12.5px Cinzel, Georgia, serif; cursor: pointer;
  clip-path: polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px); }
#ez-konto .fuehrer .reiter button::before { content: ""; position: absolute; inset: 1.5px; z-index: -1; background: #17120c; clip-path: inherit; }
#ez-konto .fuehrer .reiter button.an { background: #ffd36a; color: #ffe7b0; } #ez-konto .fuehrer .reiter button.an::before { background: #2e2314; }
#ez-konto .fuehrer .zeilen { overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain; flex: 1 1 auto; list-style: none; margin: 0; padding: 0 4px 0 0; display: flex; flex-direction: column; gap: 4px; scrollbar-width: thin; scrollbar-color: #8a6a3a transparent; }
#ez-konto .fuehrer li { flex: none; display: grid; grid-template-columns: 34px 34px minmax(0, 1fr); gap: 10px; align-items: center; padding: 3px 8px 3px 4px; border-bottom: 1px solid #3e3220; }
#ez-konto .fuehrer li .lv { position: relative; isolation: isolate; width: 32px; height: 26px; display: grid; place-items: center; font: 700 13px Inter, sans-serif; color: #ffe7b0; background: #c99a3c;
  clip-path: polygon(5px 0, calc(100% - 5px) 0, 100% 5px, 100% calc(100% - 5px), calc(100% - 5px) 100%, 5px 100%, 0 calc(100% - 5px), 0 5px); }
#ez-konto .fuehrer li .lv::before { content: ""; position: absolute; inset: 1.5px; z-index: -1; background: #241b10; clip-path: inherit; }
#ez-konto .fuehrer li img { width: 34px; height: 34px; object-fit: contain; }
#ez-konto .fuehrer li b { display: block; font: 600 13.5px Cinzel, Georgia, serif; color: #efe2c4; } #ez-konto .fuehrer li small { display: block; color: #a8966a; font-size: 11.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#ez-konto .fuehrer li.zu b, #ez-konto .fuehrer li.zu small, #ez-konto .fuehrer li.zu img { opacity: .45; } #ez-konto .fuehrer li.zu .lv { background: #6d5632; color: #a8946a; }
#ez-konto .fuehrer .infotext { display: block; } #ez-konto .fuehrer .infotext h3 { margin: 4px 0 3px; font: 600 13px Cinzel, Georgia, serif; color: #e9cf8e; } #ez-konto .fuehrer .infotext p { margin: 0 0 8px; color: #d9c9a2; font-size: 13.5px; line-height: 1.4; }
@media (max-height: 520px) { #ez-konto .tafel.fuehrer { max-height: calc(100vh - 10px); padding-top: 8px; padding-bottom: 8px; gap: 6px; } #ez-konto .fuehrer .sname h2 { font-size: 16px; } #ez-konto .fuehrer .sbild { width: 36px; height: 36px; } }`;

/** Die Übersicht eines Berufs; text = [Wofür, So steigst du auf] für den Reiter „Info“ */
export function skillFuehrer(k: string, text?: [string, string]): void {
  skillBuch({ zeichen: BERUF_ZEICHEN[k] || "", name: BERUF_NAME[k] || k, S: skillStand((inventar().berufe || {})[k] || 0), reiter: reiter(k), text }); }
/** Das Skillbuch (Berufe und Kampf-Skills gleich): Kopf in einer Zeile (Bild, Name, Level, XP-Balken), Reiter, darunter die Zeilen – die Liste scrollt nur nach unten */
export function skillBuch(o: { zeichen: string; name: string; S: { L: number; im: number; bis: number; anteil: number }; reiter: [string, Zeile[]][]; text?: [string, string] }): void {
  if (!document.getElementById("ez-fuehrer-stil")) { const s = document.createElement("style"); s.id = "ez-fuehrer-stil"; s.textContent = STIL; document.head.appendChild(s); }
  const S = o.S, text = o.text, R: [string, Zeile[]][] = [...o.reiter, ...(text ? [["Info", []] as [string, Zeile[]]] : [])];
  const inhalt = (i: number) => { const [name, z] = R[i]; if (name === "Info" && text) return `<div class="zeilen infotext"><h3>Wofür</h3><p>${text[0]}</p><h3>So steigst du auf</h3><p>${text[1]}</p></div>`;
    if (!z.length) return `<div class="zeilen infotext"><p>Hier wird noch nichts freigeschaltet – das kommt mit neuer Ausrüstung.</p></div>`;
    return `<ul class="zeilen">${z.map((x) => { const G = GEGENSTAENDE[x.g]; return `<li class="${S.L >= x.level ? "" : "zu"}" title="${esc(x.name)} – ${esc(x.text)}"><span class="lv">${x.level}</span>${G && G.bild ? `<img src="../${G.bild}" alt="" draggable="false" onerror="this.style.visibility='hidden'">` : "<span></span>"}<div><b>${esc(x.name)}</b><small>${esc(x.text)}</small></div></li>`; }).join("")}</ul>`; };
  const f = tafelZeigen("fuehrer", `<div class="skopf"><span class="sbild">${o.zeichen}</span><div class="sname"><h2>${o.name}</h2><small>Level ${S.L}</small></div><div class="sxp"><div class="balken"><u style="width:${S.anteil}%"></u></div><small>${S.L < 100 ? `${S.im} / ${S.bis} XP bis Level ${S.L + 1}` : "höchstes Level"}</small></div></div>
    ${R.length > 1 ? `<div class="reiter" role="tablist">${R.map(([n], i) => `<button type="button" role="tab" data-fr="${i}" class="${i ? "" : "an"}" aria-selected="${!i}">${n}</button>`).join("")}</div>` : ""}<div class="fkoerper">${R.length ? inhalt(0) : ""}</div>`, () => { /* zu */ });
  const tafel = f.querySelector(".tafel") as HTMLElement, koerper = tafel.querySelector(".fkoerper") as HTMLElement; koerper.style.cssText = "overflow:hidden;display:flex;flex-direction:column;min-height:0;flex:1 1 auto";
  tafel.addEventListener("click", (e) => { const b = (e.target as HTMLElement).closest("[data-fr]") as HTMLElement | null; if (!b) return; e.stopPropagation(); const i = Number(b.dataset.fr);
    tafel.querySelectorAll("[data-fr]").forEach((x) => { x.classList.toggle("an", x === b); x.setAttribute("aria-selected", String(x === b)); }); koerper.innerHTML = inhalt(i); });
}
