<!-- Partner-Monster des Kindes mit Profil-Werten (nutzt Monster.svelte laut Vertrag). -->
<script>
  import Monster from '../monster/Monster.svelte';
  import { app, monsterStufe, zubehoerAn } from '../state/app.svelte.js';

  let { pose = 'stehen', groesse = 240, stufe = null, wippen = true } = $props();
</script>

{#if app.profil}
  <div class="partner" class:wippen style:--g="{groesse}px">
    <Monster
      art={app.profil.art}
      farbe={app.profil.farbe}
      muster={app.profil.muster}
      zubehoer={zubehoerAn()}
      stufe={stufe ?? monsterStufe()}
      {pose}
      {groesse}
    />
    <div class="schatten" aria-hidden="true"></div>
  </div>
{/if}

<style>
  .partner { position: relative; width: var(--g); height: var(--g); }
  .partner :global(svg) { position: relative; z-index: 1; overflow: visible; }
  .wippen :global(svg) { animation: wippen 3s ease-in-out infinite; }
  .schatten {
    position: absolute;
    left: 20%;
    right: 20%;
    bottom: 2%;
    height: 8%;
    border-radius: 50%;
    background: rgba(16, 36, 58, 0.22);
  }
</style>
