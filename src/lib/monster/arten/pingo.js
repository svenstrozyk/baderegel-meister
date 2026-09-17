// Pingo – fröhlicher, verfrorener Pinguin (Stufe 1 Pingo, 2 Pingolo, 3 Kaiser-Pingo)
// Eigenes Design: Herz-Gesichtsmaske, Flausch-Kontur beim Küken, Stirnfeder, Handtuch-Mantel mit Federkrone.
import { rohr, spiegelPunkte, ellipsenPunkte } from '../geo.js';
import { handtuchUmhang } from '../zubehoer.js';

const ORANGE = '#ff9d2e', ORANGE_S = '#e0701a';

const STUFEN = {
  1: {
    kopf: { c: [150, 142], rx: 66, ry: 56 },
    flausch: true,
    rumpf: { c: [150, 230], rx: 70, ry: 56 },
    maske: 1.0, maskeY: 146,
    augen: { l: [126, 138], r: [174, 138], rad: 21 },
    wangen: { pts: [[108, 164], [192, 164]], rx: 10, ry: 6 },
    schnabel: [150, 160, 1],
    bauch: [150, 238, 44, 38],
    feder: [[[146, 90], [140, 72], [150, 62]], [[154, 90], [160, 70], [172, 66]]], federB: [9, 4],
    armL: [[100,  206],  [90,  224],  [84,  242]], armB: [22, 12],
    fuesse: [[124, 284], 18, 7],
    anker: { hals: [150, 190], stirn: [150, 104], brust: [150, 214], bauch: [150, 242], schulterBreite: 60, umhangUnten: 280 },
  },
  2: {
    kopf: { c: [150, 108], rx: 60, ry: 52 },
    rumpf: [[150, 138], [194, 152], [212, 200], [206, 250], [178, 280], [122, 280], [94, 250], [88, 200], [106, 152]],
    maske: 0.9, maskeY: 112,
    augen: { l: [128, 104], r: [172, 104], rad: 19 },
    wangen: { pts: [[110, 128], [190, 128]], rx: 9, ry: 5.5 },
    schnabel: [150, 126, 1.1],
    bauch: [150, 218, 44, 56],
    feder: [[[150, 62], [144, 44], [152, 24]]], federB: [7, 3], federBauch: 12,
    armL: [[108,  172],  [94,  202],  [86,  238]], armB: [22, 10],
    fuesse: [[118, 284], 28, 8],
    anker: { hals: [150, 152], stirn: [150, 70], brust: [150, 180], bauch: [150, 226], schulterBreite: 62, umhangUnten: 276 },
  },
  3: {
    kopf: { c: [150, 98], rx: 56, ry: 48 },
    rumpf: [[150, 130], [200, 142], [222, 196], [216, 254], [186, 282], [114, 282], [84, 254], [78, 196], [100, 142]],
    maske: 0.86, maskeY: 102,
    augen: { l: [130, 96], r: [170, 96], rad: 17 },
    wangen: { pts: [[112, 118], [188, 118]], rx: 8, ry: 5 },
    schnabel: [150, 116, 1.1],
    bauch: [150, 210, 48, 64],
    krone: true,
    armL: [[102,  162],  [84,  198],  [74,  240]], armB: [26, 11],
    fuesse: [[114, 284], 30, 9],
    mantel: true,
    anker: { hals: [150, 142], stirn: [150, 62], brust: [150, 172], bauch: [150, 222], schulterBreite: 70, umhangUnten: 274 },
  },
};

