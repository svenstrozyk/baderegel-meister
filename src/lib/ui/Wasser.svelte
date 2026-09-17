<!-- Hintergrund: Himmel oben, animierte Wellenbänder unten. -->
<script>
  let { hoehe = 34, ruhig = false, sonne = true } = $props();
</script>

<div class="wasser" class:ruhig style:--h="{hoehe}%" aria-hidden="true">
  {#if sonne}<div class="sonne"></div>{/if}
  <svg class="welle w1" viewBox="0 0 1200 100" preserveAspectRatio="none"><path d="M0 50 Q150 0 300 50 T600 50 T900 50 T1200 50 V100 H0Z" /></svg>
  <svg class="welle w2" viewBox="0 0 1200 100" preserveAspectRatio="none"><path d="M0 50 Q150 100 300 50 T600 50 T900 50 T1200 50 V100 H0Z" /></svg>
  <div class="tief"></div>
</div>

<style>
  .wasser {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, var(--himmel) 0%, var(--himmel-hell) 55%, #e9fbff 100%);
    overflow: hidden;
    z-index: 0;
  }
  .sonne {
    position: absolute;
    right: 8%;
    top: 6%;
    width: 13vmin;
    aspect-ratio: 1;
    border-radius: 50%;
    background: var(--sonne);
    border: 5px solid var(--tinte);
    box-shadow: 0 0 0 14px rgba(255, 210, 63, 0.35);
  }
  .welle { position: absolute; left: 0; width: 200%; height: 7vh; bottom: calc(var(--h) - 3.5vh); animation: fliessen 14s linear infinite; }
  .welle path { stroke: var(--tinte); stroke-width: 5; vector-effect: non-scaling-stroke; }
  .w1 path { fill: #3aa6e8; }
  .w2 { bottom: calc(var(--h) - 5.5vh); animation-duration: 20s; animation-direction: reverse; }
  .w2 path { fill: var(--meer); }
  .tief { position: absolute; left: 0; right: 0; bottom: 0; height: calc(var(--h) - 2vh); background: var(--meer); }
  .ruhig .welle { animation: none; }
  @keyframes fliessen { from { transform: translateX(0) } to { transform: translateX(-50%) } }
</style>
