// Posen & Gesten: erzeugt CSS-Keyframes aus den Gelenk-Ankern eines Monsters.
// Jede Kombination (Art, Stufe, Pose) bekommt einmalig eigene Regeln; Transform-Ursprünge
// liegen an den Gelenken (transform-box: view-box, Koordinaten in viewBox-Einheiten).
//
// Arme bewegen sich NUR durch Drehung um den Schulterpunkt plus eine leichte Dehnung entlang
// der Armachse (nie Verschiebung) – so lösen sie sich nie vom Körper. Die absolute Armrichtung
// bleibt in einem festen Winkelbereich je Seite, dadurch gibt es keine Überschläge durch den Körper.
// Ebene je Pose siehe armEbenen(); Gesten vor dem Gesicht halten die Augen sichtbar (greife … augenFrei).

export const BASIS_POSEN = ['stehen', 'winken', 'jubeln', 'nachdenken', 'zeigen', 'erschrecken_leicht', 'schlafen'];
export const GESTEN = ['abrubbeln', 'bauch_reiben', 'hand_an_bauch', 'haende_trichter', 'stopp_haende', 'hand_an_stirn', 'blitz_arme', 'wegwerfen', 'kopf_schuetteln', 'hand_ueber_augen'];
export const ALLE_POSEN = [...BASIS_POSEN, ...GESTEN];

/** Gesichtsausdruck je Pose */
export const AUSDRUCK = {
  stehen: { augen: 'offen', mund: 'laecheln' },
  winken: { augen: 'offen', mund: 'offen' },
  jubeln: { augen: 'froh', mund: 'offen' },
  nachdenken: { augen: 'offen', mund: 'hmm', blick: [-0.12, -0.22] },
  zeigen: { augen: 'offen', mund: 'offen', blick: [0.2, 0] },
  erschrecken_leicht: { augen: 'gross', mund: 'o' },
  schlafen: { augen: 'zu', mund: 'klein' },
  abrubbeln: { augen: 'froh', mund: 'offen' },
  bauch_reiben: { augen: 'froh', mund: 'laecheln' },
  hand_an_bauch: { augen: 'offen', mund: 'wellig', blick: [0, 0.15] },
  haende_trichter: { augen: 'offen', mund: 'ruf' },
  stopp_haende: { augen: 'offen', mund: 'ernst' },
  hand_an_stirn: { augen: 'offen', mund: 'wellig', blick: [0, -0.15] },
  blitz_arme: { augen: 'gross', mund: 'o' },
  wegwerfen: { augen: 'offen', mund: 'laecheln', blick: [0.2, 0.12] },
  kopf_schuetteln: { augen: 'offen', mund: 'ernst' },
  hand_ueber_augen: { augen: 'offen', mund: 'laecheln', blick: [0.15, 0] },
};

/** Ebene der Arme je Pose: 'vorn' (vor Kopf und Rumpf) oder 'mitte' (vor dem Rumpf, hinter dem Kopf).
 *  Ruheposen nutzen die Standard-Ebene der Art (Krake: Arme kommen unter der Kuppel hervor). */
export function armEbenen(pose, standard = 'vorn') {
  const e = ['stehen', 'schlafen', 'kopf_schuetteln'].includes(pose) ? standard : 'vorn';
  return { arm_links: e, arm_rechts: e };
}

const r2 = (v) => Math.round(v * 100) / 100;
const grad = (rad) => (rad * 180) / Math.PI;

function tf({ tx = 0, ty = 0, r = 0, sx = 1, sy = 1, phi, k = 1 } = {}) {
  // Armkeyframes haben immer dieselbe Funktionsliste (sonst Matrix-Interpolation mit Sprüngen)
  if (phi !== undefined) return `rotate(${r2(r)}deg) rotate(${r2(phi)}deg) scale(1,${r2(k)}) rotate(${r2(-phi)}deg)`;
  return `translate(${r2(tx)}px,${r2(ty)}px) rotate(${r2(r)}deg) scale(${r2(sx)},${r2(sy)})`;
}

