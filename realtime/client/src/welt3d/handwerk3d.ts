/*
 * Mythara – Handwerk in der 3D-Welt (shared/handwerk.ts; Server: server/src/handwerk.ts).
 *   · Esse und Amboss stehen in der Schmiede der Waldmark (bauten.ts), die Werkbank im Osthof beim Kuhgehege (hier geladen: img/objekte3d/skilling/handwerk/werkbank.glb).
 *   · Werkstatt antippen: hingehen, Rezeptfenster (nach Gruppe, Level, Zutaten im Rucksack; 1 / 5 / 10 / Alle).
 *   · Beim Herstellen schlägt der Held mit dem Hammer (Amboss, Werkbank). Glut: kurz „Glut!“ antippen – eine Zutat gespart, 50 % mehr XP.
 */
import * as THREE from "three";
import { gltfLader } from "./gltf";
import { GEGENSTAENDE } from "../../../shared/gegenstaende";
import { questDef } from "../../../shared/quests";
import { laeuft as laeuftB } from "../../../shared/questbau";
import { STATIONEN, WERKSTAETTEN, Werkstatt, StationId, WeltStation, WERKZEUG_AN, rezepteAn, rezept, Rezept, BERUF_HAND, HANDWERK_WEIT, werkTat, WerkTat } from "../../../shared/handwerk";
import { chatSystem, handwerkBitten, tafelZeigen, questStandB } from "../welt";
import { berufDrop, skillStand } from "../skills";
import { inventar } from "../inventar";
import { benutzt, benutzen } from "../benutzen";
import type { Welt3D } from "./motor";

interface Umgebung { motor: Welt3D; ort: { x: number; y: number }; figur: unknown }
interface Werkzeugfigur { beilHieb(url: string, clip?: string): number; beilWeg(): void; blick(x: number, z: number): void; werken?(wahl: string[], url?: string): number }
const HAMMER = "../img/objekte3d/skilling/utensilien/hammer.glb";
/** Bewegung je Werk-Art: zuerst die eigenen Werk-Clips (kommen aus der Figuren-Fabrik), bis dahin vorhandene Bewegungen als Ersatz */
const WERK: Record<WerkTat, { clips: string[]; werkzeug: string }> = {
  ofen: { clips: ["werk_ofen", "zauber_stab"], werkzeug: "" },            // in die Glut schieben
  haemmern: { clips: ["werk_hammer", "angriff"], werkzeug: HAMMER },
  weben: { clips: ["werk_weben", "trinken"], werkzeug: "" },              // Hände vor dem Körper
  schnitzen: { clips: ["werk_schnitzen", "stich"], werkzeug: "" },
  fuegen: { clips: ["werk_fuegen", "trinken"], werkzeug: "" },            // zusammenfügen, nähen
};

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Wie viele Stück eines Gegenstands im Rucksack liegen */
export function imRucksack(g: string): number { const i = inventar(); let n = 0; i.rucksack.forEach((x, k) => { if (x === g) n += (i.anzahl && i.anzahl[k]) || 1; }); return n; }
const sorteDa = (z: { g: string[]; n: number }) => Math.max(...z.g.map(imRucksack));
/** Wie oft das Rezept mit dem Rucksack geht */
export const wieOft = (r: Rezept): number => Math.min(...r.zutaten.map((z) => Math.floor(sorteDa(z) / z.n)));
const handLevel = () => skillStand((inventar().berufe || {})[BERUF_HAND] || 0).L;

