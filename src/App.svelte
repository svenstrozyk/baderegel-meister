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

<style>
  .rahmen { position: absolute; inset: 0; }
</style>
