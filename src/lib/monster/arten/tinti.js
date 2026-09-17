// Tinti – ordentliche, erfinderische Krake (Stufe 1 Tinti, 2 Tintolino, 3 Tintomax)
// Eigenes Design: Kuppel mit Tintentropfen-Locke, Stummel-Tentakel-Rock, Werkzeuge in den unteren Armen.
import { wurst, spiegelPunkte } from '../geo.js';

const STUFEN = {
  1: {
    kopf: { c: [150, 178], rx: 76, ry: 66 },
    augen: { l: [122, 182], r: [178, 182], rad: 24 },
    wangen: { pts: [[98, 208], [202, 208]], rx: 11, ry: 6.5 },
    mund: [150, 214, 20],
    locke: [[150, 114], [146, 96], [158, 86], [168, 96]], lockeB: [14, 6],
    beine: { y0: 226, xs: [104, 128, 150, 172, 196], b: [26, 16], laenge: 0.7 },
    armL: [[90,  212],  [72,  228],  [64,  248],  [56,  262]], armB: [22, 12],
    anker: { hals: [150, 240], stirn: [150, 138], brust: [150, 244], bauch: [150, 256], schulterBreite: 64, umhangUnten: 280 },
  },
  2: {
    kopf: { c: [150, 152], rx: 70, ry: 72 },
    augen: { l: [126, 160], r: [174, 160], rad: 21 },
    wangen: { pts: [[104, 184], [196, 184]], rx: 10, ry: 6 },
    mund: [150, 190, 18],
    locke: [[150, 82], [144, 60], [160, 46], [176, 56], [168, 68]], lockeB: [16, 6],
    beine: { y0: 208, xs: [104, 126, 150, 174], b: [24, 12], laenge: 1, saugnapf: true },
    eimerArm: [[196, 210], [222, 222], [238, 208], [246, 190]],
    armL: [[92,  186],  [70,  206],  [60,  232],  [50,  248]], armB: [22, 10], saugnapf: true,
    anker: { hals: [150, 220], stirn: [150, 104], brust: [150, 222], bauch: [150, 236], schulterBreite: 62, umhangUnten: 280 },
  },
  3: {
    kopf: { c: [150, 124], rx: 72, ry: 78 },
    augen: { l: [127, 132], r: [173, 132], rad: 19 },
    wangen: { pts: [[106, 156], [194, 156]], rx: 9, ry: 5.5 },
    mund: [150, 162, 18],
    locke: [[150, 48], [142, 28], [160, 14], [178, 24], [170, 36]], lockeB: [17, 6],
    ohrFlossen: true,
    beine: { y0: 186, xs: [122, 150, 178], b: [26, 12], laenge: 1, saugnapf: true },
    eimerArm: [[98, 190], [70, 206], [52, 196], [44, 176]],
    lupeArm: [[202, 190], [232, 206], [248, 194], [256, 172]],
    tuchArm: [[190, 204], [214, 236], [238, 250], [258, 244]],
    armL: [[92,  158],  [68,  178],  [56,  206],  [46,  222]], armB: [26, 11], saugnapf: true,
    anker: { hals: [150, 196], stirn: [150, 72], brust: [150, 204], bauch: [150, 218], schulterBreite: 66, umhangUnten: 280 },
  },
};

