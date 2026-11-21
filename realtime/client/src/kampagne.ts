/*
 * Kampagnen in Echtzeit: eine feste Abfolge aus Gesprächen und Kämpfen mit genau einem Ende.
 * Freiwillige Nebenaufgaben liegen am Weg (eine Frage mehr stellen, etwas untersuchen, einen Kampf zügig schaffen); sie ändern das Ende nicht.
 * Geschichte, Namen und Karten stammen aus den Kampagnen des Würfelspiels.
 *
 * Der Stand (Schritt, Held, erledigte Nebenaufgaben) wird vorläufig auf dem Gerät gemerkt; mit der Anmeldung zieht er aufs Konto um.
 * Jeder Kampf lädt die Seite neu – so bleibt der Stand auch nach einem Neuladen erhalten.
 */
import { gruppe, koopHeld } from "./gruppe";
import { kampagneGeschafft, team } from "./weltkarte";

export interface Zeile { wer?: string; text: string }
export interface Frage { knopf: string; zeilen: Zeile[]; neben?: string }
type Schritt =
  | { art: "dialog"; ort: string; bild: string; zeilen: Zeile[]; fragen?: Frage[]; weiter?: string }
  | { art: "kampf"; karte: string; ziel: string; neben?: { id: string; unterSek: number } }
  | { art: "ende"; bild: string; zeilen: Zeile[] };
interface Kampagne { id: string; nr: number; name: string; neben: Record<string, string>; schritte: Schritt[] }
interface Stand { schritt: number; held: string; mit: string[]; neben: Record<string, boolean> }

