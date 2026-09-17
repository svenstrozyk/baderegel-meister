// Kiesel – ruhige, vorsichtige Schildkröte (Stufe 1 Kiesel, 2 Kieselstein, 3 Kieselfels)
// Eigenes Design: kugeliger Kiesel-Panzer als „Mantel“ hinter dem Körper, breiter Kopf mit Sommersprossen-Kieseln.
import { spiegelPunkte } from '../geo.js';
import { mische } from '../palette.js';

const STUFEN = {
  1: {
    panzer: [150, 214, 90, 66],
    platte: [150, 238, 54, 44],
    kopf: { c: [150, 138], rx: 60, ry: 48 },
    augen: { l: [124, 134], r: [176, 134], rad: 22 },
    wangen: { pts: [[102, 160], [198, 160]], rx: 10, ry: 6 },
    mund: [150, 166, 20],
    armL: [[98, 214], [88, 232], [84, 246]], armB: [24, 22],
    fuesse: [[118, 280], 22, 12],
    anker: { hals: [150, 178], stirn: [150, 100], brust: [150, 210], bauch: [150, 244], schulterBreite: 60, umhangUnten: 278 },
  },
  2: {
    panzer: [150, 202, 98, 76],
    platte: [150, 226, 50, 54],
    kopf: { c: [150, 120], rx: 54, ry: 43 },
    augen: { l: [127, 116], r: [173, 116], rad: 19 },
    wangen: { pts: [[106, 140], [194, 140]], rx: 9, ry: 5.5 },
    mund: [150, 146, 18],
    armL: [[90, 196], [74, 218], [68, 240]], armB: [26, 24],
    fuesse: [[114, 280], 26, 12],
    wellen: true,
    anker: { hals: [150, 156], stirn: [150, 82], brust: [150, 196], bauch: [150, 236], schulterBreite: 66, umhangUnten: 276 },
  },
  3: {
    panzer: [150, 190, 112, 88],
    platte: [150, 214, 56, 64],
    kopf: { c: [150, 102], rx: 58, ry: 47 },
    augen: { l: [128, 102], r: [172, 102], rad: 17 },
    wangen: { pts: [[108, 124], [192, 124]], rx: 8, ry: 5 },
    mund: [150, 130, 18],
    armL: [[82, 184], [68, 204], [62, 224]], armB: [32, 30],
    fuesse: [[110, 280], 30, 13],
    felsen: true, schild: true,
    anker: { hals: [150, 138], stirn: [150, 66], brust: [150, 184], bauch: [150, 230], schulterBreite: 72, umhangUnten: 276 },
  },
};

