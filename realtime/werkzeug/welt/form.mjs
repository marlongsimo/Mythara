/*
 * World Pipeline – Formprüfung der Weltdaten.
 * Aufruf (im Ordner realtime): node werkzeug/welt/form.mjs [region …]
 * Ohne Angabe werden die Bibliotheken und alle Regionen geprüft. Endet mit Fehlercode 1, wenn etwas nicht stimmt.
 */
import { formPruefen } from "./laden.mjs";
const ergebnis = await formPruefen(process.argv.length > 2 ? process.argv.slice(2) : undefined);
let fehler = 0;
for (const [name, liste] of Object.entries(ergebnis)) {
  console.log(`${liste.length ? "✗" : "✓"} ${name}${liste.length ? ` – ${liste.length} Fehler` : ""}`);
  for (const f of liste.slice(0, 40)) console.log("    " + f);
  if (liste.length > 40) console.log(`    … und ${liste.length - 40} weitere`);
  fehler += liste.length;
}
console.log(fehler ? `\nWeltdaten: ${fehler} Fehler` : "\nWeltdaten: Form in Ordnung");
process.exit(fehler ? 1 : 0);
