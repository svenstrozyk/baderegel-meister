// Große, glänzende Anime-Augen und Münder – für alle Arten gleich gebaut.

const r1 = (v) => Math.round(v * 10) / 10;

/**
 * Ein Auge. (x,y,r) in Entwurfskoordinaten. variante: offen|zu|froh|gross
 * blick: [dx,dy] Verschiebung der Iris in Anteilen von r. spiegel: 1 = rechtes Auge
 */
export function auge(ctx, x, y, r, variante = 'offen', blick = [0, 0], seite = -1) {
  const { pal } = ctx;
  const lw = ctx.lw;
  if (variante === 'zu') {
    return ctx.strich(ctx.P(`M${x - r * 0.72} ${y + r * 0.05} Q${x} ${y + r * 0.6} ${x + r * 0.72} ${y + r * 0.05}`), lw * 0.95) +
      ctx.strich(ctx.P(`M${x + seite * r * 0.7} ${y + r * 0.08} L${x + seite * r * 0.95} ${y - r * 0.12}`), lw * 0.7);
  }
  if (variante === 'froh') {
    return ctx.strich(ctx.P(`M${x - r * 0.7} ${y + r * 0.25} Q${x} ${y - r * 0.75} ${x + r * 0.7} ${y + r * 0.25}`), lw * 1.05);
  }
  const gross = variante === 'gross';
  const sx = r * (gross ? 0.86 : 0.8), sy = r * (gross ? 1.08 : 1);
  const irx = r * (gross ? 0.44 : 0.62), iry = r * (gross ? 0.56 : 0.8);
  const bx = x + blick[0] * r, by = y + r * (gross ? 0.05 : 0.14) + blick[1] * r;
  const sklera = ctx.ell(x, y, sx, sy);
  const clipId = ctx.neu('a');
  const [hx, hy] = [bx - irx * 0.36, by - iry * 0.42];
  return `<clipPath id="${clipId}"><path d="${sklera}"/></clipPath>` +
    `<path d="${sklera}" fill="#ffffff"/>` +
    `<g clip-path="url(#${clipId})"><g data-teil="blick">` +
    `<path d="${ctx.ell(bx, by, irx, iry)}" fill="${pal.iris}"/>` +
    `<path d="${ctx.ell(bx, by + iry * 0.42, irx * 0.72, iry * 0.4)}" fill="${pal.irisHell}"/>` +
    `<path d="${ctx.ell(bx, by - iry * 0.05, irx * 0.46, iry * 0.52)}" fill="#0f0f22"/>` +
    `<path d="${ctx.ell(hx, hy, r * 0.25, r * 0.28)}" fill="#ffffff"/>` +
    `<path d="${ctx.ell(bx + irx * 0.4, by + iry * 0.45, r * 0.11, r * 0.11)}" fill="#ffffff"/>` +
    `</g><path d="${ctx.ell(x, y - sy * 0.95, sx * 1.2, sy * 0.28)}" fill="${pal.linie}" opacity="0.18"/>` +
    `</g>` +
    `<path d="${sklera}" fill="none" stroke="${pal.linie}" stroke-width="${r1(lw * 0.55)}"/>` +
    // kräftiger Oberlid-Strich mit kleiner Wimper außen
    ctx.strich(ctx.P(`M${x - sx * 1.02} ${y - sy * 0.12} C${x - sx * 0.9} ${y - sy * 1.2} ${x + sx * 0.9} ${y - sy * 1.2} ${x + sx * 1.02} ${y - sy * 0.12}`), lw * 1.05) +
    ctx.strich(ctx.P(`M${x + seite * sx * 0.98} ${y - sy * 0.35} L${x + seite * sx * 1.28} ${y - sy * 0.62}`), lw * 0.75);
}

/** Mund. variante: laecheln|offen|o|ruf|klein|hmm|wellig|ernst */
export function mund(ctx, x, y, w, variante = 'laecheln') {
  const { pal } = ctx;
  const lw = ctx.lw * 0.75;
  const innen = '#7c1f3c', zunge = '#ff7f9a';
  switch (variante) {
    case 'offen': {
      const d = ctx.P(`M${x - w / 2} ${y - w * 0.05} Q${x} ${y - w * 0.12} ${x + w / 2} ${y - w * 0.05} Q${x + w * 0.42} ${y + w * 0.75} ${x} ${y + w * 0.75} Q${x - w * 0.42} ${y + w * 0.75} ${x - w / 2} ${y - w * 0.05}Z`);
      const id = ctx.neu('m');
      return `<clipPath id="${id}"><path d="${d}"/></clipPath><path d="${d}" fill="${innen}"/>` +
        `<g clip-path="url(#${id})"><path d="${ctx.ell(x, y + w * 0.78, w * 0.32, w * 0.28)}" fill="${zunge}"/></g>` +
        `<path d="${d}" fill="none" stroke="${pal.linie}" stroke-width="${lw}" stroke-linejoin="round"/>`;
    }
    case 'o':
      return `<path d="${ctx.ell(x, y + w * 0.18, w * 0.2, w * 0.26)}" fill="${innen}" stroke="${pal.linie}" stroke-width="${lw}"/>`;
    case 'ruf': {
      const d = ctx.ell(x, y + w * 0.25, w * 0.3, w * 0.38);
      return `<path d="${d}" fill="${innen}" stroke="${pal.linie}" stroke-width="${lw}"/>` +
        `<path d="${ctx.ell(x, y + w * 0.45, w * 0.18, w * 0.14)}" fill="${zunge}"/>`;
    }
    case 'klein':
      return ctx.strich(ctx.P(`M${x - w * 0.22} ${y} Q${x} ${y + w * 0.2} ${x + w * 0.22} ${y}`), lw);
    case 'hmm':
      return ctx.strich(ctx.P(`M${x - w * 0.3} ${y + w * 0.08} Q${x} ${y + w * 0.02} ${x + w * 0.3} ${y - w * 0.1}`), lw);
    case 'wellig':
      return ctx.strich(ctx.P(`M${x - w * 0.36} ${y + w * 0.08} Q${x - w * 0.18} ${y - w * 0.1} ${x} ${y + w * 0.06} Q${x + w * 0.18} ${y + w * 0.2} ${x + w * 0.36} ${y}`), lw);
    case 'ernst':
      return ctx.strich(ctx.P(`M${x - w * 0.28} ${y + w * 0.06} Q${x} ${y - w * 0.02} ${x + w * 0.28} ${y + w * 0.06}`), lw);
    default:
      return ctx.strich(ctx.P(`M${x - w * 0.4} ${y} Q${x} ${y + w * 0.45} ${x + w * 0.4} ${y}`), lw);
  }
}

export function wangen(ctx, pts, rx, ry) {
  return pts.map(([x, y]) => `<path d="${ctx.ell(x, y, rx, ry)}" fill="${ctx.pal.wange}" opacity="0.45"/>`).join('');
}
