<!-- Elternbereich (hinter Eltern-Gate): Fortschritt, Gesprächsimpulse, Testmodus, Zurücksetzen. -->
<script>
  import Regelbild from '../ui/Regelbild.svelte';
  import ZielAnzeige from '../ui/ZielAnzeige.svelte';
  import GeraeteAbgleich from '../ui/GeraeteAbgleich.svelte';
  import { gehe } from '../router.svelte.js';
  import { app, REGELN, ALLE_REGELN, DETEKTIV, orden, monsterStufe, zuruecksetzen, karte, staende } from '../state/app.svelte.js';
  import { erfolgsTage, benoetigteTage } from '../state/fortschritt.js';
  import { szeneGeloest } from '../state/detektiv.js';

  let bestaetigen = $state(false);
  let zurueckgesetzt = $state(false);
  let name = $state(app.profil?.name ?? '');
  // Profil kann nachträglich per Geräte-Abgleich kommen → Namensfeld dann befüllen
  $effect(() => {
    if (!name && app.profil?.name) name = app.profil.name;
  });

  const ZIEL_NAME = { kennen: 'Kennen', verstehen: 'Verstehen', einschaetzen: 'Einschätzen' };
  const noetig = $derived(benoetigteTage({ testmodus: app.einstellungen.testmodus }));

  function reset() {
    if (!bestaetigen) {
      bestaetigen = true;
      setTimeout(() => (bestaetigen = false), 4000);
      return;
    }
    zuruecksetzen();
    bestaetigen = false;
    zurueckgesetzt = true;
  }

  function monsterNeu() {
    app.profil = null;
    gehe('onboarding');
  }

  function nameSpeichern(e) {
    e.preventDefault();
    if (app.profil && name.trim()) app.profil.name = name.trim();
  }
</script>

