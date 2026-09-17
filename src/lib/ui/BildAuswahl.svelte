<!--
  Gemeinsame Bild-Auswahl für „Welche Regel?“ und „Warum?“ – gleiches Layout, gleiche Bedienung, gleiches Feedback.
  Bedienung: 1. Tippen = vorlesen + Karte hebt sich an, 2. Tippen auf dieselbe Karte = auswählen
  (frühestens nach MIN_ANHOEREN ms oder wenn die Karte fertig vorgelesen ist – schneller Doppeltipp wählt nicht aus).
  Lautsprecher: während der Rückmeldung gesperrt, danach wiederholt er die Erklärung.
  Feedback richtig: Karte groß + Sonnenring + Monster jubelt. Falsch: freundlich, richtige Karte hervorheben, Erklärung, Weiter-Knopf.
  props:
    optionen:     [{ key, bild, audio, richtig }]  (Reihenfolge wird vom Aufrufer gemischt)
    frage:        string[] Audio-Dateien der Frage (beim Start und über den Lautsprecher)
    richtigAudio: string[] nach richtiger Wahl
    falschAudio:  string[] nach falscher Wahl (Erklärung)
    onfertig:     ({ richtig }) => void
-->
<script>
  import Knopf from './Knopf.svelte';
  import Icon from './Icon.svelte';
  import Partner from './Partner.svelte';
  import { spiele, spieleFolge, warte } from '../audio.js';

  let { optionen, frage, richtigAudio, falschAudio, onfertig } = $props();

  let angehoben = $state(null);
  let gewaehlt = $state(null);
  let ergebnis = $state(null); // null | 'richtig' | 'falsch'
  let fertigKnopf = $state(false);
  let pose = $state('nachdenken');
  let hoehe = $state(820);
  let spricht = $state(false); // Rückmeldung läuft
  let lebt = true;
  let angehobenSeit = 0;
  let karteGehoert = false;
  const MIN_ANHOEREN = 800;

  function frageStellen() {
    if (spricht) return;
    if (ergebnis === 'falsch') return spieleFolge(falschAudio);
    if (ergebnis) return;
    return spieleFolge(frage);
  }

  $effect(() => {
    warte(450).then(() => lebt && frageStellen());
    return () => (lebt = false);
  });

  function tippe(o) {
    if (ergebnis) return;
    if (angehoben !== o.key) {
      angehoben = o.key;
      pose = 'zeigen';
      angehobenSeit = Date.now();
      karteGehoert = false;
      spiele(o.audio).then((ok) => ok && angehoben === o.key && (karteGehoert = true));
      return;
    }
    if (!karteGehoert && Date.now() - angehobenSeit < MIN_ANHOEREN) return;
    waehle(o);
  }

  async function waehle(o) {
    gewaehlt = o.key;
    if (o.richtig) {
      ergebnis = 'richtig';
      pose = 'jubeln';
      spricht = true;
      await spieleFolge(richtigAudio);
      spricht = false;
      if (lebt) {
        await warte(500);
        lebt && onfertig({ richtig: true });
      }
    } else {
      ergebnis = 'falsch';
      pose = 'nachdenken';
      spricht = true;
      await spieleFolge(falschAudio);
      spricht = false;
      if (lebt) fertigKnopf = true;
    }
  }
</script>

<svelte:window bind:innerHeight={hoehe} />

