/*
 * Ein begehbarer Ort der Kampagne. Der Boden ist ein gerechnetes Bild (werkzeug/gelaende.py), dazu ein Raster, wo man laufen kann.
 * Bisher nur der Boden von Weidenhain: Gebäude, Leute und Eingänge kommen dazu.
 * Aufruf zum Ausprobieren: ?ort=weidenhain
 */
import Phaser from "phaser";
import { HELDEN } from "../../shared/config";
import { team, kampagneGeschafft } from "./weltkarte";
import { zoomFaktor, zoomKnopf } from "./zoom";
import { wecken } from "./netz";
import { heldenhalle } from "./halle";
import { hudProfil, hudTitel, hudKarte, hudQuest, hudTeam, hudMenue, menueTafel, istHaupt } from "./hud";
import { plaudern, Zeile, Frage } from "./kampagne";
import WEIDENHAIN from "./weidenhain.json";
import BAUKASTEN from "./baukasten.json";
import RABENMOOR from "./rabenmoor.json";

const $ = (s: string) => document.querySelector(s) as HTMLElement, P = new URLSearchParams(location.search);
const HANDY = window.matchMedia("(pointer: coarse)").matches || P.get("handy") === "1";
/* bild: ein gemaltes Ortsbild (werkzeug/ortbild.py), mass: so stark wird es vergrößert, vorn: was den Helden verdeckt. Ohne bild: gerechneter Boden aus dem Baukasten (werkzeug/gelaende.py). */
interface OrtDaten { name: string; bild?: string; mass?: number; gross?: number; breit: number; hoch: number; zelle: number; zeilen: string[]; zaeune: unknown[]; leute?: (string | number)[][]; gruppen?: number[][]; vorn?: unknown[]; stellen: Record<string, number[]> }
const ORTE: Record<string, OrtDaten> = { weidenhain: { ...WEIDENHAIN, name: "Weidenhain" }, rabenmoor: { ...RABENMOOR, name: "Rabenmoor" }, baukasten: { ...BAUKASTEN, name: "Baukasten-Probe" } };
export const ortName = ORTE[P.get("ort") || ""] ? (P.get("ort") as string) : "";
/* Das Zaunstück: im Bild 918 × 688, linker Pfosten unten bei (130, 655), rechter Pfosten 664 weiter rechts und 203 höher. Gespiegelt läuft es nach rechts hinunter. */
const ZAUN = { breit: 170, fx: 130 / 918, fy: 655 / 688, dx: 664 * 170 / 918, dy: 203 * 170 / 918 };
/*
 * Leute zum Ansprechen. feld: Feldgröße im Bildblatt, koerper: Anteil des Feldes, den die Figur hoch ist, fuss: wo die Füße im Feld stehen.
 * Jedes Gespräch hat eine Bedingung (wenn: diese Merker müssen gesetzt sein) und setzt am Ende selbst einen Merker (setzt).
 * Wer ein offenes Gespräch hat, trägt ein Ausrufezeichen über dem Kopf. Ist alles gesagt, kommt nur noch der Satz unter „sonst“.
 */
interface Rede { wenn?: string[]; setzt: string; zeilen: Zeile[]; fragen: Frage[]; schluss: string; ende?: number /* damit ist die Kampagne geschafft */ }
/* blatt: anderes Bildblatt als <id>.webp; still: nur das erste Bild zeigen (Laufblätter aus der Waldmark);
   lauf: Wer so ein Laufblatt hat, kommt beim ersten Auftauchen von der Stelle „von“ angerannt (koerper und fuss wie oben, für das Laufblatt). */
