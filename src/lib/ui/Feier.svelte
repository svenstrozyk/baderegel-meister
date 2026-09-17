<!-- Entwicklungs-Feier: Monster leuchtet auf und wechselt zur neuen Stufe. -->
<script>
  import Knopf from './Knopf.svelte';
  import Icon from './Icon.svelte';
  import Partner from './Partner.svelte';
  import Konfetti from './Konfetti.svelte';
  import { spiele, sprich, warte, pfad } from '../audio.js';
  import { app, monsterVon } from '../state/app.svelte.js';

  let { von = 1, zu = 2, onfertig } = $props();
  let phase = $state('vorher'); // vorher | blitz | nachher
  const stufe = $derived(phase === 'nachher' ? zu : von);

  $effect(() => {
    let lebt = true;
    (async () => {
      const audio = spiele(pfad.app('entwicklung'));
      await warte(1800);
      if (!lebt) return;
      phase = 'blitz';
      await warte(900);
      if (!lebt) return;
      phase = 'nachher';
      await audio;
      if (!lebt) return;
      const neuerName = monsterVon(app.profil.art)?.stufen[zu - 1]?.name;
      if (neuerName) await sprich(`${app.profil.name} ist jetzt ${neuerName}!`);
    })();
    return () => (lebt = false);
  });
</script>

<div class="feier" role="dialog" aria-label="Dein Monster entwickelt sich">
  <div class="strahlen" aria-hidden="true"></div>
  <div class="monster phase-{phase}">
    <Partner groesse={Math.min(380, innerHeight * 0.5)} {stufe} pose={phase === 'nachher' ? 'jubeln' : 'stehen'} wippen={false} />
  </div>
  {#if phase === 'nachher'}
    <Konfetti />
    <div class="weiter">
      <Knopf label="Weiter" farbe="gras" groesse={120} pulsieren onclick={onfertig}><Icon name="haken" groesse={64} /></Knopf>
    </div>
  {/if}
</div>

<style>
  .feier {
    position: fixed; inset: 0; z-index: 50;
    display: grid; place-items: center;
    background: radial-gradient(circle, #fff5c4 0%, var(--sonne) 35%, var(--orange) 100%);
    animation: hereinploppen 0.4s ease-out both;
  }
  .strahlen {
    position: absolute; width: 180vmax; height: 180vmax;
    background: repeating-conic-gradient(rgba(255, 255, 255, 0.35) 0 10deg, transparent 10deg 20deg);
    animation: drehen 30s linear infinite;
  }
  @keyframes drehen { to { transform: rotate(360deg) } }
  .monster { position: relative; transition: filter 0.4s, transform 0.4s; }
  .phase-vorher { animation: wackeln 0.4s ease-in-out infinite; }
  .phase-blitz { filter: brightness(0) invert(1) drop-shadow(0 0 40px #fff); transform: scale(1.25); }
  .phase-nachher { animation: hereinploppen 0.6s var(--weich) both; }
  .weiter { position: absolute; right: var(--rand-r); bottom: var(--rand-u); }
</style>
