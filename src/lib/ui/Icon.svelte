<!-- Einfache, dicke Outline-Icons (kein Text). -->
<script>
  let { name, groesse = 48, farbe = 'currentColor', fuellung = 'none' } = $props();
</script>

<svg viewBox="0 0 48 48" width={groesse} height={groesse} aria-hidden="true" fill="none" stroke={farbe} stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
  {#if name === 'weiter'}
    <path d="M10 24h26M26 12l12 12-12 12" />
  {:else if name === 'zurueck'}
    <path d="M38 24H12M22 12L10 24l12 12" />
  {:else if name === 'haus'}
    <path d="M7 23L24 8l17 15" /><path d="M12 20v19h24V20" /><path d="M20 39V28h8v11" />
  {:else if name === 'album'}
    <rect x="8" y="8" width="32" height="32" rx="6" /><path d="M8 32l9-9 7 7 5-5 11 11" /><circle cx="31" cy="17" r="3.5" fill={farbe} />
  {:else if name === 'orden'}
    <path d="M16 5l8 12 8-12" /><circle cx="24" cy="30" r="12" /><path d="M24 23.5l2 4.2 4.5.5-3.4 3 1 4.5-4.1-2.4-4.1 2.4 1-4.5-3.4-3 4.5-.5z" fill={farbe} stroke-width="1.5" />
  {:else if name === 'lautsprecher'}
    <path d="M8 19h8l10-8v26l-10-8H8z" fill={farbe} /><path d="M33 17a10 10 0 010 14M38 12a17 17 0 010 24" />
  {:else if name === 'haken'}
    <path d="M9 25l10 10L39 13" stroke-width="7" />
  {:else if name === 'nochmal'}
    <path d="M38 24a14 14 0 11-4.1-9.9" /><path d="M36 6v9h-9" />
  {:else if name === 'schloss'}
    <rect x="10" y="21" width="28" height="20" rx="4" /><path d="M16 21v-6a8 8 0 0116 0v6" />
  {:else if name === 'zahnrad'}
    <circle cx="24" cy="24" r="7" /><path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.6 10.6l4.2 4.2M33.2 33.2l4.2 4.2M10.6 37.4l4.2-4.2M33.2 14.8l4.2-4.2" />
  {:else if name === 'play'}
    <path d="M16 9l24 15-24 15z" fill={farbe} />
  {:else if name === 'daumen-hoch' || name === 'daumen-runter'}
    <g transform={name === 'daumen-runter' ? 'rotate(180 24 24)' : undefined}>
      <path d="M5 22h8v21H5z" fill={fuellung} stroke-width="3.5" />
      <path d="M13 22l7.5-14c1.2-2.4 6.5-2.4 6.5 2.5L26 19h11c3.6 0 6 3 5.2 6.4l-3 13c-.6 2.7-2.6 4.6-5.6 4.6H13z" fill={fuellung} stroke-width="3.5" />
    </g>
  {:else if name === 'haende'}
    <path d="M8 40V22c0-2 3-2 3 0v-9c0-2 3-2 3 0v-2c0-2 3-2 3 0v2c0-2 3-2 3 0v13l2-3c1.5-2 4-.5 3 1.5L20 40z" fill={fuellung} stroke-width="3" />
    <path d="M40 40V22c0-2-3-2-3 0v-9c0-2-3-2-3 0v-2c0-2-3-2-3 0v2c0-2-3-2-3 0v13l-2-3c-1.5-2-4-.5-3 1.5L28 40z" fill={fuellung} stroke-width="3" />
    <path d="M14 5l-2-3M24 4V1M34 5l2-3" stroke-width="3" />
  {:else if name === 'megafon'}
    <path d="M6 19h7l20-10v30L13 29H6z" fill={fuellung} stroke-width="4" /><path d="M13 29l3 11h6l-2-11" stroke-width="4" /><path d="M39 19a6 6 0 010 10" />
  {:else if name === 'person'}
    <circle cx="24" cy="14" r="8" fill={fuellung} stroke-width="4" /><path d="M8 44c0-9 7-16 16-16s16 7 16 16z" fill={fuellung} stroke-width="4" />
  {:else if name === 'lupe'}
    <circle cx="20" cy="20" r="13" fill={fuellung} /><circle cx="15.5" cy="15" r="3.5" fill="#fff" stroke="none" opacity={fuellung === 'none' ? 0 : 0.9} /><path d="M30 30l12 12" stroke-width="7" />
  {:else if name === 'gluehbirne'}
    <path d="M24 4C14.5 4 8.5 11 8.5 19c0 6.5 4.3 9.6 6.8 13.2 1 1.4 1.4 2.8 1.4 4.3h14.6c0-1.5.4-2.9 1.4-4.3 2.5-3.6 6.8-6.7 6.8-13.2C39.5 11 33.5 4 24 4Z" fill={fuellung} stroke-width="4" /><path d="M17.5 41.5h13M19.5 45.5h9" stroke-width="4" />
  {:else if name === 'stern'}
    <path d="M24 6l5.5 11.3 12.5 1.7-9 8.8 2.2 12.4L24 34.3l-11.2 5.9L15 27.8 6 19l12.5-1.7z" fill={farbe} stroke-width="3" />
  {/if}
</svg>