// erlaubte absolute Armrichtung (Grad, 0 = rechts, 90 = unten) – kein Überschlag über die Körpermitte
const BEREICH = { l: [-15, 305], r: [-125, 195] };
function inBereich(seite, w) {
  const [a, b] = BEREICH[seite];
  for (const k of [-720, -360, 0, 360, 720]) if (w + k >= a && w + k <= b) return w + k;
  const x = ((w % 360) + 360) % 360;
  const ab = (y) => Math.min(Math.abs(y - a), Math.abs(y - a - 360), Math.abs(y - a + 360));
  const bb = (y) => Math.min(Math.abs(y - b), Math.abs(y - b - 360), Math.abs(y - b + 360));
  return ab(x) < bb(x) ? a : b;
}

function armDaten(A, seite) {
  const S = seite === 'l' ? A.schulterL : A.schulterR;
  const H = seite === 'l' ? A.handL : A.handR;
  const ruhe = inBereich(seite, grad(Math.atan2(H[1] - S[1], H[0] - S[0])));
  return { S, H, ruhe, len: Math.hypot(H[0] - S[0], H[1] - S[1]) };
}

/** Arm in eine absolute Richtung (Grad) drehen, optional gedehnt */
function richte(A, seite, winkel, k = 1) {
  const { ruhe } = armDaten(A, seite);
  return { r: inBereich(seite, winkel) - ruhe, phi: ruhe - 90, k };
}
/** relative Drehung aus der Ruhelage (für kleine Schwingbewegungen) */
function locker(A, seite, r) {
  const { ruhe } = armDaten(A, seite);
  return { r, phi: ruhe - 90, k: 1 };
}

/** Hand zum Ziel führen: Drehung + Dehnung entlang der Armachse, Augen bleiben sichtbar */
function greife(A, seite, ziel, { augenFrei = false, kMax = 1.25, kMin = 0.85 } = {}) {
  const { S, len } = armDaten(A, seite);
  let [zx, zy] = ziel;
  const kVon = (x, y) => Math.max(kMin, Math.min(kMax, Math.hypot(x - S[0], y - S[1]) / len));
  if (augenFrei) {
    const aussen = seite === 'l' ? -1 : 1;
    for (let i = 0; i < 12; i++) {
      // tatsächlich gezeichnete Armlänge (inkl. Hand-/Tentakelspitze) prüfen
      const d = Math.hypot(zx - S[0], zy - S[1]) || 1;
      const lang = len * kVon(zx, zy) * (A.armSpitze ?? 1.15);
      const ende = [S[0] + ((zx - S[0]) / d) * lang, S[1] + ((zy - S[1]) / d) * lang];
      const frei = [A.augeL, A.augeR].every((E) => abstandZurStrecke(E, S, ende) >= A.augeRad * 1.15 + A.armHalbe);
      if (frei) break;
      zx += aussen * A.augeRad * 0.22;
      zy -= A.augeRad * 0.05;
    }
  }
  return richte(A, seite, grad(Math.atan2(zy - S[1], zx - S[0])), kVon(zx, zy));
}

function abstandZurStrecke(P, a, b) {
  const vx = b[0] - a[0], vy = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((P[0] - a[0]) * vx + (P[1] - a[1]) * vy) / (vx * vx + vy * vy || 1)));
  return Math.hypot(P[0] - a[0] - t * vx, P[1] - a[1] - t * vy);
}

const um = (g, dr = 0, dk = 0) => ({ ...g, r: g.r + dr, k: (g.k ?? 1) + dk });
const spiegelW = (w) => 180 - w; // Richtung für die linke Seite spiegeln

const ATMEN = [[0, { sy: 1 }], [50, { sy: 1.025, sx: 0.995 }], [100, { sy: 1 }]];
const BLINZELN = [[0, {}], [88, {}], [91, { sy: 0.1 }], [94, {}], [100, {}]];