const LEUTE: Record<string, { name: string; feld: number; koerper: number; fuss: number; gross?: number; zeigen?: string; blatt?: string; still?: boolean; lauf?: { blatt: string; koerper: number; fuss: number; von: string }; reden: Rede[]; sonst: Zeile }> = {
  /* Jorin rennt nach dem Kampf am Wehr nach Weidenhain – der letzte Schritt dort und der Weg nach Rabenmoor */
  bote: { name: "Jorin", feld: 240, koerper: 0.967, fuss: 0.979, gross: 0.7, blatt: "jorin", zeigen: "unke_nach", lauf: { blatt: "jorin-lauf", koerper: 0.9, fuss: 0.933, von: "start" },
    sonst: { wer: "Jorin", text: "Rabenmoor ist im Süden, hinter dem Schwarzmoor. Bitte beeil dich." },
    reden: [{ setzt: "bote", schluss: "Ich komme nach Rabenmoor", ende: 1,
      zeilen: [{ text: "Ein Junge stolpert auf den Platz, schlammverschmiert bis zu den Knien. Er ist die ganze Nacht gelaufen." },
        { wer: "Jorin", text: "Bist du das? Die, die die Unke vertrieben haben? Sie sagen, hier ist jemand, der hilft." },
        { wer: "Jorin, aus Rabenmoor", text: "Drei Kinder sind weg. Meine Schwester Fenna auch. Sie sind den Lichtern ins Moor gefolgt, eins nach dem anderen." },
        { wer: "Jorin", text: "Und das Dorf will die alte Hedda verbrennen. Ich glaube nicht, dass sie es war. Bitte komm nach Rabenmoor." }],
      fragen: [{ knopf: "Was für Lichter?", zeilen: [{ wer: "Jorin", text: "Sie flackern nicht. Sie stehen einfach über dem Wasser. Wer zu lange hinschaut, will ihnen nach." }] }] }] },
  /* ---------- Rabenmoor (vorläufige Figuren aus der Waldmark, bis eigene Bildblätter da sind) ---------- */
  bertold: { name: "Bertold Krähe", feld: 240, koerper: 0.867, fuss: 0.988, sonst: { wer: "Bertold Krähe", text: "Geh. Jede Stunde, die du hier stehst, ist eine Stunde, die die Kinder im Moor sind." },
    reden: [{ setzt: "bertold", schluss: "Ich gehe ins Moor",
      zeilen: [{ wer: "Bertold Krähe, der Schulze", text: "Der Junge hat dich also gefunden. Gut. Dann hör zu, ich sage es nur einmal." },
        { wer: "Bertold Krähe", text: "Drei Kinder. Jannik, Fenna und Ilses Kleine, Mira. Sie sind den Lichtern ins Moor gefolgt, eins nach dem anderen, drei Nächte lang." },
        { wer: "Bertold Krähe", text: "Die Leute sagen, die alte Hedda draußen in der Hütte hat sie gerufen. Heute Nacht wollen sie mit Fackeln hin. Ich halte sie nicht mehr lange auf." },
        { wer: "Bertold Krähe", text: "Der Bohlenweg führt vom Steg hinaus ins Schwarzmoor. Dort haben wir Fennas Haarband gefunden." }],
      fragen: [{ knopf: "Glaubst du, dass Hedda es war?", zeilen: [{ wer: "Bertold Krähe", text: "Ich glaube gar nichts. Ich glaube, dass die Leute Angst haben, und dass Angst ein Feuer braucht." }] },
        { knopf: "Was sind das für Lichter?", zeilen: [{ wer: "Bertold Krähe", text: "Sie flackern nicht. Sie summen nicht. Sie stehen einfach über dem Wasser und warten." }, { wer: "Bertold Krähe", text: "Mein Vater hat gesagt, das Moor vergisst nichts. Ich habe ihn nie gefragt, was er damit meinte." }] }] },
      { wenn: ["hedda"], setzt: "bertold_schuld", schluss: "Das wird sich zeigen", fragen: [],
        zeilen: [{ wer: "Bertold Krähe", text: "Du warst bei Hedda. Ich sehe es dir an. Was hat sie dir erzählt?" }, { text: "Du nennst ihm den Namen Alwine. Bertold wird grau im Gesicht." },
          { wer: "Bertold Krähe", text: "Mein Vater war Schulze, als das geschah. Mehr sage ich nicht. Nicht heute Nacht." }] },
      { wenn: ["kampf_schrein", "bertold_schuld"], setzt: "bertold_gestanden", schluss: "Danke, Bertold", fragen: [],
        zeilen: [{ wer: "Bertold Krähe", text: "Die Kinder sind zurück. Dann bin ich dir die Wahrheit schuldig." }, { wer: "Bertold Krähe", text: "Mein Vater hat Alwine den Weg verbieten lassen, damals, als das Wasser stieg. Sie ist allein hinaus. Er hat es gewusst und geschwiegen. Ich sage es morgen vor dem ganzen Dorf." }] }] },
  ilse: { name: "Ilse", feld: 240, koerper: 0.967, fuss: 0.979, sonst: { wer: "Ilse", text: "Bring sie mir wieder. Bitte." },
    reden: [{ wenn: ["bertold"], setzt: "ilse", schluss: "Ich nehme sie mit",
      zeilen: [{ wer: "Ilse, Miras Mutter", text: "Du gehst ins Moor? Dann nimm das hier mit. Miras Pfeife. Sie hat sie nie aus der Hand gelegt, nur in der Nacht, als sie ging." },
        { wer: "Ilse", text: "Wenn du sie findest und sie nicht aufwacht, dann pfeif. Sie kennt den Ton. Sie wird ihn kennen." }],
      fragen: [{ knopf: "Hat Mira etwas gesagt, bevor sie ging?", zeilen: [{ wer: "Ilse", text: "Sie hat gesagt, die Frau im Wasser ist traurig. Ich habe gedacht, sie träumt." }] }] },
      { wenn: ["kampf_schrein"], setzt: "ilse_dank", schluss: "Gern geschehen", fragen: [],
        zeilen: [{ wer: "Ilse", text: "Sie schläft. Richtig schläft sie, nicht wie die Nächte davor. Die Pfeife hält sie in der Faust." }, { wer: "Ilse", text: "Ich habe nichts, was ich dir geben kann. Aber in Rabenmoor wird man deinen Namen kennen, solange es Rabenmoor gibt." }] }] },
  jorin: { name: "Jorin", feld: 240, koerper: 0.967, fuss: 0.979, gross: 0.7, sonst: { wer: "Jorin", text: "Ich bin bis Weidenhain gerannt. Ohne Pause. Fast ohne Pause." },
    reden: [{ wenn: ["bertold"], setzt: "jorin", schluss: "Gut gemacht, Jorin", fragen: [],
      zeilen: [{ wer: "Jorin", text: "Du bist wirklich gekommen! Ich hab's ihnen gesagt. Keiner hat mir geglaubt." }, { wer: "Jorin", text: "Fenna ist meine Schwester. Wenn du sie siehst, sag ihr, ich hab ihr Haarband. Sie soll es sich wiederholen." }] }] },
  joost: { name: "Joost", feld: 240, koerper: 0.958, fuss: 0.975, sonst: { wer: "Joost", text: "Der Kahn liegt bereit. Steig ein, wenn du so weit bist." },
    reden: [{ wenn: ["kampf_bohlenweg"], setzt: "joost", schluss: "Bring mich hin",
      zeilen: [{ wer: "Joost, der Fischer", text: "Du kommst vom Bohlenweg? Dann weißt du jetzt, dass man zu Fuß nicht weit kommt." },
        { wer: "Joost", text: "Ich bring dich mit dem Kahn durch den alten Kanal ins Ried. Weiter als bis zum Ende des Kanals fahre ich nicht. Da drinnen sitzen die Kröten dicht wie Torf." }],
      fragen: [{ knopf: "Was liegt hinter dem Ried?", zeilen: [{ wer: "Joost", text: "Heddas Hütte, auf der letzten trockenen Insel. Und dahinter das tiefe Moor, wo keiner von uns hingeht." }] }] }] },
  hedda: { name: "Mutter Hedda", feld: 240, koerper: 0.967, fuss: 0.975, gross: 0.95, zeigen: "kampf_ried", sonst: { wer: "Mutter Hedda", text: "Geh den Totenpfad. Und sprich mit ihr. Sie hat lange niemanden mehr gehört." },
    reden: [{ setzt: "hedda", schluss: "Ich gehe den Totenpfad",
      zeilen: [{ wer: "Mutter Hedda, die Kräuterfrau", text: "Du kommst durchs Ried, mit Schlamm bis zum Hals. Du bist nicht hier, um mich anzuzünden. Setz dich." },
        { wer: "Mutter Hedda", text: "Die Lichter rufen die Kinder nicht. Sie suchen. Seit fünfzig Jahren suchen sie jemanden, der zurückkommt." },
        { wer: "Mutter Hedda", text: "Meine Schwester hieß Alwine. Sie ist ins Moor gegangen, als das Wasser stieg, und keiner ist ihr nach. Am versunkenen Schrein ist sie geblieben. Jetzt holt sie sich Kinder, weil keiner sie holen kam." },
        { wer: "Mutter Hedda", text: "Hinter meiner Hütte beginnt der Totenpfad. Die dort liegen, sind ihr gefolgt. Sie stehen auf, wenn man über sie geht." }],
      fragen: [{ knopf: "Warum hast du es niemandem gesagt?", zeilen: [{ wer: "Mutter Hedda", text: "Ich habe es gesagt. Fünfzig Jahre lang. Sie haben aufgehört zuzuhören, und dann haben sie angefangen, mich die Hexe zu nennen." }] },
        { knopf: "Kann man Alwine retten?", zeilen: [{ wer: "Mutter Hedda", text: "Retten nicht. Aber man kann sie ruhen lassen. Sag ihr ihren Namen, wenn du vor ihr stehst. Den hat sie lange nicht gehört." }] }] }] },
  harm: { name: "Harm", feld: 240, koerper: 0.967, fuss: 0.979, sonst: { wer: "Harm", text: "Ich weiß nicht, was ich glauben soll. Aber ich weiß, dass ich heute Nacht niemanden anzünde." },
    reden: [{ wenn: ["bertold"], setzt: "harm", schluss: "Wartet, bis ich zurück bin",
      zeilen: [{ wer: "Harm, der Schmied", text: "Du bist der Fremde aus Weidenhain? Dann geh uns aus dem Weg." },
        { wer: "Harm", text: "Drei Nächte. Drei Kinder. Und jede Nacht brennt bei der Alten im Moor Licht. Wir gehen hin, sobald es dunkel ist, und dann brennt etwas anderes." }],
      fragen: [{ knopf: "Habt ihr Beweise?", zeilen: [{ wer: "Harm", text: "Beweise? Meine Frau hat sie Kräuter ins Wasser streuen sehen. Mehr braucht keiner." }] },
        { knopf: "Und wenn ihr euch irrt?", zeilen: [{ wer: "Harm", text: "Dann irren wir uns. Und die Kinder sind trotzdem weg." }, { text: "Hinter ihm brummt jemand zustimmend. Die Fackeln sind noch nicht angezündet. Noch nicht." }] }] },
      { wenn: ["harm", "hedda"], setzt: "harm_ruhig", schluss: "Geht nach Hause",
        zeilen: [{ wer: "Harm", text: "Du warst bei ihr. Und du lebst noch. Also?" },
          { text: "Du erzählst ihm von Alwine, der Schwester, die ins Moor ging, als das Wasser stieg. Und dass keiner aus dem Dorf ihr nachgegangen ist." },
          { wer: "Harm", text: "Alwine … Meine Großmutter hat den Namen manchmal gesagt. Leise. So, als dürfte man ihn nicht sagen." },
          { text: "Harm sieht auf die Fackel in seiner Hand. Dann dreht er sich zu den anderen um." },
          { wer: "Harm", text: "Geht heim. Alle. Heute brennt hier nichts." }], fragen: [] }] },
  /* ---------- Weidenhain ---------- */
  /* gross: Anteil an der Größe eines Erwachsenen (Tebbe sitzt); zeigen: erst da, wenn dieser Merker gesetzt ist */
  tebbe: { name: "Tebbe", feld: 240, koerper: 0.805, fuss: 0.957, gross: 0.52, zeigen: "tebbe_gefunden", sonst: { wer: "Tebbe", text: "Die Katze heißt Mehl. Sie hat mich gefunden, nicht ich sie." },
    reden: [{ setzt: "tebbe_rede", schluss: "Ruh dich aus", zeilen: [{ wer: "Tebbe", text: "Die Große am Wehr hat mich gar nicht angesehen. Sie hat nur nach oben geschaut, zu den Lichtern. Ich glaube, sie hat Angst." }],
      fragen: [{ knopf: "Was macht dein Bein?", zeilen: [{ wer: "Tebbe", text: "Tut weh. Aber Lene sagt, ich darf beim Fest aufbleiben. Also ist es nicht so schlimm." }] }] }] },
  hanne: { name: "Hanne Kalk", feld: 240, koerper: 0.871, fuss: 0.984, sonst: { wer: "Hanne Kalk", text: "Der Speicher ist gleich da oben, das große Tor. Beeil dich." },
    reden: [{ setzt: "hanne", schluss: "Ich sehe mir den Speicher an",
      zeilen: [{ wer: "Hanne Kalk, Bürgermeisterin", text: "Du da. Du siehst aus, als könntest du kämpfen. Kannst du?" }, { wer: "Hanne Kalk", text: "Im Kornspeicher sitzen Kröten. So groß wie Hunde. Sie fressen uns das Korn weg, mitten im Erntefest." },
        { wer: "Hanne Kalk", text: "Frag Lene am Tor, die hat sie gesehen. Und Agnes drüben am Baum kennt den Mühlgraben besser als wir alle." }],
      fragen: [
        { knopf: "Woher kommen die Kröten?", zeilen: [{ wer: "Hanne Kalk", text: "Aus dem Mühlgraben. Seit drei Tagen. Wenn das Korn weg ist, wird der Winter lang." }, { wer: "Hanne Kalk", text: "Früher haben sie das nie getan. Früher hatten sie Angst vor uns." }] },
        { knopf: "Was springt für mich dabei heraus?", zeilen: [{ wer: "Hanne Kalk", text: "Ein Krug Bier, ein Bett und der Dank von Weidenhain. Mehr haben wir nicht. Aber das bekommst du ganz." }] },
      ] },
      { wenn: ["kampf_speicher"], setzt: "hanne2", schluss: "Ich finde heraus, woher", fragen: [], zeilen: [{ wer: "Hanne Kalk", text: "Das war gut. Aber sie kommen wieder, solange wir nicht wissen, woher." }] }] },
  lene: { name: "Lene", feld: 240, koerper: 0.845, fuss: 0.967, sonst: { wer: "Lene", text: "Bleib nicht stehen, wenn eine Luft holt." },
    reden: [{ wenn: ["hanne"], setzt: "lene", schluss: "Danke, Lene",
      zeilen: [{ wer: "Lene, die Magd", text: "Ich wollte nur Mehl holen. Sie saßen zwischen den Säcken, und die Augen haben geglänzt." }, { wer: "Lene", text: "Die Zunge reicht weiter, als man denkt. Bleib nicht stehen, wenn eine Luft holt." }],
      fragen: [{ knopf: "Wie viele sind es?", zeilen: [{ wer: "Lene", text: "Ich habe sechs gezählt. Dann bin ich gerannt." }] }] },
      { wenn: ["kampf_speicher"], setzt: "tebbe", schluss: "Ich hole ihn", fragen: [],
        zeilen: [{ wer: "Lene", text: "Mein Bruder. Tebbe. Er ist zwölf. Er ist zur Mühle gelaufen, wegen der Katze, und ich habe vor lauter Angst nicht daran gedacht!" }, { wer: "Lene", text: "Die Mühle steht drüben am Graben, das Haus mit dem Rad. Bitte." }] }] },
  mette: { name: "Mette", feld: 240, koerper: 0.858, fuss: 0.979, sonst: { wer: "Mette", text: "Riechst du das? Thymian. Der wächst nur dort, wo das Wasser sauber ist." },
    reden: [{ wenn: ["hanne"], setzt: "ufer_auftrag", schluss: "Ich sehe mir das an",
      zeilen: [{ wer: "Mette, die Kräuterfrau", text: "Du bist die Hilfe, die Hanne geholt hat? Dann hör mir kurz zu, bevor du in den Speicher gehst." },
        { wer: "Mette", text: "Ich sammle meine Kräuter am Mühlteich, drüben hinter dem Wehr. Seit drei Nächten tanzen dort Lichter über dem Wasser. Gestern sind mir zwei gefolgt, bis an den Zaun." },
        { wer: "Mette", text: "Folg dem Weg am anderen Ufer nach unten. Und schlag schnell zu: Die Dinger huschen davon, wenn man sie fast hat." }],
      fragen: [{ knopf: "Was sind Irrlichter?", zeilen: [{ wer: "Mette", text: "Die Alten sagen, sie locken Leute ins Moor, bis sie nicht mehr zurückfinden. In Rabenmoor erzählt man sich, sie seien die Seelen von Ertrunkenen." }, { wer: "Mette", text: "Ich glaube, sie sind einfach hungrig. Und unsere Felder sind voller Leben." }] }] },
      { wenn: ["kampf_ufer"], setzt: "mette_dank", schluss: "Gern geschehen", fragen: [],
        zeilen: [{ wer: "Mette", text: "Das Ufer ist wieder dunkel. Endlich. Morgen früh gehe ich Thymian holen, und für dich lege ich ein Bündel beiseite." }] }] },
  agnes: { name: "Agnes", feld: 240, koerper: 0.877, fuss: 0.984, sonst: { wer: "Agnes", text: "Gib auf dich acht da drinnen." },
    reden: [{ wenn: ["hanne"], setzt: "agnes", schluss: "Ich halte die Augen offen",
      zeilen: [{ wer: "Agnes, Witwe des Müllers", text: "Mein Mann hat die Mühle dreißig Jahre geführt. Seit er tot ist, steht sie leer, und am Graben kümmert sich niemand mehr." }, { wer: "Agnes", text: "Die Kröten kommen von dort. Vom Wehr herauf, immer nachts." }],
      fragen: [{ knopf: "Was ist am Wehr?", zeilen: [{ wer: "Agnes", text: "Eine sitzt dort, größer als alle anderen. Die Leute nennen sie die alte Unke. Sie war immer da. Aber früher blieb sie, wo sie war." }] },
        { knopf: "Wie hält man sie auf?", zeilen: [{ wer: "Agnes", text: "Am Mühlhaus ist eine Schleuse. Steht sie offen, kriechen sie aus dem Graben nach, eine nach der anderen." }, { wer: "Agnes", text: "Mein Mann hat sie jeden Abend zugemacht. Seit er tot ist, macht das keiner mehr. Den Hebel musst du ein paar Atemzüge halten, er klemmt." }] }] },
      { wenn: ["agnes"], setzt: "nest_auftrag", schluss: "Ich sehe nach", fragen: [],
        zeilen: [{ wer: "Agnes", text: "Noch etwas. Hinter der Scheune, unter dem alten Baum, steht ein Tümpel. Dort liegt Laich, so viel, wie ich es nie gesehen habe." }, { wer: "Agnes", text: "Wenn das alles schlüpft, haben wir nächstes Jahr keinen Speicher mehr, sondern einen Krötenteich. Der Weg geht links an der Scheune vorbei." }] },
      { wenn: ["kampf_nest"], setzt: "nest_dank", schluss: "Gern geschehen", fragen: [],
        zeilen: [{ wer: "Agnes", text: "Du warst am Tümpel? Dann schlafe ich heute ruhiger. Mein Mann hätte dir dafür ein Brot gebacken. Ich kann nur danke sagen." }] }] },
};
/* Wohin der Pfeil am Boden zeigt: die erste Zeile, deren Bedingung passt. Stehen Leute mit offenem Gespräch da, zeigt er zuerst zu ihnen (zum nächsten). */
const WEGWEISER: Record<string, { wenn: string[]; stelle: string }[]> = { weidenhain: [{ wenn: ["tebbe_gefunden"], stelle: "wehr" }, { wenn: ["tebbe"], stelle: "muehle" }, { wenn: ["hanne"], stelle: "scheune" }],
  rabenmoor: [{ wenn: ["kampf_totenpfad"], stelle: "schrein" }, { wenn: ["hedda"], stelle: "pfad" }, { wenn: ["joost"], stelle: "kahn" }, { wenn: ["bertold"], stelle: "steg" }] };
