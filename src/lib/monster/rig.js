// Baut das komplette Monster-SVG (als String) aus Art, Stufe, Farbe, Muster, Zubehör und Pose.
// Gemeinsames Rig (data-teil): ganz > koerper > [schwanz, kopf > [augen > blick, mund], arm_links, arm_rechts, blasen]
// arm_links = Arm auf der linken Bildseite (aus Sicht des Betrachters).
import { palette } from './palette.js';
import { erzeugeKontext } from './geo.js';
import { auge, mund, wangen } from './gesicht.js';
import { musterDef } from './muster.js';
import { AUSDRUCK, poseCss, armEbenen } from './posen.js';
import * as Z from './zubehoer.js';
import plitsch from './arten/plitsch.js';
import blubbo from './arten/blubbo.js';
import kiesel from './arten/kiesel.js';
import pingo from './arten/pingo.js';
import tinti from './arten/tinti.js';

export const ARTEN = { plitsch, blubbo, kiesel, pingo, tinti };
export const STUFEN_SKALA = { 1: 0.66, 2: 0.83, 3: 1 };

export function baueMonster({ art = 'plitsch', stufe = 1, farbe = 'meerblau', muster = 'keins', zubehoer = [], pose = 'stehen' }, uid = 'wm') {
  const zeichne = ARTEN[art] ?? plitsch;
  stufe = [1, 2, 3].includes(+stufe) ? +stufe : 1;
  const pal = palette(farbe);
  const s = STUFEN_SKALA[stufe];
  const ctx = erzeugeKontext({ s, uid, pal, linie: stufe === 1 ? 4.2 : stufe === 2 ? 4.6 : 5 });
  const defs = muster && muster !== 'keins' ? musterDef(`${uid}-muster`, muster, pal) : '';
  if (defs) ctx.musterId = `${uid}-muster`;

  const ausdruck = AUSDRUCK[pose] ?? AUSDRUCK.stehen;
  const t = zeichne(ctx, stufe, { pose, ausdruck, zubehoer });
  const A = t.anker;
  const hat = (z) => zubehoer.includes(z);

  // Gesicht
  const { l, r, rad } = A.augen;
  const augen = auge(ctx, l[0], l[1], rad * (A.augen.radL ?? 1), ausdruck.augen, ausdruck.blick, -1) +
    auge(ctx, r[0], r[1], rad * (A.augen.radR ?? 1), ausdruck.augen, ausdruck.blick, 1);
  const mundSvg = t.mund ? t.mund(ausdruck.mund) : mund(ctx, A.mund.p[0], A.mund.p[1], A.mund.w, ausdruck.mund);
  const wangenSvg = A.wangen ? wangen(ctx, A.wangen.pts, A.wangen.rx, A.wangen.ry) : '';

  // Zubehör
  const brille = hat('taucherbrille') ? Z.taucherbrille(ctx, A) : null;
  const umhang = hat('handtuch_umhang') ? Z.handtuchUmhang(ctx, A) : null;
  const kappe = hat('badekappe') ? Z.badekappe(ctx, A) : '';
  const hut = hat('sonnenhut') ? Z.sonnenhut(ctx, A) : '';
  const pfeife = hat('rettungspfeife') ? Z.rettungspfeife(ctx, A, hat('handtuch_umhang')) : '';

  // Schlafblasen
  const blasen = pose === 'schlafen'
    ? `<g data-teil="blasen">${[[0.95, -0.55, 6], [1.2, -0.95, 9], [1.55, -1.4, 12]].map(([fx, fy, br]) =>
      `<path d="${ctx.ell(A.kopf.c[0] + A.kopf.rx * fx, A.kopf.c[1] + A.kopf.ry * fy, br, br)}" fill="#e8fbff" fill-opacity="0.75" stroke="${pal.linie}" stroke-width="2.5"/>` +
      `<path d="${ctx.ell(A.kopf.c[0] + A.kopf.rx * fx - br * 0.35, A.kopf.c[1] + A.kopf.ry * fy - br * 0.35, br * 0.25, br * 0.25)}" fill="#ffffff"/>`).join('')}</g>`
    : '';

  // Arme je Pose in die passende Ebene: 'mitte' (vor Rumpf, hinter Kopf) oder 'vorn' (vor dem Gesicht)
  const ebenen = armEbenen(pose, t.armEbene ?? 'vorn');
  const armSlot = (ebene) =>
    (ebenen.arm_links === ebene ? `<g data-teil="arm_links">${t.armL ?? ''}</g>` : '') +
    (ebenen.arm_rechts === ebene ? `<g data-teil="arm_rechts">${t.armR ?? ''}</g>` : '');

  const svgInnen =
    `<g data-teil="ganz"><g data-teil="koerper">` +
    (umhang && !t.eigenerUmhang ? umhang.hinten : '') +
    `<g data-teil="schwanz">${t.hinten ?? ''}</g>` +
    (t.rumpf ?? '') +
    (umhang && !t.eigenerUmhang ? umhang.vorne : '') +
    (t.vorneRumpf ?? '') +
    pfeife +
    armSlot('mitte') +
    `<g data-teil="kopf">${t.kopfHinten ?? ''}${brille ? brille.hinten : ''}${t.kopf ?? ''}${wangenSvg}` +
    `<g data-teil="augen">${augen}</g><g data-teil="mund">${mundSvg}</g>` +
    `${t.kopfVorne ?? ''}${brille ? brille.vorne : ''}${kappe}${t.kopfOben ?? ''}${hut}</g>` +
    armSlot('vorn') +
    (t.vorne ?? '') +
    blasen +
    `</g></g>`;

  // Anker in viewBox-Koordinaten für die Posen
  const m = (p) => ctx.m(p[0], p[1]);
  const PA = {
    boden: [150, 288], hals: m(A.hals), kopfC: m(A.kopf.c), kopfRx: ctx.n(A.kopf.rx), kopfRy: ctx.n(A.kopf.ry),
    augeL: m(l), augeR: m(r), augeRad: ctx.n(rad), mund: m(A.mund.p), mundW: ctx.n(A.mund.w),
    stirn: m(A.stirn), brust: m(A.brust), bauch: m(A.bauch),
    schulterL: m(A.schulterL), schulterR: m(A.schulterR), handL: m(A.handL), handR: m(A.handR),
    blasen: m([A.kopf.c[0] + A.kopf.rx, A.kopf.c[1] - A.kopf.ry * 0.6]),
    kopfRy: ctx.n(A.kopf.ry), armHalbe: ctx.n((A.armBreite ?? 20) / 2),
    armSpitze: Math.max(1.15, Math.hypot(A.armSpitze?.[0] - A.schulterR[0], A.armSpitze?.[1] - A.schulterR[1]) / Math.hypot(A.handR[0] - A.schulterR[0], A.handR[1] - A.schulterR[1]) || 0),
  };
  const schluessel = `wm-${art}${stufe}-${pose}`;
  const css = poseCss(schluessel, pose, PA);
  return { schluessel, css, defs, innen: svgInnen };
}

/** Komplettes, eigenständiges SVG (z. B. für Export/Vorschau) */
export function monsterSvg(props, uid = 'wm', { mitCss = true, groesse = 300 } = {}) {
  const b = baueMonster(props, uid);
  return `<svg xmlns="http://www.w3.org/2000/svg" class="wm ${b.schluessel}" viewBox="0 0 300 300" width="${groesse}" height="${groesse}" overflow="visible">` +
    (mitCss ? `<style>${b.css}</style>` : '') + `<defs>${b.defs}</defs>${b.innen}</svg>`;
}
