/* Mythara – Login und Landing-Page im Querformat: genau ein Bildschirm, ohne Scrollen (24.11.2026).
   Die Steintafel wird mit CSS-zoom so groß gezeichnet, dass sie zwischen Logo und Fußzeile passt (kleiner auf kleinen, etwas größer auf großen Bildschirmen).
   Hochkant (Handy) bleibt alles wie gehabt: dort darf gescrollt werden. */
(function () {
  const quer = () => innerWidth >= innerHeight;
  function passen() {
    const t = document.querySelector(".buehne > .tafel"), b = document.querySelector(".buehne"); if (!t || !b) return;
    document.documentElement.classList.toggle("quer", quer());
    if (!quer()) { t.style.zoom = ""; return; }
    t.style.zoom = "1"; const r = t.getBoundingClientRect(), cs = getComputedStyle(b);
    const logo = (document.querySelector(".logo-platz") || { offsetHeight: 0 }).offsetHeight, fuss = (document.querySelector(".fuss") || { offsetHeight: 0 }).offsetHeight;
    const frei = innerHeight - logo - fuss - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - (innerHeight <= 520 ? 46 : 58) /* Emblem über der Tafel und Luft */, breit = innerWidth * 0.96;
    const z = Math.max(0.3, Math.min(1.25, frei / r.height, breit / r.width)); t.style.zoom = String(Math.round(z * 1000) / 1000);
  }
  let uhr = 0; const bald = () => { cancelAnimationFrame(uhr); uhr = requestAnimationFrame(passen); };
  addEventListener("resize", bald); addEventListener("orientationchange", bald); addEventListener("load", bald);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(bald);
  document.addEventListener("DOMContentLoaded", () => { bald(); const t = document.querySelector(".buehne > .tafel");
    if (t && "MutationObserver" in window) new MutationObserver(bald).observe(t, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden"] }); });
  bald();
})();
/* In der iOS-App (Kennung „RiftmereApp“ im User-Agent): keine Links zur Webseite des Würfelspiels, keine Fußzeile, kein Zoom in Eingabefelder */
(function () {
  if (!/RiftmereApp/.test(navigator.userAgent)) return;
  document.documentElement.classList.add("app");
  /* kein Hineinzoomen beim Antippen eines Eingabefelds (iOS zoomt sonst, weil die Tafel per CSS-zoom verkleinert ist) */
  const vp = document.querySelector('meta[name="viewport"]'); if (vp && !/maximum-scale/.test(vp.content)) vp.content += ", maximum-scale=1, user-scalable=no";
  /* Fußzeile (Würfelspiel, Impressum, Datenschutz) in der App ausblenden – Datenschutz und Impressum stehen in den Einstellungen im Spiel */
  const st = document.createElement("style"); st.textContent = "html.app .fuss { display: none !important; }"; document.head.appendChild(st);
  const weg = () => document.querySelectorAll('a[href="../"]').forEach((a) => { const n = a.nextSibling; if (n && n.nodeType === 3 && /^\s*·\s*$/.test(n.textContent)) n.remove(); a.remove(); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", weg); else weg();
})();
