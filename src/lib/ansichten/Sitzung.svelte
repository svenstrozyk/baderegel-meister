<!--
  Sitzung für eine Regel (≤ ~7 min):
  Geschichte (erstes Mal) bzw. kurze Erinnerung → Welche Regel? → Warum? → 3× Richtig oder falsch? → Trainer → Ende
  Falsche Antworten: freundlicher Hinweis, Aufgabe wird später (vor dem Trainer) noch einmal gestellt – ohne Wertung.
  Nur der erste Versuch zählt für den Lernfortschritt.
-->
<script>
  import { untrack } from 'svelte';
  import Knopf from '../ui/Knopf.svelte';
  import Icon from '../ui/Icon.svelte';
  import Geschichte from '../modi/Geschichte.svelte';
  import WelcheRegel from '../modi/WelcheRegel.svelte';
  import Warum from '../modi/Warum.svelte';
  import RichtigFalsch from '../modi/RichtigFalsch.svelte';
  import Trainer from '../modi/Trainer.svelte';
  import Ende from '../modi/Ende.svelte';
  import { stoppe } from '../audio.js';
  import { gehe } from '../router.svelte.js';
  import { app, regelVon, heute, aktuelleBilanz } from '../state/app.svelte.js';
  import { meldeErfolg, markiereGeschichte } from '../state/fortschritt.js';

  let props = $props();
  const regelId = untrack(() => props.regelId);
  const regel = regelVon(regelId);
  const vorher = aktuelleBilanz();
  const ersteMal = !app.fortschritt.regeln[regelId]?.geschichteGesehen;

  let aufgaben = $state([
    { typ: ersteMal ? 'geschichte' : 'erinnerung' },
    { typ: 'kennen' },
    { typ: 'warum' },
    ...regel.situationen.map((_, index) => ({ typ: 'situation', index })),
    { typ: 'trainer' },
    { typ: 'ende' },
  ]);
  let pos = $state(0);
  let situationFehler = false;
  let situationenBeantwortet = 0;
  const aktuell = $derived(aufgaben[pos]);

  function melde(teil) {
    app.fortschritt = meldeErfolg(app.fortschritt, regelId, teil, heute());
  }

  function fertig(ergebnis = {}) {
    stoppe();
    const a = aufgaben[pos];
    const erster = !a.wiederholung;

    if (a.typ === 'geschichte') app.fortschritt = markiereGeschichte(app.fortschritt, regelId);
    if (erster && a.typ === 'kennen' && ergebnis.richtig) melde('kennen');
    if (erster && a.typ === 'warum' && ergebnis.richtig) melde('warum');
    if (erster && a.typ === 'situation') {
      situationenBeantwortet++;
      if (!ergebnis.richtig) situationFehler = true;
      if (situationenBeantwortet === regel.situationen.length && !situationFehler) melde('situationen');
    }
    if (a.typ === 'trainer' && ergebnis.richtig) melde('trainer');

    if (ergebnis.richtig === false && ['kennen', 'warum', 'situation'].includes(a.typ) && erster) {
      const trainerPos = aufgaben.findIndex((x) => x.typ === 'trainer');
      aufgaben.splice(trainerPos, 0, { ...a, wiederholung: true });
    }
    pos = Math.min(pos + 1, aufgaben.length - 1);
  }
</script>

<section class="sitzung">
  {#key pos}
    <div class="modus">
      {#if aktuell.typ === 'geschichte' || aktuell.typ === 'erinnerung'}
        <Geschichte {regel} nurMerksatz={aktuell.typ === 'erinnerung'} onfertig={fertig} />
      {:else if aktuell.typ === 'kennen'}
        <WelcheRegel {regel} wiederholung={!!aktuell.wiederholung} onfertig={fertig} />
      {:else if aktuell.typ === 'warum'}
        <Warum {regel} wiederholung={!!aktuell.wiederholung} onfertig={fertig} />
      {:else if aktuell.typ === 'situation'}
        <RichtigFalsch {regel} index={aktuell.index} mitFrage={pos === aufgaben.findIndex((x) => x.typ === 'situation')} onfertig={fertig} />
      {:else if aktuell.typ === 'trainer'}
        <Trainer {regel} onfertig={fertig} />
      {:else}
        <Ende {regel} {vorher} />
      {/if}
    </div>
  {/key}

  {#if aktuell.typ !== 'ende'}
    <header class="leiste">
      <Knopf label="Nach Hause" farbe="weiss" groesse={88} onclick={() => gehe('heimat')}><Icon name="haus" groesse={46} /></Knopf>
      <ol class="perlen" aria-label="Fortschritt der Sitzung">
        {#each aufgaben.slice(0, -1) as a, i}
          <li class:fertig={i < pos} class:jetzt={i === pos}><span class="nur-sr">{a.typ}</span></li>
        {/each}
      </ol>
    </header>
  {/if}
</section>

<style>
  .sitzung { position: absolute; inset: 0; background: var(--himmel-hell); }
  .modus { position: absolute; inset: 0; animation: einblenden 0.35s ease-out both; }
  @keyframes einblenden { from { opacity: 0; transform: translateX(24px) } to { opacity: 1; transform: none } }
  .leiste {
    position: absolute;
    top: var(--rand-o);
    left: var(--rand-l);
    right: var(--rand-r);
    display: flex;
    align-items: center;
    gap: 20px;
    pointer-events: none;
    z-index: 10;
  }
  .leiste :global(button) { pointer-events: auto; }
  .perlen {
    display: flex; gap: 8px; margin: 0; padding: 8px 14px; list-style: none;
    background: rgba(255, 253, 247, 0.85); border: 3px solid var(--tinte); border-radius: 999px;
  }
  .perlen li { width: 18px; height: 18px; border-radius: 50%; border: 3px solid var(--tinte); background: var(--weiss); transition: background 0.3s, transform 0.3s; }
  .perlen li.fertig { background: var(--sonne); }
  .perlen li.jetzt { background: var(--himmel); transform: scale(1.3); }
</style>
