<script>
  import Monster from './Monster.svelte';
  import { FARBEN } from './farben.js';
  import { BASIS_POSEN, GESTEN } from './posen.js';

  const ARTEN = [
    { id: 'plitsch', tier: 'Seepferdchen', namen: ['Plitsch', 'Plitscho', 'Plitschodrako'], farbe: 'meerblau' },
    { id: 'blubbo', tier: 'Otter', namen: ['Blubbo', 'Blubbolino', 'Rettungsblubbo'], farbe: 'sandbeige' },
    { id: 'kiesel', tier: 'Schildkröte', namen: ['Kiesel', 'Kieselstein', 'Kieselfels'], farbe: 'seegruen' },
    { id: 'pingo', tier: 'Pinguin', namen: ['Pingo', 'Pingolo', 'Kaiser-Pingo'], farbe: 'tuerkis' },
    { id: 'tinti', tier: 'Krake', namen: ['Tinti', 'Tintolino', 'Tintomax'], farbe: 'lila' },
  ];
  const MUSTER = ['keins', 'punkte', 'streifen', 'sterne'];
  const ZUBEHOER = ['taucherbrille', 'badekappe', 'handtuch_umhang', 'sonnenhut', 'rettungspfeife'];
  const HINTERGRUENDE = { hell: '', freibad: 'bilder/regel-10/geschichte-1.webp', see: 'bilder/regel-07/geschichte-1.webp' };

  let farbe = $state('eigene');
  let muster = $state('keins');
  let zubehoer = $state([]);
  let pose = $state('stehen');
  let groesse = $state(220);
  let hintergrund = $state('hell');

  function umschalten(z) {
    zubehoer = zubehoer.includes(z) ? zubehoer.filter((x) => x !== z) : [...zubehoer, z];
  }
</script>

<main style:--hg={HINTERGRUENDE[hintergrund] ? `url(${HINTERGRUENDE[hintergrund]})` : 'none'}>
  <header>
    <h1>Partner-Wassermonster</h1>
    <section>
      <h2>Farbe</h2>
      <div class="reihe">
        <button class:aktiv={farbe === 'eigene'} onclick={() => (farbe = 'eigene')}>je Art</button>
        {#each Object.entries(FARBEN) as [id, hex]}
          <button class="swatch" class:aktiv={farbe === id} style:background={hex} title={id} aria-label={id} onclick={() => (farbe = id)}></button>
        {/each}
      </div>
    </section>
    <section>
      <h2>Muster</h2>
      <div class="reihe">
        {#each MUSTER as m}<button class:aktiv={muster === m} onclick={() => (muster = m)}>{m}</button>{/each}
      </div>
    </section>
    <section>
      <h2>Zubehör</h2>
      <div class="reihe">
        {#each ZUBEHOER as z}<button class:aktiv={zubehoer.includes(z)} onclick={() => umschalten(z)}>{z}</button>{/each}
      </div>
    </section>
    <section>
      <h2>Pose</h2>
      <div class="reihe">
        {#each BASIS_POSEN as p}<button class:aktiv={pose === p} onclick={() => (pose = p)}>{p}</button>{/each}
      </div>
      <div class="reihe">
        {#each GESTEN as p}<button class="geste" class:aktiv={pose === p} onclick={() => (pose = p)}>{p}</button>{/each}
      </div>
    </section>
    <section class="reihe">
      <label>Größe <input type="range" min="80" max="360" bind:value={groesse} /> {groesse}px</label>
      <span>Hintergrund:</span>
      {#each Object.keys(HINTERGRUENDE) as h}<button class:aktiv={hintergrund === h} onclick={() => (hintergrund = h)}>{h}</button>{/each}
    </section>
  </header>

  <div class="raster">
    {#each ARTEN as a}
      <div class="art">
        <h3>{a.tier}</h3>
        <div class="stufen">
          {#each [1, 2, 3] as stufe}
            <figure>
              <div class="buehne" style:width="{groesse}px" style:height="{groesse}px">
                <Monster art={a.id} {stufe} farbe={farbe === 'eigene' ? a.farbe : farbe} {muster} {zubehoer} {pose} {groesse} />
              </div>
              <figcaption>{a.namen[stufe - 1]} <small>Stufe {stufe}</small></figcaption>
            </figure>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: system-ui, -apple-system, sans-serif;
    background: #dff3fb;
    color: #1d1b33;
  }
  main { padding: 16px; }
  header {
    position: sticky; top: 0; z-index: 2;
    background: rgba(255, 255, 255, 0.92);
    border-radius: 14px; padding: 10px 14px; margin-bottom: 16px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  }
  h1 { font-size: 20px; margin: 0 0 6px; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; margin: 6px 0 4px; color: #5a5a7a; }
  h3 { margin: 0 0 6px; font-size: 16px; }
  .reihe { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 4px; }
  button {
    border: 2px solid #c9d6e3; background: #fff; border-radius: 999px;
    padding: 5px 11px; font-size: 13px; cursor: pointer; color: inherit;
  }
  button.geste { border-style: dashed; }
  button.aktiv { border-color: #1d1b33; background: #1d1b33; color: #fff; }
  .swatch { width: 30px; height: 30px; padding: 0; }
  .swatch.aktiv { outline: 3px solid #1d1b33; outline-offset: 2px; background-clip: padding-box; }
  .raster { display: grid; gap: 18px; }
  .art { background: rgba(255, 255, 255, 0.5); border-radius: 14px; padding: 10px; }
  .stufen { display: flex; flex-wrap: wrap; gap: 12px; }
  figure { margin: 0; text-align: center; }
  .buehne {
    background: var(--hg) center / cover, linear-gradient(#bfe6f5, #eaf8fd);
    border-radius: 12px; display: flex; align-items: flex-end; justify-content: center;
  }
  figcaption { font-weight: 600; margin-top: 4px; }
  small { color: #6a6a8a; font-weight: 400; }
</style>
