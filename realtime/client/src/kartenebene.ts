/*
 * Riftmere – Gestaltung der Weltkarte (#183, Entwurf vom Nutzer freigegeben): Symbole und Namen nach Zoomstufe ausgedünnt, Legende mit Ein-/Ausblenden, Suche, „Du bist hier“.
 *   Welt   – Städte mit Punkt und großem Namen, Landschaften, nur Bank und Dungeon/Boss
 *   Gegend – Orte mit Umriss und Namen darüber, dazu Läden und Handwerk
 *   Nah    – alles, auch Holz und Erz, kleine Ortsnamen
 * Für WebKit schlank (Bugs, #183): die Ebene wird je Stufe einmal gebaut (und nach dem Verschieben, wenn ein neues Stück der Welt ins Bild kommt), nur Elemente im Sichtbereich,
 * nahe Symbole zu einem mit „+n“ zusammengefasst, keine drop-shadows (Schatten als Ring), Namen mit nur einem Schatten.
 * Die Grundkarte, das Ziehen und die Zoomstufen macht uebersicht.ts (Bugs); diese Ebene hängt in karteEbene() und läuft per transform mit.
 */
import type { WeltkarteOpts } from "./uebersicht";

/** Symbolarten der Legende: ab welcher Stufe sichtbar (0 Welt, 1 Gegend, 2 Nah) */
const ARTEN: { id: string; text: string; ab: number; sym: string[] }[] = [
  { id: "orte", text: "Orte", ab: 0, sym: [] },
  { id: "bank", text: "Bank", ab: 0, sym: ["bank"] },
  { id: "dungeon", text: "Dungeon · Boss", ab: 0, sym: ["dungeon"] },
  { id: "laden", text: "Läden", ab: 1, sym: ["handwerkshaendler", "waffenhaendler", "ausruestungshaendler", "traenkehaendler", "friseur", "taverne", "faehre"] },
  { id: "handwerk", text: "Handwerk", ab: 1, sym: ["amboss", "ofen", "werkbank", "bindestein"] },
  { id: "rohstoff", text: "Holz · Erz · Fisch", ab: 2, sym: ["holzfaellerei", "mine", "fanggrund"] },
];
const ART_VON = (s: string) => ARTEN.find((a) => a.sym.includes(s)) || ARTEN.find((a) => a.id === "laden")!;
const SPEICHER = "ez_karte_aus";
const ausLesen = (): Set<string> => { try { return new Set(JSON.parse(localStorage.getItem(SPEICHER) || "[]")); } catch { return new Set(); } };
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export interface KartenAnsicht { vx: number; vy: number; z: number; W: number; H: number }
export interface KartenZugang {
  o: WeltkarteOpts; huelle: HTMLElement; ebene: HTMLElement; punkt: HTMLElement;
  /** Welt (Felder) → Leinwand-px (Zoom 1) */ px: (x: number, y: number) => { x: number; y: number };
  ansicht: () => KartenAnsicht; stufe: () => number;
  /** Karte auf diese Weltstelle schieben */ hin: (x: number, y: number) => void;
}

/** Namen nach Bedeutung (wie ortsnamen.json): Stadt, Dorf/Gehöft, Landschaft, klein */
const RANG = (art: string) => (/Stadt/.test(art) ? "stadt" : /Dorf|Gehöft|Ruineninsel/.test(art) ? "dorf" : /Landschaft|Wald|Tal/.test(art) ? "land" : "klein");