const WEIDENHAIN: Kampagne = {
  id: "weidenhain", nr: 1, name: "Das Erntefest von Weidenhain",
  neben: { mette: "Was die Alte am Feuer weiß", korn: "Das Korn gerettet – den Speicher zügig geräumt", agnes: "Das Müllergeld für Agnes" },
  schritte: [
    { art: "dialog", ort: "Weidenhain · Der Dorfplatz", bild: "img/weidenhain/titel.webp", weiter: "Zum Kornspeicher",
      zeilen: [
        { text: "Es ist Erntefest in Weidenhain. Auf dem Dorfplatz brennt ein Feuer, es riecht nach Brot und Bier, und jemand spielt schief auf einer Fiedel." },
        { text: "Dann ein Schrei vom Kornspeicher. Die Musik bricht ab." },
        { wer: "Hanne Kalk, Bürgermeisterin", text: "Du da. Du siehst aus, als könntest du kämpfen. Kannst du?" },
        { text: "Hinter ihr steht die Magd, bleich, die Schürze voller Korn. Am Feuer hat sich eine alte Frau nicht umgedreht." },
      ],
      fragen: [
        { knopf: "Hanne fragen, was passiert ist", zeilen: [
          { wer: "Hanne Kalk", text: "Kröten. So groß wie Hunde. Seit drei Tagen kommen sie aus dem Mühlgraben und fressen unser Korn. Heute sind sie in den Speicher. Wenn das Korn weg ist, wird der Winter lang." },
          { wer: "Hanne Kalk", text: "Früher haben sie das nie getan. Früher hatten sie Angst vor uns." }] },
        { knopf: "Die Magd fragen, was sie gesehen hat", zeilen: [
          { wer: "Lene, die Magd", text: "Sie saßen zwischen den Säcken. Die Augen haben geglänzt. Und die Zunge – die reicht weiter, als man denkt. Bleib nicht stehen, wenn eine Luft holt." }] },
        { knopf: "Zu der alten Frau am Feuer gehen", neben: "mette", zeilen: [
          { wer: "Mette", text: "Setz dich. Du willst wissen, warum die Kröten kommen. Schau nach Süden, über das Moor." },
          { text: "Über dem Schwarzmoor stehen kleine Lichter. Sie flackern nicht. Sie stehen einfach da." },
          { wer: "Mette", text: "Vor denen laufen sie davon. Die Alte am Wehr ist nicht böse. Sie hat Angst, und sie kennt nur einen Weg, ihr Volk zu schützen. Vergiss das nicht, wenn du vor ihr stehst." }] },
      ] },
    { art: "kampf", karte: "speicher", ziel: "Vertreibe die Kröten aus dem Kornspeicher", neben: { id: "korn", unterSek: 75 } },
    { art: "dialog", ort: "Der Kornspeicher · Das Loch in der Wand", bild: "img/weidenhain/speicher.webp", weiter: "Am Graben entlang zur Mühle",
      zeilen: [
        { text: "Die letzte Kröte hüpft durch ein Loch in der Rückwand davon. Dahinter rauscht der Mühlgraben." },
        { wer: "Hanne Kalk", text: "Das war gut. Aber sie kommen wieder, solange wir nicht wissen, woher." },
        { wer: "Lene", text: "Mein Bruder. Tebbe. Er ist zwölf. Er ist zur Mühle gelaufen, wegen der Katze, und ich habe vor lauter Angst nicht daran gedacht!" },
        { text: "Hanne wird blass. Der Mühlgraben führt vom Dorf hinaus zur alten Mühle und weiter zum Wehr. Dort kommen die Kröten her, und dort ist Tebbe." },
      ] },
    { art: "kampf", karte: "muehle", ziel: "Kämpfe dich über den Steg zur Mühle durch" },
    { art: "dialog", ort: "In der alten Mühle", bild: "img/weidenhain/muehle.webp", weiter: "Weiter zum Wehr",
      zeilen: [
        { text: "Die Mühle steht seit dem Tod des alten Müllers leer. Es riecht nach Staub und altem Mehl. Über dir knarrt eine Diele." },
        { text: "Tebbe liegt auf dem Mühlboden, die Katze an sich gedrückt. Eine Zunge hat ihn am Bein erwischt, bevor er die Leiter hochkam." },
        { wer: "Tebbe", text: "Am Wehr sitzt eine. So groß wie ein Kalb. Und über ihr sind Lichter. Sie schaut die ganze Zeit nach oben." },
        { text: "Du verbindest sein Bein. Er schläft ein, noch während du den Knoten ziehst." },
      ],
      fragen: [
        { knopf: "Die lose Diele neben dem Mahlstein untersuchen", neben: "agnes", zeilen: [
          { text: "Unter der Diele liegt ein Leinenbeutel, schwer von Münzen. Auf dem Stoff steht mit Kohle ein Name: AGNES." },
          { text: "Agnes ist die Witwe des Müllers. Sie wohnt im Dorf und näht für fremde Leute. Du steckst den Beutel ein, um ihn ihr zu bringen." }] },
      ] },
    { art: "dialog", ort: "Das alte Wehr", bild: "img/weidenhain/wehr.webp", weiter: "Zum Wehr hinunter",
      zeilen: [
        { text: "Am Wehr staut sich der Mühlteich. Auf den Steinen sitzt die größte Kröte, die du je gesehen hast. Die Dörfler nennen sie die alte Unke." },
        { text: "Über ihr schweben Irrlichter, und die Unke duckt sich unter ihnen. Hinter ihr, im flachen Wasser, drängen sich Dutzende kleinere Kröten aneinander." },
        { text: "Dann treibt eines der Irrlichter auf dich zu. Die Unke fährt herum, und was eben noch Angst war, wird Wut." },
      ] },
    { art: "kampf", karte: "wehr", ziel: "Bezwinge die alte Unke und die Irrlichter" },
    { art: "ende", bild: "img/weidenhain/abschnitt-1.webp",
      zeilen: [
        { text: "Das letzte Irrlicht zerstiebt über dem Wasser. Die alte Unke liegt halb auf den Steinen, schwer atmend, zu erschöpft, um die Zunge noch einmal zu heben." },
        { text: "Ohne die Lichter über ihr ist nichts mehr an ihr, das angreift. Du trittst zurück. Sie gleitet ins Wasser und führt ihr Volk den Graben hinab, weg vom Dorf und weg von den Lichtern." },
        { text: "Du holst Tebbe aus der Mühle und gehst zurück. Auf dem Dorfplatz spielt die Fiedel wieder, und diesmal spielt sie für dich." },
        { wer: "Hanne Kalk", text: "Setz dich. Iss. Heute Nacht zahlt in Weidenhain niemand, der Kröten aus meinem Speicher gejagt hat." },
        { text: "Gegen Morgen sitzt ein fremder Junge am Feuer, schlammverschmiert bis zu den Knien. Er ist die ganze Nacht gelaufen." },
        { wer: "Der Junge", text: "Ich komme aus Rabenmoor. Drei Kinder sind weg. Sie sind den Lichtern ins Moor gefolgt. Und das Dorf will die alte Hedda verbrennen. Sie sagen, hier ist jemand, der hilft." },
      ] },
  ],
};
const KAMPAGNEN: Record<string, Kampagne> = { weidenhain: WEIDENHAIN };

