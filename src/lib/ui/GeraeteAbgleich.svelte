<!-- Elternbereich: Fortschritt zwischen zwei Geräten abgleichen – ohne Konto und ohne Server (QR-Code, Zwischenablage oder Datei). -->
<script>
  import { tick } from 'svelte';
  import { app, ALLE_IDS, MONSTER, opts } from '../state/app.svelte.js';
  import { ordenAnzahl } from '../state/fortschritt.js';
  import { kodieren, dekodieren, zusammenfuehren } from '../state/abgleich.js';

  const DATEINAME = 'baderegel-meister-abgleich.txt';

  // modus: null | 'senden' | 'scannen' | 'einfuegen'
  let modus = $state(null);
  let code = $state('');
  let qrSvg = $state('');
  let hinweis = $state('');
  let fehler = $state('');
  let eingabe = $state('');
  let pruefung = $state(null); // Ergebnis von zusammenfuehren()
  let fertig = $state(false);
  let video = $state();
  let dateiFeld = $state();

  let kamera = null; // MediaStream
  let scanTimer = 0;

  const stand = () => {
    const s = $state.snapshot(app);
    return { profil: s.profil, fortschritt: s.fortschritt, album: s.album };
  };

  function zuruecksetzenAnzeige() {
    hinweis = '';
    fehler = '';
    fertig = false;
    pruefung = null;
  }

  // ---------- Senden ----------

  async function senden() {
    kameraStopp();
    zuruecksetzenAnzeige();
    modus = 'senden';
    qrSvg = '';
    try {
      code = await kodieren(stand());
      const { default: qrcode } = await import('qrcode-generator');
      const qr = qrcode(0, code.length < 600 ? 'M' : 'L');
      qr.addData(code, 'Byte');
      qr.make();
      qrSvg = qrAlsSvg(qr);
    } catch (e) {
      console.error(e);
      fehler = code ? 'Der QR-Code konnte nicht erzeugt werden. Bitte „Code kopieren“ oder „Als Datei teilen“ nutzen.' : 'Der Code konnte nicht erzeugt werden.';
    }
  }

  function qrAlsSvg(qr) {
    const n = qr.getModuleCount();
    const rand = 4;
    let pfad = '';
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) if (qr.isDark(y, x)) pfad += `M${x + rand} ${y + rand}h1v1h-1z`;
    }
    const g = n + 2 * rand;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g} ${g}" shape-rendering="crispEdges" role="img" aria-label="QR-Code mit dem Fortschritt"><rect width="${g}" height="${g}" fill="#fff"/><path d="${pfad}" fill="#000"/></svg>`;
  }

  async function kopieren() {
    fehler = '';
    try {
      await navigator.clipboard.writeText(code);
      hinweis = 'Code kopiert. Auf dem anderen Gerät (gleiche Apple-ID: Universelle Zwischenablage) unter „Code einfügen“ einsetzen.';
    } catch {
      fehler = 'Kopieren hat nicht geklappt. Bitte „Als Datei teilen“ nutzen.';
    }
  }

  async function alsDatei() {
    fehler = '';
    const datei = new File([code], DATEINAME, { type: 'text/plain' });
    try {
      if (navigator.canShare?.({ files: [datei] })) {
        await navigator.share({ files: [datei], title: 'Baderegel-Meister Fortschritt' });
        hinweis = 'Datei geteilt. Auf dem anderen Gerät unter „Datei öffnen“ auswählen.';
        return;
      }
    } catch (e) {
      if (e?.name === 'AbortError') return;
    }
    const url = URL.createObjectURL(datei);
    const a = Object.assign(document.createElement('a'), { href: url, download: DATEINAME });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    hinweis = 'Datei gespeichert. Auf das andere Gerät bringen (z. B. AirDrop) und dort unter „Datei öffnen“ auswählen.';
  }

  // ---------- Holen ----------

  async function verarbeiten(text) {
    fehler = '';
    hinweis = '';
    try {
      const fremd = await dekodieren(text);
      if (fremd.profil && !MONSTER.monster.some((m) => m.id === fremd.profil.art)) fremd.profil = null;
      const o = opts();
      pruefung = zusammenfuehren(stand(), fremd, { ordenAnzahl: (fp) => ordenAnzahl(fp, ALLE_IDS, o) });
      kameraStopp();
      modus = null;
      eingabe = '';
    } catch (e) {
      fehler = e instanceof Error && e.message ? e.message : 'Der Code konnte nicht gelesen werden.';
    }
  }

  async function einfuegenAusZwischenablage() {
    fehler = '';
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        fehler = 'Die Zwischenablage ist leer.';
        return;
      }
      eingabe = text;
      await verarbeiten(text);
    } catch {
      fehler = 'Kein Zugriff auf die Zwischenablage. Bitte den Code lange ins Feld tippen und „Einsetzen“ wählen.';
    }
  }

  async function dateiGewaehlt(e) {
    const datei = e.currentTarget.files?.[0];
    e.currentTarget.value = '';
    if (!datei) return;
    zuruecksetzenAnzeige();
    kameraStopp();
    modus = null;
    if (datei.size > 100_000) {
      fehler = 'Diese Datei ist kein Baderegel-Meister-Code.';
      return;
    }
    await verarbeiten(await datei.text());
  }

  async function scannen() {
    kameraStopp();
    zuruecksetzenAnzeige();
    if (!navigator.mediaDevices?.getUserMedia) {
      fehler = 'Die Kamera ist hier nicht verfügbar (nur in der installierten App bzw. über https). Bitte „Code einfügen“ oder „Datei öffnen“ nutzen.';
      return;
    }
    modus = 'scannen';
    await tick();
    try {
      const [{ default: jsQR }, strom] = await Promise.all([
        import('jsqr'),
        navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } } }),
      ]);
      if (modus !== 'scannen') {
        strom.getTracks().forEach((t) => t.stop());
        return;
      }
      kamera = strom;
      video.srcObject = strom;
      await video.play().catch(() => {});
      scanSchleife(jsQR);
    } catch (e) {
      kameraStopp();
      modus = null;
      fehler = kameraFehler(e);
    }
  }

  function kameraFehler(e) {
    if (e?.name === 'NotAllowedError' || e?.name === 'SecurityError') return 'Kein Zugriff auf die Kamera. Bitte den Kamerazugriff erlauben (Einstellungen) oder „Code einfügen“ nutzen.';
    if (e?.name === 'NotFoundError' || e?.name === 'OverconstrainedError') return 'Keine Kamera gefunden. Bitte „Code einfügen“ oder „Datei öffnen“ nutzen.';
    if (e?.name === 'NotReadableError') return 'Die Kamera wird gerade von einer anderen App benutzt.';
    return 'Die Kamera konnte nicht gestartet werden. Bitte „Code einfügen“ oder „Datei öffnen“ nutzen.';
  }

  function scanSchleife(jsQR) {
    const leinwand = document.createElement('canvas');
    const ctx = leinwand.getContext('2d', { willReadFrequently: true });
    const eigener = kamera;
    let pruefe = false;
    const schritt = async () => {
      if (!kamera || kamera !== eigener || !video) return;
      const w = video.videoWidth;
      const h = video.videoHeight;
      if (w && h && !pruefe) {
        const f = Math.min(1, 1280 / Math.max(w, h));
        leinwand.width = Math.round(w * f);
        leinwand.height = Math.round(h * f);
        ctx.drawImage(video, 0, 0, leinwand.width, leinwand.height);
        const bild = ctx.getImageData(0, 0, leinwand.width, leinwand.height);
        const treffer = jsQR(bild.data, bild.width, bild.height, { inversionAttempts: 'dontInvert' });
        if (treffer?.data?.startsWith('BRM')) {
          pruefe = true;
          await verarbeiten(treffer.data);
          pruefe = false;
          if (kamera !== eigener) return;
        } else if (treffer?.data) {
          fehler = 'Das ist kein Baderegel-Meister-Code.';
        }
      }
      scanTimer = setTimeout(schritt, 250);
    };
    schritt();
  }

  function kameraStopp() {
    clearTimeout(scanTimer);
    scanTimer = 0;
    kamera?.getTracks().forEach((t) => t.stop());
    kamera = null;
    if (video) video.srcObject = null;
  }

  function schliessen() {
    kameraStopp();
    modus = null;
    fehler = '';
  }

  // Kamera beim Verlassen des Elternbereichs sicher ausschalten
  $effect(() => () => kameraStopp());

  function uebernehmen() {
    if (!pruefung) return;
    const m = $state.snapshot(pruefung);
    app.fortschritt = m.fortschritt;
    app.album = m.album;
    if (!app.profil && m.profil) app.profil = m.profil;
    pruefung = null;
    fertig = true;
  }

  const plural = (n, eins, mehr) => `${n} ${n === 1 ? eins : mehr}`;
