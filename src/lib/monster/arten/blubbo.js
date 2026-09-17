// Blubbo – verspielter, hilfsbereiter Otter (Stufe 1 Blubbo, 2 Blubbolino, 3 Rettungsblubbo)
// Eigenes Design: runde Knopfohren, Schnurrbart-Polster in Herzform, Wuschelschwanz, Farbe frei wählbar.
import { rohr, spiegelPunkte } from '../geo.js';

const STUFEN = {
  1: {
    kopf: { c: [150, 124], rx: 70, ry: 54 },
    ohren: [[86, 100], 14],
    schnauze: [150, 150, 1.05],
    augen: { l: [120, 114], r: [180, 114], rad: 23 },
    wangen: { pts: [[100, 142], [200, 142]], rx: 11, ry: 6.5 },
    schopf: [[146, 76], [144, 58], [156, 50], [166, 58]], schopfB: [12, 6],
    rumpf: [[150, 170], [190, 184], [206, 224], [198, 262], [172, 280], [128, 280], [102, 262], [94, 224], [110, 184]],
    bauch: [150, 226, 36, 46],
    fuesse: [[124, 280], 24, 11],
    schwanz: [[186, 262], [222, 262], [244, 238], [248, 206]], schwanzB: [30, 30, 12],
    armL: [[118,  192],  [105,  210],  [104,  232]], armB: [22, 20],
    anker: { hals: [150, 176], stirn: [150, 82], brust: [150, 202], bauch: [150, 238], schulterBreite: 56, umhangUnten: 276 },
  },
  2: {
    kopf: { c: [150, 104], rx: 60, ry: 46 },
    ohren: [[94, 90], 12],
    schnauze: [150, 128, 0.92],
    augen: { l: [124, 96], r: [176, 96], rad: 20 },
    wangen: { pts: [[108, 118], [192, 118]], rx: 9, ry: 5.5 },
    schopf: [[142, 64], [142, 48], [156, 42], [165, 50]], schopfB: [13, 5],
    rumpf: [[150, 146], [186, 158], [202, 200], [196, 244], [180, 276], [120, 276], [104, 244], [98, 200], [114, 158]],
    bauch: [150, 204, 32, 60],
    fuesse: [[120, 280], 27, 10],
    schwanz: [[180, 258], [224, 258], [254, 238], [268, 204]], schwanzB: [30, 22, 8],
    armL: [[120,  168],  [105,  192],  [104,  218]], armB: [21, 19],
    kiesel: true,
    anker: { hals: [150, 150], stirn: [150, 64], brust: [150, 180], bauch: [150, 226], schulterBreite: 60, umhangUnten: 272 },
  },
  3: {
    kopf: { c: [150, 94], rx: 56, ry: 43 },
    ohren: [[98, 80], 11],
    schnauze: [150, 116, 0.88],
    augen: { l: [127, 88], r: [173, 88], rad: 18 },
    wangen: { pts: [[112, 108], [188, 108]], rx: 8, ry: 5 },
    schopf: [[130, 58], [138, 40], [158, 32], [176, 40], [172, 52]], schopfB: [17, 6],
    rumpf: [[150, 136], [194, 146], [214, 190], [204, 238], [186, 276], [114, 276], [96, 238], [86, 190], [106, 146]],
    bauch: [150, 196, 38, 64],
    fuesse: [[118, 280], 30, 11],
    schwanz: [[178, 256], [228, 258], [264, 236], [280, 196]], schwanzB: [34, 26, 10],
    armL: [[114,  160],  [97,  186],  [96,  214]], armB: [25, 21],
    schaerpe: true,
    anker: { hals: [150, 140], stirn: [150, 56], brust: [150, 176], bauch: [152, 222], schulterBreite: 68, umhangUnten: 272 },
  },
};