export class HandwerkWelt {
  /** gerade am Herstellen (Rezept-id) */ aktiv: string | null = null; private station: StationId | null = null; private glutBis = 0; private offen: StationId | null = null;
  private baenke = new Map<string, THREE.Object3D>(); private laedt = new Set<string>();
  constructor(private u: Umgebung) { addEventListener("ez-handwerk", (e) => this.nachricht((e as CustomEvent).detail)); }
  private get figur(): Werkzeugfigur | null { const f = this.u.figur as Partial<Werkzeugfigur> | null; return f && typeof f.beilHieb === "function" ? (f as Werkzeugfigur) : null; }
  private async werkbankLaden(S: Werkstatt) { this.laedt.add(S.id);
    try { const g = await gltfLader().loadAsync("../img/objekte3d/skilling/handwerk/werkbank.glb"), o = g.scene, box = new THREE.Box3().setFromObject(o), s = box.getSize(new THREE.Vector3());
      o.scale.setScalar(1.6 / Math.max(0.01, s.x, s.z)); o.traverse((x) => { const m = x as THREE.Mesh; if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
      o.position.set(S.x, this.u.motor.hoehe(S.x, S.y), S.y); this.u.motor.szene.add(o); this.baenke.set(S.id, o);
    } catch (e) { console.warn("Handwerk: Werkbank fehlt", e); } }
  private nachricht(m: { tat: string; rezept?: string; station?: StationId; name?: string; xp?: number; glut?: boolean; gespart?: boolean; rest?: number; aufstieg?: number; grund?: string; text?: string; ms?: number }) {
    const f = this.figur, st = m.station || this.station, S = st && st !== "hand" ? STATIONEN[st] : null;
    if (m.tat === "start") { this.aktiv = m.rezept || null; this.station = m.station || null; const r = m.rezept ? rezept(m.rezept) : null; if (r) this.werkLos(r);
      if (r) chatSystem(`Du stellst ${m.rezept && GEGENSTAENDE[r.ergebnis] ? GEGENSTAENDE[r.ergebnis].name : "etwas"} her${(m as { menge?: number }).menge! > 1 ? ` (${(m as { menge?: number }).menge} Stück)` : ""} …`); }
    else if (m.tat === "fertig") { chatSystem(`Du stellst ${m.name || "etwas"} her${m.glut ? ` – Glut! ${m.gespart ? "Eine Zutat gespart, " : ""}50 % mehr XP.` : "."}`); berufDrop(BERUF_HAND, m.xp || 0);
      if (m.aufstieg) chatSystem(`Glückwunsch! Handwerk ist jetzt Level ${m.aufstieg}.`); /* Banner oben: skills.ts stufenPruefen */ }
    else if (m.tat === "glut") { this.glutBis = performance.now() + (m.ms || 1500); this.hinweis("Glut! Schnell die Werkstatt antippen", m.ms || 1500); }
    else if (m.tat === "stop") { this.aktiv = null; this.glutBis = 0; this.werkHalt(); if (f) f.beilWeg();
      if (m.grund === "voll") chatSystem("Dein Rucksack ist voll."); else if (m.grund === "zutaten") chatSystem("Dir sind die Zutaten ausgegangen."); else if (m.grund === "werkzeug") chatSystem("Ohne Hammer im Rucksack geht es nicht weiter."); }
    else if (m.tat === "nein") { chatSystem(m.text || "Das geht hier nicht."); this.aktiv = null; this.werkHalt(); } }
  /** Solange gearbeitet wird: die Werk-Bewegung immer wieder (Ofen, Hämmern, Weben, Schnitzen, Zusammenfügen; fabrik/werk_bewegungen.py) */
  private werkZeit: ReturnType<typeof setTimeout> | null = null;
  private werkLos(r: Rezept) { this.werkHalt(); const w = WERK[werkTat(r)], o = this.u.ort, S = r.station !== "hand" ? WERKSTAETTEN.filter((W) => W.station === r.station).sort((a, b) => Math.hypot(a.x - o.x, a.y - o.y) - Math.hypot(b.x - o.x, b.y - o.y))[0] || null : null; /* die nächste Werkstatt dieser Art */
    const eins = () => { const f = this.figur; let ms = 1200; if (f && this.aktiv) { if (S) f.blick(S.x - this.u.ort.x, S.y - this.u.ort.y); ms = (typeof f.werken === "function" ? f.werken(w.clips, w.werkzeug) : w.werkzeug ? f.beilHieb(w.werkzeug, "") : 0) || 1200; }
      if (this.aktiv) this.werkZeit = setTimeout(eins, ms); };
    eins(); }
  private werkHalt() { if (this.werkZeit) clearTimeout(this.werkZeit); this.werkZeit = null; }
  private hinweis(text: string, ms: number) { const el = document.getElementById("ez-dorf-hilfe"); if (!el) return; el.textContent = text; el.style.display = ""; setTimeout(() => { if (el.textContent === text) { el.textContent = ""; el.style.display = "none"; } }, ms); }

  /** Das Herstellfenster einer Werkstatt (wie in OSRS: Bilder nach Gruppe; antippen → Zutaten und Menge). nur: nur Rezepte mit diesem Gegenstand („Benutzen“) */
  fenster(st: WeltStation, nur = ""): void { const S = STATIONEN[st], L = handLevel(), wz = WERKZEUG_AN[st], ohne = wz && imRucksack(wz) <= 0 ? wz : ""; this.offen = st;
    if (!document.getElementById("ez-handwerk-stil")) { const s = document.createElement("style"); s.id = "ez-handwerk-stil"; s.textContent = `
#ez-konto .tafel.handwerk { width: min(640px, 100%); text-align: left; max-height: 90vh; display: flex; flex-direction: column; }
#ez-konto .handwerk .raster { overflow-y: auto; padding: 2px 4px 2px 0; flex: 1 1 auto; min-height: 120px; }
#ez-konto .handwerk h3 { margin: 10px 0 6px; font: 600 13px Cinzel, Georgia, serif; color: #f0d48a; letter-spacing: .04em; }
#ez-konto .handwerk .gitter { display: grid; grid-template-columns: repeat(auto-fill, minmax(62px, 1fr)); gap: 6px; }
#ez-konto .handwerk .ding { position: relative; aspect-ratio: 1; border: 2px solid #5d4a2e; border-radius: 8px; background: radial-gradient(#2e2a24, #141210); padding: 4px; cursor: pointer; }
#ez-konto .handwerk .ding img { width: 100%; height: 100%; object-fit: contain; pointer-events: none; }
#ez-konto .handwerk .ding .lv { position: absolute; left: 3px; top: 1px; font: 700 11px Inter, sans-serif; color: #f0d48a; text-shadow: 0 1px 2px #000; }
#ez-konto .handwerk .ding.kann { border-color: #f0c84a; box-shadow: inset 0 0 8px rgba(240,200,74,.35); } /* freigeschaltet, genug für mindestens eins */
#ez-konto .handwerk .ding.fehlt { border-color: #c0443a; box-shadow: inset 0 0 6px rgba(192,68,58,.3); } /* freigeschaltet, aber zu wenig (oder Werkzeug fehlt) */
#ez-konto .handwerk .ding.zu { filter: grayscale(1) brightness(.45); border-color: #4a4640; } /* noch nicht freigeschaltet */
#ez-konto .handwerk .ding.wahl { border-color: #f0d48a; box-shadow: 0 0 10px rgba(240,212,138,.6); }
#ez-konto .handwerk > .skopf, #ez-konto .handwerk > .zier { flex: 0 0 auto; }
#ez-konto .handwerk .info { flex: 0 0 auto; border-top: 1px solid #5d4a2e; margin-top: 6px; padding-top: 6px; }
#ez-konto .tafel.handwerk { padding-top: 12px; } #ez-konto .handwerk > .skopf { display: flex; align-items: center; gap: 10px; text-align: left; } #ez-konto .handwerk > .skopf h2 { line-height: 1.1; } #ez-konto .handwerk > .skopf img { width: 28px; height: 28px; } #ez-konto .handwerk > .skopf h2 { font-size: 18px; margin: 0; } #ez-konto .handwerk > .skopf small { font-size: 12px; } #ez-konto .handwerk > .zier { margin: 4px 0; }
#ez-konto .handwerk .zeile { display: flex; align-items: center; gap: 8px; flex-wrap: nowrap; } #ez-konto .handwerk .zeile .zut { flex: 1 1 auto; min-width: 0; margin: 4px 0; flex-wrap: nowrap; overflow-x: auto; }
#ez-konto .handwerk .info b { font: 600 15px Cinzel, Georgia, serif; color: #efe2c4; } #ez-konto .handwerk .info small { color: #a8966a; font-size: 12px; } #ez-konto .handwerk .info .kopfzeile { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; } #ez-konto .handwerk .info .hinweis { display: block; }
#ez-konto .handwerk .zut { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0; }
#ez-konto .handwerk .zut span { display: flex; flex: 0 0 auto; align-items: center; gap: 4px; padding: 2px 8px 2px 2px; border-radius: 6px; background: rgba(0,0,0,.3); font-size: 12px; white-space: nowrap; }
#ez-konto .handwerk .zut img { width: 26px; height: 26px; object-fit: contain; } #ez-konto .handwerk .zut .da { color: #9fd08a; } #ez-konto .handwerk .zut .nicht { color: #e07a6a; }
#ez-konto .handwerk .menge { display: flex; flex: 0 0 auto; gap: 5px; flex-wrap: nowrap; } #ez-konto .handwerk .menge button { min-width: 38px; padding: 6px 8px; font-size: 13px; }`; document.head.appendChild(s); }
    const mit = (id: string) => { const q = questDef(id); return Boolean(q && laeuftB(q, questStandB(id))); } /* Questrezepte nur, solange die Quest läuft */, rs = rezepteAn(st).filter((r) => (!r.quest || mit(r.quest)) && (!nur || r.zutaten.some((z) => z.g.includes(nur))));
    const gruppen = new Map<string, Rezept[]>(); for (const r of rs) { if (!gruppen.has(r.gruppe)) gruppen.set(r.gruppe, []); gruppen.get(r.gruppe)!.push(r); }
    const bild = (g: string) => (GEGENSTAENDE[g] && GEGENSTAENDE[g].bild ? `<img src="../${GEGENSTAENDE[g].bild}" alt="" draggable="false">` : "");
    const ding = (r: Rezept) => { const offen = L >= r.level, n = wieOft(r), G = GEGENSTAENDE[r.ergebnis];
      return `<button type="button" class="ding ${!offen ? "zu" : n > 0 && !ohne ? "kann" : "fehlt"}" data-r="${r.id}" title="${esc(G ? G.name : r.ergebnis)} – Level ${r.level}" aria-label="${esc(G ? G.name : r.ergebnis)}">${bild(r.ergebnis)}<span class="lv">${r.level}</span></button>`; };
    const nurName = nur && GEGENSTAENDE[nur] ? GEGENSTAENDE[nur].name : "";
    const f = tafelZeigen("handwerk", `<div class="skopf"><img class="skillbild" src="../img/objekte3d/skilling/symbole/handwerk_klein.webp" alt="" width="40" height="40"><div><h2>${S.name}</h2><small>${nurName ? `${esc(nurName)} benutzen · ` : ""}${S.tun} · Handwerk Level ${L}${ohne ? ` · <b style="color:#e07a6a">ohne ${esc(GEGENSTAENDE[ohne].name)}</b>` : ""}</small></div></div><div class="zier"></div>
      <div class="raster">${[...gruppen].map(([g, liste]) => `<h3>${esc(g)}</h3><div class="gitter">${liste.map(ding).join("")}</div>`).join("")}</div>
      <div class="info"><small>Tippe ein Bild an: Zutaten und wie viele du herstellen willst.</small></div>`, () => { this.offen = null; });
    const tafel = f.querySelector(".tafel") as HTMLElement, info = tafel.querySelector(".info") as HTMLElement;
    const zeigen = (r: Rezept) => { const G = GEGENSTAENDE[r.ergebnis], n = wieOft(r), offen = L >= r.level;
      tafel.querySelectorAll(".ding.wahl").forEach((x) => x.classList.remove("wahl")); tafel.querySelector(`.ding[data-r="${r.id}"]`)?.classList.add("wahl");
      const zut = r.zutaten.map((z) => { const da = sorteDa(z), g = z.g.find((x) => imRucksack(x) >= z.n) || z.g[0]; return `<span>${bild(g)}<i class="${da >= z.n ? "da" : "nicht"}">${da}/${z.n}</i> ${esc(z.g.map((x) => (GEGENSTAENDE[x] ? GEGENSTAENDE[x].name : x)).join(" / "))}</span>`; }).join("");
      info.innerHTML = `<div class="kopfzeile"><b>${esc(G ? G.name : r.ergebnis)}</b><small>Level ${r.level} · ${r.xp} XP je Stück · ${r.ticks} Ticks</small></div><div class="zeile"><div class="zut">${zut}</div>
        ${!offen ? `<small class="hinweis">Braucht Handwerk ${r.level}.</small>` : ohne ? `<small class="hinweis">Braucht einen ${esc(GEGENSTAENDE[ohne].name)} im Rucksack.</small>` : n <= 0 ? `<small class="hinweis">Zutaten fehlen.</small>` : `<div class="menge">${[1, 5, 10].filter((k) => k < n).map((k) => `<button type="button" data-t="hw" data-r="${r.id}" data-n="${k}">${k}</button>`).join("")}<button type="button" class="haupt" data-t="hw" data-r="${r.id}" data-n="${n}">${n > 1 ? `Alle (${n})` : "Herstellen"}</button></div>`}</div>`; };
    tafel.addEventListener("click", (e) => { const t = e.target as HTMLElement, d = t.closest(".ding") as HTMLElement | null;
      if (d) { e.stopPropagation(); const r = rezept(d.dataset.r!); if (r) zeigen(r); return; }
      const b = t.closest('[data-t="hw"]') as HTMLElement | null; if (!b) return; e.stopPropagation();
      const id = b.dataset.r!, n = Number(b.dataset.n) || 1; (f.querySelector('[data-t="zu"]') as HTMLElement).click(); handwerkBitten("start", id, n); });
    const erstes = rs.find((r) => L >= r.level && wieOft(r) > 0); if (erstes) zeigen(erstes); }
  /** Liegt an diesem Bodenpunkt eine Werkstatt? Dann „Werkbank benutzen“ (hingehen, Rezeptfenster) bzw. in der Glut „Glut!“ */
  stelle(x: number, y: number): { x: number; y: number; text: string; tat: () => void; da: () => boolean; mehr: { text: string; sym: string; tat: () => void }[] } | null {
    let best: Werkstatt | null = null, bd = 1.4; for (const W of WERKSTAETTEN) { const d = Math.hypot(W.x - x, W.y - y); if (d < bd) { bd = d; best = W; } } if (!best) return null;
    const W = best, S = { ...STATIONEN[W.station], x: W.x, y: W.y }, o = this.u.ort, dx = o.x - S.x, dy = o.y - S.y, l = Math.hypot(dx, dy) || 1, glut = this.aktiv && performance.now() < this.glutBis;
    const b = benutzt(), bn = b && GEGENSTAENDE[b.g] ? GEGENSTAENDE[b.g].name : "";
    return { x: S.x + (dx / l) * 1.2, y: S.y + (dy / l) * 1.2, text: glut ? "Glut!" : bn ? `${bn} → ${S.name}` : `${S.name} benutzen`, da: () => Math.hypot(S.x - this.u.ort.x, S.y - this.u.ort.y) <= HANDWERK_WEIT,
      tat: () => { if (glut) { this.glutBis = 0; handwerkBitten("glut"); return; } if (this.aktiv) handwerkBitten("stop");
        const b = benutzt(); if (b) { benutzen(null); if (!rezepteAn(S.id).some((r) => r.zutaten.some((z) => z.g.includes(b.g)))) { chatSystem("Nichts Interessantes passiert."); return; } this.fenster(S.id, b.g); return; }
        this.fenster(S.id); },
      mehr: [{ text: "Untersuchen", sym: "🔍", tat: () => chatSystem(`${S.name}: hier wird ${S.tun === "Werken" ? "gewerkt" : S.tun === "Schmelzen" ? "geschmolzen" : "geschmiedet"} (${rezepteAn(S.id).filter((r) => !r.quest).length} Rezepte).`) }] }; }
  /** Wo die Werkstätten stehen (Antippen am Bildschirm) */
  punkte(): { x: number; y: number; h: number }[] { return WERKSTAETTEN.filter((S) => Math.hypot(S.x - this.u.ort.x, S.y - this.u.ort.y) < 40).map((S) => ({ x: S.x, y: S.y, h: 1.0 })); }
  schritt(_dt: number): void { for (const S of WERKSTAETTEN) { if (S.station !== "werkbank") continue; const nah = Math.hypot(S.x - this.u.ort.x, S.y - this.u.ort.y) < 60;
    if (nah && !this.laedt.has(S.id)) void this.werkbankLaden(S); const o = this.baenke.get(S.id); if (o) o.visible = nah; } }
  /** für Tests */ get fensterOffen(): StationId | null { return this.offen; }
}
