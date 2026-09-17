<!--
  Großer Sticker-Knopf. Kind-tauglich: nur Icon/Symbol, `label` ist für Screenreader.
  farbe: sonne | gras | koralle | orange | weiss | himmel | meer
-->
<script>
  let {
    label,
    farbe = 'sonne',
    groesse = 96,
    rund = true,
    pulsieren = false,
    aktiv = false,
    disabled = false,
    onclick,
    children,
    ...rest
  } = $props();
</script>

<button
  type="button"
  class="knopf farbe-{farbe}"
  class:rund
  class:pulsieren
  class:aktiv
  style:--g-soll="{groesse}px"
  aria-label={label}
  {disabled}
  {onclick}
  {...rest}
>
  {@render children?.()}
</button>

<style>
  .knopf {
    /* Solltgröße skaliert mit dem Bildschirm, nie kleiner als --min-tipp */
    --g: max(var(--min-tipp), calc(var(--g-soll) * var(--skala)));
    min-width: var(--g);
    min-height: var(--g);
    padding: 0 calc(var(--g) * 0.22);
    display: inline-grid;
    place-items: center;
    grid-auto-flow: column;
    gap: 12px;
    border: var(--linie) solid var(--tinte);
    border-radius: var(--rund);
    box-shadow: var(--schatten);
    background: var(--bg);
    cursor: pointer;
    font-size: calc(var(--g) * 0.3);
    font-weight: 900;
    line-height: 1;
    transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.2s;
    touch-action: manipulation;
    position: relative;
  }
  /* Icons wachsen nicht über den (ggf. verkleinerten) Knopf hinaus */
  .knopf > :global(svg) { max-width: 64%; max-height: 64%; }
  .rund { border-radius: 999px; padding: 0; width: var(--g); height: var(--g); }
  .knopf:active:not(:disabled) { transform: translateY(5px) scale(0.97); box-shadow: var(--schatten-gedrueckt); }
  .knopf:disabled { opacity: 0.45; cursor: default; }
  .aktiv { outline: 6px solid var(--weiss); outline-offset: 3px; }
  .pulsieren { animation: pulsieren 1.6s ease-in-out infinite; }

  .farbe-sonne { --bg: var(--sonne); }
  .farbe-gras { --bg: var(--gras); }
  .farbe-koralle { --bg: var(--koralle); }
  .farbe-orange { --bg: var(--orange); }
  .farbe-weiss { --bg: var(--weiss); }
  .farbe-himmel { --bg: var(--himmel); }
  .farbe-meer { --bg: var(--meer); color: var(--weiss); }
</style>
