// Bildschirm-Skalierung: Layouts sind für iPad-Querformat (Höhe ~820 px) entworfen.
// Auf kleineren Geräten (iPhone quer: ~375–430 px Höhe) schrumpfen Knöpfe und Randabstände proportional,
// aber nie unter die Mindest-Tippgröße (siehe app.css / Knopf.svelte).
export const REFERENZ_HOEHE = 820;
export const MIN_SKALA = 0.55;

export function skalaFuer(hoehe) {
  return Math.max(MIN_SKALA, Math.min(1, hoehe / REFERENZ_HOEHE));
}

/** Setzt --skala auf :root und hält es bei Größen- und Drehänderungen aktuell. */
export function skalaBeobachten(fenster = window) {
  const setzen = () => fenster.document.documentElement.style.setProperty('--skala', String(skalaFuer(fenster.innerHeight)));
  setzen();
  fenster.addEventListener('resize', setzen);
  fenster.visualViewport?.addEventListener('resize', setzen);
}
