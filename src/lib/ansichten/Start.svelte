<!-- Startbildschirm: großer „Los geht's“-Knopf entsperrt Audio (iOS). -->
<script>
  import Wasser from '../ui/Wasser.svelte';
  import Knopf from '../ui/Knopf.svelte';
  import Icon from '../ui/Icon.svelte';
  import Monster from '../monster/Monster.svelte';
  import Partner from '../ui/Partner.svelte';
  import { entsperren } from '../audio.js';
  import { gehe } from '../router.svelte.js';
  import { app, MONSTER } from '../state/app.svelte.js';

  let hoehe = $state(820);

  function los() {
    gehe(app.profil ? 'heimat' : 'onboarding', app.profil ? { begruessen: true } : {});
    entsperren();
  }
</script>

<svelte:window bind:innerHeight={hoehe} />

<Wasser hoehe={30} />
<section class="ansicht start">
  <h1 class="logo">
    <span class="z1">Baderegel</span>
    <span class="z2">Meister</span>
  </h1>

  <div class="figuren">
    {#if app.profil}
      <Partner groesse={Math.min(260, hoehe * 0.3)} pose="winken" />
    {:else}
      {#each MONSTER.monster as m, i}
        <div class="fig" style:--i={i}><Monster art={m.id} farbe={['meerblau', 'tuerkis', 'sonnengelb', 'korallenrot', 'lila'][i]} pose="winken" groesse={Math.min(130, hoehe * 0.16)} /></div>
      {/each}
    {/if}
  </div>

  <Knopf label="Los geht's" farbe="sonne" groesse={132} rund={false} pulsieren onclick={los}>
    <Icon name="play" groesse={62} />
    <span class="los">Los geht's!</span>
  </Knopf>
</section>

<style>
  .start {
    z-index: 1;
    display: grid;
    grid-template-rows: auto 1fr auto;
    justify-items: center;
    align-items: center;
    padding-bottom: calc(var(--rand-u) + 4vh);
  }
  .logo {
    margin: 2vh 0 0;
    text-align: center;
    line-height: 0.85;
    font-weight: 900;
    letter-spacing: -0.02em;
    transform: rotate(-3deg);
  }
  .logo span {
    display: block;
    color: var(--weiss);
    -webkit-text-stroke: calc(9px * var(--skala)) var(--tinte);
    paint-order: stroke fill;
    text-shadow: 0 calc(8px * var(--skala)) 0 var(--tinte);
  }
  .z1 { font-size: clamp(34px, min(8.5vw, 12.5vh), 104px); }
  .z2 { font-size: clamp(44px, min(11vw, 16.5vh), 136px); color: var(--sonne) !important; }
  .figuren { display: flex; align-items: flex-end; gap: 1vw; min-height: 0; }
  .fig { animation: wippen 2.6s ease-in-out infinite; animation-delay: calc(var(--i) * -0.5s); }
  /* nur die mittlere Figur animieren – die anderen als Standbild (Rechenzeit) */
  .fig:not(:nth-child(3)) { animation: none; }
  .fig:not(:nth-child(3)) :global(svg *) { animation-play-state: paused; }
  .los { font-size: max(26px, calc(44px * var(--skala))); padding-right: 8px; }
</style>
