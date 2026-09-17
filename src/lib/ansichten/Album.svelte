<!-- Album: Strand-Szene, Karten frei verschiebbar (Position gespeichert), Antippen spielt Merksatz. -->
<script>
  import Knopf from '../ui/Knopf.svelte';
  import Icon from '../ui/Icon.svelte';
  import Sammelkarte from '../ui/Sammelkarte.svelte';
  import { spiele, sprich, warte, pfad } from '../audio.js';
  import { gehe } from '../router.svelte.js';
  import { app, ALLE_REGELN, REGELN, staende } from '../state/app.svelte.js';
  import { UEBERRASCHUNGEN } from '../state/fortschritt.js';

  let szene = $state();
  let breite = $state(1180);
  let hoehe = $state(820);
  const kartenBreite = $derived(Math.max(110, Math.min(150, hoehe * 0.18)));

  const karten = $derived([
    ...ALLE_REGELN.filter((r) => staende(r.id).some((z) => z.stand !== 'leer')).map((r) => ({ key: `regel-${r.id}`, regelId: r.id })),
    ...UEBERRASCHUNGEN.filter((u) => app.fortschritt.ueberraschungen?.includes(u.id)).map((u) => ({ key: `ueberraschung-${u.id}`, ueberraschung: u })),
  ]);

  function standard(i) {
    return { x: 8 + (i % 6) * 15, y: 50 + Math.floor(i / 6) * 22 };
  }
  const position = (k, i) => app.album[k.key] ?? standard(i);

  $effect(() => {
    let lebt = true;
    warte(500).then(() => lebt && spiele(pfad.app(karten.length ? 'album' : 'album-leer')));
    return () => (lebt = false);
  });

  let zug = null;
  let gezogen = $state(null);

  function runter(e, k, i) {
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      /* Pointer nicht (mehr) aktiv */
    }
    const p = position(k, i);
    zug = { k, startX: e.clientX, startY: e.clientY, px: p.x, py: p.y, bewegt: false };
    gezogen = k.key;
  }
  function bewegen(e) {
    if (!zug) return;
    const rect = szene.getBoundingClientRect();
    const dx = e.clientX - zug.startX;
    const dy = e.clientY - zug.startY;
    if (Math.hypot(dx, dy) > 10) zug.bewegt = true;
    if (!zug.bewegt) return;
    const maxX = 100 - (kartenBreite / rect.width) * 100;
    const maxY = 100 - ((kartenBreite * 1.4) / rect.height) * 100;
    app.album[zug.k.key] = {
      x: Math.max(0, Math.min(maxX, zug.px + (dx / rect.width) * 100)),
      y: Math.max(0, Math.min(maxY, zug.py + (dy / rect.height) * 100)),
    };
  }
  function hoch() {
    if (!zug) return;
    const { k, bewegt } = zug;
    zug = null;
    gezogen = null;
    if (!bewegt) vorlesen(k);
  }

  function vorlesen(k) {
    if (k.ueberraschung) return spiele(pfad.app('ueberraschung'));
    const r = REGELN.find((x) => x.id === k.regelId);
    if (r) spiele(pfad.regel(r.ordner, 'merksatz'));
    else sprich(ALLE_REGELN.find((x) => x.id === k.regelId)?.merksatz ?? '');
  }
</script>

<svelte:window bind:innerWidth={breite} bind:innerHeight={hoehe} />

<section class="album" role="application" aria-label="Album" bind:this={szene} onpointermove={bewegen} onpointerup={hoch} onpointercancel={hoch}>
  <div class="himmel" aria-hidden="true"><div class="sonne"></div><div class="wolke w1"></div><div class="wolke w2"></div></div>
  <div class="meer" aria-hidden="true"></div>
  <div class="strand" aria-hidden="true"></div>

  {#if !karten.length}
    <div class="leer" aria-hidden="true">
      {#each [0, 1, 2] as i}<div class="platzhalter" style:--b="{kartenBreite}px"></div>{/each}
    </div>
  {/if}

  {#each karten as k, i (k.key)}
    {@const p = position(k, i)}
    <div
      class="karte"
      class:gezogen={gezogen === k.key}
      style:left="{p.x}%"
      style:top="{p.y}%"
      role="button"
      tabindex="0"
      aria-label="Karte anhören oder verschieben"
      onpointerdown={(e) => runter(e, k, i)}
      onkeydown={(e) => e.key === 'Enter' && vorlesen(k)}
    >
      <Sammelkarte regelId={k.regelId ?? null} ueberraschung={k.ueberraschung ?? null} breite={kartenBreite} />
    </div>
  {/each}

  <div class="zurueck">
    <Knopf label="Nach Hause" farbe="weiss" groesse={96} onclick={() => gehe('heimat')}><Icon name="haus" groesse={50} /></Knopf>
  </div>
</section>

<style>
  .album { position: absolute; inset: 0; overflow: hidden; touch-action: none; }
  .himmel { position: absolute; inset: 0 0 60% 0; background: linear-gradient(180deg, var(--himmel), var(--himmel-hell)); }
  .sonne { position: absolute; right: 10%; top: 14%; width: 14vmin; aspect-ratio: 1; border-radius: 50%; background: var(--sonne); border: 5px solid var(--tinte); }
  .wolke { position: absolute; width: 18vmin; height: 7vmin; border-radius: 999px; background: var(--weiss); border: 4px solid var(--tinte); }
  .w1 { left: 30%; top: 16%; }
  .w2 { left: 55%; top: 8%; transform: scale(0.7); }
  .meer {
    position: absolute; left: 0; right: 0; top: 40%; height: 22%;
    background: repeating-linear-gradient(170deg, transparent 0 40px, rgba(255, 255, 255, 0.25) 40px 46px), linear-gradient(180deg, #3aa6e8, var(--meer));
    border-top: 5px solid var(--tinte);
  }
  .strand {
    position: absolute; left: -5%; right: -5%; top: 58%; bottom: -10%;
    background: radial-gradient(circle at 20% 40%, rgba(255, 255, 255, 0.35) 0 2%, transparent 3%), radial-gradient(circle at 70% 70%, rgba(200, 150, 80, 0.3) 0 2%, transparent 3%), var(--sand);
    background-size: 90px 90px, 130px 130px, auto;
    border-top: 5px solid var(--tinte);
    border-radius: 50% 50% 0 0 / 18% 18% 0 0;
  }
  .karte { position: absolute; cursor: grab; touch-action: none; transition: transform 0.15s; z-index: 1; }
  .karte.gezogen { cursor: grabbing; transform: scale(1.08) rotate(-3deg); z-index: 5; filter: drop-shadow(0 16px 10px rgba(16, 36, 58, 0.3)); }
  .leer { position: absolute; left: 0; right: 0; top: 62%; display: flex; justify-content: center; gap: 40px; }
  .platzhalter { width: var(--b); aspect-ratio: 5 / 7; border: 5px dashed rgba(16, 36, 58, 0.45); border-radius: 18px; background: rgba(255, 253, 247, 0.35); }
  .zurueck { position: absolute; left: var(--rand-l); top: var(--rand-o); z-index: 10; }
</style>