export default function blubbo(ctx, stufe) {
  const S = STUFEN[stufe];
  const { pal } = ctx;
  const out = {};
  const K = S.kopf;

  // Schwanz (flauschig, flach)
  const sw = rohr(S.schwanz, S.schwanzB[0], S.schwanzB[1], { schritte: 3, bauch: S.schwanzB[2] });
  out.hinten = ctx.form(ctx.glatt(sw, true, 0.9), { muster: true, versatz: [5, 8] }) +
    ctx.strich(ctx.P(`M${S.schwanz[1][0]} ${S.schwanz[1][1] + 4} Q${S.schwanz[2][0] - 6} ${S.schwanz[2][1] + 4} ${S.schwanz[3][0] - 8} ${S.schwanz[3][1] + 10}`), 2.5, pal.hell, ' opacity="0.7"');

  // Rumpf, Bauch, Füße
  const [bx, by, brx, bry] = S.bauch;
  let innen = '';
  if (S.schaerpe) {
    const [x1, y1, x2, y2] = [94, 146, 214, 262];
    const linie = ctx.P(`M${x1} ${y1} L${x2} ${y2}`);
    innen = `<path d="${linie}" stroke="${pal.linie}" stroke-width="${ctx.n(30) + 7}" fill="none"/>` +
      `<path d="${linie}" stroke="#ffffff" stroke-width="${ctx.n(30)}" fill="none"/>` +
      `<path d="${linie}" stroke="#ff4b4b" stroke-width="${ctx.n(30)}" fill="none" stroke-dasharray="${ctx.n(26)} ${ctx.n(22)}" stroke-dashoffset="${ctx.n(8)}"/>`;
  }
  const bauchForm = ctx.form(ctx.ell(bx, by, brx, bry), { fill: pal.hell, schatten: pal.hellSchatten, versatz: [7, 0], ohneLinie: true });
  out.rumpf = ctx.form(ctx.glatt(S.rumpf), { muster: true, versatz: [9, 6], innen: bauchForm + innen });
  if (S.schaerpe) {
    // Stern-Abzeichen auf der Schärpe
    const [sx, sy] = [124, 172];
    let d = '';
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 6 : 13, a = -Math.PI / 2 + (i * Math.PI) / 5;
      d += (i ? 'L' : 'M') + (sx + Math.cos(a) * r).toFixed(1) + ' ' + (sy + Math.sin(a) * r).toFixed(1);
    }
    out.rumpf += ctx.form(ctx.P(d + 'Z'), { fill: '#ffd23f', schatten: '#f0a92a', versatz: [3, 3], linie: ctx.lw * 0.7 });
  }
  const [[fx, fy], frx, fry] = S.fuesse;
  const fuss = (x) => ctx.form(ctx.ell(x, fy, frx, fry), { fill: pal.dunkel, schatten: pal.linie, versatz: [0, -4], linie: ctx.lw * 0.9 }) +
    [-0.35, 0.35].map((k) => ctx.strich(ctx.P(`M${x + frx * k} ${fy - fry * 0.9} L${x + frx * k} ${fy + fry * 0.1}`), 2.2, pal.hell, ' opacity="0.6"')).join('');
  out.rumpf += fuss(fx) + fuss(300 - fx);

  // Kopf
  const [ox, oy] = S.ohren[0], orr = S.ohren[1];
  const ohr = (x) => ctx.form(ctx.ell(x, oy, orr, orr), { versatz: [3, 4] }) +
    `<path d="${ctx.ell(x, oy + 2, orr * 0.55, orr * 0.55)}" fill="${pal.hell}" opacity="0.9"/>`;
  out.kopfHinten = ohr(ox) + ohr(300 - ox);
  const kopfD = ctx.ell(K.c[0], K.c[1], K.rx, K.ry);
  // Fell-Wuschel: drei runde Büschel
  const sg = S.schopfB[0] / 12, sy0 = K.c[1] - K.ry + 6;
  const schopf = ctx.P(`M${150 - 22 * sg} ${sy0 + 4} Q${150 - 26 * sg} ${sy0 - 14 * sg} ${150 - 12 * sg} ${sy0 - 12 * sg} Q${150 - 8 * sg} ${sy0 - 28 * sg} ${150 + 4 * sg} ${sy0 - 20 * sg} Q${150 + 16 * sg} ${sy0 - 30 * sg} ${150 + 20 * sg} ${sy0 - 12 * sg} Q${150 + 30 * sg} ${sy0 - 8 * sg} ${150 + 22 * sg} ${sy0 + 4}Z`);
  const [mx, my, mk] = S.schnauze;
  const schnauzeD = ctx.glatt([[mx, my - 12 * mk], [mx + 16 * mk, my - 17 * mk], [mx + 34 * mk, my - 5 * mk], [mx + 30 * mk, my + 13 * mk], [mx + 12 * mk, my + 19 * mk], [mx, my + 14 * mk],
    [mx - 12 * mk, my + 19 * mk], [mx - 30 * mk, my + 13 * mk], [mx - 34 * mk, my - 5 * mk], [mx - 16 * mk, my - 17 * mk]], true, 0.9);
  const punkte = [-1, 1].map((f) => [[18, -2], [25, 5], [15, 8]].map(([dx, dy]) =>
    `<path d="${ctx.ell(mx + f * dx * mk, my + dy * mk, 1.8, 1.8)}" fill="${pal.linie}" opacity="0.55"/>`).join('')).join('');
  const haare = [-1, 1].map((f) => [[-6, 0.9], [4, 1], [13, 0.85]].map(([dy, l]) =>
    ctx.strich(ctx.P(`M${mx + f * 32 * mk} ${my + dy * mk * 0.6} Q${mx + f * 48 * mk} ${my + dy * mk - 4} ${mx + f * (32 + 30 * l) * mk} ${my + dy * mk * 1.4 - 2}`), 2.2)).join('')).join('');
  out.kopf = ctx.form(schopf, { versatz: [3, 3] }) +
    ctx.form(kopfD, { muster: true, versatz: [9, 8] }) +
    `<path d="${ctx.ell(K.c[0] - K.rx * 0.45, K.c[1] - K.ry * 0.62, K.rx * 0.2, K.ry * 0.09)}" fill="#ffffff" opacity="0.4"/>` +
    ctx.form(schnauzeD, { fill: pal.hell, schatten: pal.hellSchatten, versatz: [4, 4], linie: ctx.lw * 0.65 }) + punkte + haare +
    ctx.form(ctx.P(`M${mx - 10 * mk} ${my - 9 * mk} Q${mx} ${my - 14 * mk} ${mx + 10 * mk} ${my - 9 * mk} Q${mx + 8 * mk} ${my + 2 * mk} ${mx} ${my + 3 * mk} Q${mx - 8 * mk} ${my + 2 * mk} ${mx - 10 * mk} ${my - 9 * mk}Z`),
      { fill: '#3a2733', schatten: '#1c1320', versatz: [2, 2], linie: 2.5 }) +
    `<path d="${ctx.ell(mx - 3 * mk, my - 8 * mk, 3 * mk, 1.8 * mk)}" fill="#ffffff" opacity="0.8"/>`;
  if (stufe === 3) {
    // freundlich hochgezogene Brauen (innen höher als außen)
    out.kopfVorne = [-1, 1].map((f) => ctx.strich(ctx.P(`M${150 + f * 14} ${61} Q${150 + f * 25} ${58} ${150 + f * 36} ${66}`), 4)).join('');
  }

  // Arme
  const arm = (pts, mitKiesel) => {
    let a = ctx.wurstForm(pts, S.armB[0], S.armB[1], { hand: 4 }, { muster: true, versatz: [4, 5] });
    const e = pts[pts.length - 1];
    a += `<path d="${ctx.ell(e[0], e[1] + 3, S.armB[1] * 0.28, S.armB[1] * 0.2)}" fill="${pal.hell}" opacity="0.8"/>`;
    if (mitKiesel) {
      a += ctx.form(ctx.ell(e[0] + 2, e[1] + 15, 20, 15), { fill: '#d6dfea', schatten: '#8a99ad', versatz: [4, 3] }) +
        `<path d="${ctx.ell(e[0] - 4, e[1] + 10, 5.5, 3)}" fill="#ffffff" opacity="0.85"/>`;
    }
    return a;
  };
  out.armL = arm(S.armL, S.kiesel);
  const armR = spiegelPunkte(S.armL);
  out.armR = arm(armR, false);

  out.anker = {
    ...S.anker,
    kopf: K,
    augen: S.augen,
    mund: { p: [mx, my + 6 * mk], w: 18 * mk + 4 },
    wangen: S.wangen,
    armBreite: S.armB[1],
    schulterL: S.armL[0], handL: S.armL[S.armL.length - 1],
    schulterR: armR[0], handR: armR[armR.length - 1],
    kappe: { hoehe: 0.3 },
    hut: { hoehe: 0.62 },
    pfeife: stufe === 3 ? [168, 186] : undefined,
  };
  return out;
}