export function kartenEbene(k: KartenZugang): void {
  const { o, huelle } = k, aus = ausLesen(), C = o.chunkFelder;
  /* Eigene Ebene über der Leinwand, nicht mitskaliert: Lage in Bildschirm-px, beim Ziehen nur verschoben (ein transform). In der skalierten Leinwand würden Symbole und Schrift
     im Maßstab des Aufbaus gerastert und bei „Nah“ unscharf. */
  const ebene = document.createElement("div"); ebene.className = "wk-oben"; (huelle.querySelector(".wk-flaeche") || huelle).appendChild(ebene);
  const inRegion = (x: number, y: number) => o.regionen.some((r) => x >= r.ursprung[0] * C && x < (r.ursprung[0] + r.chunks[0]) * C && y >= r.ursprung[1] * C && y < (r.ursprung[1] + r.chunks[1]) * C);
  const gebiete = (o.namen ? o.namen.gebiete : []).filter((g) => inRegion(g.schrift[0], g.schrift[1])) as { name: string; art: string; schrift: number[]; grenze?: number[] }[];
  const namen = [...gebiete.map((g) => ({ name: g.name, art: g.art, x: g.schrift[0], y: g.schrift[1], grenze: g.grenze })),
    ...(o.namen ? o.namen.orte.filter((p) => inRegion(p.x, p.y)) : []).map((p) => ({ ...p, grenze: undefined as number[] | undefined }))];
  const symbole = o.regionen.flatMap((r) => r.symbole || []);
  const zahl = (id: string, st: number) => id === "orte" ? namen.filter((n) => zeigeName(n.art, st)).length : symbole.filter((s) => ART_VON(s.s).id === id).length;
  const zeigeName = (art: string, st: number) => { const r = RANG(art); return r === "stadt" || (r === "land" && st <= 1) || (r === "dorf" && st >= 1) || st === 2; };

  /* Legende links: Suche, Arten mit Zahl (ausgegraut „näher“, wenn erst später sichtbar), „Du bist hier“ */
  const leg = document.createElement("div"); leg.className = "wk-legende"; huelle.appendChild(leg);
  const legende = () => { const st = k.stufe();
    leg.innerHTML = `<b class="wk-ltitel">Legende</b><div class="wk-such"><input type="search" placeholder="Ort suchen …" aria-label="Ort suchen"><ul class="wk-treffer" hidden></ul></div>`
      + ARTEN.map((a) => `<button type="button" class="wk-art${aus.has(a.id) || a.ab > st ? " aus" : ""}" data-art="${a.id}" aria-pressed="${!aus.has(a.id)}">${a.sym.length ? `<span class="wk-s"><img src="${o.symbolBild || ""}${a.sym[0]}.webp" alt=""></span>` : `<i class="wk-p"></i>`}<span>${a.text}</span><em>${a.ab > st ? "näher" : zahl(a.id, st)}</em></button>`).join("")
      + `<button type="button" class="wk-hierknopf">◎ Du bist hier</button>`;
    const feld = leg.querySelector("input") as HTMLInputElement, tl = leg.querySelector(".wk-treffer") as HTMLElement;
    feld.addEventListener("input", () => { const q = feld.value.trim().toLowerCase(); const t = q ? namen.filter((n) => n.name.toLowerCase().includes(q)).slice(0, 6) : [];
      tl.hidden = !t.length; tl.innerHTML = t.map((n, i) => `<li><button type="button" data-t="${i}">${esc(n.name)}</button></li>`).join("");
      tl.onclick = (e) => { const b = (e.target as HTMLElement).closest<HTMLElement>("[data-t]"); if (!b) return; const n = t[Number(b.dataset.t)]; k.hin(n.x, n.y); feld.value = ""; tl.hidden = true; }; });
    feld.addEventListener("keydown", (e) => { if (e.key === "Enter") (tl.querySelector("button") as HTMLElement | null)?.click(); e.stopPropagation(); }); };
  leg.addEventListener("click", (e) => { const b = (e.target as HTMLElement).closest<HTMLElement>(".wk-art"); if (b) { const id = b.dataset.art!; if (aus.has(id)) aus.delete(id); else aus.add(id);
      try { localStorage.setItem(SPEICHER, JSON.stringify([...aus])); } catch { /* privat */ } bauen(true); return; }
    if ((e.target as HTMLElement).closest(".wk-hierknopf")) { const i = o.ich(); if (i) k.hin(i.x, i.y); } });
  leg.addEventListener("pointerdown", (e) => e.stopPropagation());
  /* Stufenanzeige an den Zoomknöpfen und „Du bist hier“ am Punkt */
  const knoepfe = huelle.querySelector(".wk-knoepfe"); if (knoepfe) { const s = document.createElement("div"); s.className = "wk-stufen"; s.innerHTML = "<i></i><i></i><i></i><span></span>"; knoepfe.insertBefore(s, knoepfe.querySelector('[data-k="raus"]')); }
  { const l = document.createElement("b"); l.className = "wk-hier"; l.textContent = "Du bist hier"; k.punkt.appendChild(l); }

  /* Ebene bauen: nur was im Sichtbereich (mit Rand) liegt; nahe Symbole zusammenfassen; Namen ohne Überlappen nach Rang */
  let gebaut: { vx: number; vy: number; z: number; st: number } | null = null;
  const bauen = (immer = false) => { const st = k.stufe(); if (st < 0) return; const A = k.ansicht();
    if (!immer && gebaut && gebaut.st === st && gebaut.z === A.z && Math.abs(gebaut.vx - A.vx) < A.W * 0.35 && Math.abs(gebaut.vy - A.vy) < A.H * 0.35) return;
    gebaut = { vx: A.vx, vy: A.vy, z: A.z, st }; legende();
    const sch = (x: number, y: number) => { const p = k.px(x, y); return { cx: p.x, cy: p.y, sx: A.vx + p.x * A.z, sy: A.vy + p.y * A.z }; };
    const sichtbar = (sx: number, sy: number) => sx > -A.W * 0.6 && sx < A.W * 1.6 && sy > -A.H * 0.6 && sy < A.H * 1.6;
    const teile: string[] = []; ebene.style.transform = "";
    /* Ortsumrisse ab „Gegend“ */
    if (st >= 1 && !aus.has("orte")) for (const g of gebiete) if (g.grenze && /Stadt|Dorf|Gehöft/.test(g.art)) { const a = sch(g.grenze[0], g.grenze[1]), b = sch(g.grenze[2], g.grenze[3]);
      if (b.sx < -50 || a.sx > A.W * 1.6 || b.sy < -50 || a.sy > A.H * 1.6) continue; teile.push(`<div class="wk-umriss" style="left:${a.sx}px;top:${a.sy}px;width:${b.sx - a.sx}px;height:${b.sy - a.sy}px"></div>`); }
    /* Symbole: je Art ab ihrer Stufe; auf dem Bildschirm näher als R px → eines mit „+n“ */
    const R = st === 2 ? 26 : 34, gruppen: { sx: number; sy: number; cx: number; cy: number; s: string[]; n: number; name: string }[] = [];
    for (const q of symbole) { const A2 = ART_VON(q.s); if (A2.ab > st || aus.has(A2.id)) continue; const p = sch(q.x, q.y); if (!sichtbar(p.sx, p.sy)) continue;
      const g = gruppen.find((x) => Math.hypot(x.sx - p.sx, x.sy - p.sy) < R); if (g) { g.n++; if (!g.s.includes(q.s)) g.s.push(q.s); } else gruppen.push({ ...p, s: [q.s], n: 1, name: (o.symbolNamen || {})[q.s] || q.s }); }
    for (const g of gruppen) teile.push(`<div class="wk-sym${st === 0 ? " gross" : ""}" style="left:${g.sx}px;top:${g.sy}px" title="${esc(g.name)}"><img src="${o.symbolBild || ""}${g.s[0]}.webp" alt="" draggable="false">${g.s.length > 1 ? `<b>+${g.s.length - 1}</b>` : ""}</div>`);
    ebene.innerHTML = teile.join("");
    /* Namen: nach Rang setzen, Überdeckung prüfen (am Bildschirm) – was überdecken würde, entfällt */
    if (!aus.has("orte")) { const ord = { stadt: 0, land: st === 0 ? 1 : 2, dorf: st === 0 ? 3 : 1, klein: 4 } as Record<string, number>, belegt: DOMRect[] = [];
      for (const n of [...namen].sort((a, b) => ord[RANG(a.art)] - ord[RANG(b.art)])) { if (!zeigeName(n.art, st)) continue; const r = RANG(n.art);
        const ueber = st >= 1 && n.grenze && (r === "stadt" || r === "dorf"), p = sch(n.x, ueber ? n.grenze![1] : n.y); if (ueber) p.sy -= 14; else if (st === 0 && r === "stadt") p.sy -= 18; /* mit Umriss: der Name über dem Ort */ if (!sichtbar(p.sx, p.sy)) continue;
        const e = document.createElement("div"); e.className = "wk-n " + r; e.textContent = n.name; e.style.cssText = `left:${p.sx}px;top:${p.sy}px`; ebene.appendChild(e);
        const q = e.getBoundingClientRect(); if (belegt.some((b) => q.left < b.right + 6 && q.right > b.left - 6 && q.top < b.bottom + 2 && q.bottom > b.top - 2)) { e.remove(); continue; } belegt.push(q);
        if (st === 0 && r === "stadt") { const d = document.createElement("i"); d.className = "wk-ortpunkt"; d.style.cssText = `left:${p.sx}px;top:${p.sy + 18}px`; ebene.appendChild(d); } } }
    const sd = huelle.querySelectorAll(".wk-stufen i"); sd.forEach((x, i) => x.classList.toggle("an", i === st)); const sn = huelle.querySelector(".wk-stufen span"); if (sn) sn.textContent = ["Welt", "Gegend", "Nah"][st] || ""; };
  const fl = huelle.querySelector(".wk-flaeche") as HTMLElement | null;
  const mit = () => { if (!gebaut) return; const A = k.ansicht(); ebene.style.transform = `translate(${(A.vx - gebaut.vx).toFixed(1)}px,${(A.vy - gebaut.vy).toFixed(1)}px)`; };
  fl?.addEventListener("pointermove", mit);
  addEventListener("ez-karte-zoom", () => { ebene.style.opacity = "0"; setTimeout(() => { bauen(true); ebene.style.opacity = ""; }, 280); } /* nach dem Gleiten (uebersicht.ts: 260 ms) in der neuen Größe */);
  fl?.addEventListener("pointerup", () => setTimeout(() => { mit(); bauen(); }, 30));
  stil(); bauen(true);
}