/** Liefert die Animationsbeschreibung einer Pose */
function beschreibe(pose, A) {
  const kr = A.kopfRx;
  const blinzeln = { dauer: 4.6, frames: BLINZELN, easing: 'linear' };
  const hin = (a, b, dauer, easing) => ({ dauer, easing, frames: [[0, a], [50, b], [100, a]] });
  const ruhig = (seite, r = 0) => hin(locker(A, seite, r), locker(A, seite, r + (seite === 'l' ? 2 : -2)), 3.2);

  switch (pose) {
    case 'stehen':
      return {
        koerper: { dauer: 3.2, frames: ATMEN },
        arm_links: hin(locker(A, 'l', 0), locker(A, 'l', 4), 3.2),
        arm_rechts: hin(locker(A, 'r', 0), locker(A, 'r', -4), 3.2),
        kopf: { dauer: 6.4, frames: [[0, { r: 0 }], [30, { r: 3 }], [70, { r: -2 }], [100, { r: 0 }]] },
        augen: blinzeln,
      };
    case 'winken':
      return {
        arm_rechts: hin(richte(A, 'r', -68), richte(A, 'r', -32), 1.3),
        arm_links: ruhig('l', 3),
        koerper: hin({ r: -1.5 }, { r: 1.5 }, 2.6),
        kopf: hin({ r: 4 }, { r: 7 }, 2.6),
        augen: blinzeln,
      };
    case 'jubeln':
      return {
        ganz: { dauer: 1.2, frames: [[0, { sy: 0.95, sx: 1.03 }], [20, { sy: 1.01, sx: 0.99 }], [50, { ty: -22 }], [80, { sy: 1.01, sx: 0.99 }], [100, { sy: 0.95, sx: 1.03 }]] },
        arm_links: hin(richte(A, 'l', spiegelW(-45)), richte(A, 'l', spiegelW(-62)), 1.2),
        arm_rechts: hin(richte(A, 'r', -45), richte(A, 'r', -62), 1.2),
      };
    case 'nachdenken': {
      const g = greife(A, 'r', [A.mund[0] + A.mundW * 0.2, A.mund[1] + A.kopfRy * 0.28], { augenFrei: true });
      return {
        arm_rechts: hin(g, um(g, -3), 3),
        kopf: hin({ r: -6 }, { r: -9 }, 3),
        koerper: { dauer: 3, frames: ATMEN },
        arm_links: ruhig('l', 4),
        augen: blinzeln,
      };
    }
    case 'zeigen': {
      const g = richte(A, 'r', -6);
      return {
        arm_rechts: hin(g, um(g, -4, 0.06), 1.6),
        ganz: hin({ r: 1 }, { r: 2.5 }, 1.6),
        kopf: hin({ r: 4 }, { r: 5 }, 1.6),
        arm_links: ruhig('l', 3),
        augen: blinzeln,
      };
    }
    case 'erschrecken_leicht': {
      const gl = greife(A, 'l', [A.kopfC[0] - kr * 1.02, A.kopfC[1] + A.kopfRy * 0.45], { augenFrei: true });
      const gr = greife(A, 'r', [A.kopfC[0] + kr * 1.02, A.kopfC[1] + A.kopfRy * 0.45], { augenFrei: true });
      return {
        arm_links: hin(gl, um(gl, 4), 1.8),
        arm_rechts: hin(gr, um(gr, -4), 1.8),
        ganz: hin({ r: -2 }, { r: -4, ty: -2 }, 1.8),
      };
    }
    case 'schlafen':
      return {
        koerper: { dauer: 4.4, frames: [[0, { sy: 0.99 }], [50, { sy: 1.04, sx: 1.01 }], [100, { sy: 0.99 }]] },
        kopf: hin({ r: 9, ty: 2 }, { r: 11, ty: 3 }, 4.4),
        arm_links: hin(locker(A, 'l', -4), locker(A, 'l', -2), 4.4),
        arm_rechts: hin(locker(A, 'r', 4), locker(A, 'r', 2), 4.4),
        blasen: { dauer: 4.4, easing: 'ease-out', frames: [[0, { ty: 10, sx: 0.4, sy: 0.4 }], [20, { ty: 4, sx: 0.8, sy: 0.8 }], [85, { ty: -18, sx: 1.1, sy: 1.1 }], [100, { ty: -22, sx: 0.2, sy: 0.2 }]] },
      };
    case 'abrubbeln': {
      // beide Hände rubbeln über Brust und Bauch (vor dem Rumpf)
      const oben = (f) => [A.brust[0] + f * kr * 0.12, A.brust[1]];
      const unten = (f) => [A.bauch[0] + f * kr * 0.12, A.bauch[1]];
      const l1 = greife(A, 'l', oben(1)), l2 = greife(A, 'l', unten(1));
      const q1 = greife(A, 'r', unten(-1)), q2 = greife(A, 'r', oben(-1));
      return {
        arm_links: hin(l1, l2, 1.4),
        arm_rechts: hin(q1, q2, 1.4),
        koerper: hin({ r: -1.5 }, { r: 1.5 }, 1.4),
        kopf: hin({ r: -3 }, { r: 3 }, 2.8),
      };
    }
    case 'bauch_reiben': {
      const b = A.bauch, k = kr * 0.1;
      const f = [[b[0] + k, b[1]], [b[0], b[1] + k], [b[0] - k, b[1]], [b[0], b[1] - k]].map((p) => greife(A, 'r', p));
      return {
        arm_rechts: { dauer: 2, easing: 'linear', frames: [[0, f[0]], [25, f[1]], [50, f[2]], [75, f[3]], [100, f[0]]] },
        arm_links: ruhig('l', 3),
        koerper: hin({ r: -1 }, { r: 1.5 }, 2),
        kopf: hin({ r: 4 }, { r: 7 }, 4),
      };
    }
    case 'hand_an_bauch': {
      const g = greife(A, 'r', [A.bauch[0] - kr * 0.05, A.bauch[1]]);
      return {
        arm_rechts: hin(g, um(g, 2), 3),
        arm_links: ruhig('l', 3),
        koerper: hin({ r: 0 }, { r: 2, sy: 0.985 }, 3),
        kopf: hin({ r: 6, ty: 2 }, { r: 8, ty: 3 }, 3),
        augen: blinzeln,
      };
    }
    case 'haende_trichter': {
      const w = A.mundW * 0.6 + A.armHalbe * 1.6;
      // Hände an die Mundwinkel, aber nie quer über das ganze Gesicht greifen
      const zlx = Math.min(A.mund[0] - w, A.kopfC[0] - kr * 0.25), zrx = Math.max(A.mund[0] + w, A.kopfC[0] + kr * 0.25);
      const zy = A.mund[1] + A.kopfRy * 0.12;
      const gl = greife(A, 'l', [zlx, zy], { augenFrei: true, kMin: 0.68 });
      const gr = greife(A, 'r', [zrx, zy], { augenFrei: true, kMin: 0.68 });
      return {
        arm_links: hin(gl, um(gl, -3), 1.6),
        arm_rechts: hin(gr, um(gr, 3), 1.6),
        kopf: hin({ ty: 0 }, { ty: -2, sx: 1.02, sy: 1.02 }, 1.6),
        koerper: hin({ sy: 1 }, { sy: 1.025 }, 1.6),
      };
    }
    case 'stopp_haende': {
      // Hände hoch neben dem Kopf, drücken nach vorn (Dehnung pulsiert)
      const gl = richte(A, 'l', spiegelW(-62)), gr = richte(A, 'r', -62);
      return {
        arm_links: hin(gl, um(gl, 6, 0.15), 1.6),
        arm_rechts: hin(gr, um(gr, -6, 0.15), 1.6),
        ganz: hin({ sy: 1 }, { sy: 1.02 }, 1.6),
        kopf: hin({ r: 0 }, { r: -2 }, 1.6),
        augen: blinzeln,
      };
    }
    case 'hand_an_stirn': {
      const g = greife(A, 'r', [A.stirn[0] + kr * 0.35, A.stirn[1] + A.augeRad * 0.3], { augenFrei: true, kMax: 1.45, kMin: 0.7 });
      return {
        arm_rechts: hin(g, um(g, -2), 2.8),
        kopf: hin({ r: 3 }, { r: 6 }, 2.8),
        ganz: hin({ r: -1 }, { r: -2.5 }, 2.8),
        arm_links: ruhig('l', 3),
        augen: blinzeln,
      };
    }
    case 'blitz_arme': {
      // Zickzack wie ein Blitz: oben außen → waagerecht → schräg oben → unten außen
      const w = [-55, 5, -25, 40];
      const r = w.map((x) => richte(A, 'r', x));
      const l = w.map((x) => richte(A, 'l', spiegelW(x)));
      const fr = (a) => [[0, a[0]], [15, a[0]], [25, a[1]], [40, a[1]], [50, a[2]], [65, a[2]], [75, a[3]], [90, a[3]], [100, a[0]]];
      return {
        arm_links: { dauer: 2.4, frames: fr(l) },
        arm_rechts: { dauer: 2.4, frames: fr(r) },
        ganz: { dauer: 2.4, frames: [[0, { r: 0 }], [25, { r: -2 }], [50, { r: 1 }], [75, { r: 2 }], [100, { r: 0 }]] },
      };
    }
    case 'wegwerfen': {
      const aus = richte(A, 'r', -70), wurf = richte(A, 'r', 8);
      return {
        arm_rechts: { dauer: 2, frames: [[0, aus], [35, um(aus, -6)], [60, wurf], [80, wurf], [100, aus]] },
        ganz: { dauer: 2, frames: [[0, { r: -1.5 }], [35, { r: -2.5 }], [60, { r: 2.5 }], [80, { r: 1.5 }], [100, { r: -1.5 }]] },
        arm_links: ruhig('l', 3),
      };
    }
    case 'kopf_schuetteln':
      return {
        kopf: { dauer: 1.6, frames: [[0, { r: 0 }], [25, { r: -10 }], [75, { r: 10 }], [100, { r: 0 }]] },
        koerper: { dauer: 3.2, frames: ATMEN },
        arm_links: ruhig('l', 2),
        arm_rechts: ruhig('r', -2),
      };
    case 'hand_ueber_augen': {
      const g = greife(A, 'r', [A.augeR[0] + A.augeRad * 0.4, A.augeR[1] - A.augeRad * 1.9], { augenFrei: true, kMax: 1.45, kMin: 0.7 });
      return {
        arm_rechts: hin(g, um(g, 2), 3.2),
        kopf: hin({ r: 0 }, { r: 5 }, 3.2),
        blick: hin({ tx: -A.augeRad * 0.2 }, { tx: A.augeRad * 0.2 }, 3.2),
        ganz: hin({ r: -1.5 }, { r: 1.5 }, 3.2),
        arm_links: ruhig('l', 3),
      };
    }
    default:
      return beschreibe('stehen', A);
  }
}

