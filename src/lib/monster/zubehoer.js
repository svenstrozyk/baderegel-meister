// Zubehör, das sich an den Ankern jeder Art ausrichtet. Keine Schwimmflügel/-ringe (Regel 9).
import { istWarm } from './palette.js';

const TUCH = '#fff6df', TUCH_SCHATTEN = '#e9d6b0';
const STROH = '#ffd46b', STROH_SCHATTEN = '#e5aa3f';

function kontrast(pal) {
  return istWarm(pal.haupt) ? { f: '#3d8bff', s: '#2a63c4' } : { f: '#ff5d8f', s: '#d63d6f' };
}

/** Punkt auf Ellipsenrand bei Höhe y (links/rechts) */
function randX(c, rx, ry, y) {
  const t = Math.max(0, 1 - ((y - c[1]) / ry) ** 2);
  return rx * Math.sqrt(t);
}

export function badekappe(ctx, A) {
  const { c, rx, ry } = A.kopf;
  const R = A.kappe ?? {};
  const krx = rx * (R.fx ?? 1.06), kry = ry * (R.fy ?? 1.08);
  const cy = c[1] + (R.dy ?? 0);
  const augenOben = Math.min(A.augen.l[1], A.augen.r[1]) - A.augen.rad * 1.25;
  const y0 = Math.min(cy - kry * (R.hoehe ?? 0.22), augenOben - kry * 0.1);
  const w = randX([c[0], cy], krx, kry, y0);
  const k = kontrast(ctx.pal);
  const d = ctx.P(`M${c[0] - w} ${y0} A${krx} ${kry} 0 0 1 ${c[0] + w} ${y0} Q${c[0]} ${y0 + kry * 0.16} ${c[0] - w} ${y0}Z`);
  const y1 = y0 - kry * 0.28;
  const w1 = randX([c[0], cy], krx, kry, y1);
  const streifen = ctx.strich(ctx.P(`M${c[0] - w1 * 0.97} ${y1} Q${c[0]} ${y1 + kry * 0.14} ${c[0] + w1 * 0.97} ${y1}`), ctx.n(9), '#ffffff', ' opacity="0.9"');
  return ctx.form(d, { fill: k.f, schatten: k.s, versatz: [6, 5], innen: streifen }) +
    `<path d="${ctx.ell(c[0] - krx * 0.35, cy - kry * 0.78, krx * 0.16, kry * 0.07)}" fill="#ffffff" opacity="0.55"/>`;
}

export function sonnenhut(ctx, A) {
  const { c, rx, ry } = A.kopf;
  const H = A.hut ?? {};
  const yb = c[1] - ry * (H.hoehe ?? 0.6);
  const cx = c[0] + (H.dx ?? 0);
  const brx = rx * (H.krempe ?? 1.5), bry = rx * 0.3;
  const krone = ctx.P(`M${cx - rx * 0.7} ${yb} C${cx - rx * 0.72} ${yb - ry * 0.95} ${cx + rx * 0.72} ${yb - ry * 0.95} ${cx + rx * 0.7} ${yb}Z`);
  const band = ctx.P(`M${cx - rx * 0.71} ${yb - ry * 0.02} C${cx - rx * 0.71} ${yb - ry * 0.24} ${cx + rx * 0.71} ${yb - ry * 0.24} ${cx + rx * 0.71} ${yb - ry * 0.02} Q${cx} ${yb + ry * 0.1} ${cx - rx * 0.71} ${yb - ry * 0.02}Z`);
  const [ox, oy] = ctx.m(cx, yb);
  return `<g transform="rotate(-9 ${ox} ${oy})">` +
    ctx.form(ctx.ell(cx, yb, brx, bry), { fill: STROH, schatten: STROH_SCHATTEN, versatz: [0, -6] }) +
    ctx.strich(ctx.P(`M${cx - brx * 0.8} ${yb + bry * 0.15} Q${cx} ${yb + bry * 0.95} ${cx + brx * 0.8} ${yb + bry * 0.15}`), 2, STROH_SCHATTEN) +
    ctx.form(krone, { fill: STROH, schatten: STROH_SCHATTEN, versatz: [8, 0] }) +
    ctx.form(band, { fill: ctx.pal.akzent, schatten: ctx.pal.akzentSchatten, linie: ctx.lw * 0.7 }) +
    `<path d="${ctx.ell(cx + rx * 0.62, yb - ry * 0.1, rx * 0.16, rx * 0.13)}" fill="#ffffff" stroke="${ctx.pal.linie}" stroke-width="2.5"/>` +
    `<path d="${ctx.ell(cx + rx * 0.62, yb - ry * 0.1, rx * 0.05, rx * 0.05)}" fill="#ffc83a"/>` +
    `</g>`;
}

