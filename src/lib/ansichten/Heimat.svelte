<!-- Heimat: Partner-Monster groß mit „Heute dran“-Knopf als Hauptaktion, Insel-Karte mit Regeln, Album/Orden. -->
<script>
  import Piktogramm from '../ui/Piktogramm.svelte';
  import ZielAnzeige from '../ui/ZielAnzeige.svelte';
  import Wasser from '../ui/Wasser.svelte';
  import Knopf from '../ui/Knopf.svelte';
  import Icon from '../ui/Icon.svelte';
  import ElternGate from '../ui/ElternGate.svelte';
  import Partner from '../ui/Partner.svelte';
  import Feier from '../ui/Feier.svelte';
  import { spiele, sprich, warte, pfad } from '../audio.js';
  import { gehe } from '../router.svelte.js';
  import { app, ALLE_REGELN, VERFUEGBAR, monsterStufe, vorschlag } from '../state/app.svelte.js';
  import { hatOrden } from '../state/fortschritt.js';

  let { begruessen = false } = $props();

  let breite = $state(1180);
  let hoehe = $state(820);
  let pose = $state('winken');
  let wackelt = $state(null);
  let feier = $state(null);

  const heuteId = $derived(vorschlag());
  const monsterGroesse = $derived(Math.min(340, breite * 0.27, hoehe * 0.42));

  // Inselpositionen (Prozent): obere Reihe links→rechts, untere rechts→links – ein Bootsweg.
  const POS = [[11, 24], [30, 17], [50, 26], [70, 17], [89, 26], [88, 72], [68, 80], [49, 70], [30, 80], [11, 71]];
  const weg = 'M11 24 C20 10 24 12 30 17 S42 32 50 26 S62 8 70 17 S84 32 89 26 C104 44 102 58 88 72 S74 90 68 80 S56 62 49 70 S36 92 30 80 S18 62 11 71';

  $effect(() => {
    let lebt = true;
    (async () => {
      await warte(750);
      if (!lebt) return;
      if (monsterStufe() > app.gesehenEntwicklung) {
        feier = { von: app.gesehenEntwicklung, zu: monsterStufe() };
        return;
      }
      await ansage();
      pose = 'zeigen';
    })();
    return () => (lebt = false);
  });

  const ansage = () => spiele(pfad.app(begruessen ? 'willkommen' : 'heute-dran'));

  function insel(r) {
    if (VERFUEGBAR.includes(r.id)) {
      gehe('sitzung', { regelId: r.id });
    } else {
      wackelt = r.id;
      setTimeout(() => wackelt === r.id && (wackelt = null), 600);
      spiele(pfad.app('bald'));
    }
  }

  function monsterTippen() {
    pose = 'winken';
    sprich(`Hallo, ich bin ${app.profil.name}!`);
  }
</script>

<svelte:window bind:innerWidth={breite} bind:innerHeight={hoehe} />

