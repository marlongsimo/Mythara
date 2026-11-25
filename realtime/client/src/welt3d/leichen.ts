/*
 * Mythara – wo gerade ein besiegter Gegner liegt (kampf3d.ts meldet, spielwelt.ts fragt): Beute, die dort neu auftaucht,
 * wird erst gezeigt (und ist erst antippbar), wenn die Leiche verschwunden ist – wie in OSRS.
 */
const leichen: { x: number; y: number; ab: number; bis: number }[] = [];
/** Ein Gegner fällt bei (x, y) (Weltfelder) und ist nach ms Millisekunden weg */
export function leicheMelden(x: number, y: number, ms: number): void { const j = performance.now(); leichen.push({ x, y, ab: j, bis: j + ms }); }
/** Liegt dort noch eine Leiche, die schon lag, bevor das Ding (zuerst gesehen um seit) auftauchte? */
export function unterLeiche(x: number, y: number, seit: number): boolean { const j = performance.now();
  for (let i = leichen.length - 1; i >= 0; i--) if (leichen[i].bis < j) leichen.splice(i, 1);
  return leichen.some((l) => seit >= l.ab - 800 && Math.hypot(l.x - x, l.y - y) < 2); }
