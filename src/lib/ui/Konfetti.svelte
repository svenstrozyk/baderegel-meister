<!-- Konfetti-Blasen, die aus der Mitte platzen (Feier, Detektiv-Abschluss). -->
<script>
  let { anzahl = 18 } = $props();
</script>

<div class="konfetti" aria-hidden="true">
  {#each Array(anzahl) as _, i}<i style:--i={i} style:--w="{(360 / anzahl) * i}deg"></i>{/each}
</div>

<style>
  .konfetti { position: absolute; inset: 0; pointer-events: none; }
  .konfetti i {
    position: absolute; left: 50%; top: 50%;
    width: 22px; height: 22px; border-radius: 50%;
    border: 3px solid var(--tinte);
    background: hsl(calc(var(--i) * 40) 90% 65%);
    animation: platzen 1.4s ease-out both;
  }
  @keyframes platzen {
    from { transform: rotate(var(--w)) translateY(0) scale(0.3); opacity: 1 }
    to { transform: rotate(var(--w)) translateY(-42vmin) scale(1); opacity: 0 }
  }
</style>
