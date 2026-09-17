<!--
  Eltern-Aufgabe: Zahlwort lesen und passende Ziffer tippen. Für Nicht-Leser praktisch unlösbar.
  Falsche Wahl → neue Aufgabe (ohne Ton, ohne Wertung).
-->
<script>
  import { mischen, eins } from '../zufall.js';

  let { titel = 'Für Erwachsene', onrichtig, onabbrechen } = $props();

  const WOERTER = { 2: 'zwei', 3: 'drei', 4: 'vier', 5: 'fünf', 6: 'sechs', 7: 'sieben', 8: 'acht', 9: 'neun' };
  const ZAHLEN = Object.keys(WOERTER).map(Number);

  function neueAufgabe() {
    const ziel = eins(ZAHLEN);
    const andere = mischen(ZAHLEN.filter((z) => z !== ziel)).slice(0, 2);
    return { ziel, auswahl: mischen([ziel, ...andere]) };
  }

  let aufgabe = $state(neueAufgabe());

  function waehle(z) {
    if (z === aufgabe.ziel) onrichtig?.();
    else aufgabe = neueAufgabe();
  }
</script>

<div class="schleier" role="dialog" aria-modal="true" aria-label={titel}>
  <div class="karte sticker">
    <button type="button" class="zu" aria-label="Abbrechen" onclick={() => onabbrechen?.()}>✕</button>
    <p class="titel">{titel}</p>
    <p class="anweisung">Tippe auf <strong>{WOERTER[aufgabe.ziel]}</strong></p>
    <div class="zahlen">
      {#each aufgabe.auswahl as z (z)}
        <button type="button" class="zahl" onclick={() => waehle(z)}>{z}</button>
      {/each}
    </div>
  </div>
</div>

<style>
  .schleier {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(16, 36, 58, 0.55);
    display: grid; place-items: center;
    padding: var(--rand-o) var(--rand-r) var(--rand-u) var(--rand-l);
  }
  .karte {
    position: relative;
    background: var(--weiss);
    padding: 28px 36px 32px;
    text-align: center;
    min-width: min(460px, 100%);
  }
  .titel { margin: 0 0 6px; font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.6; }
  .anweisung { margin: 0 0 22px; font-size: 26px; font-weight: 700; }
  .zahlen { display: flex; gap: 18px; justify-content: center; }
  .zahl {
    width: 96px; height: 96px; border-radius: 22px;
    border: 4px solid var(--tinte); box-shadow: 0 5px 0 var(--tinte);
    background: var(--himmel-hell); font-size: 44px; font-weight: 900; cursor: pointer;
  }
  .zahl:active { transform: translateY(3px); box-shadow: 0 2px 0 var(--tinte); }
  .zu {
    position: absolute; top: 10px; right: 10px;
    width: 52px; height: 52px; border-radius: 50%;
    border: 3px solid var(--tinte); background: var(--weiss);
    font-size: 24px; font-weight: 900; cursor: pointer;
  }
</style>
