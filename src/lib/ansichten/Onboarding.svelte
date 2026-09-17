<!-- Onboarding: Monster wählen → Farbe + Muster → Name (Eltern-Gate) → „Hallo, ich bin …“ -->
<script>
  import Wasser from '../ui/Wasser.svelte';
  import Knopf from '../ui/Knopf.svelte';
  import Icon from '../ui/Icon.svelte';
  import ElternGate from '../ui/ElternGate.svelte';
  import Monster from '../monster/Monster.svelte';
  import { FARBEN } from '../monster/farben.js';
  import { spiele, sprich, warte, pfad, stoppe } from '../audio.js';
  import { gehe } from '../router.svelte.js';
  import { app, MONSTER, monsterVon } from '../state/app.svelte.js';

  let schritt = $state('monster'); // monster | aussehen | name
  let art = $state(null);
  let farbe = $state('meerblau');
  let muster = $state('keins');
  let name = $state('');
  let namensFeld = $state(false);
  let pose = $state('stehen');
  let musterAngesagt = false;
  let breite = $state(1180);
  let hoehe = $state(820);
  let feld = $state();

  const kachel = $derived(Math.max(120, Math.min(190, (breite - 180) / 5 - 24)));
  const vorschau = $derived(Math.min(360, hoehe * 0.46));

  const ansage = (s) => spiele(pfad.app(s));

  $effect(() => {
    warte(900).then(() => schritt === 'monster' && !art && ansage('waehle-monster'));
  });

  async function waehleMonster(id) {
    if (art === id) return weiterZuAussehen();
    art = id;
    pose = 'winken';
    await ansage(`monster-${id}`);
  }

  function weiterZuAussehen() {
    schritt = 'aussehen';
    pose = 'jubeln';
    ansage('waehle-farbe');
  }

  function waehleFarbe(id) {
    farbe = id;
    pose = 'jubeln';
    if (!musterAngesagt) {
      musterAngesagt = true;
      ansage('waehle-muster');
    }
  }

  function weiterZuName() {
    schritt = 'name';
    pose = 'winken';
    name = monsterVon(art).stufen[0].name;
    ansage('name-eltern');
  }

  async function oeffneNamensFeld() {
    stoppe();
    namensFeld = true;
    await warte(50);
    feld?.focus();
    feld?.select();
  }

  async function fertig(e) {
    e?.preventDefault();
    const n = name.trim() || monsterVon(art).stufen[0].name;
    app.profil = { art, farbe, muster, name: n, zubehoer: [] };
    namensFeld = false;
    feld?.blur();
    pose = 'jubeln';
    await Promise.race([sprich(`Hallo, ich bin ${n}!`), warte(4000)]);
    await warte(400);
    gehe('heimat', { begruessen: true });
  }
</script>

<svelte:window bind:innerWidth={breite} bind:innerHeight={hoehe} />

