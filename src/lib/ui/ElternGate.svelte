<!-- Eltern-Gate: 3 Sekunden gedrückt halten (Ring füllt sich; loslassen bricht ab), danach Zahlwort-Aufgabe. -->
<script>
  import Icon from './Icon.svelte';
  import ElternAufgabe from './ElternAufgabe.svelte';

  let { onoffen, groesse = 88, label = 'Elternbereich: 3 Sekunden gedrückt halten', icon = 'schloss' } = $props();
  const DAUER = 3000;
  let fortschritt = $state(0);
  let aufgabe = $state(false);
  let start = 0;
  let uhr = 0; // Intervall statt requestAnimationFrame: läuft auch, wenn der Browser Frames drosselt
  let knopf = $state();
  let gedrueckt = false;
  let fingerLiegtAuf = false;

  // iOS Safari schickt bei langem Berühren gern ein pointercancel/pointerleave, obwohl der Finger noch
  // aufliegt. Deshalb zählt nur echtes Loslassen (pointerup bzw. touchend/touchcancel) als Abbruch.
  function starten() {
    if (gedrueckt) return;
    gedrueckt = true;
    start = performance.now();
    clearInterval(uhr);
    uhr = setInterval(() => {
      if (!gedrueckt) return;
      fortschritt = Math.min(1, (performance.now() - start) / DAUER);
      if (fortschritt >= 1) {
        beenden();
        aufgabe = true;
      }
    }, 40);
  }
  function beenden() {
    gedrueckt = false;
    clearInterval(uhr);
    fortschritt = 0;
  }
  function los(e) {
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      /* Pointer nicht (mehr) aktiv */
    }
    starten();
  }
  function abgebrochen() {
    // Bei Touch entscheidet touchend, nicht das (auf iOS unzuverlässige) pointercancel
    if (!fingerLiegtAuf) beenden();
  }

  $effect(() => {
    if (!knopf) return;
    const runter = (e) => {
      e.preventDefault(); // kein Kontextmenü/Scrollen/Lupe beim langen Halten
      fingerLiegtAuf = true;
      starten();
    };
    const hoch = () => {
      fingerLiegtAuf = false;
      beenden();
    };
    // nicht-passiv, damit preventDefault wirkt (Svelte registriert touchstart sonst passiv)
    knopf.addEventListener('touchstart', runter, { passive: false });
    knopf.addEventListener('touchend', hoch);
    knopf.addEventListener('touchcancel', hoch);
    return () => {
      knopf.removeEventListener('touchstart', runter);
      knopf.removeEventListener('touchend', hoch);
      knopf.removeEventListener('touchcancel', hoch);
      clearInterval(uhr);
    };
  });

  const r = 42;
  const umfang = 2 * Math.PI * r;
</script>

<button
  type="button"
  class="gate"
  bind:this={knopf}
  style:--g="{groesse}px"
  aria-label={label}
  onpointerdown={los}
  onpointerup={beenden}
  onpointercancel={abgebrochen}
  oncontextmenu={(e) => e.preventDefault()}
  onkeydown={(e) => e.key === 'Enter' && e.repeat === false && (aufgabe = true)}
>
  <svg viewBox="0 0 100 100" class="ring" aria-hidden="true">
    <circle cx="50" cy="50" r={r} class="spur" />
    <circle cx="50" cy="50" r={r} class="fuellung" stroke-dasharray={umfang} stroke-dashoffset={umfang * (1 - fortschritt)} />
  </svg>
  <Icon name={icon} groesse={groesse * 0.4} />
</button>

{#if aufgabe}
  <ElternAufgabe
    onrichtig={() => {
      aufgabe = false;
      onoffen?.();
    }}
    onabbrechen={() => (aufgabe = false)}
  />
{/if}

<style>
  .gate {
    width: max(44px, calc(var(--g) * var(--skala)));
    height: max(44px, calc(var(--g) * var(--skala)));
    border-radius: 50%;
    border: 4px solid var(--tinte);
    background: rgba(255, 253, 247, 0.75);
    display: grid;
    place-items: center;
    position: relative;
    cursor: pointer;
    touch-action: none;
    padding: 0;
  }
  .ring { position: absolute; inset: -4px; width: calc(100% + 8px); height: calc(100% + 8px); transform: rotate(-90deg); }
  .spur { fill: none; stroke: transparent; stroke-width: 8; }
  .fuellung { fill: none; stroke: var(--gras); stroke-width: 8; stroke-linecap: round; }
</style>
