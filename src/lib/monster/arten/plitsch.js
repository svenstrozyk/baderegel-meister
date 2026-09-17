// Plitsch – neugieriges Seepferdchen (Stufe 1 Plitsch, 2 Plitscho, 3 Plitschodrako)
// Eigenständiges Design: Blasen-Krönchen, kurzer Trompeten-Rüssel, Pummel-Flossenärmchen.
import { rohr, spiegelPunkte } from '../geo.js';

const STUFEN = {
  1: {
    kopf: { c: [146, 128], rx: 62, ry: 58 },
    ruessel: 'M178 136 C196 138 210 144 220 148 C234 152 236 172 220 174 C206 176 192 176 178 178 Z',
    spitze: [222, 162], spitzeR: [9, 11],
    augen: { l: [118, 126], r: [168, 122], rad: 25, radR: 0.9 },
    wangen: { pts: [[98, 158], [184, 156]], rx: 10, ry: 6 },
    rumpf: [[150, 170], [184, 184], [198, 216], [190, 250], [162, 270], [126, 266], [104, 242], [104, 206], [120, 180]],
    bauch: [[152, 188], [174, 196], [182, 222], [176, 250], [158, 262], [146, 238], [144, 208]],
    schwanz: [[132, 256], [116, 278], [92, 282], [78, 266], [86, 248], [104, 252], [100, 264]],
    schwanzB: [32, 9],
    armL: [[120, 200], [110, 211], [106, 226]], armB: [16, 25],
    anker: { hals: [150, 176], stirn: [138, 92], brust: [160, 200], bauch: [160, 232], schulterBreite: 50, umhangUnten: 270 },
  },
  2: {
    kopf: { c: [148, 104], rx: 55, ry: 51 },
    ruessel: 'M184 108 C204 110 222 116 234 120 C250 124 252 146 234 148 C218 150 200 150 184 152 Z',
    spitze: [238, 135], spitzeR: [9, 11],
    augen: { l: [124, 100], r: [170, 96], rad: 22, radR: 0.9 },
    wangen: { pts: [[110, 126], [182, 124]], rx: 9, ry: 5.5 },
    rumpf: [[150, 146], [184, 160], [198, 196], [194, 236], [170, 264], [136, 266], [112, 244], [106, 204], [118, 166]],
    bauch: [[156, 162], [178, 174], [186, 208], [180, 244], [160, 258], [146, 230], [146, 190]],
    schwanz: [[136, 256], [118, 282], [90, 286], [68, 270], [70, 244], [90, 234], [106, 246], [98, 262]],
    schwanzB: [34, 9],
    armL: [[120, 184], [108, 198], [104, 216]], armB: [18, 28],
    zacken: [[114, 112], [84, 124], [104, 142], [74, 158], [100, 176], [70, 194], [98, 210], [80, 228], [108, 236], [122, 200], [122, 140]],
    locke: [[142, 62], [134, 44], [144, 30], [160, 34], [162, 48], [150, 50]],
    anker: { hals: [150, 150], stirn: [142, 70], brust: [162, 180], bauch: [164, 222], schulterBreite: 56, umhangUnten: 266 },
  },
  3: {
    kopf: { c: [150, 100], rx: 54, ry: 49 },
    ruessel: 'M186 104 C208 106 228 112 242 116 C260 120 262 144 242 146 C224 148 204 148 186 150 Z',
    spitze: [246, 131], spitzeR: [10, 12],
    augen: { l: [128, 96], r: [172, 92], rad: 20, radR: 0.9 },
    wangen: { pts: [[113, 122], [185, 120]], rx: 9, ry: 5.5 },
    rumpf: [[150, 140], [190, 154], [206, 196], [200, 240], [176, 268], [134, 270], [108, 248], [100, 204], [112, 160]],
    bauch: [[158, 156], [184, 168], [194, 206], [186, 246], [166, 262], [150, 232], [148, 190]],
    schwanz: [[138, 260], [120, 284], [88, 288], [62, 272], [58, 244], [78, 230], [98, 240], [94, 258]],
    schwanzB: [38, 10],
    armL: [[122, 176], [108, 192], [103, 212]], armB: [19, 31],
    fluegel: [[122, 150], [84, 118], [44, 100], [36, 124], [16, 136], [34, 158], [20, 180], [50, 192], [92, 200], [118, 196]],
    anker: { hals: [152, 146], stirn: [144, 64], brust: [164, 178], bauch: [168, 222], schulterBreite: 60, umhangUnten: 268 },
  },
};

