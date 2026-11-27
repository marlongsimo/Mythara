/*
^ * Die Karte als Übersicht (Knopf „Karte“ an der Minikarte, Taste M): die ganze bekannte Welt aus der Vogelperspektive,
 * zum Verschieben (ziehen), mit festem Zoom: sichtbar sind immer etwa SICHT_FELDER Felder in der Breite (Wunsch des Nutzers, #11) – auf Handy und PC derselbe Ausschnitt.
 * Gezeigt werden Boden, Wald und Gebäude – keine Gegner.
 *
 * Erweiterbar: Die Karte setzt sich aus allen Regionen in welt.json zusammen (je Region das Bild karte-<id>.webp aus
 * werkzeug/welt/karte.py an ihrer Weltstelle). Eine neue Region erscheint also von selbst, sobald die Welt-Pipeline sie gebaut hat.
 * Die Regionen stoßen ohne Rahmen aneinander; nur ihre Namen stehen klein darüber.
 */
import { symboleOrdnen } from "./symbolordnung";
export interface KartenRegion { id: string; name: string; ursprung: number[]; chunks: number[]; /** Kartensymbole in Weltfeldern (aus welt.json) */ symbole?: { s: string; x: number; y: number }[] }
export interface WeltkarteOpts {
  daten: string;                                 // Ordner mit karte-<id>.webp
  stand?: string;                                // Kennung des Weltbaus (gegen veraltete Bilder im Browser)
  regionen: KartenRegion[];                      // alle sichtbaren Regionen (gesperrte schon herausgenommen)
  chunkFelder: number;                           // Felder je Chunk
  ich: () => { x: number; y: number } | null;    // eigene Stelle in Feldern (Welt)
  hier?: () => string;                           // Region, in der man steht (für die Überschrift)
  orte?: { x: number; y: number; zeichen: string; name: string }[]; // besondere Stellen (Läden) als kleines Symbol
  symbolNamen?: Record<string, string>;          // Kennung → Name der Kartensymbole
  symbolBild?: string;                           // Ordner der Symbolbilder (img/karte/symbole/)
  /** Ortsnamen (welt/ortsnamen.json, #90): Gebiete mit Schriftpunkt und einzelne Orte – Größe nach Bedeutung (Stadt groß, Dorf mittel, kleine Orte klein) */
  namen?: { gebiete: { name: string; art: string; schrift: number[] }[]; orte: { name: string; art: string; x: number; y: number }[] };
}
/** Ortsnamen nach Bedeutung: „gross“ (Städte, Hotspots), „mittel“ (Dörfer, Gehöfte), „land“ (Landschaften und Wälder, kursiv), „klein“ (alles andere, mit Raute) */
const STUFE = (art: string, gebiet: boolean): "gross" | "mittel" | "land" | "klein" =>
  art === "Stadt" ? "gross" : art === "Dorf" || (gebiet && (art === "Gehöft" || art === "Ruineninsel")) ? "mittel" : art === "Landschaft" || art === "Wald" ? "land" : "klein";

/** Bildpunkte je Feld auf der Leinwand. #183: die Leinwand wird gleich in Bildschirmgröße aufgebaut (Breite / SICHT_FELDER, Zoom ≈ 1) –
 *  vorher 4 px je Feld mit scale(0,13): WebKit (iPhone) rasterte dafür eine Ebene von 9600×12672 px */
let PX = 4;
/** So viele Felder zeigt die Karte in der Breite (fester Zoom, #11: von den Riedwiesen bis Graufurt) */
export const SICHT_FELDER = 750;
let offen: (() => void) | null = null;
/** #183: Die Karte deckt den ganzen Schirm – solange zeichnet die 3D-Welt dahinter nicht (welt3d/motor.ts), die Spiellogik läuft weiter */
export const karteDeckt = (): boolean => offen !== null;

export function uebersichtOffen(): boolean { return !!offen; }

