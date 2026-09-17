<!--
  „Welche Regel?“ (Kennen): Rätsel-Audio, 3 Regelbilder in der gemeinsamen BildAuswahl.
  hilft: Anschlussfrage nach einer „Daumen runter“-Situation („Welche Regel hilft hier?“) – gehört zum Einschätzen,
  damit Raten beim Daumen allein nicht reicht.
-->
<script>
  import { untrack } from 'svelte';
  import BildAuswahl from '../ui/BildAuswahl.svelte';
  import { pfad } from '../audio.js';
  import { ALLE_REGELN } from '../state/app.svelte.js';
  import { mischen, eins } from '../zufall.js';

  let { regel, wiederholung = false, hilft = false, onfertig } = $props();

  const r = untrack(() => regel);
  const nochmal = untrack(() => wiederholung);
  const optionen = mischen([
    ALLE_REGELN.find((a) => a.id === r.id),
    ...mischen(ALLE_REGELN.filter((a) => a.id !== r.id)).slice(0, 2),
  ]).map((a) => ({ key: a.id, bild: a.regelbild, audio: pfad.regel(a.ordner, 'merksatz'), richtig: a.id === r.id }));

  const frage = untrack(() =>
    hilft
      ? [pfad.app('welche-regel-hilft')]
      : nochmal
        ? [pfad.regel(r.ordner, 'raetsel')]
        : [pfad.regel(r.ordner, 'raetsel'), pfad.app('welche-regel'), pfad.app('warum-tipp')],
  );
  const falschAudio = untrack(() => [pfad.app(hilft ? 'situation-hinweis' : 'nochmal-hinweis'), pfad.regel(r.ordner, 'merksatz')]);
</script>

<BildAuswahl
  {optionen}
  {frage}
  richtigAudio={[pfad.app(eins(['super', 'genau', 'klasse'])), pfad.regel(r.ordner, 'merksatz')]}
  {falschAudio}
  {onfertig}
/>