const P = new URLSearchParams(location.search), $ = (s: string) => document.querySelector(s) as HTMLElement;
const K: Kampagne | null = KAMPAGNEN[P.get("kampagne") || ""] || null;
const schluessel = () => "ez_k_" + (K ? K.id : "");
function lade(): Stand { try { const s = JSON.parse(localStorage.getItem(schluessel()) || "null"); if (s && typeof s.schritt === "number" && K && s.schritt < K.schritte.length) return { schritt: s.schritt, held: String(s.held || ""), mit: Array.isArray(s.mit) ? s.mit : [], neben: s.neben || {} }; } catch { /* privat */ } return { schritt: 0, held: "", mit: [], neben: {} }; }
function merke(s: Stand) { try { localStorage.setItem(schluessel(), JSON.stringify(s)); } catch { /* privat */ } }
if (K && P.get("neu") === "1") { try { localStorage.removeItem(schluessel()); } catch { /* privat */ } }
const S: Stand = K ? lade() : { schritt: 0, held: "", mit: [], neben: {} };
if (K && !S.held) { const t = team(); if (t) { S.held = t.held; S.mit = t.mit; } } // das Team von der Weltkarte geht mit
if (K && P.get("schritt") != null) S.schritt = Math.max(0, Math.min(K.schritte.length - 1, Number(P.get("schritt")) || 0)); // zum Testen

/** Läuft gerade eine Kampagne? */
export const inKampagne = Boolean(K);
/** Steht jetzt ein Kampf an (Held ist gewählt, der aktuelle Schritt ist ein Kampf)? Dann die Angaben dazu. */
/* Kampf aus einem begehbaren Ort heraus (?ort=weidenhain&kampf=speicher): Nach dem Sieg wird im Stand des Ortes der Merker „kampf_<karte>“ gesetzt, dann geht es zurück in den Ort. */
const ORTKAMPF: Record<string, string> = { speicher: "Vertreibe die Kröten aus dem Kornspeicher", muehle: "Kämpfe dich über den Steg zur Mühle durch", wehr: "Bezwinge die alte Unke und die Irrlichter", nest: "Zerschlage den Krötenlaich im Tümpel", ufer: "Vertreibe die Irrlichter vom Mühlteich",
  bohlenweg: "Überquere den Bohlenweg", waldweg: "Folge dem Waldweg nach Weidenhain", ried: "Kämpf dich durchs Ried", totenpfad: "Bring die Ertrunkenen zur Ruhe", schrein: "Stelle Alwine, die Stumme", kreuzwald: "Der Kreuzwald" };
const OK = { ort: P.get("ort") || "", karte: P.get("kampf") || "" }, IM_ORT = Boolean(OK.ort && ORTKAMPF[OK.karte]);
/** Stufe der Aufgabe je Ort (bestimmt mit der Gruppengröße die Stärke der Gegner) */
export { ORTSTUFE } from "../../shared/karten";
export const kampfJetzt: { karte: string; ziel: string; held: string; mit: string[] } | null = (() => { if (IM_ORT) { const t = team(); let h = t ? t.held : ""; try { h = h || localStorage.getItem("ez_held") || ""; } catch { /* privat */ } if (gruppe()) h = koopHeld(); /* in der Gruppe: der im Lager gewählte Held, ohne Begleiter */ return { karte: OK.karte, ziel: ORTKAMPF[OK.karte], held: h || "schildwaechter", mit: t && P.get("mitglied") !== "1" && !gruppe() ? t.mit : [] }; }
  if (!K || !S.held) return null; const s = K.schritte[S.schritt]; return s.art === "kampf" ? { karte: s.karte, ziel: s.ziel, held: S.held, mit: S.mit } : null; })();

