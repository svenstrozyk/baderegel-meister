<!-- „Warum?“ (Verstehen): Frage-Audio, 3 Antwortbilder in der gemeinsamen BildAuswahl. -->
<script>
  import { untrack } from 'svelte';
  import BildAuswahl from '../ui/BildAuswahl.svelte';
  import { pfad } from '../audio.js';
  import { mischen } from '../zufall.js';

  let { regel, wiederholung = false, onfertig } = $props();

  const r = untrack(() => regel);
  const nochmal = untrack(() => wiederholung);
  const audio = (s) => pfad.regel(r.ordner, s);
  const optionen = mischen(
    r.warum_frage.antworten.map((a, i) => ({ key: i + 1, bild: pfad.bild(r.ordner, `warum-${i + 1}`), audio: audio(`warum-${i + 1}`), richtig: a.richtig })),
  );
</script>

<BildAuswahl
  {optionen}
  frage={nochmal ? [audio('warum-frage')] : [audio('warum-frage'), pfad.app('warum-tipp')]}
  richtigAudio={[audio('warum-feedback')]}
  falschAudio={[pfad.app('warum-hinweis'), audio('warum-feedback')]}
  {onfertig}
/>