<Wasser hoehe={26} sonne={schritt === 'monster'} />
<section class="ansicht onboarding">
  {#if schritt === 'monster'}
    <div class="kopf">
      <Knopf label="Nochmal anhören" farbe="weiss" groesse={88} onclick={() => ansage('waehle-monster')}><Icon name="lautsprecher" /></Knopf>
    </div>
    <div class="auswahl">
      {#each MONSTER.monster as m, i (m.id)}
        <button
          type="button"
          class="blase"
          class:gewaehlt={art === m.id}
          class:gedimmt={art && art !== m.id}
          style:--k="{kachel}px"
          style:--i={i}
          aria-label={m.stufen[0].name}
          aria-pressed={art === m.id}
          onclick={() => waehleMonster(m.id)}
        >
          <Monster art={m.id} farbe={['meerblau', 'tuerkis', 'seegruen', 'korallenrot', 'lila'][i]} pose={art === m.id ? pose : 'stehen'} groesse={kachel * 0.82} />
        </button>
      {/each}
    </div>
    <div class="fuss">
      {#if art}
        <Knopf label="Dieses Monster nehmen" farbe="gras" groesse={120} pulsieren onclick={weiterZuAussehen}><Icon name="haken" groesse={64} /></Knopf>
      {/if}
    </div>
  {:else if schritt === 'aussehen'}
    <div class="ecke">
      <Knopf label="Nochmal anhören" farbe="weiss" groesse={88} onclick={async () => { if (await ansage('waehle-farbe')) ansage('waehle-muster'); }}><Icon name="lautsprecher" /></Knopf>
    </div>
    <div class="aussehen">
      <div class="buehne">
        <Monster {art} {farbe} {muster} {pose} groesse={vorschau} />
      </div>
      <div class="palette">
        <div class="farben" role="radiogroup" aria-label="Farbe">
          {#each MONSTER.gestaltung.farben as f}
            <button
              type="button"
              class="tupfer"
              class:an={farbe === f}
              style:--f={FARBEN[f]}
              role="radio"
              aria-checked={farbe === f}
              aria-label={f}
              onclick={() => waehleFarbe(f)}
            ></button>
          {/each}
        </div>
        <div class="muster" role="radiogroup" aria-label="Muster">
          {#each MONSTER.gestaltung.muster as m}
            <button type="button" class="musterknopf m-{m}" class:an={muster === m} style:--f={FARBEN[farbe]} role="radio" aria-checked={muster === m} aria-label={m} onclick={() => { muster = m; pose = 'jubeln'; }}>
              <svg viewBox="0 0 60 60" aria-hidden="true">
                {#if m === 'punkte'}
                  {#each [[16, 16], [42, 18], [28, 32], [14, 44], [44, 44]] as [x, y]}<circle cx={x} cy={y} r="6" />{/each}
                {:else if m === 'streifen'}
                  {#each [12, 30, 48] as y}<rect x="0" y={y - 4} width="60" height="8" />{/each}
                {:else if m === 'sterne'}
                  {#each [[18, 18], [42, 40]] as [x, y]}<path transform="translate({x - 12} {y - 12})" d="M12 1l3.2 7 7.6.8-5.7 5.1 1.6 7.5L12 17.6l-6.7 3.8 1.6-7.5L1.2 8.8 8.8 8z" />{/each}
                {/if}
              </svg>
            </button>
          {/each}
        </div>
        <div class="aktionen">
          <Knopf label="Zurück" farbe="weiss" groesse={96} onclick={() => { schritt = 'monster'; }}><Icon name="zurueck" /></Knopf>
          <Knopf label="Fertig" farbe="gras" groesse={120} pulsieren onclick={weiterZuName}><Icon name="haken" groesse={64} /></Knopf>
        </div>
      </div>
    </div>
  {:else}
    {#if !app.profil && !namensFeld}
      <div class="ecke">
        <Knopf label="Nochmal anhören" farbe="weiss" groesse={88} onclick={() => ansage('name-eltern')}><Icon name="lautsprecher" /></Knopf>
      </div>
    {/if}
    <div class="namen">
      <div class="buehne">
        <Monster {art} {farbe} {muster} {pose} groesse={vorschau} />
        {#if !app.profil}<div class="frage" aria-hidden="true">?</div>{/if}
      </div>
      {#if namensFeld}
        <form class="namenskarte sticker" onsubmit={fertig}>
          <label for="monstername">Name für das Monster <small>(Eltern tippen)</small></label>
          <input id="monstername" bind:this={feld} bind:value={name} maxlength="18" autocomplete="off" autocapitalize="words" enterkeyhint="done" />
          <div class="vorschlaege">
            {#each monsterVon(art).stufen.slice(0, 1) as s}
              <button type="button" class="chip" onclick={() => (name = s.name)}>{s.name}</button>
            {/each}
          </div>
          <Knopf label="Name speichern" farbe="gras" groesse={96} rund={false} type="submit"><Icon name="haken" /><span class="knopftext">Fertig</span></Knopf>
        </form>
      {:else if !app.profil}
        <div class="gatebox">
          <ElternGate groesse={132} onoffen={oeffneNamensFeld} label="Eltern: 3 Sekunden gedrückt halten, um den Namen einzugeben" />
          <p class="hinweis">Eltern: 3 Sek. gedrückt halten</p>
        </div>
      {/if}
    </div>
  {/if}
</section>

<style>
  .onboarding { z-index: 1; display: grid; grid-template-rows: auto 1fr auto; }
  .kopf { display: flex; justify-content: flex-start; }
  .auswahl { display: flex; justify-content: center; align-items: center; gap: 24px; flex-wrap: nowrap; }
  .blase {
    width: var(--k);
    height: var(--k);
    border-radius: 50%;
    border: var(--linie) solid var(--tinte);
    background: radial-gradient(circle at 35% 30%, #ffffff, var(--himmel-hell) 60%, var(--himmel));
    box-shadow: var(--schatten);
    display: grid;
    place-items: center;
    padding: 0;
    cursor: pointer;
    animation: hereinploppen 0.5s var(--weich) both, wippen 3s ease-in-out infinite;
    animation-delay: calc(var(--i) * 80ms), calc(var(--i) * -0.6s);
    transition: transform 0.3s var(--weich), opacity 0.3s, filter 0.3s;
  }
  .blase.gewaehlt { transform: scale(1.18); background: radial-gradient(circle at 35% 30%, #fffbe0, var(--sonne) 75%); animation: none; }
  .blase.gedimmt { opacity: 0.6; filter: saturate(0.6); scale: 0.9; }
  .fuss { min-height: 140px; display: flex; justify-content: center; align-items: center; }

  .aussehen, .namen { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 3vw; grid-row: 1 / -1; }
  .buehne { display: grid; place-items: center; position: relative; }
  .buehne :global(svg) { animation: wippen 3s ease-in-out infinite; }
  .palette { display: grid; gap: 28px; justify-items: center; }
  .farben { display: grid; grid-template-columns: repeat(4, 96px); gap: 18px; }
  .tupfer {
    width: 96px; height: 96px; border-radius: 50%;
    background: var(--f);
    border: var(--linie) solid var(--tinte);
    box-shadow: var(--schatten);
    cursor: pointer; padding: 0;
    transition: transform 0.2s var(--weich);
  }
  .tupfer.an { transform: scale(1.12); outline: 7px solid var(--weiss); outline-offset: 2px; }
  .tupfer:active { transform: translateY(4px); box-shadow: var(--schatten-gedrueckt); }
  .muster { display: grid; grid-template-columns: repeat(4, 96px); gap: 18px; }
  .musterknopf {
    width: 96px; height: 96px; border-radius: 24px; padding: 14px;
    background: var(--f);
    border: var(--linie) solid var(--tinte);
    box-shadow: var(--schatten);
    cursor: pointer;
  }
  .musterknopf svg { width: 100%; height: 100%; fill: rgba(255, 253, 247, 0.9); stroke: var(--tinte); stroke-width: 2; }
  .musterknopf.an { outline: 7px solid var(--weiss); outline-offset: 2px; transform: scale(1.08); }
  .aktionen { display: flex; gap: 24px; align-items: center; }

  .ecke { position: absolute; left: var(--rand-l); top: var(--rand-o); z-index: 2; }
  .frage {
    position: absolute; top: 4%; right: 14%;
    width: 84px; height: 84px; border-radius: 50%;
    background: var(--weiss); border: var(--linie) solid var(--tinte); box-shadow: var(--schatten);
    display: grid; place-items: center; font-size: 56px; font-weight: 900;
    animation: wackeln 2s ease-in-out infinite;
  }
  .gatebox { display: grid; justify-items: center; gap: 18px; }
  .hinweis { margin: 0; font-size: 18px; color: var(--tinte); background: rgba(255, 253, 247, 0.8); padding: 6px 14px; border-radius: 999px; }
  .namenskarte { background: var(--weiss); padding: 28px; display: grid; gap: 16px; max-width: 460px; }
  .namenskarte label { font-size: 22px; }
  .namenskarte small { font-weight: 600; opacity: 0.7; }
  .namenskarte input {
    font: inherit; font-size: 40px; font-weight: 900;
    padding: 12px 18px; border-radius: 18px;
    border: 4px solid var(--tinte); background: #fff; width: 100%;
  }
  .vorschlaege { display: flex; gap: 10px; flex-wrap: wrap; }
  .chip { font-size: 20px; padding: 10px 18px; border-radius: 999px; border: 3px solid var(--tinte); background: var(--himmel-hell); cursor: pointer; min-height: 48px; }
  .knopftext { font-size: 32px; }
</style>