/* ---------- Gesprächsfenster ---------- */
/** Ein Gespräch mitten im Ort: Das Dorf bleibt dahinter sichtbar. Erst die Zeilen, dann darf man fragen, bis man mit dem Schlussknopf geht. */
export async function plaudern(titel: string, zeilen: Zeile[], fragen: Frage[], schluss: string): Promise<void> {
  const d = fenster(titel, ""); await sprich(d, zeilen); const offen = fragen.slice();
  for (;;) { /* der letzte Satz bleibt stehen, während man antwortet */
    const i = await waehle(d, [...offen.map((f) => ({ text: f.knopf })), { text: schluss + " ▸", klasse: "haupt" }]); if (i >= offen.length) break; await sprich(d, offen.splice(i, 1)[0].zeilen); }
  d.hidden = true; d.innerHTML = "";
}
function fenster(ort: string, bild: string): HTMLElement {
  const d = $("#ez-dialog"); d.hidden = false; d.style.backgroundImage = bild ? `linear-gradient(rgba(6,5,10,.35), rgba(6,5,10,.8)), url("../${bild}")` : "none"; d.classList.toggle("im-ort", !bild);
  d.innerHTML = `<div class="ort"></div><div class="kasten"><i class="ecke a"></i><i class="ecke b"></i><i class="ecke c"></i><i class="ecke d"></i><div class="bildnis"><span></span><img class="wappen" src="../img/mythara/siegel.webp" alt=""></div>
    <div class="rechts"><div class="schild"><b class="wer"></b><small class="rolle"></small></div><button type="button" class="ende" hidden>✕ Gespräch beenden</button><div class="blatt"><p class="text"></p></div><div class="knoepfe"></div><small class="tipp"></small></div></div>`;
  (d.querySelector(".ort") as HTMLElement).textContent = ort; bildnis(d, ""); return d;
}
/* Bildnisse im Gespräch: aus dem Bildblatt der Person (Feld 240) der Kopf – Mitte x und Scheitel y im ersten Bild */
/* [Mitte x, Scheitel y, Bildblatt, Feldgröße, Bilder] – ohne Angabe: <id>.webp, Feld 240, 9 Bilder */
const KOPF: Record<string, [number, number, string?, number?, number?]> = { hanne: [112, 27], lene: [117, 31], agnes: [113, 25], mette: [117, 29], tebbe: [115, 38],
  bertold: [117, 29], ilse: [116, 5], jorin: [117, 5], joost: [112, 4], harm: [116, 3], mutter: [112, 8, "hedda"] };
