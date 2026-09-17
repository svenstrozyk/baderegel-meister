// Muster-Kacheln (punkte | streifen | sterne). Werden per clipPath nur auf Körperflächen gelegt.

function stern(cx, cy, ra, ri) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? ri : ra;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    d += (i ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(1) + ' ' + (cy + Math.sin(a) * r).toFixed(1);
  }
  return d + 'Z';
}

export function musterDef(id, art, pal) {
  const f = pal.muster;
  if (art === 'punkte') {
    return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="28" height="28" patternTransform="rotate(-12)">` +
      `<circle cx="7" cy="7" r="5" fill="${f}" opacity="0.75"/><circle cx="21" cy="21" r="3.6" fill="${f}" opacity="0.75"/></pattern>`;
  }
  if (art === 'streifen') {
    return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="24" height="24" patternTransform="rotate(-25)">` +
      `<rect x="0" y="0" width="24" height="9" fill="${f}" opacity="0.6"/></pattern>`;
  }
  if (art === 'sterne') {
    return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="34" height="34" patternTransform="rotate(8)">` +
      `<path d="${stern(10, 10, 7.5, 3.3)}" fill="${f}" opacity="0.8" stroke-linejoin="round"/>` +
      `<path d="${stern(26, 26, 4.5, 2)}" fill="${f}" opacity="0.8"/></pattern>`;
  }
  return '';
}

export { stern };