/** Öffnet die Übersicht (oder schließt sie, wenn sie schon offen ist) */
export function uebersicht(o: WeltkarteOpts): void {
  if (offen) { offen(); return; }
  if (!o.regionen.length) return;
  stil();
  const C = o.chunkFelder; PX = Math.max(0.3, (window.innerWidth || 800) / SICHT_FELDER);
  /* Umriss der ganzen Welt in Feldern */
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const r of o.regionen) { x0 = Math.min(x0, r.ursprung[0] * C); y0 = Math.min(y0, r.ursprung[1] * C); x1 = Math.max(x1, (r.ursprung[0] + r.chunks[0]) * C); y1 = Math.max(y1, (r.ursprung[1] + r.chunks[1]) * C); }
  const B = (x1 - x0) * PX, H = (y1 - y0) * PX;

  const hülle = document.createElement("div"); hülle.id = "ez-uebersicht"; hülle.setAttribute("role", "dialog"); hülle.setAttribute("aria-label", "Karte");
  hülle.innerHTML = `<div class="wk-flaeche"><div class="wk-leinwand" style="width:${B}px;height:${H}px"></div></div>
    <div class="wk-kopf"><b>Karte</b><span class="wk-kopfort"></span></div>
    <div class="wk-knoepfe"><button type="button" data-k="ich" aria-label="Zu mir">◎</button></div>
    <button type="button" class="wk-zu" aria-label="Schließen">✕</button>
    <p class="wk-hilfe">Ziehen zum Verschieben · M oder Esc schließt</p>`;
  const flaeche = hülle.querySelector(".wk-flaeche") as HTMLElement, lw = hülle.querySelector(".wk-leinwand") as HTMLElement;
  /* #183: Bilder erst laden, wenn sie in die Nähe des Sichtbereichs kommen (nachladen() unten) – sonst lägen alle Regionen dekodiert im Speicher (73 MPx) */
  const kacheln: { im: HTMLImageElement; x: number; y: number; w: number; h: number; an: boolean }[] = [];
  for (const r of o.regionen) {
    const im = document.createElement("img"); im.alt = ""; im.draggable = false; im.decoding = "async"; im.dataset.src = `${o.daten}karte-${r.id}.webp${o.stand ? "?v=" + o.stand : ""}`; im.dataset.region = r.id;
    /* Kanten auf ganze Pixel: bei Bruchteil-Pixeln je Feld blieben zwischen benachbarten Regionen feine Nähte */
    const l = Math.round((r.ursprung[0] * C - x0) * PX), t = Math.round((r.ursprung[1] * C - y0) * PX), rr = Math.round(((r.ursprung[0] + r.chunks[0]) * C - x0) * PX), u = Math.round(((r.ursprung[1] + r.chunks[1]) * C - y0) * PX);
    const k = { im, x: l, y: t, w: rr - l, h: u - t, an: false };
    Object.assign(im.style, { left: k.x + "px", top: k.y + "px", width: k.w + "px", height: k.h + "px" });
    lw.appendChild(im); kacheln.push(k);
  }
  /* Namen nach den Bildern, damit sie oben liegen. Ein Land aus mehreren Regionen (das Festland ist in Kacheln geschnitten) bekommt seinen Namen
     nur einmal, in der flächengewichteten Mitte seiner Regionen. */
  const namen = new Map<string, { x: number; y: number; f: number }>();
  for (const r of o.regionen) { const f = r.chunks[0] * r.chunks[1], q = namen.get(r.name) || { x: 0, y: 0, f: 0 };
    q.x += (r.ursprung[0] + r.chunks[0] / 2) * f; q.y += (r.ursprung[1] + r.chunks[1] / 2) * f; q.f += f; namen.set(r.name, q); }
  /* Meere umschließen das Land: ihre Mitte läge an Land – dort steht der Name auf der äußersten Kachel des Meeres */
  const mx = o.regionen.reduce((s, r) => s + r.ursprung[0] + r.chunks[0] / 2, 0) / o.regionen.length, my = o.regionen.reduce((s, r) => s + r.ursprung[1] + r.chunks[1] / 2, 0) / o.regionen.length;
  for (const [name, q] of namen) if (/meer/i.test(name)) { let best = -1;
    for (const r of o.regionen) if (r.name === name) { const x = r.ursprung[0] + r.chunks[0] / 2, y = r.ursprung[1] + r.chunks[1] / 2, d = (x - mx) ** 2 + (y - my) ** 2; if (d > best) { best = d; q.x = x; q.y = y; q.f = 1; } } }
  /* Mit Ortsnamen (#90): nur sichtbare (in einer freigeschalteten Region); Regionsnamen nur noch dort, wo kein Gebietsname steht (Meere, Grenzland …) */
  const inRegion = (x: number, y: number, rs: KartenRegion[] = o.regionen) => rs.some((r) => x >= r.ursprung[0] * C && x < (r.ursprung[0] + r.chunks[0]) * C && y >= r.ursprung[1] * C && y < (r.ursprung[1] + r.chunks[1]) * C);
  const schild = (text: string, x: number, y: number, stufe: string) => { const n = document.createElement("div"); n.className = "wk-name " + stufe; n.textContent = text;
    Object.assign(n.style, { left: (x - x0) * PX + "px", top: (y - y0) * PX + "px" }); lw.appendChild(n); };
  const G = o.namen ? o.namen.gebiete.filter((g) => inRegion(g.schrift[0], g.schrift[1])) : [];
  for (const [name, q] of namen) {
    if (o.namen && G.some((g) => inRegion(g.schrift[0], g.schrift[1], o.regionen.filter((r) => r.name === name)))) continue;
    schild(name, (q.x / q.f) * C, (q.y / q.f) * C, o.namen ? "land" : "");
  }
  for (const g of G) schild(g.name, g.schrift[0], g.schrift[1], STUFE(g.art, true));
  if (o.namen) for (const p of o.namen.orte) if (inRegion(p.x, p.y)) schild(p.name, p.x, p.y, STUFE(p.art, false));
  for (const o2 of o.orte || []) { const m = document.createElement("div"); m.className = "wk-ort"; m.title = o2.name; m.innerHTML = `<i>${o2.zeichen}</i>`;
    Object.assign(m.style, { left: (o2.x - x0) * PX + "px", top: (o2.y - y0) * PX + "px" }); lw.appendChild(m); }
  /* Kartensymbole: bleiben bei jedem Zoom gleich groß (wie die Namen) */
  for (const r of o.regionen) for (const q of r.symbole || []) { const im = document.createElement("img"); im.className = "wk-symbol"; im.draggable = false; im.src = (o.symbolBild || "") + q.s + ".webp";
    im.alt = im.title = (o.symbolNamen || {})[q.s] || q.s; Object.assign(im.style, { left: (q.x - x0) * PX + "px", top: (q.y - y0) * PX + "px" }); lw.appendChild(im); }
  /* dicht beieinanderliegende Symbole je Zoomstufe so weit auseinander, dass jedes ganz zu sehen ist */
  /* Namen ohne Überlappen: wichtige zuerst (Stadt, Dorf, Landschaft, klein), was danach einen schon gesetzten Namen berührt, bleibt aus (einmal je Bildschirmgröße) */
  const RANG: Record<string, number> = { gross: 0, mittel: 1, "": 2, land: 2, klein: 3 }, schilder = [...lw.querySelectorAll<HTMLElement>(".wk-name")].sort((a, b) => (RANG[a.classList[1] || ""] ?? 2) - (RANG[b.classList[1] || ""] ?? 2));
  let namenZ = -1, symZ = -1; const namenOrdnen = () => { if (namenZ === z) return; namenZ = z; const frei: DOMRect[] = [];
    for (const n of schilder) { n.style.visibility = ""; const r = n.getBoundingClientRect(); if (frei.some((q) => r.left < q.right + 4 && r.right > q.left - 4 && r.top < q.bottom + 2 && r.bottom > q.top - 2)) n.style.visibility = "hidden"; else frei.push(r); } };
  const symbole = [...lw.querySelectorAll<HTMLElement>(".wk-symbol")], ordnen = () => { namenOrdnen(); if (symZ === z) return; symZ = z; /* #183: beim Ziehen ändert sich der Zoom nicht – nicht bei jeder Bewegung alle Symbole neu verteilen */ symboleOrdnen(symbole.map((el) => ({ el, x: parseFloat(el.style.left) * z, y: parseFloat(el.style.top) * z })), 26, z, ` scale(${(1 / z).toFixed(4)})`); };
  const punkt = document.createElement("div"); punkt.className = "wk-ich"; punkt.innerHTML = "<i></i>"; lw.appendChild(punkt);
  document.body.appendChild(hülle);

  /* Ansicht: Verschiebung (px am Bildschirm) und Zoom */
  let z = 1, vx = 0, vy = 0, wkz = -1;
  /* #183: nur Bilder nahe am Sichtbereich laden (Rand eine halbe Bildschirmgröße), weit draußen wieder entladen (Rand 1,5) – keine Schreibvorgänge, solange sich nichts ändert */
  const nachladen = () => { const W = flaeche.clientWidth, Hh = flaeche.clientHeight;
    const box = (rand: number) => [(-vx - W * rand) / z, (-vy - Hh * rand) / z, (W * (1 + rand) - vx) / z, (Hh * (1 + rand) - vy) / z];
    const [ax, ay, bx, by] = box(0.5), [fx, fy, gx, gy] = box(1.5);
    for (const k of kacheln) { if (!k.an) { if (k.x < bx && k.x + k.w > ax && k.y < by && k.y + k.h > ay) { k.an = true; k.im.src = k.im.dataset.src!; } }
      else if (!(k.x < gx && k.x + k.w > fx && k.y < gy && k.y + k.h > fy)) { k.an = false; k.im.removeAttribute("src"); } } };
  /** fester Zoom aus der Breite der Kartenfläche */ const zFest = () => Math.max(0.05, flaeche.clientWidth / (SICHT_FELDER * PX));
  const setzen = () => { /* nicht weiter hinaus schieben, als die Welt reicht (ein Rest bleibt sichtbar) */
    const W = flaeche.clientWidth, Hh = flaeche.clientHeight, b = B * z, h = H * z;
    vx = b <= W ? (W - b) / 2 : Math.min(W * 0.4, Math.max(W * 0.6 - b, vx)); vy = h <= Hh ? (Hh - h) / 2 : Math.min(Hh * 0.4, Math.max(Hh * 0.6 - h, vy));
    lw.style.transform = `translate(${vx.toFixed(1)}px, ${vy.toFixed(1)}px) scale(${z.toFixed(4)})`; nachladen(); if (wkz !== z) { wkz = z; hülle.style.setProperty("--wkz", String(z)); } ordnen(); /* #183: --wkz nur bei neuem Zoom – sonst rechnet jeder Zug alle Symbole und Namen neu */
  };
  /** Zoom neu (Fenstergröße geändert): die Mitte bleibt, wo sie war */
  const neuZoomen = () => { const n = zFest(), px = flaeche.clientWidth / 2, py = flaeche.clientHeight / 2; vx = px - (px - vx) * (n / z); vy = py - (py - vy) * (n / z); z = n; setzen(); };
  const zuMir = () => { const i = o.ich(); if (!i) return; vx = flaeche.clientWidth / 2 - (i.x - x0) * PX * z; vy = flaeche.clientHeight / 2 - (i.y - y0) * PX * z; setzen(); };
  z = zFest(); zuMir(); if (!o.ich()) setzen();

  /* eigene Stelle laufend nachführen (der Held läuft weiter, auch während die Karte offen ist) */
  let lauf = 0;
  const kopfort = hülle.querySelector(".wk-kopfort") as HTMLElement; let alt = "";
  const folgen = () => { const i = o.ich(), r = o.hier && o.regionen.find((q) => q.id === o.hier!()), neu = (i ? Math.round((i.x - x0) * PX) + "," + Math.round((i.y - y0) * PX) : "") + "|" + (r ? r.name : "");
    if (neu !== alt) { alt = neu; punkt.hidden = !i; if (i) { punkt.style.left = (i.x - x0) * PX + "px"; punkt.style.top = (i.y - y0) * PX + "px"; } kopfort.textContent = r ? r.name : ""; } /* #183: nur bei Änderung schreiben */
    lauf = requestAnimationFrame(folgen); };
  folgen();

  /* Ziehen mit Zeigern (Maus, Finger); kein Zoomen (fester Ausschnitt) */
  const zeiger = new Map<number, { x: number; y: number }>();
  flaeche.addEventListener("pointerdown", (e) => { flaeche.setPointerCapture(e.pointerId); zeiger.set(e.pointerId, { x: e.clientX, y: e.clientY }); flaeche.classList.add("zieht"); });
  flaeche.addEventListener("pointermove", (e) => { const alt = zeiger.get(e.pointerId); if (!alt) return; const neu = { x: e.clientX, y: e.clientY }; zeiger.set(e.pointerId, neu);
    if (zeiger.size === 1) { vx += neu.x - alt.x; vy += neu.y - alt.y; setzen(); } });
  const los = (e: PointerEvent) => { zeiger.delete(e.pointerId); if (!zeiger.size) flaeche.classList.remove("zieht"); };
  flaeche.addEventListener("pointerup", los); flaeche.addEventListener("pointercancel", los);
  flaeche.addEventListener("wheel", (e) => e.preventDefault(), { passive: false }); /* kein Zoomen mit dem Mausrad (und die Seite rollt nicht) */
  hülle.querySelector(".wk-knoepfe")!.addEventListener("click", (e) => { const k = (e.target as HTMLElement).closest("[data-k]") as HTMLElement | null; if (!k) return;
    if (k.dataset.k === "ich") zuMir(); });
  hülle.addEventListener("pointerdown", (e) => e.stopPropagation());

  /* Tasten: M / Esc schließen; das Spiel bekommt solange keine Tasten (der Held bleibt stehen) */
  const taste = (e: KeyboardEvent) => { if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return; e.stopPropagation(); e.preventDefault();
    if (e.type !== "keydown" || e.repeat) return; const k = e.key.toLowerCase();
    if (k === "escape" || k === "m") schliessen(); };
  window.addEventListener("keydown", taste, true); window.addEventListener("keyup", taste, true);
  const groesse = () => neuZoomen(); /* Handy gedreht: Zoom aus der neuen Breite */ window.addEventListener("resize", groesse);
  const schliessen = () => { cancelAnimationFrame(lauf); window.removeEventListener("keydown", taste, true); window.removeEventListener("keyup", taste, true); window.removeEventListener("resize", groesse); hülle.remove(); offen = null; };
  hülle.querySelector(".wk-zu")!.addEventListener("click", schliessen);
  offen = schliessen;
}

