/*
 * Mythara – Skill-Übersicht der Berufe (wie der Skill Guide in OSRS, in unserem Stil): Skill im Tab antippen →
 * Reiter (Bäume, Werkzeuge, Rezepte …), je Zeile Level, Bild, Name und XP; was man schon kann, leuchtet, der Rest ist abgedunkelt.
 */
import { GEGENSTAENDE } from "../../shared/gegenstaende";
import { BAEUME, BEILE } from "../../shared/holz";
import { ADERN, SPITZHACKEN } from "../../shared/bergbau";
import { REZEPTE, Rezept } from "../../shared/handwerk";
import { tafelZeigen } from "./welt";
import { inventar } from "./inventar";
import { skillStand, BERUF_ZEICHEN, BERUF_NAME } from "./skills";

interface Zeile { level: number; g: string; name: string; text: string }
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
  return [];
}
const STIL = `
#ez-konto .tafel.fuehrer { width: min(600px, 100%); text-align: left; max-height: 90vh; display: flex; flex-direction: column; }
#ez-konto .fuehrer > .skopf, #ez-konto .fuehrer > .zier { flex: 0 0 auto; }
#ez-konto .fuehrer .reiter { flex: 0 0 auto; display: flex; gap: 4px; flex-wrap: wrap; margin: 4px 0 8px; }
#ez-konto .fuehrer .reiter button { flex: 1 1 auto; padding: 6px 10px; border: 1px solid #5d4a2e; border-radius: 6px; background: rgba(0,0,0,.3); color: #d9c9a2; font: 600 13px Cinzel, Georgia, serif; }
#ez-konto .fuehrer .reiter button.an { background: linear-gradient(#6b4f22, #4a3616); color: #ffe7a6; border-color: #b08a3c; }
#ez-konto .fuehrer .zeilen { overflow-y: auto; flex: 1 1 auto; list-style: none; margin: 0; padding: 0 4px 0 0; display: flex; flex-direction: column; gap: 4px; }
#ez-konto .fuehrer li { display: grid; grid-template-columns: 38px 44px minmax(0, 1fr); gap: 10px; align-items: center; padding: 4px 8px; border-radius: 6px; background: rgba(0,0,0,.25); border: 1px solid #3e3220; }
#ez-konto .fuehrer li .lv { font: 700 18px Cinzel, Georgia, serif; color: #f0d48a; text-align: center; }
#ez-konto .fuehrer li img { width: 44px; height: 44px; object-fit: contain; }
#ez-konto .fuehrer li b { display: block; font: 600 15px Cinzel, Georgia, serif; color: #efe2c4; } #ez-konto .fuehrer li small { display: block; color: #a8966a; font-size: 12px; }
#ez-konto .fuehrer li.zu { opacity: .45; } #ez-konto .fuehrer li.zu .lv { color: #b07a6a; }
#ez-konto .fuehrer .balken { height: 6px; border-radius: 3px; background: rgba(0,0,0,.4); overflow: hidden; margin-top: 4px; } #ez-konto .fuehrer .balken u { display: block; height: 100%; background: linear-gradient(90deg, #c9962e, #ffe08a); }
#ez-konto .fuehrer .infotext p { color: #d9c9a2; } #ez-konto .fuehrer .infotext h3 { color: #f0d48a; }`;

/** Die Übersicht eines Berufs; text = [Wofür, So steigst du auf] für den Reiter „Info“ */
export function skillFuehrer(k: string, text?: [string, string]): void {
  if (!document.getElementById("ez-fuehrer-stil")) { const s = document.createElement("style"); s.id = "ez-fuehrer-stil"; s.textContent = STIL; document.head.appendChild(s); }
  const S = skillStand((inventar().berufe || {})[k] || 0), R: [string, Zeile[]][] = [...reiter(k), ...(text ? [["Info", []] as [string, Zeile[]]] : [])];
  const inhalt = (i: number) => { const [name, z] = R[i]; if (name === "Info" && text) return `<div class="zeilen infotext"><h3>Wofür</h3><p>${text[0]}</p><h3>So steigst du auf</h3><p>${text[1]}</p></div>`;
    return `<ul class="zeilen">${z.map((x) => { const G = GEGENSTAENDE[x.g]; return `<li class="${S.L >= x.level ? "" : "zu"}"><span class="lv">${x.level}</span>${G && G.bild ? `<img src="../${G.bild}" alt="" draggable="false">` : "<span></span>"}<div><b>${esc(x.name)}</b><small>${esc(x.text)}</small></div></li>`; }).join("")}</ul>`; };
  const f = tafelZeigen("fuehrer", `<div class="skopf"><span class="sz gross">${BERUF_ZEICHEN[k] || ""}</span><div style="flex:1"><h2>${BERUF_NAME[k] || k}</h2><small>Level ${S.L}${S.L < 100 ? ` · ${S.im} / ${S.bis} XP bis Level ${S.L + 1}` : " · höchstes Level"}</small><div class="balken"><u style="width:${S.anteil}%"></u></div></div></div><div class="zier"></div>
    <div class="reiter" role="tablist">${R.map(([n], i) => `<button type="button" role="tab" data-fr="${i}" class="${i ? "" : "an"}" aria-selected="${!i}">${n}</button>`).join("")}</div><div class="fkoerper">${inhalt(0)}</div>`, () => { /* zu */ });
  const tafel = f.querySelector(".tafel") as HTMLElement, koerper = tafel.querySelector(".fkoerper") as HTMLElement; koerper.style.cssText = "overflow:hidden;display:flex;flex-direction:column;min-height:0;flex:1 1 auto";
  tafel.addEventListener("click", (e) => { const b = (e.target as HTMLElement).closest("[data-fr]") as HTMLElement | null; if (!b) return; e.stopPropagation(); const i = Number(b.dataset.fr);
    tafel.querySelectorAll("[data-fr]").forEach((x) => { x.classList.toggle("an", x === b); x.setAttribute("aria-selected", String(x === b)); }); koerper.innerHTML = inhalt(i); });
}
