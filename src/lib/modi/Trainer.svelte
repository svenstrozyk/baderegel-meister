<!-- Modus D „Ich bin der Trainer“: Kind erklärt, Erwachsene sehen Stichworte und bestätigen. -->
<script>
  import Knopf from '../ui/Knopf.svelte';
  import Icon from '../ui/Icon.svelte';
  import Partner from '../ui/Partner.svelte';
  import ElternAufgabe from '../ui/ElternAufgabe.svelte';
  import { spiele, spieleFolge, warte, pfad } from '../audio.js';

  let { regel, onfertig } = $props();
  const audio = (s) => pfad.regel(regel.ordner, s);
  let phase = $state('frage'); // frage | geklappt | ueben
  let pose = $state('zeigen');
  let bestaetigen = $state(false); // Eltern-Aufgabe offen – verhindert Selbst-Bestätigung durch das Kind
  let lebt = true;

  const frage = () => spieleFolge([pfad.app('trainer-intro'), audio('trainer-frage')]);

  $effect(() => {
    warte(450).then(() => lebt && frage());
    return () => (lebt = false);
  });

  async function geklappt() {
    phase = 'geklappt';
    pose = 'jubeln';
    await spiele(pfad.app('trainer-geklappt'));
    if (lebt) {
      await warte(500);
      lebt && onfertig({ richtig: true });
    }
  }

  async function ueben() {
    phase = 'ueben';
    pose = regel.geste.pose;
    await spieleFolge([pfad.app('trainer-nochmal'), audio('merksatz'), audio('warum')]);
  }
</script>

<div class="flaeche">
  <div class="buehne">
    <div class="pfeife" aria-hidden="true"><Icon name="megafon" groesse={64} fuellung="#ff6b5b" /></div>
    <Partner groesse={Math.min(360, innerHeight * 0.46)} {pose} />
    <div class="publikum" aria-hidden="true">
      {#each ['#43c463', '#ff9a3c', '#9b6bf2'] as f, i}<span style:--i={i}><Icon name="person" groesse={52} fuellung={f} /></span>{/each}
    </div>
  </div>

  <aside class="eltern sticker" aria-label="Für Erwachsene">
    <p class="titel">Für Erwachsene · Stichworte</p>
    <p class="frage">„{regel.trainer.frage}“</p>
    <ul>
      {#each regel.trainer.stichworte as s}<li>{s}</li>{/each}
    </ul>
    {#if phase === 'frage'}
      <div class="knoepfe">
        <button type="button" class="eknopf gut" onclick={() => (bestaetigen = true)}><Icon name="haken" groesse={26} /> hat geklappt</button>
        <button type="button" class="eknopf ueben" onclick={ueben}><Icon name="nochmal" groesse={26} /> nochmal üben</button>
      </div>
    {:else if phase === 'ueben'}
      <p class="info">Zusammen noch einmal anhören – beim nächsten Mal zählt es.</p>
    {/if}
  </aside>

  {#if bestaetigen && phase === 'frage'}
    <ElternAufgabe
      titel="Erwachsene bestätigen"
      onrichtig={() => {
        bestaetigen = false;
        geklappt();
      }}
      onabbrechen={() => (bestaetigen = false)}
    />
  {/if}

  <div class="steuerung">
    <Knopf label="Nochmal anhören" farbe="weiss" groesse={96} onclick={phase === 'ueben' ? ueben : frage}><Icon name="lautsprecher" /></Knopf>
    {#if phase === 'ueben'}
      <Knopf label="Weiter" farbe="sonne" groesse={120} pulsieren onclick={() => onfertig({ richtig: false })}><Icon name="weiter" groesse={60} /></Knopf>
    {/if}
  </div>
</div>

<style>
  .flaeche {
    position: absolute; inset: 0;
    background:
      repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.18) 0 60px, transparent 60px 120px),
      linear-gradient(180deg, #8fdcff 0%, #5cc4f0 62%, var(--sand) 62%, #f0c98a 100%);
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    align-items: center;
    gap: 3vw;
    padding: calc(var(--rand-o) + var(--kopf)) var(--rand-r) calc(var(--rand-u) + var(--fuss)) var(--rand-l);
  }
  .buehne { position: relative; display: grid; justify-items: center; }
  .pfeife {
    position: absolute; top: -10px; left: 12%;
    font-size: 64px; animation: wackeln 1.2s ease-in-out infinite;
  }
  .publikum { display: flex; gap: calc(14px * var(--skala)); margin-top: -10px; }
  .publikum span {
    font-size: 54px; width: calc(84px * var(--skala)); height: calc(84px * var(--skala)); border-radius: 50%;
    background: var(--weiss); border: 4px solid var(--tinte); display: grid; place-items: center;
    animation: wippen 2s ease-in-out infinite; animation-delay: calc(var(--i) * -0.4s);
  }
  .eltern {
    background: var(--weiss);
    padding: 22px 26px;
    font-weight: 600;
    font-size: 19px;
    line-height: 1.35;
    align-self: center;
    max-height: 100%;
    overflow: auto;
  }
  .titel { margin: 0 0 6px; font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.6; }
  .frage { margin: 0 0 10px; font-weight: 800; }
  ul { margin: 0 0 16px; padding-left: 22px; }
  li { margin: 4px 0; }
  .knoepfe { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .eknopf {
    min-height: 88px; border-radius: 22px; border: 4px solid var(--tinte); box-shadow: 0 5px 0 var(--tinte);
    font-size: 21px; font-weight: 900; cursor: pointer; padding: 8px 12px;
  }
  .eknopf:active { transform: translateY(3px); box-shadow: 0 2px 0 var(--tinte); }
  .gut { background: var(--gras); }
  .ueben { background: var(--himmel-hell); }
  .info { margin: 0; font-weight: 700; }
  .steuerung { position: absolute; right: var(--rand-r); bottom: var(--rand-u); display: flex; gap: max(10px, calc(20px * var(--skala))); align-items: flex-end; }
  .publikum :global(svg), .pfeife :global(svg) { max-width: 70%; max-height: 70%; }
  .pfeife { width: calc(64px * var(--skala)); height: calc(64px * var(--skala)); display: grid; place-items: center; }

  /* iPhone quer: Knöpfe oben rechts in die Kopfzeile, Eltern-Karte nutzt die volle Höhe und kompaktere Schrift */
  @media (max-height: 560px) {
    .flaeche { padding-bottom: var(--rand-u); gap: 2vw; }
    .steuerung { top: var(--rand-o); bottom: auto; z-index: 11; }
    .eltern { padding: 10px 14px; font-size: 14px; line-height: 1.25; align-self: stretch; }
    .titel { font-size: 11px; margin-bottom: 2px; }
    .frage { margin-bottom: 4px; }
    ul { margin-bottom: 8px; padding-left: 18px; }
    li { margin: 1px 0; }
    .knoepfe { gap: 8px; }
    .eknopf { min-height: 52px; font-size: 15px; border-radius: 16px; padding: 4px 8px; }
  }
</style>
