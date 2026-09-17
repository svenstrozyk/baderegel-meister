<!--
  „Welche Regel?“ (Kennen): links das erste Geschichtenbild als Bild-Frage, Rätsel-Audio („… Welche Regel hilft ihm?“),
  rechts 3 Regelbilder in der gemeinsamen BildAuswahl.
  hilft: Anschlussfrage nach einer „Daumen runter“-Situation. Links dasselbe Situationsbild, Situationssatz + „Welche Regel hilft hier?“.
  Gehört zum Einschätzen, damit Raten beim Daumen allein nicht reicht.
-->
<script>
  import { untrack } from 'svelte';
  import BildAuswahl from '../ui/BildAuswahl.svelte';
  import { pfad } from '../audio.js';
  import { ALLE_REGELN } from '../state/app.svelte.js';
  import { mischen, eins } from '../zufall.js';

  let { regel, wiederholung = false, hilft = false, index = 0, onfertig } = $props();

  const r = untrack(() => regel);
  const nochmal = untrack(() => wiederholung);
  const optionen = mischen([
    ALLE_REGELN.find((a) => a.id === r.id),
    ...mischen(ALLE_REGELN.filter((a) => a.id !== r.id)).slice(0, 2),
  ]).map((a) => ({ key: a.id, bild: a.regelbild, audio: pfad.regel(a.ordner, 'merksatz'), richtig: a.id === r.id }));

  const nr = untrack(() => index + 1);
  // Das Rätsel enthält die Frage selbst; beim ersten Mal folgt der Bedien-Tipp
  const frage = untrack(() =>
    hilft
      ? [pfad.regel(r.ordner, `situation-${nr}`), pfad.app('welche-regel-hilft')]
      : nochmal
        ? [pfad.regel(r.ordner, 'raetsel')]
        : [pfad.regel(r.ordner, 'raetsel'), pfad.app('warum-tipp')],
  );
  const kontext = untrack(() => pfad.bild(r.ordner, hilft ? `situation-${nr}` : 'geschichte-1'));
  const falschAudio = untrack(() => [pfad.app(hilft ? 'situation-hinweis' : 'nochmal-hinweis'), pfad.regel(r.ordner, 'merksatz')]);
</script>

<BildAuswahl
  {optionen}
  {frage}
  richtigAudio={[pfad.app(eins(['super', 'genau', 'klasse'])), pfad.regel(r.ordner, 'merksatz')]}
  {falschAudio}
  {kontext}
  {onfertig}
/>