const erzeugt = new Set();

/** CSS für eine (Art, Stufe, Pose)-Kombination */
export function poseCss(schluessel, pose, A) {
  const teile = beschreibe(pose, A);
  const ursprung = {
    ganz: A.boden, koerper: A.boden, kopf: A.hals,
    arm_links: A.schulterL, arm_rechts: A.schulterR,
    augen: [(A.augeL[0] + A.augeR[0]) / 2, (A.augeL[1] + A.augeR[1]) / 2],
    blick: A.kopfC, blasen: A.blasen ?? A.kopfC,
  };
  let css = '';
  let ruhig = '';
  for (const [teil, def] of Object.entries(teile)) {
    const name = `${schluessel}-${teil}`;
    const sel = `.${schluessel} [data-teil="${teil}"]`;
    const o = ursprung[teil] ?? A.boden;
    css += `@keyframes ${name}{${def.frames.map(([p, t]) => `${p}%{transform:${tf(t)}}`).join('')}}`;
    css += `${sel}{transform-box:view-box;transform-origin:${r2(o[0])}px ${r2(o[1])}px;transform:${tf(def.frames[0][1])};` +
      `animation:${name} ${def.dauer}s ${def.easing ?? 'cubic-bezier(.45,0,.55,1)'} calc(var(--wm-phase,0) * -${def.dauer}s) infinite}`;
    ruhig += `${sel}{animation:none}`;
  }
  return css + `@media (prefers-reduced-motion: reduce){${ruhig}}`;
}

/** Hängt CSS einmalig ins Dokument (Browser); im Node-Export wird es inline eingebettet */
export function stelleCssBereit(schluessel, css) {
  if (typeof document === 'undefined' || erzeugt.has(schluessel)) return;
  erzeugt.add(schluessel);
  const el = document.createElement('style');
  el.dataset.monster = schluessel;
  el.textContent = css;
  document.head.appendChild(el);
}
