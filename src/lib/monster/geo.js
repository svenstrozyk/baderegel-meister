// Geometrie-Helfer: Arten zeichnen in einem Entwurfsraster (300×300, Boden y=288, Mitte x=150).
// Der Kontext skaliert das Raster je Entwicklungsstufe um den Fußpunkt, Linienstärken bleiben konstant.

export const MITTE_X = 150;
export const BODEN_Y = 288;

const r1 = (v) => Math.round(v * 10) / 10;

export function erzeugeKontext({ s, uid, pal, linie = 5 }) {
  let n = 0;
  const ctx = {
    s, uid, pal, lw: linie,
    neu: (p = 'x') => `${uid}-${p}${n++}`,
    /** Punkt abbilden */
    m: (x, y) => [r1(MITTE_X + (x - MITTE_X) * s), r1(BODEN_Y + (y - BODEN_Y) * s)],
    /** Länge abbilden */
    n: (v) => r1(v * s),
    /** absoluten Pfad (nur Großbuchstaben-Befehle) abbilden */
    P: (d) => bildePfad(d, ctx),
    /** glatte Kurve durch Punkte (Catmull-Rom), geschlossen oder offen */
    glatt: (pkte, zu = true, spannung = 1) => ctx.P(spline(pkte, zu, spannung)),
    ell: (cx, cy, rx, ry) => {
      const [x, y] = ctx.m(cx, cy);
      const a = r1(rx * s), b = r1(ry * s);
      return `M${r1(x - a)} ${y}A${a} ${b} 0 1 1 ${r1(x + a)} ${y}A${a} ${b} 0 1 1 ${r1(x - a)} ${y}Z`;
    },
    /**
     * Cel-schattierte Form: Grundfarbe, eine Schattenstufe unten rechts, optional Muster, dunkle Outline.
     * opt: {fill, schatten, versatz:[dx,dy], muster:bool, linie, innen:'' (zusätzl. SVG im Clip), ohneLinie}
     */
    form: (d, opt = {}) => {
      const fill = opt.fill ?? pal.haupt;
      const schatten = opt.schatten ?? pal.schatten;
      const [dx, dy] = opt.versatz ?? [7, 6];
      const id = ctx.neu('c');
      const lw = opt.linie ?? ctx.lw;
      const muster = opt.muster && ctx.musterId ? `<rect x="-50" y="-50" width="400" height="400" fill="url(#${ctx.musterId})"/>` : '';
      return `<clipPath id="${id}"><path d="${d}"/></clipPath>` +
        `<g clip-path="url(#${id})"><path d="${d}" fill="${schatten}"/><path d="${d}" fill="${fill}" transform="translate(${r1(-dx * s)} ${r1(-dy * s)})"/>${muster}${opt.innen ?? ''}</g>` +
        (opt.ohneLinie ? '' : `<path d="${opt.linieD ?? d}" fill="none" stroke="${opt.linienFarbe ?? pal.linie}" stroke-width="${lw}" stroke-linejoin="round" stroke-linecap="round"/>`);
    },
    /** weiche Wurstform (Arme, Flossen, Tentakel) mit nahtlosem Ansatz */
    wurstForm: (pts, b0, b1, wopt = {}, fopt = {}) => {
      const w = wurst(pts, b0, b1, wopt);
      return ctx.form(ctx.P(w.d), { ...fopt, linieD: fopt.mitAnsatz ? undefined : ctx.P(w.linie) });
    },
    /** einfache Fläche ohne Schatten */
    flaeche: (d, fill, opt = {}) =>
      `<path d="${d}" fill="${fill}"${opt.linie === 0 ? '' : ` stroke="${opt.linienFarbe ?? pal.linie}" stroke-width="${opt.linie ?? ctx.lw}" stroke-linejoin="round" stroke-linecap="round"`}${opt.attr ?? ''}/>`,
    /** Linie ohne Füllung */
    strich: (d, breite = 3, farbe = pal.linie, attr = '') =>
      `<path d="${d}" fill="none" stroke="${farbe}" stroke-width="${breite}" stroke-linecap="round" stroke-linejoin="round"${attr}/>`,
  };
  return ctx;
}

const ARGS = { M: 2, L: 2, C: 6, Q: 4, S: 4, T: 2, A: 7, H: 1, V: 1, Z: 0 };

