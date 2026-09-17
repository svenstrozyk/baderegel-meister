<!--
  Modus A: Geschichte (3 Bilder mit Audio, auto weiter) → Merksatz + Geste („Mach mit!“) → Daumen hoch.
  nurMerksatz: kurze Erinnerung ohne Bilder (ab der 2. Sitzung).
-->
<script>
  import Regelbild from '../ui/Regelbild.svelte';
  import { untrack } from 'svelte';
  import Knopf from '../ui/Knopf.svelte';
  import Icon from '../ui/Icon.svelte';
  import Partner from '../ui/Partner.svelte';
  import { spiele, spieleFolge, warte, pfad } from '../audio.js';

  let { regel, nurMerksatz = false, onfertig } = $props();

  let bild = $state(untrack(() => (nurMerksatz ? 3 : 0))); // 0..2 Bilder, 3 = Merksatz
  let bereit = $state(false);
  let gehoert = $state(false); // „Weiter“ erst, wenn der Text zum Bild einmal gelaufen ist
  let nochmalLaeuft = false;
  let lebt = true;
  $effect(() => () => (lebt = false));

  const audio = (s) => pfad.regel(regel.ordner, s);

  $effect(() => {
    const b = bild; // abhängig vom aktuellen Bild
    let gueltig = true;
    gehoert = false;
    (async () => {
      await warte(b === 0 || nurMerksatz ? 500 : 250);
      if (!gueltig || !lebt) return;
      if (b < 3) {
        const ok = await spiele(audio(`geschichte-${b + 1}`));
        // Abbruch durch „Nochmal“ zählt nicht; Ladefehler geben „Weiter“ frei, damit niemand festhängt.
        if (gueltig && lebt && (ok || !nochmalLaeuft)) gehoert = true;
        if (ok && gueltig && lebt) {
          await warte(1200);
          if (gueltig && lebt && bild === b) bild = b + 1;
        }
      } else {
        bereit = false;
        await spieleFolge([audio('merksatz'), pfad.app('mach-mit'), audio('geste')]);
        if (gueltig && lebt) bereit = true;
      }
    })();
    return () => (gueltig = false);
  });

  function nochmal() {
    if (bild < 3) {
      const b = bild;
      nochmalLaeuft = true;
      spiele(audio(`geschichte-${b + 1}`)).then((ok) => {
        nochmalLaeuft = false;
        if (ok && lebt && bild === b) gehoert = true;
      });
    }
    else spieleFolge([audio('merksatz'), pfad.app('mach-mit'), audio('geste')]).then((ok) => ok && (bereit = true));
  }
</script>

{#if bild < 3}
  {#key bild}
    <div class="bildflaeche">
      <!-- unscharfer Hintergrund füllt die Ränder, wenn das 3:2-Bild auf breiten Handy-Bildschirmen ganz gezeigt wird -->
      <img class="hintergrund" src={pfad.bild(regel.ordner, `geschichte-${bild + 1}`)} alt="" aria-hidden="true" />
      <img class="bild" src={pfad.bild(regel.ordner, `geschichte-${bild + 1}`)} alt="Geschichte Bild {bild + 1}" />
    </div>
  {/key}
  <div class="monster-ecke"><Partner groesse={Math.min(220, innerHeight * 0.28)} pose="zeigen" /></div>
  <div class="steuerung">
    <Knopf label="Nochmal anhören" farbe="weiss" groesse={96} onclick={nochmal}><Icon name="lautsprecher" /></Knopf>
    <!-- Platz bleibt reserviert, damit der Lautsprecher nicht springt und kein Tipp auf „Weiter“ landet -->
    <div class="platzhalter" class:verborgen={!gehoert} aria-hidden={!gehoert}>
      <Knopf label="Weiter" farbe="sonne" groesse={120} disabled={!gehoert} onclick={() => (bild = bild + 1)}><Icon name="weiter" groesse={60} /></Knopf>
    </div>
  </div>
{:else}
  <div class="merksatz">
    <div class="symbolscheibe" aria-hidden="true"><Regelbild regelId={regel.id} /></div>
    <div class="geste">
      <Partner groesse={Math.min(400, innerHeight * 0.52)} pose={regel.geste.pose} />
      <div class="mitmachen" aria-hidden="true">
        <Icon name="haende" groesse={62} fuellung="#fffdf7" />
      </div>
    </div>
    <div class="steuerung">
      <Knopf label="Nochmal anhören" farbe="weiss" groesse={96} onclick={nochmal}><Icon name="lautsprecher" /></Knopf>
      <Knopf label="Gemacht! Weiter" farbe="gras" groesse={150} pulsieren={bereit} onclick={() => onfertig({})}><Icon name="daumen-hoch" groesse={84} fuellung="#fffdf7" /></Knopf>
    </div>
  </div>
{/if}

<style>
  .bildflaeche { position: absolute; inset: 0; background: var(--tinte); animation: einblenden 0.5s ease-out both; }
  .bildflaeche img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
  .bildflaeche .hintergrund { display: none; }
  /* Breiter als ~16:9 (iPhone quer): Bild nicht beschneiden, sondern ganz zeigen */
  @media (min-aspect-ratio: 16/9) {
    .bildflaeche .bild { object-fit: contain; }
    .bildflaeche .hintergrund { display: block; filter: blur(18px) brightness(0.8); transform: scale(1.1); }
  }
  @keyframes einblenden { from { opacity: 0; transform: scale(1.03) } to { opacity: 1; transform: none } }
  .monster-ecke { position: absolute; left: var(--rand-l); bottom: var(--rand-u); z-index: 2; filter: drop-shadow(0 6px 0 rgba(16, 36, 58, 0.3)); }
  .platzhalter { transition: opacity 0.3s var(--weich), transform 0.3s var(--weich); }
  .verborgen { visibility: hidden; opacity: 0; transform: scale(0.6); }
  .steuerung { position: absolute; right: var(--rand-r); bottom: var(--rand-u); display: flex; gap: max(10px, calc(20px * var(--skala))); align-items: flex-end; z-index: 3; }

  .merksatz {
    position: absolute; inset: 0;
    background:
      radial-gradient(circle at 30% 55%, #fff 0 18%, transparent 45%),
      linear-gradient(180deg, var(--himmel) 0%, var(--himmel-hell) 70%);
    display: grid;
    grid-template-columns: 1fr 1.3fr;
    align-items: center;
    padding: calc(var(--rand-o) + var(--kopf) - 14px) var(--rand-r) var(--rand-u) var(--rand-l);
  }
  .symbolscheibe {
    justify-self: center;
    width: min(34vh, 300px); aspect-ratio: 1; border-radius: 50%;
    background: var(--weiss); border: calc(8px * var(--skala)) solid var(--tinte);
    box-shadow: 0 calc(10px * var(--skala)) 0 var(--tinte), 0 0 0 calc(22px * var(--skala)) rgba(255, 210, 63, 0.7);
    overflow: hidden;
    animation: hereinploppen 0.6s var(--weich) both;
  }
  .geste { position: relative; display: grid; place-items: center; }
  .mitmachen {
    position: absolute; top: 0; right: 10%;
    width: calc(96px * var(--skala)); height: calc(96px * var(--skala)); border-radius: 50%;
    background: var(--sonne); border: var(--linie) solid var(--tinte); box-shadow: var(--schatten);
    display: grid; place-items: center; font-size: 52px;
    animation: wackeln 1s ease-in-out infinite;
  }
  .mitmachen :global(svg) { max-width: 66%; max-height: 66%; }
</style>
