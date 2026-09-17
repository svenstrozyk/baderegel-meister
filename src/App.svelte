<script>
  import { fade } from 'svelte/transition';
  import { router } from './lib/router.svelte.js';
  import Start from './lib/ansichten/Start.svelte';
  import Onboarding from './lib/ansichten/Onboarding.svelte';
  import Heimat from './lib/ansichten/Heimat.svelte';
  import Sitzung from './lib/ansichten/Sitzung.svelte';
  import Album from './lib/ansichten/Album.svelte';
  import Orden from './lib/ansichten/Orden.svelte';
  import Eltern from './lib/ansichten/Eltern.svelte';
  import DetektivWahl from './lib/ansichten/DetektivWahl.svelte';
  import Detektiv from './lib/modi/Detektiv.svelte';

  const ANSICHTEN = { start: Start, onboarding: Onboarding, heimat: Heimat, sitzung: Sitzung, album: Album, orden: Orden, eltern: Eltern, detektiv: DetektivWahl, detektivSuche: Detektiv };
  const Aktuell = $derived(ANSICHTEN[router.ansicht] ?? Start);
</script>

{#key router.schritt}
  <main class="rahmen" in:fade={{ duration: 220 }}>
    <Aktuell {...router.params} />
  </main>
{/key}

<!-- Nur im Hochformat sichtbar: iOS ignoriert die Manifest-Ausrichtung, die Layouts sind fürs Querformat gebaut. -->
<div class="drehen" role="alert" aria-label="Bitte das Gerät ins Querformat drehen">
  <svg viewBox="0 0 200 200" width="220" height="220" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">
    <g class="geraet">
      <rect x="62" y="30" width="76" height="120" rx="14" fill="var(--weiss)" />
      <circle cx="100" cy="134" r="5" fill="currentColor" stroke="none" />
    </g>
    <path d="M40 150a70 70 0 0 0 70 34" /><path d="M96 170l14 14-16 10" />
  </svg>
  <p>Bitte quer halten</p>
</div>

<style>
  .rahmen { position: absolute; inset: 0; }
  .drehen { display: none; }
  @media (orientation: portrait) {
    .drehen {
      position: fixed; inset: 0; z-index: 100;
      display: grid; place-content: center; justify-items: center; gap: 12px;
      background: linear-gradient(180deg, var(--himmel) 0%, var(--meer) 100%);
      color: var(--tinte);
    }
    .drehen p { margin: 0; font-size: 22px; font-weight: 800; color: var(--weiss); opacity: 0.85; }
    .geraet { transform-origin: 100px 90px; animation: kippen 2.4s var(--weich) infinite; }
    @keyframes kippen {
      0%, 25% { transform: rotate(0deg); }
      60%, 100% { transform: rotate(-90deg); }
    }
  }
  @media (orientation: portrait) and (prefers-reduced-motion: reduce) {
    .geraet { animation: none; transform: rotate(-90deg); }
  }
</style>