<div class="flaeche">
  <div class="karten">
    {#each optionen as o, i (o.key)}
      <button
        type="button"
        class="karte"
        style:--i={i}
        class:angehoben={!ergebnis && angehoben === o.key}
        class:richtig={ergebnis && o.richtig}
        class:daneben={ergebnis === 'falsch' && gewaehlt === o.key}
        class:leise={ergebnis && !o.richtig && gewaehlt !== o.key}
        aria-label={angehoben === o.key ? 'Diese Karte nehmen' : `Karte ${i + 1} anhören`}
        onclick={() => tippe(o)}
      >
        <img src={o.bild} alt="" draggable="false" />
        {#if !ergebnis && angehoben === o.key}
          <span class="nochmal-tippen" aria-hidden="true"><Icon name="haken" groesse={40} /></span>
        {/if}
        {#if ergebnis && o.richtig}
          <span class="stern" aria-hidden="true"><Icon name="stern" groesse={48} farbe="#10243a" /></span>
        {/if}
      </button>
    {/each}
  </div>

  <div class="monster"><Partner groesse={Math.min(190, hoehe * 0.23)} {pose} /></div>
  <div class="steuerung">
    <Knopf label="Frage nochmal anhören" farbe="weiss" groesse={96} disabled={spricht || ergebnis === 'richtig'} onclick={frageStellen}><Icon name="lautsprecher" /></Knopf>
    {#if fertigKnopf}
      <Knopf label="Weiter" farbe="sonne" groesse={120} pulsieren onclick={() => onfertig({ richtig: false })}><Icon name="weiter" groesse={60} /></Knopf>
    {/if}
  </div>
</div>

<style>
  .flaeche {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, var(--himmel) 0%, var(--himmel-hell) 100%);
    display: grid; place-items: center;
    padding: calc(var(--rand-o) + var(--kopf)) var(--rand-r) calc(var(--rand-u) + var(--fuss)) var(--rand-l);
  }
  .karten { display: flex; gap: clamp(20px, 3.4vw, 48px); align-items: center; }
  .karte {
    --k: min(28vw, calc(100dvh - var(--rand-o) - var(--rand-u) - var(--kopf) - var(--fuss) - 30px), 330px);
    width: var(--k); aspect-ratio: 1;
    position: relative; padding: 0; overflow: visible; cursor: pointer;
    border-radius: calc(32px * var(--skala)); border: max(4px, calc(6px * var(--skala))) solid var(--tinte); box-shadow: 0 calc(10px * var(--skala)) 0 var(--tinte);
    background: var(--weiss);
    transition: transform 0.3s var(--weich), opacity 0.4s, box-shadow 0.25s;
    /* backwards statt both: sonst überschreibt die Endphase transform/opacity der Zustände */
    animation: hereinploppen 0.45s var(--weich) backwards;
    animation-delay: calc(var(--i) * 80ms);
  }
  .karte img { width: 100%; height: 100%; object-fit: cover; display: block; border-radius: calc(26px * var(--skala)); pointer-events: none; }
  .karte:active { box-shadow: 0 4px 0 var(--tinte); }
  .angehoben { transform: translateY(-18px) scale(1.04); box-shadow: 0 22px 0 var(--tinte), 0 0 0 12px var(--weiss); }
  .richtig { transform: scale(1.14) rotate(-1.5deg); box-shadow: 0 10px 0 var(--tinte), 0 0 0 16px var(--sonne); z-index: 1; }
  .daneben { opacity: 0.6; transform: scale(0.94); }
  .leise { opacity: 0.35; transform: scale(0.9); }
  .nochmal-tippen, .stern {
    position: absolute; right: calc(-20px * var(--skala)); bottom: calc(-20px * var(--skala));
    width: max(44px, calc(88px * var(--skala))); height: max(44px, calc(88px * var(--skala))); border-radius: 50%;
    border: var(--linie) solid var(--tinte); box-shadow: 0 6px 0 var(--tinte);
    display: grid; place-items: center; pointer-events: none;
  }
  .nochmal-tippen { background: var(--gras); animation: hereinploppen 0.3s var(--weich) both, pulsieren 1.4s 0.3s ease-in-out infinite; }
  .stern { background: var(--sonne); animation: hereinploppen 0.5s var(--weich) both, wackeln 0.5s 0.5s ease-in-out 2; }
  .monster { position: absolute; left: var(--rand-l); bottom: var(--rand-u); }
  .steuerung { position: absolute; right: var(--rand-r); bottom: var(--rand-u); display: flex; gap: max(10px, calc(20px * var(--skala))); align-items: flex-end; }
  .nochmal-tippen :global(svg), .stern :global(svg) { max-width: 60%; max-height: 60%; }
</style>