<Wasser hoehe={22} sonne={false} ruhig />
<section class="ansicht heimat">
  <header class="leiste">
    <Knopf label="Nochmal anhören" farbe="weiss" groesse={88} onclick={ansage}><Icon name="lautsprecher" /></Knopf>
    <div class="rechts">
      <Knopf label="Detektiv" farbe="koralle" groesse={112} onclick={() => gehe('detektiv')}><Icon name="lupe" groesse={62} fuellung="#c9f0ff" /></Knopf>
      <Knopf label="Album" farbe="weiss" groesse={100} onclick={() => gehe('album')}><Icon name="album" groesse={54} /></Knopf>
      <Knopf label="Orden" farbe="sonne" groesse={100} onclick={() => gehe('orden')}><Icon name="orden" groesse={54} /></Knopf>
      <!-- Eltern-Gate bewusst klein, blass und abseits der Kinder-Knöpfe -->
      <span class="gate"><ElternGate groesse={60} icon="zahnrad" onoffen={() => gehe('eltern')} label="Elternbereich: 3 Sekunden gedrückt halten" /></span>
    </div>
  </header>

  <div class="partnerbereich">
    <button type="button" class="monsterknopf" aria-label="Monster sagt Hallo" onclick={monsterTippen}>
      <Partner groesse={monsterGroesse} {pose} wippen={false} />
    </button>
    {#if app.profil}<div class="namensschild">{app.profil.name}</div>{/if}
    {#if heuteId != null}
      <div class="los">
        <Knopf label="Heute dran: los geht's" farbe="sonne" groesse={Math.min(132, hoehe * 0.16)} pulsieren onclick={() => gehe('sitzung', { regelId: heuteId })}>
          <Icon name="play" groesse={Math.min(68, hoehe * 0.08)} />
        </Knopf>
      </div>
    {/if}
  </div>

  <nav class="karte" aria-label="Regel-Inseln">
    <svg class="weg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path d={weg} />
    </svg>
    {#each ALLE_REGELN as r, i (r.id)}
      {@const aktiv = VERFUEGBAR.includes(r.id)}
      <button
        type="button"
        class="insel"
        class:aktiv
        class:bald={!aktiv}
        class:heute={r.id === heuteId}
        class:wackelt={wackelt === r.id}
        style:left="{POS[i][0]}%"
        style:top="{POS[i][1]}%"
        aria-label="{r.kurz}{aktiv ? '' : ' (bald)'}"
        onclick={() => insel(r)}
      >
        {#if r.id === heuteId}<span class="boje" aria-hidden="true"></span>{/if}
        <span class="sandberg">
          <span class="symbol"><Piktogramm regelId={r.id} grau={!aktiv} groesse={200} /></span>
        </span>
        {#if aktiv}
          <span class="ziele"><ZielAnzeige regelId={r.id} groesse={22} abstand={3} /></span>
        {/if}
        {#if hatOrden(app.fortschritt, r.id, { testmodus: app.einstellungen.testmodus })}
          <span class="medaille" aria-hidden="true"><Icon name="stern" groesse={30} farbe="#10243a" /></span>
        {/if}
        {#if !aktiv}<span class="wolke" aria-hidden="true"><Icon name="schloss" groesse={24} /></span>{/if}
      </button>
    {/each}
  </nav>
</section>

{#if feier}
  <Feier von={feier.von} zu={feier.zu} onfertig={() => { app.gesehenEntwicklung = feier.zu; feier = null; }} />
{/if}

<style>
  .heimat {
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(260px, 32%) 1fr;
    grid-template-rows: auto 1fr;
    column-gap: 2vw;
  }
  .leiste { grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; }
  .rechts { display: flex; gap: 20px; align-items: center; }
  .gate { margin-left: 28px; opacity: 0.55; }
  .los { margin-top: 10px; }

  .partnerbereich { display: grid; justify-items: center; align-content: center; gap: 8px; padding-bottom: 6vh; }
  .monsterknopf { background: none; border: 0; padding: 0; cursor: pointer; }
  .namensschild {
    font-size: clamp(26px, 3vw, 38px);
    background: var(--weiss);
    border: var(--linie) solid var(--tinte);
    box-shadow: 0 5px 0 var(--tinte);
    border-radius: 999px;
    padding: 6px 26px;
    transform: rotate(-2deg);
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .karte {
    position: relative;
    margin: 1vh 0 3vh;
    border: var(--linie) solid var(--tinte);
    border-radius: 40px;
    box-shadow: var(--schatten);
    background:
      radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.25) 0 6%, transparent 7%),
      radial-gradient(circle at 75% 60%, rgba(255, 255, 255, 0.18) 0 5%, transparent 6%),
      linear-gradient(160deg, #4fc0f0, #1f8fd6 60%, var(--meer));
    overflow: hidden;
    min-height: 0;
  }
  .weg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .weg path { fill: none; stroke: var(--weiss); stroke-width: 5; stroke-dasharray: 2 14; stroke-linecap: round; vector-effect: non-scaling-stroke; opacity: 0.85; }

  .insel {
    --d: clamp(92px, 11.5vw, 128px);
    position: absolute;
    width: var(--d);
    height: var(--d);
    translate: -50% -50%;
    background: none;
    border: 0;
    padding: 0;
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: transform 0.2s var(--weich);
  }
  .insel:active { transform: scale(0.94); }
  .sandberg {
    width: 100%;
    height: 100%;
    border-radius: 48% 52% 45% 55% / 55% 48% 52% 45%;
    background: radial-gradient(circle at 50% 38%, #8ee06a 0 34%, var(--sand) 35%);
    border: var(--linie) solid var(--tinte);
    box-shadow: 0 6px 0 var(--tinte), 0 0 0 10px rgba(255, 255, 255, 0.35);
    display: grid;
    place-items: center;
  }
  .symbol {
    width: 82%; aspect-ratio: 1; border-radius: 50%; overflow: hidden;
    border: 3px solid var(--tinte);
  }
  .symbol :global(svg) { width: 100%; height: 100%; display: block; }
  .bald .sandberg { background: #cfdbe3; filter: saturate(0.2); box-shadow: 0 6px 0 rgba(16, 36, 58, 0.5); border-color: rgba(16, 36, 58, 0.55); }

  .wolke {
    position: absolute; right: -2px; bottom: 4px;
    width: 38px; height: 38px; border-radius: 50%;
    background: var(--weiss); border: 3px solid var(--tinte);
    display: grid; place-items: center;
  }
  .ziele {
    position: absolute; bottom: -16px; line-height: 0;
    background: var(--weiss); border: 3px solid var(--tinte); border-radius: 999px; padding: 3px 6px;
  }
  .medaille {
    position: absolute; top: -8px; right: -8px;
    width: 46px; height: 46px; border-radius: 50%;
    background: var(--sonne); border: 4px solid var(--tinte);
    display: grid; place-items: center;
  }
  .heute { z-index: 2; }
  .heute .sandberg {
    box-shadow: 0 6px 0 var(--tinte), 0 0 0 12px var(--sonne), 0 0 0 17px var(--tinte);
  }
  .boje {
    position: absolute;
    top: -46px;
    width: 0; height: 0;
    border-left: 22px solid transparent;
    border-right: 22px solid transparent;
    border-top: 30px solid var(--koralle);
    filter: drop-shadow(0 -4px 0 var(--tinte)) drop-shadow(0 4px 0 var(--tinte));
  }
  .wackelt { animation: wackeln 0.3s ease-in-out 2; }
</style>
