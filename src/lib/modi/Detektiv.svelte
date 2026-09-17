<!--
  Modus C „Regel-Detektiv“: Suchbild. Fehler antippen (Lupe füllt sich), Richtig-Funde sind optional (Stern).
  Daneben tippen: neutrale Wasserblase, keine Wertung. Tipp nach ~25 s ohne Fund, per Glühbirne oder nach mehreren Fehltipps.
  Trefferkoordinaten beziehen sich auf das sichtbare 3:2-Bild (Letterboxing wird herausgerechnet).
-->
<script>
  import { untrack } from 'svelte';
  import Knopf from '../ui/Knopf.svelte';
  import Icon from '../ui/Icon.svelte';
  import Partner from '../ui/Partner.svelte';
  import Piktogramm from '../ui/Piktogramm.svelte';
  import Konfetti from '../ui/Konfetti.svelte';
  import Sammelkarte from '../ui/Sammelkarte.svelte';
  import { spiele, spieleFolge, warte, pfad } from '../audio.js';
  import { gehe } from '../router.svelte.js';
  import { app, szeneVon, heute } from '../state/app.svelte.js';
  import {
    SEITENVERHAELTNIS, bildRechteck, punktImBild, trefferPruefen, fehlerFunde, richtigFunde, alleFehlerGefunden,
    naechsterTipp, szeneLoesen, szeneSpielbar,
  } from '../state/detektiv.js';

  let props = $props();
  const szene = untrack(() => szeneVon(props.szeneId));

  const TIPP_NACH_MS = 25000;
  const FEHLTIPPS_BIS_TIPP = 5;

  let gefunden = $state([]);
  let blasen = $state([]);
  let tippId = $state(null);
  let pose = $state('nachdenken');
  let fertig = $state(null); // { karte } sobald alle Fehler gefunden
  let breite = $state(0);
  let hoehe = $state(0);
  let fensterHoehe = $state(820);
  let flaeche = $state();
  let lebt = true;
  let letzteAktivitaet = Date.now();
  let fehltipps = 0;
  let blasenZaehler = 0;

  const rechteck = $derived(bildRechteck(breite, hoehe, SEITENVERHAELTNIS));
  const fehler = szene ? fehlerFunde(szene) : [];
  const richtige = szene ? richtigFunde(szene) : [];
  const audio = (schluessel) => `audio/detektiv/${szene.id}-${schluessel}.m4a`;

  $effect(() => {
    if (!szene || !szeneSpielbar(szene, szene.bildVorhanden)) {
      gehe('detektiv');
      return;
    }
    warte(500).then(() => lebt && spiele(audio('intro')));
    const uhr = setInterval(() => {
      if (!fertig && !tippId && Date.now() - letzteAktivitaet > TIPP_NACH_MS) tipp();
    }, 1000);
    return () => {
      lebt = false;
      clearInterval(uhr);
    };
  });

  function tipp() {
    const f = naechsterTipp(szene, gefunden);
    if (!f || fertig) return;
    tippId = f.id;
    letzteAktivitaet = Date.now();
    fehltipps = 0;
    spiele(pfad.app('detektiv-tipp'));
    setTimeout(() => tippId === f.id && (tippId = null), 7000);
  }

  function tippen(e) {
    if (fertig) return;
    const box = flaeche.getBoundingClientRect();
    const p = punktImBild(e.clientX - box.left, e.clientY - box.top, rechteck);
    if (!p) return;
    const fund = trefferPruefen(szene.funde, p.x, p.y);
    if (!fund) return daneben(p);

    letzteAktivitaet = Date.now();
    if (gefunden.includes(fund.id)) {
      spiele(audio(fund.id));
      return;
    }
    gefunden = [...gefunden, fund.id];
    if (tippId === fund.id) tippId = null;
    pose = fund.art === 'fehler' ? 'zeigen' : 'jubeln';
    fehltipps = 0;

    if (fund.art === 'fehler' && alleFehlerGefunden(szene, gefunden)) return abschluss(fund);
    spiele(audio(fund.id)).then((ok) => ok && lebt && (pose = 'nachdenken'));
  }

  function daneben(p) {
    const id = ++blasenZaehler;
    blasen = [...blasen, { id, x: p.x, y: p.y }];
    setTimeout(() => (blasen = blasen.filter((b) => b.id !== id)), 900);
    fehltipps++;
    if (fehltipps >= FEHLTIPPS_BIS_TIPP && !tippId) tipp();
    else if (fehltipps === 3) spiele(pfad.app('detektiv-weiter')); // sanft, einmal vor dem Tipp
  }

  async function abschluss(letzter) {
    const ergebnis = szeneLoesen(app.fortschritt, szene.id, heute());
    app.fortschritt = ergebnis.fortschritt;
    tippId = null;
    const ok = await spiele(audio(letzter.id));
    if (!lebt || !ok) {
      if (lebt) fertig = { karte: ergebnis.karte };
      return;
    }
    fertig = { karte: ergebnis.karte };
    pose = 'jubeln';
    await spieleFolge([pfad.app('detektiv-fertig'), ...(ergebnis.karte ? [pfad.app('ueberraschung')] : [])]);
  }
