<!--
  VERTRAG (von der App genutzt, Implementierung gehört dem Monster-Agenten):
  props:
    art:      'plitsch' | 'blubbo' | 'kiesel' | 'pingo' | 'tinti'
    stufe:    1 | 2 | 3
    farbe:    ID aus FARBEN (farben.js)
    muster:   'keins' | 'punkte' | 'streifen' | 'sterne'
    zubehoer: string[]  (taucherbrille, badekappe, handtuch_umhang, sonnenhut, rettungspfeife)
    pose:     basis: stehen|winken|jubeln|nachdenken|zeigen|erschrecken_leicht|schlafen
              gesten: abrubbeln|bauch_reiben|hand_an_bauch|haende_trichter|stopp_haende|hand_an_stirn|blitz_arme|wegwerfen|kopf_schuetteln|hand_ueber_augen
    groesse:  Zahl in px (Breite = Höhe), Standard 240
  Gesten/Posen animieren sich selbst in einer Schleife. Kein Text im SVG.

  Umsetzung: rig.js baut das SVG (viewBox 0 0 300 300, Monster steht unten mittig, Boden y≈288),
  posen.js erzeugt die CSS-Keyframes je (Art, Stufe, Pose) einmalig im <head>.
  Benannte Rig-Gruppen (data-teil): ganz, koerper, schwanz, kopf, augen, blick, mund, arm_links, arm_rechts, blasen.
  prefers-reduced-motion: Animationen aus, Pose bleibt als Standbild erkennbar.
-->
<script module>
  let zaehler = 0;
</script>

<script>
  import { baueMonster } from './rig.js';
  import { stelleCssBereit } from './posen.js';

  let { art = 'plitsch', stufe = 1, farbe = 'meerblau', muster = 'keins', zubehoer = [], pose = 'stehen', groesse = 240 } = $props();

  const uid = `wm${++zaehler}`;
  const bau = $derived(baueMonster({ art, stufe, farbe, muster, zubehoer, pose }, uid));
  $effect.pre(() => stelleCssBereit(bau.schluessel, bau.css));
</script>

<svg
  class="wm {bau.schluessel}"
  viewBox="0 0 300 300"
  width={groesse}
  height={groesse}
  overflow="visible"
  role="img"
  aria-label={art}
>
  {@html `<defs>${bau.defs}</defs>${bau.innen}`}
</svg>

<style>
  svg {
    display: block;
    overflow: visible;
    -webkit-tap-highlight-color: transparent;
  }
</style>
