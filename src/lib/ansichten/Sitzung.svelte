<!--
  Sitzung für eine Regel (≤ ~7 min):
  Geschichte (erstes Mal) bzw. kurze Erinnerung → Welche Regel? → Warum? → 3× Richtig oder falsch?
  (nach jeder „Daumen runter“-Situation: „Welche Regel hilft hier?“) → 1 gemischte Situation einer früheren Regel → Trainer → Ende
  Falsche Antworten: freundlicher Hinweis, Kennen/Warum/Situation wird später (vor dem Trainer) noch einmal gestellt – ohne Wertung.
  Nur der erste Versuch zählt für den Lernfortschritt.
  Einschätzen gilt für den Tag, wenn bei den Situationen + Anschlussfragen höchstens ein Fehler passiert ist.
  Die gemischte Situation dient nur der Wiederholung und zählt nicht.
  Haus-Knopf: Rückfrage („Weiterspielen?“). Wurde schon etwas erreicht, geht es über den Ende-Bildschirm nach Hause (Feier/Orden gehen nicht verloren).
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
  import { spiele, stoppe, pfad } from '../audio.js';
  import { gehe } from '../router.svelte.js';
  import { app, REGELN, regelVon, heute, aktuelleBilanz } from '../state/app.svelte.js';
  import { meldeErfolg, markiereGeschichte, vergleich } from '../state/fortschritt.js';
  import { eins } from '../zufall.js';

  const MAX_EINSCHAETZEN_FEHLER = 1;

  let props = $props();
  const regelId = untrack(() => props.regelId);
  const regel = regelVon(regelId);
  const vorher = aktuelleBilanz();
  // Datum einmal festhalten: eine Sitzung über Mitternacht zählt komplett für den Starttag
  const datum = heute();
  const ersteMal = !app.fortschritt.regeln[regelId]?.geschichteGesehen;

  // Wiederholung einer früheren Regel (nur Regeln, deren Geschichte das Kind schon kennt)
  const frueher = REGELN.filter((r) => r.id !== regelId && app.fortschritt.regeln[r.id]?.geschichteGesehen);
  const mischRegel = frueher.length ? eins(frueher) : null;

  let aufgaben = $state([
    { typ: ersteMal ? 'geschichte' : 'erinnerung' },
    { typ: 'kennen' },
    { typ: 'warum' },
    ...regel.situationen.flatMap((s, index) => (s.richtig ? [{ typ: 'situation', index }] : [{ typ: 'situation', index }, { typ: 'hilft', index }])),
    ...(mischRegel ? [{ typ: 'misch', regelId: mischRegel.id, index: Math.floor(Math.random() * mischRegel.situationen.length) }] : []),
    { typ: 'trainer' },
    { typ: 'ende' },
  ]);
  let pos = $state(0);
  let hausFrage = $state(false);
  const einschaetzenGesamt = untrack(() => aufgaben.filter((a) => a.typ === 'situation' || a.typ === 'hilft').length);
  let einschaetzenBeantwortet = 0;
  let einschaetzenFehler = 0;
  const aktuell = $derived(aufgaben[pos]);

  function melde(teil) {
    app.fortschritt = meldeErfolg(app.fortschritt, regelId, teil, datum);
  }

  function fertig(ergebnis = {}) {
    stoppe();
    const a = aufgaben[pos];
    const erster = !a.wiederholung;

    if (a.typ === 'geschichte') app.fortschritt = markiereGeschichte(app.fortschritt, regelId);
    if (erster && a.typ === 'kennen' && ergebnis.richtig) melde('kennen');
    if (erster && a.typ === 'warum' && ergebnis.richtig) melde('warum');
    if (erster && (a.typ === 'situation' || a.typ === 'hilft')) {
      einschaetzenBeantwortet++;
      if (!ergebnis.richtig) einschaetzenFehler++;
      if (einschaetzenBeantwortet === einschaetzenGesamt && einschaetzenFehler <= MAX_EINSCHAETZEN_FEHLER) melde('situationen');
    }
    if (a.typ === 'trainer' && ergebnis.richtig) melde('trainer');

    if (ergebnis.richtig === false && ['kennen', 'warum', 'situation'].includes(a.typ) && erster) {
      const trainerPos = aufgaben.findIndex((x) => x.typ === 'trainer');
      aufgaben.splice(trainerPos, 0, { ...a, wiederholung: true });
    }
    pos = Math.min(pos + 1, aufgaben.length - 1);
  }

  function hausTippen() {
    hausFrage = true;
    spiele(pfad.app('weiterspielen'));
  }

  function weiterspielen() {
    stoppe();
    hausFrage = false;
  }

  function nachHause() {
    stoppe();
    hausFrage = false;
    const diff = vergleich(vorher, aktuelleBilanz());
    // Schon etwas geschafft? Dann erst feiern (Ende-Bildschirm vergibt auch Überraschungskarten).
    if (diff.geaenderteZiele.length || diff.neueStufen.length) pos = aufgaben.length - 1;
    else gehe('heimat');
  }
