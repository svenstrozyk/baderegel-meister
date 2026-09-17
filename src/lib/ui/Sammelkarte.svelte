<!--
  Sammelkarte pro Regel.
  Bild: grau, solange alle Ziele leer sind; farbig, sobald ein Ziel halb oder voll ist.
  Rahmen: weiß bei 0–1 vollen Zielen, glitzernd bei 2, gold bei 3 (= Orden).
  Unten die drei Ziel-Symbole (ZielAnzeige).
  props: regelId, staende (optional, sonst aus App-Zustand), hervorheben (Ziel-Namen), breite, neu
  Oder Überraschungskarte: ueberraschung = { id, bild }
-->
<script>
  import ZielAnzeige from './ZielAnzeige.svelte';
  import { kurzVon, staende as ausApp } from '../state/app.svelte.js';

  let { regelId = null, staende = null, hervorheben = [], ueberraschung = null, breite = 160, neu = false } = $props();

  const regel = $derived(regelId != null ? kurzVon(regelId) : null);
  const liste = $derived(staende ?? (regelId != null ? ausApp(regelId) : []));
  const voll = $derived(liste.filter((z) => z.stand === 'voll').length);
  const grau = $derived(!ueberraschung && liste.every((z) => z.stand === 'leer'));
  const rahmen = $derived(ueberraschung ? 'selten' : voll === 3 ? 'gold' : voll === 2 ? 'glitzernd' : 'normal');
</script>

<div
  class="karte {rahmen}"
  class:neu
  class:grau
  style:--b="{breite}px"
  role="img"
  aria-label={ueberraschung ? `Überraschungskarte ${ueberraschung.id}` : `Karte ${regel?.kurz}`}
>
  <div class="bild">
    {#if ueberraschung}
      <img src={ueberraschung.bild} alt="" draggable="false" />
    {:else if regel}
      <img src={regel.regelbild} alt="" draggable="false" />
    {/if}
  </div>
  {#if voll >= 2 || ueberraschung}<div class="glanz" aria-hidden="true"></div>{/if}
  <div class="unten">
    {#if ueberraschung}
      <span class="selten-sterne" aria-hidden="true">
        {#each [0, 1, 2] as i}<svg viewBox="0 0 24 24" width={breite * 0.12} height={breite * 0.12}><path d="M12 1.5l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.6l-6.4 3.5L7 14l-5.3-5 7.2-.9z" fill="#fffdf7" stroke="#10243a" stroke-width="2" stroke-linejoin="round" /></svg>{/each}
      </span>
    {:else}
      <span class="pille"><ZielAnzeige staende={liste} {hervorheben} groesse={Math.round(breite * 0.15)} /></span>
    {/if}
  </div>
</div>

<style>
  .karte {
    --rahmen: var(--weiss);
    width: var(--b);
    aspect-ratio: 5 / 7;
    border: calc(var(--b) * 0.03 + 2px) solid var(--tinte);
    border-radius: calc(var(--b) * 0.1);
    background: var(--rahmen);
    box-shadow: 0 calc(var(--b) * 0.04) 0 var(--tinte);
    position: relative;
    overflow: hidden;
    padding: calc(var(--b) * 0.06);
    display: grid;
    grid-template-rows: 1fr auto;
    isolation: isolate;
  }
  .bild {
    border-radius: calc(var(--b) * 0.06);
    border: 3px solid var(--tinte);
    overflow: hidden;
    background: linear-gradient(var(--himmel), var(--meer));
    min-height: 0;
  }
  .bild img { width: 100%; height: 100%; object-fit: cover; display: block; transition: filter 0.6s; }
  .grau .bild img { filter: grayscale(1) brightness(1.15) opacity(0.55); }
  .unten { display: flex; justify-content: center; align-items: center; padding-top: calc(var(--b) * 0.06); min-height: calc(var(--b) * 0.24); position: relative; z-index: 3; }
  .pille { background: var(--weiss); border: calc(var(--b) * 0.012 + 1.5px) solid var(--tinte); border-radius: 999px; padding: calc(var(--b) * 0.018) calc(var(--b) * 0.05); line-height: 0; }
  .selten-sterne { display: flex; gap: calc(var(--b) * 0.04); }

  .glitzernd { --rahmen: linear-gradient(135deg, #c9f0ff, #fffdf7 30%, #ffc8ec 55%, #c9f0ff 80%, #d9c8ff); }
  .gold { --rahmen: linear-gradient(135deg, #ffe07a, #fff5c4 30%, #f2b42a 55%, #ffe98f 80%, #d9951a); }
  .selten { --rahmen: linear-gradient(135deg, var(--lila), #ff8fc8 50%, var(--himmel)); }

  .glanz {
    position: absolute;
    inset: -50%;
    background: linear-gradient(115deg, transparent 40%, rgba(255, 255, 255, 0.85) 50%, transparent 60%);
    animation: glanz 3.2s ease-in-out infinite;
    pointer-events: none;
    z-index: 2;
    mix-blend-mode: soft-light;
  }
  .gold .glanz { mix-blend-mode: screen; animation-duration: 2.4s; }
  @keyframes glanz { from { transform: translateX(-60%) } to { transform: translateX(60%) } }

  .neu { animation: hereinploppen 0.6s var(--weich) both, wackeln 0.5s 0.6s ease-in-out 2; }
</style>