/** Wer spricht: Name und Rolle ins Schild, das Bildnis links. Ohne Sprecher erzählt das Spiel – dann steht dort das Siegel. */
function bildnis(d: HTMLElement, wer: string) {
  const [name, rolle] = wer.split(",").map((t) => t.trim()), id = (name || "").split(" ")[0].toLowerCase(), k = KOPF[id], el = d.querySelector(".bildnis") as HTMLElement, sp = el.querySelector("span") as HTMLElement;
  const w = d.querySelector(".wer") as HTMLElement, ro = d.querySelector(".rolle") as HTMLElement; w.textContent = name || ""; ro.textContent = rolle || ""; ro.hidden = !rolle; (d.querySelector(".schild") as HTMLElement).classList.toggle("leer", !name);
  el.classList.toggle("erzaehler", !k); if (k) { const fe = k[3] || 240, n = k[4] || 9, w = fe * 0.36, f = 150 / w; sp.style.backgroundImage = `url("../img/echtzeit/${k[2] || id}.webp")`; sp.style.backgroundSize = `${fe * n * f}px ${fe * f}px`; sp.style.backgroundPosition = `${-(k[0] - w / 2) * f}px ${-(k[1] - fe * 0.025) * f}px`; } else sp.style.backgroundImage = "none";
}
/** Zeilen nacheinander zeigen; weiter mit Klick, Tipp, Leertaste oder Enter. */
function sprich(d: HTMLElement, zeilen: Zeile[]): Promise<void> {
  return new Promise((fertig) => { let n = 0; const wer = d.querySelector(".wer") as HTMLElement, text = d.querySelector(".text") as HTMLElement, tipp = d.querySelector(".tipp") as HTMLElement, kn = d.querySelector(".knoepfe") as HTMLElement; kn.innerHTML = "";
    const zeige = () => { const z = zeilen[n]; bildnis(d, z.wer || ""); wer.hidden = !z.wer; text.textContent = z.wer ? `„${z.text}“` : z.text; text.classList.toggle("erzaehlt", !z.wer); tipp.textContent = "weiter ▸"; (d.querySelector(".ende") as HTMLElement).hidden = true; };
    const vor = () => { n++; if (n >= zeilen.length) { d.removeEventListener("click", vor); removeEventListener("keydown", taste); tipp.textContent = ""; fertig(); } else zeige(); };
    const taste = (e: KeyboardEvent) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); vor(); } };
    d.addEventListener("click", vor); addEventListener("keydown", taste); zeige(); });
}
/** Knöpfe zeigen und auf die Wahl warten. */
function waehle(d: HTMLElement, knoepfe: { text: string; klasse?: string }[]): Promise<number> {
  return new Promise((fertig) => { const kn = d.querySelector(".knoepfe") as HTMLElement, ende = d.querySelector(".ende") as HTMLElement; kn.innerHTML = ""; (d.querySelector(".tipp") as HTMLElement).textContent = "";
    const fertigMit = (i: number) => { kn.innerHTML = ""; ende.hidden = true; ende.onclick = null; removeEventListener("keydown", taste); fertig(i); }, schluss = knoepfe.findIndex((k) => k.klasse === "haupt");
    const taste = (e: KeyboardEvent) => { const n = Number(e.key); if (n >= 1 && n <= knoepfe.length) { e.preventDefault(); fertigMit(n - 1); } else if (e.key === "Escape" && schluss >= 0) fertigMit(schluss); };
    let nr = 0; knoepfe.forEach((k, i) => { const b = document.createElement("button"); b.type = "button"; const haupt = k.klasse === "haupt"; b.innerHTML = `<em>${haupt ? "➜" : ++nr + "."}</em><span></span>`; (b.querySelector("span") as HTMLElement).textContent = k.text.replace(/ ▸$/, ""); if (k.klasse) b.className = k.klasse;
      b.onclick = (e) => { e.stopPropagation(); fertigMit(i); }; kn.appendChild(b); });
    if (schluss >= 0) { ende.hidden = false; ende.onclick = (e) => { e.stopPropagation(); fertigMit(schluss); }; } addEventListener("keydown", taste); });
}
function nebenMeldung(id: string) { if (!K || S.neben[id]) return; S.neben[id] = true; merke(S); const m = $("#ez-neben"); m.textContent = "Nebenaufgabe erfüllt: " + K.neben[id]; m.hidden = false; m.classList.remove("zeig"); void m.offsetWidth; m.classList.add("zeig"); setTimeout(() => { m.hidden = true; }, 4200); }

