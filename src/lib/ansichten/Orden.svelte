<!-- Orden & Zubehör: Orden pro Regel (Antippen liest den Merksatz), Zubehör nach Orden freigeschaltet, Antippen zieht an/aus (gesperrt: wackelt). -->
<script>
  import Piktogramm from '../ui/Piktogramm.svelte';
  import Knopf from '../ui/Knopf.svelte';
  import Icon from '../ui/Icon.svelte';
  import Partner from '../ui/Partner.svelte';
  import Monster from '../monster/Monster.svelte';
  import Wasser from '../ui/Wasser.svelte';
  import { spiele, sprich, warte, pfad } from '../audio.js';
  import { gehe } from '../router.svelte.js';
  import { app, ALLE_REGELN, REGELN, MONSTER, orden, zubehoerFrei, monsterStufe } from '../state/app.svelte.js';
  import { hatOrden } from '../state/fortschritt.js';

  let pose = $state('stehen');
  let hoehe = $state(820);
  let wackelt = $state(null);

  const ansage = () => spiele(pfad.app('orden'));

  $effect(() => {
    let lebt = true;
    warte(500).then(() => lebt && ansage());
    return () => (lebt = false);
  });

  function medaille(r) {
    const mitAudio = REGELN.find((x) => x.id === r.id);
    if (mitAudio) spiele(pfad.regel(mitAudio.ordner, 'merksatz'));
    else sprich(r.merksatz);
  }

  function umschalten(id) {
    if (!zubehoerFrei().includes(id)) {
      wackelt = id;
      setTimeout(() => wackelt === id && (wackelt = null), 600);
      return;
    }
    if (!app.profil) return;
    const liste = app.profil.zubehoer ?? [];
    app.profil.zubehoer = liste.includes(id) ? liste.filter((z) => z !== id) : [...liste, id];
    pose = 'jubeln';
    setTimeout(() => (pose = 'stehen'), 1500);
  }
</script>

<svelte:window bind:innerHeight={hoehe} />

<Wasser hoehe={18} ruhig sonne={false} />
<section class="ansicht ordenseite">
  <div class="zurueck">
    <Knopf label="Nach Hause" farbe="weiss" groesse={96} onclick={() => gehe('heimat')}><Icon name="haus" groesse={50} /></Knopf>
    <Knopf label="Nochmal anhören" farbe="weiss" groesse={88} onclick={ansage}><Icon name="lautsprecher" /></Knopf>
  </div>

  <div class="monster"><Partner groesse={Math.min(360, hoehe * 0.46)} {pose} /></div>

  <div class="rechts">
    <div class="orden" aria-label="Orden: {orden()} von {ALLE_REGELN.length}">
      {#each ALLE_REGELN as r (r.id)}
        {@const hat = hatOrden(app.fortschritt, r.id, { testmodus: app.einstellungen.testmodus })}
        <button type="button" class="medaille" class:hat aria-label="{r.kurz}{hat ? ': Orden' : ''} – anhören" onclick={() => medaille(r)}>
          <span class="rb"><Piktogramm regelId={r.id} grau={!hat} groesse={120} /></span>
        </button>
      {/each}
    </div>

    <div class="zubehoer">
      {#each MONSTER.gestaltung.zubehoer as z (z.id)}
        {@const frei = zubehoerFrei().includes(z.id)}
        {@const an = app.profil?.zubehoer?.includes(z.id)}
        <button type="button" class="teil" class:frei class:an class:wackelt={wackelt === z.id} aria-disabled={!frei} aria-label="{z.id}{frei ? '' : ` (ab ${z.ab_orden} Orden)`}" aria-pressed={an} onclick={() => umschalten(z.id)}>
          <span class="sym">
            {#if app.profil}
              <Monster art={app.profil.art} farbe={app.profil.farbe} muster={app.profil.muster} stufe={monsterStufe()} zubehoer={[z.id]} pose="stehen" groesse={92} />
            {/if}
          </span>
          {#if !frei}
            <span class="schloss" aria-hidden="true"><Icon name="schloss" groesse={22} /></span>
            <span class="bedarf" aria-hidden="true">{#each Array(z.ab_orden) as _}<i></i>{/each}</span>
          {/if}
        </button>
      {/each}
    </div>
  </div>
</section>

<style>
  .ordenseite { z-index: 1; display: grid; grid-template-columns: 0.8fr 1.2fr; align-items: center; gap: 3vw; }
  .zurueck { position: absolute; left: var(--rand-l); top: var(--rand-o); z-index: 2; display: flex; gap: max(10px, calc(20px * var(--skala))); align-items: center; }
  .monster { justify-self: center; }
  .rechts { display: grid; gap: 5vh; }
  .orden { display: grid; grid-template-columns: repeat(5, clamp(48px, 17vh, 120px)); gap: calc(16px * var(--skala)); justify-content: center; }
  .medaille {
    aspect-ratio: 1; border-radius: 50%;
    display: grid; place-items: center;
    background: rgba(255, 253, 247, 0.5);
    border: 5px dashed rgba(16, 36, 58, 0.4);
    font-size: clamp(34px, 4vw, 50px);
    padding: 0; cursor: pointer;
  }
  .medaille:active { transform: scale(0.94); }
  .medaille .rb { width: 86%; aspect-ratio: 1; border-radius: 50%; overflow: hidden; display: block; }
  .medaille .rb :global(svg) { width: 100%; height: 100%; display: block; }
  .medaille.hat {
    background: radial-gradient(circle at 35% 30%, #fff5c4, var(--sonne) 55%, #e8a21a);
    border: 5px solid var(--tinte); box-shadow: 0 6px 0 var(--tinte), 0 0 0 8px rgba(255, 255, 255, 0.6);
  }
  .zubehoer { display: grid; grid-template-columns: repeat(5, clamp(52px, 17vh, 110px)); gap: calc(12px * var(--skala)); justify-content: center; }
  .teil {
    width: 100%; aspect-ratio: 1; border-radius: calc(28px * var(--skala)); position: relative;
    background: var(--weiss); border: var(--linie) solid var(--tinte); box-shadow: var(--schatten);
    display: grid; place-items: center; cursor: pointer; padding: 0;
    font-size: 54px;
  }
  .teil[aria-disabled='true'] { background: #d9e4ea; box-shadow: 0 4px 0 rgba(16, 36, 58, 0.5); cursor: default; }
  .sym { width: 100%; height: 100%; display: grid; place-items: center; overflow: hidden; border-radius: 22px; }
  .sym :global(svg) { width: 100%; height: 100%; transform: scale(1.3) translateY(-10%); }
  .teil[aria-disabled='true'] .sym { filter: grayscale(1); opacity: 0.4; }
  .teil.an { background: var(--sonne); outline: 6px solid var(--weiss); }
  .teil:active:not([aria-disabled='true']) { transform: translateY(4px); box-shadow: var(--schatten-gedrueckt); }
  .wackelt { animation: wackeln 0.3s ease-in-out 2; }
  .schloss { position: absolute; top: -10px; right: -10px; width: 40px; height: 40px; border-radius: 50%; background: var(--weiss); border: 3px solid var(--tinte); display: grid; place-items: center; }
  .bedarf { position: absolute; bottom: -20px; display: flex; gap: 3px; }
  .bedarf i { width: 9px; height: 9px; border-radius: 50%; background: var(--tinte); opacity: 0.5; }
</style>