let stilDa = false;
function stil(): void { if (stilDa) return; stilDa = true; const s = document.createElement("style"); s.textContent = `
#ez-uebersicht .wk-oben{position:absolute;inset:0;pointer-events:none;transition:opacity .15s}
#ez-uebersicht .wk-sym,#ez-uebersicht .wk-n,#ez-uebersicht .wk-ortpunkt{transform:translate(-50%,-50%)}
#ez-uebersicht .wk-sym{position:absolute;width:24px;height:24px;margin:0;border-radius:50%;background:radial-gradient(#3a2a14,#140e08);box-shadow:0 0 0 1.5px #d9ad55,0 0 0 3px rgba(0,0,0,.45);display:grid;place-items:center;pointer-events:none}
#ez-uebersicht .wk-sym img{width:18px;height:18px} #ez-uebersicht .wk-sym.gross{width:30px;height:30px} #ez-uebersicht .wk-sym.gross img{width:22px;height:22px}
#ez-uebersicht .wk-sym b{position:absolute;right:-7px;top:-6px;font:700 9.5px Inter,sans-serif;color:#1a1208;background:#ffd36a;border-radius:6px;padding:0 3px}
#ez-uebersicht .wk-n{position:absolute;white-space:nowrap;pointer-events:none;color:#fff3d2;text-shadow:0 1px 3px #000}
#ez-uebersicht .wk-n.stadt{font:700 15px Cinzel,Georgia,serif;letter-spacing:.05em;color:#ffe7a8} #ez-uebersicht .wk-n.dorf{font:600 12px Cinzel,Georgia,serif}
#ez-uebersicht .wk-n.land{font:italic 500 13px Georgia,serif;color:#f3e6c4;opacity:.88;letter-spacing:.12em} #ez-uebersicht .wk-n.klein{font:500 11px Inter,sans-serif;color:#f0e4c8}
#ez-uebersicht .wk-ortpunkt{position:absolute;width:14px;height:14px;border-radius:50%;background:#ffd36a;box-shadow:0 0 0 2px #3a2a12,0 0 0 3.5px #ffd36a;pointer-events:none}
#ez-uebersicht .wk-umriss{position:absolute;border:1.5px dashed rgba(255,215,130,.75);border-radius:10px;background:rgba(255,215,130,.07);pointer-events:none}
#ez-uebersicht .wk-ich .wk-hier{position:absolute;left:0;top:14px;transform:translateX(-50%) scale(calc(1/var(--wkz,1)));transform-origin:50% 0;white-space:nowrap;font:600 11px Inter,sans-serif;color:#fff;background:rgba(15,30,55,.85);border:1px solid #4fa3ff;padding:1px 6px;border-radius:3px}
#ez-uebersicht .wk-legende{--f:7px;position:absolute;left:max(10px,env(safe-area-inset-left));top:8px;bottom:10px;width:190px;display:flex;flex-direction:column;gap:5px;padding:9px 9px 7px;background:#c99a3c;clip-path:polygon(var(--f) 0,calc(100% - var(--f)) 0,100% var(--f),100% calc(100% - var(--f)),calc(100% - var(--f)) 100%,var(--f) 100%,0 calc(100% - var(--f)),0 var(--f));isolation:isolate;z-index:2}
#ez-uebersicht .wk-legende::before{content:"";position:absolute;inset:1.5px;z-index:-1;background:linear-gradient(#261d12,#16100a);clip-path:inherit}
#ez-uebersicht .wk-ltitel{font:700 12.5px Cinzel,Georgia,serif;color:#ffe7b0;letter-spacing:.06em;padding-bottom:6px;border-bottom:1px solid #5a4528}
#ez-uebersicht .wk-such{position:relative} #ez-uebersicht .wk-such input{width:100%;box-sizing:border-box;font:12px Inter,sans-serif;color:#f3e6c4;background:#120d08;border:1px solid #5a4528;padding:5px 8px;border-radius:3px}
#ez-uebersicht .wk-treffer{position:absolute;left:0;right:0;top:100%;margin:2px 0 0;padding:3px;list-style:none;background:#16100a;border:1px solid #8a6a3a;z-index:3}
#ez-uebersicht .wk-treffer button{display:block;width:100%;text-align:left;padding:4px 6px;font:12px Inter,sans-serif;color:#f3e6c4;background:none;border:0;cursor:pointer} #ez-uebersicht .wk-treffer button:hover{background:#3a2c18}
#ez-uebersicht .wk-art{display:flex;align-items:center;gap:7px;width:100%;box-sizing:border-box;margin:0;min-height:0;padding:3px 4px;white-space:nowrap;font:500 12px Inter,sans-serif;color:#eadcb6;background:none;border:0;border-radius:3px;cursor:pointer;text-align:left}
#ez-uebersicht .wk-art .wk-s{width:20px;height:20px;border-radius:50%;background:radial-gradient(#3a2a14,#140e08);box-shadow:0 0 0 1.2px #d9ad55;display:grid;place-items:center;flex:none} #ez-uebersicht .wk-art .wk-s img{width:15px;height:15px}
#ez-uebersicht .wk-art .wk-p{width:10px;height:10px;border-radius:50%;background:#ffd36a;box-shadow:0 0 0 1.5px #3a2a12;margin:0 5px;flex:none}
#ez-uebersicht .wk-art>span:not(.wk-s){overflow:hidden;text-overflow:ellipsis} #ez-uebersicht .wk-art em{margin-left:auto;font-style:normal;color:#9c8a66;font-size:11px} #ez-uebersicht .wk-art.aus{opacity:.38} #ez-uebersicht .wk-art.aus .wk-s{filter:grayscale(1)}
#ez-uebersicht .wk-hierknopf{margin-top:auto;width:100%;box-sizing:border-box;white-space:nowrap;padding:5px;font:600 12px Inter,sans-serif;color:#fff;background:linear-gradient(#2e4f7a,#1a2f4c);border:1px solid #4fa3ff;border-radius:3px;cursor:pointer}
#ez-uebersicht .wk-stufen{display:flex;flex-direction:column;align-items:center;gap:4px;padding:2px 0} #ez-uebersicht .wk-stufen i{width:8px;height:8px;border-radius:50%;background:#4a3a22} #ez-uebersicht .wk-stufen i.an{background:#ffd36a;box-shadow:0 0 4px #ffd36a}
#ez-uebersicht .wk-stufen span{font:600 10px Inter,sans-serif;color:#c9a24f}
@media (max-height:500px){#ez-uebersicht .wk-legende{width:160px}#ez-uebersicht .wk-art{padding:2px 3px}}
`; document.head.appendChild(s); }