export default function tinti(ctx, stufe) {
  const S = STUFEN[stufe];
  const { pal } = ctx;
  const out = {};
  const K = S.kopf;

  const tentakel = (pts, b0, b1, napf, extra = {}) => {
    const w = wurst(pts, b0, b1, extra);
    let innen = '';
    if (napf) {
      innen = pts.slice(1, -1).map((p, i) => `<path d="${ctx.ell(p[0], p[1], 3.6 - i * 0.6, 3.6 - i * 0.6)}" fill="${pal.hell}" stroke="${pal.hellSchatten}" stroke-width="1.5"/>`).join('');
    }
    return ctx.form(ctx.P(w.d), { muster: true, versatz: [5, 5], innen, linieD: ctx.P(w.linie) });
  };

  // Werkzeuge
  const eimer = (x, y, g = 1) => {
    const d = ctx.P(`M${x - 16 * g} ${y - 14 * g} L${x + 16 * g} ${y - 14 * g} L${x + 12 * g} ${y + 16 * g} Q${x} ${y + 20 * g} ${x - 12 * g} ${y + 16 * g}Z`);
    return ctx.strich(ctx.P(`M${x - 15 * g} ${y - 12 * g} Q${x} ${y - 40 * g} ${x + 15 * g} ${y - 12 * g}`), 3.2) +
      ctx.form(d, { fill: '#ffd23f', schatten: '#eaa21f', versatz: [5, 0], linie: ctx.lw * 0.8 }) +
      `<path d="${ctx.ell(x, y - 14 * g, 16 * g, 4 * g)}" fill="#b8860b" stroke="${pal.linie}" stroke-width="${ctx.lw * 0.7}"/>` +
      ctx.strich(ctx.P(`M${x - 13 * g} ${y + 2 * g} L${x + 13 * g} ${y + 2 * g}`), 3, '#ff6b5b');
  };
  const lupe = (x, y, g = 1) =>
    ctx.strich(ctx.P(`M${x + 10 * g} ${y + 10 * g} L${x + 26 * g} ${y + 28 * g}`), ctx.n(9) + 5) +
    ctx.strich(ctx.P(`M${x + 10 * g} ${y + 10 * g} L${x + 26 * g} ${y + 28 * g}`), ctx.n(9), '#b0703a') +
    `<path d="${ctx.ell(x, y, 16 * g, 16 * g)}" fill="#d9f7ff" fill-opacity="0.7" stroke="${pal.linie}" stroke-width="${ctx.n(9) + 5}"/>` +
    `<path d="${ctx.ell(x, y, 16 * g, 16 * g)}" fill="none" stroke="#9aa7b8" stroke-width="${ctx.n(9)}"/>` +
    ctx.strich(ctx.P(`M${x - 8 * g} ${y - 2 * g} Q${x - 7 * g} ${y - 8 * g} ${x - 1 * g} ${y - 9 * g}`), 3, '#ffffff');
  const tuch = (x, y) => {
    const d = ctx.P(`M${x - 14} ${y - 8} L${x + 14} ${y - 10} L${x + 18} ${y + 28} Q${x + 2} ${y + 24} ${x - 12} ${y + 30}Z`);
    return ctx.form(d, { fill: '#ff8fc8', schatten: '#e0609e', versatz: [5, 0], linie: ctx.lw * 0.8,
      innen: [8, 16].map((dy) => ctx.strich(ctx.P(`M${x - 16} ${y + dy} L${x + 18} ${y + dy - 2}`), 3, '#ffffff')).join('') });
  };

  // --- hinten: Ohrflossen
  let hinten = '';
  if (S.ohrFlossen) {
    const flosse = [[96, 86], [62, 56], [48, 80], [58, 104], [90, 110]];
    hinten += ctx.form(ctx.glatt(flosse, true, 0.9), { fill: pal.akzent, schatten: pal.akzentSchatten, versatz: [-5, 5] });
    hinten += ctx.form(ctx.glatt(spiegelPunkte(flosse), true, 0.9), { fill: pal.akzent, schatten: pal.akzentSchatten, versatz: [5, 5] });
  }
  out.hinten = hinten;

  // --- Rumpf: Tentakel-Rock und Werkzeug-Arme
  const B = S.beine;
  let rumpf = '';
  const beinPts = (x) => {
    const d = x < 150 ? -1 : x > 150 ? 1 : 0;
    const h = (286 - B.y0);
    return [[x, B.y0], [x + d * 4, B.y0 + h * 0.45], [x + d * 10 + (d === 0 ? -4 : 0), 276], [x + d * 22 + (d === 0 ? 10 : 0), 282]];
  };
  // hintere Reihe (etwas dunkler) für Fülle
  rumpf += B.xs.slice(0, -1).map((x, i) => {
    const xm = (x + B.xs[i + 1]) / 2;
    return tentakel(beinPts(xm).map(([a, b], j) => [a, b - (j === 0 ? 0 : 4)]), B.b[0] * 0.9, B.b[1] * 0.9, false);
  }).join('');
  if (S.eimerArm) {
    const e = S.eimerArm[S.eimerArm.length - 1];
    rumpf += tentakel(S.eimerArm, 20, 10, B.saugnapf) + eimer(e[0] + (stufe === 3 ? -4 : 6), e[1] + 26, stufe === 3 ? 0.9 : 0.8);
  }
  if (S.lupeArm) {
    const e = S.lupeArm[S.lupeArm.length - 1];
    rumpf += tentakel(S.lupeArm, 20, 10, B.saugnapf) + lupe(e[0] + 2, e[1] - 16, 0.9);
  }
  if (S.tuchArm) {
    const e = S.tuchArm[S.tuchArm.length - 1];
    rumpf += tentakel(S.tuchArm, 20, 10, B.saugnapf) + tuch(e[0] + 4, e[1] + 6);
  }
  rumpf += B.xs.map((x) => tentakel(beinPts(x), B.b[0], B.b[1], B.saugnapf)).join('');
  out.rumpf = rumpf;

  // --- Kopf (Kuppel)
  const kopfD = ctx.P(`M${K.c[0] - K.rx} ${K.c[1] + K.ry * 0.25} C${K.c[0] - K.rx * 1.02} ${K.c[1] - K.ry * 0.75} ${K.c[0] - K.rx * 0.6} ${K.c[1] - K.ry * 1.02} ${K.c[0]} ${K.c[1] - K.ry} ` +
    `C${K.c[0] + K.rx * 0.6} ${K.c[1] - K.ry * 1.02} ${K.c[0] + K.rx * 1.02} ${K.c[1] - K.ry * 0.75} ${K.c[0] + K.rx} ${K.c[1] + K.ry * 0.25} ` +
    `C${K.c[0] + K.rx * 0.98} ${K.c[1] + K.ry * 0.8} ${K.c[0] + K.rx * 0.5} ${K.c[1] + K.ry * 0.92} ${K.c[0]} ${K.c[1] + K.ry * 0.9} ` +
    `C${K.c[0] - K.rx * 0.5} ${K.c[1] + K.ry * 0.92} ${K.c[0] - K.rx * 0.98} ${K.c[1] + K.ry * 0.8} ${K.c[0] - K.rx} ${K.c[1] + K.ry * 0.25}Z`);
  const flecken = [[-0.55, -0.45, 7], [-0.3, -0.72, 5], [0.58, -0.4, 6]].map(([fx, fy, r]) =>
    `<path d="${ctx.ell(K.c[0] + K.rx * fx, K.c[1] + K.ry * fy, r, r)}" fill="${pal.schatten}" opacity="0.5"/>`).join('');
  // Tintentropfen auf dem Kopf
  const g = S.lockeB[0] / 14;
  const tx = K.c[0] + 6, ty = K.c[1] - K.ry - 8 * g;
  const tropfen = ctx.P(`M${tx + 12 * g} ${ty - 30 * g} Q${tx + 2 * g} ${ty - 30 * g} ${tx + 14 * g} ${ty - 2 * g} A${14 * g} ${14 * g} 0 1 1 ${tx - 14 * g} ${ty - 2 * g} Q${tx - 10 * g} ${ty - 24 * g} ${tx + 12 * g} ${ty - 30 * g}Z`);
  out.kopf = ctx.form(tropfen, { fill: pal.akzent, schatten: pal.akzentSchatten, versatz: [4, 3] }) +
    `<path d="${ctx.ell(tx - 5 * g, ty - 2 * g, 3.5 * g, 5 * g)}" fill="#ffffff" opacity="0.7"/>` +
    ctx.form(kopfD, { muster: true, versatz: [11, 9], innen: flecken }) +
    `<path d="${ctx.ell(K.c[0] - K.rx * 0.45, K.c[1] - K.ry * 0.6, K.rx * 0.2, K.ry * 0.1)}" fill="#ffffff" opacity="0.45" transform="rotate(-30 ${ctx.m(K.c[0] - K.rx * 0.45, K.c[1] - K.ry * 0.6).join(' ')})"/>`;

  // --- Arme
  const arm = (pts) => tentakel(pts, S.armB[0], S.armB[1], S.saugnapf);
  out.armL = arm(S.armL);
  const armR = spiegelPunkte(S.armL);
  out.armR = arm(armR);

  out.armEbene = 'mitte';
  out.anker = {
    ...S.anker,
    kopf: K,
    augen: S.augen,
    mund: { p: [S.mund[0], S.mund[1]], w: S.mund[2] },
    wangen: S.wangen,
    armBreite: S.armB[0],
    schulterL: S.armL[0], handL: S.armL[S.armL.length - 2],
    schulterR: armR[0], handR: armR[armR.length - 2],
    armSpitze: armR[armR.length - 1],
    kappe: { hoehe: 0.05, fy: 1.02 },
    hut: { hoehe: 0.72 },
    brille: { band: 1.0 },
    pfeife: [150, S.mund[1] + 26],
  };
  return out;
}
