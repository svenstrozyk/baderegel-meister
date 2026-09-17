<!-- Regelbild: klare Illustration einer Regel (ersetzt Emoji-Symbole). Füllt den Elterncontainer. -->
<script>
  import { kurzVon } from '../state/app.svelte.js';

  let { regelId, grau = false } = $props();
  const regel = $derived(kurzVon(regelId));
</script>

<img class="regelbild" class:grau src={regel?.regelbild} alt="" draggable="false" />

<style>
  .regelbild { width: 100%; height: 100%; object-fit: cover; display: block; border-radius: inherit; pointer-events: none; }
  .grau { filter: grayscale(1) opacity(0.55); }
</style>
