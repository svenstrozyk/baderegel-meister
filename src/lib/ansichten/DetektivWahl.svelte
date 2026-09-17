<!-- Detektiv: Szenenwahl – 3 große Vorschaubilder, gesperrte grau mit Schloss, gelöste mit Stern. -->
<script>
  import Knopf from '../ui/Knopf.svelte';
  import Icon from '../ui/Icon.svelte';
  import Partner from '../ui/Partner.svelte';
  import { spiele, warte, pfad } from '../audio.js';
  import { gehe } from '../router.svelte.js';
  import { app, DETEKTIV } from '../state/app.svelte.js';
  import { szeneSpielbar, szeneGeloest } from '../state/detektiv.js';

  let fehlt = $state({}); // Bilder, die nicht geladen werden konnten
  let wackelt = $state(null);
  let hoehe = $state(820);

  $effect(() => {
    let lebt = true;
    warte(500).then(() => lebt && spiele(pfad.app('detektiv-wahl')));
    return () => (lebt = false);
  });

  function waehle(s, spielbar) {
    if (spielbar) return gehe('detektivSuche', { szeneId: s.id });
    wackelt = s.id;
    setTimeout(() => wackelt === s.id && (wackelt = null), 600);
    spiele(pfad.app('bald'));
  }
</script>

<svelte:window bind:innerHeight={hoehe} />

<section class="ansicht wahl">
  <header class="leiste">
    <Knopf label="Nach Hause" farbe="weiss" groesse={96} onclick={() => gehe('heimat')}><Icon name="haus" groesse={50} /></Knopf>
    <div class="abzeichen" aria-hidden="true"><Icon name="lupe" groesse={64} fuellung="#c9f0ff" /></div>
    <Knopf label="Nochmal anhören" farbe="weiss" groesse={96} onclick={() => spiele(pfad.app('detektiv-wahl'))}><Icon name="lautsprecher" /></Knopf>
  </header>

  <div class="szenen">
    {#each DETEKTIV as s, i (s.id)}
      {@const spielbar = szeneSpielbar(s, s.bildVorhanden && !fehlt[s.id])}
      {@const geloest = szeneGeloest(app.fortschritt, s.id)}
      <button
        type="button"
        class="szene"
        class:gesperrt={!spielbar}
        class:wackelt={wackelt === s.id}
        style:--i={i}
        aria-label="Suchbild {s.id}{spielbar ? '' : ' (bald)'}{geloest ? ', gelöst' : ''}"
        onclick={() => waehle(s, spielbar)}
      >
        {#if s.bildVorhanden && !fehlt[s.id]}
          <img src={s.bild} alt="" draggable="false" onerror={() => (fehlt = { ...fehlt, [s.id]: true })} />
        {:else}
          <span class="platzhalter"></span>
        {/if}
        {#if !spielbar}
          <span class="schloss" aria-hidden="true"><Icon name="schloss" groesse={40} /></span>
        {:else if geloest}
          <span class="geloest" aria-hidden="true"><Icon name="stern" groesse={48} farbe="#10243a" /></span>
        {/if}
      </button>
    {/each}
  </div>

  <div class="monster"><Partner groesse={Math.min(170, hoehe * 0.21)} pose="zeigen" /></div>
</section>

<style>
  .wahl {
    background:
      radial-gradient(circle at 50% 40%, #fff 0 10%, transparent 45%),
      linear-gradient(180deg, var(--himmel) 0%, var(--himmel-hell) 100%);
    display: grid;
    grid-template-rows: auto 1fr;
  }
  .leiste { display: flex; justify-content: space-between; align-items: center; }
  .abzeichen {
    width: calc(110px * var(--skala)); height: calc(110px * var(--skala)); border-radius: 50%;
    background: var(--sonne); border: var(--linie) solid var(--tinte); box-shadow: var(--schatten);
    display: grid; place-items: center; transform: rotate(-8deg);
  }
  .szenen {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: clamp(18px, 2.4vw, 32px);
    align-content: center;
    padding-bottom: 12vh;
  }
  .szene {
    position: relative; padding: 0; cursor: pointer;
    aspect-ratio: 3 / 2; width: 100%;
    border-radius: calc(28px * var(--skala)); border: max(4px, calc(6px * var(--skala))) solid var(--tinte); box-shadow: 0 calc(10px * var(--skala)) 0 var(--tinte);
    background: var(--weiss); overflow: visible;
    animation: hereinploppen 0.45s var(--weich) backwards;
    animation-delay: calc(var(--i) * 90ms);
    transition: transform 0.2s var(--weich);
  }
  .szene:active { transform: translateY(6px); box-shadow: 0 4px 0 var(--tinte); }
  .szene img, .platzhalter { width: 100%; height: 100%; object-fit: cover; display: block; border-radius: calc(22px * var(--skala)); }
  .platzhalter { background: repeating-linear-gradient(135deg, #dfe8ee 0 18px, #eef3f6 18px 36px); }
  .gesperrt img { filter: grayscale(1) brightness(1.1) opacity(0.5); }
  .gesperrt { box-shadow: 0 10px 0 rgba(16, 36, 58, 0.5); }
  .schloss, .geloest {
    position: absolute; right: calc(-18px * var(--skala)); top: calc(-18px * var(--skala));
    width: max(40px, calc(84px * var(--skala))); height: max(40px, calc(84px * var(--skala))); border-radius: 50%;
    border: var(--linie) solid var(--tinte); box-shadow: 0 5px 0 var(--tinte);
    display: grid; place-items: center;
  }
  .schloss { background: var(--weiss); }
  .geloest { background: var(--sonne); }
  .wackelt { animation: wackeln 0.3s ease-in-out 2; }
  .abzeichen :global(svg), .schloss :global(svg), .geloest :global(svg) { max-width: 60%; max-height: 60%; }
  .monster { position: absolute; left: var(--rand-l); bottom: var(--rand-u); pointer-events: none; }
</style>
