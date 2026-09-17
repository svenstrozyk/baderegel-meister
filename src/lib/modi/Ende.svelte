<!--
  Sitzungsende: Monster verabschiedet sich, zeigt die Karte mit den Ziel-Symbolen.
  Symbole, die sich in dieser Sitzung verändert haben (leer→halb, halb→voll), werden hervorgehoben und angesagt.
  Dazu ggf. Orden, Überraschungskarte und Entwicklungs-Feier.
-->
<script>
  import { untrack } from 'svelte';
  import Knopf from '../ui/Knopf.svelte';
  import Icon from '../ui/Icon.svelte';
  import Partner from '../ui/Partner.svelte';
  import Sammelkarte from '../ui/Sammelkarte.svelte';
  import Feier from '../ui/Feier.svelte';
  import { spieleFolge, warte, pfad } from '../audio.js';
  import { gehe } from '../router.svelte.js';
  import { app, aktuelleBilanz, staende } from '../state/app.svelte.js';
  import { vergleich, ueberraschungVergeben } from '../state/fortschritt.js';

  let { regel, vorher } = $props();

  const diff = untrack(() => vergleich(vorher, aktuelleBilanz()));
  const { fortschritt, karte: ueberraschung } = ueberraschungVergeben(app.fortschritt, diff.neueStufen.length);
  app.fortschritt = fortschritt;

  const regelId = untrack(() => regel.id);
  const jetzt = staende(regelId);
  const aenderungen = diff.geaenderteZiele.filter((z) => z.regelId === regelId);
  const hervorheben = aenderungen.map((z) => z.ziel);
  const vollVorher = untrack(() => vorher.staende?.[regelId] ?? []).filter((s) => s === 'voll').length;
  const vollJetzt = jetzt.filter((z) => z.stand === 'voll').length;
  const neuerOrden = diff.neueOrden.includes(regelId);
  const glitzertNeu = !neuerOrden && vollVorher < 2 && vollJetzt >= 2;

  const SYMBOL = { kennen: 'auge', verstehen: 'birne', einschaetzen: 'daumen' };

  let feier = $state(null);
  let pose = $state('winken');
  let lebt = true;
  let folge = $state([]);

  $effect(() => {
    (async () => {
      await warte(700);
      folge = [];
      // höchstens zwei Symbol-Ansagen, volle zuerst – Sitzung soll kurz bleiben
      const angesagt = [...aenderungen].sort((a, b) => (a.zu === 'voll' ? -1 : 0) - (b.zu === 'voll' ? -1 : 0)).slice(0, 2);
      for (const z of angesagt) folge.push(pfad.app(`${SYMBOL[z.ziel]}-${z.zu}`));
      if (neuerOrden) folge.push(pfad.app('orden-neu'));
      else if (glitzertNeu) folge.push(pfad.app('karte-glitzert'));
      if (ueberraschung) folge.push(pfad.app('ueberraschung'));
      folge.push(pfad.app('ende'));
      if (lebt) pose = aenderungen.length ? 'jubeln' : 'winken';
      if (lebt) await spieleFolge([...folge]);
      if (lebt && diff.entwickelt && app.gesehenEntwicklung < diff.entwicklungZu) {
        feier = { von: app.gesehenEntwicklung, zu: app.gesehenEntwicklung + 1 };
      }
      if (lebt) pose = 'winken';
    })();
    return () => (lebt = false);
  });
</script>

<div class="flaeche">
  <div class="monster"><Partner groesse={Math.min(320, innerHeight * 0.42)} {pose} /></div>

  <div class="gewinne">
    <div class="spalte">
      <div class="kartenplatz" class:orden={neuerOrden}>
        <Sammelkarte {regelId} staende={jetzt} {hervorheben} breite={Math.min(290, innerHeight * 0.44)} neu={aenderungen.length > 0} />
        {#if neuerOrden}<div class="medaille" aria-label="Neuer Orden"><Icon name="stern" groesse={56} farbe="#10243a" /></div>{/if}
      </div>
    </div>
    {#if ueberraschung}
      <div class="kartenplatz"><Sammelkarte {ueberraschung} breite={Math.min(200, innerHeight * 0.3)} neu /></div>
    {/if}
  </div>

  <div class="steuerung">
    <Knopf label="Nochmal anhören" farbe="weiss" groesse={96} disabled={!folge.length} onclick={() => spieleFolge([...folge])}><Icon name="lautsprecher" /></Knopf>
    <Knopf label="Weiter nach Hause" farbe="sonne" groesse={130} pulsieren onclick={() => gehe('heimat')}><Icon name="weiter" groesse={68} /></Knopf>
  </div>
</div>

{#if feier}
  <!-- mehrere Stufen auf einmal: jede Stufe bekommt ihre eigene Feier -->
  <Feier von={feier.von} zu={feier.zu} onfertig={() => {
    app.gesehenEntwicklung = feier.zu;
    feier = diff.entwicklungZu > feier.zu ? { von: feier.zu, zu: feier.zu + 1 } : null;
  }} />
{/if}

<style>
  .flaeche {
    position: absolute; inset: 0;
    background:
      radial-gradient(circle at 65% 45%, #fff5c4 0 12%, transparent 40%),
      linear-gradient(180deg, #ffd9a0 0%, #ffe9c4 45%, var(--himmel-hell) 100%);
    display: grid;
    grid-template-columns: 1fr 1.3fr;
    align-items: center;
    padding: var(--rand-o) var(--rand-r) calc(var(--rand-u) + var(--fuss)) var(--rand-l);
  }
  .monster { justify-self: center; }
  .gewinne { display: flex; gap: calc(40px * var(--skala)); justify-content: center; align-items: center; }
  .spalte { display: grid; justify-items: center; gap: 28px; }
  .kartenplatz { position: relative; isolation: isolate; }
  .kartenplatz.orden::before {
    content: ''; position: absolute; inset: calc(-40px * var(--skala)); border-radius: 50%;
    background: repeating-conic-gradient(rgba(255, 210, 63, 0.6) 0 12deg, transparent 12deg 24deg);
    animation: drehen 18s linear infinite; z-index: -1;
  }
  @keyframes drehen { to { transform: rotate(360deg) } }
  .medaille {
    position: absolute; right: calc(-28px * var(--skala)); top: calc(-28px * var(--skala));
    width: calc(96px * var(--skala)); height: calc(96px * var(--skala)); border-radius: 50%;
    background: var(--sonne); border: 6px solid var(--tinte); box-shadow: var(--schatten);
    display: grid; place-items: center;
    animation: hereinploppen 0.6s 0.4s var(--weich) both;
  }
  .steuerung { position: absolute; right: var(--rand-r); bottom: var(--rand-u); display: flex; gap: max(10px, calc(20px * var(--skala))); align-items: flex-end; }
  .medaille :global(svg) { max-width: 60%; max-height: 60%; }
</style>