<section class="ansicht eltern">
  <header>
    <h1>Elternbereich</h1>
    <button type="button" class="knopf primaer" onclick={() => gehe('heimat')}>Zurück zur App</button>
  </header>

  <div class="spalten">
    <div class="block">
      <h2>Fortschritt</h2>
      <p class="klein">Orden: {orden()} · Monster-Stufe: {monsterStufe()}{app.einstellungen.testmodus ? ' · Testmodus an (1 Tag reicht)' : ''}</p>
      <p class="klein">Detektiv-Suchbilder gelöst: {DETEKTIV.filter((d) => szeneGeloest(app.fortschritt, d.id)).map((d) => d.id[0].toUpperCase() + d.id.slice(1)).join(', ') || 'noch keins'} ({DETEKTIV.filter((d) => szeneGeloest(app.fortschritt, d.id)).length} von {DETEKTIV.length}) – Wiederholung, zählt nicht für die Symbole.</p>
      <div class="legende">
        <h3>So lesen Sie die Symbole</h3>
        <ul>
          <li><ZielAnzeige staende={[{ ziel: 'kennen', stand: 'voll' }]} groesse={28} /> <span><strong>Auge = Kennen:</strong> „Welche Regel?“ im ersten Versuch richtig <em>und</em> Trainer „hat geklappt“ – am selben Tag.</span></li>
          <li><ZielAnzeige staende={[{ ziel: 'verstehen', stand: 'voll' }]} groesse={28} /> <span><strong>Glühbirne = Verstehen:</strong> „Warum?“ im ersten Versuch richtig <em>und</em> Trainer „hat geklappt“ – am selben Tag.</span></li>
          <li><ZielAnzeige staende={[{ ziel: 'einschaetzen', stand: 'voll' }]} groesse={28} /> <span><strong>Daumen = Einschätzen:</strong> alle Situationen einer Sitzung („Richtig oder falsch?“) im ersten Versuch richtig.</span></li>
          <li><span class="drei">{#each ['leer', 'halb', 'voll'] as stand}<ZielAnzeige staende={[{ ziel: 'kennen', stand }]} groesse={28} />{/each}</span> <span><strong>Grau</strong> = noch nicht · <strong>halb gelb</strong> = an 1 Tag geschafft · <strong>ganz gelb</strong> = an {noetig === 1 ? '1 Tag (Testmodus)' : '2 verschiedenen Tagen'} geschafft.</span></li>
          <li class="ohne-icon"><span>Sammelkarte: Bild wird farbig, sobald ein Symbol leuchtet. Rahmen <strong>glitzert</strong> bei 2 ganz gelben Symbolen, <strong>gold</strong> bei 3 – das ist ein <strong>Orden</strong>.</span></li>
        </ul>
      </div>
      {#each REGELN as r (r.id)}
        <article class="regel">
          <h3><span class="sym"><Regelbild regelId={r.id} /></span> Regel {r.id}: {r.kurz} <small>Karte {['weiß', 'weiß', 'glitzernd', 'gold (Orden)'][karte(r.id)]}</small></h3>
          <p class="merksatz">„{r.merksatz}“</p>
          <table>
            <tbody>
              {#each staende(r.id) as zs (zs.ziel)}
                {@const z = zs.ziel}
                {@const tage = erfolgsTage(app.fortschritt, r.id, z)}
                <tr>
                  <th><span class="zeile-ziel"><ZielAnzeige staende={[zs]} groesse={26} /> {ZIEL_NAME[z]}</span></th>
                  <td>{zs.stand === 'voll' ? 'geschafft' : `${tage.length} / ${noetig} Tage`}</td>
                  <td class="klein">{tage.map((t) => t.slice(5).split('-').reverse().join('.')).join(', ')}</td>
                </tr>
              {/each}
            </tbody>
          </table>
          {#if r.eltern_impuls}<p class="impuls"><strong>Gesprächsimpuls:</strong> {r.eltern_impuls}</p>{/if}
        </article>
      {/each}
      <p class="klein">Noch ohne Bilder (bald): {ALLE_REGELN.filter((a) => !REGELN.some((r) => r.id === a.id)).map((a) => a.kurz).join(', ')}</p>
    </div>

    <div class="block">
      <h2>Einstellungen</h2>
      <label class="schalter">
        <input type="checkbox" checked={app.einstellungen.testmodus} onchange={(e) => { app.einstellungen.testmodus = e.currentTarget.checked; app.gesehenEntwicklung = monsterStufe(); }} />
        <span class="spur"><span class="griff"></span></span>
        <span>Testmodus: ein Tag reicht</span>
      </label>

      {#if app.profil}
        <form class="zeile" onsubmit={nameSpeichern}>
          <label for="elternname">Monstername</label>
          <input id="elternname" bind:value={name} maxlength="18" />
          <button type="submit" class="knopf">Speichern</button>
        </form>
      {/if}

      <button type="button" class="knopf" onclick={monsterNeu}>Monster neu auswählen</button>

      <button type="button" class="knopf gefahr" onclick={reset}>
        {bestaetigen ? 'Wirklich? Nochmal tippen zum Zurücksetzen' : 'Fortschritt zurücksetzen'}
      </button>
      {#if zurueckgesetzt}<p class="klein">Fortschritt, Album und Zubehör wurden zurückgesetzt.</p>{/if}

      <GeraeteAbgleich />

      <p class="klein datenschutz">Alle Daten bleiben nur auf diesem Gerät (localStorage). Kein Konto, kein Server, kein Tracking.</p>
    </div>
  </div>
</section>

<style>
  .eltern { background: #f3f7fa; overflow: auto; font-weight: 500; font-size: 18px; line-height: 1.4; user-select: text; -webkit-user-select: text; }
  header { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 12px; }
  h1 { margin: 0; font-size: 32px; font-weight: 900; }
  h2 { margin: 0 0 8px; font-size: 22px; font-weight: 900; }
  h3 { margin: 0 0 4px; font-size: 19px; font-weight: 800; }
  h3 small { font-weight: 600; opacity: 0.6; margin-left: 8px; }
  .spalten { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; align-items: start; }
  .block { background: #fff; border: 3px solid var(--tinte); border-radius: 20px; padding: 18px 20px; display: grid; gap: 14px; }
  .regel { border-top: 2px solid #dde6ec; padding-top: 12px; }
  .merksatz { margin: 0 0 6px; font-style: italic; }
  table { border-collapse: collapse; width: 100%; }
  th { text-align: left; font-weight: 800; padding: 3px 12px 3px 0; width: 30%; }
  td { padding: 3px 12px 3px 0; }
  .klein { font-size: 15px; opacity: 0.75; margin: 0; }
  .impuls { margin: 8px 0 0; background: #fff8dc; border-radius: 12px; padding: 8px 12px; }
  .knopf {
    min-height: 56px; padding: 10px 18px; border-radius: 16px; border: 3px solid var(--tinte);
    background: var(--weiss); font-size: 18px; font-weight: 800; cursor: pointer; text-align: center;
  }
  .primaer { background: var(--sonne); }
  .gefahr { background: #ffe1dc; }
  .zeile { display: grid; grid-template-columns: auto 1fr auto; gap: 10px; align-items: center; }
  .zeile input { font: inherit; padding: 10px 12px; border: 3px solid var(--tinte); border-radius: 12px; min-height: 56px; width: 100%; }
  .schalter { display: flex; align-items: center; gap: 14px; min-height: 56px; cursor: pointer; font-weight: 800; }
  .schalter input { position: absolute; opacity: 0; width: 1px; height: 1px; }
  .spur { width: 72px; height: 42px; border-radius: 999px; background: #c9d4db; border: 3px solid var(--tinte); position: relative; flex: none; transition: background 0.2s; }
  .griff { position: absolute; top: 3px; left: 3px; width: 30px; height: 30px; border-radius: 50%; background: #fff; border: 3px solid var(--tinte); transition: transform 0.2s; }
  .schalter input:checked + .spur { background: var(--gras); }
  .schalter input:checked + .spur .griff { transform: translateX(30px); }
  .schalter input:focus-visible + .spur { outline: 4px solid var(--sonne); outline-offset: 3px; }
  .legende { background: #f3f7fa; border-radius: 14px; padding: 12px 14px; }
  .legende h3 { margin-bottom: 8px; }
  .legende ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
  .legende li { display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center; font-size: 16px; }
  .legende li.ohne-icon { grid-template-columns: 1fr; }
  .drei { display: inline-flex; gap: 4px; }
  .zeile-ziel { display: inline-flex; align-items: center; gap: 8px; }
  .datenschutz { border-top: 2px solid #dde6ec; padding-top: 10px; }
  .sym { display: inline-block; width: 44px; height: 44px; border-radius: 10px; overflow: hidden; vertical-align: middle; border: 2px solid var(--tinte); }
</style>