async function dialog(s: Extract<Schritt, { art: "dialog" }>) {
  const d = fenster(s.ort, s.bild); await sprich(d, s.zeilen); const offen = (s.fragen || []).slice();
  for (;;) { const text = d.querySelector(".text") as HTMLElement, wer = d.querySelector(".wer") as HTMLElement; wer.hidden = true; text.classList.add("erzaehlt"); text.textContent = offen.length ? "Was tust du?" : "";
    const i = await waehle(d, [...offen.map((f) => ({ text: f.knopf + (f.neben ? "  ◇ freiwillig" : "") })), { text: (s.weiter || "Weiter") + " ▸", klasse: "haupt" }]);
    if (i >= offen.length) return; const f = offen.splice(i, 1)[0]; await sprich(d, f.zeilen); if (f.neben) nebenMeldung(f.neben); }
}
async function ende(s: Extract<Schritt, { art: "ende" }>) {
  if (!K) return; const d = fenster(K.name, s.bild); await sprich(d, s.zeilen); kampagneGeschafft(K.nr); try { localStorage.removeItem(schluessel()); } catch { /* privat */ }
  const ids = Object.keys(K.neben), n = ids.filter((id) => S.neben[id]).length, wer = d.querySelector(".wer") as HTMLElement, text = d.querySelector(".text") as HTMLElement; wer.hidden = false; wer.textContent = "Kampagne geschafft"; text.classList.add("erzaehlt");
  text.innerHTML = `<b>${K.name}</b><br>Freiwillige Nebenaufgaben: ${n} von ${ids.length}<br>` + ids.map((id) => `<span class="${S.neben[id] ? "ja" : "nein"}">${S.neben[id] ? "✓" : "–"} ${K.neben[id]}</span>`).join("<br>") + `<br><br>Auf der Weltkarte ist jetzt die nächste Kampagne freigeschaltet.`;
  await waehle(d, [{ text: "Zurück in die Waldmark ▸", klasse: "haupt" }]); location.href = "./";
}

/** Vom aktuellen Schritt an weiterspielen: Gespräche laufen gleich, vor einem Kampf wird die Seite neu geladen. */
async function laufe(wahl: (los: (held: string, mit: string[]) => void, zurueck?: () => void, wort?: { los: string; zurueck: string }) => void) {
  if (!K) return;
  if (!S.held) { await new Promise<void>((ok) => { wahl((held, mit) => { S.held = held; S.mit = mit; merke(S); ok(); }, () => { location.href = "./"; }, { los: "Aufbrechen", zurueck: "Zurück in die Waldmark" }); }); }
  for (;;) { const s = K.schritte[S.schritt];
    if (s.art === "kampf") { merke(S); const u = new URL(location.href); u.searchParams.delete("neu"); u.searchParams.delete("schritt"); location.replace(u.toString()); return; }
    if (s.art === "ende") { await ende(s); return; }
    await dialog(s); S.schritt++; merke(S); }
}
/** Beim Laden der Seite, wenn kein Kampf ansteht: Heldenwahl und Gespräche. */
export function kampagneBeginnen(wahl: Parameters<typeof laufe>[0]) { document.body.classList.add("kampagne"); void laufe(wahl); }
/** Ein Kampf ist gewonnen: Nebenaufgabe prüfen, dann geht die Geschichte weiter. */
export function kampfGewonnen(sek: number, wahl: Parameters<typeof laufe>[0]) {
  if (IM_ORT && P.get("mitglied") === "1") { const s = P.has("server") ? "&server=" + encodeURIComponent(P.get("server") || "") : ""; setTimeout(() => location.replace("./?ort=" + encodeURIComponent(OK.ort) + "&mitreise=1" + s), 1800); return; } /* Koop-Mitspieler: zurück in die Waldmark – die Geschichte erlebt der Anführer */
  if (IM_ORT) { try { const k = "ez_ort_" + OK.ort, m = JSON.parse(localStorage.getItem(k) || "{}") || {}; m["kampf_" + OK.karte] = true; localStorage.setItem(k, JSON.stringify(m)); } catch { /* privat */ } setTimeout(() => location.replace("?ort=" + encodeURIComponent(OK.ort) + (P.has("server") ? "&server=" + encodeURIComponent(P.get("server") || "") : "")), 1800); return; }
  if (!K) return; const s = K.schritte[S.schritt]; if (s.art !== "kampf") return; S.schritt++; merke(S);
  if (s.neben && sek <= s.neben.unterSek) nebenMeldung(s.neben.id);
  setTimeout(() => void laufe(wahl), 1400); // kurz den Sieg sehen lassen
}
