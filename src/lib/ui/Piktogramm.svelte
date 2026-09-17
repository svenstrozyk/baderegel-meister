<!-- Einfache, kräftige Piktogramme für die 10 Baderegeln (lesbar ab ca. 40 px, kein Text). -->
<script>
  let { regelId, groesse = 64, grau = false, hintergrund = true } = $props();

  const uid = $props.id();
  const clipId = `piktogramm-clip-${uid}`;

  // Farben aus app.css (mit Fallback, falls die Tokens fehlen)
  const C = {
    tinte: 'var(--tinte, #10243a)',
    meer: 'var(--meer, #0b6fb8)',
    himmel: 'var(--himmel, #7fd3ff)',
    himmelHell: 'var(--himmel-hell, #c9f0ff)',
    sonne: 'var(--sonne, #ffd23f)',
    koralle: 'var(--koralle, #ff6b5b)',
    orange: 'var(--orange, #ff9a3c)',
    gras: 'var(--gras, #43c463)',
    sand: 'var(--sand, #f6d9a0)',
    weiss: 'var(--weiss, #fffdf7)',
    lila: 'var(--lila, #9b6bf2)'
  };
</script>

<!-- Kind: Kopf (r 10) um (0,0), runder Körper darunter. blick verschiebt die Pupillen. -->
{#snippet kind(x, y, s = 1, farbe = C.koralle, blick = [0, 0])}
  <g transform="translate({x} {y}) scale({s})" stroke-width={5 / s}>
    <path d="M-13 38V25a13 13 0 0 1 26 0v13z" fill={farbe} />
    <circle r="10" fill={C.sand} />
    <circle cx={-3.8 + blick[0]} cy={-1 + blick[1]} r="2.3" fill={C.tinte} stroke="none" />
    <circle cx={3.8 + blick[0]} cy={-1 + blick[1]} r="2.3" fill={C.tinte} stroke="none" />
    <path d="M-4 4.5Q0 7.5 4 4.5" fill="none" stroke-width={2.4 / s} />
  </g>
{/snippet}

<svg
  viewBox="0 0 100 100"
  width={groesse}
  height={groesse}
  aria-hidden="true"
  fill="none"
  stroke={C.tinte}
  stroke-width="5"
  stroke-linecap="round"
  stroke-linejoin="round"
  style={grau ? 'filter: grayscale(1); opacity: .55' : undefined}
>
  <defs>
    <clipPath id={clipId}><circle cx="50" cy="50" r="48" /></clipPath>
  </defs>

  {#if hintergrund}
    <circle cx="50" cy="50" r="48" fill={C.himmelHell} stroke="none" />
  {/if}

  <g clip-path="url(#{clipId})">
    {#if regelId === 1}
      <!-- Duschen: Kind unter der Dusche mit Tropfen -->
      <path d="M82 40V14H57v5" />
      <path d="M45 19h24l8 10H37z" fill={C.meer} />
      <path d="M44 36l-2 5M57 36v5M70 36l2 5" stroke={C.meer} stroke-width="5" />
      {@render kind(57, 58, 1.05, C.orange)}
    {:else if regelId === 2}
      <!-- Bauch: Kind mit rundem Bauch + Teller mit Essen -->
      <circle cx="68" cy="67" r="20" fill={C.weiss} />
      <circle cx="68" cy="67" r="11" fill="none" stroke-width="3" />
      <circle cx="68" cy="67" r="7" fill={C.gras} stroke-width="3" />
      <circle cx="33" cy="72" r="17" fill={C.orange} />
      <circle cx="33" cy="73" r="2.4" fill={C.tinte} stroke="none" />
      <circle cx="33" cy="41" r="11" fill={C.sand} />
      <circle cx="29" cy="40" r="2.3" fill={C.tinte} stroke="none" />
      <circle cx="37" cy="40" r="2.3" fill={C.tinte} stroke="none" />
      <path d="M29 45.5Q33 48.5 37 45.5" stroke-width="2.4" />
    {:else if regelId === 3}
      <!-- Bis zum Bauch: Kind im Wasser, Wasserlinie am Bauch -->
      {@render kind(50, 30, 1.3, C.koralle)}
      <path d="M-2 62q13-8 26 0t26 0 26 0 26 0V104H-2z" fill={C.meer} opacity=".85" />
      <path d="M-2 62q13-8 26 0t26 0 26 0 26 0" />
    {:else if regelId === 4}
      <!-- Hilfe: Kind ruft und winkt mit erhobener Hand -->
      {@render kind(42, 50, 1.15, C.lila)}
      <path d="M54 70L71 36" stroke-width="13" />
      <path d="M54 70L71 36" stroke={C.sand} stroke-width="5" />
      <circle cx="72" cy="30" r="9" fill={C.sand} />
      <path d="M84 18q6 10 1 20M62 16q-5 6-3 12" stroke={C.meer} stroke-width="4.5" />
      <path d="M24 44q-5 7 0 14M15 39q-8 12 0 24" stroke={C.koralle} stroke-width="4.5" />
    {:else if regelId === 5}
      <!-- Nicht schubsen: große Stopp-Hand am Beckenrand -->
      <path d="M-2 80q13-8 26 0t26 0 26 0 26 0V104H-2z" fill={C.meer} />
      <path
        d="M38 80V61L25 49a5.5 5.5 0 0 1 8-8l5 4V24a5.5 5.5 0 0 1 11 0v18V18a5.5 5.5 0 0 1 11 0v24V22a5.5 5.5 0 0 1 11 0v22V30a5.5 5.5 0 0 1 11 0v30c0 12-8 20-18 20z"
        fill={C.koralle}
      />
    {:else if regelId === 6}
      <!-- Medizin: Medizinflasche + Mond (müde), Wasser gesperrt -->
      <path d="M-2 84q13-8 26 0t26 0 26 0 26 0V104H-2z" fill={C.meer} />
      <rect x="29" y="22" width="22" height="10" rx="3" fill={C.koralle} />
      <rect x="24" y="32" width="32" height="46" rx="8" fill={C.weiss} />
      <path d="M40 46v18M31 55h18" stroke={C.koralle} stroke-width="6" />
      <path d="M78 18a17 17 0 1 0 8 30 13 13 0 0 1-8-30z" fill={C.sonne} />
    {:else if regelId === 7}
      <!-- Gewitter: Blitzwolke + Haus -->
      <path d="M36 40L25 60h10l-6 20 19-26H38l7-14z" fill={C.sonne} stroke-width="4" />
      <path d="M22 42a9 9 0 0 1 0-18 13 13 0 0 1 24-6 10 10 0 0 1 13 13 6 6 0 0 1-3 11z" fill={C.weiss} />
      <rect x="57" y="60" width="26" height="24" fill={C.orange} />
      <path d="M52 62L70 45l18 17z" fill={C.koralle} />
      <rect x="66" y="70" width="8" height="14" fill={C.tinte} stroke="none" />
    {:else if regelId === 8}
      <!-- Müll: Mülleimer, Dose fällt hinein -->
      <path d="M32 54h36l-4 36H36z" fill={C.gras} />
      <path d="M43 62v20M57 62v20" stroke-width="4" />
      <rect x="26" y="46" width="48" height="9" rx="4.5" fill={C.gras} />
      <g transform="rotate(-25 50 24)">
        <rect x="43" y="12" width="14" height="22" rx="3" fill={C.koralle} />
        <path d="M43 19h14" stroke-width="3" />
      </g>
      <path d="M30 16v10M72 18v10" stroke={C.meer} stroke-width="4" />
    {:else if regelId === 9}
      <!-- Schwimmtiere: Schwimmring im Wasser, Erwachsener passt auf -->
      {@render kind(70, 30, 1.35, C.lila, [-2, 1.5])}
      <path d="M-2 72q13-8 26 0t26 0 26 0 26 0V104H-2z" fill={C.meer} />
      <circle cx="33" cy="68" r="17" fill={C.koralle} />
      <circle cx="33" cy="68" r="12" fill="none" stroke={C.weiss} stroke-width="8" stroke-dasharray="9.42 9.42" />
      <circle cx="33" cy="68" r="17" fill="none" />
      <circle cx="33" cy="68" r="7" fill={C.himmel} />
    {:else if regelId === 10}
      <!-- Springen: Kind am Rand guckt ins Wasser -->
      <path d="M-2 72q13-8 26 0t26 0 26 0 26 0V104H-2z" fill={C.meer} />
      <path d="M-2 64H46V104H-2z" fill={C.sand} />
      <path d="M44 38L72 70" stroke-width="4" stroke-dasharray="1 8" />
      {@render kind(30, 29, 0.95, C.orange, [2.5, 2.5])}
    {/if}
  </g>
</svg>
