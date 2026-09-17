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

  function los() {
    gehe(app.profil ? 'heimat' : 'onboarding', app.profil ? { begruessen: true } : {});
    entsperren();
  }
</script>

<Wasser hoehe={30} />
<section class="ansicht start">
  <h1 class="logo">
    <span class="z1">Baderegel</span>
    <span class="z2">Meister</span>
  </h1>

  <div class="figuren">
    {#if app.profil}
      <Partner groesse={260} pose="winken" />
    {:else}
      {#each MONSTER.monster as m, i}
        <div class="fig" style:--i={i}><Monster art={m.id} farbe={['meerblau', 'tuerkis', 'sonnengelb', 'korallenrot', 'lila'][i]} pose="winken" groesse={130} /></div>
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
    padding-bottom: calc(var(--rand-u) + 5vh);
  }
  .logo {
    margin: 3vh 0 0;
    text-align: center;
    line-height: 0.85;
    font-weight: 900;
    letter-spacing: -0.02em;
    transform: rotate(-3deg);
  }
  .logo span {
    display: block;
    color: var(--weiss);
    -webkit-text-stroke: 9px var(--tinte);
    paint-order: stroke fill;
    text-shadow: 0 8px 0 var(--tinte);
  }
  .z1 { font-size: clamp(56px, 8.5vw, 104px); }
  .z2 { font-size: clamp(72px, 11vw, 136px); color: var(--sonne) !important; }
  .figuren { display: flex; align-items: flex-end; gap: 1vw; }
  .fig { animation: wippen 2.6s ease-in-out infinite; animation-delay: calc(var(--i) * -0.5s); }
  .los { font-size: 44px; padding-right: 8px; }
</style>