export default function kiesel(ctx, stufe) {
  const S = STUFEN[stufe];
  const { pal } = ctx;
  const haut = mische('#b9e384', pal.haupt, 0.2);
  const hautSchatten = mische(haut, '#5a4a8a', 0.25);
  const out = {};
  const [px, py, prx, pry] = S.panzer;

  // --- Panzer (hinten, Kiesel-Kuppel)
  let panzerInnen = '';
  if (S.wellen) {
    panzerInnen += [-1, 1].map((f) => [0, 1, 2].map((i) => {
      const x0 = px + f * (prx * 0.55 + i * 12), y0 = py - pry * 0.55 + i * 30;
      return ctx.strich(ctx.P(`M${x0 - 16} ${y0} Q${x0 - 8} ${y0 - 10} ${x0} ${y0} Q${x0 + 8} ${y0 + 10} ${x0 + 16} ${y0}`), 4, pal.akzent);
    }).join('')).join('');
    panzerInnen += ctx.strich(ctx.P(`M${px - 30} ${py - pry * 0.84} Q${px - 15} ${py - pry * 0.95} ${px} ${py - pry * 0.84} Q${px + 15} ${py - pry * 0.73} ${px + 30} ${py - pry * 0.84}`), 4, pal.akzent);
  }
  if (S.felsen) {
    panzerInnen += [-1, 1].map((f) => [0, 1].map((i) => {
      const x0 = px + f * (prx * 0.62 + i * 14), y0 = py - pry * 0.35 + i * 44;
      return ctx.strich(ctx.P(`M${x0 - 18} ${y0} Q${x0 - 9} ${y0 - 11} ${x0} ${y0} Q${x0 + 9} ${y0 + 11} ${x0 + 18} ${y0}`), 4.5, pal.akzent);
    }).join('')).join('');
  }
  let panzerD;
  if (S.felsen) {
    // Kuppel mit runden Felshöckern entlang der Oberkante
    const pts = [];
    const n = 22;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const oben = Math.sin(a) < -0.2;
      const k = oben ? (i % 2 ? 1.0 : 1.09) : 1;
      pts.push([px + Math.cos(a) * prx * k, py + Math.sin(a) * pry * k]);
    }
    panzerD = ctx.glatt(pts, true, 1);
  } else {
    panzerD = ctx.ell(px, py, prx, pry);
  }
  const rand = `<path d="${ctx.ell(px, py, prx * 0.9, pry * 0.88)}" fill="none" stroke="${pal.hell}" stroke-width="${ctx.n(5)}" opacity="0.55"/>`;
  const flecken = S.wellen || S.felsen ? '' : [[-0.62, -0.1, 11], [0.64, -0.2, 9], [-0.4, -0.62, 8], [0.45, -0.66, 10]].map(([fx2, fy2, r]) =>
    `<path d="${ctx.ell(px + prx * fx2, py + pry * fy2, r, r * 0.75)}" fill="${pal.hell}" opacity="0.45"/>`).join('');
  out.hinten = ctx.form(panzerD, { muster: true, versatz: [12, 10], innen: rand + flecken + panzerInnen + `<path d="${ctx.ell(px, py + pry * 0.95, prx * 0.9, pry * 0.25)}" fill="${pal.schatten}"/>` }) +
    `<path d="${ctx.ell(px - prx * 0.55, py - pry * 0.5, prx * 0.18, pry * 0.1)}" fill="#ffffff" opacity="0.45" transform="rotate(-25 ${ctx.m(px - prx * 0.55, py - pry * 0.5).join(' ')})"/>`;

  // --- Füße, Bauchplatte
  const [[fx, fy], frx, fry] = S.fuesse;
  const fuss = (x) => ctx.form(ctx.ell(x, fy, frx, fry), { fill: haut, schatten: hautSchatten, versatz: [0, -5] }) +
    [-0.4, 0, 0.4].map((k) => `<path d="${ctx.ell(x + frx * k, fy + fry * 0.35, 3, 2.4)}" fill="${hautSchatten}"/>`).join('');
  const [bx, by, brx, bry] = S.platte;
  const nahtY = [0.35, 0.72].map((f) => by - bry + bry * 2 * f);
  const naehte = nahtY.map((y) => ctx.strich(ctx.P(`M${bx - brx} ${y} Q${bx} ${y + 8} ${bx + brx} ${y}`), 3, pal.hellSchatten)).join('');
  let platte = ctx.form(ctx.ell(bx, by, brx, bry), { fill: pal.hell, schatten: pal.hellSchatten, versatz: [7, 3], innen: S.schild ? '' : naehte });
  if (S.schild) {
    const [sx, sy] = [bx, by - 6];
    const schild = ctx.P(`M${sx} ${sy - 34} Q${sx + 18} ${sy - 26} ${sx + 30} ${sy - 28} Q${sx + 32} ${sy + 12} ${sx} ${sy + 36} Q${sx - 32} ${sy + 12} ${sx - 30} ${sy - 28} Q${sx - 18} ${sy - 26} ${sx} ${sy - 34}Z`);
    const blitz = ctx.P(`M${sx + 4} ${sy - 24} L${sx - 12} ${sy + 4} L${sx - 1} ${sy + 4} L${sx - 6} ${sy + 26} L${sx + 13} ${sy - 6} L${sx + 2} ${sy - 6} Z`);
    platte += ctx.form(schild, { fill: pal.akzent, schatten: pal.akzentSchatten, versatz: [5, 4] }) +
      ctx.form(blitz, { fill: '#ffe14a', schatten: '#f4b52a', versatz: [3, 3], linie: ctx.lw * 0.7 });
  }
  out.rumpf = fuss(fx) + fuss(300 - fx) + platte;

  // --- Kopf
  const K = S.kopf;
  const hals = ctx.form(ctx.P(`M${K.c[0] - K.rx * 0.5} ${K.c[1] + K.ry * 0.5} L${K.c[0] - K.rx * 0.46} ${K.c[1] + K.ry * 1.25} L${K.c[0] + K.rx * 0.46} ${K.c[1] + K.ry * 1.25} L${K.c[0] + K.rx * 0.5} ${K.c[1] + K.ry * 0.5}Z`), { fill: haut, schatten: hautSchatten, versatz: [6, 0] });
  void hals;
  const sprossen = [[-0.3, -0.62, 5], [0.05, -0.75, 4], [0.34, -0.58, 5.5]].map(([fx2, fy2, r]) =>
    `<path d="${ctx.ell(K.c[0] + K.rx * fx2, K.c[1] + K.ry * fy2, r, r * 0.8)}" fill="${hautSchatten}" opacity="0.8"/>`).join('');
  out.kopf = ctx.form(ctx.ell(K.c[0], K.c[1], K.rx, K.ry), { fill: haut, schatten: hautSchatten, versatz: [8, 7], innen: sprossen }) +
    `<path d="${ctx.ell(K.c[0] - K.rx * 0.5, K.c[1] - K.ry * 0.45, K.rx * 0.16, K.ry * 0.09)}" fill="#ffffff" opacity="0.5"/>` +
    // Nasenlöcher
    [-1, 1].map((f) => `<path d="${ctx.ell(K.c[0] + f * 4, S.mund[1] - 9, 1.6, 1.3)}" fill="${pal.linie}" opacity="0.7"/>`).join('');
  if (stufe === 3) {
    out.kopfVorne = [-1, 1].map((f) => ctx.strich(ctx.P(`M${150 + f * 12} ${76} Q${150 + f * 24} ${70} ${150 + f * 36} ${75}`), 4.5)).join('');
  }

  // --- Arme (Stummelbeine mit Krallenpunkten)
  const arm = (pts) => {
    const e = pts[pts.length - 1];
    return ctx.wurstForm(pts, S.armB[0], S.armB[1], { hand: 4 }, { fill: haut, schatten: hautSchatten, versatz: [4, 5] }) +
      [-0.3, 0.3].map((k) => `<path d="${ctx.ell(e[0] + S.armB[1] * k, e[1] + S.armB[1] * 0.25, 2.4, 2)}" fill="${hautSchatten}"/>`).join('');
  };
  out.armL = arm(S.armL);
  const armR = spiegelPunkte(S.armL);
  out.armR = arm(armR);

  out.anker = {
    ...S.anker,
    kopf: K,
    augen: S.augen,
    mund: { p: [S.mund[0], S.mund[1]], w: S.mund[2] },
    wangen: S.wangen,
    armBreite: S.armB[1],
    schulterL: S.armL[0], handL: S.armL[S.armL.length - 1],
    schulterR: armR[0], handR: armR[armR.length - 1],
    kappe: { hoehe: 0.28 },
    hut: { hoehe: 0.6 },
  };
  return out;
}