</script>

<section class="abgleich" aria-labelledby="abgleich-titel">
  <h2 id="abgleich-titel">Geräte abgleichen</h2>
  <p class="klein">Fortschritt z. B. zwischen iPad und iPhone übertragen – direkt von Gerät zu Gerät, ohne Konto und ohne Server. Nichts geht verloren: beide Stände werden zusammengeführt.</p>

  <h3>Dieses Gerät senden</h3>
  <div class="knoepfe">
    <button type="button" class="knopf" onclick={senden}>QR-Code zeigen</button>
    {#if modus === 'senden' && code}
      <button type="button" class="knopf" onclick={kopieren}>Code kopieren</button>
      <button type="button" class="knopf" onclick={alsDatei}>Als Datei teilen</button>
    {/if}
  </div>
  {#if modus === 'senden'}
    <div class="feld">
      {#if qrSvg}
        <div class="qr">{@html qrSvg}</div>
        <p class="klein">Auf dem anderen Gerät im Elternbereich „QR-Code scannen“ wählen und diesen Code filmen. ({code.length} Zeichen)</p>
      {:else if !fehler}
        <p class="klein">Code wird erstellt …</p>
      {/if}
      <button type="button" class="knopf" onclick={schliessen}>Schließen</button>
    </div>
  {/if}

  <h3>Von anderem Gerät holen</h3>
  <div class="knoepfe">
    <button type="button" class="knopf" onclick={scannen}>QR-Code scannen</button>
    <button type="button" class="knopf" onclick={() => { kameraStopp(); zuruecksetzenAnzeige(); modus = 'einfuegen'; }}>Code einfügen</button>
    <button type="button" class="knopf" onclick={() => dateiFeld.click()}>Datei öffnen</button>
    <input bind:this={dateiFeld} type="file" accept=".txt,text/plain" class="versteckt" onchange={dateiGewaehlt} />
  </div>

  {#if modus === 'scannen'}
    <div class="feld">
      <!-- svelte-ignore a11y_media_has_caption -->
      <video bind:this={video} class="kamera" playsinline muted autoplay></video>
      <p class="klein">Kamera auf den QR-Code des anderen Geräts richten. Der Code wird automatisch erkannt.</p>
      <button type="button" class="knopf" onclick={schliessen}>Kamera schließen</button>
    </div>
  {/if}

  {#if modus === 'einfuegen'}
    <div class="feld">
      <label for="abgleich-code" class="klein">Kopierten Code hier einsetzen:</label>
      <textarea id="abgleich-code" bind:value={eingabe} rows="4" spellcheck="false" autocomplete="off" autocapitalize="off" placeholder="BRM1:…"></textarea>
      <div class="knoepfe">
        <button type="button" class="knopf" onclick={einfuegenAusZwischenablage}>Aus Zwischenablage</button>
        <button type="button" class="knopf primaer" disabled={!eingabe.trim()} onclick={() => verarbeiten(eingabe)}>Code prüfen</button>
        <button type="button" class="knopf" onclick={schliessen}>Abbrechen</button>
      </div>
    </div>
  {/if}

  {#if fehler}<p class="meldung fehler" role="alert">{fehler}</p>{/if}
  {#if hinweis}<p class="meldung" role="status">{hinweis}</p>{/if}

  {#if pruefung}
    {@const z = pruefung.zusammenfassung}
    <div class="feld pruefung" role="group" aria-label="Übernahme bestätigen">
      <h3>Das kommt dazu</h3>
      {#if z.nichtsNeu}
        <p>Keine neuen Lernerfolge – dieses Gerät ist schon auf dem Stand des anderen.</p>
      {:else}
        <ul>
          <li>Orden: {z.ordenVorher} → <strong>{z.ordenNachher}</strong></li>
          <li>{plural(z.neueTage, 'neuer Übungstag', 'neue Übungstage')} · {plural(z.neueTeilerfolge, 'neuer Teilerfolg', 'neue Teilerfolge')}</li>
          {#if z.neueUeberraschungen.length}<li>{plural(z.neueUeberraschungen.length, 'neue Überraschungskarte', 'neue Überraschungskarten')}</li>{/if}
          {#if z.neueGeschichten}<li>{plural(z.neueGeschichten, 'Geschichte', 'Geschichten')} neu gesehen</li>{/if}
          {#if z.neueDetektiv.length}<li>{plural(z.neueDetektiv.length, 'Suchbild', 'Suchbilder')} neu gelöst</li>{/if}
          {#if z.profilUebernommen}<li>Monster „{pruefung.profil.name}“ wird übernommen</li>{/if}
        </ul>
      {/if}
      <div class="knoepfe">
        <button type="button" class="knopf primaer" onclick={uebernehmen}>Übernehmen</button>
        <button type="button" class="knopf" onclick={() => (pruefung = null)}>Abbrechen</button>
      </div>
    </div>
  {/if}

  {#if fertig}
    <p class="meldung erfolg" role="status">Übernommen! Damit beide Geräte gleich sind: jetzt dieses Gerät senden und auf dem anderen scannen.</p>
  {/if}
</section>

<style>
  .abgleich { display: grid; gap: 12px; border-top: 2px solid #dde6ec; padding-top: 14px; }
  h2 { margin: 0; font-size: 22px; font-weight: 900; }
  h3 { margin: 4px 0 0; font-size: 19px; font-weight: 800; }
  .klein { font-size: 15px; opacity: 0.75; margin: 0; }
  .knoepfe { display: flex; flex-wrap: wrap; gap: 10px; }
  .knopf {
    min-height: 56px; padding: 10px 18px; border-radius: 16px; border: 3px solid var(--tinte);
    background: var(--weiss); font: inherit; font-size: 18px; font-weight: 800; cursor: pointer; text-align: center; color: var(--tinte);
  }
  .knopf:disabled { opacity: 0.5; cursor: default; }
  .primaer { background: var(--sonne); }
  .feld { background: #f3f7fa; border-radius: 14px; padding: 12px 14px; display: grid; gap: 10px; justify-items: start; }
  .qr { width: min(100%, 440px); background: #fff; border: 3px solid var(--tinte); border-radius: 12px; overflow: hidden; line-height: 0; }
  .qr :global(svg) { width: 100%; height: auto; display: block; }
  .kamera { width: min(100%, 480px); aspect-ratio: 4 / 3; object-fit: cover; background: #000; border-radius: 12px; border: 3px solid var(--tinte); }
  textarea { font: 15px/1.3 ui-monospace, Menlo, monospace; width: 100%; box-sizing: border-box; padding: 10px 12px; border: 3px solid var(--tinte); border-radius: 12px; resize: vertical; word-break: break-all; }
  .versteckt { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
  .meldung { margin: 0; border-radius: 12px; padding: 8px 12px; background: #e6f1f8; }
  .fehler { background: #ffe1dc; }
  .erfolg { background: #dff5e4; }
  .pruefung ul { margin: 0; padding-left: 20px; display: grid; gap: 4px; }
  .pruefung h3 { margin: 0; }
</style>