/* Türen: Stelle im Ort, Bedingung, und der Kampf, der dahinter wartet. Ist er gewonnen (Merker kampf_<karte>), ist die Tür erledigt. */
const TUEREN: Record<string, { wenn: string[]; knopf: string; kampf: string }> = {
  scheune: { wenn: ["hanne"], knopf: "Den Kornspeicher betreten", kampf: "speicher" },
  muehle: { wenn: ["tebbe"], knopf: "Zur Mühle am Graben", kampf: "muehle" },
  wehr: { wenn: ["tebbe_gefunden"], knopf: "Zum Wehr hinunter", kampf: "wehr" },
  nest: { wenn: ["nest_auftrag"], knopf: "Hinter die Scheune (Krötennest)", kampf: "nest" },
  ufer: { wenn: ["ufer_auftrag"], knopf: "Zum Mühlteich (Irrlichter)", kampf: "ufer" },
  steg: { wenn: ["bertold"], knopf: "Über den Bohlenweg ins Moor", kampf: "bohlenweg" },
  kahn: { wenn: ["joost"], knopf: "Mit Joosts Kahn ins Ried", kampf: "ried" },
  pfad: { wenn: ["hedda"], knopf: "Den Totenpfad gehen", kampf: "totenpfad" },
  schrein: { wenn: ["kampf_totenpfad"], knopf: "Zum versunkenen Schrein", kampf: "schrein" },
};
/* Was beim Ankommen im Ort erzählt wird: der erste Auftritt, dessen Bedingung passt und der noch nicht erzählt ist. ende: Damit ist die Kampagne geschafft. */
const AUFTRITTE: Record<string, { wenn: string[]; setzt: string; titel: string; zeilen: Zeile[]; schluss: string; ende?: number }[]> = { weidenhain: [
  { wenn: [], setzt: "ankunft", titel: "Weidenhain", schluss: "Weiter", zeilen: [{ text: "Es ist Erntefest in Weidenhain. Auf dem Dorfplatz brennt ein Feuer, es riecht nach Brot und Bier, und jemand spielt schief auf einer Fiedel." }, { text: "Dann ein Schrei vom Kornspeicher. Die Musik bricht ab." }] },
  { wenn: ["kampf_speicher"], setzt: "speicher_nach", titel: "Vor dem Kornspeicher", schluss: "Weiter", zeilen: [{ text: "Die letzte Kröte hüpft durch ein Loch in der Rückwand davon. Dahinter rauscht der Mühlgraben." }, { text: "Auf dem Platz ist es still geworden. Hanne zählt die Säcke, und Lene sucht dich mit den Augen." }] },
  { wenn: ["kampf_muehle"], setzt: "tebbe_gefunden", titel: "An der alten Mühle", schluss: "Zum Wehr", zeilen: [{ text: "Du verbindest Tebbes Bein und bringst ihn zu seiner Schwester. Lene sagt nichts; sie hält ihn nur fest." }, { text: "Das Wehr liegt gleich hinter der Mühle. Dort sitzt, was die Kröten ins Dorf treibt." }] },
  { wenn: ["kampf_wehr"], setzt: "unke_nach", titel: "Das Erntefest von Weidenhain", schluss: "Weiter", zeilen: [{ text: "Das letzte Irrlicht zerstiebt über dem Wasser. Die alte Unke liegt halb auf den Steinen, zu erschöpft, um die Zunge noch einmal zu heben." },
    { text: "Ohne die Lichter über ihr ist nichts mehr an ihr, das angreift. Du trittst zurück. Sie gleitet ins Wasser und führt ihr Volk den Graben hinab, weg vom Dorf." }, { wer: "Hanne Kalk", text: "Setz dich. Iss. Heute Nacht zahlt in Weidenhain niemand, der Kröten aus meinem Speicher gejagt hat." },
    { text: "Die Fiedel spielt wieder. Da hörst du vom Ortseingang her jemanden rennen." }] },
],
  rabenmoor: [
    { wenn: [], setzt: "ankunft", titel: "Rabenmoor", schluss: "Weiter", zeilen: [{ text: "Rabenmoor liegt auf einer Sandinsel mitten im Schwarzmoor. Die Sonne geht unter, und über dem Wasser stehen schon die ersten Lichter, still wie Sterne, die zu tief hängen." },
      { text: "Auf dem Platz am Brunnen stehen Leute mit Fackeln, die noch nicht brennen. Jorin, der Junge, der dich geholt hat, zieht dich am Ärmel zum Schulzen." }] },
    { wenn: ["kampf_bohlenweg"], setzt: "bohlen_nach", titel: "Am Ende des Bohlenwegs", schluss: "Weiter", zeilen: [{ text: "Hinter der letzten Insel bricht der Bohlenweg ab. Weiter geht es nur übers Wasser." }, { text: "Auf dem Rückweg winkt dir am Anleger ein Fischer mit Netz über der Schulter. Neben ihm liegt ein Kahn." }] },
    { wenn: ["kampf_ried"], setzt: "ried_nach", titel: "Am Ende des Kanals", schluss: "Weiter", zeilen: [{ text: "Joost rudert dich zurück, so schnell er kann. Am Rand des Rieds hast du Licht gesehen, warmes Licht: Heddas Hütte auf der letzten trockenen Insel." }, { text: "Vom Dorf aus führt ein Pfad hinauf zu ihr." }] },
    { wenn: ["kampf_schrein"], setzt: "ende", titel: "Der Name im Wasser", schluss: "Zurück in die Waldmark", ende: 2, zeilen: [{ text: "Du sagst ihren Namen. Alwine. Die Stumme hält inne, und zum ersten Mal seit fünfzig Jahren hat sie ein Gesicht." },
      { text: "Die Lichter über dem Moor gehen aus, eins nach dem anderen. Zwischen den Spiralsteinen liegen drei Kinder im Moos und schlafen." },
      { text: "Du trägst sie zurück nach Rabenmoor. Die Fackeln auf dem Platz brennen jetzt doch, aber niemand geht damit ins Moor. Sie leuchten euch den Weg." },
      { wer: "Mutter Hedda", text: "Sie hat ihren Namen gehört. Mehr wollte sie nie." },
      { text: "In der Nacht, als alle schlafen, hörst du zum ersten Mal die Glocke. Tief und langsam, von Norden her, wo hinter dem Fluss Graufurt liegt." }] },
] };
/* Die Runde Dorfleute (werkzeug/blatt.py, Feld 300): wo die fünf Köpfe im Feld sitzen, und was sie so reden – belangloses Festgeplauder. */
const KOEPFE = [[0.16, 0.23], [0.47, 0.15], [0.8, 0.17], [0.35, 0.43], [0.67, 0.41]];
const GEREDE = ["Das Bier ist dieses Jahr dünner.", "Hast du Almas Kuchen probiert?", "Morgen soll es regnen.", "Mein Rücken, sag ich dir …", "Die Fiedel ist verstimmt.", "Früher war mehr Erntefest.", "Noch ein Krug?", "Das sagst du jedes Jahr.", "Ich hab's doch gleich gesagt.", "Und dann ist das Rad gebrochen!",
  "Pst, nicht so laut.", "Na, wenn du meinst.", "Der Winter kommt früh, wetten?", "Mein Vetter aus Graufurt sagt …", "Ha! Das glaubst du doch selbst nicht.", "Hm.", "Die Rüben waren nie so groß.", "Wer tanzt nachher?", "So ein Unsinn.", "Wem gehört eigentlich der Karren?", "Drei Kupfer für ein Brot!", "Erzähl das bloß nicht weiter."];