function bildePfad(d, ctx) {
  const tokens = d.match(/[A-Za-z]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  let out = '';
  let i = 0;
  let cmd = '';
  while (i < tokens.length) {
    if (/[A-Za-z]/.test(tokens[i])) {
      cmd = tokens[i++];
      if (cmd !== cmd.toUpperCase()) throw new Error('Nur absolute Pfadbefehle: ' + cmd);
      out += cmd;
      if (cmd === 'Z') continue;
    }
    const k = ARGS[cmd];
    const a = tokens.slice(i, i + k).map(Number);
    i += k;
    const s = ctx.s;
    if (cmd === 'H') out += r1(MITTE_X + (a[0] - MITTE_X) * s) + ' ';
    else if (cmd === 'V') out += r1(BODEN_Y + (a[0] - BODEN_Y) * s) + ' ';
    else if (cmd === 'A') {
      const [x, y] = ctx.m(a[5], a[6]);
      out += `${r1(a[0] * s)} ${r1(a[1] * s)} ${a[2]} ${a[3]} ${a[4]} ${x} ${y} `;
    } else {
      const pts = [];
      for (let j = 0; j < k; j += 2) pts.push(...ctx.m(a[j], a[j + 1]));
      out += pts.join(' ') + ' ';
    }
  }
  return out.trim();
}

/** Catmull-Rom → kubische Bézier (Entwurfskoordinaten, absoluter Pfad) */
export function spline(p, zu = true, t = 1) {
  const n = p.length;
  const get = (i) => (zu ? p[(i + n) % n] : p[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${p[0][0]} ${p[0][1]}`;
  const ende = zu ? n : n - 1;
  for (let i = 0; i < ende; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    const c1 = [p1[0] + ((p2[0] - p0[0]) / 6) * t, p1[1] + ((p2[1] - p0[1]) / 6) * t];
    const c2 = [p2[0] - ((p3[0] - p1[0]) / 6) * t, p2[1] - ((p3[1] - p1[1]) / 6) * t];
    d += `C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return zu ? d + 'Z' : d;
}

/** Punkte auf Ellipse (für Blob-Formen), optional mit Wellen (flauschig) */
export function ellipsenPunkte(cx, cy, rx, ry, anzahl = 12, welle = 0, phase = 0) {
  const pts = [];
  for (let i = 0; i < anzahl; i++) {
    const a = (i / anzahl) * Math.PI * 2 + phase;
    const k = 1 + (i % 2 ? -welle : welle);
    pts.push([r1(cx + Math.cos(a) * rx * k), r1(cy + Math.sin(a) * ry * k)]);
  }
  return pts;
}

/** Spiegelt einen absoluten Pfad an x = 150 (Entwurfskoordinaten) */
export function spiegelPfad(d) {
  const tokens = d.match(/[A-Za-z]|-?\d*\.?\d+/g);
  let out = '', i = 0, cmd = '';
  while (i < tokens.length) {
    if (/[A-Za-z]/.test(tokens[i])) { cmd = tokens[i++]; out += cmd; if (cmd === 'Z') continue; }
    const k = ARGS[cmd];
    const a = tokens.slice(i, i + k).map(Number);
    i += k;
    if (cmd === 'H') a[0] = 300 - a[0];
    else if (cmd === 'V') { /* unverändert */ }
    else if (cmd === 'A') { a[4] = a[4] ? 0 : 1; a[5] = 300 - a[5]; }
    else for (let j = 0; j < k; j += 2) a[j] = 300 - a[j];
    out += a.join(' ') + ' ';
  }
  return out.trim();
}
export const spiegelPunkte = (pts) => pts.map(([x, y]) => [300 - x, y]);
export const spiegelP = ([x, y]) => [300 - x, y];

/**
 * „Schlauch“ um eine Mittellinie (für Schwänze, Arme, Tentakel): liefert Umriss-Punkte (geschlossen)
 * pts: Mittellinie, b0/b1: Breite am Anfang/Ende, kappe: runde Endkappe
 */
export function rohr(pts, b0, b1, { schritte = 4, kappe = true, bauch = 0 } = {}) {
  // Mittellinie fein abtasten (Catmull-Rom)
  const fein = [];
  const n = pts.length;
  const get = (i) => pts[Math.max(0, Math.min(n - 1, i))];
  for (let i = 0; i < n - 1; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    for (let k = 0; k < schritte; k++) {
      const t = k / schritte, t2 = t * t, t3 = t2 * t;
      fein.push([0, 1].map((j) =>
        0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
    }
  }
  fein.push(pts[n - 1]);
  let laenge = 0;
  const kum = [0];
  for (let i = 1; i < fein.length; i++) { laenge += Math.hypot(fein[i][0] - fein[i - 1][0], fein[i][1] - fein[i - 1][1]); kum.push(laenge); }
  const links = [], rechts = [];
  for (let i = 0; i < fein.length; i++) {
    const a = fein[Math.max(0, i - 1)], b = fein[Math.min(fein.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    const u = kum[i] / (laenge || 1);
    const w = (b0 + (b1 - b0) * u + bauch * Math.sin(u * Math.PI)) / 2;
    links.push([fein[i][0] - ty * w, fein[i][1] + tx * w]);
    rechts.push([fein[i][0] + ty * w, fein[i][1] - tx * w]);
  }
  const out = [...links];
  if (kappe) {
    const e = fein[fein.length - 1], v = fein[fein.length - 2];
    let tx = e[0] - v[0], ty = e[1] - v[1];
    const l = Math.hypot(tx, ty) || 1;
    out.push([e[0] + (tx / l) * b1 * 0.5, e[1] + (ty / l) * b1 * 0.5]);
  }
  out.push(...rechts.reverse());
  if (kappe) {
    const s = fein[0], v = fein[1];
    let tx = s[0] - v[0], ty = s[1] - v[1];
    const l = Math.hypot(tx, ty) || 1;
    out.push([s[0] + (tx / l) * b0 * 0.4, s[1] + (ty / l) * b0 * 0.4]);
  }
  return out.map(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]);
}

/**
 * Weiche Arm-/Flossen-/Tentakelform um eine Mittellinie mit echten Halbkreis-Enden.
 * Liefert { d: geschlossene Fläche, linie: Umriss ohne Ansatz (Schulter bleibt nahtlos) } in Entwurfskoordinaten.
 * opt: bauch (Wölbung in der Mitte), hand (Verdickung am Ende), schritte
 */
export function wurst(pts, b0, b1, { bauch = 0, hand = 0, schritte = 6 } = {}) {
  const n = pts.length;
  const get = (i) => pts[Math.max(0, Math.min(n - 1, i))];
  const fein = [];
  for (let i = 0; i < n - 1; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    for (let k = 0; k < schritte; k++) {
      const t = k / schritte, t2 = t * t, t3 = t2 * t;
      fein.push([0, 1].map((j) =>
        0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
    }
  }
  fein.push(pts[n - 1]);
  const kum = [0];
  for (let i = 1; i < fein.length; i++) kum.push(kum[i - 1] + Math.hypot(fein[i][0] - fein[i - 1][0], fein[i][1] - fein[i - 1][1]));
  const L = kum[kum.length - 1] || 1;
  const breite = (u) => {
    const s = Math.max(0, Math.min(1, (u - 0.55) / 0.45));
    return (b0 + (b1 - b0) * u + bauch * Math.sin(u * Math.PI) + hand * s * s * (3 - 2 * s)) / 2;
  };
  const li = [], re = [];
  for (let i = 0; i < fein.length; i++) {
    const a = fein[Math.max(0, i - 1)], b = fein[Math.min(fein.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    const w = breite(kum[i] / L);
    li.push([fein[i][0] - ty * w, fein[i][1] + tx * w]);
    re.push([fein[i][0] + ty * w, fein[i][1] - tx * w]);
  }
  const r2 = (v) => Math.round(v * 10) / 10;
  const kurve = (p) => spline(p.map(([x, y]) => [r2(x), r2(y)]), false, 1).replace(/^M[^C]*/, '');
  const rEnde = r2(breite(1)), rStart = r2(breite(0));
  const reR = re.slice().reverse();
  const linie = `M${r2(li[0][0])} ${r2(li[0][1])}${kurve(li)}A${rEnde} ${rEnde} 0 0 0 ${r2(reR[0][0])} ${r2(reR[0][1])}${kurve(reR)}`;
  const d = `${linie}A${rStart} ${rStart} 0 0 0 ${r2(li[0][0])} ${r2(li[0][1])}Z`;
  return { d, linie };
}