</script>

<svelte:window bind:innerHeight={fensterHoehe} />

{#if szene}
  <section class="detektiv">
    <header class="leiste">
      <Knopf label="Zurück zur Szenenwahl" farbe="weiss" groesse={88} onclick={() => gehe('detektiv')}><Icon name="zurueck" groesse={46} /></Knopf>
      <div class="fortschritt" aria-label="{gefunden.filter((g) => fehler.some((f) => f.id === g)).length} von {fehler.length} gefunden">
        {#each fehler as f (f.id)}
          <span class="lupe" class:an={gefunden.includes(f.id)}><Icon name="lupe" groesse={44} fuellung={gefunden.includes(f.id) ? '#ffd23f' : 'none'} /></span>
        {/each}
        {#if richtige.length}
          <span class="trenner" aria-hidden="true"></span>
          {#each richtige as f (f.id)}
            <span class="kleinstern" class:an={gefunden.includes(f.id)}><Icon name="stern" groesse={30} farbe={gefunden.includes(f.id) ? '#10243a' : '#9fb2bf'} /></span>
          {/each}
        {/if}
      </div>
      <!-- Monster und Lautsprecher in der Kopfleiste, damit sie keine Stellen im Suchbild verdecken -->
      <div class="werkzeuge">
        <div class="monster" aria-hidden="true"><Partner groesse={Math.min(96, fensterHoehe * 0.12)} {pose} wippen={false} /></div>
        <Knopf label="Nochmal anhören" farbe="weiss" groesse={88} onclick={() => spiele(audio('intro'))}><Icon name="lautsprecher" /></Knopf>
        <Knopf label="Tipp" farbe="sonne" groesse={88} onclick={tipp} disabled={!!fertig}><Icon name="gluehbirne" groesse={48} fuellung="#fffdf7" /></Knopf>
      </div>
    </header>

    <div class="flaeche" bind:this={flaeche} bind:clientWidth={breite} bind:clientHeight={hoehe}>
      {#if rechteck.breite > 0}
        <div
          class="bild"
          style:left="{rechteck.links}px"
          style:top="{rechteck.oben}px"
          style:width="{rechteck.breite}px"
          style:height="{rechteck.hoehe}px"
          role="application"
          aria-label="Suchbild: tippe auf Kinder, die eine Regel vergessen"
          onpointerdown={tippen}
        >
          <img src={szene.bild} alt="" draggable="false" />

          {#each szene.funde as f (f.id)}
            {#if f.bereich && (gefunden.includes(f.id) || tippId === f.id)}
              <span
                class="kreis {f.art}"
                class:tipp={tippId === f.id && !gefunden.includes(f.id)}
                style:left="{f.bereich.x}%"
                style:top="{f.bereich.y}%"
                style:width="{f.bereich.r * 2}%"
                aria-hidden="true"
              ></span>
              {#if gefunden.includes(f.id)}
                <span
                  class="marke {f.art}"
                  style:left="{f.bereich.x + f.bereich.r * 0.72}%"
                  style:top="{f.bereich.y - f.bereich.r * SEITENVERHAELTNIS * 0.72}%"
                  aria-hidden="true"
                >
                  {#if f.art === 'fehler'}<Piktogramm regelId={f.regel} groesse={66} />{:else}<Icon name="stern" groesse={34} farbe="#10243a" />{/if}
                </span>
              {/if}
            {/if}
          {/each}

          {#each blasen as b (b.id)}
            <span class="blase" style:left="{b.x}%" style:top="{b.y}%" aria-hidden="true"><i></i><i></i><i></i></span>
          {/each}
        </div>
      {/if}
    </div>


    {#if fertig}
      <div class="feier" role="dialog" aria-label="Alle gefunden">
        <div class="strahlen" aria-hidden="true"></div>
        <Konfetti />
        <div class="inhalt">
          <div class="abzeichen" aria-hidden="true"><Icon name="lupe" groesse={120} fuellung="#ffd23f" /></div>
          <Partner groesse={Math.min(280, fensterHoehe * 0.36)} pose="jubeln" />
          {#if fertig.karte}
            <Sammelkarte ueberraschung={fertig.karte} breite={Math.min(200, fensterHoehe * 0.3)} neu />
          {/if}
        </div>
        <div class="weiter">
          <Knopf label="Weiter" farbe="gras" groesse={120} pulsieren onclick={() => gehe('detektiv')}><Icon name="weiter" groesse={64} /></Knopf>
        </div>
      </div>
    {/if}
  </section>
{/if}

<style>
  .detektiv {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, #1d5f8f, var(--meer-tief));
    display: grid;
    grid-template-rows: auto 1fr;
    padding: var(--rand-o) var(--rand-r) var(--rand-u) var(--rand-l);
    gap: 10px;
  }
  .leiste { display: flex; justify-content: space-between; align-items: center; gap: 16px; position: relative; z-index: 3; }
  .fortschritt {
    display: flex; align-items: center; gap: 8px;
    background: var(--weiss); border: var(--linie) solid var(--tinte); box-shadow: 0 5px 0 var(--tinte);
    border-radius: 999px; padding: 6px 18px;
  }
  .lupe { display: grid; place-items: center; color: #9fb2bf; transition: transform 0.3s var(--weich); }
  .lupe.an { color: var(--tinte); animation: hereinploppen 0.5s var(--weich) both; }
  .trenner { width: 3px; height: 34px; background: #dde6ec; border-radius: 2px; margin: 0 4px; }
  .kleinstern { display: grid; place-items: center; }
  .kleinstern.an { animation: hereinploppen 0.5s var(--weich) both; }

  .flaeche { position: relative; min-height: 0; }
  .bild {
    position: absolute;
    border-radius: 18px;
    outline: var(--linie) solid var(--tinte);
    overflow: hidden;
    touch-action: manipulation;
    cursor: pointer;
    background: var(--tinte);
  }
  .bild img { width: 100%; height: 100%; display: block; pointer-events: none; }

  .kreis {
    position: absolute;
    aspect-ratio: 1;
    translate: -50% -50%;
    border-radius: 50%;
    pointer-events: none;
    animation: hereinploppen 0.4s var(--weich) both;
  }
  .kreis.fehler { border: 8px solid var(--orange); box-shadow: 0 0 0 4px var(--tinte), inset 0 0 0 4px var(--tinte); }
  .kreis.richtig { border: 8px solid var(--gras); box-shadow: 0 0 0 4px var(--tinte), inset 0 0 0 4px var(--tinte); }
  .kreis.tipp {
    border: 6px dashed var(--sonne);
    box-shadow: 0 0 0 9999px rgba(16, 36, 58, 0.18);
    animation: tipp 1.4s ease-in-out infinite;
  }
  @keyframes tipp { 0%, 100% { transform: scale(0.9); opacity: 0.7 } 50% { transform: scale(1.1); opacity: 1 } }

  .marke {
    position: absolute;
    width: clamp(48px, 5.5vw, 66px); aspect-ratio: 1;
    translate: -50% -50%;
    border-radius: 50%; overflow: hidden;
    border: 4px solid var(--tinte); box-shadow: 0 4px 0 var(--tinte);
    background: var(--weiss);
    display: grid; place-items: center;
    pointer-events: none;
    animation: hereinploppen 0.5s 0.15s var(--weich) both;
  }
  .marke :global(svg) { width: 100%; height: 100%;
  }
  .marke.richtig { background: var(--gras); }

  .blase { position: absolute; width: 0; height: 0; pointer-events: none; }
  .blase i {
    position: absolute; left: -9px; top: -9px;
    width: 18px; height: 18px; border-radius: 50%;
    border: 3px solid rgba(255, 255, 255, 0.95);
    background: rgba(201, 240, 255, 0.35);
    animation: blubb 0.9s ease-out both;
  }
  .blase i:nth-child(2) { left: 6px; width: 12px; height: 12px; animation-delay: 0.1s; }
  .blase i:nth-child(3) { left: -18px; top: -2px; width: 9px; height: 9px; animation-delay: 0.18s; }
  @keyframes blubb { from { transform: translateY(0) scale(0.4); opacity: 1 } to { transform: translateY(-46px) scale(1.2); opacity: 0 } }

  .werkzeuge { display: flex; gap: 16px; align-items: center; }
  .monster { pointer-events: none; line-height: 0; }

  .feier {
    position: fixed; inset: 0; z-index: 50;
    display: grid; place-items: center; overflow: hidden;
    background: radial-gradient(circle, #fff5c4 0%, var(--sonne) 40%, var(--orange) 100%);
    animation: hereinploppen 0.4s ease-out both;
  }
  .strahlen {
    position: absolute; width: 180vmax; height: 180vmax;
    background: repeating-conic-gradient(rgba(255, 255, 255, 0.35) 0 10deg, transparent 10deg 20deg);
    animation: drehen 30s linear infinite;
  }
  @keyframes drehen { to { transform: rotate(360deg) } }
  .inhalt { position: relative; display: flex; align-items: center; gap: 4vw; }
  .abzeichen {
    width: 180px; height: 180px; border-radius: 50%;
    background: var(--weiss); border: 7px solid var(--tinte); box-shadow: 0 10px 0 var(--tinte);
    display: grid; place-items: center;
    animation: hereinploppen 0.6s var(--weich) both, wackeln 0.6s 0.6s ease-in-out 2;
  }
  .weiter { position: absolute; right: var(--rand-r); bottom: var(--rand-u); }
  @media (prefers-reduced-motion: reduce) {
    .kreis.tipp { animation: none; }
  }
</style>