let stilDa = false;
function stil() {
  if (stilDa) return; stilDa = true;
  const s = document.createElement("style"); s.textContent = `
#ez-uebersicht{position:fixed;inset:0;z-index:60;background:radial-gradient(ellipse at center,#1d1912 0%,#0c0a07 100%);color:#f3e6c4;font-family:Cinzel,Georgia,serif;touch-action:none;user-select:none;-webkit-user-select:none}
#ez-uebersicht .wk-flaeche{position:absolute;inset:0;overflow:hidden;cursor:grab}
#ez-uebersicht .wk-flaeche.zieht{cursor:grabbing}
#ez-uebersicht .wk-leinwand{position:absolute;left:0;top:0;transform-origin:0 0;will-change:transform}
#ez-uebersicht .wk-symbol{position:absolute;width:30px;height:auto;transform:translate(-50%,-58%) scale(calc(1 / var(--wkz,1)));transform-origin:50% 58%;filter:drop-shadow(0 1px 3px rgba(0,0,0,.85))}
#ez-uebersicht .wk-leinwand img{position:absolute;display:block;pointer-events:none;image-rendering:auto}
#ez-uebersicht .wk-name{position:absolute;transform:translate(-50%,-50%) scale(calc(1 / var(--wkz,1)));white-space:nowrap;pointer-events:none;font-size:15px;letter-spacing:.08em;color:#ffe9b0;text-shadow:0 0 4px #000,0 0 8px #000,0 1px 2px #000;opacity:.92}
#ez-uebersicht .wk-name{z-index:3}
#ez-uebersicht .wk-name.gross{transform:translate(-50%,-210%) scale(calc(1 / var(--wkz,1)));transform-origin:50% 210%;font-size:19px;font-weight:700;letter-spacing:.1em;color:#ffd36a;opacity:1;text-shadow:0 0 4px #000,0 0 10px #000,0 2px 2px #000}
#ez-uebersicht .wk-name.mittel{font-size:14px;color:#ffe9b0}
#ez-uebersicht .wk-name.land{font-size:13px;font-style:italic;letter-spacing:.14em;color:#e9dcb8;opacity:.8}
#ez-uebersicht .wk-name.klein{font:600 10.5px Inter,sans-serif;letter-spacing:.02em;color:#f3e3b5;opacity:.95}
#ez-uebersicht .wk-name.klein::before{content:"";display:inline-block;width:5px;height:5px;margin:0 5px 1px 0;transform:rotate(45deg);background:#e9c46a;box-shadow:0 0 0 1px #000}
#ez-uebersicht .wk-ort{position:absolute;width:0;height:0}
#ez-uebersicht .wk-ort i{position:absolute;left:-11px;top:-11px;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:12px;font-style:normal;background:#2a1f12;border:1.5px solid #e9c46a;box-shadow:0 0 0 2px rgba(0,0,0,.45);transform:scale(calc(1 / var(--wkz,1)))}
#ez-uebersicht .wk-ich{position:absolute;width:0;height:0;pointer-events:none}
#ez-uebersicht .wk-ich i{position:absolute;left:-8px;top:-8px;width:16px;height:16px;border-radius:50%;background:#ffd34d;border:2px solid #fff;box-shadow:0 0 0 3px rgba(0,0,0,.45),0 0 14px #ffd34d;transform:scale(calc(1 / var(--wkz,1)))}
#ez-uebersicht .wk-ich i::after{content:"";position:absolute;inset:-9px;border-radius:50%;border:2px solid rgba(255,211,77,.7);animation:wkpuls 1.6s ease-out infinite}
@keyframes wkpuls{from{transform:scale(.5);opacity:1}to{transform:scale(1.5);opacity:0}}
#ez-uebersicht .wk-kopf{position:absolute;left:50%;top:max(12px,env(safe-area-inset-top));transform:translateX(-50%);padding:7px 18px;border-radius:999px;background:rgba(20,16,10,.82);border:1px solid #8a6d3b;display:flex;gap:10px;align-items:baseline;font-size:16px;white-space:nowrap;pointer-events:none}
#ez-uebersicht .wk-kopf .wk-kopfort{font-size:13px;color:#d8c28e}
#ez-uebersicht .wk-knoepfe{position:absolute;right:max(14px,env(safe-area-inset-right));bottom:max(18px,env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:8px}
#ez-uebersicht button{width:44px;height:44px;border-radius:50%;border:1px solid #8a6d3b;background:rgba(28,22,14,.9);color:#ffe08a;font:600 22px/1 Georgia,serif;cursor:pointer;display:grid;place-items:center}
#ez-uebersicht button:hover{background:rgba(60,46,26,.95)}
#ez-uebersicht .wk-zu{position:absolute;right:max(14px,env(safe-area-inset-right));top:max(12px,env(safe-area-inset-top));font-size:18px}
#ez-uebersicht .wk-hilfe{position:absolute;left:50%;bottom:max(14px,env(safe-area-inset-bottom));transform:translateX(-50%);margin:0;font:12px/1.3 Georgia,serif;color:#cbb88a;opacity:.8;text-align:center;pointer-events:none;max-width:calc(100% - 140px)}
/* #183: leichtere Schatten (WebKit malt drop-shadow und mehrfache text-shadow teuer); beim Ziehen ganz ohne – die Ebene wird dann nur verschoben */
#ez-uebersicht .wk-leinwand .wk-name{text-shadow:0 0 3px #000,0 1px 1px #000}
#ez-uebersicht .wk-flaeche.zieht .wk-symbol{filter:none}
#ez-uebersicht .wk-flaeche.zieht .wk-name{text-shadow:none}
@media (max-width:600px){#ez-uebersicht .wk-hilfe{display:none}}`;
  document.head.appendChild(s);
}