export default function pingo(ctx, stufe) {
  const S = STUFEN[stufe];
  const { pal } = ctx;
  const out = {};
  const K = S.kopf;

  // Mantel (Stufe 3) hinter allem
  let hinten = '';
  if (S.mantel) {
    const m = handtuchUmhang(ctx, { hals: S.anker.hals, schulterBreite: S.anker.schulterBreite * 1.3, umhangUnten: S.anker.umhangUnten });
    hinten += m.hinten;
    out.vorneRumpf = m.vorne;
    out.eigenerUmhang = true;
  }
  out.hinten = hinten;

  // Füße
  const [[fx, fy], frx, fry] = S.fuesse;
  const fuss = (x, f) => ctx.form(ctx.P(`M${x - frx * 0.6} ${fy - fry} Q${x} ${fy - fry * 1.6} ${x + frx * 0.6} ${fy - fry} Q${x + frx * 1.1 * f + frx * 0.2} ${fy + fry * 0.4} ${x + frx * 0.9} ${fy + fry} L${x - frx * 0.9} ${fy + fry} Q${x - frx * 1.1} ${fy + fry * 0.4} ${x - frx * 0.6} ${fy - fry}Z`),
    { fill: ORANGE, schatten: ORANGE_S, versatz: [0, -4], linie: ctx.lw * 0.9 }) +
    [-0.35, 0.35].map((k) => ctx.strich(ctx.P(`M${x + frx * k} ${fy - fry * 0.3} L${x + frx * k * 1.3} ${fy + fry * 0.8}`), 2, ORANGE_S)).join('');

  // Rumpf
  const rumpfD = S.flausch
    ? ctx.glatt(ellipsenPunkte(S.rumpf.c[0], S.rumpf.c[1], S.rumpf.rx, S.rumpf.ry, 26, 0.035), true, 1)
    : ctx.glatt(S.rumpf);
  const [bx, by, brx, bry] = S.bauch;
  const bauchD = S.flausch ? ctx.glatt(ellipsenPunkte(bx, by, brx, bry, 18, 0.05), true, 1) : ctx.ell(bx, by, brx, bry);
  const bauch = ctx.form(bauchD, { fill: pal.hell, schatten: pal.hellSchatten, versatz: [7, 2], ohneLinie: true });
  out.rumpf = fuss(fx, -1) + fuss(300 - fx, 1) +
    ctx.form(rumpfD, { muster: true, versatz: [10, 7], innen: bauch });

  // Kopf
  let kopfHinten = '';
  if (S.feder) {
    kopfHinten += S.feder.map((f) => ctx.form(ctx.glatt(rohr(f, S.federB[0], S.federB[1], { schritte: 3, bauch: S.federBauch ?? 0 }), true, 0.9), { fill: stufe === 1 ? pal.haupt : pal.akzent, schatten: stufe === 1 ? pal.schatten : pal.akzentSchatten, versatz: [3, 3] })).join('');
  }
  if (S.krone) {
    const gold = '#ffcf3f', goldS = '#e8a22a';
    kopfHinten += [[-28, 0.9], [0, 1.1], [28, 0.9]].map(([w, g]) => {
      const f = [[150, 58], [150, 40 - 8 * g], [150, 22 - 16 * g]];
      const [ox, oy] = ctx.m(150, 58);
      return `<g transform="rotate(${w} ${ox} ${oy})">` +
        ctx.form(ctx.glatt(rohr(f, 6, 4, { schritte: 3, bauch: 18 * g }), true, 0.9), { fill: gold, schatten: goldS, versatz: [3, 2], innen: ctx.strich(ctx.P(`M150 56 L150 ${24 - 12 * g}`), 2, goldS) }) + '</g>';
    }).join('') + `<path d="${ctx.ell(150, 54, 8, 7)}" fill="${pal.akzent}" stroke="${pal.linie}" stroke-width="3"/>`;
  }
  out.kopfHinten = kopfHinten;
  const kopfD = S.flausch ? ctx.glatt(ellipsenPunkte(K.c[0], K.c[1], K.rx, K.ry, 24, 0.035, 0.13), true, 1) : ctx.ell(K.c[0], K.c[1], K.rx, K.ry);
  const mk = S.maske, my = S.maskeY;
  const maske = ctx.glatt([[150, my - 30 * mk], [176, my - 46 * mk], [202, my - 30 * mk], [204, my + 4 * mk], [186, my + 34 * mk], [150, my + 44 * mk], [114, my + 34 * mk], [96, my + 4 * mk], [98, my - 30 * mk], [124, my - 46 * mk]]
    .map(([x, y]) => [150 + (x - 150) * mk, y]), true, 0.95);
  let backen = '';
  if (S.krone) {
    backen = [-1, 1].map((f) => `<path d="${ctx.ell(150 + f * 50, 126, 12, 18)}" fill="#ffc53a" stroke="${pal.linie}" stroke-width="3" transform="rotate(${f * -25} ${ctx.m(150 + f * 50, 126).join(' ')})"/>`).join('');
  }
  out.kopf = ctx.form(kopfD, { muster: true, versatz: [9, 8] }) +
    ctx.form(maske, { fill: pal.hell, schatten: pal.hellSchatten, versatz: [5, 5], linie: ctx.lw * 0.6 }) + backen +
    `<path d="${ctx.ell(K.c[0] - K.rx * 0.5, K.c[1] - K.ry * 0.62, K.rx * 0.17, K.ry * 0.09)}" fill="#ffffff" opacity="0.45"/>`;

  // Schnabel als Mund
  const [sx, sy, sk] = S.schnabel;
  out.mund = (v) => {
    const offen = ['offen', 'ruf', 'o'].includes(v);
    const auf = v === 'ruf' ? 9 : v === 'offen' ? 7 : v === 'o' ? 5 : 0;
    const oben = ctx.P(`M${sx - 13 * sk} ${sy - 3} Q${sx} ${sy - 11 * sk} ${sx + 13 * sk} ${sy - 3} Q${sx + 5 * sk} ${sy + 8 * sk - auf * 0.2} ${sx} ${sy + 9 * sk - auf * 0.3} Q${sx - 5 * sk} ${sy + 8 * sk - auf * 0.2} ${sx - 13 * sk} ${sy - 3}Z`);
    let m = '';
    if (offen) {
      const unten = ctx.P(`M${sx - 9 * sk} ${sy + 2} Q${sx} ${sy + 4 + auf * 1.6} ${sx + 9 * sk} ${sy + 2}Z`);
      m += ctx.flaeche(ctx.P(`M${sx - 9 * sk} ${sy + 1} Q${sx} ${sy + 2 + auf * 1.5} ${sx + 9 * sk} ${sy + 1}Z`), '#7c1f3c', { linie: 0 }) +
        ctx.form(unten, { fill: ORANGE, schatten: ORANGE_S, versatz: [0, -3], linie: ctx.lw * 0.6 });
    }
    m += ctx.form(oben, { fill: ORANGE, schatten: ORANGE_S, versatz: [0, -3], linie: ctx.lw * 0.65 }) +
      `<path d="${ctx.ell(sx - 4 * sk, sy - 4 * sk, 3.5 * sk, 1.6 * sk)}" fill="#ffffff" opacity="0.7"/>`;
    if (v === 'wellig') m += ctx.strich(ctx.P(`M${sx - 7} ${sy + 12} Q${sx - 3} ${sy + 9} ${sx} ${sy + 12} Q${sx + 3} ${sy + 15} ${sx + 7} ${sy + 12}`), 2.5);
    return m;
  };

  // Flossen
  const arm = (pts) => ctx.wurstForm(pts, S.armB[0], S.armB[1], { bauch: 8 }, { fill: pal.haupt, schatten: pal.schatten, versatz: [4, 5], muster: true }) +
    ctx.strich(ctx.P(`M${pts[0][0] + (pts[1][0] - pts[0][0]) * 0.3} ${pts[0][1] + 6} Q${pts[1][0]} ${pts[1][1] + 2} ${pts[2][0] + (pts[1][0] - pts[2][0]) * 0.3} ${pts[2][1] - 6}`), 2.2, pal.hell, ' opacity="0.55"');
  out.armL = arm(S.armL);
  const armR = spiegelPunkte(S.armL);
  out.armR = arm(armR);

  out.anker = {
    ...S.anker,
    kopf: K,
    augen: S.augen,
    mund: { p: [sx, sy], w: 22 },
    wangen: S.wangen,
    armBreite: S.armB[0],
    schulterL: S.armL[0], handL: S.armL[S.armL.length - 1],
    schulterR: armR[0], handR: armR[armR.length - 1],
    kappe: { hoehe: 0.3 },
    hut: { hoehe: 0.62 },
  };
  return out;
}
