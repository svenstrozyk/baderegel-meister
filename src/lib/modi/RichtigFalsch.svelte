<!-- Modus B „Richtig oder falsch?“ (Einschätzen): Situationsbild + Audio, Daumen hoch / Daumen runter. -->
<script>
  import { untrack } from 'svelte';
  import Knopf from '../ui/Knopf.svelte';
  import Icon from '../ui/Icon.svelte';
  import Partner from '../ui/Partner.svelte';
  import { spiele, spieleFolge, warte, pfad } from '../audio.js';
  import { eins } from '../zufall.js';

  let { regel, index, mitFrage = false, onfertig } = $props();

  const situation = untrack(() => regel.situationen[index]);
  const audio = (s) => pfad.regel(regel.ordner, s);
  let antwort = $state(null); // true = Daumen hoch, false = runter
  let fertigKnopf = $state(false);
  let spricht = $state(false); // Rückmeldung läuft – Lautsprecher gesperrt, damit die Erklärung nicht abbricht
  let lebt = true;

  const frageAudio = () => spieleFolge(mitFrage ? [audio(`situation-${index + 1}`), pfad.app('daumen-frage')] : [audio(`situation-${index + 1}`)]);
  function frage() {
    if (spricht) return;
    // Nach falscher Antwort wiederholt der Lautsprecher die Erklärung
    if (antwort !== null) return spieleFolge([audio(`situation-${index + 1}-feedback`)]);
    return frageAudio();
  }

  $effect(() => {
    warte(450).then(() => lebt && frageAudio());
    return () => (lebt = false);
  });

  async function antworte(daumenHoch) {
    if (antwort !== null) return;
    antwort = daumenHoch;
    const richtig = daumenHoch === situation.richtig;
    spricht = true;
    if (richtig) {
      await spieleFolge([pfad.app(eins(['super', 'genau', 'klasse'])), audio(`situation-${index + 1}-feedback`)]);
      spricht = false;
      if (lebt) {
        await warte(500);
        lebt && onfertig({ richtig: true });
      }
    } else {
      await spieleFolge([pfad.app('situation-hinweis'), audio(`situation-${index + 1}-feedback`)]);
      spricht = false;
      if (lebt) fertigKnopf = true;
    }
  }

  const richtigBeantwortet = $derived(antwort !== null && antwort === situation.richtig);
</script>

<div class="flaeche">
  <div class="bild" class:gut={richtigBeantwortet}>
    <img src={pfad.bild(regel.ordner, `situation-${index + 1}`)} alt="Situation {index + 1}" draggable="false" />
    {#if antwort !== null}
      <div class="stempel" class:hoch={situation.richtig} aria-hidden="true"><Icon name={situation.richtig ? 'daumen-hoch' : 'daumen-runter'} groesse={64} fuellung="#fffdf7" /></div>
    {/if}
  </div>

  <div class="daumen">
    <button type="button" class="daumenknopf hoch" class:gedrueckt={antwort === true} class:leise={antwort === false} aria-label="Daumen hoch: richtig" onclick={() => antworte(true)}><Icon name="daumen-hoch" groesse={110} fuellung="#fffdf7" /></button>
    <button type="button" class="daumenknopf runter" class:gedrueckt={antwort === false} class:leise={antwort === true} aria-label="Daumen runter: nicht okay" onclick={() => antworte(false)}><Icon name="daumen-runter" groesse={110} fuellung="#fffdf7" /></button>
  </div>

  <div class="monster"><Partner groesse={Math.min(170, innerHeight * 0.22)} pose={richtigBeantwortet ? 'jubeln' : 'nachdenken'} /></div>
  <div class="steuerung">
    <Knopf label="Nochmal anhören" farbe="weiss" groesse={96} disabled={spricht || richtigBeantwortet} onclick={frage}><Icon name="lautsprecher" /></Knopf>
    {#if fertigKnopf}
      <Knopf label="Weiter" farbe="sonne" groesse={120} pulsieren onclick={() => onfertig({ richtig: false })}><Icon name="weiter" groesse={60} /></Knopf>
    {/if}
  </div>
</div>

<style>
  .flaeche {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, var(--himmel) 0%, var(--himmel-hell) 100%);
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: clamp(20px, 3vw, 44px);
    padding: calc(var(--rand-o) + var(--kopf)) var(--rand-r) calc(var(--rand-u) + var(--fuss)) var(--rand-l);
  }
  .bild {
    position: relative; justify-self: center;
    width: 100%; max-height: 100%; aspect-ratio: 3 / 2;
    border-radius: calc(32px * var(--skala)); border: max(4px, calc(6px * var(--skala))) solid var(--tinte); box-shadow: 0 calc(10px * var(--skala)) 0 var(--tinte);
    overflow: hidden; background: var(--tinte);
    transition: box-shadow 0.3s;
  }
  .bild.gut { box-shadow: 0 calc(10px * var(--skala)) 0 var(--tinte), 0 0 0 calc(16px * var(--skala)) var(--sonne); }
  .bild img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .stempel {
    position: absolute; right: calc(16px * var(--skala)); top: calc(16px * var(--skala));
    width: calc(110px * var(--skala)); height: calc(110px * var(--skala)); border-radius: 50%;
    display: grid; place-items: center; font-size: 64px;
    background: var(--orange); border: var(--linie) solid var(--tinte); box-shadow: var(--schatten);
    animation: hereinploppen 0.4s var(--weich) both;
  }
  .stempel.hoch { background: var(--gras); }
  .daumen { display: grid; gap: clamp(14px, 4vh, 40px); }
  .daumenknopf {
    --d: clamp(64px, min(17vw, calc((100dvh - var(--rand-o) - var(--rand-u) - var(--kopf) - var(--fuss)) / 2 - 12px)), 200px);
    width: var(--d); height: var(--d);
    border-radius: 50%;
    border: max(4px, calc(7px * var(--skala))) solid var(--tinte); box-shadow: 0 calc(10px * var(--skala)) 0 var(--tinte);
    font-size: clamp(80px, 9vw, 110px); line-height: 1;
    cursor: pointer; display: grid; place-items: center; padding: 0;
    transition: transform 0.2s var(--weich), opacity 0.3s;
  }
  .daumenknopf:active { transform: translateY(6px); box-shadow: 0 4px 0 var(--tinte); }
  .daumenknopf :global(svg), .stempel :global(svg) { width: 60%; height: auto; }
  .hoch { background: var(--gras); }
  .runter { background: var(--orange); }
  .gedrueckt { transform: scale(1.08); outline: 8px solid var(--weiss); outline-offset: 2px; }
  .leise { opacity: 0.35; transform: scale(0.9); }
  .monster { position: absolute; left: var(--rand-l); bottom: var(--rand-u); }
  .steuerung { position: absolute; right: var(--rand-r); bottom: var(--rand-u); display: flex; gap: max(10px, calc(20px * var(--skala))); align-items: flex-end; }
</style>