</script>

<section class="sitzung">
  {#key pos}
    <div class="modus">
      {#if aktuell.typ === 'geschichte' || aktuell.typ === 'erinnerung'}
        <Geschichte {regel} nurMerksatz={aktuell.typ === 'erinnerung'} onfertig={fertig} />
      {:else if aktuell.typ === 'kennen'}
        <WelcheRegel {regel} wiederholung={!!aktuell.wiederholung} onfertig={fertig} />
      {:else if aktuell.typ === 'hilft'}
        <WelcheRegel {regel} hilft index={aktuell.index} onfertig={fertig} />
      {:else if aktuell.typ === 'misch'}
        <RichtigFalsch regel={regelVon(aktuell.regelId)} index={aktuell.index} mitFrage onfertig={fertig} />
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
      <Knopf label="Nach Hause" farbe="weiss" groesse={88} onclick={hausTippen}><Icon name="haus" groesse={46} /></Knopf>
      <ol class="perlen" aria-label="Fortschritt der Sitzung">
        {#each aufgaben.slice(0, -1) as a, i}
          <li class:fertig={i < pos} class:jetzt={i === pos}><span class="nur-sr">{a.typ}</span></li>
        {/each}
      </ol>
    </header>
  {/if}

  {#if hausFrage}
    <div class="hausfrage" role="dialog" aria-modal="true" aria-label="Weiterspielen?">
      <Knopf label="Weiterspielen" farbe="sonne" groesse={180} pulsieren onclick={weiterspielen}><Icon name="play" groesse={96} /></Knopf>
      <Knopf label="Nach Hause" farbe="weiss" groesse={88} onclick={nachHause}><Icon name="haus" groesse={46} /></Knopf>
    </div>
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
    gap: max(10px, calc(20px * var(--skala)));
    pointer-events: none;
    z-index: 10;
  }
  .leiste :global(button) { pointer-events: auto; }
  .perlen {
    display: flex; gap: 8px; margin: 0; padding: 8px 14px; list-style: none;
    background: rgba(255, 253, 247, 0.85); border: 3px solid var(--tinte); border-radius: 999px;
  }
  .perlen li { width: max(12px, calc(18px * var(--skala))); height: max(12px, calc(18px * var(--skala))); border-radius: 50%; border: 3px solid var(--tinte); background: var(--weiss); transition: background 0.3s, transform 0.3s; }
  .perlen li.fertig { background: var(--sonne); }
  .hausfrage {
    position: absolute; inset: 0; z-index: 20;
    background: rgba(16, 36, 58, 0.55);
    display: flex; align-items: center; justify-content: center; gap: calc(72px * var(--skala));
  }
  .perlen li.jetzt { background: var(--himmel); transform: scale(1.3); }
</style>
