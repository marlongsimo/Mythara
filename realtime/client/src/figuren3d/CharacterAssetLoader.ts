/*
 * Lädt Figur, Katalog und die Atlanten der benötigten Ebenen (Phaser multiatlas). Lädt nur, was die Ausrüstung braucht;
 * beim Ausrüstungswechsel werden fehlende Ebenen nachgeladen. Texturen sind je Ebene geteilt: Zwei Figuren mit demselben Helm nutzen dieselbe Textur.
 */
import Phaser from "phaser";
import type { Ausruestung, EbenenMeta, FigurDaten, Katalog } from "./CharacterConfiguration";
import { sichtbareEbenen, texturSchluessel } from "./CharacterConfiguration";
export interface GeladeneFigur { figur: FigurDaten; katalog: Katalog; basis: string; meta: Map<string, EbenenMeta> }
const holen = async <T>(url: string): Promise<T> => { const r = await fetch(url); if (!r.ok) throw new Error(`${url}: ${r.status}`); return (await r.json()) as T; };
export class CharacterAssetLoader {
  private cache = new Map<string, Promise<GeladeneFigur>>();
  /** basis: Ordner mit den Figuren (z. B. "../img/figuren3d/") */
  constructor(private scene: Phaser.Scene, private basis: string) {}
  figur(id: string): Promise<GeladeneFigur> {
    let p = this.cache.get(id);
    if (!p) { const b = this.basis + id + "/"; p = (async () => { const figur = await holen<FigurDaten>(b + "figur.json"), katalog = await holen<Katalog>(b + figur.katalog); return { figur, katalog, basis: b, meta: new Map() }; })(); this.cache.set(id, p); }
    return p;
  }
  /** Sorgt dafür, dass alle Ebenen für diese Ausrüstung geladen sind. Zurück: die fehlgeschlagenen Ebenen. */
  async ebenenLaden(g: GeladeneFigur, a: Ausruestung): Promise<string[]> {
    const { koerper, items } = sichtbareEbenen(g.figur, g.katalog, a), noetig = [...koerper, ...items].filter((e) => !this.scene.textures.exists(texturSchluessel(g.figur.id, e)));
    if (!noetig.length) { for (const e of [...koerper, ...items]) this.metaMerken(g, e); return []; }
    const fehler: string[] = [];
    await new Promise<void>((fertig) => { const L = this.scene.load;
      for (const e of noetig) { const d = g.figur.ebenen[e], atlas = g.basis + d.atlas, pfad = atlas.slice(0, atlas.lastIndexOf("/") + 1); L.multiatlas(texturSchluessel(g.figur.id, e), atlas, pfad); }
      const fehl = (f: Phaser.Loader.File) => { fehler.push(String(f.key)); };
      L.on(Phaser.Loader.Events.FILE_LOAD_ERROR, fehl); L.once(Phaser.Loader.Events.COMPLETE, () => { L.off(Phaser.Loader.Events.FILE_LOAD_ERROR, fehl); fertig(); }); L.start(); });
    for (const e of [...koerper, ...items]) this.metaMerken(g, e);
    return fehler;
  }
  /** meta.mythara aus dem geladenen Atlas (Tiefe je Frame) */
  private metaMerken(g: GeladeneFigur, e: string): void {
    if (g.meta.has(e)) return; const json = this.scene.cache.json.get(texturSchluessel(g.figur.id, e)) as { meta?: { mythara?: EbenenMeta } } | undefined;
    if (json && json.meta && json.meta.mythara) g.meta.set(e, json.meta.mythara);
  }
}
