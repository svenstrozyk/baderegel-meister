<!--
  Drei Lernziel-Symbole einer Regel: Auge = Kennen, Glühbirne = Verstehen, Daumen hoch = Einschätzen.
  Zustand je Ziel: leer (grauer Umriss) | halb (untere Hälfte sonnengelb, pulsiert sanft) | voll (sonnengelb mit Glanz).
  props:
    staende:     [{ ziel, stand }] (zielStaende aus fortschritt.js) – oder regelId, dann aus dem App-Zustand
    groesse:     Durchmesser eines Symbols in px
    hervorheben: Ziel-Namen, die gerade neu dazugekommen sind (kurze Animation)
    abstand:     Lücke zwischen den Symbolen in px (Standard: 18 % der Größe)
-->
<script>
  import { staende as ausApp } from '../state/app.svelte.js';

  let { staende = null, regelId = null, groesse = 32, hervorheben = [], abstand = null } = $props();

  const uid = $props.id();
  const liste = $derived(staende ?? (regelId != null ? ausApp(regelId) : []));
  const NAME = { kennen: 'Kennen', verstehen: 'Verstehen', einschaetzen: 'Einschätzen' };
  const STAND = { leer: 'noch nicht', halb: 'halb', voll: 'geschafft' };
</script>

<div
  class="ziele"
  style:--g="{groesse}px"
  style:--abstand="{abstand ?? Math.round(groesse * 0.18)}px"
  role="img"
  aria-label={liste.map((z) => `${NAME[z.ziel]}: ${STAND[z.stand]}`).join(', ')}
>
  {#each liste as z (z.ziel)}
    {@const fuell = z.stand === 'voll' ? 'var(--sonne)' : z.stand === 'halb' ? `url(#${uid}-halb)` : '#eef3f6'}
    {@const linie = z.stand === 'leer' ? '#9fb2bf' : 'var(--tinte)'}
    <span class="ziel stand-{z.stand}" class:hervor={hervorheben.includes(z.ziel)}>
      <svg viewBox="0 0 48 48" width={groesse} height={groesse} aria-hidden="true">
        {#if z.ziel === 'kennen'}
          <path d="M4 24C11 12 37 12 44 24C37 36 11 36 4 24Z" fill={fuell} stroke={linie} stroke-width="4" stroke-linejoin="round" />
          <circle cx="24" cy="24" r="7.5" fill={z.stand === 'leer' ? '#c5d2da' : 'var(--tinte)'} />
          <circle cx="26.5" cy="21.5" r="2.4" fill="#fff" />
        {:else if z.ziel === 'verstehen'}
          <path d="M24 4C14.5 4 8.5 11 8.5 19c0 6.5 4.3 9.6 6.8 13.2 1 1.4 1.4 2.8 1.4 4.3h14.6c0-1.5.4-2.9 1.4-4.3 2.5-3.6 6.8-6.7 6.8-13.2C39.5 11 33.5 4 24 4Z" fill={fuell} stroke={linie} stroke-width="4" stroke-linejoin="round" />
          <path d="M19 28l5-8 5 8" fill="none" stroke={linie} stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M17.5 41.5h13M19.5 45.5h9" stroke={linie} stroke-width="4" stroke-linecap="round" />
        {:else}
          <path d="M5 22h8v21H5z" fill={fuell} stroke={linie} stroke-width="4" stroke-linejoin="round" />
          <path d="M13 22l7.5-14c1.2-2.4 6.5-2.4 6.5 2.5L26 19h11c3.6 0 6 3 5.2 6.4l-3 13c-.6 2.7-2.6 4.6-5.6 4.6H13z" fill={fuell} stroke={linie} stroke-width="4" stroke-linejoin="round" />
        {/if}
        {#if z.stand === 'voll'}
          <ellipse class="glanz" cx="16" cy="14" rx="5" ry="2.6" transform="rotate(-30 16 14)" fill="#fff" opacity="0.85" />
        {/if}
      </svg>
    </span>
  {/each}
  <svg width="0" height="0" class="defs" aria-hidden="true">
    <defs>
      <linearGradient id="{uid}-halb" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.5" stop-color="#fffdf7" />
        <stop offset="0.5" stop-color="#ffd23f" />
      </linearGradient>
    </defs>
  </svg>
</div>

<style>
  .ziele { display: inline-flex; gap: var(--abstand); align-items: center; line-height: 0; }
  .ziel {
    width: var(--g);
    height: var(--g);
    display: grid;
    place-items: center;
    border-radius: 50%;
    position: relative;
  }
  .ziel svg { overflow: visible; }
  .stand-halb { animation: halb 2s ease-in-out infinite; }
  .stand-voll svg { filter: drop-shadow(0 0 calc(var(--g) * 0.12) rgba(255, 210, 63, 0.9)); }
  .defs { position: absolute; }
  @keyframes halb { 50% { transform: scale(1.12); } }

  .hervor { animation: hervor 0.7s ease-in-out 0.3s 4 both; z-index: 1; }
  .hervor::after {
    content: '';
    position: absolute;
    inset: -30%;
    border-radius: 50%;
    border: calc(var(--g) * 0.08) solid var(--sonne);
    animation: ring 1.4s ease-out 0.3s 2 both;
  }
  @keyframes hervor { 0%, 100% { transform: scale(1) rotate(0) } 40% { transform: scale(1.45) rotate(-8deg) } 70% { transform: scale(1.3) rotate(6deg) } }
  @keyframes ring { from { transform: scale(0.6); opacity: 1 } to { transform: scale(1.5); opacity: 0 } }

  @media (prefers-reduced-motion: reduce) {
    .stand-halb, .hervor, .hervor::after { animation: none; }
  }
</style>