export default function plitsch(ctx, stufe, { ausdruck } = {}) {
  const S = STUFEN[stufe];
  const { pal } = ctx;
  const out = {};

  // --- hinten: Schwanz, Zacken, Flügel
  let hinten = '';
  if (S.fluegel) {
    const rippen = (pts) => [pts[2], pts[4], pts[6]].map((p) => ctx.strich(ctx.P(`M${pts[0][0] - 4} ${pts[0][1] + 20} L${p[0] + (pts[0][0] - p[0]) * 0.15} ${p[1] + (pts[0][1] - p[1]) * 0.15}`), 3, pal.akzentSchatten)).join('');
    const fl = S.fluegel, fr = spiegelPunkte(S.fluegel);
    hinten += ctx.form(ctx.glatt(fl, true, 0.75), { fill: pal.akzentHell, schatten: pal.akzent, versatz: [-8, 6], innen: rippen(fl) });
    hinten += ctx.form(ctx.glatt(fr, true, 0.75), { fill: pal.akzentHell, schatten: pal.akzent, versatz: [8, 6], innen: rippen(fr) });
  }
  if (S.zacken) hinten += ctx.form(ctx.glatt(S.zacken, true, 0.55), { fill: pal.akzent, schatten: pal.akzentSchatten, versatz: [-6, 4] });
  const schwanz = rohr(S.schwanz, S.schwanzB[0], S.schwanzB[1], { schritte: 3 });
  hinten += ctx.form(ctx.glatt(schwanz, true, 0.9), { muster: true, versatz: [6, 7] });
  // Ringe auf dem Schwanz
  hinten += S.schwanz.slice(1, 4).map((p, i) => {
    const q = S.schwanz[i + 2];
    const nx = -(q[1] - p[1]), ny = q[0] - p[0], l = Math.hypot(nx, ny);
    const w = (S.schwanzB[0] - i * 6) * 0.38;
    return ctx.strich(ctx.P(`M${p[0] + (nx / l) * w} ${p[1] + (ny / l) * w} L${p[0] - (nx / l) * w} ${p[1] - (ny / l) * w}`), 2.5, pal.schatten);
  }).join('');
  out.hinten = hinten;

  // --- Rumpf mit Bauchplatte
  const ringe = [0.3, 0.5, 0.7].map((f) => {
    const y = S.bauch[0][1] + (S.bauch[3][1] - S.bauch[0][1]) * f;
    return ctx.strich(ctx.P(`M${S.bauch[6][0] - 6} ${y} Q${S.bauch[2][0] - 14} ${y + 6} ${S.bauch[2][0] + 6} ${y - 2}`), 2.5, pal.hellSchatten);
  }).join('');
  out.rumpf = ctx.form(ctx.glatt(S.rumpf), { muster: true, versatz: [8, 6] }) +
    ctx.form(ctx.glatt(S.bauch), { fill: pal.hell, schatten: pal.hellSchatten, versatz: [6, 0], linie: ctx.lw * 0.6, innen: ringe });

  // --- Kopf
  const K = S.kopf;
  let kopfHinten = '';
  if (stufe === 1) {
    // Blasen-Krönchen
    kopfHinten += [[98, 92, 13], [114, 70, 15], [140, 60, 13]].map(([x, y, r]) =>
      ctx.form(ctx.ell(x, y, r, r), { fill: pal.akzent, schatten: pal.akzentSchatten, versatz: [4, 4] }) +
      `<path d="${ctx.ell(x - r * 0.35, y - r * 0.35, r * 0.25, r * 0.22)}" fill="#ffffff" opacity="0.8"/>`).join('');
  }
  if (S.blaetter) {
    kopfHinten += S.blaetter.map((b) => ctx.form(ctx.glatt(b, true, 0.8), { fill: pal.akzentHell, schatten: pal.akzent, versatz: [0, 5] })).join('');
  }
  if (stufe === 2) {
    kopfHinten += [[104, 82, 11], [120, 62, 12]].map(([x, y, r]) =>
      ctx.form(ctx.ell(x, y, r, r), { fill: pal.akzent, schatten: pal.akzentSchatten, versatz: [4, 4] })).join('');
  }
  out.kopfHinten = kopfHinten;

  // Schnauze nach Referenz (Seepferdchen von vorn): ein rundes Rohr, etwa so dick wie ein Auge, das
  // MITTEN im Gesicht zwischen den Augen ansetzt (Oberkante knapp unter den Augen) und seitlich, leicht
  // nach unten, aus dem Gesicht herausragt. Es liegt VOR dem Kopf wie eine Hunde-/Pferdeschnauze in
  // Dreiviertelansicht; der Mund ist das dunkle „O“ am Rohrende.
  const AL = S.augen.l, AR = S.augen.r, arad = S.augen.rad;
  const neig = ((S.schnauze?.neigung ?? 12) * Math.PI) / 180;
  const dir = [Math.cos(neig), Math.sin(neig)];
  const nor = [-dir[1], dir[0]];
  const hb = arad * 0.72, ht = arad * 0.6; // halbe Dicke am Ansatz / an der Spitze
  const bx = (AL[0] + AR[0]) / 2 - arad * 0.15;
  const by = Math.max(AL[1], AR[1]) + arad * 0.95 + hb * 0.55; // Oberkante schmiegt sich unter das Auge
  const L = K.c[0] + K.rx - bx + arad * (S.schnauze?.ueberstand ?? 1.35); // ragt gut ein Auge weit heraus
  const sp = (t, w) => [bx + dir[0] * L * t + nor[0] * w, by + dir[1] * L * t + nor[1] * w];
  // Ansatz beginnt ein Stück im Gesicht; die Umrisslinie läuft nur über Ober-, Vorder- und Unterkante,
  // am Ansatz gibt es keine Linie – so wächst die Schnauze aus dem Gesicht statt aufgeklebt zu wirken.
  const hmi = (hb + ht) / 2;
  const rohrPfad = ctx.glatt([sp(-0.06, -hb), sp(0.5, -hmi), sp(0.96, -ht), sp(1.0, 0), sp(0.96, ht), sp(0.5, hmi), sp(-0.06, hb)], true, 0.9);
  // Linie setzt erst im vorderen Gesichtsdrittel an (wie in der Referenz), nicht quer über das ganze Gesicht
  const rohrLinie = ctx.glatt([sp(0.3, -(hb * 0.7 + hmi * 0.3)), sp(0.5, -hmi), sp(0.96, -ht), sp(1.0, 0), sp(0.96, ht), sp(0.5, hmi), sp(0.22, hb * 0.78 + hmi * 0.22)], false, 0.9);
  const [sx, sy] = sp(0.86, 0);
  const schnauzeSvg = ctx.form(rohrPfad, { muster: true, versatz: [4, 6], linieD: rohrLinie }) +
    `<path d="${ctx.ell(...sp(0.55, -(hb + ht) * 0.28), L * 0.2, ht * 0.28)}" fill="#ffffff" opacity="0.35"/>`;

  // Mund = Rohröffnung an der Spitze (Ellipse, weil das Rohr leicht zum Betrachter zeigt)
  out.mund = (v) => {
    const auf = { ruf: 1.25, offen: 1.1, o: 1.0, laecheln: 0.8, klein: 0.55, hmm: 0.6, wellig: 0.6, ernst: 0.55 }[v] ?? 0.7;
    let m = `<path d="${ctx.ell(sx, sy, ht * 0.42 * auf, ht * 0.68 * auf)}" fill="#7c1f3c" stroke="${pal.linie}" stroke-width="${ctx.lw * 0.7}"/>`;
    if (['ruf', 'offen'].includes(v)) m += `<path d="${ctx.ell(sx, sy + ht * 0.25, ht * 0.22, ht * 0.2)}" fill="#ff7f9a"/>`;
    if (['laecheln', 'offen', 'ruf'].includes(v)) {
      const a = sp(0.6, ht * 0.9), b = sp(0.9, ht * 0.75);
      m += ctx.strich(ctx.P(`M${a[0]} ${a[1]} Q${(a[0] + b[0]) / 2} ${(a[1] + b[1]) / 2 + ht * 0.45} ${b[0]} ${b[1]}`), ctx.lw * 0.55);
    }
    return schnauzeSvg + m;
  };

  out.kopf = ctx.form(ctx.ell(K.c[0], K.c[1], K.rx, K.ry), { muster: true, versatz: [9, 8] }) +
    `<path d="${ctx.ell(K.c[0] - K.rx * 0.45, K.c[1] - K.ry * 0.62, K.rx * 0.2, K.ry * 0.1)}" fill="#ffffff" opacity="0.45"/>`;

  let oben = '';
  if (S.locke) {
    oben += ctx.form(ctx.glatt(rohr(S.locke, 13, 6, { schritte: 3 }), true, 0.9), { fill: pal.akzent, schatten: pal.akzentSchatten, versatz: [3, 3] });
  }
  if (stufe === 3) {
    const muschel = (cx, cy, g, f, sch) => {
      const d = ctx.P(`M${cx - g} ${cy + g * 0.6} Q${cx - g * 1.25} ${cy - g * 0.6} ${cx} ${cy - g} Q${cx + g * 1.25} ${cy - g * 0.6} ${cx + g} ${cy + g * 0.6} Q${cx} ${cy + g * 0.9} ${cx - g} ${cy + g * 0.6}Z`);
      const rip = [-0.55, 0, 0.55].map((k) => ctx.strich(ctx.P(`M${cx} ${cy + g * 0.6} L${cx + k * g} ${cy - g * 0.55}`), 2.2, sch)).join('');
      return ctx.form(d, { fill: f, schatten: sch, versatz: [3, 3], linie: ctx.lw * 0.8, innen: rip });
    };
    oben += muschel(122, 58, 13, '#ffd3e1', '#f09bb6') + muschel(174, 56, 13, '#ffd3e1', '#f09bb6') + muschel(148, 46, 17, '#fff0c2', '#f2c46b');
  }
  out.kopfOben = oben;



  // --- Arme (Flossenärmchen)
  const arm = (pts) => {
    // weiche Paddelflosse mit geschwungenen Flossenstrahlen
    const e = pts[pts.length - 1], m = pts[1], a0 = pts[0];
    const nx = -(e[1] - a0[1]), ny = e[0] - a0[0], l = Math.hypot(nx, ny) || 1;
    const rip = [-0.28, 0.28].map((k) => {
      const q = [e[0] + (nx / l) * S.armB[1] * k, e[1] + (ny / l) * S.armB[1] * k];
      return ctx.strich(ctx.P(`M${m[0]} ${m[1]} Q${(m[0] + q[0]) / 2 + (nx / l) * k * 6} ${(m[1] + q[1]) / 2 + (ny / l) * k * 6} ${q[0]} ${q[1]}`), 2.2, pal.akzent, ' opacity="0.9"');
    }).join('');
    return ctx.wurstForm(pts, S.armB[0], S.armB[1], { bauch: 4 }, { fill: pal.akzentHell, schatten: pal.akzent, versatz: [4, 4], innen: rip });
  };
  out.armL = arm(S.armL);
  const armR = spiegelPunkte(S.armL);
  out.armR = arm(armR);

  out.anker = {
    ...S.anker,
    kopf: K,
    augen: S.augen,
    mund: { p: [sx, sy], w: arad * 1.2 },
    wangen: S.wangen,
    armBreite: S.armB[1],
    schulterL: S.armL[0], handL: S.armL[S.armL.length - 1],
    schulterR: armR[0], handR: armR[armR.length - 1],
    brille: { band: 1.0 },
    hut: { hoehe: 0.62, dx: -4 },
  };
  return out;
}