/* Eine aufgebrachte Meute: steht im Ort, bis der Merker „weg“ gesetzt ist (x, y in Bildpunkten der Vorlage, wie in ortbild.py) */
const MEUTE: Record<string, { x: number; y: number; weg: string }> = { rabenmoor: { x: 625, y: 660, weg: "harm_ruhig" } };
const SCHREIE = ["Verbrennt die Hexe!", "Drei Kinder!", "Heute Nacht noch!", "Sie hat sie gerufen!", "Holt mehr Pech!", "Wer hält zu der Alten?", "Ins Moor mit ihr!", "Wie lange noch warten?"];
/* Unterzeile im Ortsbanner */
const UNTER: Record<string, string> = { weidenhain: "Das Dorf am Mühlgraben", rabenmoor: "Das Dorf im Schwarzmoor", baukasten: "Probefläche" };
const TEMPO = 190, GROSS = (ORTE[ortName] && ORTE[ortName].gross) || 112, Q = 0.62; // Bildpunkte je Sekunde, Größe des Helden, nach oben und unten läuft man langsamer (der Boden liegt schräg)

export class Ort extends Phaser.Scene {
  d = ORTE[ortName]; held = "schildwaechter"; ort = { x: 0, y: 0 }; rx = 0; ry = 0; figur!: Phaser.GameObjects.Sprite; ring!: Phaser.GameObjects.Ellipse; laeuft = false; tasten: Record<string, boolean> = {};
  stick: { id: number; x: number; y: number; t: number; weit: number } | null = null; pfad: number[][] = []; marke!: Phaser.GameObjects.Ellipse;
  constructor() { super("ort"); }
  zu = new Set<number>(); /* Felder, die ein Zaun versperrt */
  feld(x: number, y: number) { return Math.floor(x / this.d.zelle) + 4096 * Math.floor(y / this.d.zelle); }
  frei(x: number, y: number) { const D = this.d, z = D.zeilen[Math.floor(y / D.zelle)]; return Boolean(z) && z[Math.floor(x / D.zelle)] === "." && !this.zu.has(this.feld(x, y)); }
  /** Zäune aufstellen: Stück für Stück vom Anfang aus; jedes Stück verdeckt, was dahinter steht, und versperrt den Weg. */
  zaeune() { const k = ZAUN.breit / 918;
    for (const [x0, y0, folge] of this.d.zaeune as [number, number, string][]) { let x = x0, y = y0;
      for (const c of folge) { const hoch = c === "h", x1 = x + ZAUN.dx, y1 = y + (hoch ? -ZAUN.dy : ZAUN.dy);
        if (hoch) this.add.image(x, y, "zaun").setOrigin(ZAUN.fx, ZAUN.fy).setScale(k).setDepth((y + y1) / 2); else this.add.image(x1, y1, "zaun").setOrigin(1 - ZAUN.fx, ZAUN.fy).setScale(k).setFlipX(true).setDepth((y + y1) / 2);
        for (let t = 0; t <= 1.001; t += 0.04) { const px = x + (x1 - x) * t, py = y + (y1 - y) * t; this.zu.add(this.feld(px, py)); this.zu.add(this.feld(px, py - 12)); }
        x = x1; y = y1; } } }
  init() { const t = team(); let h = t ? t.held : ""; try { h = h || localStorage.getItem("ez_held") || ""; } catch { /* privat */ } this.held = HELDEN[h] ? h : "schildwaechter"; let s = this.d.stellen.start; try { if (P.get("eingang") === "1") { localStorage.removeItem("ez_ort_" + ortName + "_pos"); P.delete("eingang"); history.replaceState(null, "", "?" + P.toString()); } /* von der Weltkarte kommend steht man am Ortseingang; der Fortschritt bleibt */
      if (P.get("neu") === "1") { localStorage.removeItem("ez_ort_" + ortName); localStorage.removeItem("ez_ort_" + ortName + "_pos"); P.delete("neu"); history.replaceState(null, "", "?" + P.toString()); /* sonst begänne nach jedem Neuladen alles von vorn */ } const p = JSON.parse(localStorage.getItem("ez_ort_" + ortName + "_pos") || "null"); if (Array.isArray(p) && this.frei(p[0], p[1])) s = p; } catch { /* privat */ } this.ort = { x: s[0], y: s[1] }; }
  preload() { this.load.image("ortboden", `../img/echtzeit/${this.d.bild || ortName + "-boden"}.webp`); this.load.image("zaun", "../img/echtzeit/zaun.webp"); for (const l of this.d.leute || []) { const L = LEUTE[String(l[0])]; if (L && L.lauf) this.load.spritesheet("lauf-" + l[0], `../img/echtzeit/${L.lauf.blatt}.webp`, { frameWidth: L.feld, frameHeight: L.feld }); if (L) this.load.spritesheet("leute-" + l[0], `../img/echtzeit/${L.blatt || l[0]}.webp`, { frameWidth: L.feld, frameHeight: L.feld }); }
    if (MEUTE[ortName]) this.load.spritesheet("meute", "../img/echtzeit/meute.webp", { frameWidth: 300, frameHeight: 300 });
    if (this.d.gruppen && this.d.gruppen.length) this.load.spritesheet("dorfgruppe", "../img/echtzeit/dorfgruppe.webp", { frameWidth: 300, frameHeight: 300 }); const D = HELDEN[this.held]; if (D.figur) this.load.image("figur-" + this.held, "../" + D.figur); if (D.lauf) this.load.spritesheet("lauf-" + this.held, "../" + D.lauf, { frameWidth: 176, frameHeight: 176 }); this.load.image(this.held, "../" + D.bild); }
  create() {
    const D0 = this.d; document.body.classList.add("dorf"); $("#ez-dorf-titel").textContent = D0.name; $("#ez-dorf-hilfe").textContent = HANDY ? "Finger ziehen: laufen · tippen: dorthin gehen" : "WASD oder Pfeiltasten: laufen · Klick: dorthin gehen";
    const F = D0.mass || 1; this.add.image(0, 0, "ortboden").setOrigin(0, 0).setDisplaySize(D0.breit, D0.hoch).setDepth(-10); this.vorn(F); this.feuer(); this.cameras.main.setBounds(0, 0, D0.breit, D0.hoch).setBackgroundColor("#0a0d08");
    this.zaeune(); this.gruppen(); this.meute(); this.leute(); this.auftritt(); if (!new URLSearchParams(location.search).has("server")) wecken(); /* der nächste Kampf braucht den Server – schon jetzt aufwecken */
    $("#ez-dorf-knopf").onclick = () => this.sprechen(); window.addEventListener("keydown", (ev) => { if ((ev.key === "e" || ev.key === "E") && !ev.repeat) this.sprechen(); });
    this.marke = this.add.ellipse(0, 0, 34, 17).setStrokeStyle(2, 0xffe9a8, 0.9).setDepth(-1).setVisible(false);
    const D = HELDEN[this.held]; this.ring = this.add.ellipse(0, 0, 58, 29).setStrokeStyle(3, 0xffffff, 0.95);
    if (D.figur) { const fu = D.fuss || [0.5, 0.94]; this.figur = this.add.sprite(0, 0, "figur-" + this.held).setOrigin(fu[0], fu[1]); this.figur.setScale(GROSS * (D.gross || 1) / this.figur.height); if (D.lauf && !this.anims.exists("lauf-" + this.held)) this.anims.create({ key: "lauf-" + this.held, frames: this.anims.generateFrameNumbers("lauf-" + this.held, {}), frameRate: 11, repeat: -1 }); }
    else { this.figur = this.add.sprite(0, 0, this.held).setOrigin(0.5, 1); this.figur.setScale(60 / this.figur.height); }
    const taste = (ev: KeyboardEvent, an: boolean) => { const k = ev.key.toLowerCase(); if (this.gesperrt && an) return; if (!["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) return; ev.preventDefault(); this.tasten[k] = an; const t = this.tasten; this.rx = (t.d || t.arrowright ? 1 : 0) - (t.a || t.arrowleft ? 1 : 0); this.ry = (t.s || t.arrowdown ? 1 : 0) - (t.w || t.arrowup ? 1 : 0); };
    window.addEventListener("keydown", (ev) => { if (!ev.repeat) taste(ev, true); }); window.addEventListener("keyup", (ev) => taste(ev, false)); window.addEventListener("blur", () => { this.tasten = {}; this.rx = 0; this.ry = 0; });
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => { if (this.stick) return; this.stick = { id: p.id, x: p.x, y: p.y, t: performance.now(), weit: 0 }; if (p.wasTouch) { const el = $("#ez-stick"); el.hidden = false; el.style.left = p.x + "px"; el.style.top = p.y + "px"; ($("#ez-stick i") as HTMLElement).style.transform = "translate(-50%, -50%)"; } });
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => { const st = this.stick; if (!st || p.id !== st.id || !p.isDown) return; const dx = p.x - st.x, dy = p.y - st.y, l = Math.hypot(dx, dy), m = 46; st.weit = Math.max(st.weit, l); if (!p.wasTouch) return; /* mit der Maus wird nur geklickt */
      ($("#ez-stick i") as HTMLElement).style.transform = `translate(calc(-50% + ${dx / Math.max(l, 1) * Math.min(l, m)}px), calc(-50% + ${dy / Math.max(l, 1) * Math.min(l, m)}px))`; if (l < 8) { this.rx = 0; this.ry = 0; } else { const k = Math.min(1, l / m); this.rx = dx / l * k; this.ry = dy / l * k; } });
    this.input.on("pointerup", (p: Phaser.Input.Pointer) => { const st = this.stick; if (!st || p.id !== st.id) return; if (st.weit < 12 && performance.now() - st.t < 450) { const w = this.cameras.main.getWorldPoint(p.x, p.y); this.gehe(w.x, w.y); } this.stick = null; $("#ez-stick").hidden = true; if (p.wasTouch) { this.rx = 0; this.ry = 0; } });
    this.groesse(); zoomKnopf(() => this.groesse()); this.scale.on("resize", () => this.groesse()); this.cameras.main.centerOn(this.ort.x, this.ort.y);
    { /* Oben links das Profil, oben rechts die Minikarte – wie in der Waldmark */ document.body.classList.add("stadt"); hudProfil(this.held); hudTitel(D0.name, UNTER[ortName] || ""); hudKarte();
      { const t = team(); hudTeam(t ? [t.held, ...t.mit] : [this.held], () => this.halle()); }
      hudMenue([{ name: "Helden", zeichen: "helden", tat: () => this.halle() }, { name: "Menü", zeichen: "menue", tat: () => { if (this.gesperrt) return; this.gesperrt = true; this.halt(); menueTafel(() => { this.gesperrt = false; hudProfil(this.held); }); } }]);
      const k = $("#ez-karte"); k.style.backgroundImage = `url(../img/echtzeit/${D0.bild || ortName + "-boden"}.webp)`; k.style.aspectRatio = `${D0.breit} / ${D0.hoch}`; (k.querySelector("span") as HTMLElement).textContent = D0.name; $("#ez-dorf-titel").style.display = "none"; this.sicht(); }
    (window as unknown as Record<string, unknown>).EZO = { szene: this, ort: () => this.ort, frei: (x: number, y: number) => this.frei(x, y) };
  }
  groesse() { const k = this.cameras.main, w = this.scale.width, h = this.scale.height, D = this.d; k.setZoom(Math.max(w / D.breit, h / D.hoch, Phaser.Math.Clamp(HANDY ? Math.min(h / 520, w / 720) : Math.min(h / 760, w / 1000), 0.45, 2.2) * zoomFaktor())); }
  nah = ""; gesperrt = false; personen: { id: string; x: number; y: number; ruf: Phaser.GameObjects.Text; teile: (Phaser.GameObjects.Sprite | Phaser.GameObjects.Text)[]; rennt?: boolean }[] = []; merker: Record<string, boolean> = {}; pfeil!: Phaser.GameObjects.Graphics;
  /** Das nächste offene Gespräch einer Person (oder keins) */
  da(id: string) { const z = LEUTE[id].zeigen; return !z || Boolean(this.merker[z]); }
  offen(id: string): Rede | null { if (!this.da(id)) return null; for (const g of LEUTE[id].reden) if (!this.merker[g.setzt] && (g.wenn || []).every((m) => this.merker[m])) return g; return null; }
  merke(m: string) { this.merker[m] = true; try { localStorage.setItem("ez_ort_" + ortName, JSON.stringify(this.merker)); } catch { /* privat */ } this.sicht(); }
  halt() { this.rx = 0; this.ry = 0; this.tasten = {}; this.pfad = []; if (this.marke) this.marke.setVisible(false); }
  /** Die Heldenhalle über den Knopf unten rechts */
  halle() { if (this.gesperrt) return; this.gesperrt = true; this.halt(); heldenhalle(() => { this.gesperrt = false; hudProfil(this.held); const t = team(); hudTeam(t ? [t.held, ...t.mit] : [this.held], () => this.halle()); }); }
  sicht() { const k = $("#ez-karte"), D = this.d; for (const el of Array.from(k.querySelectorAll("u"))) el.remove(); /* Minikarte: gelb, wer etwas zu sagen hat; blau die Tür, zu der es geht */
    const punkt = (x: number, y: number, neben: boolean) => { const u = document.createElement("u"); u.style.left = (100 * x / D.breit) + "%"; u.style.top = (100 * y / D.hoch) + "%"; if (neben) u.className = "neben"; k.appendChild(u); };
    /* gelb: Hauptquest, hellblauer Kreis: Nebenquest */
    for (const q of this.personen) { const g = this.offen(q.id); if (g) punkt(q.x, q.y, !istHaupt(ortName, g.setzt)); }
    for (const t in TUEREN) { const T = TUEREN[t], s = this.d.stellen[t]; if (s && !istHaupt(ortName, "kampf_" + T.kampf) && !this.merker["kampf_" + T.kampf] && T.wenn.every((m) => this.merker[m])) punkt(s[0], s[1], true); }
    if (!this.personen.some((q) => { const g = this.offen(q.id); return g && istHaupt(ortName, g.setzt); })) { const z = this.ziel(); if (z) punkt(z[0], z[1], false); }
    if (this.meuteBild && MEUTE[ortName] && this.merker[MEUTE[ortName].weg]) { const m = this.meuteBild; this.meuteBild = null; this.tweens.add({ targets: m, alpha: 0, y: m.y + 40, duration: 1800, onComplete: () => m.destroy() }); }
    for (const q of this.personen) if (LEUTE[q.id].lauf && this.da(q.id) && !this.merker[q.id + "_da"] && !q.rennt) this.anrennen(q);
    for (const q of this.personen) { const g = this.offen(q.id); q.ruf.setVisible(Boolean(g) && !q.rennt); if (g) q.ruf.setColor(istHaupt(ortName, g.setzt) ? "#ffd23a" : "#7fd4ff").setStroke(istHaupt(ortName, g.setzt) ? "#3a2400" : "#0b2a44", 7); for (const t of q.teile) t.setVisible(this.da(q.id)); }
    hudQuest(ortName, this.merker); /* die Schritte der Quest oben links */ }
  /** Jemand kommt angerannt: vom Ortseingang (außerhalb des Bildes) bis an seinen Platz, dann bleibt er stehen und hat etwas zu sagen. */
  anrennen(q: Ort["personen"][number]) {
    const L = LEUTE[q.id], R = L.lauf!, v = this.d.stellen[R.von]; if (!v) return; q.rennt = true; const sp = q.teile[0] as Phaser.GameObjects.Sprite, nm = q.teile[1], hh = GROSS * 0.92 * (L.gross || 1);
    const x0 = v[0] - 220, y0 = v[1] + 160, weit = Math.hypot(q.x - x0, q.y - y0);
    if (!this.anims.exists("lauf-" + q.id)) this.anims.create({ key: "lauf-" + q.id, frames: this.anims.generateFrameNumbers("lauf-" + q.id, {}), frameRate: 14, repeat: -1 });
    sp.setTexture("lauf-" + q.id).setOrigin(0.5, R.fuss).setScale(hh / (R.koerper * L.feld)).setFlipX(q.x < x0).play("lauf-" + q.id); const dy = nm.y - q.y;
    sp.setPosition(x0, y0 + 3); nm.setPosition(x0, y0 + dy); q.ruf.setVisible(false);
    this.tweens.add({ targets: sp, x: q.x, y: q.y + 3, duration: weit / 0.3, onUpdate: () => { sp.setDepth(sp.y); nm.setPosition(sp.x, sp.y - 3 + dy); }, onComplete: () => {
      sp.stop(); sp.setTexture("leute-" + q.id).setOrigin(0.5, L.fuss).setScale(hh / (L.koerper * L.feld)).setFlipX(false).play("leute-" + q.id); nm.setPosition(q.x, q.y + dy); q.rennt = false; this.merke(q.id + "_da"); } });
  }
  /** Leute zum Ansprechen aufstellen: Sie stehen und regen sich leicht; über ihnen steht ihr Name – und ein Ausrufezeichen, wenn sie etwas zu sagen haben. */
  leute() { try { if (P.get("neu") === "1") localStorage.removeItem("ez_ort_" + ortName); this.merker = JSON.parse(localStorage.getItem("ez_ort_" + ortName) || "{}") || {}; } catch { this.merker = {}; }
    for (const l of this.d.leute || []) { const id = String(l[0]), x = Number(l[1]), y = Number(l[2]), L = LEUTE[id]; if (!L) continue;
      if (!this.anims.exists("leute-" + id)) this.anims.create({ key: "leute-" + id, frames: this.anims.generateFrameNumbers("leute-" + id, {}), frameRate: 2.5, repeat: -1, yoyo: true });
      const hh = GROSS * 0.92 * (L.gross || 1), m = hh / (L.koerper * L.feld); /* 0.92: am Körper des Helden nachgemessen */ const sp = this.add.sprite(x, y + 3, "leute-" + id).setOrigin(0.5, L.fuss).setScale(m).setDepth(y); if (L.still) sp.setFrame(0); else sp.play({ key: "leute-" + id, startFrame: Math.floor(Math.random() * 9) });
      const nm = this.add.text(x, y - hh - 18, L.name, { fontFamily: "Cinzel, Georgia, serif", fontSize: "14px", color: "#ffe9a8", stroke: "#000", strokeThickness: 4 }).setOrigin(0.5, 1).setResolution(2).setDepth(99980);
      const ruf = this.add.text(x, y - hh - 38, "!", { fontFamily: "Cinzel, Georgia, serif", fontSize: "44px", fontStyle: "bold", color: "#ffd23a", stroke: "#3a2400", strokeThickness: 7 }).setOrigin(0.5, 1).setResolution(2).setDepth(99981);
      this.tweens.add({ targets: ruf, y: ruf.y - 9, duration: 650, yoyo: true, repeat: -1, ease: "Sine.easeInOut" }); this.personen.push({ id, x, y, ruf, teile: [sp, nm] }); }
    this.sicht();
    this.pfeil = this.add.graphics().setDepth(-2); this.pfeil.fillStyle(0xffd23a, 0.95).lineStyle(3, 0x3a2400, 0.9); this.pfeil.beginPath(); this.pfeil.moveTo(26, 0); this.pfeil.lineTo(-6, -17); this.pfeil.lineTo(2, 0); this.pfeil.lineTo(-6, 17); this.pfeil.closePath(); this.pfeil.fillPath().strokePath(); this.tweens.add({ targets: this.pfeil, alpha: 0.7, duration: 600, yoyo: true, repeat: -1 }); }
  /** Wohin es als Nächstes geht: zur nächsten Person mit Ausrufezeichen, sonst zur Stelle aus dem Wegweiser. */
  ziel(): number[] | null { let best: number[] | null = null, bd = 1e9; for (const q of this.personen) { const g = this.offen(q.id); if (!g || !istHaupt(ortName, g.setzt)) continue; /* der Pfeil führt nur zur Hauptquest */ const a = Math.hypot(q.x - this.ort.x, (q.y - this.ort.y) / Q); if (a < bd) { bd = a; best = [q.x, q.y]; } } if (best) return best;
    for (const w of WEGWEISER[ortName] || []) if (w.wenn.every((m) => this.merker[m]) && this.d.stellen[w.stelle]) return this.merker["kampf_" + (TUEREN[w.stelle] || { kampf: "" }).kampf] ? null : this.d.stellen[w.stelle]; return null; }
  /** Beim Ankommen erzählen, was gerade geschehen ist (einmal je Auftritt). */
  auftritt() { const a = (AUFTRITTE[ortName] || []).filter((q) => !this.merker[q.setzt] && q.wenn.every((m) => this.merker[m])).pop(); if (!a) return; this.gesperrt = true;
    this.time.delayedCall(500, () => void plaudern(a.titel, a.zeilen, [], a.schluss).then(() => { this.merke(a.setzt); if (a.ende) { this.geschafft(a.ende); return; } this.gesperrt = false; })); }
  /** Die Kampagne ist geschafft: festhalten, den Ort für den nächsten Besuch frisch machen, zurück in die Waldmark */
  geschafft(nr: number) { kampagneGeschafft(nr); try { localStorage.removeItem("ez_ort_" + ortName); localStorage.removeItem("ez_ort_" + ortName + "_pos"); } catch { /* privat */ } location.href = "./?von=tor"; }
  /** Wer in der Nähe steht, lässt sich ansprechen (Knopf, Taste E); an einer Tür geht es hinein. Solange geredet wird, steht der Held. */
  sprechen() { if (this.gesperrt || !this.nah) return; const kn = $("#ez-dorf-knopf");
    if (this.nah === "#heim") { this.gesperrt = true; this.cameras.main.fadeOut(350, 0, 0, 0); this.time.delayedCall(380, () => { location.href = "./?von=tor"; }); return; }
    if (this.nah[0] === "@") { const T = TUEREN[this.nah.slice(1)]; this.gesperrt = true; try { localStorage.setItem("ez_ort_" + ortName + "_pos", JSON.stringify([Math.round(this.ort.x), Math.round(this.ort.y)])); } catch { /* privat */ } this.cameras.main.fadeOut(350, 0, 0, 0); this.time.delayedCall(380, () => { location.href = "?ort=" + ortName + "&kampf=" + T.kampf; }); return; }
    const L = LEUTE[this.nah], g = this.offen(this.nah); this.gesperrt = true; this.rx = 0; this.ry = 0; this.tasten = {}; this.pfad = []; this.marke.setVisible(false); kn.hidden = true;
    void (g ? plaudern(L.name, g.zeilen, g.fragen, g.schluss).then(() => { this.merke(g.setzt); if (g.ende) this.geschafft(g.ende); }) : plaudern(L.name, [L.sonst], [], "Weiter")).then(() => { this.gesperrt = false; this.nah = ""; }); }
  meuteBild: Phaser.GameObjects.Sprite | null = null;
  /** Die Meute mit Fackeln: drängt und ruft, bis sie jemand nach Hause schickt */
  meute() { const M = MEUTE[ortName], F = this.d.mass || 1; if (!M || this.merker[M.weg]) return; const x = M.x * F, y = M.y * F;
    if (!this.anims.exists("meute")) this.anims.create({ key: "meute", frames: this.anims.generateFrameNumbers("meute", {}), frameRate: 5, repeat: -1, yoyo: true });
    const sp = this.add.sprite(x, y, "meute").setOrigin(0.5, 0.96).setScale(GROSS * 0.95 / 218).setDepth(y).play("meute"); this.meuteBild = sp;
    if (!this.textures.exists("glut")) { const t = this.textures.createCanvas("glut", 128, 128); if (t) { const c = t.getContext(), g = c.createRadialGradient(64, 64, 2, 64, 64, 64); g.addColorStop(0, "rgba(255,200,120,1)"); g.addColorStop(0.4, "rgba(255,140,60,.4)"); g.addColorStop(1, "rgba(255,110,40,0)"); c.fillStyle = g; c.fillRect(0, 0, 128, 128); t.refresh(); } }
    const schein = this.add.image(x + 10, y - GROSS * 1.15, "glut").setBlendMode(Phaser.BlendModes.ADD).setScale(2.6, 2).setAlpha(0.25).setDepth(99998); this.time.addEvent({ delay: 110, loop: true, callback: () => { if (!this.meuteBild) { schein.destroy(); return; } schein.setAlpha(0.18 + Math.random() * 0.14); } });
    let n = -1; const rufen = () => { if (!this.scene.isActive() || !this.meuteBild) return; n = (n + 1 + Math.floor(Math.random() * 3)) % SCHREIE.length;
      const t = this.add.text(0, 0, SCHREIE[n], { fontFamily: "Inter, sans-serif", fontSize: "15px", fontStyle: "bold", color: "#3a0c06", align: "center" }).setOrigin(0.5, 1).setResolution(2), b = t.getBounds(), bw = b.width + 20, bh = b.height + 12;
      const blase = this.add.graphics(); blase.fillStyle(0xffe2c8, 0.96).lineStyle(2, 0x7a1a0c, 0.9); blase.fillRoundedRect(-bw / 2, -bh - 10, bw, bh, 9).strokeRoundedRect(-bw / 2, -bh - 10, bw, bh, 9); blase.fillTriangle(-7, -11, 7, -11, 0, 0); t.setPosition(0, -16);
      const c = this.add.container(x + (Math.random() - 0.5) * 70, y - GROSS * 1.2, [blase, t]).setDepth(99990).setAlpha(0); this.tweens.add({ targets: c, alpha: 1, y: c.y - 6, duration: 200 }); this.tweens.add({ targets: c, alpha: 0, duration: 300, delay: 2000, onComplete: () => c.destroy() });
      this.time.delayedCall(2600 + Math.random() * 2600, rufen); };
    this.time.delayedCall(1500, rufen); }
  /** Dorfleute, die beisammenstehen: Sie gestikulieren, und alle paar Sekunden sagt einer von ihnen etwas Belangloses in einer Sprechblase. */
  gruppen() { const M = GROSS / 123 * 0.82; /* 0.82: am Helden nachgemessen – seine Größe zählt mit Waffe und Schild, der Körper ist kleiner */ /* im Feld ist eine Person etwa 123 Bildpunkte hoch */
    for (const [x, y] of this.d.gruppen || []) { if (!this.anims.exists("dorfgruppe")) this.anims.create({ key: "dorfgruppe", frames: this.anims.generateFrameNumbers("dorfgruppe", {}), frameRate: 2.2, repeat: -1, yoyo: true });
      const g = this.add.sprite(x, y, "dorfgruppe").setOrigin(0.5, 0.965).setScale(M).setDepth(y - 30); g.play("dorfgruppe"); let zuletzt = -1, satz = -1;
      const reden = () => { if (!this.scene.isActive()) return; let wer = Math.floor(Math.random() * KOEPFE.length); if (wer === zuletzt) wer = (wer + 1) % KOEPFE.length; zuletzt = wer; let n = Math.floor(Math.random() * GEREDE.length); if (n === satz) n = (n + 1) % GEREDE.length; satz = n;
        const kx = x + (KOEPFE[wer][0] - 0.5) * 300 * M, ky = y + (KOEPFE[wer][1] - 0.965) * 300 * M - 10;
        const t = this.add.text(0, 0, GEREDE[n], { fontFamily: "Inter, sans-serif", fontSize: "15px", color: "#2a1c06", align: "center", wordWrap: { width: 190 } }).setOrigin(0.5, 1).setResolution(2), b = t.getBounds(), bw = b.width + 20, bh = b.height + 12;
        const blase = this.add.graphics(); blase.fillStyle(0xfff6dc, 0.96).lineStyle(2, 0x5b3d0c, 0.9); blase.fillRoundedRect(-bw / 2, -bh - 10, bw, bh, 9).strokeRoundedRect(-bw / 2, -bh - 10, bw, bh, 9); blase.fillTriangle(-7, -11, 7, -11, 0, 0); t.setPosition(0, -16);
        const c = this.add.container(kx, ky, [blase, t]).setDepth(99990).setAlpha(0); this.tweens.add({ targets: c, alpha: 1, y: ky - 4, duration: 220 }); this.tweens.add({ targets: c, alpha: 0, duration: 350, delay: 2600 + GEREDE[n].length * 35, onComplete: () => c.destroy() });
        this.time.delayedCall(4200 + Math.random() * 4500, reden); };
      this.time.delayedCall(1200 + Math.random() * 1500, reden); } }
  /** Was vor dem Helden steht: Jedes Vieleck wird aus dem Bild ausgeschnitten und liegt auf der Höhe seiner Fußlinie – wer dahinter läuft, wird verdeckt. */
  vorn(F: number) { const quelle = this.textures.get("ortboden").getSourceImage() as HTMLImageElement, k = quelle.width / (this.d.breit / F); /* k: Bildpunkte des Bildes je Maßeinheit der Angaben */
    (this.d.vorn as [number[][], number][] || []).forEach(([p, fuss], n) => { const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]), x0 = Math.min(...xs), y0 = Math.min(...ys), w = Math.max(...xs) - x0, h = Math.max(...ys) - y0, t = this.textures.createCanvas("vorn" + n, Math.ceil(w * k), Math.ceil(h * k)); if (!t) return;
      const c = t.getContext(); c.beginPath(); p.forEach((q, i) => (i ? c.lineTo((q[0] - x0) * k, (q[1] - y0) * k) : c.moveTo((q[0] - x0) * k, (q[1] - y0) * k))); c.closePath(); c.clip(); c.drawImage(quelle, -x0 * k, -y0 * k); t.refresh();
      this.add.image(x0 * F, y0 * F, "vorn" + n).setOrigin(0, 0).setScale(F / k).setDepth(fuss * F); }); }
  /** Das Festfeuer lebt: ein flackernder Schein und aufsteigende Funken */
  feuer() { const s = this.d.stellen.feuer; if (!s) return; const t = this.textures.createCanvas("glut", 128, 128); if (!t) return; const c = t.getContext(), g = c.createRadialGradient(64, 64, 2, 64, 64, 64); g.addColorStop(0, "rgba(255,200,120,1)"); g.addColorStop(0.4, "rgba(255,140,60,.4)"); g.addColorStop(1, "rgba(255,110,40,0)"); c.fillStyle = g; c.fillRect(0, 0, 128, 128); t.refresh();
    const schein = this.add.image(s[0], s[1] - 40, "glut").setBlendMode(Phaser.BlendModes.ADD).setScale(5.5, 3.6).setAlpha(0.3).setDepth(99999); /* über allem: der Schein fällt auch auf Figuren und Bänke */ this.time.addEvent({ delay: 90, loop: true, callback: () => { schein.setAlpha(0.22 + Math.random() * 0.16).setScale(5.3 + Math.random() * 0.5, 3.5 + Math.random() * 0.3); } });
    this.time.addEvent({ delay: 130, loop: true, callback: () => { const f = this.add.image(s[0] + (Math.random() - 0.5) * 50, s[1] - 60 - Math.random() * 40, "glut").setBlendMode(Phaser.BlendModes.ADD).setScale(0.05 + Math.random() * 0.05).setDepth(s[1] + 1); this.tweens.add({ targets: f, y: f.y - 110 - Math.random() * 90, x: f.x + (Math.random() - 0.5) * 60, alpha: 0, duration: 1300 + Math.random() * 900, onComplete: () => f.destroy() }); } }); }
  /** Weg zu einer Stelle suchen (Breitensuche über das Raster); ist sie nicht begehbar, endet der Weg am nächsten begehbaren Feld. */
  gehe(x: number, y: number) {
    const D = this.d, Z = D.zelle, B = D.zeilen[0].length, H = D.zeilen.length, zelle = (px: number, py: number) => Math.max(0, Math.min(B - 1, Math.floor(px / Z))) + B * Math.max(0, Math.min(H - 1, Math.floor(py / Z)));
    const mitte = (i: number) => [(i % B + 0.5) * Z, (Math.floor(i / B) + 0.5) * Z], gut = (i: number) => D.zeilen[Math.floor(i / B)][i % B] === "." && !this.zu.has(i % B + 4096 * Math.floor(i / B));
    const start = zelle(this.ort.x, this.ort.y), von = new Int32Array(B * H).fill(-1), reihe = [start]; von[start] = start; let best = start, bestA = 1e9;
    for (let n = 0; n < reihe.length; n++) { const i = reihe[n], [mx, my] = mitte(i), a = Math.hypot(mx - x, (my - y) / Q); if (a < bestA) { bestA = a; best = i; } if (a < Z * 0.75) break;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const cx = i % B + dx, cy = Math.floor(i / B) + dy; if (cx < 0 || cy < 0 || cx >= B || cy >= H) continue; const j = cx + B * cy; if (von[j] >= 0 || !gut(j)) continue; if (dx && dy && (!gut(cx + B * Math.floor(i / B)) || !gut(i % B + B * cy))) continue; von[j] = i; reihe.push(j); } }
    const weg: number[][] = []; for (let i = best; i !== start; i = von[i]) weg.unshift(mitte(i)); if (weg.length && this.frei(x, y) && bestA < Z) weg.push([x, y]);
    /* glätten: Zwischenpunkte weglassen, solange die gerade Strecke frei ist */
    const frei2 = (a: number[], b: number[]) => { const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 8); for (let k = 1; k < n; k++) if (!this.frei(a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n)) return false; return true; };
    const glatt: number[][] = []; let hier = [this.ort.x, this.ort.y], k = 0; while (k < weg.length) { let m = k; for (let n = weg.length - 1; n > k; n--) if (frei2(hier, weg[n])) { m = n; break; } glatt.push(weg[m]); hier = weg[m]; k = m + 1; }
    this.pfad = glatt; const z = glatt[glatt.length - 1]; if (z) this.marke.setPosition(z[0], z[1]).setVisible(true); else this.marke.setVisible(false);
  }
  update(_t: number, dt: number) {
    const d = Math.min(0.05, dt / 1000), o = this.ort; let rx = this.gesperrt ? 0 : this.rx, ry = this.gesperrt ? 0 : this.ry;
    if (!this.gesperrt) { let nah = ""; { const st = this.d.stellen.start; if (Math.hypot(o.x - st[0], (o.y - st[1]) / Q) < 110) nah = "#heim"; } /* am Ortseingang geht es zurück */ for (const k in TUEREN) { const t = this.d.stellen[k]; if (t && !this.merker["kampf_" + TUEREN[k].kampf] && TUEREN[k].wenn.every((m) => this.merker[m]) && Math.hypot(o.x - t[0], (o.y - t[1]) / Q) < 110) nah = "@" + k; }
      for (const q of this.personen) if (this.da(q.id) && Math.hypot(o.x - q.x, (o.y - q.y) / Q) < (LEUTE[q.id].gross ? 85 : 120)) nah = q.id;
      if (nah !== this.nah) { this.nah = nah; const kn = $("#ez-dorf-knopf"); kn.classList.remove("bald"); kn.hidden = !nah; if (nah) kn.textContent = (nah === "#heim" ? "Zurück nach Waldmark" : nah[0] === "@" ? TUEREN[nah.slice(1)].knopf : "Mit " + (LEUTE[nah].name.startsWith("Mutter ") ? LEUTE[nah].name : LEUTE[nah].name.split(" ")[0]) + " sprechen") + (HANDY ? "" : "  [E]"); } }
    { const z = this.gesperrt ? null : this.ziel(), weit = z ? Math.hypot(z[0] - o.x, (z[1] - o.y) / Q) : 0; if (z && weit > 130) { const w = Math.atan2((z[1] - o.y) / Q, z[0] - o.x), ax = Math.cos(w), ay = Math.sin(w); this.pfeil.setVisible(true).setPosition(o.x + ax * 62, o.y + ay * 62 * Q).setRotation(Math.atan2(ay * Q, ax)).setScale(1.5, 1.5); } else this.pfeil.setVisible(false); }
    if (Math.hypot(rx, ry) > 0.05) { this.pfad = []; this.marke.setVisible(false); }
    else if (this.pfad.length) { const z = this.pfad[0], dx = z[0] - o.x, dy = z[1] - o.y; if (Math.hypot(dx, dy) < 5) { this.pfad.shift(); if (!this.pfad.length) this.marke.setVisible(false); } else { const qy = dy / Q, q = Math.hypot(dx, qy); rx = dx / q; ry = qy / q; } }
    const l = Math.hypot(rx, ry), faehrt = l > 0.05;
    if (faehrt) { const k = Math.min(1, l) / l, sx = rx * k * TEMPO * d, sy = ry * k * TEMPO * Q * d;
      if (this.frei(o.x + sx, o.y + sy)) { o.x += sx; o.y += sy; } else if (this.frei(o.x + sx, o.y)) o.x += sx; else if (this.frei(o.x, o.y + sy)) o.y += sy; /* an Kanten entlanggleiten */
      if (Math.abs(rx) > 0.35) this.figur.setFlipX(rx < 0); }
    const D = HELDEN[this.held]; if (faehrt !== this.laeuft && D.figur && D.lauf) { this.laeuft = faehrt; if (faehrt) { const L = D.laufMass || [0.5, 0.946, 0.91]; this.figur.play("lauf-" + this.held); this.figur.setOrigin(L[0], L[1]).setScale(GROSS / (L[2] * 176)); } else { const fu = D.fuss || [0.5, 0.94]; this.figur.stop(); this.figur.setTexture("figur-" + this.held); this.figur.setOrigin(fu[0], fu[1]).setScale(GROSS * (D.gross || 1) / this.figur.height); } }
    this.figur.setPosition(o.x, o.y + 3).setDepth(o.y); this.ring.setPosition(o.x, o.y).setDepth(o.y - 0.01);
    { const pk = $("#ez-karte-punkt"); pk.style.left = (100 * o.x / this.d.breit) + "%"; pk.style.top = (100 * o.y / this.d.hoch) + "%"; }
    const k = this.cameras.main; k.scrollX += (o.x - k.width / 2 - k.scrollX) * 0.12; k.scrollY += (o.y - 40 - k.height / 2 - k.scrollY) * 0.12;
  }
}