export function taucherbrille(ctx, A) {
  const { c, rx } = A.kopf;
  const { l, r, rad } = A.augen;
  const B = A.brille ?? {};
  const k = kontrast(ctx.pal);
  const ey = (l[1] + r[1]) / 2 + rad * 0.05;
  const band = ctx.strich(ctx.P(`M${c[0] - rx * (B.band ?? 1.0)} ${ey + rad * 0.2} Q${c[0]} ${ey - rad * 0.5} ${c[0] + rx * (B.band ?? 1.0)} ${ey + rad * 0.2}`), ctx.n(12), '#2d3c5e') ;
  const glas = (p, gr) => {
    const w = gr * 1.25, h = gr * 1.3;
    const d = ctx.P(`M${p[0] - w} ${p[1]} C${p[0] - w} ${p[1] - h * 1.1} ${p[0] + w} ${p[1] - h * 1.1} ${p[0] + w} ${p[1]} C${p[0] + w} ${p[1] + h * 1.05} ${p[0] - w} ${p[1] + h * 1.05} ${p[0] - w} ${p[1]}Z`);
    return `<path d="${d}" fill="#c9f6ff" fill-opacity="0.32" stroke="${ctx.pal.linie}" stroke-width="${ctx.n(7.5) + 4}"/>` +
      `<path d="${d}" fill="none" stroke="${k.f}" stroke-width="${ctx.n(7.5)}"/>` +
      ctx.strich(ctx.P(`M${p[0] - w * 0.55} ${p[1] - h * 0.2} L${p[0] - w * 0.1} ${p[1] - h * 0.62}`), ctx.n(4), '#ffffff', ' opacity="0.8"');
  };
  const gl = rad * (A.augen.radL ?? 1), gr = rad * (A.augen.radR ?? 1);
  const bruecke = ctx.strich(ctx.P(`M${l[0] + gl * 1.2} ${l[1] - rad * 0.2} Q${(l[0] + r[0]) / 2} ${ey - rad * 0.55} ${r[0] - gr * 1.2} ${r[1] - rad * 0.2}`), ctx.n(7), k.s);
  return { hinten: band, vorne: bruecke + glas(l, gl) + glas(r, gr) };
}

export function handtuchUmhang(ctx, A) {
  const [hx, hy] = A.hals;
  const sb = A.schulterBreite;
  const unten = A.umhangUnten;
  const k = kontrast(ctx.pal);
  const pts = [
    [hx - sb * 0.45, hy - 4], [hx + sb * 0.45, hy - 4],
    [hx + sb * 1.05, hy + (unten - hy) * 0.45], [hx + sb * 1.4, unten],
    [hx + sb * 0.6, unten + 7], [hx, unten - 2], [hx - sb * 0.6, unten + 7],
    [hx - sb * 1.4, unten], [hx - sb * 1.05, hy + (unten - hy) * 0.45],
  ];
  const d = ctx.glatt(pts, true, 0.7);
  const streifen = [0.8, 0.9].map((f) => {
    const y = hy + (unten - hy) * f;
    return ctx.strich(ctx.P(`M${hx - sb * 1.6} ${y} Q${hx} ${y + 10} ${hx + sb * 1.6} ${y}`), ctx.n(7), k.f);
  }).join('');
  const hinten = ctx.form(d, { fill: TUCH, schatten: TUCH_SCHATTEN, versatz: [10, 0], innen: streifen });
  // Knoten vorne am Hals
  const zipfel = (f) => ctx.form(ctx.glatt([[hx + f * 4, hy - 2], [hx + f * sb * 0.42, hy + 2], [hx + f * sb * 0.3, hy + sb * 0.5], [hx + f * 8, hy + 12]], true, 0.8),
    { fill: TUCH, schatten: TUCH_SCHATTEN, versatz: [0, 5], linie: ctx.lw * 0.8 });
  const knoten = `<path d="${ctx.ell(hx, hy + 5, sb * 0.14, sb * 0.12)}" fill="${k.f}" stroke="${ctx.pal.linie}" stroke-width="${ctx.lw * 0.7}"/>`;
  return { hinten, vorne: zipfel(-1) + zipfel(1) + knoten };
}

export function rettungspfeife(ctx, A) {
  const [hx, hy] = A.hals;
  const [bx, by] = A.pfeife ?? A.brust;
  const sb = A.schulterBreite;
  const schnur = ctx.strich(ctx.P(`M${hx - sb * 0.36} ${hy - 2} Q${hx - sb * 0.3} ${by - 4} ${bx - 3} ${by - 13}`), ctx.n(4.5) + 1.5, '#ffffff') +
    ctx.strich(ctx.P(`M${hx + sb * 0.36} ${hy - 2} Q${hx + sb * 0.3} ${by - 4} ${bx + 3} ${by - 13}`), ctx.n(4.5) + 1.5, '#ffffff');
  const schnurRand = schnur.replaceAll('stroke="#ffffff"', `stroke="${ctx.pal.linie}"`).replace(/stroke-width="([\d.]+)"/g, (_, w) => `stroke-width="${+w + 3}"`);
  const koerper = ctx.P(`M${bx - 11} ${by - 4} C${bx - 11} ${by - 16} ${bx + 9} ${by - 16} ${bx + 10} ${by - 7} L${bx + 22} ${by - 8} L${bx + 22} ${by + 1} L${bx + 9} ${by + 3} C${bx + 7} ${by + 9} ${bx - 11} ${by + 9} ${bx - 11} ${by - 4}Z`);
  return schnurRand + schnur +
    ctx.form(koerper, { fill: '#ff7a1a', schatten: '#d9540a', versatz: [3, 3], linie: ctx.lw * 0.8 }) +
    `<path d="${ctx.ell(bx - 1, by - 3, 4, 4)}" fill="#7a2a00"/>` +
    `<path d="${ctx.ell(bx, by - 13, 3.5, 3)}" fill="none" stroke="${ctx.pal.linie}" stroke-width="2.5"/>`;
}
