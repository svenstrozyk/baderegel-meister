<!-- Eltern-Gate: 3 Sekunden gedrückt halten (Ring füllt sich; loslassen bricht ab), danach Zahlwort-Aufgabe. -->
<script>
  import Icon from './Icon.svelte';
  import ElternAufgabe from './ElternAufgabe.svelte';

  let { onoffen, groesse = 88, label = 'Elternbereich: 3 Sekunden gedrückt halten', icon = 'schloss' } = $props();
  const DAUER = 3000;
  let fortschritt = $state(0);
  let aufgabe = $state(false);
  let start = 0;
  let frame = 0;

  function los(e) {
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      /* Pointer nicht (mehr) aktiv */
    }
    start = performance.now();
    cancelAnimationFrame(frame);
    const tick = (t) => {
      fortschritt = Math.min(1, (t - start) / DAUER);
      if (fortschritt >= 1) {
        fortschritt = 0;
        aufgabe = true;
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  }
  function abbrechen() {
    cancelAnimationFrame(frame);
    fortschritt = 0;
  }
  $effect(() => () => cancelAnimationFrame(frame));

  const r = 42;
  const umfang = 2 * Math.PI * r;
</script>

<button
  type="button"
  class="gate"
  style:--g="{groesse}px"
  aria-label={label}
  onpointerdown={los}
  onpointerup={abbrechen}
  onpointercancel={abbrechen}
  onpointerleave={abbrechen}
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
    width: var(--g);
    height: var(--g);
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
